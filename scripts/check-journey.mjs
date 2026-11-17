import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const storage = new Map([['icanpath_clone_v1', 'assessment-data-remains-unchanged']]);
let failWrites = false;
const context = vm.createContext({ window: {}, localStorage: {
  getItem: key => storage.get(key) || null,
  setItem: (key, value) => { if (failWrites) throw new Error('Storage unavailable'); storage.set(key, value); },
} });
for (const file of ['journey-state.js', 'reflection.js']) vm.runInContext(await readFile(new URL('../src/option-2/' + file, import.meta.url), 'utf8'), context);
const J = context.window.ICanJourneyState;
const codes = ['A2-U01', 'A2-U02', 'B1-U03', 'B1-U04'];
assert.equal(J.progress('report-a', codes).activeIndex, 0);
J.complete('report-a', codes[1], codes);
assert.equal(J.progress('report-a', codes).activeIndex, 0, 'Opening the journey must still recommend an unfinished earlier stage');
J.complete('report-a', codes[0], codes);
J.complete('report-a', codes[0], codes);
assert.equal(J.progress('report-a', codes).completed.length, 2, 'Repeated completion must not inflate progress');
assert.equal(J.progress('report-a', codes).activeIndex, 2);
assert.equal(J.progress('report-b', codes).completed.length, 0, 'Reports must have independent progress');
assert.throws(() => J.complete('report-a', 'unknown-unit', codes));
for (const code of codes) J.complete('report-a', code, codes);
assert.equal(J.progress('report-a', codes).finished, true);
assert.equal(J.progress('report-a', codes.slice(0, 2)).completed.length, 2, 'Only stages belonging to the current route count');
storage.set('ip_journey_v1:broken-report', 'invalid json');
assert.equal(J.progress('broken-report', codes).completed.length, 0, 'Damaged saved state must recover safely');
failWrites = true;
assert.throws(() => J.complete('report-b', codes[0], codes));
assert.equal(J.progress('report-b', codes).completed.length, 0, 'A failed save must not report a completed stage');
assert.equal(storage.get('icanpath_clone_v1'), 'assessment-data-remains-unchanged');
const freshContext = vm.createContext({ window: {}, localStorage: { getItem: key => storage.get(key) || null } });
vm.runInContext(await readFile(new URL('../src/option-2/journey-state.js', import.meta.url), 'utf8'), freshContext);
assert.equal(freshContext.window.ICanJourneyState.progress('report-a', codes).finished, true, 'Progress must survive a reload');

const model = context.window.ICanReflection.model;
const result = { confidence: { level: 'medium' }, skills: { L: { theta: 3, cefr: 'B1' } }, self_vs_actual: [{ skill: 'L', self_level: 3, self_label_vi: 'Khá tự tin', actual_cefr: 'B1', verdict: 'match' }] };
assert.equal(model(result)[0].actualCefr, 'B1');
assert.equal(model(result)[0].verdict, 'match');
assert.equal(model(result)[1].actualCefr, null, 'A missing skill must not receive an invented CEFR result');
assert.equal(model({ ...result, confidence: { level: 'low' } })[0].verdict, 'unknown', 'Insufficient evidence must not be presented as a reliable comparison');
assert.equal(model({ ...result, skills: { L: { theta: null, cefr: 'B1' } } })[0].actualCefr, null);
assert.equal(model({ ...result, skills: { L: { theta: NaN, cefr: 'B1' } } })[0].actualCefr, null);
assert.equal(model({ ...result, skills: { L: { theta: 0, cefr: 'Pre-A1' } }, self_vs_actual: [{ skill: 'L', self_level: 1, actual_cefr: 'Pre-A1', verdict: 'match' }] })[0].actualCefr, 'Pre-A1', 'A genuine zero score must remain visible');
console.log('Journey checks passed: persistent and isolated completion, unfinished-stage navigation, failed saves, score preservation, and evidence-aware skill reflection.');
