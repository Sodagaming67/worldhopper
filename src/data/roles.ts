import type { Role } from '@/types/game';

export type RoleInfo = {
  id: Role;
  name: string;
  strength: string;
  signatureAction: string;
  storyRole: string;
  icon: string; // Lucide icon name
};

// Roles help but never exclude — every player can make any choice (spec §4).
export const ROLES: RoleInfo[] = [
  {
    id: 'inventor',
    name: 'Inventor',
    strength: 'Logic and systems',
    signatureAction: 'Field Fix',
    storyRole: 'Decodes mechanisms, repairs beacon devices, finds shortcuts.',
    icon: 'wrench',
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    strength: 'Story and discovery',
    signatureAction: 'Story Sight',
    storyRole: 'Notices clues, unlocks dialogue, finds hidden paths.',
    icon: 'sparkles',
  },
  {
    id: 'oceanGuardian',
    name: 'Ocean Guardian',
    strength: 'Care and knowledge',
    signatureAction: 'Gentle Guide',
    storyRole: 'Resolves wildlife and kindness challenges, interprets clues.',
    icon: 'shell',
  },
  {
    id: 'trailRanger',
    name: 'Trail Ranger',
    strength: 'Navigation and teamwork',
    signatureAction: 'Route Sense',
    storyRole: 'Plans routes, solves map puzzles, helps the group cross obstacles.',
    icon: 'map-pinned',
  },
];

export const ROLE_BY_ID: Record<Role, RoleInfo> = Object.fromEntries(
  ROLES.map((r) => [r.id, r]),
) as Record<Role, RoleInfo>;

// Editable team emblems (spec §8 Chapter 0). Lucide icon names.
export type Emblem = { id: string; name: string; icon: string };
export const EMBLEMS: Emblem[] = [
  { id: 'wave', name: 'Wave', icon: 'waves' },
  { id: 'star', name: 'Star', icon: 'star' },
  { id: 'shell', name: 'Shell', icon: 'shell' },
  { id: 'compass', name: 'Compass', icon: 'compass' },
  { id: 'palm', name: 'Palm', icon: 'tree-palm' },
  { id: 'robot', name: 'Robot', icon: 'bot' },
];
