# The Flores Market — website

Private catering site for Chef Marcus Flores. Vanilla HTML/CSS/JS + Vite + Three.js.

Full spec: `../BUILD-SPEC.md`.

## Local dev

```bash
npm install
npm run dev         # http://localhost:5173
npm run build       # production build → dist/
npm run preview     # serve dist/ locally
npm run build:images  # regenerate AVIF/WebP/JPG from ~/desktop/pics (P3)
```

## Structure

- `src/styles/` — design tokens, reset, typography, layout, section CSS
- `src/scripts/` — main orchestrator, scroll, WebGL, cursor, form, lightbox
- `src/assets/` — fonts, brand marks, processed images
- `public/` — static files copied verbatim (favicon, OG image, robots)

## Deploy

- **Preview:** GitHub Pages → `https://tonyflo79.github.io/flores-market-site/` (set `DEPLOY_TARGET=gh-pages` in CI).
- **Production:** GoDaddy custom domain (DNS cutover in P11).
