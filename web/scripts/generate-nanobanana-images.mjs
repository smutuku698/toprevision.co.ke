// Calls fal.ai's nano banana (Gemini 2.5 Flash Image) model to generate the labelled photo-diagram
// images described in curriculum-reference/<grade>/IMAGE-PROMPTS-nanobanana.json, and saves the raw
// output into web/public/images/<grade>/<id>.png ready for `npm run images:webp`.
//
// Usage (run from web/):
//   node scripts/generate-nanobanana-images.mjs --grade grade-6 --id hre-g6-gifts-of-nature
//   node scripts/generate-nanobanana-images.mjs --grade grade-6 --all
//   node scripts/generate-nanobanana-images.mjs --grade grade-6 --ids id1,id2,id3
//
// Reads FAL_KEY from the repo-root .env file (two levels up from this script).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

function loadFalKey() {
  const envPath = join(REPO_ROOT, ".env");
  const text = readFileSync(envPath, "utf8");
  const match = text.match(/^FAL_KEY=(.+)$/m);
  if (!match) throw new Error(`FAL_KEY not found in ${envPath}`);
  return match[1].trim();
}

const FAL_KEY = loadFalKey();
const MODEL_ID = "fal-ai/nano-banana";

const ASPECT_PRESETS = { "1:1": 1, "4:3": 4 / 3, "3:4": 3 / 4, "16:9": 16 / 9, "9:16": 9 / 16 };

// Picks the closest supported fal.ai aspect_ratio preset to the WxH hint in an entry's `dimensions` prose field.
function pickAspectRatio(dimensionsText) {
  const match = dimensionsText?.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return "4:3";
  const ratio = Number(match[1]) / Number(match[2]);
  let best = "4:3";
  let bestDiff = Infinity;
  for (const [preset, value] of Object.entries(ASPECT_PRESETS)) {
    const diff = Math.abs(value - ratio);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = preset;
    }
  }
  return best;
}

function parseArgs(argv) {
  const args = { grade: null, id: null, ids: null, all: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--grade") args.grade = argv[++i];
    else if (a === "--id") args.id = argv[++i];
    else if (a === "--ids") args.ids = argv[++i].split(",").map((s) => s.trim());
    else if (a === "--all") args.all = true;
    else if (a === "--dry-run") args.dryRun = true;
  }
  if (!args.grade) throw new Error("--grade is required, e.g. --grade grade-6");
  if (!args.id && !args.ids && !args.all) throw new Error("one of --id, --ids, --all is required");
  return args;
}

async function generateOne(entry, outDir, dryRun) {
  const outPath = join(outDir, `${entry.id}.png`);
  console.log(`\n=== ${entry.id} ===`);
  if (dryRun) {
    console.log(`[dry-run] would POST to fal.run/${MODEL_ID} and save to ${outPath}`);
    return { id: entry.id, status: "dry-run" };
  }

  const res = await fetch(`https://fal.run/${MODEL_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: entry.prompt,
      num_images: 1,
      output_format: "png",
      aspect_ratio: pickAspectRatio(entry.dimensions),
    }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(`Non-JSON response (status ${res.status}):`, text.slice(0, 2000));
    return { id: entry.id, status: "error", detail: `non-JSON response, status ${res.status}` };
  }

  if (!res.ok) {
    console.error(`fal.ai error (status ${res.status}):`, JSON.stringify(json, null, 2));
    return { id: entry.id, status: "error", detail: json };
  }

  const imageUrl = json?.images?.[0]?.url;
  if (!imageUrl) {
    console.error("No image URL found in response:", JSON.stringify(json, null, 2));
    return { id: entry.id, status: "error", detail: "no image URL in response" };
  }

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    console.error(`Failed to download generated image from ${imageUrl}: ${imgRes.status}`);
    return { id: entry.id, status: "error", detail: `download failed, status ${imgRes.status}` };
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, buf);
  console.log(`Saved ${outPath} (${(buf.length / 1024).toFixed(0)}KB)`);
  return { id: entry.id, status: "ok", path: outPath, sourceUrl: imageUrl };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const jsonPath = join(REPO_ROOT, "curriculum-reference", args.grade, "IMAGE-PROMPTS-nanobanana.json");
  const data = JSON.parse(readFileSync(jsonPath, "utf8"));
  const allImages = data.images;

  let targets;
  if (args.all) targets = allImages;
  else if (args.ids) targets = allImages.filter((e) => args.ids.includes(e.id));
  else targets = allImages.filter((e) => e.id === args.id);

  if (targets.length === 0) {
    console.error("No matching entries found for the given --id/--ids.");
    process.exit(1);
  }

  const gradeNum = args.grade.replace("grade-", "");
  const outDir = join(REPO_ROOT, "web", "public", "images", `grade${gradeNum}`);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const results = [];
  for (const entry of targets) {
    try {
      const result = await generateOne(entry, outDir, args.dryRun);
      results.push(result);
    } catch (err) {
      console.error(`Unexpected error generating ${entry.id}:`, err);
      results.push({ id: entry.id, status: "error", detail: String(err) });
    }
    // Small delay between requests to be polite to the API.
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\n=== Summary ===");
  for (const r of results) console.log(`${r.status.padEnd(8)} ${r.id}`);
  const failed = results.filter((r) => r.status === "error");
  if (failed.length > 0) {
    console.log(`\n${failed.length} of ${results.length} failed.`);
    process.exit(1);
  }
}

main();
