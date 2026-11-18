// Scroll motion for swissanimated.html. Content is fully visible without this file;
// everything here runs only when GSAP loaded and the visitor has not asked for reduced motion.
(() => {
  const root = document.documentElement;
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) { root.classList.remove('js-motion'); return; }
  gsap.registerPlugin(ScrollTrigger);

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Wraps each word (or each character) in a clipping span; keeps the real text for screen readers.
  const split = (el, by = 'word') => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    const parts = by === 'char' ? [...text] : text.split(' ');
    el.innerHTML = parts.map((p) => (p === ' ' ? ' ' : `<span class="w" aria-hidden="true"><span class="wi">${esc(p)}</span></span>`)).join(by === 'char' ? '' : ' ');
    return el.querySelectorAll('.wi');
  };

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
    let lenis;
    if (window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.09 });
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id.length > 1 && document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -24, duration: 1.4 });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }));
    }

    // progress bar
    const bar = document.createElement('div');
    bar.className = 'progress';
    document.body.append(bar);
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    // ---- intro
    const h1Words = split(document.querySelector('.hero h1'));
    const field = document.querySelector('.hero__field');
    root.classList.add('motion-ready');
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
      .from('.nav', { autoAlpha: 0, y: -16, duration: 0.8 })
      .from(field, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.3, ease: 'expo.inOut' }, 0.05)
      .from(h1Words, { yPercent: 110, duration: 1.2, stagger: 0.07 }, 0.25)
      .from('.sign__room', { yPercent: 70, autoAlpha: 0, duration: 1.2 }, 0.85)
      .from(['.sign__what', '.sign__cap'], { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 1.0)
      .from('.hero .lead', { y: 24, autoAlpha: 0, duration: 1 }, 0.8)
      .from('.hero .actions > *', { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.95);

    // hero parallax: the sign drifts up inside its field, the head eases back
    gsap.to('.sign__room', { yPercent: -28, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__text', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // ---- section heads rise word by word
    document.querySelectorAll('.section .grid12 > h2, .studio__text h2, .contact h2').forEach((h) => {
      gsap.from(split(h), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: h, start: 'top 85%' } });
    });

    // ---- index rows
    gsap.from('.index thead th', { autoAlpha: 0, duration: 0.8, stagger: 0.05, scrollTrigger: { trigger: '.index', start: 'top 82%' } });
    gsap.from('.index tbody tr', { y: 28, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.index', start: 'top 80%' } });

    // ---- sheets wipe up from their base line, art settles inside
    gsap.utils.toArray('.sheet').forEach((sheet, i) => {
      const art = sheet.querySelector('.art');
      const tl = gsap.timeline({ scrollTrigger: { trigger: sheet, start: 'top 85%' }, delay: i * 0.12 });
      tl.from(art, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' })
        .from(art.children, { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }, 0.55)
        .from(sheet.querySelector('figcaption'), { y: 12, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0.7);
    });

    // ---- statement fills in as it is read
    const sWords = split(document.querySelector('.statement'));
    gsap.fromTo(sWords, { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.statement', start: 'top 80%', end: 'bottom 40%', scrub: true } });

    gsap.from('.services li', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.services', start: 'top 85%' } });

    // ---- process: numerals climb out of the baseline
    gsap.utils.toArray('.steps li').forEach((li, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.steps', start: 'top 80%' }, delay: i * 0.12 });
      tl.from(li.querySelector('.n'), { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 40, duration: 1.1, ease: 'expo.out' })
        .from(li.querySelectorAll('h3, p'), { y: 16, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0.3);
    });

    // ---- studio photo: wipe, then the print slowly settles while scrolling
    const photo = document.querySelector('.studio .photo');
    gsap.from(photo, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: photo, start: 'top 80%' } });
    const img = photo.querySelector('img');
    if (img) gsap.fromTo(img, { scale: 1.22 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.studio__text p', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.studio__text', start: 'top 85%' } });

    // ---- contact: the red field opens to the bleed, the address types itself out of the baseline
    gsap.fromTo('.contact', { clipPath: 'inset(10% 5% 10% 5%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 95%', end: 'top 35%', scrub: true } });
    const mailChars = split(document.querySelector('.contact .mail'), 'char');
    gsap.from(mailChars, { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.022, scrollTrigger: { trigger: '.contact .mail', start: 'top 88%' } });
    gsap.from('.contact p', { y: 16, autoAlpha: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.contact p', start: 'top 92%' } });

    gsap.from('.footer > *', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.footer', start: 'top 92%' } });

    // images that arrive late change the page height
    document.querySelectorAll('img').forEach((i) => i.complete || i.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }));

    return () => { lenis?.destroy(); bar.remove(); };
  });

  // reduced motion (or a switch to it mid-visit): show everything as authored
  if (!matchMedia('(prefers-reduced-motion: no-preference)').matches) root.classList.remove('js-motion');
})();
