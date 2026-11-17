/* A scoped roster derived from the exact pupil IDs counted in a misconception. */
(() => {
  'use strict';
  const links = () => window.ICanSchoolPortal;
  function create(h, data, query) {
    const { report, criterion, students } = data;
    let current = Number(query.get('page')) || 1;
    const results = h('div', { class: 'school-error-students-results', 'aria-live': 'polite' });
    const search = h('input', { id: 'school-error-student-search', type: 'search', autocomplete: 'off', placeholder: 'Nhập tên hoặc lớp học', value: query.get('search') || '', oninput: () => { current = 1; draw(true); } });
    const context = () => ({ ...report.scope, error: criterion.id, focus: 'error', search: search.value, page: current });
    function draw(updateUrl = false) {
      const page = window.ICanSchoolService.page(students, { search: search.value, current });
      current = page.current;
      if (updateUrl) history.replaceState(null, '', links().href(context()));
      const rows = page.students.map(student => {
        const href = links().href({ ...context(), student: student.id });
        const value = student.skills[criterion.skill];
        return h('tr', {}, h('td', { class: 'school-error-student-name' }, h('a', { href }, student.name), h('small', {}, student.id)), h('td', { class: 'school-error-student-class', 'data-label': 'Lớp' }, student.class_name),
          h('td', { class: 'school-error-student-score', 'data-label': 'Điểm ' + window.ICanSchoolService.skills[criterion.skill] }, h('strong', {}, window.ICanSchoolCharts.number(value.score, 1)), h('span', {}, value.cefr)),
          h('td', { class: 'school-error-student-action' }, h('a', { class: 'btn btn2', href, 'aria-label': `Mở báo cáo của ${student.name}, lớp ${student.class_name}` }, 'Xem báo cáo', window.ICanIdentity.icon('arrow', 16))));
      });
      const pager = h('div', { class: 'school-pager' }, h('p', {}, `Hiển thị ${page.start} đến ${page.end} trong ${page.total} học sinh${search.value.trim() ? ' phù hợp với từ khóa' : ' gặp lỗi này'}.`),
        h('div', {}, h('button', { type: 'button', class: 'btn2 school-error-page-previous', disabled: current === 1, onclick: () => turn(-1) }, 'Trang trước'), h('span', { 'aria-label': 'Trang danh sách học sinh' }, `${current} / ${page.pages}`), h('button', { type: 'button', class: 'btn2 school-error-page-next', disabled: current === page.pages, onclick: () => turn(1) }, 'Trang sau')));
      results.replaceChildren(page.total ? h('div', { class: 'school-error-students-table-wrap' }, h('table', { class: 'school-error-students-table' }, h('caption', { class: 'school-sr-only' }, `Học sinh gặp lỗi ${criterion.error} trong ${report.scope.prose}`),
        h('thead', {}, h('tr', {}, ['Học sinh', 'Lớp', 'Điểm ' + window.ICanSchoolService.skills[criterion.skill], 'Báo cáo cá nhân'].map(label => h('th', { scope: 'col' }, label)))), h('tbody', {}, rows))) :
        h('div', { class: 'school-error-students-empty' }, window.ICanPeri.figure(h, 'think', { decorative: true }), h('p', {}, students.length ? 'Chưa tìm thấy học sinh khớp với từ khóa trong nhóm gặp lỗi này, thầy cô có thể thử tên hoặc lớp khác.' : 'Chưa có học sinh nào được ghi nhận gặp lỗi này trong phạm vi đang chọn.'), students.length ? h('button', { type: 'button', class: 'btn2', onclick: () => { search.value = ''; current = 1; draw(true); search.focus(); } }, 'Xóa từ khóa tìm kiếm') : null), pager);
    }
    function turn(delta) {
      current += delta; draw(true);
      const next = results.querySelector(delta > 0 ? '.school-error-page-next' : '.school-error-page-previous');
      const previous = results.querySelector(delta > 0 ? '.school-error-page-previous' : '.school-error-page-next');
      (next.disabled ? previous : next).focus({ preventScroll: true });
    }
    const node = h('section', { class: 'school-error-students', id: 'school-error-students', 'aria-labelledby': 'school-error-students-title' },
      h('div', { class: 'school-error-students-heading' }, window.ICanPeri.figure(h, 'wave', { decorative: true }), h('div', {}, h('span', { class: 'school-insight-eyebrow' }, 'TỪ MỘT BIỂU HIỆN ĐẾN TỪNG HỌC SINH'), h('h6', { id: 'school-error-students-title', tabindex: '-1' }, `${students.length} học sinh cần đồng hành ở lỗi này`), h('p', { class: 'school-error-students-context' }, criterion.error), h('p', {}, `Danh sách thuộc ${report.scope.prose}, gồm đúng những học sinh có minh chứng khớp với biểu hiện trên. Thầy cô chọn tên hoặc Xem báo cáo để tìm hiểu từng em.`))),
      h('div', { class: 'school-error-students-tools' }, h('div', {}, h('label', { for: search.id }, 'Tìm trong danh sách gặp lỗi'), search), h('a', { class: 'btn btn2', href: links().href({ ...report.scope, focus: 'skills' }) }, 'Đóng danh sách')),
      results);
    draw();
    return node;
  }
  window.ICanSchoolErrorStudents = { create };
})();
