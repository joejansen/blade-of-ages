import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    // Dynamic Arena Background
    const bgArena = 'arena_castle'; // Or randomize it
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgArena);
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setTint(0x555555); // Darken for text contrast

    // Heavy Decorative border
    const border = this.add.graphics();
    border.lineStyle(4, 0x000000, 0.8);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);
    border.lineStyle(2, COLORS.gold, 0.8);
    border.strokeRect(36, 36, GAME_WIDTH - 72, GAME_HEIGHT - 72);

    // Corner ornaments
    const corners = [[40, 40], [GAME_WIDTH - 40, 40], [40, GAME_HEIGHT - 40], [GAME_WIDTH - 40, GAME_HEIGHT - 40]];
    for (const [cx, cy] of corners) {
      border.fillStyle(COLORS.gold, 1);
      border.fillCircle(cx, cy, 8);
      border.lineStyle(2, 0x000000, 1);
      border.strokeCircle(cx, cy, 8);
    }

    // Title Drop Shadow
    this.add.text(GAME_WIDTH / 2 + 5, 185, 'BLADE', {
      fontSize: '108px',
      fontFamily: 'Impact, sans-serif',
      color: '#000000',
      alpha: 0.8
    }).setOrigin(0.5);

    // Title — "BLADE"
    this.add.text(GAME_WIDTH / 2, 180, 'BLADE', {
      fontSize: '108px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Subtitle — "of Ages"
    this.add.text(GAME_WIDTH / 2 + 3, 273, 'of Ages', {
      fontSize: '52px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#000000',
      alpha: 0.8
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 270, 'of Ages', {
      fontSize: '52px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
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

    // Tagline backdrop
    this.add.rectangle(GAME_WIDTH / 2, 370, 400, 30, 0x000000, 0.6);

    // Tagline
    this.add.text(GAME_WIDTH / 2, 370, 'Warriors across time. One battlefield.', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Start button
    const btnY = 430;
    const btn = this.add.rectangle(GAME_WIDTH / 2, btnY, 260, 60, 0x8b0000)
      .setInteractive({ useHandCursor: true });
    const btnBorder = this.add.rectangle(GAME_WIDTH / 2, btnY, 260, 60)
      .setStrokeStyle(4, COLORS.gold);
    const btnText = this.add.text(GAME_WIDTH / 2, btnY, 'ENTER BATTLE', {
      fontSize: '26px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(0xff0000);
      btnText.setScale(1.1);
      btnBorder.setScale(1.05);
    });
    btn.on('pointerout', () => {
      btn.setFillStyle(0x8b0000);
      btnText.setScale(1);
      btnBorder.setScale(1);
    });
    btn.on('pointerdown', () => {
      this.scene.start('ModeSelect');
    });

    // Instructions button
    const instY = 510;
    const instBtn = this.add.rectangle(GAME_WIDTH / 2, instY, 260, 60, 0x111111)
      .setInteractive({ useHandCursor: true });
    const instBorder = this.add.rectangle(GAME_WIDTH / 2, instY, 260, 60)
      .setStrokeStyle(4, COLORS.gold);
    const instText = this.add.text(GAME_WIDTH / 2, instY, 'HOW TO PLAY', {
      fontSize: '22px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    instBtn.on('pointerover', () => {
      instBtn.setFillStyle(0x333333);
      instText.setScale(1.1);
      instBorder.setScale(1.05);
    });
    instBtn.on('pointerout', () => {
      instBtn.setFillStyle(0x111111);
      instText.setScale(1);
      instBorder.setScale(1);
    });
    instBtn.on('pointerdown', () => {
      this.scene.start('Instructions');
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
    const hint = this.add.text(GAME_WIDTH / 2, 590, 'Press any key or click to start', {
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
