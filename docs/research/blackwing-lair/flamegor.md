# Flamegor (Blackwing Lair)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Flamegor — Enrage/Frenzy "decreases time between attacks by 150% for 10 s", Fire Nova while frenzied, Tranquilizing Shot removes it, enrages every 10–15 s, since 1.11 LoS no longer avoids Fire Nova, debuff does not stack, dedicated healer for off-tanks and hunters, avoid Shadow Flame.
- https://classicdb.ch/?npc=11981 — HP 999,300, melee 15,715–18,235, armor 4,641, abilities 22539/23339/3391/23342.
- https://classicdb.ch/?spell=23342 — Frenzy: 10 s, +150% melee attack speed, +20% scale, periodic trigger "Fire Nova" every 2 s, dispel type Enrage.
- https://classicdb.ch/?spell=23462 — Fire Nova: instant, base 555 Fire, 100 yd radius (the spell the Frenzy aura triggers; same ID Vaelastrasz uses).
- https://classicdb.ch/?spell=22539 — Shadow Flame: 45 yd cone, 2 s cast, 3938–5063 Shadow.
- https://classicdb.ch/?spell=22682 — Shadow Flame DoT without the cloak: 1750–2251/s for 10 s.
- https://classicdb.ch/?spell=23339 — Wing Buffet: 1 s cast, 563–938 Physical, 20 yd frontal cone, knockback.
- https://classicdb.ch/?spell=3391 — Thrash: 2 extra attacks.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_flamegor.cpp — emulator timers: Frenzy first 10 s then 10–15 s (the Frenzy aura periodically triggers Fire Nova); Shadow Flame 18 s then 15–18 s; Wing Buffet 30 s then 30–35 s (threat reduction); Thrash 6 s then 2–6 s.
- https://github.com/BigWigsMods/BigWigs_Classic/blob/master/BlackwingLair/Flamegor.lua — Wing Buffet bars 29 s / 32 s; Frenzy 10 s bar; dispel announce.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/BWL/Flamegor.lua — log variance: Frenzy cooldown 8.3–11.3 s (after the 10 s buff), Wing Buffet 31.1–36.1 s (first 30.3–35.4), Shadow Flame 12.9–23 s (first 11.2–21.1); Frenzy 10 s buff timer; "dispel" special warning for hunters.
- https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ — Frenzy lasts 10 s, Fire Nova every other second while frenzied, hunters Tranq, OT soaks Wing Buffet, tanks topped after Shadow Flame.
- https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-six — 2006: a copy of Ebonroc that frenzies instead of healing; hunter Tranquilizing Shot rotation covering every enrage; Fire Nova hits everyone around him while enraged; FR negates most of it; Onyxia Scale Cloak required.
- https://us.millenium.gg/guide/6486.html?page=5 — Frenzy is the main danger; hunters rotate Tranq; frontal Shadow Flame; cloak for everyone.
- https://yttrium-tyclief.github.io/sod-guides/bwl/twindrakes (Season of Discovery) — twin-drake version only (Brand of Flame, Wing Buffet ~30 s facing each other); confirms Wing Buffet ~30 s and the 20 yd frontal cone; not Era.

## Overview
- Level ?? (boss), HP 999,300 (classicdb.ch), melee 15,715–18,235 with Thrash, armor 4,641. No hard enrage. Sixth boss; third drake in the Crimson Laboratories (shares the upper room with Ebonroc). Required in practice. Can be Taunted.
- Phases: single phase. Mechanically Ebonroc with Frenzy in place of Shadow of Ebonroc: every ~10–15 s he gains Frenzy (+150% attack speed for 10 s) which also pulses Fire Nova (555+ Fire to the entire raid) every 2 s while it lasts. Hunters remove it with Tranquilizing Shot; the raid's job is a Tranq rotation that covers every Frenzy within a second or two.
- Raid-size assumptions: 40-man Classic Era. Season of Mastery/Discovery pair him with Ebonroc and add Brands — not covered here.

## Abilities

### Frenzy (shown as "Enrage" in some clients)
- Type: enrage (self buff) with raid AoE pulses
- Target rule: self
- Cast time: instant
- Cooldown: first ~10 s, then every 10–15 s (cmangos; Warcraft Wiki "every 10 to 15 seconds"); logs show 8.3–11.3 s between the buff ending/being removed and the next cast (DBM) — i.e. a near-constant cycle if not dispelled
- Damage: none directly; while active he triggers Fire Nova every 2 s (see below) and his melee attack speed is +150% (Thrash bursts become ~5 hits in 2 s on the tank)
- Debuff (buff on boss): Frenzy, 10 s, dispel type Enrage — removed by Hunter Tranquilizing Shot (and nothing else in Era). Also grows his model by 20%.
- Movement effect: none
- Telegraph: generic emote "Flamegor goes into a frenzy!" (EMOTE_GENERIC_FRENZY) and a visible size increase; boss mods warn hunters to dispel.

### Fire Nova (while frenzied)
- Type: AoE (room)
- Target rule: all enemies within 100 yd — not blocked by line of sight since patch 1.11 (Warcraft Wiki)
- Cast time: instant, triggered automatically every 2 s by the Frenzy aura (classicdb.ch periodic trigger; Warcraft Tavern "every other second")
- Cooldown: tied to Frenzy — up to 5 pulses per undispelled Frenzy
- Damage: 555 base Fire per pulse (same spell as Vaelastrasz's Fire Nova, 555–645), reduced by Fire Resistance; Warcraft Wiki notes "1k+ to the raid if not handled quickly" (two pulses)
- Debuff / movement: none
- Telegraph: none beyond the Frenzy itself

### Shadow Flame
- Type: frontal cone
- Target rule: 45 yd cone in front of him, toward the tank
- Cast time: 2 s
- Cooldown: first ~18 s then 15–18 s (cmangos); logs 12.9–23 s, first at 11.2–21.1 s (DBM)
- Damage: 3938–5063 Shadow; without the Onyxia Scale Cloak also 1750–2251 Shadow/s for 10 s (fatal)
- Telegraph: 2 s cast bar

### Wing Buffet
- Type: frontal cone knockback / threat reduction
- Target rule: 20 yd cone in front of him
- Cast time: 1 s
- Cooldown: first ~30 s then 30–35 s (cmangos); logs 31.1–36.1 s (DBM); BigWigs 29/32 s
- Damage: 563–938 Physical
- Movement effect: knockback; threat of those hit reduced (~50%)
- Telegraph: 1 s cast bar / boss-mod timer

### Thrash
- Type: melee extra attacks, every 2–6 s (cmangos); 2 extra swings. Under Frenzy this is the tank-killer.

### Summon Player
- Type: aggro pull; places an out-of-reach player in front of him. Rare.

## Adds
- None. Pull him after Ebonroc, once his patrol is clear of the remaining lab pack (Death Talon Wyrmguards guard the way to Chromaggus; they have the same Elemental Shield vulnerability mechanic as Chromaggus and Brood Power: Bronze "Sandstorm").

## Positioning and movement
- Tank: tank him like Ebonroc — in a corner of the upper room with your back to the wall, facing him away from the raid. Two to three tanks: MT in front; a buffet OT at 90 degrees inside the hitbox who Taunts just before each Wing Buffet (every 30–35 s) so the threat cut lands on him, then hands back; the MT eats every Shadow Flame. Tank FR as high as possible (Fire Nova hits the tank too) plus the Onyxia Scale Cloak. Never let him face the raid; never let a buffet hit the MT.
- Melee DPS: directly behind him, never beside the tanks. Fire Resistance ~150–200 because Fire Nova cannot be avoided by position. Stop and bandage if the Tranq rotation slips.
- Ranged DPS: behind him at range; LoS does not help against Fire Nova (post-1.11), so stand wherever healers can reach you. Hunters: 3–4 hunters in a fixed Tranquilizing Shot order (Tranq has a 20 s cooldown; Frenzy comes every 10–15 s, so at least two hunters are needed and three is the safe number — Warcraft Wiki "multiple hunters, well-coordinated rotation"). Hunters stand with clear LoS to him at all times and must not be the ones hiding or bandaging.
- Healers: one healer assigned to the off-tanks and one to the hunters (Warcraft Wiki: "they take the most fire"); the rest on the MT, with raid heals ready for every Frenzy window (555–645 per pulse per player across the raid). PW:S the MT on each Shadow Flame cast.
- Whole raid: everyone cloaked, everyone behind him, FR gear on. There is no hide spot; the fight is simply kept short.

## What each role must do and must not do
- Tank:
  1. Corner, back to wall, face away from the raid, exactly as Ebonroc.
  2. Buffet OT taunts ~2–5 s before each Wing Buffet (first ~30 s, then every 30–35 s).
  3. Expect Shadow Flame every 15–18 s (4–5k) and, when a Frenzy goes untranqed, 10 s of 2.5x attack speed with Thrash — call Shield Wall if a Frenzy lasts more than ~3 s.
  4. Never Taunt the MT role back while a Frenzy is active unless the MT is dead.
- DPS:
  1. Hunters: a named Tranq order (A, B, C, A...). Tranquilizing Shot the instant the emote/size change/boss-mod warning fires; the shot must land within ~2 s to prevent the first Fire Nova pulse. Keep Tranq off cooldown for the next one (10–15 s later); never use it for anything else.
  2. Everyone else: Onyxia Scale Cloak, FR gear, stay behind him.
  3. Threat drops on every Wing Buffet for the tank hit — Vanish/Feign if you are close to the top.
  4. Melee never in front; rogues bandage during Frenzies rather than demanding heals.
- Healer:
  1. Nothing dispellable on players; Frenzy is hunter-only.
  2. Each Frenzy that lasts 2 s = 555–645 Fire to all 40 raid members; prepare raid heals when the Frenzy warning fires.
  3. MT: 4–5k Shadow Flame every 15–18 s; shield before, heal after.
  4. Dedicated healers on the OTs and on the hunters so a Tranq is never interrupted by death.

## Timeline of a typical pull
- t=0 MT pulls into the corner; raid behind him; hunters spread with LoS.
- t≈10 s first Frenzy → Hunter A Tranqs within 1–2 s. If not removed: Fire Nova at +2, +4, +6, +8, +10 s.
- t≈11–21 s first Shadow Flame (then every 15–18 s).
- t≈20–25 s second Frenzy → Hunter B. t≈30–40 s third → Hunter C, and so on every 10–15 s (≈25–30 Frenzies in a 5-minute fight).
- t≈30–35 s first Wing Buffet — OT taunts at ~28 s (then every 30–35 s).
- Kill at 999k HP in ~4–5 minutes at ~3,500–4,000 raid DPS. Without Ebonroc's healing he dies faster than Ebonroc if the Tranq rotation holds.

## Open questions
- Frenzy cadence: 10–15 s (Warcraft Wiki, cmangos) vs 8.3–11.3 s measured between removal and the next cast (DBM) vs "every 12 seconds" (Warcraft Tavern for the Chromaggus analogue). Plan for a Frenzy every ~10 s.
- Frenzy attack-speed figure: spell data "+150% attack speed"; the Warcraft Wiki phrases it as "decreases time between attacks by 150%". Either way roughly 2.5x swings.
- Fire Nova damage per pulse: 555 base (classicdb.ch) ≈ 555–645 (Warcraft Wiki for Vael's identical spell); FR-mitigated.
- Whether LoS blocks Fire Nova: not since patch 1.11 per the Warcraft Wiki; Classic Era is 1.12-based, so no.
- Wing Buffet / Shadow Flame cadence: same spread as Firemaw/Ebonroc (30–35 vs 31–36 s; 15–18 vs 13–23 s).
