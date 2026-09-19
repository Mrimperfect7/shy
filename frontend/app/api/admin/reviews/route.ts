import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* ─── GET /api/admin/reviews — list all reviews ──────────────────────── */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || undefined;
  try {
    const reviews = await prisma.review.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true, slug: true } } },
    });
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[GET /api/admin/reviews]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ─── PATCH /api/admin/reviews — approve / reject ────────────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ review });
  } catch (err) {
    console.error("[PATCH /api/admin/reviews]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ─── DELETE /api/admin/reviews — delete ─────────────────────────────── */
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/reviews]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
