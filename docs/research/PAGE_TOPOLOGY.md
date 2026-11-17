# ICan Path clone: page map

Source: https://icanpath.duckmind.ai/#/, surveyed 17 November 2026, and the supplied 172-second mobile recording. Public frontend HTML/JS/CSS/fonts/mascots were available directly and retained to preserve exact layout. Original server implementation is not exposed; independent browser-local services supply the demo.

| Route | Experience | Interaction |
| --- | --- | --- |
| `/#/` | Sticky brand/navigation, mascot hero, participation code, five-stage path, audience cards, adaptive-test feature, report feature, green CTA, footer | Code input, Enter, buttons; mascot bob animation; smooth scroll |
| `/#/join/E8YYZD` | Four-step student onboarding: identity, study history, self-assessment, goals and confirmation | Click-selected chips, validation, forward/back, fixed footer |
| `/#/test` | Grammar, listening, reading, speaking, writing | Timers, MCQ/keyboard shortcuts, voice playback, microphone recording, draft save, progression |
| `/#/r/demo-result` | Student report, QR, four-skill bars/radar, strengths, improvement, self-assessment comparison, learning path, feedback and sharing | Copy link, print/PDF, open suggested lessons |
| `/#/learn/…` | Vocabulary, grammar, examples, can-do outcomes, pronunciation practice | Speech playback, recording, local demo feedback |
| `/#/school/demo-school` | Aggregated school report, CEFR distribution, skills, grade/class/campaign tabs | Click-driven table tabs, print/PDF |
| `/#/staff` | Employee login | Form submit, validation |
| `/#/staff/dashboard` | Participation/completion/level KPIs, distribution, grouped statistics | Navigation and CSV export |
| `/#/staff/schools` | School creation, province/ward fields, school table | Form/chips, report links, local admin rename/delete |
| `/#/staff/campaigns` | Campaign creation and list | School/date/grade selection, QR/code detail, open/close campaign |
| `/#/staff/campaigns/CP001` | Campaign details and student participation | Report links, confidence disclosure, local status change |
| `/#/staff/admin/overview` | Demo system overview | Local shared-login setting |
| `/#/staff/admin/users` | Demo user management | Create/update/lock/reset local accounts |
| `/#/staff/admin/students` | Demo student search | Search and delete local records |
| `/#/staff/admin/audit` | Local admin audit | Table |
| `/#/dieu-khoan`, `/#/chinh-sach-du-lieu` | Legal copy from original interface | Navigation |

Site mode displays header/footer; focus mode for join/test hides them and fixes the lesson controls to the bottom. Console mode uses a 254px desktop sidebar; below 1024px it switches to a topbar and fixed bottom navigation. Tables become labelled cards below 641px. All content uses original Nunito variable font files, color tokens and CSS rules.

The original account supplied by the user was used only to survey employee views. Its password and original student records are not included in application source. Demo data consists of independent fixtures.
