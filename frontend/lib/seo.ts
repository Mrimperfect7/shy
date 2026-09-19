import prisma from "./prisma";

export async function getSeoMetadata(entityType: string, entityId: string) {
  try {
    const seo = await prisma.seoMetadata.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
    });
    return seo;
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
    return null;
  }
}

export function calculateSeoScore(
  title: string | null | undefined,
  description: string | null | undefined,
  canonicalUrl: string | null | undefined,
  hasImage: boolean = false
): number {
  let score = 0;

  // Title: max 30 points
  if (title) {
    const length = title.length;
    if (length > 30 && length <= 60) score += 30;
    else if (length > 10) score += 15;
  }

  // Description: max 40 points
  if (description) {
    const length = description.length;
    if (length > 100 && length <= 160) score += 40;
    else if (length > 50) score += 20;
  }

  // Canonical: max 15 points
  if (canonicalUrl) {
    score += 15;
  }

  // Image/OG Image: max 15 points
  if (hasImage) {
    score += 15;
  }

  return score;
}
