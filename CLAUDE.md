# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BringTheApp is a mobile-first car-deal analyzer. A buyer uploads a dealership purchase agreement (photos/PDF), AI extracts the fields, and the backend scores the deal 0–100 across 6 weighted factors, flags problems, and generates copy-paste negotiation scripts. Users can download the report PDF, email it to themselves (signed in), and save/compare reports. Live at bringtheapp.onrender.com.

Deeper references: `DESIGN.md` (architecture & UX rationale), `PRODUCT.md` (product spec), and `.claude/rules/` (path-scoped conventions auto-loaded when you touch `server/`, `client/`, or `server/data/`). **Keep docs current:** when you change a subtree, update its matching rule in `.claude/rules/`.

## Commands

Run all from the repo root unless noted.

- `npm run dev` — starts server (`node --watch`, :3001) and client (Vite, :5173) concurrently. Vite proxies `/api` → `:3001`.
- `npm run build` — installs client dev deps, builds the client to `client/dist`, then installs server deps. This is the Render build step.
- `npm start` — production: `NODE_ENV=production node server/index.js`. The server serves `client/dist` and handles the SPA fallback; there is no separate client process in prod.
- `npm run install:all` — install root + client + server deps.
- `cd client && npm run lint` — ESLint (the only lint/test tooling in the repo; there is no test suite).

To run server or client alone: `npm run dev:server` / `npm run dev:client`.

## Environment

Two separate `.env` files, each with its own `.env.example`:
- `server/.env` — vision provider keys, Auto.dev, Supabase (incl. service-role), Resend (`RESEND_API_KEY`, `EMAIL_FROM`), feature flags, `PORT`, `NODE_ENV`.
- `client/.env` — must use the `VITE_` prefix (PostHog + Supabase public keys).

`server/index.js` loads `server/.env` explicitly via dotenv path. Supabase anon keys live client-side; Supabase service-role/admin usage is server-side (`lib/supabaseAdmin.js`, used by `routes/account.js` and the email route). Never expose service-role/provider/Resend keys to the client.

## Architecture

Monorepo with three `package.json` files (root orchestrator, `client/`, `server/`). Both client and server are ESM (`"type": "module"`).

### Backend (`server/`)
Express 5 app in `index.js` mounts one router per concern under `/api/*`:
`tax`, `fees`, `vehicle`, `analyze`, `ocr`, `market` (→ `auto-dev.js`), `pdf`, `account`. `/api/health` exists to keep the Render free tier awake (UptimeRobot ping).

Reference data is plain JSON in `server/data/` (`vehicle-msrp.json`, `state-fees.json`, `tax-rates.json`, `tax-laws.json`), loaded synchronously at module init — **there is no database for deal data.** Supabase is used only for auth and user-saved reports. When changing data files, match the existing key shape (e.g. MSRP keyed by `"Make Model"` → year → trim); `analyze.js` does fuzzy make/model matching and nearest-year fallback against those keys.

`routes/analyze.js` is the core engine and the most important file:
- `scoreDeal()` — the 6 factors and their max points: Price vs Market (35), APR Fairness (20), Fees (15), Add-ons (15), Loan Term (8), Down Payment (7). Tunable tables live at the top of the file: `FAIR_APR` (per credit tier), `DEPRECIATION` (per vehicle age). Includes an extreme-overpay penalty that caps the score regardless of other factors.
- `generateFlags()` and `generateNegotiationScripts()` derive from the same computed deal/market reference (`marketRef`) as the score, so they stay consistent. If you change scoring thresholds, update flags/scripts in lockstep.

`routes/ocr.js` is multi-provider vision extraction. Providers are registered in a `PROVIDERS` map (`gemini` | `openai` | `claude`), selected at runtime by `VISION_PROVIDER` (default `gemini`). A shared system prompt and `mapToFormFields()` normalize every provider's output to the same form schema, so the rest of the app is provider-agnostic. To add a provider: write an `extractWith*` fn and register it in `PROVIDERS`.

`routes/pdf.js` renders the report PDF once via `buildDealPdfBuffer(result)`; `POST /report` streams it as a download and `POST /email` (sign-in required) sends it as an attachment via Resend (`lib/email.js`).

`config.js` exposes lazy feature flags (`getFeatures()` / `isEnabled()`) gating Auto.dev features (`marketListings`, `vehiclePhotos`, `marketAverage`) behind `PAID_FEATURES`. Read flags lazily inside handlers — do not capture them at import time (dotenv timing).

### Frontend (`client/src/`)
React 19 + Vite 8 + Tailwind CSS 4 (via `@tailwindcss/vite`, no separate config file). Dark theme with custom design tokens.

**Routing is hand-rolled, not React Router.** `App.jsx` maps pathnames ↔ view names via `PATH_TO_VIEW`, drives navigation with `history.pushState`/`replaceState`, and listens to `popstate`. Page state (`dealData`, `analysisResult`) lives in `AppInner` and is passed down — adding a route means extending the `PATH_TO_VIEW` map and rendering the view.

- `pages/` — `LandingPage`, `FormView` (upload → form → submit), `ResultsView` (score/flags/breakdown/scripts, download/save/email), `CompareView`, `AccountPage`.
- `lib/api.js` — typed wrappers around `/api/*`; all requests go through `fetchJSON`.
- `lib/auth.jsx` — Supabase auth context (`AuthProvider`/`useAuth`), including password-recovery handling that redirects to `/account`.
- `lib/reports.js` — saved-report CRUD via Supabase (5-report cap, `MAX_REPORTS`).
- `lib/imageUtils.js` — client-side image preprocessing (EXIF correction, resize, compression) before upload; server re-processes with Sharp.
- Analytics (PostHog) and cookie consent are gated: analytics only initializes after consent (`lib/cookieconsent.js` → `lib/analytics.js`).

### Deployment
Single Render service defined by `render.yaml`. Build = `npm run build`, start = `npm start`. The same Node process serves the API and the static SPA build in production.

## Conventions

- ESLint rule: unused vars error, but identifiers matching `^[A-Z_]` are ignored (intentional for constants/components).
- Keep scoring, flags, and negotiation scripts derived from a single computed deal object so the three never disagree.
- Reference data changes (new vehicles/states/rates) go in `server/data/*.json`, not code.
