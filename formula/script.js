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
  {
    name: 'Ольга<br>Соколова',
    photo: 'img/review-1.jpg',
    text: 'Хотелось выглядеть свежее без радикальных изменений. Именно такой результат я и получила. Лицо стало более подтянутым, кожа плотнее и ровнее, при этом все выглядит абсолютно естественно. Особенно понравилось, что врач честно рассказал, какого эффекта стоит ожидать, без завышенных обещаний.'
  }
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
