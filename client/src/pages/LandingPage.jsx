export default function LandingPage({ onGetStarted }) {
  return (
    <div className="animate-fade-up">
      {/* ==================== HERO ==================== */}
      <section className="text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
          Free to use — no signup required
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-text leading-tight mb-4">
          Is your car deal<br />
          <span className="text-accent">actually good?</span>
        </h1>

        <p className="text-text2 text-lg sm:text-xl max-w-xl mx-auto mb-3">
          Upload your purchase agreement. Get an instant score,
          market comparison, and word-for-word negotiation scripts
          — before you sign anything.
        </p>

        <p className="text-text2/60 text-sm max-w-md mx-auto mb-8">
          Dealers spend years learning to maximize profit on every deal.
          You get 10 minutes and a pen. We even the odds.
        </p>

        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-accent hover:bg-accent-hover text-white text-lg font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-accent/25"
        >
          Check Your Deal
        </button>

        <p className="text-text2/40 text-xs mt-4">
          Takes 30 seconds. Snap a photo or type your numbers.
        </p>
      </section>

      {/* ==================== SOCIAL PROOF BAR ==================== */}
      <section className="border-y border-border py-6 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-text">100+</p>
            <p className="text-xs text-text2">Deals Analyzed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text">50</p>
            <p className="text-xs text-text2">States Covered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green">$0</p>
            <p className="text-xs text-text2">Always Free</p>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-14 px-4">
        <h2 className="text-2xl font-bold text-text text-center mb-2">How It Works</h2>
        <p className="text-text2 text-sm text-center mb-10 max-w-md mx-auto">Three steps. Under a minute. No signup.</p>

        <div className="max-w-2xl mx-auto grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '1',
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              ),
              title: 'Snap or Upload',
              desc: 'Take a photo of your purchase agreement or upload the PDF. Our AI reads every line — prices, fees, APR, add-ons.',
            },
            {
              step: '2',
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
              title: 'Get Your Score',
              desc: 'Instant 0-100 deal score across 6 factors: price, APR, fees, add-ons, loan term, and down payment.',
            },
            {
              step: '3',
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              ),
              title: 'Negotiate Like a Pro',
              desc: 'Get copy-paste scripts that reference state law, market data, and your exact deal numbers.',
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="bg-surface border border-border rounded-xl p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
                {icon}
              </div>
              <h3 className="text-text font-semibold mb-1">{title}</h3>
              <p className="text-text2 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== MOCK RESULT DEMO ==================== */}
      <section className="py-14 px-4 bg-surface border-y border-border">
        <h2 className="text-2xl font-bold text-text text-center mb-2">What You'll See</h2>
        <p className="text-text2 text-sm text-center mb-10 max-w-md mx-auto">A real analysis from our system. Every deal gets this breakdown.</p>

        <div className="max-w-md mx-auto">
          {/* Mock Score Gauge */}
          <div className="bg-bg border border-border rounded-xl p-6 text-center mb-4">
            <svg width="140" height="140" viewBox="-10 -10 120 120" overflow="visible" className="mx-auto">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface2)" strokeWidth="8" strokeLinecap="round" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-green)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - 0.82)}`}
                transform="rotate(-90 50 50)"
                style={{ filter: 'drop-shadow(0 0 8px var(--color-green))' }}
              />
              <text x="50" y="46" textAnchor="middle" fill="var(--color-green)" fontSize="24" fontWeight="700">82</text>
              <text x="50" y="60" textAnchor="middle" fill="var(--color-text2)" fontSize="7">out of 100</text>
            </svg>
            <div className="mt-2">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-green/10 text-green">Good Deal</span>
            </div>
            <p className="mt-3 text-text2 text-sm">2025 Toyota Camry XLE <span className="ml-2 text-xs bg-surface2 px-2 py-0.5 rounded">New</span></p>
          </div>

          {/* Mock Score Breakdown */}
          <div className="bg-bg border border-border rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-text mb-3 text-sm">Score Breakdown</h3>
            {[
              { name: 'Price vs Market', pts: 25, max: 35, color: 'var(--color-green)' },
              { name: 'APR Fairness', pts: 20, max: 20, color: 'var(--color-green)' },
              { name: 'Fees', pts: 15, max: 15, color: 'var(--color-green)' },
              { name: 'Add-ons', pts: 12, max: 15, color: 'var(--color-green)' },
              { name: 'Loan Term', pts: 5, max: 8, color: 'var(--color-amber)' },
              { name: 'Down Payment', pts: 5, max: 7, color: 'var(--color-green)' },
            ].map(f => (
              <div key={f.name} className="mb-2 last:mb-0">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-text2">{f.name}</span>
                  <span style={{ color: f.color }} className="font-medium">{f.pts}/{f.max}</span>
                </div>
                <div className="h-1 bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(f.pts / f.max) * 100}%`, backgroundColor: f.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Mock Flag */}
          <div className="bg-bg border border-border rounded-xl p-4">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="text-amber font-semibold text-sm">Long Loan Term</p>
                <p className="text-text2 text-xs mt-0.5">72-month term means $2,400 more in interest vs 60 months.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES DEEP DIVE ==================== */}
      <section className="py-14 px-4">
        <h2 className="text-2xl font-bold text-text text-center mb-2">Why Dealers Hope You Don't Use This</h2>
        <p className="text-text2 text-sm text-center mb-10 max-w-lg mx-auto">Every tool a buyer needs to walk in confident — backed by real data, not guesswork.</p>

        <div className="max-w-2xl mx-auto space-y-5">
          {[
            {
              title: 'AI Document Scanner',
              desc: 'Snap a photo of any purchase agreement — even messy, multi-page dealer paperwork. Our AI extracts every number: VIN, price, APR, fees, add-ons, trade-in, and down payment. No typing required.',
              badge: 'Powered by AI',
            },
            {
              title: 'Live Market Comparison',
              desc: 'Your price is compared against the actual market average from live dealer listings near you — not a theoretical depreciation estimate. See how your deal stacks up against real asking prices.',
              badge: '50+ comparable listings',
            },
            {
              title: 'State Law Enforcement',
              desc: 'Every state has different rules for doc fees, registration, and sales tax. We know the legal caps, cite the actual statutes, and flag fees that exceed them. Ohio Admin Code? NY VTL? We\'ve got it.',
              badge: '51 jurisdictions',
            },
            {
              title: 'Copy-Paste Negotiation Scripts',
              desc: '"I\'ve researched the 2024 Camry and comparable vehicles are listed for around $28,400 based on 47 active listings. Your asking price of $32,000 is $3,600 above market. Can we work toward $28,968?" — Ready to use.',
              badge: 'Word for word',
            },
            {
              title: 'Red & Green Flag Detection',
              desc: 'Catches overpriced vehicles, high APRs, illegal doc fees, abnormal registration charges, expensive F&I add-ons, negative equity, and high interest burden. Also highlights what\'s going well.',
              badge: '15+ checks',
            },
            {
              title: 'Smart Scoring Engine',
              desc: 'Six weighted factors — Price (35pts), APR (20pts), Fees (15pts), Add-ons (15pts), Term (8pts), Down Payment (7pts). Cash deals auto-score full marks on financing factors. Extreme overpay caps prevent inflated scores.',
              badge: '0-100 score',
            },
          ].map(({ title, desc, badge }) => (
            <div key={title} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-text font-semibold mb-1">{title}</h3>
                  <p className="text-text2 text-sm">{desc}</p>
                </div>
                <span className="flex-shrink-0 text-[10px] text-accent bg-accent/10 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  {badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TRUST / INSIGHTS ==================== */}
      <section className="py-14 px-4 bg-surface border-y border-border">
        <h2 className="text-2xl font-bold text-text text-center mb-10">What Most Buyers Don't Know</h2>

        <div className="max-w-2xl mx-auto grid gap-5 sm:grid-cols-2">
          {[
            {
              stat: '$1,847',
              label: 'Average overpay on a new car',
              detail: 'Consumers consistently overpay by failing to negotiate below MSRP, accepting inflated doc fees, and bundling unnecessary add-ons.',
            },
            {
              stat: '76%',
              label: 'Don\'t negotiate the doc fee',
              detail: 'Most buyers assume the doc fee is fixed. In many states it\'s negotiable — and 8 states legally cap it.',
            },
            {
              stat: '$3,200',
              label: 'Average F&I add-on spend',
              detail: 'Extended warranties, GAP insurance, and paint protection are the biggest profit centers for dealers. Most can be bought cheaper elsewhere.',
            },
            {
              stat: '2.1%',
              label: 'Average dealer APR markup',
              detail: 'Dealers often markup the buy rate from the lender by 1-3%. A credit union pre-approval eliminates this instantly.',
            },
          ].map(({ stat, label, detail }) => (
            <div key={label} className="bg-bg border border-border rounded-xl p-5">
              <p className="text-3xl font-extrabold text-accent mb-1">{stat}</p>
              <p className="text-text font-semibold text-sm mb-2">{label}</p>
              <p className="text-text2 text-xs">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== PRIVACY ==================== */}
      <section className="py-10 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-text font-semibold mb-1">Your Privacy Matters</h3>
          <p className="text-text2 text-sm">
            Documents are processed by AI to extract deal data, then immediately discarded. We do not store, share, or sell your images or personal information. No accounts. No data retained.
          </p>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-text mb-3">
          Don't sign until you've checked.
        </h2>
        <p className="text-text2 mb-8 max-w-md mx-auto">
          It takes 30 seconds and could save you thousands.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-accent hover:bg-accent-hover text-white text-lg font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-accent/25"
        >
          Analyze My Deal
        </button>
      </section>
    </div>
  );
}
