const WIDTH = 5;
const SIZE = WIDTH * WIDTH;
const BITS = Array.from({ length: SIZE }, (_, i) => 1 << i);
const PRESS_MASKS = BITS.map((bit, i) => {
  const col = i % WIDTH;
  if (col > 0) bit |= BITS[i - 1];
  if (col < WIDTH - 1) bit |= BITS[i + 1];
  if (i >= WIDTH) bit |= BITS[i - WIDTH];
  if (i < SIZE - WIDTH) bit |= BITS[i + WIDTH];
  return bit;
});

function popcount(mask) {
  let count = 0;
  while (mask !== 0) {
    mask &= mask - 1;
    count++;
  }
  return count;
}

// Reduce the fixed press matrix once over GF(2). Each rhsMask records
// which original board bits contribute to that row's transformed RHS.
function prepareSolver() {
  const rows = PRESS_MASKS.map((coeff, i) => ({ coeff, rhsMask: BITS[i] }));
  const pivots = [];
  const free = [];
  for (const bit of BITS) {
    const rank = pivots.length;
    const source = rows.findIndex((row, i) => i >= rank && (row.coeff & bit) !== 0);
    if (source < 0) {
      free.push(bit);
      continue;
    }
    [rows[rank], rows[source]] = [rows[source], rows[rank]];
    const pivot = rows[rank];
    pivots.push(bit);
    for (let i = 0; i < SIZE; i++) {
      if (i !== rank && (rows[i].coeff & bit) !== 0) {
        rows[i].coeff ^= pivot.coeff;
        rows[i].rhsMask ^= pivot.rhsMask;
      }
    }
  }

  // The 5x5 system has two free variables. Their kernel span gives all
  // four solutions when the transformed RHS is consistent.
  const offsets = [0];
  for (const bit of free) {
    let basis = bit;
    for (let i = 0; i < pivots.length; i++) {
      if ((rows[i].coeff & bit) !== 0) basis |= pivots[i];
    }
    const count = offsets.length;
    for (let i = 0; i < count; i++) offsets.push(offsets[i] ^ basis);
  }
  return { rows, pivots, offsets };
}

const { rows, pivots, offsets } = prepareSolver();

function solve(board) {
  if (board === 0) return [];
  let particular = 0;
  for (let i = 0; i < SIZE; i++) {
    if ((popcount(board & rows[i].rhsMask) & 1) !== 0) {
      if (i >= pivots.length) return null;
      particular |= pivots[i];
    }
  }
  let best = particular;
  let fewest = popcount(best);
  for (let i = 1; i < offsets.length; i++) {
    const candidate = particular ^ offsets[i];
    const count = popcount(candidate);
    if (count < fewest) {
      best = candidate;
      fewest = count;
    }
  }
  const indices = [];
  for (let i = 0; i < SIZE; i++) {
    if ((best & BITS[i]) !== 0) indices.push(i);
  }
  return indices;
}

export function createSignal(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new RangeError('options must be an object');
  }
  const { board: supplied, seed = 1, scramble = 8 } = options;
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xFFFFFFFF) {
    throw new RangeError('seed must be an integer in 1..4294967295');
  }
  if (!Number.isInteger(scramble) || scramble < 1 || scramble > SIZE) {
    throw new RangeError('scramble must be an integer in 1..25');
  }

  let initial = 0;
  if (supplied !== undefined) {
    if (!Array.isArray(supplied) || supplied.length !== SIZE) {
      throw new RangeError('board must be a 25-element array of 0 or 1');
    }
    for (let i = 0; i < SIZE; i++) {
      const value = supplied[i];
      if (!Object.hasOwn(supplied, i) || (value !== 0 && value !== 1)) {
        throw new RangeError('board must be a 25-element array of 0 or 1');
      }
      if (value === 1) initial |= BITS[i];
    }
  } else {
    let state = seed;
    for (let i = 0; i < scramble; i++) {
      let s = state;
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      state = s >>> 0;
      initial ^= PRESS_MASKS[state % SIZE];
    }
  }

  let board = initial;
  const history = [];
  return {
    snapshot() {
      return {
        board: BITS.map((bit) => (board & bit) === 0 ? 0 : 1),
        moves: history.length,
        won: board === 0,
        undoDepth: history.length,
      };
    },
    press(index) {
      if (board === 0 || !Number.isInteger(index) || index < 0 || index >= SIZE) {
        return false;
      }
      board ^= PRESS_MASKS[index];
      history.push(index);
      return true;
    },
    undo() {
      if (history.length === 0) return false;
      board ^= PRESS_MASKS[history.pop()];
      return true;
    },
    reset() {
      board = initial;
      history.length = 0;
    },
    solution() {
      return solve(board);
    },
  };
}
