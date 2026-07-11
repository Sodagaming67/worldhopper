/**
 * Background matting for AI-generated art drops (docs/game/*-art-brief.md):
 * multi-seed flood fill from the image border + edge feather + content crop.
 * The reef round proved this pipeline; this commits it as a reusable tool.
 *
 * Works on any FLAT background color (white for most sprites, light blue for
 * white-bodied subjects like the koaʻe kea) — the key color is sampled from
 * the border, not assumed. Only background CONNECTED TO THE BORDER is
 * removed, so interior whites (eyes, highlights) survive.
 *
 * `global: true` keys EVERY pixel within tolerance instead, reaching pockets
 * the border flood fill can't (open railings, fence gaps). Safe only for key
 * colors that never appear in the art itself (the magenta #FF00FF rounds).
 */

const dist = (r1, g1, b1, r2, g2, b2) =>
  Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

/** Median color of the border ring — the background key. */
export function sampleBackground(rgba, w, h) {
  const rs = [], gs = [], bs = [];
  const push = (x, y) => {
    const i = (y * w + x) * 4;
    rs.push(rgba[i]); gs.push(rgba[i + 1]); bs.push(rgba[i + 2]);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { push(0, y); push(w - 1, y); }
  const med = (a) => a.sort((m, n) => m - n)[a.length >> 1];
  return { r: med(rs), g: med(gs), b: med(bs) };
}

/**
 * Remove the border-connected background in place and feather the cutout
 * edge. Returns the background color that was keyed out.
 */
export function matteRgba(rgba, w, h, { tolerance = 40, feather = 2, global: globalKey = false } = {}) {
  const bg = sampleBackground(rgba, w, h);
  const isBg = new Uint8Array(w * h);

  if (globalKey) {
    // For a magenta key (never occurs in art), also sweep the whole magenta
    // hue family — AI renders shade the key near shadows/edges (hot pinks
    // with g≈20–60) that sit outside plain distance tolerance, while real
    // art pinks (hibiscus ≈ rgb(240,100,160)) keep g well above 70.
    const magentaKey = bg.r > 200 && bg.b > 180 && bg.g < 60;
    for (let p = 0; p < w * h; p++) {
      const i = p * 4;
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      if (dist(r, g, b, bg.r, bg.g, bg.b) <= tolerance) { isBg[p] = 1; continue; }
      if (magentaKey && r > 140 && b > 110 && g < 70 && r - g > 100 && b - g > 60) isBg[p] = 1;
    }
  } else {
    const queue = [];
    const trySeed = (x, y) => {
      const p = y * w + x;
      const i = p * 4;
      if (!isBg[p] && dist(rgba[i], rgba[i + 1], rgba[i + 2], bg.r, bg.g, bg.b) <= tolerance) {
        isBg[p] = 1; queue.push(p);
      }
    };
    for (let x = 0; x < w; x++) { trySeed(x, 0); trySeed(x, h - 1); }
    for (let y = 0; y < h; y++) { trySeed(0, y); trySeed(w - 1, y); }

    while (queue.length) {
      const p = queue.pop();
      const x = p % w, y = (p / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        trySeed(nx, ny);
      }
    }
  }

  for (let p = 0; p < w * h; p++) if (isBg[p]) rgba[p * 4 + 3] = 0;

  // Feather: foreground rings adjacent to the cutout get stepped-down alpha
  // (ring 1 closest to the background = most transparent).
  let ring = isBg;
  for (let f = 1; f <= feather; f++) {
    const next = new Uint8Array(w * h);
    const alpha = Math.round((255 * f) / (feather + 1));
    for (let p = 0; p < w * h; p++) {
      if (isBg[p] || rgba[p * 4 + 3] < alpha) continue;
      const x = p % w, y = (p / w) | 0;
      const nearRing =
        (x > 0 && ring[p - 1]) || (x < w - 1 && ring[p + 1]) ||
        (y > 0 && ring[p - w]) || (y < h - 1 && ring[p + w]);
      if (nearRing) { rgba[p * 4 + 3] = alpha; next[p] = 1; }
    }
    ring = next;
  }
  return bg;
}

/** Bounding box of pixels with alpha > 0, padded and clamped. */
export function cropBounds(rgba, w, h, pad = 2) {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null; // fully transparent
  return {
    x: Math.max(0, minX - pad),
    y: Math.max(0, minY - pad),
    w: Math.min(w - 1, maxX + pad) - Math.max(0, minX - pad) + 1,
    h: Math.min(h - 1, maxY + pad) - Math.max(0, minY - pad) + 1,
  };
}

/**
 * Union of several crop rects — the shared box an animation-frame GROUP
 * should crop to, so swapping frames doesn't shift the character (each
 * frame's own content is a different subset of the same union box, cropped
 * with matching alignment instead of independently tight-fit).
 */
export function unionBounds(rects) {
  const valid = rects.filter(Boolean);
  if (!valid.length) return null;
  const minX = Math.min(...valid.map((r) => r.x));
  const minY = Math.min(...valid.map((r) => r.y));
  const maxX = Math.max(...valid.map((r) => r.x + r.w));
  const maxY = Math.max(...valid.map((r) => r.y + r.h));
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Copy a crop rect out of an RGBA buffer. */
export function cropRgba(rgba, w, rect) {
  const out = new Uint8Array(rect.w * rect.h * 4);
  for (let y = 0; y < rect.h; y++) {
    const src = ((rect.y + y) * w + rect.x) * 4;
    out.set(rgba.subarray(src, src + rect.w * 4), y * rect.w * 4);
  }
  return out;
}
