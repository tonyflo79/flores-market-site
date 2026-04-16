import { defineConfig } from 'vite';

// Base path is '/' for production (custom domain via GoDaddy),
// '/flores-market-site/' when deployed to GitHub Pages preview.
// Toggled via DEPLOY_TARGET env var in CI.
const isGhPagesPreview = process.env.DEPLOY_TARGET === 'gh-pages';

export default defineConfig({
  base: isGhPagesPreview ? '/flores-market-site/' : '/',
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          lenis: ['lenis'],
        },
      },
    },
  },
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
});
