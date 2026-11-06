import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = process.argv[2] || 'C:/Users/29235/OneDrive - Institute of Business Administration/CardShare — Promo Motion Graphics.html';
const html = await readFile(source, 'utf8');
const mark = html.match(/class="logomark[^\"]*"[^>]*>\s*<img src="data:image\/(\w+);base64,([^\"]+)"/);
if (!mark) throw new Error('The original embedded CardShare logo was not found.');
await mkdir(path.join(root, 'assets'), { recursive: true });
await mkdir(path.join(root, 'reference'), { recursive: true });
await writeFile(path.join(root, 'assets', `cardshare-original.${mark[1]}`), Buffer.from(mark[2], 'base64'));
await writeFile(path.join(root, 'reference', 'original.html'), html);
console.log(`Preserved original HTML and exact embedded logo (${mark[1]}).`);
