import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { ModeSelectScene } from './scenes/ModeSelectScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { ArenaSelectScene } from './scenes/ArenaSelectScene.js';
import { FightScene } from './scenes/FightScene.js';
import { ResultScene } from './scenes/ResultScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: document.body,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
    ModeSelectScene,
    CharacterSelectScene,
    ArenaSelectScene,
    FightScene,
    ResultScene,
  ],
};

window.__game = new Phaser.Game(config);
