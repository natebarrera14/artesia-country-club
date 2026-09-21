import * as THREE from 'three';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);
const cameraRoute = new THREE.CatmullRomCurve3([
  new THREE.Vector3(160, 820, 900),
  new THREE.Vector3(260, 680, 520),
  new THREE.Vector3(-180, 540, 120),
  new THREE.Vector3(120, 380, -130),
]);
const lookRoute = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 30),
  new THREE.Vector3(20, 0, -25),
  new THREE.Vector3(-60, 0, -120),
  new THREE.Vector3(105, 0, -330),
]);
const stages = [
  {
    label: '01 / The whole course',
    caption: 'A green oasis.\nA New Mexico original.',
  },
  {
    label: '02 / Across the fairways',
    caption: 'Follow the fairways.\nFind your rhythm.',
  },
  {
    label: '03 / Back to the clubhouse',
    caption: 'Coming home.\nBack to the clubhouse.',
  },
];

// This same camera contract is used for the renderer and frustum verification.
export function getFlyoverPose(progress, aspect) {
  const position = cameraRoute.getPoint(clamp(progress));
  const target = lookRoute.getPoint(clamp(progress));
  const portrait = clamp((1.15 - aspect) / 0.7);
  position.y *= 1 + portrait * 0.65;
  position.x = THREE.MathUtils.lerp(position.x, target.x, portrait * 0.4);
  position.z = THREE.MathUtils.lerp(position.z, target.z, portrait * 0.32);
  const desiredFov = 39 + portrait * 9;
  // Constrain horizontal view on unusually wide screens to the measured map.
  const fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(desiredFov / 2)) * Math.min(1, 2.15 / aspect)));
  return { position, target, fov };
}

function elevationAt(grid, x, z) {
  // TIFF samples are pixel centers; u/v refer to the image's outside edges.
  const gx = clamp((x / grid.groundSizeMeters + 0.5) * grid.width - 0.5, 0, grid.width - 1);
  const gz = clamp((z / grid.groundSizeMeters + 0.5) * grid.height - 0.5, 0, grid.height - 1);
  const x0 = Math.floor(gx);
  const z0 = Math.floor(gz);
  const x1 = Math.min(x0 + 1, grid.width - 1);
  const z1 = Math.min(z0 + 1, grid.height - 1);
  const row = (xx, zz) => grid.heightsMeters[zz * grid.width + xx];
  const north = THREE.MathUtils.lerp(row(x0, z0), row(x1, z0), gx - x0);
  const south = THREE.MathUtils.lerp(row(x0, z1), row(x1, z1), gx - x0);
  return THREE.MathUtils.lerp(north, south, gz - z0);
}

function createGround(courseGrid, contextGrid, courseMap, contextMap) {
  const geometry = new THREE.PlaneGeometry(4000, 4000, 128, 128);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const contextHeight = elevationAt(contextGrid, x, z);
    const blend = smoothstep(clamp((1000 - Math.max(Math.abs(x), Math.abs(z))) / 50));
    const height = THREE.MathUtils.lerp(contextHeight, elevationAt(courseGrid, x, z), blend);
    positions.setY(i, height - 1050);
  }
  positions.needsUpdate = true;
  geometry.computeBoundingSphere();

  // One mesh avoids gaps/z-fighting between the matching 2 km and 4 km exports.
  // Color textures decode sRGB on upload; final output is converted back to sRGB.
  const material = new THREE.ShaderMaterial({
    uniforms: { courseMap: { value: courseMap }, contextMap: { value: contextMap } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D courseMap;
      uniform sampler2D contextMap;
      varying vec2 vUv;
      void main() {
        vec2 courseUv = (vUv - vec2(0.25)) * 2.0;
        float edge = min(min(courseUv.x, 1.0 - courseUv.x), min(courseUv.y, 1.0 - courseUv.y));
        float blend = smoothstep(0.0, 0.0125, edge);
        vec4 contextColor = texture2D(contextMap, vUv);
        vec4 courseColor = texture2D(courseMap, clamp(courseUv, 0.0, 1.0));
        gl_FragColor = mix(contextColor, courseColor, blend);
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
  });
  return new THREE.Mesh(geometry, material);
}

async function loadGrid(path, signal) {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error('Elevation data unavailable');
  const grid = await response.json();
  if (grid.heightsMeters?.length !== grid.width * grid.height || !grid.heightsMeters.every(Number.isFinite)) {
    throw new Error('Invalid elevation data');
  }
  return grid;
}

export async function initFlyover(section) {
  if (!section || section.dataset.flyoverInitialized) return;
  section.dataset.flyoverInitialized = 'true';
  const mount = section.querySelector('#flight-canvas');
  const stage = section.querySelector('.flight-stage');
  const fallback = section.querySelector('.flight-fallback');
  const progressInput = section.querySelector('#flight-progress');
  const pauseButton = section.querySelector('#flight-pause');
  const caption = section.querySelector('#flight-caption');
  const stageLabel = section.querySelector('#flight-stage-label');
  const compass = section.querySelector('#flight-compass');
  const status = section.querySelector('#flight-status');
  if (!mount || !stage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const disposables = [];
  let paused = reducedMotion.matches;
  let visible = false;
  let ready = false;
  let starting = false;
  let unavailable = false;
  let destroyed = false;
  let renderer;
  let scene;
  let camera;
  let raf = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let activeStage = -1;
  let lastFrame = 0;

  function announce(message) {
    if (status) status.textContent = message;
  }

  function updateButton() {
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? (ready ? 'Resume tour' : 'Start 3D tour') : 'Pause tour';
    pauseButton.setAttribute('aria-label', paused ? 'Start or resume the scroll-driven aerial tour' : 'Pause the scroll-driven aerial tour');
  }

  function setStatic(message) {
    ready = false;
    section.dataset.flyoverState = 'static';
    if (fallback) fallback.style.opacity = '1';
    if (renderer) renderer.domElement.style.opacity = '0';
    announce(message);
  }

  function scrollProgress() {
    const rect = section.getBoundingClientRect();
    const top = Number.parseFloat(getComputedStyle(stage).top) || 0;
    return clamp((top - rect.top) / Math.max(1, section.offsetHeight - stage.offsetHeight));
  }

  function updateLabels(value) {
    if (progressInput) {
      progressInput.value = String(Math.round(value * 100));
      progressInput.setAttribute('aria-valuetext', `${Math.round(value * 100)} percent through the aerial tour`);
    }
    const index = Math.min(2, Math.floor(value * 3));
    if (index !== activeStage) {
      activeStage = index;
      if (caption) { const [first,second] = stages[index].caption.split('\n'); const emphasis = document.createElement('em'); emphasis.textContent = second; caption.replaceChildren(document.createTextNode(first),document.createElement('br'),emphasis); }
      if (stageLabel) stageLabel.textContent = stages[index].label;
      const stagePosition = section.querySelector('#flight-position');
      if (stagePosition) stagePosition.textContent = `0${index + 1} — 03`;
    }
    section.style.setProperty('--flight-progress', String(value));
  }

  function applyPose() {
    if (!camera) return;
    const pose = getFlyoverPose(currentProgress, camera.aspect);
    camera.fov = pose.fov;
    camera.position.copy(pose.position);
    camera.lookAt(pose.target);
    camera.updateProjectionMatrix();
    if (compass) {
      const heading = Math.atan2(pose.target.x - pose.position.x, pose.position.z - pose.target.z);
      compass.style.transform = `rotate(${-heading}rad)`;
    }
  }

  function renderFrame(time) {
    raf = 0;
    if (destroyed || !visible || !ready || document.hidden) return;
    const elapsed = lastFrame ? Math.min(50, time - lastFrame) : 16;
    lastFrame = time;
    const difference = targetProgress - currentProgress;
    if (!paused && !reducedMotion.matches) currentProgress += difference * (1 - Math.exp(-elapsed / 115));
    else currentProgress = targetProgress;
    if (Math.abs(difference) < 0.00015) currentProgress = targetProgress;
    applyPose();
    updateLabels(currentProgress);
    renderer.render(scene, camera);
    if (!paused && Math.abs(targetProgress - currentProgress) > 0.00015) scheduleFrame();
  }

  function scheduleFrame() {
    if (!raf && visible && ready && !document.hidden && !destroyed) raf = requestAnimationFrame(renderFrame);
  }

  function resize() {
    if (!renderer || !camera || !ready) return;
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    applyPose();
    scheduleFrame();
  }

  async function start() {
    if (ready || starting || unavailable || destroyed) return;
    starting = true;
    announce('Loading the aerial tour.');
    section.dataset.flyoverState = 'loading';
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.setClearColor('#b9b19b');
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;pointer-events:none';
      canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        unavailable = true;
        paused = true;
        if (raf) cancelAnimationFrame(raf);
        setStatic('The 3D tour is unavailable. The aerial photograph remains available.');
        if (pauseButton) pauseButton.disabled = true;
        if (progressInput) progressInput.disabled = true;
      }, { signal: controller.signal });
      mount.append(canvas);
      const loader = new THREE.TextureLoader();
      const loadTexture = async (path) => {
        const texture = await loader.loadAsync(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        disposables.push(texture);
        return texture;
      };
      const [courseMap, contextMap, courseGrid, contextGrid] = await Promise.all([
        loadTexture('/images/course-aerial.jpg'),
        loadTexture('/images/course-context.jpg'),
        loadGrid('/images/course-elevation.json', controller.signal),
        loadGrid('/images/context-elevation.json', controller.signal),
      ]);
      if (destroyed) return;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(39, 1, 2, 6000);
      const ground = createGround(courseGrid, contextGrid, courseMap, contextMap);
      disposables.push(ground.geometry, ground.material);
      scene.add(ground);
      ready = true;
      currentProgress = targetProgress = scrollProgress();
      resize();
      applyPose();
      renderer.render(scene, camera);
      canvas.style.opacity = '1';
      if (fallback) fallback.style.opacity = '0';
      section.dataset.flyoverState = 'ready';
      updateLabels(currentProgress);
      announce('Aerial tour ready. Scroll or use the tour position slider.');
      updateButton();
      scheduleFrame();
    } catch {
      unavailable = true;
      paused = true;
      renderer?.dispose();
      disposables.forEach((item) => item.dispose());
      setStatic('The 3D tour could not load. Explore the aerial photograph instead.');
      if (pauseButton) pauseButton.disabled = true;
      if (progressInput) progressInput.disabled = true;
    } finally {
      starting = false;
    }
  }

  function onScroll() {
    if (!paused) targetProgress = scrollProgress();
    scheduleFrame();
  }

  function onVisibility() {
    lastFrame = 0;
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else scheduleFrame();
  }

  progressInput?.addEventListener('input', async () => {
    targetProgress = currentProgress = clamp(Number(progressInput.value) / 100);
    updateLabels(currentProgress);
    const rect = section.getBoundingClientRect();
    const top = Number.parseFloat(getComputedStyle(stage).top) || 0;
    const startY = window.scrollY + rect.top - top;
    window.scrollTo({ top: startY + currentProgress * Math.max(1, section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
    if (!ready && !reducedMotion.matches) await start();
    scheduleFrame();
  }, { signal: controller.signal });

  pauseButton?.addEventListener('click', async () => {
    paused = !paused;
    updateButton();
    if (!paused) {
      await start();
      targetProgress = scrollProgress();
      if (ready) announce('Scroll-driven aerial tour resumed.');
    } else {
      targetProgress = currentProgress;
      announce('Aerial tour paused. You can still use the tour position slider.');
    }
    scheduleFrame();
  }, { signal: controller.signal });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      paused = true;
      targetProgress = currentProgress;
      updateButton();
      announce('Aerial tour paused to respect your reduced-motion preference.');
      scheduleFrame();
    }
  }, { signal: controller.signal });
  window.addEventListener('scroll', onScroll, { passive: true, signal: controller.signal });
  document.addEventListener('visibilitychange', onVisibility, { signal: controller.signal });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    lastFrame = 0;
    if (visible) {
      if (!paused) void start();
      onScroll();
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }, { rootMargin: '160px 0px' });
  observer.observe(stage);
  updateButton();
  updateLabels(0);
  if (reducedMotion.matches) setStatic('Aerial photograph shown. Start the 3D tour if you would like to explore with motion.');

  return () => {
    destroyed = true;
    controller.abort();
    observer.disconnect();
    resizeObserver.disconnect();
    if (raf) cancelAnimationFrame(raf);
    disposables.forEach((item) => item.dispose());
    renderer?.dispose();
    renderer?.domElement.remove();
  };
}
