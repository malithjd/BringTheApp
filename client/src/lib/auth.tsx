import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthResult {
  error: AuthError | null;
}

interface AuthContextValue {
  user: User | null | undefined; // undefined = loading, null = logged out
  passwordRecovery: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (newPassword: string) => Promise<AuthResult>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) { setUser(null); return; }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
        setUser(session?.user ?? null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email: string, password: string) =>
    requireSupabase().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

  const signIn = (email: string, password: string) =>
    requireSupabase().auth.signInWithPassword({ email, password });

  const signOut = () => requireSupabase().auth.signOut();

  const forgotPassword = (email: string) =>
    requireSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });

  const resetPassword = (newPassword: string) =>
    requireSupabase().auth.updateUser({ password: newPassword });

  const clearPasswordRecovery = () => setPasswordRecovery(false);

  return (
    <AuthContext.Provider value={{
      user, passwordRecovery,
      signUp, signIn, signOut,
      forgotPassword, resetPassword, clearPasswordRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
