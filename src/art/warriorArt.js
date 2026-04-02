// Detailed per-warrior drawing functions
// Each function draws a distinctive, human-like character using Phaser Graphics

// Helper: convert hex string to number
function hex(str) {
  return parseInt(str.replace('#', ''), 16);
}

// Helper: draw an ellipse manually (Phaser Graphics fillEllipse may not be available on all versions)
function ellipse(g, x, y, rx, ry) {
  g.beginPath();
  for (let i = 0; i <= 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const px = x + Math.cos(angle) * rx;
    const py = y + Math.sin(angle) * ry;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
}

// Shared body drawing with per-warrior customization
export function drawWarrior(g, warriorId, x, baseY, facingRight, bodyParts, colors, state) {
  const fn = WARRIOR_DRAW_MAP[warriorId] || drawGenericWarrior;
  fn(g, x, baseY, facingRight, bodyParts, colors, state);
}

// ============================================================
// MEDIEVAL KNIGHT — Full plate armor, great helm, longsword
// ============================================================
function drawKnight(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  // Shadow
  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 22, 6);

  // LEGS — armored greaves
  g.lineStyle(7, secondary, 1);
  g.beginPath(); g.moveTo(x - 6 * dir, torsoY + 28); g.lineTo(x - bp.legSpread * 0.6 * dir, baseY - 4); g.stroke();
  g.beginPath(); g.moveTo(x + 4 * dir, torsoY + 28); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 4); g.stroke();
  // Knee guards
  g.fillStyle(secondary, 1);
  g.fillCircle(x - 3 * dir, torsoY + 28, 5);
  g.fillCircle(x + 2 * dir, torsoY + 28, 5);
  // Iron boots
  g.fillStyle(0x555555, 1);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 6, baseY - 6, 12, 6);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 6, baseY - 6, 12, 6);

  // TORSO — plate armor with tabard
  g.fillStyle(secondary, 1);
  g.fillRect(x - 16, torsoY - 18, 32, 40);
  g.lineStyle(2, 0x333333, 1);
  g.strokeRect(x - 16, torsoY - 18, 32, 40);
  // Tabard over armor
  g.fillStyle(primary, 0.9);
  g.fillRect(x - 12, torsoY - 15, 24, 44);
  // Cross emblem
  g.fillStyle(accent, 1);
  g.fillRect(x - 2, torsoY - 10, 4, 18);
  g.fillRect(x - 7, torsoY - 4, 14, 4);
  // Gorget (neck armor)
  g.fillStyle(secondary, 1);
  g.fillRect(x - 10, torsoY - 22, 20, 6);

  // BACK ARM
  const backArmX = x - 12 * dir;
  const backArmAngle = (-bp.armAngle * 0.4) * Math.PI / 180;
  g.lineStyle(6, secondary, 0.7);
  g.beginPath();
  g.moveTo(backArmX, torsoY - 8);
  g.lineTo(backArmX + Math.sin(backArmAngle) * 22 * dir, torsoY - 8 + Math.cos(backArmAngle) * 22);
  g.stroke();

  // HEAD — Great helm with visor
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 34 + bp.headY;
  // Helm body
  g.fillStyle(secondary, 1);
  g.lineStyle(2, 0x333333, 1);
  g.fillRect(headX - 13, headY - 14, 26, 28);
  g.strokeRect(headX - 13, headY - 14, 26, 28);
  // Visor slit
  g.fillStyle(0x111111, 1);
  g.fillRect(headX - 10, headY - 2, 20, 3);
  // Breathing holes
  g.fillCircle(headX + 6 * dir, headY + 6, 1.5);
  g.fillCircle(headX + 6 * dir, headY + 10, 1.5);
  // Helm crest
  g.fillStyle(accent, 1);
  g.fillRect(headX - 2, headY - 18, 4, 8);
  // Plume
  g.fillStyle(primary, 0.8);
  for (let i = 0; i < 5; i++) {
    g.fillCircle(headX - (i * 3 * dir), headY - 18 - i * 2, 4 - i * 0.5);
  }

  // FRONT ARM + LONGSWORD
  const armX = x + 12 * dir;
  const armY = torsoY - 8;
  const handX = armX + Math.sin(armAngle) * 28 * dir;
  const handY = armY - Math.cos(armAngle) * 28;
  // Armored arm
  g.lineStyle(7, secondary, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  // Gauntlet
  g.fillStyle(0x555555, 1);
  g.fillCircle(handX, handY, 5);
  // Longsword — long blade with crossguard
  const swordLen = 55;
  const tipX = handX + Math.sin(weapAngle) * swordLen * dir;
  const tipY = handY - Math.cos(weapAngle) * swordLen;
  g.lineStyle(3, 0xcccccc, 1);
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(tipX, tipY); g.stroke();
  // Blade edge highlight
  g.lineStyle(1, 0xffffff, 0.5);
  g.beginPath(); g.moveTo(handX + dir, handY); g.lineTo(tipX + dir, tipY); g.stroke();
  // Crossguard
  const guardAngle = weapAngle + Math.PI / 2;
  g.lineStyle(3, accent, 1);
  g.beginPath();
  g.moveTo(handX - Math.cos(guardAngle) * 8, handY - Math.sin(guardAngle) * 8);
  g.lineTo(handX + Math.cos(guardAngle) * 8, handY + Math.sin(guardAngle) * 8);
  g.stroke();
  // Pommel
  g.fillStyle(accent, 1);
  const pommelX = handX - Math.sin(weapAngle) * 6 * dir;
  const pommelY = handY + Math.cos(weapAngle) * 6;
  g.fillCircle(pommelX, pommelY, 3);
}

// ============================================================
// SAMURAI — Kabuto helmet, do armor, katana
// ============================================================
function drawSamurai(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 22, 6);

  // LEGS — hakama pants (wide, flowing)
  g.fillStyle(secondary, 1);
  // Left leg
  g.beginPath();
  g.moveTo(x - 14, torsoY + 22);
  g.lineTo(x - bp.legSpread * 0.7 * dir - 8, baseY - 2);
  g.lineTo(x - bp.legSpread * 0.7 * dir + 8, baseY - 2);
  g.lineTo(x - 2, torsoY + 22);
  g.closePath(); g.fillPath();
  // Right leg
  g.beginPath();
  g.moveTo(x + 2, torsoY + 22);
  g.lineTo(x + bp.legSpread * 0.5 * dir - 8, baseY - 2);
  g.lineTo(x + bp.legSpread * 0.5 * dir + 8, baseY - 2);
  g.lineTo(x + 14, torsoY + 22);
  g.closePath(); g.fillPath();
  // Sandals
  g.fillStyle(0x8b6914, 1);
  g.fillRect(x - bp.legSpread * 0.7 * dir - 6, baseY - 4, 12, 4);
  g.fillRect(x + bp.legSpread * 0.5 * dir - 6, baseY - 4, 12, 4);

  // TORSO — Do (chest armor) with lacing
  g.fillStyle(secondary, 1);
  g.fillRect(x - 15, torsoY - 16, 30, 36);
  // Armor plates (horizontal lacing)
  g.lineStyle(1, primary, 0.6);
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.moveTo(x - 14, torsoY - 12 + i * 7);
    g.lineTo(x + 14, torsoY - 12 + i * 7);
    g.stroke();
  }
  // Kusazuri (skirt plates)
  g.fillStyle(primary, 0.8);
  for (let i = -2; i <= 2; i++) {
    g.fillRect(x + i * 8 - 3, torsoY + 20, 7, 12);
  }
  // Obi (sash/belt)
  g.fillStyle(accent, 1);
  g.fillRect(x - 16, torsoY + 16, 32, 5);

  // BACK ARM
  const backArmX = x - 10 * dir;
  g.lineStyle(5, skin, 0.7);
  const backArmAngle = (-bp.armAngle * 0.3) * Math.PI / 180;
  g.beginPath();
  g.moveTo(backArmX, torsoY - 6);
  g.lineTo(backArmX + Math.sin(backArmAngle) * 20 * dir, torsoY - 6 + Math.cos(backArmAngle) * 20);
  g.stroke();

  // HEAD — Kabuto with crescent moon
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 32 + bp.headY;
  // Face
  g.fillStyle(skin, 1);
  g.lineStyle(2, 0x000000, 1);
  g.fillCircle(headX, headY + 2, 11);
  g.strokeCircle(headX, headY + 2, 11);
  // Eyes — narrow, fierce
  g.lineStyle(2, 0x000000, 1);
  g.beginPath(); g.moveTo(headX + 3 * dir, headY); g.lineTo(headX + 8 * dir, headY - 1); g.stroke();
  // Kabuto (helmet)
  g.fillStyle(secondary, 1);
  g.fillRect(headX - 14, headY - 14, 28, 12);
  g.lineStyle(1, 0x000000, 0.5);
  g.strokeRect(headX - 14, headY - 14, 28, 12);
  // Shikoro (neck guard)
  g.fillStyle(secondary, 0.8);
  g.fillRect(headX - 16, headY - 6, 32, 5);
  g.fillRect(headX - 14, headY - 1, 28, 4);
  // Maedate (crescent crest)
  g.fillStyle(accent, 1);
  g.lineStyle(2, accent, 1);
  g.beginPath();
  g.moveTo(headX - 8, headY - 14);
  g.lineTo(headX, headY - 26);
  g.lineTo(headX + 8, headY - 14);
  g.stroke();
  // Mempo (face guard)
  g.fillStyle(0x333333, 0.7);
  g.fillRect(headX - 8, headY + 4, 16, 6);

  // FRONT ARM + KATANA
  const armX = x + 10 * dir;
  const armY = torsoY - 6;
  const handX = armX + Math.sin(armAngle) * 26 * dir;
  const handY = armY - Math.cos(armAngle) * 26;
  // Arm with sleeve
  g.lineStyle(5, primary, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  g.fillStyle(skin, 1);
  g.fillCircle(handX, handY, 4);
  // Katana — curved blade
  const katanaLen = 50;
  const curve = 4;
  const tipX = handX + Math.sin(weapAngle) * katanaLen * dir;
  const tipY = handY - Math.cos(weapAngle) * katanaLen;
  const midX = (handX + tipX) / 2 + Math.cos(weapAngle) * curve * dir;
  const midY = (handY + tipY) / 2 + Math.sin(weapAngle) * curve;
  g.lineStyle(3, 0xdddddd, 1);
  g.beginPath();
  g.moveTo(handX, handY);
  g.lineTo(midX, midY);
  g.lineTo(tipX, tipY);
  g.stroke();
  // Blade sheen
  g.lineStyle(1, 0xffffff, 0.4);
  g.beginPath(); g.moveTo(handX + dir, handY); g.lineTo(tipX + dir, tipY); g.stroke();
  // Tsuba (guard) — circular
  g.fillStyle(accent, 1);
  g.fillCircle(handX, handY, 5);
  g.fillStyle(0x000000, 1);
  g.fillCircle(handX, handY, 2);
  // Tsuka (handle wrap)
  g.lineStyle(2, 0x000000, 0.6);
  const handleX = handX - Math.sin(weapAngle) * 10 * dir;
  const handleY = handY + Math.cos(weapAngle) * 10;
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(handleX, handleY); g.stroke();
}

// ============================================================
// VIKING — Horned helm, fur cape, round shield, war axe
// ============================================================
function drawViking(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 24, 7);

  // LEGS — fur-lined boots, leather pants
  g.lineStyle(8, primary, 1);
  g.beginPath(); g.moveTo(x - 6 * dir, torsoY + 28); g.lineTo(x - bp.legSpread * 0.6 * dir, baseY - 5); g.stroke();
  g.beginPath(); g.moveTo(x + 4 * dir, torsoY + 28); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 5); g.stroke();
  // Fur boots
  g.fillStyle(secondary, 1);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 7, baseY - 10, 14, 10);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 7, baseY - 10, 14, 10);
  // Fur trim on boots
  g.fillStyle(0xdeb887, 0.7);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 7, baseY - 10, 14, 3);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 7, baseY - 10, 14, 3);

  // FUR CAPE (behind body)
  g.fillStyle(secondary, 0.6);
  g.beginPath();
  g.moveTo(x - 18 * dir, torsoY - 14);
  g.lineTo(x - 22 * dir, torsoY + 30);
  g.lineTo(x - 8 * dir, torsoY + 35);
  g.lineTo(x - 6 * dir, torsoY - 10);
  g.closePath(); g.fillPath();

  // TORSO — chainmail + leather
  g.fillStyle(0x777777, 1);
  g.fillRect(x - 17, torsoY - 16, 34, 42);
  // Chainmail pattern
  g.lineStyle(1, 0x999999, 0.3);
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      g.strokeCircle(x - 12 + col * 8 + (row % 2) * 4, torsoY - 10 + row * 7, 3);
    }
  }
  // Leather belt with buckle
  g.fillStyle(primary, 1);
  g.fillRect(x - 18, torsoY + 18, 36, 6);
  g.fillStyle(accent, 1);
  g.fillRect(x - 3, torsoY + 17, 6, 8);

  // BACK ARM with round shield
  const backArmX = x - 12 * dir;
  const backArmAngle = (-bp.armAngle * 0.3) * Math.PI / 180;
  const shieldX = backArmX + Math.sin(backArmAngle) * 18 * dir;
  const shieldY = torsoY + Math.cos(backArmAngle) * 18;
  g.lineStyle(6, skin, 0.7);
  g.beginPath(); g.moveTo(backArmX, torsoY - 6); g.lineTo(shieldX, shieldY); g.stroke();
  // Round shield
  g.fillStyle(primary, 1);
  g.fillCircle(shieldX, shieldY - 4, 16);
  g.lineStyle(2, 0x000000, 0.5);
  g.strokeCircle(shieldX, shieldY - 4, 16);
  // Shield boss (center)
  g.fillStyle(accent, 1);
  g.fillCircle(shieldX, shieldY - 4, 5);
  // Shield pattern
  g.lineStyle(1, accent, 0.5);
  g.strokeCircle(shieldX, shieldY - 4, 11);

  // HEAD — Horned helm + braided beard
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 32 + bp.headY;
  // Face
  g.fillStyle(skin, 1);
  g.lineStyle(2, 0x000000, 1);
  g.fillCircle(headX, headY + 2, 12);
  g.strokeCircle(headX, headY + 2, 12);
  // Eyes — fierce
  g.fillStyle(0x000000, 1);
  g.fillCircle(headX + 4 * dir, headY, 2);
  // Braided beard
  g.fillStyle(0xb8860b, 1);
  g.beginPath();
  g.moveTo(headX - 6, headY + 8);
  g.lineTo(headX, headY + 22);
  g.lineTo(headX + 6, headY + 8);
  g.closePath(); g.fillPath();
  g.lineStyle(1, 0x8b6914, 0.5);
  g.beginPath(); g.moveTo(headX, headY + 10); g.lineTo(headX, headY + 20); g.stroke();
  // Helm
  g.fillStyle(0x888888, 1);
  g.fillRect(headX - 14, headY - 12, 28, 14);
  g.lineStyle(1, 0x666666, 1);
  g.strokeRect(headX - 14, headY - 12, 28, 14);
  // Nose guard
  g.fillRect(headX - 2, headY - 4, 4, 10);
  // HORNS
  g.fillStyle(0xdeb887, 1);
  g.lineStyle(3, 0xdeb887, 1);
  // Left horn
  g.beginPath();
  g.moveTo(headX - 14, headY - 8);
  g.lineTo(headX - 22, headY - 22);
  g.lineTo(headX - 18, headY - 28);
  g.stroke();
  // Right horn
  g.beginPath();
  g.moveTo(headX + 14, headY - 8);
  g.lineTo(headX + 22, headY - 22);
  g.lineTo(headX + 18, headY - 28);
  g.stroke();

  // FRONT ARM + WAR AXE
  const armX = x + 12 * dir;
  const armY = torsoY - 6;
  const handX = armX + Math.sin(armAngle) * 26 * dir;
  const handY = armY - Math.cos(armAngle) * 26;
  g.lineStyle(6, skin, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  g.fillStyle(skin, 1);
  g.fillCircle(handX, handY, 5);
  // Axe handle
  const axeLen = 48;
  const axeTipX = handX + Math.sin(weapAngle) * axeLen * dir;
  const axeTipY = handY - Math.cos(weapAngle) * axeLen;
  g.lineStyle(3, 0x5c3a1e, 1);
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(axeTipX, axeTipY); g.stroke();
  // Axe head (crescent shape)
  const axeHeadAngle = weapAngle + Math.PI / 2;
  g.fillStyle(0xaaaaaa, 1);
  g.lineStyle(1, 0x666666, 1);
  g.beginPath();
  g.moveTo(axeTipX, axeTipY);
  g.lineTo(axeTipX + Math.cos(axeHeadAngle) * 14 * dir, axeTipY + Math.sin(axeHeadAngle) * 14);
  g.lineTo(axeTipX + Math.sin(weapAngle) * 6 * dir, axeTipY - Math.cos(weapAngle) * 6);
  g.lineTo(axeTipX - Math.cos(axeHeadAngle) * 6 * dir, axeTipY - Math.sin(axeHeadAngle) * 6);
  g.closePath(); g.fillPath(); g.strokePath();
}

// ============================================================
// ROMAN GLADIATOR — Manica arm guard, gladius, scutum shield
// ============================================================
function drawGladiator(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 22, 6);

  // LEGS — bare with greaves
  g.lineStyle(6, skin, 1);
  g.beginPath(); g.moveTo(x - 5 * dir, torsoY + 28); g.lineTo(x - bp.legSpread * 0.6 * dir, baseY - 5); g.stroke();
  g.beginPath(); g.moveTo(x + 3 * dir, torsoY + 28); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 5); g.stroke();
  // Greaves (shin guards)
  g.fillStyle(primary, 1);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 4, baseY - 22, 8, 18);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 4, baseY - 22, 8, 18);
  // Sandals with straps
  g.fillStyle(secondary, 1);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 6, baseY - 5, 12, 5);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 6, baseY - 5, 12, 5);

  // TORSO — bare chest with shoulder pad
  g.fillStyle(skin, 1);
  g.fillRect(x - 15, torsoY - 14, 30, 38);
  g.lineStyle(2, 0x000000, 0.3);
  g.strokeRect(x - 15, torsoY - 14, 30, 38);
  // Pectoral lines
  g.lineStyle(1, 0x000000, 0.15);
  g.beginPath(); g.moveTo(x - 8, torsoY - 6); g.lineTo(x, torsoY + 2); g.stroke();
  g.beginPath(); g.moveTo(x + 8, torsoY - 6); g.lineTo(x, torsoY + 2); g.stroke();
  // Abs suggestion
  g.beginPath(); g.moveTo(x, torsoY + 4); g.lineTo(x, torsoY + 20); g.stroke();
  // Shoulder guard (galerus)
  g.fillStyle(primary, 1);
  g.fillRect(x + 8 * dir, torsoY - 20, 14 * dir, 12);
  g.lineStyle(1, 0x000000, 0.4);
  g.strokeRect(x + 8 * dir, torsoY - 20, 14 * dir, 12);
  // Leather belt/subligaculum
  g.fillStyle(secondary, 1);
  g.fillRect(x - 16, torsoY + 18, 32, 8);
  // Belt studs
  g.fillStyle(primary, 1);
  for (let i = -2; i <= 2; i++) {
    g.fillCircle(x + i * 7, torsoY + 22, 2);
  }

  // BACK ARM with shield
  const backArmX = x - 10 * dir;
  const backArmAngle = (-bp.armAngle * 0.35) * Math.PI / 180;
  const shieldX = backArmX + Math.sin(backArmAngle) * 16 * dir;
  const shieldY = torsoY + 2 + Math.cos(backArmAngle) * 16;
  g.lineStyle(6, skin, 0.7);
  g.beginPath(); g.moveTo(backArmX, torsoY - 4); g.lineTo(shieldX, shieldY); g.stroke();
  // Rectangular shield (scutum)
  g.fillStyle(accent, 1);
  g.fillRect(shieldX - 10 * dir, shieldY - 18, 20, 36);
  g.lineStyle(2, 0x000000, 0.5);
  g.strokeRect(shieldX - 10 * dir, shieldY - 18, 20, 36);
  // Shield boss
  g.fillStyle(primary, 1);
  g.fillCircle(shieldX, shieldY, 6);

  // HEAD — gladiator helmet with plume
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 30 + bp.headY;
  // Face visible
  g.fillStyle(skin, 1);
  g.fillCircle(headX, headY + 2, 11);
  g.lineStyle(2, 0x000000, 0.5);
  g.strokeCircle(headX, headY + 2, 11);
  // Fierce expression
  g.fillStyle(0x000000, 1);
  g.fillCircle(headX + 4 * dir, headY, 2);
  g.lineStyle(1, 0x000000, 0.7);
  g.beginPath(); g.moveTo(headX + 1 * dir, headY + 5); g.lineTo(headX + 7 * dir, headY + 4); g.stroke();
  // Helmet
  g.fillStyle(primary, 1);
  g.fillRect(headX - 13, headY - 12, 26, 10);
  g.lineStyle(1, 0x000000, 0.4);
  g.strokeRect(headX - 13, headY - 12, 26, 10);
  // Cheek guards
  g.fillRect(headX - 13, headY - 4, 4, 12);
  g.fillRect(headX + 9, headY - 4, 4, 12);
  // Red plume (crista)
  g.fillStyle(accent, 1);
  for (let i = 0; i < 7; i++) {
    g.fillCircle(headX + (i - 3) * 3, headY - 16 - Math.abs(i - 3) * 1.5, 4);
  }

  // FRONT ARM — manica (arm guard) + gladius
  const armX = x + 10 * dir;
  const armY = torsoY - 4;
  const handX = armX + Math.sin(armAngle) * 26 * dir;
  const handY = armY - Math.cos(armAngle) * 26;
  // Arm with manica wrappings
  g.lineStyle(6, primary, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  g.fillStyle(skin, 1);
  g.fillCircle(handX, handY, 4);
  // Gladius — short, wide blade
  const gladiusLen = 35;
  const tipX = handX + Math.sin(weapAngle) * gladiusLen * dir;
  const tipY = handY - Math.cos(weapAngle) * gladiusLen;
  g.lineStyle(4, 0xcccccc, 1);
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(tipX, tipY); g.stroke();
  g.lineStyle(1, 0xffffff, 0.5);
  g.beginPath(); g.moveTo(handX + dir, handY); g.lineTo(tipX + dir, tipY); g.stroke();
  // Guard
  g.fillStyle(primary, 1);
  g.fillCircle(handX, handY, 4);
}

// ============================================================
// MONGOL — Fur-lined deel, curved sword, leather cap
// ============================================================
function drawMongol(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 20, 6);

  // LEGS — loose pants with riding boots
  g.lineStyle(7, secondary, 1);
  g.beginPath(); g.moveTo(x - 5 * dir, torsoY + 26); g.lineTo(x - bp.legSpread * 0.5 * dir, baseY - 5); g.stroke();
  g.beginPath(); g.moveTo(x + 3 * dir, torsoY + 26); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 5); g.stroke();
  // Riding boots (tall, leather)
  g.fillStyle(0x5c3a1e, 1);
  g.fillRect(x - bp.legSpread * 0.5 * dir - 5, baseY - 18, 10, 18);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 5, baseY - 18, 10, 18);

  // TORSO — deel (traditional robe)
  g.fillStyle(primary, 1);
  // Robe wraps across chest
  g.beginPath();
  g.moveTo(x - 16, torsoY - 14);
  g.lineTo(x + 16, torsoY - 14);
  g.lineTo(x + 14, torsoY + 30);
  g.lineTo(x - 14, torsoY + 30);
  g.closePath(); g.fillPath();
  // Diagonal wrap line
  g.lineStyle(2, accent, 0.7);
  g.beginPath();
  g.moveTo(x - 14 * dir, torsoY - 14);
  g.lineTo(x + 8 * dir, torsoY + 10);
  g.stroke();
  // Fur trim at collar
  g.fillStyle(0xdeb887, 0.8);
  g.fillRect(x - 14, torsoY - 16, 28, 5);
  // Belt with ornament
  g.fillStyle(accent, 1);
  g.fillRect(x - 16, torsoY + 18, 32, 5);
  g.fillCircle(x, torsoY + 20, 4);

  // BACK ARM
  const backArmX = x - 10 * dir;
  g.lineStyle(5, primary, 0.7);
  const baa = (-bp.armAngle * 0.3) * Math.PI / 180;
  g.beginPath();
  g.moveTo(backArmX, torsoY - 4);
  g.lineTo(backArmX + Math.sin(baa) * 20 * dir, torsoY - 4 + Math.cos(baa) * 20);
  g.stroke();

  // HEAD — Fur-lined cap, narrow eyes, wispy mustache
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 32 + bp.headY;
  g.fillStyle(skin, 1);
  g.lineStyle(2, 0x000000, 0.8);
  g.fillCircle(headX, headY + 2, 11);
  g.strokeCircle(headX, headY + 2, 11);
  // Narrow eyes
  g.lineStyle(2, 0x000000, 1);
  g.beginPath(); g.moveTo(headX + 2 * dir, headY); g.lineTo(headX + 8 * dir, headY + 1); g.stroke();
  // Wispy mustache
  g.lineStyle(1, 0x333333, 0.6);
  g.beginPath(); g.moveTo(headX - 3, headY + 6); g.lineTo(headX - 8, headY + 10); g.stroke();
  g.beginPath(); g.moveTo(headX + 3, headY + 6); g.lineTo(headX + 8, headY + 10); g.stroke();
  // Fur cap
  g.fillStyle(secondary, 1);
  g.fillRect(headX - 13, headY - 14, 26, 14);
  g.fillStyle(0xdeb887, 0.8);
  g.fillRect(headX - 14, headY - 4, 28, 5);
  // Pointed top
  g.fillStyle(primary, 1);
  g.beginPath();
  g.moveTo(headX - 10, headY - 14);
  g.lineTo(headX, headY - 22);
  g.lineTo(headX + 10, headY - 14);
  g.closePath(); g.fillPath();

  // FRONT ARM + CURVED SWORD
  const armX = x + 10 * dir;
  const armY = torsoY - 4;
  const handX = armX + Math.sin(armAngle) * 24 * dir;
  const handY = armY - Math.cos(armAngle) * 24;
  g.lineStyle(5, primary, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  g.fillStyle(skin, 1);
  g.fillCircle(handX, handY, 4);
  // Curved sword
  const sLen = 45;
  const tipX = handX + Math.sin(weapAngle) * sLen * dir;
  const tipY = handY - Math.cos(weapAngle) * sLen;
  const midX = (handX + tipX) / 2 + Math.cos(weapAngle) * 6 * dir;
  const midY = (handY + tipY) / 2 + Math.sin(weapAngle) * 6;
  g.lineStyle(3, 0xcccccc, 1);
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(midX, midY); g.lineTo(tipX, tipY); g.stroke();
  g.fillStyle(accent, 1);
  g.fillCircle(handX, handY, 4);
}

// ============================================================
// SPARTAN — Corinthian helm, red cape, round shield, short sword
// ============================================================
function drawSpartan(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 24, 7);

  // LEGS — bare muscular with greaves
  g.lineStyle(7, skin, 1);
  g.beginPath(); g.moveTo(x - 6 * dir, torsoY + 28); g.lineTo(x - bp.legSpread * 0.6 * dir, baseY - 5); g.stroke();
  g.beginPath(); g.moveTo(x + 4 * dir, torsoY + 28); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 5); g.stroke();
  // Bronze greaves
  g.fillStyle(secondary, 1);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 5, baseY - 20, 10, 16);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 5, baseY - 20, 10, 16);
  // Sandals
  g.fillStyle(0x8b6914, 1);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 6, baseY - 5, 12, 5);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 6, baseY - 5, 12, 5);

  // RED CAPE (behind body)
  g.fillStyle(primary, 0.8);
  g.beginPath();
  g.moveTo(x - 14 * dir, torsoY - 14);
  g.lineTo(x - 20 * dir, torsoY + 40);
  g.lineTo(x - 24 * dir, baseY - 5);
  g.lineTo(x - 10 * dir, torsoY - 10);
  g.closePath(); g.fillPath();
  // Cape folds
  g.lineStyle(1, 0x660000, 0.3);
  g.beginPath(); g.moveTo(x - 14 * dir, torsoY); g.lineTo(x - 20 * dir, torsoY + 35); g.stroke();

  // TORSO — bronze cuirass (muscle armor)
  g.fillStyle(secondary, 1);
  g.fillRect(x - 15, torsoY - 14, 30, 36);
  g.lineStyle(2, 0x8b6914, 0.6);
  g.strokeRect(x - 15, torsoY - 14, 30, 36);
  // Muscle detail
  g.lineStyle(1, 0x8b6914, 0.3);
  g.beginPath(); g.moveTo(x - 8, torsoY - 6); g.lineTo(x, torsoY + 2); g.stroke();
  g.beginPath(); g.moveTo(x + 8, torsoY - 6); g.lineTo(x, torsoY + 2); g.stroke();
  g.beginPath(); g.moveTo(x, torsoY + 4); g.lineTo(x, torsoY + 18); g.stroke();
  // Pteruges (leather strips)
  g.fillStyle(0x8b6914, 0.8);
  for (let i = -3; i <= 3; i++) {
    g.fillRect(x + i * 6 - 2, torsoY + 22, 5, 14);
  }
  // Lambda on cuirass
  g.lineStyle(2, primary, 0.8);
  g.beginPath();
  g.moveTo(x, torsoY - 8);
  g.lineTo(x - 6, torsoY + 10);
  g.moveTo(x, torsoY - 8);
  g.lineTo(x + 6, torsoY + 10);
  g.moveTo(x - 4, torsoY + 4);
  g.lineTo(x + 4, torsoY + 4);
  g.stroke();

  // BACK ARM with aspis (round shield)
  const backArmX = x - 12 * dir;
  const baa = (-bp.armAngle * 0.35) * Math.PI / 180;
  const shieldX = backArmX + Math.sin(baa) * 14 * dir;
  const shieldY = torsoY + Math.cos(baa) * 14;
  g.lineStyle(6, skin, 0.8);
  g.beginPath(); g.moveTo(backArmX, torsoY - 4); g.lineTo(shieldX, shieldY); g.stroke();
  // Large round shield
  g.fillStyle(secondary, 1);
  g.fillCircle(shieldX, shieldY, 20);
  g.lineStyle(2, 0x000000, 0.4);
  g.strokeCircle(shieldX, shieldY, 20);
  g.lineStyle(1, 0x000000, 0.2);
  g.strokeCircle(shieldX, shieldY, 15);
  // Lambda on shield
  g.lineStyle(2, primary, 0.7);
  g.beginPath();
  g.moveTo(shieldX, shieldY - 10);
  g.lineTo(shieldX - 6, shieldY + 6);
  g.moveTo(shieldX, shieldY - 10);
  g.lineTo(shieldX + 6, shieldY + 6);
  g.moveTo(shieldX - 4, shieldY);
  g.lineTo(shieldX + 4, shieldY);
  g.stroke();

  // HEAD — Corinthian helmet with crest
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 32 + bp.headY;
  // Helmet (covers whole head)
  g.fillStyle(secondary, 1);
  g.lineStyle(2, 0x8b6914, 0.8);
  g.fillRect(headX - 12, headY - 12, 24, 26);
  g.strokeRect(headX - 12, headY - 12, 24, 26);
  // Eye slits
  g.fillStyle(0x111111, 1);
  g.fillRect(headX - 9, headY, 7, 3);
  g.fillRect(headX + 2, headY, 7, 3);
  // Nose guard
  g.fillStyle(secondary, 1);
  g.fillRect(headX - 2, headY - 4, 4, 14);
  // CREST (tall red mohawk)
  g.fillStyle(primary, 1);
  for (let i = 0; i < 9; i++) {
    const cy = headY - 14 - i * 2;
    const r = 5 - Math.abs(i - 4) * 0.5;
    g.fillCircle(headX, cy, r);
  }

  // FRONT ARM + short sword (xiphos)
  const armX = x + 10 * dir;
  const armY = torsoY - 4;
  const handX = armX + Math.sin(armAngle) * 26 * dir;
  const handY = armY - Math.cos(armAngle) * 26;
  g.lineStyle(6, skin, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  g.fillStyle(skin, 1);
  g.fillCircle(handX, handY, 4);
  // Xiphos (leaf-shaped blade)
  const xLen = 35;
  const tipX = handX + Math.sin(weapAngle) * xLen * dir;
  const tipY = handY - Math.cos(weapAngle) * xLen;
  g.lineStyle(4, 0xcccccc, 1);
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(tipX, tipY); g.stroke();
  g.lineStyle(1, 0xffffff, 0.4);
  g.beginPath(); g.moveTo(handX + dir, handY); g.lineTo(tipX + dir, tipY); g.stroke();
  g.fillStyle(secondary, 1);
  g.fillCircle(handX, handY, 4);
}

// ============================================================
// PIRATE — Tricorn hat, coat, cutlass, eye patch
// ============================================================
function drawPirate(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 20, 6);

  // LEGS — loose breeches with boots
  g.lineStyle(7, 0x444444, 1);
  g.beginPath(); g.moveTo(x - 5 * dir, torsoY + 26); g.lineTo(x - bp.legSpread * 0.5 * dir, baseY - 5); g.stroke();
  g.beginPath(); g.moveTo(x + 3 * dir, torsoY + 26); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 5); g.stroke();
  // Bucket-top boots
  g.fillStyle(primary, 1);
  g.fillRect(x - bp.legSpread * 0.5 * dir - 6, baseY - 16, 12, 16);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 6, baseY - 16, 12, 16);
  // Boot cuffs
  g.fillStyle(0x3a2010, 1);
  g.fillRect(x - bp.legSpread * 0.5 * dir - 7, baseY - 16, 14, 4);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 7, baseY - 16, 14, 4);

  // COAT tails (behind)
  g.fillStyle(secondary, 0.6);
  g.beginPath();
  g.moveTo(x - 16 * dir, torsoY + 20);
  g.lineTo(x - 18 * dir, baseY - 10);
  g.lineTo(x - 8 * dir, baseY - 5);
  g.lineTo(x - 8 * dir, torsoY + 22);
  g.closePath(); g.fillPath();

  // TORSO — pirate coat over shirt
  // White shirt underneath
  g.fillStyle(0xf5f5dc, 1);
  g.fillRect(x - 13, torsoY - 12, 26, 34);
  // Open coat
  g.fillStyle(secondary, 1);
  g.fillRect(x - 16, torsoY - 14, 10, 40);
  g.fillRect(x + 6, torsoY - 14, 10, 40);
  // Gold buttons
  g.fillStyle(accent, 1);
  g.fillCircle(x - 8, torsoY - 4, 2);
  g.fillCircle(x - 8, torsoY + 6, 2);
  g.fillCircle(x - 8, torsoY + 16, 2);
  // Sash across waist
  g.fillStyle(accent, 0.8);
  g.beginPath();
  g.moveTo(x - 16, torsoY + 16);
  g.lineTo(x + 16, torsoY + 20);
  g.lineTo(x + 16, torsoY + 26);
  g.lineTo(x - 16, torsoY + 22);
  g.closePath(); g.fillPath();

  // BACK ARM
  const backArmX = x - 10 * dir;
  g.lineStyle(5, 0xf5f5dc, 0.7);
  const baa = (-bp.armAngle * 0.3) * Math.PI / 180;
  g.beginPath();
  g.moveTo(backArmX, torsoY - 4);
  g.lineTo(backArmX + Math.sin(baa) * 20 * dir, torsoY - 4 + Math.cos(baa) * 20);
  g.stroke();

  // HEAD — Tricorn hat, bandana, eye patch, stubble
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 32 + bp.headY;
  // Face
  g.fillStyle(skin, 1);
  g.lineStyle(2, 0x000000, 0.8);
  g.fillCircle(headX, headY + 2, 11);
  g.strokeCircle(headX, headY + 2, 11);
  // Good eye
  g.fillStyle(0x000000, 1);
  g.fillCircle(headX + 4 * dir, headY, 2);
  // Eye patch on other side
  g.fillStyle(0x111111, 1);
  g.fillCircle(headX - 4 * dir, headY, 4);
  g.lineStyle(1, 0x111111, 1);
  g.beginPath(); g.moveTo(headX - 4 * dir, headY - 3); g.lineTo(headX, headY - 10); g.stroke();
  // Grin
  g.lineStyle(1, 0x000000, 0.6);
  g.beginPath();
  g.moveTo(headX - 4, headY + 6);
  g.lineTo(headX + 4, headY + 5);
  g.stroke();
  // Stubble dots
  g.fillStyle(0x333333, 0.3);
  for (let i = 0; i < 5; i++) {
    g.fillCircle(headX - 4 + i * 2, headY + 8 + Math.random(), 0.5);
  }
  // Bandana
  g.fillStyle(accent, 1);
  g.fillRect(headX - 12, headY - 8, 24, 6);
  // Tricorn hat
  g.fillStyle(primary, 1);
  g.beginPath();
  g.moveTo(headX - 18, headY - 10);
  g.lineTo(headX, headY - 26);
  g.lineTo(headX + 18, headY - 10);
  g.lineTo(headX + 14, headY - 8);
  g.lineTo(headX, headY - 14);
  g.lineTo(headX - 14, headY - 8);
  g.closePath(); g.fillPath();
  g.lineStyle(1, accent, 0.8);
  g.beginPath();
  g.moveTo(headX - 14, headY - 8);
  g.lineTo(headX + 14, headY - 8);
  g.stroke();
  // Skull emblem on hat
  g.fillStyle(0xffffff, 0.7);
  g.fillCircle(headX, headY - 18, 3);

  // FRONT ARM + CUTLASS
  const armX = x + 10 * dir;
  const armY = torsoY - 4;
  const handX = armX + Math.sin(armAngle) * 24 * dir;
  const handY = armY - Math.cos(armAngle) * 24;
  g.lineStyle(5, 0xf5f5dc, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  g.fillStyle(skin, 1);
  g.fillCircle(handX, handY, 4);
  // Cutlass — curved, with basket guard
  const cLen = 40;
  const tipX = handX + Math.sin(weapAngle) * cLen * dir;
  const tipY = handY - Math.cos(weapAngle) * cLen;
  const midX = (handX + tipX) / 2 + Math.cos(weapAngle) * 3 * dir;
  const midY = (handY + tipY) / 2 + Math.sin(weapAngle) * 3;
  g.lineStyle(3, 0xcccccc, 1);
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(midX, midY); g.lineTo(tipX, tipY); g.stroke();
  // Basket guard
  g.lineStyle(2, accent, 1);
  g.beginPath();
  g.arc(handX, handY, 8, weapAngle - Math.PI * 0.4, weapAngle + Math.PI * 0.4);
  g.stroke();
}

// ============================================================
// ZULU WARRIOR — Cowhide shield, iklwa spear, headdress
// ============================================================
function drawZulu(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 20, 6);

  // LEGS — powerful, bare
  g.lineStyle(7, skin, 1);
  g.beginPath(); g.moveTo(x - 5 * dir, torsoY + 28); g.lineTo(x - bp.legSpread * 0.6 * dir, baseY - 4); g.stroke();
  g.beginPath(); g.moveTo(x + 3 * dir, torsoY + 28); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 4); g.stroke();
  // Ankle bands
  g.fillStyle(secondary, 1);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 5, baseY - 8, 10, 4);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 5, baseY - 8, 10, 4);
  // Fur ankle wraps
  g.fillStyle(0xffffff, 0.6);
  g.fillRect(x - bp.legSpread * 0.6 * dir - 6, baseY - 10, 12, 3);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 6, baseY - 10, 12, 3);

  // TORSO — muscular bare chest with leopard-skin belt
  g.fillStyle(skin, 1);
  g.fillRect(x - 16, torsoY - 14, 32, 38);
  g.lineStyle(2, 0x000000, 0.2);
  g.strokeRect(x - 16, torsoY - 14, 32, 38);
  // Chest muscle definition
  g.lineStyle(1, 0x000000, 0.1);
  g.beginPath(); g.moveTo(x - 10, torsoY - 6); g.lineTo(x, torsoY + 2); g.stroke();
  g.beginPath(); g.moveTo(x + 10, torsoY - 6); g.lineTo(x, torsoY + 2); g.stroke();
  // Leopard-skin belt/isinene
  g.fillStyle(primary, 1);
  g.fillRect(x - 17, torsoY + 18, 34, 10);
  // Leopard spots
  g.fillStyle(0x000000, 0.3);
  for (let i = 0; i < 4; i++) {
    g.fillCircle(x - 10 + i * 7, torsoY + 23, 2);
  }
  // Arm band
  g.fillStyle(accent, 1);
  g.fillRect(x + 8 * dir, torsoY - 14, 10, 4);

  // BACK ARM with isihlangu (cowhide shield)
  const backArmX = x - 12 * dir;
  const baa = (-bp.armAngle * 0.3) * Math.PI / 180;
  const shieldX = backArmX + Math.sin(baa) * 14 * dir;
  const shieldY = torsoY + Math.cos(baa) * 14;
  g.lineStyle(6, skin, 0.8);
  g.beginPath(); g.moveTo(backArmX, torsoY - 4); g.lineTo(shieldX, shieldY); g.stroke();
  // Tall oval cowhide shield
  g.fillStyle(secondary, 1);
  ellipse(g, shieldX, shieldY, 14, 24);
  g.lineStyle(2, 0x000000, 0.4);
  // Shield pattern — center stripe
  g.fillStyle(primary, 0.6);
  g.fillRect(shieldX - 3, shieldY - 20, 6, 40);
  // Hide pattern patches
  g.fillStyle(0x000000, 0.2);
  g.fillCircle(shieldX - 6, shieldY - 8, 4);
  g.fillCircle(shieldX + 5, shieldY + 6, 3);

  // HEAD — with headdress feathers
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 32 + bp.headY;
  g.fillStyle(skin, 1);
  g.lineStyle(2, 0x000000, 0.6);
  g.fillCircle(headX, headY + 2, 12);
  g.strokeCircle(headX, headY + 2, 12);
  // Strong features
  g.fillStyle(0x000000, 1);
  g.fillCircle(headX + 4 * dir, headY, 2.5);
  // Determined expression
  g.lineStyle(1.5, 0x000000, 0.6);
  g.beginPath(); g.moveTo(headX + 1 * dir, headY + 6); g.lineTo(headX + 6 * dir, headY + 5); g.stroke();
  // Headband
  g.fillStyle(accent, 1);
  g.fillRect(headX - 13, headY - 6, 26, 4);
  // Feather headdress
  const featherColors = [accent, 0xffffff, accent, 0x000000, accent];
  for (let i = 0; i < featherColors.length; i++) {
    g.fillStyle(featherColors[i], 0.8);
    g.beginPath();
    g.moveTo(headX + (i - 2) * 5, headY - 8);
    g.lineTo(headX + (i - 2) * 5 - 1, headY - 28 - Math.abs(i - 2) * 3);
    g.lineTo(headX + (i - 2) * 5 + 2, headY - 26 - Math.abs(i - 2) * 3);
    g.closePath(); g.fillPath();
  }

  // FRONT ARM + IKLWA (short stabbing spear)
  const armX = x + 10 * dir;
  const armY = torsoY - 4;
  const handX = armX + Math.sin(armAngle) * 26 * dir;
  const handY = armY - Math.cos(armAngle) * 26;
  g.lineStyle(6, skin, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  g.fillStyle(skin, 1);
  g.fillCircle(handX, handY, 4);
  // Iklwa shaft (short spear)
  const spearLen = 55;
  const tipX = handX + Math.sin(weapAngle) * spearLen * dir;
  const tipY = handY - Math.cos(weapAngle) * spearLen;
  g.lineStyle(3, 0x8b6914, 1);
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(tipX, tipY); g.stroke();
  // Broad leaf-shaped blade
  g.fillStyle(0xcccccc, 1);
  const bladeStart = 0.65;
  const bladeX = handX + Math.sin(weapAngle) * spearLen * bladeStart * dir;
  const bladeY = handY - Math.cos(weapAngle) * spearLen * bladeStart;
  g.beginPath();
  g.moveTo(bladeX, bladeY);
  g.lineTo(tipX, tipY);
  g.lineTo(bladeX + Math.cos(weapAngle) * 6 * dir, bladeY + Math.sin(weapAngle) * 6);
  g.closePath(); g.fillPath();
}

// ============================================================
// CONQUISTADOR — Morion helmet, breastplate, rapier, cape
// ============================================================
function drawConquistador(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 20, 6);

  // LEGS — hose with tall boots
  g.lineStyle(6, primary, 1);
  g.beginPath(); g.moveTo(x - 5 * dir, torsoY + 26); g.lineTo(x - bp.legSpread * 0.5 * dir, baseY - 5); g.stroke();
  g.beginPath(); g.moveTo(x + 3 * dir, torsoY + 26); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 5); g.stroke();
  // Tall leather boots
  g.fillStyle(0x3a2010, 1);
  g.fillRect(x - bp.legSpread * 0.5 * dir - 5, baseY - 20, 10, 20);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 5, baseY - 20, 10, 20);
  // Boot cuff
  g.fillRect(x - bp.legSpread * 0.5 * dir - 6, baseY - 20, 12, 3);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 6, baseY - 20, 12, 3);

  // CAPE (behind)
  g.fillStyle(primary, 0.5);
  g.beginPath();
  g.moveTo(x - 14 * dir, torsoY - 12);
  g.lineTo(x - 20 * dir, torsoY + 38);
  g.lineTo(x - 8 * dir, torsoY + 34);
  g.lineTo(x - 6 * dir, torsoY - 8);
  g.closePath(); g.fillPath();

  // TORSO — breastplate over puffy shirt
  g.fillStyle(0xf5f5dc, 1);
  g.fillRect(x - 14, torsoY - 12, 28, 34);
  // Steel breastplate
  g.fillStyle(secondary, 1);
  g.fillRect(x - 12, torsoY - 12, 24, 28);
  g.lineStyle(1, 0x999999, 0.5);
  g.strokeRect(x - 12, torsoY - 12, 24, 28);
  // Cross etching on breastplate
  g.lineStyle(1, accent, 0.4);
  g.beginPath(); g.moveTo(x, torsoY - 8); g.lineTo(x, torsoY + 10); g.stroke();
  g.beginPath(); g.moveTo(x - 6, torsoY); g.lineTo(x + 6, torsoY); g.stroke();
  // Belt
  g.fillStyle(0x3a2010, 1);
  g.fillRect(x - 14, torsoY + 16, 28, 5);
  g.fillStyle(accent, 1);
  g.fillRect(x - 2, torsoY + 15, 4, 7);

  // BACK ARM
  const backArmX = x - 10 * dir;
  g.lineStyle(5, 0xf5f5dc, 0.7);
  const baa = (-bp.armAngle * 0.3) * Math.PI / 180;
  g.beginPath();
  g.moveTo(backArmX, torsoY - 4);
  g.lineTo(backArmX + Math.sin(baa) * 20 * dir, torsoY - 4 + Math.cos(baa) * 20);
  g.stroke();

  // HEAD — Morion helmet, goatee
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 32 + bp.headY;
  g.fillStyle(skin, 1);
  g.lineStyle(2, 0x000000, 0.8);
  g.fillCircle(headX, headY + 2, 11);
  g.strokeCircle(headX, headY + 2, 11);
  // Eyes
  g.fillStyle(0x000000, 1);
  g.fillCircle(headX + 4 * dir, headY, 2);
  // Goatee
  g.fillStyle(0x333333, 1);
  g.beginPath();
  g.moveTo(headX - 3, headY + 8);
  g.lineTo(headX, headY + 14);
  g.lineTo(headX + 3, headY + 8);
  g.closePath(); g.fillPath();
  // Morion helmet (distinctive comb shape)
  g.fillStyle(secondary, 1);
  // Brim (pointed front and back)
  g.beginPath();
  g.moveTo(headX - 18, headY - 4);
  g.lineTo(headX - 8, headY - 8);
  g.lineTo(headX + 8, headY - 8);
  g.lineTo(headX + 18, headY - 4);
  g.lineTo(headX + 12, headY - 2);
  g.lineTo(headX - 12, headY - 2);
  g.closePath(); g.fillPath();
  // Dome
  g.fillRect(headX - 10, headY - 16, 20, 14);
  // Comb/crest
  g.fillRect(headX - 2, headY - 22, 4, 10);
  g.lineStyle(1, 0x777777, 0.5);
  g.strokeRect(headX - 10, headY - 16, 20, 14);

  // FRONT ARM + RAPIER
  const armX = x + 10 * dir;
  const armY = torsoY - 4;
  const handX = armX + Math.sin(armAngle) * 24 * dir;
  const handY = armY - Math.cos(armAngle) * 24;
  g.lineStyle(5, 0xf5f5dc, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  g.fillStyle(skin, 1);
  g.fillCircle(handX, handY, 4);
  // Rapier — long, thin, elegant
  const rapierLen = 52;
  const tipX = handX + Math.sin(weapAngle) * rapierLen * dir;
  const tipY = handY - Math.cos(weapAngle) * rapierLen;
  g.lineStyle(2, 0xdddddd, 1);
  g.beginPath(); g.moveTo(handX, handY); g.lineTo(tipX, tipY); g.stroke();
  g.lineStyle(1, 0xffffff, 0.5);
  g.beginPath(); g.moveTo(handX + dir * 0.5, handY); g.lineTo(tipX + dir * 0.5, tipY); g.stroke();
  // Cup guard (swept hilt)
  g.lineStyle(2, accent, 1);
  g.beginPath();
  g.arc(handX, handY, 9, weapAngle - Math.PI * 0.5, weapAngle + Math.PI * 0.5);
  g.stroke();
  g.fillStyle(accent, 1);
  g.fillCircle(handX, handY, 3);
}

// ============================================================
// NAVY SEAL — NVGs, tactical vest, balaclava, rifle-as-sword
// ============================================================
function drawSeal(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const secondary = hex(c.secondary);
  const accent = hex(c.accent);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff + bp.headY * 0.3;
  const armAngle = bp.armAngle * Math.PI / 180;
  const weapAngle = bp.weaponAngle * Math.PI / 180;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 20, 6);

  // LEGS — tactical pants with knee pads
  g.lineStyle(7, primary, 1);
  g.beginPath(); g.moveTo(x - 5 * dir, torsoY + 28); g.lineTo(x - bp.legSpread * 0.5 * dir, baseY - 5); g.stroke();
  g.beginPath(); g.moveTo(x + 3 * dir, torsoY + 28); g.lineTo(x + bp.legSpread * 0.4 * dir, baseY - 5); g.stroke();
  // Knee pads
  g.fillStyle(0x333333, 1);
  g.fillRect(x - bp.legSpread * 0.3 * dir - 4, torsoY + 28, 8, 6);
  g.fillRect(x + bp.legSpread * 0.2 * dir - 4, torsoY + 28, 8, 6);
  // Combat boots
  g.fillStyle(secondary, 1);
  g.fillRect(x - bp.legSpread * 0.5 * dir - 6, baseY - 8, 12, 8);
  g.fillRect(x + bp.legSpread * 0.4 * dir - 6, baseY - 8, 12, 8);

  // TORSO — tactical vest with pouches
  // Base shirt
  g.fillStyle(primary, 1);
  g.fillRect(x - 16, torsoY - 14, 32, 38);
  // Plate carrier vest
  g.fillStyle(0x2a3a2a, 1);
  g.fillRect(x - 14, torsoY - 12, 28, 30);
  g.lineStyle(1, 0x1a2a1a, 0.8);
  g.strokeRect(x - 14, torsoY - 12, 28, 30);
  // MOLLE webbing lines
  g.lineStyle(1, 0x3a4a3a, 0.4);
  for (let i = 0; i < 4; i++) {
    g.beginPath(); g.moveTo(x - 12, torsoY - 8 + i * 7); g.lineTo(x + 12, torsoY - 8 + i * 7); g.stroke();
  }
  // Magazine pouches
  g.fillStyle(0x333333, 1);
  g.fillRect(x - 12, torsoY + 2, 8, 12);
  g.fillRect(x + 4, torsoY + 2, 8, 12);
  // Utility belt
  g.fillStyle(secondary, 1);
  g.fillRect(x - 16, torsoY + 20, 32, 5);
  // US flag patch (simplified)
  g.fillStyle(accent, 1);
  g.fillRect(x + 8 * dir, torsoY - 10, 6, 4);

  // BACK ARM
  const backArmX = x - 10 * dir;
  g.lineStyle(5, primary, 0.7);
  const baa = (-bp.armAngle * 0.3) * Math.PI / 180;
  g.beginPath();
  g.moveTo(backArmX, torsoY - 4);
  g.lineTo(backArmX + Math.sin(baa) * 20 * dir, torsoY - 4 + Math.cos(baa) * 20);
  g.stroke();

  // HEAD — balaclava + NVGs + helmet
  const headX = x + Math.sin(bp.torsoAngle * Math.PI / 180 * dir) * 4;
  const headY = torsoY - 32 + bp.headY;
  // Balaclava (covered face)
  g.fillStyle(secondary, 1);
  g.lineStyle(2, 0x000000, 0.8);
  g.fillCircle(headX, headY + 2, 12);
  g.strokeCircle(headX, headY + 2, 12);
  // Eye slit
  g.fillStyle(skin, 1);
  g.fillRect(headX - 8, headY - 2, 16, 5);
  // Eyes (intense)
  g.fillStyle(0x000000, 1);
  g.fillCircle(headX + 3 * dir, headY, 2);
  g.fillCircle(headX - 3 * dir, headY, 1.5);
  // Helmet
  g.fillStyle(primary, 1);
  g.fillRect(headX - 14, headY - 14, 28, 12);
  g.lineStyle(1, 0x000000, 0.5);
  g.strokeRect(headX - 14, headY - 14, 28, 12);
  // NVG mount
  g.fillStyle(0x333333, 1);
  g.fillRect(headX - 4, headY - 16, 8, 4);
  // NVG tubes (flipped up)
  g.fillStyle(0x222222, 1);
  g.fillRect(headX - 6, headY - 24, 5, 10);
  g.fillRect(headX + 1, headY - 24, 5, 10);
  // NVG lens (green glow)
  g.fillStyle(0x00ff00, 0.4);
  g.fillCircle(headX - 3.5, headY - 24, 3);
  g.fillCircle(headX + 3.5, headY - 24, 3);
  // Helmet strap
  g.lineStyle(1, primary, 0.6);
  g.beginPath(); g.moveTo(headX - 12, headY - 2); g.lineTo(headX - 10, headY + 6); g.stroke();

  // FRONT ARM + RIFLE (swung as melee weapon)
  const armX = x + 10 * dir;
  const armY = torsoY - 4;
  const handX = armX + Math.sin(armAngle) * 26 * dir;
  const handY = armY - Math.cos(armAngle) * 26;
  g.lineStyle(5, primary, 1);
  g.beginPath(); g.moveTo(armX, armY); g.lineTo(handX, handY); g.stroke();
  // Tactical gloves
  g.fillStyle(secondary, 1);
  g.fillCircle(handX, handY, 5);
  // RIFLE (M4-style, held like a bat)
  const rifleLen = 55;
  const tipX = handX + Math.sin(weapAngle) * rifleLen * dir;
  const tipY = handY - Math.cos(weapAngle) * rifleLen;
  // Stock
  g.lineStyle(5, 0x333333, 1);
  g.beginPath(); g.moveTo(handX, handY);
  const midX = handX + Math.sin(weapAngle) * 20 * dir;
  const midY = handY - Math.cos(weapAngle) * 20;
  g.lineTo(midX, midY);
  g.stroke();
  // Receiver/barrel
  g.lineStyle(4, 0x444444, 1);
  g.beginPath(); g.moveTo(midX, midY); g.lineTo(tipX, tipY); g.stroke();
  // Handguard details
  g.lineStyle(1, 0x555555, 0.5);
  const hgX = (midX + tipX) / 2;
  const hgY = (midY + tipY) / 2;
  g.beginPath(); g.moveTo(hgX - 2 * dir, hgY - 2); g.lineTo(hgX + 2 * dir, hgY + 2); g.stroke();
  // Magazine
  const magAngle = weapAngle + Math.PI / 2;
  g.fillStyle(0x333333, 1);
  g.lineStyle(2, 0x333333, 1);
  g.beginPath();
  g.moveTo(midX + 5 * dir, midY);
  g.lineTo(midX + 5 * dir + Math.cos(magAngle) * 10, midY + Math.sin(magAngle) * 10);
  g.stroke();
  // Optic/red dot sight
  g.fillStyle(0x222222, 1);
  const optX = midX + Math.sin(weapAngle) * 5 * dir;
  const optY = midY - Math.cos(weapAngle) * 5;
  g.fillRect(optX - 3, optY - 5, 6, 4);
  g.fillStyle(accent, 0.6);
  g.fillCircle(optX, optY - 4, 1.5);
}

// ============================================================
// GENERIC fallback
// ============================================================
function drawGenericWarrior(g, x, baseY, dir, bp, c, state) {
  const primary = hex(c.primary);
  const skin = hex(c.skin);
  const crouchOff = bp.crouchFactor * 30;
  const torsoY = baseY - 55 + crouchOff;

  g.fillStyle(0x000000, 0.15);
  ellipse(g, x, baseY, 18, 5);

  g.lineStyle(5, 0x555555, 1);
  g.beginPath(); g.moveTo(x - 6, torsoY + 25); g.lineTo(x - 12, baseY); g.stroke();
  g.beginPath(); g.moveTo(x + 6, torsoY + 25); g.lineTo(x + 12, baseY); g.stroke();
  g.fillStyle(primary, 1);
  g.fillRect(x - 14, torsoY - 14, 28, 36);
  g.fillStyle(skin, 1);
  g.fillCircle(x, torsoY - 26, 12);
}

const WARRIOR_DRAW_MAP = {
  knight: drawKnight,
  samurai: drawSamurai,
  viking: drawViking,
  gladiator: drawGladiator,
  mongol: drawMongol,
  spartan: drawSpartan,
  pirate: drawPirate,
  zulu: drawZulu,
  conquistador: drawConquistador,
  seal: drawSeal,
};
