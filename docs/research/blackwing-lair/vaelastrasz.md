# Vaelastrasz the Corrupt (Blackwing Lair)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Vaelastrasz_the_Corrupt — Essence of the Red 3 min; Burning Adrenaline cast every 15 s on a mana user, every third on the tank, +100% damage, instant casts, -5% max HP/s, 4376–5624 on death; Flame Breath 3500–4500 + DoT 938–1062/3 s for 15 s; Fire Nova 555–645 in 100 yd; Tail Sweep 925–1075; tank rotation and positioning; HP 3,331,000 (post-6.0.3) / 6,368,000 (pre).
- https://classicdb.ch/?npc=13020 — HP 3,331,000, melee 15,715–18,235, armor 4,641, abilities 23461/19983/15847/18173.
- https://classicdb.ch/?spell=23513 — Essence of the Red: 180 s, 500 mana + 50 energy + 20 rage per second, 100 yd radius.
- https://classicdb.ch/?spell=18173 and https://classicdb.ch/?spell=23620 — Burning Adrenaline: 20 s, +100% damage done, all spells instant, -5% max health every 1 s, 4376–5001 Fire to surrounding allies on death.
- https://classicdb.ch/?spell=23478 — Burning Adrenaline explosion: Fire, base 2188, radius 10 yd.
- https://classicdb.ch/?spell=23619 — Burning Adrenaline tick aura: -5% max health, 15 s.
- https://classicdb.ch/?spell=23461 — Flame Breath: 45 yd cone, 2 s cast, 3500–4501 Fire + 938–1063 every 3 s for 15 s.
- https://classicdb.ch/?spell=23462 — Fire Nova: instant, base 555 Fire, 100 yd radius.
- https://classicdb.ch/?spell=19983 — Cleave: weapon +50, up to 10 targets.
- https://classicdb.ch/?spell=15847 — Tail Sweep: 30 yd cone behind, 600–1001 Physical, knockback.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_vaelastrasz.cpp — emulator timers: tank BA every 45 s (first at 45 s), random mana-user BA every 15 s (first at 15 s), Flame Breath first 11 s then every 4–8 s, Fire Nova every 5 s, Cleave 15 s, Tail Sweep 20 s, low-HP yell at 15%.
- https://github.com/BigWigsMods/BigWigs_Classic/blob/master/BlackwingLair/Vaelastrasz.lua — warm-up 43.5 s (up to 45) from the yell "Too late, friends!", BA bar 16 s, tank BA 45 s, 20 s explosion bar.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/BWL/Vaelastrasz.lua — combat start 43.5 s after yell, BA cooldown 16.1–17.8 s from logs, 20 s target timer, "run out" warning at 15 s; transcript yells with timestamps (8.85 s and 28.25 s).
- https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ — BA every 15 s, kills after 20 s, every third on the MT; expect 3–4 tank deaths, 5 warriors; positioning (warrior line at 90 degrees, melee between front and rear right legs, casters on the far wall); 10 s / 5 s DPS delays; rogues/hunters stop at 10%.
- https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-three — 2006 guide: starts at 30% HP, BA kills in 18 s, every 45 s to top threat, Fire Nova 500–1000 (250–500 with 150 FR), Flame Breath up to 5000, tank faces him to the west wall, FR targets.
- https://us.millenium.gg/guide/6486.html?page=2 — starts at 30%, BA 20 s, lethal explosion ignores Ice Block/Divine Protection, no taunt, only tanks in front.
- https://yttrium-tyclief.github.io/sod-guides/bwl/vael (Season of Discovery) — BA positioning lanes (melee north, ranged west, healers east), nobody attacks until the tank has BA; SoD-specific stacking BA.
- https://docs.google.com/document/d/1VT_67cPSHqvRK2_yit0QSiyzGwf9oXTKjcinxsVymoA (warlock notes) — sacrifice voidwalker for pushback immunity; run out when you get BA.

## Overview
- Level ?? (boss). Max HP 3,331,000 (classicdb.ch) but the fight begins with him at 30% — roughly 1,000,000 effective HP (Warcraft Wiki solo note "1 million health"). Melee 15,715–18,235. Armor 4,641. Immune to Taunt. Second boss, required (door to the Halls of Strife opens on his death).
- Soft enrage: Essence of the Red lasts 180 s; after it expires the raid has no resources and the fight is effectively lost ("won at 2:45 or wiped at 3:15" — Warcraft Wiki).
- Phases: single phase. The encounter starts with a ~43.5–45 s scripted dialogue after you speak to him (he becomes hostile at the end), then one continuous burn.
- Raid-size assumptions: 40-man Classic Era. Season of Discovery / Season of Mastery make Burning Adrenaline stacking and raise his starting HP; not covered here.

## Abilities

### Essence of the Red
- Type: other (raid buff)
- Target rule: every raid member within 100 yd when the fight starts
- Cast time: instant, once at engage
- Cooldown: once per pull
- Damage: none
- Debuff (buff): Essence of the Red, 180 s, restores 500 mana per second, 50 energy per second, 20 rage per second. Not dispellable, does not spread.
- Movement effect: none
- Telegraph: his yell "FLAME! DEATH! DESTRUCTION!..." immediately precedes engage; the buff appears on the raid.

### Burning Adrenaline (random)
- Type: debuff / "bomb"
- Target rule: a random mana-using player (SELECT_FLAG_POWER_MANA in the emulator; "mana user" in every guide). Range unlimited.
- Cast time: instant
- Cooldown: every 15 s (cmangos, Warcraft Wiki, Warcraft Tavern); logs show 16.1–17.8 s between casts (DBM), first about 15–16 s after engage (BigWigs bar 16 s).
- Damage: on expiry/death the player explodes for 4376–5001 Fire (classicdb.ch tooltip; Warcraft Wiki 4376–5624) to allies within ~10 yd (spell 23478 radius 10 yd).
- Debuff: Burning Adrenaline, 20 s, dispel type none. +100% damage done, all spells instant cast, max health reduced by 5% every second (so death at 20 s; Ten Ton Hammer measured ~18 s). Cannot be removed; Ice Block / Divine Protection do not stop the death (Millenium). Hearthing while bubbled is a known exploit (not a tactic).
- Movement effect: none, but the player must leave the raid.
- Telegraph: no cast bar; the debuff appears and addons announce the name. DBM warns "run out" at 15 s.

### Burning Adrenaline (tank)
- Type: debuff / tank-swap trigger
- Target rule: his current target (top of threat)
- Cast time: instant
- Cooldown: every 45 s, first at 45 s (cmangos, BigWigs bar 45 s; Ten Ton Hammer and Wowhead "every 45 seconds"; Warcraft Wiki/Warcraft Tavern phrase it as "every third Burning Adrenaline")
- Damage / debuff / movement: identical to the random version (20 s, -5% max HP/s, +100% damage, explode 4376–5001 Fire in 10 yd).
- Telegraph: the MT gets the debuff; this is the tank-swap signal. Warriors and rogues are only affected if they are his current target at the 45 s mark.

### Flame Breath
- Type: frontal cone
- Target rule: cone in front of him, 45 yd range, centred on his current target
- Cast time: 2 s, not interruptible
- Cooldown: first at ~11 s, then every 4–8 s (cmangos); guides simply say "frequent" (Ten Ton Hammer "up to 5,000")
- Damage: 3500–4501 Fire direct (Fire Resistance applies) plus DoT
- Debuff: Flame Breath, 15 s, 938–1063 Fire every 3 s (5 ticks, ~5000 total), dispel type none, does not spread; refreshed by every breath so the MT carries it permanently
- Movement effect: none
- Telegraph: 2 s cast bar; DBM announces "Flame Breath" to tanks

### Fire Nova
- Type: AoE (room)
- Target rule: all enemies within 100 yd (LoS not required per Ten Ton Hammer "regardless of location")
- Cast time: instant
- Cooldown: every 5 s (cmangos); Ten Ton Hammer "very often"
- Damage: 555–645 Fire (classicdb.ch base 555; Warcraft Wiki 555–645); 250–500 observed with 150 FR (Ten Ton Hammer)
- Debuff: none
- Movement effect: none
- Telegraph: none; constant raid-wide pulse

### Cleave
- Type: melee cone
- Target rule: current target and nearest allies, up to 10 targets, chains within 10 yd (Warcraft Wiki)
- Cast time: instant (next melee)
- Cooldown: ~15 s (cmangos); Warcraft Tavern treats it as constant
- Damage: weapon damage +50, Physical (his weapon damage is 15.7–18.2k before armor)
- Debuff / movement: none
- Telegraph: none

### Tail Sweep
- Type: tail (cone behind)
- Target rule: enemies in a cone behind him, 30 yd
- Cast time: instant
- Cooldown: ~20 s (cmangos)
- Damage: 600–1001 Physical (classicdb.ch; Warcraft Wiki 925–1075)
- Debuff: none
- Movement effect: knockback (classicdb.ch knockback value 150, listed as 150 yd on the Warcraft Wiki — treat as a long throw)
- Telegraph: none

## Adds
- None during the fight. Before him: Blackwing Technicians (goblins) in his room run away on the pull of the room and drop Hourglass Sand / Elementium Ingots (Ten Ton Hammer "goblin pull").

## Positioning and movement
- Tank: pick him up as the dialogue ends and hold him with his head to the west wall / away from the raid (Ten Ton Hammer). He is not moved. Tank line of 4–5 warriors, each with his own healer; the next tank in line stands at his left shoulder at 90 degrees from the MT (Warcraft Tavern) so only one body is in the Flame Breath cone and the Cleave chain is short. When the MT gets Burning Adrenaline (every 45 s), the next tank steps into the MT spot immediately; the dying MT keeps attacking (+100% damage) for his last ~15 s and runs out of the melee at ~5 s left so his 4.4–5k explosion hits nobody. Never let two tanks stand side by side in front; never turn him toward the raid (a breath on the raid wipes half of it).
- Melee DPS: rogues on his right side between the front and hind legs — out of the frontal cone and out of the tail cone. Warriors not currently in the tank line DPS from the left shoulder. Vanish/Feign Death during every tank transition so the new tank's threat holds (Warcraft Wiki). Rogue FR ~150–200.
- Ranged DPS: casters stack together against the far wall opposite the warrior line, 25–35 yd out, with their healers (Warcraft Wiki). A caster with Burning Adrenaline runs to the back of the room behind the tail area (not into the tail cone) and spams instants until death. Warlocks: Sacrifice a voidwalker before the pull for pushback immunity.
- Healers: with the casters on the far wall. Priority: current MT always; the next tank topped off for the burst after each swap; raid healing for Fire Nova (555–645 every 5 s on everyone). Shift tank healing to the new MT ~10 s after the swap debuff lands (Warcraft Wiki). Nothing is dispellable here.
- Whole raid: nobody directly behind him (Tail Sweep), nobody in front but the active tank. Burning Adrenaline players always move away from the group before casting; the SoD guide formalises lanes (melee north, ranged west, healers east) which also works in Era.

## What each role must do and must not do
- Tank:
  1. Engage at the end of the dialogue (~43.5–45 s after "Too late, friends!"), Sunder with a fast weapon and build a hard lead; 5–10 s of free threat before DPS starts.
  2. Keep him facing the wall; Flame Breath every 4–8 s and Cleave are frontal.
  3. At each 45 s mark expect Burning Adrenaline on yourself: the next tank in the queue steps in instantly; you stay in place for ~10–15 s doing double damage, then step back out of melee to die alone.
  4. Next tank: pre-position at the left shoulder, already second on threat; Shield Wall is for the first breath after a swap.
  5. Never Taunt (immune). Never stand two deep in the cone. Never die before Burning Adrenaline lands (healers keep the MT alive until the debuff; after it, he is a DPS).
- DPS:
  1. Wait ~10 s (ranged) / ~5 s (off-tanks) after the pull before opening (Warcraft Tavern).
  2. Mana users: when you get Burning Adrenaline, run out immediately (within ~5 s; it is lethal at 20 s and you lose 5% max HP a second), then spam instants from away from everyone.
  3. Rogues/hunters Vanish/Feign on every tank swap and at 10% stop attacking for 10 s (Warcraft Tavern) so the last tank is never overtaken.
  4. Warriors Execute below 20%.
  5. Melee never stand behind him; casters never stand next to the tank line.
- Healer:
  1. Nothing to dispel; the job is throughput: MT takes 3500–4500 + ~1000/3 s from breaths every 4–8 s plus 15–18k melee hits, the raid takes 555–645 every 5 s.
  2. Pre-shield (PW:S) the incoming tank right before a swap; large heals timed to land after a breath.
  3. When you get Burning Adrenaline, move out and spam instant heals on the MT until you die.
  4. Essence of the Red removes mana limits for 3 minutes — overheal freely; the fight is lost past 3:00 anyway.

## Timeline of a typical pull
- t=-45 s Talk to Vaelastrasz; he yells "Too late, friends! Nefarius' corruption has taken hold..." (BigWigs/DBM warm-up 43.5 s, up to 45). Further yells at ~9 s and ~28 s. Tanks position during this.
- t=0 He turns hostile and casts Essence of the Red on the raid (3:00 countdown begins). MT engages.
- t≈5 s First Fire Nova (then every 5 s). t≈8–15 s first Cleave. t≈11 s first Flame Breath (then every 4–8 s).
- t≈15–16 s First random Burning Adrenaline on a mana user (then every ~16–18 s: ≈0:32, 0:48, 1:05, ...).
- t≈20 s First Tail Sweep (then every ~20 s).
- t=45 s First tank Burning Adrenaline → swap to tank 2; MT1 dies at ~1:05.
- t=1:30 Tank 2 gets BA → tank 3. t=2:15 tank 3 gets BA → tank 4. t=3:00 tank 4 would get BA → tank 5 (Warcraft Tavern "expect at least three tank deaths and likely four").
- t≈2:00–2:45 He dies (needs ~1,000,000 damage in <180 s ≈ 5,600 raid DPS).
- t=3:00 Essence of the Red fades; a raid that is not nearly done wipes shortly after.

## Open questions
- Random Burning Adrenaline interval: 15 s (Warcraft Wiki, Warcraft Tavern, cmangos) vs 16.1–17.8 s measured from logs (DBM) vs 16 s (BigWigs). Use ~16 s.
- Whether the tank BA is strictly "every third cast" or an independent 45 s timer: emulator and BigWigs model it as a separate 45 s timer; wiki text says every third. Both produce 0:45, 1:30, 2:15.
- Explosion damage: 4376–5001 (classicdb.ch tooltip) vs 4376–5624 (Warcraft Wiki). Radius ~10 yd (spell 23478).
- Tail Sweep damage: 600–1001 (classicdb.ch) vs 925–1075 (Warcraft Wiki).
- Fire Nova cadence: every 5 s (cmangos) vs "very often" (Ten Ton Hammer); exact Era interval not logged in the fetched sources.
- Flame Breath cadence: cmangos 4–8 s after an 11 s opener; no boss mod carries a timer. Treat as "several times per tank".
- Starting HP: every guide says 30%; max HP 3,331,000 (classicdb.ch) vs the Warcraft Wiki's note that pre-6.0.3 he had 6,368,000 (not Classic Era).
