import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { getFighterProfile } from '../config/fighterProfiles.js';
import { PART_TARGET_HEIGHT } from '../fighters/AssetWarriorRenderer.js';
import { PALETTE, displayText, bodyText } from '../ui/theme.js';

const WARRIORS = ['knight', 'samurai', 'viking', 'gladiator', 'mongol',
                   'spartan', 'pirate', 'zulu', 'conquistador', 'seal'];
const PARTS = ['head', 'torso', 'upper_arm', 'lower_arm',
               'upper_leg', 'lower_leg', 'weapon'];
const ARENAS = ['castle', 'dojo', 'longship', 'colosseum', 'steppe',
                'thermopylae', 'dock', 'savanna', 'temple', 'carrier'];

// Source part art is ~800px tall but drawn at 25–65px in the fight. WebGL1
// can't mipmap these non-power-of-two textures, so a direct 15:1 minify
// aliases badly. Pre-shrink each part with the browser's high-quality
// resampler to a few times its largest on-screen size (menu showcases draw
// fighters ~3.4x larger than in the fight).
const RESAMPLE_FACTOR = 4.5;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.text(cx, cy - 36, 'BLADE OF AGES', displayText(34, { weight: '900', spacing: 14 }))
      .setOrigin(0.5);
    const status = this.add.text(cx, cy + 40, 'Sharpening blades', bodyText(18, { italic: true }))
      .setOrigin(0.5);

    const barW = 420;
    const line = this.add.graphics();
    this.load.on('progress', (value) => {
      line.clear();
      line.lineStyle(1, PALETTE.ashDark, 1);
      line.lineBetween(cx - barW / 2, cy + 8, cx + barW / 2, cy + 8);
      line.lineStyle(2, PALETTE.crimsonBright, 1);
      line.lineBetween(cx - (barW / 2) * value, cy + 8, cx + (barW / 2) * value, cy + 8);
      line.fillStyle(PALETTE.bone, 1);
      line.fillCircle(cx - (barW / 2) * value, cy + 8, 2);
      line.fillCircle(cx + (barW / 2) * value, cy + 8, 2);
    });
    this.load.on('complete', () => status.setText('Ready'));

    for (const warrior of WARRIORS) {
      for (const part of PARTS) {
        this.load.image(`warrior_${warrior}_${part}`, `assets/warriors/${warrior}/${part}.png`);
      }
    }

    for (const arena of ARENAS) {
      this.load.image(`arena_${arena}`, `assets/arenas/${arena}.jpg`);
    }

    this.load.audio('light_attack', 'assets/sounds/light_attack.mp3');
    this.load.audio('heavy_attack', 'assets/sounds/heavy_attack.wav');
    this.load.audio('jump', 'assets/sounds/jump.mp3');
    this.load.audio('hit', 'assets/sounds/hit.wav');
    this.load.audio('block', 'assets/sounds/block.wav');
    this.load.audio('special', 'assets/sounds/special.mp3');
    this.load.audio('ui_click', 'assets/sounds/ui_click.mp3');
    this.load.audio('ui_hover', 'assets/sounds/ui_hover.mp3');
    this.load.audio('victory', 'assets/sounds/victory.wav');
  }

  create() {
    let missing = 0;
    for (const warrior of WARRIORS) {
      const profile = getFighterProfile(warrior);
      for (const part of PARTS) {
        const key = `warrior_${warrior}_${part}`;
        if (!this.textures.exists(key) || this.textures.get(key).key === '__MISSING') {
          missing++;
          continue;
        }
        const target = part === 'weapon'
          ? profile.trail.renderedWeaponLength * 1.1
          : PART_TARGET_HEIGHT[part];
        this.resampleTexture(key, Math.ceil(target * RESAMPLE_FACTOR));
      }
    }
    if (missing > 0) {
      console.log(`${missing} warrior sprites missing — using vector placeholders`);
    }

    this.generateFxTextures();

    // Dev-only deep link for iterating on a screen: ?scene=Fight&w1=knight…
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('scene');
      if (target) {
        this.scene.start(target, {
          mode: params.get('mode') || '1p',
          warrior1: params.get('w1') || 'samurai',
          warrior2: params.get('w2') || 'viking',
          arena: params.get('arena') || 'dojo',
        });
        return;
      }
    }
    this.scene.start('Title');
  }

  resampleTexture(key, targetHeight) {
    const source = this.textures.get(key).getSourceImage();
    if (!source || !source.height || source.height <= targetHeight * 1.2) return;

    // Halve repeatedly, then finish at the exact size; single-pass large
    // downscales lose detail even with imageSmoothingQuality = 'high'.
    let current = source;
    let w = source.width;
    let h = source.height;
    while (h / 2 >= targetHeight) {
      w = Math.round(w / 2);
      h = Math.round(h / 2);
      current = this.drawScaled(current, w, h);
    }
    const ratio = targetHeight / h;
    if (Math.abs(ratio - 1) > 0.01) {
      current = this.drawScaled(current, Math.round(w * ratio), targetHeight);
    }

    this.textures.remove(key);
    this.textures.addCanvas(key, current);
  }

  drawScaled(source, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  generateFxTextures() {
    // Soft radial glow — embers, light pools, bloom-ish halos.
    this.canvasTexture('fx_soft', 64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(255,255,255,0.65)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
    });

    // Hard-cored spark streak, horizontal; rotate to travel direction.
    this.canvasTexture('fx_streak', 64, 8, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 64, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.7, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(255,255,255,1)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(58, 1);
      ctx.quadraticCurveTo(64, 4, 58, 7);
      ctx.closePath();
      ctx.fill();
    });

    // Petal / leaf.
    this.canvasTexture('fx_petal', 16, 10, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(8, 5, 7, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rain / spray streak, vertical.
    this.canvasTexture('fx_rain', 2, 28, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 28);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(255,255,255,0.9)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 2, 28);
    });

    // Shockwave ring.
    this.canvasTexture('fx_ring', 128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 40, 64, 64, 62);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.7, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    });

    // Ink droplet for blood/ink spatter.
    this.canvasTexture('fx_drop', 12, 12, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Horizontal fog band: soft-edged in both axes.
    this.canvasTexture('fx_fog', 256, 64, (ctx) => {
      // Drawn in a 256x256 space squashed to 64 tall, so centre at 128,128.
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, 'rgba(255,255,255,0.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save();
      ctx.scale(1, 0.25);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      ctx.restore();
    });

    // Vignette: clear centre, ink edges (drawn wide; stretched to screen).
    this.canvasTexture('fx_vignette', 640, 360, (ctx) => {
      ctx.save();
      ctx.scale(1, 360 / 640);
      const g = ctx.createRadialGradient(320, 320, 180, 320, 320, 470);
      g.addColorStop(0, 'rgba(10,9,8,0)');
      g.addColorStop(0.6, 'rgba(10,9,8,0.35)');
      g.addColorStop(1, 'rgba(10,9,8,0.92)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 640);
      ctx.restore();
    });

    // Film grain tile.
    this.canvasTexture('fx_grain', 256, 256, (ctx) => {
      const img = ctx.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    });
  }

  canvasTexture(key, w, h, draw) {
    if (this.textures.exists(key)) return;
    const tex = this.textures.createCanvas(key, w, h);
    draw(tex.getContext());
    tex.refresh();
  }
}

