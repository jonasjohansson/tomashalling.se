/* Loading percentage tracker */
(function () {
  var loader = document.getElementById('loader');
  var imgs = document.querySelectorAll('.artwork-item img');
  var vids = document.querySelectorAll('.artwork-item video');
  var total = imgs.length + vids.length;
  var loaded = 0;

  function update() {
    var pct = total === 0 ? 100 : Math.round((loaded / total) * 100);
    loader.textContent = pct + '%';
    if (pct >= 100) {
      setTimeout(function () { loader.classList.add('done'); }, 200);
      setTimeout(function () { loader.remove(); }, 900);
    }
  }

  imgs.forEach(function (img) {
    if (img.complete) { loaded++; return; }
    img.addEventListener('load', function () { loaded++; update(); });
    img.addEventListener('error', function () { loaded++; update(); });
  });

  vids.forEach(function (vid) {
    if (vid.readyState >= 3) { loaded++; return; }
    vid.addEventListener('canplaythrough', function () { loaded++; update(); }, { once: true });
    vid.addEventListener('error', function () { loaded++; update(); }, { once: true });
  });

  update();
})();
