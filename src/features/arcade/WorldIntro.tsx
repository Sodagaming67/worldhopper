import { useEffect } from 'react';
import type { IslandWorld } from '@/game/data/worlds';

/** One narrator line, always skippable, auto-dismisses in 4s (spec §8). */
export function WorldIntro({ world, onDone }: { world: IslandWorld; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-8 text-center"
      style={{ background: 'var(--color-ocean-deep)', color: 'var(--color-cloud)' }}>
      <p className="text-xs font-bold uppercase tracking-wide" style={{ opacity: 0.7 }}>
        World {world.number} — {world.place}
      </p>
      <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{world.name}</h1>
      <p className="text-lg max-w-md leading-relaxed">{world.introLine}</p>
      <button onClick={onDone} aria-label="Begin world"
        className="tap-target cartoon-border cartoon-shadow rounded-2xl px-6 py-3 text-lg font-bold bg-[var(--color-sun-gold)] text-[var(--color-ocean-deep)]">
        Begin ▸
      </button>
    </div>
  );
}
