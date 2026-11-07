# Bloodlord Mandokir (Zul'Gurub)

Sources: list every URL used, one per line, with what it contributed.
- https://classic.warcraftdb.com/data/npc/11382 (API) — level 63 World Boss, health 466,340, no mana; abilities Charge 24408 (40 yd), Intimidating Shout 19134, Mortal Strike 16856, Overpower 24407, Threatening Gaze 24314 (2 s cast, 6 s), Whirlwind 13736.
- https://classic.warcraftdb.com/data/npc/14988 — Ohgan: level 60 World Boss, 91,560 HP, Thrash.
- https://classic.warcraftdb.com/data/npc/15117 — Chained Spirit: level 60, 3,052 HP, Undead.
- https://classic.warcraftdb.com/data/npc/11391 — Vilebranch Speaker: level 61, 3,144 HP; Cleave, Demoralizing Shout, Enrage.
- https://classicdb.ch/?spell=24408 — Charge: instant, 40 yd, weapon +75, 2 s stun.
- https://classicdb.ch/?spell=24314 — Threatening Gaze: 2 s cast, 100 yd, 6 s dummy aura.
- https://classicdb.ch/?spell=24315 — Charge (gaze): 100 yd, charge + triggers Guillotine.
- https://classicdb.ch/?spell=24316 — Guillotine: 10 yd, weapon damage +7,500.
- https://classicdb.ch/?spell=13736 — Whirlwind: channeled 2 s, periodic trigger every 2 s.
- https://classicdb.ch/?spell=19134 — Intimidating Shout: instant, 8 yd radius, fear 8 s (+25% speed).
- https://classicdb.ch/?spell=16856 — Mortal Strike: 200% weapon damage, healing taken -50% for 5 s.
- https://classicdb.ch/?spell=24407 — Overpower: weapon +750, cannot be blocked/dodged/parried.
- https://classicdb.ch/?spell=7160 — Execute: weapon +50 (base).
- https://classicdb.ch/?spell=24312 — Level Up: +10% damage, +20% scale, permanent.
- https://classicdb.ch/?spell=24317 — Sunder Armor (Ohgan): 5 yd, 20 s, -1000 armor per application.
- https://classicdb.ch/?spell=24318 — Enrage: +50% damage, +65% melee haste, +15% scale, 90 s.
- https://warcraft.wiki.gg/wiki/Bloodlord_Mandokir_(Classic) — optional boss unlocked by killing the Vilebranch Speaker; Charge 150 damage 2 s stun wipes threat; Threatening Gaze 6 s, acting → charge + Guillotine ~15,000; Whirlwind ~2,500 after 2 s; Execute ~5,000 below 20%; Intimidating Shout 6 s; Mortal Strike every 20–40 s; Overpower 2,200 on dodge; Level Up every 3 player deaths (+10% size/damage); Enrage when Ohgan dies (+65% speed, +50% damage, 1.5 min); Ohgan 91,560 HP, Sunder Armor 1,000 per stack up to 20; Chained Spirits revive dead players (100% HP/mana), limited count; tactics (3 tanks, swap at 3–5 Sunders, Ohgan first or last, pause after charges, hunters Feign Death, Amplify Magic, healer mana).
- https://warcraft.wiki.gg/wiki/Ohgan_(Classic) — Sunder Armor "up to 5 times", 20 s; two approaches (kill first vs offtank till the end).
- https://warcraft.wiki.gg/wiki/Chained_Spirit — revive dead players; Spirit's Vengeance (+25% HP/damage/healing, -10% damage taken, stacks 10) is the Cataclysm version.
- https://www.wowhead.com/classic/guide/bloodlord-mandokir-zul-gurub-strategy (via r.jina.ai) — Speaker at the bottom of the stairs engages him; Mandokir at a pillar with melee on the far side for fear LoS; Amplify Magic; Ohgan stacking debuff, two tanks swap every 3–4 stacks, enrage 1 min on Ohgan death, kill Ohgan first recommended; Cleave, Whirlwind (melee move out a second early), AoE Fear if many are close; Charge drops some threat, min/max range → bait at 8–30 yd, hunter Feign Death; Threatening Gaze yell "<player>! I'm watching you!" — stop everything, tank watched → all DPS stop; every 3 deaths = level up (bigger, more damage, less physical damage taken), Jin'do "grats"; melee at his feet, ranged at max range.
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — Gaze: stop all actions; charge targets isolated players, hunter bait; swap Ohgan at 4 stacks; kill Ohgan first; 1-minute enrage; strafe out of Whirlwind.
- https://us.millenium.gg/guide/6831.html?page=8 — Speaker must die first, he rides up on Ohgan; enrage +50% damage +65% attack speed 1 min; watched target hides out of LoS; don't resurrect mid-fight.
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — small semicircle, all DPS stops after each charge until centred, everyone but MT out of the spin, watched healers covered by others.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_mandokir.cpp — Charge hit → full threat reset; Threatening Gaze: stores target's threat, if it rises during the 6 s he Summon-Players them (if no LoS) and casts the 100 yd Charge (24315 → Guillotine); every 3 player kills → Level Up + Jin'do yell; a Chained Spirit within 50 yd revives each dead player; Ohgan Sunder Armor every 10–15 s; Ohgan death → Enrage + emote; spirits spawn on aggro, despawn on evade/death.

## Overview
- Level 63 ("??"), World Boss. Health 466,340 (Era); Ohgan 91,560. No mana, no enrage timer (enrage is event-driven). OPTIONAL: killing him does not affect Hakkar; usually done after Venoxis/Jeklik on the way to Mar'li (Icy Veins/wiki order) — lives on top of the stairs in the south-east. Engaged by killing the Vilebranch Speaker at the bottom of his stairs; he rides down on Ohgan, Chained Spirits appear around the arena.
- Phases: single phase. Event triggers: Ohgan's death → 90 s Enrage; every 3 player deaths → Level Up (permanent); Threatening Gaze → Guillotine charge if the watched player acts.
- Raid-size assumptions: 20-man Classic Era. No SoD-specific values found.

## Abilities

### Charge
- Name: Charge (24408)
- Type: charge + threat wipe
- Target rule: a player within 40 yd (not his current target); guides: the isolated/furthest eligible player, so a bait stands at 8–30 yd
- Cast time: instant
- Cooldown or cadence: "randomly through the fight" (Wowhead); unknown interval
- Damage: weapon +75 (wiki "150 damage"), 2 s stun
- Debuff: stun 2 s
- Movement effect: he runs to the target; threat table wiped (wiki, cmangos; Wowhead "drops some threat") → all DPS stop until the MT has him back
- Telegraph: none; hunters Feign Death after being charged to help the MT

### Threatening Gaze ("Watch")
- Name: Threatening Gaze (24314)
- Type: targeted debuff / conditional charge
- Target rule: random player (100 yd), including tanks
- Cast time: 2 s
- Cooldown or cadence: periodic, interval unknown
- Damage: none by itself. If the watched player's threat rises during the 6 s (any attack, heal, buff, DoT tick that generates threat — guides: "any action"), he Summon-Players them if out of LoS and Charges (24315) → Guillotine weapon +7,500 (wiki ~15,000) — lethal
- Debuff: Threatening Gaze 6 s
- Movement effect: none for the raid; the watched player must freeze
- Telegraph: yell "<name>! I'm watching you!" plus a whisper. If the watched player is the tank, everyone stops DPS so threat does not pass him.

### Whirlwind
- Name: Whirlwind (13736)
- Type: melee AoE
- Target rule: all players in melee range
- Cast time: channeled 2 s
- Cooldown or cadence: unknown
- Damage: ~2,500 per player (wiki) landing after ~2 s
- Debuff: none
- Movement effect: none
- Telegraph: spin animation/boss mod; melee strafe out a second early and return after

### Intimidating Shout (AoE fear)
- Name: Intimidating Shout (19134; cmangos uses 29321)
- Type: fear
- Target rule: players within 8 yd (Wowhead: used "if too many players are close")
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: none
- Debuff: fear 8 s (wiki 6 s), +25% move speed while feared
- Movement effect: fear; melee LoS him behind a pillar to avoid it (Wowhead)
- Telegraph: none; Fear Ward/Tremor Totem on the MT

### Mortal Strike
- Name: Mortal Strike (16856)
- Type: melee (tank)
- Target rule: current target
- Cast time: instant
- Cooldown or cadence: every 20–40 s (wiki)
- Damage: 200% weapon damage
- Debuff: healing received -50% for 5 s (not dispellable)
- Movement effect: none
- Telegraph: none; tank healers pre-heal

### Overpower
- Name: Overpower (24407)
- Type: melee
- Target rule: current target after it dodges
- Cast time: instant
- Cooldown or cadence: reactive
- Damage: weapon +750 (wiki ~2,200 on tanks); cannot be blocked, dodged or parried
- Debuff: none
- Movement effect: none
- Telegraph: follows a dodge

### Execute
- Name: Execute (7160)
- Type: melee
- Target rule: current target below 20% health
- Cast time: instant
- Cooldown or cadence: reactive
- Damage: weapon +50 base; wiki ~5,000
- Debuff: none
- Movement effect: none
- Telegraph: a tank under 20% is about to die — healers never let the tank sit low

### Level Up
- Name: Level Up (24312)
- Type: enrage (permanent)
- Target rule: self, every 3 player kills (cmangos counter; wiki/Wowhead)
- Cast time: instant
- Cooldown or cadence: per 3 deaths
- Damage: +10% damage dealt and +20% size per level (DBC; wiki "+10% size and damage"); Wowhead adds "takes less physical damage"
- Debuff: permanent, stacks
- Movement effect: none
- Telegraph: full level-up animation and yell; Jin'do (if alive) yells congratulations

### Enrage (on Ohgan's death)
- Name: Enrage (24318; cmangos references 23537)
- Type: enrage
- Target rule: self when Ohgan dies
- Cast time: instant
- Cooldown or cadence: once
- Damage: +50% damage, +65% melee attack speed, +15% size for 90 s (wiki 1.5 min; Wowhead/Warcraft Tavern "1 minute")
- Debuff: n/a
- Movement effect: none
- Telegraph: emote (EMOTE_RAGE); healers and MT pop cooldowns (Shield Wall)

### Sunder Armor (Ohgan)
- Name: Sunder Armor (24317)
- Type: debuff (tank)
- Target rule: Ohgan's current target
- Cast time: instant, 5 yd
- Cooldown or cadence: every 10–15 s (cmangos)
- Damage: none; -1,000 armor per stack, 20 s; stacks to 5 (wiki Ohgan page) or 20 (wiki Mandokir page)
- Debuff: not dispellable
- Movement effect: none
- Telegraph: stack count — swap Ohgan tanks at 3–5 stacks (wiki), 3–4 (Wowhead), 4 (Warcraft Tavern); 7–8 stacks ≈ cloth

## Adds
- Ohgan (NPC 14988): level 60 World Boss raptor, 91,560 HP, Sunder Armor + Thrash. Comes with Mandokir; tanked apart by two tanks swapping on stacks. Does not despawn when Mandokir dies. Kill first (accept the 90 s enrage, frees two tanks — Wowhead recommendation) or keep alive and kill last (no enrage, but healers must sustain three tanks).
- Chained Spirits (NPC 15117): level 60, 3,052 HP, spawn around the arena when he is engaged; the nearest spirit within 50 yd revives each dead player (Revive 24341, 100% HP/mana per wiki) and is consumed. Count not published for Classic (Cataclysm heroic has 8). Each revive still counts toward the 3-death Level Up.
- Vilebranch Speaker (NPC 11391): level 61, 3,144 HP (Cleave, Demoralizing Shout, Enrage). Its death starts the encounter. Clear everything else in the area first and do not touch it until ready.

## Positioning and movement
- Tank: MT holds Mandokir at a pillar near the stairs' foot, facing away from the raid; Ohgan is taken 30+ yd away by OT1/OT2 who taunt-swap every 3–5 Sunders. After each Charge the MT taunts/regains him and walks him back to the pillar before DPS resumes. If the MT is watched, hold threat without new actions (no Sunder/Revenge) while the raid stops DPS.
- Melee DPS: stand "right on his foot" (Wowhead) to be ineligible for Charge, on the far side of the pillar so Intimidating Shout can be LoS'd; strafe out ~1 s before Whirlwind, return after. Stop DPS instantly after a Charge and whenever a tank is watched.
- Ranged DPS: at max range (36+ yd) so they are not the Charge target; one hunter stands isolated at 8–30 yd as the designated Charge bait and Feign Deaths after each charge. Warlocks/priests: keep AoE fears off. Mages: Amplify Magic on everyone (no magic damage in this fight).
- Healers: spread at range; the bait hunter and the three tanks are the heal targets; Mortal Strike windows (-50% healing, 5 s) need pre-heals; when a healer is watched, the others cover their targets. Do not combat-res manually (adds to the death count — Millenium).
- Whole raid: a loose semicircle at range; pillar for melee LoS; no run-out points other than out of Whirlwind.

## What each role must do and must not do
- Tank:
  1. Kill the Speaker only when everyone is positioned; MT picks him up as he rides down.
  2. Ohgan tanks: swap at 3–5 Sunder stacks (10–15 s per stack).
  3. After a Charge: taunt, re-establish, walk him back to the pillar; call DPS back.
  4. If watched: freeze (no abilities) for 6 s; the raid stops DPS so you keep top threat.
  5. Ohgan death → Enrage: Shield Wall/Last Stand, healers stack heals for 90 s.
  6. Never stand below 20% HP (Execute), never let melee pile up within 8 yd (Fear).
- DPS:
  1. Ranged at max range, melee at his feet; nobody loose in the 8–40 yd band except the bait.
  2. Watched: stop everything — no auto-attack, no DoT refresh, no pet attacks, no bandage.
  3. Stop DPS after every Charge and while a tank is watched.
  4. Melee leave Whirlwind, hunters Feign Death after charges, don't die (3 deaths = level up).
  5. Kill Ohgan first (default) with the two OTs, then Mandokir.
- Healer:
  1. Pre-heal the MT for Mortal Strike (every 20–40 s, -50% healing).
  2. Keep the bait hunter alive through charges.
  3. During the 90 s Enrage, all healers on the MT.
  4. Watched healer stops casting; others cover; never res manually.

## Timeline of a typical pull
- t=0: Vilebranch Speaker dies; Mandokir yells and rides down on Ohgan; Chained Spirits appear around the arena. MT takes Mandokir to the pillar; OT1 takes Ohgan away (Sunder every 10–15 s, swap at 3–5 stacks).
- t≈0–60 s: Mortal Strike every 20–40 s, Whirlwind on melee periodically, random Charges (threat wipe → DPS stop → taunt → resume), Threatening Gaze on random players ("<name>! I'm watching you!" — 6 s freeze).
- t≈60–90 s: Ohgan (91,560 HP) dies → Enrage 90 s (+50% damage, +65% haste); cooldowns; DPS continues on Mandokir with Charge/Gaze discipline.
- t≈2.5–4 min: Mandokir (466,340 HP) dies. If anyone died, spirits revived them; every third death leveled him (+10% damage each).
- Alternative: keep Ohgan alive, kill Mandokir first, then Ohgan (no enrage; three tanks all fight).

## Open questions
- Charge target selection: "next on the threat list" vs "furthest/isolated player" (Wowhead/Icy Veins comments); threat effect: full wipe (wiki, cmangos) vs "drops some threat" (Wowhead).
- Guillotine: weapon +7,500 (DBC) vs ~15,000 (wiki).
- Fear: 19134 (warcraftdb) vs 29321 (cmangos); 8 s (DBC) vs 6 s (wiki).
- Sunder Armor max stacks: 5 (wiki Ohgan) vs 20 (wiki Mandokir); DBC shows no stack limit.
- Enrage spell: 24318 (90 s, wiki numbers) vs 23537 (cmangos); duration "1 minute" (Wowhead, Warcraft Tavern) vs 1.5 min (wiki, DBC).
- Chained Spirit count in Classic: not published (8 in Cataclysm heroic).
- Level Up: +20% size (DBC) vs +10% (wiki); whether he also takes less physical damage (Wowhead only).
- Whether Charge honours a minimum range (Wowhead says 8 yd min; DBC 24408 lists only 40 yd max).
- No cadence data for Charge, Gaze, Whirlwind; Warcraft Logs not accessible.
