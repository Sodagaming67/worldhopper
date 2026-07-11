import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';

describe('challengeMode setting', () => {
  beforeEach(() => {
    useGameStore.getState().resetAdventure();
  });

  it('defaults to false', () => {
    expect(useGameStore.getState().settings.challengeMode).toBe(false);
  });

  it('can be toggled on via updateSettings', () => {
    useGameStore.getState().updateSettings({ challengeMode: true });
    expect(useGameStore.getState().settings.challengeMode).toBe(true);
  });
});
