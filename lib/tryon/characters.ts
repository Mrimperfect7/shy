import { AICharacter, JewelryCategory } from "./types";

export const AI_CHARACTERS: AICharacter[] = [
  {
    id: "char-zara",
    name: "Zara",
    gender: "female",
    skinTone: "Deep Bronze",
    faceShape: "Oval",
    hairStyle: "Elegant Topknot Bun",
    previewUrl: "/assets/tryon/models/model-zara.jpg",
    fullImageUrl: "/assets/tryon/models/model-zara.jpg",
    recommendedFor: ["earrings", "necklaces", "chains", "pendants", "nose_pins"],
    landmarks: {
      leftEar: { x: 0.235, y: 0.585, scale: 0.08, rotation: -2 },
      rightEar: { x: 0.745, y: 0.575, scale: 0.08, rotation: 2 },
      neck: { x: 0.50, y: 0.86, scale: 0.40, rotation: 0 },
      nose: { x: 0.55, y: 0.60, scale: 0.03, rotation: 0 },
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
    recommendedFor: ["earrings", "necklaces", "chains"],
    landmarks: {
      leftEar: { x: 0.33, y: 0.45, scale: 0.08, rotation: -4 },
      neck: { x: 0.48, y: 0.70, scale: 0.40, rotation: 0 },
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
    recommendedFor: ["earrings", "necklaces", "chains", "pendants"],
    landmarks: {
      // In this angle shot, only her right ear (viewer left) is exposed
      leftEar: { x: 0.34, y: 0.47, scale: 0.075, rotation: -4 },
      neck: { x: 0.51, y: 0.76, scale: 0.38, rotation: 0 },
      chest: { x: 0.51, y: 0.84, scale: 0.46, rotation: 0 },
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
      wrist: { x: 0.46, y: 0.88, scale: 0.28, rotation: 8 },
      neck: { x: 0.53, y: 0.90, scale: 0.42, rotation: 0 },
    },
  },
  {
    id: "char-kabir",
    name: "Kabir",
    gender: "male",
    skinTone: "Warm Wheatish",
    faceShape: "Angular",
    hairStyle: "Modern Clean Fade",
    previewUrl: "/assets/tryon/models/model-kabir.jpg",
    fullImageUrl: "/assets/tryon/models/model-kabir.jpg",
    recommendedFor: ["chains", "necklaces", "earrings", "rings"],
    landmarks: {
      leftEar: { x: 0.23, y: 0.40, scale: 0.08, rotation: -4 },
      rightEar: { x: 0.69, y: 0.39, scale: 0.08, rotation: 4 },
      neck: { x: 0.50, y: 0.76, scale: 0.44, rotation: 0 },
      finger: { x: 0.50, y: 0.68, scale: 0.12, rotation: 0 },
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
