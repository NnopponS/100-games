const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const freshGame = require('./native-modes.cjs');
const plus = (dir,api) => freshGame(dir,api,-1,'?mode=plus');
const classics = (dir,api) => freshGame(dir,api,-1,'');
const slugs = fs.readdirSync(path.join(__dirname,'..')).filter(x=>/^\d{2}-/.test(x) && parseInt(x)<=34);
assert.equal(slugs.length,34);
for(const slug of slugs){
  const html=fs.readFileSync(path.join(__dirname,'..',slug,'index.html'),'utf8');
  assert.match(html,/window\.__arcadeNativeUpgrade\s*=\s*\{/);
  assert.match(html,/URLSearchParams\(location.search\)\.get\('mode'\)\s*===\s*'plus'/);
  for(const [,code] of html.matchAll(/<script>\s*([\s\S]*?)<\/script>/g))new vm.Script(code,{filename:slug});
}
const tests = {
  '01':()=> {
    const g=plus('01-flappy-bird',`{flap,update, gate:()=>pipes[0]?.top}`).api;
    g.flap();g.update();const y=g.gate();g.update();assert.notEqual(g.gate(),y);
  },
  '02':()=> {
    const g=plus('02-snake',`{read:()=>[mode,walls.length]}`).api;
    assert.deepEqual(Array.from(g.read()),['maze',20]);
  },
  '03':()=> {
    const g=plus('03-breakout',`{read:()=>[mode,bricks.length,bricks.some(b=>b.hp===2)]}`).api;
    assert.deepEqual(Array.from(g.read()),['lab',30,true]);
  },
  '04':()=> {
    const api=`{newGame,point,screen:(a,b)=>{score={you:a,ai:b};},state:()=>({over, score})}`;
    let g=plus('04-pong',api).api;
    g.newGame();g.screen(6,6);g.point('you');assert.equal(g.state().over,false);
    g.point('you');assert.equal(g.state().over,true);
    g=classics('04-pong',api).api;g.newGame();g.screen(9,9);g.point('you');assert.equal(g.state().over,true);
  },
  '05':()=> {
    const g=plus('05-tetris',`{holdPiece,state:()=>({heldType,piece:piece.type,holdUsed}),lockPiece}`).api;
    const first=g.state().piece;
    g.holdPiece();assert.equal(g.state().heldType,first);assert(g.state().holdUsed);
    const second=g.state().piece;
    g.holdPiece();assert.equal(g.state().piece,second);
    g.lockPiece();assert.equal(g.state().holdUsed,false);
  },
  '07':()=> {
    const h=plus('07-whack-a-mole',`{startGame, get:()=>({activeMole,armor,hits,score,timeLeft}), setRoll:()=>{Math.random=()=>.36;}}`);
    h.api.setRoll();h.api.startGame();
    const mole=h.api.get().activeMole;
    assert(mole && mole.classList.contains('up'));
    const down=()=>h.handlers.get('grid:pointerdown')({target:{closest:()=>mole},preventDefault(){}});
    assert.equal(h.api.get().timeLeft,40);
    down();assert.equal(h.api.get().score,0);assert(mole.hasAttribute('data-cracked'));assert.equal(h.api.get().armor,1);
    down();assert.equal(h.api.get().score,2);assert.equal(h.api.get().hits,1);assert(!mole.classList.contains('up'));
    assert.match(fs.readFileSync(path.join(__dirname,'..','07-whack-a-mole','index.html'),'utf8'),/\.mole:not\(\.up\)\s*\{\s*visibility:hidden/);
  },
  '08':()=> {
    const src=`{
      prepare:()=>{ started=true; grid[1][1].open=true;grid[1][1].n=1;grid[1][2].flag=true;grid[1][2].mine=true;
        for(let r=0;r<=2;r++)for(let c=0;c<=2;c++)if(!grid[r][c].mine)grid[r][c].n=1;},
      read:()=>[grid[0][0].open,grid[1][2].open]
    }`;
    const act=h=>{h.api.prepare();h.handlers.get('board:click')({target:{closest:()=>({dataset:{r:1,c:1}})}}); return Array.from(h.api.read());};
    assert.deepEqual(act(plus('08-minesweeper',src)),[true,false]);
    assert.deepEqual(act(classics('08-minesweeper',src)),[false,false]);
  },
  '09':()=> {
    const g=plus('09-2048',`{read:()=>[mode,moves,targetTile(),settling]}`).api;
    assert.deepEqual(Array.from(g.read()),['daily',0,1024,false]);
  },
  '20':()=> {
    const g=plus('20-piano-tiles',`{
      start, spawn, hit:()=>hitTile(lastTile), status:()=>[state,lastTile.rest,score],
      prepare:()=>{score=2;Math.random=()=>.04;}
    }`).api;
    g.start();g.prepare();g.spawn(0);
    assert.deepEqual(Array.from(g.status()),['playing',true,2]);
    g.hit();assert.deepEqual(Array.from(g.status()),['over',true,2]);
  },
  '30':()=> {
    const src=`{
      count:()=>shoe.length,
      soft17:()=>{dealer=[{v:11,rank:'A'},{v:6,rank:'6'}]; player=[{v:10,rank:'K'},{v:10,rank:'K'}];
        shoe[shoe.length-1]={v:3,rank:'3'};state='dealer';dealerPlay();return dealer.length;}
    }`;
    const a=plus('30-blackjack',src).api,b=classics('30-blackjack',src).api;
    assert.equal(a.count(),52);assert.equal(b.count(),208);
    assert.equal(a.soft17(),3);assert.equal(b.soft17(),2);
  },
  '31':()=> {
    const g=plus('31-sliding-puzzle',`{onTileClick, put:()=>{cells=Array.from({length:TOTAL},(_,i)=>(i+1)%TOTAL);}, read:()=>cells.indexOf(0), prev:()=>cells[TOTAL-2], far:()=>cells[TOTAL-3], size:()=>TOTAL}`).api;
    g.put();g.onTileClick(g.far());assert.equal(g.read(),g.size()-1);
    g.onTileClick(g.prev());assert.equal(g.read(),g.size()-2);
  },
  '32':()=> {
    const g=plus('32-lights-out',`{press, out:()=>lights.map((value,i)=>value?i:-1).filter(i=>i>=0), zero:()=>{lights.fill(false)}}`).api;
    g.zero();g.press(2,2);assert.deepEqual(Array.from(g.out()),[6,8,12,16,18]);
  }
};
let failures=0;
for(const [id, test] of Object.entries(tests)){
  try{test();console.log('Plus rule',id,'passed');}catch(e){console.error('Plus rule',id,e.message);failures++;}
}
if(failures)process.exitCode=1;
