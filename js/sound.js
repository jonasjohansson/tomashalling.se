/* Sound system — creature audio files via Web Audio API */
(function () {
  var audioCtx = null;
  var creatureBuffers = {};

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  /* Preload creature audio files from data-sound attributes */
  function preloadCreatureSounds() {
    var items = document.querySelectorAll('.artwork-item[data-sound]');
    items.forEach(function (item) {
      var src = item.dataset.sound;
      if (creatureBuffers[src]) return;
      creatureBuffers[src] = null; // mark as loading
      fetch(encodeURI(src))
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return getAudioCtx().decodeAudioData(buf); })
        .then(function (decoded) { creatureBuffers[src] = decoded; })
        .catch(function () { /* audio file not available */ });
    });
  }
  preloadCreatureSounds();

  /* Play a creature's audio file */
  window.playCreatureSound = function (src) {
    if (!src || !creatureBuffers[src]) return;
    try {
      var ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      var source = ctx.createBufferSource();
      var gain = ctx.createGain();
      source.buffer = creatureBuffers[src];
      gain.gain.value = 0.5;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    } catch (e) { /* audio not available */ }
  };
})();
