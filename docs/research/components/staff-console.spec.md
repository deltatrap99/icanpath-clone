# staff-console

Target source: `src/app.js` functions `staffLogin,staffPage,staffSchools,staffCampaigns,staffCampaign,staffDashboard`; exact styles in unchanged `src/styles.css`.

## Layout and appearance

Original login form max440px, mascot120px. Original console navigation: dashboard,schools,campaigns; original forms/chips/tables and QR/code detail. Desktop sidebar254px; mobile below1024px bottomnav fixedz30,56pxitems. Dashboard g4stat tiles and tables. Supports local create school/campaign, open/close, report links, CSV. Province menu matches34 extracted original entries. Staff credentials differ from source account; private data not copied.

## Source and evidence

The original publicly served frontend is retained verbatim except the small demo integration/disclosures; no speculative component rewrite. See `../PAGE_TOPOLOGY.md`, `../BEHAVIORS.md`, `../home-computed-desktop.json`, and `docs/design-references/` for desktop/tablet/mobile screenshots. Asset paths: `/img/fox-hello.webp`, `/img/fox-study.webp`, `/img/fox-cheer.webp`; `/fonts/nunito-*.woff2`; QR via retained vendor library. All CSS colors, spacing, transitions and breakpoints come from original stylesheet.

## State/data contract

UI state and copy use original functions. Independent service inputs/outputs follow `assessment-data.spec.md`, `staff-data.spec.md` and `audio-data.spec.md`. Visual QA widths:1440,768,390px; no redesign.
