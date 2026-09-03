/**
 * Admin Notification Dispatcher
 * Sends instant alerts to the store administrator via WhatsApp / Webhooks.
 */

export interface TransactionVerificationAlertData {
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  totalAmount: number;
  transactionId: string;
  paymentMethod?: string;
  verificationStatus: "MANUAL_REVIEW" | "SUCCESS" | "FAILED";
}

export async function notifyAdminTransactionVerification(data: TransactionVerificationAlertData) {
  try {
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER || "+919048995577";
    const apiKey = process.env.TEXTMEBOT_API_KEY || process.env.CALLMEBOT_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esharanatural.com";

    const isVerified = data.verificationStatus === "SUCCESS";
    const statusIcon = isVerified ? "✅ VERIFIED & CONFIRMED" : "⏳ AWAITING ADMIN UTR REVIEW";

    const message = [
      `🚨 *NEW UPI TRANSACTION SUBMITTED* 🚨`,
      ``,
      `*Order #:* ${data.orderNumber}`,
      `*Customer:* ${data.customerName}`,
      `*Phone:* ${data.customerPhone || "N/A"}`,
      `*Total Amount:* ₹${data.totalAmount}`,
      `*Claimed UPI UTR:* ${data.transactionId}`,
      `*Status:* ${statusIcon}`,
      ``,
      `👉 *Verify in Admin Panel:*`,
      `${siteUrl}/admin/orders?q=${encodeURIComponent(data.transactionId)}`,
    ].join("\n");

    console.log("[Admin Notification] New Transaction ID Submitted for Verification:\n", message);

    if (adminNumber && apiKey) {
      const encodedMsg = encodeURIComponent(message);
      const url = `http://api.textmebot.com/send.php?recipient=${adminNumber}&apikey=${apiKey}&text=${encodedMsg}`;
      
      // Fire-and-forget background fetch so checkout is never delayed
      fetch(url).catch((err) => {
        console.error("[notifyAdminTransactionVerification] Failed to send WhatsApp notification:", err);
      });
    }

    // Support optional custom admin webhook (e.g. Discord, Slack, Telegram or custom endpoint)
    const adminWebhookUrl = process.env.ADMIN_NOTIFICATION_WEBHOOK_URL;
    if (adminWebhookUrl) {
      fetch(adminWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRANSACTION_VERIFICATION",
          ...data,
          message,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.error("[notifyAdminTransactionVerification] Webhook notification failed:", err);
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("[notifyAdminTransactionVerification] Error:", error);
    return { success: false, error: error.message };
  }
}
