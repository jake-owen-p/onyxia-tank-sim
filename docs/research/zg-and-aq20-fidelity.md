# Zul'Gurub and Ruins of Ahn'Qiraj: encounter fidelity audit

Audited 2026-11-11 against baseline `9b2fef4`: all 13 Zul'Gurub scripts and all 6 Ruins of Ahn'Qiraj scripts. This is an audit of the behavior actually executed by the encounter JSON and `src/core`, not an endorsement of the historical boss notes or `VERIFICATION.md` recommendations. Subsequent fixes must be recorded separately from this baseline.

**Result: all 19 were checked; none is verified as a complete real-fight simulation.** There are useful positioning, interrupt, dispel, threat and target-switch exercises, but several defining mechanics are represented by unrelated buttons or an unconditional timeline. The most consequential gaps are Thekal's council deaths, Jin'do's target restrictions and totems, Hakkar's poison/Siphon consequences, Buru's eggs and pursuit, Moam's mana, Ayamiss's sacrifice, and Ossirian's crystals.

## Evidence and version boundaries

- The intended game is the level-60 Classic/Era version. SoD-specific Hakkar aspect rotation and other seasonal branches were excluded. Historical pre-rework Zul'Gurub guides, modern retail encounters and WotLK emulators were not used as authority for Classic behavior.
- Primary add-on source was read directly: [BigWigs Classic, revision `822cb00`][bw-root] and [DBM Vanilla, revision `d053cb3`][dbm-root]. These are primary evidence of the developers' combat-event handling and timer observations, not Blizzard server code. An add-on warning does not establish every targeting or damage rule.
- Classic spell records below were retrieved from Wowhead's `/classic/spell=` pages through its text mirror. These are client-data-derived records hosted by a third party. They establish such things as duration, effect type and radius; they do not establish server target selection or cadence. The site now exposes seasonal/Forever navigation, so the audit uses established legacy spell IDs and corroborating Classic add-on events instead of treating all current site content as Era evidence.
- [CMaNGOS Classic revision `480077a`][cm-root] was used only where explicitly described as an **emulator reconstruction**, principally for event dependencies. It is evidence of a proposed implementation, not proof of live Classic behavior. Exact rules that remain supported only by reconstruction are identified below.
- No tests, schema validation, labels, models or presence of the right spell names were used as evidence that an encounter matches the real fight. Room coordinates, training damage scaling and unsupported exact cadences remain estimates.

## Shared engine findings that affect every assessment

The relevant local implementation is [sim.js](../../src/core/sim.js), [entities.js](../../src/core/entities.js), [threat.js](../../src/core/threat.js), [ideal.js](../../src/core/ideal.js), and [expectations.js](../../src/core/expectations.js).

1. **HP and phases are a clock.** `step()` linearly interpolates `state.hp` from phase duration and ends with victory at the final deadline. Boss attacks by the player add threat, metrics and animation timestamps, not boss damage. A successful Great Heal has no boss-healing operation. Council kills, egg explosions, Siphon reversal, health thresholds and boss death therefore cannot currently be consequences of player damage.
2. **Adds are targets and paths, not combatants.** `spawnAdds()` creates generic entities with fractional HP. `updateWhelps()` automatically removes them by lifetime and automatically drains killable add HP; it moves them to the player, a hold spot, or a raid dot. It has no add melee damage, spellcasting, fixate, mind control, healing, sacrifice arrival, visibility restriction or death-triggered encounter action. The player's attacks can normally accelerate decay, but Buru explicitly sets `addDamage: 0`.
3. **Targets are coarse.** `targetSwitch` sends the boss to the aggregate `raid` target; in tank play it raises aggregate raid threat. In other roles it schedules a ghost taunt. The effect's `duration` does not create a protected fixate or a second independent tank. A debuff named "Fixated on you" does not itself select the player as the boss target.
4. **Dispel, interrupt and crowd control lack important identities.** Dispel removes the first removable aura from a shared list; its configured range is not checked and there is no selected friendly/enemy target. Enemy Renew/Enlarge can consequently be simulated as friendly raid debuffs. `offBoss` interrupts bypass range entirely and still cancel the boss's single cast slot. `forbidAbilities` records a penalty (and optionally damages the player) but continues executing the ability. `stun` is a separate player timestamp, not an aura-bound root/silence/CC system; ghost tanks do not have corresponding CC states. These distinctions matter to each example below.
5. **Damage and survival are training abstractions.** Raid dots have no health pools. Death restores the player/ghost to full HP and increments a metric. `enrage` multiplies melee damage only, not swing speed. Heals target only the ghost tank; there is no raid healing, mana, spell-school lockout or shared off-tank health model.
6. **Spatial approximations should be explicit.** Most AoE reach uses distance from the boss's hitbox edge; zone radii use their center. `safeSpots` are unconditional circles of safety, not actual line of sight. A boss-specific safe location cannot substitute for a required aura, threat rank or crystal activation without changing the mechanic.

Bounded shared work: introduce encounter actors with HP and actions; aura owner/source identity and removal hooks; event-gated transitions; target overrides that preserve threat; and interactable/death events. These can coexist with deliberate training pacing. Do not rename Dispel or Interrupt to imply that these systems already exist.

Small deterministic runtime probes were also run directly against this baseline, with manual scheduling and frozen HP to isolate effects. They confirmed: Jeklik's completed Great Heal leaves HP at `0.3` while incrementing `greatHealsLanded`; one Buru egg attack removes exactly passive lifetime decay and zero attack damage; Moam's active Counterspell still permits the renamed Dispel to remove `manaSurge` while scoring a violation; a Jin'do healing ward alive for ten seconds leaves boss HP unchanged. Hakkar cloud creation and Buru speed reset can also be triggered with no Son/egg present. These probes demonstrate the identified implementation behavior; they do not validate a live encounter.

## Zul'Gurub — 13 of 13

### High Priestess Jeklik

[Current script](../../data/encounters/zul-gurub/jeklik.json).

**Verified useful behavior:** the bat/troll split exists; troll form exposes a four-second Great Heal and interruptible Mind Flay/Curse of Blood, matching the interruption jobs and cast events in [BigWigs Jeklik][bw-jeklik]. Fire creates real floor zones; bats are kill-priority targets; Shadow Word: Pain is dispellable. The revised Heal cadence and three interruptible abilities are present, so the old verification report's claim that these fixes are missing is stale.

**Major gaps:** completed Great Heal never heals her; Mind Flay deals nothing during its three-second cast and applies its entire damaging aura only after completion. Liquid Fire has `active: 20` but lacks `tick`, so staying in it produces one hit per zone rather than repeated burning. Sonic Burst is damage-only, despite the silence component in the [Classic spell record][sp-sonic]. Bats cannot damage their holders, and fixed time controls the form change.

**Bounded correction:** add boss heal resolution; separate channel ticks from completion; use a ticking fire zone; add a spell-only silence. Keep the existing cast windows and movement geometry while making a missed interrupt or continued fire exposure change combat state.

### High Priest Venoxis

[Current script](../../data/encounters/zul-gurub/venoxis.json).

**Verified useful behavior:** interruptible Holy Fire, its dispellable follow-up DoT, a snake-form threat wipe, poison cleanses and ten-second clouds under the boss are executable. [BigWigs Venoxis][bw-venoxis] identifies the 50% transform, hostile Renew on Venoxis/cobras, Poison Cloud, Parasitic Serpent and 20% Enrage. Existing healer/ranged snake positions were revised after the earlier report.

**Major gaps:** `renew` is an inert magic debuff on `raid`, removed by the ordinary friendly Dispel; it never heals an enemy. Holy Wrath is flat room-wide damage with no bounce or proximity escalation. The four cobras appear sequentially as timed generic adds, so there is no four-add opening control problem. Parasitic Serpent is a generic scheduled pack rather than an aura-dependent event. The final Frenzy increases damage taken by the tank instead of changing Venoxis's attack behavior.

**Bounded correction:** give Venoxis/cobras hostile buffs and health, require an offensive purge target for Renew, and implement Holy Wrath's chain targeting before advertising a spreading exercise. Spawn the opening cobras together with explicit control/kill assignments. Keep the actual cloud movement drill.

### High Priestess Mar'li

[Current script](../../data/encounters/zul-gurub/marli.json).

**Verified useful behavior:** spider spawns, Poison Volley exposure, a seven-second removable Drain Life effect, thirty-second Corrosive Poison and repeated form changes exist. These aura durations and dispel events are corroborated by [DBM Marli][dbm-marli]; [BigWigs Marli][bw-marli] also registers the egg, drain and volley events.

**Major gaps:** Enveloping Webs applies an eight-second stun only to the melee role; the tank is teleported to a preset swap position, the boss is teleported to another preset, and a threat wipe substitutes for the web/charge/tank handoff. The [Classic Webs record][sp-webs] contains root, attack-speed suppression and silence; these are not a generic full stun, and neither target selection nor a second tank is represented. Drain Life does not heal Mar'li. `enlarge` is another zero-effect friendly raid debuff: dispelling it does not reduce the spider's size or damage. Spiders automatically die and never grow or attack.

**Bounded correction:** model web root and silence separately on affected nearby actors, select the charge recipient, and let the free tank establish control. Add draining heal ticks and a hostile spider growth aura. Treat the current Enlarge dispel warning as provisional: DBM itself includes a TODO questioning that warning.

### High Priest Thekal

[Current script](../../data/encounters/zul-gurub/thekal.json).

**Verified useful behavior:** named Lor'Khan/Zath targets, an interrupt cue for Lor'Khan's Great Heal, healing reduction from Mortal Cleave, tiger guardians, Force Punch knockback and a tiger-form pickup exist. [BigWigs Thekal][bw-thekal] confirms separate council actors, Lor'Khan heal/Bloodlust and Zath Blind/Gouge; [DBM Thekal][dbm-thekal] observes the first death and starts a simultaneous-kill timer.

**Critical gap:** the defining three-death condition does not exist. After 150 seconds the script spawns new ten-second "finish" copies of both zealots, then enters tiger form regardless of who died or when. No resurrection can occur. Great Heal only increments a metric, uses `offBoss`, and can be interrupted from anywhere; killing Lor'Khan does not stop future heal casts. Zath's Blind/Gouge and Lor'Khan's Bloodlust are missing. The main council boss still cannot receive attack-driven damage.

**Bounded correction:** create three persistent HP-bearing council actors, per-caster abilities, a downed state and a resurrection deadline. Enter tiger form only after all three are down in the window. Leave the exact window configurable until the DBM fifteen-second bar versus older ten-second reconstruction is resolved; changing a timer alone cannot fix this encounter.

### High Priestess Arlokk

[Current script](../../data/encounters/zul-gurub/arlokk.json).

**Verified useful behavior:** Gouge now couples the target switch and three-second player stun; dispellable Pain, untargetable vanish phases, panther targets, reappearance teleport/threat reset and a melee Whirlwind retreat are executable. [BigWigs Arlokk][bw-arlokk] tracks Gouge, Mark and Pain; [DBM Arlokk][dbm-arlokk] supplies observed vanish timing. The previous 34/50-second timeline and coupled-Gouge fixes are present.

**Major gap:** Mark does not make any panther pursue its recipient. It is a harmless twenty-second aura that directs the player to `gongWall`; standing there can even prevent its initial application because it uses `safeSpots`. Panthers still follow the generic pickup/hold paths and cannot harm the marked player. Trickle adds auto-die after eighteen seconds despite instructions to save them for vanish. Ravage's text promises a stun, but its action contains only damage.

**Bounded correction:** bind Mark to panther targets, preserve panthers until killed/capped, and give them attacks. Remove the wall's aura-immunity shortcut; make movement useful because it changes pursuit. Apply Ravage's CC explicitly. The [Classic Mark record][sp-mark] establishes a recurring trigger aura, not a safe-location check.

### Bloodlord Mandokir

[Current script](../../data/encounters/zul-gurub/mandokir.json).

**Verified useful behavior:** Threatening Gaze now punishes ability presses during a six-second window; Whirlwind has an actual retreat radius; Mortal Strike reduces healing; Ohgan is a kill-priority target. [BigWigs Mandokir][bw-mandokir] observes Gaze, Mortal Strike and Enrage. This is a material improvement over the earlier no-consequence Gaze implementation.

**Major gaps:** Ohgan's death does not cause Enrage: the ninety-second enrage phase starts at fixed time even if Ohgan died earlier. `levelUp` is likewise a scheduled buff rather than a death-count consequence. `gazeOnTank` is an independently scheduled reflecting shield, so it damages DPS for attacking even though the fiction describes threat restraint during a watched tank. The watched-action gate fires before cooldown/range checks, so an unsuccessful press is treated like a threat-producing action. Spirits/resurrection are absent.

**Bounded correction:** trigger Enrage from Ohgan's actual death and Level Up from player deaths; use the actual watched actor and successful threat events, with no invented reflection. [CMaNGOS Mandokir][cm-mandokir], explicitly a reconstruction, implements these causal relationships and checks increased threat for Gaze; use Classic logs to settle exact thresholds rather than certify its numbers.

### Gahz'ranka

[Current script](../../data/encounters/zul-gurub/gahzranka.json).

**Verified useful behavior:** the frontal Frost Breath has a real two-second cast and cone; Slam physically pushes the player; Massive Geyser is now a targeted floor zone rather than the old boss-centered radius. The Frost Breath cast and Geyser cast events are registered by [BigWigs Gahzranka][bw-gahzranka].

**Major gap:** the Geyser zone does damage only. It cannot launch the victim vertically, produce falling consequences, or condition threat loss on being hit. A separate `geyserThreatDrop` always switches the boss to the raid after two seconds, including when the chosen target avoids the zone or the tank is nowhere near it. The new yellow warning ring is a rehearsal affordance, not verified evidence of an in-game telegraph.

**Bounded correction:** attach displacement and the selected threat consequence to the actual Geyser hit; retain the readable warning as an explicitly optional training aid. Do not equate the two-second scheduled target switch with verified threat mechanics. Exact Geyser threat scope and safe-water geometry need a Classic combat/video reference before a precise claim.

### Jin'do the Hexxer

[Current script](../../data/encounters/zul-gurub/jindo.json).

**Verified useful behavior:** Delusions applies a curse and creates one Shade; healing wards and brain-wash totems are attackable priority targets; Hex can be dispelled by the healer's magic-only button. [BigWigs Jin'do][bw-jindo] independently identifies those objects plus Banish/teleport. The [Delusions spell record][sp-delusions] explicitly grants invisibility detection, which establishes that this is more than ordinary damage.

**Critical gaps:** everybody can attack every Shade without Delusions. The healer is prohibited from removing curses by role configuration, so preserving Delusions is never a decision. A healing ward never heals Jin'do. Brain Wash causes a fixed fear on a random target, and killing its associated totem does not release that target. `killFirst` picks the nearest add rather than enforcing the advertised Shade/Ward/Totem priority. Banish, pit relocation and skeleton escape are absent.

**Bounded correction:** gate Shade visibility/attack eligibility by Delusions; create hostile ward healing; associate each totem with its controlled actor and remove control on totem death. Add pit teleport plus skeletons. Introduce explicit priority ranks without preventing players from choosing a strategically different target. The existing correct names do not currently reproduce the fight's target-selection decisions.

### Hakkar

[Current script](../../data/encounters/zul-gurub/hakkar.json).

**Verified useful behavior:** players really acquire Poisonous Blood by entering an active cloud and retain it after leaving; Siphon checks for that aura. Sons alternate stair spawns. Insanity has a ten-second loss-of-control approximation with approximately twenty-one-second recurrence; [DBM Hakkar][dbm-hakkar] and [BigWigs Hakkar][bw-hakkar] corroborate the Insanity/Siphon cadence and duration.

**Critical gaps:** cloud spawning is fixed at 77.5 seconds, unrelated to a Son's death or location. `safeSpots: [cloudSpot]` can pass the Siphon check without poison. Neither poisoned nor unpoisoned Siphon changes Hakkar's HP. The [Classic Siphon heal/damage records][sp-siphon-heal] and [poisoned variant][sp-siphon-poison], together with the explicitly reconstructed [CMaNGOS aura-dependent selector][cm-hakkar], show the missing reversal. Insanity is stun plus raid-target switch, without a hostile controlled tank, crowd control, or independent tank threat ranks. The last ninety-second phase contains no Siphon at all. Corrupted Blood is a delayed carried bomb, not an actual splash/DoT model.

**Bounded correction:** spawn the cloud on Son death at its death position, require the aura alone, and resolve Siphon healing/damage against mutable boss HP. Keep Siphon recurring through the final phase. Represent charmed-tank hostility and threat continuity separately. Taunt immunity is asserted by existing notes and secondary guides but was not independently established by the primary add-on/spell records used here; it must not be marked primary-verified on that basis.

### Gri'lek

[Current script](../../data/encounters/zul-gurub/grilek.json).

**Verified useful behavior:** Avatar now has a real fifteen-second temporary damage buff, a threat wipe, retreat guidance and penalties for tank abilities; Tremor stuns nearby players; Entangling Roots can be dispelled. [DBM Edge of Madness][dbm-edge] provides the fifteen-second kite warning, while the [Classic Avatar data][sp-avatar] establishes damage amplification and reduced movement speed.

**Major gaps:** Avatar does not change movement speed at all: `boss.speed` is five throughout. The action named `avatarFixate` is merely an inert random debuff. In non-tank roles the ghost can taunt him back, while the melee drill invites brief AoE dodges rather than sustained escape from the empowered pursuer. Roots use a two-second stun followed by an otherwise unrestricted ten-second damaging aura, so after two seconds a rooted player can run and while stunned cannot cast a spell that a root should permit. The [Classic Roots record][sp-roots] identifies a ten-second removable root, not a stun. Exact post-1.10 fixate versus threat-driven pursuit remains unresolved by the fetched primary evidence.

**Bounded correction:** use a timed boss speed multiplier and actor-bound root that permits casting and ends on dispel; prevent the ghost from invalidating the Avatar exercise. Resolve the version-specific target rule from Classic footage/logs before choosing fixate or threat reset behavior.

### Hazza'rah

[Current script](../../data/encounters/zul-gurub/hazzarah.json).

**Verified useful behavior:** three kill-priority illusions appear, Earth Shock damages the tank, and non-tank players experience six seconds of sleep-like lost control. [BigWigs Edge of Madness][bw-edge] observes Nightmare Illusions; [DBM Edge of Madness][dbm-edge] observes Sleep and Chain Burn, with a six-second Sleep timer. The [Classic Sleep][sp-sleep] and [Chain Burn][sp-chainburn] records corroborate the corresponding effect types.

**Critical gaps:** Chain Burn and mana control are absent entirely. Illusions cannot attack or pursue a selected victim and vanish after nine seconds if ignored, eliminating the dangerous add race. `addDamage: 0.4` requires three attacks against an untouched illusion rather than the script's own one-hit instructions. Sleep excludes the tank by role, and damage does not wake a sleeping player. Earth Shock cannot interrupt or lock a school.

**Bounded correction:** make illusions low-health attacking actors with a victim, add mana/burn and a real school lockout, and use break-on-damage Sleep on eligible targets. Avoid asserting an exact Illusion hit value from the sources here: add-on source verifies summons, not their damage tuning, and DBM's Edge module explicitly requests further log review.

### Renataki

[Current script](../../data/encounters/zul-gurub/renataki.json).

**Verified useful behavior:** Gouge incapacitates nearby players, Vanish makes the boss untargetable, reappearance physically relocates him, and Thousand Blades damages the player/ghost. [BigWigs Edge of Madness][bw-edge] and [DBM Edge of Madness][dbm-edge] register Vanish. [CMaNGOS Renataki][cm-renataki], a reconstruction, maintains a selected vanish victim and follows through with a teleport attack.

**Major gaps:** reappearance teleports to the aggregate raid anchor while `ambushHit` independently chooses a random victim. Position and victim can therefore disagree. Vanish is a fixed twelve-second submerged phase; there is no stealth/detection/early reveal interaction. Ambush applied to the generic raid target never damages a real raider. The final Gouge is followed by the Enrage phase rather than a Vanish, despite its tooltip promising that sequence. The automatic phase clock fixes the number of vanishes and the enrage start.

**Bounded correction:** choose and retain one Ambush victim, teleport relative to that actor and damage that same actor. Link Gouge/Vanish/reappearance through events. Add a reveal interaction only after confirming the live Classic break conditions; neither the add-on event nor the reconstruction alone proves every AoE/DoT interaction.

### Wushoolay

[Current script](../../data/encounters/zul-gurub/wushoolay.json).

**Verified useful behavior:** lightning clouds are fifteen-second ticking zones and require movement; Forked Lightning is a frontal cone; Chain Lightning is exposed as a 1.5-second interruptible cast. [BigWigs Edge of Madness][bw-edge] registers Lightning Cloud; [DBM Edge of Madness][dbm-edge] provides its fifteen-second active timer. The [Classic Chain Lightning record][sp-chainlightning] corroborates its cast time.

**Major gaps:** Chain Lightning is implemented with the very same frontal cone as Forked Lightning: there is no chain, inter-player distance check or increasing jump damage despite the action text promising those effects. Thus spreading near another target changes nothing. Lightning Wave is a delayed single-tick debuff, and no mana depletion or spell-cost behavior exists. The precise chain versus frontal target rule is not established merely by the flattened spell page or the Edge add-on, so it should remain an open source question rather than a certified spreading lesson.

**Bounded correction:** preserve the useful frontal and cloud drills; confirm target flags/Classic casts for Chain Lightning, then implement a separate chain resolver if supported. Stop advertising jump avoidance until positioning between targets actually affects damage. Mana-drain strategy requires the shared resource model.

## Ruins of Ahn'Qiraj — 6 of 6

### Kurinnaxx

[Current script](../../data/encounters/ruins-of-ahnqiraj/kurinnaxx.json).

**Verified useful behavior:** Mortal Wound stacks reduce healing and expire after fifteen seconds; the script schedules a tank rest window; Sand Traps have a four-and-a-half-second warning and damaging radius; Frenzy begins at the nominal 30% transition. [BigWigs Kurinnaxx][bw-kurinnaxx] and [DBM Kurinnaxx][dbm-kurinnaxx] support stacking Mortal Wound, fifteen-second target bars, eight-second traps and the Frenzy threshold.

**Major gaps:** the boss is permanently `stationary: true` with `turnRate: 0`, removing tank repositioning and facing decisions. The supposed other tank is the aggregate raid target. The swap happens on a timer rather than actual current stacks; the rest aura only penalizes presses, so it does not stop the player taunting early. Mortal Wound's `onPlayer` gate is not a melee-range test and refuses applications during a taunt-forced interval. Sand Trap silence affects only the healer role and still allows spells to execute. No trap hit-chance penalty exists.

**Bounded correction:** allow boss movement/facing, give both tanks independent auras/threat, and make swap decisions depend on stacks. Apply Wound to the actual melee victim. Resolve trap silence/hit reduction on every eligible affected actor, with spell prevention rather than a scoring-only label.

### General Rajaxx

[Current script](../../data/encounters/ruins-of-ahnqiraj/general-rajaxx.json).

**Verified useful behavior:** seven differently named waves precede Rajaxx; each wave has six generic adds plus the boss stand-in. Lightning Cloud is a persistent avoidable zone, Shockwave has stun/damage, Sweeping Slam is a cone, and Thundercrash physically pushes and resets threat. [BigWigs Rajaxx][bw-rajaxx] distinguishes the seven officer deaths, Attack Order, hostile Enlarge, Thundercrash and 30% Frenzy.

**Critical gaps:** every wave lasts forty seconds irrespective of its deaths, while the same boss actor impersonates all officers. Attack Order is a carried explosion marker, not orders causing the wave to attack its named victim. Enlarge is a friendly tank debuff, not a purgeable hostile officer buff. Disarm deducts threat rather than restricting weapon attacks. Thundercrash is flat `3500`, although the core now supports `currentHpFraction`; no boss health/death consequences are tied to these effects. Andorov and his allies cannot be protected, healed or lost.

**Bounded correction:** gate wave progression on its actor deaths, bind Attack Order to living wave attackers, and put Enlarge on the officer. Implement the verified Thundercrash health rule once a live Classic source is captured; the historical half-current-health recommendation should not be called reverified by a spell record whose damage value is script-driven. Preserve the knockback and cone work already present.

### Moam

[Current script](../../data/encounters/ruins-of-ahnqiraj/moam.json).

**Verified useful behavior:** a ninety-second active period leads to a non-attacking stone phase with three priority Mana Fiends; Trample and Eruption damage/knockback are implemented. [DBM Moam][dbm-moam] and [BigWigs Moam][bw-moam] track Energize after ninety seconds; BigWigs explicitly comments that full mana can end it. [Classic Drain Mana][sp-drainmana], [Energize][sp-energize], and [Arcane Eruption][sp-eruption] establish real resource drain/regeneration and a mana-costing eruption.

**Critical gap:** Moam has no mana. "Mana Burn / Viper Sting" is the ordinary Dispel button removing a magic debuff from the player. `manaDrain` is a zero-damage hazard under ranged players, applying the marker through zone contact instead of draining a resource; in other roles it is never created. Eruption merely checks whether that debuff exists at a scheduled time. Stone lasts exactly sixty seconds, independent of mana or fiend deaths; fiend spells keep firing even after their adds die. Counterspell penalizes casting without blocking it. Eruption has no forty-five-yard radius despite its tip.

**Bounded correction:** add a visible boss mana pool, genuine targeted drain abilities and full-mana Eruption; model Energize generation and a state-driven exit. Tie fiend spells to living fiends and provide Banish/control. Until then this is a renamed debuff-cleanse exercise, not mana-management practice.

### Buru the Gorger

[Current script](../../data/encounters/ruins-of-ahnqiraj/buru.json).

**Verified useful behavior:** boss speed genuinely ramps and resets; Dismember is melee-range-gated; players can follow a lap/egg route and avoid egg burst zones; transformation raises speed and adds stacking Plague. [BigWigs Buru][bw-buru] explicitly describes pursuit that ignores other attackers' threat and the 20% transition. [CMaNGOS Buru][cm-buru], a reconstruction, connects egg death, explosion, boss damage and the new target/speed cycle.

**Critical gap:** egg attacks have `addDamage: 0`; egg HP falls exclusively by time. Egg burst, hatchling creation, speed reset and next phase all occur on predetermined schedules regardless of egg death or Buru's proximity. Boss HP keeps falling even if he never crosses an egg. `fixateYou` is a zero-damage carried hazard, so a ranged player can be told Buru is chasing them while he still follows the ghost tank. Taunt is used to grant the player's scripted pursuit despite the genuine ignore-threat rule.

**Bounded correction:** make eggs damageable; fire explosion and hatch on actual egg death; damage/reset Buru only when the explosion hits; choose a real pursuit target and ignore threat during that state. Let 20% mutable HP trigger the final phase. This must precede further lap-timing polish: currently the central player actions cannot change the result.

### Ayamiss the Hunter

[Current script](../../data/encounters/ruins-of-ahnqiraj/ayamiss.json).

**Verified useful behavior:** ranged attacks can target the airborne boss; the 70% landing and 20% Frenzy stages, ten-second Paralyze, swarm pickup and larva priority are represented. [BigWigs Ayamiss][bw-ayamiss] supports those thresholds and the sacrifice duration; [DBM Ayamiss][dbm-ayamiss] independently tracks Paralyze.

**Critical gaps:** Paralyze stuns the player in place; there is no altar teleport, tracked sacrifice victim, or lethal/feed outcome when a larva arrives. Teleport is directly present in the [Classic Paralyze record][sp-paralyze]. Larvae walk to a preset and auto-die. Ground phases also schedule right-side larvae independently from the Paralyze follow-up, so an extra larva need not correspond to any sacrifice. Poison Stinger selects the player randomly and uses a back-row safe spot, not top threat; stopping attacks cannot actually transfer its target. The ghost tank has no airborne threat contest.

**Bounded correction:** link a selected sacrifice actor, altar teleport, larva spawn/path and arrival outcome; killing that larva must prevent the failure. Route Stinger to actual top threat and allow another ranged actor to overtake it. [CMaNGOS Ayamiss][cm-ayamiss], explicitly reconstructed, implements top-threat Stinger and a larva Feed arrival, providing an implementation hypothesis to verify against Classic logs.

### Ossirian the Unscarred

[Current script](../../data/encounters/ruins-of-ahnqiraj/ossirian.json).

**Verified useful behavior:** the revised six-crystal route moves the tank during nominal Weakness windows; War Stomp knocks back; Enveloping Winds stuns the player and switches target; Curse of Tongues is removable; vortex zones deal repeated damage. [BigWigs Ossirian][bw-ossirian] and [DBM Ossirian][dbm-ossirian] identify ten-second Winds and forty-five-second Weakness/Strength timing. [Classic Strength][sp-strength] establishes the physical damage buff.

**Critical gap:** there is no crystal object, activation, range check, Weakness aura, school vulnerability or expiry. `strength` exists but is never scheduled in the normal fight. Staying at the first crystal for the whole encounter cannot restore Strength; only positioning scores change. Vortices are overlapping stationary timed circles, not moving actors, and Harsh Winds has no slow and only a penalty for casting. Curse of Tongues cannot slow casts because player heals/attacks are instant. Winds' "off-tank" is the aggregate raid target.

**Bounded correction:** represent crystals as usable objects, apply Weakness only if the boss is in effect range, remove Strength while Weakness is active, and restore it on actual expiry. Add the school multiplier and independent backup tank. [CMaNGOS Ossirian][cm-ossirian], a reconstruction, shows the crystal-hit/removal/expiry relationship. Keep the current travel route as an introductory exercise, with its fixed crystal order explicitly identified as practice geometry.

## Implementation priorities and limits

1. First restore causality: mutable HP, actor death events, add attacks/casts, selected victims and actor-bound auras. This unlocks most of the critical repairs without bespoke unrelated buttons.
2. Then wire the defining encounters: Thekal council, Jin'do totems/Shades, Hakkar Son/Siphon, Buru eggs, Moam mana, Ayamiss sacrifice and Ossirian crystals. Failure must produce the corresponding combat consequence, not only a score penalty.
3. Then refine interrupts/channels, offensive purge, roots/silences, fixed-wave gates and exact geometry. Preserve useful working drills while distinguishing rehearsal timing from observed timing.

Unsettled details remain unsettled: precise taunt immunity for bosses not established by the fetched primary records; Thekal's exact resurrection deadline; Gri'lek's version-specific Avatar target rule; Wushoolay's complete Chain Lightning target flags; Gahz'ranka's exact Geyser threat scope; Moam's stone damage mitigation/exit variants; and unmeasured room layouts. No full visual playthrough of all roles was performed in this audit. Every JSON action/schedule was inspected and traced through the relevant resolver; targeted probes supplement that inspection rather than replace it.

[bw-root]: https://github.com/BigWigsMods/BigWigs_Classic/tree/822cb00ae37ac9ca4c0decf22d20c1fb50b37670
[dbm-root]: https://github.com/DeadlyBossMods/DBM-Vanilla/tree/d053cb37e5ba5d56af4fae20213dce8aae038a9e
[cm-root]: https://github.com/cmangos/mangos-classic/tree/480077ad7e7d5052f5c773faf83a1716c613f881
[bw-jeklik]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Jeklik.lua
[bw-venoxis]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Venoxis.lua
[bw-marli]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Marli.lua
[dbm-marli]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/VanillaZG/Marli.lua
[bw-thekal]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Thekal.lua
[dbm-thekal]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/VanillaZG/Thekal.lua
[bw-arlokk]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Arlokk.lua
[dbm-arlokk]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/VanillaZG/Arlokk.lua
[bw-mandokir]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Mandokir.lua
[cm-mandokir]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_mandokir.cpp
[bw-gahzranka]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Gahzranka.lua
[bw-jindo]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Jindo.lua
[dbm-hakkar]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/VanillaZG/Hakkar.lua
[bw-hakkar]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/Hakkar.lua
[cm-hakkar]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_hakkar.cpp
[bw-edge]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/ZulGurub_Classic/EdgeOfMadness.lua
[dbm-edge]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/VanillaZG/EdgeOfMadness.lua
[cm-renataki]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_renataki.cpp
[bw-kurinnaxx]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ20/Kurinnaxx.lua
[dbm-kurinnaxx]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/AQ20/Kurinnaxx.lua
[bw-rajaxx]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ20/Rajaxx.lua
[bw-moam]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ20/Moam.lua
[dbm-moam]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/AQ20/Moam.lua
[bw-buru]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ20/Buru.lua
[cm-buru]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_buru.cpp
[bw-ayamiss]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ20/Ayamiss.lua
[dbm-ayamiss]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/AQ20/Ayamiss.lua
[cm-ayamiss]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_ayamiss.cpp
[bw-ossirian]: https://github.com/BigWigsMods/BigWigs_Classic/blob/822cb00ae37ac9ca4c0decf22d20c1fb50b37670/AQ20/Ossirian.lua
[dbm-ossirian]: https://github.com/DeadlyBossMods/DBM-Vanilla/blob/d053cb37e5ba5d56af4fae20213dce8aae038a9e/DBM-Raids-Vanilla/AQ20/Ossirian.lua
[cm-ossirian]: https://github.com/cmangos/mangos-classic/blob/480077ad7e7d5052f5c773faf83a1716c613f881/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_ossirian.cpp
[sp-sonic]: https://www.wowhead.com/classic/spell=23918/sonic-burst
[sp-mark]: https://www.wowhead.com/classic/spell=24210/mark-of-arlokk
[sp-delusions]: https://www.wowhead.com/classic/spell=24306/delusions-of-jindo
[sp-siphon-heal]: https://www.wowhead.com/classic/spell=24322/blood-siphon
[sp-siphon-poison]: https://www.wowhead.com/classic/spell=24323/blood-siphon
[sp-avatar]: https://www.wowhead.com/classic/spell=24646/avatar
[sp-sleep]: https://www.wowhead.com/classic/spell=24664/sleep
[sp-chainburn]: https://www.wowhead.com/classic/spell=24684/chain-burn
[sp-chainlightning]: https://www.wowhead.com/classic/spell=24680/chain-lightning
[sp-drainmana]: https://www.wowhead.com/classic/spell=25671/drain-mana
[sp-energize]: https://www.wowhead.com/classic/spell=25685/energize
[sp-eruption]: https://www.wowhead.com/classic/spell=25672/arcane-eruption
[sp-strength]: https://www.wowhead.com/classic/spell=25176/strength-of-ossirian
[sp-webs]: https://www.wowhead.com/classic/spell=24110/enveloping-webs
[sp-roots]: https://www.wowhead.com/classic/spell=24648/entangling-roots
[sp-paralyze]: https://www.wowhead.com/classic/spell=25725/paralyze
