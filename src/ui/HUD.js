import Phaser from 'phaser';
import {
  GAME_WIDTH,
  SPECIAL_METER_MAX,
  ROUNDS_TO_WIN,
  COLORS,
} from '../config/constants.js';

const BAR_WIDTH = 350;
const BAR_HEIGHT = 22;
const METER_HEIGHT = 8;
const PADDING = 40;
const TOP_Y = 30;

export class HUD {
  constructor(scene, warrior1Config, warrior2Config) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(50);

    // Warrior names
    this.name1 = scene.add.text(PADDING, TOP_Y - 22, warrior1Config.name.toUpperCase(), {
      fontSize: '20px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    }).setDepth(51);

    this.name2 = scene.add.text(GAME_WIDTH - PADDING, TOP_Y - 22, warrior2Config.name.toUpperCase(), {
      fontSize: '20px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(1, 0).setDepth(51);

    // Round indicators container
    this.roundDots = [];
  }

  update(fighter1, fighter2, roundWins, currentRound) {
    const g = this.graphics;
    g.clear();

    // --- Player 1 health bar (left side) ---
    this.drawHealthBar(g, PADDING, TOP_Y, BAR_WIDTH, fighter1.hp, fighter1.maxHp, false);

    // --- Player 2 health bar (right side, mirrored) ---
    this.drawHealthBar(g, GAME_WIDTH - PADDING - BAR_WIDTH, TOP_Y, BAR_WIDTH, fighter2.hp, fighter2.maxHp, true);

    // --- Player 1 special meter ---
    this.drawSpecialMeter(g, PADDING, TOP_Y + BAR_HEIGHT + 4, BAR_WIDTH, fighter1.specialMeter, false);

    // --- Player 2 special meter ---
    this.drawSpecialMeter(g, GAME_WIDTH - PADDING - BAR_WIDTH, TOP_Y + BAR_HEIGHT + 4, BAR_WIDTH, fighter2.specialMeter, true);

    // --- Round indicators (center) ---
    this.drawRoundIndicators(g, roundWins, currentRound);
  }

  drawHealthBar(g, x, y, width, hp, maxHp, mirrored) {
    const ratio = Math.max(0, hp / maxHp);

    // Background
    g.fillStyle(0x111111, 0.9);
    g.fillRoundedRect(x, y, width, BAR_HEIGHT, 4);

    // Inner shadow
    g.lineStyle(2, 0x000000, 1);
    g.strokeRoundedRect(x, y, width, BAR_HEIGHT, 4);

    // Health fill
    const healthColor = ratio > 0.5 ? COLORS.healthGreen
      : ratio > 0.25 ? 0xffaa00
      : COLORS.healthRed;

    const fillWidth = width * ratio;
    
    if (fillWidth > 0) {
      const startX = mirrored ? x + width - fillWidth : x;
      
      // Main color
      g.fillStyle(healthColor, 1);
      g.fillRoundedRect(startX, y, fillWidth, BAR_HEIGHT, 4);
      
      // Gloss top highlight
      g.fillStyle(0xffffff, 0.25);
      g.fillRoundedRect(startX, y, fillWidth, BAR_HEIGHT / 2, 4);
    }

    // Outer Glowing Border
    g.lineStyle(3, 0xffffff, 0.9);
    g.strokeRoundedRect(x - 2, y - 2, width + 4, BAR_HEIGHT + 4, 6);

    // HP text
    const hpText = `${Math.ceil(hp)}`;
    // We use the scene's existing text objects or draw simple HP text
  }

  drawSpecialMeter(g, x, y, width, meter, mirrored) {
    const ratio = Math.min(1, meter / SPECIAL_METER_MAX);
    const isFull = meter >= SPECIAL_METER_MAX;

    // Background
    g.fillStyle(0x222244, 0.8);
    g.fillRoundedRect(x, y, width, METER_HEIGHT, 2);

    // Fill
    const meterColor = isFull ? COLORS.specialGold : COLORS.specialBlue;
    const fillWidth = width * ratio;

    if (mirrored) {
      g.fillStyle(meterColor, isFull ? 0.9 + Math.sin(Date.now() / 150) * 0.1 : 0.9);
      g.fillRoundedRect(x + width - fillWidth, y, fillWidth, METER_HEIGHT, 2);
    } else {
      g.fillStyle(meterColor, isFull ? 0.9 + Math.sin(Date.now() / 150) * 0.1 : 0.9);
      g.fillRoundedRect(x, y, fillWidth, METER_HEIGHT, 2);
    }

    // Border
    g.lineStyle(1, isFull ? COLORS.specialGold : 0x666688, 0.6);
    g.strokeRoundedRect(x, y, width, METER_HEIGHT, 2);
  }

  drawRoundIndicators(g, roundWins, currentRound) {
    const centerX = GAME_WIDTH / 2;
    const y = TOP_Y + 8;
    const dotRadius = 6;
    const spacing = 20;

    // Player 1 round wins (left of center)
    for (let i = 0; i < ROUNDS_TO_WIN; i++) {
      const dx = centerX - 30 - i * spacing;
      if (i < roundWins[0]) {
        g.fillStyle(COLORS.gold, 1);
        g.fillCircle(dx, y, dotRadius);
      } else {
        g.fillStyle(0x444444, 0.6);
        g.fillCircle(dx, y, dotRadius);
      }
      g.lineStyle(1, 0xffffff, 0.4);
      g.strokeCircle(dx, y, dotRadius);
    }

    // Player 2 round wins (right of center)
    for (let i = 0; i < ROUNDS_TO_WIN; i++) {
      const dx = centerX + 30 + i * spacing;
      if (i < roundWins[1]) {
        g.fillStyle(COLORS.gold, 1);
        g.fillCircle(dx, y, dotRadius);
      } else {
        g.fillStyle(0x444444, 0.6);
        g.fillCircle(dx, y, dotRadius);
      }
      g.lineStyle(1, 0xffffff, 0.4);
      g.strokeCircle(dx, y, dotRadius);
    }

    // "VS" in center
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(centerX, y, 10);
  }

  destroy() {
    this.graphics.destroy();
    this.name1.destroy();
    this.name2.destroy();
  }
}
