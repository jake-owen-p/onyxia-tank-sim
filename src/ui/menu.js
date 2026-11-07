// Main menu: raid and boss picker, role switch, Full fight / Tutorial hero
// cards, drill list, Settings / History. Also the History screen and the Pause menu.

import { h, button, arrowNav } from './overlay.js';
import { drillsForRole, tutorialForRole, resolveRole } from '../app/modes.js';

const HINTS = [['WASD', 'move'], ['Q / E', 'strafe'], ['Space', 'jump'], ['Right-drag', 'turn'], ['1–5', 'abilities'], ['Tab', 'view'], ['Esc', 'menu']];

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

/** Segmented control for the roles this encounter offers. */
function roleSwitch(script, settings, onChange) {
  const roles = Object.entries(script.roles || { tank: { label: 'Main tank', short: 'Tank' } });
  const btns = roles.map(([id, r]) => button(r.short || r.label, () => { settings.role = id; sync(); onChange(); }, { class: 'seg-btn', title: r.description || r.label }));
  function sync() { const cur = resolveRole(script, settings.role); btns.forEach((b, i) => { b.classList.toggle('on', roles[i][0] === cur); b.setAttribute('aria-pressed', roles[i][0] === cur); }); }
  sync();
  return h('div', { class: 'seg', role: 'group', 'aria-label': 'Role' }, ...btns);
}

/** Raid tabs and the boss chips of the chosen raid. */
function encounterPicker(index, current, onPick) {
  const raids = (index && index.raids) || [];
  const curRaid = raids.find((r) => r.id === current.raid) || raids[0];
  const tabs = raids.map((r) => {
    const ready = r.bosses.filter((b) => b.status === 'ready').length;
    return button(h('span', { class: 'raid-tab-inner' }, h('span', { class: 'raid-name', text: r.name }), h('span', { class: 'raid-count', text: ready ? `${ready}/${r.bosses.length}` : 'soon' })),
      () => onPick(r.id, (r.bosses.find((b) => b.status === 'ready') || r.bosses[0] || {}).id), { class: 'raid-tab' + (curRaid && r.id === curRaid.id ? ' on' : '') + (ready ? '' : ' empty') });
  });
  const bosses = curRaid ? curRaid.bosses.map((b) => button(b.name, () => onPick(curRaid.id, b.id), { class: 'boss-chip' + (b.id === current.boss ? ' on' : '') + (b.status === 'ready' ? '' : ' draft'), title: b.status === 'ready' ? b.name : `${b.name}: encounter data still being researched` })) : [];
  return h('section', { class: 'picker' },
    h('div', { class: 'raid-tabs' }, ...tabs),
    h('div', { class: 'boss-chips' }, ...(bosses.length ? bosses : [h('span', { class: 'muted', text: 'Encounters for this raid are being researched. Pick another raid for now.' })])),
  );
}

const phaseTag = (d) => d.startOffset < 0 ? `P${d.startPhase}→${d.startPhase + 1}` : `P${d.startPhase}`;

/**
 * @param {object} p { script, index, current:{raid,boss}, settings, history, actions:{ pick(raid,boss), tutorial(), drill(id), full(), settings(), history(), settingsChanged() } }
 */
export function menuScreen({ script, index, current, settings, history, actions }) {
  const role = resolveRole(script, settings.role);
  const key = (mode) => `${script.id}:${mode}:${role}`;
  const roleDef = (script.roles && script.roles[role]) || {};
  const drillList = drillsForRole(script, role);
  const drills = drillList.map((d) =>
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
        bestChip(history, key(`drill:${d.id}`)) || h('span', { class: 'best-chip empty', text: 'Not run' }),
        h('span', { class: 'chev', 'aria-hidden': true, text: '›' }),
      ), () => actions.drill(d.id), { class: 'btn-drill' }),
    ));
  const hasTutorial = tutorialForRole(script, role);

  const el = h('div', { class: 'panel panel-menu' },
    h('header', { class: 'menu-top' },
      h('div', { class: 'brand' },
        h('div', { class: 'brand-kicker', text: `${(script.raidInfo && script.raidInfo.name) || 'Raid rehearsal'} · ${script.raidInfo && script.raidInfo.size ? script.raidInfo.size + '-man' : ''}` }),
        h('h1', { class: 'brand-title', text: script.name }),
        h('p', { class: 'brand-sub', text: `${script.arena.name} · script v${script.version}` }),
      ),
      h('div', { class: 'menu-tools' },
        button('Settings', actions.settings, { class: 'btn-ghost' }),
        button('History', actions.history, { class: 'btn-ghost' }),
      ),
    ),
    encounterPicker(index, current, actions.pick),
    h('div', { class: 'role-row' },
      h('div', {}, h('div', { class: 'section-label-inline', text: 'Play as' }), roleSwitch(script, settings, () => { actions.settingsChanged && actions.settingsChanged(); actions.pick(current.raid, current.boss); })),
      h('p', { class: 'role-desc', text: roleDef.description || '' }),
    ),
    h('div', { class: 'hero' + (hasTutorial ? '' : ' single') },
      button(h('span', { class: 'card-inner' },
        h('span', { class: 'card-kicker', text: 'Play' }),
        h('span', { class: 'card-title', text: 'Full fight' }),
        h('span', { class: 'card-sub', text: `${script.phases.length === 1 ? 'The whole pull' : `All ${script.phases.length} phases`}, start to finish` }),
        bestChip(history, key('full')) || h('span', { class: 'best-chip empty', text: 'No run yet' }),
      ), actions.full, { class: 'card card-primary', autofocus: true }),
      hasTutorial ? button(h('span', { class: 'card-inner' },
        h('span', { class: 'card-kicker', text: 'Learn' }),
        h('span', { class: 'card-title', text: 'Tutorial' }),
        h('span', { class: 'card-sub', text: 'One mechanic at a time' }),
        h('span', { class: 'best-chip empty', text: `${script.tutorial.steps.length} steps` }),
      ), actions.tutorial, { class: 'card' }) : null,
    ),
    h('section', { class: 'drills' },
      h('div', { class: 'section-row' },
        h('h3', { class: 'section-label', text: 'Drills' }),
        h('span', { class: 'section-note', text: drillList.length ? 'Short loops of one mechanic' : 'No drills for this role yet' }),
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
    h('td', {}, h('div', { class: 'td-name', text: `${r.boss ? r.boss + ' · ' : ''}${r.name}` }), h('div', { class: 'muted', text: r.roleLabel || r.role })),
    h('td', { class: 'td-grade' }, h('span', { class: 'grade grade-' + r.grade, text: r.grade }), h('span', { class: 'td-score', text: `${r.overall}` })),
    h('td', { class: 'td-fixes' }, ...(r.fixes || []).slice(0, 2).map((f) => h('span', { class: 'fix-chip', text: f }))),
  ));
  const bestFull = runs.filter((r) => r.mode === 'full').sort((a, b) => b.overall - a.overall)[0];
  const stats = [
    ['Runs', `${runs.length}`],
    ['Best full fight', bestFull ? `${bestFull.overall}` : '–'],
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
          h('thead', {}, h('tr', {}, h('th', { text: 'When' }), h('th', { text: 'Encounter' }), h('th', { text: 'Grade' }), h('th', { text: 'Top fixes' }))),
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
