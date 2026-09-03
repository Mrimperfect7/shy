"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Sparkles, Gift } from "lucide-react";

export default function GiftBoxScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const container = canvasContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.2, 4.8);
    camera.lookAt(0, 0, 0);

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfffaed, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedb, 3.5);
    keyLight.position.set(3, 6, 4);
    scene.add(keyLight);

    const goldSpot = new THREE.PointLight(0xffd700, 4, 8);
    goldSpot.position.set(0, 1.8, 1);
    scene.add(goldSpot);

    // Materials
    const luxuryBoxMat = new THREE.MeshStandardMaterial({
      color: 0x141312,
      roughness: 0.35,
      metalness: 0.1,
    });

    const velvetInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x221e1a,
      roughness: 0.8,
      metalness: 0.05,
    });

    const goldRibbonMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.18,
      clearcoat: 0.9,
    });

    const jewelleryGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xe5c378,
      metalness: 0.96,
      roughness: 0.12,
      clearcoat: 1.0,
      reflectivity: 0.98,
    });

    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.05,
      ior: 2.4,
    });

    // Box Root Group
    const boxGroup = new THREE.Group();
    boxGroup.rotation.y = -Math.PI / 6;
    boxGroup.rotation.x = Math.PI / 14;

    // 1. Box Base
    const baseGeom = new THREE.BoxGeometry(2, 0.8, 2);
    const boxBase = new THREE.Mesh(baseGeom, luxuryBoxMat);
    boxBase.position.y = -0.4;
    boxGroup.add(boxBase);

    // Velvet Cushion Inside
    const cushionGeom = new THREE.BoxGeometry(1.85, 0.2, 1.85);
    const cushion = new THREE.Mesh(cushionGeom, velvetInteriorMat);
    cushion.position.y = -0.05;
    boxGroup.add(cushion);

    // Ribbon on Base
    const ribbonV = new THREE.BoxGeometry(0.2, 0.81, 2.01);
    const ribV = new THREE.Mesh(ribbonV, goldRibbonMat);
    ribV.position.y = -0.4;
    boxGroup.add(ribV);

    const ribbonH = new THREE.BoxGeometry(2.01, 0.81, 0.2);
    const ribH = new THREE.Mesh(ribbonH, goldRibbonMat);
    ribH.position.y = -0.4;
    boxGroup.add(ribH);

    // 2. Sparkling Jewellery Piece Inside
    const pieceGroup = new THREE.Group();
    pieceGroup.position.set(0, 0.15, 0);

    const ringOuter = new THREE.TorusGeometry(0.45, 0.08, 24, 60);
    const rOuter = new THREE.Mesh(ringOuter, jewelleryGoldMat);
    rOuter.rotation.x = Math.PI / 2.5;
    pieceGroup.add(rOuter);

    const diamondGeom = new THREE.OctahedronGeometry(0.22, 2);
    const diamond = new THREE.Mesh(diamondGeom, gemMat);
    diamond.position.set(0, 0.35, 0.2);
    pieceGroup.add(diamond);

    boxGroup.add(pieceGroup);

    // 3. Box Lid (Hinged to lift up and backward)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0, -1); // Pivot point at back edge

    const lidGeom = new THREE.BoxGeometry(2.06, 0.3, 2.06);
    const boxLid = new THREE.Mesh(lidGeom, luxuryBoxMat);
    boxLid.position.set(0, 0.15, 1);
    lidGroup.add(boxLid);

    // Gold Ribbon cross on Lid
    const lidRibV = new THREE.BoxGeometry(0.22, 0.31, 2.07);
    const lRibV = new THREE.Mesh(lidRibV, goldRibbonMat);
    lRibV.position.set(0, 0.15, 1);
    lidGroup.add(lRibV);

    const lidRibH = new THREE.BoxGeometry(2.07, 0.31, 0.22);
    const lRibH = new THREE.Mesh(lidRibH, goldRibbonMat);
    lRibH.position.set(0, 0.15, 1);
    lidGroup.add(lRibH);

    // Ribbon Bow
    const bowGeom = new THREE.TorusGeometry(0.25, 0.06, 16, 32);
    const bowLeft = new THREE.Mesh(bowGeom, goldRibbonMat);
    bowLeft.position.set(-0.25, 0.38, 1);
    bowLeft.rotation.y = Math.PI / 4;
    lidGroup.add(bowLeft);

    const bowRight = new THREE.Mesh(bowGeom, goldRibbonMat);
    bowRight.position.set(0.25, 0.38, 1);
    bowRight.rotation.y = -Math.PI / 4;
    lidGroup.add(bowRight);

    boxGroup.add(lidGroup);
    scene.add(boxGroup);

    // Floating Sparkles
    const sparkleCount = 40;
    const sparkleGeom = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount * 3; i += 3) {
      sparklePos[i] = (Math.random() - 0.5) * 4;
      sparklePos[i + 1] = Math.random() * 2;
      sparklePos[i + 2] = (Math.random() - 0.5) * 4;
    }
    sparkleGeom.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const sparkles = new THREE.Points(sparkleGeom, sparkleMat);
    scene.add(sparkles);

    // ScrollTrigger Animation: Lid lifts and rotates back as user scrolls into the section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
        end: "center center",
        scrub: 1.5,
      },
    });

    tl.to(lidGroup.rotation, {
      x: -Math.PI * 0.65,
      ease: "power2.out",
    }, 0);

    tl.to(pieceGroup.position, {
      y: 0.45,
      ease: "power2.out",
    }, 0.2);

    tl.to(pieceGroup.rotation, {
      y: Math.PI * 0.75,
      ease: "power1.out",
    }, 0.2);

    tl.to(goldSpot, {
      intensity: 7,
      ease: "power2.out",
    }, 0.1);

    // Loop
    let animId: number;
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      boxGroup.rotation.y = -Math.PI / 6 + Math.sin(time * 0.8) * 0.05;
      pieceGroup.rotation.y += 0.008;
      sparkles.rotation.y = time * 0.05;

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
      tl.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === containerRef.current) t.kill();
      });
      renderer.dispose();
      luxuryBoxMat.dispose();
      velvetInteriorMat.dispose();
      goldRibbonMat.dispose();
      jewelleryGoldMat.dispose();
      gemMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative py-24 lg:py-32 overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: 3D Box Scene Canvas */}
        <div className="lg:col-span-7 h-[420px] sm:h-[500px] relative rounded-3xl bg-gradient-to-tr from-[#1A1817] via-[#242220] to-[#121110] border border-[#C5A059]/30 shadow-2xl overflow-hidden">
          <div ref={canvasContainerRef} className="w-full h-full cursor-grab" />
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-sans font-semibold bg-[#C5A059] text-[#141312]">
              <Gift size={12} />
              Interactive 3D Unboxing
            </span>
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/50">
              Scroll down to lift the lid & reveal
            </span>
          </div>
        </div>

        {/* Right: Editorial Gifting Story */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans">
            <Sparkles size={14} />
            <span>Make Someone Shine</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#141312] font-normal leading-[1.05]">
            Wrapped to make hearts flutter.
          </h2>

          <p className="text-base text-[#5E564F] font-sans leading-relaxed">
            Every SHYN.ISH piece comes wrapped in our signature matte black gift box with gold foil embossing, soft velvet interior, and a handwritten-style note. The perfect luxury gifting experience under ₹480.
          </p>

          <ul className="space-y-3 pt-2 text-sm text-[#181614] font-sans">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span>Complimentary luxury velvet gift box</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span>Anti-tarnish ziplock preservation pouch</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span>Personalized gift message option at checkout</span>
            </li>
          </ul>

          <div className="pt-4 flex items-center gap-4">
            <Link
              href="/collections/gifts"
              className="btn-gold"
              data-cursor="GIFT"
            >
              Shop Gift Collection
            </Link>
            <Link
              href="/collections/bestsellers"
              className="btn-outline"
            >
              Explore Bestsellers
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
