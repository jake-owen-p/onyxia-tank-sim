// End-of-run scorecard: grade, per-phase breakdown, top three fixes.

import { h, button, arrowNav } from './overlay.js';
import { formatMetric } from '../core/scoring.js';

/**
 * @param {object} p { score, scenario, sim, best, isNewBest, onReplay, onAgain, onMenu }
 */
export function scorecardScreen({ score, scenario, sim, best, isNewBest, onReplay, onAgain, onMenu }) {
  const statusText = (i) => i.status === 'ontime' ? 'On time' : i.status === 'late' ? `Late +${i.lateBy.toFixed(1)}s` : 'Missed';

  const phaseCards = score.phases.map((p) => h('div', { class: 'phase-card' },
    h('div', { class: 'phase-head' },
      h('div', {}, h('div', { class: 'phase-name', text: p.name }), h('div', { class: 'muted', text: p.subtitle })),
      h('div', { class: 'grade grade-' + p.grade, text: p.grade }),
      h('div', { class: 'phase-score', text: `${p.total}` }),
    ),
    h('div', { class: 'counts' },
      h('span', { class: 'count ok', text: `${p.counts.ontime} on time` }),
      h('span', { class: 'count late', text: `${p.counts.late} late` }),
      h('span', { class: 'count missed', text: `${p.counts.missed} missed` }),
      p.activity != null ? h('span', { class: 'muted', text: `${sim.state.tankRole ? 'On you' : 'Uptime'} ${Math.round(p.activity * 100)}%` }) : null,
    ),
    p.cues && p.cues.total ? h('div', { class: 'counts cue-counts' },
      h('span', { class: 'count-label', text: 'Timing' }),
      h('span', { class: 'count ok', text: `${p.cues.perfect} perfect` }),
      h('span', { class: 'count late', text: `${p.cues.good} good` }),
      h('span', { class: 'count missed', text: `${p.cues.missed} missed` }),
      h('span', { class: 'muted', text: `${p.cues.points} pts` }),
    ) : null,
    h('ul', { class: 'exp-list' }, ...p.expectations.map((i) => h('li', { class: 'exp exp-' + i.status },
      h('span', { class: 'exp-label', text: i.label }),
      h('span', { class: 'exp-status', text: statusText(i) }),
    ))),
    p.metrics.some((m) => m.value) ? h('ul', { class: 'metric-list' }, ...p.metrics.filter((m) => m.value || m.info).map((m) => h('li', { class: 'metric' + (m.severe ? ' severe' : '') + (m.info ? ' info' : '') },
      h('span', { text: m.label }),
      h('span', { class: 'metric-val', text: formatMetric(m) }),
    ))) : null,
  ));

  const fixes = score.fixes.length
    ? score.fixes.map((f, i) => h('li', { class: 'fix' },
      h('div', { class: 'fix-num', text: `${i + 1}` }),
      h('div', {},
        h('div', { class: 'fix-title', text: f.title + (f.detail ? ` — ${f.detail}` : '') }),
        f.tip ? h('div', { class: 'fix-tip', text: f.tip }) : null,
      ),
    ))
    : [h('li', { class: 'fix' }, h('div', { class: 'fix-title', text: 'Nothing to fix. Clean run.' }))];

  const isDrill = scenario.mode === 'drill';
  const el = h('div', { class: 'panel panel-wide panel-score' },
    h('div', { class: 'score-head' },
      h('div', {},
        h('div', { class: 'kicker', text: `${scenario.name} · ${roleLabel(sim.script, sim.state.role)}` }),
        h('h2', { text: sim.state.result === 'victory' ? `${sim.script.name} down` : isDrill ? 'Drill complete' : 'Run ended' }),
        h('div', { class: 'muted', text: `${formatTime(sim.state.t)} · ${isNewBest ? 'New best' : best != null ? `Best ${best}` : ''}` }),
        score.cues && score.cues.total ? h('div', { class: 'muted', text: `${score.cues.perfect}/${score.cues.total} abilities on the note · best streak ${score.cues.bestCombo}` }) : null,
      ),
      h('div', { class: 'overall' },
        h('div', { class: 'grade grade-big grade-' + score.grade, text: score.grade }),
        h('div', { class: 'overall-num', text: `${score.overall}` }),
      ),
    ),
    h('div', { class: 'phase-grid' }, ...phaseCards),
    h('section', { class: 'fixes' }, h('h3', { text: 'Top three things to fix' }), h('ol', { class: 'fix-list' }, ...fixes)),
    h('div', { class: 'actions' },
      button(isDrill && scenario.loop ? 'Again' : 'Run again', onAgain, { primary: true, autofocus: true, title: 'Enter' }),
      button('Replay', onReplay),
      button('Menu', onMenu),
    ),
  );
  return arrowNav(el);
}

export function roleLabel(script, role) {
  const r = script && script.roles && script.roles[role];
  return r ? r.label : ({ tank: 'Main tank', offtank: 'Off-tank', melee: 'Melee DPS', ranged: 'Ranged DPS', healer: 'Healer' }[role] || role);
}

export function formatTime(t) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
