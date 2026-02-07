/* Viewport pan, zoom, drag, tick loop */
(function () {
  var vp = document.getElementById('viewport');
  var art = document.getElementById('artwork');

  var targetN = { x: 0, y: 0 };
  var current = { x: 0, y: 0 };

  function updateArtworkSize() {
    var vpW = vp.clientWidth;
    var vpH = vp.clientHeight;
    document.documentElement.style.setProperty('--artwork-width', vpW + 'px');
    document.documentElement.style.setProperty('--artwork-height', vpH + 'px');
  }

  updateArtworkSize();
  window.addEventListener('resize', updateArtworkSize);

  function getZoom() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom')) || 1.0;
  }
  function setZoom(v) {
    document.documentElement.style.setProperty('--zoom', v.toFixed(2));
  }
  function panRange() {
    var zoom = getZoom();
    var vpW = vp.clientWidth, vpH = vp.clientHeight;
    var canvasW = art.offsetWidth * zoom;
    var canvasH = art.offsetHeight * zoom;
    var rangeX = Math.max(0, (canvasW - vpW) / 2);
    var rangeY = Math.max(0, (canvasH - vpH) / 2);
    return { rangeX: rangeX, rangeY: rangeY };
  }

  function hoverToTarget(e) {
    var r = vp.getBoundingClientRect();
    var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    targetN.x = -nx;
    targetN.y = -ny;
  }

  var dragging = false, startPx = null, startTarget = null;
  vp.addEventListener('pointerdown', function (e) {
    dragging = true;
    startPx = { x: e.clientX, y: e.clientY };
    startTarget = { x: targetN.x, y: targetN.y };
    if (vp.setPointerCapture) vp.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'grabbing';
  });
  vp.addEventListener('pointermove', function (e) {
    if (dragging) {
      var r = vp.getBoundingClientRect();
      var dx = ((e.clientX - startPx.x) / r.width) * 2;
      var dy = ((e.clientY - startPx.y) / r.height) * 2;
      targetN.x = Math.max(-1, Math.min(1, startTarget.x + dx));
      targetN.y = Math.max(-1, Math.min(1, startTarget.y + dy));
    } else if (e.pointerType === 'mouse') {
      hoverToTarget(e);
    }
  }, { passive: true });
  window.addEventListener('pointerup', function () {
    dragging = false;
    document.body.style.cursor = '';
  });

  vp.addEventListener('touchmove', function (e) {
    if (dragging) e.preventDefault();
  }, { passive: false });

  // Prevent double-click/double-tap zoom
  vp.addEventListener('dblclick', function (e) { e.preventDefault(); });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  function tick() {
    var pr = panRange();
    var targetPx = { x: targetN.x * pr.rangeX, y: targetN.y * pr.rangeY };
    var ease = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--easing')) || 0.08;
    current.x += (targetPx.x - current.x) * ease;
    current.y += (targetPx.y - current.y) * ease;
    art.style.transform = 'translate3d(' + current.x + 'px, ' + current.y + 'px, 0) scale(' + getZoom() + ')';
    requestAnimationFrame(tick);
  }

  setZoom(1.0);
  requestAnimationFrame(tick);
})();
