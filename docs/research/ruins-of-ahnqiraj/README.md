# Ruins of Ahn'Qiraj (AQ20) research index

Per-boss research files following ../TEMPLATE.md. Classic Era, level 60, 20-man.

## Boss order and which are optional
| # | Boss | Area | Required? | File |
|---|------|------|-----------|------|
| 1 | Kurinnaxx | Scarab Terrace | Required (his death spawns Andorov for Rajaxx) | [kurinnaxx.md](kurinnaxx.md) |
| 2 | General Rajaxx | General's Terrace | Required (7 add waves + boss, started by talking to Lieutenant General Andorov) | [general-rajaxx.md](general-rajaxx.md) |
| 3 | Moam | The Reservoir | Optional | [moam.md](moam.md) |
| 4 | Buru the Gorger | The Hatchery | Optional | [buru.md](buru.md) |
| 5 | Ayamiss the Hunter | The Comb | Optional (hardest fight per Icy Veins / Warcraft Tavern) | [ayamiss.md](ayamiss.md) |
| 6 | Ossirian the Unscarred | Watchers' Terrace | Required (final boss) | [ossirian.md](ossirian.md) |

Icy Veins' hub says "3 of them are optional and can be skipped to get to Ossirian" (Moam, Buru, Ayamiss); warcraft.wiki.gg explicitly marks only Moam as skippable. No attunement; the raid reset was 3 days in Classic (daily after patch 7.0.3 on retail).

## Raid composition assumptions
- 20 players: 2 warrior tanks (Ossirian is taunt-immune and needs two threat-builders; Kurinnaxx needs a Mortal Wound swap), 5-7 healers, ranged/caster-heavy DPS (Warcraft Tavern).
- Mana-drain classes for Moam: at least 1 hunter (Viper Sting) and 3-4 priests/warlocks (Mana Burn / Drain Mana); warlocks also Banish the Mana Fiends.
- Fast kiters for Buru (rogue, mage, shaman, druid) and fear classes for hatchlings.
- A Nature Resistance caster "tank" for Ayamiss' air phase (mage/warlock/hunter); Nature Resistance Totem / Aspect of the Wild; Greater Nature Protection Potions for Buru phase 2 and Ayamiss.
- Ossirian: a mounted spotter (rogue), a mobile crystal clicker (mage Blink / druid Travel Form), casters covering all five schools, hunters for Track Elementals, Free Action Potions for tanks, mages/druids for decursing.
- Gear level: ZG/MC (Tier 1) or better makes the instance "a lot simpler" (wiki); epics not required.

## What the files contain
Each file has: Overview, Abilities (one subsection per ability with type, target rule, cast time, cadence, damage/radius, debuff, movement effect, telegraph), Adds, Positioning per role, must/must-not lists per role, a timeline of a typical pull, and Open questions listing every disagreement between sources. Numbers are tagged with their source in the Sources list at the top of each file.

## Sources used across the raid (fetched)
- warcraft.wiki.gg boss and NPC pages (Kurinnaxx, General Rajaxx, Moam, Buru the Gorger, Ayamiss the Hunter, Ossirian the Unscarred, Lieutenant General Andorov, Kaldorei Elite, Captain Drenn, Mana Fiend, Buru Egg, Hive'Zara Larva, Hive'Zara Hatchling, Ruins of Ahn'Qiraj).
- Wowhead Classic strategy guides for all six bosses, fetched through the r.jina.ai text proxy (wowhead.com/classic/guide/<boss>-ruins-of-ahnqiraj-strategy), and Wowhead Classic NPC pages (health values shown are labelled "SoM 20 Player").
- Warcraft Tavern AQ20 guide: https://www.warcrafttavern.com/wow-classic/guides/ruins-of-ahnqiraj-aq20/
- TenTonHammer AQ20 guide sections 2.1 to 2.6 (2006, vanilla-era numbers).
- Millenium AQ20 guide pages 2-4: https://us.millenium.gg/guide/6975.html
- wotlkdb.com spell pages (3.3.5a client data) for every ability spell ID; Wowhead's own spell pages returned 403.
- AzerothCore and CMaNGOS-classic boss scripts (GitHub raw) for emulator timers, phase thresholds and target rules. These are reconstructions, not Blizzard data; they are labelled "emulator" wherever used.

## Sources that could not be fetched
- Wowhead spell/NPC pages and tooltip endpoint (HTTP 403, including with a browser user agent); Wowhead comments (JS-loaded, not in the proxy output).
- Wowpedia (fandom) pages (HTTP 402); warcraft.wiki.gg was used instead.
- Icy Veins Classic boss guides (bot-verification wall on direct fetch, curl and proxy); only search snippets were available.
- cn.classic.wowhead.com guides (403), mmogah (403), sage-guide (404), classic.warcraftdb.com (unrendered JS template).
- Warcraft Logs Classic reports (JS-rendered; no report with cast timelines could be read). All cadences are therefore emulator values cross-checked against guide text.
