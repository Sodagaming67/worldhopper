import type { JournalEntry, Quest } from '@/types/game';

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

// Build one journal entry per completed quest (spec §10 Memory Book format).
export function buildJournalEntry(quest: Quest, reflection?: string): JournalEntry {
  return {
    id: newId(),
    chapterId: quest.chapterId,
    createdAt: nowIso(),
    title: quest.title,
    reflection: reflection?.trim() || undefined,
  };
}
