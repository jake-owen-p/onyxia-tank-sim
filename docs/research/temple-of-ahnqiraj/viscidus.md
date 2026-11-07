# Viscidus (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Viscidus — abilities (melee ~1,000, 50% damage taken, Poison Shock ~1,200 every ~10 s 15 yd, Poison Volley every 10 s ~1,500 + 500/2 s DoT, Toxin clouds every 30–40 s ~1,500/2 s 40% slow), freeze emotes and −15%/−30% speed, "~200 frost attacks" and "~75 melee hits (1.12)" strategy figures, 15 s stage limit, 1–20 globs = 5% each, 10–15k per glob, dies if <5% when shattered, transition aggro quirks, reset if pulled out of room
- https://www.wowhead.com/classic/npc=15299/viscidus (via r.jina.ai) — HP 5,329,600 ("Seasonal 40 Player"), Poison Bolt Volley 25991, "thaw out after 15 seconds if not enough melee attacks", 1–20 globs
- https://www.wowhead.com/classic/npc=15667/glob-of-viscidus (via r.jina.ai) — level 60, HP 24,416, Rejoin Viscidus 25896
- https://www.wowhead.com/classic/spell=25991/poison-bolt-volley (via r.jina.ai) — 1,313 Nature + 413–587 per 2 s for 10 s, Poison dispel, 100 yd radius
- https://www.wowhead.com/classic/spell=25993/poison-shock (via r.jina.ai) — 1,050 Nature, 15 yd radius, instant
- https://www.wowhead.com/classic/spell=25989/toxin (via r.jina.ai) — 1,313–1,687 per 2 s, −40% speed, 5 yd radius, 9 s
- https://www.wowhead.com/classic/guide/viscidus-temple-of-ahnqiraj-strategy (via r.jina.ai) — Toxin every 2 s / 40% slow, freeze emotes at 100 and 150 frost hits, shatter emotes "begins to crack"/"looks ready to shatter"/"explodes" at 33%/66%, globs every 5% in a circle, Sapper strategy, frost weapons/wands, rank-1 Frostbolt, reset by leaving room
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — casters only until frozen, hits not damage, 20 blobs × 10,000 HP, 6% per blob, 6 blobs per phase goal
- https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-viscidus.amp — Poison Shock ~1,500 every ~10 s, Toxin bolt warning, ~20 globs, 5% each
- https://us.millenium.gg/guide/7179.html?page=9 — Poison Bolt Volley every 10 s, Poison Shock ~1,200, Frost Oil, NR gear
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Viscidus.lua — vanilla frost limit 170 hits (SoD 50), melee count to 100, Poison Bolt Volley first 8.8 s then 10 s, frozen bar 15 s, emote strings
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/Viscidus.lua — frost counter shown "/200", Poison Bolt Volley 11.3 s (first 11.3–12.9), rejoin timer 16.5 s, logged emote spacing frozen→crack 5.2 s→shatter 3.7 s, failed-shatter "only 11.7 s?" comment

## Overview
- Level ?? boss, Aberration (ooze). HP 5,329,600 (Wowhead, "Seasonal 40 Player"). Takes 50% reduced damage from everything (wiki). Optional boss, in a side room off the Fankriss area (accessible after Fankriss). Resets to 100% if pulled out of his room. No enrage timer found.
- Phases (cyclic): Phase 1 "poison" (normal fighting; frost hits accumulate) → "frozen solid" (melee hits accumulate, 15 s window) → "explodes" into Globs → Globs crawl to the centre and Rejoin (~16.5 s) → back to Phase 1 at the HP the surviving globs represent. Each glob is 5% of his HP; if he is below 5% when shattered he dies. Expect ~4 freeze cycles (wiki) or 3 (Tavern: 6 globs per cycle).
- Raid-size assumptions: 40-man Classic Era. Retail/5.1 and SoD counts (20 frost / 30 melee; SoD 50 frost) do not apply.

## Abilities

### Poison Bolt Volley
- Type: AoE (raid-wide)
- Target rule: all players, 100 yd radius, ignores line of sight (wiki). Cast only in the poison phase (stops when frozen).
- Cast time: instant. Not interruptible.
- Cadence: BW first at ~8.8 s then every 10 s; DBM 11.3 s (first 11.3–12.9 s); wiki/Wowhead "every 10 seconds".
- Damage: 1,313 Nature direct (wiki ~1,500, resistible) + DoT 413–587 Nature every 2 s for 10 s (wiki: ~500/2 s, "unresistable").
- Debuff: Poison Bolt Volley, 10 s, Poison dispel. Does not spread.
- Telegraph: none; boss-mod timer.

### Poison Shock
- Type: AoE (around boss)
- Target rule: players within 15 yd.
- Cast time: instant. Cadence: ~every 10 s (wiki, TenTonHammer); no boss-mod timer.
- Damage: 1,050 Nature (spell); ~1,200 (wiki) / ~1,500 (TTH).
- Telegraph: none.

### Toxin (cloud)
- Type: ground hazard
- Target rule: a random player's position (a single poison bolt marks the landing spot; the cloud is larger than its graphic).
- Cadence: every 30–40 s (wiki).
- Damage: 1,313–1,687 Nature every 2 s to anyone inside (5 yd radius per spell data; wiki ~1,500 "unresistable"), −40% movement speed; each cloud lasts 9 s (spell duration).
- Telegraph: the marker bolt; BW/DBM "move out" when you take a tick.

### Melee
- ~1,000 on a NR-geared tank; very fast at first, slower as frost stacks (wiki).

### Freezing (frost-hit counter)
- Type: other (player-driven phase change). Every frost-school damage event on Viscidus counts, regardless of size (rank 1 Frostbolt, frost wands, Frost Oil procs, frost weapons).
- Thresholds (Era): BigWigs counts to 170; DBM displays x/200; wiki strategy "~200"; Wowhead guide emotes at 100 ("Viscidus begins to slow!", −15% movement/attack speed) and 150 ("Viscidus is freezing up!", −30%), then "Viscidus is frozen solid!" — movement and attacks stop. (Wiki's ability table lists 10/15/20 — those are post-5.1 retail values.)
- Window: once frozen he thaws after 15 s if the shatter count is not reached (Wowhead NPC page, BW 15 s bar, wiki).

### Shattering (melee-hit counter)
- Type: other. While frozen, every melee swing hit counts. Emotes: "Viscidus begins to crack!" (~33%), "Viscidus looks ready to shatter!" (~66%), "Viscidus explodes!" (shatter).
- Thresholds (Era): BigWigs counts to 100 melee hits; wiki "~75 (in 1.12)"; (retail 30). DBM log: crack 5.2 s after frozen, shatter 3.7 s later in a 40-man.
- Result: he splits into 1–20 Globs (one per 5% HP remaining).

### Rejoin Viscidus (glob reform)
- Type: other. Surviving globs crawl to the room centre and cast Rejoin (25896); DBM uses 16.5 s from shatter. He reforms at (surviving globs × 5%) HP. Right after reforming he may charge a random player and the MT cannot taunt (wiki, unconfirmed theories); a tank should be at the centre and healers should pause ~5 s.

## Adds
- Glob of Viscidus: 1–20 spawn at shatter in a circle at the room's edge, each representing 5% of his HP. HP 24,416 (Wowhead) / "10–15k damage to kill" (wiki) / "10,000" (Tavern). They cannot be slowed or stunned; they crawl slowly to the centre. Kill as many as possible (assist-train or Goblin Sapper Charge when they bunch in the middle); killing 6 = −30%. Survivors reform him.

## Positioning and movement
- Tank: one tank in high nature resistance holds him in the poison phase; stand at the reform point (room centre) before each Rejoin to re-establish threat. He never leaves his room — pull him only inside it.
- Melee DPS: Option A (wiki/Wowhead): wait outside the room/on the stairs (>100 yd, out of Volley) until "frozen solid", then rush in with the fastest weapons and auto-attack; leave again after globs reform. Option B: high-NR melee stay in and DPS throughout (eat Shock/Volley, stay in totem range). Everyone, including ranged, melees him when frozen.
- Ranged DPS: mages spam rank 1 Frostbolt; warlocks/priests frost wands (Wand of Biting Cold); spread, move out of Toxin clouds instantly; stay >15 yd from him to avoid Poison Shock.
- Healers: druids/paladins/shaman cleanse Poison Bolt Volley constantly (Abolish Poison, Cleanse, Poison Cleansing Totem); keep NR potions rotating; be at the centre tank for the reform.
- Whole raid: Greater Nature Protection Potion 2 min before pull and on cooldown; Frost Oil on melee weapons; everyone converges on him for the shatter and on the centre for the glob kill.

## What each role must do and must not do
- Tank:
  1. Hold him in the room; never let anyone outside the room take aggro (resets to 100%).
  2. Before each reform, be at the centre; after reform, re-taunt is not possible — generate threat first.
  3. Melee him when frozen like everyone else.
- DPS:
  1. Poison phase: frost hits only matter by count — rank 1 Frostbolt, wands, fast frost weapons.
  2. "Frozen solid": everyone swings; fastest weapons; you have 15 s.
  3. On "explodes": assist-train globs; Sapper Charges when they meet in the middle; kill at least 6 per cycle.
  4. Move out of Toxin clouds immediately (1,300–1,700 per 2 s).
  5. Non-NR melee stay out of the room during the poison phase.
- Healer:
  1. Cleanse Poison Bolt Volley on every target, every ~10 s wave.
  2. Spike damage: Poison Shock on melee within 15 yd, Toxin standers, the tank right after reform.
  3. Pause heals for ~5 s after reform so the tank gets threat.

## Timeline of a typical pull (one cycle, repeats 3–4 times)
- t=0: tank pulls; frost casters open (frost counter can start on the pull).
- t≈9–11 s: first Poison Bolt Volley, then every ~10 s; Poison Shock ~every 10 s; first Toxin cloud by ~30–40 s.
- ~100 frost hits: "begins to slow" (−15%); ~150: "freezing up" (−30%); ~170–200: "frozen solid" — Volley stops; melee run in.
- Frozen window 15 s: ~75–100 melee hits → "begins to crack" (~5 s), "looks ready to shatter" (~4 s later), "explodes".
- Globs (1–20) crawl to the centre for ~16.5 s; kill 6+; Rejoin; he reforms at 5% × survivors.
- Repeat until a shatter happens with him below 5% (he dies) or all globs die.

## Open questions
- Frost hits to freeze (Era): 170 (BigWigs), 200 (DBM display, wiki), 100/150 emote points (Wowhead guide); retail 10/15/20; SoD 50.
- Melee hits to shatter (Era): 100 (BigWigs) vs ~75 (wiki, 1.12) vs 30 (retail). DBM's log shows crack→shatter 3.7 s apart in a 40-man.
- Frozen duration: 15 s (Wowhead, BW, wiki) vs 30 s post-2012 retail.
- Glob HP: 24,416 (Wowhead) vs 10–15k (wiki) vs 10,000 (Tavern); % per glob: 5% (wiki, Wowhead, TTH) vs 6% (Tavern).
- Poison Bolt Volley cadence: 10 s (BW/wiki) vs 11.3 s (DBM).
- Poison Shock cadence (~10 s) and Toxin cadence (30–40 s) come only from the wiki; Toxin cloud duration 9 s per spell data though guides treat it as long-lived.
- Post-reform aggro behaviour: wiki lists three unconfirmed theories.
