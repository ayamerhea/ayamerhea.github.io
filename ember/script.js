/* EMBER AGENCY */
const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - t, 3);
const S = () => parseFloat(getComputedStyle(root).getPropertyValue('--s')) || 1;
const isMob = () => root.classList.contains('mob');
const NB_WORDS = 'в|во|и|а|к|ко|с|со|о|об|обо|у|на|не|ни|по|за|из|от|до|для|без|что|как|мы|я|ей|её|ее|то|же|ли|бы|при|про|под|над|или|но|да|их|его|её|все|это|вы|вас|вам|он|она|они|кто';
const NB_RE = new RegExp('(^|[\\s\\u00A0«(„"/])(' + NB_WORDS + ')\\s+(?=\\S)', 'gi');
const nb = s => s.replace(NB_RE, '$1$2 ').replace(NB_RE, '$1$2 ').replace(/\s+—/g, ' —').replace(/(\d)\s+(?=[a-zа-яё%])/gi, '$1 ');
function typo(el) {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => /SCRIPT|STYLE/.test(n.parentNode.nodeName) ? 2 : 1 });
  const list = []; while (w.nextNode()) list.push(w.currentNode);
  list.forEach(n => { const v = nb(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
}

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
  let last = null, lastW = 0;
  const fit = () => {
    const w = root.clientWidth;
    const mob = w < 1024;
    const s = mob ? Math.min(w / 440, 1.6) : w / 1920;
    root.classList.toggle('mob', mob);
    root.style.setProperty('--s', String(Math.floor(s * 10000) / 10000));
    // высота экрана в пикселях макета; на телефоне — только при смене ширины (адресная строка не дёргает блоки)
    if (!mob || w !== lastW) root.style.setProperty('--vh', (innerHeight / s).toFixed(1) + 'px');
    lastW = w;
    if (last !== mob) { last = mob; layoutHooks.forEach(f => f()); }
  };
  fit();
  addEventListener('resize', () => { fit(); layoutHooks.forEach(f => f.onResize && f()); });
})();

/* видео первого экрана: своё для десктопа и мобилки */
(function () {
  const v = $('.hero__bg');
  if (!v) return;
  const set = () => {
    const src = isMob() ? 'img/hero-m.mp4?v=11121112' : 'img/hero.mp4?v=11121112';
    if (v.getAttribute('src') === src) return;
    v.poster = isMob() ? 'img/hero-m.webp?v=11121112' : 'img/hero.webp?v=11121112';
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

/* ---------- свет: лучи появляются по очереди, текст постепенно белеет ---------- */
(function () {
  const S0 = [-255.439, 895.271], S1 = [353.667, 1060.52], E0 = [504.1, 46.08], E1 = [-497.339, 299.358];
  let html = '';
  for (let i = 0; i <= 21; i++) {
    const k = i / 21, f = v => v.toFixed(1);
    const a = [S0[0] + (S1[0] - S0[0]) * k, S0[1] + (S1[1] - S0[1]) * k];
    const b = [E0[0] + (E1[0] - E0[0]) * k, E0[1] + (E1[1] - E0[1]) * k];
    html += `<path class="ray" pathLength="1" d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}"/>`;
  }
  $$('.fan').forEach(svg => svg.innerHTML = html);
  const rays = $$('.fan').map(svg => $$('.ray', svg));
  const sec = $('.light'), txt = $('.light__text'), gray = $('.light__text span');
  // весь текст — по словам; заливка белым идёт по скроллу в обе стороны
  const lead = txt.firstChild.nodeValue;
  txt.innerHTML = (lead + gray.textContent).split(/(\s+)/).map(w => /\S/.test(w) ? `<i class="w">${w}</i>` : w).join('');
  const words = $$('.w', txt);
  const upd = () => {
    const r = sec.getBoundingClientRect(), vh = innerHeight;
    const pr = clamp((vh - r.top) / (vh * 0.9), 0, 1);
    rays.forEach(list => list.forEach((ray, i) => ray.classList.toggle('is-on', pr * 1.15 > i / list.length)));
    const tr = txt.getBoundingClientRect();
    // старт: верх текста у низа экрана; финиш: низ текста на трети экрана
    const pt = clamp((vh * 0.95 - tr.top) / (vh * 0.95 - vh * 0.33 + tr.height), 0, 1);
    const n = words.length;
    words.forEach((w, i) => {
      const t = clamp(pt * (n + 2) - i, 0, 1);
      w.style.color = `rgba(235,235,235,${(0.25 + 0.75 * t).toFixed(3)})`;
    });
  };
  addEventListener('scroll', upd, { passive: true }); upd();
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
      if (!m.hold) m.x += m.dir * dirFlip * m.speed * boost * dt;
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
  const sec = $('.strat'), pin = $('.strat__pin'), box = $('.strat__box'), deck = $('.strat__deck');
  deck.innerHTML = CARDS.map(([l, t, d]) => `<div class="card"><span class="corners" aria-hidden="true"><i></i><i></i><i></i><i></i></span><div class="card__in">
    <p class="card__label">${l}</p><h3 class="card__title">${t}</h3><svg class="card__ico" aria-hidden="true"><use href="#focus"/></svg><p class="card__text">${nb(d)}</p></div></div>`).join('');
  const cards = $$('.card', deck);
  const n = cards.length;
  // блок занимает экран целиком, композиция макета вписывается в высоту экрана
  const fitBox = () => {
    const H = innerHeight / S(), D = isMob() ? 956 : 1303;
    const k = Math.min(1, H / D);
    box.style.transform = `translate(-50%,-50%) scale(${k})`;
  };
  const update = () => {
    const s = S();
    const r = sec.getBoundingClientRect();
    const range = r.height - pin.offsetHeight * s;
    const p = clamp(-r.top / range, 0, 1);
    // сначала блок без карточек (текст читается), затем карточки ложатся по одной
    const P = clamp((p - 0.1) / 0.8, 0, 1) * n;
    cards.forEach((c, i) => {
      const rot = i % 2 ? 5 : -5;
      c.style.setProperty('--dim', (clamp(P - i - 1, 0, 1.6) * 0.28).toFixed(3));
      const k = clamp(P - i, 0, 1), e = ease(k);
      const y = (1 - e) * (isMob() ? 900 : 1150);
      c.style.transform = `translate3d(0,${y}px,0) rotate(${rot + (1 - e) * rot * 3}deg)`;
      c.style.visibility = k <= 0 ? 'hidden' : '';
    });
  };
  fitBox(); update();
  addEventListener('resize', () => { fitBox(); update(); });
  layoutHooks.push(() => { fitBox(); update(); });
  addEventListener('scroll', update, { passive: true });
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
  { img: 'img/case-1.webp', tag: 'личный бренд', name: 'Nocturne', text: 'Медийная упаковка архитектора интерьеров: серия коротких фильмов о процессе, интервью для отраслевых медиа и запуск авторской рубрики.', stats: [['Охват', '+340%'], ['Входящие заявки', '×2,5'], ['Срок', '3 месяца']] },
  { img: 'img/case-2.webp', tag: 'reels-серия', name: 'Arcana', text: 'Визуальная история ювелирного дома: сценарии, съёмка в Дубае и Москве, монтаж и дистрибуция через коллаборации с медиа.', stats: [['Просмотры', '12,4 млн'], ['Сохранения', '86 тыс.'], ['Срок', '2 месяца']] },
  { img: 'img/case-3.webp', tag: 'эксперт', name: 'Velvet hour', text: 'Позиционирование психолога-консультанта: тон коммуникации, контент-архитектура и подкаст, который цитируют в профильных каналах.', stats: [['Подписчики', '+48 тыс.'], ['Конверсия в запись', '7,8%'], ['Срок', '4 месяца']] }
];
(function () {
  const wrap = $('.cases__track');
  // кейсы повторяются по кругу: набор из 6 (3 кейса × 2), чтобы чередование высот совпадало при склейке
  const one = [0, 1, 2, 0, 1, 2].map((c, i) => `<a class="reel" href="#" data-case="${c}" aria-label="Кейс ${CASES[c].name}">
    <span class="corners" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="reel__img"><img src="${CASES[c].img}" alt="" loading="lazy" draggable="false"></span><span class="reel__watch">watch</span></a>`).join('');
  wrap.innerHTML = `<div class="track"><div class="reels">${one}</div><div class="reels" aria-hidden="true">${one}</div></div>`;
  const track = $('.track', wrap);
  const m = { track, dir: -1, speed: 40, x: 0 };
  const start = () => { m.x = isMob() ? 87.5 - 6 * 305 : 200 - 6 * 627.5; };
  start(); layoutHooks.push(start);
  marquees.push(m);
  // перетаскивание мышью и пальцем
  let down = false, sx = 0, x0 = 0, moved = false;
  wrap.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; x0 = m.x; m.hold = true; });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = (e.clientX - sx) / S();
    if (Math.abs(dx) > 6) moved = true;
    m.x = x0 + dx;
  });
  addEventListener('pointerup', () => { if (down) { down = false; m.hold = false; } });
  wrap.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
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

/* ДНК на всю высоту экрана: контент (линии 208…1139 макета) по центру, при нехватке высоты — масштаб */
(function () {
  const box = $('.dna__box');
  const fit = () => {
    if (isMob()) { box.style.transform = ''; return; }
    const H = innerHeight / S(), C = 931, top = 208;
    const k = Math.min(1, (H - 80) / C);
    box.style.transformOrigin = `0 ${top + C / 2}px`;
    box.style.transform = `translateY(${(H / 2 - (top + C / 2)).toFixed(1)}px) scale(${k.toFixed(4)})`;
  };
  fit(); addEventListener('resize', fit); layoutHooks.push(fit);
})();

/* ---------- кнопки: перекат текста и улетающая стрелка ---------- */
function enhance(rootEl) {
  $$('.roll:not([data-r])', rootEl || document).forEach(r => {
    r.setAttribute('data-r', '');
    r.innerHTML = `<span class="roll__in" data-text="${r.dataset.text}">${r.innerHTML}</span>`;
  });
  $$('.cta:not([data-fx])', rootEl || document).forEach(b => {
    b.setAttribute('data-fx', '');
    const svg = $(':scope > .px-arrow', b);
    if (!svg) return;
    const fly = document.createElement('span');
    fly.className = 'fly';
    svg.replaceWith(fly);
    fly.appendChild(svg);
    const c = svg.cloneNode(true); c.classList.add('is-next'); fly.appendChild(c);
  });
}
enhance();

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
      pop.classList.remove('is-lead');
      media.innerHTML = `<img src="${d.img}" alt="">`;
      info.innerHTML = `<small>${d.tag}</small><h3>${d.name}</h3><p>${nb(d.text)}</p><ul>${d.stats.map(([a, b]) => `<li><span>${a}</span><b>${b}</b></li>`).join('')}</ul>`;
      open();
    } else if (l) {
      e.preventDefault();
      pop.classList.add('is-lead');
      info.innerHTML = `<small>заявка</small><h3>Сделать имя видимым</h3>
        <form class="lead"><label><span>Имя</span><input name="name" required autocomplete="name"></label>
        <label><span>Телефон или Telegram</span><input name="contact" required></label>
        <label><span>О проекте</span><input name="about"></label>
        <button class="cta" type="submit"><span class="roll" data-text="отправить">отправить</span> <svg class="px-arrow"><use href="#px-arrow"/></svg></button>
        <p class="lead__done">Спасибо! Продюсер свяжется с вами в течение дня.</p></form>`;
      enhance(info);
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

/* типограф по всей странице */
[document.body, $(".menu"), $(".pop")].forEach(typo);
