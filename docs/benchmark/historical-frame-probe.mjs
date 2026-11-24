import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { Script } from 'node:vm';
const repo=process.argv[2];
const before='7fc5a2af210cd7ce654ba013eb2cc997bf66212e', after='2e8b6316ac0939bc66b8cc1e02af94e434438c0a';
const games=['91-volcano-escape','92-treasure-dive','93-bug-squash','94-ghost-catch'];
function inspect(rev, slug) {
  const html=execFileSync('git',['-C',repo,'show',rev+':'+slug+'/index.html'],{encoding:'utf8'});
  const native=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const gradient={addColorStop(){}}, methods = new Set(['arc','beginPath','clearRect','closePath','ellipse','fill','fillRect','fillText','lineTo','moveTo','restore','rotate','save','setLineDash','stroke','strokeRect','translate','rect','roundRect','quadraticCurveTo','bezierCurveTo']);
  const ctx=new Proxy({}, {get(t,k){
    if(k==='createLinearGradient'||k==='createRadialGradient') return () => gradient;
    if(methods.has(k))return () => {};
    return t[k];
  }});
  const nodes={}, frames=[];
  const el=id=>nodes[id]??=(id==='c'?{width:480,height:650,getContext:()=>ctx,addEventListener(){}}:{textContent:'',style:{},classList:{add(){},remove(){}},addEventListener(){}});
  const fixture={window:{addEventListener(){}},document:{getElementById:el},requestAnimationFrame:fn=>(frames.push(fn),frames.length),performance:{now:()=>0},localStorage:{getItem:()=>null,setItem(){}}};
  new Script(native).runInNewContext(fixture,{timeout:1000});
  const queuedAtLoad=frames.length;
  assert.equal(typeof el('startBtn').onclick,'function');
  el('startBtn').onclick();
  const queuedAfterStart=frames.length;
  let executedFrames=0;
  for(let i=0;i<2&&frames.length;i++){frames.shift()((i+1)*16);executedFrames++;}
  return {queuedAtLoad,queuedAfterStart,executedFrames,queuedAfterTwoCallbacks:frames.length};
}
const results=games.map(game=>({game,before:inspect(before,game),after:inspect(after,game)}));
console.log(JSON.stringify({node:process.version,before,after,environment:'VM: native inline script, stub DOM/Canvas, observable rAF queue; no Chromium',results},null,2));
for(const r of results) {
 assert.deepEqual(r.before,{queuedAtLoad:0,queuedAfterStart:0,executedFrames:0,queuedAfterTwoCallbacks:0});
 assert.deepEqual(r.after,{queuedAtLoad:1,queuedAfterStart:1,executedFrames:2,queuedAfterTwoCallbacks:1});
}
