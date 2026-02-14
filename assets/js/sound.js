/* Sound system — creature audio files via Web Audio API */
(function () {
  var audioCtx = null;
  var rawBuffers = {};      // src → ArrayBuffer (fetched eagerly)
  var decodedBuffers = {};  // src → AudioBuffer (decoded after user gesture)

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  /* Fetch raw audio data immediately — no AudioContext needed */
  function preloadCreatureSounds() {
    var items = document.querySelectorAll('.artwork-item[data-sound]');
    items.forEach(function (item) {
      var src = item.dataset.sound;
      if (rawBuffers[src] !== undefined) return;
      rawBuffers[src] = null; // mark as loading
      fetch(encodeURI(src))
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { rawBuffers[src] = buf; })
        .catch(function () { /* audio file not available */ });
    });
  }
  preloadCreatureSounds();

  /* Decode all fetched buffers once AudioContext is active */
  var decoded = false;
  function decodeAll() {
    if (decoded) return;
    decoded = true;
    var ctx = getAudioCtx();
    Object.keys(rawBuffers).forEach(function (src) {
      if (!rawBuffers[src] || decodedBuffers[src]) return;
      ctx.decodeAudioData(rawBuffers[src])
        .then(function (audioBuf) { decodedBuffers[src] = audioBuf; })
        .catch(function () { /* decode failed */ });
    });
  }

  /* Warm up AudioContext on first user gesture for instant playback */
  function onFirstGesture() {
    document.removeEventListener('touchstart', onFirstGesture, true);
    document.removeEventListener('click', onFirstGesture, true);
    var ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    decodeAll();
  }
  document.addEventListener('touchstart', onFirstGesture, true);
  document.addEventListener('click', onFirstGesture, true);

  /* Play a creature's audio file */
  window.playCreatureSound = function (src) {
    if (!src) return;
    try {
      var ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      if (!decoded) decodeAll();
      var buf = decodedBuffers[src];
      if (!buf) return;
      var source = ctx.createBufferSource();
      var gain = ctx.createGain();
      source.buffer = buf;
      gain.gain.value = 0.5;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    } catch (e) { /* audio not available */ }
  };
})();
