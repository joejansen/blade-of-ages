import { INK, darken, lighten, smooth, hard, stroke, disc, glint, band, spline } from './kit.js';
import { part, body, face, scar as skinScar } from './anatomy.js';

// Zulu warrior of the 1870s, a veteran of an ibutho: bare and scarred, an
// umqhele of leopard skin with widowbird feathers, cow-tail amashoba at arm
// and knee, ibheshu and isinene at the hips, the isihlangu war shield and a
// blooded iklwa.
const SKIN = '#5b3a26';
const HAIR = '#120d0b';
const HIDE = '#2c1b12';
const CALF = '#4a3222';
const LEOPARD = '#8a6a3a';
const SPOT = '#1a120d';
const FUR = '#5a4a39';
const FUR_DARK = '#2c221b';
const TUFT = '#c4baa2';
const FEATHER = '#14131a';
const BEAD = '#cfc6b0';
const BEAD_RED = '#74191c';
const CLAW = '#b9aa84';
const WOOD = '#4a2f1b';
const IRON = '#7d848b';
const IRON_HI = '#dfe5ea';
const SHIELD_DARK = '#33211a';
const SHIELD_PALE = '#c2b8a0';
const BLOOD = '#5c0a12';

const crease = darken(SKIN, 0.45);
const tuftLine = darken(TUFT, 0.5);

const scar = (ctx, pts, width) => skinScar(ctx, SKIN, pts, width);

// A band of white cow-tail tufts hanging round a limb from height y: a
// ragged fringe with loose strands, bound on by a hide cord.
function amashoba(ctx, y, xBack, xFront, len, count) {
  const pts = [[xBack, y], [xFront, y], [xFront + 0.9, y + len * 0.45]];
  const step = (xFront - xBack) / count;
  for (let i = 0; i < count; i++) {
    const x = xFront - i * step;
    pts.push([x - step * 0.2, y + len * (i % 2 ? 0.86 : 1)], [x - step * 0.7, y + len * 0.66]);
  }
  pts.push([xBack - 0.2, y + len * 0.9], [xBack - 0.9, y + len * 0.45]);
  hard(ctx, pts, TUFT, { line: 0.7 });
  for (let i = 0; i < count; i++) {
    const x = xFront - (i + 0.45) * step;
    stroke(ctx, [[x, y + 1.6], [x - 0.3, y + len * 0.5], [x + 0.1, y + len * 0.82]], 0.35, tuftLine);
  }
  band(ctx, y - 0.9, y + 1, xBack + 0.4, xFront - 0.4, HIDE, { sag: 0.7, line: 0.6 });
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
  glint(ctx, 8.6, -29.5, 2.4, 1.1, lighten(SKIN, 0.4), 0.4, -0.4);
  // Old wounds: a spear thrust under the ribs, cuts across chest and flank.
  scar(ctx, [[3.4, -30.6], [6.4, -27.4], [8, -22.8]], 0.6);
  scar(ctx, [[-5.2, -27], [-1.6, -25]], 0.55);
  scar(ctx, [[-4.6, -18.4], [-1.8, -16.2]], 0.5);
  disc(ctx, 3.6, -13.6, 0.8, darken(SKIN, 0.5), { line: 0 });
  stroke(ctx, [[2.4, -14.6], [4.9, -12.6]], 0.3, lighten(SKIN, 0.35), false);

  // Necklace: a cord of white and red beads with claws hung between.
  stroke(ctx, [[-6.6, -37.4], [-1, -34.3], [3.4, -33.7], [8.4, -36]], 0.4, HIDE);
  const beads = [[-5, -36.4], [-3, -35.3], [-1, -34.4], [1.2, -33.9], [3.4, -33.8], [5.6, -34.5], [7.4, -35.5]];
  beads.forEach(([x, y], i) => {
    if (i % 2 === 1) hard(ctx, [[x - 0.7, y + 0.3], [x + 0.7, y + 0.3], [x + 0.5, y + 2], [x - 0.3, y + 3.5]], CLAW, { line: 0.4 });
  });
  beads.forEach(([x, y], i) => disc(ctx, x, y, 0.6, i % 2 ? BEAD : BEAD_RED, { line: 0.35 }));

  // Ibheshu: calf-hide rear apron, soft and heavy, the hair worn at the edge.
  hard(ctx, [
    [-9.8, -4.4], [-0.6, -4.8], [-0.2, 6], [-1.4, 13.4], [-3, 15], [-4.6, 13.8], [-6, 15.4],
    [-7.8, 13.6], [-9.4, 14.2], [-10.8, 10.6], [-11.4, 3],
  ], CALF);
  smooth(ctx, [[-9.6, 2], [-6.4, 0.6], [-4.6, 4.4], [-6.2, 9], [-9.8, 8]], darken(CALF, 0.62), { line: 0, shadow: darken(CALF, 0.5) });
  stroke(ctx, [[-3.4, -2.6], [-2.8, 5], [-3.6, 12]], 0.5, darken(CALF, 0.45));
  stroke(ctx, [[-7.6, -2.4], [-8.2, 6], [-7.8, 12.4]], 0.45, darken(CALF, 0.45));
  for (const x of [-9.6, -7, -4.6, -2.2]) stroke(ctx, [[x, 11.4], [x - 0.3, 13]], 0.3, lighten(CALF, 0.3), false);
  // Isinene: front apron of twisted fur tails.
  [[9.2, 13, FUR_DARK], [7.1, 14.6, FUR], [5, 13.4, FUR_DARK], [2.9, 15.2, FUR], [0.9, 13.6, FUR_DARK]].forEach(([x, end, fur]) => {
    smooth(ctx, [[x - 1.1, -4.6], [x + 1.1, -4.6], [x + 1.4, 5], [x + 0.9, end - 1.6], [x, end], [x - 0.9, end - 1.6], [x - 1.4, 5]], fur, { line: 0.6 });
    for (let y = -1.6; y < end - 2.4; y += 2.6) stroke(ctx, [[x - 1, y + 0.9], [x + 1, y - 0.3]], 0.35, fur === FUR ? darken(FUR, 0.5) : lighten(FUR_DARK, 0.22), false);
  });
  // Side tuft of cow tail at the hip.
  hard(ctx, [[-1.4, -4.6], [1.6, -4.8], [2, 2.6], [1, 6.6], [0.2, 4], [-0.6, 7.4], [-1.6, 3]], TUFT, { line: 0.6 });
  stroke(ctx, [[0.2, -2.6], [0, 3.4]], 0.3, tuftLine, false);

  // Hide belt, thong-stitched, knotted at the hip.
  hard(ctx, [[-9.5, -7.8], [9, -8.8], [9.3, -4.6], [-9.7, -3.6]], HIDE, { line: 0.8 });
  for (let x = -8; x <= 8; x += 2) stroke(ctx, [[x - 0.4, -6.9 - x * 0.05], [x + 0.4, -5.5 - x * 0.05]], 0.35, CLAW, false);
  disc(ctx, 0.2, -6.3, 1.3, CLAW, { line: 0.5 });
  disc(ctx, 0.2, -6.3, 0.4, HIDE, { line: 0 });
});

const upperArm = part('upper_arm', (ctx) => {
  body(ctx, 'upper_arm', SKIN);
  // Shoulder and bicep.
  stroke(ctx, [[-4.4, -1], [-1, 3.6], [3.6, 1.4]], 0.6, crease);
  stroke(ctx, [[1.8, 2.6], [3.4, 6.4]], 0.5, crease, false);
  stroke(ctx, [[1.4, 15.6], [2.4, 18.6]], 0.45, crease, false);
  glint(ctx, 2.6, -2.4, 2, 1, lighten(SKIN, 0.4), 0.4, -0.3);
  scar(ctx, [[-3.6, 1.6], [-0.8, 4.6]], 0.55);
  scar(ctx, [[2, -1.2], [4.4, 0.6]], 0.45);
  // Amashoba round the bicep.
  amashoba(ctx, 7, -6, 5.8, 8.6, 5);
});

const lowerArm = part('lower_arm', (ctx) => {
  body(ctx, 'lower_arm', SKIN);
  // Forearm cords and an old slash.
  stroke(ctx, [[1.6, 0.6], [2.6, 6], [1.8, 12]], 0.55, crease);
  stroke(ctx, [[-2.6, 2], [-2.2, 8]], 0.45, crease, false);
  scar(ctx, [[-1.6, 5.4], [1.4, 9]], 0.5);
  // Fist.
  body(ctx, 'fist', SKIN);
  stroke(ctx, [[-2.6, 19.6], [0.4, 18.8], [3.6, 19.8]], 0.45, crease);
  stroke(ctx, [[1.4, 21.2], [1.2, 23.6]], 0.45, crease, false);
  stroke(ctx, [[-0.9, 21.3], [-1.1, 23.8]], 0.45, crease, false);
  // Wrist thong with a few beads.
  band(ctx, 14.6, 16, -3.4, 3.5, HIDE, { sag: 0.6, line: 0.5 });
  for (const [x, c] of [[-1.6, BEAD], [0.2, BEAD_RED], [2, BEAD]]) disc(ctx, x, 15.7, 0.5, c, { line: 0.3 });
});

const upperLeg = part('upper_leg', (ctx) => {
  body(ctx, 'upper_leg', SKIN);
  // Thigh muscle and the knee.
  stroke(ctx, [[2.4, 5], [4, 15], [3.2, 24.6]], 0.6, crease);
  stroke(ctx, [[-3.4, 8], [-2.6, 17], [-3, 24]], 0.5, crease);
  stroke(ctx, [[-2.6, 25.4], [0.4, 27.4], [3.4, 25.8]], 0.55, crease);
  glint(ctx, 4.6, 9, 1.2, 3.4, lighten(SKIN, 0.4), 0.3, 0.1);
  // Scars: a long healed gash, a puncture.
  scar(ctx, [[-1.6, 10.6], [1, 14.4], [2.4, 19]], 0.55);
  scar(ctx, [[3, 21.4], [5, 22.8]], 0.45);
  disc(ctx, -2.6, 20.6, 0.65, darken(SKIN, 0.5), { line: 0 });
});

const lowerLeg = part('lower_leg', (ctx) => {
  body(ctx, 'lower_leg', SKIN);
  // Shin edge and calf.
  stroke(ctx, [[2.6, 10], [2.8, 18], [2.2, 25]], 0.5, crease);
  stroke(ctx, [[-4.4, 12.6], [-3.4, 19], [-2.8, 24]], 0.5, crease);
  scar(ctx, [[0, 15.6], [2, 19.6]], 0.5);
  // Dust of the march up the ankle.
  glint(ctx, 0.2, 26.6, 2.6, 1.6, '#8a7458', 0.3);
  // Amashoba below the knee.
  amashoba(ctx, 2.4, -5.6, 4.8, 9, 5);
});

const foot = part('foot', (ctx) => {
  body(ctx, 'foot', SKIN);
  // Ankle bone, tendon, toes.
  stroke(ctx, [[-1.2, -0.6], [0.2, 0.4], [1.4, -0.4]], 0.4, crease);
  stroke(ctx, [[2.6, -0.6], [5.6, 1.4], [8.6, 2.4]], 0.4, crease);
  for (const x of [6.6, 7.9, 9.1]) stroke(ctx, [[x, 2.6], [x + 0.2, 4.3]], 0.3, crease, false);
  stroke(ctx, [[9.6, 2.6], [10.3, 3.2]], 0.35, lighten(SKIN, 0.4), false);
  // Hard, dusty sole.
  stroke(ctx, [[-3.6, 4.5], [3, 4.4], [9, 4.5]], 0.6, darken(SKIN, 0.55), false);
  glint(ctx, 1.6, 3.6, 3.6, 0.7, '#8a7458', 0.3);
});

const head = part('head', (ctx) => {
  // Rear lappet of the headband hanging behind the neck.
  hard(ctx, [[-8.8, -15], [-6.6, -14.4], [-6.8, -6], [-8.4, -1.6], [-9.2, -4.4], [-10.4, -2.4], [-10.6, -8]], darken(LEOPARD, 0.8), { line: 0.6 });
  disc(ctx, -8.6, -8.4, 0.5, SPOT, { line: 0 });
  disc(ctx, -8.9, -5, 0.45, SPOT, { line: 0 });
  // Two broad widowbird plumes tucked into the band, arcing back over the
  // crown rather than standing upright.
  smooth(ctx, [[-2.8, -19.6], [-5.6, -29], [-10, -35.4], [-14.6, -37.4], [-12.6, -40.6], [-7.2, -39.6], [-2.2, -32.6], [0.4, -20.4]], FEATHER, { line: 0.7 });
  stroke(ctx, [[-1.4, -20.4], [-4.2, -30.4], [-8.6, -37.2], [-13.4, -39]], 0.35, lighten(FEATHER, 0.3));
  for (const [x, y] of [[-3.4, -26], [-5.4, -31.4], [-8.4, -35.6], [-11.4, -37.8]]) stroke(ctx, [[x, y], [x - 1.6, y + 1.6]], 0.25, lighten(FEATHER, 0.22), false);
  smooth(ctx, [[0.2, -20.6], [-0.6, -28], [-3, -34.4], [-6, -37.6], [-2.2, -37.4], [1.8, -33], [3, -27], [3, -20.8]], FEATHER, { line: 0.7 });
  stroke(ctx, [[1.6, -21.4], [1, -28.6], [-1.2, -34.4], [-4.6, -37]], 0.35, lighten(FEATHER, 0.3));
  for (const [x, y] of [[1.6, -26], [0.8, -30.6], [-1, -34]]) stroke(ctx, [[x, y], [x + 1.3, y + 0.9]], 0.25, lighten(FEATHER, 0.22), false);

  // The face: close-cropped hair, a short beard, a level stare.
  face(ctx, SKIN, { hair: HAIR, scalp: true, beard: 'stubble' });
  stroke(ctx, [[4.4, -9.6], [6.6, -8.8]], 0.4, crease, false);
  skinScar(ctx, SKIN, [[3.6, -11.6], [5.4, -8.4]], 0.45);
  // Hard set of the brow.
  stroke(ctx, [[4, -16.2], [6.4, -15.4], [8.6, -14]], 0.5, INK);

  // Umqhele: a padded roll of leopard skin bound round the brow.
  smooth(ctx, [
    [-8.6, -17.2], [-3.4, -20.8], [2.6, -22], [8, -20.4], [9.6, -18], [8.8, -16.4],
    [3, -17.8], [-2.6, -16.4], [-7.8, -13.2], [-9.2, -15],
  ], LEOPARD);
  for (const [x, y, r] of [[-6.6, -16.2, 0.6], [-4, -18.2, 0.55], [-1.2, -19.2, 0.6], [1.8, -19.8, 0.5], [4.6, -19.4, 0.6], [7.4, -18.4, 0.5], [-2.6, -17.4, 0.4], [3.2, -18.6, 0.4]]) {
    disc(ctx, x, y, r, SPOT, { line: 0 });
  }
  stroke(ctx, [[-7.6, -16.6], [-3, -19.8], [2.6, -21], [7.6, -19.6]], 0.3, lighten(LEOPARD, 0.3));
  // Side lappet hanging in front of the shoulder, behind the ear.
  hard(ctx, [[-7.2, -15], [-2.8, -16.4], [-2.6, -9], [-3.6, -3.2], [-5, -5.4], [-6.2, -2.4], [-7.8, -8]], LEOPARD, { line: 0.6 });
  for (const [x, y] of [[-5.6, -13], [-4, -10.6], [-6, -9], [-4.8, -6.6]]) disc(ctx, x, y, 0.5, SPOT, { line: 0 });
  // Binding where the feathers are tucked in, and an ear plug.
  hard(ctx, [[-3.8, -21.6], [3.2, -22.6], [3.2, -20.4], [-3.6, -19.2]], HIDE, { line: 0.5 });
  stroke(ctx, [[-2, -21.6], [-1.6, -19.8]], 0.3, CLAW, false);
  stroke(ctx, [[1, -22], [1.2, -20.4]], 0.3, CLAW, false);
  disc(ctx, -0.4, -8.6, 0.85, CLAW, { line: 0.4 });
}, { box: [-16, -48, 17, 5] });

// Iklwa: short stabbing spear, drawn tip-up from the grip.
function weapon(length) {
  return {
    box: [-5, -length - 2, 5, 14],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      // Haft, swelling to a butt below the hand.
      hard(ctx, [[-0.9, -L * 0.54], [0.9, -L * 0.54], [1, 6], [1.7, 9.6], [1.4, 12], [-1.4, 12], [-1.7, 9.6], [-1, 6]], WOOD, { light: [0.7, 0], line: 0.7 });
      stroke(ctx, [[0.3, -L * 0.5], [0.4, 8]], 0.3, lighten(WOOD, 0.25), false);
      stroke(ctx, [[-0.5, -L * 0.3], [-0.4, -L * 0.18]], 0.3, darken(WOOD, 0.5), false);
      // Iron shank and the long broad leaf blade.
      hard(ctx, [
        [-0.8, -L * 0.5], [-0.7, -L * 0.6], [-2.4, -L * 0.66], [-3.5, -L * 0.75], [-2.7, -L * 0.88],
        [0, -L], [2.7, -L * 0.88], [3.5, -L * 0.75], [2.4, -L * 0.66], [0.7, -L * 0.6], [0.8, -L * 0.5],
      ], IRON, { shadow: darken(IRON, 0.55), light: [1.7, 0] });
      stroke(ctx, [[0, -L * 0.6], [0, -L + 2]], 0.6, darken(IRON, 0.45), false);
      stroke(ctx, [[2.6, -L * 0.72], [2.2, -L * 0.86], [0.6, -L + 1.6]], 0.35, IRON_HI);
      stroke(ctx, [[-1.9, -L * 0.7], [-0.9, -L * 0.78]], 0.3, 'rgba(20,14,10,0.7)', false);
      // Blood on the point, running back down the blade.
      hard(ctx, [[-2.6, -L * 0.86], [0, -L + 0.6], [2.6, -L * 0.87], [1.8, -L * 0.78], [1, -L * 0.82], [0.4, -L * 0.7], [-0.6, -L * 0.8], [-1.8, -L * 0.75]], BLOOD, { line: 0, shadow: darken(BLOOD, 0.7) });
      stroke(ctx, [[0.5, -L * 0.72], [0.5, -L * 0.62]], 0.5, BLOOD, false);
      // Hide binding shrunk on over the tang, and a wrap under the hand.
      for (let i = 0; i < 5; i++) {
        const y = -L * 0.54 + i * 1.1;
        hard(ctx, [[-1.3, y], [1.3, y - 0.3], [1.3, y + 0.9], [-1.3, y + 1.2]], i % 2 ? HIDE : CALF, { line: 0.4 });
      }
      for (const y of [-2.4, -0.8, 0.8, 2.4]) stroke(ctx, [[-1, y + 0.4], [1, y - 0.3]], 0.4, HIDE, false);
      stroke(ctx, [[-1.5, 9.8], [1.5, 9.8]], 0.4, darken(WOOD, 0.45), false);
    },
  };
}

// Isihlangu carried on the off arm; held at the centre of the stick.
const OVAL = [
  [0, -22.6], [4.4, -17.6], [7.4, -9], [8.2, 0], [7.4, 9], [4.4, 17.6], [0, 22.6],
  [-4.4, 17.6], [-7.4, 9], [-8.2, 0], [-7.4, -9], [-4.4, -17.6],
];
const shield = {
  box: [-10, -31, 10, 27],
  start: [0, 0],
  draw(ctx) {
    // Cowhide, hair side out: dark brown with white patches.
    smooth(ctx, OVAL, SHIELD_DARK, { shadow: darken(SHIELD_DARK, 0.55), light: [2.2, -1.4] });
    ctx.save();
    ctx.beginPath();
    spline(ctx, OVAL, true);
    ctx.clip();
    const pale = { line: 0, shadow: darken(SHIELD_PALE, 0.62), light: [1.2, -0.8] };
    smooth(ctx, [[3, -22], [8.6, -16], [8.4, -8], [5, -5.4], [3.4, -9.6], [5, -14], [2, -17.6]], SHIELD_PALE, pale);
    smooth(ctx, [[-9, 2], [-5, 0.4], [-2.8, 4.6], [-4.4, 9.6], [-3, 14.6], [-6, 18.6], [-9, 12]], SHIELD_PALE, pale);
    smooth(ctx, [[3.6, 9.6], [6.4, 8.4], [7.4, 12], [5.4, 15.6], [3.4, 13.4]], SHIELD_PALE, pale);
    smooth(ctx, [[-6.6, -13.6], [-4.6, -14.6], [-3.6, -12], [-5.6, -10.6]], SHIELD_PALE, pale);
    // Brindle flecks in the hair.
    for (const [x, y] of [[5.6, -11.4], [6.6, -13.2], [-6, 6.4], [-5.4, 11.6], [-7, 9]]) stroke(ctx, [[x, y], [x + 0.5, y + 1.3]], 0.35, SHIELD_DARK, false);
    for (const [x, y] of [[4.4, 2], [5.6, -1], [-5, -5], [2.6, 17], [-3.4, -17]]) stroke(ctx, [[x, y], [x + 0.4, y + 1.2]], 0.3, lighten(SHIELD_DARK, 0.2), false);
    ctx.restore();
    ctx.beginPath();
    spline(ctx, OVAL, true);
    ctx.lineWidth = 1;
    ctx.strokeStyle = INK;
    ctx.stroke();
    // Two rows of lacing: strips of contrasting hide threaded through slits.
    for (let y = -16.4; y <= 16.6; y += 3) {
      for (const x of [-2.4, 2.4]) {
        hard(ctx, [[x - 1, y - 0.75], [x + 1, y - 0.75], [x + 1, y + 0.75], [x - 1, y + 0.75]], (Math.round((y + 16.4) / 3) % 2) ? SHIELD_PALE : CALF, { line: 0.4 });
      }
    }
    // The stick, run through the lacing loops, a fur tuft at its head.
    hard(ctx, [[-0.7, -27], [0.7, -27], [0.8, 25.6], [0, 26.2], [-0.8, 25.6]], WOOD, { line: 0.6, light: [0.5, 0] });
    for (let y = -15; y <= 15.2; y += 6) stroke(ctx, [[-1.6, y], [1.6, y]], 0.7, HIDE, false);
    hard(ctx, [
      [-1.2, -24.4], [-2.6, -25.6], [-1.6, -26.8], [-2.8, -28.6], [-1, -28.6], [-0.6, -30.2],
      [0.6, -28.8], [1.6, -30], [1.8, -28], [3, -27.2], [1.8, -26], [2.4, -24.6], [0.6, -24.8], [0, -23.4],
    ], FUR_DARK, { line: 0.6 });
    stroke(ctx, [[-0.6, -25.4], [-0.9, -28]], 0.3, lighten(FUR_DARK, 0.25), false);
    stroke(ctx, [[0.8, -25.6], [1.2, -28]], 0.3, lighten(FUR_DARK, 0.25), false);
    // War damage: spear cuts in the hide.
    stroke(ctx, [[4.6, -3.6], [6.4, 1]], 0.5, 'rgba(15,10,8,0.8)', false);
    stroke(ctx, [[-6.2, -6.6], [-4.4, -3.4]], 0.45, 'rgba(15,10,8,0.8)', false);
    hard(ctx, [[8, 4.6], [6.2, 5.6], [7.8, 7.2]], INK, { line: 0 });
  },
};

export default {
  id: 'zulu',
  mood: { shadow: 0.52, light: [2.2, -1.5] },
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head, shield },
  weapon,
};
