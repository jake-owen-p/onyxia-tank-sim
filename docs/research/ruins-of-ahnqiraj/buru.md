# Buru the Gorger (Ruins of Ahn'Qiraj)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Buru_the_Gorger — egg explosion 100-500 to players by proximity and 45,000 to Buru, hatchling per egg, Dismember "1248 damage every 2 second", speed resets on egg hit and outruns players ~60 s after, Thorns 200, Creeping Plague 80/tick stacking every 3 ticks, phase 2 at 20% with ~30 s to kill, 750 melee to cloth in P2, immune to taunt, South egg / counter-clockwise order, eggs to 5%.
- https://www.wowhead.com/classic/guide/buru-the-gorger-ruins-of-ahnqiraj-strategy (fetched through r.jina.ai) — 99% damage reduction in P1, faster than players after ~1 minute, egg = ~7% max HP and a brief stun, pre-damage eggs, Creeping Plague "80 per second doubling every 3 seconds", ~30 s from 20%, Greater Nature Protection Potions, fear hatchlings, kiter classes, Curse of Doom timing.
- https://www.wowhead.com/classic/npc=15370/buru-the-gorger (fetched through r.jina.ai) — Health 1,066,000 ("SoM 20 Player"), mana 471,600, 5 abilities.
- https://www.warcrafttavern.com/wow-classic/guides/ruins-of-ahnqiraj-aq20/ — egg kiting loop, hatchlings, P2 at 20% is a DPS race, cannot be taunted.
- https://www.tentonhammer.com/guides/tentonhammers-guide-to-the-ruins-of-ahn-qiraj-section-2-4 — Dismember ~1200 per 2 s, slower than players for ~30 s and catches them after ~1 min, eggs up to 500 to players and up to 40,000 to Buru (5-6%), eggs respawn, keep 2 ready, eggs to ~5%, bring to 20.1% then pop egg -> ~16%, deep water and the ramp escape, "do not go past the second ridge", kill in <25 s in P2.
- https://us.millenium.gg/guide/6975.html?page=3 — 45,000 HP per egg, 20% focus phase, remove Thorns/Retribution Aura because hitting him speeds him up.
- https://wotlkdb.com/?spell=96 — Dismember: 100% weapon damage + 1248 every 2 s for 10 s, Physical, 5 yd.
- https://wotlkdb.com/?spell=1834 — Gathering Speed: +25% run speed, stacking, 3 min.
- https://wotlkdb.com/?spell=1557 — Full Speed: +300% run speed (stacking aura).
- https://wotlkdb.com/?spell=20512 — Creeping Plague: 70 Nature every 2 s, 20 s, 100 yd (3.3.5a values; Classic sources say 80).
- https://wotlkdb.com/?spell=25640 — Thorns: damage shield 40 + 3.2/level, Nature.
- https://wotlkdb.com/?spell=24721 — Buru Transform: transform visual + dummy 100 yd.
- https://wotlkdb.com/?spell=19593 — Egg Explosion: dummy 25 yd, summons Buru Egg Trigger.
- https://warcraft.wiki.gg/wiki/Buru_Egg — level 25, destroyable, Explode damage proportional to distance, Summon Hive'Zara Hatchling.
- https://warcraft.wiki.gg/wiki/Hive%27Zara_Hatchling — level 30 elite silithid worker.
- https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/scripts/Kalimdor/RuinsOfAhnQiraj/boss_buru.cpp (raw fetched) — Dismember 5 s / 5 s on victim, Gathering Speed 2 s / 9 s (reset to 2 s on new target), phase 2 at 20% (Full Speed, eggs removed, Thorns and Gathering Speed removed, threat reset, Creeping Plague 2 s then every 6 s), egg explosion damage to players = 500 - 16 x distance, to Buru = 7% max HP, new random target with 1,000,000 threat after an egg hit.
- https://github.com/cmangos/mangos-classic/blob/master/src/game/AI/ScriptDevAI/scripts/kalimdor/ruins_of_ahnqiraj/boss_buru.cpp (raw fetched) — Dismember 5 s / 5 s, Gathering Speed 9 s / 9 s, Full Speed at 60 s after a new target, Creeping Plague every 6 s in P2, phase 2 below 20%, egg explosion 100-500 within 25 yd to players and 15% of Buru's max HP, Thorns on aggro.

## Overview
- Level ?? (boss), Silithid colossus (Beast). Health: Wowhead Classic 1,066,000 labelled "SoM 20 Player"; no Era value found. No enrage timer; Phase 2 itself is the soft enrage. Fourth boss, The Hatchery, optional. Immune to Taunt.
- Phases: Phase 1 ("egg" / shell intact) from 100% to 20%: he fixates a random player, ignores threat, takes 99% reduced damage (Wowhead guide) and is damaged mainly by egg explosions. Phase 2 (shell burst) below 20%: normal threat table, Dismember and Thorns gone, Creeping Plague ramps on the whole raid; roughly 25-30 s to kill him.
- Raid-size assumptions: 20-man Classic Era. Fast kiters (rogue, mage, shaman, druid), fear classes for hatchlings and Greater Nature Protection Potions for P2 are the composition notes.

## Abilities

### Fixate / chase (target emote)
- Type: aggro pull / fixate.
- Target rule: random player, given overwhelming threat (1,000,000 in both emulators). Changes to a new random player each time an egg explosion hits him (or his target dies).
- Cast time: instant. Cadence: on pull and after every egg.
- Telegraph: an emote naming the target ("Buru the Gorger sets his eyes on <player>" per the EMOTE_TARGET in both emulators; exact text not fetched). The named player must start moving immediately.

### Dismember
- Type: debuff (stacking bleed) applied in melee.
- Target rule: whoever he reaches (the kiter).
- Cast time: instant. Cadence: every 5 s while in melee range (both emulators).
- Damage: 100% weapon damage on hit, then 1248 Physical every 2 s for 10 s (wotlkdb; wiki "1248 every 2 second"; TenTonHammer ~1200 per 2 s). Guides describe it as stacking; a kiter who is caught twice is dead.
- Debuff: Dismember, 10 s, Physical bleed, no dispel type (not dispellable).
- Telegraph: none; being within 5 yd of him is the trigger.

### Gathering Speed / Full Speed
- Type: other (self speed ramp).
- Target rule: self.
- Cadence: Gathering Speed +25% run speed stacking every 9 s while chasing (AzerothCore: 2 s after a new target, then every 9 s). Full Speed (+300%) at 60 s after the last target switch (CMaNGOS) and permanently in Phase 2. Wiki: he can outrun players ~60 s after the last egg hit; TenTonHammer: slower than players for ~30 s, catches them after ~1 minute; Wowhead guide: faster than players after about one minute.
- Reset: every egg explosion that hits him removes the speed stacks and picks a new target.
- Telegraph: none; count seconds since the last egg.

### Thorns
- Type: debuff on attackers (damage shield).
- Effect: 200 Nature damage to anyone who hits him in Phase 1 (wiki; wotlkdb 40 + 3.2/level). Removed at Phase 2. Millenium adds that hitting him in P1 is pointless and warns to remove player Thorns/Retribution Aura (claims it speeds him up; see Open questions).

### Egg explosion (environmental, player-triggered)
- Type: ground hazard / the raid's damage source.
- Trigger: the raid kills a Buru Egg while Buru stands on/next to it.
- Damage to players: 100-500 Physical scaled by distance within 25 yd (wiki, CMaNGOS; AzerothCore formula 500 - 16 x yards).
- Damage to Buru: 45,000 (wiki, Millenium) / up to 40,000 "5-6%" (TenTonHammer) / ~7% of max HP (Wowhead guide, AzerothCore) / 15% (CMaNGOS). Wowhead guide also says he is stunned for a few seconds and loses his speed stacks.
- Side effect: a Hive'Zara Hatchling spawns from every destroyed egg.

### Buru Transform (Phase 2 trigger)
- At 20% HP (all sources): shell bursts, Full Speed applied, remaining eggs removed/hatched (CMaNGOS hatches them, AzerothCore unsummons them), Thorns and Dismember removed, threat reset, normal threat table begins. Melee damage drops to ~750 on cloth (wiki).

### Creeping Plague (Phase 2 only)
- Type: AoE debuff (room).
- Target rule: everyone (100 yd).
- Cadence: first tick ~2 s after transform, reapplied every 6 s (both emulators).
- Damage: Nature; 80 per tick, increasing by 80 every third tick: 80, 80, 80, 160, 160, 160, 240... (wiki, TenTonHammer). Wowhead guide phrases it as "80 per second doubling every 3 seconds (80, 160, 240)". wotlkdb shows 70 every 2 s for 20 s (3.3.5a). Cannot be resisted or dispelled, bypasses immunities (wiki, Wowhead guide); Greater Nature Protection Potion reduces it (Wowhead guide). Ends when Buru dies.
- Telegraph: the transform itself.

## Adds
- Buru Egg (NPC 15514, level 25, destroyable): several around the pool (wiki names a "South egg"; count not stated on any fetched page). HP not found; guides say "damage them to ~5%" and "do not let DoTs finish them early". TenTonHammer says eggs respawn and to keep 2 ready; wiki is silent (see Open questions). Killing one near Buru damages him; killing one anywhere spawns a hatchling.
- Hive'Zara Hatchling (NPC 15521, level 30 elite): one per destroyed egg; aggro a random player. HP not found. In P1 the off-tank picks them up and DPS kills them (Wowhead guide, wiki "spawn group"). In P2 more spawn (from remaining eggs); fear them away (Wowhead guide) and ignore them.

## Positioning and movement
- Tank: there is no tank for Buru in Phase 1 (he fixates). The tank's job is the hatchlings: pick each up near the raid group and hold them while DPS kills them. In Phase 2 the tank picks Buru up normally (threat reset at transform; he is still taunt-immune) and DPS gear is acceptable (Wowhead guide).
- Kiter (the fixated player): run immediately, in one direction around the pool (TenTonHammer; wiki: counter-clockwise from the South egg), toward the next prepared egg; stop on the far side of the egg so Buru stands on it, call it, and move on once it pops. Never swim in deep water with him behind you (TenTonHammer); the ramp is an emergency escape (run partway up and jump into the water) but do not pass the second ridge (TenTonHammer, bug warning). Rogues (Sprint), mages (Blink), shamans (Ghost Wolf), druids (Travel Form) are the preferred kiters; Hunters' Aspect of the Pack helps.
- Melee DPS: "egg group" stands at the next egg, brings it to ~5% without DoTs, kills it when Buru is on it, then moves to the following egg. Avoid being within ~10 yd of the egg at the pop (100-500 damage) and never within 5 yd of Buru.
- Ranged DPS: "spawn group" handles hatchlings and keeps DoTs on Buru (TenTonHammer); in P1 direct damage is nearly worthless (99% reduction) so do not pull hatchling aggro off the tank for nothing. In P2 everyone burns him.
- Healers: follow the kiter at range (priests can Levitate over the deep water to keep line of sight, wiki); heal Dismember victims immediately; in P2 stand in one clump for Prayer of Healing (TenTonHammer, wiki).
- Whole raid: at ~22% everyone resets: stop damage, clear hatchlings, heal to full, pre-pot (Greater Nature Protection), have an egg ready, bring him to ~20.1% then pop the egg so he lands at ~15-16% (TenTonHammer, wiki).

## What each role must do and must not do
- Tank:
  1. Grab every hatchling as it spawns; keep them off the kiter and healers.
  2. In P2, pick Buru up immediately after the transform (threat reset, no taunt) and hold him in the clump.
  3. Never try to tank Buru in P1; he cannot be taunted and Dismember will kill you.
- DPS:
  1. If named by the emote, run at once, toward the next ready egg; never stop in deep water.
  2. Egg group: eggs to ~5%, no DoTs on eggs, pop only when Buru is on top (call "pop").
  3. Kill hatchlings in P1; do not waste cooldowns on Buru in P1.
  4. At ~22% stop; at 20.1% pop the last egg; at transform use every cooldown. Warlocks: Curse of Doom before 20% (Wowhead guide, wiki). Fill all debuff slots with DoTs (TenTonHammer). Sunder him (wiki).
  5. Fear hatchlings in P2 (warrior/priest/warlock AoE fears).
- Healer:
  1. Dismember target is top priority (1248 per 2 s); whoever is caught needs instant heals.
  2. Egg pops hit nearby players for up to 500; pre-heal the egg group.
  3. P2: Prayer of Healing / Chain Heal the clump as Creeping Plague ramps; within ~25-30 s cloth dies, so DPS must finish him. Greater Nature Protection Potions on the whole raid.

## Timeline of a typical pull
- t=0: a raider attacks an egg or Buru; Buru emotes and fixates a random player (1,000,000 threat). Thorns up.
- t=0-30 s: he is slower than players; Gathering Speed stacks every ~9 s (+25% each).
- t=~30-60 s: he matches, then exceeds, player speed (Full Speed at 60 s in CMaNGOS). The kiter must have led him over an egg before this.
- Egg pop: 100-500 to nearby players, ~45,000 (or ~7%) to Buru, speed reset, new random target, 1 hatchling. Repeat roughly every 30-60 s per egg; 10-12 pops take him from 100% to 20%.
- ~22%: raid reset (heal, clear adds, pot, egg ready). ~20.1%: final pop -> transform at <20%.
- Transform: Full Speed, Thorns gone, threat reset, Creeping Plague starts (80/80/80/160/160/160/240... every tick), remaining eggs hatch. Tank grabs him; everyone burns.
- Kill target: <25-30 s after transform (TenTonHammer, wiki, Wowhead guide). Total fight typically 8-12 minutes.

## Open questions
- Egg damage to Buru: 45,000 (wiki, Millenium) vs up to 40,000 (TenTonHammer) vs ~7% max HP (Wowhead guide, AzerothCore) vs 15% (CMaNGOS).
- Whether eggs respawn during the fight: yes (TenTonHammer) vs not mentioned (wiki, Wowhead guide); egg count and egg HP not found.
- Creeping Plague ramp: 80 stacking every 3 ticks (wiki, TenTonHammer) vs "80/s doubling every 3 s" (Wowhead guide) vs 70 per 2 s (wotlkdb 3.3.5a).
- P1 damage reduction: "99%" (Wowhead guide) vs AzerothCore's LowerPlayerDamageReq mechanism (players must still deal some damage) vs no mention on wiki.
- Speed: Full Speed at 60 s after last switch (CMaNGOS) vs continuous +25% stacks (AzerothCore); guides agree on "~1 minute".
- Whether player damage speeds him up (Millenium's Thorns/Retribution Aura warning) or only time does (all other sources).
- Classic Era 20-man HP: only "SoM 20 Player" 1,066,000 readable.
- Hatchling HP/abilities; Buru's P2 melee (~750 to cloth, wiki) is single-source.
