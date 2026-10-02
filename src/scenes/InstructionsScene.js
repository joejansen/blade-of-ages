import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import {
  PALETTE, HEX, PLAYER_COLORS, PLAYER_HEX, displayText, bodyText, Backdrop, addHeader,
  skewPoints, transitionTo, fadeIn, addKeyHint,
} from '../ui/theme.js';

const P1_KEYS = [
  ['MOVE', ['A', 'D']],
  ['JUMP', ['W']],
  ['CROUCH', ['S']],
  ['LIGHT', ['F']],
  ['HEAVY', ['G']],
  ['BLOCK', ['H']],
  ['SPECIAL', ['R']],
];

const P2_KEYS = [
  ['MOVE', ['←', '→']],
  ['JUMP', ['↑']],
  ['CROUCH', ['↓']],
  ['LIGHT', [';']],
  ['HEAVY', ["'"]],
  ['BLOCK', ['/']],
  ['SPECIAL', ['.']],
];

const TIPS = [
  ['LIGHT', 'Quick strikes. Chain them while your foe reels.'],
  ['HEAVY', 'Slow to swing, but more than twice the damage.'],
  ['SPECIAL', 'Land blows to fill the meter. When it glows, unleash it — it cannot be blocked.'],
  ['AIR', 'Every attack works mid-jump.'],
];

export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super('Instructions');
  }

  create() {
    fadeIn(this);
    new Backdrop(this, 'colosseum', {
      grade: { saturation: -0.9, brightness: 0.36, contrast: 0.2 },
    });
    addHeader(this, 'THE WAY OF THE BLADE', 'HOW TO PLAY');

    this.createPanel(GAME_WIDTH / 2 - 330, 'PLAYER ONE', 0, P1_KEYS);
    this.createPanel(GAME_WIDTH / 2 + 330, 'PLAYER TWO', 1, P2_KEYS);

    // Tips, centre column.
    const cx = GAME_WIDTH / 2;
    TIPS.forEach(([head, body], i) => {
      const y = 186 + i * 104;
      const h = this.add.text(cx, y, head, displayText(14, { color: HEX.gold, weight: '900', spacing: 8 }))
        .setOrigin(0.5).setDepth(30);
      const b = this.add.text(cx, y + 16, body, bodyText(19, { italic: true, color: HEX.bone, wordWrap: 280, lineSpacing: 0 }))
        .setOrigin(0.5, 0).setDepth(30);
      [h, b].forEach(o => {
        o.setAlpha(0);
        this.tweens.add({ targets: o, alpha: 1, duration: 400, delay: 300 + i * 90 });
      });
    });

    this.input.keyboard.on('keydown-ESC', () => transitionTo(this, 'Title'));
    this.input.keyboard.on('keydown-ENTER', () => transitionTo(this, 'Title'));
    addKeyHint(this, 'ESC  RETURN');
  }

  createPanel(x, title, p, keys) {
    const w = 330;
    const h = 430;
    const y = 390;
    const container = this.add.container(x, y).setDepth(20);
    const frame = this.add.graphics();
    const pts = skewPoints(w, h, 14);
    frame.fillStyle(PALETTE.ink, 0.75);
    frame.fillPoints(pts, true);
    frame.lineStyle(1, PALETTE.gold, 0.35);
    frame.strokePoints(pts, true);
    frame.fillStyle(PLAYER_COLORS[p], 1);
    frame.fillRect(-w / 2 + 30, -h / 2 + 62, 60, 3);
    container.add(frame);

    container.add(this.add.text(-w / 2 + 30, -h / 2 + 30, title, displayText(18, {
      weight: '900', spacing: 6, color: PLAYER_HEX[p], align: 'left',
    })).setOrigin(0, 0.5));

    keys.forEach(([action, caps], i) => {
      const ry = -h / 2 + 104 + i * 44;
      container.add(this.add.text(-w / 2 + 30, ry, action, displayText(13, {
        color: HEX.ash, weight: '700', spacing: 4, align: 'left', shadow: false,
      })).setOrigin(0, 0.5));
      let cxRight = w / 2 - 30;
      [...caps].reverse().forEach((cap) => {
        const capW = 34;
        const g = this.add.graphics();
        g.fillStyle(PALETTE.inkLift, 1);
        g.fillRoundedRect(cxRight - capW, ry - 16, capW, 32, 4);
        g.lineStyle(1, PALETTE.bone, 0.5);
        g.strokeRoundedRect(cxRight - capW, ry - 16, capW, 32, 4);
        g.fillStyle(PALETTE.bone, 0.18);
        g.fillRect(cxRight - capW + 3, ry + 11, capW - 6, 2);
        const t = this.add.text(cxRight - capW / 2, ry - 1, cap, displayText(15, {
          weight: '900', spacing: 0, color: HEX.bone, shadow: false,
        })).setOrigin(0.5);
        container.add([g, t]);
        cxRight -= capW + 8;
      });
    });

    container.setAlpha(0);
    this.tweens.add({
      targets: container, alpha: 1, x: { from: x + (p === 0 ? -40 : 40), to: x }, duration: 500, delay: 150, ease: 'Cubic.easeOut',
    });
  }
}
