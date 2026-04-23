// Anchor defaults — kept in sync with each warrior's vector draw function
// (see src/art/warriorArt.js). armOffsetX/Y/Reach locate the sword hand so
// the weapon trail originates from the same point the blade is drawn from.
// renderedWeaponLength is the on-screen length of the drawn weapon, which
// the trail uses instead of the abstract profile weaponLength to avoid a
// second "ghost" weapon extending past the actual sprite.
const DEFAULT_ANCHORS = {
  armOffsetX: 10,
  armOffsetY: -6,
  armReach: 26,
  torsoOffsetY: -55,
};

// Trail style controls how the weapon smear is drawn:
//   'slash' — wide arcing sweep (long/curved blades)
//   'smash' — heavy weighted sweep with longer follow-through
//   'tight' — short, punchy arc (short blades like the gladius)
//   'thrust' — minimal sweep, motion blur along the blade (spear/rapier)
//   'stock' — short offset smear for buttstock/unconventional melee
//   'none'  — disables the trail entirely
const DEFAULT_TRAIL = {
  style: 'slash',
  sweep: 0.45,
  lengthScale: 1,
  widthScale: 1,
  alphaScale: 1,
  renderedWeaponLength: 50,
};

const DEFAULT_PROFILE = {
  renderScale: 1,
  renderOffsetX: 0,
  renderOffsetY: 0,
  clipSpeed: {
    idle: 1,
    walk: 1,
    air: 1,
    crouch: 1,
    lightAttack: 1,
    heavyAttack: 1,
    special: 1,
    block: 1,
    hit: 1,
    victory: 1,
    defeated: 1,
  },
  poseBias: {
    headY: 0,
    torsoAngle: 0,
    armAngle: 0,
    weaponAngle: 0,
    legSpread: 0,
    crouchFactor: 0,
    bodyY: 0,
  },
  motion: {
    idleBreath: 1,
    walkBounce: 1,
    walkStride: 1,
    attackLean: 1,
    recoveryBounce: 1,
    crouchDepth: 1,
    airTuck: 1,
  },
  fx: {
    trailColor: 0xffffff,
    dustColor: 0xd8c29d,
    specialGlow: 0xffd700,
  },
  anchors: DEFAULT_ANCHORS,
  trail: DEFAULT_TRAIL,
  // weaponLength/weaponWidth are abstract reach values used as fallbacks and
  // for non-trail systems (e.g. attack hitboxes tuned per fighter). The
  // authoritative on-screen weapon length for the trail is
  // `trail.renderedWeaponLength`, which must match the draw function.
  weaponLength: 62,
  weaponWidth: 12,
};

function createProfile(overrides = {}) {
  return {
    ...DEFAULT_PROFILE,
    ...overrides,
    clipSpeed: { ...DEFAULT_PROFILE.clipSpeed, ...overrides.clipSpeed },
    poseBias: { ...DEFAULT_PROFILE.poseBias, ...overrides.poseBias },
    motion: { ...DEFAULT_PROFILE.motion, ...overrides.motion },
    fx: { ...DEFAULT_PROFILE.fx, ...overrides.fx },
    anchors: { ...DEFAULT_ANCHORS, ...overrides.anchors },
    trail: { ...DEFAULT_TRAIL, ...overrides.trail },
  };
}

export const FIGHTER_PROFILES = {
  knight: createProfile({
    renderScale: 1.04,
    clipSpeed: { walk: 0.92, heavyAttack: 0.92, special: 0.95 },
    poseBias: { torsoAngle: -2, weaponAngle: 10, legSpread: -1 },
    motion: { idleBreath: 0.8, walkBounce: 0.8, walkStride: 0.85, attackLean: 1.15 },
    fx: { trailColor: 0xd9ecff, specialGlow: 0xffd700 },
    anchors: { armOffsetX: 12, armOffsetY: -8, armReach: 28 },
    trail: { style: 'slash', sweep: 0.55, lengthScale: 1, widthScale: 1.05, renderedWeaponLength: 55 },
    weaponLength: 76,
    weaponWidth: 10,
  }),
  samurai: createProfile({
    renderScale: 1,
    clipSpeed: { walk: 1.08, lightAttack: 1.1, special: 1.12 },
    poseBias: { headY: -2, armAngle: -3, weaponAngle: -6 },
    motion: { idleBreath: 0.9, walkBounce: 0.95, walkStride: 1.05, attackLean: 0.95 },
    fx: { trailColor: 0xffe8ef, dustColor: 0xf1d7d7, specialGlow: 0xff6d6d },
    anchors: { armOffsetX: 10, armOffsetY: -6, armReach: 26 },
    trail: { style: 'slash', sweep: 0.42, lengthScale: 1, widthScale: 0.95, renderedWeaponLength: 50 },
    weaponLength: 82,
    weaponWidth: 8,
  }),
  viking: createProfile({
    renderScale: 1.06,
    clipSpeed: { walk: 0.95, heavyAttack: 0.88, special: 0.9 },
    poseBias: { headY: 1, torsoAngle: 2, armAngle: 4, legSpread: 2 },
    motion: { idleBreath: 0.75, walkBounce: 1.1, walkStride: 0.95, attackLean: 1.2 },
    fx: { trailColor: 0xbdefff, dustColor: 0xbcb7ac, specialGlow: 0x7ad7ff },
    anchors: { armOffsetX: 12, armOffsetY: -6, armReach: 26 },
    trail: { style: 'smash', sweep: 0.75, lengthScale: 1.1, widthScale: 1.2, renderedWeaponLength: 48 },
    weaponLength: 74,
    weaponWidth: 14,
  }),
  gladiator: createProfile({
    renderScale: 1.01,
    poseBias: { torsoAngle: 1, armAngle: -1 },
    motion: { walkBounce: 1.05, walkStride: 1, attackLean: 1.05 },
    fx: { trailColor: 0xffd6b2, dustColor: 0xe0c38f, specialGlow: 0xff8b57 },
    // Gladiator canary fix: short gladius needs a compact punchy smear.
    // The drawn gladius is only 35px and sits at armReach 26 with armY -4,
    // so the trail must match those values to avoid a second ghost sword.
    anchors: { armOffsetX: 10, armOffsetY: -4, armReach: 26 },
    trail: { style: 'tight', sweep: 0.2, lengthScale: 0.95, widthScale: 0.7, alphaScale: 0.75, renderedWeaponLength: 35 },
    weaponLength: 60,
    weaponWidth: 13,
  }),
  mongol: createProfile({
    renderScale: 0.98,
    clipSpeed: { walk: 1.1, lightAttack: 1.05, special: 1.08 },
    poseBias: { headY: -1, weaponAngle: -8, legSpread: 1 },
    motion: { walkBounce: 0.95, walkStride: 1.1, attackLean: 0.9 },
    fx: { trailColor: 0xffd7a0, dustColor: 0xdcc497, specialGlow: 0xffa640 },
    anchors: { armOffsetX: 10, armOffsetY: -4, armReach: 24 },
    trail: { style: 'slash', sweep: 0.55, lengthScale: 1.05, widthScale: 1, renderedWeaponLength: 45 },
    weaponLength: 70,
    weaponWidth: 10,
  }),
  spartan: createProfile({
    renderScale: 1.03,
    clipSpeed: { walk: 0.94, heavyAttack: 0.95 },
    poseBias: { torsoAngle: -1, armAngle: 3, legSpread: -1 },
    motion: { walkBounce: 0.85, walkStride: 0.9, attackLean: 1.15 },
    fx: { trailColor: 0xfff2c2, dustColor: 0xd6bc8f, specialGlow: 0xffd700 },
    anchors: { armOffsetX: 10, armOffsetY: -4, armReach: 26 },
    trail: { style: 'tight', sweep: 0.28, lengthScale: 0.95, widthScale: 0.85, alphaScale: 0.85, renderedWeaponLength: 35 },
    weaponLength: 58,
    weaponWidth: 12,
  }),
  pirate: createProfile({
    renderScale: 0.99,
    clipSpeed: { walk: 1.02, lightAttack: 1.08 },
    poseBias: { torsoAngle: 2, armAngle: -4, weaponAngle: 4 },
    motion: { idleBreath: 1.1, walkBounce: 0.95, walkStride: 1.03, attackLean: 1.05 },
    fx: { trailColor: 0xffe29f, dustColor: 0xc9b08f, specialGlow: 0xffd061 },
    anchors: { armOffsetX: 10, armOffsetY: -4, armReach: 24 },
    trail: { style: 'slash', sweep: 0.5, lengthScale: 1, widthScale: 1, renderedWeaponLength: 40 },
    weaponLength: 68,
    weaponWidth: 11,
  }),
  zulu: createProfile({
    renderScale: 1,
    clipSpeed: { walk: 1.08, lightAttack: 1.06, special: 1.1 },
    poseBias: { headY: -2, weaponAngle: -12, legSpread: 3 },
    motion: { walkBounce: 1.05, walkStride: 1.1, attackLean: 1.1 },
    fx: { trailColor: 0xffc794, dustColor: 0xd7aa74, specialGlow: 0xff6b3d },
    anchors: { armOffsetX: 10, armOffsetY: -4, armReach: 26 },
    // Iklwa is a short stabbing spear: thrust-led motion with negligible lateral sweep.
    trail: { style: 'thrust', sweep: 0.12, lengthScale: 1.1, widthScale: 0.9, alphaScale: 0.9, renderedWeaponLength: 55 },
    weaponLength: 76,
    weaponWidth: 9,
  }),
  conquistador: createProfile({
    renderScale: 1,
    clipSpeed: { walk: 1, lightAttack: 1.04, heavyAttack: 0.96 },
    poseBias: { torsoAngle: -1, weaponAngle: -4 },
    motion: { walkBounce: 0.9, walkStride: 1.02, attackLean: 0.98 },
    fx: { trailColor: 0xf6f6ff, dustColor: 0xd4c1a3, specialGlow: 0xffd88c },
    anchors: { armOffsetX: 10, armOffsetY: -4, armReach: 24 },
    trail: { style: 'thrust', sweep: 0.18, lengthScale: 1.05, widthScale: 0.8, renderedWeaponLength: 52 },
    weaponLength: 86,
    weaponWidth: 8,
  }),
  seal: createProfile({
    renderScale: 1.02,
    clipSpeed: { walk: 1.06, heavyAttack: 1.02, special: 1.04 },
    poseBias: { headY: 1, torsoAngle: 1, armAngle: -6, weaponAngle: -10 },
    motion: { idleBreath: 0.7, walkBounce: 0.75, walkStride: 0.92, attackLean: 1.08 },
    fx: { trailColor: 0xff7373, dustColor: 0xb4b6b9, specialGlow: 0xff3d3d },
    anchors: { armOffsetX: 10, armOffsetY: -4, armReach: 26 },
    // Rifle-as-melee reads best with a short, blunt, stock-led smear rather
    // than a sword slash; sweep is narrow and the trail is anchored along the
    // weapon's forward axis.
    trail: { style: 'stock', sweep: 0.3, lengthScale: 0.85, widthScale: 1.1, alphaScale: 0.8, renderedWeaponLength: 55 },
    weaponLength: 84,
    weaponWidth: 10,
  }),
};

export function getFighterProfile(warriorId) {
  return FIGHTER_PROFILES[warriorId] || DEFAULT_PROFILE;
}
