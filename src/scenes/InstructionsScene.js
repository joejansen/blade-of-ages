import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super('Instructions');
  }

  create() {
    // Dynamic background matching other scenes
    const bgArena = 'arena_castle'; 
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgArena);
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setTint(0x333333); 

    // Header Background
    this.add.rectangle(GAME_WIDTH / 2, 60, GAME_WIDTH, 70, 0x000000, 0.7);

    // Header
    this.add.text(GAME_WIDTH / 2, 60, 'HOW TO PLAY', {
      fontSize: '42px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Control Panels side-by-side
    const p1X = GAME_WIDTH / 2 - 200;
    const p2X = GAME_WIDTH / 2 + 200;
    const panelY = 280;

    this.createControlPanel(p1X, panelY, 'PLAYER 1', '#1565c0', {
      Move: 'A / D',
      Jump: 'W',
      Block: 'S',
      Light: 'F',
      Heavy: 'G',
      Special: 'H'
    });

    this.createControlPanel(p2X, panelY, 'PLAYER 2', '#c62828', {
      Move: 'Left/Right Arrows',
      Jump: 'Up Arrow',
      Block: 'Down Arrow',
      Light: 'K',
      Heavy: 'L',
      Special: 'Enter / ;'
    });

    // Combo / Combat Mechanics section at bottom
    const infoBg = this.add.rectangle(GAME_WIDTH / 2, 490, 640, 100, 0x000000, 0.8)
      .setStrokeStyle(2, 0x888888);
    
    this.add.text(GAME_WIDTH / 2, 465, 'COMBAT TIPS', {
      fontSize: '20px', fontFamily: 'Impact, sans-serif', color: '#ffcc00'
    }).setOrigin(0.5);

    const tipsText = "• Light attacks are fast but deal less damage.\n• Heavy attacks are slow but break guards and deal huge damage.\n• Build your Special Meter by landing hits to unleash your ultimate attack!\n• You can perform combat moves while jumping in the air for aerial dominance.";
    this.add.text(GAME_WIDTH / 2, 510, tipsText, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#dddddd', align: 'center', lineSpacing: 5
    }).setOrigin(0.5);

    // Back hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'ESC TO RETURN', {
      fontSize: '18px',
      fontFamily: 'Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('Title');
    });
  }

  createControlPanel(x, y, title, color, controls) {
    const w = 340;
    const h = 260;
    
    this.add.rectangle(x, y, w, h, 0x111111, 0.9)
      .setStrokeStyle(3, parseInt(color.replace('#',''), 16));

    this.add.rectangle(x, y - h/2 + 25, w, 50, parseInt(color.replace('#',''), 16), 0.8);
    
    this.add.text(x, y - h/2 + 25, title, {
      fontSize: '24px', fontFamily: 'Impact, sans-serif', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    let startY = y - 60;
    for (const [action, key] of Object.entries(controls)) {
      this.add.text(x - 130, startY, action + ':', {
        fontSize: '16px', fontFamily: 'Georgia, serif', color: '#aaaaaa'
      }).setOrigin(0, 0.5);
      
      this.add.text(x + 130, startY, key, {
        fontSize: '16px', fontFamily: 'Impact, sans-serif', color: '#ffcc00'
      }).setOrigin(1, 0.5);
      
      startY += 30;
    }
  }
}
