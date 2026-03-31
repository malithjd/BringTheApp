import { formatCurrency, formatCurrencyCents, formatPercent } from '../lib/format';

export default function DealSummary({ entered, calculated }) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-up">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text">Deal Summary</h3>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left: What You Entered */}
        <div className="p-4">
          <p className="text-xs font-semibold text-text2 uppercase tracking-wide mb-3">What You Entered</p>
          <dl className="space-y-2 text-sm">
            <Row label="Vehicle Price" value={formatCurrency(entered.price)} />
            <Row label="Down Payment" value={formatCurrency(entered.down)} />
            {entered.tradeIn > 0 && (
              <>
                <Row label="Trade-in Value" value={formatCurrency(entered.tradeIn)} />
                {entered.tradeOwed > 0 && (
                  <Row label="Amount Owed on Trade" value={formatCurrency(entered.tradeOwed)} muted />
                )}
              </>
            )}
            <Row label="APR" value={`${entered.apr}%`} />
            <Row label="Term" value={`${entered.term} months`} />
            {entered.addons?.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-text2 text-xs mb-1">Add-ons:</p>
                {entered.addons.map((a, i) => (
                  <Row key={i} label={a.name} value={formatCurrency(a.price)} muted />
                ))}
              </div>
            )}
          </dl>
        </div>

        {/* Right: Calculated */}
        <div className="p-4 bg-surface2/30">
          <p className="text-xs font-semibold text-text2 uppercase tracking-wide mb-3">Calculated</p>
          <dl className="space-y-2 text-sm">
            <Row label={`Sales Tax (${calculated.taxRate}%)`} value={formatCurrencyCents(calculated.taxAmount)} hint={calculated.taxLaw?.law} />
            <Row label="Doc Fee" value={formatCurrency(calculated.docFee)} hint={calculated.docFeeLaw} />
            <Row label="Registration" value={formatCurrency(calculated.regFee)} />
            <Row label="Title Fee" value={formatCurrency(calculated.titleFee)} />
            <div className="pt-2 border-t border-border">
              <Row label="Total Cost" value={formatCurrency(calculated.totalCost)} bold />
              <Row label="Loan Amount" value={formatCurrency(calculated.loanAmount)} bold />
            </div>
            <div className="pt-2 border-t border-border">
              <Row label="Monthly Payment" value={formatCurrencyCents(calculated.monthlyPayment)} bold highlight />
              <Row label="Total Interest" value={formatCurrency(calculated.totalInterest)} />
              <Row label="Total You'll Pay" value={formatCurrency(calculated.totalPaid)} bold />
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, hint, bold, highlight, muted }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <dt className={`${muted ? 'text-text2' : 'text-text'} ${bold ? 'font-semibold' : ''}`}>{label}</dt>
        {hint && <p className="text-[10px] text-text2 mt-0.5">{hint}</p>}
      </div>
      <dd className={`text-right ${bold ? 'font-semibold' : ''} ${highlight ? 'text-accent text-lg' : 'text-text'}`}>
        {value}
      </dd>
    </div>
  );
}
