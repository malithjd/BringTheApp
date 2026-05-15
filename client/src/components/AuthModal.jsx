import { useState } from 'react';
import { useAuth } from '../lib/auth';

export default function AuthModal({ onClose }) {
  const { signIn, signUp, forgotPassword } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | { error }
  const [confirmSent, setConfirmSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const switchMode = (next) => { setMode(next); setStatus(null); };

  const handle = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      if (mode === 'forgot') {
        const { error } = await forgotPassword(email);
        if (error) throw error;
        setResetSent(true);
        setStatus('success');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setConfirmSent(true);
        setStatus('success');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setStatus({ error: err.message });
    }
  };

  const Spinner = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl animate-fade-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-text2 hover:text-text transition-colors" aria-label="Close">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-text mb-1">
          {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'}
        </h2>
        <p className="text-text2 text-sm mb-6">
          {mode === 'signin' && 'Access your saved deal reports.'}
          {mode === 'signup' && 'Save up to 5 deal reports and compare side by side.'}
          {mode === 'forgot' && "Enter your email and we'll send a reset link."}
        </p>

        {/* Success states */}
        {confirmSent && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green/10 border border-green/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-text font-semibold mb-1">Check your email</p>
            <p className="text-text2 text-sm">Confirmation link sent to <span className="text-text">{email}</span></p>
          </div>
        )}

        {resetSent && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-text font-semibold mb-1">Reset link sent</p>
            <p className="text-text2 text-sm">Check <span className="text-text">{email}</span> for the password reset link.</p>
          </div>
        )}

        {!confirmSent && !resetSent && (
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text2 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text2/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-text2">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text2/50 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            )}

            {status?.error && (
              <p className="text-red text-xs bg-red/8 border border-red/20 rounded-lg px-3 py-2">
                {status.error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 bg-accent text-white font-semibold rounded-lg text-sm hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <><Spinner />{mode === 'forgot' ? 'Sending...' : mode === 'signin' ? 'Signing in...' : 'Creating account...'}</>
              ) : mode === 'forgot' ? 'Send reset link' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-text2 mt-4 space-y-1">
          {mode === 'forgot' ? (
            <button onClick={() => switchMode('signin')} className="text-accent hover:text-accent-hover font-medium transition-colors">
              ← Back to sign in
            </button>
          ) : !confirmSent && (
            <p>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-accent hover:text-accent-hover font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
