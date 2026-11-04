// Keybind manager: WoW defaults, rebinding, conflict detection and labels.
// Codes are KeyboardEvent.code values ('KeyW', 'Digit1', 'Tab'). Mouse buttons
// are 'Mouse3'..'Mouse5'. Pure data in, pure data out; no DOM here.

export const ACTIONS = [
  { id: 'forward',     label: 'Move forward',  group: 'Movement' },
  { id: 'back',        label: 'Move back',     group: 'Movement' },
  { id: 'turnLeft',    label: 'Turn left',     group: 'Movement' },
  { id: 'turnRight',   label: 'Turn right',    group: 'Movement' },
  { id: 'strafeLeft',  label: 'Strafe left',   group: 'Movement' },
  { id: 'strafeRight', label: 'Strafe right',  group: 'Movement' },
  { id: 'jump',        label: 'Jump',          group: 'Movement' },
  { id: 'taunt',       label: 'Taunt',         group: 'Abilities' },
  { id: 'toggleView',  label: 'Switch view',   group: 'Interface' },
  { id: 'pause',       label: 'Pause / menu',  group: 'Interface' },
];

export const ABILITY_ACTIONS = ['taunt'];
export const MOVE_ONESHOT_ACTIONS = ['jump'];
export const ONESHOT_ACTIONS = ['toggleView', 'pause'];

export const DEFAULT_BINDS = {
  forward:     ['KeyW', 'ArrowUp'],
  back:        ['KeyS', 'ArrowDown'],
  turnLeft:    ['KeyA', 'ArrowLeft'],
  turnRight:   ['KeyD', 'ArrowRight'],
  strafeLeft:  ['KeyQ', null],
  strafeRight: ['KeyE', null],
  jump:        ['Space', null],
  taunt:       ['Digit1', null],
  toggleView:  ['Tab', null],
  pause:       ['Escape', null],
};

const SPECIAL_LABELS = {
  Tab: 'Tab', Escape: 'Esc', Space: 'Space', Enter: 'Enter', Backspace: 'Bksp',
  ShiftLeft: 'L Shift', ShiftRight: 'R Shift', ControlLeft: 'L Ctrl', ControlRight: 'R Ctrl',
  AltLeft: 'L Alt', AltRight: 'R Alt', MetaLeft: 'Cmd', MetaRight: 'R Cmd',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
  Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Semicolon: ';', Quote: "'",
  Comma: ',', Period: '.', Slash: '/', Backslash: '\\', Backquote: '`', CapsLock: 'Caps',
  Home: 'Home', End: 'End', PageUp: 'PgUp', PageDown: 'PgDn', Insert: 'Ins', Delete: 'Del',
};

/** Human label for a key code: 'KeyW' -> 'W', 'Digit1' -> '1', 'Numpad5' -> 'Num 5', 'F3' -> 'F3'. */
export function label(code) {
  if (!code) return '—';
  if (SPECIAL_LABELS[code]) return SPECIAL_LABELS[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  if (code.startsWith('Mouse')) return 'Mouse ' + code.slice(5);
  return code;
}

/** Sanitise a stored binds object against the defaults (unknown actions dropped, missing filled). */
function normalise(stored) {
  const out = {};
  for (const a of ACTIONS) {
    const def = DEFAULT_BINDS[a.id];
    const s = stored && Array.isArray(stored[a.id]) ? stored[a.id] : def;
    out[a.id] = [s[0] ?? null, s[1] ?? null];
  }
  return out;
}

/**
 * Create the keybind manager.
 * @param {object|null} stored previously saved binds (may be null)
 */
export function createKeybinds(stored = null) {
  const binds = normalise(stored);
  const listeners = new Set();
  const codeIndex = new Map(); // code -> action[]

  function rebuildIndex() {
    codeIndex.clear();
    for (const id in binds) {
      for (const code of binds[id]) {
        if (!code) continue;
        if (!codeIndex.has(code)) codeIndex.set(code, []);
        codeIndex.get(code).push(id);
      }
    }
  }
  rebuildIndex();

  const notify = () => { for (const fn of listeners) fn(binds); };

  return {
    binds,
    /** Codes bound to an action: [primary, secondary]. */
    get(action) { return binds[action] || [null, null]; },
    /** Actions bound to a code. */
    actionsFor(code) { return codeIndex.get(code) || []; },
    /** Bind slot `index` (0 primary, 1 secondary) of `action` to `code` (null clears). */
    set(action, index, code) {
      if (!binds[action]) return;
      binds[action][index] = code || null;
      rebuildIndex();
      notify();
    },
    reset() {
      for (const id in DEFAULT_BINDS) binds[id] = [...DEFAULT_BINDS[id]];
      rebuildIndex();
      notify();
    },
    /** Codes bound to more than one action: [{ code, actions }]. */
    conflicts() {
      const out = [];
      for (const [code, actions] of codeIndex) if (actions.length > 1) out.push({ code, actions: [...actions] });
      return out;
    },
    label,
    /** Short label of the primary key for an action (for HUD icons). */
    keyLabel(action) { return label((binds[action] || [])[0]); },
    /** Map of ability id -> key label for the HUD. */
    abilityKeys() {
      const m = {};
      for (const id of ABILITY_ACTIONS) m[id] = label(binds[id][0]);
      return m;
    },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    /** Plain object for persistence. */
    toJSON() { return JSON.parse(JSON.stringify(binds)); },
  };
}
