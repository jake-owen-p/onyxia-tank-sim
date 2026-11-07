# Blackwing Lair (Classic Era, 40-man) — research index

One file per boss, each following `/Users/jake/wow/docs/research/TEMPLATE.md`:

| # | Boss | File | HP (classicdb.ch) | One-line mechanic |
|---|------|------|-------------------|-------------------|
| 1 | Razorgore the Untamed | [razorgore.md](razorgore.md) | 449,685 | Mind-control him to destroy 30 eggs while kiting up to 52 adds; then tank-and-spank with Conflagration threat drops |
| 2 | Vaelastrasz the Corrupt | [vaelastrasz.md](vaelastrasz.md) | 3,331,000 (starts at 30% ≈ 1.0M) | 3-minute Essence of the Red burn; Burning Adrenaline bombs every ~16 s, tank bomb every 45 s |
| 3 | Broodlord Lashlayer | [broodlord-lashlayer.md](broodlord-lashlayer.md) | 916,025 | Threat fight: Knock Away halves tank threat, Mortal Strike -50% healing, Blast Wave 20 yd; Suppression Room before him |
| 4 | Firemaw | [firemaw.md](firemaw.md) | 999,300 | Flame Buffet stacks on everyone in LoS; door-frame LoS dance; Wing Buffet taunt swaps |
| 5 | Ebonroc | [ebonroc.md](ebonroc.md) | 999,300 | Shadow of Ebonroc (8 s, heals 25k per hit) → instant taunt swaps; three tanks |
| 6 | Flamegor | [flamegor.md](flamegor.md) | 999,300 | Frenzy every ~10–15 s pulses Fire Nova to the raid; hunter Tranquilizing Shot rotation |
| 7 | Chromaggus | [chromaggus.md](chromaggus.md) | 1,832,050 | Two fixed breaths alternating every 30 s (LoS), five Brood Afflictions (4 dispel types + Hourglass Sand), Frenzy, 20% enrage, school vulnerability |
| 8 | Nefarian | [nefarian.md](nefarian.md) | 2,100,000 (suspect) | 42 drakonids, room-wide Shadow Flame (Onyxia Scale Cloak), class calls every 30 s, Bone Constructs at 20% |

## Boss order and layout
- Zone: Blackwing Lair, top of Blackrock Spire; entered via the Orb of Command in Blackrock Mountain after the attunement quest "Blackhand's Command" (UBRS). 40 players, 7-day lockout. Boss order is linear and every boss gates the next door: Razorgore (Dragonmaw Garrison / egg chamber) → Vaelastrasz (Shadow Wing Lair) → Suppression Room → Broodlord Lashlayer (Halls of Strife) → Crimson Laboratories: Firemaw → Ebonroc → Flamegor → Chromaggus' Lair → Nefarian's Lair. All eight are required to reach Nefarian (the three drakes patrol the laboratory you must cross; in practice nobody skips them). Source: https://warcraft.wiki.gg/wiki/Blackwing_Lair
- Trash by area (Warcraft Wiki): Blackwing Guardsman/Legionnaire/Mage and Death Talon Dragonspawn (egg room, spawned during Razorgore); Blackwing Technicians (Vael's room, flee on pull, drop Hourglass Sand and Elementium); Death Talon Captain/Flamescale/Seether/Wyrmkin (Death Talon room — Seethers have Frenzy and a 925–1076 Flame Buffet that adds +1000 Fire taken; Wyrmkin have Blast Wave and Fireball Volley); Death Talon Hatchers, Blackwing Taskmasters and Corrupted Whelps (Suppression Room); Blackwing Spellbinder/Warlock/Technician, Enraged Felguard, Death Talon Overseer (lab packs); Death Talon Wyrmguards (before Chromaggus); drakonids and Bone Constructs (Nefarian's lair).

## The Suppression Room (between Vaelastrasz and Broodlord)
- Two long rooms in the Halls of Strife filled with Suppression Devices. Each device pulses Suppression Aura (spell 22247): movement speed -80%, time between attacks +400%, casting speed -80%, 6 s duration refreshed constantly, 20 yd radius. Source: https://classicdb.ch/?spell=22247 ; https://warcraft.wiki.gg/wiki/Suppression_Device
- Only rogues can deactivate them in Classic (Disarm Trap in Stealth, with Distract to avoid detection). A disarmed device re-arms after a random 30 s to 2 min while Broodlord lives (cmangos script) and cannot be re-disarmed for 1 s after re-arming (Warcraft Wiki). After Broodlord dies they stay off for the lockout.
- Each device is guarded by non-elite Corrupted Whelps (Red/Green/Blue/Bronze) that respawn every 30 s; mages/warlocks AoE them.
- Patrolling elites: Death Talon Hatchers (level 61, 87,930 HP, Flamestrike, stacking Growing Flames aura 50 Fire/2 s in 15 yd — tank them in the far corner of a cubby) and Blackwing Taskmasters (level 62, 51,485 HP, Healing Circle, Shadow Shock; groups of three — sheep two). Both respawn on a 20-minute timer, so the room is cleared cubby by cubby without idling; a new raid takes 20–40 minutes (Ten Ton Hammer). A wipe on Broodlord means clearing it again.
- Sources: https://warcraft.wiki.gg/wiki/Broodlord_Lashlayer ; https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-four ; https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ ; https://classicdb.ch/?npc=12468 ; https://classicdb.ch/?npc=12458

## Raid composition assumptions (40-man Classic Era)
- Roughly five of each class with 13–15 healers (Warcraft Tavern). Hard requirements that the boss files assume:
  - 5+ warriors for the Vaelastrasz tank rotation (3–4 tank deaths expected); 3 tanks for each drake and for Chromaggus; 4–6 kiting warriors for Razorgore phase 1.
  - At least 2 rogues for Suppression Devices (two stay stealthed during Broodlord).
  - 3+ hunters for Tranquilizing Shot rotations on Flamegor and Chromaggus (Frenzy every ~10–18 s vs a 20 s Tranq cooldown).
  - Mages with Detect Magic (Chromaggus vulnerability) and Ice Block; decursers (mages/druids) beside the Nefarian tank for Veil of Shadow; a dwarf priest (Fear Ward) or shaman (Tremor Totem) with the Nefarian MT.
  - Paladins/priests/druids/shamans for the four dispel types on Chromaggus (Disease, Poison, Magic, Curse).
- Gear/consumables assumed: Onyxia Scale Cloak on every raider from Firemaw onward (mandatory for Shadow Flame on all three drakes and Nefarian); Fire Resistance ~100 for casters/healers, 150–200 for melee, as high as possible for tanks (Vael, Firemaw, Flamegor, Broodlord); Shadow Resistance helps the Ebonroc/Nefarian tanks; Hourglass Sand (~5 per raider), Restorative Potions, Greater Fire/Shadow Protection Potions, Stratholme Holy Water and Sapper Charges for Nefarian phase 3.
- Sources: https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ ; https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-three ; https://warcraft.wiki.gg/wiki/Onyxia_Scale_Cloak ; https://classicdb.ch/?spell=22683

## How to read the numbers
- Spell tooltips, durations, radii, dispel types and NPC HP come from classicdb.ch (Classic 1.12 client data). A "base value" is the pre-level-scaling number in the DBC; where a guide quotes an observed range it is listed next to it.
- Cadences come from three kinds of source, named in each file: (a) Classic guides (Warcraft Wiki, Warcraft Tavern, Ten Ton Hammer 2006, Millenium); (b) boss mods tuned on live Classic logs — BigWigs_Classic and DBM-Vanilla (DBM "v" ranges are measured min–max from logs); (c) the cmangos classic emulator scripts, which are community approximations and are flagged as such. Where these disagree the values are listed under each boss's Open questions.
- Season of Mastery / Season of Discovery sources (yttrium-tyclief SoD guides, Icy Veins SoM text) were used only for positioning that carries over to Era and are labelled.

## Sources (whole raid)
- Warcraft Wiki boss and item pages: https://warcraft.wiki.gg/wiki/Razorgore_the_Untamed , https://warcraft.wiki.gg/wiki/Vaelastrasz_the_Corrupt , https://warcraft.wiki.gg/wiki/Broodlord_Lashlayer , https://warcraft.wiki.gg/wiki/Firemaw , https://warcraft.wiki.gg/wiki/Ebonroc , https://warcraft.wiki.gg/wiki/Flamegor , https://warcraft.wiki.gg/wiki/Chromaggus , https://warcraft.wiki.gg/wiki/Nefarian_(tactics) , https://warcraft.wiki.gg/wiki/Blackwing_Lair , https://warcraft.wiki.gg/wiki/Suppression_Device , https://warcraft.wiki.gg/wiki/Onyxia_Scale_Cloak , https://warcraft.wiki.gg/wiki/Hourglass_Sand , https://warcraft.wiki.gg/wiki/Orb_of_Domination
- Classic database (NPC and spell pages): https://classicdb.ch/?npc=12435 , 12557, 12416, 12420, 12422, 13020, 12017, 11983, 14601, 11981, 14020, 11583, 10162, 14261–14265, 14302, 14605, 12468, 12458, 12464, 12465, 12461, 14662–14668 and https://classicdb.ch/?spell=<id> for every ability ID cited in the boss files
- Classic-era guides: https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/ ; https://www.tentonhammer.com/guides/blackwing-lair-guide-7-25-06-page-two through -page-eight ; https://us.millenium.gg/guide/6486.html?page=2 through ?page=7 ; https://docs.google.com/document/d/1VT_67cPSHqvRK2_yit0QSiyzGwf9oXTKjcinxsVymoA (warlock BWL notes)
- Season of Discovery guides (positioning only): https://yttrium-tyclief.github.io/sod-guides/bwl/ (razorgore, vael, broodlord, firemaw, twindrakes, chromaggus, nefarian)
- Boss mods: https://github.com/BigWigsMods/BigWigs_Classic/tree/master/BlackwingLair ; https://github.com/DeadlyBossMods/DBM-Vanilla/tree/master/DBM-Raids-Vanilla/BWL (+ localization.en.lua for yell texts)
- Emulator scripts: https://github.com/cmangos/mangos-classic/tree/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/blackwing_lair
- Not reachable from this environment (noted so nobody re-tries): Wowhead (all locales, region-blocked), Icy Veins and Wowpedia/Fandom (Cloudflare challenge), Warcraft Logs (JavaScript app), web.archive.org (blocked), Hydra guild runbooks (members-only).
