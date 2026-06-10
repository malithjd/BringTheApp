---
description: Express API conventions (routes, scoring engine, OCR, data loading)
paths: ["server/**"]
---

# Server conventions

Express 5, **TypeScript ESM** (`"type": "module"`, NodeNext — relative imports keep an explicit `.js` extension even though sources are `.ts`). Entry: `server/index.ts` mounts routers under `/api/*` and serves the built client in production. Compiles to `server/dist/`.

## Routes (`server/routes/`)
- `analyze.ts` — deal scoring engine (6 weighted factors), flags, and negotiation scripts.
- `ocr.ts` — multi-provider vision extraction.
- `vehicle.ts` / `tax.ts` / `fees.ts` — make/model/MSRP, state tax, doc-fee lookups over bundled JSON.
- `auto-dev.ts` — Auto.dev market listings + vehicle photos (premium).
- `pdf.ts` — `buildDealPdfBuffer(result)` renders the PDF once; `POST /report` streams it as a download, `POST /email` sends it. Reuse the builder; don't duplicate drawing code.
- `account.ts` — Supabase admin account deletion (archives to `deleted_accounts` first).

## `lib/`
- `supabaseAdmin.ts` — `adminClient()` (service-role) and `getUserFromRequest(req)` (verifies `Authorization: Bearer <token>`). Use these for any server-side auth check; don't re-implement the client.
- `email.ts` — `sendReportEmail({ to, result })` via Resend; throws clear errors if `RESEND_API_KEY`/`EMAIL_FROM` are unset.

## Scoring invariant (critical)
In `analyze.ts`, the score, flags, and scripts are all computed from the **same** `dealForScoring` + `marketRef` (`marketRef` = live listings when available, calculated MSRP/depreciation otherwise). If you change how any one is derived, change the others to match — they must stay consistent.

## Reference data
`analyze.ts` loads `vehicle-msrp.json`, `state-fees.json`, `tax-rates.json`, `tax-laws.json` once at module init via `readFileSync` (paths relative to the file). These are read-only at runtime; see `.claude/rules/data.md` for their key shapes.

## Feature flags
`config.ts` exposes `getFeatures()` / `isEnabled(feature)`, read **lazily** (so dotenv has loaded). `PAID_FEATURES=false` disables Auto.dev listings/photos/market-average. Gate premium paths through these, not by reading `process.env` directly.

## Vision providers
`ocr.ts` has a `PROVIDERS` registry (`gemini` default, `openai`, `claude`) selected by `VISION_PROVIDER`. Add a provider by extending the registry with `{ fn, label, keyEnv }`; keep structured-JSON output.

## Secrets
Provider keys, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` are server-only. Never log them or send them to the client.
