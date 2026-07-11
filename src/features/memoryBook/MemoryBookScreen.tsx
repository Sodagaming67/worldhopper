import { useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import { CHAPTER_BY_ID } from '@/data/chapters';
import { LOCATION_BY_ID } from '@/data/locations';
import type { GameState } from '@/types/game';
import { ScreenHeader, Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

export function MemoryBookScreen() {
  const [, navigate] = useLocation();
  const state = useGameStore() as unknown as GameState;
  const entries = [...state.journalEntries].reverse();

  return (
    <div className="flex flex-col gap-4 pb-8">
      <ScreenHeader title="Memory Book" onBack={() => navigate('/map')} />

      <div className="px-4 flex flex-col gap-3">
        {entries.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3" style={{ opacity: 0.7 }}>
            <Icon name="book-heart" size={40} />
            <p>Your memories will appear here as you complete chapters.</p>
          </div>
        ) : (
          entries.map((entry) => {
            const chapter = CHAPTER_BY_ID[entry.chapterId];
            const location = chapter ? LOCATION_BY_ID[chapter.locationId] : undefined;
            const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric',
            });
            return (
              <Card key={entry.id} accent={location?.accent ?? 'var(--color-plumeria-violet)'}>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg flex-1">{entry.title}</h2>
                  <span className="text-xs" style={{ opacity: 0.6 }}>{date}</span>
                </div>
                {location && <p className="text-xs mb-1" style={{ opacity: 0.6 }}>{location.name}</p>}
                {entry.reflection ? (
                  <p className="text-sm italic">“{entry.reflection}”</p>
                ) : (
                  <p className="text-sm" style={{ opacity: 0.5 }}>No note added.</p>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
