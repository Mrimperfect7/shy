import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/studio/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productImageBase64, productDetails, style, modelDetails } = body;

    if (!productImageBase64 || !productDetails || !style || !modelDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const provider = getAIProvider();
    
    // In a real application, you might do quality validation before returning
    const resultImageUrl = await provider.generateMarketingImage(
      productImageBase64,
      productDetails,
      style,
      modelDetails
    );

    return NextResponse.json({ success: true, resultImageUrl });
  } catch (error: any) {
    console.error("Studio Generate Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
