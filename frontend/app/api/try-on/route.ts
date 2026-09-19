import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { TryOnRequest } from "@/lib/tryon/types";
import { getCharacterById } from "@/lib/tryon/characters";
import { executeTryOn } from "@/lib/tryon/provider";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

const MAX_RETRIES = 3;

/**
 * Basic quality validation for generated images.
 * Checks minimum file size and JPEG header integrity.
 */
function validateResultBuffer(buffer: Buffer): { valid: boolean; reason?: string } {
  if (!buffer || buffer.length < 50_000) {
    return { valid: false, reason: "Generated image is too small or empty." };
  }
  // Check for valid JPEG header (FFD8FF) or PNG header (89504E47)
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (!isJpeg && !isPng) {
    return { valid: false, reason: "Generated file is not a valid image." };
  }
  return { valid: true };
}

/**
 * Resolves a jewelry image URL into a Buffer.
 * Always uses the actual product image — never overrides with generics.
 */
async function resolveJewelryBuffer(jewelryUrl: string): Promise<Buffer> {
  if (!jewelryUrl) {
    throw new Error("No product image URL provided for try-on.");
  }

  // Local asset (starts with /)
  if (jewelryUrl.startsWith("/")) {
    const localPath = path.join(process.cwd(), "public", jewelryUrl.replace(/^\//, ""));
    try {
      return await fs.readFile(localPath);
    } catch {
      // Fallback: fetch via HTTP if local file not found (e.g. on serverless)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${siteUrl}${jewelryUrl}`);
      if (!res.ok) throw new Error(`Unable to load local jewelry image: ${jewelryUrl}`);
      return Buffer.from(await res.arrayBuffer());
    }
  }

  // Remote URL (Supabase/CDN/etc.)
  if (jewelryUrl.startsWith("http")) {
    const res = await fetch(jewelryUrl, {
      headers: { "User-Agent": "SHYNISH-TryOn/1.0" },
    });
    if (!res.ok) {
      throw new Error(`Unable to retrieve product image from catalog (HTTP ${res.status}).`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  throw new Error("Invalid product image source URL.");
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: TryOnRequest = await req.json();

    // ─── INPUT VALIDATION ────────────────────────────────────────────────────
    if (!body.productId || !body.productImageUrl || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required product details for try-on." },
        { status: 400 }
      );
    }

    if (body.mode === "character" && !body.characterId) {
      return NextResponse.json(
        { success: false, error: "Please select an AI model to try the jewellery on." },
        { status: 400 }
      );
    }

    if (body.mode === "self" && !body.userImageBase64) {
      return NextResponse.json(
        { success: false, error: "Please upload or capture a photo first." },
        { status: 400 }
      );
    }

    // ─── RESOLVE BASE IMAGE (Model portrait or Customer selfie) ──────────────
    let baseImageBuffer: Buffer;
    let originalDisplayUrl = "";

    if (body.mode === "character" && body.characterId) {
      const character = getCharacterById(body.characterId);
      if (!character) {
        return NextResponse.json(
          { success: false, error: "Selected AI model not found. Please choose another." },
          { status: 404 }
        );
      }
      originalDisplayUrl = character.fullImageUrl;

      // Read model image from local public folder
      const modelRelativePath = character.fullImageUrl.replace(/^\//, "");
      const modelFilePath = path.join(process.cwd(), "public", modelRelativePath);
      try {
        baseImageBuffer = await fs.readFile(modelFilePath);
      } catch {
        // Fallback: fetch via HTTP
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const res = await fetch(`${siteUrl}${character.fullImageUrl}`);
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: "Could not load AI model image. Please try another model." },
            { status: 500 }
          );
        }
        baseImageBuffer = Buffer.from(await res.arrayBuffer());
      }
    } else {
      // Customer-uploaded selfie: Decode base64 — NEVER saved to disk
      originalDisplayUrl = body.userImageBase64!;
      const match = body.userImageBase64!.match(/^data:image\/[a-zA-Z0-9+]+;base64,(.+)$/);
      const rawBase64 = match ? match[1] : body.userImageBase64!;
      baseImageBuffer = Buffer.from(rawBase64, "base64");

      // Validate file size (max 15MB decoded)
      if (baseImageBuffer.length > 15 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Uploaded image is too large. Please compress and re-upload (max 15MB)." },
          { status: 400 }
        );
      }

      // Validate minimum size (too small = likely corrupted)
      if (baseImageBuffer.length < 5_000) {
        return NextResponse.json(
          { success: false, error: "Uploaded image appears to be empty or corrupted. Please try again." },
          { status: 400 }
        );
      }
    }

    // ─── RESOLVE JEWELRY PRODUCT IMAGE ────────────────────────────────────────
    // IMPORTANT: Always use the actual product image. Never override with generic assets.
    // The product's own image is the source of truth for jewellery fidelity.
    let jewelryBuffer: Buffer;
    try {
      jewelryBuffer = await resolveJewelryBuffer(body.productImageUrl);
    } catch (err: any) {
      console.error("[TryOn] Failed to load product jewelry image:", err);
      return NextResponse.json(
        { success: false, error: "Product image could not be loaded for try-on. Please try again." },
        { status: 500 }
      );
    }

    // ─── AI TRY-ON GENERATION WITH RETRY ─────────────────────────────────────
    let resultBuffer: Buffer | null = null;
    let provider: "ai_provider" | "cv_engine" = "cv_engine";
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[TryOn] Generation attempt ${attempt}/${MAX_RETRIES} — product: ${body.productId}, category: ${body.category}, mode: ${body.mode}`);

        const result = await executeTryOn(body, baseImageBuffer, jewelryBuffer);
        resultBuffer = result.buffer;
        provider = result.provider;

        // Quality validation
        const validation = validateResultBuffer(resultBuffer);
        if (!validation.valid) {
          console.warn(`[TryOn] Attempt ${attempt} failed quality check: ${validation.reason}`);
          lastError = new Error(validation.reason!);
          resultBuffer = null;
          continue; // Retry
        }

        // Success — break retry loop
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[TryOn] Attempt ${attempt} failed:`, err.message);
        if (attempt < MAX_RETRIES) {
          // Brief pause before retry
          await new Promise((r) => setTimeout(r, 800 * attempt));
        }
      }
    }

    if (!resultBuffer) {
      const userMessage =
        lastError?.message?.includes("API key") || lastError?.message?.includes("quota")
          ? "AI Try-On service is temporarily unavailable. Please try again shortly."
          : "We couldn't generate a realistic try-on from this photo. Please try a clearer, well-lit image with the jewellery area visible.";
      return NextResponse.json({ success: false, error: userMessage }, { status: 500 });
    }

    // ─── ENCODE RESULT ────────────────────────────────────────────────────────
    const resultBase64 = `data:image/jpeg;base64,${resultBuffer.toString("base64")}`;
    const processingTimeMs = Date.now() - startTime;

    console.log(`[TryOn] Success — provider: ${provider}, time: ${processingTimeMs}ms, size: ${Math.round(resultBuffer.length / 1024)}KB`);

    return NextResponse.json({
      success: true,
      resultImageUrl: resultBase64,
      originalImageUrl: originalDisplayUrl,
      category: body.category,
      processingTimeMs,
      provider,
    });

  } catch (error: any) {
    console.error("[Virtual Try-On API Error]:", error);

    // Map to customer-friendly messages — never expose internal errors
    let userMessage = "Try-On is temporarily unavailable. Please try again shortly.";
    if (error.message?.includes("Invalid product image")) {
      userMessage = "Product image could not be loaded for try-on.";
    } else if (error.message?.includes("too large")) {
      userMessage = "Your photo is too large. Please use a smaller image (under 15MB).";
    }

    return NextResponse.json({ success: false, error: userMessage }, { status: 500 });
  }
}
