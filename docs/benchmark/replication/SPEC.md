# Reversed-order Arcade mechanics pilot — worker specification

Build the assigned deterministic game engine(s) in their designated JS module(s). Base files only contain signature stubs. Node 22+ and built-in JS only; no network or packages. Implement exactly the public APIs below; scoring uses held-out cases. Options must be a non-null plain record (arrays, null and other primitives throw RangeError). Unknown option keys are ignored. Snapshot outputs must not expose mutable internal storage.

## C. Connect Four — Arcade #21-inspired

`export function createConnect(options={})` returns `{snapshot, drop, undo, reset, winningColumns}`. Options: optional `first` numeric 1 or 2 (default 1), otherwise throw RangeError. The model starts on an empty board of 6 rows and 7 columns, flat row-major array (index 0 top-left), 0 empty, 1 or 2 played.

- `snapshot()` returns exactly `{board, turn, winner, draw, moves, undoDepth}`. Initially winner 0, draw false, moves and undoDepth 0. The turn is the next active player, or 0 when terminal. Winner is 1 or 2 if four or more contiguous identical nonzero discs occur through the latest move horizontally, vertically, or on either diagonal. A full board is a draw only if that move did not win.
- `drop(column)` returns true iff an integer column 0..6 has an empty cell and the game is active. Place a disc of the active player in the lowest empty row. Record one move, update outcome, otherwise alternate turns. Invalid/full/terminal drops return false and do not change anything.
- `undo()` returns true and restores the exact preceding state for a successful drop, including from a win/draw; returns false if no history. `reset()` returns to the original empty board and first player.
- `winningColumns(player)` returns the sorted ascending list of playable columns which, if player placed one disc (regardless of whose turn it is), would yield an immediate win. Omitted player defaults to the current turn. Return `[]` for invalid player and terminal boards. Read-only, no change to state or histories.

## D. Archery target scoring — Arcade #46-inspired

`export function createRange(options={})` returns `{snapshot, shoot, undo, reset}`. Options (numbers unless noted): `distance` >0 default 20m; `gravity` >0 default 9.81m/s²; `height` >=0 default 1.5m (release height); `centerY` >=0 default 1.5m; `centerX` finite default 0m; `radii` array of finite positive strictly increasing numbers of length 3 (default [.1,.25,.5] in meters); `shots` integer 1..30 default 5. All numbers must be finite; invalid options throw RangeError. Copy the input radii.

- `shoot({speed,angle,x=0})` returns true if valid and the session has shots remaining; false with no changes for everything else. Require a record, finite numeric `speed` from 1 through 100 m/s, `angle` degrees from -30 through 60, and finite numeric `x` at the target plane from -10 through 10 m. Numeric strings/arrays are invalid.
- Analytic shot: compute time to the target plane `t=distance/(speed*cos(angle radians))`, and predicted height `y=height + speed*sin(angle radians)*t - .5*gravity*t*t`. Offset distance from the center is `Math.hypot(x-centerX, y-centerY)`. If `y<0` it hit the ground before the plane and scores 0 irrespective of offset. Otherwise score 10 / 7 / 3 for the smallest radius containing the offset (inclusive boundary), or 0 outside all rings. A valid miss consumes a shot; no projection truncation.
- `snapshot()` returns exactly `{score, taken, remaining, over, last, undoDepth}`. Initial score/taken/undoDepth are 0, remaining is configured shots, over false, last null. Last after a valid shot is `{x,y,time,radius,points,ground}` using raw computed numeric values, with `ground` boolean. Terminal exactly when remaining reaches 0.
- `undo()` returns true and reverts the last valid shot including last/score/remaining, or false if none. `reset()` clears all progress with exact original configuration. No new entropy, no score or shot mutation on rejection.
