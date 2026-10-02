import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { WARRIORS } from '../config/warriors.js';
import {
  PALETTE, HEX, displayText, bodyText, Backdrop, drawRule,
  createTextButton, bindMenuKeys, transitionTo, fadeIn, addKeyHint,
} from '../ui/theme.js';
import { Showcase } from '../ui/Showcase.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    fadeIn(this, 600);
    const cx = GAME_WIDTH / 2;

    new Backdrop(this, 'castle', {
      grade: { saturation: -0.85, brightness: 0.5, contrast: 0.25, tint: [1.0, 0.92, 0.88] },
    });

    // Two warriors from different ages squaring off across the title.
    const [left, right] = Phaser.Utils.Array.Shuffle([...WARRIORS]).slice(0, 2);
    const groundY = GAME_HEIGHT - 60;
    this.addRimLight(250, groundY, PALETTE.p1);
    this.addRimLight(GAME_WIDTH - 250, groundY, PALETTE.p2);
    new Showcase(this, left, 250, groundY, { scale: 3.5, facingRight: true });
    new Showcase(this, right, GAME_WIDTH - 250, groundY, { scale: 3.5, facingRight: false });

    // Title lockup.
    const blade = this.add.text(cx, 200, 'BLADE', displayText(132, {
      weight: '900', spacing: 34, shadowBlur: 24,
    })).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(1.12);

    const ofAges = this.add.text(cx, 292, 'OF  AGES', displayText(30, {
      weight: '700', spacing: 22, color: HEX.gold,
    })).setOrigin(0.5).setDepth(30).setAlpha(0);

    const rule = this.add.graphics().setDepth(30).setAlpha(0);
    drawRule(rule, cx, 334, 170);

    const tagline = this.add.text(cx, 362, 'Warriors across time. One battlefield.', bodyText(21, {
      italic: true, color: HEX.ash,
    })).setOrigin(0.5).setDepth(30).setAlpha(0);

    // The cut: a crimson slash rips across the lockup, then the title lands.
    const slash = this.add.graphics().setDepth(31).setBlendMode(Phaser.BlendModes.ADD);
    const cut = { t: 0 };
    this.tweens.add({
      targets: cut,
      t: 1,
      delay: 250,
      duration: 340,
      ease: 'Expo.easeOut',
      onUpdate: () => {
        slash.clear();
        const x0 = cx - 420;
        const x1 = x0 + 840 * cut.t;
        slash.fillStyle(PALETTE.crimsonBright, 0.95);
        slash.fillTriangle(x0, 236, x1, 168 + 4, x1, 168 - 2);
        slash.fillStyle(0xffffff, 0.9);
        slash.fillTriangle(x0 + 40, 230, x1, 170, x1, 168);
      },
      onComplete: () => {
        this.cameras.main.flash(180, 224, 40, 63);
        this.cameras.main.shake(160, 0.006);
        this.tweens.add({ targets: slash, alpha: 0, duration: 900, ease: 'Quad.easeIn' });
        this.tweens.add({ targets: blade, alpha: 1, scale: 1, duration: 420, ease: 'Expo.easeOut' });
        this.tweens.add({ targets: [ofAges, rule], alpha: 1, duration: 600, delay: 120 });
        this.tweens.add({ targets: tagline, alpha: 1, duration: 800, delay: 300 });
      },
    });

    // Slow breathing glow behind the title.
    const halo = this.add.image(cx, 230, 'fx_soft').setDepth(29).setScale(14, 5)
      .setTint(PALETTE.crimson).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: halo, alpha: 0.22, duration: 1200, delay: 600 });
    this.tweens.add({
      targets: halo, scaleX: 15.5, duration: 3200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    const buttons = [
      createTextButton(this, cx, 470, 'ENTER BATTLE', () => transitionTo(this, 'ModeSelect'), {
        size: 28, width: 360,
      }),
      createTextButton(this, cx, 536, 'HOW TO PLAY', () => transitionTo(this, 'Instructions'), {
        size: 20, width: 300, color: HEX.ash,
      }),
    ];
    buttons.forEach((b, i) => {
      b.container.setAlpha(0);
      this.tweens.add({ targets: b.container, alpha: 1, duration: 500, delay: 900 + i * 120 });
    });
    bindMenuKeys(this, buttons);

    addKeyHint(this, '↑ ↓  CHOOSE     ENTER  CONFIRM');
    this.add.text(GAME_WIDTH - 28, GAME_HEIGHT - 24, 'v2.0', displayText(10, {
      color: HEX.ashDark, weight: '500', spacing: 2, shadow: false,
    })).setOrigin(1, 1).setDepth(50);
  }

  // A coloured pool of light at a fighter's feet: separates the figure from
  // the graded backdrop and tags the side.
  addRimLight(x, groundY, color) {
    const pool = this.add.image(x, groundY, 'fx_soft').setDepth(5)
      .setScale(7, 1.6).setTint(color).setAlpha(0.28).setBlendMode(Phaser.BlendModes.ADD);
    const glow = this.add.image(x, groundY - 170, 'fx_soft').setDepth(4)
      .setScale(6, 9).setTint(color).setAlpha(0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: [pool, glow], alpha: '*=0.7', duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }
}
