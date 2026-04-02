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
import { BoneSystem } from './BoneSystem.js';
import { getSkeletonConfig } from '../config/skeletons.js';

// State durations in ms
const STATE_DURATIONS = {
  lightAttack: 300,
  heavyAttack: 500,
  special: 600,
  hit: 300,
  defeated: 1000,
  victory: 1500,
  blocking: 0, // held state
};

// Attack windows — when during the attack animation the hitbox is active (normalized 0-1)
const ATTACK_WINDOWS = {
  lightAttack: { start: 0.3, end: 0.6 },
  heavyAttack: { start: 0.35, end: 0.55 },
  special: { start: 0.25, end: 0.65 },
};

export class Fighter {
  constructor(scene, x, y, warriorConfig, playerIndex, facingRight) {
    this.scene = scene;
    this.config = warriorConfig;
    this.playerIndex = playerIndex;

    // Stats scaled by warrior multipliers
    this.maxHp = Math.round(DEFAULT_FIGHTER_HP * warriorConfig.health);
    this.hp = this.maxHp;
    this.specialMeter = 0;
    this.speed = DEFAULT_FIGHTER_SPEED * warriorConfig.speed;
    this.jumpForce = DEFAULT_FIGHTER_JUMP_FORCE;
    this.attackPower = warriorConfig.power;

    // Physics body — invisible rectangle
    this.sprite = scene.physics.add.sprite(x, y, '__DEFAULT');
    this.sprite.setVisible(false);
    this.sprite.setSize(50, 100);
    this.sprite.setOffset(-25, -100);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setMaxVelocityY(1200);
    this.sprite.setData('fighter', this);

    // Bone animation system (replaces old Graphics-based drawing)
    const skeletonConfig = getSkeletonConfig(warriorConfig.id);
    this.boneSystem = new BoneSystem(scene, skeletonConfig, warriorConfig.id);

    // State machine
    this.state = 'idle';
    this.stateTimer = 0;
    this.facingRight = facingRight;
    this.isGrounded = true;
    this.isCrouching = false;

    // Combat tracking
    this.hasHitThisAttack = false;
    this.comboCount = 0;
    this.lastAttackTime = 0;

    // Animation frame
    this.animFrame = 0;
    this.animTimer = 0;

    // Body part positions (for drawing)
    this.bodyParts = {
      headY: 0,
      torsoAngle: 0,
      armAngle: 0,
      weaponAngle: 0,
      legSpread: 0,
      crouchFactor: 0,
    };

    // Match stats
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

    const progress = this.stateTimer > 0
      ? 1 - (this.stateTimer / STATE_DURATIONS[this.state])
      : 0;
    const window = ATTACK_WINDOWS[this.state];
    if (!window || progress < window.start || progress > window.end) return null;

    // Set reach based on attack type (increased to cover the internal body gap)
    const reach = this.state === 'special' ? 130 : (this.state === 'heavyAttack' ? 115 : 100);
    
    // Start the hitbox slightly behind the character (-15) so we don't have a blind spot 
    // for enemies standing intimately close. If facing left, shift the coordinate box back by total reach.
    const xBase = this.sprite.x;
    const boxX = this.facingRight ? xBase - 15 : xBase + 15 - reach;

    return {
      x: boxX,
      y: this.sprite.y - 70,
      width: reach,
      height: 50,
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

  // --- Input handling ---

  handleInput(input) {
    if (!this.isAlive() || this.state === 'defeated' || this.state === 'victory') return;

    // Can't act during attack/hit recovery
    if (!this.isActionable() && this.state !== 'jumping') return;

    // Special move
    if (input.special && this.specialMeter >= SPECIAL_METER_MAX && (this.isActionable() || this.state === 'jumping')) {
      this.enterState('special');
      this.specialMeter = 0;
      this.stats.specialsUsed++;
      return;
    }

    // Attacks
    if (input.lightAttack && (this.isActionable() || this.state === 'jumping')) {
      this.enterState('lightAttack');
      return;
    }
    if (input.heavyAttack && (this.isActionable() || this.state === 'jumping')) {
      this.enterState('heavyAttack');
      return;
    }

    // Block — hold to maintain, release to exit
    if (input.block && this.isActionable()) {
      this.enterState('blocking');
      return;
    }
    if (!input.block && this.state === 'blocking') {
      this.enterState('idle');
    }

    // Crouch — hold to maintain, release to exit
    if (input.crouch && this.isGrounded && this.state !== 'jumping') {
      this.isCrouching = true;
      this.enterState('crouching');
      return;
    }
    if (!input.crouch && this.state === 'crouching') {
      this.isCrouching = false;
      this.enterState('idle');
    }

    // Jump
    if (input.jump && this.isGrounded && this.state !== 'jumping') {
      this.sprite.setVelocityY(this.jumpForce);
      this.isGrounded = false;
      this.enterState('jumping');
      return;
    }

    // Movement
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

  // --- State machine ---

  enterState(newState) {
    if (this.state === newState && newState !== 'hit') return;

    this.state = newState;
    this.stateTimer = STATE_DURATIONS[newState] || 0;
    this.hasHitThisAttack = false;
    this.animFrame = 0;
    this.animTimer = 0;

    // Stop horizontal velocity during attacks and hit stun only if on ground
    if (newState === 'lightAttack' || newState === 'heavyAttack' ||
        newState === 'special' || newState === 'hit' || newState === 'blocking') {
      if (this.isGrounded) {
        this.sprite.setVelocityX(0);
      }
    }
  }

  update(time, delta) {
    // Clamp to ground (only when falling, not when jumping up)
    if (this.sprite.y > GROUND_Y) {
      this.sprite.y = GROUND_Y;
      if (this.sprite.body.velocity.y > 0) {
        this.sprite.body.setVelocityY(0);
      }
    }

    const wasGrounded = this.isGrounded;
    // Ground detection — physics collision OR manual ground check
    const atGround = this.sprite.y >= GROUND_Y && this.sprite.body.velocity.y >= 0;
    this.isGrounded = this.sprite.body.blocked.down || this.sprite.body.touching.down || atGround;

    // Handle landing on the ground
    if (!wasGrounded && this.isGrounded) {
      if (this.state === 'jumping') {
        this.enterState('idle');
      } else if (this.isAttacking() || this.state === 'hit' || this.state === 'blocking') {
        this.sprite.setVelocityX(0);
      }
    } else if (this.isGrounded && this.state === 'jumping') {
      this.enterState('idle');
    }

    // Update state timer
    if (this.stateTimer > 0) {
      this.stateTimer -= delta;
      if (this.stateTimer <= 0) {
        this.stateTimer = 0;
        // Return to idle after timed states
        if (this.state === 'lightAttack' || this.state === 'heavyAttack' ||
            this.state === 'special' || this.state === 'hit') {
          this.enterState('idle');
        }
        if (this.state === 'defeated') {
          // Stay defeated
        }
      }
    }

    // Update animation
    this.animTimer += delta;
    if (this.animTimer > 100) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    // Update body part positions for drawing
    this.updateBodyParts(delta);

    // Draw the fighter
    this.draw();
  }

  updateBodyParts(delta) {
    const t = this.animFrame;
    const progress = this.stateTimer > 0
      ? 1 - (this.stateTimer / (STATE_DURATIONS[this.state] || 1))
      : 0;

    switch (this.state) {
      case 'idle':
        this.bodyParts.headY = Math.sin(Date.now() / 500) * 2;
        this.bodyParts.torsoAngle = 0;
        this.bodyParts.armAngle = 10;
        this.bodyParts.weaponAngle = 30;
        this.bodyParts.legSpread = 15;
        this.bodyParts.crouchFactor = 0;
        break;
      case 'walking':
        this.bodyParts.headY = Math.sin(Date.now() / 200) * 3;
        this.bodyParts.torsoAngle = 5;
        this.bodyParts.armAngle = Math.sin(Date.now() / 200) * 20;
        this.bodyParts.weaponAngle = 30;
        this.bodyParts.legSpread = 20 + Math.sin(Date.now() / 150) * 15;
        this.bodyParts.crouchFactor = 0;
        break;
      case 'jumping':
        this.bodyParts.headY = -5;
        this.bodyParts.torsoAngle = -5;
        this.bodyParts.armAngle = -30;
        this.bodyParts.weaponAngle = -45;
        this.bodyParts.legSpread = 25;
        this.bodyParts.crouchFactor = 0;
        break;
      case 'crouching':
        this.bodyParts.headY = 20;
        this.bodyParts.torsoAngle = 10;
        this.bodyParts.armAngle = 20;
        this.bodyParts.weaponAngle = 30;
        this.bodyParts.legSpread = 25;
        this.bodyParts.crouchFactor = 0.4;
        break;
      case 'lightAttack':
        this.bodyParts.headY = 0;
        this.bodyParts.torsoAngle = progress < 0.3 ? -10 : 15;
        this.bodyParts.armAngle = progress < 0.3 ? -40 : 70;
        this.bodyParts.weaponAngle = progress < 0.3 ? -60 : 30;
        this.bodyParts.legSpread = 20;
        this.bodyParts.crouchFactor = 0;
        break;
      case 'heavyAttack':
        this.bodyParts.headY = 0;
        if (progress < 0.35) {
          this.bodyParts.torsoAngle = -15;
          this.bodyParts.armAngle = -60;
          this.bodyParts.weaponAngle = -90;
        } else {
          this.bodyParts.torsoAngle = 25;
          this.bodyParts.armAngle = 90;
          this.bodyParts.weaponAngle = 45;
        }
        this.bodyParts.legSpread = 25;
        this.bodyParts.crouchFactor = 0;
        break;
      case 'special':
        this.bodyParts.headY = -3;
        this.bodyParts.torsoAngle = progress < 0.25 ? -20 : 30;
        this.bodyParts.armAngle = progress < 0.25 ? -70 : 100;
        this.bodyParts.weaponAngle = progress < 0.25 ? -100 : 60;
        this.bodyParts.legSpread = 30;
        this.bodyParts.crouchFactor = 0;
        break;
      case 'blocking':
        this.bodyParts.headY = 0;
        this.bodyParts.torsoAngle = -10;
        this.bodyParts.armAngle = -20;
        this.bodyParts.weaponAngle = -70;
        this.bodyParts.legSpread = 20;
        this.bodyParts.crouchFactor = 0;
        break;
      case 'hit':
        this.bodyParts.headY = 5;
        this.bodyParts.torsoAngle = -15;
        this.bodyParts.armAngle = -30;
        this.bodyParts.weaponAngle = -40;
        this.bodyParts.legSpread = 10;
        this.bodyParts.crouchFactor = 0;
        break;
      case 'defeated':
        this.bodyParts.headY = 40;
        this.bodyParts.torsoAngle = 60;
        this.bodyParts.armAngle = 50;
        this.bodyParts.weaponAngle = 90;
        this.bodyParts.legSpread = 30;
        this.bodyParts.crouchFactor = 0.6;
        break;
      case 'victory':
        this.bodyParts.headY = -10;
        this.bodyParts.torsoAngle = -5;
        this.bodyParts.armAngle = -120;
        this.bodyParts.weaponAngle = -130;
        this.bodyParts.legSpread = 20;
        this.bodyParts.crouchFactor = 0;
        break;
    }
  }

  draw() {
    const x = this.sprite.x;
    const baseY = this.sprite.y;

    // Apply bodyParts state to bone rotations and render
    this.boneSystem.applyBodyParts(this.bodyParts);
    this.boneSystem.render(x, baseY, this.facingRight);

    // Special meter glow when full
    if (this.specialMeter >= SPECIAL_METER_MAX) {
      if (!this.glowGraphics) {
        this.glowGraphics = this.scene.add.graphics();
        this.glowGraphics.setDepth(11);
      }
      this.glowGraphics.clear();
      const accent = parseInt(this.config.colors.accent.replace('#', ''), 16);
      const torsoY = baseY - 55 + this.bodyParts.crouchFactor * 30;
      this.glowGraphics.lineStyle(2, accent, 0.5 + Math.sin(Date.now() / 200) * 0.3);
      this.glowGraphics.strokeCircle(x, torsoY, 45);
    } else if (this.glowGraphics) {
      this.glowGraphics.clear();
    }
  }

  // --- Damage handling ---

  takeDamage(amount, attackerX, isHeavy, isSpecial) {
    const wasBlocking = this.state === 'blocking';
    let actualDamage = amount;

    if (wasBlocking && !isSpecial) {
      actualDamage = Math.round(amount * (1 - BLOCK_DAMAGE_REDUCTION));
    }

    this.hp = Math.max(0, this.hp - actualDamage);

    // Knockback
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

  // --- Round management ---

  resetForRound(x, facingRight) {
    this.hp = this.maxHp;
    // Special meter carries between rounds
    this.sprite.setPosition(x, GROUND_Y);
    this.sprite.setVelocity(0, 0);
    this.facingRight = facingRight;
    this.state = 'idle';
    this.stateTimer = 0;
    this.hasHitThisAttack = false;
    this.isCrouching = false;
  }

  resetForMatch() {
    this.resetForRound(this.sprite.x, this.facingRight);
    this.specialMeter = 0;
    this.stats = { hitsLanded: 0, damageDealt: 0, specialsUsed: 0 };
  }

  destroy() {
    this.sprite.destroy();
    this.boneSystem.destroy();
    if (this.glowGraphics) this.glowGraphics.destroy();
  }
}
