import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super('ModeSelect');
  }

  create() {
    // Parchment background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.parchment);

    // Border
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.inkBrown, 1);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);

    // Header
    this.add.text(GAME_WIDTH / 2, 100, 'Choose Your Path', {
      fontSize: '42px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#3e2723',
    }).setOrigin(0.5);

    // Divider
    const div = this.add.graphics();
    div.lineStyle(2, COLORS.inkBrown, 0.4);
    div.beginPath();
    div.moveTo(GAME_WIDTH / 2 - 120, 140);
    div.lineTo(GAME_WIDTH / 2 + 120, 140);
    div.stroke();

    // 1 Player button
    this.createModeButton(
      GAME_WIDTH / 2 - 180, 320,
      'Single Warrior',
      'Battle against AI opponents\nwith unique fighting styles',
      '1p'
    );

    // 2 Player button
    this.createModeButton(
      GAME_WIDTH / 2 + 180, 320,
      'Dual Warriors',
      'Local 2-player combat\non the same keyboard',
      '2p'
    );

    // VS emblem in center
    this.add.text(GAME_WIDTH / 2, 310, 'VS', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#8d6e63',
    }).setOrigin(0.5);

    // Sword icons flanking VS
    const swords = this.add.graphics();
    swords.lineStyle(2, COLORS.inkBrown, 0.5);
    // Left sword
    swords.beginPath();
    swords.moveTo(GAME_WIDTH / 2 - 50, 300);
    swords.lineTo(GAME_WIDTH / 2 - 30, 320);
    swords.stroke();
    // Right sword
    swords.beginPath();
    swords.moveTo(GAME_WIDTH / 2 + 50, 300);
    swords.lineTo(GAME_WIDTH / 2 + 30, 320);
    swords.stroke();

    // Back hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'ESC to return', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#a1887f',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('Title');
    });
  }

  createModeButton(x, y, title, description, mode) {
    const w = 260;
    const h = 220;

    // Card background
    const card = this.add.rectangle(x, y, w, h, 0xffffff, 0.5)
      .setStrokeStyle(2, COLORS.inkBrown)
      .setInteractive({ useHandCursor: true });

    // Player icon
    const icon = this.add.graphics();
    icon.fillStyle(COLORS.inkBrown, 0.7);
    if (mode === '1p') {
      // Single figure
      icon.fillCircle(x, y - 60, 15);
      icon.fillRect(x - 8, y - 45, 16, 30);
      // Sword
      icon.lineStyle(3, 0x888888, 1);
      icon.beginPath();
      icon.moveTo(x + 12, y - 40);
      icon.lineTo(x + 30, y - 60);
      icon.stroke();
    } else {
      // Two figures
      icon.fillCircle(x - 20, y - 60, 12);
      icon.fillRect(x - 28, y - 48, 14, 24);
      icon.fillCircle(x + 20, y - 60, 12);
      icon.fillRect(x + 14, y - 48, 14, 24);
      // Crossed swords
      icon.lineStyle(3, 0x888888, 1);
      icon.beginPath();
      icon.moveTo(x - 8, y - 44);
      icon.lineTo(x + 8, y - 64);
      icon.stroke();
      icon.beginPath();
      icon.moveTo(x + 8, y - 44);
      icon.lineTo(x - 8, y - 64);
      icon.stroke();
    }

    // Title
    const titleText = this.add.text(x, y + 10, title, {
      fontSize: '22px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#3e2723',
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 55, description, {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      color: '#795548',
      align: 'center',
    }).setOrigin(0.5);

    // Hover effects
    card.on('pointerover', () => {
      card.setFillStyle(COLORS.gold, 0.2);
      titleText.setScale(1.05);
    });
    card.on('pointerout', () => {
      card.setFillStyle(0xffffff, 0.5);
      titleText.setScale(1);
    });
    card.on('pointerdown', () => {
      this.scene.start('CharacterSelect', { mode });
    });
  }
}
