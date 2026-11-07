# Lucifron (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Lucifron — ability descriptions (Impending Doom 2000 Shadow after 10 s, curse +100% cost 5 min, "cast every 15 seconds", 40 yd debuff range), Protector abilities, classic tactics (dummies for Dominate Mind, hunters pull Protectors, 41 yd outranging).
- https://warcraft.wiki.gg/wiki/Flamewaker_Protector — Protector level 32 elite (display level), Cleave "weapon damage plus 85, up to 3 targets", Dominate Mind 15 s.
- https://www.wowhead.com/tbc/npc=12118/lucifron (read through r.jina.ai) — 40-player health 351,780, mana 39,300, ability list with spell IDs 19702 / 19703 / 19460.
- https://www.wowhead.com/classic/npc=12118/lucifron (read through r.jina.ai) — "Seasonal 40 Player" health 703,560 (exactly 2x the Era value).
- https://www.wowhead.com/tbc/npc=12119/flamewaker-protector (read through r.jina.ai) — Protector level 62, health 90,650, mana 25,680.
- https://www.wowhead.com/classic/npc=12119/flamewaker-protector (read through r.jina.ai) — Protector Seasonal health 181,300.
- https://wotlkdb.com/?spell=19702 — Impending Doom: instant, 45 yd radius, 10 s, Shadow, dispel Magic, 2000 flat damage after 10 s.
- https://wotlkdb.com/?spell=19703 — Lucifron's Curse: instant, 45 yd radius, 5 min, dispel Curse, +100% power cost all schools.
- https://wotlkdb.com/?spell=19460 — Shadow Shock (Lucifron's): instant, 20 yd range, 419–485 Shadow, single target.
- https://wotlkdb.com/?spell=20604 — Dominate Mind: 2 s cast, 20 yd range, 15 s, Shadow, dispel Magic, mechanic Charmed.
- https://wotlkdb.com/?spell=20691 — Cleave: instant, 15 yd range, Physical weapon damage.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_lucifron.cpp — emulator timers: Impending Doom first 5–10 s then 20–25 s; Curse first 10–15 s then 20–25 s; Shadow Shock every 3–6 s on current target.
- https://www.wowhead.com/classic/guides/lucifron-molten-core-strategy (read through r.jina.ai) — curse "about every 15 seconds", Dominate Mind "every 15 seconds" per Protector, Cleave 180-degree frontal cone, 40 yd / 20 yd outranging, dispel priorities, pull procedure.
- https://warcrafttavern.com/wow-classic/guides/raserisks-molten-core-boss-guide-lucifron — tank Lucifron behind a pillar for line of sight, polymorph mind-controlled players, farm-status cleave stack.
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/236 (Warcraft Tavern encounter page) — ability table: Impending Doom instant/10 s/Magic, Curse instant/5 min/Curse, Shadow Shock 20 yd, Dominate Mind 2 s cast/20 yd/15 s, Cleave 15 yd.
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-1-lucifron — 2005-era tactics: pull guards south, Intimidating Shout on cooldown at pull, dispel priority list.
- https://legacy-wow.com/?p=10547 — 1.12 guide: Impending Doom on all players within 40 yd, Distracting Shot opener, decurse emphasis.
- https://wowtbc.gg/classic/boss-guides/molten-core — modern stack-and-cleave strategy, dispel assignments.
- https://mein-mmo.de/en/wow-classic-how-much-blizzard-buffs-the-molten-core-in-the-classic-mode,742902 — Season of Mastery: 4 Protectors instead of 2.

## Overview
- Level ?? (boss). Health 351,780 in Classic Era 40-player (Wowhead TBC page, identical pre-Cataclysm tuning); 703,560 on Seasonal/Anniversary realms (Wowhead Classic page). Mana 39,300. No enrage timer found in any source. First boss of Molten Core; optional for Majordomo (no rune near him) but killed first in every standard route. Drops the Tome of Tranquilizing Shot needed for Magmadar.
- Phases: none. Single phase; the only state change is the two Flamewaker Protectors dying, after which it is a tank-and-spank.
- Raid-size assumptions: 40-man Classic Era. Season of Mastery: 4 Flamewaker Protectors instead of 2 (mein-mmo, wiki.gg). Season of Discovery has a separate tuned version not covered here.

## Abilities

### Impending Doom
- Name: Impending Doom (spell 19702)
- Type: AoE (room) debuff, delayed damage
- Target rule: all players within radius of Lucifron (DBC radius 45 yd; guides and wiki say 40 yd)
- Cast time (s): instant, not interruptible
- Cooldown or cadence: cmangos script: first cast 5–10 s after pull, then every 20–25 s. Wowhead guide: "casts constantly". No retail log cadence found.
- Damage: 2000 Shadow to each affected player when the 10 s timer expires (nothing before that). Radius 45 yd (DBC) / 40 yd (guides).
- Debuff: Impending Doom, 10 s, dispel type Magic, no spread. Priests (Dispel Magic) and Paladins (Cleanse) remove it. Greater Shadow Protection Potion absorbs the hit if undispelled (Wowhead guide).
- Movement effect: none
- Telegraph: debuff appears on raid frames; no cast bar (instant). 10 s before damage.

### Lucifron's Curse
- Name: Lucifron's Curse (spell 19703)
- Type: AoE (room) debuff
- Target rule: all players within 45 yd (DBC) / 40 yd (guides) of Lucifron
- Cast time: instant, not interruptible
- Cooldown or cadence: wiki.gg and Wowhead guide "every 15 seconds"; cmangos first 10–15 s then 20–25 s.
- Damage: none
- Debuff: Lucifron's Curse, 5 min, dispel type Curse (Mages Remove Lesser Curse, Druids Remove Curse, Restorative Potion). Effect: all spells and abilities cost 100% more (mana, rage, energy). Does not spread.
- Movement effect: none
- Telegraph: none beyond the debuff icon.

### Shadow Shock
- Name: Shadow Shock (spell 19460)
- Type: targeted
- Target rule: cmangos casts on current melee target; Wowhead guide says a random raid member within 20 yd. wiki.gg: "one enemy".
- Cast time: instant
- Cooldown or cadence: cmangos every 3–6 s
- Damage: 419–485 Shadow (DBC 3.3.5 value), range 20 yd. Guides describe it as low, constant damage.
- Debuff: none
- Movement effect: none
- Telegraph: none

### Cleave (Flamewaker Protector)
- Name: Cleave (spell 20691)
- Type: frontal cone (melee)
- Target rule: current tank and nearest allies in front; wiki.gg: up to 3 targets; Wowhead guide: 180-degree frontal cone.
- Cast time: instant
- Cooldown or cadence: unknown (melee-speed cleave)
- Damage: weapon damage plus 85 (wiki.gg); range 15 yd (DBC)
- Debuff: none
- Movement effect: none
- Telegraph: none; positional (face the Protector away)

### Dominate Mind (Flamewaker Protector)
- Name: Dominate Mind (spell 20604)
- Type: mind control
- Target rule: a player within 20 yd of the Protector (humanoid players; wiki says up to level 100)
- Cast time: 2 s cast; interruptible is unknown (not listed; guides treat it as unavoidable and say kill the Protectors fast)
- Cooldown or cadence: Wowhead guide: each Protector mind-controls a player every 15 s. Can be cast at the moment of the pull.
- Damage: none directly; the MC'd player attacks the raid
- Debuff: Dominate Mind, 15 s, dispel type Magic (Priests/Paladins), mechanic Charmed. Does not spread.
- Movement effect: charm (player loses control)
- Telegraph: 2 s cast bar on the Protector.

## Adds
- 2x Flamewaker Protector (NPC 12119), level 62 elite, 90,650 HP each (Era 40-player; 181,300 Seasonal), 25,680 mana. Present from the start (they patrol with Lucifron), not spawned mid-fight. Abilities: Cleave, Dominate Mind. Picked up by off-tanks (classic: two off-tanks per Protector pulled by hunters away from Lucifron; modern: one off-tank holds both beside Lucifron, angled away, and melee cleave all three). They die to raid damage; standard kill order is Protectors first, then Lucifron. Season of Mastery: 4 Protectors.

## Positioning and movement
- Tank: Classic routes pull Lucifron when he patrols near Magmadar's cavern after clearing the first (and second) Core Hound pack for space. Main tank takes Lucifron in the opposite direction from the Protectors; Raserisk's guide tanks him behind a pillar so the raid is out of line of sight of Impending Doom/Curse. Facing does not matter for Lucifron (no cone). Never drag him toward the western tunnel (imps/surgers chain-aggro, wiki.gg) and never into the entry tunnel (imp respawns, Wowhead guide).
- Melee DPS: behind/side of the Protectors, never in front of them (Cleave 180-degree cone). Expect Shadow Shock within 20 yd of Lucifron; carry Shadow Protection. Stop cleaving if a mind-controlled player is in the cleave.
- Ranged DPS: outside 40 yd of Lucifron for Curse and Doom (needs +range talents to reach 41 yd), outside 20 yd of the Protectors for Dominate Mind. Mages begin DPS only when not needed for decursing (wiki: "nuke at 20–25% HP").
- Healers: default 40 yd heal range keeps them outside the curse/doom radius in the classic spread strategy; in the stack strategy they are inside and must be decursed first. Dedicated decurser assigned to the tank.
- Whole raid: at pull only tanks and two or three "dummies" stand forward to eat the opening Dominate Mind (wiki.gg, Wowhead guide). Once positioned, the raid either (a) spreads at 40+ yd (classic) or (b) stacks all three mobs and cleaves (farm status).

## What each role must do and must not do
- Tank:
  1. Pull Lucifron away from the Protectors' pull direction; let hunters/off-tanks pick up the Protectors first.
  2. Do not move toward either tunnel.
  3. Be the first decurse/dispel priority (a cursed tank's rage costs double).
  4. If a Protector MCs a healer, keep the Protector faced away so the Cleave does not hit the MC'd player.
- DPS:
  1. Kill Protectors before Lucifron.
  2. Melee never stand in front of a Protector.
  3. Mages: decurse first, DPS second.
  4. Do not kill mind-controlled players; stop cleaving them, polymorph/CC them until dispelled (Raserisk, legacy-wow).
- Healer:
  1. Dispel Impending Doom within 10 s; priority healers > tanks > MC'd players > rest (Wowhead guide).
  2. Decurse/dispel the tank first.
  3. Downrank or hold casts while cursed; Restorative Potion (2 min) as backup.
  4. Dispel Dominate Mind off MC'd players immediately.

## Timeline of a typical pull
- t=0 pull: hunters Distracting Shot the two Protectors toward their off-tanks; MT engages Lucifron. Protectors can start a 2 s Dominate Mind immediately.
- t=3–6 s: first Shadow Shock on the tank, then every 3–6 s for the whole fight (cmangos).
- t=5–10 s: first Impending Doom on everyone within ~40–45 yd; damage lands 10 s later if not dispelled; repeats every 20–25 s (cmangos) or "every 15 s" (guides).
- t=10–15 s: first Lucifron's Curse on everyone within ~40–45 yd; repeats every 15–25 s.
- t≈15 s, 30 s, 45 s...: each living Protector casts another Dominate Mind (Wowhead guide cadence).
- t≈30–60 s: Protectors die (90k HP each) under cleave; Dominate Mind stops.
- t≈1–3 min: Lucifron dies (351k HP). Nothing changes at any HP threshold.

## Open questions
- Radius of Impending Doom / Lucifron's Curse: DBC says 45 yd; wiki.gg, Wowhead guide and legacy-wow say 40 yd.
- Curse cadence: wiki.gg and Wowhead guide "every 15 seconds"; cmangos 20–25 s after a 10–15 s opener. No Warcraft Logs timeline could be fetched.
- Shadow Shock: DBC 19460 is a single-target 20 yd spell on the current target (cmangos); Raserisk's guide calls it "an AoE that hits melee". Spell 20603 (740–860, 20 yd radius) exists but belongs to the Flamewaker Healer.
- Protector HP: Wowhead TBC 90,650 vs Seasonal 181,300; Protector level shown as 62 (Wowhead) vs 32 (wiki.gg display error).
- Whether Dominate Mind can be interrupted is not stated anywhere fetched.
