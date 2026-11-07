# Broodlord Lashlayer (Blackwing Lair)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Broodlord_Lashlayer — ability descriptions, Mortal Strike crits (8k plate / 15k cloth), Knock Away -50% threat on the top-threat player, suppression room (traps 20% speed, whelps 30 s respawn, hatchers/elites 20 min), three DPS-pacing methods.
- https://classicdb.ch/?npc=12017 — HP 916,025, melee 15,715–18,235, armor 4,641, abilities Blast Wave 23331, Cleave 15284, Knock Away 18670, Mortal Strike 24573.
- https://classicdb.ch/?spell=23331 — Blast Wave: instant, Fire, base 2625, 20 yd radius, -50% movement 8 s, knockback.
- https://classicdb.ch/?spell=24573 — Mortal Strike: 500% weapon damage, healing taken -50% for 5 s.
- https://classicdb.ch/?spell=18670 — Knock Away: 10 yd, weapon +30, knockback, script effect (threat reduction).
- https://classicdb.ch/?spell=15284 — Cleave: weapon +10, up to 3 targets.
- https://classicdb.ch/?spell=22247 — Suppression Aura: -80% movement, +400% time between attacks, -80% casting speed, 6 s, 20 yd radius.
- https://classicdb.ch/?npc=12468 — Death Talon Hatcher: level 61, HP 87,930, Flamestrike, Growing Flames.
- https://classicdb.ch/?spell=22442 — Growing Flames: 50 Fire every 2 s for 6 s, 15 yd, stacking aura.
- https://classicdb.ch/?npc=12458 — Blackwing Taskmaster: level 62, HP 51,485, Healing Circle, Shadow Shock.
- https://warcraft.wiki.gg/wiki/Suppression_Device — aura numbers, 20 yd radius, rogue Disarm Trap, reactivation "a short time later".
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/boss_broodlord_lashlayer.cpp — emulator timers: Cleave 8 s then 7 s, Knock Away 12 s then 15–30 s, Blast Wave 20 s then 8–16 s, Mortal Strike 30 s then 25–35 s.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair/blackwing_lair.cpp — Suppression Devices re-arm on a random 30 s–2 min timer while he lives and never again after he dies.
- https://github.com/BigWigsMods/BigWigs_Classic/blob/master/BlackwingLair/Broodlord.lua — Mortal Strike 5 s target bar; no cooldown bars (casts are irregular).
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/BWL/Broodlord.lua — same: announces only, 5 s MS bar.
- https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ — Suppression Aura 20 yd / 80%, whelps 30 s, hatchers 20 min, MT in an alcove corner, 2 OTs at 90 degrees, DPS starts ~30 s in, Knock Away halves threat, melee weave out of Blast Wave every ~10 s, "Hypercharged" Mortal Strike >5000 roughly every 25 s, PW:S after it.
- https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-four — 2006: suppression room takes 20–40 min, cubby-by-cubby advance, hatcher aura 50/s stacking, taskmaster CC, casters beside (not in front of) the gate, tanks in the northern corner, knockback -50% aggro, heal only the aggro tank.
- https://us.millenium.gg/guide/6486.html?page=3 — tanks in the corner next to the gate, raid in the opposite corner, wand/ranged weapons to limit threat, Demoralizing Shout / Thunder Clap.
- https://yttrium-tyclief.github.io/sod-guides/bwl/broodlord (Season of Discovery) — tank against a wall with melee wedged between boss and wall, MS -50% healing, no taunt, OT holds second threat; SoD-only 50% teleport phase.
- Wowhead Classic guide snippets via search (page itself is region-blocked) — Blast Wave "20 yd AoE knockback, 3000 damage, 50% movement for 8 seconds"; two rogues stay stealthed to keep traps disarmed; corner-wedge tank position.

## Overview
- Level ?? (boss), HP 916,025 (classicdb.ch), melee 15,715–18,235, armor 4,641. No enrage. Third boss, required (his death stops the Suppression Devices permanently and opens the gate to the Crimson Laboratories). Immune to Taunt (SoD guide; Classic guides never use taunt here).
- Phases: single phase in Classic Era. (Season of Discovery adds a 50% teleport phase — not applicable.)
- The real encounter is the Suppression Room before him: two rooms of Suppression Devices (traps), Corrupted Whelps that respawn every 30 s, Death Talon Hatchers and Blackwing Taskmasters on a 20 min respawn. A first-time raid spends 20–40 min clearing it; a wipe on Broodlord means redoing it.
- Raid-size assumptions: 40-man Classic Era; rogues are mandatory for Disarm Trap (any class can disarm only from patch 5.1 onward).

## Abilities

### Blast Wave
- Type: AoE (melee radius), knockback, slow
- Target rule: all enemies within 20 yd of him
- Cast time: instant
- Cooldown: first ~20 s after engage, then every 8–16 s (cmangos); Warcraft Tavern "every 10 seconds"
- Damage: Fire, 2625 base (classicdb.ch) — roughly 2625–3375 before resistance; Wowhead guide says ~3000. Partially resisted by Fire Resistance. Line of sight blocks it (Icy Veins / Wowhead snippets: melee LoS it around the corner).
- Debuff: Blast Wave, 8 s, -50% movement speed, dispel type none
- Movement effect: knockback (value 175 at 100 speed in the spell data — a few yards)
- Telegraph: none reliable; addons announce the cast after the fact. Count ~10 s from the previous one.

### Mortal Strike
- Type: targeted melee / healing debuff
- Target rule: current tank
- Cast time: instant
- Cooldown: first ~30 s, then every 25–35 s (cmangos); Warcraft Tavern "roughly every 25 seconds"
- Damage: 500% weapon damage, Physical — 5,000+ typical on a plate tank, crits up to ~8,000 on plate and 15,000+ on cloth (Warcraft Wiki)
- Debuff: Mortal Strike, 5 s, healing effects taken reduced by 50%, dispel type none
- Movement effect: none
- Telegraph: none; the debuff is the signal (BigWigs/DBM 5 s target bar).

### Knock Away
- Type: targeted knockback + threat reduction
- Target rule: the player at the top of his threat list, 10 yd (i.e. the current tank)
- Cast time: instant
- Cooldown: first ~12 s, then every 15–30 s (cmangos); guides call it "occasional"
- Damage: weapon damage +30, Physical
- Debuff: none
- Movement effect: knockback (spell data: 132 at 125 speed — a long throw unless the tank's back is against a wall); the target's threat is reduced by 50% (Warcraft Wiki, Warcraft Tavern, Ten Ton Hammer) and he turns to the next player on the list
- Telegraph: none

### Cleave
- Type: melee cone
- Target rule: current target plus nearest allies, up to 3 targets
- Cast time: instant (next melee)
- Cooldown: first ~8 s then every ~7 s (cmangos)
- Damage: weapon damage +10, Physical (15.7–18.2k pre-armor weapon damage, so a cloth wearer in the cone dies)
- Debuff / movement: none
- Telegraph: none

## Adds
- None during the boss. Suppression Room before him (Halls of Strife):
  - Suppression Devices (traps): pulse Suppression Aura (-80% movement, +400% swing time, -80% cast speed, 6 s, 20 yd radius, refreshed constantly). Rogues stealth and Disarm Trap; a disarmed device re-arms after a random 30 s–2 min while Broodlord lives (cmangos) and cannot be disarmed again for 1 s after re-arming (Warcraft Wiki). Permanently disabled after he dies.
  - Corrupted Red/Green/Blue/Bronze Whelps: non-elite, guard each device, respawn every 30 s; AoE'd by mages/warlocks.
  - Death Talon Hatcher: level 61, HP 87,930, Flamestrike (5 yd) and Growing Flames (stacking 50 Fire/2 s aura, 15 yd — "50 damage per second, can reach 1000 stacks" per Ten Ton Hammer). Tank it in the far corner of a cubby away from the raid; 20 min respawn.
  - Blackwing Taskmaster: level 62, HP 51,485, Healing Circle and Shadow Shock; come in groups of three (sheep two, kill one); 20 min respawn.
- The raid advances cubby to cubby; two rogues stay out of combat in stealth to keep the nearest devices disarmed during the boss (Wowhead snippet).

## Positioning and movement
- Tank: pull him from where he patrols into the corner/alcove beside the gate (Millenium "corner next to the gate"; Ten Ton Hammer "northern corner"; Wowhead "corner to the right of where he stands"). Wedge your back into the corner so Knock Away cannot throw you (SoD guide/Wowhead). Face him into the wall. Two off-tanks at 90 degrees to either side (Warcraft Tavern), building threat so one of them is second when Knock Away halves the MT's threat. No one in front but the active tank. Never stand with open space behind you.
- Melee DPS: rogues in full Fire Resistance gear stand with the tanks in the corner (Ten Ton Hammer), between the boss and the wall and behind him so Cleave misses them and Blast Wave pins them to the wall (SoD guide). Alternative Classic method: weave out of the 20 yd Blast Wave radius every ~10 s (Warcraft Tavern) or LoS it around the corner. Melee need ~150–200 FR. Rogues bandage themselves.
- Ranged DPS: stand together in the opposite corner, 25–30 yd away, beside — not in front of — the gate (so nothing aggroes when it opens), away from any device. Wand or auto-shoot when threat is high (Millenium "wand method").
- Healers: with the ranged; heal only the tank currently holding him (Ten Ton Hammer). Rotate who heals to spread threat evenly. Priest PW:S on the tank immediately after a Mortal Strike (Warcraft Tavern).
- Whole raid: the room behind you still has armed devices and respawning whelps — stay inside the cleared cubby; anyone who pulls aggro runs to the tank corner and dies there rather than dragging him across the room (Ten Ton Hammer).

## What each role must do and must not do
- Tank:
  1. Back to the corner before he arrives; let the three tanks build 20–30 s of threat before any DPS starts (Warcraft Tavern "DPS starts about 30 seconds after the pull").
  2. Expect Knock Away every 15–30 s: your threat halves and he swings to the next tank. The knocked tank walks straight back in and resumes building threat; the new tank already in position holds him.
  3. Mortal Strike every 25–35 s hits for 5–8k and halves your healing for 5 s: pop Shield Wall / Last Stand / health potion if you are below ~60% when it lands; Demoralizing Shout and Thunder Clap stay up (Millenium).
  4. Never Taunt (immune). Never leave your back open. Never let a cloth wearer stand beside you (Cleave + Blast Wave).
- DPS:
  1. Threat is the whole fight: start slowly, use Feint/Vanish/Feign Death on cooldown, casters use threat-reduction talents, warlocks DoT or wand rather than burst (Warcraft Wiki).
  2. Pause DPS for a few seconds every time Knock Away lands until the next tank is clearly in control (Warcraft Tavern "wave method").
  3. Melee: either stay wedged behind him against the wall or step out of 20 yd for each Blast Wave; never stand in front.
  4. Ranged: stay in the far corner; a Blast Wave at 3000 Fire kills anyone who wanders in.
  5. Below ~20% you can push harder; before that, do not overtake the tanks.
- Healer:
  1. Nothing to dispel on him (MS and Blast Wave slow are undispellable).
  2. Tank takes ~5–8k Mortal Strikes every 25–35 s on top of 15–18k melee; keep him near full going into each MS window and PW:S after it lands.
  3. Rotate healers so no single healer builds threat; rogues bandage themselves.
  4. Watch for the second rogue pair keeping traps disarmed; a re-armed device within 20 yd of healers cuts their cast speed by 80%.

## Timeline of a typical pull
- Pre-pull: clear both suppression rooms (20–40 min), position ranged beside the gate, tanks in the corner, two rogues stealthed on the nearest devices.
- t=0 Tank pulls him into the corner; he yells on aggro. Only tanks build threat.
- t≈8 s first Cleave (then every ~7 s). t≈12 s first Knock Away (then every 15–30 s). t≈20 s first Blast Wave (then every 8–16 s). t≈30 s first Mortal Strike (then every 25–35 s); DPS begins around now.
- Each Knock Away: MT threat halves → OT holds him for ~15–30 s while the MT climbs back → repeat. Over a 4–5 minute fight expect 8–15 swaps.
- Kill at ~916k HP: about 3,000–4,000 raid DPS for a 4–5 minute fight; slow and steady, not a race (Warcraft Tavern).
- On his death the Suppression Devices shut down for the lockout and the gate to Firemaw opens.

## Open questions
- Blast Wave damage: spell base 2625 (classicdb.ch) vs ~3000 quoted by Wowhead; "hefty" per Warcraft Wiki. Radius 20 yd is consistent.
- Knock Away cadence: cmangos 15–30 s after a 12 s opener; Wowhead/Warcraft Wiki say only "occasional". No boss mod ships a timer, so it is not fixed.
- Mortal Strike cadence: cmangos 25–35 s; Warcraft Tavern ~25 s.
- Blast Wave cadence: cmangos 8–16 s; Warcraft Tavern ~10 s.
- Whether Classic Blast Wave is strictly LoS-checked: Wowhead/Icy Veins snippets say melee can LoS it around the corner; spell data is a plain 20 yd AoE. Treat the wall-wedge as the safe plan.
- Knock Away knockback distance: spell data 132 (speed 125) — noticeably farther than Wing Buffet (150 at 250); no yardage published.
- Suppression Device re-arm: cmangos random 30 s–2 min; Warcraft Wiki "variable time". Whelps 30 s is consistent across sources.
