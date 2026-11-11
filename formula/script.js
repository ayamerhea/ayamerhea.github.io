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
});
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A' && nav.classList.contains('is-open')) burger.click();
});

// Карусели
document.querySelectorAll('.slider-sec').forEach(sec => {
  const track = sec.querySelector('.track');
  sec.querySelectorAll('[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = track.querySelector('article');
      const step = card.offsetWidth + 16;
      track.scrollBy({ left: step * Number(btn.dataset.dir), behavior: 'smooth' });
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
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.toggle('is-active', t === tab));
    panels.forEach((p, i) => p.classList.toggle('is-active', i === Number(tab.dataset.tab)));
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
    const card = track.querySelector('article');
    const step = card.offsetWidth + 16;
    const target = Math.round(track.scrollLeft / step) * step;
    track.classList.remove('is-dragging');
    track.scrollTo({ left: target, behavior: 'smooth' });
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  // клик после перетаскивания не должен открывать ссылку
  track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  track.addEventListener('dragstart', e => e.preventDefault());
});
