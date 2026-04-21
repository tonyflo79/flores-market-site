// Resize new hero + 2 omakase photos for gallery swap.
import sharp from 'sharp';
import path from 'node:path';
import os from 'node:os';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const PICS = path.join(os.homedir(), 'Desktop/Pics');
const OUT = path.join(projectRoot, 'src/assets/images');

const jobs = [
  { src: 'Herov3.jpg',                              out: 'hero-main.jpg',        w: 1920 },
  { src: 'Herov3.jpg',                              out: 'hero-main-768.jpg',    w: 768  },
  { src: 'Omakase-w-Marcus-Flores-2024-06-07_16.jpg',  out: 'gallery-omakase-16.jpg',  w: 1280 },
  { src: 'Omakase-w-Marcus-Flores-2024-06-07_100.jpg', out: 'gallery-omakase-100.jpg', w: 1280 },
];

for (const { src, out, w } of jobs) {
  await sharp(path.join(PICS, src))
    .rotate()
    .resize({ width: w, withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(OUT, out));
  const meta = await sharp(path.join(OUT, out)).metadata();
  console.log(`${out} → ${meta.width}×${meta.height}`);
}
