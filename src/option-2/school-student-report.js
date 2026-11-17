/* An individual report belongs to the selected school cohort and retains its source error roster. */
(() => {
  'use strict';
  const states = { met: 'Đã đáp ứng', needs_support: 'Cần luyện thêm', other_error: 'Cần xem lại câu trả lời', missing: 'Chưa có minh chứng' };
  const keys = ['L', 'R', 'S', 'W'];
  const fmt = value => window.ICanSchoolCharts.number(value, 1);
  const label = key => window.ICanSchoolService.skills[key];
  const icon = (key, size = 22) => window.ICanIdentity.icon(window.ICanIdentity.skillIcons[key], size);
  function evidence(h, item, highlighted) {
    const statusIcon = item.status === 'met' ? 'check' : item.status === 'missing' ? 'book' : 'compass';
    const note = item.status === 'met' ? 'Minh chứng mẫu đã đáp ứng tiêu chí này. Thầy cô có thể khuyến khích em vận dụng trong một tình huống mới để củng cố điều đã làm được.' : item.status === 'missing' ? 'Chưa có câu trả lời hoặc phiếu quan sát hợp lệ ở hoạt động này, vì vậy báo cáo chưa kết luận em gặp lỗi. Thầy cô có thể bổ sung minh chứng trong lần luyện tập tiếp theo.' : item.status === 'other_error' ? 'Lựa chọn này chưa phù hợp với ngữ cảnh, nhưng không thuộc biểu hiện lỗi đang được thống kê ở hoạt động này. Thầy cô có thể cùng em đối chiếu thông tin để tìm cách chọn đáp án.' : item.explanation;
    return h('details', { class: 'school-personal-evidence state-' + item.status + (highlighted ? ' from-error' : ''), open: highlighted },
      h('summary', {}, h('span', { class: 'school-personal-state-icon' }, window.ICanIdentity.icon(statusIcon, 18)), h('span', { class: 'school-personal-criterion' }, item.criterion, highlighted ? h('small', {}, 'Đang mở từ danh sách gặp lỗi') : null), h('span', { class: 'school-personal-state-label' }, states[item.status]), window.ICanIdentity.icon('chevron', 17)),
      h('div', { class: 'school-personal-evidence-body' }, h('span', { class: 'school-insight-eyebrow' }, item.kind === 'choice' ? 'CÂU TRẢ LỜI TRONG HOẠT ĐỘNG MẪU' : 'GHI NHẬN TRONG PHIẾU QUAN SÁT MẪU'),
        item.context ? h('blockquote', { lang: 'en' }, item.context) : null, h('p', { class: 'school-error-prompt', lang: 'en' }, item.prompt),
        item.status !== 'missing' ? h('div', { class: 'school-error-example-pair' }, h('div', { class: item.status === 'met' ? 'school-error-after' : 'school-error-before' }, h('span', {}, item.kind === 'choice' ? 'Lựa chọn của em trong bài mẫu' : 'Minh chứng mẫu của em'), h('p', { lang: item.id === 'S-ending' ? 'vi' : 'en' }, item.kind === 'choice' ? `${item.value}. ${item.response_text}` : item.response_text)),
          item.status !== 'met' ? h('div', { class: 'school-error-after' }, h('span', {}, item.kind === 'choice' ? 'Đáp án phù hợp' : 'Gợi ý vận dụng'), h('p', { lang: item.id === 'S-ending' ? 'vi' : 'en' }, item.kind === 'choice' ? `${item.correct}. ${item.options[item.correct]}` : item.better_example)) : null) : null,
        h('p', { class: 'school-error-explanation' }, note), ['needs_support', 'other_error'].includes(item.status) ? h('div', { class: 'school-error-support' }, window.ICanIdentity.icon('signpost', 20), h('p', {}, item.support)) : null));
  }
  function skillSection(h, data, key) {
    const items = data.evidence.filter(item => item.skill === key);
    const assessed = items.filter(item => item.status !== 'missing').length;
    const met = items.filter(item => item.status === 'met').length;
    const support = items.filter(item => ['needs_support', 'other_error'].includes(item.status)).length;
    return h('section', { class: 'school-panel school-personal-skill', id: 'school-personal-skill-' + key, 'aria-labelledby': 'school-personal-title-' + key },
      h('div', { class: 'school-personal-skill-heading' }, h('div', {}, icon(key, 25), h('h2', { id: 'school-personal-title-' + key, tabindex: '-1' }, 'Kỹ năng ' + label(key))), h('span', { class: 'school-cefr-badge' }, data.student.skills[key].cefr)),
      h('p', { class: 'school-personal-skill-summary' }, `Em có minh chứng ở ${assessed}/${items.length} hoạt động mẫu, trong đó ${met} hoạt động đã đáp ứng tiêu chí và ${support} hoạt động cần luyện thêm.`),
      h('div', { class: 'school-personal-evidence-list' }, items.map(item => evidence(h, item, data.context_error?.id === item.id))));
  }
  function render(h, data, query) {
    const { report, student, context_error: contextError } = data;
    const backHref = window.ICanSchoolPortal.href({ ...report.scope, error: contextError?.id || '', search: query.get('search') || '', page: query.get('page') || 1, focus: contextError ? 'error' : 'rankings' });
    const focusItem = contextError ? data.evidence.find(item => item.id === contextError.id) : data.evidence.find(item => ['needs_support', 'other_error'].includes(item.status));
    const assessed = data.evidence.filter(item => item.status !== 'missing').length;
    const met = data.evidence.filter(item => item.status === 'met').length;
    const support = data.evidence.filter(item => ['needs_support', 'other_error'].includes(item.status)).length;
    const jump = key => { const target = document.getElementById('school-personal-title-' + key); target.scrollIntoView({ block: 'start' }); target.focus({ preventScroll: true }); };
    return h('div', { class: 'school-portal school-personal-report' },
      h('nav', { class: 'school-personal-back', 'aria-label': 'Quay lại báo cáo nhà trường' }, h('a', { href: backHref }, window.ICanIdentity.icon('arrow', 18), contextError ? 'Về danh sách học sinh gặp lỗi' : 'Về bảng xếp hạng học sinh'), h('span', {}, report.scope.label)),
      h('header', { class: 'school-personal-hero' }, h('div', {}, h('span', { class: 'identity-kicker' }, 'BÁO CÁO HỌC SINH, ' + report.school.name), h('h1', {}, student.name), h('p', {}, `Lớp ${student.class_name}, mã học sinh ${student.id}, năm học ${report.school.year}.`), h('span', { class: 'school-data-badge' }, 'Dữ liệu minh họa')), window.ICanPeri.figure(h, 'wink', { decorative: true })),
      contextError ? h('aside', { class: 'school-personal-source' }, window.ICanIdentity.icon('compass', 23), h('div', {}, h('strong', {}, 'Đang tìm hiểu lỗi: ' + contextError.error), h('p', {}, `Học sinh thuộc nhóm ${contextError.affected} em có minh chứng khớp với biểu hiện này trong ${report.scope.prose}. Tiêu chí tương ứng được mở sẵn trong phần kỹ năng ${label(contextError.skill).toLowerCase()}.`))) : null,
      h('section', { class: 'school-personal-summary', 'aria-label': 'Tổng quan kết quả học sinh' }, h('div', { class: 'school-personal-overall' }, h('span', {}, 'Điểm tổng thể'), h('strong', {}, fmt(student.overall.score), h('small', {}, ' / 100')), h('span', { class: 'school-cefr-badge' }, student.overall.cefr)),
        h('div', { class: 'school-personal-evidence-summary' }, h('h2', {}, 'Nhìn lại những điều em đã làm được'), h('p', {}, `Trong ${assessed}/${data.evidence.length} hoạt động có minh chứng, em đã đáp ứng ${met} tiêu chí và còn ${support} hoạt động để luyện thêm. Thầy cô có thể cùng em chọn một bước vừa sức để tiếp tục.`), h('p', { class: 'school-personal-rank' }, `Thứ hạng ${student.rank}/${report.summary.total}, theo ${report.scope.skill === 'overall' ? 'điểm tổng thể' : 'điểm kỹ năng ' + label(report.scope.skill).toLowerCase()} trong ${report.scope.prose}.`))),
      h('div', { class: 'school-personal-scores', 'aria-label': 'Kết quả bốn kỹ năng' }, keys.map(key => h('button', { type: 'button', class: 'school-personal-score', onclick: () => jump(key), 'aria-label': 'Xem minh chứng kỹ năng ' + label(key) }, h('span', {}, icon(key, 20), label(key)), h('strong', {}, fmt(student.skills[key].score), h('small', {}, ' / 100')), h('span', { class: 'school-personal-score-bottom' }, student.skills[key].cefr, window.ICanIdentity.icon('chevron', 17)), h('span', { class: 'school-skill-track', 'aria-hidden': 'true' }, h('i', { style: `width:${student.skills[key].score}%` }))))),
      h('div', { class: 'school-personal-skills' }, keys.map(key => skillSection(h, data, key))),
      h('aside', { class: 'school-personal-next', 'aria-labelledby': 'school-personal-next-title' }, window.ICanPeri.figure(h, focusItem ? 'think' : 'jump', { decorative: true }), h('div', {}, h('span', { class: 'school-insight-eyebrow' }, 'PERI ĐỒNG HÀNH VỚI TỪNG BƯỚC TIẾN'), h('h2', { id: 'school-personal-next-title' }, focusItem ? 'Chọn một bước luyện tập tiếp theo' : 'Cùng giữ nhịp học tập tích cực'),
        h('p', {}, focusItem ? `Thầy cô có thể cùng em bắt đầu từ “${focusItem.criterion.toLowerCase()}”, rồi quay lại xem một minh chứng mới để ghi nhận sự tiến bộ.` : 'Thầy cô có thể khuyến khích em vận dụng điều đã học trong tình huống mới, đồng thời bổ sung minh chứng cho những hoạt động còn thiếu.'), focusItem ? h('ol', {}, focusItem.practice.map(text => h('li', {}, text))) : null)),
      h('div', { class: 'school-personal-footer' }, h('p', {}, 'Báo cáo sử dụng kết quả và bài làm mẫu trong bộ dữ liệu trải nghiệm. Hoạt động chưa có minh chứng được giữ riêng, không tính là lỗi của học sinh.'), h('a', { class: 'btn btn2', href: backHref }, contextError ? 'Trở lại danh sách gặp lỗi' : 'Trở lại bảng xếp hạng')));
  }
  window.ICanSchoolStudentReport = { render };
})();
