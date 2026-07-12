import type { Page } from '@playwright/test';

// Kept intentionally decoupled from '@/types/game' — Playwright's TS loader
// doesn't reliably resolve the app's tsconfig path aliases, and this shape
// only needs to track the persisted GameState/GameSettings fields that
// matter for e2e seeding (src/types/game.ts, src/store/gameStore.ts).
type SettingsOverrides = Partial<{
  soundEnabled: boolean;
  reducedMotion: boolean;
  dyslexiaFriendlyFont: boolean;
  challengeMode: boolean;
  heroSkin: 'bolt' | 'titan' | 'comet' | 'aegis' | 'mystic' | 'blaze';
  heroCharacter: 'boy' | 'girl';
  difficulty: 'chill' | 'challenge';
}>;

/**
 * Seed a fresh browsing context with a valid in-progress adventure, bypassing
 * PlayerSetupScreen (/setup). Writes directly to the zustand-persist
 * localStorage key ('isq-game-state-v1') that src/store/gameStore.ts reads
 * on boot, using addInitScript so the value exists before the app bundle
 * (and the store it creates at module scope) ever runs.
 *
 * Must match GameState (src/types/game.ts) exactly — in particular
 * settings.difficulty ('chill' | 'challenge'), added in Task 3, is required
 * or the seeded state fails validation against current types.
 */
export async function seedAdventure(page: Page, settingsOverrides: SettingsOverrides = {}): Promise<void> {
  await page.addInitScript((overrides) => {
    const state = {
      schemaVersion: 2,
      adventureId: 'e2e-test-adventure',
      teamName: 'Testers',
      players: [
        { id: 'p1', displayName: 'Alex', role: 'inventor', avatarId: 'avatar-1' },
        { id: 'p2', displayName: 'Sam', role: 'pathfinder', avatarId: 'avatar-2' },
      ],
      teamStats: { discovery: 0, kindness: 0, creativity: 0, ingenuity: 0 },
      completedQuestIds: [],
      unlockedLocationIds: ['beaconCourtyard', 'turtleglassLagoon', 'sunlineTram', 'hallOfEchoes'],
      collectedLensIds: [],
      unlockedBadgeIds: [],
      journalEntries: [],
      settings: {
        soundEnabled: true,
        reducedMotion: false,
        dyslexiaFriendlyFont: false,
        challengeMode: false,
        heroSkin: 'bolt',
        heroCharacter: 'boy',
        difficulty: 'chill',
        ...overrides,
      },
      worldProgress: {},
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem('isq-game-state-v1', JSON.stringify({ state, version: 2 }));
  }, settingsOverrides);
}
