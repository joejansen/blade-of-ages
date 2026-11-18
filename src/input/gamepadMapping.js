// Pure gamepad reading: a browser Gamepad becomes a plain snapshot, and a
// snapshot becomes fight or menu actions. No Phaser and no DOM, so it tests
// under node.
//
// Button indices follow the W3C "standard" mapping, which Chrome and Safari
// report for DualShock 4 and DualSense pads (and Xbox pads, whose A/B/X/Y sit
// in the same places as Cross/Circle/Square/Triangle).

export const BUTTON = {
  CROSS: 0,
  CIRCLE: 1,
  SQUARE: 2,
  TRIANGLE: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  SHARE: 8,
  OPTIONS: 9,
  L3: 10,
  R3: 11,
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
  PS: 16,
};

// Stick deflection that counts as a direction. Vertical is stiffer in a fight
// so drifting the stick while walking doesn't jump or crouch.
export const STICK_THRESHOLD = 0.5;
export const FIGHT_VERTICAL_THRESHOLD = 0.65;

export function snapshot(pad) {
  const buttons = Array.from(pad.buttons ?? [], (b) => (
    typeof b === 'object' ? Boolean(b.pressed || b.value > 0.5) : b > 0.5
  ));
  return { buttons, lx: pad.axes?.[0] ?? 0, ly: pad.axes?.[1] ?? 0 };
}

const btn = (s, i) => Boolean(s.buttons[i]);

export function fightState(s) {
  return {
    left: btn(s, BUTTON.LEFT) || s.lx < -STICK_THRESHOLD,
    right: btn(s, BUTTON.RIGHT) || s.lx > STICK_THRESHOLD,
    jump: btn(s, BUTTON.UP) || btn(s, BUTTON.CROSS) || s.ly < -FIGHT_VERTICAL_THRESHOLD,
    crouch: btn(s, BUTTON.DOWN) || s.ly > FIGHT_VERTICAL_THRESHOLD,
    lightAttack: btn(s, BUTTON.SQUARE),
    heavyAttack: btn(s, BUTTON.TRIANGLE),
    block: btn(s, BUTTON.L1) || btn(s, BUTTON.R1) || btn(s, BUTTON.L2) || btn(s, BUTTON.R2),
    special: btn(s, BUTTON.CIRCLE),
  };
}

export function menuState(s) {
  // The stick only points one way at a time, so a diagonal can't skip a
  // grid cell.
  const horizontal = Math.abs(s.lx) >= Math.abs(s.ly);
  const sx = horizontal ? s.lx : 0;
  const sy = horizontal ? 0 : s.ly;
  return {
    left: btn(s, BUTTON.LEFT) || sx < -STICK_THRESHOLD,
    right: btn(s, BUTTON.RIGHT) || sx > STICK_THRESHOLD,
    up: btn(s, BUTTON.UP) || sy < -STICK_THRESHOLD,
    down: btn(s, BUTTON.DOWN) || sy > STICK_THRESHOLD,
    confirm: btn(s, BUTTON.CROSS) || btn(s, BUTTON.OPTIONS),
    back: btn(s, BUTTON.CIRCLE),
    alt: btn(s, BUTTON.TRIANGLE),
    any: s.buttons.some(Boolean),
  };
}

// OR a list of action states together.
export function mergeStates(states) {
  const out = {};
  for (const state of states) {
    for (const [action, on] of Object.entries(state)) out[action] = Boolean(out[action] || on);
  }
  return out;
}
