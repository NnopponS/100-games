/* AAA Arcade Enhancement Layer — Procedural WebAudio, Juice FX, Safe Pause & Smart Mini-HUD */
(() => {
  if (window.__AAA_ARCADE_INIT__) return;
  window.__AAA_ARCADE_INIT__ = true;

  const isFramed = (() => { try { return window.self !== window.top; } catch { return true; } })();
  const isTypingGame = /\/(22-hangman|23-wordle-clone|27-typing-racer|61-word-scramble)\b/i.test(location.pathname);

  const pref = {
    sfx: localStorage.getItem('aaa_sfx') !== '0',
    bgm: localStorage.getItem('aaa_bgm') === '1',
    fx:  localStorage.getItem('aaa_fx')  !== '0',
    min: localStorage.getItem('aaa_min') === '1'
  };

  // --- 1. Procedural WebAudio Engine ---
  let actx = null;
  let bgmTimer = null;
  let bgmStep = 0;

  function ensureAudio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) actx = new AC();
    }
    if (actx && actx.state === 'suspended') {
      actx.resume().catch(() => {});
    }
    return actx;
  }

  function tone(freq, dur, type = 'sine', vol = 0.09, slideTo = null) {
    if (!pref.sfx) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + dur);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch {}
  }

  const sfx = {
    tap: () => tone(520, 0.06, 'triangle', 0.055, 320),
    move: () => tone(340, 0.045, 'sine', 0.035, 420),
    score: (combo = 1) => {
      const base = 523.25 * Math.pow(1.06, Math.min(12, combo - 1));
      tone(base, 0.09, 'triangle', 0.08, base * 1.25);
      setTimeout(() => tone(base * 1.5, 0.12, 'sine', 0.07), 45);
    },
    win: () => {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        setTimeout(() => tone(f, 0.18, 'triangle', 0.085), i * 80);
      });
    },
    over: () => {
      [392, 349.23, 311.13, 261.63].forEach((f, i) => {
        setTimeout(() => tone(f, 0.2, 'sawtooth', 0.045), i * 110);
      });
    }
  };

  function updateBgm() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
    if (!pref.bgm) return;
    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 392.0];
    bgmTimer = setInterval(() => {
      if (paused || !pref.bgm) return;
      const ctx = ensureAudio();
      if (!ctx || ctx.state !== 'running') return;
      try {
        const f = notes[bgmStep % notes.length];
        bgmStep++;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f * 0.5, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.025, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.34);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.36);
      } catch {}
    }, 360);
  }

  // --- 2. Pause Engine (Safe rAF Wrapper with Timestamp Compensation) ---
  let paused = false;
  let pauseStart = 0;
  let pausedAccum = 0;
  const origRAF = window.requestAnimationFrame.bind(window);
  const pausedQueue = [];

  window.requestAnimationFrame = function(cb) {
    if (paused) {
      pausedQueue.push(cb);
      return -1;
    }
    return origRAF(ts => cb(Math.max(0, ts - pausedAccum)));
  };

  function setPaused(next) {
    if (paused === next) return;
    paused = next;
    if (paused) {
      pauseStart = performance.now();
    } else {
      pausedAccum += Math.max(0, performance.now() - pauseStart);
      const q = pausedQueue.splice(0, pausedQueue.length);
      for (const cb of q) origRAF(ts => cb(Math.max(0, ts - pausedAccum)));
    }
    renderHud();
  }

  // --- 3. Particle, Shockwave & Floating Combo FX Canvas (Inside Shadow DOM for 100% CSS Isolation) ---
  const host = document.createElement('div');
  host.id = 'aaa-arcade-host';
  const shadow = host.attachShadow({ mode: 'open' });
  const pauseHint = isTypingGame ? 'F2' : 'P / F2';
  shadow.innerHTML = `
    <style>
      #fxCanvas {
        position: fixed !important; inset: 0 !important;
        width: 100vw !important; height: 100vh !important;
        pointer-events: none !important; z-index: 99990 !important;
        background: transparent !important; border: none !important;
        margin: 0 !important; padding: 0 !important; border-radius: 0 !important;
        box-shadow: none !important; display: block !important;
      }
      .hud {
        position: fixed; top: 8px; right: 10px; z-index: 99999;
        display: flex; align-items: center; gap: 4px;
        background: rgba(12, 15, 28, 0.86);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.14);
        padding: 4px 6px; border-radius: 999px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.45);
        font-family: system-ui, -apple-system, sans-serif;
      }
      .hud.min .extra { display: none; }
      button, a {
        border: none; background: rgba(255,255,255,0.08); color: #e2e8f0;
        height: 24px; padding: 0 8px; border-radius: 999px;
        font-size: 11px; font-weight: 800; cursor: pointer;
        display: inline-flex; align-items: center; gap: 3px;
        text-decoration: none; transition: .15s; font-family: inherit;
      }
      button:hover, a:hover { background: rgba(255,255,255,0.2); color: #fff; }
      button.on { background: rgba(108, 92, 231, 0.48); color: #fff; border: 1px solid rgba(167,139,250,0.5); }
      .pause-curtain {
        position: fixed; inset: 0; z-index: 99995;
        background: rgba(9, 11, 20, 0.78);
        backdrop-filter: blur(8px);
        display: none; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
        font-family: system-ui, -apple-system, sans-serif; color: #fff;
      }
      .pause-curtain.open { display: flex; }
      .pause-card {
        background: #171b2e; border: 1px solid rgba(255,255,255,0.14);
        border-radius: 20px; padding: 26px 32px; text-align: center;
        box-shadow: 0 24px 60px rgba(0,0,0,0.65); display: flex; flex-direction: column; gap: 12px; min-width: 260px;
      }
      .pause-card h2 { margin: 0; font-size: 1.5rem; letter-spacing: 0.06em; color: #a78bfa; }
      .pbtn {
        height: 40px; justify-content: center; font-size: 0.95rem;
        background: linear-gradient(135deg, #6c5ce7, #8b5cf6); color: #fff;
      }
    </style>
    <canvas id="fxCanvas"></canvas>
    <div class="hud" id="hudBar">
      <button id="btnMin" title="Collapse/Expand AAA HUD">🎮</button>
      <button class="extra" id="btnSfx" title="Toggle Sound Effects">🔊</button>
      <button class="extra" id="btnBgm" title="Toggle Arcade Music">🎵</button>
      <button class="extra" id="btnFx" title="Toggle Particles & FX">✨</button>
      <button class="extra" id="btnPause" title="Pause (${pauseHint})">⏸</button>
      <button class="extra" id="btnRestart" title="Restart Game">↺</button>
      <a class="extra" id="btnHome" href="../index.html" title="Back to 100 Games Library">🏠</a>
    </div>
    <div class="pause-curtain" id="pauseCurtain">
      <div class="pause-card">
        <h2>PAUSED</h2>
        <button class="pbtn" id="resumeBtn">▶ Resume Game (${pauseHint})</button>
        <button id="restartBtn2" style="height:36px;justify-content:center">↺ Restart Game</button>
      </div>
    </div>
  `;

  const fxCanvas = shadow.getElementById('fxCanvas');
  const fxCtx = fxCanvas.getContext('2d');
  const particles = [];
  const popups = [];
  let flashAlpha = 0;
  let fxRunning = false;

  function resizeFx() {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', () => { resizeFx(); placeHudSafely(); });

  function burst(x, y, color = '#38bdf8', count = 10) {
    if (!pref.fx) return;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = 60 + Math.random() * 140;
      particles.push({
        x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        r: 2.2 + Math.random() * 2.8, life: 0.48, maxLife: 0.48, color
      });
    }
    startFxLoop();
  }

  function popup(x, y, text, color = '#fde047') {
    if (!pref.fx) return;
    popups.push({ x, y, text, color, life: 0.85, maxLife: 0.85 });
    startFxLoop();
  }

  function flashEdge(strength = 0.22) {
    if (!pref.fx || paused) return;
    flashAlpha = Math.max(flashAlpha, strength);
    startFxLoop();
  }

  let lastFx = performance.now();
  function startFxLoop() {
    if (fxRunning) return;
    fxRunning = true;
    lastFx = performance.now();
    origRAF(stepFx);
  }
  function stepFx(now) {
    const dt = Math.min(0.05, (now - lastFx) / 1000);
    lastFx = now;
    if (fxCtx) {
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      if (flashAlpha > 0.01) {
        const g = fxCtx.createRadialGradient(
          fxCanvas.width/2, fxCanvas.height/2, fxCanvas.width*0.25,
          fxCanvas.width/2, fxCanvas.height/2, fxCanvas.width*0.72
        );
        g.addColorStop(0, 'rgba(250,204,21,0)');
        g.addColorStop(1, `rgba(250,204,21,${flashAlpha.toFixed(3)})`);
        fxCtx.fillStyle = g;
        fxCtx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);
        flashAlpha = Math.max(0, flashAlpha - dt * 1.1);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 220 * dt;
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        fxCtx.globalAlpha = Math.max(0, p.life / p.maxLife);
        fxCtx.fillStyle = p.color;
        fxCtx.beginPath(); fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); fxCtx.fill();
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const u = popups[i];
        u.y -= 36 * dt;
        u.life -= dt;
        if (u.life <= 0) { popups.splice(i, 1); continue; }
        fxCtx.globalAlpha = Math.max(0, u.life / u.maxLife);
        fxCtx.font = '900 18px system-ui, sans-serif';
        fxCtx.textAlign = 'center';
        fxCtx.fillStyle = u.color;
        fxCtx.shadowColor = 'rgba(0,0,0,0.8)';
        fxCtx.shadowBlur = 6;
        fxCtx.fillText(u.text, u.x, u.y);
        fxCtx.shadowBlur = 0;
      }
      fxCtx.globalAlpha = 1;
    }
    if (particles.length > 0 || popups.length > 0 || flashAlpha > 0.01) origRAF(stepFx);
    else fxRunning = false;
  }

  // --- 4. Score & State Observer for Automatic AAA Audio/FX Triggers ---
  let combo = 0;
  let lastScoreTime = 0;
  let lastKeySfx = 0;
  let lastOverSfx = 0;
  const trackedScores = new WeakMap();

  function attachScoreWatchers() {
    const candidates = document.querySelectorAll('[id*="score" i], [id*="pts" i], [id*="height" i], [id*="bag" i], [id*="caught" i], [id*="cash" i], [id*="gold" i], [id*="combo" i], .score');
    candidates.forEach(el => {
      if (el.closest('#aaa-arcade-host')) return;
      const num = parseFloat((el.textContent || '').replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(num)) trackedScores.set(el, num);
    });

    const obs = new MutationObserver(muts => {
      const now = performance.now();
      for (const m of muts) {
        const t = m.target.nodeType === 3 ? m.target.parentElement : m.target;
        if (!t || t.closest?.('#aaa-arcade-host')) continue;
        if (trackedScores.has(t)) {
          const prev = trackedScores.get(t);
          const cur = parseFloat((t.textContent || '').replace(/[^0-9.-]/g, ''));
          if (!Number.isNaN(cur) && cur > prev) {
            const delta = Math.round((cur - prev) * 10) / 10;
            trackedScores.set(t, cur);
            combo = (now - lastScoreTime < 2200) ? combo + 1 : 1;
            lastScoreTime = now;
            sfx.score(combo);
            const rect = t.getBoundingClientRect();
            const px = window.innerWidth * 0.5 + (Math.random() - 0.5) * 80;
            const py = Math.max(70, rect.bottom + 28);
            const label = combo >= 3 ? `+${delta} 🔥 x${combo}` : `+${delta}`;
            popup(px, py, label, combo >= 3 ? '#f472b6' : '#fde047');
            burst(px, py, '#fde047', 12);
            if (delta >= 25 || combo >= 4) flashEdge(0.18);
          } else if (!Number.isNaN(cur)) {
            trackedScores.set(t, cur);
          }
        }
        const txt = (t.textContent || '').toUpperCase();
        if (now - lastOverSfx > 2500 && (txt.includes('GAME OVER') || txt.includes('VICTORY') || txt.includes('YOU WIN') || txt.includes('COMPLETE!'))) {
          const st = getComputedStyle(t);
          if (st.display !== 'none' && st.visibility !== 'hidden') {
            lastOverSfx = now;
            if (txt.includes('WIN') || txt.includes('VICTORY') || txt.includes('COMPLETE')) sfx.win();
            else { sfx.over(); flashEdge(0.28); }
          }
        }
      }
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true });
  }

  // --- 5. HUD References ---
  const hudBar = shadow.getElementById('hudBar');
  const btnMin = shadow.getElementById('btnMin');
  const btnSfx = shadow.getElementById('btnSfx');
  const btnBgm = shadow.getElementById('btnBgm');
  const btnFx = shadow.getElementById('btnFx');
  const btnPause = shadow.getElementById('btnPause');
  const btnRestart = shadow.getElementById('btnRestart');
  const btnHome = shadow.getElementById('btnHome');
  const pauseCurtain = shadow.getElementById('pauseCurtain');

  if (isFramed) btnHome.style.display = 'none';

  function placeHudSafely() {
    const W = window.innerWidth, H = window.innerHeight;
    const w = hudBar.offsetWidth || 180, h = hudBar.offsetHeight || 34;
    const candidates = [
      { name: 'tr', css: { top: '8px', right: '10px', bottom: 'auto', left: 'auto' }, rect: { l: W - w - 16, t: 4, r: W, b: h + 16 } },
      { name: 'br', css: { top: 'auto', right: '10px', bottom: '8px', left: 'auto' }, rect: { l: W - w - 16, t: H - h - 16, r: W, b: H } },
      { name: 'tl', css: { top: '8px', right: 'auto', bottom: 'auto', left: '10px' }, rect: { l: 0, t: 4, r: w + 16, b: h + 16 } },
      { name: 'bl', css: { top: 'auto', right: 'auto', bottom: '8px', left: '10px' }, rect: { l: 0, t: H - h - 16, r: w + 16, b: H } }
    ];
    const controls = [...document.querySelectorAll('button, a, select, input')].filter(el => !el.closest('#aaa-arcade-host'));
    let chosen = candidates[0];
    for (const c of candidates) {
      const hit = controls.some(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.right > c.rect.l && r.left < c.rect.r && r.bottom > c.rect.t && r.top < c.rect.b;
      });
      if (!hit) { chosen = c; break; }
    }
    Object.assign(hudBar.style, chosen.css);
  }

  function renderHud() {
    hudBar.classList.toggle('min', pref.min);
    btnMin.classList.toggle('on', !pref.min);
    btnSfx.classList.toggle('on', pref.sfx);
    btnSfx.textContent = pref.sfx ? '🔊' : '🔇';
    btnBgm.classList.toggle('on', pref.bgm);
    btnFx.classList.toggle('on', pref.fx);
    btnPause.classList.toggle('on', paused);
    btnPause.textContent = paused ? '▶' : '⏸';
    pauseCurtain.classList.toggle('open', paused);
  }

  btnMin.onclick = () => {
    pref.min = !pref.min; localStorage.setItem('aaa_min', pref.min ? '1' : '0');
    renderHud(); placeHudSafely();
  };
  btnSfx.onclick = () => {
    pref.sfx = !pref.sfx; localStorage.setItem('aaa_sfx', pref.sfx ? '1' : '0');
    ensureAudio(); if (pref.sfx) sfx.tap(); renderHud();
  };
  btnBgm.onclick = () => {
    pref.bgm = !pref.bgm; localStorage.setItem('aaa_bgm', pref.bgm ? '1' : '0');
    ensureAudio(); updateBgm(); renderHud();
  };
  btnFx.onclick = () => {
    pref.fx = !pref.fx; localStorage.setItem('aaa_fx', pref.fx ? '1' : '0');
    renderHud();
  };
  btnPause.onclick = () => setPaused(!paused);
  shadow.getElementById('resumeBtn').onclick = () => setPaused(false);
  btnRestart.onclick = () => location.reload();
  shadow.getElementById('restartBtn2').onclick = () => location.reload();

  window.addEventListener('pointerdown', e => {
    ensureAudio();
    if (e.composedPath().includes(host)) return;
    sfx.tap();
    burst(e.clientX, e.clientY, '#38bdf8', 7);
  }, { passive: true });

  window.addEventListener('keydown', e => {
    ensureAudio();
    const activeTag = document.activeElement?.tagName;
    const editing = ['INPUT','TEXTAREA','SELECT'].includes(activeTag) || document.activeElement?.isContentEditable;
    if (e.code === 'F2' || (e.code === 'KeyP' && !editing && !isTypingGame)) {
      e.preventDefault();
      setPaused(!paused);
      return;
    }
    const now = performance.now();
    if (now - lastKeySfx > 95 && ['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.code)) {
      lastKeySfx = now;
      sfx.move();
    }
  });

  function mount() {
    document.body.appendChild(host);
    resizeFx();
    renderHud();
    placeHudSafely();
    setTimeout(placeHudSafely, 250);
    attachScoreWatchers();
    if (pref.bgm) updateBgm();
  }

  if (document.body) mount();
  else window.addEventListener('DOMContentLoaded', mount);
})();
