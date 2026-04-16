/*
 * THE FLORES MARKET — Client bootstrap
 */

import '@fontsource-variable/fraunces';
import { initPreloader } from './preloader.js';
import { initSmoothScroll } from './scroll/lenis-init.js';
import { initReveals } from './scroll/reveals.js';
import { initCursor } from './cursor.js';
import { initNav } from './nav.js';
import { initForm } from './form.js';
import { initLightbox } from './lightbox.js';
import { HeroScene } from './webgl/HeroScene.js';
import { GrainOverlay } from './webgl/GrainOverlay.js';

// Mark fonts loaded (body fade-in gate)
const markFontsLoaded = () => document.documentElement.classList.add('fonts-loaded');
if ('fonts' in document) {
  Promise.all([
    document.fonts.load('1em "Fraunces Variable"'),
    document.fonts.load('400 1em "General Sans"'),
  ]).then(markFontsLoaded).catch(markFontsLoaded);
} else {
  markFontsLoaded();
}

initNav();
initCursor();
initForm();

// Wait for preloader + fonts before wiring scroll + reveals to prevent
// early-computed ScrollTrigger positions against hidden body.
window.addEventListener('load', async () => {
  await initPreloader();
  initSmoothScroll();
  initReveals();

  // WebGL layer — hero shader + grain overlay.
  const heroEl = document.querySelector('.hero');
  if (heroEl) new HeroScene(heroEl);

  const grainEl = document.querySelector('[data-grain]');
  if (grainEl) new GrainOverlay(grainEl);

  initLightbox();
});
