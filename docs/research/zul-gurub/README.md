# Zul'Gurub (Classic Era, 20-man) — research index

Boss files (template: ../TEMPLATE.md):
- [jeklik.md](jeklik.md) — High Priestess Jeklik (Bat / Hir'eek)
- [venoxis.md](venoxis.md) — High Priest Venoxis (Snake / Hethiss)
- [marli.md](marli.md) — High Priestess Mar'li (Spider / Shadra)
- [thekal.md](thekal.md) — High Priest Thekal (Tiger / Shirvallah)
- [arlokk.md](arlokk.md) — High Priestess Arlokk (Panther / Bethekk)
- [mandokir.md](mandokir.md) — Bloodlord Mandokir & Ohgan (optional)
- [gahzranka.md](gahzranka.md) — Gahz'ranka (optional, fishing summon)
- [edge-of-madness.md](edge-of-madness.md) — Gri'lek / Hazza'rah / Renataki / Wushoolay (optional, alchemy summon, one per lockout)
- [jindo.md](jindo.md) — Jin'do the Hexxer (optional)
- [hakkar.md](hakkar.md) — Hakkar the Soulflayer (final)

## Raid facts
- 20 players, level 58–60, no attunement, 3-day (72 h) reset (Wowhead overview, wiki). Outdoor instance in north-east Stranglethorn Vale.
- Health (Era, classic.warcraftdb.com): Jeklik 333,125; Venoxis 213,200; Mar'li 333,125; Thekal 133,250 (+ Lor'Khan 90,650 + Zath 113,295; tiger form full reset); Arlokk 279,825; Mandokir 466,340 (+ Ohgan 91,560); Gahz'ranka 333,100; Gri'lek 333,100; Hazza'rah 266,500; Renataki 333,100; Wushoolay 293,150; Jin'do 319,800; Hakkar 719,550 (+~50k per living priest per wiki). All bosses are level 63 "World Boss" in the DB (shown as "??" in game).

## Boss order
Usual route (Icy Veins / wiki / Wowhead numbering): Jeklik → Venoxis (or Venoxis → Jeklik) → Mandokir (optional) → Mar'li → Edge of Madness (optional, on the way back down) → Thekal → Gahz'ranka (optional, shoreline) → Arlokk → Jin'do (optional) → Hakkar. The five priests can be killed in any order.

## Required for Hakkar
Only the five High Priests matter. Each one still alive when Hakkar is engaged gives him an extra ability (and roughly +50,000 HP per wiki); Mandokir, Gahz'ranka, Edge of Madness and Jin'do change nothing.
- Jeklik alive → Aspect of Jeklik (24687): 1,313 Physical (guides ~1,500) to everyone within 45 yd + 5 s silence (Wowhead text says 8 s; DBC and a Wowhead comment say 5 s). Magic dispel.
- Venoxis alive → Aspect of Venoxis (24688): 438 Nature (guides ~800) + 263 per 2 s for 10 s to the raid (45 yd). Poison dispel — conflicts with keeping Poisonous Blood.
- Mar'li alive → Aspect of Mar'li (24686): 6 s stun on the top-threat target; wiki says it resets aggro, a Wowhead comment says he keeps hitting the stunned tank.
- Thekal alive → Aspect of Thekal (24689): +150% melee attack speed for 8 s (Enrage type — Tranquilizing Shot candidate).
- Arlokk alive → Aspect of Arlokk (24690): 2 s gouge on the top-threat target that wipes the MT's aggro.
The fight is "considered almost impossible" with all five alive (Wowhead); Tentonhammer-era groups managed one or two.

## Hakkar's Blood Siphon
Every 90 s (first at 90 s) Hakkar channels Blood Siphon for 8 s: every affected player is stunned and loses 200 HP per second. If the player is NOT carrying Poisonous Blood, Hakkar is healed 1,000 HP per second per player (tooltip "Feeding Hakkar 1000 health per second"; with 20 unpoisoned players ~160k, Tentonhammer "~15%"). If the player IS poisoned, Hakkar instead takes 200 damage per second per player (wiki/Amazon Basin; Tentonhammer "up to ~10% of his health" per siphon). Wiki: at most 3 unpoisoned players before he nets a heal. Poisonous Blood (24321: 100 Nature per 3 s, 90 s, Poison) comes from the cloud a Son of Hakkar (15,260 HP, on the left/right stair platforms, respawning) leaves when it dies; the cloud lasts only ~10 s and an 8 yd radius, so: hunter pulls a Son, mage/druid CCs it in the raid, kill it 10–15 s before the siphon, everyone except the active tank stands in the cloud, nobody cleanses the poison. Siphon removes most debuffs, so this is repeated every cycle. Hakkar enrages at 10 minutes (and below 5%), so the raid typically needs to survive 4–6 siphons. Which priests are alive does not change the siphon itself; it changes the add-on damage/control that happens around it (silence/poison/stun/gouge/haste), which is why all five are killed first.

## Raid composition assumptions (from Warcraft Tavern, wiki, Tentonhammer)
- 20 players, level 60 recommended (58 minimum).
- 3 tanks (Thekal needs three; Mandokir three; Hakkar 2–3 all building threat; Jin'do 1 bear druid or 3 warriors).
- 6–7 healers (Hakkar "at least 6"); priests/paladins for Magic dispels (Hex, Silence, SW:P, Renew purge), shamans/druids/paladins for poison cleansing (Venoxis, Mar'li), mages/druids for decursing (Jeklik Curse of Blood — but never Jin'do's Delusions).
- Heavy ranged DPS; at least 3 mages (AoE bats/panthers/spiders, Polymorph duty on Sons and MC'd tanks); 1–2 hunters for charge bait (Jeklik, Mandokir), Son pulling (Hakkar), mana drains (Venoxis, Hazza'rah, Wushoolay), Tranquilizing Shot (Thekal Frenzy, Aspect of Thekal).
- Interrupters: at least 3 short-cooldown interrupts (Jeklik Great Heal/Mind Flay, Mar'li Drain Life, Lor'Khan Great Heal).
- Gear: Nature Resistance helps healers/tank (Venoxis, Mar'li, Wushoolay); Shadow Resistance for Jin'do; Fire Resistance totem/aura for Jeklik bombs; blue-or-better gear for Jin'do.
- Utilities: 300 Alchemy (Gurubashi Mojo Madness) for Edge of Madness; fishing 330–425 + Mudskunk Lure for Gahz'ranka; Soulstone the MT on Venoxis; group loot on Arlokk.

## Sources (what each contributed)
- https://classic.warcraftdb.com/ — JSON API `/api/data/node/npc/<id>` and `/tab/abilities`: exact Era level/health/mana and per-ability cast/range/cooldown/duration for every boss and add (NPC ids: 14517, 14965, 14750, 14507, 11373, 14884, 14510, 15041, 11388, 14509, 11347, 11348, 11361, 15068, 14515, 15101, 11382, 14988, 15117, 11391, 15114, 14122, 15082, 15083, 15163, 15084, 15085, 15111, 11380, 14986, 15112, 14987, 14826, 14834, 11357, 14989).
- https://classicdb.ch/?spell=<id> — 1.12 spell details (school, dispel type, radius, effect values, durations) for all boss abilities; ids listed in each file.
- https://warcraft.wiki.gg/ — Classic encounter pages: Jeklik (tactics), Venoxis (Classic), Mar'li (Classic), Thekal, Arlokk, Mandokir (Classic), Ohgan (Classic), Gahz'ranka, Edge of Madness, Gri'lek/Hazza'rah/Renataki/Wushoolay (Classic), Jin'do, Hakkar (tactics), Corrupted Blood (debuff), Son of Hakkar, Zul'Gurub (Classic), Chained Spirit, Zealot Lor'Khan/Zath, Zulian Guardian/Prowler, Spawn of Mar'li, Razzashi Cobra, Shade of Jin'do, Sacrificed Troll, Vilebranch Speaker, Gurubashi Bat Rider.
- https://www.wowhead.com/classic/guide/<boss>-zul-gurub-strategy and wow-classic-zulgurub-overview (fetched through r.jina.ai because wowhead.com is region-blocked from this machine) — current Classic strategy text per boss, raid size/reset, required priests.
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — all bosses in brief, raid composition.
- https://www.tentonhammer.com/guides/zul-gurub-boss-guide-* — 2005–2006 boss pages (Jeklik, Venoxis, Mar'li, Thekal, Arlokk, Jin'do, Hakkar): old numbers and timelines.
- https://us.millenium.gg/guide/6831.html?page=2..9 — per-boss summaries.
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — guild strategy notes with cadences for Hakkar and positioning for every boss.
- http://edgeofmadnesscalendar.com/eom (hogit.org/eom) — Edge of Madness rotation (14 days per boss, 56-day cycle).
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/ — boss_jeklik/venoxis/marli/thekal/arlokk/mandokir/renataki/hakkar.cpp, zulgurub.cpp, zulgurubScripts.cpp: emulator logic (phase thresholds, threat resets, a few timers). Per-ability timers live in DB spell lists that were not fetched.
- Not reachable: icy-veins.com (Cloudflare challenge, also via proxy), wowhead.com direct (403 region block; proxy used), fandom.com wikis (402), warcraftlogs.com (JS app; no log cadences obtained). Icy Veins content is therefore only represented via search snippets (e.g., Mandokir charge targets the furthest player, Arlokk 2 tanks, Jin'do kill order).

## Cross-boss open questions
- Exact per-ability cadences (seconds between casts) are missing for nearly every ability; only Blood Siphon (90 s), Mar'li's form change (~60 s), Jeklik's bat waves (~60 s), Mandokir's Mortal Strike (20–40 s) and Ohgan's Sunder (10–15 s) have numbers. Warcraft Logs would settle these.
- Health values come from one database (warcraftdb) and differ slightly from wiki figures (Venoxis 213,200 vs 210,000; Hakkar 719,550 vs ~745,804).
- Several DBC base values are lower than guide values (e.g. Gahz'ranka Frost Breath 128 vs 850–1,150; Aspect of Venoxis 438 vs ~800) — the DB page may show a lower rank or the guides include level/AP scaling.
