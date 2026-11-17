# Interaction and responsive observations

- The homepage is a normal scroll layout with a sticky `.topbar` (`top:0`, `z-index:10`, rgba white background, blur 6px, bottom border 2px). There is no scroll-driven tab system or external smooth-scroll library.
- Global `html{scroll-behavior:smooth}`. The hero mascot bobs over 4 seconds; vertical translation reaches -8px halfway through.
- CTA scrolls to top and focuses code input. Codes uppercase and require six characters. Enter triggers the same action as “Bắt đầu”. Invalid codes show a populated error page.
- Button hover uses `filter:brightness(1.06)` with .12s transition. Press translates down 4px and removes raised shadow over .08s.
- Onboarding uses four click-driven steps and selected chips; forward navigation validates required fields. A fixed footer contains the next/back buttons. Assessment and marketing confirmation retain separate wording and controls from source.
- Tests use a 500ms timer refresh, separate U/L/R/S/W deadlines of 3/7/6/7/7 minutes, progress bars, intro screens, 1–4 option shortcuts and Enter submit. Listening allows two actual playback starts per item. Microphone is requested only after a recording button click. Writing draft persists in session storage.
- Report QR encodes the clone origin. Copy uses clipboard; print uses browser print/PDF. School report tabs switch tables by click, with no scroll dependency.
- Staff uses route-based navigation, form/chip controls, validation, campaign status, report link generation, search, CSV and local admin actions. Demo edits persist in localStorage and remain independent of the original service.
- Desktop checked at 1440px, tablet at 768px, mobile at 390px. At <=1023px home/feature layouts stack; sidebar becomes bottom nav. At <=640px headers reduce, top “Trang chủ” link hides, tables become cards, step labels become bars, footer buttons stack, report hero becomes one column.
- Original header 40×44px mascot / 26px logotype, mobile 34×38px / 22px. Body 17px/1.5 weight 600, mobile 16px. Desktop home title 44px/1.12; mobile computed 30px/33.6px due to original cascade. Main max-width 1120px with 20px horizontal padding, mobile 14px.
- Reduced-motion CSS removes animation and smooth scrolling when requested by the OS/browser.

Evidence: `home-computed-desktop.json`, `docs/design-references/original-home-{1440,768,390}.jpg`, supplied video frames, and the exact retained `src/styles.css`.
