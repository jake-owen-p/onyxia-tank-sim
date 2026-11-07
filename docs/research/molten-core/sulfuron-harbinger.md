# Sulfuron Harbinger (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Sulfuron_Harbinger — Demoralizing Shout -300 AP 30 s, Inspire +25% physical/+100% speed 10 s, Hand of Ragnaros 300–400 Fire knockback 2 s stun, Flame Spear 850–1150; priest Dark Mending 27,750–32,250, SW:Pain 18 s, Immolate 760–840 + 380–420/3 s 21 s; three positioning strategies; five tanks.
- https://warcraft.wiki.gg/wiki/Flamewaker_Priest — level 32 (display), Dark Mending "heals 1069" (conflicting), Dark Strike +436 Shadow, Immolate 337 + 168/3 s, SW:Pain 15 s.
- https://www.wowhead.com/tbc/npc=12098/sulfuron-harbinger (r.jina.ai) — health 439,692; spells 19778/19779/19780/19781; priest list (23952, 36144, 20294), immune to Poison and Curse of Tongues.
- https://www.wowhead.com/classic/npc=12098/sulfuron-harbinger (r.jina.ai) — Seasonal 40 health 879,384.
- https://www.wowhead.com/tbc/npc=11662/flamewaker-priest (r.jina.ai) — priest level 61–62, health 67,980, mana 72,180.
- https://wotlkdb.com/?spell=19778 — Demoralizing Shout: instant, 45 yd radius, 30 s, -300 melee and ranged AP.
- https://wotlkdb.com/?spell=19779 — Inspire: instant, 45 yd range, 10 s, +100% melee haste, +25% physical damage, +25% size.
- https://wotlkdb.com/?spell=19780 — Hand of Ragnaros: instant, 10 yd radius, 300–400 Fire, knockback 75–100, 2 s stun.
- https://wotlkdb.com/?spell=19781 — Flame Spear: instant, 45 yd range, 10 yd radius, 850–1150 Fire, thrown.
- https://wotlkdb.com/?spell=19775 — Dark Mending: 2 s cast, 60 yd, heals 27,750–32,250.
- https://wotlkdb.com/?spell=19777 — Dark Strike: instant, 10 yd, weapon damage +570–630 (Shadow).
- https://wotlkdb.com/?spell=19776 — Shadow Word: Pain (priest, vanilla ID): instant, 30 yd, 18 s, 120 Shadow every 3 s, dispel Magic.
- https://wotlkdb.com/?spell=23952 — Shadow Word: Pain (ID on Wowhead TBC list): 60 yd, 18 s, 422–478 every 3 s, Magic.
- https://wotlkdb.com/?spell=20294 — Immolate: instant, 40 yd, 760–840 + 380–420 every 3 s for 21 s, Magic.
- https://wotlkdb.com/?spell=36144 — Heal (TBC-era ID on Wowhead list): 2.5 s, 40 yd, 18,500–21,500.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_sulfuron_harbinger.cpp — timers: Demoralizing Shout 15 s then 15–20 s; Inspire 3 s then 10 s on a friendly missing the buff within 45 yd; Hand of Ragnaros 6 s then 12–15 s; Flame Spear 2 s then 12–16 s on random player. Priests: Dark Strike 10 s then 15–18 s; Dark Mending 15–30 s then 15–20 s on lowest-HP friendly within 60 yd; SW:Pain 2 s then 18–26 s random; Immolate 8 s then 15–25 s random.
- https://www.wowhead.com/classic/guides/sulfuron-harbinger-molten-core-strategy (r.jina.ai) — 5 tanks, Hand of Ragnaros 10 yd/2 s stun, Inspire 45 yd, Dark Mending 2 s must be interrupted, priests immune to Mind-numbing/Curse of Tongues, kill priests first.
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/242 (Warcraft Tavern) — 45 yd spacing, 1 interrupter per priest, 1 healer per tank, Dark Mending 60 yd, Immolate 30 yd/21 s, SW:Pain 30 yd/18 s.
- https://wowtbc.gg/classic/boss-guides/molten-core — tank priests away from Sulfuron (Inspire), kill priests first, Free Action Potion vs Hand, cleanse Immolate/SW:Pain; geared raids stack and AoE with assigned interrupts.
- https://mein-mmo.de/en/wow-classic-how-much-blizzard-buffs-the-molten-core-in-the-classic-mode,742902 — SoM: shared health pool, stronger Inspire.

## Overview
- Level ?? (boss). Health 439,692 (Era 40-player); 879,384 Seasonal. No mana listed. No enrage. Seventh boss (order with Golemagg varies by route); required (Rune of Koro).
- Phases: none. Kill four Flamewaker Priests, then Sulfuron.
- Raid-size assumptions: 40-man Era, 5 tanks on first kills. SoM: Sulfuron and priests share one health pool and all cast a stronger Inspire.

## Abilities

### Demoralizing Shout
- Name: Demoralizing Shout (spell 19778)
- Type: AoE (around boss) debuff
- Target rule: all players within 45 yd
- Cast time: instant
- Cooldown or cadence: cmangos first 15 s then every 15–20 s
- Damage: none; -300 melee and ranged attack power
- Debuff: 30 s, no dispel type (Physical). No spread.
- Movement effect: none
- Telegraph: none

### Inspire
- Name: Inspire (spell 19779)
- Type: other (buff on ally)
- Target rule: a Flamewaker Priest (or himself) within 45 yd that lacks the buff
- Cast time: instant
- Cooldown or cadence: cmangos first 3 s then every 10 s
- Damage: none; target gets +25% Physical damage and +100% attack speed for 10 s (+25% size)
- Debuff: buff on the add; not dispellable per sources (none listed). Keep adds 45+ yd from Sulfuron so there is no valid target.
- Movement effect: none
- Telegraph: add grows 25%.

### Hand of Ragnaros
- Name: Hand of Ragnaros (spell 19780)
- Type: AoE knockback + stun (melee range)
- Target rule: everyone within 10 yd of Sulfuron
- Cast time: instant
- Cooldown or cadence: cmangos first 6 s then every 12–15 s
- Damage: 300–400 Fire, knockback 75–100 units, stun 2 s. Fire resistance can resist the whole effect; Free Action Potion prevents the stun.
- Debuff: stun 2 s
- Movement effect: knockback + 2 s stun
- Telegraph: none

### Flame Spear
- Name: Flame Spear (spell 19781)
- Type: targeted + splash
- Target rule: random player within 45 yd (cmangos random attacker), splash 10 yd around them
- Cast time: instant (thrown)
- Cooldown or cadence: cmangos first 2 s then every 12–16 s
- Damage: 850–1150 Fire to the target and players within 10 yd
- Debuff/Movement: none
- Telegraph: none; spread 10 yd.

### Dark Mending (Flamewaker Priest)
- Name: Dark Mending (spell 19775)
- Type: other (heal)
- Target rule: lowest-HP friendly within 60 yd (priest or Sulfuron)
- Cast time: 2 s, interruptible (Kick, Shield Bash, Pummel, Counterspell, Earth Shock); cannot be slowed (immune to Mind-numbing Poison and Curse of Tongues)
- Cooldown or cadence: cmangos first 15–30 s then every 15–20 s per priest
- Damage: heals 27,750–32,250 (wiki.gg Flamewaker Priest page says 1069 — conflicting). Range 60 yd.
- Debuff: none
- Telegraph: 2 s cast bar; assigned interrupters per priest. Mortal Strike reduces heals that land.

### Dark Strike (Flamewaker Priest)
- Name: Dark Strike (spell 19777)
- Type: melee
- Target rule: current tank
- Cast time: instant
- Cooldown or cadence: cmangos first 10 s then every 15–18 s
- Damage: weapon damage +570–630 Shadow (wiki: +436), 10 yd
- Debuff/Movement/Telegraph: none; Shadow Protection helps.

### Shadow Word: Pain (Flamewaker Priest)
- Name: Shadow Word: Pain (spell 19776; Wowhead TBC lists 23952)
- Type: targeted debuff
- Target rule: random player
- Cast time: instant
- Cooldown or cadence: cmangos first 2 s then every 18–26 s per priest
- Damage: 120 Shadow every 3 s for 18 s (19776) or 422–478 every 3 s (23952); 30 yd (60 yd for 23952)
- Debuff: SW:Pain, 18 s, dispel type Magic (Priest/Paladin cleanse)
- Movement/Telegraph: none

### Immolate (Flamewaker Priest)
- Name: Immolate (spell 20294)
- Type: targeted debuff
- Target rule: random player
- Cast time: instant
- Cooldown or cadence: cmangos first 8 s then every 15–25 s per priest
- Damage: 760–840 Fire + 380–420 every 3 s for 21 s; 40 yd (Warcraft Tavern says 30 yd)
- Debuff: Immolate, 21 s, dispel type Magic. Stacks from several priests.
- Movement/Telegraph: none

## Adds
- 4x Flamewaker Priest (NPC 11662), level 61–62 elite, 67,980 HP each (Era), 72,180 mana. Present from the start. Abilities: Dark Mending, Dark Strike, Shadow Word: Pain, Immolate; immune to Poison and Curse of Tongues. Each needs one tank and assigned interrupters; they are tanked 45+ yd from Sulfuron (Inspire) and from each other (so Dark Mending cannot reach the kill target, wowtbc.gg), killed one at a time before Sulfuron. Alternatives: tank all four together and peel one at a time, or herd and AoE focusing any under 20% (wiki).

## Positioning and movement
- Tank: the best-geared tank takes Sulfuron to the back of the room (Wowhead guide); facing irrelevant (no cone). Expect a 2 s stun every 12–15 s; carry Free Action Potions and Fire resistance. Four other tanks each take a priest to a separate corner, 45 yd apart from Sulfuron and each other (Warcraft Tavern "separated corners"), not out of healer range.
- Melee DPS: on the current kill-target priest; interrupters stay on their assigned priest. Stay out of 10 yd of Sulfuron until the priests are dead (Hand of Ragnaros).
- Ranged DPS: spread 10 yd apart (Flame Spear splash), outside 45 yd of Sulfuron (Demoralizing Shout matters only to physical ranged), focus the called priest; interrupt-capable casters (Counterspell, Earth Shock) assigned to priests.
- Healers: one assigned per tank (5), rest on raid (Immolate/SW:Pain/Flame Spear); Priests/Paladins cleanse Immolate and SW:Pain from the raid; Shadow Protection and Fire Resistance Totem/Aura in each group.
- Whole raid: spread into five clusters at the corners; nobody within 10 yd of Sulfuron except his tank until the end; stacking everything for AoE is a farm-status option with four interrupt rotations.

## What each role must do and must not do
- Tank:
  1. Sulfuron tank: pull him to the back, hold threat through 2 s stuns; Fire resistance.
  2. Priest tanks: hold your priest in its corner, 45+ yd from Sulfuron so Inspire has no target, and far enough that Dark Mending cannot reach the kill target.
  3. Do not drag a priest past another group (Fist/Immolate stacking on the raid).
- DPS:
  1. Kill priests one at a time in the called order; Sulfuron last.
  2. Interrupt every Dark Mending (2 s cast) on your assigned priest; one landing heals ~30k.
  3. Spread 10 yd (Flame Spear); stay off Sulfuron until priests are dead.
  4. Warriors: Mortal Strike on the kill target to halve any heal that slips through.
- Healer:
  1. One healer per tank; cleanse Immolate and SW:Pain promptly (Priests/Paladins).
  2. Heal Flame Spear clusters and Dark Strike spikes on priest tanks.
  3. Buff Shadow Protection, Fire Resistance Totem/Aura.

## Timeline of a typical pull
- t=0: five tanks peel Sulfuron and four priests to five positions.
- t=2 s: first Flame Spear (random, 10 yd splash) and first SW:Pain from priests; t=3 s first Inspire attempt (fails if no ally within 45 yd).
- t=6 s: first Hand of Ragnaros (10 yd knockback + 2 s stun), then every 12–15 s.
- t=8 s: first Immolate; t=10 s first Dark Strike on priest tanks.
- t=15 s: first Demoralizing Shout (-300 AP, 30 s), then every 15–20 s; t=15–30 s first Dark Mending casts begin (every 15–20 s per priest) — interrupt.
- Priest 1 dies at ~1 min, each next priest ~1 min later (68k HP each with interrupts).
- ~4–5 min: all priests dead; raid collapses on Sulfuron (440k HP); Hand of Ragnaros keeps knocking melee back every 12–15 s until he dies.

## Open questions
- Dark Mending heal: 27,750–32,250 (DBC, wiki Sulfuron page) vs 1,069 (wiki Flamewaker Priest page).
- SW:Pain tick: 120 (19776) vs 422–478 (23952, the ID Wowhead's TBC page shows).
- Dark Strike bonus: +570–630 (DBC) vs +436 (wiki).
- Priest level: 61–62 (Wowhead) vs 32 (wiki display).
- Cadences are emulator values; no retail logs fetched. Inspire's 10 s cadence and 45 yd range come from DBC + cmangos.
- Whether Inspire can be purged/dispelled is not stated by any source.
