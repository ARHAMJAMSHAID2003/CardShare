/**
 * CardShare / One connection
 * Original 44-second procedural score. No samples or external audio inputs.
 * Pure, seeded DSP: identical PCM for browser playback and offline export.
 */
export const SCORE_DURATION = 44;
export const SCORE_BPM = 100;

export const SCORE_CUES = Object.freeze([
  { time: 0.18, name: 'Brand surface reveal' },
  { time: 4.05, name: 'Cardholder dashboard opens' },
  { time: 6.7, name: 'Cardholder scroll' },
  { time: 9.88, name: 'Requester toggle touch' },
  { time: 12.45, name: 'Circle scroll' },
  { time: 16.16, name: 'Menu touch' },
  { time: 17.81, name: 'History touch' },
  { time: 20.31, name: 'Order touch' },
  { time: 23.1, name: 'Details scroll' },
  { time: 27.05, name: 'Chat vignette' },
  { time: 32.6, name: 'Savings component lifts' },
  { time: 33.1, name: 'Earnings component lifts' },
  { time: 38.35, name: 'Sonic signature / E–B–E' },
]);

const TAU = Math.PI * 2;
const midi = (note) => 440 * 2 ** ((note - 69) / 12);
const smooth = (x) => {
  const v = Math.max(0, Math.min(1, x));
  return v * v * (3 - 2 * v);
};

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return (value / 4294967296) * 2 - 1;
  };
}

/**
 * @param {number} sampleRate PCM samples per second, normally 48000.
 * @returns {{left: Float32Array, right: Float32Array, sampleRate: number,
 *            duration: number, peak: number, rms: number, gain: number}}
 */
export function synthesizeScore(sampleRate = 48000) {
  if (!Number.isInteger(sampleRate) || sampleRate < 16000 || sampleRate > 192000) {
    throw new RangeError('Use an integer sample rate from 16000 to 192000 Hz.');
  }
  const size = Math.round(SCORE_DURATION * sampleRate);
  const left = new Float32Array(size);
  const right = new Float32Array(size);
  const sendL = new Float32Array(size);
  const sendR = new Float32Array(size);

  // Equal-power panning keeps the small digital gestures grounded in stereo.
  function voice(start, length, generator, { level = 1, pan = 0, wet = 0.2 } = {}) {
    const offset = Math.round(start * sampleRate);
    const count = Math.min(Math.round(length * sampleRate), size - offset);
    const l = Math.cos((pan + 1) * Math.PI / 4) * level;
    const r = Math.sin((pan + 1) * Math.PI / 4) * level;
    for (let n = 0; n < count; n++) {
      const index = offset + n;
      if (index < 0) continue;
      const value = generator(n / sampleRate, n, length);
      left[index] += value * l;
      right[index] += value * r;
      sendL[index] += value * l * wet;
      sendR[index] += value * r * wet;
    }
  }

  function pad(start, length, notes, level) {
    notes.forEach((note, i) => {
      const frequency = midi(note);
      const phase = i * 0.83;
      const pan = (i / Math.max(notes.length - 1, 1) - 0.5) * 1.2;
      voice(start, length, (t, _n, end) => {
        const envelope = smooth(t / 1.4) * smooth((end - t) / 1.8);
        // Very small beating gives a slow glassy movement without a chorus wash.
        const detune = Math.sin(TAU * frequency * 1.0009 * t + phase);
        const fundamental = Math.sin(TAU * frequency * t + phase);
        const silk = Math.sin(TAU * frequency * 2 * t + phase) * 0.055;
        const breath = 0.94 + Math.sin(t * 0.9 + phase) * 0.06;
        return (fundamental * 0.61 + detune * 0.32 + silk) * envelope * breath;
      }, { level: level / notes.length, pan, wet: 0.44 });
    });
  }

  function pluck(start, note, { level = 0.06, pan = 0, length = 1.8, wet = 0.45 } = {}) {
    const f = midi(note);
    voice(start, length, (t, _n, end) => {
      const envelope = smooth(t / 0.009) * Math.exp(-t * 3.0) * smooth((end - t) / 0.22);
      const body = Math.sin(TAU * f * t) * 0.82;
      const partial = Math.sin(TAU * f * 2.002 * t) * 0.16 * Math.exp(-t * 7);
      const glint = Math.sin(TAU * f * 3 * t) * 0.035 * Math.exp(-t * 14);
      return (body + partial + glint) * envelope;
    }, { level, pan, wet });
  }

  function sweep(start, length, { level = 0.04, rise = true, pan = 0, seed = 17 } = {}) {
    const noise = seeded(seed);
    let low = 0;
    let broad = 0;
    voice(start, length, (t, _n, end) => {
      const p = t / end;
      const frequency = rise ? 250 + 1500 * p ** 2 : 1900 - 1550 * p;
      const alpha = 1 - Math.exp(-TAU * frequency / sampleRate);
      const input = noise();
      low += alpha * (input - low);
      broad += (1 - Math.exp(-TAU * 110 / sampleRate)) * (input - broad);
      const contour = Math.sin(Math.PI * p) ** 1.5;
      return (low - broad) * contour * (rise ? 0.4 + 0.6 * p : 1 - 0.6 * p);
    }, { level, pan, wet: 0.3 });
  }

  function impact(start, level = 0.13) {
    const noise = seeded(Math.round(start * 12457));
    let filtered = 0;
    voice(start, 1.5, (t, _n, end) => {
      const attack = smooth(t / 0.008);
      // Integrated exponential pitch glide, 88Hz -> 40Hz, avoids phase jumps.
      const phase = TAU * (40 * t + (48 / 22) * (1 - Math.exp(-22 * t)));
      const sub = Math.sin(phase) * Math.exp(-t * 5.6);
      filtered += 0.08 * (noise() - filtered);
      const texture = filtered * Math.exp(-t * 22) * 0.32;
      return (sub + texture) * attack * smooth((end - t) / 0.2);
    }, { level, wet: 0.12 });
  }

  function touch(start, pan = 0, level = 0.032) {
    const noise = seeded(Math.round(start * 3891));
    let filtered = 0;
    voice(start, 0.11, (t) => {
      filtered += 0.26 * (noise() - filtered);
      return (Math.sin(TAU * 760 * t) * 0.55 + filtered * 0.28)
        * smooth(t / 0.003) * Math.exp(-t * 58);
    }, { level, pan, wet: 0.12 });
  }

  // Re-scored for the 44-second real-app edit; no speed changes or repeated WAV.
  const chords=[[40,59,66,71],[48,55,62,64,71],[43,55,59,62,69],[50,57,62,64,69]];
  for(let i=0;i<8;i++)pad(i*4.8+.18,6.5,chords[i%4],.11);
  pad(37,7,[40,59,64,66,71],.12);
  sweep(.2,1.3,{level:.055,seed:200,pan:-.25});
  pluck(.75,83,{level:.035,pan:-.2,length:2.5});
  pluck(1.35,78,{level:.024,pan:.2});
  const arrivals=[4.05,10.05,17.9,20.4,27.05,32.6,33.1,38.35];
  arrivals.forEach((at,i)=>{
    sweep(at-.5,.7,{level:.048,seed:721+i*17,pan:i%2?.25:-.25});
    impact(at,i===7?.12:.065);
    pluck(at,[76,78,71,74][i%4],{level:.045,pan:i%2?.2:-.2,length:2});
  });
  [9.88,16.16,17.81,20.31].forEach((at,i)=>touch(at,i%2?.12:-.12,.055));
  [6.7,12.45,23.1,29.35].forEach((at,i)=>sweep(at,1.5,{level:.022,seed:900+i,pan:.12}));
  // Spacious 100 BPM pulse, with quieter transients under interface reading.
  const notes=[71,74,78,74,69,74,76,71];
  for(let i=0;i<53;i++){
    const at=5.4+i*.6;
    pluck(at,notes[i%notes.length],{level:i%4===0?.023:.014,pan:i%2?.25:-.25,length:1.5});
    if(i%2===0)impact(at,.031);
  }
  pluck(38.35,64,{level:.1,pan:-.14,length:4,wet:.6});
  pluck(38.65,71,{level:.083,pan:.14,length:4,wet:.6});
  pluck(38.95,76,{level:.07,pan:0,length:4.2,wet:.65});

  // Diffuse early reflections and a filtered, cross-fed tail. This is a finite
  // impulse response: it does not depend on a live AudioContext or its clock.
  const taps = [
    [0.061, 0.15, false], [0.089, 0.12, true], [0.149, 0.16, true],
    [0.227, 0.13, false], [0.311, 0.14, true], [0.451, 0.12, false],
    [0.607, 0.095, true], [0.829, 0.075, false], [1.073, 0.05, true],
  ];
  for (const [seconds, gain, cross] of taps) {
    const offset = Math.round(seconds * sampleRate);
    const srcL = cross ? sendR : sendL;
    const srcR = cross ? sendL : sendR;
    let filterL = 0;
    let filterR = 0;
    const alpha = 1 - Math.exp(-TAU * (3200 - seconds * 1800) / sampleRate);
    for (let i = offset; i < size; i++) {
      filterL += alpha * (srcL[i - offset] - filterL);
      filterR += alpha * (srcR[i - offset] - filterR);
      left[i] += filterL * gain;
      right[i] += filterR * gain;
    }
  }

  let peak = 0;
  for (let i = 0; i < size; i++) {
    const t = i / sampleRate;
    const head = smooth((t - 0.1) / 0.45);
    const tail = smooth((SCORE_DURATION - t) / 0.58);
    const dip = 1 - 0.18 * smooth((t - 20.4) / 0.3) * (1 - smooth((t - 26.5) / 0.5));
    const master = head * tail * dip;
    left[i] = Math.tanh(left[i] * 1.15) * master;
    right[i] = Math.tanh(right[i] * 1.15) * master;
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }

  // -1 dBFS sample peak, with no limiter pumping. Plenty of mix headroom can
  // still be chosen at playback, or by applying volume during final editing.
  const gain = peak ? (10 ** (-1 / 20)) / peak : 1;
  let energy = 0;
  peak = 0;
  for (let i = 0; i < size; i++) {
    left[i] *= gain;
    right[i] *= gain;
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
    energy += left[i] ** 2 + right[i] ** 2;
  }
  left[0] = right[0] = left[size - 1] = right[size - 1] = 0;
  return { left, right, sampleRate, duration: SCORE_DURATION, peak, rms: Math.sqrt(energy / (2 * size)), gain };
}
