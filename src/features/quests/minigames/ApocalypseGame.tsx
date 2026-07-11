import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EventBus } from '@/game/EventBus';
import { PhaserGame } from '@/game/PhaserGame';
import { ApocalypseScene } from '@/game/scenes/ApocalypseScene';
import type { SkinId } from '@/game/kit/skins';
import type { MiniGameProps } from './types';

type Props = MiniGameProps & { levelIndex?: number };
type Hud = {
  hp: number; maxHp: number; lives: number; score: number;
  stars: number; coins: number; weapon: string; ammo: number;
};

const INITIAL_HUD: Hud = { hp: 100, maxHp: 100, lives: 3, score: 0, stars: 0, coins: 0, weapon: 'Missile', ammo: -1 };

export function ApocalypseGame({ onComplete, skin, levelIndex = 0 }: Props) {
  const scenes = useRef([ApocalypseScene]).current;
  const registry = useRef<{ skin: SkinId; levelStart: number }>({ skin, levelStart: levelIndex }).current;

  const inputRef = useRef({ left: false, right: false, jump: false });
  const wonRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hud, setHud] = useState<Hud>(INITIAL_HUD);

  const isBlaze = skin === 'blaze';

  const setKey = useCallback((key: 'left' | 'right' | 'jump', value: boolean) => {
    if (inputRef.current[key] === value) return;
    inputRef.current[key] = value;
    EventBus.emit('arcade:input', { ...inputRef.current });
  }, []);

  const fire = useCallback(() => EventBus.emit('apoc:fire', {}), []);
  const power = useCallback(() => EventBus.emit('apoc:power', {}), []);
  const selectWeapon = useCallback((index: number) => EventBus.emit('apoc:weapon', { index }), []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onDone = () => { if (wonRef.current) return; wonRef.current = true; setWon(true); t = setTimeout(() => onCompleteRef.current(), 1200); };
    const onHud = (h: Hud) => setHud(h);
    const onOver = () => setGameOver(true);
    EventBus.on('arcade:done', onDone);
    EventBus.on('apoc:hud', onHud);
    EventBus.on('arcade:gameover', onOver);
    return () => { EventBus.off('arcade:done', onDone); EventBus.off('apoc:hud', onHud); EventBus.off('arcade:gameover', onOver); if (t) clearTimeout(t); };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) setKey('left', true);
      if (['ArrowRight', 'd', 'D'].includes(e.key)) setKey('right', true);
      if (['ArrowUp', 'w', 'W'].includes(e.key)) { setKey('jump', true); e.preventDefault(); }
      if (e.key === ' ' || e.key === 'f' || e.key === 'F') { fire(); e.preventDefault(); }
      if (e.key === 'e' || e.key === 'E') { power(); }
      if (['1', '2', '3', '4'].includes(e.key)) selectWeapon(Number(e.key));
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) setKey('left', false);
      if (['ArrowRight', 'd', 'D'].includes(e.key)) setKey('right', false);
      if (['ArrowUp', 'w', 'W'].includes(e.key)) setKey('jump', false);
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [setKey, fire, power, selectWeapon]);

  const tryAgain = useCallback(() => {
    setGameOver(false);
    setHud(INITIAL_HUD);
    EventBus.emit('arcade:restart', {});
  }, []);

  const hold = (key: 'left' | 'right' | 'jump') => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); setKey(key, true); },
    onPointerUp: () => setKey(key, false),
    onPointerLeave: () => setKey(key, false),
    onPointerCancel: () => setKey(key, false),
  });

  const hpPct = hud.maxHp > 0 ? hud.hp / hud.maxHp : 0;
  const hpColor = hpPct > 0.6 ? '#33cc55' : hpPct >= 0.3 ? '#ff9b2e' : '#ff3b30';

  return (
    <div className="relative w-full h-full select-none touch-none">
      <PhaserGame scenes={scenes} registry={registry} />

      {/* HUD overlay */}
      <div data-testid="apoc-hud"
        className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 text-sm font-bold cartoon-border rounded-2xl px-4 py-1.5 pointer-events-none flex-wrap justify-center"
        style={{ background: 'rgba(20,8,4,0.82)', color: '#ffe8d0' }}>
        <span className="flex items-center gap-1.5" aria-label={`Health ${hud.hp} of ${hud.maxHp}`}>
          <span className="inline-block rounded-full overflow-hidden" style={{ width: 70, height: 10, background: 'rgba(255,255,255,0.18)' }}>
            <span className="block h-full" style={{ width: `${Math.round(hpPct * 100)}%`, background: hpColor }} />
          </span>
          <span className="text-xs">{hud.hp}/{hud.maxHp}</span>
        </span>
        <span aria-label={`${hud.lives} lives`}>{'♥'.repeat(hud.lives) || '—'}</span>
        <span>⭐ {hud.score}</span>
        <span aria-label={`${hud.stars} stars`}>✦ {hud.stars}</span>
        <span aria-label={`${hud.coins} coins`}>🪙 {hud.coins}</span>
        {isBlaze && (
          <span aria-label={`Weapon ${hud.weapon}`}>
            {hud.weapon}{hud.ammo >= 0 ? ` ×${hud.ammo}` : ''}
          </span>
        )}
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 inset-x-4 flex items-end justify-between gap-3 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button {...hold('left')} aria-label="Move left" className="tap-target cartoon-border cartoon-shadow rounded-2xl bg-[var(--color-cloud)] text-2xl font-bold px-5 py-3">◀</button>
          <button {...hold('right')} aria-label="Move right" className="tap-target cartoon-border cartoon-shadow rounded-2xl bg-[var(--color-cloud)] text-2xl font-bold px-5 py-3">▶</button>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {isBlaze && (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => selectWeapon(n)}
                  aria-label={`Weapon ${n}`}
                  className="tap-target cartoon-border cartoon-shadow rounded-xl bg-[var(--color-cloud)] text-sm font-bold px-3 py-2"
                >
                  {n}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <button onClick={power} aria-label="Power" className="tap-target cartoon-border cartoon-shadow rounded-2xl text-sm font-bold px-5 py-3" style={{ background: 'var(--color-plumeria-violet)', color: '#fff' }}>POWER</button>
            <button onClick={fire} aria-label="Fire" className="tap-target cartoon-border cartoon-shadow rounded-2xl text-lg font-bold px-6 py-3" style={{ background: 'var(--color-coral)', color: '#fff' }}>FIRE</button>
            <button {...hold('jump')} aria-label="Jump" className="tap-target cartoon-border cartoon-shadow rounded-2xl text-lg font-bold px-6 py-3" style={{ background: 'var(--color-sun-gold)' }}>JUMP</button>
          </div>
        </div>
      </div>

      {won && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-sun-gold)' }}>You made it! 🎉</p>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center" style={{ background: 'rgba(20,8,4,0.86)' }}>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-sun-gold)' }}>Game Over</p>
          <p className="text-sm" style={{ color: 'var(--color-cloud)' }}>The city got the better of you!</p>
          <Button onClick={tryAgain}>Try Again</Button>
          <button onClick={onComplete} className="tap-target text-xs underline" style={{ color: 'var(--color-cloud)', opacity: 0.8 }}>Finish another way</button>
        </div>
      )}
    </div>
  );
}
