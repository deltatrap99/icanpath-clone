/** Generate browser-independent demo recordings offline with macOS system voices. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, stat, mkdir, mkdtemp, rename, rm } from 'node:fs/promises';
import { createHash, webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'src/audio');
const storage = new Map();
const context = vm.createContext({
  window: {}, crypto: webcrypto, URL, console, Date, Math, Set, Map, Blob,
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) },
  document: { addEventListener() {} },
});
for (const name of ['demo-core.js', 'demo-assessment.js']) {
  vm.runInContext(await readFile(path.join(root, 'src', name), 'utf8'), context, { filename: name });
}
const D = context.window.ICanDemo;
const entries = new Map();
function collect(text, rate = 155, category = 'lesson') {
  if (typeof text !== 'string' || !text.trim()) return;
  if (!entries.has(text)) entries.set(text, { text, rate, category });
  else entries.get(text).rate = Math.min(entries.get(text).rate, rate);
}
const listening = D.bank.items.filter(item => item.format === 'listening_mcq');
for (const item of listening) collect(item.payload.audio_script, item.id.startsWith('3-5-') ? 140 : 155, 'listening');
const result = D.makeResult(D.db.sessions['session-demo']);
const unitCodes = [...new Set(result.learning_path.units.map(unit => unit.unit))];
for (const code of unitCodes) {
  const response = await D.assessmentRequest('/api/units/' + encodeURIComponent(code));
  const lesson = response.data.unit.lesson;
  for (const vocab of lesson.vocab || []) { collect(vocab.word, 140, 'vocabulary'); collect(vocab.example); }
  for (const example of lesson.grammar_examples || []) collect(example, 155, 'grammar');
  for (const practice of lesson.speaking_practice || []) collect(typeof practice === 'string' ? practice : practice.text);
}
if (!entries.size || !listening.length || unitCodes.length !== 4) throw new Error('Demo listening bank or four lessons were not found');

await mkdir(output, { recursive: true });
const temporary = await mkdtemp(path.join(os.tmpdir(), 'icanpath-audio-'));
const manifest = {};
let generated = 0, cached = 0;
async function inspect(file) {
  const info = await stat(file);
  if (info.size < 1000) throw new Error('Audio clip is empty or too short: ' + file);
  const { stdout } = await run('/usr/bin/afinfo', [file]);
  const seconds = Number(stdout.match(/estimated duration:\s*([\d.]+)\s*sec/i)?.[1]);
  if (!(seconds > 0)) throw new Error('Audio clip has no nonzero duration: ' + file);
  if (!/aac/i.test(stdout)) throw new Error('Expected AAC audio: ' + file);
  return { bytes: info.size, seconds };
}
async function create(entry) {
  const hash = createHash('sha256').update(entry.text).digest('hex').slice(0, 12);
  const file = path.join(output, hash + '.m4a');
  manifest[entry.text] = '/audio/' + hash + '.m4a';
  try {
    const details = await inspect(file);
    cached++; return { ...entry, file, ...details };
  } catch (error) {
    if (error.code !== 'ENOENT') await rm(file, { force: true });
  }
  // File output prevents speaker playback. Keep the original string as the
  // manifest key; remove only A:/B: dialog labels from the spoken recording.
  const spoken = entry.text.replace(/(^|[\n.!?]\s*|\s)(?:A|B):\s*/g, '$1').trim();
  const input = path.join(temporary, hash + '.txt');
  const aiff = path.join(temporary, hash + '.aiff');
  const encoded = path.join(temporary, hash + '.m4a');
  await writeFile(input, spoken + '\n');
  await run('/usr/bin/say', ['-v', 'Samantha', '-r', String(entry.rate), '-f', input, '-o', aiff], { timeout: 120000 });
  await run('/usr/bin/afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', aiff, encoded], { timeout: 120000 });
  const details = await inspect(encoded);
  await rename(encoded, file);
  await rm(input); await rm(aiff);
  generated++;
  return { ...entry, file, ...details };
}
const queue = [...entries.values()];
const completed = [];
try {
  // Two workers bound synthesis/encoding load while making the task repeatable.
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (queue.length) completed.push(await create(queue.shift()));
  }));
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b, 'en')));
  const script = '/* Offline Samantha recordings for authored demo content. Regenerate: node scripts/generate-audio.mjs */\nwindow.ICanDemo.audio = ' + JSON.stringify(sorted, null, 2) + ';\n';
  await writeFile(path.join(root, 'src/audio-manifest.js'), script);
  // Validate every manifest path after the complete batch, including cache hits.
  const verified = await Promise.all(Object.values(sorted).map(url => inspect(path.join(root, 'src', url))));
  const totalBytes = verified.reduce((sum, clip) => sum + clip.bytes, 0);
  const totalSeconds = verified.reduce((sum, clip) => sum + clip.seconds, 0);
  console.log(JSON.stringify({ clips: verified.length, listeningItems: listening.length, uniqueListeningScripts: new Set(listening.map(x => x.payload.audio_script)).size, lessonUnits: unitCodes, generated, cached, bytes: totalBytes, durationSeconds: Number(totalSeconds.toFixed(2)), minimumDurationSeconds: Math.min(...verified.map(x => x.seconds)), manifest: 'src/audio-manifest.js' }, null, 2));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
