// Game dimensions and core constants
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Physics
export const GRAVITY = 1200;
export const GROUND_Y = 580;

// Combat
export const LIGHT_ATTACK_DAMAGE = 8;
export const HEAVY_ATTACK_DAMAGE = 18;
export const BLOCK_DAMAGE_REDUCTION = 0.75;
export const SPECIAL_METER_MAX = 100;
export const SPECIAL_METER_PER_DAMAGE = 1.2;
export const HITSTOP_DURATION_LIGHT = 50;
export const HITSTOP_DURATION_HEAVY = 120;
export const KNOCKBACK_LIGHT = 150;
export const KNOCKBACK_HEAVY = 300;

// Rounds
export const ROUNDS_TO_WIN = 2;
export const ROUND_START_DELAY = 1500;
export const ROUND_END_DELAY = 2000;

// Fighter defaults
export const DEFAULT_FIGHTER_SPEED = 250;
export const DEFAULT_FIGHTER_JUMP_FORCE = -850;
export const DEFAULT_FIGHTER_HP = 100;

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
