# Magmadar (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Magmadar — ability text (Lava Breath 1157–1343 Fire frontal, Panic 8 s fear, Lava Bomb "4800 Fire over 12 s", Frenzy +150% attack speed), 30 yd fear vs 40 yd heal range tactics, Fear Ward, Berserker Rage every 30 s, two MT healer groups, SoM Core Hound spawns.
- https://www.wowhead.com/tbc/npc=11982/magmadar (r.jina.ai) — 40-player health 826,088; ability IDs 19450, 19272, 19408, 19411, 19451; Tranquilizing Shot 19801.
- https://www.wowhead.com/classic/npc=11982/magmadar (r.jina.ai) — Seasonal 40 health 1,239,132.
- https://wotlkdb.com/?spell=19451 — Frenzy (named "Enrage" in DBC): 8 s, +150% melee haste, +20% size, periodically triggers Lava Breath every 4 s, dispel type Enrage.
- https://wotlkdb.com/?spell=19272 — Lava Breath: instant, 1157–1343 Fire, radius 35 yd.
- https://wotlkdb.com/?spell=19408 — Panic: instant, 45 yd radius, 8 s fear, Shadow, dispel Magic, mechanic Fleeing.
- https://wotlkdb.com/?spell=19411 — Lava Bomb: instant, 100 yd range, dummy (server spawns the fire object).
- https://wotlkdb.com/?spell=20474 — Lava Bomb (mana-user variant): instant, 100 yd, dummy.
- https://wotlkdb.com/?spell=19428 — Conflagration (the fire-patch DoT): 5 yd radius, 8 s, 400 Fire every 1 s.
- https://wotlkdb.com/?spell=19449 — Magma Spit self-buff: 20% proc chance to trigger 19450.
- https://wotlkdb.com/?spell=19450 — Magma Spit debuff: 93–107 Fire + 75 Fire every 3 s for 30 s.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_magmadar.cpp — timers: Frenzy 30 s then 15–20 s; Panic 6–10 s then 30–35 s; Lava Bomb 12 s then 12–15 s (non-mana targets, fire object 30 s); Lava Bomb mana variant 18 s then 12–15 s (fire object 60 s).
- https://raw.githubusercontent.com/scriptdev2/scriptdev2-classic/master/scripts/eastern_kingdoms/molten_core/boss_magmadar.cpp — older timers: Frenzy 30/15 s, Panic 7/30 s, Lava Bomb 12/12 s.
- https://www.wowhead.com/classic/guides/magmadar-molten-core-strategy (r.jina.ai) — Frenzy +150% for 8 s, Panic 8 s / 30 yd, Magma Spit 30 s stacking to 3, Berserker Rage 5 s before Panic, Fear Ward recast after Frenzy, Tremor Totem, outranging talents list.
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/237 (Warcraft Tavern) — Lava Bomb 100 yd, Frenzy 8 s, Panic 8 s/30 yd, Magma Spit 30 s; tank moves only for Lava Bomb; healers behind boss.
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-2-magmadar — "AE Fear every 30 seconds, 30 yard radius", Fire Cone on tank, two hunters for Tranq, auxiliary tank.
- https://legacy-wow.com/molten-core-boss-guide-magmadar/ — Lava Bomb debuff 3200 over 8 s, fear 30 yd, turn boss sideways.
- https://wowtbc.gg/classic/boss-guides/molten-core — Magma Spit stacks up to 3, ranged at max range for Panic, Fear Ward before pull.
- https://mein-mmo.de/en/wow-classic-how-much-blizzard-buffs-the-molten-core-in-the-classic-mode,742902 — SoM: 2 Core Hounds 20–30 s after pull, 2 more every ~minute.

## Overview
- Level ?? (boss). Health 826,088 (Era 40-player); 1,239,132 Seasonal. No mana. No enrage timer found. Second boss; required for Majordomo (Rune of Kress).
- Phases: none; Frenzy is a recurring buff, not a phase.
- Raid-size assumptions: 40-man Classic Era. Season of Mastery adds Core Hound packs (2 at 20–30 s, 2 more every ~60 s) and more frequent Lava Bomb; not modelled here.

## Abilities

### Frenzy
- Name: Frenzy (spell 19451, DBC name "Enrage")
- Type: enrage (self buff)
- Target rule: self
- Cast time: instant
- Cooldown or cadence: cmangos first at 30 s then every 15–20 s; scriptdev2 30 s then 15 s; Wowhead guide implies ~30 s ("matches Berserker Rage's 30 s cooldown").
- Damage: none directly; +150% melee attack speed for 8 s, +20% size; while active it also triggers Lava Breath every 4 s (DBC effect 3).
- Debuff: buff on Magmadar, 8 s, dispel type Enrage; removed only by Hunter Tranquilizing Shot (19801, tome from Lucifron). Does not spread.
- Movement effect: none
- Telegraph: emote (cmangos EMOTE_GENERIC_FRENZY_KILL, "goes into a killing frenzy"), model grows 20%.

### Lava Breath
- Name: Lava Breath (spell 19272)
- Type: frontal cone (breath)
- Target rule: everything in front of Magmadar (tank)
- Cast time: instant
- Cooldown or cadence: DBC: triggered every 4 s while Frenzy is active; cmangos has it commented out as "Triggered by Frenzy". Guides call it periodic.
- Damage: 1157–1343 Fire; DBC radius 35 yd (cone length). Cone angle not given in any source.
- Debuff: none
- Movement effect: none
- Telegraph: none; positional

### Panic
- Name: Panic (spell 19408)
- Type: fear (AoE)
- Target rule: all players within radius (DBC 45 yd; every guide says 30 yd)
- Cast time: instant
- Cooldown or cadence: Ten Ton Hammer "every 30 seconds"; cmangos first 6–10 s then 30–35 s; scriptdev2 7 s then 30 s.
- Damage: none
- Debuff: Panic, 8 s fear, dispel type Magic, mechanic Fleeing. Prevented by Fear Ward, broken by Tremor Totem (periodic), Berserker Rage (if active before), Will of the Forsaken, Death Wish.
- Movement effect: fear for 8 s (random running)
- Telegraph: none (instant); timer addons used.

### Lava Bomb
- Name: Lava Bomb (spell 19411; 20474 variant for mana users)
- Type: ground hazard (targeted)
- Target rule: 19411 random non-mana player; 20474 random mana player (cmangos SELECT_FLAG_POWER_NOT_MANA / POWER_MANA). Range 100 yd.
- Cast time: instant
- Cooldown or cadence: cmangos 19411 first 12 s then 12–15 s; 20474 first 18 s then 12–15 s; scriptdev2 12 s then 12 s.
- Damage: fire patch (gameobject 177704) lasting 30 s (19411) or 60 s (20474); standing in it applies Conflagration 19428: 400 Fire every 1 s for 8 s (3200 total, matches legacy-wow "3200 over 8 s"; wiki.gg says 4800 over 12 s), patch radius 5 yd.
- Debuff: Conflagration, 8 s, no dispel type listed. Does not spread.
- Movement effect: none
- Telegraph: a visible fire patch appears under the target; leave it immediately.

### Magma Spit
- Name: Magma Spit (19449 self-buff → 19450 debuff)
- Type: debuff (melee proc)
- Target rule: 20% chance on each of Magmadar's melee hits (DBC); guides say "everyone near Magmadar / in front".
- Cast time: instant (proc)
- Cooldown or cadence: proc, no cadence
- Damage: 93–107 Fire + 75 Fire every 3 s for 30 s per application
- Debuff: Magma Spit, 30 s, no dispel type; stacks up to 3 (Wowhead guide, wowtbc.gg). Does not spread.
- Movement effect: none
- Telegraph: none

## Adds
- None in Classic Era. (Season of Mastery: Core Hound packs spawn at 20–30 s and every ~60 s.)

## Positioning and movement
- Tank: tank Magmadar where he stands (Warcraft Tavern) facing away from the raid; wiki.gg classic method faces him toward the healer/hunter group so the raid can see the Lava Breath cone and stay out of it (either way only the tank is in front). Turn him sideways if melee cluster. Move only when a Lava Bomb patch lands on you. Must never be feared: Fear Ward (Dwarf priest, recast after every Frenzy), Tremor Totem in the tank's party, or Berserker Rage 5 s before each Panic.
- Melee DPS: behind or on the flanks, never in front (Lava Breath). Expect stacking Magma Spit; step out to bandage. Walk out of fire patches.
- Ranged DPS: at max range, outside 30 yd, which requires +range talents (Hawk Eye, Arctic Reach, etc.). Semi-circle behind the tank spread so Lava Bomb patches hit one person.
- Healers: at 40 yd behind the boss, outside Panic's 30 yd. Wiki rule of thumb: "if you can dispel the tank you are too close". Two MT healer groups so one feared group can be covered.
- Whole raid: do not stand in Conflagration patches; outer ring at 30–40 yd, melee ring only.

## What each role must do and must not do
- Tank:
  1. Have Fear Ward/Tremor before the pull; refresh Fear Ward after each Frenzy.
  2. Never let yourself be feared (a feared tank drags Magmadar into the ranged group).
  3. Move out of Lava Bomb patches, then return to the same spot.
  4. Face the boss away from everyone.
- DPS:
  1. Hunters: two assigned, Tranquilizing Shot the instant Frenzy appears; call misses.
  2. Melee: stay behind; walk out of fire; manage Magma Spit stacks with bandages.
  3. Ranged: stay beyond 30 yd; do not use Fire spells (mostly resisted).
- Healer:
  1. Stay at 40 yd behind the tank; outside fear range.
  2. Spike heal the tank during Frenzy (8 s at +150% speed) and whenever a tranq misses.
  3. Heal Lava Bomb targets and melee with Magma Spit.
  4. Priests: Fear Ward rotation on the tank.

## Timeline of a typical pull
- t=0 pull; tank positions, melee engage from behind.
- t=6–10 s: first Panic (30 yd fear, 8 s); then every 30–35 s.
- t=12 s: first Lava Bomb on a non-mana player (fire for 30 s); t=18 s first Lava Bomb on a mana user (fire 60 s); each then every 12–15 s.
- t=30 s: first Frenzy (8 s, +150% speed, Lava Breath every 4 s); Tranq Shot immediately; then every 15–20 s (cmangos) / ~30 s (guides).
- t=36–45 s: second Panic; Berserker Rage users pop it ~5 s before.
- Repeat until dead; 826k HP, typically 3–5 min in Era gear.

## Open questions
- Panic radius: DBC 45 yd vs all guides 30 yd (Wowhead, wiki, Ten Ton Hammer).
- Frenzy cadence: cmangos 15–20 s vs Wowhead guide ~30 s vs scriptdev2 15 s.
- Lava Bomb DoT: wiki.gg "4800 Fire over 12 s" vs legacy-wow "3200 over 8 s" vs DBC Conflagration 400/s for 8 s.
- Lava Breath: whether it fires only during Frenzy (DBC trigger every 4 s) or independently (guides call it "periodic").
- Magma Spit max stacks: guides say 3; DBC lists no max.
