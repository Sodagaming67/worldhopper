/** Big Island Arcade world map (spec §4) — 8 stops tracing the real trip. */
export type IslandWorldId =
  | 'lagoon' | 'poolSlides' | 'tramDash' | 'reef'
  | 'blackSand' | 'lavaTube' | 'lavaFlow' | 'kilauea';

export type WorldGenre = 'platformer' | 'slide' | 'runner' | 'swim' | 'puzzle';

export type IslandWorld = {
  id: IslandWorldId;
  number: string; // display: '1'..'7', '6.5'
  name: string;
  place: string; // the real trip location it memorializes
  genre: WorldGenre;
  introLine: string; // Nori's single skippable line (spec §8)
  status: 'ready' | 'soon';
  /**
   * Map node position, % of the painted island image (bg-map.png, issue #24)
   * — the map screen anchors nodes to an image-fitted stage, so these track
   * the painted terrain (coast, volcanoes) at every viewport aspect ratio.
   */
  node: { x: number; y: number };
};

export const WORLDS: IslandWorld[] = [
  {
    id: 'lagoon', number: '1', name: 'Lagoon of First Light',
    place: 'Waikoloa saltwater lagoon', genre: 'platformer', status: 'ready',
    introLine: 'The first beacon sleeps by the lagoon. Wake it gently — the Kakamora are already ashore!',
    node: { x: 16, y: 24 }, // NW sand cove on the dry leeward coast
  },
  {
    id: 'poolSlides', number: '2', name: 'Sunsplash Slides',
    place: 'Kona pool waterslides', genre: 'slide', status: 'ready',
    introLine: 'The second beacon hides below the slides. Ride fast — momentum is everything!',
    node: { x: 14, y: 39 }, // resort coast south of the lagoon
  },
  {
    id: 'tramDash', number: '3', name: 'Sunline Tram Dash',
    place: 'The resort tram', genre: 'runner', status: 'ready',
    introLine: 'The Kakamora boarded the tram! Chase it down the Sunline before they reach the front car!',
    node: { x: 32, y: 33 }, // dry golden upland behind the resorts
  },
  {
    id: 'reef', number: '4', name: 'Kahaluʻu Reef',
    place: 'Kahaluʻu Beach Park snorkeling', genre: 'swim', status: 'ready',
    introLine: 'A beacon glows under the reef. Swim with the fish — and mind the eels.',
    node: { x: 13, y: 53 }, // right on the west shoreline — snorkel water
  },
  {
    id: 'blackSand', number: '5', name: 'Punaluʻu Black Sands',
    place: 'Punaluʻu Black Sand Beach', genre: 'platformer', status: 'ready',
    introLine: 'Turtle hatchlings are marching to the sea — and the Kakamora want the beacon on the dunes!',
    node: { x: 39, y: 84 }, // south coast black-lava coves
  },
  {
    id: 'lavaTube', number: '6', name: 'Nāhuku Dark Tube',
    place: 'Nāhuku (Thurston Lava Tube)', genre: 'platformer', status: 'soon',
    introLine: 'The tube swallows all light. Listen — Kakamora drums in the dark…',
    node: { x: 67, y: 66 }, // deep windward jungle east of the volcanoes
  },
  {
    id: 'lavaFlow', number: '6.5', name: 'Lava Flow Builder',
    place: 'How the Big Island grows', genre: 'puzzle', status: 'soon',
    introLine: 'Pele is building new land tonight. Stack the cooling stone before the lava climbs!',
    node: { x: 58, y: 56 }, // SE flank of the lava mountain, where new land grows
  },
  {
    id: 'kilauea', number: '7', name: 'Kīlauea Ascent',
    place: 'Hawaiʻi Volcanoes National Park', genre: 'platformer', status: 'ready',
    introLine: "The island's heart burns too hot — the Lava Witch holds the last beacon. Climb. Don't stop.",
    node: { x: 50, y: 44 }, // upper slope of the lava mountain — the final climb
  },
];

export const WORLD_BY_ID = Object.fromEntries(WORLDS.map((w) => [w.id, w])) as Record<IslandWorldId, IslandWorld>;
