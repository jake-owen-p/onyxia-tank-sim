// Scenario builder: turns a mode choice into createSim options plus metadata
// the session and scorecard use. No DOM.

/**
 * @param {object} p { mode:'tutorial'|'drill'|'full', drillId?, settings, script, seed? }
 * @returns {{ name, mode, modeKey, simOptions, loop, drill }}
 */
export function buildScenario({ mode, drillId = null, settings, script, seed = null }) {
  const role = settings.role || 'mt';
  const s = seed ?? (Math.floor(Date.now() % 2147483647) || 1);
  if (mode === 'tutorial') {
    return {
      name: 'Tutorial', mode, modeKey: 'tutorial', loop: false, drill: null,
      simOptions: { role, seed: s, manual: true, freezeHp: true, bossPassive: true, start: 'entrance', startPhase: 1 },
    };
  }
  if (mode === 'drill') {
    const drill = (script.drills || []).find((d) => d.id === drillId) || script.drills[0];
    return {
      name: drill.name, mode, modeKey: `drill:${drill.id}`, loop: !!drill.loop, drill,
      simOptions: {
        role, seed: s,
        startPhase: drill.startPhase, startOffset: drill.startOffset || 0,
        start: drill.start || 'entrance', actions: drill.actions || null,
        duration: drill.duration,
        phaseDurations: settings.phaseDurations || null,
      },
    };
  }
  return {
    name: 'Full fight', mode: 'full', modeKey: 'full', loop: false, drill: null,
    simOptions: { role, seed: s, start: 'entrance', startPhase: 1, phaseDurations: settings.phaseDurations || null },
  };
}

export function listDrills(script) {
  return (script.drills || []).map((d) => ({ id: d.id, name: d.name, description: d.description }));
}
