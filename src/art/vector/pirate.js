import { INK, darken, lighten, smooth, hard, stroke, disc, glint, glow, band, form } from './kit.js';
import { part, body, face, scar as skinScar, scratch as metalScratch, rivet as stud } from './anatomy.js';

// Caribbean pirate captain, c.1715, with nothing jolly left in him: an
// oxblood coat gone black with salt and powder, a patch over one eye, slow
// match smouldering in his beard, and a notched cutlass.
const SKIN = '#9a6b4a';
const BEARD = '#141012';
const COAT = '#3b1217';
const COAT_DARK = '#220b0f';
const TRIM = '#7a6230';
const SHIRT = '#8b8169';
const SASH = '#7b1420';
const BREECHES = '#24222b';
const HAT = '#1f1b1d';
const BOOT = '#2c1d15';
const LEATHER = '#4a2d1b';
const LEATHER_DARK = '#28170e';
const WOOD = '#4a2f1c';
const IRON = '#494c54';
const IRON_HI = '#959ba5';
const BRASS = '#8a6a2a';
const BRASS_HI = '#d0aa58';
const STEEL = '#a6aeb6';
const EMBER = '#ff5a2a';
const BLOOD = '#5c0a12';

const crease = darken(SKIN, 0.5);
const coatFold = darken(COAT, 0.45);
const shirtFold = darken(SHIRT, 0.5);

const rivet = (ctx, x, y, r = 0.5, color = BRASS_HI) => stud(ctx, x, y, r, color);
const scar = (ctx, pts, width) => skinScar(ctx, SKIN, pts, width);
const scratch = (ctx, x0, y0, x1, y1, hi = BRASS_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);

// A coat button: tarnished brass with a dark eye.
function button(ctx, x, y, r = 0.62) {
  rivet(ctx, x, y, r, BRASS);
  glint(ctx, x + 0.15, y - 0.15, r * 0.4, r * 0.4, BRASS_HI, 0.9);
}

// A plait in the beard tied off with a red ribbon, a length of slow match
// smouldering at the end.
function braid(ctx, x, y0, y1) {
  hard(ctx, [[x - 0.8, y0], [x + 0.8, y0], [x + 0.6, y1], [x - 0.6, y1]], BEARD, { line: 0.45 });
  for (let y = y0 + 0.5; y < y1 - 0.8; y += 1.2) {
    stroke(ctx, [[x - 0.6, y], [x + 0.6, y + 0.7]], 0.3, lighten(BEARD, 0.25), false);
  }
  hard(ctx, [[x - 1, y1 - 0.4], [x + 1, y1 - 0.4], [x + 1.4, y1 + 1.8], [x + 0.2, y1 + 0.9], [x - 1.2, y1 + 2]], SASH, { line: 0.4 });
  glow(ctx, x, y1 + 0.6, 1.5, EMBER);
  glint(ctx, x, y1 + 0.5, 0.32, 0.32, '#ffd27a', 0.95);
}

const torso = part('torso', (ctx) => {
  // Shirt: open at the throat, sweat- and powder-stained.
  body(ctx, 'torso', SHIRT);
  stroke(ctx, [[6.4, -37], [8.6, -31], [7.4, -25.6]], 0.6, shirtFold);
  hard(ctx, [[5.2, -38.4], [8.4, -35.4], [7.6, -29.6]], darken(SKIN, 0.85), { line: 0.5 });
  for (const y of [-34.6, -32.4]) stroke(ctx, [[6.2, y], [8, y + 0.6]], 0.3, INK, false);
  stroke(ctx, [[9.4, -24], [10.6, -18], [9.2, -13]], 0.5, shirtFold);
  stroke(ctx, [[6.6, -22], [7.4, -16]], 0.4, shirtFold, false);
  glint(ctx, 9.4, -20.6, 1.6, 1.1, '#5d5038', 0.7, 0.4);
  glint(ctx, 7.6, -3, 1.2, 0.9, BLOOD, 0.7, 0.2);
  stroke(ctx, [[5.6, -2], [6.4, 4.6]], 0.45, shirtFold, false);

  // Far skirt of the coat, seen past the hip.
  hard(ctx, [[4.6, -5], [9.6, -5.4], [11.6, 6], [12.6, 14.6], [10.4, 16.8], [8.6, 15], [6.4, 16.6], [5, 13]], COAT_DARK, { line: 0.7 });
  stroke(ctx, [[8.4, -2], [9.6, 14]], 0.4, INK, false);

  // The coat: back and near side, skirts to the thigh, hem in rags.
  hard(ctx, [
    [3, -41.2], [-3.4, -42], [-8, -38.6], [-11.6, -33.6], [-12.2, -24], [-9.8, -14],
    [-9.6, -6], [-12, 6], [-12.9, 16.4], [-10.6, 17.6], [-9.4, 14.6], [-7.4, 17.4],
    [-4.6, 16], [-3, 17.6], [-1.2, 14.4], [0.6, 17.4], [2.6, 16.6], [3.8, 8], [2.4, -4],
    [1.6, -12], [3, -22], [4.4, -30], [5, -36],
  ], COAT);
  // Seams, folds, the back vent.
  stroke(ctx, [[-6.6, -36], [-7.6, -24], [-5.6, -12], [-6.6, 2], [-8.2, 15]], 0.55, coatFold);
  stroke(ctx, [[-2.6, -4], [-3.2, 6], [-2.8, 14.6]], 0.5, coatFold);
  stroke(ctx, [[-10.2, -2], [-11, 8], [-11.6, 15.4]], 0.4, coatFold);
  stroke(ctx, [[0.4, -3], [1.6, 8], [0.8, 15.6]], 0.4, coatFold);
  stroke(ctx, [[-10.4, -30], [-10.8, -24], [-8.8, -15]], 0.35, lighten(COAT, 0.18));
  // A sword cut through the cloth, the shirt showing; a crude patch.
  hard(ctx, [[-5.4, -30.6], [-1.6, -27.4], [-1.8, -26.4], [-5.6, -29.4]], SHIRT, { line: 0.4 });
  hard(ctx, [[-9.2, 7], [-5.4, 6.4], [-5, 11], [-8.8, 11.6]], darken(COAT, 0.7), { line: 0.45 });
  for (const [x, y] of [[-9.2, 8.4], [-7.4, 6.6], [-5.2, 8.6], [-7, 11.4]]) stroke(ctx, [[x - 0.6, y - 0.4], [x + 0.6, y + 0.4]], 0.3, SHIRT, false);
  // Turned-back front edge, braided, with a row of tarnished buttons.
  hard(ctx, [
    [3, -41.2], [5, -36], [4.4, -30], [3, -22], [1.6, -12], [-0.4, -12.4], [1, -22],
    [2.2, -30], [2.4, -36], [0.6, -40.4],
  ], COAT_DARK, { line: 0.6 });
  stroke(ctx, [[1.2, -40], [3.2, -36], [3, -30], [1.8, -22], [0.4, -13]], 0.4, TRIM);
  for (const [x, y] of [[3.6, -34], [3.4, -29.4], [2.7, -24.8], [2, -20.2], [1.4, -15.6]]) button(ctx, x, y);
  stroke(ctx, [[2.6, -3], [3.8, 8], [2.8, 16]], 0.4, TRIM);
  for (const y of [0, 4.6, 9.2]) button(ctx, 2.2 + (y > 4 ? 0.6 : 0.2), y, 0.55);
  // Collar.
  hard(ctx, [[-6.4, -40], [-3.2, -42.4], [3.2, -41.6], [5.2, -38.6], [1, -38], [-4, -37.4]], COAT_DARK, { line: 0.6 });

  // Sword baldric one way, pistol bandolier the other.
  hard(ctx, [[8.8, -35.6], [11, -33.2], [-7.6, -12.4], [-9.4, -14.6]], LEATHER_DARK, { line: 0.7 });
  hard(ctx, [[-8.6, -37.4], [-5.4, -38.8], [9.8, -14.4], [7.4, -12.4]], LEATHER, { line: 0.7 });
  stroke(ctx, [[-6.4, -36.8], [8.2, -13.8]], 0.3, lighten(LEATHER, 0.3), false);
  // Buckle on the bandolier.
  hard(ctx, [[-5.6, -35.4], [-2.6, -36.6], [-1.2, -33.6], [-4.2, -32.4]], BRASS, { line: 0.5 });
  hard(ctx, [[-4.4, -34.9], [-3, -35.4], [-2.4, -34.1], [-3.8, -33.6]], LEATHER_DARK, { line: 0.3 });
  // Flintlock thrust through it: barrel, lock, a heavy brass-capped butt.
  hard(ctx, [[3.6, -24.6], [5.6, -22.4], [0.2, -15.2], [-1.4, -16.8]], IRON, { line: 0.6 });
  stroke(ctx, [[3.8, -23], [0, -17]], 0.3, IRON_HI, false);
  smooth(ctx, [[2.8, -25.6], [6.4, -29], [10.2, -30], [11.6, -27.8], [9.4, -25.4], [6.4, -22.6]], WOOD, { line: 0.7 });
  hard(ctx, [[4.2, -26.4], [6.2, -27.6], [7, -25.8], [5, -24.6]], IRON, { line: 0.4 });
  stroke(ctx, [[5.6, -27.6], [6.6, -29.4]], 0.6, IRON_HI, false);
  disc(ctx, 10.6, -28.6, 1.5, BRASS, { line: 0.5 });
  glint(ctx, 11, -29.1, 0.55, 0.35, BRASS_HI, 0.9, -0.5);
  // Strap back over the pistol.
  hard(ctx, [[3.4, -25.4], [5.6, -27], [7.6, -23.8], [5.4, -22.2]], LEATHER, { line: 0.6 });
  rivet(ctx, 5.5, -24.6, 0.42);

  // Sash ends hanging at the back hip.
  hard(ctx, [[-9.6, -5], [-5.6, -5.4], [-4.8, 6.4], [-6.4, 4.6], [-7.6, 8.4], [-9, 5.2], [-10.6, 6.8]], darken(SASH, 0.75), { line: 0.6 });
  stroke(ctx, [[-7.6, -4], [-7.4, 5]], 0.4, darken(SASH, 0.4), false);
  // Wide crimson sash, wound and knotted.
  hard(ctx, [[-10, -12], [9.6, -12.8], [9.9, -4.2], [-10.2, -3]], SASH, { line: 0.8 });
  stroke(ctx, [[-9.8, -9.4], [0, -10.2], [9.6, -9.8]], 0.5, darken(SASH, 0.45));
  stroke(ctx, [[-9.8, -6.4], [0, -7.2], [9.6, -6.8]], 0.5, darken(SASH, 0.45));
  stroke(ctx, [[-4, -11.2], [4, -11.6]], 0.3, lighten(SASH, 0.22), false);
  smooth(ctx, [[-9.6, -9.6], [-6.8, -10.6], [-5, -8], [-6, -4.6], [-9, -4.4], [-10.4, -7]], darken(SASH, 0.85), { line: 0.6 });
  stroke(ctx, [[-8.6, -8.6], [-6.6, -6]], 0.35, darken(SASH, 0.4), false);
  // Dagger hilt tucked in the front of it.
  hard(ctx, [[5.4, -15.6], [7, -15.8], [7.6, -11.4], [5.6, -11.2]], WOOD, { line: 0.5 });
  disc(ctx, 6.2, -16.2, 1, BRASS, { line: 0.4 });
  stroke(ctx, [[4.6, -11.8], [8.6, -12.2]], 0.9, BRASS, false);
});

const upperArm = part('upper_arm', (ctx) => {
  // Coat sleeve.
  body(ctx, 'upper_arm', COAT);
  stroke(ctx, [[2.2, 4], [3.8, 11], [2.8, 19]], 0.55, coatFold);
  stroke(ctx, [[-3.6, 5], [-2.6, 12], [-3.2, 19]], 0.5, coatFold);
  stroke(ctx, [[-4.4, 16.6], [0, 18.6], [3.8, 17]], 0.45, coatFold);
  stroke(ctx, [[4.6, 2], [4.8, 9]], 0.3, lighten(COAT, 0.2), false);
  // Shoulder seam with a worn wing of braid.
  hard(ctx, [[-6, -2.4], [-4.6, -5.6], [0, -7.4], [4.8, -5.4], [6.4, -2], [5.6, 1], [0, -1.4], [-5.4, 1.2]], COAT_DARK, { line: 0.6 });
  stroke(ctx, [[-5, -0.4], [0, -2.8], [5.2, -0.6]], 0.45, TRIM);
  for (const x of [-3, 0, 3]) button(ctx, x, -4.2 + Math.abs(x) * 0.4, 0.5);
  // A slash across the sleeve, shirt and a little blood showing.
  hard(ctx, [[-2.6, 6.4], [2.6, 9.4], [2.4, 10.6], [-2.8, 7.6]], SHIRT, { line: 0.4 });
  stroke(ctx, [[-0.6, 8.2], [1.6, 9.6]], 0.5, BLOOD, false);
  // Rag knotted round the arm.
  band(ctx, 12.6, 15, -5.4, 5, darken(SASH, 0.85), { sag: 0.9 });
  hard(ctx, [[-5.4, 13], [-7.6, 15], [-6.4, 15.8], [-7, 18.4], [-4.8, 15.4]], darken(SASH, 0.7), { line: 0.45 });
});

const lowerArm = part('lower_arm', (ctx) => {
  body(ctx, 'lower_arm', COAT);
  stroke(ctx, [[-3.6, -0.6], [0, 1], [3.8, -0.4]], 0.5, coatFold);
  // Fist: scarred knuckles, two rings.
  body(ctx, 'fist', SKIN);
  stroke(ctx, [[1.4, 21.4], [1.2, 23.6]], 0.45, crease, false);
  stroke(ctx, [[-0.9, 21.5], [-1.1, 23.8]], 0.45, crease, false);
  scar(ctx, [[-2.8, 19.6], [0, 20.2]], 0.4);
  band(ctx, 21.2, 22.4, 1.5, 4.2, BRASS, { sag: 0.2, line: 0.4 });
  disc(ctx, 3, 21.6, 0.75, '#7a0f18', { line: 0.35 });
  band(ctx, 21.6, 22.6, -1.1, 1.1, IRON_HI, { sag: 0.2, line: 0.4 });
  // Shirt ruffle at the wrist, grey and torn.
  hard(ctx, [
    [-4.2, 14], [4.4, 13.8], [4.9, 17.8], [3.3, 16.8], [2.1, 18.9], [0.7, 17], [-0.7, 19],
    [-2.1, 17], [-3.3, 18.6], [-4.7, 17.2],
  ], SHIRT, { line: 0.5 });
  for (const x of [-2.6, 0, 2.6]) stroke(ctx, [[x, 14.6], [x + 0.1, 16.6]], 0.3, shirtFold, false);
  // Big turned-back cuff, braided, buttoned.
  hard(ctx, [[-5.9, 5.6], [5.9, 5], [5.1, 14.6], [-4.9, 15]], COAT_DARK, { line: 0.8 });
  stroke(ctx, [[-5.3, 7], [5.3, 6.4]], 0.5, TRIM, false);
  stroke(ctx, [[-4.6, 13.8], [4.8, 13.4]], 0.35, TRIM, false);
  for (const x of [-3, 0, 3]) button(ctx, x, 10.2 - x * 0.04);
  for (const x of [-3, 0, 3]) stroke(ctx, [[x, 7.4], [x, 9.4]], 0.35, TRIM, false);
  scratch(ctx, -4.2, 11.6, -1.6, 13, lighten(COAT, 0.3));
});

const upperLeg = part('upper_leg', (ctx) => {
  // Breeches.
  body(ctx, 'upper_leg', BREECHES);
  const fold = darken(BREECHES, 0.45);
  stroke(ctx, [[2.8, 2], [4.4, 12], [3.2, 22]], 0.6, fold);
  stroke(ctx, [[-3.8, 4], [-2.6, 14], [-3.2, 22]], 0.5, fold);
  stroke(ctx, [[-5.4, 10], [-1, 11.6]], 0.4, fold, false);
  stroke(ctx, [[5.4, 6], [5.6, 15]], 0.3, lighten(BREECHES, 0.2), false);
  // Side seam, buttoned at the knee.
  stroke(ctx, [[-0.6, -2], [0.2, 12], [-0.2, 24]], 0.35, lighten(BREECHES, 0.22));
  for (const y of [19, 21.6]) button(ctx, -0.2, y, 0.5);
  // Knee band and buckle.
  band(ctx, 23.6, 26.2, -5.6, 5.6, darken(BREECHES, 0.75), { sag: 1 });
  hard(ctx, [[1.6, 24], [4.2, 23.8], [4.3, 26.4], [1.7, 26.6]], BRASS, { line: 0.45 });
  hard(ctx, [[2.4, 24.6], [3.5, 24.5], [3.5, 25.8], [2.4, 25.9]], darken(BREECHES, 0.6), { line: 0.3 });
  // Tar and an old stain.
  glint(ctx, -3, 16.4, 1.4, 1, darken(BREECHES, 0.5), 0.8, 0.4);
});

const lowerLeg = part('lower_leg', (ctx) => {
  // Tall sea boot.
  body(ctx, 'lower_leg', BOOT);
  const seam = darken(BOOT, 0.45);
  stroke(ctx, [[-0.6, 5], [-1, 16], [-0.6, 28]], 0.4, seam);
  stroke(ctx, [[3, 6], [2.8, 16], [2.2, 24]], 0.3, lighten(BOOT, 0.22));
  // Slouch at the ankle, salt line, scuffs.
  stroke(ctx, [[-3.6, 19.6], [0, 21.2], [3.4, 19.8]], 0.5, seam);
  stroke(ctx, [[-3.4, 22.6], [0, 24], [3.2, 22.8]], 0.5, seam);
  stroke(ctx, [[-3, 25.6], [0, 26.8], [3, 25.8]], 0.45, seam);
  stroke(ctx, [[-5.2, 13], [-2, 14.4], [1, 13.6], [4, 14.4]], 0.3, '#6f6a5c');
  scratch(ctx, 0.6, 8.6, 3.2, 11.4, lighten(BOOT, 0.35));
  // Spur strap and buckle.
  band(ctx, 16, 17.8, -4.9, 3.8, LEATHER_DARK, { sag: 0.6 });
  hard(ctx, [[0.6, 15.9], [2.6, 15.8], [2.7, 18.4], [0.7, 18.5]], IRON, { line: 0.4 });
  // Bucket top: a wide cuff folded down over the knee, lining showing.
  hard(ctx, [[-5.6, -7.6], [0, -9], [5.8, -7.8], [5, -4], [-4.8, -3.6]], darken(BOOT, 0.55), { line: 0.6 });
  hard(ctx, [[-6.6, -6.4], [0, -5], [6.8, -6.8], [7.6, 3], [4, 5], [0, 4.2], [-3.6, 5], [-7.6, 2.8]], lighten(BOOT, 0.1), { line: 0.8 });
  stroke(ctx, [[-6.2, -4.6], [0, -3.2], [6.4, -5]], 0.4, lighten(BOOT, 0.35));
  stroke(ctx, [[-6.8, 1.4], [-3.6, 3.4], [0, 2.6], [4, 3.4], [7, 1.6]], 0.4, seam);
  for (const x of [-5, -2.4, 0.2, 2.8, 5.4]) stroke(ctx, [[x, 3], [x + 0.2, 3.9]], 0.3, '#6f6a5c', false);
  stroke(ctx, [[-3.4, -3.6], [-3, 1]], 0.4, seam, false);
  // A nick cut out of the cuff.
  hard(ctx, [[5, 4.6], [5.6, 2.4], [6.6, 3.6]], INK, { line: 0 });
});

const foot = part('foot', (ctx) => {
  body(ctx, 'foot', BOOT);
  // Squared toe, creased vamp.
  hard(ctx, [[7.6, 1], [10.6, 1.6], [11.6, 2.6], [11.4, 4.6], [7.4, 4.6]], darken(BOOT, 0.85), { line: 0.6 });
  stroke(ctx, [[3.4, -1.6], [5, 1], [4.6, 3.6]], 0.45, darken(BOOT, 0.45));
  stroke(ctx, [[5.4, -0.2], [6.8, 1.6], [6.6, 3.8]], 0.4, darken(BOOT, 0.45));
  scratch(ctx, 8.4, 2.2, 10.4, 3.4, lighten(BOOT, 0.35));
  // Instep strap with a brass buckle.
  band(ctx, -2.6, -0.6, -3.4, 3.2, LEATHER_DARK, { sag: 0.5, line: 0.5 });
  hard(ctx, [[0.6, -2.6], [2.6, -2.7], [2.7, -0.1], [0.7, 0]], BRASS, { line: 0.4 });
  // Sole and a stacked heel.
  hard(ctx, [[-4.5, 4.2], [11.6, 4.2], [11.8, 5.6], [-4.7, 5.6]], LEATHER_DARK, { line: 0.6 });
  hard(ctx, [[-4.7, 3], [-0.8, 3], [-1, 6.2], [-4.9, 6.2]], LEATHER_DARK, { line: 0.6 });
  stroke(ctx, [[-4.4, 4.6], [-1.2, 4.6]], 0.3, lighten(LEATHER_DARK, 0.25), false);
  for (const x of [1, 3.6, 6.2, 8.8]) glint(ctx, x, 4.9, 0.28, 0.28, IRON_HI, 0.8);
});

const head = part('head', (ctx) => {
  face(ctx, SKIN, { hair: BEARD, beard: 'full', eye: INK });
  // Long matted hair down the back of the neck.
  hard(ctx, [
    [-7.4, -16], [-1.6, -15.4], [-1.2, -9.6], [-2.8, -4], [-4.4, 1.8], [-6, 0.4],
    [-7.4, 4.2], [-9, 1.4], [-10.8, 3.2], [-10.4, -3], [-11.2, -7], [-9, -11.6],
  ], BEARD, { line: 0.6 });
  for (const [x0, y0, x1, y1] of [[-6, -13, -8.4, 0], [-3.6, -13.4, -5.4, -1], [-8.4, -10, -10, -1]]) {
    stroke(ctx, [[x0, y0], [x1, y1]], 0.3, lighten(BEARD, 0.22), false);
  }
  stroke(ctx, [[-5.6, -8], [-6.6, -2]], 0.3, '#5d5a58', false);
  // The great black beard, up to the cheekbone and down the chest.
  hard(ctx, [
    [9.6, -9.2], [10.8, -6], [9.9, -1.6], [9, 3.2], [7.2, 2], [5.8, 5.6], [4, 2.8],
    [1.8, 4], [-0.2, -0.4], [-3, -4.8], [-1.6, -10.4], [2.6, -9.6], [5.4, -10.2], [7.4, -9],
  ], BEARD, { line: 0.6 });
  for (const [x, y] of [[0.6, -7], [2.8, -6.4], [5.2, -7], [7.6, -6.2], [2, -1.6], [5, -1.2], [7.8, -1.4]]) {
    stroke(ctx, [[x, y], [x + 0.5, y + 3.4]], 0.3, lighten(BEARD, 0.22), false);
  }
  stroke(ctx, [[3.4, -4], [4, 1.6]], 0.3, '#5d5a58', false);
  // Moustache hanging over a mouth that is a slit.
  stroke(ctx, [[5.6, -8.8], [8.8, -8.4], [10.8, -6.2]], 1.4, BEARD);
  stroke(ctx, [[7.4, -6.9], [9.6, -6.8]], 0.4, '#6a2a22', false);
  braid(ctx, 7.6, 2.2, 5.6);
  braid(ctx, 3.4, 3.2, 6.2);
  // An old burn-scar down the cheek below the patch.
  scar(ctx, [[3.6, -12.4], [2.6, -10.6]], 0.5);

  // Eyepatch and its thong.
  stroke(ctx, [[5.2, -12.6], [0, -13.8], [-6.6, -15]], 0.6, INK);
  hard(ctx, [[4.4, -15], [8.6, -14.8], [8.2, -11.6], [6.3, -10.7], [4.6, -11.9]], '#0d0b0c', { line: 0.5 });
  stroke(ctx, [[5.2, -14.2], [7.8, -14.1]], 0.25, '#4a4648', false);
  stroke(ctx, [[8, -14.6], [9.2, -16.4]], 0.6, INK, false);

  // Tricorn: low crown, the near brim cocked up and pinned, edges frayed.
  smooth(ctx, [[-7.2, -16.6], [-6.8, -22], [-2, -25.6], [4, -25.2], [8, -21.8], [8.8, -16.8]], darken(HAT, 0.8));
  hard(ctx, [[-12.6, -15.6], [-6, -17.8], [4, -18.2], [14.4, -16.8], [13, -14.6], [4, -15.4], [-5, -15], [-11.6, -13.4]], darken(HAT, 0.7), { line: 0.6 });
  hard(ctx, [
    [-13.6, -14.8], [-11.4, -18.4], [-9.8, -19.2], [-9.4, -20.8], [-6, -22.8], [-4.4, -22.6],
    [-3, -24.4], [0, -24.2], [1, -25], [3.4, -24.4], [5, -22.8], [6.6, -23], [9, -21.2],
    [10.6, -19.2], [12, -19.6], [15.6, -16.4], [12, -15.4], [4, -16.4], [-4, -16.2],
    [-10, -14.4],
  ], HAT);
  // Tattered braid along the cocked edge, a notch, a bullet hole.
  stroke(ctx, [[-11.4, -17.2], [-6, -21.4], [-2.6, -22.8]], 0.5, TRIM);
  stroke(ctx, [[1.4, -23.4], [4.6, -21.6]], 0.5, TRIM, false);
  stroke(ctx, [[8.6, -20], [12.6, -17.6]], 0.5, TRIM, false);
  stroke(ctx, [[-10.6, -15.2], [-4, -17.2], [4, -17.4], [13.6, -16.4]], 0.3, lighten(HAT, 0.2));
  disc(ctx, 6.6, -19.4, 0.6, INK, { line: 0 });
  glint(ctx, 6.8, -19.2, 0.25, 0.25, '#6a6466', 0.9);
  for (const [x, y] of [[-8.6, -20.2], [-1.6, -24.2], [7.8, -22.2], [11.4, -19.6]]) {
    stroke(ctx, [[x, y], [x - 0.3, y - 1.2]], 0.3, INK, false);
  }
  // Cockade loop and button holding the brim.
  stroke(ctx, [[-1.6, -17.2], [-0.6, -21.6]], 0.7, TRIM, false);
  stroke(ctx, [[0, -17.2], [0.4, -21.6]], 0.7, TRIM, false);
  button(ctx, -0.8, -17.8, 0.8);
}, { box: [-16, -38, 17, 10] });

// Cutlass, drawn tip-up from the grip. `length` is grip-to-tip in rig units.
// The cutting edge and the knuckle guard are on +x.
function weapon(length) {
  return {
    box: [-8, -length - 2, 9, 9],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      // Blade: broad, the edge bellied toward +x, the point swept back and
      // the spine clipped just short of it.
      hard(ctx, [
        [-2.2, -5.4], [-2.4, -L * 0.3], [-3, -L * 0.6], [-3.5, -L * 0.8], [-2.7, -L * 0.86],
        [-2.2, -L], [0.6, -L * 0.93], [3, -L * 0.8], [4.3, -L * 0.64], [4.3, -L * 0.48], [3.4, -L * 0.45],
        [4.1, -L * 0.41], [3.7, -L * 0.22], [3, -5.4],
      ], STEEL, { shadow: darken(STEEL, 0.58), light: [1.5, 0] });
      // Narrow fuller under the back, bright ground edge.
      stroke(ctx, [[-1, -7], [-1.3, -L * 0.3], [-1.8, -L * 0.6], [-2.2, -L * 0.76]], 0.5, darken(STEEL, 0.5));
      stroke(ctx, [[2.8, -L * 0.24], [3.3, -L * 0.38]], 0.35, '#e9eef2', false);
      stroke(ctx, [[3.5, -L * 0.5], [3.7, -L * 0.64], [2.6, -L * 0.79]], 0.35, '#e9eef2');
      // More notches, rust near the hilt.
      hard(ctx, [[4.5, -L * 0.62], [3.5, -L * 0.605], [4.5, -L * 0.585]], INK, { line: 0 });
      hard(ctx, [[3.9, -L * 0.3], [3.1, -L * 0.29], [3.9, -L * 0.275]], INK, { line: 0 });
      scratch(ctx, -1.6, -L * 0.36, 1.4, -L * 0.43, '#e9eef2');
      glint(ctx, 0.6, -9.4, 1.3, 0.8, '#6a3a22', 0.55, 0.3);
      // Blood from the point down the edge, one run across the flat.
      hard(ctx, [
        [-2.5, -L * 0.86], [-2.1, -L + 0.7], [0.5, -L * 0.925], [2.8, -L * 0.8], [4, -L * 0.66],
        [3.2, -L * 0.6], [2.4, -L * 0.68], [1.4, -L * 0.62], [0.6, -L * 0.74], [-0.8, -L * 0.72],
        [-1.4, -L * 0.8],
      ], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [[1.4, -L * 0.63], [1.6, -L * 0.5]], 0.5, BLOOD, false);
      // Grip: dark wood bound with twisted wire, brass pommel cap.
      form(ctx, c => c.roundRect(-1.5, -4, 3, 9, 0.8), WOOD, { line: 0.7 });
      for (const y of [-2.8, -1.4, 0, 1.4, 2.8]) stroke(ctx, [[-1.4, y + 0.5], [1.4, y - 0.3]], 0.35, BRASS, false);
      disc(ctx, 0, 5.6, 2, BRASS, { line: 0.7 });
      disc(ctx, 0, 5.6, 0.8, darken(BRASS, 0.6), { line: 0.3 });
      // Knuckle bow sweeping from the shell round the fingers to the pommel.
      smooth(ctx, [
        [1.6, -5.4], [5, -5], [6.8, -1.6], [6.6, 2.4], [4.4, 5.6], [1.6, 6.6], [1.4, 4.8],
        [3.6, 3.4], [4.6, 0.6], [4.2, -2.4], [1.6, -3.4],
      ], BRASS, { line: 0.7 });
      stroke(ctx, [[5.2, -3.6], [5.8, 0], [5, 3.6]], 0.35, BRASS_HI);
      scratch(ctx, 4.6, -1.6, 6.2, 0.4);
      // Scalloped shell guard over the hand, dented.
      smooth(ctx, [[-4.6, -5], [-3.6, -7.2], [0.6, -8], [5, -7.2], [6.2, -5], [0.8, -3.6]], BRASS, { line: 0.7 });
      for (const [x0, x1] of [[-2.6, -1.8], [-0.4, 0.2], [1.8, 2.2], [4, 4.2]]) stroke(ctx, [[x0, -7], [x1, -4.4]], 0.35, darken(BRASS, 0.5), false);
      glint(ctx, 2.8, -6.4, 1.2, 0.5, BRASS_HI, 0.8, -0.2);
      glint(ctx, -2.4, -5.4, 0.7, 0.45, darken(BRASS, 0.45), 0.8);
    },
  };
}

export default {
  id: 'pirate',
  mood: { shadow: 0.52, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head },
  weapon,
};
