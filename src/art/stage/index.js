import { setMood } from '../vector/kit.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/constants.js';
import {
  LIGHT_PX, rock, spear, shield, tuft, barrel, crate, post, beam, rope, column, block, fronds, wheel, lantern, chock, lip,
} from './props.js';

// Each fight stage is three layers:
//   background  the painted plate above `horizon`: sky, distance, walls.
//               It scrolls slower than the fighters (BG_PARALLAX).
//   midground   the painted plate's floor below `horizon`, which the
//               fighters stand on, so it moves with them.
//   foreground  props drawn in code between the fighters and the camera.
//               It scrolls faster than the fighters (FG_PARALLAX).
// The two plate layers blend across `feather` px around the horizon.
export const BG_PARALLAX = 0.92;
export const FG_PARALLAX = 1.1;
export const FEATHER = 60;

// The foreground texture covers this screen region; the margin leaves room
// for parallax when the camera pans and zooms.
export const FG_MARGIN = 48;
export const FG_TOP = 300;
export const FG_BOX = [-FG_MARGIN, FG_TOP, GAME_WIDTH + FG_MARGIN, GAME_HEIGHT + FG_MARGIN];

// The fighters move through the middle of the frame. Foreground there may
// only rise to just above their soles, so footwork stays readable; tall
// props stand at the edges, where a cornered fighter passes behind them.
export const LANE = { x0: 230, x1: 1050, top: 556 };

const W0 = -FG_MARGIN;
const W1 = GAME_WIDTH + FG_MARGIN;
const BOTTOM = GAME_HEIGHT + FG_MARGIN;

// Positions are screen pixels at rest. The fight camera usually sits pushed
// in (~1.16x), which shows about x 90-1190 and down to y ~690, so props are
// kept inside that frame: the near ground starts ~50px under the fighters'
// feet (GROUND_Y 580) and edge props stand inside x ~100-230 / 1050-1180.
const STAGES = {
  castle: {
    horizon: 545,
    foreground(ctx) {
      const stone = '#8a8478';
      lip(ctx, { x0: W0, x1: W1, top: 632, bottom: BOTTOM, color: '#5c564c', seed: 11 });
      spear(ctx, { x: 196, y: 560, angle: -8, len: 200 });
      spear(ctx, { x: 220, y: 560, angle: -2, len: 220 });
      block(ctx, { x: 130, y: 690, w: 200, h: 140, stone, seed: 2 });
      block(ctx, { x: 125, y: 552, w: 140, h: 90, stone: '#7c766a', seed: 5 });
      wheel(ctx, { x: 420, y: 680, r: 64 });
      tuft(ctx, { x: 700, y: 642, h: 70, color: '#5a6a3a', seed: 4 });
      block(ctx, { x: 910, y: 680, w: 110, h: 60, stone, seed: 8 });
      barrel(ctx, { x: 1095, y: 672, w: 70, h: 96 });
      crate(ctx, { x: 1172, y: 672, w: 120, h: 110 });
      barrel(ctx, { x: 1172, y: 562, w: 64, h: 86 });
    },
  },
  dojo: {
    horizon: 500,
    foreground(ctx) {
      const wood = '#6a3a22';
      lip(ctx, { x0: W0, x1: W1, top: 634, bottom: BOTTOM, color: '#4a2a1a', seed: 3, roll: 3 });
      beam(ctx, { x0: W0, x1: W1, y: 678, h: 26, color: '#5a3020', seed: 2 });
      beam(ctx, { x0: W0, x1: 225, y: 566, h: 16, color: wood, seed: 4 });
      beam(ctx, { x0: 1055, x1: W1, y: 566, h: 16, color: wood, seed: 5 });
      post(ctx, { x: 215, y: 650, w: 24, h: 110, color: wood });
      post(ctx, { x: 1065, y: 650, w: 24, h: 110, color: wood });
      lantern(ctx, { x: 140, y: 660, h: 150 });
      lantern(ctx, { x: 1140, y: 660, h: 150 });
      // A step box, and a practice sword left on the boards.
      crate(ctx, { x: 440, y: 652, w: 120, h: 68, wood: '#6a4026' });
      spear(ctx, { x: 560, y: 652, angle: 84, len: 160, wood: '#a88a5a', iron: '#a88a5a' });
    },
  },
  longship: {
    horizon: 495,
    foreground(ctx) {
      barrel(ctx, { x: 150, y: 642, w: 76, h: 110 });
      post(ctx, { x: 1130, y: 642, w: 34, h: 180, color: '#5a3a22' });
      rope(ctx, { x: 1080, y: 644, r: 30 });
      // The gunwale nearest the camera, hung with shields.
      beam(ctx, { x0: W0, x1: W1, y: BOTTOM, h: 128, color: '#5a3a22', seed: 2 });
      const faces = ['#a83a2a', '#c8a040', '#3a5a8a', '#e0d8c0', '#4a6a3a'];
      for (let i = 0, x = 60; x < W1; x += 170, i++) {
        shield(ctx, { x, y: 664, r: 40, turn: 1, color: faces[i % faces.length], rim: '#5a4630' });
      }
    },
  },
  colosseum: {
    horizon: 490,
    foreground(ctx) {
      const stone = '#c8b890';
      lip(ctx, { x0: W0, x1: W1, top: 634, bottom: BOTTOM, color: '#8a6a42', seed: 7 });
      column(ctx, { x: 150, y: 690, w: 88, h: 300, stone, seed: 3 });
      column(ctx, { x: 1135, y: 690, w: 80, h: 210, stone, seed: 9 });
      shield(ctx, { x: 214, y: 668, r: 44, color: '#a83a2a', rim: '#b08a3e' });
      spear(ctx, { x: 1062, y: 668, angle: 16, len: 200 });
      rock(ctx, { x: 640, y: 678, w: 240, h: 110, color: '#a8865a', seed: 4 });
      block(ctx, { x: 900, y: 678, w: 96, h: 70, stone, seed: 6 });
    },
  },
  steppe: {
    horizon: 470,
    foreground(ctx) {
      const grass = '#6a8a3a';
      lip(ctx, { x0: W0, x1: W1, top: 634, bottom: BOTTOM, color: '#56662e', seed: 5 });
      wheel(ctx, { x: 150, y: 690, r: 70 });
      tuft(ctx, { x: 90, y: 672, h: 230, color: grass, seed: 2, count: 11, spread: 1.2 });
      rock(ctx, { x: 1160, y: 690, w: 210, h: 190, color: '#7a7a6a', seed: 6 });
      tuft(ctx, { x: 1120, y: 670, h: 160, color: grass, seed: 9, count: 9, spread: 1.4 });
      tuft(ctx, { x: 330, y: 652, h: 84, color: grass, seed: 3 });
      tuft(ctx, { x: 560, y: 660, h: 70, color: '#7a9a46', seed: 4 });
      tuft(ctx, { x: 820, y: 652, h: 84, color: grass, seed: 5 });
      tuft(ctx, { x: 990, y: 656, h: 76, color: '#7a9a46', seed: 6 });
    },
  },
  thermopylae: {
    horizon: 470,
    foreground(ctx) {
      const red = '#8a4a36';
      lip(ctx, { x0: W0, x1: W1, top: 632, bottom: BOTTOM, color: '#5a3c2c', seed: 3 });
      spear(ctx, { x: 205, y: 650, angle: -10, len: 230 });
      rock(ctx, { x: 120, y: 690, w: 220, h: 330, color: red, seed: 3 });
      shield(ctx, { x: 214, y: 666, r: 46 });
      spear(ctx, { x: 1075, y: 655, angle: 14, len: 210 });
      rock(ctx, { x: 1160, y: 690, w: 220, h: 300, color: '#7a5a4a', seed: 7 });
      shield(ctx, { x: 1062, y: 666, r: 44, tilt: 10 });
      rock(ctx, { x: 470, y: 670, w: 140, h: 100, color: red, seed: 5 });
      tuft(ctx, { x: 650, y: 642, h: 70, color: '#8a7a4a', seed: 8 });
      spear(ctx, { x: 770, y: 652, angle: 82, len: 150 });
      rock(ctx, { x: 880, y: 674, w: 110, h: 90, color: '#7a5a4a', seed: 2 });
    },
  },
  dock: {
    horizon: 515,
    foreground(ctx) {
      const wood = '#7a5a3a';
      crate(ctx, { x: 150, y: 642, w: 130, h: 120, wood: '#8a6a40' });
      crate(ctx, { x: 140, y: 522, w: 92, h: 82, wood: '#7a5a36' });
      barrel(ctx, { x: 1130, y: 642, w: 76, h: 112 });
      post(ctx, { x: 1068, y: 642, w: 36, h: 80, color: '#4a3422' });
      post(ctx, { x: 330, y: 642, w: 34, h: 70, color: '#4a3422' });
      rope(ctx, { x: 920, y: 646, r: 32 });
      beam(ctx, { x0: W0, x1: W1, y: BOTTOM, h: 128, color: '#5a3e26', seed: 6 });
      beam(ctx, { x0: W0, x1: W1, y: BOTTOM - 64, h: 10, color: wood, seed: 7 });
    },
  },
  savanna: {
    horizon: 450,
    foreground(ctx) {
      const grass = '#b0904a';
      lip(ctx, { x0: W0, x1: W1, top: 634, bottom: BOTTOM, color: '#6a4a2a', seed: 9 });
      rock(ctx, { x: 1110, y: 690, w: 110, h: 230, color: '#8a5a34', seed: 9 });
      rock(ctx, { x: 175, y: 690, w: 120, h: 110, color: '#7a5a3a', seed: 4 });
      tuft(ctx, { x: 80, y: 672, h: 240, color: grass, seed: 3, count: 11, spread: 1.2 });
      tuft(ctx, { x: 1190, y: 672, h: 240, color: grass, seed: 5, count: 11, spread: 1.2 });
      tuft(ctx, { x: 400, y: 652, h: 80, color: grass, seed: 6 });
      tuft(ctx, { x: 690, y: 658, h: 70, color: '#c0a058', seed: 7 });
      tuft(ctx, { x: 930, y: 652, h: 80, color: grass, seed: 8 });
    },
  },
  temple: {
    horizon: 525,
    foreground(ctx) {
      const stone = '#8a8a6a';
      const leaf = '#3f7a3a';
      block(ctx, { x: 140, y: 642, w: 170, h: 110, stone, seed: 3, carved: true });
      block(ctx, { x: 1140, y: 642, w: 150, h: 88, stone, seed: 4, carved: true });
      fronds(ctx, { x: 110, y: 620, len: 240, color: leaf, angles: [-50, -25, 0, 20], seed: 2 });
      fronds(ctx, { x: 1170, y: 626, len: 240, color: '#4a8a40', angles: [-20, 0, 25, 50], seed: 5 });
      beam(ctx, { x0: W0, x1: W1, y: BOTTOM, h: 132, color: '#6a6a52', seed: 3 });
      fronds(ctx, { x: 640, y: 646, len: 96, color: leaf, angles: [-50, -20, 20, 50], seed: 7 });
    },
  },
  carrier: {
    horizon: 470,
    foreground(ctx) {
      const steel = '#5a5e64';
      post(ctx, { x: 1100, y: 642, w: 18, h: 240, color: '#4a4e54', cap: false });
      crate(ctx, { x: 1170, y: 642, w: 140, h: 120, wood: '#6a7078' });
      post(ctx, { x: 150, y: 642, w: 50, h: 104, color: steel });
      post(ctx, { x: 205, y: 642, w: 44, h: 84, color: steel });
      beam(ctx, { x0: W0, x1: W1, y: BOTTOM, h: 126, color: '#3c4046', seed: 4 });
      chock(ctx, { x: 330, y: 644 });
      chock(ctx, { x: 960, y: 644 });
    },
  },
};

export const stageIds = () => Object.keys(STAGES);

export function getStage(id) {
  return STAGES[id] || STAGES.castle;
}

// Draw a stage's foreground into a 2D context whose origin is screen (0,0).
export function drawForeground(ctx, id) {
  setMood({ shadow: 0.62, light: LIGHT_PX });
  try {
    getStage(id).foreground(ctx);
  } finally {
    setMood();
  }
}

// Bake the foreground to a canvas texture covering FG_BOX. Browser only.
export function buildForegroundTexture(scene, id, key) {
  const [x0, y0, x1, y1] = FG_BOX;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, x1 - x0, y1 - y0);
  const ctx = tex.getContext();
  ctx.translate(-x0, -y0);
  drawForeground(ctx, id);
  tex.refresh();
  return key;
}
