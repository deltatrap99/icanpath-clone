import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const storage = new Map();
const context = vm.createContext({ window: {}, Date, URLSearchParams, sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) } });
for (const file of ['school-evidence.js', 'school-analysis.js', 'school-service.js', 'school-portal.js']) vm.runInContext(await readFile(new URL('../src/option-2/' + file, import.meta.url), 'utf8'), context, { filename: file });
const { ICanSchoolService: service, ICanSchoolEvidence: evidence, ICanSchoolPortal: links } = context.window;
const scope = { grade: 10, class_name: '10 Lí', skill: 'W' };
assert.throws(() => service.errorReport(scope, 'W-agreement'), error => error.code === 'unauthorized');
assert.throws(() => service.studentReport(scope, 'HY-1-001'), error => error.code === 'unauthorized');
service.login('chuyenhungyen', 'demo123');
const classroom = service.report(scope);
const whole = service.report();
for (const cohort of [{}, { grade: 11 }, { grade: 10, class_name: '10 Lí' }]) {
  for (const task of evidence.tasks) {
    const group = service.errorReport({ ...cohort, skill: task.skill }, task.id);
    const expected = group.report.students.filter(student => evidence.responsesFor(student).find(record => record.task_id === task.id).value === task.misconception);
    assert.equal(group.students.length, group.criterion.affected);
    assert.equal(new Set(group.students.map(student => student.id)).size, group.students.length);
    assert.deepEqual([...group.students.map(student => student.id)].sort(), [...expected.map(student => student.id)].sort());
    assert.deepEqual([...group.criterion.affected_ids], [...expected.map(student => student.id)].sort());
    assert(group.students.every(student => !cohort.class_name || student.class_name === cohort.class_name));
    for (const student of [group.students[0], group.students.at(-1)].filter(Boolean)) {
      const detail = service.studentReport({ ...cohort, skill: task.skill }, student.id, task.id);
      assert.equal(detail.student.id, student.id);
      assert.equal(detail.student.name, student.name);
      assert.equal(detail.context_error.id, task.id);
      assert.equal(detail.student.overall.score, student.overall.score);
      assert.equal(detail.student.rank, student.rank);
      assert.equal(detail.evidence.length, 12);
      assert.equal(detail.evidence.find(item => item.id === task.id).status, 'needs_support');
      assert.equal(detail.evidence.find(item => item.id === task.id).value, task.misconception);
    }
  }
}
const group = service.errorReport(scope, 'W-agreement');
assert.equal(group.students.length, 17);
assert.equal(service.page(group.students, { current: 1 }).students.length, 10);
assert.equal(service.page(group.students, { current: 2 }).students.length, 7);
const lastStudent = service.page(group.students, { current: 2 }).students.at(-1);
assert.equal(service.studentReport(scope, lastStudent.id, 'W-agreement').student.id, lastStudent.id);
const outsider = whole.students.find(student => student.class_name !== '10 Lí');
assert.throws(() => service.studentReport(scope, outsider.id), error => error.code === 'student_not_found');
assert.throws(() => service.studentReport(scope, 'unknown-id'), error => error.code === 'student_not_found');
assert.throws(() => service.errorReport({ ...scope, school_id: 'another-school' }, 'W-agreement'), error => error.code === 'forbidden');
assert.throws(() => service.errorReport(scope, 'unknown-criterion'), error => error.code === 'invalid_criterion');
assert.throws(() => service.errorReport({ ...scope, skill: 'L' }, 'W-agreement'), error => error.code === 'invalid_criterion');
const notAffected = classroom.students.find(student => !group.criterion.affected_ids.includes(student.id));
assert.throws(() => service.studentReport(scope, notAffected.id, 'W-agreement'), error => error.code === 'student_not_affected');
assert.equal(service.studentReport(scope, notAffected.id).student.id, notAffected.id, 'A general pupil report remains available without falsely associating an error');

const allStatuses = new Set();
for (const student of classroom.students) {
  const detail = service.studentReport(scope, student.id);
  const records = new Map(evidence.responsesFor(student).map(record => [record.task_id, record]));
  for (const item of detail.evidence) {
    const value = records.get(item.id).value;
    const expected = value === null ? 'missing' : value === item.correct ? 'met' : value === item.misconception ? 'needs_support' : 'other_error';
    assert.equal(item.status, expected);
    allStatuses.add(item.status);
    assert.equal(item.response_text, value === null ? null : item.kind === 'choice' ? item.options[value] : value === item.correct ? item.better_example : item.error_example);
    if (item.status !== 'needs_support') assert(!service.errorReport({ ...scope, skill: item.skill }, item.id).students.some(other => other.id === student.id), 'Missing, correct and unrelated wrong responses must not enter this error roster');
  }
}
assert.equal([...allStatuses].sort().join(','), 'met,missing,needs_support,other_error');
const duplicate = whole.students.find(student => student.name === 'Nguyễn Minh Anh' && student.class_name !== '10 Lí');
assert.equal(service.studentReport({ skill: 'L' }, duplicate.id).student.class_name, duplicate.class_name, 'Names never identify student records');
const uri = links.href({ ...scope, error: 'W-agreement', student: lastStudent.id, search: 'Nguyễn', page: 2, focus: 'error' });
const params = new URLSearchParams(uri.split('?')[1]);
assert.equal(params.get('class'), '10 Lí'); assert.equal(params.get('skill'), 'W');
assert.equal(params.get('error'), 'W-agreement'); assert.equal(params.get('student'), lastStudent.id);
assert.equal(params.get('search'), 'Nguyễn'); assert.equal(params.get('page'), '2'); assert.equal(params.get('focus'), 'error');
assert(links.href({ ...scope, focus: 'rankings' }).endsWith('focus=rankings'));
assert(!links.href({ ...scope, search: 'stale', page: 2 }).includes('search='), 'A new cohort must not retain a previous error roster search');
group.criterion.affected_ids.length = 0;
const independent = service.studentReport(scope, lastStudent.id, 'W-agreement');
independent.student.skills.L.score = 0;
independent.evidence[0].options.A = 'Changed externally';
assert.equal(service.errorReport(scope, 'W-agreement').students.length, 17);
assert.notEqual(service.studentReport(scope, lastStudent.id).student.skills.L.score, 0);
assert.notEqual(service.studentReport(scope, lastStudent.id).evidence[0].options.A, 'Changed externally');

const [teacher] = service.teacherAccounts();
service.login(teacher.username, teacher.password);
const teacherScope = { skill: 'W' };
const teacherGroup = service.errorReport(teacherScope, 'W-agreement');
assert.equal(teacherGroup.report.scope.class_name, scope.class_name);
assert.deepEqual(teacherGroup.students.map(student => student.id), group.students.map(student => student.id));
assert.equal(service.studentReport(teacherScope, lastStudent.id, 'W-agreement').student.id, lastStudent.id);
assert.throws(() => service.studentReport(teacherScope, outsider.id), error => error.code === 'student_not_found');
assert.throws(() => service.studentReport({ class_name: outsider.class_name }, outsider.id), error => error.code === 'forbidden');
assert.throws(() => service.errorReport({ class_name: outsider.class_name, skill: 'W' }, 'W-agreement'), error => error.code === 'forbidden');

service.logout();
assert.throws(() => service.errorReport(scope, 'W-agreement'), error => error.code === 'unauthorized');
assert.throws(() => service.studentReport(scope, lastStudent.id, 'W-agreement'), error => error.code === 'unauthorized');
console.log('School pupil report checks passed: exact error membership across all skills and cohorts, missing evidence exclusions, individual responses, unique pupil IDs, pagination, return-link state and authentication boundaries.');
