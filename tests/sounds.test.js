import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WARRIORS } from '../src/config/warriors.js';
import { SOUND_KEYS, SWING_CLASSES, ARMOR_CLASSES } from '../src/audio/SoundManager.js';

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
