# Chromaggus (Blackwing Lair)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Chromaggus — two of five breaths per instance, one breath every 30 s alternating; breath numbers (Incinerate 3675–4275, Corrosive Acid 875–1125/3 s 15 s + -3938–5062 armor, Frost Burn ~1400 + -80% attack speed, Ignite Flesh 657–843/3 s 60 s stacking, Time Lapse 6 s stun + half max health, threat drop removed in 2.0.1); five Brood Afflictions with dispel types; mutation at 5; Frenzy every 10–15 s; hard enrage at 20%; Shimmer vulnerability; tank spots; LoS strategy; Hourglass Sand / Restorative Potion counts.
- https://classicdb.ch/?npc=14020 — HP 1,832,050, melee 15,715–18,235, armor 4,641.
- https://classicdb.ch/?spell=23308 — Incinerate: 2 s cast, Fire, base 3675, 100 yd radius.
- https://classicdb.ch/?spell=23313 — Corrosive Acid: 2 s cast, Nature, 875–1126 every 3 s for 15 s, armor -3938.
- https://classicdb.ch/?spell=23187 — Frost Burn: 2 s cast, Frost, base 1750 damage + 1750 mana burn, +400% time between attacks for 15 s.
- https://classicdb.ch/?spell=23315 — Ignite Flesh: 2 s cast, Fire, 657–844 every 3 s for 60 s.
- https://classicdb.ch/?spell=23310 — Time Lapse: 2 s cast, Arcane, stun 8 s, max health -50%, 100 yd radius.
- https://classicdb.ch/?spell=23155 — Brood Affliction: Red: Disease, 50 Fire every 3 s, heals Chromaggus on death, 10 min.
- https://classicdb.ch/?spell=23169 — Brood Affliction: Green: Poison, 250 Nature every 5 s, healing taken -50%, 10 min.
- https://classicdb.ch/?spell=23153 — Brood Affliction: Blue: Magic, burns 50 mana/s, casting speed -50%, movement -30%, 10 min.
- https://classicdb.ch/?spell=23154 — Brood Affliction: Black: Curse, Fire damage taken +100%, 10 min.
- https://classicdb.ch/?spell=23170 — Brood Affliction: Bronze: no dispel type, periodically (every 5 s roll) stuns for 4 s, 10 min.
- https://classicdb.ch/?spell=23174 — Chromatic Mutation: 5 min, transforms into Chromatic Drakonid (14302), charmed, +500 all resistances.
- https://classicdb.ch/?spell=23128 — Frenzy: 8 s, +150% attack speed, dispel type Enrage.
- https://classicdb.ch/?spell=23537 — Enrage (20%): 10 min, +50% attack speed, +219–282 Physical damage.
- https://classicdb.ch/?spell=22277 .. 22281 — Elemental Shield: -75% damage taken from all schools except one; +1100% from the vulnerable school (22277 Fire, 22278 Frost, 22279 Shadow, 22280 Nature, 22281 Arcane).
- https://classicdb.ch/?spell=23645 — Hourglass Sand: cures Brood Affliction: Bronze.
- https://classicdb.ch/?npc=14302 — Chromatic Drakonid (mutated player form): HP 24,416, Brood Power: Black.
- https://warcraft.wiki.gg/wiki/Hourglass_Sand — drops from Blackwing Technician, Death Talon Overseer, Spellbinder, Warlock, Krixix; stacks to 200.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_chromaggus.cpp — emulator: two breaths chosen per instance, left breath at 30 s then every 60 s, right breath at 60 s then every 60 s; Brood Affliction cast every 7 s; Frenzy every 15 s (first 15 s); Elemental Shield (shimmer) every 45 s; Enrage below 20%.
- https://github.com/BigWigsMods/BigWigs_Classic/blob/master/BlackwingLair/Chromaggus.lua — breath bars at 30 s and 60 s on engage, each breath then every 60 s; 2 s cast bars; Frenzy 8 s; mutation warnings at 3/4/5 debuffs; vulnerability needs Detect Magic on him in Vanilla.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/BWL/Chromaggus.lua — log-derived: first breath 27–37.2 s, second 57.3–68.1 s, then 61.5 s per breath; Frenzy cooldown 16.1–17.8 s (first 12.5–22.5 s); vulnerability change 16.2–25.9 s; shimmer emote "%s flinches as its skin shimmers."; "breath soon" warning at -5 s.
- https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ — breaths every 30 s; breath numbers; afflictions; max 3 afflictions per player; Frenzy ~every 12 s; permanent enrage at 20%; Hourglass Sand for tanks/healers/hunters; Restorative Potions; mage Ice Block clears afflictions.
- https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-seven — 2006: breath every 30 s alternating; Time Lapse strategy (everyone but the OT and his healers takes it); run out 7 s before each breath; healers at the wall; alternative stairway position; afflictions and dispel classes.
- https://us.millenium.gg/guide/6486.html?page=6 — Frenzy 10–15 s; 6 s stun; Shimmer cycles Fire/Frost/Shadow/Nature/Arcane; Enrage at 20%; melee/ranged intentionally take Time Lapse so the OT holds him; healers avoid the stun.
- https://yttrium-tyclief.github.io/sod-guides/bwl/chromaggus (Season of Discovery, "more similar to Era than SoM") — Frenzy every 18 s for 8 s; vulnerable school takes 1200%, resisted 25%; Detect Magic; breath numbers (Ignite Flesh ~800/3 s 60 s, Time Lapse 8 s stun, Frost Burn -400% attack speed 15 s, Corrosive Acid ~950/3 s + -4500 armor, Incinerate ~4200); MT in the doorway to the twin-drake room, melee stacked behind, casters to the side, healers behind cover; red death heals him 150k; mutation heal 150k. SoD-only Volley/Fetch/Roll Over.
- https://docs.google.com/document/d/1VT_67cPSHqvRK2_yit0QSiyzGwf9oXTKjcinxsVymoA (warlock notes) — a warlock summons the lever-clicker; Restorative Potion clears afflictions; Time Lapse wipes threat and must be taken in LoS; LoS everything else; use the vulnerable school.

## Overview
- Level ?? (boss), HP 1,832,050 (classicdb.ch), melee 15,715–18,235, armor 4,641. Hard enrage at 20% HP (permanent +50% attack speed, +219–282 damage) — not a timer. Seventh boss, required (his death opens the gate to Nefarian). Can be Taunted.
- Phases: single phase with a 20% enrage. Pull by pulling the lever in his room; the gate opens and the encounter starts when he reaches the room centre (SoD guide; same in Era).
- Mechanic summary: two of five breaths are fixed per instance lockout, alternating every 30 s (each individual breath every 60 s), 2 s cast, hitting everyone in his line of sight — the raid breaks LoS behind the wall for every breath except Time Lapse (which must be taken by everyone except one off-tank so the off-tank can hold him while the raid is stunned). Meanwhile he puts Brood Afflictions on random players every ~7 s (five colours, four dispellable, Bronze only by Hourglass Sand); a player with all five becomes a Chromatic Drakonid. He Frenzies every 10–18 s (hunter Tranquilizing Shot) and his Elemental Shield changes which school he is vulnerable to.
- Raid-size assumptions: 40-man Classic Era. Season of Discovery adds breath volleys and trials; Season of Mastery changed Blue; ignore both.

## Abilities

### Breath selection
- Two breaths are chosen when the instance is created and stay fixed for the lockout (cmangos TYPE_CHROMA_LBREATH/RBREATH; Warcraft Wiki "each week"). All five are 2 s casts hitting all enemies in his line of sight within 100 yd. Breath A is cast at ~30 s and every 60 s after; Breath B at ~60 s and every 60 s after — so a breath lands every 30 s (cmangos, BigWigs, Warcraft Wiki); logs: first 27–37 s, second 57–68 s, then 61.5 s each (DBM). Boss mods warn 5 s before (2 s cast + ~3 s to get behind the wall).

### Incinerate (Red breath)
- Type: AoE (line of sight, room)
- Target rule: everyone in LoS, 100 yd
- Cast time: 2 s
- Cooldown: 60 s (alternating slot)
- Damage: 3675–4275 Fire (Warcraft Wiki; base 3675 classicdb.ch) — ~8,000+ with Brood Affliction: Black
- Debuff: none
- Telegraph: 2 s cast bar; breath animation (by the time you see the animation it has landed — move on the timer, not the animation)

### Corrosive Acid (Green breath)
- Type: AoE (LoS) debuff
- Cast time: 2 s; Cooldown: 60 s
- Damage: Nature DoT 875–1126 every 3 s for 15 s (~5,000 total)
- Debuff: Corrosive Acid, 15 s, armor -3938 (Warcraft Wiki -3938–5062), dispel type none
- Telegraph: cast bar

### Frost Burn (Blue breath)
- Type: AoE (LoS) debuff
- Cast time: 2 s; Cooldown: 60 s
- Damage: 1750 base Frost (Warcraft Wiki "~1400" after resistance) plus a 1750 mana burn
- Debuff: Frost Burn, 15 s, time between attacks +400% (i.e. -80% attack speed), dispel type none
- Telegraph: cast bar

### Ignite Flesh (Black breath)
- Type: AoE (LoS) debuff
- Cast time: 2 s; Cooldown: 60 s
- Damage: 657–844 Fire every 3 s for 60 s (~15,000 total); doubled by Black affliction
- Debuff: Ignite Flesh, 60 s, stacks if re-applied before it expires (Warcraft Wiki), dispel type none
- Telegraph: cast bar. The MT carries this permanently; it is the heaviest sustained tank damage in the fight.

### Time Lapse (Bronze breath)
- Type: AoE (LoS) stun / threat drop
- Cast time: 2 s; Cooldown: 60 s
- Damage: none
- Debuff: Time Lapse, stun 8 s (classicdb.ch; Warcraft Wiki 6 s) and max health -50% for the duration, dispel type none
- Movement effect: stunned; in Classic it also greatly reduces the threat of everyone hit (Warcraft Wiki: removed only in 2.0.1; warlock notes "wipes threat")
- Telegraph: cast bar. Strategy inverts: everyone except one off-tank (and that off-tank's healers) must be IN line of sight and take it, so the untouched off-tank is the only one with threat for 8 s.

### Brood Affliction (Red / Green / Blue / Black / Bronze)
- Type: debuff (zone-wide, ignores LoS — Warcraft Wiki, Wowhead)
- Target rule: random raid member(s); one colour per cast
- Cast time: instant
- Cooldown: every ~7 s (cmangos). No boss mod carries a timer; guides say "periodically".
- Duration: 10 min each; they do not spread
- Effects and dispel types:
  - Red — Disease: 50 Fire every 3 s; if the player dies with it, Chromaggus is healed (SoD guide: 150k). Cure Disease / Abolish Disease.
  - Green — Poison: 250 Nature every 5 s and healing taken -50%. Cure Poison / Abolish Poison / Cleanse.
  - Blue — Magic: burns 50 mana/s, casting speed -50%, movement -30%. Dispel Magic / Cleanse. Highest priority on hunters and healers.
  - Black — Curse: Fire damage taken +100% (doubles Incinerate and Ignite Flesh). Remove Lesser Curse / Remove Curse (mages, druids).
  - Bronze — none: every 5 s a chance to be stunned for 4 s. Only Hourglass Sand (item, no cooldown listed) or Restorative Potion removes it; mages can Ice Block to clear all afflictions.
- Chromatic Mutation: a player holding all five becomes a hostile Chromatic Drakonid (HP 24,416, Brood Power: Black fire AoE) for 5 min, charmed, +500 all resistances; cannot be dispelled; must be CC'd (Polymorph) or killed, and its death heals Chromaggus heavily (150k per SoD guide). Boss mods warn at 3 and 4 debuffs; the raid rule is never more than 3 afflictions on anyone.

### Frenzy
- Type: enrage
- Target rule: self
- Cast time: instant
- Cooldown: every 10–15 s (Warcraft Wiki, Millenium) / 15 s (cmangos) / 16.1–17.8 s measured with a first cast at 12.5–22.5 s (DBM) / 18 s (SoD guide) / ~12 s (Warcraft Tavern)
- Effect: Frenzy, 8 s, +150% attack speed, dispel type Enrage — Hunter Tranquilizing Shot removes it. Continues to be cast after the 20% Enrage.
- Telegraph: emote "Chromaggus goes into a killing frenzy!"; boss-mod dispel warning.

### Elemental Shield / "Shimmer"
- Type: other (vulnerability rotation)
- Target rule: self
- Cast time: instant
- Cooldown: every 45 s (cmangos); measured 16.2–25.9 s between changes (DBM "Vulnerability" timer) — see Open questions
- Effect: -75% damage taken from every school except one, +1100% damage taken from that one (Fire, Frost, Shadow, Nature or Arcane). The aura is hidden unless a mage keeps Detect Magic on him (BigWigs/DBM require it in Vanilla).
- Telegraph: emote "Chromaggus flinches as its skin shimmers." (DBM locale)

### Enrage (20%)
- Type: enrage (permanent)
- Trigger: below 20% HP
- Effect: 10 min buff, +50% attack speed, +219–282 Physical damage per hit; Frenzy still occurs on top. Tank damage roughly doubles; the raid burns him with cooldowns (Execute range).

## Adds
- None by design. A Chromatic Mutation turns a raid member into an add (HP 24,416, Brood Power: Black — ~1063 Fire in 15 yd); sheep it and keep it alive if possible (killing it heals him).
- Trash before him: Death Talon Wyrmguards (Elemental Shield vulnerability like the boss, Brood Power: Bronze "Sandstorm" 5 s) and the technician/overseer packs that drop Hourglass Sand.

## Positioning and movement
- Tank: pull with the lever; pick him up and plant him at the chosen spot: the doorway between his room and the twin-drake room (SoD guide / warlock notes "stairway to Ebonroc and Flamegor" alternative), or the top of the circular ramp / the door to his room / between the right-hand cubbies (Warcraft Wiki). The point is a wall within two steps of every raid position. The MT faces him into the room and takes every breath; he never moves. A second tank (the Time Lapse off-tank) stands where he can break LoS instantly and builds threat on the boss but leaves LoS for Time Lapse — he is the only player not stunned, so he holds Chromaggus for 8 s. If the instance's breaths do not include Time Lapse, the second tank is a plain backup. Never let the raid take a breath other than Time Lapse; never pull him out of position.
- Melee DPS: stack tightly behind him inside the room, a step from the door frame/wall (SoD guide; Ten Ton Hammer "rogues move into melee range after the breath"). On the 5 s warning, step around the wall; return the moment the 2 s cast finishes. For Time Lapse, stay in and take it.
- Ranged DPS: off to the side behind the door wall, stepping into LoS to cast (same as Firemaw); only cast the vulnerable school and keep threat in check when he is vulnerable to yours (12x damage also means 12x threat). Hunters: fixed Tranq order, stay in LoS of him permanently (someone else dispels their Blue), carry Hourglass Sand and Restorative Potions (Warcraft Wiki: 2 Restorative Potions + 5 Hourglass Sand per attempt).
- Healers: behind cover at the wall with LoS to the MT only (Ten Ton Hammer "healers stay at the wall and heal the main tank"); they should never be in his LoS when a breath lands. For Time Lapse: the off-tank's healers hide with the off-tank; everyone else takes the stun (they cannot heal during it anyway). Dispel duties: priests/paladins Blue (Magic) on hunters and healers first, then Green (Poison, -50% healing on tanks) with druids/paladins, Red (Disease) priests/paladins, Black (Curse) mages/druids. Tank always fully dispelled first, then anyone at 3.
- Whole raid: Hourglass Sand distributed before the pull (tanks, healers, hunters first); one healer floats near the melee stack; a warlock summons the lever-puller if needed.

## What each role must do and must not do
- Tank:
  1. Position him so a wall is within 2–3 steps of everyone, then never move.
  2. Eat every breath: Ignite Flesh = ~700–840 Fire every 3 s for a minute (doubled by Black — get it decursed instantly); Corrosive Acid = -3938 armor for 15 s (expect 20–30% more melee damage); Frost Burn, Incinerate, Time Lapse as listed.
  3. Frenzy every 10–18 s: if the Tranq is late, you take 2.5x swings for 8 s — use Shield Wall/Last Stand only below 20%, where +50% attack speed is permanent.
  4. Time Lapse off-tank: stay second on threat, leave LoS at the 5 s warning, taunt if he turns to a stunned player, hold him 8 s.
  5. Never let your own afflictions reach 3; call for dispels.
- DPS:
  1. Run on the 5 s warning for every breath except Time Lapse; stay for Time Lapse.
  2. Attack only with the vulnerable school (Detect Magic on him; emote "skin shimmers" = school changed); don't waste mana at 25%.
  3. Hunters: Tranquilizing Shot rotation, within 2 s of each Frenzy; use Hourglass Sand the moment you get Bronze.
  4. Use Hourglass Sand on Bronze; Restorative Potion at 3 afflictions; mages Ice Block at 3–4.
  5. Below 20% (Enrage), warriors Execute, everyone pops cooldowns; the fight must end quickly from here.
- Healer:
  1. Dispel order: Blue off hunters/healers (Magic) > Green off tanks (Poison, -50% healing) > Black off tanks before a Fire breath (Curse) > Red (Disease). Never let anyone sit at 4.
  2. Stay out of LoS for breaths; heal the MT through the 2 s window from behind the wall.
  3. Expect MT damage: ~16–18k melee swings, Ignite Flesh ticks, Frenzy bursts; keep him above 60% going into each breath.
  4. During Time Lapse everyone but the off-tank group is stunned 8 s at half health — pre-heal the raid to full before the Bronze breath and be ready for the Frenzy that may overlap.

## Timeline of a typical pull
- Pre-pull: distribute Hourglass Sand; Detect Magic ready; Tranq order set; everyone at the wall.
- t=0 Lever pulled; gate opens; he walks to the centre; MT engages and drags him to the spot.
- t≈7 s first Brood Affliction (then one every ~7 s — ~8 per minute, ~40+ over the fight).
- t≈12–22 s first Frenzy → Tranq (then every ~15–18 s).
- t≈27–37 s Breath A (2 s cast); raid behind the wall at ~25 s. Then Breath A every 60 s (≈1:30, 2:30, ...).
- t≈45 s first Shimmer (school change; then every ~45 s or 16–26 s — see Open questions).
- t≈57–68 s Breath B; then every 60 s (≈2:00, 3:00, ...). Net: a breath every ~30 s.
- Fight length: 1.83M HP at 12x damage for the right school and 0.25x for the rest — typically 5–7 minutes for a 40-man Era raid, i.e. 10–14 breaths and 20–30 Frenzies.
- Last ~20%: Enrage (permanent +50% attack speed); burn.

## Open questions
- Frenzy cadence: 10–15 s (Warcraft Wiki, Millenium), 15 s (cmangos), ~12 s (Warcraft Tavern), 16.1–17.8 s measured (DBM), 18 s (SoD guide). Use ~15 s.
- Shimmer/vulnerability cadence: 45 s (cmangos) vs 16.2–25.9 s measured (DBM, but that timer is log-fed and may measure a different event). Treat as "every 20–45 s, watch the emote".
- Time Lapse stun: 8 s (classicdb.ch spell data, SoD guide) vs 6 s (Warcraft Wiki, Millenium, Warcraft Tavern). Threat reduction present in Classic (Warcraft Wiki says removed in 2.0.1; warlock notes agree).
- Brood Affliction application rate: 7 s (cmangos only); guides say only "periodically". Whether one cast hits one player or several is unconfirmed.
- Incinerate: 3675–4275 (Warcraft Wiki) / 3500–4700 (Ten Ton Hammer) / ~4200 (SoD).
- Frost Burn damage: 1750 base (classicdb.ch) vs ~1400 (Warcraft Wiki) vs ~5k (Ten Ton Hammer, likely with Black affliction or pre-nerf).
- Red affliction death heal and mutation heal: 150k (SoD guide); Classic figure "significant" only.
- Bronze stun: 4 s every ~5 s roll (spell data) vs "random intervals" (Warcraft Wiki); an Ascension private-server changelog lists 2 s — irrelevant to Era.
- Hourglass Sand cooldown: none listed (Warcraft Wiki); guides say 5 per attempt.
