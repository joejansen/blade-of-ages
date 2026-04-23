import { drawWarrior } from '../art/warriorArt.js';
import { getFighterProfile } from '../config/fighterProfiles.js';

const AURA_OFFSET_Y = -54;
const TORSO_OFFSET_Y = -55;
const CROUCH_OFFSET_Y = 30;
const HEAD_BOB_FACTOR = 0.25;
const ARM_OFFSET_X = 10;
const ARM_OFFSET_Y = -7;
const ARM_REACH = 30;

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
    if (!pose.trailAlpha) {
      return;
    }

    const armAngle = pose.armAngle * Math.PI / 180;
    const weaponAngle = pose.weaponAngle * Math.PI / 180;
    const torsoY = y + TORSO_OFFSET_Y + pose.crouchFactor * CROUCH_OFFSET_Y + (pose.headY || 0) * HEAD_BOB_FACTOR;
    const armX = x + ARM_OFFSET_X * dir;
    const armY = torsoY + ARM_OFFSET_Y;
    const handX = armX + Math.sin(armAngle) * ARM_REACH * dir;
    const handY = armY - Math.cos(armAngle) * ARM_REACH;
    const tipX = handX + Math.sin(weaponAngle) * this.profile.weaponLength * dir;
    const tipY = handY - Math.cos(weaponAngle) * this.profile.weaponLength;
    const sweepX = handX + Math.sin(weaponAngle - 0.4) * this.profile.weaponLength * dir;
    const sweepY = handY - Math.cos(weaponAngle - 0.4) * this.profile.weaponLength;
    const width = pose.trailWidth || this.profile.weaponWidth;

    this.trailGraphics.setPosition(this.graphics.x, this.graphics.y);
    this.trailGraphics.setScale(this.profile.renderScale);
    this.trailGraphics.fillStyle(this.profile.fx.trailColor, pose.trailAlpha * 0.14);
    this.trailGraphics.beginPath();
    this.trailGraphics.moveTo(handX, handY);
    this.trailGraphics.lineTo(tipX, tipY);
    this.trailGraphics.lineTo(sweepX, sweepY);
    this.trailGraphics.closePath();
    this.trailGraphics.fillPath();

    this.trailGraphics.lineStyle(width * 0.22, this.profile.fx.trailColor, pose.trailAlpha * 0.4);
    this.trailGraphics.beginPath();
    this.trailGraphics.moveTo(handX, handY);
    this.trailGraphics.lineTo(tipX, tipY);
    this.trailGraphics.strokePath();
  }

  destroy() {
    this.graphics.destroy();
    this.trailGraphics.destroy();
    this.glowGraphics.destroy();
  }
}
