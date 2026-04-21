// One-off: wabi-sabi grade + resize Marcus's portrait for the story section.
// Mirrors scripts/wabisabi.mjs grading, outputs at 1280w and 768w into src/assets/images.

import sharp from 'sharp';
import path from 'node:path';
import os from 'node:os';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const SRC = path.join(os.homedir(), 'Desktop/Pics/MarcusBio-Image.jpg');
const OUT_DIR = path.join(projectRoot, 'src/assets/images');

const widths = [
  { w: 1280, name: 'chef-portrait-new.jpg' },
  { w: 768,  name: 'chef-portrait-new-768.jpg' },
];

for (const { w, name } of widths) {
  // Resize first to keep the vignette proportional to the output.
  const resized = await sharp(SRC).rotate().resize({ width: w }).toBuffer();
  const meta = await sharp(resized).metadata();
  const W = meta.width, H = meta.height;

  const vignette = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="v" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
      <stop offset="0%"  stop-color="rgb(20,17,15)" stop-opacity="0"/>
      <stop offset="65%" stop-color="rgb(20,17,15)" stop-opacity="0"/>
      <stop offset="100%" stop-color="rgb(20,17,15)" stop-opacity="0.42"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);

  const outPath = path.join(OUT_DIR, name);
  await sharp(resized)
    .modulate({ saturation: 0.58, brightness: 1.05 })
    .linear(0.88, 20)
    .recomb([
      [1.08, 0.00, 0.00],
      [0.00, 1.02, 0.00],
      [0.00, 0.00, 0.82],
    ])
    .composite([{ input: vignette, blend: 'over' }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outPath);

  console.log(`wrote ${outPath} (${W}×${H})`);
}
