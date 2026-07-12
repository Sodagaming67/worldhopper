import { useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { asset, heroTokenAsset } from '@/game/assets';

export function TitleScreen() {
  const [, navigate] = useLocation();
  const heroCharacter = useGameStore((s) => s.settings.heroCharacter);
  const updateSettings = useGameStore((s) => s.updateSettings);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'var(--color-ink)' }}>
      <img
        src={asset('title/title-bg.png')}
        alt=""
        draggable={false}
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover select-none"
      />
      {/* Fog fade so the title/buttons stay legible over the painted scene below them */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, var(--color-ink) 0%, transparent 45%)' }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col h-full items-center justify-end gap-6 p-8 pb-20 text-center">
        <h1
          className="text-4xl sm:text-5xl leading-tight drop-shadow"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cloud)' }}
        >
          THE ABANDONED RESORT
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-sand)' }}>The Seven Signals</p>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--color-sand)' }}>Choose your explorer</span>
          <div className="flex gap-3">
            {(['boy', 'girl'] as const).map((hero) => {
              const selected = heroCharacter === hero;
              return (
                <button
                  key={hero}
                  onClick={() => updateSettings({ heroCharacter: hero })}
                  aria-pressed={selected}
                  aria-label={`Play as the ${hero} explorer`}
                  className="tap-target cartoon-border cartoon-shadow-hover flex flex-col items-center gap-1 rounded-2xl px-4 py-2"
                  style={{ background: selected ? 'var(--color-sun-gold)' : 'var(--color-cloud)' }}
                >
                  <img
                    src={heroTokenAsset(hero, 'down')}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="h-14 w-auto select-none"
                  />
                  <span className="text-xs font-bold capitalize" style={{ color: 'var(--color-ocean-deep)' }}>{hero}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => navigate('/map')}
          aria-label="Play"
          className="tap-target cartoon-border cartoon-shadow-hover rounded-2xl px-8 py-3 text-lg font-bold bg-[var(--color-sun-gold)] text-[var(--color-ocean-deep)]"
        >
          Play ▸
        </button>
      </div>
    </div>
  );
}
