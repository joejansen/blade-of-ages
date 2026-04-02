import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCENES_DIR = path.join(__dirname, '..', 'src', 'scenes');

const files = fs.readdirSync(SCENES_DIR).filter(f => f.endsWith('Scene.js'));

files.forEach(file => {
  if (file === 'BootScene.js' || file === 'FightScene.js' || file === 'InstructionsScene.js') return;
  
  let content = fs.readFileSync(path.join(SCENES_DIR, file), 'utf-8');
  
  // Skip if already has SoundManager
  if (!content.includes('SoundManager')) {
    content = content.replace(
      "import { GAME_WIDTH", 
      "import { SoundManager } from '../audio/SoundManager.js';\nimport { GAME_WIDTH"
    );
  }

  // Multi-line Pointer Overs
  content = content.replace(/\.on\('pointerover', \(\) => {\n(\s+)btn\.setFillStyle/g, ".on('pointerover', () => {\n$1SoundManager.playUIHover(this);\n$1btn.setFillStyle");
  content = content.replace(/\.on\('pointerover', \(\) => {\n(\s+)instBtn\.setFillStyle/g, ".on('pointerover', () => {\n$1SoundManager.playUIHover(this);\n$1instBtn.setFillStyle");
  content = content.replace(/\.on\('pointerover', \(\) => {\n(\s+)cardBg\.setStrokeStyle/g, ".on('pointerover', () => {\n$1SoundManager.playUIHover(this);\n$1cardBg.setStrokeStyle");
  content = content.replace(/\.on\('pointerover', \(\) => {\n(\s+)randBg\.setStrokeStyle/g, ".on('pointerover', () => {\n$1SoundManager.playUIHover(this);\n$1randBg.setStrokeStyle");

  // Multi-line Pointer Downs
  content = content.replace(/\.on\('pointerdown', \(\) => {\n(\s+)this\.scene\.start/g, ".on('pointerdown', () => {\n$1SoundManager.playUIClick(this);\n$1this.scene.start");
  content = content.replace(/\.on\('pointerdown', \(\) => {\n(\s+)this\.selectWarrior/g, ".on('pointerdown', () => {\n$1SoundManager.playUIClick(this);\n$1this.selectWarrior");
  content = content.replace(/\.on\('pointerdown', \(\) => {\n(\s+)this\.selectArena/g, ".on('pointerdown', () => {\n$1SoundManager.playUIClick(this);\n$1this.selectArena");

  // ResultScene One Liners
  content = content.replace(/menuText\.on\('pointerover', \(\) => menuText\.setColor\('#ffffff'\)\);/g, "menuText.on('pointerover', () => {\n      SoundManager.playUIHover(this);\n      menuText.setColor('#ffffff');\n    });");
  content = content.replace(/menuText\.on\('pointerdown', \(\) => this\.scene\.start\('Title'\)\);/g, "menuText.on('pointerdown', () => {\n      SoundManager.playUIClick(this);\n      this.scene.start('Title');\n    });");
  
  // onClick handler in ResultScene
  content = content.replace(/btn\.on\('pointerdown', onClick\);/g, "btn.on('pointerdown', () => {\n      SoundManager.playUIClick(this);\n      onClick();\n    });");

  fs.writeFileSync(path.join(SCENES_DIR, file), content);
});
console.log('UI Sounds injected successfully!');
