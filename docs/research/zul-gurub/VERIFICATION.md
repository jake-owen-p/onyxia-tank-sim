# Zul'Gurub encounter scripts: independent verification

Checked against docs/ENCOUNTER_FORMAT.md, all 13 research files, the current engine (src/core), and a second research pass. Only disagreements, gaps and misleading modelling are listed. Confidence is about the finding, not its severity.

Method notes:
- Timers come from the boss mods, which are built from real combat logs: DBM-Raids-Vanilla (`DBM`) and BigWigs_Classic (`BW`). cmangos is an emulator reconstruction and is labelled as such.
  - DBM: https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/VanillaZG/ (files: Hakkar, Bloodlord [Mandokir], Jeklik, Venoxis, Marli, Thekal, Arlokk, Gahzranka, Jindo, EdgeOfMadness .lua)
  - BW: https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/ZulGurub_Classic/ (same bosses, Mandokir.lua)
  - cmangos: https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/
  - Wowhead guides and spell pages via https://r.jina.ai/ (cited by their wowhead.com URL below).
- Every engine claim and proposed patch was exercised in memory against src/core with the role bots; no script was changed. Geometry was computed from `positions` with `bossRangeTo = dist - boss.radius` (sim.js:135).
- All 13 scripts have every position on the floor.

---

## Jeklik

### JK1 (high): Great Heal cadence is too fast
- Field: `phases[1].actions[greatHeal]`, `phases[2]`, `phases[3]`
- Script: `first 10 / 12 / 12, every 17, jitter 2`
- Sources: DBM Jeklik.lua `timerHealCD = NewNextTimer(20, 23954)`; BW Jeklik.lua `CDBar(23954, 22)` on the transform and `CDBar(args.spellId, 20.5)` after each cast.
- Change: P2 `first 22, every 20.5, jitter 1`; P3 `first 18`, P4 `first 14`, both `every 20.5, jitter 1`. The P3 and P4 offsets continue the cycle across the 45 s phase boundaries.

### JK2 (medium): Curse of Blood is a 2 s interruptible cast with almost no effect
- Field: `actions.curseOfBlood`
- Script: instant `debuff`, `every 20`, `damageTakenMult 1.25`, tip says "much more physical damage".
- Sources: BW Jeklik.lua logs `SPELL_CAST_START` for 16098 and labels it "(Interruptible)", `CDBar(args.spellId, 21)`. https://www.wowhead.com/classic/spell=16098 lists a 2 s cast, 20 yd range, "Increases the Physical damage taken by nearby enemies by 2 for 10 min".
- Change: `cast: 2, interruptible: true, every: 21, jitter: 1, damageTakenMult: 1.05`. Tip: "A 2 s cast. Interrupt it after Great Heal, and decurse if it lands."

### JK3 (medium): Mind Flay is scripted as not interruptible
- Field: `actions.mindFlay`
- Script: instant 3 s DoT, no `interruptible`. Notes justify this by the single interrupt.
- Sources: BW Jeklik.lua labels 23953 "(Interruptible)". https://www.wowhead.com/classic/guide/high-priestess-jeklik-zul-gurub-strategy: "Both spells need to be interrupted, with Great Heal taking priority".
- Change: `cast: 3, interruptible: true`. A `debuff` with a cast only lands if the cast completes, so an interrupted Flay does nothing. With a 10 s cooldown against casts about 15 s and 20.5 s apart, spending the kick is a real choice. Tip: "Great Heal first, this second."

### JK4 (low): Charge range in the tip
- Field: `actions.charge.tip` "between 8 and 25 yd".
- Sources: Wowhead Jeklik guide says minimum 8, maximum 40 yd; DBC per jeklik.md says 8 to 25.
- Change: none needed for play. If the tip stays numeric, write "at range" instead.

---

## Venoxis

### VX1 (high): Healer spot is out of healing range in snake form
- Fields: `positions.healerSpotSnake` (33,21); `phases[1..4].spots.healer`.
- Measured: P2 and P5 (boss 13,22, tank 20,24): healer is 16.0 yd from the boss edge and 13.3 yd from the tank, inside the 30 yd the role is told to stay beyond. P3 (boss -13,22, tank -20,24): 53.1 yd from the tank. In a bot run the healer sat 58.8 yd from the tank in P3 and P4. `heal` enforces 40 yd (sim.js:766), so the role cannot heal there.
- Change: replace with one spot per boss location. All three are on the floor, over 30 yd from the boss edge and within 40 yd of the tank:
  - Add `healerSpotSnakeB {x:13,y:-13,tolerance:6}` for P2 and P5 (31.0 yd from the boss edge, 37.7 from the tank).
  - Add `healerSpotSnakeC {x:-13,y:-13,tolerance:6}` for P3 (same distances).
  - Add `healerSpotSnakeD {x:0,y:-9,tolerance:6}` for P4 (30.7 and 37.0).
  - Tested with the healer bot: the fight stays clear (score 99); the only moments past 40 yd are the walks between spots at phase changes.

### VX2 (high): Melee are told to go to him in troll form
- Field: `roles.melee.description`
- Script: "Kill the Cobras one at a time, then go to him."
- Sources: https://www.wowhead.com/classic/guide/high-priest-venoxis-zul-gurub-strategy: "Melee DPS will not be DPSing Venoxis during Phase 1 at all, or else it will risk a wipe. Melee DPS will instead be with Ranged at a distance".
- Change: "Kill the Cobras one at a time and stay off him until he turns into a snake at 50%. Holy Wrath bounces through melee. Interrupt Holy Fire. In snake form step out of the clouds and keep hitting." The `killFirst` cobras already keep melee on the adds through P1 (spawns at 6, 34, 62, 90 with 34 s lifetimes), so no spot change is needed.

### VX3 (high): "Over 30 yd" ranged spot is inside 30 yd
- Field: `positions.rangedSpotSnake` (-2,-8), label "Ranged, over 30 yd in snake form".
- Measured: 29.5, 28.0, 29.4 and 29.5 yd from the boss edge in P2 to P5.
- Change: move to `{x:0,y:-14,tolerance:9}`. That is 34.3 yd from the edge at bossSpotB and C and 35.6 at bossSpotD, all inside the 36 yd `attackRange`.

### VX4 (medium): Poison Cloud lasts 10 s
- Field: `actions.poisonCloud.active`
- Script: 12.
- Sources: DBM Venoxis.lua `NewBuffActiveTimer(10, 23861)`; DBC per venoxis.md is also 10 s.
- Change: `active: 10`. Remove the sentence in `notes` calling 12 a compromise.

---

## Mar'li

### ML1 (low): Enlarge is absent
- Field: no action. DBM Marli.lua has a dispel warning for Enlarge (24109) on the Spawn.
- Change, optional: add a Magic `debuff` proxy like Venoxis's `renew` (`target: random, playerChance: 0, dispel: magic`) during troll form, with an `afterEvent` `noDispellable` expectation for the healer.

### ML2 (low): Healer is at the edge of range
- Fields: `positions.healerSpot` (34,10) `tolerance 6`, `tankSpot` (0,30).
- Measured: 39.4 yd nominal, so 45 yd is possible while still "at the spot".
- Change: `tolerance: 2`, or move to (34.5,16), which is on the floor, 31.0 yd from the boss edge and 37.2 yd from the tank.

---

## Thekal

### TH1 (low): Length of the kill window
- Field: `phases[1].duration` 10.
- Sources: DBM Thekal.lua starts `NewTimer(15, "TimerSimulKill", 24173)` on the first death emote. cmangos (emulator), wiki and Wowhead say 10 s.
- Change: keep 10, and state in `notes` that DBM shows a 15 s bar. Not settled by these sources.

---

## Arlokk

### AK1 (high): Vanish timeline is wrong
- Fields: `phases[0]` duration 60; Vanish phases 20 / 18 / 15 s; three vanishes.
- Sources: DBM Arlokk.lua: first Vanish `v33.7-34.4` s after the pull, hidden `v43.7-61.5` s, next Vanish `v65-70` s after she returns, comment "rare for Arlokk to vanish more than once". cmangos (emulator) `ResetTimer(ARLOKK_INVIS_TIMER, 50000)`: 50 s hidden.
- Change: P1 troll 34 s (100 to 88%); Vanish 50 s (88% held); Panther 20 s (88 to 80%); Troll 46 s (80 to 45%); Vanish 50 s (45% held); Panther 20 s (45 to 35%); Troll 30 s (35 to 0%). Delete the third cycle. `panthersVanish` `every: 12` in the 50 s phases, which keeps 4 waves of 8 under the real cap of 40.

### AK2 (high): Gouge and its stun are scheduled independently
- Fields: `phases[*].actions` entries for `gouge` and `gougeStun` (each has its own jitter); drills `gougeDrill` and `painDrill`.
- Measured: in a run the stun fired 1.4 to 5 s away from the target switch (for example gouge at 57.5, gougeStun at 52.5). The tank can be stunned while the boss is still on them, or be free before she turns.
- Change: `actions.gouge.follow: [{"id":"gougeStun","delay":0}]`; remove `gougeStun` from every phase's `actions` and from `gougeDrill`.

### AK3 (low): Whirlwind is one hit
- Field: `actions.whirlwind` `damage 954`, tip "954 a tick".
- Sources: arlokk.md: 2 s channel ticking each second, +954 per tick (wiki).
- Change: `damage: 1900`, or change the tip to "about 1,900 in total".

---

## Bloodlord Mandokir

### MK1 (high): Threatening Gaze has no consequence, and the engine can now score it
- Field: `actions.threateningGaze`; `notes` says "the engine has no hook to punish a player for acting during a debuff". That is out of date.
- Sources: engine `forbidAbilities`, `breakMetric`, `breakDamage` (sim.js:712). https://www.wowhead.com/classic/guide/bloodlord-mandokir-zul-gurub-strategy: "stop everything ... Bloodlord will charge them (and likely kill them)". Guillotine is weapon +7,500 per DBC, about 15,000 per wiki.
- Change: add to the action `"forbidAbilities": true, "breakMetric": "gazeBroken", "breakDamage": 12000`. Add `continuousMetrics.gazeBroken: {"label":"Actions while watched","unit":"count","penaltyPerUnit":30,"severe":1,"tip":"Stop everything for the 6 s of the Gaze."}` and a `continuous` expectation on it in each phase. Tested: works, and a bot that stops pressing while watched scores 95 to 100. See the bot note under Engine limitations, which this change depends on.

### MK2 (medium): Gaze tip says to stop moving
- Field: `actions.threateningGaze.tip` "Stop moving, stop casting, stop everything".
- Sources: cmangos (emulator) punishes only a rise in the target's threat during the 6 s; Wowhead says "any actions". Neither mentions movement as a trigger.
- Change: "Stop attacking, casting and healing for 6 s. Anything that makes threat gets you charged and killed. Walking is safe."

### MK3 (low): "Maximum range" spot is inside the Charge band
- Fields: `roles.ranged.description`, `positions.rangedSpot` (-2,-10).
- Measured: 29.5 yd from the boss edge. Wowhead gives Charge as 8 to 30 yd; DBC per mandokir.md gives 40 yd max, in which case no ranged position escapes it.
- Change: move to `{x:-3,y:-16,tolerance:9}` (35.6 yd from the edge, inside the 36 yd attack range).

### MK4 (low): Healer told to do something the role cannot do
- Field: `roles.healer.description` "keep the Charge bait alive".
- The `heal` button heals the tank only.
- Change: drop that clause, or say "the bait is a ghost; in the real fight one healer is assigned to them".

---

## Gahz'ranka

### GZ1 (medium): Massive Geyser is modelled around the boss instead of under a player
- Field: `actions.massiveGeyser` (`knockback`, `radial: true`, `knockbackRange 25`).
- Sources: gahzranka.md and DBC 22421: lands under a player within 40 yd and hits 10 yd around it. https://www.wowhead.com/classic/guide/gahzranka-zul-gurub-strategy confirms the knock-up and that tanks rebuild aggro every Geyser, so the threat drop stays.
- Measured: `rangedSpot` is exactly 25.0 yd from the edge, so ranged are hit at nominal position and healers (21.7) always are. Staying near him does not decide it in the real fight.
- Change: `{"kind":"hazard","placement":"random","count":1,"playerChance":0.35,"radius":10,"warning":2,"active":0.5,"damage":463}`, keeping `follow: geyserThreatDrop`. `playerInHazard` is already scored. Stepping out is the real footwork; the knock-up itself has no engine equivalent.

---

## Jin'do the Hexxer

### JD1 (high): Brain Wash Totems appear far too rarely
- Field: `phases[0].actions[brainWashTotem]` `first 50, every 45`; `phases[1]` `first 40, every 42`.
- Sources: DBM Jindo.lua `NewVarTimer("v11.3-26.2", 24262)`, first cast `v11.3-30.9`.
- Change: both phases `first: 20, every: 19, jitter: 7`. Cut `actions.brainWashTotem.lifetime` and `heldLifetime` from 18 to 8, or with `killFirst` a totem is up almost constantly and Jin'do can never be attacked. Real totems die in seconds.

### JD2 (high): Two Shades spawn per curse
- Field: `actions.shade` `count 1, from ["shadeSpotA","shadeSpotB"]`. `count` is per spot (entities.js).
- Sources: https://www.wowhead.com/classic/guide/jindo-the-hexxer-zul-gurub-strategy: Shades spawn when someone is afflicted; jindo.md: one per cursed player.
- Change: `from: ["shadeSpotA"]`, or two actions alternated by the phase schedule.

---

## Hakkar the Soulflayer

### HK1 (high): The poison trick is still a workaround
- Fields: `actions.poisonCloud`, `actions.siphonPoison`, `notes`.
- Script: `safeSpots: ["cloudSpot"]` approximation. `notes` says "the engine ... a hazard cannot apply a debuff to whoever stands in it". Out of date.
- Sources: engine `applies`, `safeIfDebuff`, `seekLead` (sim.js:186, 1044; ideal.js:159).
- Change:
  1. Add `actions.poisonousBlood: {"label":"Poisonous Blood","kind":"debuff","cast":0,"target":"player","dispel":"none","duration":90,"tickDamage":33,"warn":false,"cue":null,"icon":"dispel","requires":"grounded","tip":"The Son's cloud. It lasts 90 s. Do not let it be cleansed before the Siphon."}`. `dispel: "none"` because the stock healer bot would otherwise press Dispel and lose points.
  2. `actions.poisonCloud`: add `"applies":"poisonousBlood"`, set `active: 13`, and in P1 to P6 change `first` from 81.7 to 77.5.
  3. `actions.siphonPoison`: add `"safeIfDebuff":"poisonousBlood","seekLead":12`. Keep `safeSpots` so the marker still walks people during the 8 s cast. Set `first: 81.5` in P1 to P6 so the cast does not end exactly on the 90 s boundary (see Engine limitations).
  4. Rewrite the `notes` sentence.
- Tested in memory: melee, ranged, healer and off-tank all carry the debuff into every Siphon (`siphonUnpoisoned` 0); scores 94 to 100.

### HK2 (high): Cause Insanity cadence
- Field: `phases[*].actions[causeInsanity]` `first 18, every 26, jitter 3`.
- Sources: DBM Hakkar.lua `NewCDTimer(21, 24327)`, first `v20.7-22.7`; BW Hakkar.lua `Bar(24327, 20)`, `CDBar(args.spellId, 20)`.
- Change: `first: 21, every: 21, jitter: 1` in all phases.

### HK3 (high): Cause Insanity lasts 10 s, not 8
- Fields: `actions.causeInsanity.duration` 8; `actions.insanityStun.duration` and `.stun` 8; `roles.tank.description` "for 8 s"; expectation tips; `actions.insanityStun.tip`.
- Sources: DBM `NewTargetTimer(10, 24327)`; BW `TargetBar(args.spellId, 10, ...)`; hakkar.md DBC 24327 is 10 s.
- Change: set all three durations to 10, change the "8 s" texts to "10 s", and set `insanityBack*.within: 12`.

### HK4 (low): Enrage is 585 s or 600 s
- Field: `phases[6].actions[enrage].first` 60 (t = 600 s).
- Sources: DBM `NewBerserkTimer(585)`; BW `Berserk(600)`; guides say 10 minutes.
- Change: none yet. If DBM is trusted, use `first: 45` (585 s).

### HK5 (medium): Sons always come from one side
- Field: `actions.sonOfHakkar.from` `["sonLeft"]`. `sonRight` is defined and unused.
- Sources: hakkar.md and Wowhead Hakkar guide: both stair platforms, alternated by the hunter.
- Change: add a copy `sonOfHakkarR` with `from: ["sonRight"]` and use it in P2, P4 and P6 (remembering to update the `grabSon*` expectation events and the `grabSonCue` cue).

---

## Gri'lek

### GR1 (high): Avatar's damage uses a workaround the engine no longer needs
- Field: `actions.avatarFrenzy` (a `debuff` with `damageTakenMult 1.8`); `notes` "the engine's enrage flag cannot be turned off". Out of date.
- Sources: engine `enrage` with `duration` (sim.js:543). DBM EdgeOfMadness.lua `timerKite = NewBuffActiveTimer(15, 24646)`.
- Change: `actions.avatarFrenzy: {"label":"Avatar","kind":"enrage","cast":0,"duration":15,"warn":false,"cue":null,"icon":"roar","requires":"grounded","hidden":true,"toast":"Avatar: he hits five times harder","tip":"Avatar: +500% damage for 15 s. Do not be near him."}`, `boss.enrageMultiplier: 3`. Tested, all roles still clear at 95 to 100. Update `notes`.

### GR2 (high): The tank is taught to hold him through Avatar
- Fields: `roles.tank.description`; expectations `avatarTaunt2/4/6` "Hold him through the Avatar"; the Taunt cue and drill text.
- Sources: https://warcraft.wiki.gg/wiki/Gri%27lek_(Classic) "he is immune to taunt", "wipe all previously accumulated threat", "movement is dramatically slowed"; https://www.wowhead.com/classic/guide/edge-of-madness-zul-gurub-strategy "everyone needs to run away from Gri'lek"; DBM `specWarnKite` "keepmove".
- Change:
  - Delete `avatarTaunt*`. In Avatar phases set `spots.tank` to a new position `avatarKiteSpot {x:-22,y:8,tolerance:6,label:"Back off"}` and add `{"type":"playerAtSpotBy","id":"backOff2","spot":"avatarKiteSpot","grace":3,"role":"tank","label":"Back off, do not try to hold him","tip":"He is taunt-immune and hits five times harder. Walk away and wait for him to shrink."}` (repeat for phases 4 and 6).
  - `roles.tank.description`: "Tank him between Avatars. When he grows, the table wipes and he is taunt-immune: back off and keep clear for 15 s, then pick him up when he shrinks. (Here Taunt stands in for rebuilding threat.)"

### GR3 (high): `backNormal*` expectations can never fire
- Fields: `phases[2].expectations[backNormal3]`, `phases[4]`, `phases[6]`, all `event: "avatarWipe"`.
- Measured: `avatarWipe` fires only in the Avatar phases, so these expectations never spawn. The pickup after Avatar is unscored.
- Change: add `{"id":"avatarWipe","first":0.2}` to phases 3, 5 and 7, so the shrink wipes the table and the tank must take him back. Say in the tip that Taunt stands in for rebuilding threat.

### GR4 (medium): Avatar uptime is about half the fight
- Fields: Normal phases of 30 s, Avatar phases of 15 s (33% uptime).
- Sources: Gri'lek wiki: "Half of the time ... The other half of the time he uses his unique special ability".
- Change: shorten Normal phases to 18 to 20 s, and rescale `hpFrom`/`hpTo` over 5 to 6 Avatar cycles.

---

## Renataki

### RN1 (high): Gouge length
- Field: `actions.gougeAll.stun` 3; its own tip says 4 s.
- Sources: DBC 24698, 4 s (edge-of-madness.md).
- Change: `stun: 4`.

### RN2 (low): Enrage threshold is estimated
- Field: `phases[7]` at 25%.
- Sources: https://warcraft.wiki.gg/wiki/Renataki gives 30%, but that page is the later version of the boss. No Classic source found.
- Change: keep 25% and keep the existing note.

---

## Hazza'rah, Wushoolay
No disagreements beyond the items under Engine limitations and Could not verify.

---

## Research file corrections
- jeklik.md: Curse of Blood is listed as 24673 with +500 physical. The encounter spell is 16098 (BW) with a 2 s cast and "+2" on its tooltip. The note calling the wiki's "by 2" a transcription issue was wrong. "No cadences" also missed Great Heal (20 to 20.5 s, DBM and BW).
- venoxis.md: the enrage is 8269 at 20% (BW), not 23537. Poison Cloud persistence: DBM's 10 s bar supports the DBC value over Wowhead's "remainder of the fight".
- jindo.md: Hex is 17172 (DBM, BW), not 24053 (same 5 s Magic effect). Brain Wash Totem has a log-based timer (DBM).
- arlokk.md: first Vanish is about 34 s (DBM), not about 1 minute; hidden 44 to 61 s.
- hakkar.md: Cause Insanity CD is about 20 to 21 s (DBM, BW), which settles the 10 to 25 s spread in that file.
- edge-of-madness.md: BW tracks Lightning Cloud as 26550; the file lists only 24683/25033.
- README.md "Cross-boss open questions" says only a few cadences exist; the boss mods supply several more.

## Engine limitations no script change can fix
- Boss HP is a fixed clock, so no heal can land: Great Heal (Jeklik, Lor'Khan), Renew, Drain Life, Powerful Healing Ward, Blood Siphon feeding and damaging Hakkar.
- No taunt immunity. Hakkar and Gri'lek are taunt-immune; Taunt stands in for threat rebuilding. Hakkar's "next tank on threat holds him" cannot be expressed.
- No root (Gri'lek's Entangling Roots uses a 2 s `stun`, which wrongly stops casting). No mana (Hazza'rah and Wushoolay drains, Chain Burn). No player teleport (Jin'do Banish).
- One `enrageMultiplier` per boss. The debuff workarounds for Mandokir's Enrage and Thekal's 20% Enrage should stay, because those bosses need two different multipliers.
- Schedule replaced at phase entry: `enterPhase` calls `buildSchedule`, so a pending `follow` is lost if it straddles a phase boundary. Hakkar's Siphon currently works only because its 8 s cast ends one tick after the boundary. HK1 step 3 moves it clear.
- `tests/helpers.js` `roleBot` does not stop pressing under `forbidAbilities`. With MK1 applied, the stock melee, ranged and healer bots break the Gaze and die 1 to 3 times, which fails `validate.mjs`. One line in the bot is needed: return early when `state.debuffs.some((d) => d.on === 'player' && d.forbidAbilities)`.

## Could not verify
- Venoxis Holy Fire's target rule (`target: tank`, single 2005 source). DBM only shows it lands on players.
- Gahz'ranka's Frost Breath spell: BW tracks 21099 (5 s slow, 30 yd), DBM tracks 16099 (research: 10 s). The script's 10 s tip may be wrong.
- Wushoolay's Lightning Cloud: BW 26550 (657 to 843 every 3 s), DBM and warcraftdb 24683 (875 every 5 s). The script's 200 per second sits between them.
- Exact cadences for most non-timed abilities (Sonic Burst, Charge, Delusions, Healing Ward, Corrupted Blood, Force Punch): no boss mod times them, so the script estimates stand. Warcraft Logs was not reachable.
