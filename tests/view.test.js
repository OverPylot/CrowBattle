import test from 'node:test';
import assert from 'node:assert/strict';
import {LABEL_LIMITS,safeZoom,viewportBox,tokenLabelMetrics,measurementLabelMetrics,createFrameScheduler} from '../view.js';

test('all map decoration sizes remain within screen-pixel limits for tiny and huge tokens at every zoom',()=>{
  for(const zoom of [.04,.1,.29,.5,1,2,4,6,1e9,NaN,Infinity,-1])for(const side of [8,64,320,4096]){
    const m=tokenLabelMetrics({w:side,h:side},zoom);assert.ok(Number.isFinite(m.inverse));
    for(const [key,[min,max]] of Object.entries(LABEL_LIMITS).filter(([key])=>key!=='measurement')){
      assert.ok(m[key]>=min&&m[key]<=max,`${key}: ${m[key]} at zoom ${zoom}`);
      // After world placement and inverse compensation, the rendered size equals the bounded screen size.
      assert.ok(Math.abs(m[key]*m.inverse*m.scale-m[key])<1e-9);
    }
    for(const movement of [true,false]){const text=measurementLabelMetrics(zoom,movement);assert.ok(text.font>=10&&text.font<=12);assert.ok(text.height<=24);}
  }
});
test('zoom cannot escape its limits or propagate nonfinite numbers into CSS transforms',()=>{
  assert.equal(safeZoom(1000),6);assert.equal(safeZoom(0),.04);assert.equal(safeZoom(NaN),1);assert.equal(safeZoom(Infinity),1);
});
test('a burst of camera changes queues one frame and flush cancels stale work',()=>{
  const queue=new Map();let next=0,renders=0;
  const renderer=createFrameScheduler(()=>renders++,cb=>{const id=next++;queue.set(id,cb);return id;},id=>queue.delete(id));
  for(let i=0;i<10000;i++)renderer.schedule();assert.equal(queue.size,1);assert.equal(renders,0);
  const cb=[...queue.values()][0];queue.clear();cb();assert.equal(renders,1);
  renderer.schedule();assert.equal(queue.size,1);renderer.flush();assert.equal(queue.size,0);assert.equal(renders,2);
  renderer.schedule();assert.equal(queue.size,1);
});

test('viewport drawing bounds follow the camera without allocating a map-sized SVG surface',()=>{
  for(const scale of [.04,.29,1,6]){const camera={x:-1500,y:700,scale},[x,y,w,h]=viewportBox(camera,1280,656);
    assert.ok(Math.abs(x*scale+camera.x)<1e-9);assert.ok(Math.abs(y*scale+camera.y)<1e-9);assert.ok(Math.abs(w*scale-1280)<1e-9);assert.ok(Math.abs(h*scale-656)<1e-9);
  }
  assert.ok(viewportBox({x:NaN,y:Infinity,scale:NaN},NaN,Infinity).every(Number.isFinite));
});
