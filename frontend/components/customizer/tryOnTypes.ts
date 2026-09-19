// ─── 3D Try-On: shared types & category logic ────────────────────────────────
// Single source of truth for category → body mapping used by the customizer,
// the catalog sidebar and the scene. No AI anywhere in this pipeline.

export type JewelryCategory = "bangle" | "bracelet" | "ring" | "necklace";
export type BodyPart = "wrist" | "finger" | "neck";
export type FingerId = "thumb" | "index" | "middle" | "ring" | "little";
export type CameraView = "wrist" | "ring" | "neck";

export interface TryOnProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string;
  category: string; // raw category slug from the store record
  material?: string | null;
  plating?: string | null;
  tryOnEnabled: boolean;
  model3dUrl?: string | null;
  tryOnBodyPart?: BodyPart | null;
  tryOnConfig?: {
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    finger?: FingerId;
    variant?: string;
    gem?: string | null;
  } | null;
}

export const CATEGORY_TABS: { id: "all" | JewelryCategory; label: string; testId: string }[] = [
  { id: "all", label: "All", testId: "tab-all" },
  { id: "bangle", label: "Bangles", testId: "tab-bangles" },
  { id: "bracelet", label: "Bracelets", testId: "tab-bracelets" },
  { id: "ring", label: "Rings", testId: "tab-rings" },
  { id: "necklace", label: "Necklaces", testId: "tab-necklaces" },
];

const CATEGORY_SETS: Record<JewelryCategory, string[]> = {
  bangle: ["bangle", "bangles", "kada"],
  bracelet: ["bracelet", "bracelets", "bracelets-bangles", "cuff"],
  ring: ["ring", "rings"],
  necklace: ["necklace", "necklaces", "chain", "chains", "pendant", "pendants", "choker", "lariat", "haar", "mangalsutra"],
};

// Resolve any store category slug / product title to one canonical category.
export function normalizeCategory(category?: string | null, title?: string | null): JewelryCategory | null {
  const t = (title || "").toLowerCase();
  // Title keywords win for merged categories like "Bracelets & Bangles".
  if (/\b(kada|bangle|bangles)\b/.test(t)) return "bangle";
  if (/\b(bracelet|bracelets|cuff)\b/.test(t)) return "bracelet";
  if (/\b(ring|rings)\b/.test(t)) return "ring";
  if (/(necklace|pendant|lariat|choker|mangalsutra|\bhaar\b)/.test(t)) return "necklace";
  const c = (category || "").toLowerCase().trim();
  for (const cat of Object.keys(CATEGORY_SETS) as JewelryCategory[]) {
    if (CATEGORY_SETS[cat].includes(c)) return cat;
  }
  if (c.includes("bangle") || c.includes("kada")) return "bangle";
  if (c.includes("bracelet") || c.includes("cuff")) return "bracelet";
  if (c.includes("ring")) return "ring";
  if (/(necklace|chain|pendant|choker)/.test(c)) return "necklace";
  return null;
}

// Category determines the default body part automatically.
export function bodyPartForCategory(cat: JewelryCategory): BodyPart {
  if (cat === "ring") return "finger";
  if (cat === "necklace") return "neck";
  return "wrist"; // bangle + bracelet
}

export function viewForBodyPart(part: BodyPart): CameraView {
  if (part === "finger") return "ring";
  if (part === "neck") return "neck";
  return "wrist";
}

export const FINGERS: { id: FingerId; label: string }[] = [
  { id: "thumb", label: "Thumb" },
  { id: "index", label: "Index" },
  { id: "middle", label: "Middle" },
  { id: "ring", label: "Ring" },
  { id: "little", label: "Little" },
];

export const FINGER_ANCHORS: Record<FingerId, string> = {
  thumb: "thumbAnchor",
  index: "indexFingerAnchor",
  middle: "middleFingerAnchor",
  ring: "ringFingerAnchor",
  little: "littleFingerAnchor",
};

export function anchorForBodyPart(part: BodyPart): string {
  if (part === "neck") return "neckAnchor";
  return "wristAnchor";
}

// ─── Deterministic product hashing (stable procedural variant per product) ───
export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ─── Material inference from the product record ─────────────────────────────
export function metalColor(plating?: string | null, material?: string | null): string {
  const s = `${plating || ""} ${material || ""}`.toLowerCase();
  if (s.includes("rose")) return "#E8A382";
  if (s.includes("platinum") || s.includes("silver") || s.includes("white gold")) return "#E5E9EE";
  if (s.includes("black")) return "#2A2A2E";
  if (s.includes("champagne")) return "#E6C87E";
  return "#D4AF37"; // signature 18K gold
}

export function gemColor(product: TryOnProduct): string | null {
  if (product.tryOnConfig?.gem) return product.tryOnConfig.gem;
  const t = product.title.toLowerCase();
  if (t.includes("ruby")) return "#9B111E";
  if (t.includes("emerald")) return "#046A38";
  if (t.includes("sapphire")) return "#0F52BA";
  if (t.includes("pearl")) return "#F2EAD9";
  if (t.includes("onyx")) return "#1A1A1E";
  if (t.includes("amethyst")) return "#7B5EA7";
  if (t.includes("quartz")) return "#F4C2C2";
  if (t.includes("diamond") || t.includes("solitaire") || t.includes("halo")) return "#FFFFFF";
  return null;
}

export function formatINR(n: number): string {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}
