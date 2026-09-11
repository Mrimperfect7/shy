export type JewelryCategory =
  | "earrings"
  | "necklaces"
  | "rings"
  | "bracelets"
  | "pendants"
  | "chains"
  | "nose_pins"
  | "sets"
  | "other";

export type MetalTone = "yellow_gold" | "rose_gold" | "silver" | "white_gold";

export interface TryOnProduct {
  id: string;
  title: string;
  handle: string;
  price: number;
  imageUrl: string;
  category: JewelryCategory;
  material?: string;
  metalTone?: MetalTone;
  dimensions?: string;
}

export interface CharacterLandmarks {
  leftEar?: { x: number; y: number; scale: number; rotation: number };
  rightEar?: { x: number; y: number; scale: number; rotation: number };
  neck?: { x: number; y: number; scale: number; rotation: number };
  chest?: { x: number; y: number; scale: number; rotation: number };
  finger?: { x: number; y: number; scale: number; rotation: number };
  wrist?: { x: number; y: number; scale: number; rotation: number };
  nose?: { x: number; y: number; scale: number; rotation: number };
}

export interface AICharacter {
  id: string;
  name: string;
  gender: "female" | "male" | "unisex";
  skinTone: "Fair Porcelain" | "Warm Wheatish" | "Golden Dusky" | "Deep Bronze" | "Rich Cocoa" | "Warm Olive";
  faceShape: "Oval" | "Heart" | "Round" | "Angular";
  hairStyle: string;
  previewUrl: string;
  fullImageUrl: string;
  recommendedFor: JewelryCategory[];
  landmarks: CharacterLandmarks;
}

export type TryOnMode = "character" | "self";

export interface TryOnAdjustment {
  offsetX?: number; // normalized horizontal offset (-0.5 to 0.5)
  offsetY?: number; // normalized vertical offset (-0.5 to 0.5)
  scaleMultiplier?: number; // scale multiplier e.g. 0.6 to 1.6
  rotationDelta?: number; // rotation in degrees
  earVisibility?: "both" | "left_only" | "right_only";
}

export interface TryOnRequest {
  productId: string;
  productTitle: string;
  productImageUrl: string;
  category: JewelryCategory;
  metalTone?: MetalTone;
  mode: TryOnMode;
  characterId?: string;
  userImageBase64?: string; // compressed data URL from upload or camera
  adjustment?: TryOnAdjustment;
}

export interface TryOnResult {
  success: boolean;
  resultImageUrl: string;
  originalImageUrl: string;
  category: JewelryCategory;
  processingTimeMs: number;
  provider: "ai_provider" | "cv_engine";
  error?: string;
}

export type TryOnAnalyticsEvent =
  | "try_on_opened"
  | "ai_character_selected"
  | "self_image_selected"
  | "image_uploaded"
  | "camera_captured"
  | "try_on_generation_started"
  | "try_on_generation_completed"
  | "try_on_generation_failed"
  | "try_on_shared"
  | "add_to_cart_after_tryon"
  | "try_another_product";

export function inferJewelryCategory(input: string = ""): JewelryCategory {
  const s = input.toLowerCase();
  if (s.includes("earring") || s.includes("hoop") || s.includes("huggie") || s.includes("stud")) {
    return "earrings";
  }
  if (s.includes("necklace") || s.includes("chain") || s.includes("herringbone") || s.includes("choker")) {
    return "necklaces";
  }
  if (s.includes("pendant") || s.includes("lock")) {
    return "pendants";
  }
  if (s.includes("ring") || s.includes("band") || s.includes("solitaire")) {
    return "rings";
  }
  if (s.includes("bracelet") || s.includes("bangle") || s.includes("cuff") || s.includes("wrist")) {
    return "bracelets";
  }
  if (s.includes("nose") || s.includes("nath")) {
    return "nose_pins";
  }
  if (s.includes("set") || s.includes("gift")) {
    return "sets";
  }
  return "necklaces";
}

