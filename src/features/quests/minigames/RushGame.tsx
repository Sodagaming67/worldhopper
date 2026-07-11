import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EventBus } from '@/game/EventBus';
import { PhaserGame } from '@/game/PhaserGame';
import { RushScene } from '@/game/scenes/RushScene';
import type { SkinId } from '@/game/kit/skins';
import type { MiniGameProps } from './types';

type Props = MiniGameProps & { levelIndex?: number };
type Hud = { lives: number; coins: number; score: number; level: number; totalLevels: number };

export function RushGame({ onComplete, skin, levelIndex = 0 }: Props) {
  const scenes = useRef([RushScene]).current;
  const registry = useRef<{ skin: SkinId; levelStart: number }>({ skin, levelStart: levelIndex }).current;

  const inputRef = useRef({ left: false, right: false, jump: false });
  const wonRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hud, setHud] = useState<Hud>({ lives: 3, coins: 0, score: 0, level: 0, totalLevels: 2 });

  const setJump = useCallback((value: boolean) => {
    if (inputRef.current.jump === value) return;
    inputRef.current.jump = value;
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
      if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) { setJump(true); e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) setJump(false);
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [setJump]);

  const tryAgain = useCallback(() => {
    setGameOver(false);
    setHud({ lives: 3, coins: 0, score: 0, level: 0, totalLevels: 2 });
    EventBus.emit('arcade:restart', {});
  }, []);

  const hold = {
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); setJump(true); },
    onPointerUp: () => setJump(false),
    onPointerLeave: () => setJump(false),
    onPointerCancel: () => setJump(false),
  };

  return (
    <div className="relative w-full h-full select-none touch-none">
      <PhaserGame scenes={scenes} registry={registry} />

      {/* HUD overlay */}
      <div data-testid="rush-hud"
        className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-4 text-sm font-bold cartoon-border rounded-2xl px-4 py-1.5 pointer-events-none"
        style={{ background: 'rgba(234,246,247,0.9)' }}>
        <span aria-label={`${hud.lives} lives`}>{'♥'.repeat(hud.lives) || '—'}</span>
        <span>🪙 {hud.coins}</span>
        <span>⭐ {hud.score}</span>
        <span>Lvl {hud.level + 1}/{hud.totalLevels}</span>
      </div>

      {/* Jump control (auto-run handles forward movement) */}
      <div className="absolute bottom-4 inset-x-4 flex items-center justify-center pointer-events-none">
        <button {...hold} aria-label="Jump" className="tap-target cartoon-border cartoon-shadow rounded-2xl text-xl font-bold px-16 py-4 pointer-events-auto" style={{ background: 'var(--color-sun-gold)' }}>JUMP</button>
      </div>

      {won && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-spark)' }}>You made it! 🎉</p>
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
