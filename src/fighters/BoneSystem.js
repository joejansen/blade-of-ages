import Phaser from "phaser";

// Sprite-based character renderer that positions body part images
// using the same coordinate math as the original Graphics-based system.
// Each body part is a Phaser Image positioned and rotated each frame.

const DEG2RAD = Math.PI / 180;

// Max display size for each body part (largest dimension in pixels)
const PART_MAX_SIZE = {
  head: 55,
  torso: 85,
  upper_arm: 45,
  lower_arm: 48,
  upper_leg: 55,
  lower_leg: 55,
  weapon: 80,
};

// Map of which sprite texture each slot uses
const SLOT_TO_SPRITE = {
  head: "head",
  torso: "torso",
  front_arm_upper: "upper_arm",
  front_arm_lower: "lower_arm",
  back_arm_upper: "upper_arm",
  back_arm_lower: "lower_arm",
  front_leg_upper: "upper_leg",
  front_leg_lower: "lower_leg",
  back_leg_upper: "upper_leg",
  back_leg_lower: "lower_leg",
  weapon: "weapon",
};

// Draw order (lower = behind, higher = in front)
const SLOT_Z_ORDER = {
  back_leg_upper: 1,
  back_leg_lower: 1,
  back_arm_upper: 2,
  back_arm_lower: 2,
  front_leg_upper: 4,
  front_leg_lower: 4,
  torso: 5,
  head: 8,
  front_arm_upper: 9,
  front_arm_lower: 9,
  weapon: 10,
};

// Opacity for back limbs
const SLOT_OPACITY = {
  back_arm_upper: 0.7,
  back_arm_lower: 0.7,
  back_leg_upper: 0.7,
  back_leg_lower: 0.7,
};

export class BoneSystem {
  constructor(scene, skeletonConfig, warriorId) {
    this.scene = scene;
    this.warriorId = warriorId;
    this.config = skeletonConfig;
    this.rotationOffsets = skeletonConfig.rotationOffsets || {};
    this.facesLeft = skeletonConfig.facesLeft || {};
    this.parts = {};

    // Create an image for each body part slot
    const slots = Object.keys(SLOT_TO_SPRITE);
    for (const slot of slots) {
      const spriteName = SLOT_TO_SPRITE[slot];
      const textureKey = `warrior_${warriorId}_${spriteName}`;
      const zOrder = SLOT_Z_ORDER[slot] || 5;
      const opacity = SLOT_OPACITY[slot] || 1.0;

      let image;
      if (scene.textures.exists(textureKey)) {
        image = scene.add.image(0, 0, textureKey);
      } else {
        image = this.createPlaceholder(scene, slot, warriorId);
      }

      // Scale so the largest dimension fits within the target max size
      const maxSize = PART_MAX_SIZE[spriteName] || 30;
      const largestDim = Math.max(image.width, image.height);
      const scale = maxSize / largestDim;
      image.setScale(scale);

      image.setOrigin(0.5, 0.15); // Pivot near top of each part
      image.setAlpha(opacity);
      image.setDepth(10 + zOrder * 0.1); // Base depth 10, layered by z-order
      image.setVisible(false);

      this.parts[slot] = image;
    }

    // Set pivot points for each body part:
    // Arms/legs: pivot at top (joint they connect to)
    // Torso: pivot at bottom (hip)
    // Head: pivot at bottom (neck)
    // Weapon: pivot at bottom (handle/grip)
    for (const [slot, img] of Object.entries(this.parts)) {
      if (slot === "torso")
        img.setOrigin(0.5, 1.0); // Hip at bottom
      else if (slot === "head")
        img.setOrigin(0.5, 1.0); // Neck at bottom
      else img.setOrigin(0.5, 0.1); // Joint/connection at top (arms, legs, weapon handle)
    }
  }

  createPlaceholder(scene, slot, warriorId) {
    const colors = {
      head: 0x888888,
      torso: 0x666666,
      front_arm_upper: 0x997766,
      front_arm_lower: 0x997766,
      back_arm_upper: 0x776655,
      back_arm_lower: 0x776655,
      front_leg_upper: 0x555555,
      front_leg_lower: 0x555555,
      back_leg_upper: 0x444444,
      back_leg_lower: 0x444444,
      weapon: 0xaaaaaa,
    };
    const widths = {
      head: 30,
      torso: 32,
      front_arm_upper: 14,
      front_arm_lower: 14,
      back_arm_upper: 14,
      back_arm_lower: 14,
      front_leg_upper: 14,
      front_leg_lower: 14,
      back_leg_upper: 14,
      back_leg_lower: 14,
      weapon: 8,
    };

    const spriteName = SLOT_TO_SPRITE[slot];
    const h = PART_MAX_SIZE[spriteName] || 30;
    const w = widths[slot] || 14;
    const color = colors[slot] || 0x888888;
    const key = `ph_${warriorId}_${slot}`;

    if (!scene.textures.exists(key)) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(color, 1);
      gfx.fillRoundedRect(0, 0, w, h, 3);
      gfx.lineStyle(1, 0x000000, 0.5);
      gfx.strokeRoundedRect(0, 0, w, h, 3);
      gfx.generateTexture(key, w, h);
      gfx.destroy();
    }

    return scene.add.image(0, 0, key);
  }

  // Position all body parts based on bodyParts state
  applyBodyParts(bodyParts) {
    this._bp = bodyParts;
  }

  render(x, baseY, facingRight) {
    const bp = this._bp;
    if (!bp) return;

    const dir = facingRight ? 1 : -1;
    const crouchOff = bp.crouchFactor * 30;

    // Key anchor points — character is ~150px tall
    // baseY = feet position, build character upward from there
    const feesY = baseY;
    const hipX = x;
    const hipY = feesY - 80 + crouchOff; // Pulled upward slightly more for the overall taller leg height
    const legStartY = hipY - 2; // Connect higher up into hip

    // Show all parts
    for (const img of Object.values(this.parts)) {
      img.setVisible(true);
    }

    // --- TORSO --- (positioned at hip, extends upward)
    const torsoRot = bp.torsoAngle * DEG2RAD * dir;
    this.positionPart("torso", hipX, hipY, torsoRot);

    // Calculate neck (top of torso) taking torso rotation into account
    // Unrotated top is at (hipX, hipY - 75)
    const torsoLen = 75; // Adjusted to allow head to overlap neck opening
    const neckX = hipX + Math.sin(torsoRot) * torsoLen;
    const neckY = hipY - Math.cos(torsoRot) * torsoLen;

    // --- HEAD --- (above shoulders)
    // Offset from neck: unrotated it's (3*dir, 1 + bp.headY)
    const headOffX = 3 * dir;
    const headOffY = 1 + bp.headY; // Head raised higher above the torso's neck opening
    const headX =
      neckX + headOffX * Math.cos(torsoRot) - headOffY * Math.sin(torsoRot);
    const headY =
      neckY + headOffX * Math.sin(torsoRot) + headOffY * Math.cos(torsoRot);
    const headRot = bp.torsoAngle * 0.3 * DEG2RAD * dir;
    this.positionPart("head", headX, headY, headRot);

    // --- SHOULDERS ---
    // Shoulders attach at the neck with some horizontal spread.
    const fShoulderOffX = -7 * dir;
    const bShoulderOffX = -12 * dir;

    const fShoulderX = neckX + fShoulderOffX * Math.cos(torsoRot);
    const fShoulderY = neckY + fShoulderOffX * Math.sin(torsoRot);

    const bShoulderX = neckX + bShoulderOffX * Math.cos(torsoRot);
    const bShoulderY = neckY + bShoulderOffX * Math.sin(torsoRot);

    // Joint lengths
    const armLen = 32;
    const legLen = 36;

    // *** IMPORTANT: In Phaser, +Rotation is Clockwise.
    // Down-pointing parts (arms, legs) must rotate CCW (-) to move "Forward"/Right when facing right.
    // Up-pointing parts (torso, head) must rotate CW (+) to lean "Forward"/Right when facing right.

    // --- FRONT ARM --- (attached at shoulder, hangs down)
    const fArmSpriteRot = -bp.armAngle * DEG2RAD * dir;
    this.positionPart("front_arm_upper", fShoulderX, fShoulderY, fArmSpriteRot);

    const fElbowX = fShoulderX - Math.sin(fArmSpriteRot) * armLen;
    const fElbowY = fShoulderY + Math.cos(fArmSpriteRot) * armLen;

    const fLowerArmRot = -bp.armAngle * 0.5 * DEG2RAD * dir;
    this.positionPart("front_arm_lower", fElbowX, fElbowY, fLowerArmRot);

    const fHandX = fElbowX - Math.sin(fLowerArmRot) * armLen;
    const fHandY = fElbowY + Math.cos(fLowerArmRot) * armLen;

    // --- WEAPON --- (held in hand)
    const weaponRot = -bp.weaponAngle * DEG2RAD * dir;
    this.positionPart("weapon", fHandX, fHandY, weaponRot);

    // --- BACK ARM --- (behind body, reduced motion opposite to front arm)
    const bArmSpriteRot = bp.armAngle * 0.4 * DEG2RAD * dir;
    this.positionPart("back_arm_upper", bShoulderX, bShoulderY, bArmSpriteRot);

    const bElbowX = bShoulderX - Math.sin(bArmSpriteRot) * (armLen - 2);
    const bElbowY = bShoulderY + Math.cos(bArmSpriteRot) * (armLen - 2);

    const bLowerArmRot = bp.armAngle * 0.2 * DEG2RAD * dir;
    this.positionPart("back_arm_lower", bElbowX, bElbowY, bLowerArmRot);

    // --- FRONT LEG --- (attached at hip, hangs down)
    const fLegSpriteRot = -bp.legSpread * 0.5 * DEG2RAD * dir;
    const fLegX = hipX + 6 * dir;
    this.positionPart("front_leg_upper", fLegX, legStartY, fLegSpriteRot);

    const fKneeX = fLegX - Math.sin(fLegSpriteRot) * legLen;
    const fKneeY = legStartY + Math.cos(fLegSpriteRot) * legLen;

    const fLowerLegRot = -bp.legSpread * 0.15 * DEG2RAD * dir;
    this.positionPart("front_leg_lower", fKneeX, fKneeY, fLowerLegRot);

    // --- BACK LEG --- (opposite direction)
    const bLegSpriteRot = bp.legSpread * 0.5 * DEG2RAD * dir;
    const bLegX = hipX - 6 * dir;
    this.positionPart("back_leg_upper", bLegX, legStartY, bLegSpriteRot);

    const bKneeX = bLegX - Math.sin(bLegSpriteRot) * legLen;
    const bKneeY = legStartY + Math.cos(bLegSpriteRot) * legLen;

    const bLowerLegRot = bp.legSpread * 0.15 * DEG2RAD * dir;
    this.positionPart("back_leg_lower", bKneeX, bKneeY, bLowerLegRot);

    // Flip sprites horizontally to match desired facing
    for (const [slot, img] of Object.entries(this.parts)) {
      const spriteName = SLOT_TO_SPRITE[slot];
      const nativelyFacesLeft = this.facesLeft[spriteName] || false;
      
      // If we want to face right (facingRight=true) and it faces left natively, we must flip it.
      // If we want to face right and it faces right natively, don't flip.
      const shouldFlip = facingRight ? nativelyFacesLeft : !nativelyFacesLeft;
      img.setFlipX(shouldFlip);
    }
  }

  positionPart(slot, x, y, rotation) {
    const img = this.parts[slot];
    if (!img) return;
    img.setPosition(x, y);
    // Apply rotation + per-part offset to correct AI image orientation
    const spriteName = SLOT_TO_SPRITE[slot];
    const offsetDeg = this.rotationOffsets[spriteName] || 0;
    img.setRotation(rotation + offsetDeg * DEG2RAD);
  }

  destroy() {
    for (const img of Object.values(this.parts)) {
      img.destroy();
    }
    this.parts = {};
  }
}
