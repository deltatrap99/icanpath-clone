import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'src');
const sourceFiles = await readdir(src, { recursive: true });
for (const file of sourceFiles) {
  if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', resolve(src, file)], { stdio: 'inherit' });
  if (file.endsWith('.html')) {
    const html = await readFile(resolve(src, file), 'utf8');
    assert(!/cloudflareinsights|https:\/\//.test(html), `${file} must not load external services`);
    for (const [, path] of html.matchAll(/(?:src|href)="(\/(?!#)[^"]+)"/g)) assert((await stat(resolve(src, '.' + path))).size > 0, `Missing asset: ${path}`);
  }
  if (file.endsWith('.css')) {
    const css = await readFile(resolve(src, file), 'utf8');
    for (const [, , path] of css.matchAll(/url\((["']?)(\/[^"')]+)\1\)/g)) assert((await stat(resolve(src, '.' + path))).size > 0, `Missing CSS asset: ${path}`);
  }
}
const periContext = vm.createContext({ window: {} });
vm.runInContext(await readFile(resolve(src, 'option-2/peri.js'), 'utf8'), periContext);
for (const pose of Object.values(periContext.window.ICanPeri.poses)) assert((await stat(resolve(src, 'option-2/assets/peri', pose.file))).size > 0, `Missing Peri artwork: ${pose.file}`);
const storage = new Map();
const context = vm.createContext({ window: {}, document: { addEventListener() {} }, localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, String(v)) }, crypto: webcrypto, URL, Date, console, setTimeout, Blob });
for (const file of ['demo-core.js', 'audio-manifest.js', 'demo-assessment.js', 'demo-staff.js']) vm.runInContext(await readFile(resolve(src, file), 'utf8'), context, { filename: file });
const D = context.window.ICanDemo;
for (const audio of Object.values(D.audio)) assert((await stat(resolve(src, '.' + audio))).size > 1000, `Missing recorded audio: ${audio}`);
const listening = D.bank.items.filter(item => item.format === 'listening_mcq');
assert(listening.every(item => item.payload.audio_url), 'Every listening item must have a recorded local audio clip');
const request = (path, method = 'GET', body, headers) => D.request(path, { method, body, headers });
await request('/api/staff/login', 'POST', { username: 'admin', password: 'demo123' });
const dashboard = (await request('/api/staff/dashboard')).data;
assert.equal(dashboard.summary.participants, 8);
assert.equal(dashboard.summary.completed, 7);
assert(dashboard.summary.avg.overall > 0, 'Fixture reports must populate dashboard averages');
assert.equal(Object.values(dashboard.summary.cefr_distribution).reduce((a, b) => a + b, 0), 7);
const system = (await request('/api/admin/overview')).data;
assert(system.bank_items >= 60, 'System overview must expose actual question bank count');
const report = (await request('/api/school-report', 'GET', undefined, { 'x-report-token': 'demo-school' })).data;
assert.equal(report.school.name, 'Galaxy Education');
assert.equal(report.summary.participants, 4);
const sample = (await request('/api/results', 'GET', undefined, { 'x-result-token': 'demo-result' })).data.result;
assert.equal(sample.learning_path.units.length, 4);
assert.equal(D.csvExport().includes('Minh Anh'), false);
console.log(`Static assets and combined services passed: ${system.bank_items} bank items, ${Object.keys(D.audio).length} audio clips, populated dashboard, school report, sample result and PII-free CSV.`);
for (const script of ['check-assessment.mjs', 'check-staff.mjs', 'check-journey.mjs', 'check-school-portal.mjs', 'check-school-analysis.mjs', 'check-school-records.mjs', 'check-lessons.mjs']) execFileSync(process.execPath, [resolve(root, 'scripts', script)], { stdio: 'inherit', cwd: root });
