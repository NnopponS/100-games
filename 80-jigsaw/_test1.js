const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  const file = 'file:///D:/Experiment/100-games/80-jigsaw/index.html';
  await page.goto(file);
  await page.waitForTimeout(700);

  const info = await page.evaluate(() => {
    const pieces = [...document.querySelectorAll('.piece')];
    return {
      pieces: pieces.length,
      board: document.getElementById('board').getBoundingClientRect().toJSON(),
      pieceRects: pieces.slice(0, 3).map(p => p.getBoundingClientRect().toJSON()),
      hud: document.getElementById('hudPlaced').textContent,
      canvasSizes: pieces.slice(0, 2).map(p => {
        const c = p.querySelector('canvas');
        return { w: c.width, h: c.height, cssW: c.style.width, cssH: c.style.height };
      })
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'D:/Experiment/100-games/80-jigsaw/_shot1.png' });
  console.log('errors:', errors);
  await browser.close();
})();
