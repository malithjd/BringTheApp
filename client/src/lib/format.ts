type Numish = number | string | null | undefined;

function toNum(value: Numish): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(n) ? null : n;
}

export function formatCurrency(value: Numish): string {
  const n = toNum(value);
  if (n == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCurrencyCents(value: Numish): string {
  const n = toNum(value);
  if (n == null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatPercent(value: Numish): string {
  const n = toNum(value);
  if (n == null) return '0%';
  return `${n}%`;
}

export function formatNumber(value: Numish): string {
  const n = toNum(value);
  if (n == null) return '0';
  return new Intl.NumberFormat('en-US').format(n);
}
