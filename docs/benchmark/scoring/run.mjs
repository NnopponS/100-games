import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2]);
const mods = {};
const results = [];
for (const module of ['signal','flux']) {
  try { mods[module] = await import(pathToFileURL(resolve(root, module + '.mjs')).href); }
  catch(err) { results.push({module,id:'import',pass:false,error:String(err)}); }
}
async function test(module,id,fn) {
  try { await fn(mods[module]?.[module === 'signal' ? 'createSignal' : 'createFlux']); results.push({module,id,pass:true}); }
  catch(e) { results.push({module,id,pass:false,error:String(e).split('\n').slice(0,8).join('\n')}); }
}
const v = (length, val=0) => Array(length).fill(val);
function rng(seed) { let s=seed; return () => { s ^= s<<13; s ^= s>>>17; s ^= s<<5; return s>>>0; }; }
function neighbors(index) {
  const r=Math.floor(index/5), c=index%5;
  return [[r,c],[r+1,c],[r-1,c],[r,c+1],[r,c-1]].filter(([a,b])=>a>=0&&a<5&&b>=0&&b<5).map(([a,b])=>a*5+b);
}
function flip(board,i) { for(const n of neighbors(i)) board[n]^=1; }
function generated(seed,scramble) { const b=v(25), random=rng(seed); for(let i=0;i<scramble;i++) flip(b,random()%25); return b; }
function optimalLength(board) {
  let best = Infinity;
  for(let first=0;first<32;first++){
    const b=board.slice(); let count=0;
    for(let j=0;j<5;j++) if(first & (1<<j)){flip(b,j);count++;}
    for(let i=5;i<25;i++) if(b[i-5]) {flip(b,i);count++;}
    if(!b.some(Boolean)) best=Math.min(best,count);
  }
  return best===Infinity?null:best;
}
function verifySolution(g,board) {
  const previous=g.snapshot(), original=board.slice(), answer=g.solution(), want=optimalLength(board);
  if(want===null) assert.equal(answer,null);
  else {
    assert.ok(Array.isArray(answer)); assert.equal(answer.length,want); assert.equal(new Set(answer).size,answer.length);
    for(const i of answer) { assert.ok(Number.isInteger(i)&&i>=0&&i<25); flip(board,i); }
    assert.deepEqual(board,v(25));
  }
  assert.deepEqual(g.snapshot(),previous);
  return original;
}
await test('signal','A01-default-seeded-snapshot',f=>assert.deepEqual(f().snapshot(),{board:generated(1,8),moves:0,won:false,undoDepth:0}));
await test('signal','A02-large-seeds-repeatable',f=>{
  for(const seed of [42,100,4294967295]) assert.deepEqual(f({seed,scramble:25}).snapshot().board,generated(seed,25));
});
await test('signal','A03-border-adjacency-no-wrap',f=>{
  for(const cell of [0,4,5,6,19,20,24]){
    const board=v(25);board[12]=1; const g=f({board});const want=board.slice(); flip(want,cell);
    assert.equal(g.press(cell),true);
    assert.deepEqual(g.snapshot(),{board:want,moves:1,won:!want.some(Boolean),undoDepth:1});
  }
});
await test('signal','A04-invalid-press-noop',f=>{
  const g=f({seed:3}), before=g.snapshot();
  for(const bad of [-1,25,1.5,'0',NaN,undefined,null]) assert.equal(g.press(bad),false);
  assert.deepEqual(g.snapshot(),before);
});
await test('signal','A05-win-gate-undo-and-replay',f=>{
  const board=v(25);flip(board,0);const g=f({board});assert.equal(g.undo(),false);
  assert.equal(g.press(0),true);assert.equal(g.snapshot().won,true);assert.equal(g.press(1),false);
  assert.equal(g.undo(),true);assert.deepEqual(g.snapshot().board,board);assert.equal(g.snapshot().moves,0);
  assert.equal(g.press(0),true);assert.equal(g.snapshot().won,true);
});
await test('signal','A06-reset-and-deep-copy',f=>{
  const input=generated(318,11), initial=input.slice(), g=f({board:input});assert.equal(g.press(3),true);assert.equal(g.press(5),true);
  try { input[0]^=1; } catch {}
  const snap=g.snapshot();try { snap.board[4]^=1;snap.moves=99; } catch {}
  assert.equal(g.snapshot().moves,2);g.reset();assert.deepEqual(g.snapshot(),{board:initial,moves:0,won:false,undoDepth:0});assert.equal(g.undo(),false);
});
await test('signal','A07-optimal-solvable-generated',f=>{
  for(let i=1;i<=27;i++){const b=generated(i*10011,4+i%22); verifySolution(f({board:b}),b.slice());}
});
await test('signal','A08-shortest-after-mutation-and-undo',f=>{
  const g=f({seed:561,scramble:24});assert.equal(g.press(5),true);assert.equal(g.press(13),true);
  verifySolution(g,g.snapshot().board);assert.equal(g.undo(),true);verifySolution(g,g.snapshot().board);
});
await test('signal','A09-unreachable-and-already-solved',f=>{
  const b=v(25); let bad = null;
  for(let i=0;i<25;i++) {const x=b.slice();x[i]=1;if(optimalLength(x)===null){bad=x;break;}}
  assert.ok(bad);verifySolution(f({board:bad}),bad.slice());verifySolution(f({board:b}),b.slice());
});
await test('signal','A10-reject-malformed-construction',f=>{
  for(const arg of [{seed:0},{seed:-1},{seed:2.1},{seed:4294967296},{scramble:0},{scramble:26},{board:v(24)},{board:[...v(24),2]},{board:Array(25)}]) assert.throws(()=>f(arg),RangeError);
});

function nextTile(b,random) {
  const empty=b.map((x,i)=>x===0?i:-1).filter(i=>i>=0);
  if(empty.length){const i=empty[random()%empty.length]; b[i]=random()%10===0?4:2;}
}
function over(board){
  if(board.some(x=>x===0))return false;
  return !board.some((x,i)=>x<2**30 && ((i%4!==3&&x===board[i+1])||(i<12&&x===board[i+4])));
}
function moved(board,dir){
  const groups = {
    left:i=>[i*4,i*4+1,i*4+2,i*4+3],
    right:i=>[i*4+3,i*4+2,i*4+1,i*4],
    up:i=>[i,i+4,i+8,i+12],
    down:i=>[i+12,i+8,i+4,i],
  };
  if(!Object.hasOwn(groups,dir)||typeof dir!=='string')return [board.slice(),0];
  let score=0;const out=v(16);
  for(let i=0;i<4;i++){
    const indices=groups[dir](i);
    const a=indices.map(j=>board[j]).filter(Boolean), r=[];
    for(let j=0;j<a.length;j++) {
      if(a[j]===a[j+1] && a[j]<2**30){const n=a[j]*2;r.push(n);score+=n;j++;}
      else r.push(a[j]);
    }
    for(let j=0;j<r.length;j++) out[indices[j]]=r[j];
  }
  return [out,score];
}
function checkTurn(g,board,dir,random,score,moves){
  const [next,gain]=moved(board,dir);
  const changed=next.some((x,i)=>x!==board[i]);
  assert.equal(g.move(dir),changed);
  if(changed){nextTile(next,random); score+=gain;moves++;}
  assert.deepEqual(g.snapshot(),{board:next,score,moves,over:over(next),undoDepth:moves});
  return [next,score,moves];
}
await test('flux','B01-default-and-chosen-seeds',f=>{
  for(const seed of [1,99,12350,4294967295]){const random=rng(seed),b=v(16);nextTile(b,random);nextTile(b,random);
    assert.deepEqual(f(seed===1?{}:{seed}).snapshot(),{board:b,score:0,moves:0,over:false,undoDepth:0});}
});
await test('flux','B02-no-double-merge-score-spawn',f=>{
  const b=[2,2,2,2,4,4,8,0,2,0,2,4,0,2,0,0];
  checkTurn(f({board:b}),b,'left',rng(1),0,0);
});
await test('flux','B03-all-four-directions',f=>{
  const b=[0,2,4,2,2,0,4,2,2,8,0,0,4,8,2,0];
  for(const dir of ['left','right','up','down']) checkTurn(f({board:b,seed:556}),b,dir,rng(556),0,0);
});
await test('flux','B04-noop-and-invalid-consume-no-rng',f=>{
  const b=[2,...v(15)],g=f({board:b,seed:3});
  for(const input of ['Left','left','up',null,'constructor',undefined,4]) checkTurn(g,b,input==='left'||input==='up'?input:'?',rng(3),0,0),assert.equal(g.move(input),false);
  checkTurn(g,b,'right',rng(3),0,0);
});
await test('flux','B05-undo-restores-score-board-and-rng',f=>{
  const b=[2,2,2,...v(13)],g=f({board:b,seed:103}),before=g.snapshot();
  assert.equal(g.undo(),false);assert.equal(g.move('left'),true);const a=g.snapshot();
  assert.equal(g.undo(),true);assert.deepEqual(g.snapshot(),before);
  assert.equal(g.move('left'),true);assert.deepEqual(g.snapshot(),a);
});
await test('flux','B06-reset-restores-seeded-stream',f=>{
  const g=f({seed:1990}),before=g.snapshot(),dirs=['left','down','left','right','up','up'];
  for(const dir of dirs) g.move(dir);const a=g.snapshot();
  g.reset();assert.deepEqual(g.snapshot(),before);assert.equal(g.undo(),false);
  for(const dir of dirs)g.move(dir);assert.deepEqual(g.snapshot(),a);
});
await test('flux','B07-full-and-capped-merge-cases',f=>{
  const b=[2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2], lost=f({board:b});
  assert.equal(lost.snapshot().over,true);
  for(const dir of ['left','right','up','down'])assert.equal(lost.move(dir),false);
  const max=2**30,c=[max,max,2,4,2,4,8,2,4,8,2,4,8,2,4,8];
  assert.equal(f({board:c}).snapshot().over,true);
  const moveable=[...c];moveable[1]=2;
  assert.equal(f({board:moveable}).snapshot().over,false);
});
await test('flux','B08-no-premature-win-cap-and-copy',f=>{
  const b=[2048,0,2,0,...v(12)],g=f({board:b});try{b[0]=0;}catch{}
  assert.equal(g.snapshot().board[0],2048);assert.equal(g.snapshot().over,false);
  const input=g.snapshot();try{input.board[0]=2;input.score=3;}catch{}
  assert.equal(g.snapshot().board[0],2048);assert.equal(g.snapshot().score,0);
  const c=[2**30,2**30,0,0,...v(12)];checkTurn(f({board:c}),c,'right',rng(1),0,0);
});
await test('flux','B09-deterministic-multiturn-oracle',f=>{
  for(const seed of [3,5,30,993]){const random=rng(seed),g=f({seed});let b=v(16),score=0,t=0;
    nextTile(b,random);nextTile(b,random);
    for(const step of [0,1,3,2,3,2,1,0,3,0,2,...v(8,1),0,1,2,3]){
      const dir=['left','up','right','down'][step]; [b,score,t]=checkTurn(g,b,dir,random,score,t);
    }
  }
});
await test('flux','B10-invalid-board-seed',f=>{
  for(const a of [{seed:0},{seed:-1},{seed:1.5},{seed:4294967296},{board:v(15)},{board:[...v(15),3]},{board:[...v(15),2**31]},{board:[...v(15),1]},{board:Array(16)}])assert.throws(()=>f(a),RangeError);
});
const passed=results.filter(x=>x.pass).length;
console.log(JSON.stringify({node:process.version,passed,total:results.length,results},null,2));
process.exitCode=passed===20?0:1;
