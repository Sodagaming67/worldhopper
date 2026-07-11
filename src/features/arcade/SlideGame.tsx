import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EventBus } from '@/game/EventBus';
import { PhaserGame } from '@/game/PhaserGame';
import { SlideScene } from '@/game/scenes/SlideScene';
import type { SkinId } from '@/game/kit/skins';

type Props = { skin: SkinId; onResult: (r: { score: number; stars: number; cleared: boolean }) => void };
type Hud = { lives: number; score: number; stars: number; coins: number; gauge: number; gaugeLabel: string };
const INITIAL_HUD: Hud = { lives: 3, score: 0, stars: 0, coins: 0, gauge: 0, gaugeLabel: 'SPEED' };

export function SlideGame({ skin, onResult }: Props) {
  const scenes = useRef([SlideScene]).current;
  const registry = useRef<{ skin: SkinId }>({ skin }).current;
  const hudRef = useRef<Hud>(INITIAL_HUD);
  const wonRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hud, setHud] = useState<Hud>(INITIAL_HUD);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onDone = (p: { success: boolean; score: number }) => {
      if (wonRef.current) return;
      wonRef.current = true;
      setWon(true);
      t = setTimeout(() => onResultRef.current({ score: p.score, stars: hudRef.current.stars, cleared: true }), 1200);
    };
    const onHud = (h: Hud) => { hudRef.current = h; setHud(h); };
    const onOver = () => setGameOver(true);
    EventBus.on('arcade:done', onDone);
    EventBus.on('blitz:hud', onHud);
    EventBus.on('arcade:gameover', onOver);
    return () => { EventBus.off('arcade:done', onDone); EventBus.off('blitz:hud', onHud); EventBus.off('arcade:gameover', onOver); if (t) clearTimeout(t); };
  }, []);

  useEffect(() => {
    const emit = (jump: boolean) => EventBus.emit('arcade:input', { left: false, right: false, jump });
    const down = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { emit(true); e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') emit(false);
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const holdJump = {
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); EventBus.emit('arcade:input', { left: false, right: false, jump: true }); },
    onPointerUp: () => EventBus.emit('arcade:input', { left: false, right: false, jump: false }),
    onPointerLeave: () => EventBus.emit('arcade:input', { left: false, right: false, jump: false }),
    onPointerCancel: () => EventBus.emit('arcade:input', { left: false, right: false, jump: false }),
  };

  return (
    <div className="relative w-full h-full select-none touch-none">
      <PhaserGame scenes={scenes} registry={registry} />

      <div data-testid="blitz-hud"
        className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 text-sm font-bold cartoon-border rounded-2xl px-4 py-1.5 pointer-events-none"
        style={{ background: 'rgba(8,24,32,0.82)', color: '#e8f8ff' }}>
        <span aria-label={`${hud.lives} lives`}>{'♥'.repeat(hud.lives) || '—'}</span>
        <span>⭐ {hud.score}</span>
        <span aria-label={`${hud.stars} stars`}>✦ {hud.stars}</span>
        <span aria-label={`${hud.coins} coins`}>🪙 {hud.coins}</span>
        <span className="flex items-center gap-1.5" aria-label={`${hud.gaugeLabel} meter`}>
          <span className="text-[10px]">{hud.gaugeLabel}</span>
          <span className="inline-block rounded-full overflow-hidden" style={{ width: 60, height: 8, background: 'rgba(255,255,255,0.18)' }}>
            <span className="block h-full" style={{ width: `${Math.round(Math.min(1, Math.max(0, hud.gauge)) * 100)}%`, background: '#f6c453' }} />
          </span>
        </span>
      </div>

      <div className="absolute bottom-4 inset-x-4 flex items-end justify-end pointer-events-none">
        <button {...holdJump} aria-label="Jump"
          className="pointer-events-auto tap-target cartoon-border cartoon-shadow rounded-2xl text-lg font-bold px-8 py-4"
          style={{ background: 'var(--color-sun-gold)' }}>JUMP</button>
      </div>

      {won && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-sun-gold)' }}>Beacon relit! 🎉</p>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center" style={{ background: 'rgba(8,24,32,0.86)' }}>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-sun-gold)' }}>Game Over</p>
          <p className="text-sm" style={{ color: 'var(--color-cloud)' }}>The slides got the better of you!</p>
          <Button onClick={() => { setGameOver(false); setHud(INITIAL_HUD); EventBus.emit('arcade:restart', {}); }}>Try Again</Button>
          <button onClick={() => onResultRef.current({ score: hud.score, stars: hud.stars, cleared: false })}
            className="tap-target text-xs underline" style={{ color: 'var(--color-cloud)', opacity: 0.8 }}>Back to map</button>
        </div>
      )}
    </div>
  );
}
