// All hit testing and scrolling distances use screen pixels.
export function touchTokenAt(tokens,point,camera,canMove=()=>true){
  const scale=camera.scale,targets=[];
  for(let i=0;i<tokens.length;i++){
    const token=tokens[i];if(!canMove(token))continue;
    const left=camera.x+token.x*scale,top=camera.y+token.y*scale,w=token.w*scale,h=token.h*scale;
    const dx=Math.max(left-point.x,0,point.x-left-w),dy=Math.max(top-point.y,0,point.y-top-h);
    const distance=Math.hypot(dx,dy),paddingX=Math.max(0,(44-w)/2),paddingY=Math.max(0,(44-h)/2);
    if(point.x<left-paddingX||point.x>left+w+paddingX||point.y<top-paddingY||point.y>top+h+paddingY)continue;
    targets.push({token,distance,center:Math.hypot(point.x-left-w/2,point.y-top-h/2),index:i});
  }
  targets.sort((a,b)=>a.distance-b.distance||a.center-b.center||b.index-a.index);
  return targets[0]?.token||null;
}
export function edgeVelocity(point,width,height){
  const axis=(n,size)=>{
    const edge=Math.min(48,size/5);
    if(n<edge)return 480*Math.min(1,Math.max(0,(edge-n)/edge));
    if(n>size-edge)return -480*Math.min(1,Math.max(0,(n-size+edge)/edge));
    return 0;
  };
  return {x:axis(point.x,width),y:axis(point.y,height)};
}
export function dragPosition(drag,point,camera){
  return {x:drag.x+(point.x-drag.start.x+drag.cameraX-camera.x)/camera.scale,y:drag.y+(point.y-drag.start.y+drag.cameraY-camera.y)/camera.scale};
}
export function playerLink(location,code){return location.origin+location.pathname+'#join='+encodeURIComponent(code);}
export function qrMarkup(value){
  const qr=globalThis.qrcode(0,'M');qr.addData(value);qr.make();
  // The bundled encoder emits fixed SVG geometry only; user text is set by DOM.
  return qr.createSvgTag({cellSize:4,margin:16,scalable:true});
}
// Ephemeral presence is independent of saved scenes and private combat data.
export class MovePresence {
  constructor({scene,role,participants,publish,render,now=Date.now}){Object.assign(this,{scene,role,participants,publish,render,now});this.entries=new Map();}
  apply(actor,command){
    if(command?.type!=='moving')return null;
    const scene=this.scene();if(!scene||command.sceneId!==scene.id||typeof command.id!=='string'||typeof command.active!=='boolean')return false;
    const token=scene.tokens.find(t=>t.id===command.id);if(!token||(actor!=='dm'&&token.hidden))return false;
    const event={kind:'moving',sceneId:scene.id,actor,tokenId:token.id,active:command.active,name:actor==='dm'?'DM':this.participants().find(p=>p.id===actor)?.name||'Player'};
    this.receive(event);if(!token.hidden)this.publish(event);return true;
  }
  receive(event){
    const scene=this.scene();
    if(event?.kind!=='moving'||!scene||event.sceneId!==scene.id||typeof event.actor!=='string'||typeof event.active!=='boolean')return;
    if(event.active){if(!scene.tokens.some(t=>t.id===event.tokenId&&(!t.hidden||this.role()==='dm')))return;this.entries.set(event.actor,{tokenId:event.tokenId,name:String(event.name||'Player').slice(0,30),expires:this.now()+4000});}
    else if(this.entries.get(event.actor)?.tokenId===event.tokenId)this.entries.delete(event.actor);
    this.render();
  }
  prune(){
    const scene=this.scene(),online=new Set(['dm',...this.participants().filter(p=>p.online).map(p=>p.id)]);let dirty=false;
    for(const [actor,entry] of this.entries)if(entry.expires<=this.now()||!online.has(actor)||!scene?.tokens.some(t=>t.id===entry.tokenId&&(!t.hidden||this.role()==='dm'))){this.entries.delete(actor);dirty=true;}
    if(dirty)this.render();
  }
  names(tokenId){return [...this.entries.values()].filter(e=>e.tokenId===tokenId).map(e=>e.name);}
  clear(){this.entries.clear();this.render();}
}
