import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..',import.meta.url));
const output = path.join(root,'output');
await mkdir(output,{recursive:true});
const bundle = await build({
  entryPoints:[path.join(root,'src','main.js')],bundle:true,write:false,
  format:'iife',platform:'browser',target:['chrome120','safari17'],minify:true,
  legalComments:'inline',
});
let html = await readFile(path.join(root,'index.html'),'utf8');
let css = await readFile(path.join(root,'styles.css'),'utf8');
for (const weight of [400,500,600,700]) {
  const relative = `./node_modules/@fontsource/poppins/files/poppins-latin-${weight}-normal.woff2`;
  const bytes = await readFile(path.join(root,relative));
  css = css.replace(relative,`data:font/woff2;base64,${bytes.toString('base64')}`);
}
const audio = await readFile(path.join(root,'assets','soundtrack.wav'));
for (const relative of new Set(html.match(/\.\/assets\/app\/\d+\.jpg/g))) {
  const bytes = await readFile(path.join(root,relative));
  html = html.replaceAll(relative,`data:image/jpeg;base64,${bytes.toString('base64')}`);
}
html = html
  .replace('<link rel="stylesheet" href="./styles.css">',()=>`<style>${css}</style>`)
  .replace(/<script type="importmap">[\s\S]*?<\/script>/,'')
  .replace('./assets/soundtrack.wav',`data:audio/wav;base64,${audio.toString('base64')}`)
  .replace('<script type="module" src="./src/main.js"></script>',()=>`<script>${bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script>`);
const target = path.join(output,'CardShare — One Connection.html');
await writeFile(target,html);
console.log(`Standalone film: ${target} (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MB)`);
console.log('Open this HTML directly. Actual app screenshots, fonts, score, Three.js and GSAP are embedded.');
