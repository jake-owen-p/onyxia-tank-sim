# Kurinnaxx (Ruins of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Kurinnaxx — ability list with spell IDs (Frenzy 26527, Mortal Wound 25646, Sand Trap 25656, Summon Player 26446, Thrash 3391, Wide Slash 25814), enrage at 30% (changed from 20% in patch 1.10.1), positioning notes, wide aggro radius / sees stealth.
- https://www.wowhead.com/classic/guide/kurinnaxx-ruins-of-ahnqiraj-strategy (fetched through r.jina.ai) — enrage 30%, tank swap at 3-4 Mortal Wound stacks, Sand Trap 20 s silence and -75% hit, spread rules, long aggro range.
- https://www.wowhead.com/classic/npc=15348/kurinnaxx (fetched through r.jina.ai) — Health 1,165,850 (labelled "SoM 20 Player"), 7 abilities, reputation.
- https://www.warcrafttavern.com/wow-classic/guides/ruins-of-ahnqiraj-aq20/ — off-tank taunt at ~5 stacks, Sand Trap 75% hit penalty and silence for 20 s, permanent enrage at 30%, "one group of flying adds" claim, raid composition (2 tanks, 5-7 healers).
- https://www.tentonhammer.com/guides/tentonhammers-guide-to-the-ruins-of-ahn-qiraj-section-2-1 — Mortal Wound 10% per stack for 15 s stacking to 100%, Sand Trap "up to 2000 damage", ~10 yd explosion range, three-tank rotation swapping at 3 stacks, tank takes ~900 per hit normally, up to ~2000 after enrage.
- https://us.millenium.gg/guide/6975.html?page=2 — swap at 4-6 stacks, Sand Trap damage listed as "2,00" (typo), enrage 30% lasts until death.
- https://wotlkdb.com/?spell=25646 — Mortal Wound: -10% healing taken, 15 s, 5 yd (3.3.5a data).
- https://wotlkdb.com/?spell=25656 — Sand Trap (aura): 1750-2250 Nature damage, -75% physical hit, Silence, 8 yd radius, 20 s.
- https://wotlkdb.com/?spell=25648 — Sand Trap (summon): summons gameobject 180647, 1 min duration.
- https://wotlkdb.com/?spell=26524 — Sand Trap (serverside script, 100 yd).
- https://wotlkdb.com/?spell=25814 — Wide Slash: weapon damage +500 flat, 10 yd radius, Physical.
- https://wotlkdb.com/?spell=26527 — Frenzy (the "Enrage"): +250 flat physical damage, +75% melee haste, +20% size, 2 min.
- https://wotlkdb.com/?spell=3391 — Thrash: 2 extra attacks.
- https://wotlkdb.com/?spell=26446 — Summon Player: teleport target to caster.
- https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/Kalimdor/RuinsOfAhnQiraj/boss_kurinnaxx.cpp (raw fetched) — emulator timers: Mortal Wound 8-10 s / 8-10 s, Sand Trap 5-15 s / 5-15 s on random player within 100 yd, Wide Slash 10-15 s / 12-15 s, Thrash 16 s / 16 s, Enrage at 30%, trap detonates 5 s after spawn.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_kurinnaxx.cpp (raw fetched) — emulator timers: Mortal Wound 8 s / 8-10 s, Sand Trap 5 s / 10-15 s (on current victim), Thrash 1 s / 12-17 s, Wide Slash 10 s / 12-15 s, trap detonates 4 s after spawn, Enrage at <=30%.

## Overview
- Level ?? (boss), Silithid sand reaver. Health: Wowhead Classic lists 1,165,850 labelled "SoM 20 Player" (Season of Mastery); no Classic Era value was found on any fetched page (see Open questions). No enrage timer; a permanent damage enrage (Frenzy) at 30% HP. First boss of the raid, in the Scarab Terrace, required (he gates Andorov's spawn for Rajaxx).
- Phases: one phase plus a soft phase at 30% HP when Frenzy is applied (+75% attack speed, +250 flat damage, 2 min duration which in practice is "until he dies"). Patch 1.10.1 moved the threshold from 20% to 30% (wiki).
- Raid-size assumptions: 20-man Classic Era. SoM/Anniversary HP is higher than Era (Wowhead's SoM figure above). Season of Discovery changes not covered.

## Abilities

### Mortal Wound
- Type: debuff applied by melee on the tank (sources describe it as applied via his cleave/front arc, so anyone in front can get it).
- Target rule: current tank / anyone in the frontal arc.
- Cast time: instant, not interruptible.
- Cadence: emulators use 8-10 s between applications (AzerothCore 8-10 s initial; CMaNGOS 8 s initial). Guides describe it as "stacks quickly".
- Damage: none directly (physical school, 5 yd combat range).
- Debuff: Mortal Wound, 15 s, no dispel type (cannot be removed, must time out), -10% healing taken per stack, stacks to 10 (100%). Each new application refreshes the 15 s duration, so stacks never fall off while the same tank holds him.
- Movement effect: none.
- Telegraph: none other than the debuff appearing on the tank; watch the stack count.

### Sand Trap
- Type: ground hazard (delayed AoE).
- Target rule: random player (AzerothCore: random player within 100 yd; CMaNGOS: current victim; guides say "under random raiders").
- Cast time: instant spawn of a gameobject; the trap "grows" then detonates. Emulators detonate 4 s (CMaNGOS) or 5 s (AzerothCore) after spawning; guides say "a few seconds".
- Cadence: AzerothCore 5-15 s initial then every 5-15 s; CMaNGOS 5 s initial then every 10-15 s. Guides: "every so often".
- Damage: 1750-2250 Nature in an 8 yd radius (wotlkdb 25656); TenTonHammer "up to 2000", ~10 yd range.
- Debuff: Sand Trap, 20 s, no dispel type, -75% chance to hit (physical) and Silence (all casting stopped) for 20 s. Does not spread.
- Movement effect: none.
- Telegraph: a ring/sand swirl appears in the sand under the player, visibly growing for ~4-5 s before it bursts. Anyone who leaves the 8 yd radius before it bursts is unaffected.

### Wide Slash
- Type: frontal cone / melee cone (weapon damage in a 10 yd radius in front).
- Target rule: everything in front of him (cast on current victim, radius 10 yd).
- Cast time: instant.
- Cadence: emulators 10-15 s initial then every 12-15 s.
- Damage: normal weapon damage + 500 (wotlkdb) / "+314" (wiki tooltip) Physical, 10 yd. Wowhead Classic comment (via search) reports slashes of 800-1200 on a tank.
- Debuff: none directly, but guides attribute Mortal Wound stacking to anyone caught in his frontal cleave, so treat this cone as "do not stand in it".
- Telegraph: none.

### Thrash
- Type: other (extra melee attacks).
- Target rule: current tank.
- Cast time: instant / passive proc.
- Cadence: emulators 12-17 s (CMaNGOS) or every 16 s (AzerothCore).
- Damage: 2 extra white swings, Physical. Combined with Wide Slash this is the spike window for the tank: TenTonHammer reports a tank losing 4000-5000 in a few seconds.
- Telegraph: none.

### Frenzy (the "Enrage")
- Type: enrage.
- Target rule: self.
- Cast time: instant.
- Cadence: once, at 30% HP (wiki, Wowhead guide, Warcraft Tavern, Millenium, both emulators). Nominal duration 2 min; never expires in practice.
- Effect: +75% melee haste, +250 flat physical damage, +20% size. TenTonHammer: normal hits reach ~2000 after enrage (vs ~900 before). Not dispellable (no Tranquilizing Shot source found; see Open questions).
- Telegraph: he grows 20% larger; no emote text found.

### Summon Player
- Type: teleport/aggro pull (teleports a target to him).
- Target rule: unknown (a player out of range).
- Cast time: instant. Cadence: unknown. Both emulators list it as "not yet implemented", and no guide mentions it being used on live beyond TenTonHammer's "can summon a player into combat in front of him". Treat as rare/unknown.

## Adds
- None from the boss itself. Warcraft Tavern mentions "one group of flying adds spawns" during the fight and that the off-tank should pick them up; no other source (wiki, Wowhead guide, TenTonHammer, emulators) mentions any adds, so this is most likely trash near the Scarab Terrace being pulled by his very wide aggro radius. Clear all trash in the room first (Wowhead guide).

## Positioning and movement
- Tank: pick him up where he stands after the room is clear, face him away from the raid toward open sand. Two (TenTonHammer: three) tanks stand at his front; the active tank in front, the resting tank(s) at his side/behind out of the frontal cone. Swap on Mortal Wound stacks (3-4 per Wowhead guide; 3 per TenTonHammer; ~5 per Warcraft Tavern; 4-6 per Millenium). The resting tank taunts, the previous tank steps out of the cone and lets 15 s pass so stacks drop. Move him a few yards whenever a Sand Trap spawns under melee so the trap stays visible and no group is standing in it. Never let both tanks stand in the frontal cone at the same time (both get stacks).
- Melee DPS: behind him or on one flank, never in the frontal 10 yd cone (Wide Slash / Mortal Wound). Wiki recommends stacking melee on one side so a Sand Trap under melee is easy to see and leave. Step out of any sand ring immediately.
- Ranged DPS: spread out around him at range so a single Sand Trap (8 yd) catches at most one person. Keep moving out of rings; the silence does not matter for a wand, so wand while silenced.
- Healers: spread like ranged, at max healing range from the tank, never clumped (a healer silenced for 20 s during the enrage can kill the tank). Pre-plan who covers the tank if one healer is silenced.
- Whole raid: no stacking points; the whole fight is "spread and watch your feet". The sand rings are the only run-out trigger.

## What each role must do and must not do
- Tank:
  1. Taunt swap at the agreed Mortal Wound stack count (3-4); announce swaps.
  2. When resting, leave the frontal cone so you take no more stacks; return only once your stacks have expired (15 s after the last application).
  3. Do not stand in a Sand Trap ring with the boss; move him 10 yd and keep facing him away from the raid.
  4. At 30% (Frenzy) use defensive cooldowns (Shield Wall, Last Stand) and expect ~2x damage; swap more aggressively if healers are silenced.
  5. Never turn him toward the raid during a swap.
- DPS:
  1. Leave any sand ring within the 4-5 s it takes to grow.
  2. Melee never stand in front. Ranged stay spread.
  3. If trapped: bandage, drink a potion, wand (silence stops spells only).
  4. Watch threat; TenTonHammer suggests 50-70% output until the 30% enrage, then use all cooldowns.
  5. Nothing to interrupt or dispel.
- Healer:
  1. Spread so no two healers can be silenced by one trap.
  2. Tank healing becomes 10% less effective per stack; pre-cast big heals, and expect spike damage during Thrash + Wide Slash windows (4000-5000 in a few seconds per TenTonHammer).
  3. Save mana for the sub-30% enrage, when the tank takes about double damage.
  4. Mortal Wound cannot be dispelled; the Sand Trap debuff cannot be dispelled (no dispel type).

## Timeline of a typical pull
- t=0: tank engages (long aggro range; pull deliberately). Raid spreads.
- t=~5 s: first Sand Trap spawns under a random player (emulators 5 s). Repeats roughly every 5-15 s for the rest of the fight.
- t=~8 s: first Mortal Wound on the tank, then every ~8-10 s. First swap around t=30-40 s (3-4 stacks).
- t=~10-15 s: first Wide Slash, then every 12-15 s; Thrash every ~12-17 s.
- Tank swaps continue every ~30-40 s; off-tank's stacks expire 15 s after stepping out.
- At 30% HP: Frenzy. Tank damage roughly doubles; DPS burn with cooldowns; healers spam the tank. Typical kill ~2-4 min for a raid in ZG/MC-level gear (no source gives a precise kill time).

## Open questions
- Classic Era 20-man HP: only the Wowhead "SoM 20 Player" value 1,165,850 was readable; Era HP not found on fetched pages.
- Enrage threshold: 30% (wiki, Wowhead guide, Warcraft Tavern, Millenium, emulators) vs 20% (pre-1.10.1 and some older guides via search snippet).
- Tank swap stack count: 3 (TenTonHammer), 3-4 (Wowhead guide), ~5 (Warcraft Tavern), 4-6 (Millenium).
- Sand Trap target: random player anywhere (AzerothCore, guides) vs current victim (CMaNGOS).
- Sand Trap detonation delay: 4 s (CMaNGOS) vs 5 s (AzerothCore); guides only say "a few seconds".
- Sand Trap damage: 1750-2250 (wotlkdb 3.3.5a data) vs "up to 2000" (TenTonHammer); radius 8 yd (wotlkdb) vs ~10 yd (TenTonHammer).
- Wide Slash flat damage: +500 (wotlkdb) vs +314 (wiki tooltip).
- Whether Mortal Wound is applied by melee swings or only by Wide Slash; guides say "cleave", emulators cast it as a separate spell on the victim every 8-10 s.
- Warcraft Tavern's "one group of flying adds" is unconfirmed by any other source.
- Whether Frenzy can be removed by Tranquilizing Shot: no source found either way.
