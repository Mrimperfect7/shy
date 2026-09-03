"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCw, ZoomIn, ZoomOut, Sparkles } from "lucide-react";

interface Product3DViewerProps {
  modelUrl?: string | null;
  productTitle: string;
  category?: string;
  posterImage?: string;
  className?: string;
}

export default function Product3DViewer({
  modelUrl,
  productTitle,
  category = "necklace",
  posterImage,
  className = "w-full h-[400px]",
}: Product3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Three.js Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 4.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff2db, 3);
    dirLight1.position.set(4, 5, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xdbe7ff, 1.5);
    dirLight2.position.set(-4, -2, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffdf80, 2.5, 8);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // 5. Materials
    const goldPVD = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd4af37),
      metalness: 0.94,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });

    const gemMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 2.4,
    });

    // 6. Object Group based on category
    const itemGroup = new THREE.Group();

    const catLower = category.toLowerCase();
    if (catLower.includes("ring")) {
      // Band
      const bandGeom = new THREE.TorusGeometry(0.9, 0.14, 32, 80);
      const band = new THREE.Mesh(bandGeom, goldPVD);
      itemGroup.add(band);

      // Crown & Solitaire Gem
      const gemGeom = new THREE.OctahedronGeometry(0.35, 2);
      const gem = new THREE.Mesh(gemGeom, gemMaterial);
      gem.position.set(0, 0.95, 0);
      itemGroup.add(gem);

      const prongGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const prong = new THREE.Mesh(prongGeom, goldPVD);
        prong.position.set(Math.cos(angle) * 0.22, 0.9, Math.sin(angle) * 0.22);
        itemGroup.add(prong);
      }
    } else if (catLower.includes("earring")) {
      // Luxury hoop earring with hanging charm
      const hoopGeom = new THREE.TorusGeometry(0.75, 0.1, 24, 60, Math.PI * 1.7);
      const hoop = new THREE.Mesh(hoopGeom, goldPVD);
      hoop.rotation.z = Math.PI / 4;
      itemGroup.add(hoop);

      const charmGeom = new THREE.DodecahedronGeometry(0.32);
      const charm = new THREE.Mesh(charmGeom, goldPVD);
      charm.position.set(0, -1.1, 0);
      itemGroup.add(charm);
    } else if (catLower.includes("bangle") || catLower.includes("bracelet")) {
      // Classic Gold Bangle with textured diamond cut
      const bangleGeom = new THREE.TorusGeometry(1.2, 0.16, 32, 100);
      const bangle = new THREE.Mesh(bangleGeom, goldPVD);
      itemGroup.add(bangle);

      // Embedded accent stones
      const stoneGeom = new THREE.SphereGeometry(0.06, 12, 12);
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12;
        const stone = new THREE.Mesh(stoneGeom, gemMaterial);
        stone.position.set(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.12);
        itemGroup.add(stone);
      }
    } else {
      // Signature Pendant Necklace
      const pendantOuter = new THREE.TorusGeometry(0.9, 0.12, 32, 60);
      const outer = new THREE.Mesh(pendantOuter, goldPVD);
      itemGroup.add(outer);

      const pendantInner = new THREE.OctahedronGeometry(0.42, 2);
      const inner = new THREE.Mesh(pendantInner, gemMaterial);
      itemGroup.add(inner);

      // Bail / loop
      const bailGeom = new THREE.TorusGeometry(0.2, 0.05, 16, 24);
      const bail = new THREE.Mesh(bailGeom, goldPVD);
      bail.position.set(0, 1.05, 0);
      itemGroup.add(bail);
    }

    scene.add(itemGroup);

    // 7. Interactive Drag State
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      targetRotY += deltaX * 0.012;
      targetRotX += deltaY * 0.012;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
      setTimeout(() => setIsInteracting(false), 2000);
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);

    // 8. Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging && !isInteracting) {
        targetRotY += 0.008;
      }

      // Smooth damping
      itemGroup.rotation.y += (targetRotY - itemGroup.rotation.y) * 0.1;
      itemGroup.rotation.x += (targetRotX - itemGroup.rotation.x) * 0.1;

      // Soft breathing hover
      itemGroup.position.y = Math.sin(Date.now() * 0.002) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      goldPVD.dispose();
      gemMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [category, autoRotate, isInteracting]);

  return (
    <div className={`relative bg-gradient-to-b from-[#F3EDE2]/40 to-[#FAF8F5] rounded-xl overflow-hidden border border-[#C5A059]/20 group ${className}`}>
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Control Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-full backdrop-blur-md border transition-all text-xs ${
            autoRotate
              ? "bg-[#C5A059] text-[#141312] border-[#C5A059]"
              : "bg-[#FAF8F5]/80 text-[#5E564F] border-[#C5A059]/30"
          }`}
          title="Toggle 360 Spin"
        >
          <RotateCw size={13} className={autoRotate ? "animate-spin" : ""} style={{ animationDuration: "6s" }} />
        </button>
      </div>

      {/* Helper instructions */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#5E564F]/80 bg-[#FAF8F5]/70 backdrop-blur-sm px-3 py-1 rounded-full border border-[#C5A059]/20 flex items-center gap-1.5">
          <Sparkles size={11} className="text-[#C5A059]" />
          Drag to Rotate 360°
        </span>
      </div>
    </div>
  );
}
