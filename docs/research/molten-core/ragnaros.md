# Ragnaros (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Ragnaros_(tactics) — Wrath of Ragnaros (melee) 1000 Fire, 25 yd knockback, 3 s cooldown; Elemental Fire 2160–2640 + 600/s 8 s on tank; Magma Blast 6000 1 s cast when nobody in melee; Melt Weapon; "Wrath of Ragnaros (ranged)" 1000 Fire + knockback within ~20 yd of a random mana user every 20–30 s; Lava Splash; 3 min submerge, 8 Sons, 90 s; banished Sons count as dead; FR targets (MT 300–315, melee 200, others 100); 2 h despawn; positioning rings; Sons phase plan; quotes.
- https://warcraft.wiki.gg/wiki/Ragnaros — lore page; level ??; first kill.
- https://www.wowhead.com/tbc/npc=11502/ragnaros (r.jina.ai) — health 1,099,230; ability list 20566, 19780, 17731, 20564, 20565, 21388, Summon Sons of Flame.
- https://www.wowhead.com/classic/npc=11502/ragnaros (r.jina.ai) — Seasonal 40 health 2,198,460.
- https://www.wowhead.com/wotlk/npc=12143/son-of-flame (r.jina.ai) — Son of Flame level 60, health 15,260.
- https://www.wowhead.com/tbc/npc=12143/son-of-flame (r.jina.ai) — Son of Flame ability Summon Player (21727).
- https://wotlkdb.com/?spell=20566 — Wrath of Ragnaros: instant, 3 s cooldown, 25 yd radius, 1000 Fire, knockback 400–450.
- https://wotlkdb.com/?spell=20564 — Elemental Fire: instant, 25 yd, 2160–2640 Fire + 600 every 1 s for 8 s.
- https://wotlkdb.com/?spell=20565 — Magma Blast: 1 s cast, unlimited range, 6000 Fire.
- https://wotlkdb.com/?spell=21154 — Might of Ragnaros ("Hand of Ragnaros" in guides): 0.5 s cast, 100 yd, summons Flame of Ragnaros (13148) at a random mana user.
- https://wotlkdb.com/?spell=21155 — Intense Heat (Flame of Ragnaros): 20 yd radius, 2000 Fire, knockback 150–200.
- https://wotlkdb.com/?spell=19780 — Hand of Ragnaros (listed on Wowhead): 10 yd radius, 300–400 Fire, knockback, 2 s stun.
- https://wotlkdb.com/?spell=21908, https://wotlkdb.com/?spell=21886, https://wotlkdb.com/?spell=21158 — Lava Burst chain: randomizer → summon object 178088 (3 s) → Lava Burst 925–1075 Fire, 35 yd radius.
- https://wotlkdb.com/?spell=17731 — Eruption (listed on Wowhead TBC): 5184–5816 Fire in 5 yd + activate object 13 yd (lava burst geyser).
- https://wotlkdb.com/?spell=21387 and https://wotlkdb.com/?spell=21388 — Melt Weapon: 15% proc, 1 durability damage.
- https://wotlkdb.com/?spell=21108, https://wotlkdb.com/?spell=21107, https://wotlkdb.com/?spell=20568 — Summon Sons of Flame (serverside), Submerge Fade (stealth), Emerge (2.9 s cast).
- https://wotlkdb.com/?spell=21857 and https://wotlkdb.com/?spell=21858 — Lava Shield (Son of Flame): 50 damage shield + every 3 s burns 150 mana from players within 10 yd.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_ragnaros.cpp — timers: Wrath first 30 s then 30 s ("up to 34 s confirmed"); Might/Hammer first 11 s then 11 s ("~11 s confirmed" vs wowwiki 20–30 s); Elemental Fire 3 s then 10–14 s on tank; Magma Blast checks from 2 s, spams every 1 s when nobody in melee, 3 s grace after emerge; submerge at 180 s, 8 Sons within 30 yd, 90 s or 1 s after last Son dies, 180 s cycle; combat starts 10 s after Elemental Fire on Executus + 3 s yell.
- https://raw.githubusercontent.com/scriptdev2/scriptdev2-classic/master/scripts/eastern_kingdoms/molten_core/boss_ragnaros.cpp — Wrath 30 s then 25 s (20 s after emerge), removes 100% threat from hit target; Might 11 s then 11–30 s; Lava Burst first 20 s then 5–25 s ("could be up to 45 s"); Magma Blast every 0.5 s when out of melee; Sons get Double Attack + Lava Shield; last Son death reduces submerge by 1 s.
- https://www.wowhead.com/classic/guides/ragnaros-molten-core-strategy (r.jina.ai) — Wrath = tank-swap mechanic, melee run out before the timer; Lava Burst on random mana user displaces players in the radius; ranged stack in pairs; 3 min submerge; Frost Trap/Nova on Sons; skipping submerge possible; comments on knockback/FR.
- https://www.warcrafttavern.com/wow-classic/guides/ragnaros-som/ (search snippet) — Wrath 1000 Fire within 25 yd and resets MT threat; Lava Burst 1387 damage, knocks back within 8 yd (SoM numbers).
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/245 (Warcraft Tavern) — ability table (Hand 2 s, Magma Blast 1 s cast unlimited, Wrath 3 s CD, Elemental Fire 25 yd 8 s, Mana Burn 8 s); 2 tanks; ranged in pairs 15 yd apart; submerge at 3 min.
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-10-ragnaros — Wrath 1000 dmg / 25 s; ranged knockback every 20–30 s; Lava Splash 800/400/200 by FR; Magma Blast 4000–6000; Sons mana-burn aura 5–10 yd; FR targets (MT 250–300+, melee 200+, casters 100–150); submerge timeline; 2 h limit; return tanks at 90 s.
- https://wowtbc.gg/classic/boss-guides/molten-core — SoM/Era hybrid: Lava Burst random ranged, Lava Shield keep Sons off casters, MT can resist Wrath, OT picks up; Phase 2 at 50% (SoM).
- https://mein-mmo.de/en/wow-classic-how-much-blizzard-buffs-the-molten-core-in-the-classic-mode,742902 — SoM: submerge at 50%, 60 min timer.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_majordomo_executus.cpp — summon RP stage timings (≈70 s) before Elemental Fire kills Executus.

## Overview
- Level ?? (boss). Health 1,099,230 (Era 40-player); 2,198,460 Seasonal. No mana. Final boss; summoned by talking to the defeated Majordomo Executus at the lava pool. Despawns 2 hours after summoning (wiki, Ten Ton Hammer); Executus respawns 2–3 h later. No DPS enrage, but every 3 minutes he submerges for up to 90 s and spawns 8 Sons of Flame — an un-killed second wave is "very hard to survive" (Ten Ton Hammer), so the de-facto DPS check is reaching ~30–40% before the first submerge and killing him in the second emerge window.
- Phases (Era): P1 emerged 0–3:00; P2 submerged 3:00–4:30 (or until all 8 Sons dead/banished); P1 again for 3:00; repeat. Combat starts ~13 s after the Executus RP ends.
- Raid-size assumptions: 40-man Era. SoM: submerge at 50% HP regardless of time, 60 min timer, Sons keep spawning from lava afterwards. SoD: different fight.

## Abilities

### Wrath of Ragnaros (melee knockback)
- Name: Wrath of Ragnaros (spell 20566); yell "TASTE THE FLAMES OF SULFURON!"
- Type: AoE knockback (around boss) + threat wipe on those hit
- Target rule: everyone within 25 yd of Ragnaros (melee and tank)
- Cast time: instant
- Cooldown or cadence: DBC 3 s cooldown; actual cadence: wiki/Ten Ton Hammer every 25 s; scriptdev2 30 s then 25 s (20 s after emerge); cmangos 30 s ("up to 34 s"). Warcraft Tavern SoM: resets the MT's threat.
- Damage: 1000 Fire; knockback 400–450 units upward/outward (into lava or off the platform if badly positioned); scriptdev2 removes 100% of the hit target's threat.
- Debuff: none. Fire resistance can resist the whole spell (a 300+ FR tank resists ~75%, Ten Ton Hammer).
- Movement effect: large knockback (wiki: "25 yard knockback")
- Telegraph: timer-based (addon); yell on cast. Melee back out before it fires, then re-engage; OT taunts if the MT is thrown.

### Might of Ragnaros / "Hand of Ragnaros" (ranged knockback)
- Name: Might of Ragnaros (21154) summoning a Flame of Ragnaros (NPC 13148) which casts Intense Heat (21155); guides call it Hand of Ragnaros / "the ranged knockback"; yell "BY FIRE BE PURGED!"
- Type: targeted → ground AoE knockback
- Target rule: a random player with a mana bar (cmangos SELECT_FLAG_POWER_MANA; wiki "random player with a mana bar"); everyone within 20 yd of that spot
- Cast time: 0.5 s
- Cooldown or cadence: cmangos ~11 s ("confirmed"); scriptdev2 11–30 s; wiki/Ten Ton Hammer 20–30 s
- Damage: Intense Heat 2000 Fire + knockback 150–200 in 20 yd (DBC); wiki "1000 Fire and knockback to all except the target within ~20 yd"
- Debuff: none
- Movement effect: knockback (fall damage, lava)
- Telegraph: yell; spread ranged so only one or two players are inside 20 yd; stand with your back to a wall segment on the outer ring (wiki).

### Hand of Ragnaros (listed ability)
- Name: Hand of Ragnaros (spell 19780), on Wowhead's Ragnaros ability list
- Type: AoE knockback + stun
- Target rule: everyone within 10 yd
- Cast time: instant
- Cooldown or cadence: unknown; neither emulator script casts it on Ragnaros
- Damage: 300–400 Fire, knockback 75–100, stun 2 s
- Telegraph: none. Treat as possibly unused/legacy data.

### Lava Burst
- Name: Lava Burst (randomizer 21908 → Summon Lava Burst A–H 21886/21900–21907 → gameobject 178088 → Lava Burst 21158; Wowhead also lists Eruption 17731)
- Type: ground hazard (geyser)
- Target rule: random lava/platform points (scriptdev2 "cast without a target"); SoM guides say random ranged player
- Cast time: instant; geyser object lasts 3 s before erupting
- Cooldown or cadence: scriptdev2 first 20 s then 5–25 s ("could be up to 45 s")
- Damage: Lava Burst 925–1075 Fire in 35 yd (DBC 21158) or Eruption 5184–5816 Fire in 5 yd (17731); Warcraft Tavern SoM: 1387 damage, knockback within 8 yd; Wowhead guide: "significant Fire damage and displaces players in the blast radius". Ten Ton Hammer's "Lava Splash" (800 at 0 FR, 400 at 100 FR, 200 at 200 FR) is the lava-edge damage.
- Debuff: none
- Movement effect: knockback (per SoM guides)
- Telegraph: geyser visual 3 s before eruption; stay away from lava edges; ranged 8–15 yd apart.

### Elemental Fire
- Name: Elemental Fire (spell 20564)
- Type: targeted debuff
- Target rule: current tank (primary threat), 25 yd
- Cast time: instant
- Cooldown or cadence: cmangos first 3 s then every 10–14 s (scriptdev2: proc on melee hits via 20563)
- Damage: 2160–2640 Fire + 600 Fire every 1 s for 8 s (4800 more)
- Debuff: Elemental Fire, 8 s, no dispel type listed. If it appears on a non-tank, that player is over threat.
- Movement effect: none
- Telegraph: debuff on the tank; constant tank healing required.

### Magma Blast
- Name: Magma Blast (spell 20565)
- Type: targeted (punish no melee)
- Target rule: random player, unlimited range, whenever nobody is within melee range
- Cast time: 1 s; interruptible unknown
- Cooldown or cadence: cmangos spams every 1 s while nobody is in melee (0.5 s scriptdev2); 3 s grace after emerging
- Damage: 6000 Fire per cast (Ten Ton Hammer 4000–6000)
- Debuff/Movement: none
- Telegraph: 1 s cast bar. Always keep someone in melee; tanks must be back on him at the 90 s emerge.

### Melt Weapon
- Name: Melt Weapon (21387 passive, 15% proc → 21388)
- Type: other
- Target rule: anyone meleeing Ragnaros
- Damage: 1 durability damage per proc to the weapon; bring spares/repair bot.

### Submerge / Sons of Flame
- Name: Submerge (21107 stealth, visual 20567, 21859 immunity), Summon Sons of Flame (21108), Emerge (20568, 2.9 s cast); yell "COME FORTH, MY SERVANTS! DEFEND YOUR MASTER!"
- Type: summon adds + boss immune
- Target rule: 8 Sons spawn at random points within 30 yd of Ragnaros (cmangos) around the spiral on the west, north and east sides and rush south (wiki)
- Cast time: ~3 s submerge animation
- Cooldown or cadence: 180 s after combat start, then 180 s after each emerge. Submerged 90 s, or ~1 s after the last Son dies/is banished.
- Damage: none directly; while submerged he is untargetable and immune.
- Telegraph: yell + timer; raid moves to the southern lip 20 s before (wiki).

### Lava Shield (Son of Flame)
- Name: Lava Shield (21857 → 21858)
- Type: AoE mana burn aura + damage shield
- Target rule: players within 10 yd of a Son
- Cadence: every 3 s
- Damage: burns 150 mana per pulse from players within 10 yd (Ten Ton Hammer "converts mana to fire damage quickly"); 50 Fire damage shield to melee attackers. Dispel type Magic (buff on the Son, purgeable). Keep Sons away from healers.

## Adds
- 8x Son of Flame (NPC 12143), level 60 elite, 15,260 HP each (Wowhead WotLK; snippet "15k HP"). Spawn at each submerge within 30 yd of Ragnaros and charge the raid. Abilities: Lava Shield (10 yd mana burn aura), Double Attack, Summon Player (21727, pulls a player to it). Handling: warriors/bear tanks pick them up on the southern outer ring behind a wall of tanks/rogues; Frost Nova, Blizzard, Frost Trap, Freezing Trap to control; Warlocks may Banish a few but always keep at least one unbanished (banished Sons count as defeated and he resurfaces early — wiki). Kill them one at a time, one every ≤10 s (wiki). They despawn when Ragnaros emerges (1 s OOC despawn in cmangos). If the raid cannot kill all 8 in 90 s he emerges anyway with Sons still up.
- Flame of Ragnaros (NPC 13148): invisible summon at the Might of Ragnaros target that casts Intense Heat (2000 Fire, 20 yd knockback) and despawns.

## Positioning and movement
- Tank: MT (300–315 FR, Greater Fire Protection Potion) tanks Ragnaros where he emerges in the centre pool; facing irrelevant (no cone). Expect Elemental Fire every 10–14 s and a Wrath every ~25–30 s: either resist it with FR or an OT standing in melee taunts the moment the MT is launched (Wowhead guide: a second tank "ready to pick up the boss"). Never let melee range be empty (Magma Blast 6000 per second). 20 s before submerge, the MT stays; at ~85 s of the submerge the MT, OT and their healers return to melee range so he is tanked the instant he emerges.
- Melee DPS: inner ring on the south, west and north sides (wiki); 200+ FR; back out of 25 yd just before each Wrath timer, re-engage after; melee mana users (paladins/shamans/enhancement) should avoid melee range (they can be Might-of-Ragnaros targets). Weapons melt — carry spares.
- Ranged DPS: outer ring, south and west, 100–150 FR, spread so no two are within 20 yd of a Might target (Ten Ton Hammer "one player per hit"); Wowhead guide alternative: pairs 15 yd apart. Stand against small wall sections to stop the knockback (wiki). Stay away from lava flows (Lava Splash/Lava Burst). Ranged cannot pull aggro while anyone is in melee, so DPS flat out.
- Healers: outer ring in heal range of the MT; same spacing rules; tank healers near the south lip. During submerge, healers stand behind the tank/rogue wall at the southern outer ridge, Sons kept 10+ yd away (Lava Shield).
- Whole raid: Phase 1 rings as above; at T-20 s to submerge everyone but the MT collapses to the southern lip of the outer ring: mages at the collapse point, mana users at the edge, tanks and rogues in a line in front; Sons funnel south into the wall; at submerge+85 s tanks and tank healers return to the pool.

## What each role must do and must not do
- Tank:
  1. Be in melee on him at all times when emerged; a 3 s gap starts 6000-damage Magma Blasts on the raid.
  2. Wrath handling: resist it (FR) or have the OT in melee taunt immediately; never both tanks knocked at once.
  3. Return to the pool at ~85 s of each submerge with healers.
  4. Do not stand where the knockback throws you into lava.
- DPS:
  1. Burn everything in the first 3 minutes (goal 30–40% before the first submerge); ranged use all cooldowns.
  2. Melee: out before Wrath, back after; stop and run to the south lip 20 s before submerge.
  3. Sons: one at a time, ≤10 s each; never banish all of them; Frost Nova/Blizzard/traps to hold them in the wall; mages stay 10 yd from Sons.
  4. Casters: spread 15–20 yd; do not stand near lava.
- Healer:
  1. Constant MT healing: Elemental Fire = 2160–2640 then 600/s for 8 s, plus melee, every 10–14 s.
  2. Pre-pot Greater Fire Protection a few seconds before Sons spawn; heal knockback victims.
  3. Stay 10+ yd from Sons (150 mana burned per 3 s per Son).
  4. Go back to the pool with the tanks at 85 s of submerge.

## Timeline of a typical pull
- t=-85 s: raid leader talks to Executus; ~70 s of RP (cmangos stage timings), Ragnaros kills Executus with Elemental Fire; ~10–13 s later Ragnaros is in combat ("TOO SOON! YOU HAVE AWAKENED ME TOO SOON, EXECUTUS!").
- t=0: MT in melee; Elemental Fire on tank at ~3 s, then every 10–14 s all phase.
- t≈11 s: first Might of Ragnaros on a random mana user (Intense Heat 2000 + knockback 20 yd); then every ~11 s (emulator) / 20–30 s (guides).
- t≈20 s: first Lava Burst geysers; then every 5–25 s.
- t≈30 s: first Wrath of Ragnaros (1000 Fire, 25 yd knockback, threat drop); melee step out at ~28 s; then every ~25–30 s (≈55, 85, 115, 145, 175 s).
- t=160 s: raid (except MT) moves to the southern outer lip.
- t=180 s: "COME FORTH, MY SERVANTS!" — submerge; 8 Sons of Flame (15k HP each) spawn and rush south. Kill one every ≤10 s.
- t=180–270 s: Sons phase; at t≈265 s tanks and tank healers return to the pool.
- t=270 s (or 1 s after the last Son dies): emerge (2.9 s); Magma Blast grace 3 s; Wrath 20–30 s after emerge; cycle timers restart.
- t=270–450 s: second emerge window; he must die here (needs ≤40% at t=180 per wiki) or a second Sons wave at t=450 s is likely a wipe.
- Hard stop: 2 h after summoning he despawns.

## Open questions
- Wrath cadence: 25 s (wiki, Ten Ton Hammer, scriptdev2) vs 30–34 s (cmangos); whether it wipes the tank's threat (Warcraft Tavern SoM, scriptdev2) or only knocks back (wiki).
- Ranged knockback cadence: ~11 s (cmangos "confirmed") vs 20–30 s (wiki, Ten Ton Hammer, scriptdev2 upper bound); damage 2000 (DBC Intense Heat) vs 1000 (wiki).
- Lava Burst implementation: random geysers (emulator) vs targeted on a random mana user (Wowhead guide, SoM guides); damage 925–1075 / 35 yd (21158) vs 5184–5816 / 5 yd (17731) vs 1387 + 8 yd knockback (SoM).
- Whether Hand of Ragnaros 19780 is actually cast by Ragnaros (on Wowhead's list; not in any script).
- Son of Flame HP 15,260 is the WotLK value; Era value not fetchable.
- Delay from Executus' death to Ragnaros being attackable: ~13 s (cmangos) — no retail timing found.
