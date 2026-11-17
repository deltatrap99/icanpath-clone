/* A separate, explicitly illustrative school cohort. Assessment and GE data are never rewritten. */
(() => {
  'use strict';
  const SCHOOL = { id: 'HY-SCHOOL-DEMO', name: 'THPT Chuyên Hưng Yên', year: '2026-2027', date: '17/11/2026' };
  const SESSION_KEY = 'ip_school_session_v1';
  const LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
  const SKILLS = { overall: 'Tổng thể', L: 'Nghe', R: 'Đọc', S: 'Nói', W: 'Viết' };
  const names = ['Bồ Quốc Tuấn', 'Nguyễn Minh Anh', 'Trần Khánh Linh', 'Lê Hải Đăng', 'Phạm Ngọc Hà', 'Vũ Đức Minh', 'Đỗ Phương Anh', 'Hoàng Gia Bảo', 'Nguyễn Thảo Vy', 'Trần Nhật Nam', 'Lê Thu Trang', 'Phạm Quang Huy', 'Đặng Ngọc Mai', 'Vũ Hoàng Long', 'Nguyễn Thanh Tâm', 'Trần Bảo Ngọc', 'Đỗ Minh Khang', 'Lê Khánh Chi', 'Hoàng Tuấn Kiệt', 'Phạm Hà My', 'Nguyễn Anh Quân', 'Trần Phương Thảo', 'Vũ Minh Đức', 'Lê Ngọc Hân', 'Đặng Thành Đạt', 'Đỗ Khánh Ngân', 'Phạm Việt Anh', 'Nguyễn Mai Anh', 'Trần Duy Khánh', 'Hoàng Minh Châu', 'Lê Đức Anh', 'Vũ Thanh Trúc'];
  const classroomNames = [10, 11, 12].flatMap(grade => ['Lí', 'Toán', 'Anh'].map(subject => `${grade} ${subject}`));
  const round = value => Math.round(value * 10) / 10;
  // These bands generate coherent fixture labels, not a scoring rule for real assessments.
  const fixtureLevel = score => LEVELS[[20, 40, 55, 70, 85].filter(cut => score >= cut).length];
  const cohort = classroomNames.flatMap((className, classIndex) => names.map((name, index) => {
    const base = index === 31 ? 17 : index === 30 ? 29 : 43 + ((index * 17 + classIndex * 11) % 44);
    const skills = Object.fromEntries(['L', 'R', 'S', 'W'].map((skill, skillIndex) => {
      const score = classIndex === 0 && index === 0 ? [98, 97, 96, 96][skillIndex] : round(Math.max(8, Math.min(92, base + ((index * 3 + skillIndex * 5 + classIndex) % 15) - 7 + (index % 4) / 10)));
      return [skill, { score, cefr: fixtureLevel(score) }];
    }));
    const score = round(Object.values(skills).reduce((sum, skill) => sum + skill.score, 0) / 4);
    return { id: `HY-${classIndex + 1}-${String(index + 1).padStart(3, '0')}`, school_id: SCHOOL.id, name: classIndex === 0 ? name : index === 0 ? ['Nguyễn Bảo An', 'Trần Minh Phúc', 'Lê Nhật Anh', 'Phạm Khánh Hòa', 'Đặng Minh Tuệ', 'Vũ Quỳnh Anh', 'Đỗ Gia Huy', 'Hoàng Thanh Bình'][classIndex - 1] : name, grade: Number(className.slice(0, 2)), class_name: className, skills, overall: { score, cefr: fixtureLevel(score) } };
  }));
  const clone = value => JSON.parse(JSON.stringify(value));
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  function fail(message, code = 'invalid_request') { throw Object.assign(new Error(message), { code }); }
  function session() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (saved?.school_id !== SCHOOL.id || saved.account !== 'chuyenhungyen' || !Number.isFinite(saved.expires_at) || saved.expires_at <= Date.now() || saved.expires_at > Date.now() + 8 * 3600000) return null;
      return { school: { ...SCHOOL }, name: 'Tài khoản nhà trường', account: saved.account };
    } catch { return null; }
  }
  function login(username, password) {
    if (String(username).trim().toLowerCase() !== 'chuyenhungyen' || password !== 'demo123') fail('Tên đăng nhập hoặc mật khẩu chưa đúng, thầy cô vui lòng kiểm tra và thử lại.', 'invalid_credentials');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ school_id: SCHOOL.id, account: 'chuyenhungyen', expires_at: Date.now() + 8 * 3600000 }));
    return session();
  }
  function logout() { sessionStorage.removeItem(SESSION_KEY); }
  function report({ grade = '', class_name = '', skill = 'overall', school_id = SCHOOL.id } = {}) {
    if (!session()) fail('Thầy cô vui lòng đăng nhập nhà trường để xem báo cáo.', 'unauthorized');
    if (school_id !== SCHOOL.id) fail('Tài khoản này chỉ xem được dữ liệu của trường được cấp quyền.', 'forbidden');
    if ((grade !== '' && ![10, 11, 12].includes(Number(grade))) || !SKILLS[skill]) fail('Phạm vi hoặc kỹ năng chưa hợp lệ, thầy cô vui lòng chọn lại bộ lọc.');
    if (class_name && (!classroomNames.includes(class_name) || (grade !== '' && !class_name.startsWith(String(grade) + ' ')))) fail('Lớp học chưa thuộc khối đã chọn, thầy cô vui lòng chọn lại lớp.');
    const selected = clone(cohort.filter(student => (!grade || student.grade === Number(grade)) && (!class_name || student.class_name === class_name)));
    selected.sort((a, b) => (skill === 'overall' ? b.overall.score - a.overall.score : b.skills[skill].score - a.skills[skill].score) || a.name.localeCompare(b.name, 'vi') || a.id.localeCompare(b.id));
    let lastScore, rank = 0;
    const students = selected.map((student, index) => {
      const value = skill === 'overall' ? student.overall : student.skills[skill];
      if (value.score !== lastScore) rank = index + 1;
      lastScore = value.score;
      return { ...student, score: value.score, cefr: value.cefr, rank };
    });
    const levels = LEVELS.map(level => ({ level, count: students.filter(student => student.cefr === level).length }));
    const histogram = [0, 20, 40, 60, 80].map(low => ({ low, high: low + 20, count: students.filter(student => student.score >= low && (low === 80 ? student.score <= 100 : student.score < low + 20)).length }));
    const popular = [...levels].sort((a, b) => b.count - a.count || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))[0];
    const atB1 = students.filter(student => LEVELS.indexOf(student.cefr) >= 3).length;
    return { school: { ...SCHOOL }, scope: { grade: grade ? Number(grade) : null, class_name, skill, prose: class_name ? 'lớp ' + class_name : grade ? 'khối ' + grade : 'toàn trường', label: class_name ? 'Lớp ' + class_name : grade ? 'Khối ' + grade : 'Toàn trường' }, grades: [10, 11, 12], classrooms: classroomNames.filter(name => !grade || name.startsWith(String(grade) + ' ')), summary: { total: students.length, average: round(students.reduce((sum, student) => sum + student.score, 0) / (students.length || 1)), popular, at_b1: atB1, at_b1_percent: round(atB1 * 100 / (students.length || 1)), classes: new Set(students.map(student => student.class_name)).size }, levels, histogram, students };
  }
  function page(students, { search = '', level = '', current = 1, size = 10 } = {}) {
    const term = normalize(search);
    const filtered = students.filter(student => (!level || student.cefr === level) && (!term || normalize(student.name + ' ' + student.class_name).includes(term)));
    const pageSize = [10, 20, 50].includes(Number(size)) ? Number(size) : 10;
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageNumber = Math.min(pages, Math.max(1, Math.floor(Number(current) || 1)));
    const start = (pageNumber - 1) * pageSize;
    return { students: filtered.slice(start, start + pageSize), total: filtered.length, pages, current: pageNumber, start: filtered.length ? start + 1 : 0, end: Math.min(start + pageSize, filtered.length) };
  }
  window.ICanSchoolService = { login, logout, session, report, page, skills: { ...SKILLS }, levels: [...LEVELS] };
})();
