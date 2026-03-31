# BringTheApp - Car Deal Analyzer

A mobile-first web app that helps car buyers evaluate dealership offers. Upload your purchase agreement, get an instant deal score, and know exactly where you stand before signing.

**Live:** [bringtheapp.onrender.com](https://bringtheapp.onrender.com)

## What It Does

1. **Upload** your purchase agreement (photo or PDF) - supports multi-page documents
2. **AI extracts** vehicle info, pricing, financing, fees, and add-ons automatically
3. **Scores your deal** 0-100 across 6 weighted factors
4. **Flags problems** - overpriced vehicles, high APR, illegal doc fees, unnecessary add-ons
5. **Generates negotiation scripts** - copy-paste responses for each issue found

## Architecture

```
BringTheApp/
├── client/                    # React 19 + Vite 8 + Tailwind CSS 4
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FormView.jsx          # Upload + deal entry form
│   │   │   └── ResultsView.jsx       # Score, flags, breakdown, scripts
│   │   ├── components/
│   │   │   ├── DocumentUpload.jsx    # Multi-image upload with preprocessing
│   │   │   ├── ScoreGauge.jsx        # Animated SVG score dial
│   │   │   ├── DealSummary.jsx       # Price/payment summary card
│   │   │   ├── MarketCheck.jsx       # Market value comparison
│   │   │   ├── FlagsPanel.jsx        # Red/green flag alerts
│   │   │   ├── FeeBreakdown.jsx      # Fee itemization with legal refs
│   │   │   ├── NegotiationTips.jsx   # Copy-paste negotiation scripts
│   │   │   ├── SearchableSelect.jsx  # Filterable dropdown
│   │   │   ├── MoneyInput.jsx        # Currency input with formatting
│   │   │   └── PaymentPreview.jsx    # Live payment calculator
│   │   ├── lib/
│   │   │   ├── api.js                # API client functions
│   │   │   └── imageUtils.js         # Client-side image preprocessing
│   │   └── App.jsx                   # Router + layout
│   └── vite.config.js
│
├── server/                    # Express 5 + Node.js
│   ├── routes/
│   │   ├── ocr.js            # Multi-provider vision AI extraction
│   │   ├── analyze.js        # Deal scoring engine (6 factors, 100 pts)
│   │   ├── vehicle.js        # Make/model/trim + MSRP lookup
│   │   ├── tax.js            # State tax rates + ZIP lookup
│   │   └── fees.js           # State doc fee caps + legal citations
│   ├── data/
│   │   ├── vehicle-msrp.json # 78 vehicles, 20 brands, trim-level pricing
│   │   ├── state-fees.json   # 51 entries, doc fee caps + statutes
│   │   ├── tax-rates.json    # All 50 states + DC
│   │   └── tax-laws.json     # Legal citations for vehicle sales tax
│   └── index.js              # Express server + static file serving
│
└── render.yaml               # One-click Render deployment blueprint
```

## Scoring Engine

| Factor | Max Points | What It Measures |
|--------|-----------|-----------------|
| Price vs Market | 35 | Vehicle price compared to MSRP/market value |
| APR Fairness | 20 | Interest rate vs typical for credit tier |
| Fees | 15 | Doc fee vs state legal caps/norms |
| Add-ons | 15 | Total cost of dealer add-ons and F&I products |
| Loan Term | 8 | Shorter terms score higher |
| Down Payment | 7 | Equity position (down + trade-in) |

Cash deals (no financing) automatically get full marks for APR and Loan Term.

Extreme overpay caps prevent inflated scores when the price is way above market.

## Vision AI Providers

The document scanner supports 3 providers, switchable via `VISION_PROVIDER` env var:

| Provider | Env Var | Model | Cost |
|----------|---------|-------|------|
| **Google Gemini** (default) | `GOOGLE_AI_KEY` | gemini-2.5-flash | Free tier (1,500 req/day) |
| **OpenAI** | `OPENAI_API_KEY` | gpt-4o | ~$0.03/deal |
| **Anthropic Claude** | `ANTHROPIC_API_KEY` | claude-sonnet | ~$0.05/deal |

All providers use structured output (JSON schema / tool_use) for reliable extraction.

## Local Development

```bash
# Install everything
npm run install:all

# Set up environment
cp server/.env.example server/.env
# Edit server/.env with your API key(s)

# Run dev servers (Vite on :5173, Express on :3001)
npm run dev
```

## Deployment (Render - Free)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo — Render reads `render.yaml`
4. Set environment variables in the dashboard:
   - `VISION_PROVIDER` = `gemini` (or `openai` / `claude`)
   - `GOOGLE_AI_KEY` = your key
5. Set up [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 5 min (prevents free tier sleep)

## APIs Used

| API | Purpose | Cost |
|-----|---------|------|
| Google Gemini | Document extraction (default) | Free |
| NHTSA vPIC | VIN decoding | Free, no key |
| OpenAI GPT-4o | Document extraction (premium) | Paid |
| Anthropic Claude | Document extraction (premium) | Paid |

Vehicle MSRP, state taxes, doc fee caps, and legal citations are bundled as JSON data files — no external API calls needed at runtime.

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend:** Express 5, Node.js
- **Image Processing:** Sharp (server), Canvas API (client)
- **Hosting:** Render (free tier)
