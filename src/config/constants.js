// Game dimensions and core constants
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Fighters are authored on a ~120px rig; the fight draws and simulates them
// at this multiple so they own roughly a third of the frame.
export const FIGHTER_SCALE = 2;

// Physics
export const GRAVITY = 2600;
export const GROUND_Y = 580;

// Combat
export const CHIP_DAMAGE_RATIO = 0.12;
export const SPECIAL_METER_MAX = 100;
export const SPECIAL_METER_PER_DAMAGE = 1.0;
export const SPECIAL_METER_PER_DAMAGE_TAKEN = 0.45;
export const GUARD_MAX = 100;
export const GUARD_REGEN_PER_SEC = 16;
export const GUARD_BREAK_STUN = 950;
export const PARRY_WINDOW = 130;      // ms after raising guard that a block parries
export const PARRY_STUN = 620;
export const INPUT_BUFFER = 170;      // ms an attack press waits for the fighter to be free
export const DASH_TAP_WINDOW = 230;   // ms between taps of a double-tap
export const ROUND_SECONDS = 60;

// Rounds
export const ROUNDS_TO_WIN = 2;
export const ROUND_START_DELAY = 1500;
export const ROUND_END_DELAY = 2000;

// Fighter defaults
export const DEFAULT_FIGHTER_SPEED = 330;
export const DEFAULT_FIGHTER_JUMP_FORCE = -1150;
export const DEFAULT_FIGHTER_HP = 150;

// Arena
export const ARENA_FLOOR_Y = GROUND_Y + 20;

// Colors
export const COLORS = {
  parchment: 0xf4e4c1,
  parchmentDark: 0xd4c4a1,
  inkBrown: 0x3e2723,
  inkBlack: 0x1a1a1a,
  gold: 0xffd700,
  bloodRed: 0xcc0000,
  healthGreen: 0x4caf50,
  healthRed: 0xf44336,
  specialBlue: 0x2196f3,
  specialGold: 0xffc107,
  white: 0xffffff,
  black: 0x000000,
};
