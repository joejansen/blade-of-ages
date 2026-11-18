import { INK, darken, lighten, spline, smooth, hard, stroke, disc, glint, band } from './kit.js';
import { part, body, face, scar as skinScar, scratch as metalScratch, rivet as stud, at } from './anatomy.js';

// Norse raider, c.900, as a veteran of too many shield walls: black mail
// under a wolf pelt, a spectacle helm with a mail curtain, a split and
// blooded plank shield, and a bearded axe.
const SKIN = '#a0714d';
const BEARD = '#6a3016';
const MAIL = '#3b3e45';
const MAIL_HI = '#8a909a';
const IRON = '#4a4d55';
const IRON_HI = '#969ca6';
const FUR = '#4b3d30';
const FUR_DARK = '#2a2119';
const LEATHER = '#4a2d1b';
const LEATHER_DARK = '#28170e';
const TUNIC = '#4a281d';
const WOOL = '#2b2f38';
const WRAP = '#5e5440';
const WOOD = '#4a321d';
const BONE = '#8f866c';
const PAINT_RED = '#6b181b';
const PAINT_PALE = '#8a8168';
const RAWHIDE = '#5a4630';
const STEEL = '#a4acb4';
const BLOOD = '#5c0a12';

const crease = darken(SKIN, 0.5);
const mailLine = darken(MAIL, 0.5);
const furLine = darken(FUR, 0.45);

const rivet = (ctx, x, y, r = 0.5, color = IRON_HI) => stud(ctx, x, y, r, color);
const scar = (ctx, pts, width) => skinScar(ctx, SKIN, pts, width);
const scratch = (ctx, x0, y0, x1, y1, hi = IRON_HI) => metalScratch(ctx, x0, y0, x1, y1, hi);

// Mail: rows of linked scallops between a back and a front edge, each row
// offset from the last, with a few rings catching the light at the front.
function mail(ctx, y0, y1, back, front, step = 2.3) {
  let odd = false;
  for (let y = y0; y <= y1 + 0.01; y += step) {
    const xa = at(back, y) + 1.1;
    const xb = at(front, y) - 1.1;
    const pts = [];
    let up = odd;
    for (let x = xa; x <= xb; x += 1.15) {
      pts.push([x, y + (up ? -0.55 : 0.55)]);
      up = !up;
    }
    if (pts.length > 2) {
      stroke(ctx, pts, 0.42, mailLine);
      stroke(ctx, pts.slice(-4), 0.22, MAIL_HI);
    }
    odd = !odd;
  }
}

// Short hairs on a pelt.
function furTicks(ctx, ticks, dx = -0.7, dy = 2) {
  for (const [x, y] of ticks) stroke(ctx, [[x, y], [x + dx, y + dy]], 0.4, furLine, false);
}

// A plaited lock of beard ending in an iron bead.
function braid(ctx, x, y0, y1) {
  hard(ctx, [[x - 0.85, y0], [x + 0.85, y0], [x + 0.6, y1], [x - 0.6, y1]], BEARD, { line: 0.45 });
  for (let y = y0 + 0.4; y < y1 - 0.8; y += 1.2) {
    stroke(ctx, [[x - 0.7, y], [x + 0.7, y + 0.7]], 0.3, darken(BEARD, 0.45), false);
  }
  rivet(ctx, x, y1 + 0.4, 0.7, IRON);
}

const TORSO_BACK = [[-38, -7.6], [-33.4, -11], [-24, -11.6], [-14, -9.2], [-6, -8.6], [2, -9.6]];
const TORSO_FRONT = [[-37.6, 7], [-33, 11.4], [-26, 12.4], [-17, 9.6], [-8, 8.6], [2, 8]];

const torso = part('torso', (ctx) => {
  // Tunic hem showing under the mail.
  hard(ctx, [[-10.4, 4], [10, 4], [11, 13.6], [7, 15.4], [2, 14.2], [-3, 15.6], [-8, 14.4], [-11, 15]], TUNIC, { line: 0.7 });
  stroke(ctx, [[-10, 13.2], [-3, 13.8], [2, 12.6], [10.4, 12.2]], 0.5, darken(BONE, 0.7));
  // Hauberk: the body, and a skirt hanging below the hips with a ragged hem.
  body(ctx, 'torso', MAIL);
  hard(ctx, [
    [-10, -4], [9.4, -4], [10.6, 10], [8, 12.6], [5.5, 11.2], [3, 13], [0, 11.4],
    [-3, 13], [-6, 11.4], [-9, 12.6], [-10.6, 9],
  ], MAIL);
  mail(ctx, -29.4, -12.4, TORSO_BACK, TORSO_FRONT);
  mail(ctx, -1.6, 9.6, [[-4, -10], [10, -10.6]], [[-4, 9.4], [10, 10.6]]);
  glint(ctx, 8.4, -22, 1.6, 0.8, MAIL_HI, 0.3, -0.5);
  // A rent in the mail over the ribs, rings burst, old blood under it.
  hard(ctx, [[2.4, -20.4], [5.8, -18.8], [6.6, -16.2], [3.6, -17.4]], darken(TUNIC, 0.6), { line: 0.45 });
  stroke(ctx, [[2.8, -19.4], [5.6, -17.6]], 0.3, MAIL_HI, false);
  glint(ctx, 5, -15.2, 1.1, 0.7, BLOOD, 0.85, 0.4);
  stroke(ctx, [[5, -15], [5.3, -12.6]], 0.45, BLOOD, false);

  // Shield strap slung across the chest.
  hard(ctx, [[-7.2, -29.6], [-4.8, -31], [9.4, -12.8], [7.6, -11]], LEATHER, { line: 0.6 });
  rivet(ctx, 2, -21.6, 0.45);
  rivet(ctx, 6.2, -16, 0.45);

  // Wide belt with an iron buckle and strap end.
  hard(ctx, [[-9.8, -10.6], [9.6, -11.6], [9.9, -5.2], [-10, -4.2]], LEATHER_DARK, { line: 0.8 });
  stroke(ctx, [[-9.4, -9.6], [9.2, -10.6]], 0.3, LEATHER, false);
  stroke(ctx, [[-9.6, -5.4], [9.4, -6.2]], 0.3, LEATHER, false);
  for (const x of [-7.4, -4.6, -1.8]) rivet(ctx, x, -7.4 - x * 0.05, 0.42);
  hard(ctx, [[3.6, -11], [8.2, -11.3], [8.4, -5.6], [3.8, -5.3]], IRON, { line: 0.6 });
  hard(ctx, [[5, -9.6], [7, -9.7], [7.1, -7], [5.1, -6.9]], LEATHER_DARK, { line: 0.4 });
  stroke(ctx, [[4.2, -8.3], [7.8, -8.5]], 0.5, IRON_HI, false);
  hard(ctx, [[1.4, -5.2], [3.4, -5.4], [3.2, 1.6], [2.2, 3], [1.4, 1.6]], LEATHER_DARK, { line: 0.5 });
  rivet(ctx, 2.3, 1, 0.4);

  // Pouch at the back hip.
  smooth(ctx, [[-10.4, -3.6], [-5.6, -4], [-4.8, 2.4], [-7.6, 4.2], [-10.8, 2.6]], LEATHER, { line: 0.7 });
  hard(ctx, [[-10.4, -3.8], [-5.4, -4.2], [-5.6, -0.6], [-8, 0.8], [-10.4, -0.4]], darken(LEATHER, 0.8), { line: 0.5 });
  rivet(ctx, -8, -0.2, 0.45, BONE);
  // Seax hung flat under the belt: bone grip, tooled sheath, bronze chape.
  hard(ctx, [[-1.2, -4.2], [-5.8, -3.8], [-6.4, -2.6], [-5.8, -1.6], [-1.2, -1.6]], BONE, { line: 0.5 });
  stroke(ctx, [[-4.6, -3.5], [-4.6, -1.9]], 0.3, darken(BONE, 0.5), false);
  stroke(ctx, [[-3, -3.7], [-3, -1.8]], 0.3, darken(BONE, 0.5), false);
  hard(ctx, [[-1.4, -4.6], [9.6, -5.6], [11.4, -3.8], [9.8, -1.6], [-1.4, -1.2]], LEATHER, { line: 0.6 });
  stroke(ctx, [[0, -3], [9.4, -3.7]], 0.3, LEATHER_DARK, false);
  for (const x of [1.2, 4, 6.8]) rivet(ctx, x, -2 - x * 0.06, 0.34, '#8a6a2e');
  hard(ctx, [[8.8, -5.5], [9.6, -5.6], [11.4, -3.8], [9.8, -1.6], [9, -1.7]], '#6e5424', { line: 0.45 });

  // Wolf pelt across the shoulders, hanging in points down the chest.
  hard(ctx, [
    [-11.6, -33], [-9, -39.4], [-3.4, -42], [3.4, -41.6], [8, -38.6], [12.6, -33.4],
    [13, -28.6], [10.8, -30], [10, -26.2], [7.6, -29], [5.6, -25.4], [3.4, -28.6],
    [1, -25.6], [-1.4, -28.8], [-3.8, -26.2], [-6, -29.4], [-8.4, -26.8], [-10, -30.4],
    [-12.4, -28.2],
  ], FUR);
  hard(ctx, [[-9.6, -37.6], [-3.4, -41.4], [3.4, -41], [7.6, -38], [4, -36], [-3, -36.4], [-8, -34.4]], FUR_DARK, { line: 0.45 });
  furTicks(ctx, [
    [-9, -33.6], [-6.4, -33], [-3.6, -34], [-0.8, -33.4], [2, -34], [4.8, -33.2], [7.6, -34], [10.4, -33],
    [-7.6, -30.6], [-2.4, -30.8], [0.6, -29.6], [3.6, -31], [6.6, -30], [9.6, -29.2],
  ]);
  furTicks(ctx, [[-6, -39], [-1, -40], [3.4, -39.4]], 0.7, 1.4);
  // Ring brooch pinning it.
  disc(ctx, 8.4, -34.4, 1.7, IRON, { line: 0.5 });
  disc(ctx, 8.4, -34.4, 0.75, FUR_DARK, { line: 0.3 });
  stroke(ctx, [[6.4, -36.2], [10.6, -32.4]], 0.5, IRON_HI, false);
});

const upperArm = part('upper_arm', (ctx) => {
  body(ctx, 'upper_arm', SKIN);
  // Bicep, and an old cut below the sleeve.
  stroke(ctx, [[1.8, 9.6], [3.2, 13.4], [2.4, 18]], 0.55, crease);
  stroke(ctx, [[-3.6, 10.6], [-3, 16]], 0.45, crease);
  scar(ctx, [[-2.4, 16.2], [1.2, 18.4]], 0.5);
  // Twisted iron arm-ring.
  band(ctx, 12.6, 14.8, -5.3, 4.9, IRON, { sag: 0.9 });
  for (const x of [-3.8, -1.6, 0.6, 2.8]) stroke(ctx, [[x, 13.2], [x + 1, 15.2]], 0.3, IRON_HI, false);
  // Mail sleeve to above the elbow, hem uneven.
  smooth(ctx, [
    [-5.6, -4.4], [0, -6.6], [5.8, -4.2], [6.6, 3], [6, 9], [3, 10.6], [0, 9.4],
    [-3, 10.8], [-6, 9], [-6.6, 3],
  ], MAIL);
  mail(ctx, -2.6, 8.4, -6.4, 6.4);
  // The pelt over the point of the shoulder.
  hard(ctx, [
    [-7.4, -3], [-6, -8], [-1, -10.6], [4.6, -9], [7.8, -4], [8.2, 1], [6, -0.6],
    [4.6, 2.6], [2.4, 0], [0.4, 3.2], [-1.8, 0.2], [-4, 2.8], [-5.8, -0.4], [-8, 1.4],
  ], FUR);
  furTicks(ctx, [[-4.6, -6], [-1.6, -7.4], [1.6, -7], [4.6, -5.6], [-5.6, -3], [-2.6, -3.6], [0.6, -3], [3.6, -3.4], [6.2, -2.6]]);
  stroke(ctx, [[-5.6, -7.4], [-1, -9.8], [4.2, -8.4]], 0.4, lighten(FUR, 0.18));
});

const lowerArm = part('lower_arm', (ctx) => {
  body(ctx, 'lower_arm', SKIN);
  // Forearm cords and scars.
  stroke(ctx, [[1.6, -1], [2.6, 3.6]], 0.5, crease);
  scar(ctx, [[-3.2, -0.6], [0.4, 2.6]], 0.5);
  scar(ctx, [[1.4, 0.2], [3.4, 2.2]], 0.45);
  // Fist.
  body(ctx, 'fist', SKIN);
  stroke(ctx, [[1.4, 21.4], [1.2, 23.6]], 0.45, crease, false);
  stroke(ctx, [[-0.9, 21.5], [-1.1, 23.8]], 0.45, crease, false);
  stroke(ctx, [[-3, 19.4], [3.8, 19.8]], 0.4, crease, false);
  scar(ctx, [[-2.4, 18.2], [0.6, 19]], 0.4);
  // Leather bracer, laced up the front, cut about.
  hard(ctx, [[-5, 4.4], [4.8, 4.2], [3.9, 15], [-3.8, 15.2]], LEATHER, { line: 0.7 });
  hard(ctx, [[-5, 4.4], [4.8, 4.2], [4.6, 6.2], [-4.8, 6.4]], LEATHER_DARK, { line: 0.5 });
  hard(ctx, [[-3.9, 13.4], [4, 13.2], [3.9, 15], [-3.8, 15.2]], LEATHER_DARK, { line: 0.5 });
  for (const y of [7.2, 9.2, 11.2]) {
    stroke(ctx, [[1.2, y], [3.2, y + 1.5]], 0.35, BONE, false);
    stroke(ctx, [[3.2, y], [1.2, y + 1.5]], 0.35, BONE, false);
  }
  stroke(ctx, [[-3.6, 7.6], [-1.2, 11.6]], 0.4, LEATHER_DARK, false);
  stroke(ctx, [[-3.3, 7.9], [-0.9, 11.9]], 0.22, lighten(LEATHER, 0.3), false);
  rivet(ctx, -3.4, 5.3, 0.38);
  rivet(ctx, -2.8, 14.2, 0.38);
});

const upperLeg = part('upper_leg', (ctx) => {
  body(ctx, 'upper_leg', WOOL);
  const fold = darken(WOOL, 0.5);
  // Heavy wool, creased at the hip and bagging at the knee.
  stroke(ctx, [[2.6, 2], [4.4, 12], [3.4, 23]], 0.6, fold);
  stroke(ctx, [[-3.6, 4], [-2.4, 14], [-3, 23]], 0.5, fold);
  stroke(ctx, [[-4.6, 25], [0, 27.6], [4.4, 25.4]], 0.55, fold);
  stroke(ctx, [[-3.8, 27.6], [0, 29.6], [3.8, 28]], 0.45, fold);
  stroke(ctx, [[5.2, 6], [5.6, 14]], 0.35, lighten(WOOL, 0.2), false);
  // A patch, coarsely stitched.
  hard(ctx, [[-1.6, 12.6], [3.2, 12], [3.6, 17.4], [-1.2, 18]], darken(WOOL, 0.72), { line: 0.45 });
  for (const [x, y] of [[-1.6, 13.8], [-1.4, 16.4], [0.6, 12.2], [3.4, 14.4], [1, 17.8]]) {
    stroke(ctx, [[x - 0.6, y - 0.4], [x + 0.6, y + 0.4]], 0.3, BONE, false);
  }
});

const LEG_BACK = [[-3, -4.4], [3, -5.3], [11, -6.3], [21, -3.7], [28.8, -3]];
const LEG_FRONT = [[-3, 4.6], [8, 4.7], [20, 3.5], [28.8, 3.1]];

const lowerLeg = part('lower_leg', (ctx) => {
  body(ctx, 'lower_leg', WRAP);
  const wrapLine = darken(WRAP, 0.45);
  // Winingas: a long band wound up the shin, each turn crossing the last.
  for (let y = 0.6; y < 26; y += 3.3) {
    stroke(ctx, [[at(LEG_BACK, y + 2.4) + 0.5, y + 2.4], [at(LEG_FRONT, y) - 0.4, y]], 0.5, wrapLine, false);
    stroke(ctx, [[at(LEG_BACK, y + 0.6) + 0.5, y + 0.6], [at(LEG_FRONT, y + 2.8) - 0.4, y + 2.8]], 0.4, wrapLine, false);
    stroke(ctx, [[at(LEG_BACK, y + 1.9) + 1.4, y + 1.7], [0.4, y + 0.9]], 0.25, lighten(WRAP, 0.25), false);
  }
  // Mud and old blood soaked in low down.
  glint(ctx, 0.8, 23.4, 2.2, 1.4, darken(WRAP, 0.55), 0.7, 0.3);
  glint(ctx, -2.6, 14.6, 1.2, 0.9, BLOOD, 0.6, 0.2);
  // Bronze hook holding the end of the band.
  hard(ctx, [[1.6, 2.4], [3.6, 2.2], [3.2, 4.4], [2.4, 5.2]], '#6e5424', { line: 0.4 });
  // Trouser leg bloused over the top of the wraps.
  smooth(ctx, [[-5, -4], [0, -5.6], [5.2, -3.8], [5.5, 0.8], [2, 2.4], [-2, 1.6], [-5.7, 2]], WOOL);
  stroke(ctx, [[-2.6, -3.6], [-2, 1]], 0.45, darken(WOOL, 0.5), false);
  stroke(ctx, [[2, -3.8], [2.6, 1.6]], 0.45, darken(WOOL, 0.5), false);
});

const foot = part('foot', (ctx) => {
  // Turnshoe: soft leather, one seam over the instep, a toggled flap.
  body(ctx, 'foot', LEATHER);
  hard(ctx, [[-4.4, 4.2], [10.8, 4.2], [11, 5.8], [-4.6, 5.8]], LEATHER_DARK, { line: 0.6 });
  stroke(ctx, [[2.4, -2.6], [5.6, 0.6], [9.6, 2.4]], 0.45, LEATHER_DARK);
  for (const [x, y] of [[3.6, -1.2], [5.4, 0.4], [7.4, 1.5]]) stroke(ctx, [[x - 0.5, y + 0.6], [x + 0.5, y - 0.6]], 0.3, BONE, false);
  hard(ctx, [[-3.6, -2.8], [2.8, -3], [3.2, -0.4], [0, 0.8], [-3.8, -0.2]], darken(LEATHER, 0.8), { line: 0.5 });
  rivet(ctx, 1.6, -1.2, 0.5, BONE);
  stroke(ctx, [[-3, 2], [0, 2.8], [4, 2.8]], 0.35, LEATHER_DARK);
  glint(ctx, 7.6, 3.2, 1.2, 0.5, darken(LEATHER, 0.5), 0.7);
});

const head = part('head', (ctx) => {
  face(ctx, SKIN, { hair: BEARD, beard: 'full', eye: '#9fb6c4' });
  // A heavier beard over the jaw, forked, with two plaits hanging from it.
  hard(ctx, [
    [9.8, -8.6], [10.8, -5], [9.6, -1], [8.8, 2.6], [6.6, 1.6], [5, 3.6], [2.6, 1.2],
    [-0.6, -1.4], [-3.2, -5], [-1.6, -9.4], [3, -7.6], [6.6, -8.4],
  ], BEARD, { line: 0.6 });
  for (const [x0, y0, x1, y1] of [[1, -5.6], [3.6, -5], [6.4, -5.6], [8.6, -5]].map(([x, y]) => [x, y, x + 0.5, y + 4.6])) {
    stroke(ctx, [[x0, y0], [x1, y1]], 0.35, darken(BEARD, 0.5), false);
  }
  stroke(ctx, [[5.6, -8.8], [8.6, -8.4], [10.6, -6.6]], 1.3, BEARD);
  stroke(ctx, [[6, -9.2], [9, -8.9]], 0.3, lighten(BEARD, 0.25), false);
  braid(ctx, 7.6, 1.6, 6.8);
  braid(ctx, 4, 2.6, 6);

  // Mail aventail hanging from the rim over the neck and ear.
  hard(ctx, [
    [-8.6, -14.4], [-1.4, -14.8], [-1, -9], [-2.4, -3.6], [-3.6, 1.4], [-5.2, 0.2],
    [-6.6, 2.8], [-8.4, 1], [-10.8, -2], [-10, -9],
  ], MAIL);
  mail(ctx, -12.4, -1, [[-14, -8.6], [-9, -10], [-2, -10.8], [1, -8.4]], [[-14, -1.4], [-9, -1], [-3.6, -2.4], [1, -3.6]], 2.1);

  // Iron cap, built in quarters under a riveted ridge.
  smooth(ctx, [
    [-8.6, -13.8], [-8.2, -18.6], [-4, -23.4], [2, -24.6], [7, -22.4], [9.6, -17.6],
    [9.9, -15], [0, -14.2],
  ], IRON);
  glint(ctx, 4.6, -20.4, 2.4, 1.1, IRON_HI, 0.5, 0.5);
  stroke(ctx, [[0.6, -24.2], [0.4, -16.6]], 0.5, darken(IRON, 0.5), false);
  stroke(ctx, [[-8.2, -18.8], [-4, -23.9], [2, -25.1], [7.2, -22.9], [9.8, -17.8]], 1.4, darken(IRON, 0.62));
  stroke(ctx, [[-7.8, -19.4], [-4, -24.3], [2, -25.5], [7, -23.3]], 0.3, IRON_HI);
  for (const [x, y] of [[-6.4, -21.2], [-1.4, -24.6], [4.6, -24.2], [8.6, -20.4]]) rivet(ctx, x, y, 0.36);
  scratch(ctx, -5.4, -19.4, -2.4, -16.4);
  // A dent, with rust in it.
  glint(ctx, 5.6, -17.6, 1, 0.6, darken(IRON, 0.5), 0.8, 0.5);
  stroke(ctx, [[4.8, -17], [6.6, -17.6]], 0.3, '#6a3a22', false);
  // Brow band.
  hard(ctx, [[-8.9, -16.4], [10, -17.2], [10.3, -14.8], [-8.9, -13.4]], darken(IRON, 0.78), { line: 0.6 });
  stroke(ctx, [[-8.2, -15.7], [9.6, -16.5]], 0.3, IRON_HI, false);
  for (const x of [-6.6, -3, 0.6, 4.2, 7.8]) rivet(ctx, x, -14.8 - x * 0.07, 0.34);
  // Spectacle guard round the eye, and the nasal.
  stroke(ctx, [[3.6, -14.8], [3.8, -11.4], [6.4, -10.3], [9, -11.4], [9.3, -14.8]], 2, INK);
  stroke(ctx, [[3.6, -14.8], [3.8, -11.4], [6.4, -10.3], [9, -11.4], [9.3, -14.8]], 1.1, IRON);
  stroke(ctx, [[4.4, -11.6], [6.4, -10.8], [8.4, -11.7]], 0.25, IRON_HI);
  hard(ctx, [[9, -15.2], [10.6, -15.2], [12.6, -10.6], [11.6, -9.4], [10.2, -10.8]], IRON, { line: 0.6 });
  stroke(ctx, [[10.2, -14.4], [11.7, -10.6]], 0.3, IRON_HI, false);
}, { box: [-16, -38, 17, 10] });

// Bearded axe, drawn head-up from the grip. `length` is grip to the top of
// the haft in rig units; the blade faces +x.
function weapon(length) {
  return {
    box: [-6, -length - 3, 14, 11],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      const iron = '#575b64';
      // Haft: ash, darkened by hands, flared at the butt.
      hard(ctx, [[-1.5, 9.4], [1.5, 9.4], [1.1, 6], [1.1, -L + 0.4], [-1.1, -L + 0.4], [-1.1, 6]], WOOD, { light: [0.9, 0] });
      stroke(ctx, [[0.4, 5], [0.3, -L * 0.45], [0.5, -L + 10]], 0.3, lighten(WOOD, 0.22));
      stroke(ctx, [[-0.5, -L * 0.3], [-0.3, -L * 0.6]], 0.3, darken(WOOD, 0.5), false);
      // Nicks where blades have bitten the haft.
      hard(ctx, [[1.3, -L * 0.52], [0.3, -L * 0.5], [1.3, -L * 0.47]], INK, { line: 0 });
      hard(ctx, [[-1.3, -L * 0.36], [-0.4, -L * 0.34], [-1.3, -L * 0.32]], INK, { line: 0 });
      // Leather grip binding and an iron butt ring.
      for (const y of [-3.4, -1.6, 0.2, 2, 3.8]) band(ctx, y, y + 1.4, -1.25, 1.25, LEATHER_DARK, { sag: 0.3, line: 0.4 });
      band(ctx, 7.2, 8.6, -1.5, 1.5, iron, { sag: 0.3, line: 0.5 });
      // Poll and socket.
      hard(ctx, [[-3.2, -L + 2.2], [-1.2, -L + 1.6], [-1.2, -L + 9], [-3.2, -L + 8.2]], darken(iron, 0.85), { line: 0.7 });
      // Blade: thin neck, a broad face, the beard hooking down.
      hard(ctx, [
        [-1.4, -L + 1.6], [2, -L + 1.3], [6, -L + 0.4], [11, -L - 1.6], [12.2, -L + 6],
        [11.3, -L + 13], [9.4, -L + 17.8], [7.6, -L + 12.4], [4.6, -L + 9.4], [1.6, -L + 8.8],
        [-1.4, -L + 9],
      ], iron, { shadow: darken(iron, 0.55), light: [1.4, -1] });
      // Ground edge, bright.
      hard(ctx, [
        [11, -L - 1.6], [12.2, -L + 6], [11.3, -L + 13], [9.4, -L + 17.8], [9.3, -L + 13],
        [10.1, -L + 6], [9.5, -L - 0.9],
      ], STEEL, { line: 0.5, shadow: darken(STEEL, 0.65), light: [0.9, 0] });
      // A chip out of the edge.
      hard(ctx, [[12.3, -L + 2.6], [11, -L + 3.4], [12.3, -L + 4.2]], INK, { line: 0 });
      // Etched knotwork on the cheek, and the socket langet.
      stroke(ctx, [[2.6, -L + 3.4], [5.4, -L + 5.6], [8.4, -L + 3]], 0.35, IRON_HI);
      stroke(ctx, [[2.6, -L + 6.8], [5.4, -L + 4.2], [8.6, -L + 8.6]], 0.35, IRON_HI);
      stroke(ctx, [[6.4, -L + 9], [8.2, -L + 11.6]], 0.3, IRON_HI, false);
      hard(ctx, [[-1.3, -L + 9], [1.3, -L + 8.8], [0.9, -L + 13.6], [-0.9, -L + 13.6]], darken(iron, 0.8), { line: 0.5 });
      rivet(ctx, 0, -L + 5, 0.5);
      rivet(ctx, 0, -L + 11.4, 0.36);
      // Blood along the beard, running back down the face.
      hard(ctx, [
        [10.3, -L + 7], [12, -L + 6.6], [11.2, -L + 13], [9.5, -L + 17.2], [8.4, -L + 13.4],
        [9, -L + 11.6], [7.6, -L + 10.4], [9.6, -L + 9.4],
      ], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [[8, -L + 12.6], [7.4, -L + 15.4]], 0.5, BLOOD, false);
      stroke(ctx, [[1, -L + 14], [0.8, -L + 19]], 0.45, BLOOD, false);
    },
  };
}

// Points round an ellipse, from angle a0 to a1.
function ovalPts(cx, cy, rx, ry, a0, a1, n, closed) {
  const out = [];
  const div = closed ? n : n - 1;
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / div;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

// Round plank shield seen at an angle on the off arm; (0,0) is the grip
// behind the boss.
const shield = {
  box: [-11, -20, 13, 20],
  start: [0, 0],
  draw(ctx) {
    const cx = 1;
    const rx = 9.4;
    const ry = 17.6;
    const TAU = Math.PI * 2;
    // Boards, painted in two halves.
    smooth(ctx, ovalPts(cx, 0, rx, ry, 0, TAU, 20, true), PAINT_RED, { shadow: darken(PAINT_RED, 0.5), light: [2.4, -1.4], line: 0 });
    hard(ctx, ovalPts(cx, 0, rx, ry, -1, -1 + Math.PI, 16, false), PAINT_PALE, { shadow: darken(PAINT_PALE, 0.5), light: [2.4, -1.4], line: 0 });
    // Plank joints.
    for (const dx of [-6.2, -3.2, -0.4, 2.6, 5.6]) {
      const h = ry * Math.sqrt(1 - (dx / rx) ** 2) - 0.8;
      stroke(ctx, [[cx + dx, -h], [cx + dx, h]], 0.35, 'rgba(20,14,10,0.6)', false);
    }
    // Paint worn through to the wood.
    glint(ctx, -3.4, -6.4, 1.5, 1, WOOD, 0.7, 0.6);
    glint(ctx, 5.4, 8.6, 1.3, 0.9, WOOD, 0.7, -0.4);
    // Rawhide rim, stitched, then the ink line outside it.
    ctx.beginPath();
    spline(ctx, ovalPts(cx, 0, rx, ry, 0, TAU, 20, true), true);
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = RAWHIDE;
    ctx.stroke();
    ctx.beginPath();
    spline(ctx, ovalPts(cx, 0, rx + 0.95, ry + 0.95, 0, TAU, 20, true), true);
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = INK;
    ctx.stroke();
    for (const [x, y] of ovalPts(cx, 0, rx, ry, 0.2, TAU + 0.2, 14, true)) {
      stroke(ctx, [[x - 0.5, y - 0.3], [x + 0.5, y + 0.3]], 0.3, darken(RAWHIDE, 0.45), false);
    }
    // Split down one board from the rim, held by iron clamps.
    hard(ctx, [[3.3, -15.8], [4.6, -15.6], [4.1, -9], [3.6, -4.4]], INK, { line: 0 });
    for (const y of [-13.4, -9.6]) {
      stroke(ctx, [[2.2, y], [5.6, y + 0.3]], 0.9, INK, false);
      stroke(ctx, [[2.4, y], [5.4, y + 0.3]], 0.45, IRON_HI, false);
    }
    // Axe and sword cuts, a bite out of the rim.
    scratch(ctx, -5, 3.6, -0.6, 8.4, BONE);
    scratch(ctx, -4.4, -12, -1.4, -9.4, BONE);
    scratch(ctx, 4.2, 4.6, 7.6, 2.6, BONE);
    scratch(ctx, 0.4, 11, 3.6, 13.6, BONE);
    hard(ctx, [[-7.9, 4], [-5.6, 5], [-7.6, 6.6]], INK, { line: 0 });
    // Stub of a broken arrow.
    stroke(ctx, [[-2.6, 12.4], [-6.4, 15.4]], 1.1, INK, false);
    stroke(ctx, [[-2.6, 12.4], [-6.2, 15.2]], 0.55, lighten(WOOD, 0.2), false);
    // Blood thrown across the lower boards.
    glint(ctx, 3.4, 9.2, 1.2, 0.7, BLOOD, 0.85, 0.5);
    glint(ctx, 5, 10.8, 0.5, 0.4, BLOOD, 0.85);
    // Iron boss on a riveted flange.
    disc(ctx, cx, 0, 4.1, darken(IRON, 0.85), { line: 0.8 });
    for (let a = 0; a < 6; a++) rivet(ctx, cx + Math.cos(a * 1.047 + 0.4) * 3.3, Math.sin(a * 1.047 + 0.4) * 3.3, 0.3);
    disc(ctx, cx, 0, 2.5, IRON, { line: 0.6 });
    glint(ctx, cx + 0.8, -0.9, 0.8, 0.5, IRON_HI, 0.9, -0.5);
    scratch(ctx, cx - 1.6, 0.4, cx + 0.2, 1.8);
  },
};

export default {
  id: 'viking',
  mood: { shadow: 0.52, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head, shield },
  weapon,
};
