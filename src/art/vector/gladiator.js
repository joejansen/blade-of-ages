import { INK, darken, lighten, smooth, hard, stroke, disc, glint, band, form } from './kit.js';

// Roman gladiator (murmillo): crested bronze helm with a grille visor,
// banded arm guard and shoulder plate, wide studded belt over a red
// loincloth, bronze greaves, gladius and scutum.
const SKIN = '#c98f5e';
const BRONZE = '#c8963a';
const BRONZE_HI = '#f2d27c';
const LEATHER = '#7b4a27';
const LEATHER_DARK = '#4f2d17';
const RED = '#b0222b';
const CLOTH_TRIM = '#e9d9a6';
const STEEL = '#cfd7dd';
const WOOD = '#6e4526';

const crease = darken(SKIN, 0.55);

function rivet(ctx, x, y, r = 0.55) {
  disc(ctx, x, y, r, BRONZE_HI, { line: 0.35 });
}

// Overlapping plates of the manica between two heights on a limb.
function manica(ctx, y0, y1, count, xBack, xFront) {
  const step = (y1 - y0) / count;
  for (let i = count - 1; i >= 0; i--) {
    const top = y0 + i * step - 0.4;
    band(ctx, top, top + step + 0.9, xBack - i * 0.12, xFront + i * 0.05, BRONZE, { sag: 1.1 });
    stroke(ctx, [[xBack + 1, top + 1.1], [xFront - 1.2, top + 1.2]], 0.45, BRONZE_HI, false);
  }
}

const torso = {
  box: [-14, -44, 15, 18],
  start: [0, 0],
  end: [0, -40],
  draw(ctx) {
    // Body.
    smooth(ctx, [
      [8, 2], [8.6, -8], [9.6, -17], [12.4, -26], [11.4, -33], [7, -37.6], [3.4, -41],
      [-3.4, -41.4], [-7.6, -38], [-11, -33.4], [-11.6, -24], [-9.2, -14], [-8.6, -6],
      [-9.6, 2], [-6, 6], [0, 7.4], [6, 6],
    ], SKIN);
    // Chest, ribs and belly.
    stroke(ctx, [[1.5, -28.5], [6, -24.6], [11.6, -26.6]], 0.75, crease);
    stroke(ctx, [[7.6, -24], [8.2, -17], [7.8, -10]], 0.55, crease);
    stroke(ctx, [[4.6, -21], [8, -20.2]], 0.5, crease, false);
    stroke(ctx, [[4.8, -17.2], [8.1, -16.6]], 0.5, crease, false);
    stroke(ctx, [[5, -13.6], [8, -13.2]], 0.5, crease, false);
    stroke(ctx, [[0.5, -22], [2.4, -19.6]], 0.5, crease, false);
    stroke(ctx, [[-0.2, -18.6], [1.8, -16.4]], 0.5, crease, false);
    stroke(ctx, [[-7.5, -36.5], [-3, -34.5], [1, -36.5]], 0.6, crease);
    glint(ctx, 8.6, -29.5, 2.6, 1.3, lighten(SKIN, 0.5), 0.55, -0.4);

    // Shoulder strap crossing the chest to the belt.
    hard(ctx, [[-8.6, -37.4], [-5.2, -38.6], [9.6, -13.4], [7.2, -11.6]], LEATHER, { line: 0.7 });
    rivet(ctx, -3.6, -32.6);
    rivet(ctx, 1.2, -24.6);
    rivet(ctx, 6, -16.6);

    // Loincloth: a back drape and a front panel hanging from the belt.
    smooth(ctx, [[-9.8, -3], [1.6, -3.4], [2, 8.5], [-3.6, 13], [-9.6, 9]], darken(RED, 0.82));
    stroke(ctx, [[-5.6, -1.6], [-6.2, 9.6]], 0.5, darken(RED, 0.5), false);
    stroke(ctx, [[-1.8, -1.6], [-1.6, 10.6]], 0.5, darken(RED, 0.5), false);
    smooth(ctx, [[1.6, -4], [9.8, -4.4], [11, 9.5], [7, 16], [1.8, 11.6]], RED);
    stroke(ctx, [[4.6, -2.2], [4.2, 12.6]], 0.5, darken(RED, 0.5), false);
    stroke(ctx, [[7.6, -2.2], [8.2, 13]], 0.5, darken(RED, 0.5), false);
    stroke(ctx, [[2.6, 10.6], [6.8, 14.4], [10.4, 9.6]], 0.9, CLOTH_TRIM);

    // Wide belt with bronze plates.
    hard(ctx, [[-9.8, -10.2], [9.6, -11.4], [9.9, -3.6], [-10.1, -2.4]], LEATHER, { line: 0.8 });
    for (const x of [-6.6, -2.2, 2.2, 6.6]) {
      hard(ctx, [[x - 1.5, -9.3 - x * 0.06], [x + 1.5, -9.5 - x * 0.06], [x + 1.5, -4.2 - x * 0.06], [x - 1.5, -4 - x * 0.06]], BRONZE, { line: 0.5 });
      glint(ctx, x - 0.3, -8 - x * 0.06, 0.5, 1.1, BRONZE_HI, 0.9);
    }
  },
};

const upperArm = {
  stretch: 1.14,
  box: [-10, -12, 11, 25],
  start: [0, 0],
  end: [0, 20],
  draw(ctx) {
    smooth(ctx, [
      [-5, -3.6], [0, -6], [5.2, -3.6], [6.1, 4], [5.2, 10.5], [4.2, 19], [0, 22.4],
      [-3.8, 19.6], [-5.5, 10.5], [-6, 3],
    ], SKIN);
    stroke(ctx, [[1.6, 8.4], [3.2, 13], [2.6, 17.4]], 0.55, crease);
    manica(ctx, 8.6, 18.6, 3, -5.9, 5.7);
    // Shoulder plate.
    smooth(ctx, [[-7.6, -6.4], [0, -9.8], [7.8, -6], [8.4, 1], [4.4, 6], [-3.8, 6], [-8, 1]], BRONZE);
    stroke(ctx, [[-6.2, -0.4], [-3.2, 3.6], [3.8, 3.6], [6.6, -0.2]], 0.5, darken(BRONZE, 0.6));
    glint(ctx, 2.6, -4.4, 2.8, 1.5, BRONZE_HI, 0.85, -0.3);
    rivet(ctx, -4.6, 2.4);
    rivet(ctx, 0.2, 4.2);
    rivet(ctx, 5, 2.4);
  },
};

const lowerArm = {
  stretch: 1.14,
  box: [-8, -6, 8, 27],
  start: [0, 0],
  end: [0, 19],
  draw(ctx) {
    smooth(ctx, [
      [-4, -2.6], [0, -4], [4, -2.6], [4.7, 4], [3.5, 12.6], [3, 17.6], [-2.6, 17.6],
      [-3.4, 12], [-4.9, 4],
    ], SKIN);
    manica(ctx, 0.6, 14.6, 4, -5, 4.9);
    // Fist.
    smooth(ctx, [[-3.5, 17.2], [0.4, 16.2], [3.9, 17.6], [4.4, 21], [2.2, 24], [-1.8, 24.2], [-3.9, 21.4]], SKIN);
    stroke(ctx, [[1.4, 18.8], [1.2, 23.2]], 0.45, crease, false);
    stroke(ctx, [[-0.9, 18.9], [-1.1, 23.4]], 0.45, crease, false);
    // Leather wrist wrap.
    band(ctx, 14.4, 17.4, -3.5, 3.6, LEATHER, { sag: 0.7 });
  },
};

const upperLeg = {
  stretch: 1.32,
  box: [-10, -8, 11, 36],
  start: [0, 0],
  end: [0, 30],
  draw(ctx) {
    smooth(ctx, [
      [-6, -3], [0, -5.2], [6.6, -2.2], [7.8, 9], [6.2, 20], [4.9, 28.6], [0, 32.6],
      [-4.3, 28.8], [-6.3, 18], [-7.2, 7],
    ], SKIN);
    stroke(ctx, [[2.4, 5], [4, 15], [3.2, 24.6]], 0.55, crease);
    stroke(ctx, [[-2.6, 25.4], [0.4, 27.4], [3.4, 25.8]], 0.5, crease);
    glint(ctx, 4.6, 9, 1.2, 4.2, lighten(SKIN, 0.5), 0.45, 0.1);
  },
};

const lowerLeg = {
  stretch: 1.26,
  box: [-9, -9, 9, 33],
  start: [0, 0],
  end: [0, 28],
  draw(ctx) {
    smooth(ctx, [
      [-4.4, -3], [0, -4.6], [4.6, -3], [4.7, 8], [3.5, 20], [3.1, 28.8], [0, 30.4],
      [-3, 28.8], [-3.7, 21], [-6.3, 11], [-5.3, 3],
    ], SKIN);
    // Greave straps round the calf.
    band(ctx, 4.4, 6.8, -6.2, 2, LEATHER, { sag: 0.6 });
    band(ctx, 17.6, 19.8, -4.2, 2, LEATHER, { sag: 0.5 });
    // Bronze greave with a knee cop.
    smooth(ctx, [
      [0.4, -7.4], [4.6, -5.8], [6, -1], [5.8, 9], [4.5, 26.4], [1, 27.6], [-0.4, 13],
      [-1.6, 1], [-1.4, -5],
    ], BRONZE);
    stroke(ctx, [[-1, -0.6], [2.4, 0.8], [5.8, -0.4]], 0.55, darken(BRONZE, 0.55));
    stroke(ctx, [[3.4, 3], [3.5, 14], [2.8, 24]], 0.7, BRONZE_HI);
  },
};

const foot = {
  stretch: 1.12,
  box: [-7, -5, 13, 7],
  start: [0, 0],
  draw(ctx) {
    smooth(ctx, [[-4.2, 1.6], [-3.2, -3], [2.6, -3.2], [4.4, -0.6], [9.6, 1.6], [10.8, 3.8], [9, 4.8], [-4, 4.8]], SKIN);
    // Sandal: sole and straps.
    hard(ctx, [[-4.6, 4.2], [11, 4.2], [11.2, 5.6], [-4.8, 5.6]], LEATHER_DARK, { line: 0.6 });
    stroke(ctx, [[-2.4, -2.8], [2.8, 4]], 0.9, LEATHER, false);
    stroke(ctx, [[2.6, -3], [-3.2, 4]], 0.9, LEATHER, false);
    stroke(ctx, [[5.6, 0.2], [5, 4]], 0.9, LEATHER, false);
    stroke(ctx, [[8.4, 1.4], [8, 4]], 0.8, LEATHER, false);
  },
};

const head = {
  box: [-15, -36, 16, 5],
  origin: [0, 0],
  draw(ctx) {
    // Neck.
    smooth(ctx, [[-3.8, 3], [-3.6, -6], [4, -6], [4.2, 3]], SKIN);
    // Horsehair crest fanning over the dome.
    smooth(ctx, [
      [-10.6, -12.4], [-12, -22], [-6.4, -30.6], [2, -33.4], [9.4, -30], [12.6, -22.6],
      [9.2, -19.4], [3, -23.6], [-4, -23], [-8.8, -16.6],
    ], RED);
    const hair = darken(RED, 0.55);
    for (const [x0, y0, x1, y1] of [
      [-8.4, -17.6, -10.8, -22.4], [-6, -21.4, -8, -27.6], [-2.6, -23, -3.4, -31],
      [1.4, -23.4, 1.8, -32.4], [5, -22.4, 6.6, -30.8], [8, -20.4, 10.8, -26],
    ]) stroke(ctx, [[x0, y0], [x1, y1]], 0.5, hair, false);
    // Neck guard flaring behind.
    smooth(ctx, [[-8.6, -11], [-12.8, -5.6], [-11.6, -3], [-5.6, -6.4]], darken(BRONZE, 0.85));
    // Dome.
    smooth(ctx, [
      [-9.2, -9], [-8.8, -17], [-3.4, -22.6], [4, -22.8], [9, -18], [9.6, -10], [0, -8.4],
    ], BRONZE);
    glint(ctx, 3.6, -18.4, 3.4, 1.8, BRONZE_HI, 0.85, 0.5);
    stroke(ctx, [[-8.6, -17.4], [-3.2, -23.2], [4.2, -23.4], [9.2, -18.4]], 0.9, darken(BRONZE, 0.6));
    // Cheek plate and visor grille.
    smooth(ctx, [[-7.2, -10], [2, -10.8], [2.8, -1.4], [-2.8, -2.2], [-6.6, -5]], darken(BRONZE, 0.9));
    hard(ctx, [[1.4, -11], [11, -11.6], [11.4, -3.2], [7.2, 1], [2.4, -1.2]], BRONZE, { line: 0.8 });
    ctx.fillStyle = INK;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.beginPath();
        ctx.arc(4.6 + col * 2.2, -8.6 + row * 2.3, 0.72, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    stroke(ctx, [[2, -10.4], [3, -1.2]], 0.6, darken(BRONZE, 0.55), false);
    // Wide brim.
    smooth(ctx, [[-11.4, -11.6], [0, -13], [12.8, -12.8], [14, -10.6], [0, -10], [-11.8, -9]], lighten(BRONZE, 0.12));
    stroke(ctx, [[-9.6, -11.2], [0, -12.2], [12, -12]], 0.5, BRONZE_HI);
  },
};

// Gladius, drawn tip-up from the grip. `length` is grip-to-tip in rig units.
function weapon(length) {
  return {
    box: [-5, -length - 2, 5, 8],
    start: [0, 0],
    end: [0, -length],
    draw(ctx) {
      const L = length;
      // Blade: waisted, with a long point.
      hard(ctx, [[-2.6, -5], [-2.2, -L * 0.48], [-3, -L * 0.74], [0, -L], [3, -L * 0.74], [2.2, -L * 0.48], [2.6, -5]], STEEL, {
        shadow: darken(STEEL, 0.72), light: [1.6, 0],
      });
      stroke(ctx, [[0, -5.4], [0, -L + 2.2]], 0.5, darken(STEEL, 0.55), false);
      stroke(ctx, [[1.4, -7], [1.3, -L * 0.46], [1.9, -L * 0.72]], 0.5, '#ffffff');
      // Guard, grip and pommel.
      form(ctx, c => c.roundRect(-3.6, -5.6, 7.2, 2.6, 1), BRONZE, { line: 0.7 });
      form(ctx, c => c.roundRect(-1.4, -3.2, 2.8, 6.6, 0.8), WOOD, { line: 0.7 });
      for (const y of [-1.6, 0, 1.6]) stroke(ctx, [[-1.3, y], [1.3, y]], 0.35, darken(WOOD, 0.55), false);
      disc(ctx, 0, 4.8, 2.1, BRONZE, { line: 0.7 });
      glint(ctx, 0.5, 4.2, 0.7, 0.5, BRONZE_HI, 0.9);
    },
  };
}

// Scutum carried on the off arm; held at its centre grip.
const shield = {
  box: [-9, -22, 12, 21],
  start: [0, 0],
  draw(ctx) {
    const outline = c => c.roundRect(-6.6, -19.6, 15.6, 37.6, 3.4);
    form(ctx, outline, RED, { shadow: darken(RED, 0.62), light: [2.4, -1.4], line: 0 });
    // Bronze rim, then the ink line outside it.
    ctx.beginPath();
    outline(ctx);
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = BRONZE;
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-7.5, -20.5, 17.4, 39.4, 4);
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = INK;
    ctx.stroke();
    // Wings and bolts round the boss.
    const gold = BRONZE_HI;
    stroke(ctx, [[1.2, -4.6], [-3.4, -10], [-1.4, -15.4]], 0.9, gold);
    stroke(ctx, [[1.2, -4.6], [5.6, -10], [4, -15.4]], 0.9, gold);
    stroke(ctx, [[1.2, 3.6], [-3.4, 9], [-1.4, 14]], 0.9, gold);
    stroke(ctx, [[1.2, 3.6], [5.6, 9], [4, 14]], 0.9, gold);
    stroke(ctx, [[1.2, -17], [1.2, -5]], 0.7, gold, false);
    stroke(ctx, [[1.2, 4], [1.2, 15.4]], 0.7, gold, false);
    disc(ctx, 1.2, -0.5, 3.6, BRONZE, { line: 0.8 });
    glint(ctx, 2.2, -1.6, 1.2, 0.8, BRONZE_HI, 0.95);
  },
};

export default {
  id: 'gladiator',
  parts: { torso, upper_arm: upperArm, lower_arm: lowerArm, upper_leg: upperLeg, lower_leg: lowerLeg, foot, head, shield },
  weapon,
};
