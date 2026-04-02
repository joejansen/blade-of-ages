export class SoundManager {
  static play(scene, key, config = {}) {
    if (!scene || !scene.sound || !scene.cache.audio.exists(key)) return;
    
    // Slight randomization for natural combat sounds
    const detune = config.randomizePitch ? Math.floor(Math.random() * 400 - 200) : 0;
    
    scene.sound.play(key, {
      volume: config.volume || 1.0,
      detune: detune
    });
  }

  static playUIHover(scene) {
    this.play(scene, 'ui_hover', { volume: 0.4 });
  }

  static playUIClick(scene) {
    this.play(scene, 'ui_click', { volume: 0.7 });
  }

  static playCombat(scene, type) {
    const vols = {
      'light_attack': 0.6,
      'heavy_attack': 0.9,
      'hit': 0.8,
      'block': 0.7,
      'jump': 0.2,
      'special': 1.0,
      'victory': 1.0
    };
    
    this.play(scene, type, { 
      volume: vols[type] || 0.6, 
      randomizePitch: type !== 'victory' 
    });
  }
}
