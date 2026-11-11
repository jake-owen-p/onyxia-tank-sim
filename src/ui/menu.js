// Main menu: raid and boss picker, role switch, Full fight / Tutorial hero
// cards, drill list, Settings / History. Also the History screen and the Pause menu.

import { h, button, arrowNav } from './overlay.js';
import { bossPortrait, abilityIcon } from './art.js';
import { drillsForRole, tutorialForRole, resolveRole } from '../app/modes.js';

const HINTS = [['WASD', 'move'], ['Q / E', 'strafe'], ['Space', 'jump'], ['Right-drag', 'turn'], ['1–6', 'abilities'], ['Tab', 'view'], ['Esc', 'menu']];

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
  const icons = { tank: 'taunt', offtank: 'taunt', melee: 'attack', ranged: 'dispel', healer: 'heal' };
  const btns = roles.map(([id, r]) => button(h('span', { class: 'role-choice' }, abilityIcon(icons[id] || 'attack', 30), h('span', { text: r.short || r.label })), () => { settings.role = id; sync(); onChange(); }, { class: 'seg-btn', title: r.description || r.label }));
  function sync() { const cur = resolveRole(script, settings.role); btns.forEach((b, i) => { b.classList.toggle('on', roles[i][0] === cur); b.setAttribute('aria-pressed', roles[i][0] === cur); }); }
  sync();
  return h('div', { class: 'seg', role: 'group', 'aria-label': 'Role' }, ...btns);
}

/** Raid tabs and the boss chips of the chosen raid. */
function encounterPicker(index, current, onPick, signedIn) {
  const raids = (index && index.raids) || [];
  const curRaid = raids.find((r) => r.id === current.raid) || raids[0];
  const tabs = raids.map((r) => {
    const ready = r.bosses.filter((b) => b.status === 'ready').length;
    const locked = r.id !== 'onyxia' && !signedIn;
    return button(h('span', { class: 'raid-tab-inner' }, bossPortrait(r.id, r.bosses[0]?.id, 30), h('span', { class: 'raid-name', text: r.name }), h('span', { class: 'raid-count', text: locked ? 'Sign in' : ready ? `${ready}/${r.bosses.length}` : 'soon' })),
      () => onPick(r.id, (r.bosses.find((b) => b.status === 'ready') || r.bosses[0] || {}).id), { class: 'raid-tab' + (curRaid && r.id === curRaid.id ? ' on' : '') + (ready ? '' : ' empty') + (locked ? ' locked' : ''), title: locked ? `Sign in to play ${r.name}` : r.name });
  });
  const bosses = curRaid ? curRaid.bosses.map((b) => button(h('span', { class: 'boss-item' }, bossPortrait(curRaid.id, b.id, 30), h('span', { text: b.name })), () => onPick(curRaid.id, b.id), { class: 'boss-chip' + (b.id === current.boss ? ' on' : '') + (b.status === 'ready' ? '' : ' draft'), title: b.status === 'ready' ? b.name : `${b.name}: not available yet` })) : [];
  return h('section', { class: 'picker' },
    h('h3', { class: 'list-heading', text: 'Raids' }),
    h('div', { class: 'raid-tabs', role: 'group', 'aria-label': 'Raids' }, ...tabs),
    h('h3', { class: 'list-heading encounter-heading', text: 'Encounters' }),
    h('div', { class: 'boss-chips' }, ...(bosses.length ? bosses : [h('span', { class: 'muted', text: 'This raid isn’t ready yet. Choose another raid.' })])),
  );
}

const phaseTag = (d) => d.startOffset < 0 ? `P${d.startPhase}→${d.startPhase + 1}` : `P${d.startPhase}`;

/**
 * @param {object} p { script, index, current:{raid,boss}, settings, history, actions:{ pick(raid,boss), tutorial(), drill(id), full(), settings(), history(), settingsChanged() } }
 */
export function menuScreen({ script, index, current, settings, history, actions, account = {}, syncLabel = '', tutorials = [] }) {
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
            h('span', { class: 'drill-meta', text: `${d.duration} s${d.loop ? ' · repeatable' : ''}` }),
          ),
          h('span', { class: 'drill-desc', text: d.description }),
        ),
        bestChip(history, key(`drill:${d.id}`)) || h('span', { class: 'best-chip empty', text: 'Not run' }),
        h('span', { class: 'chev', 'aria-hidden': true, text: '›' }),
      ), () => actions.drill(d.id), { class: 'btn-drill' }),
    ));
  const hasTutorial = tutorialForRole(script, role);

  const el = h('div', { class: 'panel panel-menu', 'data-hero-inset': '' },
    h('header', { class: 'journal-header' },
      h('span', { class: 'journal-seal' }, abilityIcon('taunt', 34)),
      h('div', {}, h('h1', { text: 'Encounter Journal' }), h('div', { class: 'journal-sub', text: 'Choose a boss to practice' })),
      button('Home', actions.home, { class: 'journal-home', title: 'Back to Raid Rehearsal home' }),
    ),
    h('div', { class: 'journal-body' },
      encounterPicker(index, current, actions.pick, !!account.user),
      h('main', { class: 'encounter-page' },
        h('header', { class: 'boss-hero' },
          bossPortrait(current.raid, current.boss, 68),
          h('div', { class: 'brand' },
            h('div', { class: 'brand-kicker', text: `${script.raidInfo?.name || 'Raid'} · ${script.raidInfo?.size || 40} players` }),
            h('h2', { class: 'brand-title', text: script.name }),
            h('div', { class: 'brand-details' },
              h('p', { class: 'brand-sub', text: script.arena.name }),
              h('div', { class: 'boss-status', text: `${script.phases.length} practice ${script.phases.length === 1 ? 'section' : 'sections'} · ${drillList.length} ${drillList.length === 1 ? 'drill' : 'drills'}` }),
            ),
          ),
        ),
        h('div', { class: 'journal-paper' },
          h('section', { class: 'role-row' },
            h('h3', { class: 'section-label-inline', text: 'Choose your role' }),
            roleSwitch(script, settings, () => { actions.settingsChanged && actions.settingsChanged(); actions.pick(current.raid, current.boss); }),
            h('p', { class: 'role-desc', text: roleDef.description || '' }),
          ),
          script.fidelity ? h('details', { class: 'practice-coverage' },
            h('summary', { text: 'Differences from the real fight' }),
            h('p', { text: 'The raid’s damage is estimated. Your attacks build threat and kill adds, but do not directly lower boss health. Room sizes, damage and team actions are simplified.' }),
            ...script.fidelity.limitations.map((text) => h('p', { text })),
          ) : null,
          h('div', { class: 'hero' + (hasTutorial ? '' : ' single') },
            button(h('span', { class: 'card-inner' },
              h('span', { class: 'card-kicker', text: 'Play' }),
              h('span', { class: 'card-title', text: 'Practice fight' }),
              h('span', { class: 'card-sub', text: 'A scripted run through the encounter' }),
              bestChip(history, key('full')) || h('span', { class: 'best-chip empty', text: 'No run yet' }),
            ), actions.full, { class: 'card card-primary', autofocus: true }),
            hasTutorial ? button(h('span', { class: 'card-inner' },
              h('span', { class: 'card-kicker', text: 'Step by step' }),
              h('span', { class: 'card-title', text: 'Tutorial' }),
              h('span', { class: 'card-sub', text: 'The same encounter with on-screen guidance' }),
              h('span', { class: 'best-chip empty', text: tutorials.includes(`${script.id}:${role}`) ? 'Completed' : `${script.tutorial.steps.length} steps` }),
            ), actions.tutorial, { class: 'card' }) : null,
          ),
          h('section', { class: 'drills' },
            h('div', { class: 'section-row' },
              h('h3', { class: 'section-label', text: 'Practice drills' }),
              h('span', { class: 'section-note', text: drillList.length ? 'Repeat a single mechanic' : 'No drills for this role yet' }),
            ),
            h('ul', { class: 'drill-list' }, ...drills),
          ),
        ),
      ),
    ),
    h('div', { class: 'account-strip' },
      h('div', {}, account.user ? h('span', { class: 'account-email', text: account.user.email }) : null,
        h('span', { 'data-sync-status': '', class: 'account-sync', role: 'status', text: syncLabel })),
      account.user ? h('div', { class: 'actions' }, button('Sync', actions.sync), button('Sign out', actions.signOut)) : button('Sign in / Create account', actions.signIn, { primary: true })),
    h('nav', { class: 'journal-tabs', 'aria-label': 'Journal pages' },
      h('span', { class: 'journal-tab active', text: 'Raids', 'aria-current': 'page' }),
      button('Run history', actions.history, { class: 'journal-tab' }),
      button('Settings', actions.settings, { class: 'journal-tab' }),
    ),
    hintBar(HINTS),
  );
  requestAnimationFrame(() => {
    const selected = el.querySelector('.boss-chip.on');
    if (selected && el.isConnected) selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
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
    ['Best recent practice fight', bestFull ? `${bestFull.overall}` : '–'],
    ['Last played', runs.length ? fmtDate(runs[0].date) : '–'],
  ];
  const el = h('div', { class: 'panel panel-wide panel-history' },
    h('header', { class: 'panel-head' },
      h('div', {}, h('div', { class: 'kicker', text: 'Your last 50 runs' }), h('h2', { text: 'Run history' })),
      button('Back', onBack, { primary: true, autofocus: true, title: 'Esc' }),
    ),
    h('div', { class: 'stat-row' }, ...stats.map(([l, v]) => h('div', { class: 'stat' }, h('div', { class: 'stat-val', text: v }), h('div', { class: 'stat-label', text: l })))),
    runs.length
      ? h('div', { class: 'table-wrap' },
        h('table', { class: 'table' },
          h('thead', {}, h('tr', {}, h('th', { text: 'When' }), h('th', { text: 'Encounter' }), h('th', { text: 'Grade' }), h('th', { text: 'What to work on' }))),
          h('tbody', {}, ...rows),
        ))
      : h('div', { class: 'empty-state' },
        h('div', { class: 'empty-title', text: 'No runs yet' }),
        h('p', { class: 'muted', text: 'Finish a drill or a practice fight to see your score here.' })),
    runs.length ? h('div', { class: 'actions end' },
      button('Clear run history', () => { if (confirm('Delete your saved runs and best scores? This can’t be undone.')) onClear(); }, { class: 'btn-danger' }),
    ) : null,
  );
  return arrowNav(el);
}

/** Pause menu. */
export function pauseScreen({ settings, onResume, onRestart, onSettings, onQuit, onSpeed, allowPhaseSkip = true }) {
  const speed = h('input', { type: 'range', min: 0.25, max: 1, step: 0.05, value: settings.speed, class: 'slider', 'aria-label': 'Speed' });
  const speedVal = h('span', { class: 'val', text: pct(settings.speed) });
  speed.addEventListener('input', () => { settings.speed = parseFloat(speed.value); speedVal.textContent = pct(settings.speed); if (onSpeed) onSpeed(settings.speed); });
  const el = h('div', { class: 'panel panel-pause' },
    h('div', { class: 'kicker', text: 'Raid Rehearsal' }),
    h('h2', { text: 'Paused' }),
    h('div', { class: 'actions stack' },
      button('Resume', onResume, { primary: true, autofocus: true, title: 'Esc' }),
      button('Restart', onRestart),
      button('Settings', onSettings),
      button('End run', onQuit, { class: 'btn-ghost' }),
    ),
    h('div', { class: 'field field-pause' }, h('label', { text: 'Fight speed' }), speed, speedVal),
    hintBar([['Tab', 'view'], ...(allowPhaseSkip ? [['F1–F3', 'skip phase']] : []), ['Esc', 'resume']]),
  );
  return arrowNav(el);
}

export const pct = (v) => `${Math.round(v * 100)}%`;
