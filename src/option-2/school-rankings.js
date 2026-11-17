/* Ranked records retain their cohort rank when a search or CEFR filter narrows the list. */
(() => {
  'use strict';
  const fmt = value => window.ICanSchoolCharts.number(value, 1);
  function detail(h, student, report, registerCleanup) {
    const previous = document.activeElement;
    let dialog;
    const close = () => dialog.close();
    dialog = h('dialog', { class: 'school-student-dialog', 'aria-labelledby': 'school-student-title', oncancel: event => { event.preventDefault(); close(); }, onclose: () => { dialog.remove(); if (previous?.isConnected) previous.focus(); } },
      h('div', { class: 'school-dialog-top' }, h('span', { class: 'school-data-badge' }, 'Kết quả học sinh'), h('button', { type: 'button', class: 'btn2 school-close', onclick: close, 'aria-label': 'Đóng kết quả học sinh' }, '×')),
      h('span', { class: 'identity-kicker' }, report.school.name), h('h2', { id: 'school-student-title' }, student.name), h('p', { class: 'school-student-meta' }, `Lớp ${student.class_name}, năm học ${report.school.year}`),
      h('div', { class: 'school-student-overall' }, h('div', {}, h('span', {}, 'Điểm tổng thể'), h('strong', {}, fmt(student.overall.score), h('small', {}, ' / 100'))), h('b', { class: 'school-cefr-badge' }, student.overall.cefr)),
      h('div', { class: 'school-student-skills' }, Object.entries(student.skills).map(([key, skill]) => h('div', {}, h('span', {}, window.ICanIdentity.icon(window.ICanIdentity.skillIcons[key], 22), window.ICanSchoolService.skills[key]), h('strong', {}, fmt(skill.score)), h('small', {}, skill.cefr), h('span', { class: 'school-skill-track', 'aria-hidden': 'true' }, h('i', { style: `width:${skill.score}%` }))))),
      h('p', { class: 'school-student-context' }, `Học sinh có thứ hạng ${student.rank} trong ${report.summary.total} học sinh của ${report.scope.prose}, theo ${report.scope.skill === 'overall' ? 'điểm tổng thể' : 'điểm kỹ năng ' + window.ICanSchoolService.skills[report.scope.skill].toLowerCase()}. Điểm tổng thể là trung bình của bốn kỹ năng trong báo cáo.`),
      h('a', { class: 'btn btn2 school-dialog-full-report', href: window.ICanSchoolPortal.href({ ...report.scope, student: student.id }) }, 'Mở báo cáo chi tiết', window.ICanIdentity.icon('arrow', 18)),
      h('button', { type: 'button', class: 'school-dialog-done', onclick: close }, 'Đóng kết quả'));
    document.body.append(dialog); dialog.showModal();
    registerCleanup(() => { if (dialog.isConnected) { dialog.close(); dialog.remove(); } });
  }
  function create(h, report, { onLevelChange, registerCleanup }) {
    let level = '', current = 1;
    const tableBox = h('div', { class: 'school-ranking-results', 'aria-live': 'polite' });
    const activeFilter = h('div', { class: 'school-ranking-filter', tabindex: '-1' });
    const search = h('input', { id: 'school-student-search', type: 'search', placeholder: 'Nhập tên hoặc lớp học', autocomplete: 'off', oninput: () => { current = 1; draw(); } });
    const showStudent = student => detail(h, student, report, registerCleanup);
    function draw() {
      const data = window.ICanSchoolService.page(report.students, { search: search.value, level, current });
      current = data.current;
      if (leaderBox) leaderBox.hidden = Boolean(level || search.value.trim());
      activeFilter.replaceChildren(...(level ? [h('span', {}, `Đang xem trình độ ${level}`), h('button', { type: 'button', class: 'btn2', onclick: () => selectLevel('') }, 'Xem tất cả trình độ')] : []));
      const columns = ['Thứ hạng', 'Học sinh', 'Lớp', 'Điểm', 'Trình độ'];
      const rows = data.students.map(student => h('tr', { class: student.rank === 1 ? 'school-first-place' : '' },
        h('td', { class: 'school-rank-position' }, h('span', {}, student.rank)),
        h('td', { class: 'school-rank-name' }, h('button', { type: 'button', class: 'school-student-name', onclick: () => showStudent(student), 'aria-label': 'Xem kết quả của ' + student.name }, student.name), h('span', { class: 'school-rank-mobile-meta' }, `${student.class_name}, ${student.cefr}`)),
        h('td', { class: 'school-rank-class' }, student.class_name), h('td', { class: 'school-rank-score' }, h('span', { class: 'school-rank-score-label' }, 'Điểm'), h('strong', {}, fmt(student.score))), h('td', { class: 'school-rank-level' }, h('span', { class: 'school-cefr-badge' }, student.cefr))));
      const pager = h('div', { class: 'school-pager' }, h('p', {}, `Hiển thị ${data.start} đến ${data.end} trong ${data.total} học sinh`), h('div', {}, h('button', { type: 'button', class: 'btn2 school-page-previous', disabled: current === 1, onclick: () => turnPage(-1) }, 'Trang trước'), h('span', { 'aria-label': 'Trang hiện tại' }, `${current} / ${data.pages}`), h('button', { type: 'button', class: 'btn2 school-page-next', disabled: current === data.pages, onclick: () => turnPage(1) }, 'Trang sau')));
      tableBox.replaceChildren(data.total ? h('div', { class: 'school-rank-table-wrap' }, h('table', { class: 'school-rank-table' }, h('caption', { class: 'school-sr-only' }, `Xếp hạng ${report.scope.prose} theo ${window.ICanSchoolService.skills[report.scope.skill].toLowerCase()}`), h('thead', {}, h('tr', {}, columns.map(text => h('th', { scope: 'col' }, text)))), h('tbody', {}, rows))) : h('div', { class: 'school-empty' }, window.ICanPeri.figure(h, 'think', { decorative: true }), h('h3', {}, 'Chưa có học sinh phù hợp với lựa chọn này'), h('p', {}, 'Thầy cô có thể thử một tên khác hoặc xem tất cả trình độ để tìm lại học sinh.'), h('button', { type: 'button', class: 'btn2', onclick: () => { search.value = ''; selectLevel(''); } }, 'Xóa bộ lọc danh sách')), pager);
    }
    function turnPage(delta) { current += delta; draw(); const primary = tableBox.querySelector(delta > 0 ? '.school-page-next' : '.school-page-previous'); const other = tableBox.querySelector(delta > 0 ? '.school-page-previous' : '.school-page-next'); (primary.disabled ? other : primary).focus({ preventScroll: true }); }
    function selectLevel(value) { level = value === level ? '' : value; current = 1; onLevelChange(level); draw(); node.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); (level ? activeFilter : search).focus({ preventScroll: true }); }
    const leader = report.students[0];
    const leaderBox = leader ? h('div', { class: 'school-ranking-leader' }, window.ICanPeri.figure(h, 'jump', { decorative: true }), h('div', {}, h('span', {}, 'Đang dẫn đầu ' + report.scope.prose), h('strong', {}, leader.name), h('p', {}, `${fmt(leader.score)} điểm, trình độ ${leader.cefr}`)), h('button', { type: 'button', class: 'btn2', onclick: () => showStudent(leader) }, 'Xem kết quả')) : null;
    const node = h('section', { class: 'school-panel school-rankings', 'aria-labelledby': 'school-ranking-title' },
      h('div', { class: 'school-ranking-heading' }, h('div', {}, h('h2', { id: 'school-ranking-title' }, 'Bảng xếp hạng học sinh'), h('p', {}, 'Danh sách được xếp theo điểm giảm dần, các học sinh bằng điểm có cùng thứ hạng.')), h('div', { class: 'school-search-field' }, h('label', { for: 'school-student-search' }, 'Tìm học sinh'), search)),
      leaderBox,
      activeFilter, tableBox);
    draw();
    return { node, selectLevel };
  }
  window.ICanSchoolRankings = { create };
})();
