import { formatCurrency } from '../lib/format';

function PriceBar({ label, subtitle, reference, low, high, userPrice }) {
  if (reference == null) return null;

  const range = high - low;
  const position = range > 0 ? Math.max(0, Math.min(100, ((userPrice - low) / range) * 100)) : 50;
  const diff = userPrice - reference;
  const ratio = userPrice / reference;

  let color = 'var(--color-green)';
  let statusText = 'Within range';
  if (ratio > 1.15) {
    color = 'var(--color-red)';
    statusText = `${formatCurrency(diff)} above`;
  } else if (ratio > 1.05) {
    color = 'var(--color-amber)';
    statusText = `${formatCurrency(diff)} above`;
  } else if (ratio < 0.95) {
    color = 'var(--color-green)';
    statusText = `${formatCurrency(Math.abs(diff))} below`;
  }

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          {subtitle && <p className="text-[11px] text-text2">{subtitle}</p>}
        </div>
        <span className="text-sm font-semibold" style={{ color }}>{formatCurrency(reference)}</span>
      </div>

      {/* Bar */}
      <div className="relative h-2.5 bg-surface2 rounded-full overflow-visible">
        <div className="absolute inset-0 rounded-full" style={{ background: `${color}15` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
          style={{ left: `${position}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-text2 mt-1">
        <span>{formatCurrency(low)}</span>
        <span>{formatCurrency(high)}</span>
      </div>
      <p className="text-xs font-medium mt-1" style={{ color }}>
        Your price: {formatCurrency(userPrice)} — {statusText}
      </p>
    </div>
  );
}

export default function MarketCheck({ vehicle, market, price }) {
  const calc = market?.calculated;
  const listings = market?.listings;
  const isNew = vehicle.condition === 'new';

  const hasCalc = calc?.estimated != null;
  const hasListings = listings?.enabled !== false && listings?.avgPrice != null;

  if (!hasCalc && !hasListings) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 animate-fade-up">
        <h3 className="font-semibold text-text mb-2">Market Check</h3>
        <p className="text-text2 text-sm">No market data available for this vehicle. Price comparison not possible.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 animate-fade-up">
      <h3 className="font-semibold text-text mb-4">Market Check</h3>

      {/* Info rows */}
      {hasCalc && (
        <div className="space-y-2 text-sm mb-4">
          {isNew ? (
            <>
              <div className="flex justify-between">
                <span className="text-text2">Base MSRP ({vehicle.year} {vehicle.make} {vehicle.model})</span>
                <span className="text-text font-medium">{formatCurrency(calc.baseMsrp)}</span>
              </div>
              {calc.matchedTrim && (
                <div className="flex justify-between">
                  <span className="text-text2">Matched Trim</span>
                  <span className="text-text">{calc.matchedTrim}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-text2">Original MSRP</span>
                <span className="text-text font-medium">{formatCurrency(calc.baseMsrp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text2">Age / Depreciation</span>
                <span className="text-text">{calc.age}yr — {Math.round((1 - calc.depFactor) * 100)}% depreciated</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bar 1: Calculated Fair Value */}
      {hasCalc && (
        <PriceBar
          label="Calculated Fair Value"
          subtitle={isNew ? 'Based on MSRP data' : 'Based on MSRP + depreciation model'}
          reference={calc.estimated}
          low={calc.low}
          high={calc.high}
          userPrice={price}
        />
      )}

      {/* Bar 2: Market Average from Auto.dev */}
      {hasListings && (
        <PriceBar
          label="Market Average"
          subtitle={`From ${listings.listingCount} similar listing${listings.listingCount !== 1 ? 's' : ''}`}
          reference={listings.avgPrice}
          low={listings.priceRange?.low || listings.avgPrice * 0.85}
          high={listings.priceRange?.high || listings.avgPrice * 1.15}
          userPrice={price}
        />
      )}

      {/* Loading indicator for listings */}
      {listings === null && (
        <div className="flex items-center gap-2 text-text2 text-sm py-2">
          <div className="w-3.5 h-3.5 border-2 border-text2/30 border-t-accent rounded-full animate-spin" />
          Looking up similar listings...
        </div>
      )}

      {/* Sample Listings */}
      {hasListings && listings.sampleListings?.length > 0 && (
        <details className="mt-3">
          <summary className="text-sm text-accent cursor-pointer hover:text-accent-hover font-medium">
            View {listings.listingCount} similar listing{listings.listingCount !== 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-2">
            {listings.sampleListings.map((l, i) => (
              <div key={i} className="flex items-center justify-between bg-surface2 rounded-lg px-3 py-2 text-sm">
                <div>
                  <p className="text-text font-medium">{formatCurrency(l.price)}</p>
                  <p className="text-text2 text-xs">
                    {l.mileage ? `${Number(l.mileage).toLocaleString()} mi` : 'N/A mi'}
                    {l.trim ? ` — ${l.trim}` : ''}
                    {l.city ? ` — ${l.city}, ${l.state}` : ''}
                  </p>
                </div>
                {l.listingUrl && (
                  <a
                    href={l.listingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-xs hover:text-accent-hover flex-shrink-0 ml-2"
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Trim details */}
      {hasCalc && calc.allTrims && Object.keys(calc.allTrims).length > 1 && (
        <details className="mt-3">
          <summary className="text-xs text-text2 cursor-pointer hover:text-text">View all trim MSRPs</summary>
          <div className="mt-2 space-y-1 text-xs">
            {Object.entries(calc.allTrims).map(([trim, msrp]) => (
              <div key={trim} className="flex justify-between text-text2">
                <span>{trim}</span>
                <span>{formatCurrency(msrp)}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      <p className="text-[10px] text-text2 mt-3">
        {isNew ? 'MSRP data from manufacturer published pricing' : 'Fair value estimated using depreciation model from original MSRP'}
        {hasListings ? ' — Market data from live dealer listings' : ''}
      </p>
    </div>
  );
}
