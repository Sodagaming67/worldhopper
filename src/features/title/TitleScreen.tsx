import { useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { heroTokenAsset } from '@/game/assets';

export function TitleScreen() {
  const [, navigate] = useLocation();
  const heroCharacter = useGameStore((s) => s.settings.heroCharacter);
  const updateSettings = useGameStore((s) => s.updateSettings);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'var(--color-ink)' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="title-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ocean-deep)" />
            <stop offset="60%" stopColor="#7C93A3" />
            <stop offset="100%" stopColor="var(--color-sand)" />
          </linearGradient>
          {/* Wayfinder Beacon glow — the resort's old light, still faintly alive */}
          <radialGradient id="title-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-sun-gold)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-sun-gold)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="title-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0.92" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="300" height="400" fill="url(#title-sky)" />
        <circle cx="150" cy="195" r="115" fill="url(#title-glow)" />

        {/* Distant treeline, visible only where it isn't covered by the building */}
        <path
          d="M0,292 Q15,278 32,290 T66,286 T100,292 T134,282 T168,290 T202,284 T236,292 T270,286 T300,290 V400 H0 Z"
          fill="#22392A"
          opacity="0.9"
        />

        {/* Grand overgrown rotunda — dome, drum, and portico */}
        <g>
          {/* dome */}
          <path d="M95,250 A55,55 0 0 1 205,250 Z" fill="#C9BFA0" />
          <g stroke="#8B806A" strokeWidth="1.4" opacity="0.6">
            <path d="M117,250 Q150,206 183,250" fill="none" />
            <path d="M130,250 Q150,220 170,250" fill="none" />
          </g>
          {/* lantern cupola */}
          <rect x="144" y="188" width="12" height="20" fill="#C9BFA0" />
          <polygon points="141,188 159,188 150,176" fill="#8B806A" />
          <circle cx="150" cy="172" r="3" fill="var(--color-sun-gold)" opacity="0.8" />

          {/* drum with faint glowing window slits */}
          <rect x="100" y="250" width="100" height="42" fill="#C9BFA0" />
          <g fill="#8B806A" opacity="0.5">
            <rect x="110" y="250" width="3" height="42" />
            <rect x="130" y="250" width="3" height="42" />
            <rect x="150" y="250" width="3" height="42" />
            <rect x="170" y="250" width="3" height="42" />
            <rect x="190" y="250" width="3" height="42" />
          </g>
          <g fill="var(--color-lagoon)">
            <rect x="118" y="262" width="6" height="16" opacity="0.75" style={{ animation: 'twinkle 5s ease-in-out infinite' }} />
            <rect x="157" y="262" width="6" height="16" opacity="0.6" />
            <rect x="177" y="262" width="6" height="16" opacity="0.75" style={{ animation: 'twinkle 6s ease-in-out infinite 1.2s' }} />
          </g>

          {/* pediment + portico columns */}
          <polygon points="88,292 212,292 150,264" fill="#C9BFA0" />
          <rect x="90" y="292" width="120" height="70" fill="#5C544A" />
          <g fill="#C9BFA0">
            <rect x="96" y="292" width="9" height="70" />
            <rect x="117" y="292" width="9" height="70" />
            <rect x="138" y="292" width="9" height="70" />
            <rect x="159" y="292" width="9" height="70" />
            <rect x="180" y="292" width="9" height="70" />
            <rect x="197" y="292" width="9" height="70" />
          </g>

          {/* crumbled steps and rubble at the base */}
          <polygon points="100,362 200,362 212,384 88,384" fill="#8B806A" />
          <polygon points="110,384 126,384 120,394 102,394" fill="#5C544A" opacity="0.8" />
          <polygon points="178,384 196,384 202,394 184,394" fill="#5C544A" opacity="0.8" />
        </g>

        {/* Trees and vines reclaiming the building */}
        <g fill="#2E4B33">
          <rect x="62" y="316" width="9" height="88" />
          <circle cx="68" cy="290" r="34" />
          <circle cx="48" cy="308" r="26" />
          <circle cx="88" cy="304" r="24" />

          <rect x="228" y="322" width="8" height="82" />
          <circle cx="232" cy="296" r="32" />
          <circle cx="252" cy="312" r="24" />
          <circle cx="212" cy="314" r="22" />
        </g>
        <g stroke="#3C6B44" strokeWidth="2.5" fill="none" opacity="0.85">
          <path d="M108,362 Q102,336 116,308" />
          <path d="M204,362 Q212,338 196,310" />
          <path d="M140,362 Q136,344 146,326" />
        </g>

        {/* Foreground undergrowth */}
        <path
          d="M0,362 Q22,348 45,360 T90,352 T135,362 T180,350 T225,360 T270,352 T300,358 V400 H0 Z"
          fill="#213526"
        />

        <rect x="0" y="225" width="300" height="175" fill="url(#title-fog)" />
      </svg>

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
