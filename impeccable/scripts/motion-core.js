// Shared motion core for the *animated.html pages: smooth scroll, text splitting, reduced-motion guard.
// Page scripts call Motion.run((ctx) => { ...build tweens... }); nothing runs without GSAP or under reduced motion.
(() => {
  const root = document.documentElement;
  const reveal = () => root.classList.add('motion-ready');
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) { root.classList.remove('js-motion'); window.Motion = { run: () => {} }; return; }
  gsap.registerPlugin(ScrollTrigger);

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Wraps words (or characters) of a text-only element in clipping spans; the real text stays as aria-label.
  const split = (el, by = 'word') => {
    if (!el) return [];
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    const parts = by === 'char' ? [...text] : text.split(' ');
    el.innerHTML = parts.map((p) => (p === ' ' ? ' ' : `<span class="w" aria-hidden="true"><span class="wi">${esc(p)}</span></span>`)).join(by === 'char' ? '' : ' ');
    return el.querySelectorAll('.wi');
  };

  window.Motion = {
    gsap, ScrollTrigger, split,
    run(build) {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        let lenis;
        if (window.Lenis) {
          lenis = new window.Lenis({ lerp: 0.1 });
          lenis.on('scroll', ScrollTrigger.update);
          const raf = (t) => lenis.raf(t * 1000);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);
          document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            const target = id.length > 1 && document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            lenis.scrollTo(target, { offset: -16, duration: 1.3 });
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }));
        }
        const cleanup = build({ gsap, ScrollTrigger, split, lenis });
        reveal();
        document.querySelectorAll('img').forEach((i) => i.complete || i.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }));
        return () => { lenis?.destroy(); if (typeof cleanup === 'function') cleanup(); };
      });
      if (!matchMedia('(prefers-reduced-motion: no-preference)').matches) root.classList.remove('js-motion');
    },
  };
})();
