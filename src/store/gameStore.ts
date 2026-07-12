import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameSettings, GameState, JournalEntry, Player } from '@/types/game';
import { addStats } from '@/lib/gameRules';
import { QUEST_BY_ID } from '@/data/quests';
import { nowIso } from '@/lib/utils';
import type { IslandWorldId } from '@/game/data/worlds';

const INITIAL_STATE: GameState = {
  schemaVersion: 2,
  adventureId: '',
  teamName: '',
  players: [],
  teamStats: { discovery: 0, kindness: 0, creativity: 0, ingenuity: 0 },
  completedQuestIds: [],
  unlockedLocationIds: ['beaconCourtyard', 'turtleglassLagoon', 'sunlineTram', 'hallOfEchoes'],
  collectedLensIds: [],
  unlockedBadgeIds: [],
  journalEntries: [],
  settings: {
    soundEnabled: true,
    reducedMotion: false,
    dyslexiaFriendlyFont: false,
    challengeMode: false,
    heroSkin: 'bolt',
    heroCharacter: 'boy',
    difficulty: 'chill',
  },
  worldProgress: {},
  updatedAt: nowIso(),
};

type GameStore = GameState & {
  hasAdventure: () => boolean;
  startAdventure: (teamName: string, players: Player[]) => void;
  /**
   * Complete a quest by id: applies its reward (lens, badge, stats) and marks
   * it done. Idempotent. The journal entry is added separately on the Reward
   * screen so the player can include a reflection. Unlocks are derived by
   * gameRules, not stored here.
   */
  completeQuest: (questId: string) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  /** Merge one world run's result into progress: max stars, max score, sticky cleared. */
  recordWorldResult: (worldId: IslandWorldId, r: { score: number; stars: number; cleared: boolean }) => void;
  importState: (state: GameState) => void;
  resetAdventure: () => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      hasAdventure: () => get().adventureId !== '',

      startAdventure: (teamName, players) => {
        set({
          ...INITIAL_STATE,
          adventureId: crypto.randomUUID(),
          teamName,
          players,
          updatedAt: nowIso(),
        });
      },

      completeQuest: (questId) => {
        const quest = QUEST_BY_ID[questId];
        if (!quest) return;

        set((state) => {
          if (state.completedQuestIds.includes(questId)) return state;
          const { reward } = quest;

          const collectedLensIds =
            reward.lensId && !state.collectedLensIds.includes(reward.lensId)
              ? [...state.collectedLensIds, reward.lensId]
              : state.collectedLensIds;

          const unlockedBadgeIds =
            reward.badgeId && !state.unlockedBadgeIds.includes(reward.badgeId)
              ? [...state.unlockedBadgeIds, reward.badgeId]
              : state.unlockedBadgeIds;

          return {
            completedQuestIds: [...state.completedQuestIds, questId],
            collectedLensIds,
            unlockedBadgeIds,
            teamStats: addStats(state.teamStats, reward.stats),
            updatedAt: nowIso(),
          };
        });
      },

      addJournalEntry: (entry) => {
        set((state) => ({
          journalEntries: [...state.journalEntries, entry],
          updatedAt: nowIso(),
        }));
      },

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
          updatedAt: nowIso(),
        }));
      },

      recordWorldResult: (worldId, r) => {
        set((state) => {
          const prev = state.worldProgress[worldId] ?? { stars: 0, bestScore: 0, cleared: false };
          return {
            worldProgress: {
              ...state.worldProgress,
              [worldId]: {
                stars: Math.max(prev.stars, r.stars),
                bestScore: Math.max(prev.bestScore, r.score),
                cleared: prev.cleared || r.cleared,
              },
            },
            updatedAt: nowIso(),
          };
        });
      },

      importState: (incoming) => {
        set({ ...incoming, updatedAt: nowIso() });
      },

      resetAdventure: () => {
        set({ ...INITIAL_STATE, updatedAt: nowIso() });
      },
    }),
    {
      name: 'isq-game-state-v1',
      version: 2,
      migrate: (persisted) => {
        // v1 saves predate `worldProgress`, `settings.difficulty`, and
        // `settings.heroCharacter`; backfill all three.
        const s = persisted as Omit<GameState, 'settings'> & {
          settings: Omit<GameSettings, 'difficulty' | 'heroCharacter'> &
            Partial<Pick<GameSettings, 'difficulty' | 'heroCharacter'>>;
        };
        return {
          ...s,
          schemaVersion: 2,
          worldProgress: s.worldProgress ?? {},
          settings: { difficulty: 'chill', heroCharacter: 'boy', ...s.settings },
        };
      },
    },
  ),
);
