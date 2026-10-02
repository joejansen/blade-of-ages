import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { getWarriorById } from '../config/warriors.js';
import {
  PALETTE, HEX, PLAYER_COLORS, PLAYER_HEX, displayText, bodyText, gradeImage,
  addGrain, addVignetteOverlay, transitionTo, fadeIn,
} from '../ui/theme.js';
import { Showcase } from '../ui/Showcase.js';
import { ARENAS } from './ArenaSelectScene.js';

const HOLD_MS = 2600;
// The seam leans: top meets at SEAM_TOP, bottom at SEAM_BOTTOM.
const SEAM_TOP = GAME_WIDTH / 2 + 70;
const SEAM_BOTTOM = GAME_WIDTH / 2 - 70;

// Pre-fight beat: both warriors, their names, the ground they'll fight on.
export class VersusScene extends Phaser.Scene {
  constructor() {
    super('Versus');
  }

  init(data) {
    this.matchData = data;
  }

  create() {
    fadeIn(this, 200);
    const w = [getWarriorById(this.matchData.warrior1), getWarriorById(this.matchData.warrior2)];
    const arena = ARENAS.find(a => a.id === this.matchData.arena);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, PALETTE.ink);

    const halves = [
      [{ x: 0, y: 0 }, { x: SEAM_TOP, y: 0 }, { x: SEAM_BOTTOM, y: GAME_HEIGHT }, { x: 0, y: GAME_HEIGHT }],
      [{ x: SEAM_TOP, y: 0 }, { x: GAME_WIDTH, y: 0 }, { x: GAME_WIDTH, y: GAME_HEIGHT }, { x: SEAM_BOTTOM, y: GAME_HEIGHT }],
    ];

    [0, 1].forEach((p) => {
      const side = p === 0 ? -1 : 1;
      const color = Phaser.Display.Color.IntegerToColor(PLAYER_COLORS[p]);
      const tint = [color.red / 255 * 1.1, color.green / 255 * 1.1, color.blue / 255 * 1.1];

      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, `arena_${w[p].arena}`).setDepth(1);
      bg.setScale(1.15);
      gradeImage(this, bg, { saturation: -1, brightness: 0.5, contrast: 0.3, tint });
      const maskShape = this.make.graphics({ add: false });
      maskShape.fillStyle(0xffffff);
      maskShape.fillPoints(halves[p], true);
      bg.setMask(maskShape.createGeometryMask());
      this.tweens.add({ targets: bg, x: { from: GAME_WIDTH / 2 + side * 220, to: GAME_WIDTH / 2 + side * 40 }, duration: HOLD_MS + 600, ease: 'Cubic.easeOut' });

      const x = p === 0 ? 330 : GAME_WIDTH - 330;
      const pool = this.add.image(x, GAME_HEIGHT - 44, 'fx_soft').setDepth(4)
        .setScale(9, 2).setTint(PLAYER_COLORS[p]).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
      const sc = new Showcase(this, w[p], x + side * 320, GAME_HEIGHT - 44, {
        scale: 3.5, facingRight: p === 0, depth: 12 + p, flourish: false,
      });
      this.tweens.add({ targets: sc, x, duration: 520, delay: 80, ease: 'Expo.easeOut' });
      this.time.delayedCall(700 + p * 140, () => sc.play('heavyAttack', 500));
      pool.setAlpha(0);
      this.tweens.add({ targets: pool, alpha: 0.35, duration: 600, delay: 200 });

      // Name plate.
      const nameX = p === 0 ? 70 : GAME_WIDTH - 70;
      const align = p === 0 ? 0 : 1;
      const kicker = this.add.text(nameX, 64, p === 0 ? 'PLAYER ONE' : (this.matchData.mode === '1p' ? 'OPPONENT' : 'PLAYER TWO'), displayText(13, {
        color: PLAYER_HEX[p], weight: '700', spacing: 8,
      })).setOrigin(align, 0).setDepth(40);
      const name = this.add.text(nameX, 84, w[p].name.toUpperCase(), displayText(46, {
        weight: '900', spacing: 8, shadowBlur: 16,
      })).setOrigin(align, 0).setDepth(40);
      const era = this.add.text(nameX, 140, `${w[p].era}  ·  ${w[p].weapon}`, bodyText(20, {
        italic: true, color: HEX.bone,
      })).setOrigin(align, 0).setDepth(40);
      [kicker, name, era].forEach((o, i) => {
        o.setAlpha(0);
        this.tweens.add({
          targets: o, alpha: 1, x: { from: nameX - side * 60, to: nameX }, duration: 420, delay: 260 + i * 70, ease: 'Cubic.easeOut',
        });
      });
    });

    // The seam: a crimson cut between the two halves.
    const seam = this.add.graphics().setDepth(30);
    const seamState = { t: 0 };
    this.tweens.add({
      targets: seamState,
      t: 1,
      duration: 320,
      delay: 150,
      ease: 'Expo.easeOut',
      onUpdate: () => {
        seam.clear();
        const t = seamState.t;
        const yEnd = GAME_HEIGHT * t;
        const xEnd = SEAM_TOP + (SEAM_BOTTOM - SEAM_TOP) * t;
        seam.lineStyle(10, PALETTE.crimson, 0.6);
        seam.lineBetween(SEAM_TOP, 0, xEnd, yEnd);
        seam.lineStyle(3, PALETTE.crimsonBright, 1);
        seam.lineBetween(SEAM_TOP, 0, xEnd, yEnd);
        seam.lineStyle(1, 0xffffff, 0.9);
        seam.lineBetween(SEAM_TOP, 0, xEnd, yEnd);
      },
    });

    // VS slam.
    const vs = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, 'VS', displayText(150, {
      weight: '900', spacing: 4, color: HEX.bone, stroke: '#0a0908', strokeThickness: 10, shadowBlur: 30,
    })).setOrigin(0.5).setDepth(50).setAlpha(0).setScale(3);
    const vsGlow = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'fx_soft').setDepth(49)
      .setTint(PALETTE.crimsonBright).setBlendMode(Phaser.BlendModes.ADD).setScale(9).setAlpha(0);
    this.tweens.add({
      targets: vs,
      alpha: 1,
      scale: 1,
      duration: 260,
      delay: 480,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        SoundManager.playCombat(this, 'heavy_attack');
        this.cameras.main.shake(220, 0.012);
        this.cameras.main.flash(120, 224, 40, 63);
        vsGlow.setAlpha(0.7);
        this.tweens.add({ targets: vsGlow, alpha: 0.25, scale: 6, duration: 600 });
        const ring = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'fx_ring').setDepth(48)
          .setBlendMode(Phaser.BlendModes.ADD).setTint(PALETTE.crimsonBright).setScale(0.8);
        this.tweens.add({ targets: ring, scale: 7, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
      },
    });

    // Where.
    const where = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 52, (arena?.name || '').toUpperCase(), displayText(16, {
      color: HEX.gold, weight: '700', spacing: 10,
    })).setOrigin(0.5).setDepth(50).setAlpha(0);
    const whereKicker = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 76, 'THE FIELD', displayText(10, {
      color: HEX.ash, weight: '700', spacing: 6,
    })).setOrigin(0.5).setDepth(50).setAlpha(0);
    this.tweens.add({ targets: [where, whereKicker], alpha: 1, duration: 500, delay: 900 });

    addGrain(this);
    addVignetteOverlay(this, 0.8);

    const go = () => transitionTo(this, 'Fight', this.matchData);
    this.time.delayedCall(HOLD_MS, go);
    this.time.delayedCall(700, () => {
      this.input.keyboard.once('keydown', go);
      this.input.once('pointerdown', go);
    });
  }
}
