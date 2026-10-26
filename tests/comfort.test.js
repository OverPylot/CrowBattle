import test from 'node:test';
import assert from 'node:assert/strict';
import {touchTokenAt,edgeVelocity,dragPosition,MovePresence,playerLink} from '../comfort.js';

test('touch selects a tiny visible token from a 44px target without expanding its artwork',()=>{
  const small={id:'small',x:100,y:100,w:20,h:20},hidden={...small,id:'secret',hidden:true};
  const tokens=[small,hidden],camera={x:0,y:0,scale:.5};
  assert.equal(touchTokenAt(tokens,{x:38,y:55},camera,t=>!t.hidden),small);
  assert.equal(touchTokenAt(tokens,{x:30,y:55},camera,t=>!t.hidden),null);
  assert.equal(small.w,20);
  const neighbor={...small,id:'neighbor',x:130};
  assert.equal(touchTokenAt([small,neighbor],{x:69,y:55},camera),neighbor);
});
test('edge scrolling keeps the grabbed position under the pointer and commits the panned distance',()=>{
  for(const scale of [.04,.5,1,6]){
    const camera={x:50,y:30,scale};
    const drag={x:100,y:80,start:{x:100*scale+50,y:80*scale+30},cameraX:50,cameraY:30};
    const point={x:790,y:300},velocity=edgeVelocity(point,800,600);
    assert.ok(velocity.x<0);assert.equal(velocity.y,0);
    const before=dragPosition(drag,point,camera);camera.x+=velocity.x;
    const after=dragPosition(drag,point,camera);
    assert.ok(after.x>before.x);
    assert.ok(Math.abs(after.x*scale+camera.x-point.x)<.00001);
    assert.equal(after.y,before.y);
  }
  assert.deepEqual(edgeVelocity({x:400,y:300},800,600),{x:0,y:0});
  assert.ok(edgeVelocity({x:1,y:1},390,786).x>0);
});
test('move presence attributes the authenticated participant, expires, and never shares hidden tokens',()=>{
  let now=0;const sent=[],scene={id:'map',tokens:[{id:'hero'},{id:'secret',hidden:true}]};
  let participants=[{id:'player',name:'Liora',online:true}];
  const p=new MovePresence({scene:()=>scene,role:()=> 'dm',participants:()=>participants,publish:e=>sent.push(e),render:()=>{},now:()=>now});
  assert.equal(p.apply('player',{type:'moving',sceneId:'map',id:'hero',active:true,name:'Forged DM'}),true);
  assert.deepEqual(p.names('hero'),['Liora']);assert.equal(sent[0].name,'Liora');
  assert.equal(p.apply('player',{type:'moving',sceneId:'map',id:'secret',active:true}),false);
  assert.equal(p.apply('dm',{type:'moving',sceneId:'map',id:'secret',active:true}),true);
  assert.equal(sent.length,1);assert.deepEqual(p.names('secret'),['DM']);
  p.apply('dm',{type:'moving',sceneId:'map',id:'secret',active:false});assert.deepEqual(p.names('secret'),[]);
  now=4001;p.prune();assert.deepEqual(p.names('hero'),[]);
  p.apply('player',{type:'moving',sceneId:'map',id:'hero',active:true});participants=[];p.prune();assert.deepEqual(p.names('hero'),[]);
  assert.equal(p.apply('player',{type:'moving',sceneId:'old-scene',id:'hero',active:true}),false);
});
test('presence clears when the token becomes hidden or leaves the scene',()=>{
  const scene={id:'map',tokens:[{id:'hero'}]};
  const p=new MovePresence({scene:()=>scene,role:()=> 'player',participants:()=>[{id:'a',online:true}],publish:()=>{},render:()=>{}});
  p.receive({kind:'moving',sceneId:'map',tokenId:'hero',actor:'a',active:true,name:'Alice'});
  scene.tokens[0].hidden=true;p.prune();assert.deepEqual(p.names('hero'),[]);
  p.receive({kind:'moving',sceneId:'map',tokenId:'hero',actor:'a',active:true,name:'Alice'});assert.deepEqual(p.names('hero'),[]);
});
test('QR join links retain GitHub Pages subpaths and omit DM secrets and query parameters',()=>{
  assert.equal(playerLink({origin:'https://example.github.io',pathname:'/CrowBattle/',search:'?secret=1',hash:'#dm=x&key=private'},'ABCD2345EFGH'),'https://example.github.io/CrowBattle/#join=ABCD2345EFGH');
});
