# student-report

Target source: `src/app.js` functions `resultPage,skillBars,radar,qrNode,feedbackCard`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Original report layout: mascot+name/level/QR; three stat tiles; 4-skill bars and radar; abilities/next steps; strengths/improvements; self-vs-actual table; winding lesson links; feedback; products; sharing. Bars SVG640width,rows52px; radar260square. Large level64px/mobile52px. Mobile report hero stacks and tables become data-label cards. Real QR encodes current origin. Copy writes current report URL; print uses window.print with source print CSS. Values are independent deterministic demo results.

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
