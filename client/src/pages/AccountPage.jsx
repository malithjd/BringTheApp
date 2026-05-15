import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

function Section({ title, children }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-text2 uppercase tracking-widest mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-text2 mb-1">{label}</p>
      <p className="text-sm text-text font-medium">{value}</p>
    </div>
  );
}

export default function AccountPage({ onGoHome }) {
  const { user, signOut, resetPassword, clearPasswordRecovery, passwordRecovery } = useAuth();

  // Password reset form (shown when arriving via recovery email)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState(null);

  // Delete account flow
  const [deleteStep, setDeleteStep] = useState(null); // null | 'confirm' | 'loading' | 'done'
  const [deleteError, setDeleteError] = useState(null);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setResetStatus({ error: 'Passwords do not match' });
      return;
    }
    setResetStatus('loading');
    const { error } = await resetPassword(newPassword);
    if (error) {
      setResetStatus({ error: error.message });
    } else {
      setResetStatus('success');
      clearPasswordRecovery();
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteStep('loading');
    setDeleteError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Deletion failed');
      setDeleteStep('done');
      await signOut();
      onGoHome();
    } catch (err) {
      setDeleteError(err.message);
      setDeleteStep('confirm');
    }
  };

  if (!user) return null;

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-up py-2">
      <div>
        <h1 className="text-2xl font-bold text-text">Account</h1>
        <p className="text-sm text-text2 mt-1">Manage your profile and subscription</p>
      </div>

      {/* Password recovery banner */}
      {passwordRecovery && (
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6">
          <h2 className="text-base font-bold text-text mb-1">Set a new password</h2>
          <p className="text-sm text-text2 mb-5">You followed a password reset link — choose a new password below.</p>
          {resetStatus === 'success' ? (
            <div className="flex items-center gap-2 text-green text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Password updated successfully.
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="New password (min 6 chars)"
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text2/50 focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text2/50 focus:outline-none focus:border-accent transition-colors"
              />
              {resetStatus?.error && (
                <p className="text-red text-xs">{resetStatus.error}</p>
              )}
              <button
                type="submit"
                disabled={resetStatus === 'loading'}
                className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60"
              >
                {resetStatus === 'loading' ? 'Saving...' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Profile */}
      <Section title="Profile">
        <div className="space-y-4">
          <Field label="Email address" value={user.email} />
          <Field label="Member since" value={joinedDate} />
        </div>
      </Section>

      {/* Subscription */}
      <Section title="Subscription">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text">Free Plan</p>
            <p className="text-xs text-text2 mt-0.5">Up to 5 saved reports · Side-by-side comparison</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            Active
          </span>
        </div>
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-xs text-text2 mb-3">Pro plan with unlimited reports and priority analysis — coming soon.</p>
          <button
            disabled
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-border text-text2 cursor-not-allowed opacity-50"
          >
            Upgrade to Pro
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone">
        <p className="text-sm text-text2 mb-5">
          Permanently delete your account and all saved reports. This cannot be undone.
        </p>

        {deleteStep === null && (
          <button
            onClick={() => setDeleteStep('confirm')}
            className="px-4 py-2 text-sm font-semibold text-red border border-red/30 rounded-lg hover:bg-red/8 transition-colors"
          >
            Delete account
          </button>
        )}

        {deleteStep === 'confirm' && (
          <div className="bg-red/8 border border-red/20 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-text">Are you absolutely sure?</p>
            <p className="text-xs text-text2">
              Your account, email <span className="text-text">{user.email}</span>, and all saved reports will be permanently removed.
            </p>
            {deleteError && <p className="text-xs text-red">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-bold text-white bg-red rounded-lg hover:opacity-90 transition-opacity"
              >
                Yes, delete everything
              </button>
              <button
                onClick={() => { setDeleteStep(null); setDeleteError(null); }}
                className="px-4 py-2 text-sm text-text2 hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {deleteStep === 'loading' && (
          <div className="flex items-center gap-2 text-text2 text-sm">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Deleting account…
          </div>
        )}
      </Section>
    </div>
  );
}
