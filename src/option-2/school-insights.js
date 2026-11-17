/* Cohort-level skill evidence, with explicit denominators and practical teaching suggestions. */
(() => {
  'use strict';
  const names = { L: 'Nghe', R: 'Đọc', S: 'Nói', W: 'Viết' };
  const poses = { L: 'wave', R: 'think', S: 'wink', W: 'fly' };
  const fmt = value => window.ICanSchoolCharts.number(value, 1);
  const icon = (key, size = 22) => window.ICanIdentity.icon(window.ICanIdentity.skillIcons[key], size);
  function overview(h, report, active, onSelect) {
    return h('div', { class: 'school-insight-overview', 'aria-label': 'So sánh bốn kỹ năng trên thang 100' }, report.diagnostics.skills.map(skill =>
      h('button', { type: 'button', class: 'school-insight-skill' + (skill.key === active ? ' selected' : ''), 'aria-pressed': String(skill.key === active), 'aria-label': 'Xem phân tích kỹ năng ' + names[skill.key], 'data-skill': skill.key, onclick: () => onSelect(skill.key) },
        h('span', { class: 'school-insight-skill-name' }, icon(skill.key, 20), names[skill.key], skill.key === active ? h('span', { class: 'school-insight-active' }, 'Đang xem') : null),
        h('span', { class: 'school-insight-score' }, skill.average === null ? 'Chưa có điểm' : fmt(skill.average), skill.average === null ? null : h('small', {}, ' / 100')),
        h('span', { class: 'school-insight-score-track', 'aria-hidden': 'true' }, h('i', { style: `width:${skill.average || 0}%` })),
        h('span', { class: 'school-insight-b1' }, h('strong', {}, fmt(skill.at_b1_percent) + '%'), ' học sinh từ B1 trở lên'))));
  }
  function criteria(h, skill) {
    const label = ['L', 'R'].includes(skill.key) ? 'Trả lời đúng' : 'Đạt tiêu chí';
    const best = [...skill.criteria].filter(item => item.correct_count).sort((a, b) => b.correct_count / b.assessed - a.correct_count / a.assessed)[0];
    return h('section', { class: 'school-insight-criteria', 'aria-labelledby': 'school-criteria-title' },
      h('h4', { id: 'school-criteria-title' }, 'Các năng lực thành phần'), h('p', { class: 'school-insight-description' }, 'Mỗi dòng tổng hợp một hoạt động mẫu, chỉ tính những bài có câu trả lời hoặc phiếu quan sát hợp lệ.'),
      h('ul', {}, skill.criteria.map(item => h('li', {}, h('div', { class: 'school-criterion-top' }, h('span', {}, item.criterion), h('strong', {}, item.assessed ? fmt(item.pass_percent) + '%' : 'Chưa có dữ liệu')),
        h('span', { class: 'school-criterion-track', 'aria-hidden': 'true' }, h('i', { style: `width:${item.pass_percent}%` })), h('small', {}, `${label}: ${item.correct_count}/${item.assessed} bài được xem xét.`, item.missing ? ` Còn ${item.missing} bài chưa có minh chứng.` : '')))),
      best ? h('div', { class: 'school-insight-strength' }, h('span', {}, window.ICanIdentity.icon('check', 18), 'Điểm tựa để học tiếp'), h('p', {}, `Ở hoạt động “${best.criterion.toLowerCase()}”, ${best.correct_count}/${best.assessed} học sinh đã ${['L', 'R'].includes(skill.key) ? 'trả lời đúng' : 'đạt tiêu chí'}. Thầy cô có thể mời các em chia sẻ cách làm, rồi liên hệ với phần đang cần luyện thêm.`)) : null);
  }
  function example(h, item) {
    return h('details', { class: 'school-error-evidence' }, h('summary', {}, 'Xem minh chứng và cách hỗ trợ', window.ICanIdentity.icon('chevron', 17)),
      h('div', { class: 'school-error-evidence-body' }, h('span', { class: 'school-insight-eyebrow' }, item.kind === 'choice' ? 'CÂU HỎI VÀ LỰA CHỌN MẪU' : 'PHIẾU QUAN SÁT MẪU'),
        item.context ? h('blockquote', { lang: 'en' }, item.context) : null, h('p', { class: 'school-error-prompt', lang: 'en' }, item.prompt),
        h('div', { class: 'school-error-example-pair' }, h('div', { class: 'school-error-before' }, h('span', {}, item.kind === 'choice' ? 'Lựa chọn cần xem lại' : 'Minh chứng cần hỗ trợ'), h('p', { lang: item.id === 'S-ending' ? 'vi' : 'en' }, item.kind === 'choice' ? item.options[item.misconception] : item.error_example)),
          h('div', { class: 'school-error-after' }, h('span', {}, item.kind === 'choice' ? 'Lựa chọn phù hợp' : 'Gợi ý vận dụng'), h('p', { lang: item.id === 'S-ending' ? 'vi' : 'en' }, item.kind === 'choice' ? item.options[item.correct] : item.better_example))),
        h('p', { class: 'school-error-explanation' }, item.explanation), h('div', { class: 'school-error-support' }, window.ICanIdentity.icon('signpost', 21), h('p', {}, item.support))));
  }
  function errors(h, skill) {
    return h('section', { class: 'school-insight-errors', 'aria-labelledby': 'school-errors-title' },
      h('div', { class: 'school-error-list-heading' }, h('div', {}, h('h4', { id: 'school-errors-title' }, 'Những lỗi cần cùng học sinh tháo gỡ'), h('p', {}, 'Các lỗi được xếp theo tỷ lệ gặp trong từng hoạt động, thầy cô có thể mở minh chứng để chọn cách hỗ trợ phù hợp.')), h('span', { class: 'school-insight-source' }, 'Từ bài làm mẫu')),
      skill.errors.length ? h('ol', { class: 'school-error-list' }, skill.errors.map((item, index) => h('li', {}, h('div', { class: 'school-error-row' }, h('span', { class: 'school-error-order', 'aria-hidden': 'true' }, String(index + 1).padStart(2, '0')),
        h('div', { class: 'school-error-main' }, h('h5', {}, item.error), h('p', {}, `${item.affected}/${item.assessed} học sinh gặp biểu hiện này trong hoạt động được xem xét.`), h('span', { class: 'school-error-rate-track', 'aria-hidden': 'true' }, h('i', { style: `width:${item.error_percent}%` }))),
        h('div', { class: 'school-error-rate' }, h('strong', {}, fmt(item.error_percent) + '%'), h('span', {}, 'bài được xem xét'))), example(h, item)))) : h('div', { class: 'school-insight-empty' }, window.ICanPeri.figure(h, 'think', { decorative: true }), h('p', {}, skill.assessed ? 'Chưa ghi nhận biểu hiện lỗi thuộc các tiêu chí mẫu này, thầy cô có thể xem thêm minh chứng trước khi kết luận.' : 'Chưa có bài làm hoặc phiếu quan sát cho kỹ năng này, thầy cô cần bổ sung minh chứng trước khi phân tích lỗi.')));
  }
  function plan(h, skill) {
    const priority = skill.errors[0];
    if (!priority) return null;
    return h('aside', { class: 'school-insight-plan', 'aria-labelledby': 'school-plan-title' },
      h('div', { class: 'school-insight-plan-top' }, window.ICanPeri.figure(h, poses[skill.key], { decorative: true }), h('div', {}, h('span', { class: 'school-insight-eyebrow' }, 'PERI ĐỒNG HÀNH CÙNG THẦY CÔ'), h('h4', { id: 'school-plan-title' }, 'Chọn một điều để cùng tiến bộ'))),
      h('p', {}, `Trong các hoạt động mẫu của kỹ năng ${names[skill.key].toLowerCase()}, “${priority.error.toLowerCase()}” có tỷ lệ gặp cao nhất, với ${priority.affected}/${priority.assessed} học sinh. Thầy cô có thể bắt đầu từ một hoạt động ngắn, rồi quan sát lại sự thay đổi.`),
      h('ol', {}, priority.practice.map((text, index) => h('li', {}, h('span', { class: 'school-plan-number', 'aria-hidden': 'true' }, index + 1), h('span', {}, ['Nhận ra điểm cần chú ý', 'Cùng luyện một cách cụ thể', 'Kiểm tra lại bằng tình huống mới'][index]), h('p', {}, text)))),
      h('p', { class: 'school-insight-plan-note' }, 'Thầy cô ghi nhận cả những điều học sinh đã làm được và một bước các em có thể thử tiếp theo, để mỗi lần luyện tập đều có thêm động lực.'));
  }
  function methodology(h, report) {
    return h('details', { class: 'school-insight-method' }, h('summary', {}, window.ICanIdentity.icon('book', 18), 'Cách đọc số liệu và nguồn minh chứng', window.ICanIdentity.icon('chevron', 18)),
      h('div', {}, h('p', {}, `Báo cáo này dùng ${report.diagnostics.task_count} hoạt động minh họa, gồm ba hoạt động cho mỗi kỹ năng. Đây là bài làm mẫu của bộ dữ liệu trải nghiệm, không phải bài làm thực tế của THPT Chuyên Hưng Yên.`),
        h('p', {}, 'Với Nghe và Đọc, lỗi được nhận diện từ lựa chọn cụ thể trong câu hỏi mẫu. Với Nói và Viết, biểu hiện cần hỗ trợ được ghi trong phiếu quan sát theo tiêu chí mẫu, không được suy ra từ điểm tổng hoặc chấm tự động bằng AI.'),
        h('p', {}, 'Tỷ lệ gặp lỗi bằng số học sinh có biểu hiện đó chia cho số học sinh có minh chứng hợp lệ ở cùng hoạt động. Bài bỏ qua hoặc chưa có minh chứng không được tính là sai. Một học sinh có thể gặp nhiều lỗi, nên các tỷ lệ không cộng thành 100%.'),
        h('p', {}, 'Điểm trung bình và trình độ B1 trở lên lấy từ kết quả kỹ năng của nhóm đang chọn. Tỷ lệ ở từng năng lực thành phần dùng bài làm mẫu riêng, không phải công thức quy đổi điểm hoặc mức CEFR.')));
  }
  function render(h, report, { onSelect }) {
    const active = names[report.scope.skill] ? report.scope.skill : 'L';
    const skill = report.diagnostics.skills.find(item => item.key === active);
    return h('section', { class: 'school-insights', id: 'school-insights', tabindex: '-1', 'aria-labelledby': 'school-insights-title' },
      h('div', { class: 'school-insights-heading' }, h('div', {}, h('span', { class: 'identity-kicker' }, 'TỪ HIỂU KẾT QUẢ ĐẾN CHỌN CÁCH HỖ TRỢ'), h('h2', { id: 'school-insights-title' }, 'Đi sâu vào từng kỹ năng'), h('p', {}, `Thầy cô đang xem ${report.scope.prose}. Hãy chọn một kỹ năng để cùng xem năng lực thành phần, lỗi thường gặp, phổ điểm và thứ hạng tương ứng.`)), window.ICanPeri.figure(h, 'think', { class: 'school-insights-peri', decorative: true })),
      h('h3', { class: 'school-insight-overview-label' }, 'So sánh điểm trung bình trên thang 100'), overview(h, report, active, onSelect),
      h('div', { class: 'school-panel school-insight-detail' }, h('header', { class: 'school-insight-detail-heading' }, h('div', {}, h('span', { class: 'school-insight-detail-icon' }, icon(active, 24)), h('h3', {}, 'Chi tiết kỹ năng ' + names[active])), h('p', {}, `${skill.assessed}/${skill.total} học sinh có ít nhất một minh chứng ở kỹ năng này.`, skill.missing ? ` Còn ${skill.missing} học sinh chưa có minh chứng.` : '')),
        h('div', { class: 'school-insight-detail-grid' }, criteria(h, skill), plan(h, skill)), errors(h, skill), methodology(h, report)));
  }
  window.ICanSchoolInsights = { render };
})();
