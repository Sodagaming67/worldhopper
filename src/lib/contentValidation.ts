import { z } from 'zod';
import { QUESTS } from '@/data/quests';
import { LOCATIONS } from '@/data/locations';
import { LENSES } from '@/data/lenses';
import { BADGES } from '@/data/badges';
import { CHAPTERS } from '@/data/chapters';

// Build-time/runtime guards that game content is well-formed (spec §21).
// Run by the unit test suite; keeps broken IDs and missing rewards from shipping.

const lensIds = new Set(LENSES.map((l) => l.id));
const badgeIds = new Set(BADGES.map((b) => b.id));
const locationIds = new Set(LOCATIONS.map((l) => l.id));
const chapterIds = new Set(CHAPTERS.map((c) => c.id));

const statRewardSchema = z
  .object({
    discovery: z.number().int().optional(),
    kindness: z.number().int().optional(),
    creativity: z.number().int().optional(),
    ingenuity: z.number().int().optional(),
  })
  .strict();

const choiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  resultText: z.string().min(1),
  isCorrect: z.boolean().optional(),
  statRewards: statRewardSchema.optional(),
  unlocksBadgeId: z.string().refine((id) => badgeIds.has(id as never), 'unknown badge id').optional(),
});

const questSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().refine((id) => chapterIds.has(id), 'unknown chapter id'),
  locationId: z.string().refine((id) => locationIds.has(id as never), 'unknown location id'),
  title: z.string().min(1),
  intro: z.string().min(1),
  onSiteObjective: z.string().min(1),
  alternateObjective: z.string().min(10), // every quest must have a real digital path
  completionMode: z.enum(['manual', 'choice', 'miniGame']),
  miniGameType: z.enum(['braveSteps', 'tidePools', 'sunlineRush', 'apocalypse']).optional(),
  levelIndex: z.number().int().nonnegative().optional(),
  choices: z.array(choiceSchema).optional(),
  safetyNote: z.string().optional(),
  reward: z.object({
    lensId: z.string().refine((id) => lensIds.has(id as never), 'unknown lens id').optional(),
    badgeId: z.string().refine((id) => badgeIds.has(id as never), 'unknown badge id').optional(),
    stats: statRewardSchema,
    unlockLocationIds: z.array(z.string()).optional(),
  }),
  journalPrompt: z.string().min(1),
});

export function validateContent(): { ok: true } {
  for (const quest of QUESTS) {
    questSchema.parse(quest);
    // Choice quests must offer at least one correct choice.
    if (quest.completionMode === 'choice') {
      if (!quest.choices || quest.choices.length === 0) {
        throw new Error(`Quest ${quest.id}: choice mode requires choices`);
      }
      if (!quest.choices.some((c) => c.isCorrect)) {
        throw new Error(`Quest ${quest.id}: choice mode requires at least one correct choice`);
      }
    }
    // Mini-game quests must declare a type.
    if (quest.completionMode === 'miniGame' && !quest.miniGameType) {
      throw new Error(`Quest ${quest.id}: miniGame mode requires miniGameType`);
    }
  }
  return { ok: true };
}

export { questSchema };
