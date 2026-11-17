import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['img/fox-hello.webp', 'img/fox-study.webp', 'img/fox-cheer.webp', 'fonts/nunito-latin.woff2', 'fonts/nunito-latin-ext.woff2', 'fonts/nunito-vietnamese.woff2', 'vendor/qrcode.js'];
for (let i = 0; i < files.length; i += 4) {
  await Promise.all(files.slice(i, i + 4).map(async file => {
    const response = await fetch('https://icanpath.duckmind.ai/' + file);
    if (!response.ok) throw new Error(`${response.status} ${file}`);
    const path = resolve(root, 'src', file);
    await mkdir(dirname(path), { recursive: true });
    const bytes = new Uint8Array(await response.arrayBuffer());
    await writeFile(path, bytes);
    console.log(`${file} (${bytes.length} bytes)`);
  }));
}
