import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const reel = await prisma.instagramReel.findUnique({ where: { id } });
    if (!reel) return NextResponse.json({ error: "Reel not found" }, { status: 404 });

    const updated = await prisma.instagramReel.update({
      where: { id },
      data: { isPublished: !reel.isPublished },
    });
    return NextResponse.json({ reel: updated });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to toggle publish" }, { status: 500 });
  }
}
