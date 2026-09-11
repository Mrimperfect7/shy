import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { TryOnRequest } from "@/lib/tryon/types";
import { getCharacterById } from "@/lib/tryon/characters";
import { executeTryOn } from "@/lib/tryon/provider";

export const maxDuration = 30; // 30 seconds max duration

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: TryOnRequest = await req.json();

    if (!body.productId || !body.productImageUrl || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required product details for try-on." },
        { status: 400 }
      );
    }

    if (body.mode === "character" && !body.characterId) {
      return NextResponse.json(
        { success: false, error: "Please select an AI model character." },
        { status: 400 }
      );
    }

    if (body.mode === "self" && !body.userImageBase64) {
      return NextResponse.json(
        { success: false, error: "Please upload or capture a photo first." },
        { status: 400 }
      );
    }

    // 1. Resolve Base Image (Model portrait or User selfie)
    let baseImageBuffer: Buffer;
    let originalDisplayUrl = "";

    if (body.mode === "character" && body.characterId) {
      const character = getCharacterById(body.characterId);
      if (!character) {
        return NextResponse.json(
          { success: false, error: "Selected character model not found." },
          { status: 404 }
        );
      }
      originalDisplayUrl = character.fullImageUrl;

      // Read model from local public folder
      const modelRelativePath = character.fullImageUrl.replace(/^\//, "");
      const modelFilePath = path.join(process.cwd(), "public", modelRelativePath);
      try {
        baseImageBuffer = await fs.readFile(modelFilePath);
      } catch {
        // Fallback fetch if running on remote server without local disk access
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const res = await fetch(`${siteUrl}${character.fullImageUrl}`);
        baseImageBuffer = Buffer.from(await res.arrayBuffer());
      }
    } else {
      // User-uploaded selfie: Decode base64 ephemeral buffer (never saved to disk)
      originalDisplayUrl = body.userImageBase64!;
      const match = body.userImageBase64!.match(/^data:image\/[a-zA-Z0-9+]+;base64,(.+)$/);
      const rawBase64 = match ? match[1] : body.userImageBase64!;
      baseImageBuffer = Buffer.from(rawBase64, "base64");

      // Validate size constraint (max 12MB)
      if (baseImageBuffer.length > 12 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Uploaded image is too large. Please use a smaller photo." },
          { status: 400 }
        );
      }
    }

    // 2. Resolve Jewelry Product Image
    let jewelryBuffer: Buffer;
    let jewelryUrl = body.productImageUrl;

    // Prioritize transparent, isolated asset for realistic try-on compositing
    if (body.category === "earrings" || jewelryUrl.includes("earring") || jewelryUrl.includes("croissant") || jewelryUrl.includes("hoop")) {
      jewelryUrl = "/assets/tryon/assets/single-hoop-left.png";
    } else if (body.category === "necklaces" || body.category === "chains" || body.category === "pendants" || jewelryUrl.includes("herringbone") || jewelryUrl.includes("necklace") || jewelryUrl.includes("pendant")) {
      jewelryUrl = "/assets/hero/floating-chain.png";
    } else if (body.category === "rings" || jewelryUrl.includes("ring") || jewelryUrl.includes("eternity") || jewelryUrl.includes("band")) {
      jewelryUrl = "/assets/hero/floating-rings.png";
    }

    if (jewelryUrl.startsWith("/")) {
      const localJewelryPath = path.join(process.cwd(), "public", jewelryUrl.replace(/^\//, ""));
      try {
        jewelryBuffer = await fs.readFile(localJewelryPath);
      } catch {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const res = await fetch(`${siteUrl}${jewelryUrl}`);
        jewelryBuffer = Buffer.from(await res.arrayBuffer());
      }
    } else if (jewelryUrl.startsWith("http")) {
      const res = await fetch(jewelryUrl);
      if (!res.ok) {
        throw new Error("Unable to retrieve product image from catalog.");
      }
      jewelryBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      throw new Error("Invalid product image source.");
    }

    // 3. Execute AI Try-On Generation (with Provider / CV fallback)
    const { buffer: resultBuffer, provider } = await executeTryOn(body, baseImageBuffer, jewelryBuffer);

    const resultBase64 = `data:image/jpeg;base64,${resultBuffer.toString("base64")}`;
    const processingTimeMs = Date.now() - startTime;

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

    // Customer-friendly error masking
    let userMessage = "Try-On is temporarily unavailable. Please try again with a clear photo.";
    if (error.message && error.message.includes("Invalid product image")) {
      userMessage = "Product image could not be loaded for try-on.";
    }

    return NextResponse.json(
      { success: false, error: userMessage },
      { status: 500 }
    );
  }
}
