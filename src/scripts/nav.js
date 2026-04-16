/*
 * Nav scroll state — toggles .scrolled class at scrollY > 40
 * to swap background to translucent ink with backdrop-blur.
 */

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
