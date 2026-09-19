import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { order } = await request.json(); // array of { id, displayOrder }
    if (!Array.isArray(order)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    await prisma.$transaction(
      order.map(({ id, displayOrder }: { id: string; displayOrder: number }) =>
        prisma.instagramReel.update({ where: { id }, data: { displayOrder } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to reorder reels" }, { status: 500 });
  }
}
