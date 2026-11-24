const WIDTH = 4;
const CELLS = WIDTH * WIDTH;
const MAX_TILE = 2 ** 30;
const MAX_SEED = 2 ** 32 - 1;

function copyBoard(input) {
  if (!Array.isArray(input) || input.length !== CELLS) {
    throw new RangeError('board must be a 16-cell array');
  }

  const board = new Array(CELLS);
  for (let index = 0; index < CELLS; index++) {
    const tile = input[index];
    if (!Object.hasOwn(input, index) ||
        !Number.isInteger(tile) ||
        (tile !== 0 && (tile < 2 || tile > MAX_TILE || (tile & (tile - 1)) !== 0))) {
      throw new RangeError('board cells must be zero or powers of two from 2 to 2^30');
    }
    board[index] = tile;
  }
  return board;
}

function canMerge(first, second) {
  return first === second && first !== 0 && first < MAX_TILE;
}

function isOver(board) {
  if (board.includes(0)) return false;

  for (let index = 0; index < CELLS; index++) {
    if (index % WIDTH !== WIDTH - 1 && canMerge(board[index], board[index + 1])) {
      return false;
    }
    if (index + WIDTH < CELLS && canMerge(board[index], board[index + WIDTH])) {
      return false;
    }
  }
  return true;
}

export function createFlux(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new RangeError('options must be an object');
  }
  const { board: input, seed = 1 } = options;
  if (!Number.isInteger(seed) || seed < 1 || seed > MAX_SEED) {
    throw new RangeError('seed must be an integer from 1 to 4294967295');
  }

  let random = seed;
  let board = input === undefined ? Array(CELLS).fill(0) : copyBoard(input);
  let score = 0;
  let moves = 0;
  const history = [];

  function draw() {
    let state = random;
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    random = state >>> 0;
    return random;
  }

  function spawn(target) {
    const empties = [];
    for (let index = 0; index < CELLS; index++) {
      if (target[index] === 0) empties.push(index);
    }
    if (empties.length === 0) return;

    const index = empties[draw() % empties.length];
    target[index] = draw() % 10 === 0 ? 4 : 2;
  }

  if (input === undefined) {
    spawn(board);
    spawn(board);
  }
  const initial = { board, random };

  return {
    snapshot() {
      return { board: board.slice(), score, moves, over: isOver(board), undoDepth: history.length };
    },

    move(direction) {
      // Visit each row/column starting at the edge tiles are moving toward.
      let start;
      let stride;
      let spacing;
      switch (direction) {
        case 'left':  start = 0; stride = 1; spacing = WIDTH; break;
        case 'right': start = WIDTH - 1; stride = -1; spacing = WIDTH; break;
        case 'up':    start = 0; stride = WIDTH; spacing = 1; break;
        case 'down':  start = CELLS - WIDTH; stride = -WIDTH; spacing = 1; break;
        default: return false;
      }

      const next = new Array(CELLS);
      let gained = 0;
      for (let lane = 0; lane < WIDTH; lane++) {
        const base = start + lane * spacing;
        const tiles = [];
        for (let offset = 0; offset < WIDTH; offset++) {
          const tile = board[base + offset * stride];
          if (tile !== 0) tiles.push(tile);
        }

        let output = 0;
        for (let index = 0; index < tiles.length; index++) {
          let tile = tiles[index];
          if (canMerge(tile, tiles[index + 1])) {
            tile *= 2;
            gained += tile;
            index++;
          }
          next[base + output++ * stride] = tile;
        }
        while (output < WIDTH) next[base + output++ * stride] = 0;
      }

      if (next.every((tile, index) => tile === board[index])) return false;

      history.push({ board, random, score, moves });
      spawn(next);
      board = next;
      score += gained;
      moves++;
      return true;
    },

    undo() {
      const previous = history.pop();
      if (!previous) return false;

      ({ board, random, score, moves } = previous);
      return true;
    },

    reset() {
      ({ board, random } = initial);
      score = 0;
      moves = 0;
      history.length = 0;
    },
  };
}
