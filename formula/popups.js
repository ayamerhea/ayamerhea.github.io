// Попапы: направления (прайс), результаты работ, квиз-диагностика
(function () {
  const D = window.POPUPS;
  if (!D) return;
  const ARROW = '<svg class="ico-arrow" aria-hidden="true"><use href="#arrow"/></svg>';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- общий каркас ----------
  const root = document.createElement('div');
  root.className = 'pop';
  root.innerHTML = '<div class="pop__bg" data-close></div><div class="pop__box" role="dialog" aria-modal="true" tabindex="-1"><button class="pop__close" data-close aria-label="Закрыть"><span></span><span></span></button><div class="pop__body" data-lenis-prevent></div></div>';
  document.body.appendChild(root);
  const box = root.querySelector('.pop__box');
  const body = root.querySelector('.pop__body');
  let lastFocus = null;

  function open(kind, html) {
    lastFocus = document.activeElement;
    root.className = 'pop pop--' + kind;
    body.innerHTML = html;
    body.scrollTop = 0;
    requestAnimationFrame(() => root.classList.add('is-open'));
    document.documentElement.classList.add('pop-open');
    if (window.lenis) lenis.stop();
    setTimeout(() => box.focus({ preventScroll: true }), 50);
  }
  function close(then) {
    if (!root.classList.contains('is-open')) return;
    root.classList.remove('is-open');
    document.documentElement.classList.remove('pop-open');
    if (window.lenis) lenis.start();
    setTimeout(() => { if (!root.classList.contains('is-open')) body.innerHTML = ''; }, 500);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (typeof then === 'function') setTimeout(then, 350);
  }
  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) close();
    const go = e.target.closest('[data-signup]');
    if (go) { e.preventDefault(); close(() => goSignup()); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  function goSignup() {
    const el = document.getElementById('signup');
    if (window.lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { const i = el.querySelector('input'); if (i) i.focus({ preventScroll: true }); }, 1500);
  }

  const footer = () => `
    <div class="pop__foot">
      <p>${D.note}</p>
      <a href="#signup" class="btn btn--beige" data-signup><span class="btn__label">записаться на консультацию</span><span class="btn__arrow">${ARROW}</span></a>
    </div>`;

  // ---------- направления ----------
  function directionHTML(key) {
    const d = D.directions[key];
    const groups = d.groups.map(([name, rows]) => `
      ${name ? `<h4 class="price__group">${name}</h4>` : ''}
      <ul class="price">${rows.map(([n, p]) => `<li><span>${n}</span><b>${p}</b></li>`).join('')}</ul>`).join('');
    return `<h3 class="pop__title">${d.title}</h3><p class="pop__lead">${d.desc}</p><div class="pop__line"></div>${groups}${footer()}`;
  }

  // ---------- результаты работ ----------
  function resultHTML(i) {
    const r = D.results[i];
    const card = document.querySelectorAll('#results .result')[i];
    const imgs = card ? card.querySelector('.result__img').innerHTML : '';
    return `<h3 class="pop__title">${r.title}</h3><p class="pop__lead">${r.drug}</p><div class="pop__line"></div>
      <div class="case">
        <div class="case__img">${imgs}</div>
        <div class="case__info">
          <div><i>(результат)</i><p>${r.res}</p></div>
          <div><i>(длительность эффекта)</i><p>${r.dur}</p></div>
        </div>
      </div>
      <div class="case__rehab"><i>(реабилитация)</i><p>${r.rehab}</p></div>
      <div class="pop__line"></div>${footer()}`;
  }

  // ---------- квиз ----------
  const Q = D.quiz;
  let step = 0, answers = [];
  function quizHTML() {
    const s = Q[step];
    const type = s.multi ? 'checkbox' : 'radio';
    const opts = s.opts.map((o, k) => `
      <label class="qopt qopt--${type}"><input type="${type}" name="q${step}" value="${k}" ${answers[step] && answers[step].includes(k) ? 'checked' : ''}><span class="qopt__box"></span><span>${o.t}</span></label>`).join('');
    return `
      <aside class="quiz__side">
        <div class="quiz__ava" style="background-image:url(img/doc-3.webp)"></div>
        <div class="quiz__bubble">
          <b>Мария Лебедева</b><i>Врач-косметолог</i>
          <p>Здравствуйте! Я&nbsp;проведу небольшую диагностику кожи и&nbsp;подберу подходящие средства ухода.</p>
          <p>Всего шесть вопросов помогут определить ваши потребности, особенности кожи и&nbsp;выбрать процедуры, которые дадут наилучший результат.</p>
        </div>
      </aside>
      <form class="quiz__main" novalidate>
        <div class="quiz__progress"><span style="width:${(step + 1) / Q.length * 100}%"></span></div>
        <h3 class="quiz__q">${s.q}</h3>
        <div class="quiz__opts" style="--rows:${Math.ceil(s.opts.length / 2)}">${opts}</div>
        ${s.multi ? '<p class="quiz__hint">*Отметьте один или несколько вариантов</p>' : ''}
        <p class="quiz__err" hidden>Выберите хотя&nbsp;бы один вариант</p>
        <div class="quiz__nav">
          <span class="quiz__step">Шаг: ${step + 1}/${Q.length}</span>
          <button type="button" class="quiz__back" data-back aria-label="Назад" ${step === 0 ? 'disabled' : ''}><svg aria-hidden="true"><use href="#arr-l"/></svg></button>
          <button type="submit" class="quiz__next">${step === Q.length - 1 ? 'получить результат' : 'далее'}<svg aria-hidden="true"><use href="#arr-r"/></svg></button>
        </div>
      </form>`;
  }
  function renderQuiz(dir) {
    const html = quizHTML();
    const main = body.querySelector('.quiz__main');
    if (!main) { body.innerHTML = html; return; }
    main.classList.add(dir > 0 ? 'is-leaving' : 'is-leaving-back');
    setTimeout(() => { body.innerHTML = html; const m = body.querySelector('.quiz__main'); m.classList.add(dir > 0 ? 'is-entering' : 'is-entering-back'); requestAnimationFrame(() => requestAnimationFrame(() => m.classList.remove('is-entering', 'is-entering-back'))); }, 220);
  }
  function outcomeIndex() {
    const score = [0, 0, 0, 0, 0, 0];
    answers.forEach((a, s) => (a || []).forEach(k => {
      const w = Q[s].opts[k].w;
      Object.keys(w).forEach(r => { score[+r] += w[r]; });
    }));
    let best = 0;
    score.forEach((v, i) => { if (v > score[best]) best = i; });
    return best;
  }
  function outcomeHTML() {
    const o = D.outcomes[outcomeIndex()];
    const ul = (arr, dots) => `<ul class="${dots ? 'dots' : ''}">${arr.map(x => `<li>${x}</li>`).join('')}</ul>`;
    return `
      <div class="outcome">
        <h3 class="pop__title">${o.title}</h3>
        <div class="pop__line"></div>
        <i class="outcome__label">(что показала диагностика)</i>
        <p class="outcome__lead">${o.lead}</p>
        <div class="outcome__card">
          <div><i>(предполагаемое состояние кожи)</i>${ul(o.state, true)}</div>
          <div><i>(полезные компоненты)</i>${ul(o.comp, true)}</div>
          <div class="outcome__sep"></div>
          <div><i>(рекомендуемый домашний уход)</i><p>Утро:</p>${ul(o.am, true)}<p>Вечер:</p>${ul(o.pm, true)}</div>
          <div><i>(какие процедуры могут подойти)</i><p>Врач-косметолог может рассмотреть:</p>${ul(o.proc, true)}</div>
        </div>
        <div class="pop__line"></div>
        <div class="pop__foot">
          <p>Результат теста является предварительной оценкой на&nbsp;основе ваших ответов. Точный диагноз состояния кожи, подбор процедур и&nbsp;домашнего ухода проводится врачом-косметологом после консультации.</p>
          <a href="#signup" class="btn btn--dark" data-signup><span class="btn__label">записаться на консультацию</span><span class="btn__arrow">${ARROW}</span></a>
        </div>
      </div>`;
  }
  body.addEventListener('submit', e => {
    if (!e.target.classList.contains('quiz__main')) return;
    e.preventDefault();
    const picked = [...e.target.querySelectorAll('input:checked')].map(i => +i.value);
    if (!picked.length) { e.target.querySelector('.quiz__err').hidden = false; e.target.querySelector('.quiz__opts').classList.add('is-error'); return; }
    answers[step] = picked;
    if (step < Q.length - 1) { step++; renderQuiz(1); }
    else { root.classList.add('pop--outcome'); body.innerHTML = outcomeHTML(); body.scrollTop = 0; }
  });
  body.addEventListener('click', e => {
    if (e.target.closest('[data-back]') && step > 0) { const f = body.querySelector('.quiz__main'); answers[step] = [...f.querySelectorAll('input:checked')].map(i => +i.value); step--; renderQuiz(-1); }
  });
  body.addEventListener('change', e => {
    const f = e.target.closest('.quiz__main');
    if (f) { f.querySelector('.quiz__err').hidden = true; f.querySelector('.quiz__opts').classList.remove('is-error'); }
  });

  // ---------- точки входа ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-popup]');
    if (!t) return;
    const tr = t.closest('.track');
    if (tr && tr.dataset.dragged) return;
    e.preventDefault();
    e.stopPropagation();
    const [kind, arg] = t.dataset.popup.split(':');
    if (kind === 'dir') open('drawer', directionHTML(arg));
    if (kind === 'res') open('drawer', resultHTML(+arg));
    if (kind === 'quiz') { step = 0; answers = []; open('quiz', ''); body.innerHTML = quizHTML(); }
  }, true);
  document.addEventListener('keydown', e => {
    const t = e.target.closest && e.target.closest('article[data-popup]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t.click(); }
  });
})();
