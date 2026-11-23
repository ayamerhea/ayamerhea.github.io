// Автоскейл (как Autoscale в Tilda): на десктопе макет 1200 px масштабируется под ширину окна.
// Ниже 961 px масштаб не применяется — работает адаптивная вёрстка.
(function () {
  var BASE = 1200, MIN = 961;
  var root = document.documentElement;
  var apply = function () {
    var w = root.clientWidth || window.innerWidth;
    root.style.zoom = w >= MIN ? (w / BASE).toFixed(4) : '';
  };
  apply();
  window.addEventListener('resize', apply);
})();
