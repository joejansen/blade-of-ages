import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';

const WARRIORS = ['knight', 'samurai', 'viking', 'gladiator', 'mongol',
                   'spartan', 'pirate', 'zulu', 'conquistador', 'seal'];
const PARTS = ['head', 'torso', 'upper_arm', 'lower_arm',
               'upper_leg', 'lower_leg', 'weapon'];
const ARENAS = ['castle', 'dojo', 'longship', 'colosseum', 'steppe',
                'thermopylae', 'dock', 'savanna', 'temple', 'carrier'];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Loading bar background
    const barW = 400;
    const barH = 24;
    const barX = (GAME_WIDTH - barW) / 2;
    const barY = GAME_HEIGHT / 2 + 20;

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'BLADE OF AGES', {
      fontSize: '32px',
      fontFamily: 'Georgia, serif',
      color: '#ffd700',
    }).setOrigin(0.5);

    const loadingText = this.add.text(GAME_WIDTH / 2, barY - 20, 'Loading warriors...', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#a1887f',
    }).setOrigin(0.5);

    // Bar outline
    const barOutline = this.add.rectangle(GAME_WIDTH / 2, barY + barH / 2, barW, barH)
      .setStrokeStyle(2, 0xffd700);

    // Progress fill
    const progressBar = this.add.rectangle(barX, barY, 0, barH, 0xffd700).setOrigin(0, 0);

    this.load.on('progress', (value) => {
      progressBar.width = barW * value;
    });

    this.load.on('complete', () => {
      loadingText.setText('Ready!');
    });

    // Load all warrior body part sprites
    for (const warrior of WARRIORS) {
      for (const part of PARTS) {
        const key = `warrior_${warrior}_${part}`;
        const path = `assets/warriors/${warrior}/${part}.png`;
        this.load.image(key, path);
      }
    }

    // Load arena backgrounds
    for (const arena of ARENAS) {
      this.load.image(`arena_${arena}`, `assets/arenas/${arena}.jpg`);
    }
  }

  create() {
    // Count how many textures loaded successfully
    let loaded = 0;
    let missing = 0;
    for (const warrior of WARRIORS) {
      for (const part of PARTS) {
        const key = `warrior_${warrior}_${part}`;
        if (this.textures.exists(key) && this.textures.get(key).key !== '__MISSING') {
          loaded++;
        } else {
          missing++;
        }
      }
    }

    if (missing > 0) {
      console.log(`Loaded ${loaded}/${loaded + missing} warrior sprites (${missing} missing — using placeholders)`);
    }

    this.scene.start('Title');
  }
}
