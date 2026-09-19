import { NextResponse } from "next/server";
import { getProducts } from "@/lib/shopify/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const first = parseInt(searchParams.get("first") || "10");

  if (!q.trim()) {
    return NextResponse.json({ products: [] });
  }

  try {
    const { products } = await getProducts({ first, query: q });
    return NextResponse.json({ products });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ products: [] });
  }
}
