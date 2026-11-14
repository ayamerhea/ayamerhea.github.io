/* NOVA */
const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* брейкпоинты: телефон — до 767px */
const mq = matchMedia('(max-width:767px)');
const isMob = () => mq.matches;
const hooks = [];
mq.addEventListener('change', () => hooks.forEach(f => f()));
addEventListener('resize', () => hooks.forEach(f => f.always && f()));

/* шапка: на светлых блоках — тёмная подложка, при скролле вниз прячется */
(function () {
  const hdr = $('.hdr'), dark = $$('.hero, .dir__cards, .why__cards, .cta');
  let lastY = scrollY;
  const upd = () => {
    const y = scrollY, probe = 50;
    const onDark = dark.some(el => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe && (!el.matches('.dir__cards,.why__cards') || r.left < innerWidth * .5 && r.right > innerWidth * .5); });
    hdr.classList.toggle('is-light', !onDark);
    hdr.classList.toggle('is-hidden', y > 400 && y > lastY + 2);
    if (y < lastY - 2 || y < 400) hdr.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', upd, { passive: true }); upd();
})();

/* счётчики в первом экране */
(function () {
  const els = $$('[data-count]');
  const run = el => {
    const to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suf || '', t0 = performance.now();
    const step = t => {
      const k = clamp((t - t0) / 1600, 0, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .6 });
  els.forEach(el => io.observe(el));
})();

/* кейсы: бесконечный слайдер */
const CASES = [
  { img: 'img/case-2.webp', tag: 'блогер-инфлюенсер', name: '@truemargosha', a: 'концепция без аудитории', b: 'устойчивое комьюнити в лайфстайл-нише и первый бренд-контакт', r: [['+280%', 'рост аудитории'], ['8 недель', 'до контракта']] },
  { img: 'img/case-3.webp', tag: 'музыкант', name: '@nord_music', a: 'демо-трек и образ', b: 'релиз в плейлистах стриминговых сервисов', r: [['150К+', 'прослушиваний'], ['4 недели', 'до релиза']] },
  { img: 'img/case-1.webp', tag: 'блогер-инфлюенсер', name: '@mariaxelise', a: 'канал без чёткой темы', b: 'узнаваемый эксперт-блогер с платной подпиской в Telegram', r: [['+190%', 'рост аудитории'], ['6 недель', 'до контракта']] }
];
(function () {
  const track = $('.cases__track'), dots = $('.dots'), N = CASES.length;
  const card = c => `<article class="case"><div class="ph" style="--ph:url(${c.img})"></div><div class="case__panel glass">
    <p class="case__tag">${c.tag}</p><h3>${c.name}</h3><p>точка А: ${c.a}<br>точка Б: ${c.b}</p>
    <div class="case__res">${c.r.map(([v, t]) => `<div><b>${v}</b><span>${t}</span></div>`).join('')}</div></div></article>`;
  track.innerHTML = [0, 1, 2].map(() => CASES.map(card).join('')).join('');
  dots.innerHTML = CASES.map(() => '<i></i>').join('');
  const cards = $$('.case', track), D = $$('i', dots);
  let i = N; // стартуем со средней копии
  const wrap = track.parentElement;
  const geom = () => { const w = cards[0].offsetWidth; return { w, gap: 20, left: (wrap.clientWidth - w) / 2 }; };
  const place = (anim) => {
    const g = geom();
    track.style.transition = anim ? '' : 'none';
    track.style.transform = `translate3d(${g.left - i * (g.w + g.gap)}px,0,0)`;
    cards.forEach((c, k) => c.classList.toggle('is-on', k === i));
    D.forEach((d, k) => d.classList.toggle('is-on', k === ((i % N) + N) % N));
    if (!anim) { track.offsetHeight; track.style.transition = ''; }
  };
  const go = d => { i += d; place(true); };
  track.addEventListener('transitionend', e => {
    if (e.target !== track) return;
    if (i < N) { i += N; place(false); } else if (i >= 2 * N) { i -= N; place(false); }
  });
  $('.cases__arr--prev').addEventListener('click', () => go(-1));
  $('.cases__arr--next').addEventListener('click', () => go(1));
  D.forEach((d, k) => d.addEventListener('click', () => { i = N + k; place(true); }));
  // свайп: направление определяется в начале жеста; горизонтальный — двигает только кейсы
  let x0 = null, y0 = 0, dx = 0, lock = null, base = 0;
  const cur = () => { const g = geom(); return g.left - i * (g.w + g.gap); };
  wrap.addEventListener('touchstart', e => {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; lock = null; base = cur();
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    if (x0 === null) return;
    const mx = e.touches[0].clientX - x0, my = e.touches[0].clientY - y0;
    if (!lock) { if (Math.abs(mx) < 6 && Math.abs(my) < 6) return; lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'; }
    if (lock !== 'x') return;
    e.preventDefault();
    dx = mx;
    track.style.transition = 'none';
    track.style.transform = `translate3d(${base + dx}px,0,0)`;
  }, { passive: false });
  const end = () => {
    if (x0 === null) return;
    if (lock === 'x') { track.style.transition = ''; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); else place(true); }
    x0 = null; lock = null;
  };
  wrap.addEventListener('touchend', end, { passive: true });
  wrap.addEventListener('touchcancel', end, { passive: true });
  place(false);
  const re = () => place(false); re.always = true; hooks.push(re);
})();

/* форма */
(function () {
  const f = $('.form');
  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', f).forEach(el => {
      const bad = el.type === 'checkbox' ? !el.checked : !el.value.trim();
      (el.type === 'checkbox' ? el.closest('.check') : el).classList.toggle('is-err', bad);
      if (bad) ok = false;
    });
    if (ok) f.classList.add('is-done');
  });
  f.addEventListener('input', e => e.target.classList.remove('is-err'));
  f.addEventListener('change', e => e.target.closest('.check') && e.target.closest('.check').classList.remove('is-err'));
})();

/* появление */
(function () {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el, k) => { const sib = el.parentElement.children; const n = [...sib].indexOf(el); if (el.matches('.pcard,.step,.wcard')) el.style.transitionDelay = (n % 4) * .08 + 's'; io.observe(el); });
})();

/* плавный скролл и якоря */
let lenis = null;
if (window.Lenis && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  lenis = new Lenis({ lerp: .1 });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href'); if (id.length < 2) { e.preventDefault(); return; }
  const t = $(id); if (!t) return;
  e.preventDefault();
  const y = t.getBoundingClientRect().top + scrollY - (id !== '#top' && isMob() ? 20 : 0);
  if (lenis) lenis.scrollTo(y, { duration: 1.3 }); else scrollTo({ top: y, behavior: 'smooth' });
});

/* мобильное меню */
(function () {
  const btn = $('.burger'), menu = $('.mmenu');
  const set = open => {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  btn.addEventListener('click', () => set(!root.classList.contains('menu-open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  mq.addEventListener('change', () => { if (!mq.matches) set(false); });
})();
