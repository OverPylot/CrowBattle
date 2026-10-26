import {STATUS_CATALOG} from './conditions.js?v=0.5.0';
const ids=new Set(STATUS_CATALOG.map(s=>s.id));
const n=(v,d,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):d;
const finite=v=>typeof v==='number'&&Number.isFinite(v);
export function normalizeStatuses(raw){
  const found=new Map();for(const s of (Array.isArray(raw)?raw:[]).slice(0,100))if(s&&ids.has(s.id))found.set(s.id,Math.min(99,(found.get(s.id)||0)+Math.floor(n(s.count,1,1,99))));
  return [...found].map(([id,count])=>({id,count}));
}
export function normalizeCombatToken(raw){return {
  statuses:normalizeStatuses(raw.statuses),initiative:raw.initiative===null||raw.initiative===undefined||raw.initiative===''?null:Math.round(n(raw.initiative,0,-999,999)),
  movement:{limit:n(raw.movement?.limit,30,0,9999),spent:n(raw.movement?.spent,0,0,1e7),private:raw.movement?.private===true},
};}
export function normalizeTerrain(raw,map,grid){
  const seen=new Set();return (Array.isArray(raw)?raw:[]).slice(0,50000).filter(c=>Array.isArray(c)&&c.length===2&&c.every(Number.isInteger)&&c[0]*grid.size+grid.x<map.width&&(c[0]+1)*grid.size+grid.x>0&&c[1]*grid.size+grid.y<map.height&&(c[1]+1)*grid.size+grid.y>0).filter(c=>{const key=c.join(',');if(seen.has(key))return false;seen.add(key);return true;}).map(c=>[...c]);
}
export function normalizeEncounter(raw){return {running:raw?.running===true,round:Math.floor(n(raw?.round,1,1,99999)),activeId:typeof raw?.activeId==='string'?raw.activeId.slice(0,80):null,order:Array.isArray(raw?.order)?raw.order.filter(x=>typeof x==='string').slice(0,1000):[]};}
export function normalizeArea(raw,map){
  if(!raw||!['circle','cone','line'].includes(raw.shape))return null;
  return {id:typeof raw.id==='string'?raw.id.slice(0,80):crypto.randomUUID(),owner:typeof raw.owner==='string'?raw.owner.slice(0,80):'dm',shape:raw.shape,x:n(raw.x,0,0,map.width),y:n(raw.y,0,0,map.height),feet:n(raw.feet,20,5,500),width:n(raw.width,5,5,100),angle:n(raw.angle,60,15,180),rotation:n(raw.rotation,0,0,359),color:/^#[0-9a-f]{6}$/i.test(raw.color)?raw.color:'#b56ae0'};
}
export const initiativeOrder=scene=>scene.tokens.filter(t=>t.initiative!==null).sort((a,b)=>b.initiative-a.initiative).map(t=>t.id);
export function syncEncounter(scene){
  scene.encounter.order=initiativeOrder(scene);
  if(scene.encounter.running&&!scene.encounter.order.includes(scene.encounter.activeId)){
    scene.encounter.activeId=scene.encounter.order[0]||null;
    if(scene.encounter.activeId)resetMovement(scene,scene.encounter.activeId);else scene.encounter.running=false;
  }
}
export function resetMovement(scene,id){const token=scene.tokens.find(t=>t.id===id);if(token)token.movement.spent=0;scene.history=(scene.history||[]).filter(h=>h.tokenId!==id);}
// One straight grid path, 5 ft per entered square (including diagonals). Large tokens
// pay double once if any part of their footprint enters difficult terrain.
export function movementCost(scene,token,to){
  const g=scene.grid,size=g.size,start={x:Math.floor((token.x-g.x+1e-6)/size),y:Math.floor((token.y-g.y+1e-6)/size)},end={x:Math.floor((to.x-g.x+1e-6)/size),y:Math.floor((to.y-g.y+1e-6)/size)};
  const dx=end.x-start.x,dy=end.y-start.y,steps=Math.max(Math.abs(dx),Math.abs(dy)),terrain=new Set((scene.terrain||[]).map(c=>c.join(',')));
  const cols=Math.max(1,Math.ceil(token.w/size-1e-6)),rows=Math.max(1,Math.ceil(token.h/size-1e-6));let cost=0,difficult=0;
  for(let i=1;i<=steps;i++){
    const x=start.x+Math.round(dx*i/steps),y=start.y+Math.round(dy*i/steps);let hard=false;
    for(let c=0;terrain.size&&c<cols&&!hard;c++)for(let r=0;r<rows;r++)if(terrain.has(`${x+c},${y+r}`)){hard=true;break;}
    cost+=hard?10:5;if(hard)difficult++;
  }
  const tracked=!token.movement?.private&&scene.encounter?.running===true&&scene.encounter.order.includes(token.id),spent=token.movement?.spent||0,limit=token.movement?.limit??30;
  return {cost,difficult,tracked,spent:token.movement?.private?null:(tracked?spent+cost:cost),limit:token.movement?.private?null:limit,remaining:tracked?Math.max(0,limit-spent-cost):null,overBudget:tracked&&spent+cost>limit,overspent:tracked?Math.max(0,spent+cost-limit):0};
}
export function applyCombatCommand(scene,actor,cmd){
  if(!cmd||typeof cmd!=='object')return null;const dm=actor==='dm';
  if(cmd.type==='combat-stats'||cmd.type==='status'){
    const token=scene.tokens.find(t=>t.id===cmd.id&&(dm||!t.hidden));if(!token||(!dm&&token.owner!==actor))return false;
    if(cmd.type==='status'){
      if(!ids.has(cmd.status)||![-1,1].includes(cmd.delta))return false;
      const old=token.statuses.find(s=>s.id===cmd.status),count=(old?.count||0)+cmd.delta;
      token.statuses=token.statuses.filter(s=>s.id!==cmd.status);if(count>0)token.statuses.push({id:cmd.status,count:Math.min(99,count)});return true;
    }
    if(cmd.initiative!==null&&(!Number.isInteger(cmd.initiative)||Math.abs(cmd.initiative)>999))return false;
    if(!finite(cmd.limit)||cmd.limit<0||cmd.limit>9999)return false;
    token.initiative=cmd.initiative;token.movement.limit=cmd.limit;
    if(cmd.reset===true)resetMovement(scene,token.id);syncEncounter(scene);return true;
  }
  if(cmd.type==='encounter'){
    if(!dm||!['start','next','stop','reset'].includes(cmd.action))return false;
    syncEncounter(scene);const e=scene.encounter,order=e.order;
    if(cmd.action==='stop'){e.running=false;e.activeId=null;return true;}
    if(!order.length)return false;
    if(cmd.action==='start'||cmd.action==='reset'){
      e.running=true;e.round=1;e.activeId=order[0];for(const id of order)resetMovement(scene,id);return true;
    }
    if(!e.running)return false;const i=order.indexOf(e.activeId),next=(i+1)%order.length;e.activeId=order[next];if(next===0)e.round++;resetMovement(scene,e.activeId);return true;
  }
  if(cmd.type==='terrain'){
    if(!dm||!Array.isArray(cmd.cells)||cmd.cells.length>5000||typeof cmd.erase!=='boolean')return false;
    const cells=normalizeTerrain(cmd.cells,scene.map,scene.grid),all=new Map((scene.terrain||[]).map(c=>[c.join(','),c]));
    for(const c of cells)if(cmd.erase)all.delete(c.join(','));else if(all.size<50000)all.set(c.join(','),c);
    scene.terrain=[...all.values()];return true;
  }
  if(cmd.type==='terrain-clear'){if(!dm)return false;scene.terrain=[];return true;}
  if(cmd.type==='area-add'){
    if((scene.areas?.length||0)>=100)return false;const a=normalizeArea({...cmd.area,id:crypto.randomUUID(),owner:actor},scene.map);if(!a)return false;scene.areas.push(a);return true;
  }
  if(cmd.type==='area-edit'||cmd.type==='area-delete'){
    const i=scene.areas.findIndex(a=>a.id===cmd.id);if(i<0||(!dm&&scene.areas[i].owner!==actor))return false;
    if(cmd.type==='area-delete')scene.areas.splice(i,1);else{const a=normalizeArea({...scene.areas[i],...cmd.area,id:cmd.id,owner:scene.areas[i].owner},scene.map);if(!a)return false;scene.areas[i]=a;}return true;
  }
  return null;
}
