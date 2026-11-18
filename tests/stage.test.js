import test from 'node:test';
import assert from 'node:assert/strict';
import { stageIds, getStage, drawForeground, FG_BOX, LANE, FEATHER, backgroundDrainAlpha, midgroundCoverage } from '../src/art/stage/index.js';
import { recordingContext } from './vectorCheck.js';
import { GROUND_Y } from '../src/config/constants.js';

const ARENAS = ['castle', 'dojo', 'longship', 'colosseum', 'steppe', 'thermopylae', 'dock', 'savanna', 'temple', 'carrier'];

test('every arena has a layered stage', () => {
  assert.deepEqual([...stageIds()].sort(), [...ARENAS].sort());
});

test('KO drain is an exact crossfade across the horizon', () => {
  // Stack: graded plates, drained background (alpha a), drained midground
  // (alpha k*m). Each drained plate must end up weighted by k, the graded
  // composite by 1 - k, whatever the midground coverage m.
  for (let k = 0; k <= 1; k += 0.125) for (let m = 0; m <= 1; m += 0.125) {
    const a = backgroundDrainAlpha(k, m);
    const graded = (1 - a) * (1 - k * m);
    assert.ok(Math.abs(graded - (1 - k)) < 1e-9, `k=${k} m=${m}: graded weight ${graded}`);
    assert.ok(Math.abs(a * (1 - k * m) - k * (1 - m)) < 1e-9, `k=${k} m=${m}: drained background weight`);
  }
  assert.equal(midgroundCoverage(400, 500), 0);
  assert.equal(midgroundCoverage(500, 500), 1);
  assert.equal(midgroundCoverage(500 - FEATHER / 2, 500), 0.5);
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
