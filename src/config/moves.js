// Frame data for every attack. Distances are in rig units (multiplied by
// FIGHTER_SCALE in the fight); times in ms; `active` is the fraction of the
// move during which the blade can connect; it opens only once the clip has
// brought the blade round, so a hit never lands ahead of the swing.
//   lunge     forward impulse (rig units/s) applied when the strike starts
//   knockback impulse given to a defender who is hit
//   hitstun / blockstun  how long the defender is locked out
//   guard     guard-meter damage when blocked
//   chain     light pressed during this move queues that follow-up
//   knockdown the hit floors the defender, ending any combo
export const MOVES = {
  light1: {
    clip: 'light1', kind: 'light', duration: 270, active: [0.36, 0.56],
    damage: 6, reach: 60, top: -84, bottom: -22, lunge: 95,
    knockback: 105, hitstun: 255, blockstun: 190, hitstop: 55, guard: 15,
    chain: 'light2', sound: 'light_attack',
  },
  light2: {
    clip: 'light2', kind: 'light', duration: 270, active: [0.36, 0.52],
    damage: 7, reach: 62, top: -96, bottom: -22, lunge: 150,
    knockback: 115, hitstun: 280, blockstun: 200, hitstop: 60, guard: 16,
    chain: 'light3', sound: 'light_attack',
  },
  light3: {
    clip: 'light3', kind: 'light', duration: 380, active: [0.41, 0.62],
    damage: 11, reach: 66, top: -96, bottom: -10, lunge: 190,
    knockback: 250, hitstun: 420, blockstun: 240, hitstop: 100, guard: 26,
    big: true, knockdown: true, sound: 'heavy_attack',
  },
  heavy: {
    clip: 'heavy', kind: 'heavy', duration: 540, active: [0.49, 0.66],
    damage: 18, reach: 68, top: -100, bottom: -8, lunge: 140,
    knockback: 280, hitstun: 460, blockstun: 290, hitstop: 125, guard: 50,
    big: true, sound: 'heavy_attack',
  },
  air: {
    clip: 'airAttack', kind: 'light', duration: 340, active: [0.38, 0.74],
    damage: 9, reach: 58, top: -92, bottom: 14, lunge: 0,
    knockback: 150, hitstun: 360, blockstun: 210, hitstop: 70, guard: 18,
    sound: 'light_attack',
  },
  special: {
    clip: 'special', kind: 'special', duration: 760, active: [0.48, 0.68],
    damage: 30, reach: 78, top: -104, bottom: -4, lunge: 470,
    knockback: 330, hitstun: 500, blockstun: 0, hitstop: 190, guard: 0,
    big: true, unblockable: true, knockdown: true, sound: 'special',
  },
};

// A weapon's rendered length nudges how far it threatens: the spear and
// longsword out-range the gladius.
export function reachFor(move, profile) {
  const blade = profile.trail?.renderedWeaponLength ?? 50;
  return move.reach + (blade - 48) * 0.45;
}
