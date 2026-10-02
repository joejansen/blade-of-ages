import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { getWarriorById } from '../config/warriors.js';
import {
  PALETTE, HEX, PLAYER_HEX, displayText, bodyText, Backdrop,
  transitionTo, fadeIn, addKeyHint,
} from '../ui/theme.js';

export const ARENAS = [
  { id: 'castle', name: 'Castle Courtyard', warrior: 'Medieval Knight' },
  { id: 'dojo', name: 'Cherry Blossom Dojo', warrior: 'Samurai' },
  { id: 'longship', name: 'Longship Deck', warrior: 'Viking' },
  { id: 'colosseum', name: 'Roman Colosseum', warrior: 'Gladiator' },
  { id: 'steppe', name: 'Steppe Grasslands', warrior: 'Mongol' },
  { id: 'thermopylae', name: 'Thermopylae Pass', warrior: 'Spartan' },
  { id: 'dock', name: 'Port Tavern Dock', warrior: 'Pirate' },
  { id: 'savanna', name: 'Savanna', warrior: 'Zulu Warrior' },
  { id: 'temple', name: 'Aztec Temple Steps', warrior: 'Conquistador' },
  { id: 'carrier', name: 'Aircraft Carrier', warrior: 'Navy SEAL' },
];

const THUMB_W = 96;
const THUMB_H = 54;
const THUMB_GAP = 10;
const STRIP_Y = 604;
const RANDOM_INDEX = ARENAS.length;

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
    this.cursor = 0;
  }

  create() {
    fadeIn(this);
    // Home arena of player one is the natural first suggestion.
    const home = getWarriorById(this.matchData.warrior1)?.arena;
    this.cursor = Math.max(0, ARENAS.findIndex(a => a.id === home));

    // Lighter grade than other menus: this screen is about the place.
    this.backdrop = new Backdrop(this, ARENAS[this.cursor].id, {
      grade: { saturation: -0.35, brightness: 0.78, contrast: 0.12 },
      embers: false,
      vignette: 0.5,
    });

    const w1 = getWarriorById(this.matchData.warrior1);
    const w2 = getWarriorById(this.matchData.warrior2);
    this.add.text(GAME_WIDTH / 2, 36, 'CHOOSE YOUR BATTLEFIELD', displayText(13, {
      color: HEX.gold, spacing: 8, weight: '700',
    })).setOrigin(0.5).setDepth(40);
    const vs = this.add.container(GAME_WIDTH / 2, 70).setDepth(40);
    const n1 = this.add.text(-34, 0, w1.name.toUpperCase(), displayText(20, { color: PLAYER_HEX[0], weight: '900', spacing: 4 })).setOrigin(1, 0.5);
    const v = this.add.text(0, 0, 'VS', displayText(16, { color: HEX.crimsonBright, weight: '900', spacing: 2 })).setOrigin(0.5);
    const n2 = this.add.text(34, 0, w2.name.toUpperCase(), displayText(20, { color: PLAYER_HEX[1], weight: '900', spacing: 4 })).setOrigin(0, 0.5);
    vs.add([n1, v, n2]);

    // Title block, lower left, on an ink wash for legibility.
    const wash = this.add.graphics().setDepth(39);
    wash.fillGradientStyle(PALETTE.ink, PALETTE.ink, PALETTE.ink, PALETTE.ink, 0.8, 0, 0.8, 0);
    wash.fillRect(0, 330, 900, 210);
    this.nameText = this.add.text(72, 430, '', displayText(58, {
      weight: '900', spacing: 10, align: 'left', shadowBlur: 18,
    })).setOrigin(0, 1).setDepth(40);
    this.subText = this.add.text(76, 446, '', bodyText(22, { italic: true, color: HEX.bone, align: 'left' }))
      .setOrigin(0, 0).setDepth(40);
    const rule = this.add.graphics().setDepth(40);
    rule.fillStyle(PALETTE.crimsonBright, 1);
    rule.fillRect(76, 492, 120, 3);
    this.indexText = this.add.text(76, 506, '', displayText(12, {
      color: HEX.ash, align: 'left', spacing: 4, weight: '700',
    })).setDepth(40);

    // Film strip.
    const total = ARENAS.length + 1;
    const stripW = total * THUMB_W + (total - 1) * THUMB_GAP;
    const x0 = (GAME_WIDTH - stripW) / 2 + THUMB_W / 2;
    const band = this.add.graphics().setDepth(30);
    band.fillStyle(PALETTE.ink, 0.75);
    band.fillRect(0, STRIP_Y - THUMB_H / 2 - 16, GAME_WIDTH, THUMB_H + 32);
    band.lineStyle(1, PALETTE.goldDeep, 0.6);
    band.lineBetween(0, STRIP_Y - THUMB_H / 2 - 16, GAME_WIDTH, STRIP_Y - THUMB_H / 2 - 16);
    band.lineBetween(0, STRIP_Y + THUMB_H / 2 + 16, GAME_WIDTH, STRIP_Y + THUMB_H / 2 + 16);

    this.thumbs = [];
    for (let i = 0; i < total; i++) {
      this.thumbs.push(this.createThumb(x0 + i * (THUMB_W + THUMB_GAP), STRIP_Y, i));
    }
    this.focusRing = this.add.graphics().setDepth(33);

    this.moveCursor(this.cursor, true);

    ['LEFT', 'A'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.moveCursor((this.cursor - 1 + total) % total)));
    ['RIGHT', 'D'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.moveCursor((this.cursor + 1) % total)));
    ['ENTER', 'SPACE', 'F'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.choose(this.cursor)));
    this.input.keyboard.on('keydown-ESC', () => transitionTo(this, 'CharacterSelect', { mode: this.matchData.mode }));

    addKeyHint(this, '← →  BROWSE     ENTER  FIGHT     ESC  BACK', GAME_HEIGHT - 22);
  }

  createThumb(x, y, index) {
    const container = this.add.container(x, y).setDepth(31);
    let img;
    if (index < ARENAS.length) {
      img = this.add.image(0, 0, `arena_${ARENAS[index].id}`).setDisplaySize(THUMB_W, THUMB_H);
      container.add(img);
    } else {
      img = this.add.rectangle(0, 0, THUMB_W, THUMB_H, PALETTE.inkLift, 1);
      const q = this.add.text(0, 0, '?', displayText(30, { weight: '900', color: HEX.gold, spacing: 0 })).setOrigin(0.5);
      container.add([img, q]);
    }
    const border = this.add.rectangle(0, 0, THUMB_W, THUMB_H).setStrokeStyle(1, PALETTE.ashDark, 1);
    container.add(border);
    const hit = this.add.rectangle(0, 0, THUMB_W, THUMB_H, 0, 0.001).setInteractive({ useHandCursor: true });
    container.add(hit);
    hit.on('pointerover', () => this.moveCursor(index));
    hit.on('pointerdown', () => this.choose(index));

    container.setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 300, delay: 100 + index * 30 });
    return { container, img };
  }

  moveCursor(index, silent = false) {
    if (index !== this.cursor && !silent) SoundManager.playUIHover(this);
    this.cursor = index;

    this.thumbs.forEach((t, i) => {
      const on = i === index;
      this.tweens.add({
        targets: t.container, scale: on ? 1.22 : 1, y: on ? STRIP_Y - 8 : STRIP_Y, duration: 180, ease: 'Back.easeOut',
      });
      t.container.setDepth(on ? 32 : 31);
      if (t.img.setTint) {
        if (on) t.img.clearTint(); else t.img.setTint(0x6a6560);
      }
    });

    const t = this.thumbs[index];
    this.tweens.add({
      targets: {},
      duration: 190,
      onUpdate: () => this.drawFocus(t.container),
    });

    let name;
    let sub;
    if (index === RANDOM_INDEX) {
      name = 'FATE DECIDES';
      sub = 'A battlefield chosen by chance';
    } else {
      const arena = ARENAS[index];
      this.backdrop.setArena(arena.id);
      name = arena.name.toUpperCase();
      sub = `Home ground of the ${arena.warrior}`;
    }
    this.nameText.setText(name);
    this.subText.setText(sub);
    this.indexText.setText(index === RANDOM_INDEX ? '— / X' : `${index + 1} / ${ARENAS.length}`);
    this.tweens.add({ targets: this.nameText, x: { from: 92, to: 72 }, alpha: { from: 0, to: 1 }, duration: 260, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: this.subText, alpha: { from: 0, to: 1 }, duration: 320, delay: 60 });
  }

  drawFocus(container) {
    const g = this.focusRing;
    const w = THUMB_W * container.scale;
    const h = THUMB_H * container.scale;
    g.clear();
    g.lineStyle(2, PALETTE.crimsonBright, 1);
    g.strokeRect(container.x - w / 2 - 3, container.y - h / 2 - 3, w + 6, h + 6);
    g.fillStyle(PALETTE.crimsonBright, 1);
    g.fillTriangle(container.x - 7, container.y + h / 2 + 8, container.x + 7, container.y + h / 2 + 8, container.x, container.y + h / 2 + 2);
  }

  choose(index) {
    SoundManager.playUIClick(this);
    const arenaId = index === RANDOM_INDEX
      ? Phaser.Utils.Array.GetRandom(ARENAS).id
      : ARENAS[index].id;
    transitionTo(this, 'Versus', { ...this.matchData, arena: arenaId });
  }
}
