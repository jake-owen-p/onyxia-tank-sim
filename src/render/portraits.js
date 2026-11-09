// Boss portraits for the target frame and the menus, rendered from the boss's own 3D model.
import { acquireWorld } from './gl/world.js';

/** A CanvasImageSource, or null while it is queued or when WebGL is unavailable. Safe to call every frame. */
export function getBossPortrait(raidId, bossId, size = 128) {
  const world = acquireWorld();
  return world ? world.portrait(raidId, bossId, size) : null;
}
