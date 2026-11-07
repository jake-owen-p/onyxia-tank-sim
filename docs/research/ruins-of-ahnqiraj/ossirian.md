# Ossirian the Unscarred (Ruins of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Ossirian_the_Unscarred — ~500,000 HP, Supreme Mode, Enveloping Winds 10 s stun on top threat (not dispellable, resistible, breaks on damage), tornadoes roam and deal very high damage with an 8 s whirlwind that drops aggro, Curse of Tongues AoE, Warstomp ~1500 + knockback, crystal debuff 45 s, click at 10-15 s remaining because of the short cast time, clockwise/counter-clockwise spawn pattern, edge crystals respawn in the centre when clicked, raid 20 yd back, no DPS until second crystal, fight usually over 6 minutes, quotes.
- https://www.wowhead.com/classic/guide/ossirian-the-unscarred-ruins-of-ahnqiraj-strategy (fetched through r.jina.ai) — Strength of Ossirian +300% damage, War Stomp 1500 unbuffed, crystal weaknesses (Arcane/Fire/Frost/Nature/Shadow) 45 s each, -100% resistance and +100% damage taken, Enveloping Winds 10 s Nature stun on top threat, Curse of Tongues +75% cast time, tornado 8 s stuck + threat loss, Track Elementals, spotter and clicker roles, reach the next crystal 15-20 s into a weakness, first crystal spawns in the centre, no DPS during the first weakness, class notes.
- https://www.wowhead.com/classic/npc=15339/ossirian-the-unscarred (fetched through r.jina.ai) — Health 2,398,320 ("SoM 20 Player"), 11 abilities.
- https://www.warcrafttavern.com/wow-classic/guides/ruins-of-ahnqiraj-aq20/ — Strength of Ossirian "triples his damage", 45 s weakness, 1-2 mounted melee scouts, mage Blink to the crystal, taunt-immune, Enveloping Winds 10 s and Free Action Potion, tornadoes slow and damage, War Stomp knockback and "stuns for 5 seconds", decurse Curse of Tongues.
- https://www.tentonhammer.com/guides/tentonhammers-guide-to-the-ruins-of-ahn-qiraj-section-2-6 — Supreme Mode hits >10,000, Curse of Tongues +50% cast time, Warstomp ~1000 (+~600 fall) or ~1500, Enveloping Winds 8 s stun on top aggro, crystal activation ~3 s, finder/activator roles, ranged-only ~8 min vs melee-heavy ~5 min.
- https://us.millenium.gg/guide/6975.html?page=4 — Strength of Ossirian +300%, 45 s vulnerability to one of five schools, Enveloping Winds 10 s on the MT, Free Action Potions, two melee patrol and ping crystals, decurse Curse of Tongues, tornado movement debuff.
- https://wotlkdb.com/?spell=25176 — Strength of Ossirian: +300% physical damage, +25% size.
- https://wotlkdb.com/?spell=25177 — Fire Weakness: 5 s cast, 45 s, -100% fire resistance and +100% fire damage taken, 30 yd radius (Frost 25178, Nature 25180, Arcane 25181, Shadow 25183 are the same per the emulators).
- https://wotlkdb.com/?spell=25195 — Curse of Tongues: -75% spell haste, 15 s, 45 yd radius, dispel type Curse.
- https://wotlkdb.com/?spell=25189 — Enveloping Winds: Nature stun, 10 s, 30 yd.
- https://wotlkdb.com/?spell=25188 — War Stomp: 2188-2812 Physical + knockback (150-250) in 20 yd.
- https://wotlkdb.com/?spell=25160 — Sand Storm: periodically triggers Harsh Winds every 1 s.
- https://wotlkdb.com/?spell=25161 — Harsh Winds: -85% run speed and Silence in 5 yd, 1961-2039 damage in 10 yd, 1 s duration (re-applied each second).
- https://wotlkdb.com/?spell=25192 — Summon Ossirian Crystal: summons gameobject 180619.
- https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/Kalimdor/RuinsOfAhnQiraj/boss_ossirian.cpp (raw fetched) — Enveloping Winds every 20 s (first at 20 s) on the victim; War Stomp every 30 s (first at 30 s); Curse of Tongues at 30 s then every 20-30 s; speed burst at 10 s; Supreme reapplied immediately whenever no weakness aura is present; 12 crystal coordinates, 3 crystals spawned on engage, next crystal spawned when a weakness fires; weakness chosen at random from the 5; two Sand Vortex NPCs summoned on engage with waypoint paths.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_ossirian.cpp (raw fetched) — Supreme reapplied 45 s after a weakness; Cyclone (25189) every 20 s on the victim; Stomp every 30 s; Curse of Tongues 30 s then 20-30 s; run speed x2.2 after 10 s; 5 crystals spawned 10 s after engage, one new crystal per weakness, used crystal despawns; two Sand Vortex (NPC 15428) summoned on aggro casting Sand Storm and wandering within 100 yd of the arena; zone weather set to storm; yell IDs.

## Overview
- Level ?? (boss), Horusath giant. Health: wiki "about 500,000"; Wowhead Classic 2,398,320 labelled "SoM 20 Player"; no Era value found. No enrage timer: the whole fight is a rolling soft enrage because Strength of Ossirian returns whenever a weakness expires. Sixth and final boss, Watchers' Terrace, required. Immune to Taunt. Hits for 10,000+ in Supreme Mode (TenTonHammer); War Stomp 1500 unbuffed one-shots melee while buffed (Wowhead guide).
- Phases: single phase. The rhythm is: he has Strength of Ossirian (+300% physical damage) unless he is standing within 30 yd of a crystal when its 5 s activation finishes; then he loses the buff and takes a random school Weakness for 45 s (-100% resistance and +100% damage taken from that school). When the 45 s end with no new weakness he re-casts Strength of Ossirian immediately (AzerothCore) or on a 45 s timer (CMaNGOS) and yells.
- Raid-size assumptions: 20-man Classic Era. Composition: two warrior tanks, a mounted spotter (rogue), a clicker with mobility (mage/druid), caster-heavy DPS covering all five schools, Free Action Potions for tanks, hunters for Track Elementals.

## Abilities

### Strength of Ossirian (Supreme Mode)
- Type: enrage/self-buff.
- Target rule: self.
- Cast time: instant; he starts the fight with it and re-applies it the instant no Weakness aura is on him (AzerothCore; CMaNGOS 45 s timer after the last weakness).
- Effect: +300% physical damage done (wotlkdb, Wowhead guide, Millenium; Warcraft Tavern "triples", Icy Veins snippet "200% more"), +25% size. Removed only by a crystal Weakness landing on him.
- Telegraph: he grows and yells one of three lines ("I am rejuvenated!", "My powers are renewed!", "My powers return!"; the wiki lists these as his Supreme lines, labelled "unused" there).

### Crystal Weakness (player-triggered)
- Type: debuff on the boss (vulnerability).
- Trigger: a player clicks an Ossirian Crystal; the crystal's trigger casts a random one of Fire/Frost/Nature/Arcane/Shadow Weakness with a 5 s cast (wotlkdb; wiki "short cast time"; TenTonHammer ~3 s) on any Ossirian within 30 yd.
- Effect: 45 s (all sources): removes Strength of Ossirian; -100% resistance to that school and +100% damage taken from it. Multiple vulnerabilities can stack if you chain crystals early (wiki).
- Crystal supply: one crystal spawns in the centre at the start (Wowhead guide; emulators spawn 3-5 around 12 fixed points); each activation spawns the next crystal somewhere in the arena, usually following a clockwise or counter-clockwise order (wiki). Used crystals despawn. Edge crystals clicked while he is far away respawn in the centre ("center method", wiki).
- Timing rule: start the click when 10-15 s remain on the current weakness (wiki) so the 5 s cast finishes before it expires; the Wowhead guide wants him arriving at the next crystal 15-20 s into the window.

### Enveloping Winds (Cyclone in CMaNGOS)
- Type: targeted stun on the top-threat player.
- Target rule: current target / highest threat (the tank).
- Cast time: instant.
- Cadence: 20 s after pull then every 20 s (both emulators).
- Effect: 10 s stun, Nature school (wotlkdb, wiki, Wowhead guide, Millenium; TenTonHammer says 8 s). Cannot be dispelled; can be resisted with Nature Resistance; breaks on damage (wiki, Wowhead guide; War Stomp can break it). He will not attack the stunned player but their threat is kept, so he turns to the next person on the list, usually the off-tank or a caster. Free Action Potion pre-pull prevents it (Warcraft Tavern, Millenium). A PvP trinket breaks it (wiki).
- Telegraph: none.

### War Stomp
- Type: melee AoE + knockback.
- Target rule: everyone within 20 yd.
- Cast time: instant. Cadence: 30 s after pull then every 30 s (both emulators).
- Damage: 2188-2812 Physical (wotlkdb) / ~1500 "unbuffed" (Wowhead guide, wiki) / ~1000 + ~600 fall (TenTonHammer); a Wowhead comment reports ~6000 while he was buffed. Multiplied by Strength of Ossirian when active.
- Movement effect: knockback 150-250 (spell), "about 30 yards" (wiki); Warcraft Tavern adds a 5 s stun (no other source).
- Telegraph: none; stand with your back to the next crystal / to the tank so you are thrown the right way (wiki).

### Curse of Tongues
- Type: AoE debuff (curse).
- Target rule: everyone within 45 yd of him (spell radius; the Wowhead guide says "around Ossirian"; Millenium "random players").
- Cast time: instant. Cadence: 30 s after pull then every 20-30 s (both emulators).
- Debuff: Curse of Tongues, 15 s, Curse (Remove Curse / Remove Lesser Curse), -75% casting speed (wotlkdb, Wowhead guide; TenTonHammer +50%), forces Demonic language. Does not spread.
- Telegraph: none; decursers watch raid frames.

### Sand Vortex / Cyclone (tornadoes)
- Type: ground hazard (moving).
- Count: two Sand Vortex NPCs (15428) summoned on engage (both emulators; wiki "several", "two come near the edge crystals but do not enter the courtyard centre").
- Movement: wander the arena (CMaNGOS: random points within 100 yd of the centre; AzerothCore: fixed waypoint paths). They do not stop for the fight.
- Effect (Harsh Winds, ticking every 1 s while inside): 1961-2039 damage in 10 yd, -85% run speed and Silence in 5 yd (wotlkdb). Guides: "very high damage", "usually fatal" (TenTonHammer), an 8 s whirlwind debuff that cannot be dispelled and drops your aggro (wiki, Wowhead guide).
- Telegraph: visible tornadoes; hunters' Track Elementals shows them on the minimap (wiki, Wowhead guide). A sandstorm weather effect begins at the pull.

### Speed burst
- 10 s after engage his run speed becomes 2.2x (CMaNGOS) / a speed burst is applied (AzerothCore). Guides do not name this but it is why he catches kiters.

## Adds
- Ossirian Crystal (gameobject 180619): see Crystal Weakness. Not an enemy; clicking it is the mechanic. HP: n/a.
- Sand Vortex x2 (NPC 15428): untargetable roaming tornadoes; never die; avoid.
- No hostile adds otherwise (the Anubisath Guardians in the AzerothCore file are trash before the boss).

## Positioning and movement
- Tank: pre-pull, both tanks stand just behind the first (centre) crystal with the raid 20 yd behind them (wiki). An expendable player (mounted rogue) body-pulls him from his platform; the clicker starts the crystal as he reaches the bottom of the stairs so the Weakness lands as he arrives (wiki). The MT stays out of melee until the Weakness is on (Supreme hits kill tanks). Then: tank him beside, not on top of, the crystal (the clicker must not be stomped away, wiki), facing him so that War Stomp throws the raid toward the next crystal (wiki). At ~15-20 s into each window the MT walks him to the next crystal (spotter calls direction); the OT stays second on threat to catch him during Enveloping Winds (10 s). Both tanks stand with their backs to the crystal/wall direction so the knockback is short (wiki). Never let the Weakness expire with him in melee of anyone; never stand between him and a tornado.
- Melee DPS: optional in this fight; if used, attack from behind during Weakness windows only, retreat and bandage after each War Stomp (every 30 s, ~1500-2800 + knockback), and be clear of him when the window ends (TenTonHammer: ~50% uptime). Two melee are often the mounted spotters instead (Warcraft Tavern, Millenium).
- Ranged DPS: 20-30 yd behind the tanks, between him and the next crystal, never clumped near a tornado; save damage for your school's Weakness (casters of the current school go full out, others use wands or off-school spells carefully for threat, Wowhead guide); no DPS during the first window (Wowhead guide) or until after the second crystal (wiki) so threat is established.
- Healers: stay within range of the MT and move with him crystal to crystal (do not fall behind, Wowhead guide); position so War Stomp throws you the same direction as the tank (wiki); stay out of melee range (20 yd) and away from tornadoes.
- Whole raid: the "stack point" each window is the next crystal; the run-out triggers are tornadoes and the end of a Weakness. The centre method (click edge crystals so they respawn centrally and fight in the middle) shortens the kite but raises caster threat (wiki).

## What each role must do and must not do
- Tank:
  1. Do not engage in melee while Strength of Ossirian is up at the start; wait for the first Weakness.
  2. Build threat continuously (he cannot be taunted); use Bloodrage/Battle Shout on the pull (wiki), Shield Slam/Revenge during windows.
  3. Pre-pot Free Action Potion before his Enveloping Winds (every 20 s; the potion lasts 30 s so time it or alternate tanks), or accept the stun and let the OT hold him.
  4. Start moving to the next crystal at 15-20 s into the window; never arrive after the 45 s expires.
  5. Stand off the crystal itself so the clicker is not stomped.
  6. OT: stay second on threat, always ready for the 10 s stun; Insignia/PvP trinket breaks it.
- DPS:
  1. No damage during the first Weakness window.
  2. Spotter (mounted): stay mounted all fight, find the next crystal, ping the minimap, call its direction and school once lit.
  3. Clicker: run/Blink/Travel Form ahead; begin the 5 s click when the current Weakness has 10-15 s left and he is within 30 yd of the crystal; call the school.
  4. Casters: DPS with the weak school at full output; switch school or stop if your threat approaches the tanks; do not break Enveloping Winds on the tank unintentionally.
  5. Melee: leave before War Stomp if low; bandage after.
  6. Avoid tornadoes (Track Elementals, watch minimap); if caught you lose threat for 8 s.
- Healer:
  1. Decurse Curse of Tongues instantly on healers and casters (mages/druids); let it expire on non-casters.
  2. Heal the OT/next threat target during Enveloping Winds (he turns on them for 10 s).
  3. Pre-heal melee before each War Stomp (every 30 s).
  4. Move with the tank each window; do not stand where a knockback puts you in a tornado.

## Timeline of a typical pull
- Pre-pull: tanks behind the centre crystal, raid 20 yd back, spotter mounted, clicker at the crystal, Free Action Potions ready, Amplify Magic on the raid (Wowhead guide).
- t=0: puller aggroes him ("Sands of the desert, rise and block out the sun!"); sandstorm starts; two tornadoes appear and roam. The clicker begins the 5 s activation as he descends the stairs.
- t=~5-8 s: first Weakness lands as he reaches the crystal; Strength of Ossirian removed; tanks engage, nobody else attacks.
- t=10 s: his run speed increases.
- t=20 s: first Enveloping Winds on the MT (10 s), then every 20 s. OT holds him.
- t=30 s: first War Stomp (then every 30 s) and first Curse of Tongues (then every 20-30 s).
- t=~25-30 s (15-20 s into the window): MT starts walking him to the next crystal called by the spotter; clicker runs ahead.
- t=~35-40 s (10-15 s left): clicker begins the 5 s activation; new Weakness lands before t=50 s; casters of the new school open up.
- Repeat every ~40-45 s: one crystal per window; 8-12 windows for a 6-8 minute kill (wiki ">6 min", TenTonHammer ~8 min ranged-only, ~5 min melee-heavy). If a window lapses he yells and hits for 10,000+ until the next crystal.
- Death: "I... have... failed."

## Open questions
- Classic Era HP: ~500,000 (wiki) vs 2,398,320 "SoM 20 Player" (Wowhead Classic).
- Strength of Ossirian magnitude: +300% (wotlkdb, Wowhead guide, Millenium, Warcraft Tavern) vs "200% more" (Icy Veins snippet via search).
- Enveloping Winds duration: 10 s (wotlkdb, wiki, Wowhead guide, Millenium) vs 8 s (TenTonHammer).
- War Stomp damage: 2188-2812 (wotlkdb 3.3.5a) vs ~1500 (Wowhead guide, wiki) vs ~1000 + fall (TenTonHammer); whether it stuns for 5 s (Warcraft Tavern only).
- Curse of Tongues: +75% cast time (wotlkdb, Wowhead guide) vs +50% (TenTonHammer); radius 45 yd (spell data) vs "around him".
- Crystal activation cast: 5 s (wotlkdb) vs ~3 s (TenTonHammer) vs "short" (wiki).
- Initial crystal count: 1 in the centre (Wowhead guide, wiki) vs 3 (AzerothCore) vs 5 (CMaNGOS).
- Supreme re-application: immediate when the weakness drops (AzerothCore) vs 45 s timer (CMaNGOS); guides agree he "regains it if no weakness is active".
- Tornado count: two (emulators, wiki testing) vs "several" (TenTonHammer); the 8 s whirlwind debuff on players (wiki, Wowhead guide) is not visible in the spell data fetched (Harsh Winds is a 1 s re-applied aura).
- No Warcraft Logs report could be fetched to confirm live cadences; the 20 s / 30 s / 20-30 s cycles above are emulator values.
