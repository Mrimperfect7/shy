import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ─── GET /api/offer-settings — public, used by ExclusiveOffers ──────── */
export async function GET() {
  try {
    // Use findUnique + create separately to avoid upsert's prepared-statement
    // conflicts with Supabase PgBouncer in transaction mode (code 42P05).
    let offer = await prisma.offerSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!offer) {
      offer = await prisma.offerSettings.create({
        data: { id: "singleton" },
      });
    }

    return NextResponse.json({ offer }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err) {
    console.error("[GET /api/offer-settings]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
