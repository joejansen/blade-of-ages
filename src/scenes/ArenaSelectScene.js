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
    // Dynamic Dark UI Background
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'arena_dojo');
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setTint(0x333333); // Very dark to make cards pop out

    // Header Background
    this.add.rectangle(GAME_WIDTH / 2, 65, GAME_WIDTH, 80, 0x000000, 0.5);

    // Border
    const border = this.add.graphics();
    border.lineStyle(4, 0x000000, 0.8);
    border.strokeRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);

    // Header
    this.add.text(GAME_WIDTH / 2, 65, 'CHOOSE YOUR BATTLEFIELD', {
      fontSize: '36px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
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
    const randBtn = this.add.rectangle(GAME_WIDTH / 2, randY, 260, 50, 0x111111)
      .setInteractive({ useHandCursor: true });
    this.add.rectangle(GAME_WIDTH / 2, randY, 260, 50)
      .setStrokeStyle(3, COLORS.gold);
    const randText = this.add.text(GAME_WIDTH / 2, randY, 'RANDOM ARENA', {
      fontSize: '22px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
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
    // Draw thick border behind image
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x000000, 1);
    cardBg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    cardBg.lineStyle(3, 0x444444, 1);
    cardBg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);

    // Arena Graphic Thumbnail
    const thumb = this.add.image(x, y, `arena_${arena.id}`);
    thumb.setDisplaySize(w - 4, h - 4); // Slightly smaller to fit in border
    thumb.setTint(0x888888); // Dim until hovered
    
    // Mask to keep rounded corners
    const shape = this.make.graphics();
    shape.fillStyle(0xffffff);
    shape.fillRoundedRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, h - 4, 6);
    thumb.setMask(shape.createGeometryMask());

    // Gradient fade at bottom for text readability
    const fade = this.add.graphics();
    fade.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.9, 0.9);
    fade.fillRect(x - w / 2 + 2, y + 20, w - 4, h / 2 - 22);

    // Interactive overlay
    const card = this.add.rectangle(x, y, w, h, 0xffffff, 0.01)
      .setInteractive({ useHandCursor: true });

    // Arena name
    this.add.text(x, y + 27, arena.name.toUpperCase(), {
      fontSize: '16px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: w - 10 },
    }).setOrigin(0.5);

    // Warrior association
    this.add.text(x, y + 45, arena.warrior, {
      fontSize: '11px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    card.on('pointerover', () => {
      thumb.clearTint();
      cardBg.clear();
      cardBg.fillStyle(0x000000, 1);
      cardBg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      cardBg.lineStyle(4, COLORS.gold, 1);
      cardBg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    });
    card.on('pointerout', () => {
      thumb.setTint(0x888888);
      cardBg.clear();
      cardBg.fillStyle(0x000000, 1);
      cardBg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      cardBg.lineStyle(3, 0x444444, 1);
      cardBg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
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
