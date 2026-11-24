// Optional real-browser smoke test:
//   npm install --no-save playwright && npx playwright install chromium
//   node tests/browser-smoke.cjs
//   ARCADE_ORIGIN=https://nnoppons.github.io/100-games/ node tests/browser-smoke.cjs
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.ARCADE_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const games = fs.readdirSync(root, { withFileTypes:true })
  .filter(d => d.isDirectory() && /^\d{2,3}-/.test(d.name) && fs.existsSync(path.join(root, d.name, 'index.html')))
  .map(d => d.name).sort((a,b) => parseInt(a)-parseInt(b));
assert.equal(games.length,100);
const requested = new Set((process.env.ARCADE_FILTER || '').split(',').map(Number).filter(Boolean));
const selected = games.filter(g => !requested.size || requested.has(parseInt(g)));
assert(selected.length);

async function serve() {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://test.invalid').pathname.replace(/^\/100-games\//, '/');
    let resource = path.resolve(root, '.' + pathname);
    if (!resource.startsWith(root + path.sep) && resource !== root) return res.writeHead(403).end();
    if (pathname.endsWith('/')) resource = path.join(resource, 'index.html');
    const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'}[path.extname(resource)];
    if (mime) res.setHeader('Content-Type', mime);
    fs.createReadStream(resource).on('error', () => res.writeHead(404).end()).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server;
}

const actions = require('./actions.json');
assert.equal(actions.length, 101);
assert(actions.slice(1).every((entry,i) => entry.id === i+1 && entry.steps.length));

function control(page, selector) {
  return page.locator(':is(' + selector + '):visible').first();
}
async function position(node, at = [.5,.5]) {
  await node.scrollIntoViewIfNeeded({timeout:2500});
  const b = await node.boundingBox();
  assert(b, 'control has no visible area');
  return { x:b.x+b.width*at[0], y:b.y+b.height*at[1] };
}
async function gesture(page, steps) {
  for (const action of steps) {
    if (action.press) await page.keyboard.press(action.press);
    else if (action.fill) await control(page, action.fill).fill(action.value,{timeout:2510});
    else if (action.click) {
      const point = await position(control(page,action.click), action.at);
      await page.mouse.click(point.x,point.y,{delay:30});
    } else if (action.drag) {
      const node = control(page,action.drag);
      const from = await position(node,action.from), to = await position(node,action.to);
      await page.mouse.move(from.x,from.y);
      await page.mouse.down();
      await page.mouse.move(to.x,to.y,{steps:5});
      await page.mouse.up();
    } else throw new Error('Unknown action: '+JSON.stringify(action));
  }
}

const readyForInput = () => {
  const root = document.getElementById('aaa-arcade-host')?.shadowRoot;
  return root && !root.querySelector('.mission-panel').open && !window.AAA?.isPaused();
};
const started = () => {
  const btn = document.getElementById('aaa-arcade-host')?.shadowRoot?.getElementById('arcadeMissionButton');
  return /remaining/.test(btn.getAttribute('aria-label')) || Number(btn.dataset.medal) > 0;
};
async function arm(page) {
  await page.locator('.mission-panel[open]').waitFor({timeout:5000});
  assert(await page.locator('.mission-panel').evaluate(el => el.open), 'explicit Trial did not auto-open its panel');
  await page.getByRole('button',{name:/Begin trial/i}).click({timeout:2500});
  await page.waitForFunction(readyForInput,null,{timeout:3000});
}
async function checkRoute(page, origin, slug) {
  const errors = [], report = err => errors.push(err.message);
  page.on('pageerror',report);
  try {
    const response = await page.goto(new URL(slug+'/?mode=trial', origin).href, {waitUntil:'domcontentloaded',timeout:12000});
    assert.equal(response?.status(),200);
    await page.waitForFunction(() => window.__arcadeMissionSource &&
      document.getElementById('aaa-arcade-host')?.shadowRoot?.getElementById('arcadeMissionButton'), null, {timeout:5000});
    const metric = await page.evaluate(() => {
      const m = window.__arcadeMissionSource;
      return {id:Number(m.id),label:m.label, goals:m.goals, kind:m.kind};
    });
    assert.equal(metric.id,parseInt(slug));
    assert.equal(typeof metric.label,'string');
    assert.equal(metric.goals.length,3);
    await arm(page);
    // Restoring focus to the mission opener after reading the dialog is good for
    // keyboard access. Move focus into the play surface before keyboard game controls.
    await page.evaluate(() => {
      document.getElementById('aaa-arcade-host')?.shadowRoot?.activeElement?.blur?.();
    });
    await gesture(page, actions[metric.id].steps);
    await page.waitForFunction(started,null,{timeout:3000});
    assert(await page.evaluate(() => {
      const m = window.__arcadeMissionSource;
      const n = m.read();
      return typeof n === 'number' && (Number.isFinite(n) || (m.kind === 'lower' && n === Infinity));
    }), 'game-specific metric not a number after input');
    assert.deepEqual(errors, []);
  } finally {
    page.off('pageerror',report);
  }
}

async function testMedal(context, origin) {
  const page = await context.newPage();
  try {
    await page.goto(new URL('68-pixel-painter/?mode=trial', origin).href);
    await page.evaluate(() => {
      localStorage.removeItem('pixelPainter68_art');
      localStorage.removeItem('arcade100:mission:68');
    });
    await page.reload({waitUntil:'domcontentloaded'});
    await arm(page);
    for (let index=0;index<3;index++) {
      await page.locator('#swatches button.swatch').nth(index).click({timeout:2500});
      await gesture(page,[{click:'#canvas',at:[.32+index*.1,.45]}]);
    }
    await page.waitForFunction(() => {
      const r = JSON.parse(localStorage.getItem('arcade100:mission:68') || '{}');
      return window.__arcadeMissionSource?.read() === 3 && r.medal === 1 && r.best === 3;
    },null,{timeout:3500});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => document.getElementById('aaa-arcade-host')?.shadowRoot
      ?.getElementById('arcadeMissionButton')?.dataset.medal === '1');
  } finally { await page.close(); }
}

async function testMobile(browser, origin) {
  const context = await browser.newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true, reducedMotion:'reduce'});
  try {
    const page = await context.newPage();
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => document.querySelectorAll('#allGrid .gcard, #allGrid .game-card').length === 100);
    assert(await page.evaluate(() =>
      document.documentElement.scrollWidth <= innerWidth + 1 &&
      getComputedStyle(document.body).colorScheme.includes('light')),
    'mobile portal should be light and fit the viewport');
    const search = page.getByRole('searchbox',{name:'Search games'});
    await search.fill('Snake');
    assert(Number(await page.locator('#shownCount').textContent().then(v=>v.match(/\d+/)?.[0])) >= 1,
      'search should leave a relevant result');
    await page.locator('#allGrid a[data-game-id="2"]').tap();
    await page.locator('#playerOverlay[open]').waitFor();
    const classic = page.locator('#classicModeBtn'), trial = page.locator('#trialModeBtn');
    assert.equal(await classic.getAttribute('aria-pressed'),'true');
    const frame = page.locator('#playerFrame'), game = page.frameLocator('#playerFrame');
    assert.doesNotMatch(await frame.getAttribute('src'),/mode=trial/);
    await trial.tap();
    assert.equal(await trial.getAttribute('aria-pressed'),'true');
    assert.match(await frame.getAttribute('src'),/mode=trial/);
    assert.match(page.url(),/mode=trial/);
    await game.locator('.mission-panel[open]').waitFor({timeout:5000});
    await classic.tap();
    assert.equal(await classic.getAttribute('aria-pressed'),'true');
    assert.doesNotMatch(await frame.getAttribute('src'),/mode=trial/);
    await game.locator('#arcadeMissionButton').waitFor();
    await game.locator('.mission-panel').waitFor({state:'hidden'});
    await page.locator('#closePlayerBtn').tap();
    await page.locator('#playerOverlay').waitFor({state:'hidden'});
    await search.fill('');
    await page.locator('#dailyPlayBtn').tap();
    await page.locator('#playerOverlay[open]').waitFor();
    const src = await page.locator('#playerFrame').getAttribute('src');
    assert.match(src,/daily=20\d\d-/,'daily date should be passed to the game');
    const daily = page.frameLocator('#playerFrame');
    await daily.locator('.mission-panel[open]').waitFor({timeout:5000});
    await page.locator('#closePlayerBtn').tap();
    await page.locator('#playerOverlay').waitFor({state:'hidden'});
  } finally { await context.close(); }
}

(async () => {
  const server = process.env.ARCADE_ORIGIN ? null : await serve();
  const origin = process.env.ARCADE_ORIGIN || `http://127.0.0.1:${server.address().port}/100-games/`;
  let browser;
  try {
    browser = await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
    const context = await browser.newContext({viewport:{width:1000,height:780}, reducedMotion:'reduce'});
    const failures = [];
    const workers = Number(process.env.ARCADE_WORKERS || 5);
    let next = 0;
    await Promise.all(Array.from({length:workers}, async () => {
      const page = await context.newPage();
      for (let i;(i = next++) < selected.length;) {
        try { await checkRoute(page,origin,selected[i]); }
        catch (error) { failures.push([selected[i],error.message]); }
      }
      await page.close();
    }));
    console.log(`${selected.length-failures.length}/${selected.length} game routes launched, took basic input, and started the mission clock`);
    for (const [slug, error] of failures) console.error(slug, error);
    if (failures.length) process.exitCode = 1;
    if (!requested.size || process.env.ARCADE_REPRESENTATIVE) {
      await testMedal(context,origin);
      await testMobile(browser,origin);
      console.log('Verified a Bronze medal via three real Pixel Painter actions, reload persistence, narrow light portal, search, Classic ↔ Trial switch and daily launch/close');
    }
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve=>server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode=1; });
