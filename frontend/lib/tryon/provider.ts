import { TryOnRequest, JewelryCategory } from "./types";
import { compositeVirtualTryOn } from "./compositor";
import { fal } from "@fal-ai/client";

export interface AITryOnProvider {
  name: string;
  generate(
    request: TryOnRequest,
    baseImageBuffer: Buffer,
    jewelryBuffer: Buffer
  ): Promise<{ buffer: Buffer; provider: "ai_provider" | "cv_engine" }>;
}

// ─── MASTER PROMPT BUILDER ────────────────────────────────────────────────────

/**
 * Builds the master AI instruction for photorealistic jewellery try-on.
 * Dynamically combines the base instruction with category-specific placement rules.
 */
function buildMasterPrompt(request: TryOnRequest): string {
  const metalDesc =
    request.metalTone === "silver"
      ? "high-polish 925 sterling silver"
      : request.metalTone === "rose_gold"
      ? "18K rose gold with warm blush tones"
      : request.metalTone === "white_gold"
      ? "18K white gold"
      : "18K PVD yellow gold";

  const base = `Create an ultra-photorealistic commercial jewellery photograph.

Use the supplied person/model image as the primary identity and composition reference.
Use the supplied jewellery image as the exact product reference — it is the absolute source of truth.

PERSON PRESERVATION RULES:
- Preserve the person's exact identity, facial structure, skin texture, skin tone, hairstyle, body proportions, pose, clothing, camera angle, perspective, lighting environment and background
- Do NOT beautify, reshape, age, de-age, alter the face, or change anything about the person
- Do NOT add makeup, change hair, or modify skin
- Only modify the image where necessary to realistically add the supplied jewellery

JEWELLERY FIDELITY RULES (CRITICAL):
- The jewellery reference image is the source of truth — preserve its exact design
- Preserve: exact geometry, proportions, gemstones, stone count, stone arrangement, stone shape, metal type, metal color (${metalDesc}), surface texture, pendant structure, decorative elements, silhouette, and overall appearance
- Do NOT redesign, simplify, embellish, duplicate, remove or invent jewellery elements
- Do NOT change the metal color or add/remove stones
- Do NOT replace the jewellery with a generic/similar piece

REALISM REQUIREMENTS:
- The jewellery must physically appear to be worn by the person
- Respect natural occlusion from hair, ears, fingers, skin, neck and clothing
- Generate realistic contact shadows, reflections, highlights, metal texture, and gemstone refraction
- Match perspective, scale, and lighting to the person's photograph
- The result must look like a professionally photographed real jewellery campaign image

QUALITY CONSTRAINTS:
- Ultra-photorealistic, commercially usable, high resolution
- Realistic skin texture — not plastic, painted, or over-smoothed
- Realistic metal highlights and gemstone refraction
- Do not create an illustration, painting, CGI render, cartoon, or synthetic-looking result
- No floating jewellery, no scale distortion, no anatomy corruption, no extra fingers`;

  const categoryInstructions = getCategoryInstructions(request.category, request.productTitle);

  return `${base}\n\nJEWELLERY CATEGORY: ${request.category.toUpperCase()}\nPRODUCT: ${request.productTitle} (${metalDesc})\n\n${categoryInstructions}`;
}

/**
 * Returns category-specific jewellery placement instructions
 */
function getCategoryInstructions(category: JewelryCategory, productTitle: string): string {
  switch (category) {
    case "earrings":
      return `EARRING PLACEMENT INSTRUCTIONS:
- Identify the visible ear(s) precisely
- Position the earring at the correct anatomical attachment point on the earlobe
- Respect head rotation and ear anatomy — do not attach to an incorrect location
- Respect hair occlusion — if hair covers the ear, show partial occlusion naturally
- Maintain left/right symmetry when both ears are visible
- For stud earrings: place flush against the earlobe with a small visible post back
- For drop/dangle earrings: allow natural gravity hang from the earlobe
- For jhumkas/chandelier earrings: show full decorative cascade hanging from the lobe
- For hoops: show the hoop passing through the earlobe, with the loop visible
- Maintain realistic scale — earrings should match anatomically correct proportions
- Generate realistic metal highlights and shadow on the skin beneath`;

    case "necklaces":
    case "chains":
      return `NECKLACE/CHAIN PLACEMENT INSTRUCTIONS:
- Place the necklace naturally around the neck following the anatomy of the neck and collarbone
- The chain must follow the natural curve of the neck — no floating or rigid straight lines
- Preserve realistic chain drape/curvature with correct gravity effect
- For chokers: place close to the base of the neck
- For long chains: drape naturally down toward the chest
- For herringbone/flat chains: show the flat face of the chain with correct metal reflection
- Respect hair overlap — hair should naturally fall over the chain where appropriate
- Respect clothing overlap — chain should appear to rest on skin or clothing correctly
- Maintain accurate chain proportions and link detail
- Generate realistic contact shadows on the skin and collarbone`;

    case "pendants":
      return `PENDANT NECKLACE PLACEMENT INSTRUCTIONS:
- Place the chain around the neck with the pendant hanging at the correct centre position
- The pendant should hang at the V of the neckline based on chain length
- The chain must follow natural neck curvature
- Maintain the exact pendant design including all gemstones and decorative elements
- Preserve the bail (connecting loop) detail
- Pendant should hang with natural gravity — not floating, not crooked
- Generate realistic metal shadow on the chest/décolletage beneath the pendant
- Respect clothing neckline — pendant should fall inside the garment's V appropriately`;

    case "rings":
      return `RING PLACEMENT INSTRUCTIONS:
- Detect the hand and identify the appropriate finger (typically ring finger or index finger)
- Position the ring around the finger at the correct anatomical position (base of finger)
- Match finger orientation and perspective precisely
- The ring must wrap convincingly around the finger — not floating, not clipped
- Match ring scale to anatomically correct finger size
- Respect knuckle anatomy — show the ring band curving around the finger
- For solitaire rings: show the stone prominently facing the camera
- For band rings: show the band width and metal texture accurately
- Generate realistic reflections on the metal and gemstone facets
- Add contact shadow between ring band and finger skin`;

    case "bracelets":
      return `BRACELET PLACEMENT INSTRUCTIONS:
- Detect the wrist/forearm precisely
- Place the bracelet/bangle encircling the wrist at the correct anatomical position
- The bracelet must follow wrist curvature — not floating, not squeezing
- Match wrist perspective and hand orientation
- For bangles: show the circular form encircling the wrist with correct gap
- For chain bracelets: show the chain draping naturally around the wrist
- For cuff bracelets: show the open cuff on the wrist with correct gap
- Maintain realistic circumference matching the wrist size
- Respect sleeves or clothing — bracelet rests at the sleeve edge naturally
- Generate natural contact shadows beneath the bracelet on the wrist skin`;

    case "nose_pins":
      return `NOSE PIN/NOSE RING PLACEMENT INSTRUCTIONS:
- Identify the nose precisely — left or right nostril based on the style
- For nose pins/studs: place the stud at the correct position on the nostril curve
- For nose rings (nath): show the ring passing through the nostril naturally
- Match the scale anatomically — nose jewellery is small and delicate
- Respect the nostril anatomy and curvature
- For traditional nath with chain: show the chain draping to the ear or hair
- Generate subtle skin indentation and shadow around the placement point
- The jewellery must look physically attached, not drawn on`;

    case "sets":
      return `JEWELLERY SET PLACEMENT INSTRUCTIONS:
- This is a complete jewellery set — place ALL components appropriately
- Place the necklace/chain around the neck following neck anatomy
- Place matching earrings on both ears at correct earlobe positions
- Place any rings on appropriate fingers if included
- Ensure all pieces look cohesive and coordinated
- Maintain design consistency across all pieces — same metal color and design language
- Generate realistic shadows and reflections for all pieces simultaneously
- Ensure one piece does not visually conflict with another`;

    case "other":
    default:
      return `JEWELLERY PLACEMENT INSTRUCTIONS:
- Identify the most appropriate body location for this jewellery type
- Place the jewellery with anatomical accuracy and correct scale
- Ensure the jewellery appears physically worn, not superimposed
- Generate realistic contact shadows, metal reflections and lighting interaction
- Preserve the exact design from the reference image`;
  }
}

// ─── GOOGLE GEMINI PROVIDER ───────────────────────────────────────────────────

/**
 * Google Gemini 2.0 Flash & Imagen 3 Virtual Try-On Provider
 *
 * Mode strategy:
 * - "imagen3": Generates a photorealistic AI model editorial image using Google Imagen 3
 *   (Best for AI Model try-on — creates stunning photorealistic results)
 * - "gemini_vision": Uses Gemini 2.0 Flash multimodal to detect anatomical landmarks
 *   on the customer's actual photo, then composites with Sharp CV
 *   (Best for Self Photo try-on — preserves identity perfectly)
 *
 * Configure via:
 *   GEMINI_API_KEY or GOOGLE_API_KEY
 *   GEMINI_TRYON_MODE ("imagen3" | "gemini_vision", default: "gemini_vision")
 */
export class GoogleGeminiTryOnProvider implements AITryOnProvider {
  name = "google_gemini";
  private apiKey: string;
  private mode: "imagen3" | "gemini_vision";

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    this.mode = (process.env.GEMINI_TRYON_MODE as "imagen3" | "gemini_vision") || "gemini_vision";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async generate(
    request: TryOnRequest,
    baseImageBuffer: Buffer,
    jewelryBuffer: Buffer
  ): Promise<{ buffer: Buffer; provider: "ai_provider" | "cv_engine" }> {
    if (!this.isConfigured()) {
      throw new Error("Google Gemini API key not configured (set GEMINI_API_KEY or GOOGLE_API_KEY)");
    }

    // Use Imagen 3 for AI Model try-on (photorealistic editorial)
    // Use Gemini Vision + CV for self-photo (identity preservation)
    if (request.mode === "character" || this.mode === "imagen3") {
      return await this.generateWithImagen3(request);
    } else {
      return await this.generateWithGeminiVision(request, baseImageBuffer, jewelryBuffer);
    }
  }

  /**
   * Google Imagen 3 — Photorealistic Editorial Generation (AI Model mode)
   * Best for AI model try-on: generates stunning commercial jewellery imagery.
   */
  private async generateWithImagen3(
    request: TryOnRequest
  ): Promise<{ buffer: Buffer; provider: "ai_provider" }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${this.apiKey}`;

    const metalDesc =
      request.metalTone === "silver"
        ? "high-polish 925 sterling silver"
        : request.metalTone === "rose_gold"
        ? "18K rose gold"
        : request.metalTone === "white_gold"
        ? "18K white gold"
        : "18K PVD yellow gold";

    const categoryPromptMap: Record<JewelryCategory, string> = {
      earrings: "elegantly placed on anatomically correct earlobes, visible on both ears, with realistic metal highlights",
      necklaces: "draped naturally around the neck following the collarbone curve, with realistic chain curvature",
      chains: "draped naturally around the neck following the collarbone curve",
      pendants: "hanging at the centre of the décolletage from a delicate chain around the neck",
      rings: "placed on the ring finger of the hand, fitting naturally with realistic band curvature",
      bracelets: "encircling the wrist naturally with correct drape and metal reflection",
      nose_pins: "placed precisely on the nostril, physically attached and anatomically correct",
      sets: "with all jewellery pieces placed across the neck, ears and wrists simultaneously",
      other: "placed at the anatomically correct location on the body",
    };

    const placementHint = categoryPromptMap[request.category] || categoryPromptMap.other;

    const prompt = `Ultra-photorealistic luxury jewellery commercial advertisement. An elegant Indian model wearing authentic ${request.productTitle} (${metalDesc} ${request.category}), ${placementHint}. High-fashion jewellery editorial, Vogue India / Harper's Bazaar India aesthetic. Soft diffuse studio rim lighting with warm fill, delicate skin texture with natural pores visible, 85mm f/1.8 beauty photography bokeh, shallow depth of field. The jewellery is the hero — showing exquisite metal surface detail, realistic gemstone refraction, and contact shadow on skin. Photorealistic. 8K resolution. The jewellery design exactly matches the description. No CGI, no cartoon, no illustration.`;

    const payload = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "3:4",
        outputOptions: { mimeType: "image/jpeg" },
        personGeneration: "ALLOW_ADULT",
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Imagen 3 returned HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;

    if (!b64) {
      throw new Error("Google Imagen 3 did not return image predictions");
    }

    return {
      buffer: Buffer.from(b64, "base64"),
      provider: "ai_provider",
    };
  }

  /**
   * Gemini 2.0 Flash Multimodal — Landmark Detection + High-Fidelity CV Composite
   * Best for self-photo try-on: detects where to place jewellery, then composites.
   * Preserves customer identity with 100% fidelity.
   */
  private async generateWithGeminiVision(
    request: TryOnRequest,
    baseImageBuffer: Buffer,
    jewelryBuffer: Buffer
  ): Promise<{ buffer: Buffer; provider: "ai_provider" | "cv_engine" }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

    const categoryLandmarkMap: Record<JewelryCategory, string> = {
      earrings: `leftEar (x, y, scale, isVisible), rightEar (x, y, scale, isVisible), headTilt (degrees)`,
      necklaces: `neck (x, y, scale, isVisible), collarbone (x, y, scale)`,
      chains: `neck (x, y, scale, isVisible), collarbone (x, y, scale)`,
      pendants: `neck (x, y, scale, isVisible), chest (x, y, scale)`,
      rings: `finger (x, y, scale, rotation, isVisible), hand (x, y)`,
      bracelets: `wrist (x, y, scale, rotation, isVisible)`,
      nose_pins: `nose (x, y, scale, isVisible, side)`,
      sets: `leftEar (x, y, scale, isVisible), rightEar (x, y, scale, isVisible), neck (x, y, scale, isVisible)`,
      other: `neck (x, y, scale, isVisible)`,
    };

    const landmarkFields = categoryLandmarkMap[request.category] || categoryLandmarkMap.other;

    const prompt = `You are an advanced Art Director for virtual jewellery try-on.

Analyze the two supplied images:
1. Image 1 is the person/model portrait.
2. Image 2 is the jewellery product image (category: ${request.category}).

Detect the exact normalized 2D coordinates (0.000 to 1.000, where 0,0 is top-left) for the anatomical landmarks needed to place Image 2 onto Image 1.
Required landmarks: ${landmarkFields}

Additionally, analyze the lighting environment of the person (Image 1) and determine the exact matching lighting and shadow configuration to blend Image 2 seamlessly into it.
- lighting: brightness (0.5 to 1.5), saturation (0.5 to 1.5), and RGB tint (e.g. { r: 255, g: 245, b: 235 })
- shadow: offsetX, offsetY (directional based on light source), blur (1-10), opacity (0.1 to 0.6), colorR, colorG, colorB

Return ONLY valid JSON with this exact structure:
{
  "leftEar": { "x": 0.000, "y": 0.000, "scale": 0.000, "isVisible": true },
  "rightEar": { "x": 0.000, "y": 0.000, "scale": 0.000, "isVisible": true },
  "neck": { "x": 0.000, "y": 0.000, "scale": 0.000, "isVisible": true },
  "chest": { "x": 0.000, "y": 0.000, "scale": 0.000 },
  "finger": { "x": 0.000, "y": 0.000, "scale": 0.000, "rotation": 0, "isVisible": true },
  "wrist": { "x": 0.000, "y": 0.000, "scale": 0.000, "rotation": 0, "isVisible": true },
  "nose": { "x": 0.000, "y": 0.000, "scale": 0.000, "isVisible": true },
  "lighting": { "brightness": 1.0, "saturation": 1.0, "tintR": 255, "tintG": 255, "tintB": 255 },
  "shadow": { "offsetX": 3, "offsetY": 6, "blur": 5, "opacity": 0.4, "colorR": 15, "colorG": 12, "colorB": 10 }
}

Only include landmarks relevant to ${request.category}. Set others to 0/false. Ensure JSON is strictly valid.`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: baseImageBuffer.toString("base64"),
              },
            },
            {
              inline_data: {
                mime_type: "image/png",
                data: jewelryBuffer.toString("base64"),
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.1,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn(`[Gemini Vision] HTTP ${res.status} — falling back to CV compositor`);
      const buffer = await compositeVirtualTryOn(baseImageBuffer, jewelryBuffer, request);
      return { buffer, provider: "cv_engine" };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      try {
        const detected = JSON.parse(text);

        // Map Gemini landmark detections → TryOnRequest adjustments
        const updatedRequest = { ...request };

        // Ear visibility for earrings
        if (request.category === "earrings") {
          const leftVisible = detected.leftEar?.isVisible ?? true;
          const rightVisible = detected.rightEar?.isVisible ?? true;
          if (!leftVisible && rightVisible) {
            updatedRequest.adjustment = { ...updatedRequest.adjustment, earVisibility: "right_only" };
          } else if (leftVisible && !rightVisible) {
            updatedRequest.adjustment = { ...updatedRequest.adjustment, earVisibility: "left_only" };
          }
        }

        // Pass detected landmarks into the compositor via a landmarks override
        const buffer = await compositeVirtualTryOn(baseImageBuffer, jewelryBuffer, updatedRequest, detected);
        return { buffer, provider: "ai_provider" };
      } catch (parseErr) {
        console.warn("[Gemini Vision] Failed to parse landmark JSON, using default CV placement:", parseErr);
      }
    }

    // Fallback: CV composite with default landmarks
    const buffer = await compositeVirtualTryOn(baseImageBuffer, jewelryBuffer, request);
    return { buffer, provider: "cv_engine" };
  }
}

// ─── EXTERNAL AI PROVIDER ─────────────────────────────────────────────────────

/**
 * External AI Provider (e.g. Fal.ai / Replicate / Custom virtual try-on API)
 * Configurable via: TRYON_API_URL, TRYON_API_KEY, TRYON_MODEL, TRYON_TIMEOUT
 */
export class ExternalAITryOnProvider implements AITryOnProvider {
  name = "external_ai";
  private apiUrl: string;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor() {
    this.apiUrl = process.env.TRYON_API_URL || "";
    this.apiKey = process.env.TRYON_API_KEY || "";
    this.model = process.env.TRYON_MODEL || "jewelry-vto-v1";
    this.timeoutMs = parseInt(process.env.TRYON_TIMEOUT || "25000", 10);
  }

  isConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiKey);
  }

  async generate(
    request: TryOnRequest,
    baseImageBuffer: Buffer,
    jewelryBuffer: Buffer
  ): Promise<{ buffer: Buffer; provider: "ai_provider" | "cv_engine" }> {
    if (!this.isConfigured()) {
      throw new Error("External AI provider credentials not configured");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const payload = {
        model: this.model,
        category: request.category,
        metalTone: request.metalTone || "yellow_gold",
        productTitle: request.productTitle,
        baseImageBase64: baseImageBuffer.toString("base64"),
        jewelryImageBase64: jewelryBuffer.toString("base64"),
        prompt: buildMasterPrompt(request),
      };

      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`External AI Provider returned HTTP ${res.status}`);
      }

      const responseData = await res.json();
      if (responseData.image_base64) {
        return {
          buffer: Buffer.from(responseData.image_base64, "base64"),
          provider: "ai_provider",
        };
      } else if (responseData.image_url) {
        const imgRes = await fetch(responseData.image_url);
        const arrayBuf = await imgRes.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuf),
          provider: "ai_provider",
        };
      }

      throw new Error("Invalid response format from external AI provider");
    } catch (err: any) {
      clearTimeout(timeout);
      throw err;
    }
  }
}

// ─── HUGGING FACE PROVIDER ────────────────────────────────────────────────────

/**
 * Hugging Face Provider for True Virtual Try-On Models
 * Configurable via: HUGGINGFACE_API_KEY, HUGGINGFACE_MODEL_URL
 */
export class HuggingFaceTryOnProvider implements AITryOnProvider {
  name = "huggingface";
  private apiKey: string;
  private modelUrl: string;

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || "";
    // Only configure if explicitly set, to prevent using SDXL text-to-image base as a VTO fallback
    this.modelUrl = process.env.HUGGINGFACE_MODEL_URL || "";
  }

  isConfigured(): boolean {
    // Both must be provided to use Hugging Face
    return Boolean(this.apiKey && this.modelUrl && this.modelUrl !== "");
  }

  async generate(
    request: TryOnRequest,
    baseImageBuffer: Buffer,
    jewelryBuffer: Buffer
  ): Promise<{ buffer: Buffer; provider: "ai_provider" | "cv_engine" }> {
    if (!this.isConfigured()) {
      throw new Error("Hugging Face API key not configured");
    }

    const payload = {
      inputs: buildMasterPrompt(request),
      parameters: {
        image: baseImageBuffer.toString("base64"),
        reference_image: jewelryBuffer.toString("base64"), // Many HF custom VTO spaces look for this
      },
    };

    const res = await fetch(this.modelUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Hugging Face API returned HTTP ${res.status}: ${errorText}`);
    }

    // Hugging Face standard Inference API often returns the raw image buffer
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.startsWith("image/")) {
      const arrayBuf = await res.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuf),
        provider: "ai_provider",
      };
    }

    // If it's a custom endpoint returning JSON
    const responseData = await res.json();
    if (responseData.image_base64) {
      return {
        buffer: Buffer.from(responseData.image_base64, "base64"),
        provider: "ai_provider",
      };
    } else if (Array.isArray(responseData) && responseData[0]?.generated_image) {
      return {
        buffer: Buffer.from(responseData[0].generated_image, "base64"),
        provider: "ai_provider",
      };
    }

    throw new Error("Invalid response format from Hugging Face provider (expected image blob or JSON with image_base64)");
  }
}

// ─── BUILT-IN CV PROVIDER ─────────────────────────────────────────────────────

/**
 * Built-in High-Fidelity Computer Vision Provider
 * Zero latency, 100% jewellery fidelity. No AI required.
 * Used as guaranteed fallback when no AI key is configured.
 */
export class ComputerVisionTryOnProvider implements AITryOnProvider {
  name = "cv_engine";

  async generate(
    request: TryOnRequest,
    baseImageBuffer: Buffer,
    jewelryBuffer: Buffer
  ): Promise<{ buffer: Buffer; provider: "ai_provider" | "cv_engine" }> {
    const buffer = await compositeVirtualTryOn(baseImageBuffer, jewelryBuffer, request);
    return {
      buffer,
      provider: "cv_engine",
    };
  }
}

// ─── PROVIDER RESOLVER ────────────────────────────────────────────────────────

/**
 * Resolves and executes the best available provider with resilient fallback:
 * 1. Hugging Face (True Generative AI Try-On)
 * 2. Google Gemini (if GEMINI_API_KEY configured)
 * 3. External AI Provider (if TRYON_API_URL + TRYON_API_KEY configured)
 * 4. Built-in CV Engine (always available as fallback)
 */
export async function executeTryOn(
  request: TryOnRequest,
  baseImageBuffer: Buffer,
  jewelryBuffer: Buffer
): Promise<{ buffer: Buffer; provider: "ai_provider" | "cv_engine" }> {
  // 1. Hugging Face (True Generative AI Try-On)
  const hf = new HuggingFaceTryOnProvider();
  if (hf.isConfigured()) {
    try {
      return await hf.generate(request, baseImageBuffer, jewelryBuffer);
    } catch (err) {
      console.warn("[TryOn Engine] Hugging Face provider failed, trying next provider:", err);
    }
  }

  // 3. Google Gemini 2.0 Flash (landmark detection + CV) / Imagen 3 (editorial)
  const gemini = new GoogleGeminiTryOnProvider();
  if (gemini.isConfigured()) {
    try {
      return await gemini.generate(request, baseImageBuffer, jewelryBuffer);
    } catch (err) {
      console.warn("[TryOn Engine] Google Gemini provider failed, trying next provider:", err);
    }
  }

  // 4. External AI Provider (Fal.ai / Replicate / Custom)
  const external = new ExternalAITryOnProvider();
  if (external.isConfigured()) {
    try {
      return await external.generate(request, baseImageBuffer, jewelryBuffer);
    } catch (err) {
      console.warn("[TryOn Engine] External AI provider failed, falling back to CV engine:", err);
    }
  }

  // 5. Built-in CV Engine — guaranteed, always available
  console.log("[TryOn Engine] Using built-in CV compositor (no AI key configured — add GEMINI_API_KEY for AI generation)");
  const cvProvider = new ComputerVisionTryOnProvider();
  return await cvProvider.generate(request, baseImageBuffer, jewelryBuffer);
}
