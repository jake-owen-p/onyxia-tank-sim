# Ayamiss the Hunter (Ruins of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Ayamiss_the_Hunter — Stinger Spray 1000 Nature to the raid ~every 30 s, Poison Stinger 25/s stacking to 100 on the top-threat player while flying, ~20 swarmers that descend together (~60 to cloth, very low HP), Paralyze pulls a player to the altar and spawns a larva that kills them and spawns an elite (Hive'Zara Buzzer), lands at 70% with a complete aggro wipe, immune to taunt, keep stacks under 20, caster-tank option, tank spot on the altar.
- https://www.wowhead.com/classic/guide/ayamiss-the-hunter-ruins-of-ahnqiraj-strategy (fetched through r.jina.ai) — Poison Stinger 10 s DoT stacking to 100 on top threat, removed in P2; Stinger Spray ~1000 Nature every ~30 s; Paralyze + larva (cannot be slowed or CC'd); swarmers; threat wipe at 70%; mage/warlock airborne tanks; melee at the altar; Nature Resistance, Aspect of the Wild, Nature Resistance Totem.
- https://www.wowhead.com/classic/npc=15369/ayamiss-the-hunter (fetched through r.jina.ai) — Health 1,149,195 ("SoM 20 Player"), 6 abilities, "melee kill 2 Larvae that spawn when a player is sacrificed", lands at 70%.
- https://www.warcrafttavern.com/wow-classic/guides/ruins-of-ahnqiraj-aq20/ — targets highest-threat ranged/caster in P1, swap before stacks get high, sacrifice spawns a powerful add if the larva reaches the target, swarmers hit hard but die to AoE, nature resistance strongly recommended.
- https://www.tentonhammer.com/guides/tentonhammers-guide-to-the-ruins-of-ahn-qiraj-section-2-5 — Poison Spray ~1000 every 30 s, Poison Stinger 25/s stacking, Paralyze every ~30 s, swarms every 20-30 s, aggro rotation never past 10 DoTs (250/s), alternate 100%/50% DPS for 10 s, ~200 NR guess for a caster tank, P2 tanking and paralysis handling.
- https://us.millenium.gg/guide/6975.html?page=3 — ability list (Poison Stinger, Lash, Enrage, Stinger Spray, Paralyze, Thrash), lands at 70%, tank on top of the altar, larvae come from left and right, dead paralyzed player spawns an elite that must be tanked away.
- https://wotlkdb.com/?spell=25749 — Stinger Spray: 875-1125 Nature, 100 yd radius, instant.
- https://wotlkdb.com/?spell=25748 — Poison Stinger: 2 s cast, 875-1125 Nature on hit + 25 Nature per 1 s for 10 s.
- https://wotlkdb.com/?spell=25725 — Paralyze: teleport + stun, 10 s.
- https://wotlkdb.com/?spell=25721 — Feed: instakill + summon Hive'Zara Hornet (NPC 15934).
- https://wotlkdb.com/?spell=25852 — Lash: 2 s stun + Dropped Weapon (6608), 5 yd.
- https://wotlkdb.com/?spell=8269 — Frenzy: +60% melee haste, +50 (+2/level) flat damage, 2 min.
- https://wotlkdb.com/?spell=3391 — Thrash: 2 extra attacks.
- https://warcraft.wiki.gg/wiki/Hive%27Zara_Larva — level 30, spawns during the fight; if it reaches the altar player, they die and a Hive'Zara Buzzer spawns.
- https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/Kalimdor/RuinsOfAhnQiraj/boss_ayamiss.cpp (raw fetched) — Stinger Spray 20-30 s then every 15-20 s; Poison Stinger 5 s then every 2-3 s on the victim (air only); Summon Swarmer 5 s then every 2.4-3.6 s up to 28 swarmers, then they swarm; Paralyze 15-28 s then repeats (random player, larva from side A or B walks to the altar and casts Feed); land at 70% with threat reset; Lash 5-8 s / 8-15 s and Thrash 16 s after landing; Frenzy at 20%.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_ayamiss.cpp (raw fetched) — Stinger Spray 20-30 s / 15-20 s; Poison Stinger 5 s / 2-3 s (air) and 6-12 s (ground); Paralyze 15 s / 15 s preferring a ranged player; Summon Swarmer 5 s / 5 s with all swarmers attacking every 60 s; Lash 5-8 s / 8-15 s; Thrash 3-6 s / 5-7 s in P2; Frenzy below 20%; larva walks (does not run) and fixates the paralyzed target; Hornet NPC 15934.

## Overview
- Level ?? (boss), Silithid wasp (Beast). Health: Wowhead Classic 1,149,195 labelled "SoM 20 Player"; no Era value found. No enrage timer; Frenzy at 20% HP. Fifth boss, The Comb, optional; Icy Veins and Warcraft Tavern consider her the hardest fight in AQ20. Immune to Taunt (wiki, TenTonHammer).
- Phases: Phase 1 (air) from 100% to 70%: she hovers above the altar, cannot be meleed, uses Poison Stinger on her top-threat target, Stinger Spray on the raid, Paralyze + larva, and summons swarmers. Phase 2 (ground) below 70%: she lands, wipes threat, Poison Stinger stops, Lash and Thrash begin; Paralyze, Stinger Spray and swarmers continue. Frenzy at 20%.
- Raid-size assumptions: 20-man Classic Era. Nature resistance gear/buffs recommended; a caster "tank" (mage/warlock/hunter with NR) for Phase 1.

## Abilities

### Poison Stinger (Phase 1 only)
- Type: targeted debuff (ranged DoT) on the top-threat player.
- Target rule: the person at the top of threat (wiki, Wowhead guide, TenTonHammer); in P1 this is always a ranged/caster since melee cannot reach her.
- Cast time: 2 s (wotlkdb); interruptible: unknown (no source).
- Cadence: 5 s after pull, then every 2-3 s (both emulators). This is why stacks climb so fast.
- Damage: 875-1125 Nature on hit (wotlkdb; guides do not mention the direct hit) plus a DoT of 25 Nature per second per stack for 10 s, refreshed on each application, stacking to 100 (wiki, Wowhead guide). 10 stacks = 250/s (TenTonHammer); wiki says never go above 20 stacks.
- Debuff: Poison Stinger, 10 s, Nature; dispel type: none found on the spell data (listed n/a), so treat as not dispellable (no guide suggests dispelling it; the counter is threat swapping and Nature Resistance).
- Telegraph: the debuff stack count on the current "tank".

### Stinger Spray
- Type: AoE (room).
- Target rule: all players (100 yd radius).
- Cast time: instant.
- Cadence: ~every 30 s (wiki, Wowhead guide, TenTonHammer); emulators 20-30 s first then every 15-20 s.
- Damage: 875-1125 Nature (wotlkdb), "about 1000" (guides); a combat-log snippet found via search shows 537 after resistance. Reduced by Nature Resistance.
- Telegraph: none; budget for ~1000 raid damage every 15-30 s.

### Paralyze (the sacrifice)
- Type: teleport + stun + summon add.
- Target rule: random player (CMaNGOS prefers a ranged player; AzerothCore any random player). Can hit the tank in P2 (TenTonHammer, wiki).
- Cast time: instant.
- Cadence: every ~30 s (TenTonHammer); emulators 15-28 s first then every ~15 s. Wowhead NPC page says "2 Larvae" per sacrifice; wiki says one larva from the left or right.
- Effect: the player is teleported onto the altar and stunned for 10 s (wotlkdb 25725; Physical, no dispel type listed). A Hive'Zara Larva spawns at the base of the altar (left or right side) and walks to the player; on arrival it casts Feed: the player dies instantly and a Hive'Zara Hornet (NPC 15934; wiki calls it Hive'Zara Buzzer) elite spawns.
- Movement effect: teleport to the altar centre; stun 10 s.
- Telegraph: a green streak/beam to the altar (wiki) and the player appearing on the altar; the larva is visible walking in.

### Summon Swarmer
- Type: summon adds.
- Target rule: self / air.
- Cadence: starts ~5 s in; one swarmer every 2.4-3.6 s up to 28 (AzerothCore) or every 5 s (CMaNGOS); the swarm descends on the raid as a group every ~60 s (CMaNGOS) / when 28 exist (AzerothCore). Guides: swarms every 20-30 s (TenTonHammer), "about 20 wasps" (wiki).
- Damage: ~60 per hit on cloth (wiki); Warcraft Tavern says they "hit hard" in numbers; very low HP, die to any AoE.

### Lash (Phase 2)
- Type: melee cone / targeted stun on the tank.
- Target rule: current tank. Cadence: 5-8 s after landing, then every 8-15 s (both emulators).
- Effect: 2 s stun and "Dropped Weapon" (disarm-like) for the tank (wotlkdb 25852), Physical.

### Thrash (Phase 2)
- 2 extra melee attacks; every ~5-7 s (CMaNGOS) or 16 s (AzerothCore).

### Frenzy
- Type: enrage at 20% HP (both emulators; Millenium lists "Enrage"). +60% melee haste, +~170 flat damage (50 + 2/level at level 60), 2 min. No live-guide confirmation of the threshold.

### Landing (70%)
- At 70% she lands near the altar, threat is completely reset (wiki, Wowhead guide), Poison Stinger stops, melee can attack. Stop DPS until the tank has her.

## Adds
- Hive'Zara Larva (NPC 15555, level 30): one (wiki) or two (Wowhead NPC blurb) per Paralyze, spawning at the left or right base of the altar; walks (CMaNGOS: walk, not run) straight to the paralyzed player; cannot be slowed, rooted, stunned or CC'd (wiki, Wowhead guide); very fast per wiki. HP not found but guides say melee kill it quickly. If it arrives it casts Feed: player dies, Hornet spawns. Dies when killed; despawns if it has nothing to eat (unknown).
- Hive'Zara Hornet / Buzzer (NPC 15934): elite wasp spawned by a successful Feed; must be tanked away from the raid (Millenium) and killed; abilities/HP not found. Avoidable entirely by killing larvae.
- Hive'Zara Swarmer (NPC 15546): ~20-28 small wasps gather in the air and descend together every ~60 s (or when the count is reached); ~60 damage per hit, trivial HP; AoE them when they land. The off-tank or melee picks them up (Warcraft Tavern).

## Positioning and movement
- Tank: Phase 1 has no melee tank; a caster/hunter with Nature Resistance holds threat (mage with Power Infusion, warlock with felhunter, hunter per wiki/TenTonHammer), and the raid rotates threat so no one passes ~10-20 Poison Stinger stacks. Warriors stand at the altar base with melee. Phase 2: when she lands, the warrior tank builds threat before anyone attacks (threat is zero), then tanks her on top of the altar with his back to the mountain wall (wiki) or anywhere near the altar (Wowhead guide) so melee can switch to larvae in two steps. A second warrior builds threat as backup for when the tank is Paralyzed (TenTonHammer, Warcraft Tavern). Never drag her far from the altar.
- Melee DPS: Phase 1 at the base of the altar, split left/right to cover both larva spawn sides; kill the larva the instant it appears, otherwise kill swarmers and throw/shoot at her. Phase 2: on her, but the larva always has priority.
- Ranged DPS: Phase 1 grouped at the back at max range (wiki) so the top-threat player can be swapped cleanly; watch your own stack count and ease off (50% for 10 s) when it climbs; switch to the larva whenever someone is on the altar. Phase 2: stop at landing until the tank has threat, then resume; spread enough that a swarm landing does not hit everyone.
- Healers: at range with line of sight to the altar and to the current Poison Stinger target; the stinger target takes 25 x stacks per second plus ~1000 on each hit; Stinger Spray costs ~1000 raid-wide every 15-30 s. Nothing to dispel (no dispellable debuff was found).
- Whole raid: the altar is the fixed point; the larva path (base of altar -> top) is the only "lane" to keep clear.

## What each role must do and must not do
- Tank (Phase 2 warrior):
  1. On landing, build threat for several seconds before DPS starts (complete reset).
  2. Tank her on/near the altar; back to the wall.
  3. If you are Paralyzed, the second tank takes over; call it.
  4. Expect Lash (2 s stun + weapon drop) every 8-15 s; do not rely on shield block uptime.
  5. Pick up swarmers when they descend; pick up a Hornet if a sacrifice succeeds and drag it away from the raid.
- DPS:
  1. Phase 1: manage Poison Stinger threat; never exceed ~10-20 stacks; alternate full and half output every 10 s (TenTonHammer) or pass threat deliberately.
  2. The larva is always the top priority; melee kill it before it reaches the altar top.
  3. AoE swarmers as they land.
  4. Stop DPS at the 70% landing until the tank has her.
  5. Burn at 20% (Frenzy) with cooldowns.
- Healer:
  1. Keep the current Poison Stinger target alive; the DoT is the main P1 damage.
  2. Pre-heal the raid before each Stinger Spray (~1000 every 15-30 s).
  3. Heal the Paralyzed player on the altar (they cannot move for 10 s and larvae/swarmers may hit them).
  4. Nature Resistance Totem / Aspect of the Wild assigned to the raid; NR gear on the P1 caster-tank.

## Timeline of a typical pull
- t=0: ranged pull; she rises above the altar. Melee move to the altar base, split left/right.
- t=5 s: first Poison Stinger on the top-threat caster, then every 2-3 s; first swarmers start gathering in the air.
- t=15-28 s: first Paralyze: a random player is teleported to the altar, a larva spawns at the side and walks up; melee kill it. Repeats every ~15-30 s all fight.
- t=20-30 s: first Stinger Spray (~1000 to the raid), then every 15-30 s.
- t=~60 s: first swarm descends (~20-28 wasps); AoE them.
- 70%: she lands, threat wiped; tank builds threat; Lash within 5-8 s then every 8-15 s; Thrash begins; Poison Stinger stops.
- 20%: Frenzy; burn.
- Guides describe the fight as long; no kill time was found, expect 6-10 minutes in ZG/MC gear.

## Open questions
- Classic Era 20-man HP: only "SoM 20 Player" 1,149,195 readable.
- Larvae per Paralyze: 1 (wiki, emulators) vs 2 (Wowhead NPC blurb).
- Larva speed: "moves very fast" (wiki) vs walks (CMaNGOS). Larva HP unknown.
- Paralyze cadence: ~30 s (TenTonHammer) vs ~15 s (CMaNGOS) vs 15-28 s then unspecified repeat (AzerothCore).
- Stinger Spray cadence: ~30 s (guides) vs 15-20 s (emulators).
- Whether Poison Stinger has a 875-1125 direct hit (wotlkdb) in Classic; guides only describe the 25/s DoT.
- Swarm behaviour: 28-count trigger (AzerothCore) vs 60 s timer (CMaNGOS) vs 20-30 s (TenTonHammer).
- Frenzy at 20% appears only in emulators and Millenium's ability list.
- Whether the Hornet is "Hive'Zara Buzzer" (wiki) or "Hive'Zara Hornet" (spell data, CMaNGOS); its abilities and HP.
- Whether Poison Stinger can be interrupted (2 s cast in spell data).
