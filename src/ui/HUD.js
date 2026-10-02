import Phaser from 'phaser';
import {
  GAME_WIDTH,
  SPECIAL_METER_MAX,
  ROUNDS_TO_WIN,
} from '../config/constants.js';
import { PALETTE, HEX, PLAYER_COLORS, displayText } from './theme.js';

const BAR_W = 470;
const BAR_H = 18;
const BAR_Y = 30;
const BAR_SKEW = 10;
const INNER_GAP = 74; // half-gap between the bars at screen centre
const METER_W = 300;
const METER_H = 5;
const METER_SEGMENTS = 4;
const PORTRAIT = 62;
const GHOST_DELAY = 450;
const GHOST_RATE = 0.55; // fraction of max HP drained per second

// Fight HUD: bone-white health with a crimson damage ghost that drains after
// a beat, a four-segment special meter, portraits, round medallion.
export class HUD {
  constructor(scene, warrior1Config, warrior2Config) {
    this.scene = scene;
    this.configs = [warrior1Config, warrior2Config];
    this.graphics = scene.add.graphics().setDepth(50);
    this.ghost = [1, 1];
    this.ghostHold = [0, 0];
    this.lastRatio = [1, 1];
    this.shake = [0, 0];
    this.objects = [this.graphics];

    [0, 1].forEach((p) => {
      const mirrored = p === 1;
      const outerX = mirrored ? GAME_WIDTH - 44 : 44;

      // Portrait in a skewed frame.
      const frame = scene.add.graphics().setDepth(51);
      const pts = [
        { x: -PORTRAIT / 2 + 8, y: -PORTRAIT / 2 }, { x: PORTRAIT / 2 + 8, y: -PORTRAIT / 2 },
        { x: PORTRAIT / 2 - 8, y: PORTRAIT / 2 }, { x: -PORTRAIT / 2 - 8, y: PORTRAIT / 2 },
      ].map(pt => ({ x: outerX + pt.x, y: BAR_Y + 18 + pt.y }));
      frame.fillStyle(PALETTE.ink, 0.92);
      frame.fillPoints(pts, true);
      frame.lineStyle(2, PLAYER_COLORS[p], 1);
      frame.strokePoints(pts, true);
      const head = scene.add.image(outerX, BAR_Y + 22, `warrior_${this.configs[p].id}_head`).setDepth(52);
      head.setScale((PORTRAIT - 10) / Math.max(head.width, head.height));
      head.setFlipX(mirrored);

      const name = scene.add.text(
        mirrored ? GAME_WIDTH - 102 : 102,
        BAR_Y + BAR_H + 16,
        this.configs[p].name.toUpperCase(),
        displayText(15, { weight: '900', spacing: 4, align: mirrored ? 'right' : 'left' }),
      ).setOrigin(mirrored ? 1 : 0, 0).setDepth(51);

      this.objects.push(frame, head, name);
    });

    this.roundLabel = scene.add.text(GAME_WIDTH / 2, BAR_Y + 10, 'I', displayText(22, {
      weight: '900', spacing: 0, color: HEX.bone,
    })).setOrigin(0.5).setDepth(52);
    this.roundKicker = scene.add.text(GAME_WIDTH / 2, BAR_Y + 48, 'ROUND', displayText(9, {
      weight: '700', spacing: 4, color: HEX.gold, shadow: false,
    })).setOrigin(0.5).setDepth(52);
    this.objects.push(this.roundLabel, this.roundKicker);

    this.readyText = [0, 1].map(p => scene.add.text(
      p === 0 ? 92 + METER_W + 12 : GAME_WIDTH - 92 - METER_W - 12,
      BAR_Y + BAR_H + 6,
      'SPECIAL',
      displayText(9, { weight: '900', spacing: 3, color: HEX.gold }),
    ).setOrigin(p === 0 ? 0 : 1, 0.5).setDepth(52).setVisible(false));
    this.objects.push(...this.readyText);
  }

  // Called when a fighter takes damage so the bar can jolt.
  onDamage(playerIndex) {
    this.shake[playerIndex] = 1;
    this.ghostHold[playerIndex] = GHOST_DELAY;
  }

  resetRound() {
    this.ghost = [1, 1];
    this.lastRatio = [1, 1];
  }

  update(fighters, roundWins, currentRound, delta) {
    const g = this.graphics;
    g.clear();
    const t = this.scene.time.now / 1000;

    fighters.forEach((f, p) => {
      const ratio = Phaser.Math.Clamp(f.hp / f.maxHp, 0, 1);
      if (ratio < this.lastRatio[p] - 0.0001) this.onDamage(p);
      this.lastRatio[p] = ratio;

      if (this.ghostHold[p] > 0) {
        this.ghostHold[p] -= delta;
      } else if (this.ghost[p] > ratio) {
        this.ghost[p] = Math.max(ratio, this.ghost[p] - GHOST_RATE * (delta / 1000));
      }
      if (this.ghost[p] < ratio) this.ghost[p] = ratio;

      this.shake[p] *= Math.exp(-(delta / 1000) * 14);
      const jolt = this.shake[p] * 5;
      const ox = (Math.random() - 0.5) * jolt;
      const oy = (Math.random() - 0.5) * jolt;

      this.drawHealth(g, p, ratio, this.ghost[p], ox, oy, t);
      this.drawMeter(g, p, f.specialMeter / SPECIAL_METER_MAX, t);
      this.drawPips(g, p, roundWins[p]);
    });

    this.drawMedallion(g);
    const numeral = ['I', 'II', 'III', 'IV', 'V'][currentRound - 1] || String(currentRound);
    if (this.roundLabel.text !== numeral) this.roundLabel.setText(numeral);
  }

  // Bar geometry: outer end at the portrait, inner end toward the centre.
  barPoints(p, from, to, ox = 0, oy = 0) {
    const mirrored = p === 1;
    const outer = mirrored ? GAME_WIDTH - 82 : 82;
    const dir = mirrored ? -1 : 1;
    // `from`/`to` are fractions measured from the outer end.
    const xa = outer + dir * BAR_W * from;
    const xb = outer + dir * BAR_W * to;
    const y0 = BAR_Y + oy;
    const y1 = BAR_Y + BAR_H + oy;
    const s = BAR_SKEW * dir;
    return [
      { x: xa + s + ox, y: y0 }, { x: xb + s + ox, y: y0 },
      { x: xb + ox, y: y1 }, { x: xa + ox, y: y1 },
    ];
  }

  drawHealth(g, p, ratio, ghost, ox, oy, t) {
    // Trough.
    g.fillStyle(PALETTE.ink, 0.85);
    g.fillPoints(this.barPoints(p, -0.01, 1.01, ox, oy), true);

    // Ghost: the damage just taken, waiting to drain.
    if (ghost > ratio) {
      g.fillStyle(PALETTE.crimsonBright, 1);
      g.fillPoints(this.barPoints(p, ratio, ghost, ox, oy), true);
    }

    if (ratio > 0) {
      const danger = ratio < 0.3;
      const pulse = danger ? 0.5 + Math.sin(t * 10) * 0.5 : 0;
      const fill = danger
        ? Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.IntegerToColor(PALETTE.bone),
          Phaser.Display.Color.IntegerToColor(PALETTE.crimsonBright),
          100, Math.round(40 + pulse * 60),
        )
        : null;
      const color = fill ? Phaser.Display.Color.GetColor(fill.r, fill.g, fill.b) : PALETTE.bone;
      g.fillStyle(color, 1);
      g.fillPoints(this.barPoints(p, 0, ratio, ox, oy), true);
      // Specular top edge.
      g.fillStyle(0xffffff, 0.35);
      const top = this.barPoints(p, 0, ratio, ox, oy);
      g.fillPoints([top[0], top[1], { x: top[1].x - (p === 1 ? -2 : 2), y: top[1].y + 4 }, { x: top[0].x - (p === 1 ? -2 : 2), y: top[0].y + 4 }], true);
    }

    // Player-coloured underline.
    const under = this.barPoints(p, 0, 1, ox, oy);
    g.lineStyle(2, PLAYER_COLORS[p], 0.9);
    g.lineBetween(under[3].x, under[3].y + 3, under[2].x, under[2].y + 3);
    g.lineStyle(1, PALETTE.bone, 0.35);
    g.strokePoints(this.barPoints(p, -0.01, 1.01, ox, oy), true);
  }

  drawMeter(g, p, ratio, t) {
    const mirrored = p === 1;
    const dir = mirrored ? -1 : 1;
    const outer = mirrored ? GAME_WIDTH - 92 : 92;
    const y = BAR_Y + BAR_H + 6;
    const segW = METER_W / METER_SEGMENTS;
    const full = ratio >= 1;
    const pulse = 0.65 + Math.sin(t * 8) * 0.35;

    for (let i = 0; i < METER_SEGMENTS; i++) {
      const segFill = Phaser.Math.Clamp(ratio * METER_SEGMENTS - i, 0, 1);
      const x0 = outer + dir * (i * segW + 2);
      const x1 = outer + dir * ((i + 1) * segW - 2);
      const left = Math.min(x0, x1);
      g.fillStyle(PALETTE.ink, 0.8);
      g.fillRect(left, y - METER_H / 2, segW - 4, METER_H);
      if (segFill > 0) {
        const w = (segW - 4) * segFill;
        g.fillStyle(full ? PALETTE.gold : PALETTE.goldDeep, full ? pulse : 1);
        g.fillRect(mirrored ? left + (segW - 4) - w : left, y - METER_H / 2, w, METER_H);
        if (segFill >= 1) {
          g.fillStyle(PALETTE.gold, 0.9);
          g.fillRect(left, y - METER_H / 2, segW - 4, 1);
        }
      }
    }
    if (full) {
      g.fillStyle(PALETTE.gold, 0.12 * pulse);
      g.fillRect(Math.min(outer, outer + dir * METER_W) - 4, y - 7, METER_W + 8, 14);
    }
    this.readyText[p].setVisible(full).setAlpha(pulse);
  }

  drawPips(g, p, wins) {
    const dir = p === 1 ? -1 : 1;
    const innerX = GAME_WIDTH / 2 - dir * (INNER_GAP + 8);
    const y = BAR_Y + BAR_H + 20;
    for (let i = 0; i < ROUNDS_TO_WIN; i++) {
      const x = innerX - dir * i * 20;
      const pts = [{ x, y: y - 6 }, { x: x + 6, y }, { x, y: y + 6 }, { x: x - 6, y }];
      if (i < wins) {
        g.fillStyle(PALETTE.gold, 1);
        g.fillPoints(pts, true);
      } else {
        g.lineStyle(1, PALETTE.ash, 0.8);
        g.strokePoints(pts, true);
      }
    }
  }

  drawMedallion(g) {
    const cx = GAME_WIDTH / 2;
    const cy = BAR_Y + 10;
    const r = 26;
    const pts = [{ x: cx, y: cy - r }, { x: cx + r, y: cy }, { x: cx, y: cy + r }, { x: cx - r, y: cy }];
    g.fillStyle(PALETTE.ink, 0.92);
    g.fillPoints(pts, true);
    g.lineStyle(2, PALETTE.gold, 0.9);
    g.strokePoints(pts, true);
    g.lineStyle(1, PALETTE.gold, 0.4);
    g.lineBetween(cx - INNER_GAP + 6, BAR_Y + BAR_H / 2, cx - r - 4, cy);
    g.lineBetween(cx + r + 4, cy, cx + INNER_GAP - 6, BAR_Y + BAR_H / 2);
  }

  destroy() {
    this.objects.forEach(o => o.destroy());
  }
}
