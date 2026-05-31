import { useState } from 'react';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, prefix = '') =>
  n != null && n !== '' ? `${prefix}${Number(n).toLocaleString()}` : '—';

const fmtPct = n => (n != null && n !== '' ? `${n}%` : '—');

function scoreColor(score) {
  if (score >= 70) return 'var(--color-green)';
  if (score >= 45) return 'var(--color-amber)';
  return 'var(--color-red)';
}

function scoreLabel(score) {
  if (score >= 70) return 'Good Deal';
  if (score >= 45) return 'Fair Deal';
  return 'Poor Deal';
}

function scoreLabelClass(score) {
  if (score >= 70) return 'bg-green/10 text-green border-green/20';
  if (score >= 45) return 'bg-amber/10 text-amber border-amber/20';
  return 'bg-red/10 text-red border-red/20';
}

// ─── Mini score gauge ──────────────────────────────────────────────────────────
function MiniGauge({ score }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (score ?? 0) / 100);
  const color = scoreColor(score);
  return (
    <svg width="100" height="100" viewBox="-8 -8 116 116" className="mx-auto">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-surface2)" strokeWidth="7" strokeLinecap="round" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="50" y="45" textAnchor="middle" fill={color} fontSize="20" fontWeight="700" fontFamily="Plus Jakarta Sans,sans-serif">{score ?? '—'}</text>
      <text x="50" y="58" textAnchor="middle" fill="var(--color-text2)" fontSize="7">out of 100</text>
    </svg>
  );
}

// ─── Delta badge ──────────────────────────────────────────────────────────────
function Delta({ a, b, prefix = '', invert = false }) {
  if (a == null || b == null || a === '' || b === '') return <span className="text-text2 text-[10px]">—</span>;
  const diff = Number(a) - Number(b);
  if (Math.abs(diff) < 1) return <span className="text-text2 text-[10px]">same</span>;
  const positive = invert ? diff < 0 : diff > 0;
  return (
    <span className={`text-[10px] font-semibold ${positive ? 'text-green' : 'text-red'}`}>
      {diff > 0 ? '+' : ''}{prefix}{Math.abs(Number(diff)).toLocaleString()}
    </span>
  );
}

// ─── Single column ────────────────────────────────────────────────────────────
function Column({ report }) {
  const r = report?.result ?? {};
  const d = report?.deal_data ?? {};
  const v = r?.vehicle ?? {};
  const entered = r?.entered ?? {};
  const calculated = r?.calculated ?? {};
  const factors = r?.factors ?? [];
  const redFlags = r?.flags?.redFlags ?? [];
  const greenFlags = r?.flags?.greenFlags ?? [];
  const marketRef = r?.market?.reference ?? r?.market?.calculated ?? {};

  return (
    <div className="flex flex-col gap-1.5 sm:gap-3">
      {/* Gauge + label */}
      <div className="bg-bg border border-border rounded-xl p-4 text-center">
        <MiniGauge score={r.score} />
        <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${scoreLabelClass(r.score)}`}>
          {scoreLabel(r.score)}
        </span>
        <p className="mt-1.5 text-text2 text-[10px] truncate">
          {[v.year, v.make, v.model].filter(Boolean).join(' ') || report?.name || 'Vehicle'}
        </p>
      </div>

      {/* Key numbers */}
      <div className="bg-bg border border-border rounded-xl p-3 space-y-1.5">
        {[
          ['Price', fmt(entered.price ?? d.price, '$')],
          ['Down', fmt(entered.down ?? d.down, '$')],
          ['APR', fmtPct(entered.apr ?? d.apr)],
          ['Term', (entered.term || d.term) ? `${entered.term || d.term} mo` : '—'],
          ['Monthly', fmt(calculated.monthlyPayment, '$')],
          ['Total', fmt(calculated.totalCost, '$')],
          ['Tax', fmt(calculated.taxAmount, '$')],
          ['Doc Fee', fmt(calculated.docFee, '$')],
        ].map(([k, val]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-text2">{k}</span>
            <span className="text-text tabular-nums font-medium">{val}</span>
          </div>
        ))}
      </div>

      {/* Market */}
      <div className="bg-bg border border-border rounded-xl p-3 space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-text2">Market Est.</span>
          <span className="text-text tabular-nums font-medium">{fmt(marketRef.estimated, '$')}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-text2">Your Price</span>
          <span className="text-text tabular-nums font-medium">{fmt(entered.price ?? d.price, '$')}</span>
        </div>
      </div>

      {/* Flags */}
      <div className="bg-bg border border-border rounded-xl p-3 space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-text2">Red flags</span>
          <span className="text-red font-semibold">{redFlags.length}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-text2">Positives</span>
          <span className="text-green font-semibold">{greenFlags.length}</span>
        </div>
      </div>

      {/* Score factors */}
      {factors.length > 0 && (
        <div className="bg-bg border border-border rounded-xl p-3 space-y-2">
          {factors.map(f => {
            const pct = f.max > 0 ? Math.round((f.points / f.max) * 100) : 0;
            const color = pct >= 70 ? 'var(--color-green)' : pct >= 40 ? 'var(--color-amber)' : 'var(--color-red)';
            return (
              <div key={f.name}>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-text2 truncate pr-1">{f.name}</span>
                  <span style={{ color }} className="font-semibold tabular-nums flex-shrink-0">{f.points}/{f.max}</span>
                </div>
                <div className="h-1 bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CompareView({ reportA, reportB, onBack }) {
  const [swapped, setSwapped] = useState(false);
  const [left, right] = swapped ? [reportB, reportA] : [reportA, reportB];

  const ra = left?.result ?? {};
  const rb = right?.result ?? {};

  // Guard: no reports loaded (e.g. direct URL navigation)
  if (!reportA && !reportB) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <p className="text-text font-semibold mb-2">No reports to compare</p>
        <p className="text-text2 text-sm mb-5">Open your saved reports and select two to compare.</p>
        <button onClick={onBack} className="px-4 py-2 text-sm text-accent border border-accent/30 rounded-lg hover:bg-accent/8 transition-colors">
          Open saved reports
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-text2 hover:text-text text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <h2 className="flex-1 text-base font-bold text-text">Side-by-Side</h2>
        <button
          onClick={() => setSwapped(s => !s)}
          className="flex items-center gap-1 text-xs text-text2 hover:text-accent transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          Swap
        </button>
      </div>

      {/* Score delta banner */}
      {ra.score != null && rb.score != null && (
        <div className="mb-4 p-4 rounded-xl bg-surface border border-border flex items-center gap-3">
          <div className="text-center flex-1 min-w-0">
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: scoreColor(ra.score) }}>
              {ra.score}
            </p>
            <p className="text-text2 text-[10px] truncate">{left?.name || 'Report A'}</p>
          </div>
          <div className="text-center flex-shrink-0">
            <div className={`text-base font-bold tabular-nums ${ra.score > rb.score ? 'text-green' : ra.score < rb.score ? 'text-red' : 'text-text2'}`}>
              {ra.score > rb.score ? `+${ra.score - rb.score}` : ra.score < rb.score ? `${ra.score - rb.score}` : '='}
            </div>
            <p className="text-text2 text-[9px]">pts</p>
          </div>
          <div className="text-center flex-1 min-w-0">
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: scoreColor(rb.score) }}>
              {rb.score}
            </p>
            <p className="text-text2 text-[10px] truncate">{right?.name || 'Report B'}</p>
          </div>
        </div>
      )}

      {/* Delta chips */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          { label: 'Price', a: ra.entered?.price, b: rb.entered?.price, prefix: '$', invert: true },
          { label: 'Monthly', a: ra.calculated?.monthlyPayment, b: rb.calculated?.monthlyPayment, prefix: '$', invert: true },
          { label: 'Total cost', a: ra.calculated?.totalCost, b: rb.calculated?.totalCost, prefix: '$', invert: true },
        ].map(({ label, a, b, prefix, invert }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-2.5">
            <Delta a={a} b={b} prefix={prefix} invert={invert} />
            <p className="text-text2 text-[10px] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3 mb-1.5 px-0.5">
        <p className="text-xs font-semibold text-text truncate">{left?.name || 'Report A'}</p>
        <p className="text-xs font-semibold text-text truncate">{right?.name || 'Report B'}</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
        <Column report={left} />
        <Column report={right} />
      </div>
    </div>
  );
}
