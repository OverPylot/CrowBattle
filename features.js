import {BUILTIN_TOKENS} from './tokens.js?v=0.2.0';
import {DICE,PALETTE,normalizeTemplate,normalizeLoot,normalizeRoll,createRoll,measureDistance,canUndoMove,uid,clamp} from './model.js?v=0.2.0';
import {listTemplates,saveTemplate} from './storage.js?v=0.2.0';

export function createFeatures(ctx){
  const {$,t,esc,icon,toast,modal,closeModal,field,submitButton,cancelButton}=ctx;
  let panel='',filter='all',search='',templates=[],pool={},modifier=0,secret=false,carry=true,points=[],measureKind='measurement',measureTimer;
  const pingTimers=new Set();let receivedState=false,lastRollId='';
  const state=()=>ctx.state;
  const nameOf=template=>template.name||template[ctx.language()]||template.en;
  const allTemplates=()=>[...BUILTIN_TOKENS,...templates];
  const expression=(groups,mod=0)=>groups.map(g=>`${g.count??g.values.length}d${g.sides}`).join(' + ')+(mod?(mod>0?' + ':' − ')+Math.abs(mod):'');
  function hidePanel(){panel='';$('feature-panel').hidden=true;}
  function shell(title,content,headingIcon){
    $('feature-panel').hidden=false;$('feature-panel').innerHTML=`<div class="panel-head"><h2>${icon(headingIcon)}${esc(title)}</h2><button class="icon-button" data-action="close-panel" aria-label="${t('close')}">${icon('x')}</button></div><div class="panel-content">${content}</div>`;
  }
  function render(){if(!panel)return;({library:renderLibrary,dice:renderDice,more:renderMore,scenes:renderScenes,loot:renderLoot})[panel]?.();}
  function show(which){if(panel===which){hidePanel();return;}panel=which;render();}
  function renderMore(){
    const dm=state().role==='dm';const item=(action,label,svg,disabled=false)=>`<button class="menu-item" data-action="${action}" ${disabled?'disabled':''}>${icon(svg)}<strong>${t(label)}</strong><span>→</span></button>`;
    shell(t('more'),`<div class="panel-menu">${item('undo','undo','undo',!undoAvailable())}${item('token','customToken','plus')}${dm?item('scenes','scenes','map')+item('grid','grid','grid'):''}${item('loot','loot','loot')}${dm?item('export','export','down'):''}${item('help','help','help')}</div><p class="panel-copy" style="margin-top:17px">${t('undoCopy')}</p>`,'more');
  }
  function renderLibrary(){
    shell(t('tokenLibrary'),`<p class="panel-copy">${t('libraryCopy')}</p><div class="panel-actions"><button class="button primary" data-action="token">${icon('plus')}${t('customToken')}</button><button class="icon-button" data-action="export-templates" title="${t('libraryExport')}" aria-label="${t('libraryExport')}">${icon('down')}</button><button class="icon-button" data-action="import" title="${t('libraryImport')}" aria-label="${t('libraryImport')}">${icon('upload')}</button></div><input class="token-search" id="token-search" placeholder="${t('searchTokens')}" aria-label="${t('searchTokens')}" value="${esc(search)}"><div class="filter-tabs">${['all','heroes','enemies','civilians','vip','custom'].map(group=>`<button class="${filter===group?'active':''}" data-action="token-filter" data-filter="${group}">${t(group==='all'?'allTokens':group==='custom'?'customTokens':group)}</button>`).join('')}</div><div id="token-catalog" class="token-catalog"></div>`,'token');
    renderCatalog();$('token-search').addEventListener('input',e=>{search=e.target.value;renderCatalog();});
  }
  function renderCatalog(){
    const q=search.trim().toLowerCase(),items=allTemplates().filter(x=>(filter==='all'||x.group===filter)&&`${nameOf(x)} ${x.en||''} ${x.hu||''} ${x.subclass||''}`.toLowerCase().includes(q));
    $('token-catalog').innerHTML=items.map(template=>`<button class="catalog-token ${template.group==='vip'?'is-vip':''}" data-action="place-template" data-id="${esc(template.id)}" title="${esc(nameOf(template))}">${template.image?`<img src="${esc(template.image)}" alt="">`:`<span class="catalog-placeholder" style="--token-color:${template.color}">${esc(nameOf(template).slice(0,2))}</span>`}<strong>${esc(nameOf(template))}</strong><small>${esc(template.subclass||t(template.group==='custom'?'customTokens':template.group))}</small></button>`).join('')||`<p class="empty-note" style="grid-column:1/-1">${t('emptyTemplates')}</p>`;
  }
  function place(template){
    const s=state();if(s.role==='player'&&ctx.room().status!=='online'){toast(t('needConnection'));return;}
    const center=ctx.centerPoint(),g=s.scene.grid.size;
    const token={name:nameOf(template),image:template.image,color:template.color,w:template.wUnits*g,h:template.hUnits*g,x:center.x-template.wUnits*g/2,y:center.y-template.hUnits*g/2,owner:s.myId||'dm',party:template.party};
    if(ctx.commitCommand({type:'add',token}))hidePanel();
  }
  async function rememberToken(token,name=token.name){
    const g=state().scene.grid.size,template=normalizeTemplate({id:uid(),name,image:token.image,color:token.color,wUnits:token.w/g,hUnits:token.h/g,party:token.party});
    await saveTemplate(template);templates.push(template);toast(t('templateSaved'));if(panel==='library')renderLibrary();
  }
  function templateModal(){
    const token=state().scene.tokens.find(x=>x.id===state().selected);if(!token)return;
    modal(t('saveTemplate'),field(t('templateName'),'template-name',token.name,'text','required maxlength="40"'),cancelButton()+submitButton(t('save')),async()=>{await rememberToken(token,$('template-name').value);closeModal();});
  }
  function undoAvailable(){return state().scene&&(state().role==='dm'?canUndoMove(state().scene,true):!!state().canUndo);}
  function refreshUndo(){if($('undo-button'))$('undo-button').disabled=!undoAvailable();document.querySelectorAll('#feature-panel [data-action="undo"]').forEach(button=>button.disabled=!undoAvailable());}
  function renderScenes(){
    if(state().role!=='dm'){hidePanel();return;}
    shell(t('scenes'),`<p class="panel-copy">${t('sceneCopy')}</p><label class="check-field"><input type="checkbox" id="carry-party" ${carry?'checked':''}><span>${t('carryParty')}</span></label><div class="scene-picker">${state().scenes.map(scene=>`<button class="scene-choice ${scene.id===state().scene.id?'active':''}" data-action="switch-scene" data-id="${esc(scene.id)}" ${scene.id===state().scene.id?'disabled':''}><img src="${esc(scene.map.src)}" alt=""><span><strong>${esc(ctx.sceneName(scene))}</strong><small>${scene.id===state().scene.id?t('currentScene'):t('switchTo')}</small></span></button>`).join('')}</div>`,'map');
    $('carry-party').onchange=e=>carry=e.target.checked;
  }
  function renderLoot(){
    const s=state(),loot=s.scene.loot;
    if(s.role==='dm'){
      const text=loot.items.map(i=>[i.name,i.quantity,i.description].join(' | ')).join('\n');
      shell(t('loot'),`<p class="panel-copy">${t('lootCopy')}</p><div class="loot-editor">${field(t('lootTitle'),'loot-title',loot.title||t('lootDefaultTitle'),'text','maxlength="80"')}<label><span>${t('lootItemsLabel')}</span><textarea id="loot-lines" rows="7" maxlength="30000" placeholder="${esc(t('lootPlaceholder'))}">${esc(text)}</textarea></label><label class="check-field"><input id="loot-visible" type="checkbox" ${loot.visible?'checked':''}><span>${t('lootVisible')}</span></label><button class="button primary" data-action="save-loot">${t('save')}</button></div>`,'loot');
    }else{
      const shared=s.sharedLoot;
      shell(t('loot'),shared?`<h3 class="loot-title">${esc(shared.title||t('lootDefaultTitle'))}</h3><div class="loot-items">${shared.items.map(i=>`<div class="loot-item"><span class="loot-quantity">${i.quantity}×</span><div><strong>${esc(i.name)}</strong>${i.description?`<p>${esc(i.description)}</p>`:''}</div></div>`).join('')||`<p class="empty-note">${t('lootEmpty')}</p>`}</div>`:`<p class="empty-note">${t('lootNotShared')}</p>`,'loot');
    }
  }
  function saveLoot(){
    if(state().role!=='dm')return;
    const items=$('loot-lines').value.split('\n').filter(line=>line.trim()).slice(0,100).map(line=>{const [name,quantity,...description]=line.split('|');return {id:uid(),name:name.trim(),quantity:quantity?.trim()?Number(quantity.trim()):1,description:description.join('|').trim()};});
    state().scene.loot=normalizeLoot({title:$('loot-title').value,visible:$('loot-visible').checked,items});ctx.changed();toast(t('lootSaved'));
  }
  function renderDice(){
    const dm=state().role==='dm',groups=DICE.filter(n=>pool[n]).map(sides=>({sides,count:pool[sides]}));
    shell(t('dice'),`<p class="panel-copy">${t('diceCopy')}</p><div class="dice-grid">${DICE.map(sides=>`<div class="die-stack ${pool[sides]?'has-dice':''}"><button class="die-add" data-action="die-add" data-sides="${sides}" aria-label="${t('addDie')} D${sides}"><svg class="die-shape" viewBox="0 0 44 44"><path d="M22 3 40 13v19L22 42 4 32V13ZM4 13l18 9 18-9M22 22v20" fill="none"/></svg><span class="die-label">D${sides}</span></button><div class="die-count"><button data-action="die-remove" data-sides="${sides}" aria-label="${t('removeDie')} D${sides}" ${!pool[sides]?'disabled':''}>−</button><span aria-label="D${sides} ${pool[sides]||0}">${pool[sides]||0}</span></div></div>`).join('')}</div><div class="dice-expression">${groups.length?esc(expression(groups,modifier)):t('chooseDice')}</div><div class="dice-options"><label><span>${t('modifier')}</span><input id="dice-modifier" class="dice-modifier" type="number" min="-9999" max="9999" step="1" value="${modifier}"></label>${dm?`<label class="check-field"><input id="dice-secret" type="checkbox" ${secret?'checked':''}><span>${t('secretRoll')}</span></label>`:''}</div><button class="button primary roll-button" data-action="roll-dice" ${!groups.length?'disabled':''}>${icon('dice')}${t('roll')}</button><button class="text-button dice-reset" data-action="dice-clear">${t('clearDice')}</button><p class="field-caption" style="margin-top:12px">${t(dm&&secret?'secretCopy':'sharedCopy')}</p><div class="history-heading"><strong>${t('rollHistory')}</strong><span class="version-badge">${dm&&secret?t('secret'):t('publicRoll')}</span></div><div id="roll-history" class="roll-history"></div>`,'dice');
    $('dice-modifier').oninput=e=>{if(e.target.validity.valid){modifier=Number(e.target.value)||0;document.querySelector('.dice-expression').textContent=groups.length?expression(groups,modifier):t('chooseDice');}};
    if($('dice-secret'))$('dice-secret').onchange=e=>{secret=e.target.checked;renderDice();};
    renderRollHistory();
  }
  function renderRollHistory(){
    if(panel!=='dice'||!$('roll-history'))return;
    const all=[...(state().sharedRolls||[]),...(state().role==='dm'?(state().scene.privateRolls||[]):[])].sort((a,b)=>b.at-a.at).slice(0,30);
    $('roll-history').innerHTML=all.map(roll=>`<article class="roll-entry ${roll.secret?'secret-roll':''}"><div class="roll-top"><strong>${esc(roll.name)}</strong>${roll.secret?`<span class="secret-badge">${t('secret')}</span>`:''}<time>${new Date(roll.at).toLocaleTimeString(ctx.language(),{hour:'2-digit',minute:'2-digit'})}</time></div><div class="roll-result"><span>${esc(expression(roll.groups,roll.modifier))}</span><strong>${roll.total}</strong></div><div class="roll-values">${roll.groups.map(g=>`d${g.sides}: [${g.values.join(', ')}]`).join(' · ')}</div></article>`).join('')||`<p class="empty-note">${t('noRolls')}</p>`;
  }
  function notifyRoll(roll){toast(`${roll.secret?t('secret')+' · ':''}${roll.name} · ${expression(roll.groups,roll.modifier)} = ${roll.total}`);}
  function applyCommand(actor,command){
    if(!command||typeof command!=='object')return false;
    if(command.type==='roll'){
      if(actor!=='dm'&&command.secret)return false;
      try{
        const name=actor==='dm'?'DM':state().participants.find(p=>p.id===actor)?.name||t('player');
        const roll=createRoll(command.pool,command.modifier,actor,name,actor==='dm'&&command.secret===true);
        if(roll.secret){state().scene.privateRolls.push(roll);state().scene.privateRolls=state().scene.privateRolls.slice(-30);ctx.persist();}
        else{state().sharedRolls.push(roll);state().sharedRolls=state().sharedRolls.slice(-30);ctx.changed();}
        renderRollHistory();notifyRoll(roll);return true;
      }catch{return false;}
    }
    if(command.type==='ping'){
      if(!Number.isFinite(command.x)||!Number.isFinite(command.y)||command.sceneId!==state().scene.id)return false;
      const name=actor==='dm'?'DM':state().participants.find(p=>p.id===actor)?.name||t('player');
      const color=actor==='dm'?'#e9bd68':PALETTE[[...actor].reduce((sum,c)=>sum+c.charCodeAt(0),0)%PALETTE.length];
      const event={kind:'ping',id:uid(),sceneId:state().scene.id,name,color,x:clamp(command.x,0,state().scene.map.width),y:clamp(command.y,0,state().scene.map.height)};
      receiveEvent(event);if(state().roomActive)ctx.room().broadcastEvent(event);return true;
    }
    return null;
  }
  function receiveEvent(event){
    if(event?.kind!=='ping'||event.sceneId!==state().scene?.id||!Number.isFinite(event.x)||!Number.isFinite(event.y))return;
    const el=document.createElement('div');el.className='ping-marker';el.style.left=event.x+'px';el.style.top=event.y+'px';el.style.setProperty('--ping-color',/^#[0-9a-f]{6}$/i.test(event.color)?event.color:'#e9bd68');el.style.transform=`scale(${1/ctx.camera().scale})`;
    const label=document.createElement('span');label.textContent=String(event.name).slice(0,40);el.append(label);$('pings').append(el);
    while($('pings').children.length>10)$('pings').firstElementChild.remove();const timer=setTimeout(()=>{el.remove();pingTimers.delete(timer);},3500);pingTimers.add(timer);
  }
  function clearMeasurement(){points=[];clearTimeout(measureTimer);$('measure-layer').replaceChildren();$('measure-readout').hidden=true;}
  function measurePoint(point){const g=state().scene.grid;if(g.enabled&&g.snap)return {x:Math.round((point.x-g.x)/g.size)*g.size+g.x,y:Math.round((point.y-g.y)/g.size)*g.size+g.y};return point;}
  function beginMeasurement(point){clearTimeout(measureTimer);const p=measurePoint(point);points=[p,p];measureKind='measurement';drawMeasurement();}
  function updateMeasurement(point){if(points.length){points[1]=measurePoint(point);drawMeasurement();}}
  function movement(token,x,y){clearTimeout(measureTimer);measureKind='movement';points=[{x:token.x+token.w/2,y:token.y+token.h/2},{x:x+token.w/2,y:y+token.h/2}];drawMeasurement();}
  function drawMeasurement(){
    if(!points.length||!state().scene)return;
    const scale=ctx.camera().scale,stroke=2/scale,r=4/scale;
    $('measure-layer').innerHTML=`<polyline points="${points.map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="#ffdfa0" stroke-width="${stroke}" stroke-dasharray="${7/scale} ${4/scale}"/>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="#ffdfa0" stroke="#5e633e" stroke-width="${1/scale}"/>`).join('')}`;
    const distance=measureDistance(points,state().scene.grid.size),format=n=>Number(n).toLocaleString(ctx.language(),{maximumFractionDigits:1});
    $('measure-readout').hidden=false;$('measure-value').textContent=`${t(measureKind)}: ${format(distance.feet)} ${t('feet')} · ${format(distance.squares)} ${t('squares')}`;
  }
  function endMovement(){clearTimeout(measureTimer);measureTimer=setTimeout(clearMeasurement,2200);}
  function paintCamera(){drawMeasurement();for(const el of $('pings').children)el.style.transform=`scale(${1/ctx.camera().scale})`;}
  function changedScene(){clearMeasurement();$('pings').replaceChildren();for(const timer of pingTimers)clearTimeout(timer);pingTimers.clear();if(panel)render();}
  function onState(sceneChanged=false){
    refreshUndo();const last=state().sharedRolls?.at(-1);
    if(receivedState&&last&&last.id!==lastRollId)notifyRoll(last);lastRollId=last?.id||'';receivedState=true;
    if(sceneChanged)changedScene();else if(panel==='dice')renderRollHistory();else if(panel==='loot'&&state().role==='player')renderLoot();
  }
  async function importTemplates(parsed){
    if(parsed.format!=='kalandasztal-token-library')return false;
    if(parsed.version!==1||!Array.isArray(parsed.templates)||parsed.templates.length>500)throw new Error('invalid-template');
    for(const raw of parsed.templates){const template=normalizeTemplate({...raw,id:uid()});await saveTemplate(template);templates.push(template);}
    if(panel==='library')renderLibrary();toast(t('libraryImported'));return true;
  }
  function exportTemplates(){
    const blob=new Blob([JSON.stringify({format:'kalandasztal-token-library',version:1,templates},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kalandasztal-tokentar.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  async function action(action,el){
    switch(action){
      case'close-panel':hidePanel();return true;
      case'more':show('more');return true;
      case'token-library':show('library');return true;
      case'dice':show('dice');return true;
      case'scenes':show('scenes');return true;
      case'loot':show('loot');return true;
      case'undo':if(undoAvailable()){ctx.commitCommand({type:'undo'});toast(t('undoDone'));}else toast(t('nothingToUndo'));refreshUndo();if(panel==='more')renderMore();return true;
      case'ruler':case'ping':hidePanel();ctx.setTool(action);toast(t(action+'Copy'));return true;
      case'clear-measure':clearMeasurement();return true;
      case'token-filter':filter=el.dataset.filter;renderLibrary();return true;
      case'place-template':{const template=allTemplates().find(x=>x.id===el.dataset.id);if(template)place(template);return true;}
      case'save-template':templateModal();return true;
      case'duplicate-token':{const token=state().scene.tokens.find(t=>t.id===state().selected);if(token){const g=state().scene.grid.size;ctx.commitCommand({type:'add',token:{...token,id:undefined,owner:state().myId,name:token.name.replace(/\s+\d+$/,''),x:token.x+g,y:token.y+g}});}return true;}
      case'export-templates':exportTemplates();return true;
      case'switch-scene':el.disabled=true;await ctx.switchScene(el.dataset.id,carry);hidePanel();return true;
      case'save-loot':saveLoot();return true;
      case'die-add':{const sides=Number(el.dataset.sides),count=Object.values(pool).reduce((a,b)=>a+b,0);if(count>=100)toast(t('diceLimit'));else pool[sides]=(pool[sides]||0)+1;renderDice();return true;}
      case'die-remove':{const sides=Number(el.dataset.sides);pool[sides]=Math.max(0,(pool[sides]||0)-1);renderDice();return true;}
      case'dice-clear':pool={};modifier=0;renderDice();return true;
      case'roll-dice':if(!$('dice-modifier').checkValidity()){$('dice-modifier').reportValidity();return true;}if(!ctx.commitCommand({type:'roll',pool:{...pool},modifier,secret:state().role==='dm'&&secret}))toast(t('diceRollFailed'));return true;
      case'token':case'grid':case'help':hidePanel();return false;
      default:return false;
    }
  }
  async function init(){try{templates=(await listTemplates()).map(normalizeTemplate);}catch{toast(t('templateSaveFailed'));}refreshUndo();}
  return {action,init,applyCommand,receiveEvent,onState,refreshUndo,changedScene,hidePanel,render,rememberToken,importTemplates,beginMeasurement,updateMeasurement,movement,endMovement,clearMeasurement,paintCamera,undoAvailable};
}
