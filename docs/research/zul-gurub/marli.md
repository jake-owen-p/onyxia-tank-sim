# High Priestess Mar'li (Zul'Gurub)

Sources: list every URL used, one per line, with what it contributed.
- https://classic.warcraftdb.com/data/npc/14510 (API) — level 63 World Boss, health 333,125, mana 13,100; abilities Drain Life 24300, Enlarge 24109, Enveloping Webs 24110, Hatch Spider Egg 24082, Poison Bolt Volley 24099, Thrash 3391.
- https://classic.warcraftdb.com/data/npc/15041 — Spawn of Mar'li: level 60, 6,104 HP, Poison 24097.
- https://classic.warcraftdb.com/data/npc/11388 — Witherbark Speaker: level 61, 2,515 HP, 12,430 mana; Earth Shock 517 + interrupt (6 s cd), Frost Shock 486 -50% speed 8 s, Healing Wave 3 s 477, Lightning Bolt 3 s 128, Superior Healing Ward 2 s cast 30 s.
- https://classicdb.ch/?spell=24300 — Drain Life: channeled 7 s, 200 mana, 30 yd, Periodic Leech 500 per 1 s, Magic.
- https://classicdb.ch/?spell=24109 — Enlarge: instant, 100 yd, 60 s, +50% damage, +60% scale, Magic.
- https://classicdb.ch/?spell=24110 — Enveloping Webs: instant, 20 yd range, 10 yd radius, 8 s, root + silence + -100% melee haste.
- https://classicdb.ch/?spell=24099 — Poison Bolt Volley: instant, 30 yd radius, 375 Nature + 289 per 2 s for 10 s, Poison.
- https://classicdb.ch/?spell=24111 — Corrosive Poison: instant, 30 yd, 30 s, 657 Nature per 5 s, -5000 armor, Poison.
- https://classicdb.ch/?spell=24112 — Poison Shock: instant, 5 yd, 875 Nature in 10 yd radius.
- https://classicdb.ch/?spell=22911 — Charge: 8–25 yd, weapon +75, 2 s stun.
- https://classicdb.ch/?spell=24086 / 24088 — Growth +25% damage/+25% scale per application; Full Grown +50% melee haste.
- https://classicdb.ch/?spell=24083 / 24081 — Hatch Eggs (activates egg objects, 100 yd) → Summon Spawn of Mar'li (NPC 15041).
- https://classicdb.ch/?spell=24084 — Mar'li Transform (spider form).
- https://warcraft.wiki.gg/wiki/High_Priestess_Mar%27li_(Classic) — timed, repeating phases (~1 min each); starts with 4 Spawn of Mar'li; Drain Life 3,500 over 7 s healing 25x (12,500/s); Poison Bolt Volley 375–625 + 289–411/2 s 10 s within 30 yd; Spawn Growth +25% every 4 s, Full Grown after 20 s (+50% attack speed, CC immune), Poison ~50/3 s stacking 10; Witherbark Speaker abilities (Earth Shock 1,125–1,375, Frost Shock ~650, Lightning Bolt ~550, Superior Healing Ward 400–500/tick 30 s); Corrosive Poison 657–843/5 s -5,000 armor 30 s; Enveloping Webs roots/silences all within 20 yd 8 s, purges threat, then Charge; Poison Shock 875–1,125; tactics (MC the Speaker, two tanks swapping on webs/charge, cluster ranged outside AoE, kill spiders instantly, interrupt Drain Life).
- https://www.wowhead.com/classic/guide/high-priestess-marli-zul-gurub-strategy (via r.jina.ai) — OT waits with the ranged group; spider form is "random", wipes threat, roots melee with webs and she charges the ranged group; Poison Bolt Volley max range 30 yd so ranged/healers outrange it; no spiders spawn in spider form; interrupt Drain Life ("even one tick heals a lot").
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — MC the speaker, kill 4 spiders, webs+charge → OT takes over; interrupt life drain.
- https://www.tentonhammer.com/guides/zul-gurrub-boss-guide-boss-4-high-priestess-mar-li — AoE poison 400–600 DPS; web + ~5 s AoE silence; spiders grow from ~500–600 to ~1,800 per hit; two taunters 30 yd back; "spider form at ~90%" (2005 account); Blessing of Freedom on the tank.
- https://us.millenium.gg/guide/6831.html?page=4 — alternating Human/Beast phases; cocoons hatch spiders in human phase; volley dodged at max range; webs reset aggro and prevent casting; stand in melee range while the tank rebuilds threat in beast phase.
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — sheep the Speaker then kill after the first spider wave; OT taunts after webs and brings her back; dispel the lifetap (priest/paladin).
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_marli.cpp — phase change every 60,000 ms (first at 60 s) with threat reset on spider transform; Charge 1 s after Enveloping Webs on a random player; Hatch Eggs on aggro; spell IDs.

## Overview
- Level 63 ("??"), World Boss. Health 333,125 (Era), mana 13,100. No enrage timer. Third High Priest in the usual route (after Jeklik/Venoxis, before Thekal). REQUIRED: alive she grants Hakkar Aspect of Mar'li (6 s stun on the top-threat target).
- Phases: alternates Troll (priest) form and Spider (Shadra) form on a timer, ~60 s each (cmangos 60 s; wiki "about 1 minute"; Wowhead "randomly"). Always starts in Troll form. Each switch to spider form wipes threat, webs melee and she charges a ranged player. No HP thresholds.
- Raid-size assumptions: 20-man Classic Era. No SoD-specific data found.

## Abilities

### Drain Life (Troll form)
- Name: Drain Life (24300)
- Type: targeted channel / self heal
- Target rule: random player within 30 yd
- Cast time: channeled 7 s, interruptible (Kick, Shield Bash, Earth Shock, Counterspell); also Magic-dispellable from the victim (Amazon Basin: dispel immediately)
- Cooldown or cadence: unknown; "attempts" it repeatedly in troll form
- Damage: 500 health leeched per second (3,500 over 7 s) and heals her for 25x the amount drained ≈ 12,500 per second (wiki)
- Debuff: Drain Life, Magic, 7 s
- Movement effect: none
- Telegraph: channel beam to the target; wiki warns it is hard to see — assign a rogue/warrior rotation and a boss mod.

### Poison Bolt Volley (Troll form)
- Name: Poison Bolt Volley (24099)
- Type: AoE (30 yd)
- Target rule: all players within 30 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: 375 Nature (375–625) + 289 Nature (289–411) every 2 s for 10 s
- Debuff: Poison, 10 s — cleanse melee/tank
- Movement effect: none
- Telegraph: none; ranged/healers stand >30 yd and never take it.

### Enlarge (Troll form)
- Name: Enlarge (24109)
- Type: buff on adds
- Target rule: a Spawn of Mar'li or the Speaker (100 yd)
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: +50% physical damage, +60% size, 60 s; stacks with Growth
- Debuff: Magic buff — purge/dispel off the spider or just kill it
- Movement effect: none
- Telegraph: spider visibly grows

### Hatch Eggs / Summon Spawn of Mar'li (Troll form)
- Name: Hatch Eggs (24083) → Summon Spawn of Mar'li (24081)
- Type: summon adds
- Target rule: eggs/cocoons around her room (4 at pull per wiki/cmangos; "should only target 4 eggs")
- Cast time: instant
- Cooldown or cadence: 4 spiders at aggro, then "a couple" periodically through troll form (Wowhead), none in spider form
- Damage: n/a
- Debuff: n/a
- Movement effect: n/a
- Telegraph: yell SAY_SPIDER_SPAWN (cmangos); eggs visibly hatch

### Spider Form (transition)
- Name: Mar'li Transform (24084)
- Type: threat wipe + phase change
- Target rule: self
- Cast time: instant
- Cooldown or cadence: every ~60 s (first at ~60 s), lasts ~60 s, then transforms back (cmangos; wiki)
- Damage: n/a
- Debuff: n/a
- Movement effect: threat reset (cmangos DoResetThreat; wiki "purges threat"; Millenium "resets aggro"), immediately followed by Enveloping Webs then Charge
- Telegraph: yell SAY_TRANSFORM, transform visual

### Enveloping Webs (Spider form)
- Name: Enveloping Webs (24110)
- Type: AoE root/silence
- Target rule: players within 10 yd of her (DBC radius 10, range 20); wiki "all within 20 yd"
- Cast time: instant
- Cooldown or cadence: at the start of spider form (and possibly again during it; unknown)
- Damage: none
- Debuff: Enveloping Webs 8 s: rooted, silenced, -100% melee attack speed (Tentonhammer "~5 s silence")
- Movement effect: root 8 s
- Telegraph: cast on transform; melee are stuck, so the OT must already be with the ranged.

### Charge (Spider form)
- Name: Charge (22911)
- Type: charge
- Target rule: random player at 8–25 yd (cmangos: 1 s after webs)
- Cast time: instant
- Cooldown or cadence: once after each webs (cmangos); wiki "she charges afterward if possible"
- Damage: weapon +75 Physical, 2 s stun
- Debuff: stun 2 s
- Movement effect: she lands in the ranged group → OT taunts and walks her back
- Telegraph: follows webs by ~1 s

### Corrosive Poison (Spider form)
- Name: Corrosive Poison (24111)
- Type: debuff (tank)
- Target rule: primary target (30 yd)
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: 657 Nature (657–843) every 5 s for 30 s; armor -5,000
- Debuff: Poison, 30 s — cleanse the tank promptly (armor loss is the dangerous part)
- Movement effect: none
- Telegraph: none

### Poison Shock (Spider form)
- Name: Poison Shock (24112)
- Type: melee-range AoE
- Target rule: current target and players within 10 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: 875 Nature (875–1,125)
- Debuff: none
- Movement effect: none
- Telegraph: none

### Thrash
- Name: Thrash (3391)
- Type: melee
- Target rule: current target
- Cast time: passive
- Cooldown or cadence: random
- Damage: grants 2 extra melee attacks
- Debuff: none
- Movement effect: none
- Telegraph: none; tank damage spikes in spider form

## Adds
- Spawn of Mar'li (NPC 15041): level 60 non-elite spiders, 6,104 HP. 4 hatch at pull, more periodically in troll form. Growth: +25% damage and size every 4 s (wiki), Full Grown after ~20 s: +50% attack speed and immune to CC; Enlarge stacks on top. Poison on melee hit (36 Nature/3 s for 30 s DBC; wiki ~50/3 s stacking 10). Tentonhammer: from ~500–600 per hit to ~1,800 when grown. Kill them within seconds of hatching (Frost Nova + AoE / instant ranged); they need no tank while small; they do not despawn.
- Witherbark Speaker (NPC 11388): level 61, 2,515 HP, 12,430 mana, stands beside her. Shaman caster: Earth Shock (517 + 2 s interrupt), Frost Shock (486, -50% speed 8 s), Healing Wave, Lightning Bolt, Superior Healing Ward. Either a priest Mind Controls it at pull so it attacks Mar'li (she kills it, buying the tank time), or sheep it and kill it after the first spiders, or the OT pulls it to the raid and DPS kill it instantly.

## Positioning and movement
- Tank: MT tanks her exactly where she stands for the whole fight (Wowhead) with no one else within 10 yd except melee. OT stands with the ranged group >30 yd away. On spider form: MT is webbed and threat is wiped; she charges a ranged player; OT taunts, re-establishes and walks her back to the MT spot; roles swap (old MT walks to the ranged group for the next transition). Paladins can Blessing of Freedom the taunting tank to ignore the root (Tentonhammer).
- Melee DPS: in melee only after the MT has threat; accept Poison Bolt Volley (cleansed) and Enveloping Webs; when webbed, wait — do not run after her; resume when she is back in position. Kill spiders that hatch near you first.
- Ranged DPS: cluster tightly as a group >30 yd from her (outranges Poison Bolt Volley, and lets the OT pick her up instantly after the charge); instant-kill any Spawn of Mar'li (call it); DoTs/wands on her otherwise. Ranged also get webbed/silenced if she lands among them — stay clumped so only the charge target area is affected and the OT is already there.
- Healers: >30 yd with the ranged group; cleanse Poison Bolt Volley/Corrosive Poison on tank and melee; dispel Drain Life (Magic) on the victim if the interrupt misses; HoT the charge target (2 s stun + spider melee).
- Whole raid: clear the adjacent room first; two fixed spots — "boss spot" (MT + melee) and "ranged spot" (>30 yd, OT waiting). No run-out, no LoS tricks.

## What each role must do and must not do
- Tank:
  1. Two tanks minimum; agree the boss spot and ranged spot before the pull.
  2. OT: stand in the ranged group; the instant she transforms and charges, taunt and walk her back; do not DPS her near the ranged.
  3. MT: after being webbed/wiped, walk to the ranged group and become the next OT.
  4. Get Corrosive Poison cleansed (−5,000 armor) and Poison Bolt Volley cleansed.
  5. Never tank her near the ranged (webs + silence on healers).
- DPS:
  1. Kill the 4 initial spiders first; kill every later spider within seconds (they are CC-immune after 20 s).
  2. Interrupt Drain Life immediately (rotation of rogues/warriors; mages Counterspell backup) — every missed second heals her ~12.5k.
  3. Stop DPS at each spider transform until the OT has her back in position (threat wipe).
  4. Ranged stay >30 yd; melee cleanse up and do not chase her after webs.
  5. Do not pull the Speaker before MC/sheep is ready.
- Healer:
  1. Stay >30 yd (Poison Bolt Volley), clumped with ranged.
  2. Cleanse Corrosive Poison on the tank fast; cleanse volley poison on melee.
  3. Dispel Drain Life off the victim if not interrupted.
  4. Pre-HoT the OT before each expected transform (~60 s cycle) and the charge target.

## Timeline of a typical pull
- t=0: Priest MCs the Witherbark Speaker (or it is sheeped/pulled); 4 Spawn of Mar'li hatch — Frost Nova + AoE kills them; MT establishes on Mar'li at her spot. Troll form: Drain Life attempts (interrupt), Poison Bolt Volley on melee, Enlarge on spiders, occasional new hatches.
- t≈60 s: Spider form — threat wiped, Enveloping Webs roots/silences melee for 8 s, ~1 s later she charges a ranged player (2 s stun); OT taunts and brings her back; Corrosive Poison on the tank, Poison Shock on melee. No new spiders.
- t≈120 s: back to Troll form (yell); the old MT is now with ranged; Drain Life/volley/hatches resume.
- Repeat every ~60 s until dead. With 333k HP a 20-man raid typically sees 2–4 transforms.
- Death: Hakkar loses Aspect of Mar'li.

## Open questions
- Phase timing: 60 s cycle (cmangos, wiki "about 1 minute") vs "randomly" (Wowhead) vs "spider form at ~90% HP" (Tentonhammer 2005).
- Enveloping Webs radius: 10 yd (DBC) vs "all targets within 20 yd" (wiki); silence 8 s (DBC) vs ~5 s (Tentonhammer).
- Drain Life heal: wiki "25x drained / 12,500 per s" vs DBC leech value 500/s (heal multiplier not visible in DBC text).
- Whether Drain Life can be dispelled from the victim (Amazon Basin) in addition to interrupted; wiki says mana drain may or may not stop it.
- Spider spawn cadence in troll form after the first 4: "periodically" only.
- Spawn Poison: 36/3 s (DBC) vs ~50/3 s stacking 10 (wiki).
- Witherbark Speaker shock values: DBC 517/486 vs wiki 1,125–1,375 / ~650.
- No cadence data for Poison Bolt Volley, Corrosive Poison, Poison Shock; Warcraft Logs not accessible.
