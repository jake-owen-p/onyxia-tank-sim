# The Four Horsemen (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Four_Horsemen_(Classic) — Classic page: Mark mechanics (first at 20 s then every 12 s; 75 s refreshed; 65–70 yd, pierces LoS; damage by stack 0 / 250 / 1,000 / 3,000 / 5,000 then +1,000 per stack; unresistable; a Mark hit halves your threat on that Horseman); Enrage after 100 marks (~20 min) with no mark cooldown; Shield Wall (-75%, 20 s) at 50% and 20%; Spirit on death keeps casting; Righteous Fire 25% proc 2,160–2,640 + 4,800 over 8 s; Meteor 12,825–14,275 split in 8 yd, 12 s CD, random target in 45 yd; Holy Wrath 495–605 chaining in 10 yd doubling, 35 yd, 12 s CD; Void Zone Consumption 3,950–4,750 Shadow/s, 90 s, 12 s CD; eight tanks; taunt 16% resist; quotes.
- https://www.wowhead.com/classic/guide/four-horsemen-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: 4 primary + 4 backup tanks; corners; safe spot in front of the platform to drop marks; marks 20 s then every 12 s, 60 yd AoE, not LoS-able, 75 s refresh, not removable; Shield Wall at 50/20%; Enrage after 100 marks (~20 min); Spirits keep casting marks; Meteor split among nearby; Void Zone ~1.5 min; Holy Wrath chains within 5 yd doubling; Righteous Fire DoT not dispellable; stay below 3–4 marks; Disarm works.
- https://www.wowhead.com/classic/spell=28832/mark-of-korthazz, …/28833/mark-of-blaumeux, …/28834/mark-of-mograine, …/28835/mark-of-zeliek — Marks: instant, 1.25 min (75 s) duration, radius 65 yd (Korth'azz, Blaumeux) / 70 yd (Mograine, Zeliek), server-side damage script, unaffected by invulnerability, ignore LoS.
- https://www.wowhead.com/classic/spell=28884/meteor — Meteor: instant, 20 yd range, 12,825 Fire (effect value) divided evenly among all targets within 8 yd, player-only.
- https://www.wowhead.com/classic/spell=28882/righteous-fire — Righteous Fire: instant, 25 yd, 2,160 Fire + 600 Fire every 1 s for 8 s (4,800), cannot crit.
- https://www.wowhead.com/classic/spell=28863/void-zone — Void Zone: 45 yd range, summons a Void Zone object lasting 1.5 min (90 s) that deals Shadow damage to those inside.
- https://www.wowhead.com/classic/spell=10320/holy-wrath — the guide's link is a "Learn Spell" shell; DBM tracks Sir Zeliek's Holy Wrath as 28883; numbers from the wiki.
- https://www.wowhead.com/classic/spell=28928/summon-spirit-of-mograine — Summon Spirit (on death), 2 yd.
- https://classicdb.ch/?npc=16062 / 16063 / 16064 / 16065 — Highlord Mograine, Sir Zeliek, Thane Korth'azz, Lady Blaumeux: 810,000 HP each; melee 4,066–4,668 (Mograine), 4,237–4,863 (Korth'azz), 5,930–6,807 (Zeliek, Blaumeux), armor 4,691.
- https://classicdb.ch/?npc=16775 / 16776 / 16777 / 16778 — Spirits of Mograine (6,920 HP, melee 22,260–26,950), Blaumeux / Zeliek / Korth'azz (937 HP, melee 15,715–18,235).
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/MilitaryQuarter/Horsemen.lua — DBM Classic timers: first Mark 21 s then every 12.9 s (13 s in SoD); Meteor / Holy Wrath / Void Zone first 21 s (Void Zone 11.3–21 s) then variable 11.3–16.2 s each; "stack high" warning at 4 marks; Shield Wall tracked as 29061 (20 s).
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: four tanks in four corners; marks from 20 s every 12 s, lethal around 7 stacks, fade after 75 s; swap north pair / south pair after 3 stacks; horsemen must die close together or a dead one "resurrects" (sic — the Spirit); Meteor ~15k shared in 8 yd; Holy Wrath group 5 yd apart; Shield Wall at 50/20 for 20 s; Enrage at 100 marks / 20 min; all disarmable.
- https://www.tentonhammer.com/guides/naxxramas-bosses — Wrath version; not used for numbers.

## Overview
- Four bosses, level ??, Undead: Highlord Mograine, Thane Korth'azz, Sir Zeliek, Lady Blaumeux — 810,000 HP each (classicdb.ch; the wiki lists none). Soft enrage: after 100 Marks (20 s + 99×12 s ≈ 20:08) they cast Marks without cooldown. Third and last encounter of the Military Wing, required.
- Phases: one continuous phase; each Horseman casts Shield Wall at 50% and 20%; on death each leaves a stationary Spirit at its corpse that keeps casting its Mark and abilities until the whole encounter ends (wiki), so kill order and corpse placement matter.
- Raid-size assumptions: 40-man Classic Era with 8 tanks (4 primary + 4 backup — Wowhead, wiki) and the whole raid rotating between corners. The Wrath "two-by-two" version with Unyielding Pain/Condemnation does not apply (not present in any Classic source).

## Abilities

### Mark of Mograine / Korth'azz / Zeliek / Blaumeux (shared mechanic)
- Name: Mark of Mograine (28834), Mark of Korth'azz (28832), Mark of Zeliek (28835), Mark of Blaumeux (28833)
- Type: AoE (huge radius) stacking debuff
- Target rule: every player within 65 yd (Korth'azz, Blaumeux) / 70 yd (Mograine, Zeliek) of that Horseman — Wowhead says 60 yd; pierces line of sight; cannot be immuned ("unaffected by invulnerability").
- Cast time: instant.
- Cooldown or cadence: first Mark 20 s after the pull (DBM 21 s), then every 12 s (wiki, Wowhead, WT; DBM 12.9 s). All four cast on the same rhythm.
- Damage: Shadow, unresistable, by stack count on *that* Horseman's mark: 1st 0, 2nd 250, 3rd 1,000, 4th 3,000, 5th 5,000, then +1,000 per further stack (6th 6,000, 7th 7,000 — "lethal around 7" per WT). Each new application deals the damage of the new stack level.
- Debuff: 75 s, refreshed to 75 s by each new stack; cannot be removed by anything except death (Wowhead). The four Marks are separate debuffs that do not interact — one stack of each costs nothing (wiki). Being struck by a Mark also cuts your threat against that Horseman by 50% (wiki).
- Movement effect: none.
- Telegraph: DBM 12 s timer ("Mark N in 3 seconds"); the stack counter on your own frame. No cast bar.

### Shield Wall (all four)
- Name: Shield Wall (29061 as tracked by DBM; Wowhead links the player spell 871)
- Type: self defensive
- Trigger: at 50% and at 20% HP of each Horseman.
- Effect: -75% Physical and magical damage taken for 20 s (wiki, Wowhead: "significant").
- Telegraph: buff on the boss; DBM target timer.

### Enrage (all four)
- Trigger: after 100 Marks have been cast (~20 min) — Marks then have no cooldown (wiki, Wowhead).

### Summon Spirit (on death)
- Name: Summon Spirit of Mograine (28928) / Blaumeux (28931) / Korth'azz (28932) / Zeliek (28934)
- Effect: a rooted Spirit (Spirit of Mograine 6,920 HP, melee 22,260–26,950; the other three 937 HP, melee 15,715–18,235 — classicdb) appears on the corpse (2 yd), keeps casting that Horseman's Mark and abilities on anyone in range until the encounter ends (wiki, Wowhead). The raid must move away from a dead Horseman's corner immediately.

### Highlord Mograine — Righteous Fire
- Name: Righteous Fire (28882)
- Type: melee proc (targeted)
- Target rule: his current target; 25% chance per melee attack, no internal cooldown (wiki).
- Damage: 2,160 Fire instant (tooltip range 2,160–2,640) + 600 Fire every 1 s for 8 s (4,800 total). Resistable (Fire). Cannot crit.
- Debuff: 8 s DoT, no dispel type (not dispellable — Wowhead). Fire resistance recommended on Mograine tanks.
- Telegraph: none.

### Thane Korth'azz — Meteor
- Name: Meteor (28884)
- Type: targeted AoE with split damage
- Target rule: a random player within 45 yd (wiki; spell range 20 yd); damage split evenly among all players within 8 yd of the impact.
- Cadence: 12 s cooldown (wiki); DBM variable 11.3–16.2 s, first at 21 s.
- Damage: 12,825 Fire total (effect value; wiki 12,825–14,275; WT ~15,000) divided by the number of players in 8 yd → the Korth'azz group must stack tightly (e.g. 10 players → ~1,300 each).
- Telegraph: none; stack pre-emptively.

### Sir Zeliek — Holy Wrath
- Name: Holy Wrath (28883 per DBM)
- Type: chain (targeted, bouncing)
- Target rule: the top-threat target (tank), then chains to any player within 10 yd of the previous target (wiki; Wowhead says 5 yd), doubling each jump; 35 yd range.
- Cadence: 12 s cooldown (wiki); DBM 11.3–16.2 s, first at 21 s.
- Damage: 495–605 Holy on the first target, ×2 per jump (≈1,100, 2,200, 4,400, 8,800 …) — spread 10 yd apart around Zeliek; melee on Zeliek is dangerous.
- Telegraph: none.

### Lady Blaumeux — Void Zone
- Name: Void Zone (28863) → Consumption aura
- Type: ground hazard (summoned object)
- Target rule: placed under a nearby player (random within 45 yd; wiki "a nearby enemy").
- Cadence: 12 s cooldown (wiki); DBM first 11.3–21 s then 11.3–16.2 s.
- Damage: Consumption 3,950–4,750 Shadow per second to anyone standing in the zone (wiki), partially resistable.
- Duration: 90 s (spell: 1.5 min) — zones accumulate; the Blaumeux tank walks her in a slow circle around the corner (Wowhead).
- Telegraph: a small black circle appears; step out instantly.

## Adds
- Spirits of the Horsemen (16775–16778), see above: not "adds" to kill (tiny HP) but stationary hazards at each corpse; they continue Marks (65–70 yd!) and their signature ability. Avoid their range after each kill; this is why the room's corners (far apart) are used and why kill order/timing matters.

## Positioning and movement
- Tank: four primary tanks taunt one Horseman each on the pull and drag them to the four corners of the room within the first 20 s (before Mark #1). Mograine tank: fire resistance, Righteous Fire DoT. Korth'azz tank: stack with your group (Meteor split). Zeliek tank: nobody within 10 yd of you (Holy Wrath chain). Blaumeux tank: tank her in a slow circle around the corner so Void Zones never trap you. Rotation: each tank holds ~3 stacks (WT: swap after 3; Wowhead: never above 3–4) then the backup tank taunts (Taunt can be resisted 16% — taunt early, wiki) and the first tank runs to the next corner or to the safe spot in the middle (in front of the platform, out of range of all four — Wowhead) until the marks fade (75 s). WT pairs: north pair swaps with each other, south pair likewise. Use Disarm on all four (Wowhead). Never: let two Horsemen stand within ~65 yd of the same group for long (double marks); taunt late; stand in a Void Zone.
- Melee DPS: assigned to a Horseman's group; rotate with the raid when your group hits 3–4 marks; stack tight on Korth'azz, spread 10 yd on Zeliek, dodge Void Zones on Blaumeux, do not stand in front of Mograine (Righteous Fire goes to his target only, but melee must not pull aggro).
- Ranged DPS: with their group, same mark discipline (3–4 stacks max, drop them in the platform safe spot — small area at the front of the platform out of range of all four, Wowhead); 65–70 yd mark radius means "range" rarely saves you — rotate.
- Healers: travel with the groups; tank healers follow the taunt swaps; heal the stack-4 tanks pre-emptively (3,000 per mark then 5,000); dispel nothing (Marks and Righteous Fire are undispellable).
- Whole raid: four corners + a central safe spot; everyone rotates clockwise (or in two pairs) every ~3 marks (~36 s); corpses/Spirits become no-go zones.

## What each role must do and must not do
- Tank:
  1. Pull: taunt, Shield Wall if needed, drag to your corner before 20 s.
  2. Count your marks; call the swap at 3 (max 4); backup taunts early to allow a resist re-taunt.
  3. Keep the raid's positioning constraint of your boss (stack / spread / circle / FR).
  4. Disarm when available.
  5. Backups wait in the safe spot with 0 marks.
- DPS:
  1. Balance damage so all four die at similar times (WT) — a dead Horseman's Spirit keeps marking its corner.
  2. Stop at Shield Wall (50%, 20%) — swap to another Horseman for 20 s.
  3. Watch your own mark count; rotate at 3–4; drop stacks in the safe spot (75 s).
  4. Nothing to interrupt or dispel; Void Zones — move; Meteor — stack; Holy Wrath — spread.
- Healer:
  1. Pre-heal tanks at mark 4–5 (3,000 / 5,000 unresistable) and on Righteous Fire (2,160 + 4,800 DoT).
  2. Rotate with your group; never exceed 3–4 marks yourself.
  3. Expect taunt resists → the old tank takes one more mark.
  4. No dispels available for anything here.

## Timeline of a typical pull
- t=0: Pull from the platform; 4 tanks taunt and drag to corners; groups follow.
- t≈20–21 s: Mark #1 on everyone in range of each Horseman (0 damage); Meteor / Holy Wrath / Void Zone cycles begin (every ~12–16 s).
- t≈33 s: Mark #2 (250); t≈45 s: Mark #3 (1,000) → swap/rotate; backups taunt; first groups walk to the next corner / safe spot.
- t≈57 s: Mark #4 (3,000) for anyone who stayed; t≈69 s: Mark #5 (5,000).
- Every ~36 s: a rotation; stacks from a corner you left expire 75 s after your last mark there.
- 50% / 20% per Horseman: Shield Wall 20 s — redirect DPS.
- Deaths: as each Horseman dies, clear its corner (Spirit keeps marking); kill the remaining ones within a few rotations.
- ~20:08: Mark #100 → Enrage (no mark cooldown) → wipe.

## Open questions
- Mark radius: 65 yd (wiki; spells 28832/28833) vs 70 yd (spells 28834/28835; wiki strategy text) vs 60 yd (Wowhead).
- Mark cadence: 12 s (wiki, Wowhead, WT) vs 12.9 s (DBM Classic).
- Holy Wrath chain radius: 10 yd (wiki) vs 5 yd (Wowhead, WT).
- Meteor targeting range: 45 yd (wiki) vs 20 yd (spell range); total 12,825 (spell) vs 12,825–14,275 (wiki) vs ~15,000 (WT).
- Stacks per tank before swapping: 3 (WT) vs "not over 3–4" (Wowhead) vs unspecified (wiki, which only notes the first stack does 0).
- Horsemen HP: 810,000 each (classicdb.ch) — wiki gives none; the Classic Era NPC pages on Wowhead were not fetched (region block).
- Spirit abilities/duration: "until the encounter ends" (wiki); whether Spirits also use Meteor/Void Zone/Holy Wrath is stated generally ("keeps its abilities").
- Whether all four must die within a short window: WT says "it will resurrect" if one dies much earlier — no other Classic source describes resurrection; the Spirit mechanic is the documented behaviour.
