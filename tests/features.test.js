import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDemo,playerView,moveToken,undoMove,canUndoMove,carryParty,createRoll,normalizePool,normalizeScene,normalizeTemplate,applyPlayerCommand,measureDistance} from '../model.js';
import {createFeatures} from '../features.js';
import {BUILTIN_TOKENS,TOKEN_ASSETS} from '../tokens.js';

test('any player may move a visible enemy but hidden enemies remain inaccessible',()=>{
  const scene=makeDemo();scene.tokens[0].party=false;
  assert.equal(applyPlayerCommand(scene,'new-player',{type:'move',id:scene.tokens[0].id,x:100,y:200}),true);
  const hidden=scene.tokens.find(t=>t.hidden),before=JSON.stringify(hidden);
  assert.equal(applyPlayerCommand(scene,'new-player',{type:'move',id:hidden.id,x:0,y:0}),false);
  assert.equal(JSON.stringify(hidden),before);
  assert.equal(applyPlayerCommand(scene,'new-player',{type:'edit',id:scene.tokens[0].id,token:{name:'Hacked'}}),false);
});
test('successive undo restores moves without leaking or undoing hidden moves for players',()=>{
  const scene=makeDemo(),token=scene.tokens[0],hidden=scene.tokens.find(t=>t.hidden),original={x:token.x,y:token.y};
  moveToken(scene,token,640,576);moveToken(scene,token,704,576);moveToken(scene,hidden,64,64);
  assert.equal(canUndoMove(scene),true);assert.equal(undoMove(scene),true);assert.equal(token.x,640);assert.equal(hidden.x,64);
  assert.equal(undoMove(scene),true);assert.deepEqual({x:token.x,y:token.y},original);assert.equal(canUndoMove(scene),false);
  assert.equal(undoMove(scene,true),true);assert.equal(hidden.x,768);
});
test('player projections omit private loot, private rolls, movement history and all credentials',()=>{
  const scene=makeDemo();scene.loot={title:'SECRET-LOOT',visible:false,items:[{id:'SECRET-ITEM',name:'Secret scroll',quantity:1,description:'secret'}]};
  scene.privateRolls=[createRoll({20:1},0,'dm','DM',true,()=>20)];scene.dmKey='SECRET-KEY';
  moveToken(scene,scene.tokens.find(t=>t.hidden),64,64);
  const view=playerView(scene,[],scene.privateRolls);const encoded=JSON.stringify(view);
  assert.equal(view.loot,null);assert.equal(view.rolls.length,0);assert.equal(view.canUndo,false);assert.ok(!encoded.includes('SECRET'));assert.ok(!('history'in view));assert.ok(!('privateRolls'in view));
  scene.loot.visible=true;assert.equal(playerView(scene).loot.items[0].name,'Secret scroll');
});
test('secret DM rolls persist locally and never invoke the public broadcast path',()=>{
  const scene=makeDemo(),s={scene,participants:[],sharedRolls:[],role:'dm'};let saves=0,broadcasts=0;
  const f=createFeatures({state:s,t:key=>key,toast:()=>{},persist:()=>saves++,changed:()=>broadcasts++});
  assert.equal(f.applyCommand('dm',{type:'roll',pool:{6:4},modifier:0,secret:true}),true);
  assert.equal(saves,1);assert.equal(broadcasts,0);assert.equal(scene.privateRolls.length,1);assert.equal(s.sharedRolls.length,0);
  assert.equal(f.applyCommand('player',{type:'roll',pool:{20:1},modifier:0,secret:true}),false);
  assert.equal(f.applyCommand('player',{type:'roll',pool:{20:1},modifier:0,secret:false}),true);assert.equal(broadcasts,1);assert.equal(s.sharedRolls.length,1);
  assert.equal(playerView(scene,[],s.sharedRolls).rolls.length,1);
});
test('stacked dice respect their counts, modifiers and total; invalid pools are rejected',()=>{
  const roll=createRoll({6:4,20:1},2,'anna','Anna',false,()=>3);
  assert.deepEqual(roll.groups.map(g=>[g.sides,g.values.length]),[[6,4],[20,1]]);assert.equal(roll.total,17);
  for(const pool of [{},{6:-1},{6:1.5},{6:101},{6:70,20:40}])assert.throws(()=>normalizePool(pool));
  assert.throws(()=>createRoll({20:1},Infinity,'a','a'));
});
test('party travel preserves identity, ownership, hidden state and relative token size',()=>{
  const source=makeDemo(),target=makeDemo('woodland');target.tokens=[];target.grid.size=32;source.tokens[0].hidden=true;
  carryParty(source,target);assert.equal(target.tokens.length,2);assert.equal(target.tokens[0].id,source.tokens[0].id);assert.equal(target.tokens[0].hidden,true);assert.equal(target.tokens[0].w,32);
  assert.equal(target.tokens[0].owner,source.tokens[0].owner);carryParty(source,target);assert.equal(target.tokens.length,2);assert.equal(playerView(target).tokens.length,1);
});
test('ruler measures orthogonal and diagonal square-grid paths in feet',()=>{
  assert.deepEqual(measureDistance([{x:0,y:0},{x:128,y:128}],64),{squares:2,feet:10});
  assert.deepEqual(measureDistance([{x:0,y:0},{x:128,y:0},{x:128,y:64}],64),{squares:3,feet:15});
});
test('old scenes gain safe defaults and token templates accept only bundled or raster images',()=>{
  const scene=makeDemo();delete scene.loot;delete scene.history;delete scene.privateRolls;scene.version=1;
  const migrated=normalizeScene(scene);assert.deepEqual(migrated.loot,{title:'',visible:false,items:[]});assert.deepEqual(migrated.history,[]);assert.deepEqual(migrated.privateRolls,[]);
  assert.equal(normalizeTemplate({name:'VIP',image:'./assets/tokens/vip.svg'}).image,'./assets/tokens/vip.svg');
  assert.equal(normalizeTemplate({image:'https://example.com/tracker.svg'}).image,'');
  assert.equal(BUILTIN_TOKENS.filter(x=>x.group==='heroes').length,12);assert.equal(BUILTIN_TOKENS.filter(x=>x.group==='vip').length,1);assert.equal(TOKEN_ASSETS.size,23);
});


test('travelling party tokens do not keep stale destination movement history',()=>{
  const source=makeDemo(),target=makeDemo('woodland');target.tokens=[];carryParty(source,target);
  moveToken(target,target.tokens[0],0,0);assert.equal(target.history.length,1);
  carryParty(source,target);assert.equal(target.history.length,0);
});


test('undo keeps a token inside the map even if it was resized after moving',()=>{
  const scene=makeDemo(),token=scene.tokens[0];moveToken(scene,token,128,384);token.w=1000;
  assert.equal(undoMove(scene,true),true);assert.equal(token.x,280);assert.ok(token.x+token.w<=scene.map.width);
});
