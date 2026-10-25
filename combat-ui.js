import {tokenLabelMetrics,safeZoom} from './view.js?v=0.4.2';
import {STATUS_CATALOG,statusIcon} from './conditions.js?v=0.4.2';
import {initiativeOrder,normalizeArea} from './combat.js?v=0.4.2';
export function createCombatUI(ctx){
  const {$,esc,icon,modal,closeModal,field,submitButton,cancelButton,state}=ctx;
  const L=(hu,en)=>ctx.language()==='hu'?hu:en;
  let panel=false,statusToken=null,pendingArea=null,stroke=null,lastPaintScale=null;
  const owns=t=>state.role==='dm'||t.owner===state.myId;
  const token=()=>state.scene?.tokens.find(t=>t.id===state.selected);
  const footer=()=>cancelButton()+submitButton(L('Mentés','Save'));
  function hide(){panel=false;$('combat-panel').hidden=true;}
  function openPanel(){ctx.hideFeatures();panel=true;renderPanel();}
  function renderPanel(){
    if(!panel||!state.scene)return;const s=state.scene,e=s.encounter,dm=state.role==='dm',order=dm?initiativeOrder(s):e.order,active=s.tokens.find(t=>t.id===e.activeId);
    $('combat-panel').hidden=false;$('combat-panel').innerHTML=`<div class="panel-head"><h2>${icon('combat')}${L('Harckövető','Encounter')}</h2><button class="icon-button" data-action="combat-close" aria-label="${L('Bezárás','Close')}">${icon('x')}</button></div><div class="panel-content"><div class="encounter-heading"><span>${e.running?L('KÖR','ROUND')+' '+e.round:L('ELŐKÉSZÍTÉS','PREPARATION')}</span><strong>${e.running?esc(active?.name||L('A DM köre','DM turn')):L('Kezdeményezés szerint','Initiative order')}</strong></div>${dm?`<div class="panel-actions">${!e.running?`<button class="button primary" data-action="encounter-action" data-kind="start" ${!order.length?'disabled':''}>${L('Harc indítása','Start encounter')}</button>`:`<button class="button primary" data-action="encounter-action" data-kind="next">${L('Következő','Next turn')} →</button><button class="button secondary" data-action="encounter-action" data-kind="stop">${L('Befejezés','End')}</button>`}</div>`:''}<ol class="encounter-list">${order.map((id,i)=>{const t=s.tokens.find(t=>t.id===id);if(!t)return '';return `<li class="${e.running&&id===e.activeId?'active':''}"><button data-action="token-combat" data-id="${esc(id)}"><span class="initiative-number">${t.initiative??'—'}</span><span><strong>${esc(t.name)}${t.hidden?' ◌':''}</strong><small>${e.running&&!t.movement.private?`${Math.max(0,t.movement.limit-t.movement.spent)} / ${t.movement.limit} ${L('láb maradt','ft remaining')}`:L('Token beállításai','Token settings')}</small></span>${e.running&&id===e.activeId?'<b>▶</b>':`<small>${i+1}.</small>`}</button></li>`;}).join('')}</ol><p class="panel-copy">${L('A tokenre kattintva add meg a kezdeményezést. Azonos értéknél a térkép tokenjeinek sorrendje dönt.','Click a token to set its initiative. Ties follow the map’s token order.')}</p><p class="panel-copy">${L('Mozgást csak az aktív harc résztvevőinél számolunk. Saját körük elején visszatöltődik a keret.','Movement is tracked for encounter participants while combat is running. Their budget resets at the start of their own turn.')}</p></div>`;
  }
  function statusRows(){
    const t=state.scene?.tokens.find(t=>t.id===statusToken);if(!t||!$('status-list'))return;
    $('status-list').innerHTML=STATUS_CATALOG.map(s=>{const count=t.statuses.find(x=>x.id===s.id)?.count||0;return `<div class="status-row ${count?'on':''}"><span class="condition-icon" style="--condition-color:${s.color}">${statusIcon(s.id)}</span><strong>${esc(ctx.language()==='hu'?s.hu:s.en)}</strong><button type="button" class="icon-button" data-action="status-change" data-status="${s.id}" data-delta="-1" aria-label="${esc(ctx.language()==='hu'?s.hu:s.en)} −" ${!owns(t)||!count?'disabled':''}>${icon('minus')}</button><b>${count}</b><button type="button" class="icon-button" data-action="status-change" data-status="${s.id}" data-delta="1" aria-label="${esc(ctx.language()==='hu'?s.hu:s.en)} +" ${!owns(t)||count>=99?'disabled':''}>${icon('plus')}</button></div>`;}).join('');
  }
  function stats(id){
    const t=state.scene.tokens.find(t=>t.id===(id||state.selected));if(!t)return;state.selected=t.id;ctx.renderTokens();statusToken=t.id;const editable=owns(t),privateStats=t.movement.private;
    modal(t.name,`<p class="modal-copy">${L('Kezdeményezés és mozgás','Initiative and movement')}</p>${privateStats?`<p class="info-box">${L('Az ellenfél részletes harci adatait a DM kezeli.','The DM manages this opponent’s combat details.')}</p>`:`<div class="form-grid">${field(L('Kezdeményezés (üres = kimarad)','Initiative (blank = excluded)'),'combat-initiative',t.initiative??'','number',`min="-999" max="999" step="1" ${!editable?'disabled':''}`)}${field(L('Mozgáskeret / kör (láb)','Movement / turn (ft)'),'combat-speed',t.movement.limit,'number',`required min="0" max="9999" step="1" ${!editable?'disabled':''}`)}</div><div class="movement-summary">${L('Elköltve','Spent')}: <b>${t.movement.spent}</b> · ${L('Maradt','Remaining')}: <b>${Math.max(0,t.movement.limit-t.movement.spent)} ${L('láb','ft')}</b>${t.movement.spent>t.movement.limit?` <span class="over-budget">(+${t.movement.spent-t.movement.limit})</span>`:''}</div>${editable?`<label class="check-field"><input type="checkbox" id="combat-reset"><span>${L('Mozgáskeret visszatöltése most','Reset movement now')}</span></label>`:''}`}<h3 class="status-heading">${L('Állapotjelölők','Status markers')}</h3><p class="field-caption">${L('A + gomb halmozza, a − elvesz egyet. A jelölők nem módosítják automatikusan a szabályokat.','Use + to stack and − to remove one. Markers do not automate condition rules.')}</p><div id="status-list"></div>`,editable?footer():`<button type="button" class="button primary" data-action="close-modal">${L('Kész','Done')}</button>`,()=>{
      const v=$('combat-initiative').value,initiative=v===''?null:Number(v),limit=Number($('combat-speed').value);if(ctx.commitCommand({type:'combat-stats',id:t.id,initiative,limit,reset:$('combat-reset').checked}))closeModal();
    });statusRows();
  }
  function terrainModal(){
    if(state.role!=='dm')return;
    modal(L('Nehéz terep','Difficult terrain'),`<p class="modal-copy">${L('Fesd be a nehéz terep mezőit. Egy ilyen mezőre lépés 10 láb mozgásba kerül az 5 helyett. Átlapolódás nem növeli tovább a költséget.','Paint difficult terrain cells. Entering one costs 10 ft instead of 5 ft. Overlapping terrain does not increase the cost further.')}</p><div class="terrain-example"><span></span>${L('Jelenleg','Currently')}: ${state.scene.terrain.length} ${L('mező','cells')}</div><div class="panel-actions"><button type="button" class="button primary" data-action="terrain-mode" data-mode="terrain-paint">${L('Festés','Paint')}</button><button type="button" class="button secondary" data-action="terrain-mode" data-mode="terrain-erase">${L('Radír','Erase')}</button></div><p class="field-caption">${L('Egy ujjal festesz, két ujjal nagyítasz. A Kész gomb visszavált a tokenek mozgatására.','Paint with one finger, pinch with two fingers. Done returns to token movement.')}</p>`,`<button type="button" class="button secondary danger" data-action="terrain-clear">${L('Összes törlése','Clear all')}</button><button type="button" class="button primary" data-action="close-modal">${L('Bezárás','Close')}</button>`);
  }
  function areaForm(id){
    const a=state.scene.areas.find(a=>a.id===id),editable=!a||state.role==='dm'||a.owner===state.myId;
    if(!editable)return;const current=a||{shape:'circle',feet:20,width:5,angle:60,rotation:0,color:'#b56ae0'};
    const options=[['circle',L('Kör (sugár)','Circle (radius)')],['cone',L('Kúp','Cone')],['line',L('Vonal','Line')]];
    modal(a?L('Varázsterület szerkesztése','Edit spell area'):L('Új varázsterület','New spell area'),`<label><span>${L('Alakzat','Shape')}</span><select id="area-shape">${options.map(([v,label])=>`<option value="${v}" ${v===current.shape?'selected':''}>${label}</option>`).join('')}</select></label><div class="form-grid">${field(L('Sugár / hossz (láb)','Radius / length (ft)'),'area-feet',current.feet,'number','required min="5" max="500" step="5"')}${field(L('Vonal szélessége (láb)','Line width (ft)'),'area-width',current.width,'number','required min="5" max="100" step="5"')}${field(L('Kúp szöge (fok)','Cone angle (degrees)'),'area-angle',current.angle,'number','required min="15" max="180" step="1"')}${field(L('Forgatás (fok)','Rotation (degrees)'),'area-rotation',current.rotation,'number','required min="0" max="359" step="1"')}${field(L('Szín','Color'),'area-color',current.color,'color')}</div><p class="field-caption">${L('Mentés után bökj a térképre a kör közepéhez vagy a kúp/vonal kezdőpontjához. A 0° jobbra mutat.','After placement, tap the map for the circle center or cone/line origin. 0° points right.')}</p>`,cancelButton()+submitButton(a?L('Mentés','Save'):L('Elhelyezés a térképen','Place on map'))+(a?`<button type="button" class="button secondary" data-action="area-relocate" data-id="${esc(id)}">${L('Áthelyezés','Move')}</button>`:''),()=>{
      const values=areaValues(current);if(a){ctx.commitCommand({type:'area-edit',id:a.id,area:values});closeModal();}else{pendingArea={area:values};closeModal();ctx.hideFeatures();hide();ctx.setTool('area-place');modeHint();}
    });
    const shapeFields=()=>{const shape=$('area-shape').value;$('area-width').closest('label').hidden=shape!=='line';$('area-angle').closest('label').hidden=shape!=='cone';$('area-feet').closest('label').querySelector('span').textContent=shape==='circle'?L('Sugár (láb)','Radius (ft)'):L('Hossz (láb)','Length (ft)');};shapeFields();$('area-shape').onchange=shapeFields;
  }
  function areaValues(base){return {...base,shape:$('area-shape').value,feet:Number($('area-feet').value),width:Number($('area-width').value),angle:Number($('area-angle').value),rotation:Number($('area-rotation').value),color:$('area-color').value};}
  function areas(){
    modal(L('Varázsterületek','Spell areas'),`<button type="button" class="button primary" data-action="area-new">${icon('plus')}${L('Új terület','New area')}</button><div class="area-list">${state.scene.areas.map(a=>`<div><span class="area-dot" style="background:${a.color}"></span><strong>${L({circle:'Kör',cone:'Kúp',line:'Vonal'}[a.shape],{circle:'Circle',cone:'Cone',line:'Line'}[a.shape])} · ${a.feet} ${L('láb','ft')}</strong>${state.role==='dm'||a.owner===state.myId?`<button type="button" class="icon-button" data-action="area-edit-form" data-id="${esc(a.id)}" aria-label="${L('Szerkesztés','Edit')}">${icon('token')}</button><button type="button" class="icon-button danger" data-action="area-delete" data-id="${esc(a.id)}" aria-label="${L('Törlés','Delete')}">${icon('trash')}</button>`:''}</div>`).join('')||`<p class="empty-note">${L('Még nincs varázsterület.','No spell areas yet.')}</p>`}</div>`,`<button type="button" class="button primary" data-action="close-modal">${L('Kész','Done')}</button>`);
  }
  function modeHint(){
    const tool=state.tool,active=['terrain-paint','terrain-erase','area-place'].includes(tool);$('paint-mode').hidden=!active;
    $('paint-mode-label').textContent=tool==='area-place'?L('Bökj az elhelyezéshez','Tap to place'):tool==='terrain-erase'?L('Nehéz terep törlése','Erase difficult terrain'):L('Nehéz terep festése','Paint difficult terrain');
  }
  function pointCell(p){const g=state.scene.grid;return [Math.floor((p.x-g.x)/g.size),Math.floor((p.y-g.y)/g.size)];}
  function paintPoint(p){
    const cell=pointCell(p),last=stroke.last||cell,dx=cell[0]-last[0],dy=cell[1]-last[1],steps=Math.max(Math.abs(dx),Math.abs(dy),1);
    for(let i=0;i<=steps&&stroke.cells.size<5000;i++){const c=[last[0]+Math.round(dx*i/steps),last[1]+Math.round(dy*i/steps)];stroke.cells.set(c.join(','),c);}stroke.last=cell;renderOverlay();
  }
  function pointerDown(p){
    if(state.tool==='area-place'&&pendingArea){
      const g=state.scene.grid,x=g.x+(Math.floor((p.x-g.x)/g.size)+.5)*g.size,y=g.y+(Math.floor((p.y-g.y)/g.size)+.5)*g.size;
      ctx.commitCommand(pendingArea.id?{type:'area-edit',id:pendingArea.id,area:{...pendingArea.area,x,y}}:{type:'area-add',area:{...pendingArea.area,x,y}});pendingArea=null;ctx.setTool('select');modeHint();return true;
    }
    if(state.role==='dm'&&['terrain-paint','terrain-erase'].includes(state.tool)){stroke={cells:new Map(),last:null,erase:state.tool==='terrain-erase'};paintPoint(p);return true;}return false;
  }
  function pointerMove(p){if(stroke)paintPoint(p);}
  function pointerEnd(cancel=false){if(stroke){const old=stroke;stroke=null;if(!cancel)ctx.commitCommand({type:'terrain',cells:[...old.cells.values()],erase:old.erase});renderOverlay();}}
  function renderOverlay(){
    const s=state.scene;if(!s)return;const g=s.grid,size=g.size,cells=new Map(s.terrain.map(c=>[c.join(','),c]));
    if(stroke)for(const [key,c] of stroke.cells)if(stroke.erase)cells.delete(key);else cells.set(key,c);
    $('terrain-layer').innerHTML=`<defs><clipPath id="terrain-map-clip"><rect width="${s.map.width}" height="${s.map.height}"/></clipPath><pattern id="terrain-hatch" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M-3 3 3-3M0 12 12 0M9 15 15 9" stroke="#ffd68c" stroke-opacity=".48" stroke-width="2"/></pattern></defs><g clip-path="url(#terrain-map-clip)">${[...cells.values()].map(([x,y])=>`<rect x="${g.x+x*size}" y="${g.y+y*size}" width="${size}" height="${size}" fill="#ad662d" fill-opacity=".3"/><rect x="${g.x+x*size}" y="${g.y+y*size}" width="${size}" height="${size}" fill="url(#terrain-hatch)" stroke="#e8b46a" stroke-opacity=".6" stroke-width="1"/>`).join('')}</g>`;
    $('area-layer').innerHTML=`<defs><clipPath id="area-map-clip"><rect width="${s.map.width}" height="${s.map.height}"/></clipPath></defs><g clip-path="url(#area-map-clip)">`+s.areas.map(a=>{
      const length=a.feet/5*size,width=a.width/5*size,angle=a.angle*Math.PI/180,shape=a.shape==='circle'?`<circle r="${length}"/>`:a.shape==='line'?`<rect x="0" y="${-width/2}" width="${length}" height="${width}"/>`:`<path d="M0 0 L${length*Math.cos(-angle/2)} ${length*Math.sin(-angle/2)} A${length} ${length} 0 0 1 ${length*Math.cos(angle/2)} ${length*Math.sin(angle/2)} Z"/>`;
      return `<g transform="translate(${a.x} ${a.y}) rotate(${a.rotation})" fill="${a.color}" fill-opacity=".24" stroke="${a.color}" stroke-width="2" vector-effect="non-scaling-stroke">${shape}<circle r="4" fill="${a.color}" fill-opacity="1"/></g>`;
    }).join('')+'</g>';
  }
  function sizeToken(t,el){
    const metrics=tokenLabelMetrics(t,ctx.camera().scale),{scale,inverse,slots}=metrics,factor=metrics.marker/19;
    el.style.fontSize=metrics.initials*inverse+'px';el.style.borderWidth=Math.max(1,Math.min(3,Math.min(t.w,t.h)*scale/24))*inverse+'px';
    el.style.setProperty('--badge-scale',inverse);el.style.setProperty('--marker-scale',factor*inverse);el.style.setProperty('--movement-scale',inverse);
    el.style.setProperty('--name-font',metrics.name+'px');el.style.setProperty('--movement-font',metrics.movement+'px');el.style.setProperty('--counter-font',metrics.counter/factor+'px');el.style.setProperty('--hidden-size',metrics.hidden+'px');
    el.style.setProperty('--token-outline',3*inverse+'px');el.style.setProperty('--token-outline-offset',3*inverse+'px');
    el.style.setProperty('--token-shadow',`0 ${2*inverse}px ${5*inverse}px #0007`);
    const badges=el.querySelector('.token-badges');if(!badges||badges.dataset.slots===String(slots))return;
    badges.dataset.slots=slots;badges.replaceChildren();
    for(const item of t.statuses.slice(0,slots)){const s=STATUS_CATALOG.find(s=>s.id===item.id);if(!s)continue;const b=document.createElement('span');b.className='condition-badge';b.style.setProperty('--condition-color',s.color);b.title=(ctx.language()==='hu'?s.hu:s.en)+(item.count>1?' ×'+item.count:'');b.innerHTML=statusIcon(s.id)+(item.count>1?`<b>${item.count}</b>`:'');badges.append(b);}
    if(t.statuses.length>slots){const b=document.createElement('span');b.className='condition-overflow';b.textContent='+'+(t.statuses.length-slots);badges.append(b);}
  }
  function decorateToken(t,el){
    const badges=document.createElement('div');badges.className='token-badges';el.append(badges);sizeToken(t,el);
    if(state.scene.encounter.running&&state.scene.encounter.activeId===t.id)el.classList.add('active-turn');
    if(state.scene.encounter.running&&state.scene.encounter.order.includes(t.id)&&!t.movement.private){const b=document.createElement('span');b.className='token-movement'+(t.movement.spent>t.movement.limit?' over-budget':'');b.textContent=`${t.movement.spent}/${t.movement.limit} ft`;el.append(b);}
  }
  function paintCamera(){
    const scale=safeZoom(ctx.camera().scale);if(scale===lastPaintScale)return;lastPaintScale=scale;
    const tokens=new Map((state.scene?.tokens||[]).map(t=>[t.id,t]));for(const el of $('tokens').children){const t=tokens.get(el.dataset.id);if(t)sizeToken(t,el);}
  }

  function render(){if(!state.scene){hide();return;}renderOverlay();renderPanel();if($('modal').open&&$('status-list'))statusRows();modeHint();}
  function action(action,el){
    switch(action){
      case'encounter':openPanel();return true;
      case'combat-close':hide();return true;
      case'token-combat':stats(el.dataset.id);return true;
      case'status-change':ctx.commitCommand({type:'status',id:statusToken,status:el.dataset.status,delta:Number(el.dataset.delta)});statusRows();return true;
      case'encounter-action':ctx.commitCommand({type:'encounter',action:el.dataset.kind});return true;
      case'terrain':ctx.hideFeatures();hide();terrainModal();return true;
      case'terrain-mode':closeModal();ctx.hideFeatures();hide();ctx.setTool(el.dataset.mode);modeHint();return true;
      case'terrain-clear':ctx.commitCommand({type:'terrain-clear'});terrainModal();return true;
      case'paint-done':pointerEnd(true);pendingArea=null;ctx.setTool('select');modeHint();return true;
      case'areas':ctx.hideFeatures();hide();areas();return true;
      case'area-new':areaForm();return true;
      case'area-edit-form':areaForm(el.dataset.id);return true;
      case'area-delete':ctx.commitCommand({type:'area-delete',id:el.dataset.id});areas();return true;
      case'area-relocate':pendingArea={id:el.dataset.id,area:areaValues(state.scene.areas.find(a=>a.id===el.dataset.id))};closeModal();ctx.setTool('area-place');modeHint();return true;
      default:return false;
    }
  }
  return {action,render,hide,decorateToken,paintCamera,pointerDown,pointerMove,pointerEnd,modeHint};
}
