// Classic-inspired HUD. Pure view reader; only presentation history is retained.
// Static chrome and original artwork are cached by ui/art.js.
import { getBossPortrait, getPlayerPortrait } from './portraits.js';
import { actionLayout } from './action-bar.js';
import {
  C,
  UI_FONT,
  TITLE_FONT,
  frame,
  statusBar,
  socket,
  icon,
  portrait,
  portraitRing,
  wing,
  elite,
  label,
  wrapped,
  fit,
  gradient,
  circle,
  poly,
} from './ui/art.js';

const SHORT = {
  taunt: 'Taunt',
  attack: 'Attack',
  heal: 'Heal',
  dispel: 'Dispel',
  interrupt: 'Interrupt',
};
const ROLE = {
  tank: 'Main tank',
  offtank: 'Off-tank',
  melee: 'Melee',
  ranged: 'Ranged',
  healer: 'Healer',
};
const history = new WeakMap();
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const formatTime = (t) =>
  `${Math.floor(Math.max(0, t) / 60)}:${String(Math.floor(Math.max(0, t) % 60)).padStart(2, '0')}`;
const good = (settings) => (settings.colorblind ? '#75d9ff' : '#6df176');

export function drawHUD(
  ctx,
  view,
  script,
  settings,
  pal,
  w,
  h,
  now,
  abilityKeys = {},
  overlay = {},
  threatRatioFn = null,
) {
  if (overlay.idle) return;
  const layout = actionLayout(w, h, overlay);
  const { mobile, s } = layout;
  const state = track(ctx, view, script, !!overlay.replay);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  edgeFeedback(ctx, view, w, h, now);
  unitFrames(ctx, view, script, settings, w, s, mobile);
  raidFrames(ctx, view, script, settings, s, mobile);
  debuffs(ctx, view, s, mobile, w);
  const objectiveBottom = objective(
    ctx,
    view,
    script,
    settings,
    w,
    h,
    s,
    mobile,
  );
  timers(ctx, view, settings, w, h, s, mobile, objectiveBottom, !!overlay.replay);
  threat(
    ctx,
    view,
    script,
    settings,
    w,
    h,
    s,
    mobile,
    threatRatioFn,
    !!overlay.replay,
  );
  chat(ctx, state, view, w, h, s, mobile, !!overlay.replay);
  if (!overlay.replay) {
    actionChrome(ctx, layout);
    if (settings.cueLane !== false && view.cues)
      noteLane(ctx, view, script, settings, layout, now);
    abilities(ctx, view, script, settings, layout, abilityKeys);
  }
  warnings(ctx, view, settings, w, h, s, mobile, now, state);
  floating(ctx, view, state, settings, w, h, s, mobile);
  if (view.world.player.fearedUntil > view.t) {
    label(
      ctx,
      'FEARED',
      w / 2 + Math.sin(now * 30) * 2,
      h * (mobile ? 0.47 : 0.39),
      30 * s,
      '#dfb3ff',
      'center',
      true,
    );
    label(
      ctx,
      `${(view.world.player.fearedUntil - view.t).toFixed(1)}s`,
      w / 2,
      h * (mobile ? 0.47 : 0.39) + 30 * s,
      14 * s,
      '#dfb3ff',
      'center',
    );
  }
  if (overlay.replay) {
    const rx = mobile ? w / 2 : w * 0.64;
    label(
      ctx,
      `Replay  ${formatTime(overlay.replay.t)} / ${formatTime(overlay.replay.duration)}${overlay.replay.playing ? '' : '  ·  Paused'}`,
      rx,
      mobile ? h - 190 : 24 * s,
      13 * s,
      C.gold,
      'center',
      true,
    );
    label(
      ctx,
      'Space: play/pause · Tab: view · Esc: scorecard',
      rx,
      mobile ? h - 169 : 45 * s,
      10 * s,
      C.muted,
      'center',
    );
  } else {
    const mode = `${settings.view === 'topdown' ? 'Map' : 'POV'}  ·  Tab: view  ·  Esc: menu${settings.speed !== 1 && settings.speed ? `  ·  ${Math.round(settings.speed * 100)}% speed` : ''}`;
    label(ctx, mode, w / 2, h - 9 * s, mobile ? 9 : 10 * s, C.muted, 'center');
  }
  // DOM pause owns its window. A small status stays clear of it on a split HUD canvas.
  if (overlay.paused)
    label(
      ctx,
      'Paused  ·  Esc to resume',
      w / 2,
      h - 95 * s,
      15 * s,
      C.gold,
      'center',
      true,
    );
  ctx.restore();
}

function unitFrames(c, v, script, settings, w, s, mobile) {
  const x = 18 * s,
    y = 24 * s,
    pw = (mobile ? 230 : 250) * s,
    ph = 72 * s;
  frame(c, x + 43 * s, y + 7 * s, pw - 43 * s, 57 * s, true);
  const ps = 64 * s;
  const playerSource = getPlayerPortrait(v.role, Math.ceil(ps * 2));
  c.save();
  circle(c, x + ps / 2, y + ps / 2, ps / 2);
  c.clip();
  if (playerSource && c.drawImage) c.drawImage(playerSource, x, y, ps, ps);
  else portrait(c, `player:${v.role}`, x, y, ps);
  c.restore();
  portraitRing(c, x, y, ps);
  const bx = x + 67 * s,
    bw = pw - 73 * s;
  c.fillStyle = '#171a15';
  c.fillRect(bx, y + 12 * s, bw, 16 * s);
  label(
    c,
    ROLE[v.role] || 'Adventurer',
    bx + bw / 2,
    y + 20 * s,
    13 * s,
    C.light,
    'center',
    true,
  );
  const p = v.world.player,
    pct = Math.round((100 * p.hp) / p.maxHp);
  statusBar(
    c,
    bx,
    y + 31 * s,
    bw,
    17 * s,
    p.hp / p.maxHp,
    settings.colorblind ? '#228ac7' : C.green,
  );
  label(
    c,
    `${Math.ceil(p.hp)} / ${p.maxHp}  (${pct}%)`,
    bx + bw / 2,
    y + 39 * s,
    10 * s,
    '#fff',
    'center',
  );
  // There is no mana in this simulation: blue strip represents actual GCD recovery.
  const gcd = Math.max(0, (v.abilities.gcdUntil || 0) - v.t),
    recovery = 1 - clamp(gcd / (script.gcd || 1.5), 0, 1);
  statusBar(c, bx, y + 49 * s, bw, 9 * s, recovery, C.blue);
  circle(c, x + 9 * s, y + 59 * s, 10 * s, '#1e2325', '#b2a16c', 2 * s);
  label(c, '60', x + 9 * s, y + 59 * s, 10 * s, C.light, 'center');
  label(
    c,
    gcd ? `Recovering ${gcd.toFixed(1)}s` : 'Ready',
    bx + bw / 2,
    y + 54 * s,
    8 * s,
    '#c6dcff',
    'center',
  );

  const tx = mobile ? 16 * s : x + pw + 30 * s,
    ty = mobile ? 108 * s : y,
    tw = (mobile ? 230 : 280) * s;
  const ts = 63 * s,
    px = tx + tw - ts - 3 * s;
  frame(c, tx, ty + 10 * s, tw - 35 * s, 57 * s, true);
  c.fillStyle = gradient(c, tx, ty, tw, 0, [
    [0, '#311315'],
    [1, '#642024'],
  ]);
  c.fillRect(tx + 7 * s, ty + 16 * s, tw - ts - 9 * s, 17 * s);
  label(
    c,
    fitName(c, script.name, tw - ts - 16 * s, 13 * s),
    tx + 13 * s,
    ty + 24 * s,
    13 * s,
    C.light,
    'left',
    true,
  );
  const hpw = tw - ts - 12 * s;
  statusBar(c, tx + 7 * s, ty + 35 * s, hpw, 21 * s, v.hp ?? 1, '#b82625');
  label(
    c,
    `${Math.round((v.hp ?? 1) * 100)}%`,
    tx + 7 * s + hpw / 2,
    ty + 45 * s,
    12 * s,
    '#fff',
    'center',
  );
  const source = getBossPortrait(
    script.raidInfo?.id,
    script.id,
    Math.ceil(ts * 2),
  );
  c.save();
  circle(c, px + ts / 2, ty + ts / 2 + 6 * s, ts / 2);
  c.clip();
  if (source && c.drawImage) c.drawImage(source, px, ty + 6 * s, ts, ts);
  else portrait(c, `${script.raidInfo?.id}:${script.id}`, px, ty + 6 * s, ts);
  c.restore();
  portraitRing(c, px, ty + 6 * s, ts);
  elite(c, tx - 5 * s, ty - 4 * s, tw + 18 * s, 85 * s);
  // Skull level badge uses original skull art at a readable size.
  circle(c, px + ts - 5 * s, ty + 65 * s, 12 * s, '#241a15', '#b59a57', 2 * s);
  skull(c, px + ts - 5 * s, ty + 65 * s, 15 * s);
  label(
    c,
    'Elite',
    tx + hpw / 2 + 6 * s,
    ty + 63 * s,
    9 * s,
    C.gold,
    'center',
    true,
  );
  const cast = v.world.boss.cast;
  if (cast) {
    const cy = ty + 84 * s,
      ch = 20 * s,
      iw = 24 * s,
      ww = tw - 15 * s;
    socket(c, tx, cy - 3 * s, iw);
    icon(c, cast.icon || cast.id, tx + 3 * s, cy, iw - 6 * s);
    frame(c, tx + iw + 3 * s, cy, ww - iw, ch);
    statusBar(
      c,
      tx + iw + 6 * s,
      cy + 3 * s,
      ww - iw - 6 * s,
      ch - 6 * s,
      clamp((v.t - cast.start) / Math.max(0.01, cast.end - cast.start), 0, 1),
      '#caa43c',
    );
    label(
      c,
      fitName(c, cast.label, ww - iw - 47 * s, 10 * s),
      tx + iw + 9 * s,
      cy + ch / 2,
      10 * s,
      '#fff',
    );
    label(
      c,
      `${Math.max(0, cast.end - v.t).toFixed(1)}s`,
      tx + ww - 6 * s,
      cy + ch / 2,
      10 * s,
      C.light,
      'right',
    );
  }
}
function fitName(c, str, width, size) {
  size = Math.max(9, size);
  c.font = `400 ${size}px ${TITLE_FONT}`;
  return fit(c, str, width);
}
function skull(c, x, y, size) {
  c.save();
  c.translate(x - size / 2, y - size / 2);
  c.scale(size / 20, size / 20);
  circle(c, 10, 8, 7, '#e5ddc2', '#29241c', 1);
  poly(
    c,
    [
      [5, 10],
      [15, 10],
      [14, 18],
      [6, 18],
    ],
    '#d8cfb0',
  );
  circle(c, 7, 8, 2, '#151515');
  circle(c, 13, 8, 2, '#151515');
  poly(
    c,
    [
      [10, 10],
      [8, 13],
      [12, 13],
    ],
    '#191918',
  );
  for (let i = 0; i < 3; i++) {
    c.fillStyle = '#615b4c';
    c.fillRect(7 + i * 3, 15, 1, 3);
  }
  c.restore();
}

function raidFrames(c, v, script, settings, s, mobile) {
  const x = 18 * s,
    y = (mobile ? 230 : 155) * s,
    ww = (mobile ? 153 : 192) * s;
  label(c, 'Raid', x, y, 13 * s, C.gold, 'left', true);
  const tank = v.tankRole !== false ? v.world.player : v.world.ghost;
  if (tank) {
    const frac = clamp(tank.hp / tank.maxHp, 0, 1),
      low = frac < (script.ghostTank?.lowHp ?? 0.5),
      yy = y + 14 * s;
    frame(c, x, yy, ww, 45 * s);
    statusBar(
      c,
      x + 4 * s,
      yy + 4 * s,
      ww - 8 * s,
      35 * s,
      frac,
      low ? '#c52d26' : settings.colorblind ? '#228ac7' : '#27993a',
    );
    label(
      c,
      v.tankRole !== false ? 'Main tank · You' : 'Main tank',
      x + 9 * s,
      yy + 14 * s,
      11 * s,
      '#fff',
    );
    label(
      c,
      `${Math.round(frac * 100)}%${low ? '  HEAL' : ''}`,
      x + ww - 8 * s,
      yy + 31 * s,
      14 * s,
      low ? '#ffe08c' : '#fff',
      'right',
    );
    if (low) {
      c.strokeStyle = '#ff4a32';
      c.lineWidth = 2 * s;
      c.strokeRect(x, yy, ww, 45 * s);
    }
    const tankDebuffs = (v.debuffs || [])
      .filter((d) => d.on === (v.tankRole !== false ? 'player' : 'ghost'))
      .slice(0, 3);
    tankDebuffs.forEach((d, i) => {
      const ix = x + ww + 5 * s + i * 24 * s;
      socket(c, ix, yy, 22 * s);
      icon(c, d.dispel || d.name, ix + 3 * s, yy + 3 * s, 16 * s);
      label(
        c,
        `${Math.ceil(Math.max(0, d.until - v.t))}`,
        ix + 11 * s,
        yy + 30 * s,
        10 * s,
        C.light,
        'center',
      );
    });
  }
  // The contract supplies roster positions, not individual raid health. Show a
  // compact roster and debuff count instead of painting fictional health bars.
  const dots = v.world.raid?.dots || [],
    rosterY = y + 70 * s;
  label(c, `Raid roster · ${dots.length}`, x, rosterY, 10 * s, C.muted);
  if (mobile) {
    const melee = dots.filter((d) => d.melee).length;
    label(
      c,
      `Melee ${melee} · Ranged ${dots.length - melee}`,
      x,
      rosterY + 15 * s,
      11 * s,
      '#b8c8d1',
    );
    const afflicted = (v.debuffs || []).filter((d) => d.on === 'raid').length;
    if (afflicted)
      label(
        c,
        `Raid debuffs: ${afflicted}`,
        x,
        rosterY + 31 * s,
        11 * s,
        '#dbafed',
      );
    return;
  }
  const cols = 10,
    cell = 17 * s;
  dots.slice(0, 40).forEach((d, i) => {
    const xx = x + (i % cols) * (cell + 2 * s),
      yy = rosterY + 10 * s + Math.floor(i / cols) * 14 * s;
    c.fillStyle = '#0c1012';
    c.fillRect(xx, yy, cell, 12 * s);
    c.fillStyle = d.melee ? '#b28e67' : '#78a5cc';
    c.fillRect(xx + 2 * s, yy + 2 * s, 3 * s, 8 * s);
    label(
      c,
      d.melee ? 'M' : 'R',
      xx + cell * 0.68,
      yy + 6 * s,
      8 * s,
      '#d8d9cb',
      'center',
    );
  });
  const n = (v.debuffs || []).filter((d) => d.on === 'raid').length;
  if (n)
    label(
      c,
      `Raid debuffs: ${n}`,
      x,
      rosterY + 17 * s + Math.ceil(dots.length / cols) * 14 * s,
      11 * s,
      '#dbafed',
    );
}
function debuffs(c, v, s, mobile, w) {
  const rows = (v.debuffs || []).slice(0, 8);
  if (!rows.length) return;
  // Individual names, affected unit, stacks, dispel type and expiry remain visible.
  const x = mobile ? w - 185 * s : 290 * s,
    y = (mobile ? 335 : 147) * s,
    size = 27 * s,
    cols = mobile ? 1 : 2;
  const colors = {
    magic: '#669dff',
    curse: '#c36cff',
    poison: '#65c942',
    disease: '#d7a45e',
    enrage: '#f15036',
    none: '#9a9691',
  };
  rows.forEach((d, i) => {
    const xx = x + (i % cols) * 174 * s,
      yy = y + Math.floor(i / cols) * 45 * s;
    socket(c, xx, yy, size);
    icon(c, d.dispel || d.name, xx + 3 * s, yy + 3 * s, size - 6 * s);
    c.strokeStyle = colors[d.dispel] || colors.none;
    c.lineWidth = 2 * s;
    c.strokeRect(xx + 0.5, yy + 0.5, size - 1, size - 1);
    label(
      c,
      `${Math.ceil(Math.max(0, d.until - v.t))}s`,
      xx + size / 2,
      yy + size + 8 * s,
      10 * s,
      '#fff',
      'center',
    );
    label(
      c,
      fitName(c, d.name, mobile ? 147 * s : 132 * s, 10 * s),
      xx + size + 5 * s,
      yy + 7 * s,
      10 * s,
      C.text,
    );
    label(
      c,
      `${d.on === 'ghost' ? 'Tank' : d.on === 'player' ? 'You' : 'Raid'} · ${d.dispel || 'none'}${d.stacks > 1 ? ` ×${d.stacks}` : ''}`,
      xx + size + 5 * s,
      yy + 22 * s,
      9 * s,
      colors[d.dispel] || C.muted,
    );
  });
  if ((v.debuffs || []).length > rows.length)
    label(
      c,
      `+${v.debuffs.length - rows.length} more`,
      x,
      y + Math.ceil(rows.length / cols) * 45 * s,
      10 * s,
      C.gold,
    );
}
function objective(c, v, script, settings, w, h, s, mobile) {
  const ww = (mobile ? 180 : 242) * s,
    x = w - ww - 21 * s,
    y = (mobile ? 207 : 258) * s;
  label(c, 'Objectives', x, y, 15 * s, C.gold, 'left', true);
  c.strokeStyle = '#b99b5266';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x, y + 13 * s);
  c.lineTo(x + ww, y + 13 * s);
  c.stroke();
  let yy = y + 30 * s;
  yy += wrapped(
    c,
    `${v.phaseName || 'Phase'}${v.phaseSubtitle ? ' — ' + v.phaseSubtitle : ''}`,
    x,
    yy,
    ww,
    12 * s,
    C.yellow,
    16 * s,
  );
  const ne = v.nextExpected;
  if (ne) {
    yy += 10 * s;
    label(c, '◆', x, yy, 11 * s, ne.kind === 'fix' ? '#ff6254' : C.gold);
    yy += wrapped(
      c,
      ne.label,
      x + 15 * s,
      yy,
      ww - 15 * s,
      12 * s,
      ne.kind === 'fix' ? '#ff7764' : C.text,
      17 * s,
    );
    if (ne.deadline != null) {
      const left = ne.deadline - v.t;
      label(
        c,
        left >= 0
          ? `Time remaining: ${Math.ceil(left)}s`
          : `Overdue: +${Math.ceil(-left)}s`,
        x + 15 * s,
        yy + 4 * s,
        10 * s,
        left < 0 ? '#ff7664' : C.gold,
      );
    }
  }
  return yy + (ne?.deadline != null ? 18 : 8) * s;
}
function timers(c, v, settings, w, h, s, mobile, objectiveBottom, replay) {
  // Same 20 second horizon as the old timeline; ordered farthest first so
  // the imminent event always occupies the bottom of the stack.
  const events = (v.upcoming || [])
    .filter((e) => e.in <= 20 && e.in >= -0.5)
    .slice(0, mobile ? 4 : 6)
    .reverse();
  if (!events.length) return;
  const ww = (mobile ? 178 : 245) * s,
    x = w - ww - 22 * s - (replay && !mobile ? 240 * s : 0),
    bottom = mobile ? h * 0.62 : h * 0.7;
  let yy = Math.max(
    objectiveBottom + 26 * s,
    bottom - events.reduce((n, e) => n + (e.in < 3 ? 30 : 24) * s, 0),
  );
  label(c, 'Boss timers', x, yy - 13 * s, 11 * s, C.muted, 'left', true);
  events.forEach((up) => {
    const urgent = up.in < 3,
      hh = (urgent ? 27 : 21) * s,
      ex = urgent ? x - 8 * s : x,
      ew = urgent ? ww + 8 * s : ww,
      iz = hh;
    socket(c, ex, yy, iz);
    icon(c, up.icon || up.id, ex + 3 * s, yy + 3 * s, iz - 6 * s);
    frame(c, ex + iz + 2 * s, yy, ew - iz, hh);
    const color = urgent ? '#c73028' : up.warn ? '#a4822c' : '#496d99';
    statusBar(
      c,
      ex + iz + 5 * s,
      yy + 3 * s,
      ew - iz - 6 * s,
      hh - 6 * s,
      Math.max(0.025, up.in / 20),
      color,
    );
    label(
      c,
      fitName(c, up.label, ew - iz - 43 * s, urgent ? 12 * s : 11 * s),
      ex + iz + 9 * s,
      yy + hh / 2,
      urgent ? 12 * s : 11 * s,
      '#fff',
    );
    label(
      c,
      `${Math.max(0, up.in).toFixed(1)}`,
      ex + ew - 3 * s,
      yy + hh / 2,
      urgent ? 13 * s : 11 * s,
      urgent ? '#fff1bc' : C.text,
      'right',
    );
    yy += hh + 3 * s;
  });
}
function threat(c, v, script, settings, w, h, s, mobile, ratioFn, replay) {
  const th = v.threat,
    b = v.world.boss,
    tank = v.tankRole !== false;
  const ratio = ratioFn
    ? ratioFn(th)
    : th.player > 0
      ? Math.min(1, th.raid / th.player)
      : th.raid > 0
        ? 1
        : 0;
  const band = tank
    ? (script.threat.dangerBand ?? 0.8)
    : (script.threat.dangerBandDps ?? script.threat.dangerBand ?? 0.8);
  const loose =
    b.engaged &&
    b.state === 'grounded' &&
    (tank ? b.target === 'raid' : b.target === 'player');
  const danger = loose || ratio >= band,
    ww = (mobile ? 148 : 220) * s,
    x = w - ww - 20 * s,
    y = replay
      ? h - (mobile ? 230 : 155) - 96 * s
      : h - (mobile ? 305 : 132) * s;
  frame(c, x, y, ww, 96 * s);
  c.fillStyle = '#272827';
  c.fillRect(x + 4 * s, y + 4 * s, ww - 8 * s, 17 * s);
  label(c, 'Threat', x + 10 * s, y + 12 * s, 11 * s, C.gold, 'left', true);
  label(c, '%', x + ww - 10 * s, y + 12 * s, 10 * s, C.muted, 'right');
  const rows = tank
    ? [
        ['You', 1, '#96734f'],
        ['Raid', ratio, danger ? '#c32e23' : '#577faa'],
      ]
    : [
        ['Tank', 1, '#96734f'],
        ['You', ratio, danger ? '#c32e23' : '#577faa'],
      ];
  rows.forEach(([name, frac, color], i) => {
    const yy = y + 25 * s + i * 20 * s;
    statusBar(c, x + 7 * s, yy, ww - 14 * s, 17 * s, frac, color);
    label(c, name, x + 12 * s, yy + 8 * s, 10 * s, '#fff');
    label(
      c,
      `${Math.round(frac * 100)}`,
      x + ww - 12 * s,
      yy + 8 * s,
      10 * s,
      '#fff',
      'right',
    );
  });
  const msg = tank
    ? loose
      ? 'BOSS ON RAID · TAUNT'
      : th.tauntUntil > v.t
        ? 'Taunted'
        : `Raid at ${Math.round(ratio * 100)}%`
    : loose
      ? 'BOSS ON YOU · STOP'
      : b.target === 'raid' && b.engaged && b.state === 'grounded'
        ? 'BOSS LOOSE · HOLD'
        : th.ghostTauntUntil > v.t
          ? 'TANK TAUNTED · HOLD'
          : `${Math.round(ratio * 100)}% of the tank`;
  label(
    c,
    fitName(c, msg, ww - 12 * s, 10 * s),
    x + ww / 2,
    y + 82 * s,
    10 * s,
    danger ? '#ff8b6e' : C.muted,
    'center',
  );
  // Pull threshold is visible even before danger state.
  c.fillStyle = C.gold;
  c.fillRect(x + 7 * s + (ww - 14 * s) * band, y + 45 * s, 1, 17 * s);
}

function actionChrome(c, l) {
  const { x, y, total, size, gap, mobile, s, cols } = l;
  frame(
    c,
    x - 9 * s,
    y - 9 * s,
    total + 18 * s,
    mobile ? size * 2 + gap + 16 * s : size + 18 * s,
    true,
    true,
  );
  if (!mobile) {
    wing(c, x - 79 * s, y - 23 * s, 80 * s, 74 * s);
    wing(c, x + total - s, y - 23 * s, 80 * s, 74 * s, true);
  } else if (x >= 47) {
    wing(c, x - 46, y + size + gap - 8, 46, 43);
    wing(c, x + total, y + size + gap - 8, 46, 43, true);
  }
  for (let i = 0; i < 12; i++)
    socket(
      c,
      x + (i % cols) * (size + gap),
      y + Math.floor(i / cols) * (size + gap),
      size,
      true,
    );
  // Segmented experience-style rail is ornamental: no invented XP number.
  c.fillStyle = '#060708';
  c.fillRect(x, y + size + (mobile ? size + gap : 0) + 12 * s, total, 5 * s);
  for (let i = 0; i < 20; i++) {
    c.fillStyle = i < 20 ? '#586d94' : '#1b1b1b';
    c.fillRect(
      x + (i * total) / 20 + 1,
      y + size + (mobile ? size + gap : 0) + 13 * s,
      total / 20 - 2,
      2 * s,
    );
  }
}
function abilities(c, v, script, settings, l, keys) {
  const { x, y, size, gap, s, cols } = l,
    order = v.abilities?.list || ['taunt'];
  order.forEach((id, i) => {
    const xx = x + (i % cols) * (size + gap),
      yy = y + Math.floor(i / cols) * (size + gap),
      def = script.playerAbilities[id];
    if (!def) return;
    icon(c, id, xx + 4 * s, yy + 4 * s, size - 8 * s);
    const used = v.abilities.lastUsed;
    if (used?.id === id && v.t - used.at >= 0 && v.t - used.at < .25) {
      c.fillStyle = `rgba(255,230,160,${.3 * (1-(v.t-used.at)/.25)})`;
      c.fillRect(xx+3*s, yy+3*s, size-6*s, size-6*s);
    }
    const cd = Math.max(0, (v.abilities.readyAt[id] ?? -Infinity) - v.t),
      onCd = cd > 0 && def.cooldown > 0;
    const gcd = def.gcd ? Math.max(0, v.abilities.gcdUntil - v.t) : 0;
    if (onCd || gcd) {
      const frac = clamp(
        onCd ? cd / def.cooldown : gcd / (script.gcd || 1.5),
        0,
        1,
      );
      c.save();
      c.beginPath();
      c.rect(xx + 3 * s, yy + 3 * s, size - 6 * s, size - 6 * s);
      c.clip();
      c.fillStyle = 'rgba(0,0,0,.72)';
      c.beginPath();
      c.moveTo(xx + size / 2, yy + size / 2);
      c.arc(
        xx + size / 2,
        yy + size / 2,
        size,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * frac,
      );
      c.closePath();
      c.fill();
      c.restore();
      if (onCd)
        label(
          c,
          cd >= 10 ? Math.ceil(cd) : cd.toFixed(1),
          xx + size / 2,
          yy + size / 2,
          18 * s,
          '#fff',
          'center',
        );
    }
    const active = id === 'taunt' && v.threat.tauntUntil > v.t,
      hold = id === 'attack' && v.feedback.holdAttack;
    if (active) {
      c.strokeStyle = '#ffe068';
      c.lineWidth = 2 * s;
      c.strokeRect(xx - 1, yy - 1, size + 2, size + 2);
      statusBar(
        c,
        xx + 4 * s,
        yy + size - 6 * s,
        size - 8 * s,
        3 * s,
        (v.threat.tauntUntil - v.t) / (script.threat.tauntDuration || 1),
        '#ffdc56',
      );
    }
    if (hold) {
      c.fillStyle = '#980800aa';
      c.fillRect(xx + 3 * s, yy + 3 * s, size - 6 * s, size - 6 * s);
      label(
        c,
        'HOLD',
        xx + size / 2,
        yy + size / 2,
        13 * s,
        '#fff0cb',
        'center',
      );
      c.strokeStyle = '#ff4b35';
      c.lineWidth = 2 * s;
      c.strokeRect(xx, yy, size, size);
    }
    label(
      c,
      keys[id] || '',
      xx + size - 5 * s,
      yy + 8 * s,
      12 * s,
      '#fff',
      'right',
    );
    label(
      c,
      SHORT[id] || def.label,
      xx + size / 2,
      yy + size + 7 * s,
      8 * s,
      C.muted,
      'center',
    );
    const hit = v.cues?.lastHit;
    if (hit && hit.ability === id && v.t - hit.t < 0.4) {
      const age = clamp((v.t - hit.t) / 0.4, 0, 1);
      c.save();
      c.globalAlpha = 1 - age;
      c.strokeStyle =
        hit.status === 'perfect'
          ? good(settings)
          : hit.status === 'good'
            ? C.yellow
            : '#ff5545';
      c.lineWidth = 2 * s;
      c.strokeRect(
        xx - age * 8 * s,
        yy - age * 8 * s,
        size + age * 16 * s,
        size + age * 16 * s,
      );
      c.restore();
    }
  });
  // Empty sockets intentionally have no bindings; only usable abilities advertise a key.
}
function noteLane(c, v, script, settings, l, now) {
  const { x, y, size, gap, s, mobile } = l,
    order = v.abilities?.list || ['taunt'],
    rot = v.cues;
  const lead = settings.laneLead || 3,
    hitY = y - 4 * s,
    travel = (mobile ? 125 : 155) * s,
    top = hitY - travel - 19 * s;
  const laneW = Math.max(order.length * (size + gap) - gap, 200 * s),
    x0 = x - 4 * s;
  const yFor = (dt) => hitY - clamp(dt / lead, 0, 1) * travel;
  c.save();
  c.fillStyle = gradient(c, 0, top, 0, hitY - top, [
    [0, '#070a0d00'],
    [0.25, '#070a0d45'],
    [1, '#070a0dc9'],
  ]);
  c.fillRect(x0, top, laneW + 8 * s, hitY - top);
  label(
    c,
    'Press as the note reaches its key',
    x0,
    top + 3 * s,
    10 * s,
    C.gold,
    'left',
    true,
  );
  for (let i = 0; i < order.length; i++) {
    const xx = x + i * (size + gap);
    const hot = rot.beats.some(
      (b) =>
        b.status === 'pending' && b.ability === order[i] && b.at - v.t <= lead,
    );
    c.fillStyle = gradient(c, 0, top, 0, hitY - top, [
      [0, '#dec26a00'],
      [1, hot ? '#dec26a40' : '#dec26a08'],
    ]);
    c.fillRect(xx, top + 18 * s, size, hitY - top - 18 * s);
    c.strokeStyle = '#d7ba7430';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(xx, top + 18 * s);
    c.lineTo(xx, hitY);
    c.moveTo(xx + size, top + 18 * s);
    c.lineTo(xx + size, hitY);
    c.stroke();
  }
  for (let sec = 1; sec <= lead; sec++) {
    const yy = yFor(sec);
    c.fillStyle = '#baaa7538';
    c.fillRect(x0, yy, laneW + 8 * s, 1);
    label(c, `${sec}s`, x0 - 5 * s, yy, 9 * s, C.muted, 'right');
  }
  c.fillStyle = '#ebd487';
  c.fillRect(x0, hitY, laneW + 8 * s, 2 * s);
  // Preserve precise late rings, NOW-only beats, early misses and hit deltas.
  const ns = size * 0.8;
  const ordered = [...rot.beats].sort(
    (a, b) =>
      (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1),
  );
  for (const b of ordered) {
    const col = order.indexOf(b.ability);
    if (col < 0) continue;
    const cx = x + col * (size + gap) + size / 2;
    if (b.status === 'pending') {
      const dt = b.at - v.t;
      if (dt > lead) continue;
      const yy = yFor(dt);
      socket(c, cx - ns / 2, yy - ns / 2, ns);
      icon(c, b.ability, cx - ns / 2 + 3 * s, yy - ns / 2 + 3 * s, ns - 6 * s);
      c.strokeStyle = '#f9dd83';
      c.lineWidth = 2 * s;
      c.strokeRect(cx - ns / 2, yy - ns / 2, ns, ns);
      if (dt <= 0) {
        const frac = clamp(1 + dt / Math.max(0.01, b.late), 0, 1);
        c.strokeStyle = C.yellow;
        c.lineWidth = 2.5 * s;
        c.beginPath();
        c.arc(
          cx,
          yy,
          ns * 0.7,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * frac,
        );
        c.stroke();
        if (b.early === 0) {
          c.strokeStyle = `rgba(255,65,40,${0.55 + 0.4 * Math.sin(now * 12)})`;
          c.strokeRect(
            cx - ns / 2 - 4 * s,
            yy - ns / 2 - 4 * s,
            ns + 8 * s,
            ns + 8 * s,
          );
          label(
            c,
            'NOW',
            cx,
            yy - ns / 2 - 11 * s,
            11 * s,
            '#ff6655',
            'center',
          );
        }
      }
      if (b.short) {
        const right = col === order.length - 1;
        label(
          c,
          b.short,
          right ? cx + ns / 2 + 5 * s : cx,
          right ? yy : yy - ns / 2 - (dt <= 0 && b.early === 0 ? 29 : 9) * s,
          10 * s,
          C.yellow,
          right ? 'left' : 'center',
        );
      }
    } else {
      const age = v.t - b.resolvedAt;
      if (age < 0 || age > 0.9) continue;
      c.save();
      c.globalAlpha = clamp(
        age < 0.08 ? age / 0.08 : 1 - (age - 0.08) / 0.82,
        0,
        1,
      );
      const yy = hitY - 31 * s - age * 28 * s,
        color =
          b.status === 'perfect'
            ? good(settings)
            : b.status === 'good'
              ? C.yellow
              : '#ff6251';
      label(
        c,
        { perfect: 'PERFECT', good: 'GOOD', missed: 'MISS' }[b.status] ||
          b.status,
        cx,
        yy,
        13 * s,
        color,
        'center',
        true,
      );
      if (b.status !== 'missed')
        label(
          c,
          `${b.delta > 0 ? '+' : ''}${b.delta.toFixed(2)}s`,
          cx,
          yy + 14 * s,
          10 * s,
          C.text,
          'center',
        );
      else {
        c.strokeStyle = '#fa6250';
        c.lineWidth = 2 * s;
        c.strokeRect(cx - ns / 2, hitY + age * 28 * s - ns / 2, ns, ns);
      }
      c.restore();
    }
  }
  const early = rot.lastEarly;
  if (early && v.t - early.t < 0.6) {
    const col = order.indexOf(early.ability);
    if (col >= 0) {
      c.save();
      c.globalAlpha = 1 - (v.t - early.t) / 0.6;
      label(
        c,
        'EARLY',
        x + col * (size + gap) + size / 2,
        hitY - 32 * s,
        13 * s,
        C.text,
        'center',
        true,
      );
      c.restore();
    }
  }
  if (rot.combo >= 2 || rot.bestCombo > 0) {
    const xx = Math.min(l.w - 70 * s, x0 + laneW + 20 * s);
    if (rot.combo >= 2) {
      label(
        c,
        `${rot.combo}×`,
        xx,
        hitY - 42 * s,
        25 * s,
        C.light,
        'left',
        true,
      );
      label(c, 'Combo', xx, hitY - 20 * s, 10 * s, C.gold);
    }
    if (rot.bestCombo > rot.combo)
      label(c, `Best ${rot.bestCombo}`, xx, hitY - 7 * s, 10 * s, C.muted);
  }
  c.restore();
}

function warnings(c, v, settings, w, h, s, mobile, now, state) {
  const list = [],
    lead = settings.warningLead ?? 5;
  for (const up of v.upcoming || [])
    if (up.warn && up.in <= lead && up.in > -0.2)
      list.push({
        text: `${up.label} in ${Math.max(1, Math.ceil(up.in))}`,
        red: up.in <= 2,
      });
  for (const hz of v.world.hazards || [])
    if (hz.state === 'active' && v.t - hz.activeAt < 1.5 && !hz.applies)
      list.unshift({
        text: hz.label || 'Hazard',
        red: true,
        age: v.t - hz.activeAt,
      });
  const b = v.world.boss;
  if (b.state === 'landing' || b.state === 'takeoff')
    list.unshift({ text: b.state === 'landing' ? 'LANDING' : 'TAKEOFF' });
  if (b.target === 'raid' && b.engaged && b.state === 'grounded')
    list.unshift({ text: 'BOSS ON THE RAID', red: true });
  for (const alert of state.alerts) {
    const age = v.t - alert.t;
    if (age >= 0 && age < 2 && !list.some((it) => it.text === alert.text))
      list.push({ text: alert.text, red: true, age: age * 0.75 });
  }
  let yy = h * (mobile ? 0.38 : 0.245);
  list.slice(0, 3).forEach((it, i) => {
    const sz = (mobile ? 18 : i ? 22 : 29) * s;
    c.save();
    if (it.age != null) c.globalAlpha = clamp(1 - it.age / 1.5, 0.15, 1);
    c.font = `400 ${sz}px ${TITLE_FONT}`;
    const width = c.measureText ? c.measureText(it.text).width : 0;
    const k = Math.min(1, (w - 30) / Math.max(1, width));
    label(
      c,
      it.text,
      w / 2,
      yy - (it.age || 0) * 12 * s,
      sz * k,
      it.red ? '#ff4e35' : C.yellow,
      'center',
      true,
    );
    c.restore();
    yy += 31 * s;
  });
}
function floating(c, v, state, settings, w, h, s, mobile) {
  const tick = v.feedback.lastTick;
  if (tick && v.t - tick.t >= 0 && v.t - tick.t < 1.6) {
    const age = v.t - tick.t;
    c.save();
    c.globalAlpha = clamp(1 - (age - 1) / 0.6, 0, 1);
    const yy = h * (mobile ? 0.52 : 0.44) - age * 12 * s;
    label(
      c,
      tick.status === 'ontime'
        ? 'ON TIME'
        : tick.status === 'late'
          ? `LATE +${(tick.lateBy || 0).toFixed(1)}s`
          : 'MISSED',
      w / 2,
      yy,
      21 * s,
      tick.status === 'ontime'
        ? good(settings)
        : tick.status === 'late'
          ? C.yellow
          : '#ff5e50',
      'center',
      true,
    );
    c.font = `600 ${12 * s}px ${UI_FONT}`;
    label(
      c,
      fit(c, tick.label, w - 40),
      w / 2,
      yy + 23 * s,
      12 * s,
      C.text,
      'center',
    );
    c.restore();
  }
  const toast = v.feedback.toast;
  if (toast && v.t - toast.t >= 0 && v.t - toast.t < 2.2) {
    const age = v.t - toast.t;
    c.save();
    c.globalAlpha = clamp(1 - (age - 1.65) / 0.55, 0, 1);
    c.font = `600 ${14 * s}px ${UI_FONT}`;
    const color =
      toast.kind === 'bad'
        ? '#ff6552'
        : toast.kind === 'warn'
          ? C.yellow
          : C.text;
    if (mobile)
      wrapped(
        c,
        toast.text,
        18 * s,
        h * 0.57 - age * 10 * s,
        w * 0.49,
        14 * s,
        color,
        18 * s,
      );
    else
      label(
        c,
        fit(c, toast.text, w - 25),
        w / 2,
        h * 0.57 - age * 10 * s,
        14 * s,
        color,
        'center',
      );
    c.restore();
  }
  state.float
    .filter((f) => v.t - f.t < 1.4)
    .forEach((f, i) => {
      const age = v.t - f.t;
      c.save();
      c.globalAlpha = clamp(1 - age / 1.4, 0, 1);
      label(
        c,
        f.text,
        (mobile ? w * 0.3 : w / 2) + (i % 2 ? 1 : -1) * (mobile ? 20 : 60) * s,
        h * 0.53 - age * 50 * s,
        20 * s,
        f.color,
        'center',
        true,
      );
      c.restore();
    });
}
function edgeFeedback(c, v, w, h, now) {
  const fb = v.feedback;
  if (!fb.facingWrong && !fb.inHazard) return;
  const color = fb.inHazard ? '#df5915' : '#bc241b';
  if (c.createRadialGradient) {
    const g = c.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.43,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.7,
    );
    g.addColorStop(0, '#00000000');
    g.addColorStop(1, color + '9a');
    c.save();
    c.globalAlpha = 0.4 + 0.15 * Math.sin(now * 6);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.restore();
  }
}
function track(c, v, script, replay) {
  let st = history.get(c);
  const key = `${script.id}:${v.role}:${replay}`;
  if (!st || st.key !== key || v.t < st.t - 0.05 || v.t - st.t > 0.5) {
    st = {
      key,
      t: v.t,
      lines: [],
      float: [],
      alerts: [],
      healthGain: 0,
      healthLoss: 0,
      healthAt: v.t,
      phase: null,
      cast: null,
      hp: v.world.player.hp,
      ready: {},
      deb: new Set(),
      tick: null,
      toast: null,
      hit: null,
      early: null,
    };
    history.set(c, st);
  }
  const add = (text, color = C.text) => {
    st.lines.push({ text, color, t: v.t });
    if (st.lines.length > 30) st.lines.shift();
  };
  if (st.phase !== v.phase) {
    add(
      `[Raid] ${v.phaseName}${v.phaseSubtitle ? ' — ' + v.phaseSubtitle : ''}`,
      '#ffce54',
    );
    st.phase = v.phase;
  }
  const cast = v.world.boss.cast,
    castKey = cast ? `${cast.id}:${cast.start}` : null;
  if (castKey && castKey !== st.cast) {
    add(`${script.name} begins to cast ${cast.label}.`, '#ffb259');
    st.alerts.push({ text: cast.label, t: v.t });
  }
  st.cast = castKey;
  st.alerts = st.alerts.filter((a) => v.t - a.t < 2).slice(-3);
  const tick = v.feedback.lastTick;
  if (tick && st.tick !== tick.t) {
    add(
      `${tick.status === 'ontime' ? 'On time' : tick.status === 'late' ? `Late +${(tick.lateBy || 0).toFixed(1)}s` : 'Missed'}: ${tick.label}`,
      tick.status === 'ontime' ? '#76e385' : '#ff8874',
    );
    st.tick = tick.t;
  }
  const toast = v.feedback.toast;
  if (toast && st.toast !== toast.t) {
    add(toast.text, toast.kind === 'bad' ? '#ff7564' : '#f3e5bf');
    st.toast = toast.t;
  }
  const hit = v.cues?.lastHit;
  if (hit && st.hit !== hit.t) {
    add(
      `${SHORT[hit.ability] || hit.ability}: ${hit.status}${hit.delta != null ? ` (${hit.delta > 0 ? '+' : ''}${hit.delta.toFixed(2)}s)` : ''}`,
      hit.status === 'missed' ? '#ff7c6d' : '#91dbff',
    );
    st.hit = hit.t;
  }
  const early = v.cues?.lastEarly;
  if (early && st.early !== early.t) {
    add(`${SHORT[early.ability] || early.ability}: too early.`, '#c2c1ee');
    st.early = early.t;
  }
  for (const [id, at] of Object.entries(v.abilities?.readyAt || {})) {
    if (st.ready[id] != null && at > st.ready[id] && at > v.t)
      add(`You use ${SHORT[id] || id}.`, '#e8dfa9');
    st.ready[id] = at;
  }
  for (const d of v.debuffs || []) {
    if (!st.deb.has(d.uid))
      add(
        `${d.on === 'ghost' ? 'Tank' : d.on === 'player' ? 'You' : 'Raid'} afflicted by ${d.name}${d.dispel && d.dispel !== 'none' ? ` (${d.dispel})` : ''}.`,
        '#ce9ff0',
      );
  }
  st.deb = new Set((v.debuffs || []).map((d) => d.uid));
  const delta = v.world.player.hp - st.hp;
  if (Math.abs(delta) > 0.1 && v.t > st.t) {
    if (delta > 0) st.healthGain += delta;
    else st.healthLoss -= delta;
    // Passive regeneration is continuous. Coalesce adjacent health changes so
    // they cannot drown out spell messages or spawn sixty floaters per second.
    const tag = delta > 0 ? 'heal' : 'damage',
      amount = Math.abs(delta),
      previous = st.lines.at(-1);
    const line =
      previous?.tag === tag
        ? previous
        : { tag, amount: 0, t: v.t, color: delta > 0 ? '#69ef72' : '#ff8070' };
    line.amount += amount;
    line.t = v.t;
    line.text =
      delta > 0
        ? `You recover ${Math.round(line.amount)} health.`
        : `You take ${Math.round(line.amount)} damage.`;
    if (line !== previous) {
      st.lines.push(line);
      if (st.lines.length > 30) st.lines.shift();
    }
  }
  if (
    v.t - st.healthAt >= 0.75 ||
    Math.abs(delta) > v.world.player.maxHp * 0.05
  ) {
    if (st.healthGain > 1)
      st.float.push({
        t: v.t,
        text: `+${Math.round(st.healthGain)}`,
        color: '#69ef72',
      });
    if (st.healthLoss > 1)
      st.float.push({
        t: v.t,
        text: `-${Math.round(st.healthLoss)}`,
        color: '#ff6860',
      });
    st.healthGain = 0;
    st.healthLoss = 0;
    st.healthAt = v.t;
  }
  st.float = st.float.filter((f) => v.t - f.t < 1.4).slice(-8);
  st.hp = v.world.player.hp;
  st.t = v.t;
  return st;
}
function chat(c, st, v, w, h, s, mobile, replay) {
  const x = 18 * s,
    bottom =
      replay && mobile ? h - 225 : h - (replay ? 175 : mobile ? 315 : 93) * s,
    ww = mobile ? Math.min(w * 0.5, 215 * s) : Math.min(350 * s, w * 0.28),
    height = (mobile ? 77 : 132) * s;
  // No frame: translucent Classic chat anchored at the lower left.
  c.fillStyle = gradient(c, x, bottom - height, ww, 0, [
    [0, '#090a0a90'],
    [1, '#090a0a00'],
  ]);
  c.fillRect(x - 5 * s, bottom - height, ww + 10 * s, height);
  label(c, 'General', x, bottom - height + 9 * s, 11 * s, C.gold, 'left', true);
  label(
    c,
    'Combat Log',
    x + 66 * s,
    bottom - height + 9 * s,
    11 * s,
    C.muted,
    'left',
    true,
  );
  const max = mobile ? 3 : 6,
    visible = st.lines.slice(-max),
    lineH = 17 * s;
  visible.forEach((ln, i) => {
    c.font = `500 ${11 * s}px ${UI_FONT}`;
    label(
      c,
      fit(c, ln.text, ww),
      x,
      bottom - (visible.length - 1 - i) * lineH,
      11 * s,
      ln.color,
    );
  });
}
