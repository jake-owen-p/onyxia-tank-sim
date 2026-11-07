# Majordomo Executus (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Majordomo_Executus — Aegis 30,000 absorb / 250 to melee / 5 min, Damage Shield 100 arcane, Magic Reflection 50% 10 s, Teleport into coals; adds' abilities; shields every ~10 s rotation, white/purple shield calls; sheep disabled after 4 adds die; Follow-the-Leader kill order; 1.3.0 polymorph immunity note.
- https://warcraft.wiki.gg/wiki/Flamewaker_Healer — level 30 (display), Shadow Shock 1098 nearby, Shadow Bolt 2058, Dark Mending 27,750–32,250, Berserk +150% speed/+500 dmg 5 min; immune to Polymorph when far from Executus.
- https://warcraft.wiki.gg/wiki/Flamewaker_Elite — level 32 (display), Blast Wave 50% slow 8 s, Fire Blast 841, Fireball 1262.
- https://www.wowhead.com/tbc/npc=12018/majordomo-executus (r.jina.ai) — health 666,200; spells 20620, 20619, 21075, 20618, 20229; Healer 21077 + Greater Heal 29564; Elite 20623 + 20229.
- https://www.wowhead.com/classic/npc=12018/majordomo-executus (r.jina.ai) — Seasonal 40 health 1,332,400; "forcing him to submit after defeating all 8 of his guardians".
- https://www.wowhead.com/wotlk/npc=11663/flamewaker-healer (r.jina.ai) — Healer level 60, health 97,680, mana 29,208.
- https://www.wowhead.com/tbc/npc=11664/flamewaker-elite (r.jina.ai) — Elite level 61–62, health 103,600, mana 30,816.
- https://wotlkdb.com/?spell=20619 — Magic Reflection: instant, 30 s cooldown, 35 yd range, 100 yd radius, 10 s, reflect 50% of spells.
- https://wotlkdb.com/?spell=21075 — Damage Shield: instant, 30 s cooldown, 35 yd, 100 yd radius, 10 s, 100 damage to melee attackers.
- https://wotlkdb.com/?spell=20620 — Aegis of Ragnaros: 5 min, absorbs 30,000 of all schools, 250 damage shield, heal to full.
- https://wotlkdb.com/?spell=20618 and https://wotlkdb.com/?spell=20534 — Teleport (random player / current target): instant, 45 yd.
- https://wotlkdb.com/?spell=20229 — Blast Wave: 10 yd radius, 694–806 Fire, -50% speed 8 s.
- https://wotlkdb.com/?spell=20623 — Fire Blast: instant, 20 yd, 1080–1320 Fire.
- https://wotlkdb.com/?spell=21077 — Shadow Bolt (Healer): 0.5 s, 40 yd, 1350–1650 Shadow.
- https://wotlkdb.com/?spell=20603 — Shadow Shock (Healer): instant, 20 yd radius, 740–860 Shadow.
- https://wotlkdb.com/?spell=19775 — Dark Mending: 2 s, 60 yd, heals 27,750–32,250.
- https://wotlkdb.com/?spell=29564 — Greater Heal (TBC-era ID listed by Wowhead): 2.5 s, 40 yd, 11,250–13,750.
- https://wotlkdb.com/?spell=21087 — Serverside Immunity (after 4 add deaths): 100 yd, 30 min, immune to Polymorph and Confuse.
- https://wotlkdb.com/?spell=21086 — Encouragement (per add death): 100 yd, +8% damage, +6% size, 30 min.
- https://wotlkdb.com/?spell=21090 — Champion (last add): +50% haste, heal to full, +25% size, 30 min.
- https://wotlkdb.com/?spell=21094 and https://wotlkdb.com/?spell=21095 — Separation Anxiety (100 yd aura → Healer buff): +200% damage, Polymorph immunity, 5 s.
- https://wotlkdb.com/?spell=19773 — Elemental Fire (Ragnaros kills Executus): 0.5 s, 100 yd, instakill.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_majordomo_executus.cpp — timers: shields first 15 s then every 30 s (50/50 Damage/Magic Reflection); Teleport (victim) first 15 s, Teleport (random) first 30 s, each then 25–30 s, followed by Hate to Zero; Aegis first 5 s then 25–30 s; polymorph immunity at 4 of 8 adds dead; Encouragement per death, Champion on last; defeat and Ragnaros summon speech timings.
- https://raw.githubusercontent.com/scriptdev2/scriptdev2-classic/master/scripts/eastern_kingdoms/molten_core/boss_majordomo_executus.cpp — older timers: Magic Reflection 30/30 s, Damage Reflection 15/30 s, Blast Wave 10/10 s, Teleport 20/20 s on random attacker, Aegis on lethal hit or below 90% every 10 s.
- https://www.wowhead.com/classic/guides/majordomo-executus-molten-core-strategy (r.jina.ai) — Aegis 30,000 / 250 per melee hit, Teleport sends primary target into the coals, Elites CC-immune, "once 4 enemies are dead the rest become immune to CC", kite with hunters, Muffpotter kill-order comment.
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/244 (Warcraft Tavern) — ability table: Damage Shield / Magic Reflection 30 s CD, 35 yd, 10 s; Teleport 45 yd; Aegis 5 min; Blast Wave 6 s; 7 runes doused with Aqual Quintessence.
- https://wowtbc.gg/classic/boss-guides/molten-core — SoM: CC immunity after 2 deaths; teleport the MT to centre coals; hunter kites an Elite down the ramp with Cheetah/Feign Death.
- https://mein-mmo.de/en/wow-classic-how-much-blizzard-buffs-the-molten-core-in-the-classic-mode,742902 — SoM: Healers CC-immune after 2 deaths.

## Overview
- Level ?? (boss). Health 666,200 (Era 40-player); 1,332,400 Seasonal. Cannot be killed: Aegis of Ragnaros heals him to full and absorbs 30,000 whenever cast. The encounter is won when all 8 adds (4 Flamewaker Healers, 4 Flamewaker Elites) die; Executus submits, becomes friendly and opens the Cache of the Firelord, then can be spoken to in Ragnaros' lair to summon Ragnaros. Spawns only after Magmadar, Gehennas, Garr, Geddon, Shazzrah, Sulfuron and Golemagg are dead and their 7 runes doused with Aqual Quintessence (Lucifron has no rune). No enrage; each add death buffs the remaining adds +8% damage (Encouragement) and the last one gets +50% haste (Champion), so the fight gets harder as it progresses.
- Phases: effectively (1) 8 adds, CC allowed; (2) after 4 add deaths, remaining adds immune to Polymorph/CC; (3) last add gets Champion; (4) submission + Ragnaros summon RP.
- Raid-size assumptions: 40-man Era. SoM: CC immunity after 2 deaths, Elites gain Fireball Volley.

## Abilities

### Magic Reflection
- Name: Magic Reflection (spell 20619), the "white/purple shield" casters watch
- Type: other (buff on all adds)
- Target rule: all his minions within 100 yd (cast from 35 yd)
- Cast time: instant
- Cooldown or cadence: 30 s cooldown (DBC); cmangos picks Magic Reflection or Damage Shield 50/50 every 30 s starting at 15 s; scriptdev2 30 s; wiki "periodically ... 10 s shields".
- Damage: none; adds reflect 50% of harmful spells for 10 s
- Debuff: buff on adds, 10 s, not dispellable per sources
- Movement effect: none
- Telegraph: shield visual on all adds; raid addons announce. Casters stop.

### Damage Shield
- Name: Damage Shield (spell 21075; wiki "Damage Shield 100 arcane")
- Type: other (buff on all adds)
- Target rule: all minions within 100 yd
- Cast time: instant
- Cooldown or cadence: 30 s cooldown; alternates with Magic Reflection (see above). scriptdev2: first at 15 s then 30 s.
- Damage: 100 (Arcane per wiki) to any melee attacker per hit for 10 s
- Debuff: buff on adds, 10 s
- Telegraph: shield visual; melee stop (tanks keep tanking).

### Aegis of Ragnaros
- Name: Aegis of Ragnaros (spell 20620)
- Type: other (self shield + heal)
- Target rule: self
- Cast time: instant
- Cooldown or cadence: cmangos first 5 s then every 25–30 s; scriptdev2 on any lethal hit and below 90% HP every 10 s
- Damage: 250 to each melee attacker hitting him; absorbs 30,000 of any damage; heals him to full. 5 min duration.
- Debuff: buff; not dispellable
- Telegraph: shield visual on Executus. This is why he cannot die — do not DPS him.

### Teleport
- Name: Teleport (20618 on a random attacker; 20534 on current target), followed by Hate to Zero (20538)
- Type: teleport (of a player) + threat reset on that player
- Target rule: cmangos: current tank (first at 15 s) and a random attacker (first at 30 s), each every 25–30 s; wiki/Wowhead guide: "his primary threat target"; Executus "usually teleports the closest player" (wiki)
- Cast time: instant, 45 yd
- Cooldown or cadence: 25–30 s per variant (cmangos); 20 s (scriptdev2)
- Damage: the player lands in the burning coals at the room's centre and takes fire damage while standing there; their threat is zeroed, so Executus wanders toward the raid
- Debuff: none
- Movement effect: teleport to the coals
- Telegraph: none; the tank must walk out of the coals and taunt immediately (or a hunter Distracting Shots him).

### Blast Wave (Executus and Elites)
- Name: Blast Wave (spell 20229)
- Type: AoE (around caster)
- Target rule: everyone within 10 yd of the caster
- Cast time: instant
- Cooldown or cadence: scriptdev2 Executus every 10 s; Elites unknown
- Damage: 694–806 Fire + 50% movement slow for 8 s (Warcraft Tavern says 6 s)
- Debuff: slow 8 s, no dispel type listed
- Telegraph: none

### Shadow Shock (Flamewaker Healer)
- Name: Shadow Shock (spell 20603)
- Type: AoE (around caster)
- Target rule: everyone within 20 yd of the Healer
- Cast time: instant
- Cooldown or cadence: unknown (frequent per guides)
- Damage: 740–860 Shadow (wiki: 1098)
- Telegraph: none

### Shadow Bolt (Flamewaker Healer)
- Name: Shadow Bolt (spell 21077)
- Type: targeted
- Target rule: random/tank, 40 yd
- Cast time: 0.5 s; interruptible (Wowhead guide)
- Damage: 1350–1650 Shadow (wiki 2058)

### Dark Mending (Flamewaker Healer)
- Name: Dark Mending (spell 19775) [Wowhead TBC lists Greater Heal 29564, 2.5 s, 11,250–13,750 instead]
- Type: heal
- Target rule: injured ally within 60 yd
- Cast time: 2 s; interruptible — stun/interrupt Healers (wiki)
- Damage: heals 27,750–32,250

### Fire Blast / Fireball (Flamewaker Elite)
- Name: Fire Blast (20623), Fireball (ID not found)
- Type: targeted
- Target rule: current target / random, 20 yd (Fire Blast)
- Cast time: Fire Blast instant; Fireball cast (interruptible per Wowhead guide)
- Damage: Fire Blast 1080–1320 (wiki 841); Fireball 1262 (wiki)

### Encouragement / Champion / Immunity (encounter scripting)
- Encouragement (21086): each time an add dies, all remaining adds get +8% damage and +6% size (stacking, 30 min).
- Immunity (21087): when 4 of the 8 adds are dead, remaining adds become immune to Polymorph and Confuse (wiki 1.3.0, Wowhead guide "once 4 enemies are dead"; SoM: after 2).
- Champion (21090): the last living add is healed to full and gains +50% attack speed.
- Separation Anxiety (21094/21095): a Healer dragged out of Executus' 100 yd aura gains +200% damage and Polymorph immunity (refreshing 5 s) — keep adds near him.

## Adds
- 4x Flamewaker Healer (NPC 11663), level 60 elite, 97,680 HP, 29,208 mana. Abilities: Shadow Shock (20 yd AoE), Shadow Bolt, Dark Mending (interrupt), Berserk late. Polymorphable until 4 adds have died; assign one Mage per Healer to chain-sheep (bandage between sheeps, Detect Magic on sheep, never sheep during Magic Reflection), one Paladin per Mage as backup stunner. Killed one by one after the first Elite(s).
- 4x Flamewaker Elite (NPC 11664), level 61–62 elite, 103,600 HP, 30,816 mana. Abilities: Fire Blast, Blast Wave (10 yd, slow), Fireball. CC-immune from the start (Wowhead guide). Each tanked by an off-tank (one geared tank can hold two), or kited down the ramp by a Hunter with Aspect of the Cheetah / Feign Death. Standard "Follow the Leader" order (wiki): kill one Elite, then the four Healers (breaking one sheep at a time), then the other three Elites. Alternative (Muffpotter comment): two hunters kite two Elites, kill one Elite to 30–40%, break the first sheep, kill Healers one by one, then Elites.
- All adds spawn with Executus and must all die; Executus himself is tanked away and never DPS'd.

## Positioning and movement
- Tank: pull with a Paladin in Divine Shield (or Mage Ice Block / hunter pet) standing closer than the MT so the opening Teleport takes the immune player (wiki). Tank Executus on the far side of the coal pit from the raid so that when the tank is teleported into the coals, he is between Executus and the pickup point and can taunt immediately (Wowhead guide); walk out of the coals at once (fire damage). Hunter Distracting Shot covers the gap. Off-tanks hold Elites apart, each in Blast Wave-safe spots away from sheep.
- Melee DPS: follow the kill order; stop attacking when Damage Shield is up ("purple" per wiki) except the tanks; never touch Executus (Aegis 250 per hit, 30,000 absorb, full heal); stay out of Healer Shadow Shock range (20 yd) unless on that target; stay off the coals.
- Ranged DPS: stop casting when Magic Reflection is up ("white" per wiki); never cast on Executus; Mages are sheep-bots — one per Healer, not DPS, until their Healer is the kill target; interrupt Healer casts; spread 10 yd from Elites (Blast Wave).
- Healers: stay in range of all off-tanks; expect Shadow Shock on anyone near Healers; Fire Protection potions 2 min before pull (wiki); mana is the constraint (Major Mana Potions). Shadow/Fire Resistance totems/auras.
- Whole raid: fight on the platform around the coals, never on them; adds kept within 100 yd of Executus (Separation Anxiety); hunters kite Elites down the entry ramp and back.

## What each role must do and must not do
- Tank:
  1. Executus tank: expect to be teleported into the coals every 25–30 s; run out and taunt before he reaches the raid; position him across the pit from the raid.
  2. Elite tanks: hold Elites away from sheep and the raid; follow the leader's kill target; one Elite per tank early, two per tank when geared.
  3. Paladins assigned to Mages: stun or off-tank a Healer whose sheep breaks (especially under a shield) until it can be re-sheeped.
  4. Never DPS Executus.
- DPS:
  1. One target at a time, in the called order; break only one sheep at a time.
  2. Casters stop on Magic Reflection; melee stop on Damage Shield; both shields last 10 s and come every ~30 s.
  3. Interrupt Dark Mending and Shadow Bolt/Fireball casts.
  4. Mages: never Polymorph while Magic Reflection is up (you sheep yourself); bandage between casts.
  5. Remember: after the 4th add dies nothing can be CC'd; the last add gets +50% haste.
- Healer:
  1. Heal the teleported tank through coal damage and the Elite tanks through stacking Encouragement damage.
  2. Watch Shadow Shock clusters near Healers and Blast Wave near Elites.
  3. Conserve mana (long fight), pot early; dispel nothing is required (no dispellable debuffs listed).

## Timeline of a typical pull
- t=0: Paladin bubble-pulls; MT takes Executus across the coals; 4 Mages sheep the 4 Healers; OTs/hunters take the 4 Elites.
- t≈5 s: Executus' first Aegis (self, 30k absorb, heal to full) — irrelevant since he is not attacked; recast every 25–30 s.
- t≈15 s: first shield on all adds (Damage Shield or Magic Reflection, 10 s); then one every 30 s; melee/casters pause accordingly. First Teleport of the tank into the coals (then every 25–30 s); tank runs out and taunts.
- t≈30 s: second Teleport (random attacker) with threat zeroed on that player.
- ~1–2 min: Elite 1 dies (Encouragement +8% on the rest). Sheep breaks begin one Healer at a time; Healers die at roughly 1-minute intervals with interrupts.
- After the 4th add death (~4–5 min): all remaining adds immune to Polymorph; every remaining Healer must be tanked.
- Last add (Champion, +50% haste) dies at ~7–10 min; Executus yells, becomes friendly, teleports to the Cache; adds despawn.
- Ragnaros summon RP after gossip: ~70 s of dialogue (cmangos stage timers 5 + 1 + 11.5 + 8 + 8.7 + 11.7 + 8.7 + 16.5 s) then Ragnaros kills Executus with Elemental Fire; Ragnaros becomes attackable ~10–13 s later (see ragnaros.md).

## Open questions
- Shield cadence: DBC 30 s cooldown each (so one shield every 30 s if alternating, or two overlapping) vs wiki "shields lasting 10 seconds ... periodically".
- Teleport target: current tank (cmangos first cast, wiki, Wowhead guide) vs random attacker (scriptdev2, cmangos second variant) — both appear to exist.
- Polymorph immunity: after 4 deaths (Era: wiki, Wowhead guide, cmangos) vs after 2 (SoM: wowtbc.gg, mein-mmo).
- Healer heal spell: Dark Mending 19775 (27,750–32,250) vs Greater Heal 29564 (11,250–13,750) on Wowhead's TBC list.
- Healer/Elite damage values differ between DBC (Shadow Shock 740–860, Shadow Bolt 1350–1650, Fire Blast 1080–1320) and wiki.gg (1098 / 2058 / 841).
- Blast Wave slow duration 8 s (DBC) vs 6 s (Warcraft Tavern). Fireball spell ID not found.
