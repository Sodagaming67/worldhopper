import type { MiniGameType } from '@/types/game';
import type { SkinId } from '@/game/kit/skins';
import { PlatformerGame } from './PlatformerGame';
import { DiveGame } from './DiveGame';
import { RushGame } from './RushGame';
import { ApocalypseGame } from './ApocalypseGame';

type Props = {
  type: MiniGameType;
  onComplete: () => void;
  reducedMotion: boolean;
  skin: SkinId; // remembered hero costume
  variant?: string; // locationId — themes the game
  heroColor?: string; // CSS var name for the active player's character
  levelIndex?: number; // which themed level an arcade game starts on
};

export function MiniGame({ type, onComplete, reducedMotion, skin, levelIndex }: Props) {
  switch (type) {
    case 'braveSteps':
      return <PlatformerGame onComplete={onComplete} reducedMotion={reducedMotion} skin={skin} levelIndex={levelIndex} />;
    case 'tidePools':
      return <DiveGame onComplete={onComplete} reducedMotion={reducedMotion} skin={skin} levelIndex={levelIndex} />;
    case 'sunlineRush':
      return <RushGame onComplete={onComplete} reducedMotion={reducedMotion} skin={skin} levelIndex={levelIndex} />;
    case 'apocalypse':
      return <ApocalypseGame onComplete={onComplete} reducedMotion={reducedMotion} skin={skin} levelIndex={levelIndex} />;
    default:
      return null;
  }
}
