import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';

let uid = 0;
let saves = 0;
const db = {
  schools: [{ id: 'school-demo', name: 'Galaxy Education' }],
  campaigns: [{ id: 'campaign-demo', school_id: 'school-demo', test_date: '2026-11-17', grades: [3,4,5,6,7,8,9,10,11], join_code: 'E8YYZD', status: 'open' }],
  sessions: {}, results: {},
};
const D = {
  db, save() { saves++; }, uid(prefix) { return `${prefix}-${++uid}`; },
  ok(data, status = 200) { return { status, data }; },
  fail(status, message, code) { throw Object.assign(new Error(message), { status, code, data: { error: code, message } }); },
};
const context = vm.createContext({ window: { ICanDemo: D }, URL, Date, console });
vm.runInContext(await fs.readFile(new URL('../src/demo-assessment.js', import.meta.url), 'utf8'), context);
const call = async (path, method = 'GET', body, token) => D.assessmentRequest(path, { method, body, headers: token ? { authorization: `Bearer ${token}` } : {} });
const join = await call('/api/join/E8YYZD');
assert.equal(join.data.school_name, 'Galaxy Education');
assert.equal(join.data.grades.length, 9);
await assert.rejects(call('/api/join/AAAAAA'), { code: 'invalid_join_code', status: 404 });
await assert.rejects(call('/api/sessions', 'POST', { join_code: 'E8YYZD', full_name: 'A', grade: 5 }), { code: 'invalid_name' });

for (const grade of [4, 7, 10]) {
  const started = await call('/api/sessions', 'POST', { join_code: 'E8YYZD', full_name: `Học sinh thử khối ${grade}`, grade, class_name: `${grade}A1`, profile: { self: { L: 2, R: 2, S: 2, W: 2 } } });
  const token = started.data.session_token;
  let v = (await call('/api/session', 'GET', undefined, token)).data;
  assert.equal(v.section, 'U');
  assert.equal(v.band, grade === 4 ? '3-5' : grade === 7 ? '6-8' : '9-11');
  assert.ok(v.deadline > Date.now() + 175000);
  await assert.rejects(call('/api/session/finish', 'POST', {}, token), { code: 'sections_remaining' });
  const ids = new Set();
  for (const [section, count] of [['U',6], ['L',8], ['R',6]]) {
    assert.equal(v.section, section);
    for (let i = 0; i < count; i++) {
      assert.ok(v.item.payload.stem);
      assert.equal(v.item.payload.options.length, 4);
      if (section === 'L') assert.ok(v.item.payload.audio_script);
      if (section === 'R') assert.ok(v.item.payload.passage);
      assert.equal(ids.has(v.item.id), false, 'Questions must not repeat');
      ids.add(v.item.id);
      const again = (await call('/api/session', 'GET', undefined, token)).data;
      assert.equal(again.item.id, v.item.id, 'Reload must preserve the current question');
      v = (await call('/api/session/answer', 'POST', { item_id: v.item.id, choice: i === 0 ? -1 : 1 }, token)).data;
    }
  }
  assert.equal(v.section, 'S');
  assert.equal(v.tasks.length, 2);
  assert.ok(v.tasks[0].payload.text);
  assert.ok(v.tasks[1].payload.question);
  const spoken = await call('/api/session/speaking', 'POST', { item_id: v.tasks[0].id, duration_ms: 3000, audio_base64: 'bG9jYWwtZGVtby1hdWRpbw==', audio_format: 'webm' }, token);
  assert.equal(spoken.data.scoring_status, 'scored');
  assert.equal(db.sessions[token].speaking[0].audio_base64, undefined, 'Do not store audio in localStorage');
  v = (await call('/api/session/advance', 'POST', { section: 'S' }, token)).data;
  assert.equal(v.section, 'W');
  assert.ok(v.tasks[0].payload.prompt);
  const text = 'My favourite food is fresh spring rolls. I prepare vegetables and noodles with my family. First we wash the vegetables. Then we cook the noodles. Finally we put everything in rice paper. This dish is healthy because it contains lots of fresh vegetables.';
  v = (await call('/api/session/answer', 'POST', { item_id: v.tasks[0].id, text }, token)).data;
  assert.equal(v.section, 'done');
  const finished = await call('/api/session/finish', 'POST', {}, token);
  const resultToken = finished.data.result_token;
  const result = (await D.assessmentRequest('/api/results', { headers: { 'x-result-token': resultToken } })).data.result;
  assert.equal(result.student.grade, grade);
  assert.ok(result.overall.cefr);
  assert.ok(result.overall.note_vi.includes('DEMO'));
  assert.equal(result.self_vs_actual.length, 4);
  assert.equal(result.learning_path.units.length, 4);
  assert.equal(result.feedback.speaking.length, 1);
  assert.equal(result.feedback.writing.length, 1);
  assert.ok(result.skills.W.theta > 0);
  assert.ok(result.skills.L.answered > 0);
  assert.equal(db.sessions[token].status, 'completed');
  const finishedAgain = await call('/api/session/finish', 'POST', {}, token);
  assert.equal(finishedAgain.data.result_token, resultToken, 'Finish is idempotent');
  const unitCode = result.learning_path.units[0].unit;
  const unit = (await call(`/api/units/${unitCode}`)).data.unit;
  assert.ok(unit.lesson.vocab.length >= 4);
  assert.ok(unit.lesson.speaking_practice.length >= 3);
  assert.ok(unit.lesson.grammar_vi);
  const practice = await D.assessmentRequest('/api/practice/pronounce', { method: 'POST', body: { text: 'I like English.', audio_base64: 'local-demo' }, headers: { 'x-result-token': resultToken } });
  assert.equal(practice.data.result.illustrative, true);
}

// Complete an empty attempt: no invented language ability for skipped tasks.
const empty = (await call('/api/sessions', 'POST', { join_code: 'E8YYZD', full_name: 'Bài bỏ qua', grade: 7 })).data.session_token;
for (const section of ['U','L','R','S','W']) await call('/api/session/advance', 'POST', { section }, empty);
const emptyResultToken = (await call('/api/session/finish', 'POST', {}, empty)).data.result_token;
const emptyResult = db.results[emptyResultToken];
assert.equal(emptyResult.overall.cefr, null);
for (const skill of ['L','R','S','W']) assert.equal(emptyResult.skills[skill].theta, null);
assert.equal(emptyResult.confidence.level, 'low');
assert.equal(emptyResult.feedback.speaking.length, 0);

// Expired section advances, and invalid/closed participation codes stay closed.
const timed = (await call('/api/sessions', 'POST', { join_code: 'E8YYZD', full_name: 'Bài hết giờ', grade: 3 })).data.session_token;
db.sessions[timed].deadline = Date.now() - 1000;
assert.equal((await call('/api/session', 'GET', undefined, timed)).data.section, 'L');
db.campaigns[0].status = 'closed';
await assert.rejects(call('/api/join/E8YYZD'), { code: 'campaign_closed' });
db.campaigns[0].status = 'open';

const fixture = { token: 'session-demo', status: 'completed', section: 'done', result_token: 'demo-result', student: { full_name: 'Minh Anh', grade: 7, school_name: 'Galaxy Education', class_name: '7A1', test_date: '2026-11-17' }, profile: {} };
const sample = D.makeResult(fixture);
assert.equal(sample.sample, true);
assert.equal(sample.feedback.speaking.length, 2);
assert.equal(sample.learning_path.units.length, 4);
assert.ok(saves > 0);
assert.equal(await call('/api/unhandled'), undefined);
console.log('Assessment checks passed: three age bands, 60 MCQs, persistence, timers, speech metadata, writing, result, lessons, invalid codes and skipped-task evidence.');
