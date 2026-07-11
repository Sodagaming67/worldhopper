import { useCallback, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { WORLD_BY_ID, type IslandWorldId } from '@/game/data/worlds';
import type { PlatformerWorldId } from '@/game/data/levels/island';
import { Button } from '@/components/ui/Button';
import { WorldIntro } from './WorldIntro';
import { IslandPlatformerGame } from './IslandPlatformerGame';
import { SlideGame } from './SlideGame';
import { TramDashGame } from './TramDashGame';
import { SwimGame } from './SwimGame';

export function WorldScreen() {
  const params = useParams();
  const [, navigate] = useLocation();
  const world = WORLD_BY_ID[params.worldId as IslandWorldId];
  const skin = useGameStore((s) => s.settings.heroSkin);
  const difficulty = useGameStore((s) => s.settings.difficulty);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const recordWorldResult = useGameStore((s) => s.recordWorldResult);
  const [phase, setPhase] = useState<'intro' | 'play'>('intro');

  const onResult = useCallback((r: { score: number; stars: number; cleared: boolean }) => {
    recordWorldResult(world.id, r);
    navigate('/map');
  }, [recordWorldResult, world, navigate]);

  if (!world) {
    return (
      <div className="p-8 text-center flex flex-col gap-4">
        <h1 className="text-2xl">World not found</h1>
        <Button onClick={() => navigate('/map')}>Back to map</Button>
      </div>
    );
  }

  if (world.status === 'soon') {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{world.name}</h1>
        <p className="text-sm" style={{ opacity: 0.7 }}>{world.place}</p>
        <p className="text-lg">🚧 This world is still forming — new land takes time on the Big Island!</p>
        <Button onClick={() => navigate('/map')}>Back to map</Button>
      </div>
    );
  }

  if (phase === 'intro') return <WorldIntro world={world} onDone={() => setPhase('play')} />;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-ocean-deep)]">
      <header className="flex items-center gap-2 px-3 py-2 shrink-0">
        <button onClick={() => navigate('/map')} aria-label="Back"
          className="tap-target cartoon-border cartoon-shadow-hover rounded-xl bg-[var(--color-cloud)]">
          <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>‹</span>
        </button>
        <h1 className="text-lg flex-1 truncate" style={{ color: 'var(--color-cloud)' }}>
          {world.number}. {world.name}
        </h1>
        <button
          onClick={() => updateSettings({ difficulty: difficulty === 'chill' ? 'challenge' : 'chill' })}
          aria-label={`Difficulty: ${difficulty}`}
          className="tap-target cartoon-border rounded-xl px-3 py-1 text-xs font-bold bg-[var(--color-cloud)]">
          {difficulty === 'chill' ? '🌺 Chill' : '🌋 Challenge'}
        </button>
      </header>
      <div className="flex-1 relative w-full overflow-hidden">
        {world.genre === 'slide' ? (
          <SlideGame skin={skin} onResult={onResult} />
        ) : world.genre === 'runner' ? (
          <TramDashGame skin={skin} onResult={onResult} />
        ) : world.genre === 'swim' ? (
          <SwimGame skin={skin} onResult={onResult} />
        ) : (
          <IslandPlatformerGame worldId={world.id as PlatformerWorldId} skin={skin} onResult={onResult} />
        )}
      </div>
    </div>
  );
}
