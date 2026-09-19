import { NextRequest, NextResponse } from "next/server";
import { isolateJewelryAsset } from "@/lib/tryon/compositor";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Fetch the raw image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Isolate jewelry (remove background and add alpha channel)
    const isolatedBuffer = await isolateJewelryAsset(buffer);

    // Return the transparent PNG image directly
    return new NextResponse(new Uint8Array(isolatedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[Isolate Jewelry API Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
