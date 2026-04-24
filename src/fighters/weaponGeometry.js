// Shared weapon-geometry math. Both the production renderers and the debug
// overlay compute hand and weapon-tip positions here, so the trail origin,
// the drawn weapon grip, and the debug markers all agree.
//
// The `scale` parameter applies `profile.renderScale` to the offsets from
// the fighter's draw origin. Callers that render into a Phaser Graphics
// that already applies `setScale(renderScale)` (WarriorRenderer) should
// pass `scale=1`. Callers that position sprites directly in world space
// (AssetWarriorRenderer, DebugOverlay) should pass the fighter's
// `profile.renderScale` so the trail/debug geometry lands where the
// renderScaled artwork is actually drawn.

const CROUCH_OFFSET_Y = 30;
// Matches the `bp.headY * 0.3` factor baked into every drawWarrior*()
// function in src/art/warriorArt.js so the trail anchor tracks the drawn
// torso as the head bobs.
const HEAD_BOB_FACTOR = 0.3;

export function computeWeaponGeometry(pose, profile, x, y, dir, scale = 1) {
  const anchors = profile.anchors;
  const trail = profile.trail;

  const armAngle = pose.armAngle * Math.PI / 180;
  const weaponAngle = pose.weaponAngle * Math.PI / 180;

  const torsoOffY = anchors.torsoOffsetY
    + pose.crouchFactor * CROUCH_OFFSET_Y
    + (pose.headY || 0) * HEAD_BOB_FACTOR;
  const armDX = anchors.armOffsetX * dir;
  const armDY = torsoOffY + anchors.armOffsetY;
  const handDX = armDX + Math.sin(armAngle) * anchors.armReach * dir;
  const handDY = armDY - Math.cos(armAngle) * anchors.armReach;

  // trailLength keyframe can stretch or compress the smear; defaults to 1x
  // outside of attack keyframes where trailLength is unset.
  const lengthMul = trail.lengthScale * (pose.trailLength > 0 ? pose.trailLength : 1);
  const weaponLen = trail.renderedWeaponLength * lengthMul;
  const tipDX = handDX + Math.sin(weaponAngle) * weaponLen * dir;
  const tipDY = handDY - Math.cos(weaponAngle) * weaponLen;

  return {
    armX: x + armDX * scale,
    armY: y + armDY * scale,
    handX: x + handDX * scale,
    handY: y + handDY * scale,
    tipX: x + tipDX * scale,
    tipY: y + tipDY * scale,
    weaponAngle,
    weaponLen: weaponLen * scale,
  };
}
