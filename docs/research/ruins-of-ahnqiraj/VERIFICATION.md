# Ruins of Ahn'Qiraj: independent verification of the encounter scripts

Checked: `data/encounters/ruins-of-ahnqiraj/{kurinnaxx,general-rajaxx,moam,buru,ayamiss,ossirian}.json` against the
research files, the format doc, the engine (`src/core`), and a second research pass. This file lists only
disagreements, gaps and misleading modelling.

Source quality, best first:
- BigWigs_Classic and DBM-Vanilla AQ20 modules. Maintained against live Classic combat logs, so these are the only
  observed timers here. https://github.com/BigWigsMods/BigWigs_Classic/tree/master/AQ20 and
  https://github.com/DeadlyBossMods/DBM-Vanilla/tree/master/DBM-Raids-Vanilla/AQ20
- Wowhead Classic spell data, read through the r.jina.ai proxy. URLs below are the wowhead form.
- warcraft.wiki.gg pages.
- Emulator scripts (AzerothCore, CMaNGOS) are reconstructions, and are labelled when used.

Confidence: high = spell data or addon code states it directly, or it is computed from the script. Medium = sources
imply it or conflict mildly, or the fix involves a judgement call. Low = minor, or a single soft source.

Engine facts used in the geometry (`src/core/sim.js`, `entities.js`):
- `aoe.radius`, `fear.radius` and `knockbackRange` are measured from the boss's edge (`dist - boss.radius`).
- Melee swings and `conditional: "tankInMelee"` reach `meleeRange + 1` from the edge, so for Buru
  (radius 4.5, meleeRange 7) that is 12.5 yd centre to centre.
- The boss stops walking at `meleeRange` centre to centre.

## Summary

| Boss | High | Medium | Low |
|---|---|---|---|
| Kurinnaxx | 1 | 2 | 2 |
| General Rajaxx | 7 | 0 | 3 |
| Moam | 0 | 3 | 3 |
| Buru | 3 | 1 | 3 |
| Ayamiss | 1 | 1 | 1 |
| Ossirian | 2 | 2 | 2 |

Checked and found fine, no change needed:
- Sand Trap radius (8 yd).
- Wide Slash cone range (10 yd + hitbox).
- Rajaxx Thundercrash cadence (21 s, BigWigs).
- Wave composition and order (BigWigs counts 7 adds per wave).
- Ayamiss 70% landing (DBM, BigWigs).
- Ayamiss Lash stun (2 s) and Frenzy at 20% (BigWigs).
- Ossirian Enveloping Winds 10 s and 45 s weakness (DBM, BigWigs).
- Moam stone first at 90 s (DBM, BigWigs).
- Dismember stacks and 10 s duration (DBM).
- Gathering Speed +25% stacking (Wowhead 1834).
- Silicate Feeder "Cloud of Disease" (Wowhead 17742, https://warcraft.wiki.gg/wiki/Silicate_Feeder) is a corpse effect from trash in the
  hallway. BigWigs lists it on the Ayamiss module, but it is not a boss mechanic, so no script change.

---

## Kurinnaxx

### K1 (high) Sand Trap should apply its real Silence
- Field: `actions.sandTrap` (no `applies`); `notes` says "a hazard cannot apply a debuff".
- Script: hazard, damage 2,000, radius 8. The silence and the -75% hit are not modelled.
- Sources:
  - Wowhead 25656 (https://www.wowhead.com/classic/spell=25656): Nature damage, Silence and -75% melee and ranged
    hit, 20 s, radius 8.
  - Format doc: `applies` plus `damage` is now a normal hazard that also applies the debuff.
- Change. Add `"applies": "sandTrapSilence"` to `sandTrap`, and a new action:
  `"sandTrapSilence": {"label":"Sand Trap","kind":"debuff","cast":0,"target":"player","roles":"healer","dispel":"none","duration":20,"forbidAbilities":true,"breakMetric":"castWhileSilenced","hidden":true,"warn":false,"cue":null,"icon":"eruption","requires":"grounded","tip":"Silenced for 20 s and -75% to hit. No spells until it ends."}`
  - Add metric `"castWhileSilenced": {"label":"Pressed into Silence","unit":"count","penaltyPerUnit":4,"severe":2,"roles":"healer"}`.
  - Use `roles: "healer"` because Silence does not stop a wand, an Auto Shot or melee (`forbidAbilities` scores every
    press). The -75% hit on physical attackers has no engine equivalent, so say that in `notes`.
  - Delete the "hazard cannot apply a debuff" sentence from `notes`.

### K2 (medium) Sand Trap cadence
- Field: `phases[0].actions` and `phases[1].actions`, entry `sandTrap`.
- Script: `first 6, every 10, jitter 3` (P1), `first 4, every 10` (P2).
- Sources: BigWigs `Kurinnaxx.lua` `CDBar(25648, 8)` on engage and after every trap; DBM `Kurinnaxx.lua`
  `NewCDTimer(8, 25656)`, started in `OnCombatStart`. Both are observed cooldowns of 8 s. CDBar means "at least 8".
- Change: P1 `first 8, every 8, jitter 1`; P2 `first 6, every 8, jitter 1`.

### K3 (medium) Mortal Wound does not hit whoever stands in front
- Fields: `roles.melee.description`, expectation `frontClear.tip` in both phases, `actions.wideSlash` context.
- Script: "Wide Slash and Mortal Wound hit whoever is there." The research file's "guides say cleave" is the origin.
- Sources: Wowhead 25646 (https://www.wowhead.com/classic/spell=25646) is a single-target melee debuff (5 yd).
  DBM and BigWigs treat it as a tank-only stack.
- Change: "Wide Slash hits whoever is in his front. Mortal Wound is on the tank only."

### K4 (low) Swap stack count
- Fields: `roles.tank.description`, `actions.swapOut.tip`, `restWindow.first`.
- Script: "third or fourth Mortal Wound".
- Sources: DBM `specWarnWoundTaunt` and BigWigs `amount >= 5` both flag 5 stacks. Guides range 3-6.
- Change (optional): say "around four or five stacks". Leave the cadence as it is, since four stacks at 36.5 s is
  inside the real range.

### K5 (low) Tank has no facing decision
- Field: `boss.stationary`/`turnRate: 0`; `roles.tank.description` "Hold him facing away".
- The engine cannot let the tank mis-face him, so the facing instruction teaches nothing. The note admits this.
- Change: reword to "Stay north of him." Do not list facing as a skill.

---

## General Rajaxx

### R1 (high) Major Yeggeth's shield is immunity to all damage, not physical only
- Fields: `actions.blessingProtection`; `phases[4].expectations.bopHold`; metric `attacksIntoShield`;
  `actions.arrive5.tip`; `roles.melee.description`.
- Script: "Blessing of Protection", `roles: "melee"`, 7 s, "melee stop; casters keep going".
- Sources:
  - Wowhead 25282 (https://www.wowhead.com/classic/spell=25282): **Shield of Rajaxx**, 6 s, Immunity to Arcane, Fire,
    Frost, Holy, Nature, Physical and Shadow ("Immune to all schools").
  - https://warcraft.wiki.gg/wiki/Major_Yeggeth (ability "Shield of Rajaxx", 6 sec).
- This is the opposite of what the sim teaches casters.
- Change:
  - `label: "Shield of Rajaxx"`, `roles: "dps"`, `duration: 6`. Keep `reflectDamage: 0`.
  - `toast: "Shield of Rajaxx: he is immune to everything. Stop attacking."`, and a matching `tip`.
  - `bopHold.role: "dps"`, tip "Nothing can damage him for the 6 seconds. Stop attacking and wait."
  - `attacksIntoShield.roles: "dps"`, tip "Stop for the 6 seconds."
  - Fix `arrive5.tip`, the `notes` line on the 7 s shield, and the sim-facing phase text.

### R2 (high) Captain Xurrem's Shockwave is instant, 20 yd, and stuns
- Fields: `actions.shockwave`; `phases[3].expectations.waveOut`; metric `shockwaveHits`; `phases[3].spots`.
- Script: 2 s cast, radius 13, `moveOut: melee`, "Melee walk out for the cast".
- Sources: Wowhead 25425 (https://www.wowhead.com/classic/spell=25425): Instant; Nature 1313 base; radius 20;
  Stun 2 s (aura "Stunned. 2 seconds remaining"). The script's 2 s "cast" looks like a misread of the 2 s debuff.
  Nothing can be walked out of.
- Change:
  - `shockwave`: `cast: 0`, `radius: 17` (20 minus the 3.5 hitbox), `damage: 1300`, `tankDamage: 1300`, `stun: 2`.
    Delete `moveOut`. Tip: "Instant 20 yd Nature blast that stuns for 2 s. Ranged and healers stand outside 20 yd;
    melee and tank heal through it."
  - Delete expectation `waveOut`. Restrict `shockwaveHits` to `roles: ["ranged","healer"]`, tip "Stand outside 20 yd."
  - `phases[3].spots`: add ranged `rangedXurrem` `{x:6,y:-22}` and healer `healerXurrem` `{x:-4,y:-29}`. Both are
    computed outside 17 yd of the boss's edge (21.9 and 21.1) and within 40 yd of `tank4` (33.3 and 31.3), and both
    are on the floor. The current shared `rangedSpot` (-7,-15) is 7.6 yd from Xurrem's edge (centre 11.1), inside
    even the script's own 13 yd.
  - Update `arrive4.tip`, `roles.melee.description` and `notes`.

### R3 (high) Captain Drenn's Lightning Cloud is a persistent targeted cloud, not a cast around him
- Fields: `actions.lightningCloud`; `phases[2].expectations.cloudOut`; metric `cloudHits`.
- Script: `aoe`, 2.5 s cast, 12 yd around Drenn, `moveOut: melee`. It also includes the healers: `healerSpot` is
  10.8 yd from his edge.
- Sources:
  - Wowhead 26550 (https://www.wowhead.com/classic/spell=26550): Instant, 30 yd range, "Creates a cloud of lightning
    that lasts 15 sec., blasting all enemies in a selected area", 657-843 Nature plus 657-843 every 3 s, radius 10.
  - DBM `NewBuffActiveTimer(15, 26550)`; BigWigs fires `PersonalMessage(..., "aboveyou")` on damage ticks.
  - The engine can do this as a hazard.
- Change:
  - `"lightningCloud": {"label":"Lightning Cloud","kind":"hazard","cast":0,"placement":"random","count":1,"playerChance":0.35,"radius":10,"warning":1,"active":15,"tick":true,"damage":250,"warn":true,"cue":"eruption","icon":"eruption","requires":"grounded","tip":"Drenn drops a 10 yd lightning cloud for 15 s: about 750 on landing and 750 every 3 s. Step out of it."}`
    The tick of 250 per second is 750 per 3 s.
  - Phase 3 cadence: keep `first 11` and use `every 16` so clouds do not chain instantly.
  - `cloudOut.metric: "playerInHazard"`, `role: "nontank"`, label "Walk out of the Lightning Cloud". Delete metric
    `cloudHits`. Fix `arrive3.tip`.

### R4 (high) Rajaxx has a Frenzy at 30%; the script and research omit it
- Fields: `actions` (no frenzy); `phases[7].actions`; `boss` (no `enrageMultiplier`).
- Sources:
  - BigWigs `Rajaxx.lua` option `[8269] = CL.health_percent:format(30)` and handler `FrenzyEnrage`.
  - Wowhead 8269 (https://www.wowhead.com/classic/spell=8269): +60% melee haste, +50 physical damage, 2 min, no
    dispel type.
- Change: add `"frenzy": {"label":"Frenzy","kind":"enrage","cast":0,"warn":true,"cue":"roar","icon":"roar","requires":"grounded","toast":"Frenzy: Rajaxx hits faster until he dies","tip":"At 30% he frenzies: +60% attack speed and +50 per hit. It cannot be dispelled."}`,
  `{"id":"frenzy","first":91}` in `phases[7].actions` (70% of the 130 s clock), and `"enrageMultiplier": 1.6` in `boss`.
  Add the Frenzy line to the healer and tank role descriptions and to `notes`.

### R5 (high) The fear is not avoided by standing behind Qeez
- Fields: `phases[0].expectations.shoutDps`; `actions.intimidatingShout.tip`.
- Script: "Melee: stay behind Qeez for his fear", `check: "notInFront"`.
- Sources: https://warcraft.wiki.gg/wiki/Captain_Qeez: Frightening Shout, "Shouts at nearby enemies causing them to flee in fear for 4.5 sec."
  It is an area effect around him, so facing plays no part. Research file: "short-range AoE fear".
- Change: delete `shoutDps`. `actions.intimidatingShout`: `label: "Frightening Shout"`, `duration: 4.5`, tip
  "A short-range AoE fear. Melee take it; ranged and healers stay out of range; a feared raider runs into the pack."
  Keep `radius: 12`, which is unmeasured. Fix `notes`.

### R6 (high) The "back to the wall" spot is the door gap
- Fields: `positions.rajaxxTank` (0,-24), `positions.rajaxxBoss` (0,-16); `arena.backWall`.
- Geometry:
  - The south wall of `court` has a gap from x=-9 to x=9 (`courtWall` stops at (-9,-32) and (9,-32)), and the
    `entrance` floor runs south from y=-32 to y=-54.
  - `arena.backWall` crosses that gap, so `nearWall` reports "at the wall" at (0,-24), distance 8.
  - A Thundercrash from (0,-16) throws the tank due south 14 yd, to about y=-38, which is still floor (the entrance
    corridor). The tank flies into the corridor with no wall to stop it, and the `wallOk` expectation passes anyway.
  - The arena label already says "Back to this wall for Thundercrash" at (-32,-28), where the wall is solid.
- Change, for phase 8 only:
  - `rajaxxTank` `{x:-26,y:-24}`, `rajaxxBoss` `{x:-26,y:-16}`, `raidSpotP8` `{x:-12,y:-25}`, `rangedRajaxx`
    `{x:-14,y:-26}`, `healerRajaxx` `{x:-4,y:-26}` (22 yd to tank), `offtankRajaxx` `{x:-18,y:-14}`.
    All are computed on the floor.
  - Fix `backWall` so it does not cross the door: `[[-48,-32],[-9,-32]]` and a separate east segment, or stop at -9
    (the polyline may need splitting).

### R7 (high) Attack Order is a 10 s debuff, not 6
- Field: `actions.attackOrder.warning` 6.
- Sources: Wowhead 25471 (https://www.wowhead.com/classic/spell=25471): Dummy aura, 10 s, "Marked for death". DBM and
  BigWigs both start a 10 s target bar.
- Change: `warning: 10`, and say 10 seconds in the tip.

### R8 (low) "the officers are not all" tauntable has no source
- Field: `roles.tank.description` "(... Rajaxx is tauntable, the officers are not all.)"
- Nothing in the research file or this pass supports it either way.
- Change: remove the sentence about the officers. Keep "the Taunt button stands for regaining threat".

### R9 (low) Thundercrash text
- Field: `actions.thundercrash.tip` "Be topped off before it lands"; `roles.healer.description`.
- The real hit is half of current health (min 100; wiki, emulator), so it cannot kill above about 100 HP. The sim's
  flat 3,500 can.
- Change: keep the number (engine limit) but say so in the tip: "Real Thundercrash halves your current HP, so it
  cannot kill you. The danger is the next swing."

### R10 (low) Sweeping Slam damage
- Field: `actions.sweepingSlam.damage` 1400.
- Source: Wowhead 25322: 1750 Physical base, radius 15, Knock Back 250.
- Change: `damage: 2000`, optional. Cone range 16 and the knockback are fine.

---

## Moam

### M1 (medium) "Moam is stone and immune"
- Fields: `phases[1].expectations.killOrder.tip`; role and phase text.
- Sources:
  - Wowhead 25685 (https://www.wowhead.com/classic/spell=25685): Stun, +500 mana per 1 s, Mod Damage Taken -50 (all
    schools). That is not immunity.
  - The Wowhead guide and the wiki say immune. The research file itself says "Everyone else keeps DPSing Moam during
    the stone phase".
- The conflict is not settled. Fiends-first remains the correct priority either way.
- Change: tip "Fiends first: he is stunned and regaining mana, and sources disagree on whether he takes damage."

### M2 (medium) Arena label promises an escape that does not exist
- Fields: `arena.labels` "Run out past here if he will erupt" at (0,-34); `actions.arcaneEruption` (no `radius`).
- Script: Eruption hits the whole room at any distance, so running does nothing. Spell radius is 45 yd (research,
  wotlkdb 25672), and the label spot is 60 yd from him, so it would be a real escape in the actual fight.
- Change: pick one.
  - (a) Remove the label.
  - (b) Add `"radius": 40.5` (45 yd minus 4.5 hitbox) to `arcaneEruption`, so the run-out is real.
  - Recommended: (a). The fight model already scores missed drains; a run-out mechanic has no cue.

### M3 (medium) The mana-user wait is scored on melee
- Fields: `phases[0].expectations.manaWait`, `role: "dps"`.
- Script tip: "Let the tank and melee in first", while the same expectation scores melee.
- Sources: research file (wiki): "Non-mana melee and the tank go in first; mana users enter 2-3 s later."
- Change: `role: "ranged"`, or split with a looser generic `earlyAttacks` for melee.

### M4 (low) Counterspell duration
- Field: `actions.counterspell.duration` 8; tip "for 8 seconds"; metric tip.
- Sources: wiki/Wowhead guide 12 s (research). No source gives 8. Wowhead NPC 15527
  (https://www.wowhead.com/classic/npc=15527) lists only Arcane Explosion under Abilities (1), which is weak evidence
  against Counterspell altogether.
- Change: `duration: 12` and update the tips, unless the shorter lockout is deliberate. If it is, say so in `notes`.

### M5 (low) Trample radius
- Field: `actions.trample.radius` 10, measured from the edge (14.5 yd centre to centre).
- Source: Wowhead 15550: 10 yd radius from the caster.
- Change: `radius: 6` (10 minus 4.5 hitbox rounded up), or leave it and note the 4 yd oversize.

### M6 (low) Eruption knockback
- Field: `actions.arcaneEruption`; `notes` "knock-up not modelled".
- Engine can do this: a `follow` to a `knockback` action with `radial: true` (as Thundercrash does).
- Change (optional): add `"follow":[{"id":"eruptionPush","delay":0}]` and a hidden radial `knockback` of 8 yd. Without
  it, knock-up fall damage is not modelled either.

---

## Buru the Gorger

### B1 (high) Gathering Speed can now be modelled, and is the fight's largest gap
- Fields: `boss.speed` (flat 2.2); `notes`; egg phases `phases[0..5].actions`; `actions.eggBurst1..6`.
- Sources: Wowhead 1834 (https://www.wowhead.com/classic/spell=1834): +25% run speed, stacks, 3 min. Emulators (both
  CMaNGOS and AzerothCore): +25% every 9 s, reset on egg hit.
- Change:
  - Add `"gatheringSpeed": {"label":"Gathering Speed","kind":"transition","cast":0,"bossSpeedMult":1.25,"bossSpeedMultMax":4,"hidden":true,"warn":false,"cue":null,"icon":"roar","requires":"grounded","tip":"+25% run speed every 9 s since the last egg."}`.
    `transition` resolves through the switch's default branch, which is what lets `bossSpeedMult` run on it (sim.js
    line 560).
  - Add `{"id":"gatheringSpeed","first":2,"every":9}` to every egg phase.
  - Add `"bossSpeedMult": 1` (no cap means "sets outright") to each `eggBurst1..6`, so it resets on the burst.
  - Rewrite the `notes` sentence "the engine cannot change mid-fight".
- Tuning caution: the ramp compounds. 2.2 x 1.25^n passes player speed 7 at n=6 (47 s with `first 2, every 9`), close to the guides'
  "catches you about a minute after the last egg". The current 17 s egg phases reset it long before that, so the
  pressure is still absent. Lengthen the egg phases to at least 40 s, or accept that the ramp never bites.

### B2 (high) Dismember can only land in melee now
- Fields: `actions.dismember` (`conditional: "onPlayer"`, `tickDamage: 90`); `actions.dismemberBite`; `notes`;
  `positions.kite1..6`.
- Sources: Wowhead 96 (https://www.wowhead.com/classic/spell=96): 5 yd melee, 1248 every 2 s, 10 s. Format doc:
  `conditional: "tankInMelee"` exists for exactly this.
- Change:
  - `dismember.conditional: "tankInMelee"`. Delete the "no in-melee conditional" sentence from `notes`.
  - Once gated, raise `tickDamage` towards the real 624 per second (1248 per 2 s), to about 400-624 per stack, so being
    caught is lethal, as the research says.
  - Geometry trap: `tankInMelee` reaches 12.5 yd centre to centre for Buru, and the current kite spots are only 10.7-10.8
    yd from the egg. A kiter doing it correctly with him on the egg would be "in melee" and take Dismember. Move each
    kite spot to 16 yd from its egg, along the same bearing: `kite1 (13.4,-38.8)`, `kite2 (40.3,-7.8)`,
    `kite3 (26.9,31)`, `kite4 (-13.4,38.8)`, `kite5 (-40.3,7.8)`, `kite6 (-26.9,-31)`. All are on the floor at radius 41.
    Keep `tolerance: 6`.

### B3 (high) Full Speed on transform
- Fields: `actions.transform`; `notes` "Full Speed movement are not modelled".
- Source: research (wiki, CMaNGOS): Full Speed +300% at transform. Engine: `bossSpeedMult` without a cap sets outright.
- Change: add `"bossSpeedMult": 4` to `actions.transform` (2.2 x 4 = 8.8 yd/s). Remove the "not modelled" note.

### B4 (medium) The raid stands in the pool
- Fields: `positions.raidSpotP1` (0,0), `positions.healerSpot` (0,-2), `positions.ranged1..6` (radius 13),
  `positions.ot1..6` (radius 9.1). The `pool` polygon is radius 18 around the centre.
- Sources: research file (TenTonHammer: never swim in deep water; wiki: priests Levitate over it to keep line of
  sight). The real layout is unmeasured, hence medium.
- Change. Put the egg group and healers on the shore at radius 19:
  - `ranged1 (0,-19)`, `ranged2 (16.5,-9.5)`, `ranged3 (16.5,9.5)`, `ranged4 (0,19)`, `ranged5 (-16.5,9.5)`,
    `ranged6 (-16.5,-9.5)`. Each is 11 yd from its egg, so outside the 10 yd burst ring.
  - Off-tank: `ot1 (8.9,-19)`, `ot2 (20.9,-1.8)`, `ot3 (12.1,17.2)`, `ot4 (-8.9,19)`, `ot5 (-20.9,1.8)`, `ot6 (-12.1,-17.2)`.
  - Healers need a per-phase spot to stay in range of the kiter (at radius 19 they are 23.9 yd from the new kite
    spots). Add `healer1..6` using the same coordinates as `ranged1..6`, and set `spots.healer` per phase.
  - Change the raid-anchor label "Raid in the middle" to match.

### B5 (low) Egg burst tip versus ring
- Field: `actions.eggBurstN.tip` "100-500 to anyone within 25 yards"; `radius: 10`.
- The ring (10) and the tip (25) disagree.
- Change: tip "A ring on the egg: about 400 up close, falling off with distance."

### B6 (low) Creeping Plague
- Field: `actions.creepingPlague.tip` "ramping raid-wide poison"; `dispel: none`.
- Sources: Wowhead 20512 (https://www.wowhead.com/classic/spell=20512): Nature, 70 every 2 s, 20 s, 100 yd, no dispel
  type. Note that 70 is on the Classic page too, not only in 3.3.5a data. The guides' 80 is not on the spell page.
- Change: tip "A ramping raid-wide Nature debuff. It cannot be dispelled."

### B7 (low) Egg tolerance
- Field: `positions.egg1..6.tolerance` 11.
- The expectation "Run past the egg so he has to walk over it" passes with Buru 11 yd away, outside the 10 yd ring.
- Change: `tolerance: 8`.

---

## Ayamiss the Hunter

### A1 (high) She can be shot in the air now
- Fields: `boss` (no `attackableInAir`); `notes` "She cannot be hit in the air"; `positions.rangedSpot`.
- Sources: format doc; research file (real ranged DPS her in the air).
- Change:
  - Add `"attackableInAir": true` to `boss`, and rewrite the `notes` sentence.
  - Move `rangedSpot` from (-8,-12) to (-8,-9). The current spot is 31.9 yd from her edge, 1.9 yd outside the 30 yd
    `attackRange`. The new one is 29.0.
  - Limitation: `attackableInAir` has no role filter, so a melee player standing directly under her could also hit
    her. `altarBase` at 7 yd from her edge keeps them out of 5 yd range; leave it.

### A2 (medium) The Poison Stinger answer is a walk the real fight does not have
- Fields: `actions.poisonStingerYou` (`shelterAt`, `safeSpots`) and tip; `arena.labels` "Back row: drop threat here";
  `roles.ranged.description`; `phases[0].expectations.stingerStacks` tip.
- Script: "At six stacks walk to the back row and let them fall."
- Sources: research file (Poison Stinger goes to the top-threat target; TenTonHammer: alternate 100%/50% DPS for 10 s;
  wiki keep stacks under 20). Walking away does nothing to threat.
- Change: keep the `shelterAt` mechanic (no threat-driven retargeting exists), but make the text true: "At six stacks,
  stop attacking to drop off top threat. In the sim, the walk to the back row stands for that." Reword the arena
  label to "Back row: the sim's threat-drop spot".

### A3 (low) Poison Stinger cast and hit
- Field: `actions.poisonStingerTank` and `poisonStingerYou`, `cast: 0`, no direct damage.
- Source: Wowhead 25748 (https://www.wowhead.com/classic/spell=25748): 2 s cast, 875 Nature on hit, 25 per second for
  10 s. Guides describe only the 25/s ticking.
- Change: optional. Add the hit damage only if a source confirms it matters; otherwise note the 2 s cast in `notes`.

---

## Ossirian the Unscarred

### O1 (high) The script teaches a routine Strength lapse between crystals
- Fields: `phases[1,3,5,7,9]` ("To Crystal k: Strength is back. Walk him!"); `actions.strength` in those phases;
  `roles.tank.description`; `drills[kiteDrill].description`; expectations `walkN`, `onCrystalN`.
- Script: every window ends with 6.5 s of Strength and the tank running ahead of him.
- Sources: research file timeline and wiki: start the click with 10-15 s left so the next Weakness lands before the
  current one expires; "Never let the Weakness expire with him in melee of anyone"; Wowhead guide: he moves to the next
  crystal 15-20 s into the window. A lapse is the failure case, not the rhythm.
- Change. Re-cut into 45 s windows with the walk inside the Weakness:
  - For k=1..5: `Crystal k: hold` (27 s) with the current spots, then `Crystal k: walk to k+1` (18 s) with `spots` of
    crystal k+1, no Strength, and expectation `bossAtSpot crystal(k+1) within 18`. Window 6: 45 s hold.
  - Delete `strength` from the rotation. Keep the action for a drill such as `"lapseDrill": "You let the window lapse:
    Strength is back, stay out of his melee until the next Weakness."`
  - Weakness casts, Winds, Stomp and Curse schedule inside the hold and walk phases. Set `hpFrom`/`hpTo` proportional
    to duration.
  - Set `raid.holdAfterPull: 45` (Wowhead: no DPS in the first window).
  - Rewrite `roles.tank.description`: "Walk him to the next crystal while the Weakness is up. If a window ever lapses,
    he hits for 10,000+ under Strength."

### O2 (high) Healers and ranged stand inside War Stomp
- Fields: `positions.healerK2..6`, `rangedK2..6`; `phases[*].spots`.
- Script: healers 5.7-11.2 yd from his edge, ranged 17.0, inside the 20 yd `knockbackRange` (measured from the edge).
- Sources: Wowhead 25188 (https://www.wowhead.com/classic/spell=25188): radius 20, knockback 150, 2188 Physical. Research
  file: healers stay out of melee range (20 yd).
- Change (computed on the floor; attack range and 40 yd to the tank hold):
  - `rangedK2 (0,1)`, `rangedK3 (0.9,0.3)`, `rangedK4 (0.6,-0.9)`, `rangedK5 (-0.6,-0.9)`, `rangedK6 (-0.9,0.3)`, each 22.0 yd from the edge.
  - `healerK2 (6,0)`, `healerK3 (1.9,-5.7)`, `healerK4 (-4.8,-3.6)`, `healerK5 (-4.9,3.5)`, `healerK6 (1.9,5.7)`, each
    about 23.6 yd from the edge and 32-37 yd from the tank.
  - Leave `raidK2..6` as they are. The note explains the anchor must stay close because of the `windsSwitch`, so
    moving it makes him walk on the raid dots.

### O3 (medium) Stomp expectation is unachievable as written
- Fields: `phases[*].expectations.stompHealN` label "Melee: bandage after every War Stomp"; metric `stompsTaken`.
- No bandage button exists, and the metric scores being in the 20 yd stomp. A melee at 5 yd attack range cannot avoid
  it without leaving.
- Change: set `stompsTaken.info: true`, or rename to "Melee: step out of 20 yd before the stomp if you are low" and
  score only `severe` cases. Drop "bandage".

### O4 (medium) Sand Vortex size and missing Silence
- Fields: `actions.vortexA*/B*` (`radius: 7`, `damage: 1500`, no `applies`).
- Sources: research (wotlkdb 25161 Harsh Winds): 1961-2039 per second in 10 yd, -85% run speed and Silence in 5 yd.
  Format doc: `applies` plus `damage` on a hazard.
- Change: `radius: 10`. Add `"applies": "harshWinds"` and a hidden `debuff` with `target: "player"`,
  `forbidAbilities: true` for healer/ranged, `duration: 3`, `breakMetric: "castInVortex"`, so being caught costs casts,
  as Silence does. The aggro loss and run-speed slow remain engine gaps.

### O5 (low) Curse of Tongues cadence
- Field: phases `curseOfTongues` entries (`first: 6, every: 22, jitter: 3`).
- Source: DBM `Ossirian.lua`: `NewVarTimer("v21-43.7")`, first `v17.8-50.2`. Emulators' 20-30 s is too tight.
- Change: in the 45 s re-cut, `first: 18, every: 30, jitter: 8`.

### O6 (low) One waypoint is off the floor
- Field: `positions.vortexA5` (-22.9,-32.8) is south of the wall at y=-32.
- Change: `y: -31`.

---

## Research file errors

- `general-rajaxx.md` "Frenzy... no live source gives a threshold": BigWigs Rajaxx puts it at 30% (R4).
- `general-rajaxx.md` "Major Yeggeth: (Improved) Blessing of Protection, physical immunity 5 s / 10 s": the spell is
  Shield of Rajaxx, 6 s, all schools (R1).
- `general-rajaxx.md` Xurrem Shockwave "reduces movement speed to 1% for 2 s": spell data is instant, 20 yd, 2 s stun.
  It also has Nature damage 1313 base (R2).
- `general-rajaxx.md` Drenn "Hurricane / Lightning Cloud, channelled AoE around himself": it is a targeted, persistent
  15 s area, 10 yd radius (R3).
- `kurinnaxx.md` "Mortal Wound... applied via his cleave/front arc, so anyone in front can get it": the spell is single
  target (K3). Also "Sand Trap... 5-15 s" should give the observed 8 s CD (K2).
- `ayamiss.md` Open question "Frenzy at 20% appears only in emulators and Millenium": BigWigs confirms 20% (spell 8269).
- `moam.md`: Mana Fiend HP "single-source" is confirmed by Wowhead 15527: 14,652 (20 Player).
- `ossirian.md`: cadences for Curse of Tongues are emulator values; DBM's observed window is wider (O5).

## Engine limitations no script change can fix

- `aoe` and hazard damage are flat. Thundercrash's half-of-current-health is not expressible.
- `forbidAbilities` scores every press rather than blocking by school, so a true Silence (spells only) or disarm cannot be separated from melee or
  wands.
- A hazard cannot slow a player (Harsh Winds -85% run speed).
- Adds cannot damage players or fixate. Attack Order, swarms, Hatchlings and Larva race remain approximations.
- Bosses cannot retarget by threat for an arbitrary aura. Poison Stinger's top-threat rule is not representable.
- `shield` applies to the boss only, so Thorns (200 per hit on Buru) cannot punish attacks without also blocking attacks
  on eggs and adds.
- No action can teleport a non-tank player (Paralyze's teleport to the altar). `teleportTankTo` is the tank only, and
  the Larva cannot be linked to the Paralyzed player's death.
- Crystal click, Weakness school and the spotter/clicker roles have no representation. Damage is not split by school.
- `attackableInAir` has no role filter (A1).
- Cones are centred on the boss; "front" of a boss with `turnRate: 0` cannot be mis-faced (K5).

## Could not verify

- Whether Moam is immune or merely reduced while stoned (spell data says -50 damage taken; guides say immune). See M1.
- Mortal Wound duration: Wowhead Classic's spell page shows 30 s, while BigWigs and DBM both run a 15 s target bar and
  the wiki matches. Kept 15 s.
- Captain Qeez's exact spell ID and fear radius (the wiki gives duration only; spell 19134 on Wowhead is the warrior
  Intimidating Shout and may be a different spell).
- Real room layouts (no map or coordinates): pool depth, altar side and crystal positions remain estimates.
- Poison Stinger's 875 direct hit in practice (A3).
