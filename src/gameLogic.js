export const LANES = [-3.2, 0, 3.2];

export function clampLane(index) {
  return Math.max(0, Math.min(LANES.length - 1, index));
}

export function shiftLane(current, direction) {
  return clampLane(current + direction);
}

export function makeObstacle(z = -120) {
  return {
    lane: Math.floor(Math.random() * LANES.length),
    z,
    speed: 0.9 + Math.random() * 0.8,
    width: 2.2,
    depth: 4
  };
}

export function recycleObstacle(obstacle) {
  return {
    ...obstacle,
    lane: Math.floor(Math.random() * LANES.length),
    z: -120 - Math.random() * 240,
    speed: 1 + Math.random() * 1.1
  };
}

export function hasCollision(playerLane, obstacle, playerZ = 9) {
  const sameLane = Math.abs(LANES[playerLane] - LANES[obstacle.lane]) < 1.3;
  const nearZ = Math.abs(playerZ - obstacle.z) < 3.2;
  return sameLane && nearZ;
}
