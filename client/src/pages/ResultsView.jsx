import ScoreGauge from '../components/ScoreGauge';
import DealSummary from '../components/DealSummary';
import MarketCheck from '../components/MarketCheck';
import FlagsPanel from '../components/FlagsPanel';
import FeeBreakdown from '../components/FeeBreakdown';
import NegotiationTips from '../components/NegotiationTips';

export default function ResultsView({ dealData, result, onEditDeal, onNewDeal }) {
  if (!result) return null;

  return (
    <div className="stagger space-y-4 pb-8">
      {/* Panel 1: Score */}
      <ScoreGauge
        score={result.score}
        label={result.label}
        vehicle={result.vehicle}
      />

      {/* Panel 2: Deal Summary */}
      <DealSummary
        entered={result.entered}
        calculated={result.calculated}
      />

      {/* Panel 3: Market Check */}
      <MarketCheck
        vehicle={result.vehicle}
        market={result.market}
        price={result.entered.price}
      />

      {/* Panel 4: Flags */}
      <FlagsPanel
        redFlags={result.flags.redFlags}
        greenFlags={result.flags.greenFlags}
      />

      {/* Panel 5: Fee Breakdown */}
      <FeeBreakdown
        calculated={result.calculated}
        entered={result.entered}
      />

      {/* Negotiation Scripts */}
      <NegotiationTips scripts={result.scripts} />

      {/* Scoring Factors Breakdown */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-text">Score Breakdown</h3>
        </div>
        <div className="p-4 space-y-2">
          {result.factors.map((f, i) => {
            const displayPoints = Math.max(0, f.points);
            const pct = f.max > 0 ? (displayPoints / f.max) * 100 : 0;
            const barColor = displayPoints === 0 ? 'var(--color-red)' : displayPoints >= f.max * 0.7 ? 'var(--color-green)' : 'var(--color-amber)';
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text">{f.name}</span>
                    <span className={`font-medium ${displayPoints === 0 ? 'text-red' : displayPoints >= f.max * 0.7 ? 'text-green' : 'text-amber'}`}>
                      {displayPoints}/{f.max}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(0, pct)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onEditDeal}
          className="flex-1 py-3 bg-surface border border-border text-text font-semibold rounded-xl hover:bg-surface2 transition-colors"
        >
          Edit Deal
        </button>
        <button
          onClick={onNewDeal}
          className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors"
        >
          New Deal
        </button>
      </div>
    </div>
  );
}
