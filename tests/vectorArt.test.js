import test from 'node:test';
import assert from 'node:assert/strict';
import { vectorWarriorIds, getVectorParts, getVectorRig, HEROIC_RIG } from '../src/art/vector/index.js';
import { FIGHTER_PROFILES } from '../src/config/fighterProfiles.js';
import { checkParts } from './vectorCheck.js';

for (const id of vectorWarriorIds()) {
  const length = FIGHTER_PROFILES[id].trail.renderedWeaponLength;

  test(`${id}: every vector part draws cleanly inside its box`, () => {
    assert.deepEqual(checkParts(getVectorParts(id, length)), []);
  });

  test(`${id}: stands on the heroic rig with a complete part set`, () => {
    assert.equal(FIGHTER_PROFILES[id].rig, HEROIC_RIG);
    const rig = getVectorRig(id, length);
    for (const name of ['torso', 'upper_arm', 'lower_arm', 'upper_leg', 'lower_leg', 'foot', 'head', 'weapon']) {
      assert.ok(rig[name], `${name} defined`);
    }
    for (const name of ['torso', 'upper_arm', 'lower_arm', 'upper_leg', 'lower_leg', 'weapon']) {
      const { start, end } = rig[name];
      assert.ok(Math.hypot(end[0] - start[0], end[1] - start[1]) > 0.1, `${name} spans a bone`);
    }
  });
}
