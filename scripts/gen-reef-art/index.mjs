import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { encodePng } from './png.mjs';
import { Raster } from './raster.mjs';
import { SPRITES } from './sprites.mjs';

// M1: vendored painted art now lives in public/game/reef/ (see
// docs/game/ATTRIBUTION.md). The pixel generator is kept as a placeholder
// tool for future worlds and writes to a gitignored scratch dir instead.
const outDir = join(dirname(fileURLToPath(import.meta.url)), 'out');
mkdirSync(outDir, { recursive: true });

for (const s of SPRITES) {
  const r = new Raster(s.w, s.h);
  s.draw(r);
  const png = encodePng(s.w, s.h, r.toRgba());
  writeFileSync(join(outDir, `${s.name}.png`), png);
  console.log(`wrote reef/${s.name}.png (${s.w}x${s.h})`);
}
console.log(`done: ${SPRITES.length} sprites`);
