"use client";

import { Component, Suspense, useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import { useTryOnStore } from "./tryOnStore";

const BODY_ASSET = "/models/body/atelier-mannequin-v1.glb";
const ANCHOR_NAMES = ["wristAnchor", "thumbAnchor", "indexFingerAnchor", "middleFingerAnchor", "ringFingerAnchor", "littleFingerAnchor", "neckAnchor"];
type Props = { onReady: (anchors: Record<string, Group | null>) => void };

function BodySculptures({ onReady }: Props) {
  const { scene } = useGLTF(BODY_ASSET);
  const view = useTryOnStore((s) => s.cameraView);
  const model = useMemo(() => {
    const cloned = scene.clone(true);
    for (const name of [...ANCHOR_NAMES, "HandDisplay", "NeckDisplay"]) {
      if (!cloned.getObjectByName(name)) throw new Error(`Display model is missing ${name}`);
    }
    cloned.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);

  useEffect(() => {
    const anchors = Object.fromEntries(ANCHOR_NAMES.map((name) => [name, model.getObjectByName(name) as Group]));
    onReady(anchors);
  }, [model, onReady]);

  useEffect(() => {
    // Keep both anchor hierarchies mounted, but never display unrelated body parts.
    model.getObjectByName("HandDisplay")!.visible = view !== "neck";
    model.getObjectByName("NeckDisplay")!.visible = view === "neck";
  }, [model, view]);

  return <primitive object={model} dispose={null} />;
}

class BodyErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <Html center><p data-testid="body-model-error" className="w-64 text-center text-sm text-amber-100">The display model couldn’t load. Please reload to try again.</p></Html>;
    return this.props.children;
  }
}

export default function Mannequin({ onReady }: Props) {
  const view = useTryOnStore((s) => s.cameraView);
  return (
    <group name="atelier-mannequin">
      <BodyErrorBoundary>
        <Suspense fallback={<Html center><p data-testid="body-model-loading" className="w-56 text-center text-sm text-amber-100/70 animate-pulse">Loading display sculpture…</p></Html>}>
          <BodySculptures onReady={onReady} />
        </Suspense>
      </BodyErrorBoundary>
      {view === "neck" && (
        <mesh position={[0, -.525, 0]} scale={[1, 1, .66]} receiveShadow>
          <cylinderGeometry args={[.375, .39, .07, 64]} />
          <meshStandardMaterial color="#262320" metalness={.55} roughness={.4} />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload(BODY_ASSET);
