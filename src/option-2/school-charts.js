/* Counts, percentages and histogram bins are calculated from the currently selected cohort. */
(() => {
  'use strict';
  const number = (value, digits = 0) => Number(value).toLocaleString('vi-VN', { maximumFractionDigits: digits });
  function levels(h, report, onSelect) {
    const largestCount = Math.max(...report.levels.map(item => item.count));
    const tickStep = largestCount > 20 ? 10 : 2;
    const maximum = Math.max(2, Math.ceil(largestCount / tickStep) * tickStep);
    const bars = report.levels.map((item, index) => {
      const percentage = report.summary.total ? item.count * 100 / report.summary.total : 0;
      return h('button', { type: 'button', class: 'school-level-option', 'data-level': item.level, 'aria-pressed': 'false', 'aria-label': `${item.level}, ${item.count} học sinh, ${number(percentage, 1)} phần trăm, chọn để xem danh sách`, onclick: () => onSelect(item.level) },
        h('strong', { class: 'school-level-count' }, item.count), h('span', { class: 'school-level-track', 'aria-hidden': 'true' }, h('i', { style: `--bar-size:${item.count / maximum * 100}%;--bar-color:var(--school-level-${index})` })),
        h('span', { class: 'school-level-name' }, item.level), h('small', { class: 'school-level-percent' }, number(percentage, 1) + '%'));
    });
    const chart = h('section', { class: 'school-panel school-cefr-panel', 'aria-labelledby': 'school-cefr-title' },
      h('div', { class: 'school-panel-heading' }, h('div', {}, h('h2', { id: 'school-cefr-title' }, 'Học sinh đang ở trình độ nào?'), h('p', {}, `Phân bố ${report.summary.total} học sinh theo ${report.scope.skill === 'overall' ? 'trình độ tổng thể' : 'kỹ năng ' + window.ICanSchoolService.skills[report.scope.skill].toLowerCase()}.`))),
      h('div', { class: 'school-level-chart' }, h('div', { class: 'school-level-axis', 'aria-hidden': 'true' }, [maximum, maximum / 2, 0].map(value => h('span', {}, number(value, 1)))), h('div', { class: 'school-level-bars' }, bars)),
      h('p', { class: 'school-chart-help' }, window.ICanIdentity.icon('compass', 16), 'Thầy cô có thể chọn một cột để xem các học sinh ở trình độ đó.'));
    return { node: chart, select: level => bars.forEach(button => { const active = button.getAttribute('data-level') === level; button.setAttribute('aria-pressed', String(active)); button.classList.toggle('selected', active); }) };
  }
  function histogram(h, report) {
    const maximum = Math.max(1, ...report.histogram.map(item => item.count));
    return h('section', { class: 'school-panel school-score-panel', 'aria-labelledby': 'school-score-title' },
      h('div', { class: 'school-panel-heading' }, h('div', {}, h('h2', { id: 'school-score-title' }, 'Phổ điểm của ' + report.scope.prose), h('p', {}, 'Số học sinh trong từng khoảng điểm trên thang 100.'))),
      h('ul', { class: 'school-score-buckets', 'aria-label': 'Số học sinh theo khoảng điểm' }, report.histogram.map(item => h('li', { 'aria-label': `${item.low} đến ${item.high === 100 ? '100' : 'dưới ' + item.high} điểm, ${item.count} học sinh` },
        h('span', { class: 'school-bucket-label' }, `${item.low}-${item.high === 100 ? '100' : '<' + item.high}`), h('span', { class: 'school-bucket-track', 'aria-hidden': 'true' }, h('i', { style: `width:${item.count / maximum * 100}%` })), h('strong', {}, item.count)))),
      h('p', { class: 'school-chart-help' }, 'Các khoảng được tính từ mốc đầu đến trước mốc tiếp theo, khoảng cuối gồm cả điểm 100.'));
  }
  function metrics(h, report) {
    const s = report.summary;
    return h('div', { class: 'school-metrics', 'aria-label': 'Thống kê của ' + report.scope.prose },
      [['user', 'Học sinh tham gia', s.total, `${s.classes} lớp trong phạm vi đã chọn`], ['chart', 'Điểm trung bình', number(s.average, 1), 'Trên thang điểm 100'], ['book', 'Trình độ phổ biến', s.popular.level, `${s.popular.count} học sinh ở trình độ này`], ['signpost', 'Từ B1 trở lên', number(s.at_b1_percent, 1) + '%', `${s.at_b1} trong ${s.total} học sinh`]].map(([icon, label, value, detail]) => h('div', { class: 'school-metric' }, h('span', { class: 'school-metric-icon' }, window.ICanIdentity.icon(icon, 22)), h('span', { class: 'school-metric-label' }, label), h('strong', {}, value), h('small', {}, detail))));
  }
  window.ICanSchoolCharts = { levels, histogram, metrics, number };
})();
