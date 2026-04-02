import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  init(data) {
    this.resultData = data;
  }

  create() {
    const { winner, winnerName, roundWins, stats, matchData } = this.resultData;

    // Dynamic Background
    const bgArena = matchData.arenaId || 'castle';
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, `arena_${bgArena}`);
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setTint(0x444444);

    // Overlay to make text readable
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Border with gold accent
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.gold, 0.8);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);

    // Victory banner
    const bannerY = 100;

    // Winner name
    this.add.text(GAME_WIDTH / 2, bannerY, `${winnerName.toUpperCase()} VICTORIOUS!`, {
      fontSize: '42px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Score display
    this.add.text(GAME_WIDTH / 2, 170, `${roundWins[0]} — ${roundWins[1]}`, {
      fontSize: '64px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Divider
    const div = this.add.graphics();
    div.lineStyle(2, 0x888888, 0.5);
    div.beginPath();
    div.moveTo(GAME_WIDTH / 2 - 200, 210);
    div.lineTo(GAME_WIDTH / 2 + 200, 210);
    div.stroke();

    // Stats section header
    this.add.text(GAME_WIDTH / 2, 235, 'BATTLE STATISTICS', {
      fontSize: '22px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Player labels
    const col1X = GAME_WIDTH / 2 - 180;
    const col2X = GAME_WIDTH / 2 + 180;
    const labelX = GAME_WIDTH / 2;

    this.add.text(col1X, 270, 'PLAYER 1', {
      fontSize: '20px',
      fontFamily: 'Impact, sans-serif',
      color: '#4fc3f7',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(col2X, 270, 'PLAYER 2', {
      fontSize: '20px',
      fontFamily: 'Impact, sans-serif',
      color: '#ff5252',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Stat rows
    const statRows = [
      { label: 'Hits Landed', key: 'hitsLanded' },
      { label: 'Damage Dealt', key: 'damageDealt' },
      { label: 'Specials Used', key: 'specialsUsed' },
    ];

    statRows.forEach((row, i) => {
      const y = 310 + i * 40;

      // Label
      this.add.text(labelX, y, row.label.toUpperCase(), {
        fontSize: '16px',
        fontFamily: 'Impact, sans-serif',
        color: '#aaaaaa',
      }).setOrigin(0.5);

      // P1 value
      const v1 = stats[0][row.key];
      this.add.text(col1X, y, String(Math.round(v1)), {
        fontSize: '24px',
        fontFamily: 'Impact, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      // P2 value
      const v2 = stats[1][row.key];
      this.add.text(col2X, y, String(Math.round(v2)), {
        fontSize: '24px',
        fontFamily: 'Impact, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      // Highlight winner of each stat
      // (visual cue only)
    });

    // Buttons
    const btnY = 510;

    // Rematch
    this.createButton(GAME_WIDTH / 2 - 150, btnY, 'REMATCH', () => {
      this.scene.start('Fight', {
        mode: matchData.mode,
        warrior1: matchData.warrior1Id,
        warrior2: matchData.warrior2Id,
        arena: matchData.arenaId,
      });
    });

    // New Warriors
    this.createButton(GAME_WIDTH / 2 + 150, btnY, 'NEW WARRIORS', () => {
      this.scene.start('CharacterSelect', { mode: matchData.mode });
    });

    // Main Menu (smaller, below)
    const menuText = this.add.text(GAME_WIDTH / 2, btnY + 60, 'MAIN MENU', {
      fontSize: '16px',
      fontFamily: 'Impact, sans-serif',
      color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuText.on('pointerover', () => menuText.setColor('#ffffff'));
    menuText.on('pointerout', () => menuText.setColor('#aaaaaa'));
    menuText.on('pointerdown', () => this.scene.start('Title'));

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-R', () => {
      this.scene.start('Fight', {
        mode: matchData.mode,
        warrior1: matchData.warrior1Id,
        warrior2: matchData.warrior2Id,
        arena: matchData.arenaId,
      });
    });
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('Title');
    });

    // Key hints
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 45, 'R = REMATCH  •  ESC = MAIN MENU', {
      fontSize: '14px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  createButton(x, y, label, onClick) {
    const btn = this.add.rectangle(x, y, 220, 50, 0x111111)
      .setInteractive({ useHandCursor: true });
    this.add.rectangle(x, y, 220, 50).setStrokeStyle(3, 0xffcc00);

    const text = this.add.text(x, y, label, {
      fontSize: '20px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(0x333333);
      text.setScale(1.05);
    });
    btn.on('pointerout', () => {
      btn.setFillStyle(0x111111);
      text.setScale(1);
    });
    btn.on('pointerdown', onClick);
  }
}
