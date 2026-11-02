import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeKnowledgeCore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeNode, setActiveNode] = useState<string>('AI Core');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Group to hold all 3D components
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Central Holographic Core: Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.4, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      wireframe: true,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    worldGroup.add(coreMesh);

    // Inner Solid Core with Pulsing Glow
    const innerGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x7c3aed,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    worldGroup.add(innerMesh);

    // 2. Concentric Orbiting Knowledge Rings
    // Ring 1 - Inclined 45 deg
    const ring1Geo = new THREE.TorusGeometry(2.3, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.55 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    worldGroup.add(ring1);

    // Ring 2 - Counter Inclined
    const ring2Geo = new THREE.TorusGeometry(2.7, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.45 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    worldGroup.add(ring2);

    // Ring 3 - Outer Horizontal Equator
    const ring3Geo = new THREE.TorusGeometry(3.1, 0.015, 16, 120);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.4 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 2.2;
    worldGroup.add(ring3);

    // 3. Orbiting Milestone Data Nodes (Summaries, Quiz, Buddy, Streak)
    const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const nodes: { mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; label: string }[] = [];

    const nodeColors = [0x38bdf8, 0xa855f7, 0x10b981, 0xf59e0b];
    const nodeLabels = ['AI Summaries', 'Quiz Arena', 'Study Buddy', 'Streak Sync'];

    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 1.4,
      });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      worldGroup.add(mesh);
      nodes.push({
        mesh,
        orbitRadius: 2.3 + (i % 2) * 0.5,
        speed: 0.4 + i * 0.15,
        angle: (i * Math.PI) / 2,
        label: nodeLabels[i],
      });
    }

    // 4. Background Particle Constellation
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.65,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 4, 15);
    blueLight.position.set(4, 3, 4);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 4, 15);
    purpleLight.position.set(-4, -3, 3);
    scene.add(purpleLight);

    // Interactive pointer handling
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        targetRotationY = x * 0.45;
        targetRotationX = -y * 0.45;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damped rotation towards target
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.06;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.06;

      // Base idle rotations
      coreMesh.rotation.y += 0.006;
      coreMesh.rotation.x += 0.004;

      innerMesh.rotation.y -= 0.008;
      innerMesh.rotation.z += 0.005;

      // Core pulse
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.04;
      innerMesh.scale.set(pulse, pulse, pulse);

      // Rings differential spin
      ring1.rotation.z += 0.003;
      ring2.rotation.z -= 0.004;
      ring3.rotation.z += 0.002;

      // Move orbiting milestone data nodes
      nodes.forEach((node, idx) => {
        const theta = elapsedTime * node.speed + node.angle;
        node.mesh.position.x = Math.cos(theta) * node.orbitRadius;
        node.mesh.position.y = Math.sin(theta * 1.2) * 0.7;
        node.mesh.position.z = Math.sin(theta) * node.orbitRadius;

        // Subtle bobbing
        node.mesh.position.y += Math.sin(elapsedTime * 3 + idx) * 0.05;
      });

      // Slowly rotate background particle field
      particleField.rotation.y = elapsedTime * 0.02;
      particleField.rotation.x = elapsedTime * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);

      // Clean disposal
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      nodeGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D WebGL Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Status / Interactive Reticle */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg flex items-center gap-2 text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>3D Neural Core • Interactive</span>
        </div>
      </div>

      {/* Interactive Node Badges on bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
        {['AI Summaries', 'Quiz Arena', 'Study Buddy', 'Streak Sync'].map((label) => (
          <button
            key={label}
            onClick={() => setActiveNode(label)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
              activeNode === label
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400'
                : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Drag Hint */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400/80 pointer-events-none tracking-wider uppercase">
        {isHovered ? 'Drag to inspect 3D strata' : 'Interactive 3D view'}
      </div>
    </div>
  );
}
