#!/usr/bin/env node

// Blade of Ages — AI Art Generation Script
// Generates body part sprites for all warriors using Gemini API
// Usage: node scripts/generate-art.js [warrior_id]

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "..", "public", "assets", "warriors");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

const BODY_PARTS = [
  "head",
  "torso",
  "upper_arm",
  "lower_arm",
  "upper_leg",
  "lower_leg",
  "weapon",
];

const STYLE_PREFIX =
  "A single isolated doll cutout piece on a solid bright green (#00FF00) background. This is ONE disconnected body part for a 2D puppet character, NOT a full character. The piece floats alone in the center of the image with nothing else around it. Hand drawn art style, strong black outlines, flat vibrant colors. Side view facing right. IMPORTANT: Orient the piece VERTICALLY — the connection joint (where it attaches to the body) should be at the TOP of the image, and the piece extends DOWNWARD.";

const WARRIOR_PROMPTS = {
  knight: {
    style:
      "Medieval European knight style. Steel silver and royal blue with gold trim.",
    head: "Just a steel great helm helmet. Boxy shape with horizontal visor slit, small gold crest on top. One single helmet, nothing else.",
    torso:
      "Just an armored chest piece. Steel breastplate with a blue tabard showing a gold cross. Includes shoulder area and waist. One piece, no limbs attached.",
    upper_arm:
      "Just one steel armored upper arm segment. A short tube of plate armor from shoulder to elbow. One piece alone.",
    lower_arm:
      "Just one steel armored forearm with an iron gauntlet at the end. From elbow to fingertips. One piece alone.",
    upper_leg:
      "Just one steel armored thigh piece. Plate armor from hip to knee. One piece alone.",
    lower_leg:
      "Just one steel armored shin guard with an iron boot at the bottom. From knee to foot. One piece alone.",
    weapon:
      "Just a medieval longsword. Long straight silver blade, gold crossguard, leather grip, gold pommel. The sword alone, nothing else.",
  },
  samurai: {
    style:
      "Feudal Japanese samurai style. Dark crimson red and charcoal black with red accents.",
    head: "Just a kabuto samurai helmet. Dark lacquered dome, layered neck guard, crescent moon crest on front, face mask. One helmet alone.",
    torso:
      "Just a samurai chest armor (do). Dark lacquered plates with horizontal lacing, small skirt plates at bottom, red sash belt. One piece, no limbs.",
    upper_arm:
      "Just one dark red fabric sleeve piece from shoulder to elbow with a small shoulder plate. One piece alone.",
    lower_arm:
      "Just one dark red sleeve piece from elbow to hand with wrist guard. One piece alone.",
    upper_leg:
      "Just one dark charcoal hakama trouser leg from hip to knee. Wide flowing fabric. One piece alone.",
    lower_leg:
      "Just one dark hakama leg from knee to foot with a straw sandal. One piece alone.",
    weapon:
      "Just a katana sword. Gently curved silver blade, round red guard, black wrapped handle. The sword alone, nothing else.",
  },
  viking: {
    style: "Norse Viking style. Brown leather and iron with ice blue accents.",
    head: "Just a round iron Viking helmet with a nose guard and two curved horns on the sides. One helmet alone.",
    torso:
      "Just a chainmail shirt torso piece with a brown leather belt and bronze buckle. Broad, stocky shape. One piece, no limbs.",
    upper_arm:
      "Just one bare muscular upper arm with light skin and an iron arm ring. One piece alone.",
    lower_arm:
      "Just one bare muscular forearm with a large hand and leather wrist wrap. One piece alone.",
    upper_leg:
      "Just one brown leather trouser leg from hip to knee. One piece alone.",
    lower_leg:
      "Just one brown leather pant leg from knee to a fur-trimmed leather boot. One piece alone.",
    weapon:
      "Just a Viking war axe. Long wooden handle, large crescent iron axe head. The axe alone, nothing else.",
  },
  gladiator: {
    style:
      "Roman gladiator style. Bronze gold and leather brown with red accents.",
    head: "Just a bronze gladiator helmet with a wide brim, eye holes visor, and tall red horsehair crest on top. One helmet alone.",
    torso:
      "Just a bare muscular tanned male torso with one bronze shoulder guard and a leather belt with bronze studs at the waist. One piece, no limbs.",
    upper_arm:
      "Just one bare muscular tanned upper arm wrapped with leather manica strips. One piece alone.",
    lower_arm:
      "Just one tanned forearm wrapped in leather manica guard strips ending in a bare hand. One piece alone.",
    upper_leg:
      "Just one bare muscular tanned thigh from hip to knee. One piece alone.",
    lower_leg:
      "Just one bare shin with a bronze front greave and a laced leather sandal at the foot. One piece alone.",
    weapon:
      "Just a Roman gladius short sword. Wide leaf-shaped blade, wooden grip, bronze pommel. The sword alone, nothing else.",
  },
  mongol: {
    style:
      "Mongol warrior style. Olive green robes with tan fur and orange accents.",
    head: "Just a pointed Mongol fur cap hat with fur-lined ear flaps and an orange band. One hat alone.",
    torso:
      "Just an olive green deel robe torso that wraps diagonally, fur collar trim, orange sash belt. One piece, no limbs.",
    upper_arm:
      "Just one olive green loose robe sleeve from shoulder to elbow. One piece alone.",
    lower_arm:
      "Just one olive green sleeve from elbow to a tanned bare hand. One piece alone.",
    upper_leg:
      "Just one tan loose riding trouser leg from hip to knee. One piece alone.",
    lower_leg:
      "Just one tan pant leg from knee tucked into a tall brown leather riding boot. One piece alone.",
    weapon:
      "Just a curved Mongol sword. Curved single-edged silver blade, orange wrapped handle. The sword alone, nothing else.",
  },
  spartan: {
    style:
      "Ancient Greek Spartan hoplite style. Bronze armor with dark crimson red accents.",
    head: "Just a bronze Corinthian helmet with T-shaped eye/nose opening and a very tall crimson red horsehair crest running front to back. One helmet alone.",
    torso:
      "Just a bronze muscle cuirass breastplate showing sculpted muscles, with a red lambda symbol on the chest and leather strip skirt at the bottom. One piece, no limbs.",
    upper_arm:
      "Just one bare muscular tanned upper arm with a bronze arm band. One piece alone.",
    lower_arm:
      "Just one bare muscular tanned forearm ending in a strong hand with a leather wrist guard. One piece alone.",
    upper_leg:
      "Just one bare muscular tanned thigh from hip to knee. One piece alone.",
    lower_leg:
      "Just one bare tanned shin with a bronze greave and a laced leather sandal. One piece alone.",
    weapon:
      "Just a Spartan xiphos short sword. Leaf-shaped bronze blade, bronze crossguard, leather grip. The sword alone, nothing else.",
  },
  pirate: {
    style: "Caribbean pirate style. Dark brown and dark red with gold accents.",
    head: "A dark brown tricorn pirate hat with gold trim and a red bandana underneath. The pirate's head has a beard and shes wearing an eyepatch.  One head alone.",
    torso:
      "Just a pirate torso — open dark red coat over a white puffy shirt, gold buttons, gold sash at waist. One piece, no limbs.",
    upper_arm:
      "Just one white puffy billowing shirt sleeve from shoulder to elbow. One piece alone.",
    lower_arm:
      "Just one white shirt sleeve from elbow rolled up to a bare weathered hand. One piece alone.",
    upper_leg:
      "Just one dark worn trouser leg from hip to knee. One piece alone.",
    lower_leg:
      "Just one dark pant leg from knee tucked into a tall brown leather bucket-top boot. One piece alone.",
    weapon:
      "Just a pirate cutlass. Curved steel blade with an ornate brass basket guard. The sword alone, nothing else.",
  },
  zulu: {
    style:
      "Zulu warrior style. Dark brown skin, white cowhide, orange-red accents.",
    head: "Just a Zulu warrior headband — an orange-red beaded band with 4 tall upright feathers (black, white, orange) rising from it. One headpiece alone.",
    torso:
      "Just a very dark brown bare muscular male torso with a leopard-skin loincloth belt at the waist and a beaded necklace. One piece, no limbs.",
    upper_arm:
      "Just one very dark brown bare muscular upper arm with a cow-tail tuft decoration. One piece alone.",
    lower_arm:
      "Just one very dark brown bare muscular forearm ending in a strong hand with a beaded wrist band. One piece alone.",
    upper_leg:
      "Just one very dark brown bare muscular thigh from hip to knee. One piece alone.",
    lower_leg:
      "Just one very dark brown bare muscular shin with a white ankle band and bare foot. One piece alone.",
    weapon:
      "Just a Zulu iklwa stabbing spear. Short wooden shaft with a large broad leaf-shaped iron blade at the tip. The spear alone, nothing else.",
  },
  conquistador: {
    style:
      "Spanish conquistador style. Midnight blue, silver steel, gold accents.",
    head: "Just a silver steel morion helmet with a tall central comb ridge and a wide brim pointed at front and back. One helmet alone.",
    torso:
      "Just a conquistador torso — steel breastplate over a white puffy shirt, brown belt with gold buckle, blue sash. One piece, no limbs.",
    upper_arm:
      "Just one white puffy slashed renaissance sleeve from shoulder to elbow with a steel shoulder plate. One piece alone.",
    lower_arm:
      "Just one white shirt sleeve from elbow with a steel forearm guard ending in a leather glove. One piece alone.",
    upper_leg:
      "Just one midnight blue renaissance trouser leg from hip to knee. One piece alone.",
    lower_leg:
      "Just one midnight blue pant leg from knee tucked into a tall brown leather boot. One piece alone.",
    weapon:
      "Just a Toledo rapier. Long thin straight steel blade, ornate gold swept-hilt cup guard. The sword alone, nothing else.",
  },
  seal: {
    style:
      "Modern Navy SEAL operator style. Olive drab green and black with red accents.",
    head: "Just a tactical helmet with NVG goggles flipped up on top and a black balaclava face covering with eye slit. Olive drab green. One helmet alone.",
    torso:
      "Just a tactical plate carrier vest — olive drab, MOLLE webbing rows, magazine pouches on front, over a dark shirt. One piece, no limbs.",
    upper_arm:
      "Just one olive drab combat shirt sleeve from shoulder to elbow. One piece alone.",
    lower_arm:
      "Just one olive drab sleeve from elbow ending in a black tactical glove. One piece alone.",
    upper_leg:
      "Just one olive drab tactical cargo pant leg from hip to knee with a knee pad. One piece alone.",
    lower_leg:
      "Just one olive drab cargo pant leg from knee ending in a black tactical combat boot. One piece alone.",
    weapon:
      "Just an M4 carbine rifle. Black polymer, handguard with rail, magazine, red dot sight on top. The rifle alone, nothing else.",
  },
};

// Aspect ratios per body part type
const PART_CONFIG = {
  head: { aspectRatio: "1:1" },
  torso: { aspectRatio: "3:4" },
  upper_arm: { aspectRatio: "1:1" },
  lower_arm: { aspectRatio: "1:1" },
  upper_leg: { aspectRatio: "1:1" },
  lower_leg: { aspectRatio: "1:1" },
  weapon: { aspectRatio: "1:1" },
};

async function generateImage(prompt, aspectRatio = "1:1") {
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

// Remove bright green background and convert to PNG with transparency
async function chromaKey(inputBuffer, tolerance = 80) {
  // Get raw pixel data
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);

  // Replace green-ish pixels with transparent
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Detect green background: high green, low red and blue
    if (g > 150 && g - r > tolerance && g - b > tolerance) {
      pixels[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }

  // Convert back to PNG, then trim transparent borders
  const pngBuffer = await sharp(Buffer.from(pixels), {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();

  // Trim transparent pixels (auto-crop to content bounds)
  return sharp(pngBuffer).trim().png().toBuffer();
}

async function generateWarrior(warriorId) {
  const prompts = WARRIOR_PROMPTS[warriorId];
  if (!prompts) {
    console.error(`Unknown warrior: ${warriorId}`);
    return { success: 0, failed: 0 };
  }

  const outDir = path.join(ASSETS_DIR, warriorId);
  fs.mkdirSync(outDir, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const part of BODY_PARTS) {
    const outFile = path.join(outDir, `${part}.png`);

    // Skip if already exists (use --force to regenerate)
    if (fs.existsSync(outFile) && !process.argv.includes("--force")) {
      console.log(
        `  [skip] ${warriorId}/${part}.png (exists, use --force to regenerate)`,
      );
      success++;
      continue;
    }

    const fullPrompt = `${STYLE_PREFIX} ${prompts.style} ${prompts[part]}`;
    const config = PART_CONFIG[part];

    console.log(`  [gen]  ${warriorId}/${part}.png ...`);

    try {
      const rawBuffer = await generateImage(fullPrompt, config.aspectRatio);
      const imageBuffer = await chromaKey(rawBuffer);
      fs.writeFileSync(outFile, imageBuffer);
      console.log(
        `  [ok]   ${warriorId}/${part}.png (${imageBuffer.length} bytes, chroma-keyed)`,
      );
      success++;
    } catch (err) {
      console.error(`  [FAIL] ${warriorId}/${part}.png — ${err.message}`);
      failed++;
    }

    // Rate limiting — wait between API calls
    await new Promise((r) => setTimeout(r, 2000));
  }

  return { success, failed };
}

async function main() {
  const targetWarrior = process.argv[2];
  const warriors = targetWarrior
    ? [targetWarrior]
    : Object.keys(WARRIOR_PROMPTS);

  console.log(`\nBlade of Ages — Art Generator`);
  console.log(`Model: ${API_URL.split("/models/")[1].split(":")[0]}`);
  console.log(`Warriors: ${warriors.join(", ")}`);
  console.log(`Parts per warrior: ${BODY_PARTS.length}`);
  console.log(`Total images: ${warriors.length * BODY_PARTS.length}\n`);

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const warrior of warriors) {
    console.log(`\n--- ${warrior.toUpperCase()} ---`);
    const { success, failed } = await generateWarrior(warrior);
    totalSuccess += success;
    totalFailed += failed;
  }

  console.log(`\n========================================`);
  console.log(`Done! ${totalSuccess} succeeded, ${totalFailed} failed.`);
  console.log(`Assets: ${ASSETS_DIR}`);
  if (totalFailed > 0) {
    console.log(
      `Re-run failed warriors: node scripts/generate-art.js <warrior_id> --force`,
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
