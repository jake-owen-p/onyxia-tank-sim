import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSim, idle, script, run } from './helpers.js';
import { FIXED_DT } from '../src/core/sim.js';
import { snapshot } from '../src/core/snapshot.js';
import { createInput } from '../src/input/input.js';
import { createKeybinds } from '../src/input/keybinds.js';
import { abilityButtons, actionLayout } from '../src/render/action-bar.js';
import { playerCombatAnimation, bossCombatAnimation } from '../src/render/combat-animation.js';
import { AssetPose, chooseClip } from '../src/render/gl/asset-pose.js';

const attack=sim=>sim.step({...idle(),abilities:['attack']},FIXED_DT);
const nearBoss=sim=>{
  const {player:p,boss:b}=sim.state.world;
  p.x=b.x; p.y=b.y-script.boss.radius-2; p.heading=Math.PI/2;
};

test('all roles have a single Attack action, including both tanks and healers',()=>{
  for (const role of ['tank','offtank','melee','ranged','healer']) {
    const sim=makeSim({role,manual:true,start:'wall'});
    assert.equal(sim.state.abilities.list.filter(id=>id==='attack').length,1);
    nearBoss(sim); attack(sim);
    assert.equal(sim.state.metrics.attacks,1,role);
    assert.equal(sim.state.abilities.lastUsed.kind,'attack');
  }
});

test('Attack can pull an idle boss and records a hit with its own animation time',()=>{
  const sim=makeSim({manual:true});nearBoss(sim);
  assert.equal(sim.state.world.boss.engaged,false);
  attack(sim);
  assert.equal(sim.state.world.boss.engaged,true);
  const action=sim.state.abilities.lastUsed;
  assert.equal(action.at,sim.state.t);
  assert.equal(action.target.on,'boss');
  assert.equal(sim.state.world.boss.lastDamagedAt,action.at);
  assert.ok(sim.state.threat.player>=script.playerAbilities.attack.threat);
  assert.deepEqual(playerCombatAnimation(sim.state),{attack:true,cast:false,actionProgress:0});
});

test('tank Attack is melee range and rejected attacks do not play a swing',()=>{
  const sim=makeSim({manual:true});const {player:p,boss:b}=sim.state.world;
  p.x=b.x; p.y=b.y-script.boss.radius-15;
  attack(sim);
  assert.equal(sim.state.abilities.lastUsed,null);
  assert.deepEqual(playerCombatAnimation(sim.state),{});
  assert.ok(sim.drainEvents().some(e=>e.type==='abilityFailed' && e.reason==='range'));
  nearBoss(sim);attack(sim);const at=sim.state.abilities.lastUsed.at;
  attack(sim);assert.equal(sim.state.abilities.lastUsed.at,at,'GCD rejection does not restart the clip');
  run(sim,1.6);nearBoss(sim);attack(sim);
  assert.ok(sim.state.abilities.lastUsed.at>at);
  assert.equal(playerCombatAnimation(sim.state).actionProgress,0);
});

test('control loss blocks attacks and healer attacks use the casting animation',()=>{
  const sim=makeSim({role:'healer',start:'wall',manual:true});nearBoss(sim);
  sim.state.world.player.stunnedUntil=sim.state.t+1;attack(sim);
  assert.equal(sim.state.abilities.lastUsed,null);
  sim.state.world.player.stunnedUntil=-Infinity;attack(sim);
  assert.equal(playerCombatAnimation(sim.state).cast,true);
  const saved=snapshot(sim.state);
  saved.abilities.lastUsed.target.x+=100;
  assert.notEqual(saved.abilities.lastUsed.target.x,sim.state.abilities.lastUsed.target.x);
  saved.abilities.lastUsed.target.x=sim.state.abilities.lastUsed.target.x;
  assert.deepEqual(playerCombatAnimation(saved),playerCombatAnimation(sim.state));
  saved.t+=1;assert.deepEqual(playerCombatAnimation(saved),{});
});

test('boss attack animations follow actual melee swings instead of engagement alone',()=>{
  const sim=makeSim({manual:true,start:'wall'});nearBoss(sim);
  sim.state.world.boss.lastHit=-Infinity;
  assert.deepEqual(bossCombatAnimation(sim.state,script),{});
  sim.state.world.boss.lastHit=sim.state.t;
  assert.equal(bossCombatAnimation(sim.state,script).actionProgress,0);
  sim.state.t+=1;assert.deepEqual(bossCombatAnimation(sim.state,script),{});
});

test('one-shot attack clips start at frame zero regardless of the render clock',()=>{
  const translation={times:[0,1000],values:[[0,0,0],[10,0,0]]};
  const meta={bones:[{parent:-1,pivot:[0,0,0]}],clips:{0:{duration:1000,tracks:[[null,null,null]]},17:{duration:1000,tracks:[[translation,null,null]]}}};
  const pose=new AssetPose(meta);
  pose.evaluate(123.45,{attack:true,actionProgress:0});assert.equal(pose.bones[0][12],0);
  pose.evaluate(456.78,{attack:true,actionProgress:.5});assert.equal(pose.bones[0][12],5);
  assert.equal(chooseClip({0:{},5:{},17:{}},{moving:true,attack:true,actionProgress:.3}),17);
});

test('pointer buttons queue commands through the same input path and respect pause',()=>{
  const input=createInput(null,createKeybinds(),{});
  input.pressAbility('attack');assert.deepEqual(input.poll().abilities,['attack']);
  assert.deepEqual(input.poll().abilities,[]);
  input.setEnabled(false);input.pressAbility('attack');assert.deepEqual(input.poll().abilities,[]);
  input.setEnabled(true);input.pressAbility('unknown');assert.deepEqual(input.poll().abilities,[]);
  input.destroy();
});

test('click targets stay aligned with desktop and mobile slots and expose cooldowns',()=>{
  const sim=makeSim({manual:true,start:'wall'});
  for (const [w,h] of [[1440,900],[390,844],[640,480]]) {
    const layout=actionLayout(w,h), slots=abilityButtons(sim.state,script,w,h,{attack:'2'});
    const button=slots.find(s=>s.id==='attack');assert.equal(button.label,'Attack (2)');
    assert.equal(button.size,layout.size);assert.ok(button.x>=0 && button.x+button.size<=w);
    assert.ok(button.y>=0 && button.y+button.size<=h);assert.equal(button.disabled,false);
  }
  nearBoss(sim);attack(sim);
  assert.equal(abilityButtons(sim.state,script,1440,900).find(s=>s.id==='attack').disabled,true);
});
