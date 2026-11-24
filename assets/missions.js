/* Arcade 100 missions: game-state objectives, optional bounded trials, personal medals.
   Each original game's adapter passes a read-only getter into this script. */
(() => {
  'use strict';
  const medalNames = ['No medal yet', 'Bronze', 'Silver', 'Gold'];
  const nice = v => Number.isFinite(v) ? new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(v) : '—';
  const clamped = t => Math.max(0, t);
  const exactDate = /^(20\d\d)-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
  const params = new URLSearchParams(location.search);
  const queryDate = params.get('daily') || '';
  const today = new Date().toISOString().slice(0, 10);
  const date = exactDate.test(queryDate) && queryDate === today ? queryDate : null;
  const trial = date !== null || params.get('mode') === 'trial';
  const plus = !trial && (params.get('mode') === 'plus' || params.get('plus') === '1');
  function medalFor(goals, value, lower) {
    if (!Number.isFinite(value)) return 0;
    return goals.reduce((medal, goal, index) => (lower ? value <= goal : value >= goal) ? index + 1 : medal, 0);
  }
  const secondsText = v => Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0');
  function readRecord(key) {
    try {
      const record = JSON.parse(localStorage.getItem(key) || 'null');
      return record && Number.isFinite(record.best) && Number.isInteger(record.medal) && record.medal >= 0 && record.medal <= 3 ? record : null;
    } catch { return null; }
  }

  function mount() {
    const source = window.__arcadeMissionSource;
    const root = document.getElementById('aaa-arcade-host')?.shadowRoot;
    if (!source || !root || root.getElementById('arcadeMissionButton')) return;
    const { id, label, goals, note, read, kind, delta, changed, seconds = 180 } = source;
    const lower = kind === 'lower';
    const key = date ? `arcade100:daily:${date}:${id}` : `arcade100:mission:${id}`;
    function score() {
      try { const n = read(); return typeof n === 'number' && Number.isFinite(n) ? n : (lower ? Infinity : 0); }
      catch { return lower ? Infinity : 0; }
    }
    const button = document.createElement('button');
    button.id = 'arcadeMissionButton';
    button.className = 'mission-button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.textContent = date ? 'Daily Trial' : trial ? 'Medal Trial' : plus ? 'Arcade+ Modes' : 'Modes';
    const style = document.createElement('style');
    style.textContent = `
      #arcadeMissionButton { padding:0 9px;background:#dde9ff;color:#143777;min-height:30px;min-width:61px }
      #arcadeMissionButton[data-medal="1"] {background:#f5e3d5;color:#743709}
      #arcadeMissionButton[data-medal="2"] {background:#e5ecf5;color:#263853}
      #arcadeMissionButton[data-medal="3"] {background:#fff0ba;color:#663b00}
      #arcadeMissionButton:focus-visible,.mission-panel button:focus-visible {outline:3px solid #265add;outline-offset:3px}
      .mission-panel { border:1px solid #dbe3ef; border-radius:22px;background:#fff;color:#14223a;
        width:min(430px,calc(100vw - 24px));box-sizing:border-box;max-height:calc(100dvh - 24px);overflow:auto;
        padding:22px;font:500 15px/1.45 system-ui,sans-serif;box-shadow:0 20px 70px #10234035;
        margin:auto;z-index:100000 }
      .mission-panel::backdrop {background:#1a2b43a8}
      .mission-panel * {box-sizing:border-box}
      .mission-panel header {display:flex;justify-content:space-between;align-items:start;gap:12px}
      .mission-panel .eyebrow {color:#255bc4;text-transform:uppercase;font:800 11px/1.3 system-ui,sans-serif;letter-spacing:.13em}
      .mission-panel h2 {margin:3px 0 6px;font:800 26px/1.1 system-ui,sans-serif;letter-spacing:-.04em}
      .mission-panel p {margin:8px 0;color:#40506a}
      .mission-panel ol {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;list-style:none;margin:15px 0;padding:0;text-align:center}
      .mission-panel li {display:grid;gap:4px;padding:8px 4px;background:#f3f6fb;color:#354763;border-radius:12px}
      .mission-panel li.earned {background:#e1f5e9;color:#075230}
      .mission-panel li span {font-weight:750;font-size:13px}
      .mission-status {font-weight:750;color:#1d365e !important}
      .mission-rules {font-size:13px}
      .mission-panel footer {margin-top:14px;display:flex;flex-wrap:wrap;gap:8px}
      .mission-panel button {color:#163254;background:#e8eef8;border-radius:10px;min-height:42px;padding:0 12px;font-size:14px}
      .mission-panel .mission-primary {background:#2458d0;color:#fff}
      .mission-panel .mission-primary:hover {background:#1747b7;color:#fff}
      .mission-panel button:not(.mission-primary):hover {background:#dce8fb;color:#132941}
      .mission-panel .mission-close {font-size:17px;min-width:42px}
      .mission-panel [hidden] {display:none !important}
      @media(max-width:420px){.mission-panel{padding:16px}.mission-panel h2{font-size:22px}}
    `;
    const dialog = document.createElement('dialog');
    dialog.className = 'mission-panel';
    dialog.setAttribute('aria-labelledby', 'missionHeading');
    dialog.innerHTML = `
      <header><div><div class="eyebrow"></div><h2 id="missionHeading"></h2></div>
      <button type="button" class="mission-close" aria-label="Close mission">×</button></header>
      <p class="mission-note"></p>
      <p class="mission-feature"></p>
      <ol aria-label="Medal targets"></ol>
      <p class="mission-status" role="status"></p>
      <p class="mission-rules"></p>
      <footer><button type="button" class="mission-primary">Play Medal Trial</button><button type="button" class="mission-plus">Play Arcade+</button><button type="button" class="mission-practice">Keep playing Classic</button></footer>
    `;
    dialog.querySelector('.eyebrow').textContent = date ? `Daily Trial · ${date} UTC` : trial ? 'Medal Trial · Arcade mode' : plus ? 'Arcade+ · Arcade mode' : 'Classic · Arcade mode';
    dialog.querySelector('h2').textContent = label;
    dialog.querySelector('.mission-note').textContent = note;
    const medalList = goals.map((goal, i) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = medalNames[i + 1];
      const target = document.createElement('b');
      target.textContent = (lower ? '≤ ' : '') + nice(goal);
      li.append(name, target);
      dialog.querySelector('ol').append(li);
      return li;
    });
    const status = dialog.querySelector('.mission-status');
    const rules = dialog.querySelector('.mission-rules');
    const primary = dialog.querySelector('.mission-primary');
    const practice = dialog.querySelector('.mission-practice');
    const plusButton = dialog.querySelector('.mission-plus');
    const features = window.ARCADE_FEATURES || [];
    const feature = Array.isArray(features) ? features.find(feature => Number(feature.id) === id) : features[id];
    dialog.querySelector('.mission-feature').textContent = feature?.description ? `Arcade+: ${feature.description}` : 'Arcade+ adds a new game-specific mechanic.';
    dialog.querySelector('.mission-close').onclick = () => dialog.close();
    function selectMode(mode) {
      const url = new URL(location.href);
      url.searchParams.delete('daily');
      url.searchParams.delete('plus');
      if (mode === 'classic') url.searchParams.delete('mode');
      else url.searchParams.set('mode', mode);
      try {
        if (window.parent !== window && location.origin !== 'null') {
          window.parent.postMessage({ type: 'arcade100:mode', id, mode }, location.origin);
          return;
        }
      } catch {}
      window.ArcadeAudioLifecycle?.destroy();
      location.assign(url);
    }
    practice.textContent = trial || plus ? 'Return to Classic' : 'Keep playing Classic';
    practice.onclick = () => trial || plus ? selectMode('classic') : dialog.close();
    plusButton.hidden = plus;
    plusButton.onclick = () => selectMode('plus');
    root.append(style, dialog);
    root.getElementById('hudBar')?.append(button);
    window.AAA?.repositionHud?.();

    let record = readRecord(key);
    let active = false, armed = false, expired = false, wonGold = false, inputSeen = false;
    let remaining = seconds * 1000, baseline = score(), elapsedAnchor = performance.now();
    let best = lower ? Infinity : 0, medal = 0;
    let resetCandidate = baseline;
    let savedNormal = null, lastSave = 0;
    let dialogWasPaused = false, returnToPlay = false;
    function render() {
      const shownMedal = Math.max(medal, record?.medal || 0);
      button.dataset.medal = String(shownMedal);
      button.dataset.state = active ? 'active' : armed ? 'armed' : expired ? 'expired' : wonGold ? 'gold' : 'idle';
      const clock = secondsText(clamped(Math.ceil(remaining / 1000)));
      button.textContent = active ? clock + (medal ? ' · ' + medalNames[medal] : '') : (date ? 'Daily Trial' : trial ? 'Medal Trial' : plus ? 'Arcade+ Modes' : 'Modes');
      button.setAttribute('aria-label', `${date ? 'Daily Trial' : trial ? 'Medal Trial' : plus ? 'Arcade+ modes' : 'Arcade modes'}: ${label}${active ? ', ' + clock + ' remaining' : ''}`);
      for (let i = 0; i < medalList.length; i++) medalList[i].classList.toggle('earned', shownMedal > i);
      const statusText = active
        ? `${clock} left · ${nice(best)}${medal ? ' · ' + medalNames[medal] : ''}`
        : armed ? 'Ready. The timer starts with your first game input.'
        : expired ? `Time’s up · ${nice(best)} · ${medalNames[medal]}`
        : wonGold ? `Gold earned · ${nice(best)}`
        : record ? `Personal best: ${nice(record.best)} · ${medalNames[record.medal]}` : 'No medals recorded on this device yet.';
      if (status.textContent !== statusText) status.textContent = statusText;
      rules.textContent = trial
        ? `${secondsText(seconds)} of active play. The challenge clock pauses while hidden. Your best native performance counts; the trial does not modify your regular scores.`
        : `${plus ? 'Arcade+ changes the play rules, with no extra clock.' : 'Classic has no extra timer.'} Medal Trial gives you ${secondsText(seconds)} to hit this game’s medal targets, with a separate record.`;
      primary.textContent = !trial ? 'Play Medal Trial' : active ? 'Resume trial' : armed ? 'Begin trial' : 'Retry trial';
    }
    function persist() {
      const better = (next, old) => !old || next.medal > old.medal || (next.medal === old.medal && (lower ? next.best < old.best : next.best > old.best));
      const next = { best, medal, completed: medal > 0, label };
      if (!Number.isFinite(best) || (!lower && best <= 0) || !better(next, record)) return;
      lastSave = performance.now();
      record = next;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      // A daily medal also belongs to the overall game record.
      if (date) {
        const normalKey = `arcade100:mission:${id}`;
        savedNormal ||= readRecord(normalKey);
        if (better(next, savedNormal)) {
          savedNormal = next;
          try { localStorage.setItem(normalKey, JSON.stringify(next)); } catch {}
        }
      }
      const payload = { type: 'arcade100:mission', id, date, medal, best };
      window.dispatchEvent(new CustomEvent(payload.type, { detail: payload }));
      try { if (window.parent !== window && location.origin !== 'null') window.parent.postMessage(payload, location.origin); } catch {}
    }
    function arm() {
      if (active) persist();
      active = false; armed = true; expired = false; wonGold = false; inputSeen = false;
      remaining = seconds * 1000; best = lower ? Infinity : 0; medal = 0;
      baseline = score(); resetCandidate = baseline; render();
    }
    function playInput(event) {
      if (!armed || !event.isTrusted || event.composedPath().includes(root.host) || dialog.open) return;
      if (event.type === 'keydown' && (event.repeat || ['Escape','Tab','Shift','Alt','Control','Meta','F2'].includes(event.key))) return;
      if (window.AAA?.isPaused()) return;
      baseline = score();
      resetCandidate = baseline;
      active = true; armed = false; inputSeen = true;
      elapsedAnchor = performance.now();
      render();
    }
    function update(now) {
      if (active && inputSeen && !document.hidden && !window.AAA?.isPaused()) {
        remaining -= Math.max(0, now - elapsedAnchor);
        if (remaining <= 0) {
          remaining = 0; active = false; expired = true;
          persist();
        } else {
          const raw = score();
          if (delta && Number.isFinite(raw) && raw < resetCandidate) resetCandidate = raw;
          const value = delta ? raw - resetCandidate : raw;
          // Ignore the unchanged pre-run state so loaded art, old puzzle boards and stale wins do not grant free medals.
          if (Number.isFinite(value) && (delta || raw !== baseline || best !== (lower ? Infinity : 0))) {
            if (lower ? value < best : value > best) best = value;
            const nextMedal = medalFor(goals, best, lower);
            if (nextMedal > medal) {
              medal = nextMedal;
              persist();
              if (medal === 3) {
                active = false; wonGold = true;
                if (window.AAA?.fxOn) window.AAA.shockwave(innerWidth / 2, innerHeight * .24, '#2563eb', 100);
              }
            } else if (now - lastSave > 1500) persist();
          }
        }
        render();
      }
      elapsedAnchor = now;
    }
    function open() {
      if (dialog.open) return;
      dialogWasPaused = !!window.AAA?.isPaused();
      if (!dialogWasPaused) window.AAA?.setPaused?.(true, true);
      render();
      try { dialog.showModal(); } catch { return; }
    }
    dialog.addEventListener('close', () => {
      if (!dialogWasPaused) window.AAA?.setPaused?.(false, true);
      if (returnToPlay) {
        returnToPlay = false;
        if (!document.body.hasAttribute('tabindex')) document.body.tabIndex = -1;
        document.body.focus({ preventScroll: true });
      } else button.focus({ preventScroll: true });
    });
    dialog.addEventListener('keydown', event => event.stopPropagation());
    primary.onclick = () => {
      if (!trial) { selectMode('trial'); return; }
      if (!active && !armed) { location.reload(); return; }
      returnToPlay = true;
      dialog.close();
    };
    button.addEventListener('click', open);
    // Enter/Space on a focused game button can lead to a trusted click rather than pointerdown.
    for (const type of ['pointerdown','keydown','beforeinput','input','click']) window.addEventListener(type, playInput, true);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && active) persist();
      elapsedAnchor = performance.now();
    });
    window.addEventListener('pagehide', () => { if (active) persist(); });
    window.setInterval(() => update(performance.now()), 125);
    render();
    if (trial) { arm(); open(); }
    if (changed) button.dataset.canvasMission = 'true';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
