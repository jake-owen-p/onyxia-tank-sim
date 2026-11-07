# Molten Core (Classic Era, 40-man) — research index

One file per boss, each following `../TEMPLATE.md`. All numbers carry their source URL inside the file; where sources disagree the competing values are in that file's "Open questions".

## Boss order

Standard Era route (Wowhead/Icy Veins/wiki.gg; Sulfuron and Golemagg are sometimes swapped):

| # | Boss | File | Required for Majordomo (rune) | Era 40-man HP |
|---|------|------|-------------------------------|---------------|
| 1 | Lucifron | [lucifron.md](lucifron.md) | no rune, but drops Tome of Tranquilizing Shot | 351,780 |
| 2 | Magmadar | [magmadar.md](magmadar.md) | yes (Rune of Kress) | 826,088 |
| 3 | Gehennas | [gehennas.md](gehennas.md) | yes (Rune of Mohn) | 351,780 |
| 4 | Garr | [garr.md](garr.md) | yes (Rune of Blaz) | 659,538 |
| 5 | Baron Geddon | [baron-geddon.md](baron-geddon.md) | yes (Rune of Zeth) | 586,256 |
| 6 | Shazzrah | [shazzrah.md](shazzrah.md) | yes (Rune of Mazj) | 351,780 |
| 7 | Sulfuron Harbinger | [sulfuron-harbinger.md](sulfuron-harbinger.md) | yes (Rune of Koro) | 439,692 |
| 8 | Golemagg the Incinerator | [golemagg.md](golemagg.md) | yes (Rune of Theri) | 826,088 |
| 9 | Majordomo Executus | [majordomo-executus.md](majordomo-executus.md) | spawns after the 7 runes are doused | 666,200 (not killable) |
| 10 | Ragnaros | [ragnaros.md](ragnaros.md) | summoned via Executus | 1,099,230 |

HP values are the pre-Cataclysm 40-player values from Wowhead's TBC database (Molten Core was not retuned between 1.12 and 3.3.5). Wowhead Classic shows "Seasonal 40 Player" values that are exactly double (e.g. Lucifron 703,560) — those are Season of Mastery/Anniversary numbers, not Era.

## Bosses whose adds must be modelled

| Boss | Adds | Why they matter for a rehearsal sim |
|------|------|-------------------------------------|
| Lucifron | 2x Flamewaker Protector (90,650 HP) | Cleave frontal cone; Dominate Mind (2 s cast, 20 yd, 15 s MC) every ~15 s per add; kill order adds first |
| Gehennas | 2x Flamewaker (77,700 HP) | Fist of Ragnaros 8 yd 4 s AoE stun, Sunder Armor stacking; tanked apart, killed first |
| Garr | 8x Firesworn (61,040 HP) | Banish management, 15 yd Eruption knockback on death, Separation Anxiety if >15 yd (guides) from Garr, +9% Garr attack speed per death, Garr detonates adds after 6 min (emulator) |
| Sulfuron Harbinger | 4x Flamewaker Priest (67,980 HP) | 2 s Dark Mending (~30k heal) interrupts, Immolate/SW:Pain dispels, Inspire if within 45 yd of Sulfuron; killed one at a time first |
| Golemagg | 2x Core Rager (80,925 HP, unkillable) | Must be kited 30+ yd from Golemagg (Golemagg's Trust), heal to full below 50%, die when he dies |
| Majordomo Executus | 4x Flamewaker Healer (97,680 HP) + 4x Flamewaker Elite (103,600 HP) | The adds ARE the encounter; Polymorph on Healers until 4 adds die; shields (Magic Reflection / Damage Shield) every ~30 s for 10 s; Executus teleports the tank into the coals every ~25–30 s |
| Ragnaros | 8x Son of Flame (15,260 HP) every 3 min submerge; Flame of Ragnaros (knockback summon) | 90 s Sons phase, 10 yd mana-burn aura, early emerge when all dead/banished |

Magmadar, Baron Geddon and Shazzrah have no adds in Era (Season of Mastery adds Core Hounds to Magmadar and an Image to Shazzrah — noted in the files but not required).

## Raid composition assumptions (Era 40-man, from the fetched guides)

- Tanks: 2 for Lucifron/Gehennas/Magmadar (MT + OT for adds), 1–2 + Warlock banishes for Garr, 1 for Geddon, 1 (+ group off-tanks or a Paladin) for Shazzrah, 5 for Sulfuron on first kills (Wowhead/Warcraft Tavern), 3–4 for Golemagg (2 swapping on the boss, 1 per Core Rager), 4–5 + hunters for Majordomo, 2 for Ragnaros (MT with 300–315 Fire Resistance plus an OT in melee for Wrath knockbacks).
- Healers: ~10–12. Priests (Dispel Magic, Fear Ward for dwarves, Shadow Protection) and Paladins (Cleanse) are the Magic dispellers for Impending Doom, Dominate Mind, Ignite Mana, Immolate, SW:Pain; Shamans bring Tremor Totem and Purge; Druids are primary decursers alongside Mages.
- Decursers: all Mages and Druids. Lucifron's Curse, Gehennas' Curse and Shazzrah's Curse are raid-wide (45 yd DBC radius) and must be removed within seconds; Mages spend most of those fights decursing. Restorative Potions (2 min) as backup.
- Hunters: at least 2 with Tranquilizing Shot (Tome from Lucifron) for Magmadar's Frenzy; hunters also pull adds and kite Elites on Majordomo.
- Warlocks: 4–5 for Garr banishes; Curse of Weakness/Siphon Life on Core Ragers; a few banishes on Sons of Flame (never all).
- Fire Resistance: MT 300–315 for Geddon's Inferno and Ragnaros; melee ~200 and casters ~100–150 for Ragnaros (wiki.gg / Ten Ton Hammer); Greater Fire Protection Potions raid-wide for Geddon, Golemagg and Ragnaros; Shadow Protection for Lucifron/Gehennas/Sulfuron.
- Consumables that change mechanics: Free Action Potion (Fist of Ragnaros, Hand of Ragnaros, Magma Shackles), Restorative Potion (curses, Ignite Mana), Light Feather/Slow Fall (Living Bomb fall damage).

## How the numbers were obtained

- Spell data (cast time, cooldown, radius, duration, dispel type, damage) comes from `wotlkdb.com/?spell=<vanilla id>` (3.3.5a client data; Molten Core spells kept their 1.x IDs and values). Each boss file lists the IDs.
- NPC level/HP/mana: Wowhead TBC and Classic NPC pages read through the `r.jina.ai` reader proxy (Wowhead blocks direct fetches).
- Ability cadences: no Warcraft Logs report could be fetched (JS-only). Cadences are therefore from (a) guide statements (Wowhead Classic guides, wiki.gg, Ten Ton Hammer 2005) and (b) the cmangos `mangos-classic` and `scriptdev2-classic` boss scripts, which encode community-measured timers. Both are recorded; treat emulator timers as ±25%.
- Positioning and role rules: warcraft.wiki.gg boss pages and Ragnaros (tactics), Wowhead Classic strategy guides, Warcraft Tavern encounter pages (classic.warcraftdb.com), wowtbc.gg, legacy-wow.com (1.12 guides), Ten Ton Hammer (2005 guides).
- Blocked/unavailable: wowhead.com direct, icy-veins.com (bot check even via proxy), warcraftlogs.com, wowwiki/fandom (402), vanilla-twinhead (403), web.archive.org.

## Sources (union of all boss files)

- https://warcraft.wiki.gg/wiki/Lucifron, /Magmadar, /Gehennas, /Garr, /Baron_Geddon, /Shazzrah, /Sulfuron_Harbinger, /Golemagg_the_Incinerator, /Majordomo_Executus, /Ragnaros, /Ragnaros_(tactics), /Firesworn, /Flamewaker_Protector, /Core_Rager, /Son_of_Flame, /Flamewaker_Priest, /Flamewaker_Healer, /Flamewaker_Elite, /Category:Flamewakers
- https://www.wowhead.com/tbc/npc=12118, 12119, 11982, 12259, 11661, 12057, 12099, 12056, 12264, 12098, 11662, 11988, 11672, 12018, 11664, 12143 and https://www.wowhead.com/wotlk/npc=11663, 12143 (via r.jina.ai) — HP, levels, ability IDs
- https://www.wowhead.com/classic/npc=<same ids> (via r.jina.ai) — Seasonal HP
- https://www.wowhead.com/classic/guides/<boss>-molten-core-strategy for all ten bosses, and https://www.wowhead.com/classic/news/wow-classic-molten-core-raid-strategy-guides-and-boss-tips-295175 (via r.jina.ai)
- https://wotlkdb.com/?spell= 19702 19703 19460 20603 20604 20691 19451 19408 19411 20474 19428 19449 19450 19272 19716 19717 19728 19729 20277 24317 19730 19492 19496 19516 19497 20483 20294 15733 23492 19695 19698 19659 20475 20476 20478 20479 19712 19713 19714 19715 23138 23139 21655 19778 19779 19780 19781 19775 19777 19776 23952 36144 13879 13880 37667 20228 19798 19953 20553 20556 19820 20619 21075 20620 20618 20534 20229 20623 21077 29564 21087 21086 21090 21094 21095 19773 20566 20564 20565 21387 21388 21154 21155 21908 21886 21158 17731 21108 21107 20568 21857 21858
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/molten_core/boss_{lucifron,magmadar,gehennas,garr,baron_geddon,shazzrah,sulfuron_harbinger,golemagg,majordomo_executus,ragnaros}.cpp
- https://raw.githubusercontent.com/scriptdev2/scriptdev2-classic/master/scripts/eastern_kingdoms/molten_core/boss_{baron_geddon,shazzrah,magmadar,majordomo_executus,ragnaros}.cpp
- https://classic.warcraftdb.com/data/encounter/236 … 245 (Warcraft Tavern encounter guides, via r.jina.ai)
- https://warcrafttavern.com/wow-classic/guides/raserisks-molten-core-boss-guide-lucifron
- https://wowtbc.gg/classic/boss-guides/molten-core
- https://www.tentonhammer.com/guides/mc-boss-guide-boss-{1-lucifron,2-magmadar,3-gehennas,4-garr,5-baron-geddon,6-shazzrah,7-golemagg,10-ragnaros}
- https://legacy-wow.com/?p=10547, /molten-core-boss-guide-magmadar/, /molten-core-boss-guide-gehennas/, /molten-core-boss-guide-garr/
- https://mein-mmo.de/en/wow-classic-how-much-blizzard-buffs-the-molten-core-in-the-classic-mode,742902 (Season of Mastery changes)
