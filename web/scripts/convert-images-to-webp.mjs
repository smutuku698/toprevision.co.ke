// Converts every PNG/JPG under public/images/ to WebP and removes the original, in place.
// Run this any time new source images (e.g. from nano banana / fal.ai) are dropped into public/images/
// before wiring them into a skill — see curriculum-reference/CURRICULUM-MINING-GUIDE.md's image-asset rule.
//
// Usage: node scripts/convert-images-to-webp.mjs
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";

const ROOT = "public/images";
const SOURCE_EXT = /\.(png|jpe?g)$/i;

async function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (SOURCE_EXT.test(entry.name)) {
      await convert(full);
    }
  }
}

async function convert(src) {
  const dest = src.replace(SOURCE_EXT, ".webp");
  const before = statSync(src).size;
  await sharp(src).webp({ quality: 85 }).toFile(dest);
  const after = statSync(dest).size;
  unlinkSync(src);
  console.log(`${src} -> ${dest}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}

await walk(ROOT);
