// Identity manual motion: the cover is printed, each sheet turns up out of the binder, specs fill in row by row.
Motion.run(({ gsap, split }) => {
  // ---- cover
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('.cover__mark', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'expo.inOut' })
    .from('.cover__mark', { scaleY: 0.08, transformOrigin: '50% 0%', duration: 0.7, ease: 'expo.inOut' }, 0.6)
    .from('.cover__nav > *', { y: -12, autoAlpha: 0, duration: 0.7, stagger: 0.06 }, 0.3)
    .from(split(document.querySelector('.cover h1')), { yPercent: 110, duration: 1.1, stagger: 0.07 }, 0.7)
    .from('.cover .lead', { y: 20, autoAlpha: 0, duration: 0.9 }, 1.0)
    .from('.cover .btn', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.1)
    .fromTo('.cover__foot', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, 0.9)
    .from('.tabs li', { x: 40, autoAlpha: 0, duration: 0.6, stagger: 0.07, ease: 'back.out(1.6)' }, 1.0);

  // ---- every later sheet turns up out of the binder as it arrives
  gsap.utils.toArray('.sheet:not(#s0)').forEach((sheet) => {
    gsap.fromTo(sheet,
      { rotationX: 10, y: 90, transformPerspective: 1400, transformOrigin: '50% 0%', autoAlpha: 0.35 },
      { rotationX: 0, y: 0, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top 65%', scrub: 0.6 } });
    const head = sheet.querySelector('.runhead');
    if (head) gsap.fromTo(head, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut', scrollTrigger: { trigger: head, start: 'top 88%' } });
  });

  // ---- section titles
  document.querySelectorAll('.title').forEach((t) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 85%' } });
    tl.from(t.querySelector('.n'), { xPercent: -40, autoAlpha: 0, duration: 0.8 })
      .from(split(t.querySelector('h2')), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06 }, 0.1);
    const p = t.querySelector('p');
    if (p) tl.from(p, { y: 12, autoAlpha: 0, duration: 0.7 }, 0.35);
  });

  // ---- spec pages: artwork printed down from the head, the rules table fills row by row, swatches drop in
  gsap.utils.toArray('.spec').forEach((s) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 78%' } });
    tl.fromTo(s.querySelector('.art'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' })
      .from(s.querySelectorAll('h3, .sub'), { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out' }, 0.3)
      .from(s.querySelectorAll('dt, dd'), { x: -12, autoAlpha: 0, duration: 0.5, stagger: 0.04, ease: 'expo.out' }, 0.45)
      .from(s.querySelectorAll('.sw i'), { scale: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, 0.8);
  });

  // ---- applications, procedure, studio
  gsap.from('.apps tbody tr', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.apps', start: 'top 82%' } });
  gsap.from('.procedure li', { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.procedure', start: 'top 85%' } });
  gsap.from('.studio .big', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.studio', start: 'top 82%' } });
  gsap.from('.studio dt, .studio dd', { x: -12, autoAlpha: 0, duration: 0.5, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: '.studio dl', start: 'top 85%' } });

  // ---- the red contact sheet is printed up from its foot
  gsap.fromTo('#s5', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '#s5', start: 'top 95%', end: 'top 45%', scrub: true } });
  gsap.from(split(document.querySelector('#s5 h2')), { yPercent: 110, duration: 1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: '#s5 h2', start: 'top 85%' } });
  gsap.from(split(document.querySelector('#s5 .mail'), 'char'), { yPercent: 110, duration: 0.8, stagger: 0.02, ease: 'expo.out', scrollTrigger: { trigger: '#s5 .mail', start: 'top 90%' } });
});
