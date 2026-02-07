(() => {
  const vp = document.getElementById("viewport");
  const art = document.getElementById("artwork");

  let targetN = { x: 0, y: 0 }; // normalized [-1,1]
  let current = { x: 0, y: 0 }; // px position eased

  // Calculate artwork size based on viewport dimensions
  // Width: viewport width (1/24 col = 1/24 of viewport width)
  // Height: viewport height (1/24 row = 1/24 of viewport height)
  function updateArtworkSize() {
    const vpW = vp.clientWidth;
    const vpH = vp.clientHeight;
    document.documentElement.style.setProperty("--artwork-width", `${vpW}px`);
    document.documentElement.style.setProperty("--artwork-height", `${vpH}px`);
  }

  // Update artwork size on load and resize
  updateArtworkSize();
  window.addEventListener("resize", updateArtworkSize);

  function getZoom() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--zoom")) || 1.0;
  }
  function setZoom(v) {
    document.documentElement.style.setProperty("--zoom", v.toFixed(2));
  }
  function panRange() {
    const zoom = getZoom();
    const vpW = vp.clientWidth,
      vpH = vp.clientHeight;
    const canvasW = art.offsetWidth * zoom;
    const canvasH = art.offsetHeight * zoom;
    const rangeX = Math.max(0, (canvasW - vpW) / 2);
    const rangeY = Math.max(0, (canvasH - vpH) / 2);
    return { rangeX, rangeY };
  }

  // Hover-follow (mouse only, when not dragging)
  function hoverToTarget(e) {
    const r = vp.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    targetN.x = -nx; // invert so moving to TL reveals TL
    targetN.y = -ny;
  }

  // Drag-to-pan (mouse or touch) — moves art with finger/mouse
  let dragging = false,
    startPx = null,
    startTarget = null;
  vp.addEventListener("pointerdown", (e) => {
    dragging = true;
    startPx = { x: e.clientX, y: e.clientY };
    startTarget = { ...targetN };
    vp.setPointerCapture?.(e.pointerId);
    document.body.style.cursor = "grabbing";
  });
  vp.addEventListener(
    "pointermove",
    (e) => {
      if (dragging) {
        const r = vp.getBoundingClientRect();
        const dx = ((e.clientX - startPx.x) / r.width) * 2;
        const dy = ((e.clientY - startPx.y) / r.height) * 2;
        targetN.x = Math.max(-1, Math.min(1, startTarget.x + dx));
        targetN.y = Math.max(-1, Math.min(1, startTarget.y + dy));
      } else if (e.pointerType === "mouse") {
        hoverToTarget(e);
      }
    },
    { passive: true }
  );
  window.addEventListener("pointerup", () => {
    dragging = false;
    document.body.style.cursor = "";
  });

  // Prevent page scroll when dragging on touch
  vp.addEventListener(
    "touchmove",
    (e) => {
      if (dragging) e.preventDefault();
    },
    { passive: false }
  );

  function tick() {
    const { rangeX, rangeY } = panRange();
    const targetPx = { x: targetN.x * rangeX, y: targetN.y * rangeY };
    const ease = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--easing")) || 0.08;
    current.x += (targetPx.x - current.x) * ease;
    current.y += (targetPx.y - current.y) * ease;
    art.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) scale(${getZoom()})`;
    requestAnimationFrame(tick);
  }

  setZoom(1.0);
  requestAnimationFrame(tick);

  // --- 3D float & tilt effects ---
  const items = document.querySelectorAll('.artwork-item');
  const letters = document.querySelectorAll('.name-letter');

  // Non-letter artwork items get CSS animation float
  items.forEach((item) => {
    if (item.classList.contains('name-letter')) return; // letters handled in JS loop
    const dur = 3 + Math.random() * 4;
    const delay = Math.random() * -dur;
    const floatY = -(4 + Math.random() * 8);
    const floatX = (Math.random() - 0.5) * 6;
    const floatRx = (Math.random() - 0.5) * 4;
    const floatRy = (Math.random() - 0.5) * 3;

    item.style.setProperty('--float-duration', `${dur.toFixed(1)}s`);
    item.style.setProperty('--float-delay', `${delay.toFixed(1)}s`);
    item.style.setProperty('--float-y', `${floatY.toFixed(1)}px`);
    item.style.setProperty('--float-x', `${floatX.toFixed(1)}px`);
    item.style.setProperty('--float-rx', `${floatRx.toFixed(1)}deg`);
    item.style.setProperty('--float-ry', `${floatRy.toFixed(1)}deg`);
  });

  // 3D tilt on hover for non-letter artwork (skip center item)
  items.forEach(item => {
    if (item.classList.contains('name-letter')) return;
    if (item.classList.contains('fixed-center')) return;
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * -20;
      const tiltY = (x - 0.5) * 20;
      if (!item.classList.contains('spinning')) {
        item.style.animation = 'none';
        item.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }
    });
    item.addEventListener('mouseleave', () => {
      if (!item.classList.contains('spinning')) {
        item.style.transform = '';
        item.style.animation = '';
      }
    });
  });

  // --- Global mouse tracking ---
  let mouseX = -9999, mouseY = -9999, lastMX = 0, lastMY = 0;
  window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  // =============================================
  //  LETTER PHYSICS: float + repel + scramble
  // =============================================
  const REPEL_RADIUS = 130;
  const REPEL_STRENGTH = 70;

  const letterState = [];
  letters.forEach((el) => {
    el.style.animation = 'none';
    letterState.push({
      el,
      phase: Math.random() * Math.PI * 2,
      freqX: 0.3 + Math.random() * 0.4,
      freqY: 0.4 + Math.random() * 0.5,
      freqR: 0.2 + Math.random() * 0.3,
      ampX: 2 + Math.random() * 4,
      ampY: 4 + Math.random() * 8,
      ampR: 2 + Math.random() * 5,
      repelX: 0, repelY: 0,
      scramX: 0, scramY: 0, scramR: 0,
      tScramX: 0, tScramY: 0, tScramR: 0,
    });
  });

  function updateLetters(time) {
    const t = time * 0.001;
    for (const s of letterState) {
      if (s.el.classList.contains('spinning')) continue;

      const floatX = Math.sin(t * s.freqX + s.phase) * s.ampX;
      const floatY = Math.sin(t * s.freqY + s.phase * 1.3) * s.ampY;
      const floatR = Math.sin(t * s.freqR + s.phase * 0.7) * s.ampR;

      // Cursor repulsion
      const rect = s.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - mouseX, dy = cy - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let trX = 0, trY = 0;
      if (dist < REPEL_RADIUS && dist > 0) {
        const f = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
        trX = (dx / dist) * f; trY = (dy / dist) * f;
      }
      const repE = (Math.abs(trX) + Math.abs(trY) > 0.5) ? 0.25 : 0.04;
      s.repelX += (trX - s.repelX) * repE;
      s.repelY += (trY - s.repelY) * repE;

      // Scramble easing
      s.scramX += (s.tScramX - s.scramX) * 0.05;
      s.scramY += (s.tScramY - s.scramY) * 0.05;
      s.scramR += (s.tScramR - s.scramR) * 0.05;

      const tx = floatX + s.repelX + s.scramX;
      const ty = floatY + s.repelY + s.scramY;
      const rot = floatR + s.scramR;

      s.el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
    }
    requestAnimationFrame(updateLetters);
  }
  requestAnimationFrame(updateLetters);

  // =============================================
  //  ARTWORK STATE — drag offsets for non-letter items
  // =============================================
  const artState = new Map();
  items.forEach(item => {
    if (item.classList.contains('name-letter')) return;
    artState.set(item, { dragX: 0, dragY: 0 });
  });

  function applyArtTranslate(item, st) {
    item.style.translate = `${st.dragX}px ${st.dragY}px`;
  }

  // =============================================
  //  DRAGGABLE ARTWORK ITEMS
  // =============================================
  items.forEach(item => {
    if (item.classList.contains('name-letter')) return;
    if (item.classList.contains('fixed-center')) return; // center item not draggable
    const st = artState.get(item);
    let isDragging = false, startX, startY, startDX, startDY;

    item.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      startDX = st.dragX; startDY = st.dragY;
      item.setPointerCapture(e.pointerId);
      item.style.cursor = 'grabbing';
      item.style.zIndex = '50';
    });
    item.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      st.dragX = startDX + (e.clientX - startX);
      st.dragY = startDY + (e.clientY - startY);
      applyArtTranslate(item, st);
    });
    item.addEventListener('pointerup', () => {
      isDragging = false;
      item.style.cursor = '';
      item.style.zIndex = '';
    });
  });

  // =============================================
  //  RANDOM CHAOS SPINS
  // =============================================
  function triggerRandomSpin() {
    const allItems = document.querySelectorAll('.artwork-item');
    const candidates = Array.from(allItems).filter(el => !el.classList.contains('fixed-center'));
    if (!candidates.length) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    if (target.classList.contains('spinning')) return;
    target.classList.add('spinning');
    playSound('spin');
    target.addEventListener('animationend', () => {
      target.classList.remove('spinning');
      target.style.transform = '';
      target.style.animation = '';
    }, { once: true });
  }
  (function scheduleSpin() {
    setTimeout(() => { triggerRandomSpin(); scheduleSpin(); }, 2000 + Math.random() * 4000);
  })();

  // =============================================
  //  LETTER SCRAMBLE
  // =============================================
  function triggerScramble() {
    playSound('scramble');
    for (const s of letterState) {
      s.tScramX = (Math.random() - 0.5) * 350;
      s.tScramY = (Math.random() - 0.5) * 250;
      s.tScramR = (Math.random() - 0.5) * 180;
    }
    setTimeout(() => {
      for (const s of letterState) { s.tScramX = 0; s.tScramY = 0; s.tScramR = 0; }
    }, 1800);
  }
  (function scheduleScramble() {
    setTimeout(() => { triggerScramble(); scheduleScramble(); }, 18000 + Math.random() * 22000);
  })();

  // =============================================
  //  TRUMPET PARTICLE EMITTERS — fire from center creature's holes
  // =============================================
  const pCanvas = document.createElement('canvas');
  pCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99;';
  document.getElementById('viewport').appendChild(pCanvas);
  const pCtx = pCanvas.getContext('2d');
  function resizePCanvas() { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; }
  resizePCanvas();
  window.addEventListener('resize', resizePCanvas);

  const PCOLORS = ['#e36b2e','#FFE066','#87CEEB','#FF8C42','#D44226','#70B8D8','#FFF8A0'];
  const particles = [];
  const centerEl = document.querySelector('.fixed-center');

  // Outlet positions as % offsets from center element's top-left
  const OUTLETS = [
    { rx: 0.22, ry: 0.18, angle: -120 },  // top-left trumpet
    { rx: 0.78, ry: 0.15, angle: -60 },   // top-right trumpet
    { rx: 0.15, ry: 0.55, angle: -150 },  // left-middle trumpet
    { rx: 0.85, ry: 0.50, angle: -30 },   // right-middle trumpet
    { rx: 0.50, ry: 0.08, angle: -90 },   // top-center trumpet
    { rx: 0.35, ry: 0.35, angle: -135 },  // inner upper-left
    { rx: 0.65, ry: 0.35, angle: -45 },   // inner upper-right
    { rx: 0.50, ry: 0.70, angle: 90 },    // bottom-center vent
    { rx: 0.25, ry: 0.75, angle: 150 },   // bottom-left vent
    { rx: 0.75, ry: 0.75, angle: 30 },    // bottom-right vent
    { rx: 0.10, ry: 0.35, angle: -170 },  // far-left nozzle
    { rx: 0.90, ry: 0.35, angle: -10 },   // far-right nozzle
  ];

  function emitBurst(hole, big) {
    if (!centerEl) return;
    const rect = centerEl.getBoundingClientRect();
    const ox = rect.left + rect.width * hole.rx;
    const oy = rect.top + rect.height * hole.ry;
    const rad = (hole.angle + (Math.random() - 0.5) * 50) * Math.PI / 180;
    const burstCount = big ? (10 + Math.floor(Math.random() * 14)) : (4 + Math.floor(Math.random() * 8));

    for (let i = 0; i < burstCount; i++) {
      const spd = big ? (2 + Math.random() * 5) : (1 + Math.random() * 3);
      const spread = (Math.random() - 0.5) * 0.7;
      particles.push({
        x: ox + (Math.random() - 0.5) * 8,
        y: oy + (Math.random() - 0.5) * 8,
        vx: Math.cos(rad + spread) * spd,
        vy: Math.sin(rad + spread) * spd,
        life: 1,
        decay: 0.005 + Math.random() * 0.012,
        size: 1.5 + Math.random() * (big ? 5.5 : 3.5),
        color: PCOLORS[Math.floor(Math.random() * PCOLORS.length)],
      });
    }
  }

  // Single outlet burst (frequent, small)
  function emitSmall() {
    const hole = OUTLETS[Math.floor(Math.random() * OUTLETS.length)];
    emitBurst(hole, false);
  }

  // Multi-outlet eruption (less frequent, dramatic)
  function emitEruption() {
    const count = 2 + Math.floor(Math.random() * 4); // 2-5 outlets at once
    const used = new Set();
    for (let i = 0; i < count; i++) {
      let idx;
      do { idx = Math.floor(Math.random() * OUTLETS.length); } while (used.has(idx) && used.size < OUTLETS.length);
      used.add(idx);
      emitBurst(OUTLETS[idx], true);
    }
    playSound('trumpet');
  }

  // Frequent small puffs every 1.5-4s
  (function scheduleSmall() {
    setTimeout(() => { emitSmall(); scheduleSmall(); }, 1500 + Math.random() * 2500);
  })();

  // Big eruptions every 6-14s
  (function scheduleEruption() {
    setTimeout(() => { emitEruption(); scheduleEruption(); }, 6000 + Math.random() * 8000);
  })();

  function updateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.02; // slight gravity
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

  // =============================================
  //  LIGHT LEAKS
  // =============================================
  const leakContainer = document.createElement('div');
  leakContainer.id = 'light-leaks';
  leakContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:98;overflow:hidden;mix-blend-mode:screen;';
  document.getElementById('viewport').appendChild(leakContainer);

  const LEAK_COLORS = [
    'rgba(255,140,60,0.12)', 'rgba(255,220,80,0.10)', 'rgba(212,66,38,0.08)',
    'rgba(135,206,235,0.07)', 'rgba(255,100,40,0.10)', 'rgba(255,248,160,0.08)',
  ];
  for (let i = 0; i < 4; i++) {
    const leak = document.createElement('div');
    const size = 300 + Math.random() * 500;
    const dur = 15 + Math.random() * 20;
    const delay = Math.random() * -dur;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    leak.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background: radial-gradient(circle, ${LEAK_COLORS[i % LEAK_COLORS.length]}, transparent 70%);
      filter: blur(60px);
      left:${startX}%; top:${startY}%;
      animation: leakDrift${i} ${dur}s ease-in-out ${delay}s infinite;
      opacity: var(--leak-opacity, 0.5);
    `;
    leakContainer.appendChild(leak);
  }

  // Inject leak keyframes
  const leakStyle = document.createElement('style');
  leakStyle.textContent = `
    @keyframes leakDrift0 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(40vw,20vh)} 66%{transform:translate(-20vw,40vh)} }
    @keyframes leakDrift1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-30vw,30vh)} 66%{transform:translate(30vw,-20vh)} }
    @keyframes leakDrift2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20vw,-30vh)} 66%{transform:translate(-40vw,10vh)} }
    @keyframes leakDrift3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-10vw,-20vh)} 66%{transform:translate(50vw,30vh)} }
  `;
  document.head.appendChild(leakStyle);

  // =============================================
  //  DEPTH OF FIELD — items near screen center are sharp, far items blur
  // =============================================
  const DOF_FOCUS_RADIUS = 200;
  const DOF_MAX_BLUR = 3.5;
  let lastDofUpdate = 0;

  function updateDOF(time) {
    if (time - lastDofUpdate < 50) { requestAnimationFrame(updateDOF); return; } // throttle to ~20fps
    lastDofUpdate = time;
    const p = window.PostFXParams;
    if (!p.dofEnabled) {
      items.forEach(item => { item.style.filter = ''; });
      requestAnimationFrame(updateDOF); return;
    }
    const maxBlur = p.dofMaxBlur || DOF_MAX_BLUR;
    const focusR = p.dofFocusRadius || DOF_FOCUS_RADIUS;
    const screenCX = window.innerWidth / 2;
    const screenCY = window.innerHeight / 2;

    items.forEach(item => {
      // Center item is always sharp
      if (item.classList.contains('fixed-center')) { item.style.filter = ''; return; }
      const rect = item.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - screenCX, dy = cy - screenCY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const blur = Math.min(maxBlur, Math.max(0, (dist - focusR) / focusR * maxBlur));
      const rounded = Math.round(blur * 2) / 2;
      item.style.filter = rounded > 0 ? `blur(${rounded}px)` : '';
    });
    requestAnimationFrame(updateDOF);
  }
  requestAnimationFrame(updateDOF);

  // =============================================
  //  SOUND SYSTEM — Web Audio API placeholders
  // =============================================
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playSound(type) {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'click') {
        // Short percussive blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'spin') {
        // Whirring sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.6);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'scramble') {
        // Chaotic warble
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(500, now + 0.05);
        osc.frequency.setValueAtTime(200, now + 0.1);
        osc.frequency.setValueAtTime(700, now + 0.15);
        osc.frequency.setValueAtTime(350, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'trumpet') {
        // Airy burst — like a little trumpet puff
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500 + Math.random() * 300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) { /* audio not available */ }
  }

  // Add click sounds to all artwork items
  items.forEach(item => {
    item.addEventListener('pointerdown', () => { playSound('click'); });
  });

  // Circle nav: handle all navigation via JS
  // stopPropagation on pointerdown prevents viewport pan from capturing the pointer
  document.querySelectorAll('.circle-nav-link').forEach(link => {
    link.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playSound('click');
      const overlayId = link.getAttribute('data-overlay');
      if (overlayId) {
        const overlay = document.getElementById(overlayId + '-overlay');
        if (overlay) { overlay.classList.add('open'); overlay.removeAttribute('hidden'); }
        return;
      }
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      if (href.startsWith('mailto:')) {
        window.location.href = href;
      } else {
        window.open(href, '_blank');
      }
    });
  });

  // Overlay close logic
  document.querySelectorAll('.overlay').forEach(overlay => {
    const backdrop = overlay.querySelector('.overlay-backdrop');
    const closeBtn = overlay.querySelector('.overlay-close');
    function closeOverlay() { overlay.classList.remove('open'); }
    if (backdrop) backdrop.addEventListener('click', closeOverlay);
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    }
  });

  // =============================================
  //  POST FX PARAMS
  // =============================================
  window.PostFXParams = {
    hueRotate: 0,
    hueSpeed: 0,
    saturate: 1.0,
    contrast: 1.0,
    brightness: 1.0,
    scanlineOpacity: 0.0,
    rgbShiftOpacity: 0.0,
    bgSpeed: 1.0,
    dofEnabled: true,
    dofMaxBlur: 3.5,
    dofFocusRadius: 200,
    lightLeakOpacity: 0.5,
  };

  // Post FX animation loop
  let postFXTime = 0;
  function updatePostFX() {
    const p = window.PostFXParams;
    postFXTime += 0.016;

    const hue = p.hueRotate + Math.sin(postFXTime * p.hueSpeed) * 30 * Math.min(p.hueSpeed, 1);
    const vpEl = document.getElementById('viewport');
    vpEl.style.setProperty('--hue-rotate', `${hue}deg`);
    vpEl.style.setProperty('--saturate', p.saturate);
    vpEl.style.setProperty('--contrast', p.contrast);
    vpEl.style.setProperty('--brightness', p.brightness);

    document.getElementById('postfx-scanlines').style.setProperty('--scanline-opacity', p.scanlineOpacity);
    document.getElementById('postfx-rgb-shift').style.setProperty('--rgb-shift-opacity', p.rgbShiftOpacity);
    document.body.style.setProperty('--bg-speed', `${25 / Math.max(0.1, p.bgSpeed)}s`);

    // Light leak opacity
    leakContainer.style.setProperty('--leak-opacity', p.lightLeakOpacity);

    requestAnimationFrame(updatePostFX);
  }
  updatePostFX();

  // Function to make white pixels transparent in video using canvas
  function makeVideoTransparent(video) {
    // Check if canvas already exists for this video
    const container = video.parentElement;
    const existingCanvas = container.querySelector("canvas");
    if (existingCanvas) {
      return; // Already processed
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to match video
    function resizeCanvas() {
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
    }

    // Process video frame and make white transparent
    function processFrame() {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          resizeCanvas();
        }

        // Draw current video frame to canvas (works even when paused)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Threshold for white (adjust this value to control sensitivity)
        // Higher value = more colors become transparent (default: 240)
        const whiteThreshold = 240;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is white or near-white
          if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
            // Make pixel transparent
            data[i + 3] = 0; // alpha channel
          }
        }

        // Put processed image data back
        ctx.putImageData(imageData, 0, 0);
      }

      // Continue processing frames (even when paused, to show current frame)
      requestAnimationFrame(processFrame);
    }

    // Set canvas styles to match video
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.objectFit = "contain";

    // Hide video and add canvas
    video.style.display = "none";
    video.style.visibility = "hidden";
    video.style.position = "absolute";
    container.appendChild(canvas);

    // Start processing when video is ready (video will play on hover)
    video.addEventListener("loadedmetadata", () => {
      resizeCanvas();
      processFrame();
    });

    // Also start processing if video is already loaded
    if (video.readyState >= 1) {
      resizeCanvas();
      processFrame();
    }
  }

  // Process existing video elements to make white transparent
  function processExistingVideos() {
    document.querySelectorAll(".artwork-item video").forEach((video) => {
      // Skip if already processed
      if (video.dataset.processed === "true") {
        return;
      }

      // Check if canvas already exists (video already processed)
      const container = video.parentElement;
      if (container && container.querySelector("canvas")) {
        video.dataset.processed = "true";
        return;
      }

      // Check if video has a source (either src attribute or src property)
      const hasSource = video.src || video.getAttribute("src") || video.querySelector("source");

      if (hasSource) {
        // Mark as processed immediately to prevent duplicate processing
        video.dataset.processed = "true";

        // Ensure video has correct attributes (no autoplay - will play on hover)
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        // Get the artwork item container for hover events
        const artworkItem = video.closest(".artwork-item");

        // Add hover event listeners to play/pause video
        if (artworkItem) {
          artworkItem.addEventListener("mouseenter", () => {
            if (video.readyState >= 2) {
              video.play().catch((err) => {
                console.log("Video play prevented:", err);
              });
            }
          });

          artworkItem.addEventListener("mouseleave", () => {
            video.pause();
            // Reset to beginning when mouse leaves
            video.currentTime = 0;
          });
        }

        // If video is already loaded, process immediately
        if (video.readyState >= 2 && video.videoWidth > 0) {
          makeVideoTransparent(video);
        } else {
          // Wait for video to load metadata before processing
          const handleLoad = () => {
            if (video.videoWidth > 0) {
              makeVideoTransparent(video);
            }
          };
          video.addEventListener("loadedmetadata", handleLoad, { once: true });
          video.addEventListener("loadeddata", handleLoad, { once: true });
          video.addEventListener("canplay", handleLoad, { once: true });

          // Ensure video is loading
          if (video.readyState === 0) {
            video.load();
          }
        }
      }
    });
  }

  // Process videos when DOM is ready (only once)
  let videosProcessed = false;
  function processVideosOnce() {
    if (!videosProcessed) {
      videosProcessed = true;
      processExistingVideos();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processVideosOnce);
  } else {
    processVideosOnce();
  }

  // Also process videos after a short delay to catch any that load later (but only if not already processed)
  setTimeout(() => {
    if (!videosProcessed) {
      processVideosOnce();
    }
  }, 100);
})();
