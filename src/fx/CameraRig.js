import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, FIGHTER_SCALE } from '../config/constants.js';

// The painted plates are 1280 wide, so the push-in stays modest: the
// fighters' own size carries the frame, not magnification.
const MIN_ZOOM = 1;
const MAX_ZOOM = 1.16;
const MARGIN_X = 130 * FIGHTER_SCALE;
const HEAD_ROOM = 150 * FIGHTER_SCALE;
const FLOOR_ROOM = 90;

// Frames both fighters: pushes in when they close distance, pulls out when
// they separate or leave the ground. Impacts add a short zoom "punch";
// cinematic beats (special, KO) can briefly take over the framing.
export class CameraRig {
  constructor(scene) {
    this.scene = scene;
    this.cam = scene.cameras.main;
    this.cam.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.zoom = MIN_ZOOM;
    this.cx = GAME_WIDTH / 2;
    this.cy = GAME_HEIGHT / 2;
    this.punchAmount = 0;
    this.override = null;
  }

  // Zoom impulse; decays exponentially.
  punch(amount) {
    this.punchAmount = Math.min(0.1, this.punchAmount + amount);
  }

  // Hold the frame on a point for `duration` ms.
  focus(x, y, zoom, duration) {
    this.override = { x, y, zoom, remaining: duration };
  }

  // Hold the frame on a fighter, following them, for `duration` ms.
  follow(fighter, offsetY, zoom, duration) {
    this.override = { fighter, offsetY, zoom, remaining: duration };
  }

  release() {
    this.override = null;
  }

  update(delta, f1, f2) {
    const dt = Math.min(delta, 50) / 1000;
    let targetZoom;
    let tx;
    let ty;

    if (this.override) {
      this.override.remaining -= delta;
      if (this.override.remaining <= 0) this.override = null;
    }

    if (this.override?.fighter) {
      tx = this.override.fighter.x;
      ty = GROUND_Y + this.override.offsetY;
      targetZoom = this.override.zoom;
    } else if (this.override) {
      ({ x: tx, y: ty, zoom: targetZoom } = this.override);
    } else {
      const minX = Math.min(f1.x, f2.x) - MARGIN_X;
      const maxX = Math.max(f1.x, f2.x) + MARGIN_X;
      const minY = Math.min(f1.y, f2.y) - HEAD_ROOM;
      const maxY = GROUND_Y + FLOOR_ROOM;
      targetZoom = Phaser.Math.Clamp(
        Math.min(GAME_WIDTH / (maxX - minX), GAME_HEIGHT / (maxY - minY)),
        MIN_ZOOM,
        MAX_ZOOM,
      );
      tx = (minX + maxX) / 2;
      ty = (minY + maxY) / 2;
    }

    // Critically-damped-ish follow: framing eases, never snaps.
    const zoomRate = this.override ? 6 : 2.2;
    const panRate = this.override ? 7 : 4;
    this.zoom += (targetZoom - this.zoom) * Math.min(1, dt * zoomRate);
    this.cx += (tx - this.cx) * Math.min(1, dt * panRate);
    this.cy += (ty - this.cy) * Math.min(1, dt * panRate);
    this.punchAmount *= Math.exp(-dt * 9);

    this.cam.setZoom(this.zoom + this.punchAmount);
    this.cam.centerOn(this.cx, this.cy);
  }

  reset() {
    this.override = null;
    this.punchAmount = 0;
  }
}
