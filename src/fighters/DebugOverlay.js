import { computeWeaponGeometry } from './weaponGeometry.js';

// Debug-only overlay for fight visualization: anchor points, weapon
// endpoints, attack hitboxes, and body hitboxes. Kept in its own file so the
// production renderer cannot silently depend on debug-only geometry.

export class DebugOverlay {
  constructor(scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(100);
    this.enabled = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.graphics.clear();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  clear() {
    this.graphics.clear();
  }

  drawFighter(fighter) {
    if (!this.enabled) return;

    const pose = fighter.bodyParts;
    const profile = fighter.profile;
    const dir = fighter.facingRight ? 1 : -1;

    // The production renderer translates by (sprite.x + renderOffsetX,
    // sprite.y + renderOffsetY + bodyY) and computes geometry in local space
    // with y = -bodyY, so bodyY cancels. For the debug overlay we just feed
    // the post-offset world position directly and the math drops out.
    const worldX = fighter.sprite.x + profile.renderOffsetX;
    const worldY = fighter.sprite.y + profile.renderOffsetY;
    const { armX, armY, handX, handY, tipX, tipY } = computeWeaponGeometry(pose, profile, worldX, worldY, dir);

    // Shoulder -> hand joint
    this.graphics.lineStyle(1, 0x00ff00, 0.6);
    this.graphics.beginPath();
    this.graphics.moveTo(armX, armY);
    this.graphics.lineTo(handX, handY);
    this.graphics.strokePath();

    // Hand anchor dot
    this.graphics.fillStyle(0x00ff00, 0.8);
    this.graphics.fillCircle(handX, handY, 3);

    // Weapon tip dot
    this.graphics.fillStyle(0xff00ff, 0.8);
    this.graphics.fillCircle(tipX, tipY, 3);

    // Weapon line
    this.graphics.lineStyle(1, 0xff00ff, 0.6);
    this.graphics.beginPath();
    this.graphics.moveTo(handX, handY);
    this.graphics.lineTo(tipX, tipY);
    this.graphics.strokePath();

    // Attack hitbox
    const hitbox = fighter.getAttackHitbox();
    if (hitbox) {
      this.graphics.lineStyle(2, 0xff3333, 0.9);
      this.graphics.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }

    // Body hitbox
    const body = fighter.getHitbox();
    this.graphics.lineStyle(1, 0x3399ff, 0.4);
    this.graphics.strokeRect(body.x, body.y, body.width, body.height);
  }

  destroy() {
    this.graphics?.destroy();
    this.graphics = null;
  }
}
