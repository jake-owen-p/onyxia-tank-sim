// Shared HUD layer drawn over either view. Reads only the view object and
// settings; never mutates them. Layout scales with the base unit `u`.

import { roundRect, drawIcon, drawTick, drawCross } from './shapes.js';
import { withAlpha, actionColor } from './palette.js';

const SHORT_LABEL = { taunt: 'Taunt', attack: 'Attack', heal: 'Heal', dispel: 'Dispel', interrupt: 'Kick' };
const abilityOrder = (view) => (view.abilities && view.abilities.list && view.abilities.list.length ? view.abilities.list : ['taunt']);

function font(ctx, pal, px, weight = 600, display = false) {
  ctx.font = `${weight} ${Math.round(px)}px ${display ? pal.fontDisplay : pal.font}`;
}

function text(ctx, str, x, y, align = 'left', baseline = 'middle') {
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

/** Stroke width that scales with the HUD unit (1px at 13", ~2px at 4K). */
const lw = (u, k = 1) => Math.max(1, (u / 16) * k);

function panel(ctx, pal, x, y, w, h, r = 8, u = 16) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = pal.panel; ctx.fill();
  ctx.strokeStyle = pal.panelEdge; ctx.lineWidth = lw(u); ctx.stroke();
}

function bar(ctx, x, y, w, h, frac, fg, bg, r = 4) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = bg; ctx.fill();
  if (frac > 0) {
    ctx.save();
    roundRect(ctx, x, y, w, h, r); ctx.clip();
    ctx.fillStyle = fg;
    ctx.fillRect(x, y, w * Math.min(1, frac), h);
    ctx.restore();
  }
}

/**
 * Draw the HUD.
 * @param threatRatioFn (threat) -> 0..1 danger fill
 */
export function drawHUD(ctx, view, script, settings, pal, w, h, now, abilityKeys = {}, overlay = {}, threatRatioFn = null) {
  if (overlay.idle) return;   // menu backdrop: world only, no HUD
  const u = Math.max(12, Math.min(32, Math.min(w, h) / 45));
  const t = view.t;
  const wd = view.world;
  const narrow = w < h;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  drawEdgeFeedback(ctx, view, pal, w, h, now);
  drawPhaseBlock(ctx, view, script, pal, u, w, h, t);
  drawCastBar(ctx, view, pal, u, w, h, t);
  drawWarnings(ctx, view, script, settings, pal, u, w, h, t, now);
  drawFeedbackTick(ctx, view, pal, u, w, h, t);
  drawToast(ctx, view, pal, u, w, h, t);
  drawCorner(ctx, view, settings, pal, u, w, h, overlay);

  // bottom stack: timeline, abilities, threat, hp. In replay the DOM scrubber
  // owns the bottom of the screen, so only the threat bar and HP remain.
  let threatY;
  const threatH = u * 0.95;
  if (overlay.replay) {
    threatY = h - u * 9 - threatH;   // clear of the ~7u DOM replay bar
  } else {
    const timelineH = u * 2.2;
    const timelineY = h - u * 0.9 - timelineH;
    drawTimeline(ctx, view, script, settings, pal, u, w, h, timelineY, timelineH, narrow);
    const iconSize = u * 2.7;
    const abilityY = timelineY - u * 0.7 - iconSize;
    const lay = abilityLayout(u, w, iconSize, abilityOrder(view));
    if (settings.cueLane !== false && view.cues) {
      const laneH = u * 5.5;
      const laneY = abilityY - u * 0.3 - laneH;
      drawLane(ctx, view, script, settings, pal, u, w, lay, laneY, abilityY, t, now);
      threatY = laneY - u * 0.55 - threatH;
    } else {
      threatY = abilityY - u * 0.6 - threatH;
    }
    drawAbilities(ctx, view, script, pal, u, lay, abilityY, abilityKeys, t);
  }
  drawThreat(ctx, view, script, pal, u, w, threatY, threatH, threatRatioFn, t);
  drawPlayerHp(ctx, view, pal, u, w, threatY - u * 0.35 - u * 0.4, u * 0.4);
  if (view.tankRole === false && view.world.ghost && view.world.ghost.tanking) drawTankHp(ctx, view, script, pal, u, w, threatY - u * 0.35 - u * 0.4 - u * 0.95, u * 0.6);
  if (view.debuffs && view.debuffs.length) drawDebuffTray(ctx, view, pal, u, w, h, t);

  if (wd.player.fearedUntil > t) drawFeared(ctx, pal, u, w, h, now);
  if (overlay.replay) drawReplayHud(ctx, overlay.replay, pal, u, w, h);
  if (overlay.paused) drawPaused(ctx, pal, u, w, h);
  ctx.restore();
}

// ------------------------------------------------------------------ edges

function drawEdgeFeedback(ctx, view, pal, w, h, now) {
  const fb = view.feedback;
  let color = null, strength = 0;
  if (fb.facingWrong) { color = pal.vignetteBad; strength = 0.55 + 0.45 * Math.sin(now * 5); }
  else if (fb.inHazard) { color = pal.vignetteHazard; strength = 0.6 + 0.4 * Math.sin(now * 8); }
  if (!color) return;
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, color);
  ctx.globalAlpha = 0.35 + 0.4 * strength;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ phase + next expected

function drawPhaseBlock(ctx, view, script, pal, u, w, h, t) {
  const x = u, y = u, pw = Math.min(u * 15, w * 0.42), ph = u * 4.3;
  panel(ctx, pal, x, y, pw, ph, u * 0.5, u);
  font(ctx, pal, u * 1.05, 700, true);
  ctx.fillStyle = pal.text;
  text(ctx, fit(ctx, (view.phaseName || 'Phase').toUpperCase(), pw - u * 1.6), x + u * 0.8, y + u * 0.95);
  const nameW = ctx.measureText ? measure(ctx, pal, u, (view.phaseName || 'Phase').toUpperCase()) : u * 5;
  font(ctx, pal, u * 0.72, 500);
  ctx.fillStyle = pal.textDim;
  const subRoom = pw - u * 1.6 - nameW - u * 0.5;
  if (subRoom > u * 2) text(ctx, fit(ctx, view.phaseSubtitle || '', subRoom), x + u * 0.8 + nameW + u * 0.5, y + u * 1.0);
  // boss hp
  const hpPct = Math.max(0, Math.min(100, Math.round((view.hp ?? 1) * 100)));
  const bx = x + u * 0.8, by = y + u * 1.75, bw = pw - u * 1.6, bh = u * 0.75;
  bar(ctx, bx, by, bw, bh, view.hp ?? 1, pal.hp, pal.hpBg, bh / 2);
  font(ctx, pal, u * 0.62, 700);
  ctx.fillStyle = pal.text;
  text(ctx, fit(ctx, `${(script.name || 'Boss').toUpperCase()}  ${hpPct}%`, bw - u), bx + bw / 2, by + bh / 2, 'center');
  // next expected
  const ne = view.nextExpected;
  if (ne) {
    const ny = y + u * 3.45;
    const color = ne.kind === 'fix' ? pal.bad : ne.kind === 'expectation' ? pal.accent : ne.kind === 'hint' ? pal.warn : pal.textDim;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(bx + u * 0.3, ny, u * 0.22, 0, Math.PI * 2); ctx.fill();
    font(ctx, pal, u * 0.72, 600);
    let label = ne.label;
    if (ne.deadline != null) {
      const left = ne.deadline - t;
      label += left >= 0 ? `  ·  ${Math.max(0, Math.ceil(left))}s` : `  ·  +${Math.ceil(-left)}s`;
    }
    ctx.fillStyle = ne.kind === 'fix' ? pal.bad : pal.text;
    text(ctx, fit(ctx, label, bw - u * 0.9), bx + u * 0.8, ny);
  }
}

function measure(ctx, pal, u, s) {
  font(ctx, pal, u * 1.05, 700, true);
  const m = ctx.measureText(s);
  return m && typeof m.width === 'number' ? m.width : u * 5;
}

/** Truncate a string with an ellipsis to fit `maxW` at the current font. */
function fit(ctx, s, maxW) {
  if (!ctx.measureText) return s;
  let m = ctx.measureText(s);
  if (!m || typeof m.width !== 'number' || m.width <= maxW) return s;
  let lo = 0, hi = s.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ctx.measureText(s.slice(0, mid) + '…').width <= maxW) lo = mid; else hi = mid - 1;
  }
  return s.slice(0, lo) + '…';
}

// ------------------------------------------------------------------ cast bar

function drawCastBar(ctx, view, pal, u, w, h, t) {
  const cast = view.world.boss.cast;
  if (!cast) return;
  const prog = Math.max(0, Math.min(1, (t - cast.start) / Math.max(0.01, cast.end - cast.start)));
  const left = Math.max(0, cast.end - t);
  const bw = Math.min(u * 18, w * 0.4), bh = u * 1.4;
  const x = w / 2 - bw / 2, y = u * 1.1;
  panel(ctx, pal, x - u * 0.3, y - u * 0.3, bw + u * 0.6, bh + u * 0.6, u * 0.4, u);
  bar(ctx, x + bh + u * 0.3, y + bh * 0.25, bw - bh - u * 0.3, bh * 0.5, prog, pal.castBar, pal.hpBg, bh * 0.25);
  // icon
  roundRect(ctx, x, y, bh, bh, u * 0.25);
  ctx.fillStyle = pal.iconBg; ctx.fill();
  drawIcon(ctx, cast.icon || cast.id, x + bh / 2, y + bh / 2, bh * 0.7, pal.text, pal.accent);
  font(ctx, pal, u * 0.78, 700);
  ctx.fillStyle = pal.text;
  text(ctx, cast.label.toUpperCase(), x + bh + u * 0.5, y + bh * 0.5 - u * 0.02, 'left');
  font(ctx, pal, u * 0.72, 600);
  ctx.fillStyle = pal.textDim;
  text(ctx, `${left.toFixed(1)}s`, x + bw, y + bh * 0.5, 'right');
}

// ------------------------------------------------------------------ warnings

function drawWarnings(ctx, view, script, settings, pal, u, w, h, t, now) {
  const lead = settings.warningLead ?? 5;
  const list = [];
  for (const up of view.upcoming) {
    if (!up.warn) continue;
    if (up.in <= lead && up.in > -0.2) list.push({ label: `${up.label.toUpperCase()} IN ${Math.max(1, Math.ceil(up.in))}`, color: actionColor(pal, up.id), icon: up.icon, frac: (Math.ceil(up.in) - up.in) });
  }
  // Just-happened flashes: hazards that went active, landing, takeoff.
  for (const hz of view.world.hazards) {
    if (hz.state === 'active' && t - hz.activeAt < 1.5) {
      const label = hz.kind === 'lane' ? 'DEEP BREATH' : 'ERUPTION';
      if (!list.some((l) => l.label === label)) list.unshift({ label, color: pal.hazardActive, icon: hz.kind === 'lane' ? 'deepbreath' : 'eruption', flash: 1 - (t - hz.activeAt) / 1.5 });
    }
  }
  const boss = view.world.boss;
  if (boss.state === 'landing') list.unshift({ label: 'LANDING', color: pal.accent, icon: 'landing', flash: 0.5 });
  if (boss.state === 'takeoff') list.unshift({ label: 'TAKEOFF', color: pal.accent, icon: 'takeoff', flash: 0.5 });
  if (boss.target === 'raid' && boss.engaged && boss.state === 'grounded') list.unshift({ label: 'BOSS ON THE RAID', color: pal.bad, icon: 'taunt', flash: 0.6 + 0.4 * Math.sin(now * 6) });
  if (!list.length) return;

  let y = h * 0.27;
  list.slice(0, 3).forEach((item, i) => {
    const big = i === 0;
    const px = big ? u * 2.1 : u * 1.25;
    // pop on each integer change, then settle
    const pop = item.frac != null ? Math.max(0, 1 - item.frac * 4) * 0.12 : 0;
    const scale = 1 + pop;
    font(ctx, pal, px, 800, true);
    const label = item.label;
    const tw = ctx.measureText ? (ctx.measureText(label).width || px * label.length * 0.6) : px * label.length * 0.6;
    const bw = tw + px * 2.2, bh = px * 1.55;
    ctx.save();
    ctx.translate(w / 2, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = item.flash != null ? 0.55 + 0.45 * item.flash : 1;
    roundRect(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2);
    ctx.fillStyle = withAlpha(pal.panel, 0.85); ctx.fill();
    ctx.strokeStyle = withAlpha(item.color, 0.8); ctx.lineWidth = lw(u, 2); ctx.stroke();
    drawIcon(ctx, item.icon, -bw / 2 + px * 0.95, 0, px * 0.9, item.color, item.color);
    font(ctx, pal, px, 800, true);
    ctx.fillStyle = item.color;
    text(ctx, label, px * 0.5, px * 0.05, 'center');
    ctx.restore();
    y += bh * 1.15;
  });
}

// ------------------------------------------------------------------ feedback tick + toast

function drawFeedbackTick(ctx, view, pal, u, w, h, t) {
  const lt = view.feedback.lastTick;
  if (!lt || t - lt.t > 1.6) return;
  const k = (t - lt.t) / 1.6;
  const a = k < 0.15 ? k / 0.15 : k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
  const y = h * 0.44;
  const size = u * 2;
  ctx.save();
  ctx.globalAlpha = Math.max(0, a);
  let color, label;
  if (lt.status === 'ontime') { color = pal.good; label = 'ON TIME'; }
  else if (lt.status === 'late') { color = pal.warn; label = `LATE +${(lt.lateBy || 0).toFixed(1)}s`; }
  else { color = pal.bad; label = 'MISSED'; }
  if (lt.status === 'ontime') drawTick(ctx, w / 2, y, size, color);
  else drawCross(ctx, w / 2, y, size, color);
  font(ctx, pal, u * 0.95, 800, true);
  ctx.fillStyle = color;
  text(ctx, label, w / 2, y + size * 0.95, 'center');
  font(ctx, pal, u * 0.72, 600);
  ctx.fillStyle = pal.textDim;
  text(ctx, lt.label, w / 2, y + size * 0.95 + u * 1.0, 'center');
  ctx.restore();
}

function drawToast(ctx, view, pal, u, w, h, t) {
  const ts = view.feedback.toast;
  if (!ts || t - ts.t > 2.2) return;
  const k = (t - ts.t) / 2.2;
  const a = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
  const color = ts.kind === 'bad' ? pal.bad : ts.kind === 'warn' ? pal.warn : pal.text;
  font(ctx, pal, u * 0.85, 700);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = color;
  text(ctx, ts.text, w / 2, h * 0.58, 'center');
  ctx.restore();
}

// ------------------------------------------------------------------ corner

function drawCorner(ctx, view, settings, pal, u, w, h, overlay) {
  font(ctx, pal, u * 0.68, 600);
  ctx.fillStyle = pal.textMuted;
  const viewName = (settings.view === 'topdown') ? 'TOP-DOWN' : 'POV';
  let s = `${viewName}  ·  Tab: switch view`;
  if (settings.speed && settings.speed !== 1) s += `  ·  ${Math.round(settings.speed * 100)}% speed`;
  const roleName = { tank: 'MAIN TANK', offtank: 'OFF-TANK', melee: 'MELEE DPS', ranged: 'RANGED DPS', healer: 'HEALER' }[view.role];
  if (roleName) s += `  ·  ${roleName}`;
  text(ctx, s, w - u, u * 1.2, 'right');
}

// ------------------------------------------------------------------ threat + hp

function drawThreat(ctx, view, script, pal, u, w, y, bh, threatRatioFn, t) {
  const bw = Math.min(u * 24, w * 0.6);
  const x = w / 2 - bw / 2;
  const th = view.threat;
  const ratio = threatRatioFn ? threatRatioFn(th) : (th.player > 0 ? Math.min(1, th.raid / th.player) : th.raid > 0 ? 1 : 0);
  const b = view.world.boss;
  const tankIsPlayer = view.tankRole !== false;
  const band = tankIsPlayer ? (script.threat.dangerBand ?? 0.8) : (script.threat.dangerBandDps ?? script.threat.dangerBand ?? 0.8);
  const onRaid = tankIsPlayer ? b.target === 'raid' && b.engaged && b.state === 'grounded' : b.target === 'player' && b.engaged && b.state === 'grounded';
  const danger = ratio >= band || onRaid;
  roundRect(ctx, x, y, bw, bh, bh / 2);
  ctx.fillStyle = pal.hpBg; ctx.fill();
  // danger band
  ctx.save();
  roundRect(ctx, x, y, bw, bh, bh / 2); ctx.clip();
  ctx.fillStyle = pal.threatBand;
  ctx.fillRect(x + bw * band, y, bw * (1 - band), bh);
  // fill: how close the raid is to pulling
  ctx.fillStyle = danger ? pal.threatDanger : pal.threatOk;
  ctx.fillRect(x, y, bw * (onRaid ? 1 : ratio), bh);
  ctx.restore();
  ctx.strokeStyle = withAlpha(danger ? pal.threatDanger : pal.panelEdge, 0.9); ctx.lineWidth = lw(u);
  roundRect(ctx, x, y, bw, bh, bh / 2); ctx.stroke();
  font(ctx, pal, u * 0.62, 700);
  ctx.fillStyle = pal.text;
  const label = tankIsPlayer
    ? (onRaid ? 'BOSS ON THE RAID  ·  TAUNT' : th.tauntUntil > t ? 'THREAT  ·  TAUNTED' : `THREAT  ·  RAID AT ${Math.round(ratio * 100)}%`)
    : (onRaid ? 'BOSS ON YOU  ·  STOP' : b.target === 'raid' && b.engaged && b.state === 'grounded' ? 'BOSS LOOSE  ·  HOLD' : th.ghostTauntUntil > t ? 'TANK TAUNTED  ·  HOLD' : `YOUR THREAT  ·  ${Math.round(ratio * 100)}% OF THE TANK`);
  text(ctx, label, x + bw / 2, y + bh / 2, 'center');
}

function drawPlayerHp(ctx, view, pal, u, w, y, bh) {
  const p = view.world.player;
  const bw = Math.min(u * 24, w * 0.6);
  const x = w / 2 - bw / 2;
  bar(ctx, x, y, bw, bh, p.hp / p.maxHp, pal.playerHp, pal.hpBg, bh / 2);
}

/** The ghost tank's health, for the roles that depend on it (the healer most of all). */
function drawTankHp(ctx, view, script, pal, u, w, y, bh) {
  const g = view.world.ghost;
  const bw = Math.min(u * 24, w * 0.6);
  const x = w / 2 - bw / 2;
  const frac = g.hp / g.maxHp;
  const low = frac < ((script.ghostTank && script.ghostTank.lowHp) ?? 0.5);
  bar(ctx, x, y, bw, bh, frac, low ? pal.bad : pal.ok, pal.hpBg, bh / 2);
  font(ctx, pal, u * 0.55, 700);
  ctx.fillStyle = pal.text;
  text(ctx, `TANK  ${Math.round(frac * 100)}%${low ? '  ·  HEAL' : ''}`, x + bw / 2, y + bh / 2, 'center');
}

/** Outstanding debuffs on you, the tank or the raid: what a healer must dispel. */
function drawDebuffTray(ctx, view, pal, u, w, h, t) {
  const x = u, y = u + u * 4.3 + u * 0.4;
  const pw = Math.min(u * 15, w * 0.42);
  const rows = view.debuffs.slice(0, 4);
  const ph = u * 1.1 + rows.length * u * 1.05;
  panel(ctx, pal, x, y, pw, ph, u * 0.5, u);
  font(ctx, pal, u * 0.42, 700);
  ctx.fillStyle = pal.textMuted;
  text(ctx, 'DEBUFFS', x + u * 0.8, y + u * 0.5, 'left');
  rows.forEach((d, i) => {
    const ry = y + u * 1.25 + i * u * 1.05;
    const dispellable = d.dispel && d.dispel !== 'none';
    ctx.fillStyle = dispellable ? pal.warn : pal.textDim;
    ctx.beginPath(); ctx.arc(x + u * 1.05, ry, u * 0.22, 0, Math.PI * 2); ctx.fill();
    font(ctx, pal, u * 0.62, 600);
    ctx.fillStyle = pal.text;
    const who = d.on === 'player' ? 'you' : d.on === 'ghost' ? 'tank' : 'raid';
    text(ctx, fit(ctx, `${d.name}${d.stacks > 1 ? ` x${d.stacks}` : ''} on ${who}`, pw - u * 4.2), x + u * 1.5, ry, 'left');
    font(ctx, pal, u * 0.5, 600);
    ctx.fillStyle = pal.textDim;
    text(ctx, `${Math.max(0, Math.ceil(d.until - t))}s`, x + pw - u * 0.8, ry, 'right');
  });
}

// ------------------------------------------------------------------ abilities

/** Column positions of the ability row; the press-cue lane uses the same columns. */
function abilityLayout(u, w, size, order) {
  const gap = u * 0.45;
  const n = order.length;
  const total = n * size + (n - 1) * gap;
  const x0 = w / 2 - total / 2;
  return { size, gap, order, xs: order.map((_, i) => x0 + i * (size + gap)), x0, x1: x0 + total };
}

function drawAbilities(ctx, view, script, pal, u, lay, y, abilityKeys, t) {
  const { size, gap } = lay;
  const A = view.abilities;
  const hit = view.cues && view.cues.lastHit;
  const order = lay.order;
  for (let i = 0; i < order.length; i++) {
    const id = order[i];
    const x = lay.xs[i];
    const def = script.playerAbilities[id];
    if (!def) continue;
    const readyAt = A.readyAt[id] ?? -Infinity;
    const cdLeft = Math.max(0, readyAt - t);
    const onGcd = def.gcd && A.gcdUntil > t;
    const active = id === 'taunt' && view.threat && view.threat.tauntUntil > t;   // she is held on you
    const hold = id === 'attack' && view.feedback && view.feedback.holdAttack;      // one more hit pulls her
    roundRect(ctx, x, y, size, size, u * 0.35);
    ctx.fillStyle = pal.iconBg; ctx.fill();
    const onCd = cdLeft > 0 && def.cooldown > 0;
    ctx.save();
    if (onCd) ctx.globalAlpha = 0.25;
    drawIcon(ctx, def.icon, x + size / 2, y + size / 2, size * 0.62, active ? pal.iconActive : pal.text, pal.accent);
    ctx.restore();
    // cooldown sweep (clockwise from 12 o'clock) for the remaining fraction
    if (onCd) {
      const frac = Math.min(1, cdLeft / def.cooldown);
      ctx.save();
      roundRect(ctx, x, y, size, size, u * 0.35); ctx.clip();
      ctx.fillStyle = pal.cooldown;
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + size / 2);
      ctx.arc(x + size / 2, y + size / 2, size, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac, false);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      const num = cdLeft >= 10 ? `${Math.ceil(cdLeft)}` : cdLeft.toFixed(1);
      font(ctx, pal, size * 0.34, 800, true);
      const nw = (ctx.measureText ? (ctx.measureText(num).width || size * 0.5) : size * 0.5) + size * 0.3;
      roundRect(ctx, x + size / 2 - nw / 2, y + size / 2 - size * 0.22, nw, size * 0.44, size * 0.22);
      ctx.fillStyle = withAlpha(pal.bg, 0.85); ctx.fill();
      ctx.fillStyle = pal.text;
      text(ctx, num, x + size / 2, y + size / 2, 'center');
    } else if (onGcd) {
      const frac = Math.min(1, (A.gcdUntil - t) / (script.gcd || 1.5));
      ctx.save();
      roundRect(ctx, x, y, size, size, u * 0.35); ctx.clip();
      ctx.fillStyle = pal.gcd;
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + size / 2);
      ctx.arc(x + size / 2, y + size / 2, size, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac, false);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // border / active ring
    roundRect(ctx, x, y, size, size, u * 0.35);
    ctx.strokeStyle = active ? pal.iconActive : pal.iconEdge;
    ctx.lineWidth = active ? lw(u, 2.5) : lw(u);
    ctx.stroke();
    if (active) {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.shadowBlur = u; ctx.shadowColor = pal.iconActive; ctx.stroke(); ctx.restore();
      // remaining hold time as a thin bar at the bottom
      const frac = Math.min(1, (view.threat.tauntUntil - t) / (script.threat.tauntDuration || 1));
      ctx.fillStyle = pal.iconActive;
      ctx.fillRect(x + u * 0.25, y + size - u * 0.3, (size - u * 0.5) * frac, u * 0.12);
    }
    if (hold) {
      ctx.save();
      roundRect(ctx, x, y, size, size, u * 0.35); ctx.clip();
      ctx.fillStyle = withAlpha(pal.bad, 0.55); ctx.fillRect(x, y, size, size);
      ctx.restore();
      font(ctx, pal, size * 0.3, 900, true);
      ctx.fillStyle = pal.text;
      text(ctx, 'HOLD', x + size / 2, y + size / 2, 'center');
      roundRect(ctx, x, y, size, size, u * 0.35);
      ctx.strokeStyle = pal.bad; ctx.lineWidth = lw(u, 2.5); ctx.stroke();
    }
    // key label
    const key = abilityKeys[id] || '';
    if (key) {
      font(ctx, pal, u * 0.6, 700);
      roundRect(ctx, x + size - u * 1.0, y - u * 0.2, u * 1.1, u * 0.8, u * 0.2);
      ctx.fillStyle = withAlpha(pal.bg, 0.9); ctx.fill();
      ctx.fillStyle = pal.textDim;
      text(ctx, key, x + size - u * 0.45, y + u * 0.2, 'center');
    }
    // name under the icon
    font(ctx, pal, u * 0.5, 600);
    ctx.fillStyle = pal.textMuted;
    text(ctx, fit(ctx, SHORT_LABEL[id] || def.label, size + gap * 0.8), x + size / 2, y + size + u * 0.35, 'center');
    // press-cue hit flash: a ring bursting out of the icon
    if (hit && hit.ability === id && t - hit.t < 0.4) {
      const k = (t - hit.t) / 0.4;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = hit.status === 'perfect' ? pal.good : hit.status === 'good' ? pal.warn : pal.bad;
      ctx.lineWidth = lw(u, 3 - 2 * k);
      roundRect(ctx, x - k * u * 0.6, y - k * u * 0.6, size + k * u * 1.2, size + k * u * 1.2, u * 0.35 + k * u * 0.4);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ------------------------------------------------------------------ press-cue lane

const BEAT_WORD = { perfect: 'PERFECT', good: 'GOOD', missed: 'MISS' };

function drawLane(ctx, view, script, settings, pal, u, w, lay, laneY, abilityY, t, now) {
  const rot = view.cues;
  const lead = settings.laneLead || 3;
  const { size, gap, xs } = lay;
  // The lane is at least wide enough for its header even with a single key column.
  const laneW = Math.max(lay.x1 - lay.x0 + gap * 2, Math.min(u * 15, w * 0.5));
  const x0 = (lay.x0 + lay.x1) / 2 - laneW / 2, x1 = x0 + laneW;
  const hitY = abilityY - u * 0.15;
  const travel = hitY - laneY - u * 0.9;     // notes spawn below the header
  const yFor = (dtv) => hitY - (Math.max(0, dtv) / lead) * travel;
  ctx.save();
  roundRect(ctx, x0, laneY, x1 - x0, abilityY - laneY, u * 0.4);
  ctx.fillStyle = pal.lane; ctx.fill();
  ctx.save();
  roundRect(ctx, x0, laneY, x1 - x0, abilityY - laneY, u * 0.4); ctx.clip();
  // columns with a note on the way light up
  const hot = new Set();
  const ABILITY_ORDER = lay.order;
  for (const b of rot.beats) if (b.status === 'pending' && b.at - t <= lead) hot.add(b.ability);
  for (let i = 0; i < ABILITY_ORDER.length; i++) {
    if (!hot.has(ABILITY_ORDER[i])) continue;
    const g = ctx.createLinearGradient(0, laneY, 0, abilityY);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, pal.laneHot);
    ctx.fillStyle = g;
    ctx.fillRect(xs[i], laneY, size, abilityY - laneY);
  }
  // header and second marks
  font(ctx, pal, u * 0.42, 700);
  ctx.fillStyle = pal.textMuted;
  text(ctx, 'PRESS WHEN THE NOTE LANDS ON ITS KEY', x0 + u * 0.4, laneY + u * 0.45, 'left');
  for (let s = 1; s <= lead; s++) {
    const y = yFor(s);
    ctx.fillStyle = withAlpha(pal.text, 0.18);
    ctx.fillRect(x0, y - lw(u) / 2, u * 0.3, lw(u));
    ctx.fillStyle = pal.textMuted;
    font(ctx, pal, u * 0.4, 600);
    text(ctx, `${s}s`, x0 + u * 0.4, y, 'left');
  }
  // hit line
  ctx.strokeStyle = pal.laneLine; ctx.lineWidth = lw(u, 1.5);
  ctx.setLineDash([u * 0.35, u * 0.3]);
  ctx.beginPath(); ctx.moveTo(x0 + u * 0.3, hitY); ctx.lineTo(x1 - u * 0.3, hitY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // notes first, then the hit feedback on top of them
  const ns = size * 0.74;
  const ordered = [...rot.beats].sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1));
  for (const b of ordered) {
    const col = ABILITY_ORDER.indexOf(b.ability);
    if (col < 0) continue;
    const cx = xs[col] + size / 2;
    const def = script.playerAbilities[b.ability];
    if (b.status === 'pending') {
      const dtv = b.at - t;
      if (dtv > lead) continue;
      const y = yFor(dtv);
      const color = pal.note;
      ctx.save();
      roundRect(ctx, cx - ns / 2, y - ns / 2, ns, ns, u * 0.3);
      ctx.fillStyle = pal.iconBg; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = lw(u, 2); ctx.stroke();
      drawIcon(ctx, def ? def.icon : b.ability, cx, y, ns * 0.6, color, pal.accent);
      if (dtv <= 0) {
        // inside the late window: a ring that shrinks as the window closes
        const frac = Math.max(0, 1 + dtv / b.late);
        ctx.strokeStyle = pal.warn; ctx.lineWidth = lw(u, 2.2);
        ctx.beginPath(); ctx.arc(cx, y, ns * 0.68, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke();
        if (b.early === 0) {
          const pulse = 0.5 + 0.5 * Math.sin(now * 12);
          ctx.globalAlpha = 0.35 + 0.45 * pulse;
          ctx.strokeStyle = pal.bad; ctx.lineWidth = lw(u, 2);
          roundRect(ctx, cx - ns / 2 - u * 0.25, y - ns / 2 - u * 0.25, ns + u * 0.5, ns + u * 0.5, u * 0.45); ctx.stroke();
          ctx.globalAlpha = 1;
          font(ctx, pal, u * 0.5, 800, true);
          ctx.fillStyle = pal.bad;
          text(ctx, 'NOW', cx, y - ns / 2 - u * 0.55, 'center');
        }
      }
      if (b.short) {
        font(ctx, pal, u * 0.48, 800);
        ctx.fillStyle = pal.accent;
        const rightSide = ABILITY_ORDER.length === 1 || col < ABILITY_ORDER.length - 1;
        text(ctx, b.short, rightSide ? cx + ns / 2 + u * 0.25 : cx - ns / 2 - u * 0.25, y, rightSide ? 'left' : 'right');
      }
      ctx.restore();
    } else {
      const age = t - b.resolvedAt;
      if (age > 0.9) continue;
      const a = age < 0.08 ? age / 0.08 : 1 - (age - 0.08) / 0.82;
      const color = b.status === 'perfect' ? pal.good : b.status === 'good' ? pal.warn : pal.bad;
      const pop = 1 + Math.max(0, 0.22 - age) * 1.4;
      const y = hitY - u * 1.3 - age * u * 1.4;
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      ctx.translate(cx, y); ctx.scale(pop, pop);
      font(ctx, pal, u * 0.62, 900, true);
      ctx.fillStyle = color;
      text(ctx, BEAT_WORD[b.status] || b.status.toUpperCase(), 0, 0, 'center');
      if (b.status !== 'missed') {
        font(ctx, pal, u * 0.42, 700);
        ctx.fillStyle = pal.textDim;
        text(ctx, `${b.delta > 0 ? '+' : ''}${b.delta.toFixed(2)}s`, 0, u * 0.6, 'center');
      }
      ctx.restore();
      if (b.status === 'missed') {
        // the note sinks through the bar
        ctx.save();
        ctx.globalAlpha = 0.5 * (1 - age / 0.9);
        roundRect(ctx, cx - ns / 2, hitY + age * u * 1.5 - ns / 2, ns, ns, u * 0.3);
        ctx.strokeStyle = pal.bad; ctx.lineWidth = lw(u, 2); ctx.stroke();
        ctx.restore();
      }
    }
  }
  // pressed before the note landed
  const early = rot.lastEarly;
  if (early && t - early.t < 0.6) {
    const col = ABILITY_ORDER.indexOf(early.ability);
    if (col >= 0) {
      ctx.save();
      ctx.globalAlpha = 1 - (t - early.t) / 0.6;
      font(ctx, pal, u * 0.55, 800, true);
      ctx.fillStyle = pal.textDim;
      text(ctx, 'EARLY', xs[col] + size / 2, hitY - u * 1.3, 'center');
      ctx.restore();
    }
  }
  // combo, to the right of the lane
  if (rot.combo >= 2 || rot.bestCombo > 0) {
    const cxr = x1 + u * 0.6;
    const cy = abilityY - u * 1.2;
    if (rot.combo >= 2) {
      const since = rot.lastHit ? t - rot.lastHit.t : 1;
      const pop = 1 + Math.max(0, 0.2 - since) * 1.5;
      ctx.save();
      ctx.translate(cxr, cy); ctx.scale(pop, pop);
      font(ctx, pal, u * 1.5, 900, true);
      ctx.fillStyle = rot.combo >= 10 ? pal.accent : pal.text;
      text(ctx, `${rot.combo}×`, 0, 0, 'left');
      ctx.restore();
      font(ctx, pal, u * 0.45, 800);
      ctx.fillStyle = pal.textDim;
      text(ctx, 'COMBO', cxr + u * 0.05, cy + u * 1.0, 'left');
    }
    if (rot.bestCombo > rot.combo) {
      font(ctx, pal, u * 0.42, 600);
      ctx.fillStyle = pal.textMuted;
      text(ctx, `best ${rot.bestCombo}`, cxr + u * 0.05, cy + (rot.combo >= 2 ? u * 1.6 : u * 1.0), 'left');
    }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ timeline

function drawTimeline(ctx, view, script, settings, pal, u, w, h, y, th, narrow) {
  const span = 20;
  const tw = narrow ? w - u * 2 : Math.min(u * 40, w * 0.6);
  const x = w / 2 - tw / 2;
  const nowX = x + tw * 0.08;
  const pxPerSec = (tw - (nowX - x)) / span;
  roundRect(ctx, x, y, tw, th, u * 0.3);
  ctx.fillStyle = pal.panel; ctx.fill();
  ctx.strokeStyle = pal.panelEdge; ctx.lineWidth = 1; ctx.stroke();
  ctx.save();
  roundRect(ctx, x, y, tw, th, u * 0.3); ctx.clip();
  // ticks every 5s: small muted labels along the top edge, "20s" kept inside
  font(ctx, pal, u * 0.42, 600);
  ctx.fillStyle = pal.textMuted;
  ctx.strokeStyle = withAlpha(pal.text, 0.12); ctx.lineWidth = lw(u);
  for (let s = 5; s <= span; s += 5) {
    const tx = nowX + s * pxPerSec;
    ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx, y + th * 0.3); ctx.stroke();
    const align = s === span ? 'right' : 'center';
    text(ctx, `${s}s`, s === span ? tx - u * 0.2 : tx, y + u * 0.42, align);
  }
  // now marker
  ctx.strokeStyle = pal.accent; ctx.lineWidth = lw(u, 2);
  ctx.beginPath(); ctx.moveTo(nowX, y); ctx.lineTo(nowX, y + th); ctx.stroke();
  // events: icon in the middle band, label underneath
  const iconSize = th * 0.5;
  let lastLabelX = -Infinity;
  for (const up of view.upcoming) {
    if (up.in > span || up.in < -0.5) continue;
    const ex = nowX + Math.max(0, up.in) * pxPerSec;
    const color = up.warn ? actionColor(pal, up.id) : pal.textDim;
    drawIcon(ctx, up.icon, ex, y + th * 0.5, iconSize, color, color);
    if (up.warn) {
      // Only label an event if its text clears the one before it.
      font(ctx, pal, u * 0.46, 700);
      const label = up.label.toUpperCase();
      const halfW = ((ctx.measureText ? ctx.measureText(label).width : 0) || label.length * u * 0.3) / 2;
      if (ex - halfW > lastLabelX + u * 0.4) {
        ctx.fillStyle = color;
        text(ctx, label, ex, y + th * 0.86, 'center');
        lastLabelX = ex + halfW;
      }
    }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ overlays

function drawFeared(ctx, pal, u, w, h, now) {
  ctx.fillStyle = pal.fear;
  ctx.fillRect(0, 0, w, h);
  const shake = Math.sin(now * 30) * u * 0.15;
  font(ctx, pal, u * 2.4, 900, true);
  ctx.fillStyle = withAlpha(pal.text, 0.85);
  text(ctx, 'FEARED', w / 2 + shake, h * 0.36, 'center');
}

function drawPaused(ctx, pal, u, w, h) {
  ctx.fillStyle = pal.pause;
  ctx.fillRect(0, 0, w, h);
  font(ctx, pal, u * 2.2, 900, true);
  ctx.fillStyle = pal.text;
  text(ctx, 'PAUSED', w / 2, h / 2 - u * 0.8, 'center');
  font(ctx, pal, u * 0.85, 600);
  ctx.fillStyle = pal.textDim;
  text(ctx, 'Esc to resume', w / 2, h / 2 + u * 1.0, 'center');
}

function drawReplayHud(ctx, replay, pal, u, w, h) {
  const s = `REPLAY  ${fmt(replay.t)} / ${fmt(replay.duration)}${replay.playing ? '' : '  ·  paused'}`;
  font(ctx, pal, u * 0.8, 700, true);
  ctx.fillStyle = pal.accent;
  text(ctx, s, w / 2, u * 1.1, 'center', 'top');
  font(ctx, pal, u * 0.6, 600);
  ctx.fillStyle = pal.textMuted;
  text(ctx, 'Drag the scrubber below  ·  Space play/pause  ·  Tab switch view', w / 2, u * 2.3, 'center', 'top');
}

function fmt(s) {
  s = Math.max(0, s || 0);
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}
