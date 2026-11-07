# Fankriss the Unyielding (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Fankriss_the_Unyielding — Mortal Wound stacking −10% healing, 4 hatchlings per tunnel ×3 tunnels starting shortly after pull then ~once a minute, each spawn teleports/roots a player in an alcove, hatchling damage (300 tank / 800–900 cloth), worms 1–3 at random times, enrage after 20 s for 10–20k hits, worms stunnable, hatchling tanking methods, Safe Spot alcove, huge aggro radius
- https://www.wowhead.com/classic/npc=15510/fankriss-the-unyielding (via r.jina.ai) — HP 4,496,850 ("Seasonal 40 Player"), Mortal Wound 25646, "3 bug tunnels… Vekniss Hatchlings every minute", "Spawn of Fankriss in groups of three", enrage after 20 s
- https://www.wowhead.com/classic/npc=15630/spawn-of-fankriss (via r.jina.ai) — level 63 elite, HP 59,958, Berserk 26662
- https://www.wowhead.com/classic/npc=15962/vekniss-hatchling (via r.jina.ai) — level 60, HP 54,936
- https://www.wowhead.com/classic/spell=25646/mortal-wound (via r.jina.ai) — −10% healing taken per application, 30 s duration, melee range, no dispel type
- https://www.wowhead.com/classic/spell=720/entangle (via r.jina.ai) — teleport + stun, 8 s, used by Fankriss
- https://www.wowhead.com/classic/spell=25832/summon-worm (via r.jina.ai) — summons Spawn of Fankriss (NPC 15630), 1 per cast, 4 min duration
- https://www.wowhead.com/classic/guide/fankriss-the-unyielding-temple-of-ahnqiraj-strategy (via r.jina.ai) — swap on high Mortal Wound stacks, worms alone/2/3, enrage "exactly 20 seconds", Kidney Shot enraged worms, drones piled behind the raid for AoE, Entangle at tunnel mouths, boss faced with back to the main tunnel, pull on mounts
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — swap tanks at 3–5 stacks, one off-tank per spawn point, drones tanked not killed
- https://us.millenium.gg/guide/7179.html?page=4 — swap at 4–6 stacks, Entangle "once every minute", worm kill window 20 s
- https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-fankriss.amp — 404 (not used)
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Fankriss.lua — IDs 25646 / 25832 (+518, 25831) / 720 (+731, 1121); Mortal Wound bar 15 s, warning at 5 stacks; SoD-only worm timer (20 s first, 30 s repeat)
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/Fankriss.lua — Mortal Wound timer 20 s, taunt warning at 5 stacks, Entangle 8 s target timer, hatchling-spawn emote spells 26630/26631/26632

## Overview
- Level ?? boss, Beast (sand reaver). HP 4,496,850 (Wowhead, "Seasonal 40 Player"). No enrage timer documented for the boss itself; the adds enrage. Third required boss, at the end of the long bug tunnel from Sartura's room. Fight room has three small side tunnels ("bug tunnels" / alcoves) plus the main tunnel the raid arrives from.
- Phases: none. Pressure comes from add waves (hatchlings every ~60 s, worms at random) and the healing-reduction stack on the tank.
- Raid-size assumptions: 40-man Classic Era. Season of Discovery has fixed worm timers (BW: 20 s then every 30 s) that do not apply to Era.

## Abilities

### Mortal Wound
- Type: debuff on current tank (melee)
- Target rule: current melee target.
- Cast time: instant (applied by melee). Not interruptible.
- Cadence: unknown; frequent enough that tanks swap every 3–6 stacks.
- Damage: none directly. Debuff: Mortal Wound, −10% healing taken per stack, stacks (no cap found), duration 30 s per Wowhead (BW timer 15 s, DBM 20 s — see Open questions). Not dispellable. Does not spread.
- Telegraph: debuff count on tank frames; BW/DBM warn at 5 stacks and tell the other tank to taunt.

### Entangle
- Type: teleport + root/stun
- Target rule: a random raid member.
- Cast time: instant. Cadence: ~once per minute (Millenium); wiki ties it to each hatchling spawn ("each spawn ports and roots one player in an alcove").
- Effect: the player is teleported to the mouth of one of the three small bug tunnels and held for 8 s (spell: Teleport Units + Stun, 8 s). The hatchlings spawning there attack them.
- Telegraph: none; BW/DBM announce the target.

### Summon Worm (Spawn of Fankriss)
- Type: summon adds
- Rule: summons 1 Spawn of Fankriss per cast; casts come alone, in twos, or threes at random times and random locations (Wowhead guide, wiki). Wiki: "worms come in groups of three, one after another"; the "worm at each HP%" theory is disproven. No fixed timer in Era boss mods.
- Telegraph: none; BW/DBM announce "Summon Worm N" on the summon event.

### Summon Vekniss Hatchlings
- Type: summon adds (timed). 4 hatchlings from each of the 3 tunnels, first shortly after the pull, then about once a minute (wiki, Wowhead NPC page). DBM detects via emote spells 26630–26632.

### Melee
- "Light" on tanks (wiki). The danger is healing reduction, not raw hits.

## Adds
- Spawn of Fankriss ("worm"): level 63 elite, HP 59,958 (Wowhead). 1–3 at a time, random timing/location (sometimes inside the Suppression Room entrance, pulling extra packs). Hits cloth ~2,000. Exactly 20 s after spawning it casts Berserk (26662) and one-shots (10–20k per hit). Stunnable (Kidney Shot, Hammer of Justice). Must be killed within 20 s; a designated "snake" intercept tank + hunters' Distracting Shot pick them up, melee swap instantly.
- Vekniss Hatchling: level 60, HP 54,936 (Wowhead). 4 per tunnel per wave, 3 tunnels, every ~60 s. 300 per hit on tanks, 800–900 on cloth; four on a T2 tank ≈1k per hit. Can be snared/feared but not Frost Nova'd (wiki). Either one off-tank per tunnel (with 2 healers) holds them with Demoralizing Shout/Thunder Clap, or everything is piled on one Battle-Shouting tank behind the raid and AoE'd on call. They do not despawn.
- ~8 Vekniss Drones already in the room engage on pull (post-2.0 note on wiki; pick up with the hatchling tanks).

## Positioning and movement
- Tank: MT and a second MT (two of the "weakest" tanks are enough per wiki) hold Fankriss at the end of the main tunnel with his back to the tunnel so the raid stands in/at the tunnel mouth behind him. Swap by taunt when stacks reach 3–6; the stacked tank waits behind the boss until Mortal Wound falls off (30 s). Three hatchling off-tanks, one at each small tunnel mouth, or one pile tank. One or two Intercept-ready warriors (Berserker Stance) for worms.
- Melee DPS: on the boss, ready to swap to any worm within seconds; rogues hold Kidney Shot for enraged worms.
- Ranged DPS: in the main tunnel mouth, in range of the boss and of the hatchling pile; mages/warlocks AoE the pile on the tank's call and switch to worms on spawn.
- Healers: 2 per MT, 2 per hatchling tank; watch the Entangled player (they take hatchling hits for 8 s at the tunnel mouth); track Mortal Wound stacks and move heals to the new tank after a swap.
- Whole raid: the Safe Spot (left alcove at the end of the approach tunnel) is where you rebuff; moving a few yards past it pulls the boss. Pull on mounts with tanks ahead. Do not AoE hatchlings while a worm is alive unless the tanks have it.

## What each role must do and must not do
- Tank:
  1. Charge in first; face Fankriss with his back to the raid's tunnel.
  2. Taunt swap at 3–6 Mortal Wound stacks (DBM/BW at 5); never let one tank sit at 7+.
  3. Hatchling tanks stay at their tunnel and grab each wave (every ~60 s); AoE-taunt stray drones at the start.
  4. Worm tanks Intercept each Spawn immediately; stun it if it reaches 20 s alive.
  5. Never move the boss into the hatchling pile.
- DPS:
  1. Worms are priority one from the moment they spawn; 20 s hard limit.
  2. Save burst/stun cooldowns for worms, not the boss.
  3. AoE hatchlings only on the tank's call (ideally after three worms have died).
  4. Rogues: Kidney Shot an enraged worm.
- Healer:
  1. Nothing to dispel.
  2. Spike damage: Entangled players (8 s in a tunnel mouth), anyone an enraged worm reaches, hatchling tanks on each wave.
  3. Pre-heal the fresh tank at each swap; expect −50% healing on a 5-stack tank.

## Timeline of a typical pull
- t=0: tanks charge; raid settles in the tunnel mouth; room drones engage.
- t≈+few s: first hatchling wave (4 per tunnel); Entangle takes a random player to a tunnel mouth for 8 s.
- t≈60 s, 120 s, 180 s…: further hatchling waves (and Entangles).
- Random: worms in groups of 1–3; each has a 20 s kill timer before Berserk.
- Every 3–6 stacks: tank swap; stacks fall off after 30 s.
- Fight length is set by raid DPS; a longer fight only adds hatchling waves and more worm rolls.

## Open questions
- Mortal Wound duration: 30 s (Wowhead spell) vs 20 s (DBM timer) vs 15 s (BigWigs bar).
- Swap threshold: 3–5 (Warcraft Tavern), 4–6 (Millenium), 5 (BW/DBM warning).
- Worm cadence: random (wiki, Wowhead guide) — no Era timer; "groups of three" (Wowhead NPC page) vs "alone, two or three" (Wowhead guide). SoD-only: 20 s then 30 s.
- Entangle cadence: ~60 s (Millenium) vs "one per hatchling spawn" (wiki).
- Hatchling/worm HP are "Seasonal 40 Player" values on Wowhead (59,958 / 54,936); the wiki quotes worms hitting cloth ~2,000 and no HP.
- Whether Entangle (720/731/1121) is cast on the hatchling spawn or independently.
