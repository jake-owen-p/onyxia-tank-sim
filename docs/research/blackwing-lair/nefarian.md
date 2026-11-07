# Nefarian (Blackwing Lair)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Nefarian_(tactics) — phase 1 drakonid types and resistances, 42 drakonids to trigger phase 2, two colours per instance plus Chromatic, doorway split strategy; phase 2 abilities (Shadow Flame cone 2210 modern value, Tail Lash 614 + disarm + 2 s stun, Cleave, Bellowing Roar 35 yd / 4 s fear ~every 30 s with ground shaking, Veil of Shadow -75% healing 6 s curse); every class call with counters; phase 3 Bone Constructs; MT turns him during the Rogue call; behind-the-throne safe spot.
- https://classicdb.ch/?npc=11583 — Nefarian HP 2,100,000, melee 4,924–5,153 (see Open questions).
- https://classicdb.ch/?npc=10162 — Lord Victor Nefarius: HP 306,475, Shadow Bolt Volley 20741, Shadow Bolt 24668.
- https://classicdb.ch/?npc=14261 .. 14265, 14302 — Drakonids: Blue 15,260 HP, Green 15,288, Bronze 15,139, Red 15,252, Black 15,260, Chromatic 24,416; Brood Power abilities.
- https://classicdb.ch/?npc=14605 — Bone Construct: level 60, HP 6,104, Exploit Weakness.
- https://classicdb.ch/?npc=14662, 14663, 14664, 14666, 14668 — Corrupted Fire Nova Totem V (2,323 HP), Corrupted Stoneskin Totem VI (31,000), Corrupted Healing Stream Totem V (38,000), Corrupted Windfury Totem III (3,036), Corrupted Infernal (4,344 HP).
- https://classicdb.ch/?spell=22539 — Shadow Flame: 45 yd cone, 2 s cast, 3938–5063 Shadow.
- https://classicdb.ch/?spell=22682 — Shadow Flame DoT without the Onyxia Scale Cloak: 1750–2251 Shadow every 1 s for 10 s.
- https://classicdb.ch/?spell=22992 / 22993 — landing Shadow Flame: passive periodic trigger (10 s interval) and a 20,000 Shadow hit, unlimited range (phase 1→2 transition breath).
- https://classicdb.ch/?spell=22686 — Bellowing Roar: 1.5 s cast, fear 4 s, 35 yd radius.
- https://classicdb.ch/?spell=22687 — Veil of Shadow: 40 yd, instant, Curse, healing taken -75% for 6 s.
- https://classicdb.ch/?spell=19983 (cmangos) / 20691 — Cleave: weapon +50 up to 10 targets (19983) or normal damage up to 5 targets within 15 yd (20691).
- https://classicdb.ch/?spell=23364 — Tail Lash: 30 yd cone behind, 1094 base Physical, 2 s stun, triggers "Dropped Weapon" (disarm).
- https://classicdb.ch/?spell=22665 — Shadow Bolt Volley (Nefarius): 2 s cast, Shadow, base 255, 30 yd radius.
- https://classicdb.ch/?spell=22667 — Shadow Command (Nefarius mind control): 30 yd, 15 s charm, +300% damage done.
- https://classicdb.ch/?spell=23397 — Berserk (Warrior call): forced Berserker Stance, damage taken +30%, 30 s.
- https://classicdb.ch/?spell=23398 — Involuntary Transformation (Druid call): forced Cat Form, 30 s.
- https://classicdb.ch/?spell=23401 / 23402 — Corrupted Healing (Priest call): 30 s; direct heals apply a DoT of 175–226 Shadow per 1 s.
- https://classicdb.ch/?spell=23410 / 23603 — Wild Magic (Mage call): 30 s, every 5 s casts Wild Polymorph (20 s, Magic, unlimited range) on a raid member.
- https://classicdb.ch/?spell=23414 — Paralyze (Rogue call): rooted 30 s.
- https://classicdb.ch/?spell=23418 — Siphon Blessing (Paladin call): 30 s, every 5 s forced to cast Blessing of Protection on Nefarian.
- https://classicdb.ch/?spell=23424 — Corrupted Totems (Shaman call).
- https://classicdb.ch/?spell=23427 — Summon Infernals (Warlock call).
- https://classicdb.ch/?spell=23436 — Corrupt Weapon (Hunter call): ranged weapon durability damaged to 0.
- https://classicdb.ch/?spell=23361 / 23362 / 23363 — Raise Undead Drakonid (summons Bone Construct 14605 from Drakonid Bones objects), Raise Drakonids, corpse trigger.
- https://classicdb.ch/?spell=22560, 22559, 22561, 22642, 22558 — Brood Power: Black (1063 Fire, 15 yd), Blue (657 Frost + 875 mana burn + -100% attack speed 6 s, 15 yd), Green (stun), Bronze (788 Arcane + -50% cast speed, -33% attack speed, 15 yd), Red (263/s Fire for 5 s, 15 yd).
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_nefarian.cpp — phase 2 timers: Shadow Flame 12 s, Bellowing Roar 30 s, Veil of Shadow 15 s, Cleave 7 s, Tail Lash 10 s, Class Call first 35 s then 35–40 s; Raise Drakonid below 20%; low-HP yell at 5%.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_victor_nefarius.cpp — phase 1 Nefarius timers: Shadow Bolt 2–4 s, Fear 10–20 s, Shadow Bolt Volley 19–28 s, Silence 14–23 s, Shadow Command (MC) 24–30 s, Shadowblink 30–40 s; two tunnel spawners, one colour each.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/blackwing_lair.h — MAX_DRAKONID_SUMMONS 42; Nefarian spawns 5 s after the 42nd kill.
- https://github.com/BigWigsMods/BigWigs_Classic/blob/master/BlackwingLair/Nefarian.lua — counts to 41 drakonid deaths then a 12 s bar to stage 2; Bellowing Roar bar 32 s; class call bar 30 s; Shadow Command 15 s; phase yell triggers.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/BWL/Nefarian.lua and localization.en.lua — exact class-call and phase yells; class call timer 30 s; Fear 27–90.1 s; Shadow Flame 8.1–37.2 s; phase 2 14.2–17.7 s after the last kill; phase 3 warning at 25%.
- https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-eight — 2006: 20 of each of two types spawn at a constant rate, Nefarian lands around 3 minutes; drakonid abilities; class calls every 30 s with emotes and counters; stop DPS at 21% and wait for a Hunter/Paladin call before pushing 20%; phase 3 AoE plan; 15 min respawn after a wipe.
- https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ — 42 kills; behind-the-throne safe spot must be reached before the 42nd dies; drakonid handling by colour; fear twice a minute, 40 yd immunity; class call list; phase 3 Shield Wall → Challenging Shout stagger, Holy Wrath.
- https://us.millenium.gg/guide/6486.html?page=7 — ~40 drakonids in waves of 20 per staircase; Nefarius casts Shadow Bolt and Polymorph in phase 1; cannot be taunted; Fear Ward/Tremor; 1 dwarf priest or shaman and 2 druids beside the MT for Veil of Shadow; class call effects (Warrior +10% damage taken per this source); Stratholme Holy Water for phase 3.
- https://yttrium-tyclief.github.io/sod-guides/bwl/nefarian (Season of Discovery) — 42 kills; class call every 30 s; Priest call: Renew and PW:S are safe; Paladin call: keep BoP on cooldown; Rogue call: MT turns him; Fear Ward on MT; phase 3 adds dragged under the boss.
- https://docs.google.com/document/d/1VT_67cPSHqvRK2_yit0QSiyzGwf9oXTKjcinxsVymoA (warlock notes) — phase 2 after ~40 adds; stand away from other casters before a call (Warlock infernals stun); phase 3 AoE with Sappers/Holy Water/Rain of Fire/Hellfire.

## Overview
- Level ?? (boss). HP 2,100,000 (classicdb.ch — see Open questions). Nefarian cannot be Taunted (Millenium). Final boss, required for the raid's completion. Lord Victor Nefarius (the human form, HP 306,475, immune in phase 1) runs phase 1 from the balcony; after a wipe he takes 15 minutes to return to his throne (Ten Ton Hammer, Millenium).
- Phases:
  - Phase 1 (Drakonids): Nefarius stands on the throne platform and casts Shadow Bolt (random), Shadow Bolt Volley, Fear, Silence and Shadow Command (15 s mind control, +300% damage) on the raid. Two tunnels at the bottom of the room each spawn one drakonid colour (fixed per instance) plus Chromatic Drakonids. Phase 2 begins after 42 drakonids die (Warcraft Wiki, Warcraft Tavern, cmangos; boss mods count 41 then ~12–18 s). Roughly 3 minutes at a constant spawn rate (Ten Ton Hammer).
  - Transition: Nefarius teleports off and Nefarian flies in, breathing Shadow Flame across the entire room ignoring line of sight; without the Onyxia Scale Cloak the Shadow Flame DoT (1750–2251/s for 10 s) kills you. The spot behind the throne is out of the breath (Warcraft Wiki, Warcraft Tavern "be there before the 42nd dies").
  - Phase 2 (Nefarian): dragon fight: Shadow Flame cone on the tank, Cleave, Tail Lash, Bellowing Roar (AoE fear), Veil of Shadow (healing curse on the tank), and a Class Call every ~30 s that hits every player of one class.
  - Phase 3 (20%): "Impossible! Rise my minions! Serve your master once more!" — every drakonid that died in phase 1 is raised as a Bone Construct (HP 6,104, hits hard) from its corpse; class calls continue; after the constructs die it is phase 2 to the end. Whole fight 20–30 minutes (Warcraft Wiki).
- Raid-size assumptions: 40-man Classic Era (nine classes: no Death Knight/Monk/Demon Hunter/Evoker calls). Season of Discovery adds Black Trial effects; ignore.

## Abilities

### Phase 1 — Lord Victor Nefarius (balcony)
- Shadow Bolt: random player, 40 yd, 2 s cast, Shadow (~1,350–1,650 observed for his 21077 variant; 24668 base 638); every 2–4 s (cmangos). Shadow Protection potions / Shadow Ward (warlock notes).
- Shadow Bolt Volley: all players within 30 yd of the target point, 2 s cast, base 255 Shadow; every 19–28 s (cmangos). Ten Ton Hammer: "randomly volleys certain sides — keep Shadow Protection up".
- Fear: a random player, every 10–20 s (cmangos). Short, single target.
- Silence: random player, 10 s (23207 analogue), every 14–23 s.
- Shadow Command (mind control): a random non-tank player, 30 yd, 15 s charm with +300% damage; every 24–30 s (cmangos). Boss mods mark the target; sheep/root/CC them, do not kill them.
- Polymorph (Millenium) on random raid members — treat as the same slot.
- Shadowblink: he teleports around the platform every 30–40 s (cosmetic).

### Drakonids (phase 1 adds; see Adds)

### Landing Shadow Flame (transition)
- Type: AoE (room), ignores LoS
- Target rule: everyone in the room except players tucked behind the throne
- Cast time: instant on landing; he yells first ("Well done, my minions. The mortals' courage begins to wane! Now, let's see how they contend with the true Lord of Blackrock Spire!!!")
- Damage: Shadow; with the Onyxia Scale Cloak only the direct hit (same order as the cone: ~4,000–5,000, resistible — Warcraft Wiki modern text says ~1000); without the cloak the 10 s DoT at 1750–2251/s (spell 22682) or the 20,000 single hit (22993) — lethal either way. Ice Block / Divine Shield also work.
- Telegraph: the phase-2 yell; boss mods give a 12–18 s bar after the 41st/42nd kill.

### Shadow Flame (phase 2 cone)
- Type: frontal cone
- Target rule: cone in front of him toward the tank, 45 yd
- Cast time: 2 s
- Cooldown: ~12 s (cmangos); logs 8.1–37.2 s (DBM) — irregular
- Damage: 3938–5063 Shadow (classicdb.ch) — Warcraft Wiki's 2210 is the post-squish tooltip; no-cloak DoT 1750–2251/s for 10 s
- Telegraph: 2 s cast bar; PW:S the MT.

### Cleave
- Type: melee cone
- Target rule: current target plus nearest allies (up to 10 at +50 weapon damage per 19983; 20691 variant up to 5 within 15 yd). Warcraft Wiki: "normal damage plus 100%".
- Cadence: ~7 s (cmangos)
- Telegraph: none

### Tail Lash
- Type: tail (cone behind)
- Target rule: everyone behind him within 30 yd
- Cast time: instant
- Cadence: ~10 s (cmangos)
- Damage: 1094 base Physical (classicdb.ch; Warcraft Wiki 614 modern)
- Movement effect: 2 s stun and disarm ("Dropped Weapon")
- Telegraph: none

### Bellowing Roar
- Type: fear (AoE)
- Target rule: all enemies within 35 yd of him
- Cast time: 1.5 s
- Cooldown: ~30 s (cmangos; Warcraft Wiki "about every 30 seconds"; Warcraft Tavern "twice per minute"); BigWigs bar 32 s; logs 27–90 s (DBM) — he can skip casts
- Damage: none
- Debuff: fear 4 s, Physical school, no dispel type (Fear Ward prevents, Tremor Totem/Berserker Rage break; warriors stance-dance)
- Telegraph: 1.5 s cast bar and the ground shakes (Warcraft Wiki). Players beyond 35–40 yd are immune.

### Veil of Shadow
- Type: debuff (curse)
- Target rule: his current target (the tank; Warcraft Wiki: the player nearest his hitbox centre), 40 yd
- Cast time: instant
- Cooldown: ~15 s (cmangos)
- Debuff: Veil of Shadow, 6 s, Curse, healing taken -75%. Decurse instantly (mages, druids).
- Telegraph: debuff on the MT; boss mods warn decursers.

### Class Call
- Type: debuff on every player of one class
- Target rule: one class per call, chosen at random among classes present (the Hunter call is the common DPS-safe call; Ten Ton Hammer waits for Hunter or Paladin before pushing 20%)
- Cast time: instant; always preceded by his yell naming the class
- Cooldown: every 30 s (DBM/BigWigs, Warcraft Wiki 25–35 s, Ten Ton Hammer, SoD guide); cmangos 35–40 s with the first at ~35 s after landing
- Duration: 30 s for every call (spell data), so the next call begins as the previous ends
- The nine Classic calls (yells from the DBM locale, effects from spell data and guides):
  - Warriors — "Warriors, I know you can hit harder than that! Lets see it!" → Berserk: forced into Berserker Stance, damage taken +30%, cannot change stance for 30 s. The MT needs extra healing and loses Defensive Stance threat; everyone else eases DPS. (Millenium says +10%; spell data says 30%.)
  - Druids — "Druids and your silly shapeshifting. Lets see it in action!" → Involuntary Transformation: forced into Cat Form for 30 s, no shapeshifting or healing. Druid decursers are offline: mages take Veil of Shadow.
  - Priests — "Priests! If you're going to keep healing like that, we might as well make it a little more interesting!" → Corrupted Healing: for 30 s every direct heal a priest casts gives its target a stacking DoT of 175–226 Shadow per second. Priests stop direct healing (Renew and PW:S are fine — SoD guide; Millenium says only Renew); 3+ stacks make the MT unhealable.
  - Mages — "Mages too? You should be more careful when you play with magic..." → Wild Magic: every 5 s for 30 s each mage casts Wild Polymorph (20 s sheep, Magic, no range or LoS limit) on a random raid member. Ice Block cancels it; priests/paladins dispel the sheep (tanks and healers first); mages move away.
  - Paladins — "Paladins... I've heard you have many lives. Show me." → Siphon Blessing: every 5 s for 30 s each paladin is forced to cast Blessing of Protection on Nefarian (physical immunity, DoTs/debuffs cleansed). Melee stop; casters continue; paladins Judgement of Wisdom; keep BoP on cooldown beforehand (SoD guide).
  - Rogues — "Rogues? Stop hiding and face me!" → Paralyze: every rogue is teleported next to Nefarian and rooted for 30 s. If they land in the Cleave/Shadow Flame/Tail Lash arcs the MT turns him 45–90 degrees away; rogues can Vanish (Millenium).
  - Shamans — "Shamans, show me what your totems can do!" → Corrupted Totems: hostile Fire Nova Totem (2,323 HP), Windfury Totem (3,036 HP — buffs him), Stoneskin Totem (31,000 HP), Healing Stream Totem (38,000 HP) appear; kill the Windfury and Fire Nova totems immediately with single-target damage (immune to AoE per Ten Ton Hammer). Shaman mana drain is the lasting cost.
  - Warlocks — "Warlocks, you shouldn't be playing with magic you don't understand. See what happens?" → Summon Infernals: 2 Corrupted Infernals (4,344 HP each, fire-immune, Immolate aura) per warlock; they stun nearby players on landing. Warlocks stand isolated at the back; mages Frost Nova and AoE (non-fire) them.
  - Hunters — "Hunters and your annoying pea-shooters!" → Corrupt Weapon: equipped ranged weapon durability set to 0 (unusable until repaired). Hunters unequip on the yell (macro) or swap to a junk weapon; otherwise harmless — the raid's "free" call.
- Telegraph: the yell, then boss-mod "<Class> call" with a 30 s bar.

### Raise Drakonids (phase 3)
- Trigger: below 20% HP (DBM pre-warns at 25%); yell "Impossible! Rise my minions! Serve your master once more!"
- Effect: every Drakonid Bones object left by a phase-1 kill spawns a Bone Construct (HP 6,104, Exploit Weakness — extra damage from behind, hits hard on cloth). Roughly 42 undead adds at once, spread around where the drakonids died. They are Undead: Holy Wrath, Stratholme Holy Water, Turn Undead work. Nefarian keeps fighting and keeps doing class calls.

## Adds
- Phase 1 drakonids: from the two tunnels (one colour each, fixed per instance) at a constant rate until 42 have died (cmangos: 42 total; Ten Ton Hammer: 20 of each type; Millenium: ~40 in waves of 20 per staircase). Chromatic Drakonids (HP 24,416, "largest and toughest", Brood Power: Black ~1063 Fire AoE) come from both sides every encounter. Colour abilities (Brood Power):
  - Red (15,252 HP): fire DoT aura 263/s for 5 s in 15 yd (Ten Ton Hammer "1300–1500 per second, stacks up to 5"); resists Fire. Always AoE'd.
  - Blue (15,260 HP): 657 Frost + 875 mana burn + -100% attack speed 6 s in 15 yd; resists Frost/Arcane. Always single-target assist trains.
  - Green (15,288 HP): stuns in 15 yd; resists Nature. Weakest; follows its partner colour's plan.
  - Black (15,260 HP): 1063 Fire direct in 15 yd; resists Shadow and Fire. Hunters/direct damage.
  - Bronze (15,139 HP): 788 Arcane + -50% cast speed, -33% attack speed 6 s in 15 yd; resists Arcane. AoE'd.
  - Each side: 2–3 tanks (one for small mobs, one for priority targets), a hunter Frost Trap, warriors Sunder, rogues on the main assist, mages/warlocks AoE once grouped; warlock curses on every drakonid.
- Phase 2 call adds: Corrupted Totems (Shaman call) and Corrupted Infernals (Warlock call) as above.
- Phase 3: Bone Constructs, one per dead drakonid, ~6,100 HP each, killed by stacked AoE within ~20–30 s.

## Positioning and movement
- Tank:
  - Phase 1: tanks split per side at the two tunnel exits; pick up each drakonid as it emerges and drag it to the AoE/assist group; Chromatics to a dedicated tank.
  - Transition: the designated MT and his healers move to the landing spot near the throne during the last few kills (Ten Ton Hammer); everyone else may hide behind the throne if cloaks are missing.
  - Phase 2: tank him where he lands, facing away from the raid, with the raid at his flank (not behind: Tail Lash; not in front: Cleave/Shadow Flame). He is not taunt-able, so the MT must never die: Fear Ward (dwarf priest) or Tremor Totem on the MT before every Bellowing Roar (every ~30 s), or stance-dance / Berserker Rage. Two druids and a dwarf priest or shaman stay beside the MT purely for Veil of Shadow and dispels (Millenium). During the Rogue call, turn him 45–90 degrees so the rooted rogues are out of his arcs. During the Warrior call, you take +30% damage — call cooldowns and extra heals. Never face the raid; never let him stand where rogues will be teleported into his cone.
  - Phase 3: off-tanks gather the constructs (Challenging Shout, Shield Wall staggered — Warcraft Tavern) at the AoE point or drag them under the boss (SoD guide); the MT stays on Nefarian.
- Melee DPS: phase 1 on the main assist per side; phase 2 at his flank/side, out of the frontal cone and out of the 30 yd rear cone, inside 35 yd so they get feared with the tank only if Fear Ward fails — they should hide during the roar cast (Millenium) or accept the 4 s. Rogues expect to be ported in on their call. Phase 3: kill totems first, then help AoE; paladins Holy Wrath.
- Ranged DPS: phase 1 at max range from the tunnel doors so they can switch sides (Warcraft Wiki); phase 2 beyond 35–40 yd (fear-immune; Warcraft Tavern "beyond 40 yards are immune") on his flank; warlocks stand isolated at the very back (their infernals stun on landing); mages ready to Ice Block their own call and to Frost Nova infernals. Phase 3: AoE groups move to where the drakonids died or to the stack point; Sappers/Holy Water.
- Healers: phase 1 split by side, Shadow Protection up; phase 2 beyond 35 yd except the MT's dedicated group (dwarf priest/shaman for Fear Ward/Tremor, druids/mages for Veil of Shadow) which stays within range; priests stop direct heals during their call; druids are useless during theirs; phase 3 stay away from the construct stack.
- Whole raid: Onyxia Scale Cloak on everyone from the start of phase 1; the behind-the-throne corner is the only breath-safe spot without it; stop DPS at ~21% and wait for a harmless call (Hunter/Paladin) before pushing phase 3 (Ten Ton Hammer); kill Corrupted Totems before 20% (Warcraft Tavern); lower graphics before phase 3 (Warcraft Wiki).

## What each role must do and must not do
- Tank:
  1. Phase 1: hold your tunnel, prioritise Chromatics and Blues, keep adds off the casters; Shadow Protection up.
  2. Before the 42nd kill be at the landing spot with the Onyxia Scale Cloak on; pick him up as he lands.
  3. Fear Ward/Tremor before every Bellowing Roar (~30 s cadence, 1.5 s cast, ground shakes); never be feared facing the raid.
  4. Shadow Flame every ~12 s (4–5k): be topped; PW:S from a priest (not during the Priest call).
  5. Rogue call: rotate him away from the rooted rogues. Warrior call: you are in Berserker Stance at +30% damage taken for 30 s — Shield Wall/Last Stand are for this. Druid-MT is a liability: rotate an OT in during the Druid call (SoD guide).
  6. Never let the MT die — no Taunt. Phase 3 off-tanks: Challenging Shout → Shield Wall staggered.
- DPS:
  1. Phase 1: assist train per colour plan (Red/Bronze AoE, Blue/Black single-target, Green follows); warlock curses on everything; don't out-threat the side tanks.
  2. Phase 2: stay out of both arcs; ranged beyond 35 yd; watch threat after each fear (the MT loses time).
  3. Your class call: Mages Ice Block (or accept sheeping others) and Frost Nova infernals; Warlocks pre-isolate; Hunters unequip the ranged weapon on the yell; Paladins stop attacking and Judgement of Wisdom; Rogues Vanish or hit from where they land; Shamans kill their own totems; Warriors ease off (threat drops in Berserker).
  4. Everyone: kill Corrupted Totems (Windfury, Fire Nova first) and Infernals as they appear; stop DPS at 21% until the raid calls the push.
  5. Phase 3: AoE the Bone Constructs (Holy Wrath, Holy Water, Sappers, Rain of Fire/Hellfire, Arcane Explosion/Blizzard); then back on the boss; class calls keep coming.
- Healer:
  1. Decurse Veil of Shadow (Curse, -75% healing, every ~15 s) within a second — mages and druids beside the MT; mages cover during the Druid call, druids during the Mage call.
  2. Dispel Wild Polymorph (Magic) off tanks and healers first during the Mage call.
  3. Priest call: no direct heals for 30 s — Renew/PW:S only; shamans/druids/paladins carry the MT.
  4. Fear Ward (dwarf priest) on the MT every 30 s; Tremor Totem if no dwarf.
  5. Expect MT spikes: Shadow Flame 4–5k every ~12 s, Cleave + melee, Warrior call +30%; pre-heal before each Bellowing Roar cast.
  6. Phase 3: stay out of the construct stack; keep the construct tanks alive through Exploit Weakness bursts.

## Timeline of a typical pull
- t=0 Speak to Nefarius: "Let the games begin!" — the two tunnels start spawning drakonids; Nefarius casts Shadow Bolt (2–4 s), Fear (10–20 s), Shadow Bolt Volley (19–28 s), Silence (14–23 s), Shadow Command MC (24–30 s), Shadowblink (30–40 s).
- t≈0–3:00 Kill 42 drakonids (Ten Ton Hammer: landing around the 3 minute mark). Boss mods count kills; at 41 a 12–18 s bar runs.
- t≈3:00 (+5 s after the 42nd kill) Nefarius: "Well done, my minions..." → Nefarian lands with the room-wide Shadow Flame; MT picks him up.
- P2 +7 s first Cleave (then ~7 s); +10 s first Tail Lash (~10 s); +12 s first Shadow Flame (~12 s, irregular); +15 s first Veil of Shadow (~15 s); +30 s first Bellowing Roar (~30 s); +30–35 s first Class Call, then one every 30 s with a 30 s duration (so one call is always active).
- P2 lasts ~6–10 minutes to 20% (1.68M damage), i.e. 12–20 class calls, 12–20 fears.
- 21%: hold DPS; on a Hunter/Paladin call push to 20%.
- 20%: "Impossible! Rise my minions!" → ~42 Bone Constructs (6,104 HP) rise; AoE them in 20–40 s; class calls continue.
- Then phase 2 rules to 0%; yell at 5%. Total 20–30 minutes.

## Open questions
- Nefarian HP: classicdb.ch lists 2,100,000 and melee 4,924–5,153, which are low relative to Chromaggus (1.83M, 15.7–18.2k melee). Possibly a database artefact; no guide states his HP. Treat 2.1M as a lower bound.
- Class call cadence: 30 s (DBM, BigWigs, Ten Ton Hammer, SoD guide), 25–35 s (Warcraft Wiki), 35–40 s (cmangos). Use 30 s.
- Warrior call damage taken: +30% (spell data, Warcraft Wiki, SoD guide) vs +10% (Millenium) vs "double damage" (Warcraft Tavern).
- Bellowing Roar cadence: 30 s (cmangos, Warcraft Wiki, BigWigs 32 s) vs 27–90 s observed (DBM) — he can skip casts while another ability is in progress.
- Shadow Flame cone damage: 3938–5063 (Classic spell data) vs 2210 (Warcraft Wiki modern tooltip). Landing breath: 20,000 single hit (22993) and/or 1750–2251/s DoT (22682); the cloak prevents the lethal part. Warcraft Wiki's "about 1000, resistible" is the modern version.
- Drakonid count: 42 (Warcraft Wiki, Warcraft Tavern, cmangos), ~40 (warlock notes, Millenium), "20 of each type" (Ten Ton Hammer). Boss mods count to 41 and start a bar.
- Cleave variant: cmangos uses 19983 (+50, 10 targets); the Warcraft Wiki describes "+100% to up to 10 targets"; classicdb.ch 20691 (5 targets within 15 yd) is another candidate.
- Priest call safe spells: Renew and PW:S (SoD guide) vs Renew only (Millenium); Corrupted Healing DoT 175–226/s, duration per application unclear ("30 seconds remaining" in the data).
- Corrupted Infernal landing stun duration and Shaman totem set: totem HP from classicdb.ch (2.3k/3k/31k/38k); Ten Ton Hammer says totems are AoE-immune, Millenium says 200–2,000 HP.
- Phase 1 Nefarius Shadow Bolt damage: 21077 (1350–1651) vs 24668 (base 638); which he uses in Classic is unconfirmed.
- Veil of Shadow target: "current victim" (cmangos) vs "player nearest his hitbox centre" (Warcraft Wiki) — usually the same person.
