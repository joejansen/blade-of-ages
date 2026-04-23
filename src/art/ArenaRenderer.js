import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../config/constants.js';
import { drawArena } from './arenas.js';

export class ArenaRenderer {
  constructor(scene, arenaId) {
    this.scene = scene;
    this.arenaId = arenaId;
    this.displayObjects = [];

    const textureKey = `arena_${arenaId}`;
    if (scene.textures.exists(textureKey) && scene.textures.get(textureKey).key !== '__MISSING') {
      const background = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, textureKey);
      background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      background.setDepth(0);
      this.displayObjects.push(background);
    } else {
      this.displayObjects.push(drawArena(scene, arenaId));
    }

    this.midGraphics = scene.add.graphics().setDepth(1);
    this.fxGraphics = scene.add.graphics().setDepth(4);
    this.floorGraphics = scene.add.graphics().setDepth(6);
    this.displayObjects.push(this.midGraphics, this.fxGraphics, this.floorGraphics);

    this.drawStaticFloor();
  }

  update(time) {
    const t = time / 1000;

    this.midGraphics.clear();
    this.fxGraphics.clear();
    this.floorGraphics.clear();
    this.drawStaticFloor();

    switch (this.arenaId) {
      case 'castle':
        this.drawCastleAmbient(t);
        break;
      case 'dojo':
        this.drawDojoAmbient(t);
        break;
      case 'longship':
        this.drawLongshipAmbient(t);
        break;
      case 'colosseum':
        this.drawColosseumAmbient(t);
        break;
      case 'steppe':
        this.drawSteppeAmbient(t);
        break;
      case 'thermopylae':
        this.drawThermopylaeAmbient(t);
        break;
      case 'dock':
        this.drawDockAmbient(t);
        break;
      case 'savanna':
        this.drawSavannaAmbient(t);
        break;
      case 'temple':
        this.drawTempleAmbient(t);
        break;
      case 'carrier':
        this.drawCarrierAmbient(t);
        break;
      default:
        this.drawGenericAmbient(t);
    }
  }

  drawStaticFloor() {
    this.floorGraphics.fillStyle(0x000000, 0.22);
    this.floorGraphics.fillRect(0, GROUND_Y + 2, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    this.floorGraphics.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.18, 0.18, 0, 0);
    this.floorGraphics.fillRect(0, GROUND_Y - 120, GAME_WIDTH, 140);

    this.floorGraphics.lineStyle(2, 0xffffff, 0.08);
    this.floorGraphics.beginPath();
    this.floorGraphics.moveTo(0, GROUND_Y);
    this.floorGraphics.lineTo(GAME_WIDTH, GROUND_Y);
    this.floorGraphics.strokePath();
  }

  drawCastleAmbient(t) {
    this.drawBanner(150, 150, 0xcc2222, t, 0);
    this.drawBanner(GAME_WIDTH - 150, 150, 0xcc2222, t, 1.8);
    this.drawTorch(210, 215, t, 0xffb347);
    this.drawTorch(GAME_WIDTH - 210, 215, t, 0xffb347);
  }

  drawDojoAmbient(t) {
    for (let i = 0; i < 18; i++) {
      const x = (GAME_WIDTH * 0.08 + i * 73 + t * 26) % (GAME_WIDTH + 80) - 40;
      const y = 120 + ((i * 37 + t * 38) % 250);
      const radius = 2 + (i % 3);
      this.fxGraphics.fillStyle(i % 2 === 0 ? 0xffd4e2 : 0xffa6c8, 0.72);
      this.fxGraphics.fillEllipse(x, y, radius * 2.4, radius * 1.6);
    }
  }

  drawLongshipAmbient(t) {
    for (let i = 0; i < 6; i++) {
      const y = GROUND_Y - 18 + Math.sin(t * 1.8 + i) * 6;
      this.midGraphics.lineStyle(2, 0x8cc7d8, 0.22);
      this.midGraphics.beginPath();
      this.midGraphics.moveTo(i * 220 - 20, y);
      this.drawQuadraticPath(this.midGraphics, i * 220 - 20, y, i * 220 + 70, y - 10, i * 220 + 160, y);
      this.midGraphics.strokePath();
    }

    const sailSway = Math.sin(t * 1.4) * 10;
    this.midGraphics.fillStyle(0xffffff, 0.08);
    this.midGraphics.fillRect(GAME_WIDTH / 2 - 90 + sailSway, 88, 180, 195);
  }

  drawColosseumAmbient(t) {
    for (let i = 0; i < 24; i++) {
      const x = 18 + i * 54;
      const height = 8 + Math.sin(t * 2.6 + i * 0.5) * 4;
      this.midGraphics.fillStyle(0x5e4432, 0.2);
      this.midGraphics.fillRect(x, 135 - height, 16, height);
    }

    for (let i = 0; i < 14; i++) {
      const x = 100 + i * 80 + ((t * 12 + i * 14) % 26);
      const y = GROUND_Y - 14 - (i % 3) * 4;
      this.fxGraphics.fillStyle(0xe9c98e, 0.12);
      this.fxGraphics.fillCircle(x, y, 8 + (i % 2) * 2);
    }
  }

  drawSteppeAmbient(t) {
    for (let i = 0; i < 22; i++) {
      const x = 40 + i * 60;
      const sway = Math.sin(t * 2 + i * 0.4) * 6;
      this.midGraphics.lineStyle(2, 0x9ebd58, 0.25);
      this.midGraphics.beginPath();
      this.midGraphics.moveTo(x, GROUND_Y + 2);
      this.midGraphics.lineTo(x + sway, GROUND_Y - 26 - (i % 4) * 4);
      this.midGraphics.strokePath();
    }
  }

  drawThermopylaeAmbient(t) {
    this.drawHeatBands(t, 0xffa95d, 0.08);
    for (let i = 0; i < 8; i++) {
      const x = 120 + i * 130;
      const y = GROUND_Y - 40 + Math.sin(t * 1.4 + i) * 8;
      this.midGraphics.fillStyle(0x88b7d9, 0.08);
      this.midGraphics.fillRect(x, y, 40, 3);
    }
  }

  drawDockAmbient(t) {
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 220;
      const glowY = 190 + Math.sin(t * 1.5 + i) * 6;
      this.fxGraphics.fillStyle(0xffbe6a, 0.16);
      this.fxGraphics.fillCircle(x, glowY, 26);
      this.fxGraphics.fillStyle(0xffdd99, 0.7);
      this.fxGraphics.fillCircle(x, glowY, 5);
    }

    for (let i = 0; i < 5; i++) {
      const y = GROUND_Y - 14 + Math.sin(t * 2.3 + i * 0.8) * 4;
      this.midGraphics.lineStyle(2, 0x8bb9c7, 0.18);
      this.midGraphics.beginPath();
      this.midGraphics.moveTo(i * 260, y);
      this.drawQuadraticPath(this.midGraphics, i * 260, y, i * 260 + 90, y - 8, i * 260 + 180, y);
      this.midGraphics.strokePath();
    }
  }

  drawSavannaAmbient(t) {
    this.drawHeatBands(t, 0xffc36e, 0.08);
    for (let i = 0; i < 12; i++) {
      const x = ((i * 122) + t * 18) % (GAME_WIDTH + 60) - 30;
      const y = GROUND_Y - 28 - (i % 4) * 14;
      this.fxGraphics.fillStyle(0xd3a865, 0.12);
      this.fxGraphics.fillCircle(x, y, 12 + (i % 3) * 2);
    }
  }

  drawTempleAmbient(t) {
    for (let i = 0; i < 16; i++) {
      const x = (i * 87 + t * 22) % (GAME_WIDTH + 100) - 50;
      const y = 120 + ((i * 41 + t * 30) % 260);
      this.fxGraphics.fillStyle(i % 2 === 0 ? 0x6cbf52 : 0x91d86f, 0.4);
      this.fxGraphics.beginPath();
      this.fxGraphics.moveTo(x, y);
      this.fxGraphics.lineTo(x + 10, y + 4);
      this.fxGraphics.lineTo(x + 3, y + 12);
      this.fxGraphics.closePath();
      this.fxGraphics.fillPath();
    }
  }

  drawCarrierAmbient(t) {
    for (let i = 0; i < 10; i++) {
      const x = 90 + i * 110;
      const alpha = 0.12 + (Math.sin(t * 5 + i) + 1) * 0.08;
      this.midGraphics.fillStyle(0xffd86b, alpha);
      this.midGraphics.fillRect(x, GROUND_Y - 8, 26, 4);
    }
    this.drawHeatBands(t, 0x9ab0c2, 0.06);
  }

  drawGenericAmbient(t) {
    for (let i = 0; i < 10; i++) {
      const x = 100 + i * 120;
      const y = GROUND_Y - 20 + Math.sin(t * 2 + i) * 6;
      this.midGraphics.fillStyle(0xffffff, 0.06);
      this.midGraphics.fillRect(x, y, 24, 3);
    }
  }

  drawBanner(x, y, color, t, phase) {
    const sway = Math.sin(t * 1.9 + phase) * 12;
    this.midGraphics.fillStyle(color, 0.3);
    this.midGraphics.beginPath();
    this.midGraphics.moveTo(x, y);
    this.midGraphics.lineTo(x + 34 + sway, y + 6);
    this.midGraphics.lineTo(x + 20 + sway, y + 70);
    this.midGraphics.lineTo(x, y + 56);
    this.midGraphics.closePath();
    this.midGraphics.fillPath();
  }

  drawTorch(x, y, t, color) {
    const flameY = y + Math.sin(t * 8 + x * 0.01) * 4;
    this.fxGraphics.fillStyle(color, 0.13);
    this.fxGraphics.fillCircle(x, flameY, 26);
    this.fxGraphics.fillStyle(color, 0.75);
    this.fxGraphics.fillCircle(x, flameY, 6);
    this.fxGraphics.fillStyle(0xffefbe, 0.45);
    this.fxGraphics.fillCircle(x, flameY - 4, 3);
  }

  drawHeatBands(t, color, alpha) {
    for (let i = 0; i < 7; i++) {
      const y = 170 + i * 54;
      const drift = Math.sin(t * 1.8 + i * 0.8) * 18;
      this.fxGraphics.lineStyle(10, color, alpha);
      this.fxGraphics.beginPath();
      this.fxGraphics.moveTo(0, y + drift);
      this.drawQuadraticPath(this.fxGraphics, 0, y + drift, GAME_WIDTH * 0.35, y - drift, GAME_WIDTH * 0.7, y + drift * 0.8);
      this.drawQuadraticPath(this.fxGraphics, GAME_WIDTH * 0.7, y + drift * 0.8, GAME_WIDTH * 0.85, y + drift * 1.2, GAME_WIDTH, y - drift * 0.2);
      this.fxGraphics.strokePath();
    }
  }

  drawQuadraticPath(graphics, startX, startY, controlX, controlY, endX, endY, segments = 16) {
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const invT = 1 - t;
      const x = invT * invT * startX + 2 * invT * t * controlX + t * t * endX;
      const y = invT * invT * startY + 2 * invT * t * controlY + t * t * endY;
      graphics.lineTo(x, y);
    }
  }

  destroy() {
    for (const object of this.displayObjects) {
      object?.destroy?.();
    }
  }
}
