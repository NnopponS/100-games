const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 820 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  const url = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await page.goto(url);
  await page.waitForTimeout(300);

  const info = () => page.evaluate(() => ({
    cols: document.querySelectorAll('.column').length,
    cards: document.querySelectorAll('.column .card').length,
    stock: document.querySelectorAll('#stock .card.back').length,
    waste: document.querySelectorAll('#waste .card').length,
    wasteTop: (document.querySelector('#wasteTop') || {}).innerText || '',
    playable: document.querySelectorAll('.card.playable').length,
    overlay: !document.getElementById('overlay').classList.contains('hidden'),
    hudLeft: document.getElementById('hudLeft').textContent,
    hudStock: document.getElementById('hudStock').textContent,
    hudMoves: document.getElementById('hudMoves').textContent,
    bar: document.getElementById('hudBar').style.width
  }));

  const s0 = await info();
  console.log('INIT', JSON.stringify(s0));
  if (s0.cols !== 7) throw new Error('expected 7 columns');
  if (s0.cards !== 35) throw new Error('expected 35 tableau cards');
  if (s0.stock !== 1 || s0.hudStock !== '16') throw new Error('expected 16 in stock');
  if (s0.waste !== 1) throw new Error('expected 1 waste card');

  // --- test undo ---
  let before = await info();
  if (before.playable > 0) {
    await page.locator('.card.playable').first().click();
    await page.waitForTimeout(400);
    const afterMove = await info();
    console.log('AFTER MOVE', JSON.stringify(afterMove));
    if (Number(afterMove.hudLeft) !== Number(before.hudLeft) - 1) throw new Error('move did not remove tableau card');
    if (Number(afterMove.hudMoves) !== 1) throw new Error('move counter wrong');
    await page.click('#btnUndo');
    await page.waitForTimeout(250);
    const afterUndo = await info();
    console.log('AFTER UNDO', JSON.stringify(afterUndo));
    if (afterUndo.hudLeft !== before.hudLeft || afterUndo.hudMoves !== '0') throw new Error('undo failed');
  } else {
    console.log('no playable at start, skipping undo test');
  }

  // --- test deal ---
  const preDeal = await info();
  await page.click('#stock');
  await page.waitForTimeout(400);
  const postDeal = await info();
  console.log('AFTER DEAL', JSON.stringify(postDeal));
  if (Number(postDeal.hudStock) !== Number(preDeal.hudStock) - 1) throw new Error('deal did not consume stock');

  // --- greedy autoplay ---
  let steps = 0;
  while (steps < 400) {
    const st = await info();
    if (st.overlay) break;
    if (st.playable > 0) {
      await page.locator('.card.playable').first().click({ timeout: 2000 }).catch(() => {});
    } else if (Number(st.hudStock) > 0) {
      await page.click('#stock').catch(() => {});
    } else {
      break;
    }
    await page.waitForTimeout(340);
    steps++;
  }
  const end = await info();
  console.log('END', JSON.stringify(end), 'steps=' + steps);
  console.log('OVERLAY TEXT:', (await page.locator('#overlay').innerText()).replace(/\n+/g, ' | '));

  await page.screenshot({ path: 'shot-end.png', fullPage: true });

  // --- new game ---
  await page.click('#ovNew').catch(async () => { await page.click('#btnNew'); });
  await page.waitForTimeout(300);
  const fresh = await info();
  console.log('FRESH', JSON.stringify(fresh));
  if (fresh.cards !== 35 || fresh.overlay) throw new Error('restart failed');
  await page.screenshot({ path: 'shot-start.png', fullPage: true });

  // --- mobile viewport check ---
  await page.setViewportSize({ width: 380, height: 720 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'shot-mobile.png', fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  console.log('MOBILE_HORIZONTAL_OVERFLOW', overflow);

  console.log('CONSOLE_ERRORS', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error('TEST_FAILED:', e.message); process.exit(1); });
