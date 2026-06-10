---
description: TypeScript conventions (strict mode, shared contract types, NodeNext)
paths: ["**/*.ts", "**/*.tsx"]
---

# TypeScript conventions

The repo compiles under `strict` (config in `tsconfig.base.json`, extended by `client/`, `server/`). The server is fully migrated to strict TS; the client is migrating incrementally (`allowJs` keeps `.jsx`/`.js` building until converted).

## Rules
- **No `any`.** For values whose shape you don't control (external API JSON, `fetch().json()`, thrown errors), use `unknown` and narrow — cast to a minimal declared interface (e.g. `as { Results?: ... }`), don't reach for `any`.
- **Catch clauses:** `catch (err)` gives `unknown`. Use the shared `errMsg(err)` helper (`server/lib/errors.ts`) for messages instead of `err.message`.
- **Shared API contract:** request/response types live in `shared/types.d.ts` (a declaration file, so it emits no JS and stays out of the server's build `rootDir`). Import with `import type { ... }`. The server consumer (`pdf.ts`, `email.ts`) imports it; `analyze.ts` produces the response loosely (it isn't annotated to the contract — keep them in sync by hand).
- **Server module resolution is NodeNext:** relative imports must carry an explicit `.js` extension (e.g. `import { errMsg } from '../lib/errors.js'`) even though the source file is `.ts`. The client uses bundler resolution (extensionless imports are fine).
- **Prefer `?? 0` / guards over non-null assertions** for nullable numeric fields used in arithmetic; reserve `!` for cases a prior guard already proved.

## Build
- Server: `npm run build` = `tsc` → `dist/`, then copies `data/` to `dist/data` (tsc does not emit JSON). Output entry is `dist/index.js`; paths in `index.ts` resolve the client build at `../../client/dist`.
- Typecheck without emit: `npm run typecheck` in `client/` and `server/`.
