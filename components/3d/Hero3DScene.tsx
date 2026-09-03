"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Test WebGL support
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 4. Lighting - Premium Studio Setup for 18K PVD Gold
    const ambientLight = new THREE.AmbientLight(0xfffaed, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeed6, 3.5);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4e2ff, 1.8);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff0b8, 2.5);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    const glintLight = new THREE.PointLight(0xffe89e, 3, 10);
    glintLight.position.set(1.5, 1.5, 2.5);
    scene.add(glintLight);

    // 5. 18K PVD Gold Material
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd4af37),
      emissive: new THREE.Color(0x3a2806),
      metalness: 0.95,
      roughness: 0.16,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95,
    });

    const innerStoneMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 2.4, // Diamond IOR
      metalness: 0.1,
    });

    // 6. Signature Jewellery Piece Group
    const jewelleryGroup = new THREE.Group();

    // Central luxury interlocking pendant
    const ringGeom1 = new THREE.TorusGeometry(1.2, 0.15, 32, 100);
    const ring1 = new THREE.Mesh(ringGeom1, goldMaterial);
    jewelleryGroup.add(ring1);

    const ringGeom2 = new THREE.TorusGeometry(0.85, 0.12, 32, 80);
    const ring2 = new THREE.Mesh(ringGeom2, goldMaterial);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    jewelleryGroup.add(ring2);

    // Center faceted brilliant gem
    const gemGeom = new THREE.OctahedronGeometry(0.5, 2);
    const gem = new THREE.Mesh(gemGeom, innerStoneMaterial);
    jewelleryGroup.add(gem);

    // Delicate hanging droplet
    const dropGeom = new THREE.ConeGeometry(0.3, 0.7, 16);
    const drop = new THREE.Mesh(dropGeom, goldMaterial);
    drop.position.set(0, -1.6, 0);
    drop.rotation.z = Math.PI;
    jewelleryGroup.add(drop);

    // Chain links (Upper suspension)
    const linkGeom = new THREE.TorusGeometry(0.2, 0.05, 16, 32);
    for (let i = 1; i <= 6; i++) {
      const linkLeft = new THREE.Mesh(linkGeom, goldMaterial);
      linkLeft.position.set(-0.25 * i, 1.2 + 0.35 * i, 0);
      linkLeft.rotation.y = i % 2 === 0 ? Math.PI / 2 : 0;
      jewelleryGroup.add(linkLeft);

      const linkRight = new THREE.Mesh(linkGeom, goldMaterial);
      linkRight.position.set(0.25 * i, 1.2 + 0.35 * i, 0);
      linkRight.rotation.y = i % 2 === 0 ? Math.PI / 2 : 0;
      jewelleryGroup.add(linkRight);
    }

    scene.add(jewelleryGroup);

    // 7. Subtle floating golden light motes / particles
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xe5c378,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 8. Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 9. GSAP ScrollTrigger timeline for scrubbed storytelling
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
      },
    });

    scrollTl.to(camera.position, {
      z: 3.4,
      y: -0.2,
      ease: "power1.inOut",
    }, 0);

    scrollTl.to(jewelleryGroup.rotation, {
      y: Math.PI * 1.8,
      x: 0.4,
      ease: "none",
    }, 0);

    scrollTl.to(camera, {
      fov: 38,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.inOut",
    }, 0);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle rotation + mouse sway
      targetRotY += (mouseX * 0.4 - targetRotY) * 0.05;
      targetRotX += (-mouseY * 0.3 - targetRotX) * 0.05;

      jewelleryGroup.rotation.y += 0.006;
      jewelleryGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.08;
      gem.rotation.y -= 0.015;

      // Gently rotate sparkles
      particles.rotation.y = elapsedTime * 0.02;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;

      // Animate glint light around jewellery
      glintLight.position.x = Math.cos(elapsedTime * 1.2) * 2.5;
      glintLight.position.y = Math.sin(elapsedTime * 0.9) * 2;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Responsive resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      scrollTl.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === container) t.kill();
      });
      renderer.dispose();
      goldMaterial.dispose();
      innerStoneMaterial.dispose();
      ringGeom1.dispose();
      ringGeom2.dispose();
      gemGeom.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full border border-[#C5A059]/40 bg-gradient-to-tr from-[#C5A059]/10 via-[#FAF8F5]/5 to-[#C5A059]/30 blur-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="webgl-hero-container absolute inset-0 w-full h-full pointer-events-auto"
      style={{ touchAction: "none" }}
    />
  );
}
