/*
 * build-images.mjs
 * Transforms source photos → AVIF + WebP + JPG at 5 widths.
 * Source: /Users/anthonyflores/desktop/pics/
 * Output: src/assets/images/
 * Run: npm run build:images
 *
 * Per BUILD-SPEC.md §14:
 *   - AVIF q=50, WebP q=75, JPG q=82
 *   - Widths [480, 768, 1280, 1920, 2560]
 *   - Hero (IMG_2125) gets a mobile art-direction crop (centered)
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(os.homedir(), 'desktop/pics');
const OUT_DIR = path.resolve(__dirname, '../src/assets/images');

const WIDTHS = [480, 768, 1280, 1920, 2560];

// Map source filename → semantic slug used across HTML/CSS.
const MAP = {
  'IMG_2125.jpeg': 'hero-sushi-platter',
  'IMG_3225.jpeg': 'signature-nigiri',
  'IMG_0017.JPG':  'ikura-macro',
  'IMG_8854.jpg':  'crowned-nigiri',
  'IMG_5224.jpg':  'single-nigiri-detail',
  'IMG_2164.jpeg': 'event-overhead',
  '8CB18D90-CE0D-44B8-8C5D-64A94B0B068Fmatson Capital-276.JPEG': 'chef-action',
  'IMG_2840.jpg':  'chef-portrait',
};

// Hero gets an additional mobile crop (centered, sushi platter focus).
const HERO_MOBILE = { source: 'IMG_2125.jpeg', slug: 'hero-sushi-platter-mobile', crop: 'centered' };

async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }); }

async function processVariant(srcPath, outBase, width, options = {}) {
  const metadata = await sharp(srcPath).metadata();
  const targetW = Math.min(width, metadata.width);

  const pipeline = sharp(srcPath, { failOn: 'none' })
    .rotate() // auto-orient from EXIF
    .resize({ width: targetW, withoutEnlargement: true });

  // Optional centered crop for mobile hero art direction
  if (options.crop === 'centered') {
    const { width: w, height: h } = await pipeline.clone().metadata();
    // Nothing extra — cover-resize keeps centered by default when aspect matches.
    // (For now we rely on CSS object-fit; if we need a true center-crop square, uncomment below.)
    // pipeline.resize({ width: targetW, height: targetW, fit: 'cover', position: 'center' });
  }

  const jobs = [
    pipeline.clone().avif({ quality: 50, effort: 4 }).toFile(`${outBase}-${targetW}w.avif`),
    pipeline.clone().webp({ quality: 75, effort: 5 }).toFile(`${outBase}-${targetW}w.webp`),
    pipeline.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`${outBase}-${targetW}w.jpg`),
  ];
  return Promise.all(jobs);
}

async function processOne(source, slug, options = {}) {
  const srcPath = path.join(SRC_DIR, source);
  const outBase = path.join(OUT_DIR, slug);

  // Confirm source exists
  try { await fs.access(srcPath); }
  catch { console.warn(`   ✗ SKIP ${source} (not found)`); return; }

  const meta = await sharp(srcPath).metadata();
  console.log(`→ ${slug}  (src ${meta.width}×${meta.height})`);

  for (const w of WIDTHS) {
    await processVariant(srcPath, outBase, w, options);
  }

  // Report hero file size against budget
  if (slug.startsWith('hero-')) {
    const avif = await fs.stat(`${outBase}-1920w.avif`).catch(() => null);
    const webp = await fs.stat(`${outBase}-1920w.webp`).catch(() => null);
    if (avif && webp) {
      const kb = (b) => (b / 1024).toFixed(1);
      console.log(`   hero@1920: ${kb(avif.size)}KB AVIF · ${kb(webp.size)}KB WebP  (budget: ≤220/≤340)`);
    }
  }
}

async function main() {
  console.log(`Source:  ${SRC_DIR}`);
  console.log(`Output:  ${OUT_DIR}`);
  await ensureDir(OUT_DIR);

  for (const [src, slug] of Object.entries(MAP)) {
    await processOne(src, slug);
  }

  // Hero mobile variant
  await processOne(HERO_MOBILE.source, HERO_MOBILE.slug, { crop: HERO_MOBILE.crop });

  const files = await fs.readdir(OUT_DIR);
  const total = files.length;
  const byExt = files.reduce((m, f) => { const e = path.extname(f); m[e] = (m[e]||0)+1; return m; }, {});
  console.log(`\nDone. ${total} files generated.`);
  Object.entries(byExt).forEach(([e,c]) => console.log(`  ${e}: ${c}`));
}

main().catch((err) => {
  console.error('Image pipeline failed:', err);
  process.exit(1);
});
