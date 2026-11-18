// Keyframed pose clips for the bone rig.
//
// Pose space (rig units, +x = the way the fighter faces, +y = down):
//   torsoAngle   degrees the spine leans forward (+) or back (-)
//   hipX/hipDrop pelvis shift; the feet stay planted, so this is weight
//   handX/handY  offset of the weapon hand from its chest-height guard
//   weaponAngle  0 = tip up, 90 = tip forward, 180 = tip down, <0 = tip back
//   headTilt     extra head rotation on top of the spine's
// Each keyframe may name the easing used to ARRIVE at it: 'snap' for a
// strike, 'out' for a wind-up that settles, default sine in-out.
const DEFAULT_POSE = {
  walkBlend: 0,
  handLift: 0,
  handX: 0,
  handY: 0,
  hipX: 0,
  hipDrop: 0,
  headTilt: 0,
  frontFootX: 0,
  frontFootY: 0,
  backFootX: 0,
  backFootY: 0,
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

// The stance every attack starts from and returns to.
const GUARD = { torsoAngle: 2, armAngle: 0, handX: -2, handY: -4, weaponAngle: 22, legSpread: 19, crouchFactor: 0.08 };
const k = (t, values, ease) => ({ t, values: { ...GUARD, ...values }, ease });

const CLIPS = {
  idle: {
    loop: true,
    duration: 1500,
    keyframes: [
      { t: 0, values: { headY: -1, torsoAngle: 1, armAngle: 6, handY: -3, weaponAngle: 20, legSpread: 19, crouchFactor: 0.08, bodyY: 0, hipX: 0 } },
      { t: 0.25, values: { headY: 1, torsoAngle: 3, armAngle: 9, handY: -1, weaponAngle: 27, legSpread: 20, crouchFactor: 0.11, bodyY: 1.5, hipX: 1.5 } },
      { t: 0.5, values: { headY: 0.5, torsoAngle: 4, armAngle: 11, handY: 0, weaponAngle: 29, legSpread: 20, crouchFactor: 0.1, bodyY: 0.5, hipX: 2 } },
      { t: 0.75, values: { headY: -1.5, torsoAngle: 2, armAngle: 7, handY: -3, weaponAngle: 22, legSpread: 19, crouchFactor: 0.07, bodyY: -1, hipX: 0.5 } },
      { t: 1, values: { headY: -1, torsoAngle: 1, armAngle: 6, handY: -3, weaponAngle: 20, legSpread: 19, crouchFactor: 0.08, bodyY: 0, hipX: 0 } },
    ],
  },
  walk: {
    loop: true,
    duration: 760,
    keyframes: [
      { t: 0, values: { headY: -1, torsoAngle: 3, armAngle: 2, weaponAngle: 16, legSpread: 30, bodyY: 3, crouchFactor: 0.06 } },
      { t: 0.2, values: { headY: 1, torsoAngle: 5, armAngle: 8, weaponAngle: 22, legSpread: 10, bodyY: -1, crouchFactor: 0.06 } },
      { t: 0.5, values: { headY: -2, torsoAngle: 7, armAngle: 12, weaponAngle: 28, legSpread: 28, bodyY: 2, crouchFactor: 0.06 } },
      { t: 0.7, values: { headY: 1.5, torsoAngle: 4, armAngle: 6, weaponAngle: 20, legSpread: 12, bodyY: -1.5, crouchFactor: 0.06 } },
      { t: 1, values: { headY: -1, torsoAngle: 3, armAngle: 2, weaponAngle: 16, legSpread: 30, bodyY: 3, crouchFactor: 0.06 } },
    ],
  },
  air: {
    loop: true,
    duration: 800,
    keyframes: [
      { t: 0, values: { headY: -7, torsoAngle: -8, armAngle: -30, handY: -10, weaponAngle: -30, legSpread: 20, bodyY: -6 } },
      { t: 0.5, values: { headY: -5, torsoAngle: 5, armAngle: -8, handY: -6, weaponAngle: -8, legSpread: 25, bodyY: -3 } },
      { t: 1, values: { headY: -7, torsoAngle: -8, armAngle: -30, handY: -10, weaponAngle: -30, legSpread: 20, bodyY: -6 } },
    ],
  },
  crouch: {
    loop: true,
    duration: 1200,
    keyframes: [
      { t: 0, values: { headY: 18, torsoAngle: 14, armAngle: 18, weaponAngle: 30, legSpread: 24, crouchFactor: 0.62, bodyY: 2 } },
      { t: 0.5, values: { headY: 19.5, torsoAngle: 16, armAngle: 20, weaponAngle: 36, legSpread: 26, crouchFactor: 0.68, bodyY: 0 } },
      { t: 1, values: { headY: 18, torsoAngle: 14, armAngle: 18, weaponAngle: 30, legSpread: 24, crouchFactor: 0.62, bodyY: 2 } },
    ],
  },

  // --- Cutting weapons -----------------------------------------------------
  // Forehand diagonal cut.
  light1: {
    duration: 270,
    keyframes: [
      k(0, {}),
      k(0.26, { torsoAngle: -14, hipX: -5, handX: -27, handY: -31, weaponAngle: -64, headY: -1 }, 'out'),
      k(0.46, { torsoAngle: 14, hipX: 9, handX: 14, handY: 2, weaponAngle: 104, legSpread: 26, frontFootX: 8, trailAlpha: 0.95, trailWidth: 18 }, 'snap'),
      k(0.66, { torsoAngle: 17, hipX: 10, handX: 10, handY: 11, weaponAngle: 124, legSpread: 26, frontFootX: 8, trailAlpha: 0.35, trailWidth: 10 }),
      k(1, {}),
    ],
  },
  // Rising backhand.
  light2: {
    duration: 270,
    keyframes: [
      k(0, { torsoAngle: 10, handX: 4, handY: 14, weaponAngle: 140 }),
      k(0.24, { torsoAngle: 12, hipX: 2, handX: -17, handY: 24, weaponAngle: 198, crouchFactor: 0.2 }, 'out'),
      k(0.46, { torsoAngle: 6, hipX: 11, handX: 9, handY: -24, weaponAngle: 30, legSpread: 27, frontFootX: 9, trailAlpha: 0.95, trailWidth: 18 }, 'snap'),
      k(0.66, { torsoAngle: 2, hipX: 10, handX: 2, handY: -31, weaponAngle: -8, legSpread: 27, frontFootX: 9, trailAlpha: 0.35, trailWidth: 10 }),
      k(1, {}),
    ],
  },
  // Stepping overhead finisher.
  light3: {
    duration: 380,
    keyframes: [
      k(0, { handY: -20, weaponAngle: 0 }),
      k(0.3, { torsoAngle: -20, hipX: -8, handX: -30, handY: -37, weaponAngle: -114, bodyY: -4, legSpread: 16, crouchFactor: 0 }, 'out'),
      k(0.5, { torsoAngle: 26, hipX: 16, handX: 14, handY: 2, weaponAngle: 110, legSpread: 34, frontFootX: 12, crouchFactor: 0.24, trailAlpha: 1, trailWidth: 22 }, 'snap'),
      k(0.72, { torsoAngle: 28, hipX: 16, handX: 11, handY: 10, weaponAngle: 128, legSpread: 34, frontFootX: 12, crouchFactor: 0.28, trailAlpha: 0.45, trailWidth: 12 }),
      k(1, {}),
    ],
  },
  // Committed cleave: a long coil, then everything goes into the blade.
  heavy: {
    duration: 540,
    keyframes: [
      k(0, {}),
      k(0.16, { torsoAngle: -10, hipX: -6, handX: -20, handY: -18, weaponAngle: -40 }, 'out'),
      k(0.4, { torsoAngle: -26, hipX: -12, handX: -34, handY: -30, weaponAngle: -130, crouchFactor: 0.18, legSpread: 21, backFootX: -4, headY: -2 }, 'out'),
      k(0.56, { torsoAngle: 30, hipX: 18, handX: 16, handY: 2, weaponAngle: 112, crouchFactor: 0.28, legSpread: 36, frontFootX: 14, trailAlpha: 1, trailWidth: 26 }, 'snap'),
      k(0.76, { torsoAngle: 32, hipX: 18, handX: 11, handY: 9, weaponAngle: 128, crouchFactor: 0.32, legSpread: 36, frontFootX: 14, trailAlpha: 0.5, trailWidth: 14 }),
      k(1, {}),
    ],
  },

  // --- Thrusting weapons ---------------------------------------------------
  thrust1: {
    duration: 260,
    keyframes: [
      k(0, {}),
      k(0.28, { torsoAngle: -8, hipX: -6, handX: -24, handY: 3, weaponAngle: 86, legSpread: 16 }, 'out'),
      k(0.46, { torsoAngle: 12, hipX: 12, handX: 17, handY: -1, weaponAngle: 90, legSpread: 30, frontFootX: 10, trailAlpha: 0.9, trailWidth: 12 }, 'snap'),
      k(0.64, { torsoAngle: 12, hipX: 12, handX: 16, handY: -1, weaponAngle: 91, legSpread: 30, frontFootX: 10, trailAlpha: 0.3, trailWidth: 8 }),
      k(1, {}),
    ],
  },
  thrust2: {
    duration: 260,
    keyframes: [
      k(0, { torsoAngle: 6, handX: 4, handY: -2, weaponAngle: 90 }),
      k(0.26, { torsoAngle: -6, hipX: -4, handX: -22, handY: -17, weaponAngle: 104, legSpread: 17 }, 'out'),
      k(0.46, { torsoAngle: 14, hipX: 13, handX: 15, handY: -9, weaponAngle: 98, legSpread: 30, frontFootX: 10, trailAlpha: 0.9, trailWidth: 12 }, 'snap'),
      k(0.64, { torsoAngle: 14, hipX: 13, handX: 14, handY: -8, weaponAngle: 99, legSpread: 30, frontFootX: 10, trailAlpha: 0.3, trailWidth: 8 }),
      k(1, {}),
    ],
  },
  // Full-extension lunge; also the thrusters' heavy.
  lunge: {
    duration: 520,
    keyframes: [
      k(0, {}),
      k(0.34, { torsoAngle: -16, hipX: -12, handX: -27, handY: 6, weaponAngle: 84, crouchFactor: 0.22, legSpread: 18, backFootX: -3 }, 'out'),
      k(0.5, { torsoAngle: 24, hipX: 20, handX: 17, handY: 0, weaponAngle: 90, crouchFactor: 0.3, legSpread: 38, frontFootX: 16, trailAlpha: 1, trailWidth: 16 }, 'snap'),
      k(0.76, { torsoAngle: 24, hipX: 20, handX: 16, handY: 1, weaponAngle: 91, crouchFactor: 0.3, legSpread: 38, frontFootX: 16, trailAlpha: 0.4, trailWidth: 10 }),
      k(1, {}),
    ],
  },

  airAttack: {
    duration: 340,
    keyframes: [
      k(0, { handY: -16, weaponAngle: -10, crouchFactor: 0 }),
      k(0.26, { torsoAngle: -12, handX: -26, handY: -34, weaponAngle: -100, crouchFactor: 0, frontFootY: -10, backFootY: -16 }, 'out'),
      k(0.48, { torsoAngle: 22, handX: 14, handY: 12, weaponAngle: 132, crouchFactor: 0, frontFootY: -14, backFootY: -6, trailAlpha: 1, trailWidth: 20 }, 'snap'),
      k(0.8, { torsoAngle: 24, handX: 8, handY: 22, weaponAngle: 158, crouchFactor: 0, frontFootY: -8, backFootY: -6, trailAlpha: 0.4, trailWidth: 12 }),
      k(1, { crouchFactor: 0 }),
    ],
  },
  // Charge, then a dash-through cut.
  special: {
    duration: 760,
    keyframes: [
      k(0, { glow: 0.2 }),
      k(0.26, { torsoAngle: -24, hipX: -14, crouchFactor: 0.32, handX: -32, handY: -12, weaponAngle: -104, legSpread: 24, glow: 1 }, 'out'),
      k(0.4, { torsoAngle: -27, hipX: -15, crouchFactor: 0.36, handX: -33, handY: -14, weaponAngle: -112, legSpread: 24, glow: 1 }),
      k(0.54, { torsoAngle: 34, hipX: 20, crouchFactor: 0.3, handX: 16, handY: 0, weaponAngle: 108, legSpread: 38, frontFootX: 16, trailAlpha: 1, trailWidth: 30, glow: 1 }, 'snap'),
      k(0.78, { torsoAngle: 34, hipX: 20, crouchFactor: 0.34, handX: 11, handY: 8, weaponAngle: 128, legSpread: 38, frontFootX: 16, trailAlpha: 0.55, trailWidth: 18, glow: 0.6 }),
      k(1, { glow: 0 }),
    ],
  },
  specialThrust: {
    duration: 760,
    keyframes: [
      k(0, { glow: 0.2 }),
      k(0.26, { torsoAngle: -18, hipX: -14, crouchFactor: 0.3, handX: -28, handY: 4, weaponAngle: 82, legSpread: 22, glow: 1 }, 'out'),
      k(0.4, { torsoAngle: -20, hipX: -15, crouchFactor: 0.34, handX: -29, handY: 5, weaponAngle: 82, legSpread: 22, glow: 1 }),
      k(0.54, { torsoAngle: 28, hipX: 22, crouchFactor: 0.32, handX: 17, handY: 0, weaponAngle: 90, legSpread: 40, frontFootX: 18, trailAlpha: 1, trailWidth: 20, glow: 1 }, 'snap'),
      k(0.78, { torsoAngle: 28, hipX: 22, crouchFactor: 0.32, handX: 16, handY: 1, weaponAngle: 91, legSpread: 40, frontFootX: 18, trailAlpha: 0.5, trailWidth: 12, glow: 0.6 }),
      k(1, { glow: 0 }),
    ],
  },

  block: {
    loop: true,
    duration: 1000,
    keyframes: [
      { t: 0, values: { torsoAngle: -7, armAngle: 0, handX: -6, handY: -17, weaponAngle: -24, legSpread: 21, crouchFactor: 0.16, hipX: -3 } },
      { t: 0.5, values: { torsoAngle: -6, armAngle: 0, handX: -5, handY: -16, weaponAngle: -20, legSpread: 21, crouchFactor: 0.18, hipX: -3 } },
      { t: 1, values: { torsoAngle: -7, armAngle: 0, handX: -6, handY: -17, weaponAngle: -24, legSpread: 21, crouchFactor: 0.16, hipX: -3 } },
    ],
  },
  // Head snaps back off a cut.
  hit: {
    duration: 300,
    keyframes: [
      { t: 0, values: { torsoAngle: -20, hipX: -6, headY: 3, headTilt: -24, armAngle: 0, handX: -10, handY: 10, weaponAngle: 62, legSpread: 13 } },
      { t: 0.3, values: { torsoAngle: -25, hipX: -9, headY: 4, headTilt: -30, armAngle: 0, handX: -13, handY: 13, weaponAngle: 70, legSpread: 11 } },
      { t: 1, values: { ...GUARD, torsoAngle: -4 } },
    ],
  },
  // Folded over a heavy blow.
  hitHeavy: {
    duration: 420,
    keyframes: [
      { t: 0, values: { torsoAngle: 26, hipX: -10, headY: 8, headTilt: 22, armAngle: 0, handX: -8, handY: 18, weaponAngle: 120, legSpread: 12, crouchFactor: 0.26 } },
      { t: 0.35, values: { torsoAngle: 34, hipX: -13, headY: 10, headTilt: 28, armAngle: 0, handX: -10, handY: 21, weaponAngle: 132, legSpread: 12, crouchFactor: 0.32 } },
      { t: 1, values: { ...GUARD, torsoAngle: 6 } },
    ],
  },
  // Guard broken or parried: weapon arm thrown wide, reeling.
  stunned: {
    loop: true,
    duration: 700,
    keyframes: [
      { t: 0, values: { torsoAngle: -18, hipX: -6, headTilt: -16, armAngle: 0, handX: -22, handY: -22, weaponAngle: -70, legSpread: 17, crouchFactor: 0.14 } },
      { t: 0.5, values: { torsoAngle: -12, hipX: -3, headTilt: 8, armAngle: 0, handX: -18, handY: -14, weaponAngle: -50, legSpread: 19, crouchFactor: 0.2 } },
      { t: 1, values: { torsoAngle: -18, hipX: -6, headTilt: -16, armAngle: 0, handX: -22, handY: -22, weaponAngle: -70, legSpread: 17, crouchFactor: 0.14 } },
    ],
  },
  // Thrown onto the back; holds the last frame (knockdown and defeat).
  fall: {
    duration: 620,
    keyframes: [
      { t: 0, values: { torsoAngle: -24, hipX: -6, headTilt: -22, armAngle: 0, handX: -12, handY: -6, weaponAngle: 40, legSpread: 14 } },
      { t: 0.4, values: { torsoAngle: -58, hipX: -10, hipDrop: 14, headTilt: -30, armAngle: 0, handX: -14, handY: -14, weaponAngle: 30, legSpread: 18, frontFootY: -12, backFootY: -6 }, ease: 'out' },
      { t: 0.75, values: { torsoAngle: -84, hipX: -12, hipDrop: 45, headTilt: -52, armAngle: 0, handX: -6, handY: 4, weaponAngle: 80, legSpread: 24, frontFootX: 10, backFootX: 22 } },
      { t: 0.86, values: { torsoAngle: -80, hipX: -12, hipDrop: 41, headTilt: -48, armAngle: 0, handX: -6, handY: 2, weaponAngle: 84, legSpread: 24, frontFootX: 10, backFootX: 22 }, ease: 'out' },
      { t: 1, values: { torsoAngle: -85, hipX: -12, hipDrop: 46, headTilt: -55, armAngle: 0, handX: -4, handY: 7, weaponAngle: 90, legSpread: 24, frontFootX: 10, backFootX: 22 } },
    ],
  },
  getup: {
    duration: 420,
    keyframes: [
      { t: 0, values: { torsoAngle: -85, hipX: -12, hipDrop: 46, headTilt: -55, armAngle: 0, handX: -4, handY: 7, weaponAngle: 90, legSpread: 24, frontFootX: 10, backFootX: 22 } },
      { t: 0.45, values: { torsoAngle: 24, hipX: -4, hipDrop: 22, headTilt: 10, armAngle: 0, handX: 4, handY: 14, weaponAngle: 120, legSpread: 24, crouchFactor: 0.4 }, ease: 'out' },
      { t: 1, values: { ...GUARD } },
    ],
  },
  dash: {
    duration: 240,
    keyframes: [
      { t: 0, values: { torsoAngle: 20, hipX: 10, crouchFactor: 0.24, legSpread: 34, frontFootX: 10, backFootX: -10, backFootY: -5, armAngle: 0, handX: -12, handY: 8, weaponAngle: 64 } },
      { t: 0.6, values: { torsoAngle: 24, hipX: 12, crouchFactor: 0.28, legSpread: 36, frontFootX: 12, backFootX: -12, backFootY: -2, armAngle: 0, handX: -14, handY: 9, weaponAngle: 60 } },
      { t: 1, values: { ...GUARD, torsoAngle: 8 } },
    ],
  },
  backdash: {
    duration: 260,
    keyframes: [
      { t: 0, values: { torsoAngle: -12, hipX: -9, crouchFactor: 0.16, legSpread: 28, frontFootY: -6, armAngle: 0, handX: -2, handY: -12, weaponAngle: 6 } },
      { t: 0.6, values: { torsoAngle: -9, hipX: -8, crouchFactor: 0.2, legSpread: 30, frontFootY: -2, armAngle: 0, handX: -2, handY: -11, weaponAngle: 10 } },
      { t: 1, values: { ...GUARD, torsoAngle: -2 } },
    ],
  },
  victory: {
    loop: true,
    duration: 1700,
    keyframes: [
      { t: 0, values: { headY: -4, torsoAngle: -8, armAngle: -20, handLift: 30, weaponAngle: -18, legSpread: 16, bodyY: 0, glow: 0.1 } },
      { t: 0.3, values: { headY: -11, torsoAngle: -2, armAngle: -12, handLift: 42, weaponAngle: -8, legSpread: 20, bodyY: -8, glow: 0.45 } },
      { t: 0.6, values: { headY: -8, torsoAngle: 4, armAngle: 8, handLift: 32, weaponAngle: 12, legSpread: 22, bodyY: 2, glow: 0.25 } },
      { t: 1, values: { headY: -4, torsoAngle: -8, armAngle: -20, handLift: 30, weaponAngle: -18, legSpread: 16, bodyY: 0, glow: 0.1 } },
    ],
  },
};

// Fighter state (or legacy state name) -> clip.
const STATE_TO_CLIP = {
  idle: 'idle',
  walking: 'walk',
  jumping: 'air',
  crouching: 'crouch',
  lightAttack: 'light1',
  heavyAttack: 'heavy',
  blocking: 'block',
  defeated: 'fall',
  knockdown: 'fall',
};

// Which profile.clipSpeed entry paces each clip.
const SPEED_GROUP = {
  walk: 'walk', air: 'air', crouch: 'crouch', idle: 'idle', block: 'block', victory: 'victory',
  light1: 'lightAttack', light2: 'lightAttack', light3: 'lightAttack',
  thrust1: 'lightAttack', thrust2: 'lightAttack', airAttack: 'lightAttack',
  heavy: 'heavyAttack', lunge: 'heavyAttack',
  special: 'special', specialThrust: 'special',
  hit: 'hit', hitHeavy: 'hit', fall: 'defeated',
};

const THRUST_VARIANTS = { light1: 'thrust1', light2: 'thrust2', light3: 'lunge', heavy: 'lunge', special: 'specialThrust' };
const ATTACK_CLIPS = new Set(['light1', 'light2', 'light3', 'heavy', 'thrust1', 'thrust2', 'lunge', 'airAttack', 'special', 'specialThrust']);

const EASES = {
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  out: t => 1 - (1 - t) * (1 - t),
  snap: t => 1 - (1 - t) ** 4,
  linear: t => t,
};

// Spears and rapiers stab where blades cut.
export function resolveClipName(stateOrClip, profile) {
  const name = STATE_TO_CLIP[stateOrClip] || (CLIPS[stateOrClip] ? stateOrClip : 'idle');
  const style = profile?.trail?.style;
  if ((style === 'thrust') && THRUST_VARIANTS[name]) return THRUST_VARIANTS[name];
  return name;
}

export function clipSpeedFor(clipName, profile) {
  return profile.clipSpeed[SPEED_GROUP[clipName]] || 1;
}

function sampleKeyframes(clip, progress) {
  const frames = clip.keyframes;

  for (let i = 0; i < frames.length - 1; i++) {
    const from = frames[i];
    const to = frames[i + 1];
    if (progress < from.t || progress > to.t) continue;

    const localT = to.t === from.t ? 0 : (progress - from.t) / (to.t - from.t);
    const eased = (EASES[to.ease] || EASES.sine)(localT);
    const pose = { ...DEFAULT_POSE };
    for (const key of POSE_KEYS) {
      const start = from.values?.[key] ?? DEFAULT_POSE[key] ?? 0;
      const end = to.values?.[key] ?? DEFAULT_POSE[key] ?? 0;
      pose[key] = start + (end - start) * eased;
    }
    return pose;
  }

  return { ...DEFAULT_POSE, ...(frames[frames.length - 1]?.values || {}) };
}

function applyProfile(pose, profile, clipName, context, progress) {
  const result = { ...pose };
  const bias = profile.poseBias;
  const motion = profile.motion;
  const attacking = ATTACK_CLIPS.has(clipName);

  result.headY += bias.headY;
  result.torsoAngle += bias.torsoAngle;
  result.legSpread += bias.legSpread;
  result.crouchFactor += bias.crouchFactor;
  result.bodyY += bias.bodyY;
  // Stance biases describe how a warrior carries the weapon at rest; a
  // strike has to land where the clip puts it.
  if (!attacking && clipName !== 'fall' && clipName !== 'getup') {
    result.armAngle += bias.armAngle;
    result.weaponAngle += bias.weaponAngle;
  }

  if (clipName === 'idle') {
    result.headY *= motion.idleBreath;
    result.bodyY *= motion.idleBreath;
  }

  if (clipName === 'walk') {
    const stride = Math.sin(progress * Math.PI * 2);
    result.frontFootX = stride * 12 * motion.walkStride;
    result.backFootX = -result.frontFootX;
    result.frontFootY = -Math.max(0, Math.cos(progress * Math.PI * 2)) * 7;
    result.backFootY = -Math.max(0, -Math.cos(progress * Math.PI * 2)) * 7;
    result.walkBlend = 1;
    result.bodyY *= motion.walkBounce;
    result.legSpread *= motion.walkStride;
    result.weaponAngle += (context.facingRight ? 1 : -1) * motion.walkStride * 2;
  }

  if (clipName === 'crouch') {
    result.crouchFactor *= motion.crouchDepth;
  }

  if (clipName === 'air') {
    result.frontFootY = -10 * motion.airTuck;
    result.backFootY = -16 * motion.airTuck;
    result.legSpread *= motion.airTuck;
    result.bodyY += Math.min(0, (context.verticalVelocity || 0) / 240);
  }

  if (attacking) {
    result.torsoAngle *= motion.attackLean;
    result.hipX *= motion.attackLean;
  }

  if (clipName === 'hit' || clipName === 'hitHeavy') {
    result.bodyY *= motion.recoveryBounce;
  }

  return result;
}

// Sample a clip at a normalised progress (0..1; loops wrap).
export function sampleClip(clipName, progress, profile, context = {}) {
  const clip = CLIPS[clipName] || CLIPS.idle;
  let p = clip.loop ? ((progress % 1) + 1) % 1 : Math.max(0, Math.min(1, progress));
  // Walking backwards plays the gait in reverse.
  if (clipName === 'walk' && context.reverse) p = (1 - p) % 1;
  return applyProfile(sampleKeyframes(clip, p), profile, clipName, context, p);
}

export function clipDuration(clipName, profile) {
  const clip = CLIPS[clipName] || CLIPS.idle;
  return clip.duration / clipSpeedFor(clipName, profile);
}

// State + elapsed time -> pose, each clip at its own authored pace.
export function sampleAnimationPose(state, elapsedMs, profile, context = {}) {
  const clipName = resolveClipName(state, profile);
  const duration = context.duration || clipDuration(clipName, profile);
  const progress = duration <= 0 ? 1 : elapsedMs / duration;
  return sampleClip(clipName, progress, profile, context);
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
