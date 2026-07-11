import type { SkinId } from '@/game/kit/skins';

export type MiniGameProps = {
  onComplete: () => void;
  reducedMotion: boolean;
  skin: SkinId;
};
