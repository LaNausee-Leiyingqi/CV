import {
  Scene, OrthographicCamera, WebGLRenderer, Group, Vector3,
  SphereGeometry, CylinderGeometry, MeshBasicMaterial, InstancedMesh,
  Object3D, BufferGeometry, Float32BufferAttribute, LineBasicMaterial,
  LineSegments,
} from 'three';
import clip from '../assets/motion/clip.json';

const hero = document.querySelector('.hero');
const canvas = document.querySelector('[data-motion-canvas]');

function initMotion() {
  const identity = hero.querySelector('.hero-copy');
  const portrait = hero.querySelector('.portrait-frame');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 2000);
  camera.position.set(0, 0, 1000);
  const rig = new Group();
  scene.add(rig);
  const body = new Group();
  rig.add(body);

  const joints = new InstancedMesh(new SphereGeometry(1.9, 10, 8), new MeshBasicMaterial({ color: '#8969a8' }), clip.names.length);
  const limbs = new InstancedMesh(new CylinderGeometry(.68, .68, 1, 7), new MeshBasicMaterial({ color: '#9c86b0' }), clip.edges.length);
  joints.frustumCulled = false;
  limbs.frustumCulled = false;
  body.add(joints, limbs);

  const echoes = [0.15, 0.32, 0.5].map((delay) => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(clip.edges.length * 6), 3));
    const lines = new LineSegments(geometry, new LineBasicMaterial({ color: '#8969a8', transparent: true, opacity: .2 - delay * .2 }));
    lines.frustumCulled = false;
    body.add(lines);
    return { lines, delay };
  });
  const dummy = new Object3D();
  const up = new Vector3(0, 1, 0);
  const direction = new Vector3();
  const position = new Vector3();
  const points = clip.names.map(() => new Vector3());
  const ghostPoints = clip.names.map(() => new Vector3());
  const centerY = (clip.bounds.maxY + clip.bounds.minY) / 2;
  const modelHeight = clip.bounds.maxY - clip.bounds.minY;
  const modelWidth = Math.hypot(clip.bounds.maxX, clip.bounds.maxZ) * 2 + 8;
  let clock = .9;
  let previous = 0;
  let lastPaint = 0;
  let visible = true;
  let frameId = 0;
  let contextLost = false;
  let pageActive = true;
  body.rotation.y = -.24;

  function sample(time, output) {
    const duration = (clip.count - 1) / clip.fps;
    const cycle = ((time % (duration * 2)) + duration * 2) % (duration * 2);
    const frame = (cycle > duration ? duration * 2 - cycle : cycle) * clip.fps;
    const a = Math.floor(frame);
    const b = Math.min(a + 1, clip.count - 1);
    const blend = frame - a;
    output.forEach((point, index) => {
      const start = (a * clip.names.length + index) * 3;
      const next = (b * clip.names.length + index) * 3;
      point.set(
        clip.positions[start] + (clip.positions[next] - clip.positions[start]) * blend,
        clip.positions[start + 1] + (clip.positions[next + 1] - clip.positions[start + 1]) * blend - centerY,
        clip.positions[start + 2] + (clip.positions[next + 2] - clip.positions[start + 2]) * blend,
      );
    });
    return frame;
  }

  function paint() {
    const frame = sample(clock, points);
    points.forEach((point, index) => {
      dummy.position.copy(point);
      dummy.scale.setScalar(index === 4 ? 1.6 : 1);
      dummy.quaternion.identity();
      dummy.updateMatrix();
      joints.setMatrixAt(index, dummy.matrix);
    });
    clip.edges.forEach(([a, b], index) => {
      direction.subVectors(points[b], points[a]);
      position.copy(points[a]).add(points[b]).multiplyScalar(.5);
      dummy.position.copy(position);
      dummy.scale.set(1, direction.length(), 1);
      dummy.quaternion.setFromUnitVectors(up, direction.normalize());
      dummy.updateMatrix();
      limbs.setMatrixAt(index, dummy.matrix);
    });
    joints.instanceMatrix.needsUpdate = true;
    limbs.instanceMatrix.needsUpdate = true;
    echoes.forEach(({ lines, delay }) => {
      sample(clock - delay, ghostPoints);
      const attribute = lines.geometry.attributes.position;
      clip.edges.forEach(([a, b], index) => {
        attribute.setXYZ(index * 2, ghostPoints[a].x, ghostPoints[a].y, ghostPoints[a].z);
        attribute.setXYZ(index * 2 + 1, ghostPoints[b].x, ghostPoints[b].y, ghostPoints[b].z);
      });
      attribute.needsUpdate = true;
    });
    renderer.render(scene, camera);
    canvas.dataset.frame = Math.floor(frame);
  }

  function resize() {
    if (contextLost) return;
    const bounds = hero.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    // Use existing whitespace; this layer never changes the hero's grid or content.
    const nameRange = document.createRange();
    nameRange.selectNodeContents(identity.querySelector('.hero-name'));
    const textRight = nameRange.getBoundingClientRect().right - bounds.left;
    const photoLeft = portrait.getBoundingClientRect().left - bounds.left;
    const mobile = width <= 640;
    const availableWidth = Math.max(0, photoLeft - textRight - (mobile ? 12 : 40));
    const figureWidth = Math.min(availableWidth, mobile ? 150 : 350);
    const figureHeight = Math.min(mobile ? 156 : 310, identity.offsetHeight + 24);
    const scale = Math.min(figureHeight / (modelHeight + 12), figureWidth / modelWidth);
    const centerX = photoLeft - figureWidth / 2 - (mobile ? 6 : 20);
    const centerY = identity.offsetTop + identity.offsetHeight / 2;
    rig.scale.setScalar(scale);
    rig.position.set(centerX - width / 2, height / 2 - centerY, 0);
    paint();
  }

  function active() {
    return visible && pageActive && !document.hidden && !contextLost && !reducedMotion.matches;
  }
  function tick(now) {
    frameId = 0;
    if (!active()) return;
    if (previous) clock += Math.min((now - previous) / 1000, .05) * .65;
    previous = now;
    if (now - lastPaint > 1000 / 30) {
      paint();
      lastPaint = now;
    }
    frameId = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frameId);
    previous = 0;
    lastPaint = 0;
    frameId = active() ? requestAnimationFrame(tick) : 0;
  }
  const resizeObserver = new ResizeObserver(resize);
  [hero, identity, portrait].forEach((element) => resizeObserver.observe(element));
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  window.addEventListener('pagehide', () => { pageActive = false; sync(); });
  window.addEventListener('pageshow', () => { pageActive = true; sync(); });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
    canvas.style.visibility = 'hidden';
    sync();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    resize();
    canvas.style.visibility = '';
    sync();
  });
  document.fonts.ready.then(resize);
  resize();
  canvas.dataset.motionReady = 'true';
  sync();
}

try {
  if (hero && canvas) initMotion();
} catch {
  if (canvas) canvas.hidden = true;
}
