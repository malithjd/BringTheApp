import { useState, useEffect, useCallback } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import SearchableSelect from '../components/SearchableSelect';
import MoneyInput from '../components/MoneyInput';
import PaymentPreview from '../components/PaymentPreview';
import { getMakes, getModels, getTrims, decodeVin, getTax, getFees, analyzeDeal } from '../lib/api';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => CURRENT_YEAR + 1 - i);
const TERMS = [24, 36, 48, 60, 72, 84];
const CREDIT_TIERS = [
  { value: 'excellent', label: 'Excellent', apr: 4.5 },
  { value: 'very-good', label: 'Very Good', apr: 6.0 },
  { value: 'good', label: 'Good', apr: 8.5 },
  { value: 'fair', label: 'Fair', apr: 12.0 },
  { value: 'poor', label: 'Poor', apr: 17.0 },
];
const DEFAULT_ADDONS = [
  { name: 'GAP Insurance', price: '', enabled: false },
  { name: 'Extended Warranty', price: '', enabled: false },
  { name: 'Paint Protection', price: '', enabled: false },
  { name: 'Fabric Protection', price: '', enabled: false },
  { name: 'Tire & Wheel', price: '', enabled: false },
  { name: 'LoJack/Theft', price: '', enabled: false },
  { name: 'Maintenance Plan', price: '', enabled: false },
  { name: 'Window Tint', price: '', enabled: false },
];

const initialFormState = {
  condition: 'new',
  year: String(CURRENT_YEAR),
  make: '',
  model: '',
  trim: '',
  vin: '',
  mileage: '',
  zip: '',
  price: '',
  down: '',
  hasTradeIn: false,
  tradeIn: '',
  tradeOwed: '',
  hasFinancing: true,
  creditTier: 'good',
  apr: 8.5,
  aprAuto: true,
  term: 60,
  docFee: '',
  regFee: '',
  addons: DEFAULT_ADDONS.map(a => ({ ...a })),
};

export default function FormView({ initialData, onAnalysisComplete }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'form'
  const [form, setForm] = useState(initialData || initialFormState);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [stateInfo, setStateInfo] = useState(null);
  const [feeInfo, setFeeInfo] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [customAddonName, setCustomAddonName] = useState(null);
  const [errors, setErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    vehicle: true, deal: true, addons: false, financing: false,
  });
  const [ocrFilled, setOcrFilled] = useState(false);

  const set = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // If initialData exists, go straight to form
  useEffect(() => {
    if (initialData) setMode('form');
  }, [initialData]);

  // Load makes on mount
  useEffect(() => {
    setLoadingMakes(true);
    getMakes()
      .then(data => setMakes(data))
      .catch(() => {})
      .finally(() => setLoadingMakes(false));
  }, []);

  // Load models when make+year changes
  useEffect(() => {
    if (form.make && form.year) {
      setLoadingModels(true);
      getModels(form.make, form.year)
        .then(data => setModels(data))
        .catch(() => setModels([]))
        .finally(() => setLoadingModels(false));
    }
  }, [form.make, form.year]);

  // Load trims when make+model+year changes
  useEffect(() => {
    if (form.make && form.model && form.year) {
      getTrims(form.make, form.model, form.year)
        .then(data => setTrims(data))
        .catch(() => setTrims([]));
    }
  }, [form.make, form.model, form.year]);

  // Lookup tax and fees when ZIP changes
  useEffect(() => {
    if (form.zip && form.zip.length === 5) {
      getTax(form.zip)
        .then(data => {
          setTaxRate(data.combinedRate);
          setStateInfo(data);
          // Fetch fee data for the state
          return getFees(data.state);
        })
        .then(feeData => {
          setFeeInfo(feeData);
          // Pre-fill doc fee from state data if user hasn't entered one
          if (!form.docFee && feeData?.docFee) {
            const prefill = feeData.docFee.capped ? feeData.docFee.cap : feeData.docFee.typical;
            if (prefill) set('docFee', prefill);
          }
          if (!form.regFee && feeData?.registration?.estimatedRange) {
            set('regFee', feeData.registration.estimatedRange[0]);
          }
        })
        .catch(() => {});
    }
  }, [form.zip]);

  // VIN decode
  const handleVinChange = async (vin) => {
    set('vin', vin);
    if (vin.length === 17) {
      try {
        const data = await decodeVin(vin);
        if (data.year) set('year', data.year);
        if (data.make) set('make', data.make);
        if (data.model) set('model', data.model);
        if (data.trim) set('trim', data.trim);
      } catch {}
    }
  };

  // Credit tier → APR auto-fill
  const handleCreditTier = (tier) => {
    const tierData = CREDIT_TIERS.find(t => t.value === tier);
    set('creditTier', tier);
    if (form.aprAuto) {
      set('apr', tierData?.apr || 8.5);
    }
  };

  // Handle OCR extracted fields
  const handleOcrFields = (fields) => {
    setOcrFilled(true);
    const updates = { ...form };
    if (fields.year) updates.year = String(fields.year);
    if (fields.make) updates.make = fields.make;
    if (fields.model) updates.model = fields.model;
    if (fields.trim) updates.trim = fields.trim;
    if (fields.vin) updates.vin = fields.vin;
    if (fields.condition) updates.condition = fields.condition;
    if (fields.mileage) updates.mileage = fields.mileage;
    if (fields.price) updates.price = fields.price;
    if (fields.down) updates.down = fields.down;
    if (fields.tradeIn) {
      updates.hasTradeIn = true;
      updates.tradeIn = fields.tradeIn;
    }
    if (fields.tradeOwed) updates.tradeOwed = fields.tradeOwed;
    if (fields.apr) {
      updates.apr = fields.apr;
      updates.aprAuto = false;
    }
    if (fields.term) updates.term = fields.term;
    if (fields.docFee) updates.docFee = fields.docFee;
    if (fields.regFee) updates.regFee = fields.regFee;
    if (fields.addons) {
      const merged = updates.addons.map(a => {
        const ocrAddon = fields.addons.find(o => o.name === a.name);
        return ocrAddon ? { ...a, price: ocrAddon.price, enabled: true } : a;
      });
      // Add any OCR addons not in default list
      fields.addons.forEach(o => {
        if (!merged.find(m => m.name === o.name)) {
          merged.push({ name: o.name, price: o.price, enabled: true });
        }
      });
      updates.addons = merged;
      // Auto-expand addons if any were found
      setExpandedSections(prev => ({ ...prev, addons: true }));
    }

    setForm(updates);
    setMode('form');
  };

  // Validate & submit
  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.price) newErrors.price = 'Vehicle price is required';
    if (!form.zip || form.zip.length !== 5) newErrors.zip = 'Valid ZIP code required';
    if (!form.year) newErrors.year = 'Year is required';
    if (!form.make) newErrors.make = 'Make is required';
    if (!form.model) newErrors.model = 'Model is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setAnalyzing(true);

    try {
      const payload = {
        year: form.year,
        make: form.make,
        model: form.model,
        trim: form.trim,
        condition: form.condition,
        mileage: form.mileage || undefined,
        zip: form.zip,
        price: parseFloat(form.price),
        down: parseFloat(form.down) || 0,
        tradeIn: form.hasTradeIn ? parseFloat(form.tradeIn) || 0 : 0,
        tradeOwed: form.hasTradeIn ? parseFloat(form.tradeOwed) || 0 : 0,
        apr: form.hasFinancing ? (parseFloat(form.apr) || 0) : 0,
        term: form.hasFinancing ? (parseInt(form.term) || 60) : 0,
        creditTier: form.creditTier,
        docFee: parseFloat(form.docFee) || 0,
        regFee: parseFloat(form.regFee) || 0,
        addons: form.addons.filter(a => a.enabled && a.price).map(a => ({ name: a.name, price: parseFloat(a.price) })),
      };

      const result = await analyzeDeal(payload);
      onAnalysisComplete(form, result);
    } catch (err) {
      setErrors({ submit: err.message || 'Analysis failed. Please try again.' });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Upload mode
  if (mode === 'upload') {
    return (
      <div className="animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Analyze Your Car Deal</h1>
          <p className="text-text2">Upload your purchase agreement and we'll tell you if it's a good deal</p>
        </div>
        <DocumentUpload
          onFieldsExtracted={handleOcrFields}
          onSkip={() => setMode('form')}
        />
      </div>
    );
  }

  // Form mode
  return (
    <div className="pb-24 animate-fade-up">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text mb-1">Deal Details</h1>
        <p className="text-text2 text-sm">
          {ocrFilled ? 'Review extracted details — correct any errors' : 'Enter your deal numbers'}
        </p>
      </div>

      {ocrFilled && (
        <div className="bg-amber/10 border border-amber/30 rounded-xl p-4 mb-4">
          <p className="text-amber font-semibold text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
            Please double-check all numbers before analyzing
          </p>
          <p className="text-text2 text-xs mt-1">Fields were auto-filled from your documents. Verify prices, fees, APR, and loan term are correct.</p>
        </div>
      )}

      {/* Section 1: Vehicle */}
      <Section title="Vehicle" expanded={expandedSections.vehicle} onToggle={() => toggleSection('vehicle')}>
        {/* Condition toggle */}
        <div className="flex gap-2 mb-4">
          {['new', 'used'].map(c => (
            <button
              key={c}
              onClick={() => set('condition', c)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                form.condition === c
                  ? 'bg-accent text-white'
                  : 'bg-surface2 text-text2 hover:text-text'
              }`}
            >
              {c === 'new' ? 'New' : 'Used'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-text2 mb-1">Year</label>
            <select
              value={form.year}
              onChange={(e) => set('year', e.target.value)}
              className="w-full bg-surface2 text-text rounded-lg px-3 py-3 text-[16px] border border-border focus:border-accent focus:outline-none"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-text2 mb-1">ZIP Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={form.zip}
              placeholder="10001"
              onChange={(e) => set('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
              className={`w-full bg-surface2 text-text rounded-lg px-3 py-3 text-[16px] border ${errors.zip ? 'border-red' : 'border-border'} focus:border-accent focus:outline-none`}
            />
            {stateInfo && <p className="text-xs text-text2 mt-1">{stateInfo.state} — Tax: {(taxRate * 100).toFixed(2)}%</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <SearchableSelect
            label="Make"
            options={makes}
            value={form.make}
            onChange={(v) => { set('make', v); set('model', ''); set('trim', ''); }}
            placeholder="Toyota"
            loading={loadingMakes}
          />
          <SearchableSelect
            label="Model"
            options={models}
            value={form.model}
            onChange={(v) => { set('model', v); set('trim', ''); }}
            placeholder="Camry"
            loading={loadingModels}
          />
        </div>

        <div className="mt-3">
          <SearchableSelect
            label="Trim (optional)"
            options={trims}
            value={form.trim}
            onChange={(v) => set('trim', v)}
            placeholder="LE, SE, XLE..."
          />
        </div>

        {/* VIN */}
        <div className="mt-3">
          <label className="block text-sm text-text2 mb-1">VIN (optional — auto-fills vehicle info)</label>
          <input
            type="text"
            maxLength={17}
            value={form.vin}
            placeholder="1HGBH41JXMN109186"
            onChange={(e) => handleVinChange(e.target.value.toUpperCase())}
            className="w-full bg-surface2 text-text rounded-lg px-3 py-3 text-[16px] border border-border focus:border-accent focus:outline-none font-mono"
          />
        </div>

        {/* Mileage (used only) */}
        {form.condition === 'used' && (
          <div className="mt-3">
            <label className="block text-sm text-text2 mb-1">Mileage</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.mileage}
              placeholder="45000"
              onChange={(e) => set('mileage', e.target.value)}
              className="w-full bg-surface2 text-text rounded-lg px-3 py-3 text-[16px] border border-border focus:border-accent focus:outline-none"
            />
          </div>
        )}
      </Section>

      {/* Section 2: Deal Numbers */}
      <Section title="Deal Numbers" expanded={expandedSections.deal} onToggle={() => toggleSection('deal')}>
        <MoneyInput
          label="Vehicle Price (Before Taxes & Fees)"
          value={form.price}
          onChange={(v) => set('price', v)}
          placeholder="28500"
        />
        {errors.price && <p className="text-red text-xs mt-1">{errors.price}</p>}

        <div className="mt-3">
          <MoneyInput
            label="Down Payment"
            value={form.down}
            onChange={(v) => set('down', v)}
            placeholder="0"
          />
        </div>

        {/* Trade-in toggle */}
        <div className="mt-4">
          <button
            onClick={() => set('hasTradeIn', !form.hasTradeIn)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              form.hasTradeIn ? 'text-accent' : 'text-text2 hover:text-text'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              form.hasTradeIn ? 'bg-accent border-accent' : 'border-border'
            }`}>
              {form.hasTradeIn && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            I have a trade-in
          </button>
        </div>

        {form.hasTradeIn && (
          <div className="grid grid-cols-2 gap-3 mt-3 animate-fade-up">
            <MoneyInput
              label="Trade-in Value"
              value={form.tradeIn}
              onChange={(v) => set('tradeIn', v)}
            />
            <MoneyInput
              label="Amount Owed"
              value={form.tradeOwed}
              onChange={(v) => set('tradeOwed', v)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <MoneyInput
            label="Doc Fee"
            value={form.docFee}
            onChange={(v) => set('docFee', v)}
            hint={feeInfo?.docFee?.capped ? `Cap: $${feeInfo.docFee.cap} (${feeInfo.state})` : undefined}
          />
          <MoneyInput
            label="Registration Fee"
            value={form.regFee}
            onChange={(v) => set('regFee', v)}
          />
        </div>
      </Section>

      {/* Section 3: Add-ons (near fees — user may want to check price + add-ons without financing) */}
      <Section title="Add-ons" expanded={expandedSections.addons} onToggle={() => toggleSection('addons')} badge={form.addons.filter(a => a.enabled).length || null}>
        <div className="space-y-2">
          {form.addons.map((addon, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => {
                  const updated = [...form.addons];
                  updated[i] = { ...updated[i], enabled: !updated[i].enabled };
                  set('addons', updated);
                }}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  addon.enabled ? 'bg-accent border-accent' : 'border-border'
                }`}
              >
                {addon.enabled && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${addon.enabled ? 'text-text' : 'text-text2'}`}>
                {addon.name || <span className="text-text2 italic">Unnamed</span>}
              </span>
              {addon.enabled && (
                <div className="w-28">
                  <MoneyInput
                    value={addon.price}
                    onChange={(v) => {
                      const updated = [...form.addons];
                      updated[i] = { ...updated[i], price: v };
                      set('addons', updated);
                    }}
                    placeholder="0"
                  />
                </div>
              )}
              {addon.custom && (
                <button
                  onClick={() => {
                    set('addons', form.addons.filter((_, idx) => idx !== i));
                  }}
                  className="text-text2 hover:text-red text-lg leading-none px-1 transition-colors"
                  title="Remove"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add custom item: inline name input with Add button */}
        {customAddonName !== null ? (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Add-on name (e.g. Tyre Disposal Fee)"
              value={customAddonName}
              autoFocus
              onChange={(e) => setCustomAddonName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customAddonName.trim()) {
                  set('addons', [...form.addons, { name: customAddonName.trim(), price: '', enabled: true, custom: true }]);
                  setCustomAddonName(null);
                } else if (e.key === 'Escape') {
                  setCustomAddonName(null);
                }
              }}
              className="flex-1 bg-surface2 text-text rounded-lg px-3 py-2 text-sm border border-accent focus:outline-none"
            />
            <button
              onClick={() => {
                if (customAddonName.trim()) {
                  set('addons', [...form.addons, { name: customAddonName.trim(), price: '', enabled: true, custom: true }]);
                  setCustomAddonName(null);
                }
              }}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setCustomAddonName(null)}
              className="px-3 py-2 text-text2 hover:text-text text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCustomAddonName('')}
            className="mt-3 text-sm text-accent hover:text-accent-hover font-medium"
          >
            + Add custom item
          </button>
        )}
      </Section>

      {/* Section 4: Financing */}
      <Section title="Financing" expanded={expandedSections.financing} onToggle={() => toggleSection('financing')}>
        {/* Financing toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => set('hasFinancing', true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              form.hasFinancing
                ? 'bg-accent text-white'
                : 'bg-surface2 text-text2 hover:text-text'
            }`}
          >
            Financing a Loan
          </button>
          <button
            onClick={() => set('hasFinancing', false)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              !form.hasFinancing
                ? 'bg-green/90 text-white'
                : 'bg-surface2 text-text2 hover:text-text'
            }`}
          >
            Paying Cash
          </button>
        </div>

        {form.hasFinancing ? (
          <>
            <label className="block text-sm text-text2 mb-2">Credit Score</label>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {CREDIT_TIERS.map(tier => (
                <button
                  key={tier.value}
                  onClick={() => handleCreditTier(tier.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    form.creditTier === tier.value
                      ? 'bg-accent text-white'
                      : 'bg-surface2 text-text2 hover:text-text'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text2 mb-1">
                  APR %
                  {form.aprAuto && <span className="ml-1 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">Auto</span>}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.aprDisplay ?? form.apr}
                  onFocus={() => set('aprDisplay', String(form.apr))}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, '');
                    set('aprDisplay', raw);
                    const num = parseFloat(raw);
                    if (!isNaN(num)) set('apr', num);
                    set('aprAuto', false);
                  }}
                  onBlur={() => {
                    set('aprDisplay', undefined);
                  }}
                  className="w-full bg-surface2 text-text rounded-lg px-3 py-3 text-[16px] border border-border focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-text2 mb-1">Loan Term</label>
                <select
                  value={form.term}
                  onChange={(e) => set('term', parseInt(e.target.value))}
                  className="w-full bg-surface2 text-text rounded-lg px-3 py-3 text-[16px] border border-border focus:border-accent focus:outline-none"
                >
                  {TERMS.map(t => (
                    <option key={t} value={t}>{t} months</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5 p-3 bg-green/10 border border-green/20 rounded-lg">
            <svg className="w-4 h-4 text-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
            <p className="text-sm text-text2">Cash deal — no interest charges. Financing factors will score full marks.</p>
          </div>
        )}
      </Section>

      {/* Validation errors above submit button */}
      {Object.keys(errors).filter(k => k !== 'submit').length > 0 && (
        <div className="bg-red/10 border border-red/30 rounded-xl p-3 mb-3">
          <p className="text-red text-sm font-semibold mb-1">Missing required fields:</p>
          <ul className="space-y-0.5">
            {Object.entries(errors).filter(([k]) => k !== 'submit').map(([key, msg]) => (
              <li key={key} className="text-red text-xs flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red flex-shrink-0" />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red/10 border border-red/30 rounded-xl p-3 mb-3 text-sm text-red">
          {errors.submit}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={analyzing}
        className="w-full py-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-xl text-lg transition-colors mb-4"
      >
        {analyzing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing Deal...
          </span>
        ) : (
          'Analyze This Deal'
        )}
      </button>

      {/* Payment Preview Bar (only when financing) */}
      {form.hasFinancing && (
        <PaymentPreview
          price={form.price}
          down={form.down}
          tradeIn={form.hasTradeIn ? form.tradeIn : 0}
          tradeOwed={form.hasTradeIn ? form.tradeOwed : 0}
          apr={form.apr}
          term={form.term}
          addons={form.addons}
          taxRate={taxRate}
          docFee={form.docFee}
        />
      )}
    </div>
  );
}

function Section({ title, expanded, onToggle, children, badge }) {
  return (
    <div className="bg-surface border border-border rounded-xl mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-text flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">{badge}</span>
          )}
        </span>
        <svg
          className={`w-5 h-5 text-text2 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
