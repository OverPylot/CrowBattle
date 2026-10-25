import {uid} from './model.js';
export const cleanCode = value => String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
export const displayCode = value => cleanCode(value).match(/.{1,4}/g)?.join('-')||'';
export function generateCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>alphabet[n%32]).join('');}
const peerID=code=>'kalandasztal-v1-'+cleanCode(code);

// Signaling: public PeerJS Cloud. Game authority and private state: DM browser.
// No credentials, TURN keys or paid services are included.
export class Room {
  constructor(hooks){this.hooks=hooks;this.clients=new Map();this.members={};this.generation=0;this.status='idle';}
  statusChanged(status,detail=''){this.status=status;this.hooks.status?.(status,detail);}
  async host(code,members={}){
    this.stop();this.mode='dm';this.code=cleanCode(code);this.members=members;this.intentional=false;
    if(!globalThis.Peer)throw new Error('cloudError');
    this.statusChanged('connecting');
    const generation=this.generation;
    this.peer=new Peer(peerID(this.code),{secure:true,debug:0});
    const peer=this.peer;
    peer.on('connection',conn=>this.accept(conn,generation));
    peer.on('disconnected',()=>{if(!this.intentional&&this.peer===peer){this.statusChanged('signaling-lost');this.reconnectSignaling(peer);}});
    return new Promise((resolve,reject)=>{
      let settled=false;
      this.cancelHost=()=>{if(!settled){settled=true;reject(new Error('joinCancelled'));}};
      const timeout=this.hostTimer=setTimeout(()=>{if(!settled){settled=true;this.cancelHost=null;this.stop();reject(new Error('cloudError'));}},20000);
      peer.on('open',()=>{if(generation!==this.generation)return;clearTimeout(timeout);this.cancelHost=null;this.statusChanged('online');if(!settled){settled=true;resolve(this.code);}});
      peer.on('error',err=>{if(generation!==this.generation)return;if(!settled){settled=true;clearTimeout(timeout);this.cancelHost=null;this.stop();reject(new Error(err.type==='unavailable-id'?'roomTaken':'cloudError'));}else if(err.type!=='peer-unavailable')this.statusChanged('signaling-lost');});
    });
  }
  reconnectSignaling(peer){clearTimeout(this.signalTimer);this.signalTimer=setTimeout(()=>{if(this.peer!==peer||this.intentional)return;try{if(peer.disconnected&&!peer.destroyed)peer.reconnect();}catch{}},2500);}
  accept(conn,generation){
    const meta=conn.metadata||{};
    if(typeof meta.credential!=='string'||!/^[a-f0-9-]{60,100}$/.test(meta.credential)||typeof meta.name!=='string'||!meta.name.trim()){
      conn.on('open',()=>conn.close());return;
    }
    conn.on('error',()=>{});
    conn.on('open',()=>{
      if(generation!==this.generation){conn.close();return;}
      let member=this.members[meta.credential];
      if(!member){member={id:uid(),name:meta.name.trim().slice(0,30)};this.members[meta.credential]=member;}
      member.name=meta.name.trim().slice(0,30);
      // A new connection using the same saved credential replaces its old tab.
      for(const [old,entry] of this.clients)if(entry.member.id===member.id){this.clients.delete(old);old.close();}
      this.clients.set(conn,{member,lastMap:null,count:0,since:Date.now()});
      this.hooks.members?.(this.members);this.sendView(conn,true);this.broadcast();this.hooks.participants?.(this.participants());
    });
    conn.on('data',message=>{
      const entry=this.clients.get(conn);
      if(!entry||generation!==this.generation||!message||typeof message!=='object')return;
      if(message.type==='request-state'){entry.lastMap=null;this.sendView(conn);return;}
      if(message.type!=='command')return;
      if(Date.now()-entry.since>1000){entry.since=Date.now();entry.count=0;}
      if(++entry.count>25)return;
      const accepted=this.hooks.command?.(entry.member.id,message.command);
      if(!accepted){try{conn.send({type:'rejected'});}catch{}this.sendView(conn);}
    });
    conn.on('close',()=>{if(generation!==this.generation)return;this.clients.delete(conn);this.broadcast();this.hooks.participants?.(this.participants());});
  }
  participants(){const online=new Set([...this.clients.values()].map(x=>x.member.id));return Object.values(this.members).map(x=>({id:x.id,name:x.name,online:online.has(x.id)}));}
  sendView(conn,welcome=false){
    const entry=this.clients.get(conn);if(!entry||!conn.open)return;
    const view=this.hooks.view?.(this.participants());if(!view)return;
    const src=view.map.src;
    if(entry.lastMap===src)view.map.src=null;
    try{conn.send({type:welcome?'welcome':'state',participantId:entry.member.id,scene:view});entry.lastMap=src;}catch{}
  }
  broadcast(){for(const conn of this.clients.keys())this.sendView(conn);}
  join(code,name,credential){
    this.stop();this.mode='player';this.code=cleanCode(code);this.name=name;this.credential=credential;this.attempts=0;this.intentional=false;
    if(!globalThis.Peer){this.statusChanged('failed','cloudError');return;}
    this.peer=new Peer({secure:true,debug:0});
    const peer=this.peer,generation=this.generation;
    this.statusChanged('connecting');
    this.joinTimer=setTimeout(()=>{if(generation===this.generation&&!this.conn?.open)this.statusChanged('failed','networkError');},20000);
    peer.on('open',()=>{if(this.peer===peer&&!this.intentional)this.connectHost();});
    peer.on('error',err=>{
      if(generation!==this.generation||this.intentional)return;
      if(err.type==='peer-unavailable'||err.type==='webrtc'){this.scheduleRetry();}
      else if(!this.conn?.open)this.statusChanged('failed','cloudError');
    });
    peer.on('disconnected',()=>{if(generation===this.generation&&!this.intentional)this.reconnectSignaling(peer);});
  }
  connectHost(){
    if(!this.peer||this.peer.destroyed||this.intentional)return;
    clearTimeout(this.retryTimer);clearTimeout(this.connectTimer);
    const generation=this.generation;
    const old=this.conn;this.conn=null;if(old)old.close();
    const conn=this.peer.connect(peerID(this.code),{reliable:true,serialization:'binary',metadata:{name:this.name,credential:this.credential}});
    this.conn=conn;
    this.connectTimer=setTimeout(()=>{if(this.conn===conn&&this.status!=='online'){conn.close();this.scheduleRetry();}},14000);
    conn.on('data',message=>{
      if(this.conn!==conn||generation!==this.generation||!message||typeof message!=='object')return;
      if(message.type==='closed'){this.intentional=true;clearTimeout(this.retryTimer);this.statusChanged('closed','closed');conn.close();return;}
      if(message.type==='rejected'){this.hooks.rejected?.();return;}
      if((message.type==='welcome'||message.type==='state')&&message.scene){
        clearTimeout(this.joinTimer);clearTimeout(this.connectTimer);clearTimeout(this.retryTimer);this.attempts=0;
        this.statusChanged('online');this.hooks.state?.(message.scene,message.participantId);
      }
    });
    conn.on('close',()=>{if(this.conn===conn&&!this.intentional&&generation===this.generation){this.statusChanged('offline','hostLost');this.scheduleRetry();}});
    conn.on('error',()=>{if(this.conn===conn&&!this.intentional&&generation===this.generation)this.scheduleRetry();});
  }
  scheduleRetry(){
    if(this.intentional||this.retryTimer)return;
    clearTimeout(this.connectTimer);
    if(++this.attempts>6){clearTimeout(this.joinTimer);this.statusChanged('failed','networkError');return;}
    this.statusChanged('offline','hostLost');
    this.retryTimer=setTimeout(()=>{this.retryTimer=null;this.connectHost();},3000);
  }
  retry(){if(this.mode!=='player')return;const {code,name,credential}=this;this.join(code,name,credential);}
  command(command){if(this.status!=='online'||!this.conn?.open)return false;try{this.conn.send({type:'command',command});return true;}catch{return false;}}
  stop(notify=false){
    this.intentional=true;this.generation++;
    if(this.cancelHost){this.cancelHost();this.cancelHost=null;}
    for(const timer of ['retryTimer','joinTimer','connectTimer','signalTimer','hostTimer']){clearTimeout(this[timer]);this[timer]=null;}
    if(notify)for(const conn of this.clients.keys())try{conn.send({type:'closed'});}catch{}
    // Allow the explicit close notice to enter the data channel before teardown.
    const peer=this.peer;
    if(peer){if(notify)setTimeout(()=>peer.destroy(),150);else peer.destroy();}
    this.peer=null;this.conn=null;this.clients.clear();this.status='idle';this.mode=null;
  }
}
