const SIDE = 4;
const SIZE = SIDE * SIDE;
const MAX_TILE = 2 ** 30;

function validTile(tile) {
  return tile === 0 || (
    Number.isInteger(tile) &&
    tile >= 2 &&
    tile <= MAX_TILE &&
    (tile & (tile - 1)) === 0
  );
}

function isOver(board) {
  for (let i = 0; i < SIZE; i++) {
    const tile = board[i];
    if (tile === 0) return false;
    if (tile === MAX_TILE) continue;
    if (i % SIDE < SIDE - 1 && board[i + 1] === tile) return false;
    if (i < SIZE - SIDE && board[i + SIDE] === tile) return false;
  }
  return true;
}

function lineIndex(direction, line, offset) {
  switch (direction) {
    case 'left': return line * SIDE + offset;
    case 'right': return line * SIDE + SIDE - 1 - offset;
    case 'up': return offset * SIDE + line;
    case 'down': return (SIDE - 1 - offset) * SIDE + line;
  }
}

export function createFlux(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new RangeError('Expected an options object');
  }
  const { board: input, seed = 1 } = options;
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) {
    throw new RangeError('Seed must be an integer from 1 to 4294967295');
  }

  let state = seed;
  const draw = () => {
    let s = state;
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    state = s >>> 0;
    return state;
  };
  const spawn = (board) => {
    const empties = [];
    for (let i = 0; i < SIZE; i++) if (board[i] === 0) empties.push(i);
    if (empties.length === 0) return;
    const index = empties[draw() % empties.length];
    board[index] = draw() % 10 === 0 ? 4 : 2;
  };

  let board = Array(SIZE).fill(0);
  if (input === undefined) {
    spawn(board);
    spawn(board);
  } else {
    if (!Array.isArray(input) || input.length !== SIZE) {
      throw new RangeError('Board must contain 16 valid tiles');
    }
    for (let i = 0; i < SIZE; i++) {
      const tile = input[i];
      if (!Object.hasOwn(input, i) || !validTile(tile)) {
        throw new RangeError('Board must contain 16 valid tiles');
      }
      board[i] = tile === 0 ? 0 : tile;
    }
  }

  // Each successful turn builds a new board, so saved boards need no further
  // copies. The snapshot still returns its own array.
  const initialBoard = board;
  const initialState = state;
  let score = 0;
  const history = [];
  return {
    snapshot() {
      return {
        board: board.slice(),
        score,
        moves: history.length,
        over: isOver(board),
        undoDepth: history.length,
      };
    },
    move(direction) {
      if (direction !== 'left' && direction !== 'right' &&
          direction !== 'up' && direction !== 'down') {
        return false;
      }
      const next = Array(SIZE).fill(0);
      let points = 0;
      for (let line = 0; line < SIDE; line++) {
        const tiles = [];
        for (let offset = 0; offset < SIDE; offset++) {
          const tile = board[lineIndex(direction, line, offset)];
          if (tile !== 0) tiles.push(tile);
        }
        let destination = 0;
        for (let source = 0; source < tiles.length; source++) {
          let tile = tiles[source];
          if (tile < MAX_TILE && tile === tiles[source + 1]) {
            tile *= 2;
            points += tile;
            source++;
          }
          next[lineIndex(direction, line, destination++)] = tile;
        }
      }
      if (next.every((value, i) => value === board[i])) return false;

      history.push({ board, score, state });
      spawn(next);
      board = next;
      score += points;
      return true;
    },
    undo() {
      if (history.length === 0) return false;
      ({ board, score, state } = history.pop());
      return true;
    },
    reset() {
      board = initialBoard;
      state = initialState;
      score = 0;
      history.length = 0;
    },
  };
}
