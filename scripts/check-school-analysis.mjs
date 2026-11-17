import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const storage = new Map();
const context = vm.createContext({ window: {}, Date, sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) } });
for (const file of ['school-evidence.js', 'school-analysis.js', 'school-service.js']) vm.runInContext(await readFile(new URL('../src/option-2/' + file, import.meta.url), 'utf8'), context, { filename: file });
const { ICanSchoolService: service, ICanSchoolAnalysis: analysis, ICanSchoolEvidence: evidence } = context.window;
service.login('chuyenhungyen', 'demo123');
assert.equal(evidence.tasks.length, 12);
assert.equal(new Set(evidence.tasks.map(task => task.id)).size, 12);
for (const task of evidence.tasks) {
  assert.equal(evidence.tasks.filter(other => other.skill === task.skill).length, 3);
  assert(task.explanation && task.support && task.practice.length === 3);
  assert(!/[\u2014\u00b7]/.test(JSON.stringify(task)), 'New school copy follows the editorial rules');
  if (task.kind === 'choice') {
    assert(task.context && task.prompt && task.options[task.correct] && task.options[task.misconception]);
    assert.notEqual(task.correct, task.misconception);
  } else assert(task.error_example && task.better_example);
}

const whole = service.report();
const classroom = service.report({ grade: 10, class_name: '10 Lí' });
const pupils = classroom.students;
const responses = pupils.flatMap(evidence.responsesFor);
for (const report of [whole, classroom, service.report({ grade: 11 }), service.report({ class_name: '12 Anh', skill: 'W' })]) {
  assert.equal(report.diagnostics.total, report.summary.total);
  assert.equal(report.diagnostics.skills.length, 4);
  for (const skill of report.diagnostics.skills) {
    assert.equal(skill.average, Math.round(report.students.reduce((sum, student) => sum + student.skills[skill.key].score, 0) / report.summary.total * 10) / 10);
    assert.equal(skill.at_b1, report.students.filter(student => ['B1', 'B2', 'C1'].includes(student.skills[skill.key].cefr)).length);
    assert.equal(skill.assessed + skill.missing, report.summary.total);
    assert(skill.errors.every((item, index, all) => !index || all[index - 1].error_percent >= item.error_percent));
    for (const item of skill.criteria) {
      const scoped = report.students.flatMap(evidence.responsesFor).filter(response => response.task_id === item.id && response.value !== null);
      assert.equal(item.assessed, scoped.length);
      assert.equal(item.affected, scoped.filter(response => response.value === item.misconception).length);
      assert.equal(item.correct_count, scoped.filter(response => response.value === item.correct).length);
      assert.equal(item.assessed + item.missing, report.summary.total);
      assert(item.correct_count + item.affected <= item.assessed);
      assert(item.pass_percent >= 0 && item.pass_percent <= 100 && item.error_percent >= 0 && item.error_percent <= 100);
    }
  }
}
for (const skill of whole.diagnostics.skills) for (const item of skill.criteria) {
  const byGrade = [10, 11, 12].map(grade => service.report({ grade }).diagnostics.skills.find(data => data.key === skill.key).criteria.find(data => data.id === item.id));
  assert.equal(byGrade.reduce((sum, data) => sum + data.affected, 0), item.affected, 'Whole-school counts equal grade counts');
  assert.equal(byGrade.reduce((sum, data) => sum + data.assessed, 0), item.assessed);
}
assert.notEqual(JSON.stringify(classroom.diagnostics.skills[0].criteria), JSON.stringify(whole.diagnostics.skills[0].criteria));
assert.equal(JSON.stringify(service.report({ class_name: '10 Lí', skill: 'W' }).diagnostics), JSON.stringify(classroom.diagnostics), 'Changing the displayed score must not alter cohort evidence');

// A hand-authored cohort distinguishes a wrong answer, a recognized misconception, a skip and a missing record.
const tiny = pupils.slice(0, 4);
const itemId = evidence.tasks[0].id;
const manual = [
  { student_id: tiny[0].id, task_id: itemId, value: 'A' },
  { student_id: tiny[0].id, task_id: itemId, value: 'B' }, // Latest valid record replaces the first attempt.
  { student_id: tiny[1].id, task_id: itemId, value: 'A' },
  { student_id: tiny[2].id, task_id: itemId, value: null },
  { student_id: 'OUTSIDE-THE-CLASS', task_id: itemId, value: 'A' },
];
const summary = analysis.aggregate(tiny, manual).skills[0];
assert.equal(summary.assessed, 2);
assert.equal(summary.missing, 2);
assert.equal(summary.criteria[0].assessed, 2);
assert.equal(summary.criteria[0].correct_count, 1);
assert.equal(summary.criteria[0].affected, 1);
assert.equal(summary.criteria[0].error_percent, 50, 'Denominator is two assessed pupils, not all four pupils');
assert.equal(summary.criteria[0].pass_percent, 50);
assert.equal(summary.criteria[1].assessed, 0);
assert.equal(summary.criteria[1].error_percent, 0);
const otherWrong = analysis.aggregate(tiny, [{ student_id: tiny[0].id, task_id: itemId, value: 'C' }]).skills[0].criteria[0];
assert.equal(otherWrong.assessed, 1); assert.equal(otherWrong.correct_count, 0); assert.equal(otherWrong.affected, 0, 'An unrelated wrong option is not counted as this specific misconception');
const invalid = analysis.aggregate(tiny, [{ student_id: tiny[0].id, task_id: itemId, value: 'UNKNOWN' }]);
assert.equal(invalid.skills[0].assessed, 0);
for (const skill of analysis.aggregate([], []).skills) { assert.equal(skill.average, null); assert.equal(skill.assessed, 0); assert.equal(skill.errors.length, 0); }
for (const skill of analysis.aggregate(tiny, []).skills) { assert.equal(skill.assessed, 0); assert.equal(skill.missing, 4); assert.equal(skill.errors.length, 0); }
const changedScores = JSON.parse(JSON.stringify(pupils));
changedScores.forEach(student => { student.skills.L.score = 0; });
assert.equal(JSON.stringify(analysis.aggregate(changedScores, responses).skills[0].criteria), JSON.stringify(classroom.diagnostics.skills[0].criteria), 'Errors come from evidence, never from score thresholds');
classroom.diagnostics.skills[0].criteria[0].options.A = 'Changed externally';
classroom.diagnostics.skills[0].criteria[0].practice[0] = 'Changed externally';
assert.notEqual(service.report({ class_name: '10 Lí' }).diagnostics.skills[0].criteria[0].options.A, 'Changed externally');
assert.notEqual(service.report({ class_name: '10 Lí' }).diagnostics.skills[0].criteria[0].practice[0], 'Changed externally');
console.log('School analysis checks passed: all four skills, 12 evidence activities, scope aggregation, exact denominators, missing evidence, duplicate attempts, criterion-specific errors and score-independent observations.');
