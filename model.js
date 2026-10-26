import {normalizeCombatToken,normalizeTerrain,normalizeEncounter,normalizeArea,movementCost,syncEncounter} from './combat.js?v=0.5.0';
// Shared data rules. Only the DM browser accepts commands and constructs player views.
import {TOKEN_ASSETS} from './tokens.js?v=0.5.0';
export const VERSION=3;
export const PALETTE=['#456d5d','#b66c47','#536d91','#896285','#b69b4e','#6c7970','#954e4a'];
export const DICE=[4,6,8,10,12,20,100];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const num=(n,f,a,b)=>Number.isFinite(Number(n))?clamp(Number(n),a,b):f;
const text=(s,max=60)=>typeof s==='string'?s.trim().slice(0,max):'';
export const uid=()=>crypto.randomUUID();
export function validImage(src,kind='token'){
  if(!src)return '';
  if(kind==='map'&&['./assets/vault.svg','./assets/woodland.svg'].includes(src))return src;
  if(kind==='token'&&TOKEN_ASSETS.has(src))return src;
  const max=kind==='map'?12_000_000:800_000;
  return typeof src==='string'&&src.length<=max&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)?src:'';
}
export function normalizeToken(raw,map,grid){
  const w=num(raw.w,grid.size,8,map.width),h=num(raw.h,grid.size,8,map.height);
  return {id:text(raw.id,80)||uid(),name:text(raw.name,40)||'Token',owner:text(raw.owner,80)||'dm',
    x:num(raw.x,0,0,Math.max(0,map.width-w)),y:num(raw.y,0,0,Math.max(0,map.height-h)),w,h,
    color:/^#[0-9a-f]{6}$/i.test(raw.color)?raw.color:PALETTE[0],image:validImage(raw.image),hidden:raw.hidden===true,party:raw.party===true,...normalizeCombatToken(raw)};
}
export function normalizeLoot(raw){
  if(!raw||typeof raw!=='object')return {title:'',visible:false,items:[]};
  return {title:text(raw.title,80),visible:raw.visible===true,items:(Array.isArray(raw.items)?raw.items:[]).slice(0,100).filter(i=>i&&typeof i==='object'&&text(i.name,80)).map(i=>({id:text(i.id,80)||uid(),name:text(i.name,80),quantity:Math.round(num(i.quantity,1,0,99999)),description:text(i.description,240)}))};
}
export function normalizeRoll(raw){
  if(!raw||!Array.isArray(raw.groups))return null;
  const groups=raw.groups.filter(g=>g&&DICE.includes(g.sides)&&Array.isArray(g.values)).slice(0,7).map(g=>({sides:g.sides,values:g.values.slice(0,100).filter(v=>Number.isInteger(v)&&v>=1&&v<=g.sides)})).filter(g=>g.values.length);
  if(!groups.length||groups.reduce((n,g)=>n+g.values.length,0)>100)return null;
  const modifier=Math.round(num(raw.modifier,0,-9999,9999));
  return {id:text(raw.id,80)||uid(),actor:text(raw.actor,80),name:text(raw.name,40)||'DM',at:num(raw.at,Date.now(),0,1e16),groups,modifier,total:groups.reduce((sum,g)=>sum+g.values.reduce((a,b)=>a+b,0),modifier),secret:raw.secret===true};
}
export function normalizeScene(raw){
  if(!raw||typeof raw!=='object'||!raw.map||!validImage(raw.map.src,'map'))throw new Error('invalid-map');
  const map={src:validImage(raw.map.src,'map'),width:num(raw.map.width,1280,64,4096),height:num(raw.map.height,896,64,4096)},g=raw.grid||{};
  const grid={enabled:g.enabled!==false,snap:g.snap!==false,size:num(g.size,64,12,500),x:num(g.x,0,-4096,4096),y:num(g.y,0,-4096,4096),color:/^#[0-9a-f]{6}$/i.test(g.color)?g.color:'#f5ebd2',opacity:num(g.opacity,.3,.05,1),line:num(g.line,1,.5,5)};
  const ids=new Set(),tokens=(Array.isArray(raw.tokens)?raw.tokens:[]).slice(0,1000).filter(x=>x&&typeof x==='object').map(x=>normalizeToken(x,map,grid)).filter(x=>{if(ids.has(x.id))return false;ids.add(x.id);return true;});
  const history=(Array.isArray(raw.history)?raw.history:[]).slice(-50).filter(e=>e&&typeof e.tokenId==='string'&&e.before&&e.after&&[e.before.x,e.before.y,e.after.x,e.after.y].every(Number.isFinite)).map(e=>({tokenId:e.tokenId,before:{x:e.before.x,y:e.before.y},after:{x:e.after.x,y:e.after.y},spentBefore:Number.isFinite(e.spentBefore)?e.spentBefore:null,spentAfter:Number.isFinite(e.spentAfter)?e.spentAfter:null}));
  const privateRolls=(Array.isArray(raw.privateRolls)?raw.privateRolls:[]).slice(-30).map(normalizeRoll).filter(r=>r?.secret);
  return {version:VERSION,id:text(raw.id,80)||uid(),name:text(raw.name,70)||'Map',map,grid,tokens,terrain:normalizeTerrain(raw.terrain,map,grid),areas:(Array.isArray(raw.areas)?raw.areas:[]).slice(0,100).map(a=>normalizeArea(a,map)).filter(Boolean),encounter:normalizeEncounter(raw.encounter),loot:normalizeLoot(raw.loot),history,privateRolls,updatedAt:num(raw.updatedAt,Date.now(),0,1e16),revision:num(raw.revision,0,0,1e12)};
}
function undoIndex(scene,allowHidden){
  for(let i=(scene.history?.length||0)-1;i>=0;i--){const h=scene.history[i],token=scene.tokens.find(t=>t.id===h.tokenId);if(token&&(allowHidden||!token.hidden)&&token.x===h.after.x&&token.y===h.after.y)return i;}
  return -1;
}
export const canUndoMove=(scene,allowHidden=false)=>undoIndex(scene,allowHidden)>=0;
export function undoMove(scene,allowHidden=false){
  const i=undoIndex(scene,allowHidden);if(i<0)return false;const entry=scene.history.splice(i,1)[0],token=scene.tokens.find(t=>t.id===entry.tokenId);if(entry.spentBefore!==null&&token.movement.spent===entry.spentAfter)token.movement.spent=entry.spentBefore;Object.assign(token,{x:clamp(entry.before.x,0,Math.max(0,scene.map.width-token.w)),y:clamp(entry.before.y,0,Math.max(0,scene.map.height-token.h))});return true;
}
export function playerView(scene,participants=[],rolls=[]){
  return {version:VERSION,id:scene.id,name:scene.name,map:{...scene.map},grid:{...scene.grid},
    tokens:scene.tokens.filter(t=>!t.hidden).map(t=>({id:t.id,name:t.name,owner:t.owner,x:t.x,y:t.y,w:t.w,h:t.h,color:t.color,image:t.image,hidden:false,party:!!t.party,statuses:structuredClone(t.statuses),initiative:t.party||t.owner!=='dm'?t.initiative:null,movement:t.party||t.owner!=='dm'?{...t.movement}:{limit:0,spent:0,private:true}})),
    terrain:structuredClone(scene.terrain),areas:structuredClone(scene.areas),encounter:{...scene.encounter,activeId:scene.tokens.some(t=>t.id===scene.encounter.activeId&&!t.hidden)?scene.encounter.activeId:null,order:scene.encounter.order.filter(id=>scene.tokens.some(t=>t.id===id&&!t.hidden))},
    loot:scene.loot?.visible?structuredClone(scene.loot):null,canUndo:canUndoMove(scene),
    rolls:rolls.filter(r=>r&&!r.secret).slice(-30).map(r=>structuredClone(r)),revision:scene.revision,
    participants:participants.map(p=>({id:p.id,name:p.name,online:!!p.online}))};
}
export function snapPosition(token,x,y,scene){const g=scene.grid;if(g.enabled&&g.snap){x=Math.round((x-g.x)/g.size)*g.size+g.x;y=Math.round((y-g.y)/g.size)*g.size+g.y;}return {x:clamp(x,0,Math.max(0,scene.map.width-token.w)),y:clamp(y,0,Math.max(0,scene.map.height-token.h))};}
export function moveToken(scene,token,x,y){
  if(!Number.isFinite(x)||!Number.isFinite(y))return false;const next=snapPosition(token,x,y,scene);
  if(token.x!==next.x||token.y!==next.y){const movement=movementCost(scene,token,next),spentBefore=token.movement.spent;if(movement.tracked)token.movement.spent+=movement.cost;scene.history||=[];scene.history.push({tokenId:token.id,before:{x:token.x,y:token.y},after:next,spentBefore,spentAfter:token.movement.spent});scene.history=scene.history.slice(-50);Object.assign(token,next);}return true;
}
export function uniqueTokenName(scene,name){const base=text(name,34)||'Token';if(!scene.tokens.some(t=>t.name===base))return base;let n=2;while(scene.tokens.some(t=>t.name===`${base} ${n}`))n++;return `${base} ${n}`;}
export function applyPlayerCommand(scene,actor,command){
  if(!actor||!command||typeof command!=='object')return false;
  if(command.type==='undo')return undoMove(scene,false);
  if(command.type==='add'){
    if(scene.tokens.length>=1000||!command.token||typeof command.token!=='object')return false;
    const t=normalizeToken({...command.token,id:uid(),owner:actor,hidden:false,name:uniqueTokenName(scene,command.token.name)},scene.map,scene.grid);Object.assign(t,snapPosition(t,t.x,t.y,scene));scene.tokens.push(t);return true;
  }
  const token=scene.tokens.find(t=>t.id===command.id&&!t.hidden);if(!token)return false;
  // All visible tokens can move, regardless of owner. Editing stays owner-only.
  if(command.type==='move')return moveToken(scene,token,command.x,command.y);
  if(token.owner!==actor)return false;
  if(command.type==='edit'){
    const f=command.token;if(!f||typeof f!=='object')return false;
    Object.assign(token,normalizeToken({...token,name:f.name,color:f.color,image:f.image,w:f.w,h:f.h,party:f.party},scene.map,scene.grid));return true;
  }
  if(command.type==='delete'){scene.tokens=scene.tokens.filter(t=>t.id!==token.id);syncEncounter(scene);return true;}
  return false;
}
export function measureDistance(points,gridSize){
  let squares=0;for(let i=1;i<points.length;i++)squares+=Math.max(Math.abs(points[i].x-points[i-1].x),Math.abs(points[i].y-points[i-1].y))/gridSize;
  return {squares:Math.round(squares*10)/10,feet:Math.round(squares*50)/10};
}
export function normalizePool(raw){
  if(!raw||typeof raw!=='object')throw new Error('invalid-pool');const groups=[];let count=0;
  for(const sides of DICE){const n=raw[sides]??0;if(!Number.isInteger(n)||n<0||n>100)throw new Error('invalid-pool');if(n){groups.push({sides,count:n});count+=n;}}
  if(count<1||count>100)throw new Error('invalid-pool');return groups;
}
export function randomDie(sides){
  const limit=Math.floor(4294967296/sides)*sides;let value;do{value=crypto.getRandomValues(new Uint32Array(1))[0];}while(value>=limit);return value%sides+1;
}
export function createRoll(pool,modifier,actor,name,secret=false,die=randomDie){
  if(!Number.isInteger(modifier)||Math.abs(modifier)>9999)throw new Error('invalid-pool');
  const groups=normalizePool(pool).map(g=>({sides:g.sides,values:Array.from({length:g.count},()=>die(g.sides))}));
  return normalizeRoll({id:uid(),actor,name,secret,at:Date.now(),groups,modifier});
}
export function normalizeTemplate(raw){
  if(!raw||typeof raw!=='object')throw new Error('invalid-template');
  return {id:text(raw.id,80)||uid(),name:text(raw.name,40)||'Token',group:'custom',image:validImage(raw.image),color:/^#[0-9a-f]{6}$/i.test(raw.color)?raw.color:PALETTE[0],wUnits:num(raw.wUnits,1,.1,512),hUnits:num(raw.hUnits,1,.1,512),party:raw.party===true};
}
export function carryParty(source,target){
  const party=source.tokens.filter(t=>t.party),ratio=target.grid.size/source.grid.size;
  const carriedIds=new Set(party.map(t=>t.id));target.history=(target.history||[]).filter(h=>!carriedIds.has(h.tokenId));
  for(let i=0;i<party.length&&target.tokens.length<1000;i++){
    const raw={...party[i],w:party[i].w*ratio,h:party[i].h*ratio,x:target.map.width/2+(i%4-2)*target.grid.size*2,y:target.map.height/2+Math.floor(i/4)*target.grid.size*2};
    const token=normalizeToken(raw,target.map,target.grid);Object.assign(token,snapPosition(token,token.x,token.y,target));
    const existing=target.tokens.findIndex(t=>t.id===token.id);if(existing>=0)target.tokens[existing]=token;else target.tokens.push(token);
  }
}
export function makeDemo(kind='vault'){
  const v=kind==='vault';return normalizeScene({id:'demo-'+kind,name:v?'Az elfeledett kripta':'A régi erdei ösvény',map:{src:`./assets/${v?'vault':'woodland'}.svg`,width:1280,height:896},grid:{size:64,color:v?'#f8eaca':'#f5f1dc',opacity:.22},tokens:[
    {id:uid(),name:'Liora',owner:'dm',x:512,y:v?576:448,w:64,h:64,color:PALETTE[0],image:'./assets/tokens/ranger.svg',party:true},
    {id:uid(),name:'Thorin',owner:'dm',x:576,y:v?576:512,w:64,h:64,color:PALETTE[1],image:'./assets/tokens/fighter.svg',party:true},
    {id:uid(),name:v?'Őrző':'Farkas',owner:'dm',x:768,y:192,w:128,h:128,color:PALETTE[6],hidden:true,image:`./assets/tokens/${v?'skeleton':'wolf'}.svg`}]});
}
