// One-off: apply wabi-sabi grade to Marcus's portrait per brand README.
// Muted saturation, lifted blacks, blue dropped, warm cast, soft vignette.

import sharp from 'sharp';
import path from 'node:path';
import os from 'node:os';

const SRC = path.join(os.homedir(), 'Desktop/Pics/MarcusBio-Image.jpg');
const OUT = path.join(os.homedir(), 'Desktop/Pics/MarcusBio-Wabisabi.jpg');

const meta = await sharp(SRC).rotate().metadata();
const w = meta.width, h = meta.height;

const vignette = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="v" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
      <stop offset="0%"  stop-color="rgb(20,17,15)" stop-opacity="0"/>
      <stop offset="65%" stop-color="rgb(20,17,15)" stop-opacity="0"/>
      <stop offset="100%" stop-color="rgb(20,17,15)" stop-opacity="0.42"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);

await sharp(SRC)
  .rotate()
  .modulate({ saturation: 0.58, brightness: 1.05 })
  .linear(0.88, 20)
  .recomb([
    [1.08, 0.00, 0.00],
    [0.00, 1.02, 0.00],
    [0.00, 0.00, 0.82],
  ])
  .composite([{ input: vignette, blend: 'over' }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(OUT);

console.log(`wrote ${OUT}`);
