---
description: Express API conventions (routes, scoring engine, OCR, data loading)
paths: ["server/**"]
---

# Server conventions

Express 5, **ESM** (`"type": "module"` — use `import`, and include the `.js` extension on relative imports). Entry: `server/index.js` mounts routers under `/api/*` and serves the built client in production.

## Routes (`server/routes/`)
- `analyze.js` — deal scoring engine (6 weighted factors), flags, and negotiation scripts.
- `ocr.js` — multi-provider vision extraction.
- `vehicle.js` / `tax.js` / `fees.js` — make/model/MSRP, state tax, doc-fee lookups over bundled JSON.
- `auto-dev.js` — Auto.dev market listings + vehicle photos (premium).
- `pdf.js` — `buildDealPdfBuffer(result)` renders the PDF once; `POST /report` streams it as a download, `POST /email` sends it. Reuse the builder; don't duplicate drawing code.
- `account.js` — Supabase admin account deletion (archives to `deleted_accounts` first).

## `lib/`
- `supabaseAdmin.js` — `adminClient()` (service-role) and `getUserFromRequest(req)` (verifies `Authorization: Bearer <token>`). Use these for any server-side auth check; don't re-implement the client.
- `email.js` — `sendReportEmail({ to, result })` via Resend; throws clear errors if `RESEND_API_KEY`/`EMAIL_FROM` are unset.

## Scoring invariant (critical)
In `analyze.js`, the score, flags, and scripts are all computed from the **same** `dealForScoring` + `marketRef` (`marketRef` = live listings when available, calculated MSRP/depreciation otherwise). If you change how any one is derived, change the others to match — they must stay consistent.

## Reference data
`analyze.js` loads `vehicle-msrp.json`, `state-fees.json`, `tax-rates.json`, `tax-laws.json` once at module init via `readFileSync` (paths relative to the file). These are read-only at runtime; see `.claude/rules/data.md` for their key shapes.

## Feature flags
`config.js` exposes `getFeatures()` / `isEnabled(feature)`, read **lazily** (so dotenv has loaded). `PAID_FEATURES=false` disables Auto.dev listings/photos/market-average. Gate premium paths through these, not by reading `process.env` directly.

## Vision providers
`ocr.js` has a `PROVIDERS` registry (`gemini` default, `openai`, `claude`) selected by `VISION_PROVIDER`. Add a provider by extending the registry with `{ fn, label, keyEnv }`; keep structured-JSON output.

## Secrets
Provider keys, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` are server-only. Never log them or send them to the client.
