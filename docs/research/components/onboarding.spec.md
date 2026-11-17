# onboarding

Target source: `src/app.js` functions `joinPage,chips,consentBlock`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Four exact source steps, profile fields, grade3–11 chips, self-assessment and optional marketing control. Click-driven; forward/back preserves in-memory form. Headers lesson-top and .steps; fixed lesson-foot. Chips min46px,radius14px,border2px,shadow3px; selectedblue-l/blue-b. Small screens show progress bars instead of step text. Errors use original toast. School/date values resolve from independent demo campaign API.

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
