import { useState, useEffect, useRef } from 'react';
import ScoreGauge from '../components/ScoreGauge';
import DealSummary from '../components/DealSummary';
import MarketCheck from '../components/MarketCheck';
import FlagsPanel from '../components/FlagsPanel';
import FeeBreakdown from '../components/FeeBreakdown';
import NegotiationTips from '../components/NegotiationTips';
import { getVehiclePhoto, generatePdfReport } from '../lib/api';

/** Pause so React can paint the loading UI before blocking work starts. */
const yieldToPaint = () => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(resolve));
});

export default function ResultsView({ dealData, result, onEditDeal, onNewDeal }) {
  const [exportStatus, setExportStatus] = useState(null); // null | 'preparing' | 'rendering' | 'saving' | 'done' | 'error'
  const [exportMessage, setExportMessage] = useState('');
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

  /** Request server-generated PDF and trigger download. */
  const handleExportPdf = async () => {
    setExportStatus('preparing');
    setExportMessage('Requesting your PDF report...');
    await yieldToPaint();

    try {
      setExportStatus('rendering');
      setExportMessage('Generating your report on the server. This usually takes just a few seconds.');
      await yieldToPaint();

      // 30-second timeout guard
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Server took too long to respond. Please try again.')), 30000)
      );

      const blob = await Promise.race([generatePdfReport(result), timeout]);

      // Trigger browser download
      const v = result.vehicle || {};
      const filename = `BringTheApp-${v.year || ''}-${v.make || ''}-${v.model || ''}-${result.score}.pdf`
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after a short delay so the download has time to start
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      setExportStatus('done');
      setExportMessage('Your PDF is downloading.');
      setTimeout(() => setExportStatus(null), 1800);
    } catch (err) {
      console.error('PDF export failed:', err);
      setExportStatus('error');
      setExportMessage(err.message || 'PDF export failed. Please try again.');
      setTimeout(() => setExportStatus(null), 4000);
    }
  };

  const handleEmail = async () => {
    await handleExportPdf();
    // Only open mailto if PDF export didn't error
    if (exportStatus === 'error') return;

    const v = result.vehicle || {};
    const subject = encodeURIComponent(`My car deal analysis: ${v.year || ''} ${v.make || ''} ${v.model || ''} — ${result.score}/100`.trim());
    const body = encodeURIComponent(
      `Hi,\n\nMy BringTheApp deal analysis is attached (downloaded to your device — please attach the PDF to this email).\n\nSummary: ${result.score}/100 — ${result.label}\nVehicle: ${v.year || ''} ${v.make || ''} ${v.model || ''} ${v.trim || ''}\n\nAnalyzed at https://bringtheapp.onrender.com`
    );
    setTimeout(() => {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }, 800);
  };

  const isExporting = exportStatus && exportStatus !== 'done' && exportStatus !== 'error';

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
          disabled={isExporting}
          className="py-3.5 bg-surface border border-border text-text font-semibold rounded-xl hover:bg-surface2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={handleEmail}
          disabled={isExporting}
          className="py-3.5 bg-surface border border-border text-text font-semibold rounded-xl hover:bg-surface2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
          disabled={isExporting}
          className="flex-1 py-3 bg-surface border border-border text-text font-semibold rounded-xl hover:bg-surface2 transition-colors disabled:opacity-60"
        >
          Edit Deal
        </button>
        <button
          onClick={onNewDeal}
          disabled={isExporting}
          className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          New Deal
        </button>
      </div>

      {/* PDF Export Overlay — shown during generation, success, or error */}
      {exportStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4 animate-fade-up">
          <div className="max-w-sm w-full bg-surface border border-border rounded-2xl p-6 text-center shadow-2xl">
            {/* Icon based on status */}
            {isExporting && (
              <div className="w-14 h-14 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-[3px] border-surface2" />
                <div className="absolute inset-0 rounded-full border-[3px] border-accent border-t-transparent animate-spin" />
              </div>
            )}
            {exportStatus === 'done' && (
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            )}
            {exportStatus === 'error' && (
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            )}

            <h3 className="text-text font-semibold text-lg mb-2">
              {exportStatus === 'preparing' && 'Preparing PDF'}
              {exportStatus === 'rendering' && 'Generating PDF'}
              {exportStatus === 'done' && 'Ready!'}
              {exportStatus === 'error' && 'Something went wrong'}
            </h3>
            <p className="text-text2 text-sm leading-relaxed">{exportMessage}</p>

            {isExporting && (
              <p className="text-text2/60 text-xs mt-4">
                The PDF will download automatically when ready. Please don't close this tab.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
