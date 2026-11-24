/* Exhaustively check the game’s actual ray tracing for every authored chamber. */
'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const file = readFileSync(join(__dirname, '../95-laser-reflect/index.html'), 'utf8');
const levels = file.match(/const LEVELS = \[[\s\S]+?\n  \];/)?.[0];
const traceStart = file.indexOf('  function traceBeam() {');
const traceEnd = file.indexOf('\n  function draw(t) {', traceStart);
assert.ok(levels && traceStart >= 0 && traceEnd >= 0, 'Laser Reflect source not found');
const trace = file.slice(traceStart, traceEnd);
const expected = [1, 1, 1, 1, 2, 2];
const counts = vm.runInNewContext(`
  const N = 6, CELL = 80;
  let lvlIdx, gridMirrors, beamPath, beamHitTarget, beamEndWall;
  const won = true; // Prevent DOM and game-over side effects. Beam code is unchanged.
  ${levels}
  ${trace}
  LEVELS.map((L, i) => {
    lvlIdx = i;
    gridMirrors = L.mirrors;
    traceBeam();
    if (beamHitTarget) throw new Error('Chamber ' + (i+1) + ' is solved at launch');
    let solutions = 0;
    for (let mask = 0; mask < (1 << L.mirrors.length); mask++) {
      gridMirrors = L.mirrors.map((m, j) => ({ ...m, t: mask & (1 << j) ? '/' : '\\\\' }));
      traceBeam();
      if (beamHitTarget) solutions++;
    }
    return solutions;
  });
`, { }, { timeout: 500 });
assert.deepEqual(Array.from(counts), expected);
console.log('Laser Reflect: all 6 chambers start unsolved and have a valid mirror solution.');
