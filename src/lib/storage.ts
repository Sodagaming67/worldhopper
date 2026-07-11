import { z } from 'zod';
import type { GameState } from '@/types/game';

// Save schema for export/import validation (spec §15 backup UX).
const journalEntrySchema = z.object({
  id: z.string(),
  chapterId: z.string(),
  createdAt: z.string(),
  title: z.string(),
  reflection: z.string().optional(),
  mediaRef: z.string().optional(),
});

const playerSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  role: z.enum(['inventor', 'pathfinder', 'oceanGuardian', 'trailRanger']),
  avatarId: z.string(),
});

const worldProgressSchema = z.object({
  stars: z.number(),
  bestScore: z.number(),
  cleared: z.boolean(),
});

export const GameStateSchema = z.object({
  // Accept v1 exports too; parseSave normalizes them to v2.
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
  adventureId: z.string(),
  teamName: z.string(),
  players: z.array(playerSchema),
  teamStats: z.object({
    discovery: z.number(),
    kindness: z.number(),
    creativity: z.number(),
    ingenuity: z.number(),
  }),
  completedQuestIds: z.array(z.string()),
  unlockedLocationIds: z.array(z.string()),
  collectedLensIds: z.array(z.string()),
  unlockedBadgeIds: z.array(z.string()),
  journalEntries: z.array(journalEntrySchema),
  settings: z.object({
    soundEnabled: z.boolean(),
    reducedMotion: z.boolean(),
    dyslexiaFriendlyFont: z.boolean(),
    challengeMode: z.boolean().optional().default(false),
    heroSkin: z
      .enum(['bolt', 'titan', 'comet', 'aegis', 'mystic', 'blaze'])
      .optional()
      .default('bolt'),
    difficulty: z.enum(['chill', 'challenge']).optional().default('chill'),
  }),
  worldProgress: z.record(z.string(), worldProgressSchema).optional().default({}),
  updatedAt: z.string(),
});

export function exportSave(state: GameState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'worldhopper-save.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validate a parsed save payload and normalize it to v2. Mirrors the store's
 * persist migrate: worldProgress and settings.difficulty are defaulted by the
 * schema, so only the version stamp needs bumping for v1 exports.
 */
export function parseSave(data: unknown): GameState {
  const parsed = GameStateSchema.parse(data);
  return { ...parsed, schemaVersion: 2 } as GameState;
}

export async function importSaveFromFile(file: File): Promise<GameState> {
  const text = await file.text();
  return parseSave(JSON.parse(text));
}
