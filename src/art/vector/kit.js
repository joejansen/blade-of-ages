// Drawing kit for hand-authored vector fighters.
//
// Every body part is drawn with Canvas2D in RIG UNITS (the same units the
// skeleton is solved in), +x toward the way the fighter faces, +y down.
// The look is ink-and-cel: a dark outline, a flat base colour, and one
// shadow tone left as a crescent on the side away from the light.
export const INK = '#1c1411';
export const LINE = 1.0;
// Light falls from the front and above.
export const LIGHT = [1.7, -1.3];

// Mood, set per warrior while its parts are drawn: how dark the shadow tone
// is and how far the lit area is pushed off it (a bigger offset leaves a
// wider shadow crescent).
let shadowDepth = 0.7;
let lightOffset = LIGHT;
export function setMood({ shadow = 0.7, light = LIGHT } = {}) {
  shadowDepth = shadow;
  lightOffset = light;
}

// Horizontal stretch applied to every coordinate while a part is drawn, so
// a limb can be made stockier without redrawing it or fattening its lines.
let stretch = 1;
export function setStretch(k = 1) { stretch = k; }
const sx = pts => (stretch === 1 ? pts : pts.map(([x, y]) => [x * stretch, y]));

const clamp8 = v => Math.max(0, Math.min(255, Math.round(v)));
const toRgb = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const toHex = rgb => `#${rgb.map(v => clamp8(v).toString(16).padStart(2, '0')).join('')}`;

// k < 1 darkens (and cools slightly, so shadows do not go muddy).
export function darken(color, k = 0.7) {
  const [r, g, b] = toRgb(color);
  return toHex([r * k * 0.97, g * k * 0.95, b * k * 1.04]);
}

export function lighten(color, k = 0.35) {
  const [r, g, b] = toRgb(color);
  return toHex([r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k]);
}

// Smooth curve through points (Catmull-Rom as cubic Béziers).
export function spline(ctx, pts, closed = true) {
  const n = pts.length;
  const at = i => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  ctx.moveTo(pts[0][0], pts[0][1]);
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1],
    );
  }
  if (closed) ctx.closePath();
}

// Straight-edged shape for plates, blades and belts.
export function poly(ctx, pts) {
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

// A shaded, outlined form. `path(ctx)` adds the outline to the current path.
export function form(ctx, path, fill, opts = {}) {
  const { shadow = darken(fill, shadowDepth), light = lightOffset, line = LINE, ink = INK } = opts;
  ctx.beginPath();
  path(ctx);
  ctx.fillStyle = shadow;
  ctx.fill();

  // The base colour, slid toward the light and clipped to the form, leaves
  // the shadow showing as a crescent on the far side.
  ctx.save();
  ctx.beginPath();
  path(ctx);
  ctx.clip();
  ctx.translate(light[0], light[1]);
  ctx.beginPath();
  path(ctx);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();

  if (line > 0) {
    ctx.beginPath();
    path(ctx);
    ctx.lineWidth = line;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ink;
    ctx.stroke();
  }
}

export const smooth = (ctx, pts, fill, opts) => { const p = sx(pts); form(ctx, c => spline(c, p, true), fill, opts); };
export const hard = (ctx, pts, fill, opts) => { const p = sx(pts); form(ctx, c => poly(c, p), fill, opts); };

// An open detail line: a muscle crease, a fold, a seam.
export function stroke(ctx, rawPts, width = 0.6, color = INK, curved = true) {
  const pts = sx(rawPts);
  ctx.beginPath();
  if (curved && pts.length > 2) spline(ctx, pts, false);
  else pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function disc(ctx, x, y, r, fill, opts) {
  form(ctx, c => c.arc(x * stretch, y, r, 0, Math.PI * 2), fill, opts);
}

// A soft additive-looking glow (embers, lit eye slits).
export function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x * stretch, y, 0, x * stretch, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x * stretch, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// A small specular dab.
export function glint(ctx, x, y, rx, ry, color = '#ffffff', alpha = 0.7, rotation = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.ellipse(x * stretch, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// A band wrapped round a limb between two heights: straps, arm guards.
export function band(ctx, y0, y1, xBack, xFront, fill, opts = {}) {
  const sag = opts.sag ?? 0.9;
  xBack *= stretch;
  xFront *= stretch;
  form(ctx, (c) => {
    c.moveTo(xBack, y0);
    c.quadraticCurveTo((xBack + xFront) / 2, y0 + sag, xFront, y0);
    c.lineTo(xFront, y1);
    c.quadraticCurveTo((xBack + xFront) / 2, y1 + sag, xBack, y1);
    c.closePath();
  }, fill, { line: opts.line ?? 0.7, shadow: opts.shadow });
}
