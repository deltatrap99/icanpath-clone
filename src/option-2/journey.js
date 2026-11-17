/* Peri follows a connected learning route, with completion explicitly marked by the learner. */
(() => {
  'use strict';
  const stories = {
    'A2-U01': ['Bắt đầu từ điều quen thuộc', 'wave', 'Mỗi câu em hiểu và diễn đạt được đều là một bước khởi đầu đáng quý.'],
    'A2-U02': ['Gom những câu chuyện nhỏ', 'think', 'Em hãy thử kể theo cách của mình, rồi nối các ý thành một câu chuyện rõ ràng hơn.'],
    'B1-U03': ['Thêm ý tưởng, thêm kết nối', 'fly', 'Em có thể thử một cách diễn đạt mới và dùng ví dụ gần gũi để làm ý tưởng của mình sáng rõ hơn.'],
    'B1-U04': ['Tự tin chia sẻ điều em nghĩ', 'jump', 'Em hãy chọn một ý tưởng mình quan tâm, nêu lý do và mạnh dạn chia sẻ bằng tiếng Anh.'],
  };
  const reportHref = token => '#/r/' + encodeURIComponent(token) + '?focus=journey';
  const lessonHref = (token, code) => '#/learn/' + encodeURIComponent(code) + '?result=' + encodeURIComponent(token);
  function road(h, even) {
    const ns = 'http://www.w3.org/2000/svg';
    const make = (mobile) => {
      const el = document.createElementNS(ns, 'svg');
      el.setAttribute('viewBox', mobile ? '0 0 104 224' : '0 0 152 224');
      el.setAttribute('preserveAspectRatio', 'none'); el.setAttribute('aria-hidden', 'true');
      el.setAttribute('class', 'journey-road ' + (mobile ? 'journey-road-narrow' : 'journey-road-wide'));
      const x = even ? 100 : 52;
      const d = mobile ? 'M52 0C28 32 28 80 52 112C76 144 76 192 52 224' : `M76 0C76 28 ${x} 58 ${x} 112C${x} 166 76 196 76 224`;
      for (const style of ['journey-road-bed', 'journey-road-line']) {
        const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); path.setAttribute('class', style); el.append(path);
      }
      return el;
    };
    return h('span', { class: 'journey-road-wrap', 'aria-hidden': 'true' }, make(false), make(true));
  }
  function render(h, path, token) {
    const identity = window.ICanIdentity, peri = window.ICanPeri;
    const units = path.units || [], codes = units.map(unit => unit.unit);
    const state = window.ICanJourneyState.progress(token, codes);
    const nextIndex = state.finished ? 0 : Math.max(0, state.activeIndex);
    const next = units[nextIndex];
    const focus = path.focus_skill_vi || 'tiếng Anh';
    return h('section', { class: 'learning-journey', id: 'learning-journey', 'aria-labelledby': 'journey-title' },
      h('div', { class: 'journey-heading' }, peri.figure(h, state.finished ? 'jump' : 'fly', { class: 'journey-heading-peri', decorative: true }),
        h('div', {}, h('span', { class: 'identity-kicker' }, 'HÀNH TRÌNH CỦA EM VÀ PERI'),
          h('h2', { id: 'journey-title' }, 'Chinh phục từng chặng, cùng Peri tiến xa'),
          h('p', {}, 'Bắt đầu từ những điều quen thuộc, em sẽ từng bước có thêm cách diễn đạt và ý tưởng để chia sẻ. Peri sẽ đồng hành cùng em, theo nhịp học vừa sức với chính mình.'),
          h('span', { class: 'journey-focus' }, identity.icon(identity.skillIcons[path.focus_skill] || 'compass', 18), 'Ưu tiên luyện ' + focus))),
      h('div', { class: 'journey-progress-panel' },
        h('div', { class: 'journey-progress-copy' }, h('strong', {}, state.finished ? 'Em đã đi qua tất cả các chặng!' : state.completed.length ? 'Peri đã sẵn sàng cho bước tiếp theo của em.' : 'Mình bắt đầu hành trình từ đây nhé.'),
          h('p', {}, `${state.completed.length} trong ${state.total} chặng được em đánh dấu hoàn thành`)),
        h('div', { class: 'journey-progress-track', role: 'progressbar', 'aria-label': 'Các chặng em đã đánh dấu hoàn thành', 'aria-valuemin': 0, 'aria-valuemax': state.total, 'aria-valuenow': state.completed.length }, h('span', { style: `width:${state.total ? state.completed.length / state.total * 100 : 0}%` })),
        next ? h('a', { class: 'btn journey-start', href: lessonHref(token, next.unit) }, state.finished ? 'Ôn lại cùng Peri' : state.completed.length ? 'Đi tiếp cùng Peri' : 'Khám phá chặng đầu tiên', identity.icon('arrow', 19)) : null),
      h('ol', { class: 'journey-route', 'aria-label': 'Các chặng học cùng Peri' }, units.map((unit, index) => {
        const done = state.completed.includes(unit.unit), current = !state.finished && index === state.activeIndex;
        const story = stories[unit.unit] || ['Khám phá thêm khả năng của em', 'wave', 'Em hãy dành thời gian luyện tập và ghi nhận từng điều mới mình có thể làm được.'];
        return h('li', { class: 'journey-stage' + (done ? ' completed' : current ? ' current' : ''), 'aria-current': current ? 'step' : null },
          road(h, index % 2 === 1),
          h('div', { class: 'journey-marker', 'aria-hidden': 'true' },
            peri.figure(h, done ? 'jump' : current ? 'fly' : story[1], { decorative: true }),
            h('span', { class: 'journey-milestone' }, done ? identity.icon('check', 23) : String(index + 1).padStart(2, '0')),
            current ? h('span', { class: 'journey-here' }, 'Peri đang ở đây') : null),
          h('article', { class: 'journey-stop', 'aria-labelledby': 'journey-stop-' + index },
            h('div', { class: 'journey-stop-meta' }, h('span', {}, `Chặng ${index + 1}`), h('span', { class: 'journey-level' }, unit.cefr || unit.level)),
            h('p', { class: 'journey-story' }, story[0]), h('h3', { id: 'journey-stop-' + index }, unit.title),
            h('p', { class: 'journey-skill-goal' }, unit.focus_vi || story[2]),
            current ? h('p', { class: 'journey-encouragement' }, identity.icon('sun', 18), story[2]) : null,
            h('a', { class: 'btn journey-lesson-link' + (current ? '' : ' btn2'), href: lessonHref(token, unit.unit), 'aria-label': `${done ? 'Ôn lại' : 'Khám phá'} chặng ${index + 1}: ${unit.title}` }, done ? 'Ôn lại chặng này' : current ? 'Cùng Peri bắt đầu' : 'Khám phá chặng này', identity.icon('arrow', 18)),
            done ? h('span', { class: 'journey-done-label' }, identity.icon('check', 15), 'Em đã đánh dấu hoàn thành') : null));
      })),
      h('div', { class: 'journey-destination' }, h('img', { src: '/option-2/assets/path-destination.svg', alt: '', width: 112, height: 112, loading: 'lazy' }),
        h('div', {}, h('h3', {}, state.finished ? 'Em đã chinh phục thêm một hành trình cùng Peri!' : 'Mỗi chặng hôm nay, thêm một bước tiến xa'),
          h('p', {}, state.finished ? 'Em có thể quay lại bất kỳ chặng nào để ôn tập và thử diễn đạt theo một cách mới. Sự kiên trì của em luôn là điều đáng ghi nhận.' : 'Em có thể mở bất kỳ chặng nào, rồi đánh dấu sau khi đã học và luyện tập xong. Mỗi bước nhỏ đều xứng đáng được ghi nhận.'))));
  }
  function lessonFooter(h, { token, unit, path, toast }) {
    const codes = (path?.units || []).map(item => item.unit);
    if (!token || !codes.includes(unit.code)) return null;
    const done = window.ICanJourneyState.progress(token, codes).completed.includes(unit.code);
    const complete = () => {
      try { window.ICanJourneyState.complete(token, unit.code, codes); }
      catch { return toast('Trình duyệt chưa lưu được bước tiến này, em hãy kiểm tra quyền lưu dữ liệu rồi thử lại.'); }
      toast('Em đã hoàn thành thêm một chặng, Peri sẽ cùng em khám phá bước tiếp theo.');
      location.hash = reportHref(token);
    };
    return h('section', { class: 'journey-lesson-finish', 'aria-labelledby': 'journey-lesson-finish-title' },
      window.ICanPeri.figure(h, done ? 'jump' : 'wink', { decorative: true }),
      h('div', {}, h('span', { class: 'identity-kicker' }, 'GHI NHẬN TỪNG BƯỚC TIẾN'),
        h('h2', { id: 'journey-lesson-finish-title' }, done ? 'Em đã hoàn thành chặng học này!' : 'Em đã sẵn sàng đi tiếp cùng Peri?'),
        h('p', {}, done ? 'Em có thể ôn lại bài bất cứ lúc nào, rồi trở về hành trình để chọn điều mình muốn khám phá tiếp theo.' : 'Khi đã học và luyện tập xong, em hãy đánh dấu chặng này. Peri sẽ cùng em bắt đầu từ bước tiếp theo khi em quay lại hành trình.'),
        h('div', { class: 'row' }, done ? null : h('button', { onclick: complete }, 'Đánh dấu em đã hoàn thành', window.ICanIdentity.icon('check', 19)), h('a', { class: 'btn btn2', href: reportHref(token) }, 'Về hành trình của em'))));
  }
  window.ICanJourney = { render, lessonFooter };
})();
