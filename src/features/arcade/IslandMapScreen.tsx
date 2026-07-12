import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { WORLDS, type IslandWorld, type IslandWorldId } from '@/game/data/worlds';
import { worldNodeStatus } from '@/lib/gameRules';
import { asset, heroTokenAsset } from '@/game/assets';
import type { GameState } from '@/types/game';
import { Icon } from '@/components/ui/Icon';

const GENRE_ICON: Record<string, string> = {
  platformer: '🏃', slide: '🛝', runner: '🚋', swim: '🤿', puzzle: '🧱',
};

/**
 * Painted landmark set-pieces (docs/game/overworld-art-brief.md, issue #24)
 * sitting behind their world-node medallions. Volcano worlds (lavaFlow,
 * kilauea) have no set-piece — their nodes ride the painted volcanoes in
 * bg-map itself. Width in px, tuned per piece so all read at a similar scale.
 */
const NODE_ART: Partial<Record<IslandWorldId, { file: string; width: number }>> = {
  // width is % of the island stage so the pieces scale with the map.
  lagoon: { file: 'overworld/turtleglass-lagoon.png', width: 20 },
  poolSlides: { file: 'overworld/fourfold-springs.png', width: 18 },
  tramDash: { file: 'overworld/sunline-tram.png', width: 16 },
  reef: { file: 'overworld/splashbridge-basin.png', width: 20 },
  blackSand: { file: 'overworld/outer-island-expeditions.png', width: 20 },
  lavaTube: { file: 'overworld/lantern-evening.png', width: 15 },
};

// bg-map.png is 1086×1448; the stage keeps this ratio so node percentages
// always land on the same painted terrain regardless of viewport shape.
const MAP_ASPECT = 1086 / 1448;

/** Walking speed across the stage, in stage-% units per second. */
const HERO_SPEED = 40;

type HeroDir = 'down' | 'up' | 'left' | 'right';
type HeroPose = { x: number; y: number; dir: HeroDir; walking: boolean };

function dirBetween(from: { x: number; y: number }, to: { x: number; y: number }): HeroDir {
  const dx = to.x - from.x, dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'right' : 'left';
  return dy >= 0 ? 'down' : 'up';
}

export function IslandMapScreen() {
  const [, navigate] = useLocation();
  const state = useGameStore() as unknown as GameState;
  const totalStars = WORLDS.reduce((n, w) => n + (state.worldProgress?.[w.id]?.stars ?? 0), 0);
  const reducedMotion = state.settings.reducedMotion;

  // The hero starts at the first uncleared playable world ("you are here").
  const nextWorld = WORLDS.find((w) => worldNodeStatus(state, w) === 'ready' && !(state.worldProgress?.[w.id]?.cleared));
  const home = nextWorld ?? WORLDS[0];
  const [hero, setHero] = useState<HeroPose>({ x: home.node.x, y: home.node.y, dir: 'down', walking: false });
  const walkRaf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(walkRaf.current), []);

  /** Walk the hero to a tapped world node, then enter the world. */
  function selectWorld(w: IslandWorld) {
    cancelAnimationFrame(walkRaf.current);
    const from = { x: hero.x, y: hero.y };
    const to = w.node;
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    if (reducedMotion || dist < 1) {
      setHero({ x: to.x, y: to.y, dir: 'down', walking: false });
      navigate(`/world/${w.id}`);
      return;
    }
    const dir = dirBetween(from, to);
    const durationMs = (dist / HERO_SPEED) * 1000;
    const startedAt = performance.now();
    setHero({ ...from, dir, walking: true });
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / durationMs);
      setHero({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        dir,
        walking: t < 1,
      });
      if (t < 1) {
        walkRaf.current = requestAnimationFrame(step);
      } else {
        navigate(`/world/${w.id}`);
      }
    };
    walkRaf.current = requestAnimationFrame(step);
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'linear-gradient(#7fd0ea, #2e8bb8)' }}>
      {/* Blurred cover pass of the same painting fills the letterbox bars */}
      <img
        src={asset('overworld/bg-map.png')}
        alt=""
        draggable={false}
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover select-none blur-md brightness-90 scale-110"
      />

      {/* Island stage — fitted to the painting's aspect ratio and centered, so
          every % coordinate below tracks the same painted terrain (coast,
          volcanoes) on phones and desktops alike. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          aspectRatio: '1086 / 1448',
          width: `min(100vw, calc(100vh * ${MAP_ASPECT}))`,
        }}
      >
        {/* Painted Big Island aerial (AI art round, issue #24) */}
        <img
          src={asset('overworld/bg-map.png')}
          alt=""
          draggable={false}
          aria-hidden
          className="absolute inset-0 w-full h-full select-none"
        />

        {/* Dotted trail through the eight nodes. preserveAspectRatio="none"
            maps viewBox units 1:1 onto the stage percentages the nodes use. */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
          <polyline
            points={WORLDS.map((w) => `${w.node.x},${w.node.y}`).join(' ')}
            fill="none" stroke="#fff8e0" strokeWidth="3" strokeDasharray="6 7"
            strokeLinecap="round" opacity="0.75" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Painted landmark set-pieces behind their node medallions */}
        {WORLDS.map((w) => {
          const art = NODE_ART[w.id];
          if (!art) return null;
          return (
            <img
              key={`art-${w.id}`}
              src={asset(art.file)}
              alt=""
              draggable={false}
              aria-hidden
              className="absolute -translate-x-1/2 -translate-y-[72%] select-none pointer-events-none drop-shadow-md"
              style={{ left: `${w.node.x}%`, top: `${w.node.y}%`, width: `${art.width}%` }}
            />
          );
        })}

        {/* Beacon lighthouse — ambient festival-hub decoration on the west coast */}
        <img
          src={asset('overworld/beacon-courtyard.png')}
          alt=""
          draggable={false}
          aria-hidden
          className="absolute -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none drop-shadow-md"
          style={{ left: '10%', top: '65%', width: '15%' }}
        />

        {WORLDS.map((w) => {
          const status = worldNodeStatus(state, w);
          const stars = state.worldProgress?.[w.id]?.stars ?? 0;
          return (
            <button
              key={w.id}
              onClick={() => selectWorld(w)}
              aria-label={`World ${w.number}: ${w.name}${status === 'soon' ? ' (coming soon)' : ''}`}
              data-testid={`world-node-${w.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 tap-target"
              style={{ left: `${w.node.x}%`, top: `${w.node.y}%`, opacity: status === 'soon' ? 0.55 : 1 }}
            >
              <span className="cartoon-border cartoon-shadow rounded-full flex items-center justify-center text-2xl"
                style={{
                  width: 52, height: 52,
                  background: status === 'cleared' ? 'var(--color-sun-gold)' : status === 'ready' ? 'var(--color-cloud)' : '#c9c9c9',
                }}>
                {status === 'soon' ? '🚧' : GENRE_ICON[w.genre]}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg cartoon-border bg-[var(--color-cloud)]">
                {w.number}. {w.name}
              </span>
              <span className="text-[10px]" aria-label={`${stars} of 3 stars`}>
                {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
              </span>
            </button>
          );
        })}

        {/* The island hero — waits at the next uncleared world and walks to
            whichever node you tap before entering it. */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${hero.x}%`,
            top: `${hero.y}%`,
            width: '6.5%',
            // Standing beside the node (upper-left) while idle; feet on the
            // path point while walking.
            transform: hero.walking ? 'translate(-50%, -85%)' : 'translate(-115%, -100%)',
          }}
          data-testid="map-hero-token"
        >
          <img
            src={heroTokenAsset(state.settings.heroCharacter, hero.dir)}
            alt={nextWorld ? `You are here: ${nextWorld.name}` : 'Island hero'}
            draggable={false}
            className={`w-full select-none drop-shadow ${!reducedMotion && !hero.walking ? 'animate-bounce' : ''}`}
          />
        </div>
      </div>

      {/* Header: title + star wallet + hero picker + settings */}
      <header className="absolute top-0 inset-x-0 flex items-center gap-2 p-3">
        <h1 className="text-2xl flex-1 drop-shadow" style={{ color: 'var(--color-cloud)' }}>THE ABANDONED RESORT</h1>
        <span className="cartoon-border rounded-xl bg-[var(--color-cloud)] px-2 py-1 text-sm font-bold"
          aria-label={`${totalStars} stars collected`}>★ {totalStars}</span>
        <button onClick={() => navigate('/settings')} aria-label="Settings"
          className="tap-target cartoon-border cartoon-shadow-hover rounded-xl bg-[var(--color-cloud)] p-2">
          <Icon name="settings" size={20} />
        </button>
      </header>

    </div>
  );
}
