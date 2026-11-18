// Per-frame fight input from held buttons. Pure, so it tests under node;
// InputManager feeds it the merged keyboard + gamepad state.

export const FIGHT_ACTIONS = ['left', 'right', 'jump', 'crouch', 'lightAttack', 'heavyAttack', 'block', 'special'];
// Fire once per press rather than every frame while held.
export const EDGE_ACTIONS = ['jump', 'lightAttack', 'heavyAttack', 'special'];

export function initialFightState() {
  return {
    prevDown: Object.fromEntries(FIGHT_ACTIONS.map(a => [a, false])),
    // Double-tap a direction to dash.
    lastTap: { dir: 0, time: -Infinity },
  };
}

// held: { action: boolean }. Mutates state; returns the input for this frame.
export function stepFightInput(state, held, now, dashWindow) {
  let dash = 0;
  for (const [key, dir] of [['left', -1], ['right', 1]]) {
    if (held[key] && !state.prevDown[key]) {
      if (state.lastTap.dir === dir && now - state.lastTap.time <= dashWindow) {
        dash = dir;
        state.lastTap = { dir: 0, time: -Infinity };
      } else {
        state.lastTap = { dir, time: now };
      }
    }
  }

  const input = { dash };
  for (const action of FIGHT_ACTIONS) input[action] = Boolean(held[action]);
  for (const action of EDGE_ACTIONS) input[action] = input[action] && !state.prevDown[action];

  state.prevDown = Object.fromEntries(FIGHT_ACTIONS.map(a => [a, Boolean(held[a])]));
  return input;
}
