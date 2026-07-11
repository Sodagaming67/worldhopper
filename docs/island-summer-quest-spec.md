# Island Summer Quest: The Seven Signals

**Product / game title:** *Island Summer Quest: The Seven Signals*  
**Repository name:** `island-summer-quest`  
**Type:** Offline-friendly, cooperative family web RPG and vacation-journal game  
**Primary setting:** A fictional summer-adventure world inspired by a family stay at Hilton Waikoloa Village on Hawaiʻi Island  
**Status:** Build-ready MVP specification  
**Version:** 1.0  
**Prepared:** June 23, 2026

---

## 1. Executive Summary

*Island Summer Quest: The Seven Signals* is a gentle, cooperative web RPG for a family of four. It turns a Hawaiʻi vacation into a playable adventure and, afterward, becomes a keepsake scrapbook the children can replay.

The game uses a **fictional resort world** named **Sunspire Village**. Its map and quest structure are inspired by real, family-relevant places at Hilton Waikoloa Village: the museum walkway, air-conditioned resort trams, the ocean-fed saltwater lagoon, Kona Pool, Kohala Pool, resort grounds, cultural activities, and optional island excursions. The app will **not** use hotel logos, copied maps, proprietary images, or wording that implies the game is an official Hilton product.

### Core premise

At the start of a summer celebration, a harmless tropical squall disrupts the **Wayfinder Beacon**—a fictional light-and-sound installation that powers the resort’s discovery journal. Seven colored **Signal Lenses** fly to different areas of Sunspire Village. The family must complete observation, creativity, puzzle, kindness, and exploration quests to recover all seven lenses before the final sunset.

There is no combat. Progress comes from teamwork, curiosity, environmental care, problem solving, storytelling, and real family memories.

### Primary goals

- Give Player A satisfying systems: maps, unlocks, gadgets, logic puzzles, collections, and progression.
- Give Player B satisfying systems: story, characters, choices, drawing prompts, dialogue, and a living journal.
- Make the adults active co-players rather than just helpers.
- Work on a phone or tablet at the resort, including in spotty connectivity.
- Be small enough to build in time for a trip in roughly two weeks.
- Be expandable after the trip without rewriting the foundation.

### Non-goals for version 1

- No multiplayer server, accounts, chat, payments, ads, or public sharing.
- No GPS tracking or required location permissions.
- No real-time character movement, physics, combat, or complex animation.
- No requirement to visit a particular paid activity or remain on a precise itinerary.
- No copying the real resort’s graphical map or brand assets.

---

## 2. Product Principles

1. **Cooperative, never competitive.** Everyone contributes to one family save file and the whole team wins together.
2. **Vacation first.** The app should enhance the trip, not turn it into homework or pull attention away from the place itself.
3. **Playable with or without the real activity.** Every real-world quest has a digital substitute so a closed pool, weather change, skipped excursion, or tired child never blocks the story.
4. **Respect Hawaiʻi.** The game uses original fiction rather than inventing “ancient Hawaiian magic.” Real cultural activities are treated as learning and appreciation experiences, not scavenger-hunt props.
5. **Wildlife-safe by design.** Quests reward observation, respectful distance, and care—not touching, feeding, approaching, or collecting animals.
6. **Low friction.** One-tap “Complete,” optional photos, easy save/continue, large buttons, readable text, and no time pressure.
7. **Memory-rich.** Every completed chapter can add one journal entry, drawing, photo, or family note.

---

## 3. Real-World Inspiration and Fiction Boundary

### Real-world inspiration

Hilton Waikoloa Village describes itself as a 62-acre Kohala Coast resort. Its current resort information highlights air-conditioned trams between MAKAI and Ocean Tower; the Museum Walkway with more than 1,800 art pieces; an ocean-fed saltwater lagoon; Kona and Kohala pools; cultural activities; and Big Island excursions. The app may use these as **location prompts**, subject to on-site conditions and family plans.

### Fictional in-game equivalents

| Real-world inspiration | In-game location | Use in gameplay |
|---|---|---|
| Main Lobby / Museum Walkway | **Hall of Echoes** | Art, pattern, and observation puzzles |
| Resort Tram route | **Sunline Tram** | Route logic and travel unlocks |
| Makai, Palace Tower, Ocean Tower stops | **Three Beacon Stations** | Story progression and map gates |
| Saltwater Lagoon | **Turtleglass Lagoon** | Reef observation, environmental-care quests |
| Kona Pool / rope bridge / waterslide | **Splashbridge Basin** | Courage, coordination, and route puzzles |
| Kohala Pool / connected pools | **Fourfold Springs** | Water-path and teamwork puzzles |
| Luau or evening cultural activity | **Lantern Evening** | Optional reflection, listening, and celebration chapter |
| Resort gardens / paths | **Palmwind Paths** | Photo, sound, and color scavenger-style quests |
| Big Island excursion options | **Outer-Island Expeditions** | Optional bonus chapters only |

### Legal / brand guidance

- Show a small, plain-text note on the About screen: **“Unofficial private family project. Not affiliated with, sponsored by, or endorsed by Hilton or Hilton Waikoloa Village.”**
- Do not use official logos, copyrighted hotel photography, the official resort map, or screenshots from booking pages.
- Use an original illustrated map with generic shapes, landmarks, and icons.
- Keep the real resort name in an optional “Trip Inspiration” section, not in the product logo or code package name.

---

## 4. Players and Roles

The app supports 2–4 players. Player names are editable and should default to friendly role names rather than requiring personal information.

### Recommended family roles

| Player | Role | Strength | Signature action | Role in the story |
|---|---|---|---|---|
| Player A | **Inventor** | Logic and systems | *Field Fix* | Decodes mechanisms, repairs beacon devices, finds shortcuts |
| Player B | **Pathfinder** | Story and discovery | *Story Sight* | Notices clues, unlocks dialogue, finds hidden paths |
| Mom | **Ocean Guardian** | Care and knowledge | *Gentle Guide* | Resolves wildlife and kindness challenges, interprets observation clues |
| Dad | **Trail Ranger** | Navigation and teamwork | *Route Sense* | Plans routes, solves map puzzles, helps the group cross obstacles |

### Design rule: roles must help but never exclude

- Any player can make any choice.
- Role abilities offer a different flavor, bonus hint, or optional reward—not exclusive content required to continue.
- Players can swap roles at any point from Settings.

### Player stats

Use **team stats**, not individual rankings, to keep the game cooperative:

- **Discovery** — observation, facts, navigation
- **Kindness** — helpful choices and care for people/wildlife
- **Creativity** — drawing, storytelling, photo composition
- **Ingenuity** — riddles, patterns, mechanism puzzles

The team gains 1–3 points per quest. Stat levels unlock cosmetic journal pages, optional hints, and final-scene dialogue, never power advantages over another family member.

---

## 5. Narrative Bible

### Tone

Warm, funny, adventurous, summery, and a little mysterious. The story should feel like a family animated film rather than a serious epic. No villains who need to be defeated. No danger that implies players should take real-world risks.

### The central mystery

The Wayfinder Beacon is a fictional installation built for Sunspire Village’s annual **Summer Signals Festival**. It synchronizes the resort’s “Discovery Journal” with seven playful messages about paying attention to the island: water, wind, art, paths, kindness, sound, and sunset.

A tiny curious weather-spark named **Glint** sees the beacon begin to shine and thinks the seven lenses are “lost fireflies.” Glint carries them around the village to make the prettiest sunset possible. The lenses are not stolen out of malice; they are simply misplaced.

The family must collect the lenses, learn what each lens represents, and help Glint understand that the best light is shared, not hidden.

### Primary cast

| Character | Description | Function |
|---|---|---|
| **Glint** | A friendly, original floating weather-spark, shaped like a tiny kite of light | Mischief without menace; leaves glowing clue marks |
| **Nori** | A fictional “reef rover” helper robot with a shell-shaped scanner | Explains inventory, hints, and photo journal tools |
| **The Beaconkeeper** | A cheerful caretaker who communicates through old radio notes | Introduces the mission and final puzzle |
| **The Players** | The family’s four adventurers | Make all meaningful choices |

### The seven Signal Lenses

| Lens | Color cue | Theme | Core activity |
|---|---|---|---|
| Tide Lens | Teal | Care for water and wildlife | Lagoon observation / ethics |
| Route Lens | Gold | Navigation and patterns | Tram / map logic |
| Echo Lens | Violet | Art and memory | Museum walkway / drawing |
| Spark Lens | Coral | Courage and trying | Pool route / challenge choice |
| Flow Lens | Blue | Teamwork | Connected-pool puzzle |
| Lantern Lens | Amber | Listening and appreciation | Optional evening reflection |
| Sunset Lens | Rose | Creativity and sharing | Final photo, story, or drawing |

### Prologue: draft story text

> The first evening at Sunspire Village begins with a soft chime that seems to come from everywhere at once. In the center of the courtyard, a tall glass beacon flickers through seven colors: teal, gold, violet, coral, blue, amber, and rose.
>
> “Welcome, explorers,” says a small round robot peeking from behind a planter. “I’m Nori, official helper of the Summer Signals Festival. Or at least I was—until the Wayfinder Beacon hiccupped.”
>
> The beacon flashes once, twice… then a playful gust of wind swirls through the palms. Seven lights race across the village like fireflies.
>
> A tiny sparkle zips after them, giggling. “So many pretty lights! I’ll keep them safe!”
>
> Nori’s scanner beeps. “That is Glint. Kind heart, very fast, not excellent at returning borrowed things.”
>
> The family’s first journal page appears: **Recover the Seven Signals before the last festival sunset. Explore kindly. Notice carefully. Create boldly.**

### Finale: draft story text

> At sunset, the team returns to the quiet courtyard with all seven lenses. Glint hovers above the beacon, looking smaller than before.
>
> “I thought the best sunset was the one I could keep all to myself,” Glint says.
>
> “The best adventures are the ones we share,” says Nori.
>
> Each player places a lens into the beacon. Teal for care. Gold for curiosity. Violet for memory. Coral for courage. Blue for teamwork. Amber for listening. Rose for creativity.
>
> The Wayfinder Beacon glows—not brighter because of magic, but because the family collected a week of real moments. The final screen opens the **Family Memory Book** and awards the title: **Keepers of the Summer Signals**.

---

## 6. Game Loop

### Primary loop

1. Open the family save file.
2. View the illustrated map.
3. Choose an unlocked location.
4. Read a short scene (30–90 seconds).
5. Select an activity:
   - **On-site quest** — do a real-world, safe observation or family activity.
   - **At-home / anywhere substitute** — solve a puzzle, draw, choose a story action, or take a generic photo.
6. Return to the app and mark the objective complete.
7. Receive a lens fragment, clue, badge, stat points, and journal page.
8. Unlock a new location or final puzzle.

### Session length

- **Quick check-in:** 3–5 minutes
- **One quest:** 8–15 minutes
- **A chapter:** 20–30 minutes spread throughout a day
- **Full game:** 6–10 short sessions over the vacation and after returning home

### Progress gates

- Chapters 1–2 unlock immediately.
- Chapters 3–5 unlock after completing any two of the first three chapters.
- Chapter 6 unlocks after collecting five lenses.
- Final chapter unlocks after all seven lenses are recovered.
- Optional excursions add journal pages and badges but do not change the ending requirement.

---

## 7. Map and Location Design

### Map style

- A top-down, illustrated island-resort map with broad zones rather than a precise navigation map.
- Use large tappable regions, iconography, and clear labels.
- Draw original buildings, paths, palms, water, and tram tracks. Do not trace the actual resort map.
- Each region has one state: `locked`, `available`, `in_progress`, `completed`, or `bonus`.

### Core map zones

#### 1. Beacon Courtyard — hub

**Real-world inspiration:** main lobby / central resort area  
**In-game purpose:** tutorial, story updates, final beacon  
**Unlocks:** immediately

Activities:
- Character selection
- Read Beaconkeeper notes
- View team stats and current objective
- Start or finish chapters

#### 2. Hall of Echoes — art and observation

**Real-world inspiration:** Museum Walkway  
**In-game purpose:** art puzzle and creative journal page  
**Unlocks:** immediately

Quest mechanic:
- Choose an art-pattern prompt: line, shape, texture, animal, or color.
- Players can sketch a five-minute “memory emblem,” take an optional photo of a pattern (without photographing people), or complete a pattern-matching puzzle in the app.

#### 3. Sunline Tram — route and logic

**Real-world inspiration:** Resort trams and their major tower stops  
**In-game purpose:** route puzzle and travel system  
**Unlocks:** immediately

Quest mechanic:
- A visual order puzzle: arrange three to four station cards in the proper travel order.
- On-site version: find a tram stop sign and take a family “route note.”
- Digital substitute: use the in-app map clues.

#### 4. Turtleglass Lagoon — water and care

**Real-world inspiration:** ocean-fed saltwater lagoon  
**In-game purpose:** wildlife-respect quest and observation collection  
**Unlocks:** after tutorial

Quest mechanic:
- Choose the responsible action in three short situations.
- Optional real activity: notice colors, reflections, wave patterns, or fish from a respectful distance.
- Do not require identifying animals or approaching wildlife.

#### 5. Splashbridge Basin — courage and choice

**Real-world inspiration:** Kona Pool, waterslide, rope bridge, sandy children’s area  
**In-game purpose:** route, balance, or “try something new” quest  
**Unlocks:** after any one early chapter

Quest mechanic:
- A simple grid route puzzle that represents crossing a bridge.
- On-site version: choose a safe family activity approved by parents and staff.
- Digital substitute: a rhythm/tap mini-game called “Wave Steps.”

#### 6. Fourfold Springs — teamwork

**Real-world inspiration:** Kohala Pool’s interconnected pools  
**In-game purpose:** cooperative water-flow logic puzzle  
**Unlocks:** after any two early chapters

Quest mechanic:
- Two players choose matching switches to route virtual water to a garden.
- On-site version: observe three connected water features or identify two different water sounds.
- Digital substitute: complete the in-app pipes puzzle.

#### 7. Palmwind Paths — color and memory

**Real-world inspiration:** resort landscaping, walkways, courtyards  
**In-game purpose:** flexible anywhere quest  
**Unlocks:** after any two early chapters

Quest mechanic:
- Capture or describe “three signs of summer”: one texture, one sound, and one color.
- Digital substitute: create a collage from provided art stickers.

#### 8. Lantern Evening — listening and appreciation

**Real-world inspiration:** optional evening cultural activity or luau  
**In-game purpose:** respectful reflection, no scavenger behavior  
**Unlocks:** after five lenses

Quest mechanic:
- Before an optional show/activity, choose a “listening intention,” such as noticing rhythm, instruments, movement, or a story theme.
- Afterward, write or dictate one respectful memory.
- Digital substitute: listen to a short original instrumental loop and choose the mood it creates.

#### 9. Outer-Island Expeditions — optional bonus region

**Real-world inspiration:** family excursions around Hawaiʻi Island, including volcanoes, forests, waterfalls, boat trips, etc.  
**In-game purpose:** photo journal, optional geography, and bonus badges  
**Unlocks:** after the finale

The app must never require an excursion. It can offer generic adventure cards such as:
- “Black-sand and blue-water color study”
- “Cloud observer”
- “Trail kindness check”
- “Family navigator”

---

## 8. Main Story Chapters

Each chapter contains: 1 short scene, 1 main quest, 1 alternate quest, a reward, and a journal prompt. A “Complete without photo” option is always available.

### Chapter 0 — The Beacon Flickers

**Location:** Beacon Courtyard  
**Lens:** none  
**Purpose:** onboarding

- Choose player names and roles.
- Nori introduces the Seven Signals.
- The family chooses their team emblem from editable icons: wave, star, shell, compass, palm, or robot.
- The game gives the **Field Journal** and a first clue: “The first light rests where water meets wonder.”

**Reward:** map unlocked; `Teamwork +1`

---

### Chapter 1 — The Quiet Shell

**Location:** Turtleglass Lagoon  
**Lens:** Tide Lens (teal)

**Scene:** Nori detects a teal glow reflected in the lagoon. Glint left a trail of shimmering ripples, but the clue can only be seen by explorers who slow down and look carefully.

**Primary on-site objective:**
- With adult supervision and all posted rules followed, observe the lagoon for two minutes.
- Each player notices one non-person detail: a color, a reflection, a water sound, a bird, a leaf, a fish shape, or a wave pattern.

**Digital substitute:**
- Complete a “Find the difference” reef illustration.

**Choice challenge:**
- A floating wrapper is near the path. What should the team do?
  1. Tell an adult or staff member / dispose of litter only if it is safe to do so.
  2. Leave it because it is not the team’s job.
  3. Chase an animal to see if it reacts.

The correct cooperative response rewards Kindness and explains why wildlife should be given space.

**Reward:** Tide Lens; `Kindness +2`; badge **Reef Respecter**

**Journal prompt:** “What was one small detail you would have missed if you rushed?”

---

### Chapter 2 — The Station That Moved

**Location:** Sunline Tram  
**Lens:** Route Lens (gold)

**Scene:** The gold lens is caught in Glint’s breeze and appears to hop between stations. The Beaconkeeper’s radio note contains a scrambled route.

**Primary on-site objective:**
- Locate any tram stop with an adult and use it as a place to write down one interesting detail.
- Optional: take a photo of a sign only when it is permitted and without blocking guests or staff.

**Digital substitute:**
- Arrange the three fictional stations—Makai Gate, Palace Rise, Ocean Lookout—in the correct direction based on a map clue.

**Puzzle:**
- “Start beside the sea-facing gate. The palace is between the first and last stop. Which station comes second?”

**Reward:** Route Lens; `Discovery +2`; badge **Signal Navigator**

**Journal prompt:** “What makes a place easier to find: a sign, a map, a landmark, or a person?”

---

### Chapter 3 — Echoes in the Hall

**Location:** Hall of Echoes  
**Lens:** Echo Lens (violet)

**Scene:** The violet lens is hiding in plain sight. It responds not to treasure hunting but to visual storytelling.

**Primary on-site objective:**
- Find a work of art, sculpture, pattern, plant texture, or architectural detail that catches your eye.
- Do not touch artwork or block other visitors.
- Create a short title for the thing you noticed.

**Digital substitute:**
- Choose three visual elements from a sticker set and make a digital emblem.

**Puzzle:**
- Match three motifs to the idea they express: motion, calm, celebration, or mystery. There are no “wrong taste” answers; this is an observation prompt.

**Reward:** Echo Lens; `Creativity +2`; badge **Memory Maker**

**Journal prompt:** “Name your discovery as if it were an exhibit in your own museum.”

---

### Chapter 4 — The Bridge of Brave Steps

**Location:** Splashbridge Basin  
**Lens:** Spark Lens (coral)

**Scene:** Glint tells Nori that the coral lens “loves brave steps,” then accidentally sends it bouncing through the Splashbridge Basin.

**Primary on-site objective:**
- Choose a safe, family-approved “brave step,” such as trying a pool activity, speaking politely to ask a question, taking a new walking route, or simply putting feet in the water.
- The player controls what “brave” means. No one has to use a slide or do something uncomfortable.

**Digital substitute:**
- Tap four wave stones in a memory sequence.

**Puzzle:**
- Draw a path across a bridge without stepping on the same tile twice.

**Reward:** Spark Lens; `Discovery +1`; `Creativity +1`; badge **Brave Explorer**

**Journal prompt:** “What did you try, or what might you like to try another day?”

---

### Chapter 5 — The Fourfold Flow

**Location:** Fourfold Springs  
**Lens:** Flow Lens (blue)

**Scene:** The blue lens powers the Beacon’s “together” message. To recover it, all four players must guide separate water paths toward one shared fountain.

**Primary on-site objective:**
- Each player identifies a water-related sound, shape, or movement in the area.
- The team makes one combined “water story” using all four observations.

**Digital substitute:**
- Two-button cooperative pipe puzzle. Each round requires two different players to select one action.

**Puzzle rule:**
- No one can tap twice in a row during a team round.

**Reward:** Flow Lens; `Teamwork +3`; badge **Current Crew**

**Journal prompt:** “What was easier because someone else helped?”

---

### Chapter 6 — The Lantern Listens

**Location:** Lantern Evening  
**Lens:** Lantern Lens (amber)

**Scene:** The amber lens is quiet. It appears only when people pay attention without rushing to capture everything.

**Primary optional activity:**
- Before an evening event, family dinner, sunset walk, or cultural activity, choose one listening intention:
  - notice a rhythm;
  - notice an instrument or sound;
  - notice a story being told;
  - notice how a performer or speaker uses movement;
  - notice a feeling the experience creates.
- Afterwards, write one sentence of appreciation.

**Digital substitute:**
- Play an original, non-cultural background soundscape and choose a mood word: peaceful, curious, excited, thoughtful, or joyful.

**Important content rule:**
- Do not make guests hunt for Hawaiian words, imitate ceremonies, or treat cultural performances as magical clues. This chapter is about listening and reflecting respectfully.

**Reward:** Lantern Lens; `Kindness +1`; `Discovery +1`; badge **Good Listener**

**Journal prompt:** “What is one thing you appreciated about tonight?”

---

### Chapter 7 — The Sunset Nobody Keeps

**Location:** Palmwind Paths / Beacon Courtyard  
**Lens:** Sunset Lens (rose)

**Scene:** The final lens appears when the family creates a memory rather than searches for a treasure.

**Primary on-site objective:**
- Create one shared sunset memory: a family photo, a short video, a four-person pose, a two-sentence story, or a drawing.
- Photos are optional. The app must work with words or a drawing only.

**Digital substitute:**
- Make a postcard using supplied stickers and a blank caption.

**Reward:** Sunset Lens; `Creativity +3`; badge **Sunset Keeper**

**Journal prompt:** “What is one moment from this trip you want to remember when you are home?”

---

### Finale — Relight the Wayfinder

**Location:** Beacon Courtyard  
**Requirement:** all seven lenses

**Final puzzle:**
- The app places colored lenses around the beacon.
- Each player chooses one lesson from the journey: Care, Curiosity, Memory, Courage, Teamwork, Listening, Creativity.
- A final seven-word code appears. The team puts the words in the sequence they learned them.

**Ending reward:**
- Title: **Keepers of the Summer Signals**
- Printable/shareable local certificate (optional)
- Memory Book unlocked
- New-game-plus “Random Quest Deck” unlocked

---

## 9. Quest Types and Reusable Templates

Keep content production simple by using reusable quest templates.

| Template | Description | Example | Complexity |
|---|---|---|---|
| Observe | Notice and record something | “Find one color, sound, and shape” | Low |
| Choose kindly | Pick safe/respectful response | “How do we behave near wildlife?” | Low |
| Sequence | Arrange things in order | Tram stations / color order | Low |
| Pattern | Match or complete visual pattern | Museum / wave puzzle | Low |
| Route | Move across a small grid | Rope bridge / garden path | Medium |
| Co-op switch | Two players alternate choices | Water-flow puzzle | Medium |
| Make | Draw, title, write, or photograph | Postcard / emblem | Low |
| Memory prompt | Family reflection | “What surprised you today?” | Low |

### Quest reward formula

Every completed quest should award:

```text
1 story reward (lens / fragment / clue)
+ 1–3 team stat points
+ 1 journal entry
+ optional badge
```

Avoid random loot in the MVP. Predictable rewards are clearer for children and easier to test.

---

## 10. Collectibles, Badges, and Journal

### Inventory tabs

1. **Signal Lenses** — seven primary story items
2. **Clue Cards** — short notes from Glint or the Beaconkeeper
3. **Badges** — optional accomplishments
4. **Memory Book** — photos, drawings, captions, and quest reflections
5. **Field Kit** — cosmetic tools only

### Suggested badges

- Reef Respecter
- Signal Navigator
- Memory Maker
- Brave Explorer
- Current Crew
- Good Listener
- Sunset Keeper
- Tram Tracker
- Color Collector
- Family Cartographer
- Kindness Captain
- Journal Keeper

### Memory Book page format

Each completed quest generates:

```text
Title
Date (optional; defaults to current device date)
Location / chapter
One-sentence story recap
Player reflection
Optional photo or drawing
Earned badge(s)
```

### Privacy approach

- Keep all photos in local browser storage for MVP, or make photo storage optional and local-only.
- Do not upload children’s photos to a server.
- Include an “Export My Memory Book” option only after the core game is complete.
- Show a parent gate before deleting a saved game or exporting photos.

---

## 11. MVP Functional Requirements

### Must-have screens

1. **Home / Save Select**
   - Start new adventure
   - Continue adventure
   - Reset adventure (parent confirmation)
   - About / safety note

2. **Player Setup**
   - Enter 2–4 display names
   - Assign roles
   - Pick team emblem

3. **Map**
   - Show unlocked / locked / completed locations
   - Tap a location to open its chapter
   - Current story objective at the top

4. **Quest Scene**
   - Story text
   - Optional role callout
   - Primary objective and digital substitute
   - “Mark complete” / “Try puzzle” buttons

5. **Mini-game Modal**
   - Pattern, route, sequence, or co-op switch puzzle
   - Play again option
   - Accessible keyboard/tap controls

6. **Rewards Screen**
   - Lens / badge / stat progress
   - Journal prompt

7. **Inventory and Memory Book**
   - Lens collection
   - Badge grid
   - Journal entries

8. **Settings / About**
   - Sound and reduced motion controls
   - Data export/import later
   - “Unofficial private family project” note
   - Safety and wildlife reminder

### Must-have behavior

- Save automatically after every meaningful action.
- Work offline after the app’s first load.
- Never require camera, location, or microphone permissions.
- Make all real-world quests skippable without losing story progress.
- Make every quest completable with an alternate digital activity.
- Keep text chunks short: maximum 120 words before a choice or interaction.

---

## 12. Accessibility and Family UX Requirements

- Minimum tap target: 44 × 44 px.
- High-contrast text and optional dyslexia-friendly font toggle.
- No red/green-only meaning; always combine color with an icon and label.
- Captions for sound effects; all essential information is textual.
- Reduced-motion setting disables floating particles and animated transitions.
- No countdown timers in core progression.
- “Read aloud” button can use browser speech synthesis later; do not block MVP on it.
- Players can use an avatar icon instead of a real photo or legal name.
- Parent can mark any quest complete manually without penalty.

---

## 13. Visual and Audio Direction

### Art style

- Original hand-drawn digital postcard aesthetic.
- Bright water colors, coral, soft gold, violet, and sunset rose.
- Large friendly icons, paper-map textures, rounded cards.
- Avoid stereotypical “tiki,” faux-tribal, or sacred-symbol decoration.
- Do not imply that real Hawaiian traditions or language are fantasy artifacts.

### Asset approach for MVP

- Use original CSS/SVG icons or permissively licensed generic icons.
- Illustrate the map with basic SVG shapes rather than commissioned art initially.
- Use CSS gradients and simple waves rather than stock resort photos.
- Add family photos only through the local Memory Book feature.

### Audio

- Optional and subtle: water, wind, tram chime, page turn, reward sparkle.
- Use original or properly licensed audio only.
- No attempt to imitate or label generic background music as Hawaiian music.

---

## 14. Technical Architecture

### Recommended MVP stack

| Area | Choice | Why |
|---|---|---|
| Framework | React + TypeScript + Vite | Fast static app, excellent iteration speed, easy hosting |
| Routing | React Router | Simple screen routes and deep links |
| Styling | Tailwind CSS | Fast responsive layout and consistent design tokens |
| State | Zustand with `persist` middleware | Small, readable game state with localStorage persistence |
| Forms | React Hook Form or simple controlled components | Player setup and journal entries |
| Icons | Lucide React | Accessible, lightweight UI icons |
| Validation | Zod | Validate game content/data at build time |
| Tests | Vitest + React Testing Library | Unit and component tests |
| E2E | Playwright | Verify core game flow and persistence |
| Offline | `vite-plugin-pwa` | Installable, cacheable trip companion |
| Deployment | Vercel, Netlify, or GitHub Pages | Static hosting; no backend needed |

### Why not build a real-time RPG engine first?

The first game should be a **choice-and-quest RPG**, not a top-down movement simulator. A map with click-to-enter locations gives the same narrative reward while avoiding collision systems, sprite animation, pathfinding, tile maps, combat balancing, and mobile performance work.

### Architecture diagram

```text
React UI
  ├── routes/screens
  ├── reusable components
  ├── game data (typed JSON / TS modules)
  ├── game store (Zustand)
  ├── local persistence (localStorage / IndexedDB later)
  ├── quest rules engine
  └── PWA cache

No backend in MVP
No authentication in MVP
No public API in MVP
```

### Recommended repository structure

```text
island-summer-quest/
├── README.md
├── package.json
├── vite.config.ts
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── app/
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── assets/
│   │   ├── audio/
│   │   ├── illustrations/
│   │   └── ui/
│   ├── components/
│   │   ├── ui/
│   │   ├── map/
│   │   ├── quest/
│   │   └── journal/
│   ├── data/
│   │   ├── chapters.ts
│   │   ├── locations.ts
│   │   ├── quests.ts
│   │   ├── badges.ts
│   │   ├── characters.ts
│   │   └── miniGames.ts
│   ├── features/
│   │   ├── onboarding/
│   │   ├── map/
│   │   ├── quests/
│   │   ├── inventory/
│   │   ├── memoryBook/
│   │   └── settings/
│   ├── lib/
│   │   ├── gameRules.ts
│   │   ├── storage.ts
│   │   ├── migrations.ts
│   │   ├── contentValidation.ts
│   │   └── utils.ts
│   ├── store/
│   │   └── gameStore.ts
│   ├── types/
│   │   └── game.ts
│   └── tests/
│       ├── unit/
│       └── e2e/
└── docs/
    └── game-spec.md
```

### State model

```ts
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

export type JournalEntry = {
  id: string;
  chapterId: string;
  createdAt: string;
  title: string;
  reflection?: string;
  drawingDataUrl?: string;
  photoDataUrl?: string;
};

export type GameState = {
  schemaVersion: 1;
  adventureId: string;
  teamName: string;
  players: Player[];
  teamStats: TeamStats;
  completedQuestIds: string[];
  unlockedLocationIds: string[];
  collectedLensIds: string[];
  unlockedBadgeIds: string[];
  journalEntries: JournalEntry[];
  settings: {
    soundEnabled: boolean;
    reducedMotion: boolean;
    dyslexiaFriendlyFont: boolean;
  };
  updatedAt: string;
};
```

### Content model

Use typed TypeScript objects rather than raw JSON initially, so the compiler can catch missing rewards and broken location IDs.

```ts
export type QuestChoice = {
  id: string;
  label: string;
  resultText: string;
  isCorrect?: boolean;
  statRewards?: Partial<TeamStats>;
  unlocksBadgeId?: string;
};

export type Quest = {
  id: string;
  chapterId: string;
  locationId: string;
  title: string;
  intro: string;
  onSiteObjective: string;
  alternateObjective: string;
  completionMode: 'manual' | 'choice' | 'sequence' | 'route' | 'cooperative';
  choices?: QuestChoice[];
  reward: {
    lensId?: string;
    badgeId?: string;
    stats: Partial<TeamStats>;
    unlockLocationIds?: string[];
  };
  journalPrompt: string;
  safetyNote?: string;
};
```

### Game rules engine requirements

Create pure functions for all progression rules:

```ts
canStartQuest(state, questId): boolean
completeQuest(state, questId, result): GameState
getAvailableLocations(state): Location[]
getNextStoryObjective(state): StoryObjective
hasAllLenses(state): boolean
buildJournalEntry(quest, playerInput): JournalEntry
```

This keeps UI components simple and makes story logic easy to test.

---

## 15. Persistence and Offline Plan

### MVP

- Persist game state with Zustand + localStorage.
- Use a schema version in every save object.
- Cache static assets and route shell with PWA service worker.
- Autosave after role selection, quest completion, journal entry edit, and settings change.

### Photo / drawing storage

For the MVP, choose one of these options:

1. **Simplest:** no photo upload; support typed reflection and in-app doodle canvas only.
2. **Recommended:** allow one small, compressed photo per chapter and store it in IndexedDB.
3. **Later:** export a ZIP/PDF memory book locally; do not upload children’s data by default.

Do not store large base64 photos in localStorage; it fills quickly and can corrupt the save. Use IndexedDB for media if photo journaling is included before the trip.

### Backup UX

At minimum, add:

- `Export Save` → downloads `island-summer-quest-save.json`
- `Import Save` → lets the family restore a file
- Parent confirmation before overwrite

---

## 16. Mini-Games: MVP Specifications

### A. Station Sequence

**Purpose:** route logic  
**Input:** drag-and-drop or tap-to-order cards  
**Win condition:** arrange 3–4 station cards based on text clues  
**Fallback:** “Show hint” and then “Mark complete”  
**Implementation:** array ordering; no canvas required

### B. Reef Respect Choice Cards

**Purpose:** wildlife-care education  
**Input:** tap one choice  
**Win condition:** select the respectful action  
**Fallback:** re-read a short safety hint; no punitive failure  
**Implementation:** modal cards with immediate feedback

### C. Wave Steps

**Purpose:** memory / courage chapter  
**Input:** tap a sequence of 3–6 tiles  
**Win condition:** reproduce the current sequence  
**Fallback:** reduce sequence length after two misses  
**Implementation:** state machine with `sequence`, `playerInput`, `round`

### D. Flow Together

**Purpose:** turn-taking teamwork  
**Input:** two players alternate selecting pipe-turn cards  
**Win condition:** route water from source to garden  
**Fallback:** highlight one valid move after a failed attempt  
**Implementation:** small 4×4 grid with predesigned solvable layouts

### E. Sunset Postcard

**Purpose:** creative finale  
**Input:** drag stickers, select background, add a caption  
**Win condition:** save a postcard  
**Fallback:** select “I’ll add this later”  
**Implementation:** simple absolute-position canvas or DOM layer; no complex drawing required

---

## 17. Design Tokens and Component Guidelines

### Color tokens

Use a personal original palette, not exact brand colors:

```css
--ocean-deep: #0E5E78;
--lagoon: #3FB4C1;
--sun-gold: #F7C84B;
--coral: #F0786A;
--sunset-rose: #D46B89;
--plumeria-violet: #7656A7;
--sand: #FFF6DD;
--ink: #17323A;
--cloud: #FFFFFF;
```

### Primary components

- `AppShell`
- `TopProgressBar`
- `MapRegionButton`
- `QuestCard`
- `RoleAbilityHint`
- `ChoiceButton`
- `RewardReveal`
- `LensCollection`
- `BadgeGrid`
- `JournalPrompt`
- `FamilyTurnIndicator`
- `ParentConfirmDialog`
- `OfflineStatusPill`

### Responsive behavior

- Mobile-first layout: 390 px wide iPhone viewport is the baseline.
- Map supports pan/zoom only if necessary; initial MVP can use vertically stacked regions on phones.
- Use a 2-column layout on tablet / desktop: map or quest on the left, inventory/progress on the right.
- Keep game controls below the fold only when there is a “scroll to continue” indicator.

---

## 18. Content and Cultural Respect Guidelines

This section is a product requirement, not an optional note.

### Do

- Use Hawaiʻi as a living place with real people, culture, land, ocean, and ecology—not as a generic tropical fantasy backdrop.
- Encourage observation, stewardship, listening, and family reflection.
- Attribute real-world facts to reliable sources in an in-game “Learn More” section.
- Use original fictional terms for magical/game mechanics: **Signal Lenses**, **Wayfinder Beacon**, **Sunspire Village**, **Glint**.
- Treat a luau or cultural program as an opportunity to listen and appreciate, never as a costume, puzzle prop, or “magic ritual.”
- Follow all staff instructions, posted signs, and wildlife guidance.

### Do not

- Use sacred or cultural Hawaiian terms as random spells, power-ups, monsters, or magical collectibles.
- Use “tiki” imagery, invented tribal motifs, faux chants, or fake Hawaiian words.
- Encourage touching marine life, feeding animals, entering restricted areas, or approaching performers/staff for a game task.
- Require players to learn or pronounce Hawaiian words to receive a reward.
- Present fictional stories as authentic Hawaiian mythology.

### Wildlife safety card (in-app copy)

> **Explorer Rule:** Animals are neighbors, not game pieces. Watch from a respectful distance, never touch or feed wildlife, and follow staff guidance and posted signs. A photo is never required to complete a quest.

---

## 19. Suggested Build Plan for the Next Two Weeks

The goal is a stable, fun game by the trip—not a fully polished commercial product.

### Phase 0 — Decide and set up (Day 1)

**Deliverable:** deployable empty app and clear backlog.

- Create Git repository: `island-summer-quest`
- Scaffold Vite + React + TypeScript
- Add Tailwind, React Router, Zustand, Vitest, Playwright, PWA plugin
- Create `docs/game-spec.md` from this file
- Add an `ARCHITECTURE.md` and `CONTRIBUTING.md` only if useful
- Deploy a placeholder build to Vercel/Netlify

**Definition of done:** opening the deployment shows “Island Summer Quest” and passes CI.

### Phase 1 — Core playable slice (Days 2–4)

**Deliverable:** one complete quest from setup to reward.

- Player setup screen
- Game store and autosave
- Map screen with 3 locations
- Implement Chapter 1: Turtleglass Lagoon
- Add Reef Respect choice cards
- Add reward and journal text entry

**Definition of done:** a player can start, complete a quest, refresh the page, and retain the Tide Lens.

### Phase 2 — Main story (Days 5–7)

**Deliverable:** all seven chapters, even with basic UI.

- Add locations and map states
- Add Chapters 2–7 as data-driven quests
- Implement unlock rules
- Add badges, team stats, and final ending
- Add a manual “Skip to alternate quest” switch for every chapter

**Definition of done:** a tester can reach the finale without any real-world photos or activities.

### Phase 3 — Mini-games and polish (Days 8–10)

**Deliverable:** the game feels playful.

- Station Sequence mini-game
- Wave Steps mini-game
- Flow Together mini-game
- Reward reveal animation with reduced-motion fallback
- Improve mobile tap targets, loading states, and empty states

**Definition of done:** all mini-games are playable on an iPhone-sized screen.

### Phase 4 — Trip readiness (Days 11–12)

**Deliverable:** safe, offline, and recoverable.

- Enable PWA caching
- Add offline state
- Add save export/import
- Add About, safety, and privacy screens
- Test on the actual family phone/tablet
- Add lightweight original SVG map and art

**Definition of done:** disable Wi-Fi after one app load and verify the core game still works.

### Phase 5 — Content rehearsal (Days 13–14)

**Deliverable:** family-ready launch.

- Read every story section aloud with the kids
- Replace anything they find boring, confusing, or too long
- Let each child write one optional clue card
- Choose whether photo journaling is included or deferred
- Create a “Start Our Trip” button and have everyone pick their avatar

**Definition of done:** the family can play the first two quests in under 15 minutes with no developer help.

---

## 20. MVP Backlog by Priority

### P0 — must ship before the trip

- [ ] Home, setup, map, quest, reward, inventory screens
- [ ] One shared saved game
- [ ] Seven main story chapters and finale
- [ ] Alternate digital completion path for every real-world task
- [ ] Lenses, stats, badges, and memory-book text entries
- [ ] Autosave and offline fallback
- [ ] Mobile-friendly responsive UI
- [ ] Wildlife/respect safety card
- [ ] Original map / no official assets

### P1 — strongly recommended

- [ ] Three mini-games
- [ ] Export/import save file
- [ ] Reduced-motion setting
- [ ] Sound toggle
- [ ] Simple doodle canvas
- [ ] Offline install prompt

### P2 — after the trip

- [ ] Photo uploads stored in IndexedDB
- [ ] Postcard builder
- [ ] Printable PDF memory book
- [ ] Optional voice narration
- [ ] More chapter packs for other vacations
- [ ] Parent-authenticated cloud backup

### P3 — future only

- [ ] Multiple save slots
- [ ] Multiplayer across households
- [ ] AI-authored side quests with an adult review step
- [ ] Map editor for kids
- [ ] Location packs and recurring seasonal events

---

## 21. Testing Plan

### Unit tests

- Quest unlock rules
- Completion rewards
- Finale gate requires exactly seven lenses
- Save migration from `schemaVersion: 1`
- Missing/invalid content data fails validation
- Every quest has an alternate completion path

### Component tests

- Player setup cannot proceed with fewer than 2 players
- Map visually distinguishes locked vs unlocked regions
- Quest completion creates one journal entry
- Settings persist across refresh
- Parent confirmation is required before reset

### End-to-end tests

1. Start a new game → select roles → complete Chapter 1 → refresh → verify lens persists.
2. Complete all alternate quests without camera access → reach finale.
3. Turn on reduced motion → verify animations are skipped.
4. Start app online → turn off network → verify cached app opens and save works.
5. Export save → reset → import save → verify restored progress.

### Manual kid test

Ask Player A and Player B to play without coaching. Watch for:

- Where they hesitate
- Which story parts they skip
- Whether they understand what to tap
- Whether any puzzle feels unfair
- Which rewards they talk about afterward

Use their feedback to simplify, not to add complexity.

---

## 22. Acceptance Criteria for “Ready for Vacation”

The game is ready when all of these are true:

- A new family can begin in under two minutes.
- Every chapter can be completed without visiting a specific physical location.
- A child can recover from any wrong answer without losing progress.
- The app works on at least one iPhone and one larger-screen device.
- All text remains readable without zooming.
- Refreshing the browser never erases progress.
- The core app works when the network is unavailable after initial load.
- The finale can be completed in one family session from a fresh save using alternate digital quests.
- No screen requires real names, photos, GPS, camera, or microphone permissions.
- The game contains the wildlife safety card and cultural-respect guidelines.

---

## 23. Post-Trip Expansion: Turn It into a Keepsake

After returning home, add a small “After the Adventure” release:

1. **Memory Book export** — printable HTML/PDF with title page, badges, and journal entries.
2. **Photo captions** — each child writes one sentence for each favorite memory.
3. **New Game Plus** — random daily cards such as “Tell a two-minute story from Glint’s point of view.”
4. **Build Mode** — Player A creates a logic puzzle, Player B writes a clue, and the family publishes it into their own quest deck.
5. **Next Vacation Pack** — preserve the game engine, swap maps, quests, and story data for a future trip.

---

## 24. Initial Repository README Summary

Use this short description at the top of the repo:

```md
# Island Summer Quest: The Seven Signals

An offline-friendly, cooperative family web RPG that turns a Hawaiʻi vacation into a story-driven adventure journal. Built with React, TypeScript, Vite, and local-first persistence.

> Unofficial private family project. Not affiliated with, sponsored by, or endorsed by Hilton or Hilton Waikoloa Village.
```

### Suggested initial commands

```bash
npm create vite@latest island-summer-quest -- --template react-ts
cd island-summer-quest
npm install
npm install react-router-dom zustand zod lucide-react
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa vitest @testing-library/react @testing-library/jest-dom playwright
npm run dev
```

---

## 25. Source Notes for Real-World Inspiration

Before travel, re-check availability, operating hours, and activity rules directly with the resort because schedules and offerings can change.

- [Hilton Waikoloa Village — Resort Overview](https://www.hilton.com/en/hotels/koahwhh-hilton-waikoloa-village/resort/): 62-acre resort context, resort trams, museum walkway, art collection, and facilities.
- [Hilton Waikoloa Village — Lagoon & Beach](https://www.hilton.com/en/hotels/koahwhh-hilton-waikoloa-village/activities/lagoon-beach/): ocean-connected lagoon, kayaking/paddling, and wildlife-care guidance.
- [Hilton Waikoloa Village — Pools](https://www.hilton.com/en/hotels/koahwhh-hilton-waikoloa-village/activities/pools/): current Kona and Kohala pool descriptions.
- [Hilton Waikoloa Village — Activities](https://www.hilton.com/en/hotels/koahwhh-hilton-waikoloa-village/activities/): cultural activities and current resort activity information.
- [Hilton Waikoloa Village — Island Experiences](https://www.hilton.com/en/hotels/koahwhh-hilton-waikoloa-village/island-experiences/): optional Big Island activity inspiration.

---

## 26. Final Product Decision

Build the first release as a **quest-and-choice RPG with a static illustrated map**, not a free-roaming animated game.

That version will feel complete, be playable on vacation, and leave room for the children to add stories, mini-games, art, and future travel chapters without turning the first release into a months-long game-engine project.
