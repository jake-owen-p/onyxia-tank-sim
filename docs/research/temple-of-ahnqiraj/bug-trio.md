# Bug Trio: Vem, Lord Kri, Princess Yauj (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Bug_Trio (redirects to Silithid Royalty) — Kri Toxic Volley ~500 + 125/tick, poison cloud 2,000/s on death, Yauj fear every 20 s and wipes aggro even through Fear Ward/Berserker Rage, Yauj immune to silence, Vem 2–3k charge on cloth, Vem death enrages the others, 15-minute hard enrage, kill-order notes, two-tank Yauj method
- https://www.wowhead.com/classic/guide/bug-trio-temple-of-ahnqiraj-strategy (via r.jina.ai) — loot by kill order, Yauj Dispel of other bosses' debuffs, Berserker Charge knockback + 2 s knockdown, Knock Away on tank, Vengeance on Vem death, Vem Berserk if last, Thrash, positioning (alcoves, out of LoS), cleanse every GCD
- https://www.wowhead.com/classic/npc=15544/vem , /npc=15511/lord-kri , /npc=15543/princess-yauj (via r.jina.ai) — HP 1,498,950 / 1,498,950 / 1,832,050 ("Seasonal 40 Player")
- https://www.wowhead.com/classic/spell=26580/fear (via r.jina.ai) — 8 s, 45 yd radius, Magic, instant
- https://www.wowhead.com/classic/spell=25807/great-heal (via r.jina.ai) — 2 s cast, value 69,375, unlimited range, used by all three
- https://www.wowhead.com/classic/spell=25812/toxic-volley (via r.jina.ai) — 450 Nature + 150 per 2 s for 16 s, Poison, 30 yd range, 100 yd radius
- https://www.wowhead.com/classic/spell=25786/toxic-vapors (via r.jina.ai) — 2,000 Nature per 1 s, 8 yd radius, 2 min
- https://www.wowhead.com/classic/spell=18670/knock-away (via r.jina.ai) — weapon +30, knockback 132, 10 yd, used by Vem
- https://www.wowhead.com/classic/spell=25790/vengeance (via r.jina.ai) — +150% attack speed, +100% physical damage, 10 min, used by Vem
- https://www.wowhead.com/classic/spell=26561/berserker-charge (via r.jina.ai) — weapon +300, knockback 350, 40 yd (warrior spell page; Vem not listed, see Open questions)
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — kill orders, Vem cornered out of LoS, Tremor Totem / Fear Ward, interrupt Great Heal
- https://us.millenium.gg/guide/7179.html?page=8 — ability lists per bug, Vengeance "+100% damage, +150% attack speed" (but says it triggers when two bosses are dead), poison cloud 2,000/s
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/BugFamily.lua — Great Heal first ~8.1 s then 12.9 s bar, 2 s cast; Fear first ~11.3 s then ~21 s CD; spell IDs 25807 / 26580 / 25812 / 25786
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/ThreeBugs.lua — Fear variance 20.3–29.4 s (first 10.6–18.4), Toxic Volley variance 8.1–35.1 s (first 8.1–42.6), poison cloud persists ~60 s after combat end

## Overview
- Three bosses pulled together, all level ?? Beasts (silithid). HP (Wowhead, "Seasonal 40 Player"): Vem 1,498,950; Lord Kri 1,498,950; Princess Yauj 1,832,050. Optional encounter, normally done second (after Skeram, before Sartura). Room: a round chamber with several alcoves off the walls.
- Phases: none by HP. The fight changes on each death: Kri leaves a 2,000/s poison cloud; Yauj spawns Yauj Brood; Vem's death grants Vengeance to survivors. The last bug killed determines the loot table.
- Enrage: 15-minute hard enrage on all surviving bugs (wiki). The wiki also mentions Vem hard-enraging if the fight runs "upwards of twenty minutes".
- Raid-size assumptions: 40-man Classic Era.

## Abilities

### Princess Yauj — Fear
- Type: AoE fear + threat wipe
- Target rule: all players within 45 yd of Yauj (spell radius). Wiki says it resets her threat table and "wipes aggro" even on players immune to the fear.
- Cast time: instant. Not interruptible.
- Cadence: first at ~10.6–18.4 s (DBM) / ~11.3 s (BW); then every 20.3–29.4 s (DBM) / ~21 s (BW); wiki says "every 20 seconds".
- Damage: none. Debuff: Fear, 8 s, Magic (dispellable; Tremor Totem/Fear Ward/WotF/Berserker Rage break or prevent it).
- Movement: feared players run for up to 8 s. Threat reset on Yauj.
- Telegraph: none; boss mods announce on cast.

### Princess Yauj — Great Heal
- Type: targeted heal
- Target rule: herself, or another bug within line of sight (wiki says she heals the other two since a patch; Wowhead guide says she Dispels another boss's debuffs then heals it).
- Cast time: 2 s (Wowhead/BW), interruptible by Kick/Counterspell/Shield Bash/Earth Shock. She is immune to Silence (wiki).
- Cadence: first at ~8.1 s, then ~12.9 s after each cast (BW bars). Heal value 69,375 (Wowhead effect value).
- Telegraph: 2 s cast bar; BW/DBM "interrupt" warning.

### Princess Yauj — Dispel
- Type: other. If another boss is in her line of sight she removes its debuffs (Wowhead guide). Keep her alone in an alcove.

### Princess Yauj — Ravage / melee
- Type: melee. Melee ~1,000 on tanks (wiki). Ravage listed by Millenium; numbers unknown.

### Lord Kri — Toxic Volley
- Type: AoE (raid-wide) poison
- Target rule: all players (radius 100 yd on spell data; "area-wide" per wiki).
- Cast time: instant. Not interruptible.
- Cadence: very variable: 8.1–35.1 s between casts, first 8.1–42.6 s after pull (DBM).
- Damage: 450 Nature direct (Wowhead; wiki ~500) plus DoT 150 Nature every 2 s for 16 s (Wowhead; wiki 125/tick). Wiki: the DoT stacks without limit if not cleansed.
- Debuff: Toxic Volley, 16 s, Poison dispel. Does not spread but stacks.
- Telegraph: none.

### Lord Kri — Cleave, Thrash
- Cleave: frontal, hits the tank and those near him; melee stay behind him. Thrash: random extra melee attacks on the top-threat target.

### Lord Kri — Summon Poison Cloud (on death)
- Type: ground hazard. Toxic Vapors (25786): 2,000 Nature every 1 s to anyone within 8 yd, persists 2 min. "Almost a guaranteed death" (wiki). DBM keeps watching for it ~60 s after combat ends.

### Vem — Berserker Charge
- Type: charge + knockback + stun
- Target rule: a random raid member in Vem's line of sight (Wowhead guide); 40 yd range.
- Cast time: instant. Cadence unknown.
- Damage: weapon damage +300 (spell data) — "upwards of 2–3k to cloth" (wiki). Knockback on players near the landing point; the target is knocked down for 2 s (Wowhead guide).
- Telegraph: none.

### Vem — Knock Away
- Type: knockback on the tank. 10 yd range, weapon +30, knockback value 132. Tank keeps back to the wall.

### Vem — Vengeance (on Vem's death) / Berserk
- Type: enrage. Vengeance (25790): +150% attack speed, +100% physical damage, lasts 10 min, 100 yd radius. Applied to the other two bugs when Vem dies (wiki, Wowhead guide). Wowhead guide also says Vem "Berserks" if he is the last one alive. Millenium instead says Vengeance is cast on Vem when the two others are dead (see Open questions).

### Shared — Summon Player
- Listed on Kri, Yauj and Vem (Millenium/wiki ability lists): pulls a player to the boss. No numbers found.

## Adds
- Yauj Brood: "several"/"multiple" small bugs spawn where Yauj dies. HP unknown. Can be Frost Nova'd, feared, stunned, or Sapper-charged; casters AoE them.
- Poison Cloud (Kri's corpse): not an NPC to kill; a 2 min, 8 yd hazard. Everyone moves off it immediately.

## Positioning and movement
- Tank: three tank teams. Vem's tank holds him in an alcove with his back to the wall and Vem facing the back wall so nobody is in his line of sight (no charges, Knock Away does nothing). Yauj needs two tanks on her in her own alcove far from the others (no Dispel/Heal on them); before each Fear the off-tank uses Berserker Rage then Taunts her when she runs; a third warrior mid-room can Intercept/catch her. Kri is tanked where melee can stand behind him, away from where the raid will stand after he dies (the cloud).
- Melee DPS: behind Kri (Cleave). Never in Vem's line of sight. After Kri dies, step out of the cloud immediately and move to the next target.
- Ranged DPS: focus the kill-order target; stand where Vem cannot see you; hunters keep Aspect of the Wild.
- Healers: cleanse Toxic Volley almost every GCD (druids Abolish Poison, paladins Cleanse, shaman Poison Cleansing Totem). Tremor Totem / Fear Ward on Yauj's tanks. Stay out of Yauj's 45 yd Fear if possible.
- Whole raid: for the easy order (Kri > Yauj > Vem) the wiki trick is to keep Vem and Kri near each other and Yauj far away so Vem "devours" Kri's corpse and Yauj cannot heal him.

## What each role must do and must not do
- Tank:
  1. Vem tank: back to wall, face Vem to the wall, never let the raid into his LoS.
  2. Yauj tanks: pre-Fear Berserker Rage/Fear Ward; taunt back after each fear; keep her out of LoS of the other bugs.
  3. Kri tank: hold him with his front away from the raid; expect Thrash spikes.
  4. On Kri's death, everyone leaves the cloud; tanks reposition the remaining bugs away from it.
  5. Never tank two bugs in the same alcove (Heal/Dispel).
- DPS:
  1. Follow the kill order exactly (loot and difficulty depend on it).
  2. Interrupters watch Yauj's 2 s Great Heal every ~13 s; Kick/Counterspell on rotation.
  3. Casters: Frost Nova / AoE the Yauj Brood.
  4. Do not stand in front of Kri; do not stand where Vem can charge you.
- Healer:
  1. Cleanse Toxic Volley continuously (stacks).
  2. Spike damage: Kri's tank (Thrash), anyone charged by Vem, anyone in the poison cloud.
  3. Pre-heal before Fear casts (healers get feared too).

## Timeline of a typical pull (Kri > Yauj > Vem)
- t=0: three tanks pull their bugs to their alcoves; Yauj far from the others.
- t≈8 s: first Great Heal (interrupt); t≈8–43 s first Toxic Volley; t≈11–18 s first Fear, then every ~20–29 s.
- Kill Kri (DPS on him from the start; raid cleansing throughout). On death: 2,000/s cloud for 2 min — move.
- Kill Yauj: interrupt heals every ~13 s, handle Fear every ~20–29 s. On death: Yauj Brood — Frost Nova/AoE.
- Kill Vem last: he has no Fear/Volley; raid collapses on him. (If he dies before the others, survivors gain +150% attack speed/+100% damage.)
- Hard enrage at 15 min.

## Open questions
- Vengeance trigger: wiki and Wowhead say Vem's death buffs the other two; Millenium says Vem gains it when the other two are dead. Spell data lists Vem as the only user. Safest sim rule: on Vem's death, surviving bugs get +150% attack speed / +100% damage.
- Berserker Charge: the spell 26561 page is a warrior ability page and does not list Vem; the Wowhead guide names Vem's charge "Berserker Charge". Numbers may differ.
- Toxic Volley numbers: 450 + 150/2 s for 16 s (Wowhead) vs ~500 + 125/tick (wiki).
- Fear cadence: ~20 s (wiki) vs 20.3–29.4 s (DBM) vs ~21 s (BW).
- Yauj Brood count and HP: not found. Great Heal: "69,375" effect value; whether that is the actual heal is unknown.
- Hard enrage: 15 min (wiki) vs "twenty minutes" (same page, Vem section).
