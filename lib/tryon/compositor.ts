import sharp, { OverlayOptions } from "sharp";
import path from "path";
import fs from "fs/promises";
import { JewelryCategory, TryOnRequest } from "./types";
import { getCharacterById } from "./characters";

/**
 * Intelligent Jewelry Background Isolation & Alpha Segmentation
 * Ensures transparent alpha channel and removes background artifacts
 */
export async function isolateJewelryAsset(jewelryBuffer: Buffer): Promise<Buffer> {
  const image = sharp(jewelryBuffer);
  const metadata = await image.metadata();

  // If already has transparent alpha with actual transparency, clean fringe and return
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

  // If no alpha or opaque background (e.g. pure white or studio grey/cream),
  // extract alpha mask by isolating the non-background pixels
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const totalPixels = info.width * info.height;

  // Sample corner pixel colors to estimate background
  const corners = [
    0, // top-left
    (info.width - 1) * 4, // top-right
    (totalPixels - info.width) * 4, // bottom-left
    (totalPixels - 1) * 4, // bottom-right
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

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const diff = Math.sqrt(
      Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
    );

    // Smooth soft alpha feathering
    if (diff < 18) {
      data[i + 3] = 0; // Fully transparent
    } else if (diff < 36) {
      const alpha = Math.round(((diff - 18) / 18) * 255);
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

/**
 * Synthesizes a soft ambient contact shadow for realistic photorealistic lighting
 */
async function generateContactShadow(
  isolatedJewelry: Buffer,
  width: number,
  height: number,
  blurRadius = 6,
  shadowOpacity = 0.38
): Promise<Buffer> {
  // Convert isolated jewelry to dark silhouette and blur for realistic ambient occlusion
  const { data, info } = await sharp(isolatedJewelry)
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a > 80) {
      data[i] = 18; // dark shadow R
      data[i + 1] = 14; // dark shadow G
      data[i + 2] = 12; // dark shadow B
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

/**
 * Production Computer Vision Compositor
 * Places jewelry with exact fidelity, realistic shadows, scale, and lighting
 */
export async function compositeVirtualTryOn(
  baseImageBuffer: Buffer,
  rawJewelryBuffer: Buffer,
  req: TryOnRequest
): Promise<Buffer> {
  const baseImage = sharp(baseImageBuffer);
  const baseMeta = await baseImage.metadata();
  const baseWidth = baseMeta.width || 800;
  const baseHeight = baseMeta.height || 1000;

  // 1. Isolate the jewelry asset cleanly
  const isolatedJewelry = await isolateJewelryAsset(rawJewelryBuffer);

  // 2. Determine landmark anchors
  // 2. Determine landmark anchors
  let leftEar: { x: number; y: number; scale: number; rotation: number } | null = null;
  let rightEar: { x: number; y: number; scale: number; rotation: number } | null = null;
  let neck = { x: 0.50, y: 0.76, scale: 0.44, rotation: 0 };
  let finger = { x: 0.52, y: 0.64, scale: 0.14, rotation: -10 };
  let wrist = { x: 0.50, y: 0.82, scale: 0.32, rotation: 6 };

  if (req.mode === "character" && req.characterId) {
    const character = getCharacterById(req.characterId);
    if (character?.landmarks) {
      if (character.landmarks.leftEar) leftEar = { ...character.landmarks.leftEar };
      if (character.landmarks.rightEar) rightEar = { ...character.landmarks.rightEar };
      if (character.landmarks.neck) neck = { ...character.landmarks.neck };
      if (character.landmarks.finger) finger = { ...character.landmarks.finger };
      if (character.landmarks.wrist) wrist = { ...character.landmarks.wrist };
    }
  } else {
    // For self photo / uploaded selfie:
    // Realistic default scale for earrings in a typical portrait is 0.085 (not oversized)
    leftEar = { x: 0.28, y: 0.52, scale: 0.085, rotation: -3 };
    rightEar = { x: 0.72, y: 0.52, scale: 0.085, rotation: 3 };
    neck = { x: 0.50, y: 0.76, scale: 0.42, rotation: 0 };
    finger = { x: 0.50, y: 0.65, scale: 0.12, rotation: 0 };
    wrist = { x: 0.50, y: 0.80, scale: 0.28, rotation: 0 };
  }

  // Apply custom interactive adjustments if provided
  if (req.adjustment) {
    const adj = req.adjustment;
    if (adj.earVisibility === "left_only") rightEar = null;
    if (adj.earVisibility === "right_only") leftEar = null;

    const scaleMul = adj.scaleMultiplier || 1.0;
    const rotDelta = adj.rotationDelta || 0;
    const offX = adj.offsetX || 0;
    const offY = adj.offsetY || 0;

    if (leftEar) {
      leftEar.x += offX;
      leftEar.y += offY;
      leftEar.scale *= scaleMul;
      leftEar.rotation += rotDelta;
    }
    if (rightEar) {
      rightEar.x += offX;
      rightEar.y += offY;
      rightEar.scale *= scaleMul;
      rightEar.rotation -= rotDelta;
    }
    if (neck) {
      neck.x += offX;
      neck.y += offY;
      neck.scale *= scaleMul;
      neck.rotation += rotDelta;
    }
    if (finger) {
      finger.x += offX;
      finger.y += offY;
      finger.scale *= scaleMul;
      finger.rotation += rotDelta;
    }
  }

  const composites: OverlayOptions[] = [];
  const cat = req.category;

  // ─── PLACEMENT STRATEGY BASED ON JEWELRY CATEGORY ───
  if (cat === "earrings") {
    // Generate left ear piece (if left ear is present)
    if (leftEar) {
      const leftWidth = Math.round(baseWidth * leftEar.scale);
      const leftJewelry = await sharp(isolatedJewelry)
        .resize(leftWidth)
        .rotate(leftEar.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const leftMeta = await sharp(leftJewelry).metadata();
      const leftHeight = leftMeta.height || leftWidth;

      const leftLeft = Math.round(baseWidth * leftEar.x - leftWidth / 2);
      const leftTop = Math.round(baseHeight * leftEar.y - leftHeight / 4);

      // Left shadow
      const leftShadow = await generateContactShadow(leftJewelry, leftWidth, leftHeight, 5, 0.42);
      composites.push({
        input: leftShadow,
        left: Math.max(0, leftLeft + 3),
        top: Math.max(0, leftTop + 5),
      });
      // Left piece
      composites.push({
        input: leftJewelry,
        left: Math.max(0, leftLeft),
        top: Math.max(0, leftTop),
      });
    }

    // Generate right ear piece (only if right ear is present and visible)
    if (rightEar) {
      const rightWidth = Math.round(baseWidth * rightEar.scale);
      const rightJewelry = await sharp(isolatedJewelry)
        .flop() // horizontal mirror for opposing ear
        .resize(rightWidth)
        .rotate(rightEar.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const rightMeta = await sharp(rightJewelry).metadata();
      const rightHeight = rightMeta.height || rightWidth;

      const rightLeft = Math.round(baseWidth * rightEar.x - rightWidth / 2);
      const rightTop = Math.round(baseHeight * rightEar.y - rightHeight / 4);

      // Right shadow
      const rightShadow = await generateContactShadow(rightJewelry, rightWidth, rightHeight, 5, 0.42);
      composites.push({
        input: rightShadow,
        left: Math.max(0, rightLeft + 3),
        top: Math.max(0, rightTop + 5),
      });
      // Right piece
      composites.push({
        input: rightJewelry,
        left: Math.max(0, rightLeft),
        top: Math.max(0, rightTop),
      });
    }

  } else if (cat === "necklaces" || cat === "chains" || cat === "pendants" || cat === "sets") {
    // Necklaces & chains gracefully draped across the collarbone
    const neckWidth = Math.round(baseWidth * neck.scale);
    const neckJewelry = await sharp(isolatedJewelry)
      .resize(neckWidth)
      .rotate(neck.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    const neckMeta = await sharp(neckJewelry).metadata();
    const neckHeight = neckMeta.height || neckWidth;

    const neckLeft = Math.round(baseWidth * neck.x - neckWidth / 2);
    const neckTop = Math.round(baseHeight * neck.y - neckHeight / 3);

    // Soft realistic ambient occlusion on skin/collarbone
    const neckShadow = await generateContactShadow(neckJewelry, neckWidth, neckHeight, 8, 0.45);
    composites.push({
      input: neckShadow,
      left: Math.max(0, neckLeft + 4),
      top: Math.max(0, neckTop + 8),
    });
    // Main necklace piece
    composites.push({
      input: neckJewelry,
      left: Math.max(0, neckLeft),
      top: Math.max(0, neckTop),
    });

  } else if (cat === "rings") {
    // Ring placed on finger
    const ringWidth = Math.round(baseWidth * finger.scale);
    const ringJewelry = await sharp(isolatedJewelry)
      .resize(ringWidth)
      .rotate(finger.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    const ringMeta = await sharp(ringJewelry).metadata();
    const ringHeight = ringMeta.height || ringWidth;

    const ringLeft = Math.round(baseWidth * finger.x - ringWidth / 2);
    const ringTop = Math.round(baseHeight * finger.y - ringHeight / 2);

    const ringShadow = await generateContactShadow(ringJewelry, ringWidth, ringHeight, 4, 0.4);
    composites.push({
      input: ringShadow,
      left: Math.max(0, ringLeft + 2),
      top: Math.max(0, ringTop + 3),
    });
    composites.push({
      input: ringJewelry,
      left: Math.max(0, ringLeft),
      top: Math.max(0, ringTop),
    });

  } else if (cat === "bracelets") {
    // Bracelet / Bangle on wrist
    const wristWidth = Math.round(baseWidth * wrist.scale);
    const wristJewelry = await sharp(isolatedJewelry)
      .resize(wristWidth)
      .rotate(wrist.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    const wristMeta = await sharp(wristJewelry).metadata();
    const wristHeight = wristMeta.height || wristWidth;

    const wristLeft = Math.round(baseWidth * wrist.x - wristWidth / 2);
    const wristTop = Math.round(baseHeight * wrist.y - wristHeight / 2);

    const wristShadow = await generateContactShadow(wristJewelry, wristWidth, wristHeight, 6, 0.4);
    composites.push({
      input: wristShadow,
      left: Math.max(0, wristLeft + 3),
      top: Math.max(0, wristTop + 4),
    });
    composites.push({
      input: wristJewelry,
      left: Math.max(0, wristLeft),
      top: Math.max(0, wristTop),
    });
  }

  // Composite all layers onto the base model image and encode as high quality JPEG
  return baseImage
    .composite(composites)
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();
}
