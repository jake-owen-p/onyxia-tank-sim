# Twin Emperors: Vek'lor and Vek'nilash (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Twin_Emperors — shared HP (vanilla ~1.6M/1M), 15 min Berserk, Heal Brother within 60 yd for 30,000 per tick, Twin Teleport every 30–40 s with ~2 s root and aggro wipe, Vek'nilash immune to all magic except Holy / Vek'lor immune to physical, Uppercut, Unbalancing Strike 350% / −100 defense 6 s, Mutate Bug every 10–15 s within 25 yd, Shadow Bolt 3,000–4,000, Blizzard 1,500/tick only when players within 40 yd, Arcane Burst 4,000–4,950 knockback + 70% slow, Explode Bug every 7–10 s within 30 yd for 2,813–3,187 fire after 3 s, mutated bug stats, team composition and tanking rules
- https://www.wowhead.com/classic/npc=15276/emperor-veklor and /npc=15275/emperor-veknilash (via r.jina.ai) — HP 6,995,100 each ("Seasonal 40 Player"), Vek'lor mana 471,600, IDs Heal Brother 7393, Shadow Bolt 26006, Unbalancing Strike 26613, Mutate Bug 802, Twin Teleport 800, "every 30 to 40 seconds", warlock tank 8,000+ HP
- https://www.wowhead.com/classic/spell=7393/heal-brother (via r.jina.ai) — heals 30,000, instant, 60 yd range
- https://www.wowhead.com/classic/spell=800/twin-teleport (via r.jina.ai) — instant, 2 s cooldown, 100 yd dummy + stun aura, 250 ms duration
- https://www.wowhead.com/classic/spell=26613/unbalancing-strike (via r.jina.ai) — 350% weapon damage, −100 Defense for 6 s
- https://www.wowhead.com/classic/spell=26007/uppercut (via r.jina.ai) — weapon +950–1,050, knockback, 10 yd, Vek'nilash
- https://www.wowhead.com/classic/spell=802/mutate-bug (via r.jina.ai) — 30 yd range, 25 yd radius, +300% HP, +1,800% damage, 400% size, 4 min
- https://www.wowhead.com/classic/spell=804/explode-bug (via r.jina.ai) — 30 yd range, bug grows 200% and is rooted, 4 s aura triggering Explode (26059) every 3 s, Vek'lor
- https://www.wowhead.com/classic/spell=26006/shadow-bolt (via r.jina.ai) — 3,600 Shadow base, 1 s cast, 45 yd
- https://www.wowhead.com/classic/spell=26607/blizzard (via r.jina.ai) — 1,388–1,612 Frost per 2 s for 10 s, 10 yd radius, 45 yd range, −30% speed
- https://www.wowhead.com/classic/spell=568/arcane-burst (via r.jina.ai) — 4,050 Arcane, 10 yd radius, knockback, −70% speed 8 s, Vek'lor
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — swap ~35 s, 2 warlock tanks 150+ SR / ~8,000 HP (or 200+), Mutate 18x damage, Explode ~3,000 in 10 yd, both ~every 10 s, five-group split
- https://www.warcrafttavern.com/wow-classic/guides/warlock-twin-emperor-tanking-wow-classic-season-of-mastery — SR cap 300 (~100 from buffs, ~200 gear), Felhunter +60, warlock stands right under the melee boss before the swap then kites to ~25 yd and spams Searing Pain, Shadowburn/Corruption/Shadow Ward routine
- https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-twin-emps — Unbalancing Strike 4,000–8,000, Uppercut 2,000–3,500, Shadow Bolt 3,000–4,000, Blizzard 1,500–2,000/s, Arcane Burst ~3,000, Mutate "20ish s", Explode "10ish s", teleport "30ish s", ranged on the stairs / melee on the floor, stop DPS before transitions
- https://us.millenium.gg/guide/7179.html?page=6 — Heal Brother "30,000 HP per second", teleport 30–40 s, bug team 3 mages + 2 warriors + healer, 15 min enrage one-shots
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Twins.lua — Berserk 900 s, Twin Teleport CD 30 s (first 30), Explode Bug near-warning within 20 yd, Blizzard 26607
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/TwinEmps.lua — Teleport 29.1–40.5 s (first 30.8), Explode Bug 4.5–32.3 s, Mutate Bug 10.9–27.1 s, Unbalancing Strike 9.7–37.3 s (first 11.2–43.8), Berserk 900 s

## Overview
- Two level ?? bosses sharing one health pool by percentage: Emperor Vek'nilash (melee, immune to all magic except Holy) and Emperor Vek'lor (caster with 471,600 mana, immune to physical damage). HP 6,995,100 each (Wowhead, "Seasonal 40 Player"; vanilla wiki ~1.6M Vek'nilash / ~1M Vek'lor — damage on either moves the shared percentage). Fifth required boss, in a large hall with raised sides/stairs and neutral Qiraji Scarabs/Scorpions crawling around.
- Phases: none by HP; the fight is a repeating ~30–40 s cycle ended by Twin Teleport, which swaps the brothers' positions and wipes threat. Berserk after 15 minutes (BW/DBM 900 s): damage goes up dramatically and the raid dies.
- Raid-size assumptions: 40-man Classic Era. SoD uses teleport spell 1217333 with a fixed 29.2/35.5 s timer — not applicable.

## Abilities

### Twin Teleport (shared)
- Type: teleport + threat wipe
- Rule: both brothers swap positions. Cadence: every 30–40 s (Wowhead NPC, wiki); DBM 29.1–40.5 s with the first at ~30.8 s; BW uses a flat 30 s. After the swap each Emperor is rooted ~2 s (wiki) and then attacks the closest player, who gains large threat when the root ends.
- Telegraph: blue glow at their feet (wiki); boss-mod bar.

### Heal Brother (shared)
- Type: targeted heal. Cast on each other whenever they are within 60 yd (spell range). Heals 30,000 per cast, instant, spammed ("per tick"/"per second" per guides). Counter: keep them >60 yd apart at all times.

### Vek'nilash — Unbalancing Strike
- Type: melee on current tank. 350% weapon damage (TenTonHammer: 4,000–8,000) and −100 Defense skill for 6 s. Cadence 9.7–37.3 s (DBM; first 11.2–43.8 s). Tank should be topped to full immediately; warriors should swap/absorb via cooldowns (DBM "defensive" warning). Demoralizing Shout reduces it (scales with AP).

### Vek'nilash — Uppercut
- Type: knockback. One random target in melee range (10 yd): weapon +950–1,050 (TTH 2,000–3,500) and a knockback. Tank stands with back to a wall so he is not punted out of range.

### Vek'nilash — Mutate Bug
- Type: other (empower add). Picks a neutral bug within 30 yd (25 yd radius on effects): +300% HP, +1,800% damage, 400% size, 4 min. Cadence 10.9–27.1 s (DBM; wiki 10–15 s; Tavern ~10 s). A mutated bug hits for 1,000+ and must be picked up by the bug team.

### Vek'lor — Shadow Bolt
- Type: targeted. Spammed on his current (warlock) tank: 3,600 base Shadow (3,000–4,000), 1 s cast, 45 yd range. Partially resistible — the whole fight for the warlock tank is Shadow resistance (cap 300) + Shadow Ward.

### Vek'lor — Blizzard
- Type: ground hazard. 1,388–1,612 Frost per 2 s for 10 s in a 10 yd radius, −30% movement, cast up to 45 yd. Wiki: only cast when multiple players are within 40 yd of Vek'lor. Run out immediately.

### Vek'lor — Arcane Burst
- Type: AoE knockback (point-blank). Triggered when a player is in melee range of Vek'lor: 4,050 Arcane (wiki 4,000–4,950) to everyone within 10 yd, knockback, −70% movement for 8 s. Nobody but the warlock tank may be near him, and the warlock keeps distance (~25 yd per the Tavern lock guide).

### Vek'lor — Explode Bug
- Type: other (bomb add). A neutral bug within 30 yd grows 200%, is rooted, and after ~3–4 s casts Explode (26059): 2,813–3,187 Fire to everyone nearby (Tavern ~3,000 in 10 yd). Cadence 4.5–32.3 s (DBM; wiki 7–10 s). BW warns if you are within 20 yd of the marked bug.

### Berserk (15 min)
- Type: enrage. Both brothers' damage rises dramatically; wiki: can still be killed at very low HP.

## Adds
- Qiraji Scarabs and Qiraji Scorpions: dozens, neutral, respawning constantly. Become hostile when AoE'd or mutated. A mutated bug (4 min, +1,800% damage, 300% HP) is tanked and killed by the bug team (3 mages + 2 warriors + 1 healer per wiki/Millenium). Exploding bugs are run away from, not killed. Virulent Poison: stackable DoT proc on their melee (wiki).

## Positioning and movement
- Tank: two tank teams, one per side of the hall, each with 1 warrior + 1 tanking warlock (+ a second warlock for Blood Pact). The physical Emperor is tanked against a wall by the warrior (back to the wall vs Uppercut); the magical Emperor by the warlock, who stands ~25 yd off and keeps retreating if Vek'lor approaches (Arcane Burst). The two bosses must be >60 yd apart. On each teleport the warrior must be the closest player to the arriving Vek'nilash; the warlock Shadowburns/Searing Pains the arriving Vek'lor (Curse of Doom 10–15 s after a swap also pulls aggro hard).
- Melee DPS (rogues, warriors, hunters' melee, physical hunters): only ever on Vek'nilash; follow him across the room after each teleport; leave him ~5 s before the next teleport so the warrior gets first threat ("switch early").
- Ranged DPS (warlocks, mages): only on Vek'lor; stand >10 yd from him (Arcane Burst) and on the stairs/out of Blizzard spots; swap sides after each teleport. Mages in the bug team watch for mutated bugs instead.
- Healers: main healer groups in the middle, out of the 40 yd Blizzard trigger radius from Vek'lor; one "outpost" healer per side ~10 yd from the warlock tank for the Vek'lor phase; three priests chain-casting on the warrior during the Vek'nilash phase, pre-casting before Unbalancing Strike lands.
- Whole raid: never AoE (wakes neutral bugs); run from any 200%-size bug; nobody within 10 yd of Vek'lor; sides swap every 30–40 s.

## What each role must do and must not do
- Tank:
  1. Warrior: wall at your back; be the closest player to Vek'nilash as the teleport lands; Demoralizing Shout; cooldowns on Unbalancing Strike.
  2. Warlock: Shadow Ward before the teleport warning; Shadowburn/Searing Pain spam immediately after the swap; kite to ~25 yd; Life Tap between cycles; 300 SR target, 8,000+ HP.
  3. Keep the brothers >60 yd apart; if they close, the healing out-paces the raid.
  4. Never stand in melee of Vek'lor as a warrior (Arcane Burst) unless deliberately wall-tanking him in full HP gear (wiki alternative).
- DPS:
  1. No DPS before the first teleport (wiki) / wait until tanks have threat after every swap.
  2. Physical only on Vek'nilash, magic only on Vek'lor (Holy works on Vek'nilash).
  3. Stop 5 s before each teleport; cross the room; re-engage only after the tank has aggro.
  4. Bug team: kill mutated bugs immediately; nobody AoEs.
  5. Run from exploding (enlarged) bugs — 3,000 Fire in ~10 yd.
- Healer:
  1. Nothing to dispel on players (Blizzard/Burst slows are not listed as dispellable).
  2. Spike damage: warrior on Unbalancing Strike (4–8k, −100 defense for 6 s → crushing risk), warlock on back-to-back Shadow Bolts (two can kill an under-resisted lock), anyone near a bug explosion.
  3. Pre-heal before Unbalancing Strike; move out of Blizzard instantly; Innervate/Rebirth coordination for tanks.

## Timeline of a typical pull
- t=0: tanks pull their Emperor to opposite walls; raid waits; first Unbalancing Strike within ~11–44 s; first Mutate/Explode bugs within ~5–30 s.
- t≈30–40 s: first Twin Teleport — threat wiped, 2 s root; warrior/warlock grab; DPS begins after this (or ~20 s of DPS before per TTH, then stop).
- Every 30–40 s: teleport; melee/casters cross; 5 s DPS stop before each.
- Continuous: Shadow Bolt on the warlock every ~1.5 s; Blizzard if people cluster within 40 yd of Vek'lor; Unbalancing Strike every ~10–37 s; a bug mutated every ~11–27 s and exploded every ~5–32 s.
- 15:00: Berserk — wipe.

## Open questions
- Teleport interval: flat 30 s (BigWigs, Tavern lock guide) vs 29.1–40.5 s (DBM) vs ~35 s (Tavern raid guide) vs 30–40 s (wiki, Wowhead).
- Unbalancing Strike damage: "350% weapon" (spell) vs 4,000–8,000 (TTH); weakness called "−100 defense" (spell/wiki) vs "6-second weakness" (Tavern).
- Explode Bug delay: 3 s (wiki) vs 4 s aura with a 3 s trigger (spell data); damage 2,813–3,187 (wiki) vs ~3,000 in 10 yd (Tavern).
- Mutate Bug cadence: 10–15 s (wiki) vs 10.9–27.1 s (DBM) vs "20ish" (TTH); Explode cadence 7–10 s (wiki) vs 4.5–32.3 s (DBM).
- HP: 6,995,100 each ("Seasonal 40 Player") vs wiki vanilla 1.6M/1M; whether the Era pool is one shared number or two synced bars is not stated.
- Shadow resistance requirement: 150+ (Tavern raid guide) vs 200+ (same page, Twins section) vs 300 cap (Tavern lock guide).
- Post-teleport root "about 2 seconds" (wiki) vs spell aura duration 250 ms.
