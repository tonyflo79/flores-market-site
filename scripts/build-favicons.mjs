/*
 * build-favicons.mjs
 * Rasterizes favicon.svg → PNG at standard sizes.
 * Also composes og-image.jpg (1200×630) from hero image + wordmark overlay.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.resolve(__dirname, '..');
const PUBLIC = path.resolve(ROOT, 'public');
const IMAGES = path.resolve(ROOT, 'src/assets/images');

const FAVICON_SVG = path.resolve(PUBLIC, 'favicon.svg');

const SIZES = [16, 32, 48, 180, 192, 512];

async function buildFavicons() {
  const svg = await fs.readFile(FAVICON_SVG);
  for (const size of SIZES) {
    const out = path.join(PUBLIC, `favicon-${size}.png`);
    await sharp(svg, { density: Math.max(96, size * 4) })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`favicon-${size}.png`);
  }
  // Apple touch icon alias
  await fs.copyFile(
    path.join(PUBLIC, 'favicon-180.png'),
    path.join(PUBLIC, 'apple-touch-icon.png')
  );
  console.log('apple-touch-icon.png');
}

async function buildOgImage() {
  // Compose a 1200×630 OG image: hero photo darkened + wordmark baseline.
  const heroSrc = path.join(IMAGES, 'hero-sushi-platter-1920w.jpg');
  try { await fs.access(heroSrc); } catch { console.warn('OG hero source missing, skipping.'); return; }

  const base = sharp(heroSrc)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 0.75 });

  // Dark overlay gradient SVG + wordmark
  const overlay = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#14110F" stop-opacity="0.2"/>
          <stop offset="1" stop-color="#14110F" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#g)"/>
      <text x="60" y="540"
            font-family="Georgia, 'Times New Roman', serif"
            font-size="72" font-weight="400"
            letter-spacing="8"
            fill="#F2EDE4">THE FLORES MARKET</text>
      <text x="60" y="580"
            font-family="Helvetica, Arial, sans-serif"
            font-size="18"
            letter-spacing="3"
            fill="#A0845C">PRIVATE CATERING · LOS ANGELES</text>
    </svg>
  `);

  await base
    .composite([{ input: overlay }])
    .jpeg({ quality: 86 })
    .toFile(path.join(PUBLIC, 'og-image.jpg'));
  console.log('og-image.jpg (1200×630)');
}

async function main() {
  await buildFavicons();
  await buildOgImage();
}

main().catch((err) => { console.error(err); process.exit(1); });
