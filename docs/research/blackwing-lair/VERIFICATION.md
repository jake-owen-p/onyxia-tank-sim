# Blackwing Lair scripts: independent verification

Second research pass over `data/encounters/blackwing-lair/*.json` against `docs/research/blackwing-lair/*.md`, Classic spell data, boss mods, emulator scripts and strategy guides. 38 fetches and 4 searches. Lists only disagreements, gaps and misleading modelling; anything not listed was checked and matched.

Conventions: field paths are JSON paths inside the boss file. Headings use the script convention (0 = east, 90 = north). Coordinates recommended below were tested on the floor polygons with a segment-intersection line-of-sight check against the listed walls. cmangos is an emulator reconstruction and is marked as such. Wowhead Classic pages were read through the `r.jina.ai` proxy; Icy Veins stayed blocked behind its bot check even through the proxy, so anything quoted from it is a search-result snippet.

Confidence: **high** = primary spell data or two independent sources agree; **medium** = sources conflict or the claim rests on one guide; **low** = cosmetic, or a judgement call.

---

## Razorgore the Untamed

### R1. Conflagration: the tank is told to win him back (medium)
- **Fields:** `phases[1].expectations[conflagBack]`, `cues.list[tauntConflag]`, `roles.tank.description`, `playerAbilities.taunt.tip`
- **Script:** "The moment you can act, get back on top. He cannot be Taunted, only out-threatened; use the threat dump." The cue says the threat dump is needed the instant the panic ends.
- **Sources disagree on whether threat is lost at all.**
  - Warcraft Wiki: while confused "Razorgore attacks the next highest target on his threat table"; afterwards he "returns to his normal threat mechanics". https://warcraft.wiki.gg/wiki/Razorgore_the_Untamed
  - Warcraft Tavern: it "will burn the main tank and drop all threat". https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/
  - Wowhead: cast "at the person on top of Razorgore's threat table"; run two tanks both building threat. Silent on a drop. https://www.wowhead.com/classic/guide/razorgore-the-untamed-blackwing-lair-strategy
  - cmangos (emulator) has no threat code for it.
- **Change:** keep the mechanic (the engine needs a press to return him), but stop presenting it as settled. Set `conflagBack.tip` and `tauntConflag.tip` to: "He went to the next tank while you panicked. On the Warcraft Wiki reading he comes back by himself when the panic ends; Warcraft Tavern says the panic wipes your threat. Here the button stands for getting back on top either way." Remove "use the threat dump" from `playerAbilities.taunt.tip`. The real job in this window is the off-tank's, and `offtankCatch` already scores it.

### R2. Fireball Volley is whole-room with no cover (medium)
- **Field:** `actions.fireballVolley`
- **Script:** `aoe`, no `radius`, no cover. Notes: "Pillars and line of sight are not modelled."
- **Sources:** "deals Fire damage to everyone in a 45-yard range", "can be outranged or LoS'd by using the pillars around the room" (Wowhead guide above); hostile units within 45 yards (Warcraft Wiki above). The research file also records it as LoS-blocked.
- **Change:** the engine can do this now. Add `"radius": 45, "safeSpots": ["pillarCover"], "safeRadius": 8, "safeRoles": ["ranged", "healer"]`. Add `arena.walls` entry `{ "id": "pillar", "points": [[-5,10],[5,10]] }` and `positions.pillarCover` `{ "x": 0, "y": 1, "tolerance": 6, "label": "Behind the pillar: out of Fireball Volley" }`. Checked: from `bossSpot` (0,24), both `rangedSpot` (0,2) and `healerSpot` (5,-2) sit behind that pillar and within 8 of the cover spot, and the healer is 35.4 from `tankSpot`. Update `notes` and the volley `tip`.

### R3. Phase 2 tank location (low)
- **Fields:** `positions.tankSpot` (0,33), `positions.bossSpot` (0,24)
- **Sources:** Wowhead (above): "Tank Razorgore in the middle of the room, close to the pillars." The research file says the raid's corner; the script uses the north end.
- **Change:** none required if R2's pillar is added. The pillar is what the guide's position buys.

---

## Vaelastrasz the Corrupt

### V1. Tank Burning Adrenaline swaps him immediately (high)
- **Fields:** `actions.tankAdrenaline`, `phases[0].expectations[stepIn]`, `cues.list[stepInSwap]`, `roles.tank.description`
- **Script:** a `targetSwitch` onto the raid the instant the debuff lands, 3 s to take him back, tip "take him on the spot".
- **Sources:**
  - Warcraft Wiki: next tank is "spamming threat-generating moves to ensure that Vaelastrasz focuses on him when the MT drops dead"; the afflicted tank has "time to deal out some high-damage moves before dropping dead"; healing shifts "after about 10 seconds". https://warcraft.wiki.gg/wiki/Vaelastrasz_the_Corrupt
  - Wowhead: the Main Tank "stays in position and attempts to deal some damage in the time he has before dying". https://www.wowhead.com/classic/guide/vaelastrasz-the-corrupt-blackwing-lair-strategy
  - Warcraft Tavern: "when the tank with BA is about to die, the next tank by threat should start moving" toward the MT's position. https://www.warcrafttavern.com/guides/wow-classic-blackwing-lair-guide/
  - cmangos (emulator): casts on the victim and has no special handling, so nothing moves him off the tank. BigWigs/DBM carry a 20 s bar on the target.
- **Why it matters:** the rehearsal teaches panic at 0 s for something that happens at about 18-20 s, and removes the actual job: building threat during the fuse.
- **Change:** replace the action and add a delayed swap:
  ```json
  "tankAdrenaline": { "label": "Burning Adrenaline (tank)", "kind": "debuff", "cast": 0, "dispel": "none", "target": "tank", "duration": 20, "tickDamage": 0, "follow": [{ "id": "tankSwap", "delay": 18 }], "warn": true, "cue": "roar", "icon": "aggro", "requires": "grounded", "tip": "Every 45 s the tank on top of his list gets Burning Adrenaline and dies about 18-20 s later, hitting twice as hard until then. He stays on that tank. The next tank spends those seconds building threat and must be on him the moment the old tank drops." },
  "tankSwap": { "label": "Tank down: next tank in", "kind": "targetSwitch", "cast": 0, "duration": 2.5, "toast": "The old tank has dropped. Next tank, take him now!", "hidden": true, "warn": true, "cue": "roar", "icon": "aggro", "requires": "grounded", "tip": "Burning Adrenaline has killed the tank. The next tank on the threat list takes him." }
  ```
  Then point `stepIn.event` and `cues.list[stepInSwap].event` at `tankSwap`, and raise `drills[tankSwap]` `tankAdrenaline.every` from 12 to 26 so the fuses do not overlap. In `roles.tank.description` replace "step in the moment he turns" with "build threat while the debuff runs; he turns when the old tank dies, about 18 s later".

### V2. Stale "ENGINE GAP": the bomb has a role filter now (high)
- **Fields:** `actions.burningAdrenaline`, `notes`, `roles.melee.description`, `phases[0].expectations[bombMelee]`, `drills[bombRun].roles`
- **Script:** no `roles`, and `notes` claims "the carried bomb has no `roles` filter". The script therefore drops it on tanks and melee.
- **Sources:** `src/core/sim.js:597` honours `roles` for `placement: random` carried hazards, as `docs/ENCOUNTER_FORMAT.md` documents. In game it "will only be cast on classes with mana, except for every third use" (Warcraft Tavern above); "Rogues and feral Druids are generally unaffected unless they gain aggro" (Warcraft Wiki above); cmangos selects with `SELECT_FLAG_POWER_MANA`.
- **Change:** add `"roles": ["ranged", "healer"]`. Delete the `ENGINE GAP` sentence and the "bomb on a player tank drags the boss around" caveat from `notes`. Remove expectation `bombMelee`. Set `drills[bombRun].roles` to `["ranged", "healer"]`. Change the melee description to: "Warriors and rogues never get Burning Adrenaline unless they are top of his threat list. If you are a mana melee (Retribution, Enhancement), run it out."

### V3. Map labels contradict the spots (medium)
- **Fields:** `arena.labels`, `positions.rangedSpot.label`, `roles.ranged.description`
- **Script:** he faces west (heading 180), so his right is north. The label "Warrior line at his left shoulder" sits at (-2,38), north of him, which is his **right**. "Far wall: casters" sits at (10,-34), but `rangedSpot` is (-4,-5), near the centre of the room. A real far-wall spot on the south side would be about 58 from the boss and out of the 30 range.
- **Sources:** Warcraft Wiki: tanks on "Vael's left", ranged and healers "against the wall to Vael's right". Wowhead: melee on his right side near the front legs.
- **Change:** either move the casters to the near wall on his right, for example `rangedSpot` (-6,40) and `healerSpot` (-14,38), both on the floor and clear of breath and tail, and swap the two labels accordingly; or keep the spots and relabel honestly: "Warrior line at his right shoulder" and "Casters: mid-room, opposite the tank line". Drop "far wall" from the `rangedSpot` label and role text.

---

## Broodlord Lashlayer

### B1. Blast Wave has one plan where the sources have three (low)
- **Fields:** `actions.blastWave.tip`, `roles.melee.description`, `phases[0].expectations[blastAvoid].tip`
- **Script:** walking out of 20 yards is the only correct answer.
- **Sources:** Wowhead has melee stay with "their backs against a wall" to avoid being launched. https://www.wowhead.com/classic/guide/broodlord-lashlayer-blackwing-lair-strategy . Icy Veins (snippet) has them run or LoS it around the corner. https://www.icy-veins.com/wow-classic/broodlord-lashlayer-guide-strategy-abilities-loot . Warcraft Tavern weaves out every ~10 s.
- **Change:** keep the `moveOut` drill, but add to the melee role text and the tip: "Some raids stay in with backs to the wall and eat it with Fire Resistance; this rehearsal drills the walk-out."

### B2. "Ranged corner" label is 32 yards from the ranged spot (low)
- **Fields:** `arena.labels[Ranged corner]` (18,10), `positions.rangedSpot` (-14,11), `roles.ranged.description` ("beside the gate")
- **Change:** move the label to (-14,8). Drop "beside the gate" from the role text: the gate label is at (8,43), about 38 from the spot.

---

## Firemaw

### F1. Flame Buffet: the main decision of the fight is not modelled (high)
- **Fields:** `actions.flameBuffet`, `notes`, `continuousMetrics.outOfRange`
- **Script:** caps at 8 stacks, no cover. `notes` says "there is no line of sight, so the door-frame dance ... cannot be expressed." That is no longer true: `safeSpots`, `safeRadius` and `shelterAt` exist for exactly this (`src/core/sim.js:185`, `:636`; `src/core/ideal.js:138`).
- **Sources:** "get out of LoS when stacks reach about 5-10", "hug the walls either side of him" (https://warcraft.wiki.gg/wiki/Firemaw); "To remove Flame Buffet, just use the walls to LoS Firemaw and wait for the stacks to fall off" (https://www.wowhead.com/classic/guide/firemaw-blackwing-lair-strategy); 5-7 is the safer threshold (Warcraft Tavern).
- **Change:**
  - Add `positions.coverWest` `{ "x": -13, "y": -9, "tolerance": 3, "label": "West of the door frame: out of his sight" }` and `positions.coverEast` `{ "x": 13, "y": -9, "tolerance": 3, "label": "East of the door frame: out of his sight" }`. Checked: both on the floor, hidden from `bossSpot` by the door frame.
  - On `flameBuffet` add `"safeSpots": ["coverWest", "coverEast"], "safeRadius": 3, "shelterAt": 6`, set `"maxStacks": 15` and `"tickDamage": 110`. The raise matters: `player.healPerSecond` is 1250 and applies to every role (`src/core/entities.js:89`), so at the current 35 per stack nothing a stack does can ever hurt a non-tank player. At 110 per stack, 6 stacks costs 660/s (fine) and 12 stacks 1320/s (dying).
  - Leave `flameBuffetTank` uncovered: the tank does not hide.
  - Ranged stay in attack range at cover (edge distance 29.5) but melee do not (a 4.0 s walk each way), so set `continuousMetrics.outOfRange` to `penaltyPerSecond: 0.1, severe: 40` with a tip that dropping stacks is the right kind of out of range, matching what Vaelastrasz does for bomb carriers.
  - Delete the `ENGINE GAP` passage in `notes` and "no melee disengage" from its gap list.

### F2. Healers are told to hide but placed in plain sight (high)
- **Fields:** `positions.healerSpot` (-4,-4), `roles.healer.description`
- **Script:** "Stay out of his line of sight but in reach of the tank through the door frame", with the spot in the middle of the door passage on a clear line to the boss.
- **Geometry:** with the tank at (0,32) that instruction cannot be met. Every hidden point south of the door is further than 40 from the tank (best case about 40.3 at the door corner; 43.0 at the cover spot above). `heal.range` is 40.
- **Sources:** Wowhead: "position themselves such that they can heal the Tanks but be out of LoS of Firemaw" (above). That geometry only exists if the tank is at the door.
- **Change:** keep the spot and tell the truth: "You cannot see the tank from cover in this layout. Stay in the doorway to heal, and step behind the door frame at 6 stacks, between Shadow Flames." That dip is a genuine decision and F1 makes it work. Bringing the tank to the door is the alternative, see F4.

### F3. Flame Buffet duration: 20 s or 10 s (medium, unresolved)
- **Field:** `actions.flameBuffet.duration` (20)
- **Sources:** 20 s: classicdb tooltip (https://classicdb.ch/?spell=23341) and Warcraft Wiki. 10 s: Wowhead Classic tooltip "for 10 sec" (https://www.wowhead.com/classic/spell=23341) and the Wowhead guide. The third database I tried returned no data.
- **Change:** none yet. Check the debuff timer in a live Era client. If it is 10 s, set `duration: 10` and change the "20 seconds" text in the tip and melee role. It sets how long a player must hide, so it is worth one in-game look.

### F4. "In the doorway" text versus the spot (medium)
- **Fields:** `positions.tankSpot.label`, `roles.tank.description`, `phases[0].expectations[pull]`, `positions.bossSpot` (0,24)
- **Script:** says "boss in the doorway", but `bossSpot` is 10 yards inside the lab (his south edge at y=18, door mouth at y=8) and the tank is at the far wall.
- **Sources:** "tanked in the entrance", "attacking the main tank inside the doorway" (Warcraft Wiki); "tanked at the entrance of the laboratory he guards" (Wowhead). The SoD guide describes two layouts, one with him "tanked directly in the doorway" and the tank in his room. https://yttrium-tyclief.github.io/sod-guides/bwl/firemaw.html
- **Change (smallest honest fix):** reword to "Just inside his room with his tail to the door, tank at the wall" so the wall check still means something. Moving the fight onto the door would need a new `backWall` and is a redesign, not a fix.

---

## Ebonroc

### E1. Shadow of Ebonroc turns him onto the raid (low)
- **Field:** `actions.shadowTurn`
- **Script:** a `targetSwitch` sends him at the raid when the debuff lands.
- **Sources:** he stays on the debuffed tank until Taunted off; the failure is 25,000 healed per hit, not a loose boss. https://www.wowhead.com/classic/guide/ebonroc-blackwing-lair-strategy
- **Change:** keep it (the engine cannot heal him, see Engine limits), but say so in the toast: "Shadow of Ebonroc! Next tank, Taunt now. Every hit on that tank would heal him 25,000."

### E2. "Stair corner" is 30 yards from the tank spot (low)
- **Fields:** `arena.labels[Stair corner]` (-30,40), `positions.tankSpot` (0,38), `phases[0].expectations[pull].label`
- **Change:** move the label to (0,42), or reword it to "Stair wall".

---

## Flamegor

### G1. Tranquilizing Shot is scored on the healer (high)
- **Fields:** `phases[0].expectations[tranq].role` ("healer"), `cues.list[dispelIt].role`, `drills[tranqDrill].roles`, `roles.healer.description`, `roles.ranged.description`, `continuousMetrics.debuffSeconds.roles`
- **Script:** "You are the Tranq shot in this rehearsal as well as a healer." The ranged seat carries the button but is not scored on it.
- **Sources:** only Hunters remove Frenzy. https://www.wowhead.com/classic/guide/flamegor-blackwing-lair-strategy and the research file. The ranged seat loses its only real decision and the healer is taught a job that does not exist.
- **Change:** set all three role fields to `"ranged"`, drop `dispel` from `roles.healer.abilities`, and rewrite both role texts. This needs a small code change first, see Engine limits item 1.

### G2. Fire Nova keeps coming however fast you Tranq (medium)
- **Field:** `actions.frenzy.follow`
- **Script:** two fixed pulses at +2 s and +4 s, whatever the player does. A perfect Tranq and a late one are the same to the raid.
- **Sources:** Fire Nova is "only used while Flamegor is Frenzied"; if Hunters react fast, DPS "should take no damage" (Wowhead above).
- **Change:** cannot be fixed in JSON, see Engine limits item 2. Until then add to the `frenzy` tip: "In the real fight a Tranq inside 2 s stops the Fire Nova completely; here the pulses always land."

### G3. "Tank corner" label (low)
- **Fields:** `arena.labels[Tank corner]` (-30,40), `positions.tankSpot` (0,38). Same as E2.

---

## Chromaggus

### C1. Breaths are frontal cones and the hide walls do not work (high)
- **Fields:** `actions.incinerate`, `actions.timeLapse`, `arena.walls[hideWest,hideEast]`, `positions.rangedSpot`, `notes`
- **Script:** `cone`, so only the tank is ever hit, and the raid has no reason to move. `notes`: "the engine has no line of sight ... the wall hide cannot be expressed."
- **Sources:** breaths hit "everything within LoS of Chromaggus"; "Everyone except the main tank moves out of line of sight" on the warning (https://warcraft.wiki.gg/wiki/Chromaggus); Wowhead agrees and says to move "a few seconds before the breath" (https://www.wowhead.com/classic/guide/chromaggus-blackwing-lair-strategy).
- **Geometry:** the drawn hide walls do not cover what they claim. From `bossSpot` (0,24) a player at (-30,10) or (-34,8) is still visible past the wall at y=14; only a sliver hugging it, such as (-36,12), is hidden, and that is 33 yards from `healerSpot`, about 4.8 s, against a 2 s cast.
- **Change:**
  - `arena.walls`: `hideWest` becomes `[[-22,4],[-12,4]]`, `hideEast` becomes `[[12,4],[22,4]]`. Move the labels to match.
  - Add `positions.hideSpotW` `{ "x": -19, "y": 0, "tolerance": 3, "label": "Behind the wall: out of his sight" }` and `hideSpotE` at (19,0). Checked: on the floor, hidden within a 3-yard radius, and 37.2 from `tankSpot`, so healers really can heal the MT from cover, as the guides describe.
  - `positions.rangedSpot` becomes (8,-4) so cover is 1.7 s away; `healerSpot` (-8,-6) is already 1.8 s away.
  - `actions.incinerate`: `"kind": "aoe", "cast": 5, "offBoss": true, "damage": 3900, "tankDamage": 3900, "playerMetric": "breathsTaken", "safeSpots": ["hideSpotW", "hideSpotE"], "safeRadius": 3, "safeRoles": "nontank"`. Drop `cone`, `conditional`, `raidMetric`, `raidToast`.
  - The 5 s cast is the boss-mod warning, the same device Broodlord's Blast Wave uses: melee need about 3.5 s to reach cover from his back. Say in `notes` that the real cast is 2 s.
  - Delete the `ENGINE GAP` passage in `notes` about line of sight.

### C2. Time Lapse is 8 s, not 6 (medium)
- **Fields:** `actions.timeLapseStun.duration` and `.stun` (6), `actions.timeLapse.tip`
- **Sources:** spell data 8 s on both https://www.wowhead.com/classic/spell=23310 and classicdb. Guides say 6 s (Warcraft Wiki, Wowhead guide, Icy Veins snippet). The tooltip outranks guides written from memory.
- **Change:** set both to 8. If the shorter stun stays for playability, state in the tip that the real one is 8 s.

### C3. Who hides from Time Lapse (medium)
- **Fields:** `actions.timeLapse`, `actions.timeLapseStun`, `roles.tank.description`
- **Script:** every non-tank seat is stunned unconditionally; notes say they "cannot leave line of sight", which is no longer true. The tank seat is both "main tank" and "the tank who dodges".
- **Sources:** "the off-tanks and some healers" are "the only ones to LoS" (Wowhead above); "2 healers and the off-tank" (Icy Veins snippet); "Main tank is hit by every Time Lapse. Off tanks ... leave line of sight" (Warcraft Wiki).
- **Change:** make `timeLapse` an `aoe` like C1 (`"damage": 0, "tankDamage": 0`, no `playerMetric`: taking it is correct for DPS), with `"cast": 5, "offBoss": true, "safeSpots": ["hideSpotW", "hideSpotE"], "safeRadius": 3, "safeRoles": "healer"`. Add the same `safeSpots` and `safeRadius` to `timeLapseStun`, because the marker reads the cast's fields and the hit reads the debuff's. That gives the healer seat the real job: hide and keep the raid alive while it is stunned. Add to `roles.tank.description`: "In the real raid the main tank is stunned too; you are playing the off-tank who stays out of sight."

### C4. Tranquilizing Shot is scored on the healer (high)
- **Fields:** `phases[0..1].expectations[frenzyTranq].role` ("healer"), `roles.healer.description`, `roles.ranged`
- **Sources:** "Hunters should remove it with Tranquilizing Shot" (Wowhead above).
- **Change:** set the expectations to `"ranged"`, add `dispel` to `roles.ranged.abilities`, and add a cue `{ "id": "tranqIt", "ability": "dispel", "on": "event", "event": "frenzy", "offset": 0, "early": 0, "late": 3, "role": "ranged", "short": "TRANQ", "label": "Tranq the Frenzy", "tip": "Shoot it off inside 2 seconds." }`. Do not reuse `dispelIt`: `debuffApplied` also fires for Afflictions. Needs Engine limits item 1.

---

## Nefarian

### N1. Shadow Command is taught as dispellable (high)
- **Fields:** `actions.shadowCommand.dispel` ("magic"), `phases[0].expectations[commandDispel]`, `roles.healer.description`, `cues.list[dispelIt].tip`
- **Script:** "Dispel Magic it off."
- **Sources:** dispel type n/a on both https://www.wowhead.com/classic/spell=22667 and https://classicdb.ch/?spell=22667 . The script's own tip and the research file both say to polymorph or root the victim.
- **Change:** set `"dispel": "none"`. Delete `commandDispel`. Remove "Phase 1 dispel Shadow Command" from the healer description and "then Shadow Command" from `dispelIt.tip`. Note it in `notes`. Teaching a healer to spam Dispel on a mind-controlled raider in a real pull is an actively bad habit.

### N2. Veil of Shadow "halves" healing (high)
- **Field:** `roles.tank.description`
- **Script:** "Veil of Shadow halves your healing". `healingMult` is 0.25 and the healer text correctly says a quarter.
- **Sources:** "Reduces healing effects for an enemy by 75% for 6 sec." https://www.wowhead.com/classic/spell=22687
- **Change:** "Veil of Shadow cuts healing on you to a quarter for 6 seconds."

### N3. Landing Shadow Flame has no cover (medium)
- **Fields:** `actions.landingFlame`, `notes`
- **Script:** room-wide 2500; `notes` says "the safe spot behind the throne cannot be expressed".
- **Sources:** the throne "is the only place in the room that has this property" (https://warcraft.wiki.gg/wiki/Nefarian_(tactics)); "hide in the northernmost corner of the throne" (https://us.millenium.gg/guide/6486.html?page=7).
- **Change:** add `positions.throneBack` `{ "x": 0, "y": 50, "tolerance": 4, "label": "Behind the throne" }` (on the floor) and `"safeSpots": ["throneBack"], "safeRadius": 5` on `landingFlame`, and correct `notes`. It stays an option rather than a drill: with the cloak assumed, nobody needs it, and with `cast: 0` the marker will not walk anyone there. The 2500 stays a placeholder; see the unverified list.

### N4. Shaman and Warlock calls are missing (medium)
- **Fields:** `actions`, `phases[1].actions`, `notes`
- **Script:** Druid, Shaman and Warlock calls "are not modelled".
- **Sources:** Corrupted Totems need "single-target DPS" and must not survive into phase 3; Infernals are fire-immune and stun nearby players (Warcraft Wiki above). Those are target-priority decisions, and killable adds with `killFirst` now express them.
- **Change:** add `shamanCall` as `kind: "adds"`, `"killFirst": true`, 2-3 totems spawned at new spots near his flank, `speed: 0`, `lifetime` about 25 (check the validator accepts `speed: 0`), and `warlockCall` as a `killFirst` add wave of 2-4 Infernals from the raid side. Slot them into the 150 s rotation at 212 s and 242 s, and lengthen the `every` accordingly. The Druid call can stay out: it only matters for a Druid main tank.

### N5. Call durations shortened (low)
- **Fields:** `actions.warriorCall.duration` (15), `actions.priestCall.duration` (12)
- **Sources:** 30 s in spell data and the research file; `notes` admits the warrior one.
- **Change:** set both to 30. The rotation has 30 s between calls, so nothing overlaps. If damage then becomes too heavy, lower `tickDamage` rather than the duration.

### N6. Rogue call stuns instead of rooting (low)
- **Field:** `actions.rogueCall.stun` (5)
- **Sources:** teleported and "immobilized" near him; rooted players can still attack (Warcraft Wiki above).
- **Change:** remove `stun`; set `duration: 30`; keep the tip. The teleport itself cannot be modelled, see Engine limits.

### N7. Healer seat cannot outrange the fear (low)
- **Fields:** `positions.healerSpot` (30,30), `roles.healer.description`
- **Geometry:** no floor point is both beyond the fear (more than 41 from the boss centre) and within 40 of `tankSpot`; a brute-force search of the arena found none.
- **Sources:** healers "are able to outrange the fear, if properly timed" (Wowhead Nefarian guide).
- **Change:** say so in the healer description: "You are in the main tank's group, inside Roar range; expect the fear." Otherwise the seat looks broken.

---

## Things the research file got wrong

- **`vaelastrasz.md`, tank positioning:** "the next tank steps into the MT spot immediately" and "the next tank steps in instantly". The sources in V1 say the tank builds threat and takes over as the old tank dies. This is the origin of V1.
- **`firemaw.md`:** treats Flame Buffet's 20 s as settled and omits the 10 s reading from its Open questions (F3).
- **`chromaggus.md`, Time Lapse:** "everyone except one off-tank (and that off-tank's healers)" is close to Wowhead but leaves out that the Warcraft Wiki has others take the stun only if they have more hate than the off-tank. It is also the source for treating 6 s and 8 s as equals, when the spell data says 8.
- **`nefarian.md`, spell chain:** "22992 / 22993 ... passive periodic trigger (10 s interval) and a 20,000 Shadow hit" pairs the wrong spells. Wowhead shows 22992 triggering 22986, every 10 s. 22993 is a separate 20,000-damage Shadow Flame whose role in the fight is not established.
- **`README.md`:** "Wowhead (all locales, region-blocked)" is no longer true: the `r.jina.ai` proxy reads Wowhead Classic. Icy Veins is still blocked that way.

---

## Engine limitations no script change can fix

1. **Dispel is healer-only outside the core.** The `dispel` action itself is not gated, but `tests/helpers.js:78-79` (bots), `src/core/sim.js:674` (`debuffSeconds`) and `src/core/sim.js:884` (the on-screen hint) all check `role === 'healer'`. G1 and C4 need those three lines changed to "the role has a `dispel` ability". The scripts' `ENGINE GAP` wording overstates this: it is a small fix.
2. **`follow` chains cannot be cancelled.** Flamegor's Fire Nova pulses cannot stop when Frenzy is removed. It needs a `follow` entry with something like `"cancelIfDispelled": true`, or a `conditional` on a live debuff.
3. **Boss HP is a clock.** Ebonroc's 25,000 per-hit heal, a warrior's Mortal Strike on him, Chromaggus' death heals and the school rotation cannot be expressed.
4. **Cover only stops damage to you.** Attacks have no line of sight, so a player in cover can keep attacking if in range. Hiding costs nothing except time out of range (F1, R2).
5. **The marker walks to cover only for casts or `shelterAt`.** An instant such as `landingFlame` cannot lead anyone to cover.
6. **Single tank seat with a pooled threat table.** Off-tank soaking of Wing Buffet, three-tank layouts and Broodlord's queue stay reactive re-Taunts.
7. **No way to move non-tank players.** `teleportTankTo` is tank-only, so the Rogue call cannot put anyone in his arcs.
8. **Not expressible:** damage to allies near a target (Conflagration splash), a healing penalty tied to which spell is cast (Priest call), maximum-health changes (Time Lapse, Burning Adrenaline), resources (Blue Affliction, Essence of the Red), and items (Hourglass Sand).

---

## Could not verify

- **Flame Buffet duration**, 10 s or 20 s. See F3; needs a look in a live client.
- **Taunt immunity on Nefarian and Broodlord.** Nefarian rests on one guide (Millenium: "can't be taunted"); Broodlord's on an SoD guide. Wowhead and the Wiki are silent for both.
- **Brood Affliction targets per cast.** Guides say it debuffs "everyone in the zone", but one per cast or all per cast is not stated; cmangos calls it a to-do and the spell is a server-side dummy. The script's one-per-cast is a guess.
- **Landing Shadow Flame damage with the cloak.** Sources range from about 1000 (Wiki, modern text) to about 4000-5000 (research estimate). cmangos applies a passive aura and casts no landing breath at all.
