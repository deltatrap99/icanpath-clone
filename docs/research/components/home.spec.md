# home

Target source: `src/app.js` functions `home,stagePath`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Exact original Vietnamese copy and four mascot image placements. Desktop hero columns1fr/1.1fr,gap40px,title44px/1.12; mascot380px maximum. Join panel border2px,radius20px,padding18px,shadow4px. At1023px hero stacks; mobile computed title30px/33.6px. Stage nodes76x70px and mobile64x60px, winding offsets0,56,84,56,0 scaled.45 on mobile. Audience cards use grid min230px. Feature illustrations260px. CTA green24pxradius. Interactions: code validation/Enter, route navigation, CTA focuses input, mascot4s bob(-8px).

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
