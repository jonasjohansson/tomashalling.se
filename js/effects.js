/* Light leaks, DOF, PostFX loop */
(function () {
  var C = window.CONFIG;
  var items = document.querySelectorAll('.artwork-item');

  // --- PostFX Params (mutable at runtime) ---
  window.PostFXParams = {
    hueRotate: C.postfx.hueRotate,
    hueSpeed: C.postfx.hueSpeed,
    saturate: C.postfx.saturate,
    contrast: C.postfx.contrast,
    brightness: C.postfx.brightness,
    scanlineOpacity: C.postfx.scanlineOpacity,
    rgbShiftOpacity: C.postfx.rgbShiftOpacity,
    bgSpeed: C.postfx.bgSpeed,
    dofEnabled: C.postfx.dofEnabled,
    dofMaxBlur: C.postfx.dofMaxBlur,
    dofFocusRadius: C.postfx.dofFocusRadius,
    lightLeakOpacity: C.postfx.lightLeakOpacity,
  };

  // --- Light leaks ---
  var LC = C.lightLeaks;
  var leakContainer = document.createElement('div');
  leakContainer.id = 'light-leaks';
  leakContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:98;overflow:hidden;mix-blend-mode:screen;';
  document.getElementById('viewport').appendChild(leakContainer);

  for (var i = 0; i < LC.count; i++) {
    var leak = document.createElement('div');
    var size = LC.sizeRange.min + Math.random() * LC.sizeRange.range;
    var dur = LC.durationRange.min + Math.random() * LC.durationRange.range;
    var delay = Math.random() * -dur;
    var startX = Math.random() * 100;
    var startY = Math.random() * 100;
    leak.style.cssText =
      'position:absolute;' +
      'width:' + size + 'px; height:' + size + 'px;' +
      'border-radius:50%;' +
      'background: radial-gradient(circle, ' + LC.colors[i % LC.colors.length] + ', transparent 70%);' +
      'filter: blur(' + LC.blur + 'px);' +
      'left:' + startX + '%; top:' + startY + '%;' +
      'animation: leakDrift' + i + ' ' + dur + 's ease-in-out ' + delay + 's infinite;' +
      'opacity: var(--leak-opacity, 0.5);';
    leakContainer.appendChild(leak);
  }

  var leakStyle = document.createElement('style');
  leakStyle.textContent =
    '@keyframes leakDrift0 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(40vw,20vh)} 66%{transform:translate(-20vw,40vh)} }' +
    '@keyframes leakDrift1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-30vw,30vh)} 66%{transform:translate(30vw,-20vh)} }' +
    '@keyframes leakDrift2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20vw,-30vh)} 66%{transform:translate(-40vw,10vh)} }' +
    '@keyframes leakDrift3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-10vw,-20vh)} 66%{transform:translate(50vw,30vh)} }';
  document.head.appendChild(leakStyle);

  // --- Depth of Field ---
  var lastDofUpdate = 0;
  function updateDOF(time) {
    if (time - lastDofUpdate < 50) { requestAnimationFrame(updateDOF); return; }
    lastDofUpdate = time;
    var p = window.PostFXParams;
    if (!p.dofEnabled) {
      items.forEach(function (item) {
        var db = parseFloat(item.style.getPropertyValue('--depth-blur')) || 0;
        item.style.filter = db > 0 ? 'blur(' + db + 'px)' : '';
      });
      requestAnimationFrame(updateDOF); return;
    }
    var maxBlur = p.dofMaxBlur;
    var focusR = p.dofFocusRadius;
    var screenCX = window.innerWidth / 2;
    var screenCY = window.innerHeight / 2;

    items.forEach(function (item) {
      var depthBlur = parseFloat(item.style.getPropertyValue('--depth-blur')) || 0;
      if (item.classList.contains('fixed-center')) { item.style.filter = ''; return; }
      var rect = item.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = cx - screenCX, dy = cy - screenCY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var dofBlur = Math.min(maxBlur, Math.max(0, (dist - focusR) / focusR * maxBlur));
      var totalBlur = Math.round((dofBlur + depthBlur) * 2) / 2;
      item.style.filter = totalBlur > 0 ? 'blur(' + totalBlur + 'px)' : '';
    });
    requestAnimationFrame(updateDOF);
  }
  requestAnimationFrame(updateDOF);

  // --- Bloom layer ---
  var BC = C.bloom;
  if (BC.enabled) {
    var bloomEl = document.createElement('div');
    bloomEl.id = 'bloom-layer';
    bloomEl.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:9;' +
      'mix-blend-mode:screen;' +
      'filter:blur(' + BC.blur + 'px) brightness(' + BC.brightness + ');' +
      'opacity:' + BC.opacity + ';' +
      'background:transparent;';
    document.getElementById('viewport').appendChild(bloomEl);

    // Mirror the artwork transform into the bloom layer via a canvas snapshot
    var bloomCanvas = document.createElement('canvas');
    var bloomCtx = bloomCanvas.getContext('2d');
    bloomCanvas.style.cssText = 'width:100%;height:100%;';
    bloomEl.appendChild(bloomCanvas);

    function updateBloom() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      if (bloomCanvas.width !== w || bloomCanvas.height !== h) {
        bloomCanvas.width = w;
        bloomCanvas.height = h;
      }
      bloomCtx.clearRect(0, 0, w, h);
      // Draw each visible artwork item as a bright rectangle at its screen position
      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        if (rect.right < 0 || rect.bottom < 0 || rect.left > w || rect.top > h) return;
        var img = item.querySelector('img, canvas');
        if (!img) return;
        try {
          bloomCtx.drawImage(img, rect.left, rect.top, rect.width, rect.height);
        } catch (e) { /* cross-origin or not loaded */ }
      });
      requestAnimationFrame(updateBloom);
    }
    requestAnimationFrame(updateBloom);
  }

  // --- PostFX animation loop ---
  var postFXTime = 0;
  function updatePostFX() {
    var p = window.PostFXParams;
    postFXTime += 0.016;

    var hue = p.hueRotate + Math.sin(postFXTime * p.hueSpeed) * 30 * Math.min(p.hueSpeed, 1);
    var vpEl = document.getElementById('viewport');
    vpEl.style.setProperty('--hue-rotate', hue + 'deg');
    vpEl.style.setProperty('--saturate', p.saturate);
    vpEl.style.setProperty('--contrast', p.contrast);
    vpEl.style.setProperty('--brightness', p.brightness);

    document.body.style.setProperty('--bg-speed', (25 / Math.max(0.1, p.bgSpeed)) + 's');

    leakContainer.style.setProperty('--leak-opacity', p.lightLeakOpacity);

    requestAnimationFrame(updatePostFX);
  }
  updatePostFX();
})();
