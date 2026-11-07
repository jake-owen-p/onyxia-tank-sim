# Gothik the Harvester (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Gothik_the_Harvester_(Classic) — Classic 40-man page: Phase 1 lasts 4:34; wave schedule (Trainees first at 24 s then every 20 s ×11; Deathknights first at 74 s every 25 s ×7; Riders first at 134 s every 30 s ×4; last wave 50 s before he lands); all add stats and abilities (HP, Eagle Claw, Knockdown, Intercept, Shadow Mark whirlwind 1,900–2,800, Shadow Bolt Volley 3,200–4,100 on Shadow-Marked players, Unholy Aura 450 Shadow/2 s in 45 yd, Arcane Explosion 500/20 yd, Cleave +50 up to 10 targets, Mana Burn 3,780–4,620, Sunder 2,950/stack ×5, Whirlwind ~2,500, Drain Life 4,000 over 5 s interruptible, Stomp -60% speed 12 s); CC rules; kill priorities; gate opens if a side is empty or at 30%; Gothik switches sides every 15–20 s; Harvest Soul -10% all stats stacking 1 min every 15–20 s; Shadow Bolt 2,250–2,750 every second on primary + random targets; quotes.
- https://www.wowhead.com/classic/guide/gothik-the-harvester-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: live side = ranged + 3 tanks at the three altar bone structures; undead side = melee, 5 spawn points indicated by flying spirits; CC susceptibility per add; kill priorities; Gothik teleports down at 4:30 to the live side, swaps every ~15 s, gate opens at 30%; adds do not despawn on his death.
- https://www.wowhead.com/classic/spell=28679/harvest-soul — Harvest Soul: instant, -10% all stats (tooltip "health and mana"), 1 min, 100 yd radius, unaffected by invulnerability.
- https://www.wowhead.com/classic/spell=29317/shadow-bolt — Gothik's Shadow Bolt: instant, 45 yd, 2,070 Shadow (effect value).
- https://www.wowhead.com/classic/spell=15245/shadow-bolt-volley — Shadow Bolt Volley (generic, level-scaled): 3 s cast, 30 yd radius.
- https://www.wowhead.com/classic/spell=27825/shadow-mark — Shadow Mark: whirlwind in 8 yd, applies "Unrelenting Riders will now target you with shadowbolts" for 15 s.
- https://www.wowhead.com/classic/spell=17467/unholy-aura — Unholy Aura: 150 Shadow every 2 s (generic rank; wiki says 450 for the riders' version).
- https://www.wowhead.com/classic/spell=28542/life-drain — note: the guide's "Life Drain" link is Sapphiron's spell; the Spectral Rider's Drain Life numbers come from the wiki.
- https://www.wowhead.com/classic/spell=26046/mana-burn — Spectral Deathknight Mana Burn: Power Burn 925 base (SP mod), 30 yd radius, 1 damage per mana.
- https://www.wowhead.com/classic/spell=26084/whirlwind — Whirlwind: weapon damage +680, 10 yd.
- https://www.wowhead.com/classic/spell=30285/eagle-claw — Eagle Claw: 85 Physical every 3 s for 15 s (bleed).
- https://www.wowhead.com/classic/spell=5164/knockdown — Knockdown: 2 s stun, 10 s cooldown.
- https://www.wowhead.com/classic/spell=27826/intercept — Intercept: 30 yd charge + 3 s stun (tooltip).
- https://www.wowhead.com/classic/spell=16145/sunder-armor — generic Sunder (-24 armor); the wiki's 2,950/stack is the NPC's rank.
- https://www.wowhead.com/classic/spell=19983/cleave — Cleave: normal damage +50, up to 10 targets, 6 s CD.
- https://www.wowhead.com/classic/spell=26192/arcane-explosion — Arcane Explosion: 1 s cast, 388 Arcane (level-scaled), 30 yd radius.
- https://classicdb.ch/?npc=16060 — Gothik: 150,000 HP, melee 4,336–4,974, armor 3,795.
- https://classicdb.ch/?npc=16124 / 16125 / 16126 / 16127 / 16148 / 16150 / 16149 — add HP: Unrelenting Trainee 4,900; Unrelenting Death Knight 20,436 (lvl 61); Unrelenting Rider 25,900 (lvl 62); Spectral Trainee 19,500 (lvl 60–63); Spectral Death Knight 16,185 (lvl 62); Spectral Rider 9,993 (lvl 63); Spectral Horse 39,500 (lvl 63).
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/MilitaryQuarter/Gothik.lua — DBM Classic: Phase 2 at 270 s; first wave 27 s; 18-wave table with per-wave composition and gaps (20,20,10,10,15,5,20,10,10,5,15,10,10,10,5,5,20 s); Gothik side-swap every 19.4–21 s after landing (teleport spells 28025 live / 28026 dead); 30% low-HP threshold ends the swapping.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: untargetable for 4.5 min; 11 trainee / 7 deathknight / 4 rider waves; spawning stops 50 s before he lands; ~35 s per side (WT) ; Phase 2 at 40% (WT, contradicted — see Open questions).

## Overview
- Level ?? boss, Undead (human death knight), mana user. HP 150,000 (classicdb.ch) — very low; the encounter is the add gauntlet, not the boss. No enrage; the soft limit is Harvest Soul stacking in Phase 2 and the adds overwhelming a side. Second boss of the Military Wing, required.
- Phases: Phase 1 (0 → 4:30–4:34): Gothik invulnerable on his balcony; timed waves of adds spawn on the living side; each living add that dies is reborn on the undead side as a stronger spectral add. The central gate is closed; the raid fights as two separate groups. Phase 2 (from 4:30/270 s): Gothik teleports onto the living side, Shadow Bolts and Harvest Souls, swapping sides every ~20 s; at 30% HP the gate opens and the raid converges. After he dies the remaining adds must still be killed.
- Raid-size assumptions: 40-man Classic Era split roughly: live side = casters/hunters, 3 tanks, priests/mages for CC; undead side = melee, tanks, raid healers. Needs ~6 mages/priests for CC (WT).

## Abilities

### Phase 1 wave spawning (living side)
- Name: wave summons (no player-facing spell)
- Type: summon adds
- Target rule: Unrelenting Trainees at all 3 living-side spawn points (the three "altar" bone structures on the wall), Deathknights at the 2 side points, Riders at the centre point (wiki).
- Cadence (DBM log-derived table, 18 waves): 27 s: 3 Trainees; 47 s: 3 Trainees; 67 s: 3 Trainees; 77 s: 2 Deathknights; 87 s: 3 Trainees; 102 s: 2 DK; 107 s: 3 Trainees; 127 s: 2 DK + 3 Trainees; 137 s: 1 Rider; 147 s: 3 Trainees; 152 s: 2 DK; 167 s: 1 Rider + 3 Trainees; 177 s: 2 DK; 187 s: 3 Trainees; 197 s: 1 Rider; 202 s: 2 DK; 207 s: 3 Trainees; 227 s: 1 Rider + 2 DK + 3 Trainees (last wave). Wiki's regular schedule: Trainees 24 s + n×20 s (11 waves), DKs 74 s + n×25 s (7 waves), Riders 134 s + n×30 s (4). Totals agree: 33 Trainees, 14 Deathknights, 4 Riders. Last wave ≈ 50 s before he lands.
- Telegraph: DBM wave timer; spawn animations at the altars.

### Soul transfer (undead side spawns)
- Type: summon adds — when a living add dies, its soul flies across the balcony to a bone pile and a spectral version appears there: Trainee → Spectral Trainee; Deathknight → Spectral Deathknight; Rider → Spectral Rider + Spectral Horse (wiki, Wowhead). Spawn points are not fixed; the flying spirit shows which of the 5 bone piles (Wowhead). Spectral adds are immune to magic damage (wiki) — hence melee on the undead side.
- Gate rule: if one side has no living players, the gate opens and that side's adds pour onto the other side (wiki).

### Shadow Bolt (Phase 2)
- Name: Shadow Bolt (29317)
- Type: targeted
- Target rule: his primary target plus one or more random players, every second (wiki); range 45 yd; he can target anyone in either room and bolt through the gate (wiki).
- Cast time: instant.
- Damage: 2,070 Shadow (effect value); wiki 2,250–2,750; not partially resistable (wiki).
- Telegraph: none.

### Harvest Soul (Phase 2)
- Name: Harvest Soul (28679)
- Type: AoE debuff (room)
- Target rule: all players within 100 yd (both rooms).
- Cadence: cast on landing and about every 15–20 s (wiki ability section 15 s, strategy 20 s).
- Effect: -10% all stats per stack (tooltip "health and mana"), 1 minute, stacks, cannot be removed. This is the soft enrage: at 4–5 stacks Shadow Bolts start one-shotting and healing collapses.
- Telegraph: none.

### Teleport / side swap (Phase 2)
- Name: teleport (DBM spells 28025 live side / 28026 dead side)
- Cadence: lands on the living side at 270 s (DBM) / 4:30 (Wowhead) / 4:34 (wiki); then swaps sides every 19.4–21 s (DBM) / ~15 s (Wowhead) / 15–20 s (wiki) / ~35 s (WT). Stops swapping and the gate opens at 30% HP (wiki, Wowhead, DBM threshold). Only the side he is on can damage him while the gate is closed.

### Living-side add abilities
- Unrelenting Trainee (4,900 HP, lvl 60): Eagle Claw bleed 85/3 s for 15 s; Knockdown 2 s stun (10 s CD). Vulnerable to all CC (Polymorph, Fear, Frost Nova).
- Unrelenting Deathknight (20,436 HP, lvl 61 elite): Intercept (30 yd, 65 dmg + 3 s stun); Shadow Mark whirlwind 1,900–2,800 Physical in 8 yd applying Shadow Mark (15 s) — marked players are the only valid targets for Riders' Shadow Bolt Volley. Shackle Undead and roots work.
- Unrelenting Rider (25,900 HP, lvl 62 elite): Shadow Bolt Volley 3,200–4,100 Shadow to Shadow-Marked players in 30 yd (3 s cast); Unholy Aura 450 Shadow every 2 s to everyone within 45 yd until it dies (resistable). Only snares work (Frostbolt, Frost Trap).

### Undead-side add abilities (all immune to magic damage)
- Spectral Trainee (19,500 HP classicdb / 5,030 wiki): Arcane Explosion ~500 Arcane in 20 yd (1 s cast). Stunnable.
- Spectral Deathknight (16,185 HP, lvl 62): Cleave +50 to up to 10 targets; Mana Burn 3,780–4,620 mana (30 yd AoE, damage = half mana burned per wiki); Sunder Armor -2,950 armor ×5 for 30 s; Whirlwind ~2,500 over 2 s (10 yd). Stunnable — stun-lock it (rogue rotation).
- Spectral Rider (9,993 HP, lvl 63): Drain Life 4,000 over 5 s on its top-threat target, interruptible (Kick/Pummel); Unholy Aura 450/2 s in 45 yd. Immune to all CC.
- Spectral Horse (39,500 HP classicdb / 29,979 wiki, lvl 63): Stomp — normal damage +16 and -60% movement for 12 s. Immune to all CC; lowest priority.

## Adds
- See the two ability subsections above for stats. Spawn counts: 33 Trainees, 14 Deathknights, 4 Riders over 4:30 (plus 4 Horses on the undead side). Living adds are picked up by the 3 live-side tanks at the altars; spectral adds by roaming undead-side tanks following the flying spirits. CC that must be held for the entire fight (wiki). Kill priority live: Rider > Deathknight > Trainee; undead: Spectral Trainee > Spectral Rider > Spectral Deathknight > Spectral Horse. Adds never despawn — including after Gothik dies — and dead living adds keep spawning spectral ones (wiki).

## Positioning and movement
- Tank: live side — three tanks, one facing each altar bone structure, picking adds up immediately (casters will rip aggro otherwise — Wowhead). Undead side — tanks roam between the 5 bone piles following the spirits; face Spectral Deathknights away from melee (Cleave 10 targets). Phase 2 — the live-side MT grabs Gothik the instant he lands (threat from zero), the undead-side MT does the same on each swap; at 30% whoever has him holds in the middle. Never: let a Spectral Deathknight face the melee; let adds die faster than the undead side can absorb.
- Melee DPS: undead side, spread between the five spawn points; rogues/warriors stun-lock Spectral Deathknights and interrupt Spectral Rider Drain Life; save single-target cooldowns for Gothik's landing (Wowhead).
- Ranged DPS: live side; kill Riders first, Deathknights second, Trainees last; pace kills so the undead side is never flooded (wiki: "killing adds too fast floods the undead side and can wipe the raid; over-CCing overwhelms the living side"). Priests Shackle Deathknights; mages Polymorph/Nova Trainees; hunters Frost Trap Riders. Phase 2: burst Gothik when he is on your side.
- Healers: split evenly, more Priests on the live side (Shackle), emphasis on raid healing for the undead side (Arcane Explosion, Unholy Aura, Cleave). Phase 2: Shadow Bolt spot-healing; expect Harvest Soul to shrink everyone's HP/mana by 10% per stack.
- Whole raid: two rooms, gate closed until 30%; stacking point in Phase 2 is wherever Gothik currently stands; at 30% both groups converge through the opened gate.

## What each role must do and must not do
- Tank:
  1. Live side: one tank per altar; grab every spawn at once.
  2. Undead side: watch the spirits, be at the bone pile when the spectral add appears; Spectral DKs faced away.
  3. Phase 2: taunt/pick up Gothik immediately on each landing; Shield Wall through Shadow Bolts if needed.
- DPS:
  1. Follow kill priorities; communicate kill pace between sides ("feed adds across at a steady pace" — wiki).
  2. CC: live side Shackle/Polymorph/Fear/Nova; undead side stuns only (Trainee, Deathknight); keep CC up all fight.
  3. Interrupt Spectral Rider Drain Life (Kick, Pummel). Stop multi-dotting Shadow-Marked players? (n/a) — avoid standing within 8 yd of Unrelenting Deathknights (Shadow Mark) so Riders cannot Volley you.
  4. Phase 2: everything on Gothik while he is on your side; at 30% converge and burst (150k HP dies in seconds).
  5. After the kill: finish all remaining adds — they do not despawn.
- Healer:
  1. Live side: tank healing on 3 tanks; undead side: raid healing vs Arcane Explosion/Unholy Aura/Cleave.
  2. Priests: Shackle rotation on Unrelenting Deathknights (live side).
  3. Phase 2: top Shadow Bolt targets (2,070–2,750 each); be mana-aware — Harvest Soul also cuts max mana 10% per stack (tooltip).
  4. Nothing to dispel (Harvest Soul cannot be removed; Shadow Mark is a dummy aura).

## Timeline of a typical pull
- t=0: Pull (any aggro on the room); gate closes; raid already split. Gothik: "Foolishly you have sought your own demise."
- t=27 s: wave 1 (3 Trainees) → … see the 18-wave table above; first Deathknights at 77 s, first Rider at 137 s; the final combined wave at 227 s. Each living death spawns a spectral add on the undead side a few seconds later.
- t=227–270 s: no new spawns; clean up / CC what remains.
- t≈270 s (4:30): Gothik lands on the living side ("I have waited long enough! Now, you face the harvester of souls!"), Harvest Soul #1, Shadow Bolts every second. Live-side MT picks him up; live DPS burst.
- t≈290 s: he teleports to the undead side (then alternates every ~20 s). Harvest Soul every ~15–20 s (stack 2 at ~290 s, 3 at ~310 s…).
- 30% HP (≈45k HP left): gate opens; everyone converges; he dies within seconds. Then kill all remaining adds.

## Open questions
- Phase 2 start: 270 s (DBM) vs 4:30 (Wowhead, WT) vs 4:34 (wiki).
- Side-swap interval: 19.4–21 s (DBM, log-derived) vs ~15 s (Wowhead) vs 15–20 s (wiki) vs ~35 s (WT).
- Gate-open threshold: 30% (wiki, Wowhead, DBM) vs 40% (WT).
- Harvest Soul cadence: 15 s (wiki ability list) vs ~20 s (wiki strategy); effect "-10% all stats" (aura) vs "health and mana" (tooltip).
- Shadow Bolt damage: 2,070 (spell) vs 2,250–2,750 (wiki).
- Add HP discrepancies (classicdb vs wiki): Spectral Trainee 19,500 vs 5,030; Spectral Horse 39,500 vs 29,979; Unrelenting Trainee 4,900 vs 4,578.
- Gothik HP: 150,000 (classicdb.ch) — no other source gives a value; treat as "dies in one burst window".
- Wave composition per spawn point and exact bone-pile mapping for spectral adds are not documented beyond "5 points, shown by the flying spirit".
