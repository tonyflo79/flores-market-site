/*
 * THE FLORES MARKET — Minimal client bootstrap
 * Redesign: fades only, no parallax, no smooth-scroll, no cursor.
 */

// Mark fonts loaded (body fade-in gate defined in reset.css)
const markFontsLoaded = () => document.documentElement.classList.add('fonts-loaded');
if ('fonts' in document) {
  Promise.all([
    document.fonts.load('italic 300 1em "Fraunces"'),
    document.fonts.load('400 1em "Inter"'),
  ]).then(markFontsLoaded).catch(markFontsLoaded);
} else {
  markFontsLoaded();
}

// Fade-in reveals via IntersectionObserver
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('[data-reveal]');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  revealTargets.forEach((el) => io.observe(el));
}

// Inquiry form — Formspree submit with inline status
const form = document.querySelector('[data-form]');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = form.querySelector('[data-form-status]');
    const honey = form.querySelector('input[name="website"]');
    if (honey && honey.value) return; // bot
    if (status) status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        if (status) status.textContent = 'Received. The chef will be in touch.';
      } else {
        if (status) status.textContent = 'Something went wrong. Email chef@thefloresmarket.com.';
      }
    } catch {
      if (status) status.textContent = 'Network error. Email chef@thefloresmarket.com.';
    }
  });
}
