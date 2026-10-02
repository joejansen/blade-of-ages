import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { getWarriorById } from '../config/warriors.js';
import {
  PALETTE, HEX, PLAYER_COLORS, PLAYER_HEX, displayText, bodyText, Backdrop, drawRule,
  createTextButton, bindMenuKeys, transitionTo, fadeIn, addKeyHint,
} from '../ui/theme.js';
import { Showcase } from '../ui/Showcase.js';

const STAT_ROWS = [
  { label: 'HITS LANDED', key: 'hitsLanded' },
  { label: 'DAMAGE DEALT', key: 'damageDealt' },
  { label: 'SPECIALS UNLEASHED', key: 'specialsUsed' },
];

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  init(data) {
    this.resultData = data;
  }

  create() {
    fadeIn(this, 500);
    const { winner, roundWins, stats, matchData } = this.resultData;
    const warriors = [getWarriorById(matchData.warrior1Id), getWarriorById(matchData.warrior2Id)];
    const champion = warriors[winner];

    new Backdrop(this, matchData.arenaId || 'castle', {
      grade: { saturation: -0.9, brightness: 0.4, contrast: 0.25 },
      emberColor: PLAYER_COLORS[winner],
    });

    // The champion, posed.
    const showX = 300;
    const groundY = GAME_HEIGHT - 70;
    const pool = this.add.image(showX, groundY, 'fx_soft').setDepth(5)
      .setScale(8, 1.8).setTint(PLAYER_COLORS[winner]).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
    const halo = this.add.image(showX, groundY - 200, 'fx_soft').setDepth(4)
      .setScale(7, 10).setTint(PALETTE.gold).setAlpha(0.1).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: [pool, halo], alpha: '*=0.6', duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    new Showcase(this, champion, showX, groundY, {
      scale: 3.6, state: 'victory', flourish: false, specialRatio: 1,
    });

    // Typography column.
    const col = 820;
    const kicker = this.add.text(col, 92, winner === 0 ? 'PLAYER ONE  ·  VICTORY' : (matchData.mode === '1p' ? 'THE OPPONENT  ·  VICTORY' : 'PLAYER TWO  ·  VICTORY'), displayText(14, {
      color: PLAYER_HEX[winner], weight: '700', spacing: 8,
    })).setOrigin(0.5);
    const name = this.add.text(col, 140, champion.name.toUpperCase(), displayText(54, {
      weight: '900', spacing: 10, shadowBlur: 20,
    })).setOrigin(0.5);
    const epithet = this.add.text(col, 190, `${champion.era}  ·  ${champion.weapon}`, bodyText(20, {
      italic: true, color: HEX.ash,
    })).setOrigin(0.5);

    // Score: roman numerals in player colours either side of a diamond.
    const score = this.add.container(col, 252);
    const s1 = this.add.text(-46, 0, String(roundWins[0]), displayText(60, { weight: '900', color: PLAYER_HEX[0], spacing: 0 })).setOrigin(0.5);
    const s2 = this.add.text(46, 0, String(roundWins[1]), displayText(60, { weight: '900', color: PLAYER_HEX[1], spacing: 0 })).setOrigin(0.5);
    const dia = this.add.graphics();
    dia.fillStyle(PALETTE.gold, 1);
    dia.fillPoints([{ x: 0, y: -8 }, { x: 8, y: 0 }, { x: 0, y: 8 }, { x: -8, y: 0 }], true);
    score.add([s1, dia, s2]);

    const rule = this.add.graphics();
    drawRule(rule, col, 306, 230);

    const headerItems = [kicker, name, epithet, score, rule];
    headerItems.forEach((o, i) => {
      o.setAlpha(0).setDepth(30);
      this.tweens.add({ targets: o, alpha: 1, duration: 500, delay: 200 + i * 90 });
    });
    this.tweens.add({ targets: name, scale: { from: 1.15, to: 1 }, duration: 600, delay: 290, ease: 'Expo.easeOut' });

    // Stats: a single split bar per row, P1 from the left, P2 from the right.
    const statG = this.add.graphics().setDepth(30);
    const barW = 380;
    STAT_ROWS.forEach((row, i) => {
      const y = 362 + i * 58;
      const v1 = Math.round(stats[0][row.key]);
      const v2 = Math.round(stats[1][row.key]);
      const label = this.add.text(col, y - 16, row.label, displayText(11, {
        color: HEX.ash, weight: '700', spacing: 5, shadow: false,
      })).setOrigin(0.5).setDepth(30);
      const t1 = this.add.text(col - barW / 2 - 18, y + 6, String(v1), displayText(22, { weight: '900', spacing: 1, color: v1 >= v2 ? HEX.bone : HEX.ash })).setOrigin(1, 0.5).setDepth(30);
      const t2 = this.add.text(col + barW / 2 + 18, y + 6, String(v2), displayText(22, { weight: '900', spacing: 1, color: v2 >= v1 ? HEX.bone : HEX.ash })).setOrigin(0, 0.5).setDepth(30);
      [label, t1, t2].forEach(o => {
        o.setAlpha(0);
        this.tweens.add({ targets: o, alpha: 1, duration: 400, delay: 700 + i * 120 });
      });

      const total = v1 + v2;
      const split = total > 0 ? v1 / total : 0.5;
      const anim = { k: 0 };
      this.tweens.add({
        targets: anim,
        k: 1,
        duration: 700,
        delay: 750 + i * 120,
        ease: 'Cubic.easeOut',
        onUpdate: () => {
          // Redraw every row; cheap and keeps rows independent of draw order.
          this.statProgress = this.statProgress || [];
          this.statProgress[i] = { k: anim.k, split, y };
          statG.clear();
          for (const r of this.statProgress) {
            if (!r) continue;
            const x0 = col - barW / 2;
            statG.fillStyle(PALETTE.ink, 0.7);
            statG.fillRect(x0, r.y + 4, barW, 5);
            statG.fillStyle(PLAYER_COLORS[0], 1);
            statG.fillRect(x0, r.y + 4, barW * r.split * r.k, 5);
            statG.fillStyle(PLAYER_COLORS[1], 1);
            const w2 = barW * (1 - r.split) * r.k;
            statG.fillRect(x0 + barW - w2, r.y + 4, w2, 5);
            statG.fillStyle(PALETTE.bone, 1);
            statG.fillRect(x0 + barW * r.split - 1, r.y + 1, 2, 11);
          }
        },
      });
    });

    const rematch = () => transitionTo(this, 'Versus', {
      mode: matchData.mode,
      warrior1: matchData.warrior1Id,
      warrior2: matchData.warrior2Id,
      arena: matchData.arenaId,
    });
    const buttons = [
      createTextButton(this, col - 235, 580, 'REMATCH', rematch, { size: 19, width: 190 }),
      createTextButton(this, col, 580, 'NEW WARRIORS', () => transitionTo(this, 'CharacterSelect', { mode: matchData.mode }), { size: 19, width: 240 }),
      createTextButton(this, col + 235, 580, 'MAIN MENU', () => transitionTo(this, 'Title'), { size: 19, width: 190, color: HEX.ash }),
    ];
    buttons.forEach((b, i) => {
      b.container.setAlpha(0);
      this.tweens.add({ targets: b.container, alpha: 1, duration: 400, delay: 1200 + i * 80 });
    });
    bindMenuKeys(this, buttons, { horizontal: true });

    this.input.keyboard.on('keydown-R', rematch);
    this.input.keyboard.on('keydown-ESC', () => transitionTo(this, 'Title'));
    addKeyHint(this, '← →  CHOOSE     ENTER  CONFIRM     R  REMATCH     ESC  MENU');
  }
}
