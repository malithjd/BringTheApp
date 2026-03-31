import { formatCurrency } from '../lib/format';

export default function MarketCheck({ vehicle, market, price }) {
  if (!market?.estimated) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 animate-fade-up">
        <h3 className="font-semibold text-text mb-2">Market Check</h3>
        <p className="text-text2 text-sm">No market data available for this vehicle. Price comparison not possible.</p>
      </div>
    );
  }

  const isNew = vehicle.condition === 'new';
  const priceRatio = price / market.estimated;
  const diff = price - market.estimated;
  const barMin = market.low;
  const barMax = market.high;
  const barRange = barMax - barMin;

  // Position of user's price on the bar (clamped to 0-100%)
  const pricePosition = Math.max(0, Math.min(100, ((price - barMin) / barRange) * 100));

  let statusColor = 'var(--color-green)';
  let statusText = 'Within market range';
  if (priceRatio > 1.15) {
    statusColor = 'var(--color-red)';
    statusText = `${formatCurrency(diff)} above market`;
  } else if (priceRatio > 1.05) {
    statusColor = 'var(--color-amber)';
    statusText = `${formatCurrency(diff)} above estimated value`;
  } else if (priceRatio < 0.95) {
    statusColor = 'var(--color-green)';
    statusText = `${formatCurrency(Math.abs(diff))} below market — great price`;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 animate-fade-up">
      <h3 className="font-semibold text-text mb-4">Market Check</h3>

      {isNew ? (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text2">Base MSRP ({vehicle.year} {vehicle.make} {vehicle.model})</span>
            <span className="text-text font-medium">{formatCurrency(market.baseMsrp)}</span>
          </div>
          {market.matchedTrim && (
            <div className="flex justify-between">
              <span className="text-text2">Matched Trim</span>
              <span className="text-text">{market.matchedTrim}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-text2">Typical Range</span>
            <span className="text-text">{formatCurrency(market.low)} – {formatCurrency(market.high)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text2">Your Price</span>
            <span className="font-semibold" style={{ color: statusColor }}>{formatCurrency(price)}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text2">Original MSRP</span>
            <span className="text-text font-medium">{formatCurrency(market.baseMsrp)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text2">Estimated Value ({market.age}yr, {vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} mi` : 'avg miles'})</span>
            <span className="text-text font-medium">{formatCurrency(market.estimated)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text2">Market Range</span>
            <span className="text-text">{formatCurrency(market.low)} – {formatCurrency(market.high)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text2">Your Price</span>
            <span className="font-semibold" style={{ color: statusColor }}>{formatCurrency(price)}</span>
          </div>
        </div>
      )}

      {/* Visual bar */}
      <div className="mt-4">
        <div className="relative h-3 bg-surface2 rounded-full overflow-hidden">
          {/* Market range */}
          <div className="absolute inset-0 bg-green/20 rounded-full" />
          {/* Price indicator */}
          <div
            className="absolute top-0 h-full w-1 rounded-full"
            style={{
              left: `${pricePosition}%`,
              backgroundColor: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text2 mt-1">
          <span>{formatCurrency(barMin)}</span>
          <span>{formatCurrency(barMax)}</span>
        </div>
      </div>

      <p className="mt-3 text-sm font-medium" style={{ color: statusColor }}>
        {statusText}
      </p>

      {market.allTrims && Object.keys(market.allTrims).length > 1 && (
        <details className="mt-3">
          <summary className="text-xs text-text2 cursor-pointer hover:text-text">View all trim MSRPs</summary>
          <div className="mt-2 space-y-1 text-xs">
            {Object.entries(market.allTrims).map(([trim, msrp]) => (
              <div key={trim} className="flex justify-between text-text2">
                <span>{trim}</span>
                <span>{formatCurrency(msrp)}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      <p className="text-[10px] text-text2 mt-3">
        {isNew ? 'MSRP data from manufacturer published pricing' : 'Estimated using depreciation model from original MSRP'}
      </p>
    </div>
  );
}
