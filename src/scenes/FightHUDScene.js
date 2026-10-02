import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { HUD } from '../ui/HUD.js';
import { PALETTE, HEX, PLAYER_HEX, displayText, bodyText, addGrain, addVignetteOverlay } from '../ui/theme.js';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

// Screen-space overlay for the fight. Lives in its own scene so the fight
// camera can zoom and shake without dragging the HUD with it.
export class FightHUDScene extends Phaser.Scene {
  constructor() {
    super('FightHUD');
  }

  init(data) {
    this.warriors = [data.warrior1Config, data.warrior2Config];
  }

  create() {
    this.hud = new HUD(this, this.warriors[0], this.warriors[1]);
    this.combo = [null, null];
    // No camera postFX here: it would render this scene to its own buffer
    // and the grain's SCREEN blend would no longer reach the fight below.
    addGrain(this, 0.06);
    addVignetteOverlay(this, 0.9);
    this.ready = true;
    this.events.once('shutdown', () => { this.ready = false; });
  }

  updateHUD(fighters, roundWins, round, delta) {
    if (!this.ready) return;
    this.hud.update(fighters, roundWins, round, delta);
  }

  // A black band sweeps open across the screen and holds the message.
  band(height, hold, onOpen) {
    const g = this.add.graphics().setDepth(80);
    const cy = GAME_HEIGHT / 2 - 20;
    const state = { h: 0, a: 1 };
    const draw = () => {
      g.clear();
      g.fillStyle(PALETTE.ink, 0.78 * state.a);
      g.fillRect(0, cy - state.h / 2, GAME_WIDTH, state.h);
      g.lineStyle(1, PALETTE.gold, 0.7 * state.a);
      g.lineBetween(0, cy - state.h / 2, GAME_WIDTH, cy - state.h / 2);
      g.lineBetween(0, cy + state.h / 2, GAME_WIDTH, cy + state.h / 2);
    };
    this.tweens.add({ targets: state, h: height, duration: 180, ease: 'Cubic.easeOut', onUpdate: draw, onComplete: onOpen });
    this.tweens.add({
      targets: state, a: 0, h: height * 0.6, delay: hold, duration: 260, ease: 'Quad.easeIn', onUpdate: draw,
      onComplete: () => g.destroy(),
    });
    return cy;
  }

  announceRound(round) {
    const cy = this.band(150, 1250);
    const kicker = this.add.text(GAME_WIDTH / 2, cy - 30, 'ROUND', displayText(16, {
      color: HEX.gold, spacing: 14, weight: '700',
    })).setOrigin(0.5).setDepth(81).setAlpha(0);
    const num = this.add.text(GAME_WIDTH / 2, cy + 14, NUMERALS[round - 1] || String(round), displayText(72, {
      weight: '900', spacing: 10,
    })).setOrigin(0.5).setDepth(81).setAlpha(0).setScale(1.3);
    this.tweens.add({ targets: kicker, alpha: 1, duration: 200, delay: 120 });
    this.tweens.add({ targets: num, alpha: 1, scale: 1, duration: 260, delay: 120, ease: 'Cubic.easeOut' });
    this.tweens.add({
      targets: [kicker, num], alpha: 0, delay: 820, duration: 160, onComplete: () => { kicker.destroy(); num.destroy(); },
    });

    this.time.delayedCall(980, () => this.slam('FIGHT', HEX.crimsonBright, 110, 520));
  }

  // Big word that lands hard.
  slam(word, color, size, hold, opts = {}) {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20 + (opts.dy || 0), word, displayText(size, {
      weight: '900', spacing: opts.spacing ?? 18, color, stroke: '#0a0908', strokeThickness: 8, shadowBlur: 24,
    })).setOrigin(0.5).setDepth(85).setScale(2.4).setAlpha(0);
    const glow = this.add.image(GAME_WIDTH / 2, text.y, 'fx_soft').setDepth(84)
      .setTint(opts.glow ?? PALETTE.crimsonBright).setBlendMode(Phaser.BlendModes.ADD).setScale(14, 5).setAlpha(0);
    this.tweens.add({
      targets: text,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.cameras.main.shake(180, 0.008);
        glow.setAlpha(0.45);
        this.tweens.add({ targets: glow, alpha: 0.15, duration: 400 });
        this.tweens.add({ targets: text, scale: 1.04, duration: hold, ease: 'Sine.easeOut' });
      },
    });
    this.tweens.add({
      targets: [text, glow],
      alpha: 0,
      delay: 200 + hold,
      duration: 240,
      onComplete: () => { text.destroy(); glow.destroy(); },
    });
    return text;
  }

  announceKO() {
    // A crimson cut across the frame, then the word.
    const slash = this.add.graphics().setDepth(83).setBlendMode(Phaser.BlendModes.ADD);
    const s = { t: 0, a: 1 };
    this.tweens.add({
      targets: s,
      t: 1,
      duration: 220,
      ease: 'Expo.easeOut',
      onUpdate: () => {
        slash.clear();
        const x1 = -100 + (GAME_WIDTH + 200) * s.t;
        slash.fillStyle(PALETTE.crimsonBright, s.a);
        slash.fillTriangle(-100, 470, x1, 250 - 6 * s.t, x1, 250 + 6 * s.t);
        slash.fillStyle(0xffffff, s.a * 0.9);
        slash.fillTriangle(-100, 468, x1, 250 - 1.5, x1, 250 + 1.5);
      },
    });
    this.tweens.add({ targets: s, a: 0, delay: 600, duration: 700, onUpdate: () => slash.setAlpha(s.a), onComplete: () => slash.destroy() });
    this.time.delayedCall(140, () => this.slam('K.O.', HEX.bone, 150, 1100, { spacing: 24 }));
  }

  announceRoundWinner(name, round) {
    this.time.delayedCall(1500, () => {
      const cy = this.band(110, 900);
      const t = this.add.text(GAME_WIDTH / 2, cy, `${name.toUpperCase()} TAKES ROUND ${NUMERALS[round - 1] || round}`, displayText(26, {
        weight: '900', spacing: 8,
      })).setOrigin(0.5).setDepth(81).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 200, delay: 100 });
      this.tweens.add({ targets: t, alpha: 0, delay: 950, duration: 200, onComplete: () => t.destroy() });
    });
  }

  announceVictory(name, playerIndex, flawless) {
    this.time.delayedCall(1500, () => {
      const cy = this.band(190, 2200);
      const kicker = this.add.text(GAME_WIDTH / 2, cy - 54, flawless ? 'FLAWLESS' : 'VICTORY', displayText(16, {
        color: flawless ? HEX.gold : PLAYER_HEX[playerIndex], weight: '700', spacing: 14,
      })).setOrigin(0.5).setDepth(81).setAlpha(0);
      const n = this.add.text(GAME_WIDTH / 2, cy, name.toUpperCase(), displayText(64, {
        weight: '900', spacing: 12,
      })).setOrigin(0.5).setDepth(81).setAlpha(0).setScale(1.2);
      const sub = this.add.text(GAME_WIDTH / 2, cy + 56, 'stands victorious', bodyText(22, { italic: true, color: HEX.bone }))
        .setOrigin(0.5).setDepth(81).setAlpha(0);
      this.tweens.add({ targets: kicker, alpha: 1, duration: 300, delay: 150 });
      this.tweens.add({ targets: n, alpha: 1, scale: 1, duration: 420, delay: 200, ease: 'Expo.easeOut' });
      this.tweens.add({ targets: sub, alpha: 1, duration: 400, delay: 500 });
    });
  }

  showCombo(playerIndex, count) {
    const prev = this.combo[playerIndex];
    if (prev) { this.tweens.killTweensOf(prev.container); prev.container.destroy(); }
    const left = playerIndex === 0;
    const x = left ? 48 : GAME_WIDTH - 48;
    const container = this.add.container(x, 170).setDepth(70);
    const num = this.add.text(0, 0, String(count), displayText(64, {
      weight: '900', spacing: 0, color: HEX.bone, stroke: '#0a0908', strokeThickness: 6,
    })).setOrigin(left ? 0 : 1, 0.5);
    const label = this.add.text(left ? num.width + 8 : -num.width - 8, 8, 'HITS', displayText(16, {
      weight: '900', spacing: 6, color: HEX.crimsonBright,
    })).setOrigin(left ? 0 : 1, 0.5);
    const bar = this.add.rectangle(left ? 0 : 0, 40, 120, 3, PALETTE.crimsonBright).setOrigin(left ? 0 : 1, 0.5);
    container.add([num, label, bar]);
    container.setScale(1.5);
    this.tweens.add({ targets: container, scale: 1, duration: 160, ease: 'Back.easeOut' });
    this.tweens.add({ targets: bar, scaleX: 0, duration: 1300, ease: 'Linear' });
    this.tweens.add({
      targets: container, alpha: 0, x: x + (left ? -20 : 20), delay: 1300, duration: 250,
      onComplete: () => { container.destroy(); if (this.combo[playerIndex]?.container === container) this.combo[playerIndex] = null; },
    });
    this.combo[playerIndex] = { container };
  }

  announceSpecial(name, playerIndex) {
    const left = playerIndex === 0;
    const y = 128;
    const text = this.add.text(left ? -20 : GAME_WIDTH + 20, y, name.toUpperCase(), displayText(30, {
      weight: '900', spacing: 10, color: HEX.gold, stroke: '#0a0908', strokeThickness: 6,
    })).setOrigin(left ? 0 : 1, 0.5).setDepth(75);
    const x = left ? 92 : GAME_WIDTH - 92;
    this.tweens.add({ targets: text, x, duration: 220, ease: 'Expo.easeOut' });
    this.tweens.add({ targets: text, alpha: 0, delay: 900, duration: 300, onComplete: () => text.destroy() });
  }
}
