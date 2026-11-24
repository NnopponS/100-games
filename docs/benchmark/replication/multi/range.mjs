function isRecord(value) {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function inBounds(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function createRange(options = {}) {
  if (!isRecord(options)) throw new RangeError('Expected a plain options record');
  const {
    distance = 20,
    gravity = 9.81,
    height = 1.5,
    centerY = 1.5,
    centerX = 0,
    radii = [0.1, 0.25, 0.5],
    shots = 5,
  } = options;

  if (!Number.isFinite(distance) || distance <= 0 ||
      !Number.isFinite(gravity) || gravity <= 0 ||
      !Number.isFinite(height) || height < 0 ||
      !Number.isFinite(centerY) || centerY < 0 ||
      !Number.isFinite(centerX) ||
      !Number.isInteger(shots) || shots < 1 || shots > 30 ||
      !Array.isArray(radii) || radii.length !== 3) {
    throw new RangeError('Invalid range options');
  }
  const [inner, middle, outer] = [radii[0], radii[1], radii[2]];
  if (!Number.isFinite(inner) || inner <= 0 ||
      !Number.isFinite(middle) || middle <= inner ||
      !Number.isFinite(outer) || outer <= middle) {
    throw new RangeError('Invalid ring radii');
  }

  const history = [];
  let score = 0;

  function snapshot() {
    const taken = history.length;
    const remaining = shots - taken;
    return {
      score,
      taken,
      remaining,
      over: remaining === 0,
      last: taken === 0 ? null : { ...history[taken - 1] },
      undoDepth: taken,
    };
  }

  function shoot(shot) {
    if (history.length >= shots) return false;
    let speed, angle, x;
    try {
      if (!isRecord(shot)) return false;
      ({ speed, angle, x = 0 } = shot);
    } catch {
      return false;
    }
    if (!inBounds(speed, 1, 100) ||
        !inBounds(angle, -30, 60) ||
        !inBounds(x, -10, 10)) {
      return false;
    }

    const radians = angle * Math.PI / 180;
    const time = distance / (speed * Math.cos(radians));
    const y = height + speed * Math.sin(radians) * time - 0.5 * gravity * time * time;
    const radius = Math.hypot(x - centerX, y - centerY);
    const ground = y < 0;
    let points = 0;
    if (!ground) {
      if (radius <= inner) points = 10;
      else if (radius <= middle) points = 7;
      else if (radius <= outer) points = 3;
    }

    history.push({ x, y, time, radius, points, ground });
    score += points;
    return true;
  }

  function undo() {
    if (history.length === 0) return false;
    score -= history.pop().points;
    return true;
  }

  function reset() {
    history.length = 0;
    score = 0;
  }

  return { snapshot, shoot, undo, reset };
}
