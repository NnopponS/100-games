'use strict';
const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const js = fs.readFileSync(path.join(__dirname,'../assets/audio-lifecycle.js'),'utf8');
class Hub {
  constructor(){ this.reg = new Map(); }
  addEventListener(type,fn){ (this.reg.get(type) || this.reg.set(type,[]).get(type)).push(fn); }
  dispatchEvent(e){ this.reg.get(e.type)?.forEach(fn => fn(e)); }
}
class Audio extends Hub {
  constructor(){ super(); this.state = 'suspended'; this.resumes = 0; }
  resume(){ this.resumes++; this.state = 'running'; this.dispatchEvent({type:'statechange'}); return Promise.resolve(); }
  suspend(){ this.state = 'suspended'; return Promise.resolve(); }
  close(){ this.state = 'closed'; return Promise.resolve(); }
}
class Media {
  constructor(){ this.paused = true; this.ended = false; this.isConnected = true; this.currentTime = 19; }
  play(){ this.paused = false; return Promise.resolve(); }
  pause(){ this.paused = true; }
}
const window = new Hub(), document = new Hub();
window.parent = new Hub();
window.AudioContext = window.webkitAudioContext = Audio;
window.HTMLMediaElement = Media;
document.hidden = false;
document.querySelectorAll = () => [];
const location = {origin:'https://arcade.test'};
const CustomEvent = function (type, options) { return {type,detail:options.detail}; };
vm.runInNewContext(js,{window,document,location,CustomEvent,Promise,Boolean,Map,Set,Array,Number,Object,Proxy,Reflect,WeakMap});
(async () => {
  const lifecycle = window.ArcadeAudioLifecycle;
  const mix = new window.AudioContext(), other = new window.webkitAudioContext(), media = new Media();
  await mix.resume(); await media.play();
  assert.equal(mix.state, 'suspended'); assert.equal(media.paused,true,'new route must not auto-play before game input');
  window.dispatchEvent({type:'pointerdown',isTrusted:true});
  assert(mix instanceof Audio);
  await mix.resume(); await other.resume(); await media.play();
  assert.equal(lifecycle.state().running,2); assert.equal(lifecycle.state().playing,1);
  lifecycle.setActive(false);
  assert.equal(lifecycle.state().running,0); assert.equal(media.paused,true);
  await mix.resume(); await media.play(); assert.equal(mix.state,'suspended'); assert(media.paused);
  lifecycle.setActive(true);
  window.dispatchEvent({type:'pointerdown',isTrusted:false});
  assert.equal(lifecycle.state().running,0,'synthetic events must not restart playback');
  window.dispatchEvent({type:'pointerdown',isTrusted:true});
  assert.equal(lifecycle.state().running,2); assert.equal(media.paused,false);
  document.hidden = true; document.dispatchEvent({type:'visibilitychange'});
  assert.equal(lifecycle.state().running,0);
  document.hidden = false; document.dispatchEvent({type:'visibilitychange'});
  assert(!lifecycle.state().active, 'visibility alone must not restart');
  window.dispatchEvent({type:'keydown',key:'ArrowRight',isTrusted:true});
  assert.equal(lifecycle.state().running,2);
  window.dispatchEvent({type:'message',source:{},origin:location.origin,data:{type:'arcade100:audio-state',action:'destroy'}});
  assert.equal(lifecycle.state().destroyed,false,'unrelated message rejected');
  window.dispatchEvent({type:'message',source:window.parent,origin:'https://other.test',data:{type:'arcade100:audio-state',action:'destroy'}});
  assert.equal(lifecycle.state().destroyed,false,'other-origin message rejected');
  window.dispatchEvent({type:'pagehide',persisted:true});
  assert.equal(lifecycle.state().running,0); assert.equal(lifecycle.state().destroyed,false);
  window.dispatchEvent({type:'pageshow'});
  window.dispatchEvent({type:'pointerdown',isTrusted:true});
  assert.equal(lifecycle.state().running,2);
  window.dispatchEvent({type:'message',source:window.parent,origin:location.origin,data:{type:'arcade100:audio-state',action:'destroy'}});
  assert.equal(lifecycle.state().destroyed,true);
  assert.equal(mix.state,'closed'); assert.equal(other.state,'closed'); assert(media.paused); assert.equal(media.currentTime,0);
  const late = new window.AudioContext(); assert.equal(late.state,'closed');
  await late.resume(); assert.equal(late.state,'closed','teardown survives delayed game callback');
  console.log('Audio lifecycle: owned contexts and media, hide/show, trusted resume, back/forward, message origin & source, complete teardown and delayed callbacks passed');
})().catch(error => {console.error(error);process.exitCode=1;});
