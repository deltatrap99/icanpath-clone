/* The school portal is isolated from the GE console and public aggregate report links. */
(() => {
  'use strict';
  const service = () => window.ICanSchoolService;
  function href({ grade = '', class_name = '', skill = 'overall', focus = '', error = '', student = '', search = '', page = 1, view = '' } = {}) {
    if (view === 'teachers') return '#/school-portal?view=teachers';
    const query = new URLSearchParams();
    if (grade) query.set('grade', grade);
    if (class_name) query.set('class', class_name);
    if (skill !== 'overall') query.set('skill', skill);
    if (error) query.set('error', error);
    if (student) query.set('student', student);
    if (error && search) query.set('search', search);
    if (error && Number.isInteger(Number(page)) && Number(page) > 1) query.set('page', String(page));
    if (['skills', 'error', 'rankings'].includes(focus)) query.set('focus', focus);
    return '#/school-portal' + (query.size ? '?' + query.toString() : '');
  }
  function login(h, mount, onRoute) {
    const error = h('p', { class: 'school-login-error', role: 'alert', id: 'school-login-error', hidden: true });
    const username = h('input', { id: 'school-login-username', type: 'text', autocomplete: 'username', autocapitalize: 'none', spellcheck: 'false', required: true, placeholder: 'Nhập tên đăng nhập', 'aria-describedby': 'school-login-help school-login-error' });
    const password = h('input', { id: 'school-login-password', type: 'password', autocomplete: 'current-password', required: true, placeholder: 'Nhập mật khẩu', 'aria-describedby': 'school-login-error' });
    const submit = event => {
      event.preventDefault();
      let viewer;
      try {
        viewer = service().login(username.value, password.value);
      } catch (cause) {
        error.hidden = false;
        error.textContent = cause.code === 'invalid_credentials' ? cause.message : 'Trình duyệt chưa lưu được phiên đăng nhập, thầy cô vui lòng kiểm tra quyền lưu dữ liệu rồi thử lại.';
        username.setAttribute('aria-invalid', 'true');
        password.setAttribute('aria-invalid', 'true');
        username.focus();
        return;
      }
      const next = viewer.role === 'teacher' ? href(viewer) : location.hash;
      if (location.hash === next) onRoute();
      else location.replace(next);
    };
    mount(h('div', { class: 'school-portal school-login-layout' },
      h('section', { class: 'school-login-story', 'aria-labelledby': 'school-login-title' }, h('span', { class: 'identity-kicker' }, 'KHÔNG GIAN DÀNH CHO NHÀ TRƯỜNG'), h('h1', { id: 'school-login-title' }, 'Hiểu từng lớp học,', h('br'), 'đồng hành với từng em.'), h('p', {}, 'Nhà trường theo dõi kết quả theo khối và lớp. Giáo viên xem báo cáo của lớp mình phụ trách để chọn cách hỗ trợ phù hợp cho học sinh.'),
        h('div', { class: 'school-login-visual' }, window.ICanPeri.figure(h, 'wave', { class: 'school-login-peri', decorative: true }), h('div', { class: 'school-login-preview' }, window.ICanIdentity.icon('chart', 24), h('strong', {}, 'Một bức tranh, nhiều góc nhìn'), h('span', {}, 'Toàn trường, khối học, lớp học'))),
        h('p', { class: 'school-login-note' }, 'Khi hiểu rõ điểm khởi đầu, nhà trường có thêm cơ sở để cùng học sinh lựa chọn bước học phù hợp.')),
      h('section', { class: 'school-panel school-login-form-panel', 'aria-labelledby': 'school-signin-title' }, h('span', { class: 'school-school-icon' }, window.ICanIdentity.icon('school', 29)), h('h2', { id: 'school-signin-title' }, 'Đăng nhập'), h('p', { id: 'school-login-help' }, 'Thầy cô có thể dùng tài khoản nhà trường hoặc tài khoản giáo viên được cấp.'),
        h('form', { onsubmit: submit }, h('label', { for: username.id }, 'Tên đăng nhập'), username, h('label', { for: password.id }, 'Mật khẩu'), password, error, h('button', { type: 'submit', class: 'school-login-submit' }, 'Đăng nhập', window.ICanIdentity.icon('arrow', 20))),
        h('p', { class: 'school-login-note' }, 'Nếu cần hỗ trợ đăng nhập, thầy cô vui lòng liên hệ người phụ trách ICANPath.'))));
  }
  function accountActions(h, label, logout) {
    return h('div', { class: 'school-dashboard-account' },
      h('span', { class: 'school-data-badge' }, label),
      h('button', { type: 'button', class: 'btn2', onclick: logout }, 'Đăng xuất'));
  }
  function renderTeachers(h, mount, viewer, logout) {
    const rows = service().teacherAccounts().map(teacher => h('tr', {},
      h('th', { scope: 'row' }, h('code', {}, teacher.username)),
      h('td', {}, 'Lớp ' + teacher.class_name),
      h('td', {}, h('details', { class: 'school-teacher-password' },
        h('summary', { 'aria-label': 'Xem mật khẩu cho ' + teacher.username }, 'Xem mật khẩu', window.ICanIdentity.icon('chevron', 14)),
        h('code', {}, teacher.password))),
      h('td', {}, h('a', { href: href(teacher), 'aria-label': 'Xem báo cáo lớp ' + teacher.class_name }, 'Xem báo cáo'))));
    mount(h('div', { class: 'school-portal school-teacher-directory' },
      h('header', { class: 'school-dashboard-header' },
        h('div', {}, h('span', { class: 'identity-kicker' }, 'KHÔNG GIAN NHÀ TRƯỜNG'), h('h1', {}, 'Tài khoản giáo viên'), h('p', {}, viewer.school.name)),
        accountActions(h, 'Quyền nhà trường', logout)),
      h('div', { class: 'school-directory-back' }, h('a', { href: href() }, 'Về báo cáo toàn trường')),
      h('section', { class: 'school-panel', 'aria-labelledby': 'school-teacher-directory-title' },
        h('div', { class: 'school-panel-heading' }, h('h2', { id: 'school-teacher-directory-title' }, 'Tài khoản theo lớp'), h('p', {}, 'Gửi thông tin đăng nhập cho giáo viên phụ trách từng lớp.')),
        h('table', { class: 'school-teacher-table', 'aria-labelledby': 'school-teacher-directory-title' },
          h('thead', {}, h('tr', {}, ['Tên đăng nhập', 'Lớp phụ trách', 'Mật khẩu', 'Báo cáo lớp'].map(label => h('th', { scope: 'col' }, label)))),
          h('tbody', {}, rows)))));
  }
  function filters(h, report, teacher, setScope) {
    const scope = report.scope;
    const skill = h('select', { id: 'school-skill', onchange: event => setScope({ skill: event.target.value }) },
      Object.entries(service().skills).map(([value, label]) => h('option', { value, selected: scope.skill === value }, value === 'overall' ? 'Trình độ tổng thể' : 'Kỹ năng ' + label.toLowerCase())));
    const skillField = h('div', {}, h('label', { for: skill.id }, 'Kết quả hiển thị'), skill);
    if (teacher) return h('section', { class: 'school-filter-panel school-teacher-filter', 'aria-labelledby': 'school-class-results-title' },
      h('div', { class: 'school-teacher-results-heading' }, h('h2', { id: 'school-class-results-title' }, 'Tổng quan lớp học')),
      skillField);
    const grade = h('select', { id: 'school-grade', onchange: event => setScope({ grade: event.target.value, class_name: '' }) },
      h('option', { value: '' }, 'Tất cả khối'), report.grades.map(value => h('option', { value, selected: scope.grade === value }, 'Khối ' + value)));
    const classroom = h('select', { id: 'school-class', onchange: event => setScope({ class_name: event.target.value, grade: event.target.value ? event.target.value.slice(0, 2) : scope.grade }) },
      h('option', { value: '' }, 'Tất cả lớp'), report.classrooms.map(value => h('option', { value, selected: scope.class_name === value }, 'Lớp ' + value)));
    return h('section', { class: 'school-filter-panel', 'aria-label': 'Chọn phạm vi báo cáo' },
      h('div', {}, h('label', { for: grade.id }, 'Khối học'), grade),
      h('div', {}, h('label', { for: classroom.id }, 'Lớp học'), classroom),
      skillField, h('a', { class: 'btn btn2 school-reset', href: href() }, 'Về toàn trường'));
  }
  function render({ h, mount, query, onRoute, registerCleanup }) {
    const viewer = service().session();
    if (!viewer) return login(h, mount, onRoute);
    const teacher = viewer.role === 'teacher';
    const logout = () => { service().logout(); onRoute(); };
    const className = query.get('class') || '';
    const requestedScope = { grade: query.get('grade') || (className ? className.slice(0, 2) : ''), class_name: className, skill: query.get('skill') || 'overall' };
    const errorId = query.get('error') || '';
    let report, errorData;
    try {
      if (query.get('view') === 'teachers') return renderTeachers(h, mount, viewer, logout);
      if (query.get('student')) {
        mount(window.ICanSchoolStudentReport.render(h, service().studentReport(requestedScope, query.get('student'), errorId), query));
        const heading = document.querySelector('.school-personal-hero h1'); heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
        return;
      }
      errorData = errorId ? service().errorReport(requestedScope, errorId) : null;
      report = errorData?.report || service().report(requestedScope);
    }
    catch (cause) {
      return mount(h('div', { class: 'school-panel school-portal school-error' },
        h('h1', {}, 'Chưa mở được báo cáo theo lựa chọn này'), h('p', {}, cause.message),
        h('a', { class: 'btn', href: href(viewer) }, teacher ? 'Về báo cáo lớp ' + viewer.class_name : 'Xem lại toàn trường')));
    }
    const scope = report.scope;
    const setScope = update => { location.hash = href({ ...scope, ...update }); };
    const focusRoster = () => { const target = document.getElementById('school-error-students-title'); target.scrollIntoView({ block: 'start' }); target.focus({ preventScroll: true }); };
    const openError = item => {
      const next = href({ ...scope, skill: item.skill, error: item.id, focus: 'error' });
      if (location.hash === next) focusRoster(); else location.hash = next;
    };
    const focusSkills = () => {
      const section = document.getElementById('school-insights');
      section.scrollIntoView({ block: 'start' });
      section.querySelector('.school-insight-skill.selected').focus({ preventScroll: true });
    };
    const revisitSkills = event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || location.hash !== href({ ...scope, focus: 'skills' })) return;
      event.preventDefault(); focusSkills();
    };
    const chart = window.ICanSchoolCharts.levels(h, report, level => rankings.selectLevel(level));
    const rankings = window.ICanSchoolRankings.create(h, report, { onLevelChange: chart.select, registerCleanup });
    mount(h('div', { class: 'school-portal school-dashboard' },
      h('section', { class: 'school-dashboard-header' },
        h('div', {}, h('span', { class: 'identity-kicker' }, teacher ? 'KHÔNG GIAN GIÁO VIÊN' : 'KHÔNG GIAN NHÀ TRƯỜNG'),
          h('h1', {}, teacher ? 'Báo cáo lớp ' + scope.class_name : report.school.name),
          h('p', {}, teacher ? report.school.name : 'Thầy cô cùng nhìn rõ bức tranh năng lực tiếng Anh, để đồng hành với từng lớp học.')),
        accountActions(h, teacher ? viewer.name + ' (' + viewer.account + ')' : 'Báo cáo nhà trường', logout)),
      h('div', { class: 'school-context-line' },
        h('span', {}, window.ICanIdentity.icon('calendar', 18), `Năm học ${report.school.year}`), h('span', {}, `Đợt đánh giá ${report.school.date}`),
        h('a', { href: href({ ...scope, focus: 'skills' }), onclick: revisitSkills }, 'Phân tích từng kỹ năng', window.ICanIdentity.icon('chart', 17)),
        teacher ? null : h('a', { href: href({ view: 'teachers' }) }, 'Tài khoản giáo viên'),
        teacher ? null : h('a', { href: href({ grade: 10, class_name: '10 Lí' }) }, 'Xem nhanh lớp 10 Lí', window.ICanIdentity.icon('arrow', 17))),
      filters(h, report, teacher, setScope),
      teacher ? null : h('div', { class: 'school-scope-heading', 'aria-live': 'polite' }, h('h2', {}, scope.label), h('p', {}, `Phạm vi này có ${report.summary.total} học sinh thuộc ${report.summary.classes} lớp, đang xem kết quả ${service().skills[scope.skill].toLowerCase()}.`)),
      window.ICanSchoolCharts.metrics(h, report), h('div', { class: 'school-charts-grid' }, chart.node, window.ICanSchoolCharts.histogram(h, report)),
      window.ICanSchoolInsights.render(h, report, { onSelect: key => setScope({ skill: key, focus: 'skills' }), onError: openError, selectedError: errorId, roster: errorData ? window.ICanSchoolErrorStudents.create(h, errorData, query) : null }),
      rankings.node, h('p', { class: 'school-data-note' }, 'Điểm tổng thể là trung bình của bốn kỹ năng trong báo cáo. Thầy cô có thể chọn tên học sinh để xem kết quả Nghe, Đọc, Nói và Viết.')));
    if (query.get('focus') === 'skills') focusSkills();
    if (query.get('focus') === 'error' && errorData) focusRoster();
    if (query.get('focus') === 'rankings') { const target = document.getElementById('school-ranking-title'); target.setAttribute('tabindex', '-1'); target.scrollIntoView({ block: 'start' }); target.focus({ preventScroll: true }); }
  }
  window.ICanSchoolPortal = { render, href };
})();
