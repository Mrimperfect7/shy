import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/studio/provider";

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }
    
    const provider = getAIProvider();
    const analysis = await provider.analyzeImage(imageBase64);
    
    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Studio Analyze Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
  }
}
