# Encounter script format

An encounter is one JSON file under `data/encounters/<raid>/<boss>.json`,
listed in `data/encounters/index.json`. The file holds data only: it names
checks, metrics, cues and action kinds that `src/core` implements. Units are
yards and seconds. Headings are degrees, 0 = east, 90 = north (up on the map).
Every number that was not measured in game is a placeholder: say so in `notes`
and list the sources in `sources`.

Validate with `node tools/validate.mjs <raid>/<boss>`: it lints the shape and
plays the full fight and every drill with a scripted bot for each role.

## Top level

| Key | Contents |
|---|---|
| `id` | the boss slug, unique across raids (`lucifron`) |
| `name`, `version`, `notes`, `sources` | display name, script version, free text, list of URLs |
| `raidInfo` | `{ id, name, size }` of the raid (the index also carries it) |
| `arena` | `name`; `floor`: walkable polygons `[{ id, poly: [[x,y],...] }]` whose union is the floor (polygons that connect must overlap); `walls`: polylines drawn as walls, `wallHeight`; `backWall` (optional): the polyline the `nearWall` check measures distance to, within `nearWallDistance`; `labels`: `[{ text, at:[x,y] }]` |
| `positions` | named spots `{ x, y, heading?, tolerance?, headingTolerance?, spread?, label? }`. Required: `playerStart`, `bossStart`, `tankSpot`, `bossSpot`. Common: `raidSpotP1..`, `raidWait`, `meleeSpot`, `rangedSpot`, `healerSpot`, add spawn spots, `pickupSpot`/`landSpot`/`hoverIdle` for a flying boss |
| `player` | `speed`, `turnRate`, `radius`, `hp`, `healPerSecond`, `fearDuration`, `fearSpeed`, `jump: { height, duration }` |
| `ghostTank` | the raid's tank when the player is not one: `speed`, `turnRate`, `hp`, `healPerSecond` (passive healing when nobody plays healer), `healPerSecondWithPlayerHealer` (when the player is the healer; keep it well under the boss's damage so heals matter), `lowHp` (fraction that raises the HEAL note) |
| `raid` | `size`, `melee` (dots at the flanks), `threatPerSecond`, `holdAfterPull`, `meleeFlankDistance`, `whelpContactRange` |
| `boss` | `radius`, `speed`, `turnRate`, `meleeRange`, `meleeDamage`, `meleeInterval`, `stationary` (never walks), `cones` (below), `facingCone` (which cone defines "facing the raid"), `enrageMultiplier`, flying-boss fields `landingDuration`, `takeoffDuration`, `settleAfterLanding`, `pickupGrace` |
| `threat` | `autoAttackPerSecond` (tank player), `ghostTankPerSecond`, `tauntLead`, `tauntBonus`, `tauntDuration`, `buffetCut`, `pullMultiplier` (1.1), `dangerBand` (0.8), `dangerBandDps` (where DPS must stop, default `dangerBand`; lower it on bosses that cut the tank's threat), `resetOnLanding`, `landingRaidThreat`, `turnGrace`, `ghostTauntDelay` |
| `gcd` | global cooldown in seconds (1.5) |
| `roles` | which roles this fight offers (below) |
| `playerAbilities` | the buttons (below) |
| `actions` | boss abilities keyed by id (below) |
| `phases` | the phase list (below) |
| `continuousMetrics` | `{ id: { label, unit:'s'|'count', penaltyPerSecond|penaltyPerUnit, severe, info, roles, phases, bossStates, tip } }` |
| `grading` | `expectationWeights {ontime,late,missed}`, `expectationPoints` 50, `metricPoints` 30, `cuePoints` 20, `cueWeights {perfect,good,missed}`, `grades [{min, grade}]` |
| `cues` | `{ windows: { perfect }, list: [...] }` press notes (below) |
| `drills` | short loops (below) |
| `tutorial` | optional guided steps, `roles` says who it is for |

### Cones

```json
"cones": {
  "breath": { "angle": 60, "range": 45, "label": "Flame Breath", "facing": "front", "style": "breath" },
  "cleave": { "angle": 90, "range": 15, "label": "Cleave", "facing": "front" },
  "tail":   { "angle": 120, "range": 18, "label": "Tail Sweep", "facing": "back", "style": "tail" }
}
```

`angle` is the total width. `facing` `front` or `back`. `style` picks the
drawing (`breath` is only drawn while cast or just landed; `cleave` and
`tail` are faint permanent arcs). A boss without a tail has no `back` cone.

### Roles

```json
"roles": {
  "tank":   { "label": "Main tank", "short": "Tank", "description": "...", "abilities": ["taunt"] },
  "melee":  { "label": "Melee DPS", "short": "Melee", "description": "...", "abilities": ["attack"], "attackRange": 5 },
  "ranged": { "label": "Ranged DPS", "short": "Ranged", "description": "...", "abilities": ["attack"], "attackRange": 30 },
  "healer": { "label": "Healer", "short": "Healer", "description": "...", "abilities": ["heal", "dispel"], "attackRange": 40 }
}
```

Role ids are fixed: `tank`, `offtank`, `melee`, `ranged`, `healer`. `tank` is
required. Role filters elsewhere (`role` / `roles` fields) take one id, a list,
or a group: `tanks` (tank + offtank), `dps` (melee + ranged), `nontank`.

In the tank roles the player holds the boss. In every other role a ghost tank
holds it: the boss targets the ghost, the player's threat is measured against
the ghost's, attacking into the red band pulls aggro, and the healer keeps the
ghost tank alive.

### Player abilities

```json
"playerAbilities": {
  "taunt":  { "kind": "taunt", "label": "Taunt", "cooldown": 10, "gcd": false, "range": 16, "icon": "taunt", "tip": "..." },
  "attack": { "kind": "attack", "label": "Attack", "cooldown": 0, "gcd": true, "icon": "attack", "threat": 140, "tip": "..." },
  "heal":   { "kind": "heal", "label": "Heal the tank", "cooldown": 0, "gcd": true, "range": 40, "icon": "heal", "amount": 1600, "threat": 25, "tip": "..." },
  "dispel": { "kind": "dispel", "label": "Dispel", "cooldown": 0, "gcd": true, "range": 30, "icon": "dispel", "dispels": ["magic", "curse"], "tip": "..." },
  "interrupt": { "kind": "interrupt", "label": "Interrupt", "cooldown": 10, "gcd": false, "range": 8, "icon": "interrupt" }
}
```

Kinds: `taunt` (also picks up loose adds in range), `attack` (adds `threat`,
counted for uptime), `heal` (heals the ghost tank by `amount`), `dispel`
(removes the oldest dispellable debuff, optionally only of the listed types),
`interrupt` (stops a cast whose action has `interruptible: true`).

### Actions

Every action has `label`, `kind`, `cast` (seconds, 0 = instant), `warn`
(big centre warning + spoken countdown), `cue` (audio cue id or null),
`icon`, `requires` (`grounded` default, or `airborne`), optional `conditional`
(`behind`: only when someone is in the rear cone; `onPlayer`: only while the
boss is on the tank and not held by a Taunt), `interruptible`, `hidden`
(never on the timeline) and `tip`.

| kind | fields | what happens |
|---|---|---|
| `cone` | `cone` (name in `boss.cones`), `damage`, `knockback`, `hitsMelee`, `raidMetric`, `raidToast`, `playerMetric` | hits whoever is in the cone: the player, the ghost tank, the raid dots (melee dots only with `hitsMelee`) |
| `knockback` | `knockback`, `knockbackRange`, `damage`, `threatCut`, `wallMetric`, `radial`, `playerMetric` | pushes the player back if in front and in range (`radial`: all round her, like Wrath of Ragnaros); cuts the tank's threat |
| `fear` | `duration`, `targets` (`all`, `tank`, `random` + `count`), `playerChance` | fears the player (random: with probability count / raid size, or `playerChance`) |
| `aoe` | `damage`, `radius` (from her edge; 0 or missing = whole room), `tankDamage`, `playerMetric` | damages the player (and the ghost tank); `playerMetric` counts each hit, so a radius you were meant to leave is scored |
| `hazard` | `placement` (`player`, `tank`, `boss`, `random` + `count`, `spots` + `spots:[]`, `lanes` + `lanes` key, `polys` + `polys` key), `radius`, `warning`, `active`, `damage`, `tick` (damage per second instead of once), `laneWidth` for lanes, `playerChance` (odds that `random` lands on you), `carried` + `raidMetric` (a bomb: the zone follows you through `warning`, the ideal marker shows where to run, and `raidMetric` counts each time it goes off with raid members inside) | a telegraphed floor zone; `polys` pulses persistent polygons listed in a phase's `persistentHazards` |
| `adds` | `count` per spot, `from: [spotNames]`, `speed`, `aggroRange`, `lifetime`, `heldLifetime`, `pickup` (role that takes them, default `offtank`), `holdSpot` | spawns a wave that walks at the raid; the pickup role catches them by proximity or Taunt |
| `aggroPull` | `threatMultiplier` (tank roles), `duration` (others) | a DPS overtakes the tank: she turns on the raid until the tank Taunts |
| `targetSwitch` | `duration`, `toast` | she goes for someone else; the tank has to take her back |
| `threatWipe` | `toast` | the whole table resets (raid keeps `threat.landingRaidThreat`) |
| `debuff` | `dispel` (`magic`, `curse`, `poison`, `disease`, `none`), `duration`, `tickDamage`, `target` (`random` + `count`, `tank`, `player`, `all`), `playerChance`, `fear` | puts a debuff on someone; dispellable ones raise the healer's DISPEL note |
| `enrage` | `toast` | melee damage x `boss.enrageMultiplier` from now on |
| `projectile` | `travel`, `splash`, `damage`, `playerChance` | a fireball at a random target |
| `transition` | | `landing` / `takeoff` are driven by `phases[].bossState`; define them so the timeline can name them |

### Phases

```json
{
  "id": 1, "name": "Phase 1", "subtitle": "Grounded",
  "hpFrom": 1.0, "hpTo": 0.65, "duration": 110,
  "bossState": "grounded", "raidSpot": "raidSpotP1",
  "spots": { "tank": "tankSpot", "boss": "bossSpot", "ranged": "rangedSpot", "healer": "healerSpot" },
  "persistentHazards": [],
  "actions": [ { "id": "flameBreath", "first": 16, "every": 20, "jitter": 2 } ],
  "expectations": [ ... ]
}
```

Boss HP drains from `hpFrom` to `hpTo` over `duration`; `spots` say where each
role stands (`melee` defaults to a computed flank, the others to `raidSpot`).
`bossState: "airborne"` makes the boss fly (Onyxia only).

### Expectations

Each has `id`, `label`, `tip`, an optional `role` filter, and a type:

| type | fields | meaning |
|---|---|---|
| `bossAtSpot` | `spot`, `within`, `grace`, `from` (`phaseStart`, `engage`, `landing`, or an action id) | the boss must be at the spot within `within` s of the trigger |
| `playerAtSpotBy` | `spot`, `grace` | the player must be at the spot when the phase ends |
| `onEvent` | `event`, `check`, `grace` | when the action lands, `check` must pass (not judged while feared) |
| `afterEvent` | `event`, `check`, `within`, `grace`, `notBefore` | after the action, `check` must pass within `within` s; `notBefore` delays judging |
| `continuous` | `metric` | names the metric that scores the behaviour |

Checks: `nearWall`, `threatLead`, `hasAggro` (boss on the player),
`onTank` (boss on whoever tanks), `outsideLane`, `outsideHazard`,
`facingAway`, `whelpsPicked`, `inRange`, `notInFront`, `noDispellable`.
Events: action ids, `landing`, `takeoff`, `deepBreath`, `threatLost`.

### Built-in metrics the core accumulates

Tank: `bossFacingRaid` (s), `threatLostCount`, `buffetsOffWall`, `pickupTime`,
`playerInTail`, plus any `raidMetric` named by a cone action. Everyone:
`deaths`, `playerInHazard` (s), `playerInCrack` (s). Non-tank: `playerInFront`
(s), `aggroPulls`, `earlyPulls`, any `playerMetric` named by a cone action.
DPS: `attacks`, `attacksInRed`, `earlyAttacks`, `dpsIdle` (s), `outOfRange`
(s). Healer: `heals`, `overheals`, `dispels`, `debuffSeconds` (s),
`tankLowSeconds` (s), `tankDeaths`. Off-tank: `whelpsOnRaid` (s). Only the
metrics listed in `continuousMetrics` are scored or shown; use `roles`,
`phases` and `bossStates` on a metric to limit where it applies.

### Cues

```json
{ "id": "tauntLost", "ability": "taunt", "on": "event", "event": "threatLost", "offset": 0, "early": 0, "late": 3, "role": "tanks", "short": "ON RAID", "label": "...", "tip": "..." }
```

Events that raise notes: action ids, `landing`, `threatLost`, `whelpWave`,
`whelpPickup` (as `doneBy`), `tankLow`, `debuffApplied`, `dispelled`,
`interrupted`. A note is only raised when the ability can be ready inside its
window.

### Drills

```json
{ "id": "taunt", "name": "When to Taunt", "description": "...", "roles": "tanks",
  "startPhase": 1, "startOffset": 0, "duration": 60, "loop": true, "start": "wall",
  "actions": [ { "id": "aggroPull", "first": 6, "every": 13, "jitter": 3 } ] }
```

`start` is `entrance`, `wall` (already tanking at the boss spot) or `pickup`.
Give every role at least one drill.

### Tutorial

Optional. `roles` filters who sees it. Steps: `{ id, title, text, setup: { bossPassive, phase, start, ghost }, trigger: actionId, done: { type, ... } }`
with done types `viewToggledOrWait`, `wait`, `playerAtSpot`, `bossAtSpot {spot, hold}`, `eventLanded {event, metricUnchanged}`, `expectation {id}`.

## Authoring checklist

1. Draw the room from the research (`arena.floor`, `walls`, `labels`); keep +y
   away from the entrance.
2. Place `positions` for every role and every phase, and spawn spots for adds.
3. Define `boss.cones` and every `action` with its kind, cast, cadence
   (`first`/`every`/`jitter` live in the phase), damage and telegraph.
4. Write phases with `spots`, `actions` and expectations per role; add
   role-specific `continuousMetrics` with penalties and tips.
5. Add cues for the reactions that matter and at least one drill per role.
6. Put every unknown in `notes` and every URL in `sources`.
7. `node tools/validate.mjs <raid>/<boss>` must print all green.
