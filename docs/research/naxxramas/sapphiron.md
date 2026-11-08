# Sapphiron (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Sapphiron_(Classic) — Classic page: HP 3,164,450; immune to Frost and taunt; Frost Aura 600 Frost per 2 s (6 s aura, reapplied), partially resistible; Chill blizzards 3,063–3,907 unresistable Frost per 2 s + 65% slow, continue in the air; Cleave (10 targets); Life Drain every 24 s on 10 random targets, 1,750–2,250 drained / 3,500–4,500 healed every 3 s for 12 s, curse; Tail Sweep 600–1,000 + knockback; Berserk at 15 min (+500% Frost Aura); first air phase at 45 s then 67 s after each landing, none below 10%; Icebolt ×5 (2,625–3,375 to target and 10 yd, ice block blocks LoS); Frost Breath bomb after 7 s for 75,000–125,000 to all in LoS; 12+ healers, ~150 average unbuffed FR, GFPP + Juju Chill; move behind blocks only after the 3rd Icebolt; quotes.
- https://www.wowhead.com/classic/guide/sapphiron-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: FR gear sources; Frost Aura 599 every 2 s; Life Drain curse → Mages/Druids decurse constantly; Summon Blizzard roaming ~2,000 Frost/s; Enrage at 15 min raises Frost Aura to ~3,600/tick; Icebolt 2,624 + splash + ice cube, 5 per air phase; Frost Breath 74,999 one-shot avoided behind cubes, frees the cubed players; Tail Sweep, Cleave; ranged can cheat next to the cube and step behind before the breath.
- https://www.wowhead.com/classic/spell=28531/frost-aura — Frost Aura: periodic dummy 601 every 1 s ("Deals 600 frost damage a second"), 100 yd, unaffected by invulnerability.
- https://www.wowhead.com/classic/spell=28542/life-drain — Life Drain: instant, Curse, 12 s, leech 1,750 every 3 s (heals Sapphiron 3,500–4,500), 100 yd, ignores LoS.
- https://www.wowhead.com/classic/spell=28561/summon-blizzard — Summon Blizzard: summons a Blizzard object (5 min duration field), 10 yd.
- https://www.wowhead.com/classic/spell=31800/icebolt — Icebolt (immunity aura on the frozen player): 27 s, immunity to all schools. (DBM tracks the player ice block as 28522.)
- https://www.wowhead.com/classic/spell=28524/frost-breath — Frost Breath: 7 s cast, 75,000 Frost, 200 yd radius, triggers "Despawn Ice Block", persists through death.
- https://www.wowhead.com/classic/spell=15847/tail-sweep — Tail Sweep: 600 (tooltip 600–1,000) Physical in a 30 yd cone behind, knockback.
- https://www.wowhead.com/classic/spell=15584/cleave — Cleave: normal damage +30, up to 3 targets (wiki says up to 10).
- https://classicdb.ch/?npc=15989 — Sapphiron: 2,600,000 HP, melee 10,680–12,258, armor 4,691.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/FrostwyrmLair/Sapphiron.lua — DBM Classic: first air phase 31.2–45.9 s (variable on Era), later air phases 54.3–70.8 s after landing; landing 28.5 s after lift-off; Frost Breath cast → landing 12.2 s later; Life Drain every 21.1–27.5 s; Berserk 900 s; no air phase below 10%; Blizzard aura 28547; Icebolt 28522.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: ground phases 67 s (first 45 s); 6 abilities in the air (5 Icebolts + Frost Breath); Icebolt freezes 25 s and 10 yd splash; Frost Aura 100 yd; Life Drain decursable; frost resistance + GFPP mandatory; frost spells do no damage.

## Overview
- Level ?? boss, Undead frost wyrm. HP 3,164,450 (wiki) / 2,600,000 (classicdb.ch). Immune to Frost damage and to Taunt. Hard enrage at 15:00 (Frost Aura ×6 → ~3,600 per tick). First boss of the Frostwyrm Lair; unlocked only after all 13 wing bosses are dead; required for Kel'Thuzad.
- Phases: Ground (first ≈45 s, then ≈67 s each) ↔ Air (lift-off, 5 Icebolts, Frost Breath, landing ≈28–30 s later). Below 10% he stays grounded.
- Raid-size assumptions: 40-man Classic Era; single tank; ≥12 healers; everyone in frost resistance (~150 unbuffed average, paladin/shaman FR auras to the lowest groups); Greater Frost Protection Potions + Juju Chill; Mages/Druids for mass decursing.

## Abilities

### Frost Aura
- Name: Frost Aura (28531)
- Type: AoE (room) DoT
- Target rule: everyone within 100 yd, both phases, unaffected by invulnerability.
- Damage: 600 Frost (599 — Wowhead) every 2 s per the wiki/Wowhead (the spell data reads "600 frost damage a second" via a 1 s dummy tick — see Open questions); partially resistible → frost resistance and GFPP are the mitigation. 1% chance per tick of an extra tick (wiki).
- Berserk (15 min): +500% → ~3,600 per tick (Wowhead) — wipe.
- Telegraph: constant.

### Life Drain
- Name: Life Drain (28542)
- Type: debuff (curse), multi-target
- Target rule: 10 random players (wiki), 100 yd, ignores LoS.
- Cast time: instant.
- Cadence: every 24 s (wiki); DBM 21.1–27.5 s; ground phase only (DBM cancels it in the air).
- Effect: drains 1,750–2,250 HP every 3 s for 12 s and heals Sapphiron 3,500–4,500 per tick (4 ticks → up to 18k healing per target, 180k per cast if undispelled). The debuff can be resisted, the damage cannot (wiki).
- Debuff: Curse, 12 s → Remove Curse (Druid) / Remove Lesser Curse (Mage) immediately; decursers assigned per group and spread around the room.
- Telegraph: curse icons; DBM announce.

### Chill / Blizzard
- Name: Summon Blizzard (28561) → Blizzard object; Chill aura (DBM 28547)
- Type: ground hazard (roaming)
- Target rule: spawns on/near a random player and roams; in both phases.
- Damage: 3,063–3,907 unresistable Frost every 2 s (wiki) / ~2,000 per second (Wowhead) to anyone inside, plus a 65% movement slow that applies immediately and cannot be dispelled (wiki).
- Cadence: unknown ("roaming blizzards", several up at once).
- Telegraph: visible blizzard; move out at once; never let one spawn on an ice block (wiki).

### Cleave / Tail Sweep (ground)
- Cleave (15584): frontal, normal damage +30, up to 3 targets (spell) / 10 (wiki). Tail Sweep (15847): 600–1,000 Physical in a 30 yd cone behind him with knockback. Face him away from the raid; nobody behind the tail.

### Air phase — lift-off
- Cadence: first lift-off at 45 s (wiki, WT) / 31.2–45.9 s (DBM Era variable); subsequent lift-offs 67 s after each landing (wiki, WT) / 54.3–70.8 s (DBM). Knocks back nearby players (wiki). No more air phases once he is at or below 10% HP (wiki, DBM). Duration ≈28.5 s from lift-off to landing (DBM).

### Icebolt
- Name: Icebolt (player debuff 28522; immunity aura 31800)
- Type: targeted stun (ice block) + splash
- Target rule: 5 random players per air phase, one at a time (wiki, Wowhead, WT); each hits the target and everyone within 10 yd.
- Damage: 2,625–3,375 unresistable Frost (wiki; Wowhead 2,624) to the target and the 10 yd splash.
- Effect: the target is frozen in an ice block that blocks line of sight; immune to all damage (31800 immunity, 27 s; WT "25 s"); freed by Frost Breath (which does not hurt them — Wowhead).
- Telegraph: Sapphiron in the air turning to a target; DBM target count.

### Frost Breath
- Name: Frost Breath (28524)
- Type: AoE (room) one-shot with LoS check
- Cast time: 7 s (cast bar) — a slow frost bomb drops to the room centre (wiki).
- Damage: 75,000 Frost (effect value; Wowhead 74,999; wiki 75,000–125,000) to every player in line of sight of the impact; blocked by standing directly behind an ice-blocked player; despawns the ice blocks afterwards.
- Cadence: once per air phase, after the 5th Icebolt; landing ≈12 s after the cast starts (DBM).
- Telegraph: 7 s cast bar + the falling bomb; move behind a block after the 3rd Icebolt (wiki) and certainly before the bomb lands.

## Adds
- None. Ice blocks (frozen players) are the only "objects"; Blizzards are hazards.

## Positioning and movement
- Tank: single tank; pull him to the centre-ish of the lair facing away from the raid; melee behind/at his flanks but not in the tail cone; no taunt exists if you die (he is taunt-immune — a dead tank means an off-tank must out-threat). Air phase: run out from under him (knockback), spread, then hide behind a block like everyone. Never: turn him into the raid; stand in a Blizzard; stack with others during the air phase.
- Melee DPS: at his sides behind the forelegs, out of Cleave and Tail Sweep; during the air phase spread 10 yd apart, then behind a block; re-pot GFPP / bandage while hiding (Wowhead).
- Ranged DPS: spread around the room (no two players within 10 yd) so Blizzards and Icebolt splashes hit one person; decurse-assigned mages near their groups; in the air hold position until the 3rd Icebolt, then move behind the nearest block (within LoS shadow of it); can keep casting from beside the block until the bomb is about to land (Wowhead). Frost spells are useless.
- Healers: spread with their assigned groups (healing assignments by group are mandatory — Wowhead); druids decurse; avoid heavy FR gear that kills throughput (wiki); same ice-block rules.
- Whole raid: spread formation on the ground like C'Thun; converge only behind ice blocks during Frost Breath; the five blocks are random, so plan "nearest block" rules; avoid blocks with a Blizzard on them.

## What each role must do and must not do
- Tank:
  1. Face him away from the raid at all times (Cleave/Tail Sweep); hold position so Blizzards can be dodged by the raid.
  2. Pre-pot GFPP; expect 10,680–12,258 base melee plus Frost Aura.
  3. In the air phase, be a normal raider: spread, then hide.
- DPS:
  1. Maximise ground uptime; non-Frost damage only.
  2. Leave Blizzards instantly (3–4k per 2 s + slow).
  3. Air: spread 10 yd; after Icebolt #3 move behind a block; be fully hidden before Frost Breath lands (7 s cast).
  4. Mages: Remove Lesser Curse on assignment every Life Drain (~every 24 s, 10 targets).
  5. Nothing to interrupt.
- Healer:
  1. Group assignments + MT healers; Frost Aura is ~600 to 40 players every 2 s = 12k raid damage per 2 s, continuous.
  2. Druids decurse Life Drain immediately (each tick heals him 3.5–4.5k and hurts the target 1.75–2.25k).
  3. Pre-top everyone before lift-off (Icebolt 2,625–3,375 + splash) and after landing.
  4. Use GFPP on cooldown yourself; don't over-gear FR at the cost of healing.

## Timeline of a typical pull
- t=-2:00: GFPP (and GSPP) pre-pots so the potion CD is back at the pull.
- t=0: Pull; spread formation; Frost Aura begins (600 Frost / 2 s to all).
- t≈21–27 s: Life Drain #1 on 10 players → decurse; Blizzards start roaming.
- t≈45 s (31–46 s DBM): lift-off, knockback. Icebolts ×5 (one every few seconds) → 5 ice blocks. After the 5th: Frost Breath 7 s cast → bomb lands (75k to anyone not behind a block), blocks despawn. Landing ≈28.5 s after lift-off (t≈74 s).
- t≈74–141 s: ground phase 2 (≈67 s; DBM 54–71 s): Life Drain every ~24 s, Blizzards. t≈141 s: air phase 2 … repeat.
- ≤10% HP: no more air phases; burn.
- t=15:00: Berserk (Frost Aura ~3,600/tick) → wipe. Realistic kills: 6–10 minutes.

## Open questions
- Boss HP: 3,164,450 (wiki) vs 2,600,000 (classicdb.ch).
- Frost Aura tick: 600 every 2 s (wiki, Wowhead 599) vs spell data "600 a second" (1 s dummy tick, 601).
- Air-phase timing: first at 45 s (wiki, WT) vs 31.2–45.9 s (DBM Era); later 67 s (wiki, WT) vs 54.3–70.8 s after landing (DBM); landing 28.5 s after lift-off (DBM only).
- Icebolt freeze duration: 27 s immunity (spell 31800) vs 25 s (WT); interval between the 5 Icebolts not given (≈3–4 s implied by a ~28 s air phase).
- Frost Breath damage: 75,000 (spell, Wowhead 74,999) vs 75,000–125,000 (wiki).
- Chill damage: 3,063–3,907 per 2 s (wiki) vs ~2,000 per second (Wowhead); Blizzard spawn cadence unknown.
- Life Drain cadence: 24 s (wiki) vs 21.1–27.5 s (DBM).
- Cleave target count: 3 (spell 15584) vs 10 (wiki).
- Berserk effect: "+500% Frost Aura damage" (wiki) vs "~3,600 per tick" (Wowhead) — consistent (600 × 6).
