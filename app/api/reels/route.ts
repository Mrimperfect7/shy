import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 60; // 60-second cache

export async function GET() {
  try {
    // Fetch settings and published reels
    const [reels, settings] = await Promise.all([
      prisma.instagramReel.findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          instagramUrl: true,
          instagramMediaId: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          displayOrder: true,
          isFeatured: true,
        },
      }),
      prisma.instagramSettings.findUnique({ where: { id: "singleton" } }),
    ]);

    return NextResponse.json(
      {
        reels,
        settings: settings || {
          sectionHeading: "THE ESHARA RITUAL",
          sectionSubtitle: "Real rituals. Real stories. From our community.",
          instagramUrl: "https://www.instagram.com/eshara_natural/",
          instagramHandle: "@eshara_natural",
          reelsSectionEnabled: true,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (err) {
    // Gracefully handle DB not configured
    return NextResponse.json(
      { reels: [], settings: null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10",
        },
      }
    );
  }
}
