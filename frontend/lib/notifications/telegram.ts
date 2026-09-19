/**
 * Telegram Order Alert Notifier
 * Sends real-time push notifications to your Telegram when any customer places and pays for an order.
 */

export interface TelegramOrderAlertParams {
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  totalAmount: number;
  paymentMethod?: string;
  paymentId?: string | null;
  items: Array<{ title: string; quantity: number; price?: number }>;
  couponCode?: string | null;
  discountAmount?: number | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
}

export async function sendTelegramOrderAlert(data: TelegramOrderAlertParams) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";

    if (!botToken || !chatId) {
      console.warn("[Telegram Notifier] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in environment variables.");
      return { success: false, reason: "NOT_CONFIGURED" };
    }

    const itemsText = data.items.map(item => 
      `• <b>${item.quantity}x ${item.title}</b>${item.price ? ` (₹${item.price})` : ""}`
    ).join("\n");

    const fullAddress = [
      data.address?.street,
      data.address?.city,
      data.address?.state,
      data.address?.pinCode ? `PIN: ${data.address.pinCode}` : null
    ].filter(Boolean).join(", ");

    const lines = [
      `🌿 <b>NEW ORDER RECEIVED &amp; PAID!</b> 🌿`,
      ``,
      `📦 <b>Order Number:</b> <code>${data.orderNumber}</code>`,
      `👤 <b>Customer:</b> ${data.customerName}`,
      `📞 <b>Phone:</b> <code>${data.customerPhone || "N/A"}</code>`,
      `💰 <b>Amount Paid:</b> ₹${data.totalAmount.toLocaleString("en-IN")}`,
      `💳 <b>Payment:</b> ${data.paymentMethod || "Razorpay"}${data.paymentId ? ` (<code>${data.paymentId}</code>)` : ""}`,
    ];

    if (data.couponCode) {
      lines.push(`🎟️ <b>Coupon:</b> <code>${data.couponCode}</code>${data.discountAmount ? ` (-₹${data.discountAmount})` : ""}`);
    }

    if (fullAddress) {
      lines.push(`📍 <b>Delivery Address:</b> ${fullAddress}`);
    }

    lines.push(``);
    lines.push(`🛒 <b>Ordered Items:</b>`);
    lines.push(itemsText || "• 1x Eshara Naturals Herbal Hair Oil (100ml)");
    lines.push(``);
    lines.push(`👉 <a href="${siteUrl}/admin/orders?q=${encodeURIComponent(data.orderNumber)}">Open in Admin Hub</a>`);

    const messageHtml = lines.join("\n");

    const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // Non-blocking fetch with 3-second abort timeout so operations never hang
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageHtml,
        parse_mode: "HTML",
        disable_web_page_preview: true
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Telegram Notifier] Failed to send Telegram alert:", errText);
      return { success: false, error: errText };
    }

    console.log(`[Telegram Notifier] Sent instant order alert for ${data.orderNumber}`);
    return { success: true };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.warn("[Telegram Notifier] Telegram request timed out after 3s.");
    } else {
      console.error("[Telegram Notifier] Error sending Telegram message:", error);
    }
    return { success: false, error: error.message };
  }
}
