import Phaser from 'phaser';
import { P1_KEYS, P2_KEYS } from '../config/controls.js';
import { DASH_TAP_WINDOW } from '../config/constants.js';

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
    // Double-tap a direction to dash.
    this.lastTap = { dir: 0, time: -Infinity };
  }

  getInput() {
    let dash = 0;
    for (const [key, dir] of [['left', -1], ['right', 1]]) {
      if (this.keys[key].isDown && !this.prevDown[key]) {
        const now = this.scene.time.now;
        if (this.lastTap.dir === dir && now - this.lastTap.time <= DASH_TAP_WINDOW) {
          dash = dir;
          this.lastTap = { dir: 0, time: -Infinity };
        } else {
          this.lastTap = { dir, time: now };
        }
      }
    }

    const input = {
      dash,
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      jump: this.keys.jump.isDown && !this.prevDown.jump,
      crouch: this.keys.crouch.isDown,
      lightAttack: this.keys.lightAttack.isDown && !this.prevDown.lightAttack,
      heavyAttack: this.keys.heavyAttack.isDown && !this.prevDown.heavyAttack,
      block: this.keys.block.isDown,
      special: this.keys.special.isDown && !this.prevDown.special,
    };

    // Update previous state
    this.prevDown.left = this.keys.left.isDown;
    this.prevDown.right = this.keys.right.isDown;
    this.prevDown.jump = this.keys.jump.isDown;
    this.prevDown.lightAttack = this.keys.lightAttack.isDown;
    this.prevDown.heavyAttack = this.keys.heavyAttack.isDown;
    this.prevDown.special = this.keys.special.isDown;

    return input;
  }

  destroy() {
    for (const key of Object.values(this.keys)) {
      key.destroy();
    }
  }
}
