"use client";

import { Suspense, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, createPortal } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import Mannequin from "./Mannequin";
import ProductJewelryModel from "./ProceduralJewelry";
import { AnchorsContext } from "./anchors-context";
import { useTryOnStore, type PlacedItem } from "./tryOnStore";
import type { CameraView } from "./tryOnTypes";

// Bounds-based framing keeps complete silhouettes visible on tall phone screens.
const CAMERA_PRESETS: Record<CameraView, { direction: number[]; target: number[]; size: number[] }> = {
  wrist: { direction: [.20, 1.65, 1.35], target: [-.24, 0, -.07], size: [2.02, .33, .72] },
  ring: { direction: [.12, 1.7, 1.10], target: [.30, -.015, -.075], size: [.96, .23, .70] },
  neck: { direction: [.10, .12, 2], target: [0, -.02, .025], size: [1.04, 1.13, .55] },
};

function CameraRig() {
  const cameraView = useTryOnStore((s) => s.cameraView);
  const viewNonce = useTryOnStore((s) => s.viewNonce);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as any;
  const { width, height } = useThree((s) => s.size);
  const anim = useRef<{ pos: THREE.Vector3; tgt: THREE.Vector3 } | null>(null);

  useEffect(() => {
    const p = cameraView === "ring" && width < 600
      ? { ...CAMERA_PRESETS.wrist, direction: CAMERA_PRESETS.ring.direction }
      : CAMERA_PRESETS[cameraView];
    const direction = new THREE.Vector3(...p.direction).normalize();
    const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right);
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    let distance = 0;
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
      const corner = new THREE.Vector3(x * p.size[0] / 2, y * p.size[1] / 2, z * p.size[2] / 2);
      const depth = corner.dot(direction);
      distance = Math.max(distance,
        Math.abs(corner.dot(right)) / (tan * width / height * .84) + depth,
        Math.abs(corner.dot(up)) / (tan * .76) + depth);
    }
    const tgt = new THREE.Vector3(...p.target);
    anim.current = { pos: tgt.clone().addScaledVector(direction, distance), tgt };
    if (controls && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      camera.position.copy(anim.current.pos);
      controls.target.copy(tgt);
      controls.update();
      anim.current = null;
    }
  }, [cameraView, viewNonce, camera, controls, width, height]);

  useEffect(() => {
    const cancel = () => { anim.current = null; };
    controls?.addEventListener("start", cancel);
    return () => controls?.removeEventListener("start", cancel);
  }, [controls]);

  useFrame((_, dt) => {
    if (!anim.current || !controls) return;
    const k = 1 - Math.exp(-5 * dt);
    camera.position.lerp(anim.current.pos, k);
    controls.target.lerp(anim.current.tgt, k);
    controls.update();
    if (camera.position.distanceTo(anim.current.pos) < .001 && controls.target.distanceTo(anim.current.tgt) < .001) {
      camera.position.copy(anim.current.pos);
      controls.target.copy(anim.current.tgt);
      anim.current = null;
    }
  });
  return null;
}

// ─── One worn jewelry instance, parented under its named body anchor ─────────
function PlacedJewelry({ item }: { item: PlacedItem }) {
  const { anchors, ready } = useContext(AnchorsContext);
  const { selectItem, updateTransform, setDragging, markLoadFailed } = useTryOnStore();
  const anchor = anchors[item.anchorId];

  if (!ready || !anchor) return null;

  const startDrag = (e: any) => {
    e.stopPropagation();
    selectItem(item.instanceId);
    setDragging(item.instanceId);
    const startX = e.clientX ?? e.nativeEvent?.clientX ?? 0;
    const startY = e.clientY ?? e.nativeEvent?.clientY ?? 0;
    const startRot = [...item.rotation] as [number, number, number];
    const startPos = [...item.position] as [number, number, number];
    const isNeck = item.bodyPart === "neck";

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (isNeck) {
        updateTransform(item.instanceId, {
          rotation: [startRot[0], startRot[1] + dx * 0.012, startRot[2]],
          position: [startPos[0], THREE.MathUtils.clamp(startPos[1] - dy * 0.0015, -0.12, 0.08), startPos[2]],
        });
      } else {
        updateTransform(item.instanceId, {
          rotation: [startRot[0] + dx * 0.012, startRot[1], startRot[2]],
          position: [THREE.MathUtils.clamp(startPos[0] + dy * 0.002, -0.32, 0.14), startPos[1], startPos[2]],
        });
      }
    };
    const onUp = () => {
      setDragging(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return createPortal(
    <group
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onPointerDown={startDrag}
      userData={{ testId: `worn-${item.productId}` }}
    >
      <ProductJewelryModel item={item} onLoadFailed={() => markLoadFailed(item.instanceId)} />
    </group>,
    anchor
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────
export default function TryOnScene() {
  const items = useTryOnStore((s) => s.items);
  const selectItem = useTryOnStore((s) => s.selectItem);
  const draggingId = useTryOnStore((s) => s.draggingId);
  const [anchors, setAnchors] = useState<Record<string, THREE.Group | null>>({});
  const [ready, setReady] = useState(false);
  const cameraView = useTryOnStore((s) => s.cameraView);
  const handleBodyReady = useCallback((map: Record<string, THREE.Group | null>) => {
    setAnchors(map);
    setReady(true);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 36, position: [-.24, 2, 2], near: .01, far: 30 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
      onPointerMissed={() => selectItem(null)}
      data-testid="tryon-canvas"
    >
      <color attach="background" args={["#151619"]} />
      <fog attach="fog" args={["#151619", 8, 16]} />

      {/* Neutral softboxes reveal anatomy without bleaching the ivory surface. */}
      <ambientLight intensity={.5} color="#FFF9F0" />
      <directionalLight position={[-2, 4, 3]} intensity={2.2} color="#FFF6E9" />
      <directionalLight position={[3, 1, -2]} intensity={1.4} color="#E5EDFF" />
      <directionalLight position={[0, 1, 4]} intensity={.5} color="#FFFFFF" />
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.2} color="#FFF3D6" position={[0, 3, 2]} scale={[4, 2, 1]} />
          <Lightformer intensity={1.4} color="#D4AF37" position={[-4, 1, -2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 1.5, 1]} />
          <Lightformer intensity={0.8} color="#8FA0BF" position={[4, -1, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 1, 1]} />
          <Lightformer intensity={1.0} color="#FFFFFF" position={[0, 1, -4]} scale={[5, 2, 1]} />
        </Environment>
      </Suspense>

      <Mannequin onReady={handleBodyReady} />

      <AnchorsContext.Provider value={{ anchors, ready }}>
        {items.map((item) => (
          <PlacedJewelry key={item.instanceId} item={item} />
        ))}
      </AnchorsContext.Provider>

      {/* showroom floor */}
      <mesh position={[0, -.565, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#151619" roughness={.85} metalness={.05} />
      </mesh>
      <ContactShadows key={`${cameraView}-${ready}`} position={[0, -.56, 0]} opacity={.3} scale={5} blur={3} far={1.5} color="#000000" frames={2} />

      <CameraRig />
      <OrbitControls
        makeDefault
        enabled={!draggingId}
        enablePan={false}
        minDistance={cameraView === "ring" ? .65 : 1.1}
        maxDistance={6}
        minPolarAngle={.2}
        maxPolarAngle={Math.PI / 2 + .10}
        enableDamping
        dampingFactor={.08}
      />
    </Canvas>
  );
}
