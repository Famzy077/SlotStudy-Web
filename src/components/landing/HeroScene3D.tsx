import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Vibrant 3D hero scene for SlotStudy:
 * A stacked set of academic course books topped with a graduation cap & golden tassel,
 * concentric orbiting knowledge rings in SlotStudy blue & emerald, floating knowledge nodes,
 * and mouse parallax + click-drag rotation.
 */

const BRAND = {
  blue: 0x2563eb,      // SlotStudy Royal Blue
  blueDark: 0x1e3a8a,  // Deep Midnight Navy
  emerald: 0x10b981,   // Study Emerald Green
  amber: 0xf59e0b,     // Tassel / Streak Gold
  indigo: 0x4f46e5,    // Academic Indigo
  violet: 0x8b5cf6,    // Cyber Violet
  paper: 0xf8fafc,     // Crisp White Pages
};

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function HeroScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webgl] = useState(hasWebGL);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webgl) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.matchMedia('(max-width: 640px)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.3, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: !isSmall, alpha: true, powerPreference: 'default' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };
    const mat = (color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      track(new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.1, ...opts }));

    const world = new THREE.Group();
    scene.add(world);

    /* ---------- Book stack ---------- */
    const stack = new THREE.Group();
    world.add(stack);

    const bookDefs = [
      { color: BRAND.blue, w: 3.4, d: 2.4, y: -0.95, rot: 0.14 },    // Bottom: SlotStudy Blue
      { color: BRAND.emerald, w: 3.1, d: 2.2, y: -0.35, rot: -0.22 }, // Middle: Study Emerald
      { color: BRAND.indigo, w: 2.8, d: 2.0, y: 0.22, rot: 0.28 },   // Top: Academic Indigo
    ];
    bookDefs.forEach((b) => {
      const book = new THREE.Group();
      const coverGeo = track(new RoundedBoxGeometry(b.w, 0.48, b.d, 4, 0.08));
      book.add(new THREE.Mesh(coverGeo, mat(b.color, { roughness: 0.3 })));

      // Page block peeking out
      const pagesGeo = track(new THREE.BoxGeometry(b.w - 0.16, 0.34, b.d - 0.12));
      const pages = new THREE.Mesh(pagesGeo, mat(BRAND.paper, { roughness: 0.8 }));
      pages.position.set(0.09, 0, 0);
      book.add(pages);

      book.position.y = b.y;
      book.rotation.y = b.rot;
      stack.add(book);
    });

    /* ---------- Graduation cap ---------- */
    const cap = new THREE.Group();

    // Cap Board (Square mortarboard rotated 45 deg)
    const boardGeo = track(new RoundedBoxGeometry(2.7, 0.12, 2.7, 4, 0.05));
    const board = new THREE.Mesh(boardGeo, mat(BRAND.blueDark, { roughness: 0.25 }));
    board.rotation.y = Math.PI / 4;
    cap.add(board);

    // Crown / Skullcap underneath
    const crownGeo = track(new THREE.CylinderGeometry(0.85, 0.98, 0.52, 32));
    const crown = new THREE.Mesh(crownGeo, mat(BRAND.blue, { roughness: 0.35 }));
    crown.position.y = -0.28;
    cap.add(crown);

    // Center Golden Button
    const buttonGeo = track(new THREE.SphereGeometry(0.12, 16, 16));
    const button = new THREE.Mesh(buttonGeo, mat(BRAND.amber, { roughness: 0.2, metalness: 0.4 }));
    button.position.y = 0.09;
    cap.add(button);

    // Golden Cord & Tassel
    const cordTopGeo = track(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8));
    const cordTop = new THREE.Mesh(cordTopGeo, mat(BRAND.amber, { roughness: 0.3 }));
    cordTop.rotation.z = Math.PI / 2;
    cordTop.position.set(0.5, 0.09, 0);
    cap.add(cordTop);

    const cordGeo = track(new THREE.CylinderGeometry(0.02, 0.02, 1.15, 8));
    const cord = new THREE.Mesh(cordGeo, mat(BRAND.amber, { roughness: 0.3 }));
    cord.position.set(1.0, -0.45, 0);
    cap.add(cord);

    const tasselGeo = track(new THREE.CylinderGeometry(0.08, 0.15, 0.36, 16));
    const tassel = new THREE.Mesh(tasselGeo, mat(BRAND.amber, { roughness: 0.3, metalness: 0.3 }));
    tassel.position.set(1.0, -1.18, 0);
    cap.add(tassel);

    cap.position.set(0, 1.05, 0);
    cap.rotation.z = -0.06;
    stack.add(cap);

    /* ---------- Concentric Knowledge Rings ---------- */
    const ringDefs = [
      { r: 3.9, tube: 0.022, color: BRAND.blue, opacity: 0.65, rx: 1.25, ry: 0.2 },
      { r: 4.4, tube: 0.018, color: BRAND.emerald, opacity: 0.55, rx: 0.95, ry: -0.45 },
    ];
    const rings = ringDefs.map((d) => {
      const geo = track(new THREE.TorusGeometry(d.r, d.tube, 12, 160));
      const m = track(new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: d.opacity }));
      const mesh = new THREE.Mesh(geo, m);
      mesh.rotation.x = d.rx;
      mesh.rotation.y = d.ry;
      world.add(mesh);
      return mesh;
    });

    /* ---------- Floating Knowledge Nodes ---------- */
    type Floater = { mesh: THREE.Object3D; base: THREE.Vector3; speed: number; phase: number; spin: number };
    const floaters: Floater[] = [];
    const addFloater = (mesh: THREE.Object3D, x: number, y: number, z: number, spin = 0.5) => {
      mesh.position.set(x, y, z);
      world.add(mesh);
      floaters.push({ mesh, base: new THREE.Vector3(x, y, z), speed: 0.6 + Math.random() * 0.6, phase: Math.random() * Math.PI * 2, spin });
    };

    // AI Summaries node (Blue Octahedron)
    const octa = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.36)), mat(BRAND.blue, { roughness: 0.2, metalness: 0.3 }));
    addFloater(octa, -3.3, 1.8, 0.6, 0.8);

    // Quiz Arena node (Emerald Sphere)
    const orb = new THREE.Mesh(track(new THREE.SphereGeometry(0.28, 24, 24)), mat(BRAND.emerald, { roughness: 0.2, metalness: 0.2 }));
    addFloater(orb, 3.4, 2.1, 0.4, 0.3);

    // Streak / XP node (Amber Gem)
    const gem = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.3, 0)), mat(BRAND.amber, { roughness: 0.2, metalness: 0.4 }));
    addFloater(gem, 3.2, -1.6, 0.8, 0.7);

    // Study Buddy node (Violet Torus)
    const donut = new THREE.Mesh(track(new THREE.TorusGeometry(0.32, 0.1, 16, 32)), mat(BRAND.violet, { roughness: 0.25 }));
    addFloater(donut, -3.1, -1.5, 0.9, 0.9);

    /* ---------- Constellation Dust ---------- */
    const count = isSmall ? 60 : 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    const dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMat = track(new THREE.PointsMaterial({ size: 0.06, color: BRAND.blue, transparent: true, opacity: 0.55 }));
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    /* ---------- Lighting ---------- */
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 7, 5);
    scene.add(keyLight);

    const blueFill = new THREE.PointLight(BRAND.blue, 12, 16);
    blueFill.position.set(-5, 2, 4);
    scene.add(blueFill);

    const emeraldFill = new THREE.PointLight(BRAND.emerald, 10, 16);
    emeraldFill.position.set(5, -3, 3);
    scene.add(emeraldFill);

    /* ---------- Pointer / Drag Interaction ---------- */
    let targetX = 0;
    let targetY = 0;
    let dragX = 0;
    let dragY = 0;
    let dragging = false;
    let last = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      if (dragging) {
        dragX += (e.clientX - last.x) * 0.01;
        dragY = THREE.MathUtils.clamp(dragY + (e.clientY - last.y) * 0.005, -0.5, 0.5);
        last = { x: e.clientX, y: e.clientY };
        return;
      }
      const rect = container.getBoundingClientRect();
      targetY = (((e.clientX - rect.left) / rect.width) * 2 - 1) * 0.35;
      targetX = (((e.clientY - rect.top) / rect.height) * 2 - 1) * 0.18;
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      container.style.cursor = 'grabbing';
    };
    const onUp = () => {
      dragging = false;
      container.style.cursor = 'grab';
    };
    container.style.cursor = 'grab';
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    /* ---------- Resize Observer ---------- */
    const resize = () => {
      const w = container.clientWidth || 480;
      const h = container.clientHeight || 480;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = w < 440 ? 10.2 : (w < 640 ? 10.8 : (w / h < 0.9 ? 11.8 : 11.2));
      camera.position.y = 0.3;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    /* ---------- Animation Loop ---------- */
    let frameId = 0;
    let visible = true;
    const clock = new THREE.Clock();

    const render = () => {
      const t = clock.getElapsedTime();
      const autoSpin = reduceMotion ? 0 : t * 0.22;
      world.rotation.y += ((autoSpin + targetY + dragX) - world.rotation.y) * 0.06;
      world.rotation.x += ((targetX + dragY) - world.rotation.x) * 0.06;

      if (!reduceMotion) {
        stack.position.y = Math.sin(t * 1.1) * 0.14;
        cap.rotation.y = Math.sin(t * 0.7) * 0.12;
        rings[0].rotation.z = t * 0.12;
        rings[1].rotation.z = -t * 0.09;
        floaters.forEach((f) => {
          f.mesh.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * 0.25;
          f.mesh.rotation.y += 0.01 * f.spin;
          f.mesh.rotation.x += 0.006 * f.spin;
        });
        dust.rotation.y = t * 0.02;
      }
      renderer.render(scene, camera);
    };

    const loop = () => {
      frameId = requestAnimationFrame(loop);
      render();
    };
    const start = () => {
      if (reduceMotion) {
        render();
        return;
      }
      if (!frameId && visible && !document.hidden) loop();
    };
    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(container);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [webgl]);

  if (!webgl) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <img src="/images/slotstudy-icon.png" alt="SlotStudy" className="ls-float w-44 drop-shadow-2xl" />
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full select-none" role="img" aria-label="Interactive 3D illustration of SlotStudy academic books and graduation cap" />;
}
