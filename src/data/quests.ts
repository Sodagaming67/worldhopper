import type { Quest } from '@/types/game';

// One quest per story chapter (id matches the chapter id). Every story chapter is
// a hop-and-collect movement level (themed per location); the finale is a manual
// ceremony. Every quest still has an `alternateObjective` so it's completable with
// no real-world activity (spec §11). "Teamwork" rewards map to `ingenuity`.

export const QUESTS: Quest[] = [
  {
    id: 'ch1',
    chapterId: 'ch1',
    locationId: 'turtleglassLagoon',
    title: 'The Quiet Shell',
    intro:
      'Nori detects a teal glow in the lagoon. Glint left shimmering ripples — and a trail of shells across the stepping stones.',
    onSiteObjective:
      'With an adult and all posted rules followed, watch the lagoon for two minutes. Each player notices one detail: a color, a reflection, a water sound, a leaf, or a wave pattern.',
    alternateObjective:
      'Swim the Turtleglass Lagoon, collect every pearl, and dodge the reef creatures to free the Tide Lens.',
    completionMode: 'miniGame',
    miniGameType: 'tidePools',
    levelIndex: 0,
    safetyNote:
      'Animals are neighbors, not game pieces. Watch from a respectful distance, never touch or feed wildlife, and follow staff guidance and posted signs.',
    reward: { lensId: 'tideLens', badgeId: 'reefRespecter', stats: { kindness: 2 } },
    journalPrompt: 'What was one small detail you would have missed if you rushed?',
  },
  {
    id: 'ch2',
    chapterId: 'ch2',
    locationId: 'sunlineTram',
    title: 'The Station That Moved',
    intro:
      'The gold lens hops between tram stations on Glint’s breeze, scattering golden tickets along the track.',
    onSiteObjective:
      'Find any tram stop with an adult and write down one interesting detail. Optional: photograph a sign only where permitted, without blocking guests or staff.',
    alternateObjective:
      'Ride the Sunline tram — jump the barriers and collect the gold tickets all the way to the next stop.',
    completionMode: 'miniGame',
    miniGameType: 'sunlineRush',
    levelIndex: 0,
    reward: { lensId: 'routeLens', badgeId: 'signalNavigator', stats: { discovery: 2 } },
    journalPrompt: 'What makes a place easier to find: a sign, a map, a landmark, or a person?',
  },
  {
    id: 'ch3',
    chapterId: 'ch3',
    locationId: 'hallOfEchoes',
    title: 'Echoes in the Hall',
    intro:
      'The violet lens hides among the art of the Hall of Echoes, scattering glowing echo orbs along the gallery pedestals.',
    onSiteObjective:
      'Find a work of art, sculpture, pattern, plant texture, or detail that catches your eye. Don’t touch artwork or block other visitors. Give it a short title.',
    alternateObjective:
      'Tap the glowing echo orbs as they appear in the hall to reveal the Echo Lens.',
    completionMode: 'miniGame',
    miniGameType: 'apocalypse',
    levelIndex: 0,
    reward: { lensId: 'echoLens', badgeId: 'memoryMaker', stats: { creativity: 2 } },
    journalPrompt: 'Name your discovery as if it were an exhibit in your own museum.',
  },
  {
    id: 'ch4',
    chapterId: 'ch4',
    locationId: 'splashbridgeBasin',
    title: 'The Bridge of Brave Steps',
    intro:
      'Glint tells Nori the coral lens “loves brave steps,” then sends it bouncing across the Splashbridge Basin.',
    onSiteObjective:
      'Choose a safe, family-approved brave step: try a pool activity, ask a polite question, take a new route, or just put your feet in the water. You decide what brave means.',
    alternateObjective:
      'Hop across the Splashbridge, collect the coral sparks, and reach the flag.',
    completionMode: 'miniGame',
    miniGameType: 'braveSteps',
    levelIndex: 0,
    reward: { lensId: 'sparkLens', badgeId: 'braveExplorer', stats: { discovery: 1, creativity: 1 } },
    journalPrompt: 'What did you try, or what might you like to try another day?',
  },
  {
    id: 'ch5',
    chapterId: 'ch5',
    locationId: 'fourfoldSprings',
    title: 'The Fourfold Flow',
    intro:
      'The blue lens powers the Beacon’s “together” message, sending water drops bubbling up the fountains.',
    onSiteObjective:
      'Each player names a water sound, shape, or movement nearby. Together, make one combined “water story” using all of your observations.',
    alternateObjective:
      'Swim the Fourfold Springs, collect every pearl, and dodge the currents to gather the water drops.',
    completionMode: 'miniGame',
    miniGameType: 'tidePools',
    levelIndex: 1,
    reward: { lensId: 'flowLens', badgeId: 'currentCrew', stats: { ingenuity: 3 } },
    journalPrompt: 'What was easier because someone else helped?',
  },
  {
    id: 'ch6',
    chapterId: 'ch6',
    locationId: 'lanternEvening',
    title: 'The Lantern Listens',
    intro:
      'The amber lens is quiet in the lantern-lit evening, its glow scattered into floating lantern lights.',
    onSiteObjective:
      'Before an evening event, dinner, or sunset walk, choose one listening intention — a rhythm, an instrument, a story, a movement, or a feeling. Afterward, share one sentence of appreciation.',
    alternateObjective:
      'Run the lantern-lit path — jump the barriers and gather the glowing lights to brighten the evening.',
    completionMode: 'miniGame',
    miniGameType: 'sunlineRush',
    levelIndex: 1,
    safetyNote:
      'This chapter is about listening and reflecting respectfully — not hunting for words or treating performances as clues.',
    reward: { lensId: 'lanternLens', badgeId: 'goodListener', stats: { kindness: 1, discovery: 1 } },
    journalPrompt: 'What is one thing you appreciated about tonight?',
  },
  {
    id: 'ch7',
    chapterId: 'ch7',
    locationId: 'palmwindPaths',
    title: 'The Sunset Nobody Keeps',
    intro:
      'The final lens waits in the garden paths, where Glint has scattered the colors of summer into bright blooms.',
    onSiteObjective:
      'Create one shared sunset memory: a family photo, a short video, a four-person pose, a two-sentence story, or a drawing. Photos are always optional.',
    alternateObjective:
      'Find your way through the garden paths, collect every bloom, then reach the ★ exit.',
    completionMode: 'miniGame',
    miniGameType: 'braveSteps',
    levelIndex: 2,
    reward: { lensId: 'sunsetLens', badgeId: 'sunsetKeeper', stats: { creativity: 3 } },
    journalPrompt: 'What is one moment from this trip you want to remember when you are home?',
  },
  {
    id: 'finale',
    chapterId: 'finale',
    locationId: 'beaconCourtyard',
    title: 'Relight the Wayfinder',
    intro:
      'At sunset the team returns with all seven lenses. Glint hovers above the beacon, looking smaller than before. “The best adventures are the ones we share,” says Nori.',
    onSiteObjective:
      'Place each lens into the beacon and name the lesson it carries.',
    alternateObjective:
      'Put the festival’s seven lessons in the order you learned them to relight the Wayfinder Beacon.',
    completionMode: 'manual',
    reward: { badgeId: 'journalKeeper', stats: { creativity: 1, kindness: 1, discovery: 1, ingenuity: 1 } },
    journalPrompt: 'What is one moment from this whole adventure you want to remember?',
  },
];

export const QUEST_BY_ID: Record<string, Quest> = Object.fromEntries(
  QUESTS.map((q) => [q.id, q]),
);

export const QUEST_BY_LOCATION = QUESTS.reduce<Record<string, Quest>>((acc, q) => {
  if (!acc[q.locationId]) acc[q.locationId] = q;
  return acc;
}, {});
