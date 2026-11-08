# Jin'do the Hexxer (Zul'Gurub)

Sources: list every URL used, one per line, with what it contributed.
- https://classic.warcraftdb.com/data/npc/11380 (API) — level 63 World Boss, health 319,800, mana 26,200; abilities Banish 24466 (100 yd, "Summon Enemy Player"), Delusions of Jin'do 24306 (20 s), Hex 24053 (20 yd, 5 s), Powerful Healing Ward 24309 (4 min), Summon Brain Wash Totem 24262 (30 yd, 4 min).
- https://classic.warcraftdb.com/data/npc/15112 — Brain Wash Totem: level 60, 2,961–3,052 HP; Brain Wash 24261 (100 yd charm).
- https://classic.warcraftdb.com/data/npc/14987 — Powerful Healing Ward: level 60, 2,699 HP; Powerful Healing Ward 24311 (heal 10,000).
- https://classic.warcraftdb.com/data/npc/14986 — Shade of Jin'do: level 60, 1,526 HP; Shadow Shock 24458 (602 Shadow, 20 yd), invisibility passive.
- https://classic.warcraftdb.com/data/npc/14826 — Sacrificed Troll: level 60, 762 HP.
- https://classicdb.ch/?spell=24306 — Delusions of Jin'do: instant, 100 yd, Curse, 20 s, 175 Shadow per 2 s + invisibility detection.
- https://classicdb.ch/?spell=24308 — Summon Shade of Jin'do (NPC 14986, 240 s).
- https://classicdb.ch/?spell=24053 — Hex: instant, 300 mana, 20 yd, 5 s, Magic, polymorph (frog) + confuse.
- https://classicdb.ch/?spell=24309 / 24310 / 24311 — Powerful Healing Ward: totem summon (value 1000), periodic every 3 s, heal 10,000.
- https://classicdb.ch/?spell=24262 / 24261 — Summon Brain Wash Totem (value 4000); Brain Wash: charm 100 yd.
- https://classicdb.ch/?spell=24466 — Banish: instant, 100 yd, Summon Enemy Player (teleport to the pit).
- https://classicdb.ch/?spell=24458 — Shadow Shock: instant, 20 yd, 602 Shadow.
- https://warcraft.wiki.gg/wiki/Jin%27do_the_Hexxer — Classic encounter: Brain Wash Totem MC nearest member, not dispellable, destroy totem; Powerful Healing Ward 10,000 per tick (~3%), MS/Wound Poison → ~4,300; teleport to the skeleton pit; Hex on the top-threat target, dispellable; Delusions 200 per 2 s — do not decurse; Shades ~2,000 HP, melee for 1 + interrupt, Shadow Shock ~600, AoE/reflect immune; tactics (bear tank or 3 warriors, kill order, fears pre-pull, hunter MA, pit mage, shadow resistance, drain mana).
- https://www.wowhead.com/classic/guide/jindo-the-hexxer-zul-gurub-strategy (via r.jina.ai) — hardest fight in ZG; assign tank healer, pit mage, Hex dispeller; AoE fears pre-pull and on CD; kill order Shade → Healing Ward → Brain Wash Totem → Jin'do; Shades attack uncursed players too, melee interrupts, Shadow Shock ~600, AoE immune; Healing Ward out-heals raid DPS, keep MS/Wound Poison on Jin'do; Brain Wash Totem more HP, MC not dispellable; Hex → attacks 2nd on threat, bear druids immune (1 tank); Teleport random player to pit, Sacrificed Trolls spawn only then — pit mage or tank Jin'do on the pit.
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — hardest boss, blue+ gear, shadow resistance, AoE fears, Wound Poison IV/MS, Shades single-target only, ward ~3% per tick, mana drain stops wards, totems MC until they die, only DPS Jin'do with no totems up.
- https://www.tentonhammer.com/guides/zul-gurrub-boss-guide-boss-7-jin-do-the-hexxer — Healing Totem ~1,000 HP, MC Totem ~4,000 HP, Shades ~1,500 HP elite, curse ~15 s, pit skeletons respawn ~20 s; sheep MC'd players; MS on Jin'do.
- https://us.millenium.gg/guide/6831.html?page=8 — clear skeletons pre-pull, mage clears them during; totems summoned all fight; Brain Wash tends to the highest-threat player; dispel Hex fast; cursed DPS focus Shades.
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — Brainwash Totem highest priority; Healing Totem ~3%/tick; Hex = de-aggro if on the MT; Teleport → mage/warlock AoE the pit; Delusions 200 per 2 s, do not dispel, cursed players kill shades, everyone should kill at least one.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/zulgurubScripts.cpp — spell scripts for Delusions of Jin'do and Summon Shade of Jin'do (a Shade is summoned per curse application).

## Overview
- Level 63 ("??"), World Boss. Health 319,800 (Era), mana 26,200. No enrage timer. OPTIONAL (no effect on Hakkar), located on the Devil's Terrace before Hakkar's bridge; widely called the hardest fight in ZG and often skipped. Single phase, mechanics repeat until he dies.
- Phases: none; a recurring add/totem cycle. Target priority: Shade of Jin'do → Powerful Healing Ward → Brain Wash Totem → Jin'do.
- Raid-size assumptions: 20-man Classic Era. Shadow resistance (Prayer of Shadow Protection, SR gear on everyone but the MT, Greater Shadow Protection Potions) is recommended by all sources. No SoD-specific values found.

## Abilities

### Delusions of Jin'do
- Name: Delusions of Jin'do (24306)
- Type: targeted debuff + summon add
- Target rule: random player (100 yd); several players carry it at once
- Cast time: instant
- Cooldown or cadence: frequent, unknown interval
- Damage: 175 Shadow every 2 s for 20 s (DBC; wiki/Amazon Basin 200 per 2 s; Tentonhammer ~15 s)
- Debuff: Curse, 20 s. Grants invisibility detection: only cursed players can see and attack Shades. DO NOT decurse (mages/druids), unless the raid is desperate.
- Movement effect: none
- Telegraph: curse icon; a Shade spawns on each application (cmangos spell script, wiki)

### Summon Shade of Jin'do
- Name: Summon Shade of Jin'do (24308)
- Type: summon adds
- Target rule: one Shade per cursed player, near them
- Cast time: instant (triggered with the curse)
- Cooldown or cadence: with every Delusions
- Damage: see Adds
- Debuff: n/a
- Movement effect: n/a
- Telegraph: visible only to cursed players

### Powerful Healing Ward
- Name: Powerful Healing Ward (24309 → 24310 → 24311)
- Type: summon totem (heal)
- Target rule: at his feet (5 yd)
- Cast time: instant; 200 mana
- Cooldown or cadence: "throughout the fight" (unknown); lasts 4 min or until killed
- Damage: heals Jin'do 10,000 every 3 s (~3% of 319,800 per tick); Mortal Strike/Wound Poison IV on Jin'do cut this to ~4,300 (wiki)
- Debuff: n/a. The totem has 2,699 HP (DB; summon value 1,000; Tentonhammer "just over 1,000")
- Movement effect: n/a
- Telegraph: totem appears — hunter MA calls it; priority 2

### Summon Brain Wash Totem
- Name: Summon Brain Wash Totem (24262) → Brain Wash (24261)
- Type: summon totem (mind control)
- Target rule: totem within 30 yd; it mind-controls the nearest raid member (wiki) / tends to the highest-threat player (Millenium) for as long as it stands
- Cast time: instant
- Cooldown or cadence: throughout the fight; lasts 4 min or until killed
- Damage: n/a; the MC'd player attacks/fears/heals as their class
- Debuff: Brain Wash charm — NOT dispellable; ends only when the totem dies. Totem HP 2,961–3,052 (DB; Tentonhammer ~4,000)
- Movement effect: MC
- Telegraph: totem; Polymorph the MC'd player while the totem is killed (Tentonhammer); avoid Multi-Shot near it (hits the MC'd player)

### Hex
- Name: Hex (24053)
- Type: debuff (polymorph / aggro drop)
- Target rule: top of his threat list (usually the MT), 20 yd
- Cast time: instant; 300 mana
- Cooldown or cadence: unknown
- Damage: none
- Debuff: Hex 5 s (DBC), Magic — priest/paladin dispel; frog form (confuse). While hexed, Jin'do attacks the next player on threat. Druids in Bear Form are immune (polymorph effect) → a druid MT bypasses it entirely.
- Movement effect: wander confused
- Telegraph: frog model; an OT taunts/holds until dispelled

### Banish (Teleport to the pit)
- Name: Banish (24466)
- Type: teleport
- Target rule: random raid member (100 yd)
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: none directly; Sacrificed Trolls (skeletons) spawn in the Bloodfire Pit and attack the teleported player
- Debuff: none
- Movement effect: the player is in the pit and must climb out
- Telegraph: a player disappears; assigned mage AoEs the pit (skeletons 762 HP) or the raid tanks Jin'do on the pit edge and AoEs them

## Adds
- Shade of Jin'do (NPC 14986): level 60, 1,526 HP (wiki ~2,000, Tentonhammer ~1,500), invisible except to cursed players, spawned one per Delusions application; AoE- and reflect-immune; melee hits for ~1 but interrupt spellcasting; Shadow Shock 602 Shadow (20 yd). They attack anyone, including uncursed players and healers. Cursed players (including healers) kill their own Shade with single-target damage/instant DoTs (three DoTs kill one); hunters can mark one for their pet. Priority 1.
- Powerful Healing Ward (NPC 14987): 2,699 HP, heals Jin'do 10,000 per 3 s. Priority 2; everyone uncursed switches to it instantly.
- Brain Wash Totem (NPC 15112): 2,961–3,052 HP, mind-controls one player until destroyed. Priority 3; sheep the MC'd player meanwhile.
- Sacrificed Trolls (NPC 14826): level 60 skeletons, 762 HP, in the Bloodfire Pit; spawn/respawn (~20 s per Tentonhammer) when someone is teleported in; pit mage AoEs them; clear the pit pre-pull.

## Positioning and movement
- Tank: a Bear druid MT (immune to Hex) is ideal and allows one tank. Otherwise a warrior MT plus two OTs (in case the MT is hexed while an OT is brainwashed). Tank him near/at the skeleton pit edge so pit skeletons are AoE'd by the raid (Wowhead option) or at a fixed spot with the pit mage separate. Face him away from the raid. Don't stand on top of totems' spawn so melee can reach them.
- Melee DPS: at his flank; swap targets instantly by priority (Shades you can see → Ward → Totem → Jin'do); arms warrior keeps Mortal Strike on Jin'do, rogue keeps Wound Poison IV (Jin'do only gets hit when no adds are up, so MS/WP uptime matters when a Ward is up). Pre-cast Intimidating Shout before the pull and keep fears on cooldown so a brainwashed warrior can't fear the raid.
- Ranged DPS: spread out around him in range of the totems; hunter is main assist and calls totems; no Multi-Shot onto Brain Wash (hits the MC'd player); warlocks keep Curse of Shadows off? (no — curses on him are fine) and their pets on Shades; one mage (plus a backup) on pit duty; everyone with the curse switches to their Shade with single-target spells/instant DoTs. Optionally hunters/warlocks/priests drain his mana early (wards need mana — Viper Sting maintenance).
- Healers: one dedicated to the MT; others spot-heal (everyone takes curse ticks, Shadow Shocks, MC damage). Cursed healers switch to killing their Shade with DoTs/wands; Shades on healers are killed first (interrupts). Priest/paladin dispels Hex off the MT at once; nobody decurses Delusions.
- Whole raid: SR gear, Prayer of Shadow Protection; stay out of the pit; keep fears on cooldown; group around him at mixed ranges so a brainwashed player can be sheeped quickly.

## What each role must do and must not do
- Tank:
  1. Bear druid if available (ignores Hex); else MT + 2 OTs with taunt plan for Hex.
  2. Face him away; hold him where totems are reachable by melee.
  3. When hexed: OT taunts; priest/paladin dispels; MT taunts back.
  4. Never use Intimidating Shout off cooldown (pre-pull it so it is down if you get MC'd).
- DPS:
  1. Strict priority: Shade (if you are cursed) → Powerful Healing Ward → Brain Wash Totem → Jin'do. Never hit Jin'do with totems up.
  2. Arms warrior/rogue: keep Mortal Strike/Wound Poison IV on Jin'do at all times.
  3. Do not decurse Delusions; cursed players kill Shades with single-target/instant DoTs (AoE-immune).
  4. Pit mage: AoE the skeletons whenever someone is teleported; backup mage ready.
  5. Sheep brainwashed players; no Multi-Shot/AoE through Brain Wash.
- Healer:
  1. Dispel Hex instantly (Magic); never dispel Delusions.
  2. Dedicated MT healer; others spot-heal curse ticks (175–200 per 2 s) and Shadow Shocks (~600).
  3. If cursed, kill your Shade (it interrupts you anyway); if a Shade is on an uncursed healer, call for a cursed DPS.
  4. Pre-shield players likely to be teleported? Not possible (random) — react with HoTs on the pit victim.

## Timeline of a typical pull
- Pre-pull: clear the terrace and the pit skeletons; Prayer of Shadow Protection; warriors/priests/warlocks use AoE fears to put them on cooldown; assignments (MT healer, pit mage + backup, Hex dispeller, hunter MA).
- t=0: pull; MT establishes. Within the first 10–20 s expect the first Delusions curses (and Shades), then the first totem (Healing Ward or Brain Wash) and a Hex on the MT.
- Loop (every ~20–40 s, exact timers unknown): Delusions on random players → each cursed player kills their Shade; Powerful Healing Ward → all uncursed DPS kill it within one tick (3 s) if possible; Brain Wash Totem → sheep the MC'd player, kill the totem; Hex → OT taunt + dispel; Banish → pit mage AoEs skeletons, victim climbs out. Jin'do is DPS'd only in the gaps; MS/WP maintained.
- Kill at 319,800 HP: typically 5–8 minutes with disciplined priority. "Jin'do's Hexxer", "Bloodtinged Gloves", Zandalar reputation.

## Open questions
- Delusions tick/duration: 175 per 2 s for 20 s (DBC) vs 200 per 2 s (wiki, Amazon Basin) vs ~15 s (Tentonhammer).
- Totem HP: Healing Ward 2,699 (DB) vs ~1,000 (Tentonhammer, summon value); Brain Wash 2,961–3,052 (DB) vs ~4,000 (Tentonhammer, summon value).
- Brain Wash target: nearest player (wiki) vs highest threat (Millenium).
- Hex duration: 5 s (DBC) vs "until the Hex expires" without a number (wiki); dispellable per all sources.
- Shade HP: 1,526 (DB) vs ~1,500 (Tentonhammer) vs ~2,000 (wiki).
- Whether mana-draining Jin'do (26,200 mana; Ward costs 200) is practical — wiki/Warcraft Tavern say wards stop at 0 mana.
- No cadences for Delusions/totems/Hex/Banish in any source; Warcraft Logs not accessible.
