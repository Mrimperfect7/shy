"use client";

import { Suspense, useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, createPortal } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Sparkles } from "@react-three/drei";
import Mannequin from "./Mannequin";
import ProductJewelryModel from "./ProceduralJewelry";
import { AnchorsContext } from "./anchors-context";
import { useTryOnStore, type PlacedItem } from "./tryOnStore";
import type { CameraView } from "./tryOnTypes";

// ─── Cinematic camera presets per body area ──────────────────────────────────
const CAMERA_PRESETS: Record<CameraView, { position: [number, number, number]; target: [number, number, number] }> = {
  wrist: { position: [-0.28, 0.44, 1.1], target: [-0.42, -0.02, 0.15] },
  ring: { position: [0.42, 0.34, 0.85], target: [0.35, -0.03, 0.15] },
  neck: { position: [1.0, 0.66, 0.28], target: [1.0, 0.28, -0.9] },
};

function CameraRig() {
  const cameraView = useTryOnStore((s) => s.cameraView);
  const viewNonce = useTryOnStore((s) => s.viewNonce);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as any;
  const anim = useRef<{ pos: THREE.Vector3; tgt: THREE.Vector3 } | null>(null);

  useEffect(() => {
    const p = CAMERA_PRESETS[cameraView];
    anim.current = { pos: new THREE.Vector3(...p.position), tgt: new THREE.Vector3(...p.target) };
  }, [cameraView, viewNonce]);

  useFrame((_, dt) => {
    if (!anim.current || !controls) return;
    const k = 1 - Math.exp(-3.2 * dt);
    camera.position.lerp(anim.current.pos, k);
    controls.target.lerp(anim.current.tgt, k);
    controls.update();
    if (camera.position.distanceTo(anim.current.pos) < 0.008) anim.current = null;
  });
  return null;
}

// ─── One worn jewelry instance, parented under its named body anchor ─────────
function PlacedJewelry({ item }: { item: PlacedItem }) {
  const { anchors, ready } = useContext(AnchorsContext);
  const { selectItem, updateTransform, setDragging, markLoadFailed, selectedId } = useTryOnStore();
  const anchor = anchors[item.anchorId];
  const highlightRef = useRef<THREE.Mesh>(null);
  const selected = selectedId === item.instanceId;

  useFrame(({ clock }) => {
    if (highlightRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.03;
      highlightRef.current.scale.setScalar(s);
    }
  });

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

  const highlightRadius = item.category === "ring" ? 0.08 : item.bodyPart === "wrist" ? 0.23 : 0;

  return createPortal(
    <group
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onPointerDown={startDrag}
      userData={{ testId: `worn-${item.productId}` }}
    >
      <ProductJewelryModel item={item} onLoadFailed={() => markLoadFailed(item.instanceId)} />
      {selected && highlightRadius > 0 && (
        <mesh ref={highlightRef} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[highlightRadius, 0.0035, 8, 64]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.85} />
        </mesh>
      )}
      {selected && <Sparkles count={14} scale={0.5} size={2.5} speed={0.35} color="#F3E5AB" />}
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

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 42, position: [0.35, 0.6, 2.4] }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      onPointerMissed={() => selectItem(null)}
      data-testid="tryon-canvas"
    >
      <color attach="background" args={["#0B0B0C"]} />
      <fog attach="fog" args={["#0B0B0C", 3.6, 7.5]} />

      {/* studio lighting — fully procedural, no network HDR fetch */}
      <ambientLight intensity={0.35} color="#FFF8E7" />
      <spotLight position={[3, 5, 3]} angle={0.5} penumbra={0.6} intensity={140} color="#FFF3D6" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-4, 2, -2.5]} angle={0.6} penumbra={0.8} intensity={60} color="#D4AF37" />
      <pointLight position={[0, -2, 2.5]} intensity={8} color="#7E8AA2" />
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.2} color="#FFF3D6" position={[0, 3, 2]} scale={[4, 2, 1]} />
          <Lightformer intensity={1.4} color="#D4AF37" position={[-4, 1, -2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 1.5, 1]} />
          <Lightformer intensity={0.8} color="#8FA0BF" position={[4, -1, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 1, 1]} />
          <Lightformer intensity={1.0} color="#FFFFFF" position={[0, 1, -4]} scale={[5, 2, 1]} />
        </Environment>
      </Suspense>

      <Mannequin
        onReady={(map) => {
          setAnchors(map);
          setReady(true);
        }}
      />

      <AnchorsContext.Provider value={{ anchors, ready }}>
        {items.map((item) => (
          <PlacedJewelry key={item.instanceId} item={item} />
        ))}
      </AnchorsContext.Provider>

      {/* showroom floor */}
      <mesh position={[0, -0.625, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#0E0E10" roughness={0.35} metalness={0.55} envMapIntensity={0.5} />
      </mesh>
      <ContactShadows position={[0, -0.62, 0]} opacity={0.65} scale={5} blur={2.4} far={1.6} color="#000000" />

      <CameraRig />
      <OrbitControls
        makeDefault
        enabled={!draggingId}
        enablePan={false}
        minDistance={0.35}
        maxDistance={3.4}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 + 0.15}
      />
    </Canvas>
  );
}
