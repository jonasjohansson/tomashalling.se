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

  // Randomization code removed - items use their HTML-defined positions and sizes

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
