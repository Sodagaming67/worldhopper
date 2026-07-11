/**
 * useGameAudio — Phase 5 audio hook
 *
 * Manages looping overworld music and SFX sprites via Howler.
 * - Music starts/stops based on settings.soundEnabled.
 * - SFX sprites are triggered by 'sfx' EventBus events (only when sound is on).
 * - Howl instances are cleaned up on unmount.
 *
 * DO NOT instantiate Howl in unit tests (jsdom has no AudioContext).
 * This hook is integrated in Phase 6 (MapScreen) — not here.
 *
 * SFX sprite offsets (startMs, durationMs):
 *   select : [0,   120]  — 120 ms @ 660 Hz
 *   arrive : [500, 200]  — 200 ms @ 880 Hz, starts at 500 ms
 */

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { EventBus } from '@/game/EventBus';
import { asset } from '@/game/assets';
import { useGameStore } from '@/store/gameStore';
import type { GameEvents } from '@/game/events';

/** Howler sprite definition: [startMs, durationMs] */
type SpriteMap = Record<string, [number, number]>;

const SFX_SPRITE: SpriteMap = {
  select: [0, 120],
  arrive: [500, 200],
};

// The placeholder overworld track is a bare synth tone — looping it is grating.
// Keep the music plumbing wired (so a real track drops in by flipping this flag),
// but do NOT autoplay the placeholder. SFX blips stay enabled; they are short and
// only fire on interaction.
// TODO: replace public/game/audio/overworld.wav with a real music track before
// flipping this to true.
const MUSIC_ENABLED = false;
// Quiet, non-fatiguing levels for the placeholder blips.
const SFX_VOLUME = 0.25;

export function useGameAudio(): void {
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);
  const musicRef = useRef<Howl | null>(null);
  const sfxRef = useRef<Howl | null>(null);

  // Mount SFX Howl once; unmount on cleanup.
  useEffect(() => {
    sfxRef.current = new Howl({
      src: [asset('audio/sfx.wav')],
      sprite: SFX_SPRITE,
      volume: SFX_VOLUME,
    });

    const onSfx = (p: GameEvents['sfx']): void => {
      if (useGameStore.getState().settings.soundEnabled) {
        sfxRef.current?.play(p.key);
      }
    };

    EventBus.on('sfx', onSfx);

    return () => {
      EventBus.off('sfx', onSfx);
      sfxRef.current?.unload();
      sfxRef.current = null;
    };
  }, []);

  // Start/stop music whenever soundEnabled toggles.
  useEffect(() => {
    if (soundEnabled && MUSIC_ENABLED) {
      if (!musicRef.current) {
        musicRef.current = new Howl({
          src: [asset('audio/overworld.wav')],
          loop: true,
          volume: 0.4,
        });
        musicRef.current.play();
      }
    } else {
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current.unload();
        musicRef.current = null;
      }
    }

    return () => {
      // Cleanup on unmount (soundEnabled may be true or false — always tear down).
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current.unload();
        musicRef.current = null;
      }
    };
  }, [soundEnabled]);
}
