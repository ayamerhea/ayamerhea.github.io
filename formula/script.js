// Большие кнопки: перекатывающийся текст и «улетающая» стрелка
window.enhanceBtns = function (root) {
  (root || document).querySelectorAll('.btn:not([data-fx])').forEach(btn => {
    btn.setAttribute('data-fx', '');
    const label = btn.querySelector('.btn__label');
    if (label) {
      const text = label.textContent.trim();
      label.innerHTML = `<span class="btn__roll"><span>${text}</span><span aria-hidden="true">${text}</span></span>`;
    }
    const arrow = btn.querySelector('.btn__arrow');
    if (arrow && arrow.children.length === 1) {
      const clone = arrow.firstElementChild.cloneNode(true);
      clone.classList.add('is-next');
      arrow.appendChild(clone);
    }
  });
};
enhanceBtns();

// Autoscale (как в Tilda): от 1200px макет 1440 масштабируется под ширину экрана
(function () {
  const root = document.documentElement;
  const fit = () => {
    const w = root.clientWidth, on = w >= 1200;
    root.classList.toggle('scaled', on);
    root.style.setProperty('--s', on ? String(Math.floor(w / 1440 * 10000) / 10000) : '1');
  };
  fit();
  window.addEventListener('resize', fit);
})();

// «Вкладки» у белых листов: верх у всех .sheet, низ — у направлений и отзывов
document.querySelectorAll('.sheet').forEach(sheet => {
  if (sheet.classList.contains('stat')) return;
  const cap = pos => {
    const c = document.createElement('div');
    c.className = 'cap cap--' + pos;
    c.innerHTML = '<i></i><i></i>';
    return c;
  };
  sheet.prepend(cap('top'));
  if (sheet.id === 'directions' || sheet.classList.contains('sheet--both')) sheet.append(cap('bottom'));
});

// Отмечаем загруженные фото (для заглушки 3D-фигуры)
document.querySelectorAll('[style*="background-image"]').forEach(el => {
  const m = el.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
  if (!m) return;
  const img = new Image();
  img.onload = () => el.setAttribute('data-loaded', '');
  img.src = m[1];
});

// Закреплённое меню: подложка появляется после начала прокрутки
const topBar = document.querySelector('.hero__top');
let lastY = window.scrollY;
const onScroll = () => {
  const y = window.scrollY;
  topBar.classList.toggle('is-scrolled', y > 40);
  // прячем при прокрутке вниз, показываем при прокрутке вверх
  if (Math.abs(y - lastY) > 6) {
    const menuOpen = document.querySelector('.nav.is-open');
    topBar.classList.toggle('is-hidden', y > lastY && y > 300 && !menuOpen);
    lastY = y;
  }
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Мобильное меню
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (window.lenis) open ? lenis.stop() : lenis.start();
});
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A' && nav.classList.contains('is-open')) burger.click();
});

// Точки остановки карусели: начало каждой карточки и самый конец ленты
function trackStops(track) {
  const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const max = track.scrollWidth - track.clientWidth;
  const stops = [...track.querySelectorAll('article')].map(a => Math.min(a.offsetLeft - track.offsetLeft - pad, max)).filter(x => x >= 0);
  stops.push(max);
  return [...new Set(stops.map(Math.round))].sort((a, b) => a - b);
}
function nearestStop(track, x) {
  return trackStops(track).reduce((best, s) => Math.abs(s - x) < Math.abs(best - x) ? s : best, 0);
}

// Карусели
document.querySelectorAll('.slider-sec').forEach(sec => {
  const track = sec.querySelector('.track');
  sec.querySelectorAll('[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const stops = trackStops(track), x = track.scrollLeft, dir = Number(btn.dataset.dir);
      const next = dir > 0 ? stops.find(s => s > x + 2) : [...stops].reverse().find(s => s < x - 2);
      if (next !== undefined) track.scrollTo({ left: next, behavior: 'smooth' });
    });
  });
});

// Отзывы: добавляйте новые объекты в массив
const reviews = [
  { name: "Ольга<br>Соколова", photo: 'img/review-1.webp', text: "Хотелось выглядеть свежее без радикальных изменений. Именно такой результат я и получила. Лицо стало более подтянутым, кожа плотнее и ровнее, при этом все выглядит абсолютно естественно. Особенно понравилось, что врач честно рассказал, какого эффекта стоит ожидать, без завышенных обещаний. Теперь прихожу только сюда." },
  { name: "Анна<br>Морозова", photo: 'img/review-2.webp', text: "В клинику пришла по рекомендации подруги и теперь сама советую её всем знакомым. Очень понравилась атмосфера: спокойно, красиво и без ощущения «конвейера». После процедуры кожа стала более упругой, овал лица заметно подтянулся. Спасибо врачу за профессионализм и внимательное отношение к каждой детали." },
  { name: "Екатерина<br>Лебедева", photo: 'img/review-3.webp', text: "Долго сомневалась, стоит ли вообще что‑то делать, но после консультации все страхи исчезли. Врач подробно объяснил каждый этап процедуры и ничего не навязывал. Результат получился именно таким, как я хотела — лицо выглядит свежим и отдохнувшим, при этом никто даже не догадался, что я что‑то делала. Спасибо за бережный подход!" },
  { name: "Наталья<br>Белова", photo: 'img/review-4.webp', text: "Очень долго выбирала клинику и ни разу не пожалела о своём решении. Здесь действительно заботятся о пациентах: от первого звонка до контрольного осмотра все организовано на высоком уровне. После процедуры стала чаще слышать комплименты, что выгляжу отдохнувшей и посвежевшей. Это именно тот эффект, которого я хотела." },
  { name: "Светлана<br>Романова", photo: 'img/review-5.webp', text: "Искренне благодарю специалистов клиники за внимательное отношение и качественную работу. Очень переживала перед процедурой, но весь процесс прошёл спокойно и комфортно. Постепенно кожа стала более плотной и подтянутой, исчезло ощущение усталого лица. Теперь с удовольствием смотрю на себя в зеркало и чувствую себя увереннее." },
  { name: "Ирина<br>Воронцова", photo: 'img/review-6.webp', text: "Для меня было важно сохранить естественную мимику и не получить эффект «натянутого лица». Врач подобрал подходящую методику, подробно ответил на все вопросы и всегда был на связи после процедуры. Результат очень порадовал — лицо выглядит моложе, но при этом остаётся моим. Спасибо всей команде клиники за заботу и профессионализм." }
];
let ri = 0;
const rv = document.querySelector('.review');
const showReview = i => {
  const r = reviews[i];
  rv.style.opacity = 0;
  setTimeout(() => {
    rv.querySelector('.review__count').textContent = `(${i + 1}/${reviews.length})`;
    rv.querySelector('.review__name').innerHTML = r.name;
    rv.querySelector('.review__photo').style.backgroundImage = `url(${r.photo})`;
    rv.querySelector('.review__text').textContent = r.text;
    rv.style.opacity = 1;
  }, 250);
};
document.querySelectorAll('[data-review]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (reviews.length < 2) return;
    ri = (ri + Number(btn.dataset.review) + reviews.length) % reviews.length;
    showReview(ri);
  });
});

// FAQ: вкладки
const tabs = document.querySelectorAll('.faq__tab');
const panels = document.querySelectorAll('.faq__panel');
const panelsWrap = document.querySelector('.faq__panels');
let tabBusy = false;
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const next = panels[Number(tab.dataset.tab)];
    const cur = document.querySelector('.faq__panel.is-active');
    if (next === cur || tabBusy) return;
    tabBusy = true;
    tabs.forEach(t => t.classList.toggle('is-active', t === tab));
    // плавно: текущая вкладка гаснет, высота блока перетекает, новая проявляется
    panelsWrap.style.height = panelsWrap.offsetHeight + 'px';
    cur.classList.add('is-out');
    setTimeout(() => {
      cur.classList.remove('is-active', 'is-out');
      next.classList.add('is-active', 'is-in');
      const h = next.offsetHeight;
      panelsWrap.style.height = h + 'px';
      requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove('is-in')));
      setTimeout(() => { panelsWrap.style.height = ''; tabBusy = false; }, 450);
    }, 220);
  });
});

// Стопка: если блок выше экрана, он прилипает так, чтобы сначала долистался до низа
const stackItems = document.querySelectorAll('.stack > .stat');
const setStick = () => {
  const sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
  const vh = window.innerHeight / sc;
  stackItems.forEach(el => el.style.setProperty('--stick', Math.min(0, vh - el.offsetHeight) + 'px'));
};
setStick();
window.addEventListener('resize', setStick);

// предзагрузка фото отзывов
reviews.forEach(r => { const i = new Image(); i.src = r.photo; });

// Отзывы: общая ширина колонки и высота под самый длинный отзыв, чтобы блок не прыгал
(function () {
  const textEl = rv.querySelector('.review__text');
  const probe = textEl.cloneNode();
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
  document.body.appendChild(probe);
  const fitReviews = () => {
    textEl.style.minHeight = '';
    probe.style.width = textEl.offsetWidth + 'px';
    const h = Math.max(...reviews.map(r => { probe.textContent = r.text; return probe.offsetHeight; }));
    textEl.style.minHeight = h + 'px';
  };
  fitReviews();
  window.addEventListener('resize', fitReviews);
  if (document.fonts) document.fonts.ready.then(fitReviews);
})();

// Карусели: листание с зажатой кнопкой мыши
document.querySelectorAll('.track').forEach(track => {
  let startX = 0, startScroll = 0, moved = false, down = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; moved = false;
    startX = e.clientX; startScroll = track.scrollLeft;
  });
  window.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
    if (moved) track.scrollLeft = startScroll - dx / (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1);
  });
  const end = () => {
    if (!down) return;
    down = false;
    if (!moved) return;
    // докатываем до ближайшей карточки
    track.classList.remove('is-dragging');
    track.scrollTo({ left: nearestStop(track, track.scrollLeft), behavior: 'smooth' });
    track.dataset.dragged = '1';
    setTimeout(() => delete track.dataset.dragged, 80);
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  // клик после перетаскивания не должен открывать ссылку
  track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  track.addEventListener('dragstart', e => e.preventDefault());
});

// Отзывы: перетаскивание мышью и свайп пальцем
(function () {
  const area = rv;
  let x0 = 0, y0 = 0, dx = 0, active = false, horizontal = null;
  const go = dir => document.querySelector(`[data-review="${dir}"]`).click();
  area.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    active = true; horizontal = null; dx = 0;
    x0 = e.clientX; y0 = e.clientY;
  });
  window.addEventListener('pointermove', e => {
    if (!active) return;
    dx = e.clientX - x0;
    const dy = e.clientY - y0;
    if (horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) horizontal = Math.abs(dx) > Math.abs(dy);
    if (horizontal) {
      area.classList.add('is-dragging');
      area.style.transform = `translateX(${dx * 0.25}px)`;
    }
  });
  const end = () => {
    if (!active) return;
    active = false;
    area.classList.remove('is-dragging');
    area.style.transform = '';
    if (horizontal && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  area.addEventListener('dragstart', e => e.preventDefault());
})();

// Манифест: «магнитная» фигура — мягко отталкивается от курсора
(function () {
  const blob = document.querySelector('.manifest__blob');
  if (!blob || !matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const zone = blob.closest('.manifest');
  const R = 380, MAX = 34;            // радиус влияния и максимальный сдвиг, px
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.035; y += (ty - y) * 0.035;   // плавное, неспешное догоняние
    blob.style.setProperty('--mx', x.toFixed(2) + 'px');
    blob.style.setProperty('--my', y.toFixed(2) + 'px');
    blob.style.setProperty('--mr', (x * 0.08).toFixed(2) + 'deg');
    raf = (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  zone.addEventListener('mousemove', e => {
    const r = blob.getBoundingClientRect();
    const cx = r.left + r.width / 2 - x, cy = r.top + r.height / 2 - y;   // центр без текущего сдвига
    const dx = cx - e.clientX, dy = cy - e.clientY, d = Math.hypot(dx, dy) || 1;
    const k = Math.max(0, 1 - d / R);
    const f = MAX * k * k * (3 - 2 * k);                                   // мягкое нарастание у центра
    tx = dx / d * f; ty = dy / d * f;
    kick();
  });
  zone.addEventListener('mouseleave', () => { tx = 0; ty = 0; kick(); });
})();

// Плавный скролл по всему сайту (Lenis, MIT). На телефонах — родной скролл.
(function () {
  if (typeof Lenis === 'undefined' || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
  window.lenis = lenis;
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  // якорные ссылки тоже плавно, с отступом под меню
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute('href');
    const el = id === '#top' ? 0 : document.querySelector(id);
    if (el === null) return;
    e.preventDefault();
    lenis.scrollTo(el, { offset: el === 0 ? 0 : -70, duration: 1.4 });
  });
})();

// FAQ: в каждой вкладке открыт один вопрос; открытие другого закрывает предыдущий
document.querySelectorAll('.faq__panel').forEach(panel => {
  const items = [...panel.querySelectorAll('.qa')];
  const set = qa => items.forEach(x => {
    const on = x === qa;
    x.classList.toggle('is-open', on);
    x.querySelector('.qa__q').setAttribute('aria-expanded', on);
  });
  if (items[0]) set(items[0]);
  items.forEach(qa => qa.querySelector('.qa__q').addEventListener('click', () => set(qa.classList.contains('is-open') ? null : qa)));
});
