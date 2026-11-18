import { INK, darken, lighten, smooth, hard, stroke, disc, glint, glow, band, form } from './kit.js';
import { part, body, scar as skinScar, scratch as metalScratch, rivet as stud } from './anatomy.js';

// Roman gladiator (murmillo) as an arena veteran: blackened bronze and iron,
// a slit-eyed mask under a ragged crest, scarred hide, a blooded gladius and
// a shield that has stopped a lot of blades.
const SKIN = '#9c6943';
const BRONZE = '#7f5f27';
const BRONZE_HI = '#d2ab5c';
const IRON = '#4b4e57';
const IRON_HI = '#9399a4';
const LEATHER = '#4c2e1b';
const LEATHER_DARK = '#2a180f';
const RED = '#7e1421';
const CLOTH_TRIM = '#b39a63';
const STEEL = '#aab2ba';
const WOOD = '#3f2717';
const EMBER = '#ff5a2a';
const BLOOD = '#5c0a12';

const crease = darken(SKIN, 0.5);
const bronzeLine = darken(BRONZE, 0.5);

const rivet = (ctx, x, y, r = 0.55, color = BRONZE_HI) => stud(ctx, x, y, r, color);
const scar = (ctx, pts, width) => skinScar(ctx, SKIN, pts, width);
const scratch = (ctx, x0, y0, x1, y1, hi = BRONZE_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);

// Overlapping iron plates of the manica, each with a bronze lip and rivet.
function manica(ctx, y0, y1, count, xBack, xFront) {
  const step = (y1 - y0) / count;
  for (let i = count - 1; i >= 0; i--) {
    const top = y0 + i * step - 0.4;
    band(ctx, top, top + step + 0.9, xBack - i * 0.12, xFront + i * 0.05, IRON, { sag: 1.1 });
    stroke(ctx, [[xBack + 0.8, top + step + 0.5], [(xBack + xFront) / 2, top + step + 1.3], [xFront - 0.8, top + step + 0.5]], 0.5, BRONZE);
    stroke(ctx, [[xBack + 1.2, top + 1.1], [xFront - 1.6, top + 1.2]], 0.35, IRON_HI, false);
    rivet(ctx, xFront - 1.3, top + step * 0.55, 0.42);
  }
}

const torso = part('torso', (ctx) => {
  // Body.
  body(ctx, 'torso', SKIN);
  // Chest, ribs and belly, cut deep.
  stroke(ctx, [[1.5, -28.5], [6, -24.4], [11.6, -26.6]], 0.85, crease);
  stroke(ctx, [[7.6, -24], [8.2, -17], [7.8, -10]], 0.6, crease);
  for (const y of [-21, -17.2, -13.6]) stroke(ctx, [[4.6, y], [8.1, y + 0.6]], 0.55, crease, false);
  for (const [x, y] of [[0.5, -22], [-0.2, -18.6], [-0.6, -15.2]]) stroke(ctx, [[x, y], [x + 2, y + 2.3]], 0.5, crease, false);
  stroke(ctx, [[-7.5, -36.5], [-3, -34.5], [1, -36.5]], 0.65, crease);
  stroke(ctx, [[-9.8, -30], [-8.6, -22], [-7.4, -15]], 0.5, crease);
  glint(ctx, 8.6, -29.5, 2.4, 1.1, lighten(SKIN, 0.45), 0.4, -0.4);
  // Old wounds: a long stitched cut over the ribs, a pair across the flank.
  scar(ctx, [[2.6, -31.6], [6, -27], [10.4, -21.6]], 0.6);
  for (const t of [0.25, 0.5, 0.75]) {
    const x = 2.6 + 7.8 * t;
    const y = -31.6 + 10 * t;
    stroke(ctx, [[x - 0.8, y + 0.9], [x + 0.9, y - 0.8]], 0.35, darken(SKIN, 0.4), false);
  }
  scar(ctx, [[-4.6, -19.4], [-1.4, -17.8]], 0.5);
  scar(ctx, [[-5, -16.4], [-2, -14.8]], 0.5);

  // Two straps crossing the chest, studded.
  hard(ctx, [[-8.6, -37.4], [-5.2, -38.6], [9.6, -13.4], [7.2, -11.6]], LEATHER, { line: 0.7 });
  hard(ctx, [[9.2, -36], [11.2, -33.6], [-7.6, -11.8], [-9.4, -14.2]], LEATHER_DARK, { line: 0.7 });
  for (const [x, y] of [[-3.6, -32.6], [6, -16.6]]) rivet(ctx, x, y);
  for (const [x, y] of [[6.4, -31], [-4.4, -17.4]]) rivet(ctx, x, y, 0.5, IRON_HI);
  // Iron ring where they cross.
  disc(ctx, 1.4, -24.2, 2.1, IRON, { line: 0.6 });
  disc(ctx, 1.4, -24.2, 0.9, darken(SKIN, 0.6), { line: 0.4 });

  // Loincloth: a back drape and a front panel, hems torn.
  hard(ctx, [[-9.8, -3], [1.6, -3.4], [2, 8.5], [0.4, 10.8], [-0.8, 9], [-2.4, 13.2], [-4.4, 10.2], [-6, 12.6], [-7.4, 9.4], [-9.6, 10.4]], darken(RED, 0.8));
  stroke(ctx, [[-5.6, -1.6], [-6.2, 8.6]], 0.5, darken(RED, 0.45), false);
  stroke(ctx, [[-1.8, -1.6], [-1.6, 8.6]], 0.5, darken(RED, 0.45), false);
  hard(ctx, [[1.6, -4], [9.8, -4.4], [11, 9.5], [9.6, 13.6], [8.4, 11], [7, 16.6], [5.2, 12], [3.6, 14.4], [1.8, 11.6]], RED);
  stroke(ctx, [[4.6, -2.2], [4.2, 11]], 0.5, darken(RED, 0.45), false);
  stroke(ctx, [[7.6, -2.2], [8.2, 10.4]], 0.5, darken(RED, 0.45), false);
  stroke(ctx, [[2.2, 9.2], [5.2, 10.4], [10.6, 7.4]], 0.7, CLOTH_TRIM);
  // Leather strips hanging from the belt, bronze-tipped.
  for (const [x, len] of [[-7.6, 7], [-4.4, 8.4], [-1.2, 7.4], [3.2, 9], [6.4, 8], [9, 6.6]]) {
    hard(ctx, [[x - 1.1, -3.4], [x + 1.1, -3.4], [x + 1, -3.4 + len], [x, -2 + len], [x - 1, -3.4 + len]], LEATHER, { line: 0.5 });
    rivet(ctx, x, -4.6 + len, 0.45);
  }

  // Wide belt: iron plates on leather, a bronze boss at the front.
  hard(ctx, [[-9.8, -10.6], [9.6, -11.8], [9.9, -3.2], [-10.1, -2]], LEATHER_DARK, { line: 0.8 });
  for (const x of [-7, -3.2, 0.6]) {
    const dy = -x * 0.06;
    hard(ctx, [[x - 1.5, -9.6 + dy], [x + 1.5, -9.8 + dy], [x + 1.5, -3.8 + dy], [x - 1.5, -3.6 + dy]], IRON, { line: 0.5 });
    stroke(ctx, [[x - 0.6, -9 + dy], [x - 0.6, -4.6 + dy]], 0.3, IRON_HI, false);
    rivet(ctx, x, -8.6 + dy, 0.38, IRON_HI);
    rivet(ctx, x, -4.8 + dy, 0.38, IRON_HI);
  }
  disc(ctx, 6, -7.4, 3.3, BRONZE, { line: 0.7 });
  disc(ctx, 6, -7.4, 1.5, darken(BRONZE, 0.7), { line: 0.4 });
  glint(ctx, 6.9, -8.6, 0.9, 0.5, BRONZE_HI, 0.9, -0.5);
  for (let a = 0; a < 6; a++) rivet(ctx, 6 + Math.cos(a * 1.047) * 2.45, -7.4 + Math.sin(a * 1.047) * 2.45, 0.28);
});

const upperArm = part('upper_arm', (ctx) => {
  body(ctx, 'upper_arm', SKIN);
  stroke(ctx, [[1.6, 8.4], [3.2, 13], [2.6, 17.4]], 0.55, crease);
  manica(ctx, 8.6, 18.6, 3, -5.9, 5.7);
  // Shoulder plate with a raised, spiked crest and a riveted lip.
  hard(ctx, [[-4.6, -8.4], [-3.4, -12.6], [-1.6, -9.2], [0.4, -13.4], [2, -9.4], [4.2, -12.2], [5.2, -8]], IRON, { line: 0.6 });
  smooth(ctx, [[-7.6, -6.4], [0, -9.8], [7.8, -6], [8.4, 1], [4.4, 6], [-3.8, 6], [-8, 1]], BRONZE);
  stroke(ctx, [[-6.6, -3.4], [0, -6.6], [6.8, -3]], 0.5, bronzeLine);
  // Embossed boss in the middle of the plate.
  disc(ctx, 0.2, -1.6, 2.5, darken(BRONZE, 0.82), { line: 0.45 });
  disc(ctx, 0.2, -1.6, 1, IRON, { line: 0.35 });
  stroke(ctx, [[-6.2, -0.4], [-3.2, 3.6], [3.8, 3.6], [6.6, -0.2]], 0.55, bronzeLine);
  glint(ctx, 2.6, -4.6, 2.4, 1.1, BRONZE_HI, 0.7, -0.3);
  for (const [x, y] of [[-5.4, 1.6], [-2.6, 4.4], [0.4, 4.9], [3.4, 4.4], [5.8, 1.8]]) rivet(ctx, x, y, 0.45);
  scratch(ctx, -4.4, -4.6, -1, -0.6);
  scratch(ctx, 3.2, -1.6, 5.6, 0.6);
});

const lowerArm = part('lower_arm', (ctx) => {
  body(ctx, 'lower_arm', SKIN);
  manica(ctx, 0.6, 14.6, 4, -5, 4.9);
  // Fist, knuckles bound in studded leather.
  body(ctx, 'fist', SKIN);
  stroke(ctx, [[1.4, 21.4], [1.2, 23.6]], 0.45, crease, false);
  stroke(ctx, [[-0.9, 21.5], [-1.1, 23.8]], 0.45, crease, false);
  band(ctx, 18.4, 21, -3.9, 4.5, LEATHER_DARK, { sag: 0.6 });
  for (const x of [-2.2, 0.2, 2.6]) rivet(ctx, x, 20, 0.42, IRON_HI);
  band(ctx, 14.4, 17.2, -3.5, 3.6, LEATHER, { sag: 0.7 });
  stroke(ctx, [[-2.8, 15.4], [2.9, 16.4]], 0.3, CLOTH_TRIM, false);
});

const upperLeg = part('upper_leg', (ctx) => {
  body(ctx, 'upper_leg', SKIN);
  stroke(ctx, [[2.4, 5], [4, 15], [3.2, 24.6]], 0.6, crease);
  stroke(ctx, [[-3.4, 8], [-2.6, 17], [-3, 24]], 0.5, crease);
  stroke(ctx, [[-2.6, 25.4], [0.4, 27.4], [3.4, 25.8]], 0.55, crease);
  scar(ctx, [[0.4, 9.6], [3.6, 12.6]], 0.5);
  // Bandage bound round the thigh, stained.
  band(ctx, 18.4, 22.6, -6.3, 6.2, '#74694f', { sag: 1.2, shadow: '#463e2c' });
  stroke(ctx, [[-5.4, 20], [0, 21.4], [5.4, 19.8]], 0.35, '#463e2c');
  glint(ctx, 2.4, 20.8, 1.5, 1.1, BLOOD, 0.8, 0.3);
});

const lowerLeg = part('lower_leg', (ctx) => {
  body(ctx, 'lower_leg', SKIN);
  stroke(ctx, [[-5, 6], [-4.6, 13], [-3.4, 19]], 0.5, crease);
  // Greave straps round the calf.
  band(ctx, 4.4, 6.8, -6.2, 2, LEATHER_DARK, { sag: 0.6 });
  band(ctx, 11, 13.2, -5.8, 2, LEATHER_DARK, { sag: 0.6 });
  band(ctx, 17.6, 19.8, -4.2, 2, LEATHER_DARK, { sag: 0.5 });
  // Blackened bronze greave: spiked knee cop, embossed ridge, dents.
  hard(ctx, [[1.4, -6.4], [2.6, -10.4], [4.2, -6]], IRON, { line: 0.5 });
  smooth(ctx, [
    [0.4, -7.4], [4.6, -5.8], [6, -1], [5.8, 9], [4.5, 26.4], [1, 27.6], [-0.4, 13],
    [-1.6, 1], [-1.4, -5],
  ], BRONZE);
  stroke(ctx, [[-1, -0.6], [2.4, 0.8], [5.8, -0.4]], 0.6, bronzeLine);
  stroke(ctx, [[2.2, 2.6], [2.6, 14], [2, 25]], 0.5, bronzeLine);
  stroke(ctx, [[3.6, 3], [3.7, 14], [3, 24]], 0.55, BRONZE_HI);
  for (const y of [7, 13, 19]) stroke(ctx, [[0.2, y], [2.2, y + 0.9]], 0.4, bronzeLine, false);
  rivet(ctx, 0.4, 3.4, 0.4);
  rivet(ctx, 0.6, 23.6, 0.4);
  scratch(ctx, 3.4, 15.4, 5, 18.6);
});

const foot = part('foot', (ctx) => {
  body(ctx, 'foot', SKIN);
  stroke(ctx, [[8.6, 2.4], [8.8, 4.2]], 0.3, crease, false);
  stroke(ctx, [[9.8, 3], [9.9, 4.4]], 0.3, crease, false);
  // Hobnailed sandal.
  hard(ctx, [[-4.6, 4.2], [11, 4.2], [11.2, 5.8], [-4.8, 5.8]], LEATHER_DARK, { line: 0.6 });
  for (const x of [-3, 0, 3, 6, 9]) glint(ctx, x, 5.2, 0.32, 0.32, IRON_HI, 0.9);
  stroke(ctx, [[-2.4, -2.8], [2.8, 4]], 0.9, LEATHER, false);
  stroke(ctx, [[2.6, -3], [-3.2, 4]], 0.9, LEATHER, false);
  stroke(ctx, [[5.6, 0.2], [5, 4]], 0.9, LEATHER, false);
  stroke(ctx, [[8, 1.2], [7.6, 4]], 0.8, LEATHER, false);
  band(ctx, -3.6, -1.6, -3.6, 3, LEATHER_DARK, { sag: 0.4, line: 0.5 });
});

const head = part('head', (ctx) => {
  // Neck, corded.
  body(ctx, 'neck', SKIN);
  stroke(ctx, [[1.6, -5], [2.4, 2]], 0.45, crease, false);
  // Ragged horsehair crest.
  hard(ctx, [
    [-10.6, -12.4], [-13.4, -17], [-11.4, -19], [-13.6, -24.6], [-9.8, -25.4], [-9.6, -31],
    [-5.4, -29.6], [-3.4, -35.4], [0, -31.6], [3.2, -36.2], [5.4, -31.2], [9.6, -33],
    [9.6, -27.6], [13.6, -26], [11, -22], [9.2, -19.4], [3, -23.6], [-4, -23], [-8.8, -16.6],
  ], RED);
  const hair = darken(RED, 0.42);
  for (const [x0, y0, x1, y1] of [
    [-8.4, -17.6, -11.6, -22.4], [-7, -20.4, -9.6, -27.6], [-4.4, -22.8, -6, -29],
    [-2.2, -23.2, -3, -32.6], [1.4, -23.4, 1.8, -33], [4, -23, 5.4, -30],
    [6.2, -21.8, 8.8, -30.4], [8, -20.4, 11.4, -25],
  ]) stroke(ctx, [[x0, y0], [x1, y1]], 0.5, hair, false);
  // Neck guard flaring behind.
  smooth(ctx, [[-8.6, -11], [-13.4, -5.6], [-12, -2.6], [-5.6, -6.4]], darken(BRONZE, 0.8));
  stroke(ctx, [[-11.6, -5.4], [-7, -7.6]], 0.4, bronzeLine, false);
  // Dome with an iron crest ridge.
  smooth(ctx, [
    [-9.2, -9], [-8.8, -17], [-3.4, -22.6], [4, -22.8], [9, -18], [9.6, -10], [0, -8.4],
  ], BRONZE);
  glint(ctx, 3.8, -18.6, 2.8, 1.3, BRONZE_HI, 0.65, 0.5);
  stroke(ctx, [[-8.8, -17.2], [-3.2, -23.4], [4.2, -23.6], [9.4, -18.2]], 1.3, IRON);
  stroke(ctx, [[-8.6, -17.6], [-3.2, -23.8], [4.2, -24], [9.2, -18.6]], 0.35, IRON_HI);
  stroke(ctx, [[-6.4, -10.4], [-5.6, -16], [-2, -20]], 0.4, bronzeLine);
  scratch(ctx, -4.6, -18.4, -1.2, -13.6);
  scratch(ctx, 5.2, -15.2, 7.6, -12.4);
  // Cheek plate, riveted.
  smooth(ctx, [[-7.2, -10], [2, -10.8], [2.8, -1.4], [-2.8, -2.2], [-6.6, -5]], darken(BRONZE, 0.85));
  for (const [x, y] of [[-4.8, -7.4], [-1.6, -4], [0.8, -8.6]]) rivet(ctx, x, y, 0.42);
  // Iron mask: two slanted slits lit from inside, breathing slots below,
  // a jutting chin.
  hard(ctx, [[1.4, -11], [11.2, -11.8], [12.2, -5.4], [10.4, -1.6], [7.4, 2.4], [2.4, -1.2]], IRON, { line: 0.8 });
  stroke(ctx, [[6.4, -11.2], [6.9, -2.4]], 0.55, darken(IRON, 0.55), false);
  stroke(ctx, [[7, -11.2], [7.5, -2.6]], 0.3, IRON_HI, false);
  glow(ctx, 5, -8.2, 3.2, EMBER);
  glow(ctx, 9.4, -8.6, 3, EMBER);
  hard(ctx, [[2.8, -8.4], [5.8, -7], [5.7, -6.1], [2.9, -7.3]], '#ffd27a', { line: 0.4, shadow: EMBER, light: [0, 0.3] });
  hard(ctx, [[8, -7], [11, -8.8], [11.1, -7.8], [8.1, -6.1]], '#ffd27a', { line: 0.4, shadow: EMBER, light: [0, 0.3] });
  ctx.fillStyle = INK;
  for (const [x, y] of [[4, -4.4], [5.4, -4.1], [8.4, -4.2], [9.8, -4.6], [4.6, -2.6], [9, -2.8]]) {
    ctx.fillRect(x - 0.3, y - 0.9, 0.6, 1.8);
  }
  rivet(ctx, 2.6, -10, 0.38, IRON_HI);
  rivet(ctx, 10.6, -10.6, 0.38, IRON_HI);
  // Wide brim casting the mask into shade.
  smooth(ctx, [[-11.4, -11.6], [0, -13], [12.8, -12.8], [14.6, -10.6], [0, -9.8], [-11.8, -9]], BRONZE);
  stroke(ctx, [[-9.6, -11.3], [0, -12.3], [12.4, -12.1]], 0.4, BRONZE_HI);
  for (const x of [-8, -4, 0, 4, 8, 12]) rivet(ctx, x, -10.9, 0.34);
});

// Gladius, drawn tip-up from the grip. `length` is grip-to-tip in rig units.
function weapon(length) {
  return {
    box: [-5, -length - 2, 5, 8],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      // Blade: waisted, a long point, a nick out of one edge.
      hard(ctx, [
        [-2.6, -5], [-2.2, -L * 0.48], [-3, -L * 0.74], [0, -L], [3, -L * 0.74],
        [2.5, -L * 0.6], [1.9, -L * 0.57], [2.3, -L * 0.53], [2.2, -L * 0.48], [2.6, -5],
      ], STEEL, { shadow: darken(STEEL, 0.6), light: [1.6, 0] });
      stroke(ctx, [[0, -5.4], [0, -L + 2.2]], 0.55, darken(STEEL, 0.5), false);
      stroke(ctx, [[1.4, -7], [1.3, -L * 0.44]], 0.4, '#e9eef2', false);
      scratch(ctx, -1.8, -L * 0.3, -0.6, -L * 0.38, '#e9eef2');
      // Blood down the point, one run toward the guard.
      hard(ctx, [[-2.5, -L * 0.7], [0, -L + 0.6], [2.5, -L * 0.72], [1.6, -L * 0.6], [0.8, -L * 0.64], [0.2, -L * 0.5], [-0.6, -L * 0.62], [-1.6, -L * 0.57]], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [[0.3, -L * 0.52], [0.4, -L * 0.36]], 0.5, BLOOD, false);
      // Guard, wrapped grip, pommel.
      form(ctx, c => c.roundRect(-3.8, -5.8, 7.6, 2.8, 1), IRON, { line: 0.7 });
      stroke(ctx, [[-3, -4.9], [3, -4.9]], 0.3, IRON_HI, false);
      form(ctx, c => c.roundRect(-1.4, -3.2, 2.8, 6.6, 0.8), WOOD, { line: 0.7 });
      for (const y of [-2.2, -0.8, 0.6, 2]) stroke(ctx, [[-1.3, y + 0.5], [1.3, y - 0.3]], 0.4, LEATHER, false);
      disc(ctx, 0, 4.8, 2.2, BRONZE, { line: 0.7 });
      disc(ctx, 0, 4.8, 0.9, darken(BRONZE, 0.6), { line: 0.3 });
    },
  };
}

// Scutum carried on the off arm; held at its centre grip.
const shield = {
  box: [-9, -22, 12, 21],
  start: [0, 0],
  draw(ctx) {
    const outline = c => c.roundRect(-6.6, -19.6, 15.6, 37.6, 3.4);
    form(ctx, outline, RED, { shadow: darken(RED, 0.5), light: [2.4, -1.4], line: 0 });
    // Iron rim, then the ink line outside it.
    ctx.beginPath();
    outline(ctx);
    ctx.lineWidth = 2;
    ctx.strokeStyle = IRON;
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-7.6, -20.6, 17.6, 39.6, 4);
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = INK;
    ctx.stroke();
    for (const [x, y] of [[-6.4, -14], [-6.4, -4], [-6.4, 6], [-6.4, 14], [8.8, -14], [8.8, -4], [8.8, 6], [8.8, 14], [1.2, -19.4], [1.2, 17.8]]) {
      rivet(ctx, x, y, 0.4, IRON_HI);
    }
    // Worn wings and bolts round the boss.
    const gold = darken(BRONZE_HI, 0.85);
    stroke(ctx, [[1.2, -4.6], [-3.4, -10], [-1.4, -15.4]], 0.9, gold);
    stroke(ctx, [[1.2, -4.6], [5.6, -10], [4, -15.4]], 0.9, gold);
    stroke(ctx, [[1.2, 3.6], [-3.4, 9], [-1.4, 14]], 0.9, gold);
    stroke(ctx, [[1.2, 3.6], [5.6, 9], [4, 14]], 0.9, gold);
    stroke(ctx, [[1.2, -17], [1.2, -5]], 0.7, gold, false);
    stroke(ctx, [[1.2, 4], [1.2, 15.4]], 0.7, gold, false);
    // Iron boss.
    disc(ctx, 1.2, -0.5, 3.8, IRON, { line: 0.8 });
    disc(ctx, 1.2, -0.5, 1.7, BRONZE, { line: 0.5 });
    glint(ctx, 1.9, -1.3, 0.7, 0.45, BRONZE_HI, 0.95);
    // What the arena has done to it.
    scratch(ctx, -4.6, -12, 0.6, -7, CLOTH_TRIM);
    scratch(ctx, 3, 6.4, 7.4, 11.6, CLOTH_TRIM);
    scratch(ctx, 4.4, -16.4, 7.2, -12.6, CLOTH_TRIM);
    scratch(ctx, -5, 10.4, -2.6, 14.6, CLOTH_TRIM);
    hard(ctx, [[8.6, -9.6], [6.2, -8.6], [8.8, -7]], INK, { line: 0 });
  },
};

export default {
  id: 'gladiator',
  // Heavier, wider shadows than the kit default.
  mood: { shadow: 0.52, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head, shield },
  weapon,
};
