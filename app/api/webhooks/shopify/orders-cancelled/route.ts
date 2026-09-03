import { NextResponse } from "next/server";
import { processOrderCancelled, verifyShopifyWebhook } from "@/services/webhookService";
import type { ShopifyWebhookOrder } from "@/lib/shopify/types";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") || "";
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";

  if (!verifyShopifyWebhook(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const order: ShopifyWebhookOrder = JSON.parse(rawBody);
    await processOrderCancelled(order);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("orders/cancelled webhook error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
