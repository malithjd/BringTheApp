import { useState } from 'react';
import type { NegotiationScript } from '../types';

type CopyState = Record<number, 'copied' | 'error'>;

export default function NegotiationTips({ scripts }: { scripts: NegotiationScript[] }) {
  const [copyState, setCopyState] = useState<CopyState>({});

  if (!scripts || scripts.length === 0) return null;

  const handleCopy = async (script: string, i: number) => {
    try {
      await navigator.clipboard.writeText(script.replace(/^"|"$/g, ''));
      setCopyState(prev => ({ ...prev, [i]: 'copied' }));
      setTimeout(() => setCopyState(prev => { const next = { ...prev }; delete next[i]; return next; }), 2000);
    } catch {
      setCopyState(prev => ({ ...prev, [i]: 'error' }));
      setTimeout(() => setCopyState(prev => { const next = { ...prev }; delete next[i]; return next; }), 2500);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-up">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text">Negotiation Scripts</h3>
        <p className="text-xs text-text2 mt-1">Copy and use these when talking to the dealer</p>
      </div>

      <div className="p-4 space-y-4">
        {scripts.map((s, i) => (
          <div key={i} className="bg-surface2 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber uppercase tracking-wide mb-2">{s.issue}</p>
            <p className="text-sm text-text leading-relaxed italic">{s.script}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => handleCopy(s.script, i)}
                className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
                aria-label={`Copy script for ${s.issue}`}
              >
                {copyState[i] === 'copied' ? 'Copied!' : copyState[i] === 'error' ? 'Copy failed' : 'Copy to clipboard'}
              </button>
              {copyState[i] === 'error' && (
                <span className="text-xs text-text2">Select and copy manually.</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
