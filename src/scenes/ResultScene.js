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

    // Parchment background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.parchment);

    // Border with gold accent
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.gold, 1);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);
    border.lineStyle(2, COLORS.inkBrown, 0.5);
    border.strokeRect(35, 35, GAME_WIDTH - 70, GAME_HEIGHT - 70);

    // Victory banner
    const bannerY = 100;
    border.fillStyle(COLORS.inkBrown, 0.9);
    border.fillRect(GAME_WIDTH / 2 - 250, bannerY - 30, 500, 60);
    border.fillStyle(COLORS.gold, 1);
    border.fillRect(GAME_WIDTH / 2 - 250, bannerY - 30, 500, 4);
    border.fillRect(GAME_WIDTH / 2 - 250, bannerY + 26, 500, 4);

    // Winner name
    this.add.text(GAME_WIDTH / 2, bannerY, `${winnerName} Victorious!`, {
      fontSize: '32px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);

    // Score display
    this.add.text(GAME_WIDTH / 2, 170, `${roundWins[0]} — ${roundWins[1]}`, {
      fontSize: '48px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#3e2723',
    }).setOrigin(0.5);

    // Divider
    const div = this.add.graphics();
    div.lineStyle(2, COLORS.inkBrown, 0.3);
    div.beginPath();
    div.moveTo(GAME_WIDTH / 2 - 200, 210);
    div.lineTo(GAME_WIDTH / 2 + 200, 210);
    div.stroke();

    // Stats section header
    this.add.text(GAME_WIDTH / 2, 235, 'Battle Statistics', {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#5d4037',
    }).setOrigin(0.5);

    // Player labels
    const col1X = GAME_WIDTH / 2 - 180;
    const col2X = GAME_WIDTH / 2 + 180;
    const labelX = GAME_WIDTH / 2;

    this.add.text(col1X, 270, 'Player 1', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#1565c0',
    }).setOrigin(0.5);

    this.add.text(col2X, 270, 'Player 2', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#c62828',
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
      this.add.text(labelX, y, row.label, {
        fontSize: '15px',
        fontFamily: 'Georgia, serif',
        color: '#795548',
      }).setOrigin(0.5);

      // P1 value
      const v1 = stats[0][row.key];
      this.add.text(col1X, y, String(Math.round(v1)), {
        fontSize: '20px',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold',
        color: '#3e2723',
      }).setOrigin(0.5);

      // P2 value
      const v2 = stats[1][row.key];
      this.add.text(col2X, y, String(Math.round(v2)), {
        fontSize: '20px',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold',
        color: '#3e2723',
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
    const menuText = this.add.text(GAME_WIDTH / 2, btnY + 60, 'Main Menu', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#8d6e63',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuText.on('pointerover', () => menuText.setColor('#3e2723'));
    menuText.on('pointerout', () => menuText.setColor('#8d6e63'));
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
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 45, 'R = Rematch  •  ESC = Main Menu', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#a1887f',
    }).setOrigin(0.5);
  }

  createButton(x, y, label, onClick) {
    const btn = this.add.rectangle(x, y, 220, 50, COLORS.inkBrown)
      .setInteractive({ useHandCursor: true });
    this.add.rectangle(x, y, 220, 50).setStrokeStyle(2, COLORS.gold);

    const text = this.add.text(x, y, label, {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(0x5d4037);
      text.setScale(1.05);
    });
    btn.on('pointerout', () => {
      btn.setFillStyle(COLORS.inkBrown);
      text.setScale(1);
    });
    btn.on('pointerdown', onClick);
  }
}
