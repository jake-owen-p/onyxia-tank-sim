# Naxxramas (Classic Era, level 60, 40-man) — research index

One file per boss, all following `docs/research/TEMPLATE.md`. Written 2026-11-07 from fetched sources (no numbers from memory); every number in a boss file carries its URL in that file's Sources list.

## Wing order and files

Wings can be cleared in any order; bosses inside a wing are sequential. Frostwyrm Lair unlocks after all 13 wing bosses are dead. Common clear order (Warcraft Tavern): Abomination → Plague → Spider → Deathknight → Sapphiron → Kel'Thuzad. The wiki lists the wings in rising difficulty as Abomination, Plague, Spider, Deathknight.

| Wing | Boss | File | HP (classicdb.ch / wiki) | Enrage / limit |
|---|---|---|---|---|
| Spider | Anub'Rekhan | [anubrekhan.md](anubrekhan.md) | 1,500,000 / 1,665,500 | none (Locust Swarm every ~90 s) |
| Spider | Grand Widow Faerlina | [faerlina.md](faerlina.md) | 1,312,027 / — | soft: 4 Worshippers ≈ 4:45 |
| Spider | Maexxna | [maexxna.md](maexxna.md) | 1,453,127 / — | Enrage at 30% |
| Plague | Noth the Plaguebringer | [noth.md](noth.md) | 1,492,487 / — | soft: 3rd balcony (~9 min) |
| Plague | Heigan the Unclean | [heigan.md](heigan.md) | 1,762,431 / 1,780,000 | none (135 s dance cycle) |
| Plague | Loatheb | [loatheb.md](loatheb.md) | 5,200,000 / — | soft: Doom every ~15 s after 5:05 |
| Military | Instructor Razuvious | [razuvious.md](razuvious.md) | 1,935,232 / — | none |
| Military | Gothik the Harvester | [gothik.md](gothik.md) | 150,000 / — | soft: Harvest Soul stacks; P2 at 4:30 |
| Military | The Four Horsemen | [four-horsemen.md](four-horsemen.md) | 810,000 ×4 / — | 100 marks ≈ 20 min |
| Construct | Patchwerk | [patchwerk.md](patchwerk.md) | 3,850,000 / 3,850,000 | Berserk 7:00 |
| Construct | Grobbulus | [grobbulus.md](grobbulus.md) | 2,116,591 / — | Enrage 12:00 |
| Construct | Gluth | [gluth.md](gluth.md) | 1,466,075 / — | Enrage after 3rd Decimate (~5:30) |
| Construct | Thaddius | [thaddius.md](thaddius.md) | 6,540,378 / ~6,657,000 (+2×~495k wights) | Berserk 5:00 into P2 |
| Frostwyrm Lair | Sapphiron | [sapphiron.md](sapphiron.md) | 2,600,000 / 3,164,450 | Berserk 15:00 |
| Frostwyrm Lair | Kel'Thuzad | [kelthuzad.md](kelthuzad.md) | 2,500,000 / ~3,150,000 | none (P3 Blood Tap) |

## Raid composition assumptions used in the files

- 40 players, Classic Era (not Season of Discovery, not Wrath). Where Wowhead showed only "Seasonal 40 Player" HP, it was ignored and classicdb.ch / warcraft.wiki.gg values were used instead.
- Tanks: 4–8 warriors/feral druids depending on the boss (Four Horsemen 8; Anub'Rekhan 4–5; Patchwerk 1+3; Thaddius 2+2 backups; Kel'Thuzad 6–7; Razuvious uses Mind-Controlled Understudies).
- Healers: 10–13 (Sapphiron ≥12). Priests: ≥3 (Razuvious MC rotation, Faerlina MC, Kel'Thuzad shackles, Gothik shackles). Mages/Druids: enough decursers for Noth and Sapphiron. Hunters: Tranquilizing Shot (Gluth), Aspect of the Pack (Anub'Rekhan), kiting.
- Consumables assumed: Greater Nature Protection (Spider wing, Grobbulus, Gluth tunnel, Thaddius), Greater Shadow Protection (Loatheb, Noth adds), Greater Fire Protection (Faerlina, Horsemen/Mograine), Greater Frost Protection + ~150 frost resistance (Sapphiron, light for Kel'Thuzad), Free Action Potion (Crypt Guard Web), Flask of the Titans / Stoneshield (Patchwerk off-tanks).
- Attunement: "The Dread Citadel – Naxxramas" at Light's Hope Chapel (Honored 60 g + 5 Arcane Crystal + 2 Nexus Crystal + 1 Righteous Orb; Revered 30 g + 2 Arcane Crystal + 1 Nexus Crystal; Exalted free). Entrance via the Plaguewood teleport spire. No exit except hearth/portal once inside.

## Sources and how they were used

- **warcraft.wiki.gg `<Boss> (Classic)` pages** — primary Classic narrative, numbers, phase timings, quotes. `https://warcraft.wiki.gg/wiki/Naxxramas_(Classic)` for wing order, attunement, resistances.
- **Wowhead Classic** — region-blocked from this machine; fetched through the `r.jina.ai` reader proxy. Spell pages (`/classic/spell=<id>`) gave cast times, cooldowns, durations, radii, dispel types and effect values; the `/classic/guide/<boss>-naxxramas-raid-strategy` guides (Rokman, 2020, updated 2025) gave role tips and spell IDs; NPC pages gave quotes and (Era) add HP where shown.
- **classicdb.ch** — Classic database used for every boss/add HP, melee damage and armor (`?npc=<id>`), plus a cross-check on Locust Swarm.
- **DBM-Vanilla (GitHub, DeadlyBossMods/DBM-Vanilla, `DBM-Raids-Vanilla/VanillaNaxx/*`)** — log-derived boss-mod timers: real cadences, first-cast times, phase timers, wave tables (Gothik), mark timers (Horsemen), doom schedule (Loatheb), eruption cadence (Heigan). Values marked "Unknown in Classic" in the Lua are flagged in the files.
- **TrinityCore `boss_heigan.cpp`** — emulator script used only for Heigan's eruption/dance timers and section logic.
- **Warcraft Tavern Classic Naxxramas guide** (`https://www.warcrafttavern.com/wow-classic/guides/naxxramas/`) — second Classic strategy opinion per boss.
- **Method — "Wormie's Classic Vanilla: Naxxramas Proper"** — 2006 world-first-era recollection (Spider wing).
- **Ten Ton Hammer Naxxramas guides** — Wrath-era (2008) numbers; used only where explicitly labelled as Wrath context.
- **Not reachable**: Icy Veins Classic (Cloudflare challenge), Warcraft Logs Classic (bot protection), Fandom WoWWiki archive (402/challenge), web.archive.org through the proxy (blocked). Classic log-derived cadences therefore come from DBM-Vanilla rather than Warcraft Logs reports.

## Cross-boss open questions

- classicdb.ch and warcraft.wiki.gg disagree on several HP values (Anub'Rekhan, Sapphiron, Kel'Thuzad, Thaddius, Crypt Guard, Worshipper, Zombie Chow, several Gothik/Kel'Thuzad adds); both are recorded per file.
- Guides give round cadences (12/15/20/30/60 s); DBM-Vanilla shows variable windows for many of them (recorded per file as "for a sim, use the DBM range").
- Kel'Thuzad's Phase 1 length differs sharply: 5:10 (wiki/WT) vs 229–231 s (DBM, after a July 2026 patch note).
- Several Classic spell IDs linked by Wowhead's guides are generic placeholders (e.g. Enrage 19953, Holy Wrath 10320, Blink 29211); DBM's IDs are noted where they differ.
