# Onyxia's Lair (Classic Era, level 60, 40-player) — research index

Boss files:
- [onyxia.md](onyxia.md) — Onyxia (the only boss).

## Boss order
1. Onyxia. Nothing else is required; the four Onyxian Warders in the entrance tunnel are the only trash and must be cleared to reach her (they respawn in the tunnel while she is in combat and despawn when she dies).

## Trash worth modelling
- Onyxian Warder (NPC 12129), level 60–63 elite black dragonspawn, HP 76,300–83,275 (classic.warcraftdb.com). Four in the tunnel, pulled one at a time. Abilities: Cleave 19983 (next melee, +50, up to 10 targets), Pierce Armor 12097 (−75% armor for 20 s on the tank), Flame Lash 18958 (56–64 Fire, −20 Fire resistance for 45 s, Magic dispel, stacks), Fire Nova (self-centred ~10 yd, ~1000 Fire in 2005 gear, spell ID unconfirmed). Worth modelling only the "tank alone inside Fire Nova range, melee wait for the first nova, dispel Flame Lash" rule; they are not part of the boss rehearsal.
- Onyxian Whelp (NPC 11262), level 56–57, HP ~2,700, Pyroblast 20228. Modelled inside the boss encounter (Phase 2 waves, egg hatching, Phase 3 trickle), not as separate trash.
- Egg clusters along the chamber walls and in the two side pits hatch whelps (~20+) when a player enters or is knocked/feared into them; this is the main positioning hazard and should be modelled as a geometry rule.

## Raid composition assumptions (40-man Era)
- 1 main tank (warrior) parked against the north wall; 1–2 additional warriors who are #2/#3 on threat (she is taunt-immune, so a dead main tank cannot be replaced by taunt) and who run the two whelp pit groups in Phase 2.
- 2 whelp groups (traditionally raid groups 7 and 8): each a warrior, a mage (AoE), 1–2 healers, stationed at the east and west pit mouths during Phase 2.
- ~10–12 healers, including at least one dwarf priest (Fear Ward on the tank for Bellowing Roar) and shamans for Tremor Totem (Horde); the rest split along the north wall left/right.
- Remaining ~20–24 DPS split odd groups left (west) / even groups right (east); hunters with Track Dragonkin as Phase 2 position callers.
- Everyone carries a Drakefire Amulet (attunement), Greater Fire Protection Potion, and fear breaks where available (PvP trinket, Will of the Forsaken, Berserker Rage).
- Anniversary/Era realms have no buff or debuff limits (Wowhead news), so DoT-heavy Phase 2 burns are standard.

## Sim-relevant constants (see onyxia.md for sources and disagreements)
- Phases at 65% and 40% HP; HP 1,099,230 (working value).
- Phase 1/3 cadences (observed by DBM): Flame Breath 9.7–35.6 s (first 11.3–28.5), Wing Buffet 17.8–32.4 s (first 11.3–24.5), Bellowing Roar 9.7–58.3 s. Cleave 6 s cooldown. Knock Away −25% threat every ~15–40 s. Tail Sweep rear 30 yd cone.
- Phase 2: Fireball 3 s cast, 8 yd splash, 1700–2300 Fire, wipes the target's threat, every ~3–5 s while she hovers; Deep Breath 5 s warning emote then a flame wall from her position to the opposite of 8 positions, each tick 1275 Fire; repositions every 15–25 s with ~1/3 chance of a breath; whelp wave of 16–20 at liftoff, then 4–10 every 30–90 s.
- Phase 3: Bellowing Roar 1.5 s cast, 3 s fear, cast on landing then every ~10–30 s; lava cracks ~1500 Fire for a few seconds after each fear; threat effectively reset at landing (model as reset).

## Sources
Full per-number source list is at the top of onyxia.md. Main classes of source:
- Wowhead Classic spell and NPC pages (via the r.jina.ai reader proxy; wowhead.com itself returns 403 to direct fetches) for cast times, damage, radii, durations.
- classic.warcraftdb.com for Era NPC HP/level.
- DBM-Vanilla and BigWigs_Classic source for observed timers, emotes, phase yells.
- cmangos and vmangos emulator scripts for cadence models, flight-point geometry and whelp wave logic (emulator estimates, marked "~").
- warcraft.wiki.gg (Onyxia (Classic), Onyxia (tactics), Talk:Onyxia, Onyxian Warder/Whelp, Onyxia's Lair (Classic)), Wowhead Classic strategy and overview guides, Warcraft Tavern, Amazon Basin wiki (2005), Epog, evilguild, Almar's, Millenium, wowtbc.gg, and two 2019 Blizzard Classic forum threads for strategy, positioning and the Phase 3 threat behaviour.
- Not reachable: Icy Veins (bot check), wowpedia.fandom.com (402), vanilla-twinhead (Cloudflare), Warcraft Logs (JS only).
