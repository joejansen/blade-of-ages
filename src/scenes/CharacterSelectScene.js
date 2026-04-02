import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';
import { WARRIORS } from '../config/warriors.js';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  init(data) {
    this.mode = data.mode || '1p';
    this.selectedWarrior1 = null;
    this.selectedWarrior2 = null;
    this.selectingPlayer = 1; // Which player is currently selecting
  }

  create() {
    // Parchment background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.parchment);

    // Border
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.inkBrown, 1);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);

    // Header
    this.add.text(GAME_WIDTH / 2, 65, 'Choose Your Warrior', {
      fontSize: '36px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#3e2723',
    }).setOrigin(0.5);

    // Player indicator
    this.playerIndicator = this.add.text(GAME_WIDTH / 2, 100, '', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#795548',
    }).setOrigin(0.5);
    this.updatePlayerIndicator();

    // Warrior grid — 2 rows of 5
    const startX = 140;
    const startY = 170;
    const cardW = 190;
    const cardH = 200;
    const gapX = 15;
    const gapY = 15;

    this.cards = [];
    this.cardHighlights = [];

    WARRIORS.forEach((warrior, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      const cx = startX + col * (cardW + gapX) + cardW / 2;
      const cy = startY + row * (cardH + gapY) + cardH / 2;

      this.createWarriorCard(cx, cy, cardW, cardH, warrior, index);
    });

    // Selection display area at bottom
    this.selectionBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 55, GAME_WIDTH - 80, 70, 0xffffff, 0.4);
    this.selectionBg.setStrokeStyle(1, COLORS.inkBrown, 0.3);

    this.selText1 = this.add.text(200, GAME_HEIGHT - 55, 'P1: ---', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#1565c0',
    }).setOrigin(0.5);

    this.vsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 55, 'VS', {
      fontSize: '22px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#8d6e63',
    }).setOrigin(0.5);

    this.selText2 = this.add.text(GAME_WIDTH - 200, GAME_HEIGHT - 55, 'P2: ---', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#c62828',
    }).setOrigin(0.5);

    // ESC to go back
    this.add.text(60, GAME_HEIGHT - 55, 'ESC', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#a1887f',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.selectingPlayer === 2 && this.mode === '2p') {
        this.selectedWarrior1 = null;
        this.selectingPlayer = 1;
        this.updatePlayerIndicator();
        this.updateSelectionDisplay();
        this.clearHighlights();
      } else {
        this.scene.start('ModeSelect');
      }
    });
  }

  createWarriorCard(x, y, w, h, warrior, index) {
    // Card background
    const card = this.add.rectangle(x, y, w, h, 0xffffff, 0.6)
      .setStrokeStyle(2, COLORS.inkBrown)
      .setInteractive({ useHandCursor: true });

    // Selection highlight (hidden by default)
    const highlight = this.add.rectangle(x, y, w + 4, h + 4)
      .setStrokeStyle(3, COLORS.gold)
      .setVisible(false);
    this.cardHighlights.push({ highlight, index });

    // Mini warrior portrait (colored rectangle with icon)
    const portraitG = this.add.graphics();
    const primary = parseInt(warrior.colors.primary.replace('#', ''), 16);
    const accent = parseInt(warrior.colors.accent.replace('#', ''), 16);
    portraitG.fillStyle(primary, 1);
    portraitG.fillRoundedRect(x - 25, y - h / 2 + 15, 50, 55, 4);
    portraitG.lineStyle(2, 0x000000, 0.5);
    portraitG.strokeRoundedRect(x - 25, y - h / 2 + 15, 50, 55, 4);

    // Simple warrior silhouette
    portraitG.fillStyle(0x000000, 0.6);
    portraitG.fillCircle(x, y - h / 2 + 32, 10);
    portraitG.fillRect(x - 6, y - h / 2 + 42, 12, 20);
    // Weapon line
    portraitG.lineStyle(2, accent, 1);
    portraitG.beginPath();
    portraitG.moveTo(x + 8, y - h / 2 + 44);
    portraitG.lineTo(x + 20, y - h / 2 + 28);
    portraitG.stroke();

    // Name
    this.add.text(x, y + 15, warrior.name, {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#3e2723',
      align: 'center',
      wordWrap: { width: w - 20 },
    }).setOrigin(0.5);

    // Era
    this.add.text(x, y + 38, warrior.era, {
      fontSize: '10px',
      fontFamily: 'Georgia, serif',
      color: '#795548',
    }).setOrigin(0.5);

    // Stat bars
    const barY = y + 55;
    const barW = w - 40;
    this.drawStatBar(x, barY, barW, 'SPD', warrior.speed, portraitG);
    this.drawStatBar(x, barY + 14, barW, 'PWR', warrior.power, portraitG);
    this.drawStatBar(x, barY + 28, barW, 'HP', warrior.health, portraitG);

    // Weapon label
    this.add.text(x, y + h / 2 - 12, warrior.weapon, {
      fontSize: '10px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#8d6e63',
    }).setOrigin(0.5);

    // Hover
    card.on('pointerover', () => {
      card.setFillStyle(COLORS.gold, 0.15);
    });
    card.on('pointerout', () => {
      card.setFillStyle(0xffffff, 0.6);
    });
    card.on('pointerdown', () => {
      this.selectWarrior(warrior, index);
    });

    this.cards.push(card);
  }

  drawStatBar(x, y, maxW, label, value, graphics) {
    const g = graphics;
    const labelW = 28;
    const barX = x - maxW / 2 + labelW;
    const barW = maxW - labelW;
    const fillRatio = (value - 0.7) / 0.6; // Normalize 0.7-1.3 range to 0-1

    // Label
    this.add.text(x - maxW / 2, y, label, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#8d6e63',
    });

    // Background
    g.fillStyle(0xdddddd, 0.5);
    g.fillRect(barX, y + 1, barW, 7);

    // Fill
    const color = value >= 1.1 ? 0x4caf50 : value >= 0.95 ? 0xffc107 : 0xff9800;
    g.fillStyle(color, 0.8);
    g.fillRect(barX, y + 1, barW * Math.max(0, Math.min(1, fillRatio)), 7);
  }

  selectWarrior(warrior, index) {
    if (this.selectingPlayer === 1) {
      this.selectedWarrior1 = warrior;
      this.highlightCard(index, 0x1565c0);

      if (this.mode === '2p') {
        this.selectingPlayer = 2;
        this.updatePlayerIndicator();
      } else {
        // In 1P mode, pick a random opponent (different from player's choice)
        const opponents = WARRIORS.filter(w => w.id !== warrior.id);
        this.selectedWarrior2 = Phaser.Utils.Array.GetRandom(opponents);
        this.proceedToArenaSelect();
      }
    } else {
      this.selectedWarrior2 = warrior;
      this.highlightCard(index, 0xc62828);
      // Short delay before proceeding
      this.time.delayedCall(400, () => {
        this.proceedToArenaSelect();
      });
    }
    this.updateSelectionDisplay();
  }

  highlightCard(index, color) {
    const entry = this.cardHighlights.find(c => c.index === index);
    if (entry) {
      entry.highlight.setStrokeStyle(3, color);
      entry.highlight.setVisible(true);
    }
  }

  clearHighlights() {
    this.cardHighlights.forEach(c => c.highlight.setVisible(false));
  }

  updatePlayerIndicator() {
    if (this.mode === '1p') {
      this.playerIndicator.setText('Select your warrior');
    } else {
      this.playerIndicator.setText(`Player ${this.selectingPlayer} — select your warrior`);
    }
  }

  updateSelectionDisplay() {
    this.selText1.setText(this.selectedWarrior1 ? `P1: ${this.selectedWarrior1.name}` : 'P1: ---');
    this.selText2.setText(this.selectedWarrior2 ? `P2: ${this.selectedWarrior2.name}` : 'P2: ---');
  }

  proceedToArenaSelect() {
    this.scene.start('ArenaSelect', {
      mode: this.mode,
      warrior1: this.selectedWarrior1.id,
      warrior2: this.selectedWarrior2.id,
    });
  }
}
