# Onyxia Tank Rehearsal Simulator

A standalone browser app for rehearsing the main-tank job on the WoW Classic
Onyxia encounter. The simulator plays Onyxia; you play the tank. It never
connects to the game. Practise the pull, the wall position, Wing Buffet, the
Phase 2 Deep Breath lanes, the Phase 3 landing pickup and Bellowing Roar
immunity until the timings are reflex, then look at a scorecard that tells you
exactly what to fix.

* Vanilla JavaScript ES modules, Canvas 2D, no build step, no backend, no
  dependencies.
* Two views of the same simulation: a top-down placement map and a
  third-person over-the-shoulder view that matches WoW's default camera.
* Fully scripted encounter in `data/encounters/onyxia.json`. Every timing,
  range and threat number is a placeholder you can tune.
* Pure simulation core with unit tests, kept free of DOM, Canvas and audio so
  it can later be ported to Lua for an in-game addon.

**Play it now:** https://onyxia-tank-sim.vercel.app · Source: https://github.com/jake-owen-p/onyxia-tank-sim

## Quick start

Serve the folder with any static file server and open it in a modern browser:

```sh
npm run serve          # python3 -m http.server 8080
# then open http://localhost:8080/
```

or `npx serve .`, or drop the folder on any static host.

The public build is hosted on Vercel as a plain static site (no build step;
`vercel.json` only sets response headers). Pushing to `main` on GitHub
redeploys it, and `vercel deploy --prod` from the folder does the same by hand.

Opening `index.html` straight from `file://` works in Firefox and Safari. Chrome
blocks `fetch()` of the encounter JSON from `file://`, so Chrome users need a
local server (the page shows a message explaining this if it happens).

Audio starts after your first click or key press, which browsers require.

### Controls

WoW defaults. Every key is rebindable in Settings, with conflict detection.

| Action | Default |
|---|---|
| Move forward / back | `W` / `S` (also arrow keys) |
| Turn left / right | `A` / `D` |
| Strafe left / right | `Q` / `E` |
| Mouse turn | hold right mouse button and drag |
| Zoom (POV view) | mouse wheel |
| Taunt | `1` |
| Sunder Armor (threat builder) | `2` |
| Shield Block | `3` |
| Shield Wall (defensive cooldown) | `4` |
| Berserker Rage / Fear Ward (fear immunity) | `5` |
| Switch view | `Tab` |
| Pause menu | `Esc` |
| Phase skip (full fight) | `F1` `F2` `F3` |

Backpedalling (`S`) is slower than walking forward, as in the game.

## Modes

**Tutorial.** A guided walkthrough of about five minutes. It introduces the
room, then one mechanic at a time with the ghost tank switched on: moving to
the tank spot, the pull and positioning, Sunder Armor and the press-cue lane,
Flame Breath, Wing Buffet and the threat rebuild, Phase 2 and the Deep Breath
lane, the Phase 3 landing and Bellowing Roar. Boss HP is frozen and the boss only does what the current step
triggers. Steps are defined in the encounter script under `tutorial.steps`.

**Drills.** Short loops for one mechanic, defined under `drills` in the script:

| Drill | What it loops |
|---|---|
| Pull and Wing Buffet | Pull from the ramp to the wall, hold through three Buffets, rebuild threat after each. 75 s. |
| Rotation and cooldowns | Already at the wall. Sunder on every global, Shield Block each Flame Breath, Berserker Rage each Roar. Chase a perfect combo. 60 s. |
| Bellowing Roar immunity | Already at the wall in Phase 3. Pre-empt four Roars, keep her facing the wall. 105 s. |
| Phase 3 pickup | She lands in five seconds. Taunt, pick her up, drag her to the wall between the cracks. 45 s. |

Each loop ends on a scorecard; `Enter` runs it again with a fresh random seed.

**Full fight.** All three phases. Boss HP drains on a timer so phases change
automatically; the phase durations are adjustable in Settings. Settings also
offer a speed slider (25% to 100%), phase skip, a role toggle (main tank or
whelp off-tank), warning lead time, ghost tank fade, hazard opacity, a
colourblind-safe palette, master and per-cue volume, and key rebinding.

In the **off-tank** role Phase 2 adds whelp duty: whelp waves come from both
caves heading for the raid, you pick them up by running into them (or with
Taunt or Sunder within range) and hold them on the off-tank spot away from the
raid. In the **main tank** role a ghost off-tank takes the whelps.

## The two views

Press `Tab` at any time. Both share the HUD, warnings and scoring; POV adds a
corner minimap. The app starts in POV with the minimap.

**Top-down (placement mode).** A clean map with a subtle grid, north (the back
wall) at the top. It shows:

* the correct tank spot as a glowing marker, with a glowing path from you to it
  when you are more than a couple of yards away;
* the correct boss position and facing as a dotted ghost outline, with an arrow
  from where she is to where she should be and a dashed drag route;
* her Flame Breath cone while she casts it, faint Cleave and Tail Sweep arcs
  that flash when they hit, and a ring for Wing Buffet;
* hazard zones (Deep Breath lanes, Eruption cracks) as shaded regions with a
  countdown while they are telegraphed, solid and bright while they are
  deadly;
* the ghost raid (35 dots, melee at her flanks), whelps and fireballs;
* the optional ghost tank: a translucent figure that walks the correct route
  ahead of you and turns to the correct facing.

**POV (facing mode).** A third-person camera behind and above the tank. The
camera yaw follows your facing. The floor grid and walls recede in
perspective, the boss is a large translucent silhouette with an unmistakable
front marker and wing and tail cues, hazards are projected onto the floor, the
ghost raid is behind you, and the glowing path, dotted boss ghost and drag
route are drawn in the world. The projection lives in one module
(`src/render/projection.js`) so the POV renderer can be dropped for the real
game camera later.

**Ghost tank fade.** The ghost tank's opacity is a slider. Start at full
opacity, fade it as you improve, set it to zero to hide it.

### HUD

Boss cast bar with ability name and icon; large centre warnings with lead time
(for example `WING BUFFET IN 3`); phase indicator with boss HP; a "next
expected action" line; threat bar with a danger band (and a clear state when
she is on the raid); ability icons with cooldown sweeps and buff rings; a short
timeline strip of upcoming events; your HP; a debuff tray under the phase block
showing her Sunder Armor stacks (with the time left on them) and an active
Taunt.

**The press-cue lane.** Above the ability bar is a rhythm-game lane. Each note
is an ability icon that falls down its own key's column and must be pressed
when it reaches the icon. Sunder notes come on every global cooldown while she
is in range; Shield Block notes drop ahead of each Flame Breath (predicted from
her schedule, armed when the cast bar appears); Berserker Rage notes ahead of
each Bellowing Roar; a red pulsing Taunt note marked NOW appears the moment
she turns on the raid, and a Shield Wall note when your health is low. Presses
grade as PERFECT (within 0.3 s), GOOD (inside the note's window) or MISS, build
a combo, and feed the scorecard. A note is only shown when the ability can be
ready for it. Pressing a buff a little ahead of its note still counts if it
covers the window. The lane can be hidden and its lead time changed in
Settings. Each warning has its own audio cue
plus a spoken countdown. Live feedback: a subtle red edge flash while she is
facing the raid, an orange edge while you stand in a hazard, a green tick when
an expected action lands on time, amber `LATE +2.1s` or red `MISSED` otherwise.

## Scoring

Every expected action is logged as **on time**, **late** (with the seconds) or
**missed**. The windows come from the script:

* `within` seconds for on time, then `grace` more seconds for late, then
  missed. For on-event checks (be against the wall for Wing Buffet, be fear
  immune for Bellowing Roar, be out of the Deep Breath lane) the check runs at
  the moment the ability lands; passing during the grace window counts as late.
* The Phase 1 pull clock starts when you engage her; the Phase 3 drag clock
  starts when she lands.

Continuous metrics are accumulated per phase: seconds with the boss facing the
raid, Flame Breaths / Cleaves / Tail Sweeps that hit the raid, seconds you stand
behind her, seconds in an active Deep Breath lane, seconds on an Eruption
crack, seconds whelps spend on the raid (off-tank), fears taken without
immunity, Buffets taken away from the wall, times she turned on the raid,
deaths, and the time to pick her up after landing.

Each phase scores up to 50 points for expectations (on time 1.0, late 0.5,
missed 0, averaged), 30 metric points minus penalties (per second or per
count, from `continuousMetrics`), and 20 rotation points for the press cues
(perfect 1.0, good 0.6, missed 0, averaged; full points when no note was
judged). The overall score is the mean of the phases played. The scorecard
lists perfect / good / missed presses per phase, your best combo, and missed
cues rank among the top three fixes. Grade bands (from `grading.grades`): S 95+, A 85+, B 72+, C 58+,
D 40+, else F.

The end screen shows the grade, the per-phase breakdown, the top three things
to fix (ranked by the points they cost, with the tip text from the script), and
a replay timeline you can scrub with the view following the player. Run history
and best scores are kept in `localStorage`, with a clear reset in Settings.

## Architecture

```
index.html
src/main.js            boot: loads the script, wires settings, input, audio, renderer, UI, modes
src/core/              pure simulation. No DOM, no Canvas, no audio. Unit-tested.
src/render/            projection, top-down renderer, POV renderer, HUD, minimap
src/input/             keybind manager (rebinding, conflicts) and per-frame command polling
src/audio/             WebAudio cue player with per-cue volume and master mute
src/ui/                menus, settings, scorecard, replay, tutorial panel, localStorage
src/app/               session loop, scenarios (tutorial / drills / full fight), tutorial driver
data/encounters/       encounter scripts (JSON, no logic)
tests/                 node:test suite for the core
docs/CONTRACTS.md      the interfaces between the layers
```

The separation is strict. The core exposes `createSim(script, options)` with a
`step(cmd, dt)` method and a plain `state` object; renderers only read a
*view* (the live state or a replay snapshot with the same shape) and never
mutate it. Everything the HUD needs (cast bar, upcoming events, next expected
action, threat, cooldowns, feedback flags) is derived inside the core so the
HUD is a dumb painter. `docs/CONTRACTS.md` documents every interface.

Core modules:

| File | Role |
|---|---|
| `sim.js` | fixed-timestep orchestrator, phases, boss actions, abilities, metrics, events |
| `geometry.js` | angles, cones, point-in-polygon, lane rectangles, wall collision |
| `threat.js` | two-pool threat model with taunt, buffet cut and target hysteresis |
| `hazards.js` | Deep Breath lanes and Eruption cracks with warning/active lifecycles |
| `scheduler.js` | per-phase action timers with seeded jitter |
| `expectations.js` | the named checks the script refers to |
| `scoring.js` | expectation instances, grades, rotation points, top fixes |
| `rotation.js` | press-cue notes: filler, predicted and reactive cues, grading windows, combos |
| `entities.js` | player, boss (ground, takeoff, flight, landing), ghost raid, whelps |
| `ideal.js` | where the tank and boss should be; the ghost tank |
| `snapshot.js` | compact replay snapshots |
| `rng.js` | seeded RNG so runs are reproducible |

The simulation runs at 60 Hz (`FIXED_DT = 1/60`); the speed slider changes how
many steps run per real second, never the step size. All randomness goes
through the seeded RNG, so a run can be replayed from its seed and inputs.

## The script format

`data/encounters/onyxia.json` describes the whole encounter. Units are yards
and seconds. Headings are degrees with 0 = east and 90 = north (toward the
back wall); the core converts to radians. There is no logic in the file: it
names checks, metrics and cues that the code implements.

| Key | Contents |
|---|---|
| `id`, `name`, `version`, `notes` | identity and free text |
| `arena` | `floor`: walkable polygons (`{id, poly:[[x,y],...]}`), their union is the floor; `walls`: polylines drawn as walls (`wallHeight` for POV); `backWall`: the polyline the "against the wall" check measures distance to, within `nearWallDistance`; `labels`: map annotations |
| `positions` | named spots: `playerStart`, `bossStart`, `tankSpot`, `bossSpot` (with `heading`, `tolerance`, `headingTolerance`), `raidWait`, `raidSpotP1/P2/P3` (with `spread`), `hoverIdle` (with `z`), `landSpot`, `pickupSpot`, `offtankWhelpSpot`, `ghostOfftankSpot`, `caveWest`, `caveEast` |
| `player` | `speed`, `turnRate` (deg/s), `radius`, `hp`, `healPerSecond` (ghost healers), `fearDuration`, `fearSpeed` |
| `ghostTank` | `speed`, `turnRate` of the ghost figure |
| `raid` | `size`, `melee` (dots that stand at her flanks), `threatPerSecond`, `holdAfterPull` (seconds the raid holds DPS after the pull), `meleeFlankDistance`, `whelpContactRange` |
| `boss` | `radius`, `speed`, `turnRate`, `meleeRange`, `meleeDamage`, `meleeInterval`, `cones` (`breath`, `cleave`, `tail`: `{angle (total degrees), range, label}`), `landingDuration`, `takeoffDuration`, `settleAfterLanding` (she turns but does not walk for this long after landing), `pickupGrace` (facing is not charged for this long after landing) |
| `threat` | `sunder` threat, `autoAttackPerSecond`, `tauntBonus`, `tauntDuration`, `buffetCut` (fraction removed), `pullMultiplier` (raid pulls when raid > player x this), `dangerBand` (bar fraction painted red), `resetOnLanding` |
| `gcd`, `playerAbilities` | global cooldown and the five abilities: `label`, `cooldown`, `gcd` (on the GCD or not), `range`, `duration`, `mitigation`, `icon` |
| `actions` | boss ability definitions keyed by id (see below) |
| `deepBreathLanes` | `{id, from:[x,y], to:[x,y]}` candidate lanes; one is picked at random per Deep Breath; width comes from `actions.deepBreath.laneWidth` |
| `hoverHeight` | flight height in Phase 2 |
| `eruptionCracks` | crack polygons laid on the floor in Phase 3 |
| `phases` | the phase list (see below) |
| `continuousMetrics` | metric definitions: `label`, `unit` (`s` or `count`), `penaltyPerSecond` or `penaltyPerUnit`, `severe` threshold, or `info: true` for display-only |
| `grading` | `expectationWeights`, `expectationPoints`, `metricPoints`, `grades` bands |
| `drills` | drill definitions |
| `tutorial` | tutorial steps |

### Actions

```json
"wingBuffet": { "label": "Wing Buffet", "cast": 1, "knockback": 22, "knockbackRange": 20,
                "warn": true, "cue": "buffet", "icon": "buffet", "requires": "grounded" }
```

* `cast`: seconds on the cast bar before it resolves; 0 is instant. She does
  not turn or move while casting.
* `requires`: `grounded` or `airborne`; the action is skipped otherwise.
* `conditional`: `behind` fires only when someone is in the tail arc (Tail
  Sweep). Conditional actions are never announced.
* `warn`: show the big centre warning with lead time and run the spoken
  countdown. Deep Breath and Eruption keep `warn: false` because their lanes
  and cracks carry their own countdown once telegraphed.
* `cue`: the audio cue id. `icon`: the HUD glyph id.
* Per-ability fields: `cone` + `damage` (Flame Breath, Cleave, Tail Sweep);
  `knockback` + `knockbackRange` (Wing Buffet), `knockback` (Tail Sweep);
  `travel` + `splash` (Fireball); `warning` + `active` + `laneWidth` + `damage`
  (Deep Breath); `perCave` + `speed` + `aggroRange` + `lifetime` (whelp
  waves); `warning` + `active` + `damage` (Eruption).

The action ids are fixed: `flameBreath`, `cleave`, `tailSweep`, `wingBuffet`,
`fireball`, `deepBreath`, `whelpWave`, `bellowingRoar`, `eruption`, plus the
transition events `landing` and `takeoff`. Each has its own resolution code in
`src/core/sim.js`; adding a new kind of ability means adding a case there.

### Phases

```json
{
  "id": 1, "name": "Phase 1", "subtitle": "Grounded",
  "hpFrom": 1.0, "hpTo": 0.65, "duration": 110,
  "bossState": "grounded", "raidSpot": "raidSpotP1",
  "actions": [ { "id": "flameBreath", "first": 16, "every": 20, "jitter": 2 } ],
  "expectations": [ ... ]
}
```

Boss HP drains linearly from `hpFrom` to `hpTo` over `duration` seconds, then
the next phase starts. `bossState` `airborne` triggers a takeoff when the phase
begins; `grounded` after an airborne phase triggers a landing (threat reset,
she targets the raid). Each action fires `first` seconds into the phase, then
every `every` seconds, each time shifted by up to `jitter` seconds.

### Expectations

Each expectation has `id`, `label`, `tip` (shown in the top-three fixes), an
optional `role` (`mt` or `offtank`; omit for both) and one of these types:

| type | fields | meaning |
|---|---|---|
| `bossAtSpot` | `spot`, `within`, `grace`, `from` | the boss must be at the named spot (position and heading within the spot's tolerances) within `within` seconds of the phase start, or of `engage` / `landing` when `from` says so |
| `playerAtSpotBy` | `spot`, `grace` | the player must be at the spot when the phase ends (`deadline: "phaseEnd"`); arriving during `grace` is late |
| `onEvent` | `event`, `check`, `grace` | when the action `event` lands, `check` must pass; passing during `grace` is late |
| `afterEvent` | `event`, `check`, `within`, `grace` | after the action `event`, `check` must pass within `within` seconds (late during `grace`) |
| `continuous` | `metric` | no instance; names the metric whose accumulated value scores the behaviour |

Available checks (`src/core/expectations.js`): `nearWall`, `threatLead`,
`hasAggro`, `outsideLane`, `fearImmune`, `whelpsPicked`. Events that
expectations can hook are the action ids above plus `landing`.

### Rotation cues

`rotation` defines the press-cue lane. The `filler` note repeats on every global
cooldown while the boss is grounded, engaged and within the ability's range;
each entry in `cues` is a note tied to something the boss does:

```json
"rotation": {
  "windows": { "perfect": 0.3 },
  "filler": { "id": "sunder", "ability": "sunder", "late": 1.0, "missRespawn": 1.0, "label": "...", "tip": "..." },
  "cues": [
    { "id": "blockBreath", "ability": "shieldBlock", "on": "cast", "action": "flameBreath",
      "offset": 0.5, "early": 1.0, "late": 2.0, "short": "BREATH", "label": "...", "tip": "..." },
    { "id": "tauntLost", "ability": "taunt", "on": "event", "event": "threatLost", "early": 0, "late": 3, "short": "ON RAID", ... },
    { "id": "wallLow", "ability": "defensive", "on": "hpBelow", "hp": 0.35, "late": 3, ... },
    { "id": "tauntWhelps", "ability": "taunt", "on": "event", "event": "whelpWave", "doneBy": "whelpPickup", "offset": 3, "role": "offtank", ... }
  ]
}
```

| `on` | fields | the note lands at |
|---|---|---|
| `cast` | `action`, `offset` | cast start + `offset`; predicted from the schedule and armed when the cast begins |
| `event` | `event`, `offset` | the event time + `offset` (events: action ids, `landing`, `threatLost`) |
| `hpBelow` | `hp` | immediately, while the player's health fraction is under `hp` and the buff is down |

`early` / `late` are the seconds before and after the landing time that still
count (within `windows.perfect` of it is perfect, otherwise good). `early: 0`
draws the note as a pulsing NOW. `doneBy` names an event that satisfies the
note without a key press. `short` is the label drawn beside the note; `label`
and `tip` feed the scorecard. The 20 rotation points come from
`grading.rotationPoints` and `grading.beatWeights`.

### Drills

```json
{ "id": "pickup", "name": "Phase 3 pickup", "description": "...",
  "startPhase": 2, "startOffset": -5, "duration": 45, "loop": true, "start": "pickup",
  "actions": [ { "id": "cleave", "first": 4, "every": 7, "jitter": 1 } ] }
```

`startPhase` and `startOffset` (negative means "seconds before the end of that
phase") set the clock; `start` is a position preset (`entrance`, `wall`,
`pickup`); `actions` replaces the phase action lists for the whole drill;
`duration` ends the run; `loop` restarts it from the scorecard.

### Tutorial steps

```json
{ "id": "buffet", "title": "Wing Buffet", "text": "...",
  "setup": { "bossPassive": false, "ghost": true, "phase": 3, "start": "wall" },
  "trigger": "wingBuffet",
  "done": { "type": "expectation", "id": "rebuild" } }
```

`setup` can wake or calm the boss, jump to a phase, teleport to a preset and
force the ghost tank on. `trigger` fires one boss action after the text has
been on screen for a moment. `done` types: `viewToggledOrWait {seconds}`,
`playerAtSpot {spot}`, `bossAtSpot {spot, hold}`, `eventLanded {event,
metricUnchanged}`, `expectation {id}` (resolved on time or late), `wait
{seconds}`.

## Adding a boss

1. Copy `data/encounters/onyxia.json` to `data/encounters/<boss>.json`.
2. Draw the room: `arena.floor` polygons for every walkable area (they must
   overlap where they connect), `arena.walls` polylines for what the POV view
   draws, and `arena.backWall` for the "against the wall" check. Keep +y as
   "away from the entrance" so the top-down map reads naturally.
3. Set `positions`. The core reads the named spots directly, so keep the names
   (`tankSpot`, `bossSpot`, `pickupSpot`, `landSpot`, ...) even if a boss does
   not use a mechanic; unused spots can sit anywhere sensible.
4. Define `actions` using the existing ids, then `phases` with their timers
   and `expectations` built from the existing checks.
5. If the boss needs a genuinely new mechanic: add its resolution as a `case`
   in `resolveAction` in `src/core/sim.js`, add any new check as an exported
   function in `src/core/expectations.js` and register it in `CHECKS`, and add
   a metric to `continuousMetrics`. Add a test in `tests/` for each.
6. Point `src/main.js` at the new script (it fetches
   `./data/encounters/onyxia.json` at boot) or add it to the encounter list
   there.
7. Run `npm test`, then walk the tutorial and each drill in both views.

## Known placeholder values to tune against the live fight

Nothing in the script was measured on a live server. These are the numbers
most worth checking, with what to log in game:

| Value | Current | Where | What to measure |
|---|---|---|---|
| Flame Breath cadence / cast | every 20 s ± 2, 3 s cast, first at 16 s | `phases[].actions`, `actions.flameBreath` | combat log timestamps between casts; cast bar length |
| Flame Breath cone | 60°, 60 yd | `boss.cones.breath` | who gets hit at the flanks and at range |
| Cleave cadence / cone | every 7 s ± 1; 90°, 15 yd | `actions.cleave`, `boss.cones.cleave` | hits on melee standing at the flanks |
| Wing Buffet cadence, cast, knockback, threat cut | every 25 s ± 2, 1 s cast, 22 yd, 35% | `actions.wingBuffet`, `threat.buffetCut` | knockback distance on open floor; threat meter drop |
| Tail Sweep arc, range, knockback | 120°, 18 yd, 10 yd | `boss.cones.tail`, `actions.tailSweep` | the angle behind her that still gets swept |
| Phase thresholds and lengths | 65% / 40%; 110 s, 80 s, 130 s | `phases[].hpTo`, `phases[].duration` | your raid's actual DPS timeline |
| Deep Breath warning and lane | 5 s warning, 3 s burn, 22 yd wide, every 26 s ± 3 | `actions.deepBreath`, `deepBreathLanes` | emote-to-fire delay; lane width; which hover points she uses |
| Fireball cadence | every 3 s ± 1 | `actions.fireball` | cosmetic only |
| Whelp waves | every 34 s ± 3, 6 per cave, speed 6 | `actions.whelpWave` | wave size and timing; whether both caves spawn together |
| Bellowing Roar cadence / cast / fear | every 32 s ± 1, 1.5 s cast, 3 s fear | `actions.bellowingRoar`, `player.fearDuration` | cast bar length; fear duration with and without resist (the gap is kept above the 30 s immunity cooldown on purpose) |
| Sunder Armor | 5 stacks, 30 s, one per 1.5 s global | `playerAbilities.sunder` | your rank's stack cap and duration |
| Press-cue windows | perfect ±0.3 s; Sunder +1.0 s; Block −1/+2 s around 0.5 s into the cast; Rage −2.5/+1.2 s; Taunt on turn +3 s; Taunt on landing −1/+4 s around 1 s; Shield Wall under 35% +3 s | `rotation` | how tight your raid leader wants the reactions |
| Eruption pulse | every 9 s ± 1, 2 s warning, 2 s burn | `actions.eruption` | crack telegraph timing |
| Landing / takeoff | 2.5 s each; threat reset on landing; 2.5 s settle before she walks | `boss.landingDuration`, `boss.takeoffDuration`, `threat.resetOnLanding`, `boss.settleAfterLanding` | whether threat truly resets and how long she is untargetable |
| Grace windows | raid holds DPS 6 s after the pull; facing not charged for 6 s after the pull and 5 s after a landing | `raid.holdAfterPull`, `boss.pickupGrace` | how long your raid really holds, and how fast the pickup must be |
| Threat numbers | Sunder 340, white hits 30/s, raid 50/s, pull at 100%, regain at 110% | `threat`, `raid.threatPerSecond` | threat meter values for one Sunder in Defensive Stance; raid DPS threat after a Buffet |
| Boss movement | 9 yd/s, 180°/s turn, 11 yd melee range, 9 yd body | `boss` | how fast she turns onto the raid; where the tank stands relative to her hitbox |
| Player | 7 yd/s, 200°/s keyboard turn, 6000 HP, 280 HP/s healing | `player` | tank HP pool and incoming healing at your gear level |
| Damage | breath 1800, cleave 900, tail 600, melee 260 / 2 s, lane 4000, crack 1500 | `actions`, `boss.meleeDamage` | combat log; these only matter for the HP bar and death count |
| Ability cooldowns | Taunt 10 s, Shield Block 6 s / 5 s, Shield Wall 60 s / 10 s, fear immunity 30 s / 10 s | `playerAbilities` | your class's real cooldowns (Shield Wall is shortened here on purpose; Fear Ward and Berserker Rage alternate in a real raid) |
| Expectation windows | pull 15 s + 6, pickup 5 s + 4, drag 25 s + 10, rebuild 6 s + 4 | `phases[].expectations` | what your raid leader actually expects |
| Positions | tank spot (0, 50), boss spot (0, 40) facing north, pickup (0, 19), landing (0, 6) | `positions` | your guild's chosen wall and the real landing point |

## Testing

```sh
npm test
```

Runs the node test suite (`node --test`, no dependencies) over the core:
geometry, threat, hazards, scheduler, scoring, and integration tests that drive
the full simulation with a scripted tank: phase transitions, every expectation
type, Wing Buffet at and away from the wall, Bellowing Roar with and without
immunity, Deep Breath lanes, Eruption cracks, whelp pickup in both roles,
drills, manual mode, phase skip, snapshot shape and determinism.

`tests/helpers.js` has a `perfectTank()` bot that follows the sim's own ideal
position; it is handy for checking that a script change is still winnable.

## Porting the core to Lua

The core is the port target. It has no DOM, Canvas, timers or audio; it is a
set of pure functions over plain tables (objects), a fixed-timestep `step`,
and a seeded RNG. Module boundaries map one to one onto Lua files. The only
JavaScript-specific pieces are array helpers (`map`, `filter`, `find`,
`some`), `Object.assign` and `Math` calls, all of which have direct Lua
equivalents. The encounter JSON can be loaded with any Lua JSON library or
converted to a Lua table literal. Inside the game the renderers are replaced by
the real camera and addon frames; the HUD-facing fields on `state` (`upcoming`,
`nextExpected`, `feedback`, `threat`) are already computed by the core so the
addon only paints them. Replace the simulated boss position, facing, cast bar
and threat with values read from the game API and keep the expectation and
scoring code unchanged.
