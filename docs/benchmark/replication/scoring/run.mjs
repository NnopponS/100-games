import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const home=resolve(process.argv[2]), results=[], m={};
for(const n of ['connect','range'])try{m[n]=(await import(pathToFileURL(resolve(home,n+'.mjs')).href))[n==='connect'?'createConnect':'createRange'];}catch{}
function test(n,id,fn){try{fn(m[n]);results.push({group:n,id,pass:true});}catch(e){results.push({group:n,id,pass:false,error:String(e).split('\n').slice(0,6).join('\n')});}}

const empty=()=>Array(42).fill(0);
const grid=i=>[Math.floor(i/7),i%7];
function win(b){
 for(let i=0;i<42;i++){if(!b[i])continue;const [r,c]=grid(i);
  for(const [a,d] of [[0,1],[1,0],[1,1],[1,-1]]) {
   let n=1;
   while(n<4 && r+a*n>=0 && r+a*n<6 && c+d*n>=0 && c+d*n<7 && b[(r+a*n)*7+c+d*n]===b[i])n++;
   if(n===4)return b[i];
  }
 }
 return 0;
}
function put(board,col,p){const b=board.slice();for(let r=5;r>=0;r--){const idx=r*7+col;if(b[idx]===0){b[idx]=p;return b;}}return null;}
function compare(g,b,p,seq){
 let last=[];
 for(const c of seq){
  const before=g.snapshot();
  const legal=Number.isInteger(c)&&c>=0&&c<=6&&p&&put(b,c,p);
  assert.equal(g.drop(c),!!legal);
  if(!legal){assert.deepEqual(g.snapshot(),before);continue;}
  b=legal;const winner=win(b),draw=!winner&&b.every(Boolean);p=winner||draw?0:3-p;last.push(before);
  assert.deepEqual(g.snapshot(),{board:b, turn:p, winner, draw, moves:last.length,undoDepth:last.length});
 }
 return last;
}
const firstSnap=(first=1)=>({board:empty(),turn:first,winner:0,draw:false,moves:0,undoDepth:0});
const horizontal=[0,0,1,1,2,2,3],vertical=[0,1,0,1,0,1,0],diag=[0,1,1,2,4,2,2,3,4,3,5,3,3];
// Fill a known no-win terminal coloring in legal alternating order.
function drawSeq(){
 const h=Array(7).fill(0), out=[], dead=new Set();
 function walk(){
  if(out.length===42)return true;
  const key=h.join(',');if(dead.has(key))return false;
  for(let c=0;c<7;c++){
   const r=5-h[c];if(r<0)continue;
   const want=1+((r+Math.floor(c/2))%2);
   if(want!==1+out.length%2)continue;
   h[c]++;out.push(c);if(walk())return true;out.pop();h[c]--;
  }
  dead.add(key);return false;
 }
 assert.equal(walk(),true);return out;
}
test('connect','C01-default-and-custom-first',f=>{assert.deepEqual(f().snapshot(),firstSnap());assert.deepEqual(f({first:2}).snapshot(),firstSnap(2));});
test('connect','C02-drop-gravity-alternation-and-types',f=>compare(f(),empty(),1,[0,0,6,6,5,2,-1,7,'3',2.5,NaN,null,undefined,4]));
test('connect','C03-horizontal-and-vertical-terminal',f=>{for(const s of [horizontal,vertical]){const g=f();compare(g,empty(),1,[...s,4]);assert.equal(g.snapshot().winner,1);assert.equal(g.snapshot().turn,0);}});
test('connect','C04-both-diagonal-directions',f=>{for(const s of [diag,diag.map(i=>6-i)]){const g=f();compare(g,empty(),1,s);assert.equal(g.snapshot().winner,1);}});
test('connect','C05-full-column-is-noop',f=>compare(f(),empty(),1,[4,4,4,4,4,4,4,3,4]));
test('connect','C06-undo-terminal-reset-and-independent-snapshot',f=>{
 const g=f({first:2});assert.equal(g.undo(),false);const prev=compare(g,empty(),2,horizontal).at(-1);
 const priorOutcome=g.snapshot();try{priorOutcome.board.fill(9);}catch{}
 assert.equal(g.snapshot().winner,2);assert.equal(g.undo(),true);assert.deepEqual(g.snapshot(),prev);
 assert.equal(g.drop(3),true);assert.equal(g.snapshot().winner,2);g.reset();assert.deepEqual(g.snapshot(),firstSnap(2));
});
test('connect','C07-winning-column-query-is-readonly',f=>{
 const g=f();compare(g,empty(),1,horizontal.slice(0,-1));
 const old=g.snapshot();
 assert.deepEqual(g.winningColumns(),[3]);assert.deepEqual(g.winningColumns(1),[3]);assert.deepEqual(g.winningColumns(2),[]);
 assert.deepEqual(g.winningColumns('1'),[]);assert.deepEqual(g.winningColumns(0),[]);assert.deepEqual(g.snapshot(),old);
});
test('connect','C08-draw-undo-and-query',f=>{
 const g=f(),s=drawSeq();const before=compare(g,empty(),1,s).at(-1);
 assert.equal(g.snapshot().moves,42);assert.equal(g.snapshot().draw,true);assert.deepEqual(g.winningColumns(1),[]);assert.equal(g.drop(0),false);
 assert.equal(g.undo(),true);assert.deepEqual(g.snapshot(),before);assert.equal(g.drop(s.at(-1)),true);assert.equal(g.snapshot().draw,true);
});
test('connect','C09-deterministic-varied-move-oracle',f=>{
 for(let n=1;n<=24;n++) {let s=n+8192;const seq=Array.from({length:46},()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return(s>>>17)%7;});const first=1+n%2;compare(f({first}),empty(),first,seq);}
});
test('connect','C10-invalid-options',f=>{for(const x of [[],null,'options',true,{first:0},{first:3},{first:'1'},{first:NaN}])assert.throws(()=>f(x),RangeError);});

const initial=(shots=5)=>({score:0,taken:0,remaining:shots,over:false,last:null,undoDepth:0});
const setup={distance:10,gravity:2,height:1.5,centerY:.5,centerX:0,radii:[.1,.25,.5],shots:5};
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
function last(g,x,y,t,radius,points,ground){const x1=g.snapshot().last;assert.equal(x1.points,points);assert.equal(x1.ground,ground);for(const [key,v] of Object.entries({x,y,time:t,radius})) close(x1[key],v);}
test('range','D01-default-and-custom-shot-budget',f=>{assert.deepEqual(f().snapshot(),initial());assert.deepEqual(f({shots:30}).snapshot(),initial(30));});
test('range','D02-analytic-center-hit',f=>{const g=f(setup);assert.equal(g.shoot({speed:10,angle:0}),true);last(g,0,.5,1,0,10,false);assert.equal(g.snapshot().score,10);});
test('range','D03-inclusive-ring-boundaries-and-combined-score',f=>{
 const g=f(setup);for(const [x,pts] of [[.1,10],[.25,7],[-.5,3],[.500001,0]]){assert.equal(g.shoot({speed:10,angle:0,x}),true);last(g,x,.5,1,Math.abs(x),pts,false);}
 const a=g.snapshot();assert.equal(a.score,20);assert.equal(a.taken,4);assert.equal(a.remaining,1);
});
test('range','D04-ground-before-target-suppresses-scoring',f=>{
 const g=f({...setup,radii:[5,10,20]});assert.equal(g.shoot({speed:5,angle:0}),true);
 last(g,0,-2.5,2,3,0,true);assert.equal(g.snapshot().taken,1);
});
test('range','D05-projectile-oracle-varied-ballistics',f=>{
 const opt={distance:32,gravity:9.7,height:1.85,centerY:2.3,centerX:-.2,radii:[.08,.29,.56],shots:30};const g=f(opt);
 for(let i=0;i<30;i++){
  const speed=6+i*2.3, angle=(-25+i*3)%57, x=(i%10-5)/9;
  const a=angle*Math.PI/180, t=opt.distance/(speed*Math.cos(a)), y=opt.height+speed*Math.sin(a)*t-opt.gravity*t*t/2;
  const r=Math.hypot(x-opt.centerX,y-opt.centerY);const pos=opt.radii.findIndex(rad=>r<=rad);
  assert.equal(g.shoot({speed,angle,x}),true);last(g,x,y,t,r,y<0||pos<0?0:[10,7,3][pos],y<0);
 }
 assert.equal(g.snapshot().over,true);
});
test('range','D06-options-copied-and-snapshot-isolated',f=>{
 const radii=[.1,.25,.5];const g=f({...setup,radii});try{radii[0]=100;}catch{}
 assert.equal(g.shoot({speed:10,angle:0,x:.2}),true);const s=g.snapshot();assert.equal(s.last.points,7);
 try{s.last.points=99;s.score=99;}catch{}
 assert.equal(g.snapshot().last.points,7);assert.equal(g.snapshot().score,7);
});
test('range','D07-rejection-and-terminal-noop',f=>{
 const g=f({...setup,shots:1});
 for(const x of [null,[],{}, {speed:'10',angle:0},{speed:0,angle:0},{speed:101,angle:0},{speed:10,angle:-31},{speed:10,angle:61},{speed:10,angle:0,x:10.01},{speed:10,angle:NaN}])assert.equal(g.shoot(x),false);
 assert.deepEqual(g.snapshot(),initial(1));assert.equal(g.shoot({speed:1,angle:-30,x:-10}),true);
 const a=g.snapshot();assert.equal(a.taken,1);assert.equal(a.remaining,0);assert.equal(a.over,true);
 assert.equal(g.shoot({speed:20,angle:0}),false);assert.deepEqual(g.snapshot(),a);
});
test('range','D08-undo-and-reset-terminal',f=>{
 const g=f({...setup,shots:2});assert.equal(g.undo(),false);g.shoot({speed:10,angle:0,x:.4});const a=g.snapshot();g.shoot({speed:10,angle:0});
 const b=g.snapshot();assert.equal(b.over,true);assert.equal(g.undo(),true);assert.deepEqual(g.snapshot(),a);
 assert.equal(g.shoot({speed:10,angle:0}),true);assert.deepEqual(g.snapshot(),b);g.reset();assert.deepEqual(g.snapshot(),initial(2));
});
test('range','D09-legal-endpoints-and-zero-height',f=>{
 const g=f({...setup,distance:10,gravity:2,height:0,centerY:0,centerX:10,radii:[.1,.2,.5],shots:2});
 assert.equal(g.shoot({speed:100,angle:60,x:10}),true);assert.equal(g.shoot({speed:1,angle:-30,x:-10}),true);assert.equal(g.snapshot().taken,2);
});
test('range','D10-invalid-options',f=>{
 for(const x of [[],null,'x',{distance:0},{gravity:Infinity},{height:-1},{centerY:-1},{centerX:'0'},{radii:[.1,.1,.4]},{radii:[1,2]},{radii:[.1,.3,Infinity]},{radii:Array(3)},{shots:31},{shots:0},{shots:1.1}])assert.throws(()=>f(x),RangeError);
});
const passed=results.filter(x=>x.pass).length;
console.log(JSON.stringify({node:process.version,passed,total:results.length,results},null,2));
process.exitCode=passed===20?0:1;
