# Encounter fidelity validation — 2026-11-11

This records checks of the all-raid fidelity correction, after baseline `9b2fef4`.
It does not certify that the encounters reproduce Classic server behaviour.

- `npm test`: **255 passed, 0 failed**, including the production build.
- `tests/raid-fidelity.test.js`: 16 regressions covering idle pulls, invented threat events, additive threat, Taunt threat/range, delayed Doom damage, dispelled snares, existing-zombie Decimate and consumption, persistent boss healing, Son death clouds, Siphon poison checks, iceblock protection, Frenzy removal/expiry and review coverage for all 62 data files.
- Existing tutorial tests compare Onyxia tutorial and normal practice through the full encounter under identical inputs across three seeds. No tutorial-specific boss passivity or phase forcing is introduced.
- `node tools/validate.mjs`: traversed **62 encounters and 285 role combinations**, with three seeded practice runs per role, matching drills, and sampled live/replay rendering. It completed with **12 failing role checks** and **26 low-decision-gap warnings**. No schema error or runtime exception was reported. This command **does not pass**.
- Idle comparisons now begin after a real pull. Standing at the entrance without starting combat is no longer incorrectly counted as a perfect idle run.
- Browser check: the local Onyxia journal displays “Practice fight”, the tutorial uses the same encounter, and “Differences from the real fight” expands to readable coverage text. Authentication gating remains in place.
- `git diff --check`: clean.

## Unresolved bot checks

The validator requires victory within its window, a score of at least 70, and zero player/tank deaths across its three seeds. The following runs violate one or more of those requirements. These results have not been hidden by lowering thresholds, disabling actual boss damage, or adding guaranteed taunts. Some failures involve the scripted guide/bot and scoring as well as encounter mechanics; their exact cause still needs work.

```text
✖ molten-core/magmadar tank    full victory  69-87 C  idle 61  fixes: Lava Breaths on the raid (10 in Magmadar) | Stay out of the Lava Bomb patch
✖ molten-core/baron-geddon tank    full victory  81-96 B  idle 70  deaths 1  fixes: Carry the Living Bomb out of the raid (4 in Baron Geddon) | Get 20 yd out before the pulse (1 in Baron Geddon)
✖ blackwing-lair/vaelastrasz tank    full victory  19-25 F  idle 9  fixes: His head stays on the west wall (60.3s in The Burn) | Flame Breaths on the raid (9 in The Burn) | Step in the moment the old tank dies (3 times)
✖ blackwing-lair/broodlord-lashlayer tank    full victory  35-53 F  idle 32  fixes: Take him back after Knock Away (5 times) | Stay backed into the corner (7 in Broodlord) | Take him back when he turns (2 missed)
✖ zul-gurub/jindo tank    full victory  55-58 D  idle 42  fixes: Taunt when Jin'do turns on the raid (9 missed) | Taunt him back after Hex (5 times) | Taunt him back after Hex (4 times)
✖ zul-gurub/hakkar tank    full victory  37-40 F  idle 48  fixes: Taunt when Hakkar turns on the raid (6 missed) | Taunt him back after Cause Insanity (3 times) | Taunt him back after Cause Insanity (3 times)
✖ ruins-of-ahnqiraj/buru melee   full victory  96-97 S  idle 49  deaths 1  fixes: Never pull aggro off the tank (1 in Egg 1) | If Buru fixes on you, take him away from the group (1 in Egg 2: lap 1/4) | Seconds standing in something bad (1.0s in Egg 2: lap 1/4)
✖ ruins-of-ahnqiraj/ossirian tank    full victory  83-86 B  idle 47  deaths 1  fixes: Seconds standing in something bad (7.0s in Crystal 1: hold) | Deaths (1 in Crystal 1: hold) | Taunt when Ossirian turns on the raid (2 missed)
✖ temple-of-ahnqiraj/huhuran melee   full victory  100-100 S  idle 33  deaths 5  fixes: 
✖ temple-of-ahnqiraj/huhuran ranged  full victory  90-95 A  idle 14  deaths 4  fixes: Tranq the Frenzy | Tranquilizing Shot (1 missed)
✖ temple-of-ahnqiraj/huhuran healer  full victory  47-76 D  idle 1  deaths 3  fixes: Keep the tank alive (1 in Still soaking) | Heal the tank when they drop low (3 missed) | Keep the tank above half (12.4s in Soak and swap)
✖ naxxramas/four-horsemen ranged  full victory  67-67 C  idle 29  fixes: Never pull aggro off the tank (2 in Mograine)
```

## Interpretation

All 62 source-and-code audits are complete. The behavioural corrections have
regression coverage. **The broader encounter suite is not fully green and the
remaining major interactions are not implemented.** Use the per-boss limits in
[the audit index](encounter-fidelity-audit.md) and its detailed source reports,
not high grades or this test count, to decide what a practice run teaches.
