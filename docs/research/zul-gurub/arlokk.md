# High Priestess Arlokk (Zul'Gurub)

Sources: list every URL used, one per line, with what it contributed.
- https://classic.warcraftdb.com/data/npc/14515 (API) — level 63 World Boss, health 279,825, mana 13,100; abilities Gouge 12540, Mark of Arlokk 24210 (100 yd, 2 min), Shadow Word: Pain 24212 (60 yd, 18 s).
- https://classic.warcraftdb.com/data/npc/15101 — Zulian Prowler: level 60 non-elite, 3,052 HP, Beast (Cat), Thrash.
- https://classicdb.ch/?spell=12540 — Gouge: instant, 5 yd, 20 damage, incapacitate up to 4 s (target must face her; damage breaks).
- https://classicdb.ch/?spell=24212 — Shadow Word: Pain: instant, 350 mana, 60 yd, 704 Shadow per 3 s for 18 s, Magic.
- https://classicdb.ch/?spell=24210 — Mark of Arlokk: instant, 100 yd, 120 s, periodic trigger every 2 s of 24211.
- https://classicdb.ch/?spell=24211 — Mark of Arlokk (trigger): 100 yd, applies 5,000 threat to panthers within 15 yd.
- https://classicdb.ch/?spell=24213 — Ravage: instant, 5 yd, weapon +500, 2 s stun.
- https://classicdb.ch/?spell=24236 — Whirlwind: channeled 2 s, periodic trigger every 1 s.
- https://classicdb.ch/?spell=24223 — Vanish: 10 s school-immunity aura + script; https://classicdb.ch/?spell=24228 — Vanish teleport.
- https://classicdb.ch/?spell=24190 — Arlokk Transform (panther form, model 14968).
- https://warcraft.wiki.gg/wiki/High_Priestess_Arlokk — Classic tactics: gong summons her at the entrance in priest form; Gouge up to 3 s; SW:P in priest form; Mark of Arlokk shown as a large "V", attracts panthers with LoS; Ravage +500 2 s stun; Whirlwind +954 to nearby, 2 s; "double cleave" red aura in panther form; stealth "after one minute", powerful opener on OT healers; panthers level 60 non-elite from cages on each side ~1 every 5 s, respawn indefinitely, ~30 damage per hit on plate early, ~2,000 HP rising to ~25,000 for later ones; Patch 1.8 slowed spawns; five strategies (pen tanks, Demoralizing Shout, Frost Nova rotation, Hellfire warlock, paladin bubbles/BoP).
- https://www.wowhead.com/classic/guide/high-priestess-arlokk-zul-gurub-strategy (via r.jina.ai) — gong start, tank at the entrance, two OTs by the pens; Gouge incapacitates the MT 3 s → OT taunts; about a minute in she vanishes; while stealthed she Marks a random player (retreat to the gong); reappears in panther form and immediately Whirlwinds (2 s, melee wait); panther form ~20 s then back to troll; transitions get faster each cycle; Mark is not a fixate — panthers can be taunted; avoid the pens; all stealthed panthers rush the raid on her death (group loot).
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — group around the gong; melee ineffective vs cat-form cleave; fear panthers, kill them only during vanish; AoE panthers when she vanishes; MT drags her back to centre.
- https://www.tentonhammer.com/guides/zul-gurub-boss-guide-boss-6-high-priestess-arlokk — stealths three times; Mark ~2 min; panthers spawn faster after each return; cage-exit tanks (warrior or Consecrating paladin); ranged at the gong (main) or opposite end (variant).
- https://us.millenium.gg/guide/6831.html?page=6 — human/beast phases, Whirlwind and Thrash in beast form, DoT on a random target when she reappears, keep her in the centre.
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — raid opposite the gong, MT mid-room near the door, two OTs in front of the gong/pens; cleanse the Mark until an OT is marked; marked players stay away from pen openings (mark has range); nearest warrior taunts on reappearance; don't cluster during Whirlwind; emergency Frost Nova.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_arlokk.cpp — on gong: two pen triggers cast Summon Zulian Prowlers (24247) continuously; prowler cap 40 alive; vanish: threat reset, picks a random target after 10 s, reappears after 50 s; phase transition timer 30 s → panther (hate to zero) → 120 s → troll → 30 s (emulator values, see Open questions); yell "Feast, my pretties!" on Mark.

## Overview
- Level 63 ("??"), World Boss. Health 279,825 (Era), mana 13,100. No enrage timer. Fifth/sixth boss (after Thekal in the usual route). REQUIRED: alive she grants Hakkar Aspect of Arlokk (2 s gouge wiping the MT's aggro). Started by striking the Gong of Bethekk at the back of her temple; she appears at the room entrance in troll form.
- Phases: alternating Troll (priest) form → Vanish (stealthed, Mark of Arlokk, panthers) → Panther form (Whirlwind on emergence, Ravage, Thrash) → Troll form. First vanish ~1 min in; panther form ~20 s; Tentonhammer: three vanishes per fight; Wowhead: transitions faster each cycle. Panthers (Zulian Prowlers) stream from the two side pens for the entire fight and get more numerous over time.
- Raid-size assumptions: 20-man Classic Era. No SoD-specific values found.

## Abilities

### Gouge (Troll form)
- Name: Gouge (12540)
- Type: debuff (tank incapacitate / aggro loss)
- Target rule: current target (must be facing her)
- Cast time: instant, 5 yd
- Cooldown or cadence: unknown; "most dangerous ability in troll form" (Wowhead)
- Damage: 20
- Debuff: Incapacitate up to 4 s (DBC; Wowhead/wiki 3 s); any damage breaks it; she attacks the next target meanwhile
- Movement effect: MT frozen → an OT taunts her, MT taunts back when free
- Telegraph: none

### Shadow Word: Pain (Troll form)
- Name: Shadow Word: Pain (24212)
- Type: targeted DoT
- Target rule: random player within 60 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: 704 Shadow every 3 s for 18 s (4,224 total)
- Debuff: Magic — dispel
- Movement effect: none
- Telegraph: none

### Vanish
- Name: Vanish (24223) + teleport (24228) + invisibility
- Type: teleport / threat wipe / phase change
- Target rule: self
- Cast time: instant
- Cooldown or cadence: first ~60 s after the gong (Wowhead, wiki); cmangos: she stays hidden 50 s, picks a target after 10 s; Wowhead implies a shorter gap (panther form "about 20 seconds" after a vanish of unspecified length); Tentonhammer: 3 vanishes total
- Damage: none; she becomes untargetable and immune (school immunity aura 10 s)
- Debuff: none
- Movement effect: threat reset (cmangos); she reappears next to a (random) player — wiki: her opener can two-shot cloth, usually an OT healer
- Telegraph: she disappears; this is the window to kill panthers

### Mark of Arlokk
- Name: Mark of Arlokk (24210 → 24211)
- Type: debuff (panther aggro magnet)
- Target rule: random player (100 yd) while she is stealthed; yell "Feast, my pretties!"
- Cast time: instant
- Cooldown or cadence: once per vanish (Wowhead); interval unknown
- Damage: none directly; every 2 s it gives 5,000 threat on the marked player to panthers within 15 yd (DBC), so all active/unstealthing panthers run to them
- Debuff: Mark of Arlokk, 120 s; big "V" over the head. Dispel type none in DBC; Amazon Basin says it was cleansed off until an OT got it (likely via immunity/BoP tricks); paladins Divine Shield/BoP to drop it (wiki)
- Movement effect: marked player retreats to the gong wall/healers (Wowhead); Wowhead: it is NOT a fixate — panthers can be taunted off
- Telegraph: yell + V marker

### Whirlwind (Panther form)
- Name: Whirlwind (24236)
- Type: melee AoE
- Target rule: all within melee range
- Cast time: channeled 2 s (ticks every 1 s)
- Cooldown or cadence: immediately on re-emerging from Vanish (Wowhead); possibly again during panther form (unknown)
- Damage: normal + 954 per tick to nearby enemies (wiki); "very deadly" (Wowhead)
- Debuff: none
- Movement effect: none
- Telegraph: she reappears → melee and healers stay >8 yd away for ~2 s before re-engaging

### Ravage (Panther form)
- Name: Ravage (24213)
- Type: melee (tank)
- Target rule: current target
- Cast time: instant, 5 yd
- Cooldown or cadence: unknown
- Damage: weapon +500 Physical
- Debuff: stun 2 s
- Movement effect: stun
- Telegraph: none

### Thrash / "double cleave" (Panther form)
- Name: Thrash (3391)
- Type: melee
- Target rule: current target (Thrash gives 2 extra attacks); wiki describes a red-aura "double cleave" that rogues must avoid
- Cast time: passive
- Cooldown or cadence: random
- Damage: extra white hits
- Debuff: none
- Movement effect: none
- Telegraph: red aura (wiki)

### Summon Zulian Prowlers (pen triggers)
- Name: Summon Zulian Prowlers (24247, cast by two pen triggers)
- Type: summon adds
- Target rule: from the pens on each side of the room
- Cast time: continuous aura from the gong until she dies/evades
- Cooldown or cadence: wiki ~1 every 5 s per side (post-1.8 slower); spawn rate increases after each vanish (Tentonhammer, Wowhead "many, many panthers"); cmangos caps 40 alive
- Damage: n/a
- Debuff: n/a
- Movement effect: panthers prowl stealthed until called/marked; entering a pen unstealths many at once (wipe risk)
- Telegraph: stealthed cats; Mark yell

## Adds
- Zulian Prowlers (NPC 15101): level 60 non-elite panthers, 3,052 HP each (warcraftdb; wiki anecdotes of 2k→25k for later spawns are not supported by the DB), Thrash. Stream from the left and right pens all fight (cap 40); stealthed until Arlokk marks someone or they are aggroed; early hits ~30 on plate (wiki) but 20+ of them add up. Two pen off-tanks (warrior Challenging Shout/Demoralizing Shout/Thunder Clap, or Consecrating paladin) hold them; kill them only while Arlokk is vanished (AoE: Frost Nova + Arcane Explosion/Blizzard, Hellfire, Consecration). On her death every remaining stealthed panther rushes the raid — AoE them down; use group loot in case of a wipe.

## Positioning and movement
- Tank: one tank waits at the room entrance (mid-room near the door per Amazon Basin) to take her the moment the gong is struck; tank her in the centre of the room facing away from the raid. Two OTs stand in front of the pen openings and collect panthers (do not kill them yet). On Gouge, the nearest OT (or a third warrior) taunts; MT taunts back. On re-emergence the closest warrior taunts and drags her back to centre; never stand in Whirlwind.
- Melee DPS: rogues/warriors on her in troll form; back off 8+ yd when she vanishes (she reappears with Whirlwind) and stay away from her cat form unless assigned (cleave/Thrash). During vanish, help AoE panthers.
- Ranged DPS: stack at the far end of the room opposite the gong (Amazon Basin/Tentonhammer variant) or around the gong (Warcraft Tavern/Tentonhammer main) — pick one and keep everyone 15+ yd from pen openings. Burst Arlokk in troll form; AoE panthers only during vanish; mages hold Frost Nova for emergencies; hunters Aimed Shot / mages Pyroblast her on reappearance.
- Healers: along the walls between the two groups; a healer on each pen OT; dispel SW:P; when marked, run to the gong wall and get healed through 10–20 panther bites; paladins use BoP/Divine Shield on marked cloth; druids/priests keep HoTs on pen tanks.
- Whole raid: do not enter the pens; stacking point is the ranged group; the marked player's retreat point is the gong wall; no LoS tricks.

## What each role must do and must not do
- Tank:
  1. Be at the entrance before the gong; pick her up instantly.
  2. Keep her mid-room; taunt swap on every Gouge.
  3. Pen OTs: gather panthers, don't kill them (they get stronger/more numerous anyway); hold them for the vanish AoE.
  4. On re-emergence: closest tank taunts, drags her to centre, faces her away; wait out Whirlwind.
  5. Never run into a pen, never leave the marked player uncovered.
- DPS:
  1. Troll form: all DPS on Arlokk; ignore panthers.
  2. Vanish: AoE/kill all active panthers; mages Frost Nova packs on the pen tanks.
  3. Re-emergence: stay >8 yd for the 2 s Whirlwind, then re-engage (melee cautiously vs cat form).
  4. Dispel/purge nothing on her; dispel SW:P on players (priests/paladins).
  5. Kill the panther rush after she dies.
- Healer:
  1. Dispel SW:P (704 per 3 s) fast on cloth.
  2. Keep both pen tanks alive all fight; the marked player is the spike target during vanish.
  3. Expect her stealth opener on an OT healer (wiki) — stay topped and near the group.
  4. Never cluster in melee range when she reappears.

## Timeline of a typical pull
- t=0: gong struck; she appears at the entrance in troll form; panthers begin trickling from both pens (~1 per 5 s per side, stealthed). MT picks her up and walks her to centre; Gouge taunt-swaps; SW:P on random players.
- t≈60 s: Vanish — threat wiped, she is untargetable; "Feast, my pretties!" marks a random player (V), panthers converge on them; raid AoEs panthers; marked player at the gong wall.
- t≈60 s + 10–50 s (cmangos 50 s; Wowhead shorter): she reappears in panther form next to a player, Whirlwind 2 s (+954/tick), then Ravage/Thrash on the tank; nearest warrior taunts and centres her. Panther form ~20 s (Wowhead).
- Then back to troll form; repeat with shorter intervals (Wowhead) — Tentonhammer: 3 vanishes total, panther spawn rate increasing each time; the raid must finish her before panthers overrun (279,825 HP).
- Death: all remaining stealthed panthers unstealth and charge the raid; AoE; Hakkar loses Aspect of Arlokk.

## Open questions
- Vanish/phase timing: Wowhead ~1 min to first vanish, panther form ~20 s, transitions accelerate; cmangos phase timer 30 s → panther 120 s → troll 30 s and vanish 10 s/50 s (emulator); Tentonhammer exactly three stealths; wiki "stealths after one minute". No log data.
- Gouge duration: 4 s (DBC) vs 3 s (Wowhead, wiki).
- Whether Vanish wipes threat: cmangos yes; Wowhead says the nearest tank must taunt on reappearance (implies yes).
- Mark of Arlokk dispel: DBC dispel type none; Amazon Basin "cleansed off targets" (likely immunity tricks); wiki: Divine Shield/BoP removes it.
- Panther HP: 3,052 (warcraftdb) vs wiki "~2,000 rising to ~25,000"; spawn rate ~5 s/side (wiki) vs "faster each return" (Tentonhammer).
- Whirlwind damage: wiki +954 per tick; DBC shows only the 1 s trigger.
- Ranged position: gong (Warcraft Tavern, Tentonhammer main) vs opposite the gong (Amazon Basin, Tentonhammer variant).
- Health 279,825 (warcraftdb); no other source gives a number.
