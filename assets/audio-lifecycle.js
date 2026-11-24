/* Arcade playback ownership. This script loads before any game inline code.
   One document owns its native WebAudio/HTML media; the portal can retire it
   synchronously before replacing its iframe. No media or state leaves the origin. */
(() => {
  'use strict';
  if (window.ArcadeAudioLifecycle) return;
  const contexts = new Map();
  const media = new Set();
  const resumeMedia = new Set();
  let routeActive = true;
  let pageActive = true;
  let destroyed = false;
  let needsGesture = true;
  const visible = () => !destroyed && routeActive && pageActive && !document.hidden;
  const allowed = () => visible() && !needsGesture;
  const ignore = operation => {
    try { Promise.resolve(operation()).catch(() => {}); } catch {}
  };
  function notify() {
    window.dispatchEvent(new CustomEvent('arcade100:audio-lifecycle', {
      detail: { active: allowed(), destroyed }
    }));
  }
  function trackContext(context) {
    if (!context || contexts.has(context)) return context;
    const native = {
      resume: context.resume.bind(context),
      suspend: context.suspend.bind(context),
      close: context.close.bind(context),
      wasRunning: !destroyed && context.state === 'running'
    };
    contexts.set(context, native);
    // Some games proactively resume their contexts on every animation frame.
    // Guard those calls while the document no longer owns the sound.
    try {
      Object.defineProperty(context, 'resume', {
        configurable: true,
        value: () => allowed() ? native.resume() : Promise.resolve()
      });
    } catch {}
    context.addEventListener?.('statechange', () => {
      if (destroyed && context.state !== 'closed') ignore(native.close);
      else if (!allowed() && context.state === 'running') ignore(native.suspend);
    });
    if (destroyed) ignore(native.close);
    else if (!allowed() && context.state === 'running') ignore(native.suspend);
    return context;
  }
  const wrapped = new WeakMap();
  for (const name of ['AudioContext','webkitAudioContext']) {
    const Constructor = window[name];
    if (typeof Constructor !== 'function') continue;
    let replacement = wrapped.get(Constructor);
    if (!replacement) {
      replacement = new Proxy(Constructor, {
        construct(target, args, receiver) { return trackContext(Reflect.construct(target, args, receiver)); }
      });
      wrapped.set(Constructor, replacement);
    }
    try { window[name] = replacement; } catch {}
  }
  const proto = window.HTMLMediaElement?.prototype;
  const playMedia = proto?.play;
  if (typeof playMedia === 'function') {
    try {
      proto.play = function (...args) {
        media.add(this);
        if (!allowed()) {
          try { this.pause(); } catch {}
          return Promise.resolve();
        }
        const promise = playMedia.apply(this, args);
        if (promise?.then) promise.then(() => { if (!allowed()) try { this.pause(); } catch {} }, () => {});
        return promise;
      };
    } catch {}
  }
  // Also catches markup autoplay (including direct game URLs opened on mobile).
  document.addEventListener('play', event => {
    const el = event.target;
    if (!(el instanceof window.HTMLMediaElement)) return;
    media.add(el);
    if (!allowed()) try { el.pause(); } catch {}
  }, true);
  function silence(close = false) {
    const visibleMedia = new Set([...media, ...document.querySelectorAll('audio,video')]);
    for (const el of visibleMedia) {
      try {
        if (!close && !el.paused && !el.ended) resumeMedia.add(el);
        el.pause();
        if (close && Number.isFinite(el.currentTime)) el.currentTime = 0;
      } catch {}
    }
    for (const [context, native] of contexts) {
      if (close) {
        native.wasRunning = false;
        if (context.state !== 'closed') ignore(native.close);
      } else if (context.state === 'running') {
        native.wasRunning = true;
        ignore(native.suspend);
      }
    }
  }
  function reflectVisibility() {
    if (visible()) { notify(); return; }
    needsGesture = true;
    silence();
    notify();
  }
  function setActive(active) {
    if (destroyed) return;
    routeActive = Boolean(active);
    reflectVisibility();
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    needsGesture = true;
    silence(true);
    resumeMedia.clear();
    notify();
  }
  function unlock(event) {
    if (!event.isTrusted || !visible() || !needsGesture) return;
    if (event.type === 'keydown' && ['Escape','Tab','Shift','Control','Alt','Meta'].includes(event.key)) return;
    needsGesture = false;
    for (const [context, native] of contexts) {
      if (native.wasRunning && context.state !== 'closed') ignore(native.resume);
      native.wasRunning = false;
    }
    for (const el of resumeMedia) {
      if (typeof playMedia === 'function' && el.isConnected) ignore(() => playMedia.call(el));
    }
    resumeMedia.clear();
    notify();
  }
  document.addEventListener('visibilitychange', reflectVisibility);
  window.addEventListener('pagehide', event => {
    if (event.persisted) { pageActive = false; reflectVisibility(); }
    else destroy();
  });
  window.addEventListener('pageshow', () => { pageActive = true; reflectVisibility(); });
  for (const type of ['pointerdown','keydown','click']) window.addEventListener(type, unlock, true);
  if (window.parent !== window) {
    window.addEventListener('message', event => {
      if (event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'arcade100:audio-state') return;
      if (event.data.action === 'destroy') destroy();
      if (event.data.action === 'hide' || event.data.action === 'show') setActive(event.data.action === 'show');
    });
  }
  window.ArcadeAudioLifecycle = Object.freeze({
    setActive, destroy, isActive: allowed,
    // Inspectable in test runs without recording user activity or sending telemetry.
    state: () => ({ active: allowed(), destroyed, contexts: contexts.size,
      running: Array.from(contexts.keys()).filter(context => context.state === 'running').length,
      playing: Array.from(media).filter(el => !el.paused && !el.ended).length })
  });
})();
