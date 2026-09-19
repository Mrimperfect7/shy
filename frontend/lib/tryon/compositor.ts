import sharp, { OverlayOptions } from "sharp";
import { JewelryCategory, TryOnRequest } from "./types";
import { getCharacterById } from "./characters";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface LightingConfig {
  brightness: number;
  saturation: number;
  tintR?: number;
  tintG?: number;
  tintB?: number;
}

interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  opacity: number;
  colorR: number;
  colorG: number;
  colorB: number;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  isVisible?: boolean;
}

export interface DetectedLandmarks {
  leftEar?: LandmarkPoint;
  rightEar?: LandmarkPoint;
  neck?: LandmarkPoint;
  chest?: LandmarkPoint;
  finger?: LandmarkPoint;
  wrist?: LandmarkPoint;
  nose?: LandmarkPoint;
  lighting?: LightingConfig;
  shadow?: ShadowConfig;
}

// ─── JEWELRY ISOLATION ────────────────────────────────────────────────────────

/**
 * Intelligent Jewellery Background Isolation & Alpha Segmentation.
 * Removes background artifacts and ensures a clean transparent jewellery cutout.
 */
export async function isolateJewelryAsset(jewelryBuffer: Buffer): Promise<Buffer> {
  const image = sharp(jewelryBuffer);
  const metadata = await image.metadata();

  // If already has proper transparency, just trim and return
  if (metadata.hasAlpha) {
    try {
      return await image
        .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    } catch {
      return await image.png().toBuffer();
    }
  }

  // Sample corner pixels to estimate background colour
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const totalPixels = info.width * info.height;

  const corners = [
    0,                            // top-left
    (info.width - 1) * 4,        // top-right
    (totalPixels - info.width) * 4, // bottom-left
    (totalPixels - 1) * 4,       // bottom-right
  ];
  let bgR = 0, bgG = 0, bgB = 0;
  for (const c of corners) {
    bgR += data[c];
    bgG += data[c + 1];
    bgB += data[c + 2];
  }
  bgR = Math.round(bgR / corners.length);
  bgG = Math.round(bgG / corners.length);
  bgB = Math.round(bgB / corners.length);

  // Soft alpha feathering based on colour distance from background
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const diff = Math.sqrt(
      Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
    );

    if (diff < 55) {
      data[i + 3] = 0; // Fully transparent
    } else if (diff < 90) {
      const alpha = Math.round(((diff - 55) / 35) * 255);
      data[i + 3] = Math.min(255, Math.max(0, alpha));
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

// ─── CONTACT SHADOW SYNTHESIS ─────────────────────────────────────────────────

/**
 * Synthesizes a soft ambient contact shadow for realistic photorealistic lighting.
 * Simulates the jewellery casting a shadow on the skin beneath.
 */
async function generateContactShadow(
  isolatedJewelry: Buffer,
  width: number,
  height: number,
  config?: ShadowConfig
): Promise<Buffer> {
  const blurRadius = config?.blur ?? 6;
  const shadowOpacity = config?.opacity ?? 0.35;
  const rCol = config?.colorR ?? 15;
  const gCol = config?.colorG ?? 12;
  const bCol = config?.colorB ?? 10;

  const { data, info } = await sharp(isolatedJewelry)
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a > 80) {
      data[i] = rCol;
      data[i + 1] = gCol;
      data[i + 2] = bCol;
      data[i + 3] = Math.round(a * shadowOpacity);
    } else {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .blur(blurRadius)
    .png()
    .toBuffer();
}

// ─── AMBIENT OCCLUSION (3D DEPTH SIMULATION) ──────────────────────────────────

/**
 * Applies a dynamic 3D depth mask (Ambient Occlusion) to the 2D jewelry.
 * This darkens the edges of the jewelry to simulate a 3D curve wrapping around the body.
 */
async function applyAmbientOcclusion(jewelryBuffer: Buffer, width: number, height: number, category: JewelryCategory): Promise<Buffer> {
  let svgGradient = '';
  
  if (category === "necklaces" || category === "chains" || category === "sets") {
    // Darken left and right edges to simulate cylindrical wrap around the neck
    svgGradient = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="ao" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(0,0,0,0.6)"/>
            <stop offset="25%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="75%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.6)"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#ao)"/>
      </svg>
    `;
  } else if (category === "rings" || category === "bracelets") {
    // Wrap around finger/wrist: darken left/right edges heavily
    svgGradient = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="ao" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(0,0,0,0.85)"/>
            <stop offset="20%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="80%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.85)"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#ao)"/>
      </svg>
    `;
  } else if (category === "earrings" || category === "pendants") {
    // Radial shadow (sphere-like) falling off at the very edges to give it a 3D pop
    svgGradient = `
      <svg width="${width}" height="${height}">
        <defs>
          <radialGradient id="ao" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.4)"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#ao)"/>
      </svg>
    `;
  } else {
    // Default light radial AO
    svgGradient = `
      <svg width="${width}" height="${height}">
        <defs>
          <radialGradient id="ao" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.3)"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#ao)"/>
      </svg>
    `;
  }

  const aoBuffer = Buffer.from(svgGradient);

  // 'atop' blend places the black gradient over the jewelry but preserves the jewelry's exact alpha mask!
  return await sharp(jewelryBuffer)
    .composite([{ input: aoBuffer, blend: 'atop' }])
    .png()
    .toBuffer();
}

// ─── COMPOSITOR ───────────────────────────────────────────────────────────────

/**
 * Production Computer Vision Compositor
 *
 * Places jewellery with exact fidelity, realistic shadows, correct scale,
 * and proper perspective. Supports Gemini-detected landmarks for precision placement.
 *
 * @param baseImageBuffer - The model or customer photo
 * @param rawJewelryBuffer - The actual product image (never a generic substitute)
 * @param req - Try-on request with category and mode
 * @param detectedLandmarks - Optional: AI-detected precise landmark coordinates from Gemini Vision
 */
export async function compositeVirtualTryOn(
  baseImageBuffer: Buffer,
  rawJewelryBuffer: Buffer,
  req: TryOnRequest,
  detectedLandmarks?: DetectedLandmarks
): Promise<Buffer> {
  const baseImage = sharp(baseImageBuffer);
  const baseMeta = await baseImage.metadata();
  const baseWidth = baseMeta.width || 800;
  const baseHeight = baseMeta.height || 1000;

  // 1. Isolate the jewellery asset cleanly (remove background, apply alpha)
  let isolatedJewelry = await isolateJewelryAsset(rawJewelryBuffer);

  // 1.5 Add Simulated 3D Depth (Ambient Occlusion)
  const meta = await sharp(isolatedJewelry).metadata();
  isolatedJewelry = await applyAmbientOcclusion(isolatedJewelry, meta.width || 800, meta.height || 800, req.category);

  // 2. Apply AI Lighting Matching
  if (detectedLandmarks?.lighting) {
    const l = detectedLandmarks.lighting;
    let s = sharp(isolatedJewelry).modulate({
      brightness: l.brightness || 1,
      saturation: l.saturation || 1,
    });
    
    if (l.tintR !== undefined && l.tintG !== undefined && l.tintB !== undefined) {
      s = s.tint({ r: l.tintR, g: l.tintG, b: l.tintB });
    }
    
    isolatedJewelry = await s.png().toBuffer();
  }

  // 3. Determine landmark anchors
  // Priority: Gemini-detected > Character presets > Sensible defaults
  let leftEar: LandmarkPoint | null = null;
  let rightEar: LandmarkPoint | null = null;
  let neck: LandmarkPoint = { x: 0.50, y: 0.76, scale: 0.44, rotation: 0 };
  let chest: LandmarkPoint = { x: 0.50, y: 0.86, scale: 0.46, rotation: 0 };
  let finger: LandmarkPoint = { x: 0.52, y: 0.64, scale: 0.14, rotation: -10 };
  let wrist: LandmarkPoint = { x: 0.50, y: 0.82, scale: 0.32, rotation: 6 };
  let nose: LandmarkPoint = { x: 0.52, y: 0.56, scale: 0.025, rotation: 0 };

  if (req.mode === "character" && req.characterId) {
    // Use character preset landmarks (precise, hand-tuned per model)
    const character = getCharacterById(req.characterId);
    if (character?.landmarks) {
      if (character.landmarks.leftEar) leftEar = { ...character.landmarks.leftEar, isVisible: true };
      if (character.landmarks.rightEar) rightEar = { ...character.landmarks.rightEar, isVisible: true };
      if (character.landmarks.neck) neck = { ...character.landmarks.neck };
      if (character.landmarks.chest) chest = { ...character.landmarks.chest };
      if (character.landmarks.finger) finger = { ...character.landmarks.finger };
      if (character.landmarks.wrist) wrist = { ...character.landmarks.wrist };
      if (character.landmarks.nose) nose = { ...character.landmarks.nose };
    }
  } else if (detectedLandmarks) {
    // Use Gemini Vision AI-detected landmarks (precision placement on customer photo)
    if (detectedLandmarks.leftEar?.isVisible) {
      leftEar = {
        x: detectedLandmarks.leftEar.x,
        y: detectedLandmarks.leftEar.y,
        scale: Math.max(0.06, Math.min(0.14, detectedLandmarks.leftEar.scale || 0.085)),
        rotation: -3,
        isVisible: true,
      };
    }
    if (detectedLandmarks.rightEar?.isVisible) {
      rightEar = {
        x: detectedLandmarks.rightEar.x,
        y: detectedLandmarks.rightEar.y,
        scale: Math.max(0.06, Math.min(0.14, detectedLandmarks.rightEar.scale || 0.085)),
        rotation: 3,
        isVisible: true,
      };
    }
    if (detectedLandmarks.neck?.isVisible !== false && detectedLandmarks.neck?.x) {
      neck = {
        x: detectedLandmarks.neck.x,
        y: detectedLandmarks.neck.y,
        scale: Math.max(0.28, Math.min(0.55, detectedLandmarks.neck.scale || 0.42)),
        rotation: 0,
      };
    }
    if (detectedLandmarks.chest?.x) {
      chest = {
        x: detectedLandmarks.chest.x,
        y: detectedLandmarks.chest.y,
        scale: Math.max(0.30, Math.min(0.60, detectedLandmarks.chest.scale || 0.46)),
        rotation: 0,
      };
    }
    if (detectedLandmarks.finger?.isVisible) {
      finger = {
        x: detectedLandmarks.finger.x,
        y: detectedLandmarks.finger.y,
        scale: Math.max(0.08, Math.min(0.20, detectedLandmarks.finger.scale || 0.12)),
        rotation: detectedLandmarks.finger.rotation ?? -10,
        isVisible: true,
      };
    }
    if (detectedLandmarks.wrist?.isVisible) {
      wrist = {
        x: detectedLandmarks.wrist.x,
        y: detectedLandmarks.wrist.y,
        scale: Math.max(0.18, Math.min(0.40, detectedLandmarks.wrist.scale || 0.28)),
        rotation: detectedLandmarks.wrist.rotation ?? 6,
        isVisible: true,
      };
    }
    if (detectedLandmarks.nose?.isVisible) {
      nose = {
        x: detectedLandmarks.nose.x,
        y: detectedLandmarks.nose.y,
        scale: Math.max(0.015, Math.min(0.045, detectedLandmarks.nose.scale || 0.025)),
        rotation: 0,
        isVisible: true,
      };
    }
  } else {
    // Sensible defaults for self-photo without AI landmark detection
    leftEar  = { x: 0.28, y: 0.52, scale: 0.085, rotation: -3, isVisible: true };
    rightEar = { x: 0.72, y: 0.52, scale: 0.085, rotation:  3, isVisible: true };
    neck     = { x: 0.50, y: 0.76, scale: 0.42, rotation: 0 };
    finger   = { x: 0.50, y: 0.65, scale: 0.12, rotation: 0 };
    wrist    = { x: 0.50, y: 0.80, scale: 0.28, rotation: 0 };
  }

  // 3. Apply interactive user adjustments (from Fine-Tune panel)
  if (req.adjustment) {
    const adj = req.adjustment;
    if (adj.earVisibility === "left_only") rightEar = null;
    if (adj.earVisibility === "right_only") leftEar = null;

    const scaleMul = adj.scaleMultiplier || 1.0;
    const rotDelta = adj.rotationDelta || 0;
    const offX = adj.offsetX || 0;
    const offY = adj.offsetY || 0;

    const applyAdj = (pt: LandmarkPoint | null): LandmarkPoint | null => {
      if (!pt) return null;
      return {
        ...pt,
        x: pt.x + offX,
        y: pt.y + offY,
        scale: pt.scale * scaleMul,
        rotation: (pt.rotation || 0) + rotDelta,
      };
    };

    leftEar  = applyAdj(leftEar);
    rightEar = applyAdj(rightEar);
    neck     = applyAdj(neck)!;
    chest    = applyAdj(chest)!;
    finger   = applyAdj(finger)!;
    wrist    = applyAdj(wrist)!;
  }

  const composites: OverlayOptions[] = [];
  const cat = req.category;

  // ─── PLACEMENT STRATEGY BY JEWELLERY CATEGORY ────────────────────────────

  if (cat === "earrings") {
    // ─── EARRINGS ──────────────────────────────────────────────────────────
    const placeEarring = async (
      ear: LandmarkPoint,
      flip: boolean
    ): Promise<void> => {
      if (!ear.isVisible && ear.isVisible !== undefined) return;

      const earWidth = Math.round(baseWidth * ear.scale);
      if (earWidth < 4) return;

      let earJewelry = sharp(isolatedJewelry).resize(earWidth);
      if (flip) earJewelry = earJewelry.flop(); // Mirror for opposing ear
      const rotated = await earJewelry
        .rotate(ear.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const rotMeta = await sharp(rotated).metadata();
      const earHeight = rotMeta.height || earWidth;

      const left = Math.max(0, Math.round(baseWidth * ear.x - earWidth / 2));
      const top  = Math.max(0, Math.round(baseHeight * ear.y - earHeight / 4));

      const shadow = await generateContactShadow(rotated, earWidth, earHeight, detectedLandmarks?.shadow || { blur: 4, opacity: 0.40 } as any);
      const shOffX = detectedLandmarks?.shadow?.offsetX ?? 3;
      const shOffY = detectedLandmarks?.shadow?.offsetY ?? 5;
      composites.push({ input: shadow, blend: 'multiply', left: Math.min(left + shOffX, baseWidth - 1), top: Math.min(top + shOffY, baseHeight - 1) });
      composites.push({ input: rotated, left, top });
    };

    if (leftEar)  await placeEarring(leftEar,  false);
    if (rightEar) await placeEarring(rightEar, true);

  } else if (cat === "necklaces" || cat === "chains") {
    // ─── NECKLACES / CHAINS ───────────────────────────────────────────────
    const neckWidth = Math.round(baseWidth * neck.scale);
    if (neckWidth > 4) {
      const neckJewelry = await sharp(isolatedJewelry)
        .resize(neckWidth)
        .rotate(neck.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const neckMeta = await sharp(neckJewelry).metadata();
      const neckHeight = neckMeta.height || neckWidth;

      const left = Math.max(0, Math.round(baseWidth * neck.x - neckWidth / 2));
      const top  = Math.max(0, Math.round(baseHeight * neck.y - neckHeight / 3));

      const shadow = await generateContactShadow(neckJewelry, neckWidth, neckHeight, detectedLandmarks?.shadow || { blur: 8, opacity: 0.42 } as any);
      const shOffX = detectedLandmarks?.shadow?.offsetX ?? 4;
      const shOffY = detectedLandmarks?.shadow?.offsetY ?? 8;
      composites.push({ input: shadow, blend: 'multiply', left: Math.min(left + shOffX, baseWidth - 1), top: Math.min(top + shOffY, baseHeight - 1) });
      composites.push({ input: neckJewelry, left, top });
    }

  } else if (cat === "pendants") {
    // ─── PENDANTS ─────────────────────────────────────────────────────────
    // Use chest position (lower than neck) to show pendant drop
    const pendantAnchor = chest.x ? chest : neck;
    const pendantWidth = Math.round(baseWidth * pendantAnchor.scale);
    if (pendantWidth > 4) {
      const pendantJewelry = await sharp(isolatedJewelry)
        .resize(pendantWidth)
        .rotate(pendantAnchor.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const pendantMeta = await sharp(pendantJewelry).metadata();
      const pendantHeight = pendantMeta.height || pendantWidth;

      const left = Math.max(0, Math.round(baseWidth * pendantAnchor.x - pendantWidth / 2));
      const top  = Math.max(0, Math.round(baseHeight * pendantAnchor.y - pendantHeight / 2));

      const shadow = await generateContactShadow(pendantJewelry, pendantWidth, pendantHeight, detectedLandmarks?.shadow || { blur: 7, opacity: 0.40 } as any);
      const shOffX = detectedLandmarks?.shadow?.offsetX ?? 3;
      const shOffY = detectedLandmarks?.shadow?.offsetY ?? 6;
      composites.push({ input: shadow, blend: 'multiply', left: Math.min(left + shOffX, baseWidth - 1), top: Math.min(top + shOffY, baseHeight - 1) });
      composites.push({ input: pendantJewelry, left, top });
    }

  } else if (cat === "rings") {
    // ─── RINGS ────────────────────────────────────────────────────────────
    const ringWidth = Math.round(baseWidth * finger.scale);
    if (ringWidth > 4) {
      const ringJewelry = await sharp(isolatedJewelry)
        .resize(ringWidth)
        .rotate(finger.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const ringMeta = await sharp(ringJewelry).metadata();
      const ringHeight = ringMeta.height || ringWidth;

      const left = Math.max(0, Math.round(baseWidth * finger.x - ringWidth / 2));
      const top  = Math.max(0, Math.round(baseHeight * finger.y - ringHeight / 2));

      const shadow = await generateContactShadow(ringJewelry, ringWidth, ringHeight, detectedLandmarks?.shadow || { blur: 3, opacity: 0.38 } as any);
      const shOffX = detectedLandmarks?.shadow?.offsetX ?? 2;
      const shOffY = detectedLandmarks?.shadow?.offsetY ?? 3;
      composites.push({ input: shadow, blend: 'multiply', left: Math.min(left + shOffX, baseWidth - 1), top: Math.min(top + shOffY, baseHeight - 1) });
      composites.push({ input: ringJewelry, left, top });
    }

  } else if (cat === "bracelets") {
    // ─── BRACELETS / BANGLES ──────────────────────────────────────────────
    const wristWidth = Math.round(baseWidth * wrist.scale);
    if (wristWidth > 4) {
      const wristJewelry = await sharp(isolatedJewelry)
        .resize(wristWidth)
        .rotate(wrist.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const wristMeta = await sharp(wristJewelry).metadata();
      const wristHeight = wristMeta.height || wristWidth;

      const left = Math.max(0, Math.round(baseWidth * wrist.x - wristWidth / 2));
      const top  = Math.max(0, Math.round(baseHeight * wrist.y - wristHeight / 2));

      const shadow = await generateContactShadow(wristJewelry, wristWidth, wristHeight, detectedLandmarks?.shadow || { blur: 5, opacity: 0.38 } as any);
      const shOffX = detectedLandmarks?.shadow?.offsetX ?? 3;
      const shOffY = detectedLandmarks?.shadow?.offsetY ?? 4;
      composites.push({ input: shadow, blend: 'multiply', left: Math.min(left + shOffX, baseWidth - 1), top: Math.min(top + shOffY, baseHeight - 1) });
      composites.push({ input: wristJewelry, left, top });
    }

  } else if (cat === "nose_pins") {
    // ─── NOSE PINS / NATH ─────────────────────────────────────────────────
    const noseWidth = Math.round(baseWidth * nose.scale);
    if (noseWidth > 4) {
      const noseJewelry = await sharp(isolatedJewelry)
        .resize(noseWidth)
        .toBuffer();

      const left = Math.max(0, Math.round(baseWidth * nose.x - noseWidth / 2));
      const top  = Math.max(0, Math.round(baseHeight * nose.y - noseWidth / 2));

      const shadow = await generateContactShadow(noseJewelry, noseWidth, noseWidth, detectedLandmarks?.shadow || { blur: 2, opacity: 0.30 } as any);
      const shOffX = detectedLandmarks?.shadow?.offsetX ?? 1;
      const shOffY = detectedLandmarks?.shadow?.offsetY ?? 2;
      composites.push({ input: shadow, blend: 'multiply', left: Math.min(left + shOffX, baseWidth - 1), top: Math.min(top + shOffY, baseHeight - 1) });
      composites.push({ input: noseJewelry, left, top });
    }

  } else if (cat === "sets") {
    // ─── JEWELLERY SETS — place necklace + earrings ───────────────────────
    // Necklace component
    const setNeckWidth = Math.round(baseWidth * neck.scale);
    if (setNeckWidth > 4) {
      const setNeckJewelry = await sharp(isolatedJewelry)
        .resize(setNeckWidth)
        .rotate(neck.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const setNeckMeta = await sharp(setNeckJewelry).metadata();
      const setNeckHeight = setNeckMeta.height || setNeckWidth;
      const nLeft = Math.max(0, Math.round(baseWidth * neck.x - setNeckWidth / 2));
      const nTop  = Math.max(0, Math.round(baseHeight * neck.y - setNeckHeight / 3));
      const nShadow = await generateContactShadow(setNeckJewelry, setNeckWidth, setNeckHeight, detectedLandmarks?.shadow || { blur: 7, opacity: 0.40 } as any);
      const shOffX = detectedLandmarks?.shadow?.offsetX ?? 4;
      const shOffY = detectedLandmarks?.shadow?.offsetY ?? 8;
      composites.push({ input: nShadow, blend: 'multiply', left: Math.min(nLeft + shOffX, baseWidth - 1), top: Math.min(nTop + shOffY, baseHeight - 1) });
      composites.push({ input: setNeckJewelry, left: nLeft, top: nTop });
    }
    // Earring components (at smaller scale as part of set)
    const setEarScale = 0.065;
    for (const [ear, flip] of [[leftEar, false], [rightEar, true]] as const) {
      if (ear && ear.isVisible !== false) {
        const setEarWidth = Math.round(baseWidth * setEarScale);
        if (setEarWidth > 3) {
          let setEarImg = sharp(isolatedJewelry).resize(setEarWidth);
          if (flip) setEarImg = setEarImg.flop();
          const setRotated = await setEarImg.rotate(ear.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
          const setEarMeta = await sharp(setRotated).metadata();
          const setEarH = setEarMeta.height || setEarWidth;
          const eL = Math.max(0, Math.round(baseWidth * ear.x - setEarWidth / 2));
          const eT = Math.max(0, Math.round(baseHeight * ear.y - setEarH / 4));
          const eShadow = await generateContactShadow(setRotated, setEarWidth, setEarH, detectedLandmarks?.shadow || { blur: 3, opacity: 0.38 } as any);
          const shOffX = detectedLandmarks?.shadow?.offsetX ?? 2;
          const shOffY = detectedLandmarks?.shadow?.offsetY ?? 4;
          composites.push({ input: eShadow, blend: 'multiply', left: Math.min(eL + shOffX, baseWidth - 1), top: Math.min(eT + shOffY, baseHeight - 1) });
          composites.push({ input: setRotated, left: eL, top: eT });
        }
      }
    }

  } else {
    // ─── GENERIC FALLBACK — use neck position ──────────────────────────────
    const genWidth = Math.round(baseWidth * neck.scale);
    if (genWidth > 4) {
      const genJewelry = await sharp(isolatedJewelry)
        .resize(genWidth)
        .toBuffer();
      const genMeta = await sharp(genJewelry).metadata();
      const genHeight = genMeta.height || genWidth;
      const left = Math.max(0, Math.round(baseWidth * neck.x - genWidth / 2));
      const top  = Math.max(0, Math.round(baseHeight * neck.y - genHeight / 3));
      const shadow = await generateContactShadow(genJewelry, genWidth, genHeight, detectedLandmarks?.shadow || { blur: 6, opacity: 0.38 } as any);
      const shOffX = detectedLandmarks?.shadow?.offsetX ?? 4;
      const shOffY = detectedLandmarks?.shadow?.offsetY ?? 6;
      composites.push({ input: shadow, blend: 'multiply', left: Math.min(left + shOffX, baseWidth - 1), top: Math.min(top + shOffY, baseHeight - 1) });
      composites.push({ input: genJewelry, left, top });
    }
  }

  // Composite all layers and encode as high-quality JPEG
  return baseImage
    .composite(composites)
    .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
    .toBuffer();
}
