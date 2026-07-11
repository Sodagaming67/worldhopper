import { useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { LENSES } from '@/data/lenses';
import { BADGES } from '@/data/badges';
import { TEAM_STAT_KEYS } from '@/lib/gameRules';
import type { GameState, TeamStats } from '@/types/game';
import { ScreenHeader, Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

const STAT_LABEL: Record<keyof TeamStats, string> = {
  discovery: 'Discovery',
  kindness: 'Kindness',
  creativity: 'Creativity',
  ingenuity: 'Ingenuity',
};

export function InventoryScreen() {
  const [, navigate] = useLocation();
  const state = useGameStore() as unknown as GameState;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <ScreenHeader title="Field Kit" onBack={() => navigate('/map')} />

      <div className="px-4 flex flex-col gap-5">
        {/* Team stats */}
        <section>
          <h2 className="text-lg mb-2">Team Stats</h2>
          <div className="grid grid-cols-2 gap-2">
            {TEAM_STAT_KEYS.map((k) => (
              <Card key={k} className="flex items-center justify-between !p-3">
                <span className="text-sm font-semibold">{STAT_LABEL[k]}</span>
                <span className="text-xl font-bold" style={{ color: 'var(--color-ocean-deep)' }}>{state.teamStats[k]}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Lenses */}
        <section>
          <h2 className="text-lg mb-2">Signal Lenses ({state.collectedLensIds.length}/{LENSES.length})</h2>
          <div className="grid grid-cols-4 gap-3">
            {LENSES.map((lens) => {
              const has = state.collectedLensIds.includes(lens.id);
              return (
                <div key={lens.id} className="flex flex-col items-center gap-1">
                  <div
                    className="rounded-full cartoon-border"
                    style={{ width: 52, height: 52, background: has ? lens.color : 'transparent', opacity: has ? 1 : 0.35 }}
                    aria-hidden
                  />
                  <span className="text-[10px] text-center leading-tight" style={{ opacity: has ? 1 : 0.5 }}>
                    {lens.name.replace(' Lens', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-lg mb-2">Badges ({state.unlockedBadgeIds.length}/{BADGES.length})</h2>
          <div className="grid grid-cols-3 gap-2">
            {BADGES.map((badge) => {
              const has = state.unlockedBadgeIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className="cartoon-border rounded-xl p-2 flex flex-col items-center text-center gap-1"
                  style={{ background: has ? 'var(--color-cloud)' : 'transparent', opacity: has ? 1 : 0.4 }}
                >
                  <Icon name={has ? badge.icon : 'lock'} size={22} />
                  <span className="text-[11px] font-semibold leading-tight">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
