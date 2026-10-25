import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDemo,normalizeScene,playerView,moveToken,undoMove} from '../model.js';
import {normalizeStatuses,movementCost,applyCombatCommand,normalizeTerrain} from '../combat.js';
import {committedMovement} from '../measurement.js';
const setup=()=>{const s=makeDemo(),a=s.tokens[0],b=s.tokens[1];Object.assign(a,{x:0,y:0,initiative:20});Object.assign(b,{x:0,y:128,initiative:10});applyCombatCommand(s,'dm',{type:'encounter',action:'start'});return {s,a,b};};
test('movement accumulates, permits overage, refunds undo and resets only at next own turn',()=>{
  const {s,a,b}=setup();moveToken(s,a,320,0);assert.equal(a.movement.spent,25);assert.equal(movementCost(s,a,{x:384,y:0}).remaining,0);assert.equal(movementCost(s,a,{x:384,y:0}).spent,30);assert.equal(movementCost(s,a,{x:384,y:0}).limit,30);
  const before=structuredClone(a);moveToken(s,a,448,0);assert.equal(a.movement.spent,35);assert.equal(committedMovement(s,'dm',before,a,'test').overBudget,true);
  assert.equal(undoMove(s,true),true);assert.equal(a.movement.spent,25);
  applyCombatCommand(s,'dm',{type:'encounter',action:'next'});assert.equal(s.encounter.activeId,b.id);assert.equal(a.movement.spent,25);
  applyCombatCommand(s,'dm',{type:'encounter',action:'next'});assert.equal(s.encounter.activeId,a.id);assert.equal(s.encounter.round,2);assert.equal(a.movement.spent,0);assert.equal(undoMove(s,true),false);
});
test('difficult terrain charges each entered square twice, overlaps once, diagonals and large footprints included',()=>{
  const {s,a}=setup();s.terrain=[[1,0],[1,0],[3,0]];assert.equal(movementCost(s,a,{x:256,y:0}).cost,30);
  s.terrain=[[1,1],[2,2]];assert.equal(movementCost(s,a,{x:128,y:128}).cost,20);
  a.w=128;a.h=128;s.terrain=[[2,1]];assert.equal(movementCost(s,a,{x:64,y:0}).cost,10);
  s.grid.x=13;s.grid.y=9;a.x=13;a.y=9;s.terrain=[[1,0]];assert.equal(movementCost(s,a,{x:77,y:9}).cost,10);
});
test('preparation movement does not spend budget and only DM advances combat or paints terrain',()=>{
  const s=makeDemo(),t=s.tokens[0];moveToken(s,t,0,0);assert.equal(t.movement.spent,0);
  assert.equal(applyCombatCommand(s,'p',{type:'terrain',cells:[[0,0]],erase:false}),false);
  assert.equal(applyCombatCommand(s,'p',{type:'encounter',action:'start'}),false);
  assert.equal(applyCombatCommand(s,'dm',{type:'terrain',cells:[[0,0],[0,0],[9999,0]],erase:false}),true);assert.deepEqual(s.terrain,[[0,0]]);
});
test('owners set initiative and stack markers, other players cannot alter them',()=>{
  const {s,a}=setup();a.owner='alice';
  assert.equal(applyCombatCommand(s,'bob',{type:'status',id:a.id,status:'poisoned',delta:1}),false);
  for(let i=0;i<2;i++)assert.equal(applyCombatCommand(s,'alice',{type:'status',id:a.id,status:'poisoned',delta:1}),true);
  assert.deepEqual(a.statuses,[{id:'poisoned',count:2}]);applyCombatCommand(s,'alice',{type:'status',id:a.id,status:'poisoned',delta:-1});assert.equal(a.statuses[0].count,1);
  assert.equal(applyCombatCommand(s,'alice',{type:'combat-stats',id:a.id,initiative:99,limit:30}),true);assert.equal(s.encounter.order[0],a.id);
  assert.equal(applyCombatCommand(s,'alice',{type:'combat-stats',id:a.id,initiative:'evil',limit:30}),false);
});
test('hidden enemies and private numeric enemy statistics never enter player projections',()=>{
  const {s,a}=setup(),enemy=s.tokens[2];enemy.initiative=999;enemy.movement={limit:987,spent:654};s.encounter.order=[enemy.id,a.id];s.encounter.activeId=enemy.id;enemy.statuses=[{id:'poisoned',count:8}];
  let v=playerView(s);assert.ok(!JSON.stringify(v).includes(enemy.id));assert.equal(v.encounter.activeId,null);
  enemy.hidden=false;v=playerView(s);const e=v.tokens.find(t=>t.id===enemy.id);assert.equal(e.initiative,null);assert.deepEqual(e.movement,{limit:0,spent:0,private:true});assert.equal(e.statuses[0].count,8);
});
test('spell areas enforce ownership, normalize dimensions and persist through backup normalization',()=>{
  const {s}=setup();assert.equal(applyCombatCommand(s,'alice',{type:'area-add',area:{shape:'cone',feet:30,rotation:90,x:128,y:128,owner:'dm'}}),true);
  const a=s.areas[0];assert.equal(a.owner,'alice');assert.equal(applyCombatCommand(s,'bob',{type:'area-delete',id:a.id}),false);
  assert.equal(applyCombatCommand(s,'alice',{type:'area-edit',id:a.id,area:{feet:1e9,owner:'bob'}}),true);assert.equal(s.areas[0].owner,'alice');assert.equal(s.areas[0].feet,500);
  s.tokens[0].statuses=[{id:'burning',count:2}];const reloaded=normalizeScene(JSON.parse(JSON.stringify(s)));assert.equal(reloaded.areas.length,1);assert.equal(reloaded.encounter.running,true);assert.equal(reloaded.tokens[0].statuses[0].count,2);
  assert.deepEqual(normalizeStatuses([{id:'evil',count:1},{id:'burning',count:90},{id:'burning',count:90}]),[{id:'burning',count:99}]);
});
