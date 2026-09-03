"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function JewelleryChain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff7e8, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffea9f, 2.5);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2,
      clearcoat: 0.8,
    });

    // Procedural interlocking chain curve
    const chainGroup = new THREE.Group();
    const linkGeom = new THREE.TorusGeometry(0.24, 0.05, 12, 24);
    const linkCount = 28;

    for (let i = 0; i < linkCount; i++) {
      const link = new THREE.Mesh(linkGeom, goldMat);
      const t = (i / linkCount) * Math.PI * 2;
      link.position.x = (i - linkCount / 2) * 0.42;
      link.position.y = Math.sin(t) * 0.4;
      link.rotation.y = (i % 2) * (Math.PI / 2);
      link.rotation.z = Math.cos(t) * 0.3;
      chainGroup.add(link);
    }
    scene.add(chainGroup);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      chainGroup.position.y = Math.sin(time * 1.2) * 0.15;
      chainGroup.rotation.z = Math.sin(time * 0.5) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      goldMat.dispose();
      linkGeom.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-24 overflow-hidden relative flex items-center justify-center pointer-events-none opacity-80">
      <div ref={containerRef} className="w-full h-full max-w-5xl" />
    </div>
  );
}
