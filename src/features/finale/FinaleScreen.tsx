import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { LENSES } from '@/data/lenses';
import { QUEST_BY_ID } from '@/data/quests';
import { QUEST_DIALOGUE } from '@/data/dialogue';
import { hasAllLenses, isFinaleComplete } from '@/lib/gameRules';
import type { GameState, LensId } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DialogueBox } from '@/components/ui/DialogueBox';
import { SceneBackdrop } from '@/components/scenes/SceneBackdrop';
import { Beaconkeeper } from '@/components/characters/Beaconkeeper';
import { buildJournalEntry } from '@/lib/utils';

// Each lens carries a festival lesson, learned in lens order (spec §8 finale).
const LESSON_BY_LENS: Record<LensId, string> = {
  tideLens: 'Care',
  routeLens: 'Curiosity',
  echoLens: 'Memory',
  sparkLens: 'Courage',
  flowLens: 'Teamwork',
  lanternLens: 'Listening',
  sunsetLens: 'Creativity',
};

export function FinaleScreen() {
  const [, navigate] = useLocation();
  const state = useGameStore() as unknown as GameState;
  const completeQuest = useGameStore((s) => s.completeQuest);
  const addJournalEntry = useGameStore((s) => s.addJournalEntry);

  const order = useMemo(() => LENSES.map((l) => l.id), []);
  const [placed, setPlaced] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const done = isFinaleComplete(state);
  const lit = placed >= order.length || done;

  // Shuffled chips so the ceremony isn't pre-solved.
  const chips = useMemo(() => {
    const arr = [...order];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [order]);

  useEffect(() => {
    if (lit && !done) {
      completeQuest('finale');
      const finaleQuest = QUEST_BY_ID['finale'];
      if (finaleQuest) addJournalEntry(buildJournalEntry(finaleQuest));
    }
  }, [lit, done, completeQuest, addJournalEntry]);

  if (!hasAllLenses(state) && !done) {
    const have = state.collectedLensIds.length;
    return (
      <div className="p-4 flex flex-col gap-4 min-h-svh">
        <SceneBackdrop locationId="beaconCourtyard" animate={!state.settings.reducedMotion} />
        <div className="flex items-start gap-3">
          <Beaconkeeper size={56} animate={!state.settings.reducedMotion} />
          <div className="flex-1 cartoon-border rounded-2xl bg-[var(--color-cloud)] p-3">
            <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--color-plumeria-violet)' }}>Beaconkeeper</div>
            <p className="text-sm">Welcome to the courtyard! The Wayfinder needs all seven lenses before it can shine. You’ve found {have} so far — keep exploring!</p>
          </div>
        </div>
        <div className="flex justify-center gap-1.5 flex-wrap">
          {LENSES.map((l, i) => (
            <span key={l.id} className="rounded-full" style={{ width: 26, height: 26, border: '2px solid var(--color-ink)', background: i < have ? l.color : 'transparent' }} />
          ))}
        </div>
        <p className="text-center text-sm font-bold" style={{ color: 'var(--color-ocean-deep)' }}>{have} / {LENSES.length} lenses</p>
        <div className="mt-auto">
          <Button fullWidth onClick={() => navigate('/map')}>Back to the village</Button>
        </div>
      </div>
    );
  }

  if (lit) {
    return (
      <div className="p-6 flex flex-col gap-5 min-h-svh items-center justify-center text-center">
        <div
          className="rounded-full cartoon-border"
          style={{
            width: 140, height: 140,
            background: 'conic-gradient(var(--color-tide), var(--color-route), var(--color-echo), var(--color-spark), var(--color-flow), var(--color-lantern), var(--color-sunset), var(--color-tide))',
            boxShadow: '0 0 0 6px var(--color-ink), 0 0 40px var(--color-sun-gold)',
            animation: state.settings.reducedMotion ? undefined : 'pop 0.5s ease',
          }}
          aria-hidden
        />
        <div>
          <p className="text-sm uppercase tracking-wide" style={{ opacity: 0.6 }}>The Wayfinder relights</p>
          <h1 className="text-3xl mt-1" style={{ color: 'var(--color-ocean-deep)' }}>Keepers of the Summer Signals</h1>
        </div>
        <p className="max-w-sm" style={{ opacity: 0.8 }}>
          The beacon glows — not from magic, but from a week of real moments shared together.
          {state.teamName ? ` Well done, ${state.teamName}.` : ''}
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button fullWidth onClick={() => navigate('/journal')}>Open the Memory Book</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/map')}>Back to the village</Button>
        </div>
      </div>
    );
  }

  if (!introDone && !done) {
    return (
      <div className="p-4 flex flex-col gap-4 min-h-svh justify-center">
        <DialogueBox
          script={QUEST_DIALOGUE.finale}
          teamName={state.teamName}
          reducedMotion={state.settings.reducedMotion}
          onDone={() => setIntroDone(true)}
          doneLabel="Relight the beacon"
        />
      </div>
    );
  }

  const nextLens = order[placed];
  return (
    <div className="p-4 flex flex-col gap-4 min-h-svh">
      <SceneBackdrop locationId="beaconCourtyard" animate={!state.settings.reducedMotion} />
      <div className="text-center mt-2">
        <h1 className="text-2xl" style={{ color: 'var(--color-ocean-deep)' }}>Relight the Wayfinder</h1>
        <p className="text-sm mt-1" style={{ opacity: 0.75 }}>
          Place each lens in the order you learned its lesson.
        </p>
      </div>

      {/* Beacon progress */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {order.map((id, i) => (
          <span
            key={id}
            className="rounded-full"
            style={{
              width: 26, height: 26, border: '2px solid var(--color-ink)',
              background: i < placed ? LENSES.find((l) => l.id === id)!.color : 'transparent',
            }}
          />
        ))}
      </div>

      <Card>
        <p className="text-sm text-center">
          Next lesson to place: <strong>{LESSON_BY_LENS[nextLens]}</strong>
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {chips.map((id) => {
          const alreadyPlaced = order.indexOf(id) < placed;
          const isNext = id === nextLens;
          return (
            <button
              key={id}
              disabled={alreadyPlaced}
              onClick={() => { if (isNext) setPlaced((p) => p + 1); }}
              className="tap-target cartoon-border rounded-xl py-3 font-bold disabled:opacity-40"
              style={{
                background: LENSES.find((l) => l.id === id)!.color,
                boxShadow: isNext ? '0 0 0 3px var(--color-ink)' : '2px 2px 0 var(--color-ink)',
              }}
            >
              {LESSON_BY_LENS[id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
