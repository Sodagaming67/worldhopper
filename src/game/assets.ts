export function asset(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/game/${path.replace(/^\//, '')}`;
}

export type HeroTokenDir = 'down' | 'up' | 'left' | 'right';

/** Island-map hero token, boy or girl, facing the given direction. */
export function heroTokenAsset(hero: 'boy' | 'girl', dir: HeroTokenDir): string {
  return asset(hero === 'girl' ? `overworld/hero-token-girl-${dir}.png` : `overworld/hero-token-${dir}.png`);
}
