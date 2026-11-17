/* Local-only staff and administration service for the ICAN Path clone. */
(function registerStaffDemo() {
  'use strict';
  const D = window.ICanDemo;
  if (!D) throw new Error('Load demo-core.js before demo-staff.js');
  const CEFR = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
  const KEYS = ['overall', 'L', 'R', 'S', 'W'];
  const SKILLS = { L: 'Nghe', R: 'Đọc', S: 'Nói', W: 'Viết' };
  const PROGRAMS = ['standard', 'enhanced', 'bilingual', 'international'];
  const FALLBACK_PROVINCES = [
  {
    "code": "P34",
    "name": "An Giang"
  },
  {
    "code": "P16",
    "name": "Bắc Ninh"
  },
  {
    "code": "P11",
    "name": "Cao Bằng"
  },
  {
    "code": "P33",
    "name": "Cà Mau"
  },
  {
    "code": "P30",
    "name": "Cần Thơ"
  },
  {
    "code": "P23",
    "name": "Gia Lai"
  },
  {
    "code": "P02",
    "name": "Huế"
  },
  {
    "code": "P01",
    "name": "Hà Nội"
  },
  {
    "code": "P10",
    "name": "Hà Tĩnh"
  },
  {
    "code": "P17",
    "name": "Hưng Yên"
  },
  {
    "code": "P18",
    "name": "Hải Phòng"
  },
  {
    "code": "P24",
    "name": "Khánh Hòa"
  },
  {
    "code": "P03",
    "name": "Lai Châu"
  },
  {
    "code": "P13",
    "name": "Lào Cai"
  },
  {
    "code": "P25",
    "name": "Lâm Đồng"
  },
  {
    "code": "P06",
    "name": "Lạng Sơn"
  },
  {
    "code": "P09",
    "name": "Nghệ An"
  },
  {
    "code": "P19",
    "name": "Ninh Bình"
  },
  {
    "code": "P15",
    "name": "Phú Thọ"
  },
  {
    "code": "P22",
    "name": "Quảng Ngãi"
  },
  {
    "code": "P07",
    "name": "Quảng Ninh"
  },
  {
    "code": "P20",
    "name": "Quảng Trị"
  },
  {
    "code": "P05",
    "name": "Sơn La"
  },
  {
    "code": "P27",
    "name": "TP. Hồ Chí Minh"
  },
  {
    "code": "P08",
    "name": "Thanh Hóa"
  },
  {
    "code": "P14",
    "name": "Thái Nguyên"
  },
  {
    "code": "P12",
    "name": "Tuyên Quang"
  },
  {
    "code": "P29",
    "name": "Tây Ninh"
  },
  {
    "code": "P31",
    "name": "Vĩnh Long"
  },
  {
    "code": "P04",
    "name": "Điện Biên"
  },
  {
    "code": "P21",
    "name": "Đà Nẵng"
  },
  {
    "code": "P26",
    "name": "Đắk Lắk"
  },
  {
    "code": "P28",
    "name": "Đồng Nai"
  },
  {
    "code": "P32",
    "name": "Đồng Tháp"
  }
];
  const FALLBACK_WARDS = {
    '01': ['Ba Đình', 'Hoàn Kiếm', 'Cầu Giấy', 'Đống Đa', 'Tây Hồ'],
    '79': ['Sài Gòn', 'Bến Thành', 'Tân Định', 'Thủ Đức', 'Bình Thạnh'],
    '48': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Hòa Cường'],
    'P01': ['Ba Đình', 'Hoàn Kiếm', 'Cầu Giấy', 'Đống Đa', 'Tây Hồ'],
    'P27': ['Sài Gòn', 'Bến Thành', 'Tân Định', 'Thủ Đức', 'Bình Thạnh'],
    'P21': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Hòa Cường'],
  };
  const text = (value) => String(value == null ? '' : value).trim();
  const norm = (value) => text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const db = () => D.db;
  const stamp = () => Date.now();
  const num = (value) => value == null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
  const fail = (status, message, code) => D.fail(status, message, code || 'invalid_request');
  function bodyOf(options) {
    if (typeof options.body !== 'string') return options.body || {};
    try { return JSON.parse(options.body); } catch (_) { return fail(400, 'Dữ liệu gửi lên không hợp lệ.', 'invalid_json'); }
  }
  function initCollections() {
    for (const key of ['schools', 'campaigns', 'users', 'audit']) if (!Array.isArray(db()[key])) db()[key] = [];
    for (const key of ['sessions', 'results']) if (!db()[key] || typeof db()[key] !== 'object') db()[key] = {};
  }
  function audit(action, target, detail) {
    db().audit.unshift({ at: stamp(), actor: db().me?.username || db().me?.name || 'demo', action, target: String(target), detail: detail || null });
    db().audit = db().audit.slice(0, 1000);
  }
  function meView(user) {
    return { id: user.id, username: user.username, name: user.name || user.display_name || user.username, role: user.role };
  }
  function auth(admin) {
    const me = db().me;
    if (!me) return fail(401, 'Bạn cần đăng nhập bằng tài khoản dùng thử để tiếp tục sử dụng chức năng này.', 'unauthorized');
    const user = db().users.find((u) => u.id === me.id);
    if (user && (!user.active || user.role !== me.role)) {
      db().me = null; D.save();
      return fail(401, 'Phiên đăng nhập dùng thử của bạn đã kết thúc, bạn hãy đăng nhập lại để tiếp tục.', 'unauthorized');
    }
    if (admin && me.role !== 'admin') return fail(403, 'Chức năng này chỉ dành cho quản trị viên.', 'forbidden');
    return me;
  }
  const publicUser = ({ password, ...user }) => user;
  function provinces() {
    return D.catalog?.provinces || db().catalog?.provinces || FALLBACK_PROVINCES;
  }
  function getSchool(id) {
    const school = db().schools.find((s) => String(s.id) === String(id));
    if (!school) return fail(404, 'Không tìm thấy trường trong dữ liệu demo.', 'school_not_found');
    return school;
  }
  function getCampaign(id) {
    const campaign = db().campaigns.find((c) => String(c.id) === String(id));
    if (!campaign) return fail(404, 'Không tìm thấy đợt kiểm tra.', 'campaign_not_found');
    return campaign;
  }
  function sessionFor(id) {
    return db().sessions[id] || Object.values(db().sessions).find((s) => String(s.id || s.session_id || s.token) === String(id));
  }
  function resultFor(session, row) {
    const token = row?.result_token || session?.result_token;
    const value = token && db().results[token];
    if (value) return value.result || value;
    const studentId = row?.student_id || session?.student?.student_id;
    const valueById = studentId && Object.values(db().results).find((r) => (r.result || r).student?.student_id === studentId);
    return valueById ? valueById.result || valueById : null;
  }
  function rows() {
    return D.listStudents().map((row) => {
      const session = sessionFor(row.session_id || row.token) || Object.values(db().sessions).find((s) => s.student?.student_id === row.student_id);
      const student = session?.student || {};
      const campaignId = row.campaign_id || student.campaign_id || session?.campaign_id;
      const campaign = db().campaigns.find((c) => c.id === campaignId);
      const schoolId = row.school_id || student.school_id || session?.school_id || campaign?.school_id;
      const school = db().schools.find((s) => s.id === schoolId);
      const result = resultFor(session, row);
      const profile = session?.profile || row.profile || {};
      const skillScores = Object.fromEntries(['L', 'R', 'S', 'W'].map((k) => [k, num(result?.skills?.[k]?.theta ?? row.avg?.[k] ?? row[k]) ]));
      return {
        ...student, ...row,
        student_id: row.student_id || student.student_id,
        session_id: row.session_id || session?.id || session?.session_id || session?.token,
        school_id: schoolId, campaign_id: campaignId,
        school_name: school?.name || row.school_name || student.school_name || 'Chưa có trường',
        province: school?.province || school?.province_name || row.province || 'Chưa xác định',
        grade: Number(row.grade || student.grade) || null,
        test_date: row.test_date || student.test_date || campaign?.test_date || '',
        status: row.status || session?.status || 'active',
        section: row.section || session?.section,
        cefr_overall: row.cefr_overall || result?.overall?.cefr || null,
        confidence_level: row.confidence_level || result?.confidence?.level || null,
        confidence_score: row.confidence_score ?? result?.confidence?.score ?? null,
        quality: Object.keys(row.quality || {}).length ? row.quality : result?.quality || result?.confidence?.quality || null,
        engagement_score: row.engagement_score ?? result?.quality?.engagement?.score ?? null,
        _result: result, _profile: profile,
        _scores: { overall: num(result?.overall?.theta ?? row.theta_overall ?? row.avg?.overall), ...skillScores },
        _marketing: row.consent_marketing ?? session?.consent_marketing ?? profile.consent_marketing ?? student.consent_marketing ?? false,
      };
    });
  }
  function tableRow(row) {
    const { _result, _profile, _scores, _marketing, ...visible } = row;
    return visible;
  }
  function uniqueStudents(items) {
    const found = new Map();
    for (const row of items) {
      const key = row.student_id || row.session_id;
      if (!found.has(key) || row.status === 'completed') found.set(key, row);
    }
    return [...found.values()];
  }
  function cefr(theta) {
    return theta == null ? null : CEFR[[0.5, 1.5, 2.5, 3.5, 4.5].filter((cut) => theta >= cut).length];
  }
  function summarize(items) {
    const all = uniqueStudents(items);
    const completed = all.filter((r) => r.status === 'completed');
    const reliable = completed.filter((r) => r.confidence_level !== 'low');
    const avg = Object.fromEntries(KEYS.map((key) => {
      const values = reliable.map((r) => r._scores[key]).filter((v) => v != null);
      return [key, values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100) / 100 : null];
    }));
    const distribution = Object.fromEntries(CEFR.map((level) => [level, 0]));
    reliable.forEach((r) => { const level = r.cefr_overall || cefr(r._scores.overall); if (level in distribution) distribution[level]++; });
    return { participants: all.length, completed: completed.length, completion_rate: all.length ? completed.length / all.length : 0, avg, cefr_distribution: distribution, low_confidence: completed.filter((r) => r.confidence_level === 'low').length };
  }
  function groups(items, keyOf) {
    const map = new Map();
    items.forEach((r) => { const key = String(keyOf(r) || 'Chưa xác định'); if (!map.has(key)) map.set(key, []); map.get(key).push(r); });
    return [...map].map(([key, members]) => ({ key, ...summarize(members) })).sort((a, b) => a.key.localeCompare(b.key, 'vi', { numeric: true }));
  }
  function schoolView(school, items) {
    return { ...school, ward: school.ward || school.ward_name || '', province: school.province || school.province_name || provinces().find((p) => p.code === school.province_code)?.name || '', campaigns: db().campaigns.filter((c) => c.school_id === school.id).length, students: uniqueStudents(items.filter((r) => r.school_id === school.id)).length };
  }
  function campaignView(campaign, items) {
    const students = uniqueStudents(items.filter((r) => r.campaign_id === campaign.id));
    return { ...campaign, school_name: db().schools.find((s) => s.id === campaign.school_id)?.name || campaign.school_name || '', grades: campaign.grades || [], students: students.length, completed: students.filter((r) => r.status === 'completed').length };
  }
  function dashboard(items) {
    const consent = uniqueStudents(items).filter((r) => r._marketing === true || r._marketing === 1).length;
    const confidence = { high: 0, medium: 0, low: 0, unknown: 0 };
    const goals = {}, products = {};
    for (const row of uniqueStudents(items)) {
      if (row.status === 'completed') confidence[row.confidence_level in confidence ? row.confidence_level : 'unknown']++;
      for (const goal of new Set(row._profile.goals || [])) goals[goal] = (goals[goal] || 0) + 1;
      for (const product of row._result?.products || []) {
        const name = typeof product === 'string' ? product : product.id || product.key || product.code || product.name;
        const key = /ielts/i.test(name) ? 'easyielts' : /speakwell/i.test(name) ? 'speakwell' : /easypass/i.test(name) ? 'easypass' : /practice|ai tutor/i.test(name) ? 'practice' : /tutor/i.test(name) ? 'tutor' : name;
        if (key) products[key] = (products[key] || 0) + 1;
      }
    }
    return { summary: summarize(items), marketing_consent: consent, confidence, by_province: groups(items, (r) => r.province), by_grade_band: groups(items, (r) => r.grade == null ? null : r.grade <= 5 ? '3-5' : r.grade <= 8 ? '6-8' : '9-11'), by_school: groups(items, (r) => r.school_name), goals, products };
  }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T00:00:00Z');
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }
  function code6() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do { code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
    while (db().campaigns.some((c) => c.join_code === code));
    return code;
  }
  function deleteSessions(predicate) {
    const ids = new Set(); let sessions = 0, results = 0;
    for (const [token, session] of Object.entries(db().sessions)) {
      if (!predicate(session)) continue;
      ids.add(session.student?.student_id);
      if (session.result_token && db().results[session.result_token]) { delete db().results[session.result_token]; results++; }
      delete db().sessions[token]; sessions++;
    }
    for (const [token, result] of Object.entries(db().results)) {
      if (ids.has((result.result || result).student?.student_id)) { delete db().results[token]; results++; }
    }
    return { students: ids.size, sessions, results };
  }
  function confirmId(body, id) {
    if (text(body.confirm) !== id) return fail(400, 'Bạn hãy nhập đúng mã của mục cần xóa để xác nhận thao tác với dữ liệu dùng thử.', 'confirmation_required');
  }
  function validateDemoPassword(value) {
    if (value != null && value !== '' && value !== 'demo123') return fail(400, 'Các tài khoản trong bản dùng thử sử dụng mật khẩu demo123 để bạn thuận tiện kiểm tra các chức năng.', 'demo_password_only');
    return 'demo123';
  }
  function getHeader(options, name) {
    const entries = options.headers;
    if (entries && typeof entries.get === 'function') return entries.get(name);
    return Object.entries(entries || {}).find(([key]) => key.toLowerCase() === name)?.[1];
  }
  D.csvExport = function csvExport() {
    initCollections(); auth(false);
    const data = dashboard(rows());
    const escape = (value) => '"' + String(value == null ? '' : value).replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';
    const table = [['Loại nhóm', 'Nhóm', 'Tham gia', 'Hoàn thành', 'Tỷ lệ hoàn thành', 'Tổng thể', 'Nghe', 'Đọc', 'Nói', 'Viết']];
    for (const [kind, list] of [['Tỉnh/thành', data.by_province], ['Nhóm lớp', data.by_grade_band], ['Trường', data.by_school]]) {
      list.forEach((g) => table.push([kind, g.key, g.participants, g.completed, Math.round(g.completion_rate * 100) + '%', ...KEYS.map((key) => g.avg[key])]));
    }
    return '\uFEFF' + table.map((line) => line.map(escape).join(',')).join('\r\n') + '\r\n';
  };
  D.staffRequest = async function staffRequest(path, options = {}) {
    initCollections();
    const url = new URL(path, 'https://local.demo');
    const route = url.pathname.replace(/\/$/, '');
    const method = String(options.method || 'GET').toUpperCase();
    const body = bodyOf(options);
    const match = (pattern) => route.match(pattern);
    if (route === '/api/catalog/provinces' && method === 'GET') return D.ok({ provinces: provinces() });
    if (route === '/api/catalog/wards' && method === 'GET') {
      const province = url.searchParams.get('province');
      const source = D.catalog?.wards?.[province] || db().catalog?.wards?.[province] || FALLBACK_WARDS[province] || [];
      return D.ok({ wards: source.map((ward) => typeof ward === 'string' ? { name: ward } : ward) });
    }
    if (route === '/api/staff/login' && method === 'POST') {
      const username = text(body.username).toLowerCase();
      if (body.password !== 'demo123') return fail(401, 'Tên đăng nhập hoặc mật khẩu demo không đúng.', 'invalid_credentials');
      let user = db().users.find((u) => text(u.username).toLowerCase() === username);
      if (!user && username === 'admin') user = { id: 'admin-root', username: 'admin', display_name: 'Quản trị viên Demo', role: 'admin', active: true, password: 'demo123' };
      if (!user && username === 'staff') user = { id: 'staff-demo', username: 'staff', display_name: 'Nhân viên GE Demo', role: 'staff', active: true, password: 'demo123' };
      const shared = username === 'ge demo' && db().shared_login === true;
      if (shared) user = { id: 'ge-shared-demo', username: 'GE Demo', display_name: 'GE Demo', role: 'staff', active: true, shared: true };
      if (!user || !user.active || (user.password && user.password !== 'demo123')) return fail(401, 'Tên đăng nhập hoặc mật khẩu demo không đúng, hoặc tài khoản đã khóa.', 'invalid_credentials');
      user.last_login_at = stamp();
      db().me = { ...meView(user), shared: !!user.shared };
      audit('staff_login', user.id, { role: user.role }); D.save();
      return D.ok(meView(db().me));
    }
    if (route === '/api/staff/logout' && method === 'POST') { db().me = null; D.save(); return D.ok({ logged_out: true }); }
    if (route === '/api/school-report' && method === 'GET') {
      const token = getHeader(options, 'x-report-token');
      const school = token && db().schools.find((s) => s.report_token === token);
      if (!school) return fail(404, 'Link báo cáo demo không hợp lệ hoặc đã được cấp lại.', 'report_not_found');
      const items = rows().filter((r) => r.school_id === school.id);
      const weak = new Map();
      for (const row of uniqueStudents(items).filter((r) => r.status === 'completed')) {
        const labels = new Set((row._result?.improvements || []).map((x) => x.label_vi).filter(Boolean));
        if (!labels.size) {
          const scores = Object.entries(row._scores).filter(([k, v]) => k !== 'overall' && v != null).sort((a, b) => a[1] - b[1]);
          if (scores[0]) labels.add('Kỹ năng ' + SKILLS[scores[0][0]]);
        }
        labels.forEach((label) => weak.set(label, (weak.get(label) || 0) + 1));
      }
      const denominator = summarize(items).completed || 1;
      return D.ok({ school: { id: school.id, name: school.name }, summary: summarize(items), by_grade: groups(items, (r) => r.grade), by_class: groups(items, (r) => r.class_name), by_campaign: groups(items, (r) => { const c = db().campaigns.find((x) => x.id === r.campaign_id); return c ? c.name || c.test_date : r.test_date; }), weak_competencies: [...weak].map(([label_vi, students]) => ({ label_vi, students, share: students / denominator })).sort((a, b) => b.students - a.students), note_vi: 'Dữ liệu demo được tổng hợp trên thiết bị này; không phải dữ liệu học sinh thật. Điểm CEFR chỉ minh họa giao diện, chưa được hiệu chuẩn.' });
    }
    if (!route.startsWith('/api/staff/') && !route.startsWith('/api/admin/')) return undefined;
    const me = auth(route.startsWith('/api/admin/'));
    if (route === '/api/staff/me' && method === 'GET') return D.ok(meView(me));
    if (route === '/api/staff/schools' && method === 'GET') { const all = rows(); return D.ok({ schools: db().schools.map((s) => schoolView(s, all)) }); }
    if (route === '/api/staff/schools' && method === 'POST') {
      const name = text(body.name), ward = text(body.ward_name || body.ward);
      const province = provinces().find((p) => String(p.code) === String(body.province_code));
      if (name.length < 2 || name.length > 160 || ward.length < 2 || ward.length > 160 || !province) return fail(400, 'Vui lòng chọn tỉnh/thành, nhập xã/phường và tên trường hợp lệ.', 'invalid_school');
      if (!['public', 'private'].includes(body.ownership || 'public') || (body.program && !PROGRAMS.includes(body.program))) return fail(400, 'Loại hình hoặc chương trình không hợp lệ.', 'invalid_school');
      const duplicate = db().schools.find((s) => norm(s.name) === norm(name) && (s.province_code === province.code || s.province === province.name) && norm(s.ward || s.ward_name) === norm(ward));
      if (duplicate) { try { return fail(409, 'Trường đã có trong dữ liệu demo.', 'school_exists'); } catch (e) { e.data = { ...(e.data || {}), school_id: duplicate.id }; throw e; } }
      const school = { id: D.uid('sch'), name, ward, ward_name: ward, province_code: province.code, province: province.name, ownership: body.ownership || 'public', specialized: body.specialized === true, program: body.program || null, verified: body.verified !== false, created_at: stamp() };
      db().schools.push(school); audit('school_create', school.id); D.save(); return D.ok({ school: schoolView(school, []) }, 201);
    }
    let parts = match(/^\/api\/staff\/schools\/([^/]+)\/report-link$/);
    if (parts && method === 'POST') { const school = getSchool(decodeURIComponent(parts[1])); school.report_token = D.uid('school-report'); audit('school_report_link', school.id); D.save(); return D.ok({ report_token: school.report_token }); }
    if (route === '/api/staff/campaigns' && method === 'GET') {
      const schoolId = url.searchParams.get('school_id'), all = rows();
      return D.ok({ campaigns: db().campaigns.filter((c) => !schoolId || c.school_id === schoolId).map((c) => campaignView(c, all)) });
    }
    if (route === '/api/staff/campaigns' && method === 'POST') {
      const school = getSchool(body.school_id);
      const grades = Array.isArray(body.grades) ? [...new Set(body.grades.map(Number))].sort((a, b) => a - b) : [];
      if (!validDate(text(body.test_date)) || !grades.length || grades.some((g) => !Number.isInteger(g) || g < 3 || g > 11) || text(body.teacher).length > 160 || text(body.name).length > 160) return fail(400, 'Bạn hãy chọn ngày kiểm tra hợp lệ và ít nhất một khối lớp trong phạm vi từ lớp 3 đến lớp 11.', 'invalid_campaign');
      const campaign = { id: D.uid('campaign'), school_id: school.id, school_name: school.name, name: text(body.name), test_date: text(body.test_date), teacher: text(body.teacher), ge_staff: me.name, grades, join_code: code6(), status: 'open', created_at: stamp() };
      db().campaigns.push(campaign); audit('campaign_create', campaign.id, { school_id: school.id }); D.save(); return D.ok({ campaign: campaignView(campaign, []) }, 201);
    }
    parts = match(/^\/api\/staff\/campaigns\/([^/]+)$/);
    if (parts && (method === 'GET' || method === 'PATCH')) {
      const campaign = getCampaign(decodeURIComponent(parts[1]));
      if (method === 'PATCH') {
        if (!['open', 'closed'].includes(body.status)) return fail(400, 'Trạng thái phải là open hoặc closed.', 'invalid_status');
        campaign.status = body.status; audit('campaign_update', campaign.id, { status: campaign.status }); D.save();
      }
      const all = rows(); return D.ok({ campaign: campaignView(campaign, all), students: all.filter((r) => r.campaign_id === campaign.id).map(tableRow) });
    }
    parts = match(/^\/api\/staff\/sessions\/([^/]+)\/result-link$/);
    if (parts && method === 'POST') {
      const session = sessionFor(decodeURIComponent(parts[1]));
      if (!session) return fail(404, 'Không tìm thấy bài làm demo.', 'session_not_found');
      if (session.status !== 'completed') return fail(409, 'Học sinh chưa hoàn thành bài kiểm tra.', 'session_not_completed');
      if (!session.result_token || !db().results[session.result_token]) {
        if (!session.result_token) session.result_token = D.uid('result');
        const made = await D.makeResult(session);
        const result = made?.result || made;
        if (result && !db().results[session.result_token]) db().results[session.result_token] = result;
        if (!db().results[session.result_token]) return fail(409, 'Chưa tạo được báo cáo demo.', 'result_not_ready');
        D.save();
      }
      return D.ok({ result_token: session.result_token });
    }
    if (route === '/api/staff/dashboard' && method === 'GET') return D.ok(dashboard(rows()));
    if (route === '/api/staff/export.csv' && method === 'GET') return D.ok(D.csvExport());
    if (route === '/api/admin/overview' && method === 'GET') {
      const all = uniqueStudents(rows()), users = db().users.filter((u) => u.username !== 'admin');
      const bank = D.bank?.items || D.bank || db().bank?.items || [];
      return D.ok({ schools: db().schools.length, test_schools: db().schools.filter((s) => s.is_test || /^THCS Live/i.test(s.name)).length, campaigns_open: db().campaigns.filter((c) => c.status === 'open').length, campaigns_closed: db().campaigns.filter((c) => c.status === 'closed').length, students: all.length, sessions_completed: Object.values(db().sessions).filter((s) => s.status === 'completed').length, sessions_active: Object.values(db().sessions).filter((s) => s.status !== 'completed').length, users: users.length, admins: users.filter((u) => u.role === 'admin').length, shared_login: db().shared_login === true, bank_items: Array.isArray(bank) ? bank.length : Object.values(bank).reduce((n, value) => n + (Array.isArray(value) ? value.length : 0), 0), scoring_errors: Object.values(db().results).reduce((n, value) => n + ((value.result || value).scoring_issues || []).length, 0) });
    }
    if (route === '/api/admin/settings' && method === 'PATCH') {
      if (typeof body.shared_login !== 'boolean') return fail(400, 'Giá trị shared_login phải là true hoặc false.', 'invalid_setting');
      db().shared_login = body.shared_login; audit('settings_update', 'shared_login', { enabled: body.shared_login });
      if (!body.shared_login && db().me?.shared) db().me = null;
      D.save(); return D.ok({ shared_login: db().shared_login });
    }
    if (route === '/api/admin/users' && method === 'GET') return D.ok({ users: db().users.filter((u) => u.username !== 'admin').map(publicUser) });
    if (route === '/api/admin/users' && method === 'POST') {
      const username = text(body.username).toLowerCase(), display_name = text(body.display_name);
      if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(username) || display_name.length < 2 || display_name.length > 100 || !['staff', 'admin'].includes(body.role || 'staff')) return fail(400, 'Tên đăng nhập cần có từ 3 đến 64 ký tự, gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang. Bạn cũng cần nhập tên hiển thị và chọn vai trò phù hợp cho tài khoản.', 'invalid_user');
      if (['admin', 'staff'].includes(username) || db().users.some((u) => u.username.toLowerCase() === username)) return fail(409, 'Tên đăng nhập đã được sử dụng.', 'user_exists');
      const user = { id: D.uid('user'), username, display_name, role: body.role || 'staff', password: validateDemoPassword(body.password), active: true, created_at: stamp(), last_login_at: null };
      db().users.push(user); audit('user_create', user.id, { username, role: user.role }); D.save(); return D.ok({ user: publicUser(user), password: 'demo123' }, 201);
    }
    parts = match(/^\/api\/admin\/users\/([^/]+)$/);
    if (parts && method === 'PATCH') {
      const user = db().users.find((u) => u.id === decodeURIComponent(parts[1]));
      if (!user) return fail(404, 'Không tìm thấy tài khoản demo.', 'user_not_found');
      if (user.username === 'admin' || (user.id === me.id && (body.active === false || body.role === 'staff'))) return fail(409, 'Bạn không thể khóa hoặc hạ quyền của tài khoản quản trị đang sử dụng để tránh gián đoạn phiên làm việc.', 'admin_protected');
      if (body.role != null && !['staff', 'admin'].includes(body.role)) return fail(400, 'Vai trò không hợp lệ.', 'invalid_role');
      if (body.active != null && typeof body.active !== 'boolean') return fail(400, 'Trạng thái tài khoản không hợp lệ.', 'invalid_active');
      if (body.reset_password != null && typeof body.reset_password !== 'boolean') return fail(400, 'Yêu cầu đặt lại mật khẩu không hợp lệ.', 'invalid_reset');
      if (body.role != null) user.role = body.role;
      if (body.active != null) user.active = body.active;
      if (body.reset_password) user.password = 'demo123';
      audit('user_update', user.id, { role: user.role, active: user.active, reset_password: !!body.reset_password }); D.save();
      return D.ok({ user: publicUser(user), ...(body.reset_password ? { password: 'demo123' } : {}) });
    }
    if (route === '/api/admin/students' && method === 'GET') {
      const query = norm(url.searchParams.get('q'));
      return D.ok({ students: rows().filter((r) => !query || norm([r.full_name, r.school_name, r.student_id, r.session_id, r.class_name].join(' ')).includes(query)).slice(0, 200).map(tableRow) });
    }
    parts = match(/^\/api\/admin\/students\/([^/]+)$/);
    if (parts && method === 'DELETE') {
      const id = decodeURIComponent(parts[1]); confirmId(body, id);
      if (!rows().some((r) => r.student_id === id)) return fail(404, 'Không tìm thấy học sinh demo.', 'student_not_found');
      const deleted = deleteSessions((s) => s.student?.student_id === id); audit('student_delete', id, deleted); D.save(); return D.ok({ deleted });
    }
    parts = match(/^\/api\/admin\/campaigns\/([^/]+)$/);
    if (parts && method === 'DELETE') {
      const id = decodeURIComponent(parts[1]), campaign = getCampaign(id); confirmId(body, id);
      const deleted = deleteSessions((s) => (s.campaign_id || s.student?.campaign_id) === campaign.id);
      db().campaigns = db().campaigns.filter((c) => c.id !== id); audit('campaign_delete', id, deleted); D.save(); return D.ok({ deleted: { ...deleted, campaigns: 1 } });
    }
    parts = match(/^\/api\/admin\/schools\/([^/]+)$/);
    if (parts && (method === 'PATCH' || method === 'DELETE')) {
      const id = decodeURIComponent(parts[1]), school = getSchool(id);
      if (method === 'PATCH') {
        const name = text(body.name);
        if (name.length < 2 || name.length > 160) return fail(400, 'Tên trường cần từ 2 đến 160 ký tự.', 'invalid_school_name');
        if (db().schools.some((s) => s.id !== id && norm(s.name) === norm(name) && s.province_code === school.province_code && norm(s.ward || s.ward_name) === norm(school.ward || school.ward_name))) return fail(409, 'Địa phương này đã có một trường trùng tên, bạn hãy kiểm tra lại thông tin trước khi tạo mới.', 'school_exists');
        school.name = name;
        db().campaigns.filter((c) => c.school_id === id).forEach((c) => { c.school_name = name; });
        Object.values(db().sessions).filter((s) => (s.school_id || s.student?.school_id) === id).forEach((s) => { s.student.school_name = name; });
        Object.values(db().results).forEach((value) => { const r = value.result || value; if (r.student?.school_id === id) r.student.school_name = name; });
        audit('school_update', id, { name }); D.save(); return D.ok({ school: schoolView(school, rows()) });
      }
      confirmId(body, id);
      const campaignIds = new Set(db().campaigns.filter((c) => c.school_id === id).map((c) => c.id));
      const deleted = deleteSessions((s) => (s.school_id || s.student?.school_id) === id || campaignIds.has(s.campaign_id || s.student?.campaign_id));
      db().campaigns = db().campaigns.filter((c) => c.school_id !== id); db().schools = db().schools.filter((s) => s.id !== id);
      audit('school_delete', id, { ...deleted, campaigns: campaignIds.size }); D.save(); return D.ok({ deleted: { ...deleted, campaigns: campaignIds.size, schools: 1 } });
    }
    if (route === '/api/admin/audit' && method === 'GET') return D.ok({ events: db().audit.slice().sort((a, b) => Number(new Date(b.at)) - Number(new Date(a.at))).slice(0, 200) });
    return undefined;
  };
})();
