import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { InstructionsScene } from './scenes/InstructionsScene.js';
import { ModeSelectScene } from './scenes/ModeSelectScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { ArenaSelectScene } from './scenes/ArenaSelectScene.js';
import { VersusScene } from './scenes/VersusScene.js';
import { FightScene } from './scenes/FightScene.js';
import { FightHUDScene } from './scenes/FightHUDScene.js';
import { ResultScene } from './scenes/ResultScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: document.body,
  backgroundColor: '#0a0908',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    roundPixels: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    TitleScene,
    InstructionsScene,
    ModeSelectScene,
    CharacterSelectScene,
    ArenaSelectScene,
    VersusScene,
    FightScene,
    FightHUDScene,
    ResultScene,
  ],
};

// Phaser rasterises text to canvas once, so the web fonts must be ready
// before the first scene draws. Cap the wait so an offline load still boots
// (falling back to Georgia).
async function waitForFonts() {
  if (!document.fonts?.load) return;
  const faces = [
    '900 48px "Cinzel"',
    '700 48px "Cinzel"',
    '500 48px "Cinzel"',
    '500 24px "Cormorant Garamond"',
    'italic 500 24px "Cormorant Garamond"',
    '600 24px "Cormorant Garamond"',
  ];
  const timeout = new Promise(resolve => setTimeout(resolve, 2500));
  await Promise.race([Promise.all(faces.map(f => document.fonts.load(f))), timeout]);
}

waitForFonts().finally(() => {
  window.__game = new Phaser.Game(config);
});
