import { useState } from 'react';
import { useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import type { GameState, MiniGameType } from '@/types/game';
import { ScreenHeader } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Nori } from '@/components/characters/Nori';
import { ROLE_BODY_VAR } from '@/components/characters/PlayerAvatar';
import { MiniGame } from '@/features/quests/minigames/MiniGame';
import { newId, nowIso } from '@/lib/utils';

type Adventure = {
  id: string;
  title: string;
  blurb: string;
  icon: string;
  game: MiniGameType;
  variant: string;
};

// Optional bonus adventures (spec §7/§23). Replayable; each adds a Memory Book page.
const ADVENTURES: Adventure[] = [
  { id: 'blacksand', title: 'Black-Sand Hop', blurb: 'Bounce along a volcanic beach.', icon: 'footprints', game: 'braveSteps', variant: 'splashbridgeBasin' },
  { id: 'clouds', title: 'Cloud Catcher', blurb: 'Catch the colors of the sky.', icon: 'rainbow', game: 'tidePools', variant: 'turtleglassLagoon' },
  { id: 'trail', title: 'Forest Trail', blurb: 'Find your way through the ferns.', icon: 'compass', game: 'sunlineRush', variant: 'fourfoldSprings' },
  { id: 'fireflies', title: 'Firefly Field', blurb: 'Light up the evening meadow.', icon: 'sparkle', game: 'braveSteps', variant: 'lanternEvening' },
];

export function ExpeditionsScreen() {
  const [, navigate] = useLocation();
  const state = useGameStore() as unknown as GameState;
  const addJournalEntry = useGameStore((s) => s.addJournalEntry);
  const [active, setActive] = useState<Adventure | null>(null);
  const reducedMotion = state.settings.reducedMotion;
  const heroColor = state.players[0] ? ROLE_BODY_VAR[state.players[0].role] : undefined;

  function finishAdventure(adv: Adventure) {
    addJournalEntry({ id: newId(), chapterId: 'expedition', createdAt: nowIso(), title: `Expedition: ${adv.title}` });
    setActive(null);
  }

  // Full-screen play of a chosen adventure.
  if (active) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-sand)]">
        <header className="flex items-center gap-2 px-3 py-2 shrink-0">
          <button onClick={() => setActive(null)} aria-label="Back" className="tap-target cartoon-border cartoon-shadow-hover rounded-xl bg-[var(--color-cloud)]">
            <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>‹</span>
          </button>
          <h1 className="text-lg flex-1 truncate" style={{ color: 'var(--color-ocean-deep)' }}>{active.title}</h1>
        </header>
        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col justify-center w-full max-w-xl mx-auto">
          <MiniGame type={active.game} reducedMotion={reducedMotion} skin={state.settings.heroSkin} variant={active.variant} heroColor={heroColor} onComplete={() => finishAdventure(active)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <ScreenHeader title="Expeditions" onBack={() => navigate('/map')} />
      <div className="px-4 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Nori size={52} animate={!reducedMotion} />
          <div className="flex-1 cartoon-border rounded-2xl bg-[var(--color-cloud)] p-3">
            <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--color-plumeria-violet)' }}>Nori</div>
            <p className="text-sm">Bonus adventures around the island! Play any of these for fun — each one adds a page to your Memory Book.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ADVENTURES.map((adv) => (
            <button key={adv.id} onClick={() => setActive(adv)} className="text-left tap-target cartoon-border cartoon-shadow cartoon-shadow-hover rounded-2xl p-4 bg-[var(--color-cloud)]">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full cartoon-border flex items-center justify-center" style={{ width: 38, height: 38, background: 'var(--color-plumeria-violet)' }}>
                  <Icon name={adv.icon} size={20} className="text-[var(--color-cloud)]" />
                </span>
                <h2 className="text-lg flex-1">{adv.title}</h2>
              </div>
              <p className="text-sm" style={{ opacity: 0.7 }}>{adv.blurb}</p>
              <span className="inline-block mt-2 text-xs font-bold">▶ Play</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
