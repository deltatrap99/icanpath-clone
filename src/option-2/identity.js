/* ICANPath, Open Horizons identity. Shared assessment and GE services remain in app.js. */
(() => {
  'use strict';
  const assets = '/option-2/assets/';
  const peri = window.ICanPeri;
  const paths = {
    sun: ['M4 16a8 8 0 0 1 16 0', 'M2 20h20M12 2v3M3 7l2 2M21 7l-2 2M1 14h3M20 14h3'],
    headphones: ['M4 13v-1a8 8 0 0 1 16 0v1', 'M4 12H3v7h4v-7ZM20 12h1v7h-4v-7Z'],
    chat: ['M21 11a9 8 0 0 1-9 8H8l-5 3 1-6a8 8 0 0 1-1-5 9 8 0 0 1 18 0Z'],
    book: ['M12 5v16M12 5C8 2 4 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-2-10 1Z'],
    pen: ['m4 16-1 5 5-1L21 7l-4-4ZM14 6l4 4M4 16l4 4'],
    compass: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'm16 8-3 5-5 3 3-5Z'],
    clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M12 7v5l3 2'],
    school: ['m2 8 10-5 10 5-10 5ZM6 10v6c3 3 9 3 12 0v-6M22 8v8'],
    user: ['M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 6 0 0 1 16 0v3Z'],
    family: ['M12 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2 21v-3c0-4 5-6 8-4M19 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM10 22v-3a6 5 0 0 1 12 0v3'],
    arrow: ['M4 12h16m-6-6 6 6-6 6'],
    external: ['M14 3h7v7M21 3 10 14M21 14v7H3V3h7'],
    chevron: ['m9 5 7 7-7 7'],
    check: ['m5 12 4 4L19 6'],
    chart: ['M3 3v18h19M7 16v-4M12 16V8M17 16V5'],
    calendar: ['M3 6h18v15H3ZM7 3v6M17 3v6M3 11h18M7 15h2M14 15h2'],
    shield: ['m12 2 9 4v6c0 5-5 9-9 10-4-1-9-5-9-10V6Z', 'm8 12 3 3 5-6'],
    signpost: ['M12 2v20M3 5h15l3 3-3 3H3ZM21 14H6l-3 3 3 3h15Z'],
    route: ['M5 20c12-2 16-5 8-8S6 7 18 4', 'M3 20a2 2 0 1 0 4 0 2 2 0 1 0-4 0M16 4a2 2 0 1 0 4 0 2 2 0 1 0-4 0'],
    puzzle: ['M9 3H3v6a3 3 0 1 1 0 6v6h6a3 3 0 1 0 6 0h6v-6a3 3 0 1 1 0-6V3h-6a3 3 0 1 1-6 0Z'],
  };
  function icon(name, size = 24) {
    const ns = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(ns, 'svg');
    for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.65, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false', class: 'identity-icon' })) el.setAttribute(k, v);
    for (const d of paths[name] || paths.compass) {
      const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); el.append(path);
    }
    return el;
  }
  const skillIcons = { U: 'puzzle', L: 'headphones', S: 'chat', R: 'book', W: 'pen' };
  function brand(h) {
    return h('a', { class: 'brand', href: '#/', 'aria-label': 'ICANPath, trang chủ' }, h('img', { src: assets + 'icanpath-logo.svg', alt: 'ICANPath', width: 200, height: 54 }));
  }
  function decorate(el) {
    if (/^H[123]$/.test(el.tagName) && el.firstChild?.nodeType === Node.TEXT_NODE) {
      el.firstChild.textContent = el.firstChild.textContent.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '');
    }
    // Decorative skill labels use the same outline icons as the reference board.
    const labels = [['🎧', 'headphones'], ['🎤', 'chat'], ['📖', 'book'], ['✍️', 'pen']];
    if (el.childNodes.length === 1 && el.firstChild.nodeType === Node.TEXT_NODE && ['BUTTON', 'B', 'SPAN'].includes(el.tagName)) {
      const text = el.textContent;
      for (const [prefix, name] of labels) if (text.startsWith(prefix + ' ') && text.length < 30) {
        el.firstChild.textContent = text.slice(prefix.length).trimStart(); el.prepend(icon(name, 22)); break;
      }
    }
    return el;
  }
  function renderHome({ h, mount, toast, hasSession, lastResult }) {
    const arrow = () => icon('arrow', 20);
    const code = h('input', { id: 'identity-join-code', type: 'text', placeholder: 'Nhập mã gồm 6 ký tự', maxlength: 6, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-describedby': 'identity-code-help', oninput: () => code.removeAttribute('aria-invalid') });
    const start = (event) => {
      event.preventDefault();
      const value = code.value.trim().toUpperCase();
      if (!/^[A-Z0-9]{6}$/.test(value)) { code.setAttribute('aria-invalid', 'true'); code.focus(); return toast('Em hãy nhập mã tham gia gồm 6 chữ cái hoặc chữ số do thầy cô cung cấp.'); }
      location.hash = '#/join/' + value;
    };
    const focusCode = () => { code.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); code.focus({ preventScroll: true }); };
    const stageData = [
      ['U', 'Khởi động', '3 phút', 'Em tìm mức khởi đầu qua câu hỏi từ vựng và ngữ pháp.'],
      ['L', 'Nghe', '7 phút', 'Em lắng nghe hội thoại và chọn đáp án theo nội dung vừa nghe.'],
      ['R', 'Đọc', '6 phút', 'Em đọc những đoạn văn ngắn rồi trả lời các câu hỏi về nội dung.'],
      ['S', 'Nói', '7 phút', 'Em ghi âm câu trả lời để thể hiện cách phát âm và diễn đạt của mình.'],
      ['W', 'Viết', '7 phút', 'Em viết một đoạn tiếng Anh ngắn để chia sẻ ý tưởng theo chủ đề.'],
    ];
    const sampleBars = [['L', 'Nghe', 68], ['S', 'Nói', 49], ['R', 'Đọc', 73], ['W', 'Viết', 61]];
    mount(h('div', { class: 'identity-home', id: 'main-content' },
      h('section', { class: 'identity-hero', 'aria-labelledby': 'identity-title' },
        h('div', { class: 'identity-hero-copy' },
          h('div', { class: 'identity-eyebrow' }, icon('sun', 25), 'Đánh giá và định hướng'),
          h('h1', { id: 'identity-title' }, 'Hiểu hôm nay,', h('br'), h('span', {}, 'mở ngày mai.')),
          h('p', { class: 'identity-lead' }, 'Hiểu năng lực tiếng Anh, nhận ra thế mạnh và cùng Peri chọn bước học tiếp theo.'),
          h('form', { class: 'identity-join', onsubmit: start },
            h('label', { for: 'identity-join-code' }, 'Bắt đầu hành trình của em'),
            h('p', { id: 'identity-code-help' }, 'Em hãy nhập mã tham gia do thầy cô cung cấp để bắt đầu.'),
            h('div', { class: 'identity-code-field' }, icon('user', 22), code),
            h('button', { type: 'submit', class: 'btn-lg btn-block' }, 'Bắt đầu khám phá', arrow()),
            h('button', { type: 'button', class: 'identity-demo-link', onclick: () => { code.value = 'E8YYZD'; code.removeAttribute('aria-invalid'); code.focus(); toast('Mã tham gia E8YYZD đã được điền, em có thể bắt đầu.'); } }, 'Điền mã tham gia E8YYZD')),
          hasSession ? h('a', { class: 'identity-resume', href: '#/test' }, 'Tiếp tục bài đang làm', arrow()) : null,
          lastResult ? h('a', { class: 'identity-resume', href: '#/r/' + lastResult }, 'Xem kết quả gần nhất', arrow()) : null),
        h('figure', { class: 'identity-hero-art' },
          h('div', { class: 'identity-path-scene' },
            h('img', { src: assets + 'learning-journey-hero.webp', alt: 'Peri bước trên con đường đi lên, hướng về phía trước qua sách và bút, luyện nghe và giao tiếp, cây lớn dần và điểm đến học tập dưới bình minh san hô.', width: 1254, height: 1254, fetchpriority: 'high', decoding: 'async' }),
            h('span', { class: 'identity-path-label' }, icon('route', 20), 'Hành trình của em')),
          h('figcaption', {}, h('strong', {}, 'Mỗi bước nhỏ, thêm một điều lớn.'), h('ol', { class: 'identity-path-phases', 'aria-label': 'Ba giai đoạn định hướng của hành trình học' }, [
            ['Hiểu mình', 'Nhận ra thế mạnh'], ['Rèn kỹ năng', 'Tự tin mỗi ngày'], ['Mở tương lai', 'Chọn hướng phù hợp'],
          ].map(([phase, description], index) => h('li', {}, h('span', { 'aria-hidden': 'true' }, '0' + (index + 1)), h('div', { class: 'identity-phase-copy' }, h('b', {}, phase), h('small', {}, description)))))))),
      h('div', { class: 'identity-facts', 'aria-label': 'Thông tin bài đánh giá' },
        h('div', {}, icon('clock'), h('span', {}, 'Khoảng ', h('b', {}, '30 phút'))),
        h('div', {}, icon('book'), h('span', {}, h('b', {}, '4 kỹ năng'), ' tiếng Anh')),
        h('div', {}, icon('school'), h('span', {}, 'Dành cho ', h('b', {}, 'lớp 3 đến lớp 11')))),
      h('section', { class: 'identity-section', 'aria-labelledby': 'identity-skills-title' },
        h('div', { class: 'identity-section-heading' }, h('span', { class: 'identity-kicker' }, 'KHÁM PHÁ NĂNG LỰC'),
          h('h2', { id: 'identity-skills-title' }, 'Khám phá qua 5 chặng'),
          h('p', {}, 'Độ khó được điều chỉnh theo câu trả lời, để em thể hiện khả năng một cách vừa sức.')),
        h('div', { class: 'identity-stages' }, stageData.map(([key, title, time, desc]) => h('article', { class: 'identity-stage' + (key === 'U' ? ' identity-warmup' : '') },
          h('div', { class: 'identity-stage-top' }, h('span', { class: 'peri-stage-art' }, peri.figure(h, { U: 'jump', L: 'wave', R: 'think', S: 'wink', W: 'fly' }[key], { decorative: true }), h('span', { class: 'peri-stage-skill' }, icon(skillIcons[key], 21))), h('span', { class: 'identity-stage-time' }, time)),
          h('h3', {}, title), h('p', {}, desc)))),
        h('p', { class: 'identity-gentle-note' }, icon('check', 18), 'Em cứ trả lời theo khả năng của mình, vì câu trả lời chưa đúng sẽ không bị trừ điểm.')),
      h('section', { class: 'identity-report-section', 'aria-labelledby': 'identity-report-title' },
        h('div', { class: 'identity-report-copy' }, h('span', { class: 'identity-kicker' }, 'TỪ THẤU HIỂU ĐẾN HÀNH ĐỘNG'),
          h('h2', { id: 'identity-report-title' }, 'Biết mình ở đâu,', h('br'), 'để chọn bước tiếp theo.'),
          h('p', {}, 'Em nhận được kết quả bốn kỹ năng và gợi ý luyện tập để biết mình nên bắt đầu từ đâu.'),
          h('ul', { class: 'identity-benefits' }, ['Em hiểu mức tham chiếu CEFR của mình.', 'Em nhận ra điểm mạnh và kỹ năng cần luyện.', 'Em chọn bài luyện phù hợp với kết quả.'].map(text => h('li', {}, icon('check', 18), text))),
          h('a', { class: 'identity-text-link', href: '#/r/demo-result' }, 'Khám phá báo cáo', arrow())),
        h('div', { class: 'identity-report-visual' },
          h('div', { class: 'identity-sample-card' },
            h('div', { class: 'identity-sample-top' }, h('img', { src: assets + 'icanpath-logo.svg', alt: 'ICANPath', width: 130, height: 35, loading: 'lazy' }), h('span', {}, 'Báo cáo năng lực')),
            h('h3', {}, 'Hiểu hơn về năng lực của em'),
            h('div', { class: 'identity-sample-level' }, h('b', {}, 'A2'), h('div', {}, h('strong', {}, 'Mức tham chiếu'), h('span', {}, 'Theo khung năng lực CEFR'))),
            h('div', { class: 'identity-sample-bars' }, sampleBars.map(([key, label, value]) => h('div', { class: 'identity-sample-bar' }, icon(skillIcons[key], 21), h('span', {}, label), h('div', { class: 'identity-track', 'aria-hidden': 'true' }, h('i', { style: `width:${value}%;${key === 'S' ? 'background:var(--identity-coral)' : ''}` }))))),
            h('div', { class: 'identity-next-step' }, icon('signpost', 33), h('div', {}, h('b', {}, 'Bước tiếp theo của em'), h('p', {}, 'Em có thể luyện nói thêm qua các chủ đề quen thuộc.')), icon('chevron', 19))),
          h('div', { class: 'identity-sample-caption' }, icon('compass', 19), 'Mỗi kết quả mở ra một hướng đi phù hợp.'))),
      window.ICanPeople.render(h, { icon, focusCode }),
      h('section', { class: 'identity-cta' },
        h('div', {}, h('span', { class: 'identity-kicker' }, 'CHÂN TRỜI MỚI BẮT ĐẦU TỪ EM'), h('h2', {}, 'Cùng Peri mở thêm những khả năng'), h('p', {}, 'Nhập mã từ thầy cô để khám phá năng lực và bắt đầu hành trình của em.'), h('button', { class: 'btn-lg', onclick: focusCode }, 'Cùng Peri khám phá', arrow())),
        peri.figure(h, 'wink', { class: 'peri-cta-friend' }))));
  }
  window.ICanIdentity = {
    icon, brand, decorate, renderHome,
    mascot: peri.figure,
    sectionArt: peri.activityArt,
    activityGuide: peri.guide,
    onboardingGuide: peri.onboarding,
    reflection: window.ICanReflection,
    journey: window.ICanJourney,
    schoolPortal: window.ICanSchoolPortal,
    lessonContent: window.ICanLessonContent,
    skillIcons,
    skillColors: { U: '#0057A5', L: '#3155D9', R: '#3155D9', S: '#FF8066', W: '#3155D9' },
    lessonBrand: h => h('div', { class: 'identity-lesson-brand' }, brand(h)),
    navIcon: key => icon({ dashboard: 'chart', schools: 'school', campaigns: 'calendar', admin: 'shield' }[key]),
  };
  document.querySelector('.identity-skip').addEventListener('click', event => {
    event.preventDefault(); document.getElementById('app').focus();
  });
})();
