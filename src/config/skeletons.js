// Skeleton configurations for the bone animation system
// Each bone: length (px), zOrder (draw order)
// rotationOffset: degrees to correct the AI-generated image orientation
//   (e.g., if the AI drew a sword horizontally, set rotationOffset: -90 to make it vertical)
//   0 = image is already vertical with joint/connection point at top

export const DEFAULT_SKELETON = {
  root: { x: 0, y: -55 },
  // Per-part rotation offsets to correct AI image orientation (degrees)
  // Adjust these after looking at each generated image
  rotationOffsets: {
    head: 0,
    torso: 0,
    upper_arm: 0,
    lower_arm: 0,
    upper_leg: 0,
    lower_leg: 0,
    weapon: 0,
  },
  // If the raw AI asset naturally faces left, mark it true here so we correctly flip it dynamically.
  facesLeft: {
    head: false,
    torso: false,
    upper_arm: false,
    lower_arm: false,
    upper_leg: false,
    lower_leg: false,
    weapon: false,
  }
};

function withOverrides(overrides = {}) {
  return {
    root: { ...DEFAULT_SKELETON.root, ...overrides.root },
    rotationOffsets: { ...DEFAULT_SKELETON.rotationOffsets, ...overrides.rotationOffsets },
    facesLeft: { ...DEFAULT_SKELETON.facesLeft, ...overrides.facesLeft },
  };
}

// Per-warrior configs — adjust rotationOffsets after generating art
// Look at each PNG: if the part isn't vertical with connection point at top,
// set the offset to rotate it into that orientation.
// Positive = clockwise, negative = counter-clockwise
export const SKELETON_CONFIGS = {
  knight: withOverrides({
    facesLeft: {
      head: false,
      torso: false,
      upper_arm: false,
      lower_arm: false,
      upper_leg: false,
      lower_leg: false,
      weapon: false,
    }
  }),
  samurai: withOverrides(),
  viking: withOverrides(),
  gladiator: withOverrides(),
  mongol: withOverrides(),
  spartan: withOverrides(),
  pirate: withOverrides(),
  zulu: withOverrides(),
  conquistador: withOverrides(),
  seal: withOverrides(),
};

export function getSkeletonConfig(warriorId) {
  return SKELETON_CONFIGS[warriorId] || withOverrides();
}
