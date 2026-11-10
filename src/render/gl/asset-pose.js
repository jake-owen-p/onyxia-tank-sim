// Vanilla M2 tracks use absolute pivots and four weighted influences per vertex.
// Converted clips have local millisecond times; global tracks keep their own clock.
import { mul4 } from './math.js';

export function sampleTrack(track, time, out, fallback, quaternion = false) {
  if (!track) { out.set(fallback); return out; }
  const { times, values, period, step } = track;
  const t = period ? ((time % period) + period) % period : time;
  let lo = 0, hi = times.length - 1;
  while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (times[mid] <= t) lo = mid; else hi = mid - 1; }
  const next = Math.min(lo + 1, times.length - 1), a = values[lo], b = values[next];
  const f = step || next === lo ? 0 : Math.max(0, Math.min(1, (t - times[lo]) / (times[next] - times[lo])));
  // Quaternion keys occasionally switch hemispheres. Take the short rotation.
  let sign = 1;
  if (quaternion && a.reduce((sum, v, i) => sum + v * b[i], 0) < 0) sign = -1;
  for (let i = 0; i < out.length; i++) out[i] = a[i] + (b[i] * sign - a[i]) * f;
  if (quaternion) { const n = Math.hypot(...out) || 1; for (let i = 0; i < 4; i++) out[i] /= n; }
  return out;
}

export function chooseClip(clips, state = {}) {
  let choices;
  if (state.dead) choices = [1,0];
  else if (state.airborne) choices = state.cast ? [183,184,193,135,0] : [193,135,0];
  else if (state.actionProgress != null && state.cast) choices = [53,54,32,2,0];
  else if (state.actionProgress != null && state.attack) choices = [17,16,0];
  else if (state.jump) choices = [38,37,0];
  else if (state.moving) choices = [5,4,0];
  else if (state.cast) choices = [53,54,32,2,0];
  else if (state.attack) choices = [17,16,0];
  else choices = [0];
  return choices.find(id => clips[id]) ?? Object.keys(clips)[0];
}

/** Measure the visible mesh after skinning; bind-pose wings exaggerate height. */
export function posedBounds(meta, binary, matrices) {
  const data = new DataView(binary), vertexCount = data.getUint32(0, true);
  const indices = new Uint16Array(binary, 8 + vertexCount * 40);
  const visible = new Set();
  for (const batch of meta.batches) for (let i = batch.start; i < batch.start + batch.count; i++) visible.add(indices[i]);
  const bounds = [[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];
  for (const index of visible) {
    const p = 4 + index * 40, pos = [0,1,2].map(i => data.getFloat32(p + i * 4,true)), transformed = [0,0,0];
    for (let influence = 0; influence < 4; influence++) {
      const w = data.getUint8(p + 12 + influence) / 255, b = data.getUint8(p + 16 + influence) * 16;
      for (let j = 0; j < 3; j++) transformed[j] += w * (matrices[b+j]*pos[0]+matrices[b+4+j]*pos[1]+matrices[b+8+j]*pos[2]+matrices[b+12+j]);
    }
    if (![0,1,2,3].some(i => data.getUint8(p+12+i))) transformed.splice(0,3,...pos);
    for (let j=0;j<3;j++) { bounds[0][j]=Math.min(bounds[0][j],transformed[j]); bounds[1][j]=Math.max(bounds[1][j],transformed[j]); }
  }
  return bounds;
}

const ZERO = [0, 0, 0], ONE = [1, 1, 1], IDENTITY = [0, 0, 0, 1];
export class AssetPose {
  constructor(meta) {
    this.meta = meta;
    this.matrices = new Float32Array(Math.max(1, meta.bones.length) * 16);
    this.bones = meta.bones.map((_, i) => this.matrices.subarray(i * 16, i * 16 + 16));
    this.local = new Float32Array(16);
    this.t = new Float32Array(3); this.q = new Float32Array(4); this.s = new Float32Array(3);
    this.done = new Uint8Array(meta.bones.length);
    if (!meta.bones.length) this.matrices.set([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  }
  evaluate(seconds, state) {
    const clip = this.meta.clips[chooseClip(this.meta.clips, state)];
    const clock = seconds * 1000;
    const time = !state?.dead && state?.actionProgress != null && (state.cast || (state.attack && !state.airborne))
      ? Math.max(0,Math.min(clip.duration-1,state.actionProgress*clip.duration))
      : ((clock % clip.duration) + clip.duration) % clip.duration;
    this.done.fill(0);
    const visit = (i) => {
      if (this.done[i]) return;
      const bone = this.meta.bones[i];
      if (bone.parent >= 0) visit(bone.parent);
      const tracks = clip.tracks[i] || [];
      const at = (tr) => tr?.period ? clock : time;
      sampleTrack(tracks[0], at(tracks[0]), this.t, ZERO);
      sampleTrack(tracks[1], at(tracks[1]), this.q, IDENTITY, true);
      sampleTrack(tracks[2], at(tracks[2]), this.s, ONE);
      const [x,y,z,w] = this.q, [sx,sy,sz] = this.s, [px,py,pz] = bone.pivot, m = this.local;
      m[0]=(1-2*(y*y+z*z))*sx; m[1]=2*(x*y+z*w)*sx; m[2]=2*(x*z-y*w)*sx; m[3]=0;
      m[4]=2*(x*y-z*w)*sy; m[5]=(1-2*(x*x+z*z))*sy; m[6]=2*(y*z+x*w)*sy; m[7]=0;
      m[8]=2*(x*z+y*w)*sz; m[9]=2*(y*z-x*w)*sz; m[10]=(1-2*(x*x+y*y))*sz; m[11]=0;
      m[12]=px+this.t[0]-m[0]*px-m[4]*py-m[8]*pz;
      m[13]=py+this.t[1]-m[1]*px-m[5]*py-m[9]*pz;
      m[14]=pz+this.t[2]-m[2]*px-m[6]*py-m[10]*pz; m[15]=1;
      if (bone.parent >= 0) mul4(this.bones[bone.parent], m, this.bones[i]); else this.bones[i].set(m);
      this.done[i] = 1;
    };
    for (let i = 0; i < this.bones.length; i++) visit(i);
    return this.matrices;
  }
}
