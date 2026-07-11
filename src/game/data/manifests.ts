import type { AssetManifest } from '@/game/kit/assets';
import { REEF_MANIFEST } from './reefAssets';
import { KILAUEA_MANIFEST } from './kilaueaAssets';
import { TRAMDASH_MANIFEST } from './tramdashAssets';
import { TRAMDASH_CHASE_MANIFEST } from './tramdashChaseAssets';

/**
 * Registry of every world's asset manifest. `BootScene` preloads the
 * manifests named in the game registry's `manifests` entry (all of them when
 * unset). Worlds still on procedural art simply have no manifest here.
 *
 * `tramdash` (side-view) stays registered but unused by the live world —
 * kept until the chase-cam art passes visual sign-off (#35), per the spec's
 * rollout plan.
 */
export const MANIFESTS: Record<string, AssetManifest> = {
  [REEF_MANIFEST.id]: REEF_MANIFEST,
  [KILAUEA_MANIFEST.id]: KILAUEA_MANIFEST,
  [TRAMDASH_MANIFEST.id]: TRAMDASH_MANIFEST,
  [TRAMDASH_CHASE_MANIFEST.id]: TRAMDASH_CHASE_MANIFEST,
};
