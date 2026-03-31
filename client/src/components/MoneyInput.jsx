import { useState } from 'react';

export default function MoneyInput({ label, value, onChange, placeholder, hint }) {
  const [focused, setFocused] = useState(false);

  const displayValue = focused
    ? (value === '' || value == null ? '' : value)
    : value !== '' && value != null
      ? Number(value).toLocaleString('en-US')
      : '';

  return (
    <div>
      {label && <label className="block text-sm text-text2 mb-1">{label}</label>}
      <div className="relative">
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${value !== '' && value != null ? 'text-text2' : 'text-text2/50'}`}>$</span>
        <input
          type={focused ? 'number' : 'text'}
          inputMode="decimal"
          value={displayValue}
          placeholder={placeholder || '0'}
          className="w-full bg-surface2 text-text rounded-lg pl-7 pr-3 py-3 text-[16px] border border-border focus:border-accent focus:outline-none transition-colors placeholder:text-text2/40"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
        />
      </div>
      {hint && <p className="text-xs text-text2 mt-1">{hint}</p>}
    </div>
  );
}
