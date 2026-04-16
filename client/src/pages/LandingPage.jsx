export default function LandingPage({ onGetStarted }) {
  return (
    <div>
      {/* ==================== HERO ==================== */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        {/* Gradient orb — subtle depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }} />

        <div className="relative max-w-2xl">
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-5">
            Free car deal analyzer
          </p>

          <h1 className="text-[2.75rem] sm:text-[3.5rem] leading-[1.08] font-extrabold text-text mb-6">
            Know if your deal
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
              is worth signing.
            </span>
          </h1>

          <p className="text-text2 text-lg leading-relaxed max-w-lg mb-10">
            Upload your purchase agreement. In seconds, get a score, market comparison against real listings,
            and negotiation scripts backed by your state's laws.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <button
              onClick={onGetStarted}
              className="group relative px-7 py-3.5 bg-accent text-white font-semibold rounded-xl transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20"
            >
              <span className="flex items-center gap-2.5">
                Check Your Deal
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
            <span className="text-text2 text-sm self-center">
              No signup. No credit card. 30 seconds.
            </span>
          </div>
        </div>
      </section>

      {/* ==================== METRICS BAR ==================== */}
      <section className="border-y border-border-subtle py-8 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {[
            { value: '6', label: 'Scoring factors' },
            { value: '50', label: 'States + DC' },
            { value: '50+', label: 'Live comps per deal' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-text tabular-nums">{value}</p>
              <p className="text-xs text-text2 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-20 px-4">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">How it works</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text mb-12">
          Three steps. Under a minute.
        </h2>

        <div className="space-y-6">
          {[
            {
              num: '01',
              title: 'Upload your paperwork',
              desc: 'Snap a photo of the purchase agreement, buyer\'s order, or window sticker. Our AI reads every number on every page — VIN, price, APR, fees, add-ons, trade-in.',
            },
            {
              num: '02',
              title: 'Get your deal scored',
              desc: 'Instant 0-100 score across six factors: price vs. market, APR fairness, fees, add-ons, loan term, and down payment. Compared against real dealer listings near you.',
            },
            {
              num: '03',
              title: 'Walk in with leverage',
              desc: 'Get copy-paste negotiation scripts that cite your state\'s doc fee laws, reference the actual market average from active listings, and tell you exactly what to say.',
            },
          ].map(({ num, title, desc }) => (
            <div key={num} className="flex gap-5 items-start">
              <span className="text-accent/30 text-3xl font-extrabold tabular-nums leading-none pt-1 select-none">{num}</span>
              <div className="border-l border-border-subtle pl-5 pb-2">
                <h3 className="text-text font-bold text-lg mb-1">{title}</h3>
                <p className="text-text2 text-sm leading-relaxed max-w-md">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== DEMO RESULT ==================== */}
      <section className="py-20 px-4 border-y border-border-subtle" style={{ background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)' }}>
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">Live preview</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text mb-4">
          What your analysis looks like
        </h2>
        <p className="text-text2 text-sm mb-10 max-w-md">Every deal gets this breakdown. Scores, flags, market data, and scripts — all in one view.</p>

        <div className="max-w-sm mx-auto space-y-4">
          {/* Mock score */}
          <div className="bg-bg border border-border rounded-2xl p-6 text-center">
            <svg width="130" height="130" viewBox="-10 -10 120 120" overflow="visible" className="mx-auto">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface2)" strokeWidth="7" strokeLinecap="round" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-green)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * 0.18}`}
                transform="rotate(-90 50 50)"
                style={{ filter: 'drop-shadow(0 0 6px var(--color-green))' }}
              />
              <text x="50" y="46" textAnchor="middle" fill="var(--color-green)" fontSize="22" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">82</text>
              <text x="50" y="59" textAnchor="middle" fill="var(--color-text2)" fontSize="7">out of 100</text>
            </svg>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green/10 text-green border border-green/20">Good Deal</span>
            <p className="mt-2 text-text2 text-sm">2025 Toyota Camry XLE</p>
          </div>

          {/* Mock breakdown */}
          <div className="bg-bg border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-text2 uppercase tracking-wider mb-3">Score breakdown</p>
            {[
              { name: 'Price vs Market', pts: 25, max: 35, pct: 71 },
              { name: 'APR Fairness', pts: 20, max: 20, pct: 100 },
              { name: 'Fees', pts: 15, max: 15, pct: 100 },
              { name: 'Add-ons', pts: 12, max: 15, pct: 80 },
              { name: 'Loan Term', pts: 5, max: 8, pct: 63 },
              { name: 'Down Payment', pts: 5, max: 7, pct: 71 },
            ].map(f => {
              const color = f.pct >= 70 ? 'var(--color-green)' : f.pct >= 40 ? 'var(--color-amber)' : 'var(--color-red)';
              return (
                <div key={f.name} className="mb-2.5 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text2">{f.name}</span>
                    <span style={{ color }} className="font-semibold tabular-nums">{f.pts}/{f.max}</span>
                  </div>
                  <div className="h-1 bg-surface2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${f.pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mock flag */}
          <div className="bg-bg border border-amber/20 rounded-2xl px-5 py-4 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-lg bg-amber/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-amber" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <p className="text-amber font-semibold text-sm">Long Loan Term</p>
              <p className="text-text2 text-xs mt-0.5 leading-relaxed">72-month term means $2,400 more in interest compared to 60 months.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CAPABILITIES ==================== */}
      <section className="py-20 px-4">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">What's under the hood</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text mb-4">
          Everything dealers hope
          <br />you don't have access to.
        </h2>
        <p className="text-text2 text-sm mb-12 max-w-lg">
          Built for the buyer who wants facts, not feelings. Every feature exists because dealers profit from information asymmetry.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: 'AI Document Scanner',
              desc: 'Reads messy, multi-page dealer paperwork. Extracts VIN, price, discounts, APR, fees, add-ons, and trade-in — automatically.',
              tag: 'Vision AI',
            },
            {
              title: 'Live Market Comparison',
              desc: 'Compares your price against the real asking price of similar vehicles listed near you — not a theoretical estimate.',
              tag: '50+ listings',
            },
            {
              title: 'State Law Enforcement',
              desc: 'Knows doc fee caps, registration norms, and tax laws for all 50 states + DC. Cites the actual statute when a fee is illegal.',
              tag: 'Legal citations',
            },
            {
              title: 'Negotiation Scripts',
              desc: 'Copy-paste scripts referencing live market data, state law, and your exact deal. Ready to text, email, or say in person.',
              tag: 'Word for word',
            },
            {
              title: 'Red & Green Flags',
              desc: 'Catches overpriced vehicles, high APR, doc fee violations, abnormal registration fees, expensive F&I products, and negative equity.',
              tag: '15+ checks',
            },
            {
              title: 'Cash Deal Support',
              desc: 'Not financing? No problem. Cash deals auto-score full marks on APR and term. The scoring engine adapts to your situation.',
              tag: 'Flexible',
            },
          ].map(({ title, desc, tag }) => (
            <div key={title} className="bg-surface border border-border-subtle rounded-2xl p-5 hover:border-border transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-text font-semibold text-[15px]">{title}</h3>
                <span className="text-[10px] text-accent bg-accent/8 px-2 py-0.5 rounded-md font-medium">{tag}</span>
              </div>
              <p className="text-text2 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== INSIGHTS ==================== */}
      <section className="py-20 px-4 border-y border-border-subtle" style={{ background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)' }}>
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">The numbers</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text mb-12">
          What most buyers don't know
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              stat: '$1,847',
              label: 'Average overpay on a new car',
              detail: 'From failing to negotiate below MSRP, accepting inflated doc fees, and bundling unnecessary add-ons.',
            },
            {
              stat: '76%',
              label: 'Don\'t negotiate the doc fee',
              detail: 'Most buyers assume it\'s fixed. In many states it\'s negotiable — and 8 states cap it by law.',
            },
            {
              stat: '$3,200',
              label: 'Average F&I product spend',
              detail: 'Extended warranties, GAP insurance, paint protection — the biggest dealer profit center. Most available cheaper elsewhere.',
            },
            {
              stat: '2.1%',
              label: 'Average dealer APR markup',
              detail: 'Dealers mark up the lender\'s buy rate by 1-3%. A credit union pre-approval eliminates this instantly.',
            },
          ].map(({ stat, label, detail }) => (
            <div key={label} className="bg-bg border border-border rounded-2xl p-6">
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400 mb-2 tabular-nums">{stat}</p>
              <p className="text-text font-semibold text-sm mb-1.5">{label}</p>
              <p className="text-text2 text-xs leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== PRIVACY ==================== */}
      <section className="py-12 px-4">
        <div className="max-w-md mx-auto flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h3 className="text-text font-semibold text-sm mb-1">Your documents stay private</h3>
            <p className="text-text2 text-xs leading-relaxed">
              Processed by AI to extract numbers, then immediately discarded. No storage. No sharing. No accounts.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4 leading-tight">
          Don't sign blind.
        </h2>
        <p className="text-text2 text-base mb-8 max-w-sm mx-auto">
          30 seconds. Free. Could save you thousands.
        </p>
        <button
          onClick={onGetStarted}
          className="group px-8 py-4 bg-accent text-white text-lg font-bold rounded-xl transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20"
        >
          <span className="flex items-center gap-2.5">
            Analyze My Deal
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </button>
      </section>
    </div>
  );
}
