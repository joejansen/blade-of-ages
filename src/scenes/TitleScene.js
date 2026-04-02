import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    // Parchment background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.parchment);

    // Decorative border
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.inkBrown, 1);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);
    border.lineStyle(2, COLORS.gold, 0.5);
    border.strokeRect(36, 36, GAME_WIDTH - 72, GAME_HEIGHT - 72);

    // Corner ornaments
    const corners = [[40, 40], [GAME_WIDTH - 40, 40], [40, GAME_HEIGHT - 40], [GAME_WIDTH - 40, GAME_HEIGHT - 40]];
    for (const [cx, cy] of corners) {
      border.fillStyle(COLORS.gold, 0.8);
      border.fillCircle(cx, cy, 8);
      border.lineStyle(1, COLORS.inkBrown, 1);
      border.strokeCircle(cx, cy, 8);
    }

    // Title — "BLADE"
    this.add.text(GAME_WIDTH / 2, 180, 'BLADE', {
      fontSize: '96px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#3e2723',
      stroke: '#ffd700',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Subtitle — "of Ages"
    this.add.text(GAME_WIDTH / 2, 270, 'of Ages', {
      fontSize: '52px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#5d4037',
    }).setOrigin(0.5);

    // Decorative sword divider
    const divider = this.add.graphics();
    divider.lineStyle(2, COLORS.inkBrown, 0.6);
    divider.beginPath();
    divider.moveTo(GAME_WIDTH / 2 - 150, 320);
    divider.lineTo(GAME_WIDTH / 2 - 20, 320);
    divider.stroke();
    divider.beginPath();
    divider.moveTo(GAME_WIDTH / 2 + 20, 320);
    divider.lineTo(GAME_WIDTH / 2 + 150, 320);
    divider.stroke();
    // Sword icon in middle
    divider.fillStyle(COLORS.inkBrown, 0.8);
    divider.fillRect(GAME_WIDTH / 2 - 2, 308, 4, 24);
    divider.fillRect(GAME_WIDTH / 2 - 10, 318, 20, 4);

    // Tagline
    this.add.text(GAME_WIDTH / 2, 370, 'Warriors across time. One battlefield.', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#795548',
    }).setOrigin(0.5);

    // Start button
    const btnY = 480;
    const btn = this.add.rectangle(GAME_WIDTH / 2, btnY, 260, 60, COLORS.inkBrown)
      .setInteractive({ useHandCursor: true });
    const btnBorder = this.add.rectangle(GAME_WIDTH / 2, btnY, 260, 60)
      .setStrokeStyle(2, COLORS.gold);
    const btnText = this.add.text(GAME_WIDTH / 2, btnY, 'ENTER BATTLE', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(0x5d4037);
      btnText.setScale(1.05);
    });
    btn.on('pointerout', () => {
      btn.setFillStyle(COLORS.inkBrown);
      btnText.setScale(1);
    });
    btn.on('pointerdown', () => {
      this.scene.start('ModeSelect');
    });

    // Also start on any key press
    this.input.keyboard.once('keydown', () => {
      this.scene.start('ModeSelect');
    });

    // Subtle animated glow on title
    this.tweens.add({
      targets: btnBorder,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // "Press any key" hint
    const hint = this.add.text(GAME_WIDTH / 2, 580, 'Press any key or click to start', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#8d6e63',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Version
    this.add.text(GAME_WIDTH - 50, GAME_HEIGHT - 40, 'v1.0', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#a1887f',
    }).setOrigin(0.5);
  }
}
