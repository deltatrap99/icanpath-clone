# Validation result

Validated 17 November 2026 against live source and supplied mobile video.

## Delivered scope

- Original site layout and branding retained with 10 documented UI modules covering home, onboarding, assessment, student report, lessons, school report, staff, admin and legal routes.
- 13 component/service specifications; 3 independent browser-local service modules and recorded audio manifest.
- 3 original WebP mascot illustrations, 3 original Nunito font subsets, original QR library; 55 locally generated AAC clips (27 listening scripts, 28 lesson examples/practice), 2.29 MB total audio.
- 84 authored multiple-choice questions, 3 age bands, 5 timed sections and 4 complete sample learning units.
- Staff/admin local CRUD, dynamic aggregate reports, 34 original province entries, local report links, QR and CSV export.

## Verification

`npm run check` PASS:

- All JS syntax, static asset/font references, audio manifest/file coverage.
- Combined core+assessment+staff fixture reports populate dashboard averages and school reports; bank count 84; CSV excludes names.
- Assessment integration: grades 4/7/10; 60 answer submissions; persistence; timers/expiry; speaking metadata; writing; finish/result; lessons; invalid/closed codes; skipped evidence stays empty.
- Staff integration: invalid login and role boundaries; school/campaign validation and CRUD; status changes; dynamic counts/averages; report token rotation; user lock/reset; student search; guarded local cascading deletion and audit.

`npm run build` PASS. Static deployment output is `dist/`; no package dependencies.

Browser QA with CUA:

- Home compared at 1440×900, 768×1024, 390×844. Full-page heights match source at all widths (2577,3159,3523px). Typography, original images, cards, path, CTA and responsive layout visually match; exact original stylesheet is retained. Mascot animation phase varies between screenshots.
- Completed actual UI onboarding and all five stages through report creation at 390px. Completed 6 grammar,8 listening,6 reading submissions and a 65-word writing task; speaking can be skipped and report correctly shows insufficient speaking evidence.
- Report shows bars/radar, QR, self-comparison, feedback, product cards and lesson links. Lesson link and recorded audio playback work; media element reached its 2.368-second duration with ended=true and error=null.
- Staff demo login at 390px uses bottom navigation; desktop at 1440px uses sidebar. Created a school and campaign through actual forms; generated six-character code and QR appeared immediately. School report tabs switched the table correctly.
- Console error/warning inspection returned no application errors during the assessed flow.

## Practical limits

The original backend and grading services are not exposed by the website. This clone uses independent demo data in the current browser, not the original service/database. New personal result links and locally created campaigns require that browser's stored data; seeded sample links are available on every fresh browser. Speaking/writing/pronunciation feedback is explicitly illustrative. Microphone UI and submitted recording metadata are implemented; physical microphone recording and OS print/PDF dialog were not exercised by the agent. Ward suggestions are sample sets for three cities; free text works for all provinces. Original staff-account credentials and original student records are absent from deployed source.

Screenshots and video frames remain local under `docs/design-references/` (excluded from Git/source publication). Build/deployment packages include only application files and declared hosting metadata.
