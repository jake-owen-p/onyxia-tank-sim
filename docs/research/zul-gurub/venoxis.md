# High Priest Venoxis (Zul'Gurub)

Sources: list every URL used, one per line, with what it contributed.
- https://classic.warcraftdb.com/data/npc/14507 (API) — level 63 World Boss, health 213,200, mana 26,200; abilities Dispel Magic 23859, Holy Fire 23860 (3.5 s), Holy Nova 23858, Holy Wrath 23979, Renew 23895, Thrash 3391.
- https://classic.warcraftdb.com/data/npc/11373 — Razzashi Cobra: level 60 Elite, 15,260 HP; Poison 24097, Spit 27919.
- https://classic.warcraftdb.com/data/npc/14884 — Parasitic Serpent: level 1, 333 HP.
- https://classicdb.ch/?spell=23860 — Holy Fire: 3.5 s cast, 115 mana, 30 yd, 2203 Fire + 125 per 2 s for 8 s, Magic.
- https://classicdb.ch/?spell=23858 — Holy Nova: instant, 315 mana, 15 yd radius, 875 Holy damage + heals friendlies 1750.
- https://classicdb.ch/?spell=23979 — Holy Wrath: instant, 100 mana, 100 yd, 300 Holy (chain).
- https://classicdb.ch/?spell=23895 — Renew: instant, 400 mana, 40 yd, 2000 per 3 s for 15 s, Magic.
- https://classicdb.ch/?spell=23859 — Dispel Magic: instant, 75 mana, 100 yd, dispels 1 effect.
- https://classicdb.ch/?spell=23861 — Poison Cloud: instant, persistent area aura 8 yd radius, 500 Nature per 1 s, 10 s.
- https://classicdb.ch/?spell=23862 — Venom Spit: 1.5 s cast, 30 yd, 1500 Nature + 200 per 2 s for 10 s, Poison.
- https://classicdb.ch/?spell=23865 / 23866 — Parasitic Serpent DoT 300 Nature per 2 s for 10 s (not dispellable); Summon Parasitic Serpent (NPC 14884, 60 s).
- https://classicdb.ch/?spell=24097 — Cobra Poison: 36 Nature per 3 s, 30 s, Poison.
- https://classicdb.ch/?spell=27919 — Cobra Spit: 30 yd, 85 Nature + knockback.
- https://warcraft.wiki.gg/wiki/High_Priest_Venoxis_(Classic) — 4 Razzashi Cobras 15,260 HP; phase values (Holy Fire 2203–2297, Holy Nova 875–1125/heal 1750–2250, Holy Wrath 300 +30% per jump, Renew 2000/3 s); snake form at 50% with +75% physical damage; Poison Cloud 500/s; Venom Spit 1500–2500 + 200/2 s stacking 3, 1.5 s cast; Virulent Poison 25% on hit 210/3 s 30 s stacks 3; phase 3 at 25% Parasitic Serpents; cobra Poison 133/3 s stacking 10, Spit ~1850 30 yd; tactics (2 tanks, bonfire, ≤3 melee, mana drain, 25 yd away in snake form, cure poison after leaving cloud, hands-raised telegraph); quotes.
- https://warcraft.wiki.gg/wiki/High_Priest_Venoxis — overview table lists 210,000 health for the Classic version.
- https://www.wowhead.com/classic/guide/high-priest-venoxis-zul-gurub-strategy (via r.jina.ai) — easiest fight; CC adds (Polymorph/Hibernate), OT pulls so adds go to OT; Holy Wrath deadly when clumped, melee stay off in P1; snake at 50%, enrage at 20%; Poison Cloud "remains for the remainder of the fight", raises hands before casting; Renew dispellable; save cooldowns for P2.
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — three CC users, OT pulls adds one at a time, drain mana before melee, ≥25 yd away just above 50%, repeated poison cleansing.
- https://us.millenium.gg/guide/6831.html?page=3 — tank at the bonfire, dispel Renew, all melee stop after cobras die to avoid Holy Wrath bounce, transformation at 50% resets aggro.
- https://www.tentonhammer.com/guides/zul-gurub-boss-guide-boss-2-high-priest-venoxis — back off at ~55%; Holy Wrath chain crits "~19,000"; Poison Cloud ~500 per 3 s; up to six snakes if mis-pulled; he dispels sheep/sleep on nearby adds; warriors Disarm in snake form.
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — CC 3 of 4 adds; 20% enrage, pre-overheal MT; Thunderclap/Hurricane at ~21%.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_venoxis.cpp — snake form at ≤50% with an instant Poison Cloud, Virulent Poison proc aura and threat reset; phase 3 spell list at <25%; Frenzy 23537 at <20% ("maybe even 25").

## Overview
- Level 63 ("??"), World Boss. Health 213,200 (warcraftdb Era); wiki 210,000. Mana 26,200. No enrage timer. First or second boss; REQUIRED: alive he grants Hakkar Aspect of Venoxis (raid-wide poison).
- Phases: P1 troll/priest form 100–50% (Holy Fire, Holy Nova, Holy Wrath, Renew, Dispel Magic). P2 snake form <50%: threat reset, +75% physical damage, Poison Cloud, Venom Spit, Virulent Poison. P3 <25%: adds Parasitic Serpent summons. <20%: Frenzy/enrage.
- Raid-size assumptions: 20-man Classic Era. No SoD-specific data found beyond the generic SoD tuning.

## Abilities

### Holy Fire
- Name: Holy Fire (23860)
- Type: targeted
- Target rule: current target (tank) per Tentonhammer; 30 yd
- Cast time: 3.5 s, interruptible
- Cooldown or cadence: unknown
- Damage: 2,203 Fire (wiki 2,203–2,297) + 125 Fire every 2 s for 8 s
- Debuff: Holy Fire DoT 8 s, Magic (dispel)
- Movement effect: none
- Telegraph: 3.5 s cast bar

### Holy Nova
- Name: Holy Nova (23858)
- Type: AoE (15 yd) + self/add heal
- Target rule: all enemies within 15 yd; heals Venoxis and allies within 15 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: 875 Holy (wiki 875–1,125); heals 1,750 (1,750–2,250) to himself and adds
- Debuff: none
- Movement effect: none
- Telegraph: none; reason to keep nobody but the tank within 15 yd in P1

### Holy Wrath
- Name: Holy Wrath (23979)
- Type: chain (targeted, bounces)
- Target rule: one target, then jumps to nearby players; +30% damage per jump (wiki); 100 yd
- Cast time: instant
- Cooldown or cadence: unknown; Wowhead: fast raids reach 50% before he casts it at all
- Damage: 300 Holy base on the first target, escalating per bounce; Tentonhammer reports ~19,000 crits after many jumps
- Debuff: none
- Movement effect: none
- Telegraph: none. Spread >~10 yd from each other and keep melee off him in P1 (or ≤3 melee per wiki).

### Renew
- Name: Renew (23895)
- Type: self/ally HoT
- Target rule: himself or a cobra, 40 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: heals 2,000 every 3 s for 15 s (10,000 total)
- Debuff: Magic buff — Priest Dispel Magic / Shaman Purge it immediately
- Movement effect: none
- Telegraph: buff icon on the boss

### Dispel Magic
- Name: Dispel Magic (23859)
- Type: other
- Target rule: a nearby add (removes Polymorph/Hibernate); cannot dispel himself (wiki)
- Cast time: instant, 100 yd
- Cooldown or cadence: unknown
- Damage: none
- Debuff: n/a
- Movement effect: n/a
- Telegraph: CC breaks — keep CC'd cobras away from him or kill them before fully engaging (Tentonhammer).

### Snake Form (transition)
- Name: Snake Form (23849) at 50%
- Type: other (phase change, threat wipe)
- Target rule: self
- Cast time: instant
- Cooldown or cadence: once at 50% ("Let the coils of hate unfurl!")
- Damage: +75% physical damage (wiki); instant Poison Cloud under him (cmangos); Virulent Poison proc aura
- Debuff: n/a
- Movement effect: threat reset (cmangos, Millenium) — DPS pause until the MT re-establishes
- Telegraph: yell + transform visual

### Poison Cloud
- Name: Poison Cloud (23861)
- Type: ground hazard
- Target rule: under Venoxis's feet
- Cast time: instant
- Cooldown or cadence: "frequently"/"constantly" in snake form (wiki, Wowhead); exact interval unknown
- Damage: 500 Nature per second to anyone inside an 8 yd radius; DBC duration 10 s; Wowhead says the clouds "remain on the ground for the remainder of the fight" (see Open questions)
- Debuff: wiki describes a 10 s poison buff on those who stood in it (~2,500 saved by curing); Tentonhammer "~500 per 3 s"
- Movement effect: none
- Telegraph: he raises both hands overhead immediately before casting (wiki, Wowhead)

### Venom Spit
- Name: Venom Spit (23862)
- Type: targeted
- Target rule: random player within 30 yd
- Cast time: 1.5 s
- Cooldown or cadence: unknown
- Damage: 1,500 Nature (wiki 1,500–2,500) + 200 Nature every 2 s for 10 s; stacks up to 3 (wiki)
- Debuff: Poison, 10 s — cleanse (Cure Poison/Abolish/Cleanse/Poison Cleansing Totem)
- Movement effect: none
- Telegraph: 1.5 s cast bar. Standing >30 yd avoids it entirely (wiki "everyone except MT stays 25+ yd").

### Virulent Poison
- Name: Virulent Poison (proc aura 22413)
- Type: debuff (melee proc)
- Target rule: 25% chance on his melee hits (tank)
- Cast time: n/a
- Cooldown or cadence: proc
- Damage: 210 Nature every 3 s for 30 s, stacks 3 (wiki)
- Debuff: Poison — cleanse the tank
- Movement effect: none
- Telegraph: none

### Summon Parasitic Serpent (phase 3)
- Name: Summon Parasitic Serpent (23866) → Parasitic Serpent (23865)
- Type: summon adds / debuff
- Target rule: serpent charges a player and "infests" them
- Cast time: instant, 100 yd
- Cooldown or cadence: begins <25%; interval unknown
- Damage: 300 Nature every 2 s for 10 s per serpent
- Debuff: Parasitic Serpent, 10 s, NOT dispellable (wiki)
- Movement effect: none
- Telegraph: small level-1 serpent (333 HP) running at a player — kill it on sight

### Frenzy (enrage)
- Name: Frenzy (23537)
- Type: enrage
- Target rule: self at <20% (cmangos "maybe 25"); Wowhead "enrages at 20%"
- Cast time: instant
- Cooldown or cadence: once
- Damage: increased melee damage/speed (values not published for 23537)
- Debuff: Enrage type — Tranquilizing Shot may remove it (unverified)
- Movement effect: none
- Telegraph: enrage visual; healers pre-overheal the MT from ~21% (Amazon Basin)

## Adds
- Razzashi Cobras (NPC 11373) x4: level 60 elite, 15,260 HP each, flanking him on the stairs. Beast — Polymorph, Hibernate, Freezing Trap, Blind all work; he can Dispel Magic CC off adds standing near him. Poison on melee hit (36 per 3 s for 30 s DBC; wiki 133 per 3 s stacking 10), Spit (30 yd, knockback; DBC 85 Nature, wiki ~1,850). OT pulls (so cobras aggro the OT while MT grabs Venoxis), CC three, kill one at a time; all four dead before 50%. They do not respawn. Tentonhammer notes each add death may raise his damage (unconfirmed).
- Parasitic Serpents (NPC 14884): level 1, 333 HP, summoned <25%; one-shot them.

## Positioning and movement
- Tank: MT pulls him down and tanks him at the bonfire (Millenium, wiki) or the left wall (Tentonhammer), facing away from the raid, nobody else within 15 yd in P1. OT takes the cobras to the room entrance where CC is applied. At 50%: expect threat reset, re-taunt, then as soon as he raises his hands sidestep him out of the cloud (8 yd radius) and keep repositioning so melee have a clean spot; never stand in a cloud (500/s).
- Melee DPS: P1 stay OUT of melee (Holy Wrath bounces, Holy Nova 15 yd) — wand/shoot from range or at most 3 melee. Join at 50% once the MT has threat; follow the tank out of clouds; warriors Execute between clouds below 20%.
- Ranged DPS: spread >10 yd from each other and >15 yd from him in P1 (Holy Nova/Wrath); hunters/warlocks/priests drain his mana early (Viper Sting, Drain Mana, Mana Burn) to blunt Holy Fire/Nova/Renew. In snake form stay ≥25–30 yd (Venom Spit range 30). Save cooldowns for P2.
- Healers: in range of the MT but ≥25 yd from the boss in P2; one healer dispels Renew (priest) and the Holy Fire DoT (Magic) in P1; shamans/druids/paladins cleanse Venom Spit and Virulent Poison, but only after the tank has left the cloud. Soulstone the MT (wiki).
- Whole raid: clear the entire room first (room needed to dodge clouds); CC spot at the entrance; no LoS tricks needed.

## What each role must do and must not do
- Tank:
  1. OT pulls first so cobras path to the OT; MT taunts/grabs Venoxis immediately.
  2. P1: keep him at the bonfire facing away; don't let CC'd cobras stand near him (Dispel Magic).
  3. At 50% re-establish threat fast (threat reset), use cooldowns as snake-form melee is +75% and enrages <20%.
  4. On hands-raised telegraph, move him 10+ yd out of the cloud; never backpedal into an old cloud.
  5. Never stand in Poison Cloud; call for poison cleanse after leaving it.
- DPS:
  1. Kill cobras one by one; CC the rest; no AoE near CC.
  2. P1: no melee on him; ranged only, spread; drain his mana.
  3. Stop at the 50% transition until the MT has threat, then full burn with cooldowns.
  4. Kill Parasitic Serpents on sight (<25%).
  5. Stay ≥25–30 yd unless melee; melee leave clouds immediately.
- Healer:
  1. Dispel Renew off him the instant it appears (10k heal otherwise).
  2. Dispel Holy Fire DoT on the tank; cleanse poisons (Venom Spit, Virulent Poison) — after the tank leaves the cloud.
  3. Conserve mana in P1; P2 tank damage spikes, pre-overheal below ~21%.
  4. Cloth at range: expect 1,500–2,500 Venom Spit hits; keep yourself topped.

## Timeline of a typical pull
- t=0: OT pulls; cobras to the entrance, 3 CC'd, kill order called. MT takes Venoxis to the bonfire. Holy Fire casts on the tank every so often (3.5 s casts), occasional Holy Nova on anyone close, Renew on himself (dispel).
- t≈0–120 s: cobras die one at a time; mana drained; ranged DPS ramps. Holy Wrath risk only if players clump.
- At 50% (often t≈2–3 min): "Let the coils of hate unfurl!" — snake form, threat reset, instant Poison Cloud under him. MT re-establishes, melee join. Clouds drop repeatedly (hands-raised telegraph), Venom Spit on random players within 30 yd.
- At <25%: Parasitic Serpents begin spawning (300 Nature per 2 s on the infested player).
- At <20%: Frenzy; healers chain-heal the MT; Executes between clouds.
- Kill: "Ssserenity... at lassst!" Hakkar loses Aspect of Venoxis.

## Open questions
- Health: 213,200 (warcraftdb) vs 210,000 (wiki table).
- Poison Cloud persistence: DBC 10 s area aura vs Wowhead "remains for the remainder of the fight".
- Poison Cloud tick: 500/s (DBC, wiki) vs ~500 per 3 s (Tentonhammer).
- Threat reset at 50%: cmangos/Millenium yes; wiki/Wowhead silent.
- Enrage threshold: 20% (Wowhead, Amazon Basin) vs cmangos comment "maybe even 25"; Frenzy 23537 numbers not published.
- Cobra numbers: Poison 36/3 s (DBC) vs 133/3 s (wiki); Spit 85 (DBC) vs ~1,850 (wiki).
- Whether cobra deaths buff him (Tentonhammer only).
- No cadences for Holy Fire/Holy Nova/Holy Wrath/Venom Spit/Poison Cloud in any source.
