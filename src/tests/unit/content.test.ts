import { describe, it, expect } from 'vitest';
import { validateContent } from '@/lib/contentValidation';
import { QUESTS } from '@/data/quests';
import { CHAPTERS } from '@/data/chapters';
import { LENSES } from '@/data/lenses';

describe('content validation', () => {
  it('all quest content passes schema + rule checks', () => {
    expect(validateContent()).toEqual({ ok: true });
  });

  it('every quest has a real alternate (digital) completion path', () => {
    for (const q of QUESTS) {
      expect(q.alternateObjective.length).toBeGreaterThan(9);
    }
  });

  it('every story chapter (1–7) awards a unique lens', () => {
    const storyLenses = CHAPTERS.filter((c) => c.number >= 1 && c.number <= 7).map((c) => c.lensId);
    expect(new Set(storyLenses).size).toBe(7);
    expect(storyLenses).toHaveLength(LENSES.length);
  });

  it('quest ids are unique', () => {
    const ids = QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('the seven story quests collectively grant all seven lenses', () => {
    const lensIds = QUESTS.filter((q) => q.reward.lensId).map((q) => q.reward.lensId);
    expect(new Set(lensIds).size).toBe(7);
  });
});
