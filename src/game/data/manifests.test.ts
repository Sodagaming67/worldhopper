import { describe, it, expect } from 'vitest';
import { MANIFESTS } from './manifests';
import { TRAMDASH_MANIFEST } from './tramdashAssets';

/** Every file on disk under public/game/, as `/public/game/...` paths. */
const SHIPPED = new Set(Object.keys(import.meta.glob('/public/game/**/*.{png,jpg,webp}')));

/** Every manifest-listed file must actually ship (issue #10's footgun:
 * a typo'd path only fails at runtime as a green-box texture). */
describe('asset manifest registry', () => {
  const manifests = Object.values(MANIFESTS);

  it('registers each manifest under its own id', () => {
    for (const [id, m] of Object.entries(MANIFESTS)) expect(m.id).toBe(id);
  });

  it('has unique texture keys within each manifest', () => {
    for (const m of manifests) {
      const keys = [...m.images, ...m.sheets].map((a) => a.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('points every listed file at a real file under public/game/', () => {
    expect(SHIPPED.size).toBeGreaterThan(0);
    for (const m of manifests) {
      for (const a of [...m.images, ...m.sheets]) {
        expect(SHIPPED.has(`/public/game/${a.file}`), `${m.id}: missing public/game/${a.file}`).toBe(true);
      }
    }
  });

  it('references only defined keys from animations', () => {
    for (const m of manifests) {
      const imageKeys = new Set(m.images.map((i) => i.key));
      const sheetKeys = new Set(m.sheets.map((s) => s.key));
      for (const a of m.sheetAnims) expect(sheetKeys.has(a.sheet), `${m.id}: anim ${a.key}`).toBe(true);
      for (const a of m.frameAnims)
        for (const f of a.frames) expect(imageKeys.has(f), `${m.id}: anim ${a.key} frame ${f}`).toBe(true);
    }
  });
});

describe('TRAMDASH_MANIFEST', () => {
  it('is registered, keys unique and t- prefixed, files under tramdash/', () => {
    expect(MANIFESTS['tramdash']).toBe(TRAMDASH_MANIFEST);
    const keys = TRAMDASH_MANIFEST.images.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const i of TRAMDASH_MANIFEST.images) {
      expect(i.key.startsWith('t-')).toBe(true);
      expect(i.file.startsWith('tramdash/')).toBe(true);
    }
    for (const a of TRAMDASH_MANIFEST.frameAnims) {
      for (const f of a.frames) expect(keys).toContain(f);
    }
  });
});
