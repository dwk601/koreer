---
name: Koreer
description: A quiet, editorial job board for Korean speakers in the US.
colors:
  bg: "#faf9f5"
  surface: "#ffffff"
  surface-muted: "#f1efe8"
  border: "#16151214"
  border-strong: "#16151229"
  ink: "#16140f"
  ink-soft: "#3a3833"
  ink-mute: "#6f6c64"
  accent: "#1a2a28"
  accent-ink: "#f6f5ef"
  chip-ko-bg: "#efe8d4"
  chip-ko-ink: "#564613"
  chip-en-bg: "#dfe9e9"
  chip-en-ink: "#17353a"
  chip-bi-bg: "#e9e8f3"
  chip-bi-ink: "#38347b"
  focus: "#a38b2d"
typography:
  display:
    fontFamily: "Pretendard, 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Geist', sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.75rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.011em"
  card-title:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: "0.78125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  hairline: "3px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  "2xl": "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  "2xl": "72px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "36px"
  button-pill-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "36px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  card-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  chip-ko:
    backgroundColor: "{colors.chip-ko-bg}"
    textColor: "{colors.chip-ko-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  chip-en:
    backgroundColor: "{colors.chip-en-bg}"
    textColor: "{colors.chip-en-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  chip-bi:
    backgroundColor: "{colors.chip-bi-bg}"
    textColor: "{colors.chip-bi-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "56px"
  filter-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "6px 8px"
  filter-row-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "6px 8px"
---

# Design System: Koreer

## 1. Overview

**Creative North Star: "The Editorial Bulletin"**

Koreer is a job board that behaves like a well-edited newsletter. The visual system is restrained, print-adjacent, signal-dense. Newsprint-cream surfaces, warm near-black ink, one confident evergreen accent, and three low-chroma language chips do all the work that gradients, illustrations, and engagement chrome do on lesser sites. Pretendard carries Korean and Geist carries Latin, both tuned per locale (`word-break: keep-all` and tighter tracking for `:lang(ko)`, slightly closer tracking for `:lang(en)`) so neither script reads like a translation of the other.

This system rejects, by name, what PRODUCT.md rejects: generic SaaS dashboards (no navy-and-cyan, no hero-metric template), LinkedIn-corporate chrome, Indeed ad-cluttered density, the banner-walls of 잡코리아 / 사람인 / 인크루트, and consumer-app candy (no gradient blobs, no bouncy entrances, no Memphis shapes). When in doubt the system leans toward editorial print and away from "modern web app". The user should feel the page was *curated by someone who respects their time*, not aggregated by a platform desperate for engagement.

The whole surface is built so source provenance and recency are visible at a glance. Every card carries its source label and posted-relative date in the same hierarchical position; the home hero's stats strip exposes the corpus size and category mix without graphs or motion. Decoration is what gets cut first; restraint is what gets defended.

**Key Characteristics:**
- Tinted neutrals only — no `#fff`, no `#000`. Surfaces tilt warm; ink is a warm near-black (`#16140f`).
- One confident accent: deep evergreen on cream. Used at most ~10% of any screen.
- Three categorical language chips, low chroma, never used for state.
- Hairline borders (`rgba(22,21,18,0.08)`) carry structure. Shadows appear only on response.
- Pill geometry for actions; `12px` rounded rectangles for cards. Nothing in between.
- Eyebrow labels in 11px, uppercase, `0.16–0.22em` tracking — the only time we shout.
- Motion is exponential ease-out at 180ms. Reduced-motion is honoured globally.

## 2. Colors

A warm-tinted, low-chroma palette: newsprint cream surface, evergreen accent, three language tints. Every neutral is biased toward the same warm hue family so the whole page reads as one paper stock.

### Primary
- **Deep Evergreen** (`#1a2a28`): the singular accent. Used on the primary submit button, the apply CTA on the detail page, the primary pagination button, the active state of the locale switcher, and the 2px header logo dot. Nothing else gets this color. *On dark mode, this flips to a warm bone (`#f0ecdf`) and accent-ink becomes the dark surface — the accent is always the most-confident value on the page, regardless of theme.*

### Neutral
- **Newsprint Cream** (`#faf9f5`): the page background. The whole surface sits on this. Never `#fff`.
- **Page White** (`#ffffff`): cards, inputs, header on scroll, the popover surface inside the search combobox. The only true white in the system, used as an *inset* surface against the cream page, not as the page itself.
- **Margin Tone** (`#f1efe8`): hover and selected fill for filter rows, sidebar facet sections, the dot icon in the empty state. Quiet enough to indicate state without competing with content.
- **Editorial Black** (`#16140f`): primary ink. A warm near-black, *not* `#000`. Headings, body emphasis, active nav.
- **Body Ink** (`#3a3833`): supporting body copy and muted button labels.
- **Caption Gray** (`#6f6c64`): metadata, captions, eyebrow labels, divider counts, the salary "—" placeholder.
- **Hairline** (`#16151214`, ≈ 8% black-warm): the default border. Visible at desk distance, invisible from one step further. Used on cards, dividers, header bottom, footer top.
- **Hairline Strong** (`#16151229`, ≈ 16% black-warm): hover/focus border, the resting border on the search bar. The system's "I am a real edge" weight.

### Categorical (Language Chips)
Three tints calibrated to read as labels, never as state. Each pair (background + ink) is hand-balanced for AA contrast and tuned in the same low-chroma register.
- **Aged Paper** (`#efe8d4`) + **Sealed Ink** (`#564613`): Korean-only listings.
- **Sea Mist** (`#dfe9e9`) + **Harbor Ink** (`#17353a`): English-only listings.
- **Wisteria Wash** (`#e9e8f3`) + **Dyed Indigo** (`#38347b`): bilingual listings.

### Focus
- **Brass Underline** (`#a38b2d`): the focus ring. Warm gold against cream, never blue. Applied as a 2px outline with 2px offset on every interactive element. Same value, every element, no exceptions.

### Named Rules

**The One Voice Rule.** Deep Evergreen appears on no more than ~10% of any rendered screen. There is exactly one primary action per view (submit search, apply, paginate forward). The locale switcher's active pill and the 8px logo dot are the only secondary uses. Two evergreen elements competing on screen is a bug, not a design.

**The No Pure Black Rule.** `#000` and `#fff` are forbidden in the source. Every neutral is a warm tint. If a color picker yields `#000000`, replace it with `#16140f` or `#0c0b08` (dark mode bg).

**The Categorical-Not-State Rule.** Language chip colors are *only* for language. Never promote them to status indicators ("active", "warning", "new"). Status uses the neutral or accent system, not chip tints.

## 3. Typography

**Display Font:** Pretendard (Korean-first stack, with Pretendard Variable, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, Nanum Gothic as fallbacks).
**Body Font:** Geist (Latin-first stack via `next/font/google`, with system sans fallbacks).

The active stack reorders dynamically per locale: Pretendard leads on `/ko/*`, Geist leads on `/en/*`. Both stacks are present in both locales so the secondary script still has its proper typeface available without a separate request. Font features `ss01` and `cv11` are enabled on `body` to lift Geist's defaults; optical sizing is auto.

**Character:** Pretendard's neutrality matches Geist's neutrality — neither typeface has the personality of an editorial display face, but together at the sizes and weights below they read like a trade journal. Korean glyphs sit comfortably alongside Latin without either feeling translated.

### Hierarchy
- **Display** (semibold/600, `clamp(2.5rem, 6vw, 4.75rem)`, leading 1.02, tracking `-0.02em`, `text-wrap: balance`): hero h1 only. Two-line max, with the second line in `text-ink-mute` to suggest a subtitle without breaking the hierarchy.
- **Headline** (semibold/600, `clamp(1.75rem, 3.5vw, 2.5rem)`, leading 1.1, tracking `-0.015em`): the job-detail page title. Always balanced.
- **Title** (semibold/600, `1.5rem` / `28px`, leading 1.25, tracking `-0.01em`): section h2s — "Recent jobs", the jobs list page heading.
- **Body** (regular/400, `17px`, leading 1.45, locale-aware tracking): hero subtitle and body prose. Capped at ~65–75ch by the layout's `max-w-xl` / `max-w-md` containers.
- **Card Title** (semibold/600, `15px`, leading 1.3, tracking `-0.01em`, `line-clamp-2`): job card titles. Lives in a different family than display titles only by virtue of locale stack ordering.
- **Caption** (regular/400, `12.5–13px`): job card metadata, sidebar facet counts, footer text. Always in `text-ink-mute` or `text-ink-soft`, never on the primary ink.
- **Label** (medium/500, `11px`, uppercase, tracking `0.16–0.22em`): eyebrows over hero sections, source labels on cards, meta-row dt elements on the detail page. The only place the system uses uppercase.

### Named Rules

**The Locale-Aware Tracking Rule.** Korean and Latin require different letter-spacing to read level. `:lang(ko)` gets `-0.005em` and `word-break: keep-all` (Korean compositions never break mid-syllable-cluster). `:lang(en)` gets `-0.011em`. Set both at the `:lang()` level; never on individual elements.

**The Balanced-Headings Rule.** Every `h1`, `h2`, `h3` has `text-wrap: balance`. Every `<article p>` and `.prose p` has `text-wrap: pretty`. No ragged display copy, no orphan body lines.

**The Eyebrow-Only Uppercase Rule.** Uppercase + tight tracking is reserved for labels, eyebrows, and the source provenance line on cards. Never run body copy uppercase. Never use uppercase for emphasis inside prose.

## 4. Elevation

Koreer is **flat by default**. Surfaces sit on the cream page at zero elevation; depth is signaled almost entirely through hairline borders (8% and 16% warm-black) and the warm-cream → page-white surface tilt. Shadows exist but only as *responses* — to focus, to hover, to a popover lifting off the page.

When shadows do appear they are long, low-opacity, and tinted toward true black with negative spread — the silhouette of a print object lifting an inch above paper, never the soft ambient glow of glassmorphism.

### Shadow Vocabulary
- **Resting Hairline** (`box-shadow: 0 1px 0 0 rgba(0,0,0,0.04)`): the search bar at rest. A nearly invisible 1px optical shelf so the rounded form reads as a button-like input. The only resting shadow in the entire system.
- **Focus Lift** (`box-shadow: 0 6px 24px -12px rgba(0,0,0,0.25)`): the search bar on `:focus-within`. Rises about 4px, with the brass focus ring on top.
- **Card Hover** (`box-shadow: 0 8px 28px -18px rgba(0,0,0,0.22)`): job cards on hover. Combined with a border step from `border` to `border-strong`. Animates over 180ms with `--ease-out`.
- **Combobox Pop** (`box-shadow: 0 24px 60px -24px rgba(0,0,0,0.35)`): the search suggestions popover. The only "real" elevation in the system — used because the popover *must* read as floating off the page surface.

### Named Rules

**The Flat-By-Default Rule.** Surfaces have no shadow at rest. Borders carry structure. Shadows are response, not decoration. If a card has a resting shadow, it is wrong.

**The Long-Low-Tinted Rule.** Every shadow uses a long Y-offset, large blur, and *negative spread*, not the soft ambient `0 4px 12px rgba(0,0,0,0.1)` SaaS reflex. The negative spread tightens the contact patch so the lift reads as crisp paper, not a glass haze.

**The Border-Steps-Before-Shadow Rule.** Hover responds first by stepping the border from `border` (`#16151214`) to `border-strong` (`#16151229`). Shadow comes second, and only on cards that take a `Link` overlay. Filter rows, chips, and pagination links get border-step only.

## 5. Components

Each component leads with a one-line character, then specifies geometry, color, and state. All transitions ease-out over 180ms by default.

### Buttons
- **Primary (`button-primary`).** Pill, evergreen, confident. `border-radius: 9999px`, `bg-accent` / `text-accent-ink`, `padding: 0 20px`, `height: 44px` (hero search) or `36–40px` (compact). Hover: `opacity: 0.9` only — no color shift, no lift. Used on: search submit, apply CTA, "next page".
- **Pill (`button-pill`).** Pill, hairline, neutral. `bg-surface` over a `border-border` hairline; text is `ink-soft`. Hover steps the border to `border-strong` and the text to `ink`. Used on: "Browse all jobs" home CTA, "Back to first" pagination, "Clear filters" empty-state action, locale switcher inactive states.
- **Ghost text link.** Inline, no chrome. `text-ink-mute` resting, `text-ink` on hover, with a subtle underline only on the "Clear all filters" link.

There is no "secondary button" in the SaaS sense (outline + text + colored hover). Use the pill instead.

### Chips
- **Language chip (`chip-ko` / `chip-en` / `chip-bi`).** Tiny, tinted, pill. `padding: 2px 8px`, `font-size: 11px`, `font-weight: 500`, `tracking-wide`. Bg + ink come from the categorical Aged Paper / Sea Mist / Wisteria pairs. They never carry borders. They never animate.
- **Active filter chip.** `bg-surface` + `border-border` + `text-ink-soft`, with an inline ✕ icon that brightens to `text-ink` on hover. `font-size: 12px`. Each chip is a `Link` that removes its filter from the URL; the row also has a "Clear all" trailing link when 2+ chips are present.
- **Source label (on cards).** Not technically a chip — it's an eyebrow label in `11px uppercase tracking-[0.14em]` text-ink-mute, sitting bottom-left of the card next to the hover-revealed arrow.

### Cards / Containers
- **Job card.** `border-radius: 12px` (the `xl` step). `bg-surface`, `border-border` (hairline), `padding: 20px`. The whole card is a `<Link>` overlay (absolute-positioned, `inset-0`, focusable as the whole tile); inner content sits on `z-10`. Hover steps border → `border-strong` and adds the Card Hover shadow. There is **no resting shadow** and **no resting transform**.
- **Empty state.** `border-radius: 16px`, `border-dashed border-border-strong`, `bg-surface/60` (60% surface over the cream page), `padding: 14px 6px`. Lives below the page header, never inside a card.
- **Filter sidebar section.** Not a card. A `border-b border-border` underline marks each facet group, with a 13px uppercase title acting as a button toggle.

Nesting cards is forbidden. The job card itself never contains a sub-card. A list of cards lives directly on the page.

### Inputs / Fields
- **Search bar (hero variant, `input-search`).** Pill, `height: 56px`, `border-border-strong` (the hairline-strong), `bg-surface`, with a 1px resting shadow (the only resting shadow in the system) and a deeper Focus Lift on `focus-within`. The submit button is an inset `button-primary` with `height: 44px` and a tight 6px right inset. Magnifier icon at left in `text-ink-mute`.
- **Search bar (compact variant).** Same chrome, `height: 44px`, used on the jobs page header.
- **Combobox popover.** `border-radius: 16px`, `bg-surface`, `border-border` (hairline), Combobox Pop shadow, `padding: 6px`. Each `role="option"` is `rounded-lg`, `padding: 8px 12px`, body 14px. Active option uses `bg-surface-muted` + `text-ink`.
- **Filter row (radio + checkbox).** `rounded-md` (6px), `padding: 6px 8px`, body 14px. Inactive is `text-ink-soft` over transparent; on hover it's `bg-surface-muted/60` + `text-ink`; active is `bg-surface-muted` + `text-ink`. Native `<input type="radio|checkbox">` is kept, sized `14px`, with `accent-color: var(--color-accent)` so the system control adopts the brand evergreen.
- **Sort `<select>`.** Pill (`rounded-full`), `height: 36px`, `border-border` resting → `border-strong` on hover. The system's only `<select>`; the rest of the filter chrome is custom but the sort select is intentionally native for keyboard parity.

### Navigation
- **Sticky header.** `border-b border-border` + `bg-bg/85 backdrop-blur`. The 8% backdrop-blur on a translucent cream is the *only* place glassmorphism is permitted, and it's used to read continuous content underneath, not as decoration.
- **Logo.** A 2px evergreen dot + 17px wordmark in `font-semibold tracking-tight`. The dot is the system's smallest accent appearance.
- **Nav items.** Inline link, `height: 36px`, `padding: 0 12px`. Inactive: `text-ink-mute` over transparent; hover: `text-ink` + `bg-surface-muted`. **Active uses an underline, not a fill** — a 1px `bg-ink` line `inset-x-3 -bottom-px` runs under the active label.
- **Locale switcher.** A pill segmented control: a 1-px hairline pill containing two 5-px-rounded inner buttons. Active button uses `bg-accent` + `text-accent-ink` (the accent's only navigational use). Inactive button is `text-ink-mute` with a `bg-surface-muted` hover.

### Hero Backdrop
A signature pattern unique to Koreer's home page: a very soft warm wash at the top-right (`radial-gradient(900px 340px at 92% -8%, color-mix(in oklab, var(--color-chip-ko-bg) 65%, transparent), transparent 65%)`) + a hairline fade at the bottom into `surface-muted`. Built entirely in CSS via `color-mix(in oklab, ...)` so it stays correct in dark mode without a separate stylesheet. **No SVG, no illustration, no gradient blob.**

### Provenance Strip
Every card and detail header surfaces source + recency in the same way: `LANGUAGE_CHIP · LOCATION · SALARY · POSTED_RELATIVE`, separated by `·` glyphs at 50% opacity. The `≤7-day` badge on the detail page is the only place the accent appears as a status pill.

## 6. Do's and Don'ts

### Do:
- **Do** keep the One Voice Rule: ≤10% of any screen in evergreen, with one primary action per view.
- **Do** lead with hairline borders (`#16151214`) for structure, and step to `#16151229` for hover/focus. Shadow comes second.
- **Do** use 12px (`xl`) rounded rectangles for cards and 9999px pills for actions. Nothing in between.
- **Do** keep eyebrow labels at 11px, uppercase, `0.16–0.22em` tracking, in `text-ink-mute`. They are the system's voice for hierarchy.
- **Do** surface source provenance and posted-relative date on every card and detail header. Freshness is the product's spine.
- **Do** balance Korean and Latin: keep `word-break: keep-all` and the locale-aware tracking pair, and order font stacks per locale.
- **Do** honour `prefers-reduced-motion` on every new transition. The global guard is already wired; opt every new animation into the same path.
- **Do** use `color-mix(in oklab, ...)` for tints (the hero backdrop pattern). It carries through to dark mode without a separate value.
- **Do** keep the focus ring at 2px Brass Underline (`#a38b2d`) with 2px offset and 3px corner radius, on every interactive element. Same value, every element.
- **Do** use `text-wrap: balance` on every heading and `text-wrap: pretty` on every paragraph.

### Don't:
- **Don't** use `#000` or `#fff`. Tint every neutral toward the warm hue family. If a value rounds to either, replace it with `#16140f` or `#faf9f5` / `#0c0b08` / `#141310`.
- **Don't** ship the **generic SaaS dashboard**: no navy-and-cyan, no hero-metric template (big number / small label / supporting stats / gradient accent), no rounded "platform feature" cards in a 3-column grid. PRODUCT.md calls this out by name.
- **Don't** ship **LinkedIn-corporate** chrome: no corporate blue, no profile-driven shell, no "open to work" engagement bait.
- **Don't** ship **Indeed-style ad clutter**: no sponsored banners, no listing density that buries the signal, no aggressive yellow/black branding.
- **Don't** ship **잡코리아 / 사람인 / 인크루트 portal patterns**: no banner-ad walls, no portal-shaped homepages, no decorated-card grids, no rotating promotion strips.
- **Don't** ship **consumer-app candy**: no oversized illustrations, no gradient blobs, no Memphis shapes, no springy bounce or elastic easing.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on cards, list items, callouts, or alerts. Replace with full hairline borders, background tints, or a leading icon.
- **Don't** use `background-clip: text` with gradients. Emphasis is weight, scale, or color step — never gradient-text.
- **Don't** stack glassmorphism — the header's 8% `backdrop-blur` over translucent cream is the only permitted use. Never on cards, never on modals.
- **Don't** introduce modals as a first thought. Exhaust inline / progressive disclosure first; the only modal-like element today is the search combobox popover, and that's intentional.
- **Don't** nest cards. Two `border-radius: 12px` surfaces inside each other is always wrong.
- **Don't** wrap every block in a `max-w-7xl` container. The `max-w-6xl` page rail is enough; full-bleed sections (hero backdrop) and narrow rails (`max-w-2xl` for the search and stats strip) are deliberate.
- **Don't** animate CSS layout properties (`width`, `height`, `padding`, `top`/`left`). Use `transform` and `opacity`. Hover transforms on cards should be ≤2px.
- **Don't** use bouncy, elastic, or spring easings. The system uses `cubic-bezier(0.22, 0.61, 0.36, 1)` (ease-out) at 120ms (fast) or 180ms (medium). No back-out, no bounce.
- **Don't** strip the source label or post-date from a card to make it prettier. Provenance is part of the product.
- **Don't** invent new accent colors for status. Status is `accent`, `surface-muted`, or a categorical chip (only when the status *is* a category).
- **Don't** use em dashes (`—` or `--`). Use commas, colons, semicolons, periods, parentheses. *(The `·` middle dot used as a meta separator is fine; it is not punctuation.)*
- **Don't** decrease body text below 13px on primary content. The user base spans early-20s F-1 grads to 50+ 1.0-gen immigrants; readability is a product requirement.
