---
description: React SPA conventions (router, auth, libs, styling, consent)
paths: ["client/**"]
---

# Client conventions

React 19 + Vite 8 + Tailwind CSS 4 (dark theme, custom tokens). Mobile-first. **Fully TypeScript** (`.tsx`/`.ts`, bundler resolution — extensionless imports). Entry `src/main.tsx` → `src/App.tsx`.

## Types
Shared API-contract types live in `shared/types.d.ts` and are re-exported (alongside client-only types like `FormState`, `OcrFields`, `SavedReport`) from `src/types.ts` — import app types from `../types`, not the shared file directly. No `any`; see `.claude/rules/typescript.md`.

## Routing (hand-rolled — no react-router)
`App.tsx` maps paths to views (`type View`) via `PATH_TO_VIEW` / `VIEW_TO_PATH` and drives navigation with `history.pushState`/`replaceState` + a `popstate` listener; `goTo(view)` is the navigation primitive. To add a screen: extend `View` + the path↔view map and render it in the `view === ...` switch in `AppInner`. Don't introduce a router library.

## State & data flow
Top-level app state (current view, `dealData`, `analysisResult`, saved-report count) lives in `AppInner`. Pages receive data + callbacks as props (e.g. `ResultsView` gets `result`, `user`, `onSaveReport`). Gated actions call `onSaveReport('auth'|'limit'|...)` which the parent maps to modals.

## `lib/`
- `api.ts` — backend client (analyze, OCR, `generatePdfReport`, `emailReport`). `emailReport` attaches the Supabase access token as a bearer credential.
- `supabase.ts` — browser Supabase client (null if env unset; guard for it).
- `auth.tsx` — `AuthProvider` + `useAuth()` (session, `signIn/signUp/signOut`, password recovery). Wrap auth-aware UI in this context.
- `reports.ts` — saved-report CRUD via Supabase, enforces the 5-report cap (`MAX_REPORTS`).
- `format.ts` / `imageUtils.ts` / `analytics.ts` / `cookieconsent.ts` — formatting, client image preprocessing, PostHog, consent.

## Analytics & consent
PostHog must only initialize after consent — go through `cookieconsent.ts` (`analyticsAccepted()` / `onConsentChange`) and the `analytics.ts` helpers. Never call PostHog directly before consent.

## Modals
Match the existing modal pattern (`AuthModal.tsx`, `EmailReportDialog.tsx`): overlay + `role="dialog"` `aria-modal`, ESC-to-close, focus trap, restore focus on unmount. Reuse Tailwind tokens (`bg-surface`, `border-border`, `text-text`/`text-text2`, `bg-accent`).

## Env
Only `VITE_`-prefixed vars reach the browser. Never reference server-only secrets here.
