// Silkway Med — кликабельный прототип: общая логика всех страниц
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var params = new URLSearchParams(location.search);
  var page = document.body.getAttribute('data-page');
  var CLINICS = window.CLINICS || [];
  var byId = {}; CLINICS.forEach(function (c) { byId[c.id] = c; });

  // ---------- иконки ----------
  var I = {
    upright: '<svg viewBox="0 0 16 11" fill="none" aria-hidden="true"><path d="M4 9.5L12 1.5M12 1.5H5.5M12 1.5V8" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg class="ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg class="pm" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    caret: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>',
    burger: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  window.SW_ICONS = I;
  $$('[data-i]').forEach(function (el) { var k = el.getAttribute('data-i'); el.insertAdjacentHTML(k === 'check' ? 'afterbegin' : 'beforeend', I[k] || ''); });

  // ---------- шапка и футер ----------
  var home = page === 'home' ? '' : 'index.html';
  var leadHref = (page === 'home' || page === 'clinic') ? '#lead' : 'index.html#lead';
  var hdr = $('#hdr');
  if (hdr) {
    hdr.outerHTML =
      '<header class="hdr"><div class="wrap hdr__in">' +
      '<a href="index.html" class="logo">SILKWAYMED</a>' +
      '<nav class="nav" id="nav" aria-label="Основное меню">' +
      '<a href="' + home + '#directions">Направления</a>' +
      '<a href="' + home + '#clinics">Клиники</a>' +
      '<a href="' + home + '#doctors">Врачи</a>' +
      '<a href="' + home + '#how">Как это работает</a>' +
      '<a href="news.html">Новости</a></nav>' +
      '<div class="hdr__right"><a class="hdr__phone" href="tel:+79039999134">+7 903 999-91-34</a>' +
      '<a class="btn btn--sm" href="' + leadHref + '">Оставить заявку</a>' +
      '<button class="burger" type="button" aria-label="Меню" aria-expanded="false" aria-controls="nav">' + I.burger + '</button></div>' +
      '</div></header>';
  }
  var ftr = $('#ftr');
  if (ftr) {
    ftr.outerHTML =
      '<footer class="ftr"><div class="wrap">' +
      '<div class="ftr__top"><a href="index.html" class="logo">SILKWAYMED</a>' +
      '<nav class="ftr__nav" aria-label="Навигация в футере">' +
      '<a href="' + home + '#directions">Направления</a><a href="' + home + '#clinics">Клиники</a>' +
      '<a href="' + home + '#how">Как это работает</a><a href="' + home + '#faq">Вопросы</a><a href="news.html">Новости</a></nav>' +
      '<div class="ftr__contacts"><a href="tel:+79039999134">+7 903 999-91-34</a><a href="mailto:hello@silkwaymed.ru">hello@silkwaymed.ru</a></div></div>' +
      '<div class="ftr__line"></div>' +
      '<div class="ftr__bottom"><p>© 2026 ООО «Глобал Трафик» · ИНН 5403091377 · ОГРН 1265400004726</p>' +
      '<div class="ftr__links"><a href="doc.html?d=policy">Политика</a><a href="doc.html?d=offer">Оферта</a>' +
      '<a href="https://ayamerhea.github.io/" target="_blank" rel="noopener">Разработка сайта</a></div></div>' +
      '</div></footer>';
  }
  var burger = $('.burger'), nav = $('#nav');
  if (burger) {
    burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }

  // ---------- карточки ----------
  var clinicCard = function (c) {
    return '<a class="card ccard" href="clinic.html?id=' + c.id + '">' +
      '<div class="ph">Фото</div><div class="ccard__body">' +
      '<div class="row-meta meta"><span>' + esc(c.city) + '</span><span>' + esc(c.strong) + '</span></div>' +
      '<h3 class="t20m">' + esc(c.name) + '</h3>' +
      '<span class="more">Подробнее ' + I.upright + '</span></div></a>';
  };
  var docCard = function (d, href, label) {
    return '<a class="card doc" href="' + href + '">' +
      '<div class="ph ph--in">Фото</div>' +
      '<h3 class="t20m">' + esc(d.name) + '</h3>' +
      '<div class="row-meta meta"><span>' + esc(d.title) + '</span><span>' + esc(d.sub) + '</span></div>' +
      '<span class="more">' + label + ' ' + I.upright + '</span></a>';
  };
  var newsCard = function (n) {
    return '<a class="card card--line ncard" href="article.html?id=' + n[0] + '">' +
      '<div class="ph">Фото</div><div class="ncard__body">' +
      '<span class="meta">' + esc(n[1]) + '</span><h3 class="t20m">' + esc(n[3]) + '</h3>' +
      '<span class="more" style="margin-top:auto">Подробнее ' + I.upright + '</span></div></a>';
  };

  // ---------- слайдеры ----------
  var initArrows = function () {
    $$('[data-slider]').forEach(function (btn) {
      if (btn._init) return; btn._init = 1;
      btn.addEventListener('click', function () {
        var track = document.getElementById(btn.getAttribute('data-slider'));
        var item = track && track.firstElementChild; if (!item) return;
        var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
        track.scrollBy({ left: Number(btn.getAttribute('data-step')) * (item.getBoundingClientRect().width + gap), behavior: 'smooth' });
      });
    });
  };

  // ---------- форма ----------
  var initForm = function () {
    var form = $('#lead-form'); if (!form) return;
    var sel = $('select', form), chosen = $('.chosen', form), chosenText = $('.chosen b', form);
    var setChoice = function (dir, note) {
      if (dir) {
        var opt = Array.prototype.filter.call(sel.options, function (o) { return o.value === dir || o.text === dir; })[0];
        if (!opt) { opt = new Option(dir, dir); sel.add(opt); }
        sel.value = opt.value;
      }
      chosenText.textContent = note || '';
      chosen.classList.toggle('on', !!note);
    };
    $('.chosen button', form).addEventListener('click', function () { setChoice('', ''); sel.selectedIndex = 0; });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dir],[data-note]'); if (!b) return;
      e.preventDefault();
      setChoice(b.getAttribute('data-dir') || '', b.getAttribute('data-note') || '');
      $('#lead').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { $('input', form).focus({ preventScroll: true }); }, 600);
    });
    if (params.get('dir') || params.get('note')) setChoice(params.get('dir') || '', params.get('note') || '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('input[required]', form).forEach(function (i) { var bad = i.type === 'checkbox' ? !i.checked : !i.value.trim(); i.classList.toggle('err', bad); if (bad) ok = false; });
      $('.ferr', form).classList.toggle('on', !ok);
      if (ok) form.classList.add('done');
    });
    $('.again', form).addEventListener('click', function () { form.reset(); setChoice('', ''); form.classList.remove('done'); });
  };

  // ---------- ГЛАВНАЯ ----------
  if (page === 'home') {
    var grid = $('#clinic-grid');
    var draw = function (city) { grid.innerHTML = CLINICS.filter(function (c) { return city === 'all' || c.city === city; }).map(clinicCard).join(''); };
    draw('all');
    $$('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.tab').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        t.setAttribute('aria-selected', 'true'); draw(t.getAttribute('data-city'));
      });
    });
    $('#doc-slider').innerHTML = (window.STAR_DOCS || []).map(function (d) {
      var c = byId[d[3]] || {};
      return docCard({ name: d[0], title: d[1], sub: c.name }, 'clinic.html?id=' + d[3] + '#team', 'Смотреть клинику');
    }).join('');
    $('#news-grid').innerHTML = (window.NEWS || []).slice(0, 3).map(newsCard).join('');
  }

  // ---------- СТРАНИЦА КЛИНИКИ ----------
  if (page === 'clinic') {
    var c = byId[params.get('id')] || CLINICS[0];
    document.title = c.name + ' — Silkway Med';
    $$('[data-f]').forEach(function (el) { el.textContent = c[el.getAttribute('data-f')] || ''; });
    var dirs = (window.CLINIC_DIRS || {})[c.id] || [];
    $('#chips').innerHTML = c.tags.map(function (t) { return '<a class="chip" href="#services">' + esc(t) + '</a>'; }).join('');
    $('#facts').innerHTML = c.facts.map(function (f) {
      return '<div class="card fact"><b>' + esc(f[0]) + '</b><span class="meta" style="opacity:.8">' + esc(f[1]) + '</span></div>';
    }).join('');
    $('#dirs').innerHTML = dirs.map(function (d) {
      return '<button type="button" class="card card--line dcard" data-dir="' + esc(d[0]) + '" data-note="' + esc(c.name + ' · ' + d[0] + ' · узнать цену') + '">' +
        '<h3 class="t20">' + esc(d[0]) + '</h3><p class="body">' + esc(d[1]) + '</p>' +
        '<span class="more">Узнать цену ' + I.upright + '</span></button>';
    }).join('');
    $('#doc-slider').innerHTML = c.docs.map(function (d) {
      return '<button type="button" class="card doc" style="text-align:left" data-note="' + esc(c.name + ' · врач: ' + d[0]) + '">' +
        '<div class="ph ph--in">Фото</div><h3 class="t20m">' + esc(d[0]) + '</h3>' +
        '<div class="row-meta meta"><span>' + esc(d[1]) + '</span><span>' + esc(d[2]) + '</span></div>' +
        '<span class="more">Записаться к врачу ' + I.upright + '</span></button>';
    }).join('');
    var q = (window.CLINIC_MAP || {})[c.id] || c.name;
    $('#map').innerHTML = '<iframe title="Карта: ' + esc(c.name) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=15&output=embed"></iframe>';
    var sel = $('#f-dir');
    dirs.forEach(function (d) { sel.add(new Option(d[0], d[0])); });
    sel.add(new Option('Другое / не знаю', 'Другое'));
    $('#hero-cta').setAttribute('data-note', c.name);
  }

  // ---------- НОВОСТИ: лента ----------
  if (page === 'news') {
    var cats = ['Все'].concat((window.NEWS || []).map(function (n) { return n[2]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    var list = $('#news-list');
    var drawN = function (cat) { list.innerHTML = window.NEWS.filter(function (n) { return cat === 'Все' || n[2] === cat; }).map(newsCard).join(''); };
    $('#ncats').innerHTML = cats.map(function (k, i) { return '<button type="button" class="tab" role="tab" aria-selected="' + (i === 0) + '">' + esc(k) + '</button>'; }).join('');
    $$('#ncats .tab').forEach(function (t) {
      t.addEventListener('click', function () { $$('#ncats .tab').forEach(function (x) { x.setAttribute('aria-selected', 'false'); }); t.setAttribute('aria-selected', 'true'); drawN(t.textContent); });
    });
    drawN('Все');
  }

  // ---------- НОВОСТЬ ----------
  if (page === 'article') {
    var N = window.NEWS || [];
    var n = N.filter(function (x) { return x[0] === params.get('id'); })[0] || N[0];
    document.title = n[3] + ' — Silkway Med';
    $('#a-meta').textContent = n[1] + ' · ' + n[2];
    $('#a-title').textContent = n[3];
    $('#a-crumb').textContent = n[3];
    $('#a-lead').textContent = n[4];
    $('#a-src').textContent = 'Источник: ' + n[5];
    $('#news-more').innerHTML = N.filter(function (x) { return x[0] !== n[0]; }).slice(0, 3).map(newsCard).join('');
  }

  // ---------- ДОКУМЕНТ ----------
  if (page === 'doc') {
    var t = params.get('d') === 'offer' ? 'Публичная оферта' : 'Политика конфиденциальности';
    document.title = t + ' — Silkway Med';
    $('#d-title').textContent = t; $('#d-crumb').textContent = t;
  }

  initArrows();
  initForm();
})();
