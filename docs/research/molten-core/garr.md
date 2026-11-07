# Garr (Molten Core)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Garr — Antimagic Pulse (dispel 1 buff), Magma Shackles -60% 15 s, Firesworn Immolate 337 + 168/3 s 21 s, Eruption "22194" (typo), Separation Anxiety "4–6k on T2 tanks", banish strategy, single-tank strategy, patch 1.3/1.5 notes.
- https://warcraft.wiki.gg/wiki/Firesworn — level 30 elite (display), Massive Eruption 2330 Fire 30 yd knockback, Separation Anxiety +300% Fire damage, explode on death.
- https://www.wowhead.com/tbc/npc=12057/garr (r.jina.ai) — health 659,538; Antimagic Pulse "within 45 yards", Magma Shackles "within 45 yards"; Firesworn Immolate 20294, Eruption 19497, Separation Anxiety 23492 (+300% when separated).
- https://www.wowhead.com/tbc/npc=12099/firesworn (r.jina.ai) — Firesworn level 59–60, health 61,040.
- https://www.wowhead.com/classic/npc=12099/firesworn (r.jina.ai) — Firesworn Seasonal health 122,080.
- https://wotlkdb.com/?spell=19492 — Antimagic Pulse: instant, 45 yd radius, dispel 1 Magic effect.
- https://wotlkdb.com/?spell=19496 — Magma Shackles: instant, 45 yd radius, 15 s, dispel Magic, -60% run speed, mechanic Ensnared.
- https://wotlkdb.com/?spell=19516 — Frenzy (Garr's per-add enrage): 30 min, +9% melee haste, +5% size (stacks per Firesworn death).
- https://wotlkdb.com/?spell=19497 — Eruption: instant, 15 yd radius, 1850–2150 Fire, knockback 200–225.
- https://wotlkdb.com/?spell=20483 — Massive Eruption: 30 yd radius, 3325–3675 Fire, knockback 200–225, instakill self.
- https://wotlkdb.com/?spell=20294 — Immolate (Firesworn, per Wowhead list): instant, 40 yd, 760–840 Fire + 380–420 every 3 s for 21 s, dispel Magic.
- https://wotlkdb.com/?spell=15733 — Immolate (Firesworn passive used by cmangos): 25% proc trigger.
- https://wotlkdb.com/?spell=23492 — Separation Anxiety (on Firesworn): 5 s, +300% damage done, immunity to Banish.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_garr.cpp — timers: Antimagic Pulse 10–15 s then 15–20 s; Magma Shackles 5–10 s then 10–15 s; Massive Eruption 6 min after pull then every 20 s; Firesworn Eruption on death + Enrage trigger 19515 → Garr Frenzy 19516; Separation Anxiety "100 yard aura".
- https://www.wowhead.com/classic/guides/garr-molten-core-strategy (r.jina.ai) — Separation Anxiety at 15 yd, Eruption 15 yd, Magma Shackles -60%/15 s, pull Garr ~15 yd from raid, Warlock Banish, reader comment "9% attack speed per Firesworn slain".
- https://r.jina.ai/https://classic.warcraftdb.com/data/encounter/239 (Warcraft Tavern) — Enrage 30 min, Immolate 30 yd/21 s, Magma Shackles 15 s Magic, taunt in the last 2 s of Banish.
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-4-garr — 4 Warlocks banish 4, Warriors tank 4; mark targets pre-pull; Garr gains damage and speed per guard death; healing shifts to MT; banished guards killed after Garr.
- https://legacy-wow.com/molten-core-boss-guide-garr/ — Magma Shackles to 40% speed, banish 3–4 at start, Separation Anxiety = CC immune when far, advanced single-tank corner strategy.
- https://wowtbc.gg/classic/boss-guides/molten-core — kill Garr first, Firesworn within 15 yd of Garr, Eruption 15 yd knockback, Escape Artist / Free Action Potion.
- https://www.warcrafttavern.com/wow-classic/guides/garr-som/ (search snippet) — SoM: Firesworn banish-immune after Garr hits 50%; "explode for about 1000 with a knockback".

## Overview
- Level ?? (boss). Health 659,538 (Era 40-player). No mana (Lava elemental). No enrage timer, but Garr gains a permanent stacking Frenzy (+9% attack speed each) for every Firesworn that dies, and after 6 minutes (cmangos) he starts detonating his own adds with Massive Eruption every 20 s, which acts as a soft enrage. Fourth boss; required (Rune of Blaz); killing him stops Lava Surger respawns.
- Phases: none formally. Practically: (1) adds alive, (2) adds dead/banished and Garr frenzied.
- Raid-size assumptions: 40-man Era with 4–5 Warlocks for Banish. SoM: Firesworn become banish-immune once Garr reaches 50%.

## Abilities

### Antimagic Pulse
- Name: Antimagic Pulse (spell 19492)
- Type: AoE (room) dispel
- Target rule: all players within 45 yd
- Cast time: instant
- Cooldown or cadence: cmangos first 10–15 s, then every 15–20 s. Guides: "constantly".
- Damage: none; removes 1 beneficial Magic effect from each target
- Debuff: none
- Movement effect: none
- Telegraph: none. Stack junk buffs pre-pull so they are eaten first (legacy-wow); do not rebuff mid-fight.

### Magma Shackles
- Name: Magma Shackles (spell 19496)
- Type: AoE (room) debuff (snare)
- Target rule: all players within 45 yd
- Cast time: instant
- Cooldown or cadence: cmangos first 5–10 s, then every 10–15 s
- Damage: none
- Debuff: Magma Shackles, 15 s, dispel type Magic; -60% movement speed (legacy-wow/Ten Ton Hammer say "to 40% speed"). No spread. Free Action Potion / Escape Artist remove it.
- Movement effect: snare 60%
- Telegraph: none

### Frenzy (per Firesworn death)
- Name: Frenzy (spell 19516), triggered by 19515 when a Firesworn dies
- Type: enrage
- Target rule: self
- Cast time: instant
- Cooldown or cadence: once per Firesworn death (up to 8 stacks)
- Damage: +9% melee haste and +5% size per stack, 30 min duration (effectively permanent; patch 1.3 made him lose it when leaving combat)
- Debuff/Movement/Telegraph: none; Garr visibly grows with each stack.

### Massive Eruption (Garr detonates an add)
- Name: Massive Eruption (trigger 20482 from Garr → 20483 on a Firesworn)
- Type: AoE (around the add), add self-destruct
- Target rule: Garr makes a Firesworn explode; everyone within 30 yd of that add
- Cast time: instant
- Cooldown or cadence: cmangos first at 6 min, then every 20 s (soft enrage). Not documented in guides.
- Damage: 3325–3675 Fire + knockback (200–225) in 30 yd; the Firesworn dies (instakill), which also adds a Frenzy stack to Garr. wiki.gg lists 2330 Fire 30 yd.
- Debuff: none
- Movement effect: knockback
- Telegraph: emote (cmangos EMOTE_MASSIVE_ERUPTION).

### Eruption (Firesworn death explosion)
- Name: Eruption (spell 19497)
- Type: AoE (on death)
- Target rule: everyone within 15 yd of the dying Firesworn
- Cast time: instant on death (not if it kills itself)
- Cooldown or cadence: once per add death
- Damage: 1850–2150 Fire, knockback 200–225 (Wowhead/wowtbc.gg: 15 yd; Warcraft Tavern SoM guide "about 1000")
- Debuff: none
- Movement effect: knockback ("a good distance" — Ten Ton Hammer; can land you on uncleared trash or in lava)
- Telegraph: add health near zero; raid calls out "about to die".

### Immolate (Firesworn)
- Name: Immolate (spell 20294 per Wowhead; 15733 passive proc in cmangos)
- Type: targeted debuff
- Target rule: current tank of that Firesworn
- Cast time: instant
- Cooldown or cadence: 25% proc on melee hit (cmangos) / periodic cast
- Damage: 760–840 Fire + 380–420 every 3 s for 21 s (DBC 20294); wiki.gg 337 + 168/3 s. Range 40 yd (30 yd per Warcraft Tavern).
- Debuff: Immolate, 21 s, dispel type Magic (Priests/Paladins cleanse the tanks). Stacks from multiple adds.
- Movement/Telegraph: none

### Separation Anxiety (Firesworn)
- Name: Separation Anxiety (Garr aura 23487, 100 yd tracker; add buff 23492)
- Type: enrage (adds)
- Target rule: a Firesworn taken too far from Garr. Guides: 15 yd (Wowhead, wowtbc.gg); cmangos: 100 yd aura. wiki.gg: "pulled too far away".
- Cast time: instant
- Cooldown or cadence: refreshes every 5 s while out of range
- Damage: +300% damage done ("4–6k on T2 tanks") and immunity to Banish
- Debuff: on the add, 5 s refreshing
- Movement/Telegraph: visible in combat log / cast bar addon.

## Adds
- 8x Firesworn (NPC 12099), level 59–60 elite, 61,040 HP each (Era; 122,080 Seasonal). Present from the start, dance around Garr (mark them pre-pull with Hunter's Mark / Detect Magic, Ten Ton Hammer). Abilities: Immolate, Thrash, Eruption on death, Separation Anxiety when far from Garr. Handling: Warlocks Banish 3–5 of them (re-banish 2 s before expiry; taunt in the last 2 s if a tank takes over, Warcraft Tavern), off-tanks hold the rest near Garr; DPS kills unbanished adds one at a time, melee stepping out before each dies. Banished adds stay banished until Garr dies, then are killed one by one (they do not despawn, Ten Ton Hammer). Each death adds +9% attack speed to Garr. Alternative: kill Garr first (wowtbc.gg) and AoE the adds after.

## Positioning and movement
- Tank: pull Garr roughly 15 yd away from the raid (Wowhead guide), far from where adds will explode (Ten Ton Hammer), with his back to a safe wall. Facing irrelevant (no cone). Do not drag him far (adds get Separation Anxiety). Never stand so the Eruption knockback sends you into lava or uncleared Molten Giants.
- Melee DPS: on the assigned Firesworn, 15+ yd from Garr-adjacent other adds where possible; step out at ~10% add HP; Free Action Potion if shackled near a dying add.
- Ranged DPS: max range from the adds; finish each add from range. Spread to limit explosion damage.
- Healers: 2 on the MT at the start, scaling to 3–4 as adds die; others on the add tanks and Warlocks (Ten Ton Hammer). Priests/Paladins cleanse Immolate off add tanks.
- Whole raid: clear nearby Molten Giants and Lava Annihilators first; spread; nothing within 15 yd of an add about to die.

## What each role must do and must not do
- Tank:
  1. MT: build threat before DPS, hold Garr in place; expect increasing damage as Frenzy stacks.
  2. OTs: keep each Firesworn within range of Garr (15 yd per guides) so it never gets Separation Anxiety, but not on top of the raid.
  3. Taunt a banished add in the last 2 s of the Banish if it is being handed over.
  4. Accept the Eruption; make sure the knockback direction is safe.
- DPS:
  1. Kill unbanished Firesworn one at a time, then Garr, then banished adds (or Garr-first variant).
  2. Melee move away at low add HP; ranged finish it.
  3. Warlocks: Banish on cooldown on the assigned add, soulstone yourself; this is the top priority (Warcraft Tavern).
  4. Do not rebuff after Antimagic Pulse.
- Healer:
  1. Cleanse Immolate from add tanks continuously.
  2. Shift healing from add tanks to the MT as adds die and Garr speeds up.
  3. Heal knockback victims and Warlocks.

## Timeline of a typical pull
- t=0 pull: Warlocks Banish assigned adds; OTs pick up the rest; MT engages Garr.
- t=5–10 s: first Magma Shackles (-60% speed, 15 s); repeats every 10–15 s.
- t=10–15 s: first Antimagic Pulse (1 buff removed); repeats every 15–20 s.
- t≈30 s onward: Firesworn die one by one (61k HP each), each exploding (1850–2150 Fire, 15 yd knockback) and adding +9% attack speed to Garr. Banishes (30 s) refreshed every 28 s.
- t≈2–4 min: unbanished adds dead; raid on Garr (659k HP).
- t=6 min (cmangos): Garr begins Massive Eruption on his remaining adds every 20 s (3325–3675 Fire, 30 yd, kills the add, +Frenzy) — a soft enrage; kill him before this.
- After Garr dies: kill banished adds one at a time.

## Open questions
- Separation Anxiety distance: 15 yd (Wowhead guide, wowtbc.gg) vs 100 yd aura (cmangos comment).
- Eruption damage: DBC 1850–2150 vs wiki.gg 22194 (typo) vs Warcraft Tavern SoM "about 1000". Massive Eruption 3325–3675 (DBC) vs 2330 (wiki).
- Frenzy per add: +9% haste per stack (DBC/Wowhead comment); Ten Ton Hammer says damage and speed; no official figure.
- Massive Eruption timer (6 min / 20 s) is emulator data only.
- Immolate values: 20294 (760–840 + 380–420) vs wiki 337 + 168.
