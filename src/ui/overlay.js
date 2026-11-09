// DOM overlay root. Screens register a render function; `show` swaps the
// visible screen and `hide` clears it. Also hosts transient toasts.

export function createOverlay(root) {
  const screens = new Map();
  let current = null;
  let currentEl = null;

  const toastHost = document.createElement('div');
  toastHost.className = 'toast-host';
  root.appendChild(toastHost);

  const api = {
    el: root,
    get current() { return current; },
    /** Register a screen: render(props) -> HTMLElement. */
    register(id, render) { screens.set(id, render); },
    show(id, props = {}) {
      api.hide();
      api.clearToasts();
      const render = screens.get(id);
      if (!render) throw new Error(`Unknown screen ${id}`);
      // The screen is a full-window backdrop that centres whatever the
      // renderer returns (a .panel); the panel itself must never be the screen
      // or its inset:0 would pin it to the corner.
      const panelEl = render(props);
      currentEl = document.createElement('div');
      currentEl.className = 'screen';
      currentEl.dataset.screen = id;
      currentEl.appendChild(panelEl);
      root.insertBefore(currentEl, toastHost);
      current = id;
      root.classList.add('has-screen');
      // Focus the first focusable element so keyboard users can act immediately.
      requestAnimationFrame(() => {
        const f = panelEl.querySelector('[autofocus]') || panelEl.querySelector('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
        if (f) f.focus({ preventScroll: true });
      });
      return panelEl;
    },
    hide() {
      if (currentEl) currentEl.remove();
      currentEl = null; current = null;
      root.classList.remove('has-screen');
    },
    /** Brief DOM toast (e.g. phase skip). */
    clearToasts() { toastHost.textContent = ''; },
    toast(text, kind = 'info', ms = 2000) {
      const t = document.createElement('div');
      t.className = `toast toast-${kind}`;
      t.textContent = text;
      toastHost.appendChild(t);
      requestAnimationFrame(() => t.classList.add('in'));
      setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, ms);
    },
  };
  return api;
}

// ---- small DOM helpers shared by the UI modules ----

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') {
      for (const [name, value] of Object.entries(v)) {
        if (name.startsWith('--')) el.style.setProperty(name, value);
        else el.style[name] = value;
      }
    }
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export function button(label, onClick, attrs = {}) {
  return h('button', { class: 'btn' + (attrs.primary ? ' btn-primary' : '') + (attrs.class ? ' ' + attrs.class : ''), type: 'button', onClick, autofocus: attrs.autofocus, title: attrs.title }, label);
}

/** Make a list of buttons navigable with arrow keys. */
export function arrowNav(container) {
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = [...container.querySelectorAll('button, input, select, [tabindex="0"]')].filter((el) => !el.disabled);
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[n].focus();
  });
  return container;
}
