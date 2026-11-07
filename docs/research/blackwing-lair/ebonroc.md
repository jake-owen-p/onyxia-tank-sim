# Ebonroc (Blackwing Lair)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Ebonroc — ability list (Shadow of Ebonroc 23340, Shadow Flame 22539, Wing Buffet 23339, Thrash, Summon Player), Wing Buffet -50% threat, three-tank layout (12/3/9 o'clock), taunt on Shadow of Ebonroc with two taunts, buffet tank holds taunt for ~15 s before the buffet, buffets up to 5 s late on a 30 s timer, ~100 shadow resistance → 25% hit chance claim, corner positioning.
- https://classicdb.ch/?npc=14601 — HP 999,300, melee 15,715–18,235, armor 4,641, abilities 22539/23339/3391/23340.
- https://classicdb.ch/?spell=23340 — Shadow of Ebonroc: 20 yd, instant, 8 s, "When melee damaged, heals Ebonroc for 25000."
- https://classicdb.ch/?spell=22539 — Shadow Flame: 45 yd cone, 2 s cast, 3938–5063 Shadow.
- https://classicdb.ch/?spell=22682 — Shadow Flame DoT without the cloak: 1750–2251/s for 10 s.
- https://classicdb.ch/?spell=23339 — Wing Buffet: 1 s cast, 563–938 Physical, 20 yd frontal cone, knockback.
- https://classicdb.ch/?spell=3391 — Thrash: 2 extra attacks.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_ebonroc.cpp — emulator timers: Shadow of Ebonroc first 45 s then 25–35 s; Shadow Flame 18 s then 15–18 s; Wing Buffet 30 s then 30–35 s (reduces threat of everyone hit); Thrash 6 s then 2–6 s.
- https://github.com/BigWigsMods/BigWigs_Classic/blob/master/BlackwingLair/Ebonroc.lua — Wing Buffet bars 29 s / 32 s; Shadow of Ebonroc 8 s target bar.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/BWL/Ebonroc.lua — log variance: Wing Buffet 31.1–36 s (first 30.2–35.6), Shadow Flame 12.9–23.4 s (first 11.3–21.1), Shadow of Ebonroc 8 s, "taunt" special warning.
- https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ — Shadow of Ebonroc 8 s / 25,000 heal per hit, >200 shadow resistance to resist it, OTs taunt constantly, MT front with OTs 90 degrees left/right, raid directly behind, faster kill is better.
- https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-six — 2006: pull him when away from Flamegor, Onyxia Scale Cloaks on everyone, taunt off the MT whenever the debuff lands, keep Mortal Strike on him, OTs on the opposite side taunt for Shadow Flame/Wing Buffet.
- https://us.millenium.gg/guide/6486.html?page=5 — "heals for 25,000 HP" per hit on the debuffed target, three tanks alternate, Onyxia cloak for everyone.
- Wowhead comment via search snippet (page region-blocked) — anecdote that he becomes taunt-immune after two consecutive taunts until Wing Buffet resets it; treat as unverified.

## Overview
- Level ?? (boss), HP 999,300 (classicdb.ch), melee 15,715–18,235 with Thrash, armor 4,641. No enrage. Fifth boss; second drake in the Crimson Laboratories (upper room, patrols the stairs near Flamegor). Required in practice. Can be Taunted.
- Phases: single phase. The mechanic is Shadow of Ebonroc: an 8 s debuff on his current target; every melee hit he lands on that target heals him for 25,000. Tanks swap by Taunt the instant it is applied so he hits someone without the debuff.
- Raid-size assumptions: 40-man Classic Era. Season of Mastery/Discovery fight Ebonroc and Flamegor together with Brand of Shadow/Brand of Flame — not applicable here.

## Abilities

### Shadow of Ebonroc
- Type: debuff (tank swap trigger)
- Target rule: his current target (the tank), 20 yd
- Cast time: instant
- Cooldown: first ~45 s, then every 25–35 s (cmangos); guides call it frequent. It can be partially resisted with Shadow Resistance (Warcraft Wiki claims ~100 SR → 25% chance to be hit; Warcraft Tavern says >200 SR resists fairly reliably — see Open questions).
- Damage: none directly
- Debuff: Shadow of Ebonroc, 8 s, Shadow school, dispel type none, does not spread. While it is on a player, each melee hit Ebonroc lands on that player heals Ebonroc for 25,000 (classicdb.ch; Warcraft Tavern; Millenium). With Thrash he can land 3 hits in ~2 s, i.e. 75k healed — ~7.5% of his health per swap failure.
- Movement effect: none
- Telegraph: debuff on the tank; DBM "Taunt!" special warning, BigWigs 8 s bar.

### Shadow Flame
- Type: frontal cone
- Target rule: cone in front of him, 45 yd, toward his current target
- Cast time: 2 s
- Cooldown: first ~18 s then 15–18 s (cmangos); logs 12.9–23.4 s with a first cast at 11.3–21.1 s (DBM)
- Damage: 3938–5063 Shadow; without the Onyxia Scale Cloak, an additional 1750–2251 Shadow every 1 s for 10 s (fatal)
- Debuff: the no-cloak DoT only
- Movement effect: none
- Telegraph: 2 s cast bar; PW:S the tank during it.

### Wing Buffet
- Type: frontal cone knockback / threat reduction
- Target rule: all enemies in a 20 yd cone in front of him
- Cast time: 1 s
- Cooldown: first ~30 s then every 30–35 s (cmangos, Warcraft Wiki "can be up to 5 s after the 30 s timer"); logs 31.1–36 s (DBM); BigWigs 29/32 s
- Damage: 563–938 Physical
- Debuff: none
- Movement effect: knockback (short, fast); threat of everyone hit reduced ("50%" — Warcraft Wiki strategy)
- Telegraph: 1 s cast bar and the boss-mod timer.

### Thrash
- Type: melee (extra attacks)
- Target rule: current target
- Cadence: 2–6 s (cmangos)
- Damage: 2 extra swings. Combined with Shadow of Ebonroc this is what makes a slow taunt expensive.

### Summon Player
- Type: aggro pull / teleport
- Target rule: an enemy player out of reach (20 yd placement radius)
- Effect: puts the player in front of him. Rare.

## Adds
- None. Pull him when his patrol separates him from Flamegor (Ten Ton Hammer); the lab packs between Firemaw and his stairs must be cleared first.

## Positioning and movement
- Tank: pull him into the angle between the staircase he patrols and the wall (Warcraft Wiki) so knockbacks have nowhere to go. Three tanks: MT at 12 o'clock (in front, back to the wall), OT1 at 3 o'clock and OT2 at 9 o'clock, both inside his hitbox, both wearing the Onyxia Scale Cloak and ideally 100–200 Shadow Resistance.
  - Shadow of Ebonroc swap: the moment the active tank gets the 8 s debuff, one side tank Taunts (both side tanks should fire Taunt — one may be resisted; Mocking Blow and Challenging Shout as backups). The debuffed tank stops being hit and simply waits out 8 s, then is available to taunt back.
  - Wing Buffet: the dedicated buffet tank stops taunting ~15 s before the expected buffet so his Taunt is ready at ~28–30 s, taunts right before the cast, eats the buffet and its threat cut (Warcraft Wiki). The MT therefore never loses threat to a buffet.
  - Never leave the debuffed tank as his target; never let a buffet hit the MT; never move him away from the corner.
- Melee DPS: directly behind him at 6 o'clock (Warcraft Wiki/Warcraft Tavern), never beside the tanks (Wing Buffet cone is frontal but wide). Keep Mortal Strike-type healing debuffs... not applicable; warriors keep Sunder up and a warrior keeps Mortal Strike on him to cut his self-heals (Ten Ton Hammer/Warcraft Wiki: "keep Mortal Strike on him at all times").
- Ranged DPS: behind him with the melee or at range directly behind; Shadow Flame is the only AoE and it is frontal, so the whole raid can stand behind and DPS freely (Warcraft Tavern). Everyone wears the Onyxia Scale Cloak in case of a turn or Summon Player.
- Healers: behind/beside the raid with LoS to all three tanks; one healer group on the side tanks, the rest on whoever currently holds him. Priests PW:S the current tank on each Shadow Flame cast (optional per Warcraft Wiki).
- Whole raid: a faster kill is better — every missed swap is +25k per hit; keep everything behind him.

## What each role must do and must not do
- Tank:
  1. Three tanks in the 12/3/9 layout, all cloaked, all in his hitbox.
  2. Shadow of Ebonroc on you → stop and call it; the two side tanks Taunt immediately (first ~45 s in, then every 25–35 s). Expect it 6–10 times per fight.
  3. Buffet tank: hold Taunt from ~15 s after the last Wing Buffet so it is ready at ~30 s; taunt just before the cast; the buffet's threat cut lands on you.
  4. Shadow Flame every 15–18 s for 4–5k on whoever he faces — the current tank must be above 50% going in.
  5. Never two taunts in a row by the same tank if the anecdotal taunt-immunity is real (see Open questions); rotate who taunts.
- DPS:
  1. Onyxia Scale Cloak on; stay directly behind him.
  2. A warrior keeps Mortal Strike up (halves the Shadow of Ebonroc heals that do land).
  3. Watch threat after each Wing Buffet (tank threat drops); rogues Vanish / hunters Feign if close, or run to the corner behind the tanks (Warcraft Wiki).
  4. Never stand in the frontal arc; never stop DPS — the fight is a race against his self-healing.
- Healer:
  1. Nothing dispellable.
  2. Current tank takes 4–5k Shadow Flame every 15–18 s plus Thrash bursts; shield before the breath, big heals after.
  3. Keep both side tanks full — a side tank who taunts is immediately eating 15–18k swings.
  4. Watch the buffet tank right after each Wing Buffet (563–938 + knockback).

## Timeline of a typical pull
- t=0 MT pulls him into the stair corner; side tanks move to 3 and 9 o'clock; raid behind.
- t≈11–21 s first Shadow Flame on the MT (then every 15–18 s, measured 13–23 s).
- t≈30–36 s first Wing Buffet — buffet tank taunts at ~28 s (then every 30–35 s).
- t≈45 s first Shadow of Ebonroc on the active tank → side tank taunts (then every 25–35 s).
- Thereafter: a swap roughly every 30 s from Shadow of Ebonroc, a planned taunt every ~32 s for Wing Buffet, a breath every ~16 s. A clean fight at 999k HP lasts ~4–5 minutes at ~3,500–4,000 raid DPS; every missed swap adds ~25–75k.

## Open questions
- Shadow Resistance vs Shadow of Ebonroc: Warcraft Wiki says ~100 SR drops the hit chance to 25%; Warcraft Tavern says >200 SR resists fairly reliably. Era resistance math (binary resist for debuffs with no damage component) makes the former unlikely; unverified.
- Shadow of Ebonroc cadence: cmangos 25–35 s after a 45 s opener; no boss mod carries a cooldown timer. Classic guides only say "frequent".
- Wing Buffet cadence: 30–35 s (cmangos/Warcraft Wiki) vs 31.1–36 s measured (DBM).
- Shadow Flame cadence: 15–18 s vs 12.9–23.4 s measured.
- The Wowhead comment that two consecutive taunts make him taunt-immune until a Wing Buffet: single anecdote, not in any guide; the three-tank rotation sidesteps it anyway.
- Heal amount per hit: 25,000 everywhere; a 2014 hotfix "squished" it but Classic Era uses the 25k value.
