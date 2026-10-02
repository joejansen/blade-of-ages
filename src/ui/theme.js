import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { SoundManager } from '../audio/SoundManager.js';

// Visual language: "ink and blood". Near-black ground, bone-white type,
// a single crimson accent for violence/selection, muted gold for honours.
// Backgrounds are graded toward monochrome so the full-colour fighters
// carry the frame.
export const PALETTE = {
  ink: 0x0a0908,
  inkSoft: 0x16120f,
  inkLift: 0x241d18,
  bone: 0xece4d4,
  ash: 0x8a8378,
  ashDark: 0x4a453e,
  crimson: 0xb3122a,
  crimsonBright: 0xe0283f,
  gold: 0xd4af6a,
  goldDeep: 0x8f6f33,
  p1: 0x9cc4e4,
  p2: 0xe0525a,
};

export const HEX = {
  ink: '#0a0908',
  bone: '#ece4d4',
  ash: '#8a8378',
  ashDark: '#4a453e',
  crimson: '#b3122a',
  crimsonBright: '#e0283f',
  gold: '#d4af6a',
  p1: '#9cc4e4',
  p2: '#e0525a',
};

export const FONTS = {
  display: '"Cinzel", "Trajan Pro", Georgia, serif',
  body: '"Cormorant Garamond", Georgia, serif',
};

export const PLAYER_COLORS = [PALETTE.p1, PALETTE.p2];
export const PLAYER_HEX = [HEX.p1, HEX.p2];

// Text style presets. Phaser text renders to canvas, so weights must be
// passed through fontStyle (e.g. '900') rather than CSS font-weight.
export function displayText(size, opts = {}) {
  return {
    fontFamily: FONTS.display,
    fontSize: `${size}px`,
    fontStyle: opts.weight || '700',
    color: opts.color || HEX.bone,
    letterSpacing: opts.spacing ?? Math.round(size * 0.12),
    align: opts.align || 'center',
    ...(opts.stroke ? { stroke: opts.stroke, strokeThickness: opts.strokeThickness || 4 } : {}),
    ...(opts.shadow === false ? {} : {
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: opts.shadowBlur ?? 8, fill: true },
    }),
  };
}

export function bodyText(size, opts = {}) {
  return {
    fontFamily: FONTS.body,
    fontSize: `${size}px`,
    fontStyle: opts.italic ? `italic ${opts.weight || '500'}` : (opts.weight || '500'),
    color: opts.color || HEX.ash,
    letterSpacing: opts.spacing ?? 0,
    align: opts.align || 'center',
    lineSpacing: opts.lineSpacing ?? 4,
    ...(opts.wordWrap ? { wordWrap: { width: opts.wordWrap } } : {}),
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 4, fill: true },
  };
}

export function isWebGL(scene) {
  return scene.sys.game.renderer.type === Phaser.WEBGL;
}

// Colour-grade an image toward monochrome. `tint` is a per-channel
// multiplier used to wash the grade toward an arena's mood colour.
export function gradeImage(scene, image, grade = {}) {
  const {
    saturation = -0.7,
    brightness = 0.62,
    contrast = 0.18,
    tint = [1, 1, 1],
  } = grade;

  if (isWebGL(scene) && image.preFX) {
    const fx = image.preFX.addColorMatrix();
    applyGrade(fx, { saturation, brightness, contrast, tint });
    return fx;
  }

  // Canvas fallback: a darkening tint is the best we can do.
  const v = Math.round(255 * brightness);
  image.setTint(Phaser.Display.Color.GetColor(
    Math.round(v * tint[0]), Math.round(v * tint[1]), Math.round(v * tint[2]),
  ));
  return null;
}

export function applyGrade(fx, { saturation, brightness, contrast, tint }) {
  fx.reset();
  fx.saturate(saturation);
  fx.contrast(contrast, true);
  fx.brightness(brightness, true);
  fx.multiply([
    tint[0], 0, 0, 0, 0,
    0, tint[1], 0, 0, 0,
    0, 0, tint[2], 0, 0,
    0, 0, 0, 1, 0,
  ], true);
}

// Bake a colour grade into a new canvas texture (same maths as the
// ColorMatrix path). Needed wherever the camera zooms: Phaser 3.90's preFX
// misplaces the object under camera zoom. Returns the new texture key.
export function bakeGrade(scene, srcKey, outKey, grade = {}) {
  const {
    saturation = -0.7, brightness = 0.62, contrast = 0.18, tint = [1, 1, 1],
  } = grade;
  if (scene.textures.exists(outKey)) scene.textures.remove(outKey);
  const src = scene.textures.get(srcKey).getSourceImage();
  const tex = scene.textures.createCanvas(outKey, src.width, src.height);
  const ctx = tex.getContext();
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, src.width, src.height);
  const d = img.data;
  const sx = (saturation * 2) / 3 + 1;
  const sy = (sx - 1) * -0.5;
  const cv = contrast + 1;
  const co = -0.5 * (cv - 1);
  const kr = brightness * tint[0] * 255;
  const kg = brightness * tint[1] * 255;
  const kb = brightness * tint[2] * 255;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255;
    const g = d[i + 1] / 255;
    const b = d[i + 2] / 255;
    const r1 = (sx * r + sy * g + sy * b) * cv + co;
    const g1 = (sy * r + sx * g + sy * b) * cv + co;
    const b1 = (sy * r + sy * g + sx * b) * cv + co;
    d[i] = Math.max(0, Math.min(255, r1 * kr));
    d[i + 1] = Math.max(0, Math.min(255, g1 * kg));
    d[i + 2] = Math.max(0, Math.min(255, b1 * kb));
  }
  ctx.putImageData(img, 0, 0);
  tex.refresh();
  return outKey;
}

// Screen-space vignette as a texture overlay. Use this instead of camera
// postFX in scenes whose camera zooms.
export function addVignetteOverlay(scene, alpha = 0.85) {
  if (!scene.textures.exists('fx_vignette')) return null;
  return scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'fx_vignette')
    .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setScrollFactor(0).setDepth(899).setAlpha(alpha);
}

// Full-bleed graded arena backdrop with a slow push-in, letterbox fade and
// optional ember drift. `setArena` crossfades to another arena.
export class Backdrop {
  constructor(scene, arenaId, opts = {}) {
    this.scene = scene;
    this.opts = opts;
    this.grade = opts.grade || {};
    this.current = this.#makeImage(arenaId);
    this.current.setAlpha(1);
    this.arenaId = arenaId;

    // Floor-to-ceiling darkening so typography always reads.
    const shade = scene.add.graphics().setDepth(-5);
    shade.fillGradientStyle(PALETTE.ink, PALETTE.ink, PALETTE.ink, PALETTE.ink, 0.85, 0.85, 0, 0);
    shade.fillRect(0, 0, GAME_WIDTH, 220);
    shade.fillGradientStyle(PALETTE.ink, PALETTE.ink, PALETTE.ink, PALETTE.ink, 0, 0, 0.95, 0.95);
    shade.fillRect(0, GAME_HEIGHT - 300, GAME_WIDTH, 300);
    this.shade = shade;

    if (opts.embers !== false) {
      this.embers = addEmbers(scene, opts.emberColor ?? PALETTE.crimsonBright, -4);
    }
    addGrain(scene);
    addVignetteOverlay(scene, opts.vignette ?? 0.85);
  }

  #makeImage(arenaId) {
    const key = `arena_${arenaId}`;
    const img = this.scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, key).setDepth(-10);
    const scale = Math.max(GAME_WIDTH / img.width, GAME_HEIGHT / img.height) * 1.08;
    img.setScale(scale);
    img.setAlpha(0);
    gradeImage(this.scene, img, this.grade);
    // Slow push-in keeps static screens alive.
    this.scene.tweens.add({
      targets: img,
      scale: scale * 1.06,
      x: GAME_WIDTH / 2 + Phaser.Math.Between(-30, 30),
      duration: 18000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    return img;
  }

  setArena(arenaId) {
    if (arenaId === this.arenaId) return;
    this.arenaId = arenaId;
    const prev = this.current;
    const next = this.#makeImage(arenaId);
    this.current = next;
    this.scene.tweens.add({ targets: next, alpha: 1, duration: 450, ease: 'Quad.easeOut' });
    this.scene.tweens.add({
      targets: prev,
      alpha: 0,
      duration: 450,
      onComplete: () => prev.destroy(),
    });
  }
}

export function addEmbers(scene, color = PALETTE.crimsonBright, depth = 2) {
  if (!scene.textures.exists('fx_soft')) return null;
  return scene.add.particles(0, 0, 'fx_soft', {
    x: { min: 0, max: GAME_WIDTH },
    y: GAME_HEIGHT + 20,
    lifespan: { min: 5000, max: 9000 },
    speedY: { min: -70, max: -25 },
    speedX: { min: -15, max: 25 },
    scale: { start: 0.14, end: 0 },
    alpha: { start: 0.9, end: 0 },
    tint: [color, PALETTE.gold, 0xff7a3c],
    frequency: 140,
    blendMode: 'ADD',
  }).setDepth(depth);
}

// Animated film grain. Cheap: a single tile sprite whose offset jumps
// every frame.
export function addGrain(scene, alpha = 0.07) {
  if (!scene.textures.exists('fx_grain')) return null;
  const grain = scene.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'fx_grain')
    .setAlpha(alpha)
    .setDepth(900)
    .setScrollFactor(0)
    .setBlendMode(Phaser.BlendModes.SCREEN);
  const jitter = () => {
    grain.tilePositionX = Math.random() * 256;
    grain.tilePositionY = Math.random() * 256;
  };
  scene.events.on('update', jitter);
  scene.events.once('shutdown', () => scene.events.off('update', jitter));
  return grain;
}

// A thin horizontal rule with a diamond centre — the recurring ornament.
export function drawRule(graphics, cx, y, halfWidth, color = PALETTE.gold, alpha = 0.8) {
  graphics.lineStyle(1, color, alpha);
  graphics.lineBetween(cx - halfWidth, y, cx - 10, y);
  graphics.lineBetween(cx + 10, y, cx + halfWidth, y);
  graphics.fillStyle(color, alpha);
  graphics.fillPoints([
    { x: cx, y: y - 5 }, { x: cx + 5, y }, { x: cx, y: y + 5 }, { x: cx - 5, y },
  ], true);
}

// Fade-to-black with a crimson slash, then start the next scene.
export function transitionTo(scene, key, data) {
  if (scene._transitioning) return;
  scene._transitioning = true;
  scene.input.enabled = false;

  const slash = scene.add.graphics().setDepth(1000).setScrollFactor(0);
  const progress = { t: 0 };
  scene.tweens.add({
    targets: progress,
    t: 1,
    duration: 260,
    ease: 'Cubic.easeIn',
    onUpdate: () => {
      const t = progress.t;
      slash.clear();
      slash.fillStyle(PALETTE.crimsonBright, 1);
      const x0 = -200 + t * (GAME_WIDTH + 400);
      slash.fillPoints([
        { x: x0 - 260, y: GAME_HEIGHT + 20 },
        { x: x0 + 140, y: -20 },
        { x: x0 + 146, y: -20 },
        { x: x0 - 252, y: GAME_HEIGHT + 20 },
      ], true);
    },
  });
  scene.cameras.main.fadeOut(300, 10, 9, 8);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(key, data);
  });
}

export function fadeIn(scene, duration = 350) {
  scene._transitioning = false;
  scene.input.enabled = true;
  scene.cameras.main.fadeIn(duration, 10, 9, 8);
}

// Text button: bone-on-ink with a crimson blade that sweeps under it on
// hover/focus. Returns a controller with setFocused for keyboard menus.
export function createTextButton(scene, x, y, label, onSelect, opts = {}) {
  const size = opts.size || 26;
  const width = opts.width || 300;
  const container = scene.add.container(x, y).setDepth(opts.depth ?? 20);

  const blade = scene.add.graphics();
  const text = scene.add.text(0, 0, label, displayText(size, {
    color: opts.color || HEX.bone, weight: opts.weight || '700', spacing: opts.spacing,
  })).setOrigin(0.5);
  const hit = scene.add.rectangle(0, 0, width, size + 26, 0x000000, 0.001)
    .setInteractive({ useHandCursor: true });
  container.add([blade, text, hit]);

  const state = { focused: false, sweep: 0 };
  const redraw = () => {
    blade.clear();
    if (state.sweep <= 0.001) return;
    const w = (width * 0.5) * state.sweep;
    const h = size + 14;
    blade.fillStyle(PALETTE.crimson, 0.88 * state.sweep);
    blade.fillPoints([
      { x: -w - 14, y: h / 2 }, { x: -w, y: -h / 2 }, { x: w + 14, y: -h / 2 }, { x: w, y: h / 2 },
    ], true);
    blade.lineStyle(1, PALETTE.gold, 0.9 * state.sweep);
    blade.lineBetween(-w - 30, h / 2 + 6, w + 30, h / 2 + 6);
  };

  const setFocused = (focused, silent = false) => {
    if (state.focused === focused) return;
    state.focused = focused;
    if (focused && !silent) SoundManager.playUIHover(scene);
    scene.tweens.killTweensOf(state);
    scene.tweens.add({
      targets: state,
      sweep: focused ? 1 : 0,
      duration: focused ? 180 : 140,
      ease: focused ? 'Cubic.easeOut' : 'Quad.easeIn',
      onUpdate: redraw,
    });
    scene.tweens.add({
      targets: text,
      scale: focused ? 1.06 : 1,
      duration: 160,
      ease: 'Quad.easeOut',
    });
    text.setColor(focused ? HEX.bone : (opts.color || HEX.bone));
  };

  const button = { container, text, hit, setFocused, select: onSelect, sticky: false };
  hit.on('pointerover', () => { if (!button.sticky) setFocused(true); });
  hit.on('pointerout', () => { if (!button.sticky) setFocused(false); });
  hit.on('pointerdown', () => {
    SoundManager.playUIClick(scene);
    onSelect();
  });

  return button;
}

// Keyboard navigation for a vertical or horizontal list of buttons.
export function bindMenuKeys(scene, buttons, opts = {}) {
  let index = opts.initial ?? 0;
  const focus = (i, silent) => {
    index = (i + buttons.length) % buttons.length;
    buttons.forEach((b, j) => b.setFocused(j === index, silent || j !== index));
  };
  buttons.forEach((b, i) => {
    b.sticky = true;
    b.hit.on('pointerover', () => { if (index !== i) focus(i); });
  });
  const prevKeys = opts.horizontal ? ['LEFT', 'A'] : ['UP', 'W'];
  const nextKeys = opts.horizontal ? ['RIGHT', 'D'] : ['DOWN', 'S'];
  prevKeys.forEach(k => scene.input.keyboard.on(`keydown-${k}`, () => focus(index - 1)));
  nextKeys.forEach(k => scene.input.keyboard.on(`keydown-${k}`, () => focus(index + 1)));
  ['ENTER', 'SPACE'].forEach(k => scene.input.keyboard.on(`keydown-${k}`, () => {
    SoundManager.playUIClick(scene);
    buttons[index].select();
  }));
  focus(index, true);
  return { focus, get index() { return index; } };
}

export function addKeyHint(scene, text, y = GAME_HEIGHT - 34) {
  return scene.add.text(GAME_WIDTH / 2, y, text, displayText(12, {
    color: HEX.ash, weight: '500', spacing: 4, shadow: false,
  })).setOrigin(0.5).setDepth(50);
}

export function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

// Screen header: small gold kicker over a tracked display title and rule.
export function addHeader(scene, kicker, title, y = 78) {
  const cx = GAME_WIDTH / 2;
  const k = scene.add.text(cx, y - 38, kicker, displayText(13, {
    color: HEX.gold, weight: '700', spacing: 8, shadow: false,
  })).setOrigin(0.5).setDepth(40);
  const t = scene.add.text(cx, y, title, displayText(40, { weight: '900', spacing: 12 }))
    .setOrigin(0.5).setDepth(40);
  const rule = scene.add.graphics().setDepth(40);
  drawRule(rule, cx, y + 36, 220);
  [k, t, rule].forEach((o, i) => {
    o.setAlpha(0);
    scene.tweens.add({ targets: o, alpha: 1, duration: 450, delay: 80 + i * 70 });
  });
  scene.tweens.add({ targets: t, y: { from: y + 10, to: y }, duration: 500, ease: 'Cubic.easeOut' });
  return { kicker: k, title: t, rule };
}

// Skewed panel path (parallelogram) centred on 0,0.
export function skewPoints(w, h, skew = 24) {
  return [
    { x: -w / 2 + skew, y: -h / 2 },
    { x: w / 2 + skew, y: -h / 2 },
    { x: w / 2 - skew, y: h / 2 },
    { x: -w / 2 - skew, y: h / 2 },
  ];
}
