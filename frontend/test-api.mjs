import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    process.exit(1);
  }

  const dummyB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  
  const payload = {
    instances: [
      {
        prompt: "Ultra-photorealistic luxury jewellery commercial advertisement.",
        image: { bytesBase64Encoded: dummyB64 },
        referenceImages: [
          {
            referenceType: "SUBJECT",
            image: { bytesBase64Encoded: dummyB64 }
          }
        ]
      }
    ],
    parameters: {
      sampleCount: 1,
      outputOptions: { mimeType: "image/jpeg" },
      personGeneration: "ALLOW_ADULT",
      editMode: "INPAINT_INSERTION"
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  }
}

test();
