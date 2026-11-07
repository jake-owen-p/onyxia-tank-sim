# Temple of Ahn'Qiraj (AQ40) — boss research index

Research notes for a browser rehearsal simulator. One file per boss, all following `/Users/jake/wow/docs/research/TEMPLATE.md`. Every number is attributed to a URL inside the boss file; disagreements are listed in each file's "Open questions".

## Boss order

Full clear (Warcraft Tavern / Icy Veins route):

| # | Boss | File | Required? |
|---|------|------|-----------|
| 1 | The Prophet Skeram | [skeram.md](skeram.md) | required (gates the instance) |
| 2 | Bug Trio — Vem, Lord Kri, Princess Yauj ("Silithid Royalty") | [bug-trio.md](bug-trio.md) | optional |
| 3 | Battleguard Sartura | [sartura.md](sartura.md) | required |
| 4 | Fankriss the Unyielding | [fankriss.md](fankriss.md) | required |
| 5 | Viscidus | [viscidus.md](viscidus.md) | optional |
| 6 | Princess Huhuran | [huhuran.md](huhuran.md) | required |
| 7 | Twin Emperors — Vek'lor and Vek'nilash | [twin-emperors.md](twin-emperors.md) | required |
| 8 | Ouro | [ouro.md](ouro.md) | optional |
| 9 | C'Thun | [cthun.md](cthun.md) | required (final) |

Efficient route skipping optionals: Skeram > Sartura > Fankriss > Huhuran > Twin Emperors > C'Thun. Trash before Skeram respawns in 30 min; the C'Thun trash is widely called harder than most bosses.

## Hard limits worth building into the sim
- Sartura: 10 min berserk. Huhuran: 5 min berserk, 30% Berserk phase. Twin Emperors: 15 min berserk. Bug Trio: 15 min enrage. Ouro: 20% Berserk, no timer. Skeram, Fankriss, Viscidus, C'Thun: no timer found.
- Phase/HP triggers: Skeram splits at 75/50/25%; Sartura Enrage at 20%; Huhuran Berserk at 30%; Ouro Berserk at 20%; C'Thun phase change on the Eye's death.

## Raid composition assumptions
- 40 players, Classic Era (not Season of Mastery / Season of Discovery). Warcraft Tavern: roughly 5 of each class; at least 100 nature resistance raid-wide.
- Tanks: 4 warrior/druid tanks with 200+ nature resistance (250–300 for Huhuran). Fankriss wants 2 main tanks plus 3 hatchling tanks and 1–2 Intercept "worm" tanks; Sartura 4 tanks; Skeram 3–6 (one or two per platform); Ouro 3 rotating tanks.
- Twin Emperors: 2 warlock tanks (150–300 shadow resistance, 8,000+ HP) plus 2 warriors; a bug team of 3 mages + 2 warriors + 1 healer.
- Huhuran: 15 melee "soakers" with 200+ nature resistance unbuffed, 3 hunters for Tranquilizing Shot.
- Viscidus: frost casters (mages with rank 1 Frostbolt), frost wands for priests/warlocks, fast weapons + Frost Oil on melee, many poison cleansers.
- C'Thun: 8 groups of 5 (2 healers, 1 melee/tank, 1 ranged, 1 flex) spread 10 yd apart.
- Consumables everywhere: Greater Nature Protection Potions (Viscidus, Huhuran, C'Thun pull), Goblin Sapper Charges (Viscidus globs, Yauj Brood, Ouro scarabs).

## Numbers: how to read them
- Wowhead Classic NPC health is labelled "Seasonal 40 Player" on the pages fetched; the plain 40-player Era value was not shown. Treat them as upper bounds and compare with the vanilla wiki figures quoted in the files (e.g. C'Thun tentacles differ ~2x).
- Spell "base values" from Wowhead (e.g. Arcane Explosion 388, Earth Shock 654) scale with caster level and often understate what players actually take; the guide figures (1.5k / up to 3k) are the better sim defaults.
- Cadences marked as BigWigs/DBM come from the boss-mod source code (variable timers are written as min–max from DBM's `v` timers); they are the most reliable real-pull numbers available here.

## Sources used across the raid (all fetched)
- Wiki: https://warcraft.wiki.gg/wiki/The_Prophet_Skeram , /wiki/Bug_Trio (Silithid Royalty), /wiki/Battleguard_Sartura , /wiki/Fankriss_the_Unyielding , /wiki/Viscidus , /wiki/Princess_Huhuran , /wiki/Twin_Emperors , /wiki/Ouro , /wiki/C'Thun_(tactics) , /wiki/C%27Thun , /wiki/Vem , /wiki/Lord_Kri , /wiki/Princess_Yauj , /wiki/Spawn_of_Fankriss
- Wowhead Classic (fetched through the r.jina.ai text proxy because wowhead.com returns 403 to direct fetches): NPC pages 15263, 15544, 15511, 15543, 15516, 15984, 15510, 15630, 15962, 15299, 15667, 15509, 15276, 15275, 15517, 15718, 15589, 15727, 15725, 15726, 15728, 15334, 15802; spell pages 26192, 26194, 785, 26083, 26084, 25174, 8269, 26027, 25646, 720, 25832, 25991, 25993, 25989, 26050, 26180, 26053, 26051, 26068, 26052, 26580, 25807, 25812, 25786, 26561, 18670, 25790, 7393, 800, 802, 804, 26006, 26007, 26613, 26607, 568, 26102, 26103, 26100, 26615, 26616, 26134, 26029, 26476, 26143, 26139, 26141; strategy guides for Skeram, Bug Trio, Sartura, Fankriss, Viscidus, Huhuran, Ouro, C'Thun (the Twin Emperors guide URL 404s)
- Boss-mod source: https://github.com/BigWigsMods/BigWigs_Classic (AQ40/*.lua) and https://github.com/DeadlyBossMods/DBM-Vanilla (DBM-Raids-Vanilla/AQ40/*.lua)
- Guides: https://www.warcrafttavern.com/wow-classic/guides/temple-of-ahnqiraj-aq40 ; https://www.warcrafttavern.com/wow-classic/guides/warlock-twin-emperor-tanking-wow-classic-season-of-mastery ; TenTonHammer AQ40 series (2006: Skeram, Sartura, Huhuran, Twin Emps, Ouro, C'Thun, Viscidus); Millenium AQ40 guide pages 2–10 (https://us.millenium.gg/guide/7179.html)

## Sources not usable
- Icy Veins Classic guides: blocked by a Cloudflare bot check for direct fetch and via proxy; only their boss order (from search snippets) is used.
- Warcraft Logs Classic: pages are JavaScript-only and were not fetched; real-pull cadences come from BigWigs/DBM timers instead.
- Wowhead comment sections (JS-loaded) were not readable through the proxy.
