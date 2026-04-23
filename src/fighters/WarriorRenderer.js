import { drawWarrior } from '../art/warriorArt.js';
import { getFighterProfile } from '../config/fighterProfiles.js';
import { computeWeaponGeometry } from './weaponGeometry.js';

const AURA_OFFSET_Y = -54;

export class WarriorRenderer {
  constructor(scene, warriorConfig) {
    this.scene = scene;
    this.config = warriorConfig;
    this.profile = getFighterProfile(warriorConfig.id);

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(12);

    this.trailGraphics = scene.add.graphics();
    this.trailGraphics.setDepth(11);

    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setDepth(10);
  }

  render(x, baseY, facingRight, pose, state, specialRatio) {
    const profile = this.profile;
    const drawX = x + profile.renderOffsetX;
    const drawY = baseY + profile.renderOffsetY + (pose.bodyY || 0);
    const dir = facingRight ? 1 : -1;
    const fxY = -(pose.bodyY || 0);

    this.graphics.clear();
    this.graphics.setPosition(drawX, drawY);
    this.graphics.setScale(profile.renderScale);

    this.drawAura(0, fxY, pose, specialRatio);
    drawWarrior(this.graphics, this.config.id, 0, 0, dir, pose, this.config.colors, state);
    this.drawWeaponTrail(0, fxY, dir, pose);
  }

  drawAura(x, y, pose, specialRatio) {
    this.glowGraphics.clear();
    const glowStrength = Math.max(pose.glow || 0, specialRatio || 0);
    if (glowStrength <= 0.01) {
      return;
    }

    const color = this.profile.fx.specialGlow;
    this.glowGraphics.fillStyle(color, 0.08 + glowStrength * 0.12);
    this.glowGraphics.fillEllipse(x, y + AURA_OFFSET_Y, 92, 120);
    this.glowGraphics.lineStyle(2, color, 0.15 + glowStrength * 0.2);
    this.glowGraphics.strokeEllipse(x, y + AURA_OFFSET_Y, 92, 120);
    this.glowGraphics.setPosition(
      this.graphics.x,
      this.graphics.y,
    );
    this.glowGraphics.setScale(this.profile.renderScale);
  }

  drawWeaponTrail(x, y, dir, pose) {
    this.trailGraphics.clear();
    const trail = this.profile.trail;
    if (!pose.trailAlpha || trail.style === 'none') {
      return;
    }

    const alpha = pose.trailAlpha * trail.alphaScale;
    if (alpha <= 0.01) {
      return;
    }

    const geom = computeWeaponGeometry(pose, this.profile, x, y, dir);
    const color = this.profile.fx.trailColor;
    const width = (pose.trailWidth || this.profile.weaponWidth) * trail.widthScale;

    this.trailGraphics.setPosition(this.graphics.x, this.graphics.y);
    this.trailGraphics.setScale(this.profile.renderScale);

    if (trail.style === 'thrust' || trail.style === 'stock') {
      this.drawThrustSmear(geom, dir, width, color, alpha, trail);
    } else {
      this.drawArcSmear(geom, trail.sweep, dir, width, color, alpha);
    }
  }

  drawArcSmear(geom, sweep, dir, width, color, alpha) {
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

  drawThrustSmear(geom, dir, width, color, alpha, trail) {
    // A thrust reads as motion blur along the blade rather than a cone.
    // We render a short trailing segment behind the hand to suggest the
    // weapon is driving forward, plus a softened stroke over the blade.
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

    // Optional narrow fill to suggest weight of the weapon as it drives forward.
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
    this.graphics.destroy();
    this.trailGraphics.destroy();
    this.glowGraphics.destroy();
  }
}
