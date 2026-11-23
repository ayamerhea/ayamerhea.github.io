// Автоскейл (как Autoscale в Tilda): на десктопе макет 1200 px масштабируется под ширину окна.
// Ниже 961 px масштаб не применяется — работает адаптивная вёрстка.
(function () {
  var BASE = 1200, MIN = 961;
  var root = document.documentElement;
  var apply = function () {
    var w = root.clientWidth || window.innerWidth;
    // округляем вниз, чтобы ширина вёрстки никогда не стала меньше 1200 px
    root.style.zoom = w >= MIN ? String(Math.floor(w / BASE * 10000) / 10000) : '';
  };
  apply();
  window.addEventListener('resize', apply);
})();
