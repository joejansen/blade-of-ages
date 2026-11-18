import { snapshot, fightState, menuState, mergeStates } from './gamepadMapping.js';

// Held menu directions repeat, like a held key.
export const REPEAT_DELAY = 380;
export const REPEAT_INTERVAL = 110;
const REPEATABLE = new Set(['left', 'right', 'up', 'down']);

const browserPads = () => globalThis.navigator?.getGamepads?.() ?? [];

// One poll per game step (wired in main.js), shared by every scene, so edge
// detection is consistent no matter which scene reads it.
//
// Player slots are sticky: a pad keeps its slot until it disconnects, and a
// newly seen pad takes the lowest free slot. So when player one's pad drops
// out, player two's pad stays player two. Browsers only reveal a pad after one
// of its buttons is pressed.
//
// Only pads the browser reports with the W3C "standard" layout are read.
// Others (Firefox on macOS reports DualSense this way) have unknown button
// and axis meanings, and a resting axis could otherwise walk a fighter.
export class GamepadHub {
  constructor(source = browserPads) {
    this.source = source;
    this.slots = [];
    this.current = new Map();
    this.menuHeld = {};
    this.menuFired = new Set();
    this.repeatAt = {};
    this.lastDevice = 'keyboard';
    this.listeners = new Set();
  }

  get count() {
    return this.current.size;
  }

  poll(now) {
    let pads;
    try {
      pads = Array.from(this.source()).filter(p => p && p.connected !== false && p.mapping === 'standard');
    } catch {
      pads = [];
    }
    pads.sort((a, b) => a.index - b.index);
    const before = [...this.current.keys()].join();
    this.current = new Map(pads.map(p => [p.index, snapshot(p)]));
    const padsChanged = [...this.current.keys()].join() !== before;
    this.slots = this.slots.map(i => (this.current.has(i) ? i : null));
    for (const index of this.current.keys()) {
      if (this.slots.includes(index)) continue;
      const free = this.slots.indexOf(null);
      if (free === -1) this.slots.push(index);
      else this.slots[free] = index;
    }
    while (this.slots.length && this.slots[this.slots.length - 1] === null) this.slots.pop();

    const held = mergeStates([...this.current.values()].map(menuState));
    this.menuFired = new Set();
    for (const [action, on] of Object.entries(held)) {
      if (!on) continue;
      if (!this.menuHeld[action]) {
        this.menuFired.add(action);
        this.repeatAt[action] = now + REPEAT_DELAY;
      } else if (REPEATABLE.has(action) && now >= this.repeatAt[action]) {
        this.menuFired.add(action);
        this.repeatAt[action] = now + REPEAT_INTERVAL;
      }
    }
    this.menuHeld = held;

    if (this.menuFired.size) this.setDevice('gamepad');
    else if (padsChanged) this.emit();
  }

  // Held fight actions for a player. allPads lets every pad drive player one
  // when there is no player two.
  fightHeld(playerIndex, allPads = false) {
    const indices = allPads ? [...this.current.keys()] : [this.slots[playerIndex]];
    return mergeStates(indices.filter(i => this.current.has(i)).map(i => fightState(this.current.get(i))));
  }

  hasPadFor(playerIndex) {
    return this.current.has(this.slots[playerIndex]);
  }

  setDevice(device) {
    if (device === this.lastDevice) return;
    this.lastDevice = device;
    this.emit();
  }

  // Called on device switches and pad connects/disconnects.
  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    for (const fn of this.listeners) fn(this);
  }

  attach(game, target = globalThis.window) {
    game.events.on('prestep', time => this.poll(time));
    target?.addEventListener('keydown', () => this.setDevice('keyboard'), { capture: true });
  }
}

export const gamepads = new GamepadHub();
