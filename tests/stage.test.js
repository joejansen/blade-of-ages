import test from 'node:test';
import assert from 'node:assert/strict';
import { stageIds, getStage, drawForeground, FG_BOX, LANE, FEATHER } from '../src/art/stage/index.js';
import { recordingContext } from './vectorCheck.js';
import { GROUND_Y } from '../src/config/constants.js';

const ARENAS = ['castle', 'dojo', 'longship', 'colosseum', 'steppe', 'thermopylae', 'dock', 'savanna', 'temple', 'carrier'];

test('every arena has a layered stage', () => {
  assert.deepEqual([...stageIds()].sort(), [...ARENAS].sort());
});

for (const id of ARENAS) {
  test(`${id}: horizon splits the plate above the fighters' floor`, () => {
    const { horizon } = getStage(id);
    assert.ok(horizon - FEATHER > 200 && horizon < GROUND_Y, `horizon ${horizon}`);
  });

  test(`${id}: foreground draws inside its texture and keeps the fight lane clear`, () => {
    const { ctx, seen, depth } = recordingContext();
    drawForeground(ctx, id);
    assert.equal(depth(), 0, 'save/restore balanced');
    assert.ok(seen.length > 20, 'draws something');
    const [x0, y0, x1, y1] = FG_BOX;
    let nearFighters = false;
    for (const [x, y] of seen) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y), 'finite coordinates');
      assert.ok(x >= x0 && x <= x1 && y >= y0 && y <= y1, `(${x.toFixed(0)}, ${y.toFixed(0)}) outside the foreground texture`);
      if (x > LANE.x0 && x < LANE.x1) {
        assert.ok(y >= LANE.top, `(${x.toFixed(0)}, ${y.toFixed(0)}) rises into the fight lane`);
        // Something in the lane must reach the fighters' feet, or the
        // foreground never passes in front of them.
        if (y < GROUND_Y + 10) nearFighters = true;
      }
    }
    assert.ok(nearFighters, 'some lane prop reaches the fighters\' feet');
  });
}
