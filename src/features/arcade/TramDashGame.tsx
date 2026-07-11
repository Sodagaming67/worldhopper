import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { EventBus } from '@/game/EventBus';
import { PhaserGame } from '@/game/PhaserGame';
import { BootScene } from '@/game/scenes/BootScene';
import { TramDashScene } from '@/game/scenes/TramDashScene';
import type { SkinId } from '@/game/kit/skins';

type Props = { skin: SkinId; onResult: (r: { score: number; stars: number; cleared: boolean }) => void };
type Hud = { lives: number; maxLives?: number; score: number; stars: number; coins: number; gauge: number; gaugeLabel: string; combo?: number };
const INITIAL_HUD: Hud = { lives: 5, maxLives: 5, score: 0, stars: 0, coins: 0, gauge: 0, gaugeLabel: 'DASH', combo: 1 };
const SWIPE_MIN_PX = 24;
const HINT_KEY = 'tramdash-swipe-hint';

export function TramDashGame({ skin, onResult }: Props) {
  const scenes = useRef([BootScene, TramDashScene]).current;
  const registry = useRef({ skin, manifests: ['tramdash-chase'], startScene: 'TramDash' }).current;
  const hudRef = useRef<Hud>(INITIAL_HUD);
  const wonRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hud, setHud] = useState<Hud>(INITIAL_HUD);
  const [showHint, setShowHint] = useState(() => !sessionStorage.getItem(HINT_KEY));

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
    if (!showHint) return;
    const t = setTimeout(() => { setShowHint(false); sessionStorage.setItem(HINT_KEY, '1'); }, 2800);
    return () => clearTimeout(t);
  }, [showHint]);

  const hop = (right: boolean) => EventBus.emit('arcade:dir', { up: false, down: false, left: !right, right });
  const dash = () => EventBus.emit('apoc:power', {});
  const jump = () => EventBus.emit('arcade:input', { left: false, right: false, jump: true });
  const slide = () => EventBus.emit('arcade:input', { left: false, right: false, jump: false, slide: true });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) { hop(false); e.preventDefault(); }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) { hop(true); e.preventDefault(); }
      if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) { jump(); e.preventDefault(); }
      if (['ArrowDown', 's', 'S'].includes(e.key)) { slide(); e.preventDefault(); }
      if (e.key === 'e' || e.key === 'E') { dash(); e.preventDefault(); }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  // Swipe gestures: left/right = switch rails, up = jump, down = slide.
  const swipeStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent) => { swipeStart.current = { x: e.clientX, y: e.clientY, id: e.pointerId }; };
  const onPointerUp = (e: ReactPointerEvent) => {
    const s = swipeStart.current;
    swipeStart.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return;
    if (Math.abs(dx) >= Math.abs(dy)) hop(dx > 0);
    else if (dy < 0) jump();
    else slide();
  };

  return (
    <div className="relative w-full h-full select-none touch-none" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <PhaserGame scenes={scenes} registry={registry} />

      <div data-testid="blitz-hud"
        className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 text-sm font-bold cartoon-border rounded-2xl px-4 py-1.5 pointer-events-none"
        style={{ background: 'rgba(8,24,32,0.82)', color: '#e8f8ff' }}>
        <span className="flex items-center gap-1.5" aria-label={`${hud.lives} of ${hud.maxLives ?? 5} lives`}>
          <span aria-hidden>{'♥'.repeat(hud.lives) || '—'}</span>
          <span className="inline-block rounded-full overflow-hidden" style={{ width: 60, height: 8, background: 'rgba(255,255,255,0.18)' }}>
            <span className="block h-full" style={{
              width: `${Math.round(Math.min(1, Math.max(0, hud.lives / (hud.maxLives ?? 5))) * 100)}%`,
              background: 'var(--color-coral)',
              transition: 'width 300ms ease-out',
            }} />
          </span>
        </span>
        <span>⭐ {hud.score}</span>
        <span aria-label={`${hud.stars} stars`}>✦ {hud.stars}</span>
        <span aria-label={`${hud.coins} coins`}>🪙 {hud.coins}</span>
        {(hud.combo ?? 1) > 1 && (
          <span aria-label="combo multiplier" style={{ color: '#f6c453' }}>x{hud.combo}</span>
        )}
        <span className="flex items-center gap-1.5" aria-label={`${hud.gaugeLabel} meter`}>
          <span className="text-[10px]">{hud.gaugeLabel}</span>
          <span className="inline-block rounded-full overflow-hidden" style={{ width: 60, height: 8, background: 'rgba(255,255,255,0.18)' }}>
            <span className="block h-full" style={{ width: `${Math.round(Math.min(1, Math.max(0, hud.gauge)) * 100)}%`, background: '#f6c453' }} />
          </span>
        </span>
      </div>

      {showHint && (
        <div data-testid="swipe-hint" className="absolute inset-x-0 top-16 flex justify-center pointer-events-none">
          <p className="cartoon-border rounded-2xl px-4 py-2 text-sm font-bold"
            style={{ background: 'rgba(8,24,32,0.82)', color: '#e8f8ff' }}>
            ⬅➡ swipe to switch rails · ⬆ jump · ⬇ slide
          </p>
        </div>
      )}

      <div className="absolute bottom-4 right-4 pointer-events-none">
        <button onClick={dash} onPointerDown={(e) => e.stopPropagation()} aria-label="Dash"
          className="pointer-events-auto tap-target cartoon-border cartoon-shadow rounded-2xl text-lg font-bold px-8 py-4"
          style={{ background: 'var(--color-coral)', color: '#fff' }}>DASH</button>
      </div>

      {won && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-sun-gold)' }}>Beacon relit! 🎉</p>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center" style={{ background: 'rgba(8,24,32,0.86)' }}>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--color-sun-gold)' }}>Game Over</p>
          <p className="text-sm" style={{ color: 'var(--color-cloud)' }}>The Kakamora took the tram!</p>
          <Button onClick={() => { setGameOver(false); setHud(INITIAL_HUD); EventBus.emit('arcade:restart', {}); }}>Try Again</Button>
          <button onClick={() => onResultRef.current({ score: hud.score, stars: hud.stars, cleared: false })}
            className="tap-target text-xs underline" style={{ color: 'var(--color-cloud)', opacity: 0.8 }}>Back to map</button>
        </div>
      )}
    </div>
  );
}
