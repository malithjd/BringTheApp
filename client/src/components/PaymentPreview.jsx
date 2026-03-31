import { formatCurrencyCents } from '../lib/format';

export default function PaymentPreview({ price, down, tradeIn, tradeOwed, apr, term, addons, taxRate, docFee }) {
  const totalAddons = (addons || []).reduce((sum, a) => (a.enabled ? sum + (a.price || 0) : sum), 0);
  const taxableAmount = Math.max(0, (price || 0) - (tradeIn || 0));
  const taxAmount = taxableAmount * (taxRate || 0);
  const totalCost = (price || 0) + taxAmount + (docFee || 0) + totalAddons;
  const equity = (down || 0) + Math.max(0, (tradeIn || 0) - (tradeOwed || 0));
  const negEquity = Math.max(0, (tradeOwed || 0) - (tradeIn || 0));
  const loanAmount = Math.max(0, totalCost - equity + negEquity);

  let monthly = 0;
  if (loanAmount > 0 && term > 0) {
    if (apr > 0) {
      const r = apr / 100 / 12;
      const n = term;
      monthly = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      monthly = loanAmount / term;
    }
  }

  if (!price || price <= 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border px-4 py-3 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-xs text-text2">Estimated Monthly Payment</p>
          <p className="text-2xl font-bold text-text">
            {formatCurrencyCents(monthly)}
            <span className="text-sm font-normal text-text2">/mo</span>
          </p>
        </div>
        <div className="text-right text-xs text-text2">
          <p>{term || 60} months at {apr || 0}% APR</p>
          <p>Loan: {formatCurrencyCents(loanAmount)}</p>
        </div>
      </div>
    </div>
  );
}
