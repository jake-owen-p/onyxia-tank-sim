# High Priestess Jeklik (Zul'Gurub)

Sources: list every URL used, one per line, with what it contributed.
- https://classic.warcraftdb.com/data/npc/14517 (API /api/data/node/npc/14517 + /tab/abilities) — level 63 World Boss, health 333,125, mana 26,200; ability list with cast/range/duration: Blood Leech 22644, Charge 22911 (8–25 yd), Pierce Armor 12097, Sonic Burst 23918, Summon Frenzied Bloodseeker Bats 23974.
- https://classic.warcraftdb.com/data/npc/14965 — Frenzied Bloodseeker Bat: level 60, 6,104 HP, Beast (Bat).
- https://classic.warcraftdb.com/data/npc/14750 — Gurubashi Bat Rider: level 61 Elite, 31,440 HP; Battle Command 5115, Infected Bite 16128.
- https://classicdb.ch/?spell=22644 — Blood Leech: instant, 5 yd, Health Leech 30 base, 10 yd radius.
- https://classicdb.ch/?spell=22911 — Charge: instant, 8–25 yd, weapon damage +75, 2 s stun.
- https://classicdb.ch/?spell=12097 — Pierce Armor: instant, 5 yd, 20 s, -75% armor.
- https://classicdb.ch/?spell=23918 — Sonic Burst: instant, self, 20 yd radius, 1750 Physical + Silence 10 s, dispel Magic.
- https://classicdb.ch/?spell=23919 — Swoop: instant, 5 yd range/radius, weapon +500, 2 s stun.
- https://classicdb.ch/?spell=23974 — Summon Frenzied Bloodseeker Bats: summons 8 (value 8) of NPC 14965.
- https://classicdb.ch/?spell=23954 — Great Heal: 4 s cast, 215 mana, 40 yd, heals 92,500.
- https://classicdb.ch/?spell=23953 — Mind Flay: channeled, 100 mana, 100 yd, 10 s, 750 Shadow per 1 s, -80% movement.
- https://classicdb.ch/?spell=22884 — Psychic Scream: instant, 210 mana, 8 yd radius, fear 4 s.
- https://classicdb.ch/?spell=23952 — Shadow Word: Pain: instant, 350 mana, 60 yd, 18 s, 422 Shadow per 3 s, dispel Magic.
- https://classicdb.ch/?spell=24673 — Curse of Blood: instant, 20 yd range, 15 yd radius, 10 min, dispel Curse, +500 physical damage taken.
- https://classicdb.ch/?spell=23968 / 23971 / 23972 — Throw Liquid Fire: periodic trigger every 8 s → Summon Liquid Fire object (20 s) → Blaze 875 Fire in 5 yd radius.
- https://classicdb.ch/?spell=23966 — Jeklik Transform (bat form, model 14941).
- https://warcraft.wiki.gg/wiki/High_Priestess_Jeklik_(tactics) — phase 1 (100–50%) bat form, bat waves once a minute starting at 1 min; ability text (Blood Leech ~150 heals 3x, Charge ~1k + 5 s silence 8–40 yd, Sonic Burst 1,750–2,250 + 10 s silence, Swoop frontal cone +500, 8 bats); phase 2 at 50%, bat riders at 35%, Great Heal 92,500 (~20–30%), Mind Flay 750/s 3 s chains (1.12), Psychic Scream up to 5 targets 4 s, SW:P 422–478 per 3 s 18 s, Curse of Blood; Liquid Fire 875–1,125 Fire; tactics (right-hand hill, sacrifice hunter, triangle formation, interrupts, bombs land in 2 s, oval tanking); quotes; patch notes.
- https://www.wowhead.com/classic/guide/high-priestess-jeklik-zul-gurub-strategy (via r.jina.ai) — charge ~1k + 5 s silence, min 8 / max 40 yd, hunter bait; 6–8 bats at 1 min then every minute; P2 at 50%, Great Heal ~25% of max HP, Mind Flay chains; bombs ~2 s to land, move boss in a circle; 2 waves normal, 1 wave with MC/BWL gear, P2 before 4th wave; Challenging Shout rotation on bats.
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — hill pull, hunter soak, bats every minute from 1 min, heal ~25%, circling tank vs bombs, fire resistance.
- https://www.tentonhammer.com/guides/zul-gurub-boss-guide-boss-1-high-priestess-jeklik — Screech ~800 + silence; bat fire ~1,100 + 250 DoT; Bat Rider mobs ~1,000 per hit, explode ~5,000 below 50% (with emote); "bats no longer explode as of 1.12"; mana drain option.
- https://us.millenium.gg/guide/6831.html?page=2 — 6–8 bats per minute; P2 resets aggro; dispel Curse of Blood/SW:P/Fear; tank anti-fear (Tremor Totem/Fear Ward).
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — paladins split L/R for cleanse, lead mage pulls bats, interrupt backups (bear stun, Hammer of Justice).
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_jeklik.cpp — emulator logic: phase 2 at <50% with threat reset; bat riders at <35% (two riders, second starts bombing 15 s after the first); bat rider self-detonates (Unstable Concoction 24024) below 40% HP; spell IDs. Ability cadences are DB-side spell lists, not in the script.

## Overview
- Level 63 (shown "??"), World Boss. Health 333,125 (Era 20-player, warcraftdb); Wowhead lists "Health (Seasonal 20 Player): 830,734" for Season of Discovery. Mana 26,200. No enrage timer found. First or second boss (Jeklik/Venoxis order is interchangeable); REQUIRED: while alive she grants Hakkar Aspect of Jeklik (AoE damage + silence).
- Phases: Phase 1 bat form 100% → 50% (bat waves, Sonic Burst, Charge, Swoop). Phase 2 troll/priest form <50% (Great Heal, Mind Flay, Psychic Scream, SW:P, Curse of Blood). At <35% she calls two Gurubashi Bat Riders that bomb the raid with Liquid Fire. Phase change resets threat (cmangos DoResetThreat; Millenium "resets aggro").
- Raid-size assumptions: 20-man Classic Era. SoD: health 830,734 (Wowhead); no other SoD-specific mechanics found.

## Abilities

### Blood Leech
- Name: Blood Leech (22644)
- Type: AoE (melee range) health drain
- Target rule: enemies within 10 yd of Jeklik
- Cast time: instant
- Cooldown or cadence: unknown (DB spell list; not published)
- Damage: Health Leech base 30 (DBC); wiki: drains ~150 health from each nearby enemy and heals Jeklik for up to 3x the amount stolen. Radius 10 yd.
- Debuff: none
- Movement effect: none
- Telegraph: none

### Charge (bat form)
- Name: Charge (22911)
- Type: charge
- Target rule: a player at 8–25 yd (DBC); guides say 8–40 yd. In practice the nearest eligible non-melee player, which is why a "bait" hunter stands between boss and ranged.
- Cast time: instant
- Cooldown or cadence: unknown; guides say "constantly" through phase 1
- Damage: weapon damage +75 (DBC); wiki/Wowhead: ~1,000 damage (described as AoE around the landing point) plus a 5 s silence (the silence is not on spell 22911; see Open questions). 2 s stun on the target.
- Debuff: Stun 2 s
- Movement effect: Jeklik moves to the target; the tank must regain her.
- Telegraph: none

### Pierce Armor
- Name: Pierce Armor (12097)
- Type: debuff (tank)
- Target rule: current target
- Cast time: instant, 5 yd
- Cooldown or cadence: unknown
- Damage: none
- Debuff: Pierce Armor, 20 s, armor -75%, dispel type none (physical)
- Movement effect: none
- Telegraph: none; tank healers must expect heavier melee for 20 s

### Sonic Burst (the "shriek")
- Name: Sonic Burst (23918)
- Type: AoE (room-local)
- Target rule: all players within 20 yd of Jeklik
- Cast time: instant
- Cooldown or cadence: unknown; guides: "continuously" in phase 1
- Damage: 1,750 base Physical (wiki 1,750–2,250; Tentonhammer "~800"), radius 20 yd
- Debuff: Sonic Burst silence 10 s, dispel Magic
- Movement effect: none
- Telegraph: yell on the bat-summon cast only; the burst itself has no warning. Ranged/healers must stay >20 yd.

### Swoop
- Name: Swoop (23919)
- Type: frontal cone / melee
- Target rule: targets in front within 5 yd (DBC radius 5 yd; wiki "frontal cone")
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: weapon damage +500 Physical
- Debuff: Stun 2 s
- Movement effect: stun
- Telegraph: none

### Summon Frenzied Bloodseeker Bats
- Name: Summon Frenzied Bloodseeker Bats (23974)
- Type: summon adds
- Target rule: n/a (bats arrive from above/sides)
- Cast time: instant
- Cooldown or cadence: first wave ~60 s after pull, then every ~60 s while in phase 1 (wiki, Wowhead, Warcraft Tavern)
- Damage: n/a
- Debuff: n/a
- Movement effect: n/a
- Telegraph: yell (SAY_SHRIEK in cmangos) on cast; Wowhead: pull her onto the right-hand hill so the raid sees the swarm arrive.

### Great Heal
- Name: Great Heal (23954)
- Type: self heal (phase 2)
- Target rule: self
- Cast time: 4 s, interruptible (Kick, Shield Bash, Counterspell, Earth Shock; wiki notes "immune" messages refer to silence, not interrupts)
- Cooldown or cadence: alternates with Mind Flay (Wowhead); exact cadence unknown
- Damage: heals 92,500 (DBC) ≈ 28% of 333,125; Wowhead "about 25%", wiki "20–30%"
- Debuff: n/a. Costs 215 mana (wiki says castable with 125), so mana-draining her is unreliable.
- Movement effect: none
- Telegraph: cast bar 4 s; yell SAY_HEAL on cast (cmangos)

### Mind Flay
- Name: Mind Flay (23953)
- Type: targeted channel
- Target rule: random player (100 yd)
- Cast time: channeled (interruptible)
- Cooldown or cadence: alternates with Great Heal
- Damage: 750 Shadow per second; DBC duration 10 s, wiki says 3 s; chains to nearby targets since patch 1.12
- Debuff: -80% movement speed while channeled
- Movement effect: snare
- Telegraph: channel bar; interrupt after Great Heal priority

### Psychic Scream
- Name: Psychic Scream (22884)
- Type: fear
- Target rule: up to 5 players within 8 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: none
- Debuff: Fear 4 s (dispellable Magic per Millenium)
- Movement effect: fear 4 s
- Telegraph: none; tank should have Fear Ward/Tremor Totem

### Shadow Word: Pain
- Name: Shadow Word: Pain (23952)
- Type: targeted DoT
- Target rule: random player, 60 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: 422 Shadow every 3 s for 18 s (wiki 422–478)
- Debuff: Magic, dispel it
- Movement effect: none
- Telegraph: none

### Curse of Blood
- Name: Curse of Blood (24673)
- Type: AoE debuff
- Target rule: players within 15 yd of the target (20 yd range)
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: none directly; increases physical damage taken by 500 flat (DBC); wiki text says "by 2" (likely a transcription issue)
- Debuff: Curse, 10 min, decurse (Mage/Druid)
- Movement effect: none
- Telegraph: none

### Throw Liquid Fire (Gurubashi Bat Rider bombs, phase 2)
- Name: Throw Liquid Fire (23968 → 23971 → Blaze 23972)
- Type: ground hazard
- Target rule: random raid area under the flying rider
- Cast time: periodic every 8 s per rider (DBC trigger interval); ~2 s flight time before impact (Wowhead, wiki)
- Cooldown or cadence: starts when Jeklik is <35% (cmangos; wiki) — two riders, the second starts 15 s after the first
- Damage: 875 Fire per Blaze in a 5 yd radius (wiki 875–1,125); fire patch persists 20 s (object duration) and keeps burning anyone standing in it (Tentonhammer: ~1,100 + 250 DoT)
- Debuff: none (standing damage)
- Movement effect: none
- Telegraph: yell "I command you to rain fire down upon these invaders!"; visible falling bomb, ~2 s to land. The bombers cannot be attacked.

## Adds
- Frenzied Bloodseeker Bats (NPC 14965): level 60 non-elite, 6,104 HP each; 8 per wave (6–8 per guides); first wave ~60 s into the fight, then every ~60 s while she is in bat form; stop at 50%. Weak hits, but they swarm. An off-tank (Challenging Shout rotation) grabs them, mages Frost Nova + AoE. They die to AoE in seconds; no timer despawn.
- Gurubashi Bat Riders (NPC 14750): level 61 elite, 31,440 HP; two spawn at <35% and fly overhead dropping Liquid Fire every 8 s each. They cannot be targeted/attacked (Tentonhammer, Wowhead) and only leave when she dies. The ground-walking Bat Rider trash around her area (same NPC) has Battle Command (+50% haste to allies 10 yd, 6 s), Infected Bite (disease, 3 min, 45 Nature per 10 s, +20 damage taken) and, in cmangos, self-detonates (Unstable Concoction 24024) below 40% HP; Tentonhammer says ~5,000 explosion with an emote, strafe out, and that bats "no longer explode as of 1.12". Clear all of them before pulling.

## Positioning and movement
- Tank: pull her onto the small hill to the right as you enter her area (bat waves are visible coming in). Keep only MT (+ an OT for bats) in melee during phase 1. Stand with Fear Ward/Tremor Totem. At 50% expect a threat reset: re-establish, then in phase 2 walk her in a slow oval/circle so bombs aimed at the melee pack land behind you; never stand in fire; never face her into the raid (Swoop frontal cone).
- Melee DPS: minimal melee in phase 1 (Sonic Burst 1,750+ and 10 s silence to everyone within 20 yd; Blood Leech within 10 yd). If you do melee, step back and bandage between bursts. Phase 2: stay glued to the tank's position and follow the oval; move out of fire instantly.
- Ranged DPS: max range (>20 yd from her hitbox, ideally 30+) in phase 1; one hunter stands 10–20 yd from her between boss and ranged as the charge bait. Mages save mana for bat waves (Frost Nova + Arcane Explosion/Blizzard). Phase 2: spread so no one is within 5 yd of another (bombs 5 yd radius, Mind Flay chains), stay out of fire.
- Healers: at max range in phase 1 but inside range of the melee group; one healer dedicated to the charge bait (HoT after every charge); paladins/priests split left/right for cleanse coverage. Phase 2: dispel SW:P (Magic), decurse Curse of Blood, dispel fears; prepare for Great Heal interrupt failures.
- Whole raid: hill pull position; alternative "triangle" formation 8 yd apart for Frost Nova/AoE of bats; run-out points are simply away from fire patches; LoS is not needed.

## What each role must do and must not do
- Tank:
  1. Pull to the hill; hold her still in phase 1 so the bait hunter stays the charge target.
  2. Have Fear Ward/Tremor Totem for Psychic Scream (phase 2).
  3. At 50% expect threat reset; taunt/regain immediately before Great Heal casts start.
  4. Phase 2: keep moving her in a small oval so bombs miss melee; never stop in fire.
  5. OT: pick up each bat wave with Challenging Shout and bring it to the AoE spot.
  6. Never let her face the raid (Swoop cone); never stand in fire.
- DPS:
  1. Phase 1: ranged burn, melee minimal; mages hold mana for bats and AoE every wave fast (8 bats x 6,104 HP).
  2. Target 50% before the 3rd/4th wave; 2 waves is normal, 1 with BWL gear.
  3. Phase 2: interrupt rotation of at least 3 short-CD interrupts: Great Heal first priority, Mind Flay second; call misses.
  4. Decurse Curse of Blood (mages/druids), move out of fire, stay spread 5 yd.
  5. Stop DPS briefly at the 50% transition until the tank has her.
- Healer:
  1. Phase 1: keep the charge bait alive (HoTs after each charge; ~1k + silence), top melee hit by Sonic Burst.
  2. Dispel SW:P and fears; cleanse Infected Bite if trash riders bit anyone.
  3. Phase 2: expect 750/s chaining Mind Flay on random targets if interrupts miss; pre-HoT.
  4. Stay >20 yd from her at all times in phase 1 (10 s silence otherwise).

## Timeline of a typical pull
- t=0: hunter/tank pulls to the hill; "Lord Hir'eek, grant me wings of vengeance!"; she lifts into bat form. Sonic Burst and Blood Leech begin on melee; first Charge onto the bait within the first ~10–20 s.
- t≈60 s: first bat wave (8 bats) — OT gathers, mages AoE. She is typically ~78–82% here in a mid-geared raid (wiki rule of thumb → expect 2 waves), ~66–70% in a strong raid (1 wave).
- t≈120 s: second bat wave. Good raids push 50% before t≈180 s; P2 should always start before the 4th wave (t≈240 s).
- At 50%: "I command you to rain fire down upon these invaders!" (yell is tied to transform in some sources, to riders in others); threat reset; ~10 s of quiet, then Great Heal (4 s) / Mind Flay alternate every few seconds; SW:P, Psychic Scream, Curse of Blood on random players.
- At <35%: two bat riders appear; bombs every ~8 s per rider, 2 s flight time; tank starts the oval.
- Kill: "Finally...death! Curse you, Hakkar! Curse you!" Hakkar loses Aspect of Jeklik.

## Open questions
- Charge range: DBC 22911 is 8–25 yd; Wowhead and wiki say 8–40 yd. The "~1k damage + 5 s silence" in guides is not on spell 22911 (weapon +75, 2 s stun); it may be a separate landing effect or conflation with Sonic Burst.
- Sonic Burst damage: DBC base 1,750 (wiki 1,750–2,250) vs Tentonhammer "~800" (older/under-reported).
- Great Heal: 92,500 DBC (≈28%) vs "~25%" (Wowhead) vs "20–30%/~50k" (wiki) vs "50%" (Tentonhammer, 2005).
- Mind Flay duration: 10 s channel (DBC) vs 3 s (wiki); chaining added 1.12 per wiki.
- Bats per wave: 8 (DBC value 8, wiki) vs 6–8 (Wowhead, Millenium).
- Curse of Blood effect: +500 physical damage taken (DBC) vs "+2" (wiki text). Not listed by cmangos or warcraftdb as a Jeklik spell; may be cast by other ZG trolls.
- Bat Rider explosion: cmangos scripts Unstable Concoction at <40%; Tentonhammer says explosions were removed in 1.12. Only affects trash riders, not the untargetable bombers.
- Threat reset at 50%: cmangos and Millenium say yes; Wowhead/wiki do not mention it.
- Ability cadences (Sonic Burst, Charge, Great Heal/Mind Flay): no source gives seconds; cmangos keeps them in DB spell lists not fetched here. Warcraft Logs was not accessible.
- Health: 333,125 (warcraftdb Era) — wiki gives none; SoD 830,734 (Wowhead).
