import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const body = await request.json();
    const resolvedParams = await params;
    
    // Validate that id is provided
    if (!resolvedParams.id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const { imageUrl, description, displayOrder, isPublished } = body;

    const data: any = {};
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (description !== undefined) data.description = description;
    if (displayOrder !== undefined) data.displayOrder = parseInt(displayOrder);
    if (isPublished !== undefined) data.isPublished = isPublished;

    const result = await prisma.customerResult.update({
      where: { id: resolvedParams.id },
      data,
    });

    return NextResponse.json({ result });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Failed to update result:", err);
    return NextResponse.json({ error: "Failed to update customer result" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const resolvedParams = await params;
    
    if (!resolvedParams.id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    // Get the result to find the image URL
    const result = await prisma.customerResult.findUnique({
      where: { id: resolvedParams.id },
    });

    if (result?.imageUrl) {
      // Try to delete from Vercel Blob storage
      try {
        await del(result.imageUrl);
      } catch (blobErr) {
        console.error("Failed to delete from blob storage:", blobErr);
      }
    }

    await prisma.customerResult.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to delete customer result" }, { status: 500 });
  }
}

