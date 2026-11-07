# Shazzrah (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Shazzrah — Arcane Explosion 925–1075 (20 yd), curse +100% magic damage 5 min (~35 yd), Magic Grounding -50% 30 s, Counterspell 10 s AoE ~35 yd, Blink 21655 "random target about every 45 seconds, wipes threat"; four-group, horseshoe and paladin-taunt strategies; SoM Image of Shazzrah.
- https://www.wowhead.com/tbc/npc=12264/shazzrah (r.jina.ai) — health 351,780, mana 39,300; Arcane Explosion 30 yd, Curse 35 yd, Counterspell 45 yd + 10 s silence, Blink 21655.
- https://www.wowhead.com/classic/npc=12264/shazzrah (r.jina.ai) — Seasonal 40 health 703,560.
- https://wotlkdb.com/?spell=19712 — Arcane Explosion: 0.5 s cast, 30 yd radius, 925–1075 Arcane.
- https://wotlkdb.com/?spell=19713 — Shazzrah's Curse: instant, 45 yd radius, 5 min, dispel Curse, +100% magic damage taken.
- https://wotlkdb.com/?spell=19714 — Magic Grounding (Deaden Magic): instant, 30 s, dispel Magic, -50% magic damage taken.
- https://wotlkdb.com/?spell=19715 — Counterspell: instant, 30 yd range, 45 yd radius, interrupt + 10 s school lockout.
- https://wotlkdb.com/?spell=23138 and https://wotlkdb.com/?spell=23139 — Gate of Shazzrah: dummy (100 yd) → teleport to target.
- https://wotlkdb.com/?spell=21655 — Blink: leap 20 yd, 1 s, immune to Frozen/Rooted.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_shazzrah.cpp — timers: Arcane Explosion 6 s then 5–9 s; Curse 10 s then 20 s; Counterspell 15 s then 16–20 s; Magic Grounding 24 s then 35 s; Gate 30 s then 45 s, threat reset then Arcane Explosion.
- https://raw.githubusercontent.com/scriptdev2/scriptdev2-classic/master/scripts/eastern_kingdoms/molten_core/boss_shazzrah.cpp — same timers; Blink target = random attacker, teleport to their position, DoResetThreat, Arcane Explosion.
- https://www.wowhead.com/classic/guides/shazzrah-molten-core-strategy (r.jina.ai) — Curse ~every 10 s, Arcane Explosion ~every 4 s, Blink ~every 30 s (varies), Counterspell ~every 15 s, Deaden Magic ~every 10 s; stop-DPS-on-blink procedure; Purge/Dispel Magic on Deaden Magic.
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/241 (Warcraft Tavern) — Arcane Explosion 0.5 s cast, Deaden Magic 30 s Magic, Curse 5 min, Blink 1 s; Counterspell ~every 15 s.
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-6-shazzrah — Blink ~45 s, 20 yd Arcane Explosion, four corner groups in Garr's room, hunter pull, only MT decursed.
- https://wowtbc.gg/classic/boss-guides/molten-core — Arcane Explosion every 4 s; stacking vs spreading strategies; SoM Image.

## Overview
- Level ?? (boss). Health 351,780 (Era 40-player); 703,560 Seasonal. Mana 39,300. No enrage. Sixth boss (same area as Geddon); required (Rune of Mazj).
- Phases: none; the fight is a loop punctuated by Blink (threat wipe).
- Raid-size assumptions: 40-man Era. SoM: each Blink leaves an Image of Shazzrah casting Arcane Explosion; taunt-immune.

## Abilities

### Arcane Explosion
- Name: Arcane Explosion (spell 19712)
- Type: AoE (around boss)
- Target rule: everyone within 30 yd (DBC, Wowhead TBC); wiki/Ten Ton Hammer say 20 yd
- Cast time: 0.5 s; interruptible unknown (0.5 s makes it impractical)
- Cooldown or cadence: Wowhead guide/wowtbc.gg "every 4 seconds"; cmangos first 6 s then every 5–9 s; also cast immediately after every Blink.
- Damage: 925–1075 Arcane (doubled to ~2000 on cursed players), 30 yd
- Debuff: none
- Movement effect: none
- Telegraph: 0.5 s cast bar

### Shazzrah's Curse
- Name: Shazzrah's Curse (spell 19713)
- Type: AoE (room) debuff
- Target rule: everyone within 45 yd (DBC) / 35 yd (Wowhead TBC, wiki)
- Cast time: instant
- Cooldown or cadence: Wowhead guide ~10 s; cmangos first 10 s then every 20 s
- Damage: none; +100% magic damage taken (all schools) for 5 min
- Debuff: dispel type Curse (Mage/Druid, Restorative Potion). No spread.
- Movement effect: none
- Telegraph: none

### Magic Grounding (Deaden Magic)
- Name: Magic Grounding (spell 19714; guides call it Deaden Magic)
- Type: other (self buff)
- Target rule: self
- Cast time: instant
- Cooldown or cadence: cmangos first 24 s then every 35 s; Wowhead guide ~every 10 s
- Damage: none; Shazzrah takes 50% less magic damage for 30 s
- Debuff: buff, 30 s, dispel type Magic — Priest Dispel Magic / Shaman Purge (Felhunter Devour Magic possible but it dies to Arcane Explosion)
- Movement effect: none
- Telegraph: buff visible with Detect Magic (wiki).

### Counterspell
- Name: Counterspell (spell 19715)
- Type: AoE silence/interrupt
- Target rule: everyone within 45 yd (DBC radius; 30 yd range); a Wowhead commenter claims it is frontal — unverified
- Cast time: instant
- Cooldown or cadence: Wowhead guide/Warcraft Tavern ~15 s; cmangos first 15 s then 16–20 s
- Damage: none; interrupts current cast and locks that school for 10 s. High threat (wiki).
- Debuff: 10 s school lockout, not dispellable
- Movement effect: none
- Telegraph: none; use timers, stop casting 1–2 s before, use instants.

### Blink / Gate of Shazzrah
- Name: Gate of Shazzrah (23138 → 23139) and Blink (21655)
- Type: teleport + threat wipe
- Target rule: teleports onto a random player (scriptdev2: random attacker), then resets all threat and casts Arcane Explosion
- Cast time: instant
- Cooldown or cadence: cmangos first 30 s then every 45 s; wiki/Ten Ton Hammer ~45 s; Wowhead guide ~30 s "times can vary"
- Damage: follow-up Arcane Explosion 925–1075 (×2 if cursed) on everyone within 30 yd of the landing point
- Debuff: none
- Movement effect: Shazzrah moves; threat list reset to zero
- Telegraph: none; he appears next to the target.

## Adds
- None in Era. (SoM: Image of Shazzrah spawns at each Blink and spams Arcane Explosion until the end.)

## Positioning and movement
- Tank: pull into Garr's room (Ten Ton Hammer, wiki) or kill Geddon and clear the area first (Wowhead). Hunter pulls so Shazzrah is not tanked immediately (he would blink into a group). MT stands in the middle of the raid's circle. After each Blink the tank runs to Shazzrah and re-establishes threat (Paladin 40 yd taunt strategy in wiki: only paladin taunts). Facing irrelevant unless the frontal-Counterspell claim is true (then face him away).
- Melee DPS: classic strategy keeps melee at range (Arcane Explosion, curse) until 5–10% HP, then Execute and run out (wiki, Ten Ton Hammer). Modern stacking strategy (wowtbc.gg) has melee in with the MT, decursed fast.
- Ranged DPS: four groups in the room's corners (N/W/S/E), each 30+ yd from the MT and from each other, each with its own decurser and an off-tank to bring him back (wiki). Stop casting 1–2 s before each Counterspell; stop DPS entirely after a Blink until the tank has threat; wand when locked out.
- Healers: one per group, 5 yd behind decursers; instant heals around Counterspell; outside 30 yd of Shazzrah.
- Whole raid: spread so a Blink's Arcane Explosion hits one group; the blinked-on group's off-tank picks him up and walks him back to the centre; after a Blink the targeted player runs toward the MT.

## What each role must do and must not do
- Tank:
  1. Do not tank him at the pull (hunter pull), then take him in the centre.
  2. After every Blink run to him immediately (or Paladin taunt from 40 yd); the raid is holding DPS until you have threat.
  3. Be the first decurse priority; you eat every Arcane Explosion.
  4. Keep the fight in open space with 30 yd clear around him.
- DPS:
  1. Stop all DPS the instant he blinks; resume only when a tank has aggro.
  2. Casters: stop casting before Counterspell, use instants or wand during the lockout.
  3. Mages decurse (tanks > melee > rest); Priests/Shamans Dispel/Purge Deaden Magic on sight.
  4. Melee stay out until 5–10% in the classic strategy; never stand within 30 yd if not needed.
- Healer:
  1. Decurse first — a cursed player takes 2000 per Arcane Explosion.
  2. Pre-heal the group he blinked to; expect an Arcane Explosion immediately.
  3. Time heals around the 15 s Counterspell; keep instants ready.
  4. Keep Detect Magic up (mage) so Deaden Magic is seen.

## Timeline of a typical pull
- t=0: hunter pulls; MT picks him up in the centre of the circle.
- t=6 s: first Arcane Explosion (30 yd), then every 4–9 s for the entire fight.
- t=10 s: first Shazzrah's Curse (45 yd), then every 10–20 s.
- t=15 s: first Counterspell (10 s lockout), then every 15–20 s.
- t=24 s: first Magic Grounding (-50% magic damage, 30 s); dispel/purge; then every 35 s.
- t=30 s: first Blink onto a random player → threat reset → Arcane Explosion; raid stops DPS, tank re-picks; then every ~45 s (30 s–45 s per source).
- Repeat; 351k HP, 2–4 min. Melee join under 10%.

## Open questions
- Blink cadence: ~45 s (wiki, Ten Ton Hammer, cmangos) vs ~30 s varying (Wowhead guide).
- Arcane Explosion radius: 30 yd (DBC, Wowhead TBC) vs 20 yd (wiki, Ten Ton Hammer); cadence 4 s (guides) vs 5–9 s (cmangos).
- Curse radius 45 yd (DBC) vs 35 yd (Wowhead TBC, wiki); cadence 10 s vs 20 s.
- Deaden Magic cadence: ~10 s (Wowhead guide) vs 35 s (cmangos).
- Counterspell shape: radial 45 yd (DBC) vs frontal (one Wowhead comment).
- Whether Gate of Shazzrah (23138) or Blink (21655) is the live teleport; the Wowhead Classic guide lists a third ID (28391).
