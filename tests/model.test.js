import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDemo,playerView,applyPlayerCommand,normalizeScene,snapPosition,validImage} from '../model.js';
import {generateCode,displayCode,cleanCode} from '../room.js';

test('the player view omits hidden tokens and all DM credentials',()=>{
  const scene=makeDemo();scene.dmKey='SECRET-DM-KEY';scene.room={code:'EXAMPLE',members:{'SECRET-MEMBER':{id:'one',name:'Anna'}}};
  const hidden=scene.tokens.find(t=>t.hidden);hidden.image='data:image/png;base64,SECRET';
  const view=playerView(scene,[{id:'one',name:'Anna',online:true,credential:'SECRET-CREDENTIAL'}]);
  assert.equal(view.tokens.length,2);assert.ok(!view.tokens.some(t=>t.id===hidden.id));
  const serialized=JSON.stringify(view);assert.ok(!serialized.includes('SECRET'));assert.ok(!serialized.includes(hidden.name));assert.ok(!('room' in view));assert.ok(!('dmKey' in view));
});
test('players can move visible tokens but cannot edit/delete someone else’s token or mutate the grid',()=>{
  const scene=makeDemo(),token=scene.tokens[0],before=JSON.stringify(scene);
  assert.equal(applyPlayerCommand(scene,'intruder',{type:'move',id:token.id,x:200,y:300}),true);
  assert.equal(token.x,192);assert.equal(token.y,320);
  const afterMove=JSON.stringify(scene);
  assert.equal(applyPlayerCommand(scene,'intruder',{type:'delete',id:token.id}),false);
  assert.equal(applyPlayerCommand(scene,'intruder',{type:'grid',grid:{size:999}}),false);
  assert.equal(JSON.stringify(scene),afterMove);
});
test('token creation assigns ownership and visibility, ignoring forged fields',()=>{
  const scene=makeDemo();assert.equal(applyPlayerCommand(scene,'anna',{type:'add',token:{name:'Ranger',owner:'dm',hidden:true,x:100,y:100,w:128,h:128,color:'#123456'}}),true);
  const token=scene.tokens.at(-1);assert.equal(token.owner,'anna');assert.equal(token.hidden,false);assert.equal(token.w,128);assert.equal(token.x,128);
});
test('a player can edit their token but cannot change ownership or reveal hidden tokens',()=>{
  const scene=makeDemo();applyPlayerCommand(scene,'anna',{type:'add',token:{name:'Ranger'}});const token=scene.tokens.at(-1);
  assert.equal(applyPlayerCommand(scene,'anna',{type:'edit',id:token.id,token:{...token,name:'Liora',owner:'dm',hidden:true,w:320,h:320}}),true);
  assert.equal(token.name,'Liora');assert.equal(token.owner,'anna');assert.equal(token.hidden,false);assert.equal(token.w,320);
  token.hidden=true;assert.equal(applyPlayerCommand(scene,'anna',{type:'move',id:token.id,x:0,y:0}),false);
  assert.equal(applyPlayerCommand(scene,'anna',{type:'edit',id:token.id,token:{hidden:false}}),false);
});
test('coordinates snap to the configured origin and remain within map bounds',()=>{
  const scene=makeDemo();scene.grid.x=10;scene.grid.y=20;
  assert.deepEqual(snapPosition({w:64,h:64},80,90,scene),{x:74,y:84});
  assert.deepEqual(snapPosition({w:64,h:64},1e8,-500,scene),{x:1216,y:0});
  scene.grid.snap=false;assert.deepEqual(snapPosition({w:64,h:64},80,90,scene),{x:80,y:90});
});
test('imports reject remote and active images and clean malformed dimensions',()=>{
  assert.equal(validImage('javascript:alert(1)','map'),'');assert.equal(validImage('https://example.com/secret.png','map'),'');assert.equal(validImage('data:image/svg+xml;base64,PHN2Zz4='),'');
  assert.throws(()=>normalizeScene({map:{src:'https://example.com/map.png'}}));
  const scene=normalizeScene({...makeDemo(),grid:{size:-1,opacity:99},tokens:[{id:'same',w:-1,h:1e8,x:Infinity,y:-1},{id:'same'}]});
  assert.equal(scene.grid.size,12);assert.equal(scene.grid.opacity,1);assert.equal(scene.tokens.length,1);assert.ok(scene.tokens[0].w>=8);assert.ok(scene.tokens[0].h<=scene.map.height);
});
test('malformed network commands cannot introduce invalid coordinates',()=>{
  const scene=makeDemo();scene.tokens[0].owner='anna';const token=scene.tokens[0];
  for(const x of [NaN,Infinity,'100',null])assert.equal(applyPlayerCommand(scene,'anna',{type:'move',id:token.id,x,y:10}),false);
});
test('room codes have twelve unambiguous random characters and round-trip formatting',()=>{
  const codes=new Set();for(let i=0;i<100;i++){const code=generateCode();assert.match(code,/^[A-HJ-NP-Z2-9]{12}$/);assert.equal(cleanCode(displayCode(code)),code);codes.add(code);}assert.equal(codes.size,100);
});
