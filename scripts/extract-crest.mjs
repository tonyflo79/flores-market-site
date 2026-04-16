/*
 * extract-crest.mjs
 * Crops the FLORES MARKET hat crest region out of IMG_2840 for use as a
 * photo-real brand detail in the Heritage section.
 * Hand-drawn SVG versions live in src/assets/brand/crest-*.svg.
 */

import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.resolve(os.homedir(), 'desktop/pics/IMG_2840.jpg');
const OUT_DIR = path.resolve(__dirname, '../src/assets/brand');

async function main() {
  const meta = await sharp(SRC).rotate().metadata();
  console.log(`Source portrait: ${meta.width}×${meta.height}`);

  // IMG_2840: portrait selfie. Hat patch is roughly centered horizontally,
  // upper third vertically. Coordinates chosen from visual inspection:
  //   left:   ~30% of width
  //   top:    ~4%  of height
  //   width:  ~40% of width
  //   height: ~20% of height
  // Tighter crop: just the crest patch, minimal ceiling/hat context.
  const cropW = Math.round(meta.width * 0.34);
  const cropH = Math.round(meta.height * 0.18);
  const left  = Math.round(meta.width * 0.22);
  const top   = Math.round(meta.height * 0.09);

  const base = sharp(SRC).rotate().extract({ left, top, width: cropW, height: cropH });

  await base.clone().jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(OUT_DIR, 'crest-photo.jpg'));
  await base.clone().webp({ quality: 88 })
    .toFile(path.join(OUT_DIR, 'crest-photo.webp'));
  await base.clone().avif({ quality: 60 })
    .toFile(path.join(OUT_DIR, 'crest-photo.avif'));

  console.log(`crest-photo.{jpg,webp,avif}  (${cropW}×${cropH})`);
}

main().catch((err) => { console.error(err); process.exit(1); });
