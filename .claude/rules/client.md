---
description: React SPA conventions (router, auth, libs, styling, consent)
paths: ["client/**"]
---

# Client conventions

React 19 + Vite 8 + Tailwind CSS 4 (dark theme, custom tokens). Mobile-first. Entry `src/main.jsx` → `src/App.jsx`.

## Routing (hand-rolled — no react-router)
`App.jsx` maps paths to views via `PATH_TO_VIEW` / `VIEW_TO_PATH` and drives navigation with `history.pushState`/`replaceState` + a `popstate` listener; `goTo(view)` is the navigation primitive. To add a screen: add the path↔view entry and render it in the `view === ...` switch in `AppInner`. Don't introduce a router library.

## State & data flow
Top-level app state (current view, `dealData`, `analysisResult`, saved-report count) lives in `AppInner`. Pages receive data + callbacks as props (e.g. `ResultsView` gets `result`, `user`, `onSaveReport`). Gated actions call `onSaveReport('auth'|'limit'|...)` which the parent maps to modals.

## `lib/`
- `api.js` — backend client (analyze, OCR, `generatePdfReport`, `emailReport`). `emailReport` attaches the Supabase access token as a bearer credential.
- `supabase.js` — browser Supabase client (null if env unset; guard for it).
- `auth.jsx` — `AuthProvider` + `useAuth()` (session, `signIn/signUp/signOut`, password recovery). Wrap auth-aware UI in this context.
- `reports.js` — saved-report CRUD via Supabase, enforces the 5-report cap (`MAX_REPORTS`).
- `format.js` / `imageUtils.js` / `analytics.js` / `cookieconsent.js` — formatting, client image preprocessing, PostHog, consent.

## Analytics & consent
PostHog must only initialize after consent — go through `cookieconsent.js` (`analyticsAccepted()` / `onConsentChange`) and the `analytics.js` helpers. Never call PostHog directly before consent.

## Modals
Match the existing modal pattern (`AuthModal.jsx`, `EmailReportDialog.jsx`): overlay + `role="dialog"` `aria-modal`, ESC-to-close, focus trap, restore focus on unmount. Reuse Tailwind tokens (`bg-surface`, `border-border`, `text-text`/`text-text2`, `bg-accent`).

## Env
Only `VITE_`-prefixed vars reach the browser. Never reference server-only secrets here.
