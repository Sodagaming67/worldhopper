import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EventBus } from '@/game/EventBus';
import { PhaserGame } from '@/game/PhaserGame';
import { PlatformerScene } from '@/game/scenes/PlatformerScene';
import type { SkinId } from '@/game/kit/skins';
import type { MiniGameProps } from './types';

type Props = MiniGameProps & { levelIndex?: number };
type Hud = { lives: number; coins: number; score: number; level: number; totalLevels: number };

export function PlatformerGame({ onComplete, skin, levelIndex = 0 }: Props) {
  const scenes = useRef([PlatformerScene]).current;
  const registry = useRef<{ skin: SkinId; levelStart: number }>({ skin, levelStart: levelIndex }).current;

  const inputRef = useRef({ left: false, right: false, jump: false });
  const wonRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hud, setHud] = useState<Hud>({ lives: 3, coins: 0, score: 0, level: 0, totalLevels: 3 });

  const setKey = useCallback((key: 'left' | 'right' | 'jump', value: boolean) => {
    if (inputRef.current[key] === value) return;
    inputRef.current[key] = value;
    EventBus.emit('arcade:input', { ...inputRef.current });
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onDone = () => { if (wonRef.current) return; wonRef.current = true; setWon(true); t = setTimeout(() => onCompleteRef.current(), 1100); };
    const onHud = (h: Hud) => setHud(h);
    const onOver = () => setGameOver(true);
    EventBus.on('arcade:done', onDone);
    EventBus.on('arcade:hud', onHud);
    EventBus.on('arcade:gameover', onOver);
    return () => { EventBus.off('arcade:done', onDone); EventBus.off('arcade:hud', onHud); EventBus.off('arcade:gameover', onOver); if (t) clearTimeout(t); };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) setKey('left', true);
      if (['ArrowRight', 'd', 'D'].includes(e.key)) setKey('right', true);
      if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) { setKey('jump', true); e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) setKey('left', false);
      if (['ArrowRight', 'd', 'D'].includes(e.key)) setKey('right', false);
      if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) setKey('jump', false);
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [setKey]);

  const tryAgain = useCallback(() => {
    setGameOver(false);
    setHud({ lives: 3, coins: 0, score: 0, level: 0, totalLevels: 3 });
    EventBus.emit('arcade:restart', {});
  }, []);

  const hold = (key: 'left' | 'right' | 'jump') => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); setKey(key, true); },
    onPointerUp: () => setKey(key, false),
    onPointerLeave: () => setKey(key, false),
    onPointerCancel: () => setKey(key, false),
  });

  return (
    <div className="relative w-full h-full select-none touch-none">
      <PhaserGame scenes={scenes} registry={registry} />

      {/* HUD overlay */}
      <div data-testid="arcade-hud"
        className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-4 text-sm font-bold cartoon-border rounded-2xl px-4 py-1.5 pointer-events-none"
        style={{ background: 'rgba(234,246,247,0.9)' }}>
        <span aria-label={`${hud.lives} lives`}>{'♥'.repeat(hud.lives) || '—'}</span>
        <span>🪙 {hud.coins}</span>
        <span>⭐ {hud.score}</span>
        <span>Lvl {hud.level + 1}/{hud.totalLevels}</span>
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-3 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button {...hold('left')} aria-label="Move left" className="tap-target cartoon-border cartoon-shadow rounded-2xl bg-[var(--color-cloud)] text-2xl font-bold px-6 py-3">◀</button>
          <button {...hold('right')} aria-label="Move right" className="tap-target cartoon-border cartoon-shadow rounded-2xl bg-[var(--color-cloud)] text-2xl font-bold px-6 py-3">▶</button>
        </div>
        <button {...hold('jump')} aria-label="Jump" className="tap-target cartoon-border cartoon-shadow rounded-2xl text-xl font-bold px-8 py-3 pointer-events-auto" style={{ background: 'var(--color-sun-gold)' }}>JUMP</button>
      </div>

      {won && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-spark)' }}>You did it! 🎉</p>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center" style={{ background: 'rgba(12,40,55,0.82)' }}>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-sun-gold)' }}>Game Over</p>
          <p className="text-sm" style={{ color: 'var(--color-cloud)' }}>You ran out of lives!</p>
          <Button onClick={tryAgain}>Try Again</Button>
          <button onClick={onComplete} className="tap-target text-xs underline" style={{ color: 'var(--color-cloud)', opacity: 0.8 }}>Finish another way</button>
        </div>
      )}
    </div>
  );
}
