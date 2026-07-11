import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { difficultyMods, worldNodeStatus } from '@/lib/gameRules';
import { parseSave } from '@/lib/storage';
import { WORLD_BY_ID } from '@/game/data/worlds';
import type { GameState } from '@/types/game';

describe('world progress', () => {
  beforeEach(() => useGameStore.getState().resetAdventure());

  it('defaults: chill difficulty, empty progress', () => {
    expect(useGameStore.getState().settings.difficulty).toBe('chill');
    expect(useGameStore.getState().worldProgress).toEqual({});
  });

  it('recordWorldResult merges: max stars, max score, sticky cleared', () => {
    const s = useGameStore.getState();
    s.recordWorldResult('lagoon', { score: 300, stars: 2, cleared: true });
    s.recordWorldResult('lagoon', { score: 120, stars: 1, cleared: false });
    expect(useGameStore.getState().worldProgress.lagoon).toEqual({
      stars: 2, bestScore: 300, cleared: true,
    });
  });

  it('difficultyMods: chill is gentler, challenge is 1:1', () => {
    expect(difficultyMods('chill')).toEqual({ hpMul: 1.25, lavaMul: 0.7, extraLives: 1 });
    expect(difficultyMods('challenge')).toEqual({ hpMul: 1, lavaMul: 1, extraLives: 0 });
  });

  it('worldNodeStatus: soon stays soon; ready flips to cleared once cleared', () => {
    const state = useGameStore.getState() as unknown as GameState;
    expect(worldNodeStatus(state, WORLD_BY_ID.lavaTube)).toBe('soon');
    expect(worldNodeStatus(state, WORLD_BY_ID.lagoon)).toBe('ready');
    useGameStore.getState().recordWorldResult('lagoon', { score: 10, stars: 1, cleared: true });
    const after = useGameStore.getState() as unknown as GameState;
    expect(worldNodeStatus(after, WORLD_BY_ID.lagoon)).toBe('cleared');
  });
});

describe('save import', () => {
  it('accepts a v1 exported save file and normalizes it to v2', () => {
    // Shape of a pre-arcade export: schemaVersion 1, no difficulty, no worldProgress.
    const v1 = {
      schemaVersion: 1,
      adventureId: 'adv-1',
      teamName: 'Test Crew',
      players: [],
      teamStats: { discovery: 1, kindness: 2, creativity: 3, ingenuity: 4 },
      completedQuestIds: ['ch1'],
      unlockedLocationIds: ['beaconCourtyard'],
      collectedLensIds: ['tideLens'],
      unlockedBadgeIds: [],
      journalEntries: [],
      settings: {
        soundEnabled: true,
        reducedMotion: false,
        dyslexiaFriendlyFont: false,
        challengeMode: false,
        heroSkin: 'bolt',
      },
      updatedAt: '2026-06-24T00:00:00.000Z',
    };
    const parsed = parseSave(v1);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.settings.difficulty).toBe('chill');
    expect(parsed.worldProgress).toEqual({});
    expect(parsed.completedQuestIds).toEqual(['ch1']); // payload survives
  });

  it('keeps v2 fields intact on import', () => {
    const v2 = {
      schemaVersion: 2,
      adventureId: 'adv-2',
      teamName: 'Test Crew',
      players: [],
      teamStats: { discovery: 0, kindness: 0, creativity: 0, ingenuity: 0 },
      completedQuestIds: [],
      unlockedLocationIds: [],
      collectedLensIds: [],
      unlockedBadgeIds: [],
      journalEntries: [],
      settings: {
        soundEnabled: true,
        reducedMotion: false,
        dyslexiaFriendlyFont: false,
        challengeMode: false,
        heroSkin: 'bolt',
        difficulty: 'challenge',
      },
      worldProgress: { lagoon: { stars: 3, bestScore: 500, cleared: true } },
      updatedAt: '2026-07-06T00:00:00.000Z',
    };
    const parsed = parseSave(v2);
    expect(parsed.settings.difficulty).toBe('challenge');
    expect(parsed.worldProgress.lagoon).toEqual({ stars: 3, bestScore: 500, cleared: true });
  });
});
