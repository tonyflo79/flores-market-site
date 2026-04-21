// Convert the real Flores Market logo into a cream-on-transparent PNG
// for use on the dark hero. Inverted luminance acts as the alpha mask so
// dark parts of the original become opaque cream, and light parts become transparent.
import sharp from 'sharp';
import path from 'node:path';
import os from 'node:os';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const SRC = path.join(os.homedir(), 'Desktop/Pics/flores mark eta .png');
const OUT_DIR = path.join(projectRoot, 'src/assets/images');

const CREAM = { r: 242, g: 237, b: 228 };

async function makeVariant(targetWidth, filename) {
  const { data, info } = await sharp(SRC)
    .resize({ width: targetWidth })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    // luminance via Rec. 709
    const lum = (r * 0.2126 + g * 0.7152 + b * 0.0722) | 0;
    const invLum = 255 - lum;
    // mild gamma to push mid-grays toward the darker end (cleaner edges)
    const shaped = Math.min(255, ((invLum / 255) ** 0.85) * 255) | 0;
    const finalAlpha = Math.round((a * shaped) / 255);
    out[i] = CREAM.r;
    out[i + 1] = CREAM.g;
    out[i + 2] = CREAM.b;
    out[i + 3] = finalAlpha;
  }

  const outPath = path.join(OUT_DIR, filename);
  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`wrote ${outPath} (${info.width}×${info.height})`);
}

await makeVariant(600, 'logo-mark-cream.png');
await makeVariant(300, 'logo-mark-cream-300.png');
