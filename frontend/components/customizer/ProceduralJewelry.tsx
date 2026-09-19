"use client";

import { Suspense, Component, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { PlacedItem } from "./tryOnStore";

// ─── Exact-product jewelry models ────────────────────────────────────────────
// model3dUrl present → load that exact GLB. Otherwise a clearly-marked
// procedural preview is generated deterministically from the product record
// (id → variant, plating → metal, title → gem). Never substitutes another product.

function GoldMaterial({ color, roughness = 0.15 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={0.95} roughness={roughness} envMapIntensity={1.5} />;
}

function Gem({ color, radius, position, scale }: { color: string; radius: number; position: [number, number, number]; scale?: [number, number, number]; physical?: boolean }) {
  return (
    <mesh position={position} scale={scale || [1, 1, 1]} castShadow>
      <octahedronGeometry args={[radius, 0]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.06} emissive={color} emissiveIntensity={0.22} envMapIntensity={2.4} />
    </mesh>
  );
}

function Pearl({ radius, position }: { radius: number; position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshPhysicalMaterial color="#F2EAD9" metalness={0.1} roughness={0.22} clearcoat={1} clearcoatRoughness={0.3} envMapIntensity={1.2} />
    </mesh>
  );
}

// ── Bangle: closed band, wraps the wrist (axis X) ────────────────────────────
function BangleModel({ item }: { item: PlacedItem }) {
  const R = 0.19;
  const variant = item.variant || "gems";
  const gem = item.gem || "#FFFFFF";

  if (variant === "flat") {
    return (
      <group rotation={[0, Math.PI / 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[R, R, 0.06, 48, 1, true]} />
          <GoldMaterial color={item.metal} />
        </mesh>
        {[-0.032, 0.032].map((z) => (
          <mesh key={z} position={[0, 0, z]} castShadow>
            <torusGeometry args={[R, 0.008, 12, 48]} />
            <GoldMaterial color={item.metal} roughness={0.1} />
          </mesh>
        ))}
      </group>
    );
  }

  const studCount = variant === "pave" ? 24 : 12;
  const studR = variant === "pave" ? 0.011 : 0.02;
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <torusGeometry args={[R, variant === "kada" ? 0.034 : 0.028, 24, 64]} />
        <GoldMaterial color={item.metal} />
      </mesh>
      {variant === "kada" ? (
        <>
          <Gem color={gem} radius={0.032} position={[0.04, R + 0.02, 0]} scale={[1, 0.7, 1]} />
          <Gem color={gem} radius={0.032} position={[-0.04, R + 0.02, 0]} scale={[1, 0.7, 1]} />
        </>
      ) : (
        Array.from({ length: studCount }).map((_, i) => {
          const a = (i / studCount) * Math.PI * 2;
          return (
            <Gem
              key={i}
              color={gem}
              radius={studR}
              physical
              position={[Math.cos(a) * (R + 0.026), Math.sin(a) * (R + 0.026), 0]}
            />
          );
        })
      )}
    </group>
  );
}

// ── Bracelet: open cuff / chain / pearls — visibly distinct from a bangle ────
function BraceletModel({ item }: { item: PlacedItem }) {
  const R = 0.185;
  const variant = item.variant || "cuff";

  if (variant === "chain") {
    return (
      <group>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[0, Math.cos(a) * R, Math.sin(a) * R]}
              rotation={[a, i % 2 ? 0 : Math.PI / 2, 0]}
              castShadow
            >
              <torusGeometry args={[0.03, 0.0105, 10, 20]} />
              <GoldMaterial color={item.metal} />
            </mesh>
          );
        })}
        {/* clasp */}
        <mesh position={[0, -R - 0.01, 0]} castShadow>
          <boxGeometry args={[0.02, 0.045, 0.02]} />
          <GoldMaterial color={item.metal} roughness={0.25} />
        </mesh>
      </group>
    );
  }

  if (variant === "pearl") {
    return (
      <group>
        {Array.from({ length: 20 }).map((_, i) => {
          const a = (i / 20) * Math.PI * 2;
          return <Pearl key={i} radius={0.022} position={[0, Math.cos(a) * R, Math.sin(a) * R]} />;
        })}
        <mesh position={[0, -R - 0.02, 0]} castShadow>
          <sphereGeometry args={[0.024, 16, 16]} />
          <GoldMaterial color={item.metal} />
        </mesh>
        <Gem color="#FFFFFF" radius={0.014} position={[0, -R - 0.045, 0]} physical />
      </group>
    );
  }

  // open cuff
  const arc = 4.6;
  return (
    <group rotation={[Math.PI - arc / 2 + Math.PI / 2, Math.PI / 2, 0]}>
      <mesh castShadow>
        <torusGeometry args={[0.19, 0.02, 16, 64, arc]} />
        <GoldMaterial color={item.metal} roughness={0.32} />
      </mesh>
      {[0, arc].map((t) => (
        <mesh key={t} position={[Math.cos(t) * 0.19, Math.sin(t) * 0.19, 0]} castShadow>
          <sphereGeometry args={[0.03, 16, 16]} />
          <GoldMaterial color={item.metal} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ── Ring: band + setting + gem, gem faces up (+Y), band axis X ──────────────
function RingModel({ item }: { item: PlacedItem }) {
  const R = 0.058;
  const variant = item.variant || "solitaire";
  const gem = item.gem || "#FFFFFF";

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <torusGeometry args={[R, variant === "signet" ? 0.016 : 0.013, 20, 48]} />
        <GoldMaterial color={item.metal} />
      </mesh>

      {variant === "solitaire" && (
        <>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.024, R + 0.018, Math.sin(a) * 0.024]} castShadow>
                <cylinderGeometry args={[0.004, 0.006, 0.04, 8]} />
                <GoldMaterial color={item.metal} />
              </mesh>
            );
          })}
          <Gem color={gem} radius={0.034} position={[0, R + 0.032, 0]} physical />
        </>
      )}

      {variant === "halo" && (
        <>
          <Gem color={gem} radius={0.026} position={[0, R + 0.02, 0]} physical />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <Gem key={i} color={gem} radius={0.008} physical position={[Math.cos(a) * 0.042, R + 0.012, Math.sin(a) * 0.042]} />
            );
          })}
          <mesh position={[0, R + 0.006, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.042, 0.006, 12, 32]} />
            <GoldMaterial color={item.metal} />
          </mesh>
        </>
      )}

      {variant === "signet" && (
        <>
          <mesh position={[0, R + 0.008, 0]} castShadow>
            <boxGeometry args={[0.052, 0.02, 0.046]} />
            <GoldMaterial color={item.metal} />
          </mesh>
          <mesh position={[0, R + 0.02, 0]} castShadow>
            <boxGeometry args={[0.03, 0.012, 0.026]} />
            <meshStandardMaterial color={gem} metalness={0.3} roughness={0.06} emissive={gem} emissiveIntensity={0.15} envMapIntensity={1.8} />
          </mesh>
        </>
      )}

      {variant === "band" &&
        Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <Gem key={i} color={gem} radius={0.007} physical position={[Math.cos(a) * (R + 0.011), Math.sin(a) * (R + 0.011), 0]} />
          );
        })}
    </group>
  );
}

// ── Necklace: catenary chain around the neck + pendant (front = +Z) ──────────
function NecklaceModel({ item }: { item: PlacedItem }) {
  const variant = item.variant || "gem-drop";
  const gem = item.gem || "#FFFFFF";

  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const STEPS = 48;
    const SPREAD = 2.2; // wraps sides of the neck, open at back
    for (let i = 0; i <= STEPS; i++) {
      const th = -SPREAD + (i / STEPS) * SPREAD * 2;
      const f = 1 - Math.abs(th) / SPREAD; // 1 at front, 0 at ends
      const x = Math.sin(th) * (0.15 + 0.16 * f);
      const z = Math.cos(th) * (0.15 + 0.16 * f); // drapes over the chest at front
      const y = -0.42 * Math.pow(Math.cos((th / SPREAD) * (Math.PI / 2)), 1.3);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const tube = useMemo(() => new THREE.TubeGeometry(curve, 72, variant === "chain" ? 0.016 : 0.01, 8), [curve, variant]);
  const front = useMemo(() => new THREE.Vector3(0, -0.42, 0.31), []);

  return (
    <group name="necklaceGroup">
      <mesh geometry={tube} castShadow>
        <GoldMaterial color={item.metal} roughness={variant === "chain" ? 0.08 : 0.16} />
      </mesh>

      {variant === "pearl-drop" && (
        <>
          <Pearl radius={0.036} position={[front.x, front.y - 0.055, front.z]} />
          <mesh position={[front.x, front.y - 0.012, front.z]} castShadow>
            <cylinderGeometry args={[0.006, 0.014, 0.025, 12]} />
            <GoldMaterial color={item.metal} />
          </mesh>
          {/* graduated pearls along the chain front */}
          {[-0.09, -0.045, 0.045, 0.09].map((dx) => (
            <Pearl key={dx} radius={0.016} position={[dx, front.y + 0.045 - Math.abs(dx) * 0.9, front.z - Math.abs(dx) * 0.35]} />
          ))}
        </>
      )}

      {variant === "gem-drop" && (
        <>
          <mesh position={[front.x, front.y - 0.015, front.z]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.014, 0.024, 16]} />
            <GoldMaterial color={item.metal} />
          </mesh>
          <Gem color={gem} radius={0.032} position={[front.x, front.y - 0.062, front.z]} scale={[1, 1.45, 1]} physical={gem.toLowerCase() === "#ffffff"} />
        </>
      )}

      {variant === "lariat" && (
        <>
          {(() => {
            const drop = new THREE.CatmullRomCurve3([
              new THREE.Vector3(0, front.y, front.z),
              new THREE.Vector3(0.008, front.y - 0.08, front.z - 0.01),
              new THREE.Vector3(0, front.y - 0.15, front.z - 0.02),
            ]);
            return (
              <mesh geometry={new THREE.TubeGeometry(drop, 16, 0.007, 8)} castShadow>
                <GoldMaterial color={item.metal} />
              </mesh>
            );
          })()}
          <mesh position={[0, front.y + 0.01, front.z]} rotation={[0, 0, Math.PI * 0.75]} castShadow>
            <torusGeometry args={[0.03, 0.008, 12, 32, Math.PI * 1.35]} />
            <GoldMaterial color={item.metal} />
          </mesh>
          <Gem color={gem} radius={0.014} position={[0, front.y - 0.16, front.z - 0.02]} physical />
        </>
      )}
    </group>
  );
}

// ── Exact GLB loader (used when product.model3dUrl exists) ──────────────────
class GLBErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={cloned} />;
}

export default function ProductJewelryModel({ item, onLoadFailed }: { item: PlacedItem; onLoadFailed: () => void }) {
  if (item.model3dUrl) {
    return (
      <GLBErrorBoundary onError={onLoadFailed}>
        <Suspense fallback={null}>
          <GLBModel url={item.model3dUrl} />
        </Suspense>
      </GLBErrorBoundary>
    );
  }
  switch (item.category) {
    case "bangle":
      return <BangleModel item={item} />;
    case "bracelet":
      return <BraceletModel item={item} />;
    case "ring":
      return <RingModel item={item} />;
    case "necklace":
      return <NecklaceModel item={item} />;
    default:
      return null;
  }
}
