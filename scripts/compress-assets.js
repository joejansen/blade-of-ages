import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_ASSETS = path.join(__dirname, '..', 'public', 'assets');

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.endsWith('.png')) {
      // Compress PNG losslessly
      console.log(`Optimizing PNG: ${file}`);
      const buffer = fs.readFileSync(fullPath);
      const optimized = await sharp(buffer)
        .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
        .toBuffer();
      fs.writeFileSync(fullPath, optimized);
    } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      // Compress and cap dimensions for JPEG
      console.log(`Optimizing JPEG: ${file}`);
      const buffer = fs.readFileSync(fullPath);
      const optimized = await sharp(buffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 80, force: true })
        .toBuffer();
      fs.writeFileSync(fullPath, optimized);
    }
  }
}

async function main() {
  console.log('Starting native asset compression...');
  await processDirectory(PUBLIC_ASSETS);
  console.log('Compression complete! Payload optimized.');
}

main().catch(console.error);
