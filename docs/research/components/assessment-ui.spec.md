# assessment-ui

Target source: `src/app.js` functions `testPage,lessonTop,renderTest,renderMcq,renderSpeaking,renderWriting,finishing`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Original focus UI retained: 5-section progress, timers, intro mascots, choices, speaker, passage, cue cards, round microphone buttons, text area and footer. Interaction model click/keyboard/time. 1–4 selects,Enter answers; 2 listening plays counted only on actual audio start. Timers3/7/6/7/7minutes. Speech requested only by record click. Writing counts words and saves draft. Three original grade-band styles retained. Source body .lesson-body and fixed footer; mobile footer reverses stack and leaves bottom padding200px. Local demo grading disclosure replaces original real-service claim.

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
