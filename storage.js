// Keep the original scene database untouched so v0.1 maps survive the update.
const SCENE_DB='kalandasztal-v1',TEMPLATE_DB='kalandasztal-tokens-v1';
const connections=new Map();
function db(name,store){
  if(connections.has(name))return connections.get(name);
  const promise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(name,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(store))req.result.createObjectStore(store,{keyPath:'id'});};
    req.onsuccess=()=>{req.result.onversionchange=()=>{req.result.close();connections.delete(name);};resolve(req.result);};
    req.onerror=()=>{connections.delete(name);reject(req.error);};
  });connections.set(name,promise);return promise;
}
async function transaction(mode,action,store='scenes',name=SCENE_DB){const database=await db(name,store);return new Promise((resolve,reject)=>{const tx=database.transaction(store,mode),req=action(tx.objectStore(store));tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('storage'));});}
export const listScenes=()=>transaction('readonly',s=>s.getAll());
export const saveScene=scene=>transaction('readwrite',s=>s.put(structuredClone(scene)));
export const deleteScene=id=>transaction('readwrite',s=>s.delete(id));
export const listTemplates=()=>transaction('readonly',s=>s.getAll(),'templates',TEMPLATE_DB);
export const saveTemplate=template=>transaction('readwrite',s=>s.put(structuredClone(template)),'templates',TEMPLATE_DB);
export function readPref(key,fallback=''){try{return localStorage.getItem('ka-'+key)||fallback;}catch{return fallback;}}
export function writePref(key,value){try{localStorage.setItem('ka-'+key,value);return true;}catch{return false;}}
