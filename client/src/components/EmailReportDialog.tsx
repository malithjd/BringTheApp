import { useState, useEffect, useRef, type FormEvent } from 'react';
import { emailReport } from '../lib/api';
import type { DealAnalysisResponse } from '../types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

type Status = 'sending' | 'sent' | { error: string } | null;

interface EmailReportDialogProps {
  result: DealAnalysisResponse;
  defaultEmail?: string;
  onClose: () => void;
}

export default function EmailReportDialog({ result, defaultEmail = '', onClose }: EmailReportDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<Status>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const statusError = status && typeof status === 'object' ? status.error : null;

  // Store previously focused element, focus the email input on open
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const focusable = modalRef.current?.querySelector<HTMLElement>('input:not([disabled]), button:not([disabled])');
    focusable?.focus();
    return () => { previousFocusRef.current?.focus(); };
  }, []);

  // ESC key + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const valid = EMAIL_RE.test(email.trim());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) { setStatus({ error: 'Please enter a valid email address.' }); return; }
    setStatus('sending');
    try {
      await emailReport(result, email.trim());
      setStatus('sent');
    } catch (err) {
      setStatus({ error: err instanceof Error ? err.message : 'Failed to send. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 'var(--z-modal)' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-report-title"
        className="relative w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl animate-fade-up"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text2 hover:text-text transition-colors"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5" aria-hidden="true">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        {status === 'sent' ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green/10 border border-green/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-text font-semibold mb-1">Report sent</p>
            <p className="text-text2 text-sm mb-5">Your PDF report is on its way to <span className="text-text">{email.trim()}</span>.</p>
            <button
              onClick={onClose}
              className="btn-primary w-full py-2.5 bg-accent text-ink font-semibold rounded-lg text-sm hover:bg-accent-hover"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 id="email-report-title" className="text-lg font-bold text-text mb-1">Email your report</h2>
            <p className="text-text2 text-sm mb-6">We'll send the full PDF analysis as an attachment. Confirm or change the address below.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email-report-input" className="block text-xs font-medium text-text2 mb-1.5">Email</label>
                <input
                  id="email-report-input"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (status && status !== 'sending') setStatus(null); }}
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-text2 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {statusError && (
                <p role="alert" className="text-red text-xs bg-red/8 border border-red/20 rounded-lg px-3 py-2">
                  {statusError}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending' || !valid}
                className="btn-primary w-full py-2.5 bg-accent text-ink font-semibold rounded-lg text-sm hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'sending' ? (<><Spinner />Sending...</>) : 'Send report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
