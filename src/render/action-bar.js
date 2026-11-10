// Shared CSS-pixel geometry for the painted action bar and its DOM buttons.
export function actionLayout(w, h, overlay = {}) {
  const mobile = w < 680;
  const s = mobile ? .8 : Math.max(.82, Math.min(1.5, Math.min(w / 1440, h / 900)));
  const size = mobile ? Math.min(42, (w - 49) / 6) : 43 * s;
  const gap = mobile ? 3 : 4 * s, cols = mobile ? 6 : 12;
  const total = cols * size + (cols - 1) * gap;
  return { w, h, s, mobile, size, gap, cols, total, x: (w-total)/2, y: h-(mobile ? size*2+42 : 73*s), replay: overlay.replay };
}

export function abilityButtons(view, script, w, h, keys = {}) {
  const l = actionLayout(w,h), a = view.abilities;
  return (a?.list || []).filter(id => script.playerAbilities[id]).map((id,i) => {
    const def = script.playerAbilities[id];
    const cooldown = Math.max(0,(a.readyAt[id] ?? -Infinity)-view.t,def.gcd ? a.gcdUntil-view.t : 0);
    return { id, x: l.x+(i%l.cols)*(l.size+l.gap), y: l.y+Math.floor(i/l.cols)*(l.size+l.gap), size: l.size,
      label: `${def.label || id}${keys[id] ? ` (${keys[id]})` : ''}`,
      tip: def.tip || '', cooldown,
      disabled: cooldown > 0 || view.world.player.fearedUntil > view.t || view.world.player.stunnedUntil > view.t };
  });
}
