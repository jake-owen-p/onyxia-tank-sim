# Instructor Razuvious (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Instructor_Razuvious_(Classic) — Classic 40-man page: Disrupting Shout burns 4,050–4,950 mana within 45 yd, stuns, deals Physical damage equal to twice the mana burned, every 25 s, LoS only; Unbalancing Strike 350% weapon damage, -100 defense for 6 s; Understudy level 60, 91,560 HP, Taunt (20 s, 1 min CD), Shield Wall (75%, 20 s, 30 s CD), Mind Exhaustion 60 s charm immunity after MC ends, Hopeless (+5,000% damage taken when Razuvious dies); pull options; MC rotation; positioning rules (healers never in LoS); quotes.
- https://www.wowhead.com/classic/guide/instructor-razuvious-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: four Understudies; tank him at the bottom of the stairway into the training area with the Understudy in healers' LoS and the boss out of it; Disrupting Shout ~every 25 s hits everyone in LoS, drains mana, stuns and damages; Taunt 20 s / 60 s CD; Shield Wall 20 s / 30 s CD; off-tank holds free Understudies at the top of the stairs; a tank taunts + Shield Wall in gaps.
- https://www.wowhead.com/classic/spell=26613/unbalancing-strike — Unbalancing Strike: melee, instant, 350% weapon damage, -100 Defense skill for 6 s.
- https://www.wowhead.com/classic/spell=29107/disrupting-shout — Disrupting Shout: instant, Power Burn 4,050 (tooltip 4,050–4,950), 45 yd radius.
- https://www.wowhead.com/classic/spell=29060/taunt — Understudy Taunt: melee range, 20 s taunt aura, 1 min cooldown.
- https://www.wowhead.com/classic/spell=29061/shield-wall — Understudy Shield Wall: -75% Physical and magical damage for 20 s, 30 s cooldown.
- https://classicdb.ch/?npc=16061 — Razuvious: 1,935,232 HP, melee 26,693–30,638 (!), armor 4,691.
- https://classicdb.ch/?npc=16803 — Death Knight Understudy: level 60, 92,235 HP, melee 4,028–4,098, armor 7,505.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/MilitaryQuarter/Razuvious.lua — DBM Classic timers: Disrupting Shout first 25.9–26.3 s, then every 25.9 s (variance 25.4–27.3 s); Mind Control counted as 60 s; Taunt 60 s CD; Shield Wall 20 s; Mind Exhaustion (29051) 60 s; the first Mind Control is cast out of combat and starts the encounter.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: 2–3 priests; Understudies do excellent damage so they hold aggro; hunters pull each Understudy to a tank and Feign Death; never Sunder the Understudies; Disrupting Shout every 25 s drains 4,000 mana and twice as much health and stuns; rogues Evasion-tank if an Understudy dies.

## Overview
- Level ?? boss, Undead (death knight). HP 1,935,232 (classicdb.ch). Melee 26,693–30,638 before armor (classicdb) — he "one-shots anyone he hits" (wiki) and nearly one-shots a Naxx-geared tank (Wowhead). No enrage timer documented. First boss of the Military (Deathknight) Wing, required. Linked stable trash must be cleared first (wiki).
- Phases: single phase. The mechanic is a Mind Control tank rotation using his four Deathknight Understudies.
- Raid-size assumptions: 40-man Classic Era; at least 2 (ideally 3) Priests with ~3% spell hit for Mind Control; 1–2 real tanks for the pull/gaps and for holding free Understudies; healers and casters positioned out of line of sight.

## Abilities

### Unbalancing Strike
- Name: Unbalancing Strike (26613)
- Type: melee (targeted)
- Target rule: current target (the Mind Controlled Understudy, or whoever has aggro).
- Cast time: instant; not interruptible.
- Cadence: unknown (no timer in DBM); frequent.
- Damage: 350% weapon damage Physical (base melee 26,693–30,638 → tens of thousands before armor; an Understudy under Shield Wall takes 25%).
- Debuff: Unbalancing Strike — Defense skill reduced by 100 for 6 s (no dispel type). On a player tank this guarantees crushing blows/crits; this is why Understudies tank him.
- Telegraph: none. The wiki's rotation uses it as the swap cue: when the active Understudy is hit by Unbalancing Strike, the second Understudy Shield Walls and Taunts.

### Disrupting Shout
- Name: Disrupting Shout (29107)
- Type: AoE (around the boss), mana burn + stun
- Target rule: every enemy within 45 yd in line of sight of Razuvious (wiki: "only hits players in line of sight").
- Cast time: instant (no cast bar); not interruptible.
- Cadence: every 25.9 s, first 25.9–26.3 s after pull (DBM Classic); guides "every 25 s".
- Damage: burns 4,050–4,950 mana (Power Burn 4,050 effect value) and deals Physical damage equal to twice the mana burned (wiki; WT "twice as much health") — i.e. ~8,000–10,000 to a full-mana caster — plus a stun (wiki, Wowhead). Strategy text on the wiki quotes 6,200–8,500 mana burned for most mana users (with buffs/gear), "can one-shot most of the raid". Players with no mana (or no mana left) take no damage.
- Debuff: stun (duration unknown).
- Telegraph: DBM 25.9 s timer with a 5 s pre-warning; the shout animation. Ranged must break LoS (stand behind the stair railing / around the corner) before each shout.

### Deathknight Understudy — Taunt (29060, usable when Mind Controlled)
- Type: aggro pull; melee range; forces Razuvious to attack the Understudy for 20 s; 1 min cooldown. Taunt is a spell and can be resisted.

### Deathknight Understudy — Shield Wall (29061, usable when Mind Controlled)
- Type: defensive; -75% Physical and magical damage taken for 20 s; 30 s cooldown. Use together with Taunt.

### Mind Exhaustion (29051, on the Understudy when MC ends)
- Type: debuff on the add; 60 s immunity to charm after any Mind Control ends (break, expiry or cancel) — DBM tracks it per Understudy.

### Hopeless (on Understudies when Razuvious dies)
- Type: debuff; surviving Understudies take +5,000% damage (wiki) → they die instantly afterwards.

## Adds
- Deathknight Understudy ×4 (NPC 16803): level 60, 92,235 HP (classicdb) / 91,560 (wiki), melee 4,028–4,098, armor 7,505 (high — do not Sunder them; it makes Razuvious hit them harder, wiki/WT). Two stand near Razuvious, two "inactive" further away (wiki). Abilities while Mind Controlled: Taunt and Shield Wall (they also deal "excellent damage" and hold aggro easily — WT). When not controlled they attack the raid and are held by off-tanks at the top of the stairs (Wowhead) using Shield Bash/Demoralizing Shout/Battle Shout threat rather than damage (wiki). They never need to die; if one dies, rogues Evasion-tank until another MC is ready (WT). They are killed by Hopeless after the boss dies.

## Positioning and movement
- Tank (player tanks): one tank/hunter pulls (hunter kites back and Feign Deaths, or a Priest Mind Soothes the two closest Understudies, or a Preparation rogue bow-pulls and Evasion-tanks — wiki). The real tank takes at most one or two hits while the first MC lands; in gaps between Understudy Taunts, Taunt + Shield Wall/Last Stand immediately (Wowhead). Off-tanks hold the free Understudies at the top of the stairway with their backs to the boss so the Priest does not have to turn them (wiki). Never: let a player tank hold Razuvious longer than a few seconds; Sunder Armor the Understudies.
- Mind Controlled Understudy (the real "tank"): tanked at the bottom of the stairway into the training area, boss inside the room, Understudy in the healers' line of sight down the stairs while Razuvious is out of their LoS (Wowhead, wiki). Rotation (wiki): Priest 1 MCs, Shield Wall + Taunt; Priest 2 MCs a second Understudy and has it attack; when the active one is hit by Unbalancing Strike (or Taunt/Shield Wall near expiry), Understudy 2 Shield Walls + Taunts; Priest 1 lets MC lapse once the Understudy is healed and prepares the next (Mind Exhaustion 60 s means you need 3–4 Understudies cycling).
- Melee DPS: on Razuvious behind him; no special positioning; Disrupting Shout only matters if they have mana (Enhancement/Feral/Ret should break LoS or expect to be hit; druids are hit in any form — wiki).
- Ranged DPS: grouped with the healers at the top of the stairs, out of LoS; strafe into LoS to cast and back out before each Shout (Wowhead); never pull him toward the ranged group (if you get aggro, run into melee range — wiki).
- Healers: never in Razuvious's line of sight (wiki, bold). Heal the Understudy that is tanking (it takes ~25% while Shield Walled) and the off-tanks holding free Understudies; be ready to pump the player tank in gaps. Mages Amplify Magic the MC'd Understudy (no magic damage taken — wiki). Warlocks: no Curse of Shadow on Understudies.
- Whole raid: the stairway and railing are the LoS tools; the training-room floor is the boss zone; the top of the stairs is the safe zone.

## What each role must do and must not do
- Tank:
  1. Pull cleanly and hand off to the first MC within one or two swings.
  2. Off-tanks: hold free Understudies at the top of the stairs without damaging them (no Sunder, no DPS); dispel attack-speed debuffs on them when possible (wiki).
  3. In any MC gap: Taunt Razuvious at once, Shield Wall/Last Stand, and survive until the next Understudy Taunt lands.
- DPS:
  1. Melee: full DPS; the Understudy's threat is high. Do not out-threat it.
  2. Ranged: cast only from positions you can leave in <5 s; break LoS before each Shout (DBM 25.9 s). A Shout with full mana = ~8–10k damage + stun.
  3. Nothing to interrupt or dispel on the boss; do not damage Understudies.
  4. Rogues: Evasion-tank in emergencies.
- Healer:
  1. Priests (2–3): run the MC rotation; 3% spell hit; stagger MCs; Shield Wall + Taunt together on each handoff; never let an Understudy's HP drop low before releasing MC.
  2. Keep the active Understudy alive (its HP ~92k; Shield Wall covers most of the Taunt window); heal it through the stairs LoS.
  3. Stay out of Razuvious's LoS at all times; a Shout on the healers is a wipe.
  4. Heal the off-tanks holding free Understudies (4,000+ melee each).

## Timeline of a typical pull
- t=-3 s: Priest 1 begins Mind Control on the nearest Understudy (DBM: the first MC starts the encounter); hunter/tank pulls Razuvious.
- t=0–3 s: MC lands; Understudy Shield Walls and Taunts; Razuvious switches to it. Off-tanks collect the other three Understudies (hunter Feign Death handoffs) and walk them to the top of the stairs.
- t≈10 s: Priest 2 MCs a second Understudy as backup and has it attack for threat.
- t≈20 s: Understudy 1's Taunt ends (Shield Wall ends too); Understudy 2 Shield Walls + Taunts (cue: Unbalancing Strike on #1). Priest 1 drops MC when #1 is healed → #1 gets Mind Exhaustion (60 s); an off-tank picks it up.
- t≈25.9 s: Disrupting Shout #1 (ranged/healers out of LoS); then every 25.9 s (≈51.8, 77.7, 103.6 …).
- Every ~20 s: Taunt handoff between the two active Understudies; every 60 s each Understudy becomes MC-able again (Taunt CD 60 s, Mind Exhaustion 60 s) — a 3–4 Understudy cycle keeps one Taunt always available.
- Kill: 1.94M HP; no enrage; typical kills take 3–5 minutes.

## Open questions
- Number of Understudies: four (Wowhead guide; wiki describes two near him and two inactive).
- Disrupting Shout damage: wiki "twice the mana burned" (4,050–4,950 base) vs its strategy text "6,200–8,500 mana burned"; stun duration not given anywhere.
- Mind Control duration: Priest Mind Control is up to 60 s (DBM counts 60 s); MC on a boss-level add can break early — spell hit reduces this.
- Unbalancing Strike cadence: unknown.
- Understudy HP: 92,235 (classicdb.ch) vs 91,560 (wiki).
- Razuvious melee: 26,693–30,638 (classicdb) — plausibly the reason even Shield-Walled Understudies need constant healing; no source gives his observed hit on a plate player.
- "Jagged Knife" / "Bone Barrier": not present in any Classic source (Wrath-only). DBM's Horsemen module reuses spell 29061 as "Bone Barrier" for SoD.
