import { NextRequest, NextResponse } from "next/server";
import { getCharacterById } from "@/lib/tryon/characters";
import fs from "fs";
import path from "path";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const HOST = "genlook-virtual-try-on-api1.p.rapidapi.com";
const BASE_URL = `https://${HOST}/rapidapi`;

export async function POST(req: NextRequest) {
  try {
    if (!RAPIDAPI_KEY) {
      return NextResponse.json(
        { success: false, error: "RAPIDAPI_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { mode, characterId, userImageBase64, productImageUrl, productTitle, category } = body;

    if (!productImageUrl) {
      return NextResponse.json({ success: false, error: "Missing product image" }, { status: 400 });
    }

    let personImageBuffer: Buffer;
    let filename = "image.jpg";

    if (mode === "character") {
      if (!characterId) {
        return NextResponse.json({ success: false, error: "Missing character ID" }, { status: 400 });
      }
      const char = getCharacterById(characterId);
      if (!char) {
        return NextResponse.json({ success: false, error: "Invalid character" }, { status: 400 });
      }
      
      // Read local character image
      const imagePath = path.join(process.cwd(), "public", char.fullImageUrl);
      if (!fs.existsSync(imagePath)) {
        return NextResponse.json({ success: false, error: "Character image not found locally" }, { status: 500 });
      }
      personImageBuffer = fs.readFileSync(imagePath);
      filename = `${characterId}.jpg`;
    } else {
      if (!userImageBase64) {
        return NextResponse.json({ success: false, error: "Missing user image" }, { status: 400 });
      }
      // Extract base64 part
      const b64Data = userImageBase64.replace(/^data:image\/\w+;base64,/, "");
      personImageBuffer = Buffer.from(b64Data, "base64");
      filename = "user-upload.jpg";
    }

    console.log("[Genlook] Uploading person image to Genlook...");
    
    // 1. Upload the image to Genlook
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(personImageBuffer)], { type: "image/jpeg" });
    formData.append("file", blob, filename);
    formData.append("keepForDays", "1"); // Keep for 1 day
    formData.append("crop", "false");
    
    // If you ever implement auth, pass userId here.
    formData.append("externalUserId", "anonymous-user");

    const uploadRes = await fetch(`${BASE_URL}/v1/person/upload`, {
      method: "POST",
      headers: {
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("[Genlook] Person upload failed:", errText);
      
      let errMsg = "Failed to upload person image to Genlook";
      try {
        const errObj = JSON.parse(errText);
        if (errObj.message) errMsg = `Genlook API Error: ${errObj.message}`;
      } catch (e) {
        errMsg = `Genlook API Error: ${errText}`;
      }
      
      return NextResponse.json({ success: false, error: errMsg }, { status: 502 });
    }

    const uploadData = await uploadRes.json();
    const uploadedPersonUrl = uploadData.imageUrl;

    if (!uploadedPersonUrl) {
      return NextResponse.json({ success: false, error: "Genlook did not return an image URL" }, { status: 502 });
    }

    console.log("[Genlook] Person image uploaded successfully:", uploadedPersonUrl);
    console.log("[Genlook] Starting try-on generation...");

    // 2. Create the Try-On Generation Job
    const tryOnPayload = {
      externalUserId: "anonymous-user",
      output: {
        keepForDays: 1,
        watermark: false
      },
      person: {
        image: {
          source: {
            url: uploadedPersonUrl
          }
        }
      },
      products: [
        {
          description: `${category} jewellery - ${productTitle}`,
          externalId: `product-${Date.now()}`,
          images: [
            {
              source: {
                url: productImageUrl
              }
            }
          ],
          title: productTitle || "Jewellery"
        }
      ]
    };

    const generateRes = await fetch(`${BASE_URL}/v1/try-on`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      body: JSON.stringify(tryOnPayload)
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      console.error("[Genlook] Generation failed:", errText);
      
      let errMsg = "Failed to start generation on Genlook";
      try {
        const errObj = JSON.parse(errText);
        if (errObj.message) errMsg = `Genlook API Error: ${errObj.message}`;
      } catch (e) {
        errMsg = `Genlook API Error: ${errText}`;
      }

      return NextResponse.json({ success: false, error: errMsg }, { status: 502 });
    }

    const generateData = await generateRes.json();
    
    return NextResponse.json({
      success: true,
      generationId: generateData.generationId,
      status: generateData.status
    });

  } catch (error: any) {
    console.error("[Genlook Try-On API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
