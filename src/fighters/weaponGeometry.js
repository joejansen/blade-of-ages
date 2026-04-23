// Shared weapon-geometry math. Both the production renderer
// (WarriorRenderer) and the debug overlay compute hand and weapon-tip
// positions the same way — keeping this in one place prevents the trail and
// the debug diagnostics from drifting out of agreement.

const CROUCH_OFFSET_Y = 30;
const HEAD_BOB_FACTOR = 0.25;

export function computeWeaponGeometry(pose, profile, x, y, dir) {
  const anchors = profile.anchors;
  const trail = profile.trail;

  const armAngle = pose.armAngle * Math.PI / 180;
  const weaponAngle = pose.weaponAngle * Math.PI / 180;
  const torsoY = y + anchors.torsoOffsetY
    + pose.crouchFactor * CROUCH_OFFSET_Y
    + (pose.headY || 0) * HEAD_BOB_FACTOR;

  const armX = x + anchors.armOffsetX * dir;
  const armY = torsoY + anchors.armOffsetY;
  const handX = armX + Math.sin(armAngle) * anchors.armReach * dir;
  const handY = armY - Math.cos(armAngle) * anchors.armReach;

  // trailLength keyframe can stretch or compress the smear; defaults to 1x
  // outside of attack keyframes where trailLength is unset.
  const lengthMul = trail.lengthScale * (pose.trailLength > 0 ? pose.trailLength : 1);
  const weaponLen = trail.renderedWeaponLength * lengthMul;
  const tipX = handX + Math.sin(weaponAngle) * weaponLen * dir;
  const tipY = handY - Math.cos(weaponAngle) * weaponLen;

  return { armX, armY, handX, handY, tipX, tipY, weaponLen, weaponAngle };
}
