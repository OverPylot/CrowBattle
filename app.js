import {normalizeScene,normalizeToken,makeDemo,playerView,applyPlayerCommand,snapPosition,clamp,uid,PALETTE,validImage} from './model.js';
import {listScenes,saveScene,deleteScene,readPref,writePref} from './storage.js';
import {messages} from './i18n.js';
import {Room,generateCode,cleanCode,displayCode} from './room.js';

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
let lang=readPref('language','hu');if(!messages[lang])lang='hu';
const t=key=>messages[lang][key]??key;
const state={scenes:[],scene:null,role:null,myId:null,participants:[],tool:'select',selected:null,roomActive:false,saveFailed:false,align:false};
let toastTimer,saveTimer,lastSave=Promise.resolve(),modalSubmit=null,modalCleanup=null,uploadedToken='',tokenColor=PALETTE[0],joining=false;
let camera={x:0,y:0,scale:1};
let lastView={width:0,height:0},isFitted=true;
const pointers=new Map();let drag=null,pinch=null;

function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
function translate(){
  document.documentElement.lang=lang;
  document.title=lang==='hu'?'Kalandasztal · A te játékasztalod':'Kalandasztal · Your adventure table';
  document.querySelectorAll('[data-t]').forEach(el=>{const value=t(el.dataset.t);if(el.dataset.t==='hero'){el.replaceChildren(...value.split('\n').flatMap((s,i)=>i?[document.createElement('br'),document.createTextNode(s)]:[document.createTextNode(s)]));}else el.textContent=value;});
  document.querySelectorAll('[data-title]').forEach(el=>{el.title=t(el.dataset.title);el.setAttribute('aria-label',t(el.dataset.title));});
  document.querySelectorAll('[data-placeholder]').forEach(el=>el.placeholder=t(el.dataset.placeholder));
  document.querySelectorAll('.lang-button').forEach(el=>{el.innerHTML=lang==='hu'?'HU <span>/ EN</span>':'EN <span>/ HU</span>';el.setAttribute('aria-label',lang==='hu'?'Switch to English':'Váltás magyar nyelvre');});
  renderLibrary();updateStatus();
  if(state.scene){$('scene-title').textContent=sceneName(state.scene);renderTokens();}
}
function sceneName(scene){if(scene.name==='Az elfeledett kripta'&&scene.id==='demo-vault')return t('demoVault');if(scene.name==='A régi erdei ösvény'&&scene.id==='demo-woodland')return t('demoWoodland');return scene.name;}
function roleTab(role){
  if(joining){room.stop();joining=false;$('join-form').querySelector('button[type=submit]').disabled=false;}
  const dm=role==='dm';$('library').hidden=!dm;$('join-section').hidden=dm;
  for(const [id,active] of [['dm-tab',dm],['player-tab',!dm]]){$(id).classList.toggle('active',active);$(id).setAttribute('aria-selected',String(active));}
}
function renderLibrary(){
  const list=$('map-cards');list.replaceChildren();
  for(const scene of [...state.scenes].sort((a,b)=>b.updatedAt-a.updatedAt)){
    const card=document.createElement('article');card.className='map-card';
    const demo=scene.id.startsWith('demo-');
    card.innerHTML=`<button class="map-open" data-action="open-scene" data-id="${esc(scene.id)}"><div class="map-thumbnail"><img src="${esc(scene.map.src)}" alt="${esc(sceneName(scene))}" loading="lazy">${demo?`<span class="map-badge">${icon('map')}${t('example')}</span>`:''}</div><div class="map-card-body"><h3>${esc(sceneName(scene))}</h3><span class="card-meta"><span>${scene.tokens.length} ${t('tokens')}</span><span>·</span><span>${Math.round(scene.map.width/scene.grid.size)} × ${Math.round(scene.map.height/scene.grid.size)}</span></span></div></button><div class="card-actions"><button class="icon-button" data-action="rename-scene" data-id="${esc(scene.id)}" title="${t('rename')}" aria-label="${t('rename')}">${icon('map')}</button><button class="icon-button" data-action="export-scene" data-id="${esc(scene.id)}" title="${t('export')}" aria-label="${t('export')}">${icon('down')}</button><button class="icon-button danger" data-action="delete-scene" data-id="${esc(scene.id)}" title="${t('delete')}" aria-label="${t('delete')}">${icon('trash')}</button></div>`;
    list.append(card);
  }
  const create=document.createElement('button');create.className='new-map-card';create.dataset.action='new-map';create.innerHTML=`<span class="new-map-icon">${icon('plus')}</span><strong>${t('newMap')}</strong><small>${t('newMapCopy')}</small>`;list.append(create);
}
function updateStatus(){
  if(!state.scene)return;
  $('save-state').textContent=state.role==='dm'?(state.saveFailed?t('saveFailed'):t('saved')):(room.status==='online'?t('online'):t('offline'));
  $('save-state').classList.toggle('saved-warning',state.saveFailed);
  $('room-button').hidden=state.role!=='dm';
  $('connection-button').hidden=state.role!=='player';
  $('room-label').textContent=state.roomActive?displayCode(room.code):t('startRoom');
  $('connection-label').textContent=room.status==='online'?t('online'):t('retry');
  $('connection-button').classList.toggle('offline',room.status!=='online');
  document.querySelectorAll('.dm-only').forEach(el=>el.hidden=state.role!=='dm');
  $('table-hint').textContent=state.align?t('alignMode'):t('tableHint');
}
async function persist(){
  clearTimeout(saveTimer);if(state.role!=='dm'||!state.scene)return;
  const snapshot=structuredClone(state.scene);
  $('save-state').textContent=t('saving');
  lastSave=lastSave.catch(()=>{}).then(()=>saveScene(snapshot)).then(()=>{state.saveFailed=false;const index=state.scenes.findIndex(s=>s.id===snapshot.id);if(index<0)state.scenes.push(snapshot);else state.scenes[index]=snapshot;updateStatus();}).catch(()=>{if(!state.saveFailed)toast(t('saveFailed'));state.saveFailed=true;updateStatus();});
  await lastSave;
}
function changed(){
  if(state.role!=='dm')return;
  state.scene.revision++;state.scene.updatedAt=Date.now();
  $('save-state').textContent=t('saving');clearTimeout(saveTimer);saveTimer=setTimeout(persist,250);
  if(state.roomActive)room.broadcast();
}
function renderScene(){
  const scene=state.scene;if(!scene)return;
  $('scene-title').textContent=sceneName(scene);
  $('world').style.width=scene.map.width+'px';$('world').style.height=scene.map.height+'px';
  if($('map-image').getAttribute('src')!==scene.map.src)$('map-image').src=scene.map.src;
  $('map-image').alt=sceneName(scene);renderGrid();renderTokens();updateStatus();
}
function showTable(){
  $('home').hidden=true;$('table').hidden=false;document.body.classList.add('table-open');
  renderScene();requestAnimationFrame(fit);
}
async function openScene(id){
  const scene=state.scenes.find(s=>s.id===id);if(!scene)return;
  state.scene=structuredClone(scene);state.scene.dmKey ||= uid()+uid();
  state.role='dm';state.myId='dm';state.participants=[];state.roomActive=false;state.selected=null;state.tool='select';state.align=false;
  showTable();setTool('select');await persist();
  history.replaceState(null,'',`${location.pathname}${location.search}#dm=${encodeURIComponent(id)}&key=${encodeURIComponent(state.scene.dmKey)}`);
}
async function goHome(){
  if(state.roomActive&&!confirm(t('leaveConfirm')))return;
  if(state.role==='player'&&room.status==='online'&&!confirm(t('leaveConfirm')))return;
  await persist();room.stop(true);state.roomActive=false;state.scene=null;state.role=null;state.selected=null;state.align=false;state.participants=[];
  clearTimeout(saveTimer);$('table').hidden=true;$('home').hidden=false;document.body.classList.remove('table-open');$('join-status').textContent='';joining=false;$('join-form').querySelector('button[type=submit]').disabled=false;
  history.replaceState(null,'',location.pathname+location.search);renderLibrary();
}
function setTool(tool){state.tool=tool;document.querySelectorAll('.tool[data-action=select],.tool[data-action=pan]').forEach(el=>el.classList.toggle('active',el.dataset.action===tool));$('viewport').style.cursor=tool==='pan'?'grab':'default';}
function renderGrid(){
  const g=state.scene.grid;$('map-grid').hidden=!g.enabled;
  const pattern=$('grid-pattern');pattern.setAttribute('width',g.size);pattern.setAttribute('height',g.size);pattern.setAttribute('x',g.x);pattern.setAttribute('y',g.y);
  $('grid-path').setAttribute('d',`M ${g.size} 0 H 0 V ${g.size}`);$('grid-path').setAttribute('stroke',g.color);$('grid-path').setAttribute('stroke-opacity',g.opacity);$('grid-path').setAttribute('stroke-width',g.line);
  $('grid-origin').hidden=!state.align;$('grid-origin').style.left=g.x+'px';$('grid-origin').style.top=g.y+'px';
}
function owns(token){return state.role==='dm'||(token.owner===state.myId&&!token.hidden);}
function renderTokens(){
  if(!state.scene)return;
  const layer=$('tokens');const present=new Set();
  for(const token of state.scene.tokens){
    if(token.hidden&&state.role!=='dm')continue;present.add(token.id);
    let el=[...layer.children].find(el=>el.dataset.id===token.id);
    if(!el){el=document.createElement('div');el.className='token';el.dataset.id=token.id;el.setAttribute('role','button');el.tabIndex=0;layer.append(el);}
    el.className='token'+(token.hidden?' is-hidden':'')+(token.id===state.selected?' is-selected':'')+(!owns(token)?' not-owned':'');
    el.style.left=token.x+'px';el.style.top=token.y+'px';el.style.width=token.w+'px';el.style.height=token.h+'px';el.style.fontSize=Math.max(12,Math.min(token.w,token.h)*.32)+'px';el.style.setProperty('--token-color',token.color);
    el.setAttribute('aria-label',token.name+(token.hidden?' · '+t('hidden'):''));
    el.replaceChildren();if(token.image){const image=document.createElement('img');image.src=token.image;image.alt='';image.draggable=false;el.append(image);}else{const initials=document.createElement('span');initials.className='token-initials';initials.textContent=token.name.split(/\s+/).map(s=>s[0]).join('').slice(0,2);el.append(initials);}
    const label=document.createElement('span');label.className='token-label';label.textContent=token.name;el.append(label);
    if(token.hidden){const indicator=document.createElement('span');indicator.className='hidden-indicator';indicator.innerHTML=icon('hide');el.append(indicator);}
  }
  for(const el of [...layer.children])if(!present.has(el.dataset.id))el.remove();
  const selected=state.scene.tokens.find(t=>t.id===state.selected&&owns(t));
  $('token-context').hidden=!selected;if(selected)$('selected-name').textContent=selected.name;else state.selected=null;
}
function paintCamera(){$('world').style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;$('zoom-value').textContent=Math.round(camera.scale*100)+'%';}
function fit(){if(!state.scene||$('table').hidden)return;const view=$('viewport');const padding=innerWidth>600?130:36;camera.scale=clamp(Math.min((view.clientWidth-padding)/state.scene.map.width,(view.clientHeight-90)/state.scene.map.height),.04,3);camera.x=(view.clientWidth-state.scene.map.width*camera.scale)/2;camera.y=(view.clientHeight-state.scene.map.height*camera.scale)/2;lastView={width:view.clientWidth,height:view.clientHeight};isFitted=true;paintCamera();}
function worldPoint(x,y){return{x:(x-camera.x)/camera.scale,y:(y-camera.y)/camera.scale};}
function zoom(factor,x=$('viewport').clientWidth/2,y=$('viewport').clientHeight/2){const anchor=worldPoint(x,y);camera.scale=clamp(camera.scale*factor,.04,6);camera.x=x-anchor.x*camera.scale;camera.y=y-anchor.y*camera.scale;isFitted=false;paintCamera();}
function centerPoint(){return worldPoint($('viewport').clientWidth/2,$('viewport').clientHeight/2);}
function clearSelection(){state.selected=null;renderTokens();}
function commitCommand(command){
  if(state.role==='player'){
    if(!room.command(command)){toast(t('needConnection'));return false;}return true;
  }
  if(command.type==='add'){if(state.scene.tokens.length>=1000){toast(t('full'));return false;}const token=normalizeToken({...command.token,id:uid()},state.scene.map,state.scene.grid);Object.assign(token,snapPosition(token,token.x,token.y,state.scene));state.scene.tokens.push(token);state.selected=token.id;}
  else{
    const token=state.scene.tokens.find(t=>t.id===command.id);if(!token)return false;
    if(command.type==='move')Object.assign(token,snapPosition(token,command.x,command.y,state.scene));
    if(command.type==='edit')Object.assign(token,normalizeToken({...token,...command.token,id:token.id},state.scene.map,state.scene.grid));
    if(command.type==='delete'){state.scene.tokens=state.scene.tokens.filter(t=>t.id!==token.id);state.selected=null;}
  }
  renderTokens();changed();return true;
}

function closeModal(){if(modalCleanup){const cleanup=modalCleanup;modalCleanup=null;cleanup();}$('modal').close();modalSubmit=null;}
function modal(title,body,footer='',submit=null){
  closeModal();$('modal-title').textContent=title;$('modal-body').innerHTML=body;$('modal-footer').innerHTML=footer;modalSubmit=submit;$('modal').showModal();
}
const submitButton=label=>`<button type="submit" class="button primary">${esc(label)}</button>`;
const cancelButton=()=>`<button type="button" class="button secondary" data-action="close-modal">${t('cancel')}</button>`;
function field(label,id,value,type='text',extra=''){return `<label><span>${esc(label)}</span><input id="${id}" name="${id}" type="${type}" value="${esc(value)}" ${extra}></label>`;}
function help(){modal(t('helpTitle'),`<ol class="help-steps">${[1,2,3,4].map(n=>`<li><strong>${t('help'+n+'Title')}</strong> ${t('help'+n)}</li>`).join('')}</ol><div class="info-box">${t('networkNote')}</div>`, `<button type="button" class="button primary" data-action="close-modal">${t('done')}</button>`);}

async function processImage(file,kind){
  if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error('invalidImage');
  const url=URL.createObjectURL(file);
  try{
    const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('mapTooLarge'));img.src=url;});
    const max=kind==='map'?4096:512;const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(64,Math.round(image.naturalWidth*scale));canvas.height=Math.max(64,Math.round(image.naturalHeight*scale));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    let src=canvas.toDataURL('image/webp',.86);
    if(!validImage(src,kind))src=canvas.toDataURL('image/jpeg',.72);
    if(!validImage(src,kind))throw new Error('mapTooLarge');
    return {src,width:canvas.width,height:canvas.height};
  }finally{URL.revokeObjectURL(url);}
}
async function uploadMap(file){
  toast(t('uploading'));
  try{
    const map=await processImage(file,'map');
    const filename=file.name.replace(/\.[^.]+$/,'').slice(0,70)||t('newMapName');
    modal(t('newMap'),field(t('mapName'),'map-name',filename,'text','required maxlength="70"'),cancelButton()+submitButton(t('save')),async()=>{
      const scene=normalizeScene({name:$('map-name').value,map,grid:{size:Math.round(map.width/20)},tokens:[]});
      await saveScene(scene);state.scenes.push(scene);closeModal();await openScene(scene.id);toast(t('mapImported'));
      navigator.storage?.persist?.().catch(()=>{});
    });
  }catch(error){toast(t(error.message)||t('mapTooLarge'));}
}
function downloadScene(scene){
  const safe=normalizeScene(scene);const data=JSON.stringify({format:'kalandasztal',version:1,scene:safe},null,2);
  const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=scene.name.replace(/[^\p{L}\p{N}_-]+/gu,'-').slice(0,60)+'.kalandasztal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast(t('downloaded'));
}
async function importBackup(file){
  try{
    if(!file||file.size>50*1024*1024)throw new Error();
    const parsed=JSON.parse(await file.text());if(parsed.format!=='kalandasztal'||parsed.version!==1)throw new Error();
    const scene=normalizeScene(parsed.scene);scene.id=uid();scene.updatedAt=Date.now();scene.tokens.forEach(token=>token.owner='dm');
    await saveScene(scene);state.scenes.push(scene);renderLibrary();toast(t('backupImported'));
  }catch{toast(t('invalidBackup'));}
}
function tokenModal(edit=false){
  if(!state.scene)return;if(state.role==='player'&&room.status!=='online'){toast(t('needConnection'));return;}
  const current=edit?state.scene.tokens.find(t=>t.id===state.selected):null;if(edit&&(!current||!owns(current)))return;
  const grid=state.scene.grid;const ratio=current?current.w/grid.size:1;const preset=current&&Math.abs(current.w-current.h)<.01&&Number.isInteger(ratio)&&ratio>=1&&ratio<=5?String(ratio):current?'custom':'1';
  uploadedToken=current?.image||'';tokenColor=current?.color||PALETTE[0];
  const ownerOptions=`<option value="dm">${t('dmOwner')}</option>`+state.participants.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} ${p.online?'':t('ownerOffline')}</option>`).join('');
  modal(t(edit?'editTokenTitle':'addToken'),`<div class="token-preview"><div id="token-preview" class="preview-circle"></div><span class="preview-copy">${t('tokenCopy')}</span></div>${field(t('tokenName'),'token-name',current?.name||'','text',`required maxlength="40" placeholder="${t('tokenNamePlaceholder')}"`)}<label><span>${t('size')}</span><select id="token-size">${[1,2,3,4,5].map(n=>`<option value="${n}" ${preset===String(n)?'selected':''}>${n} × ${n} · ${n*5} ft</option>`).join('')}<option value="custom" ${preset==='custom'?'selected':''}>${t('custom')}</option></select></label><div id="custom-size" class="field-row" ${preset==='custom'?'':'hidden'}>${field(t('width'),'token-width',current?(current.w/grid.size).toFixed(2):1,'number','min="0.1" max="512" step="0.01" required')}${field(t('height'),'token-height',current?(current.h/grid.size).toFixed(2):1,'number','min="0.1" max="512" step="0.01" required')}</div><label><span>${t('color')}</span><span class="swatches">${PALETTE.map(color=>`<button type="button" class="swatch${color===tokenColor?' active':''}" style="background:${color}" data-action="token-color" data-color="${color}" aria-label="${color}"></button>`).join('')}</span></label><label><span>${t('tokenImage')}</span><input id="token-image" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="button" id="remove-token-image" class="text-button" data-action="remove-token-image" ${uploadedToken?'':'hidden'}>${t('removeImage')}</button>${state.role==='dm'?`<label><span>${t('owner')}</span><select id="token-owner">${ownerOptions}</select></label><label class="check-field"><input id="token-hidden" type="checkbox" ${current?.hidden?'checked':''}><span>${t('hidden')}</span></label>`:''}`,cancelButton()+submitButton(t(edit?'save':'placeToken')),()=>{
    const size=$('token-size').value;
    const w=(size==='custom'?Number($('token-width').value):Number(size))*grid.size,h=(size==='custom'?Number($('token-height').value):Number(size))*grid.size;
    const center=centerPoint();
    const token={name:$('token-name').value.trim()||t('tokenDefault'),color:tokenColor,image:uploadedToken,w,h,owner:state.role==='dm'?$('token-owner').value:state.myId,hidden:state.role==='dm'&&$('token-hidden').checked,x:current?.x??center.x-w/2,y:current?.y??center.y-h/2};
    if(commitCommand(edit?{type:'edit',id:current.id,token}:{type:'add',token}))closeModal();
  });
  if(current&&state.role==='dm'){const owner=$('token-owner');if(![...owner.options].some(o=>o.value===current.owner)){const option=new Option(current.owner,current.owner);owner.add(option);}owner.value=current.owner;}
  const updateCustomSize=()=>{const custom=$('token-size').value==='custom';$('custom-size').hidden=!custom;$('custom-size').querySelectorAll('input').forEach(input=>input.disabled=!custom);};
  $('token-size').onchange=updateCustomSize;updateCustomSize();
  $('token-name').oninput=paintTokenPreview;
  $('token-image').onchange=async event=>{const input=event.target,submit=$('modal-footer').querySelector('[type=submit]');try{submit.disabled=true;const result=await processImage(input.files[0],'token');if(!input.isConnected)return;uploadedToken=result.src;paintTokenPreview();}catch(error){if(input.isConnected)toast(t(error.message));}finally{submit.disabled=false;}};
  paintTokenPreview();
}
function paintTokenPreview(){if(!$('token-preview'))return;const preview=$('token-preview');preview.style.backgroundColor=tokenColor;preview.style.backgroundImage=uploadedToken?`url("${uploadedToken}")`:'';preview.textContent=uploadedToken?'':($('token-name').value.trim().slice(0,2)||'?').toUpperCase();$('remove-token-image').hidden=!uploadedToken;document.querySelectorAll('.swatch').forEach(el=>el.classList.toggle('active',el.dataset.color===tokenColor));}
function gridModal(){
  if(state.role!=='dm')return;if(state.align){state.align=false;renderGrid();updateStatus();}
  const g=state.scene.grid;
  modal(t('grid'),`<p class="modal-copy">${t('gridCopy')}</p><label class="check-field"><input id="grid-enabled" type="checkbox" ${g.enabled?'checked':''}><span>${t('gridEnabled')}</span></label><label class="check-field"><input id="grid-snap" type="checkbox" ${g.snap?'checked':''}><span>${t('snap')}</span></label>${field(t('gridSize'),'grid-size',g.size,'number','min="12" max="500" step="1" required')}<div class="field-row">${field(t('offsetX'),'grid-x',g.x,'number','min="-4096" max="4096" step="1" required')}${field(t('offsetY'),'grid-y',g.y,'number','min="-4096" max="4096" step="1" required')}</div><div class="field-row">${field(t('color'),'grid-color',g.color,'color')}${field(t('lineWidth'),'grid-line',g.line,'number','min="0.5" max="5" step="0.5" required')}</div><label><span>${t('opacity')}</span><input id="grid-opacity" type="range" min="0.05" max="1" step="0.05" value="${g.opacity}"></label><button type="button" class="button secondary" data-action="align-grid">${icon('grid')}${t('alignGrid')}</button>`,submitButton(t('done')),closeModal);
  for(const input of $('modal-body').querySelectorAll('input'))input.addEventListener('input',()=>{
    const fields=[...$('modal-body').querySelectorAll('input')];if(fields.some(i=>!i.checkValidity()))return;
    const nextSize=Number($('grid-size').value),ratio=nextSize/g.size;
    if(nextSize!==g.size)state.scene.tokens.forEach(token=>{token.w=clamp(token.w*ratio,8,state.scene.map.width);token.h=clamp(token.h*ratio,8,state.scene.map.height);token.x=clamp(token.x,0,state.scene.map.width-token.w);token.y=clamp(token.y,0,state.scene.map.height-token.h);});
    Object.assign(g,{enabled:$('grid-enabled').checked,snap:$('grid-snap').checked,size:nextSize,x:Number($('grid-x').value),y:Number($('grid-y').value),color:$('grid-color').value,line:Number($('grid-line').value),opacity:Number($('grid-opacity').value)});renderGrid();renderTokens();changed();
  });
}

const room=new Room({
  view:participants=>state.scene?playerView(state.scene,participants):null,
  command:(actor,command)=>{if(state.role!=='dm'||!state.roomActive)return false;const accepted=applyPlayerCommand(state.scene,actor,command);if(accepted){renderTokens();changed();}return accepted;},
  members:members=>{if(state.role==='dm'&&state.scene?.room){state.scene.room.members=members;changed();}},
  participants:participants=>{state.participants=participants;if($('modal').open&&$('participants'))renderParticipants();},
  status:(status,detail)=>{
    updateStatus();
    if(state.role==='player'||joining){
      $('join-status').textContent=status==='online'?'':t(detail||(status==='connecting'?'connecting':'waiting'));
      if(['failed','closed'].includes(status)){joining=false;$('join-form').querySelector('button[type=submit]').disabled=false;if(!whereHome())toast(t(detail||'networkError'));}
    }
  },
  rejected:()=>toast(t('requestRejected')),
  state:(raw,myId)=>{
    try{
      if(raw.map?.src===null){if(!state.scene||state.scene.id!==raw.id){room.conn?.send({type:'request-state'});return;}raw.map.src=state.scene.map.src;}
      const scene=normalizeScene(raw);const first=whereHome();state.scene=scene;state.role='player';state.myId=myId;state.participants=Array.isArray(raw.participants)?raw.participants:[];
      joining=false;$('join-form').querySelector('button[type=submit]').disabled=false;
      if(first){state.selected=null;state.align=false;state.tool='select';showTable();setTool('select');}else renderScene();
    }catch{toast(t('networkError'));}
  },
});
function whereHome(){return $('table').hidden;}
async function startRoom(newCode=false){
  if(state.role!=='dm')return;
  const sceneId=state.scene.id;
  if(state.roomActive){roomModal();return;}
  $('room-button').disabled=true;$('room-label').textContent=t('connecting');
  state.scene.room ||= {code:generateCode(),members:{}};
  if(newCode)state.scene.room={code:generateCode(),members:{}};
  try{
    await room.host(state.scene.room.code,state.scene.room.members);
    if(state.role!=='dm'||state.scene?.id!==sceneId){room.stop();return;}
    state.roomActive=true;state.participants=room.participants();await persist();updateStatus();toast(t('roomReady'));roomModal();
    if('wakeLock' in navigator)try{wakeLock=await navigator.wakeLock.request('screen');}catch{}
  }catch(error){
    if(state.scene?.id!==sceneId||state.role!=='dm')return;
    state.roomActive=false;updateStatus();
    if(error.message==='roomTaken')modal(t('roomTitle'),`<p class="modal-copy">${t('roomTaken')}</p>`,cancelButton()+`<button type="button" class="button primary" data-action="new-room-code">${t('newCode')}</button>`);
    else toast(t(error.message)||t('cloudError'));
  }finally{$('room-button').disabled=false;}
}
let wakeLock=null;
function roomModal(){
  modal(t('roomTitle'),`<p class="modal-copy">${t('roomCopy')}</p><div class="room-code">${esc(displayCode(room.code))}</div><div class="room-actions"><button type="button" class="button secondary" data-action="copy-code">${icon('copy')}${t('copyCode')}</button><button type="button" class="button secondary" data-action="copy-player">${icon('link')}${t('copyLink')}</button></div><div><label>${t('players')}</label><div id="participants" class="participant-list"></div></div><div class="info-box">${t('networkNote')}</div><div class="room-actions"><button type="button" class="text-button" data-action="copy-dm">${t('copyDM')}</button><button type="button" class="text-button" data-action="export">${t('exportInRoom')}</button></div><p class="field-caption">${t('dmLinkCopy')}</p>`,`<button type="button" class="button secondary danger" data-action="stop-room">${t('stopRoom')}</button><button type="button" class="button primary" data-action="close-modal">${t('done')}</button>`);renderParticipants();
}
function renderParticipants(){
  const container=$('participants');if(!container)return;container.replaceChildren();
  const dm=document.createElement('div');dm.className='participant';dm.innerHTML=`<span class="status-dot"></span><strong>DM</strong><span>${t('online')}</span>`;container.append(dm);
  if(!state.participants.length){const p=document.createElement('p');p.className='modal-copy';p.textContent=t('noPlayers');container.append(p);}
  for(const participant of state.participants){const row=document.createElement('div');row.className='participant';row.innerHTML=`<span class="status-dot" style="background:${participant.online?'#548568':'#b3b6a8'}"></span><strong>${esc(participant.name)}</strong><span>${t(participant.online?'online':'offline')}</span>`;container.append(row);}
}
async function copy(value){try{await navigator.clipboard.writeText(value);toast(t('copied'));}catch{modal(t('copyManual'),field(t('copyManual'),'copy-value',value),`<button type="button" class="button primary" data-action="close-modal">${t('done')}</button>`);$('copy-value').select();}}
function joinRoom(code,name){
  code=cleanCode(code);if(code.length!==12){toast(t('networkError'));return;}
  let credential=readPref('member-'+code);if(!/^[a-f0-9-]{60,100}$/.test(credential)){credential=uid()+uid();writePref('member-'+code,credential);}
  writePref('nickname',name);joining=true;$('join-form').querySelector('button[type=submit]').disabled=true;room.join(code,name,credential);
}

document.addEventListener('click',async event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  const action=el.dataset.action;
  try{
    switch(action){
      case'language':lang=lang==='hu'?'en':'hu';writePref('language',lang);if($('modal').open)closeModal();translate();break;
      case'role-dm':roleTab('dm');break;case'role-player':roleTab('player');break;
      case'help':help();break;case'close-modal':closeModal();break;
      case'new-map':$('map-file').click();break;case'import':$('import-file').click();break;
      case'open-scene':await openScene(el.dataset.id);break;
      case'rename-scene':{
        const scene=state.scenes.find(s=>s.id===el.dataset.id);if(!scene)break;
        modal(t('rename'),field(t('mapName'),'rename-name',scene.name,'text','required maxlength="70"'),cancelButton()+submitButton(t('save')),async()=>{scene.name=$('rename-name').value.trim();scene.updatedAt=Date.now();await saveScene(scene);renderLibrary();closeModal();toast(t('renameSaved'));});break;
      }
      case'delete-scene':{
        const id=el.dataset.id;modal(t('deleteMapTitle'),`<p class="modal-copy">${t('deleteMapCopy')}</p>`,cancelButton()+submitButton(t('deleteMap')),async()=>{await deleteScene(id);state.scenes=state.scenes.filter(s=>s.id!==id);renderLibrary();closeModal();});break;
      }
      case'export-scene':downloadScene(state.scenes.find(s=>s.id===el.dataset.id));break;
      case'export':if(state.role==='dm')downloadScene(state.scene);break;
      case'home':await goHome();break;
      case'select':case'pan':setTool(action);state.align=false;renderGrid();updateStatus();break;
      case'token':tokenModal();break;case'edit-token':tokenModal(true);break;
      case'deselect':clearSelection();break;
      case'delete-token':if(commitCommand({type:'delete',id:state.selected}))toast(t('tokenDeleted'));break;
      case'toggle-hidden':{if(state.role!=='dm')break;const token=state.scene.tokens.find(t=>t.id===state.selected);if(token){token.hidden=!token.hidden;renderTokens();changed();toast(t(token.hidden?'hiddenToast':'revealedToast'));}break;}
      case'token-color':tokenColor=el.dataset.color;paintTokenPreview();break;
      case'remove-token-image':uploadedToken='';$('token-image').value='';paintTokenPreview();break;
      case'grid':gridModal();break;
      case'align-grid':closeModal();state.align=true;state.scene.grid.enabled=true;renderGrid();changed();updateStatus();toast(t('alignHint'));break;
      case'zoom-in':zoom(1.25);break;case'zoom-out':zoom(.8);break;case'fit':fit();break;
      case'room':await startRoom();break;case'new-room-code':closeModal();await startRoom(true);break;
      case'copy-code':await copy(displayCode(room.code));break;
      case'copy-player':await copy(location.origin+location.pathname+'#join='+room.code);break;
      case'copy-dm':await copy(location.origin+location.pathname+'#dm='+encodeURIComponent(state.scene.id)+'&key='+encodeURIComponent(state.scene.dmKey));break;
      case'stop-room':if(confirm(t('stopConfirm'))){room.stop(true);state.roomActive=false;state.participants=[];wakeLock?.release().catch(()=>{});updateStatus();closeModal();}break;
      case'reconnect':if(room.status!=='online')room.retry();break;
    }
  }catch(error){console.error(error);toast(t('saveFailed'));}
});
$('modal-form').addEventListener('submit',async event=>{event.preventDefault();if(!modalSubmit)return;const button=$('modal-footer').querySelector('[type=submit]');if(button)button.disabled=true;try{await modalSubmit();}catch(error){console.error(error);toast(t('saveFailed'));}finally{if(button)button.disabled=false;}});
$('modal').addEventListener('cancel',()=>{modalSubmit=null;if(modalCleanup){modalCleanup();modalCleanup=null;}});
$('map-file').addEventListener('change',event=>{const file=event.target.files[0];event.target.value='';if(file)uploadMap(file);});
$('import-file').addEventListener('change',event=>{const file=event.target.files[0];event.target.value='';if(file)importBackup(file);});
$('join-form').addEventListener('submit',event=>{event.preventDefault();const name=$('nickname').value.trim();if(name)joinRoom($('join-code').value,name);});
$('join-code').addEventListener('input',event=>{const cursor=event.target.selectionStart;const end=cursor===event.target.value.length;event.target.value=displayCode(event.target.value);if(end)event.target.setSelectionRange(event.target.value.length,event.target.value.length);});
$('tokens').addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;const token=state.scene.tokens.find(t=>t.id===event.target.dataset.id);if(token&&owns(token)){event.preventDefault();state.selected=token.id;renderTokens();tokenModal(true);}});

// Pointer events support touch, mouse and pen without a separate mobile mode.
const viewport=$('viewport');
const localPoint=event=>{const rect=viewport.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};};
viewport.addEventListener('pointerdown',event=>{
  if(event.button!==0&&event.pointerType==='mouse')return;
  const point=localPoint(event);pointers.set(event.pointerId,point);viewport.setPointerCapture(event.pointerId);
  if(pointers.size===2){
    if(drag?.kind==='token')renderTokens();drag=null;
    const [a,b]=[...pointers.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
    pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale:camera.scale,anchor:worldPoint(cx,cy)};return;
  }
  if(pointers.size>2)return;
  const tokenElement=event.target.closest('.token'),token=tokenElement&&state.scene.tokens.find(t=>t.id===tokenElement.dataset.id);
  if(state.align&&event.target.closest('#grid-origin')){drag={kind:'grid',start:point,x:state.scene.grid.x,y:state.scene.grid.y,moved:false};return;}
  if(token&&state.tool!=='pan'&&!state.align&&owns(token)){
    if(state.role==='player'&&room.status!=='online'){toast(t('needConnection'));return;}
    state.selected=token.id;renderTokens();drag={kind:'token',id:token.id,start:point,x:token.x,y:token.y,moved:false};
  }else drag={kind:'pan',start:point,x:camera.x,y:camera.y,moved:false,blank:!token};
});
viewport.addEventListener('pointermove',event=>{
  if(!pointers.has(event.pointerId))return;const point=localPoint(event);pointers.set(event.pointerId,point);
  if(pinch&&pointers.size>=2){const[a,b]=[...pointers.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;camera.scale=clamp(pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance,.04,6);camera.x=cx-pinch.anchor.x*camera.scale;camera.y=cy-pinch.anchor.y*camera.scale;isFitted=false;paintCamera();return;}
  if(!drag)return;const dx=point.x-drag.start.x,dy=point.y-drag.start.y;if(Math.hypot(dx,dy)>3)drag.moved=true;
  if(drag.kind==='pan'){camera.x=drag.x+dx;camera.y=drag.y+dy;if(drag.moved)isFitted=false;paintCamera();}
  if(drag.kind==='grid'){state.scene.grid.x=Math.round(drag.x+dx/camera.scale);state.scene.grid.y=Math.round(drag.y+dy/camera.scale);renderGrid();}
  if(drag.kind==='token'){const token=[...$('tokens').children].find(t=>t.dataset.id===drag.id);if(token){token.style.left=drag.x+dx/camera.scale+'px';token.style.top=drag.y+dy/camera.scale+'px';}}
});
function endPointer(event,cancel=false){
  if(!pointers.has(event.pointerId))return;const point=localPoint(event);pointers.delete(event.pointerId);
  if(pinch){
    if(pointers.size<2){pinch=null;if(pointers.size===1){const next=[...pointers.values()][0];drag={kind:'pan',start:next,x:camera.x,y:camera.y,moved:true};}else drag=null;}return;
  }
  if(!drag)return;const ended=drag;drag=null;
  if(ended.kind==='token'&&ended.moved&&!cancel){const token=state.scene.tokens.find(t=>t.id===ended.id);if(token){const position=snapPosition(token,ended.x+(point.x-ended.start.x)/camera.scale,ended.y+(point.y-ended.start.y)/camera.scale,state.scene);const sent=commitCommand({type:'move',id:token.id,...position});if(state.role==='player'&&sent)Object.assign(token,position);}}
  if(ended.kind==='grid'&&ended.moved)changed();
  if(ended.kind==='pan'&&!ended.moved&&ended.blank)clearSelection();
  renderTokens();
}
viewport.addEventListener('pointerup',event=>endPointer(event));viewport.addEventListener('pointercancel',event=>endPointer(event,true));
viewport.addEventListener('wheel',event=>{event.preventDefault();const p=localPoint(event);zoom(Math.exp(-event.deltaY*.0015),p.x,p.y);},{passive:false});
document.addEventListener('keydown',event=>{if($('table').hidden||$('modal').open||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='Escape'){clearSelection();state.align=false;renderGrid();updateStatus();}if(event.key==='Delete'&&state.selected)commitCommand({type:'delete',id:state.selected});if(event.key==='+'||event.key==='=')zoom(1.2);if(event.key==='-')zoom(1/1.2);});
window.addEventListener('resize',()=>{if(!state.scene||$('table').hidden)return;if(isFitted){fit();return;}const view=$('viewport');camera.x+=(view.clientWidth-lastView.width)/2;camera.y+=(view.clientHeight-lastView.height)/2;lastView={width:view.clientWidth,height:view.clientHeight};paintCamera();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist();else if(state.role==='dm'&&state.roomActive&&'wakeLock'in navigator)navigator.wakeLock.request('screen').then(lock=>wakeLock=lock).catch(()=>{});});
window.addEventListener('pagehide',()=>persist());

async function initialize(){
  translate();$('nickname').value=readPref('nickname');
  try{
    const scenes=await listScenes();
    for(const saved of scenes)try{const scene=normalizeScene(saved);scene.dmKey=saved.dmKey;scene.room=saved.room;state.scenes.push(scene);}catch{}
    if(!readPref('initialized')){
      for(const kind of ['vault','woodland']){const scene=makeDemo(kind);await saveScene(scene);state.scenes.push(scene);}writePref('initialized','yes');
    }
  }catch{state.scenes=[makeDemo('vault'),makeDemo('woodland')];toast(t('storageUnavailable'));}
  renderLibrary();
  const params=new URLSearchParams(location.hash.slice(1));
  if(params.get('join')){roleTab('player');$('join-code').value=displayCode(params.get('join'));$('nickname').focus();}
  if(params.get('dm')){const scene=state.scenes.find(s=>s.id===params.get('dm'));if(scene?.dmKey===params.get('key'))await openScene(scene.id);}
}
initialize();
