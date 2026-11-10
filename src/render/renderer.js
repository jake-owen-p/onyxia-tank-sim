// Renderer facade: owns the canvas, device pixel ratio, the chase camera and
// the active view, and composes world view + minimap + HUD each frame.
// Contract: see docs/CONTRACTS.md "Renderer".

import { createCamera, updateChaseCamera, ZOOM_MIN, ZOOM_MAX } from './projection.js';
import { getPalette } from './palette.js';
import { drawTopDown } from './topdown.js';
import { drawPOV } from './pov.js';
import { drawHUD } from './hud.js';
import { drawMinimap } from './minimap.js';
import { threatRatio } from '../core/threat.js';
import { clamp } from '../core/geometry.js';
import { acquireWorld } from './gl/world.js';
import { drawWorldOverlay } from './gl/overlay.js';
import { createActionControls } from '../ui/action-controls.js';

const FADE_SECONDS = 0.25;

export function createRenderer(canvas, script, { onAbility } = {}) {
  const ctx = canvas.getContext('2d');
  const cam = createCamera();
  const world = acquireWorld();          // null without WebGL2: the 2D views below take over
  const controls = createActionControls(canvas, script, onAbility);
  const threatCfg = { pullMultiplier: script.threat.pullMultiplier };
  let ratioRole = true;
  const ratioFn = (threat) => threatRatio(threat, threatCfg, ratioRole);

  let view = 'pov';
  let dpr = 1;
  let width = 0, height = 0;          // CSS pixels
  let fade = null;                     // { from, start } during a view switch
  let lastSettingsView = null;         // settings.view as last seen; only a change switches the view
  let explicitView = false;            // setView() was called by the host before the first frame

  function resize() {
    const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { width: canvas.width, height: canvas.height };
    const cw = Math.max(1, Math.round(rect.width || canvas.clientWidth || canvas.width || 1));
    const ch = Math.max(1, Math.round(rect.height || canvas.clientHeight || canvas.height || 1));
    const g = typeof globalThis !== 'undefined' ? globalThis : {};
    dpr = Math.min(2, Math.max(1, g.devicePixelRatio || 1));
    width = cw; height = ch;
    const pw = Math.round(cw * dpr), ph = Math.round(ch * dpr);
    if (canvas.width !== pw) canvas.width = pw;
    if (canvas.height !== ph) canvas.height = ph;
  }

  function setView(v, now) {
    explicitView = true;
    if (v === view) return;
    fade = { from: view, start: now ?? (typeof performance !== 'undefined' ? performance.now() / 1000 : 0) };
    view = v;
  }

  function zoom(delta) {
    // wheel delta: positive = zoom out
    cam.distance = clamp(cam.distance + delta * 0.01, ZOOM_MIN, ZOOM_MAX);
  }

  function drawWorld3D(which, v, settings, pal, now, dtReal, overlay) {
    ctx.clearRect(0, 0, width, height);
    const mode = overlay.idle ? 'hero' : which === 'topdown' ? 'map' : 'pov';
    let heroInset = 0;
    if (mode === 'hero' && typeof document !== 'undefined') { const el = document.querySelector('[data-hero-inset]'); if (el) heroInset = el.getBoundingClientRect().right; }
    const used = world.draw({ view: v, script, settings, pal, cam, w: width, h: height, dpr, now, dtReal, mode, heroInset });
    if (mode !== 'hero') drawWorldOverlay(ctx, v, script, settings, pal, used, width, height, now, mode, world.bossTop(v), world.bossStaysVisible());
    if (mode === 'pov' && settings.minimap !== false) drawMinimap(ctx, v, script, settings, pal, width, height, now);
  }

  function drawWorld(which, v, settings, pal, now, dtReal) {
    if (which === 'topdown') drawTopDown(ctx, v, script, settings, pal, width, height, now);
    else {
      drawPOV(ctx, v, script, settings, pal, cam, width, height, now);
      if (settings.minimap !== false) drawMinimap(ctx, v, script, settings, pal, width, height, now);
    }
  }

  /**
   * Draw one frame.
   * @param {object} args { view, settings, now (seconds), dtReal, abilityKeys, overlay }
   */
  function frame({ view: v, settings, now, dtReal = 1 / 60, abilityKeys = {}, overlay = {} }) {
    if (!width || !height) resize();
    const pal = getPalette(settings);
    // settings.view switches the view only when it changes; explicit setView()
    // calls (e.g. a top-down menu backdrop) otherwise stick.
    const sv = settings && settings.view ? settings.view : null;
    if (sv && lastSettingsView === null) {
      // First frame: adopt settings.view silently unless the host already chose a view.
      if (!explicitView) view = sv;
      lastSettingsView = sv;
    } else if (sv && sv !== lastSettingsView) {
      setView(sv, now);
      lastSettingsView = sv;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save();
    // Camera follows the player in both views so switching to POV is seamless.
    updateChaseCamera(cam, v.world.player, { distance: cam.distance, dtReal });

    if (world) {
      fade = null;
      drawWorld3D(view, v, settings, pal, now, dtReal, overlay);
    } else if (fade) {
      const k = (now - fade.start) / FADE_SECONDS;
      if (k >= 1) fade = null;
      else {
        // Cross-fade: old view underneath, new view on top with rising alpha.
        drawWorld(fade.from, v, settings, pal, now, dtReal);
        ctx.globalAlpha = clamp(k, 0, 1);
        drawWorld(view, v, settings, pal, now, dtReal);
        ctx.globalAlpha = 1;
      }
    }
    if (!world && !fade) drawWorld(view, v, settings, pal, now, dtReal);

    ratioRole = v.tankRole !== false;
    if (!overlay.idle) drawHUD(ctx, v, script, { ...settings, view }, pal, width, height, now, abilityKeys, overlay, ratioFn);
    if (overlay.dim && !(world && overlay.idle)) {
      ctx.fillStyle = pal.pause;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
    controls?.update(v, width, height, abilityKeys, overlay);
  }

  function destroy() { fade = null; controls?.destroy(); }

  return {
    resize, setView, getView: () => view, zoom, frame, destroy, camera: cam,
    get width() { return width; }, get height() { return height; },
  };
}
