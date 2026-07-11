export type Character = {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
};

// Original fictional cast (spec §5). No real cultural figures.
export const CHARACTERS: Character[] = [
  {
    id: 'glint',
    name: 'Glint',
    description: 'A friendly floating weather-spark shaped like a tiny kite of light. Mischief without menace.',
    icon: 'sparkle',
  },
  {
    id: 'nori',
    name: 'Nori',
    description: 'A cheerful reef-rover helper robot with a shell-shaped scanner. Explains tools and hints.',
    icon: 'bot',
  },
  {
    id: 'beaconkeeper',
    name: 'The Beaconkeeper',
    description: 'A kindly caretaker who speaks through crackly old radio notes.',
    icon: 'radio',
  },
];

export const CHARACTER_BY_ID: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
);

// The opening journal line shown after onboarding (spec §5 prologue).
export const FIRST_CLUE = 'The first light rests where water meets wonder.';
