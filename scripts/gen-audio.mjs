/**
 * gen-audio.mjs
 *
 * Pure Node ESM script — built-ins only (fs, path, url).
 * Generates two WAV files with 16-bit PCM mono @ 44100 Hz:
 *
 * 1. public/game/audio/overworld.wav
 *    ~2 seconds of a gentle 220 Hz sine tone at amplitude 0.08.
 *    Suitable for looping quietly as background music.
 *
 * 2. public/game/audio/sfx.wav
 *    Audio-sprite file containing two short blips separated by silence.
 *    Howler sprite offsets (start ms, duration ms):
 *      select : [0,   120]   — 120 ms @ 660 Hz
 *      arrive : [500, 200]   — 200 ms @ 880 Hz, starts at 500 ms
 *    Total length: 800 ms (35280 samples at 44100 Hz)
 *
 * Run: node scripts/gen-audio.mjs
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// WAV utilities
// ---------------------------------------------------------------------------

const SAMPLE_RATE = 44100;
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;

/**
 * Build a WAV file buffer from an array of normalised float samples [-1, 1].
 * @param {Float64Array} samples
 * @returns {Buffer}
 */
function buildWav(samples) {
  const dataBytes = samples.length * BYTES_PER_SAMPLE;
  const buf = Buffer.alloc(44 + dataBytes);
  let offset = 0;

  // RIFF header
  buf.write('RIFF', offset, 'ascii'); offset += 4;
  buf.writeUInt32LE(36 + dataBytes, offset); offset += 4;
  buf.write('WAVE', offset, 'ascii'); offset += 4;

  // fmt sub-chunk
  buf.write('fmt ', offset, 'ascii'); offset += 4;
  buf.writeUInt32LE(16, offset); offset += 4;          // PCM chunk size
  buf.writeUInt16LE(1, offset); offset += 2;           // PCM format
  buf.writeUInt16LE(NUM_CHANNELS, offset); offset += 2;
  buf.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
  buf.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE, offset); offset += 4; // byte rate
  buf.writeUInt16LE(NUM_CHANNELS * BYTES_PER_SAMPLE, offset); offset += 2;               // block align
  buf.writeUInt16LE(BITS_PER_SAMPLE, offset); offset += 2;

  // data sub-chunk
  buf.write('data', offset, 'ascii'); offset += 4;
  buf.writeUInt32LE(dataBytes, offset); offset += 4;

  // PCM samples (16-bit signed LE, clamped)
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = Math.round(clamped * 32767);
    buf.writeInt16LE(int16, offset); offset += 2;
  }

  return buf;
}

/**
 * Generate a sine tone with a short linear fade-in/fade-out to avoid clicks.
 * @param {number} hz         Frequency in Hz
 * @param {number} durationMs Duration in milliseconds
 * @param {number} amplitude  Peak amplitude [0, 1]
 * @returns {Float64Array}
 */
function sineBlip(hz, durationMs, amplitude = 0.5) {
  const numSamples = Math.round((durationMs / 1000) * SAMPLE_RATE);
  const fadeSamples = Math.min(Math.round(SAMPLE_RATE * 0.01), Math.floor(numSamples / 4)); // 10 ms fade
  const samples = new Float64Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    let env = amplitude;
    if (i < fadeSamples) env *= i / fadeSamples;
    else if (i > numSamples - fadeSamples) env *= (numSamples - i) / fadeSamples;
    samples[i] = env * Math.sin((2 * Math.PI * hz * i) / SAMPLE_RATE);
  }

  return samples;
}

/**
 * Return a Float64Array of silence with the given duration.
 * @param {number} durationMs
 * @returns {Float64Array}
 */
function silence(durationMs) {
  return new Float64Array(Math.round((durationMs / 1000) * SAMPLE_RATE));
}

/**
 * Concatenate multiple Float64Arrays.
 * @param {Float64Array[]} parts
 * @returns {Float64Array}
 */
function concat(...parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Float64Array(total);
  let i = 0;
  for (const p of parts) {
    out.set(p, i);
    i += p.length;
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. overworld.wav  —  ~2s of gentle 220 Hz sine @ amplitude 0.08
// ---------------------------------------------------------------------------
{
  const durationMs = 2000;
  const samples = sineBlip(220, durationMs, 0.08);
  const wav = buildWav(samples);
  const outPath = join(ROOT, 'public', 'game', 'audio', 'overworld.wav');
  writeFileSync(outPath, wav);
  console.log(`overworld.wav  written: ${wav.length} bytes  (${durationMs} ms, 220 Hz, amp 0.08)`);
}

// ---------------------------------------------------------------------------
// 2. sfx.wav  —  audio-sprite
//    Sprite offsets (startMs, durationMs):
//      select : [0,   120]
//      arrive : [500, 200]
//    Total: 800 ms (35280 samples)
//
//    Layout:
//      [0   … 119 ms]  select blip (120 ms @ 660 Hz)
//      [120 … 499 ms]  silence     (380 ms)
//      [500 … 699 ms]  arrive blip (200 ms @ 880 Hz)
//      [700 … 799 ms]  silence     (100 ms tail)
// ---------------------------------------------------------------------------
{
  const selectBlip = sineBlip(660, 120, 0.5);
  const gap1       = silence(380);         // 120 → 500 ms
  const arriveBlip = sineBlip(880, 200, 0.5);
  const tail       = silence(100);         // 700 → 800 ms

  const samples = concat(selectBlip, gap1, arriveBlip, tail);
  const wav = buildWav(samples);
  const outPath = join(ROOT, 'public', 'game', 'audio', 'sfx.wav');
  writeFileSync(outPath, wav);

  const totalMs = Math.round(samples.length / SAMPLE_RATE * 1000);
  console.log(`sfx.wav        written: ${wav.length} bytes  (${totalMs} ms total)`);
  console.log('  Howler sprite offsets:');
  console.log('    select : [0,   120]   — 660 Hz');
  console.log('    arrive : [500, 200]   — 880 Hz');
}
