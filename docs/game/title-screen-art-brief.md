# Title screen art brief — prompt for the resort rotunda background

The title screen (`src/features/title/TitleScreen.tsx`) currently renders its
background as an inline procedural SVG: an overgrown neoclassical rotunda
(dome, drum, portico) reclaiming itself with trees and vines, lit by a soft
"Wayfinder Beacon" glow, set against a dusk sky. This brief replaces that
placeholder with one high-fidelity painted background image, same subject and
composition, so the swap is a drop-in.

Run the prompt below in your image tool of choice, save the result into
`docs/art-drops/title-screen/` at the repo root, then start a session with:
**"wire in the title screen art from art-drops/title-screen"** — resizing/
cropping and wiring the `<img>`/CSS background in over the SVG happens then.
The title screen stays fully playable on the current procedural SVG until
that art lands.

## Save instructions

- **Filename:** `title-bg.png`
- **Size:** 1536×2048 (portrait 3:4, matches the SVG's `300 400` viewBox
  aspect ratio so nothing important gets cropped by `preserveAspectRatio="xMidYMax
  slice"`) — if your tool only offers fixed portrait presets, the closest
  9:16 or 3:4 option is fine.
- **Format:** PNG or high-quality JPG.
- **Background:** fully opaque, full-bleed painted scene — this is a
  background image, not a die-cut sprite, so **do not** ask for a white/solid
  matte background; the whole frame should be painted edge to edge.
- **Save location:** `docs/art-drops/title-screen/title-bg.png`

## The prompt

> A wide painterly 2D game background: a grand abandoned neoclassical rotunda
> — a domed roof with a small lantern cupola on top, a cylindrical drum wall
> with faint glowing golden window slits, a triangular pediment over a
> columned portico with six weathered stone columns — completely reclaimed by
> a lush tropical forest. Thick tree canopies flank both sides of the
> building, their branches overlapping its edges; hand-painted vines climb
> the columns and drum wall. Crumbled, rubble-strewn stone steps lead up to
> the portico. A distant hazy treeline sits behind the building. A single
> soft warm golden-amber glow radiates from behind the dome, like a beacon
> still faintly alive inside the ruin, softly illuminating the surrounding
> mist. Dusk sky above fading from a deep ocean-blue at the top through
> muted slate-grey to a warm sandy tan near the horizon. Low ground fog
> drifting at the base of the building. Flat cel-shaded cartoon illustration
> style like a Disney/Pixar mobile game background — bold simplified shapes,
> soft painterly color bands, rich but muted tropical-dusk palette. Portrait
> orientation, composition centered with the rotunda as the clear focal
> point in the lower-middle two-thirds of the frame and open sky above for
> title text to sit against. NO text, NO characters, NO people, NO logos,
> NO modern-city elements, NOT photorealistic, NOT a 3D render, NOT a photo.

**Negative prompt (if your tool supports one):** "text, watermark, logo,
characters, people, modern city, skyscrapers, cars, photo, photorealistic,
3D render, CGI, stock photo, film grain, vignette border, transparent
background, checkered background."

**If a result comes back photoreal,** re-run with: "in the style of a
Moana/Disney animated film background, flat painted vector illustration,
NOT a photograph."

**If the beacon glow reads as a hard flat circle** instead of a soft light
source, add: "the glow is soft, diffuse, and irregular, brightest near the
dome and fading gradually into the mist — not a solid disc."

## Why one full-bleed image, not layered sprite pieces

The current SVG is a single self-contained scene (no parallax, no runtime
animation beyond two twinkling windows), so one opaque painted background
image is a straight visual upgrade with no scene-code restructuring. If a
future pass wants parallax depth (tree layer moving separately from the
rotunda, like the Kīlauea `bg-far`/`bg-mid`/`bg-near` split in
`kilauea-art-brief.md`), that's a follow-up brief, not this one.
