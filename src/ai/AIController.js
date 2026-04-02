// Personality-driven AI controller for single-player opponents

export class AIController {
  constructor(warriorConfig) {
    this.personality = warriorConfig.ai;
    this.decisionTimer = 0;
    this.decisionInterval = 200; // Re-evaluate every 200ms
    this.currentAction = null;
    this.actionTimer = 0;
  }

  getInput(aiState) {
    const { self, opponent, distance, opponentAttacking } = aiState;
    const input = {
      left: false,
      right: false,
      jump: false,
      crouch: false,
      lightAttack: false,
      heavyAttack: false,
      block: false,
      special: false,
      blockReleased: false,
      crouchReleased: false,
    };

    this.decisionTimer -= aiState.delta;
    if (this.decisionTimer > 0 && this.currentAction) {
      return this.applyAction(this.currentAction, input, aiState);
    }

    this.decisionTimer = this.decisionInterval + Math.random() * 100;
    this.currentAction = this.decide(aiState);

    return this.applyAction(this.currentAction, input, aiState);
  }

  decide(aiState) {
    const { self, opponent, distance, opponentAttacking } = aiState;
    const p = this.personality;
    const roll = Math.random();

    // Use special if meter is full and threshold met
    const hpRatio = self.hp / self.maxHp;
    if (self.specialMeter >= 100 && distance < 140) {
      if (hpRatio <= p.specialThreshold || roll < 0.3) {
        return 'special';
      }
    }

    // Counter-attack when opponent is attacking
    if (opponentAttacking && distance < 140) {
      if (roll < p.counterTendency) {
        return roll < p.counterTendency * 0.5 ? 'heavyAttack' : 'lightAttack';
      }
      if (roll < p.defense) {
        return 'block';
      }
    }

    // Close range combat
    if (distance < 125) {
      // Decide between attack and defense
      if (roll < p.aggression) {
        // Attack choice with variation
        const attackRoll = Math.random();
        if (attackRoll < 0.6) return 'lightAttack';
        return 'heavyAttack';
      }
      if (roll < p.aggression + p.defense * 0.5) {
        return 'block';
      }
      return 'retreat';
    }

    // Mid range — approach or wait
    if (distance < 240) {
      if (roll < p.aggression * 0.8) {
        return 'approach';
      }
      if (roll < p.aggression + 0.2) {
        return 'cautious_approach';
      }
      return 'wait';
    }

    // Far range — close distance
    if (roll < 0.7) {
      return 'approach';
    }
    return 'wait';
  }

  applyAction(action, input, aiState) {
    const { self, opponent } = aiState;
    const shouldFaceRight = opponent.x > self.x;
    const moveDir = shouldFaceRight ? 'right' : 'left';
    const retreatDir = shouldFaceRight ? 'left' : 'right';

    switch (action) {
      case 'lightAttack':
        input.lightAttack = true;
        break;
      case 'heavyAttack':
        input.heavyAttack = true;
        break;
      case 'special':
        input.special = true;
        break;
      case 'block':
        input.block = true;
        break;
      case 'approach':
        input[moveDir] = true;
        break;
      case 'cautious_approach':
        input[moveDir] = true;
        // Occasionally block while approaching
        if (Math.random() < 0.3) input.block = true;
        break;
      case 'retreat':
        input[retreatDir] = true;
        break;
      case 'jump':
        input.jump = true;
        input[moveDir] = true;
        break;
      case 'wait':
        // Do nothing — wait for opening
        break;
    }

    return input;
  }

  reset() {
    this.decisionTimer = 0;
    this.currentAction = null;
  }
}
