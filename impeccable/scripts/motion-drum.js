// Drum machine motion: the panel powers on, a chase light runs the step row as you scroll, readouts scramble into place.
Motion.run(({ gsap, ScrollTrigger, split }) => {
  const css = document.createElement('style');
  css.textContent = `
    .key.is-chase .led { background: #fff6e8; box-shadow: 0 0 0 3px rgb(255 246 232 / 0.35); }
    .key.is-chase .cap { filter: brightness(1.18); }
    .mini i.is-hit { background: #fff6e8 !important; }`;
  document.head.append(css);

  const keys = [...document.querySelectorAll('.machine .key')];
  const leds = keys.map((k) => k.querySelector('.led'));
  const caps = keys.map((k) => k.querySelector('.cap'));

  // scramble a seven-segment readout to its real value
  const scramble = (el, duration = 0.9) => {
    const final = el.textContent;
    const o = { t: 0 };
    return gsap.to(o, {
      t: 1, duration, ease: 'none',
      onUpdate: () => { el.textContent = o.t < 1 ? final.replace(/\d/g, () => Math.floor(Math.random() * 10)) : final; },
      onComplete: () => { el.textContent = final; },
    });
  };

  // ---- power on
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .from('.top', { y: -20, autoAlpha: 0, duration: 0.6 })
    .from(split(document.querySelector('.hero h1')), { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.1)
    .from('.hero .lead', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.4)
    .from('.hero .actions > *', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.55)
    .from('.machine', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.2)
    .from(caps, { yPercent: -60, autoAlpha: 0, duration: 0.5, stagger: 0.035, ease: 'back.out(2)' }, 0.6)
    .from('.bank', { scale: 0.6, autoAlpha: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(2)' }, 0.8)
    .add(() => { scramble(document.querySelector('[data-year]')); scramble(document.querySelector('[data-pat]'), 0.7); }, 0.9)
    .fromTo(leds, { opacity: 0.15 }, { opacity: 1, duration: 0.12, stagger: 0.05 }, 1.0);

  // ---- the chase light runs the row while the hero and patterns scroll past
  let last = -1;
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', endTrigger: '#work', end: 'bottom bottom',
    onUpdate: (self) => {
      const i = Math.min(15, Math.floor((self.progress * 64) % 16));
      if (i === last) return;
      keys[last]?.classList.remove('is-chase');
      keys[i].classList.add('is-chase');
      last = i;
    },
    onLeave: () => keys[last]?.classList.remove('is-chase'),
    onLeaveBack: () => { keys[last]?.classList.remove('is-chase'); last = -1; },
  });

  // ---- section heads
  document.querySelectorAll('.head h2, .studio h2, .contact h2').forEach((h) => {
    gsap.from(split(h), { yPercent: 110, duration: 0.9, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: h, start: 'top 86%' } });
  });

  // ---- patterns: readout scrambles, plate wipes on, the mini strip plays its steps once
  gsap.utils.toArray('.pattern').forEach((p) => {
    const seg = p.querySelector('.seg');
    const cells = [...p.querySelectorAll('.mini i')];
    const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 80%' } });
    tl.add(() => scramble(seg, 0.6))
      .fromTo(p.querySelector('.art'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'steps(8)' }, 0)
      .from(p.querySelectorAll('.pattern__text > :not(.mini)'), { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.06 }, 0.2)
      .from(cells, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.25, stagger: 0.035, ease: 'power2.out' }, 0.35);
    cells.forEach((c, i) => tl.add(() => { c.classList.add('is-hit'); setTimeout(() => c.classList.remove('is-hit'), 140); }, 0.9 + i * 0.06));
  });

  // ---- process bars fill bar by bar with the scroll
  gsap.utils.toArray('.bars li').forEach((li, i) => {
    gsap.from(li.querySelectorAll('.barstrip i.on'), { scaleX: 0, transformOrigin: '0% 50%', ease: 'none', stagger: 0.2, scrollTrigger: { trigger: '.bars', start: `top ${80 - i * 4}%`, end: 'top 35%', scrub: true } });
    gsap.from(li.querySelectorAll('h3, p'), { y: 16, autoAlpha: 0, duration: 0.6, delay: i * 0.08, scrollTrigger: { trigger: '.bars', start: 'top 80%' } });
  });

  // ---- instruments: each colour square strikes like a pad
  gsap.from('.instrument', { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.instruments', start: 'top 82%' } });

  // ---- studio readouts and the close
  document.querySelectorAll('.studio .seg').forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 90%', once: true, onEnter: () => scramble(s, 1) }));
  gsap.from('.studio__panel p', { y: 16, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.studio__panel', start: 'top 85%' } });
  gsap.from(split(document.querySelector('.contact .mail'), 'char'), { yPercent: 110, duration: 0.6, stagger: 0.018, ease: 'power3.out', scrollTrigger: { trigger: '.contact .mail', start: 'top 90%' } });

  return () => { css.remove(); keys.forEach((k) => k.classList.remove('is-chase')); };
});
