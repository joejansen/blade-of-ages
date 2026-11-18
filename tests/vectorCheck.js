import { setStretch, setMood } from '../src/art/vector/kit.js';

// A stand-in 2D context that records every coordinate drawn at the top
// level. form() shades inside save()/restore() with a translated copy of the
// path, which is clipped, so nested drawing is not measured.
function recordingContext() {
  const seen = [];
  let depth = 0;
  const add = (x, y) => { if (depth === 0) seen.push([x, y]); };
  const handlers = {
    save: () => { depth++; },
    restore: () => { depth--; },
    moveTo: add,
    lineTo: add,
    bezierCurveTo: (a, b, c, d, x, y) => add(x, y),
    quadraticCurveTo: (a, b, x, y) => add(x, y),
    arc: (x, y, r) => { add(x - r, y - r); add(x + r, y + r); },
    ellipse: (x, y, rx, ry) => { const r = Math.max(rx, ry); add(x - r, y - r); add(x + r, y + r); },
    rect: (x, y, w, h) => { add(x, y); add(x + w, y + h); },
    roundRect: (x, y, w, h) => { add(x, y); add(x + w, y + h); },
    fillRect: (x, y, w, h) => { add(x, y); add(x + w, y + h); },
    createRadialGradient: () => ({ addColorStop() {} }),
    createLinearGradient: () => ({ addColorStop() {} }),
  };
  const ctx = new Proxy({}, {
    get: (target, key) => handlers[key] || target[key] || (() => {}),
    set: (target, key, value) => { target[key] = value; return true; },
  });
  return { ctx, seen, depth: () => depth };
}

// Draw every part of a warrior definition against the recording context and
// return a list of problems (empty when clean).
export function checkParts(parts) {
  const problems = [];
  for (const { name, part, box } of parts) {
    const { ctx, seen, depth } = recordingContext();
    setStretch(part.stretch || 1);
    setMood();
    try {
      part.draw(ctx);
    } catch (error) {
      problems.push(`${name}: threw ${error.message}`);
      continue;
    } finally {
      setStretch(1);
    }
    if (depth() !== 0) problems.push(`${name}: save/restore unbalanced`);
    if (seen.length <= 3) problems.push(`${name}: draws nothing`);
    for (const [x, y] of seen) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) { problems.push(`${name}: non-finite coordinate`); break; }
      // Half a unit of slack for the ink line.
      if (x < box[0] + 0.5 || x > box[2] - 0.5 || y < box[1] + 0.5 || y > box[3] - 0.5) {
        problems.push(`${name}: (${x.toFixed(1)}, ${y.toFixed(1)}) is outside box [${box.map(v => v.toFixed(1))}] and would be clipped`);
        break;
      }
    }
  }
  return problems;
}

// CLI for work in progress: node tests/vectorCheck.js <id> <weaponLength>
// checks src/art/vector/<id>.js before it is registered.
if (import.meta.url === `file://${process.argv[1]}`) {
  const [id, length = '50'] = process.argv.slice(2);
  const def = (await import(`../src/art/vector/${id}.js`)).default;
  const all = { ...def.parts, weapon: def.weapon(Number(length)) };
  const required = ['torso', 'upper_arm', 'lower_arm', 'upper_leg', 'lower_leg', 'foot', 'head'];
  const problems = required.filter(n => !all[n]).map(n => `${n}: missing`);
  const boxed = Object.entries(all).map(([name, part]) => {
    const k = part.stretch || 1;
    return { name, part, box: [part.box[0] * k, part.box[1], part.box[2] * k, part.box[3]] };
  });
  problems.push(...checkParts(boxed));
  if (def.id !== id) problems.push(`default export id is "${def.id}", expected "${id}"`);
  console.log(problems.length ? problems.join('\n') : `${id}: ${boxed.length} parts OK`);
  process.exit(problems.length ? 1 : 0);
}
