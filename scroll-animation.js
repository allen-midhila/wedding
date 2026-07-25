(() => {
  const TOTAL_FRAMES = 300;
  const FRAME_FOLDER = "frames";
  const FRAME_PREFIX = "frame_";
  const FRAME_EXT = ".jpg";
  const INTRO_FADE_START_FRAME = 2;
  const INTRO_FADE_END_FRAME = 12;
  const INTRO_FADE_IN_DURATION_MS = 1200;

  const canvas = document.getElementById("frame-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const scrollTrack = document.getElementById("scroll-track");
  const introSection = document.getElementById("intro-section");
  const introTaglineSection = document.getElementById("intro-tagline-section");
  const detailsSection = document.getElementById("details-section");

  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let frameToRender = 0;
  let rafId = 0;
  let introFadeInStartedAt = 0;

  function framePath(index) {
    const fileNumber = String(index + 1).padStart(6, "0");
    return `${FRAME_FOLDER}/${FRAME_PREFIX}${fileNumber}${FRAME_EXT}`;
  }

  function updateScrollTrackHeight() {
    const viewportHeight = window.innerHeight;
    const scrollMultiplier = Math.max(6, Math.ceil(TOTAL_FRAMES / 45));
    scrollTrack.style.height = `${viewportHeight * scrollMultiplier}px`;
  }

  function syncInviteFlowHeight() {
    const inviteFlow = document.getElementById("invite-flow");
    if (!inviteFlow) {
      return;
    }

    const viewportHeight = window.innerHeight;
    const trackHeight = parseFloat(scrollTrack.style.height) || viewportHeight;
    inviteFlow.style.minHeight = `${Math.max(viewportHeight, trackHeight)}px`;
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

    // Apply a subtle cinematic shade directly on the canvas for text readability.
    const verticalShade = ctx.createLinearGradient(0, 0, 0, ch);
    verticalShade.addColorStop(0, "rgba(8, 10, 30, 0.26)");
    verticalShade.addColorStop(0.52, "rgba(8, 10, 30, 0.16)");
    verticalShade.addColorStop(1, "rgba(8, 10, 30, 0.34)");
    ctx.fillStyle = verticalShade;
    ctx.fillRect(0, 0, cw, ch);

    const centerGlow = ctx.createRadialGradient(cw * 0.5, ch * 0.12, 0, cw * 0.5, ch * 0.12, ch * 0.95);
    centerGlow.addColorStop(0, "rgba(42, 55, 122, 0.12)");
    centerGlow.addColorStop(1, "rgba(8, 10, 30, 0)");
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, cw, ch);
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
      if (!introFadeInStartedAt) {
        introFadeInStartedAt = performance.now();
      }

      const nextFrame = targetFrameFromScroll();
      if (nextFrame !== frameToRender) {
        frameToRender = nextFrame;
      }

      const showDetails = frameToRender >= 50;
      const fadeOutFrameProgress = Math.max(0, frameToRender - INTRO_FADE_START_FRAME);
      const fadeOutOpacity = Math.max(0, Math.min(1, 1 - fadeOutFrameProgress / INTRO_FADE_END_FRAME));
      const fadeInProgress = Math.max(0, Math.min(1, (performance.now() - introFadeInStartedAt) / INTRO_FADE_IN_DURATION_MS));
      const introOpacity = Math.min(fadeInProgress, fadeOutOpacity);

      if (introSection) {
        introSection.classList.toggle("is-inactive", showDetails);
        if (showDetails) {
          introSection.style.opacity = "0";
          introSection.style.transform = "";
        } else {
          introSection.style.opacity = String(introOpacity);
          introSection.style.transform = `translateY(${(1 - introOpacity) * 14}px)`;
        }
      }
      if (introTaglineSection) {
        introTaglineSection.classList.toggle("is-inactive", showDetails);
        if (showDetails) {
          introTaglineSection.style.opacity = "0";
          introTaglineSection.style.transform = "";
        } else {
          introTaglineSection.style.opacity = String(introOpacity);
          introTaglineSection.style.transform = `translateY(${(1 - introOpacity) * 10}px)`;
        }
      }
      if (detailsSection) {
        detailsSection.classList.toggle("is-active", showDetails);
      }

      if (!showDetails && fadeInProgress < 1) {
        requestDraw();
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
    syncInviteFlowHeight();
    resizeCanvas();
    requestDraw();
  });

  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("load", () => {
    updateScrollTrackHeight();
    syncInviteFlowHeight();
    resizeCanvas();
    preloadFrames();
    requestDraw();
  });
})();

(() => {
  function initStars() {
    const starField = document.getElementById("stars");
    if (!starField) {
      return;
    }

    const count = 70;
    for (let i = 0; i < count; i += 1) {
      const star = document.createElement("span");
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.opacity = (0.2 + Math.random() * 0.6).toFixed(2);
      starField.appendChild(star);
    }
  }

  function fillRow(id, cssVars, rootStyles) {
    const row = document.getElementById(id);
    if (!row) {
      return;
    }

    cssVars.forEach((cssVar) => {
      const swatch = document.createElement("div");
      swatch.className = "swatch";
      swatch.style.background = rootStyles.getPropertyValue(cssVar).trim();
      row.appendChild(swatch);
    });
  }

  function initPalette() {
    const rootStyles = getComputedStyle(document.documentElement);
    const greens = ["--green-1", "--green-2", "--green-3", "--green-4", "--green-5", "--green-6", "--green-7"];
    const pinks = ["--pink-1", "--pink-2", "--pink-3", "--pink-4", "--pink-5", "--pink-6", "--pink-7"];

    fillRow("greenRow", greens, rootStyles);
    fillRow("pinkRow", pinks, rootStyles);
  }

  window.addEventListener("load", () => {
    initStars();
    initPalette();
  });
})();
