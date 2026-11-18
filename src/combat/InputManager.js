import Phaser from 'phaser';
import { P1_KEYS, P2_KEYS } from '../config/controls.js';
import { DASH_TAP_WINDOW } from '../config/constants.js';
import { gamepads } from '../input/gamepads.js';
import { FIGHT_ACTIONS, initialFightState, stepFightInput } from '../input/fightInput.js';

// A player's fight input: their keyboard keys merged with their gamepad
// (pad slot = player index). allPads lets any pad drive this player, for
// single-player matches.
export class InputManager {
  constructor(scene, playerIndex, { allPads = false } = {}) {
    this.scene = scene;
    this.playerIndex = playerIndex;
    this.allPads = allPads;
    const keyMap = playerIndex === 0 ? P1_KEYS : P2_KEYS;

    this.keys = {};
    for (const [action, key] of Object.entries(keyMap)) {
      this.keys[action] = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[key]);
    }
    this.state = initialFightState();
  }

  getInput() {
    const pad = gamepads.fightHeld(this.playerIndex, this.allPads);
    const held = {};
    for (const action of FIGHT_ACTIONS) held[action] = this.keys[action].isDown || Boolean(pad[action]);
    return stepFightInput(this.state, held, this.scene.time.now, DASH_TAP_WINDOW);
  }

  destroy() {
    for (const key of Object.values(this.keys)) {
      key.destroy();
    }
  }
}
