import Phaser from 'phaser';
import { Fighter } from '../fighters/Fighter.js';
import { CombatManager } from '../combat/CombatManager.js';
import { InputManager } from '../combat/InputManager.js';
import { AIController } from '../ai/AIController.js';
import { HUD } from '../ui/HUD.js';
import { SoundManager } from '../audio/SoundManager.js';
import { drawArena } from '../art/arenas.js';
import { getWarriorById } from '../config/warriors.js';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_Y,
  ROUNDS_TO_WIN,
  ROUND_START_DELAY,
  ROUND_END_DELAY,
} from '../config/constants.js';

export class FightScene extends Phaser.Scene {
  constructor() {
    super('Fight');
  }

  init(data) {
    this.matchData = {
      mode: data.mode || '1p',            // '1p' or '2p'
      warrior1Id: data.warrior1 || 'knight',
      warrior2Id: data.warrior2 || 'samurai',
      arenaId: data.arena || 'castle',
    };
  }

  create() {
    const { mode, warrior1Id, warrior2Id, arenaId } = this.matchData;

    // Draw arena background
    drawArena(this, arenaId);

    // Draw ground line
    const groundLine = this.add.graphics();
    groundLine.lineStyle(2, 0x000000, 0.3);
    groundLine.beginPath();
    groundLine.moveTo(0, GROUND_Y);
    groundLine.lineTo(GAME_WIDTH, GROUND_Y);
    groundLine.stroke();
    groundLine.setDepth(5);

    // Set world bounds
    this.physics.world.setBounds(30, 0, GAME_WIDTH - 60, GROUND_Y);

    // Create fighters
    const w1Config = getWarriorById(warrior1Id);
    const w2Config = getWarriorById(warrior2Id);

    this.fighter1 = new Fighter(this, 300, GROUND_Y, w1Config, 0, true);
    this.fighter2 = new Fighter(this, GAME_WIDTH - 300, GROUND_Y, w2Config, 1, false);

    // Input
    this.input1 = new InputManager(this, 0);
    if (mode === '2p') {
      this.input2 = new InputManager(this, 1);
    } else {
      this.aiController = new AIController(w2Config);
    }

    // Combat system
    this.combatManager = new CombatManager(this);

    // HUD
    this.hud = new HUD(this, w1Config, w2Config);

    // Round tracking
    this.roundWins = [0, 0];
    this.currentRound = 1;
    this.roundState = 'starting'; // starting, fighting, roundEnd, matchEnd
    this.roundTimer = ROUND_START_DELAY;
    this.roundTime = 0;

    // Show round announcement
    this.showRoundAnnouncement(`Round ${this.currentRound}`, 'FIGHT!');

    // Capture keyboard events for game input
    this.input.keyboard.enableGlobalCapture();

    // Clean up when scene shuts down
    this.events.on('shutdown', this.cleanUp, this);
  }

  update(time, delta) {
    // Round state management
    switch (this.roundState) {
      case 'starting':
        this.roundTimer -= delta;
        if (this.roundTimer <= 0) {
          this.roundState = 'fighting';
        }
        return;

      case 'fighting':
        this.updateFighting(time, delta);
        break;

      case 'roundEnd':
        this.roundTimer -= delta;
        this.fighter1.update(time, delta);
        this.fighter2.update(time, delta);
        if (this.roundTimer <= 0) {
          this.startNextRound();
        }
        return;

      case 'matchEnd':
        this.roundTimer -= delta;
        this.fighter1.update(time, delta);
        this.fighter2.update(time, delta);
        if (this.roundTimer <= 0) {
          this.endMatch();
        }
        return;
    }
  }

  updateFighting(time, delta) {
    // Process input for player 1
    const p1Input = this.input1.getInput();
    this.fighter1.handleInput(p1Input);
    this.fighter1.handleInputRelease(p1Input);

    // Process input for player 2 (human or AI)
    if (this.input2) {
      const p2Input = this.input2.getInput();
      this.fighter2.handleInput(p2Input);
      this.fighter2.handleInputRelease(p2Input);
    } else {
      const aiState = {
        self: this.fighter2,
        opponent: this.fighter1,
        distance: Math.abs(this.fighter1.x - this.fighter2.x),
        opponentAttacking: this.fighter1.isAttacking(),
        delta,
      };
      const aiInput = this.aiController.getInput(aiState);
      this.fighter2.handleInput(aiInput);
      this.fighter2.handleInputRelease(aiInput);
    }

    // Combat hit detection (may trigger hitstop)
    const paused = this.combatManager.update(this.fighter1, this.fighter2, delta);

    // Update fighters (skip during hitstop)
    if (!paused) {
      this.fighter1.update(time, delta);
      this.fighter2.update(time, delta);
    } else {
      // Still draw during hitstop
      this.fighter1.draw();
      this.fighter2.draw();
    }

    // Auto-face opponent
    if (this.fighter1.isActionable()) {
      this.fighter1.facingRight = this.fighter2.x > this.fighter1.x;
    }
    if (this.fighter2.isActionable()) {
      this.fighter2.facingRight = this.fighter1.x > this.fighter2.x;
    }

    // Update HUD
    this.hud.update(this.fighter1, this.fighter2, this.roundWins, this.currentRound);

    // Track round time
    this.roundTime += delta;

    // Check for round end
    if (!this.fighter1.isAlive() || !this.fighter2.isAlive()) {
      this.endRound();
    }
  }

  endRound() {
    const winner = this.fighter1.isAlive() ? 0 : 1;
    this.roundWins[winner]++;

    if (this.roundWins[winner] >= ROUNDS_TO_WIN) {
      // Match over
      this.roundState = 'matchEnd';
      this.roundTimer = ROUND_END_DELAY + 500;

      const winnerFighter = winner === 0 ? this.fighter1 : this.fighter2;
      const loserFighter = winner === 0 ? this.fighter2 : this.fighter1;
      winnerFighter.enterState('victory');
      loserFighter.enterState('defeated');

      const winnerConfig = winner === 0
        ? getWarriorById(this.matchData.warrior1Id)
        : getWarriorById(this.matchData.warrior2Id);
      this.showRoundAnnouncement(`${winnerConfig.name}`, 'WINS!');
      SoundManager.playCombat(this, 'victory');
    } else {
      this.roundState = 'roundEnd';
      this.roundTimer = ROUND_END_DELAY;

      const winnerFighter = winner === 0 ? this.fighter1 : this.fighter2;
      winnerFighter.enterState('victory');

      this.showRoundAnnouncement('', `Round ${this.currentRound} Over`);
    }
  }

  startNextRound() {
    this.currentRound++;
    this.roundState = 'starting';
    this.roundTimer = ROUND_START_DELAY;
    this.roundTime = 0;

    // Reset fighters for new round
    this.fighter1.resetForRound(300, true);
    this.fighter2.resetForRound(GAME_WIDTH - 300, false);

    if (this.aiController) {
      this.aiController.reset();
    }

    this.showRoundAnnouncement(`Round ${this.currentRound}`, 'FIGHT!');
  }

  endMatch() {
    const winner = this.roundWins[0] >= ROUNDS_TO_WIN ? 0 : 1;
    const winnerConfig = winner === 0
      ? getWarriorById(this.matchData.warrior1Id)
      : getWarriorById(this.matchData.warrior2Id);

    this.scene.start('Result', {
      winner,
      winnerName: winnerConfig.name,
      roundWins: this.roundWins,
      stats: [this.fighter1.stats, this.fighter2.stats],
      roundTime: this.roundTime,
      matchData: this.matchData,
    });
  }

  showRoundAnnouncement(line1, line2) {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2 - 50;

    if (line1) {
      const text1 = this.add.text(centerX, centerY - 30, line1, {
        fontSize: '36px',
        fontFamily: 'Georgia, serif',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(100);

      this.tweens.add({
        targets: text1,
        alpha: 0,
        y: centerY - 60,
        delay: 1000,
        duration: 500,
        onComplete: () => text1.destroy(),
      });
    }

    const text2 = this.add.text(centerX, centerY + 20, line2, {
      fontSize: '52px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(100).setScale(0.5);

    this.tweens.add({
      targets: text2,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: text2,
      alpha: 0,
      delay: 1200,
      duration: 400,
      onComplete: () => text2.destroy(),
    });
  }

  cleanUp() {
    this.fighter1?.destroy();
    this.fighter2?.destroy();
    this.input1?.destroy();
    this.input2?.destroy();
    this.combatManager?.destroy();
    this.hud?.destroy();
  }
}
