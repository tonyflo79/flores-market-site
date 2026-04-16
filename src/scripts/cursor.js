/*
 * Custom cursor — 8px bone dot that lerps behind the pointer,
 * expands to a 48px ring when hovering [data-cursor="large"].
 * Hidden on touch devices.
 */

export function initCursor() {
  if (matchMedia('(hover: none)').matches) return;

  const root = document.querySelector('[data-cursor-root]');
  if (!root) return;

  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let x = tx, y = ty;
  const lerp = 0.18;

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
  }, { passive: true });

  // Hover state on designated targets
  const updateLarge = () => {
    const hovered = document.querySelectorAll('[data-cursor="large"]:hover');
    root.classList.toggle('large', hovered.length > 0);
  };
  document.addEventListener('pointerover', updateLarge);
  document.addEventListener('pointerout', updateLarge);

  // Animation loop
  const render = () => {
    x += (tx - x) * lerp;
    y += (ty - y) * lerp;
    root.style.transform = `translate3d(${x - (root.classList.contains('large') ? 24 : 4)}px, ${y - (root.classList.contains('large') ? 24 : 4)}px, 0)`;
    requestAnimationFrame(render);
  };
  render();
}
