// Silkway Med — поведение кликабельного прототипа
(function () {
  var CLINICS = window.CLINICS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var params = new URLSearchParams(location.search);

  // ---- мобильное меню
  var burger = $('.burger'), nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  // ---- ГЛАВНАЯ
  var grid = $('#clinic-grid');
  if (grid) {
    var renderClinics = function (city) {
      grid.innerHTML = CLINICS.filter(function (c) { return city === 'all' || c.city === city; }).map(function (c) {
        return '<a class="card clinic-card" href="clinic.html?id=' + c.id + '">' +
          '<div class="ph">Фото</div>' +
          '<div class="clinic-card__body"><h3 class="h3" style="font-size:18px">' + esc(c.name) + '</h3>' +
          '<p class="txt" style="font-size:14px">' + esc(c.city) + ' · ' + esc(c.strong) + '</p></div></a>';
      }).join('');
    };
    renderClinics('all');
    $$('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.tab').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        t.setAttribute('aria-selected', 'true');
        renderClinics(t.getAttribute('data-city'));
      });
    });
  }

  // ---- ведущие врачи (сквозной блок)
  var docSlider = $('#doc-slider');
  if (docSlider && window.STAR_DOCS) {
    var byId = {};
    CLINICS.forEach(function (c) { byId[c.id] = c; });
    docSlider.innerHTML = window.STAR_DOCS.map(function (d) {
      var c = byId[d[3]] || {};
      return '<a class="card doc" href="clinic.html?id=' + d[3] + '">' +
        '<div class="ph">Фото</div>' +
        '<h3 class="h3" style="margin-top:6px;font-size:19px">' + esc(d[0]) + '</h3>' +
        '<p class="muted" style="font-size:13px">' + esc(d[1]) + ' · ' + esc(c.name || '') + '</p>' +
        '<p class="txt">' + esc(d[2]) + '</p>' +
        '<span class="go">Смотреть клинику →</span></a>';
    }).join('');
  }

  // ---- стрелки слайдеров
  $$('.arrows').forEach(function (box) {
    var track = document.getElementById(box.getAttribute('data-slider'));
    if (!track) return;
    $$('.arrow', box).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = Number(btn.getAttribute('data-step'));
        var item = track.firstElementChild;
        var w = item ? item.getBoundingClientRect().width + 16 : track.clientWidth;
        track.scrollBy({ left: step * w, behavior: 'smooth' });
      });
    });
  });

  // ---- форма заявки
  var form = $('#lead-form');
  if (form) {
    var sel = $('#f-dir'), chosen = $('#chosen'), chosenText = $('#chosen-text');
    var setChoice = function (dir, extra) {
      if (dir) {
        var has = Array.prototype.some.call(sel.options, function (o) { return o.value === dir || o.text === dir; });
        if (has) sel.value = dir;
      }
      var label = [dir, extra].filter(Boolean).join(' · ');
      chosenText.textContent = label;
      chosen.classList.toggle('on', !!label);
    };
    $('#chosen-clear').addEventListener('click', function () { sel.value = ''; setChoice('', ''); });

    $$('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () {
        setChoice(b.getAttribute('data-dir'), '');
        $('#lead').scrollIntoView({ behavior: 'smooth' });
        setTimeout(function () { $('#f-name').focus({ preventScroll: true }); }, 500);
      });
    });

    // переход со страницы клиники: index.html?clinic=…&doc=…#lead
    var pClinic = params.get('clinic'), pDoc = params.get('doc'), pDir = params.get('dir');
    if (pClinic || pDoc || pDir) setChoice('', [pClinic, pDir, pDoc ? 'врач: ' + pDoc : ''].filter(Boolean).join(', '));

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#f-name'), contact = $('#f-contact'), agree = $('#f-agree');
      var ok = true;
      [name, contact].forEach(function (i) { var bad = !i.value.trim(); i.classList.toggle('err', bad); if (bad) ok = false; });
      if (!agree.checked) ok = false;
      $('#form-err').classList.toggle('on', !ok);
      if (ok) form.classList.add('done');
    });
    $('#again').addEventListener('click', function () {
      form.reset(); setChoice('', ''); form.classList.remove('done');
    });
  }

  // ---- СТРАНИЦА КЛИНИКИ
  if ($('#clinic-page')) {
    var c = CLINICS.filter(function (x) { return x.id === params.get('id'); })[0] || CLINICS[0];
    document.title = c.name + ' — Silkway Med (прототип)';
    $$('[data-f]').forEach(function (el) { el.textContent = c[el.getAttribute('data-f')] || ''; });
    $('#tags').innerHTML = c.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    $('#facts').innerHTML = c.facts.map(function (f) {
      return '<div class="card card--static"><b>' + esc(f[0]) + '</b><span class="txt">' + esc(f[1]) + '</span></div>';
    }).join('');
    var leadUrl = function (doc, dir) {
      var q = '?clinic=' + encodeURIComponent(c.name) +
        (doc ? '&doc=' + encodeURIComponent(doc) : '') +
        (dir ? '&dir=' + encodeURIComponent(dir) : '');
      return 'index.html' + q + '#lead';
    };
    var dirs = (window.CLINIC_DIRS || {})[c.id] || [];
    $('#dirs').innerHTML = dirs.map(function (d) {
      return '<div class="card card--static dir">' +
        '<h3 class="h3">' + esc(d[0]) + '</h3>' +
        '<p class="txt">' + esc(d[1]) + '</p>' +
        '<div class="dir__price"><div><b>от [X] ₽</b><small>[N] дней в Китае</small></div>' +
        '<a class="dir__go" href="' + leadUrl('', d[0]) + '">Узнать цену →</a></div></div>';
    }).join('');
    $$('[data-cta]').forEach(function (a) { a.href = leadUrl(); });
    $('#docs').innerHTML = c.docs.map(function (d) {
      return '<a class="card doc" href="' + leadUrl(d[0]) + '">' +
        '<div class="ph">Фото</div>' +
        '<h3 class="h3" style="margin-top:6px;font-size:19px">' + esc(d[0]) + '</h3>' +
        '<p class="muted" style="font-size:13px">' + esc(d[1]) + '</p>' +
        '<p class="txt">' + esc(d[2]) + '</p>' +
        '<span class="go">Хочу к этому врачу →</span></a>';
    }).join('');
    var others = CLINICS.filter(function (x) { return x.id !== c.id && x.city === c.city; }).slice(0, 3);
    $('#others').innerHTML = others.map(function (o) {
      return '<a class="card" href="clinic.html?id=' + o.id + '"><span class="txt" style="font-size:13px">' + esc(o.city) + '</span>' +
        '<span class="h3">' + esc(o.name) + '</span><span class="txt">' + esc(o.strong) + '</span></a>';
    }).join('');
  }
})();
