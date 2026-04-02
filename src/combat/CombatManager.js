import Phaser from 'phaser';
import {
  HITSTOP_DURATION_LIGHT,
  HITSTOP_DURATION_HEAVY,
} from '../config/constants.js';

export class CombatManager {
  constructor(scene) {
    this.scene = scene;
    this.hitstopTimer = 0;
    this.isPaused = false;
    this.sparkEmitters = [];
  }

  update(fighter1, fighter2, delta) {
    // Handle hitstop pause
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= delta;
      if (this.hitstopTimer <= 0) {
        this.hitstopTimer = 0;
        this.resumeFromHitstop(fighter1, fighter2);
      }
      return true; // Signal that combat is paused
    }

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

    const result = defender.takeDamage(damage, attacker.x, isHeavy, isSpecial);

    // Attacker gains special meter
    attacker.addSpecialMeter(result.actualDamage);
    attacker.stats.hitsLanded++;
    attacker.stats.damageDealt += result.actualDamage;

    // Visual effects
    const hitX = (attackBox.x + attackBox.width / 2 + defenderBox.x + defenderBox.width / 2) / 2;
    const hitY = attackBox.y + attackBox.height / 2;

    if (result.wasBlocked) {
      this.spawnBlockSparks(hitX, hitY);
    } else {
      this.spawnHitSparks(hitX, hitY, isHeavy || isSpecial);
    }

    // Screen shake
    if (isHeavy || isSpecial) {
      this.scene.cameras.main.shake(150, 0.008);
    } else {
      this.scene.cameras.main.shake(80, 0.003);
    }

    // Hitstop (freeze frame)
    if (isHeavy || isSpecial) {
      this.startHitstop(attacker, defender, HITSTOP_DURATION_HEAVY);
    } else if (!result.wasBlocked) {
      this.startHitstop(attacker, defender, HITSTOP_DURATION_LIGHT);
    }
  }

  startHitstop(attacker, defender, duration) {
    this.hitstopTimer = duration;
    this.isPaused = true;
    // Freeze both fighters
    attacker.sprite.body.setVelocity(0, 0);
    attacker.sprite.body.setAllowGravity(false);
    defender.sprite.body.setVelocity(0, 0);
    defender.sprite.body.setAllowGravity(false);
    this.frozenAttacker = attacker;
    this.frozenDefender = defender;
  }

  resumeFromHitstop(fighter1, fighter2) {
    this.isPaused = false;
    // Re-enable gravity for both fighters in the scene
    if (this.frozenAttacker) {
      this.frozenAttacker.sprite.body.setAllowGravity(true);
    }
    if (this.frozenDefender) {
      this.frozenDefender.sprite.body.setAllowGravity(true);
      // Apply stored knockback velocity after hitstop
    }
    this.frozenAttacker = null;
    this.frozenDefender = null;
  }

  spawnHitSparks(x, y, isBig) {
    const count = isBig ? 12 : 6;
    const colors = [0xffff00, 0xff8800, 0xffffff, 0xff4444];

    for (let i = 0; i < count; i++) {
      const spark = this.scene.add.circle(x, y, isBig ? 4 : 3, Phaser.Utils.Array.GetRandom(colors));
      spark.setDepth(20);

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 150 + Math.random() * (isBig ? 200 : 100);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: spark,
        x: spark.x + vx * 0.3,
        y: spark.y + vy * 0.3,
        alpha: 0,
        scale: 0,
        duration: 200 + Math.random() * 150,
        ease: 'Power2',
        onComplete: () => spark.destroy(),
      });
    }

    // Flash circle
    const flash = this.scene.add.circle(x, y, isBig ? 30 : 18, 0xffffff, 0.8);
    flash.setDepth(19);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 100,
      onComplete: () => flash.destroy(),
    });
  }

  spawnBlockSparks(x, y) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const spark = this.scene.add.circle(x, y, 3, 0x88ccff);
      spark.setDepth(20);

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 100 + Math.random() * 80;

      this.scene.tweens.add({
        targets: spark,
        x: spark.x + Math.cos(angle) * speed * 0.2,
        y: spark.y + Math.sin(angle) * speed * 0.2,
        alpha: 0,
        duration: 150,
        onComplete: () => spark.destroy(),
      });
    }
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
