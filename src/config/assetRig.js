// Landmarks are normalized source-image coordinates, measured on the shipped
// PNGs. They survive BootScene resampling. A bone runs from start to end;
// cropTop hides the drawing's assembly tab, not part of the anatomy.
const part = (start, end, cropTop = 0) => ({ start, end, cropTop });
const COMMON = {
  torso: part([0.5, 0.79], [0.5, 0.18], 0.09),
  upper_arm: part([0.5, 0.17], [0.5, 0.88], 0.08),
  lower_arm: part([0.45, 0.13], [0.52, 0.87], 0.06),
  upper_leg: part([0.48, 0.14], [0.5, 0.88], 0.08),
  lower_leg: part([0.38, 0.13], [0.43, 0.86], 0.07),
  weapon: part([0.5, 0.17], [0.5, 0.99]),
};

// Headgear is anchored at the neck (closed helmets) or brow (open hats).
// Height includes plumes/flaps; those ornaments must not determine face size.
const HEADS = {
  knight: { origin: [0.5, 0.86], height: 29 },
  samurai: { origin: [0.55, 0.84], height: 32, cropTop: 0.15 },
  viking: { origin: [0.54, 0.85], height: 29, cropTop: 0.16, face: true },
  gladiator: { origin: [0.58, 0.84], height: 35 },
  mongol: { origin: [0.5, 0.51], height: 32, cropTop: 0.09, face: true, brow: true },
  spartan: { origin: [0.58, 0.7], height: 37, cropTop: 0.07 },
  pirate: { origin: [0.55, 0.45], height: 29, cropTop: 0.11, face: true, brow: true },
  zulu: { origin: [0.5, 0.76], height: 38, face: true, brow: true },
  conquistador: { origin: [0.52, 0.66], height: 28, cropTop: 0.15, face: true, brow: true },
  seal: { origin: [0.57, 0.91], height: 28, cropTop: 0.27 },
};
const OVERRIDES = {
  knight: { upper_arm: part([0.5, 0.13], [0.49, 0.86]), lower_arm: part([0.43, 0.12], [0.53, 0.85]), lower_leg: part([0.27, 0.13], [0.36, 0.86], 0.07) },
  samurai: { torso: part([0.5, 0.68], [0.5, 0.16], 0.1), upper_leg: part([0.3, 0.12], [0.47, 0.87]), weapon: part([0.27, 0.14], [0.77, 0.99]) },
  viking: { torso: part([0.5, 0.69], [0.5, 0.14], 0.08), lower_arm: part([0.26, 0.13], [0.67, 0.85]), weapon: part([0.3, 0.73], [0.3, 0.07]) },
  gladiator: { torso: part([0.5, 0.79], [0.44, 0.22], 0.14), upper_arm: part([0.59, 0.13], [0.53, 0.89]), lower_leg: part([0.27, 0.13], [0.4, 0.86]) },
  mongol: { torso: part([0.5, 0.59], [0.5, 0.19], 0.12), upper_arm: part([0.48, 0.22], [0.72, 0.87], 0.12), lower_leg: part([0.3, 0.14], [0.48, 0.86], 0.09), weapon: part([0.24, 0.13], [0.82, 0.99]) },
  spartan: { torso: part([0.5, 0.63], [0.5, 0.13], 0.08), lower_leg: part([0.3, 0.1], [0.37, 0.86]) },
  pirate: { torso: part([0.5, 0.65], [0.48, 0.21], 0.12), upper_arm: part([0.43, 0.13], [0.76, 0.88]), lower_arm: part([0.42, 0.13], [0.52, 0.88]), lower_leg: part([0.25, 0.12], [0.4, 0.86]), weapon: part([0.39, 0.23], [0.88, 0.99], 0.07) },
  zulu: { torso: part([0.5, 0.79], [0.49, 0.23], 0.15), upper_arm: part([0.5, 0.24], [0.57, 0.88], 0.15), lower_leg: part([0.29, 0.12], [0.35, 0.85]), weapon: part([0.5, 0.35], [0.5, 0.99], 0.05) },
  conquistador: { torso: part([0.5, 0.79], [0.48, 0.19], 0.12), upper_arm: part([0.42, 0.17], [0.52, 0.91]), lower_arm: part([0.5, 0.12], [0.49, 0.88], 0.08), lower_leg: part([0.31, 0.12], [0.4, 0.86], 0.07), weapon: part([0.53, 0.12], [0.4, 0.99]) },
  seal: { upper_arm: part([0.44, 0.16], [0.7, 0.85]), weapon: part([0.53, 0.35], [0.7, 0.99]) },
};

export function getAssetRig(id) {
  return { ...COMMON, ...OVERRIDES[id], head: HEADS[id] || HEADS.knight };
}
