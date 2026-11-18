// Swing sounds vary by weapon class, damage and jump sounds by armour class.
// Each warrior picks its classes in src/config/warriors.js (`sound`).
export const SWING_CLASSES = ['blade', 'curved', 'thrust'];
export const ARMOR_CLASSES = ['plate', 'mail', 'light'];
const SWING_SOUNDS = ['light_attack', 'heavy_attack'];
const ARMOR_SOUNDS = ['hit', 'hit_heavy', 'jump'];
const DEFAULT_CLASS = { swing: 'blade', armor: 'mail' };

// Every sound the game loads. Files are rendered by scripts/synth-sounds.js.
export const SOUND_KEYS = [
  'special', 'block', 'parry', 'guard_break', 'dash', 'body_fall',
  'clash', 'victory', 'ui_hover', 'ui_click',
  ...SWING_CLASSES.flatMap((c) => SWING_SOUNDS.map((s) => `${s}_${c}`)),
  ...ARMOR_CLASSES.flatMap((c) => ARMOR_SOUNDS.map((s) => `${s}_${c}`)),
];

// Base level per sound, balanced against each other after rendering.
const VOLUMES = {
  light_attack: 0.55,
  heavy_attack: 0.8,
  special: 1.0,
  hit: 0.95,
  hit_heavy: 1.0,
  block: 0.7,
  parry: 0.8,
  guard_break: 0.95,
  jump: 0.35,
  dash: 0.4,
  body_fall: 0.75,
  clash: 1.0,
  victory: 0.9,
  ui_hover: 0.35,
  ui_click: 0.6,
};

// Sounds that vary slightly each time so repeats don't sound mechanical.
// Kept small: large detunes on deep sounds make them thin and cartoonish.
const VARIED = new Set(['light_attack', 'heavy_attack', 'hit', 'hit_heavy', 'block', 'jump', 'dash', 'body_fall']);
const PITCH_SPREAD_CENTS = 120;
const VOLUME_SPREAD = 0.1;

export class SoundManager {
  // Routes the game's master output through a compressor so stacked impacts
  // (hit + guard break + landing) stay punchy instead of clipping.
  static installMasterBus(soundManager) {
    const { context, masterVolumeNode } = soundManager ?? {};
    if (!context || !masterVolumeNode || soundManager.__masterBus) return;
    const comp = context.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 10;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.22;
    masterVolumeNode.disconnect();
    masterVolumeNode.connect(comp);
    comp.connect(context.destination);
    soundManager.__masterBus = comp;
  }

  static play(scene, key, config = {}) {
    if (!scene || !scene.sound || !scene.cache.audio.exists(key)) return;

    let detune = config.detune ?? 0;
    let volume = config.volume ?? VOLUMES[key] ?? 0.6;
    if (config.randomize ?? VARIED.has(key)) {
      detune += (Math.random() * 2 - 1) * PITCH_SPREAD_CENTS;
      volume *= 1 - Math.random() * VOLUME_SPREAD;
    }

    scene.sound.play(key, { volume, detune });
  }

  static playUIHover(scene) {
    this.play(scene, 'ui_hover');
  }

  static playUIClick(scene) {
    this.play(scene, 'ui_click');
  }

  static playCombat(scene, type) {
    this.play(scene, type);
  }

  // Plays `type` in the variant for this fighter's weapon or armour class:
  // swings use the attacker's weapon, damage and jumps the fighter's armour.
  static playFighter(fighter, type) {
    const classes = fighter?.config?.sound ?? DEFAULT_CLASS;
    let key = type;
    if (SWING_SOUNDS.includes(type)) key = `${type}_${classes.swing ?? DEFAULT_CLASS.swing}`;
    else if (ARMOR_SOUNDS.includes(type)) key = `${type}_${classes.armor ?? DEFAULT_CLASS.armor}`;
    this.play(fighter?.scene, key, { volume: VOLUMES[type], randomize: VARIED.has(type) });
  }
}
