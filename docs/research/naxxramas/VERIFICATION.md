# Naxxramas encounter scripts: independent verification

Checker's report on `data/encounters/naxxramas/*.json` against `docs/ENCOUNTER_FORMAT.md`, the research files in this folder, and a second source pass. Only disagreements, gaps and misleading modelling are listed. Anything a script already discloses in its `notes` and that cannot be improved is left out, except where the engine limits section needs it.

Sources are cited by URL once per finding. Emulator scripts (cmangos) are reconstructions and are labelled as such. Most cmangos Naxx bosses now keep their spell timers in the database, so `boss_*.cpp` only settled cadences for Noth, Heigan, Gluth, Sapphiron and Patchwerk. DBM-Vanilla is the log-derived timer source. Warcraft Logs and Icy Veins were not reachable, as in the original research.

Geometry was computed from the JSON. Two engine facts matter throughout (`src/core/sim.js`):
- `aoe` radius is measured from the boss's edge (`bossRangeTo`), so a `radius` of 30 on a boss with `boss.radius` 5 reaches 35 yd from her centre.
- `safeSpots` cover (`sheltered()`) is a plain distance check to the named spot. It has no notion of direction.

Each item: **field path**, script value, what the sources or geometry say, confidence, exact change. Confidence is about the fact, not the importance.

## Coverage and limits of this check

- **Reviewed closely (script and research):** Anub'Rekhan, Faerlina, Maexxna, Noth, Heigan, Loatheb, Razuvious, Gothik, Four Horsemen, Thaddius, Sapphiron.
- **Lighter review:** Patchwerk, Grobbulus, Gluth, Kel'Thuzad. I read their notes, positions, roles, action definitions, phase schedules and the research Abilities sections, and ran the geometry checks, but not every expectation or the full research text. Their short sections mean fewer problems were found, not that none exist.
- **Recommended changes are untested.** Scripts were not edited and `node tools/validate.mjs` was not run on any proposal. Run it after applying each one, especially H1, T2, S1 and S2, which change timing or geometry that the scripted bot depends on.
- **Fetches:** about 38 (GitHub listings, 15 cmangos scripts, 15 DBM modules, 4 Wowhead spell pages and 2 Razuvious pages through the reader proxy).

## Anub'Rekhan (`anubrekhan.json`)

### A1. Healer's kite spot is wrong for the northbound swarm (high)
- **Field:** `phases[3].spots.healer` = `healerKite` (phase id 4, "Locust Swarm"), and the expectation `swarmHeal4` (`spot: healerKite`).
- **Script:** `positions.healerKite` is `(-32, -40)`. It was placed for the southbound kite (phases 2 and 6). Phase 4 runs the other way: the boss starts at `bossSouth (0, -45)` and the tank runs to `tankSpot (0, 52)`.
- **Geometry:** the healer at `healerKite` stands 32.4 yd from the boss at the start of phase 4, inside the swarm's effective 35 yd. At the modelled 3 yd/s walk she does not clear it until about 9.6 s in, so the ticks at 5.2, 7.2 and 9.2 s all land. The spot is also 97.4 yd from the tank in phase 4, against 34.2 yd in phases 2 and 6. The label "stay out of 30 yards and in range of the far alcove" is false in this phase, and a healer following the marker cannot heal the kite at all.
- **Change:** add `positions.healerKiteN = {"x": -32, "y": 40, "tolerance": 8, "label": "Healers: follow the kite"}`. Set `phases[3].spots.healer` to `healerKiteN` and `swarmHeal4.spot` to `healerKiteN`. Check: the boss ends the phase near (0, 15), 40.6 yd away, and the spot is 34.2 yd from the tank at `tankSpot`.

### A2. Healer spot contradicts the role's rule (medium)
- **Field:** `positions.healerSpot` = `(10, 18)`, `positions.healerSouth` = `(10, -18)`, tips "Far enough back that an Impale line through you is rare, and more than 30 yards from her when the tail goes up", `roles.healer.description` "Stay at maximum range".
- **Geometry and sources:** both spots are 28.8 yd from the boss centre, 6.2 yd inside the swarm's effective 35. Healers must run every swarm. Research (wiki, Wowhead guide): healers stay more than 30 yd from the boss at all times, behind the tank's line. https://warcraft.wiki.gg/wiki/Anub%27Rekhan_(Classic)
- **Change:** `healerSpot` to `(-35, 35)` and `healerSouth` to `(-35, -35)`, keeping tolerance 9. Check at the north gate: 36.4 yd from the boss, 38.9 yd from `tankSpot`, on the floor, 21 yd clear of the nearest Impale lane. The run to `healerKite` or `healerKiteN` is 75 yd (10.7 s), inside the 23 s phase.

### A3. Pronouns (high, low impact)
- **Field:** `roles.*.description`, `actions.*.tip`, expectation `tip` and `label` throughout ("her", "she", "Run her").
- **Sources:** Anub'Rekhan is male, and the research file itself says "lifts his tail". https://warcraft.wiki.gg/wiki/Anub%27Rekhan_(Classic)
- **Change:** replace with he/him across the script (the wording was inherited from the Onyxia script).

### A4. "Step aside" teaches a skill no source describes (low)
- **Field:** expectations `dodgeLane*` label "Step aside when you see Impale", `notes` "stepping aside is the real lesson".
- **Sources:** every source only says do not stand in a line with the boss and another player, a spread rule applied in advance (wiki, Wowhead guide). Impale has a 1 s cast (https://www.wowhead.com/classic/spell=28783). No source says the spikes can be sidestepped after the cast starts.
- **Change:** keep the hazard, reword the label to "Stay out of line with her and the raid" and drop "stepping aside is the real lesson" from `notes`.

## Grand Widow Faerlina (`faerlina.json`)

### F1. Volley rate does not match its own tip (low)
- **Field:** `actions.poisonBolt.playerChance` = 0.33. Tip says "about a quarter of the raid", and `notes` say about 10 of 40.
- **Change:** set 0.25, or change the tip to "about a third" if the extra load is intended.

### F2. One healer does two classes' jobs (low)
- **Field:** `roles.healer.description` "You are also the Priest on Mind Control" with `dispels: ["poison", "enrage"]`.
- **Sources:** poison is cleansed by Druid, Shaman or Paladin, and Mind Control is a Priest spell, so no real healer does both (research, Wowhead guide). `dispel` is the only channel the engine has, so this is a wording fix.
- **Change:** say "Your button also stands in for the raid's Priests sacrificing a Worshipper" instead of "You are also the Priest".

## Maexxna (`maexxna.json`)

### M1. Cocoons can now be the ranged job only (high, approximation the engine can now do)
- **Field:** `actions.cocoons` has `killFirst: true` and no `killFirstRoles`. `notes` call this "the biggest misrepresentation here". `roles.melee.description` "Every Spider wave and cocoon comes first". Expectations `cocoon1` and `cocoon2` have `role: dps`. `drills[cocoonDrill].roles` is `dps`.
- **Format:** `adds` now accept `killFirstRoles` (format doc, `src/core/entities.js:372`). Real assignment is ranged only (wiki, Wowhead guide, Warcraft Tavern, per the research).
- **Change:** add `"killFirstRoles": "ranged"` to `actions.cocoons`. Remove the sentence about the engine in `notes`. Melee description: "Stand behind her and hit her. Spiderlings come first; the cocoons are the ranged team's job". Set `cocoon1`/`cocoon2` to `role: ranged` with label "Kill the cocoons first". Add a melee expectation on `attacksOffPriority` for spiderlings only, with label "Spiderlings first". Set `cocoonDrill.roles` to `ranged`, and move melee to `spiderDrill`.

### M2. Web Spray stun is 10 s in the spell data (medium)
- **Field:** `actions.webSpray.stun` = 8, and tips and `roles.*.description` "eight seconds".
- **Sources:** spell data: duration 10 seconds, tooltip "Stunned. 10 seconds remaining". https://www.wowhead.com/classic/spell=29484 The research flagged this as open. The 8 s figure comes from guide text only.
- **Change:** set `stun` to 10 and update the "eight seconds" wording in `roles.tank`, `roles.healer`, the `webSpray` tip and the `healSpray` cue. Re-check `tankDamage` so a topped tank survives 10 s of swings without the healer. Confidence is medium because no combat log was reachable to confirm the applied duration.

## Noth the Plaguebringer (`noth.json`)

### N1. Cripple only lands on the tank (low)
- **Field:** `actions.cripple.target` = `tank`.
- **Sources:** Cripple hits everyone within 20 yd of where he was (research, spell 29212), so melee beside him are crippled too.
- **Change:** none needed for scoring. If kept, say "Cripple hits everyone near him; here only the tank's is modelled" in `notes`.

### N2. Healer dispels two classes' schools (low)
- **Field:** `roles.healer.dispels` `["curse", "magic"]`, description "Decurse every Curse... and dispel Cripple".
- **Sources:** Druids and Mages decurse, Priests and Paladins dispel magic (research). No single class does both, same point as F2.
- **Change:** reword to "Your button stands for both your Druids (Curse) and your Priests (Cripple)".

## Heigan the Unclean (`heigan.json`)

The dance works and is forced. A 0.5 yd grid over the whole floor found no point that every eruption misses except on the platform, and every one of those platform points is inside the Plague Cloud. The 1-2-3-4-3-2-1 order, the 10 s cadence and the first-eruption times match DBM. The 90 s and 45 s phase lengths also match cmangos (emulator). Two corrections:

### H1. Safe lanes are much narrower than the notes say (medium)
- **Field:** `actions.slowN` and `actions.fastN`, `radius` 9.4. `notes`: "radius 9.4, a hair over the strip".
- **Geometry:** a 9.4 yd circle on a 12 yd strip spills 3.4 yd into each neighbour at mid-height. When an inner section is the safe one, the safe lane is 5.2 yd wide at mid-floor (`x` from -8.6 to -3.4 for section 2), against the 12 yd the drawing and zone labels imply. Edge sections keep 8.6 yd. A player standing in the outer half of the section the script names as safe is hit.
- **Change:** correct the `notes` claim. If a wider lane is wanted, use `radius` 7 with two circles per section at `y` 3.5 and 10.5 (coverage verified, spill 1 yd per side, safe inner lane 10 yd). That adds eight positions (`zone1a`...`zone4b`) and doubles each `spots` list. `placement: polys` would give exact rectangles, but `pulseCracks` looks like it pulses a whole set, so per-eruption subsets are unverified.

### H2. Platform south lip is inside the floor eruption (low)
- **Field:** `positions.platR` and `positions.platH`, tolerance 8; `roles.ranged.description` "the floor cannot reach you".
- **Geometry:** the zone circles reach `y` 16.4 and the platform starts at `y` 13. With tolerance 8 from `y` 22, a caster can stand at `y` 14 and be hit by an eruption while on her spot.
- **Change:** set both `y` to 24 and `tolerance` to 5 (minimum `y` 19).

## Loatheb (`loatheb.json`)

### L1. Notes disagree with the numbers (high, low impact)
- **Field:** `notes` "`healPerSecondWithPlayerHealer` 430" against `ghostTank.healPerSecondWithPlayerHealer` 380, and `notes` "1,500 on the ghost tank" against `actions.doomHit.tankDamage` 1000.
- **Change:** correct `notes` to 380 and 1,000, or set the fields to 430 and 1,500 if those were intended, then re-run the validator.

### L2. "Back wall" is not in the sources (low)
- **Field:** `positions.tankSpot.label` "Tank: back to the wall", expectation `pull` "Hold him at the back wall", tip "so he cannot wander toward the spores".
- **Sources:** research says hold him in place near the entrance side and never move him toward the spore side. No source names a back wall. `tankSpot (0, 25)` is also 13 yd from the wall at `y` 38.
- **Change:** label "Tank: hold him here", expectation "Hold him in place, away from the spores".

### L3. Tank role has no decision (low, category 4)
- **Field:** `roles.tank`. Only `stayOn*` (`onTank`) and the pull are scored, and the description admits "There is nothing to Taunt".
- **Change:** add a `threatLead` `afterEvent` on the first `poisonAura` to score the first-30-s threat lead the description asks for.

## Instructor Razuvious (`razuvious.json`)

### R1. Disrupting Shout's stun is not in the spell data (low)
- **Field:** `actions.disruptingShout.stun` = 3, `notes` "duration a guess".
- **Sources:** the spell lists a single effect, Power Burn, radius 45 yd, duration n/a. https://www.wowhead.com/classic/spell=29107 The wiki and the Wowhead guide text both say it also stuns (https://warcraft.wiki.gg/wiki/Instructor_Razuvious_(Classic)). The stun may be a separate triggered effect not shown on this page.
- **Change:** keep the stun and note in `notes` that it is sourced from guide text only. Do not raise its length.

## Gothik the Harvester (`gothik.json`)

### G1. Boss start is off the floor (high, low impact)
- **Field:** `positions.bossStart` = `(0, 30)`.
- **Geometry:** `x = 0` at `y = 30` is outside `living`, `undead` and `gate`. Harmless while he is submerged in phase 1, but it is a dead point on the map.
- **Change:** `(0, 2)` (on the gate strip).

## The Four Horsemen (`four-horsemen.json`)

### FH1. Safe-centre label overstates the geometry (low)
- **Field:** `positions.safeCenter.label` "Safe spot: out of every Mark".
- **Geometry:** every Horseman is 53.7 yd from the centre, well inside the Marks' 65 yd plus edge. The spot is safe only through `safeSpots`. The real safe spot is a small area in front of the platform (Wowhead guide, per the research), not the room's centre.
- **Change:** label "Safe spot (stands for the area in front of the platform)".

## Patchwerk (`patchwerk.json`)

Lighter review (see Coverage). No disagreements found beyond what `notes` disclose. The 5% Enrage and 7:00 Berserk match cmangos (emulator), and the Hateful Strike rule matches the research.

## Grobbulus (`grobbulus.json`)

Lighter review (see Coverage). No factual disagreements found. Cloud cadence matches DBM (14.5 to 16.6 s, script 15 s). I could not verify the Slime Spray cone range of 22 yd: research gives only a spell range of 45 yd. Injection cleanse behaviour is disclosed as an engine gap.

## Gluth (`gluth.json`)

Lighter review (see Coverage). No disagreements found beyond the disclosed Decimate scaling. Decimate cadence (105 s) matches cmangos and the wiki.

## Thaddius (`thaddius.json`)

Checked: a wrong-side player pays. `shockPos`/`shockNeg` hit for 1,800 every 5 s and score `wrongSide`, and the two camps (15 yd around `(±16, 18)`) do not overlap, so no spot satisfies both. Healer reach holds on either side (31.8 yd worst case).

### T1. Static Field can now be limited to mana users (high, approximation the engine can now do)
- **Field:** `actions.staticField` has no `roles`. `notes`: "hits everyone inside its radius, including melee who in the real fight have no mana to burn, a small inaccuracy".
- **Format and sources:** `aoe` now accepts `roles` (format doc, `sim.js:496`). Real Static Field burns mana and deals damage equal to the mana burned, so a rage or energy user takes nothing (research, wiki). The `staticHits` metric already limits to `["ranged","healer"]`.
- **Change:** add `"roles": ["ranged", "healer"]` to `actions.staticField`, and delete the "small inaccuracy" sentence. The ghost still takes `tankDamage` 200 through `damageGhost`, so set `tankDamage` to 0 if the ghost tank is not meant to be burned.

### T2. The marker announces your charge before you have it (medium)
- **Field:** `phases[8..16]` (`Polarity Shift 2` to `10`), `spots.*` plus `actions` `shiftNeg@1` / `shiftPos@1`.
- **Geometry and timing:** the phase's `spots` change at phase time 0, but the charge only lands when the 3 s cast ends at phase time 4. The marker and expectations name the new side 4 s before the charge exists, so a player following the marker never has to read the debuff. The role text says "Check it every shift".
- **Change:** move each shift to the end of the previous phase so the 3 s cast ends on the boundary (`first: 27` in a 30 s phase, `first: 38` in the 41 s phase 8), and set `shock*` to `first: 5, every: 5` in the phases that now start with a fresh charge. The first shift, `shiftNeg@11` in phase 8, stays where it is. This makes the marker and the charge change together and keeps the real 5 s grace.

## Sapphiron (`sapphiron.json`)

### S1. Air spots stand in the Icebolt splash zones (high)
- **Field:** `positions.rangedAir` `(22, -8)`, `positions.healerAir` `(-24, 6)`, `positions.meleeAir` `(8, -22)`, `positions.pickupSpot` `(-2, 28)`, used by `phases[*].spots` in the air phases. Each `iceboltN_M` is a 10 yd hazard at `blockN_M`.
- **Geometry (distance to nearest block):**

| Spot | Set 1 | Set 2 | Set 3 | Set 4 |
|---|---|---|---|---|
| rangedAir | 13.4 | **1.5** | **9.0** | **6.0** |
| healerAir | **7.8** | **7.3** | **0.4** | 14.7 |
| meleeAir | **3.5** | 12.2 | 11.0 | **4.7** |
| pickupSpot | **6.6** | **9.6** | **2.6** | 14.1 |

  Bold means inside the 10 yd splash. A player who stands where the script tells them to is hit in two or three of the four air phases, depending on role, by a mechanic whose tip says to spread out of it.
- **Change:** `rangedAir` to `(33.8, -10.1)` (clear of every block by 12.6, 28 yd from his edge at the hover point, so still in range). `healerAir` to `(-34, 10)` (11.1 clear, which is only 0.3 yd more than the splash plus the player radius, 36.7 yd to `pickupSpot`, so heals still reach the tank). `meleeAir` to `(9, -33)` (12.6 clear). For the tank, add per-phase `spots.tank` or mention in the tip that Icebolt can land on `pickupSpot`.

### S2. Ice-block cover accepts any side of the block (medium for the geometry, high that the real rule differs)
- **Field:** `actions.frostBreathN.safeSpots` = `blockN_M`, `safeRadius` 6.5.
- **Geometry:** `sheltered()` is a radius check. A player standing on the side of a block that faces the room centre, in full sight of the falling bomb, counts as covered. Real rule: stand directly behind the block relative to the impact point (wiki; research).
- **Change:** add a cover spot behind each block, `block + 3 yd` radially away from `hoverIdle (0, 6)`, and make `safeSpots` name those with `safeRadius` 3.5. That accepts the area from about 0.5 yd in front of the block to 6.5 yd behind it and 3.5 yd to each side, and rejects the side facing the bomb. Keep the `iceBlockN_M` hazards at the block itself. Coordinates:

| Block | Cover | Block | Cover |
|---|---|---|---|
| block1_1 | (26.8, 5.2) | block3_1 | (24.5, 13.4) |
| block1_2 | (4.8, 28.5) | block3_2 | (-3.8, 28.8) |
| block1_3 | (-24.0, 14.3) | block3_3 | (-26.6, 6.2) |
| block1_4 | (-19.2, -17.0) | block3_4 | (-12.5, -21.9) |
| block1_5 | (11.6, -22.4) | block3_5 | (18.6, -17.7) |
| block2_1 | (19.7, 20.5) | block4_1 | (12.9, 25.7) |
| block2_2 | (-12.0, 26.2) | block4_2 | (-19.0, 21.2) |
| block2_3 | (-26.7, -2.2) | block4_3 | (-24.1, -10.2) |
| block2_4 | (-4.7, -24.6) | block4_4 | (3.7, -24.8) |
| block2_5 | (23.6, -11.1) | block4_5 | (26.4, -3.2) |

  All are on the floor. Timing holds: the last block appears at 15.2 s and the breath lands at 23 s.

### S3. Frost Aura rate is still unresolved (low)
- **Field:** `actions.frostAura` 300 per 2 s, from the wiki's 600 per 2 s halved.
- **Sources:** spell data reads "Deals 600 frost damage a second", periodic dummy 601 every 1 second. https://www.wowhead.com/classic/spell=28531 The wiki and the guide say every 2 s. Unresolved here too. Note it in `notes` so a later log check can settle the scaling.

## Kel'Thuzad (`kelthuzad.json`)

### K1. DBM's variable timer belongs to the Volley, not to Frostbolt (medium)
- **Field:** `actions.volley` `every: 15`, `actions.frostbolt` `every: 24`, and the note "DBM 15.7 to 63.1 s" attached to Frostbolt.
- **Sources:** in `DBM-Raids-Vanilla/VanillaNaxx/FrostwyrmLair/Kel'Thuzad.lua`, `timerFrostboltCD` ("v15.7-63.1", spell 28479) is restarted on `SPELL_CAST_SUCCESS` of **28479**, which is the Frostbolt Volley. Single-target 28478 only gets a cast timer. So the log-derived variable cadence applies to the Volley, and no timer exists for the single-target Frostbolt. https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/FrostwyrmLair/Kel'Thuzad.lua
- **Change:** correct `notes` so the 15.7 to 63.1 s range is attributed to the Volley. Either give `volley` DBM's variability (for example `every: 24, jitter: 8`, which gives 16 to 32 s, inside DBM's range) or keep 15 s and say that it follows the guides against DBM. The guides and DBM really do disagree here, which is why this is medium. Mark Frostbolt's 24 s as an estimate with no timer source.

## What the research files got wrong

- **faerlina.md**, Open questions: "DBM restarts the full enrage timer on any Embrace application". The Lua does `timerEnrageCD:Stop()` and only restarts it `if self.vb.enraged`. An early Embrace stops the bar and does not restart it. https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/ArachnidQuarter/Faerlina.lua
- **kelthuzad.md**, Frostbolt: the "variable 15.7 to 63.1 s" cadence belongs to the Volley (K1 above). The Volley section lists only "observed every ~15 s".
- **maexxna.md** leaves Web Spray's duration open. Spell data supports 10 s (M2).

## Engine limitations no script change can fix

- **No Silence or Pacify** (Anub'Rekhan's Locust Swarm). `stun` roots, which is the opposite of what the swarm should do.
- **No add abilities or on-death triggers:** Crypt Guard Web and Cleave, Follower Silence, corpse scarabs tied to a death, Fungal Bloom from a killed Spore.
- **Add-against-add priority cannot be scored:** Gothik's Rider > Deathknight > Trainee kill order.
- **No mana resource:** Mana Burn, Disrupting Shout and Static Field damage cannot depend on current mana.
- **No per-phase boss pin:** Heigan is `submerged` during the dance, so ranged cannot practise hitting him while he channels.
- **One boss entity:** Thaddius phase 1 cannot model two wights, Tesla coils or the 5 s kill window. Horsemen are one entity teleporting.
- **No moving or growing hazards and no slow:** Chill's roam and slow, Grobbulus's growing cloud.
- **No line-of-sight or facing test in cover:** S2 is the closest available approximation.
- **Only one healer target and no personal consumables:** Loatheb's bandages and potions, Patchwerk's three off-tanks.

## Second pass: Patchwerk, Grobbulus, Gluth, Kel'Thuzad

A closer read of the four bosses the first pass marked as lighter review. It does not repeat K1 (Volley and Frostbolt timers), which still stands. Each item gives the field path, the script's value, what the sources say, confidence, and the change.

**Sources.** About 38 fetches. Each URL is cited once here and by short name below.
- DBM: https://github.com/DeadlyBossMods/DBM-Vanilla/tree/master/DBM-Raids-Vanilla/VanillaNaxx (`ConstructQuarter/Patchwerk.lua`, `Grobbulus.lua`, `Gluth.lua`, `FrostwyrmLair/Kel'Thuzad.lua`)
- BigWigs: https://github.com/BigWigsMods/BigWigs_Classic/tree/master/Naxxramas_Classic
- cmangos (emulator reconstruction): https://github.com/cmangos/mangos-classic/tree/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas
- TrinityCore (WotLK emulator reconstruction): https://github.com/TrinityCore/TrinityCore/blob/3.3.5/src/server/scripts/Northrend/Naxxramas/boss_grobbulus.cpp
- Warcraft Wiki: https://warcraft.wiki.gg/wiki/Patchwerk_(Classic), `/Grobbulus_(Classic)`, `/Gluth_(Classic)`, `/Kel%27Thuzad_(Classic)`
- Wowhead guides, through the reader proxy: https://www.wowhead.com/classic/guide/patchwerk-naxxramas-raid-strategy, `/grobbulus-...`, `/gluth-...`, `/kelthuzad-...`
- Warcraft Tavern: https://www.warcrafttavern.com/wow-classic/guides/naxxramas/
- Spell data: https://www.wowhead.com/classic/spell=NNNN

**Testing.** Scripts were not edited. Every change marked "tested" was applied to a scratch copy of the project and passed `node tools/validate.mjs` for that boss, every role and drill. Bot scores below come from that copy. Changes not marked "tested" are wording only, or are flagged as unverified.

### Patchwerk (`patchwerk.json`)

Checked and correct: Berserk at 7:00 (DBM and BigWigs 420 s, cmangos 7 min), Enrage below 5% (cmangos, spell 28131), and the 3.6 s per off-tank cadence (the wiki's reactive scheme: 1.2 s across three off-tanks). Slime Bolt arrives only after Berserk (cmangos switches to its Berserk spell list; wiki 7:30), so it is correct that it is not cast at 5%. All spots are on the floor and every healer and ranged spot reaches its target (healer 33.3 yd at worst, ranged 24.1 yd from his edge).

#### PW1. An off-tank who leaves melee is still struck and is barely scored (high)
- **Field:** `actions.hatefulStrikeOt` (`target: "player"`, no range condition); `phases[0].expectations[otMelee]` and `phases[1].expectations[otMelee2]` (`event: "meleeCheck"`), with `meleeCheck` at `every: 20`; `roles.offtank.description` "If you step out of melee, the next one lands on a rogue"; `drills[strikeDrill].description` "Walk out of melee to feel what happens".
- **Script:** the Strike lands on the player wherever they stand. Melee range is only checked every 20 s.
- **Sources:** "only target players within melee range" (Wowhead guide); "the three people 2nd, 3rd, and 4th on his aggro list within melee range" (wiki). Script mechanics are from `sim.js:applyDebuff`.
- **Measured:** a bot out of melee for 67% of the fight, back only for each sample, scored 98 S against 99 S for one that never moved, and took 118 Strikes either way.
- **Change (tested):** set `event` to `hatefulStrikeOt` on `otMelee` and `otMelee2`. The drifting bot then scores 75 B and the honest bot stays 99 S. The engine has no way to stop the Strike landing out of range, so change the drill text to "A Hateful Strike every 3.6 seconds. Stay in melee range for every one; each Strike you are out of range for is scored."

#### PW2. The pull instruction comes from a dragon fight (high, low impact)
- **Field:** `phases[0].expectations[pull]`: label "Drag him to the back wall", tip "Walk him to the corner and turn him to the back wall so the raid never sees his front".
- **Sources:** Patchwerk has no frontal attack (`boss.cones` is `{}`). The real reason for the spot is keeping tanks together near the slime (Wowhead, Warcraft Tavern).
- **Change:** label "Drag him to the tank spot"; tip "Pick him up and bring him to the marked spot, with the off-tanks beside you in melee."

#### PW3. The "Slime river" label is nowhere near the fight (medium, low impact)
- **Field:** `arena.labels` entry "Slime river" at `(28, -8)`.
- **Geometry:** 36.1 yd from `bossSpot` `(0, 16)`. Wowhead says tank him near the slime so melee can step in, and the wiki's Elitist Jerks quote says stepping in is pointless. The script does not model it (`notes`).
- **Change:** delete the label. The room is an estimate and no mechanic uses it.

#### PW4. The healer has only the timing decision (high, wording)
- **Field:** `roles.healer.description`; `playerAbilities.heal` heals the ghost only.
- **Sources:** the wiki lists four healing schemes for three off-tanks, and the highest-HP rule makes "which off-tank do I top" the real choice. The engine has one heal target (already listed under engine limits).
- **Change:** say so in the role text: "You are assigned to one off-tank in the reactive scheme: three off-tanks each eat a Strike every 3.6 seconds. Land your heal after each Strike, before the next one. The real raid also chooses which off-tank to keep highest on health; that choice is not in this seat."

#### PW5. The off-tank has no decision and an idle button (medium)
- **Field:** `roles.offtank.abilities` `["taunt"]`; there are no adds, and Taunt is a no-op here.
- **Sources:** the real job is to stay 2nd to 4th on threat and keep the highest health (Wowhead, wiki). The engine has no threat rank among non-tanks.
- **Change:** set `abilities: []` if the validator accepts it, otherwise add "Your button does nothing in this fight" to the role text. Add threat rank to the engine limits.

#### PW6. Three pieces of wording contradict the model (low)
- **Field and change:**
  - `phases[0].expectations[tankUp].tip` "survive three Strikes in a row" (16,500 damage against a 10,000 bar) to "Your off-tank takes a Strike every 3.6 seconds. Heal after each one."
  - `phases[0].expectations[tankLow].tip` "never let your tank be under 60%" to "under 55%, because a Strike is 5,500".
  - `playerAbilities.heal.tip` "Have it landing as the spike hits, not after", which conflicts with cue `healStrike` ("Heal between Strikes"), to "Land it after each Strike, before the next."

#### PW7. A winning run still sees Berserk (low)
- **Field:** `phases[0].duration` 390, `phases[1].duration` 33, `actions.berserk` at phase time 30.
- **Sources:** real Berserk is about 5x damage and a wipe (wiki; Wowhead "one-shot"). The script fires it 3 s before a kill as x1.4, disclosed in `notes`. A real raid that wins does not see it.
- **Change:** `phases[0].duration` 385, `phases[1].duration` 30 (kill at 6:55), and drop `berserk` from `phases[1].actions`. Keep `berserkDrill`, which shows it. Not tested.

### Grobbulus (`grobbulus.json`)

Checked and correct: cloud cadence (DBM 14.5 to 16.6 s, BigWigs 14.6 to 16.2 s, script 15 s), Enrage at 12:00 (DBM and BigWigs 720 s), Injection 10 s, and the kite. Every mark's tank-to-boss distance is 5.5 yd from his edge, the ring spots are on the floor, and the healer reaches the tank from every mark (39.3 yd at worst).

#### GB1. Ranged are penalised for doing their real job (high)
- **Field:** `actions.falloutSlime` (`killFirst: true`, no `killFirstRoles`); `phases[*].expectations[killOrder]` (`role: "dps"`); `cues.list[backOnBoss]` "You keep hitting him".
- **Sources:** melee kill the slimes, ranged stay on him: "DPS on Grobbulus is ranged... should otherwise be pulled to melee classes" (wiki); "Melee are also responsible for switching to any Fallout Slime" (Wowhead). The script's own cue tells ranged to stay on him.
- **Measured:** a boss-only ranged bot scored 58 C with 151 penalised attacks, against 85 A for one that follows the priority.
- **Change (tested):** add `"killFirstRoles": "melee"` to `actions.falloutSlime`, set `killOrder` to `role: "melee"` in all seven phases, and delete the `notes` phrase "`killFirst` for DPS". A boss-only ranged bot then has 0 off-priority attacks.

#### GB2. The Injection instruction is the wrong one (high)
- **Field:** `actions.injection.tip`, `actions.injection2.tip`, `continuousMetrics.injectionInRaid.tip`, `roles.melee.description` ("run to the far edge of the room"), `roles.ranged.description`, and the drill text "away from everyone".
- **Sources:** "Injected people should run to the edge of existing clouds, as far away from the raid as possible" (wiki). "Find a safe spot to drop the poison cloud in the line of poison clouds behind the boss, ensuring the poison cloud isn't put in a random spot in the room" (Wowhead). The far edge of the room can be ahead of the tank.
- **Change:** tips become "You have 10 seconds. Run out of the raid to the end of the cloud line behind him and drop it there, never ahead of the tank." Melee text: "If you get the Mutating Injection, run out to the end of the cloud line behind him before it goes off." Ranged text: "If you get the Mutating Injection you have 10 seconds to run out of the raid to the end of the cloud line behind him." Scoring does not need to change.

#### GB3. Injection is too slow for most of the fight (medium)
- **Field:** `phases[*].actions` `injection` `every: 20, jitter: 3`; `injection2` `every: 12`; `notes` "the 20 s and 12 s cadences here are estimates".
- **Sources:** BigWigs notes "Next one is sometimes applied just before previous one expires", which puts the cadence near the 10 s debuff. TrinityCore (WotLK) comment: "Default timers are 10800ms, 12000ms, then changed to ~8000ms, 10000ms". DBM's icons allow 4 overlapping targets. The wiki and Warcraft Tavern say more often at 30%.
- **Change (tested):** `injection` `every: 12, jitter: 1.5`; `injection2` `every: 9`. In the combined test this cost the off-tank, DPS and healer bots 7 to 9 points (melee 73, ranged 77, healer 74, all still B). If that is too much, `every: 15` and `every: 10` cost at most 1 point and also pass. Cite TrinityCore in `notes`.

#### GB4. Slime Spray's cone is half its real length (medium)
- **Field:** `boss.cones.spray.range` 22; `notes` "the length is kept short of the raid at the middle of the room".
- **Sources:** spell 28157 is "Range 45 yards, Radius: 45 yards". Wowhead's guide calls it "short-range" in prose, which is why this is medium.
- **Geometry:** the shorter cone is not needed for correct play. With the boss facing the tank at every mark, the raid, ranged, healer and off-tank discs are about 100 degrees off his heading, outside the 60-degree cone at any length. What the 22 yd length does is cut the penalty for a bad facing: only the nearest raiders are reachable.
- **Change (tested):** `boss.cones.spray.range` 45 and delete that `notes` clause. Tank bots still record 0 Sprays on the raid.

#### GB5. Injection and cloud numbers now have sources (medium, notes only)
- **Field:** `notes` "radius 8 (estimate; no source gives the AoE radius)", "800 per second (no Classic source gives a number...)".
- **Sources:** spell 28322 Embalming Cloud is 3,515 Nature in 8 yd, which cmangos casts on natural expiry. Spell 28206 Mutagen Explosion is 2,380 to 3,220 Physical in 20 yd, which cmangos casts on dispel; TrinityCore casts it on expiry too. Spell 28241 (cloud tick) is 1,110 Nature, 30 yd radius, and spell 28158 is 1 tick per second, consistent with 800 per second as a scaled value. The wiki's 4,500 physical on expiry does not match either spell.
- **Change:** in `notes`, cite these values, keep 8 and 800, and note that the cleansed explosion reaches 20 yd, which is why a cleanse must wait until the carrier is out.

#### GB6. Clouds outlast the real poison (low)
- **Field:** `actions.poisonCloud.active` and `actions.injectionCloud.active`, 75.
- **Sources:** spell 28158 (the damaging aura) lasts 1 minute; TrinityCore despawns the cloud at 61 s. The research's 75 s is the summon spell's duration.
- **Change:** `active` 60 on both. Not tested; the script's kite spacing does not depend on it.

#### GB7. Slime Stream fires with no grace (low)
- **Field:** `phases[*].actions` `slimeStream` `every: 3.5`.
- **Sources:** cmangos polls the tank's reach every 1 s, then casts Slime Stream 5 s later only if the tank is still out of reach (`GROBBULUS_CHECK_MELEE`).
- **Change:** `every: 5`, keeping `first: 8`. Not tested. Confidence is low because this comes from an emulator.

#### GB8. Slime Spray cadence is an estimate that an emulator disputes (low)
- **Field:** `phases[*].actions` `slimeSpray` `every: 18`.
- **Sources:** TrinityCore (WotLK) comment: "timers must always looks like ~30 (initial) ~30 (first repeat) 55 (second repeat)". DBM and BigWigs give no bar.
- **Change:** none yet. Cite this as the only available data point, and do not treat 18 s as sourced in `notes`.

### Gluth (`gluth.json`)

Checked and correct: Decimate every 105 s (BigWigs bar, cmangos 105 then 100 to 110), Frenzy cadence (DBM 8.1 to 11.4 s, cmangos 10 to 12 s), Roar cadence (DBM 17.8 to 22.7 s, BigWigs 18 s, cmangos 20 s). Healers reach the tank (39.1 yd at worst) and the melee door frame is 7.8 yd from his edge, an 8.2 yd walk from `meleeSpot`.

#### GL1. Topping the tank before Decimate teaches the wrong thing (high)
- **Field:** `actions.decimate.tip` "Top the tank before it", `actions.decimateWarn.tip` "Have the tank full", `roles.healer.description` "Keep him full going into Decimate", `cues.list[healPreDecimate]` "Make sure he is full", `drills[decimateDrill]`, `actions.decimate.tankDamage` 6000, `damage` 7000.
- **Sources:** "reduces the health of every raid member and zombie to 5% of their maximum HP (no matter how much hp you had before)", and "Once Gluth casts decimate, top off the MT (a druid NS rotation works well)" (wiki). "Tanks need to be prepared to use defensive cooldowns right as this goes off" (Wowhead). cmangos: damage equals current HP minus 5% of max, so it can never kill.
- **Change (tested):**
  - `actions.decimate.tip` to "Decimate drops everyone to 5% of their health no matter how full they are, zombies included. Heal hard the moment it lands; ranged kill the zombies charging him."
  - `actions.decimateWarn.tip` to "Decimate in six seconds. Topping him first does not help: it sets everyone to 5%. Time your biggest heal for the moment it lands."
  - `roles.healer.description` to "Mortal Wound cuts every heal you land on the tank. Decimate drops him to 5% no matter how full he is, so land your biggest heal the moment it hits."
  - Delete cue `healPreDecimate`.
  - `drills[decimateDrill]` name "Heal after Decimate", description "Decimate every 30 seconds. Land your biggest heal the moment it lands."
  - `actions.decimate.tankDamage` 4500 and `damage` 6000 (see GL2 for why), so a tank the healer keeps above half survives without a top-up. Update the numbers in `notes`. The healer bot scores 93 A with no deaths.

#### GL2. Frenzy is the wrong spell in the notes (high)
- **Field:** `notes` "the ×1.2 is a scaled +150% attack speed"; `actions.frenzy.damageTakenMult` 1.2.
- **Sources:** DBM, BigWigs and cmangos all track spell 28371: "Attack speed increased by 100%. Damage increased by 50%. 8 seconds remaining", about x3 damage. The +150% in the research is spell 19451, a different Frenzy.
- **Change (tested):** `actions.frenzy.damageTakenMult` 1.5, and `notes` to "the x1.5 is a scaled +100% attack speed and +50% damage (spell 28371)". With Frenzy up a Decimate hits for 6,750 on the ghost and 9,000 on a player, both under the 10,000 bar with the GL1 numbers. Do not use 1.5 with the current 7,000, which would be 10,500.

#### GL3. In the tank seat the 5% zombies run at the raid instead of him (high)
- **Field:** `actions.decimatedZombies.pickup` `"tanks"`.
- **Sources:** after Decimate they "lose all aggro and run straight towards Gluth" (wiki). Nobody tanks them. In `spawnAdds`, the `pickup` role gets them as its own, so in the tank seat they target the raid.
- **Measured:** tank seat, zombies ended at `(1, -17)` in the raid; melee seat, they ended at `chargeSpot`, around `(21, 7)`.
- **Change (tested):** `pickup: "none"`. All seats then see them run to `chargeSpot`.

#### GL4. The kill deadline is later than the script says (medium)
- **Field:** `phases[2].subtitle` "Kill him before the third Decimate"; `notes` "that is the real kill condition (Wowhead: kill before the third Decimate; DBM aura 26662)".
- **Sources:** BigWigs `self:Berserk(360, true)` (6:00). cmangos Berserk at 390 s ("~15 seconds after the third Decimate"). Wiki "10-20 seconds after the third Decimate". Wowhead says the Enrage comes after three Decimates and does not say to kill before the third. A raid can survive the third Decimate and still win.
- **Change:** subtitle "Kill him before the Enrage"; `notes` "The third Decimate lands about 5:15; the Enrage follows (wiki 10 to 20 s later, BigWigs 6:00, cmangos 6:30). A run that finishes at 5:05 is comfortably inside it." The 305 s clock can stay.

#### GL5. Zombies do not walk for Gluth before Decimate (high, wording)
- **Field:** `roles.offtank.description` "walk for Gluth".
- **Sources:** the wiki's "lose all aggro and run straight towards Gluth" is about after Decimate. Before it they chase raiders and are kited; "Healers will likely get aggro on the Zombie Chows" (Wowhead), and Gluth eats only those that come close. The engine already sends them at the raid, so only the words are wrong.
- **Change:** "Zombies climb out of the grates every 10 seconds and go for the nearest raider. Pick each one up and keep them at the far side of the room until Decimate. A zombie that reaches him heals him 5%."

#### GL6. Zombie cadence may be faster than the guides (medium)
- **Field:** `zombieA/B/C` `every: 30`, staggered 10 s apart (one every 10 s).
- **Sources:** spell 28216 is "Periodically trigger spell... 1 every 6 seconds", and cmangos puts it on three triggers. The wiki and Wowhead both say every 10 s or so. The script follows the guides.
- **Change:** none for now. Add to `notes` that spell data implies at least one per 6 s and that the guide value was kept.

#### GL7. "No timer exists" for Mortal Wound is out of date (low)
- **Field:** `notes` "the wiki says 'frequent', no timer exists"; `mortalWound` `every: 6`.
- **Sources:** cmangos: first at 10 s, then every 10 s (emulator). BigWigs warns from 4 stacks up, emphasising 6.
- **Change:** note "cmangos has 10 s; 6 s here keeps five stacks inside the 34 s window before the first swap". The value can stay.

#### GL8. Spot tolerances allow standing out of range (low)
- **Field:** `positions.rangedSpot.tolerance` 8 (26 yd from his edge, 34 at the limit, against 30 reach); `positions.meleeSpot.tolerance` 4 (3 yd from edge, 7 at the limit, against 5 reach).
- **Change:** `rangedSpot.tolerance` 4, `meleeSpot.tolerance` 2. Not tested.

### Kel'Thuzad (`kelthuzad.json`)

Checked and correct: Phase 1 at 230 s (DBM 229.2 to 231 s; BigWigs bars 221 s to the yell plus 15 s until he is active). Phase 2 first-cast times sit inside DBM's windows. Chains on the MT plus four (cmangos, wiki, Wowhead). Detonate Mana 5 s (BigWigs, spell 27819). Frost Blast 5 s stun in a 10 yd radius (spell 27808). The Void Blast radius of 5 yd (spell 27812) fits the script's 5.5.

#### KT2. Twice as many Soul Weavers as the notes claim (high)
- **Field:** `phases[0].actions` `weavers` `every: 16`; `actions.weavers.from` has two portals.
- **Check:** 14 waves of 2 is 28. `notes` say about 14; the wiki and cmangos both give 14.
- **Change (tested):** `every: 32` (7 waves of 2 is 14).

#### KT3. Paired actions drift apart, so one event happens twice (high)
- **Field:** `phases[1].actions` and `phases[2].actions`: `chains` and `chainsWipe` scheduled separately (`first: 60, every: 70, jitter: 10`); `frostBlastYou` and `frostBlastGhost` likewise (`jitter: 6`).
- **Engine and measured:** `buildSchedule` jitters each entry independently. One seed gave `chains` at 290, 357, 488 and `chainsWipe` at 293, 367, 487, 548, with an extra wipe at 548 and a 10 s gap at 357. Chains should be one event (DBM and BigWigs one aura, cmangos one spell).
- **Change (tested):** delete the `chainsWipe` and `frostBlastGhost` entries from both phases, add `"follow": [{"id":"chainsWipe","delay":0.05}]` to `actions.chains`, and add `"follow": [{"id":"frostBlastGhost","delay":0.05}]` to `actions.frostBlastYou`. Cues and expectations keep working because the followed action still fires its event.

#### KT4. Melee are told to kill Soldiers (high)
- **Field:** `roles.melee.description` "kill Abominations and Soldiers before they reach the raid"; `cues.list[killSoldiers]` `role: "dps"`; `actions.soldiers` `killFirst` with no `killFirstRoles`.
- **Sources:** "Ranged need to all be on the Soldiers and Soul Weavers... Melee are on the Abominations" (wiki). "Melee should only be focusing Unstoppable Abominations" (Wowhead).
- **Change (tested):** `roles.melee.description` to "Phase 1: kill the Abominations in the middle; the ranged team has the Soldiers and Soul Weavers. Phase 2: 8-yard melee diamond, interrupt his single Frostbolt, step out of every Fissure." `cues.list[killSoldiers].role` to `ranged`. `actions.soldiers.killFirstRoles` to `ranged`. Melee bot 87 A.

#### KT5. The Phase 1 ramp can be built (medium)
- **Field:** `phases[0].actions` `soldiers` `first: 6, every: 9`; `notes` "the sources give no table and the engine has no ramp".
- **Sources:** cmangos has a full table (emulator, "to be improved once Classic sniffs are available"): Soldiers every 5 s for 65 s, 4 s for 60 s, 3 s for 54 s, 2 s for 54 s, 1 s for 47 s; Abominations and Weavers also accelerate. The wiki says they "spawn progressively faster".
- **Engine:** a phase can list the same action more than once, so the rate can stack without splitting the phase.
- **Change (tested):** replace the entry with `{"id":"soldiers","first":6,"every":20}`, `{"id":"soldiers","first":140,"every":16}` and `{"id":"soldiers","first":190,"every":8}`, which gives about 115 Soldiers, mostly late. Correct `notes` to cite cmangos and say this is a scaled ramp.

#### KT6. The five Guardians arrive one at a time (medium)
- **Field:** `actions.guardians` (5 portals at once), `phases[2].actions` `guardians` `first: 3`.
- **Sources:** spell 28453 "Summon Type D Periodic" triggers "1 every 10 seconds", and cmangos stops it after 55 s. The Wowhead guide says five spawn at the portals without timing them.
- **Change (tested):** replace with `guardian1` to `guardian5`, each one portal (`portalE` with `playerFrom ["portalE"]`, `portalNE` with `playerFrom ["portalNE"]`, then `portalN`, `portalNW`, `portalW` with `playerFrom []`), at `first` 3, 13, 23, 33, 43. Point `grabGuardians` and `grabGuardianCue` at `guardian1` and add a matching expectation and cue for `guardian2`.

#### KT7. The Phase 2 off-tank has no job (medium)
- **Field:** `roles.offtank`, `phases[1].expectations`. The only off-tank checks are a position and Fissures.
- **Sources:** "Whichever tanks are not mind controlled need to immediately fight for threat" (wiki). Off-tanks stand with the melee and do damage in Phase 2 (Wowhead). Taking him over after Chains is the off-tank's whole job, and `holdsBoss: false` means this seat cannot actually do it.
- **Change (tested):** add to `phases[1].expectations`: `{"id":"otChains","type":"onEvent","event":"chainsWipe","check":"inRange","role":"offtank","label":"Be on him when Chains lands","tip":"Chains takes the main tank and wipes threat. You are next."}`. Add to the role text: "In Phase 2 stay in melee on him: when Chains takes the main tank you are next in line." Add the threat-race takeover to the engine limits.

#### KT8. Nothing scores spacing except Detonate (medium)
- **Field:** `positions.raidP2` `spread: 17` (a loose disc); `actions.frostBlastYou`.
- **Sources:** 8 yd melee diamond and 8 yd ranged circle because Frost Blast "can chain through the entire raid if you do not keep spaced" (wiki). Spell 27808 has a 10 yd radius. The engine has `carried` with `stayPut` for exactly this (C'Thun, Horsemen).
- **Change (tested, optional):** `raidP2` to `"spacing": 10` (remove `spread`). Add `actions.frostBlastChain` = `{"label":"Frost Blast","kind":"hazard","cast":0,"placement":"random","count":1,"playerChance":0.1,"roles":["ranged","healer"],"carried":true,"stayPut":true,"radius":9.5,"warning":2,"active":0.4,"damage":0,"raidMetric":"frostBlastChained","warn":false,"cue":null,"icon":"eruption","requires":"grounded","tip":"Frost Blast jumps to anyone within 10 yards of a victim. Keep your spacing."}`. Add it to `actions.frostBlastYou.follow` at `delay: 0.05`, add metric `frostBlastChained` (`penaltyPerUnit` 6, `severe` 1, `roles` ranged and healer), and a `continuous` expectation in phases 2 and 3. Bots in formation record 0 chains. One cost to check before applying: the ranged bot's `detonateCaught` went from 0 to 3 with the formation, so Detonate Mana needs a re-check if this goes in.

#### KT9. Priests have no Shackle job in Phase 3 (medium)
- **Field:** `roles.healer.abilities`; `notes` "Shackle rotation: not modelled, no shackle button".
- **Sources:** three Priests keep three Guardians shackled for the whole phase (Wowhead, wiki). Faerlina already uses a `dispel` stand-in for a different class's job.
- **Change (tested, optional):** add `playerAbilities.dispel` labelled "Shackle Undead" with `dispels: ["magic"]`; healer `abilities` `["heal","dispel"]` and `dispels: ["magic"]`; `actions.shackleFade` a `debuff` with `target: "random"`, `playerChance: 0`, `dispel: "magic"`, `duration: 6`; schedule `{"id":"shackleFade","first":20,"every":17,"jitter":3}` in phase 3 (three Priests times a 50 s Shackle); expectation `afterEvent` on `shackleFade`, `check: "noDispellable"`, `within: 5`, `role: "healer"`. State in the text that it stands for the Priests. A healer bot that presses it got 7 of 7 on time and 87 A; one that ignores it got 7 late and 68 C.

#### KT10. Healer and ranged spots can be out of reach inside their own tolerance (low)
- **Field:** `positions.healerSpot` `(-24, -8)` tolerance 9 (36.1 yd to the tank, up to 45.1 against 40 reach); `positions.rangedSpot` `(20, -12)` tolerance 9 (28 yd from his edge, up to 37 against 30 reach).
- **Change (tested):** `healerSpot` `(-20, -6)`, tolerance 7 (32.0 to the tank, 39 at the limit). `rangedSpot` `(20, -8)`, tolerance 5 (25 from his edge, 30 at the limit).

#### KT11. Drill text disagrees with the drills (low)
- **Field and change:** `drills[detonateDrill].description` "goes off in 4.5 seconds" to "5 seconds" (`warning` 5). `drills[kickDrill].description` "every 8 seconds" to "every 11 seconds".

#### KT12. The Dark Blast toast blames the player who did the right thing (low)
- **Field:** `actions.soldierBlast.tip` "A Soldier reached the raid. Everyone took a Dark Blast. Kill them on the way in."
- **Sources and engine:** `notes` disclose that it stands for the occasional leak. It fires every 45 s however well the player does.
- **Change:** tip to "One of the raid's Soldiers got through. Everyone took a Dark Blast; heal back up."

#### KT13. The main tank is told to fix something the real one cannot (low)
- **Field:** `roles.tank.description` "Chains wipes your threat: be ready to burst it back".
- **Sources:** the main tank is the target of Chains and is charmed for 20 s (cmangos, wiki, spell 28410). An off-tank takes over, and the main tank rebuilds afterwards.
- **Change:** "Chains takes you for 20 seconds in the real fight and wipes your threat. Here the button stands for the tanks' race to get him back: press it the moment it lands."

### What the research files got wrong (second pass)

- **gluth.md**, Positioning: "druid Nature's Swiftness rotation to top the MT before Decimate". The wiki says "Once Gluth casts decimate, top off the MT" (GL1).
- **gluth.md**, Zombie Chow: "Zombies drop aggro after spawning and walk toward Gluth". The wiki's sentence is about after Decimate (GL5).
- **gluth.md**, Frenzy: the +150% is spell 19451. The boss's spell is 28371 (+100% speed, +50% damage). Open question resolved (GL2).
- **gluth.md**, Enrage: BigWigs 360 s and cmangos 390 s are not listed (GL4).
- **gluth.md**, Infected Wound: BigWigs tracks debuff 29306; 29307 is the passive.
- **kelthuzad.md**, Abominations: Mortal Wound is spell 28467, 15 s, 10 yd (BigWigs, spell page). 25646 at 30 s is Gluth's. Script value 16 s is fine, 15 is exact.
- **kelthuzad.md**, Adds: "no exact spawn table exists in the fetched sources". cmangos has one (KT5).
- **kelthuzad.md**, Guardians: research treats the arrival as a single wave (KT6).
- **grobbulus.md**, Open questions: cloud tick, Injection radius and Slime Spray length now have values (GB4, GB5).

### Engine limits added by this pass

- **No "set HP to a fraction" damage:** Decimate cannot be 5% (GL1, GL2).
- **No add-to-boss contact:** a zombie reaching Gluth cannot heal him 5%.
- **No threat rank among non-tanks:** Patchwerk's 2nd to 4th rule and the Kel'Thuzad off-tank's takeover (PW5, KT7).
- **A carried bomb's follow-up cannot anchor where it went off:** Injection clouds at a fixed `cloudLineEnd`.
