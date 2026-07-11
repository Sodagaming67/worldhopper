import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { QUEST_BY_ID } from '@/data/quests';
import { LENS_BY_ID } from '@/data/lenses';
import { BADGE_BY_ID } from '@/data/badges';
import { TEAM_STAT_KEYS } from '@/lib/gameRules';
import type { GameState, TeamStats } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { buildJournalEntry } from '@/lib/utils';
import { REWARD_LINE } from '@/data/dialogue';
import { CharacterPortrait, speakerName } from '@/components/characters/CharacterPortrait';

const STAT_LABEL: Record<keyof TeamStats, string> = {
  discovery: 'Discovery',
  kindness: 'Kindness',
  creativity: 'Creativity',
  ingenuity: 'Ingenuity',
};

export function RewardScreen() {
  const params = useParams();
  const [, navigate] = useLocation();
  const quest = QUEST_BY_ID[params.questId ?? ''];
  const state = useGameStore() as unknown as GameState;
  const addJournalEntry = useGameStore((s) => s.addJournalEntry);
  const reducedMotion = state.settings.reducedMotion;

  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  if (!quest) {
    return (
      <div className="p-8 text-center flex flex-col gap-4">
        <h1 className="text-2xl">Reward not found</h1>
        <Button onClick={() => navigate('/map')}>Back to map</Button>
      </div>
    );
  }

  const lens = quest.reward.lensId ? LENS_BY_ID[quest.reward.lensId] : undefined;
  const badge = quest.reward.badgeId ? BADGE_BY_ID[quest.reward.badgeId] : undefined;
  const statEntries = TEAM_STAT_KEYS.filter((k) => (quest.reward.stats[k] ?? 0) > 0);
  const rewardLine = REWARD_LINE[quest.id];

  function continueOn() {
    if (!saved) {
      addJournalEntry(buildJournalEntry(quest!, reflection));
      setSaved(true);
    }
    navigate('/map');
  }

  return (
    <div className="flex flex-col gap-4 p-4 min-h-svh">
      <div className="text-center mt-4">
        <p className="text-sm uppercase tracking-wide" style={{ opacity: 0.6 }}>Signal recovered</p>
        <h1 className="text-3xl mt-1" style={{ color: 'var(--color-ocean-deep)' }}>{quest.title}</h1>
      </div>

      {rewardLine && (
        <div className="flex items-start gap-3">
          <CharacterPortrait id={rewardLine.speaker} size={56} animate={!reducedMotion} />
          <div className="flex-1 cartoon-border rounded-2xl bg-[var(--color-cloud)] p-3">
            <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--color-plumeria-violet)' }}>
              {speakerName(rewardLine.speaker)}
            </div>
            <p className="text-sm">{rewardLine.text}</p>
          </div>
        </div>
      )}

      {lens && (
        <div className="flex flex-col items-center gap-2">
          <div
            className="rounded-full cartoon-border"
            style={{
              width: 96, height: 96, background: lens.color,
              boxShadow: '4px 4px 0 var(--color-ink)',
              animation: reducedMotion ? undefined : 'pop 0.4s ease',
            }}
            aria-hidden
          />
          <p className="text-xl font-bold">{lens.name}</p>
          <p className="text-sm" style={{ opacity: 0.7 }}>{lens.theme}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {badge && (
          <span className="inline-flex items-center gap-2 cartoon-border rounded-full px-3 py-1 bg-[var(--color-sun-gold)] text-sm font-bold">
            <Icon name={badge.icon} size={18} /> {badge.name}
          </span>
        )}
        {statEntries.map((k) => (
          <span key={k} className="inline-flex items-center gap-1 cartoon-border rounded-full px-3 py-1 bg-[var(--color-cloud)] text-sm font-bold">
            {STAT_LABEL[k]} +{quest.reward.stats[k]}
          </span>
        ))}
      </div>

      <Card accent="var(--color-plumeria-violet)">
        <label className="block text-sm font-bold mb-1" htmlFor="reflection">
          Journal prompt
        </label>
        <p className="text-sm mb-2" style={{ opacity: 0.8 }}>{quest.journalPrompt}</p>
        <textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Write or dictate a sentence… (optional)"
          rows={3}
          className="w-full cartoon-border rounded-lg px-3 py-2 bg-[var(--color-sand)]"
          maxLength={280}
        />
      </Card>

      <div className="mt-auto">
        <Button fullWidth onClick={continueOn}>Add to Memory Book & continue</Button>
      </div>
    </div>
  );
}
