import { INK, darken, lighten, smooth, hard, stroke, disc, glint, glow, band, form } from './kit.js';
import { part, body, scratch as metalScratch, rivet as stud } from './anatomy.js';

// Sengoku samurai, c.1600: black and crimson lacquer laced in dried-blood
// silk, a crescent-crested kabuto over a snarling menpo, and a katana with
// its last cut still on it.
const LACQUER = '#1e1c22';
const LACQUER_HI = '#62606e';
const CRIMSON = '#6a141d';
const CRIMSON_HI = '#a3323a';
const LACE = '#8a1f29';
const GOLD = '#8a6f34';
const GOLD_HI = '#c9a85a';
const CLOTH = '#1d222e';
const CLOTH_DARK = '#10131b';
const SLEEVE = '#262a37';
const GLOVE = '#33241a';
const TABI = '#8d8875';
const STRAW = '#84713f';
const STRAW_DARK = '#4a3d20';
const MENPO = '#4a1218';
const TOOTH = '#cbc2a2';
const WHISKER = '#a9a391';
const STEEL = '#a6aeb6';
const RAYSKIN = '#aaa28c';
const EMBER = '#ff2a1a';
const BLOOD = '#4f0a11';

const rivet = (ctx, x, y, r = 0.4, color = GOLD_HI) => stud(ctx, x, y, r, color);
const scratch = (ctx, x0, y0, x1, y1, hi = LACQUER_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// A panel of laced lames between four corners: black rows with a lacquer
// sheen, columns of silk lacing, and the bottom row in crimson with a gilt
// hem. Used for the sode, the kusazuri and the throat guard.
function lames(ctx, tl, tr, br, bl, rows, cols = 4) {
  hard(ctx, [tl, tr, br, bl], LACQUER, { line: 0.7 });
  const last = (rows - 1) / rows;
  hard(ctx, [mix(tl, bl, last), mix(tr, br, last), br, bl], CRIMSON, { line: 0.5 });
  for (let i = 0; i < rows; i++) {
    const a = mix(tl, bl, i / rows);
    const b = mix(tr, br, i / rows);
    if (i) stroke(ctx, [a, b], 0.5, INK, false);
    const a2 = mix(tl, bl, (i + 0.22) / rows);
    const b2 = mix(tr, br, (i + 0.22) / rows);
    stroke(ctx, [mix(a2, b2, 0.08), mix(a2, b2, 0.92)], 0.28, i === rows - 1 ? CRIMSON_HI : LACQUER_HI, false);
    if (i === rows - 1) continue;
    for (let j = 0; j < cols; j++) {
      const u = (j + 0.5) / cols;
      const p = mix(mix(tl, bl, (i + 0.5) / rows), mix(tr, br, (i + 0.5) / rows), u);
      const q = mix(mix(tl, bl, (i + 1.12) / rows), mix(tr, br, (i + 1.12) / rows), u);
      stroke(ctx, [p, q], 0.55, LACE, false);
    }
  }
  stroke(ctx, [[bl[0] + 0.6, bl[1] - 0.6], [br[0] - 0.6, br[1] - 0.6]], 0.35, GOLD, false);
}

const torso = part('torso', (ctx) => {
  // Under-robe.
  body(ctx, 'torso', CLOTH);

  // Kusazuri: three skirt plates hung from the cuirass on cords, the front
  // one lowest.
  for (const x of [-8.6, -6, -2.4, 0.6, 5, 9.4]) stroke(ctx, [[x, -5], [x - 0.2, -0.4]], 0.6, LACE, false);
  lames(ctx, [-10.4, -1.4], [-4.8, -1.6], [-4.6, 14.4], [-12.6, 13.4], 4, 2);
  lames(ctx, [-4.2, -1.6], [2.6, -1.8], [3.4, 15.4], [-4.6, 15], 4, 3);
  lames(ctx, [3, -1.8], [10.4, -2], [12.8, 16.8], [4, 17.4], 4, 3);
  scratch(ctx, 5.6, 4.4, 9, 7.6);
  scratch(ctx, -2.4, 8.4, 0.6, 10.2);

  // Do: black lacquer cuirass of horizontal lames.
  smooth(ctx, [
    [8.8, -5.4], [9.8, -17], [12.4, -26], [11.2, -32.6], [6.6, -36.6], [-6.6, -36.8],
    [-10.8, -32.6], [-11.4, -24], [-9.2, -14], [-8.8, -5.4],
  ], LACQUER);
  for (const [y, x0, x1] of [[-30.6, -10.2, 11], [-26.4, -10.8, 11.8], [-22.2, -10.6, 10.8], [-18, -9.8, 9.8], [-13.8, -8.8, 9.2], [-9.6, -8.4, 8.8]]) {
    stroke(ctx, [[x0, y], [(x0 + x1) / 2, y + 0.7], [x1, y - 0.2]], 0.5, INK);
    stroke(ctx, [[x0 + 1, y + 1], [(x0 + x1) / 2, y + 1.6], [x1 - 1.2, y + 0.8]], 0.28, LACQUER_HI);
    // Lacing in pairs between the lames.
    for (const x of [-6.4, -2.2, 2, 6.2]) {
      stroke(ctx, [[x - 0.45, y - 2.6], [x - 0.45, y - 0.4]], 0.5, LACE, false);
      stroke(ctx, [[x + 0.45, y - 2.6], [x + 0.45, y - 0.4]], 0.5, LACE, false);
    }
  }
  glint(ctx, 8.6, -28.6, 2.2, 0.9, LACQUER_HI, 0.5, -0.5);
  // Crimson breast plate with a gilt edge, and the shoulder straps.
  hard(ctx, [[-7.4, -37], [6.8, -36.8], [10.6, -33.4], [10.4, -31.8], [-10, -32]], CRIMSON, { line: 0.6 });
  stroke(ctx, [[-9, -32.7], [9.6, -32.5]], 0.35, GOLD, false);
  for (const x of [-6, -2, 2, 6]) rivet(ctx, x, -34.6, 0.36);
  hard(ctx, [[-6.4, -40], [-3.4, -40.8], [-2.6, -36.4], [-6, -36]], LACQUER, { line: 0.6 });
  hard(ctx, [[2.4, -40.6], [5.2, -39.4], [6.6, -36.2], [3, -36.4]], LACQUER, { line: 0.6 });
  // Gilt mon on the chest.
  disc(ctx, 4.6, -24.4, 2.3, GOLD, { line: 0.5 });
  disc(ctx, 4.6, -24.4, 1, LACQUER, { line: 0.3 });
  for (let a = 0; a < 5; a++) stroke(ctx, [[4.6 + Math.cos(a * 1.257) * 1.1, -24.4 + Math.sin(a * 1.257) * 1.1], [4.6 + Math.cos(a * 1.257) * 2.1, -24.4 + Math.sin(a * 1.257) * 2.1]], 0.3, LACQUER, false);
  // A sword cut across the lames, lacing severed; blood below it.
  scratch(ctx, -7.6, -22.6, -1.4, -15.4);
  stroke(ctx, [[-4, -18.2], [-4.6, -15.6]], 0.45, LACE, false);
  glint(ctx, -4.4, -13.4, 1.2, 1.8, BLOOD, 0.7, 0.2);

  // Obi tied over the waist, knot and tails at the front.
  hard(ctx, [[-9.2, -8.8], [9, -9.6], [9.3, -4.6], [-9.4, -3.8]], darken(CRIMSON, 0.7), { line: 0.7 });
  stroke(ctx, [[-8.6, -6.6], [8.6, -7.4]], 0.35, CLOTH_DARK, false);
  hard(ctx, [[5, -7.4], [7.4, -6.4], [8.4, 0.4], [6.6, -0.6], [5.6, 1.6], [4.6, -4]], darken(CRIMSON, 0.7), { line: 0.5 });
  disc(ctx, 6, -7.2, 1.7, CRIMSON, { line: 0.5 });
});

const upperArm = part('upper_arm', (ctx) => {
  // Armoured sleeve: cloth sewn with mail and small plates.
  body(ctx, 'upper_arm', SLEEVE);
  for (const y of [13.4, 15.4, 17.4]) stroke(ctx, [[-3.8, y], [0, y + 0.8], [4, y]], 0.3, LACQUER_HI);
  hard(ctx, [[-1.4, 13], [2.2, 13], [2, 19.4], [-1.2, 19.4]], LACQUER, { line: 0.5 });
  stroke(ctx, [[0.4, 13.8], [0.4, 18.6]], 0.28, LACQUER_HI, false);
  // Elbow tie.
  band(ctx, 19, 20.6, -3.8, 4.2, LACE, { sag: 0.6, line: 0.5 });

  // Sode: big rectangular shoulder plate of laced lames.
  lames(ctx, [-7.4, -6.4], [7.6, -6.4], [8.2, 12.6], [-8, 12.6], 5, 4);
  // Crimson cap plate with a gilt rim and the cords that hang it.
  hard(ctx, [[-7.6, -9.4], [7.8, -9.4], [8, -6], [-7.8, -6]], CRIMSON, { line: 0.6 });
  stroke(ctx, [[-7, -6.8], [7.2, -6.8]], 0.35, GOLD, false);
  for (const x of [-5.4, -1.8, 1.8, 5.4]) rivet(ctx, x, -8, 0.38);
  stroke(ctx, [[-3, -9.6], [-1.6, -12.6], [0.6, -13.4]], 0.7, LACE);
  stroke(ctx, [[3.4, -9.6], [2.4, -12.4], [0.6, -13.4]], 0.7, LACE);
  glint(ctx, 3.6, -3.6, 2.6, 0.6, LACQUER_HI, 0.5);
  // Cuts through the lacquer, one row of lacing hanging loose.
  scratch(ctx, -5.6, -3.6, -1.6, 1.6);
  scratch(ctx, 2.4, 3.4, 6.4, 6.6);
  stroke(ctx, [[-2, 6.4], [-2.6, 9], [-1.8, 11]], 0.45, LACE);
});

const lowerArm = part('lower_arm', (ctx) => {
  // Kote: cloth sleeve with mail between long splints.
  body(ctx, 'lower_arm', SLEEVE);
  for (const y of [2, 4.4, 6.8, 9.2, 11.6]) stroke(ctx, [[-4, y], [0, y + 0.7], [4, y]], 0.28, LACQUER_HI);
  for (const [x, w] of [[-2.6, 1.3], [0.2, 1.5], [2.8, 1.2]]) {
    hard(ctx, [[x - w / 2, 0.8], [x + w / 2, 0.8], [x + w / 2 - 0.15, 13], [x - w / 2 + 0.15, 13]], LACQUER, { line: 0.5 });
    stroke(ctx, [[x + 0.15, 1.6], [x + 0.1, 12.2]], 0.26, LACQUER_HI, false);
    rivet(ctx, x, 2, 0.26);
    rivet(ctx, x, 11.8, 0.26);
  }
  // Elbow plate.
  disc(ctx, 0, -0.6, 2.7, LACQUER, { line: 0.6 });
  disc(ctx, 0, -0.6, 1.1, GOLD, { line: 0.35 });
  scratch(ctx, -1.4, 5.4, 1.2, 8.4);
  // Gloved fist under a lacquered hand guard; wrist cord.
  body(ctx, 'fist', GLOVE);
  stroke(ctx, [[1.4, 21.6], [1.2, 23.6]], 0.4, INK, false);
  stroke(ctx, [[-0.9, 21.7], [-1.1, 23.8]], 0.4, INK, false);
  hard(ctx, [[-3.8, 14.8], [3.8, 14.6], [4.4, 19.4], [0.6, 21], [-3.6, 19.4]], LACQUER, { line: 0.6 });
  stroke(ctx, [[-3, 15.8], [3.2, 15.6]], 0.28, LACQUER_HI, false);
  disc(ctx, 0.4, 18, 1, GOLD, { line: 0.3 });
  band(ctx, 13, 14.8, -3.5, 3.5, LACE, { sag: 0.5, line: 0.5 });
});

const upperLeg = part('upper_leg', (ctx) => {
  // Hakama: dark pleated cloth gathered below the knee.
  body(ctx, 'upper_leg', CLOTH);
  stroke(ctx, [[-4, -1], [-4.6, 12], [-3.6, 26]], 0.55, CLOTH_DARK);
  stroke(ctx, [[-1.4, 13], [-1.2, 20], [-0.8, 27]], 0.5, CLOTH_DARK);
  stroke(ctx, [[4.6, 14], [3.8, 21], [3, 27]], 0.5, CLOTH_DARK);
  stroke(ctx, [[1.6, 15.4], [1.4, 26]], 0.3, lighten(CLOTH, 0.12), false);
  // A slash in the cloth, stained.
  hard(ctx, [[-5.4, 15.6], [-2.4, 18.2], [-2.8, 19], [-5.6, 17]], CLOTH_DARK, { line: 0.35 });
  glint(ctx, -3.6, 20.4, 1.1, 1.6, BLOOD, 0.65, 0.2);
  band(ctx, 26.6, 28.6, -4.6, 5, LACE, { sag: 0.8, line: 0.5 });
  stroke(ctx, [[3, 28.4], [4.2, 31], [2.6, 31.8]], 0.5, LACE);

  // Haidate: thigh guard of small lacquered plates sewn to an apron.
  hard(ctx, [[-2.8, -2.6], [6.4, -2.4], [7.6, 9], [6.9, 13.2], [-2.4, 13.4], [-3.2, 6]], LACQUER, { line: 0.7 });
  for (const y of [1.4, 5.4, 9.4]) stroke(ctx, [[-2.9, y], [7, y - 0.2]], 0.45, INK, false);
  for (const x of [0.2, 3.4]) stroke(ctx, [[x, -2.4], [x + 0.4, 13.2]], 0.4, INK, false);
  for (const y of [-0.6, 3.4, 7.4, 11.4]) {
    for (const x of [-1.2, 1.9, 5.2]) glint(ctx, x, y, 0.42, 0.42, LACE, 1);
    stroke(ctx, [[-2.2, y - 1.2], [6.2, y - 1.3]], 0.26, LACQUER_HI, false);
  }
  stroke(ctx, [[-2.2, 12.7], [6.6, 12.5]], 0.35, GOLD, false);
  scratch(ctx, 1, 2.4, 4.6, 6.4);
});

const lowerLeg = part('lower_leg', (ctx) => {
  // Cloth leggings.
  body(ctx, 'lower_leg', CLOTH);
  stroke(ctx, [[-5, 6], [-5, 12], [-3.4, 20]], 0.45, CLOTH_DARK);
  // Ties round the calf.
  band(ctx, 4.6, 6.4, -6, 0, LACE, { sag: 0.5, line: 0.5 });
  band(ctx, 20, 21.8, -3.7, 0, LACE, { sag: 0.4, line: 0.5 });
  // Tateage: padded knee guard standing above the shin plates.
  smooth(ctx, [[-2.4, 1], [-2.8, -5.6], [1.4, -9], [5.4, -5.4], [5.6, 1.4]], CRIMSON);
  stroke(ctx, [[-1.6, -4.4], [1.4, -7.2], [4.6, -4.2]], 0.35, GOLD);
  for (const [x, y] of [[0, -3], [3, -3], [1.5, -5.2], [1.5, -0.8]]) glint(ctx, x, y, 0.4, 0.4, GOLD_HI, 0.9);
  // Suneate: three vertical splints hinged with mail.
  hard(ctx, [[-2, 0.6], [5.4, 0.4], [5.2, 9], [4.2, 26.6], [-0.4, 27], [-1.2, 12]], darken(LACQUER, 0.8), { line: 0.6 });
  for (const [x0, x1, top] of [[-1.6, 0.6, 1.2], [1.2, 3.2, 0.8], [3.7, 5.2, 1.2]]) {
    const k = (x0 + x1) / 2 > 2 ? -0.045 : 0.03;
    hard(ctx, [[x0, top], [x1, top], [x1 + k * 25 - 0.1, 26], [x0 + k * 25 + 0.25, 26]], LACQUER, { line: 0.5 });
    stroke(ctx, [[(x0 + x1) / 2 + 0.2, top + 1], [(x0 + x1) / 2 + 0.2 + k * 22, 24.6]], 0.28, LACQUER_HI, false);
    rivet(ctx, (x0 + x1) / 2, top + 1.4, 0.26);
    rivet(ctx, (x0 + x1) / 2 + k * 23, 24.6, 0.26);
  }
  scratch(ctx, 1.4, 10.4, 3.8, 14.4);
  scratch(ctx, -0.6, 17.4, 0.8, 20);
  glint(ctx, 2.2, 25.2, 1.8, 0.9, STRAW_DARK, 0.5);
});

const foot = part('foot', (ctx) => {
  // Tabi, grimed, split at the toe.
  body(ctx, 'foot', TABI);
  stroke(ctx, [[8.4, 1.6], [8.2, 4.4]], 0.5, darken(TABI, 0.45), false);
  stroke(ctx, [[-2.4, -1.4], [-1.6, 2.6]], 0.35, darken(TABI, 0.55), false);
  glint(ctx, 3, 3.6, 3.4, 0.8, darken(TABI, 0.5), 0.6);
  // Waraji: plaited straw sole, cords over the foot and round the ankle.
  hard(ctx, [[-4.6, 4.2], [11, 4.2], [11.4, 5.9], [-4.8, 5.9]], STRAW, { line: 0.6 });
  for (let x = -3.6; x <= 10.4; x += 1.4) stroke(ctx, [[x, 4.5], [x + 0.6, 5.7]], 0.3, STRAW_DARK, false);
  stroke(ctx, [[8.2, 4.2], [5.6, 0.2], [1.4, -2.4]], 0.8, STRAW);
  stroke(ctx, [[5.6, 0.2], [3.6, 4.2]], 0.8, STRAW, false);
  stroke(ctx, [[1.4, -2.4], [-3.4, 4.2]], 0.8, STRAW, false);
  stroke(ctx, [[1.6, -2.2], [1, 4.2]], 0.7, STRAW, false);
  band(ctx, -3.6, -2, -3.5, 3, STRAW, { sag: 0.4, line: 0.5 });
  stroke(ctx, [[-3, -2.8], [2.6, -2.7]], 0.3, STRAW_DARK, false);
});

const head = part('head', (ctx) => {
  // Neck in shadow, wrapped.
  body(ctx, 'neck', CLOTH_DARK);
  // Shikoro: four lames flaring down and back over the neck, lowest first.
  for (let i = 3; i >= 0; i--) {
    const xb = -10.2 - i * 1.4;
    const y = -12 + i * 2.9;
    hard(ctx, [[xb + 1, y], [-1.5 + i * 0.4, y - 0.6], [-1 + i * 0.5, y + 3.4], [xb - 0.6, y + 4.2]], i === 3 ? CRIMSON : LACQUER, { line: 0.6 });
    stroke(ctx, [[xb + 0.8, y + 1.1], [-1.8 + i * 0.4, y + 0.5]], 0.28, i === 3 ? CRIMSON_HI : LACQUER_HI, false);
    if (i < 3) for (let x = xb + 2; x < -2; x += 2.4) stroke(ctx, [[x, y + 1.8], [x - 0.15, y + 4.2]], 0.5, LACE, false);
  }
  stroke(ctx, [[-14.4, 0.2], [-1, -0.4]], 0.35, GOLD, false);
  // Throat guard hanging from the mask.
  lames(ctx, [1.4, -0.8], [9.6, 0.6], [8.8, 4.2], [0.8, 3.6], 2, 3);

  // Maedate: gilt crescent rising off the brow.
  hard(ctx, [
    [-1.6, -35], [0.4, -27.6], [3.8, -22.8], [7.6, -20.6], [11.4, -22.4], [14.4, -27.4], [15.6, -35],
    [13.2, -29.4], [10.6, -26], [7.5, -24.6], [4.4, -26], [1.6, -29.6],
  ], GOLD);
  stroke(ctx, [[-0.4, -31.6], [2.2, -26.6], [5, -23.8], [7.6, -22.8]], 0.35, GOLD_HI);
  scratch(ctx, 11.2, -24.6, 13.2, -27.6, GOLD_HI);
  hard(ctx, [[13.6, -30.4], [14.9, -31.4], [14.6, -29.4]], INK, { line: 0 });

  // Hachi: ribbed black bowl with a gilt finial.
  smooth(ctx, [[-9.4, -11.6], [-9, -17.6], [-4, -22.8], [3.6, -23.2], [8.8, -19], [10.2, -12.6], [0, -11]], LACQUER);
  for (const [x1, y1, xm, ym] of [[-7.6, -12, -6.4, -18.4], [-3.6, -11.6, -3, -18.6], [0.6, -11.4, 0.4, -18.8], [4.8, -11.8, 3.8, -18.6], [8.6, -12.6, 6.6, -18.6]]) {
    stroke(ctx, [[0, -22.8], [xm, ym], [x1, y1]], 0.4, INK);
    stroke(ctx, [[0.5, -22.4], [xm + 0.5, ym + 0.2], [x1 + 0.5, y1 - 0.4]], 0.24, LACQUER_HI);
  }
  disc(ctx, 0, -23.4, 1.2, GOLD, { line: 0.4 });
  glint(ctx, 5.4, -19.4, 2, 0.8, LACQUER_HI, 0.5, 0.6);
  scratch(ctx, -6.4, -19, -2.6, -15);
  // Crest mount.
  hard(ctx, [[6.4, -21.4], [8.8, -21], [9.8, -15], [7, -14.6]], GOLD, { line: 0.5 });
  rivet(ctx, 8.1, -17.4, 0.4);
  // Rim band and the turned-back wing by the temple.
  hard(ctx, [[-9.8, -13], [0, -12.4], [2, -12.6], [2.2, -10.4], [0, -10], [-9.8, -10.6]], CRIMSON, { line: 0.6 });
  for (const x of [-8, -5, -2]) rivet(ctx, x, -11.6, 0.32);
  smooth(ctx, [[-3.6, -13.4], [1, -15.6], [2, -11], [-0.6, -7.6], [-3.4, -9]], CRIMSON);
  disc(ctx, -0.8, -11.6, 1.2, GOLD, { line: 0.35 });

  // The face: shadow under the peak, a dim red light where the eye is.
  hard(ctx, [[1.8, -12], [11.2, -12.4], [11.6, -8], [1.8, -7.8]], '#0b0809', { line: 0.4 });
  glow(ctx, 7.8, -10, 3, EMBER);
  hard(ctx, [[5.8, -10.6], [9.6, -9.6], [9.5, -9], [5.9, -9.8]], '#ff7a52', { line: 0.3, shadow: EMBER, light: [0, 0.3] });

  // Menpo: lacquered snarl, hooked nose, bared teeth, bristling whiskers.
  hard(ctx, [[1.6, -8.4], [5.6, -7.8], [9.8, -9], [13, -7.2], [11.6, -5.8], [12, -3.2], [9.8, 0.8], [6.4, 2.4], [2.2, -1.2]], MENPO, { line: 0.8 });
  stroke(ctx, [[9.8, -8.4], [10.6, -6.6], [9.4, -5.8]], 0.4, darken(MENPO, 0.45));
  stroke(ctx, [[3, -6.6], [5.8, -5.4], [7.4, -3]], 0.4, darken(MENPO, 0.45));
  stroke(ctx, [[3, -4.4], [5, -3], [5.8, -0.4]], 0.4, darken(MENPO, 0.45));
  glint(ctx, 11.4, -7.2, 0.9, 0.45, CRIMSON_HI, 0.8, 0.5);
  hard(ctx, [[7, -4.4], [11.6, -4.8], [11.4, -2.2], [7.6, -1.8]], '#0b0809', { line: 0.4 });
  for (const x of [7.8, 8.8, 9.8, 10.8]) {
    hard(ctx, [[x - 0.4, -4.5], [x + 0.4, -4.55], [x, -3.5]], TOOTH, { line: 0 });
    hard(ctx, [[x - 0.4, -2], [x + 0.4, -2.05], [x, -2.9]], TOOTH, { line: 0 });
  }
  stroke(ctx, [[12, -5.4], [8.6, -5.4], [5.6, -6.8]], 1.1, WHISKER);
  stroke(ctx, [[8.6, -5.4], [6, -4.6]], 0.5, WHISKER, false);
  hard(ctx, [[8, 0.6], [9.8, 0.4], [9.4, 3.4], [8.4, 2]], WHISKER, { line: 0.4 });
  rivet(ctx, 3.2, -2, 0.36);
  // Helmet cord tied under the chin.
  stroke(ctx, [[0.6, -10.4], [1.6, -5], [4.4, -0.2]], 0.7, LACE);

  // Mabizashi: the peak, casting the eyes into shade.
  smooth(ctx, [[0.6, -13.8], [10.4, -14.6], [14.8, -11.8], [14, -10.8], [1.6, -11.2]], LACQUER);
  stroke(ctx, [[2, -11.8], [8, -11.6], [13.6, -11.4]], 0.35, GOLD);
  for (const x of [3.4, 6.4, 9.4]) rivet(ctx, x, -12.9, 0.3);
});

// Katana, drawn tip-up from the grip; the blade bows toward +x at the tip
// with the cutting edge on the outside of the curve (-x).
function weapon(length) {
  return {
    // Authored with the edge on -x; flipped so the edge leads and the tip
    // sweeps back.
    mirror: true,
    box: [-6, -length - 2, 9, 10],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      const curve = t => 4.6 * t * t;
      const width = t => 3.2 - 0.9 * t;
      const t0 = 6 / L;
      const N = 10;
      const edge = [];
      const spine = [];
      const hamon = [];
      const ridge = [];
      for (let i = 0; i <= N; i++) {
        const t = t0 + (0.93 - t0) * (i / N);
        const c = curve(t);
        const w = width(t);
        edge.push([c - w / 2, -L * t]);
        spine.push([c + w / 2, -L * t]);
        hamon.push([c - w / 2 + 1 + 0.32 * Math.sin(i * 2.1), -L * t]);
        ridge.push([c + w / 2 - 0.95, -L * t]);
      }
      const tip = [curve(1) + width(1) / 2 - 0.1, -L];
      // Blade.
      hard(ctx, [...edge, tip, ...spine.slice().reverse()], STEEL, { shadow: darken(STEEL, 0.55), light: [1.2, 0] });
      // Hardened edge, paler, with the wandering hamon line above it.
      hard(ctx, [...edge, ...hamon.slice().reverse()], lighten(STEEL, 0.5), { line: 0, shadow: lighten(STEEL, 0.5) });
      stroke(ctx, hamon, 0.3, darken(STEEL, 0.6));
      stroke(ctx, [...ridge, [tip[0] - 0.5, -L + 1.6]], 0.35, darken(STEEL, 0.5));
      // Blood run along the edge near the tip; a notch.
      hard(ctx, [edge[N], tip, ridge[N], ridge[N - 1], hamon[N - 2], edge[N - 3], edge[N - 1]], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [edge[N - 3], [edge[N - 4][0] + 0.5, edge[N - 4][1]], [edge[N - 5][0] + 0.6, edge[N - 5][1]]], 0.5, BLOOD);
      hard(ctx, [[edge[4][0] - 0.1, edge[4][1] - 0.7], [edge[4][0] + 0.7, edge[4][1]], [edge[4][0] - 0.1, edge[4][1] + 0.7]], INK, { line: 0 });
      // Habaki collar.
      hard(ctx, [[-1.7, -7.4], [1.8, -7.4], [1.7, -4.6], [-1.7, -4.6]], GOLD, { line: 0.5 });
      stroke(ctx, [[-1.2, -6.6], [1.3, -6.6]], 0.28, GOLD_HI, false);
      // Tsuka: ray skin under a diamond wrap, menuki, kashira.
      form(ctx, c => c.roundRect(-1.5, -3.4, 3, 11, 0.6), RAYSKIN, { line: 0.7 });
      for (let y = -3; y < 6.4; y += 1.9) {
        stroke(ctx, [[-1.5, y], [1.5, y + 1.9]], 0.6, LACQUER, false);
        stroke(ctx, [[1.5, y], [-1.5, y + 1.9]], 0.6, LACQUER, false);
      }
      glint(ctx, 0, 2.7, 0.5, 0.9, GOLD_HI, 0.9);
      form(ctx, c => c.roundRect(-1.7, 7, 3.4, 2, 0.6), LACQUER, { line: 0.6 });
      // Round tsuba, seen on edge.
      form(ctx, c => c.ellipse(0, -4, 4.6, 1.5, 0, 0, Math.PI * 2), LACQUER, { line: 0.7 });
      stroke(ctx, [[-3.4, -4.4], [3.4, -4.4]], 0.3, GOLD, false);
    },
  };
}

export default {
  id: 'samurai',
  // Deep shadows so the lacquer reads as black with a thin sheen.
  mood: { shadow: 0.5, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head },
  weapon,
};
