import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

// Validate Instagram Reel URL
function validateReelUrl(url: string): { valid: boolean; mediaId?: string } {
  const patterns = [
    /^https?:\/\/(www\.)?instagram\.com\/reel\/([A-Za-z0-9_-]+)\/?/,
    /^https?:\/\/(www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)\/?/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return { valid: true, mediaId: match[2] };
  }
  return { valid: false };
}

function normalizeReelUrl(url: string): string {
  const match = url.match(/instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/);
  if (!match) return url;
  return `https://www.instagram.com/reel/${match[2]}/`;
}

export async function GET() {
  try {
    await requireAdmin();
    const reels = await prisma.instagramReel.findMany({
      orderBy: { displayOrder: "asc" },
    });
    const settings = await prisma.instagramSettings.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ reels, settings });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to fetch reels" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { instagramUrl, title, description, thumbnailUrl, displayOrder, isPublished, isFeatured } = body;

    if (!instagramUrl) {
      return NextResponse.json({ error: "Instagram Reel URL is required" }, { status: 400 });
    }

    const validation = validateReelUrl(instagramUrl);
    if (!validation.valid) {
      return NextResponse.json({ error: "Please enter a valid Instagram Reel URL." }, { status: 400 });
    }

    const normalized = normalizeReelUrl(instagramUrl);

    // Get max order if not specified
    let order = displayOrder;
    if (order === undefined || order === null) {
      const maxReel = await prisma.instagramReel.findFirst({ orderBy: { displayOrder: "desc" } });
      order = (maxReel?.displayOrder ?? 0) + 1;
    }

    const reel = await prisma.instagramReel.create({
      data: {
        instagramUrl: normalized,
        instagramMediaId: validation.mediaId,
        title: title || null,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        displayOrder: parseInt(order) || 0,
        isPublished: isPublished ?? false,
        isFeatured: isFeatured ?? false,
      },
    });

    return NextResponse.json({ reel }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to create reel" }, { status: 500 });
  }
}
