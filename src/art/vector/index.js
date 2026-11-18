import gladiator from './gladiator.js';
import { setStretch, setMood } from './kit.js';

// Fighters drawn in code instead of loaded from PNG parts. Each definition
// lists its parts in rig units; they are baked to canvas textures at boot
// under the same keys the sprite renderer already uses.
const DEFINITIONS = { gladiator };

// Texture pixels per rig unit. The fight draws at ~2 px/unit and the menu
// showcases at ~3.5, so this keeps both close to 1:1 sampling.
export const PX_PER_UNIT = 5;

// Proportions for vector fighters: roughly seven heads tall, where the
// PNG puppets stand about four.
export const HEROIC_RIG = { torso: 41, upperArm: 21, forearm: 20, thigh: 28, shin: 26, sole: 5, hip: 58 };

export function isVectorWarrior(id) {
  return Boolean(DEFINITIONS[id]);
}

export const vectorWarriorIds = () => Object.keys(DEFINITIONS);

// Every part of a warrior with its drawn box (stretch applied), for tests.
export function getVectorParts(id, weaponLength) {
  return Object.entries(partsFor(id, weaponLength)).map(([name, part]) => ({ name, part, box: boxOf(part) }));
}

function partsFor(id, weaponLength) {
  const def = DEFINITIONS[id];
  return { ...def.parts, weapon: def.weapon(weaponLength) };
}

// A part may declare `stretch` to be drawn wider than its coordinates.
const boxOf = (part) => {
  const k = part.stretch || 1;
  return [part.box[0] * k, part.box[1], part.box[2] * k, part.box[3]];
};

const norm = (box, [x, y]) => [(x - box[0]) / (box[2] - box[0]), (y - box[1]) / (box[3] - box[1])];

// Landmarks in the shape src/config/assetRig.js hands the renderer:
// normalised start/end points per part, and the head's neck origin.
export function getVectorRig(id, weaponLength) {
  const rig = {};
  for (const [name, part] of Object.entries(partsFor(id, weaponLength))) {
    const box = boxOf(part);
    if (name === 'head') {
      rig.head = { origin: norm(box, part.origin), height: box[3] - box[1] };
    } else {
      rig[name] = {
        start: norm(box, part.start),
        end: part.end ? norm(box, part.end) : norm(box, part.start),
        cropTop: 0,
        pxPerUnit: PX_PER_UNIT,
      };
    }
  }
  return rig;
}

// Bake every part to a canvas texture. Browser only.
export function buildVectorTextures(scene, id, weaponLength) {
  for (const [name, part] of Object.entries(partsFor(id, weaponLength))) {
    const [x0, y0, x1, y1] = boxOf(part);
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil((x1 - x0) * PX_PER_UNIT);
    canvas.height = Math.ceil((y1 - y0) * PX_PER_UNIT);
    const ctx = canvas.getContext('2d');
    ctx.scale(PX_PER_UNIT, PX_PER_UNIT);
    ctx.translate(-x0, -y0);
    setStretch(part.stretch || 1);
    setMood(DEFINITIONS[id].mood);
    part.draw(ctx);
    setStretch(1);
    setMood();
    const key = `warrior_${id}_${name}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
  }
}
