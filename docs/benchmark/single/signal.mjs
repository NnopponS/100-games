const SIDE = 5;
const SIZE = SIDE * SIDE;

const pressMasks = Array.from({ length: SIZE }, (_, index) => {
  let mask = 1 << index;
  if (index >= SIDE) mask |= 1 << (index - SIDE);
  if (index < SIZE - SIDE) mask |= 1 << (index + SIDE);
  if (index % SIDE > 0) mask |= 1 << (index - 1);
  if (index % SIDE < SIDE - 1) mask |= 1 << (index + 1);
  return mask;
});

// Eliminate the press columns over GF(2), tracking the press set for each
// pivot. Dependent columns give a basis for combinations with no effect.
const effectByPivot = Array(SIZE).fill(0);
const pressesByPivot = Array(SIZE).fill(0);
const nullspace = [];
for (const [index, effect] of pressMasks.entries()) {
  let remaining = effect;
  let presses = 1 << index;
  while (remaining !== 0) {
    const pivot = 31 - Math.clz32(remaining);
    if (effectByPivot[pivot] === 0) {
      effectByPivot[pivot] = remaining;
      pressesByPivot[pivot] = presses;
      break;
    }
    remaining ^= effectByPivot[pivot];
    presses ^= pressesByPivot[pivot];
  }
  if (remaining === 0) nullspace.push(presses);
}
const kernel = [0];
for (const basis of nullspace) {
  const count = kernel.length;
  for (let i = 0; i < count; i++) kernel.push(kernel[i] ^ basis);
}

function popcount(mask) {
  let n = 0;
  while (mask !== 0) {
    mask &= mask - 1;
    n++;
  }
  return n;
}

function shortestSolution(board) {
  if (board === 0) return [];
  let remaining = board;
  let oneSolution = 0;
  while (remaining !== 0) {
    const pivot = 31 - Math.clz32(remaining);
    if (effectByPivot[pivot] === 0) return null;
    remaining ^= effectByPivot[pivot];
    oneSolution ^= pressesByPivot[pivot];
  }

  let best = oneSolution;
  let length = popcount(best);
  for (const alternative of kernel) {
    const candidate = oneSolution ^ alternative;
    const candidateLength = popcount(candidate);
    if (candidateLength < length) {
      best = candidate;
      length = candidateLength;
    }
  }
  const indices = [];
  for (let i = 0; i < SIZE; i++) {
    if ((best & (1 << i)) !== 0) indices.push(i);
  }
  return indices;
}

export function createSignal(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new RangeError('Expected an options object');
  }
  const { board: input, seed = 1, scramble = 8 } = options;
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) {
    throw new RangeError('Seed must be an integer from 1 to 4294967295');
  }
  if (!Number.isInteger(scramble) || scramble < 1 || scramble > SIZE) {
    throw new RangeError('Scramble must be an integer from 1 to 25');
  }
  let initial = 0;
  if (input === undefined) {
    let state = seed;
    for (let i = 0; i < scramble; i++) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      initial ^= pressMasks[state % SIZE];
    }
  } else {
    if (!Array.isArray(input) || input.length !== SIZE) {
      throw new RangeError('Board must contain 25 binary cells');
    }
    for (let i = 0; i < SIZE; i++) {
      const cell = input[i];
      if (!Object.hasOwn(input, i) || (cell !== 0 && cell !== 1)) {
        throw new RangeError('Board must contain 25 binary cells');
      }
      if (cell === 1) initial |= 1 << i;
    }
  }

  let board = initial;
  const history = [];
  return {
    snapshot() {
      return {
        board: Array.from({ length: SIZE }, (_, i) => (board >>> i) & 1),
        moves: history.length,
        won: board === 0,
        undoDepth: history.length,
      };
    },
    press(index) {
      if (board === 0 || !Number.isInteger(index) || index < 0 || index >= SIZE) {
        return false;
      }
      history.push(index);
      board ^= pressMasks[index];
      return true;
    },
    undo() {
      if (history.length === 0) return false;
      board ^= pressMasks[history.pop()];
      return true;
    },
    reset() {
      board = initial;
      history.length = 0;
    },
    solution() {
      return shortestSolution(board);
    },
  };
}
