/* EMBER AGENCY */
const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - t, 3);
const S = () => parseFloat(getComputedStyle(root).getPropertyValue('--s')) || 1;
const isMob = () => root.classList.contains('mob');
const nb = s => s.replace(/(^|[\s«(])(в|во|и|а|к|с|со|о|об|у|на|не|по|за|из|от|до|для|без|что|как|мы|я|ей|её|ее|то|же|ли|при|про|под|над)\s/gi, '$1$2 ').replace(/\s—/g, ' —');

/* ---------- прелоудер ---------- */
(function () {
  const pl = $('.preloader');
  const t0 = performance.now();
  let fired = false;
  const done = () => {
    if (fired) return; fired = true;
    setTimeout(() => {
      pl && pl.classList.add('is-done');
      root.classList.remove('is-loading');
      setTimeout(() => pl && pl.remove(), 900);
    }, Math.max(0, 700 - (performance.now() - t0)));
  };
  if (document.readyState === 'complete') done(); else addEventListener('load', done);
  setTimeout(done, 5000);
})();

/* ---------- автоскейл: десктоп = макет 1920, телефон/планшет = макет 440 ---------- */
const layoutHooks = [];
(function () {
  let last = null;
  const fit = () => {
    const w = root.clientWidth;
    const mob = w < 1024;
    const s = mob ? Math.min(w / 440, 1.6) : w / 1920;
    root.classList.toggle('mob', mob);
    root.style.setProperty('--s', String(Math.floor(s * 10000) / 10000));
    if (last !== mob) { last = mob; layoutHooks.forEach(f => f()); }
  };
  fit();
  addEventListener('resize', fit);
})();

/* видео первого экрана: своё для десктопа и мобилки */
(function () {
  const v = $('.hero__bg');
  if (!v) return;
  const set = () => {
    const src = isMob() ? 'img/hero-m.mp4' : 'img/hero.mp4';
    if (v.getAttribute('src') === src) return;
    v.poster = isMob() ? 'img/hero-m.webp' : 'img/hero.webp';
    v.src = src; v.muted = true;
    const p = v.play(); if (p) p.catch(() => {});
  };
  layoutHooks.push(set); set();
})();

/* попап и меню живут вне body, чтобы fixed не ломался внутри zoom (iOS) */
$$('.pop, .menu').forEach(el => root.appendChild(el));

/* ---------- первый экран: вход ---------- */
$$('.hero__nav, .hero__info, .hero__cta, .menu-btn, .corners--hero').forEach((el, i) => {
  el.classList.add('reveal-h');
  el.style.transitionDelay = (0.25 + i * 0.08) + 's';
});

/* ---------- веер красных лучей ---------- */
(function () {
  const g = $('#fan-g');
  if (!g) return;
  const S0 = [-255.439, 895.271], S1 = [353.667, 1060.52], E0 = [504.1, 46.08], E1 = [-497.339, 299.358];
  let d = '';
  for (let i = 0; i <= 21; i++) {
    const k = i / 21;
    const s = [S0[0] + (S1[0] - S0[0]) * k, S0[1] + (S1[1] - S0[1]) * k];
    const e = [E0[0] + (E1[0] - E0[0]) * k, E0[1] + (E1[1] - E0[1]) * k];
    const m = [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2];
    const len = Math.hypot(e[0] - s[0], e[1] - s[1]);
    const n = [-(e[1] - s[1]) / len * 2.6, (e[0] - s[0]) / len * 2.6];
    const f = v => v.toFixed(1);
    d += `M${f(s[0])} ${f(s[1])}L${f(m[0] + n[0])} ${f(m[1] + n[1])}L${f(e[0])} ${f(e[1])}L${f(m[0] - n[0])} ${f(m[1] - n[1])}Z`;
  }
  g.innerHTML = `<path d="${d}"/>`;
})();

/* ---------- бегущие строки ---------- */
const PHRASES = ['Имя должно звучать', 'Продакшн, который делает имя заметным', 'Мы собираем ажиотаж', 'Видимость — это власть', 'Ваш голос — в центре кадра', 'Не контент, а влияние', 'История, которую цитируют', 'Превращаем присутствие в влияние'];
const marquees = [];
$$('.strip').forEach((strip, n) => {
  const shift = [0, 5, 0, 2, 5][n] || 0;
  const list = PHRASES.slice(shift).concat(PHRASES.slice(0, shift));
  const html = list.map(p => `<span class="strip__item"><svg aria-hidden="true"><use href="#sep"/></svg>${p.replace(' — ', ' — ')}</span>`).join('');
  strip.innerHTML = `<div class="track"><div style="display:flex">${html}</div><div style="display:flex" aria-hidden="true">${html}</div></div>`;
  marquees.push({ track: $('.track', strip), dir: +strip.dataset.dir || -1, speed: 70, x: -n * 230 });
});
$$('.ticker__big').forEach((el, n) => marquees.push({ track: $('.track', el), dir: n ? 1 : -1, speed: 35, x: n ? -900 : 0 }));

let scrollVel = 0, lastY = scrollY;
(function loop(t0) {
  let prev = performance.now();
  const tick = now => {
    const dt = Math.min(64, now - prev) / 1000; prev = now;
    const y = scrollY; scrollVel = scrollVel * 0.9 + (y - lastY) * 0.1; lastY = y;
    const boost = 1 + Math.min(6, Math.abs(scrollVel) * 0.25);
    const dirFlip = scrollVel < -0.5 ? -1 : 1;
    marquees.forEach(m => {
      const w = m.track.scrollWidth / 2;
      if (!w) return;
      m.x += m.dir * dirFlip * m.speed * boost * dt;
      if (m.x <= -w) m.x += w;
      if (m.x > 0) m.x -= w;
      m.track.style.transform = `translate3d(${m.x}px,0,0)`;
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

/* ---------- Наша исключительность ---------- */
const EXCL = [
  { img: 'img/excl-1.webp', lines: [['Мы не живём', 0], ['трендами', 171]], desc: 'Не повторяем форматы — собираем ваш собственный визуальный язык и узнаваемый стиль' },
  { img: 'img/excl-2.webp', lines: [['Мы работаем', 0], ['на влияние', 171]], desc: 'Чтобы вас обсуждали, сохраняли, цитировали — и покупали' },
  { img: 'img/excl-3.webp', lines: [['Вам не нужно', 0], ['становиться', 122], ['блогером', 0]], desc: 'Мы строим присутствие так, чтобы оно работало даже без сторис «24/7»' },
  { img: 'img/excl-4.webp', lines: [['Позиционирование', 0], ['с характером', 175]], desc: 'Упаковка и смысл, которые держат статус: в кадре, в тексте, в инфополе' },
  { img: 'img/excl-5.webp', lines: [['Продакшн', 0], ['полного цикла', 110]], desc: 'От идеи и сценария до съёмки, монтажа, графики и публикаций по плану' },
  { img: 'img/excl-6.webp', lines: [['Команда', 0], ['за кулисами', 118]], desc: 'Стратегия, продюсирование, PR/дистрибуция и речевая подача — в одной связке' }
];
(function () {
  const imgs = $('.excl__imgs'), texts = $('.excl__texts'), count = $('.excl__count b');
  imgs.innerHTML = EXCL.map(s => `<div class="excl__img" style="background-image:url(${s.img})"></div>`).join('');
  texts.innerHTML = EXCL.map((s, i) => `<div class="excl__slide" aria-hidden="true">
    <p class="excl__num">${String(i + 1).padStart(2, '0')}</p>
    <div class="excl__lines">${s.lines.map(([t, x]) => `<span data-x="${x}">${t}</span>`).join('')}</div>
    <p class="excl__desc indent">${nb(s.desc)}</p></div>`).join('');
  const I = $$('.excl__img', imgs), T = $$('.excl__slide', texts);
  // отступы строк: на десктопе из макета, на мобилке — 87px у второй строки
  const indents = () => T.forEach(sl => $$('.excl__lines span', sl).forEach((sp, j) => {
    const x = +sp.dataset.x;
    sp.style.marginLeft = (isMob() ? (x ? 87 : 0) : x) + 'px';
  }));
  layoutHooks.push(indents); indents();
  let cur = -1;
  const go = n => {
    n = (n + EXCL.length) % EXCL.length;
    if (n === cur) return;
    I.forEach((el, i) => el.classList.toggle('is-on', i === n));
    T.forEach((el, i) => { el.classList.toggle('is-on', i === n); el.setAttribute('aria-hidden', i !== n); });
    if (count) count.textContent = String(n + 1).padStart(2, '0');
    cur = n;
  };
  go(0);
  $('.excl .arr--prev').addEventListener('click', () => go(cur - 1));
  $('.excl .arr--next').addEventListener('click', () => go(cur + 1));
  swipe($('.excl'), d => go(cur + d));
})();

function swipe(el, cb) {
  let x0 = null, y0 = 0;
  el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) cb(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });
}

/* ---------- Стратегия: карточки складываются стопкой при скролле ---------- */
const CARDS = [
  ['Пролог', 'Диагностика', 'фиксируем цель, аудиторию, «почему вам верят», точки роста и ограничения по времени/участию'],
  ['Акт I', 'Концепт', 'формируем образ, тон, темы и рубрики, собираем контент-архитектуру и сценарные линии'],
  ['Акт II', 'Продакшн', 'создаём контент-пакет: съёмка/монтаж/графика/тексты/упаковка профилей и площадок'],
  ['Финал', 'Дистрибуция', 'публикации по системе + PR-касания: коллабы, медиа, партнёрства, цитируемость'],
  ['Пост-продакшн', 'Цифры и усиление', 'отчётность, выводы, корректировки, усиление работающих связок, рост входящих']
];
(function () {
  const sec = $('.strat'), pin = $('.strat__pin'), deck = $('.strat__deck');
  deck.innerHTML = CARDS.map(([l, t, d]) => `<div class="card"><span class="corners" aria-hidden="true"><i></i><i></i><i></i><i></i></span><div class="card__in">
    <p class="card__label">${l}</p><h3 class="card__title">${t}</h3><svg class="card__ico" aria-hidden="true"><use href="#focus"/></svg><p class="card__text">${nb(d)}</p></div></div>`).join('');
  const cards = $$('.card', deck);
  const n = cards.length;
  const setStick = () => {
    const s = S(), vh = innerHeight / s, H = pin.offsetHeight;
    const center = isMob() ? 534 : 660;
    pin.style.setProperty('--stick', clamp(vh / 2 - center, Math.min(0, vh - H), 0) + 'px');
  };
  const update = () => {
    const s = S();
    const r = sec.getBoundingClientRect();
    const stick = parseFloat(pin.style.getPropertyValue('--stick')) || 0;
    const range = r.height - pin.offsetHeight * s;
    const p = clamp((stick * s - r.top) / range, 0, 1);
    const P = clamp(p / 0.88, 0, 1) * (n - 1);
    let top = 0;
    cards.forEach((c, i) => {
      const rot = i % 2 ? 5 : -5;
      if (i === 0) { c.style.transform = `rotate(${rot}deg)`; return; }
      const k = clamp(P - (i - 1), 0, 1), e = ease(k);
      if (k > 0.5) top = i;
      const y = (1 - e) * (isMob() ? 900 : 1150);
      c.style.transform = `translate3d(0,${y}px,0) rotate(${rot + (1 - e) * rot * 3}deg)`;
      c.style.visibility = k <= 0 ? 'hidden' : '';
    });
  };
  setStick(); update();
  addEventListener('resize', () => { setStick(); update(); });
  layoutHooks.push(() => { setStick(); update(); });
  addEventListener('scroll', update, { passive: true });
  window.__stratUpdate = update;
})();

/* ---------- Наш результат: аккордеон ---------- */
const ACC = [
  ['Стратегия и позиционирование', 'Собрали смысловую опору проекта: роль на рынке, тон коммуникации, ключевые месседжи и темы, вокруг которых строится контент'],
  ['Контент-архитектура', 'Разложили контент на рубрики и форматы: что говорим, где и с какой частотой — чтобы каждая публикация работала на позиционирование'],
  ['Визуальный язык', 'Собрали узнаваемый стиль: свет, цвет, типографику и подачу в кадре — имя считывается раньше, чем прочитана подпись'],
  ['Продакшн-пакет', 'Отсняли и смонтировали контент на несколько месяцев вперёд: съёмки, графика, тексты и упаковка профилей в одном цикле'],
  ['Дистрибуция и точки роста', 'Вывели контент за пределы своих площадок: коллаборации, медиа и партнёрства, которые приводят новую аудиторию'],
  ['План запуска', 'Расписали запуск по неделям: прогрев, пиковые точки и аналитика — чтобы рост был управляемым и повторяемым']
];
(function () {
  const acc = $('.acc');
  acc.innerHTML = ACC.map(([t, d], i) => `<div class="acc__item${i ? '' : ' is-open'}">
    <button class="acc__head" type="button" aria-expanded="${!i}"><span class="acc__num">${String(i + 1).padStart(2, '0')}</span><span class="acc__title">${t}</span><svg class="px-arrow" aria-hidden="true"><use href="#px-arrow"/></svg></button>
    <div class="acc__body"><div><div class="acc__content"><p>${nb(d)}</p><a class="cta" href="#" data-lead><span class="roll" data-text="сделать имя видимым">сделать имя видимым</span> <svg class="px-arrow"><use href="#px-arrow"/></svg></a></div></div></div></div>`).join('');
  $$('.acc__item', acc).forEach(item => $('.acc__head', item).addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    $$('.acc__item', acc).forEach(o => { o.classList.remove('is-open'); $('.acc__head', o).setAttribute('aria-expanded', false); });
    if (open) { item.classList.add('is-open'); $('.acc__head', item).setAttribute('aria-expanded', true); }
    setTimeout(() => window.lenis && lenis.resize(), 650);
  }));
})();

/* ---------- Прецеденты ---------- */
const CASES = [
  { img: 'img/excl-4.webp', tag: 'личный бренд', name: 'Nocturne', text: 'Медийная упаковка архитектора интерьеров: серия коротких фильмов о процессе, интервью для отраслевых медиа и запуск авторской рубрики.', stats: [['Охват', '+340%'], ['Входящие заявки', '×2,5'], ['Срок', '3 месяца']] },
  { img: 'img/excl-1.webp', tag: 'reels-серия', name: 'Arcana', text: 'Визуальная история ювелирного дома: сценарии, съёмка в Дубае и Москве, монтаж и дистрибуция через коллаборации с медиа.', stats: [['Просмотры', '12,4 млн'], ['Сохранения', '86 тыс.'], ['Срок', '2 месяца']] },
  { img: 'img/excl-6.webp', tag: 'эксперт', name: 'Velvet hour', text: 'Позиционирование психолога-консультанта: тон коммуникации, контент-архитектура и подкаст, который цитируют в профильных каналах.', stats: [['Подписчики', '+48 тыс.'], ['Конверсия в запись', '7,8%'], ['Срок', '4 месяца']] }
];
(function () {
  const track = $('.cases__track');
  track.innerHTML = CASES.map((c, i) => `<a class="reel${i === 1 ? ' is-main' : ''}" href="#" data-case="${i}" aria-label="Кейс ${c.name}">
    <span class="corners" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="reel__img"><img src="${c.img}" alt="" loading="lazy"></span><span class="reel__watch">watch</span></a>`).join('');
  // параллакс на десктопе
  const reels = $$('.reel', track), sec = $('.cases');
  const par = () => {
    if (isMob()) { reels.forEach(r => r.style.transform = ''); return; }
    const r = sec.getBoundingClientRect(), vh = innerHeight;
    const k = clamp((vh - r.top) / (vh + r.height), 0, 1) - 0.5;
    reels.forEach((el, i) => el.style.transform = `translate3d(0,${k * [-160, 120, -260][i]}px,0)`);
  };
  addEventListener('scroll', par, { passive: true }); layoutHooks.push(par); par();
  // мобилка: начинаем с центрального ролика
  layoutHooks.push(() => { if (isMob()) requestAnimationFrame(() => { track.scrollLeft = (track.scrollWidth - track.clientWidth) / 2; }); });
  if (isMob()) requestAnimationFrame(() => { track.scrollLeft = (track.scrollWidth - track.clientWidth) / 2; });
})();

/* ---------- ДНК ---------- */
const DNA = [
  ['Измеримый эффект', 'Работаю с проектами, где <b>результат считается в спросе:</b> входящие запросы, рост узнаваемости, повышение доверия и конверсия в продажи'],
  ['Строю публичный капитал', 'Выстраиваю образ и репутацию так, чтобы вас выбирали быстрее: узнаваемый почерк, правильная роль в нише, <b>попадание в Top-of-Mind</b>'],
  ['Контент как актив', '<b>Не «постинг», а медиа-система:</b> контент усиливает позиционирование и становится инструментом продаж'],
  ['Работаю с лидерами', '<b>Там, где важны статус, доверие и влияние:</b> предприниматели, эксперты, публичные персоны, продукты с высокой ценностью'],
  ['5 лет практики в маркетинге', 'Запуски, упаковка и <b>системный контент-продакшн:</b> от смысла и позиционирования до релиза и дистрибуции']
];
(function () {
  const box = $('.dna__slides');
  box.innerHTML = DNA.map(([t, d]) => `<div class="dna__slide" aria-hidden="true"><h3>${t}</h3><p>${nb(d)}</p></div>`).join('');
  const sl = $$('.dna__slide', box);
  let cur = -1;
  const go = n => {
    n = (n + sl.length) % sl.length;
    sl.forEach((el, i) => { el.classList.toggle('is-on', i === n); el.setAttribute('aria-hidden', i !== n); });
    cur = n;
  };
  go(0);
  $('.dna .arr--prev').addEventListener('click', () => go(cur - 1));
  $('.dna .arr--next').addEventListener('click', () => go(cur + 1));
  swipe(box.parentElement, d => go(cur + d));
})();

/* ---------- попап: кейс и заявка ---------- */
(function () {
  const pop = $('.pop'), media = $('.pop__media'), info = $('.pop__info');
  const open = () => { pop.classList.add('is-open'); pop.setAttribute('aria-hidden', false); window.lenis && lenis.stop(); root.style.overflow = 'hidden'; };
  const close = () => { pop.classList.remove('is-open'); pop.setAttribute('aria-hidden', true); window.lenis && lenis.start(); root.style.overflow = ''; };
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-case]');
    const l = e.target.closest('[data-lead]');
    if (c) {
      e.preventDefault();
      const d = CASES[+c.dataset.case];
      media.style.display = '';
      media.innerHTML = `<img src="${d.img}" alt="">`;
      info.innerHTML = `<small>${d.tag}</small><h3>${d.name}</h3><p>${nb(d.text)}</p><ul>${d.stats.map(([a, b]) => `<li><span>${a}</span><b>${b}</b></li>`).join('')}</ul>`;
      open();
    } else if (l) {
      e.preventDefault();
      media.style.display = 'none';
      info.innerHTML = `<small>заявка</small><h3>Сделать имя видимым</h3>
        <form class="lead"><label><span>Имя</span><input name="name" required autocomplete="name"></label>
        <label><span>Телефон или Telegram</span><input name="contact" required></label>
        <label><span>О проекте</span><input name="about"></label>
        <button class="cta" type="submit"><span class="roll" data-text="отправить">отправить</span> <svg class="px-arrow"><use href="#px-arrow"/></svg></button>
        <p class="lead__done">Спасибо! Продюсер свяжется с вами в течение дня.</p></form>`;
      $('.lead', info).addEventListener('submit', ev => { ev.preventDefault(); ev.target.classList.add('is-done'); });
      open();
    }
  });
  $('.pop__close').addEventListener('click', close);
  pop.addEventListener('click', e => { if (e.target === pop) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { close(); menuClose(); } });
})();

/* ---------- меню (мобилка) ---------- */
const menu = $('.menu');
function menuClose() { menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', true); root.style.overflow = ''; }
$('.menu-btn').addEventListener('click', () => { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', false); root.style.overflow = 'hidden'; });
$('.menu__close').addEventListener('click', menuClose);

/* ---------- якоря ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.hasAttribute('data-case') || a.hasAttribute('data-lead')) return;
  const id = a.getAttribute('href');
  if (id === '#') { e.preventDefault(); return; }
  const t = $(id);
  if (!t) return;
  e.preventDefault();
  menuClose();
  const y = t.getBoundingClientRect().top + scrollY;
  if (window.lenis) lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: 'smooth' });
});

/* ---------- появление при скролле ---------- */
(function () {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
})();

/* ---------- плавный скролл (десктоп) ---------- */
if (window.Lenis && matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  window.lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
