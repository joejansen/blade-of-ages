const DEFAULT_POSE = {
  headY: 0,
  torsoAngle: 0,
  armAngle: 12,
  weaponAngle: 24,
  legSpread: 14,
  crouchFactor: 0,
  bodyY: 0,
  trailAlpha: 0,
  trailWidth: 0,
  trailLength: 0,
  glow: 0,
};

const POSE_KEYS = Object.keys(DEFAULT_POSE);

const CLIPS = {
  idle: {
    loop: true,
    duration: 1600,
    keyframes: [
      { t: 0, values: { headY: -1, torsoAngle: -2, armAngle: 10, weaponAngle: 18, legSpread: 12, bodyY: 0 } },
      { t: 0.25, values: { headY: 1.5, torsoAngle: 1, armAngle: 13, weaponAngle: 28, legSpread: 15, bodyY: -1.5 } },
      { t: 0.5, values: { headY: 0.5, torsoAngle: 3, armAngle: 15, weaponAngle: 30, legSpread: 13, bodyY: 0 } },
      { t: 0.75, values: { headY: -1.5, torsoAngle: -1, armAngle: 11, weaponAngle: 20, legSpread: 16, bodyY: 1.2 } },
      { t: 1, values: { headY: -1, torsoAngle: -2, armAngle: 10, weaponAngle: 18, legSpread: 12, bodyY: 0 } },
    ],
  },
  walk: {
    loop: true,
    duration: 900,
    keyframes: [
      { t: 0, values: { headY: -1, torsoAngle: -5, armAngle: -12, weaponAngle: -8, legSpread: 30, bodyY: 3 } },
      { t: 0.2, values: { headY: 1, torsoAngle: 1, armAngle: 5, weaponAngle: 12, legSpread: 10, bodyY: -1 } },
      { t: 0.5, values: { headY: -2, torsoAngle: 6, armAngle: 20, weaponAngle: 34, legSpread: 28, bodyY: 2 } },
      { t: 0.7, values: { headY: 1.5, torsoAngle: 0, armAngle: 4, weaponAngle: 18, legSpread: 12, bodyY: -1.5 } },
      { t: 1, values: { headY: -1, torsoAngle: -5, armAngle: -12, weaponAngle: -8, legSpread: 30, bodyY: 3 } },
    ],
  },
  air: {
    loop: true,
    duration: 800,
    keyframes: [
      { t: 0, values: { headY: -7, torsoAngle: -12, armAngle: -30, weaponAngle: -40, legSpread: 20, bodyY: -6 } },
      { t: 0.5, values: { headY: -5, torsoAngle: 3, armAngle: -8, weaponAngle: -12, legSpread: 25, bodyY: -3 } },
      { t: 1, values: { headY: -7, torsoAngle: -12, armAngle: -30, weaponAngle: -40, legSpread: 20, bodyY: -6 } },
    ],
  },
  crouch: {
    loop: true,
    duration: 1200,
    keyframes: [
      { t: 0, values: { headY: 18, torsoAngle: 12, armAngle: 18, weaponAngle: 22, legSpread: 20, crouchFactor: 0.42, bodyY: 2 } },
      { t: 0.5, values: { headY: 19.5, torsoAngle: 14, armAngle: 20, weaponAngle: 28, legSpread: 24, crouchFactor: 0.48, bodyY: 0 } },
      { t: 1, values: { headY: 18, torsoAngle: 12, armAngle: 18, weaponAngle: 22, legSpread: 20, crouchFactor: 0.42, bodyY: 2 } },
    ],
  },
  lightAttack: {
    loop: false,
    duration: 300,
    keyframes: [
      { t: 0, values: { headY: 0, torsoAngle: -6, armAngle: -12, weaponAngle: -20, legSpread: 16, bodyY: 0 } },
      { t: 0.22, values: { headY: -2, torsoAngle: -18, armAngle: -48, weaponAngle: -72, legSpread: 22, bodyY: 4 } },
      { t: 0.48, values: { headY: 1, torsoAngle: 18, armAngle: 52, weaponAngle: 18, legSpread: 28, bodyY: -2, trailAlpha: 0.9, trailWidth: 18, trailLength: 1 } },
      { t: 0.72, values: { headY: 0, torsoAngle: 10, armAngle: 72, weaponAngle: 40, legSpread: 24, bodyY: 0, trailAlpha: 0.35, trailWidth: 10, trailLength: 0.7 } },
      { t: 1, values: { headY: -1, torsoAngle: 0, armAngle: 14, weaponAngle: 24, legSpread: 14, bodyY: 0 } },
    ],
  },
  heavyAttack: {
    loop: false,
    duration: 500,
    keyframes: [
      { t: 0, values: { headY: 0, torsoAngle: -8, armAngle: -18, weaponAngle: -16, legSpread: 18, bodyY: 0 } },
      { t: 0.25, values: { headY: -4, torsoAngle: -28, armAngle: -72, weaponAngle: -112, legSpread: 26, bodyY: 8 } },
      { t: 0.52, values: { headY: 2, torsoAngle: 28, armAngle: 84, weaponAngle: 44, legSpread: 34, bodyY: -4, trailAlpha: 1, trailWidth: 24, trailLength: 1.1 } },
      { t: 0.76, values: { headY: 1, torsoAngle: 16, armAngle: 62, weaponAngle: 72, legSpread: 28, bodyY: 2, trailAlpha: 0.45, trailWidth: 14, trailLength: 0.8 } },
      { t: 1, values: { headY: -1, torsoAngle: 0, armAngle: 14, weaponAngle: 24, legSpread: 14, bodyY: 0 } },
    ],
  },
  special: {
    loop: false,
    duration: 600,
    keyframes: [
      { t: 0, values: { headY: -1, torsoAngle: -10, armAngle: -28, weaponAngle: -30, legSpread: 18, bodyY: 0, glow: 0.2 } },
      { t: 0.2, values: { headY: -8, torsoAngle: -34, armAngle: -88, weaponAngle: -138, legSpread: 26, bodyY: 10, glow: 0.85 } },
      { t: 0.45, values: { headY: -2, torsoAngle: 34, armAngle: 96, weaponAngle: 62, legSpread: 38, bodyY: -6, trailAlpha: 1, trailWidth: 28, trailLength: 1.2, glow: 1 } },
      { t: 0.7, values: { headY: 0, torsoAngle: 18, armAngle: 76, weaponAngle: 88, legSpread: 30, bodyY: 0, trailAlpha: 0.55, trailWidth: 18, trailLength: 0.9, glow: 0.7 } },
      { t: 1, values: { headY: -1, torsoAngle: 0, armAngle: 14, weaponAngle: 24, legSpread: 14, bodyY: 0, glow: 0 } },
    ],
  },
  block: {
    loop: true,
    duration: 1000,
    keyframes: [
      { t: 0, values: { headY: 0, torsoAngle: -14, armAngle: -22, weaponAngle: -78, legSpread: 16, bodyY: 0 } },
      { t: 0.5, values: { headY: 1, torsoAngle: -10, armAngle: -18, weaponAngle: -70, legSpread: 18, bodyY: -1 } },
      { t: 1, values: { headY: 0, torsoAngle: -14, armAngle: -22, weaponAngle: -78, legSpread: 16, bodyY: 0 } },
    ],
  },
  hit: {
    loop: false,
    duration: 300,
    keyframes: [
      { t: 0, values: { headY: 0, torsoAngle: -10, armAngle: -14, weaponAngle: -18, legSpread: 14, bodyY: 0 } },
      { t: 0.25, values: { headY: 8, torsoAngle: -28, armAngle: -42, weaponAngle: -46, legSpread: 6, bodyY: 4 } },
      { t: 0.55, values: { headY: 5, torsoAngle: -20, armAngle: -26, weaponAngle: -32, legSpread: 10, bodyY: 1 } },
      { t: 1, values: { headY: 0, torsoAngle: 0, armAngle: 10, weaponAngle: 18, legSpread: 14, bodyY: 0 } },
    ],
  },
  defeated: {
    loop: false,
    duration: 1000,
    keyframes: [
      { t: 0, values: { headY: 18, torsoAngle: 34, armAngle: 44, weaponAngle: 72, legSpread: 22, crouchFactor: 0.35, bodyY: 8 } },
      { t: 0.5, values: { headY: 34, torsoAngle: 58, armAngle: 52, weaponAngle: 96, legSpread: 28, crouchFactor: 0.58, bodyY: 16 } },
      { t: 1, values: { headY: 40, torsoAngle: 64, armAngle: 54, weaponAngle: 108, legSpread: 32, crouchFactor: 0.62, bodyY: 18 } },
    ],
  },
  victory: {
    loop: true,
    duration: 1700,
    keyframes: [
      { t: 0, values: { headY: -4, torsoAngle: -8, armAngle: -122, weaponAngle: -136, legSpread: 16, bodyY: 0, glow: 0.1 } },
      { t: 0.3, values: { headY: -11, torsoAngle: -2, armAngle: -142, weaponAngle: -150, legSpread: 20, bodyY: -8, glow: 0.45 } },
      { t: 0.6, values: { headY: -8, torsoAngle: 4, armAngle: -112, weaponAngle: -118, legSpread: 22, bodyY: 2, glow: 0.25 } },
      { t: 1, values: { headY: -4, torsoAngle: -8, armAngle: -122, weaponAngle: -136, legSpread: 16, bodyY: 0, glow: 0.1 } },
    ],
  },
};

const STATE_TO_CLIP = {
  idle: 'idle',
  walking: 'walk',
  jumping: 'air',
  crouching: 'crouch',
  lightAttack: 'lightAttack',
  heavyAttack: 'heavyAttack',
  special: 'special',
  blocking: 'block',
  hit: 'hit',
  defeated: 'defeated',
  victory: 'victory',
};

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function interpolate(a, b, t) {
  return a + (b - a) * easeInOutSine(t);
}

function getClip(state) {
  return CLIPS[STATE_TO_CLIP[state] || 'idle'];
}

function sampleKeyframes(clip, progress) {
  const frames = clip.keyframes;

  for (let i = 0; i < frames.length - 1; i++) {
    const from = frames[i];
    const to = frames[i + 1];

    if (progress < from.t || progress > to.t) {
      continue;
    }

    const localT = to.t === from.t ? 0 : (progress - from.t) / (to.t - from.t);
    const pose = { ...DEFAULT_POSE };

    for (const key of POSE_KEYS) {
      const start = from.values?.[key] ?? DEFAULT_POSE[key] ?? 0;
      const end = to.values?.[key] ?? DEFAULT_POSE[key] ?? 0;
      pose[key] = interpolate(start, end, localT);
    }

    return pose;
  }

  return { ...DEFAULT_POSE, ...(frames[frames.length - 1]?.values || {}) };
}

function applyProfile(pose, profile, state, context) {
  const result = { ...pose };
  const bias = profile.poseBias;
  const motion = profile.motion;

  result.headY += bias.headY;
  result.torsoAngle += bias.torsoAngle;
  result.armAngle += bias.armAngle;
  result.weaponAngle += bias.weaponAngle;
  result.legSpread += bias.legSpread;
  result.crouchFactor += bias.crouchFactor;
  result.bodyY += bias.bodyY;

  if (state === 'idle') {
    result.headY *= motion.idleBreath;
    result.bodyY *= motion.idleBreath;
  }

  if (state === 'walking') {
    result.bodyY *= motion.walkBounce;
    result.legSpread *= motion.walkStride;
    result.weaponAngle += (context.facingRight ? 1 : -1) * motion.walkStride * 2;
  }

  if (state === 'crouching') {
    result.crouchFactor *= motion.crouchDepth;
  }

  if (state === 'jumping') {
    result.legSpread *= motion.airTuck;
    result.bodyY += Math.min(0, context.verticalVelocity / 120);
  }

  if (state === 'lightAttack' || state === 'heavyAttack' || state === 'special') {
    result.torsoAngle *= motion.attackLean;
    result.weaponAngle *= motion.attackLean;
  }

  if (state === 'hit') {
    result.bodyY *= motion.recoveryBounce;
  }

  return result;
}

export function sampleAnimationPose(state, elapsedMs, profile, context = {}) {
  const clip = getClip(state);
  const clipSpeed = profile.clipSpeed[STATE_TO_CLIP[state] || 'idle'] || 1;
  const duration = clip.duration / clipSpeed;

  let progress = duration <= 0 ? 1 : elapsedMs / duration;
  if (clip.loop) {
    progress = progress % 1;
  } else {
    progress = Math.max(0, Math.min(1, progress));
  }

  const pose = sampleKeyframes(clip, progress);
  return applyProfile(pose, profile, state, context);
}

export function blendPose(currentPose, targetPose, alpha) {
  const blended = {};

  for (const key of POSE_KEYS) {
    const current = currentPose[key] ?? DEFAULT_POSE[key] ?? 0;
    const target = targetPose[key] ?? DEFAULT_POSE[key] ?? 0;
    blended[key] = current + (target - current) * alpha;
  }

  return blended;
}
