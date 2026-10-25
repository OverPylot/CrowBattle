const DB_NAME='kalandasztal-v1';
let pending;
function db(){
  return pending ||= new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{req.result.createObjectStore('scenes',{keyPath:'id'});};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>{pending=null;reject(req.error);};
  });
}
async function transaction(mode,action){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('scenes',mode);const req=action(tx.objectStore('scenes'));tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('storage'));});}
export const listScenes=()=>transaction('readonly',s=>s.getAll());
export const saveScene=scene=>transaction('readwrite',s=>s.put(structuredClone(scene)));
export const deleteScene=id=>transaction('readwrite',s=>s.delete(id));
export function readPref(key,fallback=''){try{return localStorage.getItem('ka-'+key)||fallback;}catch{return fallback;}}
export function writePref(key,value){try{localStorage.setItem('ka-'+key,value);return true;}catch{return false;}}
