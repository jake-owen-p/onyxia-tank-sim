# Noth the Plaguebringer (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Noth_the_Plaguebringer_(Classic) — Classic 40-man page: Curse spreads to ~40 yd / 20 closest; Wrath 875–1,125 Shadow per 2 s; Blink ~20 yd every ~25 s with full aggro wipe; Cripple (-50% movement, attack speed, Strength); skeletons every 30 s; teleport schedule (90 s → balcony 1, +110 s → balcony 2, +180 s → balcony 3), balcony lengths 70 s / 90 s / ??; Guardians immune to Shackle; tank spawn points NW/NE/SW; DPS benchmarks 80/50/0%; quotes.
- https://www.wowhead.com/classic/guide/noth-the-plaguebringer-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: Summon Skeletons every 30 s (one Plagued Warrior per bone pile); Curse 10 s; Blink + Cripple on arrival, threat wiped; balcony waves (2× Champions; Champions then Guardians; 2× Guardians); add abilities (Cleave; Mortal Strike + Shadow Shock; Arcane Explosion); Shackle Undead on leftover adds; positioning.
- https://www.wowhead.com/classic/spell=29213/curse-of-the-plaguebringer — Curse: instant, Curse dispel type, 10 s, max targets 20 (10 in another difficulty row), 200 yd radius, triggers Wrath after 10 s.
- https://www.wowhead.com/classic/spell=29214/wrath-of-the-plaguebringer — Wrath: 1,758 Shadow initial (effect value), then 875–1,125 Shadow every 2 s for 10 s, 35 yd radius, ignores LoS, no dispel type.
- https://www.wowhead.com/classic/spell=29212/cripple — Cripple: instant, 20 yd radius, 15 s, Magic dispel; -50% run speed, +100% time between attacks, -50% Strength; Shadow school.
- https://www.wowhead.com/classic/spell=29211/blink — the Blink spell the guide links: 20 yd, frees from roots. (DBM tracks Noth's Blink as spell 29208.)
- https://www.wowhead.com/classic/spell=29237/summon-skeletons — Summon Skeletons: instant, 100 yd, summons 3 Plagued Warriors (one per effect).
- https://classicdb.ch/?npc=15954 — Noth: 1,492,487 HP, melee 8,475–9,727, armor 4,691.
- https://classicdb.ch/?npc=16984 — Plagued Warrior: level 61, 34,000 HP, melee 532–684.
- https://classicdb.ch/?npc=16983 — Plagued Champion: level 61, 37,000 HP, melee 532–684.
- https://classicdb.ch/?npc=16981 — Plagued Guardian: level 61, 17,608 HP, melee 2,953–3,382, armor 2,073.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/PlagueQuarter/Noth.lua — DBM Classic timers: first teleport 90.6 s; balcony 1 lasts 72.8–74.8 s; ground 2 = 109 s, balcony 2 = 97 s, ground 3 = 173 s, balcony 3 = 126 s, ground 4 = 93 s, balcony 4 = 55 s (the values after balcony 1 are marked "Unknown in Classic", i.e. carried from Wrath); Curse first 6.5–25.9 s then 51.8–66.8 s, 10 s after each return (17 s after the 4th); Curse lasts 10 s; adds every 30 s, first 6.5–22.7 s, 3 s after arriving on the balcony; adds yell "Rise, my soldiers! Rise and fight once more!".
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: 3 tanks; skeletons every 30 s; Blink every 25 s wipes aggro, DPS stops until the MT has him; Cripple on the MT dispelled by priest/paladin; teleport at 90 s (70 s or two waves), second 110 s after return (90 s), third 3 min after return.
- https://classicdb.ch/?spell=28785 (format reference only).

## Overview
- Level ?? boss, Undead (human). HP 1,492,487 (classicdb.ch). No hard enrage, but the third balcony phase (two waves of Plagued Guardians) is considered unsurvivable: "you will likely not survive the third add phase, so Noth must die before it" (wiki). First boss of the Plague Wing, required.
- Phases: alternating. Ground phase (Noth attackable in the room; skeletons every 30 s; Curse; Blink) ↔ Balcony phase (Noth untargetable on the balcony; two waves of Champions/Guardians; ends when both waves are dead or after a timer). Ground 1 = 90 s; balcony 1 ≤ ~73 s; ground 2 ≈ 110 s; balcony 2 ≤ ~90–97 s; ground 3 ≈ 180 s; balcony 3 (2× Guardians).
- Raid-size assumptions: 40-man Classic Era; 3 off-tanks on the bone-pile spawn points plus the main tank; many decursers (Druids/Mages). The room locks on pull — everyone must be inside.

## Abilities

### Curse of the Plaguebringer
- Name: Curse of the Plaguebringer (29213)
- Type: debuff (curse) that detonates into an AoE
- Target rule: multiple players at once — up to 20 targets (spell data "Max targets 20"); wiki Classic says it is cast on melee DPS/nearby players ("spreads to ~40 yd or the 20 closest"); Wowhead guide "multiple targets".
- Cast time: instant; not interruptible.
- Cooldown or cadence: DBM Classic: first 6.5–25.9 s after pull, then every 51.8–66.8 s; 10 s after each return from the balcony (17 s after the 4th return). Wowhead: "periodically".
- Damage: none by itself ("The Plague awaits you...").
- Debuff: Curse of the Plaguebringer — 10 s, Curse (Remove Curse / Remove Lesser Curse). If it expires undispelled it triggers Wrath of the Plaguebringer on the target and all allies within 35 yd (see below). Does not spread by itself; the Wrath does.
- Movement effect: none.
- Where it is telegraphed: no cast bar; the curse icon appears on many players at once; DBM announces. You have 10 s to decurse everyone.

### Wrath of the Plaguebringer
- Name: Wrath of the Plaguebringer (29214)
- Type: AoE (around each cursed player), DoT
- Target rule: every player within 35 yd of a player whose Curse expired (ignores LoS).
- Cast time: instant (triggered).
- Damage: 1,758 Shadow initial (effect value; tooltip says "Nature damage" for the initial hit — see Open questions) + 875–1,125 Shadow every 2 s for 10 s (tooltip; the description text says "every 5 sec for 10 sec"). Wiki/WT: "an instant wipe if several go off".
- Debuff: Wrath of the Plaguebringer, 10 s, no dispel type (cannot be removed). Shadow Protection Potion / Prayer of Shadow Protection mitigate.
- Telegraph: none beyond the Curse's 10 s window.

### Blink (+ Cripple)
- Name: Blink (DBM: 29208; Wowhead guide links 29211) and Cripple (29212)
- Type: teleport + threat wipe + debuff
- Target rule: Noth blinks ~20 yd to a random spot in the room; Cripple hits everyone within 20 yd of where he was.
- Cast time: instant.
- Cooldown or cadence: ~every 25 s while he is on the ground (wiki Classic, WT). Also used when he comes down from the balcony (Wowhead guide).
- Effect: complete aggro wipe (wiki: "causes a complete aggro wipe"; Wowhead: "all threat is wiped fresh" each time he comes down). Cripple: -50% movement speed, +100% time between attacks, -50% Strength, 15 s, Magic dispel (Priest Dispel Magic / Paladin Cleanse), 20 yd radius.
- Telegraph: he vanishes and reappears; DBM announces Blink. The MT must be dispelled and Intercept/Charge back onto him.

### Summon Skeletons (Plagued Warriors)
- Name: Summon Skeletons (29237)
- Type: summon adds
- Target rule: summons 3 Plagued Warriors (one per effect), one at each large bone pile (Wowhead guide; wiki: NW, NE, SW spawn points).
- Cadence: every 30 s regardless of where Noth is (Wowhead, wiki); DBM: first 6.5–22.7 s after pull, then 30 s; 3 s after he reaches the balcony. Yell: "Rise, my soldiers! Rise and fight once more!"
- Telegraph: the yell and DBM timer.

### Teleport (balcony phases)
- Name: Teleport / balcony phase (no player-facing spell data)
- Type: teleport / untargetable phase
- Cadence: first at 90 s (DBM 90.6 s); returns after both waves die or 70 s (wiki; DBM 72.8–74.8 s). Second teleport 110 s after his return (wiki/WT; DBM 109 s, from Wrath data), balcony 2 ends after both waves or 90 s (wiki; DBM 97 s). Third teleport 180 s after his return (wiki/WT; DBM 173 s), balcony 3 two waves of Guardians, length "??" (wiki) / 126 s (DBM Wrath value).
- Effect: Noth cannot be attacked; waves spawn 3 s after he arrives and then every 30 s (DBM adds timer). Threat is not kept: when he blinks down, threat is reset.
- Telegraph: he teleports to the balcony; DBM "Teleport" bar.

### Plagued Champion — Mortal Strike (13737) and Shadow Shock (30138)
- Type: melee debuff / Shadow nuke on the tank. Mortal Strike reduces healing on the tank (Wowhead guide); Shadow Shock is periodic Shadow damage to the off-tank; Greater Shadow Protection Potion recommended. Numbers: unknown (spell pages not fetched).

### Plagued Guardian — Arcane Explosion (26192)
- Type: AoE around the Guardian; "extremely dangerous" (Wowhead); Guardians are immune to Shackle Undead (wiki) and must be stun-locked by rogues/warriors (Vanish → Cheap Shot, Kidney Shot). Damage value: unknown (spell page not fetched).

### Plagued Warrior — Cleave (15496)
- Type: frontal multi-target melee; face away from melee.

## Adds
- Plagued Warrior (16984): level 61, 34,000 HP, melee 532–684; 3 every 30 s at the bone piles during ground phases (and continuing during balcony phases per Wowhead "regardless of where Noth is"). Picked up by the three off-tanks; killed by ranged/casters (WT) or everyone while Noth is up top; they do not despawn when Noth dies (wiki). Can be Shackled.
- Plagued Champion (16983): level 61, 37,000 HP; two waves of several during balcony 1 and one wave during balcony 2; Mortal Strike + Shadow Shock on their tank; off-tanks with focused heals; Shackle-able.
- Plagued Guardian (16981): level 61, 17,608 HP, melee 2,953–3,382; one wave in balcony 2 (one Guardian per spawn point — wiki: "one per wave in phase 2", NE and SW) and two waves in balcony 3; Arcane Explosion; immune to Shackle; stun-lock and kill first.
- Wave size: wiki says "two waves" per balcony; exact counts per wave are not given in any Classic source.

## Positioning and movement
- Tank: MT holds Noth in the centre of the room with the raid (Wowhead). Expect Blink every ~25 s: get Cripple dispelled, Intercept back, re-establish threat (Shield Slam; full Protection spec recommended by the wiki). When he comes down from the balcony he arrives with zero threat on anyone — taunt/Intercept immediately. Off-tanks (3) stand at the bone piles (NW, NE, SW) facing the Warriors away from the raid. Never: let the MT stand in melee when Blink is due without a dispeller assigned; chase Noth across the room through a fresh skeleton pack.
- Melee DPS: spread behind the off-tanks around the room killing skeletons; when Noth is down, collapse to the centre and burst him; stop DPS the moment he Blinks until the MT has him back (WT). Rogues/warriors stun Guardians.
- Ranged DPS: with the centre group; nuke skeletons as they spawn (WT) and Noth when he is up; Mages spam Remove Lesser Curse on assigned groups.
- Healers: centre, spread so a single Wrath cannot hit everyone (35 yd). Druids/Mages decurse within 10 s — every time. A Priest/Paladin is assigned to dispel Cripple from the MT. Off-tank healers focus Champion tanks (Mortal Strike).
- Whole raid: stay inside the room before the pull (door locks). During balcony phases, split per wiki: half the raid on the NE Guardian, half on the SW Guardian, then Champions.

## What each role must do and must not do
- Tank:
  1. MT: pick Noth up in the centre; after every Blink get dispelled and Intercept; after every balcony return taunt instantly (threat reset).
  2. Off-tanks: hold the bone piles, face Warriors away, pick up Champions/Guardians as waves land; pull them into the raid's kill zone.
  3. Never lose track of which off-tank has which spawn point — a loose Plagued Warrior on a healer is the usual wipe (wiki).
- DPS:
  1. Ground phases: Noth is priority when targetable; stop when he Blinks until the MT has aggro.
  2. Balcony phases: kill priority Guardian (stun-locked) > Champion > Warrior; Shackle Champions you cannot kill before he returns.
  3. Mages: decurse on assignment. Warlocks/others: AoE skeleton packs.
  4. Benchmarks: ~80% at balcony 1, ~50% at balcony 2, dead before balcony 3 (wiki).
- Healer:
  1. Decurse (Druids) within 10 s of each Curse — the only real wipe mechanic.
  2. Dispel Cripple on the MT the instant he Blinks (Priest/Paladin).
  3. Off-tank healers: Champions' Mortal Strike + Shadow Shock → heavy, keep them topped; Shadow Protection.
  4. Shackle Undead (Priests) leftover Champions when Noth comes down.

## Timeline of a typical pull
- t=0: Pull; MT on Noth in the centre; off-tanks at the three piles.
- t≈6–23 s: first Summon Skeletons (3 Plagued Warriors); first Curse (6.5–25.9 s) → decurse within 10 s.
- t≈25 s, 50 s, 75 s: Blink + Cripple; threat wipe; MT dispelled and Intercepts. Skeletons every 30 s; Curse every ~52–67 s.
- t≈90 s: Teleport to the balcony. +3 s wave 1 (Plagued Champions), +30 s wave 2. Returns when both waves die or after ~73 s (t≈163 s).
- t≈163–272 s: Ground 2 (~110 s): threat reset on arrival; curses, skeletons, blinks continue. Target 50% here.
- t≈272 s: Teleport 2: Champions then Guardians (stun-lock Guardians). Returns after both waves or ~90–97 s.
- t≈365–545 s: Ground 3 (~180 s): kill him here. If he teleports a third time (two Guardian waves), the raid is expected to wipe.

## Open questions
- Balcony/ground durations after the first cycle: wiki says 110 s / 90 s / 180 s / ??; DBM-Vanilla uses 109 / 97 / 173 / 126 / 93 / 55 but flags them "Unknown in Classic" (Wrath-derived).
- Curse target count: spell data "Max targets 20" (and a "10" row); wiki says melee only / 20 closest; Wowhead "multiple targets".
- Wrath initial damage school: tooltip text "Nature damage", effect data School Damage (Shadow) 1,758; DoT text "875 to 1125 shadow every 2 sec" vs description "every 5 sec".
- Blink spell ID: 29208 (DBM) vs 29211 (Wowhead guide link, a generic mage Blink used by "Corrupted Weapon").
- Blink cadence: ~25 s (wiki, WT); no DBM timer exists for it in Classic.
- Wave composition/counts per balcony wave: not given numerically in any fetched source.
- Plagued Champion Mortal Strike/Shadow Shock and Guardian Arcane Explosion values: spell pages not fetched.
- Boss HP: 1,492,487 (classicdb.ch); wiki page lists none.
