/** In-game art credits. Source of truth: docs/game/ATTRIBUTION.md — keep in sync. */
export type ArtCredit = { title: string; author: string; license: string; url: string };

export const ART_CREDITS: ArtCredit[] = [
  {
    title: 'Underwater World Parallax Backgrounds',
    author: 'CraftPix.net 2D Game Assets',
    license: 'OGA-BY 3.0',
    url: 'https://opengameart.org/content/underwater-world-parallax-backgrounds',
  },
  {
    title: 'Fish Pack 2.0',
    author: 'Kenney (kenney.nl)',
    license: 'CC0',
    url: 'https://opengameart.org/content/fish-pack-0',
  },
  {
    title: 'Cartoon Jelly Fish',
    author: 'overcrafted',
    license: 'CC0',
    url: 'https://opengameart.org/content/cartoon-jelly-fish',
  },
];
