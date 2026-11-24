'use strict';
/* Deterministic rule regressions. Execute original functions, not copied formulae.
   Browser smoke separately exercises the whole page and trusted touch/keyboard events. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
const games = new Map(fs.readdirSync(base).filter(s => /^\d{2,3}-/.test(s)).map(s => [parseInt(s, 10), s]));
function src(id) {
  return fs.readFileSync(path.join(base, games.get(id), 'index.html'), 'utf8');
}
function find(id, name) {
  const lines = src(id).split('\n');
  const start = lines.findIndex(x => new RegExp('^\\s{0,2}function ' + name + '\\(').test(x));
  assert(start >= 0, `${id} ${name} not found`);
  const indent = lines[start].match(/^\s*/)[0];
  if (/\}\s*$/.test(lines[start])) return lines[start];
  const end = lines.findIndex((x,i) => i > start && x === indent + '}');
  assert(end > start, `${id} ${name} did not close`);
  return lines.slice(start, end + 1).join('\n');
}
function native(id, names, frame) {
  vm.createContext(frame);
  vm.runInContext(names.map(n => find(id,n)).join('\n'), frame, {filename:games.get(id)});
  return frame;
}

{
  let draws=0, writes=0;
  const p = native(68,['applyTool','remember','undoArt'],{
    size:5, cells:Array.from({length:5},()=>Array(5).fill(null)), tool:'paint', mirrorBrush:true, color:'#aabbcc',
    eraseStroke:false, Sfx:{dab(){}}, draw:()=>draws++, persist:()=>writes++, undoStack:[]
  });
  p.remember(); p.applyTool({x:1,y:2});
  assert.deepEqual(p.cells[2],[null,'#aabbcc',null,'#aabbcc',null]);
  p.undoArt();
  assert(p.cells.flat().every(v=>v===null));
  assert.equal(draws,2); assert.equal(writes,2);
  for(let i=0;i<40;i++)p.remember();
  assert.equal(p.undoStack.length,24);
}
{
  const g = native(70,['inB','move','swap','step'],{
    EMPTY:0,SAND:1,WATER:2,STONE:3,FIRE:5,STEAM:6, W:3,H:3,
    grid:Uint8Array.from([3,3,3,3,5,3,3,2,3]),updated:new Uint32Array(9),frame:0,
    Math:{random:()=>.25}
  });
  g.step();
  assert.equal(g.grid[4],6,'flame beside water becomes steam');
  assert.equal(g.grid[7],0,'water is consumed in this deterministic reaction');
}
{
  const g = native(75,['update'],{
    LEVELS:[{}], lvlIdx:0, holdFor:2, spawnT:1, queue:['red'],trains:[],
    Math, showHold(){}
  });
  g.update(.4);
  assert.equal(g.holdFor,1.6); assert.equal(g.spawnT,1,'traffic hold freezes dispatch countdown');
}
{
  const g = native(85,['canPlay','snapshot','restore'],{
    rankVal:r=>r==='A'?1:r==='K'?13:r, waste:[{r:6}], wildArmed:false,wildLeft:1,cols:[],stock:[],moves:0,showWild(){}
  });
  assert(!g.canPlay({r:9})); assert(g.canPlay({r:7}));
  g.wildArmed=true;
  assert(g.canPlay({r:9})); const snap=g.snapshot(); g.wildLeft=0; g.wildArmed=false;
  assert(!g.canPlay({r:9})); g.restore(snap);
  assert.equal(g.wildLeft,1);assert(g.canPlay({r:9}));
}
{
  const g = native(87,['chooseHolds'],{});
  assert.equal(JSON.stringify(g.chooseHolds([2,2,2,4,6])), '[true,true,true,false,false]');
}
{
  const b={disabled:false}; const g=native(89,['useBrake'],{dead:false, brakeReady:true,ball:{vx:8,vy:10},brakeButton:b});
  g.useBrake(); assert.equal(g.ball.vx,.64); assert.equal(g.ball.vy,4.8); assert(b.disabled);
  g.useBrake(); assert.equal(g.ball.vx,.64,'brake cannot be spent twice');
}
{
  const b={}; const g=native(92,['bail','updateBail'],{state:'play', bag:80,bailTime:0,bagEl:{},bailButton:b});
  g.bail(); assert.equal(g.bag,40);assert.equal(g.bailTime,.85);
  g.bail(); g.bail(); g.bail(); assert.equal(g.bag,0); assert(b.disabled);
}
{
  const seed = n => {let x=n;return ()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/2**32);};
  for(const cap of [2,3]) for(let k=1;k<=80;k++){
    const rnd=seed(k);
    const board=Array.from({length:6},()=>Array.from({length:6},()=>1+Math.floor(rnd()*9)));
    const g=native(97,['newTarget'],{ROWS:6,COLS:6,board,solution:[],target:0,targetEl:{},arcadeChain:cap,Math:Object.create(Math)});
    g.Math.random=rnd; g.newTarget();
    assert(g.solution.length>=cap);
    assert.equal(new Set(g.solution.map(p=>p.r+','+p.c)).size,g.solution.length);
    assert(g.solution.slice(1).every((p,i)=>Math.abs(p.r-g.solution[i].r)+Math.abs(p.c-g.solution[i].c)===1));
    assert.equal(g.target,g.solution.reduce((s,p)=>s+board[p.r][p.c],0));
  }
}
{
  const g=native(100,['freeCell'],{N:3,food:{x:2,y:1},bonus:{x:2,y:2},rocks:[{x:0,y:1}],worm:[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:1,y:1},{x:0,y:2}],Math});
  const f=g.freeCell(); assert.equal(f.x,1); assert.equal(f.y,2);
  g.worm.push(f); assert.equal(g.freeCell(),null,'full board search must terminate');
}
console.log('Late native rules: mirror/undo, steam reaction, signal hold, wild bridge, dice advice, one-use brake, oxygen bail, 160 reachable chains, and safe Worm spawns passed.');
