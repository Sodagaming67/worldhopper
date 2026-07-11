import type { Badge, BadgeId } from '@/types/game';

// Lucide icon names paired with each badge (rendered by the BadgeGrid).
export const BADGES: Badge[] = [
  { id: 'reefRespecter', name: 'Reef Respecter', description: 'Gave wildlife space and kept the lagoon clean.', icon: 'fish' },
  { id: 'signalNavigator', name: 'Signal Navigator', description: 'Read the clues and found the right route.', icon: 'compass' },
  { id: 'memoryMaker', name: 'Memory Maker', description: 'Turned a small detail into a work of art.', icon: 'palette' },
  { id: 'braveExplorer', name: 'Brave Explorer', description: 'Tried a brave step, your way.', icon: 'footprints' },
  { id: 'currentCrew', name: 'Current Crew', description: 'Worked together to guide the water home.', icon: 'waves' },
  { id: 'goodListener', name: 'Good Listener', description: 'Listened closely and appreciated the moment.', icon: 'ear' },
  { id: 'sunsetKeeper', name: 'Sunset Keeper', description: 'Made a shared memory to keep forever.', icon: 'sunset' },
  { id: 'tramTracker', name: 'Tram Tracker', description: 'Followed the Sunline Tram from end to end.', icon: 'train-front' },
  { id: 'colorCollector', name: 'Color Collector', description: 'Gathered the colors of summer.', icon: 'rainbow' },
  { id: 'familyCartographer', name: 'Family Cartographer', description: 'Mapped Sunspire Village together.', icon: 'map' },
  { id: 'kindnessCaptain', name: 'Kindness Captain', description: 'Led with kindness again and again.', icon: 'heart-handshake' },
  { id: 'journalKeeper', name: 'Journal Keeper', description: 'Filled the Field Journal with memories.', icon: 'book-heart' },
];

export const BADGE_BY_ID: Record<BadgeId, Badge> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
) as Record<BadgeId, Badge>;
