# Module contracts

Internal interfaces between the layers. The core is finished; every other
module is written against this document. Keep it current when an interface
changes.

## Layers

```
index.html
src/main.js            boots: loads script JSON, creates settings, keybinds, input, audio, renderer, UI, modes
src/core/*             pure simulation (done) — no DOM, no Canvas, no audio
src/render/*           projection + top-down + POV + HUD + minimap over the same view object
src/input/*            keybinds (rebinding, conflicts) + per-frame command polling
src/audio/*            WebAudio cue player
src/ui/*               DOM overlays: menu, settings, scorecard, replay, tutorial panel, storage
src/app/*              session loop, scenarios (tutorial / drills / full fight), tutorial driver
data/encounters/*.json encounter scripts
```

## Core API (src/core/sim.js) — done

```js
import { createSim, FIXED_DT } from './core/sim.js';
const sim = createSim(script, options);
```

Options: `{ role:'tank'|'offtank'|'melee'|'ranged'|'healer', seed, startPhase, startOffset, start:'entrance'|'wall'|'pickup',
actions:[...]|null, bossPassive, manual, duration|null, phaseDurations:{1,2,3}|null, freezeHp }`.

Returned object: `{ state, script, options, step(cmd, dt), drainEvents(), teleport(preset),
setPhase(id, elapsed=0), setBossPassive(bool), triggerAction(id), end(result), threatRatio() }`.

`cmd = { forward:-1..1, strafe:-1..1 (+1 = right), turn:-1..1 (+1 = turn left), mouseTurn: radians (+ = left), jump: bool (true on the tick the key went down), abilities:['taunt'] }`
Ability ids come from `script.playerAbilities` filtered by `script.roles[role].abilities` (`taunt`, `attack`, `heal`, `dispel`, `interrupt`). Threat builds on its own while a tank is in melee range; there is no rotation. `state.tankRole` is true for tank and offtank; otherwise `world.ghost.tanking` is true and the boss targets `'ghost'`. Boss actions are driven by `script.actions[id].kind`; see docs/ENCOUNTER_FORMAT.md.

Call `step` with `FIXED_DT` (1/60) at 60 Hz times the speed multiplier (the session
scales the number of steps per real second, not dt).

### View object

Renderers and HUD read a **view**: either `sim.state` (live) or a snapshot from
`src/core/snapshot.js`. Both expose exactly these fields:

```
t, phase, phaseName, phaseSubtitle, hp (0..1), role
world.player   { x, y, z (jump height, yards), heading, hp, maxHp, fearedUntil, moving, backpedal }
world.boss     { x, y, z, heading, state:'grounded'|'takeoff'|'airborne'|'landing', target:'player'|'raid'|null, engaged, cast:{id,label,icon,start,end}|null, lastHit }
world.raid     { anchor:{x,y}, dots:[{x,y,melee}] }
world.whelps   [{ x, y, heading, target:'raid'|'player'|'ghost', onRaid }]
world.hazards  [{ uid, id, kind:'lane'|'crack', label, poly:[[x,y]...], state:'idle'|'warning'|'active', warnAt, activeAt, endsAt }]
world.projectiles [{ x0,y0,z0, tx,ty, t0,t1, splash }]   (fireballs; lerp x0->tx over t0..t1, splash ring after t1)
world.ghost    { x, y, heading, moving, backpedal, hp, maxHp, tanking }   (ghost tank: a guide in tank roles, the raid's tank otherwise)
world.idealTank { x, y, reason }                            (where the tank should be; the ghost follows it)
world.idealPlayer { x, y, reason:'approach'|'tankSpot'|'pickupSpot'|'dodgeLane'|'whelps'|'holdWhelps'|'wait' }
world.idealBoss   { x, y, heading, satisfied } | null
world.coneFlash   { breath, cleave, tail, buffet }  (time of last hit; flash for ~0.5s after)
threat         { player, raid, tauntUntil }
abilities      { gcdUntil, readyAt:{id:t}, list:[ids the role may press] }
debuffs        [{ uid, name, dispel, on:'player'|'ghost'|'raid', appliedAt, until, tickDamage }]
tankRole       bool
cues           { combo, bestCombo, counts:{perfect,good,missed}, lastHit:{t,ability,status,delta,cue}|null, lastEarly:{t,ability}|null,
                 beats:[{ uid, cue, ability, label, short, tip, at, early, late, doneBy, phase, status:'pending'|'perfect'|'good'|'missed', resolvedAt, delta }] }
               (pending Taunt notes plus the ones resolved in the last 1.5 s; the HUD draws them as the note lane)
upcoming       [{ id, label, icon, at, in, warn, cue, hazard?, phase? }] sorted by time, horizon 30s
nextExpected   { label, kind:'expectation'|'fix'|'hint'|'hold', deadline?, id? } | null
feedback       { facingWrong, inHazard, inFront, holdAttack, inRangeOk, lastTick:{t,status,label,lateBy}|null, toast:{t,text,kind}|null }
metrics        { ...totals }
```

Cones: `script.boss.cones.{breath,cleave,tail}` = `{ angle (deg, total), range, label }`.
Breath and cleave open from `boss.heading`; tail opens from `boss.heading + PI`.
The breath cone is drawn while `boss.cast.id === 'flameBreath'`; cleave/tail/buffet
flash when `coneFlash.*` is recent. Draw boss footprint radius `script.boss.radius`.

Threat bar fill = `threatRatio` = raid / (player * pullMultiplier), clamped 0..1;
paint from `script.threat.dangerBand` (0.8) to 1 as the danger band. Compute in the
HUD with `threatRatio(view.threat, {pullMultiplier: script.threat.pullMultiplier})`
from `src/core/threat.js`.

### Events (from `sim.drainEvents()`)

Every event has `t` and `type`.

| type | fields | meaning |
|---|---|---|
| phase | phase, name, subtitle | entered a phase |
| engage | | boss engaged |
| cast | id, label, castTime | boss started casting |
| action | id, label | boss action resolved (ids: flameBreath, cleave, tailSweep, wingBuffet, fireball, deepBreath [lane went active], whelpWave, bellowingRoar, eruption, landing, takeoff) |
| hazardWarn | kind:'lane'|'crack', label, in | telegraph started |
| hazardActive | kind, label | hazard became deadly |
| knockback | source, offWall? | player knocked back |
| feared | duration | player feared |
| fearResisted | | immunity worked |
| threatLost / threatRegained | by? | aggro changed |
| damage | amount, source | player damaged |
| death | source | player died (hp reset) |
| abilityUsed | id, label | |
| abilityFailed | id, reason:'range'|'cooldown'|'gcd'|'feared' | |
| beat | ability, status:'perfect'|'good'|'missed', delta, cue, label, combo | a Taunt note was judged |
| jump | | the tank left the ground |
| whelpPickup | | off-tank picked up whelps |
| expectation | id, status:'ontime'|'late'|'missed', label, lateBy, phase | scoring result |
| end | result:'victory'|'drillComplete'|'aborted' | run finished |

### Scoring

```js
import { computeScore } from './core/scoring.js';
const score = computeScore(script, sim.state.expectations, sim.state.phaseMetrics, sim.state.phasesPlayed, sim.state.role, sim.state.cues.log);
// { overall, grade,
//   phases:[{ id, name, subtitle, total, grade, expectations:[inst], counts:{ontime,late,missed}, metrics:[{id,label,unit,value,penalty,severe,info}],
//             cues:{ perfect, good, missed, total, score, points } }],
//   cues:{ perfect, good, missed, total, bestCombo },
//   fixes:[{title,tip,kind:'missed'|'late'|'metric'|'cue',count,detail}] }
// Expectation instances carry `notBefore` (afterEvent only): not judged before that time.
```

## Settings object (src/ui/storage.js owns persistence)

A plain object shared by reference; modules read it each frame.

```js
{
  view: 'pov' | 'topdown',       // default 'pov'
  speed: 0.25..1,                // default 1
  role: 'mt' | 'offtank',
  warningLead: 3..8,             // seconds, default 5
  cueLane: true,                 // draw the Taunt note lane above the ability bar
  laneLead: 2..5,                // seconds of lookahead the lane shows, default 3
  ghostAlpha: 0..1,              // default 0.6 (0 hides the ghost tank)
  hazardOpacity: 0.2..1,         // default 0.7
  colorblind: false,
  minimap: true,
  mouseSensitivity: 0.0025,      // radians per pixel
  masterVolume: 0..1, muted: false, voiceCountdown: true,
  cueVolumes: { [cueId]: 0..1 },
  phaseDurations: { 1: 110, 2: 80, 3: 130 },
}
```
Keybinds persist separately (`src/input/keybinds.js`). History persists as
`{ runs:[{ date, mode, name, role, overall, grade, phases:[{id,total,grade}], fixes:[title] }], best:{ [modeKey]: overall } }`.
`storage.js` exports `loadSettings(), saveSettings(s), loadBinds(), saveBinds(b), loadHistory(), saveRun(run), clearHistory(), resetAll()` using localStorage keys prefixed `onyxia.`; every read is try/catch and falls back to defaults.

## Renderer (src/render/renderer.js)

```js
import { createRenderer } from './render/renderer.js';
const r = createRenderer(canvas, script);
r.resize();                              // reads canvas client size and devicePixelRatio
r.setView('pov' | 'topdown'); r.getView();
r.zoom(delta);                           // POV camera distance (mouse wheel), clamp 6..40 yards
r.frame({ view, settings, now, dtReal, abilityKeys, overlay });
r.destroy();
```
`abilityKeys = { taunt:'1' }` (labels from keybinds).
`overlay = { paused:bool, replay:{ t, duration, playing }|null, dim:bool }`.
Files: `projection.js` (camera + perspective; the only place that knows how 3D becomes 2D),
`palette.js` (colours, colourblind variant, fonts), `shapes.js` (boss silhouette, player figure,
icons drawn with canvas paths), `topdown.js`, `pov.js`, `hud.js`, `minimap.js`, `renderer.js`.
Everything in `render/` only reads the view; it never mutates it.

Projection API (`projection.js`):
```js
createCamera() -> { x,y,z, yaw, pitch, fov, distance, height }
updateChaseCamera(cam, player, { distance, dtReal }) // behind-and-above, eases toward player heading
project(cam, wx, wy, wz, w, h) -> { x, y, depth, scale } | null  (null when behind the near plane)
projectPoly(cam, worldPts /*[[x,y,z]]*/, w, h) -> screen pts [] (near-plane clipped) or []
```

## Input (src/input)

```js
import { DEFAULT_BINDS, createKeybinds } from './input/keybinds.js';
const kb = createKeybinds(loadBinds());   // { get(action) -> code[], set(action, index, code), reset(), conflicts() -> [{code, actions}], label(code), keyLabel(action), binds, onChange(fn) }
import { createInput } from './input/input.js';
const input = createInput(canvas, kb, settings);
input.poll() -> cmd (movement from held keys, mouseTurn accumulated from right-drag * sensitivity, abilities pressed since last poll)
input.consume(action) -> bool   // one-shot UI actions: 'toggleView', 'pause', 'toggleGhost', 'cycleSpeed'
input.wheel() -> accumulated wheel delta since last call
input.setEnabled(bool); input.destroy();
```
Actions: `forward, back, turnLeft, turnRight, strafeLeft, strafeRight, jump, taunt, toggleView, pause`.
Defaults: W S A D Q E, Space, 1, Tab, Escape. Arrow keys as secondary movement binds. `jump` is a movement one-shot: `poll()` reports it once as `cmd.jump`.
Key codes are `KeyboardEvent.code`. Tab must `preventDefault`. Right mouse drag turns (pointer lock optional, context menu suppressed on the canvas).

## Audio (src/audio/cues.js)

```js
import { createAudio } from './audio/cues.js';
const audio = createAudio(settings);
audio.unlock();                 // call on first user gesture
audio.handleEvent(evt);         // maps core events to cues
audio.tick(view, dtReal);       // countdown voice "3, 2, 1" for the next warn-able upcoming event using settings.warningLead; de-duplicates
audio.play(cueId);              // preview from settings
audio.destroy();
```
Cue ids: `breath, cleave, buffet, tail, deepBreath, whelps, roar, eruption, landing, takeoff, threatLost, feared, ontime, late, missed, phase, countdown, click`.
All sounds are synthesised with WebAudio (no files). Voice countdown uses `speechSynthesis` when available, else a tone ladder.

## Deviations adopted during integration

- `createSession` hooks also include `onPauseKey(api)`, `onViewToggle(view)`, `isDimmed()`; main.js decides what Esc does.
- `createTutorial({ script, sim, settings, panel, audio, onExit })` exposes `tick()`, `handleEvent(evt)`, `viewToggled()`, `skip()`, `exit()`; main wires those into the session hooks.
- Input adds `captureNext(cb)` / `cancelCapture()` for rebinding, `Mouse4`/`Mouse5` buttons, and non-rebindable one-shots `phase1/2/3` (F1–F3). Audio adds `reset()`.
- The renderer exposes `camera`; `renderer.frame` tolerates `overlay.idle` (menu backdrop: world only, no HUD).
- Replay picks the nearest snapshot at or before the scrub time (10 Hz, no interpolation).
- `sim.triggerAction(id)` queues the action for up to 12 s when the boss is mid takeoff/landing and returns false; it fires once she is ready.
- The facing metric is not charged during `raid.holdAfterPull` seconds after the pull or `boss.pickupGrace` seconds after a landing.

## Session (src/app/session.js)

```js
const session = createSession({ script, scenario, settings, renderer, audio, input, keybinds, hooks:{ onEnd(sim, score), onEvent(evt), onTick(view) } });
session.start(); session.pause(); session.resume(); session.togglePause(); session.stop('aborted');
session.sim; session.snapshots (array of snapshot() at 10 Hz); session.paused
```
Loop: requestAnimationFrame, accumulator, `steps = floor(acc / (FIXED_DT / speed))`, cap at 8 steps per frame.
Pause on `window blur` / `visibilitychange`. Resize on `window resize`.
Renders every frame even when paused (overlay.paused = true).

## Scenarios (src/app/modes.js)

```js
buildScenario({ mode:'tutorial'|'drill'|'full', drillId?, settings }) -> { name, mode, simOptions, loop, drill }
```
Full fight: `{ role, phaseDurations, seed: Date.now() }`. Drill: from `script.drills[]` (`startPhase, startOffset, duration, loop, start, actions`). Tutorial: `{ manual:true, freezeHp:true, bossPassive:true, start:'entrance' }`.

## Tutorial (src/app/tutorial.js)

Drives `script.tutorial.steps`. Each step: `{ id, title, text, setup?, trigger?, done }`.
`setup`: `{ bossPassive?, phase?, start?, ghost? }` → `sim.setBossPassive`, `sim.setPhase`, `sim.teleport`, settings.ghostAlpha temporarily forced ≥ 0.6.
`trigger`: action id → `sim.triggerAction(id)` once the step is shown (after a 2s read delay).
`done` types: `viewToggledOrWait{seconds}`, `playerAtSpot{spot}`, `bossAtSpot{spot, hold}`, `eventLanded{event, metricUnchanged}`, `expectation{id}` (resolved on time or late), `wait{seconds}`.
Renders a DOM panel (title, text, step n/N, "Skip step", "Exit") and advances with a short "done" chime.

## UI (src/ui)

- `overlay.js`: `createOverlay(root)` → `{ show(screenId, props), hide(), current, el, toast() }`, screens registered by the modules below. `show` wraps the screen's returned `.panel` in a full-window `.screen` backdrop (`data-screen=id`) that centres it and returns the panel; a screen renderer must never add `.screen` itself.
- `menu.js`: main menu (Tutorial / Drills (list) / Full fight / Settings / History), keyboard navigable.
- `settings.js`: all settings above + keybind rebinding with conflict warnings + per-cue volume with preview + "Reset history" + "Reset everything".
- `scorecard.js`: end screen: grade, overall, per-phase cards (expectations list with on time / late +Xs / missed, metrics with severe flagged), top three fixes, buttons: Replay, Again, Menu. Saves the run to history.
- `replay.js`: replay screen: scrubber over `snapshots`, play/pause, speed, view toggle; renders through `renderer.frame({ view: snapshot, overlay:{replay} })`; markers on the scrubber for expectation events.
- `styles.css`: one stylesheet. Dark, warm, fire palette. Fonts: system stack + a display font loaded only if online (fallback safe).

## Accounts, navigation and server boundary

`src/ui/landing.js` is the public home. `main.js` routes `/`, `/play`, `/account`,
`/history` and `/settings` through History API navigation. Raid deep links use
`/play?raid=<id>&boss=<id>`; unauthenticated protected links open sign-in and
resume the selected encounter after login. Onyxia never requires an account.

`src/app/account.js` owns the Supabase client, verified session requests and the
cloud-sync queue. `src/ui/storage.js` retains the guest `onyxia.*` keys and uses
`raid.player.<userId>.*` for isolated account caches. Revisions prevent older
requests from acknowledging newer local changes; requests capture the account
identity so switching users cannot send one user's pending data into another
account. Settings/binds use local dirty flags; runs merge by UUID and best
scores take the maximum. Clear/reset operations persist until acknowledged.

`api/index.js` exposes public `GET /api/config`, public Onyxia and authenticated
`GET /api/encounters/:raid/:boss`, plus authenticated `GET`, `PUT`, `DELETE`
`/api/player`. `DELETE ?all=true` resets that player's game data. All responses
are private/no-store. The API validates Supabase tokens using `auth.getUser` and
never accepts a user ID from request payloads. Data validation and Prisma writes
live in `server/`; application tables and RLS changes live in Prisma migrations.

`tools/build.mjs` allowlists static output; protected encounter data, server
code, credentials, and Prisma files are never copied into `dist/`.
