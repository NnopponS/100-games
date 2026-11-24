function isRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function bounded(value, min, max) {
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
  const rings = [radii[0], radii[1], radii[2]];
  if (!rings.every(value => Number.isFinite(value) && value > 0) ||
      !(rings[0] < rings[1] && rings[1] < rings[2])) {
    throw new RangeError('Expected three positive increasing radii');
  }

  let score = 0;
  const history = [];

  function snapshot() {
    const taken = history.length;
    const remaining = shots - taken;
    const last = taken ? { ...history[taken - 1] } : null;
    return { score, taken, remaining, over: remaining === 0, last, undoDepth: taken };
  }

  function shoot(shot) {
    if (history.length === shots || !isRecord(shot)) return false;
    const { speed, angle, x = 0 } = shot;
    if (!bounded(speed, 1, 100) || !bounded(angle, -30, 60) ||
        !bounded(x, -10, 10)) return false;

    const radians = (angle * Math.PI) / 180;
    const time = distance / (speed * Math.cos(radians));
    const y = height + speed * Math.sin(radians) * time - 0.5 * gravity * time * time;
    const radius = Math.hypot(x - centerX, y - centerY);
    const ground = y < 0;
    let points = 0;
    if (!ground) {
      if (radius <= rings[0]) points = 10;
      else if (radius <= rings[1]) points = 7;
      else if (radius <= rings[2]) points = 3;
    }
    history.push({ x, y, time, radius, points, ground });
    score += points;
    return true;
  }

  function undo() {
    const shot = history.pop();
    if (!shot) return false;
    score -= shot.points;
    return true;
  }

  function reset() {
    history.length = 0;
    score = 0;
  }

  return { snapshot, shoot, undo, reset };
}
