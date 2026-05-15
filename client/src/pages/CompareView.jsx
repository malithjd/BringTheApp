import { useState } from 'react';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, prefix = '') =>
  n != null ? `${prefix}${Number(n).toLocaleString()}` : '—';

const fmtPct = n => (n != null ? `${n}%` : '—');

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
    <svg width="110" height="110" viewBox="-8 -8 116 116" className="mx-auto">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-surface2)" strokeWidth="7" strokeLinecap="round" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="50" y="45" textAnchor="middle" fill={color} fontSize="20" fontWeight="700" fontFamily="Plus Jakarta Sans,sans-serif">{score}</text>
      <text x="50" y="58" textAnchor="middle" fill="var(--color-text2)" fontSize="7">out of 100</text>
    </svg>
  );
}

// ─── Delta badge ──────────────────────────────────────────────────────────────
function Delta({ a, b, prefix = '', invert = false }) {
  if (a == null || b == null) return null;
  const diff = Number(a) - Number(b);
  if (diff === 0) return <span className="text-text2 text-[10px]">same</span>;
  const positive = invert ? diff < 0 : diff > 0;
  return (
    <span className={`text-[10px] font-semibold ${positive ? 'text-green' : 'text-red'}`}>
      {diff > 0 ? '+' : ''}{prefix}{Number(diff).toLocaleString()}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function CompareSection({ title, children }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold text-text2 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

// ─── Single column ────────────────────────────────────────────────────────────
function Column({ report, highlight }) {
  const r = report?.result ?? {};
  const d = report?.deal_data ?? {};
  const v = r?.vehicle ?? {};
  const summary = r?.summary ?? {};
  const market = r?.market ?? {};
  const flags = r?.flags ?? [];
  const breakdown = r?.breakdown ?? [];

  const redFlags = flags.filter(f => f.severity === 'red');
  const amberFlags = flags.filter(f => f.severity === 'amber');
  const greenFlags = flags.filter(f => f.severity === 'green');

  return (
    <div className={`flex flex-col gap-5 ${highlight ? 'opacity-100' : 'opacity-85'}`}>
      {/* Gauge + label */}
      <div className="bg-bg border border-border rounded-2xl p-5 text-center">
        <MiniGauge score={r.score} />
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${scoreLabelClass(r.score)}`}>
          {scoreLabel(r.score)}
        </span>
        <p className="mt-2 text-text2 text-xs">
          {[v.year, v.make, v.model, v.trim].filter(Boolean).join(' ') || report?.name || 'Vehicle'}
        </p>
        <p className="text-text2 text-[10px] mt-0.5">{report?.name}</p>
      </div>

      {/* Key numbers */}
      <div className="bg-bg border border-border rounded-2xl p-4 space-y-2 text-xs">
        {[
          ['Price', fmt(summary.vehiclePrice ?? d.vehiclePrice, '$')],
          ['Down', fmt(summary.downPayment ?? d.downPayment, '$')],
          ['APR', fmtPct(summary.apr ?? d.apr)],
          ['Term', summary.loanTerm ? `${summary.loanTerm} mo` : '—'],
          ['Monthly', fmt(summary.monthlyPayment, '$')],
          ['Total Cost', fmt(summary.totalCost, '$')],
          ['Sales Tax', fmt(summary.salesTax, '$')],
          ['Doc Fee', fmt(summary.docFee, '$')],
        ].map(([k, val]) => (
          <div key={k} className="flex justify-between">
            <span className="text-text2">{k}</span>
            <span className="text-text tabular-nums font-medium">{val}</span>
          </div>
        ))}
      </div>

      {/* Market */}
      <div className="bg-bg border border-border rounded-2xl p-4 text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-text2">Fair Value</span>
          <span className="text-text tabular-nums font-medium">{fmt(market.fairValue, '$')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text2">Market Avg</span>
          <span className="text-text tabular-nums font-medium">{fmt(market.avgPrice, '$')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text2">Your Price</span>
          <span className="text-text tabular-nums font-medium">{fmt(summary.vehiclePrice ?? d.vehiclePrice, '$')}</span>
        </div>
      </div>

      {/* Flags summary */}
      <div className="bg-bg border border-border rounded-2xl p-4 text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-text2">Red flags</span>
          <span className="text-red font-semibold">{redFlags.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text2">Warnings</span>
          <span className="text-amber font-semibold">{amberFlags.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text2">Positives</span>
          <span className="text-green font-semibold">{greenFlags.length}</span>
        </div>
      </div>

      {/* Score breakdown */}
      {breakdown.length > 0 && (
        <div className="bg-bg border border-border rounded-2xl p-4 space-y-2.5">
          {breakdown.map(f => {
            const pct = Math.round((f.score / f.max) * 100);
            const color = pct >= 70 ? 'var(--color-green)' : pct >= 40 ? 'var(--color-amber)' : 'var(--color-red)';
            return (
              <div key={f.factor}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text2">{f.factor}</span>
                  <span style={{ color }} className="font-semibold tabular-nums">{f.score}/{f.max}</span>
                </div>
                <div className="h-1 bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
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
  const sa = ra?.summary ?? {};
  const sb = rb?.summary ?? {};
  const da = left?.deal_data ?? {};
  const db = right?.deal_data ?? {};

  return (
    <div className="animate-fade-up">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-text2 hover:text-text text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setSwapped(s => !s)}
          className="flex items-center gap-1.5 text-sm text-text2 hover:text-accent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          Swap
        </button>
      </div>

      <h2 className="text-xl font-extrabold text-text mb-1">Side-by-Side Comparison</h2>
      <p className="text-text2 text-sm mb-6">Tap a report to open it. Differences are highlighted.</p>

      {/* Score delta banner */}
      {ra.score != null && rb.score != null && (
        <div className="mb-6 p-4 rounded-2xl bg-surface border border-border flex items-center gap-4">
          <div className="text-center flex-1">
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: scoreColor(ra.score) }}>
              {ra.score}
            </p>
            <p className="text-text2 text-xs truncate max-w-[100px] mx-auto">{left?.name || 'Report A'}</p>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold tabular-nums ${ra.score > rb.score ? 'text-green' : ra.score < rb.score ? 'text-red' : 'text-text2'}`}>
              {ra.score > rb.score ? `+${ra.score - rb.score}` : ra.score < rb.score ? `${ra.score - rb.score}` : '='}
            </div>
            <p className="text-text2 text-[10px]">score diff</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: scoreColor(rb.score) }}>
              {rb.score}
            </p>
            <p className="text-text2 text-xs truncate max-w-[100px] mx-auto">{right?.name || 'Report B'}</p>
          </div>
        </div>
      )}

      {/* Price delta */}
      <div className="mb-6 grid grid-cols-3 gap-3 text-center text-xs">
        {[
          { label: 'Price diff', a: sa.vehiclePrice ?? da.vehiclePrice, b: sb.vehiclePrice ?? db.vehiclePrice, prefix: '$', invert: true },
          { label: 'Monthly diff', a: sa.monthlyPayment, b: sb.monthlyPayment, prefix: '$', invert: true },
          { label: 'Total cost diff', a: sa.totalCost, b: sb.totalCost, prefix: '$', invert: true },
        ].map(({ label, a, b, prefix, invert }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-3">
            <Delta a={a} b={b} prefix={prefix} invert={invert} />
            <p className="text-text2 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left column header */}
        <div className="text-xs font-semibold text-text truncate px-1">{left?.name || 'Report A'}</div>
        <div className="text-xs font-semibold text-text truncate px-1">{right?.name || 'Report B'}</div>

        {/* Columns */}
        <Column report={left} highlight={ra.score >= rb.score} />
        <Column report={right} highlight={rb.score >= ra.score} />
      </div>
    </div>
  );
}
