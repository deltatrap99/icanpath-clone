import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';

const D = { db: { sessions: {}, results: {} }, save() {}, uid: value => value, ok: (data, status = 200) => ({ data, status }), fail(status, message, code) { throw Object.assign(new Error(message), { status, code }); } };
const context = vm.createContext({ window: { ICanDemo: D }, URL, Date, console });
for (const name of ['audio-manifest.js', 'demo-assessment.js']) vm.runInContext(await readFile(new URL('../src/' + name, import.meta.url), 'utf8'), context);
const words = new Set(), counts = { noun: 0, verb: 0, adjective: 0, adverb: 0 };
let examples = 0;
for (const code of ['A2-U01', 'A2-U02', 'B1-U03', 'B1-U04']) {
  const { data } = await D.assessmentRequest('/api/units/' + code);
  const { lesson, audio } = data.unit;
  assert.equal(lesson.vocab.length, 4);
  assert.equal(lesson.grammar_points.length, 2);
  const coveredExamples = [];
  for (const point of lesson.grammar_points) {
    assert(point.title_vi && point.explanation_vi && point.patterns.length);
    for (const index of point.example_indices) {
      assert(lesson.grammar_examples[index], 'A grammar example reference must resolve to an existing authored sentence');
      coveredExamples.push(index);
    }
  }
  assert.equal(new Set(coveredExamples).size, lesson.grammar_examples.length, 'Every original grammar example must remain in the redesigned lesson');
  assert.equal(coveredExamples.length, lesson.grammar_examples.length, 'Original grammar examples must not be duplicated across points');
  for (const word of lesson.vocab) {
    assert(!words.has(word.word), 'Each authored vocabulary item must have a distinct record');
    words.add(word.word);
    assert(Object.hasOwn(counts, word.pos)); counts[word.pos]++;
    assert(word.pos_vi && word.meaning_vi && word.example_vi);
    assert(/^\/[^/]+\/$/u.test(word.ipa_us), 'Every word must carry a complete US IPA transcription');
    assert(!/[\u00b7\u2014]/.test(word.ipa_us), 'IPA must preserve syllable dots without copy-normalizer separators');
    assert.equal(word.dictionary_url, 'https://dictionary.cambridge.org/us/dictionary/english/' + word.word);
    for (const text of [word.word, word.example]) {
      assert(audio[text], 'Both isolated words and contextual examples need an offline recording');
      assert((await stat(new URL('../src' + audio[text], import.meta.url))).size > 1000);
    }
    if (word.word === 'volunteer') { assert.equal(word.pos, 'verb'); assert.equal(word.meaning_vi, 'làm tình nguyện'); assert(word.note_vi.includes('danh từ')); }
    if (word.word === 'steam') assert.equal(word.pos, 'verb', 'The cooking instruction uses steam as a verb');
  }
  for (const sentence of lesson.grammar_examples) {
    assert(audio[sentence], 'All grammar examples need an offline recording');
    assert((await stat(new URL('../src' + audio[sentence], import.meta.url))).size > 1000);
    examples++;
  }
}
assert.equal(words.size, 16);
assert.deepEqual(counts, { noun: 5, verb: 5, adjective: 4, adverb: 2 });
assert.equal(examples, 12);
console.log('Lesson checks passed: 16 vocabulary items with IPA, contextual word classes, translations, dictionary references and offline word/example audio, plus all 12 original grammar examples.');
