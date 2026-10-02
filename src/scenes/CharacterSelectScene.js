import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { WARRIORS } from '../config/warriors.js';
import {
  PALETTE, HEX, PLAYER_COLORS, PLAYER_HEX, displayText, bodyText, Backdrop, addHeader,
  skewPoints, transitionTo, fadeIn, addKeyHint,
} from '../ui/theme.js';
import { Showcase } from '../ui/Showcase.js';

const COLS = 5;
const TILE = 100;
const GAP = 14;
const GRID_Y = 196;
const SHOWCASE_GROUND = 612;
const SHOWCASE_X = [178, GAME_WIDTH - 178];

const STATS = [
  { key: 'speed', label: 'SPEED' },
  { key: 'power', label: 'POWER' },
  { key: 'health', label: 'VITALITY' },
];

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  init(data) {
    this.mode = data.mode || '1p';
    this.selected = [null, null];
    this.selectingPlayer = 0;
    this.cursor = 0;
    this.locked = false;
  }

  create() {
    fadeIn(this);
    this.backdrop = new Backdrop(this, WARRIORS[0].arena, {
      grade: { saturation: -0.9, brightness: 0.36, contrast: 0.2 },
    });
    addHeader(this, this.mode === '1p' ? 'SINGLE WARRIOR' : 'DUAL WARRIORS', 'CHOOSE YOUR WARRIOR', 74);

    this.tiles = WARRIORS.map((w, i) => this.createTile(w, i));
    this.createInfoPanel();
    this.createSideplates();

    this.showcases = [null, null];
    this.showcaseIds = [null, null];

    this.moveCursor(0, true);

    const move = (dx, dy) => {
      if (this.locked) return;
      const col = this.cursor % COLS;
      const row = Math.floor(this.cursor / COLS);
      const nc = (col + dx + COLS) % COLS;
      const nr = (row + dy + 2) % 2;
      this.moveCursor(nr * COLS + nc);
    };
    ['LEFT', 'A'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => move(-1, 0)));
    ['RIGHT', 'D'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => move(1, 0)));
    ['UP', 'W'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => move(0, -1)));
    ['DOWN', 'S'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => move(0, 1)));
    ['ENTER', 'SPACE', 'F'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.confirm(this.cursor)));

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.locked) return;
      if (this.selectingPlayer === 1 && this.mode === '2p') {
        this.selected[0] = null;
        this.selectingPlayer = 0;
        this.refreshTiles();
        this.updatePrompt();
        this.moveCursor(this.cursor, true);
      } else {
        transitionTo(this, 'ModeSelect');
      }
    });

    addKeyHint(this, 'ARROWS  MOVE     ENTER  SELECT     ESC  BACK');
  }

  createTile(warrior, index) {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    const x = GAME_WIDTH / 2 + (col - (COLS - 1) / 2) * (TILE + GAP);
    const y = GRID_Y + row * (TILE + GAP) + TILE / 2;

    const container = this.add.container(x, y).setDepth(20);
    const frame = this.add.graphics();
    const head = this.add.image(0, 6, `warrior_${warrior.id}_head`);
    const fit = (TILE - 18) / Math.max(head.width, head.height);
    head.setScale(fit);
    const accent = parseInt(warrior.colors.primary.replace('#', ''), 16);
    const numeral = this.add.text(-TILE / 2 + 8, -TILE / 2 + 5, toRoman(index + 1), displayText(10, {
      color: HEX.ash, weight: '700', spacing: 1, align: 'left', shadow: false,
    }));
    const tag = this.add.text(TILE / 2 - 6, TILE / 2 - 4, '', displayText(12, {
      weight: '900', spacing: 1, align: 'right',
    })).setOrigin(1, 1);
    container.add([frame, head, numeral, tag]);

    const hit = this.add.rectangle(0, 0, TILE, TILE, 0, 0.001).setInteractive({ useHandCursor: true });
    container.add(hit);
    hit.on('pointerover', () => { if (!this.locked) this.moveCursor(index); });
    hit.on('pointerdown', () => this.confirm(index));

    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: { from: y + 16, to: y },
      duration: 380,
      delay: 120 + index * 35,
      ease: 'Cubic.easeOut',
    });

    const tile = { container, frame, head, tag, accent, warrior, hover: 0 };
    this.drawTile(tile);
    return tile;
  }

  drawTile(tile) {
    const { frame, hover, accent } = tile;
    const owner = this.selected.findIndex(w => w && w.id === tile.warrior.id);
    frame.clear();
    const pts = skewPoints(TILE, TILE, 6);
    frame.fillStyle(PALETTE.ink, 0.82);
    frame.fillPoints(pts, true);
    frame.fillGradientStyle(accent, accent, accent, accent, 0, 0, 0.45, 0.45);
    frame.fillPoints(pts, true);

    if (owner >= 0) {
      frame.lineStyle(3, PLAYER_COLORS[owner], 1);
      frame.strokePoints(pts, true);
    } else if (hover > 0.01) {
      const color = PLAYER_COLORS[this.selectingPlayer];
      frame.lineStyle(3, color, hover);
      frame.strokePoints(pts, true);
      frame.fillStyle(color, 0.12 * hover);
      frame.fillPoints(pts, true);
    } else {
      frame.lineStyle(1, PALETTE.ashDark, 0.9);
      frame.strokePoints(pts, true);
    }

    tile.tag.setText(owner >= 0 ? `${owner + 1}P` : (hover > 0.5 ? `${this.selectingPlayer + 1}P` : ''));
    tile.tag.setColor(PLAYER_HEX[owner >= 0 ? owner : this.selectingPlayer]);
  }

  refreshTiles() {
    this.tiles.forEach(t => this.drawTile(t));
  }

  createInfoPanel() {
    const cx = GAME_WIDTH / 2;
    const top = GRID_Y + 2 * (TILE + GAP) + 18;

    this.infoName = this.add.text(cx, top + 22, '', displayText(34, { weight: '900', spacing: 8 }))
      .setOrigin(0.5).setDepth(30);
    this.infoEra = this.add.text(cx, top + 58, '', bodyText(19, { italic: true, color: HEX.ash }))
      .setOrigin(0.5).setDepth(30);

    this.statGraphics = this.add.graphics().setDepth(30);
    this.statLabels = STATS.map((s, i) => this.add.text(cx - 200, top + 92 + i * 22, s.label, displayText(11, {
      color: HEX.ash, weight: '700', spacing: 3, align: 'left', shadow: false,
    })).setOrigin(0, 0.5).setDepth(30));
    this.statValues = STATS.map(() => ({ v: 0 }));

    this.infoSpecial = this.add.text(cx, top + 172, '', displayText(14, {
      color: HEX.gold, weight: '700', spacing: 4,
    })).setOrigin(0.5).setDepth(30);
    this.infoSpecialDesc = this.add.text(cx, top + 194, '', bodyText(17, { italic: true, color: HEX.ash }))
      .setOrigin(0.5).setDepth(30);
    this.infoTop = top;
  }

  drawStats() {
    const g = this.statGraphics;
    const cx = GAME_WIDTH / 2;
    const x0 = cx - 100;
    const w = 300;
    g.clear();
    this.statValues.forEach((s, i) => {
      const y = this.infoTop + 92 + i * 22;
      g.fillStyle(PALETTE.ashDark, 0.6);
      g.fillRect(x0, y - 1, w, 2);
      // Ten notches: the stat reads as a blade's edge rather than a progress bar.
      for (let n = 1; n < 10; n++) {
        g.fillRect(x0 + (w * n) / 10, y - 3, 1, 6);
      }
      g.fillStyle(PALETTE.crimsonBright, 1);
      g.fillRect(x0, y - 2, w * s.v, 4);
      g.fillStyle(PALETTE.bone, 1);
      g.fillPoints([
        { x: x0 + w * s.v, y: y - 5 }, { x: x0 + w * s.v + 5, y }, { x: x0 + w * s.v, y: y + 5 }, { x: x0 + w * s.v - 5, y },
      ], true);
    });
  }

  createSideplates() {
    this.plates = [0, 1].map((p) => {
      const x = SHOWCASE_X[p];
      const label = this.add.text(x, SHOWCASE_GROUND + 26, `PLAYER ${p + 1}`, displayText(11, {
        color: PLAYER_HEX[p], weight: '700', spacing: 5,
      })).setOrigin(0.5).setDepth(30);
      if (this.mode === '1p' && p === 1) label.setText('OPPONENT');
      const name = this.add.text(x, SHOWCASE_GROUND + 48, '', displayText(18, { weight: '900', spacing: 4 }))
        .setOrigin(0.5).setDepth(30);
      const pool = this.add.image(x, SHOWCASE_GROUND, 'fx_soft').setDepth(5)
        .setScale(6, 1.4).setTint(PLAYER_COLORS[p]).setAlpha(0.3).setBlendMode(Phaser.BlendModes.ADD);
      const mystery = this.add.text(x, SHOWCASE_GROUND - 140, '?', displayText(150, {
        weight: '900', color: PLAYER_HEX[p], spacing: 0,
      })).setOrigin(0.5).setDepth(11).setAlpha(0.22);
      this.tweens.add({ targets: mystery, alpha: 0.4, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return { label, name, pool, mystery };
    });
  }

  setShowcase(player, warrior) {
    if (this.showcaseIds[player] === warrior?.id) return;
    this.showcaseIds[player] = warrior?.id ?? null;
    this.showcases[player]?.destroy();
    this.showcases[player] = null;
    const plate = this.plates[player];
    plate.mystery.setVisible(!warrior);
    plate.name.setText(warrior ? warrior.name.toUpperCase() : '');
    if (!warrior) return;

    const sc = new Showcase(this, warrior, SHOWCASE_X[player], SHOWCASE_GROUND, {
      scale: 2.75, facingRight: player === 0, depth: 12 + player,
    });
    this.showcases[player] = sc;
    // Slide in from the outer edge.
    const from = player === 0 ? -60 : 60;
    sc.x = SHOWCASE_X[player] + from;
    this.tweens.add({ targets: sc, x: SHOWCASE_X[player], duration: 260, ease: 'Cubic.easeOut' });
  }

  moveCursor(index, silent = false) {
    if (index !== this.cursor && !silent) SoundManager.playUIHover(this);
    this.cursor = index;
    const warrior = WARRIORS[index];

    this.tiles.forEach((t, i) => {
      const on = i === index;
      this.tweens.add({
        targets: t, hover: on ? 1 : 0, duration: 140, onUpdate: () => this.drawTile(t),
      });
      this.tweens.add({ targets: t.container, scale: on ? 1.08 : 1, duration: 160, ease: 'Back.easeOut' });
      t.container.setDepth(on ? 21 : 20);
    });

    this.backdrop.setArena(warrior.arena);
    this.setShowcase(this.selectingPlayer, warrior);
    this.updateInfo(warrior);
    this.updatePrompt();
  }

  updateInfo(warrior) {
    this.infoName.setText(warrior.name.toUpperCase());
    this.infoEra.setText(`${warrior.era}  ·  ${warrior.weapon}`);
    this.infoSpecial.setText(`SPECIAL — ${warrior.special.name.toUpperCase()}`);
    this.infoSpecialDesc.setText(warrior.special.description);
    STATS.forEach((s, i) => {
      const v = Phaser.Math.Clamp((warrior[s.key] - 0.6) / 0.75, 0.05, 1);
      this.tweens.add({
        targets: this.statValues[i], v, duration: 260, ease: 'Cubic.easeOut', onUpdate: () => this.drawStats(),
      });
    });
    [this.infoName, this.infoEra].forEach(t => {
      this.tweens.add({ targets: t, alpha: { from: 0.2, to: 1 }, duration: 200 });
    });
  }

  updatePrompt() {
    this.plates.forEach((plate, p) => {
      const active = p === this.selectingPlayer && !this.locked;
      plate.label.setAlpha(active || this.selected[p] ? 1 : 0.5);
    });
  }

  confirm(index) {
    if (this.locked) return;
    const warrior = WARRIORS[index];
    SoundManager.playUIClick(this);
    const player = this.selectingPlayer;
    this.selected[player] = warrior;
    this.setShowcase(player, warrior);
    this.showcases[player]?.play('heavyAttack', 500);
    this.flashPlate(player);
    this.refreshTiles();

    if (player === 0 && this.mode === '2p') {
      this.selectingPlayer = 1;
      this.updatePrompt();
      this.moveCursor(this.cursor, true);
      return;
    }

    this.locked = true;
    this.updatePrompt();
    if (this.mode === '1p') {
      this.rouletteOpponent(warrior);
    } else {
      this.time.delayedCall(650, () => this.proceed());
    }
  }

  // Cycle the opponent slot through the roster before landing.
  rouletteOpponent(playerWarrior) {
    const pool = WARRIORS.filter(w => w.id !== playerWarrior.id);
    const final = Phaser.Utils.Array.GetRandom(pool);
    const steps = 9;
    for (let i = 0; i < steps; i++) {
      const delay = 120 + i * (40 + i * 9);
      this.time.delayedCall(delay, () => {
        const w = i === steps - 1 ? final : Phaser.Utils.Array.GetRandom(pool);
        SoundManager.playUIHover(this);
        this.setShowcase(1, w);
        if (i === steps - 1) {
          this.selected[1] = final;
          this.refreshTiles();
          this.flashPlate(1);
          this.showcases[1]?.play('heavyAttack', 500);
          this.time.delayedCall(800, () => this.proceed());
        }
      });
    }
  }

  flashPlate(player) {
    const x = SHOWCASE_X[player];
    const ring = this.add.image(x, SHOWCASE_GROUND - 140, 'fx_ring').setDepth(14)
      .setTint(PLAYER_COLORS[player]).setBlendMode(Phaser.BlendModes.ADD).setScale(0.6).setAlpha(0.9);
    this.tweens.add({
      targets: ring, scale: 3.4, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => ring.destroy(),
    });
    this.cameras.main.shake(100, 0.003);
  }

  proceed() {
    transitionTo(this, 'ArenaSelect', {
      mode: this.mode,
      warrior1: this.selected[0].id,
      warrior2: this.selected[1].id,
    });
  }
}

function toRoman(n) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n - 1] || String(n);
}
