import { useEffect, type ReactNode } from 'react';
import { useGameStore } from '@/store/gameStore';

// Applies persisted accessibility settings to the document root (spec §12).
export function SettingsEffects({ children }: { children: ReactNode }) {
  const dyslexia = useGameStore((s) => s.settings.dyslexiaFriendlyFont);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  useEffect(() => {
    document.documentElement.dataset.dyslexia = String(dyslexia);
  }, [dyslexia]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
  }, [reducedMotion]);

  return <>{children}</>;
}
