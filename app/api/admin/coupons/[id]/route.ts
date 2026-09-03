import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateCoupon, deleteCoupon, getCouponAnalytics } from "@/services/couponService";
import { CouponStatus, DiscountType } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const coupon = await updateCoupon(id, {
      ...body,
      discountValue: body.discountValue !== undefined ? parseFloat(body.discountValue) : undefined,
      minimumOrderValue: body.minimumOrderValue !== undefined ? parseFloat(body.minimumOrderValue) : undefined,
      maximumDiscount: body.maximumDiscount !== undefined ? parseFloat(body.maximumDiscount) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      usageLimit: body.usageLimit !== undefined ? parseInt(body.usageLimit) : undefined,
    });
    return NextResponse.json({ coupon });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteCoupon(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const analytics = await getCouponAnalytics(id);
    return NextResponse.json({ analytics });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
