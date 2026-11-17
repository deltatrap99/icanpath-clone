/* The school portal is isolated from the GE console and public aggregate report links. */
(() => {
  'use strict';
  const service = () => window.ICanSchoolService;
  function href({ grade = '', class_name = '', skill = 'overall' } = {}) {
    const query = new URLSearchParams();
    if (grade) query.set('grade', grade);
    if (class_name) query.set('class', class_name);
    if (skill !== 'overall') query.set('skill', skill);
    return '#/school-portal' + (query.size ? '?' + query.toString() : '');
  }
  function login(h, mount, onRoute) {
    const error = h('p', { class: 'school-login-error', role: 'alert', id: 'school-login-error', hidden: true });
    const username = h('input', { id: 'school-login-username', type: 'text', autocomplete: 'username', placeholder: 'Tên đăng nhập nhà trường', 'aria-describedby': 'school-login-help school-login-error' });
    const password = h('input', { id: 'school-login-password', type: 'password', autocomplete: 'current-password', placeholder: 'Mật khẩu của nhà trường', 'aria-describedby': 'school-login-error' });
    const submit = event => {
      event.preventDefault();
      try { service().login(username.value, password.value); onRoute(); }
      catch (cause) { error.hidden = false; error.textContent = cause.code === 'invalid_credentials' ? cause.message : 'Trình duyệt chưa lưu được phiên đăng nhập, thầy cô vui lòng kiểm tra quyền lưu dữ liệu rồi thử lại.'; username.setAttribute('aria-invalid', 'true'); password.setAttribute('aria-invalid', 'true'); username.focus(); }
    };
    const fillDemo = () => { username.value = 'chuyenhungyen'; password.value = 'demo123'; error.hidden = true; username.removeAttribute('aria-invalid'); password.removeAttribute('aria-invalid'); password.focus(); };
    mount(h('div', { class: 'school-portal school-login-layout' },
      h('section', { class: 'school-login-story', 'aria-labelledby': 'school-login-title' }, h('span', { class: 'identity-kicker' }, 'KHÔNG GIAN DÀNH CHO NHÀ TRƯỜNG'), h('h1', { id: 'school-login-title' }, 'Hiểu từng lớp học,', h('br'), 'đồng hành với từng em.'), h('p', {}, 'Thầy cô có thể nhìn lại năng lực tiếng Anh của toàn trường, chọn từng khối, từng lớp và tìm hiểu kết quả của mỗi học sinh.'),
        h('div', { class: 'school-login-visual' }, window.ICanPeri.figure(h, 'wave', { class: 'school-login-peri', decorative: true }), h('div', { class: 'school-login-preview' }, window.ICanIdentity.icon('chart', 24), h('strong', {}, 'Một bức tranh, nhiều góc nhìn'), h('span', {}, 'Toàn trường, khối học, lớp học'))),
        h('p', { class: 'school-login-note' }, 'Khi hiểu rõ điểm khởi đầu, nhà trường có thêm cơ sở để cùng học sinh lựa chọn bước học phù hợp.')),
      h('section', { class: 'school-panel school-login-form-panel', 'aria-labelledby': 'school-signin-title' }, h('span', { class: 'school-school-icon' }, window.ICanIdentity.icon('school', 29)), h('h2', { id: 'school-signin-title' }, 'Đăng nhập nhà trường'), h('p', { id: 'school-login-help' }, 'Chào mừng thầy cô đến với không gian của THPT Chuyên Hưng Yên.'),
        h('form', { onsubmit: submit }, h('label', { for: username.id }, 'Tên đăng nhập'), username, h('label', { for: password.id }, 'Mật khẩu'), password, error, h('button', { type: 'submit', class: 'school-login-submit' }, 'Đăng nhập nhà trường', window.ICanIdentity.icon('arrow', 20))),
        h('div', { class: 'school-demo-account' }, h('span', { class: 'school-data-badge' }, 'Tài khoản trải nghiệm'), h('p', {}, 'Dữ liệu minh họa gồm 288 học sinh, trong đó lớp 10 Lí có 32 học sinh để thầy cô khám phá các báo cáo.'), h('dl', {}, h('div', {}, h('dt', {}, 'Tài khoản'), h('dd', {}, h('code', {}, 'chuyenhungyen'))), h('div', {}, h('dt', {}, 'Mật khẩu'), h('dd', {}, h('code', {}, 'demo123')))), h('button', { type: 'button', class: 'btn2', onclick: fillDemo }, 'Điền tài khoản trải nghiệm')))));
  }
  function render({ h, mount, query, onRoute, registerCleanup }) {
    if (!service().session()) return login(h, mount, onRoute);
    const className = query.get('class') || '';
    const scope = { grade: query.get('grade') || (className ? className.slice(0, 2) : ''), class_name: className, skill: query.get('skill') || 'overall' };
    let report;
    try { report = service().report(scope); }
    catch (cause) { return mount(h('div', { class: 'school-panel school-portal school-error' }, h('h1', {}, 'Chưa mở được báo cáo theo lựa chọn này'), h('p', {}, cause.message), h('a', { class: 'btn', href: href() }, 'Xem lại toàn trường'))); }
    const logout = () => { service().logout(); onRoute(); };
    const setScope = update => { location.hash = href({ ...scope, ...update }); };
    const grade = h('select', { id: 'school-grade', onchange: event => setScope({ grade: event.target.value, class_name: '' }) }, h('option', { value: '' }, 'Tất cả khối'), report.grades.map(value => h('option', { value, selected: Number(scope.grade) === value }, 'Khối ' + value)));
    const classroom = h('select', { id: 'school-class', onchange: event => setScope({ class_name: event.target.value, grade: event.target.value ? event.target.value.slice(0, 2) : scope.grade }) }, h('option', { value: '' }, 'Tất cả lớp'), report.classrooms.map(value => h('option', { value, selected: scope.class_name === value }, 'Lớp ' + value)));
    const skill = h('select', { id: 'school-skill', onchange: event => setScope({ skill: event.target.value }) }, Object.entries(service().skills).map(([value, label]) => h('option', { value, selected: scope.skill === value }, value === 'overall' ? 'Trình độ tổng thể' : 'Kỹ năng ' + label.toLowerCase())));
    const chart = window.ICanSchoolCharts.levels(h, report, level => rankings.selectLevel(level));
    const rankings = window.ICanSchoolRankings.create(h, report, { onLevelChange: chart.select, registerCleanup });
    mount(h('div', { class: 'school-portal school-dashboard' },
      h('section', { class: 'school-dashboard-header' }, h('div', {}, h('span', { class: 'identity-kicker' }, 'KHÔNG GIAN NHÀ TRƯỜNG'), h('h1', {}, report.school.name), h('p', {}, 'Thầy cô cùng nhìn rõ bức tranh năng lực tiếng Anh, để đồng hành với từng lớp học.')), h('div', { class: 'school-dashboard-account' }, h('span', { class: 'school-data-badge' }, 'Dữ liệu minh họa'), h('button', { type: 'button', class: 'btn2', onclick: logout }, 'Đăng xuất'))),
      h('div', { class: 'school-context-line' }, h('span', {}, window.ICanIdentity.icon('calendar', 18), `Năm học ${report.school.year}`), h('span', {}, `Đợt đánh giá ${report.school.date}`), h('a', { href: href({ grade: '10', class_name: '10 Lí' }) }, 'Xem nhanh lớp 10 Lí', window.ICanIdentity.icon('arrow', 17))),
      h('section', { class: 'school-filter-panel', 'aria-label': 'Chọn phạm vi báo cáo' }, h('div', {}, h('label', { for: grade.id }, 'Khối học'), grade), h('div', {}, h('label', { for: classroom.id }, 'Lớp học'), classroom), h('div', {}, h('label', { for: skill.id }, 'Kết quả hiển thị'), skill), h('a', { class: 'btn btn2 school-reset', href: href() }, 'Về toàn trường')),
      h('div', { class: 'school-scope-heading', 'aria-live': 'polite' }, h('h2', {}, report.scope.label), h('p', {}, `Phạm vi này có ${report.summary.total} học sinh thuộc ${report.summary.classes} lớp, đang xem kết quả ${service().skills[scope.skill].toLowerCase()}.`)),
      window.ICanSchoolCharts.metrics(h, report), h('div', { class: 'school-charts-grid' }, chart.node, window.ICanSchoolCharts.histogram(h, report)),
      rankings.node, h('p', { class: 'school-data-note' }, 'Điểm tổng thể là trung bình của bốn kỹ năng trong bộ dữ liệu minh họa. Thầy cô có thể chọn tên học sinh để xem kết quả Nghe, Đọc, Nói và Viết.')));
  }
  window.ICanSchoolPortal = { render, href };
})();
