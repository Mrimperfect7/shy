// ─── JEWELLERY CATEGORIES ─────────────────────────────────────────────────────

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

// ─── METAL TONES ──────────────────────────────────────────────────────────────

export type MetalTone = "yellow_gold" | "rose_gold" | "silver" | "white_gold" | "platinum";

// ─── TRY-ON PRODUCT ───────────────────────────────────────────────────────────

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

// ─── CHARACTER LANDMARKS ──────────────────────────────────────────────────────

export interface CharacterLandmarks {
  leftEar?:  { x: number; y: number; scale: number; rotation: number };
  rightEar?: { x: number; y: number; scale: number; rotation: number };
  neck?:     { x: number; y: number; scale: number; rotation: number };
  chest?:    { x: number; y: number; scale: number; rotation: number }; // For pendants
  finger?:   { x: number; y: number; scale: number; rotation: number };
  wrist?:    { x: number; y: number; scale: number; rotation: number };
  nose?:     { x: number; y: number; scale: number; rotation: number };
}

// ─── AI CHARACTER ─────────────────────────────────────────────────────────────

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

// ─── TRY-ON MODES ─────────────────────────────────────────────────────────────

export type TryOnMode = "character" | "self";

// ─── INTERACTIVE ADJUSTMENT ───────────────────────────────────────────────────

export interface TryOnAdjustment {
  offsetX?: number;          // Normalized horizontal offset (-0.5 to 0.5)
  offsetY?: number;          // Normalized vertical offset (-0.5 to 0.5)
  scaleMultiplier?: number;  // Scale multiplier e.g. 0.6 to 1.6
  rotationDelta?: number;    // Rotation in degrees
  earVisibility?: "both" | "left_only" | "right_only";
}

// ─── TRY-ON REQUEST ───────────────────────────────────────────────────────────

export interface TryOnRequest {
  productId: string;
  productTitle: string;
  productImageUrl: string;  // ALWAYS the actual product image — never overridden
  category: JewelryCategory;
  metalTone?: MetalTone;
  mode: TryOnMode;
  characterId?: string;
  userImageBase64?: string;  // Compressed data URL — ephemeral, never stored
  adjustment?: TryOnAdjustment;
}

// ─── TRY-ON RESULT ────────────────────────────────────────────────────────────

export interface TryOnResult {
  success: boolean;
  resultImageUrl: string;
  originalImageUrl: string;
  category: JewelryCategory;
  processingTimeMs: number;
  provider: "ai_provider" | "cv_engine";
  error?: string;
}

// ─── ANALYTICS EVENTS ─────────────────────────────────────────────────────────

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

// ─── CATEGORY INFERENCE ───────────────────────────────────────────────────────

/**
 * Infers the jewellery category from product title, slug, or category name.
 * Used to determine the try-on placement strategy.
 */
export function inferJewelryCategory(input: string = ""): JewelryCategory {
  const s = input.toLowerCase();

  if (
    s.includes("earring") || s.includes("hoop") || s.includes("huggie") ||
    s.includes("stud") || s.includes("jhumka") || s.includes("jhumki") ||
    s.includes("ear cuff") || s.includes("earcuff") || s.includes("drop earring")
  ) {
    return "earrings";
  }
  if (
    s.includes("necklace") || s.includes("choker") || s.includes("collar")
  ) {
    return "necklaces";
  }
  if (
    s.includes("chain") || s.includes("herringbone") || s.includes("figaro") ||
    s.includes("rope chain") || s.includes("snake chain") || s.includes("box chain")
  ) {
    return "chains";
  }
  if (
    s.includes("pendant") || s.includes("locket") || s.includes("charm")
  ) {
    return "pendants";
  }
  if (
    s.includes("ring") || s.includes("band") || s.includes("solitaire") ||
    s.includes("eternity") || s.includes("stackable")
  ) {
    return "rings";
  }
  if (
    s.includes("bracelet") || s.includes("bangle") || s.includes("cuff") ||
    s.includes("wrist") || s.includes("kada") || s.includes("anklet")
  ) {
    return "bracelets";
  }
  if (
    s.includes("nose") || s.includes("nath") || s.includes("nose pin") ||
    s.includes("nostril")
  ) {
    return "nose_pins";
  }
  if (
    s.includes("set") || s.includes("combo") || s.includes("suite") ||
    s.includes("gift set") || s.includes("jewellery set") || s.includes("jewelry set")
  ) {
    return "sets";
  }

  // Default to necklaces (most common jewellery category)
  return "necklaces";
}
