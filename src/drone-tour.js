const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const LOAD_TIMEOUT = 30000;
const SEEK_TIMEOUT = 12000;
const FRAME_TOLERANCE = 1 / 90;
const stages = [
  { label: '01 / Along the fairway', caption: ['Follow the fairways.', 'Find your rhythm.'] },
  { label: '02 / Find your rhythm', caption: ['A gentler pace.', 'A little more room.'] },
  { label: '03 / Stay a little longer', caption: ['Open skies.', 'Time well spent.'] },
];

/** Connect a paused video to scroll position without starting playback. */
export async function initDroneTour(section) {
  if (!section || section.dataset.droneInitialized) return;
  const video = section.querySelector('#flight-video');
  const stage = section.querySelector('.flight-stage');
  if (!video || !stage) return;
  section.dataset.droneInitialized = 'true';

  const progressInput = section.querySelector('#flight-progress');
  const pauseButton = section.querySelector('#flight-pause');
  const caption = section.querySelector('#flight-caption');
  const stageLabel = section.querySelector('#flight-stage-label');
  const stagePosition = section.querySelector('#flight-position');
  const status = section.querySelector('#flight-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  let fallback = section.querySelector('.flight-fallback');
  if (!fallback && video.poster) {
    fallback = document.createElement('img');
    fallback.className = 'flight-fallback';
    fallback.src = video.poster;
    fallback.alt = 'A view through the fairways at Artesia Country Club';
    video.before(fallback);
  }

  let paused = reducedMotion.matches;
  let motionConsent = !reducedMotion.matches;
  let visible = false;
  let requested = false;
  let metadataReady = false;
  let frameReady = false;
  let announcedReady = false;
  let unavailable = false;
  let destroyed = false;
  let seeking = false;
  let raf = 0;
  let loadTimer = 0;
  let seekTimer = 0;
  let targetProgress = 0;
  let presentedProgress = 0;
  let activeStage = -1;
  let seekRecoveryUsed = false;

  // Seeking a muted, inline, paused video avoids autoplay and audio policies.
  video.autoplay = false;
  video.removeAttribute('autoplay');
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.pause();
  video.style.opacity = '0';
  if (fallback) fallback.style.opacity = '1';

  function announce(message) {
    if (status && status.textContent !== message) status.textContent = message;
  }

  function updateButton() {
    section.dataset.droneMotion = motionConsent ? 'enabled' : 'reduced';
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = unavailable ? 'Tour unavailable' : paused ? (requested ? 'Resume tour' : 'Start tour') : 'Pause tour';
    pauseButton.setAttribute('aria-label', paused ? 'Start or resume the scroll-controlled drone tour' : 'Pause the scroll-controlled drone tour');
  }

  function updateLabels(value) {
    const percent = Math.round(clamp(value) * 100);
    if (progressInput) {
      progressInput.value = String(percent);
      progressInput.setAttribute('aria-valuetext', `${percent} percent through the drone tour`);
    }
    // Three equal chapters of one continuous fairway flight.
    const index = value < 1 / 3 ? 0 : value < 2 / 3 ? 1 : 2;
    if (index !== activeStage) {
      activeStage = index;
      if (stageLabel) stageLabel.textContent = stages[index].label;
      if (stagePosition) stagePosition.textContent = `0${index + 1} — 03`;
      if (caption) {
        const emphasis = document.createElement('em');
        emphasis.textContent = stages[index].caption[1];
        caption.replaceChildren(document.createTextNode(stages[index].caption[0]), document.createElement('br'), emphasis);
      }
    }
    section.style.setProperty('--flight-progress', String(clamp(value)));
  }

  function scrollProgress() {
    const rect = section.getBoundingClientRect();
    const top = Number.parseFloat(getComputedStyle(stage).top) || 0;
    return clamp((top - rect.top) / Math.max(1, section.offsetHeight - stage.offsetHeight));
  }

  function timeAt(progress) {
    // Avoid the empty frame some decoders return at the exact media end.
    return Math.min(Math.max(0, video.duration - 0.001), clamp(progress) * video.duration);
  }

  function clearTimers() {
    clearTimeout(loadTimer);
    clearTimeout(seekTimer);
    loadTimer = seekTimer = 0;
  }

  function fail(message) {
    if (unavailable || destroyed) return;
    unavailable = true;
    paused = true;
    seeking = false;
    clearTimers();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    video.pause();
    video.style.opacity = '0';
    if (fallback) fallback.style.opacity = '1';
    section.dataset.droneState = 'error';
    if (progressInput) progressInput.disabled = true;
    if (pauseButton) pauseButton.disabled = true;
    updateButton();
    announce(message);
  }

  function revealFrame() {
    if (!frameReady || !visible || document.hidden || unavailable) return;
    video.style.opacity = '1';
    if (fallback) fallback.style.opacity = '0';
    section.dataset.droneState = 'ready';
  }

  function watchLoading() {
    clearTimeout(loadTimer);
    loadTimer = 0;
    if (!requested || frameReady || unavailable || document.hidden) return;
    loadTimer = window.setTimeout(() => {
      fail('The drone tour is taking too long to load. The course film still remains available.');
    }, LOAD_TIMEOUT);
  }

  function watchSeek() {
    clearTimeout(seekTimer);
    seekTimer = 0;
    if (!seeking || !visible || document.hidden || unavailable) return;
    seekTimer = window.setTimeout(() => {
      if (!video.seeking && video.readyState >= 2) {
        onSeeked();
        return;
      }
      if (!seekRecoveryUsed) {
        // A newer request can replace a stalled decoder seek, in either direction.
        seekRecoveryUsed = true;
        try {
          video.currentTime = timeAt(targetProgress);
          watchSeek();
        } catch {
          fail('The drone tour could not seek. The course film still remains available.');
        }
      } else {
        fail('The drone tour stopped responding. The course film still remains available.');
      }
    }, SEEK_TIMEOUT);
  }

  function flushSeek() {
    raf = 0;
    if (destroyed || unavailable || !visible || document.hidden || !metadataReady) return;
    // Let one precise seek finish, then use only the latest requested position.
    if (seeking || video.seeking) return;
    const nextTime = timeAt(targetProgress);
    if (Math.abs(nextTime - video.currentTime) <= FRAME_TOLERANCE) {
      if (video.readyState >= 2) {
        frameReady = true;
        presentedProgress = clamp(video.currentTime / video.duration);
        revealFrame();
      }
      // At time zero, wait for loadeddata instead of issuing a redundant seek.
      return;
    }
    try {
      seeking = true;
      seekRecoveryUsed = false;
      video.currentTime = nextTime;
      watchSeek();
    } catch {
      seeking = false;
      fail('The drone tour could not seek. The course film still remains available.');
    }
  }

  function scheduleSeek() {
    if (!raf && visible && !document.hidden && !unavailable && !destroyed) raf = requestAnimationFrame(flushSeek);
  }

  function startLoading() {
    if (requested || unavailable || destroyed) return;
    requested = true;
    section.dataset.droneState = 'loading';
    announce('Loading the drone tour.');
    updateButton();
    video.preload = 'auto';
    watchLoading();
    try {
      video.load();
    } catch {
      fail('The drone tour could not load. The course film still remains available.');
    }
  }

  function readMetadata() {
    if (unavailable || !Number.isFinite(video.duration) || video.duration <= 0) return;
    metadataReady = true;
    frameReady = video.readyState >= 2;
    if (frameReady) {
      clearTimeout(loadTimer);
      loadTimer = 0;
      if (!announcedReady) {
        announcedReady = true;
        announce(paused ? 'Drone tour ready. Use the position slider or resume the tour.' : 'Drone tour ready. Scroll or use the position slider.');
      }
    }
    scheduleSeek();
  }

  function onData() {
    readMetadata();
  }

  function onSeeked() {
    if (unavailable) return;
    seeking = false;
    clearTimeout(seekTimer);
    seekTimer = 0;
    frameReady = video.readyState >= 2;
    if (metadataReady) presentedProgress = clamp(video.currentTime / video.duration);
    revealFrame();
    // This schedules at most one more frame; it does not create a playback loop.
    scheduleSeek();
  }

  function updateFromScroll() {
    if (!paused) {
      targetProgress = scrollProgress();
      updateLabels(targetProgress);
    }
    scheduleSeek();
  }

  function onScroll() {
    if (visible && !paused) updateFromScroll();
  }

  function onVisibility() {
    if (document.hidden) {
      clearTimers();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else {
      watchLoading();
      watchSeek();
      if (visible) updateFromScroll();
    }
  }

  video.addEventListener('loadedmetadata', readMetadata, options);
  video.addEventListener('durationchange', readMetadata, options);
  video.addEventListener('loadeddata', onData, options);
  video.addEventListener('canplay', onData, options);
  video.addEventListener('seeked', onSeeked, options);
  video.addEventListener('play', () => video.pause(), options);
  video.addEventListener('error', () => {
    fail('The drone tour could not load. The course film still remains available.');
  }, options);

  progressInput?.addEventListener('input', () => {
    if (unavailable) return;
    targetProgress = clamp(Number(progressInput.value) / 100);
    updateLabels(targetProgress);
    // A deliberate slider input is permitted even with reduced motion enabled.
    startLoading();
    if (motionConsent) {
      const rect = section.getBoundingClientRect();
      const top = Number.parseFloat(getComputedStyle(stage).top) || 0;
      const startY = window.scrollY + rect.top - top;
      window.scrollTo({ top: startY + targetProgress * Math.max(1, section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
    }
    scheduleSeek();
  }, options);

  pauseButton?.addEventListener('click', () => {
    if (unavailable) return;
    paused = !paused;
    if (!paused) {
      motionConsent = true;
      updateButton();
      targetProgress = scrollProgress();
      updateLabels(targetProgress);
      startLoading();
      if (frameReady) announce('Scroll-controlled drone tour resumed.');
    } else {
      // currentTime already reflects an in-flight seek, so it can finish once.
      targetProgress = metadataReady ? clamp(video.currentTime / video.duration) : presentedProgress;
      updateLabels(targetProgress);
      updateButton();
      announce('Drone tour paused. You can still use the position slider.');
    }
    scheduleSeek();
  }, options);

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      paused = true;
      motionConsent = false;
      targetProgress = metadataReady ? clamp(video.currentTime / video.duration) : presentedProgress;
      updateLabels(targetProgress);
      announce('Drone tour paused to respect your reduced-motion preference.');
    } else {
      motionConsent = true;
    }
    updateButton();
    scheduleSeek();
  }, options);
  window.addEventListener('scroll', onScroll, { passive: true, signal: controller.signal });
  document.addEventListener('visibilitychange', onVisibility, options);

  const resizeObserver = new ResizeObserver(() => {
    if (visible) updateFromScroll();
  });
  resizeObserver.observe(stage);
  resizeObserver.observe(section);
  const nearbyObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && motionConsent && !paused) startLoading();
  }, { rootMargin: '800px 0px' });
  nearbyObserver.observe(section);
  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) {
      if (motionConsent && !paused) startLoading();
      updateFromScroll();
      watchSeek();
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(seekTimer);
      seekTimer = 0;
    }
  });
  visibilityObserver.observe(stage);

  section.dataset.droneState = 'static';
  updateButton();
  updateLabels(0);
  if (paused) announce('Course film still shown. Start the drone tour or use the position slider to explore.');

  return () => {
    destroyed = true;
    controller.abort();
    clearTimers();
    if (raf) cancelAnimationFrame(raf);
    nearbyObserver.disconnect();
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    video.pause();
    delete section.dataset.droneInitialized;
  };
}
