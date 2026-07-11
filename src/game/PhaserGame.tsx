import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { makeConfig } from './config';

type Props = {
  scenes: Phaser.Types.Scenes.SceneType[];
  registry?: Record<string, unknown>;
};

export function PhaserGame({ scenes, registry }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    const callbacks = registry
      ? {
          preBoot: (game: Phaser.Game) => {
            Object.entries(registry).forEach(([k, v]) => game.registry.set(k, v));
          },
        }
      : undefined;

    gameRef.current = new Phaser.Game(makeConfig(hostRef.current, scenes, callbacks));
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // NOTE: callers MUST pass stable references for `scenes`/`registry` (useMemo
    // or a ref). An inline literal here would tear down and rebuild the whole
    // Phaser game on every parent render.
  }, [scenes, registry]);

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} aria-hidden />;
}
