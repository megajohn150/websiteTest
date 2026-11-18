// Origami motion: the crane folds itself together, creases are drawn, and the process sheet folds as you scroll.
Motion.run(({ gsap, ScrollTrigger, split }) => {
  // ---- crane: replace the <use> with real polygons so each facet can fold in
  const craneSvg = document.querySelector('.hero__sheet .crane');
  const src = document.getElementById('crane');
  let facets = [];
  if (craneSvg && src) {
    craneSvg.innerHTML = '';
    const g = src.cloneNode(true);
    g.removeAttribute('id');
    craneSvg.append(g);
    facets = [...g.querySelectorAll('polygon')];
  }

  // creases draw in from their length
  const creases = [...document.querySelectorAll('.hero__sheet .crease rect, .hero__sheet .crease path')];
  creases.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });

  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('.nav', { y: -20, autoAlpha: 0, duration: 0.8 })
    .to(creases, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.04 }, 0.1)
    .from(split(document.querySelector('.hero h1')), { yPercent: 110, duration: 1.2, stagger: 0.07 }, 0.2)
    .from('.hero .lead', { y: 24, autoAlpha: 0, duration: 1 }, 0.55)
    .from('.hero .btn', { y: 20, autoAlpha: 0, duration: 0.9 }, 0.7)
    .from(facets, { scale: 0, rotation: (i) => (i % 2 ? 40 : -40), transformOrigin: '50% 50%', autoAlpha: 0, duration: 1.1, ease: 'back.out(1.6)', stagger: { each: 0.06, from: 'center' } }, 0.6)
    .from('.margin li', { x: 24, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.9)
    .from('.margin .dot', { y: -30, scale: 0, duration: 0.9, ease: 'bounce.out' }, 1.4);

  // the crane lifts off its sheet as the hero scrolls away
  gsap.to(craneSvg, { yPercent: -18, rotation: -4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // ---- section heads
  document.querySelectorAll('.section__head h2, .studio h2, .close h2').forEach((h) => {
    gsap.from(split(h), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  gsap.utils.toArray('.section__head p').forEach((p) => gsap.from(p, { y: 16, autoAlpha: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 88%' } }));

  // ---- work: each piece unfolds from its top-left corner like a sheet opened out
  gsap.utils.toArray('.work').forEach((w) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: w, start: 'top 80%' } });
    tl.from(w.querySelector('.num'), { yPercent: 80, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
      .fromTo(w.querySelector('.art'), { clipPath: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)' }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1.3, ease: 'expo.inOut' }, 0)
      .from(w.querySelectorAll('.work__text > *'), { y: 18, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 }, 0.5);
  });

  // ---- process: on wide screens the sheet pins and folds through its four states as you scroll
  const steps = [...document.querySelectorAll('.steps button')];
  const stage = document.querySelector('.stage');
  let shown = 0;
  const foldTo = (n) => {
    if (n === shown || typeof show !== 'function') return;
    shown = n;
    show(n); // the page's own stepper keeps state, buttons and aria in sync
    const svg = stage.querySelector('[data-state].is-shown');
    gsap.fromTo(svg, { scale: 0.86, rotation: -8, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.4)', transformOrigin: '50% 50%' });
  };
  steps.forEach((b) => b.addEventListener('click', () => { shown = +b.dataset.step; }));
  document.querySelectorAll('[data-move]').forEach((b) => b.addEventListener('click', () => { const s = document.querySelector('.steps [aria-current="step"]'); shown = s ? +s.dataset.step : shown; }));

  const wide = gsap.matchMedia();
  wide.add('(min-width: 64rem)', () => {
    foldTo(1);
    ScrollTrigger.create({
      trigger: '#folds', start: 'top top', end: () => `+=${window.innerHeight * 1.8}`, pin: true,
      onUpdate: (self) => foldTo(Math.min(4, 1 + Math.floor(self.progress * 4))),
    });
  });
  wide.add('(max-width: 63.99rem)', () => {
    gsap.from('.steps li', { x: 20, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
  });

  // ---- disciplines: the four panels unfold out of one creased sheet
  gsap.set('.panels', { perspective: 1400 });
  const panelFrom = [
    { rotationY: 90, transformOrigin: '100% 50%' },
    { rotationY: -90, transformOrigin: '0% 50%' },
    { rotationX: -90, transformOrigin: '50% 0%' },
    { rotationX: -90, transformOrigin: '50% 0%' },
  ];
  gsap.utils.toArray('.panels > div').forEach((p, i) => {
    gsap.from(p, { ...panelFrom[i], autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: i * 0.12, scrollTrigger: { trigger: '.panels', start: 'top 80%' } });
  });

  // ---- studio and close
  gsap.from('.studio__text > *', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.studio__text', start: 'top 85%' } });
  gsap.from('.studio .booking .dot', { scale: 0, duration: 0.8, ease: 'back.out(3)', scrollTrigger: { trigger: '.studio .booking', start: 'top 90%' } });
  gsap.from(split(document.querySelector('.close .mail'), 'char'), { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.02, scrollTrigger: { trigger: '.close .mail', start: 'top 90%' } });
  gsap.from('.close p', { y: 16, autoAlpha: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.close p', start: 'top 92%' } });

  return () => wide.revert();
});
