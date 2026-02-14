/* Click-to-explode per item */
(function () {
  var C = window.CONFIG.explode;
  var items = document.querySelectorAll('.artwork-item');

  function explodeItem(item) {
    if (item.dataset.exploding === 'true') return;
    item.dataset.exploding = 'true';
    if (item.dataset.sound) playCreatureSound(item.dataset.sound);

    var rect = item.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    var count = C.particleCount.min + Math.floor(Math.random() * C.particleCount.range);
    for (var i = 0; i < count; i++) {
      var px = rect.left + Math.random() * rect.width;
      var py = rect.top + Math.random() * rect.height;
      var angle = Math.atan2(py - cy, px - cx) + (Math.random() - 0.5) * 0.8;
      var spd = 2.5 + Math.random() * 5;
      window._particles.push({
        x: px, y: py,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - Math.random() * 2,
        life: 1,
        decay: 0.004 + Math.random() * 0.008,
        size: 2 + Math.random() * 6,
        color: window._pColors[Math.floor(Math.random() * window._pColors.length)],
      });
    }

    item.style.transition = 'opacity 0.12s ease';
    item.style.opacity = '0';

    setTimeout(function () {
      item.style.transition = 'opacity 1s ease';
      item.style.opacity = '1';
      setTimeout(function () {
        item.style.transition = '';
        item.dataset.exploding = 'false';
      }, C.reformFadeIn);
    }, C.reformDelay);
  }

  items.forEach(function (item) {
    if (item.classList.contains('name-letter')) return;
    item.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      explodeItem(item);
    });
  });
})();
