import Phaser from 'phaser';
import {
  DEFAULT_FIGHTER_SPEED,
  DEFAULT_FIGHTER_JUMP_FORCE,
  DEFAULT_FIGHTER_HP,
  FIGHTER_SCALE,
  SPECIAL_METER_MAX,
  GUARD_MAX,
  GUARD_REGEN_PER_SEC,
  GUARD_BREAK_STUN,
  PARRY_STUN,
  PARRY_WINDOW,
  INPUT_BUFFER,
  GROUND_Y,
} from '../config/constants.js';
import { MOVES, reachFor } from '../config/moves.js';
import { SoundManager } from '../audio/SoundManager.js';
import { sampleClip, clipDuration, clipSpeedFor, resolveClipName, blendPose } from './animationClips.js';
import { WarriorRenderer } from './WarriorRenderer.js';
import { AssetWarriorRenderer } from './AssetWarriorRenderer.js';
import { getFighterProfile } from '../config/fighterProfiles.js';

const S = FIGHTER_SCALE;
const BODY_W = 44 * S;
// Feet to the crown of the skull on HEROIC_RIG (hip 58 + torso 41 + head
// ~21, less the fighting crouch); crests and plumes above that are not body.
const BODY_H = 118 * S;
const CROUCH_H = 80 * S;

const DASH_SPEED = 400 * S;
const BACKDASH_SPEED = 350 * S;
const DASH_MS = 230;
const BACKDASH_MS = 250;
const BACKDASH_INVULN = 150;
const DASH_COOLDOWN = 320;
const FALL_MS = 620;        // length of the fall clip
const KNOCKDOWN_MS = 1050;  // fall + time on the floor
const GETUP_MS = 400;
const BACKWARD_SPEED = 0.8;
const AIR_CONTROL = 0.9;

// How quickly each state bleeds off horizontal momentum (per second).
const DRAG = { attack: 7, hit: 6, stunned: 7, blocking: 9, getup: 12, grounded: 10, airborne: 0.4 };

const FREE_STATES = new Set(['idle', 'walking', 'crouching', 'blocking']);
const DOWN_STATES = new Set(['knockdown', 'getup', 'defeated']);

export class Fighter {
  constructor(scene, x, y, warriorConfig, playerIndex, facingRight, options = {}) {
    this.scene = scene;
    this.config = warriorConfig;
    this.playerIndex = playerIndex;
    this.profile = getFighterProfile(warriorConfig.id);
    this.opponent = null;

    this.maxHp = Math.round(DEFAULT_FIGHTER_HP * warriorConfig.health);
    this.hp = this.maxHp;
    this.specialMeter = 0;
    this.guard = GUARD_MAX;
    this.speed = DEFAULT_FIGHTER_SPEED * warriorConfig.speed;
    this.jumpForce = DEFAULT_FIGHTER_JUMP_FORCE;
    this.attackPower = warriorConfig.power;

    // Invisible physics body; the rig is drawn from its feet.
    this.sprite = scene.physics.add.sprite(x, y, '__DEFAULT');
    this.sprite.setVisible(false);
    this.sprite.setSize(BODY_W, BODY_H);
    this.sprite.setOffset(this.sprite.width / 2 - BODY_W / 2, this.sprite.height / 2 - BODY_H);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setMaxVelocityY(1800);
    this.sprite.setData('fighter', this);

    // Prefer the asset-driven sprite renderer; fall back to the vector
    // renderer if any part texture is missing so development builds without
    // the art pipeline output still render a fighter.
    const assetRenderer = new AssetWarriorRenderer(scene, warriorConfig, {
      depth: 12 + playerIndex,
      shadowDepth: 9.5,
      displayScale: S,
      ambient: options.ambient,
      rimColor: options.rimColor,
    });
    if (assetRenderer.isAvailable()) {
      this.renderer = assetRenderer;
    } else {
      assetRenderer.destroy();
      this.renderer = new WarriorRenderer(scene, warriorConfig, { displayScale: S });
    }

    this.facingRight = facingRight;
    this.stats = { hitsLanded: 0, damageDealt: 0, specialsUsed: 0, parries: 0, maxCombo: 0 };
    this.attackId = 0;
    this.#resetState();
  }

  #resetState() {
    this.state = 'idle';
    this.stateElapsed = 0;
    this.stateDuration = 0;
    this.move = null;
    this.moveName = null;
    this.queuedMove = null;
    this.hasHitThisAttack = false;
    this.lunged = false;
    this.lastAttackResult = null; // 'hit' | 'blocked' | 'parried'
    this.buffer = null;
    this.vx = 0;
    this.blockAge = 0;
    this.blockstun = 0;
    this.invuln = 0;
    this.dashCooldown = 0;
    this.guardDelay = 0;
    this.comboTaken = 0;
    this.combo = 0;
    this.airAttacked = false;
    this.walkReverse = false;
    this.hitClip = 'hit';
    this.isGrounded = true;
    this.isCrouching = false;
    this.bodyParts = sampleClip('idle', 0, this.profile, { facingRight: this.facingRight });
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get dir() { return this.facingRight ? 1 : -1; }

  // --- Queries ---------------------------------------------------------------

  getHitbox() {
    const h = this.isCrouching ? CROUCH_H : BODY_H;
    return { x: this.sprite.x - BODY_W / 2, y: this.sprite.y - h, width: BODY_W, height: h };
  }

  attackProgress() {
    return this.move ? Phaser.Math.Clamp(this.stateElapsed / this.stateDuration, 0, 1) : 0;
  }

  getAttackHitbox() {
    if (this.state !== 'attack') return null;
    const p = this.attackProgress();
    const [start, end] = this.move.active;
    if (p < start || p > end) return null;

    const reach = this.move.reachPx;
    const back = 10 * S;
    return {
      x: this.facingRight ? this.sprite.x - back : this.sprite.x + back - reach,
      y: this.sprite.y + this.move.top * S,
      width: reach,
      height: (this.move.bottom - this.move.top) * S,
    };
  }

  isAttacking() { return this.state === 'attack'; }
  isActionable() { return FREE_STATES.has(this.state) && this.blockstun <= 0; }
  isAlive() { return this.hp > 0; }
  isDown() { return DOWN_STATES.has(this.state); }
  isInvulnerable() { return this.invuln > 0 || this.isDown(); }
  // Committed to a swing that has already passed its active frames.
  isRecovering() { return this.state === 'attack' && this.attackProgress() > this.move.active[1]; }
  // Reeling and unable to defend.
  isVulnerable() { return this.state === 'hit' || this.state === 'stunned'; }
  isBlockingToward(attackerX) {
    return this.state === 'blocking' && (attackerX > this.sprite.x) === this.facingRight;
  }
  hasSpecial() { return this.specialMeter >= SPECIAL_METER_MAX; }

  // --- Input -----------------------------------------------------------------

  handleInput(input) {
    if (!this.isAlive() || this.state === 'defeated' || this.state === 'victory') return;

    if (input.special) this.buffer = { action: 'special', ttl: INPUT_BUFFER };
    else if (input.heavyAttack) this.buffer = { action: 'heavy', ttl: INPUT_BUFFER };
    else if (input.lightAttack) this.buffer = { action: 'light', ttl: INPUT_BUFFER };
    else if (input.dash) this.buffer = { action: 'dash', dir: input.dash, ttl: 90 };

    if (this.state === 'attack') {
      // Light pressed once the blade is out queues the next link of the chain.
      const act = this.buffer?.action;
      if (act === 'light' && this.move.chain && this.attackProgress() >= this.move.active[0]) {
        this.queuedMove = this.move.chain;
        this.buffer = null;
      } else if (act === 'special' && this.hasSpecial() && this.lastAttackResult === 'hit' && this.isGrounded) {
        // A clean hit can be cancelled straight into the special.
        this.buffer = null;
        this.startAttack('special');
      }
      return;
    }

    const airborne = this.state === 'jumping';
    if (!airborne && !this.isActionable()) return;

    if (this.buffer) {
      const { action, dir } = this.buffer;
      if (action === 'special' && this.hasSpecial() && !airborne) {
        this.buffer = null;
        return this.startAttack('special');
      }
      if (action === 'heavy' || action === 'light') {
        if (airborne) {
          if (!this.airAttacked) {
            this.buffer = null;
            this.airAttacked = true;
            return this.startAttack('air');
          }
        } else {
          this.buffer = null;
          return this.startAttack(action === 'heavy' ? 'heavy' : 'light1');
        }
      }
      if (action === 'dash' && !airborne && this.dashCooldown <= 0) {
        this.buffer = null;
        return this.startDash(dir === this.dir);
      }
    }

    if (airborne) {
      if (input.left) this.vx = -this.speed * AIR_CONTROL;
      else if (input.right) this.vx = this.speed * AIR_CONTROL;
      return;
    }

    if (input.block) {
      if (this.state !== 'blocking') {
        this.enterState('blocking');
        // The AI's ordinary guard is never a parry; it has to choose one.
        if (input.noParry) this.blockAge = PARRY_WINDOW + 1;
      }
      return;
    }
    if (this.state === 'blocking') this.enterState('idle');

    if (input.crouch) {
      this.isCrouching = true;
      this.vx = 0;
      this.enterState('crouching');
      return;
    }
    if (this.state === 'crouching') {
      this.isCrouching = false;
      this.enterState('idle');
    }

    if (input.jump && this.isGrounded) {
      this.sprite.setVelocityY(this.jumpForce);
      this.isGrounded = false;
      this.airAttacked = false;
      this.vx = input.left ? -this.speed * AIR_CONTROL : input.right ? this.speed * AIR_CONTROL : 0;
      this.enterState('jumping');
      SoundManager.playCombat(this.scene, 'jump');
      return;
    }

    if (input.left || input.right) {
      const moveDir = input.left ? -1 : 1;
      this.walkReverse = moveDir !== this.dir;
      this.vx = moveDir * this.speed * (this.walkReverse ? BACKWARD_SPEED : 1);
      this.enterState('walking');
    } else {
      this.vx = 0;
      this.enterState('idle');
    }
  }

  // --- State changes ---------------------------------------------------------

  enterState(newState, duration = 0) {
    if (this.state === newState && duration === 0) return;
    this.state = newState;
    this.stateElapsed = 0;
    this.stateDuration = duration;
    if (newState !== 'attack') {
      this.move = null;
      this.moveName = null;
      this.queuedMove = null;
    }
    if (newState !== 'crouching') this.isCrouching = false;
    if (newState === 'blocking') {
      this.blockAge = 0;
      this.vx = 0;
    }
    if (newState === 'victory') this.vx = 0;
  }

  startAttack(name) {
    const base = MOVES[name];
    const clip = resolveClipName(base.clip, this.profile);
    this.state = 'attack';
    this.isCrouching = false;
    this.moveName = name;
    this.move = {
      ...base,
      name,
      clip,
      reachPx: reachFor(base, this.profile) * S,
    };
    this.stateElapsed = 0;
    this.stateDuration = base.duration / clipSpeedFor(clip, this.profile);
    this.hasHitThisAttack = false;
    this.lunged = false;
    this.queuedMove = null;
    this.lastAttackResult = null;
    this.attackId++;
    if (this.isGrounded) this.vx = 0;

    SoundManager.playCombat(this.scene, base.sound);
    if (name === 'special') {
      this.specialMeter = 0;
      this.stats.specialsUsed++;
      this.invuln = 180;
      this.scene.events.emit('fighter-special', this);
    }
    // The fighter acting takes the front of the stage.
    this.scene.events.emit('fighter-front', this);
  }

  startDash(forward) {
    this.enterState(forward ? 'dash' : 'backdash', forward ? DASH_MS : BACKDASH_MS);
    this.vx = this.dir * (forward ? DASH_SPEED : -BACKDASH_SPEED);
    if (!forward) this.invuln = BACKDASH_INVULN;
    this.dashCooldown = DASH_COOLDOWN + (forward ? DASH_MS : BACKDASH_MS);
    SoundManager.play(this.scene, 'jump', { volume: 0.25, detune: forward ? 500 : 250 });
    this.spawnDust(3, -this.vx * 0.12);
  }

  // A clean hit. `dir` is the direction the blow travels (+1 = right).
  applyHit({ damage, knockback, hitstun, big, knockdown, dir }) {
    this.hp = Math.max(0, this.hp - damage);
    this.blockstun = 0;
    this.guardDelay = 900;
    this.comboTaken++;
    const lethal = this.hp <= 0;
    this.vx = dir * knockback * S * (lethal ? 1.25 : 1);

    if (lethal || knockdown || !this.isGrounded) {
      this.sprite.setVelocityY(lethal ? -620 : -500);
      this.isGrounded = false;
      this.enterState(lethal ? 'defeated' : 'knockdown', lethal ? 0 : KNOCKDOWN_MS);
      this.stateElapsed = 0;
    } else {
      this.hitClip = big ? 'hitHeavy' : 'hit';
      this.enterState('hit', hitstun);
      this.snapPose = true;
    }
    return lethal;
  }

  // A blocked hit: chip damage (never lethal), guard damage, pushback.
  // Returns true when the guard shatters.
  applyBlock({ chip, guardDamage, blockstun, pushback, dir }) {
    this.hp = Math.max(1, this.hp - chip);
    this.guard = Math.max(0, this.guard - guardDamage);
    this.guardDelay = 1100;
    this.vx = dir * pushback * S;
    if (this.guard <= 0) {
      this.guard = GUARD_MAX * 0.5;
      this.enterState('stunned', GUARD_BREAK_STUN);
      this.stateElapsed = 0;
      return true;
    }
    this.blockstun = blockstun;
    return false;
  }

  // This fighter's attack was parried: thrown off balance.
  applyParried(dir) {
    this.vx = dir * 90 * S;
    this.enterState('stunned', PARRY_STUN);
    this.stateElapsed = 0;
    this.snapPose = true;
  }

  addSpecialMeter(amount) {
    this.specialMeter = Math.min(SPECIAL_METER_MAX, this.specialMeter + amount);
  }

  getAttackDamage() {
    if (!this.move) return 0;
    const base = this.moveName === 'special' ? this.config.special.damage : this.move.damage;
    return base * this.attackPower;
  }

  // Hitstop: hold the body still without losing its momentum.
  freeze() {
    if (this.frozen) return;
    const body = this.sprite.body;
    this.frozen = { vy: body.velocity.y };
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
  }

  unfreeze() {
    if (!this.frozen) return;
    const body = this.sprite.body;
    // The body is already gone if the scene shut down mid-hitstop.
    if (body) {
      body.setAllowGravity(true);
      body.setVelocityY(this.frozen.vy);
    }
    this.frozen = null;
  }

  // --- Simulation ------------------------------------------------------------

  update(time, delta) {
    const dt = delta / 1000;
    const body = this.sprite.body;

    if (this.buffer && (this.buffer.ttl -= delta) <= 0) this.buffer = null;
    this.invuln = Math.max(0, this.invuln - delta);
    this.blockstun = Math.max(0, this.blockstun - delta);
    this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    if (this.state === 'blocking') this.blockAge += delta;

    this.guardDelay = Math.max(0, this.guardDelay - delta);
    if (this.guardDelay <= 0 && this.state !== 'blocking') {
      this.guard = Math.min(GUARD_MAX, this.guard + GUARD_REGEN_PER_SEC * dt);
    }

    if (this.sprite.y > GROUND_Y) {
      this.sprite.y = GROUND_Y;
      if (body.velocity.y > 0) body.setVelocityY(0);
    }
    const wasGrounded = this.isGrounded;
    // Not body.blocked.down: it still reads true on the frame a jump starts.
    this.isGrounded = this.sprite.y >= GROUND_Y - 0.5 && body.velocity.y >= 0;

    if (!wasGrounded && this.isGrounded) this.#onLand();
    else if (this.isGrounded && this.state === 'jumping') this.enterState('idle');

    this.stateElapsed += delta;
    this.#tickState();
    this.#applyMomentum(dt);

    // Fighters square up to each other whenever they are free to turn.
    if (this.opponent && (this.state === 'idle' || this.state === 'walking' || this.state === 'crouching'
        || (this.state === 'blocking' && this.blockstun <= 0))) {
      const dx = this.opponent.x - this.sprite.x;
      if (Math.abs(dx) > 6) this.facingRight = dx > 0;
    }

    this.updateBodyParts(delta);
    this.draw();
  }

  #onLand() {
    const heavy = this.isDown();
    this.spawnDust(heavy ? 7 : 5, 0);
    if (heavy) {
      this.scene.cameras.main.shake(140, 0.006);
      SoundManager.play(this.scene, 'hit', { volume: 0.35, detune: -900 });
    }
    if (this.state === 'jumping' || (this.state === 'attack' && this.moveName === 'air')) {
      this.vx = 0;
      this.enterState('idle');
    }
  }

  #tickState() {
    const done = this.stateDuration > 0 && this.stateElapsed >= this.stateDuration;
    switch (this.state) {
      case 'attack': {
        if (!this.lunged && this.attackProgress() >= this.move.active[0] - 0.08) {
          this.lunged = true;
          if (this.isGrounded && this.move.lunge) this.vx = this.dir * this.move.lunge * S;
          if (this.moveName === 'special') this.spawnDust(5, -this.dir * 60);
        }
        // Once the blade has done its work a queued follow-up cuts the
        // recovery short; that is what makes a chain a chain. A blow that
        // has already connected can be cancelled sooner still.
        const p = this.attackProgress();
        const landed = this.hasHitThisAttack && p >= this.move.active[0] + 0.12;
        if (this.queuedMove && (landed || p >= this.move.active[1] + 0.04)) {
          this.startAttack(this.queuedMove);
        } else if (done) {
          this.enterState('idle');
        }
        break;
      }
      case 'hit':
      case 'stunned':
        if (done) {
          this.comboTaken = 0;
          this.enterState('idle');
        }
        break;
      case 'knockdown':
        if (done && this.isGrounded) {
          this.comboTaken = 0;
          this.enterState('getup', GETUP_MS);
        }
        break;
      case 'getup':
        if (done) {
          this.invuln = 120;
          this.enterState('idle');
        }
        break;
      case 'dash':
      case 'backdash':
        if (done) {
          this.vx *= 0.2;
          this.enterState('idle');
        }
        break;
      default:
        break;
    }
  }

  #applyMomentum(dt) {
    let drag = 0;
    switch (this.state) {
      case 'attack': drag = this.isGrounded ? (this.moveName === 'special' ? 3.2 : DRAG.attack) : 0; break;
      case 'hit': drag = DRAG.hit; break;
      case 'stunned': drag = DRAG.stunned; break;
      case 'blocking': drag = DRAG.blocking; break;
      case 'getup': drag = DRAG.getup; break;
      case 'knockdown':
      case 'defeated': drag = this.isGrounded ? DRAG.grounded : DRAG.airborne; break;
      case 'idle':
      case 'crouching':
      case 'victory': drag = 14; break;
      default: break;
    }
    if (drag) this.vx *= Math.exp(-drag * dt);
    this.sprite.body.setVelocityX(this.vx);
  }

  updateBodyParts(delta) {
    const context = {
      verticalVelocity: this.sprite.body.velocity.y,
      horizontalVelocity: this.vx,
      grounded: this.isGrounded,
      facingRight: this.facingRight,
      reverse: this.walkReverse,
    };

    let clip;
    let progress;
    switch (this.state) {
      case 'attack':
        clip = this.move.clip;
        progress = this.attackProgress();
        break;
      case 'hit':
        clip = this.hitClip;
        progress = this.stateElapsed / this.stateDuration;
        break;
      case 'knockdown':
      case 'defeated':
        clip = 'fall';
        progress = this.stateElapsed / FALL_MS;
        break;
      case 'getup':
      case 'dash':
      case 'backdash':
        clip = this.state;
        progress = this.stateElapsed / this.stateDuration;
        break;
      default:
        clip = resolveClipName(this.state, this.profile);
        progress = this.stateElapsed / clipDuration(clip, this.profile);
        break;
    }

    const target = sampleClip(clip, progress, this.profile, context);
    const fast = this.state === 'attack' || this.state === 'hit' || this.state === 'dash' || this.state === 'backdash';
    const blendTime = this.snapPose ? 12 : fast ? 20 : 105;
    this.snapPose = false;
    this.bodyParts = blendPose(this.bodyParts, target, Phaser.Math.Clamp(delta / blendTime, 0, 1));
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

  // Wash the rig toward a colour for a few frames (white on a clean hit).
  flash(color = 0xffffff, ms = 70) {
    this.renderer.setFlash?.(color, true);
    this.scene.time.delayedCall(ms, () => this.renderer?.setFlash?.(color, false));
  }

  // Low puffs kicked out along the floor; `drift` biases them sideways.
  spawnDust(count = 5, drift = 0) {
    const color = this.profile.fx.dustColor;
    const y = GROUND_Y + 6;
    for (let i = 0; i < count; i++) {
      const spread = (i / Math.max(1, count - 1) - 0.5) * 2;
      const puff = this.scene.add.image(this.sprite.x + spread * 22 * S, y, 'fx_soft')
        .setTint(color).setAlpha(0.5).setScale(0.5 * S, 0.3 * S).setDepth(9.6);
      this.scene.tweens.add({
        targets: puff,
        x: puff.x + spread * 34 * S + drift,
        y: y - (8 + (1 - Math.abs(spread)) * 10) * S,
        scaleX: 1.3 * S,
        scaleY: 0.75 * S,
        alpha: 0,
        duration: 380 + Math.random() * 120,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  resetForRound(x, facingRight) {
    this.hp = this.maxHp;
    this.guard = GUARD_MAX;
    this.sprite.setPosition(x, GROUND_Y);
    this.sprite.setVelocity(0, 0);
    this.unfreeze();
    this.facingRight = facingRight;
    this.#resetState();
  }

  destroy() {
    this.sprite.destroy();
    this.renderer.destroy();
  }
}
