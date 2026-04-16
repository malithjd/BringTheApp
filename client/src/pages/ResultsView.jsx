import { useState, useEffect, useRef } from 'react';
import ScoreGauge from '../components/ScoreGauge';
import DealSummary from '../components/DealSummary';
import MarketCheck from '../components/MarketCheck';
import FlagsPanel from '../components/FlagsPanel';
import FeeBreakdown from '../components/FeeBreakdown';
import NegotiationTips from '../components/NegotiationTips';
import { getVehiclePhoto } from '../lib/api';

export default function ResultsView({ dealData, result, onEditDeal, onNewDeal }) {
  const [exporting, setExporting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    if (!result?.vehicle) return;
    const v = result.vehicle;

    // Listings are already fetched server-side during /analyze (with distance data).
    // Only fetch the vehicle photo separately.
    getVehiclePhoto(v.year, v.make, v.model, v.trim)
      .then(data => { if (data.photoUrl) setPhotoUrl(data.photoUrl); })
      .catch(() => {});
  }, [result]);

  if (!result) return null;

  /** Download a colored PDF of the report, then open mailto for the user to attach. */
  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const v = result.vehicle || {};
      const filename = `BringTheApp-${v.year || ''}-${v.make || ''}-${v.model || ''}-${result.score}.pdf`
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');

      await html2pdf()
        .set({
          margin: [10, 8, 10, 8],
          filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            backgroundColor: '#0a0e17',
            useCORS: true,
            logging: false,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(reportRef.current)
        .save();
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleEmail = async () => {
    await handleExportPdf();
    const v = result.vehicle || {};
    const subject = encodeURIComponent(`My car deal analysis: ${v.year || ''} ${v.make || ''} ${v.model || ''} — ${result.score}/100`.trim());
    const body = encodeURIComponent(
      `Hi,\n\nMy BringTheApp deal analysis is attached (downloaded to your device — please attach the PDF to this email).\n\nSummary: ${result.score}/100 — ${result.label}\nVehicle: ${v.year || ''} ${v.make || ''} ${v.model || ''} ${v.trim || ''}\n\nAnalyzed at https://bringtheapp.onrender.com`
    );
    // Small delay so browser prompts download first
    setTimeout(() => {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }, 800);
  };

  return (
    <div className="stagger space-y-4 pb-8">
      <div ref={reportRef} className="space-y-4">
      {/* Panel 1: Score */}
      <ScoreGauge
        score={result.score}
        label={result.label}
        vehicle={result.vehicle}
        photoUrl={photoUrl}
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

      </div>

      {/* Export actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="py-3.5 bg-surface border border-border text-text font-semibold rounded-xl hover:bg-surface2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {exporting ? 'Preparing PDF...' : 'Download PDF'}
        </button>
        <button
          onClick={handleEmail}
          disabled={exporting}
          className="py-3.5 bg-surface border border-border text-text font-semibold rounded-xl hover:bg-surface2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Email PDF
        </button>
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
