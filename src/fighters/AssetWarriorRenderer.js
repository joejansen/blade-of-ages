import Phaser from 'phaser';
import { getFighterProfile } from '../config/fighterProfiles.js';
import { GROUND_Y } from '../config/constants.js';
import { getAssetRig } from '../config/assetRig.js';
import { computeRigGeometry, partTransform } from './rigGeometry.js';

const AURA_OFFSET_Y = -54;
// Resampling budgets include costume overhang beyond anatomical joints.
export const PART_TARGET_HEIGHT = {
  head: 40, torso: 100, upper_arm: 34, lower_arm: 34,
  upper_leg: 40, lower_leg: 40,
};

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
  front_foot: 'lower_leg',
  back_foot: 'lower_leg',
  weapon: 'weapon',
};

// Higher z renders in front.
const SLOT_Z = {
  back_leg_upper: 0,
  back_leg_lower: 0.5,
  back_foot: 0.6,
  back_arm_upper: 1,
  back_arm_lower: 1.5,
  back_shield: 1.7,
  front_leg_upper: 3,
  front_leg_lower: 3.5,
  front_foot: 3.6,
  torso: 4,
  head: 7,
  front_arm_upper: 8,
  front_arm_lower: 8.5,
  weapon: 9,
};

// Far-side limbs sit in shade (opaque: a translucent limb shows the arena
// through it).
const BACK_LIMB_SHADE = 0x8d8883;
// Rim light: a tint-filled copy of every part, nudged up and away from the
// way the fighter faces and drawn behind the rig, so only a sliver shows
// along the lit edge of the silhouette.
const RIM_OFFSET = { x: -0.7, y: -1.1 };
const RIM_ALPHA = 0.55;
// How far ahead of the off hand a shield is held, in rig units.
const SHIELD_REACH = 7;

function multiplyColor(a, b) {
  const ch = shift => Math.round((((a >> shift) & 0xff) * ((b >> shift) & 0xff)) / 255);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
// Number of motion samples kept for the weapon ribbon. At 60fps this is
// ~130ms of swing, long enough to read as an arc without lagging the blade.
const TRAIL_SAMPLES = 8;
// Fraction of the blade (from the hand) where the ribbon's inner edge sits,
// so the smear hugs the cutting edge rather than filling a pie wedge.
const TRAIL_INNER = 0.38;
export class AssetWarriorRenderer {
  // options.displayScale enlarges the whole rig (menu showcases);
  // options.depth moves the rig's depth band; options.groundY pins the
  // shadow to a floor line (defaults to the fight's GROUND_Y).
  constructor(scene, warriorConfig, options = {}) {
    this.scene = scene;
    this.config = warriorConfig;
    this.profile = getFighterProfile(warriorConfig.id);
    this.parts = {};
    this.rig = getAssetRig(warriorConfig.id);
    this.available = true;
    this.displayScale = options.displayScale ?? 1;
    this.depthBase = options.depth ?? 12;
    this.groundY = options.groundY ?? GROUND_Y;
    this.shadowDepth = options.shadowDepth;
    this.trailHistory = [];
    this.frontTint = options.ambient ?? 0xffffff;
    this.backTint = multiplyColor(this.frontTint, BACK_LIMB_SHADE);
    this.rimColor = options.rimColor ?? null;
    this.rims = {};

    // Fighters drawn in code ship a foot of their own (PNG puppets reuse the
    // bottom of the shin art) and may carry something in the off hand.
    this.ownFoot = Boolean(this.rig.foot);
    const slots = { ...SLOT_TO_SPRITE };
    if (this.ownFoot) Object.assign(slots, { front_foot: 'foot', back_foot: 'foot' });
    if (this.rig.shield) slots.back_shield = 'shield';
    this.slotSprite = slots;

    for (const [slot, spriteName] of Object.entries(slots)) {
      const textureKey = `warrior_${warriorConfig.id}_${spriteName}`;
      if (!scene.textures.exists(textureKey)) {
        this.available = false;
        continue;
      }
      const image = scene.add.image(0, 0, textureKey);

      const cropTop = this.rig[spriteName].cropTop || 0;
      let crop = null;
      if (!this.ownFoot && slot.endsWith('_foot')) crop = [0, image.height * 0.77, image.width, image.height * 0.23];
      else if (!this.ownFoot && slot.endsWith('leg_lower')) crop = [0, image.height * cropTop, image.width, image.height * (0.87 - cropTop)];
      else if (cropTop) crop = [0, image.height * cropTop, image.width, image.height * (1 - cropTop)];
      if (crop) image.setCrop(...crop);

      // Push back limbs into shade so the silhouette reads in depth.
      image.setTint(slot.startsWith('back_') ? this.backTint : this.frontTint);
      image.setVisible(false);
      this.parts[slot] = image;

      if (this.rimColor !== null) {
        const rim = scene.add.image(0, 0, textureKey).setTintFill(this.rimColor)
          .setAlpha(RIM_ALPHA * (slot.startsWith('back_') ? 0.5 : 1)).setVisible(false);
        if (crop) rim.setCrop(...crop);
        this.rims[slot] = rim;
      }
    }

    this.faceGraphics = scene.add.graphics();
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
      this.rims[slot]?.setDepth(base - 0.05);
    }
    this.faceGraphics.setDepth(base + 0.065);
    this.shadowGraphics.setDepth(this.shadowDepth ?? base - 0.3);
    this.trailGraphics.setDepth(base + 0.25);
    this.glowGraphics.setDepth(base - 0.1);
    this.auraImage?.setDepth(base - 0.12);
  }

  setVisible(visible) {
    for (const img of Object.values(this.parts)) img.setVisible(visible);
    for (const rim of Object.values(this.rims)) rim.setVisible(visible);
    this.faceGraphics.setVisible(visible);
    this.shadowGraphics.setVisible(visible);
    this.trailGraphics.setVisible(visible);
    this.glowGraphics.setVisible(visible);
    if (!visible) this.auraImage?.setVisible(false);
  }

  setAlpha(alpha) {
    for (const [slot, img] of Object.entries(this.parts)) {
      img.setAlpha(alpha);
      this.rims[slot]?.setAlpha(alpha * RIM_ALPHA * (slot.startsWith('back_') ? 0.5 : 1));
    }
    this.faceGraphics.setAlpha(alpha);
    this.shadowGraphics.setAlpha(alpha);
    this.trailGraphics.setAlpha(alpha);
    this.glowGraphics.setAlpha(alpha);
    this.auraAlphaScale = alpha;
  }

  // Flash every part toward a colour (hit flash / special charge).
  setFlash(color, on) {
    if (this.flashing === on) return;
    this.flashing = on;
    this.flashColor = color;
    for (const [slot, img] of Object.entries(this.parts)) {
      if (on) img.setTintFill(color);
      else img.setTint(slot.startsWith('back_') ? this.backTint : this.frontTint);
    }
  }

  isAvailable() {
    return this.available;
  }

  render(x, baseY, facingRight, pose, state, specialRatio) {
    if (!this.available) return;
    const dir = facingRight ? 1 : -1;
    const profile = this.profile;
    const scale = profile.renderScale * this.displayScale;
    const rig = computeRigGeometry(pose, profile,
      x + profile.renderOffsetX, baseY + profile.renderOffsetY, dir, scale);
    const geom = rig.weapon;
    this.geometry = rig;
    this.#bone('torso', rig.hip, rig.neck, !facingRight);
    for (const [name, chain] of Object.entries({
      front_arm: rig.frontArm, back_arm: rig.backArm,
      front_leg: rig.frontLeg, back_leg: rig.backLeg,
    })) {
      this.#bone(`${name}_upper`, chain.root, chain.joint, !facingRight);
      this.#bone(`${name}_lower`, chain.joint, chain.end, !facingRight);
    }
    this.#foot('front_foot', rig.frontLeg, !facingRight, scale);
    this.#foot('back_foot', rig.backLeg, !facingRight, scale);
    // The shield is carried ahead of the off hand so it shows past the body.
    const shieldAt = { x: rig.backArm.end.x + SHIELD_REACH * dir * scale, y: rig.backArm.end.y };
    this.#held('back_shield', shieldAt, rig.torsoAngle * 0.6, !facingRight, scale);
    this.#bone('weapon', { x: geom.handX, y: geom.handY }, { x: geom.tipX, y: geom.tipY }, !facingRight);
    this.#head(rig.neck, rig.headAngle, scale, dir);
    const rimX = RIM_OFFSET.x * dir * this.displayScale;
    const rimY = RIM_OFFSET.y * this.displayScale;
    for (const [slot, img] of Object.entries(this.parts)) {
      img.setVisible(true);
      this.rims[slot]?.setOrigin(img.originX, img.originY).setFlipX(img.flipX)
        .setPosition(img.x + rimX, img.y + rimY).setRotation(img.rotation)
        .setScale(img.scaleX, img.scaleY).setVisible(true);
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
    const y = this.groundY;
    g.fillStyle(0x000000, 0.22 * k);
    g.fillEllipse(x, y + 1, w * 1.5, h * 1.6);
    g.fillStyle(0x000000, 0.45 * k);
    g.fillEllipse(x, y, w, h);
  }

  #bone(slot, start, end, mirrored) {
    const img = this.parts[slot];
    if (!img) return;
    const t = partTransform(this.rig[this.slotSprite[slot]], img.width, img.height, start, end, mirrored);
    img.setOrigin(t.originX, t.originY).setFlipX(mirrored)
      .setPosition(start.x, start.y).setRotation(t.rotation).setScale(t.scale);
  }

  // A part pinned at one point and drawn at rig scale (no bone to span).
  #held(slot, at, rotation, mirrored, scale) {
    const img = this.parts[slot];
    if (!img) return;
    const source = this.rig[this.slotSprite[slot]];
    img.setOrigin(mirrored ? 1 - source.start[0] : source.start[0], source.start[1])
      .setFlipX(mirrored).setPosition(at.x, at.y).setRotation(rotation).setScale(scale / source.pxPerUnit);
  }

  #foot(slot, chain, mirrored, scale) {
    if (this.ownFoot) {
      this.#held(slot, chain.end, 0, mirrored, scale);
      return;
    }
    const img = this.parts[slot];
    const source = this.rig.lower_leg;
    const sourceLength = Math.hypot((source.end[0] - source.start[0]) * img.width, (source.end[1] - source.start[1]) * img.height);
    const shinScale = Math.hypot(chain.end.x - chain.joint.x, chain.end.y - chain.joint.y) / sourceLength;
    img.setOrigin(mirrored ? 1 - source.end[0] : source.end[0], source.end[1])
      .setFlipX(mirrored).setPosition(chain.end.x, chain.end.y).setRotation(0).setScale(shinScale);
  }

  #head(neck, rotation, scale, dir) {
    const head = this.parts.head;
    const data = this.rig.head;
    const g = this.faceGraphics;
    g.clear().setPosition(neck.x, neck.y).setRotation(rotation).setScale(scale * dir, scale);
    if (data.face) this.#drawFace(g, data);
    const offset = data.brow ? -17 : 0;
    head.setOrigin(dir < 0 ? 1 - data.origin[0] : data.origin[0], data.origin[1])
      .setFlipX(dir < 0).setScale(data.height / head.height * scale)
      .setRotation(rotation)
      .setPosition(neck.x - Math.sin(rotation) * offset * scale, neck.y + Math.cos(rotation) * offset * scale);
  }

  // Open headgear ships without a face. Draw a profile under it: skull,
  // brow, nose, lips and jaw, an eye, an ear, a shaded jawline and whatever
  // facial hair the warrior wears. The hat sprite sits on top.
  #drawFace(g, data) {
    const lit = c => multiplyColor(c, this.frontTint);
    const skinBase = parseInt(this.config.colors.skin.slice(1), 16);
    const flat = this.flashing ? this.flashColor : null;
    const skin = flat ?? lit(skinBase);
    const shade = flat ?? lit(multiplyColor(skinBase, 0xb89a94));
    const ink = flat ?? 0x241d19;
    const hair = flat ?? lit(data.hair ?? 0x2a1d16);
    const top = data.brow ? -20 : -14.5;

    // Neck.
    g.fillStyle(shade, 1).fillRect(-3.4, -7, 7.4, 10);
    g.lineStyle(0.7, ink, 1).lineBetween(-3.4, -6, -3.4, 3).lineBetween(4, -2, 4, 3);

    // Skull and profile.
    const outline = [
      [-7, top + 3], [-4, top], [2, top - 1], [6.5, top + 1],
      [8.4, -15.2], [8.3, -13.4], [11.4, -10.4], [9.2, -9.4], [9.7, -8.1],
      [8.7, -7.3], [9.3, -6.2], [8.4, -3.4], [5, -1.4], [0, -2.6], [-3.5, -5.5], [-6.5, -9],
    ];
    g.fillStyle(skin, 1).lineStyle(0.8, ink, 1).beginPath();
    outline.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath().fillPath().strokePath();

    // Shadow under the cheekbone and along the jaw.
    g.fillStyle(shade, 1).beginPath();
    g.moveTo(8.2, -3.8); g.lineTo(5, -1.8); g.lineTo(0, -3); g.lineTo(-3.2, -5.6);
    g.lineTo(1, -6.6); g.lineTo(6.5, -5.4);
    g.closePath().fillPath();

    // Ear.
    g.fillStyle(shade, 1).fillEllipse(-0.8, -10.6, 3, 4.4);
    g.lineStyle(0.6, ink, 0.9).strokeEllipse(-0.8, -10.6, 3, 4.4);

    // Eye, brow, mouth.
    if (!flat) g.fillStyle(0xf3ead8, 1).fillEllipse(6, -13.2, 3, 1.7);
    g.fillStyle(ink, 1).fillCircle(6.7, -13.2, 0.8);
    g.lineStyle(1.1, ink, 1).lineBetween(3.6, -15.3, 8.3, -14.6);
    g.lineStyle(0.7, ink, 1).lineBetween(6.8, -7.3, 8.7, -7.3);

    if (data.beard === 'full') {
      g.fillStyle(hair, 1).lineStyle(0.7, ink, 1).beginPath();
      [[9.3, -9.2], [10, -6.8], [8.8, -2], [6, 2.2], [1.5, 0.4], [-2.6, -4.6], [-1, -8.8], [3.5, -7.4], [6.6, -8.2]]
        .forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath().fillPath().strokePath();
    } else if (data.beard === 'goatee') {
      g.fillStyle(hair, 1).beginPath();
      g.moveTo(6.4, -5.6); g.lineTo(9.3, -5.4); g.lineTo(8.8, 0.6); g.lineTo(6.2, -2.4);
      g.closePath().fillPath();
    }
    if (data.beard === 'goatee' || data.beard === 'moustache') {
      g.lineStyle(1.3, hair, 1).lineBetween(6, -8.7, 10.2, -8.3).lineBetween(10.2, -8.3, 10.2, -5.8);
    }
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
    for (const rim of Object.values(this.rims)) rim.destroy();
    this.rims = {};
    this.faceGraphics?.destroy();
    this.trailGraphics?.destroy();
    this.glowGraphics?.destroy();
    this.shadowGraphics?.destroy();
    this.auraImage?.destroy();
  }
}
