// Contact sheet of every boss in its room: `tools/gallery.html?raid=molten-core&cols=4&mode=hero&t=2`.
// Used to review how recognisable each model is. Not part of the game.
import { createSim, FIXED_DT } from '../src/core/sim.js';
import { acquireWorld } from '../src/render/gl/world.js';
import { getPalette } from '../src/render/palette.js';
import { createCamera, updateChaseCamera } from '../src/render/projection.js';

const q = new URLSearchParams(location.search);
const raidFilter = q.get('raid'), bossFilter = q.get('boss'), cols = +(q.get('cols') || 4), CW = +(q.get('w') || 450), CH = +(q.get('h') || 280), mode = q.get('mode') || 'hero';
const log = (s) => { document.getElementById('log').textContent = s; };
const index = await (await fetch('../data/encounters/index.json')).json();
const list = [];
for (const r of index.raids) for (const b of r.bosses) if ((!raidFilter || r.id === raidFilter) && (!bossFilter || bossFilter.split(',').includes(b.id))) list.push({ r, b });
const grid = document.getElementById('grid'), g2 = grid.getContext('2d');
grid.width = cols * CW; grid.height = Math.ceil(list.length / cols) * CH;
const world = acquireWorld();
const wc = world.canvas; wc.style.cssText = 'position:fixed;left:-9999px';
const pal = getPalette({});
const settings = { hazardOpacity: 0.7, ghostAlpha: 0.6, minimap: false };
const fails = [];
for (let i = 0; i < list.length; i++) {
  const { r, b } = list[i];
  log(`${i + 1}/${list.length} ${b.name}`);
  try {
    const path = r.id === 'onyxia' ? `../data/encounters/${b.file}` : `../data/encounters/${r.id}/${b.file}`;
    const script = await (await fetch(path)).json();
    script.raidInfo = script.raidInfo || { id: r.id, name: r.name };
    script.raidInfo.id = r.id;
    world.setEncounter(script);
    await world.artReady();
    const t0 = performance.now();
    const sim = createSim(script, { manual: true, freezeHp: true, bossPassive: true, start: 'wall', seed: 3 });
    const cam = createCamera();
    cam.distance = 16;
    for (let n = 0; n < 40; n++) sim.step({}, FIXED_DT);
    let now = 2;
    for (let f = 0; f < 14; f++) {
      now += 1 / 30;
      updateChaseCamera(cam, sim.state.world.player, { distance: 16, dtReal: 1 / 30 });
      const used = world.draw({ view: sim.state, script, settings, pal, cam, w: CW, h: CH, dpr: 1, now, dtReal: 1 / 30, mode });
      if (f === 13 && q.get('debug')) { const B = sim.state.world.boss; console.log(b.id, 'boss', B.x.toFixed(1), B.y.toFixed(1), B.heading.toFixed(2), B.state, 'cam', used.x.toFixed(1), used.y.toFixed(1), used.z.toFixed(1), 'look', used.lookX.toFixed(1), used.lookY.toFixed(1), used.lookZ.toFixed(1)); }
    }
    g2.drawImage(wc, (i % cols) * CW, Math.floor(i / cols) * CH);
    g2.fillStyle = '#000b'; g2.fillRect((i % cols) * CW + 4, Math.floor(i / cols) * CH + 4, 8 * b.name.length + 12, 20);
    g2.fillStyle = '#ffd98a'; g2.font = '13px Georgia'; g2.fillText(`${b.name}  ${Math.round(performance.now() - t0)}ms`, (i % cols) * CW + 9, Math.floor(i / cols) * CH + 18);
  } catch (e) { fails.push(`${b.id}: ${e.message}`); console.error(b.id, e); }
  await new Promise((res) => setTimeout(res, 0));
}
log('');
document.title = fails.length ? `FAILED ${fails.join('; ')}` : 'done';
window.__done = true; window.__fails = fails;
