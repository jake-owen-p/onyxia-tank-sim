// Docked tutorial panel (not a modal: the sim keeps running underneath).

import { h, button } from './overlay.js';

export function createTutorialPanel(root) {
  let el = null;
  let statusEl = null;

  return {
    show({ title, text, index, total, showContinue, status = '', onContinue, onSkip, onExit }) {
      this.hide();
      statusEl = h('div', { class: 'tut-status', text: status });
      el = h('aside', { class: 'tutorial-panel', role: 'dialog', 'aria-label': 'Tutorial' },
        h('div', { class: 'tut-head' },
          h('span', { class: 'tut-step', text: `Step ${index} of ${total}` }),
          h('h2', { class: 'tut-title', text: title }),
        ),
        h('div', { class: 'tut-text' }, ...text.split('\n').filter(Boolean).map((p) => h('p', { text: p }))),
        statusEl,
        h('div', { class: 'tut-actions' },
          showContinue ? button('Continue', onContinue, { primary: true, autofocus: true, title: 'Enter' }) : null,
          button('Skip step', onSkip),
          button('Exit tutorial', onExit),
        ),
      );
      root.appendChild(el);
      requestAnimationFrame(() => el && el.classList.add('in'));
    },
    setStatus(text) {
      if (statusEl) { statusEl.textContent = text; statusEl.classList.toggle('done', text === 'Done'); }
    },
    hide() { if (el) { el.remove(); el = null; statusEl = null; } },
  };
}
