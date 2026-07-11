# Third-party art attribution

Ledger of every third-party asset shipped with the game. **No asset ships
without a row here.** The in-game credits (Settings → About) render from
`src/data/artCredits.ts`, which must stay in sync with this file.

## Underwater World Parallax Backgrounds
- **Author:** CraftPix.net 2D Game Assets
- **Source:** https://opengameart.org/content/underwater-world-parallax-backgrounds
- **License:** OGA-BY 3.0 (attribution required)
- **Files:** `public/game/reef/bg/1.png` … `bg/6.png`
- **Modifications:** selected background #4's six layer PNGs; renamed only.

## Fish Pack 2.0
- **Author:** Kenney (www.kenney.nl)
- **Source:** https://opengameart.org/content/fish-pack-0
- **License:** CC0 (attribution voluntary — given with thanks)
- **Files:** `public/game/reef/angelfish.png` (fish_pink), `bubble.png`
  (bubble_a), `seaweed-*.png`, `coral-a.png` (seaweed_orange_b),
  `rock-a.png`/`rock-b.png`, `sand.png` (terrain_sand_top_a)
- **Modifications:** renamed only.

## Cartoon Jelly Fish
- **Author:** overcrafted
- **Source:** https://opengameart.org/content/cartoon-jelly-fish
- **License:** CC0 (attribution voluntary — given with thanks)
- **Files:** `public/game/reef/jelly/0.png` … `3.png`
- **Modifications:** selected idle frames 000/003/006/009 as a 4-frame loop;
  renamed only.

## AI-generated original art (no third-party license)
Generated 2026-07-09 from prompts in `docs/game/reef-hero-brief.md`, run
externally by the developer in an AI image tool. Original content, no attribution
obligation — listed here for provenance only.
- **Round 2 files:** `public/game/reef/player-1.png` … `player-5.png` (hero
  swim cycle), `eel-1.png`/`eel-2.png` (mouth closed/open), `urchin.png`,
  `pearl.png`, `buoy.png`, `beacon.png`.
- **Round 3 files (§6 of the brief — authentic Kahaluʻu Bay species, from a
  photo of the bay's real interpretive sign):** `fish-triggerfish.png`,
  `fish-moorish-idol.png`, `fish-yellow-tang.png`,
  `fish-raccoon-butterfly.png`, `fish-parrotfish.png`,
  `fish-convict-tang.png`, `urchin-wana.png`, `honu-1.png`/`honu-2.png`
  (turtle swim frames), `coral-head-a.png`/`coral-head-b.png`/
  `coral-head-c.png`. Replaces the generic Kenney ambient fish (removed);
  added alongside — not replacing — the round-2 `urchin.png`.
- **Modifications:** background-removed (multi-seed flood fill + edge
  feather), auto-cropped to content bounds, resized.

## Project-generated interim art (no third-party license)
`public/game/reef/caustics.png` — scripted pixel art from
`scripts/gen-reef-art/`. An AI-generated caustics tile was also produced but
wasn't seamless enough to use as a tiled overlay without visible repeat
seams; the scripted low-alpha (0.08) shimmer is kept instead.

## AI-generated original art — Kīlauea Ascent (no third-party license)
Generated 2026-07-10 from prompts in `docs/game/kilauea-art-brief.md`, run
externally in an AI image tool, grounded in the trip photos in
`docs/photos/volcano/`. Original content, no attribution obligation —
listed here for provenance only.
- **Files:** `public/game/kilauea/` — hero run/jump/idle (`player-run-1..4`,
  `player-jump`, `player-idle`), enemies (`kakamora-1/2`, `lava-crab-1/2`,
  `fire-sprite-1/2`, `ember`), theme props (`steam-vent`, `sulphur-rock`,
  `checkpoint-banner`, `beacon`, `ohelo-berries`, `platform-wide/mid/small`),
  set pieces (`ohia-tree`, `hapuu-fern`, `lava-tube-mouth`, `grass-tuft`),
  parallax layers (`bg-far`/`bg-mid`/`bg-near`), ambient wildlife
  (`nene-1/2`, `koae-kea-1/2`).
- **Modifications:** background-removed (multi-seed flood fill + edge
  feather via `scripts/matte-art/`, the reef round's pipeline now committed
  as a reusable tool), auto-cropped to content bounds. `bg-far.png` is an
  opaque full-frame painting, used unmatted.

## AI-generated original art — Island map (no third-party license)
Generated 2026-07-10 from prompts in `docs/game/overworld-art-brief.md`
(issue #24), run externally in an AI image tool, grounded in the Big Island
reference maps in `docs/photos/map/`. Original content, no attribution
obligation — listed here for provenance only.
- **Files:** `public/game/overworld/` — `bg-map.png` (opaque painted Big
  Island aerial, used unmatted as the `/map` screen background), landmark
  set-pieces (`turtleglass-lagoon`, `fourfold-springs`, `sunline-tram`,
  `splashbridge-basin`, `outer-island-expeditions`, `lantern-evening`,
  `beacon-courtyard`), and the walkable hero token
  (`hero-token-down/up/left/right`).
- **Modifications:** set-pieces background-removed via `scripts/matte-art/`,
  auto-cropped, downscaled (max 360px; hero tokens 200px). Unused pieces
  from the drop (`bg-map-shadow`, `hall-of-echoes`, `palmwind-paths`)
  remain in `docs/art-drops/overworld/` only.

## AI-generated original art — Sunline Tram Dash (no third-party license)
Generated 2026-07-10 from prompts in `docs/game/tramdash-art-brief.md`, run
externally in an AI image tool. Original content, no attribution
obligation — listed here for provenance only.
- **Files:** `public/game/tramdash/` — golden-hour resort parallax layers
  (`bg-far`, `bg-mid`, `bg-near`), hero ride/jump frames (`hero-ride-1`,
  `hero-ride-2`, `hero-jump`), the Kakamora boarders (`kakamora-1`,
  `kakamora-2`), track-side obstacles (`sign`, `gap`), pickups (`coin`,
  `star`), and the goal (`goal-car`).
- **Modifications:** background-removed (multi-seed flood fill + edge
  feather via `scripts/matte-art/`), auto-cropped to content bounds,
  resized.
