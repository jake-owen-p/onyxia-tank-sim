# Princess Huhuran (Temple of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Princess_Huhuran — Frenzy tranquilizable with ~5 s before volleys, Poison Bolt 2,000 to closest 15 (pets excluded), Noxious Poison 2,900 over 8 s + silence not dispellable, Wyvern Sting sleep up to 10 targets and 3,000 on dispel, Acid Spit 219–281/2 s stacking, Berserk 30% double attack speed + bolts every 3 s, 5-minute timed enrage, taunt-immune, NR soak plan, Curse of Doom at 45%, Stoneform trick
- https://www.wowhead.com/classic/npc=15509/princess-huhuran (via r.jina.ai) — HP 5,829,623 ("Seasonal 40 Player"); IDs Acid Spit 26050, Wyvern Sting 26180, Noxious Poison 26053, Berserk 26068, Poison Bolt 26052; "Poison Bolt every 2 seconds to the 15 closest" at 30%; 200+ NR for the 15
- https://www.wowhead.com/classic/spell=26050/acid-spit (via r.jina.ai) — 219–281 Nature per 2 s, 30 s, melee range
- https://www.wowhead.com/classic/spell=26180/wyvern-sting (via r.jina.ai) — 12 s sleep, 10 targets, 100 yd radius, Poison dispel, any damage cancels
- https://www.wowhead.com/classic/spell=26053/noxious-poison (via r.jina.ai) — 750 Nature per 2 s for 8 s + Silence, 15 yd radius, no dispel type
- https://www.wowhead.com/classic/spell=26051/frenzy (via r.jina.ai) — +150% attack speed, 8 s, dispel type Enrage, triggers a spell every 4 s
- https://www.wowhead.com/classic/spell=26068/berserk (via r.jina.ai) — +200% attack speed, 1 h, triggers a spell every 2 s
- https://www.wowhead.com/classic/spell=26052/poison-bolt (via r.jina.ai) — 1,500 Nature (1,500–2,500 tooltip), 15 targets, 45 yd range, 100 yd radius, Poison
- https://www.wowhead.com/classic/guide/princess-huhuran-temple-of-ahnqiraj-strategy (via r.jina.ai) — ~200 NR unbuffed for melee, dispel Wyvern Sting only on the two tanks, ranged spread in stacks of 2–3, GNPP pre-pull, Priest on the melee stack
- https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 — 15 soakers 200+ NR, tanks ~300, swap before 10 Acid Spit stacks, Wyvern Sting "15-yard AoE, 12 s", Noxious ~3,000 over 8 s, spread until 35%, 4 soak groups with a priest each
- https://www.tentonhammer.com/guides/tentonhammer-s-guide-to-aq40-huhuran.amp — Acid Spit stacks "over 50", tank rotation at 7–9 stacks, soakers step in at ~35%, Wyvern Sting 4,000 on cleanse (2006 figures)
- https://us.millenium.gg/guide/7179.html?page=5 — 2,000 Nature to nearest 15 every 3 s at 30%, sleep 10 nearest, 3,000 on cleanse (note: page swaps the Acid Spit/Noxious names)
- https://raw.githubusercontent.com/BigWigsMods/BigWigs_Classic/master/AQ40/Huhuran.lua — Berserk timer 300 s, Wyvern Sting first ~21 s then ~25 s ("can be way higher"), Frenzy CD ~14.5 s, Berserk 26068 at 30% (BW displays spell 26662)
- https://raw.githubusercontent.com/DeadlyBossMods/DBM-Vanilla/master/DBM-Raids-Vanilla/AQ40/Huhuran.lua — Wyvern Sting 25.9–59.2 s (first 6.8–43.7), Noxious Poison 11.3–37.6 s (first 11.3–38.8), Frenzy 11.3–25.9 s (first 6.5–25.9), Acid Spit 30 s timer and taunt warning at 10 stacks, Berserk pre-warn at 35%

## Overview
- Level ?? boss, Beast (silithid wasp). HP 5,829,623 (Wowhead, "Seasonal 40 Player"). Taunt-immune. Fourth required boss, in a round chamber of the Hive Undergrounds.
- Phases: Phase 1 100%→30%: Acid Spit on the tank, periodic Frenzy (tranq), Noxious Poison and Wyvern Sting on groups. Phase 2 at 30%: Berserk — attack speed +200%, Poison Bolt to the 15 closest players every 2–3 s until she dies.
- Hard enrage: 5 minutes after pull she spams Poison Bolt volleys at the whole raid ("guaranteed wipe", wiki; BW Berserk 300 s).
- Raid-size assumptions: 40-man Classic Era; 15 nature-resist "soakers" (200+ NR; tanks 250–300) are the gear check. SoD uses different spell IDs (1215752/53/55/57, 1215885).

## Abilities

### Acid Spit
- Type: debuff on current tank (melee range)
- Target rule: current melee target (highest threat).
- Cast time: instant (on melee). Not interruptible.
- Cadence: unknown; stacks build to 10 in roughly 1–2 minutes in practice (tank rotation every ~7–10 stacks).
- Damage: 219–281 Nature every 2 s per stack, each application lasting 30 s; stacking (TenTonHammer: "over 50"). Not resistible (wiki), not dispellable.
- Telegraph: stack count; DBM/BW warn at 10 and call for the swap.

### Frenzy
- Type: enrage (dispellable)
- Cast time: instant. Cadence: BW ~14.5 s CD; DBM 11.3–25.9 s (first 6.5–25.9 s). Duration 8 s.
- Effect: +150% attack speed; while active she fires Poison Bolt at the 15 closest players (spell triggers every 4 s). Hunters have ~5 s to Tranquilizing Shot before the first volley (wiki).
- Debuff: Frenzy on the boss, dispel type Enrage (Tranquilizing Shot).
- Telegraph: boss enlarges 20%; BW/DBM "tranq now".

### Poison Bolt (volley)
- Type: AoE (multi-target)
- Target rule: the 15 closest players (pets excluded); 45 yd range, 100 yd radius.
- Cast time: instant. Cadence: every 4 s during Frenzy; every 2 s (Wowhead NPC/spell data) or 3 s (wiki, Tavern, Millenium) during Berserk; continuous after the 5-minute enrage.
- Damage: 1,500–2,500 Nature (tooltip; effect value 1,500; wiki "2000"), resistible. Also a Poison DoT "1,500 to 2,500 every 5 s until cancelled" per tooltip (dispellable Poison).
- Telegraph: none.

### Noxious Poison
- Type: targeted AoE debuff
- Target rule: a random player and everyone within 15 yd of them (spell radius).
- Cast time: instant. Cadence: DBM 11.3–37.6 s (first 11.3–38.8 s).
- Damage: 750 Nature every 2 s for 8 s (≈3,000 total; wiki 2,900) plus Silence for 8 s. No dispel type (cannot be cleansed, wiki).
- Movement: none. Does not spread.
- Telegraph: none.

### Wyvern Sting
- Type: AoE sleep
- Target rule: up to 10 players near a random point around her (wiki: "random area within melee range"; Tavern "15-yard AoE"). Spell radius 100 yd, so the 10-target cap is the real limiter.
- Cast time: instant. Cadence: BW first ~21 s then ~25 s "can randomly be way higher"; DBM 25.9–59.2 s (first 6.8–43.7 s).
- Effect: Asleep for 12 s; any damage cancels it. Dispel type Poison — dispelling it deals ~3,000 Nature to the target (wiki/guides; TTH 4,000).
- Rule: do not dispel except on the two main tanks (or an off-tank who needs to act).
- Telegraph: none.

### Berserk (30%)
- Type: enrage (permanent)
- Trigger: 30% HP (DBM pre-warn at 35%). +200% attack speed (tooltip; guides say "double"); triggers Poison Bolt every 2 s (spell data) on the 15 closest players. Lasts until death. Stops Frenzy/Noxious/Sting timers in boss mods (she just volleys).

### Timed enrage (5 min)
- After 5 minutes she spams Poison Bolt volleys at the raid regardless of distance (wiki); BW 300 s berserk bar.

## Adds
- None.

## Positioning and movement
- Tank: 2–3 tanks in nature-resist gear but with high HP (Acid Spit is unresistable). MT holds her; at ~7–10 Acid Spit stacks the next tank takes over threat (she is taunt-immune — the swap is by threat: the current tank stops attacking or uses Invulnerability Potion/Blessing of Protection, or simply stays asleep from Wyvern Sting). The stacked tank waits 30 s for stacks to expire.
- Melee DPS: the 15 soakers (rogues/warriors ideally, 200+ NR unbuffed, GNPP) stack on her the whole fight (Tavern: step in by 35%); they are the 15 closest so volleys never hit low-NR players. All 15 must survive; one death shifts a volley onto a cloth wearer.
- Ranged DPS: spread in stacks of 2–3, well apart, so Noxious Poison (15 yd) silences at most one small group; stay mounted/spread until 35%, never closer than the soakers. Casters hold Curse of Doom for 45% so it lands after 30%.
- Healers: split across soak groups (4 groups of melee with a priest each; Prayer of Healing on the stack); dispel Wyvern Sting only on tanks; nothing else is dispellable. Keep mana for the 30% burn.
- Whole raid: hunters outside the 15 keep Aspect of the Wild on the MT group; dwarves Stoneform (8 s poison immunity, still counted as a soaker) after their GNPP ends.

## What each role must do and must not do
- Tank:
  1. Build threat early; DPS waits for the first swap.
  2. Swap by threat at 7–10 Acid Spit stacks; do not rely on taunt (immune).
  3. Dispel only the tank who is asleep and needs to tank.
  4. Stay in the 15 closest during Berserk (you are a soaker).
- DPS:
  1. Soakers: be the 15 closest at all times after ~35%; pop GNPP at pull and on cooldown.
  2. Hunters: Tranquilizing Shot every Frenzy (within 5 s), rotation of 2–3 hunters.
  3. Ranged: spread; never dispel Wyvern Sting on non-tanks.
  4. Hold cooldowns for 30%; pace DPS so she dies well before 5:00 but do not over-aggro tanks early.
- Healer:
  1. Dispel: Wyvern Sting only on the two tanks (3,000 damage each dispel). Poison Bolt's DoT can be cleansed.
  2. Spike damage: soak group during Frenzy and all of Phase 2 (2,000 every 2–3 s on 15 people), tanks at high Acid Spit stacks, silenced groups.
  3. Pre-heal soakers before 30%; healers inside a Noxious Poison 15 yd cluster lose 8 s of casting — spread.

## Timeline of a typical pull
- t=0: MT engages; raid spread; soakers near the boss.
- t≈6–26 s: first Frenzy (tranq), first Poison Bolt volley if not tranqed within ~5 s.
- t≈7–44 s: first Wyvern Sting; t≈11–39 s: first Noxious Poison; both recur at the DBM variances above.
- Every ~60–90 s: tank swap at 7–10 Acid Spit stacks.
- ~35%: everyone's position final (15 soakers in).
- 30% (typically 2:30–3:30 in): Berserk — Poison Bolt every 2–3 s on the 15 closest; all heals on the soak groups; cooldowns.
- 5:00: timed enrage — raid-wide volleys, wipe.

## Open questions
- Poison Bolt cadence in Berserk: every 2 s (Wowhead NPC page and spell trigger) vs every 3 s (wiki, Tavern, Millenium) vs "2,000 every 5 s" (wiki soak section). Damage: 1,500–2,500 (spell) vs 2,000 (wiki) vs 1,000–1,500 (TenTonHammer, 2006).
- Wyvern Sting area: "random area within melee range" (wiki) vs "15-yard AoE" (Tavern) vs 100 yd spell radius with a 10-target cap. Cadence 25 s+ (BW) vs 25.9–59.2 s (DBM).
- Noxious Poison total: 2,900 (wiki) vs 3,000 (4 × 750 spell data).
- Acid Spit swap point: 7–9 (TTH), before 10 (Tavern, DBM); stack cap unknown ("over 50").
- Berserk attack speed: "+200%" tooltip vs "doubles" in guides.
- Boss HP labelled "Seasonal 40 Player" on Wowhead.
