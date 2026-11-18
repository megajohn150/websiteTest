// Scroll motion for brutalistanimated.html. Content is fully visible without this file;
// everything here runs only when GSAP loaded and the visitor has not asked for reduced motion.
(() => {
  const root = document.documentElement;
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) { root.classList.remove('js-motion'); return; }
  gsap.registerPlugin(ScrollTrigger);

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const split = (el, by = 'word') => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    const parts = by === 'char' ? [...text] : text.split(' ');
    el.innerHTML = parts.map((p) => (p === ' ' ? ' ' : `<span class="w" aria-hidden="true"><span class="wi">${esc(p)}</span></span>`)).join(by === 'char' ? '' : ' ');
    return el.querySelectorAll('.wi');
  };
  // brutal motion: fast in, dead stop
  const SLAM = 'power4.out';

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    let lenis;
    if (window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.12 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id.length > 1 && document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -16, duration: 1 });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }));
    }

    // ---- intro
    const h1 = document.querySelector('.hero h1');
    const h1Words = split(h1);
    root.classList.add('motion-ready');
    gsap.timeline({ defaults: { ease: SLAM } })
      .from('.nav', { yPercent: -100, autoAlpha: 0, duration: 0.6 })
      .from(h1Words, { yPercent: 115, duration: 0.8, stagger: 0.07 }, 0.15)
      .fromTo(h1, { '--rule': 0 }, { '--rule': 1, duration: 0.9, ease: 'expo.inOut' }, 0.35)
      .from('.hero .cells', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut' }, 0.7)
      .from('.hero .cells > *', { y: 30, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.95);

    // the hero head pulls apart as you leave it
    gsap.to(h1Words, { yPercent: (i) => -12 * (i % 3 + 1), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // ---- section heads slam up
    document.querySelectorAll('.section h2, .contact h2').forEach((h) => {
      gsap.from(split(h), { yPercent: 115, duration: 0.8, ease: SLAM, stagger: 0.06, scrollTrigger: { trigger: h, start: 'top 88%' } });
    });

    // ---- index rows punch in from the left, one after another
    gsap.from('.index > a', { xPercent: -6, autoAlpha: 0, duration: 0.6, ease: SLAM, stagger: 0.07, scrollTrigger: { trigger: '.index', start: 'top 82%' } });

    // ---- bento cells drop open
    gsap.from('.bento > *', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut', stagger: 0.1, scrollTrigger: { trigger: '.bento', start: 'top 80%' } });
    gsap.fromTo('.art--tide .big', { scale: 0.82, transformOrigin: '0% 0%' }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.bento', start: 'top bottom', end: 'center center', scrub: true } });
    gsap.from('.art--hallo span:first-child', { yPercent: 120, rotate: -8, duration: 0.7, ease: SLAM, scrollTrigger: { trigger: '.bento', start: 'top 70%' } });
    gsap.fromTo('.art--hours', { '--spin': '0deg' }, { '--spin': '1080deg', ease: 'none', scrollTrigger: { trigger: '.bento', start: 'top bottom', end: 'bottom top', scrub: 0.4 } });

    // the balance counts up to its real figure
    const bal = document.querySelector('.art--ferro .bal');
    if (bal) {
      const target = parseFloat(bal.textContent.replace(/[^\d.]/g, ''));
      const fmt = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const n = { v: 0 };
      gsap.to(n, { v: target, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: bal, start: 'top 85%' }, onUpdate: () => { bal.textContent = `€${fmt.format(n.v)}`; } });
    }

    // ---- services
    gsap.from('.services li', { autoAlpha: 0, y: 40, duration: 0.6, ease: SLAM, stagger: 0.08, scrollTrigger: { trigger: '.services', start: 'top 85%' } });
    gsap.from('.services h3', { xPercent: -10, duration: 0.8, ease: SLAM, stagger: 0.08, scrollTrigger: { trigger: '.services', start: 'top 85%' } });

    // ---- process: on wide screens the ink band pins and lights each step in turn
    const steps = gsap.utils.toArray('.steps li');
    const band = document.querySelector('.band--ink');
    const wide = gsap.matchMedia();
    wide.add('(min-width: 60rem)', () => {
      // 0 to 0.85 s: steps arrive; then each step owns 0.5 s of the pinned scroll
      const light = () => {
        const i = Math.floor((tl.time() - 0.85) / 0.5);
        steps.forEach((s, j) => s.classList.toggle('is-on', j === Math.min(i, steps.length - 1)));
      };
      const tl = gsap.timeline({ onUpdate: light, scrollTrigger: { trigger: band, start: 'top top', end: () => `+=${window.innerHeight * 1.6}`, pin: true, scrub: true } });
      tl.from(steps, { y: 60, autoAlpha: 0, stagger: 0.15, duration: 0.4, ease: SLAM });
      tl.to({}, { duration: steps.length * 0.5 }, 0.85);
      return () => steps.forEach((s) => s.classList.remove('is-on'));
    });
    wide.add('(max-width: 59.99rem)', () => {
      gsap.from(steps, { y: 40, autoAlpha: 0, duration: 0.6, ease: SLAM, stagger: 0.08, scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
    });

    // ---- studio: the print wipes in hard, then drifts inside its frame
    const photo = document.querySelector('.studio .photo');
    gsap.from(photo, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.9, ease: 'steps(6)', scrollTrigger: { trigger: photo, start: 'top 80%' } });
    const img = photo.querySelector('img');
    if (img) gsap.fromTo(img, { scale: 1.25, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.studio__text p', { y: 24, autoAlpha: 0, duration: 0.6, ease: SLAM, stagger: 0.08, scrollTrigger: { trigger: '.studio__text', start: 'top 85%' } });

    // ---- contact: the address slides in from the right edge, the rule draws under it
    const mail = document.querySelector('.contact .mail');
    gsap.fromTo(mail, { xPercent: 35 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'center 60%', scrub: true } });
    gsap.from(split(mail, 'char'), { yPercent: 115, duration: 0.6, ease: SLAM, stagger: 0.015, scrollTrigger: { trigger: mail, start: 'top 90%' } });

    gsap.from('.footer > *', { autoAlpha: 0, y: 30, duration: 0.5, ease: SLAM, stagger: 0.06, scrollTrigger: { trigger: '.footer', start: 'top 95%' } });

    document.querySelectorAll('img').forEach((i) => i.complete || i.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }));
    return () => { lenis?.destroy(); wide.revert(); };
  });

  if (!matchMedia('(prefers-reduced-motion: no-preference)').matches) root.classList.remove('js-motion');
})();
