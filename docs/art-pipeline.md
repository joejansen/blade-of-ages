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
