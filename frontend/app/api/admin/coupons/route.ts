import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/services/couponService";

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await getCoupons();
    return NextResponse.json({ coupons });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { code, influencerId, discountType, discountValue, minimumOrderValue, maximumDiscount, expiryDate, usageLimit } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate discount type
    if (!["PERCENTAGE", "FIXED_AMOUNT"].includes(discountType)) {
      return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
    }

    const coupon = await createCoupon({
      code,
      influencerId: influencerId || undefined,
      discountType,
      discountValue: parseFloat(discountValue),
      minimumOrderValue: minimumOrderValue ? parseFloat(minimumOrderValue) : undefined,
      maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.code === "P2002") return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
