import Phaser from 'phaser';
import { bindMenuInput } from '../input/menuInput.js';
import { gamepads } from '../input/gamepads.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import {
  PALETTE, HEX, PLAYER_COLORS, PLAYER_HEX, displayText, bodyText, Backdrop, addHeader,
  skewPoints, transitionTo, fadeIn, addKeyHint,
} from '../ui/theme.js';

const P1_KEYS = [
  ['MOVE', ['A', 'D']],
  ['DASH', ['A A', 'D D']],
  ['JUMP', ['W']],
  ['CROUCH', ['S']],
  ['LIGHT', ['F']],
  ['HEAVY', ['G']],
  ['BLOCK', ['H']],
  ['SPECIAL', ['R']],
];

const P2_KEYS = [
  ['MOVE', ['←', '→']],
  ['DASH', ['← ←', '→ →']],
  ['JUMP', ['↑']],
  ['CROUCH', ['↓']],
  ['LIGHT', [';']],
  ['HEAVY', ["'"]],
  ['BLOCK', ['/']],
  ['SPECIAL', ['.']],
];

// PlayStation glyphs; Xbox pads use the same positions (A B X Y).
const PAD_KEYS = [
  ['MOVE', ['D-PAD', 'L-STICK']],
  ['DASH', ['← ←', '→ →']],
  ['JUMP', ['↑', '✕']],
  ['CROUCH', ['↓']],
  ['LIGHT', ['□']],
  ['HEAVY', ['△']],
  ['BLOCK', ['L1', 'R1', 'L2', 'R2']],
  ['SPECIAL', ['○']],
];

const TIPS = [
  ['CHAIN', 'Tap light three times: two cuts and a finisher.'],
  ['HEAVY', 'Slow, but it crushes a guard. Break it and your foe is stunned.'],
  ['PARRY', 'Raise your guard the instant a blow lands to throw the attacker off balance.'],
  ['DASH', 'Double-tap to close in. Dash back to slip a strike untouched.'],
  ['SPECIAL', 'A full meter buys an unblockable charge. Cancel a clean hit into it.'],
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

    // A player's panel shows pad buttons once they're on a controller.
    const layoutFor = p => (gamepads.lastDevice === 'gamepad' && gamepads.hasPadFor(p) ? 'pad' : 'keys');
    const panels = [null, null];
    const drawPanels = (animate) => {
      [[P1_KEYS, 'PLAYER ONE'], [P2_KEYS, 'PLAYER TWO']].forEach(([keys, title], p) => {
        const layout = layoutFor(p);
        if (panels[p]?.layout === layout) return;
        panels[p]?.container.destroy();
        const x = GAME_WIDTH / 2 + (p === 0 ? -330 : 330);
        panels[p] = { layout, container: this.createPanel(x, title, p, layout === 'pad' ? PAD_KEYS : keys, animate) };
      });
    };
    drawPanels(true);
    const off = gamepads.onChange(() => drawPanels(false));
    this.events.once('shutdown', off);

    // Tips, centre column.
    const cx = GAME_WIDTH / 2;
    TIPS.forEach(([head, body], i) => {
      const y = 176 + i * 88;
      const h = this.add.text(cx, y, head, displayText(14, { color: HEX.gold, weight: '900', spacing: 8 }))
        .setOrigin(0.5).setDepth(30);
      const b = this.add.text(cx, y + 15, body, bodyText(17, { italic: true, color: HEX.bone, wordWrap: 280, lineSpacing: 0 }))
        .setOrigin(0.5, 0).setDepth(30);
      [h, b].forEach(o => {
        o.setAlpha(0);
        this.tweens.add({ targets: o, alpha: 1, duration: 400, delay: 300 + i * 90 });
      });
    });

    const back = () => transitionTo(this, 'Title');
    bindMenuInput(this, { back, confirm: back });
    addKeyHint(this, { keys: 'ESC  RETURN', pad: '○  RETURN' });
  }

  createPanel(x, title, p, keys, animate) {
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
      const ry = -h / 2 + 100 + i * 40;
      container.add(this.add.text(-w / 2 + 30, ry, action, displayText(13, {
        color: HEX.ash, weight: '700', spacing: 4, align: 'left', shadow: false,
      })).setOrigin(0, 0.5));
      let cxRight = w / 2 - 30;
      [...caps].reverse().forEach((cap) => {
        const t = this.add.text(0, ry - 1, cap, displayText(15, {
          weight: '900', spacing: 0, color: HEX.bone, shadow: false,
        })).setOrigin(0.5);
        const capW = Math.max(34, Math.ceil(t.width) + 18);
        t.x = cxRight - capW / 2;
        const g = this.add.graphics();
        g.fillStyle(PALETTE.inkLift, 1);
        g.fillRoundedRect(cxRight - capW, ry - 16, capW, 32, 4);
        g.lineStyle(1, PALETTE.bone, 0.5);
        g.strokeRoundedRect(cxRight - capW, ry - 16, capW, 32, 4);
        g.fillStyle(PALETTE.bone, 0.18);
        g.fillRect(cxRight - capW + 3, ry + 11, capW - 6, 2);
        container.add([g, t]);
        cxRight -= capW + 8;
      });
    });

    if (animate) {
      container.setAlpha(0);
      this.tweens.add({
        targets: container, alpha: 1, x: { from: x + (p === 0 ? -40 : 40), to: x }, duration: 500, delay: 150, ease: 'Cubic.easeOut',
      });
    }
    return container;
  }
}
