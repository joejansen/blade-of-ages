# Blade of Ages Art Pipeline

## Current state: fighters are drawn in code

All ten warriors are now hand-authored vector art, not generated PNG parts.

- `src/art/vector/kit.js` — the ink-and-cel drawing kit (shaded outlined forms, detail strokes, bands, glints, glows) and per-warrior mood (shadow depth, light offset).
- `src/art/vector/anatomy.js` — the shared figure: body outlines, the standard frame each part is drawn in, a profile face for open helmets, scars, scratches, rivets.
- `src/art/vector/<id>.js` — one warrior: palette, the seven body parts, an optional off-hand `shield`, and a `weapon(length)` drawn tip-up from the grip with its edge on +x.
- `src/art/vector/index.js` — registry. Parts are baked to canvas textures at boot under the sprite renderer's keys, and landmarks come straight from the definitions, so nothing needs calibrating. `HEROIC_RIG` holds the proportions every fighter stands on.

To change a warrior, edit its file and run `node tests/vectorCheck.js <id> <weaponLength>` (or `npm test`): it executes every draw function and fails if anything falls outside its box, where it would be clipped. Then look at it in the game; the check cannot judge how it reads.

The PNG parts under `public/assets/warriors/` and the generation workflow below are no longer used at runtime. They are kept for reference.

A weapon is pinned at the centre of the fist (`HEROIC_RIG.grip` past the wrist) and drawn behind the forearm, so the fist closes over the grip.

## Stages are layered

`src/art/ArenaRenderer.js` builds every fight stage from three layers, configured in `src/art/stage/index.js`:

- **background**: the painted plate above the stage's `horizon`. It scrolls slower than the fighters.
- **midground**: the plate's floor below the horizon, which the fighters stand on. It moves with them.
- **foreground**: props drawn in code (`src/art/stage/props.js`, same ink kit as the fighters, in screen pixels), drawn above the fighters as dark near-silhouettes with a rim of the stage's light. It scrolls faster than the fighters, and it dims and drains to monochrome with the rest of the stage.

Place foreground props inside the frame the fight camera actually shows (about x 90–1190, down to y ≈ 690 at its usual zoom). In the middle lane (`LANE`) a prop may rise only to just above the fighters' soles; tall props go at the edges. `tests/stage.test.js` enforces both rules.

## Goal

Ship fighters that feel coherent, readable, and alive in motion.

The old workflow generated disconnected limbs first. That is fast, but it causes:

- mismatched anatomy between parts
- inconsistent silhouette language
- weak costume continuity at joints
- sprite sets that look assembled rather than designed

## New Workflow

1. Generate a full-character concept sheet first.
2. Review silhouette, costume layering, proportions, and weapon read before approving it.
3. Only after approval, generate isolated production parts that explicitly derive from that approved concept.
4. Tune the in-game fighter profile and animation clips against the approved concept, not against arbitrary part crops.

## CLI

Generate concept sheet only:

```bash
node scripts/generate-art.js knight --sheet-only
```

Generate production parts only:

```bash
node scripts/generate-art.js knight --parts-only
```

Generate both concept sheet and parts:

```bash
node scripts/generate-art.js knight
```

## Review Checklist

- silhouette is distinct from the rest of the roster
- weapon length and guard shape read clearly at game scale
- torso, limb, and head proportions feel intentional
- materials stay consistent across helmet, armor, cloth, boots, and gloves
- hip, shoulder, elbow, and knee transitions will survive part separation
- pose communicates stance and weight before animation is added

## Runtime Alignment

After approving art, update:

- `src/config/fighterProfiles.js` for stance, scale, trail color, and timing feel
- `src/fighters/animationClips.js` for clip timing and motion arcs

The renderer and animation should reinforce the concept sheet instead of compensating for disconnected parts after the fact.

### Anchors and weapon trails

Each fighter profile now declares two matched blocks that must stay in sync
with its `drawWarrior*()` function in `src/art/warriorArt.js`:

- `anchors.armOffsetX/Y` and `anchors.armReach` — the shoulder offset and
  arm length used to position the hand. These values must match the shoulder
  (`armX`, `armY`) and hand (`Math.sin(armAngle) * reach`) math in the draw
  function; otherwise the weapon trail starts from a different hand than the
  one that is actually drawn.
- `trail.renderedWeaponLength` — the on-screen length of the drawn weapon in
  pixels. The trail tip is anchored to this value, not to `weaponLength` on
  the profile, which is reserved as a ceiling for the abstract reach.
- `trail.style` controls how the smear is composed:
  - `slash` / `smash` draw an arcing cone behind the blade.
  - `tight` keeps the cone narrow for short blades (e.g. the gladius).
  - `thrust` renders motion blur along the blade with minimal lateral
    sweep (spears, rapiers).
  - `stock` renders the short offset smear appropriate to a rifle used as a
    bludgeon.

If a fighter ever looks like it has a "second translucent weapon" during an
attack, the first thing to check is whether the anchor/length values above
still match the draw function.

### Asset-driven sprite renderer (default)

`src/fighters/AssetWarriorRenderer.js` is the production renderer. Its anatomy
is solved in `src/fighters/rigGeometry.js`; the legacy vector renderer retains
its own profile anchors and automatically takes over when a PNG is missing.

Production sprite calibration lives in `src/config/assetRig.js`:

- Each part has normalized source-image `start` and `end` attachment points.
  Scale comes from joint distance, not the full image height. Skirts, hands,
  boot toes, plumes and transparent space do not define bone length.
- The torso drives the neck and both shoulders. Fixed-length two-bone arms
  and legs bend at elbows and knees. A wide stance lowers the pelvis enough
  to keep foot targets reachable. Breathing moves the body over planted feet;
  the walk cycle alternates foot travel and lift, and jump poses tuck the legs.
- Boot crops share the shin texture but remain level at the ankle. Overlap
  at the ankle keeps the foot joined while the shin bends.
- Weapon `start` is the actual grip and `end` is the cutting/barrel end.
  The axe's grip is below its head; the shipped swords point downward in
  their source files. The runtime derives orientation from those landmarks,
  including when the fighter faces left.
- Headgear is seated at the neck or brow using its own origin and size.
  Open hats/helmets receive a small drawn face and neck underneath because
  the corresponding PNGs contain headgear only. `cropTop` hides assembly tabs.

Coordinates use the entire original image and survive BootScene resampling.
When replacing an asset, inspect its actual joints and recalibrate that part;
do not assume the generator followed the requested orientation. Regeneration
should still aim for coherent full-character art as described above.

Sprite trails and the F1 debug markers consume the solved weapon geometry.
`trail.renderedWeaponLength` sets physical grip-to-tip length; smear intensity
and trail keyframes never stretch that length. Combat hitboxes, damage, reach,
and attack timing are unchanged by sprite calibration.

Run `npm test` for the full-roster joint, mirror, gait and source-landmark
regressions, then `npm run build`. Inspect the real title, character selection
and fight scenes as well; numerical landmarks cannot judge costume seams.
