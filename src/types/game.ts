import type { SkinId } from '@/game/kit/skins';

export type Role = 'inventor' | 'pathfinder' | 'oceanGuardian' | 'trailRanger';

export type TeamStats = {
  discovery: number;
  kindness: number;
  creativity: number;
  ingenuity: number;
};

export type Player = {
  id: string;
  displayName: string;
  role: Role;
  avatarId: string;
};

export type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type LensId =
  | 'tideLens'
  | 'routeLens'
  | 'echoLens'
  | 'sparkLens'
  | 'flowLens'
  | 'lanternLens'
  | 'sunsetLens';

export type BadgeId =
  | 'reefRespecter'
  | 'signalNavigator'
  | 'memoryMaker'
  | 'braveExplorer'
  | 'currentCrew'
  | 'goodListener'
  | 'sunsetKeeper'
  | 'tramTracker'
  | 'colorCollector'
  | 'familyCartographer'
  | 'kindnessCaptain'
  | 'journalKeeper';

export type LocationId =
  | 'beaconCourtyard'
  | 'hallOfEchoes'
  | 'sunlineTram'
  | 'turtleglassLagoon'
  | 'splashbridgeBasin'
  | 'fourfoldSprings'
  | 'palmwindPaths'
  | 'lanternEvening'
  | 'outerIslandExpeditions';

export type JournalEntry = {
  id: string;
  chapterId: string;
  createdAt: string;
  title: string;
  reflection?: string;
  mediaRef?: string; // key into IndexedDB — never store base64 here
};

export type GameSettings = {
  soundEnabled: boolean;
  reducedMotion: boolean;
  dyslexiaFriendlyFont: boolean;
  challengeMode: boolean;
  heroSkin: SkinId;
  heroCharacter: 'boy' | 'girl';
  difficulty: 'chill' | 'challenge';
};

export type WorldProgress = { stars: number; bestScore: number; cleared: boolean };

export type GameState = {
  schemaVersion: 2;
  adventureId: string;
  teamName: string;
  players: Player[];
  teamStats: TeamStats;
  completedQuestIds: string[];
  unlockedLocationIds: LocationId[];
  collectedLensIds: LensId[];
  unlockedBadgeIds: BadgeId[];
  journalEntries: JournalEntry[];
  settings: GameSettings;
  worldProgress: Partial<Record<import('@/game/data/worlds').IslandWorldId, WorldProgress>>;
  updatedAt: string;
};

// Content types

export type QuestChoice = {
  id: string;
  label: string;
  resultText: string;
  icon?: string; // Lucide icon name for a picture-led choice card
  isCorrect?: boolean;
  statRewards?: Partial<TeamStats>;
  unlocksBadgeId?: BadgeId;
};

export type MiniGameType =
  | 'braveSteps'
  | 'tidePools'
  | 'sunlineRush'
  | 'apocalypse';

export type CompletionMode = 'manual' | 'choice' | 'miniGame';

export type Quest = {
  id: string;
  chapterId: string;
  locationId: LocationId;
  title: string;
  intro: string;
  onSiteObjective: string;
  alternateObjective: string;
  completionMode: CompletionMode;
  miniGameType?: MiniGameType;
  levelIndex?: number; // which themed level an arcade game starts on
  choices?: QuestChoice[];
  safetyNote?: string;
  reward: {
    lensId?: LensId;
    badgeId?: BadgeId;
    stats: Partial<TeamStats>;
    unlockLocationIds?: LocationId[];
  };
  journalPrompt: string;
};

export type Location = {
  id: LocationId;
  name: string;
  description: string;
  realWorldInspiration: string;
};

export type Lens = {
  id: LensId;
  name: string;
  color: string;
  theme: string;
};

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
};

export type StoryObjective = {
  text: string;
  locationId?: LocationId;
};
