/* Original Peri artwork supplied by the user, presented without changing the source pixels. */
(() => {
  'use strict';
  const base = '/option-2/assets/peri/';
  const poses = {
    wave: { file: 'peri-wave.png', bounds: [247, 147, 406, 579], label: 'Peri đang vẫy tay chào em.' },
    jump: { file: 'peri-jump.png', bounds: [222, 145, 456, 610], label: 'Peri đang bật nhảy vui vẻ.' },
    fly: { file: 'peri-fly.png', bounds: [182, 175, 536, 550], label: 'Peri đang bay để khám phá.' },
    think: { file: 'peri-think.png', bounds: [281, 173, 336, 530], label: 'Peri đang suy nghĩ cùng em.' },
    wink: { file: 'peri-wink.png', bounds: [246, 153, 407, 579], label: 'Peri đang nháy mắt khích lệ em.' },
  };
  const aliases = { hello: 'wave', study: 'think', cheer: 'jump' };
  const activities = {
    U: { pose: 'jump', icon: 'puzzle', text: 'Em hãy đọc kỹ câu hỏi và chọn đáp án theo điều mình biết, Peri sẽ cùng em khởi động.' },
    L: { pose: 'wave', icon: 'headphones', text: 'Peri đang lắng nghe cùng em. Em hãy nghe trọn đoạn hội thoại trước khi chọn đáp án.' },
    R: { pose: 'think', icon: 'book', text: 'Em có thể đọc lại đoạn văn để tìm chi tiết cần thiết, rồi tự tin chọn câu trả lời của mình.' },
    S: { pose: 'wink', icon: 'chat', text: 'Peri tin rằng em làm được. Em hãy nói chậm, rõ và diễn đạt theo cách của mình.' },
    W: { pose: 'think', icon: 'pen', text: 'Em hãy sắp xếp ý trước khi viết, rồi dành chút thời gian đọc lại bài của mình cùng Peri.' },
    learn: { pose: 'fly', text: 'Mỗi lần luyện tập giúp em tiến thêm một bước. Em hãy nghe câu mẫu rồi thử đọc lại thật rõ cùng Peri.' },
    result: { pose: 'jump', text: 'Mỗi lần em thử sức đều có giá trị. Cùng Peri nhìn lại những điều mình đã làm được, rồi chọn một bước vừa sức để tiếp tục khám phá nhé.' },
  };
  function figure(h, name = 'wave', options = {}) {
    const key = poses[name] ? name : aliases[name] || 'wave';
    const pose = poses[key];
    const ns = 'http://www.w3.org/2000/svg';
    const drawing = document.createElementNS(ns, 'svg');
    drawing.setAttribute('viewBox', pose.bounds.join(' '));
    drawing.setAttribute('aria-hidden', 'true');
    drawing.setAttribute('focusable', 'false');
    const bitmap = document.createElementNS(ns, 'image');
    bitmap.setAttribute('href', base + pose.file);
    bitmap.setAttribute('width', '900'); bitmap.setAttribute('height', '900');
    drawing.append(bitmap);
    const decorative = options.decorative === true;
    return h('span', {
      class: 'peri-figure peri-' + key + (options.class ? ' ' + options.class : ''),
      style: `--peri-aspect:${pose.bounds[2]}/${pose.bounds[3]};${options.width ? `width:${options.width}px;` : ''}${options.style || ''}`,
      role: decorative ? null : 'img', 'aria-label': decorative ? null : options.alt || pose.label,
      'aria-hidden': decorative ? 'true' : null, 'data-peri-pose': key,
    }, drawing);
  }
  function activityArt(h, key, { celebrated = false } = {}) {
    const activity = activities[key] || activities.U;
    return h('div', { class: 'peri-activity-art' + (celebrated ? ' peri-activity-celebration' : '') },
      figure(h, activity.pose),
      h('span', { class: 'peri-activity-badge' }, window.ICanIdentity.icon(activity.icon, 27)),
      h('span', { class: 'peri-activity-caption' }, celebrated ? 'Peri chúc mừng bước tiến của em.' : 'Peri đồng hành cùng em'));
  }
  function guide(h, key, text) {
    const activity = activities[key] || activities.U;
    return h('aside', { class: 'peri-guide', 'aria-label': 'Gợi ý từ Peri', 'data-peri-activity': key },
      figure(h, activity.pose, { decorative: true }),
      h('div', {}, h('span', { class: 'peri-guide-label' }, 'Peri đồng hành'), h('p', {}, text || activity.text)));
  }
  function onboarding(h, step) {
    const steps = [null,
      ['think', 'Em hãy chia sẻ việc học tiếng Anh hằng ngày, để Peri hiểu thêm về cách em đang học.'],
      ['wink', 'Không có lựa chọn đúng hay sai ở bước này. Em hãy chọn những mô tả gần nhất với khả năng của mình nhé.'],
      ['jump', 'Peri đã sẵn sàng cùng em khám phá. Em hãy chọn mục tiêu học tập và kiểm tra lại thông tin trước khi bắt đầu.'],
    ];
    const item = steps[step];
    if (!item) return null;
    return h('aside', { class: 'peri-guide', 'aria-label': 'Gợi ý từ Peri' },
      figure(h, item[0], { decorative: true }), h('div', {}, h('span', { class: 'peri-guide-label' }, 'Peri đồng hành'), h('p', {}, item[1])));
  }
  window.ICanPeri = { figure, activityArt, guide, onboarding, poses };
})();
