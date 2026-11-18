import { gamepads } from './gamepads.js';

// Menu actions, from the keyboard or any gamepad. Pad buttons: d-pad or left
// stick to move, Cross/Options to confirm, Circle for back, Triangle for alt.
export const MENU_KEYS = {
  left: ['LEFT', 'A'],
  right: ['RIGHT', 'D'],
  up: ['UP', 'W'],
  down: ['DOWN', 'S'],
  confirm: ['ENTER', 'SPACE'],
  back: ['ESC'],
  alt: [],
};

// handlers: { left, right, up, down, confirm, back, alt, any } — bind only
// what the screen uses. keys adds extra keyboard keys per action. `any`
// fires on any key or pad button.
export function bindMenuInput(scene, handlers, { keys = {} } = {}) {
  const fire = (action) => {
    if (scene._transitioning) return;
    handlers[action]?.();
  };

  for (const action of Object.keys(handlers)) {
    if (action === 'any') {
      scene.input.keyboard.on('keydown', () => fire('any'));
      continue;
    }
    for (const key of [...(MENU_KEYS[action] ?? []), ...(keys[action] ?? [])]) {
      scene.input.keyboard.on(`keydown-${key}`, () => fire(action));
    }
  }

  const onUpdate = () => {
    for (const action of gamepads.menuFired) {
      if (handlers[action]) fire(action);
    }
  };
  scene.events.on('update', onUpdate);
  scene.events.once('shutdown', () => scene.events.off('update', onUpdate));
}
