import { NextResponse } from "next/server";
import { processRefundCreated, verifyShopifyWebhook } from "@/services/webhookService";
import type { ShopifyWebhookOrder } from "@/lib/shopify/types";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") || "";
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";

  if (!verifyShopifyWebhook(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);
    // Shopify sends the refund with order_id; we need to construct minimal order shape
    const refund = { id: payload.id, order_id: payload.order_id };
    const mockOrder = { id: payload.order_id } as ShopifyWebhookOrder;
    await processRefundCreated(refund, mockOrder);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("refunds/create webhook error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
