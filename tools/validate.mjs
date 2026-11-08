// Encounter validator: loads every encounter in data/encounters/index.json,
// checks the script shape, then plays the full fight and every drill with the
// scripted bot for each role the script offers. Exit code 1 on any problem.
//   node tools/validate.mjs            # all encounters
//   node tools/validate.mjs molten-core/lucifron
import fs from 'node:fs';
import path from 'node:path';
import { createSim, FIXED_DT } from '../src/core/sim.js';
import { computeScore, roleMatches, holdsBoss } from '../src/core/scoring.js';
import { snapshot } from '../src/core/snapshot.js';
import { roleBot } from '../tests/helpers.js';
import { createRenderer } from '../src/render/renderer.js';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const KINDS = new Set(['cone', 'knockback', 'fear', 'aoe', 'hazard', 'adds', 'aggroPull', 'targetSwitch', 'threatWipe', 'debuff', 'enrage', 'shield', 'projectile', 'transition']);
const CHECKS = new Set(['nearWall', 'threatLead', 'hasAggro', 'onTank', 'outsideLane', 'outsideHazard', 'facingAway', 'whelpsPicked', 'inRange', 'notInFront', 'noDispellable']);
const EXP_TYPES = new Set(['bossAtSpot', 'playerAtSpotBy', 'onEvent', 'afterEvent', 'continuous']);
const ROLES = ['tank', 'offtank', 'melee', 'ranged', 'healer'];

function lint(script, file) {
  const errs = [];
  const e = (m) => errs.push(`${file}: ${m}`);
  for (const k of ['id', 'name', 'version', 'arena', 'positions', 'player', 'ghostTank', 'raid', 'boss', 'threat', 'gcd', 'playerAbilities', 'actions', 'phases', 'continuousMetrics', 'grading', 'roles']) if (script[k] == null) e(`missing top-level key ${k}`);
  if (errs.length) return errs;
  const P = script.positions;
  for (const k of ['playerStart', 'bossStart', 'tankSpot', 'bossSpot']) if (!P[k]) e(`positions.${k} missing`);
  if (!Array.isArray(script.arena.floor) || !script.arena.floor.length) e('arena.floor must be a non-empty list of polygons');
  for (const [id, a] of Object.entries(script.actions)) {
    if (!KINDS.has(a.kind)) e(`action ${id}: unknown kind ${a.kind}`);
    if (a.kind === 'cone' && !(script.boss.cones && script.boss.cones[a.cone])) e(`action ${id}: cone ${a.cone} not in boss.cones`);
    if (a.kind === 'hazard' && a.placement === 'lanes' && !script[a.lanes || 'deepBreathLanes']) e(`action ${id}: lanes key missing`);
    if (a.kind === 'hazard' && a.placement === 'polys' && !script[a.polys]) e(`action ${id}: polys key ${a.polys} missing`);
    if (a.kind === 'adds') for (const s of a.from || []) if (!P[s]) e(`action ${id}: spawn spot ${s} missing`);
    if (a.kind === 'hazard' && a.placement === 'spots') for (const s of a.spots || []) if (!P[s]) e(`action ${id}: spot ${s} missing`);
    for (const key of ['raidMetric', 'playerMetric', 'wallMetric', 'completedMetric']) if (a[key] && !script.continuousMetrics[a[key]]) e(`action ${id}: ${key} ${a[key]} is not in continuousMetrics, so it would never be scored`);
    if (a.carried && a.placement !== 'player' && a.placement !== 'random') e(`action ${id}: carried needs placement player or random`);
    if (a.kind === 'debuff' && !['magic', 'curse', 'poison', 'disease', 'none', undefined].includes(a.dispel)) e(`action ${id}: dispel type ${a.dispel}`);
  }
  for (const [name, c] of Object.entries(script.boss.cones || {})) if (c.angle == null || c.range == null) e(`cone ${name} needs angle and range`);
  for (const [id, r] of Object.entries(script.roles)) {
    if (!ROLES.includes(id)) e(`roles.${id}: unknown role`);
    for (const ab of r.abilities || []) if (!script.playerAbilities[ab]) e(`roles.${id}: ability ${ab} not in playerAbilities`);
  }
  if (!script.roles.tank) e('roles.tank is required');
  script.phases.forEach((ph, i) => {
    if (ph.id == null) e(`phase ${i}: id missing`);
    if (ph.hpFrom == null || ph.hpTo == null || !ph.duration) e(`phase ${ph.id}: hpFrom/hpTo/duration`);
    if (ph.raidSpot && !P[ph.raidSpot]) e(`phase ${ph.id}: raidSpot ${ph.raidSpot} missing`);
    for (const [k, v] of Object.entries(ph.spots || {})) if (v && !P[v]) e(`phase ${ph.id}: spot ${k} -> ${v} missing`);
    for (const a of ph.actions || []) if (!script.actions[a.id]) e(`phase ${ph.id}: action ${a.id} not defined`);
    for (const x of ph.expectations || []) {
      if (!EXP_TYPES.has(x.type)) e(`phase ${ph.id}: expectation ${x.id} type ${x.type}`);
      if ((x.type === 'onEvent' || x.type === 'afterEvent') && !CHECKS.has(x.check)) e(`phase ${ph.id}: expectation ${x.id} check ${x.check}`);
      if ((x.type === 'onEvent' || x.type === 'afterEvent') && !script.actions[x.event] && !['landing', 'takeoff', 'deepBreath', 'threatLost', 'submerge', 'emerge'].includes(x.event)) e(`phase ${ph.id}: expectation ${x.id} event ${x.event} unknown`);
      if (x.type === 'continuous' && !script.continuousMetrics[x.metric]) e(`phase ${ph.id}: expectation ${x.id} metric ${x.metric} unknown`);
      if ((x.type === 'bossAtSpot' || x.type === 'playerAtSpotBy') && !P[x.spot]) e(`phase ${ph.id}: expectation ${x.id} spot ${x.spot} missing`);
      if (!x.label || !x.tip) e(`phase ${ph.id}: expectation ${x.id} needs label and tip`);
    }
  });
  for (const c of (script.cues && script.cues.list) || []) if (!script.playerAbilities[c.ability]) e(`cue ${c.id}: ability ${c.ability} unknown`);
  for (const d of script.drills || []) { if (!d.id || !d.name || !d.duration) e(`drill ${d.id}: id/name/duration`); for (const a of d.actions || []) if (!script.actions[a.id]) e(`drill ${d.id}: action ${a.id}`); }
  return errs;
}

/** A canvas whose context accepts every call and rejects any NaN or Infinity it is handed. */
function stubCanvas() {
  const grad = { addColorStop() {} };
  const target = {};
  let canvas;
  const ctx = new Proxy(target, {
    get(_, k) {
      if (k === 'measureText') return (s) => ({ width: String(s).length * 7 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => grad;
      if (k === 'getTransform') return () => ({ a: 1, d: 1 });
      if (k === 'canvas') return canvas;
      if (typeof k === 'string' && k in target) return target[k];
      return (...args) => { for (const a of args) if (typeof a === 'number' && !Number.isFinite(a)) throw new Error(`non-finite argument to ctx.${String(k)}`); };
    },
    set(_, k, v) { target[k] = v; return true; },
  });
  canvas = { width: 1280, height: 720, clientWidth: 1280, clientHeight: 720, getContext: () => ctx, getBoundingClientRect: () => ({ width: 1280, height: 720 }) };
  return canvas;
}

/** Draw the whole fight, both views, live and from replay snapshots, and the menu backdrop. Throws on anything the renderers cannot handle. */
function renderCheck(script, role, seconds) {
  const r = createRenderer(stubCanvas(), script);
  r.resize();
  const settings = { view: 'pov', speed: 1, role, warningLead: 5, ghostAlpha: 0.6, hazardOpacity: 0.7, colorblind: false, minimap: true, cueLane: true, laneLead: 3 };
  const keys = { taunt: '1', attack: '2', heal: '3', dispel: '4', interrupt: '5' };
  const idleSim = createSim(script, { manual: true, freezeHp: true, bossPassive: true, start: 'wall', seed: 3 });
  r.frame({ view: idleSim.state, settings, now: 0, dtReal: 1 / 60, abilityKeys: keys, overlay: { dim: true, idle: true } });
  const sim = createSim(script, { role, seed: 11, start: 'entrance', startPhase: script.phases[0].id });
  const bot = roleBot(role);
  for (let i = 0; i < seconds * 60 && !sim.state.ended; i++) {
    sim.step(bot(sim), FIXED_DT);
    sim.drainEvents();
    if (i % 12) continue;
    settings.view = i % 24 ? 'topdown' : 'pov';
    r.setView(settings.view, sim.state.t - 1);
    r.frame({ view: sim.state, settings, now: sim.state.t, dtReal: 1 / 60, abilityKeys: keys, overlay: {} });
    r.frame({ view: snapshot(sim.state), settings, now: sim.state.t, dtReal: 1 / 60, abilityKeys: keys, overlay: { replay: { t: sim.state.t, duration: seconds, playing: true } } });
  }
}

const IDLE = () => ({ forward: 0, strafe: 0, turn: 0, mouseTurn: 0, abilities: [], jump: false });
const SEEDS = [11, 7, 23];
const MIN_DECISION_GAP = 15;   // the bot must beat a player who does nothing by at least this many points

function play(script, role, opts, seconds, seed = 11, botFor = roleBot) {
  const sim = createSim(script, { role, seed, ...opts });
  const bot = botFor(role);
  const steps = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < steps && !sim.state.ended; i++) { sim.step(bot(sim), FIXED_DT); sim.drainEvents(); }
  JSON.stringify(snapshot(sim.state));
  const s = sim.state;
  return { result: s.result, score: computeScore(script, s.expectations, s.phaseMetrics, s.phasesPlayed, s.role, s.cues.log), metrics: s.metrics };
}

const want = process.argv[2] || null;
const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/encounters/index.json'), 'utf8'));
let problems = 0, warnings = 0;
const targets = [];
if (want && want.endsWith('.json')) {
  // A file that is not (yet) in the index.
  const rel = path.relative(path.join(ROOT, 'data/encounters'), path.resolve(want));
  targets.push({ raid: { id: rel.split('/')[0] }, boss: { id: path.basename(rel, '.json'), file: path.basename(rel), status: 'ready' }, file: rel });
} else {
  for (const raid of index.raids) for (const boss of raid.bosses) targets.push({ raid, boss, file: raid.id === 'onyxia' && boss.file === 'onyxia.json' ? 'onyxia.json' : `${raid.id}/${boss.file}` });
}
for (const { raid, boss, file } of targets) {
  {
    const key = `${raid.id}/${boss.id}`;
    if (want && !want.endsWith('.json') && want !== key) continue;
    if (boss.status !== 'ready' && !want) continue;
    let script;
    try { script = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/encounters', file), 'utf8')); }
    catch (err) { console.log(`✖ ${key}: cannot read ${file}: ${err.message}`); problems++; continue; }
    const errs = lint(script, key);
    for (const m of errs) console.log(`✖ ${m}`);
    problems += errs.length;
    if (errs.length) continue;
    const total = script.phases.reduce((a, p) => a + p.duration, 0) + 45;
    for (const role of Object.keys(script.roles)) {
      try {
        const full = { start: 'entrance', startPhase: script.phases[0].id };
        const runs = SEEDS.map((seed) => play(script, role, full, total, seed));
        const scores = runs.map((r) => r.score.overall);
        const worst = runs[scores.indexOf(Math.min(...scores))];
        const deaths = Math.max(...runs.map((r) => (r.metrics.deaths || 0) + (r.metrics.tankDeaths || 0)));
        const allWon = runs.every((r) => r.result === 'victory');
        const ok = allWon && worst.score.overall >= 70 && deaths === 0;
        renderCheck(script, role, total);
        const idle = play(script, role, full, total, SEEDS[0], () => IDLE).score.overall;
        const gap = Math.min(...scores) - idle;
        console.log(`${ok ? '✔' : '✖'} ${key} ${role.padEnd(7)} full ${String(worst.result).padEnd(8)} ${Math.min(...scores)}-${Math.max(...scores)} ${worst.score.grade}  idle ${idle}${deaths ? `  deaths ${deaths}` : ''}${ok ? '' : '  fixes: ' + worst.score.fixes.map((f) => f.title + (f.detail ? ` (${f.detail})` : '')).join(' | ')}`);
        if (!ok) problems++;
        if (gap < MIN_DECISION_GAP) { console.log(`⚠ ${key} ${role}: a player who does nothing scores ${idle}, only ${gap} behind the bot: this role has no real decisions`); warnings++; }
        for (const d of script.drills || []) {
          if (!roleMatches(d.roles, role, holdsBoss(script, role))) continue;
          const dr = play(script, role, { startPhase: d.startPhase, startOffset: d.startOffset || 0, start: d.start || 'entrance', actions: d.actions || null, duration: d.duration }, d.duration + 2);
          const dok = dr.result === 'drillComplete';
          if (!dok) { console.log(`✖ ${key} ${role} drill ${d.id}: ${dr.result}`); problems++; }
        }
      } catch (err) {
        console.log(`✖ ${key} ${role}: ${err.stack.split('\n').slice(0, 3).join(' | ')}`); problems++;
      }
    }
  }
}
console.log(problems ? `${problems} problem(s)` : `all encounters valid${warnings ? ` (${warnings} warning(s))` : ''}`);
process.exit(problems ? 1 : 0);
