import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WARRIORS } from '../src/config/warriors.js';
import { SoundManager, SOUND_KEYS, SWING_CLASSES, ARMOR_CLASSES } from '../src/audio/SoundManager.js';

const SOUNDS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'sounds');

test('every warrior has a valid swing and armour sound class', () => {
  for (const w of WARRIORS) {
    assert.ok(SWING_CLASSES.includes(w.sound?.swing), `${w.id} swing class: ${w.sound?.swing}`);
    assert.ok(ARMOR_CLASSES.includes(w.sound?.armor), `${w.id} armour class: ${w.sound?.armor}`);
  }
});

test('every loaded sound has a rendered file', () => {
  for (const key of SOUND_KEYS) {
    assert.ok(fs.existsSync(path.join(SOUNDS_DIR, `${key}.wav`)), `missing ${key}.wav`);
  }
});

test('no stale sound files are left unloaded', () => {
  const files = fs.readdirSync(SOUNDS_DIR).filter((f) => f.endsWith('.wav')).map((f) => f.slice(0, -4));
  assert.deepEqual(files.filter((f) => !SOUND_KEYS.includes(f)), []);
});

function stubScene() {
  const played = [];
  return {
    played,
    sound: { play: (key, cfg) => played.push({ key, ...cfg }) },
    cache: { audio: { exists: () => true } },
  };
}

test('fighter sounds resolve to the weapon or armour variant at the base volume', () => {
  const scene = stubScene();
  const fighter = { scene, config: { sound: { swing: 'curved', armor: 'plate' } } };
  for (const type of ['light_attack', 'heavy_attack', 'hit', 'hit_heavy', 'jump', 'special']) {
    SoundManager.playFighter(fighter, type);
  }
  assert.deepEqual(scene.played.map((p) => p.key), [
    'light_attack_curved', 'heavy_attack_curved', 'hit_plate', 'hit_heavy_plate', 'jump_plate', 'special',
  ]);
  // Randomisation only lowers volume (by at most 10%) and only on combat sounds.
  assert.ok(scene.played[2].volume <= 0.95 && scene.played[2].volume >= 0.95 * 0.9);
  assert.equal(scene.played[5].volume, 1.0);
  assert.equal(scene.played[5].detune, 0);
});

test('fighters without sound classes fall back to blade and mail', () => {
  const scene = stubScene();
  SoundManager.playFighter({ scene, config: {} }, 'hit');
  SoundManager.playFighter({ scene, config: {} }, 'light_attack');
  assert.deepEqual(scene.played.map((p) => p.key), ['hit_mail', 'light_attack_blade']);
});

test('playing without a scene or with an unloaded key is a no-op', () => {
  assert.doesNotThrow(() => SoundManager.playFighter(null, 'hit'));
  const scene = stubScene();
  scene.cache.audio.exists = () => false;
  SoundManager.play(scene, 'hit_plate');
  assert.equal(scene.played.length, 0);
});
