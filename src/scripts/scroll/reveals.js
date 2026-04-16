import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export function initReveals() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============== WORDS reveals — split headlines, stagger Y+opacity ==============
  document.querySelectorAll('[data-reveal="words"]').forEach((el) => {
    const split = new SplitType(el, { types: 'words', tagName: 'span' });
    const words = split.words;

    // Wrap each word so we can translate without kicking layout
    words.forEach((word) => {
      word.style.display = 'inline-block';
      word.style.willChange = 'transform, opacity';
    });

    if (reduce) {
      // Just show them.
      gsap.set(words, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(words, { yPercent: 80, opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.05,
        });
      },
    });
  });

  // ============== FADE reveals — simple opacity + translate ==============
  document.querySelectorAll('[data-reveal="fade"]').forEach((el) => {
    if (reduce) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    gsap.set(el, { opacity: 0, y: 28 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
      },
    });
  });

  // ============== SCALE-X reveals — rules / dividers ==============
  document.querySelectorAll('[data-reveal="scaleX"]').forEach((el) => {
    if (reduce) { gsap.set(el, { scaleX: 1, transformOrigin: 'left center' }); return; }
    gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(el, { scaleX: 1, duration: 0.9, ease: 'expo.out' }),
    });
  });

  // ============== CLIP reveals — image reveals (inset) ==============
  document.querySelectorAll('[data-reveal="clip"]').forEach((el) => {
    if (reduce) { gsap.set(el, { clipPath: 'inset(0 0 0 0)' }); return; }
    gsap.set(el, { clipPath: 'inset(100% 0 0 0)' });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => gsap.to(el, { clipPath: 'inset(0 0 0 0)', duration: 1.1, ease: 'power3.out' }),
    });
  });

  // ============== PARALLAX — heritage 19/65 stamp and similar ==============
  if (!reduce) {
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const depth = parseFloat(el.dataset.parallax) || 0.7;
      gsap.to(el, {
        yPercent: -30 * (1 - depth) * 100 / 100, // gentle
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // ============== THEME SWITCH — Heritage paper bg ==============
  const heritage = document.querySelector('[data-bg="paper"]');
  if (heritage) {
    ScrollTrigger.create({
      trigger: heritage,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter:     () => document.body.style.setProperty('--page-bg', 'var(--paper)') ||
                         document.body.style.setProperty('--page-fg', 'var(--ink)'),
      onEnterBack: () => document.body.style.setProperty('--page-bg', 'var(--paper)') ||
                         document.body.style.setProperty('--page-fg', 'var(--ink)'),
      onLeave:     () => document.body.style.setProperty('--page-bg', 'var(--ink)') ||
                         document.body.style.setProperty('--page-fg', 'var(--bone)'),
      onLeaveBack: () => document.body.style.setProperty('--page-bg', 'var(--ink)') ||
                         document.body.style.setProperty('--page-fg', 'var(--bone)'),
    });
  }
}
