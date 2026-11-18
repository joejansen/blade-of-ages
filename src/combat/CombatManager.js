import Phaser from 'phaser';
import {
  FIGHTER_SCALE,
  CHIP_DAMAGE_RATIO,
  PARRY_WINDOW,
  SPECIAL_METER_PER_DAMAGE,
  SPECIAL_METER_PER_DAMAGE_TAKEN,
} from '../config/constants.js';
import { SoundManager } from '../audio/SoundManager.js';

const S = FIGHTER_SCALE;
const COMBO_SCALING = 0.1;   // damage lost per extra hit in a combo
const MIN_COMBO_SCALE = 0.5;
const COUNTER_BONUS = 1.25;
const HITSTUN_DECAY = 0.1;   // stun lost per extra hit, so strings must end
const MIN_HITSTUN_SCALE = 0.6;
const JUGGLE_LIMIT = 2;      // a heavy landed this deep into a combo floors
const COMBO_LIMIT = 4;       // any hit this deep floors: no endless strings

// Resolves attacks into hits, blocks, parries and guard breaks, and owns the
// hitstop and impact effects that sell them.
export class CombatManager {
  constructor(scene) {
    this.scene = scene;
    this.hitstopTimer = 0;
    this.frozen = [];
  }

  update(fighter1, fighter2, delta) {
    if (this.tickHitstop(delta)) return true; // Signal that combat is paused

    this.checkAttack(fighter1, fighter2);
    this.checkAttack(fighter2, fighter1);
    this.separate(fighter1, fighter2);

    return this.hitstopTimer > 0;
  }

  // Fighters cannot stand inside each other; whoever is pressing forward
  // shoves the other along. Jumping clear over an opponent is allowed.
  separate(a, b) {
    if (a.isDown() || b.isDown()) return;
    if (Math.abs(a.y - b.y) > 70 * S) return;
    const minGap = 36 * S;
    const dx = b.x - a.x;
    const gap = Math.abs(dx);
    if (gap >= minGap) return;
    const push = (minGap - gap) / 2;
    const sign = dx === 0 ? (a.playerIndex === 0 ? 1 : -1) : Math.sign(dx);
    const bounds = this.scene.physics.world.bounds;
    const half = a.sprite.body.width / 2;
    const clampX = x => Phaser.Math.Clamp(x, bounds.x + half, bounds.right - half);
    let ax = clampX(a.x - sign * push);
    let bx = clampX(b.x + sign * push);
    // If one is pinned on the wall the other takes the whole correction.
    if (Math.abs(bx - ax) < minGap) ax = clampX(bx - sign * minGap);
    if (Math.abs(bx - ax) < minGap) bx = clampX(ax + sign * minGap);
    a.sprite.x = ax;
    b.sprite.x = bx;
  }

  checkAttack(attacker, defender) {
    if (!attacker.isAttacking() || attacker.hasHitThisAttack) return;
    if (!defender.isAlive() || defender.isInvulnerable()) return;

    const attackBox = attacker.getAttackHitbox();
    if (!attackBox) return;
    const defenderBox = defender.getHitbox();
    if (!this.boxesOverlap(attackBox, defenderBox)) return;

    attacker.hasHitThisAttack = true;
    const move = attacker.move;
    const dir = attacker.x < defender.x ? 1 : -1;
    const hitX = Phaser.Math.Clamp(
      attacker.x + dir * attackBox.width * 0.8,
      defenderBox.x, defenderBox.x + defenderBox.width,
    );
    const hitY = Phaser.Math.Clamp(attackBox.y + attackBox.height * 0.42, defenderBox.y + 20, defenderBox.y + defenderBox.height - 30);
    const guarding = defender.isBlockingToward(attacker.x) && !move.unblockable;

    if (guarding && defender.blockAge <= PARRY_WINDOW && defender.blockstun <= 0) {
      this.resolveParry(attacker, defender, dir, hitX, hitY);
    } else if (guarding) {
      this.resolveBlock(attacker, defender, move, dir, hitX, hitY);
    } else {
      this.resolveHit(attacker, defender, move, dir, hitX, hitY);
    }
  }

  resolveParry(attacker, defender, dir, x, y) {
    attacker.lastAttackResult = 'parried';
    attacker.applyParried(-dir);
    defender.addSpecialMeter(14);
    defender.stats.parries++;
    defender.blockstun = 0;
    defender.flash(0xbfe4ff, 90);

    SoundManager.play(this.scene, 'parry');
    this.spawnBlockSparks(x, y, dir, true);
    this.scene.cameraRig?.punch(0.05);
    this.scene.cameras.main.flash(70, 190, 225, 255);
    this.scene.onParry?.(defender.playerIndex);
    this.startHitstop([attacker, defender], 150);
  }

  resolveBlock(attacker, defender, move, dir, x, y) {
    attacker.lastAttackResult = 'blocked';
    const damage = attacker.getAttackDamage();
    const chip = Math.max(1, Math.round(damage * CHIP_DAMAGE_RATIO));
    const broken = defender.applyBlock({
      chip,
      guardDamage: move.guard,
      blockstun: move.blockstun,
      pushback: move.knockback * 0.55,
      dir,
    });
    attacker.addSpecialMeter(chip * SPECIAL_METER_PER_DAMAGE + 2);
    attacker.stats.damageDealt += chip;
    // Steel shoves back: the attacker gives ground too.
    attacker.vx -= dir * move.knockback * 0.25 * S;
    this.pushOffWall(attacker, defender, dir, move.knockback * 0.4);

    SoundManager.playCombat(this.scene, 'block');
    this.spawnBlockSparks(x, y, dir, broken);
    this.scene.cameraRig?.punch(broken ? 0.06 : 0.014);
    this.scene.cameras.main.shake(broken ? 160 : 70, broken ? 0.008 : 0.0025);
    if (broken) {
      defender.flash(0xffd27a, 110);
      SoundManager.play(this.scene, 'guard_break');
      this.scene.onGuardBreak?.(attacker.playerIndex);
      this.startHitstop([attacker, defender], 140);
    } else {
      this.startHitstop([attacker, defender], move.big ? 70 : 35);
    }
  }

  resolveHit(attacker, defender, move, dir, x, y) {
    attacker.lastAttackResult = 'hit';
    // Caught mid-swing: the defender was committed and pays extra.
    const counter = defender.isAttacking() && !defender.isRecovering();
    const comboScale = Math.max(MIN_COMBO_SCALE, 1 - COMBO_SCALING * defender.comboTaken);
    const damage = Math.max(1, Math.round(attacker.getAttackDamage() * comboScale * (counter ? COUNTER_BONUS : 1)));

    const stunScale = Math.max(MIN_HITSTUN_SCALE, 1 - HITSTUN_DECAY * defender.comboTaken);
    const lethal = defender.applyHit({
      damage,
      knockback: move.knockback,
      hitstun: (move.hitstun + (counter ? 90 : 0)) * stunScale,
      big: move.big,
      knockdown: move.knockdown
        || defender.comboTaken >= COMBO_LIMIT
        || (move.kind === 'heavy' && defender.comboTaken >= JUGGLE_LIMIT),
      dir,
    });

    attacker.addSpecialMeter(damage * SPECIAL_METER_PER_DAMAGE);
    defender.addSpecialMeter(damage * SPECIAL_METER_PER_DAMAGE_TAKEN);
    attacker.stats.hitsLanded++;
    attacker.stats.damageDealt += damage;
    // The defender counts the hits they have taken without recovering.
    attacker.combo = defender.comboTaken;
    attacker.stats.maxCombo = Math.max(attacker.stats.maxCombo, attacker.combo);
    if (attacker.combo >= 2) this.scene.onCombo?.(attacker.playerIndex, attacker.combo);
    if (counter) this.scene.onCounter?.(attacker.playerIndex);
    this.pushOffWall(attacker, defender, dir, move.knockback * 0.5);

    const big = move.big || lethal;
    SoundManager.playFighter(defender, big ? 'hit_heavy' : 'hit');
    this.spawnHitSparks(x, y, big, dir, attacker.profile.fx.trailColor);
    defender.flash();
    this.scene.cameraRig?.punch(lethal ? 0.09 : big ? 0.05 : 0.02);
    this.scene.cameras.main.shake(big ? 180 : 90, big ? 0.009 : 0.0035);

    this.startHitstop([attacker, defender], lethal ? move.hitstop * 2.2 : move.hitstop + (counter ? 40 : 0));
  }

  // A defender with their back to the wall cannot be pushed further, so the
  // attacker is driven off instead; pressure cannot be kept up for free.
  pushOffWall(attacker, defender, dir, amount) {
    const bounds = this.scene.physics.world.bounds;
    const half = defender.sprite.body.width / 2;
    const cornered = dir > 0
      ? defender.x >= bounds.right - half - 4
      : defender.x <= bounds.x + half + 4;
    if (cornered) attacker.vx = -dir * amount * S;
  }

  // Advances an active hitstop; returns true while still frozen.
  tickHitstop(delta) {
    if (this.hitstopTimer <= 0) return false;
    this.hitstopTimer -= delta;
    if (this.hitstopTimer <= 0) {
      this.hitstopTimer = 0;
      this.frozen.forEach(f => f.unfreeze());
      this.frozen = [];
      return false;
    }
    return true;
  }

  startHitstop(fighters, duration) {
    this.hitstopTimer = Math.max(this.hitstopTimer, duration);
    for (const f of fighters) {
      f.freeze();
      if (!this.frozen.includes(f)) this.frozen.push(f);
    }
  }

  // Impact: white flash, a cut mark across the contact point, sparks thrown
  // away from the attacker, ink-red droplets that fall to the floor, and a
  // shockwave ring for heavy blows.
  spawnHitSparks(x, y, isBig, dir, trailColor = 0xffffff) {
    const scene = this.scene;
    const ADD = Phaser.BlendModes.ADD;
    const k = S * 0.7;

    const flash = scene.add.image(x, y, 'fx_soft').setDepth(21).setBlendMode(ADD)
      .setScale((isBig ? 2 : 1.3) * k).setAlpha(0.9);
    scene.tweens.add({ targets: flash, scale: (isBig ? 3.4 : 2.2) * k, alpha: 0, duration: 130, onComplete: () => flash.destroy() });

    // The cut.
    const angle = (dir > 0 ? -0.5 : 0.5) + (Math.random() - 0.5) * 0.5;
    const cutLen = (isBig ? 3.6 : 2.3) * k;
    const cutGlow = scene.add.image(x, y, 'fx_streak').setDepth(20).setBlendMode(ADD)
      .setTint(0xe0283f).setRotation(angle).setScale(0.2, (isBig ? 2.4 : 1.7) * k).setOrigin(0.5);
    const cut = scene.add.image(x, y, 'fx_streak').setDepth(21).setBlendMode(ADD)
      .setTint(trailColor).setRotation(angle).setScale(0.2, (isBig ? 0.9 : 0.7) * k).setOrigin(0.5);
    scene.tweens.add({ targets: [cut, cutGlow], scaleX: cutLen, duration: 70, ease: 'Expo.easeOut' });
    scene.tweens.add({
      targets: [cut, cutGlow], alpha: 0, scaleY: 0.1, delay: 70, duration: 220,
      onComplete: () => { cut.destroy(); cutGlow.destroy(); },
    });

    // Sparks.
    const count = isBig ? 16 : 9;
    for (let i = 0; i < count; i++) {
      const a = (dir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 2.2;
      const speed = (isBig ? 340 : 230) * (0.5 + Math.random()) * k;
      const spark = scene.add.image(x, y, 'fx_streak').setDepth(21).setBlendMode(ADD)
        .setRotation(a).setScale((0.35 + Math.random() * 0.4) * k, 0.5 * k)
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
      speed: { min: 140, max: (isBig ? 480 : 340) * k },
      angle: dir > 0 ? { min: -70, max: 20 } : { min: 160, max: 250 },
      gravityY: 1500,
      lifespan: { min: 380, max: 760 },
      scale: { start: (isBig ? 0.75 : 0.55) * k, end: 0.15 },
      tint: [0xb3122a, 0x7a0a18, 0xe0283f],
      alpha: { start: 1, end: 0.6 },
      emitting: false,
    }).setDepth(19);
    drops.explode(isBig ? 24 : 11);
    scene.time.delayedCall(900, () => drops.destroy());

    if (isBig) {
      const ring = scene.add.image(x, y, 'fx_ring').setDepth(20).setBlendMode(ADD)
        .setScale(0.3 * k).setTint(0xffe2c0);
      scene.tweens.add({ targets: ring, scale: 2.4 * k, alpha: 0, duration: 320, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    }
  }

  // Steel on steel: cold sparks bursting upward, a tight ring. `strong`
  // (parry / guard break) throws a wider burst.
  spawnBlockSparks(x, y, dir, strong = false) {
    const scene = this.scene;
    const ADD = Phaser.BlendModes.ADD;
    const k = S * 0.8 * (strong ? 1.5 : 1);
    const count = strong ? 18 : 9;
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (dir > 0 ? -0.6 : 0.6) + (Math.random() - 0.5) * (strong ? 3.4 : 1.8);
      const speed = (160 + Math.random() * 160) * k;
      const spark = scene.add.image(x, y, 'fx_streak').setDepth(21).setBlendMode(ADD)
        .setRotation(a).setScale(0.4 * k, 0.45 * k).setTint(Phaser.Utils.Array.GetRandom([0xbfe4ff, 0xffffff, 0x9cc4e4]));
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
      .setScale(0.2 * k).setTint(0x9cc4e4);
    scene.tweens.add({ targets: ring, scale: 1.2 * k, alpha: 0, duration: 240, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    const flash = scene.add.image(x, y, 'fx_soft').setDepth(21).setBlendMode(ADD).setScale(1.6 * k).setTint(0xcfe8ff);
    scene.tweens.add({ targets: flash, alpha: 0, scale: 2.4 * k, duration: 120, onComplete: () => flash.destroy() });
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
    this.frozen.forEach(f => f.unfreeze());
    this.frozen = [];
  }
}
