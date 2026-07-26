(() => {
  const TOTAL_FRAMES = 300;
  const FRAME_FOLDER = "frames";
  const FRAME_PREFIX = "frame_";
  const FRAME_EXT = ".jpg";

  const canvas = document.getElementById("frame-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const scrollTrack = document.getElementById("scroll-track");
  const overlay = document.getElementById("invite-overlay");
  let layoutViewportHeight = 0;
  let layoutViewportWidth = 0;
  let scrollRange = 1;

  // Invite overlay: sections spread evenly across scroll, fading + rising in/out.
  const sections = Array.from(document.querySelectorAll(".invite-section"));
  const RISE = 40; // px each block travels as it enters/leaves
  let sectionLayout = [];

  function layoutSections() {
    const n = sections.length;
    if (n === 0) return;
    // Peak positions span the whole scroll so content stays balanced to the last frame.
    const start = 0.06;
    const end = 0.97;
    const span = n > 1 ? (end - start) / (n - 1) : 0;
    // Overlapping windows keep a continuous cross-fade with no blank gaps.
    const halfWidth = n > 1 ? span * 0.78 : 0.5;
    sectionLayout = sections.map((el, i) => ({
      el,
      index: i,
      center: n > 1 ? start + span * i : 0.5,
      halfWidth,
    }));
  }

  function updateOverlay(progress) {
    for (const s of sectionLayout) {
      // Keep the opening section crisp when the page first loads.
      if (s.index === 0 && progress <= 0.01) {
        s.el.style.opacity = "1";
        s.el.style.transform = "translateY(0px)";
        continue;
      }

      const d = (progress - s.center) / s.halfWidth; // -1..1 while visible
      if (d <= -1 || d >= 1) {
        if (s.el.style.opacity !== "0") s.el.style.opacity = "0";
        continue;
      }
      const opacity = 0.5 * (1 + Math.cos(Math.PI * d));
      const y = -RISE * d; // below on entry (+), above on exit (-)
      s.el.style.opacity = opacity.toFixed(3);
      s.el.style.transform = `translateY(${y.toFixed(1)}px)`;
    }
  }

  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let frameToRender = 0;
  let rafId = 0;

  function viewportWidth() {
    return Math.max(1, Math.round(window.visualViewport?.width || window.innerWidth));
  }

  function viewportHeight() {
    return Math.max(1, Math.round(window.visualViewport?.height || window.innerHeight));
  }

  function applyViewportVars() {
    const vh = viewportHeight();
    document.documentElement.style.setProperty("--app-vh", `${vh}px`);
  }

  function framePath(index) {
    const fileNumber = String(index + 1).padStart(6, "0");
    return `${FRAME_FOLDER}/${FRAME_PREFIX}${fileNumber}${FRAME_EXT}`;
  }

  function updateScrollTrackHeight() {
    const viewportHeightPx = layoutViewportHeight || viewportHeight();
    const scrollMultiplier = Math.max(6, Math.ceil(TOTAL_FRAMES / 45));
    const totalScrollHeight = viewportHeightPx * scrollMultiplier;
    scrollTrack.style.height = `${totalScrollHeight}px`;
    scrollRange = Math.max(1, totalScrollHeight - viewportHeightPx);
  }

  function recalcLayoutViewport() {
    layoutViewportWidth = viewportWidth();
    layoutViewportHeight = viewportHeight();
    applyViewportVars();
    updateScrollTrackHeight();
  }

  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const cssWidth = viewportWidth();
    const cssHeight = viewportHeight();
    const width = Math.floor(cssWidth * dpr);
    const height = Math.floor(cssHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
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

    // Expose the rendered (letterboxed) frame size in CSS px so the invite text
    // can be constrained to the video area instead of the full window.
    if (overlay) {
      const cssScale = viewportWidth() / cw;
      overlay.style.setProperty("--frame-w", `${Math.round(drawWidth * cssScale)}px`);
      overlay.style.setProperty("--frame-h", `${Math.round(drawHeight * cssScale)}px`);
    }
  }

  function scrollProgress() {
    const y = Math.min(scrollRange, Math.max(0, window.scrollY || window.pageYOffset));
    return y / scrollRange;
  }

  function targetFrameFromScroll() {
    const progress = scrollProgress();
    return Math.min(TOTAL_FRAMES - 1, Math.floor(progress * (TOTAL_FRAMES - 1)));
  }

  function requestDraw() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      const progress = scrollProgress();
      const nextFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(progress * (TOTAL_FRAMES - 1))
      );
      if (nextFrame !== frameToRender) {
        frameToRender = nextFrame;
      }
      drawFrame(frameToRender);
      updateOverlay(progress);
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
    applyViewportVars();
    resizeCanvas();
    requestDraw();
  });

  window.addEventListener("orientationchange", () => {
    recalcLayoutViewport();
    resizeCanvas();
    requestDraw();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      applyViewportVars();
      resizeCanvas();
      requestDraw();
    });
  }

  window.addEventListener("scroll", requestDraw, { passive: true });
  function setupAudio() {
    const audio = document.getElementById("bg-audio");
    if (!audio) return;
    audio.volume = 0.7;

    // Start playback on load. Browsers allow autoplay only when muted, so begin
    // muted and unmute as soon as possible (audible autoplay is permitted in some
    // app/webview contexts; otherwise the first gesture unmutes it).
    audio.muted = true;
    audio.play().catch(() => {});

    let unmuted = false;
    const unmute = () => {
      if (unmuted) return;
      audio.muted = false;
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          if (!audio.muted && !audio.paused) unmuted = true;
        }).catch(() => {});
      }
    };

    // Try to unmute right away; if the browser blocks it, unmute on first gesture.
    unmute();

    const onGesture = () => {
      unmute();
      if (unmuted) {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
        window.removeEventListener("scroll", onGesture);
        window.removeEventListener("touchstart", onGesture);
      }
    };
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);
    window.addEventListener("scroll", onGesture, { passive: true });
    window.addEventListener("touchstart", onGesture, { passive: true });
  }

  window.addEventListener("load", () => {
    recalcLayoutViewport();
    layoutSections();
    resizeCanvas();
    preloadFrames();
    requestDraw();
    setupAudio();
  });
})();
