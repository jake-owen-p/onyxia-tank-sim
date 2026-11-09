# Original interface artwork

All icon, portrait fallback, elite dragon, gryphon, socket and frame artwork is original procedural drawing in `src/render/ui/art.js`. The leather and parchment SVG tiles in this directory are original vector textures. No Blizzard image assets or fonts are distributed.

`src/render/portraits.js` is the integration seam for rendered encounter portraits. Both DOM journal portraits and the target frame consume it, with an original heraldic illustration while it returns null.

Fonts are vendored without modification from Google Fonts and distributed under SIL OFL 1.1; each font has its own adjacent license:
- Marcellus: https://github.com/google/fonts/tree/main/ofl/marcellus
- Noto Sans: https://github.com/google/fonts/tree/main/ofl/notosans

The blue player strip shows ability recovery (GCD); the simulation has no mana resource. Raid roster tiles show melee/ranged membership, not fabricated individual health. The main tank frame uses actual HP.

## Integration

- No core, encounter data, input, app/session, or 3D world modules changed. `index.html` only gains local font preloads. No build step or runtime dependency was added.
- Keep `drawHUD(ctx, view, script, settings, pal, w, h, now, abilityKeys, overlay, threatRatioFn)` and the existing minimap exports. `overlay.idle` returns before drawing or touching the view.
- For a separate transparent HUD canvas, clear it with `clearRect` before each frame, then draw the minimap in POV (when enabled) and `drawHUD`. The HUD never paints an opaque full-canvas background. Edge feedback uses an alpha gradient.
- Replace only the `getBossPortrait(raidId, bossId, size)` implementation with the rendered portrait provider. Return a ready, cached `CanvasImageSource` or `null`. HUD calls use `script.raidInfo.id` and `script.id`; journal calls use index/current IDs. DOM portraits retry at 200 ms, 750 ms and 2 s for a newly prepared source.
- Static chrome is cached in a bounded, device-resolution canvas cache. The validator uses the direct-drawing fallback when there is no DOM.
- Combat-log state is presentation-only and keyed to the canvas context. It resets on encounter/role/replay changes, a backwards seek or a forward seek over 0.5 s. Repeated health changes coalesce; no simulation state is mutated.
- The twelve sockets reflow to two rows of six below 680 px. Existing keyboard and pointer game controls are unchanged.

## Verification

The screenshot worker was used for desktop (1440×900), compact desktop (1024×640), and phone (390×844) checks. Reviewed tank and healer HUDs in POV and map, casts, warnings, cooldown/error states, active notes, low tank health, dispel borders, the encounter journal, pause, settings including keybinds/audio, tutorial, history, scorecard and replay. Additional combined-state fixtures checked simultaneous notes, fear, HOLD and low health.

Required checks: `node --test tests/*.test.js` (95 passing) and `node tools/validate.mjs` (all encounters valid). A temporary cue check also verified exact timing labels, cooldowns, low-tank prompts, error text, view immutability, idle no-op, and no full-canvas opaque fill.

Warmed HUD-only draw timing in the browser worker at 1440×900, 120 samples: mean approximately 0.19 ms, p95 approximately 0.30 ms. This is CPU submission timing for the HUD, not a performance guarantee for the integrated 3D renderer.
