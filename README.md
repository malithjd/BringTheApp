# BringTheApp - Car Deal Analyzer

A mobile-first web app that helps average car buyers evaluate dealership offers. Upload your purchase agreement photos, get an instant deal score, and know exactly where you stand before signing.

**Live:** [bringtheapp.onrender.com](https://bringtheapp.onrender.com)

## How It Works

1. **Upload** your purchase agreement (photo or PDF) - supports multi-page documents (3-6 pages typical)
2. **AI extracts** vehicle info, pricing, financing, fees, factory options, dealer add-ons, and F&I products
3. **Review** auto-filled form - edit anything the AI missed or got wrong
4. **Scores your deal** 0-100 across 6 weighted factors
5. **Flags problems** - overpriced vehicles, high APR, illegal doc fees, abnormal registration/title fees, unnecessary add-ons
6. **Generates negotiation scripts** - copy-paste responses for each issue found
7. **Email report** - send the full analysis to yourself for reference at the dealership

## Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 8 | SPA with mobile-first responsive design |
| **Styling** | Tailwind CSS 4 | Dark theme, custom design tokens |
| **Backend** | Express 5 + Node.js | REST API with JSON data files (no database) |
| **AI / OCR** | Gemini, OpenAI, Claude | Multi-provider vision AI for document extraction |
| **Image Processing** | Sharp (server) + Canvas API (client) | EXIF correction, resize, JPEG compression |
| **Analytics** | PostHog | Product analytics, session replays, funnels |
| **Hosting** | Render (free tier) | Single service: API + static build |
| **VIN Decode** | NHTSA vPIC API | Free government API, no key needed |

## Architecture

```
BringTheApp/
├── client/                          # Frontend SPA
│   └── src/
│       ├── App.jsx                  # Router, layout, sticky header
│       ├── pages/
│       │   ├── FormView.jsx         # Upload → form → submit flow
│       │   └── ResultsView.jsx      # Score, flags, breakdown, scripts
│       ├── components/
│       │   ├── DocumentUpload.jsx   # Multi-image upload + camera + drag-drop
│       │   ├── ScoreGauge.jsx       # Animated SVG score dial (0-100)
│       │   ├── DealSummary.jsx      # Side-by-side entered vs calculated
│       │   ├── MarketCheck.jsx      # MSRP comparison with depreciation
│       │   ├── FlagsPanel.jsx       # Red/green flag alerts
│       │   ├── FeeBreakdown.jsx     # Fee itemization with legal citations
│       │   ├── NegotiationTips.jsx  # Copy-paste dealer scripts
│       │   ├── PaymentPreview.jsx   # Live monthly payment calculator
│       │   ├── SearchableSelect.jsx # Filterable dropdown with blur-commit
│       │   └── MoneyInput.jsx       # Currency input with $ prefix
│       └── lib/
│           ├── api.js               # Backend API client
│           ├── imageUtils.js        # Client-side image preprocessing
│           └── analytics.js         # PostHog event tracking
│
├── server/                          # Backend API
│   ├── index.js                     # Express server + SPA static serving
│   ├── routes/
│   │   ├── ocr.js                   # Multi-provider vision AI extraction
│   │   ├── analyze.js               # Deal scoring engine (6 factors)
│   │   ├── vehicle.js               # Make/model/trim + MSRP lookup
│   │   ├── tax.js                   # State tax rates + ZIP-to-state
│   │   └── fees.js                  # State doc fee caps + legal citations
│   └── data/
│       ├── vehicle-msrp.json        # 78 vehicles, 20 brands, trim-level MSRP
│       ├── state-fees.json          # 51 entries (50 states + DC), doc fee caps
│       ├── tax-rates.json           # State + avg local tax rates
│       └── tax-laws.json            # Legal citations for vehicle sales tax
│
└── render.yaml                      # One-click Render deployment blueprint
```

## Scoring Engine

| Factor | Max Points | What It Measures |
|--------|-----------|-----------------|
| Price vs Market | 35 | Vehicle price compared to MSRP / depreciated market value |
| APR Fairness | 20 | Interest rate vs typical for credit tier |
| Fees | 15 | Doc fee vs state legal caps and norms |
| Add-ons | 15 | Total cost of dealer add-ons and F&I products |
| Loan Term | 8 | Shorter terms score higher |
| Down Payment | 7 | Equity position (down payment + trade-in) |

- **Cash deals** (no financing) get full marks for APR and Loan Term
- **Extreme overpay caps** limit total score when price is >1.3x / >1.5x / >2x market
- **Abnormal fee flags** catch registration and title fees that exceed 2x the state typical range
- **Doc fee enforcement** flags fees exceeding legal caps (8 capped states) or 1.5x state typical

## Vision AI Providers

Switchable via `VISION_PROVIDER` environment variable:

| Provider | Model | Cost | Best For |
|----------|-------|------|----------|
| **Google Gemini** (default) | gemini-2.5-flash | Free (1,500 req/day) | Development + free tier users |
| **OpenAI** | gpt-4o | ~$0.03/deal | Premium tier |
| **Anthropic Claude** | claude-sonnet | ~$0.05/deal | Premium tier |

All providers use structured JSON output (Gemini responseSchema / OpenAI JSON mode / Claude tool_use) for reliable field extraction. VIN cross-referenced with NHTSA after extraction.

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
# Edit server/.env — at minimum set GOOGLE_AI_KEY for OCR

# Run both dev servers (Vite on :5173, Express on :3001)
npm run dev
```

## Deployment (Render - Free)

1. Push to GitHub
2. Go to [render.com](https://render.com) -> New -> Web Service
3. Connect your repo, set:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
4. Add environment variables in Render dashboard:
   - `VISION_PROVIDER` = `gemini`
   - `GOOGLE_AI_KEY` = your key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - `VITE_POSTHOG_KEY` = your PostHog project key (optional)
5. Set up [UptimeRobot](https://uptimerobot.com) (free) to ping `https://yourapp.onrender.com/api/health` every 5 min — prevents free tier sleep

## APIs & Data Sources

| Source | Purpose | Cost | Key Required |
|--------|---------|------|-------------|
| Google Gemini | Document extraction (default) | Free tier | Yes |
| OpenAI GPT-4o | Document extraction (premium) | Paid | Yes |
| Anthropic Claude | Document extraction (premium) | Paid | Yes |
| NHTSA vPIC | VIN decoding (year/make/model/trim) | Free | No |
| PostHog | Product analytics | Free tier (1M events/mo) | Yes |
| vehicle-msrp.json | Trim-level MSRP data | Bundled | No |
| state-fees.json | Doc fee caps + legal citations | Bundled | No |
| tax-rates.json | State + local tax rates | Bundled | No |
| tax-laws.json | Sales tax legal citations | Bundled | No |

## Privacy

- Documents are processed by AI to extract deal data, then immediately discarded
- No images or personal information are stored or retained after the session
- No data is shared with or sold to third parties
- Analytics (PostHog) tracks product usage events only, not document contents
