# Golemagg the Incinerator (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Golemagg_the_Incinerator — Golemagg's Trust +500 damage/+50% speed, Magma Splash (armor melt + Fire DoT 30 s), Pyroblast "1009 + 84/3 s for 12 s", Earthquake 1388–1612 below 10%; Core Rager Mangle 300/2 s + 50% slow 20 s, horns glow in buff range, dogs cannot die; tactics (high FR tank, two tanks, kite dogs far away, melee out at 10%).
- https://warcraft.wiki.gg/wiki/Core_Rager — Mangle 252/2 s (conflicting), cannot be killed while Golemagg lives, die when he dies.
- https://www.wowhead.com/tbc/npc=11988/golemagg-the-incinerator (r.jina.ai) — health 826,088; ability IDs 20553, 20228, 19798; "Attract Rager" listed.
- https://www.wowhead.com/classic/npc=11988/golemagg-the-incinerator (r.jina.ai) — Seasonal 40 health 1,652,176.
- https://www.wowhead.com/tbc/npc=11672/core-rager (r.jina.ai) — Core Rager level 62, health 80,925.
- https://www.wowhead.com/classic/npc=11672/core-rager (r.jina.ai) — Core Rager Seasonal health 161,850.
- https://wotlkdb.com/?spell=13879 — Magma Splash passive: 25% proc on melee → 13880.
- https://wotlkdb.com/?spell=13880 — Magma Splash debuff: 93–107 Fire + 50 Fire every 3 s for 30 s, -250 armor (stacks).
- https://wotlkdb.com/?spell=37667 — Magma Splash (TBC-era ID listed by Wowhead): 139–161 + 100/3 s, 30 s.
- https://wotlkdb.com/?spell=20228 — Pyroblast: instant, 40 yd, 1388–1612 Fire + 200 every 3 s for 12 s.
- https://wotlkdb.com/?spell=19798 — Earthquake: instant, 18 yd radius, 1388–1612 Physical, mechanic Stunned.
- https://wotlkdb.com/?spell=19953 — Enrage (Golemagg, unconfirmed): 10 s, +500 physical damage, +50% melee haste.
- https://wotlkdb.com/?spell=20556 and https://wotlkdb.com/?spell=20553 — Golemagg's Trust: serverside 1 s pulse → 30 yd radius, 2 s, +500 physical damage, +50% haste, +20% size on Core Ragers.
- https://wotlkdb.com/?spell=19820 — Mangle: instant, 10 yd, 20 s, -50% run speed, 300 damage every 2 s.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_golemagg.cpp — Pyroblast every 7 s on random player; Earthquake every 3 s from 10% HP; Enrage 19953 commented "unconfirmed"; Core Rager Mangle 7 s then 10 s; Full Heal (17683) when below 50% with "refuses to die" emote; death prevention; Quiet Suicide when Golemagg dies (event within 100 yd).
- https://www.wowhead.com/classic/guides/golemagg-the-incinerator-molten-core-strategy (r.jina.ai) — 4 tanks, swap at 5–6 Magma Splash stacks, Core Ragers +50% speed when close (glow red), Earthquake at 10% "every couple seconds", Curse of Weakness on dogs; comments say dogs vanish at his death.
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/243 (Warcraft Tavern) — Magma Splash 30 s, Golemagg's Trust 2 s, Pyroblast 40 yd/12 s, Mangle 10 yd/20 s; 6 stacks "too many"; taunt swap; tank dogs away but not so far they reset.
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-7-golemagg — Magma Splash starts 50/3 s & -250 armor, stacked to 1000+/3 s & -5000 armor; Pyroblast 2000 + 200/3 s 12 s; Rager regenerates to full below 50% with emote; "Attract Rager" and faster attacks after 10%; 2 hunters pull dogs to the back; 2 OTs + 3–4 healers on dogs.
- https://wowtbc.gg/classic/boss-guides/molten-core — stack boss and dogs for cleave once geared, 3 tanks minimum, taunt off at 6 stacks.
- https://mein-mmo.de/en/wow-classic-how-much-blizzard-buffs-the-molten-core-in-the-classic-mode,742902 — SoM: Earthquake throughout, not only below 10%.

## Overview
- Level ?? (boss). Health 826,088 (Era 40-player); 1,652,176 Seasonal. No mana. No timed enrage; at 10% HP he begins Earthquake (and reportedly attacks faster) as a soft enrage. Eighth boss (order with Sulfuron varies); required (Rune of Blaz is Garr's; Golemagg guards Rune of Theri).
- Phases: (1) 100–10%: tank swaps and Pyroblasts; (2) below 10%: Earthquake every 3 s on everyone within 18 yd — melee leave, ranged finish.
- Raid-size assumptions: 40-man Era, 3–4 tanks (2 on Golemagg, 1 per Core Rager). SoM: Earthquake all fight, permanent Trust on dogs.

## Abilities

### Magma Splash
- Name: Magma Splash (passive 13879 → debuff 13880)
- Type: debuff (melee proc, stacking)
- Target rule: 25% chance on each of Golemagg's melee hits against his current target (tank); wiki says "the target"; melee DPS also report stacks (guides) — Ten Ton Hammer calls it a melee-range DoT "on the attacker".
- Cast time: instant proc
- Cooldown or cadence: proc, so roughly one stack every 4 swings
- Damage: 93–107 Fire on application, then 50 Fire every 3 s per stack, and -250 armor per stack, 30 s (refreshed). Ten Ton Hammer: stacked to 1000+/3 s and -5000 armor (i.e. 20 stacks).
- Debuff: Magma Splash, 30 s, no dispel type; stacks (no max in DBC). Falls off 30 s after the last application — the basis of the tank swap.
- Movement effect: none
- Telegraph: stack counter on the tank; swap at 5–6 stacks (Wowhead guide, wowtbc.gg).

### Pyroblast
- Name: Pyroblast (spell 20228)
- Type: targeted
- Target rule: random player within 40 yd
- Cast time: instant (DBC)
- Cooldown or cadence: cmangos every 7 s
- Damage: 1388–1612 Fire + 200 Fire every 3 s for 12 s (800 more). wiki: 1009 + 84/3 s; Ten Ton Hammer: 2000 + 200/3 s.
- Debuff: Pyroblast DoT 12 s, no dispel type listed (Fire DoT; Fire resistance mitigates). No spread.
- Movement effect: none
- Telegraph: none; healers watch for the hit and top the target up.

### Earthquake
- Name: Earthquake (spell 19798)
- Type: AoE (around boss)
- Target rule: everyone within 18 yd
- Cast time: instant
- Cooldown or cadence: starts at 10% HP, then every 3 s (cmangos); Wowhead guide "every couple seconds"
- Damage: 1388–1612 Physical per cast, 18 yd; mechanic Stunned (brief)
- Debuff: none
- Movement effect: possible stun (DBC mechanic)
- Telegraph: boss at 10%; melee leave at that moment.

### Enrage (unconfirmed)
- Name: Enrage (spell 19953)
- Type: enrage
- Target rule: self
- Cast time: instant
- Cooldown or cadence: unknown; cmangos has it disabled as "unconfirmed"; Ten Ton Hammer reports faster attacks after 10%.
- Damage: +500 physical damage, +50% melee haste for 10 s if used
- Debuff: dispel type none listed (not Tranq-able per sources)
- Telegraph: unknown

### Golemagg's Trust
- Name: Golemagg's Trust (serverside 20556 pulsing 20553 every 1 s)
- Type: other (buff on adds)
- Target rule: Core Ragers within 30 yd of Golemagg
- Cast time: passive
- Cooldown or cadence: continuous while in range (2 s buff refreshed every 1 s)
- Damage: none; Core Rager gets +500 physical damage, +50% attack speed, +20% size (horns glow red)
- Debuff: not dispellable (none listed); drops 2 s after leaving 30 yd
- Movement effect: none
- Telegraph: dogs grow and glow while buffed — the only in-game indicator (wiki).

### Mangle (Core Rager)
- Name: Mangle (spell 19820)
- Type: targeted debuff (melee)
- Target rule: current target of the Core Rager (its tank)
- Cast time: instant
- Cooldown or cadence: cmangos first 7 s then every 10 s ("probably wrong")
- Damage: 300 Physical every 2 s for 20 s (3000 total; wiki Core Rager page says 252), -50% movement speed; 10 yd
- Debuff: Mangle, 20 s, no dispel type
- Movement effect: 50% snare
- Telegraph: none

### Refuse Death / Full Heal (Core Rager)
- Name: Full Heal (17683) with emote "Core Rager refuses to die while its master is in trouble"
- Type: other
- Target rule: self, when the Core Rager drops below 50% HP (cmangos; Ten Ton Hammer agrees)
- Cast time: instant
- Cooldown or cadence: whenever below 50%
- Damage: heals to full; the dogs cannot be killed while Golemagg lives (death prevention); they die (Quiet Suicide) the moment he dies.
- Telegraph: emote.

## Adds
- 2x Core Rager (NPC 11672), level 62 elite, 80,925 HP (Era; 161,850 Seasonal). Present from the start. Abilities: Mangle, Thrash, Full Heal below 50%, Golemagg's Trust when within 30 yd of him. Two hunters pull them to the back of the cavern (Ten Ton Hammer); one off-tank each holds them 30+ yd from Golemagg but not so far they evade/reset (Warcraft Tavern). Do not DPS them (they heal to full; Warlocks use Siphon Life for free health and Curse of Weakness to help the OTs). They die automatically when Golemagg dies (wiki, cmangos, Wowhead comments; the Wowhead guide text claims they must be killed afterwards — conflicting).

## Positioning and movement
- Tank: tank Golemagg where he stands (he does not need moving), facing away from the raid (Warcraft Tavern). Two tanks with high Fire resistance alternate: the second taunts at 5–6 Magma Splash stacks; the first steps out until the 30 s debuff clears, then taunts back. At 10% the active tank stays; everyone else within 18 yd leaves.
- Melee DPS: behind Golemagg; step out when their own Magma Splash stacks get high and wait for them to fall off (Wowhead guide); leave entirely at 10% (Earthquake 18 yd). Near the end some guides move melee onto the dogs — pointless, since they die with him.
- Ranged DPS: max range behind him, spread (Pyroblast is single-target so spacing is not critical); finish the last 10%.
- Healers: 2 on the Golemagg tanks (rotating), 1 per dog tank (3–4 total on dogs per Ten Ton Hammer), rest on Pyroblast targets. Long fight: manage mana, rotate healers.
- Whole raid: dogs at the back of the cavern 30+ yd from Golemagg; raid in a crescent behind the boss; at 10% only the tank inside 18 yd.

## What each role must do and must not do
- Tank:
  1. Two Golemagg tanks taunt off each other at 5–6 Magma Splash stacks; the resting tank waits out 30 s.
  2. Dog tanks keep the Core Ragers 30+ yd from Golemagg (no glowing horns) and inside healer range; never let them evade.
  3. Fire resistance gear for the Golemagg tanks.
  4. Stay on him through Earthquake at 10%.
- DPS:
  1. All DPS on Golemagg; never on the dogs (they heal to full at 50%).
  2. Melee: step out to drop Magma Splash stacks; leave at 10%.
  3. Warlocks: Curse of Weakness on both dogs; Siphon Life on dogs is free healing.
  4. Watch threat early — dog tanks and Golemagg tanks swap, so threat on Golemagg is shared between two tanks.
- Healer:
  1. Heal every Pyroblast target immediately (1400–1600 + 800 DoT can kill a caster).
  2. Keep both Golemagg tanks topped through stacking DoT and armor loss.
  3. At 10% raid-heal through Earthquake (1400–1600 to anyone within 18 yd every 3 s).
  4. Rotate healers for mana; the fight is long (826k HP).

## Timeline of a typical pull
- t=0: MT engages Golemagg; two hunters drag the Core Ragers to the back (30+ yd) to their OTs; dogs stop glowing once out of range.
- t=7 s: first Pyroblast on a random player; then every 7 s for the whole fight.
- t=7 s: first Mangle on dog tanks; repeats every ~10 s.
- t≈30–60 s: Golemagg tank reaches 5–6 Magma Splash stacks; second tank taunts; swap repeats every ~30–45 s.
- Dog under 50% at any time → heals to full with emote.
- 10% HP (~82k left): Earthquake every 3 s (1388–1612, 18 yd); melee out; ranged finish.
- Golemagg dies → both Core Ragers die instantly. Typical length 5–8 min in Era gear.

## Open questions
- Who gets Magma Splash: DBC proc on Golemagg's melee target (tank) vs guides saying melee DPS stack it from attacking him.
- Pyroblast damage: 1388–1612 + 200/3 s (DBC) vs 1009 + 84/3 s (wiki) vs 2000 + 200/3 s (Ten Ton Hammer).
- Enrage at 10%: Ten Ton Hammer reports faster attacks; cmangos lists 19953 as unconfirmed; Wowhead guide treats Earthquake as "his enrage".
- "Attract Rager" (Ten Ton Hammer, Wowhead TBC ability list): a 10% aggro-pull to the dogs; no spell data or modern confirmation.
- Core Rager fate: die with Golemagg (wiki, cmangos, comments) vs "must be killed after" (Wowhead guide text).
- Mangle tick: 300 (DBC, wiki Golemagg page) vs 252 (wiki Core Rager page).
