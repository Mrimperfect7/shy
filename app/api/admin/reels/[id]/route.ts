import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const reel = await prisma.instagramReel.update({
      where: { id },
      data: {
        ...(body.instagramUrl && { instagramUrl: body.instagramUrl }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
        ...(body.displayOrder !== undefined && { displayOrder: parseInt(body.displayOrder) }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      },
    });
    return NextResponse.json({ reel });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to update reel" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.instagramReel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to delete reel" }, { status: 500 });
  }
}
