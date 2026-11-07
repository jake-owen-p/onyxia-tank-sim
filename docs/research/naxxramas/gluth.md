# Gluth (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Gluth_(Classic) — Classic 40-man page: Mortal Wound stacking -10% healing, not tauntable; Frenzy ~every 10 s, Tranquilizing Shot; Decimate ~every 105 s → all players and zombies to 5% HP (pets unaffected); Terrifying Roar ~every 20 s, <20 yd; Devour Zombie heals 5%; Enrage 10–20 s after the 3rd Decimate; zombies every ~10 s at the three green grates by the entry tunnel, Infected Wound +100 Physical/stack for 1 min; kiting plans (mage+warrior per corner, Frost Trap, slows); Shackle only strays; no Turn Undead; Fear Ward on the MT; "5% is still 6,104 HP".
- https://www.wowhead.com/classic/guide/gluth-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: Toxic Tunnel before the room; tank him in the far corner by the exit door frame (melee LoS the fear); zombies every ~10 s at three grates under the pipe exit; Zombie Chow Search emote "Gluth spots a nearby Zombie to devour!" → charge, eat, +5% HP; Mortal Wound -10% healing, not tauntable (second tank must out-threat); Terrifying Roar ~every 20 s; Frenzy ~every 10 s (Tranq Shot); Decimate ~every 100 s → 5% HP + Call All Zombie Chow; Enrage after 3 Decimates (~5 min).
- https://www.wowhead.com/classic/spell=25646/mortal-wound — Mortal Wound: melee, instant, -10% healing taken, 30 s (stacks).
- https://www.wowhead.com/classic/spell=28375/decimate — Decimate: instant, unlimited range, scripted damage (value 1, ignores modifiers) — the "set to 5%" effect.
- https://www.wowhead.com/classic/spell=19451/frenzy — Frenzy (guide link): +150% attack speed, 8 s, dispel type Enrage (Tranquilizing Shot). DBM tracks Gluth's Frenzy as 28371 (8 s).
- https://www.wowhead.com/classic/spell=29685/terrifying-roar — Terrifying Roar: instant, 5 s fear, 20 yd radius.
- https://www.wowhead.com/classic/spell=29307/infected-wound — Infected Wound: passive proc on the zombie, "Physical damage taken increased" stacking (tooltip value shows 0 — scripted).
- https://www.wowhead.com/classic/spell=28217/summon-zombie-chow — Summon Zombie Chow: instant, 1 zombie.
- https://www.wowhead.com/classic/spell=29682/call-all-zombie-chow — Call All Zombie Chow: scripted, 8 yd dummy.
- https://www.wowhead.com/classic/spell=26662/berserk — Berserk (DBM's Enrage ID for Gluth): +150% attack speed, +500% damage, 5 min.
- https://classicdb.ch/?npc=15932 — Gluth: 1,466,075 HP, melee 6,101–7,002, armor 4,691.
- https://classicdb.ch/?npc=16360 — Zombie Chow: level 60, 52,000 HP, melee 524–673.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/ConstructQuarter/Gluth.lua — DBM Classic: Frenzy (28371) first 9.6–11.3 s then every 8.1–11.4 s, lasts 8 s; Terrifying Roar first 17.8–24.3 s then every 17.8–22.7 s; Decimate counted on damage events (timer commented out at ~96 s + warning); Enrage aura 26662.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: swap tanks at 4–5 Mortal Wound stacks; Roar every 20 s / 20 yd; Frenzy every 10 s → Tranq; zombies every 10 s, kite until Decimate every 105 s; Enrage after the third Decimate; two dedicated kiters minimum.

## Overview
- Level ?? boss, Undead (plague-dog). HP 1,466,075 (classicdb.ch). Soft/hard enrage: 10–20 s after the third Decimate (~3×105 s + ≈ 5:30 — wiki; Wowhead "~5 minutes"). Third boss of the Abomination Wing, required. Reached through a Toxic Tunnel (periodic Nature damage) — the raid arrives damaged (Wowhead).
- Phases: single phase on a ~105 s Decimate loop.
- Raid-size assumptions: 40-man Classic Era; 2 tanks rotating on Mortal Wound (no taunt possible), ≥2 kiting teams for zombies, hunters for Tranquilizing Shot, Fear Ward/Tremor Totem for the fear.

## Abilities

### Mortal Wound
- Name: Mortal Wound (25646)
- Type: melee debuff
- Target rule: current target (tank).
- Cadence: "frequent" (WT); no timer.
- Effect: -10% healing taken per stack, 30 s, stacks (wiki; identical to Kurinnaxx/Fankriss). Not dispellable. Gluth cannot be taunted (wiki, Wowhead) — the second tank must overtake on threat.
- Telegraph: stack count on the tank; swap at 4–5 stacks (WT).

### Frenzy
- Name: Frenzy (DBM 28371; guide links 19451)
- Type: enrage (self)
- Cadence: first 9.6–11.3 s after the pull, then every 8.1–11.4 s (DBM); guides "every 10 s". Lasts 8 s.
- Effect: +150% attack speed (19451 tooltip) [DBM's 28371 values not fetched]; removed by Hunter Tranquilizing Shot (dispel type Enrage).
- Telegraph: DBM dispel warning.

### Terrifying Roar
- Name: Terrifying Roar (29685)
- Type: fear (AoE)
- Target rule: all players within 20 yd (spell radius; wiki "<20 yd").
- Cadence: first 17.8–24.3 s, then every 17.8–22.7 s (DBM); guides "about every 20 s".
- Effect: Fear 5 s. Countered by Fear Ward (MT must have it — otherwise a feared MT drags Gluth toward zombies, wiki), Tremor Totem, Berserker Rage, Will of the Forsaken, or by melee breaking line of sight in the exit door frame (Wowhead).
- Telegraph: DBM timer; roar animation.

### Decimate (+ Call All Zombie Chow)
- Name: Decimate (28375) and Call All Zombie Chow (29682)
- Type: AoE (room) HP set
- Target rule: every raid member and every zombie in the room (pets unaffected — wiki).
- Cadence: ~every 105 s (wiki, WT) / ~100 s (Wowhead) / DBM's disabled timer ~96 s + 20 s anti-spam. Unlimited range.
- Effect: reduces everyone's current HP to 5% of maximum (scripted damage ignoring modifiers), then all Zombie Chow are called to charge Gluth (Call All Zombie Chow) so he can devour them.
- Telegraph: none for the hit itself; DBM counts Decimates (3rd → enrage soon). Tanks save cooldowns for the moment after it (Wowhead).

### Zombie Chow Search / Devour
- Emote "Gluth spots a nearby Zombie to devour!" → he charges the zombie, kills it and heals 5% of his max HP (~73k). Any zombie that reaches melee range of him is eaten.

### Summon Zombie Chow
- Name: Summon Zombie Chow (28217)
- Cadence: ~every 10 s (wiki, Wowhead, WT) at the three green grates beneath the pipe exit (Wowhead) / near the entry tunnel (wiki). Zombies drop aggro after spawning and walk toward Gluth (wiki) — they must be picked up/kited.

### Enrage (after the 3rd Decimate)
- Name: Enrage — DBM announces aura 26662 (Berserk: +150% attack speed, +500% damage)
- Trigger: 10–20 s after the third Decimate (wiki) ≈ 5:20–5:40; Wowhead "~5 min". Wipe.

### Zombie Chow — Infected Wound
- Name: Infected Wound (29307)
- Effect: each zombie melee hit stacks +100 Physical damage taken (wiki) on the target for 1 minute; healers chewed by zombies die fast (Wowhead).

## Adds
- Zombie Chow (16360): level 60, 52,000 HP (classicdb; the wiki implies ~122,080 from "5% = 6,104", see Open questions), melee 524–673 with stacking Infected Wound; one every ~10 s from the three grates (so ~10 alive per Decimate cycle); they lose aggro and walk to Gluth; kited by assigned teams (mage Fireblast + warrior Piercing Howl per corner; Frost Trap, Cone of Cold, Improved Blizzard, Frost Nova as a last resort — wiki/Wowhead), or grouped at the middle gate with hunters/paladins/warriors tanking (wiki). Shackle only strays on healers; never Turn Undead (sends them to Gluth). After Decimate they are at 5% (≈2,600 or ≈6,104 HP) and charge Gluth → AoE them immediately (ranged under the pipe exit).

## Positioning and movement
- Tank: drag Gluth across the room to the far corner by the exit door frame and face him toward the door/away from the room (Wowhead, WT "facing the door"; wiki "near the door with his head facing it"). This is the farthest point from the grates and lets melee hide in the door frame for the fear. Two tanks: tank B overtakes threat when tank A has 4–5 Mortal Wound stacks (no taunt) — WT; druid Nature's Swiftness rotation to top the MT before Decimate (wiki). Fear Ward on the MT always. Never: let him turn toward the grates; be feared without Fear Ward; let a zombie reach him.
- Melee DPS: behind him near the door frame; step into the frame to LoS Terrifying Roar on the DBM timer; otherwise full DPS.
- Ranged DPS: max range from Gluth, under the pipe exit near the grates (Wowhead); kite/slow zombies; after each Decimate AoE the 5% zombies before they reach him.
- Healers: with the ranged under the pipe exit at max range from the tank (Wowhead) so zombies that aggro them are killed by the ranged; Fear Ward rotation on the MT; Tremor Totem for melee groups; top the MT before Decimate and burst-heal everyone after it.
- Whole raid: Gluth corner (door) ↔ zombie zone (grates/pipe exit) at opposite ends; the kiting lanes are the room's long sides; the door frame is the LoS spot.

## What each role must do and must not do
- Tank:
  1. Position by the door, face away from the room, Fear Ward up at all times.
  2. Swap at 4–5 Mortal Wound stacks by out-threating (no taunt); the incoming tank builds threat early.
  3. Save Shield Wall/Last Stand/Stoneshield for right after Decimate (you are at 5% while he Frenzies).
  4. Never move toward the zombie side.
- DPS:
  1. Hunters: Tranquilizing Shot every Frenzy (~every 10 s) — assign a rotation.
  2. Kiters: keep every zombie away from Gluth for ~105 s; slows refreshed; never let one leak (5% heal each).
  3. After Decimate: all ranged AoE the zombies instantly (they are at 5% and charging him).
  4. Melee: LoS the fear; nothing to interrupt. Finish before the 3rd Decimate (~5:15) or be at low HP for the enrage window.
- Healer:
  1. Pre-Decimate: tank at full (Nature's Swiftness ready); post-Decimate: everyone is at 5% — mass heals.
  2. Never cleanse-reflex (nothing dispellable except Frenzy via Tranq); Mortal Wound is permanent until it fades.
  3. Stay away from zombies; Shackle a stray that reaches you.
  4. Fear Ward / Tremor Totem discipline.

## Timeline of a typical pull
- t=-?: raid pots Greater Nature Protection in the Toxic Tunnel, drops down.
- t=0: MT grabs Gluth, drags him to the door corner; ranged/healers settle under the pipe exit.
- t≈10 s: first Zombie Chow (then every ~10 s); t≈10–11 s: first Frenzy (then every ~8–11 s, 8 s each) → Tranq Shot; t≈18–24 s: first Terrifying Roar (then every ~18–23 s).
- t≈100–105 s: Decimate #1: everyone and all ~10 zombies to 5%; zombies charge → AoE; tank cooldowns; mass heals.
- t≈205–210 s: Decimate #2; t≈310–315 s: Decimate #3; t≈320–335 s: Enrage → wipe. Kill before ~5:15 (1.47M HP ⇒ ≈4,700 raid DPS).

## Open questions
- Decimate cadence: ~105 s (wiki, WT) vs ~100 s (Wowhead) vs DBM's disabled ~96 s timer.
- Zombie Chow HP: 52,000 (classicdb.ch) vs ~122,080 implied by the wiki's "5% is still 6,104 HP" (which exactly equals the Corpse Scarab's Wowhead HP — likely a mix-up). At 5% of 52,000 they have ~2,600 HP.
- Frenzy: guide links 19451 (+150% attack speed, 8 s); DBM tracks 28371 — effect values for 28371 not fetched.
- Enrage after the 3rd Decimate: wiki 10–20 s after; Wowhead "about 5 minutes"; the Wrath "8-minute berserk" does not appear in any Classic source.
- Terrifying Roar duration: 5 s (spell) — guides give none.
- Infected Wound magnitude: +100 Physical per stack for 1 min (wiki); spell tooltip is scripted (shows 0).
- Spawn point naming: "three green grates under the pipe exit" (Wowhead) vs "near the entry tunnel" (wiki) — same place (the raid drops out of the pipe into the room).
- Boss HP: 1,466,075 (classicdb.ch); wiki lists none.
