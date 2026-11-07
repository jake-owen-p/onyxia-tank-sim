# Loatheb (Naxxramas)

Sources: list every URL used, one per line, with what it contributed.
- https://warcraft.wiki.gg/wiki/Loatheb_(Classic) — Classic 40-man page: Corrupted Mind 1-minute linked healing cooldown (includes cleanses; Vampiric Embrace triggers it; Lightwell not affected); Poison Aura 196 Nature / 6 s for 12 s, 5 yd; Inevitable Doom starts at 2:00, 2,550 Shadow after 10 s, 100 yd, every 30 s then every 15 s from 5:00, undispellable/unresistable; Remove Curse every 30 s from ~2 s; Fungal Bloom +50% crit / +60% spell crit / no threat, 90 s, max 5 players; spores every 12–13 s on the far side; consumable timeline (GSPP pre-pull, bandage/healthstone schedule); the ~5:15/5:40 Doom survival warning; quotes.
- https://www.wowhead.com/classic/guide/loatheb-naxxramas-raid-strategy (via r.jina.ai) — Wowhead Classic guide: one heal per 60 s; Poison Aura ~200 Nature per 6 s to tank/melee; Remove Curse every 30 s (warlocks re-apply curses); Doom first at 2 min, ~2,500 Shadow, every 30 s, every 15 s after 5 min; spores give Fungal Bloom to the 5 nearest; melee pre-pop Greater Nature Protection Potion (absorbs ~2,600); comments: Shaman Cure Poison triggers the lockout (use Poison Cleansing Totem), Darkmoon Card: Heroism works, Major Rejuvenation Potion for casters.
- https://www.wowhead.com/classic/spell=29185/corrupted-mind — Corrupted Mind (aura): 2 min debuff on all players, "Can only cast one healing or curing spell every 60 seconds", proc-trigger of 29184.
- https://www.wowhead.com/classic/spell=29184/corrupted-mind — Corrupted Mind (lockout): 1 min, "Can't cast healing or curing spells", class-script override listing Priest/Paladin/Shaman/Druid heals, HoTs, shields, dispels, Holy Nova, Vampiric Embrace, Desperate Prayer.
- https://www.wowhead.com/classic/spell=29204/inevitable-doom — Inevitable Doom: instant, 10 s, 2,550 Shadow after 10 s, 100 yd radius, ignores LoS, no dispel type.
- https://www.wowhead.com/classic/spell=29232/fungal-bloom — Fungal Bloom: 90 s, max 5 targets, 10 yd radius, +50% melee/ranged crit, +60% spell crit, -100% threat.
- https://www.wowhead.com/classic/spell=29234/summon-spore — Summon Spore: instant, 60 yd range, 70 yd radius, summons 1 Spore.
- https://www.wowhead.com/classic/spell=29865/poison-aura — Poison Aura: 196 Nature every 6 s for 12 s, Poison dispel type, 10 yd radius (5 yd range).
- https://www.wowhead.com/classic/spell=30281/remove-curse — Loatheb's Remove Curse: instant, dispels 32 curses from himself.
- https://classicdb.ch/?npc=16011 — Loatheb: 5,200,000 HP, melee 8,475–9,727, armor 4,691.
- https://classicdb.ch/?npc=16286 — Spore: level 60, 1,400 HP, melee 86–110.
- https://github.com/DeadlyBossMods/DBM-Vanilla/blob/master/DBM-Raids-Vanilla/VanillaNaxx/PlagueQuarter/Loatheb.lua — DBM Classic timers: first Spore 11.3 s, then every 12.9 s; Remove Curse first 0.5–8.2 s then every 30.7 s; Inevitable Doom interval alternates 29.1 s / 32.4 s; from the 7th Doom: 9.7 s, then alternating 19.4 s / 11.3 s; Corrupted Mind IDs 29184/29195/29197/29199 (per healing class), heal-ready warning 55 s after the lockout.
- https://www.warcrafttavern.com/wow-classic/guides/naxxramas/ — Classic guide: spores every 13 s; Fungal Bloom numbers; Doom at 2 min / every 30 s / every 15 s after 5 min; save self-heals for the 3rd–5th Dooms.

## Overview
- Level ?? boss, Undead (bog beast). HP 5,200,000 (classicdb.ch) — the largest HP pool in Classic Naxxramas except Thaddius. Soft enrage: Inevitable Doom cadence halves at ~5:00, which the wiki calls effectively fatal around 5:15–5:40. Third and last boss of the Plague Wing, required.
- Phases: single phase; the structure is a timeline (spores every ~13 s, Dooms from 2:00, acceleration at ~5:00) rather than HP phases.
- Raid-size assumptions: 40-man Classic Era; Shadow Protection Potions and self-healing consumables for everyone; healers act as DPS. Shadow resistance gear is suggested by the Naxx overview page (wiki) but not required by the boss page.

## Abilities

### Corrupted Mind
- Name: Corrupted Mind (29185 aura; 29184 / 29195 / 29197 / 29199 the per-class 60 s lockout)
- Type: debuff (healing lockout)
- Target rule: all players (applied at pull, refreshed; DBM comment: 2-minute debuff refreshed every 11 s while in combat).
- Cast time: instant; not interruptible.
- Cadence: constant; the lockout is applied the moment a healing or curing spell is cast while the aura is up.
- Effect: "Can only cast one healing or curing spell every 60 seconds." Casting any heal, HoT, shield, dispel/cleanse (Cure Poison, Abolish Disease, Cleanse, Dispel Magic), Holy Nova, Desperate Prayer or Vampiric Embrace applies a 1-minute "Can't cast healing or curing spells" lockout to that caster. Totems (Poison Cleansing, Healing Stream), Lightwell, Judgement of Light, Healthstones, bandages, potions, trinkets (Darkmoon Card: Heroism) and Crusader procs are not affected (wiki, Wowhead comments). Not dispellable.
- Telegraph: the aura icon; DBM shows per-healer lockout bars and warns "heal soon" at 55 s.

### Poison Aura
- Name: Poison Aura (29865)
- Type: AoE (melee range) DoT
- Target rule: players and pets within ~5–10 yd of Loatheb (range 5 yd, radius 10 yd).
- Cadence: re-applied continuously (wiki: 12 s between auras).
- Damage: 196 Nature every 6 s for 12 s (Wowhead guide "~200 per 6 s").
- Debuff: Poison, 12 s, dispellable (Poison Cleansing Totem — do not use Cure Poison, it triggers the lockout). Greater Nature Protection Potion absorbs ~2,600.
- Telegraph: none. Melee must step out of 10 yd to bandage.

### Inevitable Doom
- Name: Inevitable Doom (29204)
- Type: AoE (room) delayed damage
- Target rule: all players within 100 yd (the whole room), ignores LoS.
- Cast time: instant.
- Cadence: first cast at 2:00 (wiki, Wowhead, WT), then every ~30 s (DBM: alternating 29.1 s and 32.4 s), and from the 7th Doom (~5:05) every ~10–20 s (DBM: 9.7 s, then alternating 19.4 s / 11.3 s; guides: "every 15 s after 5 minutes").
- Damage: 2,550 Shadow, dealt 10 s after application (periodic damage, one tick at 10 s). Cannot be resisted, dispelled or decursed (wiki); Greater Shadow Protection Potion absorbs it (the wiki's consumable plan relies on this).
- Debuff: Inevitable Doom, 10 s, no dispel type, Aura Unique (does not stack).
- Telegraph: debuff icon with a 10 s countdown on everyone; DBM counts Dooms.

### Remove Curse (self)
- Name: Remove Curse (30281)
- Type: other (self-dispel)
- Target rule: Loatheb himself; removes all curses (up to 32).
- Cadence: every ~30 s, first ~0.5–8 s after the pull (DBM 30.7 s; wiki "every 30 seconds starting ~2 seconds in").
- Effect: Curse of Shadow / Elements / Recklessness / Doom / Agony fall off → warlocks re-apply. Curse of Doom cannot be relied on.
- Telegraph: DBM announce for warlocks.

### Summon Spore → Fungal Bloom
- Name: Summon Spore (29234); Fungal Bloom (29232) on the Spore's death
- Type: summon add / raid buff
- Target rule: one Spore (level 60, 1,400 HP) spawns at a random point up to 60–70 yd away — "on the far side of the room from the raid and Loatheb" (wiki). When killed it buffs up to 5 players within 10 yd.
- Cadence: first Spore 11.3 s after the pull, then every 12.9 s (DBM; wiki 12 s / WT 13 s).
- Buff: Fungal Bloom — 90 s, +50% melee/ranged crit, +60% spell crit, spells and abilities cause no threat. Max 5 targets.
- Telegraph: a Spore appears; DBM count.

## Adds
- Spore (16286): level 60, 1,400 HP, negligible melee (86–110), wanders slowly; one every ~13 s on the far side of the room; killed by an assigned group of 5 who stand within 10 yd to receive Fungal Bloom. Rotate groups so ≈ every DPS keeps the 90 s buff (7 spores per 90 s → up to 35 buffed players). They die only when killed (90 s summon duration on the spell).

## Positioning and movement
- Tank: pick Loatheb up at the pull and hold him in place near the entrance side; generate maximum threat early — everyone else will soon have Fungal Bloom (zero threat), so threat is trivial after the first minute. Stay in Poison Aura; one heal per healer per minute goes mostly to you. Use Shield Block/Last Stand/Lifegiving Gem, Healthstone, Major Healing Potion, Greater Shadow Protection Potion on your own schedule. Never: move him toward the spore side; drop threat with a taunt rotation (unnecessary).
- Melee DPS: behind the boss; step > 10 yd out of Poison Aura to bandage; move out in groups of 5 to kill the spore when it is your group's turn, then return.
- Ranged DPS: spread across the room between the boss and the spore spawn side; spore group rotation; warlocks re-curse after each Remove Curse.
- Healers: rotate who heals the MT: with N healers, one heal every 60/N seconds lands on him; cast the biggest heal available (Greater Heal rank max / Healing Touch) and nothing else; otherwise wand/Smite/Moonfire. Shamans: Poison Cleansing Totem (not Cure Poison), Healing Stream Totem. Paladins: Judgement of Light on the boss (wiki).
- Whole raid: everyone is responsible for their own HP: GSPP pre-pull, second GSPP at ~2:10–2:40 (2 min potion CD), bandage at ~3:10 and 5:10, Healthstone/Whipper Root at ~3:40, GSPP + bandage at ~4:10 (wiki schedule). Spores spawn on the far side — groups run to them and back.

## What each role must do and must not do
- Tank:
  1. Build a threat lead in the first 30 s; afterwards nobody with Fungal Bloom generates threat.
  2. Manage your own survival: pre-planned Healthstone, potions, Lifegiving Gem; call for your assigned heal if below ~50%.
  3. Do not step out of the boss (Poison Aura is minor); do not use Fear Ward/anything irrelevant — nothing to interrupt.
- DPS:
  1. Rotate spore groups of 5 every ~13 s; keep Fungal Bloom (crit buff) up; return immediately.
  2. Pop everything — threat is irrelevant with Fungal Bloom.
  3. Warlocks: re-apply curses every 30 s after Remove Curse.
  4. Self-heal on the consumable schedule; melee leave the aura to bandage; nature potion at the pull.
  5. Nothing to interrupt or dispel on the boss.
- Healer:
  1. One heal per 60 s: a fixed MT heal rotation (e.g. 8 healers → one max heal every 7.5 s on the tank).
  2. Never cast a cleanse/HoT/shield "by reflex" — any curing or healing spell burns your 60 s; Shamans use totems instead of Cure Poison.
  3. DPS (Smite/Wrath/Lightning Bolt/wand) between heals; carry mana potions.
  4. Watch Inevitable Doom timers (2:00, then every ~30 s, then every ~15 s): pre-pot GSPP before 2:00 and again around 4:10; the raid cannot be healed through Dooms after ~5:15.

## Timeline of a typical pull
- t=-2:00: Greater Shadow Protection Potion (and Greater Nature Protection for melee) so the potion cooldown is back by the pull.
- t=0: Pull; Corrupted Mind on everyone; Remove Curse ~0.5–8 s then every 30.7 s.
- t≈11 s: Spore #1 (then every 12.9 s: 24, 37, 50, 63 …); groups rotate for Fungal Bloom.
- t=2:00: Inevitable Doom #1 (2,550 Shadow at 2:10); then #2 at ~2:29, #3 ~3:02, #4 ~3:31, #5 ~4:03, #6 ~4:32, #7 ~5:05 (DBM alternation 29.1/32.4 s).
- t≈5:05 onward: Doom #8 at ~5:15, then every 19.4 / 11.3 s (≈5:34, 5:45, 6:05 …). Wiki: the 5:15 Doom finishes off low players, surviving the 5:40 Doom is unlikely.
- Kill target: before ~5:15 (5.2M HP in 315 s ≈ 16.5k raid DPS, achievable with Fungal Bloom).

## Open questions
- Spore cadence: 12.9 s (DBM) vs 12 s (wiki ability section) vs 13 s (wiki strategy, WT).
- Doom cadence after 5:00: DBM 9.7 then alternating 19.4/11.3 s (avg ~15 s) vs guides "every 15 s".
- Corrupted Mind refresh: DBM comment "2-min debuff refreshed every 11 s"; spell page 2 min duration; wiki just "1-minute linked cooldown".
- Poison Aura radius: 5 yd (wiki, spell range) vs 10 yd (spell effect radius).
- Boss HP: 5,200,000 (classicdb.ch); wiki lists none; 5% Devour-type healing does not exist here.
- Shadow resistance: recommended on the Naxxramas overview wiki page; not quantified anywhere for Loatheb.
- Whether Paladin Divine Favor triggers the lockout: asked in Wowhead comments (2026), unanswered.
