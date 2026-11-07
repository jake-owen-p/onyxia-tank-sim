# High Priest Thekal (Zul'Gurub)

Sources: list every URL used, one per line, with what it contributed.
- https://classic.warcraftdb.com/data/npc/14509 (API) — Thekal level 63 World Boss, health 133,250, mana 13,100; abilities Bloodlust 24185, Force Punch 24189 (1 s cast), Mortal Cleave 22859, Silence 22666.
- https://classic.warcraftdb.com/data/npc/11347 — Zealot Lor'Khan: level 62 Elite, 90,650 HP, 20,544 mana; Disarm 6713, Dispel Magic 17201, Great Heal 24208 (4 s), Lightning Shield 20545.
- https://classic.warcraftdb.com/data/npc/11348 — Zealot Zath: level 62 Elite, 113,295 HP; Blind 21060, Gouge 12540, Kick 15614, Sinister Strike 15581, Sweeping Strikes 18765.
- https://classic.warcraftdb.com/data/npc/11361 — Zulian Tiger: level 60 Elite, 9,156 HP.
- https://classic.warcraftdb.com/data/npc/15068 — Zulian Guardian: level 60 Elite, 6,288 HP, Claw 24187 (weapon +100).
- https://classicdb.ch/?spell=22859 — Mortal Cleave: instant, 5 yd, 150% weapon damage, healing taken -50% for 5 s.
- https://classicdb.ch/?spell=22666 — Silence: instant, 40 yd, 6 s, Magic.
- https://classicdb.ch/?spell=24185 — Bloodlust: instant, 100 yd, +75% melee haste 30 s, Magic.
- https://classicdb.ch/?spell=24208 — Great Heal (Lor'Khan): 4 s cast, 215 mana, 100 yd, heals 37,000.
- https://classicdb.ch/?spell=6713 — Disarm: 6 s. https://classicdb.ch/?spell=20545 — Lightning Shield: 20 charges, 10 min, Magic.
- https://classicdb.ch/?spell=21060 — Blind: 10 yd, 10 s confuse, -60% speed. https://classicdb.ch/?spell=12540 — Gouge: 4 s incapacitate. https://classicdb.ch/?spell=15614 — Kick: interrupt 6 s. https://classicdb.ch/?spell=18765 — Sweeping Strikes 20 s.
- https://classicdb.ch/?spell=24173 — Resurrection: 2 s cast, self.
- https://classicdb.ch/?spell=24169 — Thekal Transform: heal to max health, +100% melee haste (model 14966).
- https://classicdb.ch/?spell=24189 — Force Punch: 1 s cast, 45 yd radius, 875 Physical, knockback (value 70).
- https://classicdb.ch/?spell=24192 — Speed Slash: instant, 5 yd radius, 438 Physical + 438 per 1 s bleed for 6 s.
- https://classicdb.ch/?spell=24193 — Charge (8–25 yd, weapon +75, 2 s stun); https://classicdb.ch/?spell=24408 — Charge (40 yd) used by cmangos for Thekal.
- https://classicdb.ch/?spell=24183 — Summon Zulian Guardians: instant, 20 yd, summons 2 (value 2) of NPC 15068, 240 s.
- https://classicdb.ch/?spell=8269 — Enrage: +50 physical damage, +60% melee haste, +15% scale, 2 min.
- https://warcraft.wiki.gg/wiki/High_Priest_Thekal — Classic encounter page: Lor'Khan 90,650 HP / Zath 113,295 / Zulian Guardian 6,104; all three must die within 10 s or are resurrected at full health; ability texts (Great Heal 37,000–43,000, Lightning Shield 496 Nature 25%, Blind 10 s, Gouge 4 s, Kick 6 s, Sinister Strike +226); phase 2: +100% attack speed permanent, 2 Zulian Guardians on transform and every minute, Charge +75 2 s stun, Enrage at 20% (+60% attack speed, +50 damage, 2 min), Force Punch 875–1,125 + knockback 1 s cast, Speed Slash 438–562 + bleed; tactics (3 tanks, corners, Lor'Khan far away or drained, 20%/15%/10% sequence, alcove/cage positioning, polymorph tigers, healer split 1/2/3).
- https://www.wowhead.com/classic/guide/high-priest-thekal-zul-gurub-strategy (via r.jina.ai) — 4 adds at start (2 Zulian Tigers die on pull); Silence on random target must be dispelled; Great Heal heals any add; Zath Gouge/Blind → taunt swap; 20/15/10 then cleave; tiger form Force Punch knockback resets threat, can be back to back; tank in alcove behind pull position, raid against the opposite wall; tigers two at a time; Frenzy removable by Tranquilizing Shot; Enrage at 20%.
- https://www.warcrafttavern.com/guides/wow-classic-zulgurub-raid-guide/ — triangle split, interrupt Lor'Khan, stun/disarm, 10% kill, polymorph tigers so only one attacks.
- https://www.tentonhammer.com/guides/zul-gurub-boss-guide-boss-5-high-priest-thekal — tiger at "0%", wipes aggro; keep under 250 mana to prevent summons; summon calls 6 tigers (interruptible); three tanks; hunter kiting of zealots.
- https://us.millenium.gg/guide/6831.html?page=5 — kill both tigers first; bring each to 15% then AoE; Force Push resets aggro → second tank; CC tigers; tigers vanish when Thekal dies.
- https://theamazonbasin.com/wiki/index.php/Alliance_ZG_Strategies — Zath 15% → Thekal 10% → Lor'Khan 15%, MA calls at 18/13/18; Lor'Khan heals reach the others if too close; raid west, MT east in P2; detect magic/dispel Lightning Shield.
- https://raw.githubusercontent.com/cmangos/mangos-classic/master/src/game/AI/ScriptDevAI/scripts/eastern_kingdoms/zulgurub/boss_thekal.cpp — fake-death then Resurrection after 10,000 ms unless both others are also "dead"; tiger form 5 s after the last death with threat reset; tiger Enrage at <11% in script; Charge 24408; spell IDs.

## Overview
- Level 63 ("??"), World Boss. Thekal health 133,250 (Era) + Zealot Lor'Khan 90,650 + Zealot Zath 113,295; tiger form resets Thekal to full (133,250) with +100% attack speed. Mana 13,100 (Thekal), 20,544 (Lor'Khan). No enrage timer. Fourth/fifth priest in the usual route. REQUIRED: alive he grants Hakkar Aspect of Thekal (+150% attack speed enrage).
- Phases: P1 "council" — Thekal, Lor'Khan, Zath (+2 Zulian Tigers on pull). Any of the three that dies lies down and is resurrected at full health 10 s later unless all three are down within that 10 s window. P2 "Aspect of Shirvallah" — ~5 s after the simultaneous kill Thekal rises as a tiger at full health with threat reset, +100% attack speed, Force Punch, Speed Slash, Charge, Zulian Guardian summons, Enrage at 20%.
- Raid-size assumptions: 20-man Classic Era. No SoD-specific values found.

## Abilities

### Mortal Cleave (Thekal P1)
- Name: Mortal Cleave (22859)
- Type: melee cone
- Target rule: current target (and cleave to adjacent)
- Cast time: instant, 5 yd
- Cooldown or cadence: unknown
- Damage: 150% weapon damage
- Debuff: Mortal Cleave 5 s: healing received -50%; not dispellable
- Movement effect: none
- Telegraph: none; give Thekal the best-geared tank

### Silence (Thekal P1)
- Name: Silence (22666)
- Type: targeted debuff
- Target rule: random player, 40 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: none
- Debuff: Silence 6 s, Magic — dispel at once, especially on healers/interrupters
- Movement effect: none
- Telegraph: none

### Bloodlust (Thekal P1)
- Name: Bloodlust (24185)
- Type: buff on ally
- Target rule: Lor'Khan/Zath (100 yd)
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: +75% melee attack speed for 30 s
- Debuff: Magic buff — purge/dispel
- Movement effect: none
- Telegraph: buff icon

### Great Heal (Lor'Khan)
- Name: Great Heal (24208)
- Type: ally heal
- Target rule: any of the three (100 yd), lowest
- Cast time: 4 s, interruptible (Kick, Shield Bash, Earth Shock, Counterspell as backup; stuns also work)
- Cooldown or cadence: unknown; "at all times" (Wowhead) — needs a rotation
- Damage: heals 37,000 (wiki 37,000–43,000) ≈ 28% of Thekal, 41% of Lor'Khan
- Debuff: n/a (215 mana per cast; 20,544 pool — draining is a valid plan: 0 mana = no heals)
- Movement effect: none
- Telegraph: 4 s cast bar

### Dispel Magic / Disarm / Lightning Shield (Lor'Khan)
- Name: Dispel Magic (17201), Disarm (6713), Lightning Shield (20545)
- Type: other / debuff / buff
- Target rule: Dispel removes 1 magic debuff from an ally (~every 20 s per wiki); Disarm the tank 6 s (wiki 5 s); Lightning Shield on self, 20 charges, 25% chance to hit melee/ranged attackers for 496 Nature (wiki)
- Cast time: instant
- Cooldown or cadence: Dispel ~20 s (wiki); others unknown
- Damage: 496 Nature per shield proc
- Debuff: Lightning Shield is Magic — purge/dispel it; Disarm not dispellable
- Movement effect: none
- Telegraph: shield visual; Disarm removes the tank's weapon (and can break interrupt availability)

### Gouge / Blind / Kick / Sweeping Strikes (Zath)
- Name: Gouge (12540), Blind (21060), Kick (15614), Sinister Strike (15581), Sweeping Strikes (18765)
- Type: debuff / melee
- Target rule: Gouge on the current target (must be facing him) 4 s incapacitate, then he attacks the next player; Blind within 10 yd 10 s (confuse, -60% speed; not dispellable, broken by damage); Kick interrupts 6 s; Sweeping Strikes hits an extra nearby enemy for 20 s
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: Sinister Strike weapon + bonus (wiki +226)
- Debuff: as above
- Movement effect: Gouge/Blind cause tank loss → another tank must taunt Zath, then the Zath tank taunts back
- Telegraph: none

### Resurrection (all three, P1)
- Name: Resurrection (24173)
- Type: other
- Target rule: a "dead" council member revives at full health 10 s after falling unless the other two are also down (cmangos: 10,000 ms timer; wiki/Wowhead: 10 s window)
- Cast time: 2 s
- Cooldown or cadence: whenever one falls alone
- Damage: n/a
- Debuff: n/a
- Movement effect: n/a
- Telegraph: the fallen body lies on the ground for 10 s; MA calls the finish

### Thekal Transform / Aspect of Shirvallah (P2 start)
- Name: Thekal Transform (24169)
- Type: enrage / threat wipe / phase change
- Target rule: self, ~5 s after all three are down
- Cast time: instant
- Cooldown or cadence: once
- Damage: heal to full (133,250) and permanent +100% melee haste
- Debuff: n/a
- Movement effect: threat reset (cmangos; Tentonhammer "wipes aggro"; Millenium "resets aggro") — MT must taunt/establish immediately
- Telegraph: resurrection visual, ~5 s delay

### Force Punch (P2)
- Name: Force Punch (24189)
- Type: AoE knockback
- Target rule: everyone within 45 yd (effectively the whole raid)
- Cast time: 1 s
- Cooldown or cadence: unknown; can be cast back to back (Wowhead)
- Damage: 875 Physical (wiki 875–1,125)
- Debuff: none
- Movement effect: large knockback; drops his threat on the MT (Wowhead, Tentonhammer, Millenium) so a second tank taunts and brings him back
- Telegraph: 1 s cast bar. Stand with your back to a wall so the knockback is short.

### Speed Slash (P2)
- Name: Speed Slash (24192)
- Type: melee AoE + bleed
- Target rule: all within 5 yd
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: 438 Physical (438–562) + 438 per second bleed for 6 s
- Debuff: Speed Slash bleed 6 s, not dispellable
- Movement effect: none
- Telegraph: none; melee take heavy damage in P2

### Charge (P2)
- Name: Charge (24408 per cmangos; 24193 8–25 yd variant exists)
- Type: charge
- Target rule: random player (Tentonhammer: "random charge then returns to the MT")
- Cast time: instant
- Cooldown or cadence: unknown
- Damage: weapon +75, 2 s stun
- Debuff: stun 2 s
- Movement effect: he leaves the tank briefly
- Telegraph: none

### Summon Zulian Guardians (P2)
- Name: Summon Zulian Guardians (24183)
- Type: summon adds
- Target rule: 2 tigers near him (20 yd)
- Cast time: instant
- Cooldown or cadence: on transform and every ~60 s (wiki); "two at a time periodically" (Wowhead); Tentonhammer: 6 tigers, interruptible, needs mana (keep him <250 mana)
- Damage: n/a
- Debuff: n/a
- Movement effect: n/a
- Telegraph: tigers appear; polymorph/hibernate/fear them

### Enrage (P2)
- Name: Enrage (8269)
- Type: enrage
- Target rule: self at 20% (wiki, Wowhead); cmangos <11%
- Cast time: instant
- Cooldown or cadence: once, lasts 2 min
- Damage: +60% attack speed, +50 physical damage per hit, +15% size
- Debuff: cannot be removed (wiki); Frenzy (a separate buff) can be Tranquilizing-Shot off (Wowhead)
- Movement effect: none
- Telegraph: size increase; healers pour cooldowns into the tank

## Adds
- Zealot Lor'Khan (NPC 11347): level 62 elite shaman, 90,650 HP, 20,544 mana. Must be tanked far from Thekal/Zath (heals reach 100 yd, but guides position her away so her Lightning Shield/Dispel are isolated and so a lone hunter can hold her once drained). Interrupt Great Heal, purge Lightning Shield, chain-stun with rogues.
- Zealot Zath (NPC 11348): level 62 elite rogue, 113,295 HP. Tank with two tanks or a tank + Blink mage because Gouge and Blind both drop the tank. Keep nearer Thekal but away from Lor'Khan.
- Zulian Tigers (NPC 11361) x2: level 60 elite, 9,156 HP; pulled with the council; kill or CC on pull (no tank needed).
- Zulian Guardians (NPC 15068): level 60 elite, 6,288 HP, Claw (+100); 2 per summon in P2; polymorph/hibernate/fear, kill one at a time with extra melee; despawn when Thekal dies (Millenium).
- Resurrection: any council member killed alone returns at 100% after 10 s — the "add" that matters most.

## Positioning and movement
- Tank: three tanks. MT (best geared) on Thekal just south of his hut; OT1 drags Lor'Khan to one far corner of the lower area; OT2 takes Zath to the opposite corner (or next to Thekal but away from Lor'Khan). Zath tank: when gouged/blinded, the nearest other tank taunts and hands back. P2: fight in the small alcove behind the pull position — MT holds tiger-Thekal against one wall; after every Force Punch the second tank taunts and drags him back to the corner; third tank handles Guardians.
- Melee DPS: P1 follow the MA target; rogues stay on Lor'Khan for interrupts/stuns until she dies. P2: on Thekal but expect Speed Slash (438 + bleed); back against the alcove wall to shorten knockbacks; help kill CC'd Guardians one at a time.
- Ranged DPS: P1 spread across the three targets (split DPS evenly, slightly more on Thekal); drain Lor'Khan's mana (Viper Sting, Drain Mana, Mana Burn) so Great Heal stops. P2: all ranged and healers against the opposite alcove wall ("raid west, MT east"); mages polymorph Guardians.
- Healers: P1 split roughly 1 on Lor'Khan's tank, 2 on Zath's tank, 3 on Thekal's tank (wiki); dispel Silence instantly, decurse nothing. P2: backs to the wall, big heals ready for the 20% enrage; HoTs on the taunting tank before each Force Punch.
- Whole raid: P1 triangle with 20–30 yd between the three groups; P2 alcove walls on both sides; the MT body-blocks between Thekal and the raid where possible (wiki) so Force Punch pushes fewer people.

## What each role must do and must not do
- Tank:
  1. Three separate tanks; keep Lor'Khan far from the other two.
  2. Zath tank: announce Gouge/Blind; partner taunts; taunt back when free.
  3. Expect Disarm from Lor'Khan (6 s) — not when you need Shield Bash.
  4. At the triple kill: MT must taunt/establish on tiger Thekal within the ~5 s rise (threat reset).
  5. P2: tank in the alcove corner; second tank taunts after every Force Punch and returns him; third tank taunts Guardians. Never tank him in the open middle.
- DPS:
  1. Kill the two Zulian Tigers on pull.
  2. Interrupt rotation on Lor'Khan's Great Heal (4 s cast) — rogues/warriors primary, mages backup; chain-stun her when possible.
  3. Follow the sequence: Thekal → 20%, Zath → 15%, Lor'Khan → 10%, then kill all three within 10 s (MA calls 18/13/18 per Amazon Basin). Do not kill anyone early.
  4. Purge Lightning Shield and Bloodlust.
  5. P2: stop until the MT has him after the transform and after each Force Punch; CC/kill Guardians (one at a time); hunters Tranq Frenzy.
- Healer:
  1. Dispel Silence immediately (Magic).
  2. Thekal tank has -50% healing from Mortal Cleave windows — pre-heal/HoT.
  3. P2: expect the whole raid to take 875–1,125 per Force Punch; keep the taunting tank topped; cooldowns at 20%.
  4. Stand against the wall; never in the open where a knockback sends you out of range.

## Timeline of a typical pull
- t=0: pull; two Zulian Tigers die first (~10–15 s). Tanks split the council into the triangle. Lor'Khan starts Great Heal casts on whichever target is damaged; interrupts and mana drain begin; Silences on random players; Bloodlust on an add.
- t≈0–4 min: controlled DPS: Thekal to 20%, Zath to 15%, Lor'Khan to 10%; Zath Gouge/Blind swaps as they happen.
- Kill window: MA calls; all three die within 10 s (if one dies alone, it rises at full after 10 s and the sequence restarts for that one).
- +~5 s: Thekal rises as a tiger at full HP, +100% attack speed, threat reset; 2 Zulian Guardians appear. MT taunts in the alcove.
- P2 loop: Force Punch (1 s cast, 45 yd, ~1k, knockback, threat drop) — second tank taunts; Speed Slash on melee; occasional Charge; 2 more Guardians roughly every minute.
- At 20%: Enrage (+60% haste, +50 damage); healers go all in. Death: "Shirvallah... Shirvallah!"-style death yell (not captured); Hakkar loses Aspect of Thekal; Guardians despawn.

## Open questions
- Enrage threshold: 20% (wiki, Wowhead) vs <11% (cmangos script).
- Guardian summons: 2 on transform + every minute (wiki) vs "two at a time periodically" (Wowhead) vs 6 tigers, interruptible, mana-gated <250 (Tentonhammer 2005). DBC says 2 per cast.
- Charge variant: 24408 (40 yd, cmangos) vs 24193 (8–25 yd) — both exist in the DB.
- Force Punch cadence and whether it fully resets threat or only drops the MT: Wowhead "resets threat from the MT"; Tentonhammer "breaks aggro".
- Disarm duration 6 s (DBC) vs 5 s (wiki); Great Heal 37,000 (DBC) vs 37,000–43,000 (wiki).
- Zulian Guardian HP 6,288 (warcraftdb) vs 6,104 (wiki).
- Lightning Shield proc damage 496 (wiki) — DBC shows only the proc trigger.
- No source gives cadences for Mortal Cleave, Silence, Speed Slash, Charge.
