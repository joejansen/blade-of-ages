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

    // Pass renderScale and include bodyY so the overlay tracks the actual
    // drawn hand/tip for both renderer modes. AssetWarriorRenderer places
    // parts at `sprite.y + renderOffsetY + bodyY` scaled by renderScale,
    // and WarriorRenderer produces the same effective world positions via
    // its graphics.setPosition + setScale. Matching both here means the
    // debug markers stay locked to the blade in either renderer.
    const worldX = fighter.sprite.x + profile.renderOffsetX;
    const worldY = fighter.sprite.y + profile.renderOffsetY + (pose.bodyY || 0);
    const { armX, armY, handX, handY, tipX, tipY } = computeWeaponGeometry(
      pose, profile, worldX, worldY, dir, profile.renderScale,
    );

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
