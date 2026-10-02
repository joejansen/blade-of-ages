import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { FIGHTER_PROFILES } from '../src/config/fighterProfiles.js';
import { getAssetRig } from '../src/config/assetRig.js';
import { sampleAnimationPose, blendPose } from '../src/fighters/animationClips.js';
import { RIG, computeRigGeometry, partTransform, solveLimb } from '../src/fighters/rigGeometry.js';

const states = ['idle', 'walking', 'jumping', 'crouching', 'lightAttack', 'heavyAttack', 'special', 'blocking', 'hit', 'defeated', 'victory'];
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-7, `${message}: ${a} != ${b}`);
const length = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

for (const [id, profile] of Object.entries(FIGHTER_PROFILES)) {
  test(`${id}: connected fixed-length limbs, planted feet and mirrored weapons throughout every clip`, () => {
    for (const state of states) for (let t = 0; t <= 1800; t += 25) for (const scale of [profile.renderScale, profile.renderScale * 3.5]) {
      const pose = sampleAnimationPose(state, t, profile, { facingRight: true, verticalVelocity: -120 });
      const rig = computeRigGeometry(pose, profile, 200, 580, 1, scale);
      const mirror = computeRigGeometry(pose, profile, 200, 580, -1, scale);
      for (const [name, a, b] of [['frontArm', RIG.upperArm, RIG.forearm], ['backArm', RIG.upperArm, RIG.forearm], ['frontLeg', RIG.thigh, RIG.shin], ['backLeg', RIG.thigh, RIG.shin]]) {
        const chain = rig[name];
        near(length(chain.root, chain.joint), a * scale, `${state} ${name} first bone`);
        near(length(chain.joint, chain.end), b * scale, `${state} ${name} second bone`);
        for (const joint of ['root', 'joint', 'end']) {
          near(chain[joint].x + mirror[name][joint].x, 400, 'mirrored x');
          near(chain[joint].y, mirror[name][joint].y, 'mirrored y');
        }
      }
      near(rig.frontLeg.end.y, 580 + (-RIG.sole + pose.frontFootY) * scale, `${state} front foot planted`);
      near(rig.backLeg.end.y, 580 + (-RIG.sole + pose.backFootY) * scale, `${state} back foot planted`);
      near(rig.weapon.handX, rig.frontArm.end.x, 'grip at hand');
      near(rig.weapon.handY, rig.frontArm.end.y, 'grip at hand');
      near(Math.hypot(rig.weapon.tipX - rig.weapon.handX, rig.weapon.tipY - rig.weapon.handY), profile.trail.renderedWeaponLength * scale, 'physical weapon length');
    }
  });

  test(`${id}: actual PNG landmarks land on both bone endpoints, including reflection`, async () => {
    const rig = getAssetRig(id);
    for (const [name, part] of Object.entries(rig)) {
      const { width, height } = await sharp(`public/assets/warriors/${id}/${name}.png`).metadata();
      if (name === 'head') { assert.ok(part.height > 0 && part.origin.length === 2); continue; }
      for (const mirrored of [false, true]) {
        const start = { x: 14, y: -23 }, end = { x: mirrored ? -35 : 35, y: 61 };
        const transform = partTransform(part, width, height, start, end, mirrored);
        const map = ([u, v]) => {
          const x = ((mirrored ? 1 - u : u) - transform.originX) * width * transform.scale;
          const y = (v - transform.originY) * height * transform.scale;
          return { x: start.x + x * Math.cos(transform.rotation) - y * Math.sin(transform.rotation), y: start.y + x * Math.sin(transform.rotation) + y * Math.cos(transform.rotation) };
        };
        near(map(part.start).x, start.x, `${name} start x`);
        near(map(part.start).y, start.y, `${name} start y`);
        near(map(part.end).x, end.x, `${name} end x`);
        near(map(part.end).y, end.y, `${name} end y`);
      }
    }
  });
}

test('axe is held on its lower grip; swords on their upper grips', () => {
  assert.ok(getAssetRig('viking').weapon.start[1] > getAssetRig('viking').weapon.end[1]);
  for (const id of ['knight', 'samurai', 'pirate', 'conquistador', 'zulu']) {
    assert.ok(getAssetRig(id).weapon.start[1] < getAssetRig(id).weapon.end[1]);
  }
});

test('gait alternates lifted feet and blends back to planted idle', () => {
  const profile = FIGHTER_PROFILES.knight;
  const a = sampleAnimationPose('walking', 0, profile, { facingRight: true });
  const b = sampleAnimationPose('walking', 450 / profile.clipSpeed.walk, profile, { facingRight: true });
  assert.ok(a.frontFootY < 0 && a.backFootY === 0);
  assert.ok(b.backFootY < 0 && Math.abs(b.frontFootY) < 1e-7);
  const idle = sampleAnimationPose('idle', 0, profile);
  near(blendPose(a, idle, 1).frontFootY, 0, 'idle plants foot');
});

test('unreachable and coincident IK targets stay finite with rigid bones', () => {
  for (const target of [{ x: 0, y: 0 }, { x: 999, y: 999 }]) {
    const c = solveLimb({ x: 0, y: 0 }, target, 21, 22);
    near(length(c.root, c.joint), 21, 'upper bone');
    near(length(c.joint, c.end), 22, 'lower bone');
  }
});

test('victory raises the weapon above the shoulder with its tip upward', () => {
  for (const profile of Object.values(FIGHTER_PROFILES)) {
    const pose = sampleAnimationPose('victory', 500, profile);
    const { weapon } = computeRigGeometry(pose, profile, 0, 0, 1);
    assert.ok(weapon.handY < weapon.armY - 15);
    assert.ok(weapon.tipY < weapon.handY);
  }
});
