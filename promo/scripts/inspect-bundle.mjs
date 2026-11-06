import {readFile,writeFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const html=await readFile(new URL('../output/CardShare — One Connection.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
try{new Script(script);console.log('Standalone script parses.');}catch(error){console.log(error.message);process.exitCode=1;}
console.log('Script bytes:',script?.length,'module tag count:',(html.match(/type="module"/g)||[]).length);
