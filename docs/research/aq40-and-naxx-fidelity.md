# AQ40 and Naxxramas: encounter behavior audit

Audit date: 2026-11-11. Baseline: `9b2fef4dcd8deff1c141316c014946b8d9c7006c`, before the concurrent fidelity corrections. Scope: all **9 Temple of Ahn'Qiraj encounters and all 15 Naxxramas encounters**, their JSON, and the behavior executed by `src/core`. This is a current implementation audit, not acceptance of the older boss notes or `VERIFICATION.md` recommendations. Changes made after this baseline need their own verification; a correction elsewhere in this work does not make the other findings disappear.

**Result: all 24 were inspected; none should be described as a verified full simulation of its Classic level-60 fight.** Several offer useful positioning, reaction, dispelling, or healing drills. Their fundamental fight outcomes and many defining interactions are scripted substitutes. Correct spell names, parseable schemas, passing tests, and high bot scores do not establish encounter fidelity.

## Evidence and limits

- Primary software evidence: all relevant modules in [BigWigs Classic, revision 822cb00](https://github.com/BigWigsMods/BigWigs_Classic/tree/822cb00ae37ac9ca4c0decf22d20c1fb50b37670) and [DBM Vanilla, revision d053cb3](https://github.com/DeadlyBossMods/DBM-Vanilla/tree/d053cb37e5ba5d56af4fae20213dce8aae038a9e). These are primary evidence of what the addons track, including observed spell events and timing. They are not Blizzard server implementations or comprehensive proofs of targeting rules. Use `AQ40` and `Naxxramas_Classic` / `VanillaNaxx`; exclude `GetSeason() == 2` / SoD-only spell branches and Wrath behavior.
- Client spell records below are ClassicDB reproductions of client data, useful for aura durations and effects, not authoritative server target selection. Unavailable pages were not treated as verified.
- [CMaNGOS Classic, revision 480077a](https://github.com/cmangos/mangos-classic/tree/480077ad7e7d5052f5c773faf83a1716c613f881) was read as **emulator reconstruction**, explicitly identified where it supplies missing interaction details. It is not official Classic behavior. Exact reconstructed timings and target filters need Classic combat logs before being promoted to exact specifications.
- The Blizzard Sapphiron statement cited below is first-party evidence. Guide-only taunt-immunity claims remain explicitly lower confidence; no boss-mod warning name alone proves tauntability.
- Room dimensions, hitboxes, equipment/resistances, and scaled health/damage were not independently certified. This pass prioritizes whether the player's action causes the right event, target selection, movement, phase change, and consequence.

## Shared engine findings at the baseline

1. **HP and victory are deadlines.** [`sim.js`](../../src/core/sim.js), `enterPhase` and `step`, interpolate `state.hp` from phase duration and declare victory after the final duration. A boss attack press produces threat and a timestamp, not boss HP damage. Thus damage checks, healing the boss, variable-duration phases, failed shatters, and kill-triggered phases cannot work unless separately implemented. Damage deaths reset player/ghost health and increment a metric; they do not wipe the raid.
2. **One boss, one active cast, one healable ghost.** `world.boss` cannot represent simultaneous bosses with independent health/threat/casts. `heal` only heals `world.ghost`; a statement that the button heals Frost Blast victims or the whole raid does not make that happen. `offBoss` casts bypass player range but still use the boss's single cast slot and do not belong to an add.
3. **Adds are generic moving timers.** [`entities.js`](../../src/core/entities.js), `spawnAdds` / `updateWhelps`, give killable adds `hp: 1`, automatic HP decay, and an expiry. They have no independent melee/casts, control state, damage schools, death-triggered effects, or boss-contact consequences. An attack can kill an add sooner, but cannot release its captive, award its buff, trigger a new wave, or unlock a phase.
4. **Several real mechanics are replaced with unrelated buttons.** `dispel` deletes the oldest removable player/ghost/aggregate-raid debuff, without target or range selection. It does not control, kill, or sacrifice an add. `interrupt` cancels the single boss cast. A Taunt relabelled “Build threat” or “Threat burst” remains a real forced-target taunt if its `kind` is still `taunt`.
5. **Geometry often tests an answer spot instead of the mechanic.** `safeSpots` checks distance to fixed coordinates, not line of sight. Carried hazards selected on ghost raiders are skipped; most raid dots have no health/status. `target: all` debuffs apply to the player, not every raid member. `playerAtSpotBy` checks at phase end, not continuous occupancy. Radius-based boss attacks use distance minus the boss radius: their configured radius is not necessarily the same measurement as a spell-data radius.
6. **Silence is not enforced by `forbidAbilities`.** This flag records a penalty/damage, then continues to execute the requested ability. It is appropriate for “acting is a mistake” mechanics, but is not an actual silence or lockout. This matters for Huhuran and any supposed inability to cast.

These observations are from the actual resolver and entity updates, not just comments in encounter notes. The shared abstractions must be exposed to the player until replaced.

### Small behavioral probes

Read-only Node probes called the baseline `createSim` directly with seed 1, ranged role, `start: 'wall'`, no input, and a 1/30-second step. **All 24 ended in `victory`, with zero attack presses**, at their configured duration. This alone would not disprove an automated raid, but together with the HP implementation it confirms that individual performance and required encounter objectives cannot alter the finish. Sapphiron still reported victory after 29 player death metrics; Heigan after 5; Noth after 7. These are implementation observations, not live-game claims.

Two isolated probes with `manual: true, freezeHp: true` confirmed:

- Faerlina: trigger `enrageDeb`, allow its followed `enrageBoss`, then press Dispel. The debuff disappears but `state.enraged` remains true; no Worshipper is required or consumed.
- Kel'Thuzad: trigger `guardian1` and `shackleFade`, then press “Shackle Undead.” Only `shackleFade` disappears. The Guardian has the same entity ID, target, and HP; there is no shackle state.

These probes reproduce the code paths. They are not accuracy certification.

## Temple of Ahn'Qiraj — 9 of 9

### 1. The Prophet Skeram — major interaction gaps

**Implemented:** [`skeram.json`](../../data/encounters/temple-of-ahnqiraj/skeram.json) moves the real boss among platform spots, wipes threat, spawns attackable images, offers interruptible Arcane Explosion, applies a 20-second loss of control, and punishes a tank absent from melee with Earth Shock. The primary [Skeram module][bw-skeram] tracks those abilities, image summons, and teleports.

**Missing/misleading:** The real boss is always the known boss object; images do not reproduce its independent targeting/casting. True Fulfillment is a stun, so there is no hostile controlled raider or crowd-control response. Explosion is a timer, not occupancy-sensitive; Earth Shock checks only one tank's presence. An `offBoss` image explosion is disconnected from which image is alive and can be interrupted without targeting it.

**Bounded correction:** Give real boss/images independent identity, casts, and threat; bind image abilities to the living image entity. Represent a controlled raider as a hostile target with a control-breaking/CC interaction. Until then label this as a platform-pickup and interrupt drill; do not claim it rehearses identifying the real Skeram or controlling charmed raiders.

### 2. Silithid Royalty / Bug Trio — three bosses reduced to a sequence

**Implemented:** [`bug-trio.json`](../../data/encounters/temple-of-ahnqiraj/bug-trio.json) rehearses Kri → Yauj → Vem; frontal cleave, poison cleansing, fear, interrupting a 2-second Great Heal, and leaving the cloud. [BigWigs][bw-trio] independently tracks all three bosses, their deaths, Great Heal/interrupts, Fear, and Toxic Vapors.

**Missing/misleading:** Yauj's landed heal does not heal anything; separation/line of sight cannot prevent cross-healing. The other bugs cannot be independently tanked or killed in another order. Death effects occur at deadlines. Vem's Charge damages/stuns a random player without moving Vem. `vemBerserk` on Vem being last rests on a single old guide claim; the [reconstruction][cm-trio] models Vem's **death** Vengeance and survivors consuming/healing from a death, not that asserted last-survivor enrage.

**Bounded correction:** Remove or explicitly mark the unverified `vemBerserk`. Implement three independent bosses, actual heal/interrupt consequences, death hooks, and a configurable kill order. Even for a fixed Kri-first exercise, a completed Great Heal must change Yauj/the relevant target's HP and death effects must follow actual death.

### 3. Battleguard Sartura — movement during Whirlwind is missing

**Implemented:** [`sartura.json`](../../data/encounters/temple-of-ahnqiraj/sartura.json) has three priority guards, a roughly 15-second chain of damaging Whirlwind pulses, melee move-out guidance, and a 25% enrage. [BigWigs][bw-sartura] tracks the 15-second aura, guard deaths, and 25% warning.

**Missing/misleading:** Whirlwind is five 3-second casts centered on the single boss; target changes primarily occur after the chain. A “threat table empty” toast actually runs `targetSwitch`, which raises aggregate raid threat rather than resetting the table. Guard spins are unrelated ground circles. The [reconstruction][cm-sartura] changes random targets during whirlwind ticks and clears threat at its end: the baseline is especially weak at rehearsing a spinning enemy running through the raid. Exact behavior still warrants Classic-log confirmation.

**Bounded correction:** Model Whirlwind as a timed aura while the boss moves and changes targets; separate its finish threat reset from random fixation. Attach each guard's spin to that guard and stop it on death. Add real stun eligibility outside the aura if stun management is advertised.

### 4. Fankriss the Unyielding — worm deadline has no failure

**Implemented:** [`fankriss.json`](../../data/encounters/temple-of-ahnqiraj/fankriss.json) applies stacking healing reduction, uses tank-rest windows, gives the add tank hatchlings, and prioritizes worms. [BigWigs][bw-fankriss] tracks Mortal Wound stacks, worm summons, and Entangle.

**Missing/misleading:** `wormBerserk` is a no-op transition notice scheduled 20 seconds after spawn; the worm automatically dies on approximately that same lifetime, and cannot enrage or kill anyone. Entangle is an in-place stun/DoT, not a teleport into an alcove with local hatchlings. The stationary boss and scheduled “press nothing” rest window do not implement two tanks exchanging aggro according to stacks. The [reconstruction][cm-fankriss] explicitly teleports a non-current-tank target into one of three alcoves and ties hatchlings to Entangle.

**Bounded correction:** Give each worm a living/dead test and a real berserk deadline; cancel its deadline on death. Teleport the selected victim and spawn the corresponding alcove wave. Introduce a second tank target before claiming a tank-swap rehearsal.

### 5. Viscidus — defining win condition absent

**Implemented:** [`viscidus.json`](../../data/encounters/temple-of-ahnqiraj/viscidus.json) offers poison cleansing, poison-range avoidance, Toxin dodging, a frozen run-in window, moving globs, and reform pickup. [DBM][dbm-viscidus] actually counts frost/melee hits, recognizes freeze/shatter emotes and failed shatters, and starts a 16.5-second rejoin timer.

**Missing/misleading:** Freeze/shatter occur on deadlines, regardless of hit count or attack school. There is no failed-shatter state. Exactly eight globs auto-decay; killing none or all yields the same next phase HP. The [reconstruction][cm-viscidus] ties rejoin to surviving globs and distinguishes deaths from arrivals. The relabelled “Build threat” is still `kind: taunt` in this baseline; taunt immunity is guide-supported but was not independently established by primary evidence in this pass.

**Bounded correction:** Implement frost-hit and frozen-melee counters, a failed-shatter timeout, and glob death/arrival outcomes that determine reform health. Verify exact hit thresholds from Classic logs rather than selecting between inconsistent historical numbers. The intermediate training description must say the freeze/shatter/glob outcome is scripted.

### 6. Princess Huhuran — soak selection and silence are substitutes

**Implemented:** [`huhuran.json`](../../data/encounters/temple-of-ahnqiraj/huhuran.json) applies Acid Spit stacks, Frenzy removal gates poison pulses, and enters a 30% Berserk phase. [DBM][dbm-huhuran] distinguishes Acid Spit, Frenzy, Noxious Poison, Wyvern Sting, and Berserk; [Classic Wyvern Sting][spell-sting] is a 12-second poison sleep.

**Missing/misleading:** A 14-yard radial pulse substitutes for a nearest-soaker target list: it cannot enforce a count or show a distant player becoming eligible when a soaker leaves/dies. Noxious Poison and its silence independently roll targets, and the silence merely penalizes ability presses without blocking them. Tank swaps are timed rest windows. Wyvern Sting is made selectively nondispellable on raiders, removing the real bad-dispel decision; deleting a debuff does not inherently clear `stunnedUntil`.

**Bounded correction:** Select soak victims by distance, track a single Noxious target and nearby recipients, and enforce silence. Attach sleep break/removal effects to that same debuff. Treat claimed taunt immunity as guide-supported pending stronger evidence; a threat button must actually add threat rather than force target.

### 7. Twin Emperors — the second boss is decorative

**Implemented:** [`twin-emperors.json`](../../data/encounters/temple-of-ahnqiraj/twin-emperors.json) rehearses teleport timing, pre-teleport melee movement, Unbalancing Strike, Blizzard, and exploding bugs. [BigWigs][bw-twins] registers **two** bosses and independently tracks Heal Brother, teleport, mutation, explosion, and Blizzard.

**Missing/misleading:** Only Vek'nilash is a real boss; Vek'lor is an untargetable generic add. Ranged attack the physical boss object. There are no school immunities, linked health outcomes, warlock tank, or actual Heal Brother. Teleport moves the player's tank across the room along with the boss, instead of testing the waiting tank's pickup. The [reconstruction][cm-twins] swaps the twins, resets their own threat, and checks their mutual proximity for healing.

**Bounded correction:** Implement two attackable bosses with independent threat/casts, damage-school eligibility, shared HP linkage, and a distance-triggered heal. Swap bosses while tank teams remain where they are. Until then this cannot rehearse the fight's core separation or target-selection rule.

### 8. Ouro — whole-table reset substitutes for hit-target threat loss

**Implemented:** [`ouro.json`](../../data/encounters/temple-of-ahnqiraj/ouro.json) has Sand Blast facing, stun, Sweep knockback, 180-second surface / 30-second submerge segments, scarabs, and a 20% burn. [BigWigs][bw-ouro] tracks those cast/phase events; [Sand Blast client data][spell-sand] supports a 2-second cast and 5-second stun.

**Missing/misleading:** `sandBlastWipe` resets the whole threat table five seconds later whether or not a target was hit; `sandStun` always picks the designated tank. The [reconstruction][cm-ouro] removes threat on **each actual Sand Blast hit target**, leaving other targets' threat. Mounds are static circles, despite text saying they chase. Missing melee can trigger Boulder only in the final phase, without the pre-Berserk emergency-submerge behavior. Ground Rupture's advertised knockback is absent from its `aoe` definition.

**Bounded correction:** Carry Sand Blast's hit set into immediate target-specific stun/threat changes; preserve unaffected off-tank threat. Make mounds moving entities and implement a melee-presence phase trigger. Add the advertised emergence knockback or correct its text.

### 9. C'Thun — stomach success does not unlock vulnerability

**Implemented:** [`cthun.json`](../../data/encounters/temple-of-ahnqiraj/cthun.json) includes spacing penalties, sequential Dark Glare lanes, eye/claw priorities, Acid stacks, and 45-second vulnerability windows. [BigWigs][bw-cthun] tracks Eye death, Flesh Tentacle deaths, Acid on individuals, Glare phases, and the weakened interval.

**Missing/misleading:** The entire encounter enters a 25-second “stomach” phase; the surface boss becomes unavailable for everybody. Individual ingestion, simultaneous surface combat, and escape are absent. Both Flesh Tentacles auto-die, and vulnerability starts even if the player never attacks. Giant Eye Beam persists according to a timer debuff rather than that Eye's life. Glare lanes are discrete fixed directions, not a continuous turn seeded by an actual target. [Reconstruction][cm-cthun] explicitly calls `HandleWeaken` after the second Flesh Tentacle death.

**Bounded correction:** Add individual room membership/ingestion and escape; keep the surface active. Gate the weakened window on both Flesh Tentacle deaths and bind tentacle casts to their entities. Preserve the existing spacing drill but describe it as a spacing drill until these dependencies exist.

## Naxxramas — 15 of 15

### 10. Anub'Rekhan — kiting exists, add/death interactions do not

**Implemented:** [`anubrekhan.json`](../../data/encounters/naxxramas/anubrekhan.json) slows the boss for Locust Swarm, punishes proximity, sends the tank between sides, and provides Impale lanes and Crypt Guard priorities. [BigWigs][bw-anub] tracks Impale, Swarm cast, and its 20-second aura.

**Missing/misleading:** Swarm does not silence the player or stack its real debuff; the ghost tank is exempt from its periodic damage. Impale follows preauthored lanes rather than the boss-to-selected-victim line, with no launch/fall event. Scarab waves are timers tied to named corpse spots, not dead guards/players. Guard Acid Spit is an independent scheduled player debuff, not an attack by a living guard. [Reconstruction][cm-anub] provides separate guard/corpse handling and Swarm behavior.

**Bounded correction:** Attach Swarm's aura to the moving boss, include silence/stacking, and evaluate all relevant tanks. Derive Impale geometry from its selected target. Spawn scarabs from actual corpses; remove guard pressure when the guard dies.

### 11. Grand Widow Faerlina — sacrifice is a fake dispel

**Implemented:** [`faerlina.json`](../../data/encounters/naxxramas/faerlina.json) has follower priorities, Rain of Fire, poison removal, and scheduled enrage pressure. [BigWigs][bw-faerlina] distinguishes Widow's Embrace on Faerlina from her Enrage, records Enrage removal, and restarts timers from those events.

**Missing/misleading:** “Press Dispel to sacrifice a Worshipper” removes a debuff from a tank/raid record. Four displayed Worshippers are never selected, controlled, moved, or consumed. The separate 8-second boss enrage remains after that press. Nature-school suppression is a prescheduled gap even when no Embrace happened. [Reconstruction][cm-faerlina] has an Embrace cast by a controlled add, self-kill of that caster, Enrage removal from Faerlina, and a cooldown effect on her.

**Bounded correction:** Implement a finite set of controllable Worshippers and an explicit Embrace action requiring the controlled add in range. Consume it, remove the boss aura, and reschedule/suppress abilities from that event. Until then call the existing button a reaction cue, not Widow's Embrace or actual sacrifice.

### 12. Maexxna — killing a cocoon does not rescue its victim

**Implemented:** [`maexxna.json`](../../data/encounters/naxxramas/maexxna.json) has Wrap/Spray/add timing, ranged cocoon priority, frontal Poison Shock, a real healing-reduction multiplier, and healer lockout during Spray. [BigWigs][bw-maexxna] tracks the corresponding spells and cadence; [Necrotic Poison client data][spell-necrotic] supports a 90% healing reduction for 30 seconds.

**Missing/misleading:** A Wrap lasts eight seconds independently of its cocoon. Three cocoons auto-decay, no wall teleport occurs, and destroying one cannot release a captive. Wrapped targets still receive Spray. No real raid healing/rescue target exists. The ghost tank is protected by extreme passive healing in non-healer roles, concealing cleansing consequences there. [Reconstruction][cm-maexxna] models web-wrap creatures and trapped-player linkage.

**Bounded correction:** Link each cocoon to one victim; move/stun that victim until its cocoon dies and release immediately on death. Separate Wrap immunity from Spray targeting. Validate the Classic Spray duration using live evidence rather than resolving the historical 8-versus-10-second discrepancy by tooltip alone.

### 13. Noth the Plaguebringer — curse removal works, spread/Cripple do not

**Implemented:** [`noth.json`](../../data/encounters/naxxramas/noth.json) makes missed curse removal conditionally cause Wrath, teleports/wipes threat on Blink, and alternates boss and balcony waves. [BigWigs][bw-noth] tracks curse, 10-second Wrath warning, Cripple, Blink, and separate room/balcony intervals.

**Missing/misleading:** A missed curse creates a generic player DoT, without the curse victim's nearby-target explosion. Cripple is increased damage taken, not the movement/attack impairment that makes Blink pickup difficult. Champion/Guardian abilities are global scripts rather than casts or auras of living adds. Balcony completion remains a deadline regardless of adds. [Reconstruction][cm-noth] separates the Blink/Cripple and wave behavior.

**Bounded correction:** Preserve a curse victim ID, resolve its expiry at that victim's position, and apply Wrath to the affected neighbors. Give Cripple its movement modifier, removable on the actual afflicted tank. Attach add abilities and kill consequences to their entities before claiming wave-management fidelity.

### 14. Heigan the Unclean — useful dance, incomplete Classic fight

**Implemented:** [`heigan.json`](../../data/encounters/naxxramas/heigan.json) makes movement through the 1–2–3–4–3–2 safe-section pattern consequential, with slower ground and faster dance pulses, platform punishment, and disease removal. [DBM][dbm-heigan] supplies roughly 90-second teleport, 45-second dance, and 3-second fast-eruption timers.

**Missing/misleading:** Heigan disappears as `submerged` during the platform phase rather than remaining a real boss there. Circular approximations of trap sections and generous advance telegraphs teach the script's geometry. Mana Burn is a named platform-shelter check rather than range to the moving boss. Fever increases damage taken rather than cutting max HP. The Classic tunnel teleport/return mechanic is omitted; [reconstruction][cm-heigan] includes teleporting up to three players.

**Bounded correction:** Keep Heigan visible/stationary on the platform and give the floor a phase-specific polygon mask. Evaluate Mana Burn against boss distance and add genuine max-health reduction. Add individual tunnel teleport and return movement. Until then explicitly offer a dance rehearsal, with tunnel handling excluded.

### 15. Loatheb — healing lockout approximated; spore reward missing

**Implemented:** [`loatheb.json`](../../data/encounters/naxxramas/loatheb.json) gives the healer a 60-second heal cooldown, accelerating delayed Doom hits, and an assigned spore to kill. The non-SoD [BigWigs branch][bw-loatheb] tracks Corrupted Mind's 60-second healer lockout, individual Fungal Bloom recipients, spores, and the Doom sequence. This is correctly a Classic Corrupted Mind concept, not the SoD Necrotic Aura window.

**Missing/misleading:** Killing the spore grants no Fungal Bloom, does not select nearby recipients, and does not remove their threat generation. [Client data][spell-fungal] explicitly gives the 90-second buff critical bonuses and zero ability threat. The baseline still penalizes ordinary DPS threat throughout. A single heal cooldown cannot cover the shared heal/cure lockout, and passive regeneration substitutes for personal consumable timing.

**Bounded correction:** Add a spore death-radius effect with a recipient cap, persistent buff, and zero-threat behavior; penalize accidental tank receipt. Share the Corrupted Mind lockout across every healing/cleansing ability. Expose optional consumable actions if personal survival is a training objective.

### 16. Instructor Razuvious — controlled Understudy never exists

**Implemented:** [`razuvious.json`](../../data/encounters/naxxramas/razuvious.json) gives caster cover movement, healing spikes, and a 20-second handoff prompt. [BigWigs][bw-razuvious] tracks actual Understudy Mind Control, Taunt, Shield Wall, Mind Exhaustion tracking, and individual Understudy deaths; [Shield Wall client data][spell-wall] confirms a 75% reduction over 20 seconds.

**Missing/misleading:** The player is declared to “be” an Understudy, but only receives an ordinary 3-second player taunt with pre-scaled damage. No priest, charm/channel, controlled body, Shield Wall button, per-Understudy cooldown, exhaustion, release, or broken-control recovery exists. Free Understudies are endlessly regenerated timed waves. Disrupting Shout has an invented 4-second cast and fixed shelter circles; ranged attacks still work from those circles without line-of-sight checks.

**Bounded correction:** Keep four persistent Understudies. Separate the priest from the controlled unit and supply its real Taunt and Shield Wall with per-unit cooldowns, control expiry/break/release, and exhaustion eligibility. Treat Shout's warning as a warning timer, not an interruptible-looking cast. This is a priority architectural correction.

### 17. Gothik the Harvester — live-side kills do not drive undead pressure

**Implemented:** [`gothik.json`](../../data/encounters/naxxramas/gothik.json) has the 270-second Classic wave phase, named live/undead add types, side teleports, threat resets, and an interruptible Drain Life stand-in. [BigWigs][bw-gothik] separates Classic wave counts from SoD, tracks living add deaths, and warns on the 30% gate stage.

**Missing/misleading:** Spectral waves spawn simultaneously with their living counterparts, not from their deaths; kill pace cannot overload the other side. The gate is always traversable, and the same player tank follows the boss through it before opening. Add abilities are independent hazards/debuffs; the “rider” can be dead while its shared cast still occurs. Undead-side damage eligibility and a real two-group raid are absent. [Reconstruction][cm-gothik] links deaths, spectral summons, side selection, and the gate phase.

**Bounded correction:** Spawn spectral counterparts on living-add death and preserve the rider/horse distinction. Gate collision must depend on phase. Keep a tank team on each side, with separate targets and cast owners. State explicitly that the present wave exercise cannot train kill pacing between rooms.

### 18. Four Horsemen — one rotating boss cannot validate four-tank control

**Implemented:** [`four-horsemen.json`](../../data/encounters/naxxramas/four-horsemen.json) includes distinct Mark names, 75-second expiry, rotation deadlines, Meteor stack checks, Holy Wrath spacing, and Void Zones. [BigWigs][bw-horsemen] tracks four Mark spells, the individual bosses, shield-wall targets, deaths, and approximately 12.9-second Mark intervals after the first.

**Missing/misleading:** A single stationary boss teleports through all corners and wipes threat at each stop. Marks/damage are a prescripted three-stack sequence plus a next-corner “overstay” penalty, not independent emitter range and actual stack damage. Shield Wall scores attacks as wrong instead of reducing damage on the affected boss while other bosses remain available. Death spirits, independent kill order/health, and actual tank handoffs do not exist. [Reconstruction][cm-horsemen] supplies independent Horsemen/spirit behavior.

**Bounded correction:** Create four persistent actors and per-actor threat/Mark emitters. Mark damage must read that target's current stacks, and dead Horsemen must leave emitting spirits. Implement Shield Wall as damage reduction. Keep any clockwise route as one strategy option rather than the mechanic itself.

### 19. Patchwerk — Hateful Strike ignores eligibility

**Implemented:** [`patchwerk.json`](../../data/encounters/naxxramas/patchwerk.json) gives a healer repeated Hateful-sized spikes, an off-tank melee-position check, and a 5% Enrage phase; [BigWigs][bw-patchwerk] tracks Enrage and the seven-minute Berserk.

**Missing/misleading:** Hateful Strike chooses a fixed role target regardless of melee reach, HP, or threat rank; stepping out still takes the hit. The melee red threat band is inaccurately described as the exact Hateful eligibility boundary. A DPS clock cannot fail because the scripted kill is always 6:55. The [reconstruction][cm-patchwerk] filters melee candidates among top threat entries and chooses highest current health, demonstrating the missing selection machinery; **its top-four filter is not independent proof of the guide's unconditional “never the main tank” claim**.

**Bounded correction:** Implement multiple tanks with current HP, melee eligibility and threat ordering, then verify the exact Classic candidate/fallback rules using logs. Recompute the target for every Hateful. Let damage output determine whether seven-minute Berserk is reached. Present the current healer seat only as a fixed-target spike-healing drill.

### 20. Grobbulus — the dropped cloud does not follow the player

**Implemented:** [`grobbulus.json`](../../data/encounters/naxxramas/grobbulus.json) makes the boss leave clouds, tracks a carried Injection bomb, scores its raid overlap, tests Slime Spray facing, and prioritizes Fallout Slimes. [BigWigs][bw-grobbulus] tracks Injection application/removal, Poison Cloud, and Slime Spray.

**Missing/misleading:** The Injection cloud always appears at `cloudLineEnd`, independent of where the bomb expired. Spray always creates one slime at a fixed spawn, independent of who was hit. Therefore two major consequences of positioning do not work. The [reconstruction][cm-grobbulus] creates the cloud from the afflicted unit on aura removal and a Fallout Slime per player actually hit. Static-radius clouds also do not model growth.

**Bounded correction:** Persist Injection's selected target/position through expiry and create the cloud there; connect early removal to that same effect if dispelling is offered. Spawn slimes from Spray's actual hit set and allow cloud growth. Verify that moving the carrier changes the eventual dangerous ground.

### 21. Gluth — baseline Decimate players fixed, zombies still wrong

**Implemented:** [`gluth.json`](../../data/encounters/naxxramas/gluth.json) now uses `setHpFraction: 0.05` for player/ghost Decimate, so the old recommendation to replace flat damage is already implemented at this baseline. It also has stacking healing reduction, removable Frenzy, and zombies to intercept. [BigWigs][bw-gluth] tracks those abilities and a roughly 105-second Decimate.

**Missing/misleading at baseline:** `decimatedZombies` spawns **six new full-fraction adds**; existing zombies are neither reduced to 5% nor retargeted. The new adds walk to a static `chargeSpot` and expire, and boss contact cannot heal Gluth. Kiting does not determine later rush size or recovery health. [Reconstruction][cm-gluth] applies Decimate to existing Zombie Chow, directs them toward Gluth, and implements 5% boss healing on consumption. Tank swaps remain a stationary-boss/forbidden-input abstraction.

**Bounded correction:** Transform the same living zombie entities on Decimate, retarget them to the dynamic boss position, and consume them on contact with real HP recovery. The root agent is implementing this correction concurrently; reverify it separately. Afterwards, the remaining gap is genuine zombie control/attacks, linked Infected Wound pressure, and two-tank threat swaps.

### 22. Thaddius — polarity is a location quiz

**Implemented:** [`thaddius.json`](../../data/encounters/naxxramas/thaddius.json) has Magnetic Pull relocation/threat reset, preboss hazards, Polarity Shift casts, positive/negative destinations, and Ball Lightning when the tank is absent. [BigWigs][bw-thaddius] tracks both preboss NPCs' Pulls, Power Surge, and separate positive/negative aura applications and refreshes.

**Missing/misleading:** The two prebosses have no independent HP or synchronized-death requirement. Polarity is a fixed sequence, with damage based on being outside a 15-yard named camp rather than proximity to opposite charges. Same-charge stacking cannot improve damage and crossing near opposite players cannot hurt them. The [reconstruction][cm-thaddius] includes a 10-second preboss revive window and recipient-specific charges/proximity effects. The platform jump is not an outcome-bearing transition.

**Bounded correction:** Give the two prebosses real HP/death times and revive an early kill. Assign charges to actual players from a seeded random draw, retain same-charge outcomes, and resolve both harmful opposite-charge proximity and friendly stacking bonuses. Add jump/fall recovery if the full approach is advertised.

### 23. Sapphiron — cover exercise, not actual iceblock line of sight

**Implemented:** [`sapphiron.json`](../../data/encounters/naxxramas/sapphiron.json) supports ground/air cycles, cleave/tail checks, curse removal, five authored icebolt sites, a seven-second Breath, and an icebolted-player stun/immunity to Breath. [BigWigs][bw-sapphiron] tracks Icebolt, Life Drain, and the Breath cast. Blizzard confirms the Classic two-second Frost Aura behavior and that aura damage on an iceblocked player was a bug to fix. [Blizzard developer replies][blizzard-sapphiron]

**Missing/misleading:** Cover is a set of fixed safe discs, not rays blocked by the actual iceblocked targets. The player can become an additional randomly frozen target independently of the five authored sites, without creating a useful block there. Blizzard's iceblock aura protection is absent: `frostAura` has no `safeIfDebuff`. Life Drain does not heal Sapphiron; Blizzard zones do not move or slow. Taunt immunity is guide-supported, not proven by the fetched primary addon code.

**Bounded correction:** Immediately protect `iceboltYou` from `frostAura`. Select five actual victims, create blockers at their frozen positions, and check Breath line of sight against those blockers. Add curse-to-boss healing and moving/slowing Blizzard. Keep fixed cover sites only as an explicitly authored training option.

### 24. Kel'Thuzad — interrupts/dodges work; MC, rescue and Shackle do not

**Implemented:** [`kelthuzad.json`](../../data/encounters/naxxramas/kelthuzad.json) has phased add priorities, interruptible single Frostbolt, uninterruptible Volley, Fissure dodging, Mana Detonation separation, and five staggered Guardian spawns. Chains' wipe and Frost Blast follow-ups are now linked, avoiding the older independently jittered events. [BigWigs][bw-kt] tracks Chains, Blast, Detonate, Fissure, Mortal Wound and phases.

**Missing/misleading:** Chains excludes the player main tank, stuns a random non-tank for ten seconds, then asks the unaffected tank to regain threat; it cannot control five raiders or have another tank take over. Frost Blast is flat damage with independent victim rolls, while “heal the victims” can heal only the ghost. “Shackle Undead” removes `shackleFade` from the aggregate raid and never touches a Guardian. Soldier explosions are scheduled regardless of contact/kills. [Reconstruction][cm-kt] instead controls the current tank plus four others, scales Blast by victim maximum HP, and observes actual Guardian control.

**Bounded correction:** Make MC a status on specific raiders, including the current tank, and allow another real tank to assume aggro. Give healers targetable Blast victims. Make Shackle an explicit add-target control effect with actual duration/breaks and the encounter's control-count rule. Derive Soldier blasts from contact and Guardian pressure from living, uncontrolled Guardians. These dependencies are prerequisites for a full-fight claim.

## Priority order and review gates

1. **Immediately remove misleading mechanics from the advertised training scope:** Faerlina sacrifice, Razuvious controlled tanking, Kel'Thuzad Shackle/MC, Viscidus freeze/shatter, Twin Emperors separation/immunities, and C'Thun stomach success. Keep useful drills, but describe their limits on the encounter screen.
2. **Implement entity-linked consequences:** source/target identity, add death/contact hooks, status effects on adds and raiders, and boss damage/healing. This unlocks cocoons, spores, worms, Gothik transfer, Gluth consumption, Injection drops, and tentacle gates without inventing unrelated dispels.
3. **Implement multi-actor fights and real threat swaps:** Emperors, Trio, Horsemen, Thaddius prebosses, Razuvious units and the relevant tank teams. Preserve every actor's state instead of teleporting a single boss and clearing its table.
4. **Validate encounter behavior, not just data:** demonstrate both success and failure of each defining mechanic. For example: zero versus sufficient Viscidus frost hits; a live versus dead worm at its enrage deadline; nearby versus distant twins; killed versus ignored Flesh Tentacles; early/late/in-range Embrace; actual Guardian control; different Injection-drop coordinates; Hateful candidate HP/range changes; too-early preboss death; and block-relative Breath line of sight.

### Player-facing limitations, one sentence per encounter

These deliberately describe the remaining scope rather than asserting that merely seeing an ability name makes it functional. Gluth's sentence anticipates the concurrently implemented existing-zombie Decimate correction; recheck that patch before using it.

| Encounter ID | Limitation text |
| --- | --- |
| `skeram` | Platform pickups and interrupts are rehearsed; identifying the real Skeram and controlling mind-controlled raiders are not simulated. |
| `bug-trio` | This follows one scripted kill order; the three bosses do not have independent health, healing, threat, or death effects. |
| `sartura` | Whirlwind avoidance is rehearsed, but the boss and guards do not reproduce their full movement and target changes during spins. |
| `fankriss` | Worms and tank swaps follow a script; ignored worms cannot berserk and Entangle does not teleport you into a tunnel. |
| `viscidus` | Freeze, shatter and reform happen on a timer; your frost hits, melee hits and glob kills do not determine the outcome. |
| `huhuran` | Frenzy removal and positioning are rehearsed; nearest-player soaking, Noxious Poison spread and real tank handoffs are simplified. |
| `twin-emperors` | Only one Emperor is a functional boss; damage immunities, the warlock tank and healing when the twins meet are not simulated. |
| `ouro` | Surface and submerge movement is rehearsed; chasing mounds and Sand Blast's individual threat removal are simplified. |
| `cthun` | Spacing and tentacle priorities are rehearsed; the stomach is a scripted phase and Flesh Tentacle kills do not unlock vulnerability. |
| `anubrekhan` | Kiting and Impale avoidance are rehearsed; Locust silence, corpse scarabs and independent guard attacks are not simulated. |
| `faerlina` | The removal prompt is a reaction exercise; Mind Control, Worshipper positioning and sacrifice are not simulated. |
| `maexxna` | Spray preparation and cocoon targeting are rehearsed; killing a cocoon does not release a linked trapped player. |
| `noth` | Blink pickups and curse removal are rehearsed; curse explosions, Cripple movement and independent add abilities are simplified. |
| `heigan` | This rehearses the dance on an approximate floor; the tunnel teleport and return are not included. |
| `loatheb` | The healing lockout is rehearsed; spore kills do not grant Fungal Bloom and consumable timing is not simulated. |
| `razuvious` | This rehearses handoff timing; controlling an Understudy, using its Shield Wall and recovering from broken Mind Control are not simulated. |
| `gothik` | Waves follow a fixed schedule; living-side kills do not create undead-side pressure and the closed gate does not block movement. |
| `four-horsemen` | This is a rotation drill using one boss; four independent threat tables, deaths and continuing spirit Marks are not simulated. |
| `patchwerk` | This rehearses fixed-target healing spikes; Hateful Strike does not select its victim from actual health, range and threat. |
| `grobbulus` | Injection movement is rehearsed, but its cloud appears at a fixed spot and Slime Spray does not spawn an add for each victim. |
| `gluth` | Zombie handling is simplified; slows, crowd control, infected-wound pressure and two tanks exchanging threat are not fully simulated. |
| `thaddius` | Charge destinations are rehearsed; nearby players' charges, stacking bonuses and synchronized preboss kills do not determine success. |
| `sapphiron` | Breath shelter uses authored safe spots rather than line of sight behind the actual frozen players. |
| `kelthuzad` | Interrupts and ground hazards are rehearsed; mind-control recovery, healing individual Frost Blast victims and Shackling Guardians are not simulated. |

## Sources

Links below are pinned to the revisions inspected, except the spell records and Blizzard thread. BigWigs/DBM links are primary addon source; every `cm-*` link is an emulator reconstruction, not Blizzard code.

[bw-skeram]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ40/Skeram.lua
[bw-trio]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ40/BugFamily.lua
[bw-sartura]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ40/Sartura.lua
[bw-fankriss]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ40/Fankriss.lua
[dbm-viscidus]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/AQ40/Viscidus.lua
[dbm-huhuran]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/AQ40/Huhuran.lua
[bw-twins]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ40/Twins.lua
[bw-ouro]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ40/Ouro.lua
[bw-cthun]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ40/Cthun.lua
[bw-anub]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Anubrekhan.lua
[bw-faerlina]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Faerlina.lua
[bw-maexxna]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Maexxna.lua
[bw-noth]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Noth.lua
[dbm-heigan]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/VanillaNaxx/PlagueQuarter/Heigan.lua
[bw-loatheb]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Loatheb.lua
[bw-razuvious]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Razuvious.lua
[bw-gothik]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Gothik.lua
[bw-horsemen]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Horsemen.lua
[bw-patchwerk]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Patchwerk.lua
[bw-grobbulus]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Grobbulus.lua
[bw-gluth]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Gluth.lua
[bw-thaddius]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Thaddius.lua
[bw-sapphiron]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Sapphiron.lua
[bw-kt]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/Naxxramas_Classic/Kelthuzad.lua
[spell-sting]: https://classicdb.ch/?spell=26180
[spell-sand]: https://classicdb.ch/?spell=26102
[spell-necrotic]: https://classicdb.ch/?spell=28776
[spell-fungal]: https://classicdb.ch/?spell=29232
[spell-wall]: https://classicdb.ch/?spell=29061
[blizzard-sapphiron]: https://us.forums.blizzard.com/en/wow/t/dont-nerf-sapphiron/709636?page=4
[cm-trio]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_bug_trio.cpp
[cm-sartura]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_sartura.cpp
[cm-fankriss]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_fankriss.cpp
[cm-viscidus]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_viscidus.cpp
[cm-twins]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_twinemperors.cpp
[cm-ouro]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_ouro.cpp
[cm-cthun]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/temple_of_ahnqiraj/boss_cthun.cpp
[cm-anub]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_anubrekhan.cpp
[cm-faerlina]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_faerlina.cpp
[cm-maexxna]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_maexxna.cpp
[cm-noth]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_noth.cpp
[cm-heigan]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_heigan.cpp
[cm-gothik]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_gothik.cpp
[cm-horsemen]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_four_horsemen.cpp
[cm-patchwerk]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_patchwerk.cpp
[cm-grobbulus]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_grobbulus.cpp
[cm-gluth]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_gluth.cpp
[cm-thaddius]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_thaddius.cpp
[cm-kt]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/naxxramas/boss_kelthuzad.cpp
