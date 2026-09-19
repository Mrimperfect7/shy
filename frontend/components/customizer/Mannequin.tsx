"use client";

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";

// ─── Procedural showroom body: hand form (wrist + fingers) & necklace bust ───
// Exposes named anchors used for exact jewelry attachment:
//   wristAnchor, thumbAnchor, indexFingerAnchor, middleFingerAnchor,
//   ringFingerAnchor, littleFingerAnchor, neckAnchor
// Wear axis convention: wrist/finger jewelry wraps local +X, up is +Y.
// Necklace hangs in neckAnchor space: axis +Y, front of bust faces +Z.

const FINGER_SPECS = [
  { name: "indexFingerAnchor", z: -0.135, seg: [0.15, 0.105, 0.085], r: 0.037 },
  { name: "middleFingerAnchor", z: -0.047, seg: [0.165, 0.115, 0.09], r: 0.039 },
  { name: "ringFingerAnchor", z: 0.044, seg: [0.155, 0.105, 0.085], r: 0.037 },
  { name: "littleFingerAnchor", z: 0.128, seg: [0.115, 0.085, 0.07], r: 0.031 },
] as const;

function Finger({ spec, skin, register }: { spec: (typeof FINGER_SPECS)[number]; skin: THREE.Material; register: (n: string) => (g: Group | null) => void }) {
  const [l1, l2, l3] = spec.seg;
  return (
    <group position={[0.27, 0, spec.z]} rotation={[0, 0, -0.05]}>
      {/* proximal segment + anchor */}
      <mesh position={[l1 / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow material={skin}>
        <capsuleGeometry args={[spec.r, l1, 6, 16]} />
      </mesh>
      <group name={spec.name} ref={register(spec.name)} position={[l1 * 0.55, 0, 0]} />
      {/* middle segment */}
      <group position={[l1, 0, 0]} rotation={[0, 0, -0.16]}>
        <mesh position={[l2 / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow material={skin}>
          <capsuleGeometry args={[spec.r * 0.94, l2, 6, 16]} />
        </mesh>
        {/* tip segment */}
        <group position={[l2, 0, 0]} rotation={[0, 0, -0.24]}>
          <mesh position={[l3 / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow material={skin}>
            <capsuleGeometry args={[spec.r * 0.86, l3, 6, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function Mannequin({ onReady }: { onReady: (anchors: Record<string, Group | null>) => void }) {
  const anchorsRef = useRef<Record<string, Group | null>>({});
  const register = (name: string) => (g: Group | null) => {
    anchorsRef.current[name] = g;
  };

  useEffect(() => {
    onReady({ ...anchorsRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skin = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#E9E2D4", roughness: 0.52, metalness: 0.04 }),
    []
  );
  const velvet = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#161618", roughness: 0.95, metalness: 0.0 }),
    []
  );
  const pedestalMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#101013", roughness: 0.35, metalness: 0.7 }),
    []
  );

  // Necklace bust silhouette (radius, height) — lathe around Y
  const bustProfile = useMemo(() => {
    const pts: [number, number][] = [
      [0.001, 0], [0.3, 0.0], [0.4, 0.03], [0.405, 0.07], [0.31, 0.18],
      [0.245, 0.34], [0.18, 0.5], [0.148, 0.6], [0.138, 0.72], [0.152, 0.8],
      [0.132, 0.86], [0.06, 0.89], [0.001, 0.9],
    ];
    return pts.map(([x, y]) => new THREE.Vector2(x, y));
  }, []);

  return (
    <group>
      {/* ── Hand display form (fingers toward +X, palm up) ── */}
      <group position={[-0.15, 0, 0.15]} rotation={[0, -0.12, 0]}>
        {/* forearm: elbow (-X) → wrist (+X), tapered */}
        <mesh position={[-0.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow receiveShadow material={skin}>
          <cylinderGeometry args={[0.135, 0.185, 0.9, 32]} />
        </mesh>
        {/* palm */}
        <RoundedBox args={[0.42, 0.11, 0.3]} radius={0.05} smoothness={4} position={[0.08, 0, 0]} castShadow receiveShadow material={skin} />
        {/* wrist anchor */}
        <group name="wristAnchor" ref={register("wristAnchor")} position={[-0.28, 0, 0]} />
        {/* fingers */}
        {FINGER_SPECS.map((spec) => (
          <Finger key={spec.name} spec={spec} skin={skin} register={register} />
        ))}
        {/* thumb (angled toward -Z) */}
        <group position={[-0.02, 0, -0.155]} rotation={[0, 0.85, 0]}>
          <mesh position={[0.055, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow material={skin}>
            <capsuleGeometry args={[0.046, 0.11, 6, 16]} />
          </mesh>
          <group name="thumbAnchor" ref={register("thumbAnchor")} position={[0.06, 0, 0]} />
          <group position={[0.11, 0, 0]} rotation={[0, 0, -0.18]}>
            <mesh position={[0.045, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow material={skin}>
              <capsuleGeometry args={[0.04, 0.09, 6, 16]} />
            </mesh>
          </group>
        </group>
        {/* pedestal rod under the forearm */}
        <mesh position={[-1.1, -0.41, 0]} castShadow material={pedestalMat}>
          <cylinderGeometry args={[0.07, 0.12, 0.44, 24]} />
        </mesh>
      </group>

      {/* ── Necklace bust (black velvet, front faces +Z) ── */}
      <group position={[1.0, -0.1, -0.95]}>
        <mesh castShadow receiveShadow material={velvet}>
          <latheGeometry args={[bustProfile, 48]} />
        </mesh>
        {/* neck anchor — necklaces hang in this space */}
        <group name="neckAnchor" ref={register("neckAnchor")} position={[0, 0.66, 0]} />
      </group>
      {/* bust pedestal */}
      <mesh position={[1.0, -0.36, -0.95]} castShadow material={pedestalMat}>
        <cylinderGeometry args={[0.16, 0.2, 0.52, 32]} />
      </mesh>
    </group>
  );
}
