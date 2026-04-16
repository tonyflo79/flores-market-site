import { gsap } from 'gsap';

/*
 * Preloader:
 *   On load → hold 400ms → fade out over 500ms.
 *   If fonts API exists, wait for primary fonts first.
 */

export function initPreloader() {
  const el = document.querySelector('[data-preloader]');
  if (!el) return Promise.resolve();

  const ready = 'fonts' in document
    ? Promise.all([
        document.fonts.load('1em "Fraunces Variable"'),
        document.fonts.load('400 1em "General Sans"'),
      ]).catch(() => {})
    : Promise.resolve();

  return ready.then(() => new Promise((resolve) => {
    // Small grace beat so the crest is perceived
    gsap.to(el, {
      opacity: 0,
      duration: 0.5,
      delay: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        el.style.display = 'none';
        resolve();
      },
    });
  }));
}
