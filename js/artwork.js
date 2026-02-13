/* Artwork item float setup, depth, 3D tilt, drag, chaos spins */
(function () {
  var C = window.CONFIG;
  var items = document.querySelectorAll('.artwork-item');

  // Global mouse tracking (shared via window for letters/particles)
  window._mouseX = -9999;
  window._mouseY = -9999;
  window.addEventListener('mousemove', function (e) { window._mouseX = e.clientX; window._mouseY = e.clientY; });
  window.addEventListener('mouseleave', function () { window._mouseX = -9999; window._mouseY = -9999; });

  // Non-letter artwork items get CSS animation float + depth
  items.forEach(function (item) {
    if (item.classList.contains('name-letter')) return;
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

  // 3D tilt on hover for non-letter artwork (skip center item)
  items.forEach(function (item) {
    if (item.classList.contains('name-letter')) return;
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

  // Artwork drag state
  var artState = new Map();
  items.forEach(function (item) {
    if (item.classList.contains('name-letter')) return;
    artState.set(item, { dragX: 0, dragY: 0 });
  });

  function applyArtTranslate(item, st) {
    item.style.translate = st.dragX + 'px ' + st.dragY + 'px';
  }

  // Draggable artwork items
  items.forEach(function (item) {
    if (item.classList.contains('name-letter')) return;
    if (item.classList.contains('fixed-center')) return;
    var st = artState.get(item);
    var isDragging = false, startX, startY, startDX, startDY;

    item.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      startDX = st.dragX; startDY = st.dragY;
      item.setPointerCapture(e.pointerId);
      item.style.cursor = 'grabbing';
      item.style.zIndex = '50';
    });
    item.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      st.dragX = startDX + (e.clientX - startX);
      st.dragY = startDY + (e.clientY - startY);
      applyArtTranslate(item, st);
    });
    item.addEventListener('pointerup', function () {
      isDragging = false;
      item.style.cursor = '';
      item.style.zIndex = '';
    });
  });

  // Random chaos spins
  function triggerRandomSpin() {
    var allItems = document.querySelectorAll('.artwork-item');
    var candidates = Array.from(allItems).filter(function (el) { return !el.classList.contains('fixed-center'); });
    if (!candidates.length) return;
    var target = candidates[Math.floor(Math.random() * candidates.length)];
    if (target.classList.contains('spinning')) return;
    target.classList.add('spinning');
    target.addEventListener('animationend', function () {
      target.classList.remove('spinning');
      target.style.transform = '';
      target.style.animation = '';
    }, { once: true });
  }
  (function scheduleSpin() {
    var iv = C.spin.interval;
    setTimeout(function () { triggerRandomSpin(); scheduleSpin(); }, iv.min + Math.random() * iv.range);
  })();
})();
