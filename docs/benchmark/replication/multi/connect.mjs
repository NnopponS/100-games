const ROWS = 6;
const COLS = 7;
const AXES = [[0, 1], [1, 0], [1, 1], [1, -1]];

/** Create a fresh Connect Four game. */
export function createConnect(options = {}) {
  if (options === null || typeof options !== 'object') {
    throw new RangeError('options must be a plain record');
  }
  const proto = Object.getPrototypeOf(options);
  if (proto !== Object.prototype && proto !== null) {
    throw new RangeError('options must be a plain record');
  }
  const { first = 1 } = options;
  if (first !== 1 && first !== 2) {
    throw new RangeError('first must be 1 or 2');
  }

  const board = Array(ROWS * COLS).fill(0);
  const history = [];
  let turn = first;
  let winner = 0;
  let draw = false;

  function snapshot() {
    return { board: board.slice(), turn, winner, draw,
      moves: history.length, undoDepth: history.length };
  }

  function lowestEmptyRow(column) {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row * COLS + column] === 0) return row;
    }
    return -1;
  }

  // Count outward from the proposed disc without reading or changing its cell.
  function wouldWin(row, column, player) {
    for (const [dr, dc] of AXES) {
      let length = 1;
      for (const sign of [-1, 1]) {
        for (let r = row + sign * dr, c = column + sign * dc;
          r >= 0 && r < ROWS && c >= 0 && c < COLS &&
          board[r * COLS + c] === player;
          r += sign * dr, c += sign * dc) {
          length++;
        }
      }
      if (length >= 4) return true;
    }
    return false;
  }

  function drop(column) {
    if (turn === 0 || !Number.isInteger(column) || column < 0 || column >= COLS) {
      return false;
    }
    const row = lowestEmptyRow(column);
    if (row < 0) return false;

    const player = turn;
    const index = row * COLS + column;
    board[index] = player;
    history.push({ index, player });
    winner = wouldWin(row, column, player) ? player : 0;
    draw = winner === 0 && history.length === board.length;
    turn = winner !== 0 || draw ? 0 : 3 - player;
    return true;
  }

  function undo() {
    const move = history.pop();
    if (!move) return false;
    board[move.index] = 0;
    turn = move.player;
    // A legal move can only have started from an active board.
    winner = 0;
    draw = false;
    return true;
  }

  function reset() {
    board.fill(0);
    history.length = 0;
    turn = first;
    winner = 0;
    draw = false;
  }

  function winningColumns(player = turn) {
    if (turn === 0 || (player !== 1 && player !== 2)) return [];
    const columns = [];
    for (let column = 0; column < COLS; column++) {
      const row = lowestEmptyRow(column);
      if (row >= 0 && wouldWin(row, column, player)) columns.push(column);
    }
    return columns;
  }

  return { snapshot, drop, undo, reset, winningColumns };
}
