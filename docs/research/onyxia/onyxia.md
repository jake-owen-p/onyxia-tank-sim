# Onyxia (Onyxia's Lair)

Sources: list every URL used, one per line, with what it contributed.

Primary-ish spell/NPC data (Wowhead Classic, fetched through the r.jina.ai reader proxy because wowhead.com returns 403 to direct fetches; the data is Wowhead's):
- https://www.wowhead.com/classic/npc=10184/onyxia — boss classification, quotes (all five yells), ability IDs 18431/17086, Deep Breath emote text, Seasonal (SoD) 40-player HP 5,006,493.
- https://www.wowhead.com/classic/spell=18435/flame-breath — Flame Breath: 2 s cast, 45 yd, 3063–3937 Fire, cone, triggers Heated Blade DND 22904.
- https://www.wowhead.com/classic/spell=18500/wing-buffet — Wing Buffet: 1 s cast, 563–937 Physical, 20 yd cone, Knock Back effect value 150.
- https://www.wowhead.com/classic/spell=15847/tail-sweep — Tail Sweep: instant, 30 yd, 600–1000 Physical, cone behind, Knock Back value 150.
- https://www.wowhead.com/classic/spell=19983/cleave — Cleave: next melee, 6 s cooldown, normal damage +50, up to 10 targets; also used by Onyxian Warder.
- https://www.wowhead.com/classic/spell=19633/knock-away — Knock Away: instant, 15 yd, weapon damage +30, knockback (value 98), script effect (the threat cut).
- https://www.wowhead.com/classic/spell=18431/bellowing-roar — Bellowing Roar: 1.5 s cast, Fear 3 s, 100 yd radius, plus Activate Object (radius 13 yd).
- https://www.wowhead.com/classic/spell=18392/fireball — Fireball: 3 s cast, unlimited range, 8 yd radius, 1700–2300 Fire.
- https://www.wowhead.com/classic/spell=17086/breath — Deep Breath (N→S lane): 5 s cast, 1275 Fire per effect, 30 yd radius, chains to 17087.
- https://www.wowhead.com/classic/spell=18351/breath — Deep Breath (S→N lane): same values, chains to 18352.
- https://www.wowhead.com/classic/spell=17087/breath — Breath sub-spell: 0.25 s cast, 1275 Fire, 30 yd radius, chains to 17088 (the breath "walks" across the room as a chain of these).
- https://www.wowhead.com/classic/spell=22191/heated-ground — Heated Ground: 413 Fire/s for 4 s, 13 yd radius.
- https://www.wowhead.com/classic/spell=20019/engulfing-flames — Engulfing Flames: 1500 Fire over 6 s + Confuse (the pre-1.3.0 fireball effect).
- https://www.wowhead.com/classic/spell=17731/eruption — "Eruption" 17731: 1313 Fire, 5 yd radius, but listed as used by Magmakin (Molten Core), see Open questions.
- https://www.wowhead.com/classic/spell=18958/flame-lash — Warder Flame Lash: 56–64 Fire, −20 Fire resistance for 45 s, Magic dispel.
- https://www.wowhead.com/classic/spell=12097/pierce-armor — Warder Pierce Armor: −75% armor for 20 s; Onyxian Warder listed as a user.
- https://www.wowhead.com/classic/spell=20602/fire-nova — checked: this Fire Nova is NOT the Warder's (used by Flame Imp only).
- https://www.wowhead.com/classic/npc=12129/onyxian-warder — Warder level 60–63 elite, SoD HP 106,821.
- https://www.wowhead.com/classic/npc=11262/onyxian-whelp — Whelp level 56–60, SoD HP 3,052, Teleport to Player 21543.
- https://classic.warcraftdb.com/wowclassicdb/npc/10184 — Onyxia level 63, HP 1,099,230 (Classic 1.13 data).
- https://classic.warcraftdb.com/wowclassicdb/npc/12129 — Warder HP 76,300–83,275.
- https://classic.warcraftdb.com/wowclassicdb/npc/11262 — Whelp level 56–57, HP 2,699–2,784, Pyroblast 20228 (instant, 40 yd), Rookery Whelp Spawn-in 15750.
- https://wotlkdb.com/?spell=18435 — confirms the same spell ID was re-tuned to 18850–21150 for the level-80 version (so WotLK databases must not be used for Classic numbers).

Boss mods (real timers observed in-game):
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/VanillaOnyxia/Onyxia.lua — DBM Vanilla: Flame Breath variance timer 9.7–35.6 s (first 11.3–28.5), Wing Buffet 17.8–32.4 (first 11.3–24.5), Bellowing Roar 9.7–58.3, Deep Breath 5 s cast bar, Deep Breath emote text and "+29.1 s after P2 yell" (SoD), phase yells, Fireball target scan.
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/Onyxia_Classic/Onyxia.lua — BigWigs: encounter ID 1084, Flame Breath bar 13 s first / 12 s repeat ("12-19"), Deep Breath cast 5 s on Classic Era vs 8 s on Wrath, phase yell triggers, Fireball flagged as threat wipe, Warder Flame Lash stacks.

Emulator scripts (not Blizzard data, but encode community-observed cadences; treated as "~" estimates):
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/kalimdor/onyxias_lair/boss_onyxia.cpp — all ability timers, 8 flight points with coordinates and lane spell IDs, 1/3 breath / 1/3 clockwise / 1/3 counter-clockwise, whelp wave 20 then 4–10 every ~90 s, 3.5 s after liftoff whelps begin.
- https://raw.githubusercontent.com/vmangos/core/development/src/scripts/kalimdor/dustwallow_marsh/onyxias_lair/boss_onyxia.cpp — alternative timers, 35/35/30 lane roll, whelp wave 16 then 5–7 every 30 s, Phase 3 single whelps every 1–10 s, Fireball −100% threat, Knock Away −25% threat, DoResetThreat on landing, 90 yd leash teleport, aggro range 58 yd.

Wikis and guides:
- https://warcraft.wiki.gg/wiki/Onyxia_(Classic) — Classic ability descriptions (Flame Breath ~4000, Tail Sweep ~300, Fireball 3000/1500 splash, Eruption ~1500, Bellowing Roar 10–30 s), Knock Away −25% threat, Wing Buffet no threat change, 6 positions / safe spots, "5 fireballs per position", Kaplan "totally random", whelp behaviour, Warder notes, patch history.
- https://warcraft.wiki.gg/wiki/Onyxia_(tactics) — WotLK 10/25 remake numbers (used ONLY for mechanics shape: 18 yd wide breath line, 30 yd Tail Sweep knockback, 2 packs of 20 whelps every 90 s). Not Classic damage.
- https://warcraft.wiki.gg/wiki/Talk:Onyxia — Brady Games 35/35/30 figure, "breath is a straight line not a cone", 6 vs 8 stop positions, ~1500 lava, ~300 tail.
- https://warcraft.wiki.gg/wiki/Onyxia%27s_Lair_(Classic) — raid is level 60 / 40-player, attunement, patch 1.3.0 Warder respawn.
- https://warcraft.wiki.gg/wiki/Onyxian_Warder — 4 Warders, Cleave / Flame Lash / Fire Nova (~10 yd), respawn while Onyxia in combat.
- https://warcraft.wiki.gg/wiki/Onyxian_Whelp — nests on the corners of the chamber, eggs hatch when a player enters.
- https://www.wowhead.com/classic/guide/onyxia-onyxias-lair-strategy-wow-classic — 8 flight positions, "taking a deep breath" warning, spread 8 yd, cracks pulse every several seconds, Warder pull rule.
- https://www.wowhead.com/classic/guide/onyxia-onyxias-lair-raid-overview-wow-classic — 40-player, phase thresholds, Drakefire Amulet in bags.
- https://www.wowhead.com/news=353792/... — Anniversary realms: no buff/debuff limits; Quel'Serrar via Flame Breath.
- https://www.warcrafttavern.com/wow-classic/guides/onyxias-lair/ — Flame Breath up to 4000, Engulfing Flames up to 3000 / half splash + threat wipe, Knock Away −25%, Bellowing Roar/Eruption 10–30 s and up to 1500, group split odd/even, whelp groups 7+8, stop DPS near 40%.
- https://warcrafttavern.com/guides/onyxias-lair — SoD/Era version of the same guide; comment claims Onyxia is not fire-immune in SoD.
- https://theamazonbasin.com/wiki/index.php/Onyxia%27s_Lair — 2005-era numbers: melee ~700 on tank, Tail ~1000, breath 3000–3500, Deep Breath ~5000, whelps "about a dozen per pit" then waves of 3–4, Warder Fire Nova ~1000, DPS cycles, hunters at "the two humps", crack crossing ~1200, ground shakes ~3 s before fear.
- https://murphymuseltook.blogspot.com/2022/03/classic-wow-never-lose-threat-on-onyxia.html — threat handling: Knock Away −25%, Wing Buffet no threat cut, fireball threat wipe, casters stop 41–44%, fear handling.
- https://evilguild.neocities.org/onyxia.html — HP 665,000 (disputed), Phase 1 ~3–4 minutes, Wing Buffet "reduces aggro 25%" (contradicts others), Track Dragonkin callouts.
- https://epoglogs.com/guides/onyxia — Phase 3 roar "every 30 s", "she lands aggroed on whoever did the most Phase 2 damage", lust at 35%.
- https://wowtbc.gg/classic/boss-guides/onyxia's-lair — back-to-wall tanking, 8 yd fireball spacing, Fear Ward pre-pull.
- https://almarsguides.com/WoW/Instances/Classic/Onyxia/ — "resets most aggro at Phase 3", tanks cannot build threat while moving, call positions Upper/Lower Left/Right.
- https://us.millenium.gg/guide/6258.html — ability list, Knockback −25% threat, Hunter's Mark to track her.
- https://sites.google.com/view/tarks-axe-wow-raids/home/onyxias-lair-20 — SoD 20-man: Flame Breath 3,063–3,937, HP 5,006,493, Deep Breath safe-zone diagram.
- https://eu.forums.blizzard.com/en/wow/t/onyxia-and-aggro-in-p2-p3/88666 — 2019 Classic reports: she runs to 5–6 players on landing, raids stop DPS at 42–45%, fireball reset an off-tank's threat, Gnomish Cloaking Device trick.
- https://us.forums.blizzard.com/en/wow/t/please-fix-onyxia/374008 — 2019 reports: 30–60 s standstill at landing, 5–15 s pickup if done well, Fireball threat drop per hit.
- https://us.forums.blizzard.com/en/wow/t/onyxia-takes-a-deep-breath/9423 — Deep Breath trigger speculation; Kaplan "totally random" (second-hand).
- https://www.pcgamer.com/two-ingenious-world-of-warcraft-players-kill-a-boss-with-18-million-hp-thats-supposed-to-take-40-people — press figure "1.8 million HP" (unsourced).

Blocked/unusable: icy-veins.com (403 and bot check), wowpedia.fandom.com (402), vanilla-twinhead.twinstar.cz (Cloudflare 403), classicdb.ch (no data), db.vanillagaming.org (connection closed), Warcraft Logs (JS only; no public report fetched).

## Overview
- Level 63 boss (Dragonkin), Classic Era 40-player. HP 1,099,230 per classic.warcraftdb.com (1.13 client data); Wowhead shows only the Season of Discovery 40-player value 5,006,493. Older community figures (665,000 at evilguild; "1.8 million" in press) conflict, see Open questions. No enrage timer in any source, boss mod, or emulator script. Immune to taunt-type effects (Taunt, Challenging Shout, Mocking Blow) but Sunder Armor and all threat works. Immune to Fire in Era (the SoD guide comments claim she is not fire-immune in SoD).
- Position in raid: the only boss of Onyxia's Lair, after four Onyxian Warder trash mobs in the entrance tunnel. Required (the raid has nothing else). Lockout: the raid overview does not state it (community: 5-day reset in Era, see Open questions).
- Leash: she evades if dragged too far (vmangos: X < −95); players more than ~90 yd away are teleported back to the room centre (wiki: "teleports players back to her if they run too far"; vmangos coordinates −12.9, −216.6). Aggro range ~58 yd (vmangos). Phase 1 begins when anyone enters the main chamber (wiki).
- Phases (HP thresholds; all sources agree):
  - Phase 1, 100% to 65%: ground. Melee, Cleave, Flame Breath, Wing Buffet, Knock Away, Tail Sweep.
  - Phase 2, 65% to 40%: she yells "This meaningless exertion bores me. I'll incinerate you all from above!", walks to the south end, lifts off. No melee, no threat table use; Fireball on random/high-threat targets, Deep Breath across the room, whelp waves from the two egg pits, Onyxian Warders respawn in the tunnel.
  - Phase 3, 40% to 0%: she yells "It seems you'll need another lesson, mortals!", lands (centre/south of the room), casts Bellowing Roar, then Phase 1 abilities plus Bellowing Roar (AoE fear) and lava-crack Eruptions after each fear, with small whelp spawns.
- Raid-size assumptions: 40-man Classic Era. Season of Discovery (20-player, scaled 5M HP, extra Warder summon 364849 at Phase 2, SoD Deep Breath on a fixed 29.1 s timer after the P2 yell per DBM) and the WotLK 10/25 remake (8 s Deep Breath cast, Lair Guards, 18k breaths) are different encounters; numbers from them are marked as such and not used for the Era model.
- Yells (Wowhead): aggro "How fortuitous. Usually, I must leave my lair in order to feed."; Phase 2 "This meaningless exertion bores me. I'll incinerate you all from above!"; Phase 3 "It seems you'll need another lesson, mortals!"; on killing a player "Learn your place, mortal!"; when kited out of the lair "You seek to lure me from my clutch? You shall pay for your insolence!". Deep Breath emote: "Onyxia takes in a deep breath..." (DBM log, Wowhead).

## Abilities

### Melee (auto-attack)
- Type: melee, current tank.
- Target rule: top of threat (taunt-immune, so threat is the only control).
- Cast time: swing timer, unknown (~2 s typical boss swing, estimate).
- Damage: ~700 per hit on a 2005 plate tank (Amazon Basin); 2019 reports of a ~3k crit on a non-tank (US forum). Physical. School damage numbers for Era are otherwise unknown.
- Debuff/movement/telegraph: none.
- Note (wiki): a dead-and-resurrected main tank cannot regain aggro because she cannot be taunted; a second tank must already be high on threat.

### Cleave
- Name: Cleave, spell 19983.
- Type: melee frontal cleave.
- Target rule: current melee target plus its nearest allies, up to 10 targets.
- Cast time: on next melee swing; 6 s cooldown (Wowhead). Not interruptible.
- Cadence: emulators use 2–5 s first, then 5–10 s (cmangos) or 2–5 s (vmangos); DBM/BigWigs do not time it.
- Damage: normal weapon damage +50, Physical, melee range (5 yd). Anyone within cleave reach of her front takes a full melee hit.
- Debuff: none. Movement: none. Telegraph: none (instant on swing).

### Flame Breath
- Name: Flame Breath, spell 18435.
- Type: frontal cone (fire).
- Target rule: whatever is in front of her; aimed at her current target's direction (the tank).
- Cast time: 2 s (Wowhead, visible cast bar). Not interruptible.
- Cadence: Phase 1 and 3 only. Observed by DBM as a variance timer 9.7–35.6 s, first cast 11.3–28.5 s after pull; BigWigs puts a 13 s first bar and a 12 s repeat bar annotated "12-19". Emulators: 10–20 s (cmangos and vmangos), 10–15 s for the first after landing (vmangos).
- Damage: 3063–3937 Fire (Wowhead Classic tooltip); guides say "up to ~4000" (wiki, Warcraft Tavern), 3000–3500 (Amazon Basin). Range 45 yd; effect radius 45 yd; cone angle not in the data (unknown). The Talk page claims the hit area behaves like a straight line out of her head rather than a wide cone; the guides treat it as a wide cone that "extends to the sides".
- Debuff: none on players. Side effect: triggers Heated Blade DND 22904 (fires the Unfired Ancient Blade on the ground for Quel'Serrar).
- Movement: none. Telegraph: 2 s cast bar; animation of head rearing back.

### Wing Buffet
- Name: Wing Buffet, spell 18500.
- Type: frontal cone knockback.
- Target rule: all enemies in a cone in front of her (20 yd effect radius).
- Cast time: 1 s (Wowhead). Not interruptible.
- Cadence: DBM variance timer 17.8–32.4 s, first 11.3–24.5 s after pull. Emulators: first 10–20 s, then 15–30 s (both cmangos and vmangos). Only used while she has a melee-range target (vmangos).
- Damage: 563–937 Physical (Wowhead). WotLK remake: 21–24k and ignores armor (wiki tactics; not Era).
- Debuff: none.
- Movement: knockback, Wowhead Knock Back effect value 150 (misc 250); distance in yards not published. Guides: "knocks them back a small distance" (Icy Veins via search snippet), but far enough that a tank not backed against a wall ends up out of melee range.
- Threat: does NOT reduce threat (wiki Classic: "Unlike the Drakes in Blackwing Lair, Onyxia does not reduce her threat of targets she hits with this attack"; Warcraft Tavern; murphymuseltook). evilguild claims it "reduces tank aggro by 25%" which is most likely a conflation with Knock Away.
- Telegraph: 1 s cast bar; DBM announces it to tanks.

### Knock Away
- Name: Knock Away, spell 19633.
- Type: targeted knockback + threat reduction.
- Target rule: current target (the tank), 15 yd range.
- Cast time: instant. Not interruptible.
- Cadence: emulators: cmangos 20–30 s first then 25–40 s; vmangos 15–25 s first then 15–30 s, 10–20 s after landing. DBM only announces the target (no timer). Only used while she has a melee-range target (vmangos).
- Damage: normal weapon damage +30, Physical (Wowhead).
- Movement: knockback, Knock Back value 98 (misc 250), yards unknown. The tank is flung; if not backed against the wall this can land him in a side group (Amazon Basin) and she will turn toward whoever is now highest/closest.
- Threat: reduces the target's threat by 25% (wiki Classic, Warcraft Tavern, Millenium, vmangos script "reduces threat on the victim by 25%"). Implemented as the spell's Script Effect.
- Telegraph: none (instant); the tank sees the knockback.

### Tail Sweep
- Name: Tail Sweep, spell 15847.
- Type: tail (rear cone) knockback.
- Target rule: all enemies in a cone behind her, 30 yd range/effect radius.
- Cast time: instant. Not interruptible.
- Cadence: emulators: cmangos 15–20 s; vmangos 5 s after pull then every 3.5 s (effectively "always on" behind her). DBM only plays a sound when a player is hit. Real cadence unknown; treat the rear 30 yd cone as permanently lethal to positioning.
- Damage: 600–1000 Physical (Wowhead Classic). Community: ~300 (wiki Classic, Talk) or ~1000 (Amazon Basin). Low damage; the knockback is the danger.
- Movement: knockback, Knock Back value 150 (misc 300); the wiki Classic page says "sideways knockback", guides say "long/far". WotLK remake lists 30 yd knockback. The knockback can land a player in an egg pit, hatching 20+ whelps (wiki).
- Mechanic field on Wowhead reads "Stunned" (probably a brief stun on landing; duration unknown).
- Telegraph: none. Visual: tail swing.

### Fireball (Phase 2)
- Name: Fireball, spell 18392 (BigWigs: "Stage 2 Targetted Fireball threat wipe"). Older name in guides: Engulfing Flames.
- Type: targeted AoE (fire).
- Target rule: random player, or per 2006 research "follows her threat list" (wiki Classic). Only while she is hovering and stationary (vmangos).
- Cast time: 3 s (Wowhead; wiki Classic: 2–5 s between targeting and impact). Not interruptible. Unlimited range, ignores line of sight.
- Cadence: emulators: every 3–5 s (cmangos) or every 3 s while stationary, 5 s after a reposition, 10 s after a Deep Breath (vmangos). Wiki Classic: "stays in each position for five fireballs, then moves". WotLK remake: every 2 s (not Era).
- Damage: 1700–2300 Fire to all enemies within 8 yd of the impact point (Wowhead). Guides: up to 3000 on the primary target and half (1500) on splash targets (wiki Classic, Warcraft Tavern) — likely the pre-1.13 version or including the DoT; see Open questions.
- Debuff: Engulfing Flames 20019 (1500 Fire over 6 s + Confuse, "You're burning!") is the 2004–2005 effect; patch 1.3.0 removed the confuse ("Fireballs no longer confuse"), and 1.7.0 made the confuse unavoidable by movement (history, not current). Not seen in the Classic Era data chain; DBM/BigWigs track only 18392.
- Threat: wipes (−100%, vmangos) the threat of the targeted player (BigWigs "threat wipe", wiki Classic "research from November 2006 suggests", 2019 forum reports of an off-tank losing threat). This is why the Phase 3 pickup is hard; see Positioning.
- Telegraph: DBM/BigWigs scan her target on cast start and mark the target with raid icon 8 (skull) and a yell; 3 s to spread.

### Deep Breath (Phase 2)
- Name: Breath. Eight lane spells, one per flight position: 17086 (N→S), 18351 (S→N), 18576 (E→W), 18609 (W→E), 18564 (SE→NW), 18584 (NW→SE), 18596 (SW→NE), 18617 (NE→SW). Each chains into 0.25 s sub-spells (17087 → 17088 …) that step the hit area across the floor.
- Type: ground line AoE (fire), room-crossing.
- Target rule: everyone standing in the lane from her current position to the opposite position; no target selection.
- Cast time: 5 s on Classic Era (Wowhead 17086/18351; BigWigs comment "8s on Wrath, 5s on Classic Era"; DBM cast timer 5). Not interruptible. The emote "Onyxia takes in a deep breath..." fires at cast start, so the warning is 5 s before the breath starts moving; the breath then takes several more seconds to cross the room (chained 0.25 s casts; players in the middle "may be hit five or six times", wiki Classic).
- Cadence: random. Jeff Kaplan, June 2007: the trigger is "totally random" (wiki Classic). Models: cmangos rolls 1/3 breath, 1/3 clockwise, 1/3 counter-clockwise at each decision, first decision 25 s after liftoff, then 15–25 s after a move or 25 s after a breath; vmangos rolls 35% clockwise, 35% counter-clockwise, 30% breath (matches the Brady Games figure quoted on the Talk page), first decision 20 s after liftoff, then 15–25 s after a move or 20–25 s after a breath. Wiki: "stays in each position for five fireballs, then moves". A fast raid can see zero breaths in Phase 2 (Warcraft Tavern). DBM note: in Season of Discovery the first Deep Breath is on a fixed timer 29.1 s after the Phase 2 yell (not Era).
- Damage: 1275 Fire per sub-spell tick, 30 yd effect radius per tick (Wowhead). Guides: ~5000 total if caught (Amazon Basin), "will kill most people in the middle". WotLK remake: 18 yd wide line, 6375–8625 (not Era).
- Lane geometry: 8 positions around the room edge (N, NE, E, SE, S, SW, W, NW; Wowhead guide and cmangos/vmangos coordinates). She breathes from her current position toward the opposite position (+4 mod 8) and flies there during/after the breath at ~2.3x her normal flight speed (vmangos 3.0 vs 1.2857). Safe spots are the two positions adjacent to her (if she is at a corner, the two neighbouring sides; if at a side, the two neighbouring corners) (wiki Classic). The Talk page notes she was never seen stopping over the two whelp caves (E and W), i.e. effectively 6 positions in practice; both emulators use 8.
- Visual: she turns to face the destination, rises, Heated Ground 22191/22197 (413 Fire per second for 4 s, 13 yd) is placed under her start position (vmangos), then a wall of flame travels along the lane.
- Movement effect: none (pure damage).

### Whelp summons (Phase 2, minor in Phase 3)
- See Adds. Spell IDs 20171/20172 (cmangos, commented out) / 17646 (vmangos, commented out); the emulators spawn whelps directly. Not a player-visible cast.

### Bellowing Roar (Phase 3)
- Name: Bellowing Roar, spell 18431.
- Type: AoE fear (room).
- Target rule: all players within 100 yd (the whole room).
- Cast time: 1.5 s (Wowhead Classic). WotLK remake 2.5 s (not Era). Not interruptible.
- Cadence: first cast immediately on landing (wiki tactics; cmangos 0 s; vmangos 10 s after landing), then random. Guides: 10–30 s apart (wiki Classic, Warcraft Tavern, murphymuseltook). DBM observed variance timer 9.7–58.3 s. Epog says "every 30 s". Emulators: 15–45 s (cmangos), 15–30 s (vmangos).
- Debuff: Fear (mechanic Fleeing), 3 s (Wowhead; also wiki tactics "fears all enemies for 3 sec"). Not dispellable by Magic dispel (dispel type n/a); broken by Fear Ward (prevents), Tremor Totem (pulses off), Berserker Rage, Will of the Forsaken, PvP trinket / Insignia, Death Wish, Divine Shield. Amazon Basin (2005) claims Tremor Totem did not work; all 2019+ guides say it does.
- Second effect: Activate Object within 13 yd (Wowhead effect #2) — this is what wakes the lava cracks (see Eruption).
- Telegraph: cast bar (1.5 s) and "screen shakes beforehand" (wiki Classic; Amazon Basin: "the ground shakes for about 3 seconds, then lava jets erupt"). DBM special warning "fear soon" on cast start.
- Danger: a feared tank runs; she follows him and turns, pointing Flame Breath/Cleave at a side group; a feared player who runs into an egg pit hatches 20+ whelps.

### Eruption / lava cracks (Phase 3)
- Name: Eruption. Spell ID for Onyxia's cracks not confirmed; Wowhead Classic's only "Eruption" is 17731 (1313 Fire, 5 yd radius, instant; SoD 40 value 1501) listed as used by Magmakin in Molten Core, so Onyxia's cracks probably cast a related or object-owned spell. Not in cmangos/vmangos scripts at all (vmangos has an unused `m_bEruptPhase`).
- Type: ground hazard (fire), gameobjects on the floor cracks across the whole room.
- Target rule: anyone standing on or crossing an active crack.
- Cast time: instant; the cracks "pulse every several seconds" after a fear (Wowhead guide) / "erupt for a few seconds" (murphymuseltook).
- Cadence: activated after each Bellowing Roar (wiki Classic: "Lava Crack Eruptions activate after each fear"; Bellowing Roar's Activate Object effect). Not continuous outside the fear window.
- Damage: ~1500 unresisted Fire per hit (wiki Classic, Talk, Warcraft Tavern); ~1200 for crossing a crack while feared (Amazon Basin). 5 yd radius if 17731 is representative.
- Debuff: none. Movement: none. Telegraph: visible cracks in the floor glow/emit; fear comes first.
- Note: a chain-fear rumour (lava spurts re-fearing) is disputed and unconfirmed (Talk page).

### Teleport / leash (passive)
- Type: teleport. Players more than ~90 yd from her (or outside the room while she flies) are teleported to the room centre (vmangos coordinates −12.87, −216.63, −88.06; Warcraft Tavern "teleports players back to her if they run too far"). If dragged out past the tunnel she yells "You seek to lure me from my clutch?..." and evades.

### Taunt immunity (passive)
- Immune to Taunt, Challenging Shout, Mocking Blow (wiki, forums). Growl untested in sources. All threat-generating abilities work. No tank swap is possible; threat order is everything.

## Adds

### Onyxian Whelp (NPC 11262)
- Level 56–57 (warcraftdb) / 56–60 (Wowhead), HP 2,699–2,784 (warcraftdb Classic), 3,052 in SoD 40. Abilities: Pyroblast 20228 (instant, 40 yd, Fire) and Teleport to Player 21543. Melee hits are weak; the danger is numbers and fire damage on cloth.
- Spawns:
  - Phase 2 start: a large wave from each of the two egg pits (east and west tunnels off the main chamber; coordinates −30.1/−254.5 and −30.8/−177.1 in both emulators). Size: 20 total, 2 per 1–2.5 s tick (cmangos); 16 total, 2 per 1 s (vmangos); "about a dozen from each pit" (Amazon Basin, 2005); WotLK remake 2 packs of 20. Begins ~3.5–5 s after liftoff.
  - Phase 2 ongoing: smaller waves. 4–10 every ~90 s (cmangos); 5–7 every 30 s (vmangos); "waves of 3–4" (Amazon Basin); DBM has a disabled 105 s whelp timer and disabled 60/70 s warnings from early Classic testing.
  - Phase 3: rare singles/small groups, 1 whelp every 1–10 s (vmangos), "about five, usually early in the phase" (wiki Classic), 120 s lifetime (vmangos).
  - Any time: a player entering a nest or knocked/feared into one hatches eggs, ~20+ whelps (wiki Classic). Eggs line the sides of the chamber and the pits.
- Who picks them up: the two "whelp groups" (commonly groups 7 and 8: a warrior each with Challenging Shout, a mage each with Arcane Explosion/Blizzard, 1–2 healers) stationed at the pit mouths in Phase 2 (Warcraft Tavern, wiki Classic, Amazon Basin). Whelps die to AoE within seconds; they do not despawn on their own during the fight (vmangos: 300 s lifetime in P2, i.e. effectively permanent). Whelps despawn on Onyxia's evade/wipe.

### Onyxian Warder (NPC 12129)
- Level 60–63 elite black dragonspawn, HP 76,300–83,275 (warcraftdb; SoD 106,821). Four in the entrance tunnel before the chamber; one does not patrol and can be skipped (Amazon Basin) though most raids kill all four.
- Abilities: Cleave 19983 (next melee, +50, 10 targets), Pierce Armor 12097 (−75% armor for 20 s on the tank), Flame Lash 18958 (56–64 Fire + −20 Fire resistance for 45 s, Magic, stacks; BigWigs warns at 2 stacks), Fire Nova (self-centred, ~10 yd, ~1000 Fire in 2005 gear; spell ID not confirmed, 20602 is not it).
- Behaviour: respawn in the tunnel while Onyxia is in combat (patch 1.3.0; wiki Classic says they appear immediately when the fight starts) and despawn when she dies. They do not enter the chamber unless pulled; a wipe means re-clearing. In SoD one is summoned into the fight at Phase 2 (BigWigs 364849; wiki "Seasons of Mastery: an Onyxian Warder enters at the start of Phase 2").
- Pull rule: one at a time, tank only in Fire Nova range, melee engage after the first nova, dispel Flame Lash.

### Onyxian Drake (NPC 12260, level 61–62 elite)
- Seasons of Mastery only: two drakes spawn on pull (wiki Classic). Not in Era.

## Positioning and movement

Room: the main chamber is a wide oval; the entrance tunnel is at the south, the far ("back"/north) wall opposite, and two whelp caves/egg pits open off the east and west sides, with egg clusters also along the walls. Two mounds ("the two humps") sit near the entrance (Amazon Basin). Compass names are the community's (Wowhead guide: N, NE, E, SE, S, SW, W, NW flight positions).

- Tank:
  - Pull: the main tank runs in first and past her so that she turns to face the back (north) wall, then backs up against the wall "a few steps in front of it" (wiki Classic, Warcraft Tavern, Epog). Back to the wall limits Wing Buffet/Knock Away knockback so he stays in melee and keeps her pointed away from the raid. The raid enters 2–3 s after the tank and does nothing until she is parked.
  - Facing: her head toward the north wall, tail toward the entrance (Wowhead guide: "tail toward the entrance"). Melee cones (Cleave, Flame Breath, Wing Buffet) then hit only the tank; the tail cone points at the empty entrance side.
  - Never: move her once parked; stand off the wall; let anyone else be in front; let her be in front of an egg pit (Tail Sweep then throws people into eggs).
  - Phase 2: the main tank has nothing to tank; he joins a whelp pit group, builds rage on whelps, and stands under her near the landing area as 40% approaches to Sunder/Heroic Strike the instant she lands (wiki Classic, Talk, US forum). One warrior can also Sunder her while flying by standing directly under her (Amazon Basin).
  - Phase 3: she lands roughly centre/south (vmangos: at X ≈ −8.9 or −59.9 depending on where she was). The tank picks her up and walks her back to the north-wall spot facing the wall before any DPS resumes. Tanks "cannot build threat while moving" (Almar's) so this takes 5–15 s done well, 30–60 s done badly (US forum).
  - Tank-swap rules: none possible (taunt immune). If the main tank dies he cannot regain her; the designated second tank must be #2 on threat from Phase 1.
- Melee DPS:
  - Stand at her flanks, roughly at the shoulder/front leg, never in front (Cleave/Flame Breath/Wing Buffet) and never behind the hips (Tail Sweep 30 yd rear cone). "Too close to the head means Cleave; too close to the tail means Tail Sweep" (wiki tactics). Split odd groups left (west), even groups right (east) (Warcraft Tavern, Amazon Basin).
  - Phase 2: cannot hit her in the air with normal swings (special attacks can, wiki Classic). Melee go to the pits and kill whelps, or help on Warders if pulled; never chase her.
  - Phase 3: back to the flanks only after the tank has parked her again. Stay forward of her tail at all times (wiki Classic).
- Ranged DPS:
  - Phase 1: along the north wall in the NE and NW pockets, spread, max range from her head, out of the tail cone. Hunters historically on "the two humps" near the entrance for max range (Amazon Basin) — but only if clear of the tail cone and egg pits.
  - Phase 2: spread at least 8 yd apart (Fireball splash radius) in the middle/sides of the room; stay off the head-to-tail axis of wherever she is hovering; on the Deep Breath emote move to the side of the room adjacent to her position (not the centre, not the far end). A hunter with Track Dragonkin calls her position and facing (Warcraft Tavern, evilguild). Pre-decide who is on whelps versus the boss (Epog).
  - Phase 3: ranged may use the centre of the room but off the cracks (wiki Classic); everyone except hunters runs to the north sides as she lands (Amazon Basin).
- Healers:
  - Phase 1: with their groups along the wall; tank healers (3 pairs of priests rotating in 2005; 4–6 dedicated in modern gear) within range of the tank, out of the frontal cone. Dispel duties: none on the boss (no dispellable debuffs in Era); Flame Lash on Warders.
  - Phase 2: spread 8 yd; triage Fireball targets (1700–2300 + splash) and whelp-group damage; a healer or two per pit group.
  - Phase 3: stand with backs to a wall so a fear runs you into the wall rather than across cracks or into a pit (Amazon Basin); pre-shield the tank before each roar; Fear Ward on the tank from a dwarf priest; Tremor Totem by the tank.
- Whole raid:
  - Stacking points: north wall left/right pockets (P1/P3). Run-out points: the two side walls adjacent to her flight position (P2 Deep Breath). Never: the egg pits, the room centre during a breath, anywhere behind her.
  - Line of sight: none needed; Fireball ignores LoS.
  - Position callouts: many raids use "Upper Left / Upper Right / Lower Left / Lower Right" rather than compass points, and assign a non-raid-leader caller (Almar's).

## What each role must do and must not do

- Tank:
  1. Pull first, drag her to the north wall, back against it, face her at the wall. Do not let DPS start until she is parked (2–4 s).
  2. Build threat for the first ~30–60 s or until ~99% before any real DPS starts (2005 practice: only the tank attacks for a minute; 2019+: DPS hold 3–4 s then stay below him). You lose 25% of your threat on every Knock Away.
  3. Never step off the wall; after a Knock Away/Wing Buffet reposition instantly so she does not turn.
  4. Before 65%: get Shield Wall/Last Stand ready for the last melee hits; she walks away at 65% so do not chase.
  5. Phase 2: tank whelps at a pit to farm rage; at ~43% go to the landing area (she lands near the centre) with full rage; Sunder/Heroic Strike/Revenge the instant she is targetable. A Phase 2 Fireball on you wipes your threat, so stay spread and do not be the only ranged body near her.
  6. Phase 3: walk her back to the wall; Fear Ward before the first roar (it is cast on landing); Berserker Rage on the roar cast bar; call "DPS go" only when parked.
  7. Cooldowns: Shield Wall for the roar windows (she is unfeared and still swings); Last Stand if a Flame Breath + melee overlap. Nothing to interrupt.
- DPS:
  1. Phase 1: no DoTs or burst in the first seconds; hunters Feign Death and rogues Feint/Vanish as needed; nobody may pass the tank. Hunters and rogues can attack throughout because they can dump threat (Wowhead overview comment).
  2. Phase 1 to 2: stop at ~66% if you want her to take off facing the wall; do not get tail-swept while she walks south.
  3. Phase 2: full burn (ranged and DoT classes) — this is the DPS phase; AoE classes kill whelps first (overlapping whelps with a Deep Breath is the wipe scenario, Epog). Spread 8 yd. On "Onyxia takes in a deep breath..." stop casting and move to the adjacent side; you have 5 s before the breath starts and a few more before it reaches your lane position.
  4. Phase 2 to 3: casters stop at 41–44% (murphymuseltook) / 42–45% (2019 forums), including DoT refreshes; hunters Feign Death and rogues Vanish as she lands; nobody attacks until the tank calls it. Do not single-target whelps the tank is using for rage (Almar's).
  5. Phase 3: all cooldowns, Bloodlust/Lust-equivalents at 35% (Epog); shorten the phase to limit roars. If you resist a fear, do not attack and run to the tank spot (she goes for unfeared targets first, wiki Classic). Avoid cracks for ~5 s after each roar.
  6. Dispel/decurse: none on the boss. Warder Flame Lash (Magic) is the only dispel in the raid.
- Healer:
  1. Phase 1: tank spike = Flame Breath (3063–3937) + melee + Cleave inside 2 s; pre-shield/pre-cast when the Flame Breath bar appears (DBM: next one 9.7–35.6 s after the last). Big heals generate big threat only on your own table, not an issue while the tank is far ahead; but in the first 10 s of the pull heal small.
  2. Phase 2: pre-spread; the Fireball target takes 1700–2300 and loses threat (irrelevant for healers). Keep the whelp warriors alive (20 whelps at once is a real spike on a warrior with Challenging Shout).
  3. Phase 3: Fear Ward on the tank (dwarf priest), Tremor Totem at the tank, PW:S on the tank before each roar; everyone else can be feared and will take ~1500 per crack crossed; expect 2–4 raid-wide ~1500 hits per roar. At 5% all healing goes to the tank (Amazon Basin). Back to a wall before the roar so the fear path is short.

## Timeline of a typical pull
(Phase lengths depend on raid DPS: a 2019 Classic raid took ~3–4 minutes for Phase 1 (evilguild) and a few minutes in the air; Anniversary/Era raids with world buffs kill her in roughly 2–4 minutes total, so the whole script below compresses. Ability offsets are the observed DBM/BigWigs/emulator values.)

- t=−60 to 0: tunnel cleared of 4 Warders one at a time; raid stacked at the tunnel mouth; Fear Wards up; fire protection potions ready.
- t=0: main tank runs in; she yells "How fortuitous..."; she turns to follow him to the north wall; raid walks in 2–3 s later and splits odd/even to the NW/NE pockets.
- t≈3–5: she is parked facing the wall. Cleave begins immediately (every ~2–10 s, 6 s cooldown). Tail Sweep sweeps the rear cone from ~5 s and roughly every few seconds thereafter (emulator estimate).
- t≈11–28: first Flame Breath (DBM 11.3–28.5; BigWigs bar 13), then every 9.7–35.6 s (typically 12–19 s). First Wing Buffet at 11–24 s, then every 17.8–32.4 s. First Knock Away ~15–30 s, then every 15–40 s (tank loses 25% threat each time).
- t≈5–30: tank-only or light DPS window; ranged open up once the tank is clearly ahead.
- 65% (t≈60–180 depending on DPS): yell "This meaningless exertion bores me. I'll incinerate you all from above!"; she stops attacking, walks to the south end, lifts off, flies to the north position. Everyone stops standing behind her path, spreads 8 yd.
- Liftoff +3.5 to +5 s: first whelp wave begins pouring from both pits (16–20 whelps over ~10–20 s). Whelp groups at the pit mouths; mages AoE.
- Liftoff +≈5–10 s: first Fireball (3 s cast, 1700–2300 in 8 yd, target's threat wiped); then one every ~3–5 s while she is stationary.
- Liftoff +20–25 s: first reposition decision; each decision is roughly 1/3 clockwise, 1/3 counter-clockwise, 1/3 Deep Breath (or 35/35/30). Repositions every 15–25 s; a breath costs her ~25 s. After the emote "Onyxia takes in a deep breath..." there are 5 s before the flame wall starts from her position toward the opposite side; players in the lane move to an adjacent side.
- Liftoff +30 to +90 s: second whelp wave (5–7 per vmangos, 4–10 per cmangos; 30 s vs 90 s gaps). In a fast raid Phase 2 lasts 45–90 s and may contain zero breaths; in a slow raid expect 1–3 breaths and 2–3 waves.
- 40%: yell "It seems you'll need another lesson, mortals!"; she stops casting, flies to the landing spot near the room centre (slightly south or south-west), lands ~3–5 s later. DPS stopped at 42–45%. Hunters FD, rogues Vanish.
- Landing +0 to +10 s: Bellowing Roar (1.5 s cast, 3 s fear on everyone within 100 yd); lava cracks pulse for a few seconds after it (~1500 per hit). Tank Fear Warded/Berserker Rage; he Sunders and walks her back to the north wall. Cleave 2–5 s after landing; Flame Breath 10–20 s after; Knock Away 10–20 s after; Wing Buffet 10–20 s after (emulator resets).
- Landing +5 to +60 s: DPS resume only when she is parked and the tank calls it (5–15 s if clean, 30–60 s if messy).
- Phase 3 steady state: Bellowing Roar every ~10–30 s (DBM observed 9.7–58.3), each followed by crack eruptions; occasional single whelps from the pits picked up by an off-tank; Phase 1 abilities on their Phase 1 cadences. All cooldowns; lust at 35%. Typically 60–120 s to the kill.
- Kill: Head of Onyxia, Warders in the tunnel despawn.

## Open questions
- Onyxia's Era HP: 1,099,230 (classic.warcraftdb.com, 1.13 data, level 63) vs 665,000 (evilguild) vs "1.8 million" (PC Gamer headline, unsourced) vs 5,006,493 (Wowhead, Season of Discovery 40 only). Wowhead Classic no longer shows a non-seasonal value through the proxy. The 2005 hotfix "HP increased" (wiki) means pre-June-2005 numbers like 665k may be real but obsolete. Use 1,099,230 as the working number.
- Flame Breath shape: wiki/guides say a wide frontal cone extending to the sides; the Talk page says it is a straight line out of her head, not a cone. Cone angle not published anywhere; Wowhead gives only a 45 yd effect radius.
- Fireball damage: Wowhead Classic 1700–2300 in an 8 yd area with no primary/splash split vs guides "up to 3000 primary, 1500 splash" (wiki Classic, Warcraft Tavern). The guides may be describing the 2005 Engulfing Flames DoT version (1500 over 6 s, spell 20019) stacked on the hit.
- Fireball targeting: "random player" (most guides) vs "follows her threat list" (wiki Classic, 2006 research) vs "top-threat targets" (Warcraft Tavern "high-threat target"). Threat wipe: full wipe (vmangos, BigWigs) vs "reduces threat" per hit (US forum) vs "only the lowest-threat splash victim is reset" (one forum claim). All agree a tank hit by it is in trouble.
- Phase 3 landing threat: she "lands aggroed on whoever did the most Phase 2 damage" (Epog) vs "resets most aggro" (Almar's) vs vmangos `DoResetThreat()` on landing vs 2019 forum posters reporting "no reset, she just has whoever is left highest after fireball wipes" and "she runs to 5–6 random people". The 10/25 remake explicitly does not drop threat (wiki tactics), which is why some guides say the tank keeps aggro. For a sim: model a threat reset on landing plus Fireball wipes during Phase 2.
- Deep Breath selection odds: 1/3 each (cmangos) vs 35/35/30 (vmangos, Brady Games via Talk) vs purely "random" (Kaplan). Number of stop positions: 8 (Wowhead guide, both emulators) vs 6 (wiki Classic "six positions", Talk: never seen over the whelp caves).
- Deep Breath width: Classic wiki "fiery trail about 10 yd wide" (said of the remake on the tactics page? no, the Classic page says nothing about width); WotLK remake 18 yd wide line; Wowhead per-tick radius 30 yd. Treat the lethal lane as ~20–30 yd wide centred on the line between opposite positions.
- Deep Breath per-tick damage 1275 (Wowhead) and how many ticks a stationary player takes (wiki: "five or six times" in the middle) vs Amazon Basin "~5000 total".
- Bellowing Roar cast time 1.5 s (Wowhead Classic) vs 2.5 s (wiki tactics, remake). Cadence 10–30 s (guides) vs 9.7–58.3 observed range (DBM) vs "every 30 s" (Epog) vs 15–45 (cmangos) vs 15–30 (vmangos). Whether the first roar is at landing (cmangos, wiki tactics) or ~10 s after (vmangos).
- Eruption spell: the cracks' spell ID is unknown; 17731 is tagged to Magmakin. Damage ~1500 (wiki, Warcraft Tavern) vs ~1200 crossing (Amazon Basin) vs 1313 (17731). Duration of the eruption window after a fear ("a few seconds", "pulses every several seconds") is not quantified.
- Tail Sweep damage 600–1000 (Wowhead) vs ~300 (wiki Classic, Talk) vs ~1000 (Amazon Basin); cadence 15–20 s (cmangos) vs 3.5 s (vmangos) vs unknown; knockback distance in yards not published (remake: 30 yd); a "Stunned" mechanic flag with unknown duration.
- Wing Buffet and Knock Away knockback distances in yards: not published (raw Knock Back values 150 and 98). Wing Buffet threat: no change (wiki, Warcraft Tavern) vs −25% (evilguild).
- Whelp wave sizes and gaps: 20 then 4–10 every ~90 s (cmangos) vs 16 then 5–7 every 30 s (vmangos) vs "about a dozen per pit then 3–4" (2005) vs 2×20 every 90 s (remake). Phase 3 whelp rate: "about five, early" (wiki) vs 1 per 1–10 s (vmangos).
- Melee swing damage and swing timer on a level-60 tank: only the 2005 "~700" figure. Her armor and attack speed are not in any fetched source.
- Warder Fire Nova spell ID and damage (only "~1000" from 2005 and "~10 yd radius" from the remake page).
- Lockout/reset timer: not stated in the fetched raid overview (community knowledge: 5-day reset in Era, 7-day on some later realms); not verified here.
- Warcraft Logs: no report was fetchable (JS-only), so no real Era cadence distribution for Bellowing Roar/Deep Breath was recorded beyond the DBM variance timers, which are derived from log analysis by the DBM authors.
