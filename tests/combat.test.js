import test from 'node:test';
import assert from 'node:assert/strict';
import { MOVES, reachFor } from '../src/config/moves.js';
import { FIGHTER_PROFILES } from '../src/config/fighterProfiles.js';
import { sampleClip, resolveClipName, clipDuration } from '../src/fighters/animationClips.js';
import { computeRigGeometry } from '../src/fighters/rigGeometry.js';

test('every move has a sane active window and a real follow-up', () => {
  for (const [name, move] of Object.entries(MOVES)) {
    const [start, end] = move.active;
    assert.ok(start > 0 && start < end && end < 1, `${name}: active window inside the move`);
    assert.ok(move.bottom > move.top, `${name}: hitbox has height`);
    if (move.chain) assert.ok(MOVES[move.chain], `${name}: chains into a defined move`);
  }
  assert.equal(MOVES.light1.chain, 'light2');
  assert.equal(MOVES.light2.chain, 'light3');
  assert.equal(MOVES.light3.chain, undefined, 'the finisher ends the string');
});

test('a light string links: each hit stuns longer than the next one takes to land', () => {
  for (const name of ['light1', 'light2']) {
    const move = MOVES[name];
    const next = MOVES[move.chain];
    // The follow-up starts once this move's active window closes.
    const gap = move.duration * (move.active[1] + 0.04 - move.active[0]) + next.duration * next.active[0];
    assert.ok(gap < move.hitstun + move.hitstop, `${name} -> ${move.chain} leaves no gap to block in`);
  }
});

test('thrusting weapons stab; cutting weapons cut', () => {
  assert.equal(resolveClipName('light1', FIGHTER_PROFILES.zulu), 'thrust1');
  assert.equal(resolveClipName('heavy', FIGHTER_PROFILES.conquistador), 'lunge');
  assert.equal(resolveClipName('light1', FIGHTER_PROFILES.samurai), 'light1');
  assert.equal(resolveClipName('special', FIGHTER_PROFILES.viking), 'special');
  for (const profile of Object.values(FIGHTER_PROFILES)) {
    for (const move of Object.values(MOVES)) {
      assert.ok(clipDuration(resolveClipName(move.clip, profile), profile) > 0);
    }
  }
});

test('longer weapons threaten further', () => {
  assert.ok(reachFor(MOVES.light1, FIGHTER_PROFILES.knight) > reachFor(MOVES.light1, FIGHTER_PROFILES.gladiator));
});

test('during the active window the blade is out in front and clear of the floor', () => {
  for (const [id, profile] of Object.entries(FIGHTER_PROFILES)) {
    for (const [name, move] of Object.entries(MOVES)) {
      if (name === 'air') continue;
      const clip = resolveClipName(move.clip, profile);
      for (let p = move.active[0] + 0.12; p <= move.active[1]; p += 0.02) {
        const pose = sampleClip(clip, p, profile, { facingRight: true });
        const { weapon } = computeRigGeometry(pose, profile, 0, 0, 1, 1);
        assert.ok(weapon.tipX > weapon.handX, `${id} ${name}@${p.toFixed(2)}: blade points at the opponent`);
        assert.ok(weapon.tipX > 45, `${id} ${name}@${p.toFixed(2)}: blade reaches forward (${weapon.tipX.toFixed(1)})`);
        assert.ok(weapon.tipY < 0, `${id} ${name}@${p.toFixed(2)}: blade stays above the floor (${weapon.tipY.toFixed(1)})`);
      }
    }
  }
});

test('a lunge keeps the pelvis off the floor', () => {
  for (const [id, profile] of Object.entries(FIGHTER_PROFILES)) {
    for (const clip of ['light3', 'heavy', 'lunge', 'special', 'specialThrust', 'dash']) {
      for (let p = 0; p <= 1; p += 0.05) {
        const rig = computeRigGeometry(sampleClip(clip, p, profile), profile, 0, 0, 1, 1);
        assert.ok(rig.hip.y < -30, `${id} ${clip}@${p.toFixed(2)}: hip at ${rig.hip.y.toFixed(1)}`);
      }
    }
  }
});

test('a knockdown ends flat on the back and getting up returns to guard', () => {
  const profile = FIGHTER_PROFILES.knight;
  const down = computeRigGeometry(sampleClip('fall', 1, profile), profile, 0, 0, 1, 1);
  assert.ok(down.hip.y > -14, 'pelvis on the floor');
  assert.ok(down.neck.y > -20 && down.neck.x < down.hip.x - 25, 'torso laid out behind the hips');
  const up = computeRigGeometry(sampleClip('getup', 1, profile), profile, 0, 0, 1, 1);
  assert.ok(up.hip.y < -40 && up.neck.y < -70, 'standing again');
});
