// Renders every sound effect in the game from code, offline, into
// public/assets/sounds/*.wav. Deterministic: the same script always writes
// the same files.
//
// Each sound is built from layers that carry weight a single clip lacks:
// a pitched sub "kick" for body, filtered noise for texture, inharmonic
// partials for steel, and a stereo reverb tail for space. A soft saturator
// glues the layers and a final peak normalise sets the level.
//
//   node scripts/synth-sounds.js            render everything
//   node scripts/synth-sounds.js hit_plate block  render only these

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SWING_CLASSES, ARMOR_CLASSES } from '../src/audio/SoundManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'sounds');
const SR = 44100;
const TAU = Math.PI * 2;

// --- Primitives --------------------------------------------------------------

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const secs = (n) => Math.round(n * SR);

class Buffer2 {
  constructor(seconds) {
    this.n = secs(seconds);
    this.L = new Float32Array(this.n);
    this.R = new Float32Array(this.n);
  }

  // Mixes a mono signal in at `start` seconds with constant-power pan (-1..1).
  // `pan` may be a function of the signal's own time (seconds) to move it.
  add(mono, { start = 0, gain = 1, pan = 0 } = {}) {
    const off = secs(start);
    const panAt = typeof pan === 'function' ? pan : () => pan;
    let gl = 0, gr = 0;
    for (let i = 0; i < mono.length && i + off < this.n; i++) {
      if (i === 0 || typeof pan === 'function') {
        const a = (panAt(i / SR) + 1) * Math.PI / 4;
        gl = Math.cos(a) * gain * Math.SQRT2;
        gr = Math.sin(a) * gain * Math.SQRT2;
      }
      this.L[i + off] += mono[i] * gl;
      this.R[i + off] += mono[i] * gr;
    }
    return this;
  }
}

// RBJ biquad. `freq` may be a number or a function of time (seconds), so
// filters can sweep; coefficients are refreshed every 16 samples.
function biquad(input, type, freq, q = 0.707) {
  const out = new Float32Array(input.length);
  const fAt = typeof freq === 'function' ? freq : () => freq;
  let b0, b1, b2, a1, a2;
  const coeffs = (f) => {
    const w = TAU * Math.min(Math.max(f, 10), SR * 0.45) / SR;
    const cw = Math.cos(w);
    const alpha = Math.sin(w) / (2 * q);
    let nb0, nb1, nb2;
    if (type === 'lowpass') { nb0 = (1 - cw) / 2; nb1 = 1 - cw; nb2 = nb0; }
    else if (type === 'highpass') { nb0 = (1 + cw) / 2; nb1 = -(1 + cw); nb2 = nb0; }
    else { nb0 = alpha; nb1 = 0; nb2 = -alpha; } // bandpass, 0 dB peak
    const a0 = 1 + alpha;
    b0 = nb0 / a0; b1 = nb1 / a0; b2 = nb2 / a0;
    a1 = (-2 * cw) / a0; a2 = (1 - alpha) / a0;
  };
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < input.length; i++) {
    if ((i & 15) === 0) coeffs(fAt(i / SR));
    const x = input[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y;
  }
  return out;
}

function noise(seconds, rand) {
  const out = new Float32Array(secs(seconds));
  for (let i = 0; i < out.length; i++) out[i] = rand() * 2 - 1;
  return out;
}

// Multiplies a signal by envelope(t).
function shape(sig, envelope) {
  for (let i = 0; i < sig.length; i++) sig[i] *= envelope(i / SR);
  return sig;
}

// Linear attack, exponential decay with time constant `decay`.
const perc = (attack, decay) => (t) =>
  t < attack ? t / attack : Math.exp(-(t - attack) / decay);

// Smooth rise to `peak` seconds then fall to zero at `len`.
const swell = (peak, len, curve = 2) => (t) => {
  if (t >= len) return 0;
  return t < peak
    ? Math.pow(Math.sin((t / peak) * Math.PI / 2), curve)
    : Math.pow(Math.cos(((t - peak) / (len - peak)) * Math.PI / 2), curve);
};

// Sine whose frequency follows freq(t).
function sine(seconds, freq) {
  const out = new Float32Array(secs(seconds));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.sin(ph);
    ph += TAU * freq(i / SR) / SR;
  }
  return out;
}

// Pitch-dropping sine: the body of a drum, punch or impact.
function kick(seconds, fStart, fEnd, sweep, decay) {
  return shape(sine(seconds, (t) => fEnd + (fStart - fEnd) * Math.exp(-t / sweep)), perc(0.002, decay));
}

// Band-limited sawtooth (PolyBLEP) for brass-like voices.
function saw(seconds, freq, rand) {
  const out = new Float32Array(secs(seconds));
  let ph = rand();
  const dt = freq / SR;
  for (let i = 0; i < out.length; i++) {
    let v = 2 * ph - 1;
    if (ph < dt) { const x = ph / dt; v -= x + x - x * x - 1; }
    else if (ph > 1 - dt) { const x = (ph - 1) / dt; v -= x * x + x + x + 1; }
    out[i] = v;
    ph += dt;
    if (ph >= 1) ph -= 1;
  }
  return out;
}

// Struck steel: inharmonic partials, each a slightly detuned pair so the
// ring beats and shimmers instead of sounding like a pure electronic tone.
const STEEL = [
  { r: 1.00, a: 0.55, d: 1.00 },
  { r: 1.51, a: 0.35, d: 0.70 },
  { r: 2.37, a: 0.45, d: 0.55 },
  { r: 3.13, a: 0.28, d: 0.40 },
  { r: 4.08, a: 0.24, d: 0.28 },
  { r: 5.45, a: 0.18, d: 0.20 },
  { r: 6.83, a: 0.12, d: 0.14 },
];

function steel(buf, { start = 0, base, decayScale = 1, gain = 1, seconds, rand }) {
  STEEL.forEach((p, k) => {
    const f = base * p.r * (1 + (rand() - 0.5) * 0.01);
    for (const detune of [1, 1.0045]) {
      const tone = shape(sine(seconds, () => f * detune), perc(0.0008, p.d * decayScale));
      buf.add(tone, { start, gain: gain * p.a * 0.5, pan: (k % 2 ? 0.25 : -0.25) * (detune > 1 ? -1 : 1) });
    }
  });
}

// Freeverb-style stereo reverb: 8 damped combs into 4 allpasses per side.
// The buffer grows to hold the full tail; `finish` trims what decays to silence.
function reverb(buf, { wet = 0.2, room = 0.8, damp = 0.4, predelay = 0.012 } = {}) {
  const grow = secs(0.4 + room * 2.2);
  for (const ch of ['L', 'R']) {
    const longer = new Float32Array(buf.n + grow);
    longer.set(buf[ch]);
    buf[ch] = longer;
  }
  buf.n += grow;

  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const allps = [556, 441, 341, 225];
  const spread = 23;
  const fb = 0.7 + room * 0.22;
  const pre = secs(predelay);

  const side = (input, offset) => {
    const out = new Float32Array(input.length);
    const cs = combs.map((len) => ({ b: new Float32Array(len + offset), i: 0, s: 0 }));
    const as = allps.map((len) => ({ b: new Float32Array(len + offset), i: 0 }));
    for (let n = 0; n < input.length; n++) {
      const x = n >= pre ? input[n - pre] * 0.015 : 0;
      let acc = 0;
      for (const c of cs) {
        const y = c.b[c.i];
        c.s = y * (1 - damp) + c.s * damp;
        c.b[c.i] = x + c.s * fb;
        if (++c.i >= c.b.length) c.i = 0;
        acc += y;
      }
      for (const a of as) {
        const y = a.b[a.i];
        a.b[a.i] = acc + y * 0.5;
        if (++a.i >= a.b.length) a.i = 0;
        acc = y - acc;
      }
      out[n] = acc;
    }
    return out;
  };

  // Feed both sides a mono sum so the tail is wide but centred.
  const mono = new Float32Array(buf.n);
  for (let i = 0; i < buf.n; i++) mono[i] = (buf.L[i] + buf.R[i]) * 0.5;
  const wl = side(mono, 0);
  const wr = side(mono, spread);
  const dry = 1 - wet * 0.5;
  for (let i = 0; i < buf.n; i++) {
    buf.L[i] = buf.L[i] * dry + wl[i] * wet * 3;
    buf.R[i] = buf.R[i] * dry + wr[i] * wet * 3;
  }
}

// Soft saturation thickens transients and glues layers together.
function saturate(buf, drive = 1.5) {
  const norm = Math.tanh(drive);
  for (let i = 0; i < buf.n; i++) {
    buf.L[i] = Math.tanh(buf.L[i] * drive) / norm;
    buf.R[i] = Math.tanh(buf.R[i] * drive) / norm;
  }
}

function finish(buf, peak) {
  // Strip DC and inaudible sub-rumble that only eats headroom.
  buf.L = biquad(buf.L, 'highpass', 28);
  buf.R = biquad(buf.R, 'highpass', 28);

  let max = 0;
  for (let i = 0; i < buf.n; i++) max = Math.max(max, Math.abs(buf.L[i]), Math.abs(buf.R[i]));
  const g = max > 0 ? peak / max : 1;

  // Trim the tail once it falls below -66 dBFS, then fade the last 30 ms.
  const floor = 0.0005;
  let end = buf.n;
  while (end > 1 && Math.abs(buf.L[end - 1] * g) < floor && Math.abs(buf.R[end - 1] * g) < floor) end--;
  const fade = Math.min(secs(0.03), end);
  for (let i = 0; i < end; i++) {
    const f = i >= end - fade ? (end - i) / fade : 1;
    buf.L[i] *= g * f;
    buf.R[i] *= g * f;
  }
  buf.n = end;
  return buf;
}

function writeWav(file, buf) {
  const data = Buffer.alloc(buf.n * 4);
  for (let i = 0; i < buf.n; i++) {
    const l = Math.max(-1, Math.min(1, buf.L[i]));
    const r = Math.max(-1, Math.min(1, buf.R[i]));
    data.writeInt16LE(Math.round(l * 32767), i * 4);
    data.writeInt16LE(Math.round(r * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

// --- Layer recipes -------------------------------------------------------------

// A blade or body cutting air: band-passed noise whose centre sweeps up then
// down, panning across the field as it passes.
function whoosh(buf, rand, { len, f0, fPeak, f1, peakAt, q = 1, gain = 1, panFrom = -0.35, panTo = 0.35 }) {
  const f = (t) => (t < peakAt
    ? f0 + (fPeak - f0) * Math.sin((t / peakAt) * Math.PI / 2)
    : fPeak + (f1 - fPeak) * Math.sin(((t - peakAt) / (len - peakAt)) * Math.PI / 2));
  const band = shape(biquad(noise(len, rand), 'bandpass', f, q), swell(peakAt, len, 1.6));
  buf.add(band, { gain, pan: (t) => panFrom + (panTo - panFrom) * Math.min(1, t / len) });
}

// The edge tearing through: a fast downward rip of bright noise.
function slash(buf, rand, { len, gain }) {
  whoosh(buf, rand, { len, f0: 6500, fPeak: 4200, f1: 900, peakAt: 0.012, q: 1.4, gain, panFrom: 0.25, panTo: -0.25 });
}

function thud(buf, rand, { start = 0, len, cutoff, decay, gain = 1 }) {
  buf.add(shape(biquad(noise(len, rand), 'lowpass', cutoff, 0.8), perc(0.002, decay)), { start, gain });
}

function crack(buf, rand, { start = 0, len = 0.05, cutoff = 1800, decay = 0.01, gain = 1, type = 'highpass' }) {
  buf.add(shape(biquad(noise(len, rand), type, cutoff, 0.9), perc(0.0005, decay)), { start, gain });
}

// --- Per-class recipes -----------------------------------------------------------
// Warriors pick a swing class (by weapon) and an armour class (for damage and
// jumps) in src/config/warriors.js. Each class is a variation on one core
// recipe, so the roster sounds related but distinct.

// Chain links or loose fittings: a burst of tiny, bright metal ticks.
function rattle(buf, rand, { start = 0, span = 0.12, count = 16, gain = 0.05, low = 2200, high = 5200 }) {
  for (let k = 0; k < count; k++) {
    const t = start + Math.pow(rand(), 1.6) * span;
    const f = low + rand() * (high - low);
    buf.add(shape(sine(0.06, () => f), perc(0.0003, 0.008 + rand() * 0.012)), { start: t, gain: gain * (0.5 + rand()), pan: rand() * 1.2 - 0.6 });
  }
}

function swing(rand, cls, heavy) {
  const b = new Buffer2(heavy ? 1.2 : 0.7);
  if (cls === 'blade') {
    // Broad straight edge: a full air cut with plenty of displaced air below.
    if (heavy) {
      whoosh(b, rand, { len: 0.55, f0: 260, fPeak: 1500, f1: 300, peakAt: 0.24, q: 0.9, gain: 1 });
      whoosh(b, rand, { len: 0.55, f0: 90, fPeak: 260, f1: 80, peakAt: 0.26, q: 0.6, gain: 1.2 });
      b.add(shape(sine(0.55, (t) => 52 + 10 * Math.sin(t * 6)), swell(0.25, 0.55)), { gain: 0.45 });
    } else {
      whoosh(b, rand, { len: 0.3, f0: 600, fPeak: 2800, f1: 900, peakAt: 0.11, q: 1.3, gain: 1 });
      whoosh(b, rand, { len: 0.3, f0: 180, fPeak: 420, f1: 160, peakAt: 0.12, q: 0.7, gain: 0.9 });
      steel(b, { start: 0.015, base: 1650, decayScale: 0.35, gain: 0.05, seconds: 0.4, rand });
    }
  } else if (cls === 'curved') {
    // Thin curved edge drawn through the cut: faster, brighter, with a
    // narrow singing whistle riding on the air.
    const len = heavy ? 0.46 : 0.26;
    const peakAt = len * 0.4;
    whoosh(b, rand, { len, f0: 900, fPeak: heavy ? 3400 : 4200, f1: 1300, peakAt, q: 1.6, gain: 0.8 });
    whoosh(b, rand, { len, f0: 1100, fPeak: heavy ? 2600 : 3300, f1: 1500, peakAt, q: 9, gain: 1.4 });
    whoosh(b, rand, { len, f0: 160, fPeak: 360, f1: 150, peakAt, q: 0.7, gain: heavy ? 0.9 : 0.55 });
    if (heavy) b.add(shape(sine(len, () => 70), swell(peakAt, len)), { gain: 0.3 });
    steel(b, { start: 0.01, base: 2100, decayScale: 0.45, gain: heavy ? 0.05 : 0.07, seconds: 0.5, rand });
  } else {
    // Short thrusting weapon: a quick rising "fwip" that ends in the lunge,
    // with a short body push behind the heavy version.
    const len = heavy ? 0.32 : 0.18;
    whoosh(b, rand, { len, f0: 380, fPeak: heavy ? 1700 : 2300, f1: heavy ? 1300 : 1900, peakAt: len * 0.75, q: 1.2, gain: 1, panFrom: -0.15, panTo: 0.15 });
    whoosh(b, rand, { len, f0: 120, fPeak: 320, f1: 260, peakAt: len * 0.75, q: 0.7, gain: heavy ? 1.1 : 0.6, panFrom: -0.15, panTo: 0.15 });
    if (heavy) {
      b.add(kick(0.3, 95, 55, 0.04, 0.09), { start: len * 0.65, gain: 0.55 });
      thud(b, rand, { start: len * 0.6, len: 0.2, cutoff: 500, decay: 0.05, gain: 0.4 });
    }
  }
  reverb(b, { wet: heavy ? 0.2 : 0.12, room: heavy ? 0.78 : 0.6 });
  saturate(b, heavy ? 1.5 : 1.3);
  return finish(b, heavy ? 0.9 : 0.85);
}

// Taking a blow. The core is a slash, crack, flesh body and deep punch; the
// armour class adds what the blade meets first.
function damage(rand, armor, heavy) {
  const b = new Buffer2(heavy ? 2.2 : 1.4);
  slash(b, rand, { len: heavy ? 0.22 : 0.14, gain: armor === 'plate' ? 0.45 : heavy ? 0.8 : 0.7 });
  crack(b, rand, { cutoff: heavy ? 1100 : 1400, decay: heavy ? 0.022 : 0.016, gain: 1.0 });
  const flesh = armor === 'plate' ? 0.75 : armor === 'light' ? 1.2 : 1;
  if (heavy) {
    b.add(shape(biquad(noise(0.6, rand), 'bandpass', 130, 0.7), perc(0.001, 0.18)), { gain: 1.9 * flesh });
    b.add(shape(biquad(noise(0.35, rand), 'bandpass', 360, 0.9), perc(0.001, 0.08)), { gain: 1.6 * flesh });
    thud(b, rand, { len: 0.35, cutoff: 700, decay: 0.08, gain: 0.9 });
    b.add(kick(1.4, 150, 30, 0.07, 0.55), { gain: 1.1 });
    b.add(shape(sine(1.2, (t) => 26 + 44 * Math.exp(-t / 0.35)), perc(0.004, 0.5)), { gain: 0.5 });
    thud(b, rand, { start: 0.01, len: 1.6, cutoff: 110, decay: 0.7, gain: 0.7 });
    // A1 + Bb1 + E2: a semitone rub gives the stab its sense of dread.
    for (const [f, pan] of [[55.0, -0.2], [58.27, 0.2], [82.41, 0]]) {
      let v = saw(0.9, f, rand);
      v = biquad(v, 'lowpass', (t) => 200 + 1500 * Math.exp(-t / 0.12), 1.2);
      b.add(shape(v, perc(0.005, 0.35)), { gain: 0.16, pan });
    }
  } else {
    b.add(shape(biquad(noise(0.4, rand), 'bandpass', 190, 0.8), perc(0.001, 0.1)), { gain: 1.8 * flesh });
    b.add(shape(biquad(noise(0.25, rand), 'bandpass', 480, 0.9), perc(0.001, 0.05)), { gain: 1.5 * flesh });
    thud(b, rand, { len: 0.25, cutoff: 900, decay: 0.06, gain: 0.8 });
    b.add(kick(0.8, 170, 40, 0.04, 0.28), { gain: 1.0 });
    thud(b, rand, { start: 0.008, len: 0.9, cutoff: 150, decay: 0.28, gain: 0.6 });
  }

  if (armor === 'plate') {
    // Edge on a breastplate: a hard, dented clang that rings over the body.
    crack(b, rand, { len: 0.03, cutoff: 3600, decay: 0.005, gain: 0.7, type: 'bandpass' });
    steel(b, { start: 0.001, base: heavy ? 410 : 560, decayScale: heavy ? 0.6 : 0.45, gain: heavy ? 0.5 : 0.45, seconds: 1.0, rand });
  } else if (armor === 'mail') {
    // Rings and lamellae: a short metal bite and a scatter of links.
    steel(b, { start: 0.002, base: heavy ? 520 : 680, decayScale: 0.25, gain: 0.16, seconds: 0.5, rand });
    rattle(b, rand, { start: 0.004, span: heavy ? 0.2 : 0.13, count: heavy ? 28 : 18, gain: 0.06 });
  } else {
    // Cloth and skin: a wet, close slap and no metal to speak of.
    b.add(shape(biquad(noise(0.1, rand), 'bandpass', 1100, 1.1), perc(0.0005, 0.018)), { gain: 1.1 });
    b.add(shape(biquad(noise(0.15, rand), 'bandpass', 700, 1.0), perc(0.001, 0.03)), { start: 0.004, gain: 0.7 });
  }

  saturate(b, heavy ? 3.5 : 3.2);
  reverb(b, heavy ? { wet: 0.32, room: 0.9, predelay: 0.02 } : { wet: 0.22, room: 0.8 });
  return finish(b, heavy ? 0.98 : 0.97);
}

// Leaving the ground: a foot push-off, plus whatever the armour does.
function leap(rand, armor) {
  const b = new Buffer2(0.5);
  const weight = armor === 'plate' ? 1.4 : armor === 'mail' ? 1.15 : 1;
  b.add(kick(0.2, 120 / weight, 70 / weight, 0.015, 0.04 * weight), { gain: 0.7 * weight });
  thud(b, rand, { len: 0.2, cutoff: 800 / weight, decay: 0.035 * weight, gain: 0.8 });
  const flutter = biquad(noise(0.28, rand), 'bandpass', 1100, 1.6);
  b.add(shape(flutter, (t) => swell(0.08, 0.28)(t) * (0.6 + 0.4 * Math.sin(TAU * 28 * t))), { start: 0.02, gain: armor === 'light' ? 0.55 : 0.3 });
  if (armor === 'plate') {
    steel(b, { start: 0.01, base: 760, decayScale: 0.12, gain: 0.1, seconds: 0.25, rand });
    steel(b, { start: 0.06, base: 900, decayScale: 0.1, gain: 0.06, seconds: 0.2, rand });
  } else if (armor === 'mail') {
    rattle(b, rand, { start: 0.008, span: 0.16, count: 14, gain: 0.045 });
  }
  reverb(b, { wet: 0.08, room: 0.5 });
  return finish(b, 0.8);
}

// --- Sounds ------------------------------------------------------------------------

const SOUNDS = {
  // Steel on steel: a ringing clang with a hard transient and a dull shove.
  block(rand) {
    const b = new Buffer2(1.6);
    crack(b, rand, { len: 0.03, cutoff: 4200, decay: 0.005, gain: 0.8, type: 'bandpass' });
    steel(b, { base: 430, decayScale: 0.75, gain: 0.9, seconds: 1.3, rand });
    b.add(kick(0.25, 110, 62, 0.02, 0.07), { gain: 0.8 });
    thud(b, rand, { len: 0.15, cutoff: 500, decay: 0.03, gain: 0.5 });
    saturate(b, 1.6);
    reverb(b, { wet: 0.24, room: 0.78 });
    return finish(b, 0.9);
  },

  // Perfect deflection: a brighter, longer ring and a blade-scrape "shing".
  parry(rand) {
    const b = new Buffer2(2.4);
    crack(b, rand, { len: 0.03, cutoff: 5200, decay: 0.004, gain: 0.7, type: 'bandpass' });
    steel(b, { base: 610, decayScale: 1.5, gain: 0.9, seconds: 2.0, rand });
    steel(b, { start: 0.004, base: 915, decayScale: 1.1, gain: 0.35, seconds: 1.6, rand });
    whoosh(b, rand, { len: 0.22, f0: 3000, fPeak: 7000, f1: 5200, peakAt: 0.05, q: 2.2, gain: 0.45, panFrom: 0.3, panTo: -0.3 });
    b.add(kick(0.2, 140, 80, 0.02, 0.05), { gain: 0.5 });
    saturate(b, 1.3);
    reverb(b, { wet: 0.34, room: 0.88, damp: 0.3 });
    return finish(b, 0.88);
  },

  // Guard shattered: a cracked, distorted clang over a heavy boom.
  guard_break(rand) {
    const b = new Buffer2(1.8);
    crack(b, rand, { len: 0.08, cutoff: 2600, decay: 0.02, gain: 1.0, type: 'bandpass' });
    steel(b, { base: 330, decayScale: 0.55, gain: 0.8, seconds: 1.0, rand });
    steel(b, { start: 0.03, base: 470, decayScale: 0.35, gain: 0.45, seconds: 0.7, rand });
    b.add(kick(0.9, 120, 38, 0.05, 0.32), { gain: 1.3 });
    thud(b, rand, { len: 0.8, cutoff: 160, decay: 0.3, gain: 0.8 });
    saturate(b, 3.5);
    reverb(b, { wet: 0.28, room: 0.85 });
    return finish(b, 0.97);
  },

  // Signature move: a rising rush into a war-drum boom and a low brass stab.
  special(rand) {
    const b = new Buffer2(2.6);
    whoosh(b, rand, { len: 0.32, f0: 180, fPeak: 2400, f1: 2000, peakAt: 0.3, q: 0.9, gain: 0.8, panFrom: -0.5, panTo: 0.2 });
    const hitAt = 0.28;
    b.add(kick(1.4, 100, 30, 0.06, 0.6), { start: hitAt, gain: 1.1 });
    crack(b, rand, { start: hitAt, cutoff: 900, decay: 0.02, gain: 0.7, type: 'lowpass' });
    thud(b, rand, { start: hitAt, len: 1.6, cutoff: 140, decay: 0.7, gain: 1.0 });
    // D minor power chord, three detuned saws per note, filter opening on the hit.
    const brassLen = 1.6;
    for (const [f, pan] of [[73.42, 0], [110.0, -0.3], [146.83, 0.3], [174.61, 0]]) {
      for (const cents of [-7, 0, 7]) {
        let v = saw(brassLen, f * Math.pow(2, cents / 1200), rand);
        v = biquad(v, 'lowpass', (t) => 300 + 2400 * Math.exp(-t / 0.4) * Math.min(1, t / 0.05), 1.1);
        b.add(shape(v, perc(0.03, 0.6)), { start: hitAt, gain: 0.2, pan: pan + cents / 30 });
      }
    }
    saturate(b, 2.0);
    reverb(b, { wet: 0.32, room: 0.9 });
    return finish(b, 0.97);
  },

  // Dash: a low body rush and a scuff of the lead foot.
  dash(rand) {
    const b = new Buffer2(0.6);
    thud(b, rand, { len: 0.12, cutoff: 650, decay: 0.03, gain: 0.8 });
    whoosh(b, rand, { len: 0.32, f0: 250, fPeak: 1300, f1: 380, peakAt: 0.1, q: 0.8, gain: 0.9 });
    whoosh(b, rand, { len: 0.32, f0: 90, fPeak: 220, f1: 90, peakAt: 0.1, q: 0.6, gain: 0.8 });
    reverb(b, { wet: 0.1, room: 0.55 });
    return finish(b, 0.8);
  },

  // Body hitting the ground: deep thud, armour rattle, grit.
  body_fall(rand) {
    const b = new Buffer2(1.3);
    b.add(kick(0.7, 95, 34, 0.04, 0.26), { gain: 1.3 });
    thud(b, rand, { len: 0.4, cutoff: 260, decay: 0.13, gain: 1.1 });
    b.add(shape(biquad(noise(0.25, rand), 'bandpass', 320, 0.8), perc(0.001, 0.06)), { gain: 1.3 });
    for (let k = 0; k < 7; k++) {
      const t = 0.01 + rand() * 0.12;
      const f = 800 + rand() * 1600;
      b.add(shape(sine(0.15, () => f), perc(0.0005, 0.04)), { start: t, gain: 0.06, pan: rand() - 0.5 });
    }
    const grit = biquad(noise(0.35, rand), 'highpass', 2200);
    for (let i = 0; i < grit.length; i++) if (rand() > 0.06) grit[i] *= 0.15;
    b.add(shape(grit, perc(0.002, 0.08)), { gain: 0.25 });
    saturate(b, 2.0);
    reverb(b, { wet: 0.18, room: 0.72 });
    return finish(b, 0.92);
  },

  // Versus-screen slam: drum boom under a big low clang in a large hall.
  clash(rand) {
    const b = new Buffer2(3.2);
    crack(b, rand, { len: 0.05, cutoff: 3200, decay: 0.008, gain: 0.8, type: 'bandpass' });
    steel(b, { base: 255, decayScale: 1.4, gain: 0.8, seconds: 2.4, rand });
    steel(b, { start: 0.002, base: 382, decayScale: 1.0, gain: 0.35, seconds: 1.8, rand });
    b.add(kick(1.4, 110, 34, 0.05, 0.55), { gain: 1.4 });
    thud(b, rand, { len: 1.2, cutoff: 380, decay: 0.25, gain: 0.9 });
    saturate(b, 2.2);
    reverb(b, { wet: 0.4, room: 0.93, damp: 0.35, predelay: 0.02 });
    return finish(b, 0.97);
  },

  // Menu focus: a soft low wooden tick, warm instead of a high ping.
  ui_hover(rand) {
    const b = new Buffer2(0.3);
    b.add(shape(sine(0.2, () => 260), perc(0.001, 0.05)), { gain: 0.6 });
    b.add(shape(sine(0.2, () => 523), perc(0.001, 0.03)), { gain: 0.3 });
    crack(b, rand, { len: 0.02, cutoff: 2400, decay: 0.003, gain: 0.3, type: 'bandpass' });
    reverb(b, { wet: 0.1, room: 0.5 });
    return finish(b, 0.6);
  },

  // Menu confirm: a short blade "shing" over a firm thump.
  ui_click(rand) {
    const b = new Buffer2(0.9);
    b.add(kick(0.3, 170, 70, 0.02, 0.07), { gain: 1.0 });
    thud(b, rand, { len: 0.12, cutoff: 700, decay: 0.025, gain: 0.5 });
    steel(b, { start: 0.005, base: 820, decayScale: 0.32, gain: 0.35, seconds: 0.6, rand });
    whoosh(b, rand, { len: 0.14, f0: 2400, fPeak: 5200, f1: 4200, peakAt: 0.04, q: 2, gain: 0.25 });
    saturate(b, 1.4);
    reverb(b, { wet: 0.16, room: 0.65 });
    return finish(b, 0.85);
  },

  // Round won: timpani strikes under a two-chord brass fanfare (A -> D major).
  victory(rand) {
    const b = new Buffer2(4.2);
    const timpani = (start, f) => {
      b.add(kick(1.2, f * 1.25, f, 0.03, 0.55), { start, gain: 1.0 });
      thud(b, rand, { start, len: 0.4, cutoff: 500, decay: 0.08, gain: 0.5 });
    };
    const chord = (start, len, notes, attack) => {
      for (const [f, pan] of notes) {
        for (const cents of [-6, 0, 6]) {
          let v = saw(len, f * Math.pow(2, cents / 1200), rand);
          v = biquad(v, 'lowpass', (t) => 400 + 2000 * Math.min(1, t / (attack * 2)) * Math.exp(-Math.max(0, t - attack * 2) / 1.2), 0.9);
          const env = (t) => Math.min(1, t / attack) * (t > len - 0.9 ? Math.max(0, (len - t) / 0.9) : 1);
          b.add(shape(v, env), { start, gain: 0.1, pan: pan + cents / 40 });
        }
      }
    };
    timpani(0, 82.41);
    chord(0, 0.5, [[110.0, 0], [164.81, -0.3], [220.0, 0.3], [277.18, 0]], 0.03);
    timpani(0.45, 73.42);
    chord(0.45, 2.6, [[73.42, 0], [146.83, 0], [220.0, -0.35], [293.66, 0.35], [369.99, 0]], 0.12);
    saturate(b, 1.6);
    reverb(b, { wet: 0.34, room: 0.9 });
    return finish(b, 0.92);
  },
};

for (const cls of SWING_CLASSES) {
  SOUNDS[`light_attack_${cls}`] = (rand) => swing(rand, cls, false);
  SOUNDS[`heavy_attack_${cls}`] = (rand) => swing(rand, cls, true);
}
for (const armor of ARMOR_CLASSES) {
  SOUNDS[`hit_${armor}`] = (rand) => damage(rand, armor, false);
  SOUNDS[`hit_heavy_${armor}`] = (rand) => damage(rand, armor, true);
  SOUNDS[`jump_${armor}`] = (rand) => leap(rand, armor);
}

// --- Main ----------------------------------------------------------------------------

const only = process.argv.slice(2);
const names = only.length ? only : Object.keys(SOUNDS);
fs.mkdirSync(OUT_DIR, { recursive: true });
names.forEach((name, i) => {
  if (!SOUNDS[name]) throw new Error(`Unknown sound: ${name}`);
  // Seed from the name so each sound is stable regardless of render order.
  let seed = 7;
  for (const ch of name) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const buf = SOUNDS[name](rng(seed));
  const file = path.join(OUT_DIR, `${name}.wav`);
  writeWav(file, buf);
  console.log(`${name.padEnd(22)} ${(buf.n / SR).toFixed(2)}s  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
});
