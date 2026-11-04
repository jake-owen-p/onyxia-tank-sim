// Main menu: Full fight / Tutorial hero cards, drill list, role switch,
// Settings / History. Also the History screen and the Pause menu.

import { h, button, arrowNav } from './overlay.js';

const HINTS = [['WASD', 'move'], ['Q / E', 'strafe'], ['Right-drag', 'turn'], ['1–5', 'abilities'], ['Tab', 'view'], ['Esc', 'menu']];

function hintBar(hints) {
  return h('footer', { class: 'hint-bar' },
    ...hints.map(([k, l]) => h('span', { class: 'hint' }, h('kbd', { text: k }), ' ', l)));
}

/** Best score chip for a mode key: "Best 83" with the grade letter when known. */
function bestChip(history, key) {
  const best = history && history.best && history.best[key];
  if (best == null) return null;
  const run = (history.runs || []).filter((r) => r.modeKey === key).sort((a, b) => b.overall - a.overall)[0];
  return h('span', { class: 'best-chip' },
    h('span', { class: 'best-label', text: 'Best' }),
    h('span', { class: 'best-num', text: `${best}` }),
    run ? h('span', { class: 'grade grade-' + run.grade, text: run.grade }) : null,
  );
}

/** Two-option segmented control for the tank role. */
function roleSwitch(settings, onChange) {
  const opts = [['mt', 'Main tank'], ['offtank', 'Off-tank']];
  const btns = opts.map(([v, l]) => button(l, () => { settings.role = v; sync(); onChange(); }, { class: 'seg-btn', title: v === 'mt' ? 'Tank Onyxia' : 'Pick up the whelps' }));
  function sync() { btns.forEach((b, i) => { b.classList.toggle('on', opts[i][0] === settings.role); b.setAttribute('aria-pressed', opts[i][0] === settings.role); }); }
  sync();
  return h('div', { class: 'seg', role: 'group', 'aria-label': 'Role' }, ...btns);
}

const phaseTag = (d) => d.startOffset < 0 ? `P${d.startPhase}→${d.startPhase + 1}` : `P${d.startPhase}`;

/**
 * @param {object} p { script, settings, history, actions:{ tutorial(), drill(id), full(), settings(), history(), settingsChanged() } }
 */
export function menuScreen({ script, settings, history, actions }) {
  const drills = (script.drills || []).map((d) =>
    h('li', {},
      button(h('span', { class: 'drill' },
        h('span', { class: 'drill-tag', text: phaseTag(d) }),
        h('span', { class: 'drill-body' },
          h('span', { class: 'drill-head' },
            h('span', { class: 'drill-title', text: d.name }),
            h('span', { class: 'drill-meta', text: `${d.duration} s${d.loop ? ' · loops' : ''}` }),
          ),
          h('span', { class: 'drill-desc', text: d.description }),
        ),
        bestChip(history, `drill:${d.id}`) || h('span', { class: 'best-chip empty', text: 'Not run' }),
        h('span', { class: 'chev', 'aria-hidden': true, text: '›' }),
      ), () => actions.drill(d.id), { class: 'btn-drill' }),
    ));

  const el = h('div', { class: 'panel panel-menu' },
    h('header', { class: 'menu-top' },
      h('div', { class: 'brand' },
        h('div', { class: 'brand-kicker', text: 'Tank rehearsal' }),
        h('h1', { class: 'brand-title', text: script.name }),
        h('p', { class: 'brand-sub', text: `${script.arena.name} · script v${script.version}` }),
      ),
      h('div', { class: 'menu-tools' },
        roleSwitch(settings, () => actions.settingsChanged && actions.settingsChanged()),
        button('Settings', actions.settings, { class: 'btn-ghost' }),
        button('History', actions.history, { class: 'btn-ghost' }),
      ),
    ),
    h('div', { class: 'hero' },
      button(h('span', { class: 'card-inner' },
        h('span', { class: 'card-kicker', text: 'Play' }),
        h('span', { class: 'card-title', text: 'Full fight' }),
        h('span', { class: 'card-sub', text: 'All three phases, start to finish' }),
        bestChip(history, 'full') || h('span', { class: 'best-chip empty', text: 'No run yet' }),
      ), actions.full, { class: 'card card-primary', autofocus: true }),
      button(h('span', { class: 'card-inner' },
        h('span', { class: 'card-kicker', text: 'Learn' }),
        h('span', { class: 'card-title', text: 'Tutorial' }),
        h('span', { class: 'card-sub', text: 'Five minutes, one mechanic at a time' }),
        h('span', { class: 'best-chip empty', text: `${script.tutorial.steps.length} steps` }),
      ), actions.tutorial, { class: 'card' }),
    ),
    h('section', { class: 'drills' },
      h('div', { class: 'section-row' },
        h('h3', { class: 'section-label', text: 'Drills' }),
        h('span', { class: 'section-note', text: 'Short loops of one mechanic' }),
      ),
      h('ul', { class: 'drill-list' }, ...drills),
    ),
    hintBar(HINTS),
  );
  return arrowNav(el);
}

/** History screen: list of runs, best scores, clear. */
export function historyScreen({ history, onBack, onClear }) {
  const runs = history.runs || [];
  const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const rows = runs.map((r) => h('tr', {},
    h('td', { class: 'td-when', text: fmtDate(r.date) }),
    h('td', {}, h('div', { class: 'td-name', text: r.name }), h('div', { class: 'muted', text: r.role === 'offtank' ? 'Off-tank' : 'Main tank' })),
    h('td', { class: 'td-grade' }, h('span', { class: 'grade grade-' + r.grade, text: r.grade }), h('span', { class: 'td-score', text: `${r.overall}` })),
    h('td', { class: 'td-fixes' }, ...(r.fixes || []).slice(0, 2).map((f) => h('span', { class: 'fix-chip', text: f }))),
  ));
  const stats = [
    ['Runs', `${runs.length}`],
    ['Best full fight', history.best && history.best.full != null ? `${history.best.full}` : '–'],
    ['Last played', runs.length ? fmtDate(runs[0].date) : '–'],
  ];
  const el = h('div', { class: 'panel panel-wide panel-history' },
    h('header', { class: 'panel-head' },
      h('div', {}, h('div', { class: 'kicker', text: 'Your runs' }), h('h2', { text: 'History' })),
      button('Back', onBack, { primary: true, autofocus: true, title: 'Esc' }),
    ),
    h('div', { class: 'stat-row' }, ...stats.map(([l, v]) => h('div', { class: 'stat' }, h('div', { class: 'stat-val', text: v }), h('div', { class: 'stat-label', text: l })))),
    runs.length
      ? h('div', { class: 'table-wrap' },
        h('table', { class: 'table' },
          h('thead', {}, h('tr', {}, h('th', { text: 'When' }), h('th', { text: 'Mode' }), h('th', { text: 'Grade' }), h('th', { text: 'Top fixes' }))),
          h('tbody', {}, ...rows),
        ))
      : h('div', { class: 'empty-state' },
        h('div', { class: 'empty-title', text: 'No runs yet' }),
        h('p', { class: 'muted', text: 'Finish a drill or the full fight and it will show up here with its grade and top fixes.' })),
    runs.length ? h('div', { class: 'actions end' },
      button('Clear history', () => { if (confirm('Clear all saved runs and best scores?')) onClear(); }, { class: 'btn-danger' }),
    ) : null,
  );
  return arrowNav(el);
}

/** Pause menu. */
export function pauseScreen({ settings, onResume, onRestart, onSettings, onQuit, onSpeed }) {
  const speed = h('input', { type: 'range', min: 0.25, max: 1, step: 0.05, value: settings.speed, class: 'slider', 'aria-label': 'Speed' });
  const speedVal = h('span', { class: 'val', text: pct(settings.speed) });
  speed.addEventListener('input', () => { settings.speed = parseFloat(speed.value); speedVal.textContent = pct(settings.speed); if (onSpeed) onSpeed(settings.speed); });
  const el = h('div', { class: 'panel panel-pause' },
    h('div', { class: 'kicker', text: 'Run paused' }),
    h('h2', { text: 'Paused' }),
    h('div', { class: 'actions stack' },
      button('Resume', onResume, { primary: true, autofocus: true, title: 'Esc' }),
      button('Restart', onRestart),
      button('Settings', onSettings),
      button('Quit to menu', onQuit, { class: 'btn-ghost' }),
    ),
    h('div', { class: 'field field-pause' }, h('label', { text: 'Sim speed' }), speed, speedVal),
    hintBar([['Tab', 'view'], ['F1–F3', 'skip phase'], ['Esc', 'resume']]),
  );
  return arrowNav(el);
}

export const pct = (v) => `${Math.round(v * 100)}%`;
