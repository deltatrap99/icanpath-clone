/* Browser-local services for the independent ICan Path clone. */
(function () {
  'use strict';
  const KEY = 'icanpath_clone_v1';
  const date = '2026-11-17';
  const uid = (prefix = 'id') => prefix + '-' + crypto.randomUUID().slice(0, 8);
  const schools = [
    { id: 'GE001', name: 'Galaxy Education', province_code: 'P01', province: 'Hà Nội', ward: 'Cầu Giấy', ward_name: 'Cầu Giấy', ownership: 'private', specialized: false, program: 'enhanced', verified: true, report_token: 'demo-school' },
    { id: 'GE002', name: 'THCS Nguyễn Du (Demo)', province_code: 'P27', province: 'TP. Hồ Chí Minh', ward: 'Bến Thành', ward_name: 'Bến Thành', ownership: 'public', specialized: false, program: 'standard', verified: true, report_token: 'demo-school-2' },
    { id: 'GE003', name: 'Tiểu học Ngôi Sao (Demo)', province_code: 'P21', province: 'Đà Nẵng', ward: 'Hải Châu', ward_name: 'Hải Châu', ownership: 'private', specialized: false, program: 'international', verified: true, report_token: 'demo-school-3' },
  ];
  const campaigns = [
    { id: 'CP001', school_id: 'GE001', school_name: schools[0].name, test_date: '2026-10-29', grades: [3, 4, 5, 6, 7, 8, 9, 10, 11], join_code: 'E8YYZD', status: 'open', teacher: 'Giáo viên GE', ge_staff: 'GE Demo', name: 'Đánh giá năng lực tiếng Anh' },
    { id: 'CP002', school_id: 'GE002', school_name: schools[1].name, test_date: date, grades: [6, 7, 8, 9], join_code: 'DEMO01', status: 'open', teacher: 'Giáo viên mẫu', ge_staff: 'GE Demo', name: 'Kiểm tra xếp lớp' },
    { id: 'CP003', school_id: 'GE003', school_name: schools[2].name, test_date: date, grades: [3, 4, 5], join_code: 'K7P2QX', status: 'open', teacher: 'Giáo viên mẫu', ge_staff: 'GE Demo', name: 'Khám phá tiếng Anh' },
  ];
  function seed() {
    const sessions = {};
    const fixtures = [['Minh Anh', 8, '8A1', 0], ['Gia Huy', 7, '7A2', 0], ['Bảo Ngọc', 10, '10A1', 0], ['Quang Minh', 6, '6B1', 1], ['Hà Linh', 9, '9A1', 1], ['Tuệ An', 4, '4A', 2], ['Đức Anh', 5, '5B', 2], ['Khánh Vy', 11, '11A2', 0]];
    fixtures.forEach(([name, grade, cls, cidx], i) => {
      const c = campaigns[cidx];
      const token = i ? 'session-demo-' + i : 'session-demo';
      sessions[token] = {
        token, student: { student_id: 'HS' + String(i + 1).padStart(3, '0'), full_name: name + ' (Demo)', grade, class_name: cls, school_id: c.school_id, campaign_id: c.id, school_name: c.school_name, test_date: c.test_date },
        profile: { score: 7 + i % 3, self: { L: 3, R: 3, S: 2, W: 2 }, goals: ['school', 'communication'], hours_out: '1-3', consent_marketing: i % 2 === 0 },
        status: i === 7 ? 'active' : 'completed', section: i === 7 ? 'R' : 'done', result_token: i ? 'demo-result-' + i : 'demo-result', answers: [], speaking: [], sample: true,
        demo_scores: [
          { U: 2.8, L: 3.1, R: 2.7, S: 2.4, W: 2.0 },
          { U: 2.1, L: 2.3, R: 1.9, S: 1.7, W: 1.5 },
          { U: 3.8, L: 4.0, R: 3.8, S: 3.4, W: 3.2 },
          { U: 1.3, L: 1.5, R: 1.4, S: 1.0, W: 0.9 },
          { U: 3.0, L: 3.2, R: 3.0, S: 2.6, W: 2.4 },
          { U: 0.8, L: 1.1, R: 0.9, S: 0.7, W: 0.5 },
          { U: 1.6, L: 1.9, R: 1.7, S: 1.4, W: 1.1 },
          { U: 3.7, L: 3.6, R: 3.7, S: 3.3, W: 3.1 },
        ][i],
      };
    });
    return { version: 1, schools, campaigns, sessions, results: {}, users: [
      { id: 'u-admin', username: 'admin', display_name: 'Quản trị viên Demo', role: 'admin', password: 'demo123', active: true, last_login_at: null },
      { id: 'u-staff', username: 'staff', display_name: 'GE Demo', role: 'staff', password: 'demo123', active: true, last_login_at: null },
      { id: 'u-ge', username: 'GE Demo', display_name: 'GE Demo', role: 'staff', password: 'demo123', active: true, last_login_at: null },
    ], me: null, audit: [], shared_login: false };
  }
  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch { /* reset malformed browser storage */ }
  if (!db || db.version !== 1) db = seed();
  const D = window.ICanDemo = {
    db, uid,
    save() { localStorage.setItem(KEY, JSON.stringify(D.db)); },
    ok(data, status = 200) { return { status, data }; },
    fail(status, message, code = 'demo_error', details = {}) {
      const error = new Error(message);
      Object.assign(error, { status, code, data: { error: code, message, ...details } });
      throw error;
    },
    listStudents() {
      let updated = false;
      if (D.makeResult) for (const s of Object.values(D.db.sessions)) {
        if (s.status === 'completed' && s.sample && !D.db.results[s.result_token]) {
          D.db.results[s.result_token] = D.makeResult(s); updated = true;
        }
      }
      if (updated) D.save();
      return Object.values(D.db.sessions).map(s => {
        const r = D.db.results[s.result_token];
        return { ...s.student, session_id: s.token, status: s.status, section: s.section, result_token: s.result_token,
          cefr_overall: r?.overall?.cefr || (s.status === 'completed' ? (s.student.grade < 6 ? 'A1' : s.student.grade < 9 ? 'A2' : 'B1') : null),
          confidence_level: r?.confidence?.level || (s.status === 'completed' ? 'medium' : null), confidence_score: r?.confidence?.score ?? (s.sample && s.status === 'completed' ? 75 : null),
          engagement_score: s.sample && s.status === 'completed' ? 85 : null, quality: {}, profile: s.profile };
      });
    },
    async request(path, options = {}) {
      for (const handler of [D.assessmentRequest, D.staffRequest]) {
        if (!handler) continue;
        const result = await handler(path, options);
        if (result !== undefined) return result;
      }
      return D.fail(404, 'Không tìm thấy chức năng này.', 'not_found');
    },
  };
  D.save();
  if (!localStorage.getItem('ip_result')) localStorage.setItem('ip_result', 'demo-result');
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href="/api/staff/export.csv"]');
    if (!link) return;
    event.preventDefault();
    if (!D.csvExport) return;
    const text = D.csvExport();
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'icanpath-bao-cao-demo.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
