import { formatCurrency } from '../lib/format';

export default function FeeBreakdown({ calculated, entered }) {
  const rows = [
    {
      name: 'Sales Tax',
      amount: calculated.taxAmount,
      law: calculated.taxLaw?.law,
      note: `${calculated.taxRate}% combined rate`,
      status: 'fair',
    },
    {
      name: 'Documentation Fee',
      amount: calculated.docFee,
      law: calculated.docFeeLaw,
      status: calculated.docFeeCap && calculated.docFee > calculated.docFeeCap
        ? 'over-cap'
        : calculated.docFee > 500
          ? 'high'
          : 'fair',
      note: calculated.docFeeCap ? `State cap: $${calculated.docFeeCap}` : null,
    },
    {
      name: 'Registration Fee',
      amount: calculated.regFee,
      status: 'fair',
    },
    {
      name: 'Title Fee',
      amount: calculated.titleFee,
      status: 'fair',
    },
  ];

  // Add add-ons
  if (entered.addons?.length > 0) {
    entered.addons.forEach(addon => {
      rows.push({
        name: addon.name,
        amount: addon.price,
        status: addon.price > 2000 ? 'high' : addon.price > 1000 ? 'warning' : 'fair',
        note: addon.price > 2000 ? 'Unusually expensive' : null,
      });
    });
  }

  const statusIcon = (status) => {
    switch (status) {
      case 'fair': return <span className="text-green text-xs">✅ Fair</span>;
      case 'high': return <span className="text-amber text-xs">⚠️ High</span>;
      case 'over-cap': return <span className="text-red text-xs">❌ Over Cap</span>;
      case 'warning': return <span className="text-amber text-xs">⚠️ Review</span>;
      default: return null;
    }
  };

  const total = rows.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-up">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text">Fee Breakdown & Legal</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text2 text-xs">
              <th className="text-left p-3 font-medium">Fee</th>
              <th className="text-right p-3 font-medium">Amount</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Legal Reference</th>
              <th className="text-right p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="p-3 text-text">
                  {row.name}
                  {row.note && <p className="text-[10px] text-text2">{row.note}</p>}
                </td>
                <td className="p-3 text-right text-text font-medium">
                  {formatCurrency(row.amount)}
                </td>
                <td className="p-3 text-text2 text-xs hidden sm:table-cell">
                  {row.law || '—'}
                </td>
                <td className="p-3 text-right">
                  {statusIcon(row.status)}
                </td>
              </tr>
            ))}
            <tr className="bg-surface2/30">
              <td className="p-3 font-semibold text-text">Total Taxes & Fees</td>
              <td className="p-3 text-right font-semibold text-text">{formatCurrency(total)}</td>
              <td className="p-3 hidden sm:table-cell"></td>
              <td className="p-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-border text-[10px] text-text2">
        Sales tax data from API Ninjas / estimated. Fee caps per state statute. Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
