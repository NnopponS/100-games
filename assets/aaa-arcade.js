/* AAA Arcade Enhancement Layer — Procedural WebAudio, Juice FX, Safe Pause & Smart Mini-HUD
   Public API: window.AAA = { sfx, tone, noise, bgm, burst, popup, flash, ensureAudio, isPaused }
   Games may use their own audio; the layer stays self-contained and safe on file:// */
(() => {
  if (window.__AAA_ARCADE_INIT__) return;
  window.__AAA_ARCADE_INIT__ = true;

  const isFramed = (() => { try { return window.self !== window.top; } catch { return true; } })();
  const isTypingGame = /\/(22-hangman|23-wordle-clone|27-typing-racer|61-word-scramble|77-farm-clicker)\b/i.test(location.pathname);

  const pref = {
    sfx: localStorage.getItem('aaa_sfx') !== '0',
    bgm: localStorage.getItem('aaa_bgm') === '1',
    fx:  localStorage.getItem('aaa_fx') === '1' || (localStorage.getItem('aaa_fx') !== '0' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    min: localStorage.getItem('aaa_min') === '1'
  };

  // --- 1. Procedural WebAudio Engine ---
  let actx = null;
  let master = null;
  let bgmTimer = null;
  let bgmStep = 0;
  let bgmIntensity = 0;

  function ensureAudio() {
    if (window.ArcadeAudioLifecycle?.isActive() === false) return null;
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          actx = new AC();
          master = actx.createGain();
          master.gain.value = 0.9;
          master.connect(actx.destination);
        } catch { actx = null; }
      }
    }
    if (actx && actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  }

  function bus() { return master || (ensureAudio() && master); }

  function tone(freq, dur, type = 'sine', vol = 0.09, slideTo = null, delay = 0) {
    if (!pref.sfx) return;
    const ctx = ensureAudio();
    const out = bus();
    if (!ctx || !out) return;
    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + dur);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0006, now + dur);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + dur + 0.03);
    } catch {}
  }

  let noiseBuffer = null;
  function noise(dur = 0.2, vol = 0.12, cutoff = 1200, delay = 0) {
    if (!pref.sfx) return;
    const ctx = ensureAudio();
    const out = bus();
    if (!ctx || !out) return;
    try {
      if (!noiseBuffer) {
        const n = Math.floor(ctx.sampleRate * 1.2);
        noiseBuffer = ctx.createBuffer(1, n, ctx.sampleRate);
        const ch = noiseBuffer.getChannelData(0);
        for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
      }
      const now = ctx.currentTime + delay;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(cutoff, now);
      filt.frequency.exponentialRampToValueAtTime(Math.max(80, cutoff * 0.35), now + dur);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);
      src.connect(filt); filt.connect(gain); gain.connect(out);
      src.start(now); src.stop(now + dur + 0.02);
    } catch {}
  }

  const sfx = {
    tap:    () => { tone(520, 0.06, 'triangle', 0.05, 320); noise(0.03, 0.02, 3000); },
    move:   () => tone(340, 0.045, 'sine', 0.032, 420),
    select: () => { tone(660, 0.05, 'triangle', 0.055); tone(990, 0.07, 'sine', 0.04, null, 0.04); },
    pop:    () => { tone(720, 0.05, 'sine', 0.07, 1180); },
    coin:   () => { tone(988, 0.07, 'square', 0.045); tone(1319, 0.12, 'square', 0.04, null, 0.06); },
    power:  () => { [440, 554, 659, 880].forEach((f, i) => tone(f, 0.14, 'triangle', 0.055, null, i * 0.05)); },
    swoosh: () => noise(0.18, 0.05, 1400),
    hit:    () => { noise(0.18, 0.16, 900); tone(150, 0.16, 'sawtooth', 0.05, 60); },
    error:  () => { tone(220, 0.12, 'square', 0.05, 160); tone(180, 0.16, 'square', 0.04, 120, 0.08); },
    level:  () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'triangle', 0.06, null, i * 0.07)); },
    tick:   () => tone(1200, 0.03, 'square', 0.03),
    score: (combo = 1) => {
      const base = 523.25 * Math.pow(1.06, Math.min(12, combo - 1));
      tone(base, 0.09, 'triangle', 0.075, base * 1.25);
      tone(base * 1.5, 0.12, 'sine', 0.06, null, 0.045);
    },
    win: () => {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, 0.18, 'triangle', 0.08, null, i * 0.08);
        tone(f * 2, 0.1, 'sine', 0.025, null, i * 0.08);
      });
    },
    over: () => {
      [392, 349.23, 311.13, 261.63].forEach((f, i) => {
        tone(f, 0.2, 'sawtooth', 0.045, null, i * 0.11);
      });
      noise(0.35, 0.05, 600, 0.05);
    }
  };

  // Adaptive synth loop: pad + bass + arp, intensity rises with combo
  const BGM_SCALE = [0, 3, 5, 7, 10, 12, 15, 12, 10, 7, 5, 3];
  const BGM_ROOTS = [130.81, 116.54, 98.0, 110.0];
  const BGM_CHORDS = [
    [261.63, 311.13, 392.0], [233.08, 277.18, 349.23],
    [196.0, 246.94, 293.66], [220.0, 261.63, 329.63]
  ];

  function updateBgm() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
    if (!pref.bgm || window.ArcadeAudioLifecycle?.isActive() === false) return;
    bgmStep = 0;
    bgmTimer = setInterval(() => {
      if (paused || !pref.bgm) return;
      const ctx = ensureAudio();
      const out = bus();
      if (!ctx || !out || ctx.state !== 'running') return;
      const step = bgmStep++;
      const bar = Math.floor(step / 8) % 4;
      const root = BGM_ROOTS[bar];
      const chord = BGM_CHORDS[bar];
      try {
        const now = ctx.currentTime;
        // bass pulse
        if (step % 2 === 0) {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(root / 2, now);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.05, now + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0005, now + 0.42);
          o.connect(g); g.connect(out); o.start(now); o.stop(now + 0.45);
        }
        // pad chord every bar
        if (step % 8 === 0) {
          chord.forEach(f => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(f / 2, now);
            g.gain.setValueAtTime(0.0001, now);
            g.gain.linearRampToValueAtTime(0.018, now + 0.25);
            g.gain.exponentialRampToValueAtTime(0.0004, now + 1.5);
            o.connect(g); g.connect(out); o.start(now); o.stop(now + 1.55);
          });
        }
        // arp sparkle
        const arp = chord[step % chord.length] * 2;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(arp, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.012 + bgmIntensity * 0.006, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0003, now + 0.16);
        o.connect(g); g.connect(out); o.start(now); o.stop(now + 0.18);
        // lead melody when intensity is up
        if (bgmIntensity > 0 && step % 2 === 1) {
          const semi = BGM_SCALE[(step * 3) % BGM_SCALE.length];
          const f = root * Math.pow(2, semi / 12);
          const o2 = ctx.createOscillator(), g2 = ctx.createGain();
          o2.type = 'triangle';
          o2.frequency.setValueAtTime(f * 2, now);
          g2.gain.setValueAtTime(0.0001, now);
          g2.gain.linearRampToValueAtTime(0.02, now + 0.015);
          g2.gain.exponentialRampToValueAtTime(0.0003, now + 0.3);
          o2.connect(g2); g2.connect(out); o2.start(now); o2.stop(now + 0.32);
        }
      } catch {}
    }, 300);
  }

  window.addEventListener('arcade100:audio-lifecycle', updateBgm);

  // --- 2. Pause Engine (Safe rAF Wrapper with Timestamp Compensation) ---
  let paused = false;
  let quietPause = false;
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

  function setPaused(next, quiet = false) {
    if (paused === next) return;
    paused = next;
    quietPause = next && quiet;
    if (paused) {
      pauseStart = performance.now();
    } else {
      pausedAccum += Math.max(0, performance.now() - pauseStart);
      const q = pausedQueue.splice(0, pausedQueue.length);
      for (const cb of q) origRAF(ts => cb(Math.max(0, ts - pausedAccum)));
    }
    renderHud();
  }

  // --- 3. SVG Icon Set (no emoji anywhere) ---
  const ICON = {
    grip: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3l4-3.2v11.4l-4-3.2H4z"/><path d="M15.5 8.4a5 5 0 0 1 0 7.2"/><path d="M18.2 5.7a8.6 8.6 0 0 1 0 12.6"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3l4-3.2v11.4l-4-3.2H4z"/><path d="M15.5 9.5l4 5M19.5 9.5l-4 5"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6.5l9-2.3v11"/><circle cx="6.6" cy="18" r="2.6"/><circle cx="15.6" cy="15.2" r="2.6"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l1.9 5.4 5.4 1.9-5.4 1.9L12 17.8l-1.9-5.4-5.4-1.9 5.4-1.9z"/><path d="M18.4 16.2l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.6" height="14" rx="1.2"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.2"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2l11 6.8-11 6.8z"/></svg>',
    restart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4.2V9h-4.8"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7"/><path d="M6.5 9.6V20h11V9.6"/><path d="M10 20v-5.4h4V20"/></svg>'
  };

  // --- 4. Particle, Shockwave & Floating Combo FX Canvas (Inside Shadow DOM for 100% CSS Isolation) ---
  const host = document.createElement('div');
  host.id = 'aaa-arcade-host';
  const shadow = host.attachShadow({ mode: 'open' });
  const pauseHint = isTypingGame ? 'F2' : 'P / F2';
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
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
        display: flex; align-items: center; gap: 3px;
        background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(242,248,255,.94));
        backdrop-filter: blur(12px);
        border: 1px solid #c7d7eb;
        padding: 4px; border-radius: 999px;
        box-shadow: 0 8px 24px #14345528, inset 0 1px 0 #fff;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .hud.min .extra { display: none; }
      button, a {
        border: none; background: #e6eef9; color: #203957;
        height: 28px; min-width: 28px; padding: 0 7px; border-radius: 999px;
        font-size: 11px; font-weight: 800; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center; gap: 3px;
        text-decoration: none; transition: background .15s, color .15s, transform .15s;
        font-family: inherit; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
      }
      button:hover, a:hover { background: #dceaff; color: #142a49; }
      button:focus-visible,a:focus-visible { outline:3px solid #2563eb;outline-offset:2px }
      @media (prefers-reduced-motion: reduce) { button,a { transition:none } }
      button:active { transform: scale(0.94); }
      button.on { background: #dce9ff; color: #163975; box-shadow: inset 0 0 0 1px #aac3ed; }
      svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
      #btnSfx svg, #btnBgm svg, #btnFx svg, #btnPause svg, #btnRestart svg, #btnHome svg { fill: none; }
      #btnPause svg rect, #btnPause svg path[fill], #btnMin svg circle { fill: currentColor; stroke: none; }
      #btnRestart svg path { fill: none; }
      .pause-curtain {
        position: fixed; inset: 0; z-index: 99995;
        background: radial-gradient(circle at 50% 40%, rgba(40,32,90,0.55), rgba(6,8,16,0.88));
        backdrop-filter: blur(10px);
        display: none; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
        font-family: system-ui, -apple-system, sans-serif; color: #fff;
      }
      .pause-curtain.open { display: flex; }
      .pause-card {
        background: #f7fbff; border: 1px solid #d5e0ed;
        border-radius: 22px; padding: 28px 34px; text-align: center;
        box-shadow: 0 24px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08);
        display: flex; flex-direction: column; gap: 12px; min-width: 280px;
      }
      .pause-card h2 { margin: 0; font-size: 1.45rem; letter-spacing: 0.16em; color: #1d3c68; font-weight: 900; }
      .pause-card p { margin: 0 0 4px; color: #405774; font-size: 0.8rem; }
      .pbtn {
        height: 44px; justify-content: center; font-size: 0.95rem;
        background: linear-gradient(135deg, #6c5ce7, #a855f7); color: #fff;
        box-shadow: 0 8px 22px rgba(108,92,231,0.45);
      }
      .pbtn svg { width: 14px; height: 14px; fill: currentColor; stroke: none; }
      .sbtn { height: 40px; justify-content: center; font-size: 0.88rem; background: #e6eef9; }
    </style>
    <canvas id="fxCanvas"></canvas>
    <div class="hud" id="hudBar">
      <button id="btnMin" title="Collapse HUD" aria-label="Collapse HUD">${ICON.grip}</button>
      <button class="extra" id="btnSfx" title="Sound effects" aria-label="Toggle sound effects">${ICON.soundOn}</button>
      <button class="extra" id="btnBgm" title="Arcade music" aria-label="Toggle arcade music">${ICON.music}</button>
      <button class="extra" id="btnFx" title="Particles and FX" aria-label="Toggle particles">${ICON.sparkle}</button>
      <button class="extra" id="btnPause" title="Pause (${pauseHint})" aria-label="Pause game">${ICON.pause}</button>
      <button class="extra" id="btnRestart" title="Restart" aria-label="Restart game">${ICON.restart}</button>
      <a class="extra" id="btnHome" href="../index.html" title="Back to the arcade" aria-label="Back to the arcade">${ICON.home}</a>
    </div>
    <div class="pause-curtain" id="pauseCurtain">
      <div class="pause-card">
        <h2>PAUSED</h2>
        <p>Press ${pauseHint} or resume below</p>
        <button class="pbtn" id="resumeBtn">${ICON.play} Resume Game</button>
        <button class="sbtn" id="restartBtn2">${ICON.restart} Restart Game</button>
      </div>
    </div>
  `;

  const fxCanvas = shadow.getElementById('fxCanvas');
  const fxCtx = fxCanvas.getContext('2d');
  const particles = [];
  const popups = [];
  const rings = [];
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
      const spd = 60 + Math.random() * 150;
      particles.push({
        x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        r: 2 + Math.random() * 3, life: 0.5, maxLife: 0.5, color
      });
    }
    startFxLoop();
  }

  function shockwave(x, y, color = '#a78bfa', maxR = 90) {
    if (!pref.fx) return;
    rings.push({ x, y, r: 8, maxR, life: 0.5, maxLife: 0.5, color });
    startFxLoop();
  }

  function popup(x, y, text, color = '#fde047') {
    if (!pref.fx) return;
    popups.push({ x, y, text, color, life: 0.9, maxLife: 0.9 });
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
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life -= dt;
        if (r.life <= 0) { rings.splice(i, 1); continue; }
        const p = 1 - r.life / r.maxLife;
        fxCtx.globalAlpha = Math.max(0, 1 - p);
        fxCtx.strokeStyle = r.color;
        fxCtx.lineWidth = 3 * (1 - p) + 0.6;
        fxCtx.beginPath();
        fxCtx.arc(r.x, r.y, r.r + (r.maxR - r.r) * p, 0, Math.PI * 2);
        fxCtx.stroke();
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
        u.y -= 38 * dt;
        u.life -= dt;
        if (u.life <= 0) { popups.splice(i, 1); continue; }
        fxCtx.globalAlpha = Math.max(0, u.life / u.maxLife);
        fxCtx.font = '900 19px system-ui, sans-serif';
        fxCtx.textAlign = 'center';
        fxCtx.fillStyle = u.color;
        fxCtx.shadowColor = 'rgba(0,0,0,0.85)';
        fxCtx.shadowBlur = 7;
        fxCtx.fillText(u.text, u.x, u.y);
        fxCtx.shadowBlur = 0;
      }
      fxCtx.globalAlpha = 1;
    }
    if (particles.length > 0 || popups.length > 0 || rings.length > 0 || flashAlpha > 0.01) origRAF(stepFx);
    else fxRunning = false;
  }

  // --- 5. Score & State Observer for Automatic Audio/FX Triggers ---
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
            bgmIntensity = Math.min(2, combo >= 4 ? 2 : combo >= 2 ? 1 : bgmIntensity);
            const rect = t.getBoundingClientRect();
            const px = window.innerWidth * 0.5 + (Math.random() - 0.5) * 80;
            const py = Math.max(70, rect.bottom + 28);
            const label = combo >= 3 ? `+${delta}  x${combo} COMBO` : `+${delta}`;
            popup(px, py, label, combo >= 3 ? '#f472b6' : '#fde047');
            burst(px, py, '#fde047', 12);
            if (combo >= 3) shockwave(px, py, '#f472b6', 70);
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

  // --- 6. HUD References ---
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
    const w = hudBar.offsetWidth || 200, h = hudBar.offsetHeight || 38;
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
    btnSfx.innerHTML = pref.sfx ? ICON.soundOn : ICON.soundOff;
    btnBgm.classList.toggle('on', pref.bgm);
    btnFx.classList.toggle('on', pref.fx);
    btnPause.classList.toggle('on', paused);
    btnPause.innerHTML = paused ? ICON.play : ICON.pause;
    pauseCurtain.classList.toggle('open', paused && !quietPause);
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

  // --- 7. Public API for games ---
  window.AAA = {
    version: '2.0',
    sfx, tone, noise,
    burst, popup, shockwave, flash: flashEdge,
    ensureAudio,
    isPaused: () => paused,
    setPaused, repositionHud: placeHudSafely,
    get sfxOn() { return pref.sfx; },
    get bgmOn() { return pref.bgm; },
    get fxOn() { return pref.fx; },
    bgm: {
      start(intensity = 0) { bgmIntensity = intensity; pref.bgm = true; ensureAudio(); updateBgm(); renderHud(); },
      stop() { pref.bgm = false; updateBgm(); renderHud(); },
      setIntensity(n) { bgmIntensity = Math.max(0, Math.min(2, n | 0)); }
    }
  };
})();
