# Arcade mechanics implementation pilot — shared worker specification

Implement two independent deterministic game engines that typify Arcade puzzle games. This is a new, headless benchmark, not a replication of the 100-game launch. The provided JS modules contain only signature stubs. Implement logic in the specified `.mjs` file(s). Do not edit fixtures, tests, another worker’s/arm’s directories, or the production Arcade repository. Use built-in JS only (Node 22+), no network, no packages, no new files besides assigned modules. The grader reads the public API below and uses additional held-out inputs, including mutation and invalid-input cases. Invalid options on construction throw `RangeError`; public operation details are below. Getter snapshots never expose mutable internal arrays.

Both engines share a deterministic PRNG: initialize state from the given integer `seed` in 1..4294967295. Default seed is 1. Every draw is xorshift32:
```js
let s = state;
s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
state = s >>> 0;
return state;
```
No external entropy is allowed. Seeding, input-to-array mapping, and draw order are part of the acceptance suite.

## Game A / Lights Out (inspired by Arcade 100 #32)

`export function createSignal(options={})` returns an object with methods `snapshot(), press(index), undo(), reset(), solution()`. Its 5×5 board is a flat 25-element row-major 0-or-1 array (index 0 top-left). A legal press flips its own cell and in-bounds orthogonal neighbors. A solved board is all zero.

- Construction options: optional `board` (a well-formed array that must be copied), optional `seed` and optional integer `scramble` (1..25, default 8). If no board is provided, generate a solvable board by starting with all zero, drawing `scramble` values, and pressing `draw()%25` once for each value. A generated solved board is allowed. Generation does not add to player moves.
- `snapshot()` returns `{board, moves, won, undoDepth}`. History starts empty. `press(index)` returns true only for legal integer index 0..24 on an unsolved board and adds one move/history entry. Invalid/out-of-range presses and presses after a win are no-ops returning false.
- `undo()` returns true and restores the most recent successful press, even after winning; returns false on empty history. `reset()` restores the exact initial board and clears moves/history.
- `solution()` returns a shortest list of distinct valid press indices in any order, `[]` if solved, and `null` for a valid but unreachable board. It does not mutate play, history, or the input board. Any minimum solution is accepted. Judge repeatedly calls this on a range of positions, so use a practical exact strategy, not brute-force enumeration of all 2^25 sets.

## Game B / 2048-style tile merge (inspired by Arcade 100 #09)

`export function createFlux(options={})` returns an object with methods `snapshot(), move(direction), undo(), reset()`. Board is a flat row-major 16-element array of 0 (empty) or powers of two (2 through 2^30); construct with optional `board` (must be copied) and `seed`. If no board is supplied, spawn twice as below, with score/moves starting at zero. A supplied board starts without a spawn.

- `snapshot()` returns `{board, score, moves, over, undoDepth}`. A board is over when full and no legal merge/move exists; it is not over merely because it reached 2048. A pair of 2^30 tiles is not mergeable (the maximum supported tile).
- `move(direction)` accepts exactly `'left'|'right'|'up'|'down'`. Move all cells in that direction, dropping zeros, merging equal adjacent tiles once per source tile, adding the value of each new merged tile to the score. Return true only if the board changed; then increment moves and spawn exactly one tile. Invalid/unchanged/over moves return false, do not spawn, and do not affect score, turns, or history.
- Spawn order: collect currently empty indices in ascending order; consume one draw for the destination `draw()%empties.length`, then one draw for tile value (`4` if `draw()%10===0`, otherwise `2`). No draws if there are no empty cells.
- `undo()` restores the most recent successful turn, including exact PRNG state, score and moves. Return true if restored, false if empty. Replaying the same move after undo must spawn exactly the same tile. `reset()` restores the initial state, including PRNG state at the end of any initial spawns, and clears moves/history.
