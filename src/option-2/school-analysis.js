/* Count observed responses, not inferred errors from an overall score. Each pupil is counted once per criterion. */
(() => {
  'use strict';
  const keys = ['L', 'R', 'S', 'W'];
  const round = value => Math.round(value * 10) / 10;
  const percent = (part, total) => total ? round(part * 100 / total) : 0;
  function aggregate(students, responses, tasks = window.ICanSchoolEvidence.tasks) {
    const ids = new Set(students.map(student => student.id));
    const observations = new Map();
    // Last response replaces an earlier attempt. Responses outside this cohort are excluded.
    for (const response of responses) if (ids.has(response.student_id)) observations.set(response.student_id + ':' + response.task_id, response);
    const skills = keys.map(key => {
      const assessedIds = new Set();
      const criteria = tasks.filter(task => task.skill === key).map(task => {
        const accepted = task.kind === 'choice' ? Object.keys(task.options) : ['met', 'needs_support'];
        const observed = students.map(student => observations.get(student.id + ':' + task.id)).filter(record => record && accepted.includes(record.value));
        observed.forEach(record => assessedIds.add(record.student_id));
        const correct = observed.filter(record => record.value === task.correct).length;
        const affected = observed.filter(record => record.value === task.misconception).length;
        return { ...JSON.parse(JSON.stringify(task)), assessed: observed.length, missing: students.length - observed.length, correct_count: correct, pass_percent: percent(correct, observed.length), affected, error_percent: percent(affected, observed.length) };
      });
      const errors = criteria.filter(item => item.assessed && item.affected).sort((a, b) => b.affected / b.assessed - a.affected / a.assessed || b.affected - a.affected || a.id.localeCompare(b.id));
      const average = students.length ? round(students.reduce((sum, student) => sum + student.skills[key].score, 0) / students.length) : null;
      const atB1 = students.filter(student => ['B1', 'B2', 'C1'].includes(student.skills[key].cefr)).length;
      return { key, average, total: students.length, at_b1: atB1, at_b1_percent: percent(atB1, students.length), assessed: assessedIds.size, missing: students.length - assessedIds.size, criteria, errors };
    });
    const sorted = [...skills].filter(skill => skill.average !== null).sort((a, b) => a.average - b.average || keys.indexOf(a.key) - keys.indexOf(b.key));
    return { source: 'illustrative-evidence', total: students.length, task_count: tasks.length, skills, lowest: sorted[0]?.key || null, highest: sorted.at(-1)?.key || null };
  }
  function report(students) { return aggregate(students, students.flatMap(window.ICanSchoolEvidence.responsesFor)); }
  window.ICanSchoolAnalysis = { aggregate, report };
})();
