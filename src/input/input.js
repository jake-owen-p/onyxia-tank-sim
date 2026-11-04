// Per-frame input polling. Turns held keys and right-mouse drag into the
// command object the core consumes, and queues one-shot presses (abilities,
// view toggle, pause) between polls.

import { ABILITY_ACTIONS, ONESHOT_ACTIONS } from './keybinds.js';

/**
 * @param {HTMLElement} element  the canvas; receives mouse events
 * @param {object} keybinds      from createKeybinds
 * @param {object} settings      shared settings (mouseSensitivity)
 */
export function createInput(element, keybinds, settings) {
  const held = new Set();          // key codes currently down
  const pressedAbilities = [];     // ability ids pressed since last poll
  const oneShots = new Set();      // UI actions pressed since last consume
  let mouseTurn = 0;               // radians accumulated from right-drag
  let wheel = 0;
  let enabled = true;
  let rightDown = false;
  let lastX = 0;
  let capture = null;              // callback used by the settings screen to capture a key

  const isTyping = () => {
    const el = typeof document !== 'undefined' ? document.activeElement : null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  };

  function onKeyDown(e) {
    if (capture) { e.preventDefault(); const cb = capture; capture = null; cb(e.code); return; }
    if (isTyping()) return;
    const actions = keybinds.actionsFor(e.code);
    if (e.code === 'Tab' || actions.length) e.preventDefault();
    if (!enabled) { if (actions.includes('pause')) oneShots.add('pause'); return; }
    if (e.repeat) return;
    held.add(e.code);
    for (const a of actions) {
      if (ABILITY_ACTIONS.includes(a)) pressedAbilities.push(a);
      else if (ONESHOT_ACTIONS.includes(a)) oneShots.add(a);
    }
    // Developer/phase-skip keys are not rebindable.
    if (e.code === 'F1' || e.code === 'F2' || e.code === 'F3') { e.preventDefault(); oneShots.add('phase' + e.code.slice(1)); }
  }
  function onKeyUp(e) { held.delete(e.code); }
  function onBlur() { held.clear(); rightDown = false; }

  function onMouseDown(e) {
    if (e.button === 2) { rightDown = true; lastX = e.clientX; e.preventDefault(); }
    if (e.button >= 3) {
      const code = 'Mouse' + (e.button + 1);
      if (capture) { e.preventDefault(); const cb = capture; capture = null; cb(code); return; }
      for (const a of keybinds.actionsFor(code)) {
        if (ABILITY_ACTIONS.includes(a)) pressedAbilities.push(a);
        else if (ONESHOT_ACTIONS.includes(a)) oneShots.add(a);
      }
    }
  }
  function onMouseUp(e) { if (e.button === 2) rightDown = false; }
  function onMouseMove(e) {
    if (!rightDown || !enabled) return;
    const dx = e.movementX ?? (e.clientX - lastX);
    lastX = e.clientX;
    // Dragging right turns right (heading decreases), like WoW.
    mouseTurn -= dx * (settings.mouseSensitivity ?? 0.0025);
  }
  function onWheel(e) { if (!enabled) return; e.preventDefault(); wheel += e.deltaY; }
  function onContext(e) { e.preventDefault(); }

  const hasDom = typeof window !== 'undefined' && element;
  if (hasDom) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    element.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('contextmenu', onContext);
  }

  const down = (action) => keybinds.get(action).some((c) => c && held.has(c));

  return {
    /** Build the command for this frame. Abilities are those pressed since the last poll. */
    poll() {
      const cmd = { forward: 0, strafe: 0, turn: 0, mouseTurn: 0, abilities: [] };
      if (!enabled) { pressedAbilities.length = 0; mouseTurn = 0; return cmd; }
      if (down('forward')) cmd.forward += 1;
      if (down('back')) cmd.forward -= 1;
      if (down('turnLeft')) cmd.turn += 1;
      if (down('turnRight')) cmd.turn -= 1;
      if (down('strafeLeft')) cmd.strafe -= 1;
      if (down('strafeRight')) cmd.strafe += 1;
      cmd.mouseTurn = mouseTurn; mouseTurn = 0;
      cmd.abilities = pressedAbilities.splice(0, pressedAbilities.length);
      return cmd;
    },
    /** One-shot UI action pressed since last consume? */
    consume(action) { const had = oneShots.has(action); oneShots.delete(action); return had; },
    wheel() { const w = wheel; wheel = 0; return w; },
    isRightDown() { return rightDown; },
    setEnabled(v) { enabled = !!v; if (!v) { held.clear(); pressedAbilities.length = 0; mouseTurn = 0; } },
    /** Capture the next key/mouse code for rebinding; resolves via callback. */
    captureNext(cb) { capture = cb; },
    cancelCapture() { capture = null; },
    destroy() {
      if (!hasDom) return;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      element.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('contextmenu', onContext);
    },
  };
}
