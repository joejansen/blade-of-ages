// Pure anatomy/attachment math shared by sprites, trails, tests and debugging.
const RAD = Math.PI / 180;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const RIG = { torso: 34, upperArm: 21, forearm: 22, thigh: 27, shin: 27, sole: 5 };

// Fixed-length two-bone chain. Unreachable targets are clamped, never stretched.
export function solveLimb(root, target, a, b, bend = 1) {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const raw = Math.hypot(dx, dy);
  const distance = clamp(raw, Math.abs(a - b) + 0.001, a + b - 0.001);
  const ux = raw > 0.001 ? dx / raw : 0;
  const uy = raw > 0.001 ? dy / raw : 1;
  const along = (a * a - b * b + distance * distance) / (2 * distance);
  const across = Math.sqrt(Math.max(0, a * a - along * along)) * bend;
  return {
    root,
    joint: { x: root.x + ux * along - uy * across, y: root.y + uy * along + ux * across },
    end: { x: root.x + ux * distance, y: root.y + uy * distance },
  };
}

export function computeRigGeometry(pose, profile, x, baseY, dir, scale = 1) {
  const crouch = clamp(pose.crouchFactor || 0, 0, 1);
  const lean = (pose.torsoAngle || 0) * RAD;
  const hip = { x: 0, y: -55 + crouch * 23 + (pose.bodyY || 0) * 0.45 + (pose.headY || 0) * 0.06 };
  // The sprite gait has its own stance width; retain animated legSpread in
  // the pose for the vector fallback, which does not consume foot targets.
  const walkBlend = clamp(pose.walkBlend || 0, 0, 1);
  const clipSpread = pose.legSpread || 14;
  const spread = clamp(clipSpread + (16 * profile.motion.walkStride - clipSpread) * walkBlend, 8, 38);
  const frontTarget = { x: spread * 0.9 + (pose.frontFootX || 0), y: -RIG.sole + (pose.frontFootY || 0) };
  const backTarget = { x: -spread * 0.8 + (pose.backFootX || 0), y: -RIG.sole + (pose.backFootY || 0) };
  // Lower the pelvis when a wide stance needs it, so the solver never pulls a
  // planted foot off the floor to satisfy an unreachable target.
  for (const [target, hipX] of [[frontTarget, -5], [backTarget, 5]]) {
    const reach = RIG.thigh + RIG.shin - 0.01;
    hip.y = Math.max(hip.y, target.y - Math.sqrt(Math.max(0, reach * reach - (target.x - hipX) ** 2)));
  }
  const torsoPoint = (dx, dy) => ({ x: hip.x + dx * Math.cos(lean) - dy * Math.sin(lean), y: hip.y + dx * Math.sin(lean) + dy * Math.cos(lean) });
  const neck = torsoPoint(0, -RIG.torso);
  // Keep shoulder sockets on the resized torso rather than at the old width.
  const frontShoulder = torsoPoint(-0.225 * RIG.torso, -0.8 * RIG.torso);
  const backShoulder = torsoPoint(0.175 * RIG.torso, -0.8 * RIG.torso);
  const armAngle = (pose.armAngle || 0) * RAD;
  // Guard at chest height. Wind-up and follow-through extend from this guard.
  const handTarget = { x: frontShoulder.x + 25 + Math.sin(armAngle) * 15, y: frontShoulder.y + 13 - Math.cos(armAngle) * 12 - (pose.handLift || 0) };
  const frontArm = solveLimb(frontShoulder, handTarget, RIG.upperArm, RIG.forearm, 1);
  // Rear hand guards the lower chest; the elbow hangs behind and below it,
  // using the same anatomical bend direction as the weapon arm.
  const backHandTarget = torsoPoint((0.375 - Math.sin(armAngle) * 0.1) * RIG.torso, -0.55 * RIG.torso);
  const backArm = solveLimb(backShoulder, backHandTarget, RIG.upperArm, RIG.forearm, 1);
  const frontLeg = solveLimb({ x: hip.x - 5, y: hip.y }, frontTarget, RIG.thigh, RIG.shin, -1);
  const backLeg = solveLimb({ x: hip.x + 5, y: hip.y }, backTarget, RIG.thigh, RIG.shin, -1);
  const world = p => ({ x: x + p.x * dir * scale, y: baseY + p.y * scale });
  const chain = c => ({ root: world(c.root), joint: world(c.joint), end: world(c.end) });
  const hand = world(frontArm.end);
  const weaponAngle = (pose.weaponAngle || 0) * RAD;
  // FX intensity never changes the physical blade length.
  const weaponLen = profile.trail.renderedWeaponLength * scale;
  return {
    hip: world(hip), neck: world(neck), torsoAngle: lean * dir,
    frontArm: chain(frontArm), backArm: chain(backArm), frontLeg: chain(frontLeg), backLeg: chain(backLeg),
    weapon: {
      armX: world(frontShoulder).x, armY: world(frontShoulder).y,
      handX: hand.x, handY: hand.y,
      tipX: hand.x + Math.sin(weaponAngle) * weaponLen * dir,
      tipY: hand.y - Math.cos(weaponAngle) * weaponLen,
      weaponAngle, weaponLen,
    },
  };
}

// Resolve the source's actual axis, including opposite-facing axe artwork.
// Horizontal reflection affects both the origin and source axis in Phaser.
export function partTransform(part, width, height, start, end, mirrored = false) {
  const dx = (part.end[0] - part.start[0]) * width * (mirrored ? -1 : 1);
  const dy = (part.end[1] - part.start[1]) * height;
  return {
    originX: mirrored ? 1 - part.start[0] : part.start[0],
    originY: part.start[1],
    rotation: Math.atan2(end.y - start.y, end.x - start.x) - Math.atan2(dy, dx),
    scale: Math.hypot(end.x - start.x, end.y - start.y) / Math.hypot(dx, dy),
  };
}
