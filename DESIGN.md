---
name: BringTheApp
tagline: "The Car Dealer's Worst Nightmare."
product-name: BringTheApp
description: "Your car dealer added $3,000 in fake fees. We found them in 60 seconds."
colors:
  ink:            "#111111"
  surface:        "#1C1C1C"
  surface-2:      "#252525"
  border:         "#2A2A2A"
  border-subtle:  "#1E1E1E"
  white:          "#FAFAF7"
  white-card:     "#FFFFFF"
  white-border:   "#E8E4D8"
  steel:          "#6B6B63"
  muted:          "#9E9E8E"
  yellow:         "#F5C400"
  yellow-hover:   "#E6B800"
  yellow-text:    "#B8920A"
  yellow-dark:    "#3D2A00"
  critical:       "#C0392B"
  critical-bg:    "#FFF0EE"
  critical-text:  "#7A1F14"
  critical-pill:  "#FFD9D4"
  warning:        "#E67E22"
  warning-bg:     "#FFF8EC"
  warning-text:   "#6B3A0A"
  warning-pill:   "#FFE8C2"
  success:        "#27AE60"
  success-bg:     "#EDFBF3"
  success-text:   "#0D5A28"
  success-pill:   "#C8F2D9"
  info:           "#3B82F6"
  info-bg:        "#EEF4FF"
  info-text:      "#1E40AF"
typography:
  display:
    fontFamily: "'DM Serif Display', Georgia, serif"
    fontSize: "clamp(38px, 5vw, 62px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  h1:
    fontFamily: "'DM Serif Display', Georgia, serif"
    fontSize: "clamp(28px, 3.5vw, 42px)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "'Sora', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  h3:
    fontFamily: "'Sora', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "'Sora', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "'Sora', system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.12em"
    transform: "uppercase"
  button:
    fontFamily: "'Sora', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: "0.01em"
rounded:
  tag:  "20px"
  btn:  "8px"
  card: "12px"
  lg:   "14px"
  full: "9999px"
spacing:
  base: "4px"
  xs:   "4px"
  sm:   "8px"
  md:   "16px"
  lg:   "24px"
  xl:   "32px"
  2xl:  "48px"
  3xl:  "64px"
  4xl:  "80px"
  5xl:  "100px"
motion:
  fast:   "100ms"
  base:   "200ms"
  slow:   "350ms"
  easing: "cubic-bezier(0.16, 1, 0.3, 1)"
components:
  button-primary:
    backgroundColor: "#F5C400"
    textColor: "#111111"
    rounded: "8px"
    padding: "14px 28px"
    hover-backgroundColor: "#E6B800"
    transition: "100ms"
  button-primary-on-yellow:
    backgroundColor: "#111111"
    textColor: "#F5C400"
    rounded: "8px"
    padding: "14px 28px"
    hover-backgroundColor: "#1C1C1C"
  button-secondary:
    backgroundColor: "#1C1C1C"
    textColor: "#FAFAF7"
    rounded: "8px"
    padding: "14px 28px"
    hover-backgroundColor: "#252525"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "#6B6B63"
    border: "none"
    textDecoration: "underline"
    textUnderlineOffset: "4px"
  input-default:
    backgroundColor: "#FFFFFF"
    textColor: "#111111"
    border: "1px solid #E8E4D8"
    rounded: "8px"
    padding: "12px 16px"
    fontSize: "16px"
  input-focus:
    border: "1px solid #111111"
    boxShadow: "0 0 0 3px rgba(245, 196, 0, 0.2)"
  input-error:
    border: "1px solid #C0392B"
    backgroundColor: "#FFF0EE"
  badge-critical:
    backgroundColor: "#FFD9D4"
    textColor: "#7A1F14"
    rounded: "4px"
    padding: "2px 8px"
    label: "PROBLEM"
  badge-warning:
    backgroundColor: "#FFE8C2"
    textColor: "#6B3A0A"
    rounded: "4px"
    padding: "2px 8px"
    label: "CHECK THIS"
  badge-success:
    backgroundColor: "#C8F2D9"
    textColor: "#0D5A28"
    rounded: "4px"
    padding: "2px 8px"
    label: "YOU'RE GOOD"
  badge-info:
    backgroundColor: "#DBEAFE"
    textColor: "#1E40AF"
    rounded: "4px"
    padding: "2px 8px"
    label: "INFO"
shadows:
  sm:  "0 1px 2px rgba(17,17,17,0.06)"
  md:  "0 4px 12px rgba(17,17,17,0.08)"
  lg:  "0 8px 24px rgba(17,17,17,0.10)"
  marketing: "none"
z-index:
  base:    0
  nav:     100
  dropdown:200
  overlay: 300
  modal:   400
  toast:   500
---

# Design System: BringTheApp

## 1. Overview

**Creative North Star: "Watchdog, Not Vendor."**

BringTheApp is the tool a dealer doesn't want to exist. Every visual decision
reinforces that positioning. The brand is investigative — think evidence room,
not dashboard. It is warm enough to not feel hostile to a nervous first-time
buyer, but precise enough that a seasoned negotiator respects the data.

The dominant background is Ink Black (#111111). Not navy, not charcoal —
black. No other SaaS product in this space does this. It reads as a legal
deposition, not a startup product tour. The single accent color is Evidence
Yellow (#F5C400): caution tape, police scene markers, "pay attention here."
It shows up in one place on each screen — the primary CTA. Every time a user
sees yellow they know exactly what to do.

Character images are Pixar-style 3D renders placed directly on dark backgrounds
using `mix-blend-mode: multiply` so white backgrounds disappear entirely and
the characters float in the page. Alex (the buyer) always wears yellow and is
always winning. Marcus (the dealer) is always in the background, always losing.

This system explicitly rejects:
- CarMax / TrueCar / Carvana: soft-sell warmth that serves the industry
  the user is protecting themselves from
- Consumer-alert / legal sites: bureaucratic warning-banner overload
- Generic SaaS dark mode: purple gradients, glassmorphism, feature carousels

**Key Characteristics:**
- Ink Black dominant canvas — unique in this category
- Evidence Yellow reserved strictly for primary CTA — one per screen
- Serif + sans pairing: DM Serif Display (authority) + Sora (clarity)
- Semantic colors communicate deal state only — never decoration
- Characters float without frames using mix-blend-mode: multiply
- 4px base spacing unit — all values are multiples of 4
- Mobile-first — users are often on a phone at the dealership

---

## 2. Colors

### Brand Palette

**Ink Black — #111111**
The page. Hero sections, navbar, footer, all dark surfaces. Not decorative —
structural. Creates the "serious tool" read before a single word is processed.

**Evidence Yellow — #F5C400**
The single action color. Primary CTA buttons only. One per screen. When users
see yellow they know it is the thing to press. Also used for: eyebrow labels
on dark backgrounds, stat callout values, the logo accent.
- Hover: #E6B800
- As text on white: #B8920A (passes WCAG AA at 4.6:1)
- NEVER use #F5C400 as text on white — fails contrast. Use #B8920A instead.
- NEVER use as background for anything except the primary CTA button.

**Warm White — #FAFAF7**
Page background for product/trust sections (pricing, checkout, how-it-works
alternating panels). Off-white reads as paper document, not sterile screen.

**Surface — #1C1C1C**
Cards and panels that sit on the Ink Black background. Use for: report cards,
pricing cards (non-featured), stat surfaces, code blocks.

### Semantic Colors

Each semantic color has four values: main, background tint, text, pill.
Use the full set together — never mix e.g. critical border with warning bg.

```
Critical (Problem):
  border/icon:  #C0392B
  surface:      #FFF0EE
  text:         #7A1F14
  pill:         #FFD9D4

Warning (Check This):
  border/icon:  #E67E22
  surface:      #FFF8EC
  text:         #6B3A0A
  pill:         #FFE8C2

Success (You're Good):
  border/icon:  #27AE60
  surface:      #EDFBF3
  text:         #0D5A28
  pill:         #C8F2D9

Info:
  border/icon:  #3B82F6
  surface:      #EEF4FF
  text:         #1E40AF
  pill:         #DBEAFE
```



**The State-Reads-Color Rule**
Semantic colors exist only for deal-state feedback: flag cards, score ring,
status badges, flag severity labels. A green headline reads as a deal signal.
A red button reads as a danger action. Neither is acceptable.

### Accessibility
All text color pairings must meet WCAG 2.1 AA (4.5:1 minimum):
- #FAFAF7 on #111111: 19.1:1 ✓ AAA
- #111111 on #F5C400: 13.1:1 ✓ AAA (button text)
- #B8920A on #FAFAF7: 4.6:1 ✓ AA (yellow text on light bg)
- #7A1F14 on #FFD9D4: 8.2:1 ✓ AAA (critical text on critical pill)
- #F5C400 on #FAFAF7: 1.6:1 ✗ FAIL — never use

---

## 3. Typography

**Display / Headlines: DM Serif Display**
Google Fonts. Weight 400 only — no bold variant.
Used exclusively on: hero headlines, page titles, report score summaries,
pricing numbers, section titles on marketing pages.
DM Serif Display communicates editorial authority. It reads as a contract,
a legal brief, a newspaper headline. It sets the watchdog tone before any
copy is read.

**Everything else: Sora**
Google Fonts. Weights 400 (body), 500 (labels/headings), 600 (buttons).
Used on: navbar, buttons, body copy, form labels, flags, badges, captions,
sub-headings within product UI.
Sora is clean and slightly geometric — precise without being cold.

**The Rule: if it's a headline, DM Serif Display. If it does anything
(button, label, form, data), Sora.**

### Type Scale

| Role    | Font                | Size                    | Weight | Line-height | Tracking  |
|---------|---------------------|-------------------------|--------|-------------|-----------|
| Display | DM Serif Display    | clamp(38px, 5vw, 62px)  | 400    | 1.05        | -0.02em   |
| H1      | DM Serif Display    | clamp(28px, 3.5vw, 42px)| 400    | 1.15        | -0.01em   |
| H2      | Sora                | 22px                    | 500    | 1.30        | normal    |
| H3      | Sora                | 17px                    | 500    | 1.40        | normal    |
| Body    | Sora                | 15px                    | 400    | 1.70        | normal    |
| Label   | Sora                | 11px                    | 500    | 1.50        | 0.12em    |
| Button  | Sora                | 14px                    | 600    | 1.00        | 0.01em    |

Labels are always uppercase. Use `text-transform: uppercase`.
Tabular numerics on all monetary values, scores, percentages:
`font-variant-numeric: tabular-nums`

---

## 4. Spacing

Base unit: **4px**. Every gap, padding, and margin is a multiple of 4.

| Token | Value |
|-------|-------|
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |
| 2xl   | 48px  |
| 3xl   | 64px  |
| 4xl   | 80px  |
| 5xl   | 100px |

Section vertical padding: 100px top/bottom on desktop, 64px on mobile.
Max content width: 1280px centered.
Page horizontal padding: 80px desktop, 24px mobile.

---

## 5. Border Radius

| Token | Value  | Use                              |
|-------|--------|----------------------------------|
| tag   | 20px   | Badges, pills, eyebrow labels    |
| btn   | 8px    | Buttons, inputs, small cards     |
| card  | 12px   | Standard content cards           |
| lg    | 14px   | Large cards, pricing panels      |
| full  | 9999px | Circular elements only           |

Do not mix radius sizes at the same nesting level.

---

## 6. Elevation & Shadows

Elevation is expressed through surface color progression, not shadows.

| Level   | Color   | Use                             |
|---------|---------|---------------------------------|
| Base    | #111111 | Page background (dark sections) |
| Surface | #1C1C1C | Cards on dark bg                |
| Surface2| #252525 | Nested panels, hover bg         |
| Light   | #FAFAF7 | Page background (light sections)|
| Card    | #FFFFFF | Cards on light bg               |

**Shadows: only on product UI cards, never on marketing sections.**
```
sm:  0 1px 2px rgba(17,17,17,0.06)   — inputs, small elements
md:  0 4px 12px rgba(17,17,17,0.08)  — cards on light bg
lg:  0 8px 24px rgba(17,17,17,0.10)  — modals, dropdowns
marketing sections: no shadows ever
```

---

## 7. Motion

One easing curve for everything: `cubic-bezier(0.16, 1, 0.3, 1)`
Snappy start, smooth finish. Feels confident.

| Duration | Use                                           |
|----------|-----------------------------------------------|
| 100ms    | Hover state color transitions                 |
| 200ms    | State changes, input focus, expand/collapse   |
| 350ms    | Modals, drawers, page transitions             |

**Scroll animations (Framer Motion):**
```tsx
initial={{ opacity: 0, y: 24 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
// Stagger on card grids: delay={index * 0.15}
```

**Score ring animation:**
Stroke-dashoffset from 0 → score over 1.2s, ease-out.
Number counts up using requestAnimationFrame.
`prefers-reduced-motion`: jump to final value instantly.

**Always respect `prefers-reduced-motion`.**
All entrance animations must have a reduced-motion fallback.

---

## 9. Components

### Buttons

One primary CTA per screen. Yellow means "do the thing." This rule is not
negotiable — the moment yellow appears on a second button the signal breaks.

```
Primary:     bg #F5C400, text #111111, rounded-btn, px-7 py-3.5, font-semibold
             hover: bg #E6B800, transition 100ms
             Used for: the main conversion action on the screen

Primary (on yellow bg): bg #111111, text #F5C400
             Used inside yellow CTA sections only

Secondary:   bg #1C1C1C, text #FAFAF7, rounded-btn
             Used when yellow would compete (second action on dark sections)

Ghost:       transparent, text #6B6B63, underline, underline-offset-4
             Used for: tertiary actions, "skip", "learn more"

Danger:      bg #C0392B, text #FAFAF7
             Used exclusively for: delete, cancel subscription, remove card
```

Button heights: sm=32px, default=44px, lg=52px
All buttons: Sora font, no DM Serif Display ever.

### Flag Cards

Flag cards are the product's most important UI element. They communicate
the result of the analysis. Plain English always — no codes, no jargon.

```
Wrapper: rounded-xl border-l-[4px] overflow-hidden

Critical: border-l-critical bg-critical-bg
Warning:  border-l-warning  bg-warning-bg
Success:  border-l-success  bg-success-bg
Info:     border-l-info     bg-info-bg

Content (p-5):
  Severity badge: pill, semantic colors (see badge tokens above)
  Label text:    "PROBLEM" / "CHECK THIS" / "YOU'RE GOOD" / "INFO"
                 (never: CRITICAL, WARNING, OK, ALERT)
  Title:         Sora 500 15px text-ink
  Explanation:   Sora 400 14px text-steel leading-[1.6]
  Amount pill:   semantic pill with dollar amount

Expandable negotiation script:
  Trigger: chevron rotates 180° (Framer Motion, 200ms)
  Content: animated height reveal
  Script text: italic, Sora 400 14px, bg-[#F8F6F0] rounded-lg p-4
  Copy button: text-[#B8920A] text-sm underline
```

### Score Ring

The product's signature output component.

```
SVG circle, diameter 160px default
Stroke: strokeWidth=10, strokeLinecap=round
Background track: #252525
Progress arc: semantic color (critical/warning/success)
Score number: DM Serif Display 48px, semantic color, centered
Label: Sora 500 11px uppercase tracking-[0.1em], semantic color

Color thresholds:
  ≥ 70:  success  (#27AE60) — "Looks Clean"
  40–69: warning  (#E67E22) — "Review Carefully"
  < 40:  critical (#C0392B) — "High Risk"

Animation: stroke-dashoffset 0→final over 1.2s ease-out
Number: requestAnimationFrame count-up, ease-out timing
Reduced motion: jump to final value instantly
```

### Inputs

```
Default:  border border-[#E8E4D8] rounded-btn bg-white text-ink px-4 py-3
          font-size: 16px (prevents iOS auto-zoom — mandatory)
Focus:    border-ink ring-2 ring-yellow/20
Error:    border-critical bg-critical-bg
          Error text: text-critical text-[12px] mt-1
Disabled: opacity-50 cursor-not-allowed
```

### Navbar

```
bg-ink border-b border-border sticky top-0 z-[100]
height: 72px
Logo: "Lemon🍋Flag" — DM Serif Display, text-white, text-2xl
Nav links: Sora 400 text-steel hover:text-white transition-colors 100ms
CTA: Primary button (yellow), "Check my contract →"
Mobile: hamburger → slide-down drawer, bg-ink
```

### Cookie Consent

```
Fixed bottom-0 full width z-50 bg-surface border-t border-border
py-4 px-8 flex justify-between items-center
Left: text-muted text-sm, max-w-[560px]
      "We use cookies to keep you signed in and improve the product.
       We don't sell your data or serve ads."
Right:
  "Essentials only" — border border-border text-steel rounded-btn px-4 py-2 text-sm
  "Accept all" — bg-yellow text-ink font-semibold rounded-btn px-4 py-2 text-sm

Appears: first visit only (localStorage: 'ba_cookie_consent')
Animation: slide-up from bottom, delay 1.5s, Framer Motion
```

---

## 10. Page Modes

The site operates in three distinct visual modes. Developers must not mix these.

**Marketing Mode (landing, pricing, how-it-works)**
bg-ink dominant, DM Serif Display headlines, Evidence Yellow CTAs.
Goal: convert visitors into signups.

**Product Mode (scan, report, dashboard)**
bg-white dominant, clinical precision, data tables, flag cards, score ring.
Goal: deliver the analysis clearly and quickly.

**Trust Mode (checkout, account, legal)**
bg-white fully dominant, minimal decoration.
Conservative type, Stripe UI, lock icons.
Goal: earn payment with calm authority.

---

## 11. Do's and Don'ts

### Do:
- Use Evidence Yellow exclusively for the primary CTA. One per screen.
- Use #B8920A (Deep Gold) for yellow text on light backgrounds — never #F5C400.
- Keep all input font-size at 16px to prevent iOS auto-zoom.
- Apply `tabular-nums` to all monetary values, scores, and percentages.
- Use DM Serif Display for headlines only. Sora for all interactive elements.
- Use semantic colors only for deal-state: flags, score ring, status badges.
- Respect `prefers-reduced-motion` — all animations need a fallback.

### Don't:
- Don't use #F5C400 as text color on any light background — fails WCAG.
- Don't put two yellow buttons on the same screen. The signal dies.
- Don't use DM Serif Display in buttons, labels, forms, or data values.
- Don't add box shadows to marketing section elements.
- Don't use semantic colors decoratively (no green headings, no red buttons).
- Don't use purple gradients, glassmorphism, or the aesthetic of generic SaaS.
- Don't design for CarMax / TrueCar warmth — this tool is on the buyer's side.
- Don't use warning-banner overload. One flag at a time. No all-caps screaming.
- Don't mix page modes — product UI (forms, data) doesn't appear in marketing mode.
