# Maexxna (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Maexxna_(Classic) — Classic 40-man page: 40-second cycle (Web Wrap first at 20 s then every 40 s, 3 players, cocoon ~6,000 HP, 650–850 Nature per 2 s; Spider Spawn first at 30 s then every 40 s, 8–10 spiders ~4,000 HP; Web Spray every 40 s, 1,750–2,250 Nature, 8 s incapacitate, unresistable); Poison Shock 1,750–2,250 Nature 15 yd frontal cone; Necrotic Poison -90% healing 30 s, poison dispel; Enrage at 30%; positioning (NE web wall), healing/HoT plan, cocoon assignments, enrage cooldown plan; patch note (1.14.3 Web Wrap fix).
- https://www.wowhead.com/classic/guide/maexxna-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: tank in the centre of the web facing away; Poison Shock frontal cone; Necrotic Poison "super Mortal Strike"; Insignia of the Alliance/Horde does NOT free you from Web Wrap (comments: trinkets, bubbles, Ice Block don't work); Flask of Petrification trick for Web Spray; Greater Stoneshield/Lifegiving Gem/Last Stand for the tank; spell IDs.
- https://www.wowhead.com/classic/spell=28622/web-wrap — Web Wrap debuff: Stun + 657–843 Nature every 2 s, 1 min duration, ignores invulnerability.
- https://www.wowhead.com/classic/spell=29484/web-spray — Web Spray: instant, unlimited range, 200 yd radius, Stun 10 s (tooltip) + 1,750 Nature (effect value; tooltip range 1,750–2,250), ignores invulnerability ("Unaffected by invulnerability", "Not on AOE Immune").
- https://www.wowhead.com/classic/spell=28741/poison-shock — Poison Shock: instant, 15 yd range, 1,750 Nature (effect value), player-only.
- https://www.wowhead.com/classic/spell=28776/necrotic-poison — Necrotic Poison: instant, melee range, Poison dispel type, -90% healing taken for 30 s.
- https://www.wowhead.com/classic/spell=29434/summon-maexxna-spiderling — summons 10 Maexxna Spiderlings at the boss (radius 1 yd).
- https://www.wowhead.com/classic/spell=28747/enrage — Maexxna's Enrage: +50% attack speed, +100 damage (tooltip; effect data "Mod Damage Done % 100%"), +15% size, 10 min duration.
- https://www.wowhead.com/classic/npc=16486/web-wrap — Web Wrap cocoon NPC: level 60, 6,104 HP (40 Player).
- https://classicdb.ch/?npc=15952 — Maexxna: 1,453,127 HP, melee 8,475–9,727, armor 4,691.
- https://classicdb.ch/?npc=17055 — Maexxna Spiderling: level 60, 3,815 HP, melee 239–275.
- https://classicdb.ch/?npc=16486 — Web Wrap: 6,200 HP (vs Wowhead 6,104).
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/ArachnidQuarter/Maexxna.lua — DBM Classic timers: Web Spray every 40.5 s (first 40.5 s after pull); Web Wrap first 18.2–20.1 s then 39.6–40.9 s; Spiderlings 30.7 s after pull and 30.7 s after each Web Spray; "enrage soon" at 35% HP; enrage aura 28747.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: raid stands near the web wall left of the entrance; two ranged groups on the sides for spiders; third group of 3 hunters/casters for cocoons; Web Wrap 20 s / Web Spray 40 s / spiders 30 s; ~15% boss HP per cycle target; offtank ready in enrage.
- https://www.tentonhammer.com/guides/naxxramas-bosses — Wrath (2008) version: Poison Shock "roughly every 10–12 s", spiderlings in groups of 8 every 40 s, cocoon ~15k HP (Wrath), stop at 32–34% and wait for a Web Spray before pushing into Enrage. Used only as Wrath-era context where marked.
- https://warcraft.wiki.gg/wiki/Naxxramas_(Classic) — wing order and nature resistance note.

## Overview
- Level ?? boss, Beast. HP 1,453,127 (classicdb.ch). No hard enrage timer; a permanent Enrage at 30% HP. Third and last boss of the Spider Wing; required for the wing (killing her advances the Frostwyrm Lair unlock).
- Phases: one phase with a rigid 40-second cycle (Web Wrap → Spiderlings → Web Spray), plus an Enrage phase from 30% to death in which the same cycle continues.
- Raid-size assumptions: 40-man Classic Era. 1 main tank (+1 backup for Enrage), ranged "web duty" team, AoE team for spiderlings. SoD HP ignored.

## Abilities

### Web Wrap
- Name: Web Wrap (28622; cocoon NPC 16486)
- Type: targeted knockback + stun (cocoon)
- Target rule: 3 random raid members, never the main tank (wiki, WT). Wrath version hits 1 (TTH).
- Cast time: instant (no cast bar); not interruptible.
- Cooldown or cadence: first at 18.2–20.1 s after pull, then every 39.6–40.9 s (DBM Classic); guides say 20 s then every 40 s.
- Damage: the cocoon DoT deals 657–843 Nature every 2 s (spell tooltip; wiki 650–850) while wrapped; on release the player drops and takes ~300–700 falling damage (wiki). Knockback distance: to the edge of the web (the NE wall).
- Debuff: Web Wrap — Stunned, 1 min max duration, no dispel type; removed when the cocoon (6,104 HP Wowhead / 6,200 classicdb) is destroyed by ranged DPS. PvP trinkets, Divine Shield, Ice Block, Vanish do not break it (Wowhead guide comments).
- Movement effect: knockback to the room edge, then stun inside the cocoon.
- Telegraph: none (instant); DBM target announce. Victims are flung visibly.

### Web Spray
- Name: Web Spray (29484)
- Type: AoE (whole room) stun + damage
- Target rule: everyone in the room (200 yd radius, unlimited range, ignores LoS); players already Web Wrapped are not affected (wiki).
- Cast time: instant; not interruptible.
- Cooldown or cadence: every 40.5 s, first at 40.5 s after pull (DBM Classic); guides: every 40 s.
- Damage: 1,750–2,250 Nature (tooltip; effect value 1,750), cannot be resisted (wiki).
- Debuff: Stunned — tooltip 10 s, guides/wiki say 8 s incapacitate; no dispel type; cannot be immuned by invulnerability ("Unaffected by invulnerability"); only avoided by death, Flask of Petrification, Divine Intervention, or already being wrapped (wiki, Wowhead).
- Movement effect: full stun.
- Telegraph: no cast; purely timer-based. DBM warns 5 s before. The tank is left unhealed for the stun's duration while Maexxna keeps attacking.

### Poison Shock
- Name: Poison Shock (28741)
- Type: frontal cone
- Target rule: players in a 15-yard cone in front of Maexxna (wiki; spell range 15 yd) — normally only the tank.
- Cast time: instant.
- Cooldown or cadence: unknown for Classic; Wrath-era TTH "roughly every 10–12 s".
- Damage: 1,750–2,250 Nature (wiki; effect value 1,750).
- Debuff: none. Telegraph: none.

### Necrotic Poison
- Name: Necrotic Poison (28776)
- Type: debuff (melee-range)
- Target rule: Maexxna's melee target (tank); also applied by Spiderlings (the spell is listed as used by Maexxna Spiderling too).
- Cast time: instant. Cooldown: unknown ("applied during the fight").
- Debuff: Necrotic Poison — Healing taken reduced by 90% for 30 s, Poison dispel type → Abolish Poison / Cure Poison / Cleanse / Poison Cleansing Totem. Must be dispelled immediately; it also removes the value of HoTs stacked for Web Spray (wiki: pre-cast Abolish Poison on the MT ~0.5 s before Web Spray).
- Telegraph: none.

### Summon Maexxna Spiderling (Spider Spawn)
- Name: Summon Maexxna Spiderling (29434)
- Type: summon adds
- Target rule: spawns 10 Spiderlings directly under Maexxna (spell: Summon ×10, radius 1 yd); WT describes them appearing "on opposite sides of the room"; wiki "directly under her".
- Cast time: instant (hidden).
- Cadence: first at 30.7 s after pull, then 30.7 s after each Web Spray, i.e. every ~40 s, 10 s before each Web Spray (DBM Classic; wiki/WT "30 s then every 40 s").
- Telegraph: DBM "spiders soon" 5 s before; otherwise none.

### Enrage
- Name: Enrage (28747)
- Type: enrage
- Trigger: 30% HP (wiki, Wowhead, WT; DBM warns at 35%).
- Effect: +50% attack speed, +100 Physical damage per hit (tooltip; effect data reads 100%), +15% size, lasts 10 min (effectively permanent). Not removable.
- Telegraph: DBM/ emote; she grows.

## Adds
- Maexxna Spiderling (NPC 17055): 10 per spawn (spell), guides say 8–10; level 60, 3,815 HP (classicdb; wiki ~4,000), melee 239–275 but hits cloth for 100–150 (wiki); can apply Necrotic Poison. Spawn under the boss every ~40 s starting at ~30 s. Held by a warrior's Demoralizing Shout / paladin Consecration or Frost Nova (wiki), then AoE'd (Arcane Explosion, Rain of Fire not Hellfire, Goblin Sapper Charge, melee cleave). Must be dead before Web Spray (10 s later) or they chew on stunned healers.
- Web Wrap cocoon (NPC 16486): 3 per Web Wrap, 6,104 HP, on the NE web wall; killed by assigned ranged (2 per cocoon; 3 on the nearest because of a LoS bug — wiki). Hunters are preferred.

## Positioning and movement
- Tank: pull Maexxna to the centre of her web facing the centre/away from the raid (Wowhead: centre of the web, facing away; WT: facing the centre of the web with the raid behind her). Never turn her toward the raid (Poison Shock 15 yd cone). Spam Shield Block; before each Web Spray be topped and HoT'd; keep Greater Stoneshield Potion, Lifegiving Gem, Last Stand, Shield Wall for the Enrage Web Sprays (wiki: Shield Wall for the first enraged Spray, Last Stand + Lifegiving Gem for the second). Fear Ward not needed. An off-tank stands ready to taunt if the MT dies during Enrage (WT).
- Melee DPS: directly behind her; save cooldowns for just after a Web Spray ends (Wowhead); Goblin Sapper Charge on spiderling spawn.
- Ranged DPS: clumped behind her near the wall so knocked-back players stay in range (wiki: backs to the nearby wall). Two side groups for spiderling AoE; a third group of ~3 hunters/casters assigned to cocoons (near/middle/far) (WT, wiki). Mages Frost Nova under the boss as the spawn timer hits.
- Healers: behind her with the ranged; Druids/Priests stack Regrowth + Rejuvenation + Renew + PW:Shield on the MT ~5 s before Web Spray; Druid pre-casts Abolish Poison on the MT ~0.5 s before Spray; Paladin/Shaman ready to Cleanse right after the Spray; heal wrapped players after release (fall damage); Shamans stack Healing Way ×3 on the tank before the Spray (wiki).
- Whole raid: stacking point is behind the boss by the web wall (left of the entrance); cocoons land on the NE wall; no run-out points. Rogues can Vanish and Mages Ice Block to skip Web Spray with exact timing (wiki) — Ice Block does not break Web Wrap.

## What each role must do and must not do
- Tank:
  1. Face her away from the raid at all times (Poison Shock cone).
  2. Shield Block before every Web Spray; pre-pot Greater Stoneshield around 50% (wiki).
  3. In Enrage (30%): Shield Wall on the first Web Spray, Last Stand + Lifegiving Gem on the second; call for the off-tank if low.
  4. Never move her into the spiderling pack or toward the cocoon wall.
- DPS:
  1. Ranged web team: kill cocoons within seconds of each Web Wrap (6.1k HP each; 3 cocoons); everyone else stays on the boss.
  2. AoE team: kill all 10 spiderlings in the 10 s before Web Spray; never let them reach healers.
  3. Melee: hold cooldowns until right after a Web Spray; do not cast anything that would be wasted into the stun.
  4. Push to 30% deliberately: hold DPS at ~32–34% (TTH) / "hold her near 30% until just after a Web Spray" (wiki: Curse of Doom at ~50% to land in Enrage), then burn with all cooldowns inside one 40 s window.
  5. Nothing to interrupt.
- Healer:
  1. Dispel Necrotic Poison on the tank the instant it lands (90% healing reduction, 30 s).
  2. Stack HoTs/Shield/Healing Way on the MT 5 s before each Spray; the MT takes ~10 s of unhealed hits (wiki quotes 10k+ in 2 s).
  3. Top the whole raid before Web Spray (1,750–2,250 to everyone) and heal cocooned players as they are released.
  4. Aim for ≥15–20% boss HP per 40 s cycle (wiki, WT) so the Enrage window is short.

## Timeline of a typical pull
- t=0: Pull; MT drags her to the web centre facing away; raid stacks behind by the wall.
- t≈18–20 s: Web Wrap on 3 players → web team kills 3 cocoons on the NE wall.
- t≈30.7 s: 10 Spiderlings spawn under the boss → Frost Nova + AoE; they must be dead by 40 s.
- t≈40.5 s: Web Spray: raid stunned 8–10 s, 1,750–2,250 Nature to all; tank unhealed; Necrotic Poison cleansed immediately after.
- t≈58–61 s: Web Wrap (second); t≈71 s: Spiderlings; t≈81 s: Web Spray. Cycle repeats every ~40 s.
- Each cycle ≈15–20% boss HP. At 30% (after ~4 cycles) Enrage; kill within one or two more Web Spray cycles using cooldowns.

## Open questions
- Web Spray stun duration: 10 s on the spell tooltip vs 8 s in wiki/WT/Wowhead text.
- Spiderling count: 10 (spell summon value) vs 8–10 (wiki) vs 8 (Wrath TTH). Spawn location: under the boss (spell radius 1 yd, wiki) vs "opposite sides of the room" (WT).
- Cocoon HP: 6,104 (Wowhead 40 Player) vs 6,200 (classicdb) vs ~6,000 (wiki); Wrath 15k (TTH) does not apply.
- Poison Shock and Necrotic Poison cadence: not given for Classic (Wrath ~10–12 s for Poison Shock).
- Enrage magnitude: "+100 damage, +50% attack speed" tooltip vs effect data "100%"; Wrath TTH "50% more damage".
- Web Wrap: a Classic Era bug where victims dropped to the ground immediately was fixed in 1.14.3 (wiki patch note); SoD/Era values may differ slightly.
- Boss HP: 1,453,127 (classicdb.ch); wiki does not list HP.
