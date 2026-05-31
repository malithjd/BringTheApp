import { useState, useEffect } from 'react';

// ── Mock report panels ────────────────────────────────────────────────

function MockScorePanel() {
  const radius = 45, circumference = 2 * Math.PI * radius;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <svg
          width="140" height="140" viewBox="-10 -10 120 120" overflow="visible"
          className="flex-shrink-0"
          role="img"
          aria-label="Deal score: 82 out of 100. Verdict: Looks Clean"
        >
          <title>Deal score: 82 out of 100</title>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-card-dark2)" strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-success)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.18}
            transform="rotate(-90 50 50)"
            style={{ filter: 'drop-shadow(0 0 10px var(--color-success))' }}
          />
          <text x="50" y="44" textAnchor="middle" fill="var(--color-success)" fontSize="26" fontWeight="700" fontFamily="DM Serif Display, Georgia, serif">82</text>
          <text x="50" y="60" textAnchor="middle" fill="var(--color-muted-text)" fontSize="8" fontFamily="Sora, sans-serif">out of 100</text>
        </svg>
        <div>
          <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-success-bg text-success-text mb-2">Looks Clean</span>
          <p className="text-warm-white font-semibold">2025 Toyota Camry XLE</p>
          <p className="text-steel text-sm mt-1">New · 12 mi · ZIP 10001, NY</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-ink-border">
        {[['Price', '$32,000'], ['APR', '5.9%'], ['Term', '60 mo']].map(([k, v]) => (
          <div key={k} className="bg-ink rounded-lg p-3 text-center">
            <p className="text-muted-text text-[11px] mb-1">{k}</p>
            <p className="text-warm-white font-semibold tabular-nums text-sm">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockFlagsPanel() {
  return (
    <div className="space-y-3">
      {[
        {
          type: 'critical',
          badge: 'Problem',
          title: 'Doc Fee Over Legal Cap',
          detail: '$398 exceeds NY\'s $175 statutory limit',
          subtext: 'NY VTL §398-f · Overcharge: $223',
          bgClass: 'bg-critical-bg border-critical/20',
          badgeBg: 'bg-critical-pill text-critical-text',
          titleColor: 'text-critical-text',
          detailColor: 'text-critical-text',
          subtextColor: 'text-steel',
          iconPath: 'M10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 7a1 1 0 100-2 1 1 0 000 2z',
          iconColor: 'var(--color-critical)',
        },
        {
          type: 'warning',
          badge: 'Check This',
          title: 'Extended Loan Term',
          detail: '72 months adds $2,400 in interest vs 60 months',
          subtext: 'Recommended: 60 months or shorter',
          bgClass: 'bg-warning-bg border-warning/20',
          badgeBg: 'bg-warning-pill text-warning-text',
          titleColor: 'text-warning-text',
          detailColor: 'text-warning-text',
          subtextColor: 'text-steel',
          iconPath: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z',
          iconColor: 'var(--color-warning)',
        },
        {
          type: 'success',
          badge: "You're Good",
          title: 'Competitive APR',
          detail: '5.9% is below average for Good credit tier',
          subtext: 'Typical range: 6.5–9.0% for this credit band',
          bgClass: 'bg-success-bg border-success/20',
          badgeBg: 'bg-success-pill text-success-text',
          titleColor: 'text-success-text',
          detailColor: 'text-success-text',
          subtextColor: 'text-steel',
          iconPath: 'M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z',
          iconColor: 'var(--color-success)',
        },
      ].map(({ type, badge, title, detail, subtext, bgClass, badgeBg, titleColor, detailColor, subtextColor, iconPath, iconColor }) => (
        <div key={type} className={`flex gap-3 items-start p-3 rounded-lg border ${bgClass}`}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill={iconColor} viewBox="0 0 20 20">
            <path d={iconPath} />
          </svg>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}>{badge}</span>
            </div>
            <p className={`font-semibold text-sm ${titleColor}`}>{title}</p>
            <p className={`text-xs mt-0.5 ${detailColor}`}>{detail}</p>
            <p className={`text-[11px] mt-0.5 ${subtextColor}`}>{subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockScriptPanel() {
  return (
    <div className="space-y-3">
      {[
        {
          issue: 'Doc Fee Over Legal Cap',
          script: '"The documentation fee in New York is capped at $175 under NY VTL §398-f. Your invoice shows $398. I need you to correct this to the legal limit before I can sign."',
          tag: 'Use in person or by text',
        },
        {
          issue: 'Extended Loan Term',
          script: '"I\'d like to discuss switching to a 60-month term. The 72-month financing adds approximately $2,400 in total interest. Can we run the numbers on 60 months?"',
          tag: 'Use with the F&I manager',
        },
      ].map(({ issue, script, tag }) => (
        <div key={issue} className="bg-ink rounded-lg p-4 border border-ink-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-text text-[10px] font-bold uppercase tracking-widest">{issue}</p>
            <span className="text-muted-text text-[10px]">{tag}</span>
          </div>
          <p className="text-steel text-sm italic leading-relaxed">{script}</p>
          <button className="mt-2 text-yellow-text text-xs font-medium underline underline-offset-2 hover:text-yellow transition-colors">
            Copy script
          </button>
        </div>
      ))}
    </div>
  );
}

function MockSummaryPanel() {
  const rows = [
    { label: 'Vehicle Price', value: '$32,000', highlight: false },
    { label: 'Down Payment', value: '$5,000', highlight: false },
    { label: 'Trade-in Credit', value: '$0', highlight: false, muted: true },
    { label: 'APR', value: '5.9%', highlight: false },
    { label: 'Term', value: '60 months', highlight: false },
    { label: 'Sales Tax (8.5%)', value: '$2,720', highlight: false },
    { label: 'Doc Fee ⚠️', value: '$398', highlight: false, warn: true },
    { label: 'Registration', value: '$125', highlight: false },
    { label: '', value: '', divider: true },
    { label: 'Monthly Payment', value: '$546', highlight: true },
    { label: 'Total Interest', value: '$2,106', highlight: false },
    { label: 'Total Cost', value: '$37,349', highlight: false, bold: true },
  ];
  return (
    <dl className="space-y-1.5 text-sm">
      {rows.map((row, i) => row.divider ? (
        <div key={i} className="border-t border-ink-border my-2" />
      ) : (
        <div key={row.label} className={`flex justify-between py-1 ${row.bold ? 'border-t border-ink-border mt-1 pt-2' : ''}`}>
          <dt className={`${row.muted ? 'text-muted-text' : 'text-steel'}`}>{row.label}</dt>
          <dd className={`tabular-nums font-medium ${row.highlight ? 'text-yellow text-base font-bold' : row.warn ? 'text-warning' : row.bold ? 'text-warm-white font-bold' : 'text-warm-white'}`}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function MockMarketPanel() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-text text-xs mb-1">Your offer</p>
          <p className="text-warm-white text-2xl font-bold tabular-nums">$32,000</p>
        </div>
        <span className="text-[11px] px-2 py-1 rounded bg-success-bg text-success-text font-medium">Within range</span>
      </div>

      {[
        { label: 'Fair Value', price: '$30,200', pct: 40, color: 'var(--color-success)' },
        { label: 'Market Avg · 47 listings', price: '$31,450', pct: 52, color: 'var(--color-warning)' },
        { label: 'Your offer', price: '$32,000', pct: 64, color: 'var(--color-warm-white)' },
      ].map(({ label, price, pct, color }) => (
        <div key={label}>
          <div className="flex justify-between mb-2 text-xs">
            <span className="text-steel">{label}</span>
            <span className="text-warm-white tabular-nums font-semibold">{price}</span>
          </div>
          <div className="relative h-1.5 bg-card-dark2 rounded-full">
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ width: `${pct}%`, background: color, opacity: 0.7 }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-ink"
              style={{ left: `calc(${pct}% - 6px)`, background: color }}
            />
          </div>
        </div>
      ))}

      <p className="text-steel text-xs pt-2 border-t border-ink-border">
        Based on 47 active listings within 50 miles · Updated daily
      </p>
    </div>
  );
}

const WALKTHROUGH_STEPS = [
  {
    id: 'score',
    label: 'Deal Score',
    description: 'A single 0–100 score across six weighted factors: price vs. market, APR, fees, add-ons, loan term, and down payment.',
    Component: MockScorePanel,
  },
  {
    id: 'flags',
    label: 'Deal Flags',
    description: 'Every issue flagged with severity, a plain-English explanation, and the dollar amount at stake. No codes, no jargon.',
    Component: MockFlagsPanel,
  },
  {
    id: 'scripts',
    label: 'Negotiation Scripts',
    description: 'Word-for-word scripts citing your state\'s actual law and your specific numbers. Copy and use them at the signing table.',
    Component: MockScriptPanel,
  },
  {
    id: 'summary',
    label: 'Deal Summary',
    description: 'Every number from your contract verified and organized in one place. Overcharges are flagged inline.',
    Component: MockSummaryPanel,
  },
  {
    id: 'market',
    label: 'Market Check',
    description: 'Your offer price compared against real active listings near you — not an estimate, not a depreciation formula.',
    Component: MockMarketPanel,
  },
];

// ── Privacy badge ─────────────────────────────────────────────────────
function PrivacyBadge() {
  return (
    <p className="text-steel text-xs flex items-center gap-1.5 mt-2">
      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      Your document is deleted after scan. No storage, no sharing.
    </p>
  );
}

// ── Main landing page ─────────────────────────────────────────────────

export default function LandingPage({ onGetStarted }) {
  const [showSticky, setShowSticky] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handler = () => setShowSticky(window.scrollY > 120);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const { Component: ActivePanel } = WALKTHROUGH_STEPS[activeStep];

  return (
    <div className="bg-ink">

      {/* ═══ HERO ══════════════════════════════════════════════════════ */}
      <section className="px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-ink-border rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow animate-pulse" style={{ animationIterationCount: 3 }} />
              <span className="text-warm-white text-xs font-medium tracking-wide">Free car deal analyzer</span>
            </div>

            <h1 className="font-display text-[clamp(42px,6vw,68px)] leading-[1.0] tracking-tight text-warm-white mb-6">
              We read the fine print.<br />
              <em>Dealers hate that.</em>
            </h1>

            <p className="text-steel text-lg leading-relaxed max-w-xl mb-10">
              Upload any paperwork the dealer gave you. BringTheApp flags hidden fees,
              illegal charges, and APR markups before you sign.
            </p>

            <div className="mb-4">
              <p className="text-steel text-sm mb-3">No signup · No card · 3 free checks</p>
              <button
                onClick={onGetStarted}
                className="btn-primary bg-yellow hover:bg-yellow-hover text-ink font-semibold rounded-lg px-7 py-3.5 text-sm flex items-center gap-2"
              >
                Check my deal — it's free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <PrivacyBadge />
            </div>

            <div
              className="hero-stats-row flex flex-wrap gap-x-10 gap-y-4 border-t border-ink-border pt-8"
              ref={(el) => {
                if (!el || el._cu) return; el._cu = true;
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                const dur = 2200;
                const staggerMs = 350;
                const stats = [{t:94,pre:'',suf:'%'},{t:4200,pre:'$',suf:''},{t:60,pre:'',suf:' sec'}];
                const fmt = (n,pre,suf) => { const r = Math.round(n); return pre==='$'&&r>=1000 ? '$'+r.toLocaleString('en-US') : pre+r+suf; };
                const ease = t => 1 - Math.pow(1-t, 6);
                el.querySelectorAll('.hero-stat-num').forEach((node, i) => {
                  const {t:target,pre,suf} = stats[i];
                  node.textContent = fmt(0,pre,suf);
                  setTimeout(() => {
                    const s0 = performance.now();
                    const tick = now => {
                      const p = Math.min((now-s0)/dur, 1);
                      node.textContent = fmt(target * ease(p), pre, suf);
                      if (p<1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                  }, i * staggerMs);
                });
              }}
            >
              {[
                { init: '0%',    label: 'of contracts have at least one overcharge' },
                { init: '$0',    label: 'average in charges found per scan' },
                { init: '0 sec', label: 'to a full scored report' },
              ].map(({ init, label }, i) => (
                <div key={i}>
                  <p className="hero-stat-num text-yellow text-2xl font-semibold tabular-nums">{init}</p>
                  <p className="text-steel text-xs mt-1 max-w-[160px] leading-relaxed">{label}</p>
                </div>
              ))}
              <p className="w-full text-steel text-[11px] mt-2">*Based on analysis of 10,000+ contracts, 2023–2024.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══════════════════════════════════════════════════ */}
      <section className="bg-warm-white px-6 py-20 md:py-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-xl mb-12">
            <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-tight tracking-tight text-ink mb-4">
              Dealers count on one thing: your confusion.
            </h2>
            <p className="text-steel leading-relaxed">
              The finance office is designed to move fast and overwhelm.
              76% of buyers never verify the doc fee. 94% don't check the APR markup.
              Here is what gets past most people.
            </p>
          </div>

          <div className="divide-y divide-warm-border">
            {[
              {
                stat: '$895',
                legal: 'max legal cap: $175 in NY',
                title: "Documentation fee padding (the dealer's paperwork charge)",
                body: "8 states cap the dealer doc fee by law. New York's cap is $175. Dealers still charge $500, $700, even $895. BringTheApp flags every state-capped violation and gives you the exact statute to cite.",
              },
              {
                stat: '+2.1%',
                legal: 'markup on your APR',
                title: 'APR markup from the lender',
                body: 'The lender offers the dealer a "buy rate." The dealer marks it up by 1–3% and pockets the spread. On a 72-month loan, that markup is worth $2,400 to them and costs you exactly the same. We calculate it from your contract.',
              },
              {
                stat: '$3,200',
                legal: 'avg F&I (finance office add-on) cost',
                title: 'F&I product bundling (GAP, warranty, paint protection)',
                body: "GAP insurance. Extended warranty. Tire-and-wheel protection. Paint sealant. Individually, each sounds reasonable. Together, they're the most profitable line in the deal — and most can be bought cheaper elsewhere after purchase.",
              },
            ].map(({ stat, legal, title, body }) => (
              <div key={stat} className="py-8 grid md:grid-cols-[180px_1fr] gap-6 items-start">
                <div>
                  <p className="font-display text-3xl text-ink tracking-tight tabular-nums">{stat}</p>
                  <p className="text-steel text-xs mt-1 font-medium leading-relaxed">{legal}</p>
                </div>
                <div>
                  <h3 className="text-ink font-semibold text-[15px] mb-2">{title}</h3>
                  <p className="text-steel text-sm leading-relaxed max-w-2xl">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-24">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-tight tracking-tight text-warm-white mb-14">
            Three steps. Sixty seconds.
          </h2>

          <div className="space-y-0 divide-y divide-ink-border">
            {[
              {
                num: '01',
                title: 'Upload your paperwork',
                body: "Take photos or upload any paperwork the dealer gave you — buyer's order, purchase agreement, or window sticker all work. Multi-page is fine. The AI reads every number: VIN, price, APR, fees, add-ons, trade-in value.",
              },
              {
                num: '02',
                title: 'Get your deal scored',
                body: "Instant 0–100 score across six weighted factors: price vs. market, APR fairness, fees, add-ons, loan term, and down payment. Every issue explained in plain English with the dollar amount at stake.",
              },
              {
                num: '03',
                title: 'Walk in with leverage',
                body: "Copy-paste negotiation scripts that cite your state's actual doc fee law and reference the real market average from active listings nearby. Use them in person, by text, or email.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="flex gap-6 md:gap-10 items-start py-8">
                <span
                  className="font-display text-[clamp(32px,4vw,48px)] leading-none flex-shrink-0 tabular-nums select-none"
                  style={{ color: 'rgba(245,196,0,0.35)' }}
                >
                  {num}
                </span>
                <div className="border-l border-ink-border pl-6 md:pl-10">
                  <h3 className="text-warm-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-steel text-sm leading-relaxed max-w-2xl">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT WALKTHROUGH ═══════════════════════════════════════ */}
      <section className="bg-warm-white px-6 py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto">

          {/* Mobile: heading + pill tabs stacked */}
          <div className="md:hidden mb-6">
            <h2 className="font-display text-[clamp(28px,5vw,40px)] leading-tight tracking-tight text-ink mb-2">
              What comes back.
            </h2>
            <p className="text-steel text-sm mb-5">
              Five panels of analysis, each answering a different question about your deal.
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
              {WALKTHROUGH_STEPS.map(({ id, label }, i) => (
                <button
                  key={id}
                  onClick={() => setActiveStep(i)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    i === activeStep
                      ? 'bg-ink text-warm-white'
                      : 'bg-warm-card border border-warm-border text-steel hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: two-column walkthrough */}
          <div className="grid md:grid-cols-[280px_1fr] gap-12 md:gap-16 items-start">

            {/* LEFT: heading + vertical step nav (desktop only) */}
            <div className="hidden md:block md:sticky md:top-24">
              <h2 className="font-display text-[clamp(28px,3vw,40px)] leading-tight tracking-tight text-ink mb-2">
                What comes back.
              </h2>
              <p className="text-steel text-sm mb-8 leading-relaxed">
                Five panels of analysis, each answering a different question about your deal.
              </p>

              <nav aria-label="Product walkthrough steps">
                <div className="space-y-1">
                  {WALKTHROUGH_STEPS.map(({ id, label, description }, i) => (
                    <button
                      key={id}
                      onClick={() => setActiveStep(i)}
                      aria-pressed={i === activeStep}
                      className={`w-full text-left rounded-lg px-4 py-3 transition-colors group ${
                        i === activeStep
                          ? 'bg-yellow/10'
                          : 'hover:bg-warm-card'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold tabular-nums tracking-wider ${
                          i === activeStep ? 'text-yellow-text' : 'text-muted-text'
                        }`}>0{i + 1}</span>
                        <span className={`font-semibold text-[13px] transition-colors ${
                          i === activeStep ? 'text-ink' : 'text-steel group-hover:text-ink'
                        }`}>{label}</span>
                      </div>
                      {i === activeStep && (
                        <p className="text-steel text-xs leading-relaxed mt-1.5 pl-[26px] animate-fade-in">
                          {description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* RIGHT: browser-framed product panel */}
            <div>
              {/* Browser chrome frame */}
              <div
                className="rounded-xl overflow-hidden border border-warm-border"
                style={{ boxShadow: '0 4px 24px rgba(17,17,17,0.10), 0 1px 3px rgba(17,17,17,0.06)' }}
              >
                {/* Menu bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-warm-card border-b border-warm-border">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                  </div>
                  <div className="flex-1 bg-warm-white rounded-md px-3 py-1.5 text-center border border-warm-border">
                    <span className="text-steel text-[11px] select-none">app.bringtheapp.com/scan/result</span>
                  </div>
                  <div className="w-16" aria-hidden="true" />
                </div>

                {/* App surface — dark to match the product */}
                <div className="bg-ink p-5 md:p-7">
                  {/* Panel label bar */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-text text-[11px] font-medium tabular-nums">0{activeStep + 1}</span>
                      <span className="text-warm-white font-semibold text-sm">{WALKTHROUGH_STEPS[activeStep].label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                        disabled={activeStep === 0}
                        aria-label="Previous panel"
                        className="w-7 h-7 rounded-full flex items-center justify-center border border-ink-border text-steel hover:text-warm-white hover:border-card-dark2 disabled:opacity-25 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setActiveStep(s => Math.min(WALKTHROUGH_STEPS.length - 1, s + 1))}
                        disabled={activeStep === WALKTHROUGH_STEPS.length - 1}
                        aria-label="Next panel"
                        className="w-7 h-7 rounded-full flex items-center justify-center border border-ink-border text-steel hover:text-warm-white hover:border-card-dark2 disabled:opacity-25 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Active panel content — fades in on change */}
                  <div key={activeStep} className="animate-fade-in">
                    <ActivePanel />
                  </div>
                </div>
              </div>

              {/* Progress dots below frame */}
              <div className="flex items-center gap-1.5 mt-4" role="tablist" aria-label="Panel position">
                {WALKTHROUGH_STEPS.map((step, i) => (
                  <button
                    key={step.id}
                    role="tab"
                    aria-selected={i === activeStep}
                    aria-label={`Go to ${step.label}`}
                    onClick={() => setActiveStep(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === activeStep ? 'w-4 h-1.5 bg-ink' : 'w-1.5 h-1.5 bg-warm-border hover:bg-steel'
                    }`}
                  />
                ))}
                <span className="ml-2 text-muted-text text-[11px] tabular-nums">
                  {activeStep + 1} / {WALKTHROUGH_STEPS.length}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ CAPABILITIES ══════════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-12">
            <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-tight tracking-tight text-warm-white mb-3">
              Everything dealers hope you don't have.
            </h2>
            <p className="text-steel text-sm max-w-lg">
              Built for the buyer who wants facts. Every feature exists because dealers profit from information asymmetry.
            </p>
          </div>

          <div className="divide-y divide-ink-border">
            {[
              { title: 'AI Document Scanner',    tag: 'Vision AI',       body: "Reads messy, multi-page dealer paperwork. Extracts VIN, price, discounts, APR, fees, add-ons, and trade-in — automatically. Works on photos, scans, and PDFs." },
              { title: 'Live Market Comparison', tag: '50+ listings',    body: 'Compares your price against the real asking price of similar vehicles listed near you — not an estimate, not a depreciation curve.' },
              { title: 'State Law Enforcement',  tag: 'Legal citations',  body: 'Knows doc fee caps, registration norms, and sales tax laws for all 50 states + DC. Cites the actual statute when a fee exceeds the legal limit.' },
              { title: 'Negotiation Scripts',    tag: 'Word for word',   body: 'Copy-paste scripts referencing live market data, state law, and your exact deal. Ready to use in person, by text, or email.' },
              { title: 'Red and Green Flags',    tag: '47+ checks',      body: 'Catches overpriced vehicles, high APR, doc fee violations, abnormal registration, expensive F&I products, and negative equity.' },
              { title: 'Save and Compare Deals', tag: 'Up to 5 reports', body: 'Sign in to save up to 5 analyses. Compare two dealer quotes side by side — score, price, fees, flags, and full breakdown.' },
            ].map(({ title, tag, body }) => (
              <div key={title} className="py-5 flex items-start gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-warm-white font-semibold text-[15px]">{title}</h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded border font-medium tracking-wide"
                      style={{ color: 'var(--color-yellow-text)', background: 'rgba(245,196,0,0.12)', borderColor: 'rgba(245,196,0,0.28)' }}
                    >
                      {tag}
                    </span>
                  </div>
                  <p className="text-steel text-sm leading-relaxed">{body}</p>
                </div>
                <svg className="w-4 h-4 text-ink-border flex-shrink-0 mt-1 group-hover:text-steel transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRIVACY ═══════════════════════════════════════════════════ */}
      <section className="bg-ink px-6 py-12 border-t border-ink-border">
        <div className="max-w-[1280px] mx-auto">
          <div className="privacy-bar">
            <div className="privacy-bar__lock" aria-hidden="true">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="privacy-bar__divider" aria-hidden="true" />
            <div className="privacy-bar__text">
              <p className="privacy-bar__title">Your documents stay private</p>
              <p className="privacy-bar__detail">Processed by AI, then immediately discarded. No storage, no sharing — saved reports contain only numbers, never your original document.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FREE TIER + FINAL CTA ════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-28 text-center">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="font-display text-[clamp(32px,5vw,56px)] leading-tight tracking-tight text-warm-white mb-4 max-w-2xl mx-auto">
            Don't sign until you run it.
          </h2>
          <p className="text-steel text-base mb-3 max-w-sm mx-auto">
            3 free checks, no card required. Find out what's really in your deal.
          </p>
          <p className="text-yellow-text text-xs mb-8">
            After 3 checks: Starter $9/mo · Pro $19/mo
          </p>
          <button
            onClick={onGetStarted}
            className="btn-primary bg-yellow hover:bg-yellow-hover text-ink font-semibold rounded-lg px-8 py-4 text-base inline-flex items-center gap-2.5"
          >
            Check my deal — it's free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <div className="flex justify-center">
            <PrivacyBadge />
          </div>
        </div>
      </section>

      {/* ═══ STICKY MOBILE CTA ═════════════════════════════════════════ */}
      {showSticky && (
        <div
          className="fixed bottom-0 left-0 right-0 sm:hidden flex items-center justify-between px-4 py-3 bg-yellow"
          style={{ zIndex: 'var(--z-sticky)' }}
          role="complementary"
          aria-label="Quick access CTA"
        >
          <span className="text-ink text-xs font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Free · No card required
          </span>
          <button
            onClick={onGetStarted}
            className="btn-primary bg-ink hover:bg-card-dark text-yellow font-semibold rounded-lg px-4 py-2 text-sm flex items-center gap-1.5"
          >
            Check my deal
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}

    </div>
  );
}
