import { INK, darken, lighten, smooth, hard, stroke, disc } from './kit.js';

// Shared figure for every vector fighter: the outline of each body part and
// the frame it is drawn in. All warriors use the same frames, so they sit on
// HEROIC_RIG identically; a warrior only chooses what covers each form
// (skin, cloth, plate) and what is drawn on top.
//
// Coordinates are rig units, +x toward the way the fighter faces, +y down.
//   torso      hip joint at (0,0), neck base at (0,-40); chest faces +x
//   upper_arm  shoulder (0,0) to elbow (0,20)
//   lower_arm  elbow (0,0) to wrist (0,19); the fist hangs below to y=24
//   upper_leg  hip (0,0) to knee (0,30)
//   lower_leg  knee (0,0) to ankle (0,28)
//   foot       ankle (0,0); the ground is y=5; toes point +x
//   head       neck base (0,0); the skull rises to about y=-21
export const SHAPES = {
  torso: [
    [8, 2], [8.6, -8], [9.6, -17], [12.4, -26], [11.4, -33], [7, -37.6], [3.4, -41],
    [-3.4, -41.4], [-7.6, -38], [-11, -33.4], [-11.6, -24], [-9.2, -14], [-8.6, -6],
    [-9.6, 2], [-6, 6], [0, 7.4], [6, 6],
  ],
  upper_arm: [
    [-5, -3.6], [0, -6], [5.2, -3.6], [6.1, 4], [5.2, 10.5], [4.2, 19], [0, 22.4],
    [-3.8, 19.6], [-5.5, 10.5], [-6, 3],
  ],
  lower_arm: [
    [-4, -2.6], [0, -4], [4, -2.6], [4.7, 4], [3.5, 12.6], [3, 17.6], [-2.6, 17.6],
    [-3.4, 12], [-4.9, 4],
  ],
  fist: [[-3.5, 17.2], [0.4, 16.2], [3.9, 17.6], [4.4, 21], [2.2, 24], [-1.8, 24.2], [-3.9, 21.4]],
  upper_leg: [
    [-6, -3], [0, -5.2], [6.6, -2.2], [7.8, 9], [6.2, 20], [4.9, 28.6], [0, 32.6],
    [-4.3, 28.8], [-6.3, 18], [-7.2, 7],
  ],
  lower_leg: [
    [-4.4, -3], [0, -4.6], [4.6, -3], [4.7, 8], [3.5, 20], [3.1, 28.8], [0, 30.4],
    [-3, 28.8], [-3.7, 21], [-6.3, 11], [-5.3, 3],
  ],
  foot: [[-4.2, 1.6], [-3.2, -3], [2.6, -3.2], [4.4, -0.6], [9.6, 1.6], [10.8, 3.8], [9, 4.8], [-4, 4.8]],
  neck: [[-3.8, 3], [-3.6, -6], [4, -6], [4.2, 3]],
};

// `stretch` widens a limb's drawing without redrawing it. Drawings must stay
// inside `box` (before stretch) or they are clipped.
export const FRAME = {
  torso: { box: [-14, -44, 15, 20], start: [0, 0], end: [0, -40] },
  upper_arm: { stretch: 1.14, box: [-11, -15, 12, 25], start: [0, 0], end: [0, 20] },
  lower_arm: { stretch: 1.14, box: [-8, -6, 8, 27], start: [0, 0], end: [0, 19] },
  upper_leg: { stretch: 1.32, box: [-10, -8, 11, 36], start: [0, 0], end: [0, 30] },
  lower_leg: { stretch: 1.26, box: [-9, -12, 9, 33], start: [0, 0], end: [0, 28] },
  foot: { stretch: 1.12, box: [-7, -5, 13, 7], start: [0, 0] },
  head: { box: [-16, -38, 17, 5], origin: [0, 0] },
};

// A part in its standard frame. `over` may replace the box for tall hats,
// long skirts and the like.
export const part = (name, draw, over = {}) => ({ ...FRAME[name], ...over, draw });

// The bare form of a part in one material colour.
export function body(ctx, name, fill, opts) {
  smooth(ctx, SHAPES[name], fill, opts);
}

// A bare head in profile for open helmets and hats, drawn over the neck:
// skull, brow, nose, lips, jaw, ear, one eye. The hat goes on top afterwards.
//   hair   hair/beard colour
//   beard  'full' | 'goatee' | 'moustache' | 'stubble' | undefined
//   scalp  true draws close-cropped hair on the skull
//   eye    iris colour (default near-black); a bright colour reads as menace
export function face(ctx, skin, opts = {}) {
  const { hair = '#241812', beard, scalp = false, eye = INK } = opts;
  const shade = darken(skin, 0.62);
  body(ctx, 'neck', skin);
  stroke(ctx, [[1.6, -5], [2.4, 2]], 0.45, darken(skin, 0.5), false);
  smooth(ctx, [
    [-7.2, -16], [-4.6, -20.4], [1.6, -21.4], [6.4, -19.4], [8.4, -15.4], [8.5, -13.4],
    [11.5, -10.2], [9.3, -9.4], [9.8, -8], [8.8, -7.2], [9.4, -6.1], [8.5, -3.3],
    [5, -1.3], [0, -2.5], [-3.6, -5.5], [-6.8, -9.4],
  ], skin);
  if (scalp) {
    smooth(ctx, [[-7.4, -15.4], [-4.8, -20.8], [1.6, -21.9], [6.2, -19.9], [6.6, -17.6], [0.6, -17.4], [-3, -13.6], [-6.8, -9.8]], hair, { line: 0.6 });
  }
  // Hollow of the cheek and jaw.
  smooth(ctx, [[8, -4], [5, -1.9], [0.2, -3], [-3, -5.6], [1.2, -6.8], [6.4, -5.6]], shade, { line: 0, shadow: shade });
  // Ear.
  smooth(ctx, [[-2.2, -12.6], [0.2, -12.8], [0.8, -10], [-0.4, -8], [-2, -9]], shade, { line: 0.5, shadow: darken(skin, 0.5) });
  // Brow, eye, nostril, mouth.
  stroke(ctx, [[3.4, -15.5], [6, -15.2], [8.5, -14.3]], 1.1, INK);
  disc(ctx, 6.5, -13.2, 0.95, eye, { line: 0.4 });
  stroke(ctx, [[4.6, -12.2], [7.6, -12]], 0.35, darken(skin, 0.5), false);
  stroke(ctx, [[9.4, -9.6], [10.2, -9.9]], 0.4, INK, false);
  stroke(ctx, [[6.6, -7.3], [8.9, -7.2]], 0.6, INK, false);

  if (beard === 'full') {
    hard(ctx, [[9.4, -9.2], [10.2, -6.8], [9, -2], [6.6, 2.6], [5.2, 0.4], [3.4, 2.2], [1.4, 0.2], [-2.8, -4.6], [-1.2, -9], [3.4, -7.4], [6.6, -8.2]], hair, { line: 0.6 });
    stroke(ctx, [[2, -5], [3, -0.6]], 0.35, darken(hair, 0.5), false);
    stroke(ctx, [[5.6, -6], [6.2, 0.6]], 0.35, darken(hair, 0.5), false);
  } else if (beard === 'goatee') {
    hard(ctx, [[6.4, -5.6], [9.4, -5.4], [8.9, 1.4], [6.2, -2.2]], hair, { line: 0.5 });
  } else if (beard === 'stubble') {
    smooth(ctx, [[9, -8.6], [8.6, -3.4], [5, -1.5], [0.2, -2.8], [-2.6, -5.4], [2, -7.6]], darken(skin, 0.72), { line: 0, shadow: darken(skin, 0.72) });
  }
  if (beard === 'goatee' || beard === 'moustache') {
    stroke(ctx, [[6, -8.7], [10.3, -8.3], [10.4, -5.6]], 1.2, hair);
  }
}

// A healed cut on skin.
export function scar(ctx, skin, pts, width = 0.55) {
  stroke(ctx, pts.map(([x, y]) => [x + 0.35, y + 0.3]), width + 0.15, lighten(skin, 0.38));
  stroke(ctx, pts, width, darken(skin, 0.38));
}

// A blade mark in metal: dark gouge, bright burr.
export function scratch(ctx, x0, y0, x1, y1, hi = '#d2ab5c') {
  stroke(ctx, [[x0, y0], [x1, y1]], 0.45, 'rgba(20,14,10,0.75)', false);
  stroke(ctx, [[x0 + 0.3, y0 + 0.25], [x1 + 0.3, y1 + 0.25]], 0.25, hi, false);
}

export function rivet(ctx, x, y, r = 0.5, color = '#d2ab5c') {
  disc(ctx, x, y, r, color, { line: 0.35 });
}
