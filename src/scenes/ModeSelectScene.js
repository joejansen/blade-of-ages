import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super('ModeSelect');
  }

  create() {
    // Dynamic Dark Background
    const bgArena = 'arena_longship'; // Just a cool background
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgArena);
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setTint(0x444444);

    // Header Background
    this.add.rectangle(GAME_WIDTH / 2, 85, GAME_WIDTH, 80, 0x000000, 0.6);

    // Border
    const border = this.add.graphics();
    border.lineStyle(4, 0x000000, 0.8);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);

    // Header
    this.add.text(GAME_WIDTH / 2, 85, 'CHOOSE YOUR PATH', {
      fontSize: '48px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

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
      fontSize: '42px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4,
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
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'ESC TO RETURN', {
      fontSize: '18px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('Title');
    });
  }

  createModeButton(x, y, title, description, mode) {
    const w = 280;
    const h = 240;

    // Card background
    const card = this.add.rectangle(x, y, w, h, 0x111111, 0.85)
      .setStrokeStyle(4, 0x000000)
      .setInteractive({ useHandCursor: true });

    // Player icon
    const icon = this.add.graphics();
    icon.fillStyle(COLORS.gold, 1);
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
    const titleText = this.add.text(x, y + 20, title.toUpperCase(), {
      fontSize: '26px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 70, description, {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);

    // Hover effects
    card.on('pointerover', () => {
      card.setFillStyle(0x333333, 0.95);
      card.setStrokeStyle(4, COLORS.gold);
      titleText.setScale(1.05);
    });
    card.on('pointerout', () => {
      card.setFillStyle(0x111111, 0.85);
      card.setStrokeStyle(4, 0x000000);
      titleText.setScale(1);
    });
    card.on('pointerdown', () => {
      this.scene.start('CharacterSelect', { mode });
    });
  }
}
