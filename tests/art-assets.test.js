import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { AssetPose, chooseClip, sampleTrack, posedBounds } from '../src/render/gl/asset-pose.js';

const root = new URL('../assets/wow/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json',root)));

test('local art includes every raid surface and the playable equipment', () => {
  const index=JSON.parse(readFileSync(new URL('../data/encounters/index.json',import.meta.url)));
  for (const raid of index.raids) for (const type of ['floor','wall']) assert.ok(manifest.surfaces[`${raid.id}-${type}`]);
  for (const key of ['tank','caster','rogue','onyxia','whelp','brazier','egg','stalagmite']) assert.ok(manifest.models[key]);
  for (const path of [...Object.values(manifest.surfaces),...Object.values(manifest.icons)]) assert.ok(existsSync(new URL(path,root)),path);
});

test('animation sampling interpolates, wraps global tracks and handles quaternion hemisphere changes', () => {
  const track={times:[0,1000],values:[[0,0,0],[10,20,30]],period:1000};
  assert.deepEqual([...sampleTrack(track,1500,new Float32Array(3),[0,0,0])],[5,10,15]);
  assert.deepEqual([...sampleTrack({...track,step:true},500,new Float32Array(3),[0,0,0])],[0,0,0]);
  const q={times:[0,1000],values:[[0,0,0,1],[0,0,0,-1]]};
  assert.deepEqual([...sampleTrack(q,500,new Float32Array(4),[0,0,0,1],true)],[0,0,0,1]);
  assert.equal(chooseClip({0:{},5:{},16:{}},{moving:true,attack:true}),5);
  assert.equal(chooseClip({0:{},51:{},135:{},193:{}},{airborne:true}),193);
  assert.equal(chooseClip({0:{},53:{},60:{}},{cast:true}),53);
});

test('bone hierarchy composes child motion around its original pivot', () => {
  const translate={times:[0],values:[[4,5,6]]};
  const meta={bones:[{parent:-1,pivot:[2,0,0]},{parent:0,pivot:[3,0,0]}],clips:{0:{duration:1000,tracks:[[translate,null,null],[translate,null,null]]}}};
  const pose=new AssetPose(meta);pose.evaluate(.2,{});
  assert.deepEqual([...pose.bones[1].slice(12,15)],[8,10,12]);
});

for (const [key,config] of Object.entries(manifest.models)) test(`converted ${key} has valid meshes, textures, equipment and animation`, () => {
  const meta=JSON.parse(readFileSync(new URL(config.model,root)));
  const bytes=readFileSync(new URL(config.model.replace('.json','.bin'),root));
  const binary=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
  const view=new DataView(binary), nv=view.getUint32(0,true), ni=view.getUint32(4+nv*40,true);
  assert.equal(nv,meta.vertexCount);assert.equal(ni,meta.indexCount);assert.equal(binary.byteLength,8+nv*40+ni*2);
  const indices=new Uint16Array(binary,8+nv*40);for (const i of indices) assert.ok(i<nv);
  assert.ok(meta.batches.length>0,'at least one visible draw batch');
  for (const b of meta.batches) { assert.ok(b.start+b.count<=ni);assert.equal(b.count%3,0);assert.ok(existsSync(new URL(meta.textures[b.texture].image,root))); }
  for (const item of config.equipment || []) { assert.ok(manifest.models[item.model]);assert.ok(meta.attachments[item.attachment]); }
  for (let i=0;i<nv;i++) for (let j=0;j<4;j++) if (view.getUint8(4+i*40+12+j)) assert.ok(view.getUint8(4+i*40+16+j)<meta.bones.length);
  const pose=new AssetPose(meta);
  for (const id of Object.keys(meta.clips)) {
    const single=new AssetPose({...meta,clips:{[id]:meta.clips[id]}});
    for (const t of [0,.18,1.2,10.5]) for (const x of single.evaluate(t,{})) assert.ok(Number.isFinite(x));
  }
  const bounds=posedBounds(meta,binary,pose.evaluate(0,{}));
  assert.ok(bounds.flat().every(Number.isFinite));assert.ok(bounds[1][2]>bounds[0][2]);
});
