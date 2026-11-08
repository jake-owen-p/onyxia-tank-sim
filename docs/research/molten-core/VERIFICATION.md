# Molten Core encounter scripts: independent verification

Second research pass over `data/encounters/molten-core/<slug>.json`, checked against `docs/research/molten-core/<slug>.md`. Only disagreements, gaps and misleading modelling are listed.

## How to read this

- Item format: script field path, script value, what the sources say, confidence, exact change.
- Source weight, best first:
  1. Wowhead Classic spell pages (Classic client data, read through `https://r.jina.ai/`).
  2. DBM-Vanilla and BigWigs_Classic timers, which are derived from real combat logs.
  3. cmangos boss scripts, which are emulator reconstructions and only used where nothing better exists.
  4. Guides and warcraft.wiki.gg.
- DBM `"v21-37.2"` means the next cast lands somewhere in that window.
- `first` counts from phase start and the walk to the pull costs about 5-10 s, so a real "first cast at t" maps to about `first: t + 5`. Differences of a few seconds on `first` are not reported.
- Engine radii are measured from the boss's edge (`sim.js:133`, `bossRangeTo`). Geometry below uses "centre" and "edge" accordingly.
- All ten scripts currently pass `node tools/validate.mjs`. Re-run it after applying any item.

Source roots used repeatedly:

- DBM: https://github.com/DeadlyBossMods/DBM-Vanilla/tree/master/DBM-Raids-Vanilla/MC (`<Boss>.lua`)
- BigWigs: https://github.com/BigWigsMods/BigWigs_Classic/tree/master/MoltenCore (`<Boss>.lua`)
- cmangos (emulator): https://github.com/cmangos/mangos-classic/tree/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core (`boss_<name>.cpp`)
- Wowhead Classic spell pages: `https://www.wowhead.com/classic/spell=<id>`

---

## Lucifron

### LUC-1 [high] Shadow Shock is single-target, not an AoE on the melee pack
- Field: `actions.shadowShock` (`kind: "aoe"`, `radius: 20`, `damage: 450`, tip "to the melee pack ... Ranged stay past 20 yd"); `phases[1].expectations[tankUp].tip` ("ticking on the melee pack").
- Sources: Wowhead Classic 19460 is range 20 yd, no radius, "instantly lashes an enemy" (https://www.wowhead.com/classic/spell=19460). cmangos casts it on `GetVictim()` every 3-6 s (`boss_lucifron.cpp` line 93, emulator). The research file already records the single-target reading; the script took the "middle" of it and a one-off guide remark.
- Change: replace the action with the Gehennas tank-hit pattern: `{"label":"Shadow Shock","kind":"debuff","cast":0,"dispel":"none","target":"tank","duration":1.5,"tickDamage":450,"warn":false,"cue":null,"icon":"fireball","requires":"grounded","tip":"419-485 Shadow on Lucifron's current target every 3-6 s. Tank healing, nothing to dodge."}`. Reword the phase 2 `tankUp` tip to "Shadow Shock keeps landing on the tank". Delete the "20 yd AoE ... so melee feel it" sentence from `notes`.

### LUC-2 [high] Doom and Curse cadences are too fast
- Field: `phases[*].actions` `impendingDoom` (`every: 20, jitter: 2`), `lucifronsCurse` (`every: 20, jitter: 2`).
- Sources: DBM `Lucifron.lua`: Doom CD `v21-27`, Curse CD `v21-25.9`. BigWigs `Lucifron.lua` uses 20 for both as the minimum. The guides' "every 15 s" in the research is contradicted by the logs.
- Change: `impendingDoom` to `every: 24, jitter: 3`; `lucifronsCurse` to `every: 23.5, jitter: 2.5`, in both phases. Leave `first` as is (14 and 18 equal DBM's first windows plus the pull walk).

### LUC-3 [medium] The dispel priority contradicts itself
- Field: `cues.list[dispelIt].tip` ("Tank first, then healers, then everyone else") against `expectations[doomDispel].tip` ("healers first, then tanks").
- Sources: the research (Wowhead guide) gives healers > tanks > mind-controlled > rest for Impending Doom. "Tank first" is the Curse rule.
- Change: cue tip to "Dispel the moment it lands. Impending Doom: healers first, then tanks. Curse: tank first."

### LUC-4 [low] Pillar label promises something the script does not do
- Field: `arena.labels` "Pillar (tank behind it for line of sight)" at (-22, 24), with `positions.tankSpot` at (0, 28). The pillar is 18 yd from the tank spot and no line-of-sight logic exists.
- Change: delete the label, or reword to "Pillar".

---

## Magmadar

### MAG-1 [high] Frenzy starts about 20 s too late and fires slightly too slowly
- Field: `phases[0].actions` `frenzy` (`first: 32, every: 22, jitter: 3`).
- Sources: DBM `Magmadar.lua`: first `v6.4-11.3`, CD `v16.1-21.1`. BigWigs `Magmadar.lua`: 7.1 on engage, then 18 ("18-21"). cmangos's 30 s first cast (emulator) is what the research carried over.
- Change: `{"id":"frenzy","first":12,"every":18.5,"jitter":2.5}`. Update `notes`.

### MAG-2 [high] Frenzy is modelled as a permanent enrage
- Field: `actions.frenzy` (`kind: "enrage"`), `boss.enrageMultiplier: 1.4`, tip "here it stays, so heal through it".
- Sources: Wowhead Classic 19451 is an 8 s buff (+150% attack speed, Dispel type Enrage) (https://www.wowhead.com/classic/spell=19451). `sim.js` `resolveAction` (`case 'enrage'`) sets `state.enraged = true` for the rest of the fight. With MAG-1 applied he would be enraged for almost the whole fight, which is the opposite of the real 8 s window ended by a Tranq.
- Change: use a time-limited tank spike: `{"label":"Frenzy","kind":"debuff","cast":0,"dispel":"none","target":"tank","duration":8,"tickDamage":200,"warn":true,"cue":"roar","icon":"roar","requires":"grounded","tip":"+150% attack speed for 8 s and a Lava Breath every 4 s while it lasts. Tranquilizing Shot removes it; heal hard until it does."}` (200 per second approximates 2.5x swing speed on 280 per 2 s; validate tank survival). Remove `enrageMultiplier` or leave it unused. Keep the toast text as the tip.

### MAG-3 [high] Lava Breath fires independently of Frenzy
- Field: `phases[0].actions` `lavaBreath` (`first: 30, every: 9, jitter: 2`), `notes` "Middle: a flat cadence".
- Sources: Wowhead Classic 19451 effect #3 "Periodically trigger spell ... every 4 seconds" for the 8 s buff. cmangos comments Lava Breath as `Triggered by SPELL_FRENZY (19451)` (emulator, consistent with the spell data). A Tranq therefore stops the breaths, which is the point of the mechanic.
- Change: remove `lavaBreath` from `phases[0].actions`; add to the Frenzy action `"follow":[{"id":"lavaBreath","delay":4},{"id":"lavaBreath","delay":8}]`. Update the tip to "Only while he is Frenzied, every 4 s; a Tranquilizing Shot stops it." Drills that schedule `lavaBreath` directly can stay.

### MAG-4 [high] Panic cadence is too fast
- Field: `phases[0].actions` `panic` (`every: 32, jitter: 2`).
- Sources: DBM `Magmadar.lua`: CD `v37.3-66.4`. BigWigs: 31 ("31-50, sometimes even higher"). cmangos's 30-35 s is emulator.
- Change: `every: 44, jitter: 10`. Keep `first: 12`.

### MAG-5 [high for the geometry, medium for the radius] Healer spot is inside the fear it claims to avoid
- Field: `positions.healerSpot` (0, -9), 23 yd from Magmadar's centre at (0, 14), 17 from his edge; `roles.healer.description` "At max range behind him, outside the fear"; `actions.panic.tip` "Healers past 30 yd are untouched".
- Sources: research positioning (30 yd, 40 yd heal range). Geometry computed from `positions`. Wowhead Classic 19408 actually lists radius 45 yd (https://www.wowhead.com/classic/spell=19408), so whether anyone is truly safe at 30 is unresolved (see Could not verify).
- Change: `healerSpot` to `{"x":-22,"y":-8,"tolerance":4,"label":"Healers: 30+ yd from him, in heal range of the tank"}`, which is 31.1 yd from his centre and 38.0 yd from `tankSpot` (0, 23), and on the floor. The engine still fears at a fixed `playerChance` regardless of position (engine limitation E3).

### MAG-6 [medium] Ranged has no button for the fight's key mechanic
- Field: `roles.ranged.description` "Hunters: Tranquilizing Shot the instant Frenzy appears"; no ability exists.
- Sources: research; `cast:<id>` cues and `completedMetric` are available.
- Change (optional): add `playerAbilities.interrupt = {"kind":"interrupt","label":"Tranquilizing Shot","cooldown":15,"gcd":false,"range":35,"icon":"interrupt"}` (the id must be literally `interrupt` for `completedMetric`, see `sim.js:537`; cooldown 15 is a placeholder so one player can answer every Frenzy, where real raids rotate two hunters), and add it to `roles.ranged.abilities`. Add a hidden `frenzyWindow` action (`kind: "transition"`, `cast: 8`, `interruptible: true`, `completedMetric: "frenziesLeftUp"`) scheduled alongside `frenzy`, with a cue on `cast:frenzyWindow` for role `ranged`. Caveat: a boss cast stops his melee (`sim.js:895`), so raise the Frenzy `tickDamage` to compensate, or accept the tank respite.

### MAG-7 [low] Stale engine-bug note
- Field: `notes`, "Known engine bug ... `placement: "random"` hazards never spawn. ... until that bug is fixed, Lava Bomb does not appear in play."
- Sources: `sim.js` `placeHazard` now has a correct `else if` chain; `random` works.
- Change: delete the sentence (also in Gehennas and Baron Geddon).

---

## Gehennas

### GEH-1 [high] Curse cadence is too fast
- Field: `phases[*].actions` `gehennasCurse` (`every: 20, jitter: 3`).
- Sources: DBM `Gehennas.lua`: CD `v25.9-35.6`, first `v6.4-14.5`. BigWigs: 6 on engage, 27 ("27-37").
- Change: `every: 30, jitter: 5`. Update `notes`.

### GEH-2 [high] Fist of Ragnaros is a radius, not a frontal cone
- Field: `roles.melee.description` "from behind: Fist of Ragnaros stuns everyone in front".
- Sources: Wowhead Classic 20277: range Self, radius 8 yd, 4 s stun, no cone (https://www.wowhead.com/classic/spell=20277). Standing behind a guard does not avoid it.
- Change: "Kill the guards first, then Gehennas. Fist of Ragnaros stuns everyone within 8 yd of a guard for 4 s from any side, so carry Free Action Potion and keep guards apart. Step out of Rain of Fire; keep threat under the tank."

### GEH-3 [low] Rain of Fire may be more frequent
- Field: `phases[*].actions` `rainOfFire` (`every: 9, jitter: 3`).
- Sources: DBM `Gehennas.lua`: `NewCDTimer(4.8, 19717)`, a 4.8 s minimum with no stated maximum. cmangos 6-12 s (emulator).
- Change: optionally `every: 7, jitter: 2`. Low confidence, because the upper bound is unknown.

### GEH-4 [low] Stale engine-bug note
- Field: `notes`, same sentence as MAG-7. Change: delete it.

---

## Garr

### GAR-1 [high] Separation Anxiety is 100 yd, not 15 yd
- Field: `roles.offtank.description` "Keep them close to Garr (15 yd or they get Separation Anxiety and hit for 4-6k)"; `phases[0].expectations[adds].tip` "past 15 yd they get Separation Anxiety".
- Sources: Wowhead Classic 23487: radius 100 yards (https://www.wowhead.com/classic/spell=23487). cmangos comment: "Garr has a 100 yard aura to keep track of the distance of each of his adds" (`boss_garr.cpp` line 75, emulator). The research's 15 yd is from guides and is probably conflated with Eruption's 15 yd.
- Change: replace both strings with "Keep them off the raid. They only gain Separation Anxiety (+300% damage, Banish immune) if dragged out of Garr's 100 yd aura, which will not happen in this room."

### GAR-2 [high on the spell, medium on the numbers] Immolate uses the Flamewaker Priest's spell
- Field: `actions.immolate` (`tickDamage: 133`, tip "760-840 Fire and 380-420 every 3 s for 21 s").
- Sources: DBM `Garr.lua` tracks spell 15732. Wowhead Classic 15732 lists Garr and Firesworn under "Used by" (https://www.wowhead.com/classic/spell=15732), showing base values before level scaling. Spell 20294 is the Flamewaker Priest's Immolate. The research's reading of https://warcraft.wiki.gg/wiki/Garr gives the level-scaled Firesworn numbers: 337 + 168 every 3 s for 21 s.
- Change: `tickDamage: 56` (168 / 3) and tip "337 Fire and 168 every 3 s for 21 s. Magic. Cleanse it off the tanks first." Fix `expectations[immolateDispel].tip` ("133 a second") and the `notes` sentence.

### GAR-3 [high] Antimagic Pulse is taught as a dispel that does not exist
- Field: `actions.antimagicPulse` (`kind: "debuff"`, `dispel: "magic"`), expectations `pulseDispel` in both phases, `roles.healer.description` "whatever Antimagic Pulse stripped".
- Sources: research (spell 19492 removes one beneficial Magic effect from each player); the script's own `roles.ranged.description` says "Do not rebuff after Antimagic Pulse". The expectation tip "Put back what matters, and dispel what he left" has healers chasing a debuff the real spell never applies.
- Change: `dispel: "none"`, remove both `pulseDispel` expectations, remove "and whatever Antimagic Pulse stripped" from the healer description, leave the action on the timeline as a notice (as Sulfuron does with Demoralizing Shout), and drop it from the healer `cleanseOrder` drill.

### GAR-4 [high] Eruption marker: `moveOut` fits, and 2 s is too short
- Field: `actions.eruption` (`cast: 2`, no `moveOut`), drill `eruptionFootwork` ("walk 15 yd out of Garr").
- Sources: the engine's `moveOut` marker needs `boss.radius + radius + 3` = 22 yd from Garr's centre. From the melee spot at 6.5 yd that is 15.5 yd of walking, 2.2 s at speed 7, longer than the 2 s cast before any reaction time. The real call-out is many seconds of watching add health (research).
- Change: `actions.eruption.cast: 4`, add `"moveOut":"melee"`. Update the `notes` sentence on the "2 s call-out telegraph".

### GAR-5 [low] Antimagic and Shackles cadences are about 1 s fast
- Field: `phases[*].actions` `antimagicPulse` (`every: 17.5, jitter: 2.5`), `magmaShackles` (`every: 12.5, jitter: 2.5`).
- Sources: DBM `Garr.lua`: `v16.2-21.1` and `v11.3-16.2`.
- Change: `antimagicPulse.every: 18.5`; `magmaShackles.every: 13.7`.

### GAR-6 [low] Dispelling Magma Shackles is given the priority of a real healer job
- Field: `expectations[shacklesDispel]` in both phases.
- Sources: research lists Immolate as the healer's dispel priority and gives Free Action Potion and Escape Artist as the answer to Shackles; it is reapplied raid-wide every 11-16 s.
- Change: soften the tip to "Dispel Shackles on tanks and melee when you have a free global; Immolate comes first", or mark the expectation with a wider `grace`.

---

## Baron Geddon

### GED-1 [high] Inferno comes far more often than the script says
- Field: `phases[0].actions` `infernoZone` (`first: 45, every: 45`).
- Sources: DBM `Geddon.lua`: first `v11.3-33.4`, CD `v21-37.2`. BigWigs `BaronGeddon.lua`: bar after removal `-- 21-29`, i.e. cast to cast 21-29 s. The research's 45 s is an emulator constant.
- Change: `{"id":"inferno","first":24,"every":29,"jitter":8}` (uses GED-4's action id).

### GED-2 [high] Living Bomb comes far more often
- Field: `phases[0].actions` `livingBomb` (`first: 35, every: 35`).
- Sources: DBM `Geddon.lua`: first `v11.3-30.7`, CD `v11.3-30.1`.
- Change: `{"id":"livingBomb","first":20,"every":20,"jitter":9}`.

### GED-3 [high] Ignite Mana timing is off
- Field: `phases[0].actions` `igniteMana` (`first: 30, every: 30`).
- Sources: DBM `Geddon.lua`: first `v6.3-27.5`, CD `v25.9-44`. BigWigs: 6 on engage, then 27.
- Change: `{"id":"igniteMana","first":12,"every":33,"jitter":8}`.

### GED-4 [high] Inferno and Armageddon still use the zero-damage hazard plus `follow` workaround
- Field: `actions.infernoZone`, `actions.armageddonZone`, their `follow` entries; expectations `infernoOutTank`, `infernoOutMelee` and `armageddonOut` (all `afterEvent`, `check: "outsideHazard"`).
- Sources: `aoe` with `cast` and `moveOut` is the documented replacement (`ENCOUNTER_FORMAT.md`, `ideal.js:128`).
- Change:
  1. Delete `infernoZone` and `armageddonZone`. In `phases[*].actions` and every drill, schedule `inferno` and `armageddon` directly.
  2. On `inferno` add `"moveOut":true,"tankDamage":0,"warn":true,"cue":"eruption"`. On `armageddon` add `"moveOut":true,"tankDamage":0,"warn":true,"cue":"roar"`. `tankDamage: 0` is required because `ideal.js` moves only the player, and the ghost tank no longer walks out with the hazard gone; with it set, `sim.js:468` deals the ghost 0.
  3. Replace `infernoOutMelee` with `{"id":"infernoOutMelee","type":"continuous","metric":"infernosTaken","role":"melee",...}`, `infernoOutTank` with the same for `role: "tanks"`, and `armageddonOut` with `{"type":"continuous","metric":"armageddonsTaken"...}`, keeping their labels and tips. `continuousMetrics` already has both metrics.
  4. Rewrite the "Inferno telegraph" sentence in `notes`.

### GED-5 [low] Stale engine-bug note
- Field: `notes`, same sentence as MAG-7. Change: delete it.

---

## Shazzrah

### SHA-1 [high for radius, medium for damage] Arcane Explosion is 20 yd in Classic
- Field: `actions.arcaneExplosion` and `actions.blinkExplosion` (`radius: 30`, `damage: 1000`); `positions.rangedSpot`, `healerSpot`, `raidSpotP1`; `roles.ranged` (`attackRange: 34`, "Stay 30+ yd"), `roles.healer` ("Stay outside 30 yd"), `expectations[aeRange].tip` ("It reaches 30 yd"), `arena.labels`.
- Sources: Wowhead Classic 19712: radius 20 yards, effect value 801, tooltip "800 Arcane damage" (https://www.wowhead.com/classic/spell=19712). Wowhead TBC 19712: radius 30, 925-1075 (https://www.wowhead.com/tbc/spell=19712), which is the 3.3.5 value the research used. warcraft.wiki.gg and Ten Ton Hammer (per the research) also say 20 yd.
- Change:
  - Both actions: `radius: 20`, `damage: 800`.
  - `rangedSpot` to `{"x":0,"y":-18,"tolerance":4,"label":"Ranged: outside the 20 yd Arcane Explosion"}` (edge 22, centre 26). `healerSpot` to `{"x":4,"y":-17,"tolerance":4,"label":"Healers: outside Arcane Explosion, in range of the tank"}` (edge 21.3, 18.4 from the tank). `raidSpotP1.y: -19`.
  - `roles.ranged.attackRange` to 30.
  - Every "30 yd" string to "20 yd", and "a hit is 1000" to "a hit is 800".
  - `notes` accordingly. Note the engine reads radius from the boss's edge, so the circle reaches 24 yd from his centre.

### SHA-2 [high] Blink can now be a real teleport
- Field: `actions.blinkGate` (`kind: "targetSwitch"`, no teleport), `boss.stationary: true`, `notes` "He cannot teleport here".
- Sources: `teleportBossTo` (`ENCOUNTER_FORMAT.md`, `sim.js:529`). Wowhead Classic guide: "Shazzrah teleports on top of a random player, clearing all threat in the process" (https://www.wowhead.com/classic/guides/shazzrah-molten-core-strategy). DBM comment on the Gate: "aggro wipe, needs fresh taunt".
- Change: add `"teleportBossTo":"raid"` to `blinkGate`. Remove `boss.stationary` so the tank can walk him back; he must be able to move or he stays on the raid anchor all fight. Delete the `notes` sentences explaining why he cannot teleport. Check with validate that the ghost tank returns him, since a stationary boss was previously assumed.

### SHA-3 [high] Gate cadence is too fast
- Field: `phases[0].actions` `blinkGate` (`every: 40, jitter: 5`).
- Sources: DBM `Shazzrah.lua`: first `v30.3-34.1`, CD `v42.1-48.6`. BigWigs: 30, then 41 ("41-50 elsewhere").
- Change: `every: 45, jitter: 4`. This also answers the research's open question: the live ID is 23138.

### SHA-4 [high] Curse cadence is too fast
- Field: `phases[0].actions` `shazzrahsCurse` (`every: 15, jitter: 2`).
- Sources: DBM `Shazzrah.lua`: CD `v21-26.4`, first `v6.1-13`. BigWigs: 22.6 ("22.6-25 elsewhere").
- Change: `every: 23.5, jitter: 2.5`.

---

## Sulfuron Harbinger

### SUL-1 [high] Dark Mending still uses the instant-action workaround
- Field: `actions.darkMendingCast` (hidden `transition` plus `follow`), `actions.darkMending` (`kind: "aoe"`, `damage: 0`, `radius: 0`, `playerMetric`), `cues.list[kickMending].event`, drill `kickDrill`, `notes` "Cues only fire on an action resolving".
- Sources: `cast:<id>` cues and `completedMetric` exist (`sim.js` `startAction`, `sim.js:537`). DBM `Sulfuron.lua`: `NewCastNPTimer(2, 19775, ...)` confirms the 2 s cast.
- Change: delete `darkMendingCast`. Make `darkMending` `{"label":"Dark Mending","kind":"transition","cast":2,"interruptible":true,"completedMetric":"mendingsLanded","warn":true,"cue":null,"icon":"roar","requires":"grounded","tip":"A 2 s heal for about 30,000 on the lowest-health priest or Sulfuron. Kick it every time."}`. Schedule `darkMending` directly in the phase and drill action lists. Set the cue to `"event":"cast:darkMending"`. Delete the `notes` sentence.

### SUL-2 [high] Shadow Word: Pain tick is more than double the real value
- Field: `actions.swPain` (`tickDamage: 95`).
- Sources: Wowhead Classic 19776: 120 Shadow every 3 s for 18 s, used by Flamewaker Priests and Sulfuron (https://www.wowhead.com/classic/spell=19776). DBM `Sulfuron.lua` tracks 19776. This settles the research's open question: 23952's 422-478 is not the spell in use.
- Change: `tickDamage: 40`, tip "120 Shadow every 3 s for 18 s. Magic. Cleanse it." Update `notes`.

---

## Golemagg the Incinerator

### GOL-1 [low] Tank description is backwards
- Field: `roles.tank.description` "with your back to the raid". `tankSpot` (0, 16) is north of Golemagg (0, 8) with the raid to the south, so the tank's back is to the north wall.
- Change: "Tank him where he stands on the north side, so he faces away from the raid."

### GOL-2 [medium] Off-tank is told to do something the marker does the opposite of
- Field: `roles.offtank.description` ("keep them 30+ yd from Golemagg at the back of the cavern"); `expectations[ragers].tip`; `phases[*].spots.tank`.
- Sources: the Core Ragers follow the player while held, and the off-tank's ideal marker stays at `tankSpot`, 8 yd from him (`ideal.js`, `idealTankPos`), so following it keeps the dogs inside Golemagg's Trust. Nothing scores the distance. `ragerHoldSpot` applies only to ghost-held adds.
- Change: reword the role description to admit the engine gap ("In the real fight you take them 30+ yd away; here the marker holds you on the boss"), or apply engine limitation E5.

---

## Majordomo Executus

### MAJ-1 [high] Shields should use `kind: "shield"`, with an engine caveat
- Field: `actions.magicReflection`, `actions.damageShield` (`kind: "debuff"`, `dispel: "none"`); `notes` "There is no engine way to score attacking into a shield".
- Sources: `shield` exists (`ENCOUNTER_FORMAT.md`, `sim.js:510`, `sim.js:684`). Spell 21075: Damage Shield, 100 Arcane, radius 100, 10 s, 30 s cooldown (https://www.wowhead.com/classic/spell=21075). wiki: "White means that casters should take a break ... purple means that melee classes should stay back" (https://warcraft.wiki.gg/wiki/Majordomo_Executus).
- Change: `magicReflection`: `{"kind":"shield","duration":10,"reflectDamage":400,"toast":"Magic Reflection: casters stop"}` (keep label, warn, cue, tip). `damageShield`: `{"kind":"shield","duration":10,"reflectDamage":100,"toast":"Damage Shield: melee stop"}`. Add `attacksIntoShield` to `continuousMetrics` (`penaltyPerUnit: 2`, `roles: "dps"`). `reflectDamage: 400` is a placeholder. Delete the `notes` sentence. Caveat: `shield` has no role filter, so unless engine limitation E1 is done, ranged are penalised during Damage Shield and melee during Magic Reflection.

### MAJ-2 [high] First shield comes too early
- Field: `phases[0].actions` `magicReflection` (`first: 15`), `damageShield` (`first: 45`).
- Sources: DBM `Majordomo.lua`: shield first `v25.6-30.7`, CD 30.7. BigWigs: 27 then 30. cmangos's 15 s is emulator.
- Change: phase 1 `magicReflection.first: 32` and `damageShield.first: 62` (walk-adjusted). The `every: 60` pairing is fine, but note the real pick is random each time (cmangos `urand(0, 1)`, emulator), not strict alternation.

### MAJ-3 [high] Teleport can now put the tank in the coals
- Field: `actions.teleport`, `actions.coals` (`kind: "debuff"`, a 400-per-tick stand-in), `notes` "no player teleport exists".
- Sources: Wowhead Classic 20534: "Teleports an enemy into the midst of burning coals" (https://www.wowhead.com/classic/spell=20534). DBM `Majordomo.lua` tracks 20534 (CD `v25.9-30.8`). `teleportTankTo` exists (`sim.js:533`).
- Change:
  - Add `positions.coalsSpot = {"x":0,"y":4,"label":"Burning coals"}`. This is 14 yd from Executus' edge, inside Taunt range 16.
  - On `teleport` add `"teleportTankTo":"coalsSpot"` and set follow to `[{"id":"teleportWipe","delay":0.1},{"id":"coalZone","delay":0}]`.
  - Replace `coals` with `coalZone`: `{"label":"Burning coals","kind":"hazard","placement":"spots","spots":["coalsSpot"],"radius":8,"warning":0,"active":6,"tick":true,"damage":300,"warn":false,"cue":null,"icon":"fireball","requires":"grounded","hidden":true,"tip":"The coals burn until you walk out. Healers land a heal as the tank comes out."}` (damage is a placeholder; no source numbers it).
  - Add an expectation per phase, `{"type":"afterEvent","event":"teleport","check":"outsideHazard","within":3,"grace":2,"role":"tanks","label":"Walk out of the coals"}`.
  - Delete the `notes` sentence.

### MAJ-4 [high] Dark Mending uses the same workaround as Sulfuron
- Field: `actions.darkMendingCast`, `actions.darkMending`, `cues.list[kickMending].event`, `phases[1].actions`, drill `kickHeals`.
- Change: as SUL-1, tip "A 2 s heal for 27,750-32,250 on a hurt add. Kick it every time.", `"event":"cast:darkMending"`.

### MAJ-5 [medium] Drill cannot be done by ranged
- Field: `drills[kickHeals].roles: "dps"` (description "Kick each one"), while `roles.ranged.abilities` is `["attack"]`.
- Change: `roles: "melee"`, and give ranged a separate drill built on `magicReflection` once MAJ-1 is applied.

### MAJ-6 [low] Damage Shield instruction may be too strong
- Field: `actions.damageShield.tip` "Melee step back until it drops"; `roles.melee.description` "stop the moment Damage Shield goes up".
- Sources: DBM `Majordomo.lua` downgrades the warning because it "isn't a threat to high-level melee". The wiki says stay back.
- Change: soften to "Damage Shield hits you for 100 per swing; stop if the healers are short, otherwise keep hitting." Low confidence, since the sources genuinely differ.

---

## Ragnaros

### RAG-1 [high] Submerge is available
- Field: `phases[1]` (`bossState: "grounded"`, `hpFrom: 0.6`, `hpTo: 0.59`), `actions.sons.requires: "grounded"`, `actions.emerge`, `notes` ("He cannot submerge").
- Sources: DBM `Ragnaros.lua`: `timerSubmerge 180`, `timerEmerge 90`, comment "After all 8 die he emerges immediately". BigWigs: same 180/90. Engine: `bossState: "submerged"` (`sim.js:228`).
- Change:
  - `phases[1]`: `"bossState":"submerged","hpFrom":0.6,"hpTo":0.6`.
  - `sons.requires: "submerged"`. Add a `submerge` action for the timeline: `{"label":"Submerge","kind":"transition","cast":0,"warn":true,"cue":"roar","icon":"roar","requires":"any","hidden":true,"tip":"COME FORTH, MY SERVANTS!"}`.
  - Remove `elementalFire` from `phases[1].actions` (it needs a grounded boss) and remove `phases[1].expectations` `threatDps` and `tankUp`, which mean nothing with the boss gone.
  - In `phases[2].actions` change `emerge` to `"first":0`. Keep its `threatWipe`, per `ENCOUNTER_FORMAT.md`.
  - Delete the `notes` sentence.
  - The tank and DPS have nothing to press for 90 s: see E6 and E7.

### RAG-2 [high] Melee are told to leave before Wrath, but nothing moves or scores them
- Field: `actions.wrath` (no `cast`, no `moveOut`), `roles.melee.description` "Back out of 25 yd before each Wrath", `continuousMetrics.wrathsTaken.roles`, `notes` ("the engine's ideal marker has no way to walk them out").
- Sources: Wowhead Classic guide: melee "run out of range when the timer is about to run down" (https://www.wowhead.com/classic/guides/ragnaros-molten-core-strategy). `ideal.js:128` reads `castDef.radius`, so a `knockback` action with a `cast` and a `radius` works. DBM: Wrath first `v25.9-33.8`, CD `v25.9-34.7`, after emerge `v25.5-31.9`. BigWigs: 26, 27.
- Change: on `wrath` add `"cast":5,"radius":25,"moveOut":"melee"` (keep `knockbackRange: 25`). Add `"melee"` to `continuousMetrics.wrathsTaken.roles`. Add a `continuous` expectation on that metric for melee. Set `first` to 25 in phase 1 and leave 22 in phase 3, so the hit lands at about 30 and 27 s. Melee need 25.5 yd of walking, 3.6 s, which a 5 s cast allows. Note a boss cast stops his melee for those 5 s (E13). Delete the `notes` sentence.

### RAG-3 [high] Lava Burst is a decoration
- Field: `actions.lavaBurst` (`placement: "spots"`, spots at (-26,-22), (26,-22), (-14,-38)), `notes` "because `random` hazard placement is broken".
- Sources: `random` placement works now (`sim.js` `placeHazard`). Geometry: the nearest of those spots is 18 yd from `rangedSpot` (0,-26) and 21 yd from `healerSpot` (4,-27), with radius 5, so no role can be hit without wandering. cmangos `SPELL_LAVA_BURST` randomises across geysers (emulator); Wowhead's guide describes a random mana-user target (see Could not verify).
- Change: `"placement":"random","count":1,"playerChance":0.25` and remove `spots`. Delete `geyserWest`, `geyserEast`, `geyserSouth`. Delete the `notes` sentence.

### RAG-4 [medium] Elemental Fire is a melee proc
- Field: `actions.elementalFire.tip` "every 10-14 s", `notes`.
- Sources: `boss_ragnaros.cpp` line 41: `SPELL_ELEMENTAL_FIRE = 20563 // Aura, proc spell 20564 when doing melee damage` (emulator). Wowhead Classic 20564 confirms 2160 + 600/s for 8 s (https://www.wowhead.com/classic/spell=20564).
- Change: tip to "2160-2640 Fire and 600 more every second for 8 s, procced by his melee on the tank. Scaled here." Keep `every: 12` as a stand-in and say so in `notes`.

### RAG-5 [medium] The tank lands out of Taunt range
- Field: `actions.wrath.knockback: 15`, `roles.tank.description` "Taunt the moment you land"; `playerAbilities.taunt.range: 16`.
- Sources: geometry. `tankSpot` is 3 yd from his edge; a 15 yd push lands at 18, beyond 16. `knockback()` moves exactly the given distance (`entities.js:90`).
- Change: `wrath.knockback: 12` (lands at 15 yd, in range).

---

## Errors in the research files

1. **`README.md`, "Molten Core spells kept their 1.x IDs and values".** False for at least Arcane Explosion 19712: Classic 20 yd and 801, TBC/3.3.5 30 yd and 925-1075. Treat Classic spell pages as the authority. Eight other spells spot-checked (21155, 20564, 19272, 19780, 20228, 20603, 21075, 20534) matched the research.
2. **`README.md` methodology.** "No Warcraft Logs report could be fetched" led to emulator cadences being treated as measured, but DBM and BigWigs timers are public and log-derived. They disagree with the emulator on Frenzy, Panic, Inferno, Living Bomb, Curse (Gehennas, Lucifron, Shazzrah), Gate and Shields.
3. **`ragnaros.md`, cmangos citations do not match the current file.** Research says Wrath "first 30 s then 30 s (up to 34 s confirmed)", Might "11 s then 11 s (~11 s confirmed)", Elemental Fire "first 3 s then every 10-14 s". `boss_ragnaros.cpp` (master) has Wrath 30000 then 25000 (20000 after emerge), Might `urand(11000, 30000)`, and Elemental Fire as a passive proc aura with no timer.
4. **`garr.md`.** Firesworn Immolate cited as 20294; DBM and Wowhead Classic list Firesworn under 15732. The 15 yd Separation Anxiety is carried from guides without weighing the 100 yd spell radius.
5. **`shazzrah.md`.** Arcane Explosion 30 yd is a TBC value. The open question on the teleport ID is settled: 23138 (DBM, BigWigs).
6. **`gehennas.md`.** Fist of Ragnaros "frontal cone" (open question) is settled as an 8 yd radius.
7. **`sulfuron-harbinger.md`.** SW:Pain open question is settled: 19776, 120 per 3 s.
8. **`magmadar.md`, `baron-geddon.md`, `majordomo-executus.md`, `lucifron.md`, `gehennas.md` timelines** treat emulator or guide cadences as a typical pull; replace them with the DBM windows above.

## Engine limitations no script change can fix

- **E1. `shield` has no role filter** (`sim.js:510`, `sim.js:684`, `sim.js:969`). Magic Reflection should stop casters only and Damage Shield melee only. A `roles` field checked with `roleMatches` would fix MAJ-1.
- **E2. An `aoe` resolves one pulse at the end of its cast.** Inferno is really 1 s ticks ramping up over 8 s (Wowhead Classic 19695, periodic every 1 s). Walking out on the last second is free here, and late leavers are not punished proportionally.
- **E3. `fear` has no radius or role filter.** Panic cannot spare healers and ranged at range (Magmadar). Fear Ward, Tremor and Berserker Rage cannot be expressed either.
- **E4. No hook for "nobody in melee".** Magma Blast (cmangos fires it when the victim is out of melee reach) cannot exist, though the Ragnaros tank tip relies on it.
- **E5. Off-tank has no position of its own.** `idealTankPos` gives both tank roles `spots.tank`; adds follow the player. "Hold Core Ragers 30+ yd away", "priests in corners 45 yd from Sulfuron" and "keep guards apart" cannot be marked or scored. Off-tank roles also have to hold the boss, unlike the real assignment.
- **E6. Adds have no health and Attack only targets the boss** (`sim.js:680`). DPS have nothing to press in a `submerged` phase, and kill order cannot be scored anywhere.
- **E7. `pickup` takes one exact role id** (`entities.js:327`). The main tank cannot help with Sons.
- **E8. Dispel always removes the oldest debuff.** Priority rules (Doom on healers first, Curse on the tank first) cannot be practised.
- **E9. No stun on the player.** Fist of Ragnaros, Hand of Ragnaros and Earthquake's stun are text only.
- **E10. Raid dots do not react to the player.** Spreading for Flame Spear, Might of Ragnaros and Rain of Fire is not a real decision, because the player's exposure depends only on where the dots already are.
- **E11. No per-stack debuff effects, no armor, no healing reduction and no damage amplification.** Curses that cut healing or raise damage are simply dispel targets, and Magma Splash cannot melt armor.
- **E12. Adds cast nothing.** Dark Mending, Dominate Mind, Immolate and Blast Wave are all attributed to the boss.
- **E13. A boss cast stops its melee** (`sim.js:895`). Any stand-in cast, such as Dark Mending or a Wrath telegraph, gives the tank a free pause.

## Could not verify

- **Panic radius.** Wowhead Classic 19408 lists 45 yd. Every guide says 30 yd, and the strategy of outranging it depends on 30.
- **Deaden Magic cadence.** DBM and BigWigs track only its 30 s duration. Script `every: 22` and cmangos 35 s are both unconfirmed.
- **Lava Burst mechanism.** Emulator geysers versus Wowhead's "random mana user" description. Wrath's threat reset exists in cmangos and a Season of Mastery guide but not in the spell data (https://www.wowhead.com/classic/spell=20566).
- **Arcane Explosion damage.** 801 (Classic) versus 925-1075 (wiki, TBC page). Classic Immolate 15732 per-level scaling (337/168 is the wiki's figure).
- **Warcraft Logs** timelines were not available. vmangos scripts could not be located at the tried paths. Gehennas Rain of Fire has only a minimum interval.
