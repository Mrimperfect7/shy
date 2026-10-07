"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Loader2,
} from "lucide-react";

interface Product3DViewerProps {
  modelUrl: string;
  productName: string;
  productCategory?: string;
}

export default function Product3DViewer({
  modelUrl,
  productName,
  productCategory = "jewellery",
}: Product3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const autoRotateRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  // Keep autoRotateRef in sync with state
  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const handleReset = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    controlsRef.current.reset();
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const newDist = Math.max(controls.minDistance, camera.position.distanceTo(controls.target) * 0.8);
    camera.position.setLength(newDist);
    controls.update();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const newDist = Math.min(controls.maxDistance, camera.position.distanceTo(controls.target) * 1.25);
    camera.position.setLength(newDist);
    controls.update();
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // WebGL check
    try {
      const test = document.createElement("canvas");
      const gl = test.getContext("webgl2") || test.getContext("webgl");
      if (!gl) { setWebglOk(false); return; }
    } catch {
      setWebglOk(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ── SCENE ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f5);
    sceneRef.current = scene;

    // ── CAMERA ─────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 200);
    camera.position.set(0, 0.5, 3.5);
    cameraRef.current = camera;

    // ── RENDERER ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // ── CONTROLS ───────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.5;
    controls.maxDistance = 12;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.8;
    controls.enablePan = false;
    controlsRef.current = controls;

    // ── LIGHTING — Premium Jewellery Studio ────────────────
    // Ambient base
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.9);
    scene.add(ambientLight);

    // Key light (warm top-right)
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
    keyLight.position.set(3, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 30;
    scene.add(keyLight);

    // Fill light (cool blue-left)
    const fillLight = new THREE.DirectionalLight(0xd0e8ff, 1.6);
    fillLight.position.set(-4, 2, 2);
    scene.add(fillLight);

    // Rim / back light (strong highlight)
    const rimLight = new THREE.DirectionalLight(0xfffde8, 2.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Under-fill (soft ground bounce)
    const underLight = new THREE.DirectionalLight(0xffecd0, 0.6);
    underLight.position.set(0, -4, 1);
    scene.add(underLight);

    // Specular glint point light (orbits slowly)
    const glintLight = new THREE.PointLight(0xffe4b0, 4, 8);
    glintLight.position.set(2, 2, 2);
    scene.add(glintLight);

    // ── SUBTLE GROUND PLANE ───────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(12, 12);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.08 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ── ENVIRONMENT MAP (procedural) ──────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = null;

    // simple gradient env — multiple hemisphere lights
    const envLights = [
      { color: 0xfff8e8, intensity: 1.2 },
      { color: 0xe8f0ff, intensity: 0.8 },
      { color: 0xffffff, intensity: 1.0 },
    ];
    envLights.forEach(({ color, intensity }) => {
      const light = new THREE.HemisphereLight(color, 0x111100, intensity);
      envScene.add(light);
    });

    const envTexture = pmremGenerator.fromScene(envScene as any).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // ── LOAD GLB MODEL ────────────────────────────────────
    const loader = new GLTFLoader();
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Compute bounding box and center / scale model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDim;
        model.scale.setScalar(scale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );

        // Apply realistic PBR materials to all meshes
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const applyGoldMaterial = (m: THREE.Mesh) => {
              m.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xd4af37),
                emissive: new THREE.Color(0x1a0e00),
                emissiveIntensity: 0.08,
                metalness: 0.97,
                roughness: 0.15,
                clearcoat: 0.9,
                clearcoatRoughness: 0.1,
                reflectivity: 1.0,
                envMapIntensity: 1.5,
              });
            };

            const applySilverMaterial = (m: THREE.Mesh) => {
              m.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xd0d0d8),
                metalness: 0.98,
                roughness: 0.08,
                clearcoat: 0.8,
                clearcoatRoughness: 0.06,
                reflectivity: 1.0,
                envMapIntensity: 1.8,
              });
            };

            const applyGemMaterial = (m: THREE.Mesh, base?: THREE.Color) => {
              m.material = new THREE.MeshPhysicalMaterial({
                color: base || new THREE.Color(0x99ccff),
                transmission: 0.92,
                opacity: 1,
                transparent: true,
                roughness: 0.04,
                ior: 2.42,
                metalness: 0,
                thickness: 0.5,
                envMapIntensity: 3.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.0,
              });
            };

            // Try to detect material type from existing material or mesh name
            const name = (mesh.name || "").toLowerCase();
            const matName = Array.isArray(mesh.material)
              ? (mesh.material[0] as any)?.name?.toLowerCase() || ""
              : (mesh.material as any)?.name?.toLowerCase() || "";
            const existingMat = Array.isArray(mesh.material)
              ? mesh.material[0]
              : mesh.material;

            // If the existing material already has a reasonable color & metalness, enhance it
            if (existingMat instanceof THREE.MeshStandardMaterial || existingMat instanceof THREE.MeshPhysicalMaterial) {
              const enhanced = new THREE.MeshPhysicalMaterial();
              enhanced.copy(existingMat as THREE.MeshPhysicalMaterial);
              enhanced.metalness = Math.max(enhanced.metalness, 0.7);
              enhanced.roughness = Math.min(enhanced.roughness, 0.25);
              enhanced.clearcoat = 0.8;
              enhanced.clearcoatRoughness = 0.1;
              enhanced.envMapIntensity = 1.5;
              mesh.material = enhanced;
            } else if (
              name.includes("gem") || name.includes("stone") ||
              name.includes("diamond") || name.includes("crystal") ||
              name.includes("ruby") || name.includes("emerald") ||
              matName.includes("gem") || matName.includes("stone") || matName.includes("diamond")
            ) {
              applyGemMaterial(mesh);
            } else if (
              name.includes("silver") || name.includes("platinum") || name.includes("white") ||
              matName.includes("silver") || matName.includes("platinum")
            ) {
              applySilverMaterial(mesh);
            } else {
              applyGoldMaterial(mesh);
            }
          }
        });

        modelGroup.add(model);

        // Position camera to frame the model
        const modelBox = new THREE.Box3().setFromObject(modelGroup);
        const modelSize = modelBox.getSize(new THREE.Vector3());
        const modelCenter = modelBox.getCenter(new THREE.Vector3());
        const maxModelDim = Math.max(modelSize.x, modelSize.y, modelSize.z);

        controls.target.set(modelCenter.x, modelCenter.y, modelCenter.z);
        const fov = camera.fov * (Math.PI / 180);
        const idealDist = (maxModelDim / 2) / Math.tan(fov / 2) * 2.2;
        camera.position.set(
          modelCenter.x,
          modelCenter.y + modelSize.y * 0.2,
          modelCenter.z + Math.max(idealDist, 1.5)
        );
        controls.minDistance = idealDist * 0.3;
        controls.maxDistance = idealDist * 5;
        controls.update();

        setLoading(false);
        setLoadProgress(100);
      },
      (progress) => {
        if (progress.total > 0) {
          setLoadProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      },
      (error) => {
        console.error("3D model load error:", error);
        setLoadError(true);
        setLoading(false);
      }
    );

    // ── ANIMATION LOOP ────────────────────────────────────
    const clock = new THREE.Clock();
    let elapsed = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      elapsed += delta;

      controls.update();

      // Orbit glint light slowly
      glintLight.position.x = Math.cos(elapsed * 0.7) * 3;
      glintLight.position.z = Math.sin(elapsed * 0.7) * 3;
      glintLight.position.y = 2 + Math.sin(elapsed * 0.4) * 1;

      renderer.render(scene, camera);
    };
    animate();

    // ── RESIZE ────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    // ── CLEANUP ───────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObs.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [modelUrl]);

  if (!webglOk) {
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-[#FAF8F5] rounded-2xl border border-[#C5A059]/20">
        <p className="text-sm text-[#5E564F] font-sans text-center px-6">
          Your browser does not support WebGL. Please use a modern browser to view the 3D model.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#C5A059]/15 shadow-sm group"
      style={{ touchAction: "none" }}
      aria-label={`Interactive 3D view of ${productName}`}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F5]/95 backdrop-blur-sm z-20">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-full border-2 border-[#C5A059]/20 flex items-center justify-center">
              <Loader2 size={22} className="text-[#C5A059] animate-spin" />
            </div>
            <div className="absolute -inset-2 rounded-full border border-[#C5A059]/10 animate-ping" />
          </div>
          <p className="font-sans text-sm font-semibold text-[#141312] tracking-wide">
            Loading 3D Product…
          </p>
          {loadProgress > 0 && loadProgress < 100 && (
            <div className="mt-3 w-36 h-0.5 bg-[#C5A059]/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C5A059] rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          )}
          <p className="mt-2 font-sans text-[11px] text-[#928980]">
            Drag to rotate · Pinch to zoom
          </p>
        </div>
      )}

      {/* Load Error */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F5]/95 z-20 px-6">
          <span className="text-3xl mb-3">💎</span>
          <p className="font-sans text-sm text-[#5E564F] text-center">
            Unable to load 3D model. Please refresh or try again later.
          </p>
        </div>
      )}

      {/* Hint text — fades on interaction */}
      {!loading && !loadError && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-70 group-hover:opacity-0 transition-opacity duration-500">
          <p className="font-sans text-[11px] text-[#5E564F] text-center whitespace-nowrap bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full border border-[#C5A059]/10">
            Drag to rotate · Scroll to zoom
          </p>
        </div>
      )}

      {/* Controls bar */}
      {!loading && !loadError && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-[#C5A059]/20 rounded-full px-3 py-1.5 shadow-sm">
          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#5E564F] hover:text-[#141312] hover:bg-[#C5A059]/10 transition-all"
            aria-label="Reset 3D view"
            title="Reset view"
          >
            <RotateCcw size={14} />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#5E564F] hover:text-[#141312] hover:bg-[#C5A059]/10 transition-all"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#5E564F] hover:text-[#141312] hover:bg-[#C5A059]/10 transition-all"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-[#C5A059]/20" />

          {/* Auto Rotate */}
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
              autoRotate
                ? "text-[#C5A059] bg-[#C5A059]/10"
                : "text-[#5E564F] hover:text-[#141312] hover:bg-[#C5A059]/10"
            }`}
            aria-label={autoRotate ? "Pause auto-rotation" : "Start auto-rotation"}
            title={autoRotate ? "Pause rotation" : "Auto rotate"}
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#5E564F] hover:text-[#141312] hover:bg-[#C5A059]/10 transition-all"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      )}

      {/* Fullscreen Exit hint */}
      {isFullscreen && !loading && !loadError && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm text-white text-xs font-sans rounded-full border border-white/10 hover:bg-black/60 transition-all"
          >
            <Minimize2 size={12} />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}
    </div>
  );
}
