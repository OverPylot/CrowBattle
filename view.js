// Sizes are screen pixels. World-space transforms only place the decorations.
export const MIN_ZOOM=.04;
export const MAX_ZOOM=6;
const bounded=(n,a,b)=>Math.max(a,Math.min(b,n));
export const safeZoom=value=>Number.isFinite(value)?bounded(value,MIN_ZOOM,MAX_ZOOM):1;
export const LABEL_LIMITS=Object.freeze({name:[10,13],movement:[9,12],initials:[12,32],marker:[12,18],counter:[8,10],hidden:[14,20],measurement:[10,12]});
export function viewportBox(camera,width,height){
  const scale=safeZoom(camera.scale),x=Number.isFinite(camera.x)?camera.x:0,y=Number.isFinite(camera.y)?camera.y:0;
  return [-x/scale,-y/scale,Math.max(1,Number.isFinite(width)?width:1)/scale,Math.max(1,Number.isFinite(height)?height:1)/scale];
}
export function tokenLabelMetrics(token,zoom){
  const scale=safeZoom(zoom),side=Math.min(Number.isFinite(token.w)?token.w:64,Number.isFinite(token.h)?token.h:64)*scale;
  const limit=(kind,value)=>bounded(value,...LABEL_LIMITS[kind]);
  return {scale,inverse:1/scale,name:limit('name',side*.18),movement:limit('movement',side*.15),initials:limit('initials',side*.32),marker:limit('marker',side*.28),counter:limit('counter',side*.16),hidden:limit('hidden',side*.3),slots:side<40?1:side<60?2:3};
}
export function measurementLabelMetrics(zoom,movement){
  const font=bounded((movement?10:11)*Math.sqrt(safeZoom(zoom)),...LABEL_LIMITS.measurement);
  return {font,height:font+(movement?10:12),maxWidth:movement?180:320};
}
// Coalesce wheel/pinch/pan bursts; only one DOM update may wait for a frame.
export function createFrameScheduler(render,request=globalThis.requestAnimationFrame,cancel=globalThis.cancelAnimationFrame){
  let pending=null;
  return {schedule(){if(pending===null)pending=request(()=>{pending=null;render();});},flush(){if(pending!==null){cancel(pending);pending=null;}render();}};
}
