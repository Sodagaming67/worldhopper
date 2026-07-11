import { useGameStore } from '@/store/gameStore';

export function useReducedMotion(): boolean {
  const settingEnabled = useGameStore((s) => s.settings.reducedMotion);
  const osPrefers =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return settingEnabled || osPrefers;
}
