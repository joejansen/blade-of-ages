import Phaser from 'phaser';
import {
  DEFAULT_FIGHTER_SPEED,
  DEFAULT_FIGHTER_JUMP_FORCE,
  DEFAULT_FIGHTER_HP,
  LIGHT_ATTACK_DAMAGE,
  HEAVY_ATTACK_DAMAGE,
  BLOCK_DAMAGE_REDUCTION,
  SPECIAL_METER_MAX,
  SPECIAL_METER_PER_DAMAGE,
  KNOCKBACK_LIGHT,
  KNOCKBACK_HEAVY,
  GROUND_Y,
} from '../config/constants.js';
import { SoundManager } from '../audio/SoundManager.js';
import { sampleAnimationPose, blendPose } from './animationClips.js';
import { WarriorRenderer } from './WarriorRenderer.js';
import { getFighterProfile } from '../config/fighterProfiles.js';

const STATE_DURATIONS = {
  lightAttack: 300,
  heavyAttack: 500,
  special: 600,
  hit: 300,
  defeated: 1000,
  victory: 1500,
  blocking: 0,
};

const ATTACK_WINDOWS = {
  lightAttack: { start: 0.34, end: 0.62 },
  heavyAttack: { start: 0.4, end: 0.62 },
  special: { start: 0.3, end: 0.7 },
};

export class Fighter {
  constructor(scene, x, y, warriorConfig, playerIndex, facingRight) {
    this.scene = scene;
    this.config = warriorConfig;
    this.playerIndex = playerIndex;
    this.profile = getFighterProfile(warriorConfig.id);

    this.maxHp = Math.round(DEFAULT_FIGHTER_HP * warriorConfig.health);
    this.hp = this.maxHp;
    this.specialMeter = 0;
    this.speed = DEFAULT_FIGHTER_SPEED * warriorConfig.speed;
    this.jumpForce = DEFAULT_FIGHTER_JUMP_FORCE;
    this.attackPower = warriorConfig.power;

    this.sprite = scene.physics.add.sprite(x, y, '__DEFAULT');
    this.sprite.setVisible(false);
    this.sprite.setSize(50, 100);
    this.sprite.setOffset(-25, -100);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setMaxVelocityY(1200);
    this.sprite.setData('fighter', this);

    this.renderer = new WarriorRenderer(scene, warriorConfig);

    this.state = 'idle';
    this.stateTimer = 0;
    this.stateElapsed = 0;
    this.facingRight = facingRight;
    this.isGrounded = true;
    this.isCrouching = false;

    this.hasHitThisAttack = false;
    this.comboCount = 0;
    this.lastAttackTime = 0;

    this.bodyParts = sampleAnimationPose('idle', 0, this.profile, {
      verticalVelocity: 0,
      facingRight,
      grounded: true,
    });

    this.stats = {
      hitsLanded: 0,
      damageDealt: 0,
      specialsUsed: 0,
    };
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  getHitbox() {
    const w = 50;
    const h = this.isCrouching ? 70 : 100;
    return {
      x: this.sprite.x - w / 2,
      y: this.sprite.y - h,
      width: w,
      height: h,
    };
  }

  getAttackHitbox() {
    if (!this.isAttacking()) return null;

    const duration = STATE_DURATIONS[this.state] || 1;
    const progress = Phaser.Math.Clamp(this.stateElapsed / duration, 0, 1);
    const window = ATTACK_WINDOWS[this.state];
    if (!window || progress < window.start || progress > window.end) return null;

    const reach = this.state === 'special' ? 132 : (this.state === 'heavyAttack' ? 118 : 100);
    const xBase = this.sprite.x;
    const boxX = this.facingRight ? xBase - 15 : xBase + 15 - reach;

    return {
      x: boxX,
      y: this.sprite.y - 74,
      width: reach,
      height: 54,
    };
  }

  isAttacking() {
    return this.state === 'lightAttack' || this.state === 'heavyAttack' || this.state === 'special';
  }

  isActionable() {
    return this.state === 'idle' || this.state === 'walking' || this.state === 'crouching' || this.state === 'blocking';
  }

  isAlive() {
    return this.hp > 0;
  }

  handleInput(input) {
    if (!this.isAlive() || this.state === 'defeated' || this.state === 'victory') return;
    if (!this.isActionable() && this.state !== 'jumping') return;

    if (input.special && this.specialMeter >= SPECIAL_METER_MAX && (this.isActionable() || this.state === 'jumping')) {
      this.enterState('special');
      this.specialMeter = 0;
      this.stats.specialsUsed++;
      return;
    }

    if (input.lightAttack && (this.isActionable() || this.state === 'jumping')) {
      this.enterState('lightAttack');
      return;
    }

    if (input.heavyAttack && (this.isActionable() || this.state === 'jumping')) {
      this.enterState('heavyAttack');
      return;
    }

    if (input.block && this.isActionable()) {
      this.enterState('blocking');
      return;
    }

    if (!input.block && this.state === 'blocking') {
      this.enterState('idle');
    }

    if (input.crouch && this.isGrounded && this.state !== 'jumping') {
      this.isCrouching = true;
      this.enterState('crouching');
      return;
    }

    if (!input.crouch && this.state === 'crouching') {
      this.isCrouching = false;
      this.enterState('idle');
    }

    if (input.jump && this.isGrounded && this.state !== 'jumping') {
      this.sprite.setVelocityY(this.jumpForce);
      this.isGrounded = false;
      this.enterState('jumping');
      return;
    }

    if (input.left) {
      this.sprite.setVelocityX(-this.speed);
      if (this.isGrounded) this.enterState('walking');
      this.facingRight = false;
    } else if (input.right) {
      this.sprite.setVelocityX(this.speed);
      if (this.isGrounded) this.enterState('walking');
      this.facingRight = true;
    } else if (this.isGrounded && (this.state === 'walking' || this.state === 'idle')) {
      this.sprite.setVelocityX(0);
      this.enterState('idle');
    }
  }

  handleInputRelease(input) {
    if (input.blockReleased && this.state === 'blocking') {
      this.enterState('idle');
    }
    if (input.crouchReleased && this.state === 'crouching') {
      this.isCrouching = false;
      this.enterState('idle');
    }
  }

  enterState(newState) {
    if (this.state === newState && newState !== 'hit') return;

    this.state = newState;
    this.stateTimer = STATE_DURATIONS[newState] || 0;
    this.stateElapsed = 0;
    this.hasHitThisAttack = false;

    if (newState === 'lightAttack') SoundManager.playCombat(this.scene, 'light_attack');
    else if (newState === 'heavyAttack') SoundManager.playCombat(this.scene, 'heavy_attack');
    else if (newState === 'special') SoundManager.playCombat(this.scene, 'special');
    else if (newState === 'jumping') SoundManager.playCombat(this.scene, 'jump');

    if (newState === 'lightAttack' || newState === 'heavyAttack' ||
        newState === 'special' || newState === 'hit' || newState === 'blocking') {
      if (this.isGrounded) {
        this.sprite.setVelocityX(0);
      }
    }
  }

  update(time, delta) {
    if (this.sprite.y > GROUND_Y) {
      this.sprite.y = GROUND_Y;
      if (this.sprite.body.velocity.y > 0) {
        this.sprite.body.setVelocityY(0);
      }
    }

    const wasGrounded = this.isGrounded;
    const atGround = this.sprite.y >= GROUND_Y && this.sprite.body.velocity.y >= 0;
    this.isGrounded = this.sprite.body.blocked.down || this.sprite.body.touching.down || atGround;

    if (!wasGrounded && this.isGrounded) {
      this.spawnLandingDust();
      if (this.state === 'jumping') {
        this.enterState('idle');
      } else if (this.isAttacking() || this.state === 'hit' || this.state === 'blocking') {
        this.sprite.setVelocityX(0);
      }
    } else if (this.isGrounded && this.state === 'jumping') {
      this.enterState('idle');
    }

    if (this.stateTimer > 0) {
      this.stateTimer -= delta;
      this.stateElapsed += delta;

      if (this.stateTimer <= 0) {
        this.stateTimer = 0;
        if (this.state === 'lightAttack' || this.state === 'heavyAttack' ||
            this.state === 'special' || this.state === 'hit') {
          this.enterState('idle');
        }
      }
    } else {
      this.stateElapsed += delta;
    }

    this.updateBodyParts(delta);
    this.draw();
  }

  updateBodyParts(delta) {
    const targetPose = sampleAnimationPose(this.state, this.stateElapsed, this.profile, {
      verticalVelocity: this.sprite.body.velocity.y,
      horizontalVelocity: this.sprite.body.velocity.x,
      grounded: this.isGrounded,
      facingRight: this.facingRight,
    });

    const blendTime = this.isAttacking() || this.state === 'hit' ? 65 : 120;
    const alpha = Phaser.Math.Clamp(delta / blendTime, 0, 1);
    this.bodyParts = blendPose(this.bodyParts, targetPose, alpha);
  }

  draw() {
    this.renderer.render(
      this.sprite.x,
      this.sprite.y,
      this.facingRight,
      this.bodyParts,
      this.state,
      this.specialMeter / SPECIAL_METER_MAX,
    );
  }

  spawnLandingDust() {
    const color = this.profile.fx.dustColor;
    const burstY = this.sprite.y - 4;
    const offsets = [-24, -12, 0, 12, 24];

    for (const offset of offsets) {
      const puff = this.scene.add.ellipse(this.sprite.x + offset, burstY, 14, 8, color, 0.5);
      puff.setDepth(9);
      this.scene.tweens.add({
        targets: puff,
        x: puff.x + offset * 0.5,
        y: puff.y - 10 - Math.abs(offset) * 0.08,
        scaleX: 1.8,
        scaleY: 1.5,
        alpha: 0,
        duration: 260,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  takeDamage(amount, attackerX, isHeavy, isSpecial) {
    const wasBlocking = this.state === 'blocking';
    let actualDamage = amount;

    if (wasBlocking && !isSpecial) {
      actualDamage = Math.round(amount * (1 - BLOCK_DAMAGE_REDUCTION));
    }

    this.hp = Math.max(0, this.hp - actualDamage);

    const dir = attackerX < this.sprite.x ? 1 : -1;
    const knockback = isHeavy ? KNOCKBACK_HEAVY : KNOCKBACK_LIGHT;
    this.sprite.setVelocityX(knockback * dir);
    if (isHeavy || isSpecial) {
      this.sprite.setVelocityY(-150);
    }

    if (this.hp <= 0) {
      this.enterState('defeated');
    } else if (!wasBlocking || isSpecial) {
      this.enterState('hit');
    }

    return { actualDamage, wasBlocked: wasBlocking && !isSpecial };
  }

  addSpecialMeter(damage) {
    this.specialMeter = Math.min(SPECIAL_METER_MAX, this.specialMeter + damage * SPECIAL_METER_PER_DAMAGE);
  }

  getAttackDamage() {
    let base;
    switch (this.state) {
      case 'lightAttack':
        base = LIGHT_ATTACK_DAMAGE;
        break;
      case 'heavyAttack':
        base = HEAVY_ATTACK_DAMAGE;
        break;
      case 'special':
        base = this.config.special.damage;
        break;
      default:
        return 0;
    }

    return Math.round(base * this.attackPower);
  }

  resetForRound(x, facingRight) {
    this.hp = this.maxHp;
    this.sprite.setPosition(x, GROUND_Y);
    this.sprite.setVelocity(0, 0);
    this.facingRight = facingRight;
    this.state = 'idle';
    this.stateTimer = 0;
    this.stateElapsed = 0;
    this.hasHitThisAttack = false;
    this.isCrouching = false;
    this.isGrounded = true;
    this.bodyParts = sampleAnimationPose('idle', 0, this.profile, {
      verticalVelocity: 0,
      facingRight,
      grounded: true,
    });
  }

  resetForMatch() {
    this.resetForRound(this.sprite.x, this.facingRight);
    this.specialMeter = 0;
    this.stats = { hitsLanded: 0, damageDealt: 0, specialsUsed: 0 };
  }

  destroy() {
    this.sprite.destroy();
    this.renderer.destroy();
  }
}
