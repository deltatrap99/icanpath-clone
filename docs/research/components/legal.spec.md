# legal

Target source: `src/app.js` functions `legalPage,consentBlock`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Original two legal routes and consent block retained as interface content. Standard site header/footer and card with legal typography: h2 18px, p line-height1.6. Navigation-driven; link targets open legal routes. Independent demo processes data only locally as disclosed in README/results.

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
