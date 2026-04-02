import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOUNDS_DIR = path.join(__dirname, '..', 'public', 'assets', 'sounds');

const BASE_URL = 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/';

const AUDIO_FILES = {
  'light_attack.mp3': 'sword.mp3',
  'heavy_attack.wav': 'boss_hit.wav',
  'jump.mp3': 'steps2.mp3',
  'hit.wav': 'shot1.wav',
  'block.wav': 'pusher.wav',
  'special.mp3': 'explosion.mp3',
  'ui_click.mp3': 'menu_select.mp3',
  'ui_hover.mp3': 'p-ping.mp3',
  'victory.wav': 'pickup.wav'
};

if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

async function downloadFile(filename, sourceName) {
  const url = BASE_URL + sourceName;
  const destPath = path.join(SOUNDS_DIR, filename);

  return new Promise((resolve, reject) => {
    console.log(`Downloading ${filename} from ${url}...`);
    https.get(url, (response) => {
      
      // Handle redirects if required
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, (res2) => {
          const file = fs.createWriteStream(destPath);
          res2.pipe(file);
          file.on('finish', () => { file.close(resolve); });
        }).on('error', reject);
        return;
      }

      if (response.statusCode !== 200) {
        // Fallback for sword_hit.wav just in case
        if (sourceName === 'sword_hit.wav') {
          return downloadFile(filename, 'shot1.wav').then(resolve);
        }
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading CC0 Combat & UI sounds...');
  try {
    for (const [filename, sourceName] of Object.entries(AUDIO_FILES)) {
      await downloadFile(filename, sourceName);
    }
    console.log('Successfully acquired all raw audio assets!');
  } catch (error) {
    console.error('Error downloading files:', error);
  }
}

main();
