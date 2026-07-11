// Palette (RGBA). Kept small and coherent so tinting reads cleanly.
const T = [0, 0, 0, 0];
const INK = [24, 34, 46, 255];
const SKIN = [242, 210, 169, 255];
const HAIR = [43, 26, 16, 255];
const SUIT = [255, 255, 255, 255];   // white — recoloured per-skin via Phaser tint
const FIN = [154, 220, 240, 255];
const CORAL_A = [240, 120, 106, 255];
const CORAL_HI = [255, 168, 150, 255];
const CORAL_SH = [190, 78, 70, 255];
const KELP = [46, 139, 110, 255];
const KELP_HI = [90, 190, 150, 255];
const EEL = [90, 122, 58, 255];
const EEL_HI = [140, 170, 90, 255];
const JELLY = [213, 140, 240, 200];
const JELLY_HI = [235, 190, 250, 220];
const URCHIN = [42, 42, 58, 255];
const PEARL = [234, 246, 247, 255];
const PEARL_HI = [255, 255, 255, 255];
const GOLD = [246, 196, 83, 255];
const GOLD_HI = [255, 243, 192, 255];
const ANGEL = [255, 140, 66, 255];
const ANGEL_HI = [255, 224, 102, 255];
const WHITE = [255, 255, 255, 255];
const BUOY_R = [240, 120, 106, 255];
const CAUST = [255, 255, 255, 60];

// Helper: outline a filled ellipse by drawing the ink one px larger first.
const outlinedEllipse = (r, cx, cy, rx, ry, fill) => {
  r.ellipse(cx, cy, rx + 1, ry + 1, INK);
  r.ellipse(cx, cy, rx, ry, fill);
};

export const SPRITES = [
  // Player diver — 2-frame swim sheet, each frame 20x16 (sheet 40x16).
  // Suit is white so Phaser tint recolours it per skin.
  {
    name: 'player', w: 40, h: 16,
    draw(r) {
      const frame = (ox, kick) => {
        r.ellipse(ox + 8, 8, 6, 4, SUIT);      // body
        r.ellipse(ox + 8, 8, 6, 4, SUIT);
        r.rect(ox + 6, 4, 6, 2, HAIR);          // hair cap
        r.ellipse(ox + 8, 6, 3, 3, SKIN);       // head
        r.setPixel(ox + 10, 6, INK);            // eye
        r.ellipse(ox + 2, 8 + kick, 3, 2, FIN); // rear fin (kick animates)
        r.hline(ox + 12, 8, 4, SKIN);           // arm reaching forward
      };
      frame(0, 0);
      frame(20, 2);
    },
  },

  // Ambient reef fish — 2-frame sheet 32x12 (each 16x12). White-ish, tintable.
  {
    name: 'fish', w: 32, h: 12,
    draw(r) {
      const frame = (ox, tail) => {
        outlinedEllipse(r, ox + 9, 6, 5, 3, GOLD);
        r.setPixel(ox + 12, 5, INK);                 // eye
        // tail wags between frames
        r.ellipse(ox + 3, 6, 2, 2 + tail, GOLD_HI);
      };
      frame(0, 0);
      frame(16, 1);
    },
  },

  // Coral head — 24x20, white-ish base so it tints to A/B/C reef colours.
  {
    name: 'coral', w: 24, h: 20,
    draw(r) {
      r.ellipse(12, 16, 11, 5, CORAL_SH);   // base shadow
      r.ellipse(12, 14, 10, 5, CORAL_A);
      for (const bx of [6, 12, 18]) {
        r.vline(bx, 4, 10, CORAL_A);
        r.vline(bx - 1, 6, 8, CORAL_A);
        r.vline(bx + 1, 6, 8, CORAL_A);
        r.setPixel(bx, 4, CORAL_HI);
      }
    },
  },

  // Kelp strand — 12x32, parallax midground.
  {
    name: 'kelp', w: 12, h: 32,
    draw(r) {
      for (let y = 0; y < 32; y++) {
        const x = 6 + Math.round(Math.sin(y / 5) * 3);
        r.setPixel(x, y, KELP);
        r.setPixel(x + 1, y, KELP);
        if (y % 4 === 0) r.setPixel(x + 2, y, KELP_HI);
      }
    },
  },

  // Bubble — 8x8.
  {
    name: 'bubble', w: 8, h: 8,
    draw(r) {
      r.ellipse(4, 4, 3, 3, [234, 246, 247, 170]);
      r.setPixel(3, 3, [255, 255, 255, 220]);
    },
  },

  // Eel enemy — 24x12.
  {
    name: 'eel', w: 24, h: 12,
    draw(r) {
      for (let x = 2; x < 22; x++) {
        const y = 6 + Math.round(Math.sin(x / 3) * 1.5);
        r.setPixel(x, y, EEL);
        r.setPixel(x, y - 1, EEL);
        r.setPixel(x, y + 1, EEL_HI);
      }
      r.setPixel(20, 5, WHITE); // eye
      r.setPixel(21, 5, INK);
    },
  },

  // Jelly enemy — 16x16.
  {
    name: 'jelly', w: 16, h: 16,
    draw(r) {
      r.ellipse(8, 6, 6, 4, JELLY);
      r.ellipse(8, 5, 5, 3, JELLY_HI);
      for (const tx of [4, 8, 12]) r.vline(tx, 8, 6, JELLY);
    },
  },

  // Urchin enemy — 16x16.
  {
    name: 'urchin', w: 16, h: 16,
    draw(r) {
      r.ellipse(8, 8, 4, 4, URCHIN);
      for (let a = 0; a < 12; a++) {
        const ang = (Math.PI / 6) * a;
        const ex = 8 + Math.cos(ang) * 7;
        const ey = 8 + Math.sin(ang) * 7;
        r.setPixel(ex, ey, URCHIN);
      }
    },
  },

  // Pearl collectible — 12x12.
  {
    name: 'pearl', w: 12, h: 12,
    draw(r) {
      r.ellipse(6, 6, 4, 4, PEARL);
      r.setPixel(5, 4, PEARL_HI);
      r.setPixel(4, 5, PEARL_HI);
    },
  },

  // Rare angelfish (star) — 16x14.
  {
    name: 'angelfish', w: 16, h: 14,
    draw(r) {
      outlinedEllipse(r, 8, 7, 5, 4, ANGEL);
      r.vline(6, 2, 4, ANGEL_HI);      // dorsal
      r.ellipse(3, 7, 2, 3, ANGEL_HI); // tail
      r.setPixel(11, 6, INK);          // eye
    },
  },

  // Checkpoint buoy — 12x28.
  {
    name: 'buoy', w: 12, h: 28,
    draw(r) {
      r.vline(6, 0, 16, PEARL);         // pole
      r.ellipse(6, 20, 5, 5, BUOY_R);   // float
      r.hline(2, 20, 9, WHITE);         // stripe
    },
  },

  // Goal beacon — 20x24.
  {
    name: 'beacon', w: 20, h: 24,
    draw(r) {
      r.ellipse(10, 12, 7, 7, GOLD);
      r.ellipse(10, 12, 4, 4, GOLD_HI);
      r.rect(9, 0, 2, 6, WHITE); // spire
    },
  },

  // Caustic light tile — 32x32, tiles as an additive parallax overlay.
  {
    name: 'caustics', w: 32, h: 32,
    draw(r) {
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const v = Math.sin(x / 4 + y / 6) + Math.cos(y / 5 - x / 7);
          if (v > 1.2) r.setPixel(x, y, CAUST);
        }
      }
    },
  },
];
