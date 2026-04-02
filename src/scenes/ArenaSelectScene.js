import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';
import { WARRIORS } from '../config/warriors.js';

const ARENAS = [
  { id: 'castle', name: 'Castle Courtyard', warrior: 'Medieval Knight', color: 0x696969 },
  { id: 'dojo', name: 'Cherry Blossom Dojo', warrior: 'Samurai', color: 0xffb7c5 },
  { id: 'longship', name: 'Longship Deck', warrior: 'Viking', color: 0x546e7a },
  { id: 'colosseum', name: 'Roman Colosseum', warrior: 'Gladiator', color: 0xd2b48c },
  { id: 'steppe', name: 'Steppe Grasslands', warrior: 'Mongol', color: 0x8db33a },
  { id: 'thermopylae', name: 'Thermopylae Pass', warrior: 'Spartan', color: 0xcc8844 },
  { id: 'dock', name: 'Port Tavern Dock', warrior: 'Pirate', color: 0xff6b35 },
  { id: 'savanna', name: 'Savanna', warrior: 'Zulu Warrior', color: 0xdaa520 },
  { id: 'temple', name: 'Aztec Temple Steps', warrior: 'Conquistador', color: 0x228b22 },
  { id: 'carrier', name: 'Aircraft Carrier', warrior: 'Navy SEAL', color: 0x3949ab },
];

export class ArenaSelectScene extends Phaser.Scene {
  constructor() {
    super('ArenaSelect');
  }

  init(data) {
    this.matchData = {
      mode: data.mode,
      warrior1: data.warrior1,
      warrior2: data.warrior2,
    };
  }

  create() {
    // Parchment background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.parchment);

    // Border
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.inkBrown, 1);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);

    // Header
    this.add.text(GAME_WIDTH / 2, 65, 'Choose Your Battlefield', {
      fontSize: '36px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#3e2723',
    }).setOrigin(0.5);

    // Arena grid — 2 rows of 5
    const startX = 120;
    const startY = 130;
    const cardW = 200;
    const cardH = 115;
    const gapX = 15;
    const gapY = 12;

    ARENAS.forEach((arena, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      const cx = startX + col * (cardW + gapX) + cardW / 2;
      const cy = startY + row * (cardH + gapY) + cardH / 2;

      this.createArenaCard(cx, cy, cardW, cardH, arena);
    });

    // Random arena button
    const randY = GAME_HEIGHT - 80;
    const randBtn = this.add.rectangle(GAME_WIDTH / 2, randY, 220, 45, COLORS.inkBrown)
      .setInteractive({ useHandCursor: true });
    this.add.rectangle(GAME_WIDTH / 2, randY, 220, 45)
      .setStrokeStyle(2, COLORS.gold);
    const randText = this.add.text(GAME_WIDTH / 2, randY, 'RANDOM ARENA', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);

    randBtn.on('pointerover', () => {
      randBtn.setFillStyle(0x5d4037);
      randText.setScale(1.05);
    });
    randBtn.on('pointerout', () => {
      randBtn.setFillStyle(COLORS.inkBrown);
      randText.setScale(1);
    });
    randBtn.on('pointerdown', () => {
      const randomArena = Phaser.Utils.Array.GetRandom(ARENAS);
      this.startFight(randomArena.id);
    });

    // Back
    this.add.text(60, GAME_HEIGHT - 45, 'ESC to go back', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#a1887f',
    }).setOrigin(0, 0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('CharacterSelect', { mode: this.matchData.mode });
    });
  }

  createArenaCard(x, y, w, h, arena) {
    // Color preview thumbnail
    const g = this.add.graphics();
    g.fillStyle(arena.color, 0.3);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    g.lineStyle(2, COLORS.inkBrown, 0.5);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);

    // Color swatch strip at top
    g.fillStyle(arena.color, 0.7);
    g.fillRect(x - w / 2, y - h / 2, w, 25);

    // Interactive overlay
    const card = this.add.rectangle(x, y, w, h, 0xffffff, 0.01)
      .setInteractive({ useHandCursor: true });

    // Arena name
    this.add.text(x, y + 5, arena.name, {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#3e2723',
      align: 'center',
      wordWrap: { width: w - 15 },
    }).setOrigin(0.5);

    // Warrior association
    this.add.text(x, y + 30, arena.warrior, {
      fontSize: '10px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#795548',
    }).setOrigin(0.5);

    card.on('pointerover', () => {
      g.clear();
      g.fillStyle(COLORS.gold, 0.2);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      g.fillStyle(arena.color, 0.8);
      g.fillRect(x - w / 2, y - h / 2, w, 25);
      g.lineStyle(2, COLORS.gold, 1);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    });
    card.on('pointerout', () => {
      g.clear();
      g.fillStyle(arena.color, 0.3);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      g.fillStyle(arena.color, 0.7);
      g.fillRect(x - w / 2, y - h / 2, w, 25);
      g.lineStyle(2, COLORS.inkBrown, 0.5);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    });
    card.on('pointerdown', () => {
      this.startFight(arena.id);
    });
  }

  startFight(arenaId) {
    this.scene.start('Fight', {
      mode: this.matchData.mode,
      warrior1: this.matchData.warrior1,
      warrior2: this.matchData.warrior2,
      arena: arenaId,
    });
  }
}
