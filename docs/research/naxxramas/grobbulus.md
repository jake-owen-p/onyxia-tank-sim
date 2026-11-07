# Grobbulus (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Grobbulus_(Classic) — Classic 40-man page: Enrage at 12 min; Poison Cloud 10 yd wide, high Nature damage, very long-lasting; Slime Spray 3,600–4,800 Nature, each player hit spawns a Fallout Slime; Fallout Slime 300 dmg / 2 s in 10 yd; Mutating Injection → 4,500 Physical AoE after 10 s (less if cleansed) + a cloud, more frequent at 30%; Slime Stream 4,500 Nature over 3 s when the MT leaves melee range; MT kites slowly along the ramp/outer wall; nature mitigation (Aspect of the Wild, Nature Resistance Totem).
- https://www.wowhead.com/classic/guide/grobbulus-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: Greater Nature Protection Potions for everyone on cooldown; Poison Cloud self-cast, grows, kite in a line; Mutating Injection is a Disease, cloud spawns when it ends **or is cleansed**; Slime Spray frontal cone → one Fallout Slime per player hit; Slime Stream only if the top-threat player is out of melee range; Enrage at 12 min; healers must not cleanse the injection early.
- https://www.wowhead.com/classic/spell=28240/poison-cloud — Poison Cloud: instant, summons a "Grobbulus Cloud" (duration 1.25 min = 75 s) at 3 yd.
- https://www.wowhead.com/classic/spell=28169/mutating-injection — Mutating Injection: instant, 50 yd, Disease dispel type, 10 s, "transforms them into an abomination after 10 sec", unaffected by invulnerability.
- https://www.wowhead.com/classic/spell=28157/slime-spray — Slime Spray: instant, 45 yd, 3,200 Nature (effect value), player-only, 45 yd radius (cone handled server-side).
- https://www.wowhead.com/classic/spell=28218/summon-fallout-slime — Summon Fallout Slime: instant, 100 yd.
- https://www.wowhead.com/classic/spell=28137/slime-stream — Slime Stream: 45 yd, max 10 targets, 1,500 Nature every 1 s for 3 s (4,500), ignores LoS.
- https://www.wowhead.com/classic/spell=19953/enrage — generic Enrage linked by the guide (+500 dmg, +50% attack speed, 10 s) — see Open questions; DBM uses a 720 s "berserk" timer.
- https://classicdb.ch/?npc=15931 — Grobbulus: 2,116,591 HP, melee 6,779–7,781, armor 4,691.
- https://classicdb.ch/?npc=16290 — Fallout Slime: level 60, 48,293 HP, melee 4,028–4,098, armor 3,791.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/ConstructQuarter/Grobbulus.lua — DBM Classic: Poison Cloud (28240) every 14.5–16.6 s; Mutating Injection (28169) 10 s target timer, cancelled if dispelled; 720 s enrage timer.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: Poison Cloud "heavy damage within 10 yd"; drag him slowly around the room edge; only the tank in front (Slime Spray); Mutating Injection 10 s, heavy AoE on expiry, less if cleansed; at 30% injections more frequent and on multiple players; Enrage at 12 min.

## Overview
- Level ?? boss, Undead (flesh giant). HP 2,116,591 (classicdb.ch). Hard enrage at 12:00 (wiki, Wowhead, WT; DBM 720 s). Second boss of the Abomination Wing, required.
- Phases: single phase; below 30% Mutating Injection becomes more frequent and hits multiple players (wiki, WT).
- Raid-size assumptions: 40-man Classic Era; ranged-heavy composition preferred (WT); Greater Nature Protection Potions for all; one main tank kiting; melee limited to the tank's Fallout Slimes.

## Abilities

### Poison Cloud
- Name: Poison Cloud (28240) → "Grobbulus Cloud" object
- Type: ground hazard
- Target rule: self-cast under Grobbulus (3 yd summon radius); the cloud starts small (~10 yd wide — wiki) and grows.
- Cast time: instant.
- Cadence: every 14.5–16.6 s (DBM Classic); "periodically" (Wowhead).
- Damage: "high amounts of Nature damage" to anyone inside (wiki); no Classic number found (see Open questions).
- Duration: 75 s per the summon spell (1.25 min); wiki "remains for a very long time".
- Telegraph: green cloud appears under him; the tank has already moved on.

### Mutating Injection
- Name: Mutating Injection (28169)
- Type: debuff (disease) → delayed AoE + cloud
- Target rule: a random player within 50 yd (Wowhead "random player in the raid").
- Cast time: instant.
- Cadence: not timed by DBM (only the 10 s duration); wiki/WT: "more frequent at 30%" and "on multiple players" below 30%. Classic interval unknown.
- Damage: when the 10 s debuff expires the player "transforms into an abomination" — a 4,500 Physical AoE around them (wiki) — and a Poison Cloud spawns at their position. If cleansed early the AoE is weaker (wiki, WT) but the cloud still spawns immediately where they stand (Wowhead).
- Debuff: Mutating Injection, 10 s, Disease (Cure/Abolish Disease, Cleanse, Disease Cleansing Totem) — cleansing is a positioning decision, not a reflex.
- Telegraph: debuff icon + DBM 10 s bar and "run out" warning. The player has ≤10 s to reach the cloud line.

### Slime Spray
- Name: Slime Spray (28157)
- Type: frontal cone
- Target rule: all players in a cone in front of Grobbulus (Wowhead; spell range 45 yd, player-only).
- Cast time: instant ("short-range cast" — Wowhead).
- Cadence: "often" (WT); no timer in DBM.
- Damage: 3,200 Nature (effect value; wiki 3,600–4,800).
- Side effect: one Fallout Slime is summoned per player hit (Summon Fallout Slime 28218).
- Telegraph: none; keep everyone but the tank out of his front.

### Fallout Slime — Poison AoE
- 300 damage every 2 s to players within 10 yd (wiki). 48,293 HP (classicdb), melee 4,028–4,098.

### Slime Stream
- Name: Slime Stream (28137)
- Type: AoE DoT (anti-kiting)
- Target rule: up to 10 players within 45 yd; triggered when the top-threat player is out of melee range (Wowhead, wiki — wiki also offers "highest-threat ranged player too close" as an unverified trigger).
- Damage: 1,500 Nature every 1 s for 3 s (4,500), ignores LoS.
- Telegraph: none — avoid by moving the boss slowly.

### Enrage (12 min)
- Name: Enrage (ID uncertain — Wowhead links 19953; DBM uses a plain 720 s timer)
- Effect: "massive buff to attack speed and damage" (Wowhead); treat as a wipe.

## Adds
- Fallout Slime (16290): level 60, 48,293 HP, melee 4,028–4,098; spawns on each player hit by Slime Spray (ideally only the tank → one slime per Spray) near the raid/healers (WT); pulled into melee away from ranged/healers (wiki) and killed by melee (warrior taunts it, Goblin Sapper Charges if several — Wowhead). Deals a 300/2 s poison AoE in 10 yd. Dies to DPS only.

## Positioning and movement
- Tank: pick him up at the bottom of his ramp and walk him slowly along the outer wall / around the edge of the room (wiki, Wowhead, WT) so Poison Clouds (every ~15 s, 75 s each) form a line behind him; hug the outside wall; move "a little step at a time" — if you leave melee range Slime Stream hits the raid. Always face him away from the raid (Slime Spray cone). At level 70 one can hold a spot and alternate between two spots (wiki). Never: outpace him; turn him toward the raid; walk the raid across the ramp where clouds can grow underneath (wiki).
- Melee DPS: mostly not on the boss (WT: "melee won't be very useful"); kill the tank's Fallout Slimes; otherwise stay behind him and out of the cone, ready to run out with an Injection.
- Ranged DPS: spread at range behind/beside him, ahead of the cloud trail; when injected, run to the edge of the existing cloud line, as far from the raid as possible, before 10 s elapse (wiki, Wowhead); Nature Protection Potion on cooldown.
- Healers: same spread; do not cleanse Mutating Injection until the carrier is in position (Wowhead); heal injected players through the 4,500 AoE; Nature Resistance Totem / Aspect of the Wild on groups (wiki).
- Whole raid: the room is a large circle with a ramp; the raid moves as a slow convoy behind the tank; cloud line = behind the boss; run-out point for injections = the end of the cloud line, far side from the raid.

## What each role must do and must not do
- Tank:
  1. Slow continuous kite along the wall; never break melee range (Slime Stream).
  2. Face away from everyone; only you eat Slime Spray (3,200–4,800 Nature) → GNPP.
  3. Watch for new clouds under you every ~15 s and step forward.
  4. Call the direction so injected players know where the cloud line is.
- DPS:
  1. Ranged burn the boss; melee kill Fallout Slimes (48k HP) and Sapper if several.
  2. Injected? Run to the cloud line immediately; do not die in the raid (your cloud spawns where you stand).
  3. Below 30%: injections multiply — save cooldowns for this burn (WT).
  4. Nothing to interrupt; don't cleanse yourself early.
- Healer:
  1. Do not cleanse Mutating Injection on reflex — only when the player is positioned (or not at all; expiry does 4,500 Physical).
  2. Heal injected players and the tank through Slime Spray hits; everyone pre-pots Greater Nature Protection.
  3. Totems: Nature Resistance or Poison Cleansing (not both — wiki).
  4. Keep moving with the convoy; stay out of clouds (very high Nature per tick).

## Timeline of a typical pull
- t=-2:00: Greater Nature Protection Potions so they are back up at the pull.
- t=0: Pull at the ramp; tank starts the slow walk along the wall.
- t≈15 s, 30 s, 45 s …: Poison Cloud under the boss (every 14.5–16.6 s), each lasting ~75 s → up to ~5 clouds active at once.
- Periodic: Slime Spray on the tank → 1 Fallout Slime → melee kill it; Mutating Injection on a random player → run to the cloud line → after 10 s a 4,500 AoE + new cloud there.
- 30%: injections more frequent / multiple players — burn.
- 12:00: Enrage → wipe. Kill target well inside (2.1M HP; ~3,000 raid DPS suffices).

## Open questions
- Poison Cloud damage per tick: not quantified in any Classic source ("high Nature damage").
- Mutating Injection cadence (above and below 30%): unknown; DBM only tracks the 10 s duration.
- Slime Spray damage: 3,200 (spell) vs 3,600–4,800 (wiki); cadence unknown.
- Slime Stream trigger: MT out of melee range (Wowhead, wiki) vs "highest-threat ranged too close" (wiki, unverified).
- Enrage spell: Wowhead links generic 19953 (10 s buff) which cannot be the 12-min enrage; DBM uses only a timer.
- Fallout Slime HP: 48,293 (classicdb) — wiki gives none ("relatively low health" per Wowhead).
- Boss HP: 2,116,591 (classicdb.ch); wiki lists none.
