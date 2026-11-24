'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const slugs = fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory() && /^\d{2,3}-/.test(e.name))
  .map(e=>e.name).sort((a,b)=>parseInt(a)-parseInt(b));
assert.equal(slugs.length,100);

async function serve(){
  const server = http.createServer((req,res)=>{
    const route = new URL(req.url,'http://test.invalid').pathname.replace(/^\/100-games\//,'/');
    const file = path.resolve(root, '.' + route + (route.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end();return;}
    const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'}[path.extname(file)];
    if(mime)res.setHeader('Content-Type',mime);
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return server;
}
const mobile = {viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,
  colorScheme:'dark',reducedMotion:'reduce',locale:'en-US'};

async function withGame(page,origin,slug){
  const faults=[];
  const listener=e=>faults.push(e.message);
  page.on('pageerror',listener);
  try {
    const result = await page.goto(new URL(slug+'/?mode=plus&edition=daylight',origin).href,{waitUntil:'domcontentloaded',timeout:15000});
    assert.equal(result.status(),200);
    await page.waitForFunction(()=>window.ArcadeAudioLifecycle && window.__arcadeMissionSource &&
      document.getElementById('aaa-arcade-host')?.shadowRoot?.getElementById('arcadeMissionButton'),null,{timeout:5000});
    const summary = await page.evaluate(()=>{
      const doc = document.documentElement, rootStyle = getComputedStyle(doc), body = getComputedStyle(document.body);
      const rgb = s => [...String(s).matchAll(/[0-9.]+/g)].slice(0,3).map(m=>Number(m[0]));
      const bright = s => {const a=rgb(s);return a.length===3 && .2126*a[0]+.7152*a[1]+.0722*a[2]>=175;};
      const element = document.getElementById('aaa-arcade-host')?.shadowRoot?.getElementById('arcadeMissionButton');
      const f = window.ARCADE_FEATURES?.find(f=>Number(f.id) === window.__arcadeMissionSource.id);
      const overflow = Math.max(doc.scrollWidth,document.body.scrollWidth)-innerWidth;
      const offenders = overflow > 2 ? Array.from(document.body.querySelectorAll('*')).map(el=>{
        const b=el.getBoundingClientRect();return {name:el.tagName+'#'+el.id+'.'+String(el.className?.baseVal??el.className).slice(0,50),l:Math.round(b.left),r:Math.round(b.right),w:Math.round(b.width)};
      }).filter(x=>x.w>4&&(x.r>innerWidth+2||x.l < -2)).sort((a,b)=>b.r-a.r).slice(0,8) : [];
      return { width:innerWidth, overflow, offenders,
        scheme:rootStyle.colorScheme || body.colorScheme, background:body.backgroundColor, rootBackground:rootStyle.backgroundColor,
        bright:bright(body.backgroundColor)||bright(rootStyle.backgroundColor),
        plus:element?.textContent.includes('Arcade+'), adapter:window.__arcadeMissionSource.id,
        feature:!!(f?.name && f?.description), audioIdle:window.ArcadeAudioLifecycle.state().running===0 };
    });
    assert.equal(summary.adapter,parseInt(slug));
    assert(summary.scheme.includes('light'),`Expected light scheme: ${JSON.stringify(summary)}`);
    assert(summary.bright,`Expected bright real body/stage base: ${JSON.stringify(summary)}`);
    assert(summary.overflow <= 2,`Page scrolls horizontally: ${JSON.stringify(summary)}`);
    assert(summary.plus && summary.feature,'Native feature lost its discoverability/route');
    assert(summary.audioIdle,'Unexpected audio without a title gesture');
    assert.deepEqual(faults,[]);
    return summary;
  } finally {page.off('pageerror',listener);}
}
async function portalAndAudio(context,origin) {
  const page = await context.newPage();
  const started = performance.now();
  try{
    await page.goto(origin+'?edition=daylight',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelectorAll('#allGrid .game-card').length===100);
    const portal = await page.evaluate(()=>({
      scheme:getComputedStyle(document.documentElement).colorScheme,
      background:getComputedStyle(document.body).backgroundColor,
      excess:document.documentElement.scrollWidth-innerWidth, width:innerWidth,
      darkPref:matchMedia('(prefers-color-scheme: dark)').matches
    }));
    assert(portal.darkPref && portal.scheme.includes('light') && portal.excess<=1,JSON.stringify(portal));
    if (process.env.ARCADE_PLAYTEST_SHOTS) {
      fs.mkdirSync(process.env.ARCADE_PLAYTEST_SHOTS,{recursive:true});
      await page.screenshot({path:path.join(process.env.ARCADE_PLAYTEST_SHOTS,'daylight-mobile-library.png')});
    }
    const a = page.locator('#allGrid a[data-game-id="2"]');
    await a.tap({timeout:8000});
    const frame = page.frameLocator('#playerFrame');
    await frame.locator('#arcadeMissionButton').waitFor({timeout:8000});
    const source = await page.locator('#playerFrame').getAttribute('src');
    assert.match(source,/mode=plus/,'normal gallery launch must show new rules');
    const gesture = async () => {
      const start = frame.locator('#restartBtn');
      if (await start.isVisible()) await start.tap({timeout:8000});
      else await frame.locator('#game').tap({timeout:8000});
    };
    await gesture();
    await page.evaluate(async()=>{
      const oldFrame = document.getElementById('playerFrame'), win = oldFrame.contentWindow;
      const lifecycle = win.ArcadeAudioLifecycle;
      const native = new win.AudioContext(), another = new win.AudioContext();
      const amp = native.createGain(); amp.gain.value=.00001; amp.connect(native.destination);
      const oscillator = native.createOscillator(); oscillator.connect(amp); oscillator.start();
      await native.resume(); await another.resume();
      window.__audioQA={oldFrame,lifecycle,native,another};
    });
    await page.waitForFunction(()=>window.__audioQA.lifecycle.state().running>=2,null,{timeout:5000});
    await page.evaluate(()=>{
      Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(()=>window.__audioQA.lifecycle.state().running===0,null,{timeout:5000});
    await page.evaluate(()=>{
      delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await page.evaluate(()=>window.__audioQA.lifecycle.state().active),false,'foregrounding must not autoplay');
    await gesture();
    await page.waitForFunction(()=>window.__audioQA.lifecycle.state().running>=2,null,{timeout:5000});
    await page.goBack({waitUntil:'commit'});
    await page.waitForFunction(()=>!document.getElementById('playerOverlay').open &&
      window.__audioQA.lifecycle.state().destroyed && window.__audioQA.native.state==='closed' &&
      window.__audioQA.another.state==='closed' && !window.__audioQA.oldFrame.isConnected,null,{timeout:6000});
    // Warm relaunch of the same title must mount a different document and stay silent.
    await a.tap({timeout:8000});
    await page.frameLocator('#playerFrame').locator('#arcadeMissionButton').waitFor();
    assert(await page.evaluate(()=>{
      const fresh = document.getElementById('playerFrame');
      return fresh !== window.__audioQA.oldFrame && fresh.contentWindow.ArcadeAudioLifecycle.state().running===0;
    }));
    // A switch while playing also disposes the old document, not merely hides it.
    await page.evaluate(()=>{const f=document.getElementById('playerFrame');window.__switchQA={iframe:f,owner:f.contentWindow.ArcadeAudioLifecycle};});
    await page.locator('#classicModeBtn').tap({timeout:8000});
    await page.frameLocator('#playerFrame').locator('#arcadeMissionButton').waitFor();
    assert(await page.evaluate(()=>window.__switchQA.owner.state().destroyed && !window.__switchQA.iframe.isConnected));
    await page.locator('#closePlayerBtn').tap({timeout:8000});
    await page.locator('#playerOverlay').waitFor({state:'hidden'});
    // Cold deep-link from a new navigation after warm exit.
    await page.goto(origin+'?edition=daylight&cold=1#play=07-whack-a-mole&mode=plus',{waitUntil:'domcontentloaded'});
    await page.frameLocator('#playerFrame').locator('#arcadeMissionButton').waitFor();
    const deep = await page.evaluate(()=>{
      const f=document.getElementById('playerFrame'), d=f.contentDocument;
      return {route:f.getAttribute('src'), retained:getComputedStyle(document.documentElement).colorScheme,
        controls:document.getElementById('playerOverlay').scrollWidth<=innerWidth+2,
        viewport:d.documentElement.scrollWidth<=f.contentWindow.innerWidth+2};
    });
    assert.match(deep.route,/07-whack-a-mole.*mode=plus/);
    assert(deep.retained.includes('light') && deep.controls && deep.viewport,JSON.stringify(deep));
    const whack = page.frameLocator('#playerFrame');
    await whack.locator('#startBtn').tap({timeout:6000});
    await whack.locator('.mole.up').waitFor({timeout:5000});
    const hiddenCount = await whack.locator('.mole:not(.up)').evaluateAll(moles=>moles.filter(mole=>getComputedStyle(mole).visibility==='hidden').length);
    assert(hiddenCount >= 7,'inactive Whack-a-Mole targets must not peek below their holes');
    if (process.env.ARCADE_PLAYTEST_SHOTS) {
      await page.screenshot({path:path.join(process.env.ARCADE_PLAYTEST_SHOTS,'daylight-mobile-whack.png')});
    }
    return { whack_dormant_targets_hidden:hiddenCount, portal_dark_preference:portal.darkPref, cached_path_relaunch:true, cold_deep_link:true,
      two_owned_contexts_silenced_and_closed:true, playback_requires_gesture:true, no_mobile_horizontal_overflow:true,
      elapsed_ms:Math.round(performance.now()-started) };
  } finally { await page.close(); }
}

async function fullscreenScenarios(browser,origin) {
  const target = origin+'?edition=daylight#play=37-checkers&mode=plus';
  const desk = await browser.newContext({viewport:{width:980,height:760}});
  let native = false;
  try {
    const page = await desk.newPage();
    await page.goto(target,{waitUntil:'domcontentloaded'});
    await page.frameLocator('#playerFrame').locator('#arcadeMissionButton').waitFor();
    const supports = await page.evaluate(()=>document.fullscreenEnabled && !!document.getElementById('gamePresentation').requestFullscreen);
    assert(supports,'Chromium must expose a native fullscreen API for this scenario');
    await page.evaluate(()=>{
      const f=document.getElementById('playerFrame'); window.__fullQA={frame:f,document:f.contentDocument};
    });
    await page.getByRole('button',{name:'Fullscreen',exact:true}).click();
    await page.waitForFunction(()=>document.fullscreenElement===document.getElementById('gamePresentation') &&
      document.getElementById('playerOverlay').dataset.presentation==='native',null,{timeout:5000});
    assert(await page.evaluate(()=>window.__fullQA.frame===document.getElementById('playerFrame') &&
      window.__fullQA.document===document.getElementById('playerFrame').contentDocument));
    await page.getByRole('button',{name:'Exit fullscreen',exact:true}).click();
    await page.waitForFunction(()=>!document.fullscreenElement &&
      !document.getElementById('playerOverlay').dataset.presentation,null,{timeout:5000});
    assert(await page.evaluate(()=>window.__fullQA.frame===document.getElementById('playerFrame')));
    native = true;
  } finally {await desk.close();}
  const phone = await browser.newContext(mobile);
  try {
    const page = await phone.newPage();
    await page.goto(target,{waitUntil:'domcontentloaded'});
    await page.frameLocator('#playerFrame').locator('#arcadeMissionButton').waitFor();
    await page.evaluate(()=>{
      Object.defineProperty(document,'fullscreenEnabled',{configurable:true,value:true});
      document.getElementById('gamePresentation').requestFullscreen=()=>{
        window.__fullRejects=(window.__fullRejects||0)+1;
        return Promise.reject(new DOMException('Fullscreen unavailable in this test','NotAllowedError'));
      };
      const f=document.getElementById('playerFrame');window.__fullQA={frame:f,document:f.contentDocument};
    });
    await page.getByRole('button',{name:'Fullscreen',exact:true}).tap();
    await page.waitForFunction(()=>window.__fullRejects===1 && document.getElementById('playerOverlay').dataset.presentation==='immersive');
    assert(await page.getByRole('button',{name:'Exit fullscreen',exact:true}).isVisible());
    assert(await page.evaluate(()=>{
      const stage = document.getElementById('gamePresentation').getBoundingClientRect();
      const f = document.getElementById('playerFrame');
      return Math.round(stage.width)===innerWidth && stage.height>=innerHeight-2 &&
        f===window.__fullQA.frame && f.contentDocument===window.__fullQA.document;
    }), 'fallback must fill the usable portrait viewport without reloading the game');
    const controlsSeparated=()=>page.evaluate(()=>{
      const exit=document.getElementById('exitScreenBtn').getBoundingClientRect();
      const frame=document.getElementById('playerFrame').getBoundingClientRect();
      return frame.top>=exit.bottom+4;
    });
    assert(await controlsSeparated(),'the fullscreen exit must not cover any game or audio controls');
    const colors=await page.frameLocator('#playerFrame').locator('h1').evaluate(title=>{
      const rgb=s=>[...s.matchAll(/[\d.]+/g)].slice(0,3).map(m=>Number(m[0]));
      const luminosity=c=>c.map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;})
        .reduce((v,n,i)=>v+n*[.2126,.7152,.0722][i],0);
      const l=luminosity(rgb(getComputedStyle(title).color));
      const k=luminosity([225,229,235]);
      return (Math.max(l,k)+.05)/(Math.min(l,k)+.05);
    });
    assert(colors>=4.5,'the light Checkers title must stay legible');
    if (process.env.ARCADE_PLAYTEST_SHOTS) await page.screenshot({path:path.join(process.env.ARCADE_PLAYTEST_SHOTS,'daylight-mobile-checkers-immersive.png')});
    await page.setViewportSize({width:844,height:390});
    await page.waitForFunction(()=>{
      const stage=document.getElementById('gamePresentation').getBoundingClientRect();
      return stage.width>stage.height && stage.height>=innerHeight-2;
    });
    assert(await controlsSeparated(),'landscape must also keep fullscreen and game controls separated');
    await page.goBack({waitUntil:'commit'});
    await page.waitForFunction(()=>document.getElementById('playerOverlay').open &&
      !document.getElementById('playerOverlay').dataset.presentation &&
      window.__fullQA.frame===document.getElementById('playerFrame'));
    await page.getByRole('button',{name:'Fullscreen',exact:true}).tap();
    await page.waitForFunction(()=>document.getElementById('playerOverlay').dataset.presentation==='immersive');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.getElementById('playerOverlay').open &&
      !document.getElementById('playerOverlay').dataset.presentation &&
      window.__fullQA.frame===document.getElementById('playerFrame'));
    await page.evaluate(()=>Object.defineProperty(document,'fullscreenEnabled',{configurable:true,value:false}));
    await page.getByRole('button',{name:'Fullscreen',exact:true}).tap();
    await page.waitForFunction(()=>document.getElementById('playerOverlay').dataset.presentation==='immersive');
    assert.equal(await page.evaluate(()=>window.__fullRejects),2,'unavailable native API should not be called');
    await page.getByRole('button',{name:'Exit fullscreen',exact:true}).tap();
    await page.waitForFunction(()=>document.getElementById('playerOverlay').open && !document.getElementById('playerOverlay').dataset.presentation);
    await page.setViewportSize({width:320,height:700});
    await page.waitForFunction(()=>{
      const bar=document.querySelector('.player-bar');
      return bar && bar.scrollWidth<=innerWidth+1 &&
        [...bar.querySelectorAll('button')].filter(b=>!b.hidden).every(b=>b.getBoundingClientRect().right<=innerWidth+2);
    });
    return { native_fullscreen_verified:native, fallback_no_native_api:true, mobile_controls_320px_fit:true, checkers_rejected_native_used_fallback:true,
      fallback_portrait_landscape:true, fallback_controls_do_not_overlap:true, fallback_back_and_escape_preserved_frame:true };
  } finally { await phone.close(); }
}

(async()=>{
  const server=process.env.ARCADE_ORIGIN?null:await serve();
  const origin=process.env.ARCADE_ORIGIN || `http://127.0.0.1:${server.address().port}/100-games/`;
  let browser;
  try{
    browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
    const c=await browser.newContext(mobile);
    const selected = process.env.ARCADE_FILTER ? new Set(process.env.ARCADE_FILTER.split(',').map(Number)) : null;
    const titles = selected ? slugs.filter(s=>selected.has(parseInt(s))) : slugs;
    const failures=[], events=[];
    let next=0;
    await Promise.all(Array.from({length:4},async()=>{
      const page=await c.newPage();
      for(let i;(i=next++)<titles.length;){
        try{events.push({slug:titles[i],...await withGame(page,origin,titles[i])});}
        catch(e){failures.push({slug:titles[i],error:e.message});}
      }
      await page.close();
    }));
    console.log(`Daylight / Arcade+ mobile portrait: ${events.length}/${titles.length}`);
    for(const f of failures)console.error(f.slug, f.error);
    if(failures.length)process.exitCode=1;
    const flows = {...await portalAndAudio(c,origin),...await fullscreenScenarios(browser,origin)};
    console.log('Cold + warm mobile paths, light over dark preference, two WebAudio contexts, background + Back + warm relaunch + mode switch, native fullscreen, and Checkers fallback portrait/landscape with Back + Escape passed');
    if(process.env.ARCADE_PLAYTEST_REPORT) fs.writeFileSync(process.env.ARCADE_PLAYTEST_REPORT,JSON.stringify({
      schema:1, run_id:process.env.GITHUB_RUN_ID||null, revision:process.env.GITHUB_SHA||null, browser:browser.version(),
      device:{viewport:mobile.viewport,dpr:mobile.deviceScaleFactor,hasTouch:mobile.hasTouch,colorScheme:mobile.colorScheme},
      title_routes:{passed:events.length,planned:titles.length}, flows, failed_routes:failures,
      methods:['CSS color-scheme and computed bright document base','responsive viewport containment and variant discoverability per route','real Web Audio contexts with visibility, Back, reopen and mode change'],
      limitations:['Emulated Android-sized Chromium viewport, not a physical Brave device','Real browser smoke, not complete manual playthrough of every title','No site visitor analytics or telemetry'],
      titles:events.sort((a,b)=>a.adapter-b.adapter)
    },null,2)+'\n');
  } finally {if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
