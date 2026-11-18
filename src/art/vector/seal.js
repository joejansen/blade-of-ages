import { INK, darken, lighten, smooth, hard, stroke, disc, glint, glow, band } from './kit.js';
import { part, body, scratch as metalScratch } from './anatomy.js';

// Modern special-operations soldier on a night raid: faceless under a
// balaclava and a high-cut helmet, night-vision tubes down, plate carrier
// and belt kit in near-black and dark olive. The only colour is the green
// of the lenses. The carbine is used as a club with a fixed bayonet.
const BLACK = '#17181b';
const RUBBER = '#0e0f11';
const NYLON = '#2e3327';
const OLIVE = '#3b4131';
const SHIRT = '#25282a';
const TROUSER = '#2a2d27';
const BALACLAVA = '#1d1e22';
const GREY = '#383b41';
const GREY_HI = '#737a83';
const GLOVE = '#1b1c1f';
const POLYMER = '#222326';
const STEEL = '#6f767d';
const STEEL_HI = '#cfd5da';
const NVG = '#5cff86';
const NVG_DIM = '#2f8a4a';
const BLOOD = '#5c0a12';
const MUD = '#4a4234';

const seam = darken(NYLON, 0.45);
const fold = darken(TROUSER, 0.42);
const shirtFold = darken(SHIRT, 0.42);

const scratch = (ctx, x0, y0, x1, y1, hi = GREY_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);

// A straight-sided box (pouch, radio, rail) from two corners.
function block(ctx, x0, y0, x1, y1, fill, line = 0.6) {
  hard(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], fill, { line });
}

// Rows of webbing stitched across a panel.
function webbing(ctx, x0, x1, ys, color = seam) {
  for (const y of ys) {
    stroke(ctx, [[x0, y], [x1, y - (x1 - x0) * 0.03]], 0.35, color, false);
    for (let x = x0 + 1.2; x < x1 - 0.4; x += 2.4) stroke(ctx, [[x, y - 0.5], [x, y + 0.5]], 0.25, color, false);
  }
}

const torso = part('torso', (ctx) => {
  // Combat shirt, and trousers below the belt line.
  body(ctx, 'torso', SHIRT);
  smooth(ctx, [[-9.5, -3.4], [9.7, -3.8], [8, 2], [6, 5.9], [0, 7.3], [-6, 5.9], [-9.5, 2]], TROUSER, { line: 0 });
  stroke(ctx, [[-8.6, -11.6], [-8.2, -8.6]], 0.4, shirtFold, false);
  stroke(ctx, [[7.6, -11.4], [8.2, -8.6]], 0.4, shirtFold, false);

  // Radio on the back of the carrier: whip antenna, cable run to the headset.
  stroke(ctx, [[-8.4, -29], [-8.9, -36], [-8.2, -42.6]], 0.55, RUBBER);
  // Drag handle standing off the shoulders.
  stroke(ctx, [[-7.6, -36.2], [-10.4, -38.2], [-8.6, -40.2], [-5.2, -38]], 1.5, INK);
  stroke(ctx, [[-7.6, -36.2], [-10.4, -38.2], [-8.6, -40.2], [-5.2, -38]], 0.8, OLIVE);

  // Plate carrier: shoulder straps, plate bag, cummerbund.
  smooth(ctx, [
    [-10.8, -32.6], [-6.6, -37], [-2, -36.6], [4, -36.2], [8.6, -35], [12, -31],
    [12.5, -23], [11.2, -13.4], [10.2, -11.6], [-9.2, -11], [-11.4, -22],
  ], NYLON);
  stroke(ctx, [[-10.6, -19.4], [0, -18.4], [11.6, -19.8]], 0.5, seam);
  stroke(ctx, [[-3.4, -36.4], [-2.2, -30], [-2.6, -19]], 0.5, seam);
  stroke(ctx, [[4.6, -36], [5.6, -32.6]], 0.45, seam, false);
  webbing(ctx, -1.4, 11.4, [-27.6, -25]);
  webbing(ctx, -9.6, -3.4, [-16.4, -13.8]);
  // Subdued patch and a push-to-talk on the chest.
  block(ctx, 0.6, -33.4, 6.4, -29.8, darken(OLIVE, 0.8), 0.5);
  stroke(ctx, [[1.6, -32.2], [5.4, -32.3]], 0.35, GREY, false);
  stroke(ctx, [[1.6, -31], [4.2, -31.1]], 0.35, GREY, false);
  disc(ctx, 9.2, -30.6, 1.3, BLACK, { line: 0.5 });
  disc(ctx, 9.2, -30.6, 0.45, GREY_HI, { line: 0 });
  // Radio body with its cable.
  block(ctx, -10.2, -30.6, -5.4, -19.8, BLACK, 0.7);
  stroke(ctx, [[-9.4, -28.6], [-6.2, -28.7]], 0.3, GREY_HI, false);
  disc(ctx, -6.6, -22, 0.55, GREY, { line: 0.3 });
  block(ctx, -9.6, -24.6, -6, -23.2, NYLON, 0.4);
  stroke(ctx, [[-6.2, -30.4], [-3.6, -33.6], [-1.6, -37.6], [0.4, -39.4]], 0.6, RUBBER);
  stroke(ctx, [[-5.6, -26], [1, -27.6], [7.6, -29.8]], 0.5, RUBBER);

  // Three magazine pouches across the front, magazines showing, pull tabs.
  for (const [x, lift] of [[0.6, 0], [4.5, -0.3], [8.4, -0.6]]) {
    block(ctx, x + 0.5, -25.4 + lift, x + 2.9, -22, GREY, 0.45);
    stroke(ctx, [[x + 0.9, -24.4 + lift], [x + 2.5, -24.5 + lift]], 0.25, GREY_HI, false);
    hard(ctx, [[x, -23 + lift], [x + 3.5, -23.2 + lift], [x + 3.4, -12.6 + lift], [x + 0.1, -12.4 + lift]], OLIVE, { line: 0.65 });
    stroke(ctx, [[x + 0.3, -19.6 + lift], [x + 3.3, -19.8 + lift]], 0.3, seam, false);
    stroke(ctx, [[x + 1.75, -23 + lift], [x + 1.75, -17.4 + lift]], 0.7, BLACK, false);
    stroke(ctx, [[x + 0.6, -14 + lift], [x + 1.6, -15.4 + lift]], 0.25, lighten(OLIVE, 0.2), false);
  }
  // Dried mud and a nick in the nylon.
  glint(ctx, -4.6, -13.6, 2.2, 1, MUD, 0.45, 0.2);
  stroke(ctx, [[8.6, -34], [10.4, -32.4]], 0.3, lighten(NYLON, 0.25), false);

  // Belt kit hanging below the hips: dump pouch, holster, utility pouch.
  hard(ctx, [[-10.6, -4.6], [-4.6, -5], [-4.2, 6.6], [-6, 9], [-10, 8.4], [-11.4, 4]], OLIVE, { line: 0.7 });
  stroke(ctx, [[-10.4, -0.6], [-4.6, -1]], 0.4, seam, false);
  stroke(ctx, [[-8.6, 0.6], [-9, 6.6]], 0.35, seam, false);
  stroke(ctx, [[-6.4, 0.4], [-6.2, 6.8]], 0.35, seam, false);
  hard(ctx, [[-3.2, -9.8], [-0.4, -10.4], [0.8, -4.6], [-2.4, -4.2]], POLYMER, { line: 0.6 });
  for (const y of [-8.8, -7.4, -6]) stroke(ctx, [[-2.6, y], [-0.4, y - 0.4]], 0.25, GREY, false);
  hard(ctx, [[-3.8, -4.6], [3, -5], [2.8, 6.4], [1, 11.4], [-2.2, 10.6], [-4, 3]], BLACK, { line: 0.7 });
  stroke(ctx, [[-3, -1.4], [2.4, -1.8]], 0.3, GREY, false);
  disc(ctx, -0.4, 1.6, 0.6, GREY, { line: 0.3 });
  stroke(ctx, [[1.6, 0.6], [1.2, 9]], 0.3, GREY_HI, false);
  hard(ctx, [[4.6, -5], [10.2, -5.4], [10.6, 4.6], [5, 5]], NYLON, { line: 0.7 });
  hard(ctx, [[4.4, -5.2], [10.4, -5.6], [10.4, -1.2], [7.4, 0], [4.6, -0.8]], OLIVE, { line: 0.5 });
  block(ctx, 6.8, -1.6, 8.2, 0.4, BLACK, 0.3);
  // The belt itself: stiff webbing, a cobra buckle.
  hard(ctx, [[-10, -9], [9.8, -9.8], [10, -4.8], [-10.2, -4]], BLACK, { line: 0.8 });
  stroke(ctx, [[-9.4, -7.6], [9.4, -8.4]], 0.3, GREY, false);
  stroke(ctx, [[-9.4, -5.4], [9.4, -6.2]], 0.3, GREY, false);
  block(ctx, 4.4, -9.4, 8, -5.2, GREY, 0.6);
  stroke(ctx, [[6.2, -9], [6.2, -5.6]], 0.4, INK, false);
  glint(ctx, 7.2, -8.4, 0.5, 0.3, GREY_HI, 0.8);
});

const upperArm = part('upper_arm', (ctx) => {
  body(ctx, 'upper_arm', SHIRT);
  // Shoulder seam and folds running to the elbow.
  stroke(ctx, [[-4.8, -1.6], [0, -3.6], [5, -1.6]], 0.45, shirtFold);
  stroke(ctx, [[-4.6, 12], [-1.6, 14.4], [-3.2, 17.6]], 0.45, shirtFold);
  stroke(ctx, [[4.2, 12.6], [2, 15.6]], 0.4, shirtFold, false);
  stroke(ctx, [[-1, 18.4], [1.6, 19.6], [3.4, 18.2]], 0.4, shirtFold);
  // Sleeve pocket with a velcro field and a subdued patch.
  hard(ctx, [[-4.2, 1.4], [4.6, 1.2], [4.3, 11], [-4, 11.2]], darken(OLIVE, 0.75), { line: 0.6 });
  hard(ctx, [[-4.5, 0.6], [4.9, 0.4], [4.7, 3.4], [-4.3, 3.6]], darken(OLIVE, 0.9), { line: 0.5 });
  block(ctx, -2.6, 4.6, 3, 9.6, GREY, 0.45);
  // Patch: a plain subdued device, a bar over a chevron.
  stroke(ctx, [[-1.6, 5.8], [2, 5.8]], 0.45, BLACK, false);
  stroke(ctx, [[-1.4, 8.6], [0.2, 7], [1.8, 8.6]], 0.45, BLACK, false);
  block(ctx, -3.6, -2.4, -1.4, -0.6, GREY, 0.35);
  glint(ctx, -2.5, -1.5, 0.4, 0.4, NVG_DIM, 0.5);
});

const lowerArm = part('lower_arm', (ctx) => {
  body(ctx, 'lower_arm', SHIRT);
  // Sleeve folds and a padded elbow panel.
  hard(ctx, [[-4.2, -1.6], [-0.6, -2.6], [-0.4, 5.6], [-4.4, 5]], darken(OLIVE, 0.7), { line: 0.5 });
  stroke(ctx, [[0.6, 2.6], [3.6, 3.8]], 0.4, shirtFold, false);
  stroke(ctx, [[-3, 8.6], [0, 9.8], [3.4, 8.4]], 0.4, shirtFold);
  // Glove: fist, hard knuckle guard, cuff strap.
  body(ctx, 'fist', GLOVE);
  hard(ctx, [[-3.2, 18.4], [0.4, 17.4], [3.9, 18.6], [4.1, 20.6], [-3.4, 20.6]], GREY, { line: 0.5 });
  stroke(ctx, [[-2.4, 19.2], [3.2, 19.3]], 0.25, GREY_HI, false);
  stroke(ctx, [[1.4, 21.4], [1.2, 23.6]], 0.4, GREY, false);
  stroke(ctx, [[-0.9, 21.5], [-1.1, 23.8]], 0.4, GREY, false);
  band(ctx, 14.8, 17.4, -3.3, 3.5, GLOVE, { sag: 0.6 });
  stroke(ctx, [[1, 15.4], [3, 15.5]], 0.5, GREY, false);
  // Wrist GPS on a wide strap, the screen barely lit.
  band(ctx, 10.6, 13.8, -3.5, 3.7, BLACK, { sag: 0.7 });
  block(ctx, -1.6, 10.4, 2.6, 14, POLYMER, 0.5);
  block(ctx, -0.9, 11.1, 1.9, 13.3, darken(NVG_DIM, 0.55), 0.3);
  stroke(ctx, [[-0.4, 12.6], [0.4, 11.8], [1.4, 12.4]], 0.25, NVG_DIM);
});

const upperLeg = part('upper_leg', (ctx) => {
  body(ctx, 'upper_leg', TROUSER);
  // Folds at the hip and behind the knee.
  stroke(ctx, [[-5, 0.6], [-1, 3], [4.6, 1.4]], 0.5, fold);
  stroke(ctx, [[-5.6, 5], [-2.6, 6.6]], 0.4, fold, false);
  stroke(ctx, [[-4.6, 24], [-1, 26.4], [3.6, 25]], 0.5, fold);
  stroke(ctx, [[-3.6, 27.6], [0, 29], [3, 27.8]], 0.4, fold);
  // Cargo pocket: bellows pleat, flap, button.
  hard(ctx, [[-4.6, 9.4], [5.8, 9], [5.4, 21.4], [-4.4, 21.8]], lighten(TROUSER, 0.06), { line: 0.7 });
  stroke(ctx, [[0.4, 12.6], [0.6, 21.2]], 0.4, fold, false);
  stroke(ctx, [[-3.8, 20.6], [4.8, 20.2]], 0.3, fold, false);
  hard(ctx, [[-5, 8.2], [6.2, 7.8], [6, 12], [0.6, 12.8], [-4.8, 12.4]], TROUSER, { line: 0.6 });
  disc(ctx, 0.6, 11, 0.5, BLACK, { line: 0.3 });
  // Mud dried on the thigh, a tear above the knee.
  glint(ctx, 3.4, 16.6, 1.6, 2.2, MUD, 0.4, 0.3);
  stroke(ctx, [[-2.6, 4.4], [-0.6, 6]], 0.35, lighten(TROUSER, 0.2), false);
  stroke(ctx, [[2.4, 23], [4.2, 23.8]], 0.4, INK, false);
});

const lowerLeg = part('lower_leg', (ctx) => {
  body(ctx, 'lower_leg', TROUSER);
  // Shin folds.
  stroke(ctx, [[-4.8, 9], [-2, 11.4], [3.6, 9.6]], 0.45, fold);
  stroke(ctx, [[-4, 14.6], [0, 16.6], [3.6, 14.8]], 0.45, fold);
  glint(ctx, 1.6, 13, 1.6, 2, MUD, 0.4, 0.2);
  // Boot shaft, laced.
  hard(ctx, [[-3.5, 24.4], [3.5, 24.4], [3.2, 29], [0, 30.4], [-3.1, 29]], BLACK, { line: 0.7 });
  for (const y of [26, 27.4, 28.8]) stroke(ctx, [[0.6, y], [2.8, y - 0.4]], 0.3, GREY_HI, false);
  // Trouser bloused over the boot top.
  smooth(ctx, [[-4.4, 19], [0, 18.2], [4.6, 19], [5.2, 22.6], [3.6, 25.6], [-3.6, 25.6], [-5.2, 22.6]], TROUSER);
  stroke(ctx, [[-3, 20.6], [-2.6, 24.6]], 0.4, fold, false);
  stroke(ctx, [[0.4, 20], [0.6, 24.8]], 0.4, fold, false);
  stroke(ctx, [[3, 20.6], [2.8, 24.6]], 0.4, fold, false);
  // Knee pad: two straps behind, a hard scuffed cap in front.
  band(ctx, -1.8, 0.2, -5, 3, BLACK, { sag: 0.6 });
  band(ctx, 3.4, 5.2, -5.6, 3, BLACK, { sag: 0.6 });
  smooth(ctx, [[-2.4, -6.6], [3.4, -7], [6.2, -2.6], [6, 4.6], [2.8, 7], [-1.8, 5.4], [-3, -1]], NYLON);
  smooth(ctx, [[0.4, -5.4], [3.6, -5.2], [5.4, -1.6], [5, 3.4], [2.6, 4.8], [0.2, 2.4], [-0.4, -2]], BLACK, { line: 0.6 });
  stroke(ctx, [[1.6, -2.6], [3.4, -2.8]], 0.3, GREY, false);
  stroke(ctx, [[1.4, 0], [3.8, -0.2]], 0.3, GREY, false);
  stroke(ctx, [[1.6, 2.4], [3.4, 2.2]], 0.3, GREY, false);
  scratch(ctx, 3.6, -3.6, 4.8, -0.8);
});

const foot = part('foot', (ctx) => {
  // Combat boot.
  body(ctx, 'foot', BLACK);
  stroke(ctx, [[5, 0.2], [6.6, 3.6]], 0.4, GREY, false);
  stroke(ctx, [[-1.6, -2.6], [-1.2, 3.6]], 0.35, GREY, false);
  for (const [x, y] of [[0.6, -1.8], [2, -0.8], [3.4, 0.2]]) stroke(ctx, [[x, y], [x + 1.5, y - 0.9]], 0.3, GREY_HI, false);
  glint(ctx, 8.4, 2.6, 1.3, 0.5, GREY, 0.6, 0.3);
  // Lugged sole.
  hard(ctx, [[-4.6, 3.8], [10.9, 3.8], [11.3, 5.2], [-4.8, 5.2]], RUBBER, { line: 0.6 });
  for (const x of [-4, -1.8, 0.4, 3.6, 5.8, 8, 10]) {
    hard(ctx, [[x - 0.7, 5], [x + 0.7, 5], [x + 0.55, 6.3], [x - 0.55, 6.3]], RUBBER, { line: 0.35 });
  }
  stroke(ctx, [[-4, 4.4], [10.4, 4.4]], 0.25, GREY, false);
});

const head = part('head', (ctx) => {
  // Neck and head under a balaclava: no face, only its shape.
  body(ctx, 'neck', BALACLAVA);
  stroke(ctx, [[-3, -2], [0, -0.8], [3.6, -2.2]], 0.4, RUBBER);
  stroke(ctx, [[-3, 0.6], [0, 1.8], [3.8, 0.4]], 0.4, RUBBER);
  smooth(ctx, [
    [-7.2, -16], [-4.6, -20.4], [1.6, -21.4], [6.4, -19.4], [8.4, -15.4], [8.5, -13.4],
    [11, -10.4], [9.5, -9.2], [9.6, -7.2], [9.2, -5.6], [8.4, -3.3],
    [5, -1.3], [0, -2.5], [-3.6, -5.5], [-6.8, -9.4],
  ], BALACLAVA);
  // Folds of the cloth over nose, mouth and jaw.
  stroke(ctx, [[9.6, -9.6], [7.6, -8.4], [6.4, -5.4]], 0.4, RUBBER);
  stroke(ctx, [[8.6, -6.6], [6, -6.2]], 0.35, RUBBER, false);
  stroke(ctx, [[7.4, -3.4], [3.6, -3.4], [0, -5.6]], 0.4, RUBBER);
  stroke(ctx, [[2.6, -11.4], [4.4, -8], [3.6, -4.6]], 0.3, lighten(BALACLAVA, 0.12));

  // Boom microphone from the headset to the mouth.
  stroke(ctx, [[0, -7.6], [4.4, -5.2], [8.6, -5.6]], 0.6, RUBBER);
  disc(ctx, 8.9, -5.7, 0.85, RUBBER, { line: 0.35 });
  // Chin strap.
  stroke(ctx, [[-2.6, -11], [1.6, -5], [5.6, -2.2]], 0.7, NYLON);
  stroke(ctx, [[3.4, -13.6], [4.6, -7], [5.8, -2.4]], 0.6, NYLON);

  // Counterweight pouch on the back of the helmet.
  block(ctx, -11.4, -18, -8.2, -12.4, NYLON, 0.6);
  stroke(ctx, [[-10.8, -15.4], [-8.8, -15.5]], 0.3, seam, false);
  // High-cut helmet: the shell stops above the ear.
  smooth(ctx, [
    [-8.8, -11.4], [-9.4, -17.6], [-5.4, -22.8], [1.6, -24.2], [7.4, -22], [10, -17.4],
    [9.4, -15.2], [3.4, -15.4], [1.6, -12.4], [-3, -12], [-5.2, -9.6],
  ], darken(OLIVE, 0.82));
  glint(ctx, 4.6, -20.6, 2.6, 1, lighten(OLIVE, 0.25), 0.35, 0.45);
  stroke(ctx, [[-7.6, -13.4], [-7.8, -17.6], [-4.6, -21.4]], 0.4, darken(OLIVE, 0.4));
  // Velcro panel, a strobe on the crown, scuffs.
  block(ctx, -5.6, -20.4, -1.4, -17.6, darken(OLIVE, 0.6), 0.4);
  hard(ctx, [[-1.4, -25.8], [1.4, -26.2], [1.6, -23.8], [-1.2, -23.6]], POLYMER, { line: 0.5 });
  stroke(ctx, [[5.4, -18.6], [7, -17.2]], 0.3, lighten(OLIVE, 0.25), false);
  stroke(ctx, [[-0.6, -22.4], [1.4, -21]], 0.3, lighten(OLIVE, 0.25), false);
  // Side rail with its slots.
  hard(ctx, [[-5.4, -16.4], [3.4, -17], [3.6, -14.8], [-5.2, -14.2]], POLYMER, { line: 0.55 });
  for (const x of [-3.8, -1.6, 0.6]) stroke(ctx, [[x, -15.7 - x * 0.07], [x + 1.1, -15.8 - x * 0.07]], 0.5, RUBBER, false);
  // Headset cup over the ear, hung from the rail.
  stroke(ctx, [[-0.6, -14.6], [-0.8, -12.6]], 0.9, POLYMER, false);
  smooth(ctx, [[-3.4, -12.8], [0.8, -13.4], [2, -9.6], [0.4, -6.4], [-3, -6.8], [-4, -9.8]], BLACK);
  smooth(ctx, [[-2.2, -11.4], [0.2, -11.8], [0.8, -9.6], [-0.2, -8], [-2, -8.4]], GREY, { line: 0.4 });

  // Night-vision goggles: shroud and arm on the brow, two tubes swung down
  // over the eyes, lenses glowing.
  hard(ctx, [[8, -21.4], [10.6, -21], [11, -18.2], [8.4, -17.6]], POLYMER, { line: 0.55 });
  hard(ctx, [[9.4, -19.6], [11.6, -20], [13.4, -16.6], [12.6, -14.8], [10.6, -15.4]], GREY, { line: 0.55 });
  // Far tube, then the near one.
  hard(ctx, [[8.8, -16.4], [15, -16], [15, -13.6], [8.8, -13.4]], darken(GREY, 0.75), { line: 0.55 });
  glow(ctx, 15.6, -14.8, 2.2, NVG_DIM);
  hard(ctx, [[8.2, -14.8], [9.6, -15.2], [15.6, -14.8], [16, -14.2], [16, -11.4], [15.6, -10.8], [9.6, -10.6], [8.2, -11]], BLACK, { line: 0.7 });
  stroke(ctx, [[10.8, -15], [10.8, -10.8]], 0.4, GREY, false);
  stroke(ctx, [[13.6, -14.8], [13.6, -10.9]], 0.4, GREY, false);
  stroke(ctx, [[11.4, -14.2], [13, -14.2]], 0.25, GREY_HI, false);
  // Eyecup spill on the mask, and the objective lenses.
  glow(ctx, 8.2, -12.8, 1.9, NVG_DIM);
  glow(ctx, 16.2, -12.8, 3, NVG);
  hard(ctx, [[15.7, -14.3], [16.5, -14], [16.5, -11.6], [15.7, -11.3]], '#c8ffd6', { line: 0.3, shadow: NVG, light: [0.3, 0] });
  hard(ctx, [[14.9, -15.8], [15.5, -15.6], [15.5, -14.9], [14.9, -14.9]], NVG, { line: 0.25, shadow: NVG_DIM, light: [0.2, 0] });
}, { box: [-16, -38, 20, 5] });

// Carbine swung as a club and thrust as a spear, drawn muzzle-up. (0,0) is
// the pistol grip; the underside of the weapon (grip, magazine) is toward
// -x, the top (optic) toward +x.
function weapon(length) {
  return {
    // Authored with the magazine side on -x; flipped so it hangs below the
    // barrel when the carbine points forward.
    mirror: true,
    box: [-7.5, -length - 2, 7.5, 14.5],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      const guard = -L * 0.62;   // front of the handguard
      const muzzle = -(L - 7);   // end of the muzzle device
      // Buffer tube and collapsed stock.
      block(ctx, -0.9, 1.6, 0.9, 9, GREY, 0.5);
      hard(ctx, [[-1.3, 4.6], [1.5, 4.2], [1.7, 12.6], [-3.6, 13], [-3.8, 10.6], [-1.5, 8.4]], POLYMER, { line: 0.7 });
      stroke(ctx, [[-0.4, 9.6], [1, 9.4]], 0.3, GREY, false);
      stroke(ctx, [[-3.2, 12.2], [1.3, 11.9]], 0.4, RUBBER, false);
      // Barrel, gas block, muzzle device.
      block(ctx, -0.7, muzzle + 3, 0.7, guard + 0.4, GREY, 0.5);
      block(ctx, -1.2, guard - 4.4, 1.2, guard - 2.2, POLYMER, 0.5);
      block(ctx, -1, muzzle, 1, muzzle + 4, BLACK, 0.55);
      for (const y of [muzzle + 1, muzzle + 2.2]) stroke(ctx, [[-0.6, y], [0.6, y]], 0.3, GREY_HI, false);
      // Knife bayonet fixed under the muzzle: grip, guard ring, blooded blade.
      block(ctx, -2.5, muzzle + 2, -0.9, muzzle + 8.4, POLYMER, 0.5);
      for (const y of [muzzle + 4, muzzle + 5.4, muzzle + 6.8]) stroke(ctx, [[-2.3, y], [-1.1, y]], 0.25, GREY, false);
      hard(ctx, [[-2.4, muzzle + 2.4], [-2.7, -L + 4], [-0.6, -L], [-0.3, -L + 4.4], [-0.6, muzzle + 2.4]], STEEL, { shadow: darken(STEEL, 0.55), light: [0.8, 0], line: 0.6 });
      stroke(ctx, [[-1.5, muzzle + 1.6], [-1.3, -L + 2.6]], 0.3, STEEL_HI, false);
      hard(ctx, [[-2.6, -L + 3.6], [-0.7, -L + 0.5], [-0.4, -L + 3.6], [-1, -L + 5.2], [-1.6, -L + 4.2], [-2.2, -L + 5.6]], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      block(ctx, -3, muzzle + 1.6, 0.2, muzzle + 2.7, GREY, 0.45);
      // Handguard: slotted, a rail along the top, a light on the far side.
      hard(ctx, [[-2, -12.6], [2, -12.6], [1.9, guard], [-1.9, guard]], POLYMER, { line: 0.7 });
      for (let y = guard + 2.4; y < -14.6; y += 3.4) {
        stroke(ctx, [[-0.9, y], [-0.9, y + 1.8]], 0.7, RUBBER, false);
        stroke(ctx, [[0.5, y], [0.5, y + 1.8]], 0.7, RUBBER, false);
      }
      for (let y = guard + 1; y < -13; y += 1.3) stroke(ctx, [[1.5, y], [2.3, y]], 0.4, GREY, false);
      block(ctx, 2.1, guard + 2, 3.9, guard + 7.6, BLACK, 0.5);
      disc(ctx, 3, guard + 1.9, 0.75, GREY, { line: 0.35 });
      // Vertical foregrip.
      hard(ctx, [[-1.9, guard + 6], [-5.6, guard + 5.6], [-5.6, guard + 8.2], [-1.9, guard + 8.6]], POLYMER, { line: 0.6 });
      // Magazine, curving forward.
      hard(ctx, [[-1.9, -11.6], [-1.9, -7.2], [-6.5, -8.4], [-6.9, -12.4]], GREY, { line: 0.7 });
      stroke(ctx, [[-3, -11.4], [-3.2, -7.8]], 0.3, GREY_HI, false);
      stroke(ctx, [[-5, -11.8], [-5, -8.2]], 0.3, darken(GREY, 0.5), false);
      // Trigger guard and pistol grip.
      stroke(ctx, [[-2, -6.6], [-3.9, -5.2], [-3.7, -3], [-2, -2.4]], 0.6, POLYMER);
      hard(ctx, [[-1.6, -2.6], [-1.6, 1], [-5.6, 3.8], [-6.6, 1.8], [-4, -1.6]], POLYMER, { line: 0.7 });
      for (const t of [0.3, 0.55, 0.8]) stroke(ctx, [[-2 - t * 3.4, -1 + t * 2.4], [-1.8 - t * 3.6, 1 + t * 2.6]], 0.25, GREY, false);
      // Receiver: ejection port, forward assist, selector, charging handle.
      hard(ctx, [[-2.1, -12.8], [2.1, -12.8], [2.1, 2], [0.8, 2.6], [-2.1, 1.2]], BLACK, { line: 0.75 });
      stroke(ctx, [[-0.2, -12.4], [-0.2, 1.6]], 0.3, GREY, false);
      block(ctx, 0.3, -9.6, 1.5, -6, GREY, 0.35);
      disc(ctx, 1.2, -3.4, 0.6, GREY, { line: 0.3 });
      disc(ctx, -1, -3, 0.5, GREY_HI, { line: 0.3 });
      block(ctx, 1.6, 0.6, 2.9, 1.8, GREY, 0.35);
      scratch(ctx, -1.4, -11.4, 0.4, -10.2);
      scratch(ctx, 0.6, -1.8, 1.6, 0.2);
      // Optic on its mount, lens toward the muzzle.
      block(ctx, 2.1, -10.4, 3.1, -5.6, GREY, 0.45);
      hard(ctx, [[3, -12], [6, -11.6], [6.2, -4.8], [3, -4.4]], BLACK, { line: 0.7 });
      stroke(ctx, [[3.6, -11.6], [5.6, -11.4]], 0.5, NVG_DIM, false);
      disc(ctx, 5.4, -8, 0.6, GREY, { line: 0.3 });
      stroke(ctx, [[3.8, -6.6], [3.8, -9.6]], 0.3, GREY_HI, false);
      // Sling, wrapped tight round the stock.
      stroke(ctx, [[-1.3, 6], [1.5, 5.4]], 0.9, NYLON, false);
      stroke(ctx, [[-1.3, 7.4], [1.5, 6.8]], 0.9, NYLON, false);
    },
  };
}

export default {
  id: 'seal',
  mood: { shadow: 0.55, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head },
  weapon,
};
