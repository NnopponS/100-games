const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync('index.html', 'utf8');
const marker = '  /* ---------------- Boot ---------------- */\n  newGame();';
if (!src.includes(marker)) throw new Error('marker not found');
const hook = `  window.__t = {
    set: function (c, w, s) { cols = c; waste = w; stock = s; over = false; busy = false; history = []; moves = 0; hideOverlay(); render(); },
    settle: settle,
    state: function () { return { cols: cols, stock: stock, waste: waste, over: over, moves: moves }; }
  };
  newGame();`;
fs.writeFileSync('_wintest.html', src.replace(marker, hook));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 820 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('file:///' + path.resolve('_wintest.html').replace(/\\/g, '/'));
  await page.waitForTimeout(300);

  const C = (r, s) => ({ r: r, s: s });
  const set = (c, w, s) => page.evaluate(([c, w, s]) => window.__t.set(c, w, s), [c, w, s]);
  const isPlayable = () => page.evaluate(() => !!document.querySelector('.column .card.playable'));
  const overlay = () => page.evaluate(() => ({
    visible: !document.getElementById('overlay').classList.contains('hidden'),
    title: document.getElementById('ovTitle').textContent,
    msg: document.getElementById('ovMsg').textContent,
    lose: document.getElementById('panel').classList.contains('lose')
  }));

  const cases = [
    ['K on A (wrap)', C('K', 0), C('A', 1), true],
    ['2 on A', C('2', 0), C('A', 1), true],
    ['Q on A', C('Q', 0), C('A', 1), false],
    ['9 on 8', C('9', 0), C('8', 1), true],
    ['7 on 8', C('7', 0), C('8', 1), true],
    ['10 on 8', C('10', 0), C('8', 1), false],
    ['A on K (wrap)', C('A', 0), C('K', 1), true],
    ['same rank', C('5', 0), C('5', 1), false],
  ];
  for (const [name, card, top, expected] of cases) {
    await set([[card]], [top], []);
    const got = await isPlayable();
    console.log((got === expected ? 'PASS' : 'FAIL') + ' rule ' + name + ' -> ' + got);
    if (got !== expected) throw new Error('rule failed: ' + name);
  }

  // WIN: play last card
  await set([[C('2', 0)]], [C('A', 1)], []);
  await page.locator('.column .card.playable').click();
  await page.waitForTimeout(900);
  const win = await overlay();
  console.log('WIN OVERLAY', JSON.stringify(win));
  if (!win.visible || win.title !== 'You Win!' || win.lose) throw new Error('win overlay wrong');
  await page.screenshot({ path: 'shot-win.png', fullPage: true });

  // Undo from win overlay restores play
  await page.click('#ovUndo');
  await page.waitForTimeout(400);
  const afterUndo = await overlay();
  const st = await page.evaluate(() => window.__t.state());
  console.log('UNDO AFTER WIN', JSON.stringify(afterUndo), 'left=', st.cols[0].length, 'over=', st.over);
  if (afterUndo.visible || st.cols[0].length !== 1 || st.over) throw new Error('undo after win failed');

  // LOSE: no moves, empty stock
  await set([[C('5', 0)]], [C('K', 1)], []);
  await page.evaluate(() => window.__t.settle());
  await page.waitForTimeout(700);
  const lose = await overlay();
  console.log('LOSE OVERLAY', JSON.stringify(lose));
  if (!lose.visible || lose.lose || lose.title !== 'Out of Moves') throw new Error('lose overlay wrong');
  await page.screenshot({ path: 'shot-lose.png', fullPage: true });

  // Restart from lose overlay
  await page.click('#ovNew');
  await page.waitForTimeout(400);
  const fresh = await page.evaluate(() => ({
    cards: document.querySelectorAll('.column .card').length,
    stock: document.getElementById('hudStock').textContent,
    overlay: !document.getElementById('overlay').classList.contains('hidden')
  }));
  console.log('RESTART', JSON.stringify(fresh));
  if (fresh.cards !== 35 || fresh.stock !== '16' || fresh.overlay) throw new Error('restart failed');

  // Deal to empty stock does nothing bad
  await page.evaluate(() => window.__t.set([[{ r: '5', s: 0 }]], [{ r: 'K', s: 1 }], []));
  await page.click('#stock');
  await page.waitForTimeout(300);
  console.log('EMPTY STOCK CLICK OK');

  // Final desktop + mobile screenshots with settled animations
  await page.evaluate(() => window.__t.set([[{ r: '7', s: 0 }], [{ r: '9', s: 1 }]], [{ r: '8', s: 2 }], []));
  await page.waitForTimeout(300);
  console.log('CONSOLE_ERRORS', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error('TEST_FAILED:', e.message); process.exit(1); });
