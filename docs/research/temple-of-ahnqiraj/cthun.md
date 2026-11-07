# C'Thun (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/C'Thun_(tactics) — Eye Beam 2,625–3,375 Nature every 3 s / 2 s cast / chains within ~10 yd at 1.5x per jump, Dark Glare 43,750–56,250 Shadow every 85 s sweeping 180° over 35 s and piercing pillars, ~50 s beams / 35 s glare rhythm, 8 Eye Tentacles every 45 s (2,289 HP, Mind Flay 750/s 10 s 30% snare, 10 yd knockback), Claw Tentacles (1,526 HP, Ground Rupture 2,250–2,750 in 15 yd, Hamstring), Carapace 99%, Devour every 10 s, Eye Tentacles every 30 s in P2, Giant Claw (91,560 HP, 1/min, Ground Tremor 2 s stun, Thrash, burrows if no melee), Giant Eye (36,624 HP, 1/min offset 30 s), Digestive Acid 150/5 s stacking, 2 Flesh Tentacles 24,416 HP, exit circle, Weakened 45 s with Giant Claw ~10 s after, 5 min stomach reset (2012), hunter soak at pull
- https://warcraft.wiki.gg/wiki/C%27Thun — NPC list for the encounter, patch 1.10 changes (Digestive Acid ramps, giant tentacle knockback lowered), 2020 Classic hotfix on Eye Beam delay
- https://www.wowhead.com/classic/npc=15589/eye-of-cthun and /npc=15727/cthun (via r.jina.ai) — HP 4,996,500 (Eye) and 6,328,900 (C'Thun), "Seasonal 40 Player"; Eye Beam 26134
- https://www.wowhead.com/classic/npc=15725/claw-tentacle , /npc=15726/eye-tentacle , /npc=15728/giant-claw-tentacle , /npc=15334/giant-eye-tentacle , /npc=15802/flesh-tentacle (via r.jina.ai) — level 60; HP 6,104 / 7,935 / 183,120 / 109,872 / 27,468 (Seasonal 40); ability IDs (Ground Rupture 26139/26478, Hamstring 26141/26211, Ground Tremor 6524, Thrash 3391, Acid Spray 26419, Birth 26586)
- https://www.wowhead.com/classic/spell=26134/eye-beam (via r.jina.ai) — 2,625 Nature base, 2 s cast, unlimited range, used by Eye of C'Thun / C'Thun / Giant Eye Tentacle
- https://www.wowhead.com/classic/spell=26029/dark-glare (via r.jina.ai) — 43,750 Shadow base, 100 yd radius, instant
- https://www.wowhead.com/classic/spell=26476/digestive-acid (via r.jina.ai) — 150 Nature every 5 s, debuff, persists through death
- https://www.wowhead.com/classic/spell=26143/mind-flay (via r.jina.ai) — 750 Shadow per second for 10 s, speed reduced to 30%, channelled
- https://www.wowhead.com/classic/spell=26139/ground-rupture (via r.jina.ai) — 1,350 Physical + knockback in 10 yd (Claw/Eye Tentacles)
- https://www.wowhead.com/classic/spell=26141/hamstring (via r.jina.ai) — weapon +263–337, −70% speed 10 s (Claw Tentacle)
- https://www.wowhead.com/classic/guide/cthun-temple-of-ahnqiraj-strategy (via r.jina.ai) — Eye Beam doubles per bounce, Dark Glare instant kill rotating either way, tentacle priorities, Giant Claw spawns at the entrance at P2 start and after each Weakened, Digestive Acid leave at ~10 stacks, exit pad between the Flesh Tentacles, hunter pull with Feign Death
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — 8 groups of 5 spread 10 yd apart, Eye Beam ~3,000 every 3 s, Eye Tentacles every 45 s, Claw Ground Rupture ~1,500, Dark Glare every 90 s sweeping 180° (run counter-clockwise), P2 priorities, Digestive Acid 150/5 s leave before 10, Weakened 45 s, no enrage
- https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-cthun — Dark Glare "50k", Eye Beam 2,500–3,400 doubling, Eye Tentacles every 45 s, Claw ~1,500 knockback, weakened "about 40 s", 2006 positioning
- https://us.millenium.gg/guide/7179.html?page=7 — Eye Beam every 3 s, red glow before Dark Glare, 8 groups rotate to the diagonally opposite spot (Group 1→5 etc.), warrior enters first, Weakened 45 s
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Cthun.lua — first Dark Glare 48 s after engage, every 86 s, 40 s duration; Claw Tentacle every 8 s; Eye Tentacles 45 s (P1) / 30 s (P2); after Eye death: Giant Claw 12.3 s, Eye Tentacles 41.3 s, Giant Eye 43.1 s, then 60 s each; after Weakened: Giant Claw 51 s, Eye Tentacles 81 s, Giant Eye 82 s; Weakened 45 s; Digestive Acid warning at 6 stacks
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/CThun.lua — Dark Glare 48 s then 86 s, 39 s active; Claw 8 s; Eye Tentacles 45/30 s; P2 start: Giant Claw 10.5 s, Eye Tentacles 40.5 s, Giant Eye 41.3 s; after Weakened: Giant Claw 53 s, Eye Tentacles 83 s, Giant Eye 83.7 s; Weakened 45 s; Claw Tentacles never spawn in P2; wipe detection 25 s

## Overview
- Final required boss. Phase 1 target: Eye of C'Thun, level ?? boss, HP 4,996,500 (Wowhead, "Seasonal 40 Player"). Phase 2 target: C'Thun, HP 6,328,900, protected by Carapace of C'Thun (99% damage reduction) except during 45 s Weakened windows. No enrage timer (Tavern) — fight length is set by how many Weakened windows you need.
- Room: a large circular chamber with pillars around the edge and the Eye in the centre; the Stomach is a separate acid pool with three small islands reached by being Devoured.
- Phases: P1 from engage until the Eye dies (Eye Beam every 3 s alternating with 35–40 s Dark Glare sweeps every ~86 s; Claw Tentacles every 8 s; 8 Eye Tentacles every 45 s). P2 begins on the Eye's death: Giant Claw Tentacle and Giant Eye Tentacle every 60 s each (offset ~30 s), 8 Eye Tentacles every 30 s, a player Devoured about every 10 s; killing both Flesh Tentacles in the stomach removes the Carapace for 45 s (no spawns during it), after which the stomach tentacles respawn and the cycle repeats.
- Raid-size assumptions: 40-man Classic Era. SoD has shorter giant-tentacle timers (50/35 s) — ignore. Classic Era C'Thun is the post-1.10 ("nerfed") version; Season of Mastery restored the pre-nerf one.

## Abilities

### Eye Beam (Phase 1 — Eye of C'Thun; Phase 2 — Giant Eye Tentacle)
- Type: targeted + chain
- Target rule: a random player (unlimited range; the 2020 Classic hotfix removed an engage delay). Chains to players within ~10 yd of the previous target; each jump multiplies damage by 1.5 (wiki) or "doubles" (Wowhead guide, Tavern, TTH).
- Cast time: 2 s; not interruptible.
- Cadence: every 3 s when not Dark Glaring (≈50 s of beams per cycle).
- Damage: 2,625–3,375 Nature on the first target; fully resistible (binary).
- Telegraph: boss-mod target icon/say; the Eye turns to the target.

### Dark Glare (Phase 1)
- Type: frontal beam sweep (room-wide cone)
- Target rule: starts at the Eye's current target's direction and sweeps 180° either clockwise or counter-clockwise over the glare duration; hits everything in the beam out to 100 yd; passes through pillars (no LoS).
- Cast time: the Eye glows red / turns before firing (Millenium); BW/DBM warn 5 s before.
- Cadence: first at 48 s after engage, then every 86 s (BW/DBM); wiki 85 s; Tavern 90 s. Duration 40 s (BW) / 39 s (DBM) / 35 s (wiki).
- Damage: 43,750–56,250 Shadow per tick — lethal; even at 75% resist the minimum is 10,938 (wiki).
- Telegraph: red glow, 5 s boss-mod warning; the raid pre-plans the rotation direction.

### Summon Claw Tentacle (Phase 1 only)
- Type: summon add (ground). A Claw Tentacle erupts under a random player every 8 s (BW/DBM). On spawn: Ground Rupture (26139) 1,350 Physical + knockback in 10 yd (wiki: 2,250–2,750 Nature in 15 yd; Tavern ~1,500); then melees ~200 and Hamstrings (weapon +263–337, −70% speed for 10 s). Does not spawn in P2 (DBM).

### Summon Eye Tentacles
- Type: summon adds. 8 Eye Tentacles in a ring at the edge of the dark expanse every 45 s in P1, every 30 s in P2 (BW/DBM/wiki). Each knocks back players within 10 yd of its spawn point and channels Mind Flay: 750 Shadow/s for 10 s, movement reduced to 30%, must be interrupted/killed.

### Carapace of C'Thun (Phase 2)
- Type: other. −99% damage taken. Removed for 45 s when both Flesh Tentacles die.

### Devour (Phase 2)
- Type: other. About every 10 s (wiki) a random player is swallowed into the Stomach: pacified, dropped into acid; Digestive Acid applied.

### Digestive Acid (Stomach)
- Type: debuff. 150 Nature every 5 s per stack; every tick adds a stack (5 stacks at 20 s), stacks indefinitely; cannot be dispelled; persists through death. Leave before ~10 stacks (Wowhead guide/Tavern); BW warns at 6. Exit by standing exactly in the centre of the dark circle on one of the three islands (between the two Flesh Tentacles) — being off-centre launches you into the wall and kills you. Post-2012 hotfix: 5 min inside resets the encounter.

### Giant Claw Tentacle (Phase 2)
- Type: summon add. First at ~10.5–12.3 s after the Eye dies (near the entrance per Wowhead guide; "at a random player's feet" per wiki), then every 60 s; after a Weakened window, ~51–53 s later. HP 183,120 (Wowhead Seasonal; wiki 91,560). Ground Rupture (26478, Nature) on spawn, Ground Tremor (2 s stun to nearby), Hamstring, Thrash (two extra attacks — can one-shot non-tanks). If nobody is in melee range it burrows and re-emerges on a new target at full HP. Needs a tank.

### Giant Eye Tentacle (Phase 2)
- Type: summon add. First at ~41.3–43.1 s after the Eye dies, then every 60 s (offset ~30 s from the Giant Claw); after Weakened, ~82–83.7 s later. HP 109,872 (Wowhead Seasonal; wiki 36,624). Ground Rupture on spawn, then Eye Beam (2,625–3,375, chaining) repeatedly. Can be stunned and silenced — stunlock and kill first.

### Weakened (Phase 2)
- Type: other. When both Flesh Tentacles die C'Thun loses the Carapace for 45 s (Millenium/Tavern/BW/DBM; TTH "about 40 s"); no tentacles spawn during it; a Giant Claw Tentacle appears ~10 s after it ends (wiki) — BW/DBM: 51–53 s after the Weakened start. Flesh Tentacles respawn when it ends.

## Adds
- Claw Tentacle (P1): under a random player every 8 s; HP 6,104 (Seasonal) / 1,526 (wiki); Ground Rupture 1,350 + knockback 10 yd, Hamstring, ~200 melee; killed by the nearby group (casters first); despawns with its ground spot on death.
- Eye Tentacle: 8 every 45 s (P1) / 30 s (P2) in a fixed ring; HP 7,935 (Seasonal) / 2,289 (wiki); 10 yd knockback on spawn; Mind Flay 750/s 10 s; one small team per spawn spot kills it instantly (highest priority in both phases).
- Giant Claw Tentacle (P2): every 60 s; HP 183,120 / 91,560; tanked; lowest priority but must die before the next one.
- Giant Eye Tentacle (P2): every 60 s offset; HP 109,872 / 36,624; stun/silence and kill second.
- Flesh Tentacle ×2 (Stomach): HP 27,468 (Seasonal) / 24,416 (wiki); melee only (Acid Spray 26419 listed), so casters DPS them from range; both must die for Weakened; they respawn after Weakened ends.
- Devoured players: not adds, but the stomach team is whoever got eaten; tanks leave immediately, healers top the stomach then leave, DPS stay to ~10 stacks.

## Positioning and movement
- Tank: no boss to tank in P1 — tanks are group members on their spot and pick up Claw Tentacles that spawn near them. In P2, tanks grab each Giant Claw Tentacle immediately (it burrows and re-emerges if left), standing where the stun/Thrash hit only them; a Devoured tank exits the stomach at once to be available.
- Melee DPS: assigned to a fixed spot in the ring (8 groups of 5 around the room, Tavern/Millenium); kill the Eye Tentacle that spawns at their spot, then Claws nearby, then the Eye/Giant tentacles. In P2 melee who get Devoured should leave the stomach quickly; casters are the preferred stomach team (Flesh Tentacles only melee).
- Ranged DPS: on their spot, ≥10 yd from every other player (Eye Beam chain radius); kill Claw Tentacles (Ground Rupture reaches 10–15 yd) and Eye Tentacles; casters eaten by Devour stay and kill Flesh Tentacles.
- Healers: two per group of 5; stay 10 yd from everyone; a healer eaten tops the stomach party then exits before high stacks.
- Whole raid: the room is divided into 8 equal arcs; every player is ≥10 yd from every other. Dark Glare: the groups in the starting arc move with the rotation (counter-clockwise per Tavern; Millenium: each group runs to the diagonally opposite spot, 1→5, 2→6, …) and everyone returns to their spot afterwards. Keep ≥10 yd from the Eye Tentacle ring spots to dodge the spawn knockback. Pull: a hunter in Nature-resist gear + Greater Nature Protection Potion runs in alone, eats the first Eye Beams, Feigns Death, then the raid enters on mounts to their spots (Millenium: pairs ride to each corner).

## What each role must do and must not do
- Tank:
  1. P1: hold your spot; pick up a Claw Tentacle only if it spawns at your group.
  2. P2: taunt every Giant Claw Tentacle within seconds; never let one go unmeleed (burrows, full HP).
  3. If Devoured: exit immediately via the circle.
  4. Never cluster with another player (chain beam).
- DPS:
  1. Priorities P1: Eye Tentacles > Claw Tentacles > Eye of C'Thun. P2: Eye Tentacles > Giant Eye Tentacle (stun/silence it) > Giant Claw Tentacle; C'Thun himself only during Weakened.
  2. During Weakened: finish any Eye/Giant Eye Tentacles first (they keep beaming a stacked raid), then everything on C'Thun; a live Giant Claw can be ignored (Tavern).
  3. Stomach: casters kill both Flesh Tentacles; coordinate the second kill so the surface is clear of tentacles; leave by ~10 Digestive Acid stacks via the exact centre of the circle.
  4. Interrupt Mind Flay / kill the tentacle channelling it.
  5. Never move toward another group during Dark Glare; rotate with your group.
- Healer:
  1. Nothing dispellable (Digestive Acid, Hamstring, Mind Flay snare cannot be removed).
  2. Spike damage: beam chains if two people are within 10 yd (2,625 → ~4,000 → ~6,000), Ground Rupture victims, Mind Flay targets (750/s), Giant Claw's tank (Thrash), everyone in the stomach (acid ramps).
  3. Pre-heal before each Eye Tentacle wave (knockback + Mind Flay); heal the stomach party before exiting.

## Timeline of a typical pull
- t=0: hunter soaks the first beams; raid takes positions (8 arcs, 10 yd spacing). Eye Beam every 3 s on random targets.
- t=8 s, 16 s, 24 s…: Claw Tentacles under random players (every 8 s).
- t=45 s: 8 Eye Tentacles (ring); repeat every 45 s.
- t=48 s: first Dark Glare, sweeping 180° for ~40 s; groups rotate; beams resume ~t=88 s.
- t≈134 s, 220 s, 306 s…: Dark Glare every 86 s (≈46–50 s of beams between).
- Eye dies (DPS dependent, typically 3–5 min): Phase 2. +10.5–12.3 s Giant Claw (entrance); +40.5–41.3 s 8 Eye Tentacles (then every 30 s); +41.3–43.1 s Giant Eye (then every 60 s each giant, offset ~30 s). A player is Devoured ~every 10 s from the start of P2.
- Stomach team kills both Flesh Tentacles (timed to a clean surface): Weakened 45 s — burn C'Thun; no spawns.
- Weakened ends: Giant Claw at +51–53 s, Eye Tentacles at +81–83 s, Giant Eye at +82–84 s after the Weakened start; Flesh Tentacles respawn; repeat (2–3 Weakened windows for a typical raid).

## Open questions
- Eye Beam chain factor: 1.5x per jump (wiki) vs "doubles" (Wowhead guide, Tavern, TTH). Jump radius "roughly 10 yd" (wiki) — the raid rule is 10 yd spacing.
- Dark Glare: 86 s interval (BW/DBM) vs 85 s (wiki) vs 90 s (Tavern); duration 40 s (BW) / 39 s (DBM) / 35 s (wiki); damage 43,750–56,250 (wiki) vs "50k" (TTH) vs "instant kill" (guides).
- Claw Tentacle Ground Rupture: 1,350 Physical / 10 yd (spell 26139) vs 2,250–2,750 Nature / 15 yd (wiki) vs ~1,500 (Tavern). Giant Claw spawn location: entrance (Wowhead guide) vs random player (wiki).
- Tentacle HP: Wowhead "Seasonal 40 Player" (Claw 6,104; Eye 7,935; Giant Claw 183,120; Giant Eye 109,872; Flesh 27,468) vs wiki vanilla (1,526; 2,289; 91,560; 36,624; 24,416) — roughly a 2x gap on the giants.
- Weakened duration: 45 s (wiki, Tavern, Millenium, BW/DBM) vs "about 40 s" (TTH).
- Devour cadence: "every 10 s" (wiki only). Digestive Acid tick interval 5 s (spell/wiki) vs "every 3 s" (Millenium).
- Phase-2 Giant Claw first spawn: 12.3 s (BW) vs 10.5 s (DBM); post-Weakened timers differ by ~2 s between the two mods.
