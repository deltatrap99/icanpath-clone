/* A learner's self-assessment and CEFR describe different things, so show them as two views. */
(() => {
  'use strict';
  const skills = {
    L: { name: 'Nghe', icon: 'headphones', practice: 'Em có thể nghe một đoạn hội thoại ngắn rồi kể lại ý chính bằng lời của mình.' },
    R: { name: 'Đọc', icon: 'book', practice: 'Em hãy tìm ý chính trước, sau đó đọc lại để nhận ra những chi tiết quan trọng.' },
    S: { name: 'Nói', icon: 'chat', practice: 'Em hãy chọn một chủ đề quen thuộc và thử nói thành vài câu trọn ý, không cần vội.' },
    W: { name: 'Viết', icon: 'pen', practice: 'Em có thể bắt đầu bằng một câu rõ ý, rồi thêm lý do hoặc ví dụ để đoạn viết liền mạch.' },
  };
  const levels = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
  const selfLabels = ['Mới bắt đầu', 'Có thể làm với trợ giúp', 'Khá tự tin', 'Rất tự tin'];
  const matchedFeedback = {
    L: ['Giữ nhịp tự tin khi luyện nghe', 'Cảm nhận của em khá gần với phần nghe hôm nay. Mỗi lần nghe và nhận ra thêm một ý là một cơ hội để em hiểu sâu hơn.'],
    R: ['Từng trang đọc mở thêm hiểu biết', 'Cách em tự nhìn nhận khá gần với phần đọc hôm nay. Em hãy giữ nhịp luyện tập và cho mình thời gian làm quen với những chủ đề mới.'],
    S: ['Mạnh dạn chia sẻ bằng lời của em', 'Cảm nhận của em khá gần với phần nói hôm nay. Em có thể luyện từng câu vừa sức và dần mở rộng điều mình muốn chia sẻ.'],
    W: ['Từng câu viết đều có thể tốt hơn', 'Cách em tự nhìn nhận khá gần với phần viết hôm nay. Em hãy bắt đầu từ điều mình biết rồi thử thêm một cách diễn đạt mới.'],
  };
  const feedback = {
    match: ['Em đang hiểu mình khá rõ', 'Cảm nhận của em khá gần với phần thể hiện hôm nay. Em hãy giữ sự tự tin này và tiếp tục luyện tập theo nhịp của mình.'],
    underestimate: ['Em có thể tự tin hơn một chút', 'Bài làm cho thấy em có thể làm được nhiều hơn điều mình đã nghĩ. Em hãy ghi nhận điều đó và mạnh dạn thử thêm một bước nhé.'],
    overestimate: ['Em đã có một mục tiêu để hướng tới', 'Sự tự tin là một khởi đầu đáng quý. Em hãy dành thêm thời gian cho những bài luyện vừa sức để cách thể hiện ngày càng gần với điều mình mong muốn.'],
    unknown: ['Peri sẽ cùng em tìm hiểu thêm', 'Kỹ năng này cần thêm thông tin để đối chiếu rõ hơn. Em có thể hoàn thành một bài luyện nữa và cùng giáo viên nhìn lại những điều mình làm được.'],
  };
  function model(result) {
    return Object.entries(skills).map(([key, skill]) => {
      const row = (result.self_vs_actual || []).find(item => item.skill === key) || {};
      const score = result.skills?.[key];
      const selfLevel = Number.isInteger(row.self_level) && row.self_level >= 1 && row.self_level <= 4 ? row.self_level : null;
      const candidate = row.actual_cefr || score?.cefr;
      const actualCefr = Number.isFinite(score?.theta) && score.status !== 'error' && levels.includes(candidate) ? candidate : null;
      const verdict = selfLevel && actualCefr && result.confidence?.level !== 'low' && feedback[row.verdict] ? row.verdict : 'unknown';
      const [heading, message] = verdict === 'match' ? matchedFeedback[key] : feedback[verdict];
      return { key, ...skill, selfLevel, selfLabel: selfLevel ? row.self_label_vi || selfLabels[selfLevel - 1] : 'Em chưa tự đánh giá', actualCefr, verdict, heading, message };
    });
  }
  function render(h, result) {
    const identity = window.ICanIdentity;
    return h('section', { class: 'reflection-section', id: 'self-vs-actual', 'aria-labelledby': 'reflection-title' },
      h('div', { class: 'report-section-heading' },
        h('div', {}, h('span', { class: 'identity-kicker' }, 'THÊM MỘT GÓC NHÌN VỀ EM'),
          h('h2', { id: 'reflection-title' }, 'Hiểu mình hơn, tự tin tiến bước'),
          h('p', {}, 'Điều em cảm nhận trước bài đánh giá và phần thể hiện hôm nay giúp em hiểu rõ hơn từng kỹ năng. Mình cùng nhìn lại để chọn một bước luyện tập phù hợp nhé.')),
        window.ICanPeri.figure(h, 'wink', { class: 'reflection-companion', decorative: true })),
      h('div', { class: 'reflection-grid' }, model(result).map(item => h('article', { class: 'reflection-card reflection-' + item.key, 'aria-labelledby': 'reflection-' + item.key },
        h('div', { class: 'reflection-card-heading' }, h('span', { class: 'reflection-skill-icon' }, identity.icon(item.icon, 27)),
          h('h3', { id: 'reflection-' + item.key }, item.name), h('span', { class: 'reflection-tag reflection-tag-' + item.verdict }, identity.icon(item.verdict === 'unknown' ? 'compass' : item.verdict === 'underestimate' ? 'sun' : 'check', 15), item.verdict === 'match' ? 'Khá tương đồng' : item.verdict === 'underestimate' ? 'Thêm tự tin' : item.verdict === 'overestimate' ? 'Cùng rèn luyện' : 'Cùng khám phá')),
        h('div', { class: 'reflection-views' },
          h('div', { class: 'reflection-self' }, h('span', { class: 'reflection-label' }, 'Em tự đánh giá'),
            h('strong', {}, item.selfLabel),
            h('span', { class: 'reflection-confidence', 'aria-hidden': 'true' }, [1, 2, 3, 4].map(level => h('i', { class: item.selfLevel && level <= item.selfLevel ? 'filled' : '' }))),
            item.selfLevel ? h('span', { class: 'reflection-scale' }, `Mức ${item.selfLevel} trong 4 mức tự đánh giá`) : h('span', { class: 'reflection-scale' }, 'Em có thể bổ sung ở lần đánh giá sau.')),
          h('div', { class: 'reflection-result' }, h('span', { class: 'reflection-label' }, 'Qua bài đánh giá'),
            h('b', { class: 'reflection-level' + (item.actualCefr ? '' : ' pending') }, item.actualCefr || 'Cần thêm bài làm'),
            h('span', { class: 'reflection-scale' }, item.actualCefr ? 'Mức tham chiếu CEFR' : 'Mình sẽ cùng tìm hiểu thêm.'))),
        h('div', { class: 'reflection-feedback' }, h('h4', {}, item.heading), h('p', {}, item.message)),
        h('div', { class: 'reflection-practice' }, identity.icon('compass', 19), h('p', {}, item.practice))))),
      h('div', { class: 'reflection-note' }, identity.icon('sun', 22), h('p', {}, 'Mỗi kỹ năng có một nhịp phát triển riêng. Em không cần giỏi ngay mọi thứ, chỉ cần chọn một điều vừa sức để luyện thêm hôm nay.')));
  }
  window.ICanReflection = { model, render };
})();
