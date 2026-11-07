# Gehennas (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Gehennas — Shadow Bolt 2250–2750, Rain of Fire "368 Fire every 2 s for 6 s", curse -75% healing 5 min, Flamewaker Fist of Ragnaros 4 s stun, Sunder Armor 10%/stack up to 5, Strike +200; tactics (tank in centre, guards far apart, tank decurser).
- https://www.wowhead.com/tbc/npc=12259/gehennas (r.jina.ai) — health 351,780, mana 39,300; Gehennas spells 19729, 19717; guard spells Fist of Ragnaros 20277, Sunder Armor 24317, Strike 19730.
- https://www.wowhead.com/classic/npc=12259/gehennas (r.jina.ai) — Seasonal 40 health 703,560.
- https://www.wowhead.com/tbc/npc=11661/flamewaker (r.jina.ai) — Flamewaker level 62, health 77,700, mana 25,680.
- https://www.wowhead.com/classic/npc=11661/flamewaker (r.jina.ai) — Flamewaker Seasonal health 155,400.
- https://wotlkdb.com/?spell=19716 — Gehennas' Curse: instant, 45 yd radius, 5 min, dispel Curse, -75% healing taken.
- https://wotlkdb.com/?spell=19717 — Rain of Fire: instant, 40 yd range, 10 yd radius, 6 s, 925–1075 Fire every 2 s.
- https://wotlkdb.com/?spell=19728 — Shadow Bolt (tank version): 0.5 s cast, 40 yd, 2250–2750 Shadow.
- https://wotlkdb.com/?spell=19729 — Shadow Bolt (random version): 0.5 s cast, 40 yd, 2250–2750 Shadow.
- https://wotlkdb.com/?spell=20277 — Fist of Ragnaros: instant, 8 yd radius, 4 s stun.
- https://wotlkdb.com/?spell=24317 — Sunder Armor (Flamewaker): instant, 5 yd, 20 s, -1000 armor per application.
- https://wotlkdb.com/?spell=19730 — Strike: instant, 5 yd, weapon damage +25 (+7.5 per level).
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_gehennas.cpp — timers: Curse first 5–10 s then 25–30 s; Rain of Fire 6–12 s repeating on random player; Shadow Bolt (random) 3–6 s; Shadow Bolt (tank) 3–6 s.
- https://www.wowhead.com/classic/guides/gehennas-molten-core-strategy (r.jina.ai) — curse "roughly every 15 seconds", decurse priority tanks > melee > rest, guards tanked southwest, Free Action Potion 30 s vs Fist, Restorative Potion.
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/238 (Warcraft Tavern) — ability table: Rain of Fire 40 yd/6 s, Shadow Bolt 0.5 s/40 yd, Fist 4 s, Strike 5 yd, Sunder Armor 5 yd/30 s; role duties.
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-3-gehennas — group setup (tank group per guard), Rain of Fire "700+ per second", Shadow Bolt 2000+ random.
- https://legacy-wow.com/molten-core-boss-guide-gehennas/ — Sunder Armor 1000 per stack "up to 20 stacks", guards' frontal stun, face guards away.
- https://wowtbc.gg/classic/boss-guides/molten-core — keep guards apart early to limit Fist of Ragnaros, then stack and cleave.
- https://mein-mmo.de/en/wow-classic-how-much-blizzard-buffs-the-molten-core-in-the-classic-mode,742902 — SoM: 4 Flamewakers instead of 2.

## Overview
- Level ?? (boss). Health 351,780 (Era 40-player); 703,560 Seasonal. Mana 39,300. No enrage timer found. Third boss; required (Rune of Mohn).
- Phases: none. Kill the two Flamewaker guards, then Gehennas.
- Raid-size assumptions: 40-man Era. SoM: 4 Flamewakers, Rain of Fire cast much more often.

## Abilities

### Gehennas' Curse
- Name: Gehennas' Curse (spell 19716)
- Type: AoE (room) debuff
- Target rule: all players within 45 yd (DBC) of Gehennas
- Cast time: instant
- Cooldown or cadence: Wowhead guide "roughly every 15 seconds"; cmangos first 5–10 s then 25–30 s.
- Damage: none
- Debuff: Gehennas' Curse, 5 min, dispel type Curse (Mage/Druid, Restorative Potion). Healing received reduced by 75%. No spread.
- Movement effect: none
- Telegraph: none

### Rain of Fire
- Name: Rain of Fire (spell 19717)
- Type: ground hazard (targeted area)
- Target rule: random player within 40 yd (cmangos random player target); can land on the tank or melee.
- Cast time: instant (DBC); persistent area aura 6 s.
- Cooldown or cadence: cmangos every 6–12 s.
- Damage: 925–1075 Fire every 2 s for 6 s to anyone in a 10 yd radius (DBC). wiki.gg: 368 per 2 s; Ten Ton Hammer: 700+ per second.
- Debuff: none (standing damage)
- Movement effect: none
- Telegraph: visible fire rain on the ground; move out immediately. Tanks move the boss/adds out of it.

### Shadow Bolt
- Name: Shadow Bolt (19728 on current target; 19729 on random player)
- Type: targeted
- Target rule: 19728 current tank; 19729 random player within 40 yd
- Cast time: 0.5 s; interruptible unknown (not listed)
- Cooldown or cadence: cmangos each version every 3–6 s
- Damage: 2250–2750 Shadow, 40 yd range
- Debuff: none
- Movement effect: none
- Telegraph: 0.5 s cast bar

### Fist of Ragnaros (Flamewaker)
- Name: Fist of Ragnaros (spell 20277)
- Type: AoE stun (melee range)
- Target rule: all players within 8 yd of the Flamewaker (legacy-wow describes it as a frontal cone; DBC is a radius)
- Cast time: instant
- Cooldown or cadence: unknown (frequent; guides say melee can be "stun-locked" if guards are stacked)
- Damage: none
- Debuff: stun 4 s, no dispel type (Physical). Prevented by Free Action Potion (30 s).
- Movement effect: stun 4 s
- Telegraph: none

### Sunder Armor (Flamewaker)
- Name: Sunder Armor (spell 24317)
- Type: debuff (melee)
- Target rule: current tank
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: none; -1000 armor per application, 20 s (DBC). wiki.gg: 10% per stack up to 5; legacy-wow: up to 20 stacks.
- Debuff: Sunder Armor, 20 s (DBC) / 30 s (Warcraft Tavern), no dispel. Stacks.
- Movement effect: none
- Telegraph: none

### Strike (Flamewaker)
- Name: Strike (spell 19730)
- Type: melee
- Target rule: current tank
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: weapon damage +25 +7.5/level (≈ +475 at level 60); wiki.gg "normal damage plus 200"
- Debuff/Movement/Telegraph: none

## Adds
- 2x Flamewaker (NPC 11661), level 62 elite, 77,700 HP (Era; 155,400 Seasonal), 25,680 mana. Present from the start. Abilities: Fist of Ragnaros, Sunder Armor, Strike. Each picked up by an off-tank and pulled away (classic: southwest, spaced apart so their stuns do not overlap; farm status: stacked with Gehennas for cleave). Killed first by the raid; they have "fairly small health pools" (legacy-wow). SoM: 4 of them.

## Positioning and movement
- Tank: pull Gehennas to the centre of the room, far enough that only the MT plus healers/decursers are inside curse/Shadow Bolt/Rain range (wiki.gg). Facing is irrelevant for Gehennas. Move him out of Rain of Fire if it lands on you. Off-tanks face the Flamewakers away from the raid and apart from each other.
- Melee DPS: on the Flamewakers first, behind them (frontal stun reported by legacy-wow); Free Action Potion pre-pull; step out of Rain of Fire.
- Ranged DPS: max range on the adds, then Gehennas; spread in small groups so Rain of Fire hits few; stay out of 45 yd of Gehennas if possible (curse).
- Healers: in range of their tank; tank healers must be decursed first. Spread.
- Whole raid: nobody stands in Rain of Fire; keep guards and boss separated until the raid can cleave safely.

## What each role must do and must not do
- Tank:
  1. MT: hold Gehennas centred; move out of Rain of Fire.
  2. OTs: pull guards away at pull (only after Gehennas is aggroed, Ten Ton Hammer), face away from raid, keep them apart.
  3. Expect 4 s stuns; need extra healing while stunned.
- DPS:
  1. Kill both Flamewakers, then Gehennas.
  2. Mages/Druids: decurse continuously, tanks first; this is the fight's main job.
  3. Melee: Free Action Potion, avoid the guards' front.
  4. Do not use Fire spells on Gehennas (minimal effect, Ten Ton Hammer).
- Healer:
  1. Decurse priority tank > melee > others; a cursed tank takes 75% less healing.
  2. Heal Shadow Bolt targets (2250–2750) and Rain of Fire victims.
  3. Shadow Protection on the raid.

## Timeline of a typical pull
- t=0: MT engages Gehennas; hunters/OTs peel the two Flamewakers southwest.
- t=3–6 s: first Shadow Bolts (tank and random), then every 3–6 s each.
- t=5–10 s: first Gehennas' Curse on everyone within ~45 yd, then every 15–30 s.
- t=6–12 s: first Rain of Fire on a random player; repeats every 6–12 s.
- Flamewakers stun melee every few seconds until they die (~30–60 s).
- Gehennas (351k HP) dies in 2–4 min; no phase changes.

## Open questions
- Curse cadence: Wowhead guide ~15 s vs cmangos 25–30 s.
- Rain of Fire tick: DBC 925–1075 per 2 s vs wiki.gg 368 per 2 s vs Ten Ton Hammer 700+/s.
- Sunder Armor stacking: wiki 10%/stack max 5 vs legacy-wow 1000/stack up to 20 vs DBC -1000 flat, 20 s.
- Fist of Ragnaros shape: DBC 8 yd radius vs legacy-wow frontal cone.
- Flamewaker level: Wowhead 62 vs wiki "32".
