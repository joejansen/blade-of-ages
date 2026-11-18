import { INK, darken, lighten, smooth, hard, stroke, disc, glint, band, form } from './kit.js';
import { part, body, face, scar as skinScar, scratch as metalScratch, rivet as stud, at } from './anatomy.js';

// Mongol warrior, c.1220, off the steppe and a long way into someone else's
// country: black lacquered lamellar laced in red over an olive deel, a fur-
// brimmed spike helm, felt riding boots and a sabre that has been used.
const SKIN = '#9a6a42';
const HAIR = '#15100c';
const DEEL = '#393c23';
const DEEL_TRIM = '#6d5b2c';
const TROUSER = '#2e2a20';
const LAMELLAR = '#2d2828';
const LAM_HI = '#85776a';
const LACE = '#7c2618';
const SASH = '#8a4a1c';
const IRON = '#494c54';
const IRON_HI = '#959ba5';
const FUR = '#44352a';
const FELT = '#6f6955';
const LEATHER = '#472b1a';
const LEATHER_DARK = '#27170e';
const BOOT = '#33221a';
const WOOD = '#4c3420';
const PLUME = '#6a1416';
const STEEL = '#a8b0b8';
const BRASS = '#7d6128';
const BLOOD = '#5c0a12';

const crease = darken(SKIN, 0.5);
const deelFold = darken(DEEL, 0.48);
const lamLine = darken(LAMELLAR, 0.45);
const furLine = darken(FUR, 0.45);

const rivet = (ctx, x, y, r = 0.45, color = IRON_HI) => stud(ctx, x, y, r, color);
const scar = (ctx, pts, width) => skinScar(ctx, SKIN, pts, width);
const scratch = (ctx, x0, y0, x1, y1, hi = LAM_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);

// Lamellar: rows of small upright plates between a back and a front edge,
// each row lipped over the next and laced through the middle.
function lamellar(ctx, y0, y1, back, front, step = 4) {
  for (let y = y0; y < y1 - 0.5; y += step) {
    const mid = y + step / 2;
    const xa = Math.max(at(back, y), at(back, y + step)) + 0.9;
    const xb = Math.min(at(front, y), at(front, y + step)) - 0.9;
    stroke(ctx, [[xa - 0.3, y], [xb + 0.3, y]], 0.55, lamLine, false);
    stroke(ctx, [[xa, y + 0.75], [xb, y + 0.75]], 0.25, LAM_HI, false);
    for (let x = xa + 1.2; x < xb - 0.4; x += 1.9) {
      stroke(ctx, [[x, y + 0.7], [x, y + step - 0.4]], 0.3, lamLine, false);
    }
    for (let x = xa + 0.3; x < xb - 0.8; x += 1.9) {
      stroke(ctx, [[x, mid], [x + 0.75, mid]], 0.45, LACE, false);
    }
  }
}

const CUIRASS_BACK = [[-37, -7], [-32, -10.4], [-24, -11.8], [-16, -9.6], [-9.6, -9.4]];
const CUIRASS_FRONT = [[-36.4, 7.4], [-32, 11.6], [-26, 12.6], [-17, 10.2], [-10, 9.4]];

const torso = part('torso', (ctx) => {
  body(ctx, 'torso', DEEL);
  // Skirt of the deel, flaring from the belt, wrapped over at the front.
  hard(ctx, [
    [-10.4, -5], [9.6, -5.4], [12.6, 6], [13.6, 15.4], [9, 16.6], [4, 15.6], [2.6, 16.6],
    [-4, 15.4], [-9, 16.6], [-12.6, 15], [-11.6, 5],
  ], DEEL);
  stroke(ctx, [[2.6, -5], [3.4, 6], [2.6, 16.2]], 0.6, deelFold);
  stroke(ctx, [[3.5, -4.6], [4.3, 6], [3.6, 15.4]], 0.5, DEEL_TRIM);
  stroke(ctx, [[-7.6, 5], [-8.6, 15.6]], 0.5, deelFold, false);
  stroke(ctx, [[-2.4, 6], [-3, 14.8]], 0.5, deelFold, false);
  stroke(ctx, [[8, 6], [9.6, 15.6]], 0.5, deelFold, false);
  stroke(ctx, [[-12, 13.6], [-9, 15.2], [-4, 14], [2.4, 15]], 0.55, DEEL_TRIM);
  stroke(ctx, [[4.2, 14.2], [9, 15.2], [13.2, 14]], 0.55, DEEL_TRIM);
  // Mud and a tear at the hem.
  hard(ctx, [[10.4, 16.2], [11.2, 12.4], [12, 15.9]], INK, { line: 0 });
  glint(ctx, -6, 12.6, 1.8, 1, darken(DEEL, 0.55), 0.8, 0.3);

  // Bow case at the back hip, the nocked tip of the bow standing out of it.
  stroke(ctx, [[-10.4, -9], [-12.4, -16], [-11.6, -21.6]], 1.5, INK);
  stroke(ctx, [[-10.4, -9], [-12.4, -16], [-11.6, -21.6]], 0.8, WOOD);
  stroke(ctx, [[-11.9, -19.4], [-11, -19.2]], 0.5, BRASS, false);
  hard(ctx, [[-13, -8.6], [-8.8, -10], [-6, 3.6], [-8.2, 9.4], [-11.6, 8.6]], LEATHER, { line: 0.7 });
  stroke(ctx, [[-11.6, -7.4], [-8.4, 3.2], [-9.4, 7.6]], 0.3, lighten(LEATHER, 0.3));
  hard(ctx, [[-13, -8.6], [-8.8, -10], [-8.2, -7.2], [-12.6, -5.8]], LEATHER_DARK, { line: 0.5 });
  rivet(ctx, -10.6, -7.8, 0.4, BRASS);
  rivet(ctx, -9.4, 5.4, 0.4, BRASS);

  // Lamellar skirts hanging from the cuirass over each hip.
  hard(ctx, [[-9.4, -5], [-1, -5.4], [-0.6, 6.4], [-10.2, 7]], LAMELLAR, { line: 0.7 });
  hard(ctx, [[1.2, -5.4], [9.6, -5.6], [11.4, 6], [1.6, 6.6]], LAMELLAR, { line: 0.7 });
  lamellar(ctx, -5, 7, [[-5, -9.4], [7, -10.2]], [[-5, -1], [7, -0.6]]);
  lamellar(ctx, -5.2, 6.8, [[-5.4, 1.2], [6.6, 1.6]], [[-5.6, 9.6], [6.2, 11.4]]);
  stroke(ctx, [[-10, 6.2], [-0.8, 5.6]], 0.6, LACE, false);
  stroke(ctx, [[1.8, 5.8], [11.2, 5.2]], 0.6, LACE, false);

  // Cuirass: black lacquered plates in rows, red lacing, a bound top edge.
  smooth(ctx, [
    [-10.4, -32], [-7, -37], [-3, -39.6], [3.4, -39.4], [7.4, -36.4], [11.6, -32],
    [12.6, -26], [10.2, -17], [9.4, -10], [0, -8.8], [-9.4, -9.6], [-9.6, -16],
    [-11.8, -24],
  ], LAMELLAR);
  lamellar(ctx, -33.6, -9.6, CUIRASS_BACK, CUIRASS_FRONT);
  stroke(ctx, [[-9.4, -32.6], [-6.4, -36.6], [-2.8, -38.8], [3.2, -38.6], [7, -35.8], [10.6, -32.2]], 0.9, LEATHER);
  glint(ctx, 9, -27.6, 1.8, 0.8, LAM_HI, 0.45, -0.5);
  // A plate torn out, lacing hanging; blade marks; blood dried in the rows.
  hard(ctx, [[4.4, -24.8], [6.3, -24.8], [6.3, -22], [4.4, -22]], darken(DEEL, 0.6), { line: 0.4 });
  stroke(ctx, [[4.8, -22], [4.4, -19.4]], 0.4, LACE, false);
  scratch(ctx, -6.4, -29.6, -2.2, -25.4);
  scratch(ctx, 1.4, -17.4, 5.6, -14.2);
  glint(ctx, -3.4, -14.4, 1.4, 0.7, BLOOD, 0.85, 0.2);
  stroke(ctx, [[-3.2, -14.2], [-3, -11.4]], 0.45, BLOOD, false);

  // Sash wound twice round the waist, knotted at the front, ends hanging.
  hard(ctx, [[5, -6.4], [7.4, -6.6], [8.4, 3.4], [6.9, 1.6], [5.8, 4.6], [4.6, 2]], darken(SASH, 0.8), { line: 0.5 });
  hard(ctx, [[-9.8, -10.8], [9.6, -11.8], [9.9, -5.2], [-10, -4.2]], SASH, { line: 0.8 });
  stroke(ctx, [[-9.6, -7.4], [0, -8.4], [9.6, -8.4]], 0.5, darken(SASH, 0.5));
  stroke(ctx, [[-9.4, -5.8], [-2, -6.4], [3, -6.6]], 0.35, darken(SASH, 0.5));
  stroke(ctx, [[-6, -9.8], [2, -10.4]], 0.3, lighten(SASH, 0.25), false);
  smooth(ctx, [[4.4, -9.6], [6.6, -10.4], [8.4, -8.6], [7.8, -6], [5.4, -5.6], [4, -7.4]], darken(SASH, 0.85), { line: 0.6 });
  stroke(ctx, [[5.2, -8.6], [7.2, -7]], 0.35, darken(SASH, 0.45), false);
});

const upperArm = part('upper_arm', (ctx) => {
  // Deel sleeve, full and creased.
  body(ctx, 'upper_arm', DEEL);
  stroke(ctx, [[2.2, 8], [3.6, 13], [2.8, 19]], 0.55, deelFold);
  stroke(ctx, [[-3.6, 9], [-2.6, 14], [-3, 19]], 0.5, deelFold);
  stroke(ctx, [[-4.4, 17], [0, 18.8], [3.8, 17.2]], 0.45, deelFold);
  stroke(ctx, [[4.6, 9], [4.2, 15]], 0.3, lighten(DEEL, 0.2), false);
  // Lamellar shoulder flap hung from the collar, edged in leather.
  hard(ctx, [
    [-7, -7], [-3, -10], [3.4, -10], [7.4, -6.6], [7.8, 6.6], [4, 8.2], [0, 7.4],
    [-4, 8.4], [-7.6, 6.8],
  ], LAMELLAR);
  lamellar(ctx, -6.4, 6.6, -7, 7.2, 3.2);
  stroke(ctx, [[-6.6, -6.8], [-2.8, -9.4], [3.2, -9.4], [7, -6.4]], 0.9, LEATHER);
  stroke(ctx, [[-7.2, 6.4], [-4, 7.8], [0, 6.8], [4, 7.6], [7.4, 6.2]], 0.7, LACE);
  rivet(ctx, -4.4, -7.6, 0.42, BRASS);
  rivet(ctx, 4.6, -7.6, 0.42, BRASS);
  scratch(ctx, -3.6, -3.4, 0.6, 1);
  // One plate cracked across.
  stroke(ctx, [[3.2, 0.4], [4.4, 1.6], [3.8, 2.8]], 0.35, INK);
});

const lowerArm = part('lower_arm', (ctx) => {
  body(ctx, 'lower_arm', DEEL);
  stroke(ctx, [[-3.6, -0.6], [0, 1.2], [3.8, -0.4]], 0.5, deelFold);
  stroke(ctx, [[-4, 2], [0, 3.6]], 0.4, deelFold, false);
  // Fist.
  body(ctx, 'fist', SKIN);
  stroke(ctx, [[1.4, 21.4], [1.2, 23.6]], 0.45, crease, false);
  stroke(ctx, [[-0.9, 21.5], [-1.1, 23.8]], 0.45, crease, false);
  stroke(ctx, [[-3, 19.6], [3.8, 20]], 0.4, crease, false);
  // Archer's thumb ring.
  band(ctx, 21.6, 22.8, 2, 4.2, '#8f866c', { sag: 0.2, line: 0.4 });
  // Deep cuff of the sleeve, turned back over the wrist.
  hard(ctx, [[-3.9, 14.2], [4, 14], [4.4, 18], [-3.9, 18.4]], darken(DEEL, 0.8), { line: 0.6 });
  stroke(ctx, [[-3.5, 17.2], [4, 16.9]], 0.5, DEEL_TRIM, false);
  // Leather vambrace with iron splints, buckled behind.
  hard(ctx, [[-5, 3.6], [4.8, 3.4], [3.9, 14.6], [-3.8, 14.8]], LEATHER, { line: 0.7 });
  for (const x of [-2.6, 0, 2.6]) {
    hard(ctx, [[x - 0.8, 4.4], [x + 0.8, 4.4], [x + 0.65, 13.8], [x - 0.65, 13.8]], IRON, { line: 0.45 });
    stroke(ctx, [[x + 0.2, 5], [x + 0.15, 13.2]], 0.25, IRON_HI, false);
    rivet(ctx, x, 5.4, 0.3);
    rivet(ctx, x, 12.8, 0.3);
  }
  stroke(ctx, [[-4.6, 7], [-3.6, 7.2]], 0.7, LEATHER_DARK, false);
  stroke(ctx, [[-4.2, 11.4], [-3.4, 11.6]], 0.7, LEATHER_DARK, false);
  scratch(ctx, -1.6, 7.4, 1.6, 10.4, IRON_HI);
});

const upperLeg = part('upper_leg', (ctx) => {
  // Loose riding trousers, quilted, shiny on the inside from the saddle.
  body(ctx, 'upper_leg', TROUSER);
  const fold = darken(TROUSER, 0.45);
  stroke(ctx, [[2.8, 1], [4.6, 12], [3.4, 24]], 0.6, fold);
  stroke(ctx, [[-3.8, 3], [-2.6, 14], [-3.2, 24]], 0.5, fold);
  for (const y of [7, 12, 17, 22]) stroke(ctx, [[-5.6, y + 1], [0, y - 0.6], [5.8, y + 0.6]], 0.3, lighten(TROUSER, 0.16));
  stroke(ctx, [[-4.4, 26], [0, 28.4], [4.4, 26.4]], 0.55, fold);
  glint(ctx, 3.4, 15, 1, 3.2, lighten(TROUSER, 0.3), 0.3);
  // Patch of hide sewn over the knee.
  hard(ctx, [[-3.2, 22.6], [3.6, 22.2], [3.8, 28], [0, 29.6], [-3.4, 28.2]], darken(LEATHER, 0.8), { line: 0.5 });
  for (const [x, y] of [[-2.4, 23.4], [0.2, 23], [2.8, 23], [-2.6, 27.4], [3, 27.2]]) {
    stroke(ctx, [[x, y], [x + 0.2, y + 1]], 0.3, FELT, false);
  }
});

const lowerLeg = part('lower_leg', (ctx) => {
  // Tall riding boot: leather shaft, a thick felt top, appliqué up the side.
  body(ctx, 'lower_leg', BOOT);
  const seam = darken(BOOT, 0.45);
  stroke(ctx, [[0.6, 4], [0.2, 16], [0.4, 28]], 0.45, seam);
  stroke(ctx, [[1.4, 4], [1, 16], [1.2, 28]], 0.25, lighten(BOOT, 0.25));
  // Ankle creases.
  stroke(ctx, [[-3.2, 22.6], [0, 24], [3, 22.8]], 0.5, seam);
  stroke(ctx, [[-3, 25.6], [0, 26.8], [2.9, 25.8]], 0.5, seam);
  // Cloud-scroll appliqué, worn.
  stroke(ctx, [[-4, 9], [-2.2, 7], [-1.2, 9.6], [-3, 11.4], [-4.4, 13.6], [-2.4, 15.4]], 0.5, DEEL_TRIM);
  stroke(ctx, [[2.2, 8], [3.6, 10], [2.4, 12.4], [3.2, 15]], 0.5, DEEL_TRIM);
  // Felt stocking top standing above the leather, bound with a thong.
  hard(ctx, [[-5.6, -4.6], [0, -6.4], [5.6, -4.6], [5.9, 4], [0, 5.4], [-6.2, 4.2]], FELT, { line: 0.7 });
  stroke(ctx, [[-5.6, 2.4], [0, 3.6], [5.6, 2.2]], 0.6, LEATHER_DARK);
  stroke(ctx, [[-5.2, -2.6], [0, -4.2], [5.2, -2.8]], 0.4, darken(FELT, 0.55));
  for (const x of [-3.6, -1.2, 1.2, 3.6]) stroke(ctx, [[x, -1.6], [x + 0.2, 1.4]], 0.3, darken(FELT, 0.55), false);
  stroke(ctx, [[3.6, 3], [4.6, 6.4]], 0.5, LEATHER_DARK, false);
  // Stirrup wear and dried mud.
  scratch(ctx, -2.6, 18.4, 0.6, 20.4, lighten(BOOT, 0.35));
  glint(ctx, 1.6, 20.6, 1.6, 1, darken(BOOT, 0.5), 0.8, 0.4);
});

const foot = part('foot', (ctx) => {
  body(ctx, 'foot', BOOT);
  // Upturned toe.
  hard(ctx, [[7.6, 0.8], [10.4, 1.4], [11.9, -1.2], [12.3, 1.6], [11.2, 4.4], [7.4, 4.6]], BOOT, { line: 0.8 });
  stroke(ctx, [[10.6, 1.8], [11.8, -0.4]], 0.3, lighten(BOOT, 0.3), false);
  // Vamp seam and trim.
  stroke(ctx, [[2.6, -2.8], [5, 0.4], [8.4, 2]], 0.5, DEEL_TRIM);
  stroke(ctx, [[-3.4, -1], [0, 0.2], [3.4, -1.2]], 0.45, darken(BOOT, 0.45));
  stroke(ctx, [[-3.6, 1.2], [0, 2.2], [4, 1.6]], 0.4, darken(BOOT, 0.45));
  // Thick layered felt sole, stitched.
  hard(ctx, [[-4.5, 4], [11.4, 4], [11.9, 6.2], [-4.7, 6.2]], FELT, { line: 0.6 });
  stroke(ctx, [[-4.2, 5.1], [11.4, 5.1]], 0.3, darken(FELT, 0.5), false);
  for (const x of [-3, -0.6, 1.8, 4.2, 6.6, 9]) stroke(ctx, [[x, 4.4], [x + 0.4, 4.8]], 0.3, LEATHER_DARK, false);
});

const head = part('head', (ctx) => {
  face(ctx, SKIN, { hair: HAIR, beard: 'moustache', eye: INK });
  // Thin moustache drooping past the mouth, a wisp on the chin.
  stroke(ctx, [[10.2, -8], [10.8, -4.6], [10, -1.6]], 0.8, HAIR);
  stroke(ctx, [[7.4, -8.2], [7, -5.4], [7.4, -3.4]], 0.6, HAIR);
  hard(ctx, [[7, -2.6], [9, -3], [8.4, 1.8]], HAIR, { line: 0.4 });
  // Sword cut from the cheekbone to the jaw; a hard line by the mouth.
  scar(ctx, [[8, -12], [5.6, -8.6], [4.4, -4.4]], 0.65);
  for (const [x, y] of [[6.9, -10.4], [5.4, -7.6], [4.8, -5.6]]) stroke(ctx, [[x - 0.9, y - 0.4], [x + 0.9, y + 0.4]], 0.3, crease, false);
  stroke(ctx, [[2.6, -9.6], [3.6, -6.4]], 0.4, crease, false);

  // Leather neck and ear flaps hanging from the helm, stitched, iron-studded.
  hard(ctx, [
    [-8.4, -14.6], [1.8, -15], [2.2, -8], [0.4, -3.6], [-2.6, 0.6], [-7.6, 2.8],
    [-10.8, -1.4], [-9.8, -9],
  ], LEATHER, { line: 0.8 });
  stroke(ctx, [[1.2, -13.6], [1.4, -8.2], [-0.2, -4.2], [-3, -0.4], [-7.4, 1.6]], 0.3, lighten(LEATHER, 0.35));
  stroke(ctx, [[-3.6, -14], [-4.2, -6], [-5.6, 1]], 0.45, LEATHER_DARK);
  stroke(ctx, [[-9.2, -8.4], [-4.2, -9.2], [1.6, -9.6]], 0.4, LEATHER_DARK);
  stroke(ctx, [[-10, -3.4], [-5, -4.2], [0.2, -4.6]], 0.4, LEATHER_DARK);
  for (const [x, y] of [[-6.8, -11.6], [-1.4, -12], [-7.4, -6.4], [-1.8, -7], [-7.2, -1.4], [-3.4, -2]]) rivet(ctx, x, y, 0.36);
  // Braided queue escaping behind the flap.
  hard(ctx, [[-9.6, -3], [-11.4, -1.8], [-12.2, 2.6], [-10.8, 3.6], [-9.6, 0]], HAIR, { line: 0.4 });

  // Horsehair plume streaming back from the spike.
  hard(ctx, [
    [0.4, -36.4], [0.2, -39.4], [-3, -39.8], [-7, -37.6], [-10.4, -33.6], [-12, -29],
    [-9.4, -31.6], [-9.6, -28], [-6.6, -32.2], [-6, -29.6], [-3.2, -33.6], [-1.6, -32.4],
    [-0.4, -35],
  ], PLUME);
  for (const [x0, y0, x1, y1] of [[-1.4, -37.6, -9.2, -32.6], [-2, -36, -7.6, -31.6], [-3.4, -38.4, -10.4, -31.4]]) {
    stroke(ctx, [[x0, y0], [x1, y1]], 0.35, darken(PLUME, 0.45), false);
  }
  // Pointed helm built of iron segments, a spike on a rosette at the crown.
  hard(ctx, [[-0.5, -30], [0.5, -37], [1.7, -30]], IRON, { line: 0.6 });
  smooth(ctx, [
    [-8.6, -15.4], [-8, -19.6], [-5, -24.4], [-0.8, -28.6], [0.6, -31.2], [2, -28.4],
    [6, -24], [9.2, -19.4], [9.8, -15.6], [0, -14.6],
  ], IRON);
  glint(ctx, 5, -21.6, 2, 1, IRON_HI, 0.5, 0.7);
  stroke(ctx, [[0.6, -30], [-1.6, -22], [-2.4, -16]], 0.5, darken(IRON, 0.5));
  stroke(ctx, [[1, -30], [4.6, -22], [6, -16]], 0.5, darken(IRON, 0.5));
  stroke(ctx, [[1.6, -29.4], [5.2, -22], [6.6, -16.4]], 0.25, IRON_HI);
  for (const [x, y] of [[-0.9, -26], [-2, -20.4], [3, -26], [5.2, -20.4]]) rivet(ctx, x, y, 0.32);
  disc(ctx, 0.6, -30.2, 1.3, BRASS, { line: 0.5 });
  scratch(ctx, -6.4, -21.6, -3.6, -18.4, IRON_HI);
  // Fur brim.
  hard(ctx, [
    [-9.8, -17.4], [-7, -18.6], [-4, -17.6], [-1, -18.8], [2, -17.8], [5, -19], [8, -17.8],
    [10.8, -18.4], [11.8, -16], [10.6, -14.2], [8, -15], [5, -14.2], [2, -14.8],
    [-1, -13.2], [-4, -14.2], [-7, -13], [-10, -13.8], [-11, -15.8],
  ], FUR);
  for (const x of [-8.4, -5.6, -2.8, 0, 2.8, 5.6, 8.4]) stroke(ctx, [[x, -17.2], [x - 0.6, -14.8]], 0.4, furLine, false);
  stroke(ctx, [[-9, -17], [-4, -17], [2, -17.2], [10, -17.4]], 0.3, lighten(FUR, 0.2));
}, { box: [-16, -42, 17, 5] });

// Sabre, drawn tip-up from the grip. `length` is grip-to-tip in rig units.
// The cutting edge is on +x; the blade bows forward, then sweeps back (-x)
// to the point.
function weapon(length) {
  return {
    box: [-10, -length - 2, 6, 8],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      // Blade: single-edged, widening into a yelman before the point.
      hard(ctx, [
        [1.8, -4.6], [2.8, -L * 0.2], [3.8, -L * 0.4], [4, -L * 0.55], [3.5, -L * 0.7],
        [2.1, -L * 0.83], [-0.2, -L * 0.94], [-2.8, -L], [-1.9, -L * 0.9], [-0.9, -L * 0.8],
        [-0.2, -L * 0.77], [0.5, -L * 0.7], [1, -L * 0.55], [0.8, -L * 0.4],
        [-0.2, -L * 0.2], [-1.2, -4.6],
      ], STEEL, { shadow: darken(STEEL, 0.58), light: [1.3, 0] });
      // Fuller near the back, bright line along the edge.
      stroke(ctx, [[-0.2, -6], [0.6, -L * 0.2], [1.7, -L * 0.4], [1.9, -L * 0.55], [1.5, -L * 0.68]], 0.5, darken(STEEL, 0.5));
      stroke(ctx, [[2.5, -L * 0.22], [3.4, -L * 0.4], [3.6, -L * 0.55], [3.1, -L * 0.7], [1.8, -L * 0.82]], 0.35, '#e9eef2');
      // Nicks in the edge.
      hard(ctx, [[4.1, -L * 0.5], [3.1, -L * 0.48], [4, -L * 0.455]], INK, { line: 0 });
      hard(ctx, [[3.3, -L * 0.74], [2.5, -L * 0.735], [2.9, -L * 0.775]], INK, { line: 0 });
      scratch(ctx, 0.4, -L * 0.34, 1.8, -L * 0.28, '#e9eef2');
      // Blood on the last third, a run down the fuller.
      hard(ctx, [
        [3.2, -L * 0.72], [2.1, -L * 0.83], [-0.2, -L * 0.94], [-2.5, -L + 0.5], [-1.6, -L * 0.9],
        [-0.4, -L * 0.8], [0.4, -L * 0.74], [1.2, -L * 0.78], [1.6, -L * 0.68], [2.4, -L * 0.73],
      ], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [[1.6, -L * 0.69], [1.9, -L * 0.56]], 0.5, BLOOD, false);
      // Iron collar and small disc guard, seen edge-on.
      hard(ctx, [[1.9, -7.4], [-1.3, -7.4], [-1.5, -4.8], [2.1, -4.8]], darken(IRON, 0.85), { line: 0.5 });
      form(ctx, c => c.roundRect(-3.8, -5.4, 7.8, 2.2, 1), IRON, { line: 0.7 });
      stroke(ctx, [[3.2, -4.7], [-3, -4.7]], 0.3, IRON_HI, false);
      // Canted grip bound in leather cord, iron cap, a wrist loop.
      hard(ctx, [[1.5, -3.3], [-1.3, -3.3], [-2, 1], [-3, 4.6], [-0.5, 5.4], [0.9, 1.4]], WOOD, { line: 0.7 });
      for (const y of [-2.4, -0.9, 0.6, 2.1, 3.6]) {
        const lean = (y + 2.4) * 0.22;
        stroke(ctx, [[1.3 - lean, y + 0.5], [-1.4 - lean, y - 0.2]], 0.4, LEATHER, false);
      }
      hard(ctx, [[-0.3, 4.6], [-3, 3.8], [-3.6, 6.2], [-1.1, 7.1]], IRON, { line: 0.6 });
      stroke(ctx, [[-2.6, 5.4], [-4.6, 3.4], [-5.2, 0.4]], 0.5, LACE);
      disc(ctx, -5.2, 0, 0.7, PLUME, { line: 0.4 });
    },
  };
}

export default {
  id: 'mongol',
  mood: { shadow: 0.52, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head },
  weapon,
};
