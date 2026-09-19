import catalogJson from "./shynish-products.json";

export type TryOnBodyPart = "wrist" | "finger" | "neck";

export interface TryOnConfig {
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  finger?: "thumb" | "index" | "middle" | "ring" | "little";
  variant?: string;
  gem?: string | null;
}

export interface ShynishProduct {
  id: string;
  title: string;
  slug: string;
  handle: string;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
  imageUrls: string[];
  images: { url: string; altText: string }[];
  category: { id: string; name: string; slug: string };
  material: string;
  plating: string;
  dimensions: string;
  careInstructions: string;
  descriptionHtml: string;
  isJewellery: boolean;
  tryOnEnabled: boolean;
  tryOnBodyPart?: TryOnBodyPart | null;
  model3dUrl?: string | null;
  tryOnConfig?: TryOnConfig | null;
}

export const SHYNISH_CATALOG: ShynishProduct[] = catalogJson as unknown as ShynishProduct[];
