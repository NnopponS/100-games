'use strict';
// The browser smoke exercises a native action but cannot deliberately reach all
// random branches. Check unresolved bindings in every inline script, including
// callbacks that rarely run (e.g., Rocket Escape's periodic thrust audio).
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const acorn = require('acorn'), scope = require('eslint-scope');
const root = path.resolve(__dirname,'..');
const globals = new Set((
 'window document Math Infinity Number Array Object Date String Set Map WeakMap NaN performance parseFloat parseInt isNaN isFinite undefined '+
 'location JSON localStorage navigator Boolean requestAnimationFrame cancelAnimationFrame setTimeout clearTimeout setInterval clearInterval console '+
 'Float32Array Uint32Array Int32Array Uint8Array Uint8ClampedArray ImageData addEventListener removeEventListener innerHeight innerWidth devicePixelRatio '+
 'CustomEvent Event MouseEvent KeyboardEvent PointerEvent URL URLSearchParams history AAA THREE AudioContext webkitAudioContext Audio Promise Intl '+
 'RegExp Error TypeError RangeError Blob confirm alert btoa atob createImageBitmap Image decodeURIComponent encodeURIComponent matchMedia getComputedStyle '+
 'SVGElement Worker Crypto parent self crypto MutationObserver ResizeObserver IntersectionObserver HTMLElement HTMLCanvasElement CanvasRenderingContext2D'
).split(/\s+/));
const titles = fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()&&/^\d{2,3}-/.test(e.name));
assert.equal(titles.length,100);
const failures=[];
for(const {name} of titles) {
  const html=fs.readFileSync(path.join(root,name,'index.html'),'utf8');
  const code = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n');
  const declaredOnWindow = new Set([...code.matchAll(/\bwindow\.([a-zA-Z_$][\w$]*)\s*=/g)].map(m=>m[1]));
  const ast=acorn.parse(code,{ecmaVersion:'latest',ranges:true,locations:true,sourceType:'script'});
  const all=scope.analyze(ast,{ecmaVersion:2025,sourceType:'script',impliedStrict:true,optimistic:true});
  for(const {identifier:id} of all.globalScope.through) if(!globals.has(id.name)&&!declaredOnWindow.has(id.name)) {
    failures.push(`${name}:${id.loc.start.line}: ${id.name}`);
  }
}
assert.deepEqual(failures,[],'Unexpected unbound game identifiers: '+failures.join(', '));
console.log('100 native scripts have valid lexical bindings, including dormant audio and gameplay callbacks');
