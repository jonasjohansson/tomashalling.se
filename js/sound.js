/* Sound system — Web Audio API synthesis */
(function () {
  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  window.playSound = function (type) {
    var C = window.CONFIG.sound;
    try {
      var ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      var now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(C.click.gain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'spin') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.6);
        gain.gain.setValueAtTime(C.spin.gain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'scramble') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(500, now + 0.05);
        osc.frequency.setValueAtTime(200, now + 0.1);
        osc.frequency.setValueAtTime(700, now + 0.15);
        osc.frequency.setValueAtTime(350, now + 0.2);
        gain.gain.setValueAtTime(C.scramble.gain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'explode') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
        gain.gain.setValueAtTime(C.explode.gain, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
        var osc2 = ctx.createOscillator();
        var gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(80, now);
        osc2.frequency.setValueAtTime(200, now + 0.02);
        osc2.frequency.setValueAtTime(50, now + 0.06);
        osc2.frequency.setValueAtTime(300, now + 0.1);
        osc2.frequency.setValueAtTime(40, now + 0.2);
        gain2.gain.setValueAtTime(C.explode.crackleGain, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.start(now);
        osc2.stop(now + 0.5);
      } else if (type === 'trumpet') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500 + Math.random() * 300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        gain.gain.setValueAtTime(C.trumpet.gain, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) { /* audio not available */ }
  };
})();
