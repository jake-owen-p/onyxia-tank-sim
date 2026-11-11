# Molten Core and Blackwing Lair: behavioral fidelity audit

Checked 2026-11-11. **18/18 encounter scripts inspected; this is not a certification that 18 encounters simulate the real fights.** Baseline: `9b2fef4`. This audit read each encounter JSON, existing per-boss research and `VERIFICATION.md`, then traced actions through `src/core/sim.js`, `entities.js`, `threat.js`, `hazards.js`, and `ideal.js`. Isolated runtime probes exercised actual action resolution rather than just validating JSON. Historical recommendations already implemented are credited below.

Target version: level-60 Classic/Era mechanics. Addon branches explicitly marked Season of Discovery or Season of Mastery were excluded. Primary evidence is original DBM/BigWigs code, the live-Classic threat library, and client spell records mirrored by Wowhead. Addon code is evidence of observed events and developer assumptions, not Blizzard's server implementation; spell records do not prove server targeting or AI. No private-server reconstruction is treated as authoritative. Confidence is high for directly observed implementation differences and supported spell effects; unresolved targeting/threat details are identified explicitly.

## Changes made alongside the audit

The main implementation task reports these corrections in the working tree after the baseline: removal of synthetic full-fight `aggroPull` schedules; replacement of fake “Threat burst” taunts on Razorgore, Vaelastrasz, Broodlord and Nefarian; movement restored for Geddon, Golemagg, Vaelastrasz and Nefarian; frontal spells no longer suppressed when aggro leaves the player's tank; delayed Lucifron Doom damage; Garr's movement snare; and Magmadar Frenzy as a removable boss enrage. Those changes address baseline findings below. This document does **not** claim that they resolve the larger encounter-specific omissions, or independently certify the final working tree.

## Shared implementation limits that materially change the fights

- **Objectives and HP:** phases and boss HP progress on elapsed time. Player attacks build threat but do not deplete boss HP. Add attacks deplete add HP, but generic adds also disappear through configured lifetime/automatic damage. Killing objectives therefore does not drive Razorgore, Majordomo or Nefarian, nor end Ragnaros's submerged phase early. These are consequential omissions, not numerical tuning.
- **Multiple tanks and target identity:** baseline `target: "tank"` chooses the player/ghost by selected role, rather than the actual boss victim. `targetSwitch` increases the aggregated raid's threat; it does not represent a second tank taking the boss. Debuffs can remain on the wrong unit after a swap. Ebonroc, Vaelastrasz and Chromaggus need explicit second-tank state to teach their real transitions.
- **Add casters:** generic adds have no independent casts, buffs or threat. An `offBoss` cast is still held in the boss's single cast slot, and its interrupt bypasses range checks. A dead or absent priest can therefore appear to cast, and a melee interrupt can succeed across the room. Add death does not cancel its scheduled abilities.
- **Control and schools:** mind control is represented by fear; dispelling the debuff does not necessarily end the control timer. There is no general mana/cast-school system. Several curses, mana burns and counterspells consequently have names without their defining consequences. Generic damage multipliers do not distinguish physical from magical damage.
- **Line of sight:** authored circular `safeSpots` can shelter an area spell, but are not full room collision/visibility geometry. They do not consistently block the player's outgoing attacks. Treat these as simplified cover drills until both directions of line of sight are modeled.
- **Threat injection:** baseline full phases scheduled `aggroPull` on Lucifron, Magmadar, Gehennas, Garr, Geddon, Sulfuron, Golemagg, Razorgore, Vaelastrasz and Chromaggus. These arbitrary raid-threat jumps should remain absent from full fights. Optional named recovery drills can deliberately start with bad aggro. Mechanic-driven threat events such as Gate, Knock Away and Wing Buffet must remain.

Relevant implementation: [simulation](../../src/core/sim.js), [entities and adds](../../src/core/entities.js), [threat](../../src/core/threat.js), [hazards](../../src/core/hazards.js).

## Molten Core

### 1. Lucifron — checked; delayed damage fixed, add control incomplete

**Present at baseline:** two Protector adds with kill priority, distinct magic and curse dispels, 10-second Doom duration, periodic Curse and Shadow Shock. Their broad event vocabulary agrees with the [original boss module][bw-lucifron].

**Mismatch:** Doom dealt 200 damage each second, including the first two seconds in the runtime probe. [Impending Doom 19702](https://www.wowhead.com/classic/spell=19702/impending-doom) is a delayed 2,000-damage effect after 10 seconds. The working-tree fix addresses this. Protector Dominate Mind is a random fear-like debuff with no living-caster dependency; dispelling it can leave the fear timer running. Curse has no resource-cost consequence.

**Next bounded correction:** bind Protector casts to living add entities, use charm/control state and remove it on dispel, and describe the resource-cost effect as unsupported until resources exist. High confidence in these implementation gaps; do not claim full Protector behavior from the presence of a dispel button.

### 2. Magmadar — checked; meaningful Tranq fix, further fidelity limits

**Present:** ground fire persists, Panic applies fear, Frenzy recurs, and ranged play has a Tranq response. The [original module][bw-magmadar] listens to Frenzy aura application and dispel, rather than an interruptible cast.

**Mismatch at baseline:** “Tranq” interrupted a synthetic `frenzyWindow`, but the 8-second tank damage multiplier stayed active. A runtime probe reproduced successful interrupt plus an unchanged buff. The current boss-enrage/dispel fix addresses the wrong counter. Fear and Lava Bomb are recognizably represented, but exact damage, fear radius and raid targeting were not independently certified.

**Next bounded correction:** preserve Frenzy as a boss aura with its correct attack-speed consequence; verify that any extra fire attacks actually stop with its removal. Do not turn a dispel into a cast interrupt. High confidence in the original counter mismatch.

### 3. Gehennas — checked; curse and add-stun targeting remain wrong

**Present:** two guards, kill priority, Rain of Fire to leave, curse dispel and a 75% healing penalty. [Original module][bw-gehennas] confirms the main curse/fire event set.

**Mismatch:** baseline Curse affects the role-selected tank for eight seconds. [Curse 19716](https://www.wowhead.com/classic/spell=19716/gehennas-curse) is a 45-yard nearby-enemy curse lasting five minutes. [Fist of Ragnaros 20277](https://www.wowhead.com/classic/spell=20277/fist-of-ragnaros) is a four-second stun within eight yards of its caster, but the implementation selects random raid targets without guard-relative distance. Guard casts are not terminated by guard death.

**Next bounded correction:** apply Curse to units actually in radius; originate Fist from living guards and check proximity. High confidence. The healing penalty is implemented correctly in magnitude but not enough to certify the mechanic.

### 4. Garr — checked; snare fixed, defining add behavior missing

**Present:** Firesworn placeholders, a magic debuff, Antimagic Pulse notice, Eruption and a later enrage. The [original module][bw-garr] separately observes dispels and Magma Shackles. Antimagic is correctly not presented as a removable player debuff.

**Mismatch:** four non-killable add placeholders substitute for the add-management encounter. Eruption is a scheduled four-second cast centered on Garr, independent of an add's death or location. The probe produced 2,000 Eruption damage with no Firesworn alive. [Eruption 19497](https://www.wowhead.com/classic/spell=19497/eruption) is instant, centered on its caster, and includes a knockback. [Magma Shackles 19496](https://www.wowhead.com/classic/spell=19496/magma-shackles) reduces movement 60% for 15 seconds; the baseline had only a debuff icon, now corrected with a snare.

**Next bounded correction:** create the eight Firesworn with control/death state; attach explosion and boss strengthening to appropriate add events. Until then, Eruption should not teach players to dodge an invented Garr cast. Exact death-versus-command explosion sequencing remains to be verified against original footage/logs.

### 5. Baron Geddon — checked; mobile boss restored, Inferno still misleading

**Present:** a carried eight-second Living Bomb with separation scoring, Ignite Mana and Armageddon. The [original module][bw-geddon] observes an eight-second Inferno aura and separate Bomb/Armageddon events.

**Mismatch:** the baseline boss is immobile throughout the encounter; this is being corrected. Inferno currently waits eight seconds before one large hit, allowing players to remain beside Geddon for almost the entire effect without damage. [Inferno 19695](https://www.wowhead.com/classic/spell=19695/inferno) applies periodic damage immediately during an eight-second self-root/pacify aura. Living Bomb lacks the vertical launch. Ignite Mana damages the player without checking whether the unit uses mana. Armageddon cannot be raced by player DPS because boss HP is clock-driven.

**Next bounded correction:** root/pacify only during Inferno and apply its pulses during that interval. Add bomb launch and mana-only applicability separately. High confidence on Inferno behavior; damage scaling and exact pulse progression need separate verification.

### 6. Shazzrah — checked; Gate correction already present

**Present:** Gate teleports the boss to a raid location, wipes threat and follows with Arcane Explosion. This is already implemented and should not be reported as missing. The [live Classic threat library][threat-shazzrah] explicitly clears boss threat on Gate; [DBM][dbm-shazzrah] even gives a taunt warning after Gate.

**Mismatch:** Gate uses one fixed raid anchor, not a selected raid member. Counterspell has no spell-school lockout, Deaden Magic has no meaningful boss damage-reduction state, and Shazzrah's Curse doubles all received damage rather than only the intended magical damage. The [original module][bw-shazzrah] tracks these as distinct events/effects.

**Next bounded correction:** choose a real eligible unit for Gate and resolve the explosion at the boss's resulting position. Implement spell-school consequences before describing Counterspell/Deaden Magic as functional. High confidence in code gaps; exact Gate selection constraints are still unverified. Shazzrah should not receive a speculative blanket taunt immunity.

### 7. Sulfuron Harbinger — checked; priest interaction is only a prompt

**Present:** four priest placeholders, kill priority, an interrupt cue, spear splash and a short Hand knockback/stun. [Original module][bw-sulfuron] registers individual priest deaths, Dark Mending casts and Inspire aura application/removal.

**Mismatch:** Dark Mending is a `transition` action with scoring but no healing, independent of a live priest. The probe could interrupt it from across the room with no priests present. Inspire is absent, and caster positioning does not determine healing. [Dark Mending 19775](https://www.wowhead.com/classic/spell=19775/dark-mending) contains a substantial real heal. Current client data lists a 2.5-second cast while older encounter notes use two seconds; do not silently pick an exact time without reconciling this.

**Next bounded correction:** give each living priest its own cast, legal interrupt range and actual heal recipient. Separate priests to prevent healing must have a measurable outcome. High confidence in missing effects; exact heal reach and cast timing remain open.

### 8. Golemagg — checked; mobile boss restored, fake swap and pet model remain

**Present:** two Rager placeholders, a stacking 30-second Magma Splash debuff, Pyroblast and a final 10% Earthquake section. The [original module][bw-golemagg] confirms Pyroblast and stack-sensitive Magma Splash warnings.

**Mismatch:** the baseline is permanently stationary, now corrected. `magmaSwap` is a timed switch to the aggregated raid rather than a second tank; the afflicted player can immediately reacquire the boss. Magma Splash is a scheduled tank debuff rather than a melee-contact proc, and a general damage multiplier substitutes for armor reduction. [Magma Splash 13880](https://www.wowhead.com/classic/spell=13880/magma-splash) contains periodic fire damage and armor reduction. Ragers merely persist for a configured duration; their health recovery, proximity interaction and dependency on Golemagg's death are absent.

**Next bounded correction:** remove forced timed raid switches; model Splash on the struck/attacking unit and use actual tank threat. Introduce linked Rager state before claiming pet positioning practice. No primary evidence found here establishes a mandatory universal five-stack taunt rotation.

### 9. Majordomo Executus — checked; encounter objective substantially wrong

**Present:** ten-second magic/physical shield windows, coal relocation and a dangerous coal area. The [original module][bw-majordomo] confirms the shield durations and teleport events, and explicitly notes that Executus does not die.

**Mismatch:** the simulation spawns four elites, then four healers, then two new final adds as timed phases. It should track the original eight companions rather than create ten across successive waves. The final `champion` action enrages Executus himself; add state has no enrage. The boss's HP clock reaches zero as victory instead of surrender after companions die. Polymorph/control and independent healing are absent. Teleport wipes everyone's threat; the correct affected threat set needs direct evidence before changing it. The baseline's imported Dark Mending spell is not validated by the Classic branch of the original module: that module's monitored Dark Mending is in the seasonal branch.

**Next bounded correction:** spawn all eight companions at pull, maintain individual deaths/control and end on their defeat. Restrict shields to their intended creatures and attack types. High confidence that timed waves and killing Executus teach the wrong encounter; exact last-add strengthening needs further verification.

### 10. Ragnaros — checked; timed skeleton present, kill condition absent

**Present:** stationary boss, a 180-second surface interval, eight Sons and a maximum 90-second submerged interval. These match the ordinary Classic path in the [original module][bw-ragnaros].

**Mismatch:** killing/removing all eight Sons does not end submerge; the runtime probe remained in phase two. BigWigs explicitly cancels the 90-second timer and calls Emerge after the eighth death. Magma Blast only checks empty melee during scheduled follow-ups, so abandoning melee outside those windows has no corresponding punishment. Wrath is shown as a five-second cast and fabricated raid-target switch; Sons lack their mana-related effect.

**Next bounded correction:** drive early emerge from actual Son deaths and maintain a melee-occupancy check throughout surface phases. Keep stationary behavior for Ragnaros. **Threat uncertainty:** [LibThreatClassic2][threat-ragnaros] wipes the whole raid table on Wrath 20566; other reconstructions use narrower changes. Do not assert an exact victim-only reset from emulator code. The current artificial target switch is not validated by either interpretation.

## Blackwing Lair

### 11. Razorgore — checked; no egg or controller simulation

**Present:** three initial enemies, recurring corner adds, a separate boss phase, Conflagration and a sheltered Fireball Volley. [Original module][bw-razorgore] counts Destroy Egg events and transitions at 30.

**Mismatch:** phase one ends after 240 seconds even with no player actions. There is no egg count, orb, controller or egg-destruction interaction. Conflagration becomes fear and a forced switch to the raid rather than an incapacitated current victim and threat-based next victim. The landing/transition wording refers to a controller entity that does not exist. Baseline fake threat burst is being corrected.

**Next bounded correction:** model 30 eggs and orb possession, preserve add pressure while the controller destroys eggs, then enter phase two from that objective. Until then label the existing phase as an add-survival drill, not full encounter practice. High confidence.

### 12. Vaelastrasz — checked; Burning Adrenaline has no real tank handoff

**Present:** starts at 30% HP, separate caster/tank Adrenaline scheduling, frontal attacks, tail exposure and frequent raid fire. [Original module][bw-vael] distinguishes caster and tank Adrenaline and tracks their target windows.

**Mismatch:** the caster version is a 14-second carried bomb; the tank version lasts 20 seconds with no maximum-health loss or death. The probe left the tank alive at unchanged maximum HP after 21 seconds. A synthetic target switch replaces the dying tank's successor. [Burning Adrenaline 18173](https://www.wowhead.com/classic/spell=18173/burning-adrenaline) reduces maximum HP by 5% each second, greatly boosts damage/casting, and explodes on death. Essence of the Red/resource behavior is not modeled. Blanket stationary and fake threat-taunt are being corrected.

**Next bounded correction:** implement fatal Adrenaline progression, death/explosion, and next eligible tank by threat. A tank that survives unchanged and taunts back trains the wrong response. High confidence; full resource/DPS-race fidelity remains outside the current engine.

### 13. Broodlord Lashlayer — checked; threat cut present, invented reaction window

**Present:** Knock Away removes 50% of its target's threat; the [live Classic threat module][threat-broodlord] independently encodes that amount. Mortal Strike is followed by a five-second healing penalty, consistent with the [original boss module][bw-broodlord].

**Mismatch:** Blast Wave is a three-second avoidable cast. [Blast Wave 23331](https://www.wowhead.com/classic/spell=23331/blast-wave) is instant, includes knockback and a movement slow. Mortal Strike is a cone damaging every unit in front, rather than the victim attack it purports to represent. Baseline fake threat-taunt is being corrected.

**Next bounded correction:** separate an optional timer warning from an actual cast; implement the instant damage/knockback/snare. Resolve Mortal Strike on its actual victim. High confidence on the false Blast Wave cast and existing threat cut.

### 14. Firemaw — checked; useful cover drill, incomplete tank mechanics

**Present:** stacking Flame Buffet, expiration while sheltered, Shadow Flame and a 50% Wing Buffet threat cut. [Original module][bw-firemaw] tracks these events and [live threat code][threat-firemaw] applies the struck unit's 50% reduction. An [original off-tank account](https://www.method.gg/wormie-s-classic-vanilla-firemaw-chromaggus-nefarian-and-joining-curse) describes line-of-sight stack clearing and timed off-tank intervention.

**Mismatch:** the player's Flame Buffet is modeled as an independent periodic-damage debuff; the original account describes repeated hits plus stacking fire vulnerability. Tank and non-tank use different artificial durations/caps. Shelter does not block outgoing attacks. One player and one raid threat pool cannot represent an off-tank taking Wing Buffet while the main tank avoids it. Thrash is a periodic cone rather than additional melee swings. The baseline Shadow Flame suppression on lost aggro is being fixed.

**Next bounded correction:** shared line-of-sight rules, event-driven buffet hits/vulnerability, and explicit off-tank Wing Buffet soaking. High confidence in the missing interactions; exact resistance/damage values remain unverified.

### 15. Ebonroc — checked; Shadow counter teaches the opposite tank action

**Present:** eight-second Shadow of Ebonroc, Wing Buffet with a 50% threat cut, and Shadow Flame. [Original module][bw-ebonroc] tracks the Shadow target; [live threat code][threat-ebonroc] supports Wing Buffet's reduction.

**Mismatch:** Shadow is a zero-effect tank debuff followed by a forced raid switch. The afflicted player can Taunt the boss directly back, as reproduced in the probe. [Shadow 23340](https://www.wowhead.com/classic/spell=23340/shadow-of-ebonroc) heals Ebonroc for 25,000 when its victim suffers melee damage. The implementation neither heals him nor requires a clean tank to take over. Thrash and aggregated-tank limitations match Firemaw.

**Next bounded correction:** bind Shadow to the current victim, heal on applicable melee hits, and transfer the boss to an unafflicted tank until expiry. High confidence: this is a wrong-response problem, not a small numerical difference.

### 16. Flamegor — checked; Tranq actually cancels the fire follow-up

**Present:** Frenzy has a removable enrage type; queued Fire Novas test whether it remains active. Runtime dispel before the follow-up prevented both Novas. This correction is already present at the baseline and should not be reported as missing. The [original module][bw-flamegor] tracks dispellable Frenzy, Wing Buffet and Shadow Flame; [live threat code][threat-flamegor] supports Wing Buffet's reduction.

**Mismatch:** the aura modifies the role-selected tank's damage taken rather than the boss's attack behavior. Its four-second life and reduced representation are not independently verified against the real aura. Thrash is a cone; a second tank is absent. Baseline lost-aggro Shadow Flame suppression is being corrected.

**Next bounded correction:** move Frenzy to boss state while retaining the proven cancel-on-dispel follow-up, then verify its actual haste/fire cadence. High confidence in existing cancellation and shared targeting limits; no claim of exact full-fight timing.

### 17. Chromaggus — checked; Time Lapse and afflictions incomplete

**Present:** a fixed Incinerate/Time Lapse pair, cover prompts, five named afflictions, removable Frenzy and a final 20% enrage. A fixed pair is a valid selected encounter variant if labeled as such; the [original module][bw-chromaggus] supports five possible breath families, not that one mandatory pair.

**Mismatch:** Time Lapse is a five-second cast and the follow-up excludes the tank. The probe left the tank unstunned and at full maximum HP, then forced aggro to the raid without the corresponding per-unit threat behavior. [Time Lapse 23310](https://www.wowhead.com/classic/spell=23310/time-lapse) is a two-second cast with an eight-second stun and 50% maximum-HP reduction. Afflictions have short independent durations, no five-affliction mutation, and no Hourglass Sand interaction; several effects are only labels/general damage modifiers. Elemental vulnerability is not modeled.

**Next bounded correction:** implement Time Lapse exposure per unit, its real control/HP effects, and an off-tank who avoids it. Do not teach a universally safe tank exemption. Expose the selected breath pair and mark the missing variants. High confidence in stun/HP/cast mismatch; exact server threat restoration/reset behavior needs additional direct evidence.

### 18. Nefarian — checked; objective, class calls and resurrection missing

**Present:** two add entrances, a threat reset on phase transition, ground dragon attacks/fear/curse, named class calls and a 20% bone-add phase. [Live threat code][threat-nefarian] supports the phase-two threat reset. [Original module][bw-nefarian] counts individual drakonid deaths before the landing transition and observes distinct class-call spell events.

**Mismatch:** phase one ends after 175 seconds regardless of deaths. Class calls use a fixed cycle, omit druid form lock, and often substitute unrelated effects: priest call is unconditional tank damage, rogue call lacks front teleport/root, and mage call is a short generic stun. Skeletons are freshly spawned generic adds, not the actual drakonid corpses reanimated in their death locations. Baseline stationary dragon, fake threat-taunt and lost-aggro breath suppression are being corrected.

**Next bounded correction:** use a drakonid kill objective and retained corpse locations, then model each class call's actual consequence before claiming class-specific practice. BigWigs uses 41 observed kills plus a short landing delay; avoid presenting a guessed universal kill number without reconciling log/encounter-start accounting. High confidence in missing kill dependency, corpse state and call effects.

## Taunt evidence and uncertainty

For BWL the consistent reported set is: Firemaw/Ebonroc/Flamegor are tauntable; Razorgore/Vaelastrasz/Broodlord/Chromaggus/Nefarian are not. Original evidence is uneven: the [original Firemaw off-tank account](https://www.method.gg/wormie-s-classic-vanilla-firemaw-chromaggus-nefarian-and-joining-curse) describes early taunt immunity as a quickly fixed release bug; an [original 2006 Broodlord discussion](https://www.lurkerlounge.com/forums/thread-3803.html) treats Broodlord as immune. Original participant reports support those two cases more directly than a general list. The broader five-boss immunity list is corroboration from player reports, not a retrieved Blizzard server specification. Do not derive immunity from `RegisterCombatant(..., true)` in threat-library code: that boolean is not evidence of taunt immunity. Nor should a modern guide's “taunt” shorthand override mechanics evidence.

No new blanket Molten Core immunity list is established here. Shazzrah's original DBM Gate warning specifically calls for taunt. Ragnaros search results are easily contaminated by later expansions or seasons; his immunity should not be changed on that basis.

## Probe evidence and acceptance tests

The baseline probes imported the actual `createSim` and encounter JSON, with `seed: 7`, fixed 1/60-second steps and manual/frozen-HP fixtures where required to isolate actions. The Razorgore phase test enabled the normal HP/phase clock. They established: Doom ticked early; Magmadar's interrupted window left its buff; Garr exploded with no adds; priest Kick ignored caster/range; Vael's tank survived Adrenaline unchanged; Chromaggus's tank missed Time Lapse effects; Ebonroc's afflicted tank could immediately regain him; Flamegor dispel successfully prevented Nova; killing all Sons did not cause emerge. These are action-path probes, not evidence that a complete encounter has passed real-fight parity.

Required future checks should assert consequences: live/dead caster and range, current victim identity, objective-driven transition, per-unit threat, control removal, cover blocking both directions, and death-triggered explosions/resurrections. A schema pass, timer snapshot, spell-name match or demonstration completion cannot establish encounter fidelity.

## Pinned original addon sources

BigWigs inspected at `822cb00ae37ac9ca4c0decf22d20c1fb50b37670`; DBM at `d053cb37e5ba5d56af4fae20213dce8aae038a9e`; live Classic threat library at `c39ecd1baf5cf075b380f954899931fdf7575a48`. Client spell pages were checked on the audit date and can expose additional seasonal rows; the ordinary Classic rows were used above.

[bw-lucifron]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Lucifron.lua
[bw-magmadar]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Magmadar.lua
[bw-gehennas]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Gehennas.lua
[bw-garr]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Garr.lua
[bw-geddon]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/BaronGeddon.lua
[bw-shazzrah]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Shazzrah.lua
[bw-sulfuron]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Sulfuron.lua
[bw-golemagg]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Golemagg.lua
[bw-majordomo]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Majordomo.lua
[bw-ragnaros]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/MoltenCore/Ragnaros.lua
[bw-razorgore]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/BlackwingLair/Razorgore.lua
[bw-vael]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/BlackwingLair/Vaelastrasz.lua
[bw-broodlord]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/BlackwingLair/Broodlord.lua
[bw-firemaw]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/BlackwingLair/Firemaw.lua
[bw-ebonroc]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/BlackwingLair/Ebonroc.lua
[bw-flamegor]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/BlackwingLair/Flamegor.lua
[bw-chromaggus]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/BlackwingLair/Chromaggus.lua
[bw-nefarian]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/BlackwingLair/Nefarian.lua
[threat-shazzrah]: https://github.com/dfherr/LibThreatClassic2/blob/c39ecd1baf5cf075b380f954899931fdf7575a48/NPCModules/MoltenCore/Shazzrah.lua
[threat-ragnaros]: https://github.com/dfherr/LibThreatClassic2/blob/c39ecd1baf5cf075b380f954899931fdf7575a48/NPCModules/MoltenCore/Ragnaros.lua
[threat-broodlord]: https://github.com/dfherr/LibThreatClassic2/blob/c39ecd1baf5cf075b380f954899931fdf7575a48/NPCModules/BlackwingLair/BroodlordLashlayer.lua
[threat-firemaw]: https://github.com/dfherr/LibThreatClassic2/blob/c39ecd1baf5cf075b380f954899931fdf7575a48/NPCModules/BlackwingLair/Firemaw.lua
[threat-ebonroc]: https://github.com/dfherr/LibThreatClassic2/blob/c39ecd1baf5cf075b380f954899931fdf7575a48/NPCModules/BlackwingLair/Ebonroc.lua
[threat-flamegor]: https://github.com/dfherr/LibThreatClassic2/blob/c39ecd1baf5cf075b380f954899931fdf7575a48/NPCModules/BlackwingLair/Flamegor.lua
[threat-nefarian]: https://github.com/dfherr/LibThreatClassic2/blob/c39ecd1baf5cf075b380f954899931fdf7575a48/NPCModules/BlackwingLair/Nefarian.lua
[dbm-shazzrah]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/MC/Shazzrah.lua
