# AQ40 encounter scripts: independent verification

Checked: the nine scripts in `data/encounters/temple-of-ahnqiraj/` against `docs/ENCOUNTER_FORMAT.md`, each boss's research file, and a second research pass. `node tools/validate.mjs temple-of-ahnqiraj/cthun` passes, so nothing below is a shape error.

Source weight: BigWigs and DBM timers come from real pulls and are the strongest. cmangos boss scripts are emulator reconstructions, so they are labelled "(emulator)" and never carry a finding alone unless the item says so. Guide text is listed by page. Quotes are as returned by the fetch tools.

Computed and clean, so not itemised: every position in all nine scripts is on the floor; every healer spot reaches its tank (40 yd, or the script's declared wider `heal.range` on Twin Emperors and C'Thun); every ranged spot reaches the boss; Ouro's `otSpot` and `otEmerge` are outside the 180 degree Sand Blast cone. Every action referenced by a phase is defined and every expectation metric exists.

Item IDs are stable so fixes can be tracked. Field paths use `phases[n]` by array index, so `phases[0]` is phase id 1.

---

## The Prophet Skeram

### SK-1. Broken label (high)
- Field: `phases[0].expectations[id=platform].label`
- Script: `"Hold him on the Pull him off the steps"`, a template that substituted the phase subtitle. Phases 2 to 9 read correctly.
- Change to: `"Hold him on the middle platform"`

### SK-2. Melee are never told the rule that decides Arcane Explosion (medium)
- Field: `roles.melee.description`
- Script: `"Stay on him, kick Arcane Explosion, swap to the images on the 75% and 50% splits. On the 25% split ignore the images and burn him."`
- Sources: Explosion is only cast with enough players in melee. Wiki ">4 in melee" and Warcraft Tavern "5 or more" (both cited in `skeram.md`, which also lists "keep the melee count at any Skeram to 4 or fewer"). cmangos (emulator) `m_maxMeleeAllowed = players / 10 + 1`, which is 5 in a 40-man: https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_skeram.cpp
- The notes correctly say the engine cannot count melee. The instruction can still be stated.
- Change to: `"Stay on him, but keep to four melee or fewer on any one Skeram: a fifth makes him cast Arcane Explosion. Kick the casts that do come. Swap to the images on the 75% and 50% splits; on the 25% split ignore them and burn him."`

### SK-3. Tank has no interrupt although the format allows it (low)
- Field: `roles.tank.abilities`, `continuousMetrics.castsLanded.roles`
- Script: tank has `["taunt"]`; `notes` says "Without an Interrupt button the tank and healer see every cast land".
- Sources: `skeram.md` tank item 3, "Interrupt Arcane Explosion when you have the interrupt (Shield Bash/Pummel)". The `interrupt` kind can be given to any role.
- Change to: `roles.tank.abilities: ["taunt","interrupt"]`; `castsLanded.roles: ["dps","tanks"]`; `kicks` expectation `role: ["dps","tanks"]`; drop the tank from that sentence in `notes`.

---

## Bug Trio

### BT-1. The action called Vengeance is not Vengeance (medium)
- Field: `actions.vengeance` (`label`, `toast`, `tip`), `phases[2].actions[id=vengeance]`
- Script: at the start of phase 3, `"Vem is alone: he enrages!"`, labelled Vengeance.
- Sources: Vengeance is Vem's death effect on the survivors. Wiki: "Death Special: Enrages Yauj and Kri if they are still alive." https://warcraft.wiki.gg/wiki/Silithid_Royalty . Wowhead guide: "When Vem dies, he will buff any remaining bug bosses". cmangos (emulator) sets `m_deathAbility = SPELL_VENGEANCE` on Vem. What the script models is the separate Wowhead claim "Berserk when Vem is the last boss remaining": https://www.wowhead.com/classic/guide/bug-trio-temple-of-ahnqiraj-strategy . That Berserk has one source and cmangos has no such spell, so keep the effect but name it correctly.
- Change to: rename the action id to `vemBerserk` and update the phase reference; `label: "Berserk"`; `toast: "Vem is the last one left: he berserks!"`; `tip: "Vem goes berserk when he is the last bug alive. Tank and healers, this is the part that needs your big cooldowns."`. In `notes`, replace the Vengeance sentence and state that Vengeance on Vem's death is not simulated because this kill order never reaches it.

### BT-2. Tip contradicts the phase it is in (medium)
- Field: `phases[2].expectations[id=vemWall].tip`
- Script: `"Back to the wall so Knock Away cannot move you and his charges have no one to pick from."`
- Problem: `vemCharge` fires in this same phase and the raid stands at `raidVem` (2,12), about 20 yd from him. `bug-trio.md` ties the out-of-sight trick to Vem being parked, not to him being the kill target.
- Change to: `"Back to the wall so Knock Away cannot move you. He is the kill target now, so the raid is in his sight and his charges will land."`

### BT-3. Vem's Knockdown is absent (low)
- Field: `actions` (no entry), `phases[2].actions`
- Sources: cmangos (emulator) `SPELL_KNOCKDOWN = 19128` on Vem's victim every 15 to 20 s. Not named in the wiki or Wowhead text fetched, so it may be a minor tank-only effect.
- Change: optional. If added: `"vemKnockdown": { "label": "Knockdown", "kind": "debuff", "cast": 0, "target": "tank", "dispel": "none", "duration": 2, "stun": 2, "warn": false, "cue": null, "icon": "buffet", "requires": "grounded", "tip": "Vem knocks his tank down for two seconds." }` with `{ "id": "vemKnockdown", "first": 10, "every": 18, "jitter": 3 }` in `phases[2].actions`.

---

## Battleguard Sartura

### SA-1. Aggro resets run on their own clock, but Whirlwind causes them (high)
- Field: `actions.aggroReset`, its entries in `phases[0..2].actions` (every 26, 20 and 16 s), `actions.whirlwind5.follow`
- Script: resets are independent of Whirlwind; `notes` calls the cadence "unknown in every source".
- Sources, three agreeing:
  - Warcraft Tavern: "Whenever any target in the room uses Whirlwind, threat is completely reset." https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40
  - TenTonHammer, 2006: "since each time they Whirlwind they lose their aggro." https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-sartura.amp
  - cmangos (emulator) `AQWhirlwind`: each tick moves threat to a random player and the last tick wipes the table. https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_sartura.cpp
  - Dissent: the Wowhead guide says resets occur "randomly throughout the fight" and the wiki says "occasionally". Neither gives a cause.
- Change:
  1. `actions.whirlwind5.follow`: add `{ "id": "aggroReset", "delay": 0.2 }` after `sunderingCleave`.
  2. Delete `aggroReset` from `phases[1].actions` and `phases[2].actions`: no guards remain, so only her Whirlwind causes it.
  3. Keep `{ "id": "aggroReset", "first": 22, "every": 26, "jitter": 5 }` in `phases[0]`, and note it stands in for the guards' spins.
  4. `actions.aggroReset.tip`: `"A Whirlwind just ended: her table is empty and she runs at a random raider for 5 seconds. Taunt immediately."` Update the `notes` sentence.

### SA-2. Whirlwind is far too rare (medium)
- Field: `phases[0..2].actions[id=whirlwind]`
- Script: `every` 60, 55 and 40 s, justified in `notes` as a guess to preserve two-thirds melee uptime.
- Sources: cmangos (emulator) `ResetCombatAction(action, urand(20, 25) * IN_MILLISECONDS)` from cast to cast, first at 10 to 20 s, with a 15 s aura (BigWigs bar) leaving 5 to 10 s between spins. TenTonHammer on the guards: "each add is constantly whirlwinding." No boss mod carries a timer, hence medium.
- Change: `phases[0]` `{ "id": "whirlwind", "first": 14, "every": 23, "jitter": 2 }`; `phases[1]` first 8; `phases[2]` first 12. Add `"fullActivity": 0.3` to `grading`, because `src/core/scoring.js:85` otherwise halves the expectation points of a melee player who correctly walks out for 15 of every 23 s. Rewrite the `notes` justification.

### SA-3. Enrage threshold (medium)
- Field: `phases[1].hpTo`, `phases[2].hpFrom`, `phases[2].name`, `actions.enrage20.toast`, `actions.enrage20.tip`, `roles.healer.description`, `phases[2].expectations[id=tankUp].tip`
- Script: 20%.
- Sources: 25% in BigWigs (`CL.percent:format(25, args.spellName)` and a soon-warning under 31): https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Sartura.lua . 25% in cmangos (emulator) `GetHealthPercent() <= 25.0f`. 20% in the wiki and the Wowhead guide. DBM pre-warns at 35% and fits either. Boss-mod data is the better evidence but does not settle it.
- Change: `hpTo` and `hpFrom` to `0.25`, and "20%" to "25%" in the five text fields above.

### SA-4. Stale workaround (low)
- Field: `notes` ("because the engine's `moveOut` marker does not avoid hazards and melee would be walked straight into one"), `phases[0].actions[id=guardSpin]`
- Engine: `moveOut` now routes through `dodgeHazards` (`src/core/ideal.js:174`).
- Change: delete that clause. Guard spins no longer need placing between Whirlwinds, which SA-2 requires anyway.

---

## Fankriss the Unyielding

### FK-1. The tank gets Entangled (medium)
- Field: `actions.entangleTank`, `phases[1].actions[id=entangleTank]`, `phases[1].expectations[id=entangleBack]`
- Script: the tank is ported to the east tunnel and rooted for 6 s. `notes` calls this rare in the real fight.
- Sources: cmangos (emulator) selects with `SELECT_FLAG_PLAYER | SELECT_FLAG_SKIP_TANK`. https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_fankriss.cpp . `fankriss.md` says "a random raid member". The wiki never mentions Entangle. Emulator only, hence medium.
- Change: remove the action from `phases[1].actions` and remove `entangleBack`. If the experience is wanted, retune `entangleTank.tip` to say it models a tank who is not currently holding him, which is the only case the emulator allows.

### FK-2. Pull expectation scores nothing (low)
- Field: `boss.stationary: true`, `phases[0].expectations[id=pull]`, `phases[1..2].expectations[id=stay]`
- Script: a boss that cannot walk starts at `bossStart` (0,12), inside `bossSpot` (0,11) tolerance 8, so these expectations pass for free. `notes` explains that `stationary` is needed for the swap model.
- Change: remove `pull` and `stay`, or relabel them as informational. Do not remove `stationary`, because the rest windows depend on it.

---

## Viscidus

### VI-1. He cannot be taunted (high)
- Field: `roles.tank.description`, `playerAbilities.taunt.tip`, `actions.rejoin.toast`, `phases[3].expectations[id=reformTaunt]`, `phases[6].expectations[id=reformTaunt]`, `drills[id=reformDrill].description`, `cues.list[id=tauntLost]`
- Script: `"Taunt the moment he does"`, `"He reforms: threat wiped. Tank, Taunt him!"`, `"Be on the reform point and Taunt as he comes back together."`
- Sources: wiki: "Viscidus has a nasty tendency to aggro someone right as he reforms and run off after them", because "he is untauntable". https://warcraft.wiki.gg/wiki/Viscidus . `viscidus.md` tank item 2 already says "re-taunt is not possible — generate threat first", so the script contradicts its own research.
- Change, following what `huhuran.json` already does for its taunt-immune boss:
  - `playerAbilities.taunt`: `"label": "Build threat"`, `"tip": "Viscidus cannot be taunted in the real fight. This button stands in for building threat fast as he reforms."`
  - `roles.tank.description`: replace the last clause with `"be on the reform point before he comes back and build threat the moment he does: he cannot be taunted."`
  - `actions.rejoin.toast`: `"He reforms: threat wiped. Tank, build threat now!"`
  - `reformTaunt.label`: keep. `reformTaunt.tip`: `"Be on the reform point and hit him as he comes back together. He cannot be taunted, so healers hold back for a few seconds."`
  - `drills[id=reformDrill].description`: `"He reforms every 12 s with an empty threat table. Build threat the moment he appears."`
  - `cues.list[id=tauntLost].label`: `"Build threat when Viscidus turns on the raid"`.

### VI-2. Melee are taught the minority approach (medium)
- Field: `roles.melee.description`, `notes`
- Script: `"Keep hitting him (the frost oil on your weapon is what is really counting)."`
- Sources: wiki: "Most guilds keep their melee players away from Viscidus so that they don't take poison damage." It lists staying in as the alternative.
- The `notes` reason for not modelling this still holds, but the mechanism is `activity` at `src/core/scoring.js:84`: filtering `outOfRange` by `phases` does not exempt it (see E3).
- Change to: `"Most raids keep melee out of Poison Shock until he freezes. This sim keeps you on him so your button matters: read your hits as frost procs. When he freezes, hit him with everything: he shatters on number of swings. Then every glob you kill takes 5% off him for good."`

### VI-3. Final-shatter tip does not match the fight (medium)
- Field: `phases[8].expectations[id=killOrder].tip`
- Script: `"He is under 5%: kill them all and it is over."`, while the phase runs from 34%.
- Sources: wiki: "If he is below 5% when shattered, he will die", meaning no globs appear at all. cmangos (emulator) uses 10%.
- Change to: `"Every glob you kill is 5% gone for good, and any left alive reform him. Kill them all."`

### VI-4. Poison Shock spots leave no margin (low)
- Field: `positions.rangedSpot`, `positions.healerSpot`
- Script: edge distances 16.1 and 15.4 against a 15 yd radius, with tolerance 7. A player can be "on the spot" and inside Poison Shock.
- Change to: `rangedSpot { "x": -2, "y": -22, "tolerance": 5 }`, `healerSpot { "x": 4, "y": -22, "tolerance": 5 }`. Computed: edge at least 15.1 anywhere within tolerance, healer to `tankSpot` 33.2 yd, ranged reach 20.1 of 30.

---

## Princess Huhuran

### HU-1. A scored metric can never fire (high)
- Field: `continuousMetrics.boltsFromFrenzy` (`roles: "ranged"`), `actions.poisonBolt` (`radius: 14`, `playerMetric: "boltsFromFrenzy"`)
- Problem: an `aoe` records `playerMetric` only for a player inside its radius (`src/core/sim.js:496`). `rangedSpot` is 22.7 yd from her edge, and still 14.7 at the far edge of its tolerance, so the only role this metric scores never increments it.
- The behaviour is already scored by `tranq` (expectation) and `debuffSeconds`.
- Change: delete `continuousMetrics.boltsFromFrenzy` and remove `playerMetric` from `actions.poisonBolt`.

### HU-2. Spots contradict the spread rule (low)
- Field: `positions.rangedSpot` (-6,-18), `positions.healerSpot` (6,-16), `phases[0].expectations[id=rangedSpread].tip`
- Problem: the spots are 12.2 yd apart while the tip says Noxious Poison splashes 15 yd.
- Change: `healerSpot.x` to `14`. Computed: 20.1 yd from `rangedSpot`, 34.9 yd to `tankSpot`, on the floor.

---

## Twin Emperors

### TW-1. Melee are taught to leave after the teleport (high)
- Field: `roles.melee.description`, `phases[*].expectations[id=meleeUptime].tip`
- Script: `"Every teleport, leave his old spot at once"` and `"Run across the room the moment they teleport."`
- Sources: wiki: "run away from their Emperors in due time (5 seconds) before the next teleport", and "After each teleport the character closest to the given Emperor will get aggro." https://warcraft.wiki.gg/wiki/Twin_Emperors . `twin-emperors.md`: "leave him ~5 s before the next teleport so the warrior gets first threat". The `notes` admit the rule has no metric, but the text teaches the opposite.
- Change, text (required):
  - `roles.melee.description`: `"You only ever hit Vek'nilash. Leave him about 5 seconds BEFORE each teleport so the warrior is the closest player when he lands, and be gone from that spot: Vek'lor arrives there and Arcane Bursts anyone within 10 yards. Then cross the room."`
  - `meleeUptime.tip`: `"Physical only. Stop and leave 5 seconds before every teleport, then get back on him."`
- Modelling: do not split each cycle into a separate 5 s "leave" phase yet. Activity is scored per phase (`src/core/scoring.js:84`), so a phase spent out of range gives melee a role factor of 0 and voids that phase's expectation points. Once E3 has a per-phase exemption, split each 35 s phase into 30 s plus 5 s with `spots.melee` set to a new `meleeCross` position at (0,-2), and `playerAtSpotBy` on it for `role: "melee"`.

### TW-2. Tank instruction omits the actual rule (low)
- Field: `roles.tank.description`
- Script: `"you land on the new side and must Taunt immediately"`
- Sources: wiki, as above: the closest character gets aggro. `phases[1].expectations[id=regain].tip` already says this.
- Change to: `"be the closest player when he lands, because he goes to whoever is nearest, then Taunt to lock him"`.

### TW-3. Tip implies movement the spot does not need (low)
- Field: `phases[*].expectations[id=rangedStairs].tip`
- Script: `"At least 10 yards from Vek'lor, and ready to swap sides when they teleport."`
- Problem: `rangedSpot` (0,12) is fixed and reaches both sides on the declared 34 yd range.
- Change to: `"At least 10 yards from Vek'lor. From the middle you reach him on either side, so you do not cross."`

---

## Ouro

### OU-1. He does not surface at a fixed spot (medium)
- Field: `actions.emerge.tip`, `phases[1].expectations[id=emergeSpot].tip`
- Script: `"He surfaces in the middle."`, `"He comes up in the middle."` The `notes` already concede "not the real random emerge point".
- Sources: wiki: "In order to determine where he will surface, it is advised that everyone in the raid stay near the center area (or predetermined area) near the end of the submerging phase." https://warcraft.wiki.gg/wiki/Ouro . cmangos (emulator): he emerges at a roaming Dirt Mound that picks random players.
- Change: `emerge.tip`: `"He surfaces near the raid, so the raid decides where. Be gathered at the agreed spot before the 30 seconds run out."`; `emergeSpot.tip`: `"He comes up where the raid is gathered. If no tank reaches him inside 10 seconds he goes straight back down."`

### OU-2. "Past that you are safe" is unsupported (medium)
- Field: `actions.sweep.knockbackRange` (12), `phases[*].expectations[id=rangedBehind].tip`, `roles.ranged.description`
- Script: `"Twelve yards from his edge is the Sweep ring. Past that you are safe."`
- Sources: spell data: radius 30 yd on both effects, 1.5 s cast: https://www.wowhead.com/classic/spell=26103/sweep . Guides treat it as melee range. Wiki: "often result in temporary switch aggro to ranged group and sandblast ranged group".
- Do not raise the number: at 30 yd `rangedSpot` (edge 20.7) is inside and cannot retreat while staying in 30 yd attack range.
- Change the claim only: `rangedBehind.tip`: `"The sim's Sweep ring is 12 yards from his edge. Spell data lists 30, so in the real fight do not assume you are safe just outside melee."`

### OU-3. Sweep aggro loss can be modelled (medium)
- Field: `actions.sweep.threatCut` (0), `notes` ("the aggro-drop on the swept tank is not modelled")
- Sources: wiki: "a tank will lose aggro and a new tank will be on Ouro's aggro list". The `knockback` kind supports `threatCut` (`src/core/sim.js:475`).
- Change: `"threatCut": 0.5` and delete that clause from `notes`. Tune the value in play: too high makes every Sweep an instant turn on the raid.

### OU-4. Scarabs spawn beside him (low)
- Field: `positions.sc1..sc4` (all within about 15 yd of him)
- Sources: Wowhead guide: "multiple Ouro Scarab in a random area in Ouro's room": https://www.wowhead.com/classic/guide/ouro-temple-of-ahnqiraj-strategy . cmangos (emulator): four of the five roaming Dirt Mounds emit them.
- Change: `sc1 (-26,-10)`, `sc2 (26,-10)`, `sc3 (-22,22)`, `sc4 (22,22)`. All on the floor. Keep `playerFrom: ["sc1"]`, and check the `scarabGrab` timing in play.

---

## C'Thun

### CT-1. Carapace workaround is obsolete (high)
- Field: `notes` (last sentence), `actions` (no shield), `phases[1].actions`, `phases[4].actions`, `continuousMetrics`
- Script: `"The carapace can't be a shield because shield also blanks attacks on killable adds in the surface phases (reported as an engine gap)."`
- Engine: `kind: "shield"` with `bossOnly: true` (`src/core/sim.js:544,753`). Source for the effect: Wowhead: "a shell around the boss that reduces all damage dealt by 99%": https://www.wowhead.com/classic/guide/cthun-temple-of-ahnqiraj-strategy
- Change, adding two actions because a shield runs on its own `duration`:
```json
"carapace":  { "label": "Carapace of C'Thun", "kind": "shield", "cast": 0, "duration": 60, "reflectDamage": 0, "roles": "dps", "bossOnly": true, "toast": "Carapace up: hit the tentacles, not C'Thun", "hidden": true, "warn": false, "cue": null, "icon": "aggro", "requires": "grounded", "tip": "99% damage reduction until both Flesh Tentacles die." },
"carapace2": { "label": "Carapace of C'Thun", "kind": "shield", "cast": 0, "duration": 45, "reflectDamage": 0, "roles": "dps", "bossOnly": true, "toast": "Carapace back up: hit the tentacles", "hidden": true, "warn": false, "cue": null, "icon": "aggro", "requires": "grounded", "tip": "99% damage reduction until both Flesh Tentacles die." }
```
  - `phases[1].actions`: add `{ "id": "carapace", "first": 0.1 }`. `phases[4].actions`: add `{ "id": "carapace2", "first": 0.1 }`.
  - `continuousMetrics.attacksIntoShield`: `{ "label": "Attacks into the Carapace", "unit": "count", "penaltyPerUnit": 1, "severe": 4, "roles": "dps", "tip": "C'Thun takes 99% less damage with the Carapace up. Hit tentacles." }`
  - Delete that sentence from `notes`. Fix E1 at the same time, or the UI will say "stop attacking" while tentacles need killing.

### CT-2. The beam is taught as a run-out (medium)
- Field: `actions.eyeBeam.tip`, `actions.eyeBeamP2.tip`, `roles.melee.description`, `roles.ranged.description`, `roles.healer.description`, `phases[0].expectations[id=beamSpread]`
- Script: `"Run to the marker."`, `"Run the beam away from everyone when it lands on you."`, `"Run your own beams out"`.
- Sources: every guide prescribes standing spread in advance. Wiki: "spreading out is key". Wowhead: "ensuring an even distribution of players at max distance from one another". Warcraft Tavern: "spread out 10 yards from each other". None tells a target to run. Eye Beam is a 2 s cast with a chain radius of roughly 10 yd (https://www.wowhead.com/classic/spell=26134/eye-beam , https://warcraft.wiki.gg/wiki/C'Thun_(tactics) ), and 2 s at 7 yd/s is 14 yd. Running risks closing on someone else. No source states "do not run", hence medium.
- Change the words (the marker itself is E2):
  - `eyeBeam.tip`: `"The Eye is casting at you. If you already hold ten yards, stay where you are. Move only if someone is inside the circle, and never toward another player."`
  - Same text for `eyeBeamP2.tip`, with "The Giant Eye" as the subject.
  - In the three role descriptions, replace the run phrasing with `"Hold your ten-yard spacing; if a beam lands on you, step away only if someone is inside the circle."`
  - `beamSpread.label`: `"Keep ten yards when the beam lands"`; `tip`: `"Spacing is set before the beam, not during it. If anyone is inside the circle when it goes off, it chains."`

### CT-3. The ten-yard rule cannot be met at the assigned spots (high)
- Field: `positions.raidSpot.spread` (40), `actions.eyeBeam.radius` (8), `phases[*].expectations[id=rangedRing]`, `phases[0].expectations[id=beamSpread]`
- Answer to "can the raid keep 10 yd spacing at the assigned spots": between the five role spots, yes (closest pair `meleeRing` to `rangedSpot`, 11.4 yd). Against the ghost raid, no. Sampling the `createRaid` logic over 20,000 runs (10 melee dots flanking at `meleeFlankDistance`, 30 uniform in a 40 yd disc):

| Spot | Raid dot within 8 yd | Within 10 yd | Mean nearest dot |
|---|---|---|---|
| `tankRing` | 70.8% | 85.8% | 6.4 yd |
| `meleeRing` | 71.2% | 85.8% | 6.2 yd |
| `rangedSpot` | 71.0% | 85.9% | 6.4 yd |
| `healerSpot` | 70.8% | 85.7% | 6.4 yd |
| `otRing` | 70.6% | 85.6% | 6.2 yd |

- So a player standing correctly usually fails `chainedBeams`, and `"Stay on your spot, ten yards from everyone"` is unachievable. The marker only appears to solve it by sending the player somewhere else.
- A script cannot fix this (E2). Until the engine can:
  - `rangedRing.tip`: `"In the real raid this spot is ten yards from everyone. The sim's raid is scattered, so the circle may catch someone even when you are right."`
  - Add to `notes` that `chainedBeams` is inflated by random dots, and lower `continuousMetrics.chainedBeams.penaltyPerUnit` from 1.5 to 0.5.

### CT-4. Dark Glare always sweeps the same way (medium)
- Field: top-level `glareLanes0..8`, `actions.glare0..8`, `phases[0].actions[id=glare*]`
- Script: south, through east, to north, every time.
- Sources: wiki: "clockwise or counterclockwise 180 degrees". cmangos (emulator): `urand(0, 1) ? SPELL_ROTATE_360_LEFT : SPELL_ROTATE_360_RIGHT`, stepping pi/35 per tick. The 180 degrees and the 40 s are otherwise right.
- Computed effect: `rangedSpot`, `otRing` and `gClawTank` are never touched by any lane, so `glareDodge` always passes for ranged and the off-tank. `tankRing` is only hit by lane 8, `meleeRing` by lane 0, `healerSpot` by lane 1.
- Change: mirror the second sweep. `glare0..8` keep their `first` values but lose `every`. Add `glareM0..8` copied from `glare0..8` with `lanes` pointing at new top-level lane sets, scheduled at `first: 134 + 4.4 * i`:
```json
"glareLanesM0": [{"id":"glareM0","from":[0,-10],"to":[0,-58]}],
"glareLanesM1": [{"id":"glareM1","from":[-3.4,-9.4],"to":[-19.8,-54.5]}],
"glareLanesM2": [{"id":"glareM2","from":[-6.4,-7.7],"to":[-37.3,-44.4]}],
"glareLanesM3": [{"id":"glareM3","from":[-8.7,-5],"to":[-50.2,-29]}],
"glareLanesM4": [{"id":"glareM4","from":[-9.8,-1.7],"to":[-57.1,-10.1]}],
"glareLanesM5": [{"id":"glareM5","from":[-9.8,1.7],"to":[-57.1,10.1]}],
"glareLanesM6": [{"id":"glareM6","from":[-8.7,5],"to":[-50.2,29]}],
"glareLanesM7": [{"id":"glareM7","from":[-6.4,7.7],"to":[-37.3,44.4]}],
"glareLanesM8": [{"id":"glareM8","from":[-3.4,9.4],"to":[-19.8,54.5]}]
```
  The mirrored lane 1 covers `rangedSpot` (0.7 yd off its centre line), so ranged then has a real dodge. The real start direction follows the Eye's current target, which the engine cannot express.

### CT-5. Tanks are sent into the stomach (medium)
- Field: `phases[2].spots`, `phases[5].spots`, `phases[2].expectations[id=stomachIn]`, `phases[5].expectations[id=stomachIn2]`, `actions.digestiveAcid`
- Script: all roles walk to `stomachSpot`; `stomachIn` has no role filter and its tip says `"Stay on them."`, while `digestiveAcid.tip` says to leave before ten stacks.
- Sources: Wowhead: "If a tank is devoured into C'thun's stomach, they should immediately leave". Warcraft Tavern: tanks "should leave right away because they aren't needed inside", and casters should make up most of the group.
- Change:
  - In `phases[2].spots` and `phases[5].spots`: `"tank": "tankRing"`, `"offtank": "otRing"`.
  - `stomachIn` and `stomachIn2`: add `"role": ["melee","ranged","healer"]`. `stomachIn.tip`: `"Both die for the Carapace to break. Stay on them until around ten stacks, then leave."`
  - Add to both phases: `{ "id": "tankOut", "type": "playerAtSpotBy", "spot": "tankRing", "grace": 4, "role": "tanks", "label": "Tanks leave the stomach at once", "tip": "Tanks are not needed inside. If you are eaten, get out between the Flesh Tentacles and back to the surface." }`, and a matching `otOut` on `otRing` for `offtank`.
  - `actions.digestiveAcid`: add `"roles": ["melee","ranged","healer"]`.

### CT-6. The main tank has no Claw job in Phase 1 (low)
- Field: `actions.clawA..clawD.pickup`, `phases[0].expectations[id=claw_clawA]`, `phases[0].expectations[id=claw_clawC]`
- Script: default `offtank`, so the main tank role only stands on a spot for 180 s. This is the role with no real decision here.
- Sources: Wowhead: "a Tank should pick them up right away".
- Change: `"pickup": ["tank","offtank"]` on the four Claws, and `"role": ["tanks","offtank"]` on the two expectations.

---

## What the research files got wrong or left open

| File | Item | Correction |
|---|---|---|
| `sartura.md` | "Cadence unknown" for aggro resets; "Counter: Taunt..." | Two of the file's own sources tie resets to Whirlwind (Warcraft Tavern, TenTonHammer). See SA-1. |
| `sartura.md` | "Interval between Whirlwinds: not found in any source" | cmangos (emulator): 20 to 25 s cast to cast. |
| `skeram.md` | "No cadence recorded anywhere" for True Fulfillment; Arcane Explosion cadence unknown | cmangos (emulator): TF every 20 to 30 s, on `ATTACKING_TARGET_NEAREST_BY, 1`, which supports "closest non-tank"; Explosion 8 to 18 s, and only with 5+ in melee. |
| `fankriss.md` | Open: whether Entangle spawns hatchlings; Mortal Wound cadence unknown | cmangos (emulator): every Entangle summons that alcove's hatchlings, all three alcoves only at combat start; Mortal Wound every 7 to 14 s. This conflicts with the wiki's "each tunnel" per wave; the script follows the wiki and I left it. |
| `bug-trio.md` | "Berserker Charge... Vem not listed" | cmangos (emulator) uses spell 26561 for Vem, targeting players out of melee range. Great Heal is self-only there; the wiki says she also heals others. |
| `ouro.md` | "~20 Scarabs spawn at the emerge point" | Wowhead guide: "in a random area". cmangos (emulator): from roaming Dirt Mounds. Submerge is 90 s in cmangos against 180 s in BigWigs and DBM; keep the boss-mod value. |
| `viscidus.md` | Melee hits to shatter (100 BigWigs, ~75 wiki) | Data point: cmangos (emulator) crack 50, shatter 100, explode 150. Suicide threshold there is 10%, wiki 5%. |
| `huhuran.md` | Wyvern Sting damage | Natural expiry also deals about 500 Nature, per cmangos (emulator) comment. |

---

## Engine limitations no script change can fix

- **E1. `shield` with `bossOnly` still says stop attacking.** `src/core/sim.js:1085` sets `holdAttack` from `shieldUp()` alone and `sim.js:890` returns "Shield up: stop attacking" before the kill-priority line at `sim.js:893`. With CT-1 applied, the UI tells players to stop exactly when Eye Tentacles need killing. The fix is small: when `state.shieldBossOnly` and the current `attackTarget` is an add, neither should apply.
- **E2. Raid dots have no formation.** `createRaid` (`src/core/entities.js:217`) places random offsets in a disc, and a `carried` hazard always raises `runOutPoint` with a "Run out of the raid!" toast (`sim.js:617`). "Hold your spot, you are already spread" cannot be expressed. A `formation` or minimum-spacing option on the raid spot would fix CT-2 and CT-3 together.
- **E3. Activity scoring ignores metric phase filters.** `scoring.js:84` uses `dpsIdle` and `outOfRange` regardless of a metric's `phases`. A phase where melee is meant to stay away (Viscidus poison) zeroes their expectation points, and only the fight-wide `grading.fullActivity` can soften it. A per-phase exemption would allow VI-2 to be modelled properly.
- **E4. One boss object.** Twin Emperors' Vek'lor is a labelled add and the ranged role's damage cannot go to the right brother. Bug Trio cannot hold three live bugs, Heal Brother cannot be simulated, and Yauj's heal cannot target another bug.
- **E5. Adds cannot deal damage or fire on expiry.** Fankriss's worm Berserk, Ouro's Scarab bites, Claw Tentacle melee and Mutated Bugs are all shown without their damage.
- **E6. Dispel cannot choose a target.** Huhuran's central healer rule (dispel Wyvern Sting on tanks only) is forced by making the raid's sting undispellable, so there is no decision to practise.
- **E7. No "closest player" targeting.** Skeram's True Fulfillment and Huhuran's 15-closest Poison Bolt need `playerChance` and radius stand-ins.
- **E8. No individual relocation.** Only the tank can be teleported, so Fankriss's Entangle and C'Thun's Devour cannot move a non-tank.
- **E9. Boss-only `aoe` radius.** Radii measure from the boss, so Skeram's images use a room-wide `aoe`.

---

## Could not verify

- Classic Era values for anything labelled "Seasonal 40 Player" on Wowhead. Tentacle HP gaps stand as `cthun.md` lists them.
- Whirlwind cast-to-cast timing has one emulator source and no boss-mod timer (SA-2).
- That Viscidus is untauntable rests on the wiki and `viscidus.md` only; no spell or log data was fetched.
- Vem's Berserk when last alive has a single source (BT-1).
- Dark Glare's beam width, because spell 26029 was not fetched within budget. The 12 yd lanes are unconfirmed.
- Warcraft Logs and Icy Veins, per `README.md`, and Wowhead comment sections.
