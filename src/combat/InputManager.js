import Phaser from 'phaser';
import { P1_KEYS, P2_KEYS } from '../config/controls.js';

export class InputManager {
  constructor(scene, playerIndex) {
    this.scene = scene;
    this.playerIndex = playerIndex;
    const keyMap = playerIndex === 0 ? P1_KEYS : P2_KEYS;

    this.keys = {};
    for (const [action, key] of Object.entries(keyMap)) {
      this.keys[action] = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[key]);
    }

    // Track just-pressed for attacks (prevent holding)
    this.prevDown = {};
    for (const action of ['lightAttack', 'heavyAttack', 'special']) {
      this.prevDown[action] = false;
    }
  }

  getInput() {
    const input = {
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      jump: this.keys.jump.isDown && !this.prevDown.jump,
      crouch: this.keys.crouch.isDown,
      lightAttack: this.keys.lightAttack.isDown && !this.prevDown.lightAttack,
      heavyAttack: this.keys.heavyAttack.isDown && !this.prevDown.heavyAttack,
      block: this.keys.block.isDown,
      special: this.keys.special.isDown && !this.prevDown.special,
      blockReleased: !this.keys.block.isDown && this.prevDown.block,
      crouchReleased: !this.keys.crouch.isDown && this.prevDown.crouch,
    };

    // Update previous state
    this.prevDown.jump = this.keys.jump.isDown;
    this.prevDown.lightAttack = this.keys.lightAttack.isDown;
    this.prevDown.heavyAttack = this.keys.heavyAttack.isDown;
    this.prevDown.special = this.keys.special.isDown;
    this.prevDown.block = this.keys.block.isDown;
    this.prevDown.crouch = this.keys.crouch.isDown;

    return input;
  }

  destroy() {
    for (const key of Object.values(this.keys)) {
      key.destroy();
    }
  }
}
