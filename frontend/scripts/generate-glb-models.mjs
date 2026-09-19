// Generates REAL per-product GLB assets for every tryOnEnabled catalog product.
// Mirrors the runtime procedural geometry so the GLB is the product's true 3D form,
// loaded via product.model3dUrl (/models/jewelry/<ID>.glb). No AI involved.
// Run: node scripts/generate-glb-models.mjs  (then: node scripts/seed-showroom.mjs)
import * as THREE from "three";
import { Document, NodeIO } from "@gltf-transform/core";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const catalogPath = join(here, "../lib/data/shynish-products.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const outDir = join(here, "../public/models/jewelry");
mkdirSync(outDir, { recursive: true });

const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function metalColor(plating, material) {
  const s = `${plating || ""} ${material || ""}`.toLowerCase();
  if (s.includes("rose")) return "#E8A382";
  if (s.includes("platinum") || s.includes("silver") || s.includes("white gold")) return "#E5E9EE";
  if (s.includes("black")) return "#2A2A2E";
  if (s.includes("champagne")) return "#E6C87E";
  return "#D4AF37";
}

function gemFor(p) {
  if (p.tryOnConfig?.gem) return p.tryOnConfig.gem;
  const t = p.title.toLowerCase();
  if (t.includes("ruby")) return "#9B111E";
  if (t.includes("emerald")) return "#046A38";
  if (t.includes("sapphire")) return "#0F52BA";
  if (t.includes("pearl")) return "#F2EAD9";
  if (t.includes("quartz")) return "#F4C2C2";
  if (t.includes("diamond") || t.includes("solitaire") || t.includes("halo")) return "#FFFFFF";
  return "#FFFFFF";
}

// ── mesh helper ─────────────────────────────────────────────────────────────
function M(geo, mat, { p, r, s } = {}) {
  const mesh = new THREE.Mesh(geo);
  mesh.userData.mat = mat;
  if (p) mesh.position.set(...p);
  if (r) mesh.rotation.set(...r);
  if (s) mesh.scale.set(...s);
  return mesh;
}

// ── builders (mirror components/customizer/ProceduralJewelry.tsx) ───────────
function buildBangle(variant, gem) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  inner.rotation.set(0, Math.PI / 2, 0);
  g.add(inner);
  const R = 0.19;
  if (variant === "flat") {
    inner.add(M(new THREE.CylinderGeometry(R, R, 0.06, 48, 1, true), "gold", { r: [Math.PI / 2, 0, 0] }));
    [-0.032, 0.032].forEach((z) => inner.add(M(new THREE.TorusGeometry(R, 0.008, 12, 48), "gold", { p: [0, 0, z] })));
    return g;
  }
  inner.add(M(new THREE.TorusGeometry(R, variant === "kada" ? 0.034 : 0.028, 24, 64), "gold"));
  if (variant === "kada") {
    inner.add(M(new THREE.OctahedronGeometry(0.032, 0), "gem", { p: [0.04, R + 0.02, 0], s: [1, 0.7, 1] }));
    inner.add(M(new THREE.OctahedronGeometry(0.032, 0), "gem", { p: [-0.04, R + 0.02, 0], s: [1, 0.7, 1] }));
  } else {
    const count = variant === "pave" ? 24 : 12;
    const r = variant === "pave" ? 0.011 : 0.02;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      inner.add(M(new THREE.OctahedronGeometry(r, 0), "gem", { p: [Math.cos(a) * (R + 0.026), Math.sin(a) * (R + 0.026), 0] }));
    }
  }
  return g;
}

function buildBracelet(variant, gem) {
  const g = new THREE.Group();
  const R = 0.185;
  if (variant === "chain") {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      g.add(M(new THREE.TorusGeometry(0.03, 0.0105, 10, 20), "gold", { p: [0, Math.cos(a) * R, Math.sin(a) * R], r: [a, i % 2 ? 0 : Math.PI / 2, 0] }));
    }
    g.add(M(new THREE.BoxGeometry(0.02, 0.045, 0.02), "gold", { p: [0, -R - 0.01, 0] }));
    return g;
  }
  if (variant === "pearl") {
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      g.add(M(new THREE.SphereGeometry(0.022, 24, 24), "pearl", { p: [0, Math.cos(a) * R, Math.sin(a) * R] }));
    }
    g.add(M(new THREE.SphereGeometry(0.024, 16, 16), "gold", { p: [0, -R - 0.02, 0] }));
    g.add(M(new THREE.OctahedronGeometry(0.014, 0), "gem", { p: [0, -R - 0.045, 0] }));
    return g;
  }
  // open cuff
  const arc = 4.6;
  const inner = new THREE.Group();
  inner.rotation.set(Math.PI - arc / 2 + Math.PI / 2, Math.PI / 2, 0);
  inner.add(M(new THREE.TorusGeometry(0.19, 0.02, 16, 64, arc), "gold"));
  [0, arc].forEach((t) => inner.add(M(new THREE.SphereGeometry(0.03, 16, 16), "gold", { p: [Math.cos(t) * 0.19, Math.sin(t) * 0.19, 0] })));
  g.add(inner);
  return g;
}

function buildRing(variant, gem) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  inner.rotation.set(0, Math.PI / 2, 0);
  g.add(inner);
  const R = 0.058;
  inner.add(M(new THREE.TorusGeometry(R, variant === "signet" ? 0.016 : 0.013, 20, 48), "gold"));
  if (variant === "solitaire") {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      inner.add(M(new THREE.CylinderGeometry(0.004, 0.006, 0.04, 8), "gold", { p: [Math.cos(a) * 0.024, R + 0.018, Math.sin(a) * 0.024] }));
    }
    inner.add(M(new THREE.OctahedronGeometry(0.034, 0), "gem", { p: [0, R + 0.032, 0] }));
  } else if (variant === "halo") {
    inner.add(M(new THREE.OctahedronGeometry(0.026, 0), "gem", { p: [0, R + 0.02, 0] }));
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      inner.add(M(new THREE.OctahedronGeometry(0.008, 0), "gem", { p: [Math.cos(a) * 0.042, R + 0.012, Math.sin(a) * 0.042] }));
    }
    inner.add(M(new THREE.TorusGeometry(0.042, 0.006, 12, 32), "gold", { p: [0, R + 0.006, 0], r: [Math.PI / 2, 0, 0] }));
  } else if (variant === "signet") {
    inner.add(M(new THREE.BoxGeometry(0.052, 0.02, 0.046), "gold", { p: [0, R + 0.008, 0] }));
    inner.add(M(new THREE.BoxGeometry(0.03, 0.012, 0.026), "gem", { p: [0, R + 0.02, 0] }));
  } else {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      inner.add(M(new THREE.OctahedronGeometry(0.007, 0), "gem", { p: [Math.cos(a) * (R + 0.011), Math.sin(a) * (R + 0.011), 0] }));
    }
  }
  return g;
}

function buildNecklace(variant, gem) {
  const g = new THREE.Group();
  const pts = [];
  const STEPS = 48, SPREAD = 2.2;
  for (let i = 0; i <= STEPS; i++) {
    const th = -SPREAD + (i / STEPS) * SPREAD * 2;
    const f = 1 - Math.abs(th) / SPREAD;
    pts.push(new THREE.Vector3(
      Math.sin(th) * (0.15 + 0.16 * f),
      -0.42 * Math.pow(Math.cos((th / SPREAD) * (Math.PI / 2)), 1.3),
      Math.cos(th) * (0.15 + 0.16 * f)
    ));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  g.add(M(new THREE.TubeGeometry(curve, 72, variant === "chain" ? 0.016 : 0.01, 8), "gold"));
  const front = new THREE.Vector3(0, -0.42, 0.31);
  if (variant === "pearl-drop") {
    g.add(M(new THREE.SphereGeometry(0.036, 24, 24), "pearl", { p: [front.x, front.y - 0.055, front.z] }));
    g.add(M(new THREE.CylinderGeometry(0.006, 0.014, 0.025, 12), "gold", { p: [front.x, front.y - 0.012, front.z] }));
    [-0.09, -0.045, 0.045, 0.09].forEach((dx) => {
      g.add(M(new THREE.SphereGeometry(0.016, 20, 20), "pearl", { p: [dx, front.y + 0.045 - Math.abs(dx) * 0.9, front.z - Math.abs(dx) * 0.35] }));
    });
  } else if (variant === "lariat") {
    const drop = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, front.y, front.z),
      new THREE.Vector3(0.008, front.y - 0.08, front.z - 0.01),
      new THREE.Vector3(0, front.y - 0.15, front.z - 0.02),
    ]);
    g.add(M(new THREE.TubeGeometry(drop, 16, 0.007, 8), "gold"));
    g.add(M(new THREE.TorusGeometry(0.03, 0.008, 12, 32, Math.PI * 1.35), "gold", { p: [0, front.y + 0.01, front.z], r: [0, 0, Math.PI * 0.75] }));
    g.add(M(new THREE.OctahedronGeometry(0.014, 0), "gem", { p: [0, front.y - 0.16, front.z - 0.02] }));
  } else {
    // gem-drop (default) + plain "chain" keeps just the chain
    if (variant !== "chain") {
      g.add(M(new THREE.ConeGeometry(0.014, 0.024, 16), "gold", { p: [front.x, front.y - 0.015, front.z], r: [Math.PI, 0, 0] }));
      g.add(M(new THREE.OctahedronGeometry(0.032, 0), "gem", { p: [front.x, front.y - 0.062, front.z], s: [1, 1.45, 1] }));
    }
  }
  return g;
}

// ── export group → GLB ──────────────────────────────────────────────────────
async function exportGLB(group, product) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene(product.id);
  const metal = metalColor(product.plating, product.material);
  const gem = gemFor(product);

  const goldMat = doc.createMaterial("metal").setBaseColorFactor([...hex(metal), 1]).setMetallicFactor(1).setRoughnessFactor(0.16);
  const gemRgb = hex(gem);
  const gemMat = doc.createMaterial("gem").setBaseColorFactor([...gemRgb, 1]).setMetallicFactor(0.35).setRoughnessFactor(0.08).setEmissiveFactor(gemRgb.map((v) => v * 0.25));
  const pearlMat = doc.createMaterial("pearl").setBaseColorFactor([...hex("#F2EAD9"), 1]).setMetallicFactor(0.1).setRoughnessFactor(0.22);
  const mats = { gold: goldMat, gem: gemMat, pearl: pearlMat };

  group.updateWorldMatrix(true, true);
  group.traverse((obj) => {
    if (!obj.isMesh) return;
    const geo = obj.geometry.clone().applyMatrix4(obj.matrixWorld);
    if (!geo.getAttribute("normal")) geo.computeVertexNormals();
    const pos = geo.getAttribute("normal") && geo.getAttribute("position");
    const position = geo.getAttribute("position");
    const normal = geo.getAttribute("normal");
    const prim = doc.createPrimitive()
      .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(new Float32Array(position.array)).setBuffer(buffer))
      .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(new Float32Array(normal.array)).setBuffer(buffer))
      .setMaterial(mats[obj.userData.mat] || goldMat);
    if (geo.index) prim.setIndices(doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(geo.index.array)).setBuffer(buffer));
    scene.addChild(doc.createNode("part").setMesh(doc.createMesh().addPrimitive(prim)));
  });

  return new NodeIO().writeBinary(doc);
}

// ── main ────────────────────────────────────────────────────────────────────
const builders = { bangle: buildBangle, bracelet: buildBracelet, ring: buildRing, necklace: buildNecklace };
let generated = 0;

for (const p of catalog) {
  if (!p.tryOnEnabled) continue;
  const catSlug = (p.category?.slug || "").toLowerCase();
  const title = p.title.toLowerCase();
  let cat = null;
  if (/\b(kada|bangle|bangles)\b/.test(title) || catSlug.includes("bangle")) cat = "bangle";
  else if (/\b(bracelet|bracelets|cuff)\b/.test(title) || catSlug.includes("bracelet")) cat = "bracelet";
  else if (/\b(ring|rings|band)\b/.test(title) || catSlug.includes("ring")) cat = "ring";
  else if (/(necklace|pendant|lariat|chain)/.test(title) || /(necklace|chain|pendant)/.test(catSlug)) cat = "necklace";
  if (!cat || !builders[cat]) continue;

  const variant = p.tryOnConfig?.variant || "default";
  const gem = gemFor(p);
  const group = builders[cat](variant, gem);
  const glb = await exportGLB(group, p);
  const file = `/models/jewelry/${p.id}.glb`;
  writeFileSync(join(outDir, `${p.id}.glb`), Buffer.from(glb));
  p.model3dUrl = file;
  generated++;
  console.log(`✓ ${p.id} ${p.title} → ${file} (${(glb.length / 1024).toFixed(1)} KB)`);
}

writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(`\nGenerated ${generated} GLB models; catalog JSON updated with model3dUrl paths.`);
console.log("Run `node scripts/seed-showroom.mjs` to sync the database.");
