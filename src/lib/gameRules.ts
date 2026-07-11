import type { GameState, LocationId, QuestStatus, StoryObjective, TeamStats } from '@/types/game';
import { EARLY_CHAPTER_IDS } from '@/data/chapters';
import { QUEST_BY_ID, QUEST_BY_LOCATION, QUESTS } from '@/data/quests';
import { LOCATION_BY_ID } from '@/data/locations';
import { TOTAL_LENSES } from '@/data/lenses';
import { FIRST_CLUE } from '@/data/characters';
import type { IslandWorld } from '@/game/data/worlds';

// Location unlock rules as data (spec §6 progress gates, reconciled with §7).
type UnlockRule =
  | { kind: 'always' }
  | { kind: 'immediate' }
  | { kind: 'completedFromEarly'; min: number }
  | { kind: 'lenses'; min: number }
  | { kind: 'afterFinale' };

export const UNLOCK_RULES: Record<LocationId, UnlockRule> = {
  beaconCourtyard: { kind: 'always' }, // hub — always tappable
  turtleglassLagoon: { kind: 'immediate' },
  sunlineTram: { kind: 'immediate' },
  hallOfEchoes: { kind: 'immediate' },
  splashbridgeBasin: { kind: 'completedFromEarly', min: 1 },
  fourfoldSprings: { kind: 'completedFromEarly', min: 2 },
  palmwindPaths: { kind: 'completedFromEarly', min: 2 },
  lanternEvening: { kind: 'lenses', min: 5 },
  outerIslandExpeditions: { kind: 'afterFinale' },
};

export function countCompletedEarlyChapters(state: GameState): number {
  return EARLY_CHAPTER_IDS.filter((id) => state.completedQuestIds.includes(id)).length;
}

export function hasAllLenses(state: GameState): boolean {
  return state.collectedLensIds.length >= TOTAL_LENSES;
}

export function isFinaleComplete(state: GameState): boolean {
  return state.completedQuestIds.includes('finale');
}

export function isLocationUnlocked(state: GameState, locationId: LocationId): boolean {
  const rule = UNLOCK_RULES[locationId];
  switch (rule.kind) {
    case 'always':
    case 'immediate':
      return true;
    case 'completedFromEarly':
      return countCompletedEarlyChapters(state) >= rule.min;
    case 'lenses':
      return state.collectedLensIds.length >= rule.min;
    case 'afterFinale':
      return isFinaleComplete(state);
  }
}

export function getAvailableLocationIds(state: GameState): LocationId[] {
  return (Object.keys(UNLOCK_RULES) as LocationId[]).filter((id) =>
    isLocationUnlocked(state, id),
  );
}

// Visual state of a map region (spec §7).
export function getLocationStatus(state: GameState, locationId: LocationId): QuestStatus | 'bonus' {
  if (locationId === 'outerIslandExpeditions') {
    return isLocationUnlocked(state, locationId) ? 'bonus' : 'locked';
  }
  if (!isLocationUnlocked(state, locationId)) return 'locked';

  const quest = QUEST_BY_LOCATION[locationId];
  // Beacon Courtyard hub: completed only once the finale is done.
  if (locationId === 'beaconCourtyard') {
    if (isFinaleComplete(state)) return 'completed';
    return hasAllLenses(state) ? 'available' : 'in_progress';
  }
  if (!quest) return 'available';
  return state.completedQuestIds.includes(quest.id) ? 'completed' : 'available';
}

export function canStartQuest(state: GameState, questId: string): boolean {
  const quest = QUEST_BY_ID[questId];
  if (!quest) return false;
  if (state.completedQuestIds.includes(questId)) return false;
  if (!isLocationUnlocked(state, quest.locationId)) return false;
  if (questId === 'finale') return hasAllLenses(state);
  return true;
}

export function getQuestForLocation(locationId: LocationId) {
  return QUEST_BY_LOCATION[locationId];
}

// Next thing the team should do, shown at the top of the Map (spec §11).
export function getNextStoryObjective(state: GameState): StoryObjective {
  if (state.adventureId === '') {
    return { text: 'Start a new adventure to recover the Seven Signals.' };
  }
  if (isFinaleComplete(state)) {
    return { text: 'Keepers of the Summer Signals — your adventure is complete! Explore bonus journeys or revisit your Memory Book.' };
  }
  if (hasAllLenses(state)) {
    return { text: 'All seven lenses recovered! Return to the Beacon Courtyard to relight the Wayfinder.', locationId: 'beaconCourtyard' };
  }
  if (state.completedQuestIds.length === 0) {
    return { text: FIRST_CLUE, locationId: 'turtleglassLagoon' };
  }

  // Point at the first available, not-yet-completed story quest.
  const next = QUESTS.find(
    (q) => q.id !== 'finale' && canStartQuest(state, q.id),
  );
  if (next) {
    return { text: `Next: ${next.title} at ${LOCATION_BY_ID[next.locationId].name}.`, locationId: next.locationId };
  }
  return { text: `${state.collectedLensIds.length} of ${TOTAL_LENSES} lenses recovered. Keep exploring!` };
}

// Pure stat addition used by the store and tested directly.
export function addStats(base: TeamStats, delta: Partial<TeamStats>): TeamStats {
  return {
    discovery: base.discovery + (delta.discovery ?? 0),
    kindness: base.kindness + (delta.kindness ?? 0),
    creativity: base.creativity + (delta.creativity ?? 0),
    ingenuity: base.ingenuity + (delta.ingenuity ?? 0),
  };
}

export const TEAM_STAT_KEYS: (keyof TeamStats)[] = ['discovery', 'kindness', 'creativity', 'ingenuity'];

// ── Challenge Mode arcade rules (pure, UI/engine-agnostic) ──────────────────

/** Apply one life loss. Lives never go below 0; gameOver once they hit 0. */
export function loseLife(lives: number): { lives: number; gameOver: boolean } {
  const next = Math.max(0, lives - 1);
  return { lives: next, gameOver: next <= 0 };
}

/**
 * Move to the next level index. Returns finished=true (and keeps the current
 * index) when there is no next level.
 */
export function advanceLevel(current: number, total: number): { level: number; finished: boolean } {
  const next = current + 1;
  if (next >= total) return { level: current, finished: true };
  return { level: next, finished: false };
}

// ── Big Island Arcade difficulty + world progress (spec §7) ────────────────

export type Difficulty = 'chill' | 'challenge';

/** Per-run tuning multipliers (spec §7). Chill: kinder HP/lava/lives. */
export function difficultyMods(d: Difficulty): { hpMul: number; lavaMul: number; extraLives: number } {
  return d === 'chill'
    ? { hpMul: 1.25, lavaMul: 0.7, extraLives: 1 }
    : { hpMul: 1, lavaMul: 1, extraLives: 0 };
}

/**
 * On death, ease rising lava back so the checkpoint respawn is survivable.
 * lavaY is the lava's top edge (smaller = higher); startY is its lowest point.
 * Returns the lava pushed down to `grace` px below the respawn, never past
 * startY, and never raised if it hadn't caught up yet.
 */
export function lavaRespawnReset(lavaY: number, respawnY: number, startY: number, grace = 120): number {
  return Math.min(startY, Math.max(lavaY, respawnY + grace));
}

/** Map-node display status for a world. */
export function worldNodeStatus(state: GameState, world: IslandWorld): 'ready' | 'cleared' | 'soon' {
  if (world.status === 'soon') return 'soon';
  return state.worldProgress?.[world.id]?.cleared ? 'cleared' : 'ready';
}
