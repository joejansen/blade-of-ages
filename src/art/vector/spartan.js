import { INK, darken, lighten, smooth, hard, stroke, disc, glint, band, form } from './kit.js';
import { part, body, scar as skinScar, scratch as metalScratch, rivet as stud } from './anatomy.js';

// Spartan hoplite, c.480 BC: a faceless Corinthian helm under a black
// horsehair crest, dark bronze over crimson, scarred limbs, a short leaf
// blade and an aspis that has held the line.
const SKIN = '#96623f';
const BRONZE = '#6f5524';
const BRONZE_DARK = '#4d3a18';
const BRONZE_HI = '#c9a252';
const VERDIGRIS = '#3f6b55';
const CRIMSON = '#6b1019';
const CRIMSON_DARK = '#3d0a10';
const LEATHER = '#40271a';
const LEATHER_DARK = '#22140d';
const HAIR = '#1a1413';
const HAIR_HI = '#4a3c38';
const STEEL = '#a4acb3';
const BONE = '#8f8468';
const BLOOD = '#4f0a11';
const VOID = '#0b0807';

const crease = darken(SKIN, 0.5);
const bronzeLine = darken(BRONZE, 0.48);

const rivet = (ctx, x, y, r = 0.45, color = BRONZE_HI) => stud(ctx, x, y, r, color);
const scar = (ctx, pts, width) => skinScar(ctx, SKIN, pts, width);
const scratch = (ctx, x0, y0, x1, y1, hi = BRONZE_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);

// A hammered-in dent: dark hollow, bright lower lip.
function dent(ctx, x, y, r) {
  disc(ctx, x, y, r, darken(BRONZE, 0.68), { line: 0 });
  stroke(ctx, [[x - r * 0.8, y + r * 0.55], [x, y + r], [x + r * 0.8, y + r * 0.5]], 0.3, BRONZE_HI);
}

const torso = part('torso', (ctx) => {
  // Short cloak falling behind the shoulders, hem ragged.
  hard(ctx, [
    [-5.6, -39.4], [-10.4, -36.4], [-12.8, -26], [-13.2, -12], [-12.4, -1], [-13.2, 5.4],
    [-11.6, 3.6], [-11.2, 8.6], [-9.6, 4.6], [-8.4, -4], [-8, -20], [-6, -34],
  ], darken(CRIMSON, 0.8));
  stroke(ctx, [[-10.4, -32], [-11.4, -16], [-11, -2]], 0.5, CRIMSON_DARK);
  stroke(ctx, [[-9, -28], [-9.6, -12], [-9.8, 2]], 0.45, CRIMSON_DARK);

  // Muscle cuirass.
  body(ctx, 'torso', BRONZE);

  // Chiton skirt showing below the armour, pleated, torn at the hem.
  hard(ctx, [
    [-9.8, -5], [9.6, -5.6], [10.8, 6], [11.2, 12.6], [9.4, 11], [8, 14.6], [6, 11.6], [4, 14.2],
    [2, 11.4], [0, 14.6], [-2.2, 11.6], [-4.2, 14], [-6.2, 11], [-8.2, 13.4], [-10.2, 10.4],
  ], CRIMSON);
  for (const x of [-7.4, -4.2, -1, 2.4, 5.6, 8.6]) stroke(ctx, [[x, -3], [x * 1.08, 10.6]], 0.45, CRIMSON_DARK, false);
  // Pteruges: two rows of leather strips, the outer row bronze-studded.
  for (const x of [-8.4, -5, -1.6, 1.8, 5.2, 8.4]) {
    hard(ctx, [[x - 1.3, -5], [x + 1.3, -5], [x + 1.2, 8.6], [x, 9.8], [x - 1.2, 8.6]], LEATHER_DARK, { line: 0.5 });
  }
  for (const [x, len] of [[-6.8, 9.6], [-3.4, 10.4], [0, 9.8], [3.4, 10.6], [6.8, 10], [9.6, 8.8]]) {
    hard(ctx, [[x - 1.3, -5.4], [x + 1.3, -5.4], [x + 1.2, -5.4 + len], [x, -4.2 + len], [x - 1.2, -5.4 + len]], LEATHER, { line: 0.5 });
    stroke(ctx, [[x - 0.6, -4.4], [x - 0.6, -6.4 + len]], 0.25, lighten(LEATHER, 0.14), false);
    rivet(ctx, x, -6.8 + len, 0.42);
  }
  hard(ctx, [[2.4, 2], [4.4, 1.8], [4, 4.4]], INK, { line: 0 });

  // Flared lower rim of the cuirass.
  hard(ctx, [[-9.8, -8.4], [9.4, -9.2], [10.6, -4.4], [-10.6, -3.6]], BRONZE, { line: 0.7 });
  stroke(ctx, [[-9.6, -5], [9.8, -5.8]], 0.4, BRONZE_HI, false);
  stroke(ctx, [[-9.2, -7.4], [9, -8.2]], 0.4, bronzeLine, false);
  // Embossed anatomy: chest, the arch of the ribs, belly, navel.
  stroke(ctx, [[0.6, -29], [5.6, -24.2], [11.6, -26.6]], 0.9, bronzeLine);
  stroke(ctx, [[1, -29.6], [5.8, -25], [11.4, -27.4]], 0.3, BRONZE_HI);
  stroke(ctx, [[-9.6, -27.6], [-5, -25], [-0.6, -27.4]], 0.6, bronzeLine);
  stroke(ctx, [[2, -23], [5.4, -19.6], [9.4, -20.6]], 0.6, bronzeLine);
  stroke(ctx, [[6.2, -23.6], [6.8, -16], [6.6, -9.6]], 0.6, bronzeLine);
  for (const y of [-19.4, -15.6, -12]) {
    stroke(ctx, [[2.6, y + 0.6], [6.4, y], [9, y + 0.5]], 0.5, bronzeLine);
    stroke(ctx, [[3, y + 1.3], [6, y + 0.8]], 0.25, BRONZE_HI, false);
  }
  stroke(ctx, [[-8, -20], [-6.2, -14], [-6.6, -9]], 0.5, bronzeLine);
  disc(ctx, 6.9, -11, 0.6, bronzeLine, { line: 0 });
  glint(ctx, 8.6, -30, 2.4, 1, BRONZE_HI, 0.55, -0.4);
  // Armhole and neck edges rolled, hinge pins down the side.
  stroke(ctx, [[-2.6, -37.6], [-3.6, -32], [-1.6, -27.6]], 0.45, bronzeLine);
  stroke(ctx, [[-5.6, -38.6], [0, -40], [5.4, -38.4]], 0.5, BRONZE_HI);
  for (const y of [-22, -16, -10.6]) rivet(ctx, -8.2 + (y + 22) * 0.07, y, 0.38);
  // Verdigris in the hollows; a spear dent, cuts, old blood.
  glint(ctx, -4.6, -17.4, 1.8, 2.6, VERDIGRIS, 0.3, 0.2);
  glint(ctx, 3.4, -9.6, 2, 0.8, VERDIGRIS, 0.3);
  dent(ctx, -1.6, -21.4, 1.5);
  scratch(ctx, 1.6, -34, 7.6, -30.2);
  scratch(ctx, -6, -13.4, -1.4, -10.4);
  scratch(ctx, 7.2, -18.4, 9.2, -14.4);
  glint(ctx, 8.2, -22.6, 1.3, 2, BLOOD, 0.7, 0.3);

  // Cloak drawn across the collar and pinned at the shoulder.
  hard(ctx, [[-7.4, -38.4], [-3.4, -41], [3.6, -40.4], [5.6, -38.6], [-1, -37], [-6.6, -35.2]], CRIMSON, { line: 0.7 });
  stroke(ctx, [[-5.6, -37.6], [-1, -39], [3.6, -39.2]], 0.4, CRIMSON_DARK);
  disc(ctx, -5.2, -36.6, 1.5, BRONZE, { line: 0.5 });
  disc(ctx, -5.2, -36.6, 0.6, BRONZE_HI, { line: 0.3 });
});

const upperArm = part('upper_arm', (ctx) => {
  body(ctx, 'upper_arm', SKIN);
  // Deltoid, biceps, the cut of the triceps.
  stroke(ctx, [[-4.4, 5.6], [0.4, 8.4], [4.8, 5.4]], 0.6, crease);
  stroke(ctx, [[1.8, 9], [3.4, 13.4], [2.6, 18]], 0.55, crease);
  stroke(ctx, [[-3.2, 9.6], [-3.8, 14], [-2.8, 18.4]], 0.5, crease);
  glint(ctx, 3.2, 10.6, 1, 2.4, lighten(SKIN, 0.4), 0.35, -0.1);
  // Scars: a long cut down the arm, a notch above the elbow.
  scar(ctx, [[-1.6, 8.4], [0.2, 12.4], [0.6, 16.4]], 0.6);
  for (const y of [10, 12.6, 15]) stroke(ctx, [[-1.4 + (y - 8.4) * 0.22, y + 0.4], [0.4 + (y - 8.4) * 0.22, y - 0.4]], 0.3, darken(SKIN, 0.4), false);
  scar(ctx, [[2.4, 17.4], [4, 19]], 0.5);
  // Chiton sleeve bunched over the shoulder, hem frayed.
  hard(ctx, [
    [-6, -3.4], [-2.6, -6.4], [2.6, -6.6], [6, -3.4], [6.8, 2.4], [5.2, 4.4], [3.6, 3], [2, 5.2],
    [0, 3.4], [-2, 5.4], [-3.8, 3.2], [-5.4, 4.6], [-6.8, 1.6],
  ], CRIMSON);
  stroke(ctx, [[-3.4, -4.6], [-4, 2.6]], 0.45, CRIMSON_DARK, false);
  stroke(ctx, [[0, -5.6], [0.2, 2.6]], 0.45, CRIMSON_DARK, false);
  stroke(ctx, [[3.4, -4.8], [4.4, 2.4]], 0.45, CRIMSON_DARK, false);
  // Bronze shoulder flap of the cuirass, tied down.
  smooth(ctx, [[-4.6, -5], [0, -8.6], [4.8, -5], [4.4, -0.6], [0, 0.8], [-4.2, -0.6]], BRONZE);
  stroke(ctx, [[-3.6, -3.8], [0, -6.6], [3.8, -3.8]], 0.4, bronzeLine);
  glint(ctx, 1.8, -5.2, 1.5, 0.6, BRONZE_HI, 0.6, 0.4);
  rivet(ctx, 0, -1.4, 0.42);
  scratch(ctx, -3, -3, -0.6, -1.2);
});

const lowerArm = part('lower_arm', (ctx) => {
  body(ctx, 'lower_arm', SKIN);
  // Forearm cords and an old defensive cut.
  stroke(ctx, [[1.6, -0.6], [2.6, 5], [1.6, 11]], 0.55, crease);
  stroke(ctx, [[-2.4, 1], [-2.8, 6], [-1.8, 11]], 0.45, crease);
  scar(ctx, [[-1.4, 2.4], [1.4, 6.4]], 0.55);
  scar(ctx, [[2, 7.6], [3.4, 9.6]], 0.45);
  // Leather wrist wrap, cross-laced.
  band(ctx, 11.6, 17.2, -3.6, 3.7, LEATHER, { sag: 0.7 });
  for (const y of [12.4, 14.4]) {
    stroke(ctx, [[-2.8, y], [2.9, y + 2]], 0.35, LEATHER_DARK, false);
    stroke(ctx, [[2.9, y], [-2.8, y + 2]], 0.35, LEATHER_DARK, false);
  }
  // Bare fist, knuckles split.
  body(ctx, 'fist', SKIN);
  stroke(ctx, [[-3, 19.4], [0.6, 18.6], [4, 19.6]], 0.45, crease);
  stroke(ctx, [[1.4, 20.8], [1.2, 23.6]], 0.45, crease, false);
  stroke(ctx, [[-0.9, 20.9], [-1.1, 23.8]], 0.45, crease, false);
  glint(ctx, 2.6, 19.8, 0.7, 0.5, BLOOD, 0.7);
});

const upperLeg = part('upper_leg', (ctx) => {
  body(ctx, 'upper_leg', SKIN);
  // Quadriceps, hamstring, the knot of the knee.
  stroke(ctx, [[2.4, 5], [4.2, 15], [3.2, 24.6]], 0.6, crease);
  stroke(ctx, [[-3.4, 8], [-2.4, 17], [-3, 24]], 0.5, crease);
  stroke(ctx, [[-0.6, 12], [0.6, 18], [0.2, 23.6]], 0.4, crease);
  stroke(ctx, [[-2.6, 25.4], [0.4, 27.4], [3.4, 25.8]], 0.55, crease);
  stroke(ctx, [[-1.6, 29.6], [0.6, 30.6], [2.8, 29.8]], 0.4, crease);
  glint(ctx, 4.6, 10, 1, 3.4, lighten(SKIN, 0.4), 0.3, -0.1);
  // A spear wound long healed, stitched; a pair of shallow cuts.
  scar(ctx, [[-3.4, 11.4], [-0.4, 14], [3.4, 15]], 0.65);
  for (const [x, y] of [[-2, 12.6], [0.4, 14.3], [2.4, 14.8]]) stroke(ctx, [[x - 0.3, y + 1], [x + 0.3, y - 1]], 0.3, darken(SKIN, 0.4), false);
  scar(ctx, [[1, 20.4], [3.6, 22.4]], 0.45);
  scar(ctx, [[-4.4, 20], [-2.6, 21.6]], 0.45);
  // Dust and dried blood toward the knee.
  glint(ctx, -1, 26.4, 1.6, 1, BLOOD, 0.5, 0.2);
});

const lowerLeg = part('lower_leg', (ctx) => {
  // Calf behind the greave.
  body(ctx, 'lower_leg', SKIN);
  stroke(ctx, [[-5.4, 6], [-5.6, 12], [-3.6, 20]], 0.45, crease);
  // Bronze greave sprung round the shin, covering the knee.
  smooth(ctx, [
    [-3.4, -5.4], [1, -8.6], [5.2, -5.4], [5.7, 2], [5.4, 10], [4.4, 26.4], [0.6, 27.8],
    [-2.4, 26], [-3, 18], [-4.6, 10], [-4.2, 2],
  ], BRONZE);
  // Rolled edge, embossed kneecap and calf muscle, a ridge down the shin.
  stroke(ctx, [[-2.8, -4.6], [1, -7.4], [4.6, -4.8]], 0.3, BRONZE_HI);
  stroke(ctx, [[-1.6, -1.6], [1.6, -3.6], [4.4, -1.4], [1.6, 1], [-1.6, -1.6]], 0.5, bronzeLine);
  stroke(ctx, [[3.4, 2.6], [3.8, 14], [3, 25]], 0.55, BRONZE_HI);
  stroke(ctx, [[2.4, 2.6], [2.8, 14], [2.2, 25.4]], 0.45, bronzeLine);
  stroke(ctx, [[-3.2, 4], [-0.6, 9], [-1, 16], [-2, 21]], 0.5, bronzeLine);
  stroke(ctx, [[-2, 25], [1, 26.4], [4, 25.2]], 0.4, bronzeLine);
  // Lining holes along the back edge.
  for (const y of [4, 8, 12, 16, 20]) glint(ctx, -3.4 + (y - 4) * 0.06, y, 0.3, 0.3, VOID, 0.9);
  // Wear: verdigris, a dent, sword marks.
  glint(ctx, 0.2, 20.4, 1.2, 2.6, VERDIGRIS, 0.3, 0.1);
  dent(ctx, 0.6, 11.6, 1.1);
  scratch(ctx, 3, 5.4, 5, 8.6);
  scratch(ctx, 0.4, 3.4, 2, 5.4);
  scratch(ctx, 2.8, 17.6, 4.2, 21);
});

const foot = part('foot', (ctx) => {
  body(ctx, 'foot', SKIN);
  stroke(ctx, [[8.6, 2.4], [8.8, 4.2]], 0.3, crease, false);
  stroke(ctx, [[9.8, 3], [9.9, 4.4]], 0.3, crease, false);
  stroke(ctx, [[7.2, 1.8], [7.5, 4.2]], 0.3, crease, false);
  // Sandal: thick sole, a strap net over the instep, ankle wrap.
  hard(ctx, [[-4.6, 4.2], [11, 4.2], [11.2, 5.9], [-4.8, 5.9]], LEATHER_DARK, { line: 0.6 });
  stroke(ctx, [[-4, 5], [10.6, 5]], 0.25, LEATHER, false);
  stroke(ctx, [[-3.6, 0.6], [1, 1.6], [6.6, 4.2]], 0.8, LEATHER);
  stroke(ctx, [[2.6, -2.6], [3.4, 0.6], [2.6, 4.2]], 0.8, LEATHER);
  stroke(ctx, [[2.8, -2.4], [6.4, 1.4], [8.6, 4.2]], 0.7, LEATHER);
  stroke(ctx, [[-2.6, -2.6], [-1.6, 1], [-2.4, 4.2]], 0.8, LEATHER);
  band(ctx, -3.7, -1.9, -3.5, 3, LEATHER, { sag: 0.4, line: 0.5 });
  rivet(ctx, 3.2, 0.8, 0.36);
});

const head = part('head', (ctx) => {
  // Neck, corded.
  body(ctx, 'neck', SKIN);
  stroke(ctx, [[1.6, -5], [2.4, 2]], 0.45, crease, false);

  // Horsehair crest running front to back and trailing down the neck.
  hard(ctx, [
    [9.6, -19.6], [11.2, -25], [10, -29.6], [7.4, -33], [4.4, -32.4], [2, -36], [-1.4, -33.6],
    [-4.6, -35.6], [-7, -32], [-10.4, -32.4], [-11.6, -27.6], [-14.6, -25.6], [-14.4, -20],
    [-16.8, -16], [-15.6, -10], [-17.4, -5], [-15.2, -3.4], [-15, 1.6], [-12.6, -3], [-11.4, -9.6],
    [-10.6, -15], [-8.4, -19.6], [-5, -22.6], [0, -24.4], [5.4, -23.4],
  ], HAIR);
  for (const [x0, y0, x1, y1] of [
    [7.4, -22.4, 9.6, -28.4], [4.6, -23.6, 6.2, -31.6], [1.6, -24.2, 2, -34], [-1.6, -24, -2.2, -32.6],
    [-4.6, -22.8, -6, -33], [-7.4, -20.6, -9.8, -30.6], [-9.4, -17.6, -13.4, -24], [-10.6, -13.6, -15.4, -17],
    [-11.4, -9, -15.4, -10.4], [-12.4, -4, -16.2, -5.4],
  ]) stroke(ctx, [[x0, y0], [x1, y1]], 0.45, HAIR_HI, false);
  stroke(ctx, [[-13.4, -3], [-14.6, 0.4]], 0.45, HAIR_HI, false);

  // Helmet: one beaten sheet of bronze from crown to jaw, flaring at the
  // nape.
  smooth(ctx, [
    [-8.8, -6], [-9.6, -14], [-6.4, -20.6], [0, -23.4], [6, -22], [9.6, -17.6], [10.4, -12],
    [9.8, -5], [8.6, 1], [5.8, 2.4], [3.6, -2.4], [0, -3.6], [-4, -2.2], [-7.6, 0.8], [-10.6, -1],
  ], BRONZE);
  // Crest rail riveted along the crown.
  stroke(ctx, [[-10.4, -15.4], [-8.2, -19.8], [-4.8, -22.8], [0, -24.6], [5.4, -23.6], [9.4, -19.8]], 1.3, BRONZE_DARK);
  stroke(ctx, [[-8, -20.2], [-4.6, -23.2], [0, -25], [5.2, -24]], 0.3, BRONZE_HI);
  for (const [x, y] of [[-7.4, -20.4], [-2.4, -23.8], [3, -24.2], [8, -21.2]]) rivet(ctx, x, y, 0.32);
  glint(ctx, 4.4, -19.4, 2.6, 1.1, BRONZE_HI, 0.5, 0.5);

  // The opening: an almond eye and the slit between nasal and cheek piece,
  // nothing visible inside.
  hard(ctx, [[3.2, -12.4], [5.4, -14.2], [8.2, -14.4], [9.6, -13], [7.4, -11.2], [4.8, -11.2]], VOID, { line: 0.5 });
  hard(ctx, [[7.6, -11.6], [9.5, -12.6], [9.3, -5], [8.5, 0.8], [7.3, 1], [7.7, -5]], VOID, { line: 0.5 });
  glint(ctx, 6.8, -12.7, 0.6, 0.3, '#d8c9a8', 0.28);
  // Nasal.
  hard(ctx, [[9.2, -15.4], [10.9, -14.6], [11.9, -6.4], [10.4, -5.6], [9.6, -10.6]], BRONZE, { line: 0.6 });
  stroke(ctx, [[10.3, -14], [11, -7]], 0.3, BRONZE_HI, false);
  // Embossed brow sweeping back from the nasal; ridge round the skull.
  stroke(ctx, [[10, -15.4], [6.6, -16.6], [2.6, -14.6], [1.4, -12.4]], 0.7, bronzeLine);
  stroke(ctx, [[9.6, -16], [6.4, -17.2], [2.4, -15.2]], 0.28, BRONZE_HI);
  stroke(ctx, [[-9, -12], [-4, -13.6], [1.4, -12.6]], 0.45, bronzeLine);
  // Cheek piece edge and the rolled rim, pierced for a lining.
  stroke(ctx, [[3.6, -10.6], [4.4, -5.6], [6, 1.4]], 0.3, BRONZE_HI);
  stroke(ctx, [[-9.4, -1.6], [-7.4, -0.2], [-4, -3.2], [0, -4.6], [3.4, -3.4]], 0.3, BRONZE_HI);
  for (const [x, y] of [[5, -8.6], [5.4, -5.4], [6, -2.4], [6.5, 0.4], [-6.6, -2.4], [-3.4, -4.4], [0, -5.6]]) glint(ctx, x, y, 0.28, 0.28, VOID, 0.9);
  // Age and war: verdigris, a caved dent at the temple, cuts.
  glint(ctx, -5.4, -8.6, 2, 2.6, VERDIGRIS, 0.3, 0.3);
  glint(ctx, 1.6, -18.6, 1.6, 1, VERDIGRIS, 0.28);
  dent(ctx, -3.2, -16.6, 1.5);
  scratch(ctx, -1, -11.4, 2.4, -7.4);
  scratch(ctx, 5.6, -20.4, 8.4, -17.4);
  scratch(ctx, -8, -6.4, -5.6, -3.4);
  glint(ctx, 1.4, -6.4, 0.9, 1.5, BLOOD, 0.6, 0.2);
}, { box: [-19, -40, 17, 6] });

// Xiphos, drawn tip-up from the grip. `length` is grip-to-tip in rig units.
function weapon(length) {
  return {
    box: [-6, -length - 2, 6, 8],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      // Leaf blade: narrow above the guard, swelling toward the point; a
      // bite out of one edge.
      hard(ctx, [
        [-1.8, -5], [-1.5, -L * 0.3], [-2.2, -L * 0.5], [-3.2, -L * 0.68], [-2.5, -L * 0.85], [0, -L],
        [2.5, -L * 0.85], [3.2, -L * 0.68], [2.7, -L * 0.59], [2, -L * 0.57], [2.3, -L * 0.52],
        [1.5, -L * 0.3], [1.8, -5],
      ], STEEL, { shadow: darken(STEEL, 0.58), light: [1.5, 0] });
      // Midrib and a line of light beside it.
      stroke(ctx, [[0, -5.4], [0, -L + 2]], 0.6, darken(STEEL, 0.5), false);
      stroke(ctx, [[0.9, -7], [1.1, -L * 0.34], [1.9, -L * 0.5]], 0.35, '#e6ebef');
      scratch(ctx, -1.4, -L * 0.36, -0.4, -L * 0.44, '#e6ebef');
      // Blood over the swell of the blade.
      hard(ctx, [[-2.6, -L * 0.8], [0, -L + 0.6], [2.5, -L * 0.83], [2.2, -L * 0.72], [1, -L * 0.75], [0.4, -L * 0.6], [-0.8, -L * 0.72], [-2, -L * 0.66]], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [[0.5, -L * 0.62], [0.6, -L * 0.46]], 0.5, BLOOD, false);
      // Short bronze guard, bone grip banded in bronze, pommel cap.
      hard(ctx, [[-3.8, -5.8], [3.8, -5.8], [3.2, -3.4], [-3.2, -3.4]], BRONZE, { line: 0.7 });
      stroke(ctx, [[-3, -5], [3, -5]], 0.3, BRONZE_HI, false);
      form(ctx, c => c.roundRect(-1.4, -3.6, 2.8, 7.2, 0.8), BONE, { line: 0.7 });
      for (const y of [-1.8, 0.2, 2.2]) stroke(ctx, [[-1.4, y], [1.4, y]], 0.5, BRONZE, false);
      disc(ctx, 0, 4.9, 2.1, BRONZE, { line: 0.7 });
      disc(ctx, 0, 4.9, 0.8, BRONZE_DARK, { line: 0.3 });
    },
  };
}

// Aspis on the off arm; (0,0) is the grip at its centre.
const shield = {
  box: [-17, -17, 17, 17],
  start: [0, 0],
  draw(ctx) {
    // Broad bronze rim, then the dished face.
    disc(ctx, 0, 0, 15.6, BRONZE_DARK, { line: 0.9, light: [2.4, -1.4] });
    disc(ctx, 0, 0, 12.8, BRONZE, { line: 0.6, light: [2.6, -1.8] });
    ctx.beginPath();
    ctx.arc(0, 0, 14.2, -2.2, -0.5);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = BRONZE_HI;
    ctx.stroke();
    for (let a = 0; a < 12; a++) rivet(ctx, Math.cos(a * 0.5236 + 0.26) * 14.2, Math.sin(a * 0.5236 + 0.26) * 14.2, 0.38);
    // Lambda in crimson, the paint chipped.
    hard(ctx, [[0.2, -10.4], [8.6, 8.4], [5.2, 8.6], [0.2, -3.4], [-4.8, 8.6], [-8.2, 8.4]], CRIMSON, { line: 0.6 });
    for (const [x0, y0, x1, y1] of [[2.4, -3.4, 4.2, -2.6], [-5.6, 4.6, -3.6, 5.6], [5.6, 4.4, 7.2, 6.4], [-1.6, -5.6, -0.6, -4]]) {
      stroke(ctx, [[x0, y0], [x1, y1]], 0.8, BRONZE, false);
    }
    glint(ctx, 3.6, -7.6, 3, 1.2, BRONZE_HI, 0.4, -0.6);
    // Verdigris, dents, spear and sword marks, a bite out of the rim.
    glint(ctx, -7, -5.6, 2.6, 1.8, VERDIGRIS, 0.3, 0.5);
    glint(ctx, 0.4, 10.6, 3, 1.2, VERDIGRIS, 0.28);
    dent(ctx, -6.4, 1.4, 1.7);
    dent(ctx, 7.4, -4.6, 1.3);
    dent(ctx, 1.4, 4.4, 1);
    scratch(ctx, -9.4, -7.4, -2.6, -1.4);
    scratch(ctx, 3.4, -9.4, 9.4, -1.4);
    scratch(ctx, -3.4, 6.4, 3.4, 11);
    scratch(ctx, 9.6, 3.4, 11.4, 8);
    scratch(ctx, -11.4, 2.4, -9.4, 8);
    hard(ctx, [[13.2, -8.6], [10.8, -6.6], [14.4, -5.4]], INK, { line: 0 });
    hard(ctx, [[-10.6, -11.4], [-8.6, -9.6], [-11.8, -9.6]], INK, { line: 0 });
    glint(ctx, 5.4, 1.6, 1.6, 2.6, BLOOD, 0.6, 0.3);
    stroke(ctx, [[5.6, 3.6], [5.9, 7.4]], 0.5, BLOOD, false);
  },
};

export default {
  id: 'spartan',
  // Hard light, deep shadow under the helm and across the bronze.
  mood: { shadow: 0.52, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head, shield },
  weapon,
};
