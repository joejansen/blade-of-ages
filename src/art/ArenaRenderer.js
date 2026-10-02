import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../config/constants.js';
import { drawArena } from './arenas.js';
import { bakeGrade } from '../ui/theme.js';

// Per-arena mood. The painted backgrounds are saturated; grading them down
// lets the full-colour fighters own the frame, while a small set of living
// elements (particles, fog, light) carry each place's character.
//   grade     — colour matrix applied to the backdrop
//   light     — colour of the floor light pool under the fighters
//   fog       — colour of low drifting fog bands (null = none)
//   shafts    — colour of light shafts from above (null = none)
//   back/fore — particle layers behind / in front of the fighters
//   lightning — occasional sky flash
const MOODS = {
  castle: {
    grade: { saturation: -0.55, brightness: 0.6, contrast: 0.22, tint: [0.92, 0.96, 1.1] },
    light: 0xffa65a,
    fog: 0x6f86a8,
    shafts: null,
    back: [{ type: 'embers', color: 0xff8a3c }, { type: 'ash', color: 0x9a9a9a }],
    fore: [{ type: 'embers', color: 0xffb070, big: true }],
  },
  dojo: {
    grade: { saturation: -0.78, brightness: 0.66, contrast: 0.2, tint: [1.06, 0.98, 0.98] },
    light: 0xffe2c4,
    fog: null,
    shafts: 0xfff0dc,
    back: [{ type: 'petals', color: 0xffa9c4 }],
    fore: [{ type: 'petals', color: 0xffc2d4, big: true }],
  },
  longship: {
    grade: { saturation: -0.65, brightness: 0.52, contrast: 0.25, tint: [0.86, 0.98, 1.12] },
    light: 0x9fc6e8,
    fog: 0x8fa6b8,
    shafts: null,
    back: [{ type: 'rain', color: 0xbcd6ea }],
    fore: [{ type: 'rain', color: 0xd8e8f5, big: true }, { type: 'spray', color: 0xe0f0ff }],
    lightning: true,
  },
  colosseum: {
    grade: { saturation: -0.5, brightness: 0.7, contrast: 0.18, tint: [1.12, 1.0, 0.86] },
    light: 0xffd79a,
    fog: 0xd9b98a,
    shafts: 0xffe4b0,
    back: [{ type: 'motes', color: 0xffd08a }],
    fore: [{ type: 'dust', color: 0xd9b98a }],
  },
  steppe: {
    grade: { saturation: -0.55, brightness: 0.7, contrast: 0.18, tint: [1.06, 1.02, 0.9] },
    light: 0xfff0c8,
    fog: 0xd8d0b0,
    shafts: null,
    back: [{ type: 'wind', color: 0xf3ead0 }, { type: 'seeds', color: 0xe8dcb0 }],
    fore: [{ type: 'wind', color: 0xffffff, big: true }],
  },
  thermopylae: {
    grade: { saturation: -0.5, brightness: 0.58, contrast: 0.26, tint: [1.16, 0.92, 0.8] },
    light: 0xff9a50,
    fog: 0xb07a50,
    shafts: null,
    back: [{ type: 'embers', color: 0xff7a30 }, { type: 'ash', color: 0x8a8078 }],
    fore: [{ type: 'ash', color: 0xa09890, big: true }],
  },
  dock: {
    grade: { saturation: -0.6, brightness: 0.54, contrast: 0.22, tint: [0.86, 0.95, 1.1] },
    light: 0xffbe6a,
    fog: 0x7d93a8,
    shafts: null,
    back: [{ type: 'fireflies', color: 0xffc070 }],
    fore: [{ type: 'rain', color: 0xc8dcea }],
  },
  savanna: {
    grade: { saturation: -0.42, brightness: 0.72, contrast: 0.2, tint: [1.16, 0.98, 0.82] },
    light: 0xffc070,
    fog: 0xe0a868,
    shafts: 0xffd8a0,
    back: [{ type: 'motes', color: 0xffc88a }],
    fore: [{ type: 'dust', color: 0xd8a870 }],
  },
  temple: {
    grade: { saturation: -0.55, brightness: 0.58, contrast: 0.22, tint: [0.92, 1.06, 0.95] },
    light: 0xd8ffb0,
    fog: 0x9ec8a0,
    shafts: 0xe8ffd0,
    back: [{ type: 'fireflies', color: 0xd4ff8a }, { type: 'leaves', color: 0x7fc860 }],
    fore: [{ type: 'leaves', color: 0x6fb850, big: true }],
  },
  carrier: {
    grade: { saturation: -0.68, brightness: 0.58, contrast: 0.24, tint: [0.9, 0.97, 1.08] },
    light: 0xd8e8ff,
    fog: 0x9aaabb,
    shafts: null,
    back: [{ type: 'wind', color: 0xe0ecf8 }],
    fore: [{ type: 'spray', color: 0xe8f4ff }, { type: 'wind', color: 0xffffff, big: true }],
  },
};

const DEFAULT_MOOD = MOODS.castle;

export class ArenaRenderer {
  constructor(scene, arenaId) {
    this.scene = scene;
    this.arenaId = arenaId;
    this.mood = MOODS[arenaId] || DEFAULT_MOOD;
    this.displayObjects = [];

    const textureKey = `arena_${arenaId}`;
    const hasTexture = scene.textures.exists(textureKey) && scene.textures.get(textureKey).key !== '__MISSING';
    if (hasTexture) {
      // Graded plate, plus a drained monochrome plate above it at alpha 0
      // that fades in for the KO beat.
      const g = this.mood.grade;
      this.bakedKeys = [
        bakeGrade(scene, textureKey, `${textureKey}__fight`, g),
        bakeGrade(scene, textureKey, `${textureKey}__drain`, {
          saturation: -1, brightness: g.brightness * 0.75, contrast: g.contrast + 0.2, tint: [1, 1, 1],
        }),
      ];
      const background = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.bakedKeys[0])
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(0);
      this.drainPlate = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.bakedKeys[1])
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(0.5).setAlpha(0);
      this.background = background;
      this.displayObjects.push(background, this.drainPlate);
    } else {
      this.displayObjects.push(drawArena(scene, arenaId, { includeFloor: false }));
    }

    this.createShafts();
    this.createFog();
    this.createFloor();
    this.mood.back.forEach(p => this.createParticles(p, false));
    this.mood.fore.forEach(p => this.createParticles(p, true));

    // Special-move dim sits between the arena and the fighters.
    this.dim = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 2, GAME_HEIGHT * 2, 0x050404, 1)
      .setDepth(8).setAlpha(0).setScrollFactor(0);
    this.displayObjects.push(this.dim);

    if (this.mood.lightning) {
      this.flashRect = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 2, GAME_HEIGHT * 2, 0xdfe9ff, 1)
        .setDepth(7).setAlpha(0).setScrollFactor(0).setBlendMode(Phaser.BlendModes.ADD);
      this.displayObjects.push(this.flashRect);
      this.nextLightning = 3000 + Math.random() * 4000;
    }
  }

  createShafts() {
    if (!this.mood.shafts) return;
    const color = this.mood.shafts;
    this.shafts = [];
    for (let i = 0; i < 3; i++) {
      const x = 260 + i * 380 + Phaser.Math.Between(-60, 60);
      const shaft = this.scene.add.image(x, 220, 'fx_soft')
        .setDepth(1).setTint(color).setBlendMode(Phaser.BlendModes.ADD)
        .setScale(2.2, 13).setRotation(-0.32).setAlpha(0.1);
      this.scene.tweens.add({
        targets: shaft,
        alpha: { from: 0.05, to: 0.16 },
        duration: 3200 + i * 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.shafts.push(shaft);
      this.displayObjects.push(shaft);
    }
  }

  createFog() {
    if (!this.mood.fog) return;
    this.fogBands = [];
    for (let i = 0; i < 5; i++) {
      const band = this.scene.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        GROUND_Y - 30 + i * 14,
        'fx_fog',
      ).setDepth(i < 3 ? 2 : 24).setTint(this.mood.fog).setScale(4.5, 2.2)
        .setAlpha(i < 3 ? 0.28 : 0.14);
      band.driftSpeed = (i % 2 === 0 ? 1 : -1) * (8 + i * 4);
      this.fogBands.push(band);
      this.displayObjects.push(band);
    }
  }

  createFloor() {
    const floor = this.scene.add.graphics().setDepth(6);
    // Sink the floor into darkness and lift the HUD band.
    floor.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.62, 0.62);
    floor.fillRect(0, GROUND_Y - 40, GAME_WIDTH, GAME_HEIGHT - GROUND_Y + 40);
    floor.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.55, 0.55, 0, 0);
    floor.fillRect(0, 0, GAME_WIDTH, 170);
    this.displayObjects.push(floor);

    this.lightPool = this.scene.add.image(GAME_WIDTH / 2, GROUND_Y + 12, 'fx_soft')
      .setDepth(5).setTint(this.mood.light).setBlendMode(Phaser.BlendModes.ADD)
      .setScale(16, 2.4).setAlpha(0.22);
    this.lightHalo = this.scene.add.image(GAME_WIDTH / 2, GROUND_Y - 120, 'fx_soft')
      .setDepth(5).setTint(this.mood.light).setBlendMode(Phaser.BlendModes.ADD)
      .setScale(14, 8).setAlpha(0.07);
    this.displayObjects.push(this.lightPool, this.lightHalo);
  }

  createParticles({ type, color, big }, foreground) {
    const preset = PARTICLES[type];
    if (!preset) return;
    const config = preset(color, big);
    const emitter = this.scene.add.particles(0, 0, config.texture, {
      ...config.emitter,
      advance: 6000,
    });
    emitter.setDepth(foreground ? 25 : 3);
    if (foreground) emitter.setScrollFactor(1.18);
    this.displayObjects.push(emitter);
  }

  update(time, delta, focusX = GAME_WIDTH / 2) {
    const dt = delta / 1000;

    // Light follows the fight.
    this.lightPool.x += (focusX - this.lightPool.x) * Math.min(1, dt * 3);
    this.lightHalo.x = this.lightPool.x;

    if (this.fogBands) {
      for (const band of this.fogBands) {
        band.x += band.driftSpeed * dt;
        if (band.x > GAME_WIDTH + 600) band.x = -600;
        if (band.x < -600) band.x = GAME_WIDTH + 600;
      }
    }

    if (this.flashRect) {
      this.nextLightning -= delta;
      if (this.nextLightning <= 0) {
        this.nextLightning = 5000 + Math.random() * 7000;
        this.scene.tweens.chain({
          targets: this.flashRect,
          tweens: [
            { alpha: 0.32, duration: 40 },
            { alpha: 0.05, duration: 80 },
            { alpha: 0.22, duration: 40 },
            { alpha: 0, duration: 420, ease: 'Quad.easeOut' },
          ],
        });
      }
    }
  }

  // 0 = the arena's mood grade, 1 = fully drained to monochrome.
  setDrain(k) {
    this.drainPlate?.setAlpha(k);
  }

  // Darken the world for a special move or a KO beat.
  setDim(alpha, duration = 180) {
    this.scene.tweens.killTweensOf(this.dim);
    this.scene.tweens.add({ targets: this.dim, alpha, duration, ease: 'Quad.easeOut' });
  }

  destroy() {
    for (const object of this.displayObjects) {
      object?.destroy?.();
    }
    for (const key of this.bakedKeys || []) {
      if (this.scene.textures.exists(key)) this.scene.textures.remove(key);
    }
  }
}

// Particle presets. Every emitter spans the full arena and pre-warms so the
// air is already full when the round starts.
const PARTICLES = {
  embers: (color, big) => ({
    texture: 'fx_soft',
    emitter: {
      x: { min: 0, max: GAME_WIDTH },
      y: GAME_HEIGHT + 20,
      lifespan: { min: 4000, max: 8000 },
      speedY: { min: big ? -110 : -70, max: big ? -60 : -25 },
      speedX: { min: -20, max: 30 },
      scale: big ? { start: 0.3, end: 0 } : { start: 0.14, end: 0 },
      alpha: { start: big ? 0.6 : 0.95, end: 0 },
      tint: [color, 0xffd27a, 0xff5a2a],
      frequency: big ? 420 : 90,
      blendMode: 'ADD',
    },
  }),
  ash: (color, big) => ({
    texture: 'fx_drop',
    emitter: {
      x: { min: -100, max: GAME_WIDTH + 100 },
      y: -20,
      lifespan: { min: 7000, max: 11000 },
      speedY: { min: 20, max: 50 },
      speedX: { min: 5, max: 30 },
      scale: big ? { min: 0.5, max: 0.9 } : { min: 0.18, max: 0.38 },
      alpha: { min: 0.25, max: big ? 0.35 : 0.6 },
      tint: color,
      frequency: big ? 500 : 120,
    },
  }),
  petals: (color, big) => ({
    texture: 'fx_petal',
    emitter: {
      x: { min: -200, max: GAME_WIDTH },
      y: -20,
      lifespan: { min: 7000, max: 11000 },
      speedY: { min: 35, max: 70 },
      speedX: { min: 25, max: 70 },
      rotate: { start: 0, end: 540 },
      scale: big ? { min: 1.4, max: 2.2 } : { min: 0.5, max: 1 },
      alpha: { min: big ? 0.55 : 0.7, max: 0.95 },
      tint: [color, 0xffffff, 0xff8fb0],
      frequency: big ? 650 : 110,
    },
  }),
  leaves: (color, big) => ({
    texture: 'fx_petal',
    emitter: {
      x: { min: -100, max: GAME_WIDTH + 100 },
      y: -20,
      lifespan: { min: 7000, max: 11000 },
      speedY: { min: 30, max: 60 },
      speedX: { min: -30, max: 30 },
      rotate: { start: 0, end: 360 },
      scale: big ? { min: 1.6, max: 2.4 } : { min: 0.6, max: 1.1 },
      alpha: { min: 0.6, max: 0.9 },
      tint: [color, 0x4f8a3a, 0xa8d870],
      frequency: big ? 900 : 260,
    },
  }),
  rain: (color, big) => ({
    texture: 'fx_rain',
    emitter: {
      x: { min: -200, max: GAME_WIDTH + 200 },
      y: -40,
      lifespan: big ? 700 : 1000,
      speedY: { min: big ? 1100 : 750, max: big ? 1300 : 900 },
      speedX: { min: -260, max: -200 },
      rotate: 14,
      scaleY: big ? { min: 1.6, max: 2.2 } : { min: 0.7, max: 1.1 },
      scaleX: big ? 1.5 : 1,
      alpha: { min: big ? 0.25 : 0.2, max: big ? 0.4 : 0.45 },
      tint: color,
      frequency: big ? 40 : 8,
      blendMode: 'ADD',
    },
  }),
  spray: (color) => ({
    texture: 'fx_soft',
    emitter: {
      x: { min: 0, max: GAME_WIDTH },
      y: GAME_HEIGHT + 10,
      lifespan: { min: 900, max: 1600 },
      speedY: { min: -260, max: -140 },
      speedX: { min: -80, max: 20 },
      gravityY: 260,
      scale: { start: 0.2, end: 0.05 },
      alpha: { start: 0.35, end: 0 },
      tint: color,
      frequency: 70,
      blendMode: 'ADD',
    },
  }),
  motes: (color) => ({
    texture: 'fx_soft',
    emitter: {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: 80, max: GROUND_Y },
      lifespan: { min: 5000, max: 9000 },
      speedY: { min: -12, max: 6 },
      speedX: { min: 4, max: 22 },
      scale: { min: 0.05, max: 0.12 },
      alpha: { onEmit: () => 0, onUpdate: (p, k, t) => Math.sin(t * Math.PI) * 0.8 },
      tint: [color, 0xffffff],
      frequency: 90,
      blendMode: 'ADD',
    },
  }),
  fireflies: (color) => ({
    texture: 'fx_soft',
    emitter: {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: 160, max: GROUND_Y + 30 },
      lifespan: { min: 3000, max: 6000 },
      speedY: { min: -18, max: 10 },
      speedX: { min: -14, max: 14 },
      scale: { min: 0.1, max: 0.18 },
      alpha: { onEmit: () => 0, onUpdate: (p, k, t) => Math.max(0, Math.sin(t * Math.PI * 3)) * 0.95 },
      tint: color,
      frequency: 160,
      blendMode: 'ADD',
    },
  }),
  dust: (color) => ({
    texture: 'fx_soft',
    emitter: {
      x: -150,
      y: { min: GROUND_Y - 120, max: GAME_HEIGHT },
      lifespan: { min: 6000, max: 9000 },
      speedX: { min: 140, max: 260 },
      speedY: { min: -12, max: 8 },
      scale: { min: 1.2, max: 2.4 },
      alpha: { start: 0.09, end: 0 },
      tint: color,
      frequency: 260,
    },
  }),
  wind: (color, big) => ({
    texture: 'fx_streak',
    emitter: {
      x: -120,
      y: { min: 60, max: GAME_HEIGHT - 40 },
      lifespan: big ? 900 : 1500,
      speedX: { min: big ? 1500 : 900, max: big ? 1900 : 1300 },
      speedY: { min: -20, max: 20 },
      scaleX: big ? { min: 2.5, max: 4 } : { min: 1, max: 2.2 },
      scaleY: big ? 0.35 : 0.25,
      alpha: { start: big ? 0.18 : 0.22, end: 0 },
      tint: color,
      frequency: big ? 420 : 140,
      blendMode: 'ADD',
    },
  }),
  seeds: (color) => ({
    texture: 'fx_drop',
    emitter: {
      x: -40,
      y: { min: 200, max: GROUND_Y + 40 },
      lifespan: { min: 5000, max: 8000 },
      speedX: { min: 140, max: 260 },
      speedY: { min: -30, max: 20 },
      scale: { min: 0.15, max: 0.3 },
      alpha: { min: 0.4, max: 0.8 },
      tint: color,
      frequency: 140,
    },
  }),
};
