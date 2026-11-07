# Moam (Ruins of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Moam — ~340,000 HP, Drain Mana 500 from 6 players / +1000 to Moam each, Arcane Explosion at 100% mana (~3000 to raid + knock-up), Turn to Stone after 90 s summoning three Mana Fiends (~15,000 HP, Arcane Explosion, Counterspell 12 s), reverts after 90 s or when fiends die, several raid-composition strategies.
- https://www.wowhead.com/classic/guide/moam-ruins-of-ahnqiraj-strategy (fetched through r.jina.ai) — mana users wait a few seconds on pull, Drain Mana on 6 random mana users, ~3000 Arcane + knock-up, stone at 90 s, immune and stops draining while stone, reverts at 90 s or full mana, Mana Fiend Counterspell 12 s, Banish.
- https://www.wowhead.com/classic/npc=15340/moam (fetched through r.jina.ai) — Health 799,500 ("SoM 20 Player"), mana 26,200, "3 elementals at 90 seconds".
- https://www.warcrafttavern.com/wow-classic/guides/ruins-of-ahnqiraj-aq20/ — Viper Sting / Mana Burn / Drain Mana rotation, Arcane Eruption "likely wipe", stone at 90 s with 3 fiends, banish 2 kill 1, revive after 90 s, composition 1 hunter + 3-4 priests/warlocks.
- https://www.tentonhammer.com/guides/tentonhammers-guide-to-the-ruins-of-ahn-qiraj-section-2-3 — Drain Mana "500 mana from 5 players", explosion >3000 + 1000 fall, "Moam Bristles with energy" emote, stone form lasts 90 s or until 100% mana, no aggro table while stone, fiend Arcane Explosion ~1000, Trample front arc ~1000 on plate, move at ~80 s.
- https://us.millenium.gg/guide/6975.html?page=3 — ability list (Drain Mana, Arcane Eruption, Stoneform, Summon Mana Fiend, Trample), face Moam away from the raid, fiends at 90 s.
- https://wotlkdb.com/?spell=25671 — Drain Mana: drains 500 mana, Shadow school.
- https://wotlkdb.com/?spell=25672 — Arcane Eruption: 3063-3937 Arcane damage + knockback (300) in 45 yd, costs 25,000 mana.
- https://wotlkdb.com/?spell=25685 — Energize: stun self, +500 mana per 1 s, -50 flat damage taken, 1 week duration (removed by script).
- https://wotlkdb.com/?spell=15550 — Trample: weapon damage, 10 yd radius, self-centred.
- https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/Kalimdor/RuinsOfAhnQiraj/boss_moam.cpp (raw fetched) — Drain Mana 3 s then every 2-6 s on 6 random mana-using players, Trample 9 s then every 15 s, stone phase at 90 s for 90 s (ends early if all fiends die or mana is full), Arcane Eruption whenever mana == max, mana set to 0 and regen disabled, 3 fiends summoned front/left/right.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_moam.cpp (raw fetched) — Drain Mana every 6 s, Trample 9 s / 15 s, Double Attack 8-12 s, Summon Manafiends 90 s / 90 s, Energize 90 s then every 180 s lasting 90 s, fiends get 100,000 threat on a random player, emote IDs for aggro / mana full / energizing.
- https://wotlkdb.com/?npc=15527 and https://warcraft.wiki.gg/wiki/Mana_Fiend — Mana Fiend level 30 elite arcane elemental; no HP listed.

## Overview
- Level ?? (boss), Obsidian destroyer (Elemental, mana user). Health: wiki "about 340,000"; Wowhead Classic 799,500 labelled "SoM 20 Player". Mana pool: 26,200 (Wowhead Classic). He starts at 0 mana and does not regenerate on his own. No enrage timer. Third boss, The Reservoir, optional.
- Phases: Phase 1 (active) for 90 s from the pull; Phase 2 (stone / Energize) begins at 90 s: three Mana Fiends spawn and Moam turns to stone for 90 s, immune, stunned, not attacking or draining, gaining 500 mana per second. Phase 2 ends early if all three fiends die or if his mana reaches 100%. Then Phase 1 again for 90 s, and so on until he dies. Arcane Eruption fires whenever his mana reaches 100% in either phase.
- Raid-size assumptions: 20-man Classic Era. Mana-drain classes (Priest Mana Burn, Warlock Drain Mana, Hunter Viper Sting) are the key composition requirement; wiki's preferred setup is 3 priests, 3 warlocks, 1 hunter.

## Abilities

### Drain Mana
- Type: targeted mana drain (multi-target).
- Target rule: 6 random players who use mana (AzerothCore filter: players whose power type is mana; wiki: 6 random; TenTonHammer: 5). Non-mana classes and druids in cat/bear form cannot be drained.
- Cast time: instant.
- Cadence: AzerothCore 3 s after pull, then every 2-6 s; CMaNGOS every 6 s. The Wowhead guide gives no cadence.
- Effect: drains 500 mana from each target and gives Moam 1000 mana per target drained (wiki; i.e. up to 6000 mana per cast). With a 26,200 pool that is ~5 full casts, hence the "mana users wait 2-3 seconds before entering" and "keep him drained" advice.
- Debuff: none. Movement: none.
- Telegraph: none; watch his mana bar. He emotes when he is about to reach full ("Moam bristles with energy" per TenTonHammer).

### Arcane Eruption (often called Arcane Explosion in guides)
- Type: AoE (room) + knock-up.
- Target rule: everyone within 45 yd of Moam.
- Cast time: instant; triggered the moment his mana hits 100% (AzerothCore checks every tick; CMaNGOS casts on a 5 s cooldown whenever available). Costs 25,000 mana, so it empties him and the cycle restarts.
- Damage: 3063-3937 Arcane (wotlkdb) / "around 3000" (wiki, Wowhead guide) plus knock-up fall damage of 1000+ (TenTonHammer), 45 yd radius.
- Movement effect: knockback value 300 (launches players upward/outward).
- Telegraph: his mana bar approaching full; emote "Moam bristles with energy" (the EMOTE_MANA_FULL in both emulators). Treat 90%+ mana as the run-out signal (TenTonHammer: everyone but the tank and one healer runs away around 80 s if the raid cannot drain him).

### Trample
- Type: melee AoE (self-centred, 10 yd).
- Target rule: everyone within 10 yd (TenTonHammer calls it a front arc).
- Cast time: instant. Cadence: 9 s after pull then every 15 s (both emulators).
- Damage: weapon damage, Physical; TenTonHammer ~1000 on plate. Wowhead guide: "can simply be healed through".
- Telegraph: none.

### Double Attack (CMaNGOS only, 18941)
- Extra melee swing every 8-12 s; the Wowhead guide describes his melee as low ("Tanks can wear DPS gear").

### Summon Mana Fiends + Energize (stone phase)
- Type: summon adds + self-stun/immunity.
- Target rule: self; fiends spawn in front, left and right of him (AzerothCore 25681/25682/25683).
- Cast time: instant. Cadence: 90 s after pull, then every 90 s of active time (i.e. every 180 s of real time: 90 active + 90 stone).
- Effect of Energize: he is stunned (cannot move or attack), takes -50 flat damage per hit (wotlkdb) and guides describe him as fully immune; he gains 500 mana per second (so from 0 he is full in ~52 s unless drained); his threat table is cleared (TenTonHammer: "no aggro table"). Ends after 90 s, or when all three fiends are dead, or when his mana is full (which also fires Arcane Eruption).
- Telegraph: emote (EMOTE_ENERGIZING / EMOTE_STONE_PHASE) and he visibly turns to stone.

## Adds
- Mana Fiend x3 (NPC 15527, level 30 elite arcane elemental): spawn at the 90 s mark in front, left and right of Moam. ~15,000 HP (wiki). Abilities: Arcane Explosion AoE (~1000, wiki; no knock-up) and Counterspell locking a school for 12 s (wiki, Wowhead guide). Each fiend aggros a random player with large fixed threat (CMaNGOS: 100,000 threat on a random player). Banishable (warlock Banish is the standard answer; freezing traps also work per wiki). Plan: banish two, kill one (Warcraft Tavern) or banish all three and keep draining while the raid DPSes the stoned Moam (wiki). Killing all three ends the stone phase early. They die when killed; they do not despawn on a timer. If Moam dies first, release banishes one at a time and kill them.

## Positioning and movement
- Tank: pick him up on his platform after clearing nearby trash; face him away from the raid (Millenium) so Trample and any Eruption launch hit as few people as possible. Non-mana melee and the tank go in first; mana users enter 2-3 s later (wiki). During stone phase he has no threat table; re-establish on the taunt when he wakes. Never tank him near a ledge (the Eruption knock-up adds fall damage).
- Melee DPS: behind/side of him; around the 80 s mark move out of Trample range if the raid intends to let him erupt. Druids in cat form cannot be drained (wiki) and are good extra DPS.
- Ranged DPS and drainers: spread beside and behind him at 20-30 yd (TenTonHammer). Warlocks move to the front at ~80 s to be in position for the three fiends. Keep more than 45 yd from him if you intend to dodge an Eruption.
- Healers: at range, spread; expect to be drained (500 per cast) so conserve. One priest may stop draining and heal once he is under ~45% (wiki).
- Whole raid: the run-out point is anything beyond 45 yd from Moam when his mana approaches full. If the raid can hold his mana down, nobody moves.

## What each role must do and must not do
- Tank:
  1. Engage first with the melee; mana users wait 2-3 s.
  2. Hold him facing away; nothing to taunt-swap.
  3. At 90 s he stones: pick up whatever fiend is not banished, or stay on Moam if all three are banished.
  4. When he wakes (fiends dead or 90 s), be in melee range to catch him; threat is reset.
  5. If the raid plans to let him erupt, stay in with one healer and use a Greater Arcane Protection Potion (wiki).
- DPS:
  1. Hunters keep Viper Sting on him permanently; priests chain Mana Burn; warlocks chain Drain Mana. Aim to have him below ~45% HP when the 90 s mark arrives (wiki) or simply kill him before 90 s with high DPS (wiki, Wowhead guide).
  2. Warlocks: each takes a preset fiend (left, centre, right) and Banishes on spawn, re-banishing as it breaks (TenTonHammer).
  3. Everyone else keeps DPSing Moam during the stone phase (he takes damage, just reduced; guides treat him as the DPS target with no threat concerns).
  4. Do not break Banish on the fiends; kill only the assigned one.
  5. Watch his mana bar; if it is going to cap, be outside 45 yd.
- Healer:
  1. Expect to lose 500 mana per drain; drink mana potions freely (Warcraft Tavern).
  2. Heal Trample on melee and tank; it is small.
  3. Pre-heal before a planned Eruption; everyone takes ~3000 + fall damage.
  4. Counterspell from fiends locks a school for 12 s; keep fiends banished or dead, and heal through with a different school if locked.

## Timeline of a typical pull
- t=0: tank + non-mana melee engage; mana 0%.
- t=2-3 s: mana users enter; first Drain Mana at ~3-6 s (6 targets, +6000 mana). Drains repeat every 2-6 s.
- t=9 s: first Trample, then every 15 s.
- t=0-90 s: drainers hold his mana near 0; raid pushes him down (target <45% by 90 s). If drains fail, mana caps in roughly 5 drains and Arcane Eruption fires (~3000 + fall damage, knockback) and his mana resets to near 0.
- t=90 s: emote, three Mana Fiends spawn (front, left, right), Moam turns to stone and gains 500 mana/s. Banish two, kill one (or banish all three). Drainers keep draining him (he does not drain back). Raid DPSes Moam.
- t=90-180 s: stone phase ends at 180 s, or when the last fiend dies, or when his mana caps (Eruption).
- Then Phase 1 repeats for another 90 s. Most raids kill him in the first stone phase or shortly after waking.

## Open questions
- HP: ~340,000 (wiki) vs 799,500 "SoM 20 Player" (Wowhead Classic). Era value unclear.
- Drain Mana targets: 6 (wiki, Wowhead guide, AzerothCore) vs 5 (TenTonHammer); cadence 2-6 s (AzerothCore) vs 6 s (CMaNGOS) vs unknown on live.
- Whether he is fully immune while stoned (wiki, Wowhead guide) or just takes reduced damage (wotlkdb Energize: -50 flat damage taken; AzerothCore/CMaNGOS let the raid DPS him).
- Arcane Eruption radius 45 yd (wotlkdb) is not confirmed by any guide; guides only say "the entire raid".
- Mana Fiend HP ~15,000 (wiki) and Arcane Explosion ~1000 (TenTonHammer) are single-source.
- Trample: self-centred 10 yd radius (spell data) vs "front arc" (TenTonHammer).
- Whether the stone phase recurs every 90 s of active time (both emulators) or only once; live guides say "repeat until he dies".
