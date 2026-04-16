import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

/*
 * Gallery lightbox:
 *   Click tile → GSAP FLIP expand into full-screen view with chevron nav.
 *   ESC / click-backdrop / close button → reverse.
 */

export function initLightbox() {
  const grid = document.querySelector('[data-gallery]');
  if (!grid) return;

  const tiles = Array.from(grid.querySelectorAll('.gallery__tile'));
  if (!tiles.length) return;

  // Overlay structure
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <button class="lightbox__close" aria-label="Close" data-cursor="large">&times;</button>
    <button class="lightbox__prev"  aria-label="Previous" data-cursor="large">&larr;</button>
    <button class="lightbox__next"  aria-label="Next"     data-cursor="large">&rarr;</button>
    <div class="lightbox__stage" aria-live="polite"></div>
    <p class="lightbox__count"></p>
  `;
  document.body.appendChild(overlay);

  const stage  = overlay.querySelector('.lightbox__stage');
  const count  = overlay.querySelector('.lightbox__count');
  const closeB = overlay.querySelector('.lightbox__close');
  const prevB  = overlay.querySelector('.lightbox__prev');
  const nextB  = overlay.querySelector('.lightbox__next');

  let current = -1;
  let isOpen  = false;

  const render = () => {
    const source = tiles[current].querySelector('img');
    const pic    = tiles[current].querySelector('picture');
    stage.innerHTML = '';
    const clone = pic ? pic.cloneNode(true) : source.cloneNode(true);
    clone.classList.add('lightbox__image');
    stage.appendChild(clone);
    count.textContent = `${current + 1} / ${tiles.length}`;
  };

  const open = (idx) => {
    current = idx;
    render();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // FLIP from tile → stage for entrance polish
    const state = Flip.getState(stage.firstChild);
    Flip.from(state, { duration: 0.52, ease: 'power3.inOut', absolute: true });
    isOpen = true;
  };

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    isOpen = false;
  };

  const step = (delta) => {
    current = (current + delta + tiles.length) % tiles.length;
    const prevEl = stage.firstChild;
    if (prevEl) gsap.to(prevEl, { opacity: 0, duration: 0.24, onComplete: render });
    setTimeout(() => gsap.fromTo(stage.firstChild, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }), 260);
  };

  tiles.forEach((tile, i) => {
    tile.addEventListener('click', () => open(i));
  });
  closeB.addEventListener('click', close);
  prevB.addEventListener('click',  () => step(-1));
  nextB.addEventListener('click',  () => step(+1));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  window.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(+1);
  });
}
