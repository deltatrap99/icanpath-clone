# site-layout

Target source: `src/app.js` functions `brandLink,router,mount,footBar`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Sticky header, original logo, footer and three display modes. Focus mode hides header/footer. Console uses 254px sidebar, replaced with bottom navigation at 1023px. Nunito 500–900; body 17px/1.5 weight600; mobile16px. Main max-width1120px;padding24px20px72px, mobile16px14px64px. Header z10, rgba white .96, blur6px, 2px border. Buttons48px minimum, radius16px, raised4px shadow, hoverbrightness1.06.

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
