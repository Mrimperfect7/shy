import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { notifyAdminTransactionVerification } from "@/lib/notifications/admin-notify";
import { sendTelegramOrderAlert } from "@/lib/notifications/telegram";
import { recordOrderAttributionAndCommission } from "@/lib/attribution";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Razorpay Webhook] Missing RAZORPAY_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 });
    }

    if (!webhookSignature) {
      console.error("[Razorpay Webhook] Missing signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      console.error("[Razorpay Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`[Razorpay Webhook Received]: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const paymentId = paymentEntity?.id;
      const orderReceipt = orderEntity?.receipt || paymentEntity?.notes?.orderNumber;

      if (orderReceipt) {
        const order = await prisma.order.findUnique({
          where: { orderNumber: orderReceipt },
          include: {
            orderItems: {
              include: { product: true }
            }
          }
        });

        if (order && order.status !== "PAID") {
          await prisma.$transaction([
            prisma.order.update({
              where: { orderNumber: orderReceipt },
              data: {
                status: "PAID",
                paymentId: paymentId || order.paymentId,
              },
            }),
            prisma.paymentAttempt.create({
              data: {
                orderId: order.id,
                amount: order.totalAmount,
                currency: "INR",
                method: "RAZORPAY",
                status: "PAID",
                paymentReference: paymentId || "WEBHOOK_CAPTURED",
                verifiedAt: new Date(),
              },
            }),
          ]);

          // Credit influencer commission and update dashboard metrics
          await recordOrderAttributionAndCommission(orderReceipt);

          const rawAddress: any = order.shippingAddress || {};

          // Trigger Telegram Push Alert
          sendTelegramOrderAlert({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            totalAmount: order.totalAmount,
            paymentMethod: "Razorpay",
            paymentId: paymentId || order.paymentId,
            couponCode: rawAddress?.couponCode,
            discountAmount: Number(rawAddress?.discountAmount || 0),
            address: {
              street: rawAddress?.address,
              city: rawAddress?.city,
              state: rawAddress?.state,
              pinCode: rawAddress?.pinCode,
            },
            items: order.orderItems.map(item => ({
              title: item.product?.title || "SHYN.ISH Jewellery Item",
              quantity: item.quantity,
              price: item.price
            }))
          }).catch(err => console.error("[Webhook] Telegram Alert failed:", err));

          await notifyAdminTransactionVerification({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            totalAmount: order.totalAmount,
            transactionId: paymentId || "RAZORPAY_CAPTURED",
            paymentMethod: "RAZORPAY",
            verificationStatus: "SUCCESS",
          });
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderReceipt = paymentEntity?.notes?.orderNumber;
      
      if (orderReceipt) {
        const order = await prisma.order.findUnique({
          where: { orderNumber: orderReceipt },
        });

        if (order && order.status === "PENDING") {
          await prisma.order.update({
            where: { orderNumber: orderReceipt },
            data: { status: "FAILED" },
          });
          
          await prisma.paymentAttempt.create({
            data: {
              orderId: order.id,
              amount: order.totalAmount,
              currency: "INR",
              method: "RAZORPAY",
              status: "FAILED",
              paymentReference: paymentEntity?.id || "WEBHOOK_FAILED",
              verifiedAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("[Razorpay Webhook Error]:", err);
    return NextResponse.json({ error: err.message || "Webhook processing failed" }, { status: 500 });
  }
}
