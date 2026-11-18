import test from 'node:test';
import assert from 'node:assert/strict';
import { BUTTON, snapshot, fightState, menuState } from '../src/input/gamepadMapping.js';
import { GamepadHub, REPEAT_DELAY, REPEAT_INTERVAL, gamepads } from '../src/input/gamepads.js';
import { initialFightState, stepFightInput } from '../src/input/fightInput.js';
import { bindMenuInput } from '../src/input/menuInput.js';

// A browser-shaped Gamepad with the given buttons held.
function pad(index, held = [], axes = [0, 0]) {
  const buttons = Array.from({ length: 17 }, (_, i) => ({ pressed: held.includes(i), value: held.includes(i) ? 1 : 0 }));
  return { index, connected: true, mapping: 'standard', buttons, axes };
}

test('face buttons map to fight actions', () => {
  const s = fightState(snapshot(pad(0, [BUTTON.SQUARE, BUTTON.R1])));
  assert.equal(s.lightAttack, true);
  assert.equal(s.block, true);
  assert.equal(s.heavyAttack, false);
  assert.equal(s.special, false);
  assert.equal(fightState(snapshot(pad(0, [BUTTON.CROSS]))).jump, true);
  assert.equal(fightState(snapshot(pad(0, [BUTTON.CIRCLE]))).special, true);
});

test('stick moves; slight vertical drift does not jump or crouch', () => {
  const walk = fightState(snapshot(pad(0, [], [-0.9, 0.5])));
  assert.equal(walk.left, true);
  assert.equal(walk.jump, false);
  assert.equal(walk.crouch, false);
  assert.equal(fightState(snapshot(pad(0, [], [0, 0.8]))).crouch, true);
  assert.equal(fightState(snapshot(pad(0, [], [0.3, 0]))).right, false, 'inside the deadzone');
});

test('menu stick picks one direction on a diagonal', () => {
  const s = menuState(snapshot(pad(0, [], [0.7, 0.6])));
  assert.equal(s.right, true);
  assert.equal(s.down, false);
});

test('hub fires menu actions on press, then repeats held directions', () => {
  let pads = [pad(0, [BUTTON.CROSS, BUTTON.RIGHT])];
  const hub = new GamepadHub(() => pads);
  hub.poll(0);
  assert.deepEqual([...hub.menuFired].sort(), ['any', 'confirm', 'right']);
  hub.poll(16);
  assert.equal(hub.menuFired.size, 0, 'held buttons do not refire');
  hub.poll(REPEAT_DELAY);
  assert.deepEqual([...hub.menuFired], ['right'], 'directions repeat, confirm does not');
  hub.poll(REPEAT_DELAY + REPEAT_INTERVAL - 1);
  assert.equal(hub.menuFired.size, 0);
  hub.poll(REPEAT_DELAY + REPEAT_INTERVAL);
  assert.deepEqual([...hub.menuFired], ['right']);
  pads = [pad(0)];
  hub.poll(1000);
  pads = [pad(0, [BUTTON.CROSS])];
  hub.poll(1016);
  assert.ok(hub.menuFired.has('confirm'), 'a fresh press fires again');
});

test('pads go to players in index order; allPads merges them', () => {
  const hub = new GamepadHub(() => [pad(3, [BUTTON.TRIANGLE]), null, pad(1, [BUTTON.SQUARE])]);
  hub.poll(0);
  assert.equal(hub.count, 2);
  assert.equal(hub.fightHeld(0).lightAttack, true, 'lowest index is player one');
  assert.equal(hub.fightHeld(0).heavyAttack, false);
  assert.equal(hub.fightHeld(1).heavyAttack, true);
  assert.deepEqual(hub.fightHeld(2), {}, 'no pad, no input');
  const all = hub.fightHeld(0, true);
  assert.equal(all.lightAttack && all.heavyAttack, true);
});

test('hub tracks the last device and announces changes', () => {
  const hub = new GamepadHub(() => [pad(0, [BUTTON.CROSS])]);
  const seen = [];
  hub.onChange(h => seen.push(h.lastDevice));
  hub.poll(0);
  hub.setDevice('keyboard');
  hub.setDevice('keyboard');
  assert.deepEqual(seen, ['gamepad', 'keyboard']);
});

test('a throwing pad source reads as no pads', () => {
  const hub = new GamepadHub(() => { throw new Error('blocked by permissions policy'); });
  hub.poll(0);
  assert.equal(hub.count, 0);
});

test('a player keeps their slot when a lower pad disconnects', () => {
  let pads = [pad(0, [BUTTON.SQUARE]), pad(1, [BUTTON.TRIANGLE])];
  const hub = new GamepadHub(() => pads);
  hub.poll(0);
  pads = [null, pad(1, [BUTTON.TRIANGLE])];
  hub.poll(16);
  assert.equal(hub.hasPadFor(0), false, 'player one lost their pad');
  assert.deepEqual(hub.fightHeld(0), {}, 'player two does not slide into player one');
  assert.equal(hub.fightHeld(1).heavyAttack, true);
  pads = [pad(0, [BUTTON.SQUARE]), pad(1, [BUTTON.TRIANGLE])];
  hub.poll(32);
  assert.equal(hub.fightHeld(0).lightAttack, true, 'a reconnect refills the free slot');
  assert.equal(hub.fightHeld(1).heavyAttack, true);
});

test('pads without the standard mapping are ignored', () => {
  const odd = { ...pad(0, [BUTTON.CROSS], [-1, 1]), mapping: '' };
  const hub = new GamepadHub(() => [odd]);
  hub.poll(0);
  assert.equal(hub.count, 0);
  assert.equal(hub.menuFired.size, 0);
  assert.deepEqual(hub.fightHeld(0, true), {});
});

test('fight input: attacks and jump fire once per press; movement, crouch and block hold', () => {
  const state = initialFightState();
  const held = { lightAttack: true, jump: true, crouch: true, block: true, right: true };
  const first = stepFightInput(state, held, 0, 250);
  assert.equal(first.lightAttack && first.jump && first.crouch && first.block && first.right, true);
  const second = stepFightInput(state, held, 16, 250);
  assert.equal(second.lightAttack, false);
  assert.equal(second.jump, false);
  assert.equal(second.crouch && second.block && second.right, true);
  const released = stepFightInput(state, {}, 32, 250);
  assert.equal(released.right, false);
  assert.equal(stepFightInput(state, { lightAttack: true }, 48, 250).lightAttack, true, 'a new press fires again');
});

test('fight input: double-tap dashes only inside the window', () => {
  const state = initialFightState();
  assert.equal(stepFightInput(state, { right: true }, 0, 250).dash, 0);
  stepFightInput(state, {}, 50, 250);
  assert.equal(stepFightInput(state, { right: true }, 200, 250).dash, 1);
  stepFightInput(state, {}, 260, 250);
  assert.equal(stepFightInput(state, { left: true }, 300, 250).dash, 0);
  stepFightInput(state, {}, 350, 250);
  assert.equal(stepFightInput(state, { left: true }, 700, 250).dash, 0, 'too slow');
});

// Minimal stand-in for a Phaser scene's event emitters.
function fakeScene() {
  const emitter = () => {
    const map = new Map();
    return {
      map,
      on(name, fn) { (map.get(name) ?? map.set(name, []).get(name)).push(fn); },
      once(name, fn) { const wrap = (...a) => { this.off(name, wrap); fn(...a); }; this.on(name, wrap); },
      off(name, fn) { map.set(name, (map.get(name) ?? []).filter(f => f !== fn)); },
      emit(name, ...a) { for (const fn of [...(map.get(name) ?? [])]) fn(...a); },
    };
  };
  return { events: emitter(), input: { keyboard: emitter() }, _transitioning: false };
}

test('menu input: keys and pad presses dispatch, transitions block them, shutdown unbinds', () => {
  const scene = fakeScene();
  const calls = [];
  bindMenuInput(scene, { confirm: () => calls.push('confirm'), back: () => calls.push('back') }, { keys: { confirm: ['F'] } });
  scene.input.keyboard.emit('keydown-ENTER');
  scene.input.keyboard.emit('keydown-F');
  scene.input.keyboard.emit('keydown-ESC');
  assert.deepEqual(calls, ['confirm', 'confirm', 'back']);

  gamepads.menuFired = new Set(['back', 'left']);
  scene.events.emit('update');
  assert.deepEqual(calls.slice(3), ['back'], 'unbound actions are ignored');

  scene._transitioning = true;
  scene.input.keyboard.emit('keydown-ENTER');
  scene.events.emit('update');
  assert.equal(calls.length, 4, 'nothing fires mid-transition');

  scene.events.emit('shutdown');
  assert.equal(scene.events.map.get('update').length, 0, 'update listener removed');
  gamepads.menuFired = new Set();
});
