const fs = require('fs');
const h = fs.readFileSync('D:/Experiment/100-games/15-doodle-jump/index.html', 'utf8');
let code = h.match(/<script>([\s\S]*)<\/script>/)[1];

// expose internals for the test only
code = code.replace('reset();\n  loop();',
  'global.__G={get player(){return player},get platforms(){return platforms},get score(){return score},get gameOver(){return gameOver},get hi(){return hi},reset:reset,keys:keys};\n  reset();\n  loop();');
if (!/global\.__G/.test(code)) { console.log('PATCH FAILED'); process.exit(1); }

let fillTextFn = () => {};
const ctx = new Proxy({}, {
  get(t, p) { if (p === 'fillText') return fillTextFn; return () => {}; },
  set() { return true; }
});
const canvas = {
  width: 480, height: 640,
  getContext: () => ctx,
  addEventListener() {},
  getBoundingClientRect: () => ({ left: 0, width: 480 })
};
global.document = { getElementById: () => canvas };
const handlers = {};
global.addEventListener = (ev, fn) => { handlers[ev] = fn; };
let raf;
global.requestAnimationFrame = (fn) => { raf = fn; };
global.localStorage = { getItem: () => null, setItem() {} };

eval(code);
const G = global.__G;
const W = 480;

let deaths = 0, maxScore = 0, restarts = 0;

function nearestPlat(pred) {
  let best = null, bd = 1e9;
  for (const p of G.platforms) {
    if (p.broken) continue;
    const d = pred(p);
    if (d !== null && d < bd) { bd = d; best = p; }
  }
  return best;
}

for (let i = 0; i < 40000; i++) {
  if (G.gameOver) {
    deaths++;
    if (deaths > 3) break;
    handlers.keydown({ key: 'r', preventDefault() {} });
    restarts++;
    continue;
  }
  const pl = G.player;
  let target;
  if (pl.vy < 0) {
    // rising: aim for the platform just above the player
    target = nearestPlat(p => (pl.y - p.y > 0 && pl.y - p.y < 200) ? pl.y - p.y : null);
  }
  if (!target) {
    // falling (or nothing above): land on closest platform below feet
    target = nearestPlat(p => (p.y - pl.y > -10) ? p.y - pl.y : null);
  }
  if (target) {
    const tc = target.x + target.w / 2;
    const pc = ((pl.x + pl.w / 2) % W + W) % W;
    let diff = tc - pc;
    if (diff > W / 2) diff -= W;
    if (diff < -W / 2) diff += W;
    G.keys.left = diff < -6;
    G.keys.right = diff > 6;
  }
  raf();
  maxScore = Math.max(maxScore, G.score);
}
console.log('maxScore=' + maxScore, 'deaths=' + deaths, 'restarts=' + restarts, 'hi=' + G.hi);
console.log(maxScore > 400 && restarts >= 1 ? 'PASS' : 'CHECK');
