/* Artwork item float setup, depth, 3D tilt, drag, chaos spins */
(function () {
  var C = window.CONFIG;
  var items = document.querySelectorAll('.artwork-item');

  // Global mouse tracking (shared via window for letters/particles)
  window._mouseX = -9999;
  window._mouseY = -9999;
  window.addEventListener('mousemove', function (e) { window._mouseX = e.clientX; window._mouseY = e.clientY; });
  window.addEventListener('mouseleave', function () { window._mouseX = -9999; window._mouseY = -9999; });

  // All artwork items get CSS animation float + depth
  items.forEach(function (item) {
    var depth = item.classList.contains('fixed-center') ? 1 : C.artwork.depthRange.min + Math.random() * C.artwork.depthRange.range;
    var dur = (C.artwork.floatDuration.min + Math.random() * C.artwork.floatDuration.range) / (0.5 + depth * 0.5);
    var delay = Math.random() * -dur;
    var floatY = (C.artwork.floatY.min + Math.random() * C.artwork.floatY.range) * depth;
    var floatX = (Math.random() - 0.5) * C.artwork.floatX.range * depth;
    var floatRx = (Math.random() - 0.5) * C.artwork.floatRx.range;
    var floatRy = (Math.random() - 0.5) * C.artwork.floatRy.range;

    item.style.setProperty('--float-duration', dur.toFixed(1) + 's');
    item.style.setProperty('--float-delay', delay.toFixed(1) + 's');
    item.style.setProperty('--float-y', floatY.toFixed(1) + 'px');
    item.style.setProperty('--float-x', floatX.toFixed(1) + 'px');
    item.style.setProperty('--float-rx', floatRx.toFixed(1) + 'deg');
    item.style.setProperty('--float-ry', floatRy.toFixed(1) + 'deg');

    var scale = 0.7 + depth * 0.35;
    var opacity = 0.55 + depth * 0.45;
    var blur = Math.max(0, (1 - depth) * 1.0);
    item.style.setProperty('--depth-scale', scale.toFixed(3));
    item.style.setProperty('--depth-opacity', opacity.toFixed(2));
    item.style.setProperty('--depth-blur', blur.toFixed(1) + 'px');
  });

  // 3D tilt on hover (skip center item and nav creatures)
  items.forEach(function (item) {
    if (item.classList.contains('nav-creature')) return;
    if (item.classList.contains('fixed-center')) return;
    item.addEventListener('mousemove', function (e) {
      var rect = item.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var tiltX = (y - 0.5) * -20;
      var tiltY = (x - 0.5) * 20;
      if (!item.classList.contains('spinning')) {
        item.style.animation = 'none';
        item.style.transform = 'perspective(600px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
      }
    });
    item.addEventListener('mouseleave', function () {
      if (!item.classList.contains('spinning')) {
        item.style.transform = '';
        item.style.animation = '';
      }
    });
  });

})();
