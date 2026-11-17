# admin-console

Target source: `src/app.js` functions `adminPage,adminOverview,adminUsers,adminStudents,adminAudit`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Original four secondary admin tabs: system,accounts,students,audit. Original KPI/style/card/table vocabulary preserved. Demo supports local user creation/role/lock/password reset, student search, guarded deletion, audit and shared-login toggle. Route limited to local admin role. All content rendered with textContent helper, forms have populated success/error states.

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
