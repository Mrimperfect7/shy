import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const HOST = "genlook-virtual-try-on-api1.p.rapidapi.com";
const BASE_URL = `https://${HOST}/rapidapi`;

export async function GET(req: NextRequest) {
  try {
    if (!RAPIDAPI_KEY) {
      return NextResponse.json(
        { success: false, error: "RAPIDAPI_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const generationId = searchParams.get("id");

    if (!generationId) {
      return NextResponse.json({ success: false, error: "Missing generationId" }, { status: 400 });
    }

    const res = await fetch(`${BASE_URL}/v1/try-on/${generationId}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Genlook Status] Polling failed:", errText);
      return NextResponse.json({ success: false, error: "Failed to fetch status from Genlook" }, { status: 502 });
    }

    const data = await res.json();
    
    // Genlook returns { status: "COMPLETED", resultImageUrl: "..." }
    return NextResponse.json({
      success: true,
      status: data.status,
      resultImageUrl: data.resultImageUrl
    });

  } catch (error: any) {
    console.error("[Genlook Status API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
