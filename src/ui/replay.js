// Replay screen: scrub recorded snapshots; the renderer draws each snapshot
// exactly like a live frame, with the camera following the player.

import { h, button } from './overlay.js';
import { formatTime } from './scorecard.js';

/**
 * @param {object} p { snapshots, expectations, renderer, settings, keybinds, onBack }
 * Returns an element; call element.stop() when leaving the screen.
 */
export function replayScreen({ snapshots, expectations = [], renderer, settings, keybinds, onBack }) {
  const duration = snapshots.length ? snapshots[snapshots.length - 1].t : 0;
  let t = 0;
  let playing = true;
  let speed = 1;
  let raf = 0;
  let last = performance.now();

  const findSnapshot = (time) => {
    // Binary search for the snapshot at or before `time`.
    let lo = 0, hi = snapshots.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (snapshots[mid].t <= time) lo = mid; else hi = mid - 1; }
    return snapshots[lo];
  };

  const scrub = h('input', { type: 'range', min: 0, max: duration.toFixed(2), step: 0.1, value: 0, class: 'slider scrub', 'aria-label': 'Replay position' });
  const timeEl = h('span', { class: 'replay-time', text: `${formatTime(0)} / ${formatTime(duration)}` });
  const playBtn = button('Pause', () => { playing = !playing; playBtn.textContent = playing ? 'Pause' : 'Play'; }, { title: 'Space' });
  const speedSel = h('select', { 'aria-label': 'Replay speed' }, ...[0.25, 0.5, 1, 2, 4].map((v) => h('option', { value: v, text: `${v}×`, selected: v === 1 })));
  speedSel.addEventListener('change', () => { speed = parseFloat(speedSel.value); });
  const viewBtn = button('View: ' + (renderer.getView() === 'pov' ? 'POV' : 'Map'), () => {
    const v = renderer.getView() === 'pov' ? 'topdown' : 'pov';
    renderer.setView(v);
    viewBtn.textContent = 'View: ' + (v === 'pov' ? 'POV' : 'Map');
  }, { title: 'Tab' });

  // Markers for expectation results on the scrubber.
  const markers = h('div', { class: 'markers' });
  for (const i of expectations) {
    if (i.status === 'pending' || i.resolvedAt == null || !duration) continue;
    markers.appendChild(h('span', { class: 'marker marker-' + i.status, style: { left: `${(i.resolvedAt / duration) * 100}%` }, title: `${i.label}: ${i.status}` }));
  }

  scrub.addEventListener('input', () => { t = parseFloat(scrub.value); });

  const el = h('div', { class: 'replay-bar', role: 'region', 'aria-label': 'Replay' },
    h('div', { class: 'scrub-wrap' }, markers, scrub),
    h('div', { class: 'replay-controls' },
      playBtn, speedSel, viewBtn, timeEl,
      h('span', { class: 'spacer' }),
      button('Back to scorecard', () => onBack(), { primary: true, autofocus: true, title: 'Esc' }),
    ),
  );

  function onKey(e) {
    if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
    else if (e.code === 'Tab') { e.preventDefault(); viewBtn.click(); }
    else if (e.code === 'Escape') { e.preventDefault(); onBack(); }
    else if (e.code === 'ArrowLeft') { t = Math.max(0, t - 5); }
    else if (e.code === 'ArrowRight') { t = Math.min(duration, t + 5); }
  }
  window.addEventListener('keydown', onKey);

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dtReal = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    if (playing && snapshots.length) {
      t += dtReal * speed;
      if (t >= duration) { t = duration; playing = false; playBtn.textContent = 'Play'; }
      scrub.value = t.toFixed(2);
    }
    timeEl.textContent = `${formatTime(t)} / ${formatTime(duration)}`;
    const view = snapshots.length ? findSnapshot(t) : null;
    if (view) {
      renderer.frame({
        view, settings, now: now / 1000, dtReal,
        abilityKeys: keybinds.abilityKeys(),
        overlay: { paused: false, replay: { t, duration, playing }, dim: false },
      });
    }
  }
  raf = requestAnimationFrame(frame);

  el.stop = () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  return el;
}
