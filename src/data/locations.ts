import type { Location, LocationId } from '@/types/game';

// All nine map zones (spec §7). `mapPosition` places the region on the SVG map
// (percentages of the viewBox, top-left origin).
export type MapLocation = Location & {
  mapPosition: { x: number; y: number };
  shortLabel: string;
  accent: string; // CSS color var for the region
};

export const LOCATIONS: MapLocation[] = [
  {
    id: 'beaconCourtyard',
    name: 'Beacon Courtyard',
    shortLabel: 'Courtyard',
    description: 'The festival hub — story updates, team stats, and the Wayfinder Beacon itself.',
    realWorldInspiration: 'Main lobby / central resort area',
    mapPosition: { x: 50, y: 52 },
    accent: 'var(--color-sun-gold)',
  },
  {
    id: 'turtleglassLagoon',
    name: 'Turtleglass Lagoon',
    shortLabel: 'Lagoon',
    description: 'A calm, glassy lagoon where teal light ripples just beneath the surface.',
    realWorldInspiration: 'Ocean-fed saltwater lagoon',
    mapPosition: { x: 22, y: 28 },
    accent: 'var(--color-tide)',
  },
  {
    id: 'sunlineTram',
    name: 'Sunline Tram',
    shortLabel: 'Tram',
    description: 'A breezy tram line linking three beacon stations across the village.',
    realWorldInspiration: 'Resort trams and tower stops',
    mapPosition: { x: 76, y: 24 },
    accent: 'var(--color-route)',
  },
  {
    id: 'hallOfEchoes',
    name: 'Hall of Echoes',
    shortLabel: 'Hall',
    description: 'A long walkway of art and patterns where the violet lens hides in plain sight.',
    realWorldInspiration: 'Museum Walkway',
    mapPosition: { x: 50, y: 16 },
    accent: 'var(--color-echo)',
  },
  {
    id: 'splashbridgeBasin',
    name: 'Splashbridge Basin',
    shortLabel: 'Basin',
    description: 'A playful basin crossed by a rope bridge — the home of brave steps.',
    realWorldInspiration: 'Kona Pool, waterslide, rope bridge',
    mapPosition: { x: 26, y: 70 },
    accent: 'var(--color-spark)',
  },
  {
    id: 'fourfoldSprings',
    name: 'Fourfold Springs',
    shortLabel: 'Springs',
    description: 'Four connected pools that flow as one when the team works together.',
    realWorldInspiration: 'Kohala Pool, interconnected pools',
    mapPosition: { x: 74, y: 64 },
    accent: 'var(--color-flow)',
  },
  {
    id: 'palmwindPaths',
    name: 'Palmwind Paths',
    shortLabel: 'Paths',
    description: 'Winding garden paths full of textures, sounds, and the colors of summer.',
    realWorldInspiration: 'Resort gardens and walkways',
    mapPosition: { x: 50, y: 84 },
    accent: 'var(--color-lagoon)',
  },
  {
    id: 'lanternEvening',
    name: 'Lantern Evening',
    shortLabel: 'Lanterns',
    description: 'A warm amber evening for listening closely and appreciating the moment.',
    realWorldInspiration: 'Optional evening cultural activity',
    mapPosition: { x: 86, y: 46 },
    accent: 'var(--color-lantern)',
  },
  {
    id: 'outerIslandExpeditions',
    name: 'Outer-Island Expeditions',
    shortLabel: 'Expeditions',
    description: 'Optional bonus adventures around the wider island. Pure journal joy.',
    realWorldInspiration: 'Big Island excursions',
    mapPosition: { x: 12, y: 50 },
    accent: 'var(--color-plumeria-violet)',
  },
];

export const LOCATION_BY_ID: Record<LocationId, MapLocation> = Object.fromEntries(
  LOCATIONS.map((l) => [l.id, l]),
) as Record<LocationId, MapLocation>;
