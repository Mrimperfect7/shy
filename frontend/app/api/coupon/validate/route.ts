import { NextResponse } from "next/server";
import { validateCoupon } from "@/services/couponService";
import { headers } from "next/headers";

// Simple rate limiting using in-memory store (use Redis in production)
const attempts = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) {
    attempts.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json({ valid: false, error: "Too many attempts. Please wait." }, { status: 429 });
    }

    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Please enter a coupon code." }, { status: 400 });
    }

    const amount = parseFloat(orderAmount);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json({ valid: false, error: "Invalid order amount." }, { status: 400 });
    }

    const result = await validateCoupon(code, amount);
    
    // Never expose influencerId or internal IDs to client
    return NextResponse.json({
      valid: result.valid,
      error: result.error,
      discountType: result.discountType,
      discountValue: result.discountValue,
      calculatedDiscount: result.calculatedDiscount,
      couponCode: result.couponCode,
    });
  } catch (err) {
    console.error("Coupon validate error:", err);
    return NextResponse.json({ valid: false, error: "That coupon could not be applied." }, { status: 500 });
  }
}
