import Phaser from 'phaser';
import { Fighter } from '../fighters/Fighter.js';
import { DebugOverlay } from '../fighters/DebugOverlay.js';
import { CombatManager } from '../combat/CombatManager.js';
import { InputManager } from '../combat/InputManager.js';
import { AIController } from '../ai/AIController.js';
import { SoundManager } from '../audio/SoundManager.js';
import { ArenaRenderer } from '../art/ArenaRenderer.js';
import { CameraRig } from '../fx/CameraRig.js';
import { fadeIn, transitionTo } from '../ui/theme.js';
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
    fadeIn(this, 300);

    this.arenaRenderer = new ArenaRenderer(this, arenaId);
    this.cameraRig = new CameraRig(this);
    this.slowmo = 1;

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

    // HUD runs as an overlay scene so it ignores the fight camera.
    this.w1Config = w1Config;
    this.w2Config = w2Config;
    this.scene.launch('FightHUD', { warrior1Config: w1Config, warrior2Config: w2Config });
    this.hudScene = this.scene.get('FightHUD');
    this.scene.bringToTop('FightHUD');

    this.events.on('fighter-special', this.onSpecial, this);
    this.events.on('fighter-front', (f) => {
      f.renderer.setDepthBase?.(13.5);
      const other = f === this.fighter1 ? this.fighter2 : this.fighter1;
      other.renderer.setDepthBase?.(12);
    });

    // Debug overlay (F1 to toggle)
    this.debugOverlay = new DebugOverlay(this);
    this.input.keyboard.on('keydown-F1', () => {
      this.debugOverlay.setEnabled(!this.debugOverlay.isEnabled());
    });

    // Round tracking
    this.roundWins = [0, 0];
    this.currentRound = 1;
    this.roundState = 'starting'; // starting, fighting, roundEnd, matchEnd
    this.roundTimer = ROUND_START_DELAY;
    this.roundTime = 0;

    // Wait a frame for the HUD scene to come up before announcing.
    this.time.delayedCall(60, () => this.hudScene.announceRound(this.currentRound));

    // Capture keyboard events for game input
    this.input.keyboard.enableGlobalCapture();

    // Clean up when scene shuts down
    this.events.once('shutdown', this.cleanUp, this);
  }

  update(time, delta) {
    this.arenaRenderer?.update(time, delta, (this.fighter1.x + this.fighter2.x) / 2);
    this.cameraRig.update(delta, this.fighter1, this.fighter2);
    // Slow motion applies to the fighters and physics, not to the camera.
    const simDelta = delta * this.slowmo;

    // Round state management
    switch (this.roundState) {
      case 'starting':
        this.roundTimer -= delta;
        this.fighter1.draw();
        this.fighter2.draw();
        if (this.roundTimer <= 0) {
          this.roundState = 'fighting';
        }
        break;

      case 'fighting':
        this.updateFighting(time, delta);
        break;

      case 'roundEnd':
      case 'matchEnd':
        this.roundTimer -= delta;
        // The killing blow's hitstop is still running; let it finish (and
        // restore gravity/knockback) before the fighters move again.
        if (this.combatManager.tickHitstop(delta)) {
          this.fighter1.draw();
          this.fighter2.draw();
        } else {
          this.fighter1.update(time, simDelta);
          this.fighter2.update(time, simDelta);
        }
        if (this.roundTimer <= 0) {
          if (this.roundState === 'roundEnd') this.startNextRound();
          else this.endMatch();
        }
        break;
    }

    this.hudScene?.updateHUD?.([this.fighter1, this.fighter2], this.roundWins, this.currentRound, delta);

    this.drawDebugOverlay();
  }

  drawDebugOverlay() {
    if (!this.debugOverlay?.isEnabled()) {
      this.debugOverlay?.clear();
      return;
    }
    this.debugOverlay.clear();
    if (this.fighter1) this.debugOverlay.drawFighter(this.fighter1);
    if (this.fighter2) this.debugOverlay.drawFighter(this.fighter2);
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

    const winnerFighter = winner === 0 ? this.fighter1 : this.fighter2;
    const loserFighter = winner === 0 ? this.fighter2 : this.fighter1;
    const winnerConfig = winner === 0 ? this.w1Config : this.w2Config;
    const flawless = winnerFighter.hp >= winnerFighter.maxHp;

    this.playKnockout(loserFighter);

    if (this.roundWins[winner] >= ROUNDS_TO_WIN) {
      this.roundState = 'matchEnd';
      this.roundTimer = ROUND_END_DELAY + 2600;
      this.time.delayedCall(900, () => winnerFighter.enterState('victory'));
      loserFighter.enterState('defeated');
      this.hudScene.announceVictory(winnerConfig.name, winner, flawless);
      this.time.delayedCall(1400, () => {
        SoundManager.playCombat(this, 'victory');
        this.cameraRig.focus(winnerFighter.x, winnerFighter.y - 90, 1.8, 2600);
      });
    } else {
      this.roundState = 'roundEnd';
      this.roundTimer = ROUND_END_DELAY + 1400;
      this.time.delayedCall(900, () => winnerFighter.enterState('victory'));
      this.hudScene.announceRoundWinner(winnerConfig.name, this.currentRound);
    }
  }

  // The KO beat: slow motion, the world drains to black-and-white, the
  // camera closes on the fallen, then colour and time return.
  playKnockout(loser) {
    this.hudScene.announceKO();
    this.cameraRig.focus(loser.x, loser.y - 70, 1.75, 1300);
    this.setSlowmo(0.25);
    this.tweenGrade(1, 160);
    this.arenaRenderer.setDim(0.35, 160);
    this.time.delayedCall(1300, () => {
      this.setSlowmo(1);
      this.tweenGrade(0, 700);
      this.arenaRenderer.setDim(0, 700);
    });
  }

  onSpecial(fighter) {
    const config = fighter === this.fighter1 ? this.w1Config : this.w2Config;
    this.hudScene.announceSpecial(config.special.name, fighter.playerIndex);
    this.arenaRenderer.setDim(0.6, 120);
    this.cameraRig.focus(fighter.x, fighter.y - 80, 1.7, 420);
    this.cameras.main.flash(90, 255, 220, 160);
    const burst = this.add.image(fighter.x, fighter.y - 60, 'fx_ring').setDepth(11)
      .setBlendMode(Phaser.BlendModes.ADD).setTint(fighter.profile.fx.specialGlow).setScale(0.3);
    this.tweens.add({ targets: burst, scale: 3.2, alpha: 0, duration: 500, ease: 'Cubic.easeOut', onComplete: () => burst.destroy() });
    this.time.delayedCall(620, () => this.arenaRenderer.setDim(0, 300));
  }

  setSlowmo(factor) {
    this.slowmo = factor;
    // Arcade timeScale is inverse: 4 = quarter speed.
    if (this.physics.world) this.physics.world.timeScale = 1 / factor;
  }

  // Drain the arena toward black-and-white (amount 0..1); the fighters
  // keep their colour. Camera postFX would be simpler but misaligns under
  // camera zoom in Phaser 3.90.
  tweenGrade(target, duration) {
    this.gradeState = this.gradeState || { k: 0 };
    this.tweens.killTweensOf(this.gradeState);
    this.tweens.add({
      targets: this.gradeState,
      k: target,
      duration,
      onUpdate: () => this.arenaRenderer.setDrain(this.gradeState.k),
    });
  }

  startNextRound() {
    this.currentRound++;
    this.roundState = 'starting';
    this.roundTimer = ROUND_START_DELAY;
    this.roundTime = 0;
    this.setSlowmo(1);
    this.cameraRig.reset();

    // Reset fighters for new round
    this.fighter1.resetForRound(300, true);
    this.fighter2.resetForRound(GAME_WIDTH - 300, false);
    this.hudScene.hud?.resetRound();

    if (this.aiController) {
      this.aiController.reset();
    }

    this.hudScene.announceRound(this.currentRound);
  }

  endMatch() {
    const winner = this.roundWins[0] >= ROUNDS_TO_WIN ? 0 : 1;
    const winnerConfig = winner === 0 ? this.w1Config : this.w2Config;

    transitionTo(this, 'Result', {
      winner,
      winnerName: winnerConfig.name,
      roundWins: this.roundWins,
      stats: [this.fighter1.stats, this.fighter2.stats],
      roundTime: this.roundTime,
      matchData: this.matchData,
    });
  }

  onCombo(playerIndex, count) {
    this.hudScene.showCombo(playerIndex, count);
  }

  cleanUp() {
    // The physics world is already torn down by now and is rebuilt (at
    // normal time scale) on the next start, so slow-mo needs no reset here.
    this.scene.stop('FightHUD');
    this.events.off('fighter-special', this.onSpecial, this);
    this.events.off('fighter-front');
    this.arenaRenderer?.destroy();
    this.fighter1?.destroy();
    this.fighter2?.destroy();
    this.input1?.destroy();
    this.input2?.destroy();
    this.combatManager?.destroy();
    this.debugOverlay?.destroy();
  }
}
