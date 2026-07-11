import { describe, it, expect } from 'vitest';
import type { GameState } from '@/types/game';
import {
  isLocationUnlocked,
  getLocationStatus,
  canStartQuest,
  hasAllLenses,
  countCompletedEarlyChapters,
  addStats,
  getNextStoryObjective,
  loseLife,
  advanceLevel,
  lavaRespawnReset,
} from '@/lib/gameRules';

function makeState(partial: Partial<GameState> = {}): GameState {
  return {
    schemaVersion: 2,
    adventureId: 'adv-1',
    teamName: 'Test Crew',
    players: [],
    teamStats: { discovery: 0, kindness: 0, creativity: 0, ingenuity: 0 },
    completedQuestIds: [],
    unlockedLocationIds: [],
    collectedLensIds: [],
    unlockedBadgeIds: [],
    journalEntries: [],
    settings: { soundEnabled: true, reducedMotion: false, dyslexiaFriendlyFont: false, challengeMode: false, heroSkin: 'bolt', difficulty: 'chill' },
    worldProgress: {},
    updatedAt: '2026-06-24T00:00:00.000Z',
    ...partial,
  };
}

describe('location unlock rules', () => {
  it('unlocks the three early chapters and the hub immediately', () => {
    const s = makeState();
    expect(isLocationUnlocked(s, 'beaconCourtyard')).toBe(true);
    expect(isLocationUnlocked(s, 'turtleglassLagoon')).toBe(true);
    expect(isLocationUnlocked(s, 'sunlineTram')).toBe(true);
    expect(isLocationUnlocked(s, 'hallOfEchoes')).toBe(true);
  });

  it('locks mid-game locations until enough early chapters are done', () => {
    const s = makeState();
    expect(isLocationUnlocked(s, 'splashbridgeBasin')).toBe(false);
    expect(isLocationUnlocked(s, 'fourfoldSprings')).toBe(false);
  });

  it('unlocks Splashbridge after one early chapter', () => {
    const s = makeState({ completedQuestIds: ['ch1'] });
    expect(countCompletedEarlyChapters(s)).toBe(1);
    expect(isLocationUnlocked(s, 'splashbridgeBasin')).toBe(true);
    expect(isLocationUnlocked(s, 'fourfoldSprings')).toBe(false);
  });

  it('unlocks Fourfold Springs and Palmwind Paths after two early chapters', () => {
    const s = makeState({ completedQuestIds: ['ch1', 'ch2'] });
    expect(isLocationUnlocked(s, 'fourfoldSprings')).toBe(true);
    expect(isLocationUnlocked(s, 'palmwindPaths')).toBe(true);
  });

  it('unlocks Lantern Evening only after five lenses', () => {
    const four = makeState({ collectedLensIds: ['tideLens', 'routeLens', 'echoLens', 'sparkLens'] });
    expect(isLocationUnlocked(four, 'lanternEvening')).toBe(false);
    const five = makeState({ collectedLensIds: ['tideLens', 'routeLens', 'echoLens', 'sparkLens', 'flowLens'] });
    expect(isLocationUnlocked(five, 'lanternEvening')).toBe(true);
  });

  it('keeps Outer-Island Expeditions locked until the finale is complete', () => {
    const pre = makeState({ collectedLensIds: ['tideLens', 'routeLens', 'echoLens', 'sparkLens', 'flowLens', 'lanternLens', 'sunsetLens'] });
    expect(isLocationUnlocked(pre, 'outerIslandExpeditions')).toBe(false);
    const post = makeState({ completedQuestIds: ['finale'] });
    expect(isLocationUnlocked(post, 'outerIslandExpeditions')).toBe(true);
  });
});

describe('hasAllLenses + finale gate', () => {
  const allSeven = ['tideLens', 'routeLens', 'echoLens', 'sparkLens', 'flowLens', 'lanternLens', 'sunsetLens'] as GameState['collectedLensIds'];

  it('is false with six lenses, true with seven', () => {
    expect(hasAllLenses(makeState({ collectedLensIds: allSeven.slice(0, 6) }))).toBe(false);
    expect(hasAllLenses(makeState({ collectedLensIds: allSeven }))).toBe(true);
  });

  it('only allows the finale once all seven lenses are collected', () => {
    expect(canStartQuest(makeState({ collectedLensIds: allSeven.slice(0, 6) }), 'finale')).toBe(false);
    expect(canStartQuest(makeState({ collectedLensIds: allSeven }), 'finale')).toBe(true);
  });
});

describe('canStartQuest', () => {
  it('returns false for completed quests', () => {
    expect(canStartQuest(makeState({ completedQuestIds: ['ch1'] }), 'ch1')).toBe(false);
  });
  it('returns false for a quest whose location is locked', () => {
    expect(canStartQuest(makeState(), 'ch4')).toBe(false); // basin locked
  });
  it('returns true for an available, incomplete quest', () => {
    expect(canStartQuest(makeState(), 'ch1')).toBe(true);
  });
  it('returns false for an unknown quest id', () => {
    expect(canStartQuest(makeState(), 'nope')).toBe(false);
  });
});

describe('getLocationStatus', () => {
  it('marks locked, available, and completed correctly', () => {
    const s = makeState({ completedQuestIds: ['ch1'] });
    expect(getLocationStatus(s, 'turtleglassLagoon')).toBe('completed');
    expect(getLocationStatus(s, 'sunlineTram')).toBe('available');
    expect(getLocationStatus(s, 'fourfoldSprings')).toBe('locked');
  });
});

describe('addStats', () => {
  it('adds partial deltas onto the base', () => {
    const base = { discovery: 1, kindness: 2, creativity: 3, ingenuity: 4 };
    expect(addStats(base, { kindness: 2, ingenuity: 3 })).toEqual({ discovery: 1, kindness: 4, creativity: 3, ingenuity: 7 });
  });
});

describe('getNextStoryObjective', () => {
  it('prompts to start before an adventure exists', () => {
    expect(getNextStoryObjective(makeState({ adventureId: '' })).text).toMatch(/start a new adventure/i);
  });
  it('points to the courtyard when all lenses are collected', () => {
    const allSeven = ['tideLens', 'routeLens', 'echoLens', 'sparkLens', 'flowLens', 'lanternLens', 'sunsetLens'] as GameState['collectedLensIds'];
    expect(getNextStoryObjective(makeState({ collectedLensIds: allSeven })).locationId).toBe('beaconCourtyard');
  });
});

describe('loseLife', () => {
  it('decrements and is not game over while lives remain', () => {
    expect(loseLife(3)).toEqual({ lives: 2, gameOver: false });
    expect(loseLife(2)).toEqual({ lives: 1, gameOver: false });
  });
  it('hits game over at zero and never goes negative', () => {
    expect(loseLife(1)).toEqual({ lives: 0, gameOver: true });
    expect(loseLife(0)).toEqual({ lives: 0, gameOver: true });
  });
});

describe('advanceLevel', () => {
  it('moves to the next level when more remain', () => {
    expect(advanceLevel(0, 3)).toEqual({ level: 1, finished: false });
    expect(advanceLevel(1, 3)).toEqual({ level: 2, finished: false });
  });
  it('finishes on the last level', () => {
    expect(advanceLevel(2, 3)).toEqual({ level: 2, finished: true });
  });
});

describe('lavaRespawnReset', () => {
  // lavaY is the lava's top edge: smaller = higher. startY is its lowest point.
  it('pushes lava back below the respawn point when it has caught up', () => {
    // lava at 430 would instantly kill a respawn at 470; expect 470 + 120 grace
    expect(lavaRespawnReset(430, 470, 620)).toBe(590);
  });

  it('leaves lava untouched while it is still safely below the respawn', () => {
    expect(lavaRespawnReset(615, 470, 620)).toBe(615);
  });

  it('never resets below the level start height', () => {
    expect(lavaRespawnReset(430, 550, 620)).toBe(620);
  });
});
