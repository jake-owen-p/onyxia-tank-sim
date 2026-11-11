# Raid Rehearsal copy style

Reviewed 11 November 2026. Scope: landing page, menus, account screens, instructions and feedback. These are editorial recommendations for this app, based on the first-party guides below. They are not rules for detecting AI-written text.

## Voice

Write like a patient raid leader explaining the next pull: direct, specific and familiar with the game. A player should know what to do, what happened and what their account saves. Avoid motivational slogans, exaggerated promises and forced jokes. This adapts Mailchimp's preference for plain language and appropriate tone, and GOV.UK's advice to speak directly to the reader. [Mailchimp: Voice and tone](https://styleguide.mailchimp.com/voice-and-tone/), [GOV.UK: Use the right tone](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/right-tone/)

## Editing rules

1. **Answer the player's question.** Each passage should help someone choose a raid, understand a control, try a mechanic or recover from a problem. Delete copy with no job beyond filling space. [GOV.UK: Meet user needs](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/meet-user-needs/)
2. **Name the action or feature.** Replace vague claims about confidence, improvement or important moments with positioning, threat, timing, tutorials, drills, scores or replays. GOV.UK recommends explaining the actual activity behind vague language. [GOV.UK: Use clear language](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/)
3. **Use the player's vocabulary.** Keep useful game terms such as tank, healer, DPS, pull and threat. Explain an unfamiliar mechanic where the player needs it. Avoid infrastructure terms such as hydration or persistence in the interface. This applies GOV.UK's distinction between useful specialist terms and unnecessary jargon. [GOV.UK: Use clear language](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/)
4. **Make labels predict the result.** Prefer “Choose a boss”, “Start tutorial”, “Try again”, “Sign in” and “Clear run history” over decorative or ambiguous labels. Use sentence case. Keep the same name for the same action throughout the app. [GOV.UK Design System: Button](https://design-system.service.gov.uk/components/button/), [Microsoft: Writing style](https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style)
5. **Write for a glance.** Put the instruction first. Keep one main idea per sentence. Read longer passages aloud and use ordinary contractions where they sound natural. Remove repeated introductions and unnecessary adjectives. [Microsoft: Top 10 tips](https://learn.microsoft.com/en-us/style-guide/top-10-tips-style-voice)
6. **Fit the tone to the moment.** A landing page can be relaxed; an error needs a calm explanation. Avoid jokes in login failures, save failures and destructive confirmations. Do not force gamer slang to sound friendly. [Mailchimp: Voice and tone](https://styleguide.mailchimp.com/voice-and-tone/)
7. **Give useful feedback.** State what went wrong and the next step. Say whether a run is saved locally or to the account only when the code can establish that. Do not blame the player or show raw backend errors. [Microsoft: Writing style](https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style)
8. **Describe real behavior.** State account requirements, saved data and unavailable features plainly. Do not imply a simulation guarantees raid performance. The recommendation follows the guides' emphasis on specific, useful content and avoiding over-promises. [GOV.UK: Meet user needs](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/meet-user-needs/), [Mailchimp: Voice and tone](https://styleguide.mailchimp.com/voice-and-tone/)

## Examples from the landing page

These are original edit suggestions for the text reviewed in `src/ui/landing.js`, not quotations from the guides. Use only claims supported by the app.

| Before | Suggested edit |
| --- | --- |
| Build confidence one pull at a time. | Try each fight as a tank, healer or DPS. |
| A better way to prepare | How to practice |
| Practice the moments that matter. | Pick a boss and try the fight |
| Make the next pull better | Review your run |
| The encounter collection | Choose a raid |
| Ready to rehearse | Choose a boss |
| Your next personal best awaits. | Your saved runs |
| Your practice. Your progress. | Save your runs |

Review the rewritten screens in context: labels must still fit, controls must do what they say, and shortened instructions must retain the mechanic's conditions and timing.

## Encounter copy audit

The encounter JSON is the primary source for this section. I inspected repeated strings across all seven raids and sampled role descriptions, drills and tutorial text. Counts below are exact matching string occurrences at review time, including copies in phases and cues. These are proposed copy edits, not mechanic changes.

### Recurring fixes

| Issue and occurrences | Representative file and JSON path | Suggested wording |
| --- | --- | --- |
| “until the tank is clear again” leaves the safe state unclear (227) | [Gehennas](../../data/encounters/molten-core/gehennas.json), `phases[0].expectations[6].tip` | “Stop attacking while the threat bar is red. Resume when it leaves the red band.” |
| “A heal on a full tank is a heal you did not have for the spike” is an awkward metaphor (61) | [Gehennas](../../data/encounters/molten-core/gehennas.json), `continuousMetrics.overheals.tip` | “Avoid healing the tank at full health. Save the heal for incoming damage.” |
| “Under half with a spike coming is where tanks die” adds drama to an urgent cue (48) | [Gehennas](../../data/encounters/molten-core/gehennas.json), `cues.list[1].tip` | “The tank is below half health and a big hit is coming. Heal now.” |
| “Every global you can safely use, use” is awkward and assumes knowledge of global cooldowns (43) | [Kurinnaxx](../../data/encounters/ruins-of-ahnqiraj/kurinnaxx.json), `continuousMetrics.dpsIdle.tip` | “Keep attacking when it's safe. Stop if the threat bar turns red or the boss leaves the tank.” |
| “Nothing on the ground is worth a global” obscures the hazard (41) | [Kurinnaxx](../../data/encounters/ruins-of-ahnqiraj/kurinnaxx.json), `continuousMetrics.playerInHazard.tip` | “Move out of the ground effect before attacking again.” Specify the local hazard where possible. |
| “Attacks on the boss while a priority add lived” reads unnaturally (33) | [Gehennas](../../data/encounters/molten-core/gehennas.json), `continuousMetrics.attacksOffPriority.label` | “Boss attacks while a priority add was alive” |
| “Every second it is on the raid someone is dying” overstates a cue (33) | [Moam](../../data/encounters/ruins-of-ahnqiraj/moam.json), `cues.list[0].tip` | “Taunt as soon as the boss turns toward the raid.” Check boss-specific taunt exceptions before applying. |
| Repeated drill opening “Already on him/her” lacks a clear subject | [Nefarian](../../data/encounters/blackwing-lair/nefarian.json), `drills[0].description` | “Start in melee range. Bellowing Roar comes every 14 seconds, with Shadow Flame between casts. Regain control after each fear.” |

### Individual corrections worth prioritising

- [Onyxia](../../data/encounters/onyxia.json), `tutorial.steps[3].text`: the second paragraph starts “your threat burst (1) the moment she turns.” Supply the missing verb: “Use Threat Burst (1) as soon as she turns toward the raid.” The ability name should match the button. `drills[1].description` and `drills[3].description` also begin sentences with lowercase “burst threat”; rewrite these as complete instructions.
- [Heigan](../../data/encounters/naxxramas/heigan.json), `roles.melee.description`: “Decrepit Fever is the healers' problem; you can only stand where you are told” is dismissive and distracts from the task. Keep the safe-section and eruption timing instructions; if the cleanse detail matters here, use “Healers handle Decrepit Fever.”
- [C'Thun](../../data/encounters/temple-of-ahnqiraj/cthun.json), `drills[3].description`: replace “Everything on them” with “Switch to the Eye Tentacles when they spawn.” Retain the existing 22-second interval. `drills[5].description` should name whose health the player is keeping high instead of “the bar”; verify the drill's healing target first.
- [Buru](../../data/encounters/ruins-of-ahnqiraj/buru.json), `roles.tank.description`: split the long paragraph into the kiting route, Dismember/speed rules and simulation-specific control instructions. Retain the counter-clockwise route, 25% speed increase every 9 seconds, 1,248-damage two-second ticks, fixate condition and real-fight Taunt immunity. Shortening must not remove these conditions.
- [Ragnaros](../../data/encounters/molten-core/ragnaros.json), `drills[2].description`: “stay past 25 yd of him” should read “stay more than 25 yards from Ragnaros.” Preserve the existing damage intervals.
- [Ebonroc](../../data/encounters/blackwing-lair/ebonroc.json), `roles.melee.description`: “Wing Buffet halves the tank” is missing “tank's threat.” It currently sounds like a health loss.
- [Loatheb](../../data/encounters/naxxramas/loatheb.json), `drills[0].description`: “There is nothing to press except staying alive and keeping him” confuses an input with an objective. Use “Hold Loatheb in place through Poison Aura and Doom.”
- [Buru](../../data/encounters/ruins-of-ahnqiraj/buru.json), `drills[3].description`: “Heal the kiter on the way down” leaves the timing unclear. The drill schedules both Creeping Plague and Dismember, so use “Creeping Plague stacks every 3 seconds. Keep healing the kiter through Plague and Dismember.”

### Guard against accidental mechanic changes

Onyxia's `drills[1].description` and `drills[4].description` attribute threat reduction to Wing Buffet, while `tutorial.steps[5].text` attributes it to Knock Away. Resolve that inconsistency against the encounter implementation and existing research; do not treat it as a stylistic synonym.

Several encounters explain deliberate simulator substitutions. For example, [Hakkar](../../data/encounters/zul-gurub/hakkar.json), `roles.tank.description`, tells the player to use Taunt here while noting that the real boss is taunt-immune. Keep that distinction. Likewise, do not globally remove instructions to enter ground effects: Hakkar's Poison Cloud is intentional protection. Preserve numbers, timings, target priorities, conditional instructions and spell names when changing prose.
