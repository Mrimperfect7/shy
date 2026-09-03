import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const results = await prisma.customerResult.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ results });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to fetch customer results" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { imageUrl, description, displayOrder, isPublished } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Get max order if not specified
    let order = displayOrder;
    if (order === undefined || order === null) {
      const maxResult = await prisma.customerResult.findFirst({ orderBy: { displayOrder: "desc" } });
      order = (maxResult?.displayOrder ?? 0) + 1;
    }

    const result = await prisma.customerResult.create({
      data: {
        imageUrl,
        description: description || null,
        displayOrder: parseInt(order) || 0,
        isPublished: isPublished ?? false,
      },
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to create customer result" }, { status: 500 });
  }
}
