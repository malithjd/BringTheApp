export default function NegotiationTips({ scripts }) {
  if (!scripts || scripts.length === 0) return null;

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
            <button
              onClick={() => {
                navigator.clipboard?.writeText(s.script.replace(/^"|"$/g, ''));
              }}
              className="mt-2 text-xs text-accent hover:text-accent-hover font-medium"
            >
              Copy to clipboard
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
