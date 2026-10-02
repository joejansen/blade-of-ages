import Phaser from 'phaser';
import { getFighterProfile } from '../config/fighterProfiles.js';
import { GROUND_Y } from '../config/constants.js';
import { computeWeaponGeometry } from './weaponGeometry.js';

// Sprite-driven fighter renderer. Consumes the PNG parts produced by the
// art pipeline (see docs/art-pipeline.md) and drives them with the same
// pose anchors the vector WarriorRenderer uses, so swapping between
// renderers preserves the clip-based motion feel.
//
// Asset orientation contract:
//   - torso.png — hip at bottom, neck at top (pivot at bottom).
//   - head.png — chin at bottom, crown at top (pivot at bottom).
//   - upper_arm / lower_arm / upper_leg / lower_leg — joint ring at top,
//     limb extending downward (pivot near top).
//   - weapon.png — grip at top, blade/barrel extending downward.
//
// That "limb hangs down at rest" orientation is what our generated art
// pipeline produces. The renderer rotates each part to match the vector
// renderer's pose math (which expects "limb up at 0°"), so at pose time the
// two renderers agree on hand, tip, and foot positions.

const DEG2RAD = Math.PI / 180;
const AURA_OFFSET_Y = -54;
const CROUCH_OFFSET_Y = 30;
const HEAD_BOB_FACTOR = 0.25;
const TORSO_LEN = 60;
const HIP_FROM_TORSO_TOP = 28;

// Target visible height (in game pixels) for each body part. These match
// the vector renderer's proportions so the sprite-driven character reads at
// the same scale as before: torso ~ TORSO_LEN, limbs ~ half of the arm /
// leg reach, head just above the torso. Weapon is scaled per-fighter from
// profile.trail.renderedWeaponLength so the drawn blade matches the trail.
export const PART_TARGET_HEIGHT = {
  head: 40,
  torso: 64,
  upper_arm: 24,
  lower_arm: 26,
  upper_leg: 34,
  lower_leg: 34,
};
const WEAPON_GRIP_PADDING = 1 / 0.92; // accounts for the pivot near the grip (origin y ≈ 0.08)

const SLOT_TO_SPRITE = {
  head: 'head',
  torso: 'torso',
  front_arm_upper: 'upper_arm',
  front_arm_lower: 'lower_arm',
  back_arm_upper: 'upper_arm',
  back_arm_lower: 'lower_arm',
  front_leg_upper: 'upper_leg',
  front_leg_lower: 'lower_leg',
  back_leg_upper: 'upper_leg',
  back_leg_lower: 'lower_leg',
  weapon: 'weapon',
};

// Higher z renders in front.
const SLOT_Z = {
  back_leg_upper: 0,
  back_leg_lower: 0.5,
  back_arm_upper: 1,
  back_arm_lower: 1.5,
  front_leg_upper: 3,
  front_leg_lower: 3.5,
  torso: 4,
  head: 7,
  front_arm_upper: 8,
  front_arm_lower: 8.5,
  weapon: 9,
};

const BACK_LIMB_ALPHA = 0.72;
const BACK_LIMB_TINT = 0x9a9590;
// Number of motion samples kept for the weapon ribbon. At 60fps this is
// ~130ms of swing, long enough to read as an arc without lagging the blade.
const TRAIL_SAMPLES = 8;
// Fraction of the blade (from the hand) where the ribbon's inner edge sits,
// so the smear hugs the cutting edge rather than filling a pie wedge.
const TRAIL_INNER = 0.38;
// The leg sprites overhang the pose's foot anchor; at rest the visible sole
// sits this many (unscaled) pixels below baseY.
export const FOOT_DROP = 14;

// Rotation that points each limb along a target direction given that the
// PNG naturally extends downward from its pivot.
// Natural direction (0, 1) rotated by r becomes (-sin r, cos r).
// To land on (dx, dy), pick r = atan2(-dx, dy).
function limbRotation(dx, dy) {
  return Math.atan2(-dx, dy);
}

export class AssetWarriorRenderer {
  // options.displayScale enlarges the whole rig (menu showcases);
  // options.depth moves the rig's depth band; options.groundY pins the
  // shadow to a floor line (defaults to the fight's GROUND_Y).
  constructor(scene, warriorConfig, options = {}) {
    this.scene = scene;
    this.config = warriorConfig;
    this.profile = getFighterProfile(warriorConfig.id);
    this.parts = {};
    this.baseScales = {};
    this.available = true;
    this.displayScale = options.displayScale ?? 1;
    this.depthBase = options.depth ?? 12;
    this.groundY = options.groundY ?? GROUND_Y;
    this.shadowDepth = options.shadowDepth;
    this.trailHistory = [];

    for (const [slot, spriteName] of Object.entries(SLOT_TO_SPRITE)) {
      const textureKey = `warrior_${warriorConfig.id}_${spriteName}`;
      if (!scene.textures.exists(textureKey)) {
        this.available = false;
        continue;
      }
      const image = scene.add.image(0, 0, textureKey);

      // Scale by image height so a limb whose bone-length target is N pixels
      // actually occupies N pixels top-to-bottom. Weapons scale from the
      // per-fighter renderedWeaponLength so the blade lines up with the trail.
      const targetHeight = spriteName === 'weapon'
        ? this.profile.trail.renderedWeaponLength * WEAPON_GRIP_PADDING
        : (PART_TARGET_HEIGHT[spriteName] || 40);
      const baseScale = targetHeight / (image.height || targetHeight);
      this.baseScales[slot] = baseScale;
      image.setScale(baseScale);

      if (slot === 'torso' || slot === 'head') {
        image.setOrigin(0.5, 1.0);
      } else {
        image.setOrigin(0.5, 0.08);
      }

      if (slot.startsWith('back_')) {
        // Push back limbs into shade so the silhouette reads in depth.
        image.setAlpha(BACK_LIMB_ALPHA);
        image.setTint(BACK_LIMB_TINT);
      }
      image.setVisible(false);
      this.parts[slot] = image;
    }

    this.shadowGraphics = scene.add.graphics();
    this.trailGraphics = scene.add.graphics();
    this.trailGraphics.setBlendMode(Phaser.BlendModes.ADD);
    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setBlendMode(Phaser.BlendModes.ADD);
    this.auraImage = scene.textures.exists('fx_soft')
      ? scene.add.image(0, 0, 'fx_soft').setBlendMode(Phaser.BlendModes.ADD)
        .setTint(this.profile.fx.specialGlow).setVisible(false)
      : null;
    this.setDepthBase(this.depthBase);
  }

  setDepthBase(base) {
    this.depthBase = base;
    for (const [slot, img] of Object.entries(this.parts)) {
      img.setDepth(base + SLOT_Z[slot] * 0.01);
    }
    this.shadowGraphics.setDepth(this.shadowDepth ?? base - 0.3);
    this.trailGraphics.setDepth(base + 0.25);
    this.glowGraphics.setDepth(base - 0.1);
    this.auraImage?.setDepth(base - 0.12);
  }

  setVisible(visible) {
    for (const img of Object.values(this.parts)) img.setVisible(visible);
    this.shadowGraphics.setVisible(visible);
    this.trailGraphics.setVisible(visible);
    this.glowGraphics.setVisible(visible);
    if (!visible) this.auraImage?.setVisible(false);
  }

  setAlpha(alpha) {
    for (const [slot, img] of Object.entries(this.parts)) {
      img.setAlpha(alpha * (slot.startsWith('back_') ? BACK_LIMB_ALPHA : 1));
    }
    this.shadowGraphics.setAlpha(alpha);
    this.trailGraphics.setAlpha(alpha);
    this.glowGraphics.setAlpha(alpha);
    this.auraAlphaScale = alpha;
  }

  // Flash every part toward a colour (hit flash / special charge).
  setFlash(color, on) {
    if (this.flashing === on) return;
    this.flashing = on;
    for (const [slot, img] of Object.entries(this.parts)) {
      if (on) img.setTintFill(color);
      else img.setTint(slot.startsWith('back_') ? BACK_LIMB_TINT : 0xffffff);
    }
  }

  isAvailable() {
    return this.available;
  }

  render(x, baseY, facingRight, pose, state, specialRatio) {
    if (!this.available) return;
    const dir = facingRight ? 1 : -1;
    const profile = this.profile;
    const anchors = profile.anchors;
    const scale = profile.renderScale * this.displayScale;

    // worldRefX/worldRefY is the scale pivot — everything below is expressed
    // as a local offset from that point and then scaled by profile.renderScale
    // before being placed. bodyY translates the whole character together.
    const worldRefX = x + profile.renderOffsetX;
    const worldRefY = baseY + profile.renderOffsetY + (pose.bodyY || 0);
    const s = (lx, ly) => [worldRefX + lx * scale, worldRefY + ly * scale];

    // Weapon geometry already accepts a scale multiplier; passing renderScale
    // here guarantees the trail origin and weapon-tip math track the scaled
    // image positions below.
    const geom = computeWeaponGeometry(pose, profile, worldRefX, worldRefY, dir, scale);

    const torsoOffY = anchors.torsoOffsetY
      + pose.crouchFactor * CROUCH_OFFSET_Y
      + (pose.headY || 0) * HEAD_BOB_FACTOR;

    // Torso pivots at the hip and extends upward.
    const [hipX, hipY] = s(0, torsoOffY + HIP_FROM_TORSO_TOP);
    const torsoRot = (pose.torsoAngle || 0) * DEG2RAD * dir;
    this.#place('torso', hipX, hipY, torsoRot, scale);

    // Neck = top of rotated torso. Head rides the torso with a soft lag.
    const neckX = hipX + Math.sin(torsoRot) * TORSO_LEN * scale;
    const neckY = hipY - Math.cos(torsoRot) * TORSO_LEN * scale;
    this.#place('head', neckX, neckY, torsoRot * 0.3, scale);

    // Front arm: shoulder -> hand, elbow at midpoint. Geometry is already
    // in world coordinates, pre-scaled.
    const frontArmRot = limbRotation(geom.handX - geom.armX, geom.handY - geom.armY);
    const elbowX = (geom.armX + geom.handX) / 2;
    const elbowY = (geom.armY + geom.handY) / 2;
    this.#place('front_arm_upper', geom.armX, geom.armY, frontArmRot, scale);
    this.#place('front_arm_lower', elbowX, elbowY, frontArmRot, scale);

    // Weapon pivots at the hand, points along the vector's weapon direction.
    const weaponRot = limbRotation(
      Math.sin(geom.weaponAngle) * dir,
      -Math.cos(geom.weaponAngle),
    );
    this.#place('weapon', geom.handX, geom.handY, weaponRot, scale);

    // Back arm — attenuated swing; keeps the silhouette reading as a
    // two-armed fighter even without per-fighter shield art.
    const backArmAngle = (-(pose.armAngle || 0) * 0.35) * DEG2RAD;
    const backReach = anchors.armReach * 0.85;
    const [backShoulderX, backShoulderY] = s(-12 * dir, torsoOffY - 6);
    const backHandX = backShoulderX + Math.sin(backArmAngle) * backReach * dir * scale;
    const backHandY = backShoulderY - Math.cos(backArmAngle) * backReach * scale;
    const backArmRot = limbRotation(backHandX - backShoulderX, backHandY - backShoulderY);
    this.#place('back_arm_upper', backShoulderX, backShoulderY, backArmRot, scale);
    this.#place('back_arm_lower', (backShoulderX + backHandX) / 2, (backShoulderY + backHandY) / 2, backArmRot, scale);

    // Legs — hip to foot. Foot target positions match the vector draw
    // functions: front foot inside-of-stance, back foot outside.
    const legSpread = pose.legSpread || 0;
    const [frontHipX, hipLegY] = s(-5 * dir, torsoOffY + HIP_FROM_TORSO_TOP);
    const [backHipX] = s(3 * dir, 0);
    const [frontFootX, floorY] = s(-legSpread * 0.6 * dir, -5);

    const frontLegRot = limbRotation(frontFootX - frontHipX, floorY - hipLegY);
    this.#place('front_leg_upper', frontHipX, hipLegY, frontLegRot, scale);
    this.#place('front_leg_lower', (frontHipX + frontFootX) / 2, (hipLegY + floorY) / 2, frontLegRot, scale);

    const [backFootX] = s(legSpread * 0.4 * dir, 0);
    const backLegRot = limbRotation(backFootX - backHipX, floorY - hipLegY);
    this.#place('back_leg_upper', backHipX, hipLegY, backLegRot, scale);
    this.#place('back_leg_lower', (backHipX + backFootX) / 2, (hipLegY + floorY) / 2, backLegRot, scale);

    for (const img of Object.values(this.parts)) {
      img.setVisible(true);
      img.setFlipX(!facingRight);
    }

    this.#drawShadow(x, baseY);
    this.#drawAura(x, baseY, pose, specialRatio);
    this.#drawTrail(geom, dir, pose);
  }

  #drawShadow(x, baseY) {
    const g = this.shadowGraphics;
    g.clear();
    const lift = Math.max(0, this.groundY - baseY);
    const k = Phaser.Math.Clamp(1 - lift / 320, 0.25, 1);
    const w = 78 * this.displayScale * k;
    const h = 14 * this.displayScale * k;
    const y = this.groundY + FOOT_DROP * this.profile.renderScale * this.displayScale;
    g.fillStyle(0x000000, 0.22 * k);
    g.fillEllipse(x, y + 1, w * 1.5, h * 1.6);
    g.fillStyle(0x000000, 0.45 * k);
    g.fillEllipse(x, y, w, h);
  }

  #place(slot, x, y, rotation, scale) {
    const img = this.parts[slot];
    if (!img) return;
    img.setPosition(x, y);
    img.setRotation(rotation);
    img.setScale(this.baseScales[slot] * scale);
  }

  #drawAura(x, baseY, pose, specialRatio) {
    this.glowGraphics.clear();
    const strength = Math.max(pose.glow || 0, specialRatio || 0);
    if (strength <= 0.01) {
      this.auraImage?.setVisible(false);
      return;
    }

    const color = this.profile.fx.specialGlow;
    const ds = this.displayScale;
    const cx = x + this.profile.renderOffsetX;
    const cy = baseY + (this.profile.renderOffsetY + AURA_OFFSET_Y) * ds;
    const t = this.scene.time.now / 1000;
    const pulse = 0.85 + Math.sin(t * 6) * 0.15;

    // Layered additive halo; full meter breathes.
    const full = specialRatio >= 1;
    const k = strength * (full ? pulse : 0.6);
    if (this.auraImage) {
      // Soft radial halo; the texture's falloff does the feathering.
      this.auraImage.setVisible(true).setPosition(cx, cy)
        .setScale((120 * ds) / 64, (170 * ds) / 64)
        .setAlpha((0.12 + k * 0.28) * (this.auraAlphaScale ?? 1));
    }
    if (full) {
      // Rising motes along the silhouette.
      for (let i = 0; i < 6; i++) {
        const phase = (t * 0.9 + i / 6) % 1;
        const px = cx + Math.sin(i * 2.3 + t * 2) * 30 * ds;
        const py = baseY - phase * 120 * ds;
        this.glowGraphics.fillStyle(color, (1 - phase) * 0.8);
        this.glowGraphics.fillCircle(px, py, (2.5 - phase * 1.5) * ds);
      }
    }
  }

  #drawTrail(geom, dir, pose) {
    this.trailGraphics.clear();
    const trail = this.profile.trail;
    if (!pose.trailAlpha || trail.style === 'none') {
      this.trailHistory.length = 0;
      return;
    }

    const alpha = pose.trailAlpha * trail.alphaScale;
    if (alpha <= 0.01) {
      this.trailHistory.length = 0;
      return;
    }

    const color = this.profile.fx.trailColor;
    const width = (pose.trailWidth ?? this.profile.weaponWidth) * trail.widthScale;

    this.#recordTrail(geom);
    this.#drawRibbon(color, alpha);

    if (trail.style === 'thrust' || trail.style === 'stock') {
      this.#drawThrustSmear(geom, dir, width, color, alpha * 0.8, trail);
    } else {
      this.#drawArcSmear(geom, trail.sweep, dir, width, color, alpha * 0.6);
    }
  }

  // Only record when the blade actually moves: during hitstop the pose is
  // frozen and the ribbon should freeze with it rather than collapse.
  #recordTrail(geom) {
    const last = this.trailHistory[this.trailHistory.length - 1];
    const innerX = geom.handX + (geom.tipX - geom.handX) * TRAIL_INNER;
    const innerY = geom.handY + (geom.tipY - geom.handY) * TRAIL_INNER;
    if (last && Math.hypot(last.tx - geom.tipX, last.ty - geom.tipY) < 1.5) return;
    this.trailHistory.push({ ix: innerX, iy: innerY, tx: geom.tipX, ty: geom.tipY });
    if (this.trailHistory.length > TRAIL_SAMPLES) this.trailHistory.shift();
  }

  #drawRibbon(color, alpha) {
    const h = this.trailHistory;
    if (h.length < 2) return;
    const g = this.trailGraphics;
    const n = h.length;
    for (let i = 1; i < n; i++) {
      const a = h[i - 1];
      const b = h[i];
      const k = i / (n - 1);
      g.fillStyle(color, alpha * 0.55 * k * k);
      g.fillPoints([
        { x: a.ix, y: a.iy }, { x: a.tx, y: a.ty }, { x: b.tx, y: b.ty }, { x: b.ix, y: b.iy },
      ], true);
    }
    // White-hot leading edge along the tip path.
    for (let i = 1; i < n; i++) {
      const a = h[i - 1];
      const b = h[i];
      const k = i / (n - 1);
      g.lineStyle(1 + k * 2.5 * this.displayScale, 0xffffff, alpha * 0.9 * k);
      g.lineBetween(a.tx, a.ty, b.tx, b.ty);
    }
  }

  #drawArcSmear(geom, sweep, dir, width, color, alpha) {
    const { handX, handY, tipX, tipY, weaponAngle, weaponLen } = geom;
    const sweepAngle = weaponAngle - sweep;
    const sweepX = handX + Math.sin(sweepAngle) * weaponLen * dir;
    const sweepY = handY - Math.cos(sweepAngle) * weaponLen;

    if (sweep > 0.02) {
      this.trailGraphics.fillStyle(color, alpha * 0.14);
      this.trailGraphics.beginPath();
      this.trailGraphics.moveTo(handX, handY);
      this.trailGraphics.lineTo(tipX, tipY);
      this.trailGraphics.lineTo(sweepX, sweepY);
      this.trailGraphics.closePath();
      this.trailGraphics.fillPath();
    }

    const strokeWidth = Math.max(2, width * 0.22);
    this.trailGraphics.lineStyle(strokeWidth, color, alpha * 0.4);
    this.trailGraphics.beginPath();
    this.trailGraphics.moveTo(handX, handY);
    this.trailGraphics.lineTo(tipX, tipY);
    this.trailGraphics.strokePath();
  }

  #drawThrustSmear(geom, dir, width, color, alpha, trail) {
    const { handX, handY, tipX, tipY, weaponAngle, weaponLen } = geom;
    const trailBack = weaponLen * 0.35;
    const backX = handX - Math.sin(weaponAngle) * trailBack * dir;
    const backY = handY + Math.cos(weaponAngle) * trailBack;

    const strokeWidth = Math.max(2, width * 0.28);
    this.trailGraphics.lineStyle(strokeWidth, color, alpha * 0.28);
    this.trailGraphics.beginPath();
    this.trailGraphics.moveTo(backX, backY);
    this.trailGraphics.lineTo(tipX, tipY);
    this.trailGraphics.strokePath();

    if (trail.sweep > 0.02) {
      const sweepAngle = weaponAngle - trail.sweep;
      const sweepX = handX + Math.sin(sweepAngle) * weaponLen * 0.85 * dir;
      const sweepY = handY - Math.cos(sweepAngle) * weaponLen * 0.85;
      this.trailGraphics.fillStyle(color, alpha * 0.08);
      this.trailGraphics.beginPath();
      this.trailGraphics.moveTo(handX, handY);
      this.trailGraphics.lineTo(tipX, tipY);
      this.trailGraphics.lineTo(sweepX, sweepY);
      this.trailGraphics.closePath();
      this.trailGraphics.fillPath();
    }
  }

  destroy() {
    for (const img of Object.values(this.parts)) {
      img?.destroy();
    }
    this.parts = {};
    this.trailGraphics?.destroy();
    this.glowGraphics?.destroy();
    this.shadowGraphics?.destroy();
    this.auraImage?.destroy();
  }
}
