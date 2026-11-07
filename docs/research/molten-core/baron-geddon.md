# Baron Geddon (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Baron_Geddon — Inferno 8 s root/pacify, Ignite Mana 400 mana/3 s for 5 min, Living Bomb 8 s 3200 Fire, Armageddon 8000 Fire; "pulses 9 times"; Geddon Line (40 yd from cave mouth), stacking strategy (attackers at 30 yd), hallway low-ceiling strategy, 315 FR tank, SoM notes.
- https://www.wowhead.com/tbc/npc=12056/baron-geddon (r.jina.ai) — health 586,256; Ignite Mana "random players within 45 yards"; Living Bomb 8 s knock-up; Armageddon "triggered at 2% health ... 20 yards".
- https://www.wowhead.com/classic/npc=12056/baron-geddon (r.jina.ai) — Seasonal 40 health 1,172,512.
- https://wotlkdb.com/?spell=19695 — Inferno: instant, 8 s, Root + Pacify self, triggers 18947 every 1 s.
- https://wotlkdb.com/?spell=19698 — Inferno damage spell: 20 yd radius, Fire (value scripted).
- https://wotlkdb.com/?spell=19659 — Ignite Mana: instant, 45 yd radius, 5 min, dispel Magic, burn 400 mana every 3 s.
- https://wotlkdb.com/?spell=20475 — Living Bomb: instant, 45 yd range, 8 s, triggers Explosion 20476 at 8 s.
- https://wotlkdb.com/?spell=20476 — Explosion: 3200 Fire, 18 yd radius, knockback 333–367.
- https://wotlkdb.com/?spell=20478 — Armageddon: 8 s self Root + Pacify, triggers 20479 at 8 s.
- https://wotlkdb.com/?spell=20479 — Armageddon damage: instakill (self) + 7600–8400 Fire in 20 yd.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_baron_geddon.cpp — timers: Inferno 45 s/45 s; Ignite Mana 30 s/30 s; Living Bomb 35 s/35 s on random player; Armageddon at ≤2% HP.
- https://raw.githubusercontent.com/scriptdev2/scriptdev2-classic/master/scripts/eastern_kingdoms/molten_core/boss_baron_geddon.cpp — same timers (45/30/35 s), Armageddon ≤2%.
- https://www.wowhead.com/classic/guides/baron-geddon-molten-core-strategy (r.jina.ai) — pull to Garr's room, line formation, 315+ FR tank, Greater Fire Protection Potion = 1–2 ticks, run to walls (low ceiling), Ice Block/Divine Shield immunity, Ignite Mana dispel priority healers > casters, Warriors/Rogues keep debuff.
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/240 (Warcraft Tavern) — ability table: Living Bomb 45 yd/8 s, Ignite Mana 5 min Magic, Inferno 8 s, Armageddon 8 s; one tank.
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-5-baron-geddon — Inferno ~6 pulses over 10–15 s: 500, 500, 1000, 1000, 2000, 2000; Ignite Mana 400 mana → 400 damage per tick; Living Bomb ~10 s fuse, 3200 (crit up to 4800); tank 250 FR, melee 150 FR; out-of-combat resser.
- https://www.wowhead.com/classic/news/wow-classic-molten-core-raid-strategy-guides-and-boss-tips-295175 (r.jina.ai) — Ignite Mana every 3 s, immune to Fire, pull to Garr's room.
- https://wowtbc.gg/classic/boss-guides/molten-core — Armageddon near death kills the raid if it completes; fire patches (SoM).
- Search result snippets (warcrafttavern.com baron-geddon-som, pretbc.fandom.com) — "roughly 6 pulses", Ignite Mana 40 yd in Classic, SoM three bomb targets and fire patches.

## Overview
- Level ?? (boss). Health 586,256 (Era 40-player); 1,172,512 Seasonal. No mana. Immune to Fire. No timed enrage; Armageddon at ≤2% HP is an 8 s "kill him now" wipe mechanic. Fifth boss (shares the area with Shazzrah); required (Rune of Zeth). Drops the second Binding of the Windseeker.
- Phases: single phase; Armageddon at 2%.
- Raid-size assumptions: 40-man Era. SoM: Living Bomb on 3 players at once; Inferno and bombs leave fire patches.

## Abilities

### Inferno
- Name: Inferno (spell 19695; damage via 19698)
- Type: AoE (around boss), channel
- Target rule: all players within 20 yd (DBC radius of 19698) of Geddon
- Cast time: instant start; Geddon is rooted and pacified for 8 s (cannot move, melee or cast)
- Cooldown or cadence: cmangos/scriptdev2: first at 45 s, then every 45 s.
- Damage: pulses every 1 s for 8 s (DBC). Ten Ton Hammer: ~6 pulses ramping 500, 500, 1000, 1000, 2000, 2000 Fire; wiki.gg: 9 pulses. Radius 20 yd.
- Debuff: none
- Movement effect: none
- Telegraph: Geddon stops attacking and ignites (visual); 8 s window. Melee (including the tank unless 315 FR) run out at the start.

### Ignite Mana
- Name: Ignite Mana (spell 19659)
- Type: AoE (room) debuff
- Target rule: all players within 45 yd (DBC; Wowhead TBC "random players within 45 yards"; search snippet says 40 yd Classic)
- Cast time: instant
- Cooldown or cadence: cmangos/scriptdev2 first 30 s then every 30 s
- Damage: burns 400 mana every 3 s and deals Fire damage equal to mana burned (400 per tick, Ten Ton Hammer)
- Debuff: Ignite Mana, 5 min, dispel type Magic (Priest/Paladin; Restorative Potion; Druid shapeshift avoids). Does not spread. Harmless on Warriors/Rogues (no mana) — leave it on them.
- Movement effect: none
- Telegraph: none

### Living Bomb
- Name: Living Bomb (spell 20475 → Explosion 20476)
- Type: targeted debuff → AoE explosion
- Target rule: one random player within 45 yd (cmangos random player). SoM: 3 players.
- Cast time: instant
- Cooldown or cadence: cmangos/scriptdev2 first 35 s then every 35 s
- Damage: after 8 s the bomb explodes for 3200 Fire (crit up to 4800, Ten Ton Hammer) to the target and everyone within 18 yd, with a 333–367 knock-up (fall damage).
- Debuff: Living Bomb, 8 s (Ten Ton Hammer: ~10 s), no dispel type; Ice Block / Divine Shield remove it (player still must run out).
- Movement effect: knock-up into the air for all hit; fall damage can kill — run to a low ceiling / wall.
- Telegraph: debuff on the player (addon announce); 8 s to get 18+ yd away.

### Armageddon
- Name: Armageddon (spell 20478 → 20479)
- Type: enrage / self-destruct
- Target rule: everyone within 20 yd (DBC); wiki.gg: "all players"
- Cast time: 8 s channel, Geddon rooted and pacified; not interruptible
- Cooldown or cadence: once, when Geddon reaches ≤2% HP (cmangos, Wowhead TBC)
- Damage: 7600–8400 Fire (wiki: 8000) and Geddon kills himself
- Debuff: none
- Movement effect: none
- Telegraph: emote ("Baron Geddon performs one last service for Ragnaros", cmangos EMOTE_SERVICE); 8 s. Kill him before it lands or be 20+ yd away.

## Adds
- None.

## Positioning and movement
- Tank: pull Geddon back to Garr's room (hunter + warrior pull, wiki/Wowhead) into open space, or into the low-ceiling hallway between Garr's and Geddon's rooms (wiki "easy strategy": zero fall damage). Hold him "just inside spell range" of the raid, centred, facing irrelevant (no cone). When Inferno starts, back out of 20 yd unless 315+ FR (Wowhead guide) / 250+ FR (Ten Ton Hammer). Return when the 8 s ends.
- Melee DPS: attack only between Infernos; leave at the first pulse; 150+ FR (Ten Ton Hammer). If bombed, run to the designated bomb spot under the wall.
- Ranged DPS: stacking strategy at 30 yd from Geddon (wiki) or the Geddon Line ~40 yd from the cave mouth; Classic line formation (Wowhead) so bomb targets can run perpendicular. Stay 45+ yd to avoid Ignite Mana if talents allow.
- Healers: inside heal range of the tank, as far from Geddon as possible; dispel Ignite Mana healers first. One Paladin/Shaman stays out of combat as a resser for bomb deaths (Ten Ton Hammer).
- Whole raid: a bomb runs 18+ yd away toward a low ceiling (Light Feather/Slow Fall/Levitate help). Pull back to Garr's room so trash is clear. Nobody within 20 yd of Geddon at 2%.

## What each role must do and must not do
- Tank:
  1. Run out of Inferno (or have 315 FR and a Greater Fire Protection Potion).
  2. Do not drop threat on the ranged during Inferno (Geddon is pacified, so threat is safe).
  3. If bombed, run away from melee and healers before returning.
  4. Keep Geddon still in open space so melee can escape.
- DPS:
  1. Melee leave at Inferno start, re-engage after 8 s.
  2. Bomb target runs out immediately; use Greater Fire Protection Potion; Ice Block/Divine Shield to remove.
  3. Never use Fire spells (immune).
  4. Burn hard when he is under 5%; Armageddon at 2% must not finish.
- Healer:
  1. Dispel Ignite Mana immediately: healers > caster DPS; leave Warriors/Rogues alone.
  2. Pre-heal melee returning from Inferno and bomb victims who take fall damage.
  3. Stay out of bomb paths; move away from bombs rather than healing them in place.

## Timeline of a typical pull
- t=0: pull to Garr's room / hallway; tank picks up.
- t=30 s: first Ignite Mana on everyone within 45 yd; repeats every 30 s (dispel wave).
- t=35 s: first Living Bomb on a random player; explodes at t=43 s (3200 Fire, 18 yd, knock-up); repeats every 35 s.
- t=45 s: first Inferno, 8 s of 1 s pulses ramping to 2000; melee out; repeats every 45 s.
- Cycle: Ignite 30/60/90..., Bomb 35/70/105..., Inferno 45/90/135... — at 90 s an Inferno and an Ignite coincide.
- At ≤2% HP (≈11,700 HP left): Armageddon 8 s channel; kill him or be 20 yd away. Fight length 3–5 min for 586k HP.

## Open questions
- Inferno pulses: Ten Ton Hammer 6 ramping pulses (500/1000/2000) over 10–15 s vs wiki "9 pulses" vs DBC 8 s at 1 s intervals (the per-pulse damage is scripted and not in DBC).
- Inferno/Ignite/Bomb cadences (45/30/35 s) are emulator values; no retail log was fetchable.
- Living Bomb fuse: 8 s (DBC, wiki, Wowhead) vs ~10 s (Ten Ton Hammer).
- Ignite Mana radius: 45 yd (DBC, Wowhead TBC) vs 40 yd (pretbc snippet, Classic).
- Armageddon radius: 20 yd (DBC, Wowhead TBC) vs "all players" (wiki, wowtbc.gg).
