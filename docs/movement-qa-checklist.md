# Movement and Animation QA Checklist

Use this checklist when auditing any fighter after animation or renderer
changes. Each fighter should pass every row across every arena background.
Press **F1** in the fight scene to toggle the debug overlay, which shows
anchor points, weapon line, and hitboxes.

## Per-Fighter Rows

For every warrior:

- [ ] **Idle** — breathing cadence reads as steady; weapon does not drift or
      pop on loop restart.
- [ ] **Walk** — feet, hips, and weapon track together; the weapon does not
      detach from the hand.
- [ ] **Crouch / Jump** — pose silhouette stays readable; no torso/leg
      clipping.
- [ ] **Light attack** — swing reads as one motion from anticipation through
      impact through recovery; the trail sits on top of the drawn weapon.
- [ ] **Heavy attack** — weight of the swing is visible (slower anticipation,
      longer follow-through); the trail length reflects the heavier blow.
- [ ] **Special** — distinct from heavy attack in silhouette and trail color;
      glow reads clearly against every arena.
- [ ] **Hit reaction** — body arcs back from the impact direction; the weapon
      follows the arm rather than clipping through the body.
- [ ] **Block** — guard pose is recognisable at a glance; shield/weapon
      positioning matches the fighter's kit.
- [ ] **Trail / FX correctness** — no ghost weapon, no duplicated blade; the
      trail origin coincides with the hand and the trail tip coincides with
      the weapon tip.
- [ ] **Silhouette clarity** — fighter is distinguishable from every arena
      background without relying on colour.

## Weapon-Family Regression Matrix

At least one fighter from each family must pass the full row above:

| Family | Canary fighter | Key check |
| --- | --- | --- |
| Short blade | **Gladiator** (gladius) | No second translucent sword during attack |
| Heavy weapon | **Viking** (war axe) | Wide arcing smear reflects weighted swing |
| Thrust-led | **Zulu** (iklwa) or Conquistador (rapier) | Forward stab smear, minimal lateral sweep |
| Unconventional | **Seal** (rifle-as-melee) | Short stock-led smear, not a sword slash |
| Long blade | **Knight** (longsword) or Samurai (katana) | Clean arc from shoulder through the blade edge |

## Pass Criteria Snapshot

- Gladiator light and heavy attacks: **no** second translucent sword.
- Viking heavy attack: still reads as a weighted axe swing after renderer
  updates.
- At least four fighters from different weapon families inspected every
  release cycle.
- Build runs in both `npm run dev` (preview) and `npm run build` without
  warnings or runtime errors.
