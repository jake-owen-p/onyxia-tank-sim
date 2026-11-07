# Anub'Rekhan (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Anub%27Rekhan_(Classic) — Classic 40-man page: boss HP 1,665,500; Crypt Guard level 61 / 204,380 HP; Impale 3,938 dmg; Locust Swarm 20 s, 30 yd, 875–1,125 Nature per 2 s, Pacify; Acid Spit 250/2 s for 10 s; Crypt Guard Enrage (+60% attack speed, +50 dmg, below 50%); Web 10 s root; scarab counts (10 per Guard, 5 per player); kite cadence 70–120 s; tank/healer assignment and kite path; quotes.
- https://www.wowhead.com/classic/spell=28785/locust-swarm (fetched via r.jina.ai proxy) — Locust Swarm (aura): 3 s cast, 20 s cooldown, 20 s duration, self-range, -40% run speed, periodic trigger of 28786 every 2 s.
- https://www.wowhead.com/classic/spell=28786/locust-swarm — Locust Swarm (DoT): 875 Nature every 2 s, 6 s duration, 30 yd radius, Silence + Pacify, ignores line of sight, player-only.
- https://www.wowhead.com/classic/spell=28783/impale — Impale: 1 s cast, unlimited range, 3,938 Physical, 45 yd effect radius, Knock Back value 300.
- https://www.wowhead.com/classic/spell=28961/summon-corpse-scarabs-10 — 10-scarab summon: instant, 100 yd radius, Allow Dead Target.
- https://www.wowhead.com/classic/spell=29105/summon-corpse-scarabs-5 — 5-scarab summon: instant, summons 5 Corpse Scarab (level 60), 100 yd radius, usable while dead.
- https://www.wowhead.com/classic/spell=28969/acid-spit — Acid Spit: 40 yd, instant, 250 Nature every 2 s for 10 s, no dispel type (undispellable).
- https://www.wowhead.com/classic/spell=15284/cleave — Crypt Guard Cleave: next melee, 6 s cooldown, weapon damage +10, up to 3 targets.
- https://www.wowhead.com/classic/spell=28991/web — Web: 10 yd range, instant, 10 s root, 10 yd radius, Nature.
- https://www.wowhead.com/classic/npc=16573/crypt-guard — Crypt Guard: level 61 Elite (Classic Era 40-player HP not shown; Seasonal/SoD HP 2,002,839 shown and ignored).
- https://www.wowhead.com/classic/npc=16698/corpse-scarab — Corpse Scarab: level 60, 6,104 HP (40 Player).
- https://classicdb.ch/?npc=16573 — Crypt Guard: level 61 Elite, 203,671 HP, melee 2,603–2,673 Physical, armor 4,091, abilities Acid Spit / Cleave / Web.
- https://classicdb.ch/?spell=28785 and https://classicdb.ch/?spell=28786 — confirm 3 s cast, 20 s duration, -40% speed, 30 yd radius, 2 s tick.
- https://www.wowhead.com/classic/guide/anubrekhan-naxxramas-raid-strategy — Wowhead Classic strategy guide: tank the boss against the closed gate, kite to opposite side, face Guards away, 10 scarabs per Guard / 5 per player, Free Action Potion for Web, Greater Nature Protection Potion for Acid Spit/Locust Swarm, Aspect of the Pack, spot-heal Impale victims in the air.
- https://www.method.gg/wormie-s-classic-vanilla-naxxramas-proper — vanilla world-first-era recollection: outer path along the wall beyond the acid used for kiting; boss slowed ~40%; Aspect of the Pack or Swiftness Potion for the tank; Impale ~4,000 + fall damage; 10–15 scarabs per Guard.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: Locust Swarm "every 90 seconds to a minute", 30 yd, spotted by the tail-lift visual cue; 4 tanks for Crypt Guards; Impale often hits the tank too.
- https://www.tentonhammer.com/guides/naxxramas-bosses — Wrath-era (2008) guide; used only for structure of the kite route (left/right alcoves, slime edge) and the "first Locust Swarm 80–120 s" statement. Its HP/damage numbers are Wrath 25-man and are NOT used.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/ArachnidQuarter/Anub'Rekhan.lua — DBM Classic timers: Locust Swarm first 77.3–109.3 s, re-cast 69.2 s after the swarm fades (variable 81.3–104.5 s); 23 s "swarm active" bar (3 s cast + 20 s); Impale target scan on 28783 cast start.
- https://warcraft.wiki.gg/wiki/Anub%27Rekhan — modern (Wrath) page; only used to note the differences (Wrath Crypt Guards spawn 20 s after pull; Classic starts with two already in the room).

## Overview
- Level ?? (boss), Undead. HP 1,665,500 (warcraft.wiki.gg Classic page). No hard enrage timer is documented for the Classic version (the Wrath version has a 10-minute Berserk; the Classic page lists none). First boss of the Spider Wing; required to progress to Grand Widow Faerlina (room door closes on pull per Ten Ton Hammer/ wiki).
- Phases: single phase. The fight is a repeating cycle of Locust Swarm (kite) → new Crypt Guard → kill Guard → kill scarabs → DPS boss, with Impale throughout.
- Raid-size assumptions: 40-man Classic Era. Two Crypt Guards (level 61 elite, ~204k HP each) are already in the room at the pull and are part of the encounter. Season of Discovery (Seasonal 40 Player) HP values on Wowhead (11.4M boss, 2.0M Guards) are a different tuning and are ignored.

## Abilities

### Impale
- Name: Impale (spell 28783)
- Type: targeted line attack (spikes travel from the boss toward the target) with knock-up
- Target rule: random player in the raid; everyone standing in the line between Anub'Rekhan and that player is also hit (wiki, Wowhead guide). Warcraft Tavern notes the main tank is often in the line.
- Cast time (s) and whether it is interruptible: 1 s cast (Wowhead spell page). Not interruptible (boss).
- Cooldown or cadence: unknown on the Classic spell page ("Cooldown n/a"); frequent throughout the fight (no source gives a Classic cadence; the Wrath 25-man page uses a ~10–20 s rhythm but that is a different version). First use: unknown.
- Damage: 3,938 Physical (Wowhead spell page effect value; wiki says "up to 3,938"); Method recollection "around 4,000". Effect radius 45 yd listed on the spell (the spike line), unlimited range to pick the target. Plus falling damage on landing (wiki: "moderate falling damage"; the Wrath page lists 50% fall damage but Classic value unknown).
- Debuff: none.
- Movement effect: Knock Back value 300 (spell page) — launches hit players high into the air; they land with falling damage. Slow Fall / Levitate reduce the fall damage (Method, Warcraft Tavern).
- Where it is telegraphed: 1 s cast bar on the boss; spikes visibly travel along the ground toward the target. ~1 s warning.

### Locust Swarm
- Name: Locust Swarm (28785 self-aura; 28786 the triggered DoT)
- Type: AoE (around the boss), silence/pacify, self-slow
- Target rule: all players within 30 yd of Anub'Rekhan, checked every 2 s for the 20 s channel (Ignore Line of Sight; "Can only target the player")
- Cast time (s) and whether it is interruptible: 3 s cast (Wowhead and classicdb), not interruptible. Then 20 s duration during which the boss re-applies the swarm every 2 s.
- Cooldown or cadence: spell data lists only a 20 s cooldown (i.e. it cannot overlap itself). DBM-Vanilla (log-derived) timers: first cast 77.3–109.3 s after pull; after the 20 s swarm aura fades, the next cast comes 69.2 s later (so ~89–92 s cast-to-cast); generic variable timer 81.3–104.5 s. Guides: 70–120 s between casts (warcraft.wiki.gg Classic), "every 90 seconds to a minute" (Warcraft Tavern), ~90 s with the first cast 80–120 s after pull (Ten Ton Hammer, Wrath version). For a sim: first swarm at ~77–109 s, then every ~89–92 s.
- Damage: 875–1,125 Nature every 2 s per stack (28786 tooltip; effect value 875 every 2 s), radius 30 yd. Each 2-s re-application adds a new 6-s stack ("stacks indefinitely" per wiki), so a player who stays inside takes 875–1,125 × stacks every 2 s.
- Debuff: Locust Swarm — 6 s duration per application, Nature, no dispel type (cannot be dispelled), effects: Periodic Damage + Silence + Pacify ("Unable to attack. Unable to cast spells."). Does not spread between players; it is re-applied by proximity.
- Movement effect: the boss slows himself by 40% (Decrease Run Speed -40%) for the 20 s. Players are silenced and pacified (no auto-attacks, no abilities, including Shield Wall/Last Stand — items still work per the Wrath wiki).
- Where it is telegraphed: 3 s cast bar; the boss stops and lifts his tail (Warcraft Tavern: "spotted by the visual cue of the boss lifting their tail"; wiki: "reaction to the tail lift is critical; a 2-second delay can wipe the raid"). ~3 s warning before the first tick.
- Also: one new Crypt Guard spawns each time Locust Swarm is cast (wiki, Wowhead guide, Warcraft Tavern), at the boss's starting position (Ten Ton Hammer).

### Summon Corpse Scarabs
- Name: Summon Corpse Scarabs (10) (28961, from a Crypt Guard corpse) and Summon Corpse Scarabs (5) (29105, from a player corpse)
- Type: summon adds (from corpses)
- Target rule: any dead Crypt Guard (10 scarabs) or dead player (5 scarabs) in the room; wiki: "whenever there is a corpse in the room"; Wowhead guide: "when anything dies in the room near Anub'Rekhan". Not on a timer (Wrath page); Classic wiki says "summoning takes several seconds".
- Cast time (s) and whether it is interruptible: instant (hidden cast); not interruptible.
- Cooldown or cadence: n/a — driven by deaths.
- Damage: none directly; radius 100 yd for the corpse check.
- Debuff: none.
- Movement effect: none.
- Where it is telegraphed: a Crypt Guard or player dying is the warning; the scarabs appear on the corpse a few seconds later.

### Crypt Guard — Cleave
- Name: Cleave (15284)
- Type: melee cone / frontal multi-target
- Target rule: current target plus its nearest allies, up to 3 targets total
- Cast time: next melee swing, instant
- Cooldown: 6 s
- Damage: weapon damage + 10 Physical (Crypt Guard melee is 2,603–2,673 before armor per classicdb); melee range (5 yd)
- Debuff: none. Movement: none.
- Telegraph: none — face the Guard away from the raid.

### Crypt Guard — Acid Spit
- Name: Acid Spit (28969)
- Type: debuff, ranged (40 yd)
- Target rule: the Guard's current target (tank)
- Cast time: instant; not interruptible
- Cooldown: unknown; applied every 2 s unless the Guard is stunned (Ten Ton Hammer); in practice stacks build quickly on the off-tank
- Damage: 250 Nature every 2 s for 10 s per stack (Wowhead spell page; wiki "stacks indefinitely")
- Debuff: Acid Spit, 10 s, Nature, no dispel type — cannot be cleansed (Wowhead guide, wiki). Does not spread.
- Telegraph: none.

### Crypt Guard — Web
- Name: Web (28991)
- Type: AoE root around the Guard
- Target rule: all enemies within 10 yd of the Guard
- Cast time: instant
- Cooldown: unknown
- Damage: none
- Debuff: Web — Immobilized (Root), 10 s, Nature school, mechanic Rooted; removable by Free Action Potion (immune), Improved Sprint, Escape Artist, PvP trinket (Wowhead guide)
- Telegraph: none.

### Crypt Guard — Enrage/Frenzy
- Name: Enrage (wiki) / Frenzy (Ten Ton Hammer). Spell ID unknown.
- Type: enrage
- Target rule: self
- Trigger: below 50% HP (warcraft.wiki.gg Classic) — Ten Ton Hammer (Wrath) says 20%. See Open questions.
- Effect: +60% attack speed and +50 Physical damage for 2 minutes (wiki Classic); Ten Ton Hammer: "attack 60% faster and hit 50% harder".
- Telegraph: enrage visual on the Guard.

## Adds
- Crypt Guard (NPC 16573): level 61 elite, 203,671 HP (classicdb.ch) / 204,380 HP (wiki). Two are present in the room at the pull; one more spawns at the boss's start position every Locust Swarm. Melee 2,603–2,673, armor 4,091. Abilities: Cleave (3 targets), Acid Spit (stacking undispellable Nature DoT on the tank), Web (10 yd AoE root for 10 s), Enrage below 50%. Picked up by off-tanks (wiki: 1+ warrior on the left Guard, 2 warriors on the right Guard, 2–3 healers each; Warcraft Tavern: "4 tanks" for Guards). They die to focused DPS; killing them is the priority before the boss. On death each leaves a corpse that spawns 10 Corpse Scarabs.
- Corpse Scarab (NPC 16698): level 60, 6,104 HP (Wowhead 40 Player). 10 per Crypt Guard corpse, 5 per player corpse. They aggro a random player and rush them (Ten Ton Hammer) — in practice healers via healing threat (Wowhead guide). Killed by AoE: mages Frost Nova them on the corpse, then Arcane Explosion / Rain of Fire / Goblin Sapper Charges (wiki, Wowhead guide). They do not despawn on a timer.

## Positioning and movement
- Tank: pull Anub'Rekhan and tank him deep in the room against the closed gate behind his start position (Wowhead guide), facing east / away from the raid (wiki). Stand on the platform near the outer ring so the kite path is available. On Locust Swarm (tail lift / 3 s cast bar) immediately run along the outer lip of the room right against the wall, outside the green slime, around to the opposite alcove (entrance side); Anub'Rekhan follows at 60% speed. A hunter runs ahead/with the tank with Aspect of the Pack (or the tank drinks a Swiftness Potion) so the tank stays more than 30 yd ahead. Tank-swap: none on the boss. Never: stand still during Locust Swarm; tank him with his back to a wall position that lets Impale knock the tank into a spot that evades (Wrath wiki warns of evade bugs when the tank is impaled against a wall); let the boss reach melee range while the swarm is active (the tank will be silenced/pacified and cannot use cooldowns).
- Melee DPS: start on the Crypt Guards, standing behind them (never in the Cleave cone). Only go onto the boss after the Guards are dead (wiki: "only ranged DPS can go onto Anub'Rekhan before the first kite"). Stand behind the boss, spread so no two players are in a line with him (Impale). Back out of the boss ~70–80 s after each Locust Swarm cast so you are not caught by the next one (wiki).
- Ranged DPS: spread in a semicircle behind/around the boss at max range, never in a line between the boss and another player (Impale hits everyone on the line). On Locust Swarm move to the side of the room opposite the tank's kite direction (the raid goes left, the tank kites right — Ten Ton Hammer) and switch to the newly spawned Crypt Guard. Mages/warlocks pre-position at a dying Guard to AoE scarabs.
- Healers: max range from the boss and behind the main tank's line so Impale spikes do not pass through them (wiki). During the kite, follow the tank at maximum healing range, staying more than 30 yd from the boss (the silence would stop heals). Assignments: 3–4 healers on the main tank, 2–3 per Crypt Guard off-tank, remaining healers on Impale victims (wiki).
- Whole raid: the room is a circle with an acid/slime moat; the kite path is the narrow outer ledge along the wall beyond the slime (Method). Stacking point for scarab AoE is the Crypt Guard corpse. Run-out point on Locust Swarm: the side of the room away from the kite path. New Crypt Guards are pulled west, away from the swarm (wiki).

## What each role must do and must not do
- Tank:
  1. Pull and position the boss against the back gate, facing away from the raid; build threat before DPS switches to the boss.
  2. Watch for the tail lift / 3 s Locust Swarm cast; the instant it starts, run the outer wall path toward the opposite alcove. A 2 s delay can wipe the raid (wiki).
  3. Coordinate with the Pack hunter (Aspect of the Pack) or pre-pop a Swiftness Potion; never get dazed in the swarm.
  4. Use defensive cooldowns before the swarm reaches you, not during it (silence/pacify blocks them).
  5. After the 20 s swarm ends, stop at the new alcove and re-establish position; expect to be clipped by Impale and pre-shielded by priests/druids.
  6. Off-tanks: pick up each Crypt Guard at its spawn point, face it away from the raid, pull new ones west away from the swarm; stun Guards to reduce Acid Spit stacks; Free Action Potion/PvP trinket for Web; Greater Nature Protection Potion if Acid Spit stacks get high.
- DPS:
  1. Kill Crypt Guards first (left then right per wiki), then boss. Stop DPS on the boss when Locust Swarm starts and move out of 30 yd.
  2. Never stand in a line between the boss and another player (Impale).
  3. AoE scarabs immediately on a Guard death (Frost Nova + AoE); Goblin Sapper Charge for non-AoE classes.
  4. Melee: back away from the boss ~70–80 s after the last swarm, pre-empting the next.
  5. Nothing to interrupt or dispel on the boss; Acid Spit cannot be cleansed.
- Healer:
  1. Spot-heal Impale victims while they are in the air so fall damage does not kill them (Wowhead guide).
  2. Pre-cast shields/HoTs on the main tank when the tail rises (wiki).
  3. Stay more than 30 yd from the boss at all times; during the kite follow the tank at max range.
  4. Guard healers: heavy sustained healing on off-tanks under stacking Acid Spit; cannot dispel it.
  5. A player death spawns 5 scarabs — avoid deaths above all.

## Timeline of a typical pull
- t=0: Pull. Boss tanked at the back gate; two Crypt Guards picked up by off-tanks at their positions, faced away. Melee on the left Guard, ranged split or on Guards. Free Action Potions pre-pulled for Web immunity (first 30 s).
- t≈0–60 s: Kill left Guard then right Guard. Each death → 10 Corpse Scarabs → Frost Nova + AoE. Impale on random players throughout (1 s cast, ~3,938 + fall).
- t≈70–120 s: First Locust Swarm (3 s cast, tail lift). Raid runs left/out of 30 yd; tank kites right along the outer wall with Aspect of the Pack for 20 s; a new Crypt Guard spawns at the boss start point and is picked up and pulled toward the raid.
- t≈90–140 s: Swarm ends; the tank holds the boss in the far alcove. Raid kills the new Guard (and its 10 scarabs), then returns to the boss.
- Repeat: every ~70–120 s a new swarm/kite/Guard cycle; melee leaves the boss ~70–80 s after each swarm. Kill time depends on raid DPS; no hard enrage documented for Classic.

## Open questions
- Locust Swarm cadence: spell data gives only a 20 s cooldown; warcraft.wiki.gg Classic says 70–120 s; Warcraft Tavern "every 90 seconds to a minute"; Ten Ton Hammer (Wrath) ~90 s with the first at 80–120 s. No Classic Warcraft Logs timeline could be fetched (classic.warcraftlogs.com blocked by bot protection).
- Impale cadence: unknown in every Classic source; spell lists no cooldown.
- Impale damage: 3,938 flat on the spell page vs "up to 3,938" (wiki) vs "around 4,000" (Method). Fall damage amount after the knock-up is not quantified for Classic.
- Crypt Guard HP: 203,671 (classicdb.ch) vs 204,380 (warcraft.wiki.gg).
- Crypt Guard Enrage threshold: below 50% (warcraft.wiki.gg Classic) vs 20% (Ten Ton Hammer, Wrath version). Spell ID not found.
- Boss HP: 1,665,500 (warcraft.wiki.gg) vs 1,500,000 (classicdb.ch, https://classicdb.ch/?npc=15956, which also lists melee 5,930–6,807 Physical, armor 4,691) — Wowhead Classic NPC page only shows Seasonal (SoD) HP 11,429,703, no Era value.
- Whether Classic has a hard enrage/Berserk: not listed on the Classic wiki page; Wrath version has 10 min. Treat as none.
- Corpse Scarab aggro: Ten Ton Hammer says a random player; Wowhead guide says healers via healing threat. Both imply "not the tank".
- Crypt Guard spawn in Classic: two present at pull (wiki, Wowhead guide) vs Wrath's "first spawns 20 s after pull" (Ten Ton Hammer, Wrath wiki). Classic uses the former.
