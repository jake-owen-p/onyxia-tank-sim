// Scenario builder: turns a mode choice into createSim options plus metadata
// the session and scorecard use. No DOM.

import { roleMatches, holdsBoss } from '../core/scoring.js';

/** Drills available to a role. */
export function drillsForRole(script, role) {
  return (script.drills || []).filter((d) => roleMatches(d.roles, role, holdsBoss(script, role)));
}

/** Does the script's tutorial apply to this role? */
export function tutorialForRole(script, role) {
  return !!(script.tutorial && script.tutorial.steps && script.tutorial.steps.length && roleMatches(script.tutorial.roles, role, holdsBoss(script, role)));
}

/** The role to play a script with: the chosen one when the script offers it, else its first role. */
export function resolveRole(script, role) {
  const roles = script.roles ? Object.keys(script.roles) : ['tank'];
  const r = role === 'mt' ? 'tank' : role;
  return roles.includes(r) ? r : roles[0];
}

/**
 * @param {object} p { mode:'tutorial'|'drill'|'full', drillId?, settings, script, seed? }
 * @returns {{ name, mode, modeKey, simOptions, loop, drill }}
 */
export function buildScenario({ mode, drillId = null, settings, script, seed = null }) {
  const role = resolveRole(script, settings.role || 'tank');
  const s = seed ?? (Math.floor(Date.now() % 2147483647) || 1);
  const keyPrefix = `${script.id}:`;
  const durations = settings.phaseDurations && settings.phaseDurations[script.id] ? settings.phaseDurations[script.id] : null;
  if (mode === 'tutorial') {
    return {
      name: 'Tutorial', mode, modeKey: `${keyPrefix}tutorial:${role}`, loop: false, drill: null, role,
      simOptions: { role, seed: s, manual: true, freezeHp: true, bossPassive: true, start: 'entrance', startPhase: script.phases[0].id },
    };
  }
  if (mode === 'drill') {
    const list = drillsForRole(script, role);
    const drill = list.find((d) => d.id === drillId) || list[0] || script.drills[0];
    return {
      name: drill.name, mode, modeKey: `${keyPrefix}drill:${drill.id}:${role}`, loop: !!drill.loop, drill, role,
      simOptions: {
        role, seed: s,
        startPhase: drill.startPhase, startOffset: drill.startOffset || 0,
        start: drill.start || 'entrance', actions: drill.actions || null,
        duration: drill.duration,
        phaseDurations: durations,
      },
    };
  }
  return {
    name: 'Full fight', mode: 'full', modeKey: `${keyPrefix}full:${role}`, loop: false, drill: null, role,
    simOptions: { role, seed: s, start: 'entrance', startPhase: script.phases[0].id, phaseDurations: durations },
  };
}

export function listDrills(script, role = null) {
  return (role ? drillsForRole(script, role) : script.drills || []).map((d) => ({ id: d.id, name: d.name, description: d.description }));
}
