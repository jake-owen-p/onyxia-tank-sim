# Onyxia tutorial fidelity audit

Checked 2026-11-11 against Classic level-60 Onyxia. This is not the Wrath remake, Season of Discovery or a private-server ruleset. Findings describe the implementation at `b99fa39`, before the corrective patch.

## Scope and conclusions

Of 62 encounter scripts, only `data/encounters/onyxia.json` defines a tutorial. Its old controller changes the encounter: it disables the boss while the player walks to the tank spot, teleports between lessons, freezes HP, advances phases directly and injects attacks. The tutorial therefore cannot be used as evidence that the full fight behaves the same way.

The strongest correction is to make the tutorial observe the normal simulation, with the same seed, phase settings, aggro, movement, damage and action scheduler. Coaching may explain what happens or highlight a position; it must not make the boss ignore the player or manufacture an aggro loss. Pausing for reading should pause the entire encounter. Verify equality of simulation states and events under identical inputs, including entering the room before the opening card is dismissed.

## Findings and recommended corrections

| Mechanic | Finding and recommendation | Confidence |
| --- | --- | --- |
| Pull and facing | The pull begins on approach. The tank turns and draws her to the back wall while the raid moves to her sides. The player must not be able to walk through a passive boss to the wall and then return to pull her. Keep normal aggro/chase/melee active from the entrance. | High for the sequence; exact body-pull radius remains an estimate. |
| Threat abilities | Onyxia is taunt-immune. Calling an instant threat match/forced target “Threat burst” does not fix that mechanic. Use additive threat from attacks, allow a large existing deficit to require more work, and teach building a lead before DPS starts. A combined button is a control simplification, not an actual WoW spell. | High. |
| Knockbacks | Knock Away removes 25% of its victim's threat. Wing Buffet is a separate frontal damage/knockback spell and must not inherit that threat loss. Wall placement limits movement; it does not negate Knock Away's threat reduction. | High. |
| Air threat and landing | Fireball clears its **primary target's** threat. Splash victims should not all be reset. Do not replace individual Fireball effects with a blanket landing reset. Preserve surviving threat into Phase 3, then pick the appropriate target normally. An aggregate raid pool cannot faithfully represent a single raid member losing threat. | High for Fireball; moderate for no independent landing reset. |
| Phase transitions | Keep the 65% and 40% boundaries. On takeoff she first moves across the ground toward the entrance/south end, then lifts off. A diagonal rise from the tank wall teaches the wrong movement. Preserve continuous movement on landing and let normal threat determine whom she follows. | High for broad sequence and thresholds; exact timings/coordinates are estimates. |
| Deep Breath | Select a directional flight path, get her to its starting position, then begin the five-second warning while she faces along it. She subsequently crosses the room; the hazard should travel with the sweep rather than activate an entire stationary lane while she stays at its start. Teach reading her position/facing and moving to the side. | High for directional cast and five seconds; moderate for the precise travelling damage geometry. |
| Fear and lava | Bellowing Roar has a 1.5-second cast and a three-second fear; floor activation is part of its spell effects. Explain and, for the warrior lesson, model fear prevention. Berserker Rage provides ten seconds of immunity on a 30-second cooldown and requires Berserker Stance in Classic; Fear Ward prevents the next fear. Recovering after an unprevented fear is a fallback, not the complete tank technique. | High for spell effects. |
| Phase 2 tank duties | A marked pickup point is a rehearsal landmark, not the tank's only task throughout the air phase. Tanks may handle whelps and prepare for landing. Do not claim everyone must camp one fixed spot, or that a five-second pickup deadline is a Blizzard mechanic. | High that these are coaching choices, not encounter rules. |

The old tutorial also suppresses Fireballs and whelps while saying they are happening. Running the normal scheduler addresses this. Its single knockback lesson triggers only Knock Away despite claiming to demonstrate both spells; coaching should react to the actual cast it observes.

## Evidence

- [Blizzard hotfix archive, November 8, 2019](https://news.blizzard.com/en-us/article/23164374/hotfixes-january-7-2020): explicitly fixes failure to clear the primary Fireball target's threat. This supersedes early-2019 advice about using a second player to absorb the threat wipe. The page title reflects its final update, not the date of this hotfix.
- [LibThreatClassic2 Onyxia module](https://raw.githubusercontent.com/dfherr/LibThreatClassic2/master/NPCModules/Onyxia/Onyxia.lua): the original live-game threat estimator handles Fireball by zeroing the target's threat and Knock Away by multiplying it by 0.75. It has no landing reset handler. That absence supports preserving threat, but is not alone proof of every server detail. [Its warrior module](https://raw.githubusercontent.com/dfherr/LibThreatClassic2/master/ClassModules/Classic/Warrior.lua) distinguishes additive Sunder/Revenge/Heroic Strike threat from Taunt's threat matching.
- [BigWigs Classic Onyxia module](https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/Onyxia_Classic/Onyxia.lua): explicitly distinguishes the five-second Classic Era Deep Breath from the eight-second Wrath version; listens to eight directional breath spell IDs, Fireball casts and phase yells. [DBM's module](https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/VanillaOnyxia/Onyxia.lua) independently tracks these spells and observed variable ground timers. Its fixed first-breath timer is explicitly restricted to SoD and should not be imported into Era as a guarantee.
- [The Great Onyxia Race, original 2005 participant report](https://www.lurkerlounge.com/forums/thread-6609.html): describes the active pull/turn to the north wall and walking from north to south before liftoff. Use its directly observed movement, not its then-current speculation about breath triggers or patched fear avoidance. The search index returned the report; direct retrieval returned HTTP 409 during this audit.
- [2019 Classic participant discussion](https://eu.forums.blizzard.com/en/wow/t/onyxia-threat-bug-p3/90989): confirms practical taunt immunity and the need to establish threat, while illustrating why conflicting player theories about landing should not be elevated to certainty.
- Client spell data: [Wing Buffet 18500](https://www.wowhead.com/classic/spell=18500/wing-buffet), [Bellowing Roar 18431](https://www.wowhead.com/classic/spell=18431/bellowing-roar), [Berserker Rage 18499](https://www.wowhead.com/classic/spell=18499/berserker-rage), [Fear Ward 6346](https://www.wowhead.com/classic/spell=6346/fear-ward). These establish effects and durations, not exact server scheduling.
- [CMaNGOS Onyxia reconstruction](https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/kalimdor/onyxias_lair/boss_onyxia.cpp): corroborates separate ground approach, liftoff and directional flight states. Its header marks incomplete implementation and some coordinates were verified in Wrath. Treat it as a reconstruction, not Blizzard source or proof of exact Era distances/odds.

## Remaining limits

This audit does not establish exact cone angles, aggro radius, flight speed, damage-front width, raid DPS, whelp wave counts or every timing distribution from live Era logs. The old research note's recommendation to combine Fireball wipes with a landing reset is superseded above. Synthetic health/DPS, combined abilities, automated raid members and painted guidance remain simulation choices; say so plainly rather than describe the result as an exact recreation. Tutorial/full-fight parity is testable; parity alone does not prove live-game accuracy.

## Implemented corrections

The corrective patch makes the tutorial observation-only and runs it against the
same scenario options as Full fight. A regression replays identical commands
through both modes for three seeds, comparing all simulation state and emitted
events through victory. Skipping only advances guidance; phase transitions
replace stale lessons.

Both modes now use additive threat, independent Fireball threat wipes, surviving
landing threat, a ground approach before liftoff, and positioned directional
Deep Breath sweeps. Threat is tracked for individual automated raid members.
The raid holds damage during pickups; this represents cooperative raid play,
not a boss-imposed DPS lock. Ranged attacks remain available in flight.

Berserker Rage can prevent or break fear, with its ten-second effect and
thirty-second cooldown. The practice button combines the stance switch;
separate stance/rage management and priest-controlled Fear Ward are not modelled.
Pickup scoring rewards starting threat generation, and the repositioning clock
starts after gaining control, rather than requiring an impossible instant taunt.

The test suite covers the reported walk-through pull, large threat deficits,
primary-target versus splash threat wipes, landing retention, ground movement,
Deep Breath positioning/traversal/cast conflicts, fear prevention/expiry/break,
raid-victim Knock Away, ranged air attacks and waiting at the entrance.
