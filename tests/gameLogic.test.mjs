import test from 'node:test';
import assert from 'node:assert/strict';
import { LANES, clampLane, hasCollision, makeObstacle, recycleObstacle, shiftLane } from '../src/gameLogic.js';

test('clampLane keeps index in range', () => {
  assert.equal(clampLane(-5), 0);
  assert.equal(clampLane(99), LANES.length - 1);
});

test('shiftLane moves left and right safely', () => {
  assert.equal(shiftLane(1, -1), 0);
  assert.equal(shiftLane(1, 1), 2);
  assert.equal(shiftLane(0, -1), 0);
});

test('makeObstacle and recycleObstacle generate valid obstacle values', () => {
  const obstacle = makeObstacle(-50);
  assert.ok(obstacle.lane >= 0 && obstacle.lane < LANES.length);
  assert.equal(obstacle.z, -50);

  const recycled = recycleObstacle(obstacle);
  assert.ok(recycled.lane >= 0 && recycled.lane < LANES.length);
  assert.ok(recycled.z <= -120);
  assert.ok(recycled.speed >= 1);
});

test('hasCollision detects close obstacle in same lane', () => {
  const obstacle = { lane: 1, z: 9.5 };
  assert.equal(hasCollision(1, obstacle), true);
  assert.equal(hasCollision(0, obstacle), false);
  assert.equal(hasCollision(1, { lane: 1, z: 30 }), false);
});
