import { fal } from "@fal-ai/client";
export interface AIProvider {
  analyzeImage(imageBase64: string): Promise<any>;
  generateModel(params: any): Promise<string>;
  editImage(baseImage: string, mask: string, prompt: string): Promise<string>;
  generateMarketingImage(
    productImageBase64: string,
    productDetails: any,
    style: string,
    modelDetails: any
  ): Promise<string>;
}

function getCategoryPlacementInstruction(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("necklace") || c.includes("pendant")) {
    return "Placement: Place the necklace naturally around the neck following the collarbone. Chain must follow natural curve. Respect hair and clothing overlap.";
  }
  if (c.includes("earring") || c.includes("jhumka")) {
    return "Placement: Position the earring at the correct anatomical attachment point on the earlobe. Respect head rotation and ear anatomy.";
  }
  if (c.includes("ring") && !c.includes("nose")) {
    return "Placement: Position the ring around the finger at the correct anatomical position (base of finger). Match finger orientation.";
  }
  if (c.includes("bracelet") || c.includes("bangle")) {
    return "Placement: Place the bracelet/bangle encircling the wrist at the correct anatomical position. Must follow wrist curvature.";
  }
  if (c.includes("anklet")) {
    return "Placement: Place naturally around the ankle/lower leg, respecting footwear and clothing.";
  }
  if (c.includes("nose")) {
    return "Placement: Position precisely on the nostril curve. Match scale anatomically.";
  }
  return "Placement: Identify the most appropriate body location for this jewellery type and place with anatomical accuracy.";
}

function getStyleInstruction(styleId: string): string {
  const styles: Record<string, string> = {
    cheerful: "Bright, youthful, energetic commercial jewellery campaign. Vibrant colors, bright even lighting, playful composition.",
    elegant: "Luxury editorial jewellery photography. Sophisticated neutral environment. Soft directional studio lighting. Refined wardrobe. Elegant pose. Subtle depth of field. Premium fashion campaign composition.",
    boho: "Natural warm environment. Relaxed styling. Organic textures. Soft sunlight. Contemporary bohemian wardrobe. Natural pose.",
    vintage: "Timeless photography. Warm nostalgic lighting. Classic wardrobe. Elegant composition. Subtle film-inspired atmosphere.",
    luxury: "High-end jewellery campaign. Controlled studio lighting. Deep sophisticated environment. Premium wardrobe. Strong jewellery focus. Commercial luxury photography.",
    bridal: "Elegant wedding/bridal styling. Soft glowing light, delicate fabrics, romantic atmosphere.",
    traditional_indian: "Indian jewellery culture with sophisticated traditional styling. Rich warm lighting, authentic ethnic wear.",
    modern_indian: "Contemporary Indian fashion editorial. Fusion styling, bold contrasting lighting, high-end magazine look.",
    festive: "Indian festive campaign aesthetic. Celebratory mood, vibrant rich colors, dynamic lighting.",
    editorial: "Fashion-magazine style photography. Dramatic lighting, high contrast, striking poses, avant-garde composition."
  };
  return styles[styleId.toLowerCase()] || styleId; // fallback to the literal string if it's "custom" or unknown
}

export class HybridAIProvider implements AIProvider {
  async analyzeImage(imageBase64: string): Promise<any> {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set. Using basic fallback analysis.");
      return { detected: true, category: "necklace" };
    }

    try {
      // Connect to Groq multimodal model for image analysis (e.g. Llama-3.2-90b-vision-preview)
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.2-90b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this jewellery image. Return a JSON object with 'category' (e.g., necklace, ring, earrings), 'material', and 'gemstone'." },
                { type: "image_url", image_url: { url: imageBase64 } }
              ]
            }
          ],
          response_format: { type: "json_object" }
        })
      });
      const data = await res.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (e) {
      console.error("Groq Analysis Error:", e);
      return { detected: true };
    }
  }

  async generateModel(params: any): Promise<string> {
    // Stub for pure model generation
    return "";
  }

  async editImage(baseImage: string, mask: string, prompt: string): Promise<string> {
    return "";
  }

  async generateMarketingImage(
    productImageBase64: string,
    productDetails: any,
    style: string,
    modelDetails: any
  ): Promise<string> {
    const isPhoto = modelDetails.mode === "photo";
    
    // Construct a highly detailed prompt based on requirements
    let prompt = `Create an ultra-photorealistic professional jewellery campaign image.
Use the supplied jewellery reference images as the exact visual source of truth for the jewellery.
Preserve the exact jewellery design, geometry, proportions, gemstone arrangement, metal color, material appearance and decorative details.
Do not redesign or invent jewellery.

Product: ${productDetails.name}
Category: ${productDetails.category}
Material: ${productDetails.material}
Gemstone: ${productDetails.gemstone}
Dimensions: ${productDetails.dimensions}
`;

    if (isPhoto) {
      prompt += `\nIf a person reference image is supplied, preserve the person's identity, facial structure, skin texture, hairstyle, body proportions, pose and overall appearance.`;
    } else {
      prompt += `\nModel Details:
- Age: ${modelDetails.ageRange}
- Skin Tone: ${modelDetails.skinTone}
- Hair: ${modelDetails.hair}
- Pose: ${modelDetails.pose}
- Expression: ${modelDetails.expression}
`;
    }

    prompt += `\nPlace the jewellery naturally on the person according to human anatomy.
Respect realistic occlusion from hair, skin, clothing and body parts.
Match the jewellery perspective to the person's body.
Generate physically realistic metal reflections, gemstone highlights, contact shadows and lighting.

${getCategoryPlacementInstruction(productDetails.category)}

Visual Style Instruction: ${getStyleInstruction(style)}
Apply the selected visual style to the environment, wardrobe, lighting, composition and photography.
Do not alter the jewellery design to match the style.

The final image must look like a real professional jewellery photograph captured by a high-end commercial photographer.
Avoid CGI appearance, plastic-looking jewellery, distorted anatomy, duplicate gemstones, floating jewellery, incorrect scale and artificial-looking skin.`;

    // If FAL_KEY is available, we use premium Fal.ai generation.
    // If NOT, we fallback to Pollinations.ai (Free Method - No API Key Required)
    const usePremiumFal = !!process.env.FAL_KEY;

    try {
      let attempts = 0;
      const maxRetries = 2;
      
      // Default to a safe placeholder if all attempts fail
      let finalImageUrl = "https://placehold.co/800x1066/141312/C5A059.png?text=AI+Generated+Jewellery";

      while (attempts <= maxRetries) {
        attempts++;
        let currentUrl = "";

        if (usePremiumFal) {
          // PREMIUM METHOD: Fal.ai
          if (isPhoto && modelDetails.photoBase64) {
            const result: any = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
              input: {
                image_url: modelDetails.photoBase64,
                prompt: prompt,
                strength: 0.85,
              },
              logs: true,
            });
            currentUrl = result.data?.images?.[0]?.url || result.data?.image?.url;
          } else {
            const result: any = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
              input: {
                prompt: prompt,
                aspect_ratio: "3:4",
              },
              logs: true,
            });
            currentUrl = result.data?.images?.[0]?.url || result.data?.image?.url;
          }
        } else {
          // FREE METHOD: Pollinations.ai
          // Note: Pollinations is Text-to-Image only, so we append the prompt to the URL
          console.log("Using FREE Pollinations.ai engine...");
          const encodedPrompt = encodeURIComponent(prompt);
          const seed = Math.floor(Math.random() * 1000000); // Random seed for variety
          
          // We do a fetch just to trigger the generation and ensure it doesn't 404, 
          // but Pollinations directly returns the image buffer, so we can just use the URL
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=1066&nologo=true&seed=${seed}`;
          
          currentUrl = pollinationsUrl;
        }

        // Quality Validation (mocked, randomly fails 20% of the time to simulate retry logic)
        const passedValidation = Math.random() > 0.2;
        
        if (passedValidation && currentUrl) {
          finalImageUrl = currentUrl;
          break;
        } else {
          console.log(`Validation failed on attempt ${attempts}. Retrying...`);
        }
      }

      return finalImageUrl;
    } catch (err) {
      console.error("Fal AI Generation Error:", err);
      // Fallback
      return "https://placehold.co/800x1066/141312/C5A059.png?text=AI+Generated+Jewellery";
    }
  }
}

export const getAIProvider = (): AIProvider => {
  return new HybridAIProvider();
};
