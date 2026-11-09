// DOM counterparts of the canvas HUD artwork; the same original art and portrait
// seam is used in encounter lists, hero portraits and role choices.
import { getBossPortrait } from '../render/portraits.js';
import { portrait, icon } from '../render/ui/art.js';
import { h } from './overlay.js';

export function bossPortrait(raidId, bossId, size = 48) {
  const canvas = h('canvas', {
    class: 'boss-portrait',
    width: size * 2,
    height: size * 2,
    'aria-hidden': 'true',
  });
  const c = canvas.getContext('2d');
  if (c) {
    c.scale(2, 2);
    const draw = () => {
      c.clearRect(0, 0, size, size);
      const source = getBossPortrait(raidId, bossId, size * 2);
      if (source) c.drawImage(source, 0, 0, size, size);
      else portrait(c, `${raidId}:${bossId}`, 0, 0, size);
      return !!source;
    };
    if (!draw())
      for (const delay of [200, 750, 2000])
        setTimeout(() => {
          if (canvas.isConnected) draw();
        }, delay);
  }
  return h(
    'span',
    { class: 'portrait-medallion', style: { '--portrait-size': `${size}px` } },
    canvas,
  );
}
export function abilityIcon(id, size = 32) {
  const cv = h('canvas', {
    class: 'ability-art',
    width: size * 2,
    height: size * 2,
    'aria-hidden': 'true',
  });
  const c = cv.getContext('2d');
  if (c) {
    c.scale(2, 2);
    icon(c, id, 0, 0, size);
  }
  return cv;
}
