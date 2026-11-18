import { INK, darken, lighten, smooth, hard, stroke, disc, glint, glow, band, form } from './kit.js';
import { part, body, scratch as metalScratch, rivet as stud } from './anatomy.js';

// Medieval knight, c.1200s, as a grim veteran: blackened plate over mail, a
// tattered blue surcoat with a worn gold cross, a great helm with a cold
// light in the slit, and a longsword that has seen too many winters.
const STEEL = '#3f434b';
const STEEL_DARK = '#2a2d34';
const STEEL_HI = '#8f96a2';
const MAIL = '#2b2d33';
const MAIL_HI = '#5a5e68';
const BLUE = '#1b2850';
const BLUE_DARK = '#111a36';
const GOLD = '#8c7234';
const GOLD_HI = '#c6a557';
const LEATHER = '#3b2416';
const LEATHER_DARK = '#20130c';
const BLADE = '#9aa3ab';
const RUST = '#5e3b22';
const BLOOD = '#4f0a11';
const ICE = '#a9d8ff';

const steelLine = darken(STEEL, 0.5);

const rivet = (ctx, x, y, r = 0.45, color = STEEL_HI) => stud(ctx, x, y, r, color);
const scratch = (ctx, x0, y0, x1, y1, hi = STEEL_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);

// Rows of mail links: offset scallops between two heights.
function mail(ctx, x0, x1, y0, y1) {
  for (let y = y0, row = 0; y <= y1; y += 1.8, row++) {
    for (let x = x0 + (row % 2) * 1.1; x + 2.2 <= x1 + 0.01; x += 2.2) {
      stroke(ctx, [[x, y], [x + 1.1, y + 0.9], [x + 2.2, y]], 0.3, MAIL_HI);
    }
  }
}

// A rust streak weeping down from a rivet or seam.
function rust(ctx, x, y, len) {
  stroke(ctx, [[x, y], [x + 0.2, y + len]], 0.5, RUST, false);
}

const torso = part('torso', (ctx) => {
  // Hauberk.
  body(ctx, 'torso', MAIL);
  mail(ctx, -9.4, -5, -32, -12);
  // Mail skirt hanging below the waist, hem dagged.
  hard(ctx, [[-9.6, -2], [9.6, -2], [10.4, 12.4], [8, 11], [5, 12.6], [2, 11], [-1, 12.6], [-4, 11], [-7, 12.6], [-10, 11]], MAIL, { line: 0.7 });
  mail(ctx, -8.6, 9.2, 0.4, 9.6);

  // Surcoat skirt: two panels split at the front, hems in rags.
  hard(ctx, [
    [-8.6, -8.4], [1.2, -8.8], [0.6, 4], [1.4, 11], [0, 15.6], [-1.6, 12], [-3.4, 17.8],
    [-5.4, 13], [-7.4, 16.4], [-9, 12], [-10.6, 14.4], [-10.4, 2],
  ], darken(BLUE, 0.85));
  stroke(ctx, [[-6.4, -6], [-7, 4], [-7.6, 12]], 0.5, BLUE_DARK);
  stroke(ctx, [[-2.6, -6], [-2.8, 5], [-3.4, 13.6]], 0.5, BLUE_DARK);
  hard(ctx, [
    [1.2, -8.8], [8.4, -9], [10.6, 2], [12, 11], [10.4, 17.4], [8.8, 13.4], [7, 18.6],
    [5.4, 14], [3.8, 16.4], [2.6, 9], [2.2, 0],
  ], BLUE);
  stroke(ctx, [[4.6, -6.4], [5, 4], [5.4, 12.6]], 0.5, BLUE_DARK);
  stroke(ctx, [[7.6, -6.4], [8.6, 4], [9.4, 12]], 0.5, BLUE_DARK);
  // Rents in the cloth and an old stain soaked into the hem.
  hard(ctx, [[6.2, 5.4], [7.2, 8.6], [6.4, 10.6], [5.8, 8]], MAIL, { line: 0.35 });
  hard(ctx, [[-5.6, 3], [-4.8, 6.4], [-5.8, 7.6]], MAIL, { line: 0.35 });
  glint(ctx, 8.8, 11, 1.8, 2.6, BLOOD, 0.75, 0.2);
  glint(ctx, -6.8, 11.4, 1.4, 2, BLOOD, 0.6, -0.2);

  // Surcoat over the chest.
  hard(ctx, [
    [-7.6, -36.4], [-3, -39.4], [3.6, -39], [8, -35.6], [11.6, -26.4], [9.2, -17], [8.4, -9],
    [-8.4, -8], [-9, -14], [-11, -24], [-10.4, -32.6],
  ], BLUE);
  stroke(ctx, [[-8.4, -30], [-7.4, -22], [-6.8, -12]], 0.5, BLUE_DARK);
  stroke(ctx, [[7.4, -20], [6.6, -15], [6.8, -10]], 0.5, BLUE_DARK);
  // Gold cross, flared at the ends, the thread worn through in places.
  hard(ctx, [[0.2, -32.6], [4.4, -32.9], [3.6, -30], [3.9, -15], [4.8, -12.2], [0.4, -11.9], [1.2, -15], [0.9, -30]], GOLD, { line: 0.5 });
  hard(ctx, [[-4.8, -27.8], [-2.4, -26.9], [6.8, -27.3], [9.4, -28.4], [9.6, -23.6], [6.9, -24.6], [-2.3, -24.2], [-4.6, -23.2]], GOLD, { line: 0.5 });
  stroke(ctx, [[1.9, -31.4], [2.2, -13.4]], 0.3, GOLD_HI, false);
  stroke(ctx, [[-3.4, -25.9], [8.4, -26.3]], 0.3, GOLD_HI, false);
  for (const [x0, y0, x1, y1] of [[1, -21.4, 3.6, -19.6], [4.6, -26.8, 6.2, -24.8], [-2.4, -26.4, -1, -24.6], [1.2, -16.6, 3.4, -17.6]]) {
    stroke(ctx, [[x0, y0], [x1, y1]], 0.7, BLUE, false);
  }
  // A cut through cloth to the mail, and blood dried black beside it.
  hard(ctx, [[-6.4, -21], [-2.4, -18.4], [-2.8, -17.4], [-6.6, -19.8]], MAIL, { line: 0.4 });
  glint(ctx, -4.2, -16.6, 1.6, 1, BLOOD, 0.7, 0.4);

  // Steel gorget at the throat.
  smooth(ctx, [[-6.4, -38.4], [0, -41.2], [6.2, -38], [7.2, -34.8], [0, -33.4], [-7.2, -35]], STEEL);
  stroke(ctx, [[-5.8, -36.4], [0, -35], [6.2, -36.2]], 0.4, steelLine);
  glint(ctx, 3.4, -37.6, 1.6, 0.6, STEEL_HI, 0.6, -0.2);
  for (const x of [-4.4, 0, 4.4]) rivet(ctx, x, -34.8 - Math.abs(x) * 0.12, 0.36);

  // Sword belt with a tarnished buckle and a hanging tongue.
  hard(ctx, [[-9.2, -11.4], [8.9, -12.2], [9.1, -8.2], [-9.3, -7.4]], LEATHER_DARK, { line: 0.8 });
  stroke(ctx, [[-8.6, -10.5], [8.4, -11.3]], 0.3, LEATHER, false);
  for (const x of [-6.6, -3.4, -0.2]) rivet(ctx, x, -9.5 - x * 0.04, 0.36, GOLD);
  hard(ctx, [[5.2, -8.6], [7.2, -8.8], [7.8, -1.6], [6.6, 0.2], [5.4, -1.4]], LEATHER, { line: 0.5 });
  form(ctx, c => c.roundRect(3.6, -12.6, 4.4, 4.8, 0.8), GOLD, { line: 0.6 });
  form(ctx, c => c.roundRect(4.7, -11.5, 2.2, 2.6, 0.4), LEATHER_DARK, { line: 0.35 });
});

const upperArm = part('upper_arm', (ctx) => {
  // Mail sleeve.
  body(ctx, 'upper_arm', MAIL);
  mail(ctx, -4.4, 4.4, 6.4, 9);
  // Rerebrace plate strapped over it.
  band(ctx, 7.6, 16.6, -5.7, 5.5, STEEL, { sag: 1 });
  stroke(ctx, [[1.6, 8.8], [1.4, 16.6]], 0.45, steelLine, false);
  stroke(ctx, [[2.4, 9], [2.2, 16.4]], 0.3, STEEL_HI, false);
  band(ctx, 11, 12.8, -5.6, -1.6, LEATHER_DARK, { sag: 0.4, line: 0.5 });
  rivet(ctx, -1.4, 12.1, 0.36, GOLD);
  rust(ctx, 3.8, 9.4, 4);
  // Couter over the elbow, with a fan wing behind.
  hard(ctx, [[-2.6, 17], [-6.4, 16], [-7, 19.6], [-5.6, 22.4], [-2.4, 22]], STEEL_DARK, { line: 0.6 });
  stroke(ctx, [[-2.8, 19.4], [-6.2, 18]], 0.35, steelLine, false);
  stroke(ctx, [[-2.8, 20.4], [-5.8, 21]], 0.35, steelLine, false);
  disc(ctx, 0.4, 19.6, 3.6, STEEL, { line: 0.7 });
  disc(ctx, 0.4, 19.6, 1.3, STEEL_DARK, { line: 0.4 });
  glint(ctx, 1.6, 18, 1.1, 0.5, STEEL_HI, 0.7, -0.4);

  // Pauldron: an upstanding neck guard, then three overlapping lames.
  hard(ctx, [[-6.4, -7.6], [-5.6, -13.6], [-2.8, -12.6], [1.4, -9.4]], STEEL_DARK, { line: 0.6 });
  stroke(ctx, [[-5.2, -12.4], [-2.8, -11.4], [0.6, -9]], 0.3, STEEL_HI);
  smooth(ctx, [[-7.2, -1], [0, -3.4], [7.6, -0.6], [8.2, 3.4], [4.4, 7.2], [-3.8, 7.2], [-7.8, 3.2]], STEEL_DARK);
  smooth(ctx, [[-7.6, -4.4], [0, -7.2], [8, -4], [8.6, 0.4], [4.6, 3.8], [-4, 3.8], [-8.2, 0.2]], STEEL);
  smooth(ctx, [[-7.2, -7], [0, -10.4], [7.6, -6.6], [8, -2.6], [4, 0.2], [-3.6, 0.2], [-7.6, -2.8]], STEEL);
  stroke(ctx, [[-6, -5.6], [0, -8.4], [6.4, -5.2]], 0.45, steelLine);
  glint(ctx, 3, -7.4, 2.4, 0.9, STEEL_HI, 0.65, 0.35);
  stroke(ctx, [[-6.6, 1.6], [-3.4, 2.9], [4, 2.9], [7.2, 1.8]], 0.3, STEEL_HI);
  stroke(ctx, [[-6.2, 5], [-3.2, 6.3], [3.8, 6.3], [6.8, 5.2]], 0.3, STEEL_HI);
  for (const [x, y] of [[-5.6, -1.6], [5.8, -1.4], [-6, 1.9], [6.4, 2], [-5.4, 5], [5.8, 5.2]]) rivet(ctx, x, y, 0.4);
  // A dent beaten into the top lame, blade marks, rust from the rivets.
  disc(ctx, -2.4, -4.8, 1.3, darken(STEEL, 0.72), { line: 0 });
  stroke(ctx, [[-3.4, -4], [-2.2, -3.5], [-1.2, -4.2]], 0.3, STEEL_HI);
  scratch(ctx, 1.4, -5.4, 5, -2.2);
  scratch(ctx, -4.8, 0.6, -1.6, 2.4);
  rust(ctx, 5.8, -0.8, 2.6);
  rust(ctx, -5.4, 5.6, 1.4);
});

const lowerArm = part('lower_arm', (ctx) => {
  // Vambrace: closed plate, a ridge down the front, a hinge behind.
  body(ctx, 'lower_arm', STEEL);
  stroke(ctx, [[1.6, -2], [1.9, 6], [1.3, 12.4]], 0.5, steelLine);
  stroke(ctx, [[2.4, -1.6], [2.7, 6], [2, 12]], 0.3, STEEL_HI);
  stroke(ctx, [[-2.6, -1.4], [-3, 5], [-2.2, 12]], 0.4, steelLine);
  for (const y of [1.6, 9.4]) {
    form(ctx, c => c.roundRect(-4.1, y - 1, 2.4, 2, 0.4), STEEL_DARK, { line: 0.4 });
    rivet(ctx, -2.6, y, 0.3);
  }
  band(ctx, 5, 6.6, -1.8, 4.6, LEATHER_DARK, { sag: 0.5, line: 0.5 });
  rivet(ctx, 3.2, 6.1, 0.34, GOLD);
  scratch(ctx, -0.8, 1.4, 1, 4.2);
  scratch(ctx, 2.6, 8.4, 3.6, 11);
  rust(ctx, -2.4, 2.8, 3);
  // Gauntlet: flared cuff, plated fist, spiked gadlings on the knuckles.
  body(ctx, 'fist', STEEL_DARK);
  stroke(ctx, [[-3.4, 21.6], [0.4, 22.4], [4, 21.4]], 0.4, INK);
  stroke(ctx, [[1.3, 22.4], [1.1, 23.8]], 0.4, INK, false);
  stroke(ctx, [[-1, 22.4], [-1.2, 23.9]], 0.4, INK, false);
  hard(ctx, [[-5.2, 12], [5.2, 11.6], [4.4, 18.2], [-4.2, 18.2]], STEEL, { line: 0.7 });
  stroke(ctx, [[-4.4, 13.3], [4.5, 12.9]], 0.3, STEEL_HI, false);
  stroke(ctx, [[-4.2, 16.4], [4.2, 16.2]], 0.4, steelLine, false);
  for (const x of [-3, 0, 3]) rivet(ctx, x, 14.7, 0.34);
  for (const x of [-2.2, 0.4, 3]) {
    hard(ctx, [[x - 0.8, 19.8], [x + 0.2, 18.2], [x + 1, 19.8], [x + 0.1, 20.8]], STEEL_HI, { line: 0.35 });
  }
});

const upperLeg = part('upper_leg', (ctx) => {
  // Mail chausses.
  body(ctx, 'upper_leg', MAIL);
  mail(ctx, -5.8, -1.2, 1.4, 21.4);
  // Cuisse over the front of the thigh, strapped round the back.
  band(ctx, 5.4, 7.4, -7, -1, LEATHER_DARK, { sag: 0.5, line: 0.5 });
  band(ctx, 16.4, 18.4, -6.3, -1, LEATHER_DARK, { sag: 0.5, line: 0.5 });
  smooth(ctx, [[-2.4, -1.4], [3, -3.4], [6.4, -1], [7.6, 9], [6.1, 19], [4.8, 24.6], [-1.8, 24.6], [-2.9, 12]], STEEL);
  stroke(ctx, [[2.6, -1.6], [3.6, 10], [2.6, 23]], 0.5, steelLine);
  stroke(ctx, [[3.6, -1], [4.6, 10], [3.5, 22.6]], 0.3, STEEL_HI);
  stroke(ctx, [[-1.6, 1.4], [2, 2.4], [6.4, 1.2]], 0.4, steelLine);
  for (const [x, y] of [[-1.4, 6.4], [-1.4, 17.4], [-0.6, 0.4], [5.4, 0.2]]) rivet(ctx, x, y, 0.38);
  disc(ctx, 0.6, 13.6, 1.2, darken(STEEL, 0.72), { line: 0 });
  stroke(ctx, [[-0.4, 14.4], [0.8, 14.9], [1.8, 14.2]], 0.3, STEEL_HI);
  scratch(ctx, 3.8, 5, 6, 8.4);
  scratch(ctx, -0.6, 19, 2, 21.6);
  rust(ctx, -1.2, 7.2, 4);
  // Poleyn: fan wing behind the knee, cop over it, a lame above.
  hard(ctx, [[-3.2, 25.4], [-7, 24], [-7.6, 28], [-6.4, 31.2], [-3.4, 30.4]], STEEL_DARK, { line: 0.6 });
  stroke(ctx, [[-3.6, 27], [-6.8, 26.2]], 0.35, steelLine, false);
  stroke(ctx, [[-3.6, 28.6], [-6.6, 29.4]], 0.35, steelLine, false);
  smooth(ctx, [[-3.6, 23.6], [1, 21.6], [5.8, 23.6], [6.8, 28], [3.8, 32.6], [-1.4, 32.8], [-4.4, 28.6]], STEEL);
  stroke(ctx, [[-3, 25.4], [1.2, 23.8], [5.6, 25.2]], 0.4, steelLine);
  stroke(ctx, [[1.6, 24.2], [2.8, 28], [1.6, 32]], 0.45, steelLine);
  glint(ctx, 3.8, 26.6, 1.3, 2, STEEL_HI, 0.55, 0.3);
  rivet(ctx, -2.6, 27.6, 0.4);
  rivet(ctx, 5, 29.2, 0.36);
});

const lowerLeg = part('lower_leg', (ctx) => {
  // Greave closed round the calf: dark back plate, front plate hinged to it.
  body(ctx, 'lower_leg', STEEL_DARK);
  stroke(ctx, [[-5, 5], [-5.4, 11], [-3.6, 19]], 0.4, INK);
  for (const y of [5.4, 14.6, 22.6]) {
    form(ctx, c => c.roundRect(-3.2, y - 1, 2.6, 2, 0.4), darken(STEEL, 0.8), { line: 0.4 });
    rivet(ctx, -1.9, y, 0.3);
  }
  smooth(ctx, [
    [-0.6, -3.6], [2.6, -4.2], [5, -2.4], [5.2, 8], [4, 20], [3.5, 27.4], [0.4, 28.6],
    [-0.6, 20], [-1.4, 10], [-1.2, 1],
  ], STEEL);
  stroke(ctx, [[2, -2.4], [2.6, 10], [1.8, 26.4]], 0.5, steelLine);
  stroke(ctx, [[3, -2], [3.6, 10], [2.7, 26]], 0.3, STEEL_HI);
  stroke(ctx, [[-0.8, 0.6], [2.2, 1.6], [5, 0.4]], 0.4, steelLine);
  stroke(ctx, [[-0.2, 24.4], [1.8, 25.2], [3.6, 24.2]], 0.4, steelLine);
  rivet(ctx, 0, 3.6, 0.36);
  rivet(ctx, 0.4, 22.4, 0.36);
  // Dents, a deep cut, mud and rust toward the ankle.
  disc(ctx, 3.6, 13.6, 1, darken(STEEL, 0.72), { line: 0 });
  scratch(ctx, 0.4, 7.4, 2.4, 10.6);
  scratch(ctx, 2.8, 17.4, 4.2, 20.6);
  rust(ctx, 0, 4.4, 4.6);
  rust(ctx, 3.4, 21, 3.4);
  glint(ctx, 1.4, 26.4, 1.8, 1, RUST, 0.55, 0.1);
});

const foot = part('foot', (ctx) => {
  // Sabaton: articulated lames running out to a long point.
  body(ctx, 'foot', STEEL);
  hard(ctx, [[4, -1], [9.4, 1.2], [12.2, 4.5], [8.6, 4.8], [4.6, 3]], STEEL, { line: 0.7 });
  for (const [x0, y0, x1, y1] of [[-0.6, -3, 0.6, 4.6], [2.2, -2.9, 3.2, 4.6], [4.6, -0.4, 5.6, 4.6], [7.2, 0.6, 7.8, 4.6], [9.4, 1.8, 9.8, 4.6]]) {
    stroke(ctx, [[x0, y0], [x1, y1]], 0.45, steelLine, false);
  }
  stroke(ctx, [[-2.6, -2], [2.4, -2.4], [6, 0.2], [10.4, 3]], 0.3, STEEL_HI);
  for (const [x, y] of [[1.4, 2.6], [4, 3], [6.6, 3.4]]) rivet(ctx, x, y, 0.3);
  // Sole, heel strap, and a prick spur.
  hard(ctx, [[-4.6, 4.3], [11.4, 4.3], [11.6, 5.8], [-4.8, 5.8]], LEATHER_DARK, { line: 0.6 });
  band(ctx, -0.4, 1.4, -4.2, 0.4, LEATHER, { sag: 0.4, line: 0.5 });
  stroke(ctx, [[-3.8, 0.8], [-5.8, 0.2]], 0.8, STEEL_HI, false);
  glint(ctx, 0.4, 3.6, 2.2, 0.6, RUST, 0.5);
});

const head = part('head', (ctx) => {
  // Mail aventail over the neck.
  body(ctx, 'neck', MAIL);
  smooth(ctx, [[-6.6, -2], [0, -1], [7.6, -1.6], [8.6, 3.2], [0, 4.2], [-7, 3.2]], MAIL, { line: 0.7 });
  mail(ctx, -5.6, 7.6, 0.2, 2.2);

  // Great helm: a barrel of riveted plates with a flat crown.
  hard(ctx, [
    [-8.8, -22.4], [8.6, -22.8], [9.8, -21], [10.6, -13], [11.8, -11], [10.8, -2.4], [8.2, 1.2],
    [-6.2, 0.4], [-9, -3], [-9.6, -12],
  ], STEEL);
  // Back plate seam and the lap of the lower plates.
  stroke(ctx, [[-2.4, -21.6], [-2.8, -11], [-2, 0.4]], 0.5, steelLine);
  stroke(ctx, [[-9.2, -10.4], [0, -10], [3, -10.2]], 0.5, steelLine);
  stroke(ctx, [[-9, -9.6], [0, -9.2], [3, -9.4]], 0.3, STEEL_HI);
  for (const y of [-19, -15, -6.6, -2.6]) rivet(ctx, -3.8, y, 0.38);
  for (const x of [-7.4, -0.6]) rivet(ctx, x, -11.3, 0.36);
  glint(ctx, 5.4, -19.4, 2.6, 1, STEEL_HI, 0.5, 0.1);

  // Brass cross reinforcing the face: one arm along the sights, one down
  // the front.
  hard(ctx, [[1.6, -15.6], [11.2, -16.2], [11.6, -10.6], [1.8, -10.2]], GOLD, { line: 0.6 });
  hard(ctx, [[6.4, -22.6], [8.6, -22.8], [9.8, -16], [11, -9], [10.2, -2.6], [8.4, 1], [6.6, 0.8], [8, -4], [8.4, -10], [7.4, -16]], GOLD, { line: 0.6 });
  stroke(ctx, [[2.4, -15], [10.6, -15.5]], 0.3, GOLD_HI, false);
  for (const [x, y] of [[2.6, -11.2], [5, -11.3], [2.6, -14.6], [5, -14.8], [7.6, -19.6], [9.2, -6.6], [8.6, -1]]) rivet(ctx, x, y, 0.34, GOLD_HI);
  // Sights: a narrow slit with something cold behind it.
  glow(ctx, 4.6, -12.9, 2.8, ICE);
  glow(ctx, 9, -13.2, 2.4, ICE);
  hard(ctx, [[2.2, -13.5], [6.6, -13.8], [6.6, -12.5], [2.2, -12.3]], '#07090c', { line: 0.4 });
  hard(ctx, [[8.2, -13.9], [11, -14.1], [11.1, -12.8], [8.2, -12.6]], '#07090c', { line: 0.4 });
  stroke(ctx, [[3.2, -12.9], [5.8, -13.1]], 0.4, ICE, false);
  stroke(ctx, [[8.8, -13.3], [10.4, -13.4]], 0.4, ICE, false);
  // Breaths: punched holes low on the cheek.
  for (const [x, y] of [[2.6, -7.6], [4.4, -7.7], [6.2, -7.8], [2.8, -5.6], [4.6, -5.7], [6.4, -5.8], [3.4, -3.6], [5.2, -3.7]]) {
    glint(ctx, x, y, 0.42, 0.42, '#07090c', 1);
  }

  // Flat crown plate lapped over the barrel.
  hard(ctx, [[-9.4, -23.6], [9.2, -24], [10, -21.8], [-9.8, -21.4]], lighten(STEEL, 0.08), { line: 0.7 });
  stroke(ctx, [[-8.6, -23], [8.6, -23.4]], 0.3, STEEL_HI, false);
  for (const x of [-7.2, -3.6, 0, 3.6]) rivet(ctx, x, -22.3 - x * 0.02, 0.34);
  // What it has taken: a dent, cuts across the brow, rust from the rivets.
  disc(ctx, -6, -16.6, 1.5, darken(STEEL, 0.72), { line: 0 });
  stroke(ctx, [[-7.2, -15.8], [-5.8, -15.1], [-4.6, -16]], 0.3, STEEL_HI);
  scratch(ctx, -1, -20, 4, -16.6);
  scratch(ctx, 0, -6.4, 1.8, -2.4);
  scratch(ctx, -7.6, -8, -5, -4.4);
  rust(ctx, -3.8, -14.4, 2.8);
  rust(ctx, -0.6, -10.6, 3.4);
  rust(ctx, 9.2, -6, 2.6);
});

// Longsword, drawn tip-up from the grip. `length` is grip-to-tip in rig units.
function weapon(length) {
  return {
    box: [-9, -length - 2, 9, 9],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      // Blade: long, straight, barely tapering; nicked on the leading edge.
      hard(ctx, [
        [-2.2, -7], [-2, -L * 0.5], [-1.5, -L * 0.88], [0, -L], [1.5, -L * 0.88],
        [1.85, -L * 0.66], [1.2, -L * 0.645], [1.8, -L * 0.62], [1.95, -L * 0.46],
        [1.4, -L * 0.45], [2, -L * 0.43], [2.2, -7],
      ], BLADE, { shadow: darken(BLADE, 0.55), light: [1.5, 0] });
      // Fuller down two thirds of the blade.
      stroke(ctx, [[0, -8], [0, -L * 0.66]], 1.1, darken(BLADE, 0.55), false);
      stroke(ctx, [[0.35, -8.4], [0.35, -L * 0.64]], 0.3, '#dfe5ea', false);
      stroke(ctx, [[0, -L * 0.68], [0, -L + 3]], 0.35, darken(BLADE, 0.6), false);
      // Stains: rust blooms, blood dried along the last third.
      glint(ctx, -1, -L * 0.3, 0.8, 2, RUST, 0.55);
      glint(ctx, 1.1, -L * 0.54, 0.6, 1.6, RUST, 0.5);
      hard(ctx, [[-1.5, -L * 0.86], [0, -L + 0.7], [1.5, -L * 0.87], [1.2, -L * 0.76], [0.5, -L * 0.8], [0.1, -L * 0.7], [-0.6, -L * 0.78], [-1.3, -L * 0.74]], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [[-1, -L * 0.74], [-0.9, -L * 0.6]], 0.45, BLOOD, false);
      scratch(ctx, -1.6, -L * 0.2, -0.6, -L * 0.26, '#dfe5ea');
      // Wide crossguard, flared at the ends.
      hard(ctx, [[-8, -8.2], [-6.6, -7.6], [6.6, -7.6], [8, -8.2], [8.2, -5.2], [6.6, -5.6], [-6.6, -5.6], [-8.2, -5.2]], STEEL, { line: 0.7 });
      stroke(ctx, [[-6.4, -7], [6.4, -7]], 0.3, STEEL_HI, false);
      form(ctx, c => c.roundRect(-1.7, -8.2, 3.4, 3.2, 0.5), STEEL_DARK, { line: 0.5 });
      // Two-hand grip bound in leather over cord.
      form(ctx, c => c.roundRect(-1.3, -5.2, 2.6, 9.6, 0.7), LEATHER, { line: 0.7 });
      for (let y = -4.4; y <= 3.4; y += 1.3) stroke(ctx, [[-1.2, y + 0.5], [1.2, y - 0.3]], 0.35, LEATHER_DARK, false);
      stroke(ctx, [[-1.3, -0.4], [1.3, -0.4]], 0.6, GOLD, false);
      // Wheel pommel.
      disc(ctx, 0, 6.2, 2.2, STEEL, { line: 0.7 });
      disc(ctx, 0, 6.2, 1, GOLD, { line: 0.35 });
      glint(ctx, 0.6, 5.5, 0.5, 0.3, STEEL_HI, 0.8);
    },
  };
}

export default {
  id: 'knight',
  // Cold, heavy shadows on dark steel.
  mood: { shadow: 0.52, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head },
  weapon,
};
