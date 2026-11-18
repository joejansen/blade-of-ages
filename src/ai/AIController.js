import { FIGHTER_SCALE } from '../config/constants.js';
import { MOVES, reachFor } from '../config/moves.js';

const S = FIGHTER_SCALE;

// Personality-driven opponent. Three layers, checked in order each frame:
//   1. mid-attack: decide once per swing whether to continue the chain
//   2. defence: decide once per incoming attack how to answer it, after a
//      human-like reaction delay (fast jabs can only be guessed at)
//   3. offence: on a slower "think" tick, pick spacing or an attack
// Personality (warriors.js `ai`) weights every roll:
//   aggression       how readily it presses and keeps a string going
//   defense          how often it blocks, and how quickly it reacts
//   counterTendency  how often it parries and punishes whiffs
//   patternVariation how often it does the unexpected (dashes, backs off)
export class AIController {
  constructor(warriorConfig) {
    this.p = warriorConfig.ai;
    this.reaction = 300 - this.p.defense * 110;
    this.reset();
  }

  reset() {
    this.action = 'hold';
    this.thinkTimer = 300;
    this.rest = 0;
    this.seenAttackId = -1;
    this.defence = null;
    this.chain = null;
  }

  getInput({ self, opponent, distance, delta }) {
    const input = {
      left: false, right: false, jump: false, crouch: false,
      lightAttack: false, heavyAttack: false, block: false, special: false, dash: 0,
    };
    if (!self.isAlive()) return input;

    this.thinkTimer -= delta;
    this.rest -= delta;
    const toward = opponent.x > self.x ? 1 : -1;
    const strike = (reachFor(MOVES.light1, self.profile) * S + 12 * S) * 0.92;

    // 1. Mid-swing: follow up or stop.
    if (self.isAttacking()) {
      this.#continueString(self, input);
      return input;
    }

    // 2. Something is coming at us.
    const threatRange = opponent.isAttacking() ? opponent.move.reachPx + 40 * S : 0;
    if (opponent.isAttacking() && !opponent.isRecovering() && distance < threatRange) {
      if (this.seenAttackId !== opponent.attackId) {
        this.seenAttackId = opponent.attackId;
        this.defence = this.#planDefence(self, opponent);
      }
      if (this.#defend(self, opponent, input, toward)) return input;
    } else if (self.blockstun > 0) {
      input.block = true;
      input.noParry = true;
      return input;
    }

    if (!self.isActionable()) return input;

    // 3. Offence and spacing.
    if (this.thinkTimer <= 0) {
      this.thinkTimer = 110 + Math.random() * 130;
      this.action = this.#decide(self, opponent, distance, strike);
    }
    this.#act(input, toward);
    return input;
  }

  #continueString(self, input) {
    if (!self.lastAttackResult) return;
    if (this.chain?.id !== self.attackId) {
      const r = self.lastAttackResult;
      const chance = r === 'hit' ? 0.92 : r === 'blocked' ? 0.3 + this.p.aggression * 0.35 : 0;
      this.chain = {
        id: self.attackId,
        go: Math.random() < chance,
        special: r === 'hit' && Math.random() < 0.55,
      };
    }
    if (self.move.chain) {
      if (this.chain.go && !self.queuedMove) input.lightAttack = true;
    } else if (this.chain.special && self.hasSpecial()) {
      input.special = true;
    }
  }

  #planDefence(self, opponent) {
    const p = this.p;
    const move = opponent.move;
    const startup = move.active[0] * opponent.stateDuration;
    const roll = Math.random();

    if (move.unblockable) {
      const evade = 0.3 + p.patternVariation * 0.3 + p.defense * 0.2;
      return { plan: roll < evade ? 'backdash' : 'none', at: this.reaction * 0.8 };
    }

    // A jab is out before anyone can react: blocking it is a read, unless
    // we are already guarding the previous hit of the string.
    const reactable = startup > this.reaction * 0.75;
    const guarding = self.blockstun > 0 || self.state === 'blocking';
    const block = guarding ? 0.25 + p.defense * 0.7 : reactable ? 0.3 + p.defense * 0.6 : p.defense * 0.42;
    const parry = reactable ? p.counterTendency * 0.24 : p.counterTendency * 0.05;
    const evade = p.patternVariation * 0.18;

    if (roll < parry && !guarding) return { plan: 'parry', at: Math.max(0, startup - 60) };
    if (roll < parry + block) return { plan: 'block', at: guarding ? 0 : Math.min(this.reaction, Math.max(0, startup - 30)) };
    if (roll < parry + block + evade && reactable) return { plan: 'backdash', at: this.reaction * 0.7 };
    return { plan: 'none', at: 0 };
  }

  // Returns true while the defensive plan owns the controls.
  #defend(self, opponent, input, toward) {
    const d = this.defence;
    if (!d || d.plan === 'none') return false;
    if (opponent.stateElapsed < d.at) {
      if (self.blockstun > 0) {
        input.block = true;
        input.noParry = true;
      }
      return true;
    }
    if (d.plan === 'backdash') {
      if (!d.done) {
        d.done = true;
        input.dash = -toward;
      }
      return true;
    }
    input.block = true;
    input.noParry = d.plan !== 'parry';
    return true;
  }

  #decide(self, opponent, distance, strike) {
    const p = this.p;
    const roll = Math.random();

    if (opponent.isDown()) return distance < strike * 1.25 ? 'backoff' : 'hold';

    // Punish anyone reeling or stuck in a missed swing.
    if (opponent.isVulnerable() || opponent.isRecovering()) {
      if (distance < strike) {
        const stunLeft = opponent.state === 'stunned' ? opponent.stateDuration - opponent.stateElapsed : 0;
        if (self.hasSpecial() && stunLeft > 350) return 'special';
        if (stunLeft > 480 && roll < 0.75) return 'heavy';
        if (roll < 0.4 + p.counterTendency * 0.55) return 'light';
      } else if (distance < strike * 2.2) {
        return roll < 0.25 + p.aggression * 0.5 ? 'dashIn' : 'approach';
      }
    }

    // Catch a breath between strings so pressure comes in waves.
    const resting = this.rest > 0;

    if (distance < strike) {
      if (!resting && roll < 0.12 + p.aggression * 0.72) {
        const second = Math.random();
        if (opponent.state === 'blocking') return second < 0.5 ? 'heavy' : 'light';
        return second < 0.74 ? 'light' : 'heavy';
      }
      if (roll < 0.5 + p.defense * 0.25) return resting ? 'backoff' : 'guard';
      return 'backoff';
    }

    if (distance < strike * 1.9) {
      if (resting) return roll < 0.5 ? 'hold' : 'backoff';
      if (self.hasSpecial() && roll < 0.14) return 'special';
      if (roll < 0.2 + p.aggression * 0.55) return 'approach';
      if (roll < 0.28 + p.aggression * 0.55 + p.patternVariation * 0.15) return 'dashIn';
      return roll < 0.9 ? 'hold' : 'backoff';
    }

    if (roll < 0.62 + p.aggression * 0.25) return 'approach';
    if (roll < 0.8 + p.aggression * 0.15) return 'dashIn';
    return 'hold';
  }

  #act(input, toward) {
    const forward = toward > 0 ? 'right' : 'left';
    const back = toward > 0 ? 'left' : 'right';
    switch (this.action) {
      case 'light':
      case 'heavy':
      case 'special':
        input[this.action === 'light' ? 'lightAttack' : this.action === 'heavy' ? 'heavyAttack' : 'special'] = true;
        this.rest = 420 + (1 - this.p.aggression) * 800 + Math.random() * 380;
        this.action = 'hold';
        break;
      case 'dashIn':
        input.dash = toward;
        this.action = 'approach';
        break;
      case 'approach':
        input[forward] = true;
        break;
      case 'backoff':
        input[back] = true;
        break;
      case 'guard':
        input.block = true;
        input.noParry = true;
        break;
      default:
        break;
    }
  }
}
