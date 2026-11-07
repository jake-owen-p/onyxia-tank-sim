# Battleguard Sartura (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Battleguard_Sartura — ability list (Frenzy +60% 2 min, Sundering Cleave +25 phys taken, Whirlwind 26083/26084 15 s), Enrage at 20% (+124 dmg, +60% speed), Hard Enrage 10 min (10,000–15,000 dmg, +150% speed), guards' Whirlwind 1,000–1,200 on tanks / 2,500–3,000 on cloth, knockback into the tunnel danger, 5 s aggro reset, stun rules, positioning
- https://www.wowhead.com/classic/npc=15516/battleguard-sartura (via r.jina.ai) — HP 4,330,300 ("Seasonal 40 Player"), Whirlwind 26084, guards' Knockback 26027
- https://www.wowhead.com/classic/npc=15984/sarturas-royal-guard (via r.jina.ai) — level 60–61 elite, HP 707,400, Knockback 26027, Summon Player 21727, Whirlwind 26038
- https://www.wowhead.com/classic/spell=26083/whirlwind (via r.jina.ai) — 15 s aura, normal damage +50 each 1 s tick, immune to stun while active
- https://www.wowhead.com/classic/spell=26084/whirlwind (via r.jina.ai) — weapon damage (base 680) in 10 yd radius
- https://www.wowhead.com/classic/spell=25174/sundering-cleave (via r.jina.ai) — weapon +30, up to 3 targets, −240 armor for 30 s
- https://www.wowhead.com/classic/spell=8269/frenzy (via r.jina.ai) — +60% attack speed, +50 physical damage, 2 min, used by Sartura
- https://www.wowhead.com/classic/spell=26027/knockback (via r.jina.ai) — knockback 250, 10 yd radius, used by Royal Guards
- https://www.wowhead.com/classic/guide/battleguard-sartura-temple-of-ahnqiraj-strategy (via r.jina.ai) — aggro reset charge for 5 s, Whirlwind then Sundering Cleave (stacks to 3), boss Whirlwind ≈2x guards, body-pull from range, 20% enrage, 10 min hard enrage
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — Whirlwind 10 yd, boss up to 3,500 / guards up to 1,500, hunter Distracting Shot pull, all four stunnable
- https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-sartura.amp — vanilla-era numbers (Whirlwind 400–1,000), paladin stun rotation, warriors kite guards
- https://us.millenium.gg/guide/7179.html?page=3 — taunt rotation to cover 5 s threat reset, square/triangle of tanks around her after adds die
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Sartura.lua — Whirlwind 15 s bar on aura 26083, Berserk timer 600 s, Frenzy 8269 flagged at 25%, 3 adds
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/Sartura.lua — "run" warning on Whirlwind, enrage pre-warning at 35%, GTFO on 26084

## Overview
- Level ?? boss, Humanoid. HP 4,330,300 (Wowhead, "Seasonal 40 Player"); wiki calls her HP "extremely low" relative to the raid's DPS once the guards are dead. Second required boss (first room of the Hive Undergrounds, after the Skeram stairs; the tunnel to Fankriss leaves from this room).
- Phases: one phase plus two thresholds: Enrage/Frenzy at ~20% HP (wiki, Wowhead guide; BigWigs labels it 25%), and a hard Berserk 10 min after pull (BW 600 s) that effectively wipes the raid.
- Adds: 3 Sartura's Royal Guards pulled with her.
- Raid-size assumptions: 40-man Classic Era.

## Abilities

### Whirlwind (Sartura)
- Type: AoE around herself while she moves
- Target rule: everyone within 10 yd (spell 26084 radius) while the 15 s aura (26083) is up. She moves erratically while spinning.
- Cast time: instant. Not interruptible. Immune to stun for the 15 s.
- Cadence: duration 15 s (spell data, BW bar). Interval between Whirlwinds: unknown (no boss-mod CD timer; DBM throttles announcements at 4 s). Sundering Cleave follows immediately after each Whirlwind (Wowhead guide).
- Damage: weapon damage +50 per 1 s tick (tooltip); 26084 base value 680. Guides: "up to 3,500" per hit (Tavern), "about twice as hard as her Royal Guards" (Wowhead). Physical, mitigated by armor.
- Debuff: none. Movement: none (but she repositions while spinning).
- Telegraph: spin animation; BW/DBM announce + 15 s bar; DBM "RUN" warning.

### Sundering Cleave
- Type: melee cone / chain
- Target rule: current target and its nearest allies, up to 3 targets.
- Cast time: on next swing. Cadence: right after Whirlwind (Wowhead guide); otherwise unknown.
- Damage: weapon damage +30, Physical. Debuff: −240 armor for 30 s (spell data); Wowhead guide: stacks up to 3; wiki phrases it as "+25 physical damage taken". Not dispellable.
- Telegraph: none.

### Aggro reset ("charge")
- Type: threat wipe (temporary)
- Rule: Sartura (and each guard) periodically drops threat and runs at a random raid member for 5 s, then returns to the original threat list (wiki, Wowhead guide). Cadence unknown.
- Counter: Taunt (tanks rotate taunt; Millenium: Taunt → Mocking Blow → Taunt) or stun (Kidney Shot, Hammer of Justice, Concussion Blow) when she is not spinning.

### Enrage / Frenzy (20%)
- Type: enrage. Spell 8269: +60% attack speed, +50 Physical damage, lasts 2 min (wiki quotes +124 damage). Triggers at 20% HP (wiki, Wowhead guide); BW's label says 25%; DBM pre-warns at 35%.

### Hard Enrage (10 min)
- Type: enrage/berserk. 10 min after pull (BW Berserk(600)). Wiki: "10,000–15,000 damage to players and +150% attack speed" — a wipe.

### Royal Guard — Whirlwind (26038)
- Same shape as the boss's: spins, moves fast, ~1,000–1,200 on tanks, 2,500–3,000 on cloth (wiki); "up to 1,500" (Tavern). Immune to stun while spinning; the stun does land but does not stop the spin.

### Royal Guard — Knockback (26027)
- Type: knockback. 10 yd radius, knockback value 250. Being punted toward the Fankriss tunnel can pull the patrols there (wiki).

### Royal Guard — Summon Player (21727)
- Pulls a player to the guard. No numbers found.

## Adds
- Sartura's Royal Guard ×3: level 60–61 elite, HP 707,400 each (Wowhead Seasonal 40). Pulled with Sartura. Whirlwind, Knockback, Summon Player, same 5 s aggro-reset behaviour. Wiki: "no aggro list" in the sense that DPS can hit them freely while they spin. One tank each (two if possible), dragged to the room's edges away from Sartura. Killed first; nothing despawns.

## Positioning and movement
- Tank: body-pull from range (long aggro radius; hunter Distracting Shot or a warrior leading). MT drags Sartura to the back of the room; guard tanks take their guard to separate wall spots with their backs to the wall (Knockback) and well away from the tunnel entrance to Fankriss. After the guards die, 3–4 tanks stand in a triangle/square around Sartura and rotate Taunt to cover the 5 s resets.
- Melee DPS: on the current kill target; step out when that target starts spinning (10 yd) and come back after 15 s. Rogues save Kidney Shot for aggro resets (on a non-spinning target).
- Ranged DPS: far from the Whirlwind paths (they wander); keep the boss and guards between walls and the raid, not through the raid. Watch guards' random paths and move if one heads your way.
- Healers: 2–3 per tank on Sartura, one per guard tank; expect raid-wide spike healing while guards spin through people; save mana for the 20% Enrage.
- Whole raid: no safe spot; distance from spinning mobs is the only mitigation. Nobody near the Fankriss tunnel.

## What each role must do and must not do
- Tank:
  1. Pull to the back; guards to the edges; back to the wall.
  2. Taunt/stun immediately on each aggro reset so she does not reach the raid.
  3. Do not try to stun during a Whirlwind (immune); do stun between spins.
  4. Keep every mob out of the Fankriss tunnel.
  5. After the adds die, form the taunt rotation around her and save defensive cooldowns for 20%.
- DPS:
  1. Kill order: Royal Guards first (all three), then Sartura.
  2. Melee leave a spinning target; return when the 15 s bar ends.
  3. Rogues/paladins/warriors: stun-lock Sartura and stun guards on resets; Kidney Shot on resets.
  4. Hold cooldowns for the 20% Enrage; the whole fight is a 10 min DPS check.
- Healer:
  1. Nothing to dispel (Sundering Cleave armor debuff is undispellable).
  2. Spike damage: cloth hit by a 2,500–3,000 Whirlwind tick, tanks with 3 Sundering stacks, MT during Enrage.
  3. Pre-heal the MT at 20%; stay out of spin paths.

## Timeline of a typical pull
- t=0: body pull; three guards peel to their tanks; Sartura to the back.
- First ~minute: guards and Sartura begin Whirlwinds (15 s each, unknown interval) and 5 s aggro-reset charges; Sundering Cleave stacks on tanks after each Whirlwind.
- Guards die one by one (first 3–5 min); freed tanks join the Sartura ring.
- Sartura to 20%: Enrage (+60% speed) for 2 min; cooldowns.
- t=10:00: hard enrage — wipe if she is alive.

## Open questions
- Whirlwind damage: weapon +50/tick (spell) vs up to 3,500 (Tavern) vs 400–1,000 (TenTonHammer 2006). Interval between Whirlwinds: not found in any source or boss mod.
- Enrage threshold: 20% (wiki, Wowhead guide) vs 25% (BigWigs option label) vs DBM pre-warn 35%.
- Sundering Cleave: −240 armor 30 s (spell) vs "+25 physical damage taken" (wiki); stack cap 3 per Wowhead guide only.
- Aggro-reset cadence: unknown; both guides give the 5 s duration only.
- Guard count: 3 everywhere except TenTonHammer (4, 2006).
- Boss HP labelled "Seasonal 40 Player" on Wowhead.
