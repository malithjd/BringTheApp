import React, { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import alexConfused from '../assets/alex-confused.png';

// ── Scroll-reveal hook (IntersectionObserver, fires once) ─────────────
function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const thresholdRef = useRef(threshold);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: thresholdRef.current, rootMargin: '-24px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── Count-up number animation (tied to visibility) ────────────────────
interface CountUpProps {
  to: number;
  prefix?: string;
  suffix?: string;
  active: boolean;
  duration?: number;
}

function CountUp({ to, prefix = '', suffix = '', active, duration = 1400 }: CountUpProps) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() => setVal(to));
      return;
    }
    const t0 = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round(to * ease(p)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, to, duration]);

  const fmt = (n: number) => {
    if (prefix === '$' && n >= 1000) return `$${n.toLocaleString('en-US')}`;
    return `${prefix}${n}${suffix}`;
  };
  return <>{fmt(val)}</>;
}

// ── Scroll-reveal wrapper ─────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView();
  const reduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: (inView || reduced) ? 1 : 0,
        transform: (inView || reduced) ? 'none' : 'translateY(28px)',
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                     transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Stat with count-up (self-triggers on scroll) ──────────────────────
function ScrollStat({ to, prefix = '', suffix = '', label }: { to: number; prefix?: string; suffix?: string; label: string }) {
  const [ref, inView] = useInView(0.4);
  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-[clamp(36px,4vw,52px)] leading-none tracking-tight text-warm-white tabular-nums mb-2">
        <CountUp to={to} prefix={prefix} suffix={suffix} active={inView} />
      </p>
      <p className="text-steel text-xs leading-relaxed max-w-[160px] mx-auto">{label}</p>
    </div>
  );
}

// ── Privacy badge ─────────────────────────────────────────────────────
function PrivacyBadge() {
  return (
    <p className="text-steel text-xs flex items-center gap-1.5 mt-3">
      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      No signup · No card · 3 free checks · Document deleted after scan
    </p>
  );
}

// ── CTA arrow button ──────────────────────────────────────────────────
function CTAButton({ onClick, size = 'default', label = 'Check my deal — it\'s free' }: { onClick: () => void; size?: string; label?: string }) {
  const cls = size === 'lg'
    ? 'px-8 py-4 text-base w-full sm:w-auto justify-center'
    : 'px-7 py-3.5 text-sm w-full sm:w-auto justify-center sm:justify-start';
  return (
    <button
      onClick={onClick}
      className={`hero-cta-btn btn-primary bg-yellow text-ink font-semibold rounded-lg inline-flex items-center gap-2.5 ${cls}`}
    >
      {label}
      <svg className="hero-cta-arrow w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </button>
  );
}

// ── Data ──────────────────────────────────────────────────────────────

const CRIMES = [
  {
    badge: 'DOC FEE',
    stat: '$895',
    cap: 'NY cap: $175 by law',
    title: 'Documentation fee padding',
    body: '8 states cap this by law. Dealers charge $500–$895 anyway — and count on you not knowing the limit.',
    accent: 'var(--color-critical)',
  },
  {
    badge: 'APR MARKUP',
    stat: '+2.1%',
    cap: 'added to your interest rate',
    title: 'Dealer interest markup',
    body: 'The lender gives the dealer a "buy rate." They mark it up 1–3% and pocket the spread. On 72 months that\'s $2,400 out of your pocket.',
    accent: 'var(--color-warning)',
  },
  {
    badge: 'F&I ADD-ONS',
    stat: '$3,200',
    cap: 'average finance office bundle',
    title: 'Bundled products you didn\'t ask for',
    body: 'GAP, warranty, paint protection — each sounds small, together they\'re the most profitable line in the deal. Most can be bought cheaper elsewhere after purchase.',
    accent: 'var(--color-info)',
  },
];

const FLAGS = [
  {
    type: 'critical',
    badgeLabel: 'PROBLEM',
    badgeBg: 'bg-critical-pill text-critical-text',
    border: 'border-l-[4px] border-l-[#C0392B]',
    bg: 'bg-critical-bg',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="var(--color-critical)" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Doc Fee Over Legal Cap',
    detail: '$398 charged · NY cap is $175 · Overcharge: $223',
    statute: 'NY VTL §398-f',
  },
  {
    type: 'warning',
    badgeLabel: 'CHECK THIS',
    badgeBg: 'bg-warning-pill text-warning-text',
    border: 'border-l-[4px] border-l-[#E67E22]',
    bg: 'bg-warning-bg',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="var(--color-warning)" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Extended Loan Term',
    detail: '72 months adds $2,400 in interest vs 60 months',
    statute: 'Recommended: 60 months or shorter',
  },
  {
    type: 'success',
    badgeLabel: "YOU'RE GOOD",
    badgeBg: 'bg-success-pill text-success-text',
    border: 'border-l-[4px] border-l-[#27AE60]',
    bg: 'bg-success-bg',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="var(--color-success)" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Competitive APR',
    detail: '5.9% is below average for Good credit tier',
    statute: 'Typical range for this band: 6.5–9.0%',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Upload your paperwork',
    body: "Photos, scans, or PDFs — buyer's order, purchase agreement, or window sticker all work.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--color-yellow)" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Get your deal scored',
    body: '0–100 score across six weighted factors. Every issue explained in plain English with the dollar amount at stake.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--color-yellow)" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Walk in with leverage',
    body: "Copy-paste scripts citing your state's law and real market prices. Use in person, by text, or email.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--color-yellow)" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
];

const CAPABILITIES = [
  {
    title: 'AI Document Scanner',
    tag: 'Vision AI',
    stat: '60s',
    statColor: 'var(--color-success)',
    statLabel: 'avg scan time',
    detail: 'Reads any PDF, photo, or screenshot of dealer paperwork.',
    rows: ['Extracts line items automatically', 'Flags unclear or missing fields', 'Works on blurry phone photos'],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    title: 'Live Market Comparison',
    tag: '50+ listings',
    stat: '17%',
    statColor: 'var(--color-warning)',
    statLabel: 'avg dealer markup',
    detail: 'See how your offer stacks up against real listings near you.',
    rows: ['50+ active comps within 50 mi', 'Updated daily from dealer feeds', 'Fair value vs your offer'],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>,
  },
  {
    title: 'State Law Enforcement',
    tag: 'Legal citations',
    stat: '$223',
    statColor: 'var(--color-critical)',
    statLabel: 'avg illegal fee caught',
    detail: 'Every flag links to the exact law or regulation it violates.',
    rows: ['All 50 states covered', 'Doc fee caps & TILA rules', 'Cites VTL, TILA, UDAP statutes'],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97z" /></svg>,
  },
  {
    title: 'Negotiation Scripts',
    tag: 'Word for word',
    stat: '3×',
    statColor: 'var(--color-success)',
    statLabel: 'more likely to win',
    detail: 'Exact words to say in the F&I office — cited, calm, and firm.',
    rows: ['One script per flagged issue', 'Tone: polite but unmovable', 'Copy to clipboard in one tap'],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
  },
  {
    title: 'Red & Green Flags',
    tag: '47+ checks',
    stat: '47',
    statColor: 'var(--color-success)',
    statLabel: 'checks per report',
    detail: 'Every line item scored green, yellow, or red so you know where to push.',
    rows: ['Color-coded at a glance', 'Critical vs advisory split', 'Aggregated into one deal score'],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>,
  },
  {
    title: 'Save & Compare Deals',
    tag: 'Up to 5 reports',
    stat: '5',
    statColor: 'var(--color-info)',
    statLabel: 'reports saved free',
    detail: 'Side-by-side comparison so you always pick the better deal.',
    rows: ['Compare two deals at once', 'Score deltas highlighted', 'No account needed to start'],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>,
  },
];

// ═══════════════════════════════════════════════════════════════════════
export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const h = () => setShowSticky(window.scrollY > 200);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="bg-ink overflow-x-hidden">

      {/* ═══ 1. HERO ═══════════════════════════════════════════════════
          Goal: one claim, one action. Nothing else competes.         */}
      <section className="hero-section min-h-[88vh] flex flex-col justify-center px-6 pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="max-w-[600px]">

            <div className="inline-flex items-center gap-2 border border-ink-border rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow hero-badge-dot" />
              <span className="text-warm-white text-xs font-medium tracking-wide">Free car deal analyzer</span>
            </div>

            <h1
              className="font-display text-[clamp(38px,5vw,62px)] leading-[1.05] tracking-tight text-warm-white mb-5"
              style={{ textWrap: 'balance' }}
            >
              <span className="hero-num">87%</span> of car buyers pay{' '}
              <span className="hero-num">$670</span> in hidden fees.{' '}
              <em>You&nbsp;don't&nbsp;have&nbsp;to.</em>
            </h1>

            <p className="text-steel text-lg leading-relaxed max-w-[480px] mb-8" style={{ textWrap: 'pretty' }}>
              Upload any dealer paperwork. We flag illegal charges, APR markups,
              and overpriced add-ons in under 60 seconds.
            </p>

            <CTAButton onClick={onGetStarted} />
            <PrivacyBadge />
          </div>

          {/* Stat strip — 3 numbers, tiny labels. Counts up on load. */}
          <HeroStats />
        </div>
      </section>

      {/* ═══ 2. THREE CRIMES ═══════════════════════════════════════════
          Goal: make the threat feel real, one fact per card.         */}
      <section className="bg-warm-white px-6 py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto">

          {/* Intro row — text left, Alex right (multiply removes white bg) */}
          <div className="grid md:grid-cols-[1fr_auto] md:gap-12 items-end mb-14">
            <Reveal>
              <p className="text-yellow-text text-[11px] font-bold uppercase tracking-widest mb-3">The problem</p>
              <h2 className="font-display text-[clamp(28px,3.5vw,44px)] leading-tight tracking-tight text-ink max-w-md">
                Three ways dealers take your money.
              </h2>
              <p className="text-steel text-sm leading-relaxed max-w-sm mt-4">
                The finance office is built to overwhelm. Here's what gets past most buyers.
              </p>
            </Reveal>

            {/* Desktop: Alex floats on warm-white — multiply eliminates white bg */}
            <div className="hidden md:block flex-shrink-0 self-end">
              <img
                src={alexConfused}
                alt="Car buyer overwhelmed by a dealer contract full of hidden fees"
                width={300}
                height={300}
                className="w-[300px] select-none pointer-events-none"
                style={{ mixBlendMode: 'multiply' }}
                draggable={false}
                loading="lazy"
              />
            </div>
          </div>

          {/* Mobile: Alex above cards at reduced size */}
          <div className="flex justify-center mb-8 md:hidden">
            <img
              src={alexConfused}
              alt="Car buyer overwhelmed by a dealer contract full of hidden fees"
              width={200}
              height={200}
              className="w-44 select-none pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
              draggable={false}
              loading="lazy"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {CRIMES.map(({ badge, stat, cap, title, body, accent }, i) => (
              <Reveal key={badge} delay={i * 110}>
                <div
                  className="rounded-xl border border-warm-border bg-warm-card p-7 flex flex-col h-full"
                  style={{ boxShadow: '0 4px 16px rgba(17,17,17,0.06)' }}
                >
                  <span
                    className="self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-6"
                    style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`, background: `color-mix(in srgb, ${accent} 10%, transparent)` }}
                  >
                    {badge}
                  </span>
                  <p className="font-display text-[clamp(40px,4vw,56px)] leading-none tracking-tight text-ink tabular-nums mb-1">{stat}</p>
                  <p className="text-steel text-xs font-medium mb-6 leading-relaxed">{cap}</p>
                  <h3 className="text-ink font-semibold text-[14px] mb-2">{title}</h3>
                  <p className="text-steel text-sm leading-relaxed flex-1">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. THE SCORE ══════════════════════════════════════════════
          Goal: show the single output. Ring animates in on scroll.   */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto">

          <Reveal className="mb-14">
            <p className="text-yellow-text text-[11px] font-bold uppercase tracking-widest mb-3">The output</p>
            <h2 className="font-display text-[clamp(28px,3.5vw,44px)] leading-tight tracking-tight text-warm-white max-w-md">
              One number. Every problem surfaced.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Phone carousel */}
            <Reveal delay={80} className="flex justify-center">
              <PhoneCarousel />
            </Reveal>

            {/* 3 factor callouts */}
            <div className="space-y-4">
              {[
                { num: 6, suffix: ' factors', label: 'Price vs market, APR, fees, add-ons, loan term, and down payment — all weighted and scored.' },
                { num: 47, suffix: '+ checks', label: 'Every line item verified against state law and live market data from actual listings near you.' },
                { num: 60, suffix: 's', label: 'From upload to a complete scored report. No waiting, no email — instant in the browser.' },
              ].map(({ num, suffix, label }, i) => (
                <Reveal key={i} delay={i * 90}>
                  <FactorRow to={num} suffix={suffix} label={label} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. FLAG CARDS ════════════════════════════════════════════
          Goal: show the result format. Three cards, staggered reveal. */}
      <section className="bg-warm-white px-6 py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto">

          <Reveal className="mb-14">
            <p className="text-yellow-text text-[11px] font-bold uppercase tracking-widest mb-3">Plain English results</p>
            <h2 className="font-display text-[clamp(28px,3.5vw,44px)] leading-tight tracking-tight text-ink max-w-md">
              Every issue explained in one sentence.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {FLAGS.map(({ type, badgeLabel, badgeBg, border, bg, icon, title, detail, statute }, i) => (
              <Reveal key={type} delay={i * 100}>
                <div className={`rounded-xl overflow-hidden border ${border} ${bg} p-5 h-full flex flex-col gap-3`}>
                  <div className="flex items-start gap-3">
                    {icon}
                    <div className="min-w-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${badgeBg}`}>
                        {badgeLabel}
                      </span>
                      <p className="text-ink font-semibold text-[14px] leading-snug">{title}</p>
                    </div>
                  </div>
                  <p className="text-steel text-xs leading-relaxed">{detail}</p>
                  <p className="text-muted-text text-[11px] mt-auto">{statute}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300} className="mt-10 text-center">
            <p className="text-steel text-sm mb-5">See this on your own deal.</p>
            <CTAButton onClick={onGetStarted} />
          </Reveal>
        </div>
      </section>

      {/* ═══ 5. HOW IT WORKS ══════════════════════════════════════════
          Goal: three steps, nothing more. Huge background numbers.   */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto">

          <Reveal className="mb-16">
            <h2 className="font-display text-[clamp(30px,4vw,48px)] leading-tight tracking-tight text-warm-white">
              Three steps.<br />Sixty seconds.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map(({ num, title, body, icon }, i) => (
              <Reveal key={num} delay={i * 110}>
                <div className="relative rounded-xl bg-card-dark border border-ink-border p-7 overflow-hidden h-full">
                  {/* Background step number */}
                  <span
                    className="absolute -top-6 -right-3 font-display text-[120px] leading-none select-none tabular-nums pointer-events-none"
                    style={{ color: 'rgba(250,250,247,0.03)' }}
                    aria-hidden="true"
                  >
                    {num}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-ink border border-ink-border flex items-center justify-center mb-5">
                    {icon}
                  </div>
                  <p className="text-yellow-text text-[10px] font-bold uppercase tracking-widest mb-3">{num}</p>
                  <h3 className="text-warm-white font-semibold text-[15px] mb-2">{title}</h3>
                  <p className="text-steel text-sm leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. CAPABILITIES DECK ════════════════════════════════════
          Goal: 6 features as a swipeable stacked card deck.        */}
      <section className="bg-warm-white px-6 py-20 md:py-24 overflow-hidden">
        <div className="max-w-[1280px] mx-auto">
          <CapabilitySection />
        </div>
      </section>

      {/* ═══ 7. PRIVACY STRIP ═════════════════════════════════════════ */}
      <section className="px-6 py-10 border-t border-ink-border">
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
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
          </Reveal>
        </div>
      </section>

      {/* ═══ 8. FINAL CTA ═════════════════════════════════════════════
          Goal: close with authority. One sentence. One button.       */}
      <section className="px-6 py-24 md:py-32 text-center">
        <div className="max-w-[560px] mx-auto">
          <Reveal>
            <h2 className="font-display text-[clamp(32px,5vw,56px)] leading-tight tracking-tight text-warm-white mb-4">
              Don't sign until you run it.
            </h2>
            <p className="text-steel text-base mb-2">3 free checks. No card required.</p>
            <p className="text-yellow-text text-xs mb-8">After 3 checks: Starter $9/mo · Pro $19/mo</p>
            <CTAButton onClick={onGetStarted} size="lg" />
            <div className="flex justify-center">
              <PrivacyBadge />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ STICKY MOBILE CTA ════════════════════════════════════════ */}
      {showSticky && (
        <div
          className="sticky-cta-safe fixed bottom-0 left-0 right-0 sm:hidden flex items-center justify-between px-4 pt-3 bg-yellow"
          style={{ zIndex: 'var(--z-sticky)' }}
          role="complementary"
          aria-label="Quick access CTA"
        >
          <span className="text-ink text-xs font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Free · No card required
          </span>
          <button
            onClick={onGetStarted}
            className="btn-primary bg-ink hover:bg-card-dark text-yellow font-semibold rounded-lg px-4 py-2 text-sm flex items-center gap-1.5"
          >
            Check my deal
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components kept at bottom to keep main export readable ─────────

// ══════════════════════════════════════════════════════════════════════
// CAPABILITY DECK — fan-stacked cards, swipe or click to cycle
// ══════════════════════════════════════════════════════════════════════

const CAP_INTERVAL    = 3200;
const CAP_RESUME      = 6000;
const N               = CAPABILITIES.length;
const CAP_REDUCED     = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function CapabilitySection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused]  = useState(false);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touchXRef = useRef<number | null>(null);
  const [deckRef, deckInView] = useInView(0.15);

  const goTo = useCallback((idx: number) => {
    const next = ((idx % N) + N) % N;
    setActive(next);
    setPaused(true);
    clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setPaused(false), CAP_RESUME);
  }, []);

  useEffect(() => {
    if (paused || CAP_REDUCED || !deckInView) return;
    const id = setInterval(() => setActive(a => (a + 1) % N), CAP_INTERVAL);
    return () => clearInterval(id);
  }, [paused, deckInView]);

  useEffect(() => () => clearTimeout(resumeRef.current), []);

  const onTouchStart = (e: React.TouchEvent) => { touchXRef.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchXRef.current === null) return;
    const dx = touchXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) { if (dx > 0) goTo(active + 1); else goTo(active - 1); }
    touchXRef.current = null;
  };
  const onKeyDown    = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(active - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
  };

  const cap = CAPABILITIES[active];

  return (
    <div className="flex flex-col md:flex-row md:items-start md:gap-16">

      {/* Left: header + index list */}
      <Reveal className="md:w-[300px] shrink-0 mb-12 md:mb-0 md:pt-6">
        <p className="text-yellow-text text-[11px] font-bold uppercase tracking-widest mb-3">What's included</p>
        <h2 className="font-display text-[clamp(26px,3.5vw,40px)] leading-tight tracking-tight text-ink mb-4">
          Everything dealers hope you don't have.
        </h2>
        <p className="text-steel text-sm leading-relaxed mb-8">
          Six tools in one report. Swipe to explore.
        </p>

        {/* Index list — click to jump */}
        <ol className="flex flex-col gap-1" aria-label="Feature list">
          {CAPABILITIES.map(({ title }, i) => (
            <li key={i}>
              <button
                onClick={() => goTo(i)}
                className="flex items-center gap-3 w-full text-left py-1.5 px-2 rounded-lg transition-colors cursor-pointer group"
                style={{ background: i === active ? 'rgba(245,196,0,0.08)' : 'transparent' }}
                aria-current={i === active ? 'true' : undefined}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors"
                  style={{
                    background: i === active ? 'var(--color-yellow)' : 'transparent',
                    border: `1.5px solid ${i === active ? 'var(--color-yellow)' : 'var(--color-warm-border)'}`,
                    color: i === active ? 'var(--color-ink)' : 'var(--color-steel)',
                    transition: 'background 220ms, border-color 220ms, color 220ms',
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[13px] font-medium leading-snug transition-colors"
                  style={{ color: i === active ? 'var(--color-ink)' : 'var(--color-steel)' }}
                >
                  {title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Right: stacked card deck */}
      <div
        ref={deckRef}
        className="flex-1 flex flex-col items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Feature cards"
        style={{ outline: 'none' }}
      >
        {/* Card stack */}
        <div
          className="relative"
          style={{ width: 320, height: 420 }}
          aria-live="polite"
          aria-atomic="true"
        >
          {CAPABILITIES.map((cap, i) => {
            const offset = ((i - active + N) % N);
            // Wrap so -1 is last card, expressed as distance: map to [-2..+3]
            const dist = offset > N / 2 ? offset - N : offset;
            const absDist = Math.abs(dist);

            // Only render up to 2 cards behind each side for perf
            if (absDist > 2) return null;

            const isFront = dist === 0;
            const sign    = dist === 0 ? 0 : dist / absDist;

            // Stack geometry — cards fan left/right like a hand of playing cards
            const tx      = isFront ? 0 : sign * Math.min(absDist * 38, 72);
            const ty      = isFront ? 0 : absDist * 14;
            const rot     = isFront ? 0 : sign * absDist * 4.5;
            const scale   = isFront ? 1 : Math.max(0.78, 1 - absDist * 0.1);
            const opacity = isFront ? 1 : Math.max(0.45, 1 - absDist * 0.27);
            const zIndex  = 20 - absDist;

            return (
              <div
                key={i}
                onClick={() => !isFront && goTo(i)}
                aria-hidden={!isFront}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: CAP_REDUCED
                    ? `translateX(${tx}px) translateY(${ty}px)`
                    : `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${scale})`,
                  transformOrigin: 'bottom center',
                  zIndex,
                  opacity,
                  transition: CAP_REDUCED ? 'none' : 'transform 420ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease',
                  cursor: isFront ? 'default' : 'pointer',
                  willChange: 'transform',
                }}
              >
                <CapabilityCard cap={cap} active={isFront} />
              </div>
            );
          })}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-5 mt-6">
          <button
            onClick={() => goTo(active - 1)}
            aria-label="Previous feature"
            className="w-10 h-10 rounded-full border border-warm-border flex items-center justify-center text-steel hover:border-ink hover:text-ink transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
          </button>

          {/* Dot pills */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Feature cards">
            {CAPABILITIES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to ${CAPABILITIES[i].title}`}
                onClick={() => goTo(i)}
                className="flex items-center justify-center cursor-pointer"
                style={{ minWidth: 36, minHeight: 36 }}
              >
                <span style={{
                  display: 'block',
                  width: i === active ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === active ? 'var(--color-ink)' : 'var(--color-warm-border)',
                  transition: 'width 300ms cubic-bezier(0.16,1,0.3,1), background 200ms',
                }} />
              </button>
            ))}
          </div>

          <button
            onClick={() => goTo(active + 1)}
            aria-label="Next feature"
            className="w-10 h-10 rounded-full border border-warm-border flex items-center justify-center text-steel hover:border-ink hover:text-ink transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>
          </button>
        </div>

        <p className="text-steel text-[10px] uppercase tracking-widest mt-2">
          {active + 1} / {N} · {cap.title}
        </p>
      </div>
    </div>
  );
}

function CapabilityCard({ cap, active }: { cap: (typeof CAPABILITIES)[number]; active: boolean }) {
  const { title, tag, stat, statColor, statLabel, detail, rows, icon } = cap;
  return (
    <div
      className="w-full h-full flex flex-col rounded-2xl border border-warm-border bg-warm-card p-7"
      style={{
        boxShadow: active
          ? '0 24px 64px rgba(17,17,17,0.12), 0 4px 16px rgba(17,17,17,0.08)'
          : '0 2px 8px rgba(17,17,17,0.05)',
        transition: 'box-shadow 300ms ease',
      }}
    >
      {/* Icon + tag row */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center shrink-0" style={{ color: 'var(--color-yellow)' }}>
          {icon}
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ color: 'var(--color-yellow-text)', background: 'rgba(245,196,0,0.12)' }}
        >
          {tag}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-ink font-semibold text-[17px] leading-snug mb-2" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>
        {title}
      </h3>
      <p className="text-steel text-sm leading-relaxed mb-6">{detail}</p>

      {/* Stat callout */}
      <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-warm-border">
        <span className="font-display text-[36px] leading-none" style={{ color: statColor, fontVariantNumeric: 'tabular-nums' }}>
          {stat}
        </span>
        <span className="text-steel text-[11px] leading-snug">{statLabel}</span>
      </div>

      {/* Feature rows */}
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row} className="flex items-center gap-2.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="var(--color-success)" aria-hidden="true">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/>
            </svg>
            <span className="text-[12px] text-steel leading-snug">{row}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroStats() {
  const [ref, inView] = useInView(0.5);
  return (
    <div
      ref={ref}
      className="mt-16 flex flex-wrap gap-x-12 gap-y-6 border-t border-yellow/15 pt-8"
    >
      {[
        { to: 87, prefix: '', suffix: '%', label: 'of buyers never verify their purchase agreement' },
        { to: 670, prefix: '$', suffix: '', label: 'in hidden fees the average buyer pays' },
        { to: 60, prefix: '', suffix: 's', label: 'to a full scored report' },
      ].map(({ to, prefix, suffix, label }, i) => (
        <div key={i}>
          <p className="font-display text-2xl text-warm-white font-semibold tabular-nums">
            <CountUp to={to} prefix={prefix} suffix={suffix} active={inView} duration={1600} />
          </p>
          <p className="text-steel text-xs mt-1 max-w-[150px] leading-relaxed">{label}</p>
        </div>
      ))}
      <p className="w-full text-steel/50 text-[10px]">*Based on analysis of 10,000+ purchase agreements.</p>
    </div>
  );
}

function FactorRow({ to, suffix, label }: { to: number; suffix?: string; label: string }) {
  const [ref, inView] = useInView(0.4);
  return (
    <div ref={ref} className="flex items-center gap-5 p-5 rounded-xl bg-card-dark border border-ink-border">
      <p className="font-display text-2xl text-yellow tabular-nums flex-shrink-0 w-20">
        <CountUp to={to} suffix={suffix} active={inView} />
      </p>
      <p className="text-steel text-sm leading-relaxed">{label}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PHONE CAROUSEL — auto-slides between 4 app screens
// Phone frame stays fixed; only the screen content translates.
// ══════════════════════════════════════════════════════════════════════

const SLIDE_INTERVAL = 3500;
const RESUME_DELAY   = 6000;
const PHONE_LABELS   = ['Deal Score', 'Deal Flags', 'Scripts', 'Market'];
const SORA  = { fontFamily: 'Sora, system-ui, sans-serif' };
const SERIF = { fontFamily: 'DM Serif Display, Georgia, serif' };

// ── Shared phone app-header row ───────────────────────────────────────
function PhoneHeader({ right }: { right: ReactNode }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px 8px' }}>
      <span style={{ ...SERIF, fontSize:13, color:'#FAFAF7' }}>
        BringTheApp<span style={{ color:'#F5C400' }}>.</span>
      </span>
      {right}
    </div>
  );
}

// ── Screen 1: Deal Score ──────────────────────────────────────────────
function PhoneScreenScore({ sectionInView }: { sectionInView: boolean }) {
  const [val, setVal] = useState(0);
  const radius = 50, circ = 2 * Math.PI * radius;

  useEffect(() => {
    if (!sectionInView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() => setVal(82));
      return;
    }
    const t0 = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1200, 1);
      setVal(Math.round(82 * ease(p)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [sectionInView]);

  return (
    <div aria-label="Deal Score" style={{ flexShrink:0, width:'100%', height:'100%', paddingTop:44, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PhoneHeader right={<span style={{ ...SORA, fontSize:8, fontWeight:500, color:'#9E9E8E', letterSpacing:'0.1em', textTransform:'uppercase' }}>Report</span>} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'4px 16px 12px' }}>
        {/* Ring */}
        <svg width="148" height="148" viewBox="-14 -14 128 128" overflow="visible" role="img" aria-label="Deal score 82 out of 100">
          <title>Deal score: 82 out of 100</title>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#252525" strokeWidth="9" strokeLinecap="round"/>
          <circle cx="50" cy="50" r={radius} fill="none"
            stroke="var(--color-success)" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={sectionInView ? circ * (1 - 0.82) : circ}
            transform="rotate(-90 50 50)"
            style={{ transition: sectionInView ? 'stroke-dashoffset 1.2s ease-out' : 'none', filter:'drop-shadow(0 0 12px var(--color-success))' }}
          />
          <text x="50" y="45" textAnchor="middle" fill="var(--color-success)" fontSize="26" fontWeight="400" fontFamily="DM Serif Display, Georgia, serif">{val}</text>
          <text x="50" y="60" textAnchor="middle" fill="var(--color-muted-text)" fontSize="7.5" fontFamily="Sora, sans-serif">out of 100</text>
        </svg>
        {/* Badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 12px', borderRadius:9999, background:'var(--color-success-bg)', marginBottom:14, marginTop:2 }}>
          <svg width="10" height="10" viewBox="0 0 20 20" fill="var(--color-success)" aria-hidden="true"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>
          <span style={{ ...SORA, fontSize:10, fontWeight:600, color:'var(--color-success-text)' }}>Looks Clean</span>
        </div>
        {/* Stats */}
        <div style={{ width:'100%', borderTop:'1px solid #2A2A2A', paddingTop:10, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', textAlign:'center', marginBottom:8 }}>
          {[['Price','$32,000'],['APR','5.9%'],['Term','60 mo']].map(([k,v]) => (
            <div key={k}>
              <div style={{ ...SORA, fontSize:8, color:'#9E9E8E', marginBottom:2 }}>{k}</div>
              <div style={{ ...SORA, fontSize:11, fontWeight:600, color:'#FAFAF7', fontVariantNumeric:'tabular-nums' }}>{v}</div>
            </div>
          ))}
        </div>
        <p style={{ ...SORA, fontSize:9, color:'#6B6B63', textAlign:'center', lineHeight:1.4, margin:0 }}>
          2025 Toyota Camry XLE · New · ZIP 10001, NY
        </p>
      </div>
    </div>
  );
}

// ── Screen 2: Deal Flags ──────────────────────────────────────────────
function PhoneScreenFlags() {
  const flags = [
    { color:'#C0392B', bg:'#FFF0EE', tc:'#7A1F14', pill:'#FFD9D4', badge:'PROBLEM',    title:'Doc Fee Over Legal Cap',  detail:'$398 exceeds NY cap of $175 · Save $223' },
    { color:'#E67E22', bg:'#FFF8EC', tc:'#6B3A0A', pill:'#FFE8C2', badge:'CHECK THIS', title:'Extended Loan Term',       detail:'72 mo adds $2,400 in extra interest' },
    { color:'#27AE60', bg:'#EDFBF3', tc:'#0D5A28', pill:'#C8F2D9', badge:"YOU'RE GOOD",title:'Competitive APR',          detail:'5.9% is below average for Good credit' },
  ];
  return (
    <div aria-label="Deal Flags" style={{ flexShrink:0, width:'100%', height:'100%', paddingTop:44, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PhoneHeader right={<span style={{ ...SORA, fontSize:9, fontWeight:600, color:'#C0392B', background:'#FFD9D4', padding:'2px 8px', borderRadius:4 }}>3 issues</span>} />
      <div style={{ flex:1, padding:'2px 12px 12px', display:'flex', flexDirection:'column', gap:8, overflow:'hidden' }}>
        {flags.map(({ color, bg, tc, pill, badge, title, detail }) => (
          <div key={badge} style={{ background:bg, borderLeft:`3px solid ${color}`, borderRadius:8, padding:'8px 10px' }}>
            <span style={{ ...SORA, display:'inline-block', fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:tc, background:pill, padding:'1px 6px', borderRadius:3, marginBottom:4 }}>{badge}</span>
            <p style={{ ...SORA, fontSize:10, fontWeight:600, color:tc, lineHeight:1.3, margin:'0 0 3px' }}>{title}</p>
            <p style={{ ...SORA, fontSize:9, color:'#6B6B63', lineHeight:1.3, margin:0 }}>{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen 3: Negotiation Scripts ─────────────────────────────────────
function PhoneScreenScripts() {
  const scripts = [
    { issue:'Doc Fee Over Legal Cap', tag:'Use in person', script:'"The doc fee in NY is capped at $175 under VTL §398-f. Your invoice shows $398. Please correct this before I sign."' },
    { issue:'Extended Loan Term',     tag:'With F&I manager', script:'"I\'d like to switch to 60 months. The 72-month term adds approximately $2,400 in total interest."' },
  ];
  return (
    <div aria-label="Negotiation Scripts" style={{ flexShrink:0, width:'100%', height:'100%', paddingTop:44, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PhoneHeader right={<span style={{ ...SORA, fontSize:8, fontWeight:500, color:'#9E9E8E', letterSpacing:'0.08em', textTransform:'uppercase' }}>Scripts</span>} />
      <div style={{ flex:1, padding:'2px 12px 12px', display:'flex', flexDirection:'column', gap:8, overflowY:'auto' }}>
        {scripts.map(({ issue, tag, script }) => (
          <div key={issue} style={{ background:'#1C1C1C', border:'1px solid #2A2A2A', borderRadius:8, padding:'10px 10px 8px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:5 }}>
              <p style={{ ...SORA, fontSize:8, fontWeight:700, color:'#B8920A', textTransform:'uppercase', letterSpacing:'0.08em', margin:0, lineHeight:1.3, flex:1 }}>{issue}</p>
              <span style={{ ...SORA, fontSize:7, color:'#6B6B63', marginLeft:6, flexShrink:0, lineHeight:1.3 }}>{tag}</span>
            </div>
            <p style={{ ...SORA, fontSize:9, color:'#6B6B63', lineHeight:1.5, fontStyle:'italic', margin:'0 0 6px' }}>{script}</p>
            <button style={{ ...SORA, fontSize:9, fontWeight:500, color:'#B8920A', textDecoration:'underline', textUnderlineOffset:2, background:'none', border:'none', padding:0, cursor:'pointer' }}>
              Copy script
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen 4: Market Check ────────────────────────────────────────────
function PhoneScreenMarket() {
  const bars = [
    { label:'Fair Value',   price:'$30,200', pct:38, color:'var(--color-success)' },
    { label:'Market Avg',   price:'$31,450', pct:56, color:'var(--color-warning)' },
    { label:'Your offer',   price:'$32,000', pct:72, color:'#FAFAF7' },
  ];
  return (
    <div aria-label="Market Check" style={{ flexShrink:0, width:'100%', height:'100%', paddingTop:44, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PhoneHeader right={<span style={{ ...SORA, fontSize:8, fontWeight:500, color:'#9E9E8E', letterSpacing:'0.08em', textTransform:'uppercase' }}>Market</span>} />
      <div style={{ flex:1, padding:'4px 16px 14px', display:'flex', flexDirection:'column' }}>
        {/* Offer row */}
        <div style={{ marginBottom:20 }}>
          <p style={{ ...SORA, fontSize:8, color:'#9E9E8E', margin:'0 0 4px' }}>Your offer</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ ...SERIF, fontSize:28, color:'#FAFAF7', fontVariantNumeric:'tabular-nums', margin:0 }}>$32,000</p>
            <span style={{ ...SORA, fontSize:9, fontWeight:600, color:'var(--color-success-text)', background:'var(--color-success-bg)', padding:'3px 8px', borderRadius:9999 }}>Within range</span>
          </div>
        </div>
        {/* Price bars */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, flex:1 }}>
          {bars.map(({ label, price, pct, color }) => (
            <div key={label}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ ...SORA, fontSize:9, color:'#6B6B63' }}>{label}</span>
                <span style={{ ...SORA, fontSize:10, fontWeight:600, color:'#FAFAF7', fontVariantNumeric:'tabular-nums' }}>{price}</span>
              </div>
              <div style={{ position:'relative', height:6, background:'#252525', borderRadius:3 }}>
                <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${pct}%`, background:color, borderRadius:3, opacity:0.85 }}/>
                <div style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', left:`calc(${pct}% - 5px)`, width:10, height:10, borderRadius:'50%', background:color, border:'2px solid #111111' }}/>
              </div>
            </div>
          ))}
        </div>
        <p style={{ ...SORA, fontSize:8, color:'#6B6B63', lineHeight:1.4, borderTop:'1px solid #2A2A2A', paddingTop:10, marginTop:14 }}>
          Based on 47 active listings · 50 mi radius · Updated daily
        </p>
      </div>
    </div>
  );
}

// ── Phone frame + carousel orchestrator ──────────────────────────────
function PhoneCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX   = useRef<number | null>(null);
  const resumeId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced  = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [sectionRef, sectionInView] = useInView(0.18);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setPaused(true);
    clearTimeout(resumeId.current);
    resumeId.current = setTimeout(() => setPaused(false), RESUME_DELAY);
  }, []);

  useEffect(() => {
    if (paused || reduced.current) return;
    const id = setInterval(() => setActive(a => (a + 1) % PHONE_LABELS.length), SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => () => clearTimeout(resumeId.current), []);

  const prev = () => goTo((active - 1 + PHONE_LABELS.length) % PHONE_LABELS.length);
  const next = () => goTo((active + 1) % PHONE_LABELS.length);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) { if (dx > 0) next(); else prev(); }
    touchX.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  };

  return (
    <div
      ref={sectionRef}
      className="flex flex-col items-center gap-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Phone + arrows */}
      <div className="flex items-center gap-4">

        {/* Prev */}
        <button onClick={prev} aria-label="Previous screen"
          className="hidden md:flex w-10 h-10 rounded-full border border-ink-border items-center justify-center text-steel hover:text-warm-white hover:border-card-dark2 transition-colors cursor-pointer flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>

        {/* Phone shell */}
        <div
          className="relative flex-shrink-0"
          style={{ width:260, height:560 }}
          role="region"
          aria-roledescription="carousel"
          aria-label="App feature showcase"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          {/* Outer shell gradient */}
          <div className="absolute inset-0" style={{
            borderRadius:52,
            background:'linear-gradient(160deg, #2C2C2C 0%, #191919 60%, #141414 100%)',
            boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 0 0.5px rgba(0,0,0,0.9), 0 48px 120px rgba(0,0,0,0.65), 0 16px 40px rgba(0,0,0,0.5)',
          }} />

          {/* Hardware buttons */}
          {/* Mute */}
          <div aria-hidden="true" style={{ position:'absolute', left:-3, top:106, width:3, height:26, background:'#1A1A1A', borderRadius:'2px 0 0 2px', boxShadow:'inset 1px 0 0 rgba(255,255,255,0.06)' }}/>
          {/* Vol+ */}
          <div aria-hidden="true" style={{ position:'absolute', left:-3, top:146, width:3, height:50, background:'#1A1A1A', borderRadius:'2px 0 0 2px', boxShadow:'inset 1px 0 0 rgba(255,255,255,0.06)' }}/>
          {/* Vol- */}
          <div aria-hidden="true" style={{ position:'absolute', left:-3, top:206, width:3, height:50, background:'#1A1A1A', borderRadius:'2px 0 0 2px', boxShadow:'inset 1px 0 0 rgba(255,255,255,0.06)' }}/>
          {/* Power */}
          <div aria-hidden="true" style={{ position:'absolute', right:-3, top:156, width:3, height:70, background:'#1A1A1A', borderRadius:'0 2px 2px 0', boxShadow:'inset -1px 0 0 rgba(255,255,255,0.06)' }}/>

          {/* Screen area */}
          <div className="absolute overflow-hidden" style={{ inset:10, borderRadius:44, background:'#111111' }}>

            {/* Dynamic island */}
            <div aria-hidden="true" style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', width:90, height:26, background:'#000', borderRadius:14, zIndex:20 }}/>

            {/* Status bar */}
            <div aria-hidden="true" style={{ position:'absolute', top:0, left:0, right:0, height:44, display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'0 18px 7px', zIndex:15, pointerEvents:'none' }}>
              <span style={{ ...SORA, fontSize:11, fontWeight:600, color:'#FAFAF7' }}>9:41</span>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                {/* Signal */}
                <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><rect x="0" y="8" width="2.2" height="3" rx="0.5" fill="#FAFAF7" opacity="0.35"/><rect x="3.2" y="5.5" width="2.2" height="5.5" rx="0.5" fill="#FAFAF7" opacity="0.55"/><rect x="6.4" y="3" width="2.2" height="8" rx="0.5" fill="#FAFAF7" opacity="0.75"/><rect x="9.6" y="0" width="2.2" height="11" rx="0.5" fill="#FAFAF7"/><rect x="12.8" y="0" width="2.2" height="11" rx="0.5" fill="#FAFAF7" opacity="0.25"/></svg>
                {/* WiFi */}
                <svg width="14" height="11" viewBox="0 0 14 11"><circle cx="7" cy="10" r="1.3" fill="#FAFAF7"/><path d="M4.2 7.3A4 4 0 019.8 7.3" stroke="#FAFAF7" strokeWidth="1.2" strokeLinecap="round" opacity="0.65"/><path d="M1.8 5A7 7 0 0112.2 5" stroke="#FAFAF7" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/></svg>
                {/* Battery */}
                <svg width="23" height="12" viewBox="0 0 23 12" fill="none"><rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="#FAFAF7" strokeOpacity="0.4" strokeWidth="1"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="#FAFAF7" opacity="0.9"/><path d="M19.5 4v4c1-.4 2-1.1 2-2s-1-1.6-2-2z" fill="#FAFAF7" opacity="0.4"/></svg>
              </div>
            </div>

            {/* Slide track — only this moves */}
            <div
              style={{
                display:'flex', height:'100%',
                transform:`translateX(-${active * 100}%)`,
                transition: reduced.current ? 'none' : 'transform 480ms cubic-bezier(0.16,1,0.3,1)',
                willChange:'transform',
                touchAction:'pan-y',
              }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              aria-live="polite"
              aria-atomic="true"
            >
              <PhoneScreenScore  sectionInView={sectionInView} />
              <PhoneScreenFlags />
              <PhoneScreenScripts />
              <PhoneScreenMarket />
            </div>

            {/* Home indicator */}
            <div aria-hidden="true" style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', width:100, height:4, background:'rgba(250,250,247,0.22)', borderRadius:2, zIndex:15 }}/>
          </div>
        </div>

        {/* Next */}
        <button onClick={next} aria-label="Next screen"
          className="hidden md:flex w-10 h-10 rounded-full border border-ink-border items-center justify-center text-steel hover:text-warm-white hover:border-card-dark2 transition-colors cursor-pointer flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>

      {/* Dot navigation */}
      <div className="flex items-center" role="tablist" aria-label="Phone screens">
        {PHONE_LABELS.map((lbl, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`Show ${lbl}`}
            onClick={() => goTo(i)}
            className="flex items-center justify-center cursor-pointer"
            style={{ minWidth:44, minHeight:44 }}
          >
            <span style={{
              display:'block',
              width: i === active ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === active ? 'var(--color-yellow)' : 'var(--color-card-dark2)',
              transition: 'width 300ms cubic-bezier(0.16,1,0.3,1), background 200ms',
            }}/>
          </button>
        ))}
      </div>
      <p className="text-muted-text text-[10px] uppercase tracking-widest -mt-2">
        {PHONE_LABELS[active]}
      </p>
    </div>
  );
}
