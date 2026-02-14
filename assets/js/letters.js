/* Letter physics — float, repel, scramble */
(function () {
  var C = window.CONFIG.letters;
  var CA = window.CONFIG.artwork;
  var letters = document.querySelectorAll('.name-letter');

  var letterState = [];
  letters.forEach(function (el) {
    el.style.animation = 'none';
    var depth = CA.letterDepthRange.min + Math.random() * CA.letterDepthRange.range;
    var scale = 0.65 + depth * 0.4;
    var opacity = 0.5 + depth * 0.5;
    var blur = Math.max(0, (1 - depth) * 1.0);
    el.style.setProperty('--depth-scale', scale.toFixed(3));
    el.style.setProperty('--depth-opacity', opacity.toFixed(2));
    el.style.setProperty('--depth-blur', blur.toFixed(1) + 'px');
    letterState.push({
      el: el,
      depth: depth,
      phase: Math.random() * Math.PI * 2,
      freqX: (C.floatFreqX.min + Math.random() * C.floatFreqX.range) * (0.5 + depth * 0.5),
      freqY: (C.floatFreqY.min + Math.random() * C.floatFreqY.range) * (0.5 + depth * 0.5),
      freqR: C.floatFreqR.min + Math.random() * C.floatFreqR.range,
      ampX: (C.floatAmpX.min + Math.random() * C.floatAmpX.range) * depth,
      ampY: (C.floatAmpY.min + Math.random() * C.floatAmpY.range) * depth,
      ampR: (C.floatAmpR.min + Math.random() * C.floatAmpR.range) * depth,
      repelX: 0, repelY: 0,
      scramX: 0, scramY: 0, scramR: 0,
      tScramX: 0, tScramY: 0, tScramR: 0,
      dragX: 0, dragY: 0,
    });
  });

  // Expose for explode module
  window._letterState = letterState;

  function updateLetters(time) {
    var t = time * 0.001;
    for (var i = 0; i < letterState.length; i++) {
      var s = letterState[i];
      if (s.el.classList.contains('spinning')) continue;

      var floatX = Math.sin(t * s.freqX + s.phase) * s.ampX;
      var floatY = Math.sin(t * s.freqY + s.phase * 1.3) * s.ampY;
      var floatR = Math.sin(t * s.freqR + s.phase * 0.7) * s.ampR;

      var rect = s.el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = cx - window._mouseX, dy = cy - window._mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var trX = 0, trY = 0;
      if (dist < C.repelRadius && dist > 0) {
        var f = (1 - dist / C.repelRadius) * C.repelStrength;
        trX = (dx / dist) * f; trY = (dy / dist) * f;
      }
      var repE = (Math.abs(trX) + Math.abs(trY) > 0.5) ? 0.25 : 0.04;
      s.repelX += (trX - s.repelX) * repE;
      s.repelY += (trY - s.repelY) * repE;

      s.scramX += (s.tScramX - s.scramX) * 0.05;
      s.scramY += (s.tScramY - s.scramY) * 0.05;
      s.scramR += (s.tScramR - s.scramR) * 0.05;

      var tx = floatX + s.repelX + s.scramX + s.dragX;
      var ty = floatY + s.repelY + s.scramY + s.dragY;
      var rot = floatR + s.scramR;

      var sc = 0.65 + s.depth * 0.4;
      s.el.style.transform = 'translate3d(' + tx + 'px, ' + ty + 'px, 0) rotate(' + rot + 'deg) scale(' + sc.toFixed(3) + ')';
    }
    requestAnimationFrame(updateLetters);
  }
  requestAnimationFrame(updateLetters);

  // Scramble
  function triggerScramble() {
    for (var i = 0; i < letterState.length; i++) {
      var s = letterState[i];
      s.tScramX = (Math.random() - 0.5) * C.scrambleRange.x;
      s.tScramY = (Math.random() - 0.5) * C.scrambleRange.y;
      s.tScramR = (Math.random() - 0.5) * C.scrambleRange.r;
    }
    setTimeout(function () {
      for (var i = 0; i < letterState.length; i++) {
        letterState[i].tScramX = 0; letterState[i].tScramY = 0; letterState[i].tScramR = 0;
      }
    }, C.scrambleDuration);
  }
  (function scheduleScramble() {
    setTimeout(function () { triggerScramble(); scheduleScramble(); }, C.scrambleInterval.min + Math.random() * C.scrambleInterval.range);
  })();

  // Drag-to-reposition letters
  letterState.forEach(function (s) {
    var isDragging = false, startX, startY, startDX, startDY;
    s.el.style.cursor = 'grab';

    s.el.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      startDX = s.dragX; startDY = s.dragY;
      s.el.setPointerCapture(e.pointerId);
      s.el.style.cursor = 'grabbing';
      s.el.style.zIndex = '50';
    });
    s.el.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      s.dragX = startDX + (e.clientX - startX);
      s.dragY = startDY + (e.clientY - startY);
    });
    s.el.addEventListener('pointerup', function () {
      isDragging = false;
      s.el.style.cursor = 'grab';
      s.el.style.zIndex = '';
    });
  });
})();
