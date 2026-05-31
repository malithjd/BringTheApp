import { useState, useEffect, useRef } from 'react';
import { fetchReports, deleteReport, MAX_REPORTS } from '../lib/reports';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ScoreBadge({ score }) {
  const color = score >= 70 ? 'text-green bg-green/10 border-green/20'
    : score >= 45 ? 'text-amber bg-amber/10 border-amber/20'
    : 'text-red bg-red/10 border-red/20';
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-bold tabular-nums flex-shrink-0 ${color}`}>
      {score}
    </span>
  );
}

export default function SavedReports({ onLoad, onCompare, onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState([]); // for compare mode (max 2)

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const focusable = modalRef.current?.querySelector('button:not([disabled]), input:not([disabled])');
    focusable?.focus();
    return () => { previousFocusRef.current?.focus(); };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        modalRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteReport(id);
      setReports(r => r.filter(x => x.id !== id));
      setSelected(s => s.filter(x => x !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // replace oldest selection
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selected.length !== 2) return;
    const [a, b] = selected.map(id => reports.find(r => r.id === id));
    onCompare(a, b);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 'var(--z-modal)' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-reports-title"
        className="relative w-full sm:max-w-md bg-surface border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl animate-fade-up max-h-[85dvh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 id="saved-reports-title" className="font-bold text-text text-base">Saved Reports</h2>
            <p className="text-text2 text-xs mt-0.5">{reports.length}/{MAX_REPORTS} slots used</p>
          </div>
          <div className="flex items-center gap-2">
            {selected.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10" />
                </svg>
                Compare
              </button>
            )}
            <button onClick={onClose} className="text-text2 hover:text-text transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-12 text-text2 text-sm gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading reports...
            </div>
          )}

          {!loading && error && (
            <p className="text-red text-sm text-center py-8">{error}</p>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-text2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <p className="text-text font-medium text-sm mb-1">No saved reports yet</p>
              <p className="text-text2 text-xs">Analyze a deal, then hit "Save Report" to store it here.</p>
            </div>
          )}

          {!loading && reports.map(r => {
            const v = r.result?.vehicle || {};
            const isSelected = selected.includes(r.id);
            return (
              <div
                key={r.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-border-subtle bg-bg hover:bg-surface'
                }`}
                onClick={() => toggleSelect(r.id)}
              >
                {/* Select indicator */}
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-accent bg-accent' : 'border-border'
                }`}>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>

                <ScoreBadge score={r.result?.score ?? 0} />

                <div className="flex-1 min-w-0">
                  <p className="text-text text-sm font-medium truncate">{r.name}</p>
                  <p className="text-text2 text-xs truncate">
                    {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'} · {timeAgo(r.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); onLoad(r); onClose(); }}
                    className="p-1.5 rounded-lg text-text2 hover:text-accent hover:bg-accent/8 transition-colors"
                    title="Open report"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                    disabled={deleting === r.id}
                    className="p-1.5 rounded-lg text-text2 hover:text-red hover:bg-red/8 transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    {deleting === r.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && reports.length >= 2 && selected.length < 2 && (
          <div className="px-5 py-3 border-t border-border flex-shrink-0">
            <p className="text-text2 text-xs text-center">
              Select 2 reports to compare them side by side
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
