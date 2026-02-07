window.CONFIG = {
  postfx: {
    hueRotate: 0,
    hueSpeed: 0,
    saturate: 1.0,
    contrast: 1.0,
    brightness: 1.0,
    scanlineOpacity: 0.0,
    rgbShiftOpacity: 0.0,
    bgSpeed: 1.0,
    lightLeakOpacity: 0.5,
    dofEnabled: true,
    dofMaxBlur: 4,
    dofFocusRadius: 300,
  },

  particles: {
    colors: ['#e36b2e','#FFE066','#87CEEB','#FF8C42','#D44226','#70B8D8','#FFF8A0'],
    outlets: [
      { rx: 0.22, ry: 0.18, angle: -120 },
      { rx: 0.78, ry: 0.15, angle: -60 },
      { rx: 0.15, ry: 0.55, angle: -150 },
      { rx: 0.85, ry: 0.50, angle: -30 },
      { rx: 0.50, ry: 0.08, angle: -90 },
      { rx: 0.35, ry: 0.35, angle: -135 },
      { rx: 0.65, ry: 0.35, angle: -45 },
      { rx: 0.50, ry: 0.70, angle: 90 },
      { rx: 0.25, ry: 0.75, angle: 150 },
      { rx: 0.75, ry: 0.75, angle: 30 },
      { rx: 0.10, ry: 0.35, angle: -170 },
      { rx: 0.90, ry: 0.35, angle: -10 },
    ],
    smallBurstSize: { min: 4, max: 12 },
    bigBurstSize: { min: 10, max: 24 },
    smallInterval: { min: 1500, range: 2500 },
    bigInterval: { min: 6000, range: 8000 },
    eruptionOutlets: { min: 2, max: 6 },
  },

  letters: {
    repelRadius: 130,
    repelStrength: 70,
    floatAmpX: { min: 15, range: 30 },
    floatAmpY: { min: 20, range: 40 },
    floatAmpR: { min: 3, range: 8 },
    floatFreqX: { min: 0.15, range: 0.25 },
    floatFreqY: { min: 0.2, range: 0.3 },
    floatFreqR: { min: 0.1, range: 0.2 },
    scrambleRange: { x: 350, y: 250, r: 180 },
    scrambleDuration: 1800,
    scrambleInterval: { min: 18000, range: 22000 },
  },

  artwork: {
    depthRange: { min: 0.45, range: 0.55 },
    letterDepthRange: { min: 0.4, range: 0.6 },
    floatDuration: { min: 4, range: 5 },
    floatY: { min: -12, range: -25 },
    floatX: { range: 30 },
    floatRx: { range: 8 },
    floatRy: { range: 6 },
  },

  sound: {
    click: { gain: 0.15 },
    spin: { gain: 0.08 },
    scramble: { gain: 0.06 },
    explode: { gain: 0.25, crackleGain: 0.12 },
    trumpet: { gain: 0.1 },
  },

  spin: {
    interval: { min: 2000, range: 4000 },
  },

  lightLeaks: {
    colors: [
      'rgba(255,140,60,0.12)', 'rgba(255,220,80,0.10)', 'rgba(212,66,38,0.08)',
      'rgba(135,206,235,0.07)', 'rgba(255,100,40,0.10)', 'rgba(255,248,160,0.08)',
    ],
    count: 4,
    sizeRange: { min: 300, range: 500 },
    blur: 60,
    durationRange: { min: 15, range: 20 },
  },

  bloom: {
    enabled: true,
    blur: 18,
    opacity: 0.35,
    brightness: 1.4,
  },

  explode: {
    particleCount: { min: 25, range: 25 },
    reformDelay: 2500,
    reformFadeIn: 1200,
  },
};
