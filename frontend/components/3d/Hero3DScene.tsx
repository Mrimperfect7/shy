"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function createGlowTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.2, "rgba(255, 235, 170, 0.85)");
  grad.addColorStop(0.5, "rgba(218, 165, 32, 0.35)");
  grad.addColorStop(0.8, "rgba(197, 160, 89, 0.08)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createDiamondSparkleTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.15, "rgba(255, 245, 210, 0.95)");
  grad.addColorStop(0.4, "rgba(229, 195, 120, 0.4)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  // 4-point Diamond Starburst rays
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(32, 4);
  ctx.lineTo(32, 60);
  ctx.moveTo(4, 32);
  ctx.lineTo(60, 32);
  ctx.stroke();

  // Diagonal micro rays
  ctx.strokeStyle = "rgba(255, 240, 190, 0.45)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(18, 18);
  ctx.lineTo(46, 46);
  ctx.moveTo(18, 46);
  ctx.lineTo(46, 18);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

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

    // 7. Shimmering Golden Stardust & Orbiting Diamond Sparkles
    const glowTex = createGlowTexture();
    const diamondTex = createDiamondSparkleTexture();

    // 7a. Ambient Floating Golden Stardust
    const dustCount = 320;
    const dustGeom = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustBaseX = new Float32Array(dustCount);
    const dustBaseZ = new Float32Array(dustCount);
    const dustSpeeds = new Float32Array(dustCount);
    const dustPhases = new Float32Array(dustCount);
    const dustColors = new Float32Array(dustCount * 3);

    const goldPalette = [
      new THREE.Color(0xfff8d6), // Pure champagne starlight
      new THREE.Color(0xf6d365), // 18K PVD radiant gold
      new THREE.Color(0xd4af37), // Metallic golden luster
      new THREE.Color(0xffeedb), // Diamond shimmer
      new THREE.Color(0xe8b87a), // Warm amber gold
    ];

    for (let i = 0; i < dustCount; i++) {
      const x = (Math.random() - 0.5) * 14;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 8;

      dustPos[i * 3] = x;
      dustPos[i * 3 + 1] = y;
      dustPos[i * 3 + 2] = z;

      dustBaseX[i] = x;
      dustBaseZ[i] = z;
      dustSpeeds[i] = 0.003 + Math.random() * 0.006;
      dustPhases[i] = Math.random() * Math.PI * 2;

      const col = goldPalette[Math.floor(Math.random() * goldPalette.length)];
      dustColors[i * 3] = col.r;
      dustColors[i * 3 + 1] = col.g;
      dustColors[i * 3 + 2] = col.b;
    }

    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeom.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.14,
      map: glowTex || undefined,
      transparent: true,
      vertexColors: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeom, dustMaterial);
    scene.add(dustPoints);

    // 7b. Orbiting Diamond Sparkles around the pendant
    const sparkleCount = 55;
    const sparkleGeom = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    const sparkleRotRadii = new Float32Array(sparkleCount);
    const sparkleRotSpeeds = new Float32Array(sparkleCount);
    const sparkleYOffs = new Float32Array(sparkleCount);
    const sparkleTilt = new Float32Array(sparkleCount);

    for (let i = 0; i < sparkleCount; i++) {
      sparkleRotRadii[i] = 1.2 + Math.random() * 2.2;
      sparkleRotSpeeds[i] = (0.25 + Math.random() * 0.45) * (Math.random() > 0.4 ? 1 : -1);
      sparkleYOffs[i] = (Math.random() - 0.5) * 3.0;
      sparkleTilt[i] = (Math.random() - 0.5) * 0.8;
    }
    sparkleGeom.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));

    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.24,
      map: diamondTex || undefined,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparklePoints = new THREE.Points(sparkleGeom, sparkleMaterial);
    scene.add(sparklePoints);

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

      // Animate ambient floating gold dust
      const pArr = dustPos;
      for (let i = 0; i < dustCount; i++) {
        const idx = i * 3;
        pArr[idx + 1] += dustSpeeds[i];
        if (pArr[idx + 1] > 6) {
          pArr[idx + 1] = -6;
        }
        const sway = Math.sin(elapsedTime * 0.6 + dustPhases[i]) * 0.2;
        pArr[idx] = dustBaseX[i] + sway + mouseX * 0.35;
        pArr[idx + 2] = dustBaseZ[i] + Math.cos(elapsedTime * 0.5 + dustPhases[i]) * 0.2 - mouseY * 0.25;
      }
      dustGeom.attributes.position.needsUpdate = true;

      // Animate orbiting diamond sparkles around pendant
      const sArr = sparklePos;
      for (let i = 0; i < sparkleCount; i++) {
        const idx = i * 3;
        const angle = elapsedTime * sparkleRotSpeeds[i] + i * ((Math.PI * 2) / sparkleCount);
        const r = sparkleRotRadii[i] + Math.sin(elapsedTime * 1.8 + i) * 0.15;
        const tilt = sparkleTilt[i];

        sArr[idx] = Math.cos(angle) * r;
        sArr[idx + 1] = sparkleYOffs[i] + Math.sin(angle) * tilt * 1.2 + Math.sin(elapsedTime * 1.4 + i) * 0.1;
        sArr[idx + 2] = Math.sin(angle) * r;
      }
      sparkleGeom.attributes.position.needsUpdate = true;

      // Micro twinkle on diamond sparkles
      sparkleMaterial.size = 0.22 + Math.sin(elapsedTime * 3.5) * 0.04;

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
      dustGeom.dispose();
      dustMaterial.dispose();
      sparkleGeom.dispose();
      sparkleMaterial.dispose();
      glowTex?.dispose();
      diamondTex?.dispose();
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
