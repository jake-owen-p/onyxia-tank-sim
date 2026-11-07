# Ouro (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Ouro — Sweep 1k–2.5k + knockback and aggro side-effects, Sand Blast 3.5k–4.5k Nature 180° cone 45 yd every 20–25 s targeting top threat and clearing their threat, submerge ~every 1.5 min or when nobody in melee range, Ground Rupture 2k on emerge, Dirt Mound Quake ~1,000 at 200 NR, Scarabs 300 cloth / 40–150 tanks despawn 45 s, Phase 2 at 20% (+150% speed, +100% damage, no submerge, Boulder ~6,000 if no melee), ~400k HP at 20%, 10 s to get a tank on him, 3 groups 120° apart
- https://www.wowhead.com/classic/npc=15517/ouro (via r.jina.ai) — HP 5,889,208 ("Seasonal 40 Player"), Sand Blast 26102 "every 20 to 25 seconds", scarabs despawn 45 s, enrage at 20%
- https://www.wowhead.com/classic/npc=15718/ouro-scarab (via r.jina.ai) — level 60 elite, HP 76,300, Summon Player 20477
- https://www.wowhead.com/classic/spell=26102/sand-blast (via r.jina.ai) — 3,400 Nature base, 2 s cast, 100 yd range, 5 s stun
- https://www.wowhead.com/classic/spell=26103/sweep (via r.jina.ai) — 2,625 Physical base, 30 yd radius, knockback, 1.5 s cast, 5 s cooldown
- https://www.wowhead.com/classic/spell=26100/ground-rupture (via r.jina.ai) — 2,250 Physical + knockback
- https://www.wowhead.com/classic/spell=26615/berserk (via r.jina.ai) — +150% attack speed, periodic trigger every 10 s, Ouro
- https://www.wowhead.com/classic/spell=26616/boulder (via r.jina.ai) — 6,000 Physical + knockback, 2 s cast, unlimited range, Ouro
- https://www.wowhead.com/classic/guide/ouro-temple-of-ahnqiraj-strategy (via r.jina.ai) — Sand Blast 180° cone + 5 s stun, wipes threat of all hit, Sweep knockback → Intercept back, Quake/Ground Rupture/Scarab handling, boss must face away before anyone attacks
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — Sweep "every 90 s ~3,000", Sand Blast ~4,000 cone on second-highest threat, melee left / casters right / healers left out of melee, Quakes 1,500/s, ~20 scarabs, 20% frenzy
- https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-ouro-the-sandworm.amp — 2006: submerges after 3 min or when nobody in melee, "super sweep at 1:30"
- https://us.millenium.gg/guide/7179.html?page=10 — Sand Blast every 25 s 3,500–4,500 180°, Sweep 1,500–2,000, Berserk +150% speed +100% damage, scarabs 45 s
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Ouro.lua — submerge bar 180 s from engage/emerge, emerge 30 s after submerge, Sweep first ~22.6 s then ~21 s, Sand Blast first ~24.2 s then ~22 s, scarab despawn bar 60 s, early-submerge detection (<170 s), Berserk 26615 at 20%, submerge spell 26058, scarab summon 26060, respawn 70 s
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/Ouro.lua — submerge 184.6 s, emerge 30.1 s, Sand Blast 22.1–26.8 s (first 20.1–26.3), Sweep 20.6–22.6 s (first 22.6–25.9), Sand Blast timer resets on Berserk, emerge via Birth 26586

## Overview
- Level ?? boss, Beast (sand worm). HP 5,889,208 (Wowhead, "Seasonal 40 Player"; wiki: ~400,000 left at 20% in vanilla). Optional boss (third optional), in a sandy pit room between the Twin Emperors and C'Thun. No timed enrage found; the threat is the 20% Berserk.
- Phases: Phase 1 (100%→20%): cycles of ~3 min surfaced (Sweep + Sand Blast) then 30 s submerged (Dirt Mounds/Quakes, then emerge with Ground Rupture + ~20 Scarabs). He also submerges early if nobody is in melee range. Phase 2 (20%→0): Berserk (+150% attack speed, +100% damage per wiki), never submerges again, keeps spawning mounds/scarabs while up, Boulders anyone if melee range is empty.
- Raid-size assumptions: 40-man Classic Era. SoD adds Blinding Admiration (fear) — ignore.

## Abilities

### Sweep
- Type: frontal/area knockback (melee)
- Target rule: everyone in his melee area (spell radius 30 yd; guides treat it as "melee range"). The swept tank loses aggro and the next player on his list is attacked (wiki).
- Cast time: 1.5 s. Not interruptible.
- Cadence: BW first ~22.6 s then ~21 s; DBM 20.6–22.6 s (first 22.6–25.9 s). (Tavern's "every 90 s" is wrong for Era.)
- Damage: 2,625 Physical base (wiki 1k–2.5k, Millenium 1,500–2,000, Tavern ~3,000) + knockback (value 100).
- Telegraph: 1.5 s cast bar; boss mods announce.

### Sand Blast
- Type: frontal cone + threat wipe + stun
- Target rule: aimed at the highest-threat player; hits everyone in a 180° frontal cone (wiki/Wowhead) out to ~45 yd (wiki; spell lists 65 yd radius, 100 yd range). Everyone hit has their threat cleared (Wowhead) — so only one tank should be in the cone.
- Cast time: 2 s. Not interruptible.
- Cadence: every 20–25 s (Wowhead NPC, wiki); DBM 22.1–26.8 s (first 20.1–26.3 s); BW 22 s (first 24.2 s). Timer resets on Berserk (DBM). Usually cast shortly after each emerge (wiki).
- Damage: 3,400 Nature base (wiki 3.5k–4.5k; Tavern ~4,000); binary resist (not reduced by partial resistance). Stun 5 s.
- Telegraph: 2 s cast bar; BW gives a "Sand Blast in 5 s" pre-warning.

### Submerge / Summon Ouro Mounds (26058)
- Type: other (untargetable phase)
- Rule: ~180 s after each emerge/engage (BW 180, DBM 184.6; wiki "~1.5 min chance", TTH "3 minutes") or immediately if nobody is in melee range — but not during a Sand Blast/Sweep cast (wiki). Lasts 30 s (BW/DBM). While down he is untargetable/immune; Dirt Mounds chase players and Quake.
- Telegraph: he burrows; raid gets a brief out-of-combat window to drink (wiki).

### Dirt Mound — Quake
- Type: ground hazard. Mounds move toward players; standing on one takes repeated Nature hits ("~1,000 at 200 NR", wiki; "1,500/s", Tavern). Keep moving away.

### Emerge — Ground Rupture (26100) + Summon Ouro Scarabs (26060)
- Type: AoE on emerge + summon adds. 2,250 Physical + knockback to anyone standing where he surfaces (wiki 2k). About 20 Scarabs spawn at the emerge point. He usually opens with a Sand Blast shortly after surfacing. If no tank is in melee range within ~10 s he re-submerges (wiki).

### Berserk (20%)
- Type: enrage. +150% attack speed (spell; wiki also +100% damage), permanent, no more submerging; summons mounds and scarabs periodically while up (BW notes scarabs continue without submerging; spell has a 10 s periodic trigger).

### Boulder
- Type: targeted ranged. Only when nobody is in melee range (Phase 2 per wiki): 6,000 Physical + knockback, 2 s cast, unlimited range, random raid member.

## Adds
- Ouro Scarab: ~20 per emerge (Tavern "roughly 20"; wiki "tens"), level 60 elite, HP 76,300 (Wowhead Seasonal). Each picks one initial target and never switches; 300 per hit on cloth, 40–150 on tanks; Summon Player ability. Despawn after 45 s (wiki, Wowhead; BW bar 60 s). Handle with AoE taunt + mage AoE/Frost Nova/frost traps/fears/Sapper Charges, or just CC and let them despawn. In Phase 2 they keep coming.
- Dirt Mounds: untargetable hazards during submerge (and Phase 2); avoided, not killed.

## Positioning and movement
- Tank: MT picks him up and turns him to face away from the raid before anyone attacks; MT takes Sand Blast alone in front. Two or three off-tanks stand just outside the cone but in melee range: when the MT is Sand Blasted (threat wiped) the next tank is already top threat and holds him until the MT re-establishes; after a Sweep knockback warriors Intercept/druids Feral Charge straight back so he never has an empty melee range (early submerge). Before each emerge, tanks wait at the predetermined centre spot so a tank is on him within 10 s.
- Melee DPS: directly behind him (Tavern: his left), never in the frontal 180°; run out of Sweep if possible or accept the knockback and return; keep threat under all tanks. During submerge: spread, avoid mounds, re-gather near the centre.
- Ranged DPS: behind/to his right side, outside the cone and outside Sweep range; AoE classes ready for scarabs on each emerge (Frost Nova + AoE, Sapper Charges); stay out of Quakes.
- Healers: behind him, out of melee range but in range of the tanks; never in the frontal cone; move out of Quakes immediately; one healer team per tank.
- Whole raid: three groups ~120° apart per wiki (tanks front, raid behind), or simply "everything behind him". Gather near the centre for each emerge; nobody stands on the emerge spot (Ground Rupture).

## What each role must do and must not do
- Tank:
  1. Face Ouro away from the raid before DPS starts and keep it that way all fight.
  2. Rotate: the Sand Blast target is stunned 5 s and threat-wiped — the next tank must already be #2 on threat.
  3. Intercept back after every Sweep (~21 s); never leave melee range empty (early submerge / Boulder in Phase 2).
  4. Be on him within 10 s of each emerge.
  5. Do not stand on his emerge point.
- DPS:
  1. Nobody attacks until he faces away.
  2. Keep threat under every tank in the rotation (Sand Blast wipes the tanks' threat, not yours).
  3. On emerge: AoE/CC the ~20 scarabs instantly, then back to the boss.
  4. Save cooldowns for 20%; Phase 2 is a race with rotating Quakes and endless scarabs.
  5. Move out of Quakes; never into the frontal cone.
- Healer:
  1. Nothing to dispel.
  2. Spike damage: the Sand Blasted tank (3.4–4.5k + 5 s stun), the melee group after a Sweep, scarab targets (cloth 300/hit × several), Boulder victims (6,000).
  3. Drink during the 30 s submerge; be back in position before the emerge.

## Timeline of a typical pull
- t=0: MT engages and turns him; raid moves behind.
- t≈20–26 s: first Sand Blast (MT stunned 5 s, threat cleared → OT holds); t≈22–26 s: first Sweep (knockback, OTs Intercept back). Both then repeat every ~21–27 s, interleaved.
- t≈180 s: Submerge (unless forced earlier by an empty melee range). 30 s of Dirt Mound Quakes; raid drinks/moves; gathers at the centre.
- t≈210 s: Emerge — Ground Rupture at the spot, ~20 Scarabs (45 s lifetime), Sand Blast shortly after; tank on him within 10 s. Cycle repeats every ~3.5 min.
- 20%: Berserk — +150% attack speed, no submerge, periodic scarabs/mounds, Boulders if melee range is empty; cooldowns and finish.

## Open questions
- Sweep damage/radius: 2,625 base / 30 yd radius (spell) vs 1k–2.5k (wiki) vs ~3,000 (Tavern) vs "melee range" in all guides. Cadence ~21 s (BW/DBM) vs "every 90 s" (Tavern) vs "super sweep at 1:30" (TTH 2006).
- Sand Blast: 3,400 base (spell) vs 3.5–4.5k (wiki) vs ~4,000 (Tavern); cone 180° / 45 yd (wiki) vs 65 yd radius listed on the spell; target "highest threat" (wiki/Wowhead) vs "second-highest threat" (Tavern).
- Submerge interval: 180 s (BW) / 184.6 s (DBM) vs "~1.5 min chance" (wiki) vs 3 min (TTH).
- Scarab despawn: 45 s (wiki, Wowhead) vs 60 s BigWigs bar; count "~20" (Tavern) / "tens" (wiki); HP 76,300 is the Wowhead Seasonal value.
- Berserk damage bonus: +150% speed only (spell data) vs +150% speed and +100% damage (wiki, Millenium).
- Quake damage: ~1,000 at 200 NR (wiki) vs 1,500/s (Tavern).
