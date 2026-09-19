import { NextResponse } from "next/server";
import { createCart, getCart } from "@/lib/shopify/cart";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId");
  if (!cartId) return NextResponse.json({ cart: null });
  const cart = await getCart(cartId);
  return NextResponse.json({ cart });
}

export async function POST(request: Request) {
  try {
    const { lines = [], discountCodes = [] } = await request.json();
    const cart = await createCart(lines, discountCodes);
    return NextResponse.json({ cart });
  } catch (err) {
    console.error("Create cart error:", err);
    return NextResponse.json({ error: "Failed to create cart" }, { status: 500 });
  }
}
