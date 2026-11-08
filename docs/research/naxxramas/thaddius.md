# Thaddius (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Thaddius_(Classic) — Classic 40-man page: Feugen/Stalagg 499,650 HP each; both must die within 5 s or the first resurrects; Magnetic Pull swaps tanks and wipes threat; Warstomp ~1,500 in 15 yd + knockback; Tesla Coil Shock 4,375–5,625 Nature per second to ~5 targets if a wight leaves range; Static Field every 6 s burns 500 mana (30 yd) + Shadow damage equal; Power Surge +200% attack speed 10 s; 15 s to reach the platform; Thaddius ~6.657M HP; Chain Lightning 2,000 Nature arcing up to 15 targets every 5–10 s; Polarity Shift every 30 s, 3 s cast, charges 60 s, +10% damage per nearby same charge, 2,000 Nature every 5 s to nearby opposite charge; Ball Lightning 7,000–9,000 (1 s cast) when nobody in melee; Berserk at 5 min (+150% speed, +500% damage); positioning (Negative left, Positive right, 5 s to move); dying removes the charge; tank hits ~2,000 / 3,300 crush; quotes.
- https://www.wowhead.com/classic/guide/thaddius-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: Magnetic Pull about every 20 s swaps both tanks and wipes threat (backup tanks on each platform); War Stomp ~700 + light knockback; Tesla Chain when a wight leaves its coil; Death Timer ~5 s; Static Field forces melee onto Feugen, healers at max range; Polarity Shift every 30 s, 2,000 Nature between opposite charges, damage boost for same charges; Negative left / Positive right; Ball Lightning if nobody in melee; Enrage 5 min after Thaddius activates.
- https://www.wowhead.com/classic/spell=28089/polarity-shift — Polarity Shift: 3 s cast, 100 yd, scripted.
- https://www.wowhead.com/classic/spell=28167/chain-lightning — Chain Lightning: instant, unlimited range, 1,850 Nature (effect value), arcs to up to 15 targets with increasing damage.
- https://www.wowhead.com/classic/spell=28299/ball-lightning — Ball Lightning: 1 s cast, unlimited range, 7,000 Nature.
- https://www.wowhead.com/classic/spell=28337/magnetic-pull — Magnetic Pull: instant, unlimited range, Pull effect.
- https://www.wowhead.com/classic/spell=28125/war-stomp — War Stomp: instant, 1,313 Physical in 15 yd + knockback.
- https://www.wowhead.com/classic/spell=28134/power-surge — Power Surge: +200% attack speed, 10 s.
- https://www.wowhead.com/classic/spell=28135/static-field — Static Field: instant, Power Burn 500, 30 yd, player-only.
- https://www.wowhead.com/classic/spell=28108/tesla-chain — Tesla Chain: scripted trigger (the coil's Shock is a separate NPC spell).
- https://www.wowhead.com/classic/spell=19953/enrage — generic Enrage linked by the guide (not Thaddius's Berserk; see Open questions).
- https://classicdb.ch/?npc=15928 / 15929 / 15930 / 16218 — Thaddius 6,540,378 HP (melee 8,475–9,727); Stalagg 495,236 HP; Feugen 490,291 HP (melee 9,533–10,942 each); Tesla Coil 17,010 HP, armor 9,729.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/ConstructQuarter/Thaddius.lua — DBM Classic: "Throw"/Magnetic Pull (28338/28339) every 21 s, first 21 s; Phase 2 starts 11.3–16.3 s after both wights die; Berserk 300 s from Phase 2; first Polarity Shift 11.3 s into Phase 2, then every 25.9–35.7 s, 3 s cast; charge debuffs 28059 / 28084 (60 s); emotes "%s dies." / "%s is jolted back to life!"; P2 yells "Eat... your... bones...", "Break... you!!", "Kill...".
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: ranged on Stalagg, melee on Feugen; hold the wights by the coils; tank swap after 20 s; Stalagg hits always crushing under Power Surge; jump down near the edge (Swiftness Potion); Positive west / Negative east; 5 s grace period after a shift; Thaddius does little damage, healers can DPS; 5-minute enrage.

## Overview
- Phase 1: Stalagg (495,236 HP) and Feugen (490,291 HP), level ?? elites on two platforms, each tethered to a Tesla Coil (17,010 HP). Phase 2: Thaddius, level ?? boss, Undead (flesh titan), HP 6,540,378 (classicdb) / ~6.657M (wiki) — the largest HP pool in Classic. Hard enrage 5:00 after Thaddius activates (DBM 300 s) → ≈21,800 raid DPS needed; Polarity stacking makes this possible. Fourth and last boss of the Abomination Wing, required.
- Phases: Phase 1 ends when both wights die within 5 s of each other; 11–16 s later (wiki: 15 s to reach the platform) the coils overload and Thaddius activates. Phase 2: Polarity Shift every ~30 s until death.
- Raid-size assumptions: 40-man Classic Era; Phase 1 needs 2 tanks per platform (Magnetic Pull swaps), ranged on Stalagg, melee on Feugen (Static Field), healers split; Phase 2 one tank + whole raid split by charge.

## Abilities

### Phase 1 — Magnetic Pull ("Throw")
- Name: Magnetic Pull (28337; DBM tracks the paired casts 28338/28339)
- Type: aggro pull / tank swap
- Target rule: each wight pulls the other wight's current tank onto its own platform; the pulled player becomes the puller's primary target and the original wight's threat on him is wiped (wiki).
- Cast time: instant.
- Cadence: every 21 s, first 21 s after the pull (DBM); "about every 20 s" (Wowhead, WT).
- Effect: both tanks swap platforms; threat on both wights reset to the swapped-in tanks → a backup tank on each platform must taunt and hold until the swapped tank rebuilds; DPS eases off for a moment (WT).
- Telegraph: DBM 21 s timer; the tanks fly across.

### Phase 1 — War Stomp
- Name: War Stomp (28125) — both wights
- Type: AoE (15 yd) + knockback
- Damage: 1,313 Physical (effect value; wiki ~1,500; Wowhead ~700) to everyone within 15 yd, knockback (value 57) — do not stand at the platform edge (Wowhead).
- Cadence: unknown.

### Phase 1 — Tesla Coil / Tesla Chain
- Name: Tesla Chain (28108) → the coil's Shock
- Trigger: a wight is moved out of range of its coil; the chain breaks and the coil shocks the raid: 4,375–5,625 Nature every second to ~5 targets, unlimited range (wiki). Keep each wight on its platform next to the coil.

### Phase 1 — Static Field (Feugen)
- Name: Static Field (28135)
- Type: AoE mana burn
- Target rule: all players within 30 yd of Feugen.
- Cadence: every 6 s (wiki).
- Effect: burns 500 mana and deals Shadow damage equal to the mana burned (wiki) → melee on Feugen, healers at max range.

### Phase 1 — Power Surge (Stalagg)
- Name: Power Surge (28134)
- Effect: +200% attack speed for 10 s (self); WT: his hits are crushing blows during it → tank cooldowns, overheal.
- Cadence: unknown.

### Phase 1 — Death Timer
- Both wights must die within ~5 s of each other; otherwise the dead one is "jolted back to life" at full HP (wiki, Wowhead, DBM emote). Then 15 s (wiki) / 11.3–16.3 s (DBM) until Thaddius activates — the raid jumps from the platforms down to Thaddius's central platform (jump from the edge; Swiftness Potion for safety — WT; missing the jump = no charge, wait on the platform away from others — wiki).

### Phase 2 — Polarity Shift
- Name: Polarity Shift (28089); charges Positive / Negative (DBM 28084 / 28059)
- Type: debuff (raid-wide), positioning mechanic
- Target rule: every player within 100 yd gets a Positive or Negative Charge at random; after the first shift each later shift changes only about half the raid (random) (wiki).
- Cast time: 3 s (cast bar); not interruptible.
- Cadence: first shift 11.3 s after Thaddius activates, then every 25.9–35.7 s (DBM); guides "every 30 s".
- Effect: charge lasts 60 s (refreshed each shift). Same-charge players within range of each other each gain +10% damage per nearby same-charge ally (stacking buff — stack tightly: hunters must stay in range too). Opposite-charge players near each other take 2,000 Nature every 5 s from each other (wiki); 5 s grace to move after a shift (wiki, WT). Dying removes the charge; a battle-rez'd/soulstoned player has no charge and is killed on accepting (wiki) — no rezzes in Phase 2.
- Telegraph: 3 s cast bar + yell "Now you feel pain..."; DBM arrows.

### Phase 2 — Chain Lightning
- Name: Chain Lightning (28167)
- Type: targeted chain
- Damage: 1,850 Nature (effect; wiki 2,000), arcs to up to 15 targets with increasing damage per jump; unlimited range.
- Cadence: every 5–10 s (wiki) / "every 5–8 s" to 15 players (wiki healing note).

### Phase 2 — Ball Lightning
- Name: Ball Lightning (28299)
- Trigger: nobody in melee range of Thaddius. 1 s cast, 7,000 Nature (effect; wiki 7,000–9,000), unlimited range — keep a tank on him at all times (incl. after shifts: run through him, not around).

### Phase 2 — Berserk
- Trigger: 5 min after activation (DBM 300 s). +150% movement speed, +500% Physical damage for 10 min (wiki). Wipe.

## Adds
- Stalagg (15929) and Feugen (15930): see Phase 1; melee 9,533–10,942; killed simultaneously (within 5 s). Tesla Coil (16218): 17,010 HP, not attacked. No adds in Phase 2.

## Positioning and movement
- Tank (Phase 1): one tank + one backup per platform; hold the wight beside its coil, never off the platform (Tesla Chain); Stalagg tank uses cooldowns during Power Surge; after each Magnetic Pull (every ~21 s) the backup taunts the arriving wight while the thrown tank rebuilds; healers for Feugen's side at max range (Static Field 30 yd).
- Tank (Phase 2): pick Thaddius up on the central platform; he can be taunted (wiki); stay stacked with your own charge group (a tank alone off his stack still has aggro but loses the damage buff; if your charge flips, run through him to the other side). Bear tanks gain from the stacking buff; warrior threat is shaky vs 10-stacked DPS → taunt as needed (wiki). Never: leave melee range (Ball Lightning 7k+).
- Melee DPS: Phase 1 on Feugen (Static Field only matters for mana users). Phase 2: stacked with your charge group at Thaddius's side — Negative to his left, Positive to his right (facing him as pulled; WT uses west/east); on a flip run straight through the boss (shortest path, 5 s grace).
- Ranged DPS: Phase 1 on Stalagg at range. Phase 2: in the same two stacks (hunters in range of their group to collect +10% stacks).
- Healers: Phase 1 split evenly; Feugen healers at 30+ yd. Phase 2: 3–4 on the tank (he hits lightly: ~2,000 normal / 3,300 crush), the rest raid-healing Chain Lightning (1,850–2,000+ on 15 players every 5–10 s) and polarity mistakes; healers also stack by charge and may DPS (WT).
- Whole raid: two platforms (Phase 1) → jump onto the central platform within ~15 s → two charge camps left/right of Thaddius. Players without a charge wait alone on the platform until the next shift (wiki). Greater Nature Protection Potion at Phase 2 start (Wowhead).

## What each role must do and must not do
- Tank:
  1. P1: hold your wight at the coil; backups ready for every ~21 s swap; use cooldowns under Power Surge (Stalagg).
  2. Call the DPS balance so both die within 5 s.
  3. P2: grab Thaddius immediately after the jump; never leave melee range; run through him on a flip.
- DPS:
  1. P1: ranged on Stalagg, melee on Feugen; slow down on the side that is ahead — equal HP is the kill condition; stop briefly after each Magnetic Pull while the new tank builds threat.
  2. Jump within 15 s of the second death; do not miss the platform.
  3. P2: check your charge after every 3 s Polarity Shift cast; move in 5 s if it changed; stack as tight as possible with your charge (+10% per neighbour); never stand near the opposite charge (2,000 Nature per 5 s to both).
  4. Nothing to interrupt (Polarity Shift is not interruptible); beat the 5-minute Berserk (~6.5M HP).
- Healer:
  1. P1: Feugen healers at max range (Static Field); Stalagg tank overhealed during Power Surge.
  2. P2: raid heals for Chain Lightning every 5–10 s; 3–4 tank healers suffice; stack by charge like everyone.
  3. No battle-rez / soulstone acceptance in P2 (killed on accept, damaging neighbours — wiki).
  4. Nothing to dispel.

## Timeline of a typical pull
- t=0: Pull both wights onto their platforms by the coils.
- t≈21 s: first Magnetic Pull (tanks swap, threat wiped) — then every 21 s; Static Field every 6 s on Feugen's platform; Power Surge/War Stomp periodically.
- Both wights die within 5 s of each other ("Stalagg dies." / "Feugen dies."). Raid jumps down. 11–16 s later Thaddius activates ("Eat... your... bones...").
- P2 t≈11 s: Polarity Shift #1 (3 s cast) → split left/right; then every ~26–36 s (#2 ≈ 40 s, #3 ≈ 70 s …), each flipping ~half the raid.
- Continuous: Chain Lightning every 5–10 s.
- P2 t=5:00: Berserk → wipe. Kill ≈ 6.5M HP in <5 min with the stacking buff.

## Open questions
- Thaddius HP: 6,540,378 (classicdb.ch) vs ~6,657,000 (wiki). Wights: 495,236 / 490,291 (classicdb) vs 499,650 each (wiki).
- Polarity Shift cadence: 30 s (wiki, Wowhead, WT) vs DBM 25.9–35.7 s with the first at 11.3 s into Phase 2.
- Magnetic Pull cadence: 21 s (DBM) vs ~20 s (Wowhead, WT); wiki gives none.
- War Stomp damage: 1,313 (spell) vs ~1,500 (wiki) vs ~700 (Wowhead).
- Chain Lightning: 1,850 (spell) vs 2,000 (wiki); jump count 15 (both).
- Charge damage model: wiki "2,000 Nature every 5 s to nearby allies of the opposite charge" vs Wowhead "deal 2,000 Nature to one another"; the range of "nearby" is not given.
- Phase 2 delay: 15 s (wiki) vs 11.3–16.3 s (DBM).
- Berserk spell ID: Wowhead links generic 19953; wiki describes +150% speed / +500% damage for 10 min (matches 26662-style Berserk).
- Which charge goes left vs right is convention only (wiki/Wowhead: Negative left, Positive right; WT: Positive west, Negative east).
