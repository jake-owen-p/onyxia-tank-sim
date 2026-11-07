# General Rajaxx (Ruins of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/General_Rajaxx — the 7-wave table (officer, ability, Needler/Warrior counts, side of the room), Thundercrash halves HP (min 100) + knockback + aggro reset, Deaggro, Andorov + 4 Kaldorei Elite spawn after Kurinnaxx, Aura of Command, quotes, 150 rep if NPCs survive.
- https://www.wowhead.com/classic/guide/general-rajaxx-ruins-of-ahnqiraj-strategy (fetched through r.jina.ai) — 3 minutes per wave, same wave table with counts, Improved BoP "5 seconds", Hurricane, Shockwave, Sweeping Slam, Enlarge dispel, "You are not worth my time, <player>" threat dump yell, Aura of Command 200 HP/3 s + 10% AP/cast speed, stand with backs against a wall.
- https://www.wowhead.com/classic/npc=15341/general-rajaxx (fetched through r.jina.ai) — Health 832,750 ("SoM 20 Player"), 6 abilities.
- https://www.warcrafttavern.com/wow-classic/guides/ruins-of-ahnqiraj-aq20/ — Disarm on the tank, Thundercrash cuts current HP by 40-50%, mage sheeps each captain, release-and-rejoin trick, keep Andorov alive.
- https://www.tentonhammer.com/guides/tentonhammers-guide-to-the-ruins-of-ahn-qiraj-section-2-2 — wave abilities (AoE lightning ~500-700 within ~20 yd, Shockwave 10-15 yd, BoP 10 s, front-arc slam), Thundercrash min 200 and ~20 yd claim, Andorov tanking Rajaxx (immune to knockback), kill order named > Needlers > Warriors.
- https://us.millenium.gg/guide/6975.html?page=2 — Thundercrash "reduces current health of all players by 50%", Disarm on tank, polymorph the mini boss.
- https://warcraft.wiki.gg/wiki/Lieutenant_General_Andorov — level 31 elite, Bash (5 s stun), Strike, Aura of Command heals every 3 s, vendor for 2 minutes after the kill, quotes.
- https://warcraft.wiki.gg/wiki/Kaldorei_Elite — level 30 elite, Cleave (+131, 3 targets), Mortal Strike (-25% healing 5 s).
- https://warcraft.wiki.gg/wiki/Captain_Drenn — Classic level 63 elite, Lightning Cloud 472 Nature per 3 s for 15 s, Cleave 110%, Sunder Armor.
- https://wotlkdb.com/?spell=25599 — Thundercrash: Nature school damage + knockback (value 100/250) in a 100 yd radius.
- https://wotlkdb.com/?spell=6713 — Disarm: 5 s, 5 yd, Physical.
- https://wotlkdb.com/?spell=25516 — Aura of Command: heal 200 every 3 s, +10% melee haste, +11% spell haste, 100 yd, 30 s.
- https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/Kalimdor/RuinsOfAhnQiraj/boss_rajaxx.cpp (raw fetched) — Disarm at 10 s then every 22 s; Thundercrash at 12 s then every 21 s, damage = current HP / 2 (min 100) then ResetAllThreat; Andorov Bash 8-11 s / 25-38 s, Aura of Command 1-3 s / 10-20 s, Strike 2-5 s / 4-6 s; Rajaxx yells on killing Andorov.
- https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/Kalimdor/RuinsOfAhnQiraj/instance_ruins_of_ahnqiraj.cpp (raw fetched) — wave order Qeez, Tuubid, Drenn, Xurrem, Yeggeth, Pakkon, Zerran, Rajaxx; next wave on 2 min timer OR when the whole formation is dead; Rajaxx yells from wave 3 on.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/ruins_of_ahnqiraj.cpp (raw fetched) — wave timer 3 min in code with comment "2 min or after previous wave is finished" and "wowwiki states 3 min between waves, reduced in later patches"; next wave sent immediately when Zerran's group dies.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_rajaxx.cpp (raw fetched) — Andorov/Kaldorei timers (Cleave 2-4 s / 5-7 s, Mortal Strike 8-11 s / 9-13 s), Andorov despawns 135 s after the kill.

## Overview
- Level ?? (boss), Qiraji humanoid. Health: Wowhead Classic shows 832,750 labelled "SoM 20 Player"; Classic Era value not found. No enrage timer. Second boss, General's Terrace, required. The encounter is a gauntlet: 7 waves of adds, each led by an officer, then Rajaxx himself (sources count it as "7 waves + Rajaxx" or "8 waves").
- Phases: Waves 1-7 (each wave: 6 trash + 1 officer), then the boss. There is no HP phase on Rajaxx.
- The encounter is started by talking to Lieutenant General Andorov, who spawns with 4 Kaldorei Elite after Kurinnaxx dies. He and his elites fight with you; if they survive you get +10 Cenarion Circle rep (150 vs 140) and he sells potions/bandages for 2 minutes.
- Raid-size assumptions: 20-man Classic Era.

## Abilities

### Thundercrash
- Type: AoE (room) + knockback + threat wipe.
- Target rule: all players in range (spell radius 100 yd; TenTonHammer claims ~20 yd, see Open questions). Andorov and the Kaldorei Elite are immune (Wowhead guide, TenTonHammer).
- Cast time: instant.
- Cadence: emulator first use 12 s after engage, then every 21 s. Guides: "very frequently".
- Damage: half of each player's current health, Nature school, minimum 100 (wiki, Wowhead guide, AzerothCore) / minimum 200 (TenTonHammer) / "40-50%" (Warcraft Tavern). Because it is current-HP based it can never kill a player above 100 HP by itself; the danger is the follow-up melee or wave damage.
- Debuff: none.
- Movement effect: knockback (spell value 100-250) of the whole raid away from him. Stand against a wall to shorten it (Wowhead guide, wiki).
- Threat: resets all threat (ResetAllThreat in AzerothCore; wiki "resets aggro"). After each Thundercrash he will run at whoever hits him first.
- Telegraph: none found; the knockback itself is the cue.

### Disarm
- Type: debuff (disarm).
- Target rule: current tank.
- Cast time: instant. Cadence: emulator first use 10 s, then every 22 s.
- Effect: Disarmed 5 s (wotlkdb 6713), Physical, no dispel type. The disarmed tank loses weapon threat for 5 s; Warcraft Tavern recommends swapping or being ready when it lands.
- Telegraph: none.

### Deaggro ("You are not worth my time, <player>")
- Type: threat reset/aggro drop on one target.
- Target rule: current target.
- Cadence: unknown; wiki lists it as a separate ability from Thundercrash; the Wowhead guide treats the yell as the sign that threat was dumped. CMaNGOS marks the yell "unconfirmed".
- Telegraph: the yell above.

### Frenzy (8269) 
- Listed in AzerothCore but never cast, and Millenium lists "Enrage" with no numbers; no live source gives a threshold. Treat as unknown.

### Officer abilities (one per wave, from wiki and Wowhead guide)
- Wave 1 Captain Qeez: Intimidating Shout, short-range AoE fear (duration unknown; the warrior version is 8 s).
- Wave 2 Captain Tuubid: Attack Order, marks one target and all adds in the wave fixate it.
- Wave 3 Captain Drenn: Hurricane / Lightning Cloud, channelled AoE around himself; wiki tooltip 472 Nature every 3 s for 15 s; TenTonHammer "500-700 per hit within ~20 yd".
- Wave 4 Captain Xurrem: Shockwave, heavy AoE damage, reduces movement speed to 1% for 2 s (wiki); 10-15 yd knockback/range (TenTonHammer).
- Wave 5 Major Yeggeth: (Improved) Blessing of Protection, physical immunity 5 s (Wowhead guide) / 10 s (TenTonHammer).
- Wave 6 Major Pakkon: Sweeping Slam, frontal cone heavy damage + knockback.
- Wave 7 Colonel Zerran: Enlarge, magic buff on himself and allies increasing physical damage; dispellable (Dispel Magic / Purge).

## Adds
- Waves (wiki / Wowhead guide; sides are relative to the raid standing at the terrace):
  1. Center: Captain Qeez + 2 Swarmguard Needlers + 4 Qiraji Warriors.
  2. Left: Captain Tuubid + 3 Needlers + 3 Warriors.
  3. Right: Captain Drenn + 5 Needlers + 1 Warrior.
  4. Further left: Captain Xurrem + 3 Needlers + 3 Warriors.
  5. Further right: Major Yeggeth + 4 Needlers + 2 Warriors.
  6. Deep left: Major Pakkon + 2 Needlers + 4 Warriors.
  7. Deep right: Colonel Zerran + 3 Needlers + 3 Warriors.
  8. General Rajaxx himself walks in.
- Spawn trigger: the next wave comes either when the previous wave is fully dead or on a timer: 3 minutes per the Wowhead guide and the CMaNGOS code; 2 minutes per AzerothCore and the CMaNGOS comment ("reduced in later patches"). Plan for 2 minutes to be safe.
- Needlers: fragile, high damage. Warriors: more HP, less damage. Both can be polymorphed, feared, rooted, frozen, stunned (wiki). Officers can be polymorphed (Warcraft Tavern: a mage sheeps each captain until the small adds are dead; wiki: kill the officer first). Adds die when killed; nothing despawns on a timer. Captain Drenn is level 63 elite in Classic (wiki); HP values for adds were not found.
- Friendly NPCs: Lieutenant General Andorov (level 31 elite on the retail page; Classic level unknown) with Bash (5 s stun), Strike, and Aura of Command (heals 200 every 3 s and +10% attack speed / +11% casting speed to raid members at Neutral or better with Cenarion Circle, 100 yd, recast every ~10-45 s). Four Kaldorei Elite (level 30 elite on the retail page) with Cleave (+131, up to 3 targets) and Mortal Strike (-25% healing for 5 s). They can be healed, buffed (single-target paladin blessings, Earth Shield) and taunt-pulled off; they deal significant damage and easily out-threat tanks (Wowhead guide). Rajaxx yells "Breath your last!" if he kills Andorov. If they survive, Andorov becomes a vendor for ~2 minutes (135 s in CMaNGOS) then leaves.

## Positioning and movement
- Tank: pull each wave far into the terrace so the officer is separated; the MT grabs the officer (or lets the mage sheep it) while an OT and the Kaldorei take the Warriors. Wave 3: pull Drenn away from Andorov so Andorov walks out of the Lightning Cloud. Wave 6: tank Pakkon against a wall, facing away from the raid (Sweeping Slam knockback). For Rajaxx: tank him with your back to a wall; healers and raid also against the wall. After every Thundercrash threat is zero, so re-establish immediately (Bloodrage, Sunder, taunt is fine). While Andorov is alive he usually re-takes Rajaxx after a Thundercrash; the tank must still peel him. Never fight Rajaxx in open ground where the knockback scatters the raid.
- Melee DPS: on waves, stay behind the officer; for Qeez (fear) stay spread so a fear does not drag you into other packs; for Pakkon stand behind him. On Rajaxx stand with the tank against the wall; stop DPS after each Thundercrash until the tank (or Andorov) has him back.
- Ranged DPS: on waves stay at max range from Qeez (fear) and out of Drenn's cloud (~20 yd). On Rajaxx, back to the wall at 20-30 yd; Thundercrash hits the whole area regardless, so range only matters for the knockback direction.
- Healers: back to the wall, max range; keep Andorov and the four elites alive (they are your extra damage and your Thundercrash safety net); after Thundercrash everyone is at 50% so top the raid, tank first.
- Whole raid: fight along a wall of the terrace; decide the wall before talking to Andorov because wave sides are fixed. The release-and-rejoin trick (Warcraft Tavern): a dead raider can release after a captain dies and run back in.

## What each role must do and must not do
- Tank:
  1. Do not talk to Andorov until the whole raid is ready and the pre-event trash is cleared; talking starts wave 1.
  2. Each wave: grab the officer (or sheep it), pick up Warriors; Needlers die first by DPS. Keep Drenn away from Andorov; tank Pakkon on a wall facing out.
  3. On Rajaxx: back to the wall; expect Disarm (5 s) about every 22 s and Thundercrash about every 21 s; re-taunt/re-threat right after every Thundercrash.
  4. Never chase Rajaxx into the open after a knockback; let him come to the wall.
- DPS:
  1. Kill order: officer (unless sheeped) > Needlers > Warriors; never break CC on the officer in wave 2 (Attack Order).
  2. Dispel Enlarge (wave 7) immediately; purge/dispel it off every add.
  3. Casters: stop casting when Yeggeth bubbles (tanks make no threat for 5-10 s).
  4. On Rajaxx: stop attacking right after Thundercrash until the tank has him; do not out-threat the tank between crashes (threat resets every ~21 s anyway).
  5. Save the last Warrior of a wave to regen mana/HP before the next wave timer (TenTonHammer).
- Healer:
  1. Keep Andorov and the elites alive (they are healable; a macro targeting them helps).
  2. Top the whole raid immediately after each Thundercrash; it halves current HP, so a raid left low can be killed by any add swing.
  3. Dispel Enlarge off Zerran's group; dispel nothing else.
  4. Stand against the wall so the knockback does not put you out of range.

## Timeline of a typical pull
- t=0: talk to Andorov. He yells "If it bleeds, we can kill it." then "They come now..."; wave 1 (Qeez, center) walks in ~5-10 s later.
- Waves 1-7: each wave must be dead before the next is sent, otherwise the next comes on a 2-minute (AzerothCore) or 3-minute (Wowhead guide / CMaNGOS) timer. A tidy raid clears a wave in 60-90 s and uses the remainder to regen. Rajaxx yells a taunt line as each wave from 3 onward is sent.
- Rajaxx engages after Zerran's group dies (within a second or two: CMaNGOS sets the timer to 1 ms). "Impudent fool! I will kill you myself!"
- t+10 s: Disarm on the tank; t+12 s: first Thundercrash (raid at 50%, threat wiped, raid knocked to the wall). Then Thundercrash every ~21 s and Disarm every ~22 s, so they drift relative to each other.
- Rajaxx himself is a short fight (a few minutes) because his HP is modest and he does little besides Thundercrash. The whole encounter runs ~15-25 minutes.
- On death: "Warriors! Captains! Continue the fight!"; Andorov sells for ~2 minutes.

## Open questions
- Classic Era 20-man HP: only Wowhead's "SoM 20 Player" 832,750 was readable.
- Time between waves: 3 min (Wowhead guide, CMaNGOS constant) vs 2 min (AzerothCore, CMaNGOS comment saying it was reduced).
- Thundercrash minimum damage: 100 (wiki, Wowhead guide, AzerothCore) vs 200 (TenTonHammer); Warcraft Tavern says 40-50% of current HP.
- Thundercrash radius: spell data 100 yd vs TenTonHammer's "roughly 20 yards".
- Disarm duration: 5 s per spell 6713 (wotlkdb 3.3.5a); no Classic tooltip fetched.
- Whether "Deaggro" is a separate ability or just the yell attached to Thundercrash's threat reset.
- Yeggeth's Blessing of Protection: 5 s (Wowhead guide) vs 10 s (TenTonHammer) and "immunity to physical" (wiki) vs "all damage" (TenTonHammer).
- Drenn's AoE: "Hurricane" (wiki/Wowhead guide) vs "Lightning Cloud 472/3 s" (wiki NPC tooltip) vs "500-700 per hit" (TenTonHammer).
- Andorov and Kaldorei Elite Classic levels/HP (wiki shows retail-era level 31/30 elite).
- Whether Rajaxx has a Frenzy/enrage (listed by Millenium and AzerothCore constant, never described).
