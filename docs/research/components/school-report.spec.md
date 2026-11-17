# school-report

Target source: `src/app.js` functions `schoolPage,statTable,cefrDist`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Original school report hero, four KPIs, CEFR distribution and skill bars, grade/class/campaign table tabs, weak competencies and print control. Click-driven tabs and standard responsive grid. School data independent browser-local aggregation. Mobile tables switch to cards with original source CSS; no student names in aggregates.

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
