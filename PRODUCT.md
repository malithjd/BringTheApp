# Product

## Project Title

**"The Car Dealer's Worst Nightmare."**

## One-Line Description

"Your car dealer added $3,000 in fake fees. We found them in 60 seconds."

## Product Name

**BringTheApp**
Domain: bringtheapp.com (or available alternative)
App subdomain: app.bringtheapp.com

---

## Users

Wide audience spanning anxious first-time car buyers to experienced
negotiators. The common context: they are at or near a dealership, under
time pressure, and uncertain whether the deal in front of them is fair.

**First-time buyers** need guidance and plain-language explanations. They
don't know what a documentation fee is. They feel intimidated. They need
the tool to be their calm, informed friend in the room.

**Experienced buyers** want precise data they can cite at the table.
They know the game — they just want confirmation and the exact numbers.

Both need to act quickly. Every screen must reduce cognitive load, not
add to it. The tool must work perfectly on a phone in a dim dealership
finance office with five minutes to decide.

**Signup requirement:** U.S. phone number only (+1 format). OTP verified
via Twilio. This enables tracking, anti-abuse, and a frictionless
experience — no passwords, no email confirmation loops.

---

## Product Purpose

BringTheApp helps ordinary car buyers evaluate dealership purchase agreements
before signing. Users upload photos or PDFs of their deal paperwork. AI
extracts the pricing and financing details and scores the deal 0–100 across
six weighted factors: price vs. market, APR, fees, add-ons, loan term, and
down payment. Flags surface specific problems with plain-English explanations
and negotiation scripts to resolve them.

Success looks like a user walking into the signing room knowing exactly where
they stand and exactly what to say.

---

## Brand Personality

**Sharp. Honest. On your side.**

The tool delivers what the user needs and gets out of the way. No marketing
language. No soft-sell reassurance. No jargon.

The brand speaks the way a knowledgeable friend who happens to be a car
finance expert would speak: calm, precise, direct. Even bad scores are
delivered without panic. The dealer is always the antagonist — framed as
someone who counts on buyer confusion. BringTheApp ends that confusion.

**Emotional goal:** confidence through clarity. The user should feel informed
and empowered, not alarmed or lectured.

---

## Marketing Strategy

### Free Tier — The Hook
3 contract checks, lifetime (not monthly). No credit card required.
Signup with phone number only.

The free tier exists to let users experience the product fully before paying.
When a user sees their first flag — a real $1,847 fake fee on their actual
contract — the subscription sells itself. The free tier is not a limitation.
It is the demo.

### The Upgrade Gate
After 3 free scans, users see an upgrade modal (not a page redirect):

> "You've seen what BringTheApp can do.
> Your 3 free checks caught [X] issues and found you [Y] in potential savings."

This is the single most important conversion moment in the product. The modal
presents both paid plans and contextualizes the cost against what was found.

### Paid Plans
- **Starter — $9/month:** 5 checks/month, full negotiation scripts, priority scan
- **Pro — $19/month:** Unlimited checks, compare multiple dealer quotes,
  shareable report links

### Copy Rules
These rules govern every word on the site:

1. Never use: "AI-powered", "cutting-edge", "seamless", "leverage",
   "utilize", "solution", "platform", "empower", "revolutionary"
2. Write like you're mad on behalf of the reader.
   Wrong: "Our tool analyzes your purchase agreement."
   Right: "We read the fine print so dealers can't hide anything."
3. Every headline answers: "What's in it for me right now?"
4. Numbers beat adjectives. "94% of contracts have hidden fees" not "many."
5. Plain English test: if a 60-year-old who's never read a contract can't
   understand it in 5 seconds, rewrite it.
6. Dealer is always the antagonist. Buyer is always the hero.
   Never blame the user. Never say "many people don't understand."
   Say "dealers count on this confusion."

### Social Proof (to build toward)
- Avg savings found: $4,200 per scan
- Contracts with hidden fees: 94%
- Time to full report: 60 seconds
- Scans completed: 14,000+
- User rating: 4.9

---

## Scoring Engine

The scoring engine is the core IP. It was built in the original BringTheApp
codebase (https://github.com/malithjd/BringTheApp.git) and must be preserved
exactly in the new build. Do not rewrite it. Port and wrap it.

The engine:
- Scores deals 0–100 across six weighted factors
- Detects 47 known dealer tactics
- Generates per-flag negotiation scripts
- Parses PDF and image uploads

Score thresholds:
- ≥ 70: Looks Clean (green)
- 40–69: Review Carefully (amber)
- < 40: High Risk (red)

---

## Pages

| Route               | Auth   | Description                           |
|---------------------|--------|---------------------------------------|
| /                   | Public | Landing page (full marketing)         |
| /how-it-works       | Public | Explainer page                        |
| /pricing            | Public | Full pricing page                     |
| /sample-report      | Public | Pre-populated demo report             |
| /privacy            | Public | Real privacy policy                   |
| /terms              | Public | Real terms of service                 |
| /cookies            | Public | Cookie policy                         |
| /signup             | Public | Phone number signup                   |
| /verify             | Public | OTP verification                      |
| /dashboard          | Auth   | Scan history + scan counter           |
| /scan/new           | Auth   | Upload contract                       |
| /scan/[id]          | Auth   | Full report view                      |
| /account            | Auth   | Account settings                      |
| /pricing (checkout) | Auth   | Stripe checkout flow                  |

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 14 App Router + TypeScript  |
| Styling    | Tailwind CSS                        |
| Animation  | Framer Motion                       |
| Database   | Supabase (PostgreSQL)               |
| Auth       | Supabase Auth + Twilio (phone OTP)  |
| Storage    | Supabase Storage (PDFs)             |
| Payments   | Stripe (subscriptions + webhooks)   |
| Email      | Resend                              |
| Deploy     | Vercel                              |

---

## Security Requirements

- All API routes validate Supabase JWT
- File uploads validated server-side (not just MIME header)
- Accepted formats: PDF, JPEG, PNG, HEIC — max 20MB
- Rate limiting: 10 scans/user/hour
- Row Level Security on all Supabase tables
- Stripe webhook signature verified on every call
- Contract files auto-deleted from storage after 90 days
- Never log contract content — log scan ID + status only
- No secrets in NEXT_PUBLIC_ environment variables

---

## Design Principles

1. **Data without drama.** Problems get flagged clearly; they don't get
   turned into emergencies. Score, context, action — in that order. No red
   sirens, no all-caps, no exclamation points on bad findings.

2. **One job per screen.** The user is distracted and under pressure.
   Each view communicates one primary thing. Upload. Score. Flags. Scripts.
   Not everything at once.

3. **Precision is the aesthetic.** Clean grid, tight spacing, tabular
   numerics. Data looks carefully calculated, not decorated. Every visual
   element earns its place by making a number or decision easier to read.

4. **Speed is trust.** Instant feedback at every step builds confidence.
   Loading states, transitions, and progressive disclosure communicate
   momentum rather than uncertainty.

5. **Authority without arrogance.** The tool knows things the dealer
   doesn't want the buyer to know. The voice is a trusted ally with
   receipts — not a warning system, not a preachy advocate.

---

## Anti-References

- **CarMax / TrueCar / Carvana:** Big-box, soft-sell aesthetic. Polished,
  friendly, and ultimately serving the industry the user is protecting
  themselves from.
- **Consumer alert / legal sites:** Text-heavy, government-agency style with
  warning banners and bureaucratic density. Our tone is authoritative, not
  anxious.
- **Generic SaaS dark mode:** Purple-gradient hero, glassmorphism cards,
  eye-catching animation for its own sake, marketing-speak. The tool should
  feel earned and purposeful, not like a feature carousel.

---

## Accessibility & Inclusion

WCAG 2.1 AA minimum throughout.

Key considerations:
- Mobile-first (users are often on phones at the dealership)
- Input font-size minimum 16px (prevents iOS auto-zoom)
- Color is never the only signal — flags use severity label + border + bg
- `prefers-reduced-motion` respected on all animations
- Tabular numerics on all monetary values and percentages
- High contrast ratios — all pairs tested (see DESIGN.md)

---

## Services (Free Tier Setup)

| Service   | Use                           | URL               |
|-----------|-------------------------------|-------------------|
| Supabase  | DB + Auth + Storage           | supabase.com      |
| Twilio    | SMS OTP (via Supabase)        | twilio.com        |
| Stripe    | Subscriptions + webhooks      | stripe.com        |
| Resend    | Transactional email           | resend.com        |
| Vercel    | Hosting + deploys             | vercel.com        |

All have free tiers sufficient for early-stage launch.
