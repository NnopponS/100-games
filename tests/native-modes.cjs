const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function freshGame(dir, api) {
  const html = fs.readFileSync(path.join(__dirname, '..', dir, 'index.html'), 'utf8');
  const code = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const handlers = new Map();
  const items = new Map(), storage = new Map();
  let timeouts = [];
  const ctx = new Proxy({}, { get(obj, key) {
    return obj[key] || (key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({addColorStop(){}}) : () => {});
  }});
  function el(id) {
    let cls = new Set();
    return {
      id, textContent: '', innerHTML: '', style:{}, width: dir === '03-breakout' ? 720 : 400,
      height: dir === '03-breakout' ? 480 : 400, clientWidth:400, value:'classic',
      classList: {add:c=>cls.add(c), remove:c=>cls.delete(c), contains:c=>cls.has(c)},
      get className(){return [...cls].join(' ');},
      set className(value){cls=new Set(value.split(/\s+/).filter(Boolean));},
      children: [], getContext:()=>ctx, getBoundingClientRect:()=>({left:0, top:0, width:400}),
      addEventListener(type,f){handlers.set(id+':'+type,f);}, remove(){},
      querySelectorAll(){return [];}, insertBefore(node){this.children.push(node);}, blur(){}
    };
  }
  const document = {
    activeElement: null,
    getElementById(id){if(!items.has(id)) items.set(id,el(id));return items.get(id);},
    createElement(id){return el(id);},
    body: {appendChild(){}},
    addEventListener(type,f){handlers.set('document:'+type,f);}
  };
  const sandbox = {
    document, getComputedStyle:()=>({paddingLeft:'10px'}),
    performance:{now:()=>1000},
    localStorage:{getItem:k=>storage.get(k) || null, setItem:(k,v)=>storage.set(k,String(v))},
    CanvasRenderingContext2D:function(){},
    setInterval:()=>1, clearInterval:()=>{},
    setTimeout:f=>{timeouts.push(f); return timeouts.length;},
    clearTimeout:id=>{if(id) timeouts[id-1]=null;},
    requestAnimationFrame:()=>{}, addEventListener:()=>{}
  };
  sandbox.window = sandbox;
  const end = code.lastIndexOf('})();');
  assert(end !== -1);
  vm.runInNewContext(code.slice(0,end) + ';window.nativeTest=' + api + ';' + code.slice(end), sandbox, {filename:dir});
  function input(modeID, value) {
    document.getElementById(modeID).value=value;
    handlers.get(modeID+':change')();
  }
  return {api:sandbox.nativeTest, storage, input, handlers, document, drain(){
    const batch=timeouts; timeouts=[]; batch.forEach(f=>f&&f());
  }};
}

{
  const g=freshGame('02-snake', `{
    start, step, state:()=>({running,head:snake[0],walls,score,gold}), put:(head,d,apple)=>{
      snake=[head]; dir=nextDir=d; food=apple;
    }, putGold:(pos)=>gold={...pos,steps:5}, finish:()=>gameOver(false)
  }`);
  g.storage.set('snake_best','50');
  g.input('snakeMode','wrap');
  g.api.start();
  g.api.put({x:19,y:10},{x:1,y:0},{x:3,y:3});
  g.api.step();
  assert.equal(g.api.state().head.x,0);
  assert(g.api.state().running);
  g.api.putGold({x:1,y:10});
  g.api.step();
  assert.equal(g.api.state().score,30);
  g.api.finish();
  assert.equal(g.storage.get('snake_best_wrap'),'30');
  assert.equal(g.storage.get('snake_best'),'50');
  g.input('snakeMode','maze');
  assert.equal(g.api.state().walls.length,20);
  g.api.start();
  g.api.put({x:4,y:4},{x:1,y:0},{x:3,y:3});
  g.api.step();
  assert.equal(g.api.state().running,false);
  g.input('snakeMode','classic');
  g.api.start();
  g.api.put({x:19,y:10},{x:1,y:0},{x:3,y:3});
  g.api.step();
  assert.equal(g.api.state().running,false);
}

{
  const g=freshGame('03-breakout', `{
    state:()=>({mode,paddle,ball,bricks,score,lives,level,shield,drops}), startGame, launchBall, update,
    hit: b=>{state='play'; Object.assign(ball,{x:b.x+b.w/2,y:b.y+b.h+6,dx:0,dy:-4});},
    drop:kind=> drops.push({kind,x:paddle.x+paddle.w/2,y:PADDLE_Y-1}),
    miss:()=>{ball.y=H+10;ball.dy=4;},
    setLevel:n=>{level=n; buildBricks();}
  }`);
  g.storage.set('breakout_best','5000');
  g.input('breakMode','lab');
  g.api.startGame();
  let s=g.api.state();
  assert(s.bricks.length<50);
  const b=s.bricks.find(b=>b.hp===2);
  g.api.hit(b);g.api.update();
  assert.equal(b.hp,1);
  assert.equal(g.api.state().score,0);
  g.api.hit(b);g.api.update();
  assert.equal(b.alive,false);
  assert(g.api.state().score>0);
  assert.equal(g.storage.get('breakout_best'),'5000');
  g.api.drop('wide');g.api.update();
  assert.equal(g.api.state().paddle.w,145);
  g.api.drop('shield');g.api.update();
  assert.equal(g.api.state().shield,true);
  g.api.miss();g.api.update();
  assert.equal(g.api.state().shield,false);
  assert.equal(g.api.state().lives,3);
  g.api.miss();g.api.update();
  assert.equal(g.api.state().lives,2);
  g.api.setLevel(2);
  assert.notEqual(g.api.state().bricks.length,s.bricks.length);
  g.input('breakMode','classic');
  assert.equal(g.api.state().bricks.length,50);
}

{
  const g=freshGame('09-2048', `{
    slide, undo, newGame, state:()=>({score,best,mode,moves,undoLeft,won,settling,board:grid.map(row=>row.map(t=>t?t.v:0))}),
    shape:(...vals)=>{emptyBoard(); vals.forEach(([r,c,v])=>addTile(r,c,v,false));},
    budget:n=>{moves=n;}
  }`);
  const serial = () => JSON.stringify(g.api.state().board);
  g.storage.set('g2048_best','460');
  g.input('modeSelect','daily');
  const start = serial();
  g.api.newGame();
  assert.equal(serial(),start,'daily board repeats');
  g.api.shape([0,2,2],[0,3,2]);
  g.api.budget(119);
  g.api.slide(3);
  g.api.slide(2); // An in-flight animation must not spawn a second tile or burn another move.
  g.drain();
  assert.equal(g.api.state().moves,120);
  assert.match(g.document.getElementById('overlay').innerHTML,/OUT OF MOVES/);
  g.input('modeSelect','practice');
  g.api.shape([0,2,8],[0,3,8]);
  const before = serial();
  g.api.slide(3); g.drain();
  assert.equal(g.api.state().score,16);
  assert.equal(g.api.state().moves,1);
  g.api.undo();
  assert.equal(serial(),before);
  assert.equal(g.api.state().score,0);
  assert.equal(g.api.state().undoLeft,2);
  assert.equal(g.storage.get('g2048_best'),'460');
  g.api.slide(3);g.api.newGame(); const reset = serial(); g.drain();
  assert.equal(serial(),reset,'stale animations cannot spawn into reset board');
  g.input('modeSelect','classic');
  g.api.shape([0,2,16],[0,3,16]);
  g.api.slide(3);g.drain(); const classic=serial(); g.api.undo();
  assert.equal(serial(),classic,'undo only in practice');
  assert.equal(g.api.state().best,460);
}
console.log('Snake edge/barrier/bonus and score isolation, Breakout armor/catch/shield/layout, 2048 daily budget/determinism/undo/reset and score isolation passed');
