(() => {
  const TOTAL_FRAMES = 300;
  const FRAME_FOLDER = "frames";
  const FRAME_PREFIX = "frame_";
  const FRAME_EXT = ".jpg";

  const canvas = document.getElementById("frame-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const scrollTrack = document.getElementById("scroll-track");

  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let frameToRender = 0;
  let rafId = 0;

  function framePath(index) {
    const fileNumber = String(index + 1).padStart(6, "0");
    return `${FRAME_FOLDER}/${FRAME_PREFIX}${fileNumber}${FRAME_EXT}`;
  }

  function updateScrollTrackHeight() {
    const viewportHeight = window.innerHeight;
    const scrollMultiplier = Math.max(6, Math.ceil(TOTAL_FRAMES / 45));
    scrollTrack.style.height = `${viewportHeight * scrollMultiplier}px`;
  }

  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const width = Math.floor(window.innerWidth * dpr);
    const height = Math.floor(window.innerHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }

    drawFrame(frameToRender);
  }

  function drawFrame(index) {
    const image = images[index];
    if (!image || !image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
      return;
    }

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.fillStyle = "#060606";
    ctx.fillRect(0, 0, cw, ch);

    // Fit frame inside viewport while preserving aspect ratio.
    const scale = Math.min(cw / image.naturalWidth, ch / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const offsetX = (cw - drawWidth) * 0.5;
    const offsetY = (ch - drawHeight) * 0.5;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }

  function scrollProgress() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.min(maxScroll, Math.max(0, window.scrollY || window.pageYOffset));
    return y / maxScroll;
  }

  function targetFrameFromScroll() {
    const progress = scrollProgress();
    return Math.min(TOTAL_FRAMES - 1, Math.floor(progress * (TOTAL_FRAMES - 1)));
  }

  function requestDraw() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      const nextFrame = targetFrameFromScroll();
      if (nextFrame !== frameToRender) {
        frameToRender = nextFrame;
      }
      drawFrame(frameToRender);
    });
  }

  function preloadFrames() {
    for (let i = 0; i < TOTAL_FRAMES; i += 1) {
      const image = new Image();
      image.decoding = "async";
      image.src = framePath(i);
      image.onload = () => {
        loadedCount += 1;

        if (i === 0) {
          drawFrame(frameToRender);
        }

        if (i === frameToRender) {
          drawFrame(i);
        }
      };
      images[i] = image;
    }
  }

  window.addEventListener("resize", () => {
    updateScrollTrackHeight();
    resizeCanvas();
    requestDraw();
  });

  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("load", () => {
    updateScrollTrackHeight();
    resizeCanvas();
    preloadFrames();
    requestDraw();
  });
})();
