# Firemaw (Blackwing Lair)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Firemaw — Flame Buffet stacking (+150 Fire taken per stack, 20 s), Shadow Flame 3938–5062 cone + the no-cloak DoT 1750–2250/10 s, Wing Buffet 563–937 knockback + aggro reduction, Thrash, Summon Player; cadence "knockbacks every 30–35 s, Shadow Flame every 15–18 s"; LoS strategy, stack thresholds 5–10, tank in the doorway, swap on buffet.
- https://classicdb.ch/?npc=11983 — HP 999,300, melee 15,715–18,235, armor 4,641, abilities 22539/23339/3391/23341.
- https://classicdb.ch/?spell=23341 — Flame Buffet: instant, 100 yd range, 139–162 Fire, +150 Fire damage taken for 20 s, no dispel type.
- https://classicdb.ch/?spell=22539 — Shadow Flame: 45 yd cone, 2 s cast, 3938–5063 Shadow + script effect.
- https://classicdb.ch/?spell=22682 — Shadow Flame DoT: 1750–2251 every 1 s for 10 s (applied to targets without the Onyxia Scale Cloak).
- https://classicdb.ch/?spell=22683 — Onyxia Scale Cloak aura: "Protects the wearer from being fully engulfed by Shadow Flame."
- https://classicdb.ch/?spell=23339 — Wing Buffet: 1 s cast, 563–938 Physical, frontal cone 20 yd, knockback.
- https://classicdb.ch/?spell=3391 — Thrash: 2 extra attacks.
- https://classicdb.ch/?spell=20279 — Summon Player: pulls an enemy player to him (20 yd radius).
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_firemaw.cpp — emulator timers: Shadow Flame 18 s then 15–18 s; Wing Buffet 30 s then 30–35 s (reduces threat of everyone hit); Flame Buffet every 5 s to everyone in LoS; Thrash 6 s then 2–6 s.
- https://github.com/BigWigsMods/BigWigs_Classic/blob/master/BlackwingLair/Firemaw.lua — Wing Buffet bar 29 s on engage, 32 s after each cast; Flame Buffet stack warnings from 4, alarm at 6.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/BWL/Firemaw.lua — log-derived variance: Wing Buffet 31.6–42.1 s (first 30.6–40.4), Shadow Flame 13–25.9 s (first 11.3–24.3).
- https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ — stacks last 20 s, leave LoS near 10 stacks (5–7 safer), OT taunts 5 s before Wing Buffet, three tanks, boss in the doorway.
- https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-five — 2006: Flame Buffet ~100–170 + 150 Fire taken, Shadow Flame 4–5k and the no-cloak DoT >10k, OT taunts on the CT_Raid buffet warning, never fewer than two OTs on him, rogues leave and bandage, healers out of his LoS but in LoS of the MT, priests shield the MT before Shadow Flame, group layout.
- https://us.millenium.gg/guide/6486.html?page=4 — two tanks with backs to a wall on each side, melee and some healers out of LoS, casters on the trap side of the room, pull when he is nearest the gate.
- https://yttrium-tyclief.github.io/sod-guides/bwl/firemaw (Season of Discovery) — tank in the doorway between his room and Broodlord's room; melee behind him using a pillar to drop stacks; ranged/healers in Broodlord's room behind the door pillars; OT perpendicular and taunts before each buffet; tanks swap after each Wing Buffet. SoD-only Static Electricity / Fulmination.
- https://docs.google.com/document/d/1VT_67cPSHqvRK2_yit0QSiyzGwf9oXTKjcinxsVymoA (warlock notes) — Wing Buffet reduces tank threat, LoS to clear stacks.

## Overview
- Level ?? (boss), HP 999,300 (classicdb.ch), melee 15,715–18,235 with Thrash (extra attacks), armor 4,641. No enrage. Fourth boss; the first of the three drakes in the Crimson Laboratories. Technically skippable only by not engaging him, but he patrols the lab room you must cross — treat as required. Can be Taunted.
- Phases: single phase. The fight is a damage race against Flame Buffet stacks: everyone in his line of sight gains a stack every ~5 s; each stack adds +150 Fire damage taken, and every Flame Buffet tick is itself Fire — so damage per tick grows by ~150 per stack. Players break line of sight around the doorway to let stacks fall off after 20 s.
- Raid-size assumptions: 40-man Classic Era. Season of Mastery/Discovery add Static Electricity; not covered here.

## Abilities

### Flame Buffet
- Type: AoE (line-of-sight) debuff
- Target rule: every enemy in his line of sight within 100 yd
- Cast time: instant
- Cooldown: every ~5 s (cmangos); guides say "constantly"
- Damage: 139–162 Fire per application (classicdb.ch; Ten Ton Hammer "100–170"), increased by +150 per stack already on you (and by the Flame Breath-style fire taken modifier generally)
- Debuff: Flame Buffet, 20 s, stacks (no cap published), +150 Fire damage taken per stack, dispel type none, does not spread. Every new application refreshes the 20 s timer, so stacks only fall off after 20 s with no line of sight.
- Movement effect: none
- Telegraph: stack count on your debuff; BigWigs warns at 4, alarm at 6. Rule of thumb: leave LoS at 5–7 stacks (Warcraft Tavern), 10 at most.

### Shadow Flame
- Type: frontal cone
- Target rule: cone in front of him, 45 yd, aimed at the current tank
- Cast time: 2 s
- Cooldown: first ~18 s, then every 15–18 s (cmangos; Warcraft Wiki 15–18 s); logs 13–25.9 s with a first cast at 11.3–24.3 s (DBM)
- Damage: 3938–5063 Shadow (Fire Resistance does not help; Shadow Resistance does)
- Debuff: anyone hit who is NOT wearing an Onyxia Scale Cloak gets Shadow Flame DoT: 1750–2251 Shadow every 1 s for 10 s (≈17–22k, always fatal). The cloak aura prevents it.
- Movement effect: none
- Telegraph: 2 s cast bar; raid addons call it to tanks and healers. Priests PW:S the tank during the cast.

### Wing Buffet
- Type: frontal cone knockback / threat reduction
- Target rule: everyone in a cone in front of him, 20 yd
- Cast time: 1 s
- Cooldown: first ~30 s, then every 30–35 s (cmangos, Warcraft Wiki); logs 31.6–42.1 s (DBM); BigWigs bars 29 s / 32 s
- Damage: 563–938 Physical
- Debuff: none
- Movement effect: knockback (spell value 150 at 250 speed — a short, fast shove), and the threat of everyone hit is reduced (cmangos comment; guides say 50%). This is why he is tanked against a doorway wall and why the OT taunts just before it.
- Telegraph: 1 s cast bar; boss-mod timer.

### Thrash
- Type: melee (extra attacks)
- Target rule: current tank
- Cast time: instant; proc-like, every 2–6 s (cmangos "confirmed not proc" — it is a timed cast)
- Damage: 2 extra melee swings (15.7–18.2k pre-armor each) in quick succession
- Telegraph: none; expect 3-hit bursts on the tank.

### Summon Player
- Type: aggro pull / teleport
- Target rule: an enemy player (used on players who are out of melee range but on his threat table, e.g. after a knockback or someone hiding too long)
- Cast time: instant
- Effect: the player is placed in front of him (into the Shadow Flame / Wing Buffet cone). Cadence unknown; rare in practice.

## Adds
- None during the fight. His room (and the stairs up) hold the lab packs: Blackwing Spellbinders (magic-immune), Blackwing Warlocks (summon Enraged Felguards), Death Talon Overseers (one vulnerable school — mages Detect Magic), Blackwing Technicians (goblins with dynamite that one-shot weak targets; a "goblin runner" kites them). Clear the three packs nearest the gate before the pull (Warcraft Wiki); pull Firemaw when his patrol brings him closest to the gate (Millenium).

## Positioning and movement
- Tank: pull him into the doorway/gateway (between the Broodlord gate area and his room — Warcraft Wiki "entrance to the room, inside the doorway"; SoD guide "doorway between his room and Broodlord's room"). Stand right on top of his hitbox with your back to the door frame so Wing Buffet cannot move you; if you stand at the edge of his hitbox he repositions and breaks everyone's LoS plan (Warcraft Wiki). Face him into the wall / away from the raid: only the MT may ever be in the 45 yd frontal cone. He must not move for the whole fight.
  - Tank swap: a second tank stands beside him (perpendicular, not in the cone) and Taunts ~3–5 s before each Wing Buffet (every 30–35 s) so the buffet and its threat cut land on the OT, then the MT Taunts back or simply out-threats; if the Taunt is resisted the third tank Taunts (Ten Ton Hammer). Three tanks total (Warcraft Tavern). Tanks also use swaps to drop their own Flame Buffet stacks: the relief tank stands on the MT's exact spot before taunting (Warcraft Wiki).
  - MT wears as much Fire Resistance as possible plus the Onyxia Scale Cloak; the Shadow Flame hit (4–5k) is unavoidable for him.
- Melee DPS: behind him, inside the doorway, hugging the wall so a two-step sidestep breaks LoS (SoD guide uses the pillar in his room). Leave at 5–7 stacks, wait ~20 s for the stacks to expire, bandage, return. Rogues ~150–200 FR; nobody heals rogues here (Ten Ton Hammer) — "no rogue should die".
- Ranged DPS: on the far side of the door wall (the Broodlord side), out of his LoS; step into LoS to cast, step back out when stacks reach ~5–7, bandage while they fall off. DPS and most healers on the right side of the room (Warcraft Wiki); casters on the trap side (Millenium).
- Healers: out of Firemaw's LoS but in LoS of the tanks — the door frame gives exactly this geometry: the MT is in the doorway, healers stand around the corner. One group (~5) is dedicated to the OTs (Ten Ton Hammer), the rest to the MT. Two priests alternate PW:S on the MT during every Shadow Flame cast. Healers never stand in LoS for more than a few stacks.
- Whole raid: two "hide" walls, one each side of the door; the discharge/return cycle is 20 s out, ~30 s in. Nobody but the MT in front of him; nobody more than a sidestep from cover.

## What each role must do and must not do
- Tank:
  1. Clear three packs, wait for his patrol, pull to the doorway, plant inside his hitbox, face him into the wall.
  2. Every 30–35 s: OT Taunts on the boss-mod warning (~5 s before Wing Buffet), eats the buffet and the threat cut, MT re-establishes. Do not let the buffet hit the MT (it halves his threat and the raid then pulls aggro).
  3. Shadow Flame every 15–18 s: 4–5k Shadow unavoidable — be above 60% going in; call for PW:S; Shield Wall if stacks are high.
  4. Watch your own Flame Buffet stacks: at ~8–10 swap tanks and step out of LoS; your Fire damage taken is +150 per stack.
  5. Never move him. Never face the raid. Never take a Wing Buffet on the MT.
- DPS:
  1. Onyxia Scale Cloak on. Fire Resistance 100+ (ranged), 150–200 (melee).
  2. Leave LoS at 5–7 stacks (hard stop at 10), wait 20 s with no LoS, bandage, return. Flame Buffet damage grows with every stack; at 10 stacks each tick is ~1,600–1,700.
  3. Threat: Wing Buffet knocks tank threat down every 30–35 s — rogues/hunters Feign/Vanish if you are near the top; never pull aggro (Summon Player drags you into the breath).
  4. Melee: never in front; never stand at the edge of his hitbox (he moves).
- Healer:
  1. Nothing dispellable; Flame Buffet cannot be removed.
  2. MT: 4–5k Shadow Flame every 15–18 s plus 3-hit Thrash bursts of 2–5k each; PW:S before each Shadow Flame, big heals timed to land right after it (Warcraft Wiki).
  3. OT group keeps the buffet tank topped through 563–938 + knockback and his own breath if the swap is late.
  4. Stay out of his LoS yourself; if you are in LoS to reach the MT, cycle out at 5 stacks like everyone else. Mana goes to tanks; non-tanks bandage.

## Timeline of a typical pull
- t=0 MT pulls Firemaw into the doorway; everyone else starts out of LoS and steps in to attack.
- t≈5 s first Flame Buffet on everyone in LoS, then every ~5 s (so ~4 stacks by 20 s, ~6 by 30 s).
- t≈11–24 s first Shadow Flame on the MT (then every 15–18 s, measured 13–26 s).
- t≈30–40 s first Wing Buffet (then every 30–35 s, measured 31.6–42 s): OT taunts at ~25–30 s.
- t≈30 s first wave of DPS reach 5–7 stacks and rotate out for 20 s; rotations continue every ~50 s per player.
- Fight length at 999k HP: 4–6 minutes with half the raid in LoS at any time (~3,000–4,000 effective raid DPS). Expect 8–12 Wing Buffets and 15–25 Shadow Flames.

## Open questions
- Wing Buffet cadence: 30–35 s (cmangos, Warcraft Wiki) vs 31.6–42.1 s measured (DBM) vs 29/32 s bars (BigWigs). Plan the taunt for ~30 s and accept up to +10 s.
- Shadow Flame cadence: 15–18 s (cmangos, Warcraft Wiki) vs 13–25.9 s (DBM logs).
- Flame Buffet application rate: 5 s (cmangos); no log-derived figure in the fetched sources. Guides agree stacks last 20 s.
- Flame Buffet damage per application: 139–162 (classicdb.ch) vs "starts at 150" (Warcraft Wiki tactics text) vs 100–170 (Ten Ton Hammer). The +150 Fire-taken per stack is consistent.
- Wing Buffet threat reduction: "reduces aggro" (Warcraft Wiki, cmangos) vs "50%" (Warcraft Tavern for Ebonroc's identical ability). Use 50%.
- Shadow Flame DoT without the cloak: 1750–2251/s for 10 s (classicdb.ch) vs 1750–2250 total over 10 s (Warcraft Wiki wording). Either way lethal; the cloak is mandatory.
- Summon Player trigger conditions and cadence: unknown.
