# Kel'Thuzad (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Kel%27Thuzad_(Classic) — Classic 40-man page: Phase 2 starts 5:10 after engage; ~3,150,000 HP; taunt-immune; Phase 3 at 40%; Phase 1 adds (Soldiers 2,000/5,000 HP, ~120, Dark Blast 2,503–3,097 Shadow and self-kill, shackle-able; Abominations 100,000 HP, ~14, Mortal Wound, ~4,000 on plate; Soul Weavers 140,000 HP, ~14, Wail of Souls 6,375–8,625 + 30 yd knockback, up to 3 players); Phase 2 table (Frostbolt 2 s 9,000–11,000 interruptible; Volley 2,750–3,500 every 15 s; Chains 60 s CD, 5 players, +200% dmg/+500% healing; Mana Detonation 20 s CD, 10 yd, after 4 s, half current mana; Shadow Fissure 3 s → 62,500–137,500, 10 s CD; Frost Blast 30 s CD, 10 yd chain, 104% of max HP over 5 s, heal within 4 s); Phase 3 (5 Guardians, Blood Tap +15%/+10% size per stack up to 99, >3 shackles → dispel, tauntable, flee on kill); composition 6–7 tanks, 10–13 healers; positioning (melee diamond 8 yd apart, ranged circle 8 yd apart); quotes.
- https://www.wowhead.com/classic/guide/kelthuzad-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: pre-pot GFPP (casters GNPP); Phase 1 raid stacked in the centre, ranged kill Soldiers/Weavers, melee Abominations; Phase 2 spread; Frostbolt single 2 s on the top threat — interrupt; Volley every 15 s + 4 s slow; Chains targets the MT + 4 others every 60 s (MC'd healers heal him — dispel his buffs); Shadow Fissure 3 s → 62,000; Detonate Mana half mana over 5 s then explodes; Frost Blast every 30 s, 10 yd, 104% HP in 5 s; Phase 3 at 40%: 5 Guardians, Shackle max 3 (Shackle Shatter), Blood Tap stacks to 99, off-tanks/hunters kite; Guardians despawn on his death.
- https://www.wowhead.com/classic/spell=28478/frostbolt — Frostbolt (single): 2 s cast, 40 yd, 7,438 Frost (effect), -65% movement 4 s, Magic dispel.
- https://www.wowhead.com/classic/spell=28479/frostbolt — Frostbolt Volley: instant, 200 yd, 2,550 Frost (effect), -50% movement 4 s, 8 s cooldown, cannot crit.
- https://www.wowhead.com/classic/spell=28410/chains-of-kelthuzad — Chains: instant, 20 s, Mind Control (AoE, value 99), +200% damage done, +500% healing taken, +201% size, unaffected by invulnerability.
- https://www.wowhead.com/classic/spell=27819/detonate-mana — Detonate Mana: 5 s aura, triggers the detonation at 5 s, unaffected by invulnerability.
- https://www.wowhead.com/classic/spell=27810/shadow-fissure — Shadow Fissure: instant, summons a Shadow Fissure object (10 s), 5 s cooldown, player-targeted.
- https://www.wowhead.com/classic/spell=27808/frost-blast — Frost Blast: instant, unlimited range, 5 s stun + 1 s periodic trigger in 10 yd, 5 s cooldown, unaffected by invulnerability.
- https://www.wowhead.com/classic/spell=28457/dark-blast — Dark Blast: 1,750 Shadow (effect) in 100 yd radius + Instakill (self).
- https://www.wowhead.com/classic/spell=28459/wail-of-souls — Wail of Souls: 40 yd range, 4,250 Shadow (effect) in 30 yd + knockback.
- https://www.wowhead.com/classic/spell=28470/blood-tap — Blood Tap: 10 yd, +15% damage, +10% size per stack, 200% weapon damage strike.
- https://www.wowhead.com/classic/spell=25646/mortal-wound — Mortal Wound: -10% healing taken, 30 s, stacks.
- https://classicdb.ch/?npc=15990 / 16427 / 16428 / 16429 / 16441 — Kel'Thuzad 2,500,000 HP (melee 9,853–11,301, armor 3,795); Soldier of the Frozen Wastes 8,900 HP (melee 1,250–1,600); Unstoppable Abomination 97,000 HP; Soul Weaver 70,000 HP; Guardian of Icecrown 350,000 HP (melee 6,568–7,233).
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/FrostwyrmLair/Kel'Thuzad.lua — DBM Classic: Phase 2 timer 229.2–231 s ("variance used to be 229.2–245.8; patch on July 21, 2026 tightened it"); Phase 2 cooldowns: Shadow Fissure 10.9–42.1 s (first 10.4–38.4), Frostbolt single 2 s cast with CD 15.7–63.1 s (first 15.3–85.9), Detonate Mana 20.2–50.9 s (first 20.2–46.5), Frost Blast 30.3–82.4 s (first 30.3–92.7), Chains 63.1–145.4 s (first 21.8–103.4; cast ID 28408, aura 28410); Frost Blast debuff 5 s; "Phase 3 soon" at 45%, Phase 3 on the yell "Master! I require aid!".
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: Phase 1 ~310 s; Soldiers' Dark Blast; Weavers knock 3 players back; Phase 2 Frostbolt single 2 s must be interrupted (melee diamond), Volley every 15 s, Mana Detonation every 20 s, Shadow Fissure every 10 s, Frost Blast every 30 s (dead in 5 s unless healed), Chains ~1 min CD on the tank + 4 (damage ×5 — sic — and heals the boss), threat dropped on release; Phase 3 at 40%: 5 Guardians, 3 shackled, 2 tanked, Blood Tap +15% on target switch or death.

## Overview
- Level ?? boss, Undead lich, mana user. HP 2,500,000 (classicdb.ch) / ~3,150,000 (wiki). Immune to Taunt. No hard enrage documented; Phase 3 Blood Tap stacking and healer mana are the soft limits. Final boss of Naxxramas, in Kel'Thuzad's Chamber behind Sapphiron; requires Sapphiron dead.
- Phases: Phase 1 — Kel'Thuzad invulnerable in his alcove; portals around the room spawn Soldiers, Abominations and Soul Weavers at an accelerating rate until a timer (5:10 wiki/WT; 229–231 s DBM 2026). Phase 2 — he engages: Frostbolts, Volley, Chains, Detonate Mana, Shadow Fissure, Frost Blast. Phase 3 — at 40% HP ("Master! I require aid!") five Guardians of Icecrown join; Phase 2 abilities continue.
- Raid-size assumptions: 40-man Classic Era; 6–7 tanks (wiki), 10–13 healers, 3 Priests for Shackles, ample interrupters (rogues/warriors) on the single Frostbolt. Light frost resistance only (Wowhead: a few pieces; wiki: not advised).

## Abilities

### Phase 1 adds (see Adds)
- Soldier of the Frozen Wastes — Dark Blast (28457): on reaching a player the Soldier explodes: 1,750 Shadow (effect value; wiki 2,503–3,097, not partially resistible) to players in range (effect radius 100 yd — wiki "to the raid") and kills itself. Shackle-able. Slow walkers. "Two reaching the raid at once is a wipe" (wiki).
- Unstoppable Abomination — Mortal Wound (25646): -10% healing per stack on its tank, 30 s; hits ~4,000 on plate, ~5,000 with Mortal Wound (wiki). Normal run speed.
- Soul Weaver — Wail of Souls (28459): 40 yd, 4,250 Shadow (effect; wiki 6,375–8,625) in a 30 yd radius plus a knockback (wiki: 30 yd, up to 3 players) — used only near its primary target. Slow.

### Frostbolt (single target)
- Name: Frostbolt (28478)
- Type: targeted
- Target rule: his current/top-threat target (the MT).
- Cast time: 2 s — interruptible (Kick, Pummel, Shield Bash, Earth Shock, Counterspell).
- Cadence: variable 15.7–63.1 s, first 15.3–85.9 s into Phase 2 (DBM); wiki "random, often chain-cast".
- Damage: 7,438 Frost (effect; wiki 9,000–11,000, not resistible) + -65% movement for 4 s (Magic dispel). "In many situations this cast landing leads to a dead Main Tank" (Wowhead).
- Telegraph: 2 s cast bar; DBM interrupt warning.

### Frostbolt Volley
- Name: Frostbolt (28479)
- Type: AoE (room)
- Target rule: everyone within 200 yd.
- Cast time: instant; 8 s spell cooldown; observed every ~15 s (wiki, Wowhead, WT).
- Damage: 2,550 Frost (effect; wiki 2,750–3,500 ≈ 60% of a raider's HP), fully resistible (FR gear / GFPP absorb), -50% movement 4 s (Magic). Cannot crit.
- Telegraph: none; DBM none (cadence only). Bandage between volleys (Wowhead).

### Chains of Kel'Thuzad
- Name: Chains of Kel'Thuzad (28410; cast 28408)
- Type: mind control (multi-target) + threat wipe
- Target rule: the top-threat player (the MT — Wowhead, wiki) plus 4 random others (5 total; spell "Mind Control AoE").
- Cast time: instant.
- Cadence: 60 s cooldown (wiki, Wowhead, WT "about a minute, sometimes two"); DBM 63.1–145.4 s, first 21.8–103.4 s into Phase 2.
- Effect: Charmed for 20 s (tooltip); charmed players deal +200% damage, receive +500% healing, +201% size; the MT's threat is wiped (Wowhead) and all threat on the victims is reset (wiki). Charmed healers heal/buff him (dispel his buffs — Wowhead). Humanoid CC (Polymorph, Fear, stuns, roots) works on charmed players.
- Telegraph: yell "Your soul, is bound to me now!"; DBM target list. Off-tanks must grab him (taunt-immune → threat only), DPS stop.

### Detonate Mana
- Name: Detonate Mana (27819)
- Type: targeted debuff → AoE
- Target rule: a random mana user.
- Cadence: 20 s cooldown (wiki, WT); DBM 20.2–50.9 s, first 20.2–46.5 s.
- Effect: 5 s aura, then detonation (wiki: after 4 s): burns half the target's current mana and deals Arcane damage based on that to all players within 10 yd except the target (wiki). Greater Nature/Arcane protection does not apply; spread 10 yd.
- Telegraph: debuff "Your mana has become unstable!" (5 s); yell "Enough! I grow tired of these distractions!"; DBM move-away warning. Run away from everyone.

### Shadow Fissure (Void Blast)
- Name: Shadow Fissure (27810)
- Type: ground hazard (delayed)
- Target rule: placed under a random player (summon at 1 yd); the Fissure object lasts 10 s.
- Cadence: 10 s (wiki, WT); DBM 10.9–42.1 s, first 10.4–38.4 s; 5 s spell cooldown.
- Damage: after 3 s the Void Blast deals 62,500–137,500 Shadow (wiki; Wowhead 62,000) to anyone standing in the red circle — a one-shot. Fully avoidable by stepping out within 3 s.
- Telegraph: red demonic circle on the ground for 3 s.

### Frost Blast
- Name: Frost Blast (27808)
- Type: targeted stun (ice block) with chain
- Target rule: a random player; everyone within 10 yd is also blocked; blocks chain to players within 10 yd of those (wiki, WT).
- Cadence: 30 s (wiki, Wowhead, WT); DBM 30.3–82.4 s, first 30.3–92.7 s; 5 s spell cooldown.
- Effect: Stunned 5 s with Frost damage every 1 s totalling 104% of max HP over the 5 s (~21% per second — wiki/Wowhead; wiki strategy text says 130%). Victims die unless healed within ~4 s (wiki, Wowhead).
- Telegraph: yell "I will freeze the blood in your veins!"; ice-block visuals; DBM "heal all" warning with the target list. Melee diamond 8 yd apart limits a Frost Blast to <6 players (wiki).

### Phase 3 — Guardians of Icecrown (summon at 40%)
- 5 Guardians (16441): 350,000 HP (classicdb; wiki "as much HP as Kel'Thuzad"), melee 6,568–7,233 (~1,000 on plate initially, ~1,500 on their aggro target — wiki). Blood Tap (28470): +15% damage and +10% size per stack (up to 99), gained each time the Guardian switches target or a player dies (wiki, WT). Shackle Undead works, maximum 3 at once — a 4th causes Shackle Shatter (10836) breaking all shackles (Wowhead, wiki). Tauntable. They flee/despawn when Kel'Thuzad dies.

## Adds
- Soldier of the Frozen Wastes (16427): 8,900 HP (classicdb; wiki 2,000 or 5,000), slow, ~120 over Phase 1 (wiki); killed by ranged (and healers) before reaching the raid; Dark Blast on contact. Shackle-able.
- Unstoppable Abomination (16428): 97,000 HP (classicdb; wiki 100,000), ~14 over Phase 1, normal speed, Mortal Wound; tanked in the centre and killed by melee; taunt-swap at high stacks.
- Soul Weaver (16429): 70,000 HP (classicdb; wiki 140,000), ~14, slow; Wail of Souls near its target; killed by ranged at range; call out their targets (wiki).
- Spawns come from the portals around the room, progressively faster toward the end of Phase 1 (wiki); no exact spawn table exists in the fetched sources.
- Guardian of Icecrown (16441) ×5 in Phase 3 — see above; 3 shackled by Priests at their spawn portals, 2 tanked/kited (off-tanks; hunters with Aspect of the Cheetah / mages as backup kiters — Wowhead).

## Positioning and movement
- Tank: Phase 1 — tanks in the centre, taunt Abominations as they arrive (taunt rotation for Mortal Wound). Phase 2 — MT picks Kel'Thuzad up and holds him in the middle of the room; he cannot be taunted, so every Chains (MT charmed, threat wiped) means a pre-assigned off-tank must already be high on threat and take over; MT needs the single Frostbolt interrupted — stand where melee can reach him. Phase 3 — two off-tanks on the free Guardians (hold them away from the raid; kite if Blood Tap grows), Shield Wall when a tank must take the boss after Chains (wiki). Never: let the MT be the only tank with threat; move him out of the melee diamond.
- Melee DPS: Phase 1 on Abominations only, below the tanks on threat. Phase 2/3: diamond around his hitbox, 8 yd apart (wiki), so one Frost Blast catches fewer than 6; interrupt rotation on the 2 s Frostbolt (rogues pool energy — Wowhead); step out of any Shadow Fissure within 3 s and back in; stop DPS during Chains.
- Ranged DPS: Phase 1 around the inner blue circle, kill Soldiers and Soul Weavers before they reach the centre. Phase 2/3: circle around the room 8–10 yd apart (Mana Detonation 10 yd, Frost Blast chain 10 yd, Fissure); move out of Fissures; CC charmed players (Polymorph, Fear, roots). Phase 3: help kite free Guardians if tanks fall.
- Healers: Phase 1 centre, heal Abomination tanks (Mortal Wound) and help DPS Soldiers. Phase 2/3: spread like ranged; priority 1 = Frost Blast victims within 4 s (Prayer of Healing/Chain Heal on the melee group — wiki), priority 2 = MT after Frostbolts, priority 3 = Volley every 15 s; Priests ×3 own the Guardian Shackles in Phase 3 and stand near their assigned portal; dispel buffs a charmed healer puts on Kel'Thuzad.
- Whole raid: Phase 1 stack centre (pets passive); Phase 2 "C'Thun/Sapphiron-style" spread map; Phase 3 same plus shackle spots at portals. Potions: GFPP pre-pot (Volley), GNPP for casters (Detonate Mana — Wowhead); bandage between Volleys.

## What each role must do and must not do
- Tank:
  1. P1: taunt-rotate Abominations; never let one reach healers.
  2. P2: MT holds in the centre; 2+ off-tanks keep threat #2/#3 (taunt-immune boss) for Chains; call Frostbolt casts for interrupters.
  3. P3: pick up the 2 unshackled Guardians immediately (every target switch = +15% damage stack); Shield Wall when taking the boss after Chains.
- DPS:
  1. P1: kill priority Soldiers > Soul Weavers (ranged) / Abominations (melee); nothing may reach the centre.
  2. P2: interrupt every 2 s Frostbolt (rotation); leave Shadow Fissures within 3 s; spread 8–10 yd; run away with Detonate Mana (5 s); stop DPS and CC the charmed during Chains (20 s).
  3. P3: same, plus don't break Shackles with AoE; never pull a Guardian (threat discipline after Chains).
  4. Decurse/dispel: Frostbolt slows are Magic (optional); nothing else dispellable.
- Healer:
  1. Frost Blast: heal the blocked players within 4 s (104% HP over 5 s) — Prayer of Healing/Chain Heal pre-positioned.
  2. Top the raid every ~15 s after Volley (2,550–3,500); keep GFPP rolling.
  3. MT: big heals after each landed Frostbolt (7,438–11,000); a dead MT is the usual wipe.
  4. Priests: Shackle rotation on 3 Guardians (never more than 3); dispel Kel'Thuzad's buffs from charmed healers.
  5. Mana: Detonate Mana burns half your mana — carry Major Mana Potions / Dark Runes.

## Timeline of a typical pull
- t=-2:00: GFPP (+GNPP casters); raid stacks centre; pets passive.
- t=0: Engage ("Minions, servants, soldiers of the cold dark, obey the call of Kel'Thuzad!"). Phase 1: Soldiers/Weavers/Abominations stream from the portals, faster over time (~120 / 14 / 14 total).
- t≈3:50 (DBM 229–231 s) or 5:10 (wiki/WT): Phase 2 — he walks out; MT grabs him; raid spreads.
- P2 +10–38 s: first Shadow Fissure; +15–86 s: first single Frostbolt (then every ~16–63 s — interrupt); every ~15 s: Volley; +20–46 s: first Detonate Mana (then ~20–50 s); +30–93 s: first Frost Blast (then ~30–82 s); +22–103 s: first Chains (then ~63–145 s).
- 45% HP: DBM "Phase 3 soon"; 40% HP: "Master! I require aid!" → 5 Guardians: 3 shackled, 2 tanked; Phase 2 rotation continues.
- Kill: 2.5–3.15M HP; Guardians despawn on death ("Do... not... rejoice! Your victory is a hollow one...").

## Open questions
- Phase 1 duration: 5:10 (wiki) / ~310 s (WT) vs 229.2–231 s (DBM-Vanilla, log-derived, noting a July 2026 patch) — the current Era value may be ~3:50; confirm in-game.
- Boss HP: 2,500,000 (classicdb.ch) vs ~3,150,000 (wiki).
- Add HP: Soldier 8,900 (classicdb) vs 2,000/5,000 (wiki); Soul Weaver 70,000 vs 140,000; Abomination 97,000 vs 100,000; Guardian 350,000 vs "as much as Kel'Thuzad".
- Dark Blast: 1,750 (spell) vs 2,503–3,097 (wiki); its 100 yd effect radius vs "on contact" behaviour.
- Wail of Souls: 4,250 (spell) vs 6,375–8,625 (wiki); knockback 30 yd (wiki).
- Frostbolt single: 7,438 (spell) vs 9,000–11,000 (wiki); Volley 2,550 vs 2,750–3,500.
- Ability cadences: guides give fixed 10/15/20/30/60 s; DBM Classic shows wide variable windows (Fissure 10.9–42.1, Detonate 20.2–50.9, Frost Blast 30.3–82.4, Chains 63.1–145.4 s).
- Frost Blast damage: 104% of max HP over 5 s (wiki ability table, Wowhead) vs 130% (wiki strategy text).
- Chains duration: 20 s (spell tooltip) — guides give none; charm count 5 (wiki/Wowhead/WT) vs spell value 99 (AoE cap).
- Detonate Mana delay: 5 s (spell aura, Wowhead) vs 4 s (wiki).
- Phase 3 threshold: 40% (wiki, Wowhead, WT); DBM warns at 45% only as "soon".
- Berserk: none in any Classic source.
