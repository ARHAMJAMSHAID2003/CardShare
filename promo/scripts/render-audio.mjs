import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { synthesizeScore, SCORE_CUES } from '../audio/score.mjs';

const promoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const score = synthesizeScore(48000);
const length = score.left.length;
const bytes = length * 2 * 2;
const wav = Buffer.alloc(44 + bytes);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + bytes, 4);
wav.write('WAVE', 8);
wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(score.sampleRate, 24);
wav.writeUInt32LE(score.sampleRate * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(bytes, 40);
for (let i = 0; i < length; i++) {
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, score.left[i])) * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, score.right[i])) * 32767), 46 + i * 4);
}
const destination = resolve(promoRoot, 'assets', 'soundtrack.wav');
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, wav);
const toDb = (value) => (20 * Math.log10(Math.max(1e-12, value))).toFixed(2);
console.log(`Rendered ${score.duration}s stereo score at ${score.sampleRate}Hz: ${destination}`);
console.log(`Peak: ${toDb(score.peak)} dBFS; RMS: ${toDb(score.rms)} dBFS; ${length} samples/channel.`);
console.log(`Endpoints: ${score.left[0]}, ${score.right[0]} -> ${score.left.at(-1)}, ${score.right.at(-1)}`);
console.log('Cue sheet:');
for (const cue of SCORE_CUES) console.log(`  ${cue.time.toFixed(2).padStart(5)}s  ${cue.name}`);
