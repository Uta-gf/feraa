 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/main.js b/main.js
new file mode 100644
index 0000000000000000000000000000000000000000..8782672c703ecfb949c364accda173d5eb81d96d
--- /dev/null
+++ b/main.js
@@ -0,0 +1,262 @@
+import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
+import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';
+import { FontLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/FontLoader.js';
+import { TextGeometry } from 'https://unpkg.com/three@0.161.0/examples/jsm/geometries/TextGeometry.js';
+import { EffectComposer } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js';
+import { RenderPass } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/RenderPass.js';
+import { UnrealBloomPass } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js';
+
+const canvas = document.getElementById('scene');
+const scene = new THREE.Scene();
+scene.fog = new THREE.Fog(0x030308, 18, 60);
+
+const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
+camera.position.set(0, 3.2, 18);
+
+const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
+renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
+renderer.setSize(window.innerWidth, window.innerHeight);
+renderer.toneMapping = THREE.ACESFilmicToneMapping;
+renderer.toneMappingExposure = 1.05;
+
+const controls = new OrbitControls(camera, renderer.domElement);
+controls.enableDamping = true;
+controls.autoRotate = true;
+controls.autoRotateSpeed = 0.18;
+controls.enablePan = false;
+controls.minDistance = 10;
+controls.maxDistance = 28;
+
+const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
+scene.add(ambientLight);
+
+const centerLight = new THREE.PointLight(0xff6699, 1.2, 50, 2);
+centerLight.position.set(0, 0.5, 0);
+scene.add(centerLight);
+
+const heartGroup = new THREE.Group();
+scene.add(heartGroup);
+
+function heartPoint(t) {
+  const x = 16 * Math.sin(t) ** 3;
+  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
+  return new THREE.Vector2(x / 7.8, y / 7.8);
+}
+
+const heartCount = 7000;
+const heartPositions = new Float32Array(heartCount * 3);
+const heartSeeds = new Float32Array(heartCount);
+
+for (let i = 0; i < heartCount; i++) {
+  const t = Math.random() * Math.PI * 2;
+  const p = heartPoint(t);
+  const spread = Math.pow(Math.random(), 0.55);
+  const jitter = (Math.random() - 0.5) * 0.1;
+
+  heartPositions[i * 3] = p.x * spread + jitter;
+  heartPositions[i * 3 + 1] = p.y * spread + jitter;
+  heartPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
+  heartSeeds[i] = Math.random() * Math.PI * 2;
+}
+
+const heartGeometry = new THREE.BufferGeometry();
+heartGeometry.setAttribute('position', new THREE.BufferAttribute(heartPositions, 3));
+const heartMaterial = new THREE.PointsMaterial({
+  color: 0xff3f73,
+  size: 0.12,
+  transparent: true,
+  opacity: 0.92,
+  depthWrite: false,
+  blending: THREE.AdditiveBlending
+});
+
+const heartParticles = new THREE.Points(heartGeometry, heartMaterial);
+heartGroup.add(heartParticles);
+
+const starCount = 4000;
+const starPositions = new Float32Array(starCount * 3);
+for (let i = 0; i < starCount; i++) {
+  const r = 25 + Math.random() * 45;
+  const theta = Math.random() * Math.PI * 2;
+  const phi = Math.acos(2 * Math.random() - 1);
+
+  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
+  starPositions[i * 3 + 1] = r * Math.cos(phi);
+  starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
+}
+
+const starGeometry = new THREE.BufferGeometry();
+starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
+const stars = new THREE.Points(
+  starGeometry,
+  new THREE.PointsMaterial({
+    color: 0xffffff,
+    size: 0.09,
+    transparent: true,
+    opacity: 0.95,
+    depthWrite: false
+  })
+);
+scene.add(stars);
+
+function createPolaroidTexture(index) {
+  const cv = document.createElement('canvas');
+  cv.width = 256;
+  cv.height = 320;
+  const ctx = cv.getContext('2d');
+
+  ctx.fillStyle = '#ffffff';
+  ctx.fillRect(0, 0, 256, 320);
+
+  const grad = ctx.createLinearGradient(0, 0, 256, 240);
+  const hue = (index * 47) % 360;
+  grad.addColorStop(0, `hsl(${hue}, 80%, 72%)`);
+  grad.addColorStop(1, `hsl(${(hue + 80) % 360}, 80%, 45%)`);
+  ctx.fillStyle = grad;
+  ctx.fillRect(20, 20, 216, 220);
+
+  ctx.globalAlpha = 0.28;
+  ctx.fillStyle = '#fff';
+  for (let i = 0; i < 16; i++) {
+    ctx.beginPath();
+    ctx.arc(Math.random() * 216 + 20, Math.random() * 220 + 20, Math.random() * 18 + 5, 0, Math.PI * 2);
+    ctx.fill();
+  }
+
+  ctx.globalAlpha = 1;
+  ctx.fillStyle = '#d35b8f';
+  ctx.font = '18px Segoe UI';
+  ctx.fillText('our memory', 70, 282);
+
+  const texture = new THREE.CanvasTexture(cv);
+  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
+  return texture;
+}
+
+const frames = [];
+const frameGroup = new THREE.Group();
+scene.add(frameGroup);
+const frameCount = 11;
+const frameRadius = 9;
+for (let i = 0; i < frameCount; i++) {
+  const texture = createPolaroidTexture(i);
+  const mat = new THREE.MeshStandardMaterial({
+    map: texture,
+    emissive: new THREE.Color(0x331322),
+    emissiveIntensity: 0.45,
+    roughness: 0.65,
+    metalness: 0.05
+  });
+
+  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.75), mat);
+  const angle = (i / frameCount) * Math.PI * 2;
+  mesh.position.set(Math.cos(angle) * frameRadius, (Math.random() - 0.5) * 2.2, Math.sin(angle) * frameRadius);
+  mesh.rotation.y = -angle + Math.PI / 2;
+  mesh.rotation.z = (Math.random() - 0.5) * 0.22;
+  frameGroup.add(mesh);
+
+  frames.push({
+    mesh,
+    angle,
+    speed: 0.08 + Math.random() * 0.06,
+    bobOffset: Math.random() * Math.PI * 2,
+    baseY: mesh.position.y,
+    baseScale: 1
+  });
+}
+
+const raycaster = new THREE.Raycaster();
+const pointer = new THREE.Vector2(999, 999);
+window.addEventListener('pointermove', (event) => {
+  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
+  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
+});
+
+const fontLoader = new FontLoader();
+let titleMesh;
+fontLoader.load('https://unpkg.com/three@0.161.0/examples/fonts/helvetiker_regular.typeface.json', (font) => {
+  const geometry = new TextGeometry('spesiall buat feraa.', {
+    font,
+    size: 0.9,
+    depth: 0.15,
+    curveSegments: 12,
+    bevelEnabled: true,
+    bevelThickness: 0.04,
+    bevelSize: 0.03,
+    bevelSegments: 5
+  });
+  geometry.computeBoundingBox();
+  const xOffset = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
+  geometry.translate(-xOffset, 0, 0);
+
+  const material = new THREE.MeshStandardMaterial({
+    color: 0xffffff,
+    emissive: 0x9aa7ff,
+    emissiveIntensity: 0.75,
+    metalness: 0.25,
+    roughness: 0.2
+  });
+
+  titleMesh = new THREE.Mesh(geometry, material);
+  titleMesh.position.set(0, 6.2, 0);
+  scene.add(titleMesh);
+});
+
+const composer = new EffectComposer(renderer);
+composer.addPass(new RenderPass(scene, camera));
+const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.15, 0.65, 0.2);
+composer.addPass(bloomPass);
+
+const clock = new THREE.Clock();
+const baseHeartPositions = heartPositions.slice();
+
+function animate() {
+  const elapsed = clock.getElapsedTime();
+  controls.update();
+
+  for (let i = 0; i < heartCount; i++) {
+    const idx = i * 3;
+    heartPositions[idx + 1] = baseHeartPositions[idx + 1] + Math.sin(elapsed * 0.75 + heartSeeds[i]) * 0.08;
+    heartPositions[idx + 2] = baseHeartPositions[idx + 2] + Math.cos(elapsed * 0.7 + heartSeeds[i] * 1.7) * 0.05;
+  }
+  heartGeometry.attributes.position.needsUpdate = true;
+
+  heartGroup.rotation.y = Math.sin(elapsed * 0.22) * 0.1;
+
+  frames.forEach((frame, index) => {
+    frame.angle += frame.speed * 0.002;
+    frame.mesh.position.x = Math.cos(frame.angle + elapsed * 0.12) * frameRadius;
+    frame.mesh.position.z = Math.sin(frame.angle + elapsed * 0.12) * frameRadius;
+    frame.mesh.position.y = frame.baseY + Math.sin(elapsed + frame.bobOffset) * 0.35;
+    frame.mesh.rotation.y = -frame.angle - elapsed * 0.12 + Math.PI / 2;
+    frame.mesh.rotation.z = Math.sin(elapsed * 0.8 + index) * 0.12;
+  });
+
+  if (titleMesh) {
+    titleMesh.position.y = 6.2 + Math.sin(elapsed * 1.2) * 0.22;
+    titleMesh.rotation.y = Math.sin(elapsed * 0.45) * 0.12;
+  }
+
+  raycaster.setFromCamera(pointer, camera);
+  const hit = raycaster.intersectObjects(frameGroup.children);
+  frames.forEach((frame) => {
+    const isHover = hit.length > 0 && hit[0].object === frame.mesh;
+    const targetScale = isHover ? 1.1 : 1;
+    frame.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
+  });
+
+  composer.render();
+  requestAnimationFrame(animate);
+}
+
+animate();
+
+window.addEventListener('resize', () => {
+  const w = window.innerWidth;
+  const h = window.innerHeight;
+  camera.aspect = w / h;
+  camera.updateProjectionMatrix();
+  renderer.setSize(w, h);
+  composer.setSize(w, h);
+  bloomPass.setSize(w, h);
+});
 
EOF
)
