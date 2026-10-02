import Phaser from 'phaser';
import { AssetWarriorRenderer, FOOT_DROP } from '../fighters/AssetWarriorRenderer.js';
import { sampleAnimationPose, blendPose } from '../fighters/animationClips.js';
import { getFighterProfile } from '../config/fighterProfiles.js';

// A posed, animated fighter for menus. Drives the fight renderer with the
// same clips, at a larger display scale, cycling idle with occasional
// flourishes so the roster feels alive.
export class Showcase {
  constructor(scene, warriorConfig, x, groundY, opts = {}) {
    this.scene = scene;
    this.x = x;
    this.facingRight = opts.facingRight ?? true;
    this.flourish = opts.flourish ?? true;
    this.profile = getFighterProfile(warriorConfig.id);
    const scale = opts.scale ?? 3.2;
    // groundY is where the soles should visibly land; lift the rig's
    // baseline by the leg overhang so they do.
    this.groundY = groundY - FOOT_DROP * this.profile.renderScale * scale;
    this.renderer = new AssetWarriorRenderer(scene, warriorConfig, {
      displayScale: scale,
      depth: opts.depth ?? 12,
      groundY: this.groundY,
    });
    if (!this.renderer.isAvailable()) {
      this.renderer.destroy();
      this.renderer = null;
      return;
    }
    this.state = opts.state || 'idle';
    this.elapsed = Math.random() * 1000;
    this.nextFlourish = 1800 + Math.random() * 2200;
    this.specialRatio = opts.specialRatio ?? 0;
    this.pose = this.#sample();
    this.alpha = 1;

    this.onUpdate = (_time, delta) => this.update(delta);
    scene.events.on('update', this.onUpdate);
    scene.events.once('shutdown', () => this.destroy());
  }

  #sample() {
    return sampleAnimationPose(this.state, this.elapsed, this.profile, {
      verticalVelocity: 0,
      horizontalVelocity: 0,
      grounded: true,
      facingRight: this.facingRight,
    });
  }

  play(state, holdMs) {
    this.state = state;
    this.elapsed = 0;
    this.holdUntil = holdMs;
  }

  update(delta) {
    if (!this.renderer || this.hidden) return;
    this.elapsed += delta;

    if (this.state !== 'idle' && this.holdUntil && this.elapsed > this.holdUntil) {
      this.state = 'idle';
      this.elapsed = 0;
      this.holdUntil = 0;
    }

    if (this.flourish && this.state === 'idle' && this.elapsed > this.nextFlourish) {
      const move = Phaser.Utils.Array.GetRandom(['lightAttack', 'heavyAttack', 'lightAttack']);
      this.play(move, move === 'heavyAttack' ? 500 : 300);
      this.nextFlourish = 2600 + Math.random() * 3000;
    }

    const target = this.#sample();
    const blend = this.state === 'idle' ? 120 : 65;
    this.pose = blendPose(this.pose, target, Phaser.Math.Clamp(delta / blend, 0, 1));
    this.renderer.render(this.x, this.groundY, this.facingRight, this.pose, this.state, this.specialRatio);
  }

  // render() re-shows every part each frame, so hiding must also stop it.
  setVisible(v) {
    this.hidden = !v;
    this.renderer?.setVisible(v);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.scene.events.off('update', this.onUpdate);
    this.renderer?.destroy();
    this.renderer = null;
  }
}
