import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SINGLETON_ID = "singleton";

/* ─── GET /api/admin/offer-settings ─────────────────────────────────── */
export async function GET() {
  try {
    let offer = await prisma.offerSettings.findUnique({
      where: { id: SINGLETON_ID },
    });
    if (!offer) {
      offer = await prisma.offerSettings.create({ data: { id: SINGLETON_ID } });
    }
    return NextResponse.json({ offer });
  } catch (err) {
    console.error("[GET /api/admin/offer-settings]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ─── PUT /api/admin/offer-settings ─────────────────────────────────── */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      label, emoji, title, subtitle, description,
      originalPrice, salePrice, href, cta, countdownHours, items, imageUrl, isActive,
    } = body;

    const data = {
      label, emoji, title, subtitle, description,
      originalPrice: Number(originalPrice),
      salePrice:     Number(salePrice),
      href, cta,
      countdownHours: Number(countdownHours),
      items,
      imageUrl: imageUrl || "/assets/layered-bottle.png",
      isActive: Boolean(isActive),
    };

    // Use findUnique + update/create to avoid upsert prepared-statement conflict
    // with Supabase PgBouncer (error code 42P05).
    const existing = await prisma.offerSettings.findUnique({
      where: { id: SINGLETON_ID },
    });

    const offer = existing
      ? await prisma.offerSettings.update({ where: { id: SINGLETON_ID }, data })
      : await prisma.offerSettings.create({ data: { id: SINGLETON_ID, ...data } });

    const { requireAdmin } = await import("@/lib/auth/session");
    const session = await requireAdmin();
    const { logAdminActivity } = await import("@/lib/admin-logger");
    await logAdminActivity(
      session.email,
      "MODIFY_OFFER",
      `Offer "${title}" was updated.`
    );

    return NextResponse.json({ offer });
  } catch (err) {
    console.error("[PUT /api/admin/offer-settings]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
