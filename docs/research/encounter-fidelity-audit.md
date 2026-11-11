# All-raid encounter fidelity audit

Reviewed 2026-11-11. Baseline: `9b2fef4`. **All 62 encounters across all seven raids were inspected against their current code, encounter data and cited sources. This is not a finding that all 62 faithfully reproduce the real fights.** Onyxia is the only encounter with a tutorial; its tutorial runs the same encounter engine and options as normal practice.

## Coverage and evidence

| Raid | Reviewed | Detailed evidence |
| --- | ---: | --- |
| Onyxia’s Lair | 1/1 | [Onyxia tutorial and fight](onyxia/tutorial-fidelity.md) |
| Molten Core | 10/10 | [MC/BWL audit](molten-core-and-bwl-fidelity.md) |
| Blackwing Lair | 8/8 | [MC/BWL audit](molten-core-and-bwl-fidelity.md) |
| Zul’Gurub | 13/13 | [ZG/AQ20 audit](zg-and-aq20-fidelity.md) |
| Ruins of Ahn’Qiraj | 6/6 | [ZG/AQ20 audit](zg-and-aq20-fidelity.md) |
| Temple of Ahn’Qiraj | 9/9 | [AQ40/Naxx audit](aq40-and-naxx-fidelity.md) |
| Naxxramas | 15/15 | [AQ40/Naxx audit](aq40-and-naxx-fidelity.md) |

The linked reports distinguish observed implementation, client spell data, original addon event handling, guides and emulator reconstruction. They target level-60 Classic/Era, excluding seasonal and Wrath-only branches. Addon timers are not Blizzard server AI. Missing evidence remains uncertain rather than being filled in from a plausible-sounding guide.

## Corrections made after the baseline

These are implemented in this change and covered by executable regressions where noted. The individual reports intentionally preserve the pre-fix baseline so that subsequent corrections can be checked.

- Ground encounters no longer auto-pull while a player reads instructions. Normal encounter phases no longer inject synthetic DPS aggro pulls. Explicit stress drills retain their configured events.
- True Taunt matches the highest threat without the former 60% plus flat bonus. Standard Warrior Taunt has melee range (5 yards), as in [Classic client spell 355](https://www.wowhead.com/classic/spell=355/taunt). The Understudy ability is kept separate.
- The disguised taunts on Razorgore, Vaelastrasz, Broodlord, Nefarian, Viscidus, Huhuran, Hakkar, Gluth, Sapphiron and Kel’Thuzad are additive threat abilities. They cannot match an arbitrarily large deficit or force aggro. The NPC tank also has to earn threat. Taunt-immunity claims for several bosses remain guide-supported rather than independently confirmed by primary logs; see the detailed reports.
- Geddon, Golemagg, Vaelastrasz and Nefarian can follow their target while grounded. Frontal attacks are no longer disabled merely because a boss has turned toward the raid. Their other mechanics are not thereby certified.
- Lucifron’s Impending Doom deals its damage at expiry; dispelling it in time prevents the hit. Garr’s Magma Shackles actually slows player movement. Spell evidence is cited in the [MC audit](molten-core-and-bwl-fidelity.md).
- Magmadar’s Frenzy is an eight-second boss buff with 150% increased melee speed. Tranquilizing Shot removes that buff without an interruptible cast; subsequent Frenzy-dependent breaths stop. The button has a 20-second cooldown, and its dedicated single-hunter drill uses a longer interval. A normal run still lacks a second hunter to cover every cooldown. See [Frenzy client data](https://www.wowhead.com/classic/spell=19451/frenzy) and the original aura/dispel module linked in the MC audit.
- A Son of Hakkar creates Poison Cloud at its actual death location. There is no independent timer cloud and no protection from merely standing at the former marker. This fixes the cloud dependency; Siphon’s boss-healing/damage reversal is still missing. [Evidence](zg-and-aq20-fidelity.md#hakkar).
- Gluth’s Decimate changes existing zombies to 5% health and sends those same entities toward the current boss position. They persist until killed or consumed. Contact heals 5% boss HP and extends the estimated damage clock. NPC raid damage helps kill weakened zombies after Decimate; it is explicitly estimated, not an automatic despawn. Zombie attacks, CC and the multi-tank swap remain incomplete. [Evidence](aq40-and-naxx-fidelity.md).
- Sapphiron’s Frost Aura no longer damages an iceblocked player, matching [Blizzard’s clarification, post 73](https://us.forums.blizzard.com/en/wow/t/dont-nerf-sapphiron/709636?page=4).
- Every encounter now exposes a concrete limitation note. The menu says “Practice fight” and describes its scripted run, rather than implying complete real-fight coverage. Saved mode keys are unchanged.

## What still prevents full fidelity

Boss HP mostly follows estimated raid damage over time. Player attacks do not directly damage the boss. Multi-boss encounters still use a single main actor; adds generally lack their own spells and melee damage. Objective deaths, crowd control, mana, spell-school effects, real line of sight and raid-wide health are incomplete. A player death is a scored mistake with recovery, not a raid wipe. These are gameplay differences, not just approximate numbers.

The highest-impact unfinished work is encounter actors with independent HP/threat/casts, event-gated phases and explicit interactions: Razorgore’s eggs, Thekal’s simultaneous deaths, Buru’s eggs, Moam’s mana, Ossirian’s crystals, Viscidus’s freeze/shatter/globs, Twin Emperors’ linked health and immunities, C’Thun’s stomach, and Naxxramas mind-control/sacrifice/Shackle mechanics. The detailed reports include bounded next corrections for every boss.

## Per-boss remaining limits

All rows are **reviewed, partial**. This table is generated from the same explicit limitation text shown in the encounter menu, not inferred from passing tests.

| Raid | Boss | Remaining limitation |
| --- | --- | --- |
| Onyxia's Lair | Onyxia | Warrior attacks and the Berserker Rage stance change are combined into practice buttons. |
| Molten Core | Lucifron | The Protectors do not have their own attacks or mind-control behaviour. Dispel targeting and curse resource costs are simplified. |
| Molten Core | Magmadar | Fear Ward and Tremor Totem are not simulated. The normal fight has no second hunter to cover your Tranquilizing Shot cooldown. |
| Molten Core | Gehennas | The guards do not cast from their own positions. Curse coverage and the guards’ stuns are simplified. |
| Molten Core | Garr | Firesworn deaths do not trigger their own explosions or stack Garr’s Frenzy. Banish is not available. |
| Molten Core | Baron Geddon | Inferno lands as one hit rather than escalating pulses. Living Bomb has no knock-up or fall damage. |
| Molten Core | Shazzrah | Counterspell does not lock a spell school. Line of sight and the raid’s dispel assignments are simplified. |
| Molten Core | Sulfuron Harbinger | Priest heals are not tied to individual living adds or their positions. Interrupting does not require reaching the casting Priest. |
| Molten Core | Golemagg | Core Rager recovery and death conditions are missing. The scripted tank swap does not reproduce the real fight. |
| Molten Core | Majordomo Executus | The add kill order does not control the remaining Healers’ immunity or Executus’s surrender. |
| Molten Core | Ragnaros | Killing all Sons does not bring Ragnaros back early. Submerge cycles and threat changes need further verification. |
| Blackwing Lair | Razorgore the Untamed | There is no Orb control or egg-destruction objective. The first phase ends on a timer. |
| Blackwing Lair | Vaelastrasz the Corrupt | Burning Adrenaline does not drain maximum health and kill its target. Tank succession is scripted. |
| Blackwing Lair | Broodlord Lashlayer | Threat-loss recovery is modelled, but exact Knock Away targeting and the Suppression Room pull remain simplified. |
| Blackwing Lair | Firemaw | Pillar cover uses marked safe areas instead of real line of sight. The off-tank’s Wing Buffet rotation is simplified. |
| Blackwing Lair | Ebonroc | Shadow of Ebonroc does not heal the boss. The tank swap does not yet enforce leaving the afflicted tank out. |
| Blackwing Lair | Flamegor | Tranquilizing Shot removes a substitute effect on the tank. Frenzy does not change the boss’s actual swing speed. |
| Blackwing Lair | Chromaggus | Time Lapse does not correctly stun and halve the tank’s health. Breath selection and affliction combinations are scripted. |
| Blackwing Lair | Nefarian | Drakonid kills do not trigger the landing. Class calls and the resurrection of dead adds are simplified. |
| Zul'Gurub | High Priestess Jeklik | Bat movement and add abilities are simplified. Healing casts do not restore boss health. |
| Zul'Gurub | High Priest Venoxis | The snake transformation follows the damage timer. Holy Wrath chains and mana use are simplified. |
| Zul'Gurub | High Priestess Mar'li | Spider form and its threat reset are scripted. Spider growth and independent add attacks are missing. |
| Zul'Gurub | High Priest Thekal | The three enemies do not have separate health bars or resurrection rules. A timed window replaces synchronising their deaths. |
| Zul'Gurub | High Priestess Arlokk | Vanish and reappearance are scripted. Panther marking and Gouge do not reproduce the full target-selection rules. |
| Zul'Gurub | Bloodlord Mandokir | Threatening Gaze does not check every action the real fight watches. Player deaths do not level up Mandokir. |
| Zul'Gurub | Gahz'ranka | Geyser target selection and threat loss are simplified. The pool does not reproduce swimming and fall damage. |
| Zul'Gurub | Gri'lek | Avatar does not enforce a real random-player fixate. Threat and movement changes are scripted. |
| Zul'Gurub | Hazza'rah | Illusions do not have their own lethal melee attacks. Sleep and its removal are simplified. |
| Zul'Gurub | Renataki | Vanish and Ambush do not use the real visibility and target-selection rules. |
| Zul'Gurub | Wushoolay | Lightning Cloud and Chain Lightning use simplified targeting. The chain does not jump between nearby players. |
| Zul'Gurub | Jin'do the Hexxer | Healing Wards do not heal the boss. Shades are visible to everyone, and killing a totem does not end its mind control. |
| Zul'Gurub | Hakkar | Blood Siphon checks your poison but does not reverse healing into boss damage. Mind control and off-tank succession are simplified. |
| Ruins of Ahn'Qiraj | Kurinnaxx | Tank swaps are scripted rather than driven by separate tanks’ threat and Mortal Wound stacks. |
| Ruins of Ahn'Qiraj | General Rajaxx | Wave leaders share one boss entity. Killing the waves does not determine when the next wave arrives. |
| Ruins of Ahn'Qiraj | Moam | Moam has no mana resource. The Mana Drain button does not control his mana or trigger his phase change. |
| Ruins of Ahn'Qiraj | Buru the Gorger | Egg damage does not control the fight. Egg explosions, armour loss and fixates are scripted rather than caused by your actions. |
| Ruins of Ahn'Qiraj | Ayamiss the Hunter | Sacrifice does not create a rescue objective tied to a larva reaching the altar. Air-phase targeting is simplified. |
| Ruins of Ahn'Qiraj | Ossirian the Unscarred | There are no usable crystals. Weakness and Strength do not depend on activating one near Ossirian. |
| Temple of Ahn'Qiraj | The Prophet Skeram | Illusions do not have independent boss abilities. Splits and teleports follow a script. |
| Temple of Ahn'Qiraj | Bug Trio | The three bosses share one encounter track. Kill order does not select their death effects or the remaining abilities. |
| Temple of Ahn'Qiraj | Battleguard Sartura | Whirlwind targeting and taunt immunity are not modelled accurately. Tank recovery follows scripted target switches. |
| Temple of Ahn'Qiraj | Fankriss the Unyielding | Entangle does not create a separate tunnel encounter. Tank swaps and Spawn enrages are simplified. |
| Temple of Ahn'Qiraj | Viscidus | Frost hits do not freeze him and melee hits do not shatter him. Glob kills do not determine his remaining health. |
| Temple of Ahn'Qiraj | Princess Huhuran | Poison Bolt Volley does not choose the nearest 15 players. Tank swaps and Frenzy removal are simplified. |
| Temple of Ahn'Qiraj | Twin Emperors | There is one boss entity. The two Emperors’ damage immunities, shared health and proximity healing are missing. |
| Temple of Ahn'Qiraj | Ouro | Sand Blast targeting and threat loss are simplified. Burrow movement and the melee-range check need further work. |
| Temple of Ahn'Qiraj | C'Thun | The stomach and Flesh Tentacles are not separate objectives. Killing them does not trigger the weakened phase. |
| Naxxramas | Anub'Rekhan | Locust Swarm does not apply its full silence and stacking rules. Crypt Guard abilities are simplified. |
| Naxxramas | Grand Widow Faerlina | Widow’s Embrace is a substitute dispel. There is no Worshipper mind control, sacrifice or Nature-school lockout. |
| Naxxramas | Maexxna | Web Wrap does not create a destroyable cocoon on the wall. Raid-wide Web Spray control is simplified. |
| Naxxramas | Noth the Plaguebringer | Balcony waves and Cripple are simplified. Skeletons do not have independent abilities. |
| Naxxramas | Heigan the Unclean | The dance uses marked floor hazards. The teleport groups and Plague Cloud range are simplified. |
| Naxxramas | Loatheb | There is no real healing lockout or healing rotation. Spore deaths do not apply their buff to the nearest players. |
| Naxxramas | Instructor Razuvious | There is no Understudy mind control or Shield Wall. The tank button does not put you in control of an Understudy. |
| Naxxramas | Gothik the Harvester | The living and dead sides are not separate linked encounters. Killing a living add does not create its undead counterpart. |
| Naxxramas | The Four Horsemen | The four Horsemen are represented by one boss. Marks and tank rotations do not come from four independent positions. |
| Naxxramas | Patchwerk | Hateful Strike does not select a target using the real threat, range and current-health rules. |
| Naxxramas | Grobbulus | Injection’s cloud does not appear at its actual removal location. Cloud growth and movement are simplified. |
| Naxxramas | Gluth | Tank swaps and Frenzy still use substitute effects. Zombie attacks, slows and crowd control are not fully simulated. |
| Naxxramas | Thaddius | Stalagg and Feugen do not have separate health or resurrection rules. Charge assignments follow a fixed sequence. |
| Naxxramas | Sapphiron | Ice blocks use scripted positions and cover areas. Blizzard does not move or slow players. |
| Naxxramas | Kel'Thuzad | Chains does not reproduce mind control and tank succession. Shackle Undead does not actually control a Guardian. |

## Validation

See [validation results](encounter-fidelity-validation.md). Passing software tests establish the tested code behaviour; they do not certify all Classic mechanics. The broad bot validator also reports unresolved scoring and survival failures rather than hiding them by reducing damage or awarding easier grades.
