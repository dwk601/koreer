# Product

## Register

product

## Users

Korean-speaking job seekers in the United States, across three overlapping groups:

- **Primary: F-1 graduates moving to OPT.** International students from Korea finishing US degrees, English-functional but Korean-comfortable, hunting their first US role on a visa timeline. Time-pressured, comparing many openings, often searching late at night between coursework and applications.
- **Secondary: 1.5- and 2nd-generation Korean Americans** looking for roles where Korean language is a plus or where the employer is community-tied. English-primary, but want listings the mainstream boards under-index.
- **Secondary: 1.0-generation immigrants** searching local Korean-community roles (clinics, retail, hospitality, professional services). Korean-primary, often older, less tolerant of cluttered or trend-chasing UI.

The job to be done: *"Find a real, recent job I can actually apply to today, in either Korean or English, without making an account."* Users are not browsing for entertainment; they are evaluating leads.

## Product Purpose

Koreer aggregates US job listings from sources Korean speakers actually use — LinkedIn, Indeed, GTKSA, JobKoreaUSA, WorkingUS, Korea Daily, Radio Korea, Wow Seattle — and surfaces only postings from the last 60 days. The site is read-only, no auth, no profile, no email capture. The win condition is a user finding a relevant lead and clicking out to apply, fast.

Success looks like: a user lands, narrows by language / state / category, scans cards with provenance and recency intact, opens a detail page, clicks the external apply link, and leaves. The site is a sharp tool, not a destination to live in.

## Brand Personality

Editorial, quiet, careful. Three words: **editorial / quiet / careful**.

The voice is practical and trust-building, never promotional. No exclamation points, no "the #1 platform", no marketing superlatives. Microcopy reads like a well-edited newsletter: short, accurate, locale-native in both Korean and English. Typography and whitespace do the work that gradients and illustrations do on lesser sites.

Emotional goal: the user feels they have arrived at something *curated* by someone who respects their time, not at another aggregator desperate for engagement.

## Anti-references

This product should not look or feel like:

- **Generic SaaS dashboards.** No navy-and-cyan, no hero-metric templates (big number / small label / supporting stats / gradient accent), no rounded "platform feature" cards in a 3-column grid.
- **LinkedIn-corporate.** No corporate blue, no profile-driven chrome, no "open to work" social-network noise, no engagement bait.
- **Indeed-style ad clutter.** No sponsored banners, no listing density that buries the signal, no aggressive yellow/black branding.
- **Korean job portals (잡코리아 / 사람인 / 인크루트 style).** No banner-ad walls, no portal-shaped homepages, no decorated-card grids, no rotating promotion strips.
- **Consumer-app candy.** No oversized illustrations, no gradient blobs, no Memphis-shapes, no springy bounce animations.

When in doubt, lean toward editorial print and away from "modern web app".

## Design Principles

1. **Speed over delight.** Users are on visa timelines and job-hunt fatigue. Every interaction should feel one click closer to a real lead, not a tour. No splash, no onboarding, no upsell. If a flourish does not help someone find a job faster, it does not belong.

2. **Editorial restraint, not SaaS reflex.** Quiet typography and one confident accent (deep evergreen on warm cream) carry the surface. The existing visual system — tinted neutrals, hairline borders, low-chroma categorical chips, balanced text wrapping — is the spine. Don't decorate; refine.

3. **Trustworthy aggregation.** Source provenance is part of the product, not chrome. Every card and detail page makes the source (LinkedIn, GTKSA, WorkingUS, etc.) and the post date visible at a glance, so users can evaluate freshness and credibility before they click out. Never strip the source to make a card prettier.

4. **Bilingual without compromise.** Korean and English are both first-class. Typography stacks, line-height, letter-spacing, and microcopy tone must each read native in their locale, not "English design with Korean translated in". Pretendard-first for Korean, Geist for Latin, with locale-aware tracking and `word-break: keep-all`.

5. **Freshness as a promise.** "Posted in the last 60 days" is the product's spine and the reason to choose Koreer over a general board. Surface recency on every card, every list header, every empty state. Never let a user wonder whether a listing is stale.

## Accessibility & Inclusion

Target: **WCAG 2.1 AA** for all surfaces.

Known user needs:

- Wide age range (F-1 grads in their 20s through 1.0-gen immigrants in their 50s+). Body text must remain comfortably readable; do not push below the current ~13–15px floor for primary content.
- Mixed Korean + Latin readers. Maintain locale-aware typography (`:lang(ko)` keep-all word-break, lighter tracking; `:lang(en)` slightly tighter tracking) so neither script feels like a second-class citizen.
- Reduced-motion respected globally — already wired via `prefers-reduced-motion`. Any new animation must opt into the same guard.
- Visible focus ring on every interactive element, never removed without a same-pixel replacement. Color must never be the only signal: language chips and source labels carry text, not color alone.
- Tap targets ≥ 40px on touch surfaces (cards, filter rows, pagination).

Inclusion: copy must avoid culturally-loaded English idioms in Korean translations and vice versa. When a feature is region-specific (US salary bands, US states), explain it in Korean copy without assuming familiarity.
