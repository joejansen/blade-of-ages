import { INK, darken, lighten, smooth, hard, stroke, form, glow } from '../vector/kit.js';

// Foreground props for the fight stages, drawn with the fighters' ink-and-cel
// kit but in screen pixels (the fighters draw at ~2 px per rig unit, and the
// foreground sits nearer the camera, so its ink line is a touch heavier).
// Every prop is anchored where it meets the ground: (x, y) is the middle of
// its base, +y down.
export const LINE_PX = 2.4;
// Light from the front and above, scaled to pixels.
export const LIGHT_PX = [4.5, -3.5];
const INKED = { line: LINE_PX };

// Deterministic jitter, so a stage draws the same every time it is built.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rad = deg => deg * Math.PI / 180;
// Point `d` along a direction leaning `angle` degrees off vertical.
const along = (x, y, angle, d) => [x + Math.sin(rad(angle)) * d, y - Math.cos(rad(angle)) * d];

// A faceted boulder: an angular outline from base to base, sunk a little
// into the ground, split into a lit plane (toward the light, up and to the
// right), a shadowed plane and a top facet, with cracks.
export function rock(ctx, { x, y, w, h, color, seed = 1 }) {
  const r = rng(seed);
  const n = 7;
  const top = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = Math.PI * (1 - t);
    // Alternate in and out so the outline breaks into planes, not a dome.
    const k = (i % 2 ? 0.98 : 0.8) + (r() - 0.5) * 0.22;
    top.push([x + Math.cos(a) * (w / 2) * (0.9 + r() * 0.12), y - Math.sin(a) ** 0.7 * h * k]);
  }
  const base = [[x + w / 2, y + 8], [x - w / 2, y + 8]];
  const outline = [...top, ...base];
  hard(ctx, outline, darken(color, 0.62), { ...INKED, light: [0, 0], shadow: darken(color, 0.62) });

  // The ridge runs from the highest outline point down to the base.
  let peak = 1;
  for (let i = 1; i < n; i++) if (top[i][1] < top[peak][1]) peak = i;
  const ridgeFoot = [x + (r() - 0.3) * w * 0.25, y + 8];
  const inner = [top[peak][0] + (r() - 0.5) * w * 0.1, top[peak][1] + h * (0.22 + r() * 0.12)];
  // Lit plane: from the peak round the right-hand side.
  hard(ctx, [inner, ...top.slice(peak + 1), [x + w / 2, y + 8], ridgeFoot], color, { line: 1.4, light: [0, 0], shadow: color });
  // Top facet catching the most light.
  hard(ctx, [top[Math.max(0, peak - 1)], top[peak], top[Math.min(n, peak + 1)], inner], lighten(color, 0.2), { line: 1.4, light: [0, 0], shadow: lighten(color, 0.2) });
  // Cracks across both planes.
  for (let i = 0; i < 3; i++) {
    const cx = x + (r() - 0.5) * w * 0.55;
    const cy = y - h * (0.2 + r() * 0.4);
    stroke(ctx, [[cx, cy], [cx + (r() - 0.5) * w * 0.2, cy + h * 0.14], [cx + (r() - 0.5) * w * 0.16, cy + h * 0.3]], 1.4, darken(color, 0.4), false);
  }
}

// A spear driven into the ground, leaning `angle` degrees.
export function spear(ctx, { x, y, angle = 0, len, wood = '#6a4a2c', iron = '#7b7f86' }) {
  const half = 2.6;
  const nx = Math.cos(rad(angle)) * half;
  const ny = Math.sin(rad(angle)) * half;
  const [tx, ty] = along(x, y, angle, len);
  hard(ctx, [[x - nx, y - ny], [tx - nx, ty - ny], [tx + nx, ty + ny], [x + nx, y + ny]], wood, { ...INKED, light: [1.5, 0] });
  // Leaf-shaped head.
  const [bx, by] = along(x, y, angle, len - 4);
  const [mx, my] = along(x, y, angle, len + 16);
  const [px, py] = along(x, y, angle, len + 40);
  const w = 7;
  const wx = Math.cos(rad(angle)) * w;
  const wy = Math.sin(rad(angle)) * w;
  hard(ctx, [[bx, by], [mx - wx, my - wy], [px, py], [mx + wx, my + wy]], iron, { ...INKED, light: [2, 0] });
  stroke(ctx, [[bx, by], [px, py]], 1, darken(iron, 0.5), false);
}

// A round shield propped on its rim, seen at an angle (squashed by `turn`).
export function shield(ctx, { x, y, r, color = '#a8823a', rim = '#6f5426', turn = 0.6, tilt = 0 }) {
  const cy = y - r * 0.92;
  const path = (k) => c => c.ellipse(x, cy, r * turn * k, r * k, rad(tilt), 0, Math.PI * 2);
  form(ctx, path(1), rim, { ...INKED, light: LIGHT_PX });
  form(ctx, path(0.84), color, { line: 1.4, light: LIGHT_PX });
  form(ctx, c => c.ellipse(x + r * turn * 0.08, cy, r * turn * 0.2, r * 0.2, rad(tilt), 0, Math.PI * 2), lighten(rim, 0.15), { line: 1.4, light: [2, -1.5] });
}

// A clump of grass or reeds: tapering blades fanned from one root.
export function tuft(ctx, { x, y, h, color, seed = 1, count = 7, spread = 1 }) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const lean = (t - 0.5) * 50 * spread + (r() - 0.5) * 14;
    const len = h * (0.55 + r() * 0.45) * (1 - Math.abs(t - 0.5) * 0.5);
    const root = x + (t - 0.5) * 22 * spread;
    const [tx, ty] = along(root, y, lean, len);
    const [mx, my] = along(root, y, lean * 0.6, len * 0.55);
    const shade = i % 2 ? color : darken(color, 0.75);
    smooth(ctx, [[root - 3.2, y + 4], [mx - 2, my], [tx, ty], [mx + 2.2, my], [root + 3.2, y + 4]], shade, { line: 1.3, light: [1.2, -1] });
  }
}

export function barrel(ctx, { x, y, w = 70, h = 96, wood = '#7a5232', iron = '#4a4a4e' }) {
  const top = y - h;
  smooth(ctx, [
    [x - w * 0.42, y + 4], [x - w * 0.5, y - h * 0.5], [x - w * 0.42, top], [x + w * 0.42, top],
    [x + w * 0.5, y - h * 0.5], [x + w * 0.42, y + 4],
  ], wood, { ...INKED, light: LIGHT_PX });
  for (const k of [-0.26, 0, 0.26]) stroke(ctx, [[x + w * k * 0.9, top + 4], [x + w * k * 1.1, y - h * 0.5], [x + w * k * 0.9, y]], 1.2, darken(wood, 0.5));
  for (const t of [0.14, 0.86]) {
    const hy = top + h * t;
    const hw = w * (0.44 + Math.sin(Math.PI * t) * 0.06);
    hard(ctx, [[x - hw, hy - 4], [x + hw, hy - 4], [x + hw, hy + 4], [x - hw, hy + 4]], iron, { line: 1.6 });
  }
  form(ctx, c => c.ellipse(x, top + 1, w * 0.4, 6, 0, 0, Math.PI * 2), darken(wood, 0.8), { line: 1.6 });
}

export function crate(ctx, { x, y, w = 90, h = 80, wood = '#8a6a40' }) {
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  hard(ctx, [[x0, y + 4], [x0, y - h], [x1, y - h], [x1, y + 4]], wood, { ...INKED, light: LIGHT_PX });
  for (let k = 1; k < 4; k++) stroke(ctx, [[x0 + 5, y - h * k / 4], [x1 - 5, y - h * k / 4]], 1.1, darken(wood, 0.55), false);
  const edge = darken(wood, 0.8);
  hard(ctx, [[x0, y - h], [x1, y - h], [x1, y - h + 9], [x0, y - h + 9]], edge, { line: 1.6 });
  hard(ctx, [[x0, y - 5], [x1, y - 5], [x1, y + 4], [x0, y + 4]], edge, { line: 1.6 });
  hard(ctx, [[x0 + 4, y - 5], [x0 + 14, y - 5], [x1 - 4, y - h + 9], [x1 - 14, y - h + 9]], edge, { line: 1.6 });
}

// An upright post: dock bollard, rail post, lantern pole, deck bitt.
export function post(ctx, { x, y, w = 26, h = 120, color = '#6a4a2c', cap = true }) {
  const top = y - h;
  smooth(ctx, [[x - w / 2, y + 6], [x - w / 2, top + w * 0.3], [x - w * 0.3, top], [x + w * 0.3, top], [x + w / 2, top + w * 0.3], [x + w / 2, y + 6]], color, { ...INKED, light: LIGHT_PX });
  stroke(ctx, [[x - w * 0.15, top + 10], [x - w * 0.12, y - 6]], 1.1, darken(color, 0.55), false);
  if (cap) hard(ctx, [[x - w * 0.62, top + 12], [x + w * 0.62, top + 12], [x + w * 0.62, top + 20], [x - w * 0.62, top + 20]], darken(color, 0.8), { line: 1.6 });
}

// A horizontal beam between two x positions (railings, gunwales, steps).
export function beam(ctx, { x0, x1, y, h = 18, color = '#6a4a2c', seed = 1 }) {
  const r = rng(seed);
  hard(ctx, [[x0, y - h], [x1, y - h + (r() - 0.5) * 3], [x1, y], [x0, y]], color, { ...INKED, light: [0, -3] });
  for (let x = x0 + 40 + r() * 30; x < x1 - 20; x += 70 + r() * 60) {
    stroke(ctx, [[x, y - h + 4], [x + 18, y - h * 0.4]], 1, darken(color, 0.55), false);
  }
}

// A coil of rope lying on the ground.
export function rope(ctx, { x, y, r = 34, color = '#a68a5a' }) {
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * 0.22;
    form(ctx, c => c.ellipse(x, y - 9 - i * 7, r * k, r * k * 0.32, 0, 0, Math.PI * 2), i % 2 ? darken(color, 0.85) : color, { line: 1.8, light: [2, -2] });
  }
  stroke(ctx, [[x + r * 0.9, y - 12], [x + r * 1.4, y - 2], [x + r * 2, y + 2]], 4, INK);
  stroke(ctx, [[x + r * 0.9, y - 12], [x + r * 1.4, y - 2], [x + r * 2, y + 2]], 2.2, color);
}

// A pillar broken off partway up, fluted, with a jagged top.
export function column(ctx, { x, y, w = 70, h = 240, stone = '#b8a888', seed = 1 }) {
  const r = rng(seed);
  const top = y - h;
  const jag = [];
  // Broken top, left to right.
  for (let i = 0; i <= 5; i++) jag.push([x - w / 2 + (w * i) / 5, top + (r() - 0.3) * 26]);
  hard(ctx, [[x - w / 2, y - 22], ...jag, [x + w / 2, y - 22]], stone, { ...INKED, light: LIGHT_PX });
  for (let k = -2; k <= 2; k++) stroke(ctx, [[x + k * w * 0.16, top + 22], [x + k * w * 0.16, y - 26]], 1.3, darken(stone, 0.62), false);
  hard(ctx, [[x - w / 2 - 10, y - 22], [x + w / 2 + 10, y - 22], [x + w / 2 + 14, y + 6], [x - w / 2 - 14, y + 6]], darken(stone, 0.88), { line: 1.8 });
}

// A cut stone block: dressed masonry courses, or (carved) one band of
// stepped relief like temple stonework.
export function block(ctx, { x, y, w = 120, h = 70, stone = '#8a8a70', seed = 1, carved = false }) {
  const r = rng(seed);
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  hard(ctx, [[x0, y + 6], [x0 + r() * 4, y - h + 6], [x0 + 8, y - h], [x1 - 6 - r() * 4, y - h - r() * 4], [x1, y - h + 8], [x1, y + 6]], stone, { ...INKED, light: LIGHT_PX });
  const joint = darken(stone, 0.5);
  if (carved) {
    stroke(ctx, [[x0 + 8, y - h * 0.62], [x1 - 8, y - h * 0.62]], 1.4, joint, false);
    for (let px = x0 + 14; px < x1 - 22; px += 26) {
      stroke(ctx, [[px, y - h * 0.62], [px, y - h * 0.82], [px + 13, y - h * 0.82], [px + 13, y - h * 0.62]], 1.2, joint, false);
    }
  } else {
    const course = 30;
    for (let cy = y - course, row = 0; cy > y - h + 10; cy -= course, row++) {
      stroke(ctx, [[x0 + 4, cy + (r() - 0.5) * 3], [x1 - 4, cy + (r() - 0.5) * 3]], 1.3, joint, false);
      for (let px = x0 + (row % 2 ? 22 : 44); px < x1 - 12; px += 52 + r() * 14) {
        stroke(ctx, [[px, cy], [px + (r() - 0.5) * 3, cy + course]], 1.2, joint, false);
      }
    }
  }
  // Chips and weathering.
  for (let i = 0; i < 3; i++) {
    const cx = x0 + 10 + r() * (w - 20);
    const cy = y - h * (0.2 + r() * 0.65);
    stroke(ctx, [[cx, cy], [cx + 6 + r() * 6, cy + 2 + r() * 4]], 1.1, darken(stone, 0.45), false);
  }
  stroke(ctx, [[x0 + 10, y - h + 5], [x1 - 12, y - h + 3]], 1.4, lighten(stone, 0.25), false);
}

// Broad leaves fanned from one root (jungle fronds, agave, banana).
export function fronds(ctx, { x, y, len = 140, color = '#3f7a3a', angles = [-60, -30, 0, 30, 60], seed = 1 }) {
  const r = rng(seed);
  for (const a0 of angles) {
    const a = a0 + (r() - 0.5) * 10;
    const l = len * (0.75 + r() * 0.3) * (1 - Math.abs(a) / 220);
    const [mx, my] = along(x, y, a * 0.8, l * 0.5);
    const [tx, ty] = along(x, y, a * 1.15, l);
    const nx = Math.cos(rad(a)) * l * 0.16;
    const ny = Math.sin(rad(a)) * l * 0.16;
    const shade = r() > 0.5 ? color : darken(color, 0.78);
    smooth(ctx, [[x, y + 4], [mx - nx, my - ny], [tx, ty], [mx + nx, my + ny]], shade, { line: 1.8, light: [2, -1.6] });
    stroke(ctx, [[x, y], [mx, my], [tx, ty]], 1.1, darken(color, 0.5));
  }
}

// A cart wheel half sunk in the ground.
export function wheel(ctx, { x, y, r = 60, wood = '#6a4a2c' }) {
  const cy = y - r * 0.55;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    stroke(ctx, [[x, cy], [x + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9]], 7, INK, false);
    stroke(ctx, [[x, cy], [x + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9]], 4.4, wood, false);
  }
  ctx.save();
  ctx.lineWidth = 10 + LINE_PX * 2;
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.arc(x, cy, r * 0.94, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 10;
  ctx.strokeStyle = wood;
  ctx.stroke();
  ctx.restore();
  form(ctx, c => c.arc(x, cy, r * 0.16, 0, Math.PI * 2), darken(wood, 0.8), INKED);
}

// A paper lantern on a short pole, lit from inside.
export function lantern(ctx, { x, y, h = 170, wood = '#4a2c1c', paper = '#f0d8a8', light = '#ffc070' }) {
  post(ctx, { x, y, w: 14, h, color: wood, cap: false });
  const cy = y - h - 30;
  ctx.save();
  ctx.globalAlpha = 0.35;
  glow(ctx, x, cy, 70, light);
  ctx.restore();
  hard(ctx, [[x - 26, cy - 34], [x + 26, cy - 34], [x + 26, cy + 30], [x - 26, cy + 30]], paper, { ...INKED, light: [3, -2] });
  for (const k of [-1, 0, 1]) stroke(ctx, [[x + k * 13, cy - 30], [x + k * 13, cy + 26]], 1.2, darken(paper, 0.6), false);
  stroke(ctx, [[x - 22, cy - 2], [x + 22, cy - 2]], 1.2, darken(paper, 0.6), false);
  hard(ctx, [[x - 34, cy - 44], [x + 34, cy - 44], [x + 26, cy - 34], [x - 26, cy - 34]], wood, { line: 1.8 });
  hard(ctx, [[x - 30, cy + 30], [x + 30, cy + 30], [x + 30, cy + 38], [x - 30, cy + 38]], wood, { line: 1.8 });
}

// Black-and-yellow hazard chock (carrier deck).
export function chock(ctx, { x, y, w = 80, h = 30, steel = '#5a5e64', stripe = '#d8b030' }) {
  hard(ctx, [[x - w / 2, y + 4], [x - w / 2 + 12, y - h], [x + w / 2 - 12, y - h], [x + w / 2, y + 4]], steel, { ...INKED, light: LIGHT_PX });
  for (let k = -2; k <= 1; k++) {
    const sx0 = x + k * 18;
    hard(ctx, [[sx0, y - h + 4], [sx0 + 9, y - h + 4], [sx0 + 1, y], [sx0 - 8, y]], stripe, { line: 0 });
  }
}

// The nearest strip of ground, running the full width along the bottom of
// the frame. `top` is its average height; it rolls gently around that.
export function lip(ctx, { x0, x1, top, bottom, color, seed = 1, roll = 10 }) {
  const r = rng(seed);
  const pts = [[x0, bottom]];
  for (let x = x0; x <= x1; x += 48) pts.push([x, top + (r() - 0.5) * roll * 2]);
  pts.push([x1, top], [x1, bottom]);
  hard(ctx, pts, color, { ...INKED, shadow: darken(color, 0.6), light: [0, 6] });
  // Strata running along the face.
  for (let i = 0; i < 3; i++) {
    const sy = top + 22 + i * 22;
    const seg = [];
    for (let x = x0; x <= x1; x += 80) seg.push([x, sy + (r() - 0.5) * 8]);
    stroke(ctx, seg, 1.2, darken(color, 0.55));
  }
  // Pebbles and grit along the top edge.
  for (let x = x0 + 20; x < x1; x += 30 + r() * 60) {
    const y = top + 6 + r() * 24;
    smooth(ctx, [[x - 6, y + 3], [x - 4, y - 3], [x + 4, y - 4], [x + 7, y + 2]], lighten(color, 0.12), { line: 1.2, light: [1, -1] });
  }
}
