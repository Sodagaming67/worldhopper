import type { Line } from '@/components/ui/DialogueBox';

// Short, paced, characterful scene scripts (1–2 sentences per line) that replace
// the long paragraph intros. Keeps reading light and gives each scene a cast.

export const HOME_GREETING: Line[] = [
  { speaker: 'nori', text: 'Welcome, explorers! I’m Nori, helper of the Summer Signals Festival.' },
  { speaker: 'glint', text: 'Ooh, so many pretty lights! I’ll keep them safe — zoooom!' },
  { speaker: 'nori', text: 'That’s Glint. Kind heart… not great at returning borrowed things.' },
  { speaker: 'beaconkeeper', text: 'Recover the seven Signal Lenses before the last sunset. Explore kindly!' },
];

// Per-quest scripts (keyed by quest id). Each ends right before the objective UI.
export const QUEST_DIALOGUE: Record<string, Line[]> = {
  ch1: [
    { speaker: 'nori', text: 'A teal glow is shimmering in the lagoon — that’s a Signal Lens!' },
    { speaker: 'glint', text: 'I only borrowed it for the sparkly ripples. Promise!' },
    { speaker: 'nori', text: 'It hides from anyone who rushes. Slow down and look kindly.' },
  ],
  ch2: [
    { speaker: 'beaconkeeper', text: '*crackle* …gold lens hopping between tram stations…' },
    { speaker: 'beaconkeeper', text: 'Start by the sea-facing gate. The palace sits between first and last.' },
    { speaker: 'nori', text: 'Put the stations in order and the Route Lens is ours.' },
  ],
  ch3: [
    { speaker: 'nori', text: 'The violet lens is here in the Hall of Echoes, hiding in plain sight.' },
    { speaker: 'glint', text: 'It likes art and stories, not treasure hunts!' },
    { speaker: 'nori', text: 'Notice something, then tell me the idea it gives you.' },
  ],
  ch4: [
    { speaker: 'glint', text: 'The coral lens LOVES brave steps! Watch this — whee!' },
    { speaker: 'nori', text: 'Oh no, it bounced into the Splashbridge Basin.' },
    { speaker: 'nori', text: 'A brave step is whatever you choose. Ready?' },
  ],
  ch5: [
    { speaker: 'nori', text: 'The blue lens powers the beacon’s “together” message.' },
    { speaker: 'beaconkeeper', text: 'Four water paths… guide them to one shared fountain.' },
    { speaker: 'nori', text: 'Take turns — no one goes twice in a row!' },
  ],
  ch6: [
    { speaker: 'nori', text: 'The amber lens is shy. It only appears for careful listeners.' },
    { speaker: 'glint', text: 'Shhh… pick something to listen for, then tell us the mood.' },
  ],
  ch7: [
    { speaker: 'glint', text: 'The last lens! It comes when you MAKE a memory, not find a treasure.' },
    { speaker: 'nori', text: 'Build a little sunset to keep. There’s no wrong way.' },
  ],
  finale: [
    { speaker: 'glint', text: 'I thought the best sunset was one I could keep all to myself…' },
    { speaker: 'nori', text: 'The best adventures are the ones we share, Glint.' },
    { speaker: 'beaconkeeper', text: 'Place each lens and name its lesson. Relight the Wayfinder!' },
  ],
};

// Short celebration line shown on the reward screen, per quest.
export const REWARD_LINE: Record<string, Line> = {
  ch1: { speaker: 'nori', text: 'You looked closely and chose kindly. The Tide Lens is yours!' },
  ch2: { speaker: 'beaconkeeper', text: '*happy static* Route found! The gold lens is recovered.' },
  ch3: { speaker: 'glint', text: 'What a lovely eye you have! The Echo Lens glows for you.' },
  ch4: { speaker: 'glint', text: 'So brave! The coral Spark Lens zips right to you.' },
  ch5: { speaker: 'nori', text: 'Beautiful teamwork — the water flows and the Flow Lens is ours!' },
  ch6: { speaker: 'nori', text: 'Thank you for listening. The amber Lantern Lens glows warm.' },
  ch7: { speaker: 'glint', text: 'You made a memory! The rose Sunset Lens is the last one!' },
  finale: { speaker: 'beaconkeeper', text: 'The Wayfinder shines — because you shared a whole week of moments.' },
};
