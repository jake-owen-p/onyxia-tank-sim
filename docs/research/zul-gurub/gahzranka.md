# Gahz'ranka (Zul'Gurub)

Sources: list every URL used, one per line, with what it contributed.
- https://classic.warcraftdb.com/data/npc/15114 (API) — level 63 World Boss, health 333,100; abilities Frost Breath 16099 (2 s cast), Gahz'ranka Slam 24326, Massive Geyser 22421 (1.5 s cast, 40 yd), Thrash 3391.
- https://classic.warcraftdb.com/data/npc/14122 — Massive Geyser (summoned trigger): level 60, 3,052 HP; Water 22422.
- https://classicdb.ch/?spell=16099 — Frost Breath: 2 s cast, 5 yd range, 20 yd radius (cone), 128 Frost + Power Drain 128 + -50% movement speed for 10 s.
- https://classicdb.ch/?spell=24326 — Gahz'ranka Slam: instant, 10 yd range, weapon +250 within 30 yd, knockback (307) within 20 yd.
- https://classicdb.ch/?spell=22421 — Massive Geyser: 1.5 s cast, 40 yd, summons NPC 14122 (2 s).
- https://classicdb.ch/?spell=22422 — Water: 463 Frost in 10 yd radius + knockback (100) — the launch.
- https://warcraft.wiki.gg/wiki/Gahz%27ranka — summoning (Mudskunk Lure + 5 Zulian Mudskunks at Pagle's Pointe; Muddy Churning Water pools; fishing 330 minimum / 425 no-fail; Nat's Measuring Tape quest; once per instance, despawns on wipe); Frost Breath 850–1,150 Frost cone + ~600 mana drain + slow 10 s; Slam +250 knockback; Massive Geyser Water ~500 damage, launches high, fall damage, "significantly reduces everyone's threat"; strategies A (moat), B (land near huts, two tanks), C (Nat Pagle's Point corner).
- https://www.wowhead.com/classic/guide/gahzranka-zul-gurub-strategy (via r.jina.ai) — Nat's Measuring Tape jar at Pagle's Pointe, Nat sells Mudskunk Lure for 1g, 5 Zulian Mudskunks from Muddy Churning Waters; clear fish/crocolisks; Frost Breath cone/slow/mana drain hits tanks only; Slam tanks only; Massive Geyser knocks up and reduces aggro — stay in water, Feign Death/Vanish on every geyser; comments: 425 fishing to avoid missed casts, 300 was enough to throw the lure.
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — 300 fishing for the tape, 350 to fish Mudskunks; fight in the water; clear moat fish; everyone but the tank behind him.
- https://us.millenium.gg/guide/6831.html?page=9 — melee stand in the troll ruins to reduce fall damage, casters in the water; Geyser 500 damage.
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — knockback causes fall damage and temporarily removes you from aggro; Frost Breath drains mana and slows; underwater fight with Unending Breath, or OT taunts and drags back after knockback.

## Overview
- Level 63 ("??"), World Boss hydra. Health 333,100 (Era). No mana. No enrage. OPTIONAL: no effect on Hakkar. Summoned once per instance lockout at Pagle's Pointe (shore below Arlokk's temple/south of Thekal) by using a Mudskunk Lure loaded with 5 Zulian Mudskunks; a wipe despawns him for that lockout.
- Phases: single phase, tank-and-spank with a knock-up.
- Raid-size assumptions: 20-man Classic Era. No SoD-specific values found.

## Abilities

### Frost Breath
- Name: Frost Breath (16099)
- Type: frontal cone
- Target rule: everything in front of him within ~20 yd (DBC radius 20, range 5 — melee-range origin cone)
- Cast time: 2 s
- Cooldown or cadence: unknown
- Damage: 128 Frost base in DBC (generic spell) — wiki reports 850–1,150 Frost for his version; drains ~600 mana (wiki; DBC Power Drain 128)
- Debuff: Frost Breath 10 s: -50% movement speed (Amazon Basin also says attack speed)
- Movement effect: snare
- Telegraph: 2 s cast; tank him facing away so only tanks are breathed on

### Gahz'ranka Slam
- Name: Gahz'ranka Slam (24326)
- Type: melee AoE + knockback
- Target rule: enemies within 30 yd take damage (DBC), knockback within 20 yd; guides: "nearby enemies"/tanks only
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: weapon +250 Physical
- Debuff: none
- Movement effect: knockback (value 307 — a hard shove)
- Telegraph: none; ranged stand >30 yd if possible, melee accept it

### Massive Geyser
- Name: Massive Geyser (22421) → Water (22422)
- Type: ground hazard / knock-up / threat reduction
- Target rule: a point under a player within 40 yd (any raid member); the geyser NPC erupts 2 s later hitting a 10 yd radius
- Cast time: 1.5 s
- Cooldown or cadence: unknown ("the one tricky ability")
- Damage: 463 Frost (wiki ~500) + launch high into the air; landing on land adds fall damage (can be several thousand); landing in water is free
- Debuff: none
- Movement effect: launched; "significantly reduces everyone's threat" (wiki) / "reduces aggro" (Wowhead) — tanks must rebuild; hit tanks lose him briefly
- Telegraph: 1.5 s cast + visible geyser trigger; stand over water, use threat drops (Feign Death, Vanish) as it lands

### Thrash
- Name: Thrash (3391)
- Type: melee
- Target rule: current target
- Cast time: passive
- Cooldown or cadence: random
- Damage: 2 extra attacks
- Debuff: none
- Movement effect: none
- Telegraph: none

## Adds
- None from the boss. Pre-clear: fish and crocolisks in the moat/shore around Pagle's Pointe (they aggro into the fight), snakes and trolls on the paths above (strategy C). Massive Geyser spawns a non-attackable trigger NPC (14122) that erupts and disappears.

## Positioning and movement
- Tank: Strategy A — stand in the centre of the moat/deep water so every geyser launch lands in water; face him away from the raid (Frost Breath cone). Use two tanks: when the current tank is launched (threat dropped), the second tank taunts/holds until the first lands and taunts back. Strategy C (land) — MT wedges into the corner of the hillside and tree at Nat Pagle's Point.
- Melee DPS: behind him in the water (never in the cone); accept Slam knockbacks; Vanish/Feign Death on geysers to avoid pulling aggro while tanks rebuild. On land: stand in the troll ruins/under the hut horn so launches are short and fall damage low.
- Ranged DPS: in the shallow water around him within the geyser's reach (so launches land in water) or on the hut ladders/slope; >30 yd avoids Slam. Hunters may melee because their 8 yd dead zone is inside the geyser radius anyway (wiki). Do not line the upper path: if he aggroes someone there he may evade and reset to full.
- Healers: in the water with the ranged; expect fall-damage spikes if anyone lands on land; keep mana potions (Frost Breath drains mana — stay out of the cone).
- Whole raid: fight in/over water; clear the moat; don't stand on cliffs or the upper path; Unending Breath for an underwater fight (Amazon Basin).

## What each role must do and must not do
- Tank:
  1. Position in deep water before the lure is used; pick him up as he surfaces.
  2. Face him away from the raid; only tanks eat Frost Breath.
  3. Two tanks alternate: the launched tank's threat is reduced, the other taunts; re-establish after every geyser.
  4. Never fight on land near the hill edges (fall damage) or let him path onto the upper path (evade).
- DPS:
  1. Stay in/over water; use Feign Death/Vanish on each Massive Geyser.
  2. Pause after a geyser until a tank has him again.
  3. Stay out of the frontal cone; ranged ideally >30 yd from Slam.
  4. Kill moat fish first; never body-pull extra fish.
- Healer:
  1. Heal fall damage and geyser hits (~500 + fall) on whoever is launched; expect aggro bounces onto healers.
  2. Keep out of the cone (mana drain 600); carry mana potions.
  3. Pre-HoT the off-tank before each geyser swap.

## Timeline of a typical pull
- Prep: Nat's Measuring Tape (jar at Pagle's Pointe) → Nat Pagle (Dustwallow) → buy Mudskunk Lure (1g); fish 5 Zulian Mudskunks from Muddy Churning Waters inside ZG (330+ fishing, 425 for no fails); clear the moat.
- t=0: Lure used in the water; Gahz'ranka surfaces; MT establishes in the water.
- Loop: Frost Breath (2 s cast) on the tank(s) every so often; Slam knockbacks on melee; Massive Geyser (1.5 s cast) every so often on a random spot — launch, 463–500 damage, threat reduced, second tank takes over, DPS pause ~3–5 s, resume.
- Kill at ~333k HP; no phases. Loot includes Tome of Polymorph: Turtle, Foror's Eyepatch, Tigule's Harpoon.

## Open questions
- Frost Breath damage/drain: DBC 16099 shows 128/128 (generic rank) vs wiki 850–1,150 and ~600 mana; his actual cast may be a different spell ID not listed on warcraftdb.
- Geyser threat effect: "significantly reduces everyone's threat" (wiki) vs "reduces aggro" of the launched (Wowhead/Amazon Basin).
- Fishing requirement: 330 (wiki) / 350 (Warcraft Tavern) / 425 to avoid misses (Wowhead comments); 300 suffices to use the lure.
- No cadences for any ability; Warcraft Logs not accessible.
