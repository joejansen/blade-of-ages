#!/usr/bin/env node

// Blade of Ages — Arena Art Generation Script
// Generates background stages using Gemini API
// Usage: node scripts/generate-arenas.js [arena_id]

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "..", "assets", "arenas");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

const STYLE_PREFIX =
  "A highly detailed 2D video game fighting stage background, matching the style of colorful 2D fighting game warriors. Use thick black outlines, vibrant rich colors, strong dynamic highlights and shadows, and extreme architectural or landscape detail. Empty center for fighting context, but epic scenery on the sides and background. Absolutely NO characters in the background.";

const ARENA_PROMPTS = {
  castle: "Medieval Castle Courtyard. Stone brick walls, large wooden gates, red banners with gold crests, burning wall torches, and distant towers under a dramatic sky.",
  dojo: "Cherry Blossom Dojo. Traditional Japanese wooden dojo interior with open sliding paper doors looking out onto a vibrant garden with falling pink cherry blossom petals.",
  longship: "Longship Deck. The wide wooden deck of a Norse Viking longship. Shields lined along the railings, a large striped sail above, and rough stormy seas splashing the sides.",
  colosseum: "Roman Colosseum. Sandy arena floor surrounded by high stone stadium walls, giant statues, bronze braziers, and a bright harsh sun overhead. Grand and ancient.",
  steppe: "Steppe Grasslands. Rolling grassy hills of Mongolia, a few traditional circular yurt tents in the distance, dramatic sweeping clouds, an eagle soaring.",
  thermopylae: "Thermopylae Pass. A narrow rocky mountain pass with jagged red and gray rocks, ancient Greek bronze weapons scattered in the dust, and the dark sea visible in the background.",
  dock: "Port Tavern Dock. A Caribbean pirate port at sunset. Wooden docks over dark green water, barrels, ropes, a wooden galleon docked on the side, and warm lantern lighting.",
  savanna: "Savanna. Golden tall grass plains of Africa, flat-topped acacia trees bordering the arena, vibrant orange and purple sunset sky, and distant rolling hills.",
  temple: "Aztec Temple Steps. High up on stone pyramid steps deep in a lush green jungle. Stone carvings of serpents, vines overgrowing the architecture, and bright tropical foliage.",
  carrier: "Aircraft Carrier. The metal flight deck of a modern Navy SEAL aircraft carrier. Gray steel floor, yellow runway lines, an F-18 fighter jet parked in the background, and vast blue ocean.",
};

async function generateImage(prompt, aspectRatio = "16:9") {
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts) {
    throw new Error("No candidates in response");
  }

  const imagePart = data.candidates[0].content.parts.find((p) => p.inlineData);
  if (!imagePart) {
    throw new Error("No image data in response");
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

async function generateArena(arenaId) {
  const promptBody = ARENA_PROMPTS[arenaId];
  if (!promptBody) {
    console.error(`Unknown arena: ${arenaId}`);
    return { success: 0, failed: 0 };
  }

  // Ensure assets/arenas dir exists
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const outFile = path.join(ASSETS_DIR, `${arenaId}.jpg`);

  // Skip if already exists (use --force to regenerate)
  if (fs.existsSync(outFile) && !process.argv.includes("--force")) {
    console.log(`  [skip] arena: ${arenaId}.jpg (exists, use --force to regenerate)`);
    return { success: 1, failed: 0 };
  }

  const fullPrompt = `${STYLE_PREFIX} ${promptBody}`;

  console.log(`  [gen]  arena: ${arenaId}.jpg ...`);

  try {
    const rawBuffer = await generateImage(fullPrompt, "16:9");
    
    // We resize and convert to standard JPEG
    const jpegBuffer = await sharp(rawBuffer)
      .resize(1280, 720, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    fs.writeFileSync(outFile, jpegBuffer);
    console.log(`  [ok]   arena: ${arenaId}.jpg (${jpegBuffer.length} bytes)`);
    return { success: 1, failed: 0 };
  } catch (err) {
    console.error(`  [FAIL] arena: ${arenaId}.jpg — ${err.message}`);
    return { success: 0, failed: 1 };
  }
}

async function main() {
  const targetArena = process.argv[2];
  const forceMode = process.argv.includes("--force");
  
  const arenas = targetArena && !targetArena.startsWith("--")
    ? [targetArena]
    : Object.keys(ARENA_PROMPTS);

  console.log(`\nBlade of Ages — Arena Art Generator`);
  console.log(`Model: ${API_URL.split("/models/")[1].split(":")[0]}`);
  console.log(`Total Arenas to Process: ${arenas.length}\n`);

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const arena of arenas) {
    console.log(`--- ${arena.toUpperCase()} ---`);
    const { success, failed } = await generateArena(arena);
    totalSuccess += success;
    totalFailed += failed;
    
    // Rate limiting
    if (success > 0 && arenas.length > 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n========================================`);
  console.log(`Done! ${totalSuccess} succeeded, ${totalFailed} failed.`);
  console.log(`Assets: ${ASSETS_DIR}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
