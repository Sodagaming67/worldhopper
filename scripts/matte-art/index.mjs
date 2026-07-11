#!/usr/bin/env node
/**
 * Matte AI art drops: remove the flat background, feather edges, crop to
 * content. Usage:
 *
 *   node scripts/matte-art/index.mjs <in.png|in-dir> <out.png|out-dir> \
 *        [--tol 40] [--feather 2] [--pad 2] [--no-crop] [--global] \
 *        [--group a.png,b.png,c.png ...]
 *
 * --global keys every pixel within tolerance (not just border-connected) —
 * use for magenta-key rounds where the key never appears in the art, so
 * enclosed pockets (open railings, fence gaps) get cleared too.
 *
 * --group <files> (repeatable, dir mode only): the listed files are an
 * ANIMATION GROUP — each is matted independently but then cropped to the
 * UNION of the group's content bounds, not its own tight bounds. Without
 * this, two frames of the same character crop to different boxes (e.g. an
 * arms-down vs arms-up pose), so swapping frames shifts the character
 * within a fixed-size sprite — reads as jitter/bobbing in-game. Group every
 * set of frames a Phaser anim swaps between.
 *
 * Typical wire-in session: node scripts/matte-art/index.mjs \
 *   docs/art-drops/kilauea docs/art-drops/staged
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { PNG } from 'pngjs';
import { matteRgba, cropBounds, cropRgba, unionBounds } from './matte.mjs';

const USAGE = 'usage: matte-art <in.png|dir> <out.png|dir> [--tol N] [--feather N] [--pad N] [--no-crop] [--global] [--group a.png,b.png,...]';
const NUMERIC_FLAGS = { '--tol': 'tol', '--feather': 'feather', '--pad': 'pad' };

const args = process.argv.slice(2);
const flags = { tol: 40, feather: 2, pad: 2, crop: true, global: false };
const groups = [];
const paths = [];
for (let i = 0; i < args.length; i++) {
  const key = NUMERIC_FLAGS[args[i]];
  if (key) {
    const raw = args[++i];
    const n = Number(raw);
    if (raw === undefined || Number.isNaN(n)) { console.error(`${args[i - 1]} requires a numeric value, got: ${raw}\n${USAGE}`); process.exit(1); }
    flags[key] = n;
  } else if (args[i] === '--no-crop') {
    flags.crop = false;
  } else if (args[i] === '--global') {
    flags.global = true;
  } else if (args[i] === '--group') {
    const raw = args[++i];
    if (!raw) { console.error(`--group requires a comma-separated file list\n${USAGE}`); process.exit(1); }
    groups.push(raw.split(',').map((s) => s.trim()).filter(Boolean));
  } else if (args[i].startsWith('--')) {
    console.error(`unknown flag: ${args[i]}\n${USAGE}`);
    process.exit(1);
  } else {
    paths.push(args[i]);
  }
}
const [input, output] = paths;
if (!input || !output) {
  console.error(USAGE);
  process.exit(1);
}
const groupOf = new Map(); // filename -> group index
groups.forEach((files, gi) => files.forEach((f) => groupOf.set(f, gi)));

/** Matte only (no crop) — shared by the solo and grouped paths. */
function matteOnly(inFile) {
  const png = PNG.sync.read(readFileSync(inFile));
  const { width: w, height: h } = png;
  const rgba = png.data;
  const bg = matteRgba(rgba, w, h, { tolerance: flags.tol, feather: flags.feather, global: flags.global });
  return { w, h, rgba, bg };
}

function writeCropped(outFile, w, h, rgba, rect, bg, srcW, srcH) {
  if (!rect) { console.error(`  ${basename(outFile)}: fully transparent after matte — check --tol`); return; }
  const outData = Buffer.from(cropRgba(rgba, w, rect));
  const out = new PNG({ width: rect.w, height: rect.h });
  out.data = outData;
  writeFileSync(outFile, PNG.sync.write(out));
  console.log(`  ${basename(outFile)}  keyed rgb(${bg.r},${bg.g},${bg.b})  ${srcW}x${srcH} → ${rect.w}x${rect.h}`);
}

function processOne(inFile, outFile) {
  const { w, h, rgba, bg } = matteOnly(inFile);
  if (!flags.crop) {
    const out = new PNG({ width: w, height: h });
    out.data = rgba;
    writeFileSync(outFile, PNG.sync.write(out));
    console.log(`  ${basename(inFile)} → ${basename(outFile)}  keyed rgb(${bg.r},${bg.g},${bg.b})  ${w}x${h} (uncropped)`);
    return;
  }
  const rect = cropBounds(rgba, w, h, flags.pad);
  writeCropped(outFile, w, h, rgba, rect, bg, w, h);
}

function processGroup(files, inDir, outDir) {
  const mattes = files.map((f) => ({ f, ...matteOnly(join(inDir, f)) }));
  const rects = mattes.map((m) => cropBounds(m.rgba, m.w, m.h, flags.pad));
  const shared = unionBounds(rects);
  console.log(`  group [${files.join(', ')}] shared box ${shared ? shared.w + 'x' + shared.h : 'n/a'}`);
  for (const m of mattes) {
    writeCropped(join(outDir, m.f), m.w, m.h, m.rgba, shared, m.bg, m.w, m.h);
  }
}

if (statSync(input).isDirectory()) {
  mkdirSync(output, { recursive: true });
  const files = readdirSync(input).filter((f) => f.toLowerCase().endsWith('.png'));
  if (!files.length) { console.error(`no .png files in ${input}`); process.exit(1); }
  console.log(`matting ${files.length} file(s) from ${input} → ${output}`);
  const handledGroups = new Set();
  for (const f of files) {
    const gi = groupOf.get(f);
    if (gi !== undefined) {
      if (handledGroups.has(gi)) continue;
      handledGroups.add(gi);
      processGroup(groups[gi], input, output);
    } else {
      processOne(join(input, f), join(output, f));
    }
  }
} else {
  processOne(input, output);
}
