/* ICan Path SPA (vanilla JS, SPEC 01/06/07). All dynamic text goes through textContent (no innerHTML with data). */
'use strict';
const $app = document.getElementById('app');
const LS = { session: 'ip_session', result: 'ip_result' };
const SK = {
  U: { vi: 'Khởi động', icon: '🧩', c: 'var(--yellow)', cd: 'var(--yellow-d)' }, L: { vi: 'Nghe', icon: '🎧', c: 'var(--blue)', cd: 'var(--blue-d)' },
  R: { vi: 'Đọc', icon: '📖', c: 'var(--purple)', cd: 'var(--purple-d)' }, S: { vi: 'Nói', icon: '🎤', c: 'var(--orange)', cd: 'var(--orange-d)' },
  W: { vi: 'Viết', icon: '✍️', c: 'var(--green)', cd: 'var(--green-d)' },
};
const SKILL_FULL = { U: 'Từ vựng & Ngữ pháp', L: 'Nghe', R: 'Đọc', S: 'Nói', W: 'Viết' };
const CEFR = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
const COLORS = { L: '#1CB0F6', R: '#CE82FF', S: '#FF9600', W: '#58CC02', U: '#FFC800' };
const PATH_X = [0, 56, 84, 56, 0, -56, -84, -56];
let cleanup = [];

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style') el.setAttribute('style', v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'selected') el[k] = !!v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
function svg(tag, attrs, ...kids) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) el.setAttribute(k, v);
  for (const c of kids.flat(Infinity)) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
function mount(...nodes) { $app.replaceChildren(...nodes.flat(Infinity).filter((n) => n != null && n !== false)); window.scrollTo(0, 0); }
function toast(msg, ms = 3200) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms); }
function setBand(band) { document.body.classList.remove('band-35', 'band-68', 'band-911'); if (band) document.body.classList.add('band-' + band.replace('-', '')); }
function setMode(mode) { document.body.classList.remove('mode-site', 'mode-focus', 'mode-console'); document.body.classList.add('mode-' + mode); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fox = (kind, cls) => h('img', { src: `/img/fox-${kind}.webp`, alt: '', width: 402, height: 440, class: cls || null, decoding: 'async' });
const loading = () => h('div', { class: 'loading' }, h('div', { class: 'spinner', role: 'status', 'aria-label': 'Đang tải' }));
const brandLink = () => h('a', { class: 'brand', href: '#/', 'aria-label': 'ICan Path – trang chủ' }, h('img', { src: '/img/fox-hello.webp', alt: '', width: 40, height: 44 }), h('span', {}, 'ican', h('b', {}, 'path')));
const skillLabel = (k) => `${SK[k].icon} ${SK[k].vi}`;
/** Responsive table: header labels are copied to data-label so rows stack into cards on phones. */
function tbl(heads, rows, cls = '') {
  return h('div', { class: 'table-wrap' }, h('table', { class: 'rtable ' + cls },
    h('thead', {}, h('tr', {}, heads.map((x) => h('th', {}, x)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => h('td', { 'data-label': heads[i] || '' }, c)))))));
}
function emptyState(text) { return h('div', { class: 'center muted', style: 'padding:18px' }, fox('study', null), h('p', {}, text)); }

class ApiError extends Error { constructor(status, data) { super((data && data.message) || 'Lỗi kết nối'); this.status = status; this.code = data && data.error; this.data = data || {}; } }
async function api(path, { method = 'GET', body, headers = {}, retry409 = true } = {}) {
  if (window.ICanDemo) return window.ICanDemo.request(path, { method, body, headers });
  const init = { method, headers: { ...headers }, credentials: 'same-origin' };
  if (body !== undefined) { init.headers['content-type'] = 'application/json'; init.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(path, init); } catch { throw new ApiError(0, { error: 'network', message: 'Mất kết nối mạng, vui lòng thử lại.' }); }
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json().catch(() => ({})) : await res.text();
  if (res.status === 409 && data && data.error === 'concurrent_update' && retry409) { await sleep(350); return api(path, { method, body, headers, retry409: false }); }
  if (!res.ok) throw new ApiError(res.status, data);
  return { status: res.status, data };
}
const sessionToken = () => localStorage.getItem(LS.session);
const authH = () => ({ authorization: 'Bearer ' + sessionToken() });

// ---------------- router ----------------
function router() {
  cleanup.forEach((f) => { try { f(); } catch { /* ignore */ } });
  cleanup = [];
  stopAudio();
  const hash = location.hash.slice(1) || '/';
  const [path, qs] = hash.split('?');
  const parts = path.split('/').filter(Boolean);
  const q = new URLSearchParams(qs || '');
  setBand(null);
  const routes = {
    '': () => home(), join: () => joinPage(parts[1]), test: () => testPage(), r: () => resultPage(parts[1]),
    learn: () => learnPage(parts[1], q), school: () => schoolPage(parts[1]), staff: () => staffPage(parts[1], parts[2]),
    'dieu-khoan': () => legalPage('dieu-khoan'), 'chinh-sach-du-lieu': () => legalPage('chinh-sach-du-lieu'),
  };
  setMode(parts[0] === 'join' || parts[0] === 'test' ? 'focus' : 'site');
  (routes[parts[0] || ''] || home)();
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// ---------------- home ----------------
function stagePath(items) {
  return h('div', { class: 'path' }, items.map((it, i) => h('div', { class: 'path-step' + (PATH_X[i % 8] < 0 ? ' mirror' : ''), style: `--x:${PATH_X[i % 8]}px` },
    h(it.href ? 'a' : 'div', { class: 'node', href: it.href || null, style: `--c:${it.c};--cd:${it.cd}`, 'aria-label': it.aria || null }, it.icon),
    h(it.href ? 'a' : 'div', { class: 'node-label', href: it.href || null }, h('b', {}, it.title), it.sub ? h('span', { class: 'small muted' }, it.sub) : null, it.extra || null))));
}
function home() {
  const code = h('input', { type: 'text', class: 'code-input', placeholder: 'VD: K7P2QX', maxlength: 6, 'aria-label': 'Mã tham gia 6 ký tự', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false',
    onkeydown: (e) => { if (e.key === 'Enter') start(); } });
  const start = () => { const c = code.value.trim().toUpperCase(); if (c.length !== 6) { code.focus(); return toast('Mã tham gia gồm 6 ký tự'); } location.hash = '#/join/' + c; };
  const lastResult = localStorage.getItem(LS.result);
  const roles = [
    ['👩‍🎓', 'Học sinh', 'Nhập mã tham gia, làm bài 30 phút như chơi game và nhận ngay trình độ của mình.', 'var(--blue-l)', 'var(--blue-b)'],
    ['👨‍👩‍👧', 'Phụ huynh', 'Mở link/QR kết quả của con: biểu đồ 4 kỹ năng, điểm mạnh, việc cần luyện — đọc trong 1–2 phút.', 'var(--green-l)', '#B8F28B'],
    ['🏫', 'Nhà trường & GE', 'Thiết lập trường, đợt kiểm tra và xem báo cáo tổng hợp theo khối, lớp, kỹ năng.', 'var(--purple-l)', '#E3B8FF'],
  ];
  mount(
    h('section', { class: 'home-hero hero' },
      h('div', { class: 'art' }, fox('hello')),
      h('div', {},
        h('h1', {}, 'Khám phá trình độ tiếng Anh của em — ', h('em', {}, 'vui, nhanh và chính xác!')),
        h('p', { class: 'muted', style: 'font-size:19px' }, '30 phút · Nghe · Nói · Đọc · Viết. Câu hỏi tự điều chỉnh độ khó theo câu trả lời của em — dành cho học sinh lớp 3–11.'),
        sessionToken() ? h('a', { class: 'btn btn-lg btn-block', href: '#/test' }, '▶ Tiếp tục bài đang làm') : null,
        h('div', { class: 'join-box' }, h('label', { style: 'margin-top:0' }, 'Nhập mã tham gia do thầy cô cung cấp'),
          h('div', { class: 'row' }, code, h('button', { class: 'btn-lg', onclick: start }, 'Bắt đầu'))),
        h('div', { class: 'row', style: 'margin-top:14px' },
          lastResult ? h('a', { class: 'btn btn2', href: '#/r/' + lastResult }, 'Xem kết quả gần nhất') : null,
          h('a', { class: 'btn btn2', href: '#/staff' }, 'Tôi là nhân viên GE')))),
    h('h2', { class: 'section-title' }, 'Bài kiểm tra gồm 5 chặng'),
    h('p', { class: 'section-sub' }, 'Mỗi chặng ngắn gọn và có đồng hồ riêng. Cứ làm hết sức mình nhé — không có điểm trừ!'),
    stagePath([['U', '3 phút', 'Xác định mức khởi đầu'], ['L', '7 phút', 'Nghe hội thoại, chọn đáp án'], ['R', '6 phút', 'Đọc hiểu đoạn văn'], ['S', '7 phút', 'Ghi âm câu trả lời'], ['W', '7 phút', 'Viết đoạn ngắn']]
      .map(([k, t, d]) => ({ icon: SK[k].icon, c: SK[k].c, cd: SK[k].cd, title: `${SKILL_FULL[k]} · ${t}`, sub: d }))),
    h('h2', { class: 'section-title' }, 'Dành cho mọi người'),
    h('div', { class: 'grid g3' }, roles.map(([ic, t, d, l, b]) => h('div', { class: 'card tile' }, h('div', { class: 'icon-tile', style: `--c-l:${l};--c-b:${b}` }, ic), h('div', {}, h('h3', { style: 'margin:0 0 4px' }, t), h('p', { class: 'small muted', style: 'margin:0' }, d))))),
    h('div', { class: 'feature', style: 'margin-top:36px' }, fox('study'),
      h('div', {}, h('h2', {}, 'Thích ứng theo từng em'), h('p', {}, 'Trả lời tốt, câu hỏi khó dần; gặp khó khăn, hệ thống điều chỉnh về mức phù hợp. Mỗi em một bài kiểm tra vừa sức.'))),
    h('div', { class: 'feature flip' }, fox('cheer'),
      h('div', {}, h('h2', {}, 'Báo cáo dễ hiểu, lộ trình rõ ràng'), h('p', {}, 'Trình độ tổng thể, 4 kỹ năng, 3 điểm mạnh và 3 việc cần cải thiện — kèm lộ trình học và luyện phát âm với AI.'))),
    h('div', { class: 'cta-band' }, h('h2', {}, 'Sẵn sàng khám phá chưa?'), h('p', {}, 'Lấy mã tham gia từ thầy cô và bắt đầu ngay.'),
      h('button', { class: 'btn-white btn-lg', onclick: () => { window.scrollTo(0, 0); code.focus(); } }, 'Nhập mã tham gia')),
  );
}

// ---------------- join wizard ----------------
const SELF_DESC = {
  '3-5': { L: ['Em chưa hiểu khi nghe tiếng Anh', 'Em hiểu vài từ quen thuộc', 'Em hiểu câu ngắn khi nói chậm', 'Em hiểu thầy cô, bạn bè nói về chủ đề quen thuộc'],
    S: ['Em chưa nói được câu tiếng Anh', 'Em nói được vài từ, câu chào', 'Em giới thiệu bản thân bằng câu ngắn', 'Em tự tin hỏi – đáp về trường, gia đình, sở thích'],
    R: ['Em chưa đọc được từ tiếng Anh', 'Em đọc được từ và câu rất ngắn', 'Em đọc hiểu đoạn ngắn có tranh', 'Em đọc hiểu truyện ngắn phù hợp lứa tuổi'],
    W: ['Em chưa viết được từ tiếng Anh', 'Em viết được từ đơn giản', 'Em tự viết được câu ngắn', 'Em viết được đoạn ngắn về bản thân'] },
  '6-8': { L: ['Hầu như chưa hiểu', 'Hiểu ý chính khi người nói chậm, rõ', 'Hiểu hội thoại hằng ngày quen thuộc', 'Hiểu bài nghe dài hơn, tốc độ tự nhiên'],
    S: ['Chưa tự nói được', 'Trả lời được câu hỏi đơn giản', 'Nói về bản thân, trường học, sở thích', 'Trao đổi, nêu ý kiến khá tự tin'],
    R: ['Chưa đọc hiểu được', 'Đọc hiểu câu, tin nhắn ngắn', 'Đọc hiểu đoạn văn chủ đề quen thuộc', 'Đọc hiểu bài dài, nắm ý chính và chi tiết'],
    W: ['Chưa viết được câu', 'Viết được câu đơn giản', 'Viết đoạn văn ngắn có liên kết', 'Viết bài rõ ý, ít lỗi ngữ pháp'] },
  '9-11': { L: ['Khó theo kịp bài nghe', 'Hiểu ý chính bài nghe ngắn, rõ', 'Hiểu phần lớn hội thoại, bài nói thông thường', 'Hiểu bài giảng, thảo luận chủ đề học thuật'],
    S: ['Ngại nói, khó diễn đạt', 'Giao tiếp được tình huống đơn giản', 'Trình bày ý kiến về chủ đề quen thuộc', 'Thảo luận, tranh luận khá trôi chảy'],
    R: ['Khó hiểu văn bản tiếng Anh', 'Hiểu văn bản ngắn, đơn giản', 'Hiểu bài báo, đoạn văn phổ thông', 'Hiểu văn bản học thuật, suy luận ý tác giả'],
    W: ['Khó viết câu hoàn chỉnh', 'Viết đoạn ngắn đơn giản', 'Viết bài luận ngắn có bố cục', 'Viết luận rõ lập luận, đa dạng cấu trúc'] },
};
const SELF_Q = { L: 'Listening: Em có thể hiểu người khác nói tiếng Anh đến mức nào?', S: 'Speaking: Em có thể tự nói về bản thân, trường học và các chủ đề quen thuộc không?', R: 'Reading: Em có thể đọc hiểu một đoạn tiếng Anh phù hợp với lứa tuổi không?', W: 'Writing: Em có thể tự viết câu hoặc đoạn văn tiếng Anh không?' };
const GOALS = [['school', 'Học tốt tiếng Anh ở trường và cải thiện điểm số'], ['communication', 'Giao tiếp, nghe và nói tiếng Anh tự tin'], ['literacy', 'Đọc hiểu, viết tiếng Anh tốt hơn'], ['exam', 'Chuẩn bị thi chứng chỉ quốc tế hoặc kỳ thi chuyển cấp'], ['study_abroad', 'Sử dụng tiếng Anh phục vụ học tập, du học trong tương lai']];
const PROGRAMS = [['standard', 'Chuẩn'], ['enhanced', 'Tăng cường'], ['bilingual', 'Song ngữ'], ['international', 'Quốc tế']];
const HOURS = [['0', 'Không học thêm'], ['1-2', '1–2 giờ'], ['3-5', '3–5 giờ'], ['6+', 'Trên 5 giờ']];
const EXTRA = [['center', 'Trung tâm'], ['tutor', 'Gia sư'], ['online', 'Học online'], ['self', 'Tự học'], ['none', 'Không học thêm']];
const bandOf = (g) => (g <= 5 ? '3-5' : g <= 8 ? '6-8' : '9-11');

function chips(options, isOn, onToggle, cls = '') {
  const wrap = h('div', { class: 'chips ' + cls });
  const draw = () => wrap.replaceChildren(...options.map(([k, label]) => h('button', { type: 'button', class: 'chip' + (isOn(k) ? ' on' : ''), 'aria-pressed': isOn(k) ? 'true' : 'false', onclick: () => { onToggle(k); draw(); } }, label)));
  draw();
  return wrap;
}
function footBar(side, main) { return h('div', { class: 'lesson-foot' }, h('div', { class: 'lesson-foot-in' }, h('div', { class: 'side' }, side), h('div', { class: 'main' }, main))); }

async function joinPage(code) {
  if (!code) return home();
  code = code.toUpperCase();
  mount(h('div', { class: 'lesson' }, loading()));
  let info;
  try { info = (await api('/api/join/' + encodeURIComponent(code))).data; } catch (e) {
    setMode('site');
    return mount(h('div', { class: 'card center', style: 'max-width:520px;margin:30px auto' }, fox('study'), h('h2', {}, 'Không vào được đợt kiểm tra'), h('p', {}, e.message), h('a', { class: 'btn', href: '#/' }, 'Về trang chủ')));
  }
  const f = { full_name: '', grade: info.grades.length === 1 ? info.grades[0] : null, class_name: '', score: '', no_score: false, program: null, periods_per_week: '', hours_out: null, extra: [], exams: '', self: {}, confident: null, hardest: null, goals: [], consent_assessment: false, consent_marketing: false };
  let step = 0;
  const titles = ['Thông tin của em', 'Việc học tiếng Anh', 'Em tự đánh giá', 'Mục tiêu & xác nhận'];
  const render = () => {
    setBand(f.grade ? bandOf(f.grade) : null);
    const body = [];
    if (step === 0) {
      body.push(h('div', { class: 'listen-row' }, h('img', { src: '/img/fox-hello.webp', alt: '', width: 90, height: 98, style: 'width:90px;flex:none' }),
        h('div', { class: 'bubble' }, `Chào em! Chào mừng đến với ICan Path tại ${info.school_name}. Mất khoảng 2 phút để điền thông tin nhé.`)),
        h('label', {}, 'Họ và tên'), h('input', { type: 'text', value: f.full_name, maxlength: 80, oninput: (e) => (f.full_name = e.target.value), autocomplete: 'off', placeholder: 'VD: Nguyễn Văn An' }),
        h('label', {}, 'Lớp (khối)'), chips(info.grades.map((g) => [g, 'Lớp ' + g]), (g) => f.grade === g, (g) => { f.grade = g; render(); }),
        h('label', {}, 'Tên lớp (VD: 6A2)'), h('input', { type: 'text', value: f.class_name, maxlength: 20, oninput: (e) => (f.class_name = e.target.value), placeholder: 'VD: 6A2' }));
    } else if (step === 1) {
      body.push(h('label', {}, 'Điểm tiếng Anh học kỳ / năm học gần nhất (0–10)'),
        h('div', { class: 'row' }, h('input', { type: 'number', min: 0, max: 10, step: 0.1, value: f.score, disabled: f.no_score, style: 'max-width:170px', inputmode: 'decimal', oninput: (e) => (f.score = e.target.value) }),
          h('label', { class: 'check-inline' }, h('input', { type: 'checkbox', checked: f.no_score, onchange: (e) => { f.no_score = e.target.checked; render(); } }), 'Chưa có điểm')),
        h('label', {}, 'Chương trình tiếng Anh em đang học'), chips(PROGRAMS, (k) => f.program === k, (k) => (f.program = f.program === k ? null : k)),
        h('label', {}, 'Số tiết tiếng Anh ở trường mỗi tuần'), h('input', { type: 'number', min: 0, max: 20, value: f.periods_per_week, style: 'max-width:170px', inputmode: 'numeric', oninput: (e) => (f.periods_per_week = e.target.value) }),
        h('label', {}, 'Thời gian học thêm / tự học tiếng Anh mỗi tuần'), chips(HOURS, (k) => f.hours_out === k, (k) => (f.hours_out = k)),
        h('label', {}, 'Hình thức học thêm (chọn nhiều)'), chips(EXTRA, (k) => f.extra.includes(k), (k) => { if (k === 'none') f.extra = f.extra.includes('none') ? [] : ['none']; else { f.extra = f.extra.filter((x) => x !== 'none'); f.extra = f.extra.includes(k) ? f.extra.filter((x) => x !== k) : [...f.extra, k]; } }),
        h('label', {}, 'Em đã từng thi Cambridge, IELTS hay bài kiểm tra quốc tế nào chưa? (không bắt buộc)'), h('input', { type: 'text', value: f.exams, maxlength: 200, placeholder: 'VD: Cambridge Movers 12 khiên', oninput: (e) => (f.exams = e.target.value) }));
    } else if (step === 2) {
      const band = bandOf(f.grade || 6);
      const skills4 = [['L', '🎧 Nghe'], ['S', '🎤 Nói'], ['R', '📖 Đọc'], ['W', '✍️ Viết']];
      body.push(h('label', {}, 'Em tự tin với kỹ năng nào nhất?'), chips(skills4, (k) => f.confident === k, (k) => (f.confident = k)),
        h('label', {}, 'Kỹ năng nào em thấy khó nhất?'), chips(skills4, (k) => f.hardest === k, (k) => (f.hardest = k)));
      for (const [k] of skills4) {
        body.push(h('label', {}, SELF_Q[k]), chips(SELF_DESC[band][k].map((d, i) => [i + 1, `${'⭐'.repeat(i + 1)}  ${d}`]), (v) => f.self[k] === v, (v) => (f.self[k] = v), 'col'));
      }
    } else {
      body.push(h('label', {}, 'Mục tiêu học tiếng Anh của em (tối đa 2)'), chips(GOALS, (k) => f.goals.includes(k), (k) => { if (f.goals.includes(k)) f.goals = f.goals.filter((x) => x !== k); else if (f.goals.length < 2) f.goals = [...f.goals, k]; else toast('Chỉ chọn tối đa 2 mục tiêu'); }, 'col'),
        h('p', { class: 'muted small' }, '🎧 Bài kiểm tra 30 phút: em cần tai nghe/loa và micro. Hãy ngồi nơi yên tĩnh.'),
        consentBlock(f));
    }
    mount(h('div', { class: 'lesson' },
      h('div', { class: 'lesson-top' }, h('a', { class: 'lesson-x', href: '#/', 'aria-label': 'Thoát về trang chủ' }, '✕'),
        h('div', { class: 'steps', style: 'flex:1;margin:0', role: 'progressbar', 'aria-valuemin': 1, 'aria-valuemax': 4, 'aria-valuenow': step + 1 },
          titles.map((t, i) => h('div', { class: 'step' + (i === step ? ' cur' : i < step ? ' done' : '') }, `${i + 1}. ${t}`)))),
      h('div', { class: 'lesson-body slide-in' },
        h('div', { class: 'qmeta' }, `${info.school_name} · Ngày ${info.test_date} · Bước ${step + 1}/4`),
        h('h1', { class: 'instr' }, titles[step]), ...body),
      footBar(step > 0 ? h('button', { class: 'btn2', onclick: () => { step--; render(); } }, '← Quay lại') : null,
        step < 3 ? h('button', { class: 'btn-lg btn-block', onclick: next }, 'Tiếp tục') : h('button', { class: 'btn-lg btn-block', id: 'start-assessment', onclick: submit }, 'Bắt đầu đánh giá'))));
  };
  const next = () => {
    if (step === 0) { if (f.full_name.trim().length < 2) return toast('Em hãy nhập họ và tên'); if (!f.grade) return toast('Em hãy chọn lớp'); }
    if (step === 1) { if (!f.no_score && f.score !== '' && (Number(f.score) < 0 || Number(f.score) > 10)) return toast('Điểm phải trong khoảng 0–10'); if (!f.no_score && f.score === '') return toast('Nhập điểm hoặc chọn "Chưa có điểm"'); if (!f.hours_out) return toast('Chọn thời gian học thêm mỗi tuần'); }
    if (step === 2 && ['L', 'S', 'R', 'W'].some((k) => !f.self[k])) return toast('Em hãy tự đánh giá đủ 4 kỹ năng');
    step++; render();
  };
  const submit = async (ev) => {
    const btn = ev.currentTarget; btn.disabled = true;
    try {
      const body = { join_code: code, full_name: f.full_name, grade: f.grade, class_name: f.class_name, consent_assessment: true, consent_marketing: f.consent_marketing === true,
        profile: { score: f.no_score || f.score === '' ? null : Number(f.score), program: f.program, periods_per_week: f.periods_per_week === '' ? null : Number(f.periods_per_week), hours_out: f.hours_out, extra: f.extra, exams: f.exams, self: f.self, confident: f.confident, hardest: f.hardest, goals: f.goals } };
      const r = await api('/api/sessions', { method: 'POST', body });
      localStorage.setItem(LS.session, r.data.session_token);
      location.hash = '#/test';
    } catch (e) { toast(e.message); btn.disabled = false; }
  };
  render();
}

// ---------------- test runner ----------------
const T = { view: null, offset: 0, pending: new Map(), introSeen: new Set(), celebrated: new Set(), stars: 0, busy: false, advancing: false, plays: {}, recorder: null, select: null, check: null };

async function testPage() {
  if (!sessionToken()) { toast('Chưa có bài làm trên máy này'); location.hash = '#/'; return; }
  T.pending = new Map(); T.introSeen = new Set(); T.celebrated = new Set(); T.busy = false; T.advancing = false; T.select = null; T.check = null;
  mount(h('div', { class: 'lesson' }, loading()));
  const iv = setInterval(tick, 500);
  const onKey = (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
    const introBtn = document.querySelector('.intro .lesson-foot button');
    if (e.key === 'Enter' && introBtn) { e.preventDefault(); introBtn.click(); return; }
    if (!T.select) return;
    if (/^[1-4]$/.test(e.key) && document.querySelectorAll('.opt')[Number(e.key) - 1]) { e.preventDefault(); T.select(Number(e.key) - 1); }
    else if (e.key === 'Enter' && T.check) { e.preventDefault(); T.check(); }
  };
  window.addEventListener('keydown', onKey);
  cleanup.push(() => clearInterval(iv), () => stopRecorder(true), () => window.removeEventListener('keydown', onKey));
  await refresh();
}
async function refresh() {
  try { applyView((await api('/api/session', { headers: authH() })).data); } catch (e) { handleTestError(e); }
}
function applyView(v) {
  stopAudio(); // a clip never keeps playing over the next item/section
  T.view = v; T.offset = v.server_now - Date.now(); setBand(v.band);
  T.select = null; T.check = null;
  if (v.status === 'completed' || v.section === 'done') return finishing();
  renderTest();
}
function handleTestError(e) {
  if (e.status === 401) {
    localStorage.removeItem(LS.session); setMode('site');
    mount(h('div', { class: 'card center', style: 'max-width:520px;margin:30px auto' }, fox('study'), h('h2', {}, 'Phiên làm bài không còn hiệu lực'), h('a', { class: 'btn', href: '#/' }, 'Về trang chủ')));
    return;
  }
  if (e.code === 'section_time_over' || e.code === 'not_current_item') { toast('Hết thời gian phần này, chuyển sang phần tiếp theo'); return refresh(); }
  if (e.code === 'session_completed') return finishing();
  toast(e.message);
}
function remainingMs() { const v = T.view; return v && v.deadline ? v.deadline - (Date.now() + T.offset) : null; }
function tick() {
  const el = document.getElementById('timer');
  const ms = remainingMs();
  if (!el || ms == null) return;
  const s = Math.max(0, Math.ceil(ms / 1000));
  el.textContent = `⏱ ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  el.classList.toggle('low', s <= 30);
  if (ms <= 0 && !T.advancing) onTimeUp();
}
async function onTimeUp() {
  T.advancing = true;
  const sec = T.view.section;
  try {
    if (sec === 'S') stopRecorder(false);
    if (sec === 'W') { const ta = document.getElementById('wtext'); if (ta && ta.value.trim()) { await submitWriting(ta.value, true); return; } }
    applyView((await api('/api/session/advance', { method: 'POST', body: { section: sec }, headers: authH() })).data);
  } catch (e) { handleTestError(e); } finally { T.advancing = false; }
}
async function advanceSection() {
  if (T.advancing) return; T.advancing = true;
  try { applyView((await api('/api/session/advance', { method: 'POST', body: { section: T.view.section }, headers: authH() })).data); } catch (e) { handleTestError(e); } finally { T.advancing = false; }
}
const secName = (k) => (k === 'U' ? 'khởi động' : SK[k].vi);
/** Lesson chrome: exit, in-section progress bar, stars (grades 3–5), timer, 5-section steps. */
function lessonTop() {
  const v = T.view;
  const cur = v.sections.find((s) => s.key === v.section) || {};
  const pct = cur.max ? Math.min(100, Math.round(((cur.answered || 0) / cur.max) * 100)) : 0;
  return [
    h('div', { class: 'lesson-top' },
      h('a', { class: 'lesson-x', href: '#/', 'aria-label': 'Tạm rời bài (bài làm được lưu)', onclick: (e) => { if (!confirm('Tạm rời bài? Bài làm được lưu, em có thể tiếp tục trên máy này.')) e.preventDefault(); } }, '✕'),
      h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Tiến độ phần ' + secName(v.section), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct }, h('span', { style: `width:${Math.max(pct, 3)}%` })),
      v.band === '3-5' ? h('span', { id: 'stars', class: 'stars', title: 'Sao chăm chỉ' }, '⭐ ' + T.stars) : null,
      v.band === '3-5' ? h('button', { class: 'mute', 'aria-label': sfxMuted() ? 'Bật âm thanh trò chơi' : 'Tắt âm thanh trò chơi', 'aria-pressed': sfxMuted() ? 'true' : 'false',
        onclick: (e) => { localStorage.setItem('ip_mute', sfxMuted() ? '0' : '1'); const b = e.currentTarget; b.textContent = sfxMuted() ? '🔇' : '🔈'; b.setAttribute('aria-pressed', sfxMuted() ? 'true' : 'false'); b.setAttribute('aria-label', sfxMuted() ? 'Bật âm thanh trò chơi' : 'Tắt âm thanh trò chơi'); } }, sfxMuted() ? '🔇' : '🔈') : null,
      h('span', { id: 'timer', class: 'timer' }, '⏱ --:--')),
    h('div', { class: 'lesson-meta' }, h('div', { class: 'steps', style: 'margin:0' },
      v.sections.map((s) => h('div', { class: 'step' + (s.key === v.section ? ' cur' : s.end ? ' done' : ''), title: SKILL_FULL[s.key] }, `${SK[s.key].icon} ${SK[s.key].vi}`)))),
  ];
}
function lesson(body, foot, wide) { return h('div', { class: 'lesson' }, lessonTop(), h('div', { class: 'lesson-body slide-in' + (wide ? ' wide' : '') }, body), foot); }
const INTRO = {
  U: ['Khởi động', 'Một vài câu hỏi ngắn về từ vựng và ngữ pháp để hệ thống chọn mức câu hỏi phù hợp với em.', 'hello'],
  L: ['Nghe hiểu', 'Bấm loa để nghe đoạn hội thoại (tối đa 2 lần) rồi chọn đáp án đúng. Câu hỏi sẽ khó hơn nếu em trả lời tốt.', 'study'],
  R: ['Đọc hiểu', 'Đọc đoạn văn và chọn đáp án đúng nhất.', 'study'],
  S: ['Nói', 'Em sẽ ghi âm 2 phần: đọc to một câu và trả lời một câu hỏi. Hãy cho phép trình duyệt dùng micro, nói to và rõ.', 'hello'],
  W: ['Viết', 'Viết câu trả lời bằng tiếng Anh theo yêu cầu. Chú ý số từ gợi ý. Bấm "Nộp bài" khi xong.', 'study'],
};
// SPEC 09: grade-band wording (3–5 picture game, 9–11 certificate-style tasks).
const INTRO_KIDS = {
  U: ['Trò chơi tranh', 'Nhìn tranh và chọn đáp án đúng. Mỗi câu trả lời được 1 ⭐!', 'hello'],
  L: ['Nghe và chọn tranh', 'Bấm loa để nghe (tối đa 2 lần) rồi chạm vào bức tranh đúng.', 'study'],
  R: ['Đọc truyện ngắn', 'Đọc đoạn văn ngắn rồi chọn đáp án hoặc bức tranh đúng.', 'study'],
  S: ['Nói', 'Em ghi âm 2 lượt: đọc to một câu và nói 2–3 câu về bức tranh. Nhớ cho phép dùng micro nhé!', 'hello'],
  W: ['Viết', 'Nhìn tranh và viết 2–3 câu bằng tiếng Anh.', 'study'],
};
const CERT_NOTE = 'Câu hỏi mô phỏng dạng bài chứng chỉ quốc tế (Cambridge, IELTS).';
function renderTest() {
  const v = T.view;
  if (!T.introSeen.has(v.section)) {
    const sec = v.sections.find((s) => s.key === v.section) || {};
    const kids = v.band === '3-5', idx = v.sections.indexOf(sec);
    const [title, desc, img] = (kids ? INTRO_KIDS : INTRO)[v.section];
    const party = kids && idx > 0;
    if (party && !T.celebrated.has(v.section)) { T.celebrated.add(v.section); sfx('section'); }
    return mount(h('div', { class: 'lesson' }, lessonTop(),
      h('div', { class: 'lesson-body intro slide-in' }, party ? confetti() : null, fox(party ? 'cheer' : img), party ? h('p', { class: 'party' }, `Giỏi lắm! Em đã có ⭐ ${T.stars} sao`) : null,
        h('div', { class: 'qmeta', style: 'justify-content:center' }, `${SK[v.section].icon} Phần ${idx + 1}/${v.sections.length}`),
        h('h2', {}, title), h('p', {}, desc), v.band === '9-11' ? h('p', { class: 'small muted' }, '🎓 ' + CERT_NOTE) : null,
        footBar(h('span', { class: 'muted small' }, sec.max ? `Tối đa ${sec.max} câu · có đồng hồ riêng` : 'Có đồng hồ riêng'),
          h('button', { class: 'btn-lg btn-block', onclick: () => { T.introSeen.add(v.section); renderTest(); } }, 'Bắt đầu phần này')))));
  }
  if (['U', 'L', 'R'].includes(v.section)) return renderMcq();
  if (v.section === 'S') return renderSpeaking();
  if (v.section === 'W') return renderWriting();
}
function renderMcq() {
  const v = T.view, it = v.item;
  if (!it) return mount(lesson(loading(), null));
  const p = it.payload, kids = v.band === '3-5';
  const s = v.sections.find((x) => x.key === v.section) || {};
  let sel = null;
  const check = h('button', { id: 'check', class: 'btn-lg btn-block', disabled: true, onclick: () => { if (sel != null) answerMcq(it.id, sel); } }, 'Trả lời');
  const icons = Array.isArray(p.option_icons) && p.option_icons.length === p.options.length ? p.option_icons : null; // SPEC 09 tap-the-picture
  const optBtns = p.options.map((o, i) => (icons
    ? h('button', { class: 'opt pic-opt', 'data-opt': i, 'aria-pressed': 'false', 'aria-label': `${i + 1}. ${o}`, onclick: () => select(i) }, h('span', { class: 'k' }, String(i + 1)), h('img', { src: iconUrl(icons[i]), alt: '', width: 112, height: 112, decoding: 'async' }))
    : h('button', { class: 'opt', 'data-opt': i, 'aria-pressed': 'false', onclick: () => select(i) }, h('span', { class: 'k' }, String(i + 1)), h('span', {}, o))));
  const select = (i) => { if (T.busy) return; sel = i; optBtns.forEach((b, j) => { b.classList.toggle('sel', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); check.disabled = false; if (kids) sfx('tap'); };
  T.select = select; T.check = () => { if (!check.disabled) check.click(); };
  const instr = icons ? (it.format === 'reading_mcq' ? 'Đọc rồi chạm vào bức tranh đúng' : 'Nghe và chạm vào bức tranh đúng')
    : p.variant === 'picture' ? 'Nhìn tranh và chọn đáp án đúng' : p.variant === 'situation' ? 'Em sẽ nói gì trong tình huống này?'
    : { listening_mcq: 'Nghe và chọn đáp án đúng', reading_mcq: 'Đọc và trả lời câu hỏi' }[it.format] || 'Chọn đáp án đúng';
  const body = [h('div', { class: 'qmeta' }, `${SK[v.section].icon} ${SKILL_FULL[v.section]} · Câu ${(s.answered || 0) + 1} (tối đa ${s.max})`), ctxChips(p), h('div', { class: 'instr' }, instr)];
  if (it.format === 'listening_mcq') {
    // SPEC 08: recorded MP3 (works on every device); a play is counted only when sound actually starts.
    T.plays[it.id] ??= 0;
    const left = () => 2 - T.plays[it.id];
    const btn = h('button', { class: 'speaker', 'aria-label': 'Nghe đoạn hội thoại' });
    const audio = p.audio_url ? h('audio', { class: 'listen-audio', preload: 'auto', src: p.audio_url }) : null;
    const fill = h('i');
    const prog = h('div', { class: 'listen-prog', 'aria-hidden': 'true' }, fill);
    const msg = h('p', { class: 'listen-msg badge warn', role: 'status', hidden: true });
    let state = 'idle';
    const label = (txt) => btn.replaceChildren('🔊', h('span', {}, txt || (left() <= 0 ? 'Đã nghe 2 lần' : `▶ Nghe (${left()} lượt)`)));
    const idle = () => { state = 'idle'; btn.disabled = left() <= 0; label(); };
    btn.onclick = () => {
      if (state !== 'idle' || left() <= 0) return;
      state = 'loading'; btn.disabled = true; msg.hidden = true; label('Đang tải…'); fill.style.width = '0%';
      playClip({ audio, text: p.audio_script, band: v.band,
        onStart: () => { state = 'playing'; T.plays[it.id]++; label(`Đang phát · còn ${left()} lượt`); },
        onProgress: (f) => { fill.style.width = Math.round(f * 100) + '%'; },
        onEnd: () => { fill.style.width = '100%'; idle(); },
        onFail: (why) => { msg.textContent = why; msg.hidden = false; idle(); } });
    };
    label();
    if (!audio && !window.speechSynthesis) { btn.disabled = true; msg.textContent = 'Thiết bị không phát được âm thanh. Em báo thầy cô hoặc bấm "Bỏ qua phần Nghe".'; msg.hidden = false; }
    body.push(h('div', { class: 'listen-row' }, btn, h('div', { class: 'listen-side' }, h('div', { class: 'bubble' }, icons ? 'Bấm loa để nghe (tối đa 2 lần), rồi chạm vào bức tranh đúng nhé!' : 'Bấm loa để nghe (tối đa 2 lần), nghe xong rồi chọn đáp án nhé!'), prog)), msg, audio,
      icons ? null : picture(p.image, 'sm'));
  }
  if (it.format === 'reading_mcq') body.push(p.title ? h('h3', {}, p.title) : null, picture(p.image, 'sm'), h('div', { class: 'passage', tabindex: 0 }, p.passage));
  if (it.format === 'mcq') body.push(picture(p.image, p.variant === 'picture' ? 'big' : 'sm'));
  body.push(h('div', { class: 'q-stem' }, p.stem || p.question), h('div', { class: 'opts' + (icons ? ' pics' : '') }, optBtns),
    kids ? null : h('p', { class: 'small muted center', style: 'margin-top:14px' }, 'Mẹo: phím 1–4 để chọn, Enter để trả lời'));
  mount(lesson(body, footBar([
    h('button', { class: 'btn-text small', onclick: () => answerMcq(it.id, -1) }, 'Em không biết'),
    h('button', { class: 'btn-ghost small', onclick: () => { if (confirm('Kết thúc phần này và chuyển sang phần tiếp theo?')) advanceSection(); } }, `Bỏ qua phần ${secName(v.section)}`)], check)));
  tick();
}
/** SPEC 12: pressing "Bắt đầu đánh giá" is the confirmation; marketing opt-in is separate and unchecked by default. */
function consentBlock(f) {
  const link = (href, text) => h('a', { href, target: '_blank', rel: 'noopener' }, text);
  return h('section', { class: 'consent', 'aria-labelledby': 'consent-h' },
    h('h2', { id: 'consent-h' }, 'Xác nhận'),
    h('h3', {}, 'Thông tin và quyền riêng tư'),
    h('p', {}, 'Bằng việc nhấn "Bắt đầu đánh giá", em xác nhận đã đọc và đồng ý với ', link('#/dieu-khoan', 'Điều khoản sử dụng'), ' và ', link('#/chinh-sach-du-lieu', 'Chính sách xử lý dữ liệu cá nhân'), ' của GE/ICAN.'),
    h('p', {}, 'Việc xử lý thông tin học sinh và kết quả đánh giá được thực hiện theo chính sách trên và các yêu cầu về sự đồng ý hợp lệ của phụ huynh/người giám hộ (nếu áp dụng).'),
    h('h3', {}, 'Nhận thông tin từ GE/ICAN'),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'consent-marketing', checked: f.consent_marketing === true, onchange: (e) => (f.consent_marketing = e.target.checked) }),
      h('span', {}, 'Tôi đồng ý nhận thông tin về các chương trình học tập, sản phẩm mới và ưu đãi từ GE/ICAN qua email hoặc số điện thoại đã đăng ký.')),
    h('p', { class: 'small muted' }, h('em', {}, 'Không bắt buộc. Việc không đồng ý không ảnh hưởng đến quyền tham gia đánh giá hoặc nhận kết quả.')));
}
const LEGAL_NOTE = 'Bản dùng trong giai đoạn thử nghiệm, mô tả đúng cách hệ thống ICan Path đang xử lý dữ liệu. Văn bản pháp lý chính thức do GE/ICAN ban hành sẽ thay thế bản này.';
const LEGAL = {
  'dieu-khoan': ['Điều khoản sử dụng', [
    ['Dịch vụ', 'ICan Path là bài đánh giá tiếng Anh khoảng 30 phút (Khởi động, Nghe, Đọc, Nói, Viết) do GE/ICAN tổ chức cùng nhà trường, kèm báo cáo năng lực và gợi ý lộ trình luyện tập.'],
    ['Kết quả mang tính tham chiếu', 'Mức CEFR trong báo cáo là tham chiếu từ một bài kiểm tra ngắn, ngân hàng câu hỏi chưa được hiệu chuẩn; không thay thế chứng chỉ hay điểm số chính thức của nhà trường. Khi bài làm chưa đủ dữ liệu tin cậy, hệ thống không kết luận trình độ và đề nghị làm bổ sung.'],
    ['Chấm điểm tự động', 'Phần Nói và Viết được chấm tự động bằng dịch vụ nhận dạng giọng nói và mô hình AI theo tiêu chí công bố trong báo cáo; nhận xét có thể chưa hoàn toàn chính xác.'],
    ['Trách nhiệm của người làm bài', 'Em tự làm bài, không nhờ người khác làm thay, không sao chép hay phát tán đề. Link kết quả là link cá nhân, chỉ chia sẻ cho phụ huynh/người được phép.'],
    ['Liên hệ', 'Mọi yêu cầu về kết quả, cấp lại link hay xóa dữ liệu: liên hệ thầy cô phụ trách hoặc nhân viên GE của đợt kiểm tra.']]],
  'chinh-sach-du-lieu': ['Chính sách xử lý dữ liệu cá nhân', [
    ['Dữ liệu thu thập', 'Họ tên, lớp, trường; điểm tiếng Anh gần nhất, chương trình học, thời gian học thêm; tự đánh giá 4 kỹ năng và mục tiêu học tập; câu trả lời, bản ghi âm phần Nói, bài Viết và thời gian làm từng câu.'],
    ['Mục đích', 'Chấm bài, lập báo cáo năng lực, gợi ý lộ trình luyện tập cho học sinh; báo cáo tổng hợp (không có họ tên) cho nhà trường; cải thiện chất lượng bài đánh giá.'],
    ['Chấm Nói/Viết bằng dịch vụ bên ngoài', 'Bản ghi âm và bài viết được gửi tới dịch vụ chấm phát âm và mô hình AI chỉ để chấm điểm, không kèm họ tên học sinh.'],
    ['Ai được xem', 'Học sinh/phụ huynh có link kết quả; nhân viên GE được phân quyền; nhà trường chỉ xem số liệu tổng hợp không có họ tên.'],
    ['Nhận thông tin quảng bá', 'Chỉ khi em/phụ huynh đánh dấu đồng ý (không bắt buộc). Việc không đồng ý không ảnh hưởng đến bài đánh giá hay kết quả.'],
    ['Quyền của học sinh và phụ huynh', 'Yêu cầu xem, cấp lại link, chỉnh sửa hoặc xóa toàn bộ dữ liệu bài làm qua thầy cô phụ trách hoặc nhân viên GE; quản trị viên có chức năng xóa dữ liệu học sinh.'],
    ['Đồng ý của phụ huynh/người giám hộ', 'Với học sinh chưa đủ tuổi theo quy định, việc tham gia cần có sự đồng ý hợp lệ của phụ huynh/người giám hộ (thường được nhà trường thu thập khi tổ chức đợt kiểm tra).']]],
};
function legalPage(key) {
  const [title, items] = LEGAL[key];
  mount(h('section', { class: 'card legal', style: 'max-width:760px;margin:16px auto' },
    h('div', { class: 'qmeta' }, 'GE/ICAN · ICan Path'), h('h1', {}, title),
    h('p', { class: 'small muted' }, h('em', {}, LEGAL_NOTE)),
    ...items.map(([t, d]) => h('div', {}, h('h2', {}, t), h('p', {}, d))),
    h('p', { class: 'small muted' }, 'Phiên bản lời xác nhận: 2026-10-30.'),
    h('p', { class: 'noprint' }, h('a', { class: 'btn btn2', href: '#/' }, 'Trang chủ'))));
}
async function answerMcq(itemId, choice) {
  if (T.busy) return; T.busy = true;
  document.querySelectorAll('.opt, #check').forEach((b) => (b.disabled = true));
  stopAudio();
  try {
    const r = await api('/api/session/answer', { method: 'POST', body: { item_id: itemId, choice, plays: T.plays ? T.plays[itemId] : undefined }, headers: authH() });
    T.stars++;
    if (isKids()) { sfx('answer'); starPop(); }
    T.busy = false;
    applyView(r.data);
  } catch (e) { T.busy = false; handleTestError(e); document.querySelectorAll('.opt').forEach((b) => (b.disabled = false)); const c = document.getElementById('check'); if (c && document.querySelector('.opt.sel')) c.disabled = false; }
}
// ----- pictures, charts, context chips, kids game layer (SPEC 09) -----
const iconUrl = (s) => `/img/e/${encodeURIComponent(s)}.svg`;
const isKids = () => !!(T.view && T.view.band === '3-5');
/** Picture card from item.payload.image: {icons:[slug], alt} (Fluent Emoji, MIT) or {chart:{...}} (data chart). */
function picture(img, cls = '') {
  if (!img) return null;
  if (img.chart) return dataChart(img.chart, img.alt);
  if (!Array.isArray(img.icons) || !img.icons.length) return null;
  const story = cls.includes('story'); // SPEC 10: picture story (A2 Key Writing Part 7) -> numbered pictures 1-2-3
  return h('div', { class: `pic ${cls} n${img.icons.length}`, role: 'img', 'aria-label': img.alt || img.icons.join(', ').replace(/_/g, ' ') },
    img.icons.map((s, i) => { const im = h('img', { src: iconUrl(s), alt: '', width: 96, height: 96, decoding: 'async' }); return story ? h('span', { class: 'frame', 'data-n': i + 1 }, im) : im; }));
}
const CH_COLORS = ['#1CB0F6', '#FF9600', '#58CC02'];
function niceMax(m) { const p = 10 ** Math.floor(Math.log10(m || 1)); for (const k of [1, 2, 2.5, 5, 10]) if (k * p >= m) return k * p; return 10 * p; }
const fmtNum = (v) => (Math.round(v * 10) / 10).toLocaleString('en-US');
const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
/** Bar / line / pie chart drawn from exact item data (IELTS Writing Task 1, reading with data). */
function dataChart(c, alt) {
  const W = 600, H = 330, L = 56, R = 16, TOP = 44, B = 52;
  const series = c.series || [], labels = c.labels || [];
  const aria = alt || `${c.title}: ` + series.map((s) => `${s.name} ` + labels.map((l, i) => `${l} ${s.values[i]}`).join(', ')).join('; ');
  const kids = [svg('text', { x: W / 2, y: 24, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 900, fill: '#3C3C3C' }, clip(c.title, 64) + (c.unit && c.type !== 'pie' ? ` (${c.unit})` : ''))];
  let legend = series.length > 1 ? series.map((s, j) => ({ name: s.name, color: CH_COLORS[j % 3] })) : [];
  if (c.type === 'pie') {
    const vals = series[0].values, sum = vals.reduce((a, b) => a + b, 0) || 1, cx = 170, cy = 186, r = 120;
    const PIE = ['#1CB0F6', '#FF9600', '#58CC02', '#CE82FF', '#FF4B4B', '#FFC800', '#2B70C9'];
    let a0 = -Math.PI / 2;
    vals.forEach((v, i) => {
      const a1 = a0 + (v / sum) * 2 * Math.PI, large = a1 - a0 > Math.PI ? 1 : 0;
      const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
      kids.push(vals.length === 1 ? svg('circle', { cx, cy, r, fill: PIE[0] }) : svg('path', { d: `M${cx},${cy} L${p0} A${r},${r} 0 ${large} 1 ${p1} Z`, fill: PIE[i % PIE.length], stroke: '#fff', 'stroke-width': 2 }));
      a0 = a1;
    });
    labels.forEach((l, i) => kids.push(svg('rect', { x: 330, y: 70 + i * 34, width: 18, height: 18, rx: 4, fill: PIE[i % PIE.length] }),
      svg('text', { x: 356, y: 84 + i * 34, 'font-size': 15, 'font-weight': 800, fill: '#3C3C3C' }, `${clip(l, 20)}: ${fmtNum(vals[i])}${c.unit ? ' ' + clip(c.unit, 10) : ''}`)));
    legend = [];
  } else {
    const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
    const y = (v) => TOP + (H - TOP - B) * (1 - v / max);
    const n = labels.length, bw = (W - L - R) / n, fs = n >= 6 ? 11 : 13;
    const steps = Number.isInteger(max / 4) ? 4 : 5; // whole-number ticks (50 -> 0,10,…,50)
    for (let g = 0; g <= steps; g++) {
      const v = (max * g) / steps;
      kids.push(svg('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: '#E5E5E5', 'stroke-width': 1.5 }),
        svg('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#777' }, fmtNum(v)));
    }
    labels.forEach((l, i) => kids.push(svg('text', { x: L + bw * (i + 0.5), y: H - B + 20, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 800, fill: '#4B4B4B' }, clip(l, n >= 6 ? 10 : 14))));
    series.forEach((s, j) => {
      const col = CH_COLORS[j % 3];
      if (c.type === 'line') {
        const pts = s.values.map((v, i) => [L + bw * (i + 0.5), y(v)]);
        kids.push(svg('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
        pts.forEach(([px, py], i) => kids.push(svg('circle', { cx: px, cy: py, r: 5, fill: '#fff', stroke: col, 'stroke-width': 3 }),
          svg('text', { x: px, y: py - 10, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: col }, fmtNum(s.values[i]))));
      } else {
        const ns = series.length, w = (bw * 0.72) / ns;
        s.values.forEach((v, i) => {
          const x = L + bw * i + bw * 0.14 + j * w;
          kids.push(svg('rect', { x, y: y(v), width: Math.max(2, w - 3), height: Math.max(0, y(0) - y(v)), rx: 4, fill: col }),
            svg('text', { x: x + (w - 3) / 2, y: y(v) - 5, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#4B4B4B' }, fmtNum(v)));
        });
      }
    });
    kids.push(svg('line', { x1: L, x2: W - R, y1: y(0), y2: y(0), stroke: '#AFAFAF', 'stroke-width': 2 }));
  }
  return h('figure', { class: 'chart' }, svg('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': aria, style: 'font-family:inherit' }, kids),
    legend.length ? h('figcaption', { class: 'chart-legend' }, legend.map((x) => h('span', {}, h('i', { style: `background:${x.color}` }), x.name))) : null);
}
function ctxChips(p) {
  const xs = [];
  if (p.situation) xs.push(h('span', { class: 'ctx-chip sit' }, '📍 Tình huống: ' + p.situation));
  if (p.cert_task) xs.push(h('span', { class: 'ctx-chip cert' }, '🎓 Dạng bài: ' + p.cert_task));
  return xs.length ? h('div', { class: 'ctx-chips' }, xs) : null;
}
// Game sounds for grades 3–5: short synthesized notes (WebAudio, no files). Neutral rewards: never reveal right/wrong.
window.__sfx = { tap: 0, answer: 0, section: 0 };
let actx = null;
const sfxMuted = () => localStorage.getItem('ip_mute') === '1';
function sfx(kind) {
  if (sfxMuted()) return;
  window.__sfx[kind] = (window.__sfx[kind] || 0) + 1;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const notes = { tap: [[660, 0, 0.06]], answer: [[784, 0, 0.1], [1175, 0.09, 0.18]], section: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.32]] }[kind] || [];
    const t0 = actx.currentTime;
    for (const [f, at, dur] of notes) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + at); g.gain.exponentialRampToValueAtTime(0.2, t0 + at + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      o.connect(g); g.connect(actx.destination); o.start(t0 + at); o.stop(t0 + at + dur + 0.03);
    }
  } catch { /* no WebAudio: stay silent */ }
}
function starPop() {
  const el = h('div', { class: 'star-pop', 'aria-hidden': 'true' }, '+1 ⭐');
  document.body.append(el); setTimeout(() => el.remove(), 950);
}
const CONFETTI = ['#58CC02', '#1CB0F6', '#FFC800', '#FF9600', '#CE82FF', '#FF4B4B'];
const confetti = () => h('div', { class: 'confetti', 'aria-hidden': 'true' }, Array.from({ length: 18 }, (_, i) => h('i', { style: `left:${(i * 53) % 100}%;background:${CONFETTI[i % 6]};animation-delay:${(i % 6) * 0.08}s` })));

// ----- audio playback (SPEC 08) -----
// Recorded MP3 clips are the primary path (browser speech synthesis is silent on many phones, in-app browsers and
// with the iOS silent switch). Browser TTS is only a fallback for text without a clip. Every play attempt ends in
// exactly one of onEnd / onFail (watchdogs), so the button can never stay locked.
const MSG_AUDIO = 'Chưa phát được âm thanh. Em kiểm tra loa/tai nghe, tăng âm lượng rồi bấm Nghe lại nhé (lần này chưa bị tính).';
const MSG_SLOW = 'Mạng chậm nên âm thanh chưa tải xong. Em bấm Nghe lại nhé (lần này chưa bị tính).';
let activeClip = null;
let lessonAudioEl = null;
function stopAudio() {
  if (activeClip) activeClip.cancel();
  document.querySelectorAll('audio').forEach((a) => { try { a.pause(); } catch { /* ignore */ } });
  if (window.speechSynthesis) speechSynthesis.cancel();
}
function playClip(o) {
  stopAudio();
  let started = false, done = false, wd = null, off = () => {};
  const finish = (ok, why) => { if (done) return; done = true; clearTimeout(wd); off(); if (activeClip === clip) activeClip = null; ok ? o.onEnd && o.onEnd() : o.onFail && o.onFail(why); };
  const begin = () => { if (started || done) return; started = true; clearTimeout(wd); o.onStart && o.onStart(); };
  const clip = { cancel: () => finish(true) };
  activeClip = clip;
  if (o.audio) {
    const a = o.audio;
    const ev = { playing: begin, ended: () => finish(true), error: () => finish(started, MSG_AUDIO), timeupdate: () => { if (a.duration && o.onProgress) o.onProgress(Math.min(1, a.currentTime / a.duration)); } };
    for (const [k, f] of Object.entries(ev)) a.addEventListener(k, f);
    off = () => { for (const [k, f] of Object.entries(ev)) a.removeEventListener(k, f); };
    try { a.currentTime = 0; } catch { /* not loaded yet */ }
    let pr;
    try { pr = a.play(); } catch (e) { pr = Promise.reject(e); }
    if (pr && pr.catch) pr.catch(() => { if (!started) finish(false, MSG_AUDIO); });
    wd = setTimeout(() => { if (!started) { try { a.pause(); } catch { /* ignore */ } finish(false, MSG_SLOW); } }, 15000);
    return clip;
  }
  if (!window.speechSynthesis) { finish(false, MSG_AUDIO); return clip; }
  speakScript(o.text, o.band, begin).then((ok) => finish(ok || started, MSG_AUDIO));
  wd = setTimeout(() => { if (!started) { speechSynthesis.cancel(); finish(false, MSG_AUDIO); } }, 6000);
  return clip;
}
/** Lesson sentence: recorded clip when the unit API provides one, otherwise browser TTS. */
function playText(text, map, btn) {
  const url = map && map[String(text).trim()];
  if (url && !lessonAudioEl) { lessonAudioEl = h('audio', { class: 'lesson-audio', preload: 'none' }); document.body.append(lessonAudioEl); }
  if (url && !lessonAudioEl.src.endsWith(url)) lessonAudioEl.src = url;
  if (btn) btn.disabled = true;
  const reset = () => { if (btn) btn.disabled = false; };
  playClip({ audio: url ? lessonAudioEl : null, text, band: '6-8', onEnd: reset, onFail: (why) => { reset(); toast(why, 4500); } });
}
function pickVoices() {
  const vs = speechSynthesis.getVoices().filter((v) => /^en[-_](US|GB|AU|CA)/i.test(v.lang));
  return vs.length ? vs : speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
}
const spoken = []; // keep utterances referenced (Chrome drops onend of garbage-collected utterances)
/** Browser TTS fallback. Resolves true when every line was spoken, false on error. */
function speakScript(text, band, onStart) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve(false);
    speechSynthesis.cancel();
    const voices = pickVoices();
    const lines = String(text).replace(/[\u2190-\u21FF]/g, ' ').split(/\n|(?=\b[AB]:)/).map((s) => s.trim()).filter(Boolean);
    let i = 0;
    spoken.length = 0;
    const next = () => {
      if (i >= lines.length) return resolve(true);
      const line = lines[i++];
      const m = line.match(/^([AB]):\s*(.*)$/);
      const u = new SpeechSynthesisUtterance(m ? m[2] : line);
      u.lang = 'en-US'; u.rate = band === '3-5' ? 0.82 : band === '6-8' ? 0.9 : 0.97;
      if (voices.length) u.voice = voices[m && m[1] === 'B' && voices.length > 1 ? 1 : 0];
      if (m && m[1] === 'B') u.pitch = 1.25;
      u.onstart = () => onStart && onStart();
      u.onend = () => setTimeout(next, 250);
      u.onerror = (e) => resolve(e && (e.error === 'interrupted' || e.error === 'canceled'));
      spoken.push(u);
      speechSynthesis.speak(u);
    };
    setTimeout(next, 60); // Chrome may drop an utterance queued right after cancel()
  });
}

// ----- speaking -----
function pickMime() {
  for (const m of ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm']) if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
  return '';
}
const fmtOf = (mime) => (mime.includes('ogg') ? 'ogg' : mime.includes('mp4') ? 'mp4' : 'webm');
function stopRecorder(discard) { const r = T.recorder; if (r && r.state === 'recording') { r._discard = !!discard; r.stop(); } }
async function blobToB64(blob) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(blob); }); }

function renderSpeaking() {
  const v = T.view;
  const cards = (v.tasks || []).map((t, idx) => {
    const st = T.pending.get(t.id)?.state || (t.status === 'scored' ? 'done' : t.status === 'error' ? 'error' : t.status === 'pending' ? 'sending' : 'open');
    const p = t.payload, kids = v.band === '3-5';
    const maxS = t.format === 'read_aloud' ? 25 : (p.seconds || 60);
    const openLabel = kids ? 'Nhìn tranh và nói' : p.bullets && p.bullets.length ? 'Thẻ chủ đề (cue card)' : p.situation ? 'Đóng vai tình huống' : 'Trả lời câu hỏi';
    const status = { open: null, sending: h('span', { class: 'badge warn' }, '⏳ Đang gửi & chấm…'), done: h('span', { class: 'badge ok' }, '✔ Đã ghi nhận'), error: h('span', { class: 'badge bad' }, '⚠ Chưa chấm được – em ghi âm lại nhé') }[st];
    const rec = h('button', { class: 'rec', title: 'Ghi âm', 'aria-label': 'Ghi âm phần ' + (idx + 1), disabled: st === 'sending' || st === 'done' }, '🎙');
    const timeEl = h('span', { class: 'muted', style: 'font-weight:700' }, st === 'open' || st === 'error' ? `Bấm để ghi âm (tối đa ${maxS} giây)` : '');
    rec.onclick = () => toggleRecord(t, rec, timeEl, maxS);
    return h('div', { class: 'task' + (st === 'done' ? ' done' : '') }, h('div', { class: 'row spread' }, h('div', { class: 'qmeta' }, `Phần ${idx + 1}: ${t.format === 'read_aloud' ? 'Đọc to câu sau' : openLabel}`), status),
      ctxChips(p), picture(p.image, 'sm'),
      t.format === 'read_aloud' ? h('div', { class: 'q-stem', style: 'font-size:24px' }, '“' + p.text + '”') : [h('div', { class: 'q-stem' }, p.question),
        p.bullets && p.bullets.length ? [h('div', { class: 'small', style: 'font-weight:800' }, 'You should say:'), h('ul', { class: 'cue' }, p.bullets.map((b) => h('li', {}, b)))] : null,
        p.hint_vi ? h('p', { class: 'muted' }, '💡 ' + p.hint_vi) : null, h('p', { class: 'small muted' }, kids ? `Nói 2–3 câu (khoảng ${maxS} giây).` : `Hãy nói khoảng ${Math.round(maxS * 0.6)}–${maxS} giây.`)],
      h('div', { class: 'row', style: 'gap:16px' }, rec, timeEl));
  });
  if (!pickMime() || !navigator.mediaDevices) cards.unshift(h('div', { class: 'card tint-red' }, h('span', { class: 'badge bad' }, 'Trình duyệt không hỗ trợ ghi âm. Em hãy dùng Chrome/Safari bản mới hoặc bấm "Sang phần Viết".')));
  mount(lesson([h('div', { class: 'qmeta' }, '🎤 Nói'), h('div', { class: 'instr' }, 'Ghi âm câu trả lời của em'), ...cards],
    footBar(h('span', { class: 'muted small' }, 'Bản dùng thử: ghi âm trên thiết bị, nhận xét minh họa.'),
      h('button', { class: 'btn-lg btn-block', onclick: () => { stopRecorder(false); advanceSection(); } }, 'Sang phần Viết →'))));
  tick();
}
async function toggleRecord(task, btn, timeEl, maxS) {
  if (T.recorder && T.recorder.state === 'recording') { stopRecorder(false); return; }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch { toast('Không dùng được micro. Em hãy cho phép trình duyệt truy cập micro.'); return; }
  const mime = pickMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks = [];
  const t0 = Date.now();
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const iv = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); timeEl.textContent = `● Đang ghi ${s}s / ${maxS}s — bấm lần nữa để dừng`; if (s >= maxS) stopRecorder(false); }, 250);
  rec.onstop = async () => {
    clearInterval(iv); stream.getTracks().forEach((tr) => tr.stop()); btn.classList.remove('on'); T.recorder = null;
    if (rec._discard) return;
    if (Date.now() - t0 < 1200) { toast('Bản ghi quá ngắn, em thử lại nhé'); return; }
    const blob = new Blob(chunks, { type: rec.mimeType || mime });
    uploadSpeaking(task.id, blob, fmtOf(rec.mimeType || mime), Date.now() - t0);
    if (T.view.section === 'S') renderSpeaking();
  };
  T.recorder = rec; rec.start(500); btn.classList.add('on');
}
function uploadSpeaking(itemId, blob, format, durationMs) {
  const entry = { state: 'sending' };
  entry.promise = (async () => {
    const b64 = await blobToB64(blob);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await api('/api/session/speaking', { method: 'POST', body: { item_id: itemId, audio_base64: b64, audio_format: format, duration_ms: durationMs }, headers: authH() });
        entry.state = r.data.scoring_status === 'scored' ? 'done' : 'error';
        if (entry.state === 'done') break;
      } catch (e) { entry.state = 'error'; if (e.status && e.status < 500 && e.code !== 'network') break; }
      await sleep(1500);
    }
    if (T.view && T.view.section === 'S' && !(T.recorder && T.recorder.state === 'recording')) renderSpeaking();
  })();
  T.pending.set(itemId, entry);
}

// ----- writing -----
function renderWriting() {
  const v = T.view, t = (v.tasks || [])[0];
  if (!t) return mount(lesson(h('p', {}, 'Không có nhiệm vụ viết.'), footBar(null, h('button', { class: 'btn-lg btn-block', onclick: advanceSection }, 'Hoàn thành'))));
  const saved = sessionStorage.getItem('ip_w_' + t.id) || '';
  const count = h('span', { class: 'badge' });
  const ta = h('textarea', { id: 'wtext', spellcheck: 'false', autocapitalize: 'sentences', placeholder: 'Write here…', 'aria-label': 'Bài viết' });
  ta.value = saved;
  const upd = () => { const n = (ta.value.match(/[A-Za-z'’-]+/g) || []).length; count.textContent = `${n} từ (gợi ý ${t.payload.min_words}–${t.payload.max_words})`; count.className = 'badge ' + (n >= t.payload.min_words ? 'ok' : 'warn'); sessionStorage.setItem('ip_w_' + t.id, ta.value); };
  ta.oninput = upd; upd();
  const btn = h('button', { class: 'btn-lg btn-block', onclick: () => { if (!ta.value.trim() && !confirm('Em chưa viết gì. Vẫn nộp bài?')) return; submitWriting(ta.value, false, btn); } }, t.status === 'error' ? '↻ Thử chấm lại' : '📨 Nộp bài viết');
  mount(lesson([h('div', { class: 'qmeta' }, '✍️ Viết'), ctxChips(t.payload), h('div', { class: 'instr' }, t.payload.genre === 'story' && t.payload.image ? 'Nhìn 3 tranh và kể lại câu chuyện' : t.payload.image ? 'Nhìn tranh và viết' : 'Viết bằng tiếng Anh'), h('div', { class: 'q-stem' }, t.payload.prompt), picture(t.payload.image, t.payload.genre === 'story' ? 'sm story' : 'sm'),
    t.payload.prompt_vi ? h('div', { class: 'listen-row' }, h('img', { src: '/img/fox-study.webp', alt: '', width: 70, height: 77, style: 'width:70px;flex:none' }), h('div', { class: 'bubble' }, '🇻🇳 ' + t.payload.prompt_vi)) : null, ta],
  footBar(count, btn), true));
  tick();
}
async function submitWriting(text, auto, btn) {
  const t = (T.view.tasks || [])[0];
  if (!t || T.busy) return; T.busy = true;
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang chấm bài viết…'; }
  try {
    const r = await api('/api/session/answer', { method: 'POST', body: { item_id: t.id, text }, headers: authH() });
    if (r.data.scoring_status === 'error') {
      toast('Chưa chấm được bài viết, em bấm "Thử chấm lại" nhé');
      if (auto) { applyView((await api('/api/session/advance', { method: 'POST', body: { section: 'W' }, headers: authH() })).data); return; }
    }
    applyView(r.data);
  } catch (e) {
    if (e.code === 'too_many_attempts') { applyView((await api('/api/session/advance', { method: 'POST', body: { section: 'W' }, headers: authH() })).data); return; }
    handleTestError(e);
  } finally { T.busy = false; }
}

// ----- finishing -----
async function finishing() {
  setBand(T.view && T.view.band);
  mount(h('div', { class: 'lesson' }, h('div', { class: 'lesson-body intro slide-in', style: 'padding-top:40px' }, fox('cheer'), h('h2', {}, 'Em đã hoàn thành bài kiểm tra!'),
    h('p', {}, 'Tuyệt vời! Hệ thống đang tổng hợp kết quả và chấm phần Nói, Viết…'), h('div', { class: 'progress', style: 'max-width:360px;margin:18px auto' }, h('span', { style: 'width:85%' })), h('div', { class: 'spinner' }))));
  const waits = [...T.pending.values()].map((e) => e.promise);
  await Promise.race([Promise.allSettled(waits), sleep(120000)]);
  for (let i = 0; i < 60; i++) {
    try {
      const r = await api('/api/session/finish', { method: 'POST', body: {}, headers: authH() });
      if (r.status === 202) { await sleep(r.data.retry_after_ms || 3000); continue; }
      localStorage.setItem(LS.result, r.data.result_token);
      localStorage.removeItem(LS.session);
      location.hash = '#/r/' + r.data.result_token;
      return;
    } catch (e) {
      if (e.code === 'sections_remaining') return refresh();
      if (e.status === 401) return handleTestError(e);
      await sleep(3000);
    }
  }
  toast('Chưa tổng hợp được kết quả, vui lòng tải lại trang.');
}

// ---------------- charts ----------------
// Same bands as worker/engine.js cefrLabel: Pre-A1 <0.5, A1 <1.5, A2 <2.5, B1 <3.5, B2 <4.5, C1.
const CEFR_CUTS = [0.5, 1.5, 2.5, 3.5, 4.5];
function cefrOf(t) { if (t == null || Number.isNaN(t)) return '—'; return CEFR[CEFR_CUTS.filter((c) => t >= c).length]; }
function skillBars(skills) {
  const keys = ['L', 'R', 'S', 'W'];
  const W = 640, rowH = 52, left = 96, right = 16, top = 28;
  const x = (t) => left + (t / 5) * (W - left - right);
  const H = top + keys.length * rowH + 4;
  return svg('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': 'Biểu đồ năng lực 4 kỹ năng', style: 'font-family:inherit' },
    CEFR_CUTS.map((c) => svg('line', { x1: x(c), x2: x(c), y1: top - 6, y2: H - 4, class: 'tick' })),
    CEFR.map((c, i) => svg('text', { x: x(i === 0 ? 0.25 : i === 5 ? 4.75 : i), y: 15, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#AFAFAF' }, c)),
    keys.map((k, i) => {
      const s = skills[k] || {}, y = top + i * rowH;
      const has = s.theta != null;
      return [svg('text', { x: 0, y: y + 27, 'font-size': 17, 'font-weight': 800, fill: '#3C3C3C' }, `${SK[k].icon} ${SK[k].vi}`),
        svg('rect', { x: left, y: y + 8, width: W - left - right, height: 28, rx: 14, class: 'bar-bg' }),
        has ? svg('rect', { x: left, y: y + 8, width: Math.max(28, x(s.theta) - left), height: 28, rx: 14, fill: COLORS[k] }) : null,
        has ? svg('rect', { x: left + 10, y: y + 13, width: Math.max(8, x(s.theta) - left - 20), height: 6, rx: 3, fill: 'rgba(255,255,255,.35)' }) : null,
        svg('text', { x: has ? Math.min(x(s.theta) + 8, W - right - 56) : left + 12, y: y + 27, 'font-size': 14, 'font-weight': 900, fill: has && x(s.theta) > W - right - 64 ? '#fff' : '#3C3C3C' },
          has ? s.cefr : (s.status === 'error' ? 'chưa chấm được' : 'chưa đủ dữ liệu'))];
    }));
}
function radar(skills) {
  const keys = ['L', 'R', 'W', 'S'], C = 130, R = 92;
  const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / keys.length; return [C + Math.cos(a) * R * v, C + Math.sin(a) * R * v]; };
  const poly = keys.map((k, i) => pt(i, ((skills[k] || {}).theta ?? 0) / 5).join(',')).join(' ');
  return svg('svg', { viewBox: '0 0 260 260', width: '100%', style: 'max-width:280px;font-family:inherit', role: 'img', 'aria-label': 'Biểu đồ cân bằng kỹ năng' },
    [0.2, 0.4, 0.6, 0.8, 1].map((r) => svg('polygon', { points: keys.map((_, i) => pt(i, r).join(',')).join(' '), fill: r === 1 ? '#F7F7F7' : 'none', stroke: '#E5E5E5', 'stroke-width': 2 })),
    keys.map((k, i) => svg('line', { x1: C, y1: C, x2: pt(i, 1)[0], y2: pt(i, 1)[1], stroke: '#E5E5E5', 'stroke-width': 2 })),
    svg('polygon', { points: poly, fill: 'rgba(28,176,246,.25)', stroke: '#1CB0F6', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
    keys.map((k, i) => { const [px, py] = pt(i, 1.2); return svg('text', { x: px, y: py + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 900, fill: COLORS[k] }, SK[k].vi); }));
}
function cefrDist(dist) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  return h('div', {}, CEFR.map((c) => h('div', { class: 'dist-row' }, h('b', {}, c), h('div', { class: 'dist-bar' }, h('span', { style: `width:${(dist[c] / total) * 100}%` })), h('span', { class: 'small', style: 'text-align:right;font-weight:800' }, dist[c]))));
}
function statTable(groups, label) {
  return tbl([label, 'Tham gia', 'Hoàn thành', 'Tổng thể', 'Nghe', 'Đọc', 'Nói', 'Viết'],
    groups.map((g) => [h('b', {}, g.key), g.participants, `${g.completed} (${Math.round(g.completion_rate * 100)}%)`, ...['overall', 'L', 'R', 'S', 'W'].map((k) => cefrOf(g.avg[k]))]));
}
function qrNode(text) {
  if (typeof qrcode !== 'function') return h('span');
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const box = h('div', { class: 'qr' });
  const doc = new DOMParser().parseFromString(q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }), 'image/svg+xml');
  box.append(document.importNode(doc.documentElement, true));
  return box;
}
const statTile = (label, value, c, sub) => h('div', { class: 'stat', style: `--c:${c}` }, h('div', { class: 'stat-head' }, label), h('div', { class: 'stat-body' }, value, sub ? h('small', {}, sub) : null));
function notFound(title, text) { return h('div', { class: 'card center', style: 'max-width:520px;margin:30px auto' }, fox('study'), h('h2', {}, title), h('p', {}, text), h('a', { class: 'btn', href: '#/' }, 'Trang chủ')); }

// ---------------- results ----------------
async function resultPage(token) {
  if (!token) return home();
  mount(loading());
  let r;
  try { r = (await api('/api/results', { headers: { 'x-result-token': token } })).data.result; } catch (e) {
    return mount(notFound('Không tìm thấy kết quả', 'Đường link có thể đã hết hiệu lực. Vui lòng liên hệ nhân viên GE để nhận link mới.'));
  }
  localStorage.setItem(LS.result, token);
  sessionStorage.setItem('ip_result_tok', token);
  setBand(bandOf(r.student.grade));
  const link = `${location.origin}/#/r/${token}`;
  const sk = r.skills;
  const scored = ['L', 'R', 'S', 'W'].filter((k) => sk[k] && sk[k].theta != null).sort((a, b) => sk[b].theta - sk[a].theta);
  const verdictBadge = (v) => h('span', { class: 'badge ' + (v === 'match' ? 'ok' : v === 'unknown' ? 'gray' : 'warn') }, v === 'match' ? 'Khớp' : v === 'underestimate' ? 'Giỏi hơn em nghĩ' : v === 'overestimate' ? 'Cần luyện thêm' : '—');
  // SPEC 14: this page is the parent share link -> no "Độ tin cậy của kết quả" block; the level only drives neutral labels (staff pages show confidence)
  const conf = r.confidence || { level: null };
  const low = conf.level === 'low';
  const stepsCard = h('div', { class: 'card', style: '--c:var(--blue)', id: 'next-steps' }, h('h2', {}, '🚀 Mục tiêu tiếp theo'),
    h('ul', { class: 'list' }, (r.next_steps || []).map((x) => h('li', {}, x.text_vi))));
  const ability = (a) => h('li', { class: 'ability ' + a.status }, h('b', {}, `${SK[a.skill].icon} ${SK[a.skill].vi}: `), h('span', { class: a.status === 'insufficient' ? 'muted' : '' }, a.text_vi));
  const listOrNote = (xs) => xs.length ? h('ul', { class: 'list' }, xs.map((s) => h('li', {}, h('b', {}, s.label_vi), h('span', { class: 'muted small' }, ` — ${s.evidence_vi}`)))) : h('p', { class: 'muted small' }, 'Chưa đủ dữ liệu để nhận xét.');
  const estimated = r.overall.estimated || conf.level == null;
  // SPEC 13: low confidence shows every section too, labelled "tham khảo" (reference only), never hidden
  const hedge = () => conf.level !== 'high' ? h('p', { class: 'small muted', style: 'margin:-.3em 0 .6em' }, low ? 'Kết quả tham khảo, nhận xét theo kỹ năng – cần xác nhận thêm.' : 'Nhận xét theo kỹ năng – cần xác nhận thêm.') : null;
  const levelSub = !r.overall.cefr ? 'Chưa có phần nào được chấm' : low ? 'CEFR tham chiếu – kết quả tham khảo, cần xác nhận thêm' : estimated ? 'CEFR tham chiếu, ước lượng – chưa hiệu chuẩn' : 'CEFR tham chiếu – chưa hiệu chuẩn';
  const share = h('div', { class: 'card noprint' }, h('h3', {}, 'Chia sẻ báo cáo'), h('p', { class: 'small muted' }, 'Link cá nhân – chỉ chia sẻ cho phụ huynh/người được phép.'),
    h('div', { class: 'row' }, h('input', { type: 'text', value: link, readonly: true, style: 'flex:1 1 240px', 'aria-label': 'Link báo cáo' }),
      h('button', { class: 'btn-blue', onclick: () => navigator.clipboard.writeText(link).then(() => toast('Đã sao chép link')) }, 'Sao chép'),
      h('button', { class: 'btn2', onclick: () => window.print() }, 'In / Lưu PDF')));
  const hero = h('section', { class: 'card hero result-hero' },
    fox(low ? 'study' : 'cheer', 'fox'),
    h('div', {}, h('div', { class: 'qmeta' }, `${r.student.school_name} · Lớp ${r.student.class_name || r.student.grade} · ${r.student.test_date}`),
      h('h1', { style: 'margin:.2em 0' }, `Kết quả của ${r.student.full_name}`),
      h('div', { class: 'row', style: 'gap:16px' }, h('div', { class: 'big-level' + (r.overall.cefr ? '' : ' pending') }, r.overall.cefr || 'Chưa có dữ liệu'),
        h('div', {}, h('b', {}, 'Trình độ tổng thể'), low && r.overall.cefr ? h('span', { class: 'badge warn', style: 'margin-left:6px' }, 'Tham khảo') : null, h('div', { class: 'small muted' }, levelSub)))),
    h('div', { class: 'center noprint' }, qrNode(link), h('div', { class: 'small muted', style: 'margin-top:4px' }, 'Quét để mở báo cáo')));
  const path = r.learning_path;
  mount(
    hero,
    h('div', { class: 'grid g3' },
      statTile('Tổng thể', r.overall.cefr || '—', 'var(--green)', low ? 'CEFR tham chiếu (tham khảo)' : estimated ? 'CEFR tham chiếu (ước lượng)' : 'CEFR tham chiếu'),
      statTile('Mạnh nhất', scored[0] ? skillLabel(scored[0]) : '—', 'var(--blue)', scored[0] ? sk[scored[0]].cefr : ''),
      statTile('Cần luyện', scored.length > 1 ? skillLabel(scored[scored.length - 1]) : '—', 'var(--orange)', scored.length > 1 ? sk[scored[scored.length - 1]].cefr : '')),
    (r.scoring_issues || []).length ? h('div', { class: 'card tint-red' }, h('b', {}, '⚠ Lưu ý: '), `Phần ${r.scoring_issues.map((k) => SK[k].vi).join(', ')} chưa chấm được do sự cố kỹ thuật; kết quả tổng thể dựa trên các kỹ năng còn lại.`) : null,
    h('div', { class: 'grid g2', style: 'margin-top:16px' },
      h('div', { class: 'card' }, h('h2', {}, 'Năng lực 4 kỹ năng'), skillBars(sk),
        h('p', { class: 'small muted' }, `Từ vựng & Ngữ pháp (khởi động): ${(r.use_of_english && r.use_of_english.cefr) || '—'}`)),
      h('div', { class: 'card center' }, h('h2', {}, 'Cân bằng kỹ năng'), radar(sk))),
    h('div', { class: 'grid g2' },
      h('div', { class: 'card', style: '--c:var(--green)', id: 'abilities' }, h('h2', {}, '✅ Em đã làm được'), h('ul', { class: 'list' }, (r.abilities || []).map(ability))),
      stepsCard),
    h('div', { class: 'grid g2', style: 'margin-top:16px' },
      h('div', { class: 'card pill-s' }, h('h2', {}, '🌟 Điểm mạnh'), hedge(), listOrNote(r.strengths)),
      h('div', { class: 'card pill-w' }, h('h2', {}, '🎯 Năng lực cần cải thiện'), hedge(), listOrNote(r.improvements))),
    h('div', { class: 'card', id: 'self-vs-actual' }, h('h2', {}, 'Em tự đánh giá vs. kết quả thực tế'),
      low ? h('p', { class: 'small muted', style: 'margin:-.3em 0 .6em' }, 'So sánh mang tính tham khảo, cần xác nhận thêm.') : null,
      tbl(['Kỹ năng', 'Em tự đánh giá', 'Kết quả', 'Nhận xét'], r.self_vs_actual.map((x) => [h('b', {}, `${SK[x.skill].icon} ${x.skill_vi}`), x.self_level ? `${'⭐'.repeat(x.self_level)} ${x.self_label_vi || ''}` : '—', h('b', {}, x.actual_cefr || '—'), h('span', {}, verdictBadge(x.verdict), ' ', h('span', { class: 'small muted' }, x.verdict_vi))]))),
    path && path.units.length ? h('div', { class: 'card' }, h('h2', { class: 'center' }, path.purpose === 'confirm' ? `🗺 Lộ trình gợi ý — luyện tập để xác nhận năng lực, tập trung ${path.focus_skill_vi}` : `🗺 Lộ trình học gợi ý — tập trung ${path.focus_skill_vi}`),
      h('p', { class: 'center muted small' }, 'Bấm vào từng chặng để học từ vựng, ngữ pháp và luyện nói.'),
      stagePath(path.units.map((u, i) => ({ href: `#/learn/${u.unit}`, icon: i === 0 ? '⭐' : String(u.step), c: i === 0 ? 'var(--green)' : 'var(--blue)', cd: i === 0 ? 'var(--green-d)' : 'var(--blue-d)', aria: `Bước ${u.step}: ${u.title}`,
        title: `Bước ${u.step}: ${u.title}`, sub: `${u.level} · ${u.unit} · ${u.cefr}`, extra: h('span', { class: 'small' }, u.focus_vi) })))) : null,
    feedbackCard(r),
    (r.products || []).length ? h('div', { class: 'card' }, h('h2', {}, 'Sản phẩm phù hợp trên ICAN'), h('div', { class: 'grid g3' }, r.products.map((p) => h('div', { class: 'card tint-blue', style: 'margin:0' }, h('b', {}, p.name), h('p', { class: 'small muted', style: 'margin:.3em 0 0' }, p.reason))))) : null,
    share,
    h('p', { class: 'small muted' }, r.overall.note_vi),
  );
}
function feedbackCard(r) {
  const fb = r.feedback || { writing: [], speaking: [] };
  const w = fb.writing[0];
  const sp = fb.speaking || [];
  if (!w && !sp.length) return null;
  const crit = (c) => h('div', { class: 'chips', style: 'gap:6px;margin:6px 0' }, Object.entries(c || {}).map(([k, v]) => h('span', { class: 'badge' }, `${({ task: 'Yêu cầu', organisation: 'Bố cục', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', pronunciation: 'Phát âm', fluency: 'Trôi chảy', language: 'Ngôn ngữ' })[k] || k}: ${v}/4`)));
  return h('div', { class: 'grid g2' },
    sp.length ? h('div', { class: 'card' }, h('h2', {}, '🎤 Nhận xét phần Nói'), sp.map((s) => h('div', { style: 'margin-bottom:14px' }, h('div', { class: 'qmeta' }, s.format === 'read_aloud' ? 'Đọc to' : 'Trả lời câu hỏi'), h('div', {}, '“' + s.prompt + '”'), crit(s.criteria),
      s.weak_words && s.weak_words.length ? h('div', { class: 'small' }, 'Từ cần luyện phát âm: ', s.weak_words.map((x) => h('span', { class: 'word w-bad' }, x))) : null,
      s.feedback_vi ? h('p', { class: 'small' }, s.feedback_vi) : null))) : null,
    w ? h('div', { class: 'card' }, h('h2', {}, '✍️ Nhận xét phần Viết'), h('div', { class: 'qmeta' }, `${w.word_count} từ`), crit(w.criteria), w.feedback_vi ? h('p', {}, w.feedback_vi) : null,
      (w.improvements_vi || []).length ? h('ul', { class: 'list small' }, w.improvements_vi.map((x) => h('li', {}, x))) : null,
      w.corrected_sample ? h('p', { class: 'small' }, h('b', {}, 'Gợi ý sửa: '), w.corrected_sample) : null) : null);
}

// ---------------- learn + practice ----------------
async function learnPage(code) {
  mount(loading());
  let u;
  try { u = (await api('/api/units/' + encodeURIComponent(code || ''))).data.unit; } catch (e) { return mount(notFound('Không mở được bài học', e.message)); }
  const tok = sessionStorage.getItem('ip_result_tok') || localStorage.getItem(LS.result);
  const L = u.lesson || {};
  const practiceRow = (sentence) => {
    const out = h('div', { class: 'small', style: 'margin-top:8px' });
    const rec = h('button', { class: 'btn-orange small' }, '🎙 Ghi âm');
    const listen = h('button', { class: 'btn2 small', onclick: () => playText(sentence, u.audio, listen) }, '🔊 Nghe mẫu');
    let mr = null;
    rec.onclick = async () => {
      if (!tok) return toast('Cần mở từ trang kết quả của em để luyện nói');
      if (mr && mr.state === 'recording') { mr.stop(); return; }
      let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return toast('Không dùng được micro'); }
      const mime = pickMime(); mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); const chunks = [];
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop()); rec.textContent = '🎙 Ghi âm'; rec.classList.remove('btn-bad');
        out.replaceChildren(h('span', { class: 'muted' }, '⏳ Đang chấm phát âm…'));
        try {
          const b64 = await blobToB64(new Blob(chunks, { type: mr.mimeType || mime }));
          const r = (await api('/api/practice/pronounce', { method: 'POST', body: { text: sentence, audio_base64: b64, audio_format: fmtOf(mr.mimeType || mime) }, headers: { 'x-result-token': tok } })).data.result;
          out.replaceChildren(h('div', {}, h('span', { class: 'badge ' + ((r.overall ?? 0) >= 80 ? 'ok' : (r.overall ?? 0) >= 60 ? 'warn' : 'bad'), style: 'font-size:15px' }, `Điểm phát âm: ${r.overall ?? '—'}/100${r.illustrative ? ' (minh họa)' : ''}`), ' ', (r.weak_phonemes || []).length ? h('span', { class: 'muted' }, `· Âm cần luyện: /${r.weak_phonemes.join('/, /')}/`) : null),
            h('div', {}, (r.words || []).map((w) => h('span', { class: 'word ' + (w.score == null ? '' : w.score >= 80 ? 'w-good' : w.score >= 60 ? 'w-mid' : 'w-bad'), title: w.score == null ? '' : `${w.score}` }, w.word))));
        } catch (e) { out.replaceChildren(h('span', { class: 'badge bad' }, e.message)); }
      };
      mr.start(); rec.textContent = '⏹ Dừng'; rec.classList.add('btn-bad'); setTimeout(() => mr && mr.state === 'recording' && mr.stop(), 20000);
    };
    return h('div', { class: 'task', style: 'margin:10px 0' }, h('div', { class: 'q-stem', style: 'font-size:19px;margin:0 0 10px' }, sentence), h('div', { class: 'row' }, listen, rec), out);
  };
  mount(
    h('section', { class: 'card hero page-hero' }, h('div', {}, h('div', { class: 'qmeta' }, `${u.level} · ${u.code} · CEFR ${u.cefr}`), h('h1', { style: 'margin:.2em 0' }, u.title), L.summary_vi ? h('p', {}, L.summary_vi) : null,
      tok ? h('a', { class: 'btn btn2 small', href: '#/r/' + tok }, '← Về báo cáo của em') : null), fox('study')),
    h('div', { class: 'grid g2' },
      h('div', { class: 'card' }, h('h2', {}, '📚 Từ vựng'), h('div', { class: 'vocab' }, (L.vocab || []).map((v) => h('div', { class: 'vocab-item' },
        h('div', { style: 'min-width:0' }, h('b', { style: 'font-size:18px;color:var(--ink-strong)' }, v.word), h('div', { class: 'small muted' }, v.meaning_vi), h('div', { class: 'small' }, v.example)),
        h('button', { class: 'btn-blue small', 'aria-label': 'Nghe ví dụ', style: 'flex:none', onclick: (e) => playText(v.example, u.audio, e.currentTarget) }, '🔊'))))),
      h('div', { class: 'stack' },
        h('div', { class: 'card', style: 'margin:0' }, h('h2', {}, '🧠 Ngữ pháp'), h('p', { class: 'small muted' }, u.grammar), L.grammar_vi ? h('p', {}, L.grammar_vi) : null,
          h('ul', { class: 'list', style: '--c:var(--purple)' }, (L.grammar_examples || []).map((x) => h('li', {}, x)))),
        h('div', { class: 'card', style: 'margin:0' }, h('h2', {}, '🎯 Sau bài học em có thể'), h('ul', { class: 'list' }, (L.can_do_vi || u.can_do || []).map((x) => h('li', {}, x)))))),
    h('div', { class: 'card' }, h('h2', {}, '🎤 Luyện nói và phát âm'),
      h('p', { class: 'small muted' }, tok ? 'Nghe mẫu, bấm Ghi âm, đọc câu rồi bấm Dừng. Bản dùng thử hiển thị điểm phát âm minh họa.' : 'Mở bài học từ trang kết quả của em để dùng tính năng luyện phát âm.'),
      (L.speaking_practice || []).map(practiceRow)),
  );
}

// ---------------- school report (token link, no PII) ----------------
async function schoolPage(token) {
  if (!token) return home();
  mount(loading());
  let d;
  try { d = (await api('/api/school-report', { headers: { 'x-report-token': token } })).data; } catch (e) { return mount(notFound('Không mở được báo cáo trường', e.message)); }
  const s = d.summary;
  let tab = 'by_grade';
  const tabBox = h('div');
  const drawTab = () => tabBox.replaceChildren(
    h('div', { class: 'tabs', role: 'tablist' }, [['by_grade', 'Theo khối'], ['by_class', 'Theo lớp'], ['by_campaign', 'Theo đợt']].map(([k, l]) => h('button', { class: 'tab' + (k === tab ? ' on' : ''), role: 'tab', 'aria-selected': k === tab ? 'true' : 'false', onclick: () => { tab = k; drawTab(); } }, l))),
    statTable(d[tab], tab === 'by_grade' ? 'Khối' : tab === 'by_class' ? 'Lớp' : 'Đợt'));
  drawTab();
  mount(
    h('section', { class: 'card hero page-hero' }, h('div', {}, h('div', { class: 'qmeta' }, `Báo cáo nhà trường · ${d.school.id}`), h('h1', { style: 'margin:.2em 0' }, d.school.name), h('p', { class: 'muted', style: 'margin:0' }, 'School English Performance Report — dữ liệu tổng hợp, không có họ tên học sinh.')), fox('hello')),
    h('div', { class: 'grid g4' },
      statTile('Tham gia', h('span', { class: 'kpi' }, s.participants), 'var(--blue)'),
      statTile('Hoàn thành', h('span', { class: 'kpi' }, s.completed), 'var(--green)'),
      statTile('Tỷ lệ hoàn thành', h('span', { class: 'kpi' }, `${Math.round(s.completion_rate * 100)}%`), 'var(--purple)'),
      statTile('Mức trung bình', h('span', { class: 'kpi' }, cefrOf(s.avg.overall)), 'var(--orange)')),
    h('div', { class: 'grid g2', style: 'margin-top:16px' },
      h('div', { class: 'card' }, h('h2', {}, 'Phân bố trình độ (CEFR)'), cefrDist(s.cefr_distribution),
        s.low_confidence ? h('p', { class: 'small muted' }, `${s.low_confidence} bài làm chưa đủ dữ liệu tin cậy không được tính vào phân bố và mức trung bình.`) : null),
      h('div', { class: 'card' }, h('h2', {}, 'Năng lực trung bình theo kỹ năng'), skillBars(Object.fromEntries(['L', 'R', 'S', 'W'].map((k) => [k, { theta: s.avg[k], cefr: cefrOf(s.avg[k]) }]))))),
    h('div', { class: 'card' }, h('h2', {}, 'Chi tiết'), tabBox),
    h('div', { class: 'card' }, h('h2', {}, 'Năng lực cần ưu tiên cải thiện'),
      d.weak_competencies.length ? tbl(['Năng lực', 'Số HS', 'Tỷ lệ'], d.weak_competencies.map((w) => [h('b', {}, w.label_vi), w.students, `${Math.round(w.share * 100)}%`])) : h('p', { class: 'muted' }, 'Chưa có dữ liệu.')),
    h('p', { class: 'small muted' }, d.note_vi),
    h('p', { class: 'noprint' }, h('button', { class: 'btn2', onclick: () => window.print() }, 'In / Lưu PDF')),
  );
}

// ---------------- staff console ----------------
const ROLE_VI = { admin: 'Quản trị viên', staff: 'Nhân viên GE' };
async function staffPage(tab, id) {
  tab = tab || 'dashboard';
  let me;
  try { me = (await api('/api/staff/me')).data; } catch (e) { if (e.status === 401) return staffLogin(); return mount(notFound('Không tải được', e.message)); }
  if (tab === 'admin' && me.role !== 'admin') { toast('Chức năng này chỉ dành cho quản trị viên'); location.hash = '#/staff/dashboard'; return; }
  setMode('console');
  const items = [['dashboard', '📊', 'Tổng quan'], ['schools', '🏫', 'Trường'], ['campaigns', '🗓', 'Đợt kiểm tra']];
  if (me.role === 'admin') items.push(['admin', '🛡', 'Quản trị']);
  const nav = () => items.map(([k, ic, l]) => h('a', { class: 'navitem' + (k === tab ? ' on' : ''), href: '#/staff/' + k, 'aria-current': k === tab ? 'page' : null }, h('span', { class: 'ni', 'aria-hidden': 'true' }, ic), h('span', {}, l)));
  const logout = async () => { await api('/api/staff/logout', { method: 'POST', body: {} }); location.hash = '#/'; };
  const body = h('div', {}, loading());
  const titles = { dashboard: 'Tổng quan', schools: 'Trường học', campaigns: 'Đợt kiểm tra', admin: 'Quản trị hệ thống' };
  mount(h('div', { class: 'console' },
    h('aside', { class: 'sidenav', 'aria-label': 'Điều hướng nhân viên' }, brandLink(), nav(),
      h('div', { class: 'me' }, h('div', { style: 'font-weight:800;color:var(--ink-strong)' }, me.name), h('span', { class: 'role-badge' }, ROLE_VI[me.role] || me.role),
        h('p', {}, h('button', { class: 'btn2 small btn-block', onclick: logout }, 'Đăng xuất')))),
    h('div', { style: 'min-width:0' },
      h('header', { class: 'console-top' }, brandLink(), h('div', { class: 'row', style: 'gap:8px' }, h('span', { class: 'role-badge' }, ROLE_VI[me.role] || me.role), h('button', { class: 'btn2 small', onclick: logout }, 'Đăng xuất'))),
      h('section', { class: 'console-main' },
        h('div', { class: 'row spread' }, h('h1', { style: 'margin:0' }, titles[tab] || 'Bảng điều khiển GE'), h('span', { class: 'muted small' }, `Xin chào, ${me.name}`)),
        body)),
    h('nav', { class: 'bottomnav', 'aria-label': 'Điều hướng nhân viên' }, nav())));
  try {
    if (tab === 'schools') await staffSchools(body, me);
    else if (tab === 'campaigns' && id) await staffCampaign(body, id, me);
    else if (tab === 'campaigns') await staffCampaigns(body);
    else if (tab === 'admin') await adminPage(body, id || 'overview', me);
    else await staffDashboard(body);
  } catch (e) { body.replaceChildren(h('div', { class: 'card tint-red' }, h('span', { class: 'badge bad' }, e.message))); }
}
function staffLogin() {
  setMode('site');
  const f = { username: '', password: '' };
  const submit = async (ev) => {
    ev.preventDefault();
    const btn = ev.target.querySelector('button[type=submit]'); btn.disabled = true;
    try { await api('/api/staff/login', { method: 'POST', body: f }); router(); } catch (e) { toast(e.message); btn.disabled = false; }
  };
  mount(h('form', { class: 'card', style: 'max-width:440px;margin:24px auto', onsubmit: submit },
    h('div', { class: 'center' }, h('img', { src: '/img/fox-hello.webp', alt: '', width: 120, height: 131, style: 'width:120px' })),
    h('h2', { class: 'center' }, 'Đăng nhập nhân viên GE'),
    h('label', {}, 'Tên đăng nhập hoặc họ tên'), h('input', { type: 'text', autocomplete: 'username', placeholder: 'VD: lan.nv hoặc Nguyễn Thị Lan', oninput: (e) => (f.username = e.target.value) }),
    h('label', {}, 'Mật khẩu'), h('input', { type: 'password', autocomplete: 'current-password', oninput: (e) => (f.password = e.target.value) }),
    h('p', { class: 'small muted' }, 'Tài khoản riêng: nhập tên đăng nhập + mật khẩu riêng. Mật khẩu chung: nhập họ tên của bạn + mật khẩu nhân viên chung. Quản trị viên: tên đăng nhập "admin".'),
    h('p', {}, h('button', { type: 'submit', class: 'btn-lg btn-block' }, 'Đăng nhập'))));
}
async function staffSchools(body, me) {
  const [{ data: pv }, { data: sc }] = await Promise.all([api('/api/catalog/provinces'), api('/api/staff/schools')]);
  const f = { province_code: '', ward_name: '', name: '', ownership: 'public', specialized: false, program: '', verified: true };
  const wardList = h('datalist', { id: 'wards' });
  const prov = h('select', { onchange: async (e) => { f.province_code = e.target.value; const w = (await api('/api/catalog/wards?province=' + encodeURIComponent(f.province_code))).data.wards; wardList.replaceChildren(...w.map((x) => h('option', { value: x.name }))); } },
    h('option', { value: '' }, '— Chọn tỉnh/thành —'), pv.provinces.map((p) => h('option', { value: p.code }, p.name)));
  const create = async () => {
    try {
      const r = (await api('/api/staff/schools', { method: 'POST', body: { ...f, program: f.program || null } })).data.school;
      toast(`Đã tạo trường ${r.name} – School ID ${r.id}`); staffPage('schools');
    } catch (e) { toast(e.code === 'school_exists' ? `Trường đã có: ${e.data.school_id}` : e.message); }
  };
  const reportLink = async (id) => {
    try {
      const r = (await api(`/api/staff/schools/${id}/report-link`, { method: 'POST', body: {} })).data;
      const link = `${location.origin}/#/school/${r.report_token}`;
      body.prepend(h('div', { class: 'card tint-green' }, h('b', {}, 'Link báo cáo trường (gửi cho nhà trường; tạo lại sẽ vô hiệu link cũ):'), h('div', { class: 'row', style: 'margin-top:8px' }, qrNode(link), h('input', { type: 'text', readonly: true, value: link, style: 'flex:1 1 220px' }), h('a', { class: 'btn btn2', href: '#/school/' + r.report_token }, 'Mở'))));
      window.scrollTo(0, 0);
    } catch (e) { toast(e.message); }
  };
  const rename = async (s) => {
    const name = prompt('Tên mới cho trường ' + s.id, s.name); if (!name || name === s.name) return;
    try { await api('/api/admin/schools/' + s.id, { method: 'PATCH', body: { name } }); toast('Đã đổi tên trường'); staffPage('schools'); } catch (e) { toast(e.message); }
  };
  const remove = async (s) => {
    const c = prompt(`XÓA trường "${s.name}" cùng ${s.campaigns} đợt và ${s.students} học sinh (không khôi phục được).\nNhập đúng mã ${s.id} để xác nhận:`); if (c == null) return;
    try { const r = (await api('/api/admin/schools/' + s.id, { method: 'DELETE', body: { confirm: c.trim() } })).data; toast(`Đã xóa trường (${r.deleted.students} học sinh)`); staffPage('schools'); } catch (e) { toast(e.message); }
  };
  const isAdmin = me.role === 'admin';
  body.replaceChildren(
    h('div', { class: 'card' }, h('h2', {}, '➕ Thêm trường (School Profiling)'),
      h('div', { class: 'grid g2' },
        h('div', {}, h('label', {}, 'Tỉnh/thành phố'), prov),
        h('div', {}, h('label', {}, 'Xã/phường (chọn hoặc nhập mới)'), h('input', { type: 'text', list: 'wards', oninput: (e) => (f.ward_name = e.target.value) }), wardList),
        h('div', {}, h('label', {}, 'Tên trường'), h('input', { type: 'text', oninput: (e) => (f.name = e.target.value) })),
        h('div', {}, h('label', {}, 'Loại hình'), chips([['public', 'Công lập'], ['private', 'Tư thục']], (k) => f.ownership === k, (k) => (f.ownership = k)),
          h('label', { class: 'check-inline', style: 'margin-top:8px' }, h('input', { type: 'checkbox', onchange: (e) => (f.specialized = e.target.checked) }), 'Trường chuyên')),
        h('div', {}, h('label', {}, 'Chương trình tiếng Anh (nếu biết)'), chips(PROGRAMS, (k) => f.program === k, (k) => (f.program = f.program === k ? '' : k)))),
      h('p', { style: 'margin-top:16px' }, h('button', { onclick: create }, '＋ Tạo trường'))),
    h('div', { class: 'card' }, h('h2', {}, `Danh sách trường (${sc.schools.length})`),
      sc.schools.length ? tbl(['School ID', 'Trường', 'Địa bàn', 'Loại hình', 'Đợt / HS', ''],
        sc.schools.map((s) => [h('code', {}, s.id), h('b', {}, s.name), h('span', { class: 'small' }, `${s.ward || ''}, ${s.province}`),
          h('span', { class: 'small' }, `${s.ownership === 'public' ? 'Công lập' : 'Tư thục'}${s.specialized ? ' · chuyên' : ''}${s.program ? ' · ' + ((PROGRAMS.find((p) => p[0] === s.program) || [])[1] || '') : ''}`),
          `${s.campaigns} / ${s.students}`,
          h('div', { class: 'row', style: 'justify-content:flex-end' }, h('a', { class: 'btn btn2 small', href: `#/staff/campaigns?school=${s.id}` }, 'Đợt KT'), h('button', { class: 'btn-ghost small', onclick: () => reportLink(s.id) }, 'Link báo cáo'),
            isAdmin ? h('button', { class: 'btn-ghost small', onclick: () => rename(s) }, 'Đổi tên') : null, isAdmin ? h('button', { class: 'btn-bad small', onclick: () => remove(s) }, 'Xóa') : null)])) : emptyState('Chưa có trường nào.')));
}
async function staffCampaigns(body) {
  const sid = new URLSearchParams(location.hash.split('?')[1] || '').get('school');
  const [{ data: cs }, { data: sc }] = await Promise.all([api('/api/staff/campaigns' + (sid ? '?school_id=' + encodeURIComponent(sid) : '')), api('/api/staff/schools')]);
  const f = { school_id: sid || '', test_date: new Date().toISOString().slice(0, 10), grades: [], teacher: '', name: '' };
  const create = async () => {
    try { const r = (await api('/api/staff/campaigns', { method: 'POST', body: f })).data.campaign; toast('Đã tạo đợt, mã tham gia ' + r.join_code); location.hash = '#/staff/campaigns/' + r.id; } catch (e) { toast(e.message); }
  };
  body.replaceChildren(
    h('div', { class: 'card' }, h('h2', {}, '➕ Tạo đợt kiểm tra'),
      h('div', { class: 'grid g2' },
        h('div', {}, h('label', {}, 'Trường'), h('select', { onchange: (e) => (f.school_id = e.target.value) }, h('option', { value: '' }, '— Chọn trường —'), sc.schools.map((s) => h('option', { value: s.id, selected: s.id === sid }, `${s.name} (${s.id})`)))),
        h('div', {}, h('label', {}, 'Ngày kiểm tra'), h('input', { type: 'date', value: f.test_date, oninput: (e) => (f.test_date = e.target.value) })),
        h('div', {}, h('label', {}, 'Giáo viên phụ trách'), h('input', { type: 'text', oninput: (e) => (f.teacher = e.target.value) })),
        h('div', {}, h('label', {}, 'Tên đợt (tùy chọn)'), h('input', { type: 'text', oninput: (e) => (f.name = e.target.value) }))),
      h('label', {}, 'Khối lớp triển khai'), chips([3, 4, 5, 6, 7, 8, 9, 10, 11].map((g) => [g, 'Lớp ' + g]), (g) => f.grades.includes(g), (g) => (f.grades = f.grades.includes(g) ? f.grades.filter((x) => x !== g) : [...f.grades, g])),
      h('p', { style: 'margin-top:16px' }, h('button', { onclick: create }, '＋ Tạo đợt kiểm tra'))),
    h('div', { class: 'card' }, h('h2', {}, 'Các đợt kiểm tra'),
      cs.campaigns.length ? tbl(['Ngày', 'Trường', 'Khối', 'Mã tham gia', 'HS / hoàn thành', 'Trạng thái'],
        cs.campaigns.map((c) => [h('a', { href: '#/staff/campaigns/' + c.id }, c.test_date), c.school_name, c.grades.join(', '), h('code', { style: 'font-size:17px' }, c.join_code), `${c.students} / ${c.completed}`, h('span', { class: 'badge ' + (c.status === 'open' ? 'ok' : 'gray') }, c.status === 'open' ? 'Đang mở' : 'Đã đóng')])) : emptyState('Chưa có đợt kiểm tra nào.')));
}
async function staffCampaign(body, id, me) {
  const { data } = await api('/api/staff/campaigns/' + encodeURIComponent(id));
  const c = data.campaign;
  const joinLink = `${location.origin}/#/join/${c.join_code}`;
  const resultLink = async (sid, cell) => {
    try {
      const r = (await api(`/api/staff/sessions/${sid}/result-link`, { method: 'POST', body: {} })).data;
      const link = `${location.origin}/#/r/${r.result_token}`;
      cell.replaceChildren(h('div', { class: 'row' }, qrNode(link), h('a', { href: '#/r/' + r.result_token, class: 'small' }, 'Mở báo cáo')));
    } catch (e) { toast(e.message); }
  };
  const toggle = async () => { await api('/api/staff/campaigns/' + id, { method: 'PATCH', body: { status: c.status === 'open' ? 'closed' : 'open' } }); staffPage('campaigns', id); };
  const remove = async () => {
    const v = prompt(`XÓA đợt ${c.id} cùng ${data.students.length} học sinh và kết quả (không khôi phục được).\nNhập đúng mã ${c.id} để xác nhận:`); if (v == null) return;
    try { await api('/api/admin/campaigns/' + c.id, { method: 'DELETE', body: { confirm: v.trim() } }); toast('Đã xóa đợt kiểm tra'); location.hash = '#/staff/campaigns'; } catch (e) { toast(e.message); }
  };
  body.replaceChildren(
    h('div', { class: 'card' }, h('div', { class: 'row spread' }, h('div', {}, h('h2', { style: 'margin:0' }, `${c.school_name} · ${c.test_date}`), h('div', { class: 'muted small' }, `Khối ${c.grades.join(', ')} · GV: ${c.teacher || '—'} · NV GE: ${c.ge_staff || '—'} · ${c.id}`)),
      h('div', { class: 'row' }, h('button', { class: c.status === 'open' ? 'btn-bad' : 'btn-ok', onclick: toggle }, c.status === 'open' ? 'Đóng đợt' : 'Mở lại'), me.role === 'admin' ? h('button', { class: 'btn-ghost', onclick: remove }, '🗑 Xóa đợt') : null)),
      h('div', { class: 'row', style: 'margin-top:14px;gap:20px' }, qrNode(joinLink), h('div', { style: 'min-width:0' }, h('div', { class: 'qmeta' }, 'Mã tham gia'), h('div', { class: 'big-level', style: 'letter-spacing:6px' }, c.join_code), h('div', { class: 'small break' }, joinLink)))),
    h('div', { class: 'card' }, h('h2', {}, `Học sinh (${data.students.length})`),
      h('p', { class: 'small muted' }, 'Độ tin cậy = hệ thống có đủ bằng chứng để kết luận không; Tham gia = học sinh có làm bài đầy đủ, tập trung không (SPEC 11, quy tắc đề xuất chưa hiệu chuẩn). Bấm "Chi tiết" để xem tín hiệu.'),
      data.students.length ? tbl(['Họ tên', 'Lớp', 'Trạng thái', 'Kết quả', 'Độ tin cậy', 'Tham gia', ''], data.students.map((s) => {
        const cell = h('div', {});
        if (s.status === 'completed') cell.append(h('button', { class: 'btn-ghost small', onclick: () => resultLink(s.session_id, cell) }, 'Link/QR kết quả'));
        return [h('b', {}, s.full_name), s.class_name || s.grade, s.status === 'completed' ? h('span', { class: 'badge ok' }, 'Hoàn thành') : h('span', { class: 'badge warn' }, `Đang làm (${s.section || '—'})`),
          s.cefr_overall ? (s.confidence_level === 'low' ? h('span', {}, s.cefr_overall, h('span', { class: 'small muted' }, ' (tham khảo, chưa đủ tin cậy)')) : s.cefr_overall) : '—',
          confidenceCell(s), s.engagement_score != null ? h('span', { class: 'small' }, `${s.engagement_score}/100`) : '—', cell];
      })) : emptyState('Chưa có học sinh nào tham gia. Phát mã tham gia hoặc QR ở trên cho học sinh.')));
}
const CONF_VI = { high: ['Cao', 'ok'], medium: ['Trung bình', 'warn'], low: ['Chưa đủ tin cậy', 'bad'] };
const EV_VI = { good: 'Đủ', partial: 'Một phần', insufficient: 'Thiếu' };
/** SPEC 11 §3.6: staff-only confidence score, engagement signals, consistency signals and evidence per skill. */
function confidenceCell(s) {
  if (s.status !== 'completed') return '—';
  if (!s.confidence_level) return h('span', { class: 'badge gray', title: 'Bài làm trước khi có cơ chế độ tin cậy' }, 'Chưa đánh giá');
  const [vi, cls] = CONF_VI[s.confidence_level];
  const q = s.quality || {};
  const sig = [...((q.engagement && q.engagement.signals) || []).map((x) => `Tham gia: ${x.detail_vi} (−${x.penalty})`), ...((q.consistency && q.consistency.signals) || []).map((x) => `Cần xem xét: ${x.detail_vi}`)];
  const ev = q.evidence ? Object.entries(q.evidence.skills).map(([k, v]) => `${SK[k].vi}: ${EV_VI[v.level]}`).join(' · ') : '';
  return h('details', { class: 'conf-detail' }, h('summary', {}, h('span', { class: 'badge ' + cls }, `${vi} · ${s.confidence_score}`), ' Chi tiết'),
    h('div', { class: 'small' }, h('div', {}, `Bằng chứng (${q.evidence ? q.evidence.score : '—'}/100): ${ev}`),
      sig.length ? h('ul', { class: 'list small' }, sig.map((x) => h('li', {}, x))) : h('div', { class: 'muted' }, 'Không có tín hiệu bất thường.')));
}
async function staffDashboard(body) {
  const { data: d } = await api('/api/staff/dashboard');
  const s = d.summary;
  const count = (obj, labels) => Object.keys(obj).length ? tbl(['Mục', 'Số HS'], Object.entries(obj).map(([k, n]) => [labels ? labels[k] || k : k, h('b', {}, n)])) : h('p', { class: 'muted' }, 'Chưa có dữ liệu.');
  const goalLabels = Object.fromEntries(GOALS);
  body.replaceChildren(
    h('div', { class: 'grid g4', style: 'margin-top:16px' },
      statTile('Học sinh tham gia', h('span', { class: 'kpi' }, s.participants), 'var(--blue)'),
      statTile('Hoàn thành', h('span', { class: 'kpi' }, `${Math.round(s.completion_rate * 100)}%`), 'var(--green)'),
      statTile('Mức trung bình', h('span', { class: 'kpi' }, cefrOf(s.avg.overall)), 'var(--orange)'),
      statTile('Đồng ý nhận tư vấn', h('span', { class: 'kpi' }, d.marketing_consent), 'var(--purple)')),
    h('div', { class: 'card' }, h('h2', {}, 'Phân bố trình độ'), cefrDist(s.cefr_distribution),
      d.confidence ? h('p', { class: 'small muted', id: 'conf-summary' }, `Độ tin cậy: Cao ${d.confidence.high} · Trung bình ${d.confidence.medium} · Chưa đủ tin cậy ${d.confidence.low} (không tính vào phân bố/trung bình) · Chưa đánh giá ${d.confidence.unknown}`) : null),
    h('div', { class: 'card' }, h('div', { class: 'row spread' }, h('h2', { style: 'margin:0' }, 'Theo địa phương'), h('a', { class: 'btn btn2 small', href: '/api/staff/export.csv' }, '⬇ Xuất CSV (không chứa họ tên)')), statTable(d.by_province, 'Tỉnh/thành')),
    h('div', { class: 'card' }, h('h2', {}, 'Theo nhóm lớp'), statTable(d.by_grade_band, 'Nhóm lớp')),
    h('div', { class: 'card' }, h('h2', {}, 'Theo trường'), statTable(d.by_school, 'Trường')),
    h('div', { class: 'grid g2' },
      h('div', { class: 'card' }, h('h2', {}, 'Mục tiêu học tập'), count(d.goals, goalLabels)),
      h('div', { class: 'card' }, h('h2', {}, 'Gợi ý sản phẩm'), count(d.products, { practice: 'ICAN Practice / AI Tutor', speakwell: 'SpeakWell', easypass: 'EasyPass', easyielts: 'EasyIELTS', tutor: 'Tutor' }))));
}

// ---------------- admin (SPEC 06) ----------------
const fmtTime = (v) => { if (v == null) return '—'; const d = typeof v === 'number' ? new Date(v) : new Date(String(v).replace(' ', 'T') + 'Z'); return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString('vi-VN'); };
async function adminPage(body, sub, me) {
  const subs = [['overview', '📈 Hệ thống'], ['users', '👥 Tài khoản'], ['students', '🔎 Học sinh'], ['audit', '📜 Nhật ký']];
  const content = h('div', {}, loading());
  body.replaceChildren(h('div', { class: 'tabs', style: 'margin-top:16px' }, subs.map(([k, l]) => h('a', { class: 'btn tab' + (k === sub ? ' on' : ''), href: '#/staff/admin/' + k }, l))), content);
  if (sub === 'users') return adminUsers(content, me);
  if (sub === 'students') return adminStudents(content);
  if (sub === 'audit') return adminAudit(content);
  return adminOverview(content);
}
async function adminOverview(box) {
  const { data: o } = await api('/api/admin/overview');
  const setShared = async (v) => { try { await api('/api/admin/settings', { method: 'PATCH', body: { shared_login: v } }); toast(v ? 'Đã bật mật khẩu nhân viên chung' : 'Đã tắt mật khẩu nhân viên chung'); staffPage('admin', 'overview'); } catch (e) { toast(e.message); } };
  box.replaceChildren(
    h('div', { class: 'grid g4' },
      statTile('Trường', h('span', { class: 'kpi' }, o.schools), 'var(--blue)', o.test_schools ? `${o.test_schools} trường kiểm thử` : null),
      statTile('Đợt kiểm tra', h('span', { class: 'kpi' }, o.campaigns_open + o.campaigns_closed), 'var(--purple)', `${o.campaigns_open} đang mở`),
      statTile('Học sinh', h('span', { class: 'kpi' }, o.students), 'var(--green)', `${o.sessions_completed} hoàn thành · ${o.sessions_active} đang làm`),
      statTile('Tài khoản', h('span', { class: 'kpi' }, o.users), 'var(--orange)', `${o.admins} quản trị (D1) + admin gốc`)),
    h('div', { class: 'grid g2', style: 'margin-top:16px' },
      h('div', { class: 'card' }, h('h2', {}, '🔐 Đăng nhập nhân viên'),
        h('p', {}, 'Mật khẩu nhân viên chung: ', o.shared_login ? h('span', { class: 'badge ok' }, 'Đang bật') : h('span', { class: 'badge bad' }, 'Đã tắt')),
        h('p', { class: 'small muted' }, 'Tắt khi mọi nhân viên đã có tài khoản riêng. Tắt sẽ đăng xuất ngay mọi phiên dùng mật khẩu chung; tài khoản riêng và admin không bị ảnh hưởng.'),
        o.shared_login ? h('button', { class: 'btn-bad', onclick: () => { if (confirm('Tắt đăng nhập bằng mật khẩu nhân viên chung?')) setShared(false); } }, 'Tắt mật khẩu chung') : h('button', { onclick: () => setShared(true) }, 'Bật lại mật khẩu chung')),
      h('div', { class: 'card' }, h('h2', {}, '🩺 Tình trạng dữ liệu'),
        tbl(['Chỉ số', 'Giá trị'], [['Câu hỏi đang dùng (ngân hàng)', h('b', {}, o.bank_items)], ['Câu chấm lỗi (Nói/Viết)', h('b', {}, o.scoring_errors)], ['Đợt đã đóng', h('b', {}, o.campaigns_closed)], ['Trường kiểm thử "THCS Live …"', h('b', {}, o.test_schools)]]),
        h('p', { class: 'small muted' }, 'Xóa dữ liệu kiểm thử ở mục Trường (nút Xóa) — chỉ quản trị viên thấy.'))));
}
async function adminUsers(box, me, secret) {
  const { data } = await api('/api/admin/users');
  const f = { username: '', display_name: '', role: 'staff', password: '' };
  const secretBox = h('div');
  const showSecret = (title, username, pw) => { secretBox.replaceChildren(h('div', { class: 'card tint-yellow' }, h('h3', {}, title), h('p', {}, 'Tên đăng nhập: ', h('code', {}, username)), h('div', { class: 'secret' }, pw),
    h('p', { class: 'small' }, '⚠ Mật khẩu chỉ hiện MỘT lần. Gửi riêng cho người dùng qua kênh an toàn, không dán vào nhóm chat chung.'), h('button', { class: 'btn2 small', onclick: () => navigator.clipboard.writeText(pw).then(() => toast('Đã sao chép mật khẩu')) }, 'Sao chép mật khẩu'))); window.scrollTo(0, 0); };
  const create = async () => {
    try {
      const r = (await api('/api/admin/users', { method: 'POST', body: { ...f, password: f.password || undefined } })).data;
      await adminUsers(box, me, r.password ? ['Đã tạo tài khoản', r.user.username, r.password] : null);
      if (!r.password) toast('Đã tạo tài khoản ' + r.user.username);
    } catch (e) { toast(e.message); }
  };
  const patch = async (u, b, msg) => {
    try { const r = (await api('/api/admin/users/' + u.id, { method: 'PATCH', body: b })).data; await adminUsers(box, me, r.password ? ['Mật khẩu mới', u.username, r.password] : null); if (!r.password) toast(msg); } catch (e) { toast(e.message); }
  };
  box.replaceChildren(secretBox,
    h('div', { class: 'card' }, h('h2', {}, '➕ Tạo tài khoản'),
      h('div', { class: 'grid g2' },
        h('div', {}, h('label', {}, 'Tên đăng nhập'), h('input', { type: 'text', id: 'nu-username', autocomplete: 'off', placeholder: 'VD: lan.nv', oninput: (e) => (f.username = e.target.value) })),
        h('div', {}, h('label', {}, 'Tên hiển thị'), h('input', { type: 'text', id: 'nu-name', autocomplete: 'off', placeholder: 'VD: Nguyễn Thị Lan', oninput: (e) => (f.display_name = e.target.value) })),
        h('div', {}, h('label', {}, 'Vai trò'), chips([['staff', 'Nhân viên GE'], ['admin', 'Quản trị viên']], (k) => f.role === k, (k) => (f.role = k))),
        h('div', {}, h('label', {}, 'Mật khẩu (để trống để hệ thống tạo)'), h('input', { type: 'password', autocomplete: 'new-password', oninput: (e) => (f.password = e.target.value) }))),
      h('p', { style: 'margin-top:16px' }, h('button', { id: 'nu-create', onclick: create }, '＋ Tạo tài khoản'))),
    h('div', { class: 'card' }, h('h2', {}, `Tài khoản (${data.users.length} + admin gốc)`),
      tbl(['Tên đăng nhập', 'Tên hiển thị', 'Vai trò', 'Trạng thái', 'Đăng nhập gần nhất', ''],
        [[h('code', {}, 'admin'), 'Quản trị viên (gốc)', h('span', { class: 'role-badge' }, 'Quản trị viên'), h('span', { class: 'badge ok' }, 'Hoạt động'), '—', h('span', { class: 'small muted' }, 'Mật khẩu trong config/ của người vận hành')],
          ...data.users.map((u) => [h('code', {}, u.username), u.display_name, h('span', { class: 'role-badge' }, ROLE_VI[u.role]), u.active ? h('span', { class: 'badge ok' }, 'Hoạt động') : h('span', { class: 'badge bad' }, 'Đã khóa'), h('span', { class: 'small' }, fmtTime(u.last_login_at)),
            h('div', { class: 'row', style: 'justify-content:flex-end' },
              h('button', { class: 'btn-ghost small', onclick: () => { if (confirm(`Đặt lại mật khẩu cho ${u.username}? Phiên đăng nhập hiện tại của người này sẽ bị đăng xuất.`)) patch(u, { reset_password: true }); } }, 'Đặt lại MK'),
              h('button', { class: 'btn-ghost small', onclick: () => patch(u, { role: u.role === 'admin' ? 'staff' : 'admin' }, 'Đã đổi vai trò') }, u.role === 'admin' ? '→ Nhân viên' : '→ Quản trị'),
              u.active ? h('button', { class: 'btn-bad small', onclick: () => { if (confirm(`Khóa tài khoản ${u.username}?`)) patch(u, { active: false }, 'Đã khóa tài khoản'); } }, 'Khóa') : h('button', { class: 'btn-ok small', onclick: () => patch(u, { active: true }, 'Đã mở khóa') }, 'Mở khóa'))])])));
  if (secret) showSecret(...secret);
}
async function adminStudents(box) {
  const q = h('input', { type: 'search', id: 'stu-q', placeholder: 'Họ tên, tên trường, mã học sinh/phiên…', onkeydown: (e) => { if (e.key === 'Enter') run(); } });
  const out = h('div');
  const run = async () => {
    out.replaceChildren(loading());
    try {
      const { data } = await api('/api/admin/students?q=' + encodeURIComponent(q.value.trim()));
      const del = async (s) => {
        const v = prompt(`XÓA học sinh "${s.full_name}" và toàn bộ bài làm/kết quả (không khôi phục được).\nNhập đúng mã ${s.student_id} để xác nhận:`); if (v == null) return;
        try { await api('/api/admin/students/' + s.student_id, { method: 'DELETE', body: { confirm: v.trim() } }); toast('Đã xóa dữ liệu học sinh'); run(); } catch (e) { toast(e.message); }
      };
      const link = async (s, cell) => {
        try { const r = (await api(`/api/staff/sessions/${s.session_id}/result-link`, { method: 'POST', body: {} })).data; cell.replaceChildren(h('a', { class: 'btn btn2 small', href: '#/r/' + r.result_token }, 'Mở kết quả')); } catch (e) { toast(e.message); }
      };
      out.replaceChildren(h('p', { class: 'muted small' }, `${data.students.length} kết quả${data.students.length >= 200 ? ' (tối đa 200 — thu hẹp từ khóa)' : ''}`),
        data.students.length ? tbl(['Họ tên', 'Lớp', 'Trường', 'Ngày KT', 'Trạng thái', 'CEFR', ''], data.students.map((s) => {
          const cell = h('div', { class: 'row', style: 'justify-content:flex-end' });
          if (s.status === 'completed') cell.append(h('button', { class: 'btn-ghost small', onclick: () => link(s, cell) }, 'Link KQ'));
          cell.append(h('button', { class: 'btn-bad small', onclick: () => del(s) }, 'Xóa'));
          return [h('b', {}, s.full_name), s.class_name || s.grade, h('span', { class: 'small' }, s.school_name), s.test_date, s.status === 'completed' ? h('span', { class: 'badge ok' }, 'Hoàn thành') : s.status ? h('span', { class: 'badge warn' }, 'Đang làm') : h('span', { class: 'badge gray' }, 'Chưa làm'), s.cefr_overall || '—', cell];
        })) : emptyState('Không tìm thấy học sinh phù hợp.'));
    } catch (e) { out.replaceChildren(h('span', { class: 'badge bad' }, e.message)); }
  };
  box.replaceChildren(h('div', { class: 'card' }, h('h2', {}, '🔎 Tìm học sinh toàn hệ thống'),
    h('p', { class: 'small muted' }, 'Dùng khi phụ huynh/nhà trường yêu cầu tra cứu, cấp lại link kết quả hoặc xóa dữ liệu cá nhân.'),
    h('div', { class: 'row' }, h('div', { style: 'flex:1 1 260px' }, q), h('button', { id: 'stu-search', onclick: run }, 'Tìm')), out));
  run();
}
async function adminAudit(box) {
  const { data } = await api('/api/admin/audit');
  const ACT = { user_create: 'Tạo tài khoản', user_update: 'Sửa tài khoản', settings_update: 'Đổi cài đặt', student_delete: 'Xóa học sinh', campaign_delete: 'Xóa đợt', school_delete: 'Xóa trường', school_update: 'Đổi tên trường' };
  box.replaceChildren(h('div', { class: 'card' }, h('h2', {}, '📜 Nhật ký quản trị (200 gần nhất)'),
    data.events.length ? tbl(['Thời gian', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Chi tiết'], data.events.map((e) => [h('span', { class: 'small' }, fmtTime(e.at)), h('code', {}, e.actor), h('b', {}, ACT[e.action] || e.action), h('code', {}, e.target), h('span', { class: 'small muted break' }, e.detail ? JSON.stringify(e.detail) : '')])) : emptyState('Chưa có thao tác quản trị nào.')));
}
