# BringTheApp - Car Deal Analyzer

A mobile-first web app that helps average car buyers evaluate dealership offers. Upload your purchase agreement photos, get an instant deal score, and know exactly where you stand before signing.

**Live:** [bringtheapp.onrender.com](https://bringtheapp.onrender.com)

## How It Works

1. **Upload** your purchase agreement (photo or PDF) - supports multi-page documents (3-6 pages typical)
2. **AI extracts** vehicle info, pricing, financing, fees, factory options, dealer add-ons, and F&I products
3. **Review** auto-filled form - edit anything the AI missed or got wrong
4. **Scores your deal** 0-100 across 6 weighted factors, cross-checked against live market listings
5. **Flags problems** - overpriced vehicles, high APR, illegal doc fees, abnormal registration/title fees, unnecessary add-ons
6. **Generates negotiation scripts** - copy-paste responses for each issue found
7. **Save, download, or email your report** - download the PDF, or (signed in) email the full analysis to yourself as a PDF attachment, and save up to 5 reports to compare side by side

## Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 8 | SPA with mobile-first responsive design, hand-rolled history router |
| **Styling** | Tailwind CSS 4 | Dark theme, custom design tokens |
| **Backend** | Express 5 + Node.js | REST API; deal reference data lives in bundled JSON files (no DB for deal data) |
| **Auth & saved reports** | Supabase | Email/password auth + per-user saved reports (Postgres + RLS) |
| **AI / OCR** | Gemini, OpenAI, Claude | Multi-provider vision AI for document extraction |
| **Market data** | Auto.dev | Live listings, market average, and vehicle photos (gated by `PAID_FEATURES`) |
| **PDF & email** | PDFKit + Resend | Server-rendered PDF report, emailed as an attachment via Resend |
| **Image Processing** | Sharp (server) + Canvas API (client) | EXIF correction, resize, JPEG compression |
| **Analytics** | PostHog | Product analytics, session replays, funnels (consent-gated) |
| **Hosting** | Render (free tier) | Single service: API + static build |
| **VIN Decode** | NHTSA vPIC API | Free government API, no key needed |

## Architecture

```
BringTheApp/
├── client/                          # Frontend SPA
│   └── src/
│       ├── App.jsx                  # Hand-rolled history router, layout, sticky header, auth controls
│       ├── main.jsx                 # React entry point
│       ├── pages/
│       │   ├── LandingPage.jsx      # Marketing landing page + carousel
│       │   ├── FormView.jsx         # Upload → form → submit flow
│       │   ├── ResultsView.jsx      # Score, flags, breakdown, scripts, save/download/email
│       │   ├── CompareView.jsx      # Side-by-side comparison of two saved reports
│       │   └── AccountPage.jsx      # Account management + password recovery + delete
│       ├── components/
│       │   ├── DocumentUpload.jsx   # Multi-image upload + camera + drag-drop
│       │   ├── ScoreGauge.jsx       # Animated SVG score dial (0-100)
│       │   ├── DealSummary.jsx      # Side-by-side entered vs calculated
│       │   ├── MarketCheck.jsx      # Live listings + MSRP comparison with depreciation
│       │   ├── FlagsPanel.jsx       # Red/green flag alerts
│       │   ├── FeeBreakdown.jsx     # Fee itemization with legal citations
│       │   ├── NegotiationTips.jsx  # Copy-paste dealer scripts
│       │   ├── PaymentPreview.jsx   # Live monthly payment calculator
│       │   ├── AuthModal.jsx        # Sign in / sign up / reset password
│       │   ├── SavedReports.jsx     # List, load, compare, delete saved reports
│       │   ├── EmailReportDialog.jsx# Confirm/edit address and email the PDF report
│       │   ├── SearchableSelect.jsx # Filterable dropdown with blur-commit
│       │   └── MoneyInput.jsx       # Currency input with $ prefix
│       └── lib/
│           ├── api.js               # Backend API client (analyze, OCR, PDF, email)
│           ├── supabase.js          # Supabase browser client
│           ├── auth.jsx             # Auth context/provider (session, sign in/out)
│           ├── reports.js           # Saved-report CRUD (Supabase, 5-report cap)
│           ├── format.js            # Currency/number formatting helpers
│           ├── imageUtils.js        # Client-side image preprocessing
│           ├── analytics.js         # PostHog event tracking
│           └── cookieconsent.js     # Consent banner + analytics gating
│
├── server/                          # Backend API
│   ├── index.js                     # Express server + SPA static serving
│   ├── config.js                    # Lazy feature flags (PAID_FEATURES)
│   ├── routes/
│   │   ├── ocr.js                   # Multi-provider vision AI extraction
│   │   ├── analyze.js               # Deal scoring engine (6 factors) — score/flags/scripts share one ref
│   │   ├── vehicle.js               # Make/model/trim + MSRP lookup
│   │   ├── tax.js                   # State tax rates + ZIP-to-state
│   │   ├── fees.js                  # State doc fee caps + legal citations
│   │   ├── auto-dev.js              # Auto.dev market listings + vehicle photos
│   │   ├── pdf.js                   # PDF report builder + download + email routes
│   │   └── account.js              # Supabase admin account deletion (archived first)
│   ├── lib/
│   │   ├── supabaseAdmin.js         # Service-role client + bearer-token verification
│   │   └── email.js                 # Resend wrapper — emails the PDF as an attachment
│   ├── scripts/
│   │   └── update-data.js           # Refresh bundled reference data (premium/paid)
│   └── data/
│       ├── vehicle-msrp.json        # Trim-level MSRP, keyed "Make Model" → year → trim
│       ├── state-fees.json          # Doc fee caps + legal citations, keyed by state code
│       ├── tax-rates.json           # State + avg local tax rates, keyed by state code
│       └── tax-laws.json            # Legal citations for vehicle sales tax, keyed by state code
│
└── render.yaml                      # One-click Render deployment blueprint
```

> Deeper references: [`DESIGN.md`](./DESIGN.md) (architecture & UX rationale), [`PRODUCT.md`](./PRODUCT.md) (product spec), and [`.claude/rules/`](./.claude/rules) (path-scoped conventions for AI assistants).

## Scoring Engine

| Factor | Max Points | What It Measures |
|--------|-----------|-----------------|
| Price vs Market | 35 | Vehicle price compared to MSRP / depreciated market value / live listings |
| APR Fairness | 20 | Interest rate vs typical for credit tier |
| Fees | 15 | Doc fee vs state legal caps and norms |
| Add-ons | 15 | Total cost of dealer add-ons and F&I products |
| Loan Term | 8 | Shorter terms score higher |
| Down Payment | 7 | Equity position (down payment + trade-in) |

- **Consistency invariant:** the score, flags, and negotiation scripts are all derived from one unified market reference (`marketRef` — live listings when available, calculated MSRP/depreciation otherwise). Keep them in sync (`server/routes/analyze.js`).
- **Cash deals** (no financing) get full marks for APR and Loan Term
- **Extreme overpay caps** limit total score when price is >1.3x / >1.5x / >2x market
- **Abnormal fee flags** catch registration and title fees that exceed 2x the state typical range
- **Doc fee enforcement** flags fees exceeding legal caps (8 capped states) or 1.5x state typical

## Vision AI Providers

Switchable via `VISION_PROVIDER` environment variable (registry in `server/routes/ocr.js`):

| Provider | Model | Cost | Best For |
|----------|-------|------|----------|
| **Google Gemini** (default) | gemini-2.5-flash | Free (1,500 req/day) | Development + free tier users |
| **OpenAI** | gpt-4o | ~$0.03/deal | Premium tier |
| **Anthropic Claude** | claude-sonnet | ~$0.05/deal | Premium tier |

All providers use structured JSON output (Gemini responseSchema / OpenAI JSON mode / Claude tool_use) for reliable field extraction. VIN cross-referenced with NHTSA after extraction.

## Feature Flags

`PAID_FEATURES` (default `true`) gates the Auto.dev-backed premium features via `server/config.js`:

- `marketListings` — live comparable listings on the results page
- `vehiclePhotos` — vehicle photo on the report
- `marketAverage` — market-average price used in scoring

Set `PAID_FEATURES=false` to run on bundled MSRP/depreciation data only (no Auto.dev calls). The bundled-data refresh script (`server/scripts/update-data.js`) is a premium/maintenance tool.

## Document Extraction

The AI extracts and categorizes:

- **Vehicle**: year, make, model, trim, VIN, condition, mileage, colors
- **Pricing**: MSRP, selling price, rebates, destination charge
- **Financing**: APR, term, monthly payment, amount financed, lender, down payment
- **Fees**: doc fee, sales tax, registration, title, tire disposal
- **Factory options**: from window sticker (part of MSRP)
- **Dealer add-ons**: installed after factory (nitrogen, tint, wheel locks, etc.)
- **F&I products**: GAP, extended warranty, paint protection, maintenance plans
- **Conflicts**: flags when the same field has different values on different pages

## Local Development

```bash
# Install all dependencies (root + client + server)
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env — at minimum set GOOGLE_AI_KEY for OCR.
# For auth/saved reports set the Supabase vars; for email reports set Resend vars.

# Run both dev servers (Vite on :5173, Express on :3001)
npm run dev
```

### Environment variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `VISION_PROVIDER` | server | `gemini` (default) / `openai` / `claude` |
| `GOOGLE_AI_KEY` | server | Gemini vision (default OCR) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | server | Premium OCR providers |
| `AUTO_DEV_API_KEY` | server | Live market listings + vehicle photos |
| `PAID_FEATURES` | server | `false` disables Auto.dev features |
| `VITE_SUPABASE_URL` | client + server | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Verifies bearer tokens, admin actions — **server-only** |
| `RESEND_API_KEY` | server | Sends the PDF report email |
| `EMAIL_FROM` | server | Verified Resend sender, e.g. `BringTheApp <reports@yourdomain.com>` |
| `VITE_POSTHOG_KEY` | client | PostHog analytics (optional) |

## Deployment (Render - Free)

1. Push to GitHub
2. Go to [render.com](https://render.com) -> New -> Web Service
3. Connect your repo, set:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
4. Add environment variables in the Render dashboard (see the table above — at minimum `GOOGLE_AI_KEY`; add Supabase + Resend vars to enable auth/saved reports and email). `render.yaml` lists the keys that must be set manually (`sync: false`).
5. Set up [UptimeRobot](https://uptimerobot.com) (free) to ping `https://yourapp.onrender.com/api/health` every 5 min — prevents free tier sleep

## APIs & Data Sources

| Source | Purpose | Cost | Key Required |
|--------|---------|------|-------------|
| Google Gemini | Document extraction (default) | Free tier | Yes |
| OpenAI GPT-4o | Document extraction (premium) | Paid | Yes |
| Anthropic Claude | Document extraction (premium) | Paid | Yes |
| Auto.dev | Market listings, average, vehicle photos | Free tier (1k/mo) | Yes |
| Supabase | Auth + saved reports | Free tier | Yes |
| Resend | Email the PDF report | Free tier | Yes |
| NHTSA vPIC | VIN decoding (year/make/model/trim) | Free | No |
| PostHog | Product analytics | Free tier (1M events/mo) | Yes |
| vehicle-msrp.json | Trim-level MSRP data | Bundled | No |
| state-fees.json | Doc fee caps + legal citations | Bundled | No |
| tax-rates.json | State + local tax rates | Bundled | No |
| tax-laws.json | Sales tax legal citations | Bundled | No |

## Privacy

- Documents are processed by AI to extract deal data, then immediately discarded
- No images are stored or retained after the session
- Saved reports (deal data + results, not documents) are stored per-user in Supabase only when you sign in and choose to save
- No data is shared with or sold to third parties
- Analytics (PostHog) is consent-gated and tracks product usage events only, not document contents
