import { INK, darken, lighten, smooth, hard, stroke, disc, glint, band, form } from './kit.js';
import { part, body, face, scar as skinScar, scratch as metalScratch, rivet as stud } from './anatomy.js';

// Spanish conquistador, c.1520: blackened morion and peascod cuirass etched
// with gold, slashed sleeves showing crimson, tall boots, a long rapier. Cold
// eyes under the brim.
const SKIN = '#9b7658';
const HAIR = '#15100d';
const EYE = '#93a6aa';
const PLATE = '#2d2f36';
const PLATE_HI = '#8d939d';
const GOLD = '#80622a';
const GOLD_HI = '#cfa851';
const CLOTH = '#211b22';
const HOSE = '#33303a';
const CRIMSON = '#6e1220';
const LEATHER = '#241610';
const LEATHER_MID = '#47301f';
const LINEN = '#b5ae9c';
const BLADE = '#b4bcc4';
const BLADE_HI = '#eef2f5';
const BLOOD = '#5c0a12';

const plateLine = darken(PLATE, 0.45);
const fold = darken(CLOTH, 0.45);
const leatherLine = darken(LEATHER, 0.45);

const rivet = (ctx, x, y, r = 0.45, color = GOLD_HI) => stud(ctx, x, y, r, color);
const scratch = (ctx, x0, y0, x1, y1, hi = PLATE_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);

// An etched and gilded band following a plate's curve.
function gilt(ctx, pts, width = 1.1) {
  stroke(ctx, pts, width + 0.5, plateLine);
  stroke(ctx, pts, width, GOLD);
  stroke(ctx, pts.map(([x, y]) => [x + 0.2, y - 0.1]), 0.28, GOLD_HI);
}

// A hilt bar: gilt iron, inked, with a thin lit edge.
function bar(ctx, pts, width = 0.9) {
  stroke(ctx, pts, width + 0.6, INK);
  stroke(ctx, pts, width, GOLD);
  stroke(ctx, pts.map(([x, y]) => [x + 0.15, y - 0.15]), 0.25, GOLD_HI);
}

const torso = part('torso', (ctx) => {
  // Doublet and the top of the hose under the armour.
  body(ctx, 'torso', CLOTH);
  hard(ctx, [[-1.4, -5], [1.4, -5], [1.6, 6.6], [-1.6, 6.6]], darken(CRIMSON, 0.8), { line: 0 });

  // Tassets: lames hanging from the cuirass, back and front, lowest first.
  for (let i = 3; i >= 0; i--) {
    const y = -5.4 + i * 4;
    const d = i * 0.3;
    hard(ctx, [[-10 - d, y + 0.4], [-0.5, y], [-0.3, y + 4.9], [-10.4 - d, y + 5.3]], darken(PLATE, 0.85), { line: 0.7 });
    stroke(ctx, [[-9.6 - d, y + 4.5], [-1, y + 4.1]], 0.45, GOLD, false);
    rivet(ctx, -2, y + 2.2, 0.36);
    hard(ctx, [[0.5, y], [10.6 + d, y - 0.5], [11 + d, y + 4.4], [0.3, y + 4.9]], PLATE, { line: 0.7 });
    stroke(ctx, [[1, y + 4.1], [10.4 + d, y + 3.6]], 0.45, GOLD, false);
    stroke(ctx, [[1.4, y + 1], [9.6 + d, y + 0.5]], 0.28, PLATE_HI, false);
    rivet(ctx, 2, y + 2.2, 0.36);
    rivet(ctx, 9.4 + d, y + 1.9, 0.36);
  }
  scratch(ctx, 4.4, 2.6, 7.4, 5.4);
  scratch(ctx, -7.6, 6.4, -5.2, 8.6);

  // Peascod cuirass: the belly drawn down and forward to a point.
  smooth(ctx, [
    [-9.4, -11.6], [-11.2, -23], [-10.6, -32.6], [-6.6, -37.4], [0, -38.6], [7, -37],
    [11.4, -32], [12.6, -24], [12.3, -14], [13, -7.4], [10.8, -3.8], [3.6, -6.2], [-8.6, -5.2],
  ], PLATE);
  // Medial ridge and the turned edge at the waist.
  stroke(ctx, [[10.6, -32], [11.8, -24], [11.5, -14], [12.2, -7.6]], 0.4, PLATE_HI);
  stroke(ctx, [[9.4, -31.6], [10.6, -24], [10.3, -14], [11, -7.2]], 0.5, plateLine);
  glint(ctx, 9, -28.6, 1, 3.2, PLATE_HI, 0.45, 0.2);
  stroke(ctx, [[-8.6, -6.4], [3.4, -7.4], [10.4, -5]], 0.6, plateLine);
  // Etched gold bands down the breast.
  gilt(ctx, [[5.2, -36], [7.4, -26], [7.4, -15], [8, -7.4]]);
  gilt(ctx, [[-0.4, -37.4], [0.6, -26], [0.4, -15], [0.6, -8]]);
  gilt(ctx, [[-6.2, -36.2], [-6.9, -26], [-6.4, -15], [-5.8, -6.8]]);
  for (const y of [-30, -22, -14]) {
    stroke(ctx, [[-0.2, y], [0.9, y + 1.2]], 0.3, plateLine, false);
    stroke(ctx, [[6.6, y + 1], [7.8, y + 2.2]], 0.3, plateLine, false);
  }
  // Arm-hole roll.
  stroke(ctx, [[-4.4, -36], [-6.6, -30], [-4.6, -24.6], [-0.6, -27]], 0.5, plateLine);
  // What the campaign has done to it: sword cuts, a ball dent, old blood.
  scratch(ctx, 1.6, -31.6, 5, -27);
  scratch(ctx, -4.6, -20.4, -1.6, -17.6);
  scratch(ctx, 8.6, -19.6, 11, -17);
  disc(ctx, 3.6, -19.4, 1.3, darken(PLATE, 0.6), { line: 0.35 });
  glint(ctx, 3.9, -19.8, 0.5, 0.3, PLATE_HI, 0.7);
  glint(ctx, 4.4, -11.6, 1.8, 1, BLOOD, 0.75, 0.5);
  stroke(ctx, [[4.6, -11], [4.9, -8.4]], 0.45, BLOOD, false);

  // Gorget: two lames round the throat, gilt-edged.
  smooth(ctx, [[-8, -36.6], [-3.6, -40.4], [3.6, -40.2], [8, -36.4], [5.2, -32.8], [0, -31.8], [-5.2, -33]], darken(PLATE, 0.9));
  smooth(ctx, [[-6, -38.6], [-3.2, -41.6], [3.2, -41.4], [6, -38.4], [3.6, -36], [0, -35.4], [-3.6, -36.2]], PLATE, { line: 0.7 });
  stroke(ctx, [[-6.6, -35], [0, -33], [6.6, -34.8]], 0.5, GOLD);
  rivet(ctx, -4.6, -36, 0.38);
  rivet(ctx, 4.8, -35.8, 0.38);

  // Sword belt slung low across the hips, with a hanger at the back.
  hard(ctx, [[-9, -6.6], [-6.2, -5.8], [-7.6, 3.4], [-9.9, 2.8]], LEATHER_MID, { line: 0.6 });
  rivet(ctx, -8.4, 1, 0.4, PLATE_HI);
  hard(ctx, [[-9.9, -9.4], [-9.7, -6.9], [12.6, -0.3], [12.8, -2.8]], LEATHER, { line: 0.8 });
  stroke(ctx, [[-9, -8.4], [12, -2.2]], 0.28, LEATHER_MID, false);
  hard(ctx, [[3.4, -6.4], [6.4, -5.5], [6, -1.5], [3, -2.4]], GOLD, { line: 0.6 });
  hard(ctx, [[4.2, -5.2], [5.6, -4.8], [5.3, -2.7], [3.9, -3.1]], LEATHER, { line: 0.3 });
  for (const x of [-5, -1.4, 9]) disc(ctx, x, -6.6 + (x + 9.8) * 0.292, 0.35, INK, { line: 0 });
});

const upperArm = part('upper_arm', (ctx) => {
  body(ctx, 'upper_arm', CLOTH);
  // Puffed sleeve gathered above the elbow.
  smooth(ctx, [[-6.6, -2], [0, -5], [6.8, -2], [7.8, 5], [6.6, 12], [4.4, 17.4], [0, 19], [-4.2, 17.6], [-6.8, 12], [-7.6, 5]], CLOTH);
  // Slashes, the crimson lining pulled through.
  for (const [x, y0, y1] of [[-4.6, 4.6, 13.4], [-1.6, 5.4, 15.4], [1.6, 5.4, 15.6], [4.6, 4.6, 13.8]]) {
    const m = (y0 + y1) / 2;
    smooth(ctx, [[x, y0], [x + 1.05, m], [x, y1], [x - 1.05, m]], CRIMSON, { line: 0.45, shadow: darken(CRIMSON, 0.5) });
    stroke(ctx, [[x + 0.2, y0 + 1.4], [x + 0.3, y1 - 1.6]], 0.25, lighten(CRIMSON, 0.2), false);
  }
  stroke(ctx, [[-6, 14], [-3, 16.6]], 0.4, fold, false);
  stroke(ctx, [[5.6, 14], [3.4, 16.6]], 0.4, fold, false);
  band(ctx, 17, 19.6, -4.2, 4.4, darken(CLOTH, 0.8), { sag: 0.8 });
  stroke(ctx, [[-3.4, 18.6], [0, 19.3], [3.6, 18.4]], 0.3, GOLD);
  // Small pauldron of two lames, gilt at the lip.
  smooth(ctx, [[-7.4, -1.4], [0, -3.6], [7.6, -1.2], [7, 4], [0, 5.8], [-6.8, 4.2]], darken(PLATE, 0.88));
  stroke(ctx, [[-6.2, 3.2], [0, 4.7], [6.4, 3]], 0.45, GOLD);
  smooth(ctx, [[-7.2, -6], [0, -9.4], [7.4, -5.6], [8, -0.6], [3.6, 2.2], [-3.6, 2.2], [-7.8, -0.4]], PLATE);
  stroke(ctx, [[-6.4, -0.8], [-3.2, 1.2], [3.4, 1.2], [6.6, -0.8]], 0.5, GOLD);
  stroke(ctx, [[-0.2, -8.6], [0.2, 1.4]], 0.45, plateLine, false);
  glint(ctx, 3, -5.2, 2.2, 0.9, PLATE_HI, 0.5, -0.3);
  for (const [x, y] of [[-5.4, -1.8], [5.8, -1.6]]) rivet(ctx, x, y, 0.4);
  scratch(ctx, -4.6, -5.4, -1.6, -2.4);
  scratch(ctx, 2.6, -2.6, 5, -0.4);
});

const lowerArm = part('lower_arm', (ctx) => {
  // Close sleeve, creased at the elbow, one slash.
  body(ctx, 'lower_arm', CLOTH);
  stroke(ctx, [[-3.6, 0.6], [0, 1.8], [3.8, 0.4]], 0.45, fold);
  stroke(ctx, [[-3.8, 3.4], [-0.6, 4.6]], 0.4, fold, false);
  smooth(ctx, [[1.2, 2.6], [2.1, 5.6], [1.2, 8.4], [0.3, 5.6]], CRIMSON, { line: 0.4, shadow: darken(CRIMSON, 0.5) });
  // Gloved fist.
  body(ctx, 'fist', LEATHER);
  stroke(ctx, [[-2.6, 19.6], [0.4, 18.8], [3.6, 19.8]], 0.4, LEATHER_MID);
  stroke(ctx, [[1.4, 21.2], [1.2, 23.6]], 0.4, leatherLine, false);
  stroke(ctx, [[-0.9, 21.3], [-1.1, 23.8]], 0.4, leatherLine, false);
  // Flared gauntlet cuff, stitched, scuffed.
  hard(ctx, [[-5.6, 8.6], [5.8, 8], [4.2, 17.8], [-3.8, 18]], LEATHER_MID, { line: 0.8 });
  stroke(ctx, [[-4.8, 10], [5, 9.4]], 0.3, GOLD, false);
  for (const y of [11.4, 13.4, 15.4]) stroke(ctx, [[3.9 - (y - 11) * 0.14, y], [4.6 - (y - 11) * 0.14, y + 0.3]], 0.3, LINEN, false);
  stroke(ctx, [[-0.6, 9.6], [-0.4, 17.4]], 0.4, darken(LEATHER_MID, 0.5), false);
  stroke(ctx, [[-3.4, 12.6], [-1.8, 15]], 0.3, lighten(LEATHER_MID, 0.25), false);
});

const upperLeg = part('upper_leg', (ctx) => {
  // Hose to the knee.
  body(ctx, 'upper_leg', HOSE);
  stroke(ctx, [[-2.6, 25.4], [0.4, 27.4], [3.4, 25.8]], 0.5, darken(HOSE, 0.5));
  stroke(ctx, [[3.4, 23.6], [2.6, 28]], 0.4, darken(HOSE, 0.5), false);
  // Paned trunk hose: a crimson lining swelling between dark panes.
  smooth(ctx, [[-6.8, -3], [0, -5], [7.4, -2.4], [8.6, 8], [7.4, 16.6], [5, 20.6], [0, 21.8], [-5, 20.6], [-7.6, 16], [-8.2, 7]], darken(CRIMSON, 0.9));
  for (const x of [-5.5, -1.9, 1.8, 5.5]) {
    smooth(ctx, [[x - 1.2, -2.8], [x + 1.2, -3], [x + 1.55, 8], [x + 1, 20], [x - 1, 20], [x - 1.55, 8]], CLOTH, { line: 0.55 });
    stroke(ctx, [[x + 0.5, 0], [x + 0.7, 8], [x + 0.4, 17.6]], 0.25, GOLD);
  }
  // A pane cut through in some fight.
  stroke(ctx, [[0.6, 10.6], [3, 12.8]], 0.5, CRIMSON, false);
  // Gathered band and garter below.
  band(ctx, 19.6, 22.4, -5.6, 5.6, darken(CLOTH, 0.8), { sag: 1 });
  stroke(ctx, [[-4.8, 21.4], [0, 22.5], [4.8, 21.2]], 0.3, GOLD);
});

const lowerLeg = part('lower_leg', (ctx) => {
  // Tall boot, wrinkled at the ankle.
  body(ctx, 'lower_leg', LEATHER);
  stroke(ctx, [[2.8, 6], [3, 15], [2.4, 23]], 0.35, LEATHER_MID);
  stroke(ctx, [[-4.6, 9], [-3.6, 16], [-3, 21]], 0.45, leatherLine);
  for (const y of [20.4, 22.6, 24.6]) stroke(ctx, [[-2.8, y], [0, y + 0.9], [2.8, y - 0.2]], 0.4, leatherLine);
  stroke(ctx, [[-0.6, 7.4], [1, 9.6]], 0.3, lighten(LEATHER, 0.25), false);
  stroke(ctx, [[1.4, 13.6], [2.6, 16]], 0.3, lighten(LEATHER, 0.25), false);
  // Spur strap round the ankle with a small buckle.
  band(ctx, 26, 28, -3.2, 3.2, LEATHER_MID, { sag: 0.5, line: 0.5 });
  hard(ctx, [[0.8, 26.2], [2.4, 26.2], [2.4, 28.2], [0.8, 28.2]], GOLD, { line: 0.4 });
  // Turned-down top, the paler flesh side showing, stitched.
  hard(ctx, [[-6.4, -3.6], [6.2, -4.2], [7, 3.2], [4.2, 5.4], [-3, 5.2], [-7.4, 3.2]], LEATHER_MID, { line: 0.8 });
  stroke(ctx, [[-6.4, 2.2], [-2.6, 4], [4, 4.2], [6.4, 2.2]], 0.3, LINEN);
  stroke(ctx, [[-5.6, -2.4], [5.6, -3]], 0.4, darken(LEATHER_MID, 0.5), false);
  stroke(ctx, [[-1.6, -3], [-1.2, 4.6]], 0.4, darken(LEATHER_MID, 0.5), false);
  stroke(ctx, [[2.6, -1.6], [4.6, 1.4]], 0.3, lighten(LEATHER_MID, 0.25), false);
});

const foot = part('foot', (ctx) => {
  // Spur: neck and rowel behind the heel.
  stroke(ctx, [[-3.4, 0.9], [-5.2, 0]], 1.3, INK, false);
  stroke(ctx, [[-3.4, 0.9], [-5.2, 0]], 0.7, GOLD, false);
  disc(ctx, -5.3, -0.1, 0.95, GOLD_HI, { line: 0.4 });
  disc(ctx, -5.3, -0.1, 0.3, INK, { line: 0 });
  // Boot.
  body(ctx, 'foot', LEATHER);
  stroke(ctx, [[1.6, -1.4], [4, 0.8], [6.4, 1.6]], 0.4, leatherLine);
  stroke(ctx, [[5.4, 0.6], [5, 3.8]], 0.35, leatherLine, false);
  glint(ctx, 8, 2.4, 1.4, 0.5, lighten(LEATHER, 0.35), 0.5, 0.3);
  // Spur strap over the instep.
  stroke(ctx, [[-3.4, 0.6], [0.4, -0.8], [3.6, 0.4]], 1, LEATHER_MID);
  hard(ctx, [[0, -1.6], [1.5, -1.5], [1.5, 0], [0, -0.1]], GOLD, { line: 0.35 });
  // Sole and stacked heel.
  hard(ctx, [[-4.6, 4.2], [11, 4.2], [11.2, 5.6], [-4.8, 5.6]], darken(LEATHER, 0.7), { line: 0.6 });
  hard(ctx, [[-4.7, 4.3], [-1.2, 4.3], [-1.4, 6.3], [-4.7, 6.3]], LEATHER_MID, { line: 0.5 });
});

const head = part('head', (ctx) => {
  // The face: goatee and moustache, pale eye, a duelling scar.
  face(ctx, SKIN, { hair: HAIR, beard: 'goatee', eye: EYE });
  disc(ctx, 6.8, -13.2, 0.38, INK, { line: 0 });
  skinScar(ctx, SKIN, [[3.6, -12.4], [4.8, -8.6], [4.2, -5.6]], 0.45);
  // Dark hair at the nape below the helmet.
  hard(ctx, [[-7.6, -15.4], [-2.6, -15], [-2.8, -11.4], [-4.6, -7.2], [-5.4, -9], [-6.8, -6.8], [-7.6, -10]], HAIR, { line: 0.5 });
  // Small ruff at the neck.
  hard(ctx, [
    [-5.6, -1.4], [-4, -3], [-2.4, -1.8], [-0.8, -3.2], [0.8, -2], [2.4, -3.2], [4, -2], [5.4, -2.8],
    [6.2, -0.6], [5.2, 2], [3.8, 0.9], [2.2, 2.4], [0.6, 1.1], [-1, 2.6], [-2.6, 1.3], [-4.2, 2.6], [-6, 0.6],
  ], LINEN, { line: 0.6, shadow: darken(LINEN, 0.6) });
  for (const x of [-4, -0.8, 2.4]) stroke(ctx, [[x, -2.6], [x - 0.2, 2]], 0.3, darken(LINEN, 0.5), false);
  for (const x of [-2.4, 0.8, 4]) stroke(ctx, [[x, -1.6], [x - 0.2, 1]], 0.25, darken(LINEN, 0.65), false);

  // Morion. High comb, front to back.
  smooth(ctx, [
    [-9.4, -19.6], [-6.6, -27.4], [-1, -32.2], [4.4, -31.4], [8.8, -26], [10.2, -19.4],
    [6.6, -24], [2, -26.6], [-3, -26], [-6.8, -22.2],
  ], darken(PLATE, 0.9));
  stroke(ctx, [[-8, -22.6], [-5.6, -27.6], [-1, -31.2], [4.2, -30.4], [8, -25.6]], 0.35, PLATE_HI);
  stroke(ctx, [[-6.4, -24.6], [-2.6, -28.4], [2.6, -28.6], [7, -25.4]], 0.4, GOLD);
  // Bowl.
  smooth(ctx, [[-8.6, -16.4], [-7.8, -22], [-3, -26.2], [2, -26.8], [6.8, -24.4], [9.2, -20], [9.4, -16.6], [0, -14.8]], PLATE);
  glint(ctx, 4.6, -22.4, 2.4, 1.1, PLATE_HI, 0.5, 0.5);
  stroke(ctx, [[-5.6, -18], [-4.6, -22], [-1.4, -24.6]], 0.4, plateLine);
  scratch(ctx, -2.6, -23.6, 0.6, -19.6);
  scratch(ctx, 5.6, -21, 7.6, -18.6);
  // Etched band and rosette rivets above the brim.
  gilt(ctx, [[-8, -18.6], [0, -17], [8.8, -18.6]], 0.9);
  for (const x of [-6, -2, 2, 6]) rivet(ctx, x, -16.4 - Math.abs(x) * 0.1, 0.36);
  // Brim: low at the temples, sweeping up to a point front and back.
  smooth(ctx, [
    [-14, -20.6], [-8, -15.8], [0, -13.9], [8, -15.6], [15, -21.2], [9, -17.6], [0, -16.2], [-8, -17.8],
  ], PLATE);
  stroke(ctx, [[-12.6, -19.6], [-8, -16.6], [0, -14.8], [8, -16.4], [13.6, -20]], 0.35, PLATE_HI);
  stroke(ctx, [[-8.6, -17.2], [0, -15.6], [8.8, -17]], 0.3, GOLD);
});

// Rapier, drawn tip-up from the grip. `length` is grip-to-tip in rig units.
function weapon(length) {
  return {
    box: [-7, -length - 2, 7, 10],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      // Blade: very long and narrow, a short fuller, blood at the point.
      hard(ctx, [[-0.95, -5], [-0.6, -L * 0.62], [0, -L], [0.6, -L * 0.62], [0.95, -5]], BLADE, { shadow: darken(BLADE, 0.55), light: [0.7, 0], line: 0.7 });
      stroke(ctx, [[0, -9], [0, -L * 0.42]], 0.35, darken(BLADE, 0.5), false);
      stroke(ctx, [[0.45, -L * 0.44], [0.3, -L * 0.8]], 0.25, BLADE_HI, false);
      hard(ctx, [[-0.5, -L * 0.72], [0, -L + 0.5], [0.5, -L * 0.74], [0.2, -L * 0.69]], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [[-0.2, -L * 0.7], [-0.3, -L * 0.6]], 0.4, BLOOD, false);
      scratch(ctx, -0.5, -L * 0.3, 0.4, -L * 0.33, BLADE_HI);
      // Ricasso.
      hard(ctx, [[-1.1, -9], [1.1, -9], [1.1, -4.6], [-1.1, -4.6]], darken(BLADE, 0.7), { line: 0.5 });
      // Swept hilt: side rings and bars curling up round the ricasso.
      bar(ctx, [[-1.2, -5], [-3.6, -6.6], [-3.2, -9.4], [-0.9, -10.2]], 0.7);
      bar(ctx, [[1.2, -5], [3.6, -6.8], [3.2, -9.6], [0.9, -10.2]], 0.7);
      bar(ctx, [[-4.6, -3.6], [-1.6, -7.6], [2.6, -8.8]], 0.6);
      // Quillons, recurved.
      bar(ctx, [[-5.8, -2.6], [-4.4, -4.2], [0, -4.6], [4.4, -5], [5.8, -6.6]], 1.1);
      disc(ctx, -5.8, -2.6, 0.7, GOLD_HI, { line: 0.4 });
      disc(ctx, 5.8, -6.6, 0.7, GOLD_HI, { line: 0.4 });
      // Wire-bound grip.
      form(ctx, c => c.roundRect(-1.2, -4.2, 2.4, 8.6, 0.7), LEATHER, { line: 0.7 });
      for (let y = -3.4; y <= 3.6; y += 1.1) stroke(ctx, [[-1.1, y + 0.4], [1.1, y - 0.3]], 0.3, PLATE_HI, false);
      // Knuckle bow from the forward quillon down to the pommel.
      bar(ctx, [[4, -4.8], [5.6, -1], [4.8, 3.4], [1.4, 5.6]], 0.8);
      // Pommel.
      disc(ctx, 0, 6, 1.7, GOLD, { line: 0.7 });
      disc(ctx, 0, 6, 0.6, darken(GOLD, 0.6), { line: 0.3 });
      glint(ctx, 0.6, 5.4, 0.5, 0.3, GOLD_HI, 0.9);
    },
  };
}

export default {
  id: 'conquistador',
  mood: { shadow: 0.52, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head },
  weapon,
};
