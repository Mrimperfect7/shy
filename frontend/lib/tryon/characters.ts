import { AICharacter, JewelryCategory } from "./types";

export const AI_CHARACTERS: AICharacter[] = [
  // ─── WOMEN MODELS ──────────────────────────────────────────────────────────
  {
    id: "char-zara",
    name: "Zara",
    gender: "female",
    skinTone: "Deep Bronze",
    faceShape: "Oval",
    hairStyle: "Elegant Topknot Bun",
    previewUrl: "/assets/tryon/models/model-zara.jpg",
    fullImageUrl: "/assets/tryon/models/model-zara.jpg",
    recommendedFor: ["earrings", "necklaces", "chains", "pendants", "nose_pins", "sets"],
    landmarks: {
      leftEar:  { x: 0.235, y: 0.585, scale: 0.080, rotation: -2 },
      rightEar: { x: 0.745, y: 0.575, scale: 0.080, rotation:  2 },
      neck:     { x: 0.500, y: 0.860, scale: 0.40, rotation: 0 },
      chest:    { x: 0.500, y: 0.920, scale: 0.44, rotation: 0 },
      nose:     { x: 0.550, y: 0.600, scale: 0.030, rotation: 0 },
    },
  },
  {
    id: "char-neha",
    name: "Neha",
    gender: "female",
    skinTone: "Warm Wheatish",
    faceShape: "Oval",
    hairStyle: "Natural Studio Hair Tucked Behind Ear",
    previewUrl: "/assets/tryon/models/model-neha.jpg",
    fullImageUrl: "/assets/tryon/models/model-neha.jpg",
    recommendedFor: ["earrings", "necklaces", "chains", "pendants", "sets"],
    landmarks: {
      leftEar: { x: 0.33, y: 0.45, scale: 0.080, rotation: -4 },
      neck:    { x: 0.48, y: 0.70, scale: 0.40, rotation: 0 },
      chest:   { x: 0.48, y: 0.80, scale: 0.44, rotation: 0 },
    },
  },
  {
    id: "char-aanya",
    name: "Aanya",
    gender: "female",
    skinTone: "Warm Wheatish",
    faceShape: "Oval",
    hairStyle: "Sleek Pulled-Back (Angle View)",
    previewUrl: "/assets/tryon/models/model-aanya.jpg",
    fullImageUrl: "/assets/tryon/models/model-aanya.jpg",
    recommendedFor: ["earrings", "necklaces", "chains", "pendants", "sets"],
    landmarks: {
      // 3/4 angle — only left ear (viewer's right) exposed
      leftEar: { x: 0.340, y: 0.470, scale: 0.075, rotation: -4 },
      neck:    { x: 0.510, y: 0.760, scale: 0.38, rotation: 0 },
      chest:   { x: 0.510, y: 0.840, scale: 0.46, rotation: 0 },
    },
  },
  {
    id: "char-meera",
    name: "Meera",
    gender: "female",
    skinTone: "Golden Dusky",
    faceShape: "Round",
    hairStyle: "Open Wavy Hair",
    previewUrl: "/assets/tryon/models/model-meera.jpg",
    fullImageUrl: "/assets/tryon/models/model-meera.jpg",
    recommendedFor: ["earrings", "necklaces", "pendants", "nose_pins", "sets"],
    landmarks: {
      leftEar:  { x: 0.25, y: 0.52, scale: 0.082, rotation: -3 },
      rightEar: { x: 0.75, y: 0.52, scale: 0.082, rotation:  3 },
      neck:     { x: 0.50, y: 0.80, scale: 0.41, rotation: 0 },
      chest:    { x: 0.50, y: 0.90, scale: 0.45, rotation: 0 },
      nose:     { x: 0.54, y: 0.60, scale: 0.028, rotation: 0 },
    },
  },
  {
    id: "char-priya",
    name: "Priya",
    gender: "female",
    skinTone: "Warm Olive",
    faceShape: "Heart",
    hairStyle: "Loose Side Braid",
    previewUrl: "/assets/tryon/models/model-priya.jpg",
    fullImageUrl: "/assets/tryon/models/model-priya.jpg",
    recommendedFor: ["earrings", "necklaces", "chains", "sets"],
    landmarks: {
      leftEar:  { x: 0.27, y: 0.48, scale: 0.080, rotation: -3 },
      rightEar: { x: 0.73, y: 0.48, scale: 0.080, rotation:  3 },
      neck:     { x: 0.50, y: 0.78, scale: 0.40, rotation: 0 },
      chest:    { x: 0.50, y: 0.88, scale: 0.44, rotation: 0 },
    },
  },
  {
    id: "char-rhea",
    name: "Rhea",
    gender: "female",
    skinTone: "Fair Porcelain",
    faceShape: "Heart",
    hairStyle: "Smooth Lob with Hand Pose",
    previewUrl: "/assets/tryon/models/model-rhea.jpg",
    fullImageUrl: "/assets/tryon/models/model-rhea.jpg",
    recommendedFor: ["rings", "bracelets", "necklaces"],
    landmarks: {
      finger: { x: 0.43, y: 0.60, scale: 0.075, rotation: -18 },
      wrist:  { x: 0.46, y: 0.88, scale: 0.28, rotation: 8 },
      neck:   { x: 0.53, y: 0.90, scale: 0.42, rotation: 0 },
      chest:  { x: 0.53, y: 0.96, scale: 0.46, rotation: 0 },
    },
  },

  // ─── MEN MODELS ────────────────────────────────────────────────────────────
  {
    id: "char-kabir",
    name: "Kabir",
    gender: "male",
    skinTone: "Warm Wheatish",
    faceShape: "Angular",
    hairStyle: "Modern Clean Fade",
    previewUrl: "/assets/tryon/models/model-kabir.jpg",
    fullImageUrl: "/assets/tryon/models/model-kabir.jpg",
    recommendedFor: ["chains", "necklaces", "earrings", "rings", "bracelets"],
    landmarks: {
      leftEar:  { x: 0.23, y: 0.40, scale: 0.080, rotation: -4 },
      rightEar: { x: 0.69, y: 0.39, scale: 0.080, rotation:  4 },
      neck:     { x: 0.50, y: 0.76, scale: 0.44, rotation: 0 },
      chest:    { x: 0.50, y: 0.86, scale: 0.48, rotation: 0 },
      finger:   { x: 0.50, y: 0.68, scale: 0.12, rotation: 0 },
      wrist:    { x: 0.50, y: 0.80, scale: 0.30, rotation: 0 },
    },
  },
];

export function getCharacterById(id: string): AICharacter | undefined {
  return AI_CHARACTERS.find((c) => c.id === id) || AI_CHARACTERS[0];
}

export function getRecommendedCharacters(category: JewelryCategory): AICharacter[] {
  return [...AI_CHARACTERS].sort((a, b) => {
    const aMatch = a.recommendedFor.includes(category) ? 1 : 0;
    const bMatch = b.recommendedFor.includes(category) ? 1 : 0;
    return bMatch - aMatch;
  });
}
