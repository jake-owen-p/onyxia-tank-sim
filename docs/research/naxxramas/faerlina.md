# Grand Widow Faerlina (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Grand_Widow_Faerlina_(Classic) — Classic 40-man page: Poison Bolt Volley / Rain of Fire (1,850–2,150 Fire per 2 s for 6 s) / Enrage (+75% attack speed, +150 damage) descriptions; Widow's Embrace rule (after enrage = stops it 60 s; before = delays 30 s); Worshipper ~250k HP (contradicted by DB), Follower ~100k HP; "fight can't last much past 4:45"; MC timings 0:50/1:50/2:50/3:50; healer/cleanser setup; quotes.
- https://www.wowhead.com/classic/guide/grand-widow-faerlina-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: 2 Followers + 4 Worshippers in a row at the back of the cathedral; kill Followers first (Charge + AoE Silence); Enrage every 60 s; Widow's Embrace also silences Poison Bolt Volley 30 s; never DPS Worshippers; move the boss out of Rain of Fire; spell IDs.
- https://www.wowhead.com/classic/spell=25991/poison-bolt-volley — Poison Bolt Volley: instant, 100 yd, 1,313 Nature initial + 413–587 Nature every 2 s for 10 s, Poison dispel type, Ignore LoS.
- https://www.wowhead.com/classic/spell=28794/rain-of-fire — Rain of Fire: instant, 40 yd range, 10 yd radius, 1,850–2,150 Fire every 2 s for 6 s.
- https://www.wowhead.com/classic/spell=28798/enrage — Faerlina's Enrage (used by NPC 15953): instant, +75% attack speed, +150% Physical damage (tooltip text says "+150"), +50% size, 30-minute duration.
- https://www.wowhead.com/classic/spell=28732/widows-embrace — Widow's Embrace: 0.5 s cast, self-sacrifice, prevents and removes enrage, silences Nature spells for 30 s, -25% casting speed in 15 yd, Magic dispel type (debuff on Faerlina), 30 s duration.
- https://www.wowhead.com/classic/spell=29943/silence — Follower AoE Silence: instant, 10 yd radius, 8 s.
- https://www.wowhead.com/classic/spell=25821/charge — Follower Charge: 40 yd, weapon damage +1,300 (effect value), 2 s stun.
- https://www.wowhead.com/classic/npc=15953/grand-widow-faerlina — quotes; Classic Era HP not shown (Seasonal 11,786,977 ignored).
- https://classicdb.ch/?npc=15953 — Faerlina: 1,312,027 HP, melee 8,475–9,727, armor 4,691.
- https://classicdb.ch/?npc=16506 — Naxxramas Worshipper: level 61 elite, 58,150 HP, melee 2,603–2,673.
- https://classicdb.ch/?npc=16505 — Naxxramas Follower: level 61 elite, 98,238 HP, melee 2,603–2,673.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/ArachnidQuarter/Faerlina.lua — DBM Classic timers: Enrage CD variable 56–76 s, first enrage timer 56 s after pull; Embrace 30 s buff timer; enrage aura 28798 applied; Widow's Embrace (28732) on the boss restarts the enrage timer.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: "should end in less than 4 minutes"; MC a worshipper 10 s before the first Enrage; nature resistance potions; fire resistance for melee.
- https://www.method.gg/wormie-s-classic-vanilla-naxxramas-proper — vanilla recollection: Followers pulled to the back of the room by hunters; silencing before the enrage only buys 30 s; Rain of Fire ~2k ticks; Poison Bolt Volley hits 10 random targets; MC resists/breaks were the main wipe cause.
- https://www.tentonhammer.com/guides/naxxramas-bosses — Wrath (2008) version: PBV "closest 10 players every 15 s", Rain of Fire ~10 yd radius, Frenzy every ~60 s; used only where marked as Wrath-era context.

## Overview
- Level ?? boss, Humanoid. HP 1,312,027 (classicdb.ch). No hard enrage timer, but a soft one: only four Worshippers exist, each cancels one Enrage, so after roughly 4:45–5:00 the boss stays permanently enraged (wiki). Second boss of the Spider Wing (after Anub'Rekhan, before Maexxna), required.
- Phases: single phase; a 60-second Enrage cycle governed by Widow's Embrace. Followers are killed in the opening; Worshippers are kept alive as "Enrage removers".
- Raid-size assumptions: 40-man Classic Era. The Wrath 10-man rule (kill a Worshipper next to her) does not apply — in Classic a Priest must Mind Control a Worshipper and cast Widow's Embrace (Wowhead guide, wiki). SoD HP values ignored.

## Abilities

### Poison Bolt Volley
- Name: Poison Bolt Volley (25991)
- Type: targeted multi-target (volley), debuff
- Target rule: random raid members (Warcraft Tavern, Method: "10 randomly selected targets"; Wrath-era Ten Ton Hammer: "closest 10 players"). Range 100 yd, ignores line of sight.
- Cast time (s) and whether it is interruptible: instant. Not interruptible, but Widow's Embrace silences her Nature school for 30 s, which blocks it (Wowhead guide, spell text).
- Cooldown or cadence: unknown for Classic (DBM Classic has no PBV timer; Ten Ton Hammer Wrath: every 15 s).
- Damage: 1,313 Nature initial (spell effect value; wiki says "Nature damage"), then 413–587 Nature every 2 s for 10 s (tooltip); Ten Ton Hammer's 4,100 + 2,000/tick is Wrath-only.
- Debuff: Poison Bolt Volley — 10 s, Poison (dispellable by Druid/Shaman/Paladin: Abolish/Cure Poison, Cleanse, Poison Cleansing Totem), periodic Nature damage; does not spread.
- Movement effect: none.
- Where it is telegraphed: no cast bar (instant); the volley projectile is visible. No warning.

### Rain of Fire
- Name: Rain of Fire (28794)
- Type: ground hazard AoE
- Target rule: a random location/player (Wowhead: "random location"; TTH: area around a random player); she can drop it on herself/the melee (Method).
- Cast time: instant; not interruptible.
- Cooldown or cadence: unknown; "throughout the fight" (TTH), frequent.
- Damage: 1,850–2,150 Fire every 2 s for 6 s to everyone standing in it (3 ticks); radius 10 yd (spell page); cast range 40 yd.
- Debuff: none (persistent area aura, no icon). Fire resistance reduces it (wiki/WT recommend FR gear on melee; Greater Fire Protection Potion absorbs).
- Movement effect: none.
- Telegraph: the fire patch appears on the ground; first tick ~immediately. Move out at once.

### Enrage
- Name: Enrage (28798; DBM announces it as 28131 "Frenzy")
- Type: enrage (self-buff)
- Target rule: self
- Cast time: instant.
- Cooldown or cadence: DBM Classic: first Enrage ~56 s after pull, then a 56–76 s variable timer, which is reset by Widow's Embrace. Wowhead guide/WT: "every 60 seconds". Wiki: sacrificing after the enrage stops her for the full 60 s; sacrificing before only delays it by 30 s (the Embrace's silence duration).
- Damage: +75% attack speed and +150 Physical damage per hit (tooltip text) — the spell data lists the effect as "Mod Damage Done % 150%", so it may actually be +150% damage (see Open questions). Base melee 8,475–9,727 (classicdb) — enraged she hits the tank for a very large amount; Wrath-era TTH quoted 20k hits at 150% damage.
- Debuff: buff on her, 30 min duration (permanent until removed by Widow's Embrace). No dispel type (cannot be Tranq Shot'd per Wowhead comments/guides which only name Widow's Embrace).
- Movement: none.
- Telegraph: yell ("You cannot hide from me!" / "Kneel before me, worm!" / "Run while you still can!" — wiki lists these as Enrage quotes), DBM "Frenzy" announce, she grows 50% in size. No cast bar.

### Widow's Embrace (Worshipper ability, used while Mind Controlled)
- Name: Widow's Embrace (28732)
- Type: other (friendly-cast dispel/sacrifice)
- Target rule: self-cast by the Mind Controlled Naxxramas Worshipper; effect radius 15 yd — the Worshipper must be within 15 yd of Faerlina (Wowhead guide: "use it next to her").
- Cast time: 0.5 s. Mind Control itself is a 3 s cast (Priest spell).
- Cooldown: none on the spell; limited by the four Worshippers (each use kills the Worshipper).
- Effect: kills the Worshipper; prevents and removes Enrage; silences Faerlina's Nature spells (Poison Bolt Volley) for 30 s; -25% casting speed; 30 s duration; Magic-type debuff on Faerlina (DBM tracks the 30 s buff and warns at 25 s).
- Telegraph: n/a (player-controlled).

### Naxxramas Follower — Silence
- Name: Silence (29943)
- Type: AoE silence around the Follower
- Target rule: all players within 10 yd of the Follower
- Cast time: instant
- Cooldown: unknown
- Debuff: Silence, 8 s, Nature school, Silenced mechanic; stops healers and prevents warrior Taunt (Wowhead guide).

### Naxxramas Follower — Charge
- Name: Charge (25821)
- Type: charge + stun
- Target rule: random raid member within 40 yd
- Cast time: instant
- Damage: weapon damage + 1,300 (effect value) Physical, 2 s stun.

## Adds
- Naxxramas Worshipper ×4 (NPC 16506): level 61 elite, 58,150 HP (classicdb.ch; wiki's "~250,000" looks wrong, see Open questions), melee 2,603–2,673. Stand in a row at the back of the cathedral with the Followers. Only ability: Widow's Embrace, usable only while Mind Controlled. Off-tanked in a corner far from the melee for the whole fight (one geared OT can hold all four — Wowhead guide); never damaged by the raid, no AoE near them. They die by being sacrificed (Widow's Embrace) one per Enrage.
- Naxxramas Follower ×2 (NPC 16505): level 61 elite, 98,238 HP (classicdb.ch; wiki "~100,000"), melee 2,603–2,673, stunnable. Abilities: AoE Silence (10 yd, 8 s), Charge on random players (2 s stun). Picked up by off-tanks, stacked together for cleave, killed first by all DPS (Wowhead, wiki: "ideally within about 30 s of each other"); or kited to the back of the room by hunters (Method).
- No additional spawns during the fight.

## Positioning and movement
- Tank: main tank picks up Faerlina and pulls her away from the adds (off to one side of the cathedral) so the Rain of Fire and Poison Bolt Volley don't overlap the add tanks; face her away from the raid (no cleave/frontal listed, but keeps melee behind). If a Rain of Fire lands on the melee, move her out of it immediately (Wowhead guide). Tank-swap: none; expect large damage spikes while she is enraged — use Shield Wall/Last Stand if an Enrage is not removed within a few seconds. Never tank her within 10 yd of a Follower (AoE Silence stops Taunt) or near the Worshipper corner.
- Melee DPS: open on the two Followers (stacked for Cleave/Blade Flurry), then stand behind Faerlina. Wear fire-resistance pieces (wiki, WT). Leave Rain of Fire instantly; never touch Worshippers.
- Ranged DPS: nuke Followers first, then the boss. Spread out around the room so a Rain of Fire hits as few people as possible (Wowhead guide); stay more than 10 yd from the Follower tanks until the Followers die.
- Healers: spread with the ranged; the Worshipper off-tank needs 1 healer; Follower tanks 1–2 each until the Followers die; 3+ on the main tank with heavy pre-healing before each expected Enrage (DBM timer ~56 s then 56–76 s). Dispellers (Druid/Shaman/Paladin) cleanse Poison Bolt Volley; a dedicated Priest or Paladin should decurse nothing (no curses) but can dispel Magic — note Widow's Embrace is a Magic debuff on the boss: never dispel the boss.
- Whole raid: Worshipper corner is the one no-fire zone; Followers die near the raid for cleave; run-out from Rain of Fire is "anywhere 10 yd away". Mind-controlling Priests need line of sight to a Worshipper and the controlled Worshipper must be walked to within 15 yd of Faerlina before each Enrage.

## What each role must do and must not do
- Tank:
  1. Pull Faerlina away from the add line; let OTs grab Followers/Worshippers first.
  2. Move her out of Rain of Fire when it lands on melee.
  3. Pop cooldowns if Enrage is up and no Embrace has landed within ~3 s.
  4. Worshipper OT: hold all four in a far corner, never let DPS near them, and never let one die to AoE.
  5. Follower OTs: stack both Followers, face away, stay 10+ yd from healers (Silence).
- DPS:
  1. Followers first, then Faerlina only. Never damage a Worshipper (no AoE anywhere near the corner).
  2. Leave Rain of Fire immediately (every tick is 1,850–2,150).
  3. Nothing to interrupt. Poison Bolt Volley can be self-handled with Elixir of Poison Resistance / Greater Nature Protection Potion / Anti-Venom (Wowhead guide).
  4. Be aware the fight is a DPS race: ~4 Enrage removals = ~4:45 of controlled fight; after that she stays enraged.
- Healer:
  1. Cleanse Poison Bolt Volley poison fast (10 s DoT, 413–587 per 2 s) — Druid/Shaman/Paladin; healers cleanse themselves first (wiki).
  2. Pre-heal/shield the main tank 5 s before each Enrage timer; expect a huge spike until the Embrace lands.
  3. Priests: MC rotation — start casting Mind Control ~10 s before the Enrage timer (WT; wiki: MC at 0:50, 1:50, 2:50, 3:50), bring the Worshipper within 15 yd of her, and cast Widow's Embrace right after she enrages (not before, or you only delay it by 30 s). Have a backup MC Priest (wiki) because MC resists/breaks are the main wipe cause (Method). 3% spell hit recommended.
  4. Do not Mass Dispel/dispel Magic on the boss (Widow's Embrace is a Magic debuff on her).

## Timeline of a typical pull
- t=0: Pull. OTs grab 2 Followers (stacked) and 4 Worshippers (corner); MT pulls Faerlina aside. All DPS on Followers.
- t≈0–30 s: Followers die (98k HP each); DPS switches to Faerlina. Rain of Fire and Poison Bolt Volley begin landing on random players; dispellers cleanse.
- t≈45–50 s: Priest #1 begins Mind Control on Worshipper #1 and walks it to the boss.
- t≈56 s (DBM; "~60 s" in guides): Enrage #1 → Widow's Embrace immediately: Worshipper #1 dies, Enrage removed, Poison Bolt Volley silenced for 30 s, next Enrage timer restarts (56–76 s).
- t≈1:50, 2:50, 3:50: repeat with Worshippers #2–#4 (wiki timings).
- t≈4:45–5:00: last Embrace expires; any further Enrage is permanent — the boss must be dead by here (wiki: "can't last much past 4:45"; WT: "<4 minutes").

## Open questions
- Enrage magnitude: tooltip text says "+150 Physical damage, +75% attack speed" (wiki, spell description) but the spell's effect data on Wowhead reads "Mod Damage Done % (Physical) 150%". Treat as a very large damage increase either way.
- Enrage cadence: 60 s (Wowhead guide, WT, wiki) vs DBM Classic variable 56–76 s, first at ~56 s. Use DBM's values for a sim.
- Worshipper HP: ~250,000 (warcraft.wiki.gg) vs 58,150 (classicdb.ch). The DB value is more plausible for an add that is never meant to be killed by DPS.
- Poison Bolt Volley: target count (10 — Method/TTH) and cadence (TTH Wrath: 15 s) not confirmed for Classic; Classic initial hit 1,313 per spell page vs TTH's 4,100 (Wrath).
- Rain of Fire cadence: unknown.
- Widow's Embrace behaviour if cast before the Enrage: wiki says it delays the next Enrage by 30 s; DBM restarts the full enrage timer on any Embrace application. Both agree it buys less than a full cycle if used early.
- Boss HP: 1,312,027 (classicdb.ch); wiki page does not list HP.
