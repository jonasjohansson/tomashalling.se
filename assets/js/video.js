/* Video white-pixel transparency */
(function () {
  function makeVideoTransparent(video) {
    var container = video.parentElement;
    var existingCanvas = container.querySelector('canvas');
    if (existingCanvas) return;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
    }

    function processFrame() {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          resizeCanvas();
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var whiteThreshold = 240;
        for (var i = 0; i < data.length; i += 4) {
          if (data[i] >= whiteThreshold && data[i + 1] >= whiteThreshold && data[i + 2] >= whiteThreshold) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
      requestAnimationFrame(processFrame);
    }

    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.objectFit = 'contain';

    video.style.display = 'none';
    video.style.visibility = 'hidden';
    video.style.position = 'absolute';
    container.appendChild(canvas);

    video.addEventListener('loadedmetadata', function () {
      resizeCanvas();
      processFrame();
    });

    if (video.readyState >= 1) {
      resizeCanvas();
      processFrame();
    }
  }

  function processExistingVideos() {
    document.querySelectorAll('.artwork-item video').forEach(function (video) {
      if (video.dataset.processed === 'true') return;
      var container = video.parentElement;
      if (container && container.querySelector('canvas')) {
        video.dataset.processed = 'true';
        return;
      }
      var hasSource = video.src || video.getAttribute('src') || video.querySelector('source');
      if (hasSource) {
        video.dataset.processed = 'true';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.play().catch(function () {});
        if (video.readyState >= 2 && video.videoWidth > 0) {
          makeVideoTransparent(video);
        } else {
          var handleLoad = function () {
            if (video.videoWidth > 0) makeVideoTransparent(video);
          };
          video.addEventListener('loadedmetadata', handleLoad, { once: true });
          video.addEventListener('loadeddata', handleLoad, { once: true });
          video.addEventListener('canplay', handleLoad, { once: true });
          if (video.readyState === 0) video.load();
        }
      }
    });
  }

  var videosProcessed = false;
  function processVideosOnce() {
    if (!videosProcessed) {
      videosProcessed = true;
      processExistingVideos();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processVideosOnce);
  } else {
    processVideosOnce();
  }

  setTimeout(function () {
    if (!videosProcessed) processVideosOnce();
  }, 100);
})();
