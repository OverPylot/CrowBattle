import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDemo} from '../model.js';
import {cellCenter,movementPoints,normalizeMeasurement} from '../measurement.js';
import {createFeatures} from '../features.js';

const ruler=(scene,extra={})=>({type:'measure',id:'gesture-1',sceneId:scene.id,measureKind:'measurement',points:[{x:5,y:5},{x:260,y:5}],final:true,...extra});
function harness(){
  const scene=makeDemo(),state={scene,role:'dm',myId:'dm',participants:[{id:'player',name:'Anna'}],roomActive:true};
  const nodes={'measure-layer':{innerHTML:'',replaceChildren(){this.innerHTML='';}},'measure-readout':{hidden:true,classList:{toggle(){}}},'measure-value':{textContent:''}};
  const sent=[];
  const features=createFeatures({state,$:id=>nodes[id],t:key=>key,esc:String,camera:()=>({scale:1}),language:()=> 'en',room:()=>({broadcastEvent:e=>sent.push(e)})});
  return {scene,state,nodes,sent,features};
}

test('measurements snap to cell centers with a shifted grid, including edges',()=>{
  const scene=makeDemo();assert.deepEqual(cellCenter({x:65,y:130},scene.grid,scene.map),{x:96,y:160});
  scene.grid.x=13;scene.grid.y=-7;
  assert.deepEqual(cellCenter({x:0,y:0},scene.grid,scene.map),{x:45,y:25});
  const p=cellCenter({x:99999,y:-100},scene.grid,scene.map);assert.ok(p.x<scene.map.width);assert.ok(p.y>0);
  scene.grid.enabled=false;scene.grid.snap=false;assert.deepEqual(cellCenter({x:0,y:0},scene.grid,scene.map),{x:45,y:25});
});
test('shared ruler distance is calculated on the host and forged distances are ignored',()=>{
  const scene=makeDemo(),event=normalizeMeasurement(scene,'player',ruler(scene,{feet:99999,squares:99999}));
  assert.deepEqual(event.points,[{x:32,y:32},{x:288,y:32}]);assert.equal(event.feet,20);assert.equal(event.squares,4);assert.equal(event.actor,'player');
  assert.equal(normalizeMeasurement(scene,'player',ruler(scene,{points:[{x:NaN,y:0},{x:0,y:0}]})),null);
  assert.equal(normalizeMeasurement(scene,'player',ruler(scene,{sceneId:'another-map'})),null);
});
test('movement uses an occupied cell center even for larger tokens',()=>{
  const scene=makeDemo(),token={x:128,y:192,w:128,h:128};
  assert.deepEqual(movementPoints(scene,token,{x:256,y:320}),[{x:160,y:224},{x:288,y:352}]);
  const actual=scene.tokens[0],event=normalizeMeasurement(scene,'player',{type:'measure',id:'movement-1',sceneId:scene.id,measureKind:'movement',tokenId:actual.id,to:{x:704,y:576},from:{x:999999,y:999999}});
  assert.equal(event.points[0].x,actual.x+32);assert.equal(event.private,false);
});
test('hidden token movement is rejected for players and never broadcast for the DM',()=>{
  const h=harness(),hidden=h.scene.tokens.find(t=>t.hidden);
  const cmd={type:'measure',id:'hidden-1',sceneId:h.scene.id,measureKind:'movement',tokenId:hidden.id,to:{x:64,y:64}};
  try{
    assert.equal(h.features.applyCommand('player',cmd),false);
    assert.equal(h.features.applyCommand('dm',cmd),true);assert.equal(h.sent.length,0);
    h.features.moveCommitted('dm',hidden,{...hidden,x:64,y:64});assert.equal(h.sent.length,0);
    assert.ok(h.nodes['measure-layer'].innerHTML.includes('measure-label-text'));
  }finally{h.features.clearMeasurement({all:true,notify:false});}
});
test('a player cannot clear another participant’s measurement',()=>{
  const h=harness();
  try{
    h.features.applyCommand('player',ruler(h.scene));assert.equal(h.sent.length,1);
    h.features.applyCommand('other',{type:'measure-clear',id:'gesture-1'});assert.equal(h.sent.length,1);
    assert.ok(h.nodes['measure-layer'].innerHTML.includes('data-actor="player"'));
    h.features.applyCommand('player',{type:'measure-clear',id:'gesture-1'});assert.equal(h.sent[1].kind,'measure-clear');assert.equal(h.nodes['measure-layer'].innerHTML,'');
  }finally{h.features.clearMeasurement({all:true,notify:false});}
});
test('hiding a token removes its public movement line without transmitting its new location',()=>{
  const h=harness(),token=h.scene.tokens[0];
  try{
    h.features.applyCommand('player',{type:'measure',id:'visible-1',sceneId:h.scene.id,measureKind:'movement',tokenId:token.id,to:{x:0,y:0}});assert.equal(h.sent.length,1);
    token.hidden=true;h.features.pruneMeasurements();assert.equal(h.sent.length,2);assert.equal(h.sent[1].kind,'measure-clear');assert.ok(!('points'in h.sent[1]));
    assert.equal(h.nodes['measure-layer'].innerHTML,'');
  }finally{h.features.clearMeasurement({all:true,notify:false});}
});
test('visible enemy movement shares its cost but excludes private budget numbers',()=>{
  const h=harness(),enemy=h.scene.tokens.find(t=>t.hidden);enemy.hidden=false;enemy.initiative=27;enemy.movement={limit:97,spent:52};h.scene.encounter={running:true,round:1,activeId:enemy.id,order:[enemy.id]};
  try{
    assert.equal(h.features.applyCommand('player',{type:'measure',id:'enemy-cost',sceneId:h.scene.id,measureKind:'movement',tokenId:enemy.id,to:{x:64,y:192}}),true);
    assert.equal(h.sent.length,1);assert.equal(h.sent[0].cost,55);assert.equal(h.sent[0].overBudget,true);assert.equal(h.sent[0].remaining,null);assert.ok(!('overspent' in h.sent[0]));
  }finally{h.features.clearMeasurement({all:true,notify:false});}
});
