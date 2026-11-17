import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'src');
const dist = resolve(root, 'dist');
const sourceFiles = await readdir(src, { recursive: true });
for (const file of sourceFiles) if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', resolve(src, file)], { stdio: 'inherit' });
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });
for (const file of sourceFiles.filter(file => file.endsWith('.html'))) {
  const index = await readFile(resolve(dist, file), 'utf8');
  if (!index.includes('demo-core.js') || /cloudflareinsights|icanpath\.duckmind\.ai/.test(index)) throw new Error(`Unexpected runtime source dependency in ${file}`);
}
await writeFile(resolve(dist, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: same-origin\n  Permissions-Policy: camera=(), microphone=(self)\n');
console.log('Built ICan Path clone to dist/ (static, no dependencies).');
