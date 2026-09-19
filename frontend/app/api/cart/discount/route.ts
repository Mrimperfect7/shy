import { NextResponse } from "next/server";
import { applyDiscountCodes, removeDiscountCodes } from "@/lib/shopify/cart";

export async function POST(request: Request) {
  try {
    const { cartId, discountCodes } = await request.json();
    if (!cartId || !discountCodes) return NextResponse.json({ error: "Missing params" }, { status: 400 });
    const result = await applyDiscountCodes(cartId, discountCodes);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed to apply discount" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { cartId } = await request.json();
    if (!cartId) return NextResponse.json({ error: "Missing cartId" }, { status: 400 });
    const cart = await removeDiscountCodes(cartId);
    return NextResponse.json({ cart });
  } catch (err) {
    return NextResponse.json({ error: "Failed to remove discount" }, { status: 500 });
  }
}
