import { useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useGameStore } from '@/store/gameStore';
import type { GameSettings, GameState } from '@/types/game';
import { ScreenHeader, Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ParentGate } from '@/components/ui/ParentGate';
import { exportSave, importSaveFromFile } from '@/lib/storage';
import { ART_CREDITS } from '@/data/artCredits';
import { heroTokenAsset } from '@/game/assets';

// Only the boolean settings are rendered as switches. heroSkin has no picker
// since the painted island hero became the one map character (#24); worlds
// read the persisted value, which stays at its default.
type ToggleKey = {
  [K in keyof GameSettings]: GameSettings[K] extends boolean ? K : never;
}[keyof GameSettings];

const TOGGLES: { key: ToggleKey; label: string; help: string }[] = [
  { key: 'soundEnabled', label: 'Sound effects', help: 'Gentle chimes and sparkles.' },
  { key: 'reducedMotion', label: 'Reduced motion', help: 'Turn off animations and floating particles.' },
  { key: 'dyslexiaFriendlyFont', label: 'Easy-reading font', help: 'Switch to a more readable font.' },
  { key: 'challengeMode', label: '⚔️ Challenge Mode', help: 'Arcade play: 3 levels, 3 lives, coins, enemies — you can lose!' },
];

export function SettingsScreen() {
  const [, navigate] = useLocation();
  const state = useGameStore() as unknown as GameState;
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetAdventure = useGameStore((s) => s.resetAdventure);
  const importState = useGameStore((s) => s.importState);

  const fileRef = useRef<HTMLInputElement>(null);
  const [gate, setGate] = useState<null | 'reset' | 'import'>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');

  function toggle(key: ToggleKey) {
    updateSettings({ [key]: !state.settings[key] } as Partial<GameSettings>);
  }

  async function doImport(file: File) {
    try {
      const next = await importSaveFromFile(file);
      importState(next);
      setImportError('');
      navigate('/map');
    } catch {
      setImportError('That file could not be read as a valid save.');
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <ScreenHeader title="Settings" onBack={() => navigate('/map')} />

      <div className="px-4 flex flex-col gap-4">
        {/* Explorer */}
        <section className="flex flex-col gap-2">
          <h2 className="text-lg">Explorer</h2>
          <div className="flex gap-3">
            {(['boy', 'girl'] as const).map((hero) => {
              const selected = state.settings.heroCharacter === hero;
              return (
                <button
                  key={hero}
                  onClick={() => updateSettings({ heroCharacter: hero })}
                  aria-pressed={selected}
                  aria-label={`Play as the ${hero} explorer`}
                  className="tap-target cartoon-border cartoon-shadow-hover flex-1 flex flex-col items-center gap-1 rounded-2xl px-4 py-2"
                  style={{ background: selected ? 'var(--color-sun-gold)' : 'var(--color-cloud)' }}
                >
                  <img
                    src={heroTokenAsset(hero, 'down')}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="h-14 w-auto select-none"
                  />
                  <span className="text-xs font-bold capitalize">{hero}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Toggles */}
        <section className="flex flex-col gap-2">
          {TOGGLES.map((t) => {
            const on = state.settings[t.key];
            return (
              <Card key={t.key} className="flex items-center gap-3 !p-3">
                <div className="flex-1">
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="text-xs" style={{ opacity: 0.65 }}>{t.help}</div>
                </div>
                <button
                  onClick={() => toggle(t.key)}
                  role="switch"
                  aria-checked={on}
                  aria-label={t.label}
                  className="tap-target cartoon-border rounded-full px-1"
                  style={{ width: 64, height: 36, background: on ? 'var(--color-lagoon)' : 'var(--color-cloud)' }}
                >
                  <span
                    className="block rounded-full"
                    style={{
                      width: 26, height: 26, background: 'var(--color-ink)',
                      transform: on ? 'translateX(28px)' : 'translateX(0)',
                      transition: 'transform 0.12s ease',
                    }}
                  />
                </button>
              </Card>
            );
          })}
        </section>

        {/* Save management */}
        <section className="flex flex-col gap-2">
          <h2 className="text-lg">Save</h2>
          <Button variant="secondary" onClick={() => exportSave(state)}>
            <span className="inline-flex items-center gap-2"><Icon name="download" size={18} /> Export save file</span>
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <span className="inline-flex items-center gap-2"><Icon name="upload" size={18} /> Import save file</span>
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) { setPendingFile(f); setGate('import'); }
            }}
          />
          {importError && <p className="text-sm" style={{ color: 'var(--color-coral)' }}>{importError}</p>}
        </section>

        {/* Danger zone */}
        <section className="flex flex-col gap-2">
          <h2 className="text-lg">Adventure</h2>
          <Button variant="secondary" onClick={() => setGate('reset')} style={{ background: 'var(--color-coral)' }}>
            <span className="inline-flex items-center gap-2"><Icon name="rotate-ccw" size={18} /> Reset adventure</span>
          </Button>
        </section>

        {/* About / safety */}
        <Card accent="var(--color-plumeria-violet)">
          <h2 className="text-base mb-1">About</h2>
          <p className="text-xs mb-2" style={{ opacity: 0.8 }}>
            <strong>Explorer Rule:</strong> Animals are neighbors, not game pieces. Watch from a
            respectful distance, never touch or feed wildlife, and follow staff guidance and posted signs.
            A photo is never required to complete a quest.
          </p>
          <p className="text-[11px]" style={{ opacity: 0.6 }}>
            Unofficial private family project. Not affiliated with, sponsored by, or endorsed by
            Hilton or Hilton Waikoloa Village.
          </p>
          <h3 className="text-sm mt-3 mb-1">Art credits</h3>
          <ul className="text-[11px] flex flex-col gap-0.5" style={{ opacity: 0.75 }}>
            {ART_CREDITS.map((c) => (
              <li key={c.url}>
                <a href={c.url} target="_blank" rel="noreferrer" className="underline">{c.title}</a>
                {' '}by {c.author} ({c.license})
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {gate === 'reset' && (
        <ParentGate
          title="Reset adventure?"
          message="This erases your team, lenses, badges, and Memory Book. This can’t be undone."
          confirmLabel="Reset"
          onCancel={() => setGate(null)}
          onConfirm={() => { resetAdventure(); setGate(null); navigate('/'); }}
        />
      )}
      {gate === 'import' && pendingFile && (
        <ParentGate
          title="Import save?"
          message="This replaces your current adventure with the file you chose."
          confirmLabel="Import"
          onCancel={() => { setGate(null); setPendingFile(null); }}
          onConfirm={() => { const f = pendingFile; setGate(null); setPendingFile(null); if (f) doImport(f); }}
        />
      )}
    </div>
  );
}
