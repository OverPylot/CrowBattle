// Pure shared rules. The DM applies every player command before broadcasting a view.
export const VERSION = 1;
export const PALETTE = ['#456d5d','#b66c47','#536d91','#896285','#b69b4e','#6c7970','#954e4a'];
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const num = (n, fallback, a, b) => Number.isFinite(Number(n)) ? clamp(Number(n), a, b) : fallback;
const text = (s, max = 60) => typeof s === 'string' ? s.trim().slice(0, max) : '';
export const uid = () => crypto.randomUUID();
export function validImage(src, kind = 'token') {
  if (!src) return '';
  if (kind === 'map' && ['./assets/vault.svg','./assets/woodland.svg'].includes(src)) return src;
  const max = kind === 'map' ? 12_000_000 : 800_000;
  return typeof src === 'string' && src.length <= max && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src) ? src : '';
}
export function normalizeToken(raw, map, grid) {
  const width = num(raw.w, grid.size, 8, Math.max(8, map.width));
  const height = num(raw.h, grid.size, 8, Math.max(8, map.height));
  return {
    id: text(raw.id, 80) || uid(), name: text(raw.name, 40) || 'Token',
    owner: text(raw.owner, 80) || 'dm',
    x: num(raw.x, 0, 0, Math.max(0,map.width-width)),
    y: num(raw.y, 0, 0, Math.max(0,map.height-height)), w: width, h: height,
    color: /^#[0-9a-f]{6}$/i.test(raw.color) ? raw.color : PALETTE[0],
    image: validImage(raw.image), hidden: raw.hidden === true,
  };
}
export function normalizeScene(raw) {
  if (!raw || typeof raw !== 'object' || !raw.map || !validImage(raw.map.src, 'map')) throw new Error('invalid-map');
  const map = {src:validImage(raw.map.src,'map'),width:num(raw.map.width,1280,64,4096),height:num(raw.map.height,896,64,4096)};
  const g = raw.grid || {};
  const grid = {enabled:g.enabled!==false,snap:g.snap!==false,size:num(g.size,64,12,500),x:num(g.x,0,-4096,4096),y:num(g.y,0,-4096,4096),color:/^#[0-9a-f]{6}$/i.test(g.color)?g.color:'#f5ebd2',opacity:num(g.opacity,.3,.05,1),line:num(g.line,1,.5,5)};
  const tokens = (Array.isArray(raw.tokens)?raw.tokens:[]).slice(0,1000).filter(x=>x&&typeof x==='object').map(x=>normalizeToken(x,map,grid));
  const ids = new Set();
  return {version:VERSION,id:text(raw.id,80)||uid(),name:text(raw.name,70)||'Map',map,grid,tokens:tokens.filter(x=>{if(ids.has(x.id))return false;ids.add(x.id);return true;}),updatedAt:num(raw.updatedAt,Date.now(),0,1e16),revision:num(raw.revision,0,0,1e12)};
}
export function playerView(scene, participants = []) {
  return {
    version:VERSION,id:scene.id,name:scene.name,map:{...scene.map},grid:{...scene.grid},
    tokens:scene.tokens.filter(t=>!t.hidden).map(t=>({id:t.id,name:t.name,owner:t.owner,x:t.x,y:t.y,w:t.w,h:t.h,color:t.color,image:t.image,hidden:false})),
    revision:scene.revision,
    participants:participants.map(p=>({id:p.id,name:p.name,online:!!p.online})),
  };
}
export function snapPosition(token, x, y, scene) {
  const g = scene.grid;
  if (g.enabled && g.snap) {x=Math.round((x-g.x)/g.size)*g.size+g.x;y=Math.round((y-g.y)/g.size)*g.size+g.y;}
  return {x:clamp(x,0,Math.max(0,scene.map.width-token.w)),y:clamp(y,0,Math.max(0,scene.map.height-token.h))};
}
export function applyPlayerCommand(scene, actor, command) {
  if (!actor || !command || typeof command !== 'object') return false;
  if (command.type === 'add') {
    if(scene.tokens.length>=1000 || !command.token || typeof command.token!=='object') return false;
    const t = normalizeToken({...command.token,id:uid(),owner:actor,hidden:false},scene.map,scene.grid);
    Object.assign(t,snapPosition(t,t.x,t.y,scene));scene.tokens.push(t);return true;
  }
  const t = scene.tokens.find(t=>t.id===command.id && t.owner===actor && !t.hidden);
  if (!t) return false;
  if (command.type === 'move') {
    if (!Number.isFinite(command.x)||!Number.isFinite(command.y)) return false;
    Object.assign(t,snapPosition(t,command.x,command.y,scene));return true;
  }
  if (command.type === 'edit') {
    const fields = command.token;
    if(!fields || typeof fields!=='object')return false;
    const next = normalizeToken({...t,name:fields.name,color:fields.color,image:fields.image,w:fields.w,h:fields.h},scene.map,scene.grid);
    Object.assign(t,next);return true;
  }
  if (command.type === 'delete') {scene.tokens=scene.tokens.filter(x=>x.id!==t.id);return true;}
  return false;
}
export function makeDemo(kind = 'vault') {
  const isVault=kind==='vault';
  return normalizeScene({id:'demo-'+kind,name:isVault?'Az elfeledett kripta':'A régi erdei ösvény',map:{src:`./assets/${isVault?'vault':'woodland'}.svg`,width:1280,height:896},grid:{size:64,color:isVault?'#f8eaca':'#f5f1dc',opacity:.22},tokens:[
    {id:uid(),name:'Liora',owner:'dm',x:512,y:isVault?576:448,w:64,h:64,color:PALETTE[0]},
    {id:uid(),name:'Thorin',owner:'dm',x:576,y:isVault?576:512,w:64,h:64,color:PALETTE[1]},
    {id:uid(),name:isVault?'Őrző':'Farkas',owner:'dm',x:768,y:192,w:128,h:128,color:PALETTE[6],hidden:true},
  ]});
}
