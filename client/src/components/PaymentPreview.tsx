import { formatCurrencyCents } from '../lib/format';
import type { FormAddon, Numish } from '../types';

interface PaymentPreviewProps {
  price: Numish;
  down: Numish;
  tradeIn: Numish;
  tradeOwed: Numish;
  apr: Numish;
  term: Numish;
  addons: FormAddon[];
  taxRate: number;
  docFee: Numish;
}

const n = (v: Numish): number => Number(v) || 0;

export default function PaymentPreview({ price, down, tradeIn, tradeOwed, apr, term, addons, taxRate, docFee }: PaymentPreviewProps) {
  const priceN = n(price);
  const tradeInN = n(tradeIn);
  const tradeOwedN = n(tradeOwed);
  const aprN = n(apr);
  const termN = n(term);
  const totalAddons = (addons || []).reduce((sum, a) => (a.enabled ? sum + n(a.price) : sum), 0);
  const taxableAmount = Math.max(0, priceN - tradeInN);
  const taxAmount = taxableAmount * (taxRate || 0);
  const totalCost = priceN + taxAmount + n(docFee) + totalAddons;
  const equity = n(down) + Math.max(0, tradeInN - tradeOwedN);
  const negEquity = Math.max(0, tradeOwedN - tradeInN);
  const loanAmount = Math.max(0, totalCost - equity + negEquity);

  let monthly = 0;
  if (loanAmount > 0 && termN > 0) {
    if (aprN > 0) {
      const r = aprN / 100 / 12;
      monthly = loanAmount * (r * Math.pow(1 + r, termN)) / (Math.pow(1 + r, termN) - 1);
    } else {
      monthly = loanAmount / termN;
    }
  }

  if (!priceN || priceN <= 0) return null;

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
