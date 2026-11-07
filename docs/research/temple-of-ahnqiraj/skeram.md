# The Prophet Skeram (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/The_Prophet_Skeram — ability list, Arcane Explosion trigger rule (>4 in melee), Earth Shock behaviour, True Fulfillment effects/undispellable, Teleport locations (middle platform, left/right stairs), split thresholds, image HP note, "two tanks per location", MC target = nearest player, trash respawn 30 min, patch history (1.12 aggro change)
- https://www.wowhead.com/classic/npc=15263/the-prophet-skeram (fetched via r.jina.ai) — HP 4,264,000 (labelled "Seasonal 40 Player"), mana 393,000, spell IDs 26192 / 26194 / 785, splits at 75/50/25%
- https://www.wowhead.com/classic/spell=26192/arcane-explosion (via r.jina.ai) — 1 s cast, 30 yd radius, base value 388, Arcane, dispel type Magic
- https://www.wowhead.com/classic/spell=26194/earth-shock (via r.jina.ai) — instant, 100 yd range, base value 654 Nature, interrupts casting for 2 s
- https://www.wowhead.com/classic/spell=785/true-fulfillment (via r.jina.ai) — 0.5 s cast, 45 yd range, 20 s charm, +300% damage done, +300% size, no dispel type
- https://www.wowhead.com/classic/guide/the-prophet-skeram-temple-of-ahnqiraj-strategy (via r.jina.ai) — Blink resets threat, Earth Shock only when nobody melees, Arcane Explosion "1.5k per hit", clone identification by mana / raid marker, positioning (MT lower platform against wall, 3+ tanks), 25% split handling, CoT / Mind-numbing Poison
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — Earth Shock "up to 3,000", Arcane Explosion "5 or more raid members", 2 players per side platform, True Fulfillment 20 s on closest non-tank, raid composition (40 players, ~5 per class, nature resist)
- https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-skeram.amp — vanilla-era positioning (ranged/healers on stair rails, three tank groups, off-tanks hold until first split), timeline
- https://us.millenium.gg/guide/7179.html?page=2 — three melee incl. one tank per lower platform, summon images every 1/4 HP, 300% damage on charmed player
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Skeram.lua — spell IDs (785, 20449/4801/8195 teleport, 26192, 747 Summon Images), 20 s MC bar, "split soon" warnings at <82/57/32%, no fixed timers for teleport/AE/MC
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/Skeram.lua — same IDs, 20 s MC timer, split warning bands 77–81 / 52–56 / 27–31%, Arcane Explosion flagged as interruptible ("kickcast")

## Overview
- Level ?? (boss), Humanoid (Qiraji), mana user. HP 4,264,000 and 393,000 mana per Wowhead Classic (value labelled "Seasonal 40 Player"; no separate Era value shown). No hard enrage known. First boss of the Temple; required (gates the rest of the instance). Fought on a three-platform stair area just inside the entrance: one middle/lower platform and a left and right side platform.
- Phases: single phase with three "splits". At 75%, 50% and 25% he vanishes briefly and three Skerams appear (the real one plus 2 images, spell 747 Summon Images). Images have the same HP% as the real boss but far fewer total HP (exact value unknown) and use the same abilities for the same damage. Images despawn when the real Skeram dies. BigWigs/DBM pre-warn at ~81/56/31%.
- Raid-size assumptions: 40-man Classic Era. Season of Mastery added a "kill an image = wipe" rule and a Visions of Madness mechanic; Season of Discovery uses NPC 176525. Neither applies to Era.

## Abilities

### Arcane Explosion
- Name: Arcane Explosion (spell 26192)
- Type: AoE (point-blank, around Skeram or an image)
- Target rule: all players within radius of the caster. Cast "only when more than four players are in melee range" (wiki; Warcraft Tavern says "5 or more"). Patch 1.12 note on the wiki: "no longer guaranteed at 4+", so treat as a strong tendency not a hard rule. The Wowhead guide instead describes it as "cast constantly".
- Cast time: 1 s (Wowhead). Interruptible (wiki, Wowhead guide, DBM "kickcast"). Slowed by Curse of Tongues and Mind-numbing Poison (patch 1.10).
- Cooldown/cadence: unknown; no boss-mod timer exists. Treat as "whenever the trigger condition holds".
- Damage: Arcane. Wowhead base value 388 (scales with level); the wiki quotes 187–217; the Wowhead guide says "~1.5k per hit". Radius 30 yd (Wowhead).
- Debuff: none. Movement: none.
- Telegraph: 1 s cast bar on Skeram/image; DBM/BW announce the cast start.

### Earth Shock
- Name: Earth Shock (spell 26194)
- Type: targeted
- Target rule: the top-threat player when nobody is in melee range of that Skeram ("no-tank ability"). Wiki: "cast once per second until the aggro target is in melee range. Not cast randomly."
- Cast time: instant. Not interruptible (instant).
- Cadence: ~1 per second while the condition holds (wiki); otherwise never.
- Damage: Nature. Wowhead base value 654; wiki 149–174; Warcraft Tavern "up to 3,000". Range 100 yd. Also interrupts the victim's casting for 2 s.
- Debuff: 2 s school lockout. Movement: none.
- Telegraph: none (instant); the trigger is visible: nobody standing at the boss/image after a teleport or split.

### True Fulfillment (mind control)
- Name: True Fulfillment (spell 785)
- Type: mind control
- Target rule: disputed. Wiki and a Wowhead user comment: the player nearest to Skeram (closest non-tank per Warcraft Tavern); Wowhead guide: "a random raid member". Range 45 yd.
- Cast time: 0.5 s (Wowhead). Interruptible in principle but effectively not reactable.
- Cadence: unknown; no boss-mod timer. Multiple players can be controlled at once (DBM assigns up to 5 icons).
- Damage: none directly; the charmed player deals +300% damage, casts instantly, +50 all resistances, +40% movement speed (wiki/tooltip), and is enlarged 300% (visible without raid frames).
- Debuff: True Fulfillment, 20 s, charm, cannot be dispelled (wiki). Does not spread.
- Movement: none on the raid; the MC'd player is enemy-controlled.
- Telegraph: 0.5 s cast; the target grows huge; BW/DBM mark and announce the target with a 20 s bar.

### Teleport ("Blink")
- Name: Teleport (spell 20449; also 4801 / 8195 logged)
- Type: teleport + threat wipe
- Target rule: self. Destinations: one of three points — the middle platform or the left/right stairs (wiki). Also used to swap places with an image.
- Cast time: instant. Cadence: "random times" (Wowhead guide); unknown interval; no boss-mod timer.
- Effect: clears his threat table. If nobody melees him at the new spot he starts chaining Earth Shock on the top-threat player.
- Telegraph: none; BW/DBM announce after the fact.

### Summon Images (split)
- Name: Summon Images (spell 747)
- Type: summon adds
- Trigger: HP crosses 75%, 50%, 25%. Instant; Skeram disappears briefly and three appear, each on a platform he was not previously on (Wowhead guide).
- Images: same HP% as the boss, far fewer total HP (unknown), same abilities and damage, full mana on spawn (real boss keeps his depleted mana — use this or a pre-placed raid marker to identify him).
- Telegraph: BW/DBM "Summon Images soon" at ~81/56/31%.

### Melee
- About 700–1,000 per hit on a tank (wiki).

## Adds
- Images of Skeram: 2 per split (3 splits = 6 over the fight), spawn on the two platforms Skeram is not on. HP unknown but "significantly less" than the boss. Cast Arcane Explosion, Earth Shock, True Fulfillment and teleport like the real one. Picked up by the off-tank group pre-positioned on each platform. Killed by the raid (first two splits) or just tanked/interrupted (25% split) — they despawn when the real Skeram dies.

## Positioning and movement
- Tank: main tank charges first and establishes Skeram on the lower/middle platform facing a wall. One or two tanks (warriors or druids) stand on each side platform at all times to body-block Earth Shock after any teleport. After a teleport the tank at the destination must be meleeing him within a second or two. Tanks should never leave a platform empty. At least 3 tanks total; wiki suggests 6 (two per location).
- Melee DPS: keep the melee count at any Skeram to 4 or fewer to avoid Arcane Explosion (wiki/Tavern). Some melee are assigned to the side platforms so they gain threat on images the moment they spawn. Rogues/warriors on each platform are the interrupters.
- Ranged DPS: on the stair rails / upper steps, split into three groups (one per platform) so every Skeram has interrupters and DPS in range. Nobody should be the closest player to Skeram except the tank (MC rule).
- Healers: with their group on the rails; must avoid being top threat after a teleport (that player eats Earth Shocks). Keep one mage per group able to Polymorph.
- Whole raid: the three "blink points" are the stacking points; nothing else matters spatially. No run-out points.

## What each role must do and must not do
- Tank:
  1. Charge in first; hold Skeram on the middle platform against the wall.
  2. Side-platform tanks stay put the whole fight and hit him immediately after any teleport or split (prevents Earth Shock).
  3. Interrupt Arcane Explosion when you have the interrupt (Shield Bash/Pummel).
  4. Before each split (81/56/31% warning), confirm every platform has its tank; after the split grab the Skeram that appears on your platform.
  5. Never pull him off a platform; never let more than 4 melee stack on him.
- DPS:
  1. Do not DPS images at the 25% split except the assigned interrupt group; burn the real boss.
  2. Kill images at the 75% and 50% splits before resuming.
  3. Interrupt Arcane Explosion every time (1 s cast).
  4. Mages: Polymorph any mind-controlled player instantly and keep it up the full 20 s. Warlocks/rogues: Curse of Tongues / Mind-numbing Poison on all three Skerams.
  5. Rogues: use cooldowns early so they are not available if you get MC'd.
- Healer:
  1. Nothing dispellable on players; True Fulfillment cannot be dispelled.
  2. Spike damage: whoever is top threat after a teleport (Earth Shock chain) and anyone near an uninterrupted Arcane Explosion.
  3. Do not out-threat tanks right after a teleport (threat is wiped).
  4. Stay on the rails; do not move onto platforms.

## Timeline of a typical pull
- t=0: MT charges; raid moves to assigned platforms/rails; side tanks in melee range at their platforms (empty until the first teleport).
- t≈0–60 s: Arcane Explosion whenever ≥5 are in melee; True Fulfillment at unknown random intervals; first Teleport at a random time (threat wiped — side tank picks up).
- 75% HP: Skeram vanishes, three appear on the three platforms; identify the real one (marker/mana); kill both images; resume.
- 50% HP: second split, same handling.
- 25% HP: third split; assign a tank + 2 melee interrupters to each image, rest of raid kills the real Skeram; images despawn on his death.
- No hard enrage is documented; the fight ends when the real Skeram dies.

## Open questions
- Arcane Explosion damage: 388 base (Wowhead spell data) vs 187–217 (wiki) vs "~1.5k per hit" (Wowhead guide). Trigger rule: ">4 in melee" (wiki) vs "5 or more" (Tavern) vs "cast constantly" (Wowhead guide); 1.12 patch note says 4+ no longer guarantees it.
- Earth Shock damage: 654 base (Wowhead) vs 149–174 (wiki) vs "up to 3,000" (Tavern).
- True Fulfillment target: nearest player (wiki, Tavern "closest non-tank") vs random raid member (Wowhead guide). No cadence recorded anywhere.
- Teleport cadence: "random"; no timer in BigWigs or DBM.
- Image HP: unknown everywhere ("significantly less").
- Boss HP 4,264,000 is labelled "Seasonal 40 Player" on Wowhead; the plain 40-player Era value may differ.
