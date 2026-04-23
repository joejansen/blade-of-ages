import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../config/constants.js';

export function drawArena(scene, arenaId, options = {}) {
  const { includeFloor = true } = options;
  const textureKey = `arena_${arenaId}`;

  // If a high-res AI-generated background JPG is loaded, use it!
  if (scene.textures.exists(textureKey) && scene.textures.get(textureKey).key !== '__MISSING') {
    const bg = scene.add.image(0, 0, textureKey).setOrigin(0, 0);
    bg.setDepth(0);

    if (includeFloor) {
      // Provide a subtle dark floor overlay to physically ground the fighters
      const g = scene.add.graphics();
      g.setDepth(0);
      g.fillStyle(0x000000, 0.15);
      g.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    }

    return bg;
  }

  // Fallback to internal procedural block-rendered backgrounds
  const g = scene.add.graphics();
  g.setDepth(0);

  const drawFn = ARENA_DRAW_FUNCTIONS[arenaId] || drawCastle;
  drawFn(g);

  if (includeFloor) {
    // Ground platform
    g.fillStyle(0x000000, 0.15);
    g.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
  }

  return g;
}

function drawSky(g, topColor, bottomColor) {
  // Gradient sky using horizontal bands
  const steps = 20;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = lerp((topColor >> 16) & 0xff, (bottomColor >> 16) & 0xff, t);
    const gr = lerp((topColor >> 8) & 0xff, (bottomColor >> 8) & 0xff, t);
    const b = lerp(topColor & 0xff, bottomColor & 0xff, t);
    const color = (Math.round(r) << 16) | (Math.round(gr) << 8) | Math.round(b);
    g.fillStyle(color, 1);
    g.fillRect(0, (GROUND_Y / steps) * i, GAME_WIDTH, GROUND_Y / steps + 1);
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// --- Castle Courtyard (Knight) ---
function drawCastle(g) {
  drawSky(g, 0x6b7b8d, 0xb0bec5);

  // Castle walls
  g.fillStyle(0x696969, 1);
  g.fillRect(0, 200, 200, GROUND_Y - 200);
  g.fillRect(GAME_WIDTH - 200, 200, 200, GROUND_Y - 200);

  // Battlements
  for (let i = 0; i < 5; i++) {
    g.fillRect(i * 40, 180, 25, 30);
    g.fillRect(GAME_WIDTH - 200 + i * 40, 180, 25, 30);
  }

  // Tower
  g.fillStyle(0x5a5a5a, 1);
  g.fillRect(60, 100, 80, GROUND_Y - 100);
  g.fillRect(GAME_WIDTH - 140, 100, 80, GROUND_Y - 100);

  // Banners
  g.fillStyle(0xcc0000, 1);
  g.fillRect(85, 130, 30, 50);
  g.fillRect(GAME_WIDTH - 115, 130, 30, 50);

  // Stone floor
  g.fillStyle(0x808080, 1);
  g.fillRect(0, GROUND_Y - 5, GAME_WIDTH, 5);

  // Stone line details
  g.lineStyle(1, 0x5a5a5a, 0.3);
  for (let x = 0; x < GAME_WIDTH; x += 60) {
    g.beginPath();
    g.moveTo(x, GROUND_Y - 5);
    g.lineTo(x, GROUND_Y);
    g.stroke();
  }
}

// --- Cherry Blossom Dojo (Samurai) ---
function drawDojo(g) {
  drawSky(g, 0x87ceeb, 0xffe4e1);

  // Mountains in back
  g.fillStyle(0x6a5acd, 0.4);
  drawTriangle(g, 200, GROUND_Y - 50, 400, 100);
  drawTriangle(g, 600, GROUND_Y - 50, 350, 130);
  drawTriangle(g, 1000, GROUND_Y - 50, 380, 110);

  // Cherry trees
  drawCherryTree(g, 100, GROUND_Y);
  drawCherryTree(g, GAME_WIDTH - 100, GROUND_Y);

  // Wooden platform
  g.fillStyle(0x8b6914, 1);
  g.fillRect(200, GROUND_Y - 3, GAME_WIDTH - 400, 6);
  g.lineStyle(1, 0x6b4914, 1);
  g.strokeRect(200, GROUND_Y - 3, GAME_WIDTH - 400, 6);

  // Torii gate suggestion
  g.fillStyle(0xcc0000, 1);
  g.fillRect(GAME_WIDTH / 2 - 120, 150, 8, GROUND_Y - 150);
  g.fillRect(GAME_WIDTH / 2 + 112, 150, 8, GROUND_Y - 150);
  g.fillRect(GAME_WIDTH / 2 - 130, 150, 268, 8);
  g.fillRect(GAME_WIDTH / 2 - 125, 170, 258, 5);

  // Falling petals
  g.fillStyle(0xffb7c5, 0.6);
  for (let i = 0; i < 15; i++) {
    const px = (Date.now() / 20 + i * 90) % GAME_WIDTH;
    const py = (Date.now() / 30 + i * 50) % (GROUND_Y - 50) + 50;
    g.fillCircle(px, py, 3);
  }
}

function drawCherryTree(g, x, groundY) {
  g.fillStyle(0x4a3728, 1);
  g.fillRect(x - 8, groundY - 200, 16, 200);

  // Branches
  g.lineStyle(4, 0x4a3728, 1);
  g.beginPath(); g.moveTo(x, groundY - 150); g.lineTo(x - 50, groundY - 200); g.stroke();
  g.beginPath(); g.moveTo(x, groundY - 130); g.lineTo(x + 60, groundY - 180); g.stroke();
  g.beginPath(); g.moveTo(x, groundY - 170); g.lineTo(x - 30, groundY - 230); g.stroke();

  // Blossoms
  g.fillStyle(0xffb7c5, 0.7);
  g.fillCircle(x - 50, groundY - 210, 30);
  g.fillCircle(x + 60, groundY - 190, 25);
  g.fillCircle(x - 30, groundY - 240, 28);
  g.fillCircle(x, groundY - 220, 22);
  g.fillStyle(0xff69b4, 0.5);
  g.fillCircle(x - 40, groundY - 200, 18);
  g.fillCircle(x + 50, groundY - 180, 15);
}

// --- Longship Deck (Viking) ---
function drawLongship(g) {
  drawSky(g, 0x37474f, 0x546e7a);

  // Stormy sea
  g.fillStyle(0x1a3a4a, 1);
  g.fillRect(0, GROUND_Y - 30, GAME_WIDTH, 50);
  // Waves
  g.lineStyle(2, 0x4a7a8a, 0.5);
  for (let i = 0; i < 8; i++) {
    const wx = i * 180;
    const wy = GROUND_Y - 20 + Math.sin(i) * 5;
    g.beginPath();
    g.arc(wx + 45, wy, 45, Math.PI, 0, false);
    g.stroke();
  }

  // Ship hull curves (simplified)
  g.fillStyle(0x5c3a1e, 1);
  g.fillRect(100, GROUND_Y - 20, GAME_WIDTH - 200, 25);

  // Ship rails
  g.lineStyle(3, 0x6b4226, 1);
  g.beginPath();
  g.moveTo(60, GROUND_Y - 10);
  g.lineTo(100, GROUND_Y - 20);
  g.lineTo(GAME_WIDTH - 100, GROUND_Y - 20);
  g.lineTo(GAME_WIDTH - 60, GROUND_Y - 10);
  g.stroke();

  // Dragon prow
  g.fillStyle(0x8b6914, 1);
  g.fillRect(55, GROUND_Y - 60, 15, 55);
  g.fillCircle(62, GROUND_Y - 65, 12);

  // Mast
  g.fillStyle(0x4a3728, 1);
  g.fillRect(GAME_WIDTH / 2 - 5, 80, 10, GROUND_Y - 100);

  // Sail
  g.fillStyle(0xcc0000, 0.8);
  g.fillRect(GAME_WIDTH / 2 - 80, 100, 160, 180);
  g.lineStyle(2, 0x990000, 1);
  g.beginPath();
  g.moveTo(GAME_WIDTH / 2, 100);
  g.lineTo(GAME_WIDTH / 2, 280);
  g.stroke();

  // Shield row along the hull
  const shieldColors = [0xcc0000, 0x2255aa, 0xccaa00, 0xcc0000, 0x2255aa];
  for (let i = 0; i < shieldColors.length; i++) {
    const sx = 200 + i * 180;
    g.fillStyle(shieldColors[i], 1);
    g.fillCircle(sx, GROUND_Y - 25, 12);
    g.lineStyle(1, 0x000000, 0.5);
    g.strokeCircle(sx, GROUND_Y - 25, 12);
  }

  // Lightning in sky
  g.lineStyle(2, 0xffffcc, 0.3);
  g.beginPath();
  g.moveTo(900, 30);
  g.lineTo(880, 80);
  g.lineTo(900, 80);
  g.lineTo(870, 150);
  g.stroke();
}

// --- Roman Colosseum (Gladiator) ---
function drawColosseum(g) {
  drawSky(g, 0x87ceeb, 0xffecd2);

  // Arched walls
  g.fillStyle(0xd2b48c, 1);
  g.fillRect(0, 120, GAME_WIDTH, GROUND_Y - 120);

  // Arches
  g.fillStyle(0x8b7355, 1);
  for (let i = 0; i < 9; i++) {
    const ax = 60 + i * 145;
    g.fillRect(ax, 150, 100, 200);
    g.fillStyle(0xc4a882, 1);
    g.fillRect(ax + 10, 180, 80, 170);
    g.fillStyle(0x87ceeb, 0.3);
    g.fillRect(ax + 15, 200, 70, 150);
    g.fillStyle(0x8b7355, 1);
  }

  // Upper tier
  g.fillStyle(0xc4a882, 1);
  g.fillRect(0, 120, GAME_WIDTH, 40);

  // Columns
  g.fillStyle(0xdec8a8, 1);
  for (let i = 0; i < 10; i++) {
    g.fillRect(55 + i * 145, 120, 12, 40);
  }

  // Crowd silhouettes
  g.fillStyle(0x5a4a3a, 0.4);
  for (let i = 0; i < 30; i++) {
    g.fillCircle(40 + i * 42, 140, 8);
  }

  // Sand floor
  g.fillStyle(0xe8d5a3, 1);
  g.fillRect(0, GROUND_Y - 5, GAME_WIDTH, 10);
}

// --- Steppe Grasslands (Mongol) ---
function drawSteppe(g) {
  drawSky(g, 0x4a90d9, 0x87ceeb);

  // Vast open sky — it's the main feature
  // Rolling hills
  g.fillStyle(0x7caa2d, 0.6);
  for (let i = 0; i < 5; i++) {
    const hx = i * 300 - 50;
    const hw = 400;
    g.fillEllipse(hx + hw / 2, GROUND_Y + 10, hw, 60);
  }

  // Grass
  g.fillStyle(0x8db33a, 1);
  g.fillRect(0, GROUND_Y - 8, GAME_WIDTH, 12);

  // Yurts in the distance
  drawYurt(g, 150, GROUND_Y - 30, 0.5);
  drawYurt(g, 1050, GROUND_Y - 25, 0.4);

  // Distant horses
  g.fillStyle(0x4a3728, 0.3);
  g.fillRect(800, GROUND_Y - 35, 20, 15);
  g.fillRect(830, GROUND_Y - 38, 22, 18);

  // Clouds
  g.fillStyle(0xffffff, 0.4);
  g.fillEllipse(300, 100, 120, 40);
  g.fillEllipse(800, 80, 150, 35);
  g.fillEllipse(1100, 120, 100, 30);
}

function drawYurt(g, x, y, scale) {
  const w = 60 * scale;
  const h = 40 * scale;
  g.fillStyle(0xf5f5dc, 0.6);
  g.fillEllipse(x, y, w, h * 0.6);
  g.fillStyle(0xdeb887, 0.6);
  // Door
  g.fillRect(x - 5 * scale, y - 5 * scale, 10 * scale, 12 * scale);
}

// --- Thermopylae Pass (Spartan) ---
function drawThermopylae(g) {
  drawSky(g, 0xcc8844, 0xffcc88);

  // Rocky cliffs — narrow pass
  g.fillStyle(0x6b5b4b, 1);
  g.fillRect(0, 100, 180, GROUND_Y - 100);
  g.fillRect(GAME_WIDTH - 180, 100, 180, GROUND_Y - 100);

  // Cliff face detail
  g.fillStyle(0x7b6b5b, 1);
  g.fillRect(0, 100, 160, GROUND_Y - 100);
  g.fillRect(GAME_WIDTH - 160, 100, 160, GROUND_Y - 100);

  // Rock textures
  g.lineStyle(1, 0x5a4a3a, 0.3);
  for (let i = 0; i < 8; i++) {
    g.beginPath();
    g.moveTo(0, 150 + i * 55);
    g.lineTo(160, 140 + i * 55);
    g.stroke();
    g.beginPath();
    g.moveTo(GAME_WIDTH - 160, 155 + i * 55);
    g.lineTo(GAME_WIDTH, 145 + i * 55);
    g.stroke();
  }

  // Dramatic sun
  g.fillStyle(0xffdd44, 0.6);
  g.fillCircle(GAME_WIDTH / 2, 60, 50);
  g.fillStyle(0xffee88, 0.3);
  g.fillCircle(GAME_WIDTH / 2, 60, 80);

  // Rocky ground
  g.fillStyle(0x8b7b6b, 1);
  g.fillRect(0, GROUND_Y - 3, GAME_WIDTH, 6);
}

// --- Port Tavern Dock (Pirate) ---
function drawDock(g) {
  drawSky(g, 0xff6b35, 0xffd700);

  // Sunset sun
  g.fillStyle(0xff4500, 0.5);
  g.fillCircle(GAME_WIDTH - 200, 150, 70);
  g.fillStyle(0xffaa00, 0.3);
  g.fillCircle(GAME_WIDTH - 200, 150, 100);

  // Sea
  g.fillStyle(0x1a5276, 0.7);
  g.fillRect(0, GROUND_Y - 40, GAME_WIDTH, 60);

  // Ships in harbor
  g.fillStyle(0x3e2723, 0.6);
  g.fillRect(900, GROUND_Y - 120, 60, 80);
  g.fillRect(920, GROUND_Y - 200, 8, 100);
  g.fillRect(1100, GROUND_Y - 100, 50, 60);
  g.fillRect(1115, GROUND_Y - 170, 6, 80);

  // Wooden dock planks
  g.fillStyle(0x8b6914, 1);
  g.fillRect(0, GROUND_Y - 8, GAME_WIDTH, 12);
  g.lineStyle(1, 0x6b4914, 0.5);
  for (let x = 0; x < GAME_WIDTH; x += 80) {
    g.beginPath();
    g.moveTo(x, GROUND_Y - 8);
    g.lineTo(x, GROUND_Y + 4);
    g.stroke();
  }

  // Dock posts
  g.fillStyle(0x5c3a1e, 1);
  g.fillRect(100, GROUND_Y - 30, 12, 50);
  g.fillRect(400, GROUND_Y - 30, 12, 50);
  g.fillRect(700, GROUND_Y - 30, 12, 50);

  // Rope
  g.lineStyle(2, 0xdeb887, 0.6);
  g.beginPath();
  g.moveTo(106, GROUND_Y - 25);
  g.lineTo(406, GROUND_Y - 20);
  g.stroke();
}

// --- Savanna (Zulu) ---
function drawSavanna(g) {
  drawSky(g, 0xff8c00, 0xffd700);

  // Warm sun
  g.fillStyle(0xffcc00, 0.4);
  g.fillCircle(200, 100, 60);

  // Distant hills
  g.fillStyle(0xc8a050, 0.5);
  g.fillEllipse(400, GROUND_Y, 600, 80);
  g.fillEllipse(900, GROUND_Y + 10, 500, 60);

  // Acacia trees
  drawAcacia(g, 150, GROUND_Y);
  drawAcacia(g, 1050, GROUND_Y);

  // Golden grass
  g.fillStyle(0xdaa520, 1);
  g.fillRect(0, GROUND_Y - 5, GAME_WIDTH, 8);

  // Grass tufts
  g.lineStyle(2, 0xb8860b, 0.6);
  for (let i = 0; i < 20; i++) {
    const gx = i * 68 + 20;
    g.beginPath();
    g.moveTo(gx, GROUND_Y);
    g.lineTo(gx - 5, GROUND_Y - 15);
    g.stroke();
    g.beginPath();
    g.moveTo(gx, GROUND_Y);
    g.lineTo(gx + 5, GROUND_Y - 12);
    g.stroke();
  }
}

function drawAcacia(g, x, groundY) {
  // Trunk
  g.fillStyle(0x5c3a1e, 1);
  g.fillRect(x - 5, groundY - 150, 10, 150);

  // Flat canopy (characteristic acacia shape)
  g.fillStyle(0x556b2f, 0.7);
  g.fillEllipse(x, groundY - 160, 120, 30);
  g.fillEllipse(x - 20, groundY - 150, 80, 25);
  g.fillEllipse(x + 25, groundY - 155, 90, 28);
}

// --- Aztec Temple Steps (Conquistador) ---
function drawTemple(g) {
  drawSky(g, 0x228b22, 0x90ee90);

  // Jungle background
  g.fillStyle(0x2d5a1e, 0.5);
  for (let i = 0; i < 12; i++) {
    g.fillEllipse(i * 110 + 30, GROUND_Y - 50, 80, 120);
  }

  // Pyramid
  g.fillStyle(0xa0875a, 1);
  const pyX = GAME_WIDTH / 2;
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const w = 300 - i * 50;
    const h = 40;
    const sy = GROUND_Y - 50 - i * h;
    g.fillRect(pyX - w / 2, sy, w, h);
    g.lineStyle(1, 0x8a7040, 0.5);
    g.strokeRect(pyX - w / 2, sy, w, h);
  }

  // Gold accents on temple
  g.fillStyle(0xffd700, 0.7);
  g.fillRect(pyX - 15, GROUND_Y - 250, 30, 30);

  // Stone ground
  g.fillStyle(0x808060, 1);
  g.fillRect(0, GROUND_Y - 3, GAME_WIDTH, 6);
}

// --- Aircraft Carrier Deck (Navy SEAL) ---
function drawCarrier(g) {
  drawSky(g, 0x1a237e, 0x3949ab);

  // Ocean
  g.fillStyle(0x0d1b2a, 0.5);
  g.fillRect(0, GROUND_Y - 20, GAME_WIDTH, 40);

  // Steel deck
  g.fillStyle(0x616161, 1);
  g.fillRect(0, GROUND_Y - 8, GAME_WIDTH, 12);

  // Deck line markings
  g.lineStyle(2, 0xffff00, 0.4);
  g.beginPath();
  g.moveTo(100, GROUND_Y - 4);
  g.lineTo(GAME_WIDTH - 100, GROUND_Y - 4);
  g.stroke();

  // Runway lines
  g.lineStyle(1, 0xffffff, 0.2);
  for (let i = 0; i < 15; i++) {
    g.beginPath();
    g.moveTo(150 + i * 70, GROUND_Y - 6);
    g.lineTo(150 + i * 70, GROUND_Y);
    g.stroke();
  }

  // Control tower (island)
  g.fillStyle(0x757575, 1);
  g.fillRect(GAME_WIDTH - 160, 150, 80, GROUND_Y - 160);
  g.fillRect(GAME_WIDTH - 170, 150, 100, 30);

  // Radar dish
  g.lineStyle(2, 0x888888, 1);
  g.beginPath();
  g.moveTo(GAME_WIDTH - 120, 150);
  g.lineTo(GAME_WIDTH - 120, 110);
  g.stroke();
  g.fillStyle(0x999999, 1);
  g.fillEllipse(GAME_WIDTH - 120, 105, 30, 10);

  // Jet silhouettes
  drawJetSilhouette(g, 200, GROUND_Y - 12);
  drawJetSilhouette(g, 500, GROUND_Y - 12);

  // Antenna lights
  g.fillStyle(0xff0000, 0.8);
  g.fillCircle(GAME_WIDTH - 120, 100, 3);
}

function drawJetSilhouette(g, x, y) {
  g.fillStyle(0x4a4a4a, 0.6);
  // Fuselage
  g.fillRect(x - 25, y - 5, 50, 8);
  // Wings
  g.fillRect(x - 5, y - 18, 10, 30);
  // Tail
  g.fillRect(x - 25, y - 12, 8, 12);
}

function drawTriangle(g, x, groundY, width, height) {
  g.beginPath();
  g.moveTo(x - width / 2, groundY);
  g.lineTo(x, groundY - height);
  g.lineTo(x + width / 2, groundY);
  g.closePath();
  g.fill();
}

const ARENA_DRAW_FUNCTIONS = {
  castle: drawCastle,
  dojo: drawDojo,
  longship: drawLongship,
  colosseum: drawColosseum,
  steppe: drawSteppe,
  thermopylae: drawThermopylae,
  dock: drawDock,
  savanna: drawSavanna,
  temple: drawTemple,
  carrier: drawCarrier,
};
