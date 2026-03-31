import { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({ label, options, value, onChange, placeholder, loading }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const filtered = options.filter(opt => {
    const name = typeof opt === 'string' ? opt : opt.name;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBlur = () => {
    // On blur, if user typed something that matches an option, commit it
    if (search) {
      const exact = options.find(opt => {
        const name = typeof opt === 'string' ? opt : opt.name;
        return name.toLowerCase() === search.toLowerCase();
      });
      if (exact) {
        const name = typeof exact === 'string' ? exact : exact.name;
        onChange(name);
      } else if (filtered.length === 1) {
        // If only one match, auto-select it
        const name = typeof filtered[0] === 'string' ? filtered[0] : filtered[0].name;
        onChange(name);
      } else if (search.trim()) {
        // Allow free-text entry (for makes/models not in dropdown)
        onChange(search.trim());
      }
    }
    // Small delay so mousedown on option fires before blur closes dropdown
    setTimeout(() => setOpen(false), 150);
  };

  const displayValue = value || '';

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="block text-sm text-text2 mb-1">{label}</label>}
      <input
        type="text"
        value={open ? search : displayValue}
        placeholder={loading ? 'Loading...' : placeholder || 'Select...'}
        disabled={loading}
        className="w-full bg-surface2 text-text rounded-lg px-3 py-3 text-[16px] border border-border focus:border-accent focus:outline-none transition-colors"
        onFocus={() => {
          setOpen(true);
          setSearch(value || '');
        }}
        onBlur={handleBlur}
        onChange={(e) => setSearch(e.target.value)}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.slice(0, 50).map((opt, i) => {
            const name = typeof opt === 'string' ? opt : opt.name;
            return (
              <button
                key={i}
                className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 text-text transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(name);
                  setOpen(false);
                  setSearch('');
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
