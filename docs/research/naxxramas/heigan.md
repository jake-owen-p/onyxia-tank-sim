# Heigan the Unclean (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Heigan_the_Unclean_(Classic) — Classic 40-man page: HP 1,780,000; 135 s cycle (Phase 1 = 90 s, Phase 2 = 45 s); Eruption 3,500–4,500 unresistable Nature; Decrepit Fever (-50% max HP, 500 Nature per 3 s, 20 yd, melee only, Phase 1 only, cleansable); AoE Mana Burn (Shadow damage = mana drained, not used in Phase 2); Teleport of 3 players to the Eye Stalk tunnel (poison cloud 4,000 per 3 s during the dance; Eye Stalk casts Mind Flay); safe-zone order 1,2,3,4,3,2,1,2…, resets to zone 1 at each phase change; platform safe in Phase 1, must be empty in Phase 2; aggro does not reset; quotes.
- https://trinitycore.net/d3/d91/boss__heigan_8cpp_source — TrinityCore boss script (Wrath-era emulation, same encounter design): Eruption every 10 s in the fight phase and every 3 s in the dance phase; dance starts at 90 s and lasts 45 s; 4 sections (15/25/23/13 eruption tiles); safe section sequence 0,1,2,3,2,1,0…, reset at each phase change; Decrepit Fever first 10–20 s then every 20–25 s; Spell Disruption (29310) first 15–20 s then every 11 s; after the dance: Disruption 10–25 s, Fever 15–20 s, next dance 90 s; spell IDs 29998 / 29310 / 29350 / 30211 / 29371.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/PlagueQuarter/Heigan.lua — DBM Classic timers: teleport (dance) every 90.6 s; dance 45 s; Phase 1 eruptions start 16.5 s after pull then every 10 s (8 waves tracked); Phase 2 eruptions start 4.6 s after the teleport then every 3 s; Decrepit Fever first 11.3–25.9 s then 21–34 s, 3.4–10 s after the dance ends; zone counter 1→4→1 ping-pong; creature cooldown spell 29429 restarts the 10 s cadence.
- https://www.wowhead.com/classic/guide/heigan-the-unclean-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: Phase 1 90 s / Phase 2 45 s; mana users on the platform in Phase 1; Decrepit Fever disease on melee/tanks; short-range Mana Burn; Teleport never targets the top-threat player; Eruption channelled 45 s; bat tunnel and eye-stalk tunnel trash; tank repositions Heigan each safe spot for melee.
- https://www.wowhead.com/classic/spell=29371/eruption — Eruption: instant, 3,500 Nature (effect value), unlimited range, ignores LoS.
- https://www.wowhead.com/classic/spell=29998/decrepit-fever — Decrepit Fever: instant, Disease dispel, 21 s, -50% max health, 500 Nature every 3 s, 20 yd radius.
- https://www.wowhead.com/classic/spell=29310/mana-burn — Heigan's Mana Burn ("Spell Disruption" in TrinityCore): instant, 40 yd range, 25 yd radius, 15 s cooldown, burns 2,313 mana and deals 1 damage per mana burned (Shadow).
- https://www.wowhead.com/classic/spell=30211/teleport-self — Heigan's own teleport to the platform (Phase 2 start).
- https://classicdb.ch/?npc=15936 — Heigan: 1,762,431 HP, melee 8,475–9,727, armor 4,691.
- https://classicdb.ch/?npc=16236 — Eye Stalk: level 61, 19,500 HP, melee 4,028–4,098.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: 135 s cycle; safe-spot descriptions (zone 1 = left of the room facing the podium … zone 4 = right of the podium), cycle 1→4 then backwards; mana users on the podium; priests/paladins cleanse Decrepit Fever; teleported players must get back before Phase 2.
- https://www.tentonhammer.com/guides/3-2-heigan-the-unclean-naxxramas — 2006 guide: Phase 2 ~45 s; ~4,000 unresistable Nature per eruption; Decrepit Fever numbers; tunnel Eye Stalks/grubs.

## Overview
- Level ?? boss, Undead. HP 1,780,000 (wiki) / 1,762,431 (classicdb.ch). No enrage timer documented; the fight is survivable indefinitely with perfect dancing, limited by mana/consumables. Second boss of the Plague Wing (after the bat tunnel), required.
- Phases: a fixed 135-second loop. Phase 1 ("fight", 90 s): Heigan on the floor, tanked and DPS'd; slow eruptions (every 10 s) walk across the floor; Decrepit Fever and Mana Burn active. Phase 2 ("dance", 45 s): Heigan teleports onto his platform and channels Plague Cloud; eruptions every 3 s; no other abilities; the platform is lethal; everyone dances through the four safe zones. Then Phase 1 again (eruptions resume 15 s later per TrinityCore; DBM restarts the 10 s cadence).
- Raid-size assumptions: 40-man Classic Era; one tank; mana users on the platform in Phase 1.

## Abilities

### Eruption (the dance)
- Name: Eruption (29371), triggered by floor trap objects in 4 sections
- Type: ground hazard (floor sections erupt)
- Target rule: everyone standing in the three erupting sections (all sections except the current safe one) takes the hit; unlimited range, ignores LoS.
- Cast time: instant per section.
- Cooldown or cadence: Phase 1: every 10 s (TrinityCore; DBM: first eruption 16.5 s after pull, then every 10 s). Phase 2: every 3 s (TrinityCore; DBM: first 4.6 s after the teleport, then every 3 s → ~14–15 eruptions in 45 s).
- Damage: 3,500 Nature (effect value; wiki 3,500–4,500; TTH ~4,000), unresistable.
- Pattern: the room floor (in front of the platform) is divided into 4 sections side by side; the safe section moves 1→2→3→4→3→2→1→2… one step per eruption, and resets to section 1 at every phase change (wiki, TrinityCore, DBM). Facing the platform, section 1 is on the left and section 4 on the right (Warcraft Tavern). In Phase 1 the raised platform is also safe; in Phase 2 standing on the platform is lethal (Plague Cloud / "heavy-damage disease DoT" — wiki).
- Movement: none, but players must relocate every 3 s in Phase 2 (only a few steps between adjacent sections — wiki: "deaths come from running too far; between 3 and 4 only a few steps are needed").
- Telegraph: eruption visual in the three non-safe sections, i.e. the previous eruption tells you where you are; DBM counts the zone. Phase 2 start is telegraphed by Heigan teleporting to the platform and yelling "The end is upon you."

### Decrepit Fever
- Name: Decrepit Fever (29998)
- Type: AoE debuff around Heigan
- Target rule: all players within 20 yd of Heigan (melee and tank). Phase 1 only.
- Cast time: instant.
- Cooldown or cadence: DBM: first 11.3–25.9 s after pull, then 21–34 s; 3.4–10 s after a dance ends. TrinityCore: 10–20 s first, then 20–25 s.
- Damage: 500 Nature every 3 s.
- Debuff: Decrepit Fever — Disease, 21 s, -50% maximum health, dispellable (Abolish/Cure Disease, Cleanse, Disease Cleansing Totem). Does not spread.
- Telegraph: none; DBM announce/dispel warning.

### Mana Burn / Spell Disruption
- Name: Mana Burn (29310; TrinityCore names the constant Spell Disruption)
- Type: AoE mana burn around a target
- Target rule: mana users within 25 yd of the target point (range 40 yd). Guides: "all nearby targets"; avoided entirely by keeping mana users on the platform and Heigan off it.
- Cast time: instant; 15 s spell cooldown.
- Cadence: TrinityCore: first 15–20 s, then every 11 s during Phase 1; 10–25 s after a dance. Not used in Phase 2 (wiki).
- Damage: burns 2,313 mana and deals 1 Shadow damage per point of mana burned (up to ~2,313).
- Debuff: none. Telegraph: none.

### Teleport (players to the Eye Stalk tunnel)
- Name: Teleport (player-facing spell ID unknown; Heigan's own platform teleport is 30211 "Teleport Self")
- Type: teleport
- Target rule: 3 players (wiki) — never the player highest on threat (Wowhead). Periodic during Phase 1; cadence unknown.
- Effect: victims appear at the start of the Eye Stalk tunnel behind Heigan's room and must run back to the room before the dance starts (the tunnel fills with a poison cloud dealing 4,000 damage every 3 s during Phase 2 — wiki). Eye Stalks in the tunnel cast Mind Flay (26143) and must be killed; Rotting/Diseased Maggots are slow melee that can be kited out.
- Telegraph: none.

### Plague Cloud / Teleport Self (Phase 2 start)
- Name: Teleport Self (30211) + Plague Cloud (29350)
- Type: teleport + channelled platform hazard
- Cadence: 90.6 s after pull and 90.6 s after each dance ends (DBM); channel lasts 45 s (DBM timerDance). Nothing else is cast during the channel.
- Effect: Heigan stands on the platform; anyone on the platform takes heavy disease damage (wiki); eruptions accelerate to every 3 s.

## Adds
- No adds in the room. Eye Stalk (16236; level 61, 19,500 HP per classicdb vs "500 HP" on the wiki) and maggots exist only in the teleport tunnel and fight teleported players. Trash in the bat tunnel before the room (Plagued Bat, Frenzied Bat, Mutated Grub, Plague Beast) respawns every 30 s (Plague Beast 4 min) — Wowhead guide.

## Positioning and movement
- Tank: pull Heigan down off the platform onto the open floor and keep him away from the platform so his Mana Burn (25 yd) cannot reach the casters. During Phase 1 move him with the safe section every 10 s (TrinityCore cadence) — stand in the current safe section and place him so melee can hit him from inside the safe section (Wowhead, wiki "blue dots"). Phase 2: he teleports away; the tank dances with everyone else. Aggro does not reset between phases (wiki) — nothing to re-taunt. Never park him within 25 yd of the platform; never drag melee through an erupting section.
- Melee DPS: on Heigan in Phase 1, moving with the tank section to section; expect Decrepit Fever (cleanse) ; in Phase 2 dance (1→4→1, one step per 3 s) and resume when he lands. Ranged can keep hitting him from the floor during the dance while moving (WT).
- Ranged DPS: Phase 1 on the platform ("red square", safe from eruptions, out of Mana Burn range). Phase 2: step down into section 1 as he teleports up (DBM: first eruption 4.6 s after the teleport) and dance; get off the platform before the Plague Cloud.
- Healers: same as ranged (platform in Phase 1). Keep Decrepit Fever cleansed (priests/paladins/shamans/druids). Heavy healing on teleported players running through the tunnel. In Phase 2 no healing targets except eruption victims — mostly dance and keep yourself alive.
- Whole raid: section 1 is at the left wall when facing the platform; move at your own pace — "latency makes other players appear in the wrong spot" (wiki). Teleported players run back before 90 s. Avoid the "safe spot beside the platform" (considered an exploit, hotfixed — wiki, Blizzard forum).

## What each role must do and must not do
- Tank:
  1. Drag Heigan off and away from the platform at the pull; keep him > 25 yd from the casters.
  2. Reposition him into each new safe section every 10 s in Phase 1 so melee can keep uptime without standing in slime.
  3. Get Decrepit Fever cleansed; your max HP is halved while it is up.
  4. In Phase 2 just dance; no taunt needed afterwards (no threat reset).
- DPS:
  1. Melee: DPS only from the safe section; prioritise your own position over uptime (Wowhead).
  2. Ranged: platform in Phase 1; dance in Phase 2; you may keep casting instants/DoTs while moving.
  3. Nothing to interrupt. Teleported players: kill Eye Stalks (Mind Flay), kite maggots, run back before the dance.
  4. Do not stand on the platform in Phase 2.
- Healer:
  1. Cleanse Decrepit Fever on melee/tank immediately (21 s disease, -50% max HP, 500 per 3 s).
  2. Stay on the platform in Phase 1 (Mana Burn 2,313 mana + equal damage).
  3. Top up eruption victims (3,500–4,500 unresistable) and runners in the tunnel.
  4. Pre-HoT the tank before Phase 2 ends (he re-engages the tank instantly).

## Timeline of a typical pull
- t=0: Pull on the platform; tank drags him to the floor; casters/healers climb onto the platform.
- t≈11–26 s: first Decrepit Fever on melee; t≈15–20 s: first Mana Burn (then every ~11 s); t≈16.5 s: first Phase 1 eruption, then every 10 s (safe section 1→2→3→4→3→2→1…), tank moves him each time. Periodic Teleport of 3 non-tank players to the tunnel.
- t≈90 s: Heigan teleports to the platform ("The end is upon you."). Everyone off the platform into section 1. t≈94.6 s first dance eruption, then every 3 s: safe section 1,2,3,4,3,2,1,2,3,4,3,2,1,2,3 (≈15 eruptions).
- t≈135 s: dance ends; he returns to the top-threat target; Fever 3–10 s later; eruptions resume (DBM restarts the 10 s cadence; TrinityCore 15 s); next dance at t≈225 s.
- Repeat every 135 s until dead. Kill speed depends only on uptime; a well-geared raid gets him to ~20% before the first dance (wiki level-70 note).

## Open questions
- Phase 1 eruption cadence: 10 s (TrinityCore, DBM) — DBM stops tracking after 8 waves (t≈86.5 s), consistent with the 90 s phase; after a dance TrinityCore waits 15 s, DBM restarts on a creature cooldown spell (29429).
- Eruption damage: 3,500 flat (spell effect) vs 3,500–4,500 (wiki) vs ~4,000 (TTH).
- Decrepit Fever cadence: DBM 21–34 s vs TrinityCore 20–25 s; duration 21 s (spell) vs the wiki's unspecified.
- Mana Burn: spell data 2,313 mana / 25 yd radius / 15 s CD; TrinityCore repeats every 11 s (shorter than the 15 s CD — emulation inconsistency).
- Player Teleport: count 3 (wiki), cadence unknown, spell ID unknown (30211 is Heigan's self-teleport).
- Eye Stalk HP: 500 (wiki) vs 19,500 (classicdb.ch).
- Boss HP: 1,780,000 (wiki) vs 1,762,431 (classicdb.ch).
- Exact floor geometry of the four sections (TrinityCore counts 15/25/23/13 trap tiles) is not available as coordinates; use four equal vertical strips with section 1 at the left wall facing the platform.
