import Phaser from 'phaser';
import {
  HITSTOP_DURATION_LIGHT,
  HITSTOP_DURATION_HEAVY,
} from '../config/constants.js';
import { SoundManager } from '../audio/SoundManager.js';

export class CombatManager {
  constructor(scene) {
    this.scene = scene;
    this.hitstopTimer = 0;
    this.isPaused = false;
    this.sparkEmitters = [];
  }

  update(fighter1, fighter2, delta) {
    if (this.tickHitstop(delta)) return true; // Signal that combat is paused

    // Check attacks both directions
    this.checkAttack(fighter1, fighter2);
    this.checkAttack(fighter2, fighter1);

    return false;
  }

  checkAttack(attacker, defender) {
    if (!attacker.isAttacking() || attacker.hasHitThisAttack) return;
    if (!defender.isAlive()) return;

    const attackBox = attacker.getAttackHitbox();
    if (!attackBox) return;

    const defenderBox = defender.getHitbox();
    if (!this.boxesOverlap(attackBox, defenderBox)) return;

    // Hit confirmed
    attacker.hasHitThisAttack = true;
    const damage = attacker.getAttackDamage();
    const isHeavy = attacker.state === 'heavyAttack';
    const isSpecial = attacker.state === 'special';
    const defenderWasStunned = defender.state === 'hit';

    const result = defender.takeDamage(damage, attacker.x, isHeavy, isSpecial);

    // Attacker gains special meter
    attacker.addSpecialMeter(result.actualDamage);
    attacker.stats.hitsLanded++;
    attacker.stats.damageDealt += result.actualDamage;

    // A hit that lands while the defender is still reeling extends the combo.
    if (!result.wasBlocked) {
      attacker.combo = defenderWasStunned ? (attacker.combo || 1) + 1 : 1;
      if (attacker.combo >= 2) this.scene.onCombo?.(attacker.playerIndex, attacker.combo);
    }

    // Visual effects
    const hitX = (attackBox.x + attackBox.width / 2 + defenderBox.x + defenderBox.width / 2) / 2;
    const hitY = attackBox.y + attackBox.height / 2;
    const dir = attacker.x < defender.x ? 1 : -1;
    const rig = this.scene.cameraRig;
    const isBig = isHeavy || isSpecial;
    const isLethal = !defender.isAlive();

    if (result.wasBlocked) {
      SoundManager.playCombat(this.scene, 'block');
      this.spawnBlockSparks(hitX, hitY, dir);
      rig?.punch(0.012);
      this.scene.cameras.main.shake(70, 0.002);
    } else {
      SoundManager.playCombat(this.scene, 'hit');
      this.spawnHitSparks(hitX, hitY, isBig || isLethal, dir, attacker.profile.fx.trailColor);
      defender.flash();
      rig?.punch(isLethal ? 0.12 : isBig ? 0.06 : 0.025);
      this.scene.cameras.main.shake(isBig ? 170 : 90, isBig ? 0.009 : 0.004);
    }

    // Hitstop (freeze frame); a killing blow holds longest.
    if (isLethal) {
      this.startHitstop(attacker, defender, HITSTOP_DURATION_HEAVY * 2.2);
    } else if (isBig) {
      this.startHitstop(attacker, defender, HITSTOP_DURATION_HEAVY);
    } else if (!result.wasBlocked) {
      this.startHitstop(attacker, defender, HITSTOP_DURATION_LIGHT);
    }
  }

  // Advances an active hitstop; returns true while still frozen.
  tickHitstop(delta) {
    if (this.hitstopTimer <= 0) return false;
    this.hitstopTimer -= delta;
    if (this.hitstopTimer <= 0) {
      this.hitstopTimer = 0;
      this.resumeFromHitstop();
      return false;
    }
    return true;
  }

  startHitstop(attacker, defender, duration) {
    this.hitstopTimer = duration;
    this.isPaused = true;
    // Freeze both fighters, remembering the defender's knockback so the
    // blow still sends them back once time resumes.
    this.storedKnockback = {
      x: defender.sprite.body.velocity.x,
      y: defender.sprite.body.velocity.y,
    };
    attacker.sprite.body.setVelocity(0, 0);
    attacker.sprite.body.setAllowGravity(false);
    defender.sprite.body.setVelocity(0, 0);
    defender.sprite.body.setAllowGravity(false);
    this.frozenAttacker = attacker;
    this.frozenDefender = defender;
  }

  resumeFromHitstop() {
    this.isPaused = false;
    // Re-enable gravity for both fighters in the scene
    if (this.frozenAttacker) {
      this.frozenAttacker.sprite.body.setAllowGravity(true);
    }
    if (this.frozenDefender) {
      this.frozenDefender.sprite.body.setAllowGravity(true);
      if (this.storedKnockback) {
        this.frozenDefender.sprite.body.setVelocity(this.storedKnockback.x, this.storedKnockback.y);
      }
    }
    this.storedKnockback = null;
    this.frozenAttacker = null;
    this.frozenDefender = null;
  }

  // Impact: white flash, a cut mark across the contact point, sparks thrown
  // away from the attacker, ink-red droplets that fall to the floor, and a
  // shockwave ring for heavy blows.
  spawnHitSparks(x, y, isBig, dir, trailColor = 0xffffff) {
    const scene = this.scene;
    const ADD = Phaser.BlendModes.ADD;

    const flash = scene.add.image(x, y, 'fx_soft').setDepth(21).setBlendMode(ADD)
      .setScale(isBig ? 3.2 : 2).setAlpha(1);
    scene.tweens.add({ targets: flash, scale: isBig ? 5 : 3, alpha: 0, duration: 140, onComplete: () => flash.destroy() });

    // The cut.
    const angle = (dir > 0 ? -0.5 : 0.5) + (Math.random() - 0.5) * 0.5;
    const cutLen = isBig ? 3.4 : 2.2;
    const cutGlow = scene.add.image(x, y, 'fx_streak').setDepth(20).setBlendMode(ADD)
      .setTint(0xe0283f).setRotation(angle).setScale(0.2, isBig ? 2.2 : 1.6).setOrigin(0.5);
    const cut = scene.add.image(x, y, 'fx_streak').setDepth(21).setBlendMode(ADD)
      .setTint(trailColor).setRotation(angle).setScale(0.2, isBig ? 0.9 : 0.7).setOrigin(0.5);
    scene.tweens.add({ targets: [cut, cutGlow], scaleX: cutLen, duration: 70, ease: 'Expo.easeOut' });
    scene.tweens.add({
      targets: [cut, cutGlow], alpha: 0, scaleY: 0.1, delay: 70, duration: 220,
      onComplete: () => { cut.destroy(); cutGlow.destroy(); },
    });

    // Sparks.
    const count = isBig ? 14 : 8;
    for (let i = 0; i < count; i++) {
      const a = (dir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 2.2;
      const speed = (isBig ? 320 : 220) * (0.5 + Math.random());
      const spark = scene.add.image(x, y, 'fx_streak').setDepth(21).setBlendMode(ADD)
        .setRotation(a).setScale(0.35 + Math.random() * 0.4, 0.5)
        .setTint(Phaser.Utils.Array.GetRandom([0xffffff, 0xffe2a0, 0xffb060]));
      scene.tweens.add({
        targets: spark,
        x: x + Math.cos(a) * speed * 0.28,
        y: y + Math.sin(a) * speed * 0.28 + 12,
        scaleX: 0.05,
        alpha: 0,
        duration: 220 + Math.random() * 160,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      });
    }

    // Droplets.
    const drops = scene.add.particles(x, y, 'fx_drop', {
      speed: { min: 120, max: isBig ? 420 : 300 },
      angle: dir > 0 ? { min: -70, max: 20 } : { min: 160, max: 250 },
      gravityY: 1100,
      lifespan: { min: 380, max: 720 },
      scale: { start: isBig ? 0.75 : 0.55, end: 0.15 },
      tint: [0xb3122a, 0x7a0a18, 0xe0283f],
      alpha: { start: 1, end: 0.6 },
      emitting: false,
    }).setDepth(19);
    drops.explode(isBig ? 22 : 10);
    scene.time.delayedCall(900, () => drops.destroy());

    if (isBig) {
      const ring = scene.add.image(x, y, 'fx_ring').setDepth(20).setBlendMode(ADD)
        .setScale(0.3).setTint(0xffe2c0);
      scene.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 320, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    }
  }

  // Steel on steel: cold sparks bursting upward, a tight ring.
  spawnBlockSparks(x, y, dir) {
    const scene = this.scene;
    const ADD = Phaser.BlendModes.ADD;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (dir > 0 ? -0.6 : 0.6) + (Math.random() - 0.5) * 1.8;
      const speed = 160 + Math.random() * 160;
      const spark = scene.add.image(x, y, 'fx_streak').setDepth(21).setBlendMode(ADD)
        .setRotation(a).setScale(0.4, 0.45).setTint(Phaser.Utils.Array.GetRandom([0xbfe4ff, 0xffffff, 0x9cc4e4]));
      scene.tweens.add({
        targets: spark,
        x: x + Math.cos(a) * speed * 0.25,
        y: y + Math.sin(a) * speed * 0.25,
        scaleX: 0.05,
        alpha: 0,
        duration: 200 + Math.random() * 120,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
    const ring = scene.add.image(x, y, 'fx_ring').setDepth(20).setBlendMode(ADD)
      .setScale(0.2).setTint(0x9cc4e4);
    scene.tweens.add({ targets: ring, scale: 1.1, alpha: 0, duration: 220, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    const flash = scene.add.image(x, y, 'fx_soft').setDepth(21).setBlendMode(ADD).setScale(1.6).setTint(0xcfe8ff);
    scene.tweens.add({ targets: flash, alpha: 0, scale: 2.4, duration: 120, onComplete: () => flash.destroy() });
  }

  boxesOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  destroy() {
    // Cleanup
  }
}
