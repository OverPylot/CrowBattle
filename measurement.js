import {movementCost} from './combat.js?v=0.4.2';
import {clamp,snapPosition,measureDistance} from './model.js?v=0.4.2';
export const MEASURE_FADE_MS=3000;
export const MEASURE_IDLE_MS=10000;
export const MEASURE_SEND_MS=100;
const validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
export function cellCenter(point,grid,map){
  function axis(value,offset,extent){
    const first=Math.ceil(-offset/grid.size-.5),last=Math.floor((extent-offset)/grid.size-.5);
    if(first>last)return extent/2;
    const index=clamp(Math.floor((value-offset)/grid.size),first,last);
    return offset+(index+.5)*grid.size;
  }
  return {x:axis(point.x,grid.x,map.width),y:axis(point.y,grid.y,map.height)};
}
export function movementPoints(scene,before,to){
  return [cellCenter({x:before.x+1e-6,y:before.y+1e-6},scene.grid,scene.map),cellCenter({x:to.x+1e-6,y:to.y+1e-6},scene.grid,scene.map)];
}
export function normalizeMeasurement(scene,actor,command){
  if(!scene||!command||command.sceneId!==scene.id||typeof command.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(command.id))return null;
  let points,tokenId,privateLine=false,movement={};
  if(command.measureKind==='movement'){
    const token=scene.tokens.find(t=>t.id===command.tokenId);
    if(!token||!validPoint(command.to)||(token.hidden&&actor!=='dm'))return null;
    const target=snapPosition(token,command.to.x,command.to.y,scene);
    movement=movementCost(scene,token,target);if(token.movement.private)movement={...movement,remaining:null};points=movementPoints(scene,token,target);tokenId=token.id;privateLine=!!token.hidden;
  }else if(command.measureKind==='measurement'){
    if(!Array.isArray(command.points)||command.points.length!==2||!command.points.every(validPoint))return null;
    points=command.points.map(p=>cellCenter(p,scene.grid,scene.map));
  }else return null;
  return {kind:'measure',id:command.id,actor,sceneId:scene.id,measureKind:command.measureKind,points,tokenId,private:privateLine,final:command.final===true,...measureDistance(points,scene.grid.size),...movement};
}
export function committedMovement(scene,actor,before,after,id){
  const points=movementPoints(scene,before,after),movement=movementCost(scene,before,after);if(before.movement.private)movement.remaining=null;
  return {kind:'measure',id,actor,sceneId:scene.id,measureKind:'movement',tokenId:after.id,points,private:!!(before.hidden||after.hidden),final:true,...measureDistance(points,scene.grid.size),...movement};
}
