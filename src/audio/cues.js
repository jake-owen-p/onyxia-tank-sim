// Cue player. Every sound is synthesised with WebAudio so the app ships with
// no audio files. Each warning has a distinct timbre; the voice countdown uses
// speechSynthesis when the browser has it and a tone ladder otherwise.

export const CUE_IDS = [
  'breath', 'cleave', 'buffet', 'tail', 'deepBreath', 'whelps', 'roar', 'eruption',
  'landing', 'takeoff', 'threatLost', 'feared', 'ontime', 'late', 'missed', 'phase', 'countdown', 'click',
  'beatHit', 'beatMiss',
];

export const CUE_LABELS = {
  breath: 'Flame Breath', cleave: 'Cleave', buffet: 'Wing Buffet', tail: 'Tail Sweep',
  deepBreath: 'Deep Breath', whelps: 'Whelps', roar: 'Bellowing Roar', eruption: 'Eruption',
  landing: 'Landing', takeoff: 'Takeoff', threatLost: 'Threat lost', feared: 'Feared',
  ontime: 'On time', late: 'Late', missed: 'Missed', phase: 'Phase change', countdown: 'Countdown', click: 'Interface',
  beatHit: 'Press cue hit', beatMiss: 'Press cue missed',
};

// Core event -> cue id. Warn-able actions play at warning time (tick), not at resolution.
const EVENT_CUES = {
  threatLost: 'threatLost', feared: 'feared', phase: 'phase', knockback: null, death: 'missed',
};

export function createAudio(settings) {
  let ctx = null;
  let master = null;
  let unlocked = false;
  const spoken = new Set();   // de-dup keys for announcements/countdowns
  let voiceOk = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';

  function ensure() {
    if (ctx) return true;
    try {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.connect(ctx.destination);
    } catch { ctx = null; return false; }
    return true;
  }

  function gainFor(cue) {
    if (settings.muted) return 0;
    const per = settings.cueVolumes && settings.cueVolumes[cue] != null ? settings.cueVolumes[cue] : 1;
    return (settings.masterVolume ?? 0.8) * per;
  }

  /** Schedule a simple enveloped oscillator. */
  function tone({ type = 'sine', f0 = 440, f1 = null, t0 = 0, dur = 0.2, vol = 0.5, cue, attack = 0.01, release = 0.08, filter = null }) {
    const g = gainFor(cue);
    if (!g) return;
    const now = ctx.currentTime + t0;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, now);
    if (f1 != null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), now + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(vol * g, now + attack);
    env.gain.setValueAtTime(vol * g, now + Math.max(attack, dur - release));
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.02);
    let node = osc;
    if (filter) { const f = ctx.createBiquadFilter(); f.type = filter.type; f.frequency.value = filter.f; f.Q.value = filter.q || 1; osc.connect(f); node = f; }
    node.connect(env); env.connect(master);
    osc.start(now); osc.stop(now + dur + 0.05);
  }

  /** Filtered noise burst for rumbles and cracks. */
  function noise({ t0 = 0, dur = 0.3, vol = 0.4, cue, f = 400, q = 1, type = 'lowpass', sweepTo = null }) {
    const g = gainFor(cue);
    if (!g) return;
    const now = ctx.currentTime + t0;
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, now); fl.Q.value = q;
    if (sweepTo) fl.frequency.exponentialRampToValueAtTime(sweepTo, now + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(vol * g, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(fl); fl.connect(env); env.connect(master);
    src.start(now); src.stop(now + dur + 0.02);
  }

  const RECIPES = {
    breath:     () => { tone({ type: 'sawtooth', f0: 110, f1: 330, dur: 0.7, vol: 0.35, cue: 'breath', filter: { type: 'lowpass', f: 900 } }); noise({ dur: 0.7, vol: 0.2, cue: 'breath', f: 600, sweepTo: 2400 }); },
    cleave:     () => { tone({ type: 'square', f0: 520, f1: 380, dur: 0.12, vol: 0.25, cue: 'cleave' }); },
    buffet:     () => { tone({ type: 'triangle', f0: 740, dur: 0.16, vol: 0.45, cue: 'buffet' }); tone({ type: 'triangle', f0: 494, t0: 0.18, dur: 0.22, vol: 0.45, cue: 'buffet' }); },
    tail:       () => { noise({ dur: 0.25, vol: 0.3, cue: 'tail', f: 300, sweepTo: 120 }); },
    deepBreath: () => { for (let i = 0; i < 2; i++) tone({ type: 'square', f0: 620, f1: 880, t0: i * 0.45, dur: 0.35, vol: 0.3, cue: 'deepBreath', filter: { type: 'lowpass', f: 2000 } }); },
    whelps:     () => { for (let i = 0; i < 3; i++) tone({ type: 'sine', f0: 1200 + i * 200, t0: i * 0.09, dur: 0.07, vol: 0.35, cue: 'whelps' }); },
    roar:       () => { tone({ type: 'sawtooth', f0: 70, f1: 45, dur: 0.9, vol: 0.5, cue: 'roar', filter: { type: 'lowpass', f: 300, q: 2 } }); noise({ dur: 0.9, vol: 0.25, cue: 'roar', f: 180, q: 3 }); },
    eruption:   () => { noise({ dur: 0.8, vol: 0.4, cue: 'eruption', f: 120, q: 2 }); noise({ t0: 0.25, dur: 0.08, vol: 0.5, cue: 'eruption', f: 3000, type: 'highpass' }); },
    landing:    () => { tone({ type: 'sine', f0: 90, f1: 40, dur: 0.5, vol: 0.6, cue: 'landing' }); noise({ dur: 0.3, vol: 0.3, cue: 'landing', f: 200 }); },
    takeoff:    () => { tone({ type: 'sine', f0: 180, f1: 720, dur: 1.0, vol: 0.3, cue: 'takeoff', attack: 0.3 }); noise({ dur: 1.0, vol: 0.2, cue: 'takeoff', f: 400, sweepTo: 1600 }); },
    threatLost: () => { for (let i = 0; i < 3; i++) tone({ type: 'square', f0: 220, t0: i * 0.14, dur: 0.1, vol: 0.4, cue: 'threatLost', filter: { type: 'lowpass', f: 1200 } }); },
    feared:     () => { const o = { type: 'sine', f0: 400, f1: 250, dur: 0.6, vol: 0.35, cue: 'feared' }; tone(o); tone({ ...o, f0: 405, t0: 0.05 }); },
    ontime:     () => { tone({ type: 'sine', f0: 880, dur: 0.12, vol: 0.3, cue: 'ontime' }); tone({ type: 'sine', f0: 1320, t0: 0.1, dur: 0.25, vol: 0.3, cue: 'ontime' }); },
    late:       () => { tone({ type: 'triangle', f0: 440, dur: 0.3, vol: 0.3, cue: 'late' }); },
    missed:     () => { tone({ type: 'square', f0: 160, f1: 120, dur: 0.4, vol: 0.3, cue: 'missed', filter: { type: 'lowpass', f: 800 } }); },
    phase:      () => { [262, 330, 392, 523].forEach((f, i) => tone({ type: 'triangle', f0: f, t0: i * 0.06, dur: 0.6, vol: 0.2, cue: 'phase' })); },
    countdown:  () => { tone({ type: 'sine', f0: 1000, dur: 0.06, vol: 0.3, cue: 'countdown' }); },
    click:      () => { tone({ type: 'sine', f0: 1500, dur: 0.03, vol: 0.15, cue: 'click' }); },
    // press cues: a bright tick for a perfect press, a softer one for good, a dull thud for a miss
    beatPerfect: () => { tone({ type: 'sine', f0: 1568, dur: 0.07, vol: 0.28, cue: 'beatHit', release: 0.04 }); tone({ type: 'sine', f0: 2349, t0: 0.03, dur: 0.09, vol: 0.18, cue: 'beatHit' }); },
    beatGood:    () => { tone({ type: 'triangle', f0: 1046, dur: 0.08, vol: 0.22, cue: 'beatHit', release: 0.05 }); },
    beatHit:     () => { tone({ type: 'sine', f0: 1568, dur: 0.07, vol: 0.28, cue: 'beatHit', release: 0.04 }); },
    beatMiss:    () => { tone({ type: 'square', f0: 140, f1: 90, dur: 0.16, vol: 0.22, cue: 'beatMiss', filter: { type: 'lowpass', f: 600 } }); },
  };

  function play(cue) {
    if (!RECIPES[cue]) return;
    if (!ensure()) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      RECIPES[cue]();
    } catch { /* never let audio break the sim */ }
  }

  function speak(text) {
    if (!voiceOk || settings.voiceCountdown === false || settings.muted) return false;
    const g = gainFor('countdown');
    if (!g) return false;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.15; u.pitch = 0.9; u.volume = Math.min(1, g);
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      return true;
    } catch { voiceOk = false; return false; }
  }

  const NUMBER_WORDS = { 3: 'three', 2: 'two', 1: 'one' };

  return {
    /** Call on the first user gesture so the AudioContext may start. */
    unlock() {
      if (unlocked) return;
      unlocked = true;
      if (ensure() && ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (voiceOk) { try { speechSynthesis.getVoices(); } catch { /* ignore */ } }
    },
    play,
    /** Map core events to cues. */
    handleEvent(evt) {
      switch (evt.type) {
        case 'expectation': play(evt.status); break;
        case 'beat': play(evt.status === 'perfect' ? 'beatPerfect' : evt.status === 'good' ? 'beatGood' : 'beatMiss'); break;
        case 'hazardActive': play(evt.kind === 'lane' ? 'deepBreath' : 'eruption'); break;
        case 'cast': if (evt.id === 'flameBreath') play('breath'); else if (evt.id === 'bellowingRoar') play('roar'); break;
        case 'action':
          if (evt.id === 'cleave') play('cleave');
          else if (evt.id === 'tailSweep') play('tail');
          else if (evt.id === 'landing') play('landing');
          else if (evt.id === 'takeoff') play('takeoff');
          else if (evt.id === 'whelpWave') play('whelps');
          else if (evt.id === 'wingBuffet') play('buffet');
          break;
        default: {
          const c = EVENT_CUES[evt.type];
          if (c) play(c);
        }
      }
    },
    /**
     * Lead-time announcement and 3-2-1 countdown for the soonest warn-able
     * upcoming event. De-duplicated per event instance.
     */
    tick(view) {
      if (!view || !view.upcoming) return;
      const lead = settings.warningLead ?? 5;
      const next = view.upcoming.find((u) => u.warn);
      if (!next) return;
      const key = `${next.id}:${Math.round(next.at)}`;
      const remain = next.in;
      if (remain <= lead && remain > 3.05) {
        const k = key + ':announce';
        if (!spoken.has(k)) {
          spoken.add(k);
          if (!speak(next.label)) play(next.cue || 'countdown');
        }
      }
      for (const n of [3, 2, 1]) {
        if (remain <= n + 0.02 && remain > n - 0.5) {
          const k = `${key}:${n}`;
          if (!spoken.has(k)) {
            spoken.add(k);
            if (!speak(NUMBER_WORDS[n])) { play('countdown'); if (ensure()) tone({ type: 'sine', f0: 600 + n * 120, dur: 0.1, vol: 0.3, cue: 'countdown' }); }
          }
        }
      }
      if (spoken.size > 400) spoken.clear();
    },
    /** Forget announced keys (new run). */
    reset() { spoken.clear(); if (voiceOk) { try { speechSynthesis.cancel(); } catch { /* ignore */ } } },
    destroy() { this.reset(); if (ctx) { try { ctx.close(); } catch { /* ignore */ } ctx = null; } },
  };
}
