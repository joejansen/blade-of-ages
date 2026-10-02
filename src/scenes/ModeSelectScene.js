import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { WARRIORS } from '../config/warriors.js';
import {
  PALETTE, HEX, displayText, bodyText, Backdrop, addHeader, skewPoints,
  transitionTo, fadeIn, addKeyHint,
} from '../ui/theme.js';
import { Showcase } from '../ui/Showcase.js';

const PANEL_W = 400;
const PANEL_H = 430;
const PANEL_Y = 400;

const MODES = [
  {
    id: '1p',
    numeral: 'I',
    title: 'SINGLE WARRIOR',
    body: 'Stand alone against an opponent\nwho fights in the manner of their age.',
  },
  {
    id: '2p',
    numeral: 'II',
    title: 'DUAL WARRIORS',
    body: 'Two blades, one keyboard.\nSettle it in person.',
  },
];

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super('ModeSelect');
  }

  create() {
    fadeIn(this);
    new Backdrop(this, 'longship', {
      grade: { saturation: -0.85, brightness: 0.42, contrast: 0.2, tint: [0.88, 0.95, 1.05] },
      emberColor: PALETTE.p1,
    });
    addHeader(this, 'THE FIRST CHOICE', 'CHOOSE YOUR PATH');

    const roster = Phaser.Utils.Array.Shuffle([...WARRIORS]);
    this.panels = MODES.map((mode, i) => {
      const x = GAME_WIDTH / 2 + (i === 0 ? -230 : 230);
      return this.createPanel(x, mode, i, roster);
    });

    this.index = 0;
    this.focus(0, true);

    ['LEFT', 'A'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.focus(0)));
    ['RIGHT', 'D'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.focus(1)));
    ['ENTER', 'SPACE'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.choose(this.index)));
    this.input.keyboard.on('keydown-ESC', () => transitionTo(this, 'Title'));

    addKeyHint(this, '← →  CHOOSE     ENTER  CONFIRM     ESC  BACK');
  }

  createPanel(x, mode, index, roster) {
    const container = this.add.container(x, PANEL_Y).setDepth(10);
    const frame = this.add.graphics();
    container.add(frame);

    const numeral = this.add.text(0, -96, mode.numeral, displayText(200, {
      weight: '900', color: HEX.bone, spacing: 0, shadow: false,
    })).setOrigin(0.5).setAlpha(0.06);
    container.add(numeral);

    const title = this.add.text(0, 116, mode.title, displayText(26, { weight: '900', spacing: 6 }))
      .setOrigin(0.5);
    const body = this.add.text(0, 166, mode.body, bodyText(19, { italic: true, color: HEX.ash }))
      .setOrigin(0.5);
    container.add([title, body]);

    const hit = this.add.rectangle(0, 0, PANEL_W, PANEL_H, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    container.add(hit);
    hit.on('pointerover', () => this.focus(index));
    hit.on('pointerdown', () => this.choose(index));

    // Fighters stand inside the panel: one for solo, a pair for versus.
    const groundY = PANEL_Y + 60;
    const showcases = mode.id === '1p'
      ? [new Showcase(this, roster[0], x, groundY, { scale: 2.3, depth: 12 })]
      : [
        new Showcase(this, roster[1], x - 70, groundY, { scale: 2.1, depth: 12 }),
        new Showcase(this, roster[2], x + 70, groundY, { scale: 2.1, depth: 12, facingRight: false }),
      ];

    container.setAlpha(0);
    this.tweens.add({
      targets: container, alpha: 1, duration: 500, delay: 200 + index * 120,
    });
    this.tweens.add({
      targets: container, y: { from: PANEL_Y + 30, to: PANEL_Y }, duration: 600, delay: 200 + index * 120, ease: 'Cubic.easeOut',
    });

    return { container, frame, title, body, numeral, showcases, focus: 0, mode };
  }

  drawPanel(panel) {
    const { frame, focus } = panel;
    const pts = skewPoints(PANEL_W, PANEL_H, 22);
    frame.clear();
    frame.fillStyle(PALETTE.ink, 0.72);
    frame.fillPoints(pts, true);
    // Crimson wash climbs from the base when focused.
    if (focus > 0.01) {
      const h = PANEL_H * 0.55 * focus;
      frame.fillGradientStyle(PALETTE.crimson, PALETTE.crimson, PALETTE.crimson, PALETTE.crimson, 0, 0, 0.55, 0.55);
      const skewAt = (y) => 22 * (-(y) / (PANEL_H / 2));
      const yTop = PANEL_H / 2 - h;
      frame.fillPoints([
        { x: -PANEL_W / 2 + skewAt(yTop), y: yTop },
        { x: PANEL_W / 2 + skewAt(yTop), y: yTop },
        pts[2], pts[3],
      ], true);
    }
    frame.lineStyle(1, PALETTE.gold, 0.25 + focus * 0.65);
    frame.strokePoints(pts, true);
    frame.lineStyle(3, PALETTE.crimsonBright, focus);
    frame.lineBetween(pts[3].x, pts[3].y, pts[2].x, pts[2].y);
  }

  focus(index, silent = false) {
    if (index !== this.index && !silent) SoundManager.playUIHover(this);
    this.index = index;
    this.panels.forEach((panel, i) => {
      const on = i === index;
      this.tweens.add({
        targets: panel,
        focus: on ? 1 : 0,
        duration: 220,
        ease: 'Cubic.easeOut',
        onUpdate: () => this.drawPanel(panel),
      });
      this.tweens.add({ targets: panel.container, scale: on ? 1.03 : 0.97, duration: 220, ease: 'Cubic.easeOut' });
      this.tweens.add({ targets: panel.numeral, alpha: on ? 0.12 : 0.04, duration: 220 });
      panel.title.setColor(on ? HEX.bone : HEX.ash);
      panel.showcases.forEach(s => s.renderer?.setAlpha(on ? 1 : 0.5));
    });
    this.panels.forEach(p => this.drawPanel(p));
  }

  choose(index) {
    SoundManager.playUIClick(this);
    const panel = this.panels[index];
    panel.showcases.forEach(s => s.play('heavyAttack', 500));
    this.cameras.main.shake(120, 0.004);
    this.time.delayedCall(220, () => transitionTo(this, 'CharacterSelect', { mode: panel.mode.id }));
  }
}
