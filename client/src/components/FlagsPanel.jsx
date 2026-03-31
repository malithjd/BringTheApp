export default function FlagsPanel({ redFlags, greenFlags }) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-up">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text">Deal Assessment</h3>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Red flags */}
        <div className="p-4">
          <p className="text-xs font-semibold text-red uppercase tracking-wide mb-3">
            Issues Found ({redFlags.length})
          </p>
          {redFlags.length === 0 ? (
            <p className="text-text2 text-sm">No issues detected</p>
          ) : (
            <div className="space-y-3">
              {redFlags.map((flag, i) => (
                <div key={i} className="bg-red/5 border border-red/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">
                      {flag.severity === 'critical' ? '❌' : '⚠️'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-text">{flag.title}</p>
                      <p className="text-xs text-text2 mt-0.5">{flag.detail}</p>
                      {flag.action && (
                        <p className="text-xs text-amber mt-1 font-medium">{flag.action}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Green flags */}
        <div className="p-4">
          <p className="text-xs font-semibold text-green uppercase tracking-wide mb-3">
            What's Good ({greenFlags.length})
          </p>
          {greenFlags.length === 0 ? (
            <p className="text-text2 text-sm">No positive signals detected</p>
          ) : (
            <div className="space-y-3">
              {greenFlags.map((flag, i) => (
                <div key={i} className="bg-green/5 border border-green/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">✅</span>
                    <div>
                      <p className="text-sm font-semibold text-text">{flag.title}</p>
                      <p className="text-xs text-text2 mt-0.5">{flag.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
