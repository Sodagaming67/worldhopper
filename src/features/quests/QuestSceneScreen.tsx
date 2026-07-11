import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { QUEST_BY_ID } from '@/data/quests';
import { CHAPTER_BY_ID } from '@/data/chapters';
import { QUEST_DIALOGUE } from '@/data/dialogue';
import { ROLE_BODY_VAR } from '@/components/characters/PlayerAvatar';
import { SKINS } from '@/game/kit/skins';
import type { GameState } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Card, ScreenHeader } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { SceneBackdrop } from '@/components/scenes/SceneBackdrop';
import { MiniGame } from './minigames/MiniGame';

export function QuestSceneScreen() {
  const params = useParams();
  const [, navigate] = useLocation();
  const questId = params.questId ?? '';
  const quest = QUEST_BY_ID[questId];
  const state = useGameStore() as unknown as GameState;
  const completeQuest = useGameStore((s) => s.completeQuest);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const reducedMotion = state.settings.reducedMotion;

  const [phase, setPhase] = useState<'launch' | 'puzzle'>('launch');
  const [showStory, setShowStory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!quest) {
    return (
      <div className="p-8 text-center flex flex-col gap-4">
        <h1 className="text-2xl">Quest not found</h1>
        <Button onClick={() => navigate('/map')}>Back to map</Button>
      </div>
    );
  }

  const chapter = CHAPTER_BY_ID[quest.chapterId];
  const alreadyDone = state.completedQuestIds.includes(quest.id);
  const heroColor = state.players[0] ? ROLE_BODY_VAR[state.players[0].role] : undefined;
  // One-screen background story: the per-quest scene lines, joined into a short
  // paragraph (falls back to the quest intro when no scripted dialogue exists).
  const storyText = (QUEST_DIALOGUE[quest.id]?.map((l) => l.text).join(' ')) ?? quest.intro;

  function finish() {
    completeQuest(quest!.id);
    navigate(`/reward/${quest!.id}`);
  }

  // Full-screen, immersive play mode.
  if (phase === 'puzzle' && quest.miniGameType) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-sand)]">
        <header className="flex items-center gap-2 px-3 py-2 shrink-0">
          <button
            onClick={() => setPhase('launch')}
            aria-label="Back"
            className="tap-target cartoon-border cartoon-shadow-hover rounded-xl bg-[var(--color-cloud)]"
          >
            <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>‹</span>
          </button>
          <h1 className="text-lg flex-1 truncate" style={{ color: 'var(--color-ocean-deep)' }}>{quest.title}</h1>
        </header>
        <div className={
          (['braveSteps', 'tidePools', 'sunlineRush', 'apocalypse'] as const).includes(quest.miniGameType as never)
            ? 'flex-1 relative w-full overflow-hidden'
            : 'flex-1 overflow-y-auto px-3 pb-4 flex flex-col justify-center w-full max-w-xl mx-auto'
        }>
          <MiniGame
            type={quest.miniGameType}
            reducedMotion={reducedMotion}
            skin={state.settings.heroSkin}
            variant={quest.locationId}
            heroColor={heroColor}
            levelIndex={quest.levelIndex}
            onComplete={() => finish()}
          />
        </div>
      </div>
    );
  }

  // ── Single launch screen: open chapter → (optionally pick a hero) → ▶ Play ──
  return (
    <div className="flex flex-col gap-4 pb-8">
      <ScreenHeader title={`Chapter ${chapter.number}`} onBack={() => navigate('/map')} />

      <div className="px-4 flex flex-col gap-4">
        <SceneBackdrop locationId={quest.locationId} animate={!reducedMotion} />
        <h2 className="text-2xl" style={{ color: 'var(--color-ocean-deep)' }}>{quest.title}</h2>

        {alreadyDone ? (
          <Button onClick={() => navigate('/map')}>Already complete — back to map</Button>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Compact hero strip — optional; the chosen hero is remembered. */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ opacity: 0.6 }}>Your hero</p>
              <div className="flex flex-wrap gap-2">
                {SKINS.map((s) => {
                  const active = state.settings.heroSkin === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => updateSettings({ heroSkin: s.id })}
                      aria-pressed={active}
                      aria-label={`Hero: ${s.label} — ${s.power}`}
                      className="cartoon-border rounded-2xl px-3 py-1.5 text-xl flex items-center gap-1.5"
                      style={{ background: active ? 'var(--color-sun-gold)' : 'var(--color-cloud)' }}
                    >
                      <span aria-hidden>{s.emoji}</span>
                      <span className="text-xs font-bold">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* The one click to start playing. */}
            <Button onClick={() => setPhase('puzzle')} fullWidth>
              <span className="inline-flex items-center gap-2 text-xl">▶ Play</span>
            </Button>

            {quest.safetyNote && (
              <Card accent="var(--color-coral)">
                <div className="flex items-center gap-2 text-sm font-bold mb-1">
                  <Icon name="shell" size={18} /> Explorer Rule
                </div>
                <p className="text-sm">{quest.safetyNote}</p>
              </Card>
            )}

            {/* Optional one-screen background story (collapsed by default). */}
            <button
              onClick={() => setShowStory((v) => !v)}
              className="tap-target text-sm font-semibold self-start inline-flex items-center gap-1"
              style={{ color: 'var(--color-ocean-deep)' }}
            >
              <Icon name="book-open" size={16} /> {showStory ? 'Hide story' : 'Story'}
            </button>
            {showStory && (
              <Card accent="var(--color-lagoon)">
                <p className="text-sm leading-relaxed">{storyText}</p>
              </Card>
            )}

            {/* Optional "how to play & real-world version" cards. */}
            <button
              onClick={() => setShowHelp((v) => !v)}
              className="tap-target text-sm font-semibold self-start inline-flex items-center gap-1"
              style={{ color: 'var(--color-ocean-deep)' }}
            >
              <Icon name="eye" size={16} /> {showHelp ? 'Hide' : 'How to play & real-world version'}
            </button>
            {showHelp && (
              <div className="flex flex-col gap-2">
                <Card accent="var(--color-sun-gold)">
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ opacity: 0.6 }}>In the game</div>
                  <p className="text-sm">{quest.alternateObjective}</p>
                </Card>
                <Card accent="var(--color-lagoon)">
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ opacity: 0.6 }}>On your trip</div>
                  <p className="text-sm">{quest.onSiteObjective}</p>
                </Card>
              </div>
            )}

            <button onClick={finish} className="tap-target text-xs underline self-center mt-1" style={{ opacity: 0.6 }}>
              Mark complete without playing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
