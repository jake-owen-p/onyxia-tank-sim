// Settings screen: gameplay, display, audio (per-cue volumes with preview),
// keybinds with rebinding and conflict warnings, and resets.

import { h, button, arrowNav } from './overlay.js';
import { ACTIONS } from '../input/keybinds.js';
import { CUE_IDS, CUE_LABELS } from '../audio/cues.js';
import { pct } from './menu.js';

/**
 * @param {object} p { settings, keybinds, input, audio, script, onBack, onChange, onResetHistory, onResetAll }
 */
export function settingsScreen({ settings, keybinds, input, audio, script, onBack, onChange = () => {}, onResetHistory, onResetAll }) {
  const changed = () => onChange(settings);

  // ---- generic controls
  const slider = (key, label, min, max, step, fmt = pct, obj = settings) => {
    const inp = h('input', { type: 'range', min, max, step, value: obj[key], class: 'slider', 'aria-label': label });
    const val = h('span', { class: 'val', text: fmt(obj[key]) });
    inp.addEventListener('input', () => { obj[key] = parseFloat(inp.value); val.textContent = fmt(obj[key]); changed(); });
    return h('div', { class: 'field' }, h('label', { text: label }), inp, val);
  };
  const toggle = (key, label, obj = settings) => {
    const inp = h('input', { type: 'checkbox', class: 'switch', checked: !!obj[key], 'aria-label': label });
    inp.addEventListener('change', () => { obj[key] = inp.checked; changed(); });
    return h('div', { class: 'field' }, h('label', { text: label }), inp);
  };
  const select = (key, label, options) => {
    const sel = h('select', { 'aria-label': label }, ...options.map(([v, l]) => h('option', { value: v, text: l, selected: settings[key] === v })));
    sel.addEventListener('change', () => { settings[key] = sel.value; changed(); });
    return h('div', { class: 'field' }, h('label', { text: label }), sel);
  };
  const secs = (v) => `${Math.round(v)}s`;

  // ---- phase durations
  const pd = settings.phaseDurations[script.id] || (settings.phaseDurations[script.id] = {});
  const durationFields = script.phases.map((p) => {
    const inp = h('input', { type: 'number', min: 20, max: 600, step: 5, value: pd[p.id] ?? p.duration, 'aria-label': p.name });
    inp.addEventListener('change', () => { pd[p.id] = Math.max(20, Math.min(600, parseInt(inp.value, 10) || p.duration)); changed(); });
    return h('div', { class: 'field' }, h('label', { text: `${p.name} · ${p.subtitle}` }), inp, h('span', { class: 'val muted', text: `default ${p.duration}s` }));
  });

  // ---- cue volumes
  const cueRows = CUE_IDS.map((id) => {
    if (settings.cueVolumes[id] == null) settings.cueVolumes[id] = 1;
    const inp = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: settings.cueVolumes[id], class: 'slider', 'aria-label': CUE_LABELS[id] });
    const val = h('span', { class: 'val', text: pct(settings.cueVolumes[id]) });
    inp.addEventListener('input', () => { settings.cueVolumes[id] = parseFloat(inp.value); val.textContent = pct(settings.cueVolumes[id]); changed(); });
    return h('div', { class: 'field' }, h('label', { text: CUE_LABELS[id] }), inp, val, button('▶', () => { audio.unlock(); audio.play(id); }, { class: 'btn-icon', title: 'Preview' }));
  });

  // ---- keybinds
  const conflictBox = h('div', { class: 'conflicts' });
  const bindTable = h('div', { class: 'bind-table' });
  function renderBinds() {
    bindTable.textContent = '';
    const conflicts = keybinds.conflicts();
    const conflictCodes = new Set(conflicts.map((c) => c.code));
    let group = null;
    for (const a of ACTIONS) {
      if (a.group !== group) { group = a.group; bindTable.appendChild(h('div', { class: 'bind-group', text: group })); }
      const codes = keybinds.get(a.id);
      const cells = [0, 1].map((i) => {
        const b = button(keybinds.label(codes[i]), () => capture(a.id, i, b), { class: 'btn-key' + (codes[i] && conflictCodes.has(codes[i]) ? ' conflict' : '') });
        b.addEventListener('contextmenu', (e) => { e.preventDefault(); keybinds.set(a.id, i, null); renderBinds(); });
        b.title = 'Click then press a key. Right-click to clear.';
        return b;
      });
      bindTable.appendChild(h('div', { class: 'bind-row' }, h('span', { class: 'bind-label', text: a.label }), ...cells));
    }
    conflictBox.textContent = '';
    for (const c of conflicts) {
      conflictBox.appendChild(h('div', { class: 'conflict-msg', text: `${keybinds.label(c.code)} is bound to ${c.actions.map((id) => ACTIONS.find((x) => x.id === id).label).join(' and ')}` }));
    }
  }
  function capture(action, slot, btn) {
    btn.textContent = 'Press a key…';
    btn.classList.add('capturing');
    input.captureNext((code) => {
      if (code !== 'Escape') keybinds.set(action, slot, code);
      renderBinds();
    });
  }
  renderBinds();

  const mouseSens = slider('mouseSensitivity', 'Mouse turn sensitivity', 0.001, 0.006, 0.0005, (v) => (v * 1000).toFixed(1));

  const back = () => { input.cancelCapture(); onBack(); };
  const el = h('div', { class: 'panel panel-wide panel-settings' },
    h('header', { class: 'panel-head sticky' },
      h('div', {}, h('div', { class: 'kicker', text: 'Options' }), h('h2', { text: 'Settings' })),
      button('Back', back, { primary: true, autofocus: true, title: 'Esc' }),
    ),
    h('div', { class: 'settings-grid' },
      h('section', {},
        h('h3', { text: 'Fight' }),
        h('p', { class: 'section-hint', text: 'Slow the fight down while you learn the mechanics.' }),
        select('role', 'Role', Object.entries(script.roles || { tank: { label: 'Main tank' } }).map(([id, r]) => [id, r.label])),
        slider('speed', 'Speed', 0.25, 1, 0.05),
        slider('warningLead', 'Warn me before casts', 3, 8, 0.5, secs),
        toggle('cueLane', 'Show ability timing bar'),
        slider('laneLead', 'Timing cue lead time', 2, 5, 0.5, (v) => `${v}s`),
        h('h4', { text: 'Phase durations' }),
        h('p', { class: 'section-hint', text: 'Shorten a phase to practice the change to the next one.' }),
        ...durationFields,
      ),
      h('section', {},
        h('h3', { text: 'Display' }),
        select('view', 'Default view', [['pov', 'Over-the-shoulder'], ['topdown', 'Top-down map']]),
        slider('ghostAlpha', 'Ghost tank visibility', 0, 1, 0.05),
        slider('hazardOpacity', 'Ground effect visibility', 0.2, 1, 0.05),
        toggle('colorblind', 'Alternative colours'),
        toggle('minimap', 'Minimap in shoulder view'),
        mouseSens,
      ),
      h('section', {},
        h('h3', { text: 'Audio' }),
        slider('masterVolume', 'Master volume', 0, 1, 0.05),
        toggle('muted', 'Mute everything'),
        toggle('voiceCountdown', 'Voice countdown'),
        h('details', { class: 'cue-details' }, h('summary', { text: 'Volume for each alert' }), ...cueRows),
      ),
      h('section', { class: 'section-binds' },
        h('h3', { text: 'Keybinds' }),
        h('p', { class: 'muted', text: 'Click a binding, then press the key you want to use. Right-click to clear it. Mouse buttons 4 and 5 work too.' }),
        bindTable, conflictBox,
        button('Reset keybinds to WoW defaults', () => { keybinds.reset(); renderBinds(); }, { class: 'btn-ghost' }),
      ),
    ),
    h('div', { class: 'actions end reset-row' },
      h('span', { class: 'muted', text: 'Changes save automatically.' }),
      h('span', { class: 'spacer' }),
      button('Clear run history', () => { if (confirm('Delete your saved runs and best scores? This can’t be undone.')) onResetHistory(); }, { class: 'btn-ghost' }),
      button('Reset everything', () => { if (confirm('Reset settings and keybinds, and delete your runs, best scores and tutorial progress? This also resets your saved account data if you’re signed in.')) onResetAll(); }, { class: 'btn-danger' }),
    ),
  );
  return arrowNav(el);
}
