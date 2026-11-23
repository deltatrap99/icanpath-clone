import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/option-2/school-service.js', import.meta.url), 'utf8');
const evidenceSource = await readFile(new URL('../src/option-2/school-evidence.js', import.meta.url), 'utf8');
const analysisSource = await readFile(new URL('../src/option-2/school-analysis.js', import.meta.url), 'utf8');
const storage = new Map([['ip_session', 'existing-assessment-session']]);
let now = Date.parse('2026-11-17T08:00:00Z'), blockedWrites = false;
class Clock extends Date { static now() { return now; } }
const sessionStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => { if (blockedWrites) throw new Error('Storage unavailable'); storage.set(key, value); },
  removeItem: key => storage.delete(key),
};
function boot() { const context = vm.createContext({ window: {}, sessionStorage, Date: Clock }); for (const module of [evidenceSource, analysisSource, source]) vm.runInContext(module, context); return context.window.ICanSchoolService; }
const service = boot();
assert.equal(service.session(), null);
assert.throws(() => service.report(), error => error.code === 'unauthorized');
assert.throws(() => service.teacherAccounts(), error => error.code === 'forbidden');
assert.throws(() => service.login('chuyenhungyen', 'incorrect'), error => error.code === 'invalid_credentials');
assert.equal(service.session(), null);
blockedWrites = true;
assert.throws(() => service.login('chuyenhungyen', 'demo123'));
assert.equal(service.session(), null, 'A failed save must not grant a school session');
blockedWrites = false;
service.login(' CHUYENHUNGYEN ', 'demo123');
assert.equal(service.session().school.name, 'THPT Chuyên Hưng Yên');
assert.equal(service.session().role, 'school');
assert(!JSON.stringify([...storage]).includes('demo123'), 'Saved sessions must not contain passwords');
const whole = service.report();
assert.equal(whole.summary.total, 288);
assert.equal(whole.summary.classes, 9);
assert.equal(new Set(whole.students.map(student => student.id)).size, 288);
assert.equal(whole.students.filter(student => student.name === 'Bồ Quốc Tuấn').length, 1);
assert.equal(whole.students[0].name, 'Bồ Quốc Tuấn');
assert.equal(whole.students[0].score, 96.8);
assert.equal(whole.students[0].rank, 1);
assert.equal([10, 11, 12].reduce((total, grade) => total + service.report({ grade }).summary.total, 0), 288);
const classroom = service.report({ grade: 10, class_name: '10 Lí' });
assert.equal(classroom.summary.total, 32);
assert.equal(classroom.summary.classes, 1);
assert(classroom.students.every(student => student.grade === 10 && student.class_name === '10 Lí'));
assert.equal(classroom.students[0].name, 'Bồ Quốc Tuấn');
assert.equal(classroom.levels.reduce((sum, item) => sum + item.count, 0), 32);
assert.equal(classroom.histogram.reduce((sum, item) => sum + item.count, 0), 32);
assert.equal(classroom.summary.average, Math.round(classroom.students.reduce((sum, student) => sum + student.score, 0) / 32 * 10) / 10);
for (const student of whole.students) {
  assert.equal(student.overall.score, Math.round(Object.values(student.skills).reduce((sum, skill) => sum + skill.score, 0) / 4 * 10) / 10);
  assert(Object.values(student.skills).every(skill => skill.score >= 0 && skill.score <= 100 && service.levels.includes(skill.cefr)));
}
for (const skill of ['L', 'R', 'S', 'W']) {
  const data = service.report({ class_name: '10 Lí', skill });
  assert.equal(data.students[0].name, 'Bồ Quốc Tuấn');
  assert(data.students.every(student => student.score === student.skills[skill].score && student.cefr === student.skills[skill].cefr));
  assert.equal(data.histogram.reduce((sum, item) => sum + item.count, 0), 32);
}
for (const item of classroom.levels) assert.equal(service.page(classroom.students, { level: item.level }).total, item.count);
assert.equal(service.page(classroom.students, { search: 'bo quoc tuan' }).total, 1);
assert.equal(service.page(classroom.students, { search: 'bo quoc tuan', level: 'A1' }).total, 0);
const finalPage = service.page(classroom.students, { current: 4 });
assert.equal(finalPage.students.length, 2);
assert.equal(finalPage.start, 31);
assert.equal(finalPage.end, 32);
assert.equal(service.page(classroom.students, { current: 999 }).current, 4);
const empty = service.page(classroom.students, { search: 'no matching student' });
assert.equal(empty.total, 0); assert.equal(empty.start, 0); assert.equal(empty.end, 0);
for (const score of new Set(whole.students.map(student => student.score))) assert.equal(new Set(whole.students.filter(student => student.score === score).map(student => student.rank)).size, 1, 'Equal scores must have equal ranks');
classroom.students[0].name = 'Changed externally';
classroom.students[0].skills.L.score = 0;
assert.equal(service.report({ class_name: '10 Lí' }).students[0].name, 'Bồ Quốc Tuấn');
assert.equal(service.report({ class_name: '10 Lí' }).students[0].skills.L.score, 98);
assert.throws(() => service.report({ school_id: 'another-school' }), error => error.code === 'forbidden');
assert.throws(() => service.report({ grade: 9 }));
assert.throws(() => service.report({ grade: 10, class_name: '11 Lí' }));
assert.throws(() => service.report({ class_name: 'Unknown class' }));
assert.throws(() => service.report({ skill: 'unknown' }));
assert.equal(boot().report({ class_name: '10 Lí' }).summary.total, 32, 'Reloads retain the school session and reproduce the same cohort');

const teachers = service.teacherAccounts();
const assignedClasses = ['10 Lí', '10 Toán', '10 Anh', '11 Lí', '11 Toán', '11 Anh', '12 Lí', '12 Toán', '12 Anh'];
assert.deepEqual(Array.from(teachers, teacher => teacher.class_name), assignedClasses);
assert.equal(new Set(teachers.map(teacher => teacher.password)).size, teachers.length);
assert.throws(() => service.login('gv01', 'demo123'), error => error.code === 'invalid_credentials');
assert.throws(() => service.login('gv01', teachers[1].password), error => error.code === 'invalid_credentials');
assert.equal(service.session().role, 'school', 'An invalid login must not change the active role');
for (const [index, teacher] of teachers.entries()) {
  assert.equal(teacher.username, 'gv' + String(index + 1).padStart(2, '0'));
  assert.equal(teacher.grade, Number(assignedClasses[index].slice(0, 2)));
  const viewer = service.login(' ' + teacher.username.toUpperCase() + ' ', teacher.password);
  assert.equal(viewer.school.name, whole.school.name);
  assert.equal(viewer.role, 'teacher');
  assert.equal(viewer.class_name, assignedClasses[index]);
  assert.equal(viewer.account, teacher.username);
  assert.equal(viewer.password, undefined);
  assert(!storage.get('ip_school_session_v1').includes(teacher.password));
  assert.throws(() => service.teacherAccounts(), error => error.code === 'forbidden');
  const own = service.report();
  assert.equal(own.summary.total, 32);
  assert.equal(own.summary.classes, 1);
  assert.deepEqual([...own.grades], [teacher.grade]);
  assert.deepEqual([...own.classrooms], [teacher.class_name]);
  assert(own.students.every(student => student.class_name === teacher.class_name));
  assert.equal(service.report({ grade: teacher.grade, skill: 'R' }).summary.total, 32);
  assert.equal(boot().session().class_name, teacher.class_name);
  assert.throws(() => service.report({ class_name: assignedClasses[(index + 1) % assignedClasses.length] }), error => error.code === 'forbidden');
  assert.throws(() => service.report({ grade: teacher.grade === 11 ? 10 : 11 }), error => error.code === 'forbidden');
}
service.login(teachers[0].username, teachers[0].password);
const savedTeacher = JSON.parse(storage.get('ip_school_session_v1'));
storage.set('ip_school_session_v1', JSON.stringify({ ...savedTeacher, role: 'school', grade: 11, class_name: '11 Lí' }));
assert.equal(service.session().role, 'teacher');
assert.equal(service.report().scope.class_name, '10 Lí', 'Scopes come from the account assignment');
service.logout();
assert.throws(() => service.report(), error => error.code === 'unauthorized');
service.login('chuyenhungyen', 'demo123');
assert.equal(service.report().summary.total, 288);

now += 8 * 3600000 + 1;
assert.equal(service.session(), null);
assert.throws(() => service.report(), error => error.code === 'unauthorized');
service.login('chuyenhungyen', 'demo123'); service.logout();
assert.equal(service.session(), null);
assert.throws(() => service.report(), error => error.code === 'unauthorized');
storage.set('ip_school_session_v1', 'invalid json'); assert.equal(service.session(), null);
storage.set('ip_school_session_v1', JSON.stringify({ account: 'chuyenhungyen', school_id: 'another-school', expires_at: now + 1000 })); assert.equal(service.session(), null);
assert.equal(storage.get('ip_session'), 'existing-assessment-session', 'School authentication must not alter assessment sessions');
console.log('School portal checks passed: school and nine teacher logins, classroom boundaries, isolated sessions, 288 students, grade/class/skill aggregates, tied ranks, search, pagination and expiry.');
