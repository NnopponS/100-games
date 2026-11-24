/* Source-level checks of Arcade+ native mechanics. No DOM packages needed. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const base = path.resolve(__dirname, '..');
const ids = Array.from({ length: 33 }, (_, i) => i + 35);
const paths = fs.readdirSync(base);
function read(id) {
  const dir = paths.find(name => name.startsWith(id + '-'));
  assert.ok(dir, 'missing game ' + id);
  return fs.readFileSync(path.join(base, dir, 'index.html'), 'utf8');
}
function chunk(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, 'missing actual game code: ' + start);
  return source.slice(a, b);
}
function run(code, arcadeVariant, extra) {
  return vm.runInNewContext(code, { arcadeVariant, ...extra }, { timeout: 800 });
}
function both(id, source, assertions) {
  const classic = run(source(read(id)), false);
  const plus = run(source(read(id)), true);
  assertions(classic, plus);
}
for (const id of ids) {
  const source = read(id);
  const scripts = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  assert.ok(scripts.length >= 3, 'missing runtime scripts ' + id);
  for (const script of scripts) new vm.Script(script);
  const marker = scripts.find(s => s.includes('window.__arcadeNativeUpgrade'));
  assert.ok(marker, 'missing in-game mode settings ' + id);
  for (const [search, want] of [['',false], ['?mode=classic',false], ['?mode=plus',true], ['?plus=1',true]]) {
    const [enabled, metadata] = vm.runInNewContext(marker + '\n[arcadeVariant,window.__arcadeNativeUpgrade]', { location:{search},window:{}, URLSearchParams });
    assert.equal(enabled, want, 'wrong mode for ' + id);
    assert.equal(metadata.id, id);
    assert.ok(metadata.name && metadata.description, 'incomplete mode description ' + id);
  }
  assert.match(source, /window\.__arcadeMissionSource/, 'challenge adapter lost in ' + id);
}

both(37, src => chunk(src, 'const EMPTY = 0, RED', 'function pieceSimpleMoves') +
  'const b = Array.from({length:8},()=>Array(8).fill(EMPTY)); b[3][3]=RED;b[4][4]=BLK; pieceCaptures(b,3,3).length;',
  (classic,plus) => { assert.equal(classic,0); assert.equal(plus,1); });

both(38, src => 'const SX=200; function updateHUD(){}\n' +
  chunk(src, 'let grid, flip, score, shotsLeft', 'let best') +
  "current='red'; nextC='green'; state='play'; swapBubble(); swapBubble(); [current,nextC].join(',');",
  (classic,plus) => { assert.equal(classic,'red,green'); assert.equal(plus,'green,red'); });

both(47, src => 'let H=768,rimY=253,rimL={y:253},rimR={y:253},board={y:100},timeLeft=59,TIME_LIMIT=60;\n' +
  chunk(src, 'timeLeft-=1/60;', '    const s=Math.ceil(timeLeft);') + 'JSON.stringify([rimY,rimL.y,rimR.y,board.y]);',
  (classic,plus) => { const a=JSON.parse(classic),b=JSON.parse(plus);assert.equal(a[0],253);assert.notEqual(b[0],253);assert.equal(b[0],b[1]);assert.equal(b[0],b[2]);assert.equal(b[3]-a[3],b[0]-a[0]); });

both(49, src => 'const H=640;\n' + chunk(src,'const HOLES=[','// ===== AAA audio') + 'JSON.stringify(HOLES[1]);',
  (classic,plus) => { const a=JSON.parse(classic),b=JSON.parse(plus);assert.equal(b.tee[1],640-a.tee[1]);assert.equal(b.cup[1],640-a.cup[1]);assert.equal(b.s[0][1],640-a.s[0][1]-a.s[0][3]); });

both(50, src => {
  const line = src.match(/ball\.vx \+= ball\.spin .*;/)[0];
  return 'const H=800,dt=1,ball={vx:0,spin:10,y:700};'+line+' const a=ball.vx;ball.vx=0;ball.y=100;'+line+' JSON.stringify([a,ball.vx]);';
},(classic,plus) => { assert.deepEqual(JSON.parse(classic),[10,10]);const b=JSON.parse(plus);assert.ok(b[0]<4&&b[1]>14); });

both(53, src => chunk(src, 'function rng(seed)', 'function slots') +
  "JSON.stringify(Array.from({length:24},(_,i)=>[laneInfo(i).type,isBlocked(i,3)]));",
  (classic,plus) => { const a=JSON.parse(classic),b=JSON.parse(plus);assert.notDeepEqual(a,b);assert.deepEqual(b[8],['grass',false]);assert.deepEqual(b[16],['grass',false]); });

both(58, src => 'const BEAT=.5;\n' + chunk(src, 'function buildChart()', 'function buildMusic()') +
  'const notes=buildChart(); JSON.stringify([notes.length,notes.filter(x=>x.t===2).length]);',
  (classic,plus) => { const a=JSON.parse(classic),b=JSON.parse(plus);assert.ok(b[0]>a[0]);assert.equal(a[1],1);assert.equal(b[1],2); });

both(60, src => "function rnd(){return 2}function pick(a){return a[0]}Math.random=()=>.3;\n" +
  chunk(src,'  function makeQuestion(lv) {','  function makeChoices(ans)') + 'JSON.stringify(makeQuestion(0));',
  (classic,plus) => { const a=JSON.parse(classic),b=JSON.parse(plus);assert.equal(a.ans,8);assert.equal(b.text,'4 × 4 + 3');assert.equal(b.ans,19); });

both(64, src => 'const DIRS=[[-1,0],[0,1],[1,0],[0,-1]],size=5;let cells;function idx(r,c){return r*size+c;}\n'+
  chunk(src,'function generate(){','function build(){') +
  "generate();for(const a of cells) for(let d=0;d<4;d++) if(a.base[d]){const [r,c]=DIRS[d];if(!cells[idx(a.r+r,a.c+c)].base[(d+2)%4])throw Error('one-way pipe');} cells.reduce((n,c)=>n+c.base.filter(Boolean).length,0)/2;",
  (classic,plus) => { assert.equal(classic,24);assert.equal(plus,31); });

both(65, src => {
  const pick=chunk(src,'  function pick(colorIdx) {','  function countRegion() {');
  return `let gameOver=false,SIZE=2,board=[[0,1],[2,1]],movesLeft=10,grew=false,reads=0;
  const cellEls=Array.from({length:2},()=>Array.from({length:2},()=>({style:{}})));
  const Sfx={deny(){},flood(){}};function countRegion(){return 1}function render(){}function end(){}
  function regionDist(){return [[0,0],[0,0]]}
  function regionMask(){return [[true,grew&&++reads===2],[false,false]]}
  ${pick}\npick(2);const a=movesLeft;movesLeft=10;grew=true;reads=0;pick(1);JSON.stringify([a,movesLeft]);`;
},(classic,plus) => { assert.deepEqual(JSON.parse(classic),[9,9]);assert.deepEqual(JSON.parse(plus),[8,9]); });

console.log('33 mode gates, scripts and mission links; 10 distinct gameplay behaviors passed.');
