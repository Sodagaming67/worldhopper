import { describe, it, expect } from 'vitest';
import { SKINS, DEFAULT_SKIN, SKIN_SUIT } from '@/game/kit/skins';

describe('island hero roster', () => {
  it('keeps the six persisted skin ids', () => {
    expect(SKINS.map((s) => s.id).sort()).toEqual(
      ['aegis', 'blaze', 'bolt', 'comet', 'mystic', 'titan'],
    );
  });

  it('uses the Moana-inspired island names (spec §5)', () => {
    const byId = Object.fromEntries(SKINS.map((s) => [s.id, s.label]));
    expect(byId.bolt).toBe('Kaia the Wayfinder');
    expect(byId.titan).toBe('Hoku the Demigod');
    expect(byId.comet).toBe('Lani the Manta Spirit');
    expect(byId.aegis).toBe('Koa the Reef Guardian');
    expect(byId.mystic).toBe('Nalu the Kahuna');
    expect(byId.blaze).toBe("Pele's Ember");
  });

  it('every hero has an emoji and a power description', () => {
    for (const s of SKINS) {
      expect(s.emoji.length).toBeGreaterThan(0);
      expect(s.power.length).toBeGreaterThan(3);
      expect(SKIN_SUIT[s.id]).toBeTypeOf('number');
    }
  });

  it('default hero stays bolt (Kaia) for save compatibility', () => {
    expect(DEFAULT_SKIN).toBe('bolt');
  });
});
