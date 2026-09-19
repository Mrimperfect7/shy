// Code-built display sculptures. No AI, external assets, or runtime meshing.
// Run: node scripts/generate-body-models.mjs
import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const smoothMin = (a, b, k) => {
  const h = clamp(.5 + .5 * (b - a) / k, 0, 1);
  return mix(b, a, h) - k * h * (1 - h);
};
const ellipsoid = (x, y, z, cx, cy, cz, rx, ry, rz) => {
  x -= cx; y -= cy; z -= cz;
  const k0 = Math.hypot(x / rx, y / ry, z / rz);
  const k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 > 1e-8 ? k0 * (k0 - 1) / k1 : -Math.min(rx, ry, rz);
};

// Palm/forearm cross sections: x, dorsal thickness, lateral width, centre y.
// Continuous, tapered wrist; broad metacarpals and a narrower heel of the palm.
const sections = [
  [-1.19, .002, .002, -.013], [-1.18, .096, .125, -.013],
  [-1.14, .121, .153, -.012], [-.88, .115, .148, -.008],
  [-.56, .103, .137, -.003], [-.32, .085, .128, 0],
  [-.20, .072, .139, 0], [-.04, .069, .183, -.005],
  [.13, .064, .199, -.009], [.24, .054, .179, -.014],
  [.30, .035, .143, -.019], [.335, .001, .001, -.025],
];
function sectionAt(x) {
  let i = 0;
  while (i < sections.length - 2 && x > sections[i + 1][0]) i++;
  const a = sections[i], b = sections[i + 1];
  const t = clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
  const s = t * t * (3 - 2 * t);
  return [mix(a[1], b[1], s), mix(a[2], b[2], s), mix(a[3], b[3], s)];
}

const fingers = [
  { name: 'indexFingerAnchor', start: [.245, -.004, -.150], length: .365, spread: -.023, radius: .0405, curl: .029 },
  { name: 'middleFingerAnchor', start: [.278, -.003, -.049], length: .403, spread: -.002, radius: .042, curl: .024 },
  { name: 'ringFingerAnchor', start: [.258, -.008, .054], length: .376, spread: .022, radius: .0395, curl: .039 },
  { name: 'littleFingerAnchor', start: [.214, -.020, .147], length: .291, spread: .045, radius: .034, curl: .043 },
  { name: 'thumbAnchor', start: [-.050, -.024, -.177], length: .260, spread: -.196, radius: .046, curl: .035 },
];
function fingerPoint(f, t) {
  return new THREE.Vector3(f.start[0] + f.length * t,
    f.start[1] - f.curl * t * t,
    f.start[2] + f.spread * t);
}
function fingerRadius(f, t) {
  // Low-relief knuckles, not separate spherical joints.
  return f.radius * (1 - .23 * t + .035 * Math.exp(-(((t - .46) / .10) ** 2)));
}
const segments = fingers.flatMap(f => Array.from({ length: 12 }, (_, i) => {
  const t = i / 12, u = (i + 1) / 12;
  const a = fingerPoint(f, t), b = fingerPoint(f, u);
  const v = b.clone().sub(a);
  return { a, v, len2: v.x * v.x + (v.y / .86) ** 2 + v.z * v.z,
    r0: fingerRadius(f, t), r1: fingerRadius(f, u) };
}));
function handField(x, y, z) {
  const xc = clamp(x, sections[0][0], sections.at(-1)[0]);
  const [ry, rz, cy] = sectionAt(xc);
  let d = (Math.hypot((y - cy) / ry, z / rz) - 1) * Math.min(ry, rz);
  d = Math.max(d, sections[0][0] - x, x - sections.at(-1)[0]);
  // Thenar pad joins the thumb to the palm; subtle underside muscle volume.
  d = smoothMin(d, ellipsoid(x, y, z, -.065, -.032, -.135, .157, .066, .104), .032);
  if (x > -.13) {
    let digits = 10;
    for (const s of segments) {
      const px = x - s.a.x, py = (y - s.a.y) / .86, pz = z - s.a.z;
      const t = clamp((px * s.v.x + py * s.v.y / .86 + pz * s.v.z) / s.len2, 0, 1);
      const r = mix(s.r0, s.r1, t);
      const distance = Math.hypot(px - t * s.v.x, py - t * s.v.y / .86, pz - t * s.v.z) - r;
      digits = Math.min(digits, distance);
    }
    d = smoothMin(d, digits, .023);
  }
  return d;
}

function sculptHand() {
  const n = 112, min = [-1.25, -.20, -.45], max = [.77, .19, .29];
  const mc = new MarchingCubes(n, new THREE.MeshStandardMaterial(), false, false, 180000);
  mc.isolation = 0;
  for (let z = 0; z < n; z++) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    // Positive inside, as required by MarchingCubes' outward normal convention.
    mc.field[x + n * y + n * n * z] = -handField(
      mix(min[0], max[0], x / n), mix(min[1], max[1], y / n), mix(min[2], max[2], z / n));
  }
  mc.update();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(mc.positionArray.slice(0, mc.count * 3), 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(mc.normalArray.slice(0, mc.count * 3), 3));
  geometry.scale(...min.map((v, i) => (max[i] - v) / 2));
  geometry.translate(...min.map((v, i) => (max[i] + v) / 2));
  geometry.normalizeNormals();
  const welded = mergeVertices(geometry, .00001);
  geometry.dispose(); mc.geometry.dispose(); mc.material.dispose();
  return welded;
}

// Anatomical bust: elliptical sections, sloping shoulders and shallow clavicles.
// Unlike a lathe, front/back depth is independent from shoulder width.
const bustSections = [
  [0, .32, .195], [.025, .365, .207], [.13, .405, .235],
  [.23, .463, .269], [.28, .485, .230], [.34, .501, .193], [.42, .480, .157],
  [.49, .350, .132], [.56, .225, .119], [.63, .163, .116],
  [.72, .126, .115], [.86, .128, .117], [.99, .139, .125],
  [1.005, .138, .124],
];
function bustAt(y) {
  let i = 0;
  while (i < bustSections.length - 2 && y > bustSections[i + 1][0]) i++;
  const a = bustSections[i], b = bustSections[i + 1];
  const t = clamp((y - a[0]) / (b[0] - a[0]), 0, 1);
  // Cubic Hermite interpolation for a flowing, continuous silhouette.
  return [1, 2].map(j => {
    const prev = bustSections[Math.max(0, i - 1)], next = bustSections[Math.min(bustSections.length - 1, i + 2)];
    const m0 = (b[j] - prev[j]) / (b[0] - prev[0]) * (b[0] - a[0]);
    const m1 = (next[j] - a[j]) / (next[0] - a[0]) * (b[0] - a[0]);
    return (2*t**3 - 3*t*t + 1)*a[j] + (t**3 - 2*t*t + t)*m0 + (-2*t**3 + 3*t*t)*b[j] + (t**3 - t*t)*m1;
  });
}
function sculptBust() {
  const positions = [], indices = [], rows = 112, sides = 96;
  for (let row = 0; row <= rows; row++) {
    const y = row / rows * 1.005, [width, depth] = bustAt(y);
    for (let col = 0; col <= sides; col++) {
      const angle = col / sides * Math.PI * 2;
      const x = width * Math.sin(angle);
      let z = depth * Math.cos(angle);
      const front = Math.max(0, Math.cos(angle)) ** 6;
      const collarHeight = .545 - .14 * (Math.abs(x) / .42) ** .7;
      z += front * (.009 * Math.exp(-(((y - collarHeight) / .020) ** 2))
        - .008 * Math.exp(-((x / .038) ** 2) - ((y - .55) / .025) ** 2));
      positions.push(x, y, z);
      if (row < rows && col < sides) {
        const a = row * (sides + 1) + col, b = a + sides + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  // Closed, flat display-form ends; no open tubes or hollow body parts.
  for (const row of [0, rows]) {
    const centre = positions.length / 3;
    positions.push(0, row / rows * 1.005, 0);
    for (let col = 0; col < sides; col++) {
      const a = row * (sides + 1) + col;
      if (row === 0) indices.push(centre, a + 1, a);
      else indices.push(centre, a, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const doc = new Document(), buffer = doc.createBuffer(), scene = doc.createScene('SHYNISH display sculptures');
const ivory = new THREE.Color('#D9CCB9');
const bodyMaterial = doc.createMaterial('Satin ivory ceramic').setBaseColorFactor([...ivory.toArray(), 1]).setMetallicFactor(0).setRoughnessFactor(.46);
const nailMaterial = doc.createMaterial('Ivory nail inlay').setBaseColorFactor([...new THREE.Color('#E8DECE').toArray(), 1]).setMetallicFactor(0).setRoughnessFactor(.31);
function addMesh(name, geo, parent, material = bodyMaterial) {
  const primitive = doc.createPrimitive().setMaterial(material);
  for (const [attr, semantic] of [['position', 'POSITION'], ['normal', 'NORMAL']]) {
    primitive.setAttribute(semantic, doc.createAccessor().setType('VEC3').setArray(new Float32Array(geo.getAttribute(attr).array)).setBuffer(buffer));
  }
  if (geo.index) primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(geo.index.array)).setBuffer(buffer));
  parent.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(primitive)));
  console.log(`${name}: ${(geo.index?.count ?? geo.getAttribute('position').count) / 3} triangles`);
}
const hand = doc.createNode('HandDisplay');
scene.addChild(hand);
addMesh('ContinuousHandSurface', sculptHand(), hand);
hand.addChild(doc.createNode('wristAnchor').setTranslation([-.32, 0, 0]));
for (const f of fingers) {
  const anchorT = f.name === 'thumbAnchor' ? .57 : .24;
  const point = fingerPoint(f, anchorT), tangent = fingerPoint(f, anchorT + .01).sub(point).normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
  hand.addChild(doc.createNode(f.name).setTranslation(point.toArray()).setRotation(rotation.toArray()));
  const nailPoint = fingerPoint(f, .88);
  nailPoint.y += fingerRadius(f, .88) * .86 - .001;
  const nail = new THREE.SphereGeometry(1, 32, 16);
  nail.scale(f.length * .100, .004, f.radius * .62);
  nail.applyQuaternion(rotation); nail.translate(...nailPoint.toArray());
  addMesh(`${f.name}-nail`, nail, hand, nailMaterial);
}
const neck = doc.createNode('NeckDisplay').setTranslation([0, -.49, 0]);
scene.addChild(neck);
addMesh('ShouldersAndNeckSurface', sculptBust(), neck);
// The tilt follows the front chest plane and keeps existing necklace assets clear.
neck.addChild(doc.createNode('neckAnchor').setTranslation([0, .72, .15])
  .setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(.30, 0, 0)).toArray()));
const outDir = fileURLToPath(new URL('../public/models/body/', import.meta.url));
mkdirSync(outDir, { recursive: true });
const binary = await new NodeIO().writeBinary(doc);
writeFileSync(`${outDir}atelier-mannequin-v1.glb`, Buffer.from(binary));
console.log(`Wrote atelier-mannequin-v1.glb (${(binary.length / 1024).toFixed(0)} KB)`);
