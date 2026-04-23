# Blade of Ages Art Pipeline

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

`src/fighters/AssetWarriorRenderer.js` is the production renderer. It consumes
the PNG parts produced by the art pipeline and drives them with the same
pose anchors as `WarriorRenderer`, so:

- The sprite hand coincides with the weapon-trail origin (`computeWeaponGeometry`
  is shared between the two renderers).
- `anchors.armOffsetX/Y/Reach` and `trail.renderedWeaponLength` in each
  fighter's profile still govern where the blade tip lands, so trail tuning
  carries over automatically when you re-generate art.

Each PNG part must follow the orientation contract the renderer assumes:

- `torso.png` — hip at bottom, neck at top.
- `head.png` — chin at bottom, crown at top.
- `upper_arm.png` / `lower_arm.png` / `upper_leg.png` / `lower_leg.png` —
  joint ring at top, limb extending downward at rest.
- `weapon.png` — grip at top, blade/barrel extending downward at rest.

If a generated asset breaks that contract, fix the prompt or flip the asset
at generation time rather than piling per-fighter rotation offsets onto the
renderer. The vector `WarriorRenderer` remains the automatic fallback when a
PNG is missing, so development builds without assets still render.
