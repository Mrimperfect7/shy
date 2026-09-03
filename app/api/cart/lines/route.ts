import { NextResponse } from "next/server";
import { addCartLines, updateCartLines, removeCartLines } from "@/lib/shopify/cart";

export async function POST(request: Request) {
  try {
    const { cartId, lines } = await request.json();
    if (!cartId || !lines) return NextResponse.json({ error: "Missing params" }, { status: 400 });
    const cart = await addCartLines(cartId, lines);
    return NextResponse.json({ cart });
  } catch (err) {
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { cartId, lines } = await request.json();
    if (!cartId || !lines) return NextResponse.json({ error: "Missing params" }, { status: 400 });
    const cart = await updateCartLines(cartId, lines);
    return NextResponse.json({ cart });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { cartId, lineIds } = await request.json();
    if (!cartId || !lineIds) return NextResponse.json({ error: "Missing params" }, { status: 400 });
    const cart = await removeCartLines(cartId, lineIds);
    return NextResponse.json({ cart });
  } catch (err) {
    return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
  }
}
