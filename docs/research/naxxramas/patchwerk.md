# Patchwerk (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Patchwerk_(Classic) — Classic 40-man page: ~3,850,000 HP; 7-minute Berserk (≈9,500 raid DPS needed); Hateful Strike 22,100–29,900 pre-mitigation (~8,000 on a buffed BWL/AQ40 warrior), targets the highest-HP of the 2nd/3rd/4th on threat in melee range, ~1.2 s cadence, cannot crit/crush, adds threat, does not re-fire on dodge/parry; melee 1,800–2,700; Berserk ×5 damage ("goes into a berserker rage!"); Slime Bolt at 7:30 ~25,000 Nature to the raid (added 1.12.1 vs kiting); Enrage at 5%; healing allocation schemes; 3 off-tanks; quotes.
- https://www.wowhead.com/classic/guide/patchwerk-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: Hateful Strike ~8,000, melee range only, 2nd–4th on threat, highest HP, every ~1.5–2 s; slime river trick (lower your HP); Enrage at 5%; Berserk after 7 min; Slime Bolt after 7 min; tank near the slime; 3 off-tanks with Flask of the Titans / Spirit of Zanza / Lung Juice Cocktail.
- https://www.wowhead.com/classic/spell=28308/hateful-strike — Hateful Strike: melee range, instant, 22,100 Physical (effect value).
- https://www.wowhead.com/classic/spell=28131/enrage — Patchwerk's Enrage (DBM): +40% attack speed, +25% damage (tooltip "+25 Physical damage"), +25% size, 5 min.
- https://www.wowhead.com/classic/spell=26662/berserk — Berserk: +150% attack speed, +500% damage (tooltip "+500 Physical damage"), +25% size, 5 min.
- https://www.wowhead.com/classic/spell=28311/slime-bolt — Slime Bolt: 2.5 s cast, 30 yd, 1,110 Nature + 475 Nature every 5 s for 10 s, 15 yd radius, Poison.
- https://classicdb.ch/?npc=16028 — Patchwerk: 3,850,000 HP, melee 12,075–12,498, armor 4,691.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/ConstructQuarter/Patchwerk.lua — DBM Classic: Berserk timer 420 s; Enrage aura 28131; "enrage soon" at 10% HP; Slime Bolt cast announce 28311.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: Hateful Strike hits the highest-HP player in melee range other than the MT; tank him in a corner; off-tanks in front, melee at his side; Berserk at 7 min; Enrage at 5%.

## Overview
- Level ?? boss, Undead (abomination). HP 3,850,000 (wiki, classicdb.ch) — "nearly 4 million, the most of any boss in Vanilla" (Wowhead). Hard enrage: Berserk at 7:00 (420 s) → ≈9,170 raid DPS required (wiki says ~9,500); Slime Bolt volleys from ~7:30. First boss of the Abomination (Construct) Wing, required; linked trash must be cleared (wiki level-70 note).
- Phases: single phase; Enrage at 5% HP.
- Raid-size assumptions: 40-man Classic Era; 1 main tank + 3 Hateful Strike off-tanks (wiki "3 off-tanks is best"; Wowhead "needs 3 Off-Tanks"); the fight is not threat-sensitive for ranged.

## Abilities

### Hateful Strike
- Name: Hateful Strike (28308)
- Type: melee (targeted by a special rule)
- Target rule: among the players ranked 2nd, 3rd and 4th on his threat list who are within melee range, the one with the highest current HP (wiki, Wowhead). It never hits the #1 threat (the main tank). It also adds threat to its target (wiki). Players in melee range who creep into positions 2–4 can avoid it by lowering their HP (stand in the slime river) so an off-tank is higher-HP (Wowhead).
- Cast time: instant.
- Cooldown or cadence: ~every 1.2 s (wiki) / ~1.5–2 s (Wowhead). A dodged/parried/missed Strike is not re-cast, buying ~1.2 s (wiki).
- Damage: 22,100 Physical (effect value; wiki 22,100–29,900) before armor; ~8,000 on a fully buffed BWL/AQ40 warrior in Defensive Stance (wiki). Cannot crit or crushing-blow (wiki). Melee range only.
- Debuff: none. Movement: none.
- Telegraph: none; purely cadence-based. Healers watch the three off-tanks' HP.

### Melee swing
- 12,075–12,498 base (classicdb) → 1,800–2,700 on a tank (wiki); only the MT takes it.

### Enrage (5% HP)
- Name: Enrage (28131 per DBM; Wowhead links 19953)
- Trigger: 5% HP ("Patchwerk becomes enraged!"). +40% attack speed, +25% damage (tooltip "+25 Physical damage"; effect data 25%), 5 min. Hateful Strike still only hits off-tanks; Shield Wall for the MT and OTs recommended (wiki, Wowhead).

### Berserk (7:00)
- Name: Berserk (26662)
- Trigger: 7 minutes after the pull (DBM 420 s). +150% attack speed and +500% damage (tooltip "+500 Physical damage"; effect data 500%) for 5 min — "Hateful Strike hits the HS tanks for over 100k" (wiki). "Patchwerk goes into a berserker rage!"

### Slime Bolt (7:30)
- Name: Slime Bolt (28311)
- Type: ranged nuke + poison, "machine-gun" volleys at the whole raid after Berserk (Wowhead) / at 7:30 ~25,000 Nature to the whole raid (wiki)
- Cast: 2.5 s; 30 yd; 1,110 Nature + 475 Nature every 5 s for 10 s, 15 yd radius, Poison dispel (per-spell data — the raid-wide 25k figure is the observed effect of repeated casts). Added in 1.12.1 to stop kiting (wiki).

## Adds
- None.

## Positioning and movement
- Tank: MT grabs Patchwerk on entry and tanks him in a corner (WT) / next to the slime river (Wowhead) so melee can step into the slime. Build a big threat lead first; the MT takes only melee swings (1,800–2,700) — never let anyone pass you on threat (then the HS targeting shifts to the raid). Off-tanks ×3: stand in melee range in front of/beside him, stay 2nd–4th on threat above all melee (threat from Heroic Strike/Sunder, no need to tank-face), maximise HP (Flask of the Titans, Spirit of Zanza, Lung Juice Cocktail, Greater Stoneshield; Protection spec; ~75% mitigation for a feral — wiki). No tank swaps. Never: an OT drops below the melee on threat; an OT leaves melee range (the next highest-HP melee gets a 22k hit).
- Melee DPS: at his side, below the four tanks on threat; if you climb into the top 4 on threat, step into the slime to lower your HP below the off-tanks' (Wowhead) or Vanish (rogues). Feint/threat management is the fight.
- Ranged DPS: anywhere ≥ melee range; free to pass the off-tanks on threat (HS is melee-range only), never the main tank (Wowhead).
- Healers: dedicated OT healing — the wiki lists four schemes: (1) one pre-healed OT who takes every Strike (tightest), (2) main OT + a "sponge" OT buffering him from the melee, (3) two primary OTs + one sponge (~2.4 s to top each), (4) reactive healing on 3 equal OTs (≥3.6 s interval, needs low latency). Keep OTs at full HP at all times; do not raid-heal a melee who has deliberately lowered his HP (Wowhead).
- Whole raid: no movement; the slime river beside him is the HP-lowering tool.

## What each role must do and must not do
- Tank:
  1. MT: top threat always; everything else is irrelevant for you.
  2. OTs: stay 2nd–4th on threat and in melee range for 7 minutes; stack HP consumables; Shield Wall at 5% Enrage.
  3. Never taunt (pointless) and never step out of melee range.
- DPS:
  1. Melee: stay below the 4 tanks on threat (Feint, Vanish, slime-dip); no threat → no danger.
  2. Ranged: full DPS from the start; only the MT matters for you.
  3. Beat 7:00: ~9,200–9,500 raid DPS over 3.85M HP.
  4. Nothing to interrupt or dispel until Slime Bolt (poison, only after 7:30 — you have already lost).
- Healer:
  1. Assign ≥6–8 healers to the three OTs with a scheme (pre-heal vs reactive); 8,000-ish hits every ~1.2 s somewhere among them.
  2. 1–2 healers on the MT (predictable melee).
  3. Never top up a melee DPS who dropped his HP on purpose.
  4. Pre-cast big heals continuously; a dodge/parry gives a free 1.2 s.

## Timeline of a typical pull
- t=0: Pull; MT builds threat for ~5–10 s while OTs establish positions 2–4; melee then engage.
- t≈1–2 s onward: Hateful Strike every ~1.2 s on the highest-HP OT (~8,000 each).
- t≈0–6:30: tank-and-spank; HP-lowering/Vanish as melee threat climbs.
- 5% HP: Enrage (+40% speed, +25% dmg) — Shield Walls; finish quickly.
- t=7:00 (420 s): Berserk (+500% dmg, +150% speed) — effectively a wipe; t≈7:30 Slime Bolt volleys on the raid (~25k Nature).

## Open questions
- Hateful Strike cadence: ~1.2 s (wiki) vs ~1.5–2 s (Wowhead).
- Hateful Strike damage: 22,100 flat (spell data) vs 22,100–29,900 (wiki) → ~8,000 after armor on a well-geared warrior.
- Target rule detail: wiki/Wowhead agree on "2nd–4th on threat, in melee range, highest HP"; WT simplifies to "highest HP in melee range except the MT".
- Enrage/Berserk magnitudes: tooltips say "+25" / "+500 Physical damage" while the effect data lists 25% / 500%; the wiki describes Berserk as ~5× damage (consistent with 500%).
- Slime Bolt: 7:30 ~25,000 Nature raid-wide (wiki) vs "after 7 minutes, machine-gun volleys" (Wowhead); the spell itself is 1,110 + 475/5 s in 15 yd per cast.
- Melee base 12,075–12,498 (classicdb) vs 1,800–2,700 observed on tanks (wiki) — the difference is armor + Defensive Stance; no per-swing timer given.
