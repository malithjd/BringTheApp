---
description: Bundled reference-data key shapes (MSRP, fees, tax)
paths: ["server/data/**"]
---

# Reference data shapes

These JSON files are the read-only source of truth loaded once at startup by `server/routes/analyze.js` (and the lookup routes). Preserve their key shapes — the scoring/lookup code indexes them directly, so a shape change is a breaking change.

## `vehicle-msrp.json`
Nested by `"Make Model"` → `"year"` (string) → trim name → MSRP number. Keys are matched against extracted vehicle fields, so spelling/casing of make/model must stay consistent with what the lookup normalizes to.

```json
{ "Toyota Camry": { "2024": { "LE": 28400, "SE": 30000 } } }
```

## `state-fees.json`
Keyed by 2-letter **state code**; each entry carries doc-fee info (cap, whether capped, legal citation) plus typical registration/title fee ranges used by the abnormal-fee flags.

## `tax-rates.json`
Keyed by 2-letter state code → state + average local sales-tax rates used to compute tax amounts.

## `tax-laws.json`
Keyed by 2-letter state code → legal citation text surfaced in the report (`taxLaws[state]`).

## Editing
- Keep all 50 states + DC present where the file is meant to be complete.
- When adding fields, update the consuming code in `analyze.js`/`fees.js`/`tax.js` in the same change.
- The premium `server/scripts/update-data.js` refreshes these — keep its output conforming to these shapes.
