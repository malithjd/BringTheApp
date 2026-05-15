import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) { setUser(null); return; }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
        setUser(session?.user ?? null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email, password) =>
    supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const forgotPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });

  const resetPassword = (newPassword) =>
    supabase.auth.updateUser({ password: newPassword });

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

export const useAuth = () => useContext(AuthContext);
