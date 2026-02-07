/* Canvas particle system and trumpet emitters */
(function () {
  var C = window.CONFIG.particles;
  var centerEl = document.querySelector('.fixed-center');

  var pCanvas = document.createElement('canvas');
  pCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99;';
  document.getElementById('viewport').appendChild(pCanvas);
  var pCtx = pCanvas.getContext('2d');

  function resizePCanvas() { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; }
  resizePCanvas();
  window.addEventListener('resize', resizePCanvas);

  // Expose particles array for explode module
  window._particles = [];
  window._pColors = C.colors;

  function emitBurst(hole, big) {
    if (!centerEl) return;
    var rect = centerEl.getBoundingClientRect();
    var ox = rect.left + rect.width * hole.rx;
    var oy = rect.top + rect.height * hole.ry;
    var rad = (hole.angle + (Math.random() - 0.5) * 50) * Math.PI / 180;
    var sz = big ? C.bigBurstSize : C.smallBurstSize;
    var burstCount = sz.min + Math.floor(Math.random() * (sz.max - sz.min));

    for (var i = 0; i < burstCount; i++) {
      var spd = big ? (2 + Math.random() * 5) : (1 + Math.random() * 3);
      var spread = (Math.random() - 0.5) * 0.7;
      window._particles.push({
        x: ox + (Math.random() - 0.5) * 8,
        y: oy + (Math.random() - 0.5) * 8,
        vx: Math.cos(rad + spread) * spd,
        vy: Math.sin(rad + spread) * spd,
        life: 1,
        decay: 0.005 + Math.random() * 0.012,
        size: 1.5 + Math.random() * (big ? 5.5 : 3.5),
        color: C.colors[Math.floor(Math.random() * C.colors.length)],
      });
    }
  }

  function emitSmall() {
    var hole = C.outlets[Math.floor(Math.random() * C.outlets.length)];
    emitBurst(hole, false);
  }

  function emitEruption() {
    var count = C.eruptionOutlets.min + Math.floor(Math.random() * (C.eruptionOutlets.max - C.eruptionOutlets.min));
    var used = new Set();
    for (var i = 0; i < count; i++) {
      var idx;
      do { idx = Math.floor(Math.random() * C.outlets.length); } while (used.has(idx) && used.size < C.outlets.length);
      used.add(idx);
      emitBurst(C.outlets[idx], true);
    }
    playSound('trumpet');
  }

  (function scheduleSmall() {
    setTimeout(function () { emitSmall(); scheduleSmall(); }, C.smallInterval.min + Math.random() * C.smallInterval.range);
  })();

  (function scheduleEruption() {
    setTimeout(function () { emitEruption(); scheduleEruption(); }, C.bigInterval.min + Math.random() * C.bigInterval.range);
  })();

  function updateParticles() {
    var particles = window._particles;
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.02;
      p.vx *= 0.99;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      pCtx.globalAlpha = p.life * 0.7;
      pCtx.fillStyle = p.color;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      pCtx.fill();
    }
    pCtx.globalAlpha = 1;
    requestAnimationFrame(updateParticles);
  }
  requestAnimationFrame(updateParticles);
})();
