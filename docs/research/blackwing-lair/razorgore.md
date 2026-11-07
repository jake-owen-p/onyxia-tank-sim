# Razorgore the Untamed (Blackwing Lair)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Razorgore_the_Untamed — egg count (~30), MC channel 90 s, Mind Exhaustion, add caps (40 orcs + 12 dragonspawn), first wave 45 s (was 30 s pre-6.0.3), P2 ability text, death-in-P1 wipe, taunt immunity, controller on top of threat.
- https://classicdb.ch/?npc=12435 — Razorgore HP 449,685, melee 15,715–18,235, armor 4,641, ability list (Destroy Egg 19873, Calm Dragonkin 19872, Cleave 19632, Fireball Volley 22425).
- https://classicdb.ch/?npc=12557 — Grethok the Controller: level 59–60, HP 60,777–64,407, Greater Polymorph, Dominate Mind, Slow, Arcane Missiles.
- https://classicdb.ch/?npc=12416 — Blackwing Legionnaire: level 60, HP 8,827, Cleave (15284), Dragonbane (23967), Strike.
- https://classicdb.ch/?npc=12420 — Blackwing Mage: level 60, HP 6,993, Arcane Explosion (22271), Fireball (17290).
- https://classicdb.ch/?npc=12422 — Death Talon Dragonspawn: level 60, HP 38,411, Cleave, Strike, Dragonbane.
- https://classicdb.ch/?spell=19873 — Destroy Egg: 10 yd, 3 s cast, 7 s cooldown.
- https://classicdb.ch/?spell=19872 — Calm Dragonkin: 60 yd, instant, sleeps a dragonkin 30 s.
- https://classicdb.ch/?spell=23014 — Possess: Razorgore takes +200% damage while controlled.
- https://classicdb.ch/?spell=23958 — Mind Exhaustion: 60 s, "unable to use the Orb of Domination".
- https://classicdb.ch/?spell=22425 — Fireball Volley: 40 yd, 2 s cast, Fire, base value 255, radius 45 yd.
- https://classicdb.ch/?spell=23023 — Conflagration: 30 yd, instant, 3000 Fire over 10 s, confuse (panic), 300 Fire/s to allies within 30 yd of the target.
- https://classicdb.ch/?spell=24375 — War Stomp: weapon damage +500, knockback, 5 s stun, 15 yd radius.
- https://classicdb.ch/?spell=19632 — Cleave: weapon damage +50, up to 10 targets.
- https://classicdb.ch/?spell=23040 — Warming Flames: heal to full (start of P2).
- https://classicdb.ch/?spell=14515 — Dominate Mind (Grethok): 2 s cast, 15 s charm, Magic dispel.
- https://classicdb.ch/?spell=23967 — Dragonbane (Legionnaire/Dragonspawn): 400% weapon damage melee strike.
- https://classicdb.ch/?spell=22271 — Arcane Explosion (Blackwing Mage): instant, base 165 Arcane, 10 yd.
- https://classicdb.ch/?spell=17290 — Fireball (Blackwing Mage): 3 s cast, 40 yd, base 255 Fire.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/blackwing_lair.cpp and blackwing_lair.h — emulator wave logic: first wave 40 s after Grethok is engaged, then every 15 s, 4 spawns per wave, caps 12 Dragonspawn / 40 orcs, adds despawn when the last egg dies; death during P1 triggers room-wide kill (spell 20037 via Fireball 23024).
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_razorgore.cpp — emulator P2 timers: Conflagration 10–15 s then 15–25 s, Fireball Volley 15–20 s, War Stomp 30 s, Cleave 4–8 s; Mind Exhaustion applied to the controller when the channel ends.
- https://github.com/BigWigsMods/BigWigs_Classic/blob/master/BlackwingLair/Razorgore.lua — adds bar 45 s from pull yell, 30 eggs counted, pull yell text, Conflagration announce.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/BWL/Razorgore.lua — adds timer 47 s, P2 trigger = Warming Flames cast.
- https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-two — 2006 strategy: four kite groups, controller abilities, Destroy Egg every 7 s, controller must break the last egg and /dance, Conflagration drops threat of everyone in front, Razorgore taunt-immune, off-tank stands behind.
- https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ — four-corner split, paladin on orb, kill mages first, MT/OT/raid triangle at 90 degrees in P2.
- https://us.millenium.gg/guide/6486.html?page=2 — P2 positioning: raid far and out of LoS for War Stomp / Fireball Volley, melee behind, off-tanks flank to pick up after Conflagration.
- https://yttrium-tyclief.github.io/sod-guides/bwl/razorgore (Season of Discovery guide) — 30 eggs, MC breaks if controller is hit, the final-egg controller inherits a huge threat lead, hunters must not Feign Death at the start of P2, Conflagration targets top threat.
- https://docs.google.com/document/d/1VT_67cPSHqvRK2_yit0QSiyzGwf9oXTKjcinxsVymoA (warlock BWL notes) — kill order mages > dragonkin > legionnaires; Razorgore's Cleave reduces tank threat; LoS the volleys behind a pillar.

## Overview
- Level ?? (boss), HP 449,685 (classicdb.ch; see Open questions), melee 15,715–18,235, armor 4,641. No enrage timer. First boss of Blackwing Lair, required. Immune to Taunt.
- Phases:
  - Phase 1 "Egg phase": the raid kills Grethok the Controller (HP ~61–64k, has Dominate Mind) and his two Blackwing Guardsmen on the orb platform, then one player clicks the Orb of Domination and possesses Razorgore. The controller walks Razorgore between the ~30 Black Dragon Eggs and casts Destroy Egg (3 s cast, 7 s cooldown, 10 yd). Adds spawn from the room's corners from ~40–47 s after the pull, then every ~15 s, until caps are reached; dead adds are replaced. Razorgore takes +200% damage while possessed and the adds attack him too; if he dies in P1 the room explodes and kills everyone.
  - Transition: when the 30th egg breaks, all adds flee and despawn (~10 s), Razorgore casts Warming Flames (heals to full), the orb shuts off, and he attacks the last controller, who is alone at the top of his threat table.
  - Phase 2 "Burn phase": a conventional tank-and-spank with Conflagration (threat-dropping panic on the top-threat player), Fireball Volley, War Stomp and Cleave.
- Raid-size assumptions: 40-man Classic Era. Season of Discovery adds an Unstable Chromatic Drake after 10 eggs and a 45 s re-control lockout (SoD guide); Season of Mastery adds ground fires. Neither applies to Era.

## Abilities

### Destroy Egg (controlled Razorgore)
- Type: other (object activation by the possessed boss)
- Target rule: one Black Dragon Egg within 10 yd of Razorgore
- Cast time: 3 s (classicdb.ch 19873; the Warcraft Wiki says the cast time was removed in 7.2.5, not relevant to Era). Interruptible only by the controller being broken out of possession.
- Cooldown: 7 s (classicdb.ch; Ten Ton Hammer "one egg every 7 seconds")
- Damage: none
- Debuff: none
- Movement effect: none
- Telegraph: cast bar on the possessed unit; raid addons count "x/30 eggs destroyed" (BigWigs).

### Calm Dragonkin (controlled Razorgore)
- Type: other (crowd control)
- Target rule: one Death Talon Dragonspawn, 60 yd
- Cast time: instant
- Cooldown: unknown
- Damage: none
- Debuff: Calm Dragonkin, 30 s sleep (stun aura), Nature school, dispel type n/a
- Movement effect: target asleep
- Telegraph: none

### Fireball Volley (also usable by the controller in P1)
- Type: AoE (room)
- Target rule: all enemies within 45 yd of Razorgore (in P1, used by the controller, it hits every add in range and pulls their aggro onto Razorgore — emergency only)
- Cast time: 2 s, not interruptible by players (boss cast)
- Cooldown: P2 first use ~15–20 s after he engages, then every 15–20 s (cmangos). BigWigs/DBM carry no timer for it.
- Damage: Fire. classicdb.ch lists base value 255 for the 60-level spell; Warcraft Wiki lists 133–154 (that figure is from the modern tooltip). Observed Era hits are low hundreds per player (see Open questions). Range 40 yd, radius 45 yd. Blocked by line of sight.
- Debuff: none
- Movement effect: none
- Telegraph: cast bar ("Fireball Volley"); DBM "move to shelter" warning.

### Conflagration
- Type: debuff / threat drop / disorient
- Target rule: the player at the top of his threat table (SoD guide, Warcraft Wiki); range 30 yd
- Cast time: instant
- Cooldown: first 10–15 s into P2, then every 15–25 s (cmangos)
- Damage: 3000 Fire over 10 s to the target (300/s); allies within 30 yd of the target are scorched for 300 Fire every 1 s while it lasts (classicdb.ch; Warcraft Wiki's modern text says 150)
- Debuff: Conflagration, 10 s, dispel type none, does not spread but the splash hits nearby allies
- Movement effect: the target is confused/panicked for 10 s and cannot act; Razorgore moves to the next player on his threat list for the duration. Ten Ton Hammer additionally reports that it removes the threat of everyone standing in front of him — treat as a threat reset on the tank.
- Telegraph: no cast bar; "You're burning!" debuff; addons announce the target.

### War Stomp
- Type: AoE knockback / stun (melee radius)
- Target rule: all enemies within 15 yd of Razorgore
- Cast time: instant
- Cooldown: ~30 s (cmangos)
- Damage: normal weapon damage +500, Physical, 15 yd radius
- Debuff: none
- Movement effect: knockback and 5 s stun
- Telegraph: stomp animation only

### Cleave
- Type: melee cone
- Target rule: current target and its nearest allies, up to 10 targets
- Cast time: instant (next melee)
- Cooldown: 4–8 s (cmangos)
- Damage: weapon damage +50, Physical
- Debuff: none
- Movement effect: none
- Telegraph: none. Warlock guide notes it also chips tank threat (unverified).

### Warming Flames
- Type: other (self heal)
- Target rule: self, once when the last egg is destroyed
- Cast time: instant
- Damage/Debuff: none; Razorgore returns to full health. This cast is what boss mods use to mark Phase 2.

### Mind Control / Possess (Orb of Domination)
- Type: mind control (player on boss)
- Target rule: the player who clicks the Orb of Domination on the platform
- Duration: the channel lasts 90 s and then drops (Warcraft Wiki); it also ends early if the controller is damaged (SoD guide; Warcraft Wiki strategy section) or presses Esc / uses /dance. When it ends the controller receives Mind Exhaustion (60 s, cannot use the orb — classicdb.ch 23958; the SoD guide says 45 s). Another player must click the orb in that window.
- Side effect: Razorgore takes +200% damage while possessed (Possess 23014).
- Telegraph: Grethok yells "Intruders have breached the hatchery! Sound the alarm! Protect the eggs at all costs!" on pull.

### Grethok the Controller — Dominate Mind
- Type: mind control
- Target rule: a random player within 20 yd
- Cast time: 2 s (interruptible)
- Debuff: Dominate Mind, 15 s, Magic (dispellable)
- Why it matters: kill Grethok first so the raid is never MC'd near the orb.

## Adds
- Grethok the Controller (HP ~61–64k) and 2 Blackwing Guardsmen on the orb platform at the start. Killed by the raid in under a minute; Grethok first because of Dominate Mind, Greater Polymorph and Slow.
- Egg-room defenders: spawn from the four room-corner spawners (two spawn points per corner per the Warcraft Wiki), first wave at 40–47 s after pull (cmangos 40 s, BigWigs 45 s, DBM 47 s, Warcraft Wiki 45 s), then a new group every ~15 s, 4 adds per wave (cmangos), until the caps: 12 Death Talon Dragonspawn and 40 orcs (Legionnaires and Mages combined); up to 52 alive at once (Warcraft Wiki). Killed adds are replaced until the eggs are gone.
  - Blackwing Legionnaire — level 60, HP 8,827, Cleave (3 targets), Strike, Dragonbane (400% weapon damage). Melee; CC-able (sheep). Kite or tank.
  - Blackwing Mage — level 60, HP 6,993, Fireball (3 s cast, 40 yd), Arcane Explosion (10 yd). Kill-first priority; interrupt Fireball.
  - Death Talon Dragonspawn — level 60, HP 38,411, Cleave, Strike, Dragonbane. Hardest-hitting; sleep with Hibernate or Calm Dragonkin, tank the rest.
- They all also attack possessed Razorgore (+200% damage taken) — keep adds away from him.
- End: when the 30th egg dies the defenders evade and despawn (~10 s). None remain for P2.

## Positioning and movement
- Tank:
  - P1: 4–6 warriors split across the four corners kite adds around the raised platforms (adds path around the platform edge when the warrior jumps down — Ten Ton Hammer). Sunder to break CC and pull aggro; Challenging Shout and Piercing Howl help. Each kiter has a priest following with light heals.
  - Transition: the designated P2 main tank should be the one controlling Razorgore when the last egg breaks (he inherits the top-threat slot; Razorgore is taunt-immune so threat cannot be fixed afterwards). He ends control with /dance as the egg dies and starts attacking.
  - P2: tank Razorgore in the raid's corner (southwest per Ten Ton Hammer, or wherever the raid collapsed) facing away from the raid. Two to three tanks: MT in front, OT at 90 degrees (not in front — Conflagration drops the threat of those in front) or directly behind, each building threat so the next-highest picks him up during each Conflagration.
  - Never let the P2 MT be the controller who got hit in P1 with low health; never stand two tanks in the same cone.
- Melee DPS: P1 — assist a kiter's target, kill Blackwing Mages first, do not chase into another corner. P2 — stand behind/beside Razorgore outside the 15 yd War Stomp radius whenever possible, step in only for the burn.
- Ranged DPS: P1 — spread across corners with the groups, interrupt and kill Mages, Frost Nova / Fear packs that stack up, Druids Hibernate Dragonspawn. P2 — stay >15 yd from Razorgore (War Stomp) and ideally beyond 45 yd or behind a pillar for Fireball Volley; keep 10 yd between players when someone has Conflagration (300/s splash within 30 yd of the target is the real raid damage, so spread).
- Healers: P1 — one priest per kiting warrior, others stay with their corner group; watch threat (pulling an add onto a healer starts chain deaths). P2 — stand at max range with the ranged; heal Conflagration targets through 3000 over 10 s; dispel Grethok's Dominate Mind at the start (Magic).
- Whole raid: enter and buff in the southwest corner (no trash before the boss); split into four corner groups of 10 or two groups of 20; collapse to the middle and AoE fear if adds get out of control late in P1; in P2 collapse to one corner, LoS the volleys behind pillars.

## What each role must do and must not do
- Tank:
  1. Kill Grethok first; interrupt Dominate Mind.
  2. Kiting warriors: Sunder to break Polymorph/Hibernate as the raid is ready, kite around the platforms, never bring adds to the orb platform or onto Razorgore.
  3. Designated MT takes the last control cycle, breaks egg 30, drops control instantly (/dance), and holds Razorgore in the corner.
  4. Expect to lose Razorgore every 15–25 s to Conflagration: the OT must already be second on threat; the MT re-engages as the panic ends.
  5. Never Taunt — it is immune. Never stand in front of him next to the other tank.
- DPS:
  1. P1 kill order: Blackwing Mage > Death Talon Dragonspawn > Legionnaire (warlock notes; Warcraft Tavern says mages first).
  2. Hunters/rogues must not Feign Death / Vanish at the start of P2 — his threat table has only the ex-controller on it and a dropped target resets the encounter (SoD guide).
  3. Hold DPS for ~10 s at the start of P2 until the MT and OT have threat; the warlock notes say Cleave shaves tank threat.
  4. Spread 10 yd apart in P2 so Conflagration splash hits as few people as possible.
  5. Use pillars to break LoS from Fireball Volley if healers are strained.
- Healer:
  1. Dispel Dominate Mind (Magic) during the Grethok pull.
  2. P1: a priest shadows each kiter; everyone else stays low on threat.
  3. P2: 3000 Fire over 10 s on the Conflagration target and 300/s on anyone near them; pre-heal the OT who is about to take melee.
  4. After War Stomp the melee are stunned 5 s and knocked back — top them off.

## Timeline of a typical pull
- t=0 Pull Grethok and the two Guardsmen on the platform; he yells "Intruders have breached the hatchery!" Kill Grethok (~61k HP) within ~20–30 s.
- t≈20–30 s First controller clicks the orb; Possess begins (90 s max). Razorgore walks to the nearest egg; Destroy Egg every ~10 s (3 s cast + 7 s cooldown).
- t≈40–47 s First add wave (4 adds, from the corners), then a wave every ~15 s. Mages die first; Dragonspawn are slept.
- t≈110–120 s First control cycle ends (90 s) — second controller clicks immediately (first has Mind Exhaustion 60 s).
- t≈4–6 min All 30 eggs destroyed (30 eggs × ~10 s per egg ≈ 5 min of channel if nothing interrupts). Adds flee and despawn, Razorgore casts Warming Flames to full and attacks the last controller.
- P2 +4–8 s first Cleave; +10–15 s first Conflagration (then every 15–25 s); +15–20 s first Fireball Volley (then every 15–20 s); +30 s first War Stomp (then every 30 s).
- P2 lasts ~2–3 minutes at 450k HP for a 40-man raid.

## Open questions
- HP: classicdb.ch gives 449,685; a 2026 Hydra guild runbook snippet quotes 350,000 for a later Era patch (1.18.1). Use 449,685 as the Classic default.
- First add wave: cmangos 40 s, BigWigs 45 s, DBM 47 s, Warcraft Wiki 45 s (and says it was 30 s before patch 6.0.3). Era appears to be ~45 s.
- Fireball Volley damage: classicdb.ch base 255 Fire vs Warcraft Wiki 133–154 (modern tooltip). Real per-player hits in Era not confirmed.
- Conflagration splash: classicdb.ch 300 Fire/s to nearby allies vs Warcraft Wiki 150.
- Mind Exhaustion duration: classicdb.ch 60 s vs SoD guide 45 s.
- Destroy Egg: classicdb.ch 3 s cast + 7 s cooldown; the Warcraft Wiki (modern) says 1.5 s cooldown with no cast. Era behaves like the 3 s + 7 s version per the 2006 Ten Ton Hammer guide.
- Whether the Possess channel really breaks when the controller is damaged: the Warcraft Wiki says patch 5.1 removed that, but its own strategy text and the SoD guide still say it does; assume it does in Era.
- Conflagration threat behaviour: Ten Ton Hammer says it removes threat of everyone in front of him; modern sources just say he attacks the next player while the target is panicked. Both lead to the same OT rule.
