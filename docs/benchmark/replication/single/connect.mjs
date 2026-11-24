const ROWS = 6;
const COLS = 7;
const AXES = [[0, 1], [1, 0], [1, 1], [1, -1]];

function isRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function createConnect(options = {}) {
  if (!isRecord(options)) throw new RangeError('Expected a plain options record');
  const { first = 1 } = options;
  if (first !== 1 && first !== 2) throw new RangeError('first must be 1 or 2');

  const board = Array(ROWS * COLS).fill(0);
  const history = [];
  let turn = first;
  let winner = 0;
  let draw = false;

  function landingRow(column) {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row * COLS + column] === 0) return row;
    }
    return -1;
  }

  function winsThrough(row, column, player) {
    for (const [dr, dc] of AXES) {
      let run = 1; // Count the origin, even for a hypothetical drop.
      for (const sign of [-1, 1]) {
        const stepRow = dr * sign;
        const stepCol = dc * sign;
        let r = row + stepRow;
        let c = column + stepCol;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS &&
               board[r * COLS + c] === player) {
          run++;
          r += stepRow;
          c += stepCol;
        }
      }
      if (run >= 4) return true;
    }
    return false;
  }

  function snapshot() {
    return { board: board.slice(), turn, winner, draw,
             moves: history.length, undoDepth: history.length };
  }

  function drop(column) {
    if (turn === 0 || !Number.isInteger(column) || column < 0 || column >= COLS) return false;
    const row = landingRow(column);
    if (row < 0) return false;

    const index = row * COLS + column;
    const player = turn;
    board[index] = player;
    history.push({ index, player });
    winner = winsThrough(row, column, player) ? player : 0;
    draw = winner === 0 && history.length === board.length;
    turn = winner || draw ? 0 : 3 - player;
    return true;
  }

  function undo() {
    const move = history.pop();
    if (!move) return false;
    board[move.index] = 0;
    // Every accepted drop starts from an active, non-winning position.
    turn = move.player;
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
      const row = landingRow(column);
      if (row >= 0 && winsThrough(row, column, player)) columns.push(column);
    }
    return columns;
  }

  return { snapshot, drop, undo, reset, winningColumns };
}
