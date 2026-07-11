export class Raster {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.buf = new Uint8Array(w * h * 4); // transparent
  }

  setPixel(x, y, [r, g, b, a]) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.buf[i] = r; this.buf[i + 1] = g; this.buf[i + 2] = b; this.buf[i + 3] = a;
  }

  rect(x, y, w, h, rgba) {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) this.setPixel(xx, yy, rgba);
  }

  hline(x, y, len, rgba) { for (let i = 0; i < len; i++) this.setPixel(x + i, y, rgba); }
  vline(x, y, len, rgba) { for (let i = 0; i < len; i++) this.setPixel(x, y + i, rgba); }

  ellipse(cx, cy, rx, ry, rgba) {
    for (let yy = Math.ceil(cy - ry); yy <= cy + ry; yy++) {
      for (let xx = Math.ceil(cx - rx); xx <= cx + rx; xx++) {
        const dx = (xx - cx) / rx;
        const dy = (yy - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.setPixel(xx, yy, rgba);
      }
    }
  }

  toRgba() { return this.buf; }
}
